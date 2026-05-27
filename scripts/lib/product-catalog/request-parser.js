/**
 * scripts/lib/product-catalog/request-parser.js
 * ---------------------------------------------------------------
 * Convert a free-form customer product request (WhatsApp /
 * Instagram / email paste) into normalized catalog candidate rows.
 *
 * Examples it MUST handle:
 *
 *   -kenra SA rapid toners
 *   -wella color touch 1.9% 6 volume gallon (quick add for all color
 *      services + toner services)
 *   - paul mitchell 5vol CLEAR developer (for all toner & color services)
 *   - all kenra rapid toners .. SA, SV, B, ROV
 *   - Framesi framcolor glamour (6.61, 7.61, 5.61, 8.61) all the .61 plz
 *   - ADORE COLOR (direct dye)
 *   - can you also add all the danger jones & pulpriot ?
 *   - paul mitchell COLOR WAYS
 *   - ION COLOR brilliance ^^
 *
 * Returns an object with:
 *   rows:         CatalogCandidateRow[] (canonical schema, before matching)
 *   bullets:      raw bullet entries with parser annotations
 *   links:        unique URLs found anywhere in the text
 *   warnings:     parser warnings (couldn't classify, etc.)
 *   detectedBrands: [] of unique brand strings the parser recognized
 *
 * Pure / dependency-free. All inference is regex + dictionary based.
 */

"use strict";

const {
  normalizeBrand,
  normalizeSeries,
  normalizeShade,
  normalizePrice,
  normalizeWeightToGrams,
  rowKey,
} = require("./normalizer");
const { stringifyBarcodes } = require("./schema");

/**
 * Brand → known series fingerprints. The matcher walks every bullet
 * and tries to attach the most specific series to it. Order matters:
 * longer fragments win over shorter ones.
 */
const BRAND_SERIES_FINGERPRINTS = [
  // Kenra — used by Diana for rapid toners.
  { brand: "KENRA", series: "RAPID TONER", patterns: [/rapid\s+toner/i, /rapid\s+toners/i] },
  { brand: "KENRA", series: "DEMI",       patterns: [/kenra\s+demi/i] },
  { brand: "KENRA", series: "PERMANENT",  patterns: [/kenra\s+permanent/i] },
  // Wella.
  { brand: "WELLA", series: "COLOR TOUCH",          patterns: [/color\s*touch/i] },
  { brand: "WELLA", series: "KOLESTON PERFECT",     patterns: [/koleston/i] },
  { brand: "WELLA", series: "ILLUMINA",             patterns: [/illumina/i] },
  // Paul Mitchell.
  { brand: "PAUL MITCHELL", series: "COLOR WAYS",   patterns: [/color\s*ways/i] },
  { brand: "PAUL MITCHELL", series: "DEVELOPER",    patterns: [/developer/i] },
  { brand: "PAUL MITCHELL", series: "POP XG",       patterns: [/pop\s*xg/i] },
  // Framesi.
  { brand: "FRAMESI", series: "FRAMCOLOR GLAMOUR",  patterns: [/framcolor\s*glamour/i, /framesi\s+glamour/i] },
  { brand: "FRAMESI", series: "FRAMCOLOR FUTURA",   patterns: [/framcolor\s*futura/i] },
  // Adore (direct dye).
  { brand: "ADORE", series: "ADORE COLOR",          patterns: [/adore(\s+(semi|color))?/i] },
  // Danger Jones (direct dye).
  { brand: "DANGER JONES", series: "DANGER JONES",  patterns: [/danger\s*jones/i] },
  // Pulp Riot.
  { brand: "PULP RIOT", series: "SEMI-PERMANENT",   patterns: [/pulp\s*riot/i] },
  // Ion Color Brilliance.
  { brand: "ION", series: "COLOR BRILLIANCE",       patterns: [/ion(\s+color)?(\s+brilliance)?/i] },
];

/**
 * Heuristic: explicit type override based on keywords inside a bullet.
 */
const TYPE_HINTS = [
  { type: "developer",  re: /\bdeveloper\b/i },
  { type: "developer",  re: /\b\d{1,2}\s*(?:vol\.?|volume)\b/i },
  { type: "developer",  re: /\b\d{1,2}\s*\.?\s*\d+\s*%/i },
  { type: "toner",      re: /\btoner(s)?\b/i },
  { type: "color",      re: /\b(direct\s*dye|semi[- ]?perm)/i, mappedTo: "direct-dye" },
  { type: "color",      re: /\bcolor(s)?\b/i },
  { type: "bleach",     re: /\bbleach(s|ing)?\b/i },
];

const SERVICE_HINTS = [
  { service: "toner",       re: /\btoner(s)?\b/i },
  { service: "pre-toner",   re: /\bpre[-\s]*toner\b/i },
  { service: "color",       re: /\bcolor\s+services?\b/i },
  { service: "developer",   re: /\bdeveloper\b/i },
  { service: "direct-dye",  re: /\b(direct\s*dye|semi[- ]?perm)/i },
];

const QUICK_ADD_RE = /\bquick[-\s]*add(s)?\b/i;
const ALL_RULE_RE = /\ball\s+(?:the\s+)?(\.?\d+|\d+\.\d+)\b/i;
const URL_RE = /https?:\/\/[^\s)]+/g;

const SHADE_LIST_IN_PARENS_RE = /\(([^)]+)\)/g;
const NUMERIC_SHADE_RE = /\b\d{1,2}\.\d{1,2}\b/g;
const SHORTCODE_LIST_RE = /\b([A-Z]{1,4})\b/g;

const KNOWN_KENRA_TONERS = ["SA", "SV", "B", "ROV", "V", "BC", "G", "C"];
const KNOWN_PAUL_MITCHELL_DEVELOPERS = ["CLEAR", "5VOL", "10VOL", "20VOL", "30VOL", "40VOL"];

/**
 * Pre-process: split the customer message into bullet entries.
 *
 * Rules:
 *   - Lines starting with "-", "•", "*", or a digit followed by ")" or "."
 *     are bullets.
 *   - When a bullet wraps to the next line, the continuation is glued
 *     back onto the previous bullet.
 *   - URLs are kept attached to whichever bullet they appear in.
 */
function splitIntoBullets(text) {
  if (!text || typeof text !== "string") return [];
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const bullets = [];
  let buffer = null;
  const flush = () => {
    if (buffer && buffer.trim()) bullets.push(buffer.trim());
    buffer = null;
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    if (/^[-•*]+\s*/.test(line) || /^\d+[\.\)]\s+/.test(line)) {
      flush();
      buffer = line.replace(/^[-•*]+\s*/, "").replace(/^\d+[\.\)]\s+/, "");
    } else if (buffer != null) {
      buffer += " " + line;
    } else {
      buffer = line;
    }
  }
  flush();
  return bullets;
}

function extractLinks(text) {
  if (!text) return [];
  const seen = new Set();
  const out = [];
  const matches = text.match(URL_RE) || [];
  for (const url of matches) {
    const cleaned = url.replace(/[),.;]+$/, "");
    if (!seen.has(cleaned)) {
      seen.add(cleaned);
      out.push(cleaned);
    }
  }
  return out;
}

function detectBrand(line) {
  const upper = line.toLowerCase();
  // Multi-word brands first so "paul mitchell" wins over "mitchell".
  const ordered = [
    "paul mitchell",
    "danger jones",
    "ion color brilliance",
    "pulp riot",
    "framesi",
    "framcolor",
    "kenra",
    "wella",
    "matrix",
    "redken",
    "joico",
    "schwarzkopf",
    "montibello",
    "artego",
    "adore",
    "ion",
  ];
  for (const candidate of ordered) {
    if (upper.includes(candidate)) {
      return normalizeBrand(candidate);
    }
  }
  return "";
}

function detectSeries(line, brand) {
  for (const fp of BRAND_SERIES_FINGERPRINTS) {
    if (brand && fp.brand !== brand) continue;
    for (const re of fp.patterns) {
      if (re.test(line)) return fp.series;
    }
  }
  return "";
}

function detectType(line) {
  for (const hint of TYPE_HINTS) {
    if (hint.re.test(line)) {
      return { type: hint.type, mappedTo: hint.mappedTo || null };
    }
  }
  return { type: null, mappedTo: null };
}

function detectServiceContext(line) {
  for (const hint of SERVICE_HINTS) {
    if (hint.re.test(line)) return hint.service;
  }
  return "unknown";
}

/**
 * Pull explicit numeric shades from a line. Captures things like:
 *   (6.61, 7.61, 5.61, 8.61)
 *   .61
 *   5/0, 5/0V
 */
function extractNumericShades(line) {
  const shades = new Set();

  // Parenthesised lists.
  const parens = line.match(SHADE_LIST_IN_PARENS_RE) || [];
  for (const block of parens) {
    const inner = block.replace(/^[(]|[)]$/g, "");
    for (const m of inner.match(NUMERIC_SHADE_RE) || []) {
      shades.add(normalizeShade(m).canonical);
    }
  }

  // Free numeric shades anywhere in the line.
  for (const m of line.match(NUMERIC_SHADE_RE) || []) {
    shades.add(normalizeShade(m).canonical);
  }

  return [...shades];
}

/**
 * Pull short-code shades like "SA, SV, B, ROV" or "5vol CLEAR".
 *
 * Strategy:
 *   - Look for ALL-CAPS or uppercase tokens of length 1-4 that are
 *     NOT common English words.
 *   - Cross-check with brand-specific known lists when we have a
 *     hint about the brand.
 */
function extractShortCodeShades(line, brand) {
  // Strip URLs and decimal numerics so we don't pull "AfmB" or
  // "1.9" out of a Shopify srsltid / strength annotation.
  const cleaned = line.replace(URL_RE, " ").replace(/\b\d+\.\d+\b/g, " ");
  const tokens = cleaned.match(/\b[A-Z][A-Z0-9]{0,4}\b/g) || [];

  // For Kenra rapid toners, intersect with the known toner short list.
  if (brand === "KENRA" && /toner|rapid/i.test(line)) {
    const kept = [];
    for (const t of tokens) {
      if (KNOWN_KENRA_TONERS.includes(t) && !kept.includes(t)) kept.push(t);
    }
    return kept;
  }

  // For Paul Mitchell developer, normalise CLEAR / NvVOL.
  if (brand === "PAUL MITCHELL" && /developer/i.test(line)) {
    const kept = [];
    for (const t of tokens) {
      if (
        (KNOWN_PAUL_MITCHELL_DEVELOPERS.includes(t) || /^\d+VOL$/i.test(t)) &&
        !kept.includes(t)
      ) {
        kept.push(t);
      }
    }
    return kept;
  }

  // No deterministic short-code list for this brand. Falling through
  // returns [] so the bullet falls into the "needs-review anchor row"
  // branch — vision/web extractors can resolve it later.
  return [];
}

/**
 * Detect strength/volume markers inside a bullet, e.g.
 *   "1.9% 6 volume" → { strength: "1.9%", volume: 6 }
 *   "5vol CLEAR"    → { volume: 5 }
 */
function extractStrength(line) {
  const out = {};
  const pct = line.match(/(\d+(?:\.\d+)?)\s*%/);
  if (pct) out.strength = pct[1] + "%";
  const vol = line.match(/(\d+)\s*(?:vol\.?|volume)/i);
  if (vol) out.volume = parseInt(vol[1], 10);
  return out;
}

function extractAllRuleNote(line) {
  const m = line.match(ALL_RULE_RE);
  if (m) return `customer requested all ${m[1]} variants`;
  if (/all\b/i.test(line)) return "customer requested all variants of this line";
  return null;
}

function makeRow({
  brand,
  series,
  shade,
  type,
  serviceContext,
  quickAdd,
  notes,
  strength,
  evidenceText,
}) {
  const canonicalShade = normalizeShade(shade).canonical;
  const row = {
    productId: null,
    brand: normalizeBrand(brand),
    series: normalizeSeries(series),
    familyShade: null,
    shade: canonicalShade,
    image: null,
    catalogNo: null,
    hairColor: null,
    type: type || null,
    packingWeight: null,
    materialWeight: null,
    barcodes: stringifyBarcodes([]),
    ILS: null,
    _sourceFile: "request_text",
    _sourceKind: "text",
    _quickAdd: !!quickAdd,
    _serviceContext: serviceContext || "unknown",
    _strength: strength || null,
    _notes: notes || null,
    _evidence: evidenceText
      ? [
          {
            kind: "text",
            detail: notes || null,
            source: "request_text",
            snippet: String(evidenceText).slice(0, 220),
            confidence: "medium",
          },
        ]
      : [],
  };
  row._rowKey = rowKey({ brand: row.brand, series: row.series, shade: row.shade });
  return row;
}

/**
 * Top-level entry point.
 *
 * @param {string} text  raw customer message
 * @param {object} opts
 *   defaultBrand?: string
 *   defaultSeries?: string
 *   defaultType?: string
 */
function parseRequestText(text, opts = {}) {
  const safeText = typeof text === "string" ? text : "";
  const bullets = splitIntoBullets(safeText);
  const links = extractLinks(safeText);
  const warnings = [];
  const rows = [];
  const detectedBrands = new Set();
  const annotatedBullets = [];
  let quickAddIntents = 0;

  for (const bullet of bullets) {
    const brand =
      detectBrand(bullet) ||
      normalizeBrand(opts.defaultBrand || "");
    if (brand) detectedBrands.add(brand);

    const series =
      detectSeries(bullet, brand) ||
      normalizeSeries(opts.defaultSeries || "");
    const typeHit = detectType(bullet);
    const type = typeHit.mappedTo || typeHit.type || opts.defaultType || null;
    const serviceContext = detectServiceContext(bullet);
    const quickAdd = QUICK_ADD_RE.test(bullet) || serviceContext === "pre-toner";
    if (quickAdd) quickAddIntents += 1;
    const strength = extractStrength(bullet);
    const allRuleNote = extractAllRuleNote(bullet);

    const numericShades = extractNumericShades(bullet);
    const shortShades = extractShortCodeShades(bullet, brand);
    const allShades = [...numericShades, ...shortShades];

    if (allShades.length === 0) {
      // Bullet without explicit shades — register the brand/series as
      // "needs review" so the AI/vision/web layer can resolve it.
      if (!brand && !series) {
        warnings.push({
          code: "REQUEST_BULLET_UNRECOGNIZED",
          severity: "low",
          message: `Could not classify bullet: "${bullet}"`,
          source: "request_text",
        });
        annotatedBullets.push({ raw: bullet, brand: "", series: "", shades: [], note: "unclassified" });
        continue;
      }
      // Anchor row so reviewers see the brand/series request even if
      // shades are blank.
      const note = allRuleNote || "shade list missing — review needed";
      rows.push(
        makeRow({
          brand,
          series,
          shade: "",
          type,
          serviceContext,
          quickAdd,
          notes: note,
          strength: Object.keys(strength).length ? strength : null,
          evidenceText: bullet,
        }),
      );
      annotatedBullets.push({
        raw: bullet,
        brand,
        series,
        shades: [],
        quickAdd,
        type,
        note,
      });
      continue;
    }

    for (const shade of allShades) {
      rows.push(
        makeRow({
          brand,
          series,
          shade,
          type,
          serviceContext,
          quickAdd,
          notes: allRuleNote || null,
          strength: Object.keys(strength).length ? strength : null,
          evidenceText: bullet,
        }),
      );
    }
    annotatedBullets.push({
      raw: bullet,
      brand,
      series,
      shades: allShades,
      quickAdd,
      type,
      note: allRuleNote,
    });
  }

  return {
    rows,
    bullets: annotatedBullets,
    links,
    warnings,
    detectedBrands: [...detectedBrands],
    quickAddIntents,
  };
}

module.exports = {
  parseRequestText,
  splitIntoBullets,
  extractLinks,
  detectBrand,
  detectSeries,
  detectType,
  detectServiceContext,
  extractNumericShades,
  extractShortCodeShades,
  extractStrength,
  KNOWN_KENRA_TONERS,
  KNOWN_PAUL_MITCHELL_DEVELOPERS,
  BRAND_SERIES_FINGERPRINTS,
};
