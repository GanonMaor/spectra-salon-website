/**
 * scripts/lib/product-catalog/product-identity.js
 * ---------------------------------------------------------------
 * V1 Product Truth Center — shared identity logic.
 *
 * Handles:
 *   - canonical key creation
 *   - normalized brand / series / shade comparison
 *   - alias grouping (same canonical key → one identity)
 *   - developer / oxidant separation from color shades
 *   - duplicate-risk scoring
 *   - confidence recommendation
 *   - suggested review status and action
 *
 * Rules:
 *   - Developer / oxidant products MUST NEVER be treated as color shades.
 *   - Do not auto-merge dangerous cases.
 *   - Any conflict in product type, barcode, or shade identity → duplicate-risk.
 *
 * Dependency-free. Unit-testable.
 */

"use strict";

const { normalizeBrand, normalizeSeries, normalizeShade } = require("./normalizer");

// ── Product type constants ─────────────────────────────────────────────────

const PRODUCT_TYPES = {
  HAIR_COLOR_SHADE: "hair_color_shade",
  PERMANENT_COLOR: "permanent_color",
  DEMI_PERMANENT: "demi_permanent",
  ACIDIC_TONER: "acidic_toner",
  DIRECT_DYE: "direct_dye",
  DEVELOPER_OXIDANT: "developer_oxidant",
  LIGHTENER_BLEACH: "lightener_bleach",
  BOND_BUILDER: "bond_builder",
  TREATMENT_CARE: "treatment_care",
  MIXER_CORRECTOR: "mixer_corrector",
  OTHER: "other",
};

// Types that are NEVER shade intelligence / color-mix participants.
const EXCLUDE_FROM_SHADE_INTELLIGENCE = new Set([
  PRODUCT_TYPES.DEVELOPER_OXIDANT,
]);

const SHADE_BEARING_PRODUCT_TYPES = new Set([
  PRODUCT_TYPES.HAIR_COLOR_SHADE,
  PRODUCT_TYPES.PERMANENT_COLOR,
  PRODUCT_TYPES.DEMI_PERMANENT,
  PRODUCT_TYPES.ACIDIC_TONER,
  PRODUCT_TYPES.DIRECT_DYE,
  PRODUCT_TYPES.MIXER_CORRECTOR,
]);

function isShadeBearingProductType(productType) {
  return SHADE_BEARING_PRODUCT_TYPES.has(productType);
}

// Types that are "supporting" products — not color, but may appear in formulas.
const SUPPORTING_PRODUCT_TYPES = new Set([
  PRODUCT_TYPES.DEVELOPER_OXIDANT,
  PRODUCT_TYPES.BOND_BUILDER,
  PRODUCT_TYPES.TREATMENT_CARE,
]);

// Review status values.
const REVIEW_STATUS = {
  SUGGESTED_APPROVED: "suggested-approved",
  NEEDS_REVIEW: "needs-review",
  DUPLICATE_RISK: "duplicate-risk",
  SPLIT_REQUIRED: "split-required",
  MISSING_DATA: "missing-data",
};

// Suggested action values.
const SUGGESTED_ACTION = {
  APPROVE: "approve",
  MERGE_ALIASES: "merge-aliases",
  SPLIT_IDENTITY: "split-identity",
  VERIFY_OFFICIAL_SOURCE: "verify-official-source",
  EXCLUDE_FROM_SHADE_INTELLIGENCE: "exclude-from-shade-intelligence",
  NEEDS_RESEARCH: "needs-research",
};

// ── Canonical key ──────────────────────────────────────────────────────────

/**
 * Build a stable canonical identity key from brand + series + shade.
 * Uses the same normalizer helpers as matcher.js for consistency.
 */
function canonicalKey({ brand, series, shade }) {
  const b = normalizeBrand(brand);
  const s = normalizeSeries(series);
  const shadeNorm = normalizeShade(shade);
  const sh = shadeNorm.key || shadeNorm.canonical || "";
  return `${b}::${s}::${sh}`;
}

/**
 * Build a stable canonical ID that includes the product type.
 * Used to differentiate e.g. developer 6% 20Vol. from a color shade.
 */
function canonicalId({ brand, series, shade, productType }) {
  const key = canonicalKey({ brand, series, shade });
  const pt = (productType || PRODUCT_TYPES.OTHER).toLowerCase().replace(/[^a-z0-9]/g, "_");
  return `${key}::${pt}`;
}

// ── Canonical display names ────────────────────────────────────────────────

const CANONICAL_BRAND_DISPLAY = {
  "LOREAL": "L'Oréal Professionnel",
  "L'OREAL PROFESSIONNEL": "L'Oréal Professionnel",
  "L'OREAL PROFESSIONNELS": "L'Oréal Professionnel",
  "SCHWARZKOPF": "Schwarzkopf Professional",
  "WELLA": "Wella Professionals",
  "MATRIX": "Matrix",
  "KEUNE": "Keune",
  "OLAPLEX": "Olaplex",
  "JUL": "JUL Professional",
  "SUBTIL": "Subtil",
  "EUGENE PERMA": "Eugene Perma",
};

const CANONICAL_SERIES_DISPLAY = {
  "NEW INOA": "INOA",
  "INOA": "INOA",
  "MAJIREL": "Majirel",
  "MAJIREL FUNDA": "Majirel",
  "COOL COVER": "Majirel Cool Cover",
  "DIA LIGHT": "Dia Light",
  "DIA COLOR": "Dia Color",
  "DIA RICHESSE": "Dia Richesse",
  "BLOND STUDIO BLEACH": "Blond Studio",
  "INOA DEVELOPERS": "INOA Developers",
  "OXYDANT DEVELOPERS": "Oxydant Developers",
  "DIACTIVATOR": "Diactivator",
};

function displayBrand(rawBrand) {
  const upper = normalizeBrand(rawBrand);
  return CANONICAL_BRAND_DISPLAY[upper] || rawBrand || upper;
}

function displaySeries(rawSeries) {
  const upper = normalizeSeries(rawSeries);
  return CANONICAL_SERIES_DISPLAY[upper] || rawSeries || upper;
}

// ── Duplicate-risk scoring ─────────────────────────────────────────────────

/**
 * Score duplicate risk for a group of raw entries sharing the same canonical key.
 * Returns 0 (no risk) to 1 (high risk).
 *
 * Risk factors:
 *   - Multiple distinct product types in the group.
 *   - Shade string variation with same level/reflect that could be aliases.
 *   - Developer assigned to the same key as a color shade (critical).
 */
function scoreDuplicateRisk(entries) {
  if (!entries || entries.length === 0) return 0;
  if (entries.length === 1) return 0;

  const types = new Set(entries.map((e) => e.productType || PRODUCT_TYPES.OTHER));

  // Critical: a developer shares a key with a non-developer.
  if (
    types.has(PRODUCT_TYPES.DEVELOPER_OXIDANT) &&
    types.size > 1
  ) {
    return 1.0;
  }

  // High: more than 2 different product types in same key group.
  if (types.size > 2) return 0.85;

  // Medium: two compatible types (e.g. lightener + bond builder often co-occur).
  if (types.size === 2) {
    const typeArr = [...types];
    const compatible = (
      typeArr.every((t) =>
        [PRODUCT_TYPES.LIGHTENER_BLEACH, PRODUCT_TYPES.BOND_BUILDER].includes(t),
      )
    );
    if (!compatible) return 0.65;
    return 0.1;
  }

  return 0;
}

// ── Review status + action recommendation ─────────────────────────────────

/**
 * Given one canonical identity group, recommend a review status and action.
 */
function recommendReview({ productType, confidence, duplicateRisk, aliasCount, shade, brand }) {
  // Developers: always excluded from shade intelligence.
  if (productType === PRODUCT_TYPES.DEVELOPER_OXIDANT) {
    return {
      reviewStatus: REVIEW_STATUS.SUGGESTED_APPROVED,
      suggestedAction: SUGGESTED_ACTION.EXCLUDE_FROM_SHADE_INTELLIGENCE,
    };
  }

  // High duplicate risk → needs human review.
  if (duplicateRisk >= 0.8) {
    return {
      reviewStatus: REVIEW_STATUS.DUPLICATE_RISK,
      suggestedAction: SUGGESTED_ACTION.SPLIT_IDENTITY,
    };
  }

  // Multiple aliases found.
  if (aliasCount > 1) {
    return {
      reviewStatus: REVIEW_STATUS.NEEDS_REVIEW,
      suggestedAction: SUGGESTED_ACTION.MERGE_ALIASES,
    };
  }

  // Low confidence and non-developer.
  if (confidence === "low") {
    return {
      reviewStatus: REVIEW_STATUS.NEEDS_REVIEW,
      suggestedAction: SUGGESTED_ACTION.VERIFY_OFFICIAL_SOURCE,
    };
  }

  // Medium confidence on color shades without enough info.
  if (confidence === "medium" && isShadeBearingProductType(productType)) {
    return {
      reviewStatus: REVIEW_STATUS.NEEDS_REVIEW,
      suggestedAction: SUGGESTED_ACTION.VERIFY_OFFICIAL_SOURCE,
    };
  }

  // Missing brand or shade.
  if (!brand || !shade) {
    return {
      reviewStatus: REVIEW_STATUS.MISSING_DATA,
      suggestedAction: SUGGESTED_ACTION.NEEDS_RESEARCH,
    };
  }

  return {
    reviewStatus: REVIEW_STATUS.SUGGESTED_APPROVED,
    suggestedAction: SUGGESTED_ACTION.APPROVE,
  };
}

// ── Alias similarity check ─────────────────────────────────────────────────

/**
 * Check whether two raw shade strings are likely aliases of the same shade.
 * Returns true when the normalized keys match.
 */
function areSameShade(shadeA, shadeB) {
  if (!shadeA || !shadeB) return false;
  const a = normalizeShade(shadeA).key || normalizeShade(shadeA).canonical;
  const b = normalizeShade(shadeB).key || normalizeShade(shadeB).canonical;
  return a === b && !!a;
}

// ── Group inventory entries into canonical identities ─────────────────────

/**
 * Given an array of raw inventory/shade-map entries, group them into
 * canonical product identities.
 *
 * Each group collects:
 *   - All raw entries sharing the same canonical key.
 *   - Merged usage totals.
 *   - Alias list.
 *   - Duplicate-risk score.
 *   - Recommended review status + action.
 *
 * @param {Array<object>} entries - Array of shade-map entries.
 * @returns {Array<TruthIdentity>} - Sorted by usage count desc.
 */
function groupIntoIdentities(entries) {
  const groups = new Map();

  for (const entry of entries) {
    const key = canonicalKey({
      brand: entry.brand,
      series: entry.series,
      shade: entry.shade,
    });
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(entry);
  }

  const identities = [];

  for (const [key, group] of groups) {
    const primary = group[0];
    const allShades = [...new Set(group.map((e) => e.shade))];
    const allSeries = [...new Set(group.map((e) => e.series))];
    const allBrands = [...new Set(group.map((e) => e.brand))];
    const allTypes = [...new Set(group.map((e) => e.productType || PRODUCT_TYPES.OTHER))];

    // Dominant product type by usage.
    const typeByRows = {};
    for (const e of group) {
      const t = e.productType || PRODUCT_TYPES.OTHER;
      typeByRows[t] = (typeByRows[t] || 0) + (e.rows || 0);
    }
    const dominantType = Object.entries(typeByRows).sort((a, b) => b[1] - a[1])[0]?.[0] || PRODUCT_TYPES.OTHER;

    // Merged usage totals.
    const totalRows = group.reduce((s, e) => s + (e.rows || 0), 0);
    const totalGrams = group.reduce((s, e) => s + (e.grams || 0), 0);
    const totalCost = group.reduce((s, e) => s + (e.cost || 0), 0);
    const totalCustomers = Math.max(...group.map((e) => e.customers || 0));

    // Merge top services.
    const serviceTotals = new Map();
    for (const e of group) {
      for (const svc of (e.topServices || [])) {
        serviceTotals.set(svc.name, (serviceTotals.get(svc.name) || 0) + svc.value);
      }
    }
    const topServices = [...serviceTotals.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Confidence: use the worst confidence in the group.
    const confidenceRank = { high: 3, medium: 2, low: 1 };
    const worstConf = group
      .map((e) => e.confidence || "medium")
      .sort((a, b) => (confidenceRank[a] || 1) - (confidenceRank[b] || 1))[0] || "medium";

    // Duplicate risk.
    const duplicateRisk = scoreDuplicateRisk(group);

    // Whether this identity belongs to shade intelligence.
    const inShadeIntelligence = !EXCLUDE_FROM_SHADE_INTELLIGENCE.has(dominantType);

    // Shade decode fields from primary entry.
    const shadeDecoding = isShadeBearingProductType(dominantType) ? {
      level: primary.level ?? null,
      levelName: primary.levelName ?? null,
      colorFamily: primary.colorFamily ?? null,
      colorLine: primary.colorLine ?? null,
      colorTechnology: primary.colorTechnology ?? null,
      shadeSystem: primary.shadeSystem ?? null,
      meaning: primary.meaning ?? null,
      reflects: primary.reflects ?? null,
    } : {
      colorLine: primary.colorLine ?? null,
      colorTechnology: primary.colorTechnology ?? null,
      meaning: primary.meaning ?? (primary.productTypeLabel ?? null),
    };

    const { reviewStatus, suggestedAction } = recommendReview({
      productType: dominantType,
      confidence: worstConf,
      duplicateRisk,
      aliasCount: allShades.length,
      shade: primary.shade,
      brand: primary.brand,
    });

    const identity = {
      canonicalId: canonicalId({
        brand: primary.brand,
        series: primary.series,
        shade: primary.shade,
        productType: dominantType,
      }),
      canonicalKey: key,
      canonicalBrand: displayBrand(primary.brand),
      canonicalSeries: displaySeries(primary.series),
      canonicalShade: normalizeShade(primary.shade).canonical || primary.shade,
      rawBrand: primary.brand,
      rawSeries: primary.series,
      rawShade: primary.shade,
      productType: dominantType,
      productTypeLabel: primary.productTypeLabel || dominantType,
      allProductTypes: allTypes,
      shadeBearing: isShadeBearingProductType(dominantType),
      tonalClassificationEligible: isShadeBearingProductType(dominantType),
      inShadeIntelligence,
      isDevOxidant: dominantType === PRODUCT_TYPES.DEVELOPER_OXIDANT,
      isSupportingProduct: SUPPORTING_PRODUCT_TYPES.has(dominantType),
      usageEvidence: {
        usageCount: totalRows,
        totalGrams: Math.round(totalGrams),
        totalCost: Math.round(totalCost * 100) / 100,
        uniqueSalons: totalCustomers,
        topServices,
      },
      shadeDecoding,
      aliases: allShades.filter((s) => s !== primary.shade),
      rawVariants: group.map((e) => ({ brand: e.brand, series: e.series, shade: e.shade })),
      confidence: worstConf,
      duplicateRisk,
      reviewStatus,
      suggestedAction,
      sourceLinks: [],
      notes: null,
      groupSize: group.length,
    };

    identities.push(identity);
  }

  // Sort by usage count desc.
  return identities.sort((a, b) => b.usageEvidence.usageCount - a.usageEvidence.usageCount);
}

// ── Summary statistics ─────────────────────────────────────────────────────

/**
 * Compute overview summary stats from an array of TruthIdentity objects.
 */
function computeSummary(identities) {
  const brands = new Set();
  const seriesSet = new Set();
  let devCount = 0;
  let needsReviewCount = 0;
  let duplicateRiskCount = 0;
  let shadeCount = 0;

  for (const id of identities) {
    brands.add(id.canonicalBrand);
    seriesSet.add(`${id.canonicalBrand}::${id.canonicalSeries}`);
    if (id.isDevOxidant) devCount++;
    if (id.reviewStatus === REVIEW_STATUS.NEEDS_REVIEW) needsReviewCount++;
    if (id.reviewStatus === REVIEW_STATUS.DUPLICATE_RISK) duplicateRiskCount++;
    if (isShadeBearingProductType(id.productType)) shadeCount++;
  }

  return {
    totalMaterials: identities.length,
    uniqueBrands: brands.size,
    uniqueSeries: seriesSet.size,
    uniqueShades: shadeCount,
    developerOxidantCount: devCount,
    needsReviewCount,
    duplicateRiskCount,
    lowConfidenceCount: identities.filter((i) => i.confidence === "low").length,
    excludedFromShadeIntelligence: identities.filter((i) => !i.inShadeIntelligence).length,
  };
}

// ── Future integration path ────────────────────────────────────────────────
//
// When Product Truth approvals are persisted (V2+), wire them into the
// existing normalizer/matcher as follows:
//
//   normalizer.js  — load `BRAND_ALIASES` and `SHADE_ALIASES` from the
//                    approved identity rules file instead of hardcoding them.
//                    Export an `applyIdentityAliases(rawBrand, rawSeries, rawShade)`
//                    helper that resolves to the canonical identity before matching.
//
//   matcher.js     — after barcode and brand+series+shade matching, add a
//                    fourth match pass using `canonicalKey` from approved rules.
//                    If a row matches an approved canonical identity, carry
//                    forward the canonical brand/series/shade for the import sheet.
//                    If there is any type conflict (e.g. developer vs. color shade),
//                    reject with `duplicate-risk` — never auto-merge.
//
// V1 does NOT implement this yet. Product Truth V1 is read-only human review.
// The above is the planned extension point, not current behavior.

// ── Exports ────────────────────────────────────────────────────────────────

module.exports = {
  PRODUCT_TYPES,
  REVIEW_STATUS,
  SUGGESTED_ACTION,
  EXCLUDE_FROM_SHADE_INTELLIGENCE,
  SHADE_BEARING_PRODUCT_TYPES,
  SUPPORTING_PRODUCT_TYPES,
  isShadeBearingProductType,
  canonicalKey,
  canonicalId,
  displayBrand,
  displaySeries,
  scoreDuplicateRisk,
  recommendReview,
  areSameShade,
  groupIntoIdentities,
  computeSummary,
};
