/**
 * netlify/functions/lib/salon-catalog-helpers.js
 * ─────────────────────────────────────────────────────────────────────────
 * Pure, dependency-free helpers for the salon-scoped product & inventory API.
 * Kept separate from salon-products.js (which imports `pg`) so they can be
 * unit-tested in any environment without a database driver.
 */
"use strict";

function clampLimit(value, fallback, max) {
  const n = parseInt(value, 10);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(n, max);
}

function normalizeSearchTerm(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u0590-\u05ff]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function compactSearchTerm(value) {
  return normalizeSearchTerm(value).replace(/\s+/g, "");
}

// Stock status contract shared with the catalog-stock SQL CASE expression and
// the SalonCatalogStockRow client type.
function computeStockStatus({ inInventory, unitsInStock, minStock }) {
  if (!inInventory) return "not_tracked";
  const units = Number(unitsInStock) || 0;
  const min = Number(minStock) || 0;
  if (units <= 0) return "out";
  if (units <= min) return "low";
  return "ok";
}

// Salon-facing product queries must read the APPROVED runtime catalog, never
// the raw admin/master catalog_products table. Preferred source is the
// catalog_runtime_products view (migration 032). If the view is not present we
// fall back to the base table with the exact same approved/published/active
// filter so the runtime contract still holds.
async function resolveRuntimeCatalog(client) {
  const r = await client.query(`SELECT to_regclass('public.catalog_runtime_products') AS v`);
  if (r.rows[0] && r.rows[0].v) {
    return { relation: "catalog_runtime_products", filter: "", usingView: true };
  }
  const productionLike = process.env.NODE_ENV === "production" ||
    process.env.CONTEXT === "production" ||
    process.env.NETLIFY === "true";
  if (productionLike) {
    console.error("[salon-products] catalog_runtime_products view is missing in production-like runtime; refusing salon catalog query.");
    throw new Error("catalog_runtime_products view is missing. Run migration 032 before serving salon runtime catalog queries.");
  }
  console.warn("[salon-products] catalog_runtime_products view is missing; using local/dev fallback runtime filter on catalog_products.");
  return {
    relation: "catalog_products",
    filter: " AND cp.validation_status = 'approved' AND cp.published_at IS NOT NULL",
    usingView: false,
  };
}

module.exports = {
  clampLimit,
  normalizeSearchTerm,
  compactSearchTerm,
  computeStockStatus,
  resolveRuntimeCatalog,
};
