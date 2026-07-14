/**
 * netlify/functions/crm-services.js
 * ─────────────────────────────────────────────────────────────────────────
 * Tenant-scoped CRM services API.
 *
 * All routes derive salon_id from resolveSalonContext(event). The frontend
 * never sends salonId.
 *
 * Routes:
 *   GET   /                         list departments, categories, services, resources
 *   POST  /departments              create department
 *   PATCH /departments/:id          update/archive department (dependency-checked)
 *   POST  /categories               create service category
 *   PATCH /categories/:id           update/archive service category (dependency-checked)
 *   POST  /services                 create service
 *   PATCH /services/:id             update/archive service
 *   POST  /resources                create persistent resource
 *   PATCH /resources/:id            update/archive resource (dependency-checked)
 *
 * Archiving an entity with active dependents (or a resource with future
 * appointments) returns 409 with a { blockers } payload unless the caller
 * passes an explicit action: cascade, reassign*Id, or force.
 */
"use strict";

const { resolveSalonContext, SalonAuthError, requireContextPermission, PermissionError, enforceSessionStatus } = require("./_salon-context");
const { createClient, hasDatabaseUrl } = require("./_db");
const {
  normalizeCatalogStatus,
  resolveStatusForPatch,
  isArchiveTransition,
  evaluateArchive,
} = require("./lib/catalog-lifecycle");
const { segmentHoldsResource, findResourceConflicts } = require("./lib/resource-enforcement");

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

function boolOr(value, fallback) {
  if (value === undefined || value === null) return fallback;
  return value === true;
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
    resourceRequirements: row.resource_requirements || [],
    allowClientTimingOverrides: row.allow_client_timing_overrides,
    canOverlapDuringProcessing: row.can_overlap_during_processing,
  };
}

function rowToResource(row) {
  return {
    id: row.id,
    departmentId: row.department_id || null,
    type: row.type || "other",
    name: row.name,
    capacity: row.capacity === null || row.capacity === undefined ? 1 : Number(row.capacity),
    isExclusive: row.is_exclusive !== false,
    holdingSegmentTypes: row.holding_segment_types || [],
    sortOrder: row.sort_order || 0,
    status: row.status,
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
    resources: await listResources(client, salonId),
  };
}

// Resources arrived in migration 039, after departments/categories/services.
// Degrade gracefully (empty list) on databases that have 033/034 but not 039
// so the rest of the catalog still loads.
async function listResources(client, salonId) {
  try {
    const r = await client.query(
      `SELECT * FROM salon_resources
       WHERE salon_id = $1
       ORDER BY sort_order ASC, name ASC`,
      [salonId],
    );
    return r.rows.map(rowToResource);
  } catch (err) {
    if (err.code === "42P01" || err.code === "42703") return [];
    throw err;
  }
}

async function assertOwnsRow(client, table, salonId, id) {
  const r = await client.query(`SELECT id FROM ${table} WHERE salon_id = $1 AND id = $2 LIMIT 1`, [salonId, id]);
  return r.rows.length > 0;
}

async function countRows(client, sql, params) {
  const r = await client.query(sql, params);
  return Number(r.rows[0] ? r.rows[0].n : 0) || 0;
}

function resourceConflictError(conflicts) {
  const err = new Error("Target resource lacks capacity for the future holds being reassigned.");
  err.statusCode = 409;
  err.code = "RESOURCE_CONFLICT";
  err.details = { conflicts };
  return err;
}

/**
 * Runs within the caller's transaction. Locks source + target resources in
 * stable id order, then validates every future source hold against the target's
 * effective capacity/exclusivity before the reassignment is written.
 */
async function reassignFutureResourceHolds(client, salonId, sourceResourceId, targetResourceId) {
  if (sourceResourceId === targetResourceId) {
    const err = new Error("reassignResourceId must differ from the archived resource");
    err.statusCode = 400;
    err.code = "VALIDATION_ERROR";
    err.details = {};
    throw err;
  }
  const locked = await client.query(
    `SELECT *
     FROM salon_resources
     WHERE salon_id = $1 AND id = ANY($2)
     ORDER BY id ASC
     FOR UPDATE`,
    [salonId, [sourceResourceId, targetResourceId]],
  );
  if (locked.rows.length !== 2) {
    const err = new Error("Reassign resource not found");
    err.statusCode = 404;
    err.code = "NOT_FOUND";
    err.details = {};
    throw err;
  }

  const targetRow = locked.rows.find((row) => row.id === targetResourceId);
  const sourceRow = locked.rows.find((row) => row.id === sourceResourceId);
  if (!targetRow || targetRow.status !== "active") {
    const err = new Error("Reassign target resource must be active.");
    err.statusCode = 409;
    err.code = "INVALID_REASSIGN_TARGET";
    err.details = {};
    throw err;
  }
  const target = {
    id: targetRow.id,
    capacity: Number(targetRow.capacity || 1),
    isExclusive: targetRow.is_exclusive !== false,
    holdingSegmentTypes: targetRow.holding_segment_types || [],
  };

  const futureSource = await client.query(
    `SELECT seg.segment_type, seg.start_time AS "startTime", seg.end_time AS "endTime"
     FROM salon_appointment_segments seg
     JOIN salon_appointments a
       ON a.id = seg.appointment_id AND a.salon_id = seg.salon_id
     WHERE seg.salon_id = $1
       AND seg.resource_id = $2
       AND a.status <> 'cancelled'
       AND seg.end_time >= now()`,
    [salonId, sourceResourceId],
  );
  const candidateSegments = futureSource.rows.map((segment) => ({
    ...segment,
    resourceId: targetResourceId,
  })).filter((segment) => segmentHoldsResource(segment, target));
  if (candidateSegments.length === 0) return sourceRow;

  const futureTarget = await client.query(
    `SELECT seg.segment_type, seg.start_time AS "startTime", seg.end_time AS "endTime"
     FROM salon_appointment_segments seg
     JOIN salon_appointments a
       ON a.id = seg.appointment_id AND a.salon_id = seg.salon_id
     WHERE seg.salon_id = $1
       AND seg.resource_id = $2
       AND a.status <> 'cancelled'
       AND seg.end_time >= now()`,
    [salonId, targetResourceId],
  );
  const existingSegments = futureTarget.rows.map((segment) => ({
    ...segment,
    resourceId: targetResourceId,
  }));
  const conflicts = findResourceConflicts({ resource: target, existingSegments, candidateSegments });
  if (conflicts.length > 0) throw resourceConflictError(conflicts);
  return sourceRow;
}

// Active dependents that block archiving a department.
async function departmentDependents(client, salonId, departmentId) {
  const [categories, services, staff] = await Promise.all([
    countRows(
      client,
      `SELECT count(*)::int AS n FROM salon_service_categories
       WHERE salon_id = $1 AND department_id = $2 AND status = 'active'`,
      [salonId, departmentId],
    ),
    countRows(
      client,
      `SELECT count(*)::int AS n FROM salon_services s
       LEFT JOIN salon_service_categories c ON c.id = s.category_id AND c.salon_id = s.salon_id
       WHERE s.salon_id = $1 AND s.status = 'active'
         AND (s.department_id = $2 OR c.department_id = $2)`,
      [salonId, departmentId],
    ),
    // salon_staff may be absent on older databases; tolerate that.
    (async () => {
      try {
        return await countRows(
          client,
          `SELECT count(*)::int AS n FROM salon_staff
           WHERE salon_id = $1 AND status = 'active' AND department_ids ? $2`,
          [salonId, departmentId],
        );
      } catch (err) {
        if (err.code === "42P01" || err.code === "42703") return 0;
        throw err;
      }
    })(),
  ]);
  return [
    { type: "categories", count: categories },
    { type: "services", count: services },
    { type: "staff", count: staff },
  ];
}

// Active services that block archiving a category.
async function categoryDependents(client, salonId, categoryId) {
  const services = await countRows(
    client,
    `SELECT count(*)::int AS n FROM salon_services
     WHERE salon_id = $1 AND category_id = $2 AND status = 'active'`,
    [salonId, categoryId],
  );
  return [{ type: "services", count: services }];
}

// Future (non-cancelled) appointment segments that hold a resource block its
// archival/removal. Past history is never touched.
async function resourceFutureBookings(client, salonId, resourceId, nowIso) {
  try {
    return await countRows(
      client,
      `SELECT count(*)::int AS n
       FROM salon_appointment_segments seg
       JOIN salon_appointments a
         ON a.id = seg.appointment_id AND a.salon_id = seg.salon_id
       WHERE seg.salon_id = $1
         AND seg.resource_id = $2
         AND a.status <> 'cancelled'
         AND a.end_time >= $3::timestamptz`,
      [salonId, resourceId, nowIso],
    );
  } catch (err) {
    if (err.code === "42P01" || err.code === "42703") return 0;
    throw err;
  }
}

function archiveActions(body) {
  return {
    cascade: body.cascade === true,
    reassign: Boolean(body.reassignDepartmentId || body.reassignCategoryId || body.reassignResourceId),
    force: body.force === true,
  };
}

function conflictResponse(entity, blockers) {
  const message = `${entity} has active dependents; pass cascade, a reassign target, or force to proceed`;
  return {
    statusCode: 409,
    headers: CORS,
    body: JSON.stringify({
      error: message,
      blockers: blockers.filter((b) => b.count > 0),
      requiresAction: true,
    }),
  };
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
    return res(200, { departments: [], categories: [], services: [], resources: [], salonId, mock: true });
  }

  let client;
  try {
    client = await getClient();

    // Reject sessions whose backing membership was suspended/revoked (or whose
    // token predates the sessions_valid_after cutoff) before touching data.
    try {
      await enforceSessionStatus(client, salonCtx);
    } catch (err) {
      if (err instanceof SalonAuthError) return res(err.statusCode, err.message, true);
      throw err;
    }

    // Every catalog domain (departments/categories/services/resources) is
    // guarded under "services". Hydrate the membership first so database-backed
    // grants are authoritative, with legacy token roles as a fallback.
    try {
      if (method === "GET") {
        requireContextPermission(salonCtx, "services", "view", "salon");
      } else if (method === "POST") {
        requireContextPermission(salonCtx, "services", "create", "salon");
      } else if (method === "PATCH") {
        requireContextPermission(salonCtx, "services", "update", "salon");
        if (body && body.status === "archived") {
          requireContextPermission(salonCtx, "services", "archive", "salon");
        }
      }
    } catch (err) {
      if (err instanceof PermissionError) return res(err.statusCode, err.message, true);
      throw err;
    }

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
          normalizeCatalogStatus(body.status, "active"),
        ],
      );
      return res(201, { department: rowToDepartment(r.rows[0]), salonId });
    }

    if (method === "PATCH" && segments[0] === "departments" && segments[1]) {
      const id = segments[1];
      if (!(await assertOwnsRow(client, "salon_departments", salonId, id))) return res(404, "Department not found", true);
      const current = await client.query(`SELECT * FROM salon_departments WHERE salon_id = $1 AND id = $2`, [salonId, id]);
      const prev = current.rows[0];
      const nextStatus = resolveStatusForPatch(body.status, prev.status);

      if (isArchiveTransition(prev.status, nextStatus)) {
        const dependents = await departmentDependents(client, salonId, id);
        const decision = evaluateArchive(dependents, archiveActions(body));
        if (!decision.allowed) return conflictResponse("Department", dependents);

        if (body.reassignDepartmentId) {
          if (!(await assertOwnsRow(client, "salon_departments", salonId, body.reassignDepartmentId))) {
            return res(404, "Reassign department not found", true);
          }
          await client.query(
            `UPDATE salon_service_categories SET department_id = $3, updated_at = now()
             WHERE salon_id = $1 AND department_id = $2 AND status = 'active'`,
            [salonId, id, body.reassignDepartmentId],
          );
          await client.query(
            `UPDATE salon_services SET department_id = $3, updated_at = now()
             WHERE salon_id = $1 AND department_id = $2 AND status = 'active'`,
            [salonId, id, body.reassignDepartmentId],
          );
        } else if (decision.action === "cascade") {
          await client.query(
            `UPDATE salon_services SET status = 'archived', updated_at = now()
             WHERE salon_id = $1 AND status = 'active'
               AND (department_id = $2
                 OR category_id IN (
                   SELECT id FROM salon_service_categories
                   WHERE salon_id = $1 AND department_id = $2
                 ))`,
            [salonId, id],
          );
          await client.query(
            `UPDATE salon_service_categories SET status = 'archived', updated_at = now()
             WHERE salon_id = $1 AND department_id = $2 AND status = 'active'`,
            [salonId, id],
          );
        }
        // force: proceed leaving dependents untouched (historical/appointment
        // data is never modified).
      }

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
          nextStatus,
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
          normalizeCatalogStatus(body.status, "active"),
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
      const nextStatus = resolveStatusForPatch(body.status, prev.status);

      if (isArchiveTransition(prev.status, nextStatus)) {
        const dependents = await categoryDependents(client, salonId, id);
        const decision = evaluateArchive(dependents, archiveActions(body));
        if (!decision.allowed) return conflictResponse("Category", dependents);

        if (body.reassignCategoryId) {
          if (!(await assertOwnsRow(client, "salon_service_categories", salonId, body.reassignCategoryId))) {
            return res(404, "Reassign category not found", true);
          }
          await client.query(
            `UPDATE salon_services SET category_id = $3, updated_at = now()
             WHERE salon_id = $1 AND category_id = $2 AND status = 'active'`,
            [salonId, id, body.reassignCategoryId],
          );
        } else if (decision.action === "cascade") {
          await client.query(
            `UPDATE salon_services SET status = 'archived', updated_at = now()
             WHERE salon_id = $1 AND category_id = $2 AND status = 'active'`,
            [salonId, id],
          );
        }
      }

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
          nextStatus,
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
            linked_service_ids, allow_client_timing_overrides, can_overlap_during_processing,
            resource_requirements)
         VALUES (COALESCE($1, 'ssvc-' || gen_random_uuid()::text), $2, $3, $4, $5, $6, $7, $8, $9, COALESCE($10, 'active'),
                 $11::jsonb, $12::jsonb, COALESCE($13, true), COALESCE($14, true), $15::jsonb)
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
          normalizeCatalogStatus(body.status, "active"),
          jsonArray(body.defaultStages),
          jsonArray(body.linkedServiceIds),
          body.allowClientTimingOverrides !== false,
          body.canOverlapDuringProcessing !== false,
          jsonArray(body.resourceRequirements),
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
             resource_requirements = $15::jsonb,
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
          resolveStatusForPatch(body.status, prev.status),
          body.defaultStages !== undefined ? jsonArray(body.defaultStages) : JSON.stringify(prev.default_stages || []),
          body.linkedServiceIds !== undefined ? jsonArray(body.linkedServiceIds) : JSON.stringify(prev.linked_service_ids || []),
          body.allowClientTimingOverrides !== undefined ? body.allowClientTimingOverrides === true : prev.allow_client_timing_overrides,
          body.canOverlapDuringProcessing !== undefined ? body.canOverlapDuringProcessing === true : prev.can_overlap_during_processing,
          body.resourceRequirements !== undefined ? jsonArray(body.resourceRequirements) : JSON.stringify(prev.resource_requirements || []),
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

    if (method === "POST" && segments[0] === "resources") {
      if (!body.name) return res(400, "name is required", true);
      if (body.departmentId && !(await assertOwnsRow(client, "salon_departments", salonId, body.departmentId))) {
        return res(404, "Department not found", true);
      }
      const r = await client.query(
        `INSERT INTO salon_resources
           (id, salon_id, department_id, type, name, capacity, is_exclusive, holding_segment_types, sort_order, status)
         VALUES (COALESCE($1, 'sres-' || gen_random_uuid()::text), $2, $3, COALESCE($4, 'other'), $5,
                 GREATEST(COALESCE($6, 1), 1), COALESCE($7, true), $8::jsonb, COALESCE($9, 0), COALESCE($10, 'active'))
         RETURNING *`,
        [
          body.id || null,
          salonId,
          nullableText(body.departmentId) ?? null,
          nullableText(body.type) ?? "other",
          String(body.name).trim(),
          numberOr(body.capacity, 1),
          boolOr(body.isExclusive, true),
          jsonArray(body.holdingSegmentTypes),
          numberOr(body.sortOrder, 0),
          normalizeCatalogStatus(body.status, "active"),
        ],
      );
      return res(201, { resource: rowToResource(r.rows[0]), salonId });
    }

    if (method === "PATCH" && segments[0] === "resources" && segments[1]) {
      const id = segments[1];
      if (!(await assertOwnsRow(client, "salon_resources", salonId, id))) return res(404, "Resource not found", true);
      if (body.departmentId && !(await assertOwnsRow(client, "salon_departments", salonId, body.departmentId))) {
        return res(404, "Department not found", true);
      }
      const current = await client.query(`SELECT * FROM salon_resources WHERE salon_id = $1 AND id = $2`, [salonId, id]);
      let prev = current.rows[0];
      const nextStatus = resolveStatusForPatch(body.status, prev.status);
      const isArchiving = isArchiveTransition(prev.status, nextStatus);
      let archiveTransaction = false;

      try {
        if (isArchiving) {
          await client.query("BEGIN");
          archiveTransaction = true;
          // A reassignment locks both source and target in deterministic id
          // order. Archive-without-reassignment locks only the source.
          if (body.reassignResourceId) {
            prev = await reassignFutureResourceHolds(client, salonId, id, body.reassignResourceId);
          } else {
            const lockedSource = await client.query(
              `SELECT * FROM salon_resources WHERE salon_id = $1 AND id = $2 FOR UPDATE`,
              [salonId, id],
            );
            if (lockedSource.rows.length === 0) {
              const err = new Error("Resource not found");
              err.statusCode = 404;
              err.code = "NOT_FOUND";
              err.details = {};
              throw err;
            }
            prev = lockedSource.rows[0];
          }
          const future = await resourceFutureBookings(client, salonId, id, new Date().toISOString());
          const dependents = [{ type: "futureAppointments", count: future }];
          const decision = evaluateArchive(dependents, archiveActions(body));
          if (!decision.allowed) {
            await client.query("ROLLBACK");
            archiveTransaction = false;
            return conflictResponse("Resource", dependents);
          }

          if (body.reassignResourceId) {
            // Move only future (non-cancelled) segments; history stays intact.
            await client.query(
              `UPDATE salon_appointment_segments seg
               SET resource_id = $3, updated_at = now()
               FROM salon_appointments a
               WHERE seg.salon_id = $1 AND seg.resource_id = $2
                 AND a.id = seg.appointment_id AND a.salon_id = seg.salon_id
                 AND a.status <> 'cancelled' AND a.end_time >= now()`,
              [salonId, id, body.reassignResourceId],
            );
          }
          // force: proceed without touching bookings.
        }

        const r = await client.query(
          `UPDATE salon_resources
           SET department_id = $3,
               type = $4,
               name = $5,
               capacity = $6,
               is_exclusive = $7,
               holding_segment_types = $8::jsonb,
               sort_order = $9,
               status = $10,
               updated_at = now()
           WHERE salon_id = $1 AND id = $2
           RETURNING *`,
          [
            salonId,
            id,
            body.departmentId !== undefined ? nullableText(body.departmentId) : prev.department_id,
            body.type !== undefined ? nullableText(body.type) : prev.type,
            body.name !== undefined ? String(body.name).trim() : prev.name,
            body.capacity !== undefined ? Math.max(numberOr(body.capacity, prev.capacity), 1) : prev.capacity,
            body.isExclusive !== undefined ? body.isExclusive === true : prev.is_exclusive,
            body.holdingSegmentTypes !== undefined ? jsonArray(body.holdingSegmentTypes) : JSON.stringify(prev.holding_segment_types || []),
            body.sortOrder !== undefined ? numberOr(body.sortOrder, prev.sort_order) : prev.sort_order,
            nextStatus,
          ],
        );
        if (archiveTransaction) {
          await client.query("COMMIT");
          archiveTransaction = false;
        }
        return res(200, { resource: rowToResource(r.rows[0]), salonId });
      } catch (err) {
        if (archiveTransaction) await client.query("ROLLBACK").catch(() => {});
        if (err.statusCode && err.code) return res(err.statusCode, { code: err.code, message: err.message, details: err.details || {} }, true);
        throw err;
      }
    }

    return res(404, "Not found", true);
  } catch (err) {
    if (err.code === "42P01" || err.code === "42703") {
      console.warn("[crm-services] service tables missing; run migrations 033-034, 039.", err.message);
      return res(200, { departments: [], categories: [], services: [], resources: [], salonId, needsMigration: true });
    }
    console.error("[crm-services] error:", err);
    return res(500, err.message || "Internal server error", true);
  } finally {
    if (client) await client.end().catch(() => {});
  }
};

// Exported solely for DB-free transactional reassignment contract tests.
exports.reassignFutureResourceHolds = reassignFutureResourceHolds;
