/**
 * scripts/lib/beauty-intelligence/brand-dictionary.js
 * ─────────────────────────────────────────────────────────────────
 * Curated professional color brand and series knowledge base.
 *
 * This is Product Knowledge — not observed truth, not market
 * classification. It is the layer that explains what Dia Light,
 * INOA, Igora Royal, Color Touch, etc. actually mean in the
 * professional hair-color industry.
 *
 * Sources: brand official documentation, educator references,
 * and industry-standard shade system mappings.
 */

"use strict";

// ── Market Categories (15 executive-level buckets) ──────────────────────────

const MARKET_CATEGORIES = [
  "Cool Blonde",
  "Warm Blonde",
  "Beige Blonde",
  "Natural Blonde",
  "Cool Brunette",
  "Warm Brunette",
  "Chocolate Brown",
  "Copper",
  "Red",
  "Mahogany",
  "Violet",
  "Fashion Colors",
  "Grey Coverage",
  "High Lift Blonde",
  "Lightening Services",
];

// ── Color Family taxonomy ────────────────────────────────────────────────────

const COLOR_FAMILIES = {
  natural:   { label: "Natural",   subfamilies: ["Natural", "Natural Warm", "Natural Cool"], dot: "#8B7355" },
  blonde:    { label: "Blonde",    subfamilies: ["Ash Blonde", "Beige Blonde", "Gold Blonde", "Pearl Blonde", "Violet Blonde", "Neutral Blonde"], dot: "#D4C5A0" },
  brunette:  { label: "Brunette",  subfamilies: ["Natural Brown", "Ash Brown", "Chocolate Brown", "Mocha Brown", "Warm Brown"], dot: "#5C3D2E" },
  copper:    { label: "Copper",    subfamilies: ["Soft Copper", "Copper", "Intense Copper"], dot: "#B5651D" },
  red:       { label: "Red",       subfamilies: ["Soft Red", "Red", "Intense Red"], dot: "#CC2200" },
  mahogany:  { label: "Mahogany",  subfamilies: ["Mahogany", "Red Violet", "Violet"], dot: "#7B2D5E" },
  fashion:   { label: "Fashion",   subfamilies: ["Pink", "Purple", "Blue", "Green", "Silver", "Fashion Mix"], dot: "#9B59B6" },
};

// ── Product Types (Layer 1) ──────────────────────────────────────────────────

const PRODUCT_TYPES = {
  permanent_color:     { label: "Permanent Color",          excludeFromShadeIntel: false },
  demi_permanent:      { label: "Demi Permanent Color",     excludeFromShadeIntel: false },
  toner:               { label: "Toner",                    excludeFromShadeIntel: false },
  acidic_toner:        { label: "Gloss / Acidic Toner",     excludeFromShadeIntel: false },
  lightener:           { label: "Lightener / Bleach",       excludeFromShadeIntel: true  },
  developer:           { label: "Developer / Oxidant",      excludeFromShadeIntel: true  },
  corrector_mixer:     { label: "Corrector / Mixer",        excludeFromShadeIntel: true  },
  direct_dye:          { label: "Direct Dye / Fashion Color", excludeFromShadeIntel: false },
  bond_builder:        { label: "Bond Builder",             excludeFromShadeIntel: true  },
  treatment_care:      { label: "Treatment / Care",         excludeFromShadeIntel: true  },
};

// ── Reflection system ────────────────────────────────────────────────────────

const REFLECTIONS = {
  "0": { label: "Natural",       family: "natural"  },
  "1": { label: "Ash",           family: "blonde"   },
  "2": { label: "Iridescent / Violet", family: "violet" },
  "3": { label: "Gold",          family: "blonde"   },
  "4": { label: "Copper",        family: "copper"   },
  "5": { label: "Mahogany",      family: "mahogany" },
  "6": { label: "Red",           family: "red"      },
  "7": { label: "Green / Matte", family: "natural"  },
  "8": { label: "Mocha",         family: "brunette" },
  "9": { label: "Pearl",         family: "blonde"   },
};

// ── Wella reflection overrides ───────────────────────────────────────────────

const WELLA_REFLECTIONS = {
  "0": { label: "Natural",       family: "natural"  },
  "1": { label: "Ash",           family: "blonde"   },
  "2": { label: "Matte / Green", family: "natural"  },
  "3": { label: "Gold",          family: "blonde"   },
  "4": { label: "Red / Warm",    family: "red"      },
  "5": { label: "Mahogany",      family: "mahogany" },
  "6": { label: "Violet",        family: "mahogany" },
  "7": { label: "Brown",         family: "brunette" },
  "8": { label: "Pearl",         family: "blonde"   },
  "9": { label: "Cendre",        family: "blonde"   },
};

// ── Schwarzkopf reflection overrides ────────────────────────────────────────

const SKP_REFLECTIONS = {
  "0": { label: "Natural",            family: "natural"  },
  "1": { label: "Ash / Cool",         family: "blonde"   },
  "2": { label: "Ash Cool",           family: "blonde"   },
  "3": { label: "Gold",               family: "blonde"   },
  "4": { label: "Beige / Copper",     family: "copper"   },
  "5": { label: "Gold Mahogany",      family: "mahogany" },
  "6": { label: "Scarlet / Vibrant Red", family: "red"   },
  "7": { label: "Russet / Brunette",  family: "brunette" },
  "8": { label: "Pearl / Silver",     family: "blonde"   },
  "9": { label: "Violet",             family: "mahogany" },
};

// ── Redken suffix map ────────────────────────────────────────────────────────

const REDKEN_SUFFIXES = {
  "N":"Natural","NW":"Natural Warm","NA":"Natural Ash","NP":"Natural Pale",
  "A":"Ash","AA":"Deep Ash","B":"Beige","BR":"Brown","C":"Copper",
  "CR":"Copper Red","G":"Gold","GR":"Gold Red","MO":"Mocha",
  "R":"Red","RR":"Intense Red","V":"Violet","RO":"Rose","BO":"Boho",
  "P":"Pearl","W":"Warm","T":"Titanium","CH":"Chocolate",
};

// ── Level names (industry standard) ─────────────────────────────────────────

const LEVEL_NAMES = {
  1:"Black", 2:"Very Dark Brown", 3:"Dark Brown", 4:"Medium Brown",
  5:"Light Brown", 6:"Dark Blonde", 7:"Blonde", 8:"Light Blonde",
  9:"Very Light Blonde", 10:"Lightest Blonde", 11:"High Lift Blonde",
  12:"Ultra Lift Blonde",
};

// ── Service contexts ─────────────────────────────────────────────────────────

const SERVICE_CONTEXTS = [
  "Root Coverage",
  "Global Color",
  "Toning",
  "Balayage",
  "Highlights",
  "Color Correction",
  "Gloss Service",
  "White / Grey Coverage",
];

// ── Brand and Series dictionary ──────────────────────────────────────────────

/**
 * Each brand entry has:
 *   displayName, country, founded (optional), shadeSystem, reflectionSystem
 *   series: record of seriesKey → SeriesEntry
 *
 * Each SeriesEntry has:
 *   displayName, productType, technology, description
 *   shadeSystem, reflectionOverride (optional)
 *   commonServices, primaryMarketCategory
 *   officialUrl (optional)
 */
const BRAND_DICTIONARY = {

  // ── L'Oréal Professionnel ───────────────────────────────────────────────
  "L'OREAL PROFESSIONNEL": {
    displayName: "L'Oréal Professionnel",
    country: "France",
    shadeSystem: "Dot notation (level.reflect1reflect2)",
    reflectionSystem: "REFLECTIONS",
    series: {
      "NEW INOA":         { displayName:"INOA",          productType:"permanent_color",  technology:"Oil Delivery System (ODS²)",    description:"The first permanent hair color with no ammonia delivered by oil. Uses proprietary ODS technology for a pure, silent color.", commonServices:["Root Coverage","Global Color","White / Grey Coverage"], primaryMarketCategory:"Grey Coverage", officialUrl:"https://us.lorealprofessionnel.com/all-products/hair-color/inoa" },
      "INOA":             { displayName:"INOA",          productType:"permanent_color",  technology:"Oil Delivery System (ODS²)",    description:"Permanent ammonia-free color with oil-delivery system.", commonServices:["Root Coverage","Global Color","White / Grey Coverage"], primaryMarketCategory:"Grey Coverage" },
      "INOA SUPREME":     { displayName:"INOA Supreme",  productType:"permanent_color",  technology:"Oil Delivery System",           description:"INOA Supreme focuses on brightening and luminosity for lighter shades.", commonServices:["Root Coverage","Highlights"], primaryMarketCategory:"Cool Blonde" },
      "MAJIREL":          { displayName:"Majirel",       productType:"permanent_color",  technology:"Incell Technology",             description:"L'Oréal's iconic professional permanent color with Incell technology for intense, even color.", commonServices:["Root Coverage","Global Color","White / Grey Coverage"], primaryMarketCategory:"Grey Coverage", officialUrl:"https://us.lorealprofessionnel.com/all-products/hair-color/majirel" },
      "MAJIREL FUNDA":    { displayName:"Majirel",       productType:"permanent_color",  technology:"Incell Technology",             description:"Majirel classic range.", commonServices:["Root Coverage","Global Color"], primaryMarketCategory:"Grey Coverage" },
      "MAJIREL GLOW":     { displayName:"Majirel Glow",  productType:"permanent_color",  technology:"Incell Technology",             description:"Majirel Glow for vibrant, high-shine results.", commonServices:["Global Color","Highlights"], primaryMarketCategory:"Warm Blonde" },
      "COOL COVER":       { displayName:"Majirel Cool Cover", productType:"permanent_color", technology:"Incell Technology",          description:"Specialized Majirel for maximum cool-toned grey coverage. Uses double cool-reflector technology.", commonServices:["Root Coverage","White / Grey Coverage"], primaryMarketCategory:"Grey Coverage" },
      "DIA LIGHT":        { displayName:"Dia Light",     productType:"acidic_toner",     technology:"Acidic demi-permanent gloss",   description:"Acid demi-permanent gloss/toner. Used with Diactivator developer. Leaves hair soft, shiny, and translucent. Major toning and finishing tool.", commonServices:["Toning","Balayage","Highlights","Gloss Service"], primaryMarketCategory:"Cool Blonde", officialUrl:"https://us.lorealprofessionnel.com/all-products/hair-color/dia-light" },
      "DIA COLOR":        { displayName:"Dia Color",     productType:"demi_permanent",   technology:"Demi-permanent ammonia-free",   description:"Demi-permanent, ammonia-free color for root-to-tip coverage and refreshing. Deeper saturation than Dia Light.", commonServices:["Root Coverage","Global Color","Color Correction"], primaryMarketCategory:"Cool Brunette" },
      "DIA RICHESSE":     { displayName:"Dia Richesse",  productType:"demi_permanent",   technology:"Demi-permanent",                description:"Demi-permanent tones for depth, shine, and tone alignment.", commonServices:["Toning","Global Color"], primaryMarketCategory:"Natural Blonde" },
      "DIA LIGHT 60G":    { displayName:"Dia Light 60g", productType:"acidic_toner",     technology:"Acidic demi-permanent gloss",   description:"Small format Dia Light for precise toning.", commonServices:["Toning","Balayage"], primaryMarketCategory:"Cool Blonde" },
      "LUO COLOR":        { displayName:"Luo Color",     productType:"permanent_color",  technology:"Multi-facets technology",       description:"Multi-facets permanent color for vibrant, radiant results with high durability.", commonServices:["Global Color","Root Coverage"], primaryMarketCategory:"Copper" },
      "RICHESSE":         { displayName:"Richesse",      productType:"demi_permanent",   technology:"Demi-permanent",                description:"Demi-permanent for gloss, tone, and depth.", commonServices:["Toning","Gloss Service"], primaryMarketCategory:"Natural Blonde" },
      "INOA ODS2":        { displayName:"INOA ODS²",     productType:"permanent_color",  technology:"Oil Delivery System (ODS²)",    description:"Second generation INOA oil-delivery permanent color.", commonServices:["Root Coverage","Global Color"], primaryMarketCategory:"Grey Coverage" },
      "BLOND STUDIO BLEACH": { displayName:"Blond Studio", productType:"lightener",      technology:"Controlled decolorization",     description:"Blond Studio lightening system for blonding services with precision control.", commonServices:["Highlights","Balayage","Lightening Services"], primaryMarketCategory:"Lightening Services" },
      "DIACTIVATOR":      { displayName:"Diactivator",   productType:"developer",        technology:"Cream developer for Dia systems", description:"Diactivator cream developer used exclusively with Dia Light and Dia Color. Lower volumes (1.8%, 2.7%, 4.5%) for gentle processing.", commonServices:[], primaryMarketCategory:null },
      "INOA DEVELOPERS":  { displayName:"INOA Developer", productType:"developer",       technology:"Oil-based developer",           description:"Oil-based developer formulated specifically for the INOA system.", commonServices:[], primaryMarketCategory:null },
      "OXYDANT DEVELOPERS": { displayName:"Oxydant Developers", productType:"developer", technology:"Cream developer",              description:"Standard oxidant cream developers for Majirel and similar systems.", commonServices:[], primaryMarketCategory:null },
      "BS DEVELOPERS":    { displayName:"Blond Studio Developer", productType:"developer", technology:"High-lift developer",         description:"High-performance developers for the Blond Studio lightening system.", commonServices:[], primaryMarketCategory:null },
      "EFASSOR":          { displayName:"Efassor",       productType:"corrector_mixer",  technology:"Color remover",                 description:"Color remover / color eraser for corrective work.", commonServices:["Color Correction"], primaryMarketCategory:null },
      "EXCELENCE HICOLOR": { displayName:"Excellence HiColor", productType:"permanent_color", technology:"High-lift permanent",      description:"High-lift permanent color for dramatic lightening on natural hair.", commonServices:["Highlights","Global Color"], primaryMarketCategory:"High Lift Blonde" },
    },
  },

  // ── Wella Professionals ─────────────────────────────────────────────────
  "WELLA PROFESSIONALS": {
    displayName: "Wella Professionals",
    country: "Germany",
    shadeSystem: "Slash notation (level/reflect1reflect2)",
    reflectionSystem: "WELLA_REFLECTIONS",
    series: {
      "KOLESTONE":        { displayName:"Koleston Perfect",  productType:"permanent_color",  technology:"WE11OX - Pure Tone Technology", description:"Wella's professional permanent color benchmark. Pure, intense color results with long-lasting grey coverage.", commonServices:["Root Coverage","Global Color","White / Grey Coverage"], primaryMarketCategory:"Grey Coverage", officialUrl:"https://www.wella.com/professional/en-US/hair-color/koleston-perfect" },
      "COLOR TOUCH":      { displayName:"Color Touch",       productType:"demi_permanent",   technology:"ME+Technology",                 description:"Leading demi-permanent for refreshing, toning, and blending. Versatile and popular in high-end salons.", commonServices:["Toning","Root Coverage","Color Correction","Gloss Service"], primaryMarketCategory:"Cool Blonde", officialUrl:"https://www.wella.com/professional/en-US/hair-color/color-touch" },
      "COLOR FRESH":      { displayName:"Color Fresh",       productType:"acidic_toner",     technology:"Acidic gloss formula",          description:"Wella's acidic toning and finishing product. Adds gloss and tonal depth. Color Fresh Masks add fashion tones.", commonServices:["Toning","Balayage","Gloss Service","Highlights"], primaryMarketCategory:"Cool Blonde" },
      "ILLUMINA COLOR":   { displayName:"Illumina Color",    productType:"permanent_color",  technology:"Micro-light technology",        description:"Premium permanent color for luminous, multi-dimensional results. Targets the micro-pigment for superior shine.", commonServices:["Global Color","Root Coverage","Highlights"], primaryMarketCategory:"Beige Blonde" },
      "SHINEFINITY":      { displayName:"Shinefinity",       productType:"acidic_toner",     technology:"0% ammonia gel toner",          description:"Zero-ammonia gel toning gloss for creating customized, shiny results. Major competitor to Dia Light.", commonServices:["Toning","Balayage","Highlights","Gloss Service"], primaryMarketCategory:"Cool Blonde" },
      "BLONDOR":          { displayName:"Blondor",           productType:"lightener",        technology:"Controlled blonding",           description:"Wella's blonding range. Multiple formats for foils, balayage, and freehand blonding.", commonServices:["Highlights","Balayage","Lightening Services"], primaryMarketCategory:"Lightening Services" },
    },
  },

  // ── Schwarzkopf Professional ────────────────────────────────────────────
  "SCHWARZKOPF": {
    displayName: "Schwarzkopf Professional",
    country: "Germany",
    shadeSystem: "Dash notation (level-reflect1reflect2)",
    reflectionSystem: "SKP_REFLECTIONS",
    series: {
      "IGORA ROYAL":      { displayName:"Igora Royal",      productType:"permanent_color",  technology:"Schwarzkopf Igora Technology",  description:"Schwarzkopf's professional permanent color benchmark. Superior grey coverage and intense, long-lasting color.", commonServices:["Root Coverage","Global Color","White / Grey Coverage"], primaryMarketCategory:"Grey Coverage", officialUrl:"https://www.schwarzkopf-professional.com/us/en/color/igora" },
      "IGORA VIBRANCE":   { displayName:"Igora Vibrance",   productType:"demi_permanent",   technology:"Demi-permanent, ammonia-free",  description:"Demi-permanent for toning, refreshing, and blending grey without full commitment.", commonServices:["Toning","Color Correction","Gloss Service"], primaryMarketCategory:"Cool Brunette" },
      "ESSENSITY":        { displayName:"Essensity",        productType:"permanent_color",  technology:"Ammonia-free permanent",        description:"Ammonia-free professional permanent color with natural ingredients.", commonServices:["Root Coverage","Global Color"], primaryMarketCategory:"Natural Blonde" },
      "BLONDME":          { displayName:"BlondMe",          productType:"lightener",        technology:"Keratin-based blonding",        description:"Schwarzkopf's complete blonding system. Lighteners, toners, and care products for the full blonde journey.", commonServices:["Highlights","Balayage","Toning","Lightening Services"], primaryMarketCategory:"Lightening Services" },
    },
  },

  // ── Matrix ──────────────────────────────────────────────────────────────
  "MATRIX": {
    displayName: "Matrix",
    country: "USA",
    shadeSystem: "Slash notation with named shade groups",
    reflectionSystem: "REFLECTIONS",
    series: {
      "SOCOLOR":          { displayName:"SoColor",          productType:"permanent_color",  technology:"Permanent high-lift color",     description:"Matrix's professional permanent color for vibrant, 100% grey coverage results.", commonServices:["Root Coverage","Global Color","White / Grey Coverage"], primaryMarketCategory:"Grey Coverage" },
      "COLOR SYNC":       { displayName:"Color Sync",       productType:"demi_permanent",   technology:"Alkaline demi-permanent",       description:"Alkaline demi-permanent toning and refreshing system.", commonServices:["Toning","Color Correction","Root Coverage"], primaryMarketCategory:"Cool Blonde" },
      "LIGHT MASTER":     { displayName:"Light Master",     productType:"lightener",        technology:"High-lift bleach",              description:"High-performance lightening system for up to 8 levels of lift.", commonServices:["Highlights","Balayage","Lightening Services"], primaryMarketCategory:"Lightening Services" },
      "VINYLS":           { displayName:"Vinyls",           productType:"direct_dye",       technology:"Semi-permanent direct dye",     description:"Vivid semi-permanent direct dye for fashion colors.", commonServices:["Global Color","Color Correction"], primaryMarketCategory:"Fashion Colors" },
    },
  },

  // ── Redken ──────────────────────────────────────────────────────────────
  "REDKEN": {
    displayName: "Redken",
    country: "USA",
    shadeSystem: "Level + alpha suffix (e.g. 8MO, 6CR, 10NA)",
    reflectionSystem: "REDKEN_SUFFIXES",
    series: {
      "SHADES EQ":        { displayName:"Shades EQ",        productType:"acidic_toner",     technology:"Equalizing pH system",          description:"Redken's iconic acidic gloss/toner system. Used for toning, refreshing, and adding shine. The standard for toning after highlighting.", commonServices:["Toning","Highlights","Balayage","Gloss Service"], primaryMarketCategory:"Cool Blonde", officialUrl:"https://www.redken.com/shades-eq" },
      "SHADES EQ BONDER IN": { displayName:"Shades EQ Bonder Inside", productType:"acidic_toner", technology:"Bond-reinforcing acidic toner", description:"Shades EQ with built-in bond reinforcing technology.", commonServices:["Toning","Balayage"], primaryMarketCategory:"Cool Blonde" },
      "COLOR GELS OILS":  { displayName:"Color Gels Oils",  productType:"demi_permanent",   technology:"Oil-infused demi-permanent",    description:"Oil-infused demi-permanent for rich, multidimensional color.", commonServices:["Global Color","Root Coverage","Toning"], primaryMarketCategory:"Cool Brunette" },
      "COLOR FUSION":     { displayName:"Color Fusion",     productType:"permanent_color",  technology:"Protein-enriched permanent",    description:"Permanent color enriched with proteins for strength and vibrancy.", commonServices:["Root Coverage","Global Color"], primaryMarketCategory:"Grey Coverage" },
    },
  },

  // ── Goldwell ────────────────────────────────────────────────────────────
  "GOLDWELL": {
    displayName: "Goldwell",
    country: "Germany",
    shadeSystem: "Mixed notation (level + suffix codes)",
    reflectionSystem: "REFLECTIONS",
    series: {
      "TOPCHIC":          { displayName:"Topchic",           productType:"permanent_color", technology:"Permanent professional color",   description:"Goldwell's professional permanent color standard for reliable grey coverage.", commonServices:["Root Coverage","Global Color","White / Grey Coverage"], primaryMarketCategory:"Grey Coverage" },
      "COLORANCE":        { displayName:"Colorance",         productType:"demi_permanent",  technology:"Demi-permanent pH 7",           description:"Demi-permanent toning at pH 7 for refreshing, blending, and gloss.", commonServices:["Toning","Color Correction","Gloss Service"], primaryMarketCategory:"Natural Blonde" },
      "LIGHTDIMENSIONS":  { displayName:"Lightdimensions",   productType:"lightener",       technology:"Controlled blonding",           description:"Goldwell's lightening system for precise, even lift.", commonServices:["Highlights","Balayage","Lightening Services"], primaryMarketCategory:"Lightening Services" },
    },
  },

  // ── Keune ───────────────────────────────────────────────────────────────
  "KEUNE": {
    displayName: "Keune",
    country: "Netherlands",
    shadeSystem: "Dot notation (similar to L'Oréal)",
    reflectionSystem: "REFLECTIONS",
    series: {
      "TINTA COLOR":      { displayName:"Tinta Color",       productType:"permanent_color", technology:"Professional permanent color",   description:"Keune's flagship permanent color range for comprehensive grey coverage.", commonServices:["Root Coverage","Global Color","White / Grey Coverage"], primaryMarketCategory:"Grey Coverage", officialUrl:"https://www.keune.com/education/color-charts/" },
      "TINTA ULTIMATE COVER": { displayName:"Tinta Ultimate Cover", productType:"permanent_color", technology:"Maximum grey coverage", description:"Keune Tinta optimized for maximum grey/white coverage.", commonServices:["Root Coverage","White / Grey Coverage"], primaryMarketCategory:"Grey Coverage" },
    },
  },
};

// ── Helper: get brand info ───────────────────────────────────────────────────

function normalizeBrandKey(rawBrand) {
  const upper = String(rawBrand || "").toUpperCase().trim();
  if (upper.includes("LOREAL") || upper.includes("L'OREAL") || upper.includes("L'OREAL")) return "L'OREAL PROFESSIONNEL";
  if (upper.includes("WELLA")) return "WELLA PROFESSIONALS";
  if (upper.includes("SCHWARZKOPF")) return "SCHWARZKOPF";
  if (upper === "MATRIX") return "MATRIX";
  if (upper === "REDKEN") return "REDKEN";
  if (upper === "GOLDWELL") return "GOLDWELL";
  if (upper.includes("KEUNE")) return "KEUNE";
  return upper;
}

function getBrandKnowledge(rawBrand) {
  const key = normalizeBrandKey(rawBrand);
  return BRAND_DICTIONARY[key] || null;
}

function getSeriesKnowledge(rawBrand, rawSeries) {
  const brandKey = normalizeBrandKey(rawBrand);
  const brand = BRAND_DICTIONARY[brandKey];
  if (!brand) return null;
  const seriesUpper = String(rawSeries || "").toUpperCase().trim();
  return brand.series[seriesUpper] || null;
}

function getReflectionSystem(rawBrand) {
  const key = normalizeBrandKey(rawBrand);
  const brand = BRAND_DICTIONARY[key];
  if (!brand) return REFLECTIONS;
  if (brand.reflectionSystem === "WELLA_REFLECTIONS") return WELLA_REFLECTIONS;
  if (brand.reflectionSystem === "SKP_REFLECTIONS") return SKP_REFLECTIONS;
  if (brand.reflectionSystem === "REDKEN_SUFFIXES") return REDKEN_SUFFIXES;
  return REFLECTIONS;
}

module.exports = {
  MARKET_CATEGORIES,
  COLOR_FAMILIES,
  PRODUCT_TYPES,
  REFLECTIONS,
  WELLA_REFLECTIONS,
  SKP_REFLECTIONS,
  REDKEN_SUFFIXES,
  LEVEL_NAMES,
  SERVICE_CONTEXTS,
  BRAND_DICTIONARY,
  normalizeBrandKey,
  getBrandKnowledge,
  getSeriesKnowledge,
  getReflectionSystem,
};
