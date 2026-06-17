/**
 * scripts/lib/m5-classification/manufacturer-rules.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Versioned manufacturer rule registry for deterministic catalog classification.
 *
 * Rules are stored as data, not hard-coded conditionals.  Every manufacturer
 * entry can differ in:
 *   - shade code format and separator (dot / slash / dash / alpha-suffix)
 *   - level/reflection mapping (numeric codes mean different things per brand)
 *   - special series rules (lighteners, developers, bond builders, etc.)
 *   - package conventions
 *   - known exceptions
 *
 * SAFETY INVARIANT: no two different manufacturers share an identity namespace.
 * A rule match for manufacturer A can never produce a `same_commercial_sku`
 * result for manufacturer B.
 *
 * Supported manufacturer brand keys (upper-cased, as they appear in catalog):
 *   L'OREAL PROFESSIONNEL, WELLA PROFESSIONALS, SCHWARZKOPF, GOLDWELL,
 *   REDKEN, MATRIX, AVEDA, MILBON <JP>, GOLDWELL <JP> ...
 */

"use strict";

const RULES_VERSION = "1.1.0";

// ── Shade separator types ─────────────────────────────────────────────────────

const SHADE_SYSTEMS = {
  DOT:    "dot",     // L'Oréal:      8.3  or  8.03
  SLASH:  "slash",   // Wella:         8/3  or  8/03
  DASH:   "dash",    // Schwarzkopf:  8-3  or  8-03
  ALPHA:  "alpha",   // Redken:        8G   or  8GB  or  8NA
  NAMED:  "named",   // Named shades: "Natural Gold", "Warm Beige"
  MIXED:  "mixed",   // Multiple systems within same brand
};

// ── Standard reflection map (ICI / generic) ───────────────────────────────────
// Used as fallback when no brand-specific map is defined.

const STANDARD_REFLECTIONS = {
  "0":  { label: "Natural",            toneFamily: "natural"  },
  "00": { label: "Extra Natural",      toneFamily: "natural"  },
  "1":  { label: "Ash",                toneFamily: "cool"     },
  "2":  { label: "Iridescent/Violet",  toneFamily: "violet"   },
  "3":  { label: "Gold",               toneFamily: "warm"     },
  "4":  { label: "Copper",             toneFamily: "warm"     },
  "5":  { label: "Mahogany",           toneFamily: "mahogany" },
  "6":  { label: "Red",                toneFamily: "warm"     },
  "7":  { label: "Green/Matte",        toneFamily: "neutral"  },
  "8":  { label: "Mocha",              toneFamily: "warm"     },
  "9":  { label: "Pearl",              toneFamily: "cool"     },
};

// ── Per-manufacturer reflection overrides ────────────────────────────────────

const WELLA_REFLECTIONS = {
  "0": { label: "Natural",       toneFamily: "natural"  },
  "1": { label: "Ash",           toneFamily: "cool"     },
  "2": { label: "Matte/Green",   toneFamily: "neutral"  },
  "3": { label: "Gold",          toneFamily: "warm"     },
  "4": { label: "Red/Warm",      toneFamily: "warm"     },
  "5": { label: "Mahogany",      toneFamily: "mahogany" },
  "6": { label: "Violet",        toneFamily: "violet"   },
  "7": { label: "Brown",         toneFamily: "neutral"  },
  "8": { label: "Pearl",         toneFamily: "cool"     },
  "9": { label: "Cendre",        toneFamily: "cool"     },
};

const WELLA_COLOR_CHARM_ALPHA_REFLECTIONS = {
  A:   { label: "Ash", toneFamily: "cool" },
  AA:  { label: "Intense Ash", toneFamily: "cool" },
  BBL: { label: "Intense Blue Black", toneFamily: "cool" },
  C:   { label: "Cool", toneFamily: "cool" },
  CB:  { label: "Cool Blonde", toneFamily: "cool" },
  G:   { label: "Gold", toneFamily: "warm" },
  GV:  { label: "Gold Violet", toneFamily: "violet" },
  N:   { label: "Natural", toneFamily: "natural" },
  NA:  { label: "Natural Ash", toneFamily: "cool" },
  NG:  { label: "Natural Gold", toneFamily: "warm" },
  NN:  { label: "Intense Natural", toneFamily: "natural" },
  NW:  { label: "Natural Warm", toneFamily: "natural" },
  R:   { label: "Red", toneFamily: "warm" },
  RG:  { label: "Red Gold", toneFamily: "warm" },
  RR:  { label: "Intense Red", toneFamily: "warm" },
  RV:  { label: "Red Violet", toneFamily: "violet" },
  V:   { label: "Violet", toneFamily: "violet" },
  VV:  { label: "Intense Violet", toneFamily: "violet" },
  W:   { label: "Warm", toneFamily: "warm" },
  WG:  { label: "Warm Gold", toneFamily: "warm" },
  WR:  { label: "Warm Red", toneFamily: "warm" },
  WV:  { label: "Warm Violet", toneFamily: "violet" },
};

const OFFICIAL_WELLA_SOURCES = {
  COLOR_CHARM_PERMANENT: {
    title: "Wella Color Charm Permanent",
    url: "https://www.wella.com/professional/m/_enus/products/color_charm/pdf/WCC_ALL_Shades_Toners.pdf",
    sourceType: "official",
    region: "US",
  },
  COLOR_CHARM_EDUCATION: {
    title: "WCC Education Book-English",
    url: "https://www.wella.com/professional/m/pdf/WCC_Education_Book-English.pdf",
    sourceType: "official",
    region: "US, 2017 workbook",
  },
  COLOR_CHARM_DEMI: {
    title: "Wella colorcharm Demi-Permanent User Guide",
    url: "https://www.wella.com/professional/m/pdf/Wella_colorcharm_Demi-Permanent_User_Guide.pdf",
    sourceType: "official",
    region: "US",
  },
  KOLESTON_USAGE: {
    title: "Koleston Perfect usage booklet",
    url: "https://www.wella.com/professional/m/_master/products/koleston_perfect/pdfs/koleston-perfect_usagebooklet.pdf",
    sourceType: "official",
    region: "global/master",
  },
  KOLESTON_LEAFLET: {
    title: "Koleston Perfect leaflet",
    url: "https://www.wella.com/professional/m/Shadechart_LP/Wella-Professionals_Koleston-Perfect_Leaflet.pdf",
    sourceType: "official",
    region: "global/master",
  },
  COLOR_TOUCH_2017: {
    title: "Color Touch PDF",
    url: "https://www.wella.com/professional/m/CT_OP_2017.pdf",
    sourceType: "official",
    region: "global, 2017",
  },
  COLOR_TOUCH_LEAFLET: {
    title: "Color Touch Leaflet",
    url: "https://www.wella.com/professional/m/Shadechart_LP/Wella-Professionals_Color-Touch_Leaflet.pdf",
    sourceType: "official",
    region: "global/master",
  },
  COLOR_TOUCH_TECHNICAL: {
    title: "Color Touch Technical Folder",
    url: "https://www.wella.com/professional/m/_master/products/color_touch_NEW/PDFs/Wella_Color_Touch_Technical_Folder.pdf",
    sourceType: "official",
    region: "global/master",
  },
};

const WELLA_LINE_SCOPED_RULES = [
  {
    id: "wella_color_charm_permanent_alpha",
    rulesVersion: RULES_VERSION,
    exactProductLines: ["CHARM COLOR PERMANENT LIQUID COLOR"],
    productType: "permanent_color",
    shadeParser: "color_charm_alpha",
    reflectionMap: WELLA_COLOR_CHARM_ALPHA_REFLECTIONS,
    evidenceSources: [
      OFFICIAL_WELLA_SOURCES.COLOR_CHARM_PERMANENT,
      OFFICIAL_WELLA_SOURCES.COLOR_CHARM_EDUCATION,
    ],
  },
  {
    id: "wella_koleston_perfect_slash_variants",
    rulesVersion: RULES_VERSION,
    exactProductLines: ["KOLESTONE", "KOLESTON PERFECT"],
    productType: "permanent_color",
    shadeParser: "koleston_slash_variants",
    reflectionMap: WELLA_REFLECTIONS,
    evidenceSources: [
      OFFICIAL_WELLA_SOURCES.KOLESTON_USAGE,
      OFFICIAL_WELLA_SOURCES.KOLESTON_LEAFLET,
    ],
  },
  {
    id: "wella_color_touch_variants",
    rulesVersion: RULES_VERSION,
    exactProductLines: ["COLOR TOUCH", "COLOR TOUCH PLUS"],
    productType: "demi_permanent",
    shadeParser: "color_touch_variants",
    reflectionMap: WELLA_REFLECTIONS,
    evidenceSources: [
      OFFICIAL_WELLA_SOURCES.COLOR_TOUCH_2017,
      OFFICIAL_WELLA_SOURCES.COLOR_TOUCH_LEAFLET,
      OFFICIAL_WELLA_SOURCES.COLOR_TOUCH_TECHNICAL,
    ],
  },
  {
    id: "wella_color_charm_demi_alpha",
    rulesVersion: RULES_VERSION,
    exactProductLines: ["CHARM COLOR DEMI"],
    productType: "demi_permanent",
    shadeParser: "color_charm_alpha",
    reflectionMap: WELLA_COLOR_CHARM_ALPHA_REFLECTIONS,
    evidenceSources: [
      OFFICIAL_WELLA_SOURCES.COLOR_CHARM_DEMI,
      OFFICIAL_WELLA_SOURCES.COLOR_CHARM_EDUCATION,
    ],
  },
];

const SKP_REFLECTIONS = {
  "0": { label: "Natural",            toneFamily: "natural"  },
  "1": { label: "Ash/Cool",           toneFamily: "cool"     },
  "2": { label: "Ash Cool",           toneFamily: "cool"     },
  "3": { label: "Gold",               toneFamily: "warm"     },
  "4": { label: "Beige/Copper",       toneFamily: "warm"     },
  "5": { label: "Gold Mahogany",      toneFamily: "mahogany" },
  "6": { label: "Scarlet/Vibrant Red",toneFamily: "warm"     },
  "7": { label: "Russet/Brunette",    toneFamily: "neutral"  },
  "8": { label: "Pearl/Silver",       toneFamily: "cool"     },
  "9": { label: "Violet",             toneFamily: "violet"   },
};

const GOLDWELL_REFLECTIONS = {
  "0": { label: "Natural",     toneFamily: "natural" },
  "1": { label: "Ash",         toneFamily: "cool"    },
  "2": { label: "Iridescent",  toneFamily: "violet"  },
  "3": { label: "Gold",        toneFamily: "warm"    },
  "4": { label: "Copper",      toneFamily: "warm"    },
  "5": { label: "Mahogany",    toneFamily: "mahogany"},
  "6": { label: "Red",         toneFamily: "warm"    },
  "7": { label: "Bronze",      toneFamily: "warm"    },
  "8": { label: "Beige",       toneFamily: "cool"    },
  "9": { label: "Pearl",       toneFamily: "cool"    },
  "@": { label: "Mix Shade",   toneFamily: null       },
  "A": { label: "Ash",         toneFamily: "cool"    },
  "B": { label: "Beige",       toneFamily: "cool"    },
  "K": { label: "Copper",      toneFamily: "warm"    },
  "BK":{ label: "Beige Copper",toneFamily: "warm"    },
  "KK":{ label: "Copper Copper",toneFamily: "warm"   },
  "R": { label: "Red",         toneFamily: "warm"    },
  "RR":{ label: "Intense Red", toneFamily: "warm"    },
  "SB":{ label: "Silver Brown",toneFamily: "cool"    },
  "N": { label: "Natural",     toneFamily: "natural" },
  "NN":{ label: "Extra Natural",toneFamily: "natural"},
  "G": { label: "Gold",        toneFamily: "warm"    },
  "GB":{ label: "Gold Beige",  toneFamily: "warm"    },
  "BS":{ label: "Brown Silver",toneFamily: "cool"    },
  "V": { label: "Violet",      toneFamily: "violet"  },
};

const REDKEN_SUFFIXES = {
  "N":"Natural","NW":"Natural Warm","NA":"Natural Ash","NP":"Natural Pale",
  "A":"Ash","AA":"Deep Ash","B":"Beige","BR":"Brown","C":"Copper",
  "CR":"Copper Red","G":"Gold","GR":"Gold Red","MO":"Mocha",
  "R":"Red","RR":"Intense Red","V":"Violet","RO":"Rose","BO":"Boho",
  "P":"Pearl","W":"Warm","T":"Titanium","CH":"Chocolate",
};

// ── Shade code patterns ──────────────────────────────────────────────────────
// Each pattern: { name, regex, shadeSystem, extractLevel, extractTones }
// Patterns are tried in order; first match wins.

const SHADE_CODE_PATTERNS = {
  // L'Oréal-style: 8.3, 8.03, 10.12, 1.0, 10.
  LOREAL_DOT: {
    name: "loreal_dot",
    // level (1-12) + dot + reflection(s) (optional leading 0)
    regex: /^(\d{1,2})\.(\d{0,2})$/,
    shadeSystem: SHADE_SYSTEMS.DOT,
    separator: ".",
  },
  // Wella-style: 8/3, 8/03, 10/16, /05 (no level = lightener)
  WELLA_SLASH: {
    name: "wella_slash",
    regex: /^(\d{0,2})\/(\d{1,2})$/,
    shadeSystem: SHADE_SYSTEMS.SLASH,
    separator: "/",
  },
  // Schwarzkopf-style: 8-3, 8-03, 10-1, 0-00
  SKP_DASH: {
    name: "skp_dash",
    regex: /^(\d{1,2})-(\d{0,2})$/,
    shadeSystem: SHADE_SYSTEMS.DASH,
    separator: "-",
  },
  // Goldwell Alpha: 8GB, 8G, 8A, 8NN, 8@, 8N
  GOLDWELL_ALPHA: {
    name: "goldwell_alpha",
    regex: /^(\d{1,2})([A-Z@]{1,3})$/,
    shadeSystem: SHADE_SYSTEMS.ALPHA,
    separator: null,
  },
  // Redken numeric-alpha suffix: 8N, 8NA, 8NW, 8G, 8BR
  REDKEN_ALPHA: {
    name: "redken_alpha",
    regex: /^(\d{1,2})(N|NW|NA|NP|AA|BR|CR|GR|MO|RR|RO|BO|CH|[ABCGPRVWT])$/,
    shadeSystem: SHADE_SYSTEMS.ALPHA,
    separator: null,
  },
  // Generic numeric: single number like "7", "10", "12"
  NUMERIC_ONLY: {
    name: "numeric_only",
    regex: /^(\d{1,2})$/,
    shadeSystem: null,
    separator: null,
  },
};

// ── Manufacturer Rule Registry ───────────────────────────────────────────────

/** @type {Record<string, ManufacturerRule>} */
const MANUFACTURER_RULES = {

  // ─── L'OREAL PROFESSIONNEL ─────────────────────────────────────────────────
  "L'OREAL PROFESSIONNEL": {
    manufacturerId: null,          // populated at runtime from DB
    rulesVersion: RULES_VERSION,
    displayName: "L'Oréal Professionnel",
    country: "France",
    shadeSystem: SHADE_SYSTEMS.DOT,
    shadeCodePatterns: [SHADE_CODE_PATTERNS.LOREAL_DOT, SHADE_CODE_PATTERNS.NUMERIC_ONLY],
    reflectionMap: STANDARD_REFLECTIONS,
    primaryToneSeparator: ".",
    secondaryTonePosition: 2,       // e.g. 8.31 → primary=3, secondary=1
    levelRange: [1, 12],
    productLineRules: {
      "INOA":       { productType: "permanent_color",  technology: "ammonia_free_oil" },
      "NEW INOA":   { productType: "permanent_color",  technology: "ammonia_free_oil", aliasOf: "INOA" },
      "INOA SUPREME": { productType: "permanent_color", technology: "ammonia_free_oil" },
      "MAJIREL":    { productType: "permanent_color",  technology: "incell" },
      "COOL COVER": { productType: "permanent_color",  technology: "incell_cool" },
      "DIA LIGHT":  { productType: "acidic_toner",     technology: "acidic_demi" },
      "DIA COLOR":  { productType: "demi_permanent",   technology: "demi_ammonia_free" },
      "DIA RICHESSE":{ productType: "demi_permanent",  technology: "demi" },
      "LUO COLOR":  { productType: "permanent_color",  technology: "multi_facets" },
      "MAJIREL GLOW": { productType: "permanent_color",technology: "incell_glow" },
      "RICHESSE":   { productType: "demi_permanent",   technology: "demi" },
      "BLOND STUDIO BLEACH": { productType: "lightener", technology: "controlled_decolorization" },
      "DIACTIVATOR":{ productType: "developer",        technology: "acidic_developer" },
      "INOA DEVELOPERS": { productType: "developer",   technology: "oil_developer" },
      "COVER 5":    { productType: "permanent_color",  technology: "rapid_coverage" },
    },
    packageRules: {
      defaultUnit: "g",
      commonSizes: [60, 125, 500, 1000],
    },
    developerOrColorClassification: {
      developerKeywords: ["diactivator", "developer", "oxidant", "vol", "%"],
      lightenerKeywords: ["blond studio", "bleach", "poudre", "powder"],
    },
    knownExceptions: {
      "8.03": { note: "L'Oréal 8.03 = level 8, natural-gold; '03' is a single reflection code, not 0+3" },
      "10.": { note: "Trailing dot indicates level only (Natural shade)" },
    },
  },

  // ─── WELLA PROFESSIONALS ───────────────────────────────────────────────────
  "WELLA PROFESSIONALS": {
    manufacturerId: null,
    rulesVersion: RULES_VERSION,
    displayName: "Wella Professionals",
    country: "Germany",
    shadeSystem: SHADE_SYSTEMS.SLASH,
    shadeCodePatterns: [SHADE_CODE_PATTERNS.WELLA_SLASH, SHADE_CODE_PATTERNS.NUMERIC_ONLY],
    reflectionMap: WELLA_REFLECTIONS,
    primaryToneSeparator: "/",
    secondaryTonePosition: 2,
    levelRange: [1, 12],
    lineScopedShadeRules: WELLA_LINE_SCOPED_RULES,
    productLineRules: {
      "KOLESTON PERFECT": { productType: "permanent_color", technology: "ME+" },
      "COLOR TOUCH":       { productType: "demi_permanent",  technology: "demi_no_ammonia" },
      "ILLUMINA COLOR":    { productType: "permanent_color", technology: "micro_light" },
      "SHINEFINITY":       { productType: "acidic_toner",    technology: "zero_lift_gloss" },
      "BLONDOR":           { productType: "lightener",       technology: "multi_blonde" },
      "WELLOXON PERFECT":  { productType: "developer",       technology: "cream_developer" },
      "MAGMA":             { productType: "lightener",       technology: "bond_lightener" },
    },
    packageRules: {
      defaultUnit: "g",
      commonSizes: [60, 100, 500],
    },
    developerOrColorClassification: {
      developerKeywords: ["welloxon", "developer", "vol", "oxidant", "creme"],
      lightenerKeywords: ["blondor", "magma", "blond me", "blondme", "bleach"],
    },
    knownExceptions: {
      "/05": { note: "Wella /05 = no level (lightener shade), not level 0" },
    },
  },

  // ─── SCHWARZKOPF ──────────────────────────────────────────────────────────
  "SCHWARZKOPF": {
    manufacturerId: null,
    rulesVersion: RULES_VERSION,
    displayName: "Schwarzkopf Professional",
    country: "Germany",
    shadeSystem: SHADE_SYSTEMS.DASH,
    shadeCodePatterns: [SHADE_CODE_PATTERNS.SKP_DASH, SHADE_CODE_PATTERNS.NUMERIC_ONLY],
    reflectionMap: SKP_REFLECTIONS,
    primaryToneSeparator: "-",
    secondaryTonePosition: 2,
    levelRange: [0, 12],
    productLineRules: {
      "IGORA ROYAL":       { productType: "permanent_color", technology: "micro_pigmentation" },
      "IGORA VIBRANCE":    { productType: "demi_permanent",  technology: "oil_rich_demi" },
      "IGORA ROYAL HIGHLIFTS": { productType: "permanent_color", technology: "high_lift_blonde" },
      "BLONDME":           { productType: "lightener",       technology: "bond_enforcing" },
      "COLOR EXPERT":      { productType: "permanent_color", technology: "standard" },
    },
    packageRules: {
      defaultUnit: "g",
      commonSizes: [60, 100, 500, 1000],
    },
    developerOrColorClassification: {
      developerKeywords: ["developer", "oxidant", "vol", "creme", "liter"],
      lightenerKeywords: ["blondme", "bleach", "plex"],
    },
    knownExceptions: {
      "0-00": { note: "Schwarzkopf 0-00 = Special Natural (extra natural mixture shade, not a tint)" },
    },
  },

  // ─── GOLDWELL ─────────────────────────────────────────────────────────────
  "GOLDWELL": {
    manufacturerId: null,
    rulesVersion: RULES_VERSION,
    displayName: "Goldwell",
    country: "Germany",
    shadeSystem: SHADE_SYSTEMS.ALPHA,
    shadeCodePatterns: [SHADE_CODE_PATTERNS.GOLDWELL_ALPHA, SHADE_CODE_PATTERNS.LOREAL_DOT, SHADE_CODE_PATTERNS.NUMERIC_ONLY],
    reflectionMap: GOLDWELL_REFLECTIONS,
    primaryToneSeparator: null,
    secondaryTonePosition: null,
    levelRange: [1, 12],
    productLineRules: {
      "TOPCHIC":           { productType: "permanent_color", technology: "permanent_ammonia" },
      "COLORANCE":         { productType: "demi_permanent",  technology: "acidic_gloss_no_ammonia" },
      "LARESA":            { productType: "permanent_color", technology: "permanent" },
      "ELUMEN":            { productType: "direct_dye",      technology: "direct_bonding_dye" },
      "LIGHTDIMENSIONS":   { productType: "lightener",       technology: "controlled_lightener" },
      "NECTAYA":           { productType: "permanent_color", technology: "ammonia_free" },
    },
    packageRules: {
      defaultUnit: "g",
      commonSizes: [60, 100, 500, 1000],
    },
    developerOrColorClassification: {
      developerKeywords: ["developer", "lotion", "vol", "oxycur", "topchic developer"],
      lightenerKeywords: ["lightdimensions", "bleach", "blonding"],
    },
    knownExceptions: {
      "8GB": { note: "Goldwell 8GB = level 8, Gold-Beige (two-letter suffix indicates compound reflection)" },
      "8@": { note: "Goldwell 8@ = level 8, mix shade (@ is a valid Goldwell shade code component)" },
    },
  },

  // ─── REDKEN ───────────────────────────────────────────────────────────────
  "REDKEN": {
    manufacturerId: null,
    rulesVersion: RULES_VERSION,
    displayName: "Redken",
    country: "USA",
    shadeSystem: SHADE_SYSTEMS.ALPHA,
    shadeCodePatterns: [SHADE_CODE_PATTERNS.REDKEN_ALPHA, SHADE_CODE_PATTERNS.NUMERIC_ONLY],
    reflectionMap: REDKEN_SUFFIXES,
    primaryToneSeparator: null,
    secondaryTonePosition: null,
    levelRange: [1, 10],
    productLineRules: {
      "COLOR FUSION":      { productType: "permanent_color", technology: "permanent_3d" },
      "SHADES EQ":         { productType: "acidic_toner",    technology: "acidic_gloss" },
      "CHROMATICS":        { productType: "permanent_color", technology: "ultra_rich_ammonia" },
      "COLOR GEL":         { productType: "demi_permanent",  technology: "demi_gel" },
    },
    packageRules: {
      defaultUnit: "oz",
      commonSizes: [2, 4, 32],
    },
    developerOrColorClassification: {
      developerKeywords: ["developer", "pro-oxide", "vol"],
      lightenerKeywords: ["flash lift", "flash", "lightener", "bleach"],
    },
    knownExceptions: {
      "8N": { note: "Redken 8N = level 8, Natural (single letter suffix, not to be confused with Goldwell 8N)" },
    },
  },

  // ─── MATRIX ───────────────────────────────────────────────────────────────
  "MATRIX": {
    manufacturerId: null,
    rulesVersion: RULES_VERSION,
    displayName: "Matrix",
    country: "USA",
    shadeSystem: SHADE_SYSTEMS.DOT,
    shadeCodePatterns: [SHADE_CODE_PATTERNS.LOREAL_DOT, SHADE_CODE_PATTERNS.NUMERIC_ONLY],
    reflectionMap: STANDARD_REFLECTIONS,
    primaryToneSeparator: ".",
    secondaryTonePosition: 2,
    levelRange: [1, 12],
    productLineRules: {
      "SOCOLOR":     { productType: "permanent_color", technology: "peptide_technology" },
      "COLORSYNC":   { productType: "demi_permanent",  technology: "demi_alkaline" },
      "LIGHT MASTER":{ productType: "lightener",       technology: "bond_reinforcing_bleach" },
      "SO COLOR":    { productType: "permanent_color", technology: "peptide_technology", aliasOf: "SOCOLOR" },
    },
    packageRules: {
      defaultUnit: "oz",
      commonSizes: [2, 3, 90],
    },
    developerOrColorClassification: {
      developerKeywords: ["developer", "crème", "vol"],
      lightenerKeywords: ["light master", "bleach", "lighten"],
    },
    knownExceptions: {},
  },

  // ─── AVEDA ────────────────────────────────────────────────────────────────
  "AVEDA": {
    manufacturerId: null,
    rulesVersion: RULES_VERSION,
    displayName: "Aveda",
    country: "USA",
    shadeSystem: SHADE_SYSTEMS.MIXED,
    shadeCodePatterns: [SHADE_CODE_PATTERNS.LOREAL_DOT, SHADE_CODE_PATTERNS.NUMERIC_ONLY],
    reflectionMap: STANDARD_REFLECTIONS,
    primaryToneSeparator: ".",
    secondaryTonePosition: 2,
    levelRange: [1, 10],
    productLineRules: {
      "FULL SPECTRUM":   { productType: "permanent_color", technology: "advanced_color_technology" },
      "PURE TONES":      { productType: "demi_permanent",  technology: "demi_no_ammonia" },
    },
    packageRules: {
      defaultUnit: "oz",
      commonSizes: [2.5, 3.4],
    },
    developerOrColorClassification: {
      developerKeywords: ["developer"],
      lightenerKeywords: ["lightener", "lightworks"],
    },
    knownExceptions: {},
  },

};

// ── Catalog slug → canonical brand key mapping ────────────────────────────────
// Maps the file slug (public/catalog-brands/<slug>.json) to the
// brand key used in MANUFACTURER_RULES.

const SLUG_TO_BRAND_KEY = {
  "l-oreal-professionnel":    "L'OREAL PROFESSIONNEL",
  "l-oreal-professionnel-jp": "L'OREAL PROFESSIONNEL",
  "wella-professionals":      "WELLA PROFESSIONALS",
  "wella-professionals-jp":   "WELLA PROFESSIONALS",
  "schwarzkopf":              "SCHWARZKOPF",
  "schwarzkopf-canada":       "SCHWARZKOPF",
  "schwarzkopf-professional-jp": "SCHWARZKOPF",
  "goldwell":                 "GOLDWELL",
  "goldwell-jp":              "GOLDWELL",
  "redken":                   "REDKEN",
  "matrix":                   "MATRIX",
  "aveda":                    "AVEDA",
};

// ── Exports ──────────────────────────────────────────────────────────────────

/**
 * Look up manufacturer rules by catalog brand key or file slug.
 * Returns null if no rule set is registered.
 *
 * @param {string} brandKeyOrSlug
 * @returns {ManufacturerRule|null}
 */
function getRulesForBrand(brandKeyOrSlug) {
  if (!brandKeyOrSlug) return null;
  const upper = String(brandKeyOrSlug).toUpperCase().trim();
  // Direct match
  if (MANUFACTURER_RULES[upper]) return MANUFACTURER_RULES[upper];
  // Slug lookup
  const brandKey = SLUG_TO_BRAND_KEY[brandKeyOrSlug.toLowerCase()];
  if (brandKey && MANUFACTURER_RULES[brandKey]) return MANUFACTURER_RULES[brandKey];
  return null;
}

/**
 * Returns the list of all registered manufacturer brand keys.
 */
function getRegisteredManufacturers() {
  return Object.keys(MANUFACTURER_RULES);
}

/**
 * Returns the list of all catalog slugs that have registered rules.
 */
function getRegisteredSlugs() {
  return Object.keys(SLUG_TO_BRAND_KEY);
}

module.exports = {
  RULES_VERSION,
  SHADE_SYSTEMS,
  STANDARD_REFLECTIONS,
  WELLA_REFLECTIONS,
  WELLA_COLOR_CHARM_ALPHA_REFLECTIONS,
  WELLA_LINE_SCOPED_RULES,
  OFFICIAL_WELLA_SOURCES,
  SKP_REFLECTIONS,
  GOLDWELL_REFLECTIONS,
  REDKEN_SUFFIXES,
  SHADE_CODE_PATTERNS,
  MANUFACTURER_RULES,
  SLUG_TO_BRAND_KEY,
  getRulesForBrand,
  getRegisteredManufacturers,
  getRegisteredSlugs,
};
