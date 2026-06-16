/**
 * scripts/lib/beauty-intelligence/classification-engine.js
 * ──────────────────────────────────────────────────────────────────────
 * Six-layer shade classification engine.
 *
 * Layer 1: Product Type
 * Layer 2: Color Family
 * Layer 3: Level (1-12)
 * Layer 4: Reflection (primary + secondary)
 * Layer 5: Service Context
 * Layer 6: Market Category
 *
 * Respects brand-specific shade notations:
 *   L'Oréal: dot  (10.12)
 *   Wella:   slash (10/16)
 *   Schwarzkopf: dash (10-1)
 *   Redken:  alpha suffix (10NA)
 */

"use strict";

const {
  BRAND_DICTIONARY,
  REFLECTIONS,
  WELLA_REFLECTIONS,
  SKP_REFLECTIONS,
  REDKEN_SUFFIXES,
  LEVEL_NAMES,
  COLOR_FAMILIES,
  MARKET_CATEGORIES,
  normalizeBrandKey,
  getReflectionSystem,
} = require("./brand-dictionary");

// ── Developer / oxidant detection ────────────────────────────────────────────

const DEVELOPER_PATTERNS = [
  /\bv[oó]l\.?\s*\d+\b/i,
  /\b\d+\s*vol\.?\b/i,
  /\b\d+[.,]\d+\s*%/,
  /\boxid/i,
  /\bdevel/i,
  /\boxyg/i,
  /\bactivat/i,
  /\bdiactivat/i,
  /\b(3|6|9|12)\s*%\b/,
  /^ox\s/i,
];

const LIGHTENER_PATTERNS = [
  /\bbleach\b/i,
  /\blighten/i,
  /\bblond[e]?\b/i,
  /\bblondme\b/i,
  /\bblond\s*me\b/i,
  /\bdecol[o]?r/i,
  /\bpoudre\b/i,
  /\bsolaris\b/i,
  /\bblondor\b/i,
  /\b(blond\s*studio|bs\s*bleach)\b/i,
];

const BOND_BUILDER_PATTERNS = [
  /\bolaplex\b/i,
  /\bbond\s*(builder|multiplier|perfector)\b/i,
  /\bfibre\s*bond\b/i,
];

const TREATMENT_PATTERNS = [
  /\bshampoo\b/i,
  /\bconditioner\b/i,
  /\btreatment\b/i,
  /\bmask\b/i,
  /\bserum\b/i,
  /\bkera\b/i,
  /\bkeratin\b/i,
  /\bx-tenso\b/i,
  /\bstraight\b/i,
  /\bsmooth\b/i,
];

const CORRECTOR_PATTERNS = [
  /\bbooster\b/i,
  /\bcorrector\b/i,
  /\bmixer\b/i,
  /\bclear\b/i,
  /\bneutral\b/i,
  /\bneutraliz/i,
  /\befassor\b/i,
  /\bremover\b/i,
  /\bgloss\s*clear\b/i,
];

// ── Classify product type from raw data ──────────────────────────────────────

function classifyProductType(rawType, shade, brand, series) {
  const combined = `${rawType||""} ${shade||""} ${series||""}`.toLowerCase();

  if (DEVELOPER_PATTERNS.some(p => p.test(combined))) return "developer";
  if (LIGHTENER_PATTERNS.some(p => p.test(combined)))  return "lightener";
  if (BOND_BUILDER_PATTERNS.some(p => p.test(combined))) return "bond_builder";
  if (TREATMENT_PATTERNS.some(p => p.test(combined)))  return "treatment_care";
  if (CORRECTOR_PATTERNS.some(p => p.test(combined)))  return "corrector_mixer";

  // Use series knowledge
  const bKey = normalizeBrandKey(brand);
  const bDef = BRAND_DICTIONARY[bKey];
  if (bDef && bDef.series) {
    const seriesKey = String(series || "").toUpperCase().trim();
    const seriesDef = bDef.series[seriesKey];
    if (seriesDef) {
      const pt = seriesDef.productType;
      if (pt === "developer") return "developer";
      if (pt === "lightener") return "lightener";
      if (pt === "corrector_mixer") return "corrector_mixer";
      if (pt === "bond_builder") return "bond_builder";
      if (pt === "treatment_care") return "treatment_care";
      if (pt === "acidic_toner") return "toner";
      if (pt === "demi_permanent") return "demi_permanent";
      if (pt === "permanent_color") return "permanent_color";
      if (pt === "direct_dye") return "direct_dye";
      if (pt === "toner") return "toner";
    }
  }

  // Fall back: if shade looks like a hair color shade code
  const shadeCode = String(shade || "").trim();
  if (/^(cc)?\d{1,2}[.\-\/]?\d{0,2}/i.test(shadeCode) || /^\d{1,2}$/.test(shadeCode)) {
    return "permanent_color";
  }

  return "unknown";
}

// ── Parse level and reflection from shade code ───────────────────────────────

/**
 * Parses shade code using brand-aware notation.
 * Returns { level, reflectionPrimary, reflectionSecondary, isCC }
 */
function parseShadeCode(shade, rawBrand) {
  const bKey = normalizeBrandKey(rawBrand);
  const refSystem = getReflectionSystem(rawBrand);
  const s = String(shade || "").trim();

  // CC (Cool Cover) prefix: CC6.17 → level=6, ref1=1(Ash), ref2=7(Green/Matte)
  const ccMatch = s.match(/^CC(\d{1,2})[.\-/]?(\d)?(\d)?/i);
  if (ccMatch) {
    const level = parseInt(ccMatch[1], 10);
    const r1 = ccMatch[2] ? refSystem[ccMatch[2]] : null;
    const r2 = ccMatch[3] ? refSystem[ccMatch[3]] : null;
    return { level, reflectionPrimary: r1?.label || "Cool", reflectionSecondary: r2?.label || null, isCC: true, familyKey: r1?.family || "blonde" };
  }

  // Wella / Matrix / SKP: slash notation  10/16 or 10-1 or 10.1
  const separators = s.match(/^(\d{1,2}(?:[/]?\d{1,2})?)\s*[.\-\/]\s*(\d{1,2})(?:[.\-\/](\d))?/);
  if (separators) {
    const level = parseInt(separators[1].replace(/[^0-9]/, ""), 10);
    const ref1 = separators[2].length === 2 ? separators[2][0] : separators[2];
    const ref2 = separators[2].length === 2 ? separators[2][1] : (separators[3] || null);
    const r1 = refSystem[ref1];
    const r2 = ref2 ? refSystem[ref2] : null;
    return {
      level,
      reflectionPrimary: r1?.label || `Reflect ${ref1}`,
      reflectionSecondary: r2?.label || null,
      isCC: false,
      familyKey: r1?.family || "natural",
    };
  }

  // Pure level only (e.g. "6", "10", "4")
  const levelOnly = s.match(/^(\d{1,2})$/);
  if (levelOnly) {
    const level = parseInt(levelOnly[1], 10);
    return { level, reflectionPrimary: "Natural", reflectionSecondary: null, isCC: false, familyKey: "natural" };
  }

  // Fractional level e.g. "10 1/2.1"
  const fracMatch = s.match(/^(\d+)\s+1\/2[.\s]?(\d)?/);
  if (fracMatch) {
    const level = parseFloat(fracMatch[1]) + 0.5;
    const r1 = fracMatch[2] ? refSystem[fracMatch[2]] : null;
    return { level, reflectionPrimary: r1?.label || "Natural", reflectionSecondary: null, isCC: false, familyKey: r1?.family || "natural" };
  }

  // Redken alpha suffix  8MO  6CR  10NA
  if (bKey === "REDKEN") {
    const redkenMatch = s.match(/^(\d{1,2})\s*([A-Z]{1,3})$/i);
    if (redkenMatch) {
      const level = parseInt(redkenMatch[1], 10);
      const suffix = redkenMatch[2].toUpperCase();
      const refLabel = REDKEN_SUFFIXES[suffix] || suffix;
      const familyKey = deriveFamilyFromRedkenSuffix(suffix);
      return { level, reflectionPrimary: refLabel, reflectionSecondary: null, isCC: false, familyKey };
    }
  }

  return { level: null, reflectionPrimary: null, reflectionSecondary: null, isCC: false, familyKey: null };
}

function deriveFamilyFromRedkenSuffix(suffix) {
  const map = {
    "N":"natural","NW":"natural","NA":"natural","NP":"natural",
    "A":"blonde","AA":"blonde","B":"blonde","P":"blonde","T":"blonde",
    "G":"blonde","GR":"copper","W":"blonde","BO":"blonde",
    "C":"copper","CR":"copper","R":"red","RR":"red","RO":"red",
    "V":"mahogany","MO":"brunette","CH":"brunette","BR":"brunette",
  };
  return map[suffix] || "natural";
}

// ── Resolve market category ───────────────────────────────────────────────────

function resolveMarketCategory(level, reflectionPrimary, productType, seriesKnowledge) {
  if (productType === "developer" || productType === "lightener" || productType === "bond_builder") return null;
  if (productType === "corrector_mixer" || productType === "treatment_care") return null;

  // Series-level override first
  if (seriesKnowledge && seriesKnowledge.primaryMarketCategory) {
    const cat = seriesKnowledge.primaryMarketCategory;
    // Use series hint but refine by level/reflection if possible
    if (level !== null && level >= 9) {
      const ref = String(reflectionPrimary || "").toLowerCase();
      if (ref.includes("ash") || ref.includes("pearl") || ref.includes("irid") || ref.includes("cendre")) return "Cool Blonde";
      if (ref.includes("beige")) return "Beige Blonde";
      if (ref.includes("gold") || ref.includes("warm")) return "Warm Blonde";
      if (ref.includes("natural") || ref.includes("neutral")) return "Natural Blonde";
      if (level >= 11) return "High Lift Blonde";
      return "Natural Blonde";
    }
    return cat;
  }

  if (level === null) return null;

  // High lift
  if (level >= 11) return "High Lift Blonde";

  // Blonde levels 8-10
  if (level >= 8) {
    const ref = String(reflectionPrimary || "").toLowerCase();
    if (ref.includes("ash") || ref.includes("pearl") || ref.includes("irid") || ref.includes("cendre")) return "Cool Blonde";
    if (ref.includes("beige")) return "Beige Blonde";
    if (ref.includes("gold") || ref.includes("copper") || ref.includes("warm")) return "Warm Blonde";
    if (ref.includes("violet") || ref.includes("purple")) return "Violet";
    return "Natural Blonde";
  }

  // Dark blonde 6-7
  if (level >= 6) {
    const ref = String(reflectionPrimary || "").toLowerCase();
    if (ref.includes("ash") || ref.includes("cool")) return "Cool Brunette";
    if (ref.includes("copper")) return "Copper";
    if (ref.includes("red") || ref.includes("scar")) return "Red";
    if (ref.includes("maho") || ref.includes("violet")) return "Mahogany";
    return "Warm Brunette";
  }

  // Brown levels 3-5
  if (level >= 3) {
    const ref = String(reflectionPrimary || "").toLowerCase();
    if (ref.includes("natural") || ref.includes("ash")) {
      if (productType === "permanent_color" || productType === "demi_permanent") return "Grey Coverage";
      return "Cool Brunette";
    }
    if (ref.includes("copper")) return "Copper";
    if (ref.includes("red") || ref.includes("scar")) return "Red";
    if (ref.includes("maho")) return "Mahogany";
    if (ref.includes("gold") || ref.includes("warm") || ref.includes("choc")) return "Chocolate Brown";
    return "Grey Coverage";
  }

  // Very dark 1-2
  return "Grey Coverage";
}

// ── Resolve service contexts ─────────────────────────────────────────────────

function resolveServiceContexts(productType, level, reflectionPrimary, topServices, seriesKnowledge) {
  // Non-color products have no service context
  if (["developer","lightener","bond_builder","treatment_care","corrector_mixer"].includes(productType)) return [];

  const contexts = new Set();

  // From actual observed service data
  if (topServices && topServices.length > 0) {
    const nameMap = {
      "root color":             "Root Coverage",
      "root coverage":          "Root Coverage",
      "full head color":        "Global Color",
      "full head highlights":   "Highlights",
      "half head highlights":   "Highlights",
      "highlights":             "Highlights",
      "toner for highlights":   "Toning",
      "toner":                  "Toning",
      "color lengths":          "Global Color",
      "ombre":                  "Balayage",
      "balyage":                "Balayage",
      "balayage":               "Balayage",
      "gloss":                  "Gloss Service",
      "correction":             "Color Correction",
    };
    for (const svc of topServices) {
      const n = String(svc.name || "").toLowerCase();
      for (const [k, v] of Object.entries(nameMap)) {
        if (n.includes(k)) { contexts.add(v); break; }
      }
    }
  }

  // Series knowledge override
  if (seriesKnowledge && seriesKnowledge.commonServices) {
    for (const s of seriesKnowledge.commonServices) contexts.add(s);
  }

  // Level-based inference
  if (level !== null) {
    if (level >= 9) { contexts.add("Toning"); contexts.add("Highlights"); }
    if (level <= 6 && level >= 1) contexts.add("Root Coverage");
    if (level >= 3 && level <= 6) contexts.add("Grey Coverage");
  }

  return [...contexts].slice(0, 5);
}

// ── Classify a single entry ───────────────────────────────────────────────────

/**
 * @param {Object} entry – entry from pol-shade-map.json
 * @returns {Object} classification
 */
function classifyEntry(entry) {
  const { brand, series, shade, productType: rawPT, topServices } = entry;

  const bKey = normalizeBrandKey(brand);
  const bDef = BRAND_DICTIONARY[bKey];
  const seriesKnowledge = (() => {
    if (!bDef) return null;
    const sk = String(series || "").toUpperCase().trim();
    return bDef.series[sk] || null;
  })();

  const productType = classifyProductType(rawPT, shade, brand, series);
  const isDeveloper = productType === "developer";
  const isLightener = productType === "lightener";
  const isNonColor = ["developer","lightener","bond_builder","treatment_care","corrector_mixer"].includes(productType);

  if (isNonColor) {
    return {
      productType,
      productTypeLabel: labelForProductType(productType),
      isDeveloper,
      isLightener,
      isColorShade: false,
      level: null,
      reflectionPrimary: null,
      reflectionSecondary: null,
      colorFamily: null,
      colorFamilyDot: null,
      marketCategory: null,
      serviceContexts: [],
      seriesDescription: seriesKnowledge?.description || null,
    };
  }

  const parsed = parseShadeCode(shade, brand);
  const { level, reflectionPrimary, reflectionSecondary, familyKey, isCC } = parsed;

  const family = familyKey ? COLOR_FAMILIES[familyKey] : null;
  const marketCategory = resolveMarketCategory(level, reflectionPrimary, productType, seriesKnowledge);
  const serviceContexts = resolveServiceContexts(productType, level, reflectionPrimary, topServices, seriesKnowledge);

  const levelName = level ? LEVEL_NAMES[Math.round(level)] || null : null;

  return {
    productType,
    productTypeLabel: labelForProductType(productType),
    isDeveloper: false,
    isLightener: false,
    isColorShade: true,
    level,
    levelName,
    reflectionPrimary,
    reflectionSecondary,
    isCC,
    colorFamily: family?.label || null,
    colorFamilyDot: family?.dot || null,
    marketCategory,
    serviceContexts,
    seriesDescription: seriesKnowledge?.description || null,
    seriesDisplayName: seriesKnowledge?.displayName || null,
    officialUrl: seriesKnowledge?.officialUrl || null,
  };
}

function labelForProductType(pt) {
  const map = {
    permanent_color: "Permanent Color",
    demi_permanent: "Demi Permanent",
    toner: "Toner",
    acidic_toner: "Acidic Toner / Gloss",
    lightener: "Lightener / Bleach",
    developer: "Developer / Oxidant",
    corrector_mixer: "Corrector / Mixer",
    direct_dye: "Direct Dye / Fashion",
    bond_builder: "Bond Builder",
    treatment_care: "Treatment / Care",
    unknown: "Unknown",
  };
  return map[pt] || pt;
}

module.exports = {
  classifyProductType,
  parseShadeCode,
  resolveMarketCategory,
  resolveServiceContexts,
  classifyEntry,
  labelForProductType,
};
