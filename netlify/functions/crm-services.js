/**
 * netlify/functions/crm-services.js
 * ─────────────────────────────────────────────────────────────────────────
 * Tenant-scoped CRM services API.
 *
 * All routes derive salon_id from resolveSalonContext(event). The frontend
 * never sends salonId.
 *
 * Routes:
 *   GET   /                         list departments, categories, services
 *   POST  /departments              create department
 *   PATCH /departments/:id          update/archive department
 *   POST  /categories               create service category
 *   PATCH /categories/:id           update/archive service category
 *   POST  /services                 create service
 *   PATCH /services/:id             update/archive service
 */
"use strict";

const { resolveSalonContext, SalonAuthError } = require("./_salon-context");
const { createClient, hasDatabaseUrl } = require("./_db");

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
};

function res(statusCode, data, isError = false) {
  return { statusCode, headers: CORS, body: JSON.stringify(isError ? { error: data } : data) };
}

function parsePath(event) {
  const raw = (event.path || "").replace("/.netlify/functions/crm-services", "") || "/";
  return raw.split("/").filter(Boolean);
}

async function getClient() {
  const client = createClient();
  await client.connect();
  return client;
}

function numberOr(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function nullableText(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return String(value);
}

function jsonArray(value) {
  return Array.isArray(value) ? JSON.stringify(value) : JSON.stringify([]);
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

async function listCatalog(client, salonId) {
  const [departments, categories, services] = await Promise.all([
    client.query(
      `SELECT * FROM salon_departments
       WHERE salon_id = $1
       ORDER BY sort_order ASC, name ASC`,
      [salonId],
    ),
    client.query(
      `SELECT * FROM salon_service_categories
       WHERE salon_id = $1
       ORDER BY sort_order ASC, name ASC`,
      [salonId],
    ),
    client.query(
      `SELECT s.*, c.crm_category_id
       FROM salon_services s
       LEFT JOIN salon_service_categories c
         ON c.id = s.category_id AND c.salon_id = s.salon_id
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

async function assertOwnsRow(client, table, salonId, id) {
  const r = await client.query(`SELECT id FROM ${table} WHERE salon_id = $1 AND id = $2 LIMIT 1`, [salonId, id]);
  return r.rows.length > 0;
}

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
  let body = {};
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    return res(400, "Invalid JSON body", true);
  }

  if (!hasDatabaseUrl()) {
    return res(200, { departments: [], categories: [], services: [], salonId, mock: true });
  }

  let client;
  try {
    client = await getClient();

    if (method === "GET" && segments.length === 0) {
      return res(200, { ...(await listCatalog(client, salonId)), salonId });
    }

    if (method === "POST" && segments[0] === "departments") {
      if (!body.name) return res(400, "name is required", true);
      const r = await client.query(
        `INSERT INTO salon_departments
           (id, salon_id, name, calendar_label, calendar_color, booking_mode, is_calendar_enabled, sort_order, status)
         VALUES (COALESCE($1, 'sdep-' || gen_random_uuid()::text), $2, $3, $4, $5, COALESCE($6, 'singleBlock'), COALESCE($7, true), COALESCE($8, 0), COALESCE($9, 'active'))
         RETURNING *`,
        [
          body.id || null,
          salonId,
          String(body.name).trim(),
          nullableText(body.calendarLabel) ?? String(body.name).trim(),
          nullableText(body.calendarColor) ?? "#F9B95C",
          nullableText(body.bookingMode) ?? "singleBlock",
          body.isCalendarEnabled !== false,
          numberOr(body.sortOrder, 0),
          body.status === "archived" ? "archived" : "active",
        ],
      );
      return res(201, { department: rowToDepartment(r.rows[0]), salonId });
    }

    if (method === "PATCH" && segments[0] === "departments" && segments[1]) {
      const id = segments[1];
      if (!(await assertOwnsRow(client, "salon_departments", salonId, id))) return res(404, "Department not found", true);
      const current = await client.query(`SELECT * FROM salon_departments WHERE salon_id = $1 AND id = $2`, [salonId, id]);
      const prev = current.rows[0];
      const r = await client.query(
        `UPDATE salon_departments
         SET name = $3,
             calendar_label = $4,
             calendar_color = $5,
             booking_mode = $6,
             is_calendar_enabled = $7,
             sort_order = $8,
             status = $9,
             updated_at = now()
         WHERE salon_id = $1 AND id = $2
         RETURNING *`,
        [
          salonId,
          id,
          body.name !== undefined ? String(body.name).trim() : prev.name,
          body.calendarLabel !== undefined ? nullableText(body.calendarLabel) : prev.calendar_label,
          body.calendarColor !== undefined ? nullableText(body.calendarColor) : prev.calendar_color,
          body.bookingMode !== undefined ? nullableText(body.bookingMode) : prev.booking_mode,
          body.isCalendarEnabled !== undefined ? body.isCalendarEnabled === true : prev.is_calendar_enabled,
          body.sortOrder !== undefined ? numberOr(body.sortOrder, prev.sort_order) : prev.sort_order,
          body.status === "archived" ? "archived" : body.status === "active" ? "active" : prev.status,
        ],
      );
      return res(200, { department: rowToDepartment(r.rows[0]), salonId });
    }

    if (method === "POST" && segments[0] === "categories") {
      if (!body.name || !body.departmentId) return res(400, "name and departmentId are required", true);
      if (!(await assertOwnsRow(client, "salon_departments", salonId, body.departmentId))) return res(404, "Department not found", true);
      const r = await client.query(
        `INSERT INTO salon_service_categories
           (id, salon_id, department_id, crm_category_id, name, accent_color, sort_order, status)
         VALUES (COALESCE($1, 'scat-' || gen_random_uuid()::text), $2, $3, COALESCE($4, 'other'), $5, COALESCE($6, '#D7897F'), COALESCE($7, 0), COALESCE($8, 'active'))
         RETURNING *`,
        [
          body.id || null,
          salonId,
          body.departmentId,
          body.crmCategoryId || "other",
          String(body.name).trim(),
          body.accentColor || "#D7897F",
          numberOr(body.sortOrder, 0),
          body.status === "archived" ? "archived" : "active",
        ],
      );
      return res(201, { category: rowToCategory(r.rows[0]), salonId });
    }

    if (method === "PATCH" && segments[0] === "categories" && segments[1]) {
      const id = segments[1];
      if (!(await assertOwnsRow(client, "salon_service_categories", salonId, id))) return res(404, "Category not found", true);
      const current = await client.query(`SELECT * FROM salon_service_categories WHERE salon_id = $1 AND id = $2`, [salonId, id]);
      const prev = current.rows[0];
      if (body.departmentId && !(await assertOwnsRow(client, "salon_departments", salonId, body.departmentId))) return res(404, "Department not found", true);
      const r = await client.query(
        `UPDATE salon_service_categories
         SET department_id = $3,
             crm_category_id = $4,
             name = $5,
             accent_color = $6,
             sort_order = $7,
             status = $8,
             updated_at = now()
         WHERE salon_id = $1 AND id = $2
         RETURNING *`,
        [
          salonId,
          id,
          body.departmentId || prev.department_id,
          body.crmCategoryId || prev.crm_category_id,
          body.name !== undefined ? String(body.name).trim() : prev.name,
          body.accentColor || prev.accent_color,
          body.sortOrder !== undefined ? numberOr(body.sortOrder, prev.sort_order) : prev.sort_order,
          body.status === "archived" ? "archived" : body.status === "active" ? "active" : prev.status,
        ],
      );
      return res(200, { category: rowToCategory(r.rows[0]), salonId });
    }

    if (method === "POST" && segments[0] === "services") {
      if (!body.name || !body.categoryId) return res(400, "name and categoryId are required", true);
      if (!(await assertOwnsRow(client, "salon_service_categories", salonId, body.categoryId))) return res(404, "Category not found", true);
      const r = await client.query(
        `INSERT INTO salon_services
           (id, salon_id, category_id, name, default_duration_minutes, default_price_cents,
            default_material_cost_cents, accent_color, sort_order, status, default_stages,
            linked_service_ids, allow_client_timing_overrides, can_overlap_during_processing)
         VALUES (COALESCE($1, 'ssvc-' || gen_random_uuid()::text), $2, $3, $4, $5, $6, $7, $8, $9, COALESCE($10, 'active'),
                 $11::jsonb, $12::jsonb, COALESCE($13, true), COALESCE($14, true))
         RETURNING *`,
        [
          body.id || null,
          salonId,
          body.categoryId,
          String(body.name).trim(),
          numberOr(body.defaultDurationMinutes, 60),
          numberOr(body.defaultPriceCents, 0),
          numberOr(body.defaultMaterialCostCents, 0),
          body.accentColor || null,
          numberOr(body.sortOrder, 0),
          body.status === "archived" ? "archived" : "active",
          jsonArray(body.defaultStages),
          jsonArray(body.linkedServiceIds),
          body.allowClientTimingOverrides !== false,
          body.canOverlapDuringProcessing !== false,
        ],
      );
      const enriched = await client.query(
        `SELECT s.*, c.crm_category_id
         FROM salon_services s
         LEFT JOIN salon_service_categories c ON c.id = s.category_id AND c.salon_id = s.salon_id
         WHERE s.salon_id = $1 AND s.id = $2`,
        [salonId, r.rows[0].id],
      );
      return res(201, { service: rowToService(enriched.rows[0]), salonId });
    }

    if (method === "PATCH" && segments[0] === "services" && segments[1]) {
      const id = segments[1];
      if (!(await assertOwnsRow(client, "salon_services", salonId, id))) return res(404, "Service not found", true);
      const current = await client.query(`SELECT * FROM salon_services WHERE salon_id = $1 AND id = $2`, [salonId, id]);
      const prev = current.rows[0];
      if (body.categoryId && !(await assertOwnsRow(client, "salon_service_categories", salonId, body.categoryId))) return res(404, "Category not found", true);
      await client.query(
        `UPDATE salon_services
         SET category_id = $3,
             name = $4,
             default_duration_minutes = $5,
             default_price_cents = $6,
             default_material_cost_cents = $7,
             accent_color = $8,
             sort_order = $9,
             status = $10,
             default_stages = $11::jsonb,
             linked_service_ids = $12::jsonb,
             allow_client_timing_overrides = $13,
             can_overlap_during_processing = $14,
             updated_at = now()
         WHERE salon_id = $1 AND id = $2`,
        [
          salonId,
          id,
          body.categoryId || prev.category_id,
          body.name !== undefined ? String(body.name).trim() : prev.name,
          body.defaultDurationMinutes !== undefined ? numberOr(body.defaultDurationMinutes, prev.default_duration_minutes) : prev.default_duration_minutes,
          body.defaultPriceCents !== undefined ? numberOr(body.defaultPriceCents, prev.default_price_cents) : prev.default_price_cents,
          body.defaultMaterialCostCents !== undefined ? numberOr(body.defaultMaterialCostCents, prev.default_material_cost_cents) : prev.default_material_cost_cents,
          body.accentColor !== undefined ? nullableText(body.accentColor) : prev.accent_color,
          body.sortOrder !== undefined ? numberOr(body.sortOrder, prev.sort_order) : prev.sort_order,
          body.status === "archived" ? "archived" : body.status === "active" ? "active" : prev.status,
          body.defaultStages !== undefined ? jsonArray(body.defaultStages) : JSON.stringify(prev.default_stages || []),
          body.linkedServiceIds !== undefined ? jsonArray(body.linkedServiceIds) : JSON.stringify(prev.linked_service_ids || []),
          body.allowClientTimingOverrides !== undefined ? body.allowClientTimingOverrides === true : prev.allow_client_timing_overrides,
          body.canOverlapDuringProcessing !== undefined ? body.canOverlapDuringProcessing === true : prev.can_overlap_during_processing,
        ],
      );
      const enriched = await client.query(
        `SELECT s.*, c.crm_category_id
         FROM salon_services s
         LEFT JOIN salon_service_categories c ON c.id = s.category_id AND c.salon_id = s.salon_id
         WHERE s.salon_id = $1 AND s.id = $2`,
        [salonId, id],
      );
      return res(200, { service: rowToService(enriched.rows[0]), salonId });
    }

    return res(404, "Not found", true);
  } catch (err) {
    if (err.code === "42P01" || err.code === "42703") {
      console.warn("[crm-services] service tables missing; run migrations 033-034.", err.message);
      return res(200, { departments: [], categories: [], services: [], salonId, needsMigration: true });
    }
    console.error("[crm-services] error:", err);
    return res(500, err.message || "Internal server error", true);
  } finally {
    if (client) await client.end().catch(() => {});
  }
};
