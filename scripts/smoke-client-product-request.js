#!/usr/bin/env node
/**
 * scripts/smoke-client-product-request.js
 * ---------------------------------------------------------------
 * End-to-end smoke test for the customer-request branch of the
 * Catalog Import flow. Feeds Diana's real WhatsApp/Instagram message
 * (text + URL + screenshots) into the function and exports the
 * full multi-sheet workbook.
 *
 * Usage:
 *   node scripts/smoke-client-product-request.js
 *
 * Env overrides:
 *   DB_EXPORT_XLSX   path to current products export (xlsx)
 *   SCREENSHOT_DIR   directory containing the screenshot PNGs
 *   ENABLE_VISION=1  also call OpenAI Vision (requires OPENAI_API_KEY)
 *   ENABLE_WEB=1     also fetch the Supersisters Adore URL
 */

"use strict";

const fs = require("fs");
const path = require("path");

const fn = require("../netlify/functions/product-catalog-import");

const DOWNLOADS = path.join(process.env.HOME || "", "Downloads");
const ASSETS_DIR =
  process.env.SCREENSHOT_DIR ||
  path.join(
    process.env.HOME || "",
    ".cursor/projects/Users-maorganon-Downloads-spectra-salon-website-main/assets",
  );
const DB_EXPORT_XLSX =
  process.env.DB_EXPORT_XLSX ||
  path.join(DOWNLOADS, "products_1779818155619.xlsx");
const ACCESS_CODE = process.env.USAGE_IMPORT_ACCESS_CODE || "070315";

const DIANA_REQUEST_TEXT = `-kenra SA rapid toners

-wella color touch 1.9% 6 volume gallon (quick add for all color services + toner services )

- paul mitchell 5vol CLEAR developer (for all toner & color services )

- for the "pre toner" services are you able to add certain colors to the quick add ? ( all kenra rapid toners .. SA , SV, B , ROV )

- Framesi framcolor glamour (6.61, 7.61, 5.61, 8.61) all the .61 plz

- ADORE COLOR (direct dye) adore colors ^ https://supersistersbeauty.com/products/adore-semi-permanent-hair-color?srsltid=AfmBOormN289L25V8U_KXl-VshF_9cJcZJDF9xa3WDNydyyo3GQvyrjv and these as well plz

- can you also add all the danger jones & pulpriot ? ( i know we have some but not all are in there)

- paul mitchell COLOR WAYS ION COLOR brilliance ^^`;

function loadAsB64(p) {
  if (!fs.existsSync(p)) {
    console.warn("⚠️  Missing file (skipped):", p);
    return null;
  }
  return fs.readFileSync(p).toString("base64");
}

function listScreenshots() {
  if (!fs.existsSync(ASSETS_DIR)) {
    console.warn("⚠️  Assets dir missing:", ASSETS_DIR);
    return [];
  }
  // Default filter: Diana's request screenshots (3.10–3.11 timestamps).
  // Override with SCREENSHOT_DIR or SCREENSHOT_FILTER env vars.
  const filterRe = process.env.SCREENSHOT_FILTER
    ? new RegExp(process.env.SCREENSHOT_FILTER, "i")
    : /Screenshot_2026-05-27_at_3\.1[01]/i;
  return fs
    .readdirSync(ASSETS_DIR)
    .filter((n) => /\.(png|jpe?g|webp)$/i.test(n) && filterRe.test(n))
    .map((n) => path.join(ASSETS_DIR, n));
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
  const screenshots = listScreenshots();
  console.log(`  • DB export: ${dbB64 ? "present" : "missing"}`);
  console.log(`  • screenshots: ${screenshots.length}`);

  const files = [];
  for (const s of screenshots) {
    const b64 = loadAsB64(s);
    if (!b64) continue;
    files.push({
      name: path.basename(s),
      size: Buffer.byteLength(b64, "base64"),
      content: b64,
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

  console.log("→ POST /preview (with request text + URLs + images)");
  const preview = await call(
    {
      files,
      options: {
        mode: "audit",
        defaultType: "color",
        requestText: DIANA_REQUEST_TEXT,
        // links auto-detected from the text
      },
    },
    "/preview",
  );
  if (preview.status !== 200) {
    console.error("Preview failed:", preview);
    process.exit(1);
  }
  const summary = preview.body.summary;
  console.log("✓ Preview", {
    jobId: preview.body.jobId,
    parsedRows: summary.parsedRows,
    textRows: summary.textRows,
    urlRows: summary.urlRows,
    imageRows: summary.imageRows,
    quickAddRows: summary.quickAddRows,
    linkCount: summary.linkCount,
    detectedBrands: preview.body.requestContext?.detectedBrands,
    bullets: preview.body.requestContext?.bulletCount,
    warnings: preview.body.warnings.length,
  });

  console.log("→ POST /enrich (LLM disabled by default; vision optional)");
  const enrich = await call(
    {
      jobId: preview.body.jobId,
      enableLLM: false,
      enableVision: process.env.ENABLE_VISION === "1",
    },
    "/enrich",
  );
  if (enrich.status !== 200) {
    console.error("Enrich failed:", enrich);
    process.exit(1);
  }
  console.log("✓ Enrich", {
    enrichedRows: enrich.body.enriched.length,
    llmCalls: enrich.body.llmCalls,
    visionCalls: enrich.body.visionCalls,
    warnings: enrich.body.warnings.length,
  });

  console.log("→ POST /export");
  const exp = await call(
    { jobId: preview.body.jobId, filenameHint: "client_request_audit" },
    "/export",
  );
  if (exp.status !== 200) {
    console.error("Export failed:", exp);
    process.exit(1);
  }
  const out = path.join(DOWNLOADS, "smoke-client-request-output.xlsx");
  fs.writeFileSync(out, Buffer.from(exp.body.workbook, "base64"));
  console.log("✓ Export", {
    filename: exp.body.filename,
    bytes: exp.body.byteSize,
    rowCounts: exp.body.rowCounts,
    saved: out,
  });
  console.log("\nSmoke pipeline OK — open the workbook to inspect sheets.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
