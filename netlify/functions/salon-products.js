/**
 * netlify/functions/salon-products.js
 * ─────────────────────────────────────────────────────────────────────────
 * Authenticated, salon-scoped product & inventory API (Phase 4).
 *
 * Every request resolves its salon from a verified session via
 * resolveSalonContext() — salon_id is NEVER read from the client. See
 * _salon-context.js for the security contract.
 *
 * Routes (base: /.netlify/functions/salon-products):
 *   GET    /                         Default salon search: enabled brands +
 *                                    visible salon inventory only.
 *   GET    /inventory                Salon inventory (management view).
 *   POST   /inventory                Add a global catalog product to inventory.
 *   PATCH  /inventory/:id            Update local stock/price/visibility/etc.
 *   GET    /brands/catalog           List catalog brands with salon metadata.
 *   GET    /brands/enabled           List the salon's enabled brands.
 *   POST   /brands/enabled           Enable a brand for the salon.
 *   PATCH  /brands/enabled/:brandId  Enable/disable a brand for the salon.
 *   GET    /brands/:brandId/product-lines
 *                                    List product lines under a brand.
 *   GET    /product-lines/enabled    List enabled product lines for salon.
 *   PATCH  /product-lines/enabled/:id
 *                                    Enable/disable a product line for salon.
 *   GET    /catalog/search           Explicit full-catalog search (add flow).
 */
"use strict";

const { Client } = require("pg");
const { resolveSalonContext, SalonAuthError } = require("./_salon-context");
const {
  clampLimit,
  normalizeSearchTerm,
  compactSearchTerm,
  computeStockStatus,
  resolveRuntimeCatalog,
} = require("./lib/salon-catalog-helpers");

const DATABASE_URL = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
};

function res(statusCode, data, isError = false) {
  return { statusCode, headers: CORS, body: JSON.stringify(isError ? { error: data } : data) };
}

function envelope(statusCode, data, meta = {}) {
  return { statusCode, headers: CORS, body: JSON.stringify({ ok: true, data, meta }) };
}

function envelopeError(statusCode, code, message, details = {}) {
  return {
    statusCode,
    headers: CORS,
    body: JSON.stringify({ ok: false, error: { code, message, details } }),
  };
}

function parsePath(event) {
  const raw = (event.path || "").replace("/.netlify/functions/salon-products", "") || "/";
  return raw.split("/").filter(Boolean);
}

async function getClient() {
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  return client;
}

function salonScopePredicate(inventoryAlias = "sip", productAlias = "cp") {
  return `
    AND EXISTS (
      SELECT 1 FROM salon_enabled_brands seb
      WHERE seb.salon_id = ${inventoryAlias}.salon_id
        AND seb.brand_id = ${productAlias}.manufacturer_id
        AND seb.status = 'enabled'
    )
    AND (
      NOT EXISTS (
        SELECT 1 FROM salon_enabled_product_lines sepl_any
        WHERE sepl_any.salon_id = ${inventoryAlias}.salon_id
          AND sepl_any.brand_id = ${productAlias}.manufacturer_id
          AND sepl_any.status = 'enabled'
      )
      OR EXISTS (
        SELECT 1 FROM salon_enabled_product_lines sepl
        WHERE sepl.salon_id = ${inventoryAlias}.salon_id
          AND sepl.product_line_id = ${productAlias}.product_line_id
          AND sepl.status = 'enabled'
      )
    )`;
}

function catalogScopePredicate(salonParamIndex, productAlias = "cp") {
  return `
    AND EXISTS (
      SELECT 1 FROM salon_enabled_brands seb
      WHERE seb.salon_id = $${salonParamIndex}
        AND seb.brand_id = ${productAlias}.manufacturer_id
        AND seb.status = 'enabled'
    )
    AND (
      NOT EXISTS (
        SELECT 1 FROM salon_enabled_product_lines sepl_any
        WHERE sepl_any.salon_id = $${salonParamIndex}
          AND sepl_any.brand_id = ${productAlias}.manufacturer_id
          AND sepl_any.status = 'enabled'
      )
      OR EXISTS (
        SELECT 1 FROM salon_enabled_product_lines sepl
        WHERE sepl.salon_id = $${salonParamIndex}
          AND sepl.product_line_id = ${productAlias}.product_line_id
          AND sepl.status = 'enabled'
      )
    )`;
}

// ── Query helpers ──────────────────────────────────────────────────────────
// Salon-facing product queries read the APPROVED runtime catalog via
// resolveRuntimeCatalog() (see lib/salon-catalog-helpers.js), never raw
// catalog_products.

// Catalog-first stock view: start from the APPROVED runtime catalog in the
// salon's enabled scope and LEFT JOIN the salon's inventory so products with no
// stock row still appear (with units_in_stock = 0). salon_id ($1) drives both
// the scope predicate and the inventory overlay join.
async function listCatalogStock(client, salonId, runtimeCatalog, { brandId, productLineId, q, limit, offset }) {
  const params = [salonId];
  let where = `WHERE cp.active = true${runtimeCatalog.filter} ${catalogScopePredicate(1, "cp")}`;

  if (brandId) {
    params.push(brandId);
    where += ` AND cp.manufacturer_id = $${params.length}`;
  }
  if (productLineId) {
    params.push(productLineId);
    where += ` AND cp.product_line_id = $${params.length}`;
  }
  if (q && q.trim()) {
    params.push(`%${q.trim().toLowerCase()}%`);
    where += `
      AND (
        cp.normalized_name ILIKE $${params.length}
        OR LOWER(cp.canonical_name) ILIKE $${params.length}
        OR LOWER(COALESCE(cb.canonical_name, '')) ILIKE $${params.length}
        OR LOWER(COALESCE(cpl.canonical_name, cpl.name, '')) ILIKE $${params.length}
        OR LOWER(COALESCE(cp.primary_product_type, '')) ILIKE $${params.length}
      )`;
  }

  const rows = await client.query(
    `SELECT
       cp.id AS product_id,
       cp.manufacturer_id AS brand_id,
       cb.canonical_name AS brand_name,
       cp.product_line_id AS product_line_id,
       COALESCE(cpl.canonical_name, cpl.name) AS product_line_name,
       cp.canonical_name,
       cp.primary_product_type,
       cp.package_size_value,
       cp.package_size_unit,
       NULL AS image_url,
       sip.id AS salon_inventory_product_id,
       COALESCE(sip.units_in_stock, 0) AS units_in_stock,
       COALESCE(sip.min_stock, 0) AS min_stock,
       COALESCE(sip.is_visible, true) AS is_visible,
       COALESCE(sip.is_favorite, false) AS is_favorite,
       (sip.id IS NOT NULL) AS in_inventory,
       CASE
         WHEN sip.id IS NULL THEN 'not_tracked'
         WHEN sip.units_in_stock <= 0 THEN 'out'
         WHEN sip.units_in_stock <= sip.min_stock THEN 'low'
         ELSE 'ok'
       END AS stock_status
     FROM ${runtimeCatalog.relation} cp
     LEFT JOIN catalog_brands cb ON cb.id = cp.manufacturer_id
     LEFT JOIN catalog_product_lines cpl ON cpl.id = cp.product_line_id
     LEFT JOIN salon_inventory_products sip
       ON sip.product_id = cp.id AND sip.salon_id = $1 AND sip.status = 'active'
     ${where}
     ORDER BY COALESCE(cpl.canonical_name, cpl.name) ASC NULLS LAST, cp.canonical_name ASC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );
  return rows.rows;
}

// Default salon search: only visible inventory whose product belongs to a
// brand the salon has enabled.
async function searchSalonInventory(client, salonId, { q, limit, offset }) {
  const params = [salonId];
  let where = `
    WHERE sip.salon_id = $1
      AND sip.status = 'active'
      AND sip.is_visible = true
      ${salonScopePredicate("sip", "cp")}`;

  if (q && q.trim()) {
    params.push(`%${q.trim().toLowerCase()}%`);
    where += `
      AND (
        cp.normalized_name ILIKE $${params.length}
        OR LOWER(cp.canonical_name) ILIKE $${params.length}
        OR LOWER(COALESCE(sip.local_display_name, '')) ILIKE $${params.length}
        OR LOWER(COALESCE(sip.local_barcode_override, '')) ILIKE $${params.length}
      )`;
  }

  const listParams = [...params, limit, offset];
  const rows = await client.query(
    `SELECT
       sip.id, sip.product_id, sip.units_in_stock, sip.min_stock,
       sip.cost_amount, sip.cost_currency, sip.sell_price_amount, sip.sell_price_currency,
       sip.is_visible, sip.is_favorite, sip.local_barcode_override, sip.local_display_name,
       cp.canonical_name, cp.normalized_name, cp.primary_product_type,
       cp.package_size_value, cp.package_size_unit,
       cp.manufacturer_id AS brand_id,
       cp.product_line_id AS product_line_id,
       cb.canonical_name AS brand_name,
       cpl.canonical_name AS product_line_name
     FROM salon_inventory_products sip
     JOIN catalog_products cp ON cp.id = sip.product_id
     LEFT JOIN catalog_brands cb ON cb.id = cp.manufacturer_id
     LEFT JOIN catalog_product_lines cpl ON cpl.id = cp.product_line_id
     ${where}
     ORDER BY sip.is_favorite DESC, cp.canonical_name ASC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    listParams,
  );

  return rows.rows;
}

async function listSalonInventory(client, salonId, { brandId, lowStock, q, limit, offset }) {
  const params = [salonId];
  let where = `
    WHERE sip.salon_id = $1
      AND sip.status = 'active'
      ${salonScopePredicate("sip", "cp")}`;

  if (brandId) {
    params.push(brandId);
    where += ` AND cp.manufacturer_id = $${params.length}`;
  }
  if (lowStock === "true") {
    where += ` AND sip.units_in_stock <= sip.min_stock`;
  }
  if (q && q.trim()) {
    params.push(`%${q.trim().toLowerCase()}%`);
    where += `
      AND (
        cp.normalized_name ILIKE $${params.length}
        OR LOWER(cp.canonical_name) ILIKE $${params.length}
        OR LOWER(COALESCE(sip.local_display_name, '')) ILIKE $${params.length}
        OR LOWER(COALESCE(sip.local_barcode_override, '')) ILIKE $${params.length}
      )`;
  }

  const [items, count, summary] = await Promise.all([
    client.query(
      `SELECT
         sip.*, 
         cp.canonical_name, cp.normalized_name, cp.primary_product_type,
         cp.package_size_value, cp.package_size_unit,
         cp.manufacturer_id AS brand_id,
         cp.product_line_id AS product_line_id,
         cb.canonical_name AS brand_name,
         cpl.canonical_name AS product_line_name
       FROM salon_inventory_products sip
       JOIN catalog_products cp ON cp.id = sip.product_id
       LEFT JOIN catalog_brands cb ON cb.id = cp.manufacturer_id
       LEFT JOIN catalog_product_lines cpl ON cpl.id = cp.product_line_id
       ${where}
       ORDER BY cb.canonical_name ASC, cp.canonical_name ASC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset],
    ),
    client.query(
      `SELECT COUNT(*)::int AS total
       FROM salon_inventory_products sip
       JOIN catalog_products cp ON cp.id = sip.product_id
       ${where}`,
      params,
    ),
    client.query(
      `SELECT
         COUNT(*)::int AS total_products,
         COALESCE(SUM(units_in_stock), 0) AS total_units,
         COUNT(*) FILTER (WHERE units_in_stock <= min_stock)::int AS low_stock_count
       FROM salon_inventory_products
       WHERE salon_id = $1 AND status = 'active'`,
      [salonId],
    ),
  ]);

  return { items: items.rows, total: count.rows[0].total, summary: summary.rows[0] };
}

async function isBrandEnabled(client, salonId, brandId) {
  const r = await client.query(
    `SELECT 1 FROM salon_enabled_brands
     WHERE salon_id = $1 AND brand_id = $2 AND status = 'enabled' LIMIT 1`,
    [salonId, brandId],
  );
  return r.rows.length > 0;
}

async function isProductAllowedByEnabledLines(client, salonId, brandId, productLineId) {
  const scopedLines = await client.query(
    `SELECT product_line_id
     FROM salon_enabled_product_lines
     WHERE salon_id = $1 AND brand_id = $2 AND status = 'enabled'`,
    [salonId, brandId],
  );
  if (scopedLines.rows.length === 0) return true;
  return scopedLines.rows.some((row) => row.product_line_id === productLineId);
}

function normalizeStockPatch(body) {
  const allowed = ["unitsInStock", "minStock", "isFavorite", "isVisible"];
  const forbiddenTenantFields = ["salonId", "salon_id", "xSalonId", "x_salon_id"];
  for (const field of forbiddenTenantFields) {
    if (body[field] !== undefined) {
      return { error: { code: "TENANT_FIELD_FORBIDDEN", message: "Tenant is resolved from the authenticated session." } };
    }
  }

  const patch = {};
  for (const key of allowed) {
    if (body[key] !== undefined) patch[key] = body[key];
  }
  if (Object.keys(patch).length === 0) {
    return { error: { code: "VALIDATION_ERROR", message: "No autosave fields provided." } };
  }
  for (const key of ["unitsInStock", "minStock"]) {
    if (patch[key] !== undefined) {
      const value = Number(patch[key]);
      if (!Number.isFinite(value) || value < 0) {
        return { error: { code: "VALIDATION_ERROR", message: `${key} must be a non-negative number.` } };
      }
      patch[key] = value;
    }
  }
  for (const key of ["isFavorite", "isVisible"]) {
    if (patch[key] !== undefined && typeof patch[key] !== "boolean") {
      return { error: { code: "VALIDATION_ERROR", message: `${key} must be a boolean.` } };
    }
  }
  return { patch };
}

async function getBrandInventoryCount(client, salonId, brandId) {
  const r = await client.query(
    `SELECT COUNT(*)::int AS count
     FROM salon_inventory_products sip
     JOIN catalog_products cp ON cp.id = sip.product_id
     WHERE sip.salon_id = $1
       AND sip.status = 'active'
       AND cp.manufacturer_id = $2`,
    [salonId, brandId],
  );
  return r.rows[0]?.count ?? 0;
}

async function getProductLineInventoryCount(client, salonId, productLineId) {
  const r = await client.query(
    `SELECT COUNT(*)::int AS count
     FROM salon_inventory_products sip
     JOIN catalog_products cp ON cp.id = sip.product_id
     WHERE sip.salon_id = $1
       AND sip.status = 'active'
       AND cp.product_line_id = $2`,
    [salonId, productLineId],
  );
  return r.rows[0]?.count ?? 0;
}

// ── Handler ─────────────────────────────────────────────────────────────────

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") return res(200, "");

  let salonCtx;
  try {
    salonCtx = resolveSalonContext(event);
  } catch (err) {
    if (err instanceof SalonAuthError) return res(err.statusCode, err.message, true);
    return res(401, "Unauthorized", true);
  }
  const salonId = salonCtx.salonId;

  const method = event.httpMethod;
  const segments = parsePath(event);
  const qs = event.queryStringParameters || {};
  let body = {};
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    return res(400, "Invalid JSON body", true);
  }

  if (!DATABASE_URL || DATABASE_URL.length < 10) {
    // No DB configured (local dev): return safe empty shapes.
    if (method === "GET" && segments.length === 0) return res(200, { items: [], salonId, mock: true });
    if (method === "GET" && segments[0] === "inventory") return res(200, { items: [], total: 0, summary: {}, salonId, mock: true });
    if (method === "GET" && segments[0] === "brands" && segments[1] === "catalog") return res(200, { brands: [], salonId, mock: true });
    if (method === "GET" && segments[0] === "brands" && segments[1] === "enabled") return res(200, { brands: [], salonId, mock: true });
    if (method === "GET" && segments[0] === "product-lines" && segments[1] === "enabled") return res(200, { productLines: [], salonId, mock: true });
    if (method === "GET" && segments[0] === "brands" && segments[2] === "product-lines") return res(200, { productLines: [], salonId, mock: true });
    if (method === "GET" && segments[0] === "catalog" && segments[1] === "search") return res(200, { items: [], salonId, mock: true });
    if (method === "GET" && segments[0] === "catalog-stock") return res(200, { items: [], salonId, mock: true });
    return res(200, { ok: true, mock: true, salonId });
  }

  let client;
  try {
    client = await getClient();

    // GET / — default salon search (enabled brands + visible inventory)
    if (method === "GET" && segments.length === 0) {
      const limit = clampLimit(qs.limit, 50, 200);
      const offset = Math.max(0, parseInt(qs.cursor, 10) || 0);
      const items = await searchSalonInventory(client, salonId, { q: qs.q, limit, offset });
      const nextCursor = items.length === limit ? String(offset + limit) : null;
      return res(200, { items, salonId, nextCursor });
    }

    // GET /catalog-stock — catalog-first list: all enabled catalog products for
    // this salon with an inventory-stock overlay (units_in_stock defaults to 0).
    if (method === "GET" && segments[0] === "catalog-stock" && segments.length === 1) {
      const limit = clampLimit(qs.limit, 200, 500);
      const offset = Math.max(0, parseInt(qs.offset, 10) || 0);
      const runtimeCatalog = await resolveRuntimeCatalog(client);
      const items = await listCatalogStock(client, salonId, runtimeCatalog, {
        brandId: qs.brandId,
        productLineId: qs.productLineId,
        q: qs.q,
        limit,
        offset,
      });
      const nextOffset = items.length === limit ? offset + limit : null;
      return res(200, { items, salonId, limit, offset, nextOffset, runtimeSource: runtimeCatalog.relation });
    }

    // GET /inventory — management list
    if (method === "GET" && segments[0] === "inventory" && segments.length === 1) {
      const limit = clampLimit(qs.limit, 200, 500);
      const offset = Math.max(0, parseInt(qs.offset, 10) || 0);
      const result = await listSalonInventory(client, salonId, {
        brandId: qs.brandId,
        lowStock: qs.lowStock,
        q: qs.q,
        limit,
        offset,
      });
      return res(200, { ...result, salonId, page: Math.floor(offset / limit) + 1, limit });
    }

    // POST /inventory — add a global product to this salon's inventory
    if (method === "POST" && segments[0] === "inventory" && segments.length === 1) {
      const { productId, enableBrand } = body;
      if (!productId) return res(400, "productId is required", true);

      // Only APPROVED runtime catalog products may be added to a salon's
      // inventory. This rejects candidates/unapproved/unpublished products.
      const runtimeCatalog = await resolveRuntimeCatalog(client);
      const product = await client.query(
        `SELECT id, manufacturer_id, product_line_id
         FROM ${runtimeCatalog.relation} cp
         WHERE id = $1 AND active = true${runtimeCatalog.filter}`,
        [productId],
      );
      if (product.rows.length === 0) return res(404, "Catalog product not found", true);
      const brandId = product.rows[0].manufacturer_id;
      const productLineId = product.rows[0].product_line_id;

      const enabled = await isBrandEnabled(client, salonId, brandId);
      if (!enabled) {
        if (enableBrand === true) {
          await client.query(
            `INSERT INTO salon_enabled_brands (salon_id, brand_id, enabled_by_user_id)
             VALUES ($1, $2, $3)
             ON CONFLICT (salon_id, brand_id) WHERE status = 'enabled' DO NOTHING`,
            [salonId, brandId, salonCtx.userId],
          );
        } else {
          return res(409, {
            error: "Brand is not enabled for this salon",
            code: "BRAND_NOT_ENABLED",
            brandId,
          });
        }
      }

      const lineAllowed = await isProductAllowedByEnabledLines(client, salonId, brandId, productLineId);
      if (!lineAllowed) {
        return res(409, {
          error: "Product line is not enabled for this salon",
          code: "PRODUCT_LINE_NOT_ENABLED",
          brandId,
          productLineId,
        }, true);
      }

      const inserted = await client.query(
        `INSERT INTO salon_inventory_products
           (salon_id, product_id, units_in_stock, min_stock,
            cost_amount, cost_currency, sell_price_amount, sell_price_currency,
            is_visible, is_favorite, local_barcode_override, local_display_name)
         VALUES ($1, $2,
            COALESCE($3, 0), COALESCE($4, 0),
            $5, COALESCE($6, 'ILS'), $7, COALESCE($8, 'ILS'),
            COALESCE($9, true), COALESCE($10, false), $11, $12)
         ON CONFLICT (salon_id, product_id) DO UPDATE SET
            status = 'active', updated_at = now()
         RETURNING *`,
        [
          salonId, productId,
          body.unitsInStock, body.minStock,
          body.costAmount, body.costCurrency, body.sellPriceAmount, body.sellPriceCurrency,
          body.isVisible, body.isFavorite, body.localBarcodeOverride, body.localDisplayName,
        ],
      );
      return res(201, { item: inserted.rows[0], salonId });
    }

    // PATCH /inventory/by-product/:productId — autosave stock overlay by
    // runtime catalog product id. Creates a salon overlay lazily on first edit.
    if (method === "PATCH" && segments[0] === "inventory" && segments[1] === "by-product" && segments.length === 3) {
      const productId = segments[2];
      const normalized = normalizeStockPatch(body);
      if (normalized.error) {
        return envelopeError(400, normalized.error.code, normalized.error.message);
      }
      const patch = normalized.patch;
      const runtimeCatalog = await resolveRuntimeCatalog(client);
      const product = await client.query(
        `SELECT id, manufacturer_id, product_line_id
         FROM ${runtimeCatalog.relation} cp
         WHERE id = $1 AND active = true${runtimeCatalog.filter}`,
        [productId],
      );
      if (product.rows.length === 0) {
        return envelopeError(404, "NOT_FOUND", "Catalog product not found.");
      }
      const brandId = product.rows[0].manufacturer_id;
      const productLineId = product.rows[0].product_line_id;
      const brandEnabled = await isBrandEnabled(client, salonId, brandId);
      if (!brandEnabled) {
        return envelopeError(409, "BRAND_NOT_ENABLED", "Brand is not enabled for this salon.", { brandId });
      }
      const lineAllowed = await isProductAllowedByEnabledLines(client, salonId, brandId, productLineId);
      if (!lineAllowed) {
        return envelopeError(409, "PRODUCT_LINE_NOT_ENABLED", "Product line is not enabled for this salon.", {
          brandId,
          productLineId,
        });
      }

      const updated = await client.query(
        `INSERT INTO salon_inventory_products
           (salon_id, product_id, units_in_stock, min_stock, is_visible, is_favorite)
         VALUES ($1, $2, COALESCE($3, 0), COALESCE($4, 0), COALESCE($5, true), COALESCE($6, false))
         ON CONFLICT (salon_id, product_id) DO UPDATE SET
           units_in_stock = COALESCE($3, salon_inventory_products.units_in_stock),
           min_stock = COALESCE($4, salon_inventory_products.min_stock),
           is_visible = COALESCE($5, salon_inventory_products.is_visible),
           is_favorite = COALESCE($6, salon_inventory_products.is_favorite),
           status = 'active',
           updated_at = now()
         RETURNING *`,
        [
          salonId,
          productId,
          patch.unitsInStock,
          patch.minStock,
          patch.isVisible,
          patch.isFavorite,
        ],
      );
      return envelope(200, {
        item: updated.rows[0],
        clientVersion: Number.isFinite(Number(body.clientVersion)) ? Number(body.clientVersion) : null,
      }, { salonId });
    }

    // PATCH /inventory/:id — update local fields
    if (method === "PATCH" && segments[0] === "inventory" && segments.length === 2) {
      const id = segments[1];
      const fieldMap = {
        unitsInStock: "units_in_stock",
        minStock: "min_stock",
        costAmount: "cost_amount",
        costCurrency: "cost_currency",
        sellPriceAmount: "sell_price_amount",
        sellPriceCurrency: "sell_price_currency",
        isVisible: "is_visible",
        isFavorite: "is_favorite",
        localBarcodeOverride: "local_barcode_override",
        localDisplayName: "local_display_name",
      };
      const sets = [];
      const params = [];
      for (const [key, column] of Object.entries(fieldMap)) {
        if (body[key] !== undefined) {
          params.push(body[key]);
          sets.push(`${column} = $${params.length}`);
        }
      }
      if (sets.length === 0) return res(400, "No updatable fields provided", true);

      // Enforce local barcode uniqueness within the salon.
      if (body.localBarcodeOverride) {
        const dup = await client.query(
          `SELECT 1 FROM salon_inventory_products
           WHERE salon_id = $1 AND local_barcode_override = $2 AND id <> $3 AND status = 'active' LIMIT 1`,
          [salonId, body.localBarcodeOverride, id],
        );
        if (dup.rows.length > 0) return res(409, "Barcode already used by another product in this salon", true);
      }

      sets.push("updated_at = now()");
      params.push(id, salonId);
      const updated = await client.query(
        `UPDATE salon_inventory_products SET ${sets.join(", ")}
         WHERE id = $${params.length - 1} AND salon_id = $${params.length}
         RETURNING *`,
        params,
      );
      if (updated.rows.length === 0) return res(404, "Inventory item not found", true);
      return res(200, { item: updated.rows[0], salonId });
    }

    // GET /brands/catalog — lightweight catalog brand setup list
    if (method === "GET" && segments[0] === "brands" && segments[1] === "catalog") {
      const q = normalizeSearchTerm(qs.q);
      const qCompact = compactSearchTerm(qs.q);
      const limit = clampLimit(qs.limit, 100, 300);
      const params = [salonId];
      let filter = "";
      if (q) {
        params.push(`%${q}%`, `%${qCompact}%`);
        const textParam = params.length - 1;
        const compactParam = params.length;
        filter = `
          WHERE cb.normalized_name ILIKE $${textParam}
             OR LOWER(cb.canonical_name) ILIKE $${textParam}
             OR regexp_replace(cb.normalized_name, '[^a-z0-9\u0590-\u05ff]+', '', 'g') ILIKE $${compactParam}`;
      }
      params.push(limit);
      const rows = await client.query(
        `SELECT
           cb.id,
           cb.canonical_name AS name,
           cb.display_name,
           cb.status,
           EXISTS (
             SELECT 1 FROM salon_enabled_brands seb
             WHERE seb.salon_id = $1 AND seb.brand_id = cb.id AND seb.status = 'enabled'
           ) AS enabled,
           COUNT(DISTINCT cpl.id)::int AS product_line_count,
           COUNT(DISTINCT cp.id)::int AS product_count,
           COUNT(DISTINCT sip.id)::int AS inventory_count,
           COUNT(DISTINCT sepl.product_line_id)::int AS selected_product_line_count
         FROM catalog_brands cb
         LEFT JOIN catalog_product_lines cpl ON cpl.manufacturer_id = cb.id
         LEFT JOIN catalog_products cp ON cp.manufacturer_id = cb.id AND cp.active = true
         LEFT JOIN salon_inventory_products sip
           ON sip.salon_id = $1 AND sip.product_id = cp.id AND sip.status = 'active'
         LEFT JOIN salon_enabled_product_lines sepl
           ON sepl.salon_id = $1 AND sepl.brand_id = cb.id AND sepl.status = 'enabled'
         ${filter}
         GROUP BY cb.id, cb.canonical_name, cb.display_name, cb.status
         ORDER BY enabled DESC, cb.canonical_name ASC
         LIMIT $${params.length}`,
        params,
      );
      return res(200, { brands: rows.rows, salonId });
    }

    // GET /brands/:brandId/product-lines — lightweight series list for a brand
    if (method === "GET" && segments[0] === "brands" && segments[2] === "product-lines") {
      const brandId = segments[1];
      const brand = await client.query(`SELECT id FROM catalog_brands WHERE id = $1`, [brandId]);
      if (brand.rows.length === 0) return res(404, "Brand not found", true);

      const rows = await client.query(
        `SELECT
           cpl.id,
           cpl.manufacturer_id AS brand_id,
           COALESCE(cpl.canonical_name, cpl.name) AS name,
           cpl.normalized_name,
           cpl.status,
           EXISTS (
             SELECT 1 FROM salon_enabled_product_lines sepl
             WHERE sepl.salon_id = $1
               AND sepl.product_line_id = cpl.id
               AND sepl.status = 'enabled'
           ) AS enabled,
           COUNT(DISTINCT cp.id)::int AS product_count,
           COUNT(DISTINCT sip.id)::int AS inventory_count
         FROM catalog_product_lines cpl
         LEFT JOIN catalog_products cp ON cp.product_line_id = cpl.id AND cp.active = true
         LEFT JOIN salon_inventory_products sip
           ON sip.salon_id = $1 AND sip.product_id = cp.id AND sip.status = 'active'
         WHERE cpl.manufacturer_id = $2
         GROUP BY cpl.id, cpl.manufacturer_id, cpl.canonical_name, cpl.name, cpl.normalized_name, cpl.status
         ORDER BY COALESCE(cpl.canonical_name, cpl.name) ASC`,
        [salonId, brandId],
      );
      return res(200, { productLines: rows.rows, salonId, brandId });
    }

    // GET /product-lines/enabled — list enabled product lines for this salon
    if (method === "GET" && segments[0] === "product-lines" && segments[1] === "enabled") {
      const rows = await client.query(
        `SELECT
           cpl.id,
           cpl.manufacturer_id AS brand_id,
           COALESCE(cpl.canonical_name, cpl.name) AS name,
           cb.canonical_name AS brand_name,
           sepl.enabled_at
         FROM salon_enabled_product_lines sepl
         JOIN catalog_product_lines cpl ON cpl.id = sepl.product_line_id
         LEFT JOIN catalog_brands cb ON cb.id = sepl.brand_id
         WHERE sepl.salon_id = $1 AND sepl.status = 'enabled'
         ORDER BY cb.canonical_name ASC, COALESCE(cpl.canonical_name, cpl.name) ASC`,
        [salonId],
      );
      return res(200, { productLines: rows.rows, salonId });
    }

    // PATCH /product-lines/enabled/:productLineId — enable/disable a series
    if (method === "PATCH" && segments[0] === "product-lines" && segments[1] === "enabled" && segments.length === 3) {
      const productLineId = segments[2];
      const shouldEnable = body.enabled === true;
      const shouldDisable = body.enabled === false;
      if (!shouldEnable && !shouldDisable) return res(400, "enabled boolean is required", true);

      const line = await client.query(
        `SELECT id, manufacturer_id AS brand_id, COALESCE(canonical_name, name) AS name
         FROM catalog_product_lines
         WHERE id = $1`,
        [productLineId],
      );
      if (line.rows.length === 0) return res(404, "Product line not found", true);
      const lineRow = line.rows[0];

      const brandEnabled = await isBrandEnabled(client, salonId, lineRow.brand_id);
      if (shouldEnable && !brandEnabled) {
        return res(409, {
          error: "Brand must be enabled before enabling product lines",
          code: "BRAND_NOT_ENABLED",
          brandId: lineRow.brand_id,
        });
      }

      if (shouldEnable) {
        const inserted = await client.query(
          `INSERT INTO salon_enabled_product_lines
             (salon_id, brand_id, product_line_id, enabled_by_user_id, status, enabled_at, disabled_at)
           VALUES ($1, $2, $3, $4, 'enabled', now(), NULL)
           ON CONFLICT (salon_id, product_line_id) WHERE status = 'enabled' DO NOTHING
           RETURNING *`,
          [salonId, lineRow.brand_id, productLineId, salonCtx.userId],
        );
        return res(200, {
          enabled: inserted.rows[0] || { salon_id: salonId, brand_id: lineRow.brand_id, product_line_id: productLineId, status: "enabled" },
          salonId,
        });
      }

      const inventoryCount = await getProductLineInventoryCount(client, salonId, productLineId);
      await client.query(
        `UPDATE salon_enabled_product_lines
         SET status = 'disabled', disabled_at = now(), updated_at = now()
         WHERE salon_id = $1 AND product_line_id = $2 AND status = 'enabled'`,
        [salonId, productLineId],
      );
      return res(200, {
        disabled: { salon_id: salonId, brand_id: lineRow.brand_id, product_line_id: productLineId, status: "disabled" },
        inventoryCount,
        warning: inventoryCount > 0
          ? "This product line has inventory items. Disabling it will hide it from default search, but will not delete inventory or history."
          : null,
        salonId,
      });
    }

    // GET /brands/enabled — list enabled brands
    if (method === "GET" && segments[0] === "brands" && segments[1] === "enabled") {
      const rows = await client.query(
        `SELECT
           cb.id,
           cb.canonical_name AS name,
           cb.display_name,
           seb.enabled_at,
           COUNT(DISTINCT sepl.product_line_id)::int AS selected_product_line_count
         FROM salon_enabled_brands seb
         JOIN catalog_brands cb ON cb.id = seb.brand_id
         LEFT JOIN salon_enabled_product_lines sepl
           ON sepl.salon_id = seb.salon_id
          AND sepl.brand_id = seb.brand_id
          AND sepl.status = 'enabled'
         WHERE seb.salon_id = $1 AND seb.status = 'enabled'
         GROUP BY cb.id, cb.canonical_name, cb.display_name, seb.enabled_at
         ORDER BY cb.canonical_name ASC`,
        [salonId],
      );
      return res(200, { brands: rows.rows, salonId });
    }

    // POST /brands/enabled — enable a brand
    if (method === "POST" && segments[0] === "brands" && segments[1] === "enabled") {
      const { brandId } = body;
      if (!brandId) return res(400, "brandId is required", true);
      const brand = await client.query(`SELECT id FROM catalog_brands WHERE id = $1`, [brandId]);
      if (brand.rows.length === 0) return res(404, "Brand not found", true);

      const inserted = await client.query(
        `INSERT INTO salon_enabled_brands (salon_id, brand_id, enabled_by_user_id)
         VALUES ($1, $2, $3)
         ON CONFLICT (salon_id, brand_id) WHERE status = 'enabled' DO NOTHING
         RETURNING *`,
        [salonId, brandId, salonCtx.userId],
      );
      return res(200, { enabled: inserted.rows[0] || { salon_id: salonId, brand_id: brandId, status: "enabled" }, salonId });
    }

    // PATCH /brands/enabled/:brandId — enable/disable a brand for the salon
    if (method === "PATCH" && segments[0] === "brands" && segments[1] === "enabled" && segments.length === 3) {
      const brandId = segments[2];
      const shouldEnable = body.enabled === true;
      const shouldDisable = body.enabled === false;
      if (!shouldEnable && !shouldDisable) return res(400, "enabled boolean is required", true);

      const brand = await client.query(`SELECT id FROM catalog_brands WHERE id = $1`, [brandId]);
      if (brand.rows.length === 0) return res(404, "Brand not found", true);

      if (shouldEnable) {
        const inserted = await client.query(
          `INSERT INTO salon_enabled_brands
             (salon_id, brand_id, enabled_by_user_id, status, enabled_at, disabled_at)
           VALUES ($1, $2, $3, 'enabled', now(), NULL)
           ON CONFLICT (salon_id, brand_id) WHERE status = 'enabled' DO NOTHING
           RETURNING *`,
          [salonId, brandId, salonCtx.userId],
        );
        return res(200, { enabled: inserted.rows[0] || { salon_id: salonId, brand_id: brandId, status: "enabled" }, salonId });
      }

      const inventoryCount = await getBrandInventoryCount(client, salonId, brandId);
      await client.query(
        `UPDATE salon_enabled_brands
         SET status = 'disabled', disabled_at = now(), updated_at = now()
         WHERE salon_id = $1 AND brand_id = $2 AND status = 'enabled'`,
        [salonId, brandId],
      );
      return res(200, {
        disabled: { salon_id: salonId, brand_id: brandId, status: "disabled" },
        inventoryCount,
        warning: inventoryCount > 0
          ? "This brand has inventory items. Disabling it will hide it from default search, but will not delete inventory or history."
          : null,
        salonId,
      });
    }

    // GET /catalog/search — explicit catalog search for the add flow. Results
    // are scoped to this salon's enabled brands/product lines by default.
    if (method === "GET" && segments[0] === "catalog" && segments[1] === "search") {
      const q = (qs.q || "").toLowerCase().trim();
      if (q.length < 2) return res(400, "q must be at least 2 characters", true);
      const limit = clampLimit(qs.limit, 25, 100);
      const runtimeCatalog = await resolveRuntimeCatalog(client);

      const params = [`%${q}%`];
      let brandFilter = "";
      if (qs.brandId) {
        params.push(qs.brandId);
        brandFilter = ` AND cp.manufacturer_id = $${params.length}`;
      }
      params.push(salonId);
      const salonParamIdx = params.length;
      params.push(limit);

      const rows = await client.query(
        `SELECT
           cp.id, cp.canonical_name, cp.primary_product_type,
           cp.package_size_value, cp.package_size_unit,
           cp.manufacturer_id AS brand_id,
           cb.canonical_name AS brand_name,
           cp.product_line_id AS product_line_id,
           cpl.canonical_name AS product_line_name,
           EXISTS (
             SELECT 1 FROM salon_enabled_brands seb
             WHERE seb.salon_id = $${salonParamIdx} AND seb.brand_id = cp.manufacturer_id AND seb.status = 'enabled'
           ) AS brand_enabled,
           EXISTS (
             SELECT 1 FROM salon_inventory_products sip
             WHERE sip.salon_id = $${salonParamIdx} AND sip.product_id = cp.id AND sip.status = 'active'
           ) AS in_inventory
         FROM ${runtimeCatalog.relation} cp
         LEFT JOIN catalog_brands cb ON cb.id = cp.manufacturer_id
         LEFT JOIN catalog_product_lines cpl ON cpl.id = cp.product_line_id
         WHERE cp.active = true${runtimeCatalog.filter}
           AND (
             cp.normalized_name ILIKE $1
             OR LOWER(cp.canonical_name) ILIKE $1
             OR LOWER(COALESCE(cb.canonical_name, '')) ILIKE $1
             OR LOWER(COALESCE(cpl.canonical_name, cpl.name, '')) ILIKE $1
             OR LOWER(COALESCE(cp.primary_product_type, '')) ILIKE $1
           )
           ${catalogScopePredicate(salonParamIdx, "cp")}
           ${brandFilter}
         ORDER BY cp.canonical_name ASC
         LIMIT $${params.length}`,
        params,
      );
      return res(200, { items: rows.rows, salonId });
    }

    return res(404, "Not found", true);
  } catch (err) {
    if (err.code === "42P01") {
      // Salon/catalog tables not migrated yet.
      console.warn("[salon-products] tables missing; run migrations 026-028.", err.message);
      return res(200, { items: [], total: 0, salonId, mock: true, needsMigration: true });
    }
    console.error("[salon-products] error:", err);
    return res(500, err.message || "Internal server error", true);
  } finally {
    if (client) await client.end().catch(() => {});
  }
};

// Re-exported for tests/back-compat. The implementations live in the
// dependency-free helpers module so they can be unit-tested without `pg`.
exports._internals = {
  normalizeSearchTerm,
  compactSearchTerm,
  clampLimit,
  computeStockStatus,
  resolveRuntimeCatalog,
};
