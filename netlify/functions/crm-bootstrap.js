/**
 * netlify/functions/crm-bootstrap.js
 * ─────────────────────────────────────────────────────────────────────────
 * Authenticated CRM bootstrap payload (Phase A foundation).
 *
 * Returns the authenticated salon's identity, the current user/role, and
 * lightweight tenant-scoped counts. salon_id is ALWAYS derived from the
 * verified session via resolveSalonContext() — never from client input.
 *
 * This is the seam the CRM frontend should hydrate from instead of trusting a
 * global localStorage snapshot. It is intentionally read-only and additive: it
 * does not mutate any data and tolerates tenant tables not being migrated yet
 * (returns zero counts with needsMigration: true).
 *
 * GET /.netlify/functions/crm-bootstrap
 */
"use strict";

const { Client } = require("pg");
const { resolveSalonContext, SalonAuthError } = require("./_salon-context");

const DATABASE_URL = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

function res(statusCode, data, isError = false) {
  return { statusCode, headers: CORS, body: JSON.stringify(isError ? { error: data } : data) };
}

async function tableExists(client, name) {
  const r = await client.query(`SELECT to_regclass($1) AS v`, [`public.${name}`]);
  return Boolean(r.rows[0] && r.rows[0].v);
}

async function scopedCount(client, table, salonId) {
  if (!(await tableExists(client, table))) return null;
  const r = await client.query(`SELECT COUNT(*)::int AS n FROM ${table} WHERE salon_id = $1`, [salonId]);
  return r.rows[0].n;
}

function rowToDepartment(row) {
  return {
    id: row.id,
    name: row.name,
    calendarLabel: row.calendar_label,
    calendarColor: row.calendar_color,
    bookingMode: row.booking_mode,
    isCalendarEnabled: row.is_calendar_enabled,
    sortOrder: row.sort_order,
    status: row.status,
  };
}

function rowToCategory(row) {
  return {
    id: row.id,
    departmentId: row.department_id,
    crmCategoryId: row.crm_category_id,
    name: row.name,
    accentColor: row.accent_color,
    sortOrder: row.sort_order,
    status: row.status,
  };
}

function rowToService(row) {
  return {
    id: row.id,
    categoryId: row.category_id,
    crmCategoryId: row.crm_category_id || "other",
    name: row.name,
    defaultDurationMinutes: row.default_duration_minutes,
    defaultPriceCents: row.default_price_cents,
    defaultMaterialCostCents: row.default_material_cost_cents,
    accentColor: row.accent_color,
    sortOrder: row.sort_order,
    status: row.status,
    defaultStages: row.default_stages || [],
    linkedServiceIds: row.linked_service_ids || [],
    allowClientTimingOverrides: row.allow_client_timing_overrides,
    canOverlapDuringProcessing: row.can_overlap_during_processing,
  };
}

async function loadServicesCatalog(client, salonId) {
  const hasTables = await tableExists(client, "salon_departments") &&
    await tableExists(client, "salon_service_categories") &&
    await tableExists(client, "salon_services");
  if (!hasTables) return null;
  const [departments, categories, services] = await Promise.all([
    client.query(`SELECT * FROM salon_departments WHERE salon_id = $1 ORDER BY sort_order ASC, name ASC`, [salonId]),
    client.query(`SELECT * FROM salon_service_categories WHERE salon_id = $1 ORDER BY sort_order ASC, name ASC`, [salonId]),
    client.query(
      `SELECT s.*, c.crm_category_id
       FROM salon_services s
       LEFT JOIN salon_service_categories c ON c.id = s.category_id AND c.salon_id = s.salon_id
       WHERE s.salon_id = $1
       ORDER BY s.sort_order ASC, s.name ASC`,
      [salonId],
    ),
  ]);
  return {
    departments: departments.rows.map(rowToDepartment),
    categories: categories.rows.map(rowToCategory),
    services: services.rows.map(rowToService),
  };
}

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") return res(200, "");
  if (event.httpMethod !== "GET") return res(405, "Method not allowed", true);

  let salonCtx;
  try {
    salonCtx = resolveSalonContext(event);
  } catch (err) {
    if (err instanceof SalonAuthError) return res(err.statusCode, err.message, true);
    return res(401, "Unauthorized", true);
  }
  const salonId = salonCtx.salonId;

  const identity = {
    salonId,
    userId: salonCtx.userId,
    role: salonCtx.role || null,
    source: salonCtx.source,
  };

  if (!DATABASE_URL || DATABASE_URL.length < 10) {
    return res(200, { ...identity, salon: null, counts: {}, mock: true });
  }

  let client;
  try {
    client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
    await client.connect();

    let salon = null;
    if (await tableExists(client, "salons")) {
      const r = await client.query(`SELECT * FROM salons WHERE id = $1 LIMIT 1`, [salonId]);
      salon = r.rows[0] || null;
    }

    const counts = {
      customers: await scopedCount(client, "salon_customers", salonId),
      staff: await scopedCount(client, "salon_staff", salonId),
      services: await scopedCount(client, "salon_services", salonId),
      departments: await scopedCount(client, "salon_departments", salonId),
      appointments: await scopedCount(client, "salon_appointments", salonId),
      inventoryProducts: await scopedCount(client, "salon_inventory_products", salonId),
      enabledBrands: await scopedCount(client, "salon_enabled_brands", salonId),
    };

    const needsMigration = Object.values(counts).some((v) => v === null);
    const servicesCatalog = await loadServicesCatalog(client, salonId);

    return res(200, { ...identity, salon, counts, servicesCatalog, needsMigration });
  } catch (err) {
    console.error("[crm-bootstrap] error:", err);
    return res(500, err.message || "Internal server error", true);
  } finally {
    if (client) await client.end().catch(() => {});
  }
};
