/**
 * netlify/functions/crm-history.js
 * ─────────────────────────────────────────────────────────────────────────
 * Paged history loader for large pilot salons.
 *
 * crm-bootstrap keeps the cold-boot payload under Netlify's ~6MB sync limit.
 * This endpoint pages the deferred collections afterwards:
 *   - appointments older than the bootstrap window (with segments)
 *   - product_usage rows
 *
 * GET /.netlify/functions/crm-history?collection=appointments&before=ISO&limit=300
 * GET /.netlify/functions/crm-history?collection=productUsage&offset=0&limit=1500
 *
 * salon_id ALWAYS comes from the verified session via resolveSalonContext().
 */
"use strict";

const { resolveSalonContext, SalonAuthError } = require("./_salon-context");
const { createClient, hasDatabaseUrl } = require("./_db");

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const DEFAULT_APPT_LIMIT = 300;
const MAX_APPT_LIMIT = 500;
const DEFAULT_USAGE_LIMIT = 1500;
const MAX_USAGE_LIMIT = 2500;

function optionsResponse() {
  return { statusCode: 200, headers: CORS, body: "" };
}

function success(data, meta = {}) {
  return {
    statusCode: 200,
    headers: CORS,
    body: JSON.stringify({ ok: true, data, meta }),
  };
}

function failure(statusCode, code, message, details = {}) {
  return {
    statusCode,
    headers: CORS,
    body: JSON.stringify({ ok: false, error: { code, message, details } }),
  };
}

function clampInt(value, fallback, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(n)));
}

function rowToSegment(row) {
  return {
    id: row.id,
    salonId: row.salon_id,
    appointmentId: row.appointment_id,
    staffMemberId: row.staff_member_id || null,
    resourceId: row.resource_id || null,
    serviceId: row.service_id || null,
    serviceName: row.service_name || null,
    serviceCategoryId: row.service_category_id || null,
    segmentType: row.segment_type || "service",
    label: row.label || "",
    startTime: row.start_time,
    endTime: row.end_time,
    sortOrder: row.sort_order || 0,
    productGrams: row.product_grams === null || row.product_grams === undefined
      ? null
      : Number(row.product_grams),
    notes: row.notes || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToAppointment(row, segments = []) {
  const listPrice = row.list_price_cents === null || row.list_price_cents === undefined
    ? null
    : Number(row.list_price_cents);
  const estimatedRevenue = row.estimated_revenue_cents === null || row.estimated_revenue_cents === undefined
    ? null
    : Number(row.estimated_revenue_cents);
  return {
    id: row.id,
    salonId: row.salon_id,
    staffMemberId: row.staff_member_id || null,
    customerId: row.customer_id || null,
    customerName: row.customer_name || "",
    serviceId: row.service_id || null,
    serviceName: row.service_name || "",
    serviceCategoryId: row.service_category_id || null,
    startTime: row.start_time,
    endTime: row.end_time,
    status: row.status,
    notes: row.notes || null,
    groupId: row.group_id || null,
    listPriceCents: Number.isFinite(listPrice) ? listPrice : null,
    estimatedRevenueCents: Number.isFinite(estimatedRevenue) ? estimatedRevenue : null,
    revenueSource: row.revenue_source || null,
    pricingSource: row.pricing_source || null,
    pricingConfidence: row.pricing_confidence || null,
    pricingSnapshot: row.pricing_snapshot || null,
    pricingComputedAt: row.pricing_computed_at || null,
    segments,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToProductUsage(row) {
  const cost = row.cost_at_use_amount === null || row.cost_at_use_amount === undefined
    ? 0
    : Number(row.cost_at_use_amount);
  return {
    id: row.id,
    mixSessionId: row.visit_id || row.id,
    productId: row.product_id,
    inventoryItemId: row.inventory_product_id || "",
    grams: row.quantity === null || row.quantity === undefined ? 0 : Number(row.quantity),
    costAtUseUsd: Number.isFinite(cost) ? cost : 0,
    recordedAt: row.recorded_at,
    sourceBrand: row.source_brand || null,
    sourceSeries: row.source_series || null,
    sourceShade: row.source_shade || null,
    sourceServiceName: row.source_service_name || null,
    costCurrency: row.cost_currency || null,
  };
}

async function tableExists(client, table) {
  const r = await client.query(`SELECT to_regclass($1) IS NOT NULL AS ok`, [`public.${table}`]);
  return Boolean(r.rows[0] && r.rows[0].ok);
}

async function hasProductUsageMeta(client) {
  const metaProbe = await client.query(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'salon_product_usage'
         AND column_name = 'source_brand'
     ) AS has_meta`,
  );
  return Boolean(metaProbe.rows[0] && metaProbe.rows[0].has_meta);
}

async function pageAppointments(client, salonId, query) {
  if (!(await tableExists(client, "salon_appointments"))) {
    return { items: [], nextBefore: null, done: true };
  }
  const limit = clampInt(query.limit, DEFAULT_APPT_LIMIT, 1, MAX_APPT_LIMIT);
  const before = query.before ? String(query.before) : new Date().toISOString();
  const hasSegments = await tableExists(client, "salon_appointment_segments");

  let rows;
  if (hasSegments) {
    const r = await client.query(
      `WITH page AS (
         SELECT id
         FROM salon_appointments
         WHERE salon_id = $1
           AND start_time < $2::timestamptz
         ORDER BY start_time DESC, created_at DESC, id DESC
         LIMIT $3
       )
       SELECT
         a.*,
         COALESCE(
           json_agg(
             to_jsonb(s) ORDER BY s.sort_order ASC, s.start_time ASC, s.id ASC
           ) FILTER (WHERE s.id IS NOT NULL),
           '[]'
         ) AS segments
       FROM salon_appointments a
       INNER JOIN page p ON p.id = a.id
       LEFT JOIN salon_appointment_segments s
         ON s.appointment_id = a.id AND s.salon_id = $1
       GROUP BY a.id
       ORDER BY a.start_time DESC, a.created_at DESC, a.id DESC`,
      [salonId, before, limit],
    );
    rows = r.rows;
  } else {
    const r = await client.query(
      `SELECT *
       FROM salon_appointments
       WHERE salon_id = $1
         AND start_time < $2::timestamptz
       ORDER BY start_time DESC, created_at DESC, id DESC
       LIMIT $3`,
      [salonId, before, limit],
    );
    rows = r.rows.map((row) => ({ ...row, segments: [] }));
  }

  const items = rows.map((row) => {
    const segs = Array.isArray(row.segments) ? row.segments : [];
    return rowToAppointment(row, segs.map(rowToSegment));
  });
  const done = items.length < limit;
  const nextBefore = done || items.length === 0
    ? null
    : items[items.length - 1].startTime;

  return { items, nextBefore, done };
}

async function pageProductUsage(client, salonId, query) {
  if (!(await tableExists(client, "salon_product_usage"))) {
    return { items: [], nextOffset: null, done: true };
  }
  const limit = clampInt(query.limit, DEFAULT_USAGE_LIMIT, 1, MAX_USAGE_LIMIT);
  const offset = clampInt(query.offset, 0, 0, 5_000_000);
  const hasImportMeta = await hasProductUsageMeta(client);
  const sourceCols = hasImportMeta
    ? `, source_brand, source_series, source_shade, source_service_name, cost_currency`
    : ``;

  const r = await client.query(
    `SELECT id, salon_id, product_id, inventory_product_id, visit_id, quantity,
            recorded_at, cost_at_use_amount${sourceCols}
     FROM salon_product_usage
     WHERE salon_id = $1
     ORDER BY recorded_at ASC, created_at ASC, id ASC
     LIMIT $2 OFFSET $3`,
    [salonId, limit, offset],
  );
  const items = r.rows.map(rowToProductUsage);
  const done = items.length < limit;
  const nextOffset = done ? null : offset + items.length;
  return { items, nextOffset, done };
}

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") return optionsResponse();
  if (event.httpMethod !== "GET") {
    return failure(405, "METHOD_NOT_ALLOWED", "Method not allowed");
  }

  let salonCtx;
  try {
    salonCtx = resolveSalonContext(event);
  } catch (err) {
    if (err instanceof SalonAuthError) {
      return failure(err.statusCode, "AUTH_ERROR", err.message);
    }
    return failure(401, "UNAUTHORIZED", "Unauthorized");
  }

  const query = event.queryStringParameters || {};
  const collection = String(query.collection || "").trim();
  if (collection !== "appointments" && collection !== "productUsage") {
    return failure(400, "VALIDATION_ERROR", "collection must be appointments or productUsage");
  }

  if (!hasDatabaseUrl()) {
    return success(
      { collection, items: [], done: true },
      { salonId: salonCtx.salonId, mock: true },
    );
  }

  let client;
  try {
    client = createClient();
    await client.connect();

    const page = collection === "appointments"
      ? await pageAppointments(client, salonCtx.salonId, query)
      : await pageProductUsage(client, salonCtx.salonId, query);

    return success(
      {
        collection,
        items: page.items,
        done: page.done,
        nextBefore: page.nextBefore ?? null,
        nextOffset: page.nextOffset ?? null,
      },
      {
        salonId: salonCtx.salonId,
        source: salonCtx.source,
        count: page.items.length,
        generatedAt: new Date().toISOString(),
      },
    );
  } catch (err) {
    console.error("[crm-history] error:", err.message || "unexpected error");
    return failure(500, "INTERNAL_ERROR", "Internal server error");
  } finally {
    if (client) await client.end().catch(() => {});
  }
};
