/**
 * scripts/lib/product-truth/catalog-normalizer.js
 * ---------------------------------------------------------------
 * Extended normalization layer for catalog-first Product Truth.
 *
 * Extends the existing product-catalog/normalizer with:
 *   - Developer strength parsing (6%, 20 Vol, etc.)
 *   - Product line alias mapping (INOA / NEW INOA → INOA)
 *   - Packaging noise stripping (60g, tube, new, professional)
 *   - Shade format normalization across all punctuation variants
 *   - Size/volume canonical extraction
 *   - Catalog type → Product Truth type mapping
 *
 * Dependency-free. All helpers are pure functions.
 */

"use strict";

const {
  normalizeBrand,
  normalizeSeries,
  normalizeShade,
  normalizeWhitespace,
  stripDiacritics,
} = require("../product-catalog/normalizer");

// ── Product type mapping ───────────────────────────────────────────────────

/** Maps raw catalog `type` strings to canonical Product Truth types. */
const CATALOG_TYPE_TO_PT_TYPE = {
  color:        "hair_color_shade",
  toner:        "hair_color_shade",       // toners are color shades
  developer:    "developer_oxidant",
  bleach:       "lightener_bleach",
  plex:         "bond_builder",
  treatment:    "treatment_care",
  straightening:"treatment_care",
  perm:         "treatment_care",
  retail:       "other",
  accessory:    "other",
  other:        "other",
};

const PT_TYPE_LABELS = {
  hair_color_shade:   "Hair Color Shade",
  permanent_color:    "Permanent Color",
  demi_permanent:     "Demi-Permanent Color",
  acidic_toner:       "Acidic Toner / Gloss",
  direct_dye:         "Direct Dye",
  developer_oxidant:  "Developer / Oxidant",
  lightener_bleach:   "Lightener / Bleach",
  bond_builder:       "Bond Builder",
  treatment_care:     "Treatment / Care",
  mixer_corrector:    "Mixer / Corrector",
  other:              "Other",
};

const SHADE_BEARING_PRODUCT_TYPES = new Set([
  "hair_color_shade",
  "permanent_color",
  "demi_permanent",
  "acidic_toner",
  "direct_dye",
  "mixer_corrector",
]);

const TONAL_CLASSIFICATION_ELIGIBLE_PRODUCT_TYPES = new Set([
  "hair_color_shade",
  "permanent_color",
  "demi_permanent",
  "acidic_toner",
  "direct_dye",
  "mixer_corrector",
]);

function isShadeBearingProductType(productType) {
  return SHADE_BEARING_PRODUCT_TYPES.has(productType);
}

function isTonalClassificationEligibleProductType(productType) {
  return TONAL_CLASSIFICATION_ELIGIBLE_PRODUCT_TYPES.has(productType);
}

function mapCatalogTypeToPTType(rawType) {
  if (!rawType) return "other";
  const lower = String(rawType).toLowerCase().trim();
  return CATALOG_TYPE_TO_PT_TYPE[lower] || "other";
}

// ── Developer / oxidant strength normalization ─────────────────────────────

/**
 * PERCENT_TO_VOL / VOL_TO_PERCENT lookup tables for evidence-backed strengths.
 *
 * These values support concentration normalization and search, not product
 * identity resolution. A developer's commercial system name still determines
 * whether two products can be treated as the same SKU.
 */
const PERCENT_TO_VOL = { 1.5: 5, 1.9: 6, 2: 7, 3: 10, 4: 13, 6: 20, 9: 30, 12: 40 };
const VOL_TO_PERCENT = Object.fromEntries(Object.entries(PERCENT_TO_VOL).map(([p, v]) => [v, +p]));

// Keep existing canonical IDs stable while we move concentration into metadata.
// New low-volume equivalences are searchable attributes, not identity rewrites.
const LEGACY_IDENTITY_VOL_TO_PERCENT = { 6: 1.8, 9: 2.7, 10: 3, 15: 4.5, 20: 6, 30: 9, 40: 12, 50: 15 };

/**
 * Parse developer strength from a shade or series string.
 * Returns { percent, volume, strengthKey, raw, evidence, confidence }
 * Returns null if no strength information can be reliably detected.
 */
function parseDeveloperStrength(text) {
  if (!text) return null;
  const t = String(text).toUpperCase().replace(/[,]/g, ".").trim();

  // Match "6%", "6 %", "6.0%", "6.0 %"
  const pctMatch = t.match(/\b(\d+(?:\.\d+)?)\s*%/);
  // Match "20 VOL", "20VOL", "20 VOL.", "20V"
  const volMatch = t.match(/\b(\d+)\s*V(?:OL)?\.?\b/);

  let percent = null;
  let volume = null;
  let explicitUnit = null;

  if (pctMatch) {
    const p = parseFloat(pctMatch[1]);
    if (Number.isFinite(p) && p > 0 && p <= 50) {
      percent = p;
      volume = PERCENT_TO_VOL[p] || null;
      explicitUnit = "percent";
    }
  }
  if (volMatch && !percent) {
    const v = parseInt(volMatch[1], 10);
    if (Number.isFinite(v) && v > 0 && v <= 200) {
      volume = v;
      percent = VOL_TO_PERCENT[v] || null;
      explicitUnit = "volume";
    }
  }

  if (percent === null && volume === null) return null;

  const identityPercent = explicitUnit === "volume" ? LEGACY_IDENTITY_VOL_TO_PERCENT[volume] : percent;
  const strengthKey = identityPercent != null
    ? `${identityPercent}pct`
    : `${volume}vol`;

  return {
    percent,
    volume,
    strengthKey,
    raw: String(text).trim(),
    evidence: [
      pctMatch ? `explicit_percent:${pctMatch[0].trim()}` : null,
      volMatch ? `explicit_volume:${volMatch[0].trim()}` : null,
      percent != null && volume != null ? "evidence_backed_percent_volume_equivalence" : null,
    ].filter(Boolean),
    confidence: pctMatch || volMatch ? 0.95 : 0,
  };
}

// ── Product line alias mapping ─────────────────────────────────────────────

/**
 * Maps variant product line names to their canonical form.
 * Keys are UPPER-CASED, whitespace-collapsed strings.
 */
const PRODUCT_LINE_ALIASES = {
  // L'Oréal lines
  "NEW INOA":              "INOA",
  "INOA ODS":              "INOA",
  "INOA SUPREME":          "INOA",
  "MAJIREL FUNDA":         "MAJIREL",
  "MAJIREL GLOSS":         "MAJIREL",
  "MAJIREL COOL COVER":    "MAJIREL COOL COVER",
  "COOL COVER":            "MAJIREL COOL COVER",
  "DIA LIGHT 60G":         "DIA LIGHT",
  "DIALIGHT":              "DIA LIGHT",
  "DIA RICHESSE":          "DIA RICHESSE",
  "DIA COLOR":             "DIA COLOR",
  "BLOND STUDIO BLEACH":   "BLOND STUDIO",
  "BLOND STUDIO PLATINIUM":"BLOND STUDIO",
  "INOA DEVELOPERS":       "INOA DEVELOPERS",
  "OXYDANT DEVELOPERS":    "OXYDANT DEVELOPERS",
  "DIACTIVATOR":           "DIACTIVATOR",
  // Wella lines
  "WELLOXON PERFECT":      "WELLOXON PERFECT",
  "COLOR TOUCH":           "COLOR TOUCH",
  "COLOUR TOUCH":          "COLOR TOUCH",
  "KOLESTON PERFECT":      "KOLESTON PERFECT",
  "KOLESTON":              "KOLESTON PERFECT",
  "KP":                    "KOLESTON PERFECT",
  "ILLUMINA COLOR":        "ILLUMINA",
  "ILLUMINA":              "ILLUMINA",
  "BLONDOR":               "BLONDOR",
  // Schwarzkopf lines
  "IGORA ROYAL":           "IGORA ROYAL",
  "IGORA":                 "IGORA ROYAL",
  "IGORA VIBRANCE":        "IGORA VIBRANCE",
  "VIBRANCE":              "IGORA VIBRANCE",
  "CHROMA ID":             "CHROMA ID",
  "BLONDME":               "BLONDME",
  "VARIO BLOND":           "VARIO BLOND",
  // Redken
  "CHROMATICS":            "CHROMATICS",
  "SHADES EQ":             "SHADES EQ",
  "FLASHLIFT":             "FLASHLIFT",
  // Matrix
  "SOCOLOR":               "SOCOLOR",
  "SO COLOR":              "SOCOLOR",
  "SYNC":                  "SYNC",
  "TONAL CONTROL":         "TONAL CONTROL",
  "SUPER SYNC":            "SUPER SYNC",
};

/**
 * Normalize a series/product-line string with alias resolution.
 * Returns the canonical series key (UPPER-CASED).
 */
function normalizeProductLine(series) {
  const upper = normalizeWhitespace(series).toUpperCase();
  return PRODUCT_LINE_ALIASES[upper] || normalizeSeries(series);
}

// ── Noise word stripping ───────────────────────────────────────────────────

/**
 * Strip common packaging/noise words from series/shade strings.
 * Examples: "INOA 60G" → "INOA", "KOLESTON PERFECT TUBE" → "KOLESTON PERFECT"
 */
const NOISE_PATTERNS = [
  /\s+\d+\s*(G|ML|L|MG|KG)\b/gi,   // "60G", "1000ML", "1L"
  /\s+(TUBE|BOTTLE|JAR|PACK|KIT|SET|BOX|NEW|PROFESSIONAL|PRO)\b/gi,
  /\s+\(.*?\)/g,                     // parenthetical notes
];

function stripPackagingNoise(value) {
  if (!value) return "";
  let result = normalizeWhitespace(value);
  for (const pattern of NOISE_PATTERNS) {
    result = result.replace(pattern, "");
  }
  return result.trim();
}

// ── Shade alias generation ─────────────────────────────────────────────────

/**
 * Generate all punctuation variants of a numeric shade code.
 * E.g., "8.3" → ["8.3", "8,3", "8/3", "8-3"]
 *
 * Used to populate the alias list for a canonical identity so that
 * usage report values like "8,3" resolve to the same identity.
 */
function generateShadeVariants(shade) {
  if (!shade) return [];
  const shadeNorm = normalizeShade(shade);
  if (shadeNorm.parts.length < 2) return []; // not a multi-part shade

  const parts = shadeNorm.parts;
  const separators = [".", ",", "/", "-"];
  const variants = new Set();
  for (const sep of separators) {
    variants.add(parts.join(sep));
  }
  // Remove the original canonical form (it's in the main record, not aliases)
  variants.delete(shade);
  return Array.from(variants);
}

// ── Canonical product key ──────────────────────────────────────────────────

/**
 * Build a stable canonical key for a catalog product record.
 * Key components: brand :: normalizedProductLine :: shadeKey :: productType
 *
 * This ensures:
 *   - Same shade in different punctuation → same key
 *   - Same product in different sizes → same key (size is attribute, not key)
 *   - Different types (developer vs color) → different keys
 */
function buildCatalogCanonicalKey({ brand, series, shade, productType }) {
  const b = normalizeBrand(brand);
  const s = normalizeProductLine(series);
  const shadeNorm = normalizeShade(shade);
  const sh = shadeNorm.key || shadeNorm.canonical || "";
  const pt = (productType || "other").toLowerCase().replace(/[^a-z0-9_]/g, "_");
  return `${b}::${s}::${sh}::${pt}`;
}

/**
 * Build a display-friendly canonical ID (slug-like, URL-safe).
 */
function buildCatalogCanonicalId({ brand, series, shade, productType }) {
  const b = normalizeBrand(brand).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const s = normalizeProductLine(series).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const shadeNorm = normalizeShade(shade);
  const sh = (shadeNorm.key || shadeNorm.canonical || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const pt = (productType || "other").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return [b, s, sh, pt].filter(Boolean).join("::");
}

// ── Validation status logic ────────────────────────────────────────────────

/**
 * Determine the validation status for a catalog-derived canonical product.
 *
 * Logic:
 *   - Only shade-format variants (8.3 vs 8,3): approved
 *   - Has barcodes confirming identity: approved
 *   - Single active source, high confidence: approved
 *   - Multiple conflicting types: needs_review
 *   - Developer classified as color or vice versa: needs_review
 *   - No brand or shade: needs_review
 *   - Inactive (all sources deleted/deprecated): inactive
 */
function computeValidationStatus({ records, productType, confidence }) {
  if (!records || records.length === 0) return "unresolved";

  const activeRecords = records.filter((r) => r.flag === 0 || r.flag === 3);
  if (activeRecords.length === 0) return "inactive";

  // Multiple different product types in same group → needs review
  const types = new Set(records.map((r) => r._ptType));
  if (types.size > 1) return "needs_review";

  // Developer vs color type mismatch is critical
  const hasDev = types.has("developer_oxidant");
  const hasColor = [...types].some(isShadeBearingProductType);
  if (hasDev && hasColor) return "needs_review";

  if (confidence === "low") return "needs_review";
  if (confidence === "medium" && isShadeBearingProductType(productType)) return "suggested_match";

  return "approved";
}

// ── Main normalization entry point ─────────────────────────────────────────

/**
 * Normalize one raw catalog record into a canonical-ready form.
 *
 * Returns the enriched record with:
 *   - _ptType: Product Truth type
 *   - _ptTypeLabel: human label
 *   - _canonicalKey: stable grouping key
 *   - _canonicalId: slug-like id
 *   - _normalizedBrand: normalized brand
 *   - _normalizedSeries: normalized series
 *   - _normalizedShade: normalized shade
 *   - _shadeKey: shade lookup key
 *   - _sizeGrams: extracted material weight
 *   - _developerStrength: parsed { percent, volume, strengthKey } | null
 *   - _shadeVariants: punctuation variants of shade
 *   - _confidence: high | medium | low
 */
function normalizeCatalogRecord(record) {
  const brand = record.brand || "";
  const series = record.series || "";
  const shade = record.shade || "";
  const rawType = (record.type || record.rawType || "").toLowerCase();

  const ptType = mapCatalogTypeToPTType(rawType);
  const normalizedBrand = normalizeBrand(brand);
  const normalizedSeries = normalizeProductLine(series);
  const shadeNorm = normalizeShade(shade);
  const sizeGrams = record.materialWeight || record.packingWeight || null;

  // For developer products, also try to parse strength from shade/series
  const developerStrength =
    ptType === "developer_oxidant"
      ? (parseDeveloperStrength(shade) || parseDeveloperStrength(series))
      : null;

  // Canonical key: for developers, use strength key instead of shade key
  let canonicalShadeKey = shadeNorm.key || shadeNorm.canonical || "";
  if (developerStrength) {
    canonicalShadeKey = developerStrength.strengthKey || canonicalShadeKey;
  }

  const canonicalKey = `${normalizedBrand}::${normalizedSeries}::${canonicalShadeKey}::${ptType}`;
  const canonicalId = buildCatalogCanonicalId({ brand, series, shade: canonicalShadeKey, productType: ptType });

  // Shade variants (only for multi-part numeric shades)
  const shadeVariants = generateShadeVariants(shade);

  // Base confidence
  let confidence = "high";
  if (!brand || !shade) confidence = "low";
  else if (!series) confidence = "medium";

  // Lower confidence for unknown/unmapped types
  if (ptType === "other") confidence = confidence === "high" ? "medium" : confidence;

  return {
    ...record,
    _ptType: ptType,
    _ptTypeLabel: PT_TYPE_LABELS[ptType] || "Other",
    _shadeBearing: isShadeBearingProductType(ptType),
    _tonalClassificationEligible: isTonalClassificationEligibleProductType(ptType),
    _canonicalKey: canonicalKey,
    _canonicalId: canonicalId,
    _normalizedBrand: normalizedBrand,
    _normalizedSeries: normalizedSeries,
    _normalizedShade: shadeNorm.canonical || shade.toUpperCase(),
    _shadeKey: canonicalShadeKey,
    _sizeGrams: sizeGrams,
    _developerStrength: developerStrength,
    _shadeVariants: shadeVariants,
    _confidence: confidence,
  };
}

module.exports = {
  mapCatalogTypeToPTType,
  parseDeveloperStrength,
  normalizeProductLine,
  stripPackagingNoise,
  generateShadeVariants,
  buildCatalogCanonicalKey,
  buildCatalogCanonicalId,
  computeValidationStatus,
  normalizeCatalogRecord,
  CATALOG_TYPE_TO_PT_TYPE,
  PT_TYPE_LABELS,
  SHADE_BEARING_PRODUCT_TYPES,
  TONAL_CLASSIFICATION_ELIGIBLE_PRODUCT_TYPES,
  isShadeBearingProductType,
  isTonalClassificationEligibleProductType,
  PRODUCT_LINE_ALIASES,
};
