/**
 * scripts/lib/m5-classification/product-classifier.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Deterministic product classification engine for Milestone 5.
 *
 * Input:  A raw catalog product record from data/catalog-brands/*.json
 * Output: A structured classification result with confidence and evidence
 *
 * Rules are applied in this strict priority order:
 *   1. Manufacturer rule registry (brand-specific shade system + product types)
 *   2. Series / product-line lookup against registered rules
 *   3. Developer/lightener/treatment signal detection
 *   4. Shade code pattern matching
 *   5. Package extraction
 *   6. Named-tone fuzzy lookup (for text-only shades)
 *
 * AI assistance is NOT invoked here. Any record that cannot be resolved
 * deterministically is flagged as low/medium confidence for manual review.
 *
 * SAFETY INVARIANT:
 *   classifyProduct() never produces relationship_type = "same_commercial_sku"
 *   across different manufacturers.  Cross-brand tonal similarity outputs
 *   a separate "tonal_candidate" field that must never trigger an SKU merge.
 */

"use strict";

const {
  getRulesForBrand,
  RULES_VERSION,
  SHADE_CODE_PATTERNS,
  STANDARD_REFLECTIONS,
} = require("./manufacturer-rules");

// ── Confidence thresholds (Phase 7) ──────────────────────────────────────────

const CONFIDENCE = {
  EXACT_SKU:    1.00,   // exact commercial SKU match possible
  HIGH:         0.97,   // deterministic match, all fields resolved
  MEDIUM_HIGH:  0.90,   // deterministic match, minor ambiguity
  MEDIUM:       0.82,   // partial match, needs review
  LOW:          0.65,   // significant ambiguity
  UNRESOLVED:   0.0,    // cannot classify
};

const BAND_THRESHOLDS = {
  AUTOMATIC:   0.95,   // 0.95–1.00 → apply automatically
  REVIEW:      0.80,   // 0.80–0.94 → create review item
  UNRESOLVED:  0.0,    // below 0.80 → unresolved
};

const SHADE_BEARING_PRODUCT_TYPES = new Set([
  "hair_color_shade",
  "permanent_color",
  "demi_permanent",
  "acidic_toner",
  "direct_dye",
]);

const TONAL_CLASSIFICATION_ELIGIBLE_PRODUCT_TYPES = new Set([
  "hair_color_shade",
  "permanent_color",
  "demi_permanent",
  "acidic_toner",
  "direct_dye",
]);

function isShadeBearingProductType(productType) {
  return SHADE_BEARING_PRODUCT_TYPES.has(productType);
}

function isTonalClassificationEligibleProductType(productType) {
  return TONAL_CLASSIFICATION_ELIGIBLE_PRODUCT_TYPES.has(productType);
}

function confidenceBand(score) {
  if (score >= BAND_THRESHOLDS.AUTOMATIC) return "automatic";
  if (score >= BAND_THRESHOLDS.REVIEW)    return "review";
  return "unresolved";
}

// ── Known named tones ────────────────────────────────────────────────────────
// Used for text-based shade names when no numeric code is present.

const NAMED_TONE_MAP = {
  // Natural family
  "natural":         { primaryTone: "Natural",   toneFamily: "natural",   level: null },
  "extra natural":   { primaryTone: "Natural",   toneFamily: "natural",   level: null },
  "natural warm":    { primaryTone: "Natural Warm", toneFamily: "natural", level: null },
  "natural ash":     { primaryTone: "Natural Ash",  toneFamily: "cool",    level: null },
  "natural gold":    { primaryTone: "Natural Gold", toneFamily: "warm",    level: null },

  // Blonde family
  "golden blonde":   { primaryTone: "Gold",      toneFamily: "warm",      level: null },
  "ash blonde":      { primaryTone: "Ash",        toneFamily: "cool",      level: null },
  "warm blonde":     { primaryTone: "Gold",       toneFamily: "warm",      level: null },
  "beige blonde":    { primaryTone: "Beige",      toneFamily: "cool",      level: null },
  "lightest natural":{ primaryTone: "Natural",    toneFamily: "natural",   level: null },

  // Warm family
  "gold":            { primaryTone: "Gold",       toneFamily: "warm",      level: null },
  "copper":          { primaryTone: "Copper",     toneFamily: "warm",      level: null },
  "warm beige":      { primaryTone: "Beige",      toneFamily: "warm",      level: null },
  "copper red":      { primaryTone: "Copper Red", toneFamily: "warm",      level: null },
  "warm brown":      { primaryTone: "Brown",      toneFamily: "warm",      level: null },

  // Cool family
  "ash":             { primaryTone: "Ash",        toneFamily: "cool",      level: null },
  "pearl":           { primaryTone: "Pearl",      toneFamily: "cool",      level: null },
  "cendre":          { primaryTone: "Cendre",     toneFamily: "cool",      level: null },
  "silver":          { primaryTone: "Pearl",      toneFamily: "cool",      level: null },

  // Red/Mahogany
  "red":             { primaryTone: "Red",        toneFamily: "warm",      level: null },
  "mahogany":        { primaryTone: "Mahogany",   toneFamily: "mahogany",  level: null },
  "violet":          { primaryTone: "Violet",     toneFamily: "violet",    level: null },
  "iridescent":      { primaryTone: "Iridescent", toneFamily: "violet",    level: null },
};

// ── Package extraction ────────────────────────────────────────────────────────

const PACKAGE_PATTERNS = [
  { regex: /(\d+(?:\.\d+)?)\s*(?:fl\.?\s*oz|floz)\b/i,  unit: "fl_oz" },
  { regex: /(\d+(?:\.\d+)?)\s*oz\b/i,                    unit: "oz" },
  { regex: /(\d+(?:\.\d+)?)\s*(?:ml|mL)\b/i,             unit: "ml" },
  { regex: /(\d+(?:\.\d+)?)\s*(?:g|gr|gram|grams)\b/i,   unit: "g" },
  { regex: /(\d+(?:\.\d+)?)\s*(?:kg|kilogram)\b/i,       unit: "kg", multiplier: 1000 },
  { regex: /(\d+(?:\.\d+)?)\s*(?:lb|lbs|pound)\b/i,      unit: "lb" },
  { regex: /(\d+(?:\.\d+)?)\s*L\b/i,                     unit: "L" },
];

function getExactLineScopedRule(rules, productLine) {
  if (!rules?.lineScopedShadeRules || !productLine) return null;
  const normalizedLine = String(productLine).toUpperCase().trim();
  return rules.lineScopedShadeRules.find(rule =>
    rule.exactProductLines.some(line => line.toUpperCase() === normalizedLine)
  ) || null;
}

function extractPackageSize(product) {
  const candidates = [
    product.shade,
    product.series,
    product.familyShade,
  ].filter(Boolean).map(String);

  const sizeValue = product.materialWeight || product.packingWeight;

  for (const text of candidates) {
    for (const { regex, unit, multiplier } of PACKAGE_PATTERNS) {
      const m = text.match(regex);
      if (m) {
        const value = parseFloat(m[1]) * (multiplier || 1);
        return { packageSize: value, packageUnit: unit, evidence: `extracted from "${text}"` };
      }
    }
  }

  if (sizeValue && sizeValue > 0) {
    // materialWeight is assumed grams unless rules say otherwise
    return { packageSize: sizeValue, packageUnit: "g", evidence: "from materialWeight field" };
  }

  return { packageSize: null, packageUnit: null, evidence: null };
}

// ── Shade code parsing ────────────────────────────────────────────────────────

function stripTrailingPackage(rawShade) {
  const shade = String(rawShade || "").trim();
  const m = shade.match(/^(.*?)\s+(\d+(?:\.\d+)?)\s*(g|ml|mL|oz)\s*$/i);
  if (!m) return { shade, packageSuffix: null };
  return {
    shade: m[1].trim(),
    packageSuffix: `${m[2]}${m[3].toLowerCase()}`,
  };
}

function parseWellaTone(toneRaw, reflectionMap) {
  const toneStr = String(toneRaw || "");
  const primary = toneStr[0] || null;
  const secondary = toneStr.length > 1 ? toneStr[1] : null;
  const primaryEntry = primary ? reflectionMap[primary] : null;
  const secondaryEntry = secondary && secondary !== "0" ? reflectionMap[secondary] : null;

  return {
    primaryTone: primary,
    primaryToneLabel: primaryEntry?.label || null,
    secondaryTone: secondary && secondary !== "0" ? secondary : null,
    secondaryToneLabel: secondaryEntry?.label || null,
    toneFamily: primaryEntry?.toneFamily || null,
  };
}

function withLineScopedEvidence(result, rule, metadata = {}) {
  return {
    ...result,
    ruleId: rule.id,
    ruleVersion: rule.rulesVersion,
    evidenceSources: rule.evidenceSources,
    metadata: {
      lineScoped: true,
      ...metadata,
    },
  };
}

function parseColorCharmAlphaShade(rawShade, rule, rules) {
  const shade = String(rawShade || "").trim().toUpperCase();
  const m = shade.match(/^(\d{1,2})([A-Z]{1,4}\+?)$/);
  if (!m) return null;

  const level = parseInt(m[1], 10);
  const suffix = m[2];
  const [minL, maxL] = rules.levelRange;
  if (level < minL || level > maxL) return null;

  const entry = rule.reflectionMap[suffix];
  if (!entry) return null;

  return withLineScopedEvidence({
    shadeCodeRaw:        String(rawShade).trim(),
    shadeCodeNormalized: `${level}${suffix}`,
    patternName:         rule.shadeParser,
    shadeSystem:         "alpha",
    level,
    primaryTone:         suffix,
    primaryToneLabel:    entry.label,
    secondaryTone:       null,
    secondaryToneLabel:  null,
    toneFamily:          entry.toneFamily,
  }, rule, { alphaSuffix: suffix });
}

function parseWellaSlashVariantShade(rawShade, rule) {
  const stripped = stripTrailingPackage(rawShade);
  const shade = stripped.shade.toUpperCase();
  const reflectionMap = rule.reflectionMap;

  let m = shade.match(/^R(\d{1,2})\/(\d{1,2})$/);
  if (m && rule.shadeParser === "color_touch_variants") {
    const level = parseInt(m[1], 10);
    const toneRaw = m[2];
    return withLineScopedEvidence({
      shadeCodeRaw:        String(rawShade).trim(),
      shadeCodeNormalized: `R${level}/${toneRaw}`,
      patternName:         rule.shadeParser,
      shadeSystem:         "slash",
      level,
      ...parseWellaTone(toneRaw, reflectionMap),
    }, rule, { variant: "relights", packageSuffix: stripped.packageSuffix });
  }

  m = shade.match(/^0\/(\d{1,2})$/);
  if (m) {
    const toneRaw = m[1];
    return withLineScopedEvidence({
      shadeCodeRaw:        String(rawShade).trim(),
      shadeCodeNormalized: `0/${toneRaw}`,
      patternName:         rule.shadeParser,
      shadeSystem:         "slash",
      level:               null,
      ...parseWellaTone(toneRaw, reflectionMap),
    }, rule, { variant: "special_mix", packageSuffix: stripped.packageSuffix });
  }

  m = shade.match(/^([1-9])\1\/(\d{1,2})$/);
  if (m) {
    const effectiveLevel = parseInt(m[1], 10);
    const toneRaw = m[2];
    return withLineScopedEvidence({
      shadeCodeRaw:        String(rawShade).trim(),
      shadeCodeNormalized: `${m[1]}${m[1]}/${toneRaw}`,
      patternName:         rule.shadeParser,
      shadeSystem:         "slash",
      level:               effectiveLevel,
      ...parseWellaTone(toneRaw, reflectionMap),
    }, rule, { variant: "repeated_depth", rawDepth: `${m[1]}${m[1]}`, packageSuffix: stripped.packageSuffix });
  }

  m = shade.match(/^(\d{1,2})\/(\d{1,2})$/);
  if (m) {
    const level = parseInt(m[1], 10);
    const toneRaw = m[2];
    return withLineScopedEvidence({
      shadeCodeRaw:        String(rawShade).trim(),
      shadeCodeNormalized: `${level}/${toneRaw}`,
      patternName:         rule.shadeParser,
      shadeSystem:         "slash",
      level,
      ...parseWellaTone(toneRaw, reflectionMap),
    }, rule, { variant: stripped.packageSuffix ? "package_suffix" : "standard_slash", packageSuffix: stripped.packageSuffix });
  }

  return null;
}

function parseLineScopedShadeCode(rawShade, rules, context = {}) {
  const rule = getExactLineScopedRule(rules, context.productLine || context.series);
  if (!rule) return null;

  if (rule.shadeParser === "color_charm_alpha") {
    return parseColorCharmAlphaShade(rawShade, rule, rules);
  }

  if (rule.shadeParser === "koleston_slash_variants" || rule.shadeParser === "color_touch_variants") {
    return parseWellaSlashVariantShade(rawShade, rule);
  }

  return null;
}

/**
 * Parse a shade code string using the rules for a given manufacturer.
 * Returns a structured shade result or null if unparseable.
 */
function parseShadeCode(rawShade, rules, context = {}) {
  if (!rawShade) return null;
  const shade = String(rawShade).trim();
  if (!shade) return null;

  const lineScopedResult = parseLineScopedShadeCode(shade, rules, context);
  if (lineScopedResult) return lineScopedResult;

  const patterns = rules
    ? rules.shadeCodePatterns
    : Object.values(SHADE_CODE_PATTERNS);

  for (const pattern of patterns) {
    const m = shade.match(pattern.regex);
    if (!m) continue;

    const levelRaw = m[1];
    const toneRaw  = m[2] || null;
    const level    = levelRaw && levelRaw !== "" ? parseInt(levelRaw, 10) : null;

    // Validate level range
    if (level !== null && rules) {
      const [minL, maxL] = rules.levelRange;
      if (level < minL || level > maxL) {
        continue; // level outside valid range for this brand — try next pattern
      }
    }

    let primaryTone = null;
    let secondaryTone = null;
    let primaryToneLabel = null;
    let secondaryToneLabel = null;
    let toneFamily = null;

    const reflectionMap = (rules && rules.reflectionMap) || STANDARD_REFLECTIONS;

    if (toneRaw) {
      if (pattern.name === "redken_alpha") {
        // Full suffix is the reflection key for Redken
        const suffixEntry = reflectionMap[toneRaw];
        primaryTone = toneRaw;
        primaryToneLabel = suffixEntry || toneRaw;
        toneFamily = null; // Redken suffixes don't have toneFamily in this map
      } else if (pattern.name === "goldwell_alpha") {
        const entry = reflectionMap[toneRaw];
        if (entry) {
          primaryTone = toneRaw;
          primaryToneLabel = entry.label;
          toneFamily = entry.toneFamily;
        } else {
          primaryTone = toneRaw;
        }
      } else {
        // Numeric reflection (dot/slash/dash systems)
        const toneStr = String(toneRaw).padStart(1);
        const primary = toneStr[0];
        const secondary = toneStr.length > 1 ? toneStr[1] : null;

        const primaryEntry = reflectionMap[primary];
        if (primaryEntry) {
          primaryTone = primary;
          primaryToneLabel = primaryEntry.label;
          toneFamily = primaryEntry.toneFamily;
        }

        if (secondary && secondary !== "0") {
          const secondaryEntry = reflectionMap[secondary];
          if (secondaryEntry) {
            secondaryTone = secondary;
            secondaryToneLabel = secondaryEntry.label;
          }
        }
      }
    }

    const separator = pattern.separator || rules?.primaryToneSeparator || null;
    const normalized = separator !== null
      ? `${level !== null ? level : ""}${separator}${toneRaw || ""}`
      : `${level !== null ? level : ""}${toneRaw || ""}`;

    return {
      shadeCodeRaw:        shade,
      shadeCodeNormalized: normalized,
      patternName:         pattern.name,
      shadeSystem:         pattern.shadeSystem,
      level,
      primaryTone,
      primaryToneLabel,
      secondaryTone,
      secondaryToneLabel,
      toneFamily,
    };
  }

  return null; // no pattern matched — shade is a name or unparseable code
}

/**
 * Classify a shade as named tone using the named tone lookup table.
 * Returns a tone result or null.
 */
function parseNamedTone(rawShade) {
  if (!rawShade) return null;
  const lower = String(rawShade).toLowerCase().trim();

  // Exact match
  if (NAMED_TONE_MAP[lower]) {
    return { ...NAMED_TONE_MAP[lower], matched: "exact", term: rawShade };
  }

  // Partial match — check if any known tone phrase appears in the shade string
  for (const [key, val] of Object.entries(NAMED_TONE_MAP)) {
    if (lower.includes(key)) {
      return { ...val, matched: "partial", term: key };
    }
  }

  return null;
}

// ── Product type detection ────────────────────────────────────────────────────

function detectProductType(product, rules) {
  const rawType = (product.type || "").toLowerCase();
  const series  = (product.series || "").toUpperCase().trim();
  const shade   = (product.shade || "").toLowerCase();
  const name    = (product.familyShade || product.shade || "").toLowerCase();

  // Use catalog type as baseline
  const TYPE_MAP = {
    color:        "hair_color_shade",
    toner:        "hair_color_shade",
    developer:    "developer_oxidant",
    bleach:       "lightener_bleach",
    plex:         "bond_builder",
    treatment:    "treatment_care",
    straightening:"treatment_care",
    perm:         "treatment_care",
    retail:       "other",
    accessory:    "other",
  };
  let productType = TYPE_MAP[rawType] || "other";
  let typeEvidence = `catalog type="${rawType}"`;

  if (!rules) return { productType, typeEvidence };

  const lineScopedRule = getExactLineScopedRule(rules, series);
  const lineScopedShade = lineScopedRule
    ? parseLineScopedShadeCode(product.shade, rules, { productLine: series })
    : null;
  if (lineScopedRule?.productType && lineScopedShade) {
    productType = lineScopedRule.productType;
    typeEvidence = `rules:line_scoped="${series}" rule="${lineScopedRule.id}"`;
    return { productType, typeEvidence, technology: lineScopedRule.technology, lineScopedRule };
  }

  // Check series against manufacturer product line rules
  const lineRules = rules.productLineRules;
  if (lineRules) {
    // Try exact series match first, then partial
    const exactLine = lineRules[series];
    if (exactLine) {
      productType = exactLine.productType;
      typeEvidence = `rules:product_line="${series}"`;
      return { productType, typeEvidence, technology: exactLine.technology };
    }

    // Partial series match
    for (const [lineKey, lineRule] of Object.entries(lineRules)) {
      if (series.includes(lineKey) || lineKey.includes(series)) {
        productType = lineRule.productType;
        typeEvidence = `rules:partial_line="${lineKey}" from series="${series}"`;
        return { productType, typeEvidence, technology: lineRule.technology };
      }
    }
  }

  // Developer/lightener override signals
  const devClass = rules.developerOrColorClassification;
  if (devClass) {
    const allText = `${series} ${shade} ${name}`.toLowerCase();
    const isDevSignal = devClass.developerKeywords.some(kw => allText.includes(kw));
    const isLightenerSignal = devClass.lightenerKeywords.some(kw => allText.includes(kw));

    if (isDevSignal && productType !== "developer_oxidant") {
      productType = "developer_oxidant";
      typeEvidence = `rules:developer_keyword in="${allText.slice(0,50)}"`;
    } else if (isLightenerSignal && productType !== "lightener_bleach") {
      productType = "lightener_bleach";
      typeEvidence = `rules:lightener_keyword in="${allText.slice(0,50)}"`;
    }
  }

  return { productType, typeEvidence };
}

// ── Product family candidate ──────────────────────────────────────────────────

function extractFamilyCandidate(product, rules) {
  const series = (product.series || "").trim();
  const familyShade = (product.familyShade || "").trim();

  if (!series && !familyShade) {
    return { familyCandidate: null, familyEvidence: "no series or familyShade" };
  }

  // If familyShade is same as series, use series only
  if (familyShade.toUpperCase() === series.toUpperCase()) {
    return { familyCandidate: series.toUpperCase(), familyEvidence: "series" };
  }

  // Use series as the primary family identifier (manufacturer → line → family)
  // familyShade is a sub-group within the series
  const family = familyShade
    ? `${series.toUpperCase()} / ${familyShade.toUpperCase()}`
    : series.toUpperCase();

  return { familyCandidate: family, familyEvidence: `series="${series}" familyShade="${familyShade}"` };
}

// ── Main classification function ──────────────────────────────────────────────

/**
 * Classify a single catalog product record deterministically.
 *
 * @param {object} product - raw product from data/catalog-brands/<slug>.json
 * @param {string} brandSlug - the catalog file slug (e.g. "wella-professionals")
 * @returns {ClassificationResult}
 */
function classifyProduct(product, brandSlug) {
  const rules = getRulesForBrand(brandSlug || product.brand);
  const evidence = [];
  let confidence = CONFIDENCE.HIGH;

  // ── Brand / manufacturer ────────────────────────────────────────────────────
  const brand = (product.brand || "").trim();
  const manufacturerKey = rules ? rules.displayName : brand || null;
  const hasRules = !!rules;

  if (!brand) {
    evidence.push({ field: "brand", issue: "missing brand", impact: -0.30 });
    confidence += -0.30;
  } else if (!hasRules) {
    evidence.push({ field: "brand", issue: `no rules registered for brand "${brand}"`, impact: -0.15 });
    confidence += -0.15;
  } else {
    evidence.push({ field: "brand", source: "rules_registry", value: manufacturerKey });
  }

  // ── Product type ────────────────────────────────────────────────────────────
  const { productType, typeEvidence, technology } = detectProductType(product, rules);
  evidence.push({ field: "productType", source: typeEvidence, value: productType });

  // ── Shade code ──────────────────────────────────────────────────────────────
  let shadeResult = null;
  let shadeConfidenceImpact = 0;

  if (product.shade) {
    shadeResult = parseShadeCode(product.shade, rules, { productLine: product.series });
    if (shadeResult) {
      evidence.push({
        field: "shade",
        source: shadeResult.ruleId
          ? `line_scoped_rule:${shadeResult.ruleId}`
          : `pattern:${shadeResult.patternName}`,
        value: shadeResult.shadeCodeNormalized,
        rulesVersion: shadeResult.ruleVersion,
        evidenceSources: shadeResult.evidenceSources,
        metadata: shadeResult.metadata,
      });
    } else {
      // Try named tone classification
      const namedResult = parseNamedTone(product.shade);
      if (namedResult) {
        shadeResult = {
          shadeCodeRaw:        product.shade,
          shadeCodeNormalized: product.shade.toUpperCase(),
          patternName:         "named_tone",
          shadeSystem:         "named",
          level:               namedResult.level,
          primaryTone:         namedResult.primaryTone,
          primaryToneLabel:    namedResult.primaryTone,
          secondaryTone:       null,
          secondaryToneLabel:  null,
          toneFamily:          namedResult.toneFamily,
        };
        evidence.push({ field: "shade", source: `named_tone:${namedResult.matched}`, value: product.shade });
        shadeConfidenceImpact = namedResult.matched === "exact" ? 0 : -0.05;
      } else {
        evidence.push({ field: "shade", issue: `unparseable shade code "${product.shade}"`, impact: -0.10 });
        shadeConfidenceImpact = -0.10;
      }
    }
  } else if (isShadeBearingProductType(productType)) {
    evidence.push({ field: "shade", issue: "missing shade for color product", impact: -0.15 });
    shadeConfidenceImpact = -0.15;
  }
  confidence += shadeConfidenceImpact;

  // ── Product line / series ───────────────────────────────────────────────────
  const series = (product.series || "").trim();
  if (series) {
    evidence.push({ field: "productLine", source: "catalog_series", value: series });
  } else {
    evidence.push({ field: "productLine", issue: "missing series", impact: -0.05 });
    confidence += -0.05;
  }

  // ── Family candidate ────────────────────────────────────────────────────────
  const { familyCandidate, familyEvidence } = extractFamilyCandidate(product, rules);
  evidence.push({ field: "productFamily", source: familyEvidence, value: familyCandidate });

  // ── Package extraction ──────────────────────────────────────────────────────
  const { packageSize, packageUnit, evidence: pkgEvidence } = extractPackageSize(product);
  if (packageSize) {
    evidence.push({ field: "packageSize", source: pkgEvidence, value: `${packageSize}${packageUnit}` });
  } else {
    evidence.push({ field: "packageSize", issue: "packageSize not found", impact: -0.03 });
    confidence += -0.03;
  }

  // ── Barcode / catalog number ────────────────────────────────────────────────
  const barcode = product.barcode || (product.barcodes && product.barcodes[0]) || null;
  const catalogNumber = product.catalogNo || null;

  if (barcode) {
    evidence.push({ field: "barcode", source: "catalog_field", value: barcode });
  }
  if (catalogNumber) {
    evidence.push({ field: "catalogNumber", source: "catalog_field", value: catalogNumber });
  }

  // Having barcode or catalogNumber increases confidence in exact identity
  if (barcode || catalogNumber) {
    confidence = Math.min(confidence + 0.02, 1.0);
  }

  // ── Final confidence clamp ──────────────────────────────────────────────────
  confidence = Math.max(0, Math.min(1, confidence));
  const band = confidenceBand(confidence);

  // ── Cross-brand tonal similarity (output only, never triggers SKU merge) ───
  // This field is informational only. It must never be used for same_commercial_sku matching.
  const shadeBearing = isShadeBearingProductType(productType);
  const tonalClassificationEligible = isTonalClassificationEligibleProductType(productType);

  const tonalProfile = (shadeResult && shadeResult.level !== null && tonalClassificationEligible) ? {
    level:           shadeResult.level,
    primaryTone:     shadeResult.primaryTone,
    primaryToneLabel: shadeResult.primaryToneLabel,
    secondaryTone:   shadeResult.secondaryTone,
    toneFamily:      shadeResult.toneFamily,
    manufacturerSpecific: true,  // always true — different brands have different meanings
  } : null;

  return {
    // Source reference
    sourceId:              product.id,
    sourceBrandSlug:       brandSlug,
    rulesVersion:          RULES_VERSION,

    // Classification output
    manufacturer:          brand || null,
    manufacturerKey,
    brand:                 brand || null,
    productLine:           series || null,
    productFamily:         familyCandidate,
    productType,
    shadeBearing,
    tonalClassificationEligible,
    technology:            technology || null,
    intendedUse:           "professional",

    // Shade
    shadeCodeRaw:          shadeResult?.shadeCodeRaw ?? (product.shade || null),
    shadeCodeNormalized:   shadeResult?.shadeCodeNormalized ?? null,
    shadeSystem:           shadeResult?.shadeSystem ?? null,
    level:                 shadeResult?.level ?? null,
    primaryTone:           shadeResult?.primaryTone ?? null,
    primaryToneLabel:      shadeResult?.primaryToneLabel ?? null,
    secondaryTone:         shadeResult?.secondaryTone ?? null,
    secondaryToneLabel:    shadeResult?.secondaryToneLabel ?? null,
    toneFamily:            shadeResult?.toneFamily ?? null,
    shadeRuleId:           shadeResult?.ruleId ?? null,
    shadeRuleVersion:      shadeResult?.ruleVersion ?? null,
    shadeRuleEvidenceSources: shadeResult?.evidenceSources ?? null,
    shadeMetadata:         shadeResult?.metadata ?? null,

    // Package
    packageSize,
    packageUnit,
    packageCount:          null,   // not in catalog source

    // Identity
    barcode:               barcode || null,
    catalogNumber:         catalogNumber || null,
    region:                null,   // not in catalog source

    // Confidence + evidence
    confidence:            parseFloat(confidence.toFixed(4)),
    confidenceBand:        band,
    evidence,

    // Cross-brand profile (INFORMATIONAL ONLY — never triggers SKU merge)
    tonalProfile,

    // Flag / status
    catalogFlag:           product.flag ?? 0,
    active:                (product.flag ?? 0) === 0,
  };
}

// ── Confidence band utilities ────────────────────────────────────────────────

/**
 * Given a list of classifications, return counts per confidence band.
 */
function summarizeConfidenceBands(classifications) {
  const counts = { automatic: 0, review: 0, unresolved: 0 };
  for (const c of classifications) {
    counts[c.confidenceBand] = (counts[c.confidenceBand] || 0) + 1;
  }
  return counts;
}

// ── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  classifyProduct,
  parseShadeCode,
  parseNamedTone,
  extractPackageSize,
  detectProductType,
  extractFamilyCandidate,
  summarizeConfidenceBands,
  confidenceBand,
  CONFIDENCE,
  BAND_THRESHOLDS,
  SHADE_BEARING_PRODUCT_TYPES,
  TONAL_CLASSIFICATION_ELIGIBLE_PRODUCT_TYPES,
  isShadeBearingProductType,
  isTonalClassificationEligibleProductType,
  NAMED_TONE_MAP,
};
