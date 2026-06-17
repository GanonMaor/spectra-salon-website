/**
 * netlify/functions/canonical-product-db.js
 * ─────────────────────────────────────────────────────────────────────────
 * Minimal read-only inspection API for the Canonical Product Database.
 *
 * Milestone 1 Step 9: Minimal DB-Backed APIs
 *
 * Endpoints (all GET):
 *   ?action=counts           — Counts for all canonical product db tables
 *   ?action=list             — Paginated canonical products (lightweight rows)
 *   ?action=product&id=<id>  — One canonical product with family + mfr info
 *   ?action=sources&id=<id>  — Source records assigned to a canonical product
 *   ?action=batches          — Recent import batches
 *   ?action=batch&id=<id>    — One import batch with summary
 *   ?action=review-counts    — Open review item counts by type
 *   ?action=mappings&name=<n> — Active mappings for a normalized raw name
 *
 * Auth: X-Access-Code header
 * Security: Read-only. No mutations. No arbitrary SQL from client.
 */
"use strict";

const { neon } = require("@neondatabase/serverless");

const ACCESS_CODE = process.env.USAGE_IMPORT_ACCESS_CODE || "070315";

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "Content-Type, X-Access-Code",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const ALLOWED_ACTIONS = new Set([
  "counts",
  "list",
  "product",
  "sources",
  "batches",
  "batch",
  "review-counts",
  "mappings",
]);

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: CORS, body: "" };
  }

  if (event.httpMethod !== "GET") {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const accessCode = event.headers?.["x-access-code"] || event.queryStringParameters?.code;
  if (accessCode !== ACCESS_CODE) {
    return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  const databaseUrl = process.env.NEON_DATABASE_URL;
  if (!databaseUrl) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: "NEON_DATABASE_URL not configured" }) };
  }

  const params = event.queryStringParameters || {};
  const action = params.action || "counts";

  if (!ALLOWED_ACTIONS.has(action)) {
    return {
      statusCode: 400,
      headers: CORS,
      body: JSON.stringify({ error: "Unknown action", allowed: [...ALLOWED_ACTIONS] }),
    };
  }

  try {
    const sql = neon(databaseUrl);
    let data;

    switch (action) {

      case "counts": {
        const [counts] = await sql`
          SELECT
            (SELECT COUNT(*) FROM canonical_manufacturers WHERE status = 'active')::int   AS manufacturers,
            (SELECT COUNT(*) FROM product_lines        WHERE status = 'active')::int       AS product_lines,
            (SELECT COUNT(*) FROM product_families     WHERE status = 'active')::int       AS product_families,
            (SELECT COUNT(*) FROM canonical_products   WHERE active = true)::int           AS canonical_products,
            (SELECT COUNT(*) FROM canonical_products)::int                                  AS canonical_products_total,
            (SELECT COUNT(*) FROM catalog_product_sources)::int                            AS source_records,
            (SELECT COUNT(*) FROM catalog_product_sources WHERE canonical_product_id IS NOT NULL)::int AS sources_assigned,
            (SELECT COUNT(*) FROM product_identity_mappings WHERE active = true)::int      AS active_mappings,
            (SELECT COUNT(*) FROM product_aliases       WHERE active = true)::int          AS active_aliases,
            (SELECT COUNT(*) FROM product_import_batches WHERE status = 'completed' OR status = 'completed_with_warnings')::int AS completed_batches,
            (SELECT COUNT(*) FROM product_review_items  WHERE status IN ('open','in_progress'))::int AS open_review_items,
            (SELECT COUNT(*) FROM product_audit_logs)::int                                 AS audit_log_entries
        `;
        data = counts;
        break;
      }

      case "list": {
        const page  = Math.max(1, parseInt(params.page,  10) || 1);
        const limit = Math.min(200, Math.max(1, parseInt(params.limit, 10) || 50));
        const offset = (page - 1) * limit;

        const manufacturerId    = params.manufacturer_id    || null;
        const productLineId     = params.product_line_id    || null;
        const productType       = params.product_type       || null;
        const validationStatus  = params.validation_status  || null;
        const evidenceStatus    = params.evidence_status    || null;
        const activeOnly        = params.active !== "false";
        const q                 = params.q ? params.q.toLowerCase().trim() : null;

        const [total] = await sql`
          SELECT COUNT(*)::int AS count
          FROM canonical_products cp
          WHERE (${activeOnly ? sql`cp.active = true` : sql`TRUE`})
            AND (${manufacturerId  ? sql`cp.manufacturer_id = ${manufacturerId}` : sql`TRUE`})
            AND (${productLineId   ? sql`cp.product_line_id = ${productLineId}`  : sql`TRUE`})
            AND (${productType     ? sql`cp.primary_product_type = ${productType}` : sql`TRUE`})
            AND (${validationStatus ? sql`cp.validation_status = ${validationStatus}` : sql`TRUE`})
            AND (${evidenceStatus  ? sql`cp.evidence_status = ${evidenceStatus}` : sql`TRUE`})
            AND (${q ? sql`cp.normalized_name ILIKE ${'%' + q + '%'}` : sql`TRUE`})
        `;

        const rows = await sql`
          SELECT
            cp.id,
            cp.canonical_name,
            cm.canonical_name AS manufacturer_name,
            pl.canonical_name AS product_line_name,
            cp.primary_product_type,
            cp.package_size_value,
            cp.package_size_unit,
            cp.validation_status,
            cp.evidence_status,
            cp.active,
            cp.source_count,
            cp.alias_count,
            cp.review_item_count,
            cp.created_at,
            cp.updated_at
          FROM canonical_products cp
          JOIN canonical_manufacturers cm ON cm.id = cp.manufacturer_id
          LEFT JOIN product_lines pl ON pl.id = cp.product_line_id
          WHERE (${activeOnly ? sql`cp.active = true` : sql`TRUE`})
            AND (${manufacturerId  ? sql`cp.manufacturer_id = ${manufacturerId}` : sql`TRUE`})
            AND (${productLineId   ? sql`cp.product_line_id = ${productLineId}`  : sql`TRUE`})
            AND (${productType     ? sql`cp.primary_product_type = ${productType}` : sql`TRUE`})
            AND (${validationStatus ? sql`cp.validation_status = ${validationStatus}` : sql`TRUE`})
            AND (${evidenceStatus  ? sql`cp.evidence_status = ${evidenceStatus}` : sql`TRUE`})
            AND (${q ? sql`cp.normalized_name ILIKE ${'%' + q + '%'}` : sql`TRUE`})
          ORDER BY cp.updated_at DESC, cp.canonical_name ASC
          LIMIT ${limit} OFFSET ${offset}
        `;

        data = {
          items: rows,
          total: total.count,
          page,
          limit,
          hasMore: offset + rows.length < total.count,
        };
        break;
      }

      case "product": {
        const { id } = params;
        if (!id) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "id required" }) };

        const [product] = await sql`
          SELECT
            cp.*,
            cm.canonical_name AS manufacturer_name,
            cm.display_name   AS manufacturer_display_name,
            pl.canonical_name AS product_line_name,
            pf.canonical_name AS product_family_name
          FROM canonical_products cp
          JOIN canonical_manufacturers cm ON cm.id = cp.manufacturer_id
          LEFT JOIN product_lines pl ON pl.id = cp.product_line_id
          LEFT JOIN product_families pf ON pf.id = cp.product_family_id
          WHERE cp.id = ${id}
        `;
        if (!product) {
          return { statusCode: 404, headers: CORS, body: JSON.stringify({ error: "Product not found" }) };
        }

        const aliases = await sql`
          SELECT id, alias, normalized_alias, alias_type, confidence, active, created_at
          FROM product_aliases
          WHERE canonical_product_id = ${id} AND active = true
          ORDER BY confidence DESC, alias ASC
          LIMIT 50
        `;

        data = { product, aliases };
        break;
      }

      case "sources": {
        const { id } = params;
        if (!id) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "id required" }) };

        const page  = Math.max(1, parseInt(params.page,  10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(params.limit, 10) || 20));
        const offset = (page - 1) * limit;

        const [total] = await sql`
          SELECT COUNT(*)::int AS count
          FROM catalog_product_sources
          WHERE canonical_product_id = ${id}
        `;
        const sources = await sql`
          SELECT
            id, source_system, source_product_id, source_file, source_sheet,
            raw_product_name, raw_brand, raw_product_line, raw_shade_code,
            raw_size, raw_unit, raw_barcode, raw_catalog_number,
            raw_product_type, raw_active_status, import_batch_id, created_at
          FROM catalog_product_sources
          WHERE canonical_product_id = ${id}
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
        data = { id, sources, total: total.count, page, limit };
        break;
      }

      case "batches": {
        const limit = Math.min(50, Math.max(1, parseInt(params.limit, 10) || 20));
        const batches = await sql`
          SELECT
            id, source_type, source_file, status,
            total_rows, inserted_rows, review_rows, invalid_rows,
            started_at, completed_at, created_at
          FROM product_import_batches
          ORDER BY created_at DESC
          LIMIT ${limit}
        `;
        data = { batches };
        break;
      }

      case "batch": {
        const { id } = params;
        if (!id) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "id required" }) };

        const [batch] = await sql`SELECT * FROM product_import_batches WHERE id = ${id}`;
        if (!batch) {
          return { statusCode: 404, headers: CORS, body: JSON.stringify({ error: "Batch not found" }) };
        }
        const [srcCount] = await sql`
          SELECT COUNT(*)::int AS count FROM catalog_product_sources WHERE import_batch_id = ${id}
        `;
        data = { batch, sourceRecordCount: srcCount.count };
        break;
      }

      case "review-counts": {
        const counts = await sql`
          SELECT
            review_type,
            status,
            COUNT(*)::int AS count
          FROM product_review_items
          GROUP BY review_type, status
          ORDER BY review_type, status
        `;
        const total = await sql`SELECT COUNT(*)::int AS count FROM product_review_items WHERE status IN ('open','in_progress')`;
        data = { counts, openTotal: total[0].count };
        break;
      }

      case "mappings": {
        const name = params.name;
        if (!name) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "name required" }) };

        const normalizedName = name.toLowerCase().trim().replace(/\s+/g, " ");
        const mappings = await sql`
          SELECT
            m.id, m.mapping_type, m.match_method, m.confidence,
            m.validation_status, m.canonical_product_id,
            cp.canonical_name AS canonical_product_name,
            m.assigned_by, m.assigned_at, m.active, m.notes
          FROM product_identity_mappings m
          LEFT JOIN canonical_products cp ON cp.id = m.canonical_product_id
          WHERE m.normalized_raw_name = ${normalizedName}
            AND m.active = true
          ORDER BY m.confidence DESC, m.assigned_at DESC
          LIMIT 20
        `;
        data = { name, normalizedName, mappings };
        break;
      }
    }

    return {
      statusCode: 200,
      headers: { ...CORS, "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };

  } catch (err) {
    console.error("canonical-product-db error:", err);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: "Internal server error", details: err.message }),
    };
  }
};
