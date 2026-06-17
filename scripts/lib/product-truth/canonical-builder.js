/**
 * scripts/lib/product-truth/canonical-builder.js
 * ---------------------------------------------------------------
 * Core canonical identity building logic.
 *
 * Given a flat list of normalized catalog records, produces:
 *   - canonical_products: one row per resolved canonical identity
 *   - product_aliases: all alias records
 *   - catalog_product_sources: original catalog row → canonical mapping
 *   - review_items: uncertain merges, conflicts, missing data
 *   - funnel: count statistics at each reduction stage
 *
 * Matching hierarchy (deterministic, no silent fuzzy merging):
 *   1. Exact barcode match
 *   2. Exact catalog key / product ID match
 *   3. Exact normalized canonical key (brand + series + shade + type)
 *   4. Shade punctuation variant (8.3 vs 8,3 vs 8/3 → same shade key)
 *   5. Developer strength variant (6% = 20 Vol → same strength key)
 *   6. Suggested match (medium-confidence similarity) → needs review
 *   7. Unresolved / missing data → needs review
 *
 * Never silently merges fuzzy-only matches.
 * Never merges developer_oxidant with hair_color_shade.
 */

"use strict";

const {
  normalizeCatalogRecord,
  computeValidationStatus,
  generateShadeVariants,
  PT_TYPE_LABELS,
  isShadeBearingProductType,
  isTonalClassificationEligibleProductType,
} = require("./catalog-normalizer");

const { normalizeBrand, normalizeShade } = require("../product-catalog/normalizer");

// ── Conflict / review reasons ──────────────────────────────────────────────

const REVIEW_REASONS = {
  CONFLICTING_TYPES:      "conflicting_product_types",
  DEVELOPER_COLOR_MIX:    "developer_mixed_with_color_shade",
  BARCODE_CONFLICT:       "barcode_belongs_to_different_identity",
  MISSING_SHADE:          "missing_shade_value",
  MISSING_BRAND:          "missing_brand_value",
  LOW_CONFIDENCE:         "low_confidence_classification",
  INACTIVE_ONLY:          "all_source_records_inactive",
  UNKNOWN_TYPE:           "unmapped_product_type",
};

// ── Barcode index ──────────────────────────────────────────────────────────

/**
 * Build a barcode → first-seen canonical key index.
 * Used to detect when a barcode appears on two different canonical groups.
 */
function buildBarcodeIndex(normalizedRecords) {
  const index = new Map(); // barcode → canonicalKey
  for (const r of normalizedRecords) {
    const barcodes = Array.isArray(r.barcodes) ? r.barcodes : [];
    for (const bc of barcodes) {
      if (!bc) continue;
      if (!index.has(bc)) {
        index.set(bc, r._canonicalKey);
      }
    }
  }
  return index;
}

// ── Group records into canonical identity groups ───────────────────────────

/**
 * Group normalized catalog records by their canonical key.
 * Returns a Map<canonicalKey, NormalizedRecord[]>.
 *
 * This is the core deduplication step: all records with the same
 * brand + series + shade_key + product_type end up in one group.
 * This catches exact duplicates and shade-punctuation variants
 * because they all normalize to the same shade key.
 */
function groupByCanonicalKey(normalizedRecords) {
  const groups = new Map();
  for (const record of normalizedRecords) {
    const key = record._canonicalKey;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(record);
  }
  return groups;
}

// ── Merge records within a group ───────────────────────────────────────────

/**
 * Given a group of records sharing the same canonical key, produce:
 *   - one canonical product identity
 *   - a list of alias records
 *   - a list of source records
 *   - optional review items
 */
function buildIdentityFromGroup(canonicalKey, records) {
  const reviewItems = [];
  const aliases = [];
  const sources = [];

  // Use the most-used / flagged-active record as the primary
  const activeRecords = records.filter((r) => r.flag === 0 || r.flag === 3);
  const primary = activeRecords[0] || records[0];

  // Collect all unique product types in this group
  const typesInGroup = [...new Set(records.map((r) => r._ptType))];
  const dominantType = primary._ptType;

  // Detect cross-type mixing
  const hasDev = typesInGroup.includes("developer_oxidant");
  const hasColor = typesInGroup.some(isShadeBearingProductType);

  // Collect all barcodes across the group
  const allBarcodes = [...new Set(records.flatMap((r) => Array.isArray(r.barcodes) ? r.barcodes : []).filter(Boolean))];

  // Collect all catalog numbers
  const allCatalogNos = [...new Set(records.map((r) => r.catalogNo).filter(Boolean))];

  // Collect all shade variants as aliases
  const seenAliasValues = new Set([primary.shade?.toUpperCase()]);
  for (const r of records) {
    const shade = r.shade || "";
    const upperShade = shade.toUpperCase();
    if (shade && upperShade !== primary.shade?.toUpperCase() && !seenAliasValues.has(upperShade)) {
      seenAliasValues.add(upperShade);
      aliases.push({
        alias: shade,
        normalizedAlias: r._shadeKey,
        aliasType: "shade_variant",
        source: "catalog_normalization",
        sourceRecordId: r.id,
        confidence: "high",
      });
    }
    // Add punctuation variants
    for (const variant of (r._shadeVariants || [])) {
      const upperVariant = variant.toUpperCase();
      if (!seenAliasValues.has(upperVariant)) {
        seenAliasValues.add(upperVariant);
        aliases.push({
          alias: variant,
          normalizedAlias: r._shadeKey,
          aliasType: "shade_format",
          source: "shade_normalization",
          sourceRecordId: r.id,
          confidence: "high",
        });
      }
    }
    // Build source records
    sources.push({
      sourceId: r.id,
      canonicalKey,
      originalPayload: {
        id: r.id,
        brand: r.brand,
        series: r.series,
        familyShade: r.familyShade,
        shade: r.shade,
        type: r.type,
        rawType: r.rawType,
        productKind: r.productKind,
        materialWeight: r.materialWeight,
        packingWeight: r.packingWeight,
        barcodes: r.barcodes,
        barcode: r.barcode,
        barcodeCount: r.barcodeCount,
        catalogNo: r.catalogNo,
        hairColor: r.hairColor,
        image: r.image,
        flag: r.flag,
        shadeDesc: r.shadeDesc,
        price: r.price,
      },
      matchMethod: records.length > 1 ? "grouped_by_canonical_key" : "single_record",
      matchConfidence: r._confidence,
      flag: r.flag,
      sourceBrandFile: r._sourceBrandFile || null,
    });
  }

  // Conflict detection
  if (hasDev && hasColor) {
    reviewItems.push({
      reason: REVIEW_REASONS.DEVELOPER_COLOR_MIX,
      severity: "critical",
      description: "Developer/oxidant and hair color shade share the same canonical key.",
      details: { types: typesInGroup, recordIds: records.map((r) => r.id) },
    });
  } else if (typesInGroup.length > 1) {
    reviewItems.push({
      reason: REVIEW_REASONS.CONFLICTING_TYPES,
      severity: "high",
      description: "Multiple product types mapped to the same canonical identity.",
      details: { types: typesInGroup, recordIds: records.map((r) => r.id) },
    });
  }
  if (!primary.brand) {
    reviewItems.push({ reason: REVIEW_REASONS.MISSING_BRAND, severity: "critical", description: "No brand value.", details: {} });
  }
  if (!primary.shade && isShadeBearingProductType(dominantType)) {
    reviewItems.push({ reason: REVIEW_REASONS.MISSING_SHADE, severity: "high", description: "No shade value for a color product.", details: {} });
  }
  if (primary._confidence === "low") {
    reviewItems.push({ reason: REVIEW_REASONS.LOW_CONFIDENCE, severity: "medium", description: "Low classification confidence.", details: { ptType: dominantType } });
  }
  if (activeRecords.length === 0) {
    reviewItems.push({ reason: REVIEW_REASONS.INACTIVE_ONLY, severity: "low", description: "All source records are deleted or deprecated.", details: {} });
  }

  // Confidence: worst across the group
  const confidenceRank = { high: 3, medium: 2, low: 1 };
  const worstConf = records
    .map((r) => r._confidence)
    .sort((a, b) => (confidenceRank[a] || 1) - (confidenceRank[b] || 1))[0] || "medium";

  const validationStatus = reviewItems.length > 0
    ? (reviewItems.some((i) => i.severity === "critical") ? "needs_review" : "suggested_match")
    : computeValidationStatus({ records, productType: dominantType, confidence: worstConf });

  // Extract developer strength (if available)
  const devStrength = records.find((r) => r._developerStrength)?._developerStrength || null;

  // Merge size info (primary size, but note if multiple sizes exist)
  const sizes = [...new Set(records.map((r) => r._sizeGrams).filter(Boolean))];

  // Build display brand (resolve known display names)
  const displayBrand = resolveDisplayBrand(primary._normalizedBrand) || primary.brand || primary._normalizedBrand;

  const identity = {
    canonicalId: canonicalKey,
    displayBrand,
    brand: primary._normalizedBrand,
    series: primary._normalizedSeries,
    displaySeries: primary.series || primary._normalizedSeries,
    shade: primary._normalizedShade,
    displayShade: primary.shade || primary._normalizedShade,
    shadeDesc: primary.shadeDesc || "",
    familyShade: primary.familyShade || "",
    productType: dominantType,
    productTypeLabel: PT_TYPE_LABELS[dominantType] || "Other",
    shadeBearing: isShadeBearingProductType(dominantType),
    tonalClassificationEligible: isTonalClassificationEligibleProductType(dominantType),
    catalogType: primary.type || primary.rawType || "",
    productKind: primary.productKind || "",
    developerStrength: devStrength,
    sizes,
    primarySizeGrams: sizes[0] || null,
    barcodes: allBarcodes,
    catalogNos: allCatalogNos,
    image: primary.image || "",
    hairColor: primary.hairColor || "",
    active: activeRecords.length > 0,
    hasActiveRecords: activeRecords.length,
    hasBarcodes: allBarcodes.length > 0,
    validationStatus,
    confidence: worstConf,
    sourceCount: records.length,
    duplicatesMerged: records.length - 1,
    aliasCount: aliases.length,
    reviewItemCount: reviewItems.length,
    excludeFromShadeIntelligence: !isTonalClassificationEligibleProductType(dominantType),
    isSupportingProduct: ["developer_oxidant", "bond_builder", "treatment_care"].includes(dominantType),
  };

  return { identity, aliases, sources, reviewItems };
}

// ── Display brand resolution ───────────────────────────────────────────────

const DISPLAY_BRAND_MAP = {
  "LOREAL":                  "L'Oréal Professionnel",
  "L'OREAL PROFESSIONNEL":   "L'Oréal Professionnel",
  "L'OREAL PROFESSIONNELS":  "L'Oréal Professionnel",
  "SCHWARZKOPF":             "Schwarzkopf Professional",
  "WELLA":                   "Wella Professionals",
  "WELLA PROFESSIONALS":     "Wella Professionals",
  "MATRIX":                  "Matrix",
  "REDKEN":                  "Redken",
  "KEUNE":                   "Keune",
  "OLAPLEX":                 "Olaplex",
  "PAUL MITCHELL":           "Paul Mitchell",
  "JOICO":                   "Joico",
  "KENRA":                   "Kenra",
};

function resolveDisplayBrand(normalizedBrand) {
  if (!normalizedBrand) return null;
  const upper = normalizedBrand.toUpperCase().trim();
  return DISPLAY_BRAND_MAP[upper] || null;
}

// ── Main builder function ──────────────────────────────────────────────────

/**
 * Build canonical Product Truth from a flat array of raw catalog records.
 *
 * @param {Array<object>} rawCatalogRecords - All catalog records from brand JSON files
 * @returns {object} { canonicalProducts, aliases, sources, reviewItems, funnel }
 */
function buildCanonicalProductTruth(rawCatalogRecords) {
  const startTime = Date.now();

  // Step 1: Normalize all records
  const normalizedRecords = rawCatalogRecords.map(normalizeCatalogRecord);

  // Step 2: Build barcode index for conflict detection
  const barcodeIndex = buildBarcodeIndex(normalizedRecords);

  // Step 3: Group by canonical key
  const groups = groupByCanonicalKey(normalizedRecords);

  // Step 4: Build identities, aliases, sources, review items
  const canonicalProducts = [];
  const allAliases = [];
  const allSources = [];
  const allReviewItems = [];

  let totalAliasesMerged = 0;
  let totalDuplicatesMerged = 0;
  let exactDuplicatesMerged = 0;

  for (const [key, records] of groups) {
    const { identity, aliases, sources, reviewItems } = buildIdentityFromGroup(key, records);

    canonicalProducts.push(identity);
    allAliases.push(...aliases.map((a) => ({ ...a, canonicalProductId: key })));
    allSources.push(...sources.map((s) => ({ ...s, canonicalProductId: key })));
    allReviewItems.push(...reviewItems.map((ri) => ({ ...ri, canonicalProductId: key })));

    if (records.length > 1) {
      totalDuplicatesMerged += records.length - 1;
      exactDuplicatesMerged += records.length - 1;
    }
    totalAliasesMerged += aliases.length;
  }

  // Step 5: Check for cross-group barcode conflicts
  const barcodeConflictItems = detectBarcodeConflicts(normalizedRecords, barcodeIndex);
  allReviewItems.push(...barcodeConflictItems);

  // Step 6: Compute funnel statistics
  const byProductType = {};
  const byValidationStatus = {};
  const byBrand = {};

  for (const identity of canonicalProducts) {
    byProductType[identity.productType] = (byProductType[identity.productType] || 0) + 1;
    byValidationStatus[identity.validationStatus] = (byValidationStatus[identity.validationStatus] || 0) + 1;
    const brandKey = identity.brand || "unknown";
    if (!byBrand[brandKey]) byBrand[brandKey] = { count: 0, brand: identity.displayBrand || identity.brand };
    byBrand[brandKey].count++;
  }

  const topBrands = Object.entries(byBrand)
    .map(([, v]) => v)
    .sort((a, b) => b.count - a.count)
    .slice(0, 30);

  const funnel = {
    generatedAt: new Date().toISOString(),
    totalCatalogRows: rawCatalogRecords.length,
    normalizedCatalogRows: normalizedRecords.length,
    exactDuplicatesMerged,
    aliasesMerged: totalAliasesMerged,
    canonicalProductsCreated: canonicalProducts.length,
    approvedCanonicalProducts: byValidationStatus["approved"] || 0,
    suggestedMatches: byValidationStatus["suggested_match"] || 0,
    needsReview: byValidationStatus["needs_review"] || 0,
    inactive: byValidationStatus["inactive"] || 0,
    unresolved: byValidationStatus["unresolved"] || 0,
    byProductType,
    byValidationStatus,
    topBrands,
    totalReviewItems: allReviewItems.length,
    totalAliases: allAliases.length,
    totalSources: allSources.length,
    buildDurationMs: Date.now() - startTime,
  };

  return {
    canonicalProducts,
    aliases: allAliases,
    sources: allSources,
    reviewItems: allReviewItems,
    funnel,
  };
}

// ── Barcode conflict detection ─────────────────────────────────────────────

function detectBarcodeConflicts(normalizedRecords, barcodeIndex) {
  const reviewItems = [];
  const seen = new Map(); // barcode → { canonicalKey, productId }

  for (const r of normalizedRecords) {
    const barcodes = Array.isArray(r.barcodes) ? r.barcodes : [];
    for (const bc of barcodes) {
      if (!bc) continue;
      const existingKey = seen.get(bc);
      if (existingKey && existingKey.canonicalKey !== r._canonicalKey) {
        // Cross-canonical-identity barcode conflict
        reviewItems.push({
          reason: "barcode_conflict_cross_identity",
          severity: "critical",
          canonicalProductId: r._canonicalKey,
          description: `Barcode ${bc} appears on multiple different canonical identities.`,
          details: {
            barcode: bc,
            canonicalKeyA: existingKey.canonicalKey,
            canonicalKeyB: r._canonicalKey,
            productIdA: existingKey.productId,
            productIdB: r.id,
          },
        });
      } else if (!seen.has(bc)) {
        seen.set(bc, { canonicalKey: r._canonicalKey, productId: r.id });
      }
    }
  }
  return reviewItems;
}

// ── Build search index ─────────────────────────────────────────────────────

/**
 * Build a lightweight search index for the UI.
 * Each entry contains the canonical product ID and all searchable text tokens.
 *
 * Index format: [{ id, tokens, display }]
 * Tokens include brand, series, shade, aliases, barcodes, catalog numbers,
 * shade description, developer strength, product type label.
 */
function buildSearchIndex(canonicalProducts, allAliases) {
  // Build alias lookup by canonical ID
  const aliasesByCanonical = new Map();
  for (const a of allAliases) {
    const id = a.canonicalProductId;
    if (!aliasesByCanonical.has(id)) aliasesByCanonical.set(id, []);
    aliasesByCanonical.get(id).push(a.alias);
  }

  return canonicalProducts.map((p) => {
    const aliases = aliasesByCanonical.get(p.canonicalId) || [];
    const strengthTokens = p.developerStrength
      ? [
          p.developerStrength.percent != null ? `${p.developerStrength.percent}%` : null,
          p.developerStrength.volume != null ? `${p.developerStrength.volume}vol` : null,
          p.developerStrength.volume != null ? `${p.developerStrength.volume} vol` : null,
        ].filter(Boolean)
      : [];

    const tokens = [
      p.brand,
      p.displayBrand,
      p.series,
      p.displaySeries,
      p.shade,
      p.displayShade,
      p.shadeDesc,
      p.familyShade,
      p.productType,
      p.productTypeLabel,
      p.catalogType,
      p.productKind,
      ...aliases,
      ...p.barcodes,
      ...p.catalogNos,
      ...strengthTokens,
      p.hairColor,
    ]
      .filter(Boolean)
      .map((t) => String(t).toLowerCase().trim())
      .filter((t) => t.length > 0);

    return {
      id: p.canonicalId,
      tokens: [...new Set(tokens)],
      display: {
        brand: p.displayBrand || p.brand,
        series: p.displaySeries || p.series,
        shade: p.displayShade || p.shade,
        shadeDesc: p.shadeDesc,
        productType: p.productTypeLabel,
        validationStatus: p.validationStatus,
        confidence: p.confidence,
        active: p.active,
        sourceCount: p.sourceCount,
        aliasCount: p.aliasCount,
        barcodes: p.barcodes.slice(0, 3),
      },
    };
  });
}

module.exports = {
  normalizeCatalogRecord,
  groupByCanonicalKey,
  buildIdentityFromGroup,
  buildCanonicalProductTruth,
  buildSearchIndex,
  detectBarcodeConflicts,
  REVIEW_REASONS,
};
