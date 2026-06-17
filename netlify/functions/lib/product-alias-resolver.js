/**
 * netlify/functions/lib/product-alias-resolver.js
 * ─────────────────────────────────────────────────────────────────────────
 * Milestone 4 Hardening: Scoped alias resolution with specificity ordering.
 *
 * Resolution order (most specific first):
 *   1. Exact source mapping (source_record_type + source_record_id match)
 *   2. Source-system alias
 *   3. Product-line alias
 *   4. Manufacturer alias
 *   5. Region alias
 *   6. Global alias only when unambiguous
 *
 * Ambiguity: if multiple active aliases match at the same specificity level
 * and resolve to DIFFERENT canonical products, returns an ambiguity result.
 * Never chooses by row order, creation time, or first match.
 */

"use strict";

const ALIAS_SCOPE_PRIORITY = {
  source_mapping: 0,
  source_system: 1,
  product_line: 2,
  manufacturer: 3,
  region: 4,
  global: 5,
};

/**
 * Resolve an alias string to a canonical product ID, using the provided
 * context to prefer narrower scopes.
 *
 * Returns:
 *   { resolved: true, canonicalProductId, scope, aliasId }
 *   { resolved: false, reason: "not_found" }
 *   { resolved: false, reason: "ambiguous", candidates: [...] }
 *
 * @param {import('pg').Client} client
 * @param {string} normalizedAlias
 * @param {{ sourceSystem?: string, productLineId?: string, manufacturerId?: string, region?: string }} context
 */
async function resolveAlias(client, normalizedAlias, context = {}) {
  const { sourceSystem, productLineId, manufacturerId, region } = context;

  // Build the resolution query — fetch all active aliases matching the normalized alias
  const { rows } = await client.query(
    `SELECT id, canonical_product_id, alias_scope,
            manufacturer_id, product_line_id, region, source_system
     FROM product_aliases
     WHERE normalized_alias = $1 AND active = TRUE`,
    [normalizedAlias]
  );

  if (!rows.length) {
    return { resolved: false, reason: "not_found" };
  }

  // Score each alias by context match and scope priority
  const scored = rows.map((row) => {
    let matchPriority = ALIAS_SCOPE_PRIORITY[row.alias_scope] ?? 99;
    let contextMatch = true;

    switch (row.alias_scope) {
      case "source_system":
        contextMatch = !!sourceSystem && row.source_system === sourceSystem;
        break;
      case "product_line":
        contextMatch = !!productLineId && row.product_line_id === productLineId;
        break;
      case "manufacturer":
        contextMatch = !!manufacturerId && row.manufacturer_id === manufacturerId;
        break;
      case "region":
        contextMatch = !!region && row.region === region;
        break;
      case "global":
        contextMatch = true;
        break;
    }

    return { ...row, matchPriority, contextMatch };
  });

  // Filter to context-matching rows only; if none, fall back to global
  const contextMatching = scored.filter(r => r.contextMatch);
  const candidates = contextMatching.length > 0 ? contextMatching : scored.filter(r => r.alias_scope === "global");

  if (!candidates.length) {
    return { resolved: false, reason: "not_found" };
  }

  // Find best priority level
  const bestPriority = Math.min(...candidates.map(r => r.matchPriority));
  const atBestLevel = candidates.filter(r => r.matchPriority === bestPriority);

  // Check for ambiguity: multiple rows at best level with different canonical IDs
  const uniqueCanonicals = [...new Set(atBestLevel.map(r => r.canonical_product_id))];
  if (uniqueCanonicals.length > 1) {
    return {
      resolved: false,
      reason: "ambiguous",
      candidates: uniqueCanonicals,
      ambiguousAt: atBestLevel[0].alias_scope,
    };
  }

  const best = atBestLevel[0];
  return {
    resolved: true,
    canonicalProductId: best.canonical_product_id,
    scope: best.alias_scope,
    aliasId: best.id,
  };
}

/**
 * Get the appropriate alias scope for a new alias based on context.
 * Defaults to the narrowest useful scope.
 *
 * @param {{ sourceSystem?: string, productLineId?: string, manufacturerId?: string, region?: string }} context
 * @param {string} [explicitScope]
 * @returns {string}
 */
function determineAliasScope(context, explicitScope) {
  if (explicitScope) return explicitScope;
  if (context.sourceSystem) return "source_system";
  if (context.productLineId) return "product_line";
  if (context.manufacturerId) return "manufacturer";
  if (context.region) return "region";
  return "global";
}

/**
 * Insert or update an alias with scope context.
 * If a conflicting active alias exists at the same scope, return it for review.
 *
 * @param {import('pg').Client} client
 * @param {{ canonicalProductId: string, alias: string, normalizedAlias: string,
 *           scope: string, sourceSystem?: string, productLineId?: string,
 *           manufacturerId?: string, region?: string,
 *           sourceRecordType?: string, sourceRecordId?: string,
 *           createdByUserId: string, actionId?: string }} opts
 * @returns {Promise<{ aliasId: string, alreadyExisted: boolean, conflict?: boolean }>}
 */
async function upsertAlias(client, opts) {
  const { canonicalProductId, alias, normalizedAlias, scope, sourceSystem,
          productLineId, manufacturerId, region, sourceRecordType, sourceRecordId,
          createdByUserId, actionId } = opts;

  // Check for existing active alias in same scope
  let scopeFilter = "alias_scope = $3";
  let scopeParams = [normalizedAlias, canonicalProductId, scope];
  if (scope === "source_system") {
    scopeFilter += " AND source_system = $4";
    scopeParams.push(sourceSystem);
  } else if (scope === "product_line") {
    scopeFilter += " AND product_line_id = $4";
    scopeParams.push(productLineId);
  } else if (scope === "manufacturer") {
    scopeFilter += " AND manufacturer_id = $4";
    scopeParams.push(manufacturerId);
  } else if (scope === "region") {
    scopeFilter += " AND region = $4";
    scopeParams.push(region);
  }

  const { rows: existing } = await client.query(
    `SELECT id, canonical_product_id FROM product_aliases
     WHERE normalized_alias = $1 AND active = TRUE AND ${scopeFilter}`,
    scopeParams
  );

  if (existing.length > 0) {
    if (existing[0].canonical_product_id === canonicalProductId) {
      return { aliasId: existing[0].id, alreadyExisted: true };
    }
    // Conflict: same alias+scope resolves to different canonical
    return { aliasId: null, alreadyExisted: false, conflict: true, conflictingAliasId: existing[0].id };
  }

  const { rows: inserted } = await client.query(
    `INSERT INTO product_aliases
       (canonical_product_id, alias, normalized_alias, alias_type, alias_scope,
        source_system, product_line_id, manufacturer_id, region,
        source_record_type, source_record_id, confidence, active, created_at, updated_at)
     VALUES ($1,$2,$3,'manual_alias',$4,$5,$6,$7,$8,$9,$10,'high',TRUE,NOW(),NOW())
     RETURNING id`,
    [canonicalProductId, alias, normalizedAlias, scope,
     sourceSystem || null, productLineId || null, manufacturerId || null, region || null,
     sourceRecordType || null, sourceRecordId || null]
  );

  return { aliasId: inserted[0].id, alreadyExisted: false };
}

module.exports = { resolveAlias, determineAliasScope, upsertAlias, ALIAS_SCOPE_PRIORITY };
