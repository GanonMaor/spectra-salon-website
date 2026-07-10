/**
 * netlify/functions/catalog-inventory-migrate.js
 * ─────────────────────────────────────────────────────────────────────────
 * Applies the multi-tenant catalog + salon inventory migrations to Neon:
 *   026_catalog_inventory_v1_naming.sql       (Phase 1 — rename to catalog_*)
 *   027_catalog_master_import_indexes.sql     (Phase 2 — barcodes + search)
 *   028_salon_catalog_enablement_inventory.sql(Phase 3 — salon tables)
 *   029_catalog_search_perf_index.sql         (Perf — catalog search trigram)
 *   030_legacy_inventory_backfill_review_enrichment.sql (dry-run review meta)
 *   031_salon_product_line_enablement.sql     (Brand/series setup)
 *   032_catalog_runtime_products_view.sql     (Approved salon-facing catalog view)
 *   033_crm_tenant_runtime.sql                (Tenant-scoped CRM core tables)
 *   034_crm_services_runtime_fields.sql       (Services runtime fields)
 *
 * POST /.netlify/functions/catalog-inventory-migrate
 * Header: X-Access-Code: <USAGE_IMPORT_ACCESS_CODE>
 *
 * Each migration is idempotent (guarded renames, IF NOT EXISTS, existence
 * checks) so this is safe to call multiple times. Migrations run in order,
 * each in its own transaction; a failure rolls that migration back and stops.
 *
 * Uses the `pg` Client (not the neon() tagged template) because these files
 * contain DO $$ ... $$ blocks and multiple statements per file, which require
 * the simple query protocol.
 */
"use strict";

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const ACCESS_CODE = process.env.USAGE_IMPORT_ACCESS_CODE || "070315";
const DATABASE_URL = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, X-Access-Code",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MIGRATIONS = [
  "026_catalog_inventory_v1_naming.sql",
  "027_catalog_master_import_indexes.sql",
  "028_salon_catalog_enablement_inventory.sql",
  "029_catalog_search_perf_index.sql",
  "030_legacy_inventory_backfill_review_enrichment.sql",
  "031_salon_product_line_enablement.sql",
  "032_catalog_runtime_products_view.sql",
  "033_crm_tenant_runtime.sql",
  "034_crm_services_runtime_fields.sql",
];

function resolveMigration(file) {
  // Try a few candidate locations so this works both locally and inside the
  // bundled Netlify function (migrations/** is added to included_files).
  const candidates = [
    path.resolve(__dirname, "..", "..", "migrations", file),
    path.resolve(process.cwd(), "migrations", file),
    path.resolve(__dirname, "migrations", file),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error(`Migration file not found: ${file}`);
}

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers: CORS, body: "" };
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const accessCode = event.headers?.["x-access-code"];
  if (accessCode !== ACCESS_CODE) {
    return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: "Unauthorized" }) };
  }
  if (!DATABASE_URL) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: "NEON_DATABASE_URL not configured" }) };
  }

  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  const results = [];
  try {
    await client.connect();
    for (const file of MIGRATIONS) {
      const sqlText = fs.readFileSync(resolveMigration(file), "utf8");
      try {
        await client.query("BEGIN");
        await client.query(sqlText);
        await client.query("COMMIT");
        results.push({ migration: file, status: "applied" });
      } catch (err) {
        await client.query("ROLLBACK").catch(() => {});
        results.push({ migration: file, status: "failed", error: err.message });
        return {
          statusCode: 500,
          headers: CORS,
          body: JSON.stringify({ error: `Migration ${file} failed`, details: err.message, results }),
        };
      }
    }
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true, results }) };
  } catch (err) {
    console.error("catalog-inventory-migrate error:", err);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message, results }) };
  } finally {
    await client.end().catch(() => {});
  }
};
