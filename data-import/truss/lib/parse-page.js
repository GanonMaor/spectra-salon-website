/**
 * Parse one TRUSS Israel barcode-catalog PDF page (text layer).
 *
 * Typical layout:
 *   CARE                              BASIC
 *             BASIC >> CONDITIONER >> TRS-8557
 *   ■■■■■■■                       BASIC CONDITIONER 2400ML
 */

"use strict";

const SIZE_RE = /(\d+(?:[.,]\d+)?)\s*(ML|G|KG|L|OZ)\b/i;
const TRS_RE = /\bTRS-?\s*(\d+)\b/i;
const BREADCRUMB_RE =
  /^(.+?)\s*>>\s*(.+?)\s*>>\s*TRS-?\s*(\d+)\s*$/i;
const SHADE_RE =
  /(?:PERMANENT|SEMI[-\s]?PERMANENT|TONER|LIGHTENING)\s*[-–]\s*(\d+(?:\.\d+)?)\b/i;
const COLOR_LEVEL_RE = /^(\d{1,2})(?:\.(\d+))?$/;

function slugify(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function normalizeWhitespace(value) {
  return String(value || "")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .trim();
}

function parseSize(displayName) {
  const m = String(displayName || "").match(SIZE_RE);
  if (!m) {
    return { size_value: null, size_unit: null, size_display: null };
  }
  const size_value = Number(String(m[1]).replace(",", "."));
  const size_unit = m[2].toUpperCase();
  return {
    size_value: Number.isFinite(size_value) ? size_value : null,
    size_unit,
    size_display: `${size_value}${size_unit}`,
  };
}

function mapCategoryToProductType(category, division, displayName) {
  const cat = String(category || "").toUpperCase();
  const name = String(displayName || "").toUpperCase();
  if (division === "COLOR" || cat.includes("HAIR COLOR") || cat.includes("LIGHTENING")) {
    if (name.includes("SEMI")) return "toner"; // will refine below
    if (cat.includes("LIGHTENING") || name.includes("BLEACH") || name.includes("LIGHTEN")) {
      return "bleach";
    }
    if (name.includes("TONER") || cat === "TONER") return "toner";
    if (name.includes("SEMI")) return "color";
    return "color";
  }
  if (cat.includes("SHAMPOO") || name.includes("SHAMPOO")) return "shampoo";
  if (cat.includes("CONDITIONER") || name.includes("CONDITIONER")) return "conditioner";
  if (cat.includes("MASK") || name.includes("MASK")) return "mask";
  if (cat.includes("TREATMENT") || cat.includes("FINISHING") || name.includes("TREATMENT")) {
    return "treatment";
  }
  return "other";
}

function parseShade(displayName, productLine) {
  const name = String(displayName || "");
  const m = name.match(SHADE_RE);
  let shade_code = m ? m[1] : null;
  if (!shade_code) {
    const loose = name.match(/\b(\d{1,2}\.\d{1,3})\b/);
    if (loose && /PERMANENT|SEMI|TONER|COLOR/i.test(name)) shade_code = loose[1];
  }
  if (!shade_code) {
    return {
      shade_code: null,
      shade_name: null,
      color_level: null,
      primary_tone: null,
      permanent_type: null,
    };
  }
  const levelMatch = shade_code.match(COLOR_LEVEL_RE);
  const color_level = levelMatch ? Number(levelMatch[1]) : null;
  const tonePart = levelMatch && levelMatch[2] ? levelMatch[2] : null;
  let permanent_type = null;
  const upperLine = String(productLine || "").toUpperCase();
  const upperName = name.toUpperCase();
  if (upperLine.includes("SEMI") || upperName.includes("SEMI")) permanent_type = "semi_permanent";
  else if (upperLine.includes("TONER") || upperName.includes("TONER")) permanent_type = "toner";
  else if (upperLine.includes("LIGHTENING") || upperName.includes("LIGHTENING")) {
    permanent_type = "lightening";
  } else if (upperLine.includes("PERMANENT") || upperName.includes("PERMANENT")) {
    permanent_type = "permanent";
  }

  // Shade name = text after shade code
  let shade_name = null;
  const after = name.split(shade_code)[1];
  if (after) {
    shade_name = after.replace(/^[\s\-–]+/, "").replace(/\s+\d+(?:[.,]\d+)?\s*(ML|G|KG|L|OZ)\s*$/i, "").trim() || null;
  }

  return {
    shade_code,
    shade_name,
    color_level,
    primary_tone: tonePart,
    permanent_type,
  };
}

function classifyProfessionalOrRetail(sizeValue, sizeUnit, category) {
  const unit = String(sizeUnit || "").toUpperCase();
  const value = Number(sizeValue) || 0;
  // Salon/pro packs tend to be liter+ or 1000ml / 2400ml / 500g bleach
  if ((unit === "ML" && value >= 1000) || (unit === "L" && value >= 1) || (unit === "G" && value >= 500)) {
    return "professional";
  }
  if (String(category || "").toUpperCase().includes("HAIR COLOR")) return "professional";
  return "retail";
}

/**
 * @param {string} pageText
 * @param {number} pageNumber 1-based
 */
function parsePageText(pageText, pageNumber) {
  const text = normalizeWhitespace(pageText);
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !/^■+$/.test(l.replace(/\s/g, "")));

  let division = null;
  let product_line = null;
  let category = null;
  let trs_code = null;
  let display_name = null;

  for (const line of lines) {
    const divMatch = line.match(/^(CARE|COLOR)\b\s*(.*)$/i);
    if (divMatch && !division) {
      division = divMatch[1].toUpperCase();
      const rest = divMatch[2].trim();
      if (rest) product_line = rest;
      continue;
    }

    const crumb = line.match(BREADCRUMB_RE);
    if (crumb) {
      product_line = crumb[1].trim();
      category = crumb[2].trim();
      trs_code = `TRS-${crumb[3]}`;
      continue;
    }

    const trsOnly = line.match(TRS_RE);
    if (trsOnly && !trs_code) {
      trs_code = `TRS-${trsOnly[1]}`;
    }

    // Product display line: usually the longest non-meta line containing a size.
    if (SIZE_RE.test(line) || /PERMANENT|TONER|SEMI|SHAMPOO|CONDITIONER|MASK|TREATMENT/i.test(line)) {
      // Prefer lines that look like product titles over breadcrumbs.
      if (!line.includes(">>")) {
        display_name = line.replace(/^■+\s*/, "").trim();
      }
    }
  }

  // Fallback: last substantial line
  if (!display_name) {
    const candidates = lines.filter((l) => !/^(CARE|COLOR)\b/i.test(l) && !l.includes(">>"));
    display_name = candidates[candidates.length - 1] || null;
  }

  if (!trs_code) {
    const anyTrs = text.match(TRS_RE);
    if (anyTrs) trs_code = `TRS-${anyTrs[1]}`;
  }

  const size = parseSize(display_name);
  const shade = parseShade(display_name, product_line);
  const product_type = mapCategoryToProductType(category, division, display_name);
  const professional_or_retail = classifyProfessionalOrRetail(
    size.size_value,
    size.size_unit,
    category,
  );

  const product_name = display_name
    ? display_name.replace(SIZE_RE, "").replace(/\s{2,}/g, " ").trim()
    : null;

  const normalized_product_name = product_name
    ? product_name
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .replace(/[^A-Z0-9.]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    : null;

  return {
    brand: "TRUSS",
    brand_slug: "truss-professional",
    division: division || null,
    product_line: product_line || null,
    product_line_slug: slugify(product_line),
    category: category || null,
    subcategory: null,
    product_name,
    normalized_product_name,
    display_name,
    product_type,
    professional_or_retail,
    shade_code: shade.shade_code,
    shade_name: shade.shade_name,
    color_level: shade.color_level,
    primary_tone: shade.primary_tone,
    permanent_type: shade.permanent_type,
    size_value: size.size_value,
    size_unit: size.size_unit,
    size_display: size.size_display,
    trs_code,
    source_pdf_page: pageNumber,
    source_pdf_text: text,
    source_status: trs_code && display_name ? "extracted" : "needs_review",
  };
}

module.exports = {
  slugify,
  parsePageText,
  parseSize,
  parseShade,
  normalizeWhitespace,
  mapCategoryToProductType,
};
