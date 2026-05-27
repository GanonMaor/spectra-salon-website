/**
 * scripts/lib/product-catalog/workbook-builder.js
 * ---------------------------------------------------------------
 * Build a multi-sheet Excel workbook that the user can re-import
 * into Spectra. The first sheet is the actual import sheet and
 * MUST be byte-for-byte schema compatible with the uploaded DB
 * export — same headers, same order, same casing, no extra columns.
 *
 * Subsequent sheets are evidence/audit tabs and never participate
 * in the import:
 *   - audit_summary
 *   - barcode_gaps
 *   - ai_sources
 *   - needs_review
 *   - customer_request_summary
 *   - source_evidence
 *   - quick_add_candidates
 *   - format_reference
 */

"use strict";

const ExcelJS = require("exceljs");

const { IMPORT_COLUMNS, parseBarcodesField, stringifyBarcodes } = require("./schema");

/**
 * Columns that must be persisted as text in the import sheet so
 * Excel never coerces shade codes, product IDs, catalog numbers,
 * barcode arrays, or image filenames into dates / floats / scientific
 * notation when the file is opened.
 */
const TEXT_SAFE_COLUMNS = new Set([
  "productId",
  "brand",
  "series",
  "familyShade",
  "shade",
  "image",
  "catalogNo",
  "hairColor",
  "type",
  "barcodes",
]);

/**
 * Numeric columns that should keep their numeric type so the
 * back-end can read them as numbers.
 */
const NUMERIC_IMPORT_COLUMNS = new Set([
  "packingWeight",
  "materialWeight",
  "ILS",
]);

const FORMAT_REFERENCE_ROWS = [
  ["productId", "only for updates", "blank = create new product, populated = update existing"],
  ["brand", "yes", "exact spelling (e.g. MONTIBELLO, ARTEGO)"],
  ["series", "yes", "uppercase, exact spelling"],
  ["familyShade", "no", "optional family/group label (e.g. LEVEL 6)"],
  ["shade", "yes", "shade code as-is, e.g. 6.65 or BOOSTER GOLD"],
  ["image", "no", "filename of the catalog image (optional)"],
  ["catalogNo", "no", "manufacturer SKU (optional)"],
  ["hairColor", "no", "human readable color (optional)"],
  ["type", "yes", "color | developer | bleach | toner | treatment | shampoo | …"],
  ["packingWeight", "no", "tube size in grams; numeric"],
  ["materialWeight", "no", "active formula weight in grams; numeric"],
  ["barcodes", "yes", 'JSON array string, e.g. ["8429525440726"]; EAN-13 must pass check digit'],
  ["ILS", "yes", "retail price in ILS; numeric"],
];

function pickRow(row) {
  const out = {};
  for (const col of IMPORT_COLUMNS) {
    let value = row[col];
    if (col === "barcodes") {
      value = stringifyBarcodes(parseBarcodesField(value));
    }
    if (value == null) value = "";
    out[col] = value;
  }
  return out;
}

/**
 * Eligible-for-import predicate. Mixed sheet contains:
 *   - rows matched to an existing DB product (status === "update"),
 *     keeping the matched productId so the import re-uses it.
 *   - rows the system flagged as new (status === "new" or
 *     "missing-critical-data" with at least brand+series+shade),
 *     with productId blank so the import creates them.
 *
 * Duplicate-risk and unresolved review rows are NOT included in the
 * import sheet — they live on the `needs_review` audit sheet so the
 * operator must resolve them before re-running.
 */
function isImportable(row) {
  if (!row) return false;
  if (row._status === "duplicate-risk" || row._status === "needs-review") return false;
  if (!row.brand || !row.series || !row.shade) return false;
  return true;
}

/**
 * Decide what value to write for one canonical column on the
 * import sheet. Returns the raw value plus an explicit numFmt.
 *
 *   - identifier-like fields are forced to text via the "@" format;
 *   - barcode arrays are written as JSON-array strings to keep
 *     leading zeros and prevent scientific notation;
 *   - numeric fields are returned as Number when finite, else "".
 */
function buildImportCellValue(col, raw) {
  if (col === "barcodes") {
    return { value: stringifyBarcodes(parseBarcodesField(raw)), numFmt: "@" };
  }
  if (TEXT_SAFE_COLUMNS.has(col)) {
    if (raw == null) return { value: "", numFmt: "@" };
    return { value: String(raw), numFmt: "@" };
  }
  if (NUMERIC_IMPORT_COLUMNS.has(col)) {
    if (raw == null || raw === "") return { value: null, numFmt: "General" };
    const num = Number(raw);
    if (!Number.isFinite(num)) return { value: null, numFmt: "General" };
    return { value: num, numFmt: "General" };
  }
  if (raw == null) return { value: "", numFmt: "@" };
  return { value: String(raw), numFmt: "@" };
}

/**
 * Map an internal row to the canonical product columns we will
 * write into the import sheet. Update rows keep their matched
 * productId; new rows leave productId blank.
 */
function shapeImportRow(row) {
  const matchedId = row._matchedProductId || row.matchedProductId || null;
  const productId =
    row._status === "update"
      ? row.productId || matchedId || ""
      : ""; // new row -> blank productId so the system creates it
  return {
    productId,
    brand: row.brand || "",
    series: row.series || "",
    familyShade: row.familyShade || "",
    shade: row.shade || "",
    image: row.image || "",
    catalogNo: row.catalogNo || "",
    hairColor: row.hairColor || "",
    type: row.type || "",
    packingWeight:
      row.packingWeight == null || row.packingWeight === "" ? null : row.packingWeight,
    materialWeight:
      row.materialWeight == null || row.materialWeight === "" ? null : row.materialWeight,
    barcodes: stringifyBarcodes(parseBarcodesField(row.barcodes)),
    ILS: row.ILS == null || row.ILS === "" ? null : row.ILS,
  };
}

/**
 * Resolve the headers and sheet name for the import sheet.
 *
 * Priority:
 *   1. `dbContext.originalHeaders` + `dbContext.sheetName` from the
 *      saved DB snapshot — guarantees byte-for-byte compatibility.
 *   2. Fall back to canonical IMPORT_COLUMNS / "Sheet1".
 *
 * If the original headers are missing some canonical columns, we
 * still want to re-export them. We therefore start from
 * `originalHeaders` (preserving order/casing) and append any
 * missing canonical columns at the end so nothing is silently
 * dropped.
 */
function resolveImportLayout(dbContext) {
  const sheetName = (dbContext && dbContext.sheetName) || "Sheet1";
  const original = Array.isArray(dbContext && dbContext.originalHeaders)
    ? dbContext.originalHeaders.filter((h) => h !== null && h !== undefined)
    : [];

  const headerToCol = new Map();
  for (const col of IMPORT_COLUMNS) headerToCol.set(col.toLowerCase().trim(), col);

  const columnsLayout = [];
  const used = new Set();
  for (const headerRaw of original) {
    const header = String(headerRaw);
    const col = headerToCol.get(header.toLowerCase().trim());
    if (col) {
      used.add(col);
      columnsLayout.push({ header, col });
    } else {
      // Header that isn't part of the canonical schema. Keep it as a
      // pass-through so we don't drop columns the customer's import
      // pipeline relies on.
      columnsLayout.push({ header, col: null });
    }
  }
  for (const col of IMPORT_COLUMNS) {
    if (!used.has(col)) columnsLayout.push({ header: col, col });
  }
  return { sheetName, columnsLayout };
}

function styleHeaderRow(sheet) {
  const header = sheet.getRow(1);
  header.font = { bold: true };
  header.alignment = { vertical: "middle", horizontal: "left" };
  header.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFEDEDED" },
  };
}

function autoSize(sheet) {
  sheet.columns.forEach((col) => {
    let max = (col.header && col.header.length) || 10;
    col.eachCell({ includeEmpty: false }, (cell) => {
      const v = cell.value == null ? "" : String(cell.value);
      if (v.length > max) max = v.length;
    });
    col.width = Math.min(60, Math.max(10, max + 2));
  });
}

/**
 * Build the workbook from a set of decided rows + audit metadata.
 * Returns the buffer (not the file).
 */
async function buildWorkbookBuffer({
  rows = [],
  warnings = [],
  options = {},
  enrichmentSources = [],
  jobId = null,
  dbContext = null,
  requestText = "",
  requestBullets = [],
  detectedLinks = [],
  urlEvidence = [],
}) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Spectra Catalog Import";
  wb.created = new Date();

  const newRows = rows.filter((r) => r._status === "new" || r._status === "missing-critical-data");
  const updateRows = rows.filter((r) => r._status === "update");
  const reviewRows = rows.filter(
    (r) => r._status === "needs-review" || r._status === "duplicate-risk",
  );
  const barcodeGapRows = rows.filter((r) => parseBarcodesField(r.barcodes).length === 0);
  const importableRows = rows.filter(isImportable);

  // ── Sheet 1: import-ready table that mixes update + create rows ──
  // This MUST be byte-for-byte compatible with the uploaded DB
  // export. No new columns, no renamed headers, text-safe values.
  const layout = resolveImportLayout(dbContext);
  const importSheet = wb.addWorksheet(layout.sheetName, {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  // Build columns in the exact order of the original DB header row.
  importSheet.columns = layout.columnsLayout.map((c) => ({
    header: c.header,
    key: c.col || `__passthrough_${c.header}`,
    width: c.col === "barcodes" ? 32 : 18,
  }));
  // Force every column on the import sheet to text format by default.
  // We override the three numeric columns below.
  for (const colDef of layout.columnsLayout) {
    const wsCol = importSheet.getColumn(colDef.col || `__passthrough_${colDef.header}`);
    if (colDef.col && NUMERIC_IMPORT_COLUMNS.has(colDef.col)) {
      wsCol.numFmt = "General";
    } else {
      wsCol.numFmt = "@";
    }
  }
  for (const r of importableRows) {
    const shaped = shapeImportRow(r);
    const rowValues = layout.columnsLayout.map((c) =>
      c.col ? buildImportCellValue(c.col, shaped[c.col]).value : "",
    );
    const added = importSheet.addRow(rowValues);
    layout.columnsLayout.forEach((c, i) => {
      const cell = added.getCell(i + 1);
      if (!c.col) {
        cell.numFmt = "@";
        cell.value = "";
        return;
      }
      const formatted = buildImportCellValue(c.col, shaped[c.col]);
      cell.numFmt = formatted.numFmt;
      cell.value = formatted.value;
    });
  }
  styleHeaderRow(importSheet);

  // ── audit_summary ──
  const summary = wb.addWorksheet("audit_summary");
  summary.columns = [
    { header: "metric", key: "metric", width: 36 },
    { header: "value", key: "value", width: 60 },
  ];
  const textRows = rows.filter((r) => r._sourceKind === "text").length;
  const urlRows = rows.filter((r) => r._sourceKind === "url").length;
  const visionRows = rows.filter(
    (r) => r._sourceKind === "vision" || r._sourceKind === "image",
  ).length;
  const quickAddCount = rows.filter((r) => r._quickAdd === true).length;

  summary.addRows([
    ["Job ID", jobId || ""],
    ["Generated at", new Date().toISOString()],
    ["Import sheet name", layout.sheetName],
    ["Import sheet headers", layout.columnsLayout.map((c) => c.header).join(", ")],
    ["DB export file", dbContext ? dbContext.fileName || "" : ""],
    ["DB uploaded at", dbContext ? dbContext.uploadedAt || "" : ""],
    ["DB export rows", dbContext ? dbContext.rowCount : 0],
    ["DB brands", dbContext ? (dbContext.brands || []).join(", ") : ""],
    ["Total candidates parsed", rows.length],
    ["Import sheet rows total", importableRows.length],
    ["  · update rows (with productId)", updateRows.length],
    ["  · new rows (productId blank)", newRows.length],
    ["Held back: needs review / duplicate", reviewRows.length],
    ["Barcode gaps", barcodeGapRows.length],
    ["Enrichment sources", enrichmentSources.length],
    ["From customer text", textRows],
    ["From URLs", urlRows],
    ["From images / vision", visionRows],
    ["Quick-add candidates", quickAddCount],
    ["Detected links", (detectedLinks || []).length],
    ["Request bullets", (requestBullets || []).length],
  ]);
  styleHeaderRow(summary);

  if (warnings.length > 0) {
    summary.addRow([]);
    const warnHeader = summary.addRow(["warning", "details"]);
    warnHeader.font = { bold: true };
    for (const w of warnings) {
      summary.addRow([
        `${w.severity.toUpperCase()}: ${w.code}`,
        `${w.message}${w.source ? ` (${w.source})` : ""}`,
      ]);
    }
  }

  // ── barcode_gaps ──
  const gapSheet = wb.addWorksheet("barcode_gaps");
  gapSheet.columns = [
    { header: "brand", key: "brand", width: 18 },
    { header: "series", key: "series", width: 18 },
    { header: "shade", key: "shade", width: 18 },
    { header: "productId", key: "productId", width: 36 },
    { header: "current_barcodes", key: "current", width: 28 },
    { header: "status", key: "status", width: 18 },
    { header: "source", key: "source", width: 36 },
  ];
  for (const r of barcodeGapRows) {
    gapSheet.addRow({
      brand: r.brand,
      series: r.series,
      shade: r.shade,
      productId: r.productId || "",
      current: stringifyBarcodes(parseBarcodesField(r.barcodes)),
      status: r._status,
      source: (r.sources || []).join(" | "),
    });
  }
  styleHeaderRow(gapSheet);

  // ── ai_sources ──
  if (enrichmentSources.length > 0) {
    const aiSheet = wb.addWorksheet("ai_sources");
    aiSheet.columns = [
      { header: "rowKey", key: "rowKey", width: 36 },
      { header: "field", key: "field", width: 16 },
      { header: "value", key: "value", width: 24 },
      { header: "confidence", key: "confidence", width: 12 },
      { header: "domain", key: "domain", width: 24 },
      { header: "url", key: "url", width: 60 },
      { header: "reason", key: "reason", width: 60 },
    ];
    for (const src of enrichmentSources) {
      aiSheet.addRow({
        rowKey: src.rowKey || "",
        field: src.field || "",
        value: src.value || "",
        confidence: src.confidence || "",
        domain: src.domain || "",
        url: src.url || "",
        reason: src.reason || "",
      });
    }
    styleHeaderRow(aiSheet);
  }

  // ── needs_review ──
  if (reviewRows.length > 0) {
    const rvSheet = wb.addWorksheet("needs_review");
    rvSheet.columns = [
      { header: "brand", key: "brand", width: 18 },
      { header: "series", key: "series", width: 18 },
      { header: "shade", key: "shade", width: 16 },
      { header: "status", key: "status", width: 18 },
      { header: "issues", key: "issues", width: 80 },
      { header: "source", key: "source", width: 36 },
    ];
    for (const r of reviewRows) {
      rvSheet.addRow({
        brand: r.brand,
        series: r.series,
        shade: r.shade,
        status: r._status,
        issues: (r._issues || [])
          .map((i) => `[${i.severity}] ${i.code}: ${i.message}`)
          .join(" | "),
        source: (r.sources || []).join(" | "),
      });
    }
    styleHeaderRow(rvSheet);
  }

  // ── customer_request_summary ──
  const hasRequestContext =
    (requestText && String(requestText).trim().length > 0) ||
    (Array.isArray(requestBullets) && requestBullets.length > 0) ||
    (Array.isArray(detectedLinks) && detectedLinks.length > 0);
  if (hasRequestContext) {
    const reqSheet = wb.addWorksheet("customer_request_summary");
    reqSheet.columns = [
      { header: "field", key: "field", width: 22 },
      { header: "value", key: "value", width: 100 },
    ];
    reqSheet.addRow(["Pasted request", String(requestText || "").slice(0, 8000)]);
    reqSheet.addRow(["Detected bullets", (requestBullets || []).length]);
    reqSheet.addRow(["Detected links", (detectedLinks || []).length]);
    reqSheet.addRow([]);
    const bHeader = reqSheet.addRow([
      "bullet#",
      "raw",
      "brand",
      "series",
      "shades",
      "quickAdd",
      "type",
      "note",
    ]);
    bHeader.font = { bold: true };
    (requestBullets || []).forEach((b, i) => {
      reqSheet.addRow([
        i + 1,
        b.raw || "",
        b.brand || "",
        b.series || "",
        Array.isArray(b.shades) ? b.shades.join(", ") : "",
        b.quickAdd ? "yes" : "",
        b.type || "",
        b.note || "",
      ]);
    });
    styleHeaderRow(reqSheet);
  }

  // ── source_evidence ──
  const evidenceRows = [];
  for (const r of rows) {
    const ev = Array.isArray(r._evidence) ? r._evidence : [];
    if (ev.length === 0) continue;
    for (const e of ev) {
      evidenceRows.push({
        rowKey: `${r.brand}::${r.series}::${r.shade}`,
        kind: e.kind || "",
        source: e.source || "",
        detail: e.detail || "",
        snippet: e.snippet || "",
        confidence: e.confidence || "",
      });
    }
  }
  for (const u of urlEvidence || []) {
    evidenceRows.push({
      rowKey: "",
      kind: "url-fetch",
      source: u.url || "",
      detail: u.title || (u.ok ? "" : `failed: ${u.reason || ""}`),
      snippet: u.snippet || "",
      confidence: u.ok ? "medium" : "low",
    });
  }
  if (evidenceRows.length > 0) {
    const evSheet = wb.addWorksheet("source_evidence");
    evSheet.columns = [
      { header: "rowKey", key: "rowKey", width: 40 },
      { header: "kind", key: "kind", width: 14 },
      { header: "source", key: "source", width: 56 },
      { header: "detail", key: "detail", width: 60 },
      { header: "snippet", key: "snippet", width: 80 },
      { header: "confidence", key: "confidence", width: 12 },
    ];
    for (const e of evidenceRows) evSheet.addRow(e);
    styleHeaderRow(evSheet);
  }

  // ── quick_add_candidates ──
  const quickAddRows = rows.filter((r) => r._quickAdd === true);
  if (quickAddRows.length > 0) {
    const qaSheet = wb.addWorksheet("quick_add_candidates");
    qaSheet.columns = [
      { header: "brand", key: "brand", width: 18 },
      { header: "series", key: "series", width: 22 },
      { header: "shade", key: "shade", width: 18 },
      { header: "type", key: "type", width: 14 },
      { header: "service_context", key: "serviceContext", width: 16 },
      { header: "status", key: "status", width: 18 },
      { header: "matchedProductId", key: "matchedProductId", width: 36 },
      { header: "notes", key: "notes", width: 60 },
      { header: "source", key: "source", width: 36 },
    ];
    for (const r of quickAddRows) {
      qaSheet.addRow({
        brand: r.brand,
        series: r.series,
        shade: r.shade,
        type: r.type || "",
        serviceContext: r._serviceContext || "",
        status: r._status,
        matchedProductId: r._matchedProductId || "",
        notes: r._notes || "",
        source: (r.sources || []).join(" | "),
      });
    }
    styleHeaderRow(qaSheet);
  }

  // ── format_reference ──
  const fmt = wb.addWorksheet("format_reference");
  fmt.columns = [
    { header: "column", key: "column", width: 22 },
    { header: "required", key: "required", width: 18 },
    { header: "notes", key: "notes", width: 80 },
  ];
  for (const r of FORMAT_REFERENCE_ROWS) fmt.addRow(r);
  styleHeaderRow(fmt);

  // Final auto-sizing pass.
  for (const sheet of wb.worksheets) autoSize(sheet);

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}

module.exports = {
  buildWorkbookBuffer,
  FORMAT_REFERENCE_ROWS,
};
