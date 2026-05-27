/**
 * scripts/lib/product-catalog/normalizer.js
 * ---------------------------------------------------------------
 * Pure helpers to normalize free-form catalog text (brands, series,
 * shade codes, weights, prices) into the canonical schema used by
 * matcher.js and workbook-builder.js.
 *
 * Dependency-free, fully unit-tested.
 */

"use strict";

/**
 * Aliases for known DB typos / inconsistent spellings. Maps a
 * normalized PDF/upload value to the spelling stored in the DB.
 *
 * Keys/values are lower-cased for matching; canonical output keeps
 * the original DB casing.
 */
const SHADE_ALIASES = {
  "platinum nacre": { canonical: "PLATINIUM NACRE", note: "DB stores PLATINIUM NACRE typo" },
};

const BRAND_ALIASES = {
  "loreal": "LOREAL",
  "l'oreal": "LOREAL",
  "l'oréal": "LOREAL",
  "l oreal": "LOREAL",
  "wella": "WELLA",
  "matrix": "MATRIX",
  "redken": "REDKEN",
  "joico": "JOICO",
  "schwarzkopf": "SCHWARZKOPF",
  "montibello": "MONTIBELLO",
  "artego": "ARTEGO",
  "its color": "ITS COLOR",
  "its-color": "ITS COLOR",
  "itscolor": "ITS COLOR",
  "kenra": "KENRA",
  "kenra color": "KENRA",
  "kenra professional": "KENRA",
  "paul mitchell": "PAUL MITCHELL",
  "paul-mitchell": "PAUL MITCHELL",
  "paulmitchell": "PAUL MITCHELL",
  "framesi": "FRAMESI",
  "framcolor": "FRAMESI",
  "adore": "ADORE",
  "adore color": "ADORE",
  "creative image adore": "ADORE",
  "danger jones": "DANGER JONES",
  "dangerjones": "DANGER JONES",
  "pulp riot": "PULP RIOT",
  "pulpriot": "PULP RIOT",
  "ion": "ION",
  "ion color brilliance": "ION",
};

/**
 * Strip diacritics and collapse whitespace. Used everywhere as a
 * key-building primitive.
 */
function stripDiacritics(value) {
  if (typeof value !== "string") return "";
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u0080-\uFFFF]/g, (ch) => {
      const code = ch.charCodeAt(0);
      if (code === 0x00d7) return "x"; // ×
      if (code === 0x2013 || code === 0x2014) return "-";
      return ch;
    });
}

function normalizeWhitespace(value) {
  return stripDiacritics(String(value || ""))
    .replace(/\s+/g, " ")
    .trim();
}

/** Upper-cased, whitespace collapsed. */
function normalizeBrand(value) {
  if (!value) return "";
  const cleaned = normalizeWhitespace(value).toLowerCase();
  if (BRAND_ALIASES[cleaned]) return BRAND_ALIASES[cleaned];
  return normalizeWhitespace(value).toUpperCase();
}

function normalizeSeries(value) {
  return normalizeWhitespace(value).toUpperCase();
}

/**
 * Normalize a shade code. Hair-color shades come in many flavors:
 *   "10.13", "10-13", "10/13", "10·13", "10 13", "10,13", "10 . 13"
 *
 * We pick "/" as the canonical separator only when it's a numeric
 * code with multiple parts; otherwise we keep the original casing
 * but trim/collapse whitespace.
 *
 * Returns { canonical, key, parts }.
 *   canonical: stable display string (uppercased, no extra spaces)
 *   key:       string used for indexed lookup (digits + dashes)
 *   parts:     array of numeric components when applicable
 */
function normalizeShade(value) {
  if (value == null) return { canonical: "", key: "", parts: [] };
  const raw = normalizeWhitespace(value);
  if (!raw) return { canonical: "", key: "", parts: [] };

  const upper = raw.toUpperCase();

  // Pure-numeric shade codes get a stable key like "10-13".
  const numeric = upper.match(/^([0-9]+)\s*[\.\-\/\\,·]\s*([0-9]+(?:\s*[\.\-\/\\,·]\s*[0-9]+)*)$/);
  if (numeric) {
    const parts = upper
      .split(/[\.\-\/\\,·\s]+/)
      .filter(Boolean)
      .map((p) => p.trim());
    return {
      canonical: parts.join("."),
      key: parts.join("-"),
      parts: parts.map((p) => parseInt(p, 10)).filter((n) => Number.isFinite(n)),
    };
  }

  // Single-number ("CLEAR", "9", "BOOSTER GOLD"). Keep it.
  return {
    canonical: upper,
    key: upper.replace(/\s+/g, "_"),
    parts: [],
  };
}

/**
 * Apply DB shade aliases. Returns the canonical DB shade, or the
 * untouched canonical input.
 */
function applyShadeAlias(canonicalShade) {
  if (!canonicalShade) return { canonical: canonicalShade, aliasApplied: false, note: null };
  const lower = canonicalShade.toLowerCase();
  if (SHADE_ALIASES[lower]) {
    const map = SHADE_ALIASES[lower];
    return {
      canonical: map.canonical,
      aliasApplied: true,
      note: map.note || null,
    };
  }
  return { canonical: canonicalShade, aliasApplied: false, note: null };
}

/**
 * Combine brand + series + shade into a stable lookup key.
 */
function rowKey({ brand, series, shade }) {
  const b = normalizeBrand(brand);
  const s = normalizeSeries(series);
  const k = normalizeShade(shade).key || normalizeShade(shade).canonical;
  return `${b}::${s}::${k}`;
}

/**
 * Coerce a free-form weight ("60g", "60 g", "0.060kg", "60") into
 * grams (number or null when unknown).
 */
function normalizeWeightToGrams(value) {
  if (value == null || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const raw = String(value).toLowerCase().replace(/,/g, ".").trim();
  if (!raw) return null;
  const m = raw.match(/^([\d.]+)\s*(kg|g|ml|gr|oz)?\.?$/);
  if (!m) {
    const direct = parseFloat(raw);
    return Number.isFinite(direct) ? direct : null;
  }
  const num = parseFloat(m[1]);
  if (!Number.isFinite(num)) return null;
  const unit = (m[2] || "g").toLowerCase();
  switch (unit) {
    case "kg":
      return num * 1000;
    case "oz":
      return num * 28.3495;
    case "g":
    case "gr":
    case "ml": // assume 1ml ~ 1g for hair products
      return num;
    default:
      return num;
  }
}

/**
 * Coerce a price string ("₪28", "28 ILS", "28.00", "28,00") into a
 * positive number, or null when unknown.
 */
function normalizePrice(value) {
  if (value == null || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const raw = String(value)
    .replace(/[\u20aa\u20ac$£€¥]/g, "")
    .replace(/ILS|EUR|USD|GBP/gi, "")
    .replace(/,/g, ".")
    .replace(/[^\d\.\-]/g, "")
    .trim();
  if (!raw) return null;
  const num = parseFloat(raw);
  return Number.isFinite(num) && num >= 0 ? num : null;
}

module.exports = {
  SHADE_ALIASES,
  BRAND_ALIASES,
  stripDiacritics,
  normalizeWhitespace,
  normalizeBrand,
  normalizeSeries,
  normalizeShade,
  applyShadeAlias,
  rowKey,
  normalizeWeightToGrams,
  normalizePrice,
};
