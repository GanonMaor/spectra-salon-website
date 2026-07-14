"use strict";

const { createClient, hasDatabaseUrl } = require("./_db");
const {
  resolveSalonContext,
  SalonAuthError,
  PermissionError,
  requireContextPermission,
  enforceSessionStatus,
} = require("./_salon-context");
const { segmentHoldsResource, findResourceConflicts } = require("./lib/resource-enforcement");

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
};

const APPOINTMENT_STATUSES = new Set(["confirmed", "in-progress", "completed", "cancelled", "no-show"]);

function success(statusCode, data, meta = {}) {
  return {
    statusCode,
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

function parsePath(event) {
  const raw = (event.path || "").replace(/^\/.netlify\/functions\/salon-appointments\/?/, "/") || "/";
  return raw.split("/").filter(Boolean).map(decodeURIComponent);
}

function parseJsonBody(event) {
  if (!event.body) return {};
  try {
    return JSON.parse(event.body);
  } catch {
    throw validationError("Malformed JSON body");
  }
}

function validationError(message, details = {}) {
  const err = new Error(message);
  err.statusCode = 400;
  err.code = "VALIDATION_ERROR";
  err.details = details;
  return err;
}

function notFoundError(message) {
  const err = new Error(message);
  err.statusCode = 404;
  err.code = "NOT_FOUND";
  err.details = {};
  return err;
}

function hasForbiddenHeader(headers = {}) {
  return Object.keys(headers).some((key) => key.toLowerCase() === "x-salon-id");
}

function containsForbiddenTenantField(value) {
  if (!value || typeof value !== "object") return false;
  if (Array.isArray(value)) return value.some(containsForbiddenTenantField);
  return Object.entries(value).some(([key, child]) => (
    key === "salonId" || key === "salon_id" || containsForbiddenTenantField(child)
  ));
}

function requireString(body, key) {
  const value = body[key];
  if (typeof value !== "string" || value.trim() === "") {
    throw validationError(`${key} is required`);
  }
  return value.trim();
}

function optionalString(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return String(value);
}

function optionalTrimmedString(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return String(value).trim();
}

function requiredTimestamp(body, key) {
  const value = body[key];
  if (typeof value !== "string" || value.trim() === "") {
    throw validationError(`${key} is required`);
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw validationError(`${key} must be a valid timestamp`);
  }
  return value;
}

function requiredTimestampValue(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    throw validationError(`${label} is required`);
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw validationError(`${label} must be a valid timestamp`);
  }
  return value;
}

function optionalTimestamp(value, key) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const date = new Date(value);
  if (typeof value !== "string" || value.trim() === "" || Number.isNaN(date.getTime())) {
    throw validationError(`${key} must be a valid timestamp`);
  }
  return value;
}

function numberOrNull(value, key) {
  if (value === undefined || value === null || value === "") return null;
  const number = Number(value);
  if (!Number.isFinite(number)) throw validationError(`${key} must be a number`);
  return number;
}

function integerOr(value, fallback, key) {
  if (value === undefined || value === null || value === "") return fallback;
  const number = Number(value);
  if (!Number.isInteger(number)) throw validationError(`${key} must be an integer`);
  return number;
}

function statusOr(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  if (!APPOINTMENT_STATUSES.has(value)) {
    throw validationError("status is invalid", { allowed: Array.from(APPOINTMENT_STATUSES) });
  }
  return value;
}

async function getClient() {
  const client = createClient();
  await client.connect();
  return client;
}

async function assertOwnsRow(client, table, salonId, id, label) {
  if (!id) return;
  const result = await client.query(`SELECT id FROM ${table} WHERE salon_id = $1 AND id = $2 LIMIT 1`, [salonId, id]);
  if (result.rows.length === 0) throw notFoundError(`${label} not found`);
}

async function validateAppointmentRefs(client, salonId, appointment) {
  await assertOwnsRow(client, "salon_customers", salonId, appointment.customerId, "Customer");
  await assertOwnsRow(client, "salon_staff", salonId, appointment.staffMemberId, "Staff member");
  await assertOwnsRow(client, "salon_services", salonId, appointment.serviceId, "Service");
}

async function validateSegmentRefs(client, salonId, segments) {
  for (const segment of segments) {
    await assertOwnsRow(client, "salon_staff", salonId, segment.staffMemberId, "Staff member");
    await assertOwnsRow(client, "salon_services", salonId, segment.serviceId, "Service");
  }
}

function resourceConflictError(conflicts) {
  const err = new Error("Resource is fully booked for the requested time");
  err.statusCode = 409;
  err.code = "RESOURCE_CONFLICT";
  err.details = { conflicts };
  return err;
}

/**
 * Enforce capacity/exclusivity for segments that reference a PERSISTED
 * resource (salon_resources). Segments whose resource_id does not match a
 * persisted resource are ignored, so legacy free-text resource ids and
 * databases without migration 039 keep their existing behavior.
 *
 * @param {string|null} excludeAppointmentId appointment being edited (its own
 *   segments are excluded from the "existing" set to avoid self-conflicts).
 */
async function enforceResourceCapacity(client, salonId, segments, excludeAppointmentId) {
  const resourceIds = Array.from(
    new Set((segments || []).map((s) => s.resourceId).filter((id) => id)),
  );
  if (resourceIds.length === 0) return;

  let resources;
  try {
    resources = await client.query(
      // Lock persisted resource rows in a deterministic order before reading
      // competing segments. The lock is held by the caller's write transaction,
      // serializing overlapping create/update attempts for the same resource.
      `SELECT *
       FROM salon_resources
       WHERE salon_id = $1 AND id = ANY($2)
       ORDER BY id ASC
       FOR UPDATE`,
      [salonId, resourceIds],
    );
  } catch (err) {
    // salon_resources absent (migration 039 not applied): skip enforcement.
    if (err.code === "42P01" || err.code === "42703") return;
    throw err;
  }

  for (const row of resources.rows) {
    const resource = {
      id: row.id,
      capacity: row.capacity === null || row.capacity === undefined ? 1 : Number(row.capacity),
      isExclusive: row.is_exclusive !== false,
      holdingSegmentTypes: row.holding_segment_types || [],
    };

    const candidateSegments = (segments || []).filter((s) => segmentHoldsResource(s, resource));
    if (candidateSegments.length === 0) continue;

    // Only pull existing holds that could overlap the candidate window.
    const starts = candidateSegments.map((s) => new Date(s.startTime).getTime());
    const ends = candidateSegments.map((s) => new Date(s.endTime).getTime());
    const windowStart = new Date(Math.min(...starts)).toISOString();
    const windowEnd = new Date(Math.max(...ends)).toISOString();

    const params = [salonId, resource.id, windowStart, windowEnd];
    let excludeClause = "";
    if (excludeAppointmentId) {
      params.push(excludeAppointmentId);
      excludeClause = `AND seg.appointment_id <> $${params.length}`;
    }

    const existing = await client.query(
      `SELECT seg.resource_id, seg.segment_type, seg.start_time AS "startTime", seg.end_time AS "endTime"
       FROM salon_appointment_segments seg
       JOIN salon_appointments a
         ON a.id = seg.appointment_id AND a.salon_id = seg.salon_id
       WHERE seg.salon_id = $1
         AND seg.resource_id = $2
         AND a.status <> 'cancelled'
         AND seg.start_time < $4::timestamptz
         AND seg.end_time > $3::timestamptz
         ${excludeClause}`,
      params,
    );

    const conflicts = findResourceConflicts({
      resource,
      existingSegments: existing.rows,
      candidateSegments,
    });
    if (conflicts.length > 0) throw resourceConflictError(conflicts);
  }
}

function normalizeSegments(value) {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) throw validationError("segments must be an array");
  return value.map((segment, index) => ({
    id: optionalTrimmedString(segment.id) || null,
    staffMemberId: optionalTrimmedString(segment.staffMemberId) || null,
    resourceId: optionalTrimmedString(segment.resourceId) || null,
    serviceId: optionalTrimmedString(segment.serviceId) || null,
    serviceName: optionalString(segment.serviceName) ?? null,
    serviceCategoryId: optionalTrimmedString(segment.serviceCategoryId) || null,
    segmentType: optionalTrimmedString(segment.segmentType) || "service",
    label: optionalString(segment.label) ?? "",
    startTime: requiredTimestampValue(segment.startTime, `segments[${index}].startTime`),
    endTime: requiredTimestampValue(segment.endTime, `segments[${index}].endTime`),
    sortOrder: integerOr(segment.sortOrder, index, `segments[${index}].sortOrder`),
    productGrams: numberOrNull(segment.productGrams, `segments[${index}].productGrams`),
    notes: optionalString(segment.notes) ?? null,
  }));
}

function normalizeCreateBody(body) {
  return {
    id: optionalTrimmedString(body.id) || null,
    staffMemberId: optionalTrimmedString(body.staffMemberId) || null,
    customerId: optionalTrimmedString(body.customerId) || null,
    customerName: requireString(body, "customerName"),
    serviceId: optionalTrimmedString(body.serviceId) || null,
    serviceName: requireString(body, "serviceName"),
    serviceCategoryId: optionalTrimmedString(body.serviceCategoryId) || null,
    startTime: requiredTimestamp(body, "startTime"),
    endTime: requiredTimestamp(body, "endTime"),
    status: statusOr(body.status, "confirmed"),
    notes: optionalString(body.notes) ?? null,
    groupId: optionalTrimmedString(body.groupId) || null,
    segments: normalizeSegments(body.segments || []),
  };
}

function normalizePatchBody(body) {
  const patch = {};
  const stringFields = ["staffMemberId", "customerId", "serviceId", "serviceCategoryId", "groupId"];
  for (const field of stringFields) {
    if (body[field] !== undefined) patch[field] = optionalTrimmedString(body[field]) || null;
  }
  if (body.customerName !== undefined) patch.customerName = requireString(body, "customerName");
  if (body.serviceName !== undefined) patch.serviceName = requireString(body, "serviceName");
  if (body.startTime !== undefined) patch.startTime = optionalTimestamp(body.startTime, "startTime");
  if (body.endTime !== undefined) patch.endTime = optionalTimestamp(body.endTime, "endTime");
  if (body.status !== undefined) patch.status = statusOr(body.status, undefined);
  if (body.notes !== undefined) patch.notes = optionalString(body.notes);
  if (body.segments !== undefined) patch.segments = normalizeSegments(body.segments);
  return patch;
}

function rowToSegment(row) {
  return {
    id: row.id,
    salonId: row.salon_id,
    appointmentId: row.appointment_id,
    staffMemberId: row.staff_member_id,
    resourceId: row.resource_id,
    serviceId: row.service_id,
    serviceName: row.service_name,
    serviceCategoryId: row.service_category_id,
    segmentType: row.segment_type,
    label: row.label,
    startTime: row.start_time,
    endTime: row.end_time,
    sortOrder: row.sort_order,
    productGrams: row.product_grams === null ? null : Number(row.product_grams),
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToAppointment(row, segments = []) {
  return {
    id: row.id,
    salonId: row.salon_id,
    staffMemberId: row.staff_member_id,
    customerId: row.customer_id,
    customerName: row.customer_name,
    serviceId: row.service_id,
    serviceName: row.service_name,
    serviceCategoryId: row.service_category_id,
    startTime: row.start_time,
    endTime: row.end_time,
    status: row.status,
    notes: row.notes,
    groupId: row.group_id,
    segments,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function insertSegments(client, salonId, appointmentId, segments) {
  const inserted = [];
  for (const segment of segments) {
    const result = await client.query(
      `INSERT INTO salon_appointment_segments
         (id, salon_id, appointment_id, staff_member_id, resource_id, service_id, service_name,
          service_category_id, segment_type, label, start_time, end_time, sort_order, product_grams, notes)
       VALUES (COALESCE($1, 'sseg-' || gen_random_uuid()::text), $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING *`,
      [
        segment.id,
        salonId,
        appointmentId,
        segment.staffMemberId,
        segment.resourceId,
        segment.serviceId,
        segment.serviceName,
        segment.serviceCategoryId,
        segment.segmentType,
        segment.label,
        segment.startTime,
        segment.endTime,
        segment.sortOrder,
        segment.productGrams,
        segment.notes,
      ],
    );
    inserted.push(result.rows[0]);
  }
  return inserted;
}

async function loadAppointment(client, salonId, appointmentId) {
  const appointment = await client.query(
    `SELECT * FROM salon_appointments WHERE salon_id = $1 AND id = $2 LIMIT 1`,
    [salonId, appointmentId],
  );
  if (appointment.rows.length === 0) throw notFoundError("Appointment not found");

  const segments = await client.query(
    `SELECT * FROM salon_appointment_segments
     WHERE salon_id = $1 AND appointment_id = $2
     ORDER BY sort_order ASC, start_time ASC, id ASC`,
    [salonId, appointmentId],
  );
  return rowToAppointment(appointment.rows[0], segments.rows.map(rowToSegment));
}

async function listAppointments(client, salonId, query) {
  const params = [salonId];
  const conditions = ["a.salon_id = $1"];

  if (query.from) {
    params.push(query.from);
    conditions.push(`a.start_time >= $${params.length}::timestamptz`);
  }
  if (query.to) {
    params.push(query.to);
    conditions.push(`a.start_time <= $${params.length}::timestamptz`);
  }
  if (query.staffMemberId) {
    params.push(query.staffMemberId);
    conditions.push(`a.staff_member_id = $${params.length}`);
  }

  const result = await client.query(
    `SELECT
       a.*,
       COALESCE(
         json_agg(to_jsonb(s) ORDER BY s.sort_order ASC, s.start_time ASC, s.id ASC)
           FILTER (WHERE s.id IS NOT NULL),
         '[]'
       ) AS segments
     FROM salon_appointments a
     LEFT JOIN salon_appointment_segments s
       ON s.appointment_id = a.id AND s.salon_id = a.salon_id
     WHERE ${conditions.join(" AND ")}
     GROUP BY a.id
     ORDER BY a.start_time ASC, a.created_at ASC`,
    params,
  );

  return result.rows.map((row) => rowToAppointment(row, (row.segments || []).map(rowToSegment)));
}

async function createAppointment(client, salonId, body) {
  const appointment = normalizeCreateBody(body);
  await validateAppointmentRefs(client, salonId, appointment);
  await validateSegmentRefs(client, salonId, appointment.segments);

  await client.query("BEGIN");
  try {
    // Capacity check must be inside this transaction: enforceResourceCapacity
    // locks each persisted resource row, preventing concurrent writers from
    // both observing an available slot and overbooking it.
    await enforceResourceCapacity(client, salonId, appointment.segments, null);
    const result = await client.query(
      `INSERT INTO salon_appointments
         (id, salon_id, staff_member_id, customer_id, customer_name, service_id, service_name,
          service_category_id, start_time, end_time, status, notes, group_id)
       VALUES (COALESCE($1, 'sappt-' || gen_random_uuid()::text), $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        appointment.id,
        salonId,
        appointment.staffMemberId,
        appointment.customerId,
        appointment.customerName,
        appointment.serviceId,
        appointment.serviceName,
        appointment.serviceCategoryId,
        appointment.startTime,
        appointment.endTime,
        appointment.status,
        appointment.notes,
        appointment.groupId,
      ],
    );
    const segments = await insertSegments(client, salonId, result.rows[0].id, appointment.segments);
    await client.query("COMMIT");
    return rowToAppointment(result.rows[0], segments.map(rowToSegment));
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  }
}

async function updateAppointment(client, salonId, appointmentId, body) {
  const patch = normalizePatchBody(body);
  const hasAppointmentFields = Object.keys(patch).some((key) => key !== "segments");
  if (!hasAppointmentFields && patch.segments === undefined) {
    throw validationError("No fields to update");
  }

  await client.query("BEGIN");
  try {
    const existing = await client.query(
      `SELECT * FROM salon_appointments WHERE salon_id = $1 AND id = $2 LIMIT 1`,
      [salonId, appointmentId],
    );
    if (existing.rows.length === 0) throw notFoundError("Appointment not found");

    await validateAppointmentRefs(client, salonId, patch);
    if (patch.segments !== undefined) {
      await validateSegmentRefs(client, salonId, patch.segments);
      await enforceResourceCapacity(client, salonId, patch.segments, appointmentId);
    }

    if (hasAppointmentFields) {
      const columns = {
        staffMemberId: "staff_member_id",
        customerId: "customer_id",
        customerName: "customer_name",
        serviceId: "service_id",
        serviceName: "service_name",
        serviceCategoryId: "service_category_id",
        startTime: "start_time",
        endTime: "end_time",
        status: "status",
        notes: "notes",
        groupId: "group_id",
      };
      const sets = [];
      const params = [salonId, appointmentId];
      for (const [field, column] of Object.entries(columns)) {
        if (patch[field] !== undefined) {
          params.push(patch[field]);
          sets.push(`${column} = $${params.length}`);
        }
      }
      sets.push("updated_at = now()");
      await client.query(
        `UPDATE salon_appointments
         SET ${sets.join(", ")}
         WHERE salon_id = $1 AND id = $2`,
        params,
      );
    } else {
      await client.query(
        `UPDATE salon_appointments SET updated_at = now() WHERE salon_id = $1 AND id = $2`,
        [salonId, appointmentId],
      );
    }

    if (patch.segments !== undefined) {
      await client.query(
        `DELETE FROM salon_appointment_segments WHERE salon_id = $1 AND appointment_id = $2`,
        [salonId, appointmentId],
      );
      await insertSegments(client, salonId, appointmentId, patch.segments);
    }

    await client.query("COMMIT");
    return loadAppointment(client, salonId, appointmentId);
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  }
}

async function cancelAppointment(client, salonId, appointmentId) {
  const result = await client.query(
    `UPDATE salon_appointments
     SET status = 'cancelled', updated_at = now()
     WHERE salon_id = $1 AND id = $2
     RETURNING *`,
    [salonId, appointmentId],
  );
  if (result.rows.length === 0) throw notFoundError("Appointment not found");
  return loadAppointment(client, salonId, appointmentId);
}

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") return success(200, {});

  if (hasForbiddenHeader(event.headers)) {
    return failure(400, "VALIDATION_ERROR", "x-salon-id is not accepted");
  }

  let body = {};
  try {
    body = parseJsonBody(event);
  } catch (err) {
    return failure(400, "VALIDATION_ERROR", err.message, err.details || {});
  }

  if (containsForbiddenTenantField(body)) {
    return failure(400, "VALIDATION_ERROR", "salonId and salon_id are not accepted");
  }

  let salonCtx;
  try {
    salonCtx = resolveSalonContext(event);
  } catch (err) {
    if (err instanceof SalonAuthError) return failure(err.statusCode, "AUTH_ERROR", err.message);
    return failure(401, "AUTH_ERROR", "Unauthorized");
  }

  if (!hasDatabaseUrl()) {
    return failure(503, "DATABASE_UNAVAILABLE", "Database is not configured");
  }

  const method = event.httpMethod;
  const pathSegments = parsePath(event);
  const salonId = salonCtx.salonId;
  let client;

  try {
    client = await getClient();

    // Hydrate the membership before authorization so suspended/revoked users
    // and stale tokens are rejected, and persisted access-role grants override
    // any legacy role included in the signed token.
    try {
      await enforceSessionStatus(client, salonCtx);
      const appointmentAction = {
        GET: "view",
        POST: "create",
        PATCH: "update",
        // Cancellation is a destructive lifecycle action, not a generic edit.
        DELETE: "archive",
      }[method];
      if (appointmentAction) {
        requireContextPermission(salonCtx, "appointments", appointmentAction, "salon");
      }
    } catch (err) {
      if (err instanceof SalonAuthError || err instanceof PermissionError) {
        return failure(err.statusCode, err.code || "AUTH_ERROR", err.message);
      }
      throw err;
    }

    if (method === "GET" && pathSegments.length === 0) {
      const appointments = await listAppointments(client, salonId, event.queryStringParameters || {});
      return success(200, { appointments }, { count: appointments.length });
    }

    if (method === "POST" && pathSegments.length === 0) {
      const appointment = await createAppointment(client, salonId, body);
      return success(201, { appointment });
    }

    if (method === "PATCH" && pathSegments.length === 1) {
      const appointment = await updateAppointment(client, salonId, pathSegments[0], body);
      return success(200, { appointment });
    }

    if (method === "DELETE" && pathSegments.length === 1) {
      const appointment = await cancelAppointment(client, salonId, pathSegments[0]);
      return success(200, { appointment, cancelled: true });
    }

    return failure(404, "NOT_FOUND", "Not found");
  } catch (err) {
    if (err.statusCode && err.code) {
      return failure(err.statusCode, err.code, err.message, err.details || {});
    }
    if (err.code === "42P01" || err.code === "42703") {
      return failure(503, "SCHEMA_UNAVAILABLE", "Appointments schema is not available");
    }
    console.error("[salon-appointments] error:", err.message);
    return failure(500, "INTERNAL_ERROR", "Internal server error");
  } finally {
    if (client) await client.end().catch(() => {});
  }
};

// Exported for DB-free locking-contract tests. The handler remains the public
// API; callers must invoke this only within their write transaction.
exports.enforceResourceCapacity = enforceResourceCapacity;
