/**
 * netlify/functions/lib/product-merge-blockers.js
 * ─────────────────────────────────────────────────────────────────────────
 * Milestone 4 Hardening: Merge blocker calculation.
 *
 * Blocker categories (from plan section 9):
 *   package_size_conflict, package_count_conflict, unit_conflict,
 *   barcode_conflict, catalog_number_conflict, product_type_conflict,
 *   intended_use_conflict, region_conflict, compatible_system_conflict,
 *   tonal_equivalent_not_duplicate, family_selection_required
 *
 * Non-overrideable blockers:
 *   - tonal_equivalent_not_duplicate: cannot be overridden into a duplicate
 *     merge unless the same commercial SKU is proven.
 *
 * Admin override requires product_database_admin permission, explicit reason,
 * and exact blocker list.
 */

"use strict";

const OVERRIDEABLE_BLOCKERS = new Set([
  "package_size_conflict",
  "package_count_conflict",
  "unit_conflict",
  "barcode_conflict",
  "catalog_number_conflict",
  "product_type_conflict",
  "intended_use_conflict",
  "region_conflict",
  "compatible_system_conflict",
  "family_selection_required",
]);

const NON_OVERRIDEABLE_BLOCKERS = new Set([
  "tonal_equivalent_not_duplicate",
]);

/**
 * Calculate merge blockers for two canonical products.
 *
 * @param {import('pg').Client} client
 * @param {string} survivingId
 * @param {string} mergedId
 * @param {{ survivingProductFamilyId?: string }} opts
 * @returns {Promise<{ actualBlockers: string[], nonOverrideableBlockers: string[], familySelectionRequired: boolean, survivingFamilyId: string|null, mergedFamilyId: string|null }>}
 */
async function calculateMergeBlockers(client, survivingId, mergedId, opts = {}) {
  const { rows: products } = await client.query(
    `SELECT id, primary_product_type, package_size_value, package_size_unit,
            package_count, barcode, catalog_number, intended_use, region,
            compatible_system, evidence_status, product_family_id
     FROM canonical_products WHERE id = ANY($1::text[])`,
    [[survivingId, mergedId]]
  );

  const surviving = products.find(p => p.id === survivingId);
  const merged = products.find(p => p.id === mergedId);

  if (!surviving || !merged) {
    return { actualBlockers: [], nonOverrideableBlockers: [], familySelectionRequired: false,
             survivingFamilyId: null, mergedFamilyId: null };
  }

  const blockers = [];

  // Package size conflict
  if (surviving.package_size_value && merged.package_size_value &&
      (surviving.package_size_value !== merged.package_size_value ||
       surviving.package_size_unit !== merged.package_size_unit)) {
    blockers.push("package_size_conflict");
  }

  // Package count conflict
  if (surviving.package_count && merged.package_count &&
      surviving.package_count !== merged.package_count) {
    blockers.push("package_count_conflict");
  }

  // Unit conflict (if units differ without size conflict)
  if (surviving.package_size_unit && merged.package_size_unit &&
      surviving.package_size_unit !== merged.package_size_unit &&
      !blockers.includes("package_size_conflict")) {
    blockers.push("unit_conflict");
  }

  // Barcode conflict
  if (surviving.barcode && merged.barcode && surviving.barcode !== merged.barcode) {
    blockers.push("barcode_conflict");
  }

  // Catalog number conflict
  if (surviving.catalog_number && merged.catalog_number &&
      surviving.catalog_number !== merged.catalog_number) {
    blockers.push("catalog_number_conflict");
  }

  // Product type conflict
  if (surviving.primary_product_type && merged.primary_product_type &&
      surviving.primary_product_type !== merged.primary_product_type) {
    blockers.push("product_type_conflict");
  }

  // Intended use conflict
  if (surviving.intended_use && merged.intended_use &&
      surviving.intended_use !== merged.intended_use) {
    blockers.push("intended_use_conflict");
  }

  // Region conflict
  if (surviving.region && merged.region && surviving.region !== merged.region) {
    blockers.push("region_conflict");
  }

  // Compatible system conflict
  if (surviving.compatible_system && merged.compatible_system &&
      surviving.compatible_system !== merged.compatible_system) {
    blockers.push("compatible_system_conflict");
  }

  // Tonal equivalent not duplicate (non-overrideable)
  // If both have different shade/tonal values but same family, they are tonally
  // equivalent variants, not duplicates. This check uses evidence_status.
  if (surviving.product_family_id && merged.product_family_id &&
      surviving.product_family_id === merged.product_family_id &&
      surviving.evidence_status === "tonal_equivalent" && merged.evidence_status === "tonal_equivalent") {
    blockers.push("tonal_equivalent_not_duplicate");
  }

  // Family selection required
  const survivingFamilyId = surviving.product_family_id || null;
  const mergedFamilyId = merged.product_family_id || null;
  let familySelectionRequired = false;

  if (survivingFamilyId && mergedFamilyId && survivingFamilyId !== mergedFamilyId) {
    if (!opts.survivingProductFamilyId) {
      blockers.push("family_selection_required");
      familySelectionRequired = true;
    }
  }

  const nonOverrideableBlockers = blockers.filter(b => NON_OVERRIDEABLE_BLOCKERS.has(b));

  return { actualBlockers: blockers, nonOverrideableBlockers, familySelectionRequired,
           survivingFamilyId, mergedFamilyId };
}

/**
 * Validate an admin override request against the calculated blockers.
 *
 * @param {{ actualBlockers: string[], nonOverrideableBlockers: string[] }} blockersResult
 * @param {string[]} requestedOverrideBlockers
 * @param {boolean} hasAdminPermission
 * @param {string|undefined} overrideReason
 * @throws Error if override is not permitted
 */
function validateOverride(blockersResult, requestedOverrideBlockers, hasAdminPermission, overrideReason) {
  if (!requestedOverrideBlockers?.length) return; // No override requested

  if (!hasAdminPermission) {
    const err = new Error("Admin permission (product_database_admin) required to override merge blockers");
    err.statusCode = 403;
    throw err;
  }

  if (!overrideReason) {
    const err = new Error("Override reason is required when overriding merge blockers");
    err.statusCode = 400;
    throw err;
  }

  // Check for non-overrideable blockers
  const nonOverrideableRequested = requestedOverrideBlockers.filter(b =>
    blockersResult.nonOverrideableBlockers.includes(b)
  );
  if (nonOverrideableRequested.length > 0) {
    const err = new Error(
      `Cannot override non-overrideable blockers: ${nonOverrideableRequested.join(", ")}. ` +
      `The tonal_equivalent_not_duplicate blocker requires separate commercial SKU evidence.`
    );
    err.statusCode = 400;
    throw err;
  }

  // Ensure requested overrides are a subset of actual blockers
  const notActualBlockers = requestedOverrideBlockers.filter(b =>
    !blockersResult.actualBlockers.includes(b)
  );
  if (notActualBlockers.length > 0) {
    const err = new Error(
      `Requested override includes blockers not present: ${notActualBlockers.join(", ")}. ` +
      `Actual blockers: ${blockersResult.actualBlockers.join(", ")}`
    );
    err.statusCode = 400;
    throw err;
  }

  // Check for remaining non-overrideable blockers after override
  const remainingNonOverrideable = blockersResult.nonOverrideableBlockers.filter(b =>
    !requestedOverrideBlockers.includes(b)
  );
  if (remainingNonOverrideable.length > 0) {
    const err = new Error(
      `Non-overrideable blockers remain: ${remainingNonOverrideable.join(", ")}`
    );
    err.statusCode = 400;
    throw err;
  }
}

/**
 * Validate the survivingProductFamilyId selection during merge.
 *
 * @param {import('pg').Client} client
 * @param {string} survivingProductFamilyId
 * @param {{ survivingId: string, mergedId: string, survivingFamilyId: string|null, mergedFamilyId: string|null }} context
 * @throws Error if invalid
 */
async function validateFamilySelection(client, survivingProductFamilyId, context) {
  const { survivingId, mergedId, survivingFamilyId, mergedFamilyId } = context;
  const allowedFamilies = [survivingFamilyId, mergedFamilyId].filter(Boolean);

  if (!allowedFamilies.includes(survivingProductFamilyId)) {
    const err = new Error(
      `survivingProductFamilyId must be one of: ${allowedFamilies.join(", ")}. ` +
      `Got: ${survivingProductFamilyId}`
    );
    err.statusCode = 400;
    throw err;
  }

  const { rows } = await client.query(
    `SELECT id, active FROM product_families WHERE id = $1`,
    [survivingProductFamilyId]
  );

  if (!rows.length) {
    const err = new Error(`Product family ${survivingProductFamilyId} not found`);
    err.statusCode = 400;
    throw err;
  }

  if (!rows[0].active) {
    const err = new Error(`Product family ${survivingProductFamilyId} is inactive`);
    err.statusCode = 400;
    throw err;
  }
}

module.exports = {
  calculateMergeBlockers,
  validateOverride,
  validateFamilySelection,
  OVERRIDEABLE_BLOCKERS,
  NON_OVERRIDEABLE_BLOCKERS,
};
