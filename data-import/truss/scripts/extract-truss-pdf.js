#!/usr/bin/env node
/**
 * Extract TRUSS Israel barcode catalog PDF → normalized page records + QR/EAN.
 *
 * Usage:
 *   node data-import/truss/scripts/extract-truss-pdf.js
 *   node data-import/truss/scripts/extract-truss-pdf.js --skip-render
 */

"use strict";

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { parsePageText } = require("../lib/parse-page");
const { decodeQrFromPngFile, pageImagePath } = require("../lib/qr-decode");
const { validateBarcode } = require("../lib/ean");

const ROOT = path.resolve(__dirname, "../../..");
const TRUSS_ROOT = path.resolve(__dirname, "..");
const PDF_PATH = path.join(TRUSS_ROOT, "source/barcode-catalog-1.pdf");
const PAGES_DIR = path.join(TRUSS_ROOT, "media/pages");
const OUT_DIR = path.join(TRUSS_ROOT, "normalized");
const REPORTS_DIR = path.join(TRUSS_ROOT, "reports");
const REPO_REPORTS = path.join(ROOT, "reports/truss-catalog");

function ensureDirs() {
  for (const dir of [PAGES_DIR, OUT_DIR, REPORTS_DIR, REPO_REPORTS]) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function renderPagesIfNeeded(skipRender) {
  const existing = fs.existsSync(PAGES_DIR)
    ? fs.readdirSync(PAGES_DIR).filter((f) => f.endsWith(".png"))
    : [];
  if (skipRender && existing.length >= 128) {
    console.log(`Using ${existing.length} existing page PNGs`);
    return;
  }
  console.log("Rendering PDF pages with pdftoppm @200dpi...");
  fs.mkdirSync(PAGES_DIR, { recursive: true });
  execFileSync(
    "pdftoppm",
    ["-png", "-r", "200", PDF_PATH, path.join(PAGES_DIR, "page")],
    { stdio: "inherit" },
  );
}

function extractPageTexts() {
  const textPath = path.join(TRUSS_ROOT, "media/all-text.txt");
  execFileSync("pdftotext", ["-layout", PDF_PATH, textPath], { stdio: "pipe" });
  const full = fs.readFileSync(textPath, "utf8");
  // Form-feed separates pages from pdftotext
  const pages = full.split("\f");
  // pdftotext often leaves a trailing empty page slice
  while (pages.length && !pages[pages.length - 1].trim()) pages.pop();
  return pages;
}

function main() {
  const skipRender = process.argv.includes("--skip-render");
  ensureDirs();

  if (!fs.existsSync(PDF_PATH)) {
    console.error(`PDF missing: ${PDF_PATH}`);
    process.exit(1);
  }

  renderPagesIfNeeded(skipRender);
  const pageTexts = extractPageTexts();
  console.log(`Text pages: ${pageTexts.length}`);

  const records = [];
  const qrFailures = [];

  for (let i = 0; i < pageTexts.length; i++) {
    const pageNumber = i + 1;
    const parsed = parsePageText(pageTexts[i], pageNumber);
    const imgPath = pageImagePath(PAGES_DIR, pageNumber);
    let qr = { decoded: false, raw: null, ean: null, validation: null };
    if (fs.existsSync(imgPath)) {
      try {
        qr = decodeQrFromPngFile(imgPath);
      } catch (err) {
        qr = { decoded: false, raw: null, ean: null, validation: null, error: String(err.message || err) };
      }
    } else {
      qrFailures.push({ page: pageNumber, reason: "missing_page_image" });
    }

    if (!qr.decoded) {
      qrFailures.push({
        page: pageNumber,
        reason: qr.error || "qr_not_decoded",
        trs: parsed.trs_code,
      });
    }

    const eanValidation = qr.validation || validateBarcode(qr.ean);
    const record = {
      ...parsed,
      ean_barcode: eanValidation && eanValidation.ok ? eanValidation.barcode : qr.ean || null,
      ean_valid: Boolean(eanValidation && eanValidation.ok),
      ean_barcode_type: eanValidation ? eanValidation.barcode_type : null,
      qr_decoded: Boolean(qr.decoded),
      qr_raw: qr.raw,
      page_image_path: path.relative(ROOT, imgPath),
      supplier_name: parsed.display_name,
      official_name: null,
      official_description: null,
      key_benefits: null,
      intended_hair_type: null,
      recommended_use: null,
      professional_instructions: null,
      ingredients: null,
      official_product_url: null,
      official_image_url: null,
      description_source_url: null,
      image_source_url: null,
      source_domain: null,
      source_type: "pdf_catalog",
      source_checked_at: null,
      source_confidence: qr.decoded && eanValidation && eanValidation.ok ? "high_identity" : "low",
      image_status: "missing_official_image",
      primary_image_path: null,
      enrichment_status: "extracted",
    };

    if (!record.ean_valid || !record.trs_code) {
      record.source_status = "needs_review";
    }

    records.push(record);
  }

  const outJson = path.join(OUT_DIR, "extracted-records.json");
  fs.writeFileSync(outJson, JSON.stringify(records, null, 2));

  const qrReport = {
    generated_at: new Date().toISOString(),
    total_pages: records.length,
    decoded: records.filter((r) => r.qr_decoded).length,
    failed: qrFailures.length,
    failures: qrFailures,
    sample_ok: records
      .filter((r) => r.ean_valid)
      .slice(0, 5)
      .map((r) => ({ page: r.source_pdf_page, trs: r.trs_code, ean: r.ean_barcode })),
  };

  fs.writeFileSync(path.join(REPORTS_DIR, "qr-ean-extraction-report.json"), JSON.stringify(qrReport, null, 2));
  fs.writeFileSync(path.join(REPO_REPORTS, "qr-ean-extraction-report.json"), JSON.stringify(qrReport, null, 2));

  console.log(`Wrote ${records.length} records → ${outJson}`);
  console.log(`QR decoded: ${qrReport.decoded}/${qrReport.total_pages}; failed: ${qrReport.failed}`);
}

main();
