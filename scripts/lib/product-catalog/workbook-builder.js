/**
 * scripts/lib/product-catalog/workbook-builder.js
 * ---------------------------------------------------------------
 * Build a multi-sheet Excel workbook that the user can re-import
 * into Spectra. Mirrors the format used by `catalog_import_audit.xlsx`:
 *   - audit_summary
 *   - new_products_to_import
 *   - existing_products_to_update
 *   - barcode_gaps
 *   - ai_sources
 *   - format_reference
 */

"use strict";

const ExcelJS = require("exceljs");

const { IMPORT_COLUMNS, parseBarcodesField, stringifyBarcodes } = require("./schema");

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
    ["Mode", options.mode || "audit"],
    ["Brand override", options.brand || ""],
    ["Series override", options.series || ""],
    ["DB export rows", dbContext ? dbContext.rowCount : 0],
    ["DB brands", dbContext ? (dbContext.brands || []).join(", ") : ""],
    ["Total candidates parsed", rows.length],
    ["New rows", newRows.length],
    ["Existing updates", updateRows.length],
    ["Needs review / duplicate risk", reviewRows.length],
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

  // ── new_products_to_import ──
  const newSheet = wb.addWorksheet("new_products_to_import");
  newSheet.columns = IMPORT_COLUMNS.map((c) => ({ header: c, key: c, width: 18 }));
  newSheet.getColumn("barcodes").width = 32;
  newSheet.getColumn("brand").width = 18;
  newSheet.getColumn("series").width = 18;
  for (const r of newRows) newSheet.addRow(pickRow(r));
  styleHeaderRow(newSheet);

  // ── existing_products_to_update ──
  const upSheet = wb.addWorksheet("existing_products_to_update");
  upSheet.columns = IMPORT_COLUMNS.map((c) => ({ header: c, key: c, width: 18 }));
  upSheet.getColumn("barcodes").width = 32;
  for (const r of updateRows) upSheet.addRow(pickRow(r));
  styleHeaderRow(upSheet);

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
