#!/usr/bin/env node
/**
 * Smoke verification for TRUSS catalog import + search identity.
 * Does not require a browser session — validates Neon + dataset artifacts.
 */

"use strict";

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");
require("dotenv").config({ path: ".env" });
require("dotenv").config({ path: ".env.local" });

const ROOT = path.resolve(__dirname, "..");

async function main() {
  const catalog = JSON.parse(
    fs.readFileSync(path.join(ROOT, "data-import/truss/normalized/truss-catalog.json"), "utf8"),
  );
  const quality = JSON.parse(
    fs.readFileSync(path.join(ROOT, "reports/truss-catalog/data-quality-report.json"), "utf8"),
  );

  const checks = [];
  checks.push(["catalog_count_128", catalog.length === 128]);
  checks.push(["approved_identity", catalog.every((p) => p.ean_valid && p.trs_code)]);
  checks.push(["sample_trs_8557", catalog.some((p) => p.trs_code === "TRS-8557" && p.ean_barcode === "7898625796056")]);
  checks.push(["quality_report_present", quality.totals.products === 128]);

  const url = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL missing");
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    const count = await client.query(
      `SELECT COUNT(*)::int AS n FROM catalog_products
       WHERE manufacturer_id='mfr-truss-professional'
         AND supplier_sku LIKE 'TRS-%'
         AND validation_status='approved'
         AND published_at IS NOT NULL`,
    );
    checks.push(["db_approved_trs_products", count.rows[0].n >= 128]);

    const ean = await client.query(
      `SELECT p.id, p.supplier_sku FROM catalog_product_barcodes b
       JOIN catalog_products p ON p.id=b.product_id
       WHERE b.barcode='7898625796056' AND b.status='active' LIMIT 1`,
    );
    checks.push(["db_ean_lookup", ean.rowCount === 1 && ean.rows[0].supplier_sku === "TRS-8557"]);

    const trs = await client.query(
      `SELECT id FROM catalog_products WHERE manufacturer_id='mfr-truss-professional' AND supplier_sku='TRS-7459' LIMIT 1`,
    );
    checks.push(["db_trs_lookup", trs.rowCount === 1]);

    const needsReview = await client.query(
      `SELECT COUNT(*)::int AS n FROM catalog_products
       WHERE manufacturer_id='mfr-truss-professional' AND validation_status='needs_review'`,
    );
    checks.push(["legacy_needs_review_present", needsReview.rows[0].n >= 1]);

    const runtime = await client.query(
      `SELECT COUNT(*)::int AS n
       FROM catalog_runtime_products
       WHERE manufacturer_id='mfr-truss-professional' AND supplier_sku LIKE 'TRS-%'`,
    );
    checks.push(["runtime_view_trs", runtime.rows[0].n >= 128]);
  } finally {
    await client.end();
  }

  const failed = checks.filter(([, ok]) => !ok);
  for (const [name, ok] of checks) {
    console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
  }
  if (failed.length) {
    process.exit(1);
  }
  console.log("TRUSS smoke checks passed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
