/**
 * scripts/lib/product-catalog/schema.js
 * ---------------------------------------------------------------
 * Canonical schema for the product import Excel format used by
 * Spectra. Mirrors the columns of `products_*.xlsx` exports.
 *
 * Pure, dependency-free module. Unit tests:
 *   scripts/lib/product-catalog/__tests__/*.test.ts
 */

"use strict";

/** Canonical column order. Must match the existing DB export. */
const IMPORT_COLUMNS = [
  "productId",
  "brand",
  "series",
  "familyShade",
  "shade",
  "image",
  "catalogNo",
  "hairColor",
  "type",
  "packingWeight",
  "materialWeight",
  "barcodes",
  "ILS",
];

const REQUIRED_FOR_NEW = ["brand", "series", "shade", "type", "barcodes"];
const NUMERIC_COLUMNS = ["packingWeight", "materialWeight", "ILS"];
const ALLOWED_TYPES = [
  "color",
  "developer",
  "bleach",
  "toner",
  "treatment",
  "shampoo",
  "conditioner",
  "mask",
  "other",
];

/**
 * EAN-13 check digit validation. Returns true iff `barcode` is exactly
 * 13 ASCII digits and the trailing checksum digit is correct.
 */
function isValidEan13(barcode) {
  if (typeof barcode !== "string") return false;
  if (!/^\d{13}$/.test(barcode)) return false;
  const digits = barcode.split("").map((d) => parseInt(d, 10));
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * (i % 2 === 0 ? 1 : 3);
  }
  const check = (10 - (sum % 10)) % 10;
  return check === digits[12];
}

/** EAN-8 check digit validation. */
function isValidEan8(barcode) {
  if (typeof barcode !== "string") return false;
  if (!/^\d{8}$/.test(barcode)) return false;
  const digits = barcode.split("").map((d) => parseInt(d, 10));
  let sum = 0;
  for (let i = 0; i < 7; i++) {
    sum += digits[i] * (i % 2 === 0 ? 3 : 1);
  }
  const check = (10 - (sum % 10)) % 10;
  return check === digits[7];
}

/**
 * UPC-A check digit validation (12 digits).
 */
function isValidUpcA(barcode) {
  if (typeof barcode !== "string") return false;
  if (!/^\d{12}$/.test(barcode)) return false;
  const digits = barcode.split("").map((d) => parseInt(d, 10));
  let sum = 0;
  for (let i = 0; i < 11; i++) {
    sum += digits[i] * (i % 2 === 0 ? 3 : 1);
  }
  const check = (10 - (sum % 10)) % 10;
  return check === digits[11];
}

/** Recognises any of EAN-13/EAN-8/UPC-A. */
function isValidBarcode(value) {
  if (typeof value !== "string") return false;
  const v = value.trim();
  if (v.length === 13) return isValidEan13(v);
  if (v.length === 12) return isValidUpcA(v);
  if (v.length === 8) return isValidEan8(v);
  return false;
}

/**
 * Parse a barcodes field which may be either a JSON array string,
 * a single barcode, or a comma/semi-separated list. Returns a
 * trimmed string array (preserving order, deduped).
 */
function parseBarcodesField(value) {
  if (value == null) return [];
  if (Array.isArray(value)) {
    return dedupeStrings(value.map((v) => String(v).trim()).filter(Boolean));
  }
  const raw = String(value).trim();
  if (!raw || raw === "[]") return [];
  if (raw.startsWith("[")) {
    try {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        return dedupeStrings(arr.map((v) => String(v).trim()).filter(Boolean));
      }
    } catch (_) {
      // fall through to splitter
    }
  }
  return dedupeStrings(
    raw
      .split(/[,;\s\n]+/)
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

function dedupeStrings(arr) {
  const seen = new Set();
  const out = [];
  for (const v of arr) {
    if (!seen.has(v)) {
      seen.add(v);
      out.push(v);
    }
  }
  return out;
}

/** Serialize barcodes back to the canonical JSON array string. */
function stringifyBarcodes(arr) {
  if (!Array.isArray(arr)) return "[]";
  return JSON.stringify(arr.map((v) => String(v).trim()).filter(Boolean));
}

/**
 * Validate one canonical product row. Returns an array of warnings.
 * `mode` controls whether `productId` is required.
 *   - "new"    : productId must be blank, barcodes/price/material must exist
 *   - "update" : productId must be populated
 *   - "any"    : either is fine
 */
function validateRow(row, mode = "any") {
  const warnings = [];
  if (!row || typeof row !== "object") {
    warnings.push({
      code: "INVALID_ROW",
      severity: "critical",
      message: "Row is not an object.",
    });
    return warnings;
  }

  const hasProductId = !!row.productId && String(row.productId).trim();
  if (mode === "new" && hasProductId) {
    warnings.push({
      code: "PRODUCT_ID_ON_NEW_ROW",
      severity: "high",
      message:
        "productId must be blank on new-product rows. Clear it to create a new record.",
    });
  }
  if (mode === "update" && !hasProductId) {
    warnings.push({
      code: "PRODUCT_ID_MISSING",
      severity: "high",
      message: "productId is required for update rows.",
    });
  }

  for (const col of ["brand", "series", "shade"]) {
    if (!row[col] || !String(row[col]).trim()) {
      warnings.push({
        code: `MISSING_${col.toUpperCase()}`,
        severity: "critical",
        message: `Column "${col}" is required.`,
      });
    }
  }

  if (row.type && !ALLOWED_TYPES.includes(String(row.type).toLowerCase())) {
    warnings.push({
      code: "UNKNOWN_TYPE",
      severity: "low",
      message: `Type "${row.type}" is not in known set; allowed: ${ALLOWED_TYPES.join(", ")}.`,
    });
  }

  for (const col of NUMERIC_COLUMNS) {
    const v = row[col];
    if (v == null || v === "") continue;
    const n = typeof v === "number" ? v : parseFloat(String(v).replace(",", "."));
    if (!Number.isFinite(n) || n < 0) {
      warnings.push({
        code: `INVALID_NUMERIC_${col.toUpperCase()}`,
        severity: "high",
        message: `Column "${col}" must be a positive number, got "${v}".`,
      });
    }
  }

  // Barcode JSON array shape + per-barcode checksum.
  const codes = parseBarcodesField(row.barcodes);
  if (mode === "new" && codes.length === 0) {
    warnings.push({
      code: "BARCODE_MISSING",
      severity: "medium",
      message: "New rows should have at least one barcode.",
    });
  }
  for (const code of codes) {
    if (/^\d{12,13}$/.test(code) && !isValidBarcode(code)) {
      warnings.push({
        code: "BARCODE_CHECKDIGIT",
        severity: "high",
        message: `Barcode "${code}" failed EAN/UPC check-digit validation.`,
      });
    }
  }

  return warnings;
}

/**
 * Build an empty canonical row with all columns present.
 */
function emptyRow(overrides = {}) {
  return {
    productId: null,
    brand: "",
    series: "",
    familyShade: null,
    shade: "",
    image: null,
    catalogNo: null,
    hairColor: null,
    type: null,
    packingWeight: null,
    materialWeight: null,
    barcodes: "[]",
    ILS: null,
    ...overrides,
  };
}

module.exports = {
  IMPORT_COLUMNS,
  REQUIRED_FOR_NEW,
  NUMERIC_COLUMNS,
  ALLOWED_TYPES,
  isValidEan13,
  isValidEan8,
  isValidUpcA,
  isValidBarcode,
  parseBarcodesField,
  stringifyBarcodes,
  validateRow,
  emptyRow,
};
