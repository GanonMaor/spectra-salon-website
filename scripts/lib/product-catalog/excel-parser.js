/**
 * scripts/lib/product-catalog/excel-parser.js
 * ---------------------------------------------------------------
 * Parse uploaded .xlsx/.xls files into either a list of canonical
 * product rows (when the workbook already matches the import
 * schema) or a list of free-form catalog rows that the AI/web
 * enrichment layer can later complete.
 */

"use strict";

const XLSX = require("xlsx");

const { IMPORT_COLUMNS, parseBarcodesField, stringifyBarcodes } = require("./schema");
const {
  normalizeBrand,
  normalizeSeries,
  normalizeShade,
  normalizePrice,
  normalizeWeightToGrams,
  normalizeWhitespace,
  rowKey,
} = require("./normalizer");

/**
 * Detect whether a workbook is in the canonical Spectra import
 * format by checking for the required columns.
 */
function looksLikeImportSchema(headers) {
  const lower = headers.map((h) => String(h || "").toLowerCase().trim());
  const required = ["brand", "series", "shade", "barcodes"];
  return required.every((r) => lower.includes(r));
}

function indexHeaders(headers) {
  const lower = headers.map((h) => String(h || "").toLowerCase().trim());
  const idx = {};
  for (const col of IMPORT_COLUMNS) {
    const i = lower.indexOf(col.toLowerCase());
    if (i >= 0) idx[col] = i;
  }
  return idx;
}

/**
 * Coerce a single cell into the canonical column type.
 */
function coerceCell(col, value) {
  if (value == null) return col === "barcodes" ? "[]" : null;
  switch (col) {
    case "productId":
    case "image":
    case "catalogNo":
    case "hairColor":
    case "type":
    case "familyShade":
      return String(value).trim() || null;
    case "brand":
      return normalizeBrand(value);
    case "series":
      return normalizeSeries(value);
    case "shade":
      return normalizeShade(value).canonical;
    case "packingWeight":
    case "materialWeight":
      return normalizeWeightToGrams(value);
    case "ILS":
      return normalizePrice(value);
    case "barcodes":
      return stringifyBarcodes(parseBarcodesField(value));
    default:
      return value;
  }
}

/**
 * Parse a workbook that already matches the canonical import schema.
 */
function parseCanonicalWorkbook(buffer, opts = {}) {
  const wb = XLSX.read(buffer, { type: "buffer" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  if (!sheet) {
    return { rows: [], headers: [], format: "canonical", warnings: [] };
  }
  const json = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    raw: false,
    defval: null,
  });
  if (json.length === 0) {
    return { rows: [], headers: [], format: "canonical", warnings: [] };
  }
  const headers = json[0].map((h) => String(h || "").trim());
  const idx = indexHeaders(headers);

  const rows = [];
  for (let i = 1; i < json.length; i++) {
    const row = json[i];
    if (!row || row.every((c) => c == null || c === "")) continue;
    const out = {};
    for (const col of IMPORT_COLUMNS) {
      const colIdx = idx[col];
      out[col] = coerceCell(col, colIdx != null ? row[colIdx] : null);
    }
    out._sourceFile = opts.fileName || null;
    out._rowIndex = i;
    out._rowKey = rowKey({ brand: out.brand, series: out.series, shade: out.shade });
    rows.push(out);
  }

  return { rows, headers, format: "canonical", warnings: [] };
}

/**
 * Parse a non-canonical workbook (e.g. a brand price-list shipped by
 * a supplier). We still try to find shade-like columns so the
 * enrichment layer has structured data to work with.
 */
function parseFreeformWorkbook(buffer, opts = {}) {
  const wb = XLSX.read(buffer, { type: "buffer" });
  const allRows = [];
  const warnings = [];

  for (const sheetName of wb.SheetNames) {
    const sheet = wb.Sheets[sheetName];
    if (!sheet) continue;
    const json = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      raw: false,
      defval: null,
    });
    if (json.length === 0) continue;

    const headerRowIdx = findHeaderRow(json);
    if (headerRowIdx < 0) {
      warnings.push({
        code: "NO_HEADER",
        severity: "low",
        message: `Sheet "${sheetName}" has no recognizable header.`,
        source: opts.fileName,
      });
      continue;
    }

    const headers = json[headerRowIdx].map((h) =>
      normalizeWhitespace(String(h || "")).toLowerCase(),
    );

    const shadeIdx = headers.findIndex((h) =>
      /\b(shade|level|tonalit|colour|color)\b/.test(h),
    );
    const priceIdx = headers.findIndex((h) =>
      /\b(ils|nis|price|מחיר)\b/.test(h),
    );
    const barcodeIdx = headers.findIndex((h) =>
      /\b(ean|barcode|gtin|barkod|code|catalog)\b/.test(h),
    );
    const brandIdx = headers.findIndex((h) => /\b(brand|manufacturer)\b/.test(h));
    const seriesIdx = headers.findIndex((h) => /\b(series|line|family|range)\b/.test(h));
    const weightIdx = headers.findIndex((h) =>
      /\b(weight|grams?|gr|tube|ml|net)\b/.test(h),
    );
    const typeIdx = headers.findIndex((h) => /\b(type|category)\b/.test(h));

    if (shadeIdx < 0 && barcodeIdx < 0) {
      warnings.push({
        code: "UNRECOGNIZED_SHEET",
        severity: "low",
        message: `Sheet "${sheetName}" lacks shade/barcode columns; skipped.`,
        source: opts.fileName,
      });
      continue;
    }

    for (let i = headerRowIdx + 1; i < json.length; i++) {
      const row = json[i];
      if (!row || row.every((c) => c == null || c === "")) continue;
      const shade = shadeIdx >= 0 ? String(row[shadeIdx] || "").trim() : "";
      const barcodeVal = barcodeIdx >= 0 ? String(row[barcodeIdx] || "").trim() : "";
      if (!shade && !barcodeVal) continue;
      const out = {
        productId: null,
        brand: brandIdx >= 0 ? normalizeBrand(row[brandIdx]) : opts.defaultBrand || "",
        series:
          seriesIdx >= 0 ? normalizeSeries(row[seriesIdx]) : opts.defaultSeries || "",
        familyShade: null,
        shade: normalizeShade(shade).canonical,
        image: null,
        catalogNo: null,
        hairColor: null,
        type: typeIdx >= 0 && row[typeIdx] ? String(row[typeIdx]).toLowerCase() : opts.defaultType || null,
        packingWeight:
          weightIdx >= 0 ? normalizeWeightToGrams(row[weightIdx]) : opts.defaultPackingWeight || null,
        materialWeight: opts.defaultMaterialWeight || null,
        barcodes: stringifyBarcodes(parseBarcodesField(barcodeVal)),
        ILS:
          priceIdx >= 0 ? normalizePrice(row[priceIdx]) : opts.defaultIls || null,
        _sourceFile: opts.fileName || null,
        _sourceSheet: sheetName,
        _rowIndex: i,
      };
      out._rowKey = rowKey({ brand: out.brand, series: out.series, shade: out.shade });
      allRows.push(out);
    }
  }

  return { rows: allRows, headers: [], format: "freeform", warnings };
}

function findHeaderRow(json) {
  // The header row is the first row that contains a recognisable
  // shade/colour/level keyword. We scan the first 20 rows to be safe.
  const limit = Math.min(20, json.length);
  for (let i = 0; i < limit; i++) {
    const row = json[i] || [];
    for (const cell of row) {
      const s = normalizeWhitespace(String(cell || "")).toLowerCase();
      if (/\b(shade|tonalit|colour|color|barcode|ean|level|series|brand)\b/.test(s)) {
        return i;
      }
    }
  }
  return json.length > 0 ? 0 : -1;
}

/**
 * Top-level entry point. Decides between canonical/freeform parsing
 * based on header inspection.
 */
function parseExcelBuffer(buffer, opts = {}) {
  const wb = XLSX.read(buffer, { type: "buffer" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  if (!sheet) {
    return { rows: [], headers: [], format: "empty", warnings: [] };
  }
  const json = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    raw: false,
    defval: null,
  });
  const firstHeaders = (json[0] || []).map((h) => String(h || "").trim());
  if (looksLikeImportSchema(firstHeaders)) {
    return parseCanonicalWorkbook(buffer, opts);
  }
  return parseFreeformWorkbook(buffer, opts);
}

module.exports = {
  parseExcelBuffer,
  parseCanonicalWorkbook,
  parseFreeformWorkbook,
  looksLikeImportSchema,
};
