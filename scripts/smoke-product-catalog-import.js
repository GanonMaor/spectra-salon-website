#!/usr/bin/env node
/**
 * scripts/smoke-product-catalog-import.js
 * ---------------------------------------------------------------
 * End-to-end smoke test for the product-catalog-import Netlify
 * function. Exercises the full preview → enrich → export pipeline
 * against real ECLAT/CROMATONE PDFs and the products_*.xlsx DB
 * export. AI enrichment is deliberately disabled so the script
 * runs offline and is deterministic.
 *
 * Usage:
 *   node scripts/smoke-product-catalog-import.js
 *
 * Env overrides:
 *   ECLAT_PDF, CROMATONE_PDF, DB_EXPORT_XLSX
 */

"use strict";

const fs = require("fs");
const path = require("path");

const fn = require("../netlify/functions/product-catalog-import");

const DOWNLOADS = path.join(process.env.HOME || "", "Downloads");

function resolveByGlob(prefix, suffix) {
  if (!fs.existsSync(DOWNLOADS)) return null;
  const entries = fs.readdirSync(DOWNLOADS);
  const hit = entries.find((name) => {
    const lower = name.toLowerCase();
    return lower.startsWith(prefix.toLowerCase()) && lower.endsWith(suffix.toLowerCase());
  });
  return hit ? path.join(DOWNLOADS, hit) : null;
}

const ECLAT_PDF =
  process.env.ECLAT_PDF ||
  resolveByGlob("E", "CLAT-Colour-chart-digital-ONLINE-2022.pdf") ||
  path.join(DOWNLOADS, "E\u0301CLAT-Colour-chart-digital-ONLINE-2022.pdf");
const CROMATONE_PDF =
  process.env.CROMATONE_PDF ||
  path.join(DOWNLOADS, "CROMATONE-Colour-chart-digital-ONLINE-2022.pdf");
const DB_EXPORT_XLSX =
  process.env.DB_EXPORT_XLSX ||
  path.join(DOWNLOADS, "products_1779818155619.xlsx");
const ACCESS_CODE = process.env.USAGE_IMPORT_ACCESS_CODE || "070315";

function loadAsB64(p) {
  if (!fs.existsSync(p)) {
    console.warn("⚠️  Missing file (skipped):", p);
    return null;
  }
  return fs.readFileSync(p).toString("base64");
}

async function call(eventBody, suffix) {
  const event = {
    httpMethod: "POST",
    path: `/.netlify/functions/product-catalog-import${suffix}`,
    headers: { "X-Access-Code": ACCESS_CODE },
    body: JSON.stringify(eventBody),
    isBase64Encoded: false,
  };
  const res = await fn.handler(event);
  return { status: res.statusCode, body: JSON.parse(res.body) };
}

async function main() {
  console.log("→ Loading source files…");
  const dbB64 = loadAsB64(DB_EXPORT_XLSX);
  const eclatB64 = loadAsB64(ECLAT_PDF);
  const cromatoneB64 = loadAsB64(CROMATONE_PDF);

  const files = [];
  if (eclatB64) {
    files.push({
      name: path.basename(ECLAT_PDF),
      size: Buffer.byteLength(eclatB64, "base64"),
      content: eclatB64,
      role: "catalog",
    });
  }
  if (cromatoneB64) {
    files.push({
      name: path.basename(CROMATONE_PDF),
      size: Buffer.byteLength(cromatoneB64, "base64"),
      content: cromatoneB64,
      role: "catalog",
    });
  }
  if (dbB64) {
    files.push({
      name: path.basename(DB_EXPORT_XLSX),
      size: Buffer.byteLength(dbB64, "base64"),
      content: dbB64,
      role: "db-export",
    });
  }

  if (files.filter((f) => f.role === "catalog").length === 0) {
    console.error("❌ No catalog PDFs found; cannot run smoke test.");
    process.exit(1);
  }

  console.log("→ POST /preview");
  const preview = await call(
    {
      files,
      options: {
        mode: "audit",
        defaultType: "color",
        defaultPackingWeight: 77,
        defaultMaterialWeight: 60,
        defaultIls: 28,
      },
    },
    "/preview",
  );
  if (preview.status !== 200) {
    console.error("Preview failed:", preview);
    process.exit(1);
  }
  console.log("✓ Preview", {
    jobId: preview.body.jobId,
    parsedRows: preview.body.summary.parsedRows,
    newRows: preview.body.summary.newRows,
    updateRows: preview.body.summary.updateRows,
    duplicateRiskRows: preview.body.summary.duplicateRiskRows,
    needsReviewRows: preview.body.summary.needsReviewRows,
    missingBarcode: preview.body.summary.missingBarcode,
    warnings: preview.body.warnings.length,
  });

  console.log("→ POST /enrich (LLM disabled)");
  const enrich = await call(
    { jobId: preview.body.jobId, enableLLM: false },
    "/enrich",
  );
  if (enrich.status !== 200) {
    console.error("Enrich failed:", enrich);
    process.exit(1);
  }
  const patternFilled = enrich.body.enriched.filter(
    (r) => (r.enrichedFields || []).length > 0,
  ).length;
  console.log("✓ Enrich", {
    enrichedRows: enrich.body.enriched.length,
    patternFilled,
    llmCalls: enrich.body.llmCalls,
  });

  console.log("→ POST /export");
  const exp = await call({ jobId: preview.body.jobId }, "/export");
  if (exp.status !== 200) {
    console.error("Export failed:", exp);
    process.exit(1);
  }
  const out = path.join(DOWNLOADS, "smoke-catalog-import-output.xlsx");
  fs.writeFileSync(out, Buffer.from(exp.body.workbook, "base64"));
  console.log("✓ Export", {
    filename: exp.body.filename,
    bytes: exp.body.byteSize,
    rowCounts: exp.body.rowCounts,
    saved: out,
  });
  console.log("\n🎉 Smoke pipeline OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
