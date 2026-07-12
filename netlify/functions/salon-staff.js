"use strict";

const { createClient, hasDatabaseUrl } = require("./_db");
const { resolveSalonContext, SalonAuthError } = require("./_salon-context");

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
};

const JSONB_ARRAY_FIELDS = new Set(["departmentIds", "serviceIds", "workingHours"]);
const JSONB_OBJECT_FIELDS = new Set(["servicePriceOverrides"]);
const RESPONSE_COLUMNS = [
  "id",
  "salon_id",
  "name",
  "role",
  "color",
  "avatar_url",
  "email",
  "phone",
  "department_ids",
  "service_ids",
  "service_price_overrides",
  "working_hours",
  "rating",
  "status",
  "created_at",
  "updated_at",
];

function success(statusCode, data, meta = {}) {
  return {
    statusCode,
    headers: CORS,
    body: JSON.stringify({ ok: true, data, meta }),
  };
}

function noContent() {
  return {
    statusCode: 204,
    headers: CORS,
    body: "",
  };
}

function error(statusCode, code, message, details = {}) {
  return {
    statusCode,
    headers: CORS,
    body: JSON.stringify({ ok: false, error: { code, message, details } }),
  };
}

function parsePath(event) {
  const path = event.path || "";
  const marker = "/.netlify/functions/salon-staff";
  const markerIndex = path.indexOf(marker);
  const raw = markerIndex >= 0 ? path.slice(markerIndex + marker.length) : path;
  return (raw || "/").split("/").filter(Boolean).map(decodeURIComponent);
}

function hasForbiddenSalonInput(event, body) {
  const headers = event.headers || {};
  const query = event.queryStringParameters || {};

  if (headers["x-salon-id"] !== undefined || headers["X-Salon-Id"] !== undefined || headers["X-Salon-ID"] !== undefined) {
    return true;
  }
  if (query.salon_id !== undefined || query.salonId !== undefined) {
    return true;
  }
  if (body && typeof body === "object" && !Array.isArray(body)) {
    return body.salon_id !== undefined || body.salonId !== undefined;
  }
  return false;
}

function parseJsonBody(event) {
  if (!event.body) return { body: {} };
  try {
    const parsed = JSON.parse(event.body);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { parseError: "Request body must be a JSON object" };
    }
    return { body: parsed };
  } catch {
    return { parseError: "Invalid JSON body" };
  }
}

async function getClient() {
  const client = createClient();
  await client.connect();
  return client;
}

function nullableText(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = String(value).trim();
  return trimmed.length ? trimmed : null;
}

function requiredName(value) {
  const name = nullableText(value);
  return name && name.length ? name : null;
}

function validStatus(value) {
  if (value === undefined) return undefined;
  return value === "active" || value === "inactive" ? value : null;
}

function numericRating(value) {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function normalizeJsonValue(field, value) {
  if (value === undefined) return { value: undefined };
  if (JSONB_ARRAY_FIELDS.has(field)) {
    if (!Array.isArray(value)) return { validationError: `${field} must be an array` };
    return { value: JSON.stringify(value) };
  }
  if (JSONB_OBJECT_FIELDS.has(field)) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return { validationError: `${field} must be an object` };
    }
    return { value: JSON.stringify(value) };
  }
  return { value };
}

function rowToStaff(row) {
  return {
    id: row.id,
    salonId: row.salon_id,
    name: row.name,
    role: row.role,
    color: row.color,
    avatarUrl: row.avatar_url,
    email: row.email,
    phone: row.phone,
    departmentIds: row.department_ids || [],
    serviceIds: row.service_ids || [],
    servicePriceOverrides: row.service_price_overrides || {},
    workingHours: row.working_hours || [],
    rating: row.rating === null || row.rating === undefined ? null : Number(row.rating),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function selectStaffSql() {
  return RESPONSE_COLUMNS.join(", ");
}

function buildInsert(body, salonId) {
  const name = requiredName(body.name);
  if (!name) return { validationError: "name is required" };

  const status = validStatus(body.status);
  if (body.status !== undefined && status === null) return { validationError: "status must be active or inactive" };

  const rating = numericRating(body.rating);
  if (body.rating !== undefined && rating === undefined) return { validationError: "rating must be a number" };

  const jsonFields = {};
  for (const field of [...JSONB_ARRAY_FIELDS, ...JSONB_OBJECT_FIELDS]) {
    const normalized = normalizeJsonValue(field, body[field]);
    if (normalized.validationError) return { validationError: normalized.validationError };
    jsonFields[field] = normalized.value;
  }

  return {
    columns: [
      "salon_id",
      "name",
      "role",
      "color",
      "avatar_url",
      "email",
      "phone",
      "department_ids",
      "service_ids",
      "service_price_overrides",
      "working_hours",
      "rating",
      "status",
    ],
    values: [
      salonId,
      name,
      nullableText(body.role),
      nullableText(body.color),
      nullableText(body.avatarUrl),
      nullableText(body.email),
      nullableText(body.phone),
      jsonFields.departmentIds || JSON.stringify([]),
      jsonFields.serviceIds || JSON.stringify([]),
      jsonFields.servicePriceOverrides || JSON.stringify({}),
      jsonFields.workingHours || JSON.stringify([]),
      rating === undefined ? 0 : rating,
      status || "active",
    ],
  };
}

function buildUpdate(body) {
  const fieldMap = {
    name: { column: "name", transform: requiredName },
    role: { column: "role", transform: nullableText },
    color: { column: "color", transform: nullableText },
    avatarUrl: { column: "avatar_url", transform: nullableText },
    email: { column: "email", transform: nullableText },
    phone: { column: "phone", transform: nullableText },
    rating: { column: "rating", transform: numericRating },
    status: { column: "status", transform: validStatus },
  };

  const sets = [];
  const values = [];
  const details = {};

  for (const [field, config] of Object.entries(fieldMap)) {
    if (body[field] === undefined) continue;
    const value = config.transform(body[field]);
    if (field === "name" && !value) details[field] = "name cannot be empty";
    if (field === "rating" && value === undefined) details[field] = "rating must be a number";
    if (field === "status" && value === null) details[field] = "status must be active or inactive";
    if (details[field]) continue;
    values.push(value);
    sets.push(`${config.column} = $${values.length}`);
  }

  for (const field of [...JSONB_ARRAY_FIELDS, ...JSONB_OBJECT_FIELDS]) {
    if (body[field] === undefined) continue;
    const normalized = normalizeJsonValue(field, body[field]);
    if (normalized.validationError) {
      details[field] = normalized.validationError;
      continue;
    }
    const column = field.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    values.push(normalized.value);
    sets.push(`${column} = $${values.length}::jsonb`);
  }

  if (Object.keys(details).length) return { validationError: "Invalid staff fields", details };
  if (!sets.length) return { validationError: "No fields to update" };

  values.push(new Date());
  sets.push(`updated_at = $${values.length}`);

  return { sets, values };
}

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") return success(200, {}, {});

  const method = event.httpMethod;
  const segments = parsePath(event);
  const { body, parseError } = parseJsonBody(event);

  if (parseError) return error(400, "VALIDATION_ERROR", parseError);
  if (hasForbiddenSalonInput(event, body)) {
    return error(400, "VALIDATION_ERROR", "salonId is resolved by the server and must not be sent by the client");
  }

  let salonCtx;
  try {
    salonCtx = resolveSalonContext(event);
  } catch (err) {
    if (err instanceof SalonAuthError) return error(err.statusCode, "UNAUTHORIZED", err.message);
    return error(401, "UNAUTHORIZED", "Unauthorized");
  }
  const salonId = salonCtx.salonId;

  if (!hasDatabaseUrl()) {
    return error(500, "DATABASE_NOT_CONFIGURED", "Database is not configured");
  }

  let client;
  try {
    client = await getClient();

    if (method === "GET" && segments.length === 0) {
      const status = event.queryStringParameters?.status;
      const params = [salonId];
      let where = "salon_id = $1";
      if (status === "active" || status === "inactive") {
        params.push(status);
        where += ` AND status = $${params.length}`;
      } else if (status !== "all") {
        where += " AND status <> 'inactive'";
      }

      const result = await client.query(
        `SELECT ${selectStaffSql()}
         FROM salon_staff
         WHERE ${where}
         ORDER BY name ASC, created_at ASC`,
        params,
      );

      return success(200, { staff: result.rows.map(rowToStaff) }, { count: result.rows.length, status: status || "active" });
    }

    if (method === "POST" && segments.length === 0) {
      const insert = buildInsert(body, salonId);
      if (insert.validationError) return error(400, "VALIDATION_ERROR", insert.validationError, insert.details || {});

      const placeholders = insert.values.map((_, index) => {
        const cast = ["department_ids", "service_ids", "service_price_overrides", "working_hours"].includes(insert.columns[index]) ? "::jsonb" : "";
        return `$${index + 1}${cast}`;
      });

      const result = await client.query(
        `INSERT INTO salon_staff (${insert.columns.join(", ")})
         VALUES (${placeholders.join(", ")})
         RETURNING ${selectStaffSql()}`,
        insert.values,
      );

      return success(201, { staff: rowToStaff(result.rows[0]) });
    }

    if (method === "PATCH" && segments.length === 1) {
      const update = buildUpdate(body);
      if (update.validationError) return error(400, "VALIDATION_ERROR", update.validationError, update.details || {});

      update.values.push(segments[0], salonId);
      const idIndex = update.values.length - 1;
      const salonIndex = update.values.length;

      const result = await client.query(
        `UPDATE salon_staff
         SET ${update.sets.join(", ")}
         WHERE id = $${idIndex} AND salon_id = $${salonIndex}
         RETURNING ${selectStaffSql()}`,
        update.values,
      );

      if (result.rows.length === 0) return error(404, "NOT_FOUND", "Staff member not found");
      return success(200, { staff: rowToStaff(result.rows[0]) });
    }

    if (method === "DELETE" && segments.length === 1) {
      const result = await client.query(
        `UPDATE salon_staff
         SET status = 'inactive', updated_at = now()
         WHERE id = $1 AND salon_id = $2
         RETURNING id`,
        [segments[0], salonId],
      );

      if (result.rows.length === 0) return error(404, "NOT_FOUND", "Staff member not found");
      return noContent();
    }

    return error(404, "NOT_FOUND", "Not found");
  } catch (err) {
    if (err.code === "42P01") {
      return error(500, "SCHEMA_NOT_READY", "salon_staff table is not available");
    }
    if (err.code === "42703") {
      return error(500, "SCHEMA_NOT_READY", "salon_staff schema is missing required columns");
    }
    console.error("[salon-staff] error:", err.message);
    return error(500, "INTERNAL_ERROR", "Internal server error");
  } finally {
    if (client) await client.end().catch(() => {});
  }
};
