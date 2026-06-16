/**
 * scripts/lib/product-truth/usage-resolver.js
 * ─────────────────────────────────────────────────────────────────────────
 * Resolves raw usage report product strings against canonical Product Truth.
 *
 * Matching hierarchy (deterministic, no silent fuzzy auto-merge):
 *   1. Exact canonical product ID
 *   2. Exact barcode match
 *   3. Exact normalized alias match
 *   4. Exact brand + series + shade_key + product_type match
 *   5. Shade punctuation variant (8.3 / 8,3 / 8/3 → same shade key)
 *   6. High-confidence structured match (brand + shade key, single candidate)
 *   7. Suggested match (requires admin review)
 *   8. Unresolved
 *
 * Output per row:
 *   { rawProductName, normalizedName, canonicalProductId, matchMethod,
 *     confidence, reviewStatus, displayProduct }
 *
 * Dependency-free at runtime. Designed for use in:
 *   - netlify/functions/usage-import.js
 *   - build scripts (batch processing)
 */

"use strict";

const { normalizeCatalogRecord, normalizeBrand, normalizeProductLine } = require("./catalog-normalizer");
const { normalizeShade } = require("../product-catalog/normalizer");

// ── Helper: normalize a raw usage string for matching ─────────────────────

function normalizeUsageString(raw) {
  if (!raw) return "";
  return String(raw)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[,\/\-\.]/g, " ")    // unify shade separators
    .replace(/['"()[\]{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ── Index builder ──────────────────────────────────────────────────────────

/**
 * Build in-memory lookup indexes from canonical product artifacts.
 * Call once per process; the result can be cached module-level.
 *
 * @param {Array} canonicalProducts - from product-truth-canonical.json
 * @param {Array} allAliases        - from product-truth-aliases.json
 * @returns {object} indexes
 */
function buildResolutionIndexes(canonicalProducts, allAliases) {
  // Index: canonicalId → product
  const byId = new Map();
  // Index: normalized alias text → [{ canonicalId, aliasType, confidence }]
  const byAlias = new Map();
  // Index: barcode → canonicalId
  const byBarcode = new Map();
  // Index: "brand::series::shadeKey::ptType" → canonicalId
  const byStructuredKey = new Map();
  // Index: "brand::shadeKey" → [canonicalId] (for partial matches)
  const byBrandShade = new Map();

  for (const p of canonicalProducts) {
    byId.set(p.canonicalId, p);

    // Structured key index
    const normBrand = (p.brand || "").toUpperCase();
    const normSeries = (p.series || "").toUpperCase();
    const normShade = (p.shade || "").toUpperCase().replace(/[,\/\-\.]/g, " ").trim();
    const ptType = p.productType || "other";

    const structKey = `${normBrand}::${normSeries}::${normShade}::${ptType}`;
    byStructuredKey.set(structKey, p.canonicalId);

    // Brand + shade index (for fuzzy)
    const brandShadeKey = `${normBrand}::${normShade}`;
    if (!byBrandShade.has(brandShadeKey)) byBrandShade.set(brandShadeKey, []);
    byBrandShade.get(brandShadeKey).push(p.canonicalId);

    // Barcode index
    for (const bc of (p.barcodes || [])) {
      if (bc) byBarcode.set(String(bc), p.canonicalId);
    }

    // Self-alias for the canonical shade
    const shadeLower = normalizeUsageString(p.displayShade || p.shade || "");
    const selfKey = normalizeUsageString(`${p.displayBrand || p.brand} ${p.displaySeries || p.series} ${p.displayShade || p.shade}`);
    if (selfKey) {
      if (!byAlias.has(selfKey)) byAlias.set(selfKey, []);
      byAlias.get(selfKey).push({ canonicalId: p.canonicalId, aliasType: "canonical_display", confidence: "high" });
    }
    const shortKey = normalizeUsageString(`${p.displayBrand || p.brand} ${p.displayShade || p.shade}`);
    if (shortKey && shortKey !== selfKey) {
      if (!byAlias.has(shortKey)) byAlias.set(shortKey, []);
      byAlias.get(shortKey).push({ canonicalId: p.canonicalId, aliasType: "brand_shade_display", confidence: "high" });
    }
    // Add shade-only key (ambiguous, lower confidence)
    if (shadeLower && shadeLower.length >= 2) {
      if (!byAlias.has(shadeLower)) byAlias.set(shadeLower, []);
      byAlias.get(shadeLower).push({ canonicalId: p.canonicalId, aliasType: "shade_only", confidence: "low" });
    }
  }

  // Populate from explicit alias records
  for (const a of (allAliases || [])) {
    const normalized = normalizeUsageString(a.alias || "");
    if (!normalized) continue;
    if (!byAlias.has(normalized)) byAlias.set(normalized, []);
    byAlias.get(normalized).push({
      canonicalId: a.canonicalProductId,
      aliasType: a.aliasType || "alias",
      confidence: a.confidence || "medium",
    });
  }

  return { byId, byAlias, byBarcode, byStructuredKey, byBrandShade };
}

// ── Single-row resolution ──────────────────────────────────────────────────

/**
 * Resolve a single raw product name against the resolution indexes.
 * Returns a resolution result object.
 */
function resolveOneProduct(raw, indexes) {
  const { byId, byAlias, byBarcode, byStructuredKey } = indexes;

  const rawStr = String(raw || "").trim();
  if (!rawStr) {
    return {
      rawProductName: rawStr,
      normalizedName: "",
      canonicalProductId: null,
      matchMethod: "unresolved",
      confidence: "none",
      reviewStatus: "unresolved",
      displayProduct: null,
    };
  }

  const normalized = normalizeUsageString(rawStr);

  // 1. Exact canonical ID match
  if (byId.has(rawStr)) {
    return makeResolution(rawStr, normalized, rawStr, "exact_canonical_id", "high", byId);
  }

  // 2. Barcode match
  if (byBarcode.has(rawStr)) {
    const cid = byBarcode.get(rawStr);
    return makeResolution(rawStr, normalized, cid, "exact_barcode", "high", byId);
  }

  // 3. Exact normalized alias match
  if (byAlias.has(normalized)) {
    const matches = byAlias.get(normalized);
    // Deduplicate and pick highest-confidence canonical match
    const highConf = matches.filter((m) => m.confidence === "high");
    const candidates = highConf.length > 0 ? highConf : matches;
    const unique = [...new Map(candidates.map((m) => [m.canonicalId, m])).values()];
    if (unique.length === 1) {
      return makeResolution(rawStr, normalized, unique[0].canonicalId, `alias:${unique[0].aliasType}`, unique[0].confidence, byId);
    } else if (unique.length > 1) {
      // Multiple matches → suggested
      return {
        rawProductName: rawStr,
        normalizedName: normalized,
        canonicalProductId: null,
        candidates: unique.map((u) => u.canonicalId),
        matchMethod: "multiple_alias_candidates",
        confidence: "medium",
        reviewStatus: "suggested_match",
        displayProduct: null,
        candidateCount: unique.length,
      };
    }
  }

  // 4. Structured key match (brand + series + shade + type)
  if (byStructuredKey.has(normalized.toUpperCase())) {
    const cid = byStructuredKey.get(normalized.toUpperCase());
    return makeResolution(rawStr, normalized, cid, "exact_structured_key", "high", byId);
  }

  // 5. Partial token matching — try to find brand and shade in a single normalized string
  // Split the normalized string into tokens and see if we match brand + shade
  const tokens = normalized.split(/\s+/).filter((t) => t.length >= 1);
  const partialMatches = findPartialMatches(tokens, byAlias, byId);
  if (partialMatches.length === 1) {
    return makeResolution(rawStr, normalized, partialMatches[0].canonicalId, "partial_token_match", "medium", byId);
  } else if (partialMatches.length > 1 && partialMatches.length <= 5) {
    return {
      rawProductName: rawStr,
      normalizedName: normalized,
      canonicalProductId: null,
      candidates: partialMatches.map((m) => m.canonicalId),
      matchMethod: "multiple_partial_matches",
      confidence: "low",
      reviewStatus: "suggested_match",
      displayProduct: null,
      candidateCount: partialMatches.length,
    };
  }

  // Unresolved
  return {
    rawProductName: rawStr,
    normalizedName: normalized,
    canonicalProductId: null,
    matchMethod: "unresolved",
    confidence: "none",
    reviewStatus: "unresolved",
    displayProduct: null,
  };
}

function makeResolution(raw, normalized, canonicalId, method, confidence, byId) {
  const product = byId.get(canonicalId);
  return {
    rawProductName: raw,
    normalizedName: normalized,
    canonicalProductId: canonicalId,
    matchMethod: method,
    confidence,
    reviewStatus: confidence === "high" ? "resolved" : "suggested_match",
    displayProduct: product
      ? {
          brand: product.displayBrand || product.brand,
          series: product.displaySeries || product.series,
          shade: product.displayShade || product.shade,
          productType: product.productType,
          productTypeLabel: product.productTypeLabel,
          validationStatus: product.validationStatus,
          active: product.active,
        }
      : null,
  };
}

function findPartialMatches(tokens, byAlias, byId) {
  // Score each alias entry by how many of its words appear in the token list
  const scores = new Map(); // canonicalId → score
  const tokenSet = new Set(tokens);

  for (const [aliasText, matches] of byAlias.entries()) {
    const aliasTokens = aliasText.split(/\s+/).filter((t) => t.length >= 2);
    if (aliasTokens.length === 0) continue;
    // Count how many alias tokens are in the query token set
    const matchCount = aliasTokens.filter((t) => tokenSet.has(t)).length;
    const coverage = matchCount / aliasTokens.length;
    if (coverage >= 0.7) {
      for (const m of matches) {
        const existing = scores.get(m.canonicalId) || 0;
        scores.set(m.canonicalId, Math.max(existing, coverage));
      }
    }
  }

  // Return only high-scoring matches
  return [...scores.entries()]
    .filter(([, score]) => score >= 0.8)
    .sort((a, b) => b[1] - a[1])
    .map(([cid, score]) => ({ canonicalId: cid, score }));
}

// ── Batch resolution ───────────────────────────────────────────────────────

/**
 * Resolve a full list of raw product strings.
 * Deduplicates first, resolves unique entries, then maps back to all rows.
 *
 * @param {string[]} rawProductNames - raw product strings from usage report
 * @param {Map} indexes              - from buildResolutionIndexes()
 * @param {string} [reportId]        - optional report identifier
 * @returns {object} resolution results with summary stats
 */
function resolveUsageReport(rawProductNames, indexes, reportId = null) {
  const totalUsageRows = rawProductNames.length;

  // Deduplicate raw names
  const uniqueRaw = [...new Set(rawProductNames.filter(Boolean))];
  const resolutionCache = new Map();

  // Resolve each unique name
  for (const raw of uniqueRaw) {
    const result = resolveOneProduct(raw, indexes);
    resolutionCache.set(raw, result);
  }

  // Build per-row resolutions
  const rowResolutions = rawProductNames.map((raw) => {
    if (!raw) {
      return { rawProductName: raw, resolvedStatus: "empty" };
    }
    return resolutionCache.get(raw) || { rawProductName: raw, resolvedStatus: "unresolved" };
  });

  // Aggregate stats
  let resolvedAuto     = 0; // high-confidence match
  let resolvedAlias    = 0; // resolved via alias lookup
  let suggestedMatches = 0; // needs admin review
  let unresolvedCount  = 0;

  const unresolvedItems   = [];
  const usageByCanonicalProduct = {};
  const usageByBrand            = {};
  const usageByProductLine      = {};
  const usageByProductType      = {};

  for (const result of resolutionCache.values()) {
    const method = result.matchMethod || "";
    const status = result.reviewStatus || "";

    if (status === "unresolved" || status === "empty") {
      unresolvedCount++;
      unresolvedItems.push({ rawProductName: result.rawProductName, normalizedName: result.normalizedName });
    } else if (status === "suggested_match") {
      suggestedMatches++;
      unresolvedItems.push({
        rawProductName: result.rawProductName,
        normalizedName: result.normalizedName,
        candidates: result.candidates || [],
        candidateCount: result.candidateCount || 0,
      });
    } else if (method.startsWith("alias:")) {
      resolvedAlias++;
    } else {
      resolvedAuto++;
    }

    // Usage aggregation (only for resolved products)
    if (result.canonicalProductId && result.displayProduct) {
      const dp = result.displayProduct;
      const cid = result.canonicalProductId;

      usageByCanonicalProduct[cid] = usageByCanonicalProduct[cid] || {
        canonicalId: cid,
        brand: dp.brand,
        series: dp.series,
        shade: dp.shade,
        productType: dp.productType,
        count: 0,
      };
      usageByCanonicalProduct[cid].count++;

      const brandKey = dp.brand || "Unknown";
      usageByBrand[brandKey] = (usageByBrand[brandKey] || 0) + 1;

      const lineKey = `${dp.brand} / ${dp.series}`;
      usageByProductLine[lineKey] = (usageByProductLine[lineKey] || 0) + 1;

      const typeKey = dp.productType || "other";
      usageByProductType[typeKey] = (usageByProductType[typeKey] || 0) + 1;
    }
  }

  const resolvedTotal = resolvedAuto + resolvedAlias;
  const uniqueResolved = resolvedTotal + suggestedMatches;
  const resolutionRate = uniqueRaw.length > 0
    ? Math.round((resolvedTotal / uniqueRaw.length) * 100 * 10) / 10
    : 0;

  const topCanonical = Object.values(usageByCanonicalProduct)
    .sort((a, b) => b.count - a.count)
    .slice(0, 50);

  return {
    reportId,
    generatedAt: new Date().toISOString(),
    totalUsageRows,
    uniqueRawProductNames: uniqueRaw.length,
    resolvedUsageRows: resolvedTotal,
    resolvedAuto,
    resolvedAlias,
    suggestedMatches,
    unresolvedUsageRows: unresolvedCount,
    resolutionRate,
    uniqueCanonicalProducts: Object.keys(usageByCanonicalProduct).length,
    usageByCanonicalProduct: topCanonical,
    usageByBrand: Object.entries(usageByBrand).sort((a, b) => b[1] - a[1]).slice(0, 50),
    usageByProductLine: Object.entries(usageByProductLine).sort((a, b) => b[1] - a[1]).slice(0, 50),
    usageByProductType: Object.entries(usageByProductType).sort((a, b) => b[1] - a[1]),
    unresolvedItems: unresolvedItems.slice(0, 500), // cap for response size
    rowResolutions, // full per-row detail
  };
}

// ── File-based entry point (for build scripts) ─────────────────────────────

/**
 * Load canonical artifacts from disk and build indexes.
 * Convenience wrapper for build scripts.
 *
 * @param {string} dataDir - path to src/data/
 * @returns {object} indexes
 */
function buildIndexesFromFiles(dataDir) {
  const path = require("path");
  const fs   = require("fs");

  const readJson = (name) => {
    const full = path.join(dataDir, name);
    if (!fs.existsSync(full)) return [];
    return JSON.parse(fs.readFileSync(full, "utf8"));
  };

  const canonical = readJson("product-truth-canonical.json");
  const aliases   = readJson("product-truth-aliases.json");

  return buildResolutionIndexes(canonical, aliases);
}

module.exports = {
  normalizeUsageString,
  buildResolutionIndexes,
  resolveOneProduct,
  resolveUsageReport,
  buildIndexesFromFiles,
};
