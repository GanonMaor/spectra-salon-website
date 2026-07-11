"use strict";

const { Client } = require("pg");
const { resolveSalonContext, SalonAuthError } = require("./_salon-context");

const DATABASE_URL = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
};

const CUSTOMER_STATUSES = new Set(["active", "inactive", "archived"]);
const CLIENT_SALON_ID_FIELDS = ["salon_id", "salonId"];

function success(statusCode, data = null, meta = {}) {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify({ ok: true, data, meta }),
  };
}

function noContent() {
  return {
    statusCode: 204,
    headers: CORS_HEADERS,
    body: "",
  };
}

function error(statusCode, code, message, details = {}) {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      ok: false,
      error: { code, message, details },
    }),
  };
}

function parsePath(event) {
  const rawPath = (event.path || "").split("?")[0];
  const relativePath = rawPath.replace(/^\/\.netlify\/functions\/salon-customers\/?/, "") || "/";
  return relativePath.split("/").filter(Boolean).map((segment) => decodeURIComponent(segment));
}

function parseJsonBody(event) {
  if (!event.body) return {};

  try {
    const body = JSON.parse(event.body);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw Object.assign(new Error("JSON body must be an object"), {
        statusCode: 400,
        code: "VALIDATION_ERROR",
        details: { body: "Request body must be a JSON object." },
      });
    }
    return body;
  } catch (err) {
    if (err.statusCode) throw err;
    throw Object.assign(new Error("Malformed JSON body"), {
      statusCode: 400,
      code: "VALIDATION_ERROR",
      details: { body: "Request body must be valid JSON." },
    });
  }
}

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object || {}, key);
}

function hasHeader(headers, name) {
  const normalizedName = name.toLowerCase();
  return Object.keys(headers || {}).some((key) => key.toLowerCase() === normalizedName);
}

function rejectClientSalonIds(event, body) {
  const headers = event.headers || {};
  const query = event.queryStringParameters || {};

  if (hasHeader(headers, "x-salon-id")) {
    return error(400, "VALIDATION_ERROR", "salonId is resolved by the server.", { field: "x-salon-id" });
  }

  for (const field of CLIENT_SALON_ID_FIELDS) {
    if (hasOwn(query, field)) {
      return error(400, "VALIDATION_ERROR", "salonId is resolved by the server.", { field });
    }
    if (hasOwn(body, field)) {
      return error(400, "VALIDATION_ERROR", "salonId is resolved by the server.", { field });
    }
  }

  return null;
}

async function getClient() {
  if (!DATABASE_URL) {
    throw Object.assign(new Error("Database connection is not configured"), {
      statusCode: 500,
      code: "CONFIGURATION_ERROR",
    });
  }

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  return client;
}

function mapCustomer(row) {
  return {
    id: row.id,
    salonId: row.salon_id,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    email: row.email,
    notes: row.notes,
    tags: Array.isArray(row.tags) ? row.tags : [],
    avatarUrl: row.avatar_url,
    isVip: row.is_vip,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeOptionalString(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeRequiredString(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeTags(value) {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) return null;
  const tags = [];

  for (const item of value) {
    if (typeof item !== "string") return null;
    const trimmed = item.trim();
    if (trimmed) tags.push(trimmed);
  }

  return tags;
}

function normalizeBoolean(value) {
  if (value === undefined) return undefined;
  return typeof value === "boolean" ? value : null;
}

function normalizeStatus(value) {
  if (value === undefined) return undefined;
  return typeof value === "string" && CUSTOMER_STATUSES.has(value) ? value : null;
}

function buildCreateInput(body) {
  const firstName = normalizeRequiredString(body.firstName);
  if (!firstName) {
    return { error: error(400, "VALIDATION_ERROR", "firstName is required.", { field: "firstName" }) };
  }

  for (const field of ["lastName", "phone", "email", "notes", "avatarUrl"]) {
    if (hasOwn(body, field) && body[field] !== null && typeof body[field] !== "string") {
      return { error: error(400, "VALIDATION_ERROR", `${field} must be a string or null.`, { field }) };
    }
  }

  const tags = normalizeTags(body.tags);
  if (tags === null) {
    return { error: error(400, "VALIDATION_ERROR", "tags must be an array of strings.", { field: "tags" }) };
  }

  const isVip = normalizeBoolean(body.isVip);
  if (isVip === null) {
    return { error: error(400, "VALIDATION_ERROR", "isVip must be a boolean.", { field: "isVip" }) };
  }

  const status = normalizeStatus(body.status);
  if (status === null) {
    return { error: error(400, "VALIDATION_ERROR", "status must be active, inactive, or archived.", { field: "status" }) };
  }

  return {
    input: {
      firstName,
      lastName: normalizeOptionalString(body.lastName),
      phone: normalizeOptionalString(body.phone),
      email: normalizeOptionalString(body.email),
      notes: normalizeOptionalString(body.notes),
      tags: tags === undefined ? [] : tags,
      avatarUrl: normalizeOptionalString(body.avatarUrl),
      isVip: isVip === undefined ? false : isVip,
      status: status === undefined ? "active" : status,
    },
  };
}

function buildPatchInput(body) {
  const fields = [];
  const values = [];

  const stringFields = [
    ["firstName", "first_name", normalizeRequiredString],
    ["lastName", "last_name", normalizeOptionalString],
    ["phone", "phone", normalizeOptionalString],
    ["email", "email", normalizeOptionalString],
    ["notes", "notes", normalizeOptionalString],
    ["avatarUrl", "avatar_url", normalizeOptionalString],
  ];

  for (const [apiField, dbField, normalizer] of stringFields) {
    if (!hasOwn(body, apiField)) continue;
    const value = normalizer(body[apiField]);
    if (value === null && apiField === "firstName") {
      return { error: error(400, "VALIDATION_ERROR", "firstName cannot be empty.", { field: apiField }) };
    }
    if (value === null && body[apiField] !== null && typeof body[apiField] !== "string") {
      return { error: error(400, "VALIDATION_ERROR", `${apiField} must be a string or null.`, { field: apiField }) };
    }
    values.push(value);
    fields.push(`${dbField} = $${values.length}`);
  }

  if (hasOwn(body, "tags")) {
    const tags = normalizeTags(body.tags);
    if (tags === null) {
      return { error: error(400, "VALIDATION_ERROR", "tags must be an array of strings.", { field: "tags" }) };
    }
    values.push(JSON.stringify(tags));
    fields.push(`tags = $${values.length}::jsonb`);
  }

  if (hasOwn(body, "isVip")) {
    const isVip = normalizeBoolean(body.isVip);
    if (isVip === null) {
      return { error: error(400, "VALIDATION_ERROR", "isVip must be a boolean.", { field: "isVip" }) };
    }
    values.push(isVip);
    fields.push(`is_vip = $${values.length}`);
  }

  if (hasOwn(body, "status")) {
    const status = normalizeStatus(body.status);
    if (status === null) {
      return { error: error(400, "VALIDATION_ERROR", "status must be active, inactive, or archived.", { field: "status" }) };
    }
    values.push(status);
    fields.push(`status = $${values.length}`);
  }

  if (fields.length === 0) {
    return { error: error(400, "VALIDATION_ERROR", "At least one customer field is required.", { fields: ["firstName", "lastName", "phone", "email", "notes", "tags", "avatarUrl", "isVip", "status"] }) };
  }

  fields.push("updated_at = now()");
  return { fields, values };
}

function getPagination(query) {
  const rawLimit = Number.parseInt(query.limit || "50", 10);
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 200) : 50;
  const rawPage = Number.parseInt(query.page || "1", 10);
  const page = Number.isFinite(rawPage) ? Math.max(rawPage, 1) : 1;
  const rawOffset = Number.parseInt(query.offset || "", 10);
  const offset = Number.isFinite(rawOffset) && rawOffset >= 0 ? rawOffset : (page - 1) * limit;

  return { limit, offset, page };
}

async function listCustomers(client, salonId, query) {
  const params = [salonId];
  const where = ["salon_id = $1"];

  if (query.status && query.status !== "all") {
    if (!CUSTOMER_STATUSES.has(query.status)) {
      return { error: error(400, "VALIDATION_ERROR", "status must be active, inactive, archived, or all.", { field: "status" }) };
    }
    params.push(query.status);
    where.push(`status = $${params.length}`);
  } else if (!query.status) {
    where.push("status <> 'archived'");
  }

  const search = (query.search || query.q || "").trim().toLowerCase();
  if (search) {
    params.push(`%${search}%`);
    where.push(`(
      LOWER(first_name || ' ' || COALESCE(last_name, '')) LIKE $${params.length}
      OR LOWER(COALESCE(phone, '')) LIKE $${params.length}
      OR LOWER(COALESCE(email, '')) LIKE $${params.length}
    )`);
  }

  if (query.tag) {
    params.push(JSON.stringify([query.tag]));
    where.push(`tags @> $${params.length}::jsonb`);
  }

  const { limit, offset, page } = getPagination(query);
  const whereSql = where.join(" AND ");
  const listParams = [...params, limit, offset];

  const [rows, count] = await Promise.all([
    client.query(
      `SELECT id, salon_id, first_name, last_name, phone, email, notes, tags, avatar_url, is_vip, status, created_at, updated_at
       FROM salon_customers
       WHERE ${whereSql}
       ORDER BY first_name ASC, last_name ASC NULLS LAST, created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      listParams,
    ),
    client.query(
      `SELECT COUNT(*)::int AS total
       FROM salon_customers
       WHERE ${whereSql}`,
      params,
    ),
  ]);

  return {
    response: success(200, { customers: rows.rows.map(mapCustomer) }, {
      salonId,
      total: count.rows[0]?.total || 0,
      limit,
      offset,
      page,
    }),
  };
}

async function getCustomer(client, salonId, id) {
  const result = await client.query(
    `SELECT id, salon_id, first_name, last_name, phone, email, notes, tags, avatar_url, is_vip, status, created_at, updated_at
     FROM salon_customers
     WHERE id = $1 AND salon_id = $2`,
    [id, salonId],
  );

  if (result.rows.length === 0) {
    return error(404, "NOT_FOUND", "Customer not found.", { id });
  }

  return success(200, { customer: mapCustomer(result.rows[0]) }, { salonId });
}

async function createCustomer(client, salonId, body) {
  const { input, error: validationError } = buildCreateInput(body);
  if (validationError) return validationError;

  const result = await client.query(
    `INSERT INTO salon_customers
       (salon_id, first_name, last_name, phone, email, notes, tags, avatar_url, is_vip, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10)
     RETURNING id, salon_id, first_name, last_name, phone, email, notes, tags, avatar_url, is_vip, status, created_at, updated_at`,
    [
      salonId,
      input.firstName,
      input.lastName,
      input.phone,
      input.email,
      input.notes,
      JSON.stringify(input.tags),
      input.avatarUrl,
      input.isVip,
      input.status,
    ],
  );

  return success(201, { customer: mapCustomer(result.rows[0]) }, { salonId });
}

async function updateCustomer(client, salonId, id, body) {
  const { fields, values, error: validationError } = buildPatchInput(body);
  if (validationError) return validationError;

  values.push(id, salonId);
  const result = await client.query(
    `UPDATE salon_customers
     SET ${fields.join(", ")}
     WHERE id = $${values.length - 1} AND salon_id = $${values.length}
     RETURNING id, salon_id, first_name, last_name, phone, email, notes, tags, avatar_url, is_vip, status, created_at, updated_at`,
    values,
  );

  if (result.rows.length === 0) {
    return error(404, "NOT_FOUND", "Customer not found.", { id });
  }

  return success(200, { customer: mapCustomer(result.rows[0]) }, { salonId });
}

async function archiveCustomer(client, salonId, id) {
  const result = await client.query(
    `UPDATE salon_customers
     SET status = 'archived', updated_at = now()
     WHERE id = $1 AND salon_id = $2
     RETURNING id`,
    [id, salonId],
  );

  if (result.rows.length === 0) {
    return error(404, "NOT_FOUND", "Customer not found.", { id });
  }

  return noContent();
}

exports.handler = async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: CORS_HEADERS, body: "" };
  }

  const method = event.httpMethod;
  const segments = parsePath(event);
  const query = event.queryStringParameters || {};
  let body = {};

  try {
    if (method === "POST" || method === "PATCH") {
      body = parseJsonBody(event);
    }
  } catch (err) {
    return error(err.statusCode || 400, err.code || "VALIDATION_ERROR", err.message, err.details || {});
  }

  const forbiddenSalonIdResponse = rejectClientSalonIds(event, body);
  if (forbiddenSalonIdResponse) return forbiddenSalonIdResponse;

  let salonCtx;
  try {
    salonCtx = resolveSalonContext(event);
  } catch (err) {
    if (err instanceof SalonAuthError) {
      return error(err.statusCode || 401, err.statusCode === 403 ? "FORBIDDEN" : "UNAUTHORIZED", err.message);
    }
    return error(401, "UNAUTHORIZED", "Unauthorized.");
  }

  let client;
  try {
    client = await getClient();
    const salonId = salonCtx.salonId;

    if (method === "GET" && segments.length === 0) {
      const { response, error: listError } = await listCustomers(client, salonId, query);
      return listError || response;
    }

    if (segments.length === 1) {
      const id = segments[0];

      if (method === "GET") return await getCustomer(client, salonId, id);
      if (method === "PATCH") return await updateCustomer(client, salonId, id, body);
      if (method === "DELETE") return await archiveCustomer(client, salonId, id);
    }

    if (method === "POST" && segments.length === 0) {
      return await createCustomer(client, salonCtx.salonId, body);
    }

    return error(404, "NOT_FOUND", "Route not found.");
  } catch (err) {
    console.error("[salon-customers] error:", err.message);
    return error(err.statusCode || 500, err.code || "INTERNAL_ERROR", err.statusCode ? err.message : "Internal server error.");
  } finally {
    if (client) await client.end().catch(() => {});
  }
};
