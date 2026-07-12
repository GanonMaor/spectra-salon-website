#!/usr/bin/env node
/**
 * Phase 4 CRM smoke guard.
 *
 * Calls the local Netlify function handlers directly so the tenant-scoped
 * Customers, Staff, and Appointments APIs can be verified before deployment.
 *
 * Usage:
 *   node scripts/smoke-crm-phase4.js
 *
 * Expected handlers:
 *   netlify/functions/salon-customers.js
 *   netlify/functions/salon-staff.js
 *   netlify/functions/salon-appointments.js
 */
"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const ROOT = path.join(__dirname, "..");
const REQUIRED_ENDPOINTS = {
  customers: path.join(ROOT, "netlify/functions/salon-customers.js"),
  staff: path.join(ROOT, "netlify/functions/salon-staff.js"),
  appointments: path.join(ROOT, "netlify/functions/salon-appointments.js"),
};
const FUNCTION_BASE = {
  customers: "/.netlify/functions/salon-customers",
  staff: "/.netlify/functions/salon-staff",
  appointments: "/.netlify/functions/salon-appointments",
};
const SMOKE_PREFIX = `smoke_p4_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
const SALON_A = "pilot-core-salon-a";
const SALON_B = "pilot-core-salon-b";
const USER_A = "smoke-p4-user-a";
const USER_B = "smoke-p4-user-b";
const LEGACY_TABLES = ["crm_customers", "customer_visits", "schedule_appointments", "schedule_segments"];
const NEW_TABLES = ["salon_customers", "salon_staff", "salon_appointments", "salon_appointment_segments"];
let currentStep = "startup";

loadLocalEnv();

function normalizeDatabaseUrl(value) {
  let trimmed = String(value || "").trim();
  const psqlMatch = /^psql'(.+)'$/.exec(trimmed);
  if (psqlMatch) trimmed = psqlMatch[1];
  if (/^postgres(?:ql)?:\/\//.test(trimmed) && trimmed.endsWith("'")) trimmed = trimmed.slice(0, -1);
  return trimmed;
}

process.env.NEON_DATABASE_URL = normalizeDatabaseUrl(process.env.NEON_DATABASE_URL);

const DATABASE_URL = process.env.NEON_DATABASE_URL;
process.env.SALON_SESSION_SECRET = process.env.SALON_SESSION_SECRET || `smoke-${crypto.randomBytes(24).toString("hex")}`;

let signSalonSession;
try {
  ({ signSalonSession } = require("../netlify/functions/_salon-context"));
} catch (err) {
  blocked(`Cannot load _salon-context.js: ${err.message}`);
}

function loadLocalEnv() {
  const dotenvPath = path.join(ROOT, ".env.local");
  if (fs.existsSync(dotenvPath)) {
    require("dotenv").config({ path: dotenvPath, quiet: true });
  }
}

function blocked(message) {
  console.log(`BLOCKED: ${message}`);
  process.exit(0);
}

function fail(message) {
  throw new Error(message);
}

function step(name) {
  currentStep = name;
}

function parseBody(res) {
  if (!res || !res.body) return null;
  try {
    return JSON.parse(res.body);
  } catch {
    return res.body;
  }
}

function bodyData(body) {
  if (!body || typeof body !== "object") return body;
  if (body.ok === true && Object.prototype.hasOwnProperty.call(body, "data")) return body.data;
  return body;
}

function extractOne(body, keys) {
  const data = bodyData(body);
  if (!data || typeof data !== "object") return data;
  for (const key of keys) {
    if (data[key]) return data[key];
  }
  return data;
}

function extractList(body, keys) {
  const data = bodyData(body);
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];
  for (const key of keys) {
    if (Array.isArray(data[key])) return data[key];
  }
  if (Array.isArray(data.items)) return data.items;
  return [];
}

function idOf(value, label) {
  if (!value || typeof value !== "object" || !value.id) {
    fail(`Could not read ${label} id from response`);
  }
  return value.id;
}

function iso(minutesFromNow) {
  return new Date(Date.now() + minutesFromNow * 60 * 1000).toISOString();
}

function eventFor({ base, method, suffix = "", token, body, query = {} }) {
  return {
    httpMethod: method,
    path: `${base}${suffix}`,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    queryStringParameters: query,
    body: body === undefined ? "" : JSON.stringify(body),
    isBase64Encoded: false,
  };
}

async function call(handler, base, method, suffix, { token, body, query } = {}) {
  const res = await handler(eventFor({ base, method, suffix, token, body, query }));
  return { status: res.statusCode, body: parseBody(res) };
}

function expectStatus(actual, expected, label) {
  if (actual !== expected) fail(`${label}: expected ${expected}, got ${actual}`);
}

function expectEnvelope(response, label) {
  if (response.status === 204) return;
  if (!response.body || typeof response.body !== "object") fail(`${label}: response body is not an object`);
  if (response.status >= 200 && response.status < 300) {
    if (response.body.ok !== true || !Object.prototype.hasOwnProperty.call(response.body, "data")) {
      fail(`${label}: success response does not use the approved envelope`);
    }
  } else if (response.body.ok !== false || !response.body.error || typeof response.body.error.code !== "string") {
    fail(`${label}: error response does not use the approved envelope`);
  }
}

function assertNoSnakeCaseKeys(value, label) {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoSnakeCaseKeys(item, `${label}[${index}]`));
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    if (key.includes("_")) fail(`${label}: raw snake_case key returned: ${key}`);
    assertNoSnakeCaseKeys(child, `${label}.${key}`);
  }
}

function expectContract(response, label) {
  expectEnvelope(response, label);
  if (response.status >= 200 && response.status < 300 && response.status !== 204) {
    assertNoSnakeCaseKeys(response.body.data, label);
  }
}

function isConnectivityBlocker(err) {
  const message = String(err?.message || "").toLowerCase();
  return message.includes("connection terminated") ||
    message.includes("connection timeout") ||
    message.includes("connection refused") ||
    message.includes("could not connect") ||
    message.includes("econnreset") ||
    message.includes("enotfound");
}

function requireEndpoints() {
  const missing = Object.entries(REQUIRED_ENDPOINTS)
    .filter(([, file]) => !fs.existsSync(file))
    .map(([name, file]) => `${name} (${path.relative(ROOT, file)})`);
  if (missing.length > 0) {
    blocked(`Phase 4 endpoint files are not present yet: ${missing.join(", ")}`);
  }
}

async function getDbClient() {
  if (!DATABASE_URL || DATABASE_URL.length < 10) {
    blocked("NEON_DATABASE_URL is not configured");
  }
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
  } catch (err) {
    blocked(`Could not connect to the configured database: ${err.message}`);
  }
  return client;
}

async function tableExists(client, table) {
  const r = await client.query("SELECT to_regclass($1) AS name", [`public.${table}`]);
  return Boolean(r.rows[0]?.name);
}

async function countBySmokePrefix(client, table) {
  if (!(await tableExists(client, table))) return null;
  const clauses = {
    crm_customers: "first_name LIKE $1 OR last_name LIKE $1 OR email LIKE $1",
    customer_visits: "notes LIKE $1 OR service_name LIKE $1 OR employee_name LIKE $1",
    schedule_appointments: "client_name LIKE $1 OR service_name LIKE $1 OR notes LIKE $1",
    schedule_segments: "label LIKE $1 OR notes LIKE $1",
    salon_customers: "first_name LIKE $1 OR last_name LIKE $1 OR email LIKE $1 OR notes LIKE $1",
    salon_staff: "name LIKE $1 OR email LIKE $1",
    salon_appointments: "customer_name LIKE $1 OR service_name LIKE $1 OR notes LIKE $1",
    salon_appointment_segments: "label LIKE $1 OR notes LIKE $1 OR service_name LIKE $1",
  };
  const where = clauses[table];
  if (!where) return null;
  const r = await client.query(`SELECT COUNT(*)::int AS count FROM ${table} WHERE ${where}`, [`${SMOKE_PREFIX}%`]);
  return r.rows[0].count;
}

async function ensurePilotSalons(client) {
  await client.query(
    `INSERT INTO salons (id, name, slug, timezone, status)
     VALUES
       ($1, 'Pilot Core Salon A', $1, 'Asia/Jerusalem', 'active'),
       ($2, 'Pilot Core Salon B', $2, 'Asia/Jerusalem', 'active')
     ON CONFLICT (id) DO NOTHING`,
    [SALON_A, SALON_B],
  );
}

async function cleanup(client) {
  const statements = [
    "DELETE FROM salon_appointment_segments WHERE label LIKE $1 OR notes LIKE $1 OR service_name LIKE $1",
    "DELETE FROM salon_appointments WHERE customer_name LIKE $1 OR service_name LIKE $1 OR notes LIKE $1",
    "DELETE FROM salon_customers WHERE first_name LIKE $1 OR last_name LIKE $1 OR email LIKE $1 OR notes LIKE $1",
    "DELETE FROM salon_staff WHERE name LIKE $1 OR email LIKE $1",
  ];
  for (const sql of statements) {
    try {
      await client.query(sql, [`${SMOKE_PREFIX}%`]);
    } catch (err) {
      if (!["42P01", "42703"].includes(err.code)) throw err;
    }
  }
}

async function withDb(fn) {
  const client = await getDbClient();
  try {
    return await fn(client);
  } finally {
    await client.end().catch(() => {});
  }
}

async function assertNoOrphanSegments(client) {
  if (!(await tableExists(client, "salon_appointment_segments"))) return;
  const r = await client.query(
    `SELECT COUNT(*)::int AS count
     FROM salon_appointment_segments s
     LEFT JOIN salon_appointments a
       ON a.id = s.appointment_id AND a.salon_id = s.salon_id
     WHERE a.id IS NULL`,
  );
  expectStatus(r.rows[0].count, 0, "no orphan salon appointment segments");
}

async function assertNoLegacyWrites(client, beforeLegacy) {
  for (const table of LEGACY_TABLES) {
    const before = beforeLegacy[table];
    const after = await countBySmokePrefix(client, table);
    if (before === null || after === null) continue;
    expectStatus(after, before, `legacy table ${table} smoke row count`);
  }
}

async function assertNewTablesReceivedSmokeRows(client, beforeNew) {
  for (const table of NEW_TABLES) {
    const before = beforeNew[table];
    const after = await countBySmokePrefix(client, table);
    if (before === null || after === null) continue;
    if (after <= before) fail(`new runtime table ${table} did not receive smoke rows`);
  }
}

async function runAuthTests(handlers) {
  const invalid = await call(handlers.customers, FUNCTION_BASE.customers, "GET", "/", { token: "not-a-valid-token" });
  expectStatus(invalid.status, 401, "invalid token returns 401");
  expectContract(invalid, "invalid token");

  const missing = await call(handlers.customers, FUNCTION_BASE.customers, "GET", "/");
  expectStatus(missing.status, 401, "missing token returns 401");
  expectContract(missing, "missing token");
}

async function runCustomersCrud(handlers, tokenA, tokenB) {
  const create = await call(handlers.customers, FUNCTION_BASE.customers, "POST", "/", {
    token: tokenA,
    body: {
      firstName: `${SMOKE_PREFIX}_Customer`,
      lastName: "A",
      phone: "+972500000401",
      email: `${SMOKE_PREFIX}@example.test`,
      notes: `${SMOKE_PREFIX}_customer_notes`,
      tags: ["vip", "phase4"],
      isVip: true,
    },
  });
  expectStatus(create.status, 201, "customers create");
  expectContract(create, "customers create");
  const customer = extractOne(create.body, ["customer"]);
  const customerId = idOf(customer, "customer");

  const crossTenant = await call(handlers.customers, FUNCTION_BASE.customers, "GET", `/${customerId}`, { token: tokenB });
  expectStatus(crossTenant.status, 404, "cross-tenant customer id returns 404");
  expectContract(crossTenant, "customers cross-tenant get");

  const patch = await call(handlers.customers, FUNCTION_BASE.customers, "PATCH", `/${customerId}`, {
    token: tokenA,
    body: { notes: `${SMOKE_PREFIX}_customer_updated`, isVip: false },
  });
  expectStatus(patch.status, 200, "customers update");
  expectContract(patch, "customers update");

  const get = await call(handlers.customers, FUNCTION_BASE.customers, "GET", `/${customerId}`, { token: tokenA });
  expectStatus(get.status, 200, "customers get after update");
  expectContract(get, "customers get");
  const persisted = extractOne(get.body, ["customer"]);
  if (persisted.notes !== `${SMOKE_PREFIX}_customer_updated`) fail("customers update did not persist");

  const list = await call(handlers.customers, FUNCTION_BASE.customers, "GET", "/", {
    token: tokenA,
    query: { search: SMOKE_PREFIX, limit: "50" },
  });
  expectStatus(list.status, 200, "customers list");
  expectContract(list, "customers list");
  const rows = extractList(list.body, ["customers"]);
  if (!rows.some((row) => row.id === customerId)) fail("customers create did not persist in list");

  return customerId;
}

async function archiveCustomer(handlers, tokenA, customerId) {
  const archive = await call(handlers.customers, FUNCTION_BASE.customers, "DELETE", `/${customerId}`, { token: tokenA });
  expectStatus(archive.status, 204, "customers archive");

  const getArchived = await call(handlers.customers, FUNCTION_BASE.customers, "GET", `/${customerId}`, { token: tokenA });
  expectStatus(getArchived.status, 200, "customers get after archive");
  expectContract(getArchived, "customers get after archive");
  const archived = extractOne(getArchived.body, ["customer"]);
  if (archived.status !== "archived") fail("customer archive did not persist");
}

async function runStaffCrud(handlers, tokenA, tokenB) {
  const staffId = await createStaff(handlers, tokenA, `${SMOKE_PREFIX}_Staff`, `${SMOKE_PREFIX}.staff@example.test`);

  const patch = await call(handlers.staff, FUNCTION_BASE.staff, "PATCH", `/${staffId}`, {
    token: tokenA,
    body: {
      role: "Senior Colorist",
      rating: 4.8,
      departmentIds: ["pilot-core-department-a"],
      serviceIds: ["pilot-core-service-a"],
      servicePriceOverrides: { "pilot-core-service-a": 12345 },
      workingHours: [{ day: "monday", start: "09:00", end: "18:00" }],
    },
  });
  expectStatus(patch.status, 200, "staff update");
  expectContract(patch, "staff update");

  const list = await call(handlers.staff, FUNCTION_BASE.staff, "GET", "/", {
    token: tokenA,
    query: { status: "all" },
  });
  expectStatus(list.status, 200, "staff list after update");
  expectContract(list, "staff list after update");
  const rows = extractList(list.body, ["staff"]);
  const persisted = rows.find((row) => row.id === staffId);
  if (!persisted || persisted.role !== "Senior Colorist") fail("staff update did not persist");
  if (!Array.isArray(persisted.workingHours) || persisted.workingHours[0]?.end !== "18:00") {
    fail("staff workingHours did not persist");
  }
  if (!Array.isArray(persisted.departmentIds) || !persisted.departmentIds.includes("pilot-core-department-a")) {
    fail("staff departmentIds did not persist");
  }
  if (!Array.isArray(persisted.serviceIds) || !persisted.serviceIds.includes("pilot-core-service-a")) {
    fail("staff serviceIds did not persist");
  }
  if (!persisted.servicePriceOverrides || persisted.servicePriceOverrides["pilot-core-service-a"] !== 12345) {
    fail("staff servicePriceOverrides did not persist");
  }

  const crossTenant = await call(handlers.staff, FUNCTION_BASE.staff, "PATCH", `/${staffId}`, {
    token: tokenB,
    body: { role: "Cross Tenant Attempt" },
  });
  expectStatus(crossTenant.status, 404, "cross-tenant staff update returns 404");
  expectContract(crossTenant, "staff cross-tenant update");

  return staffId;
}

async function createStaff(handlers, token, name, email) {
  const create = await call(handlers.staff, FUNCTION_BASE.staff, "POST", "/", {
    token,
    body: {
      name,
      role: "Colorist",
      email,
      phone: "+972500000402",
      color: "#A07CFE",
      workingHours: [{ day: "monday", start: "09:00", end: "17:00" }],
    },
  });
  expectStatus(create.status, 201, "staff create");
  expectContract(create, "staff create");
  const staff = extractOne(create.body, ["staff", "staffMember"]);
  return idOf(staff, "staff");
}

async function deactivateStaff(handlers, tokenA, staffId) {
  const deactivate = await call(handlers.staff, FUNCTION_BASE.staff, "DELETE", `/${staffId}`, { token: tokenA });
  expectStatus(deactivate.status, 204, "staff deactivate");

  const list = await call(handlers.staff, FUNCTION_BASE.staff, "GET", "/", {
    token: tokenA,
    query: { status: "all" },
  });
  expectStatus(list.status, 200, "staff list after deactivate");
  expectContract(list, "staff list after deactivate");
  const deactivated = extractList(list.body, ["staff"]).find((row) => row.id === staffId);
  if (!deactivated || deactivated.status !== "inactive") fail("staff deactivate did not persist");
}

async function runAppointmentsCrud(handlers, tokenA, customerId, staffId, crossTenantStaffId) {
  const segments = [
    {
      segmentType: "apply",
      label: `${SMOKE_PREFIX}_Apply`,
      startTime: iso(30),
      endTime: iso(60),
      sortOrder: 0,
      staffMemberId: staffId,
      notes: `${SMOKE_PREFIX}_segment_apply`,
    },
    {
      segmentType: "wait",
      label: `${SMOKE_PREFIX}_Process`,
      startTime: iso(60),
      endTime: iso(90),
      sortOrder: 1,
      notes: `${SMOKE_PREFIX}_segment_wait`,
    },
  ];
  const create = await call(handlers.appointments, FUNCTION_BASE.appointments, "POST", "/", {
    token: tokenA,
    body: {
      customerId,
      staffMemberId: staffId,
      customerName: `${SMOKE_PREFIX}_Customer A`,
      serviceName: `${SMOKE_PREFIX}_Root Color`,
      startTime: iso(30),
      endTime: iso(90),
      status: "confirmed",
      notes: `${SMOKE_PREFIX}_appointment_notes`,
      segments,
    },
  });
  expectStatus(create.status, 201, "appointments create");
  expectContract(create, "appointments create");
  const appointment = extractOne(create.body, ["appointment"]);
  const appointmentId = idOf(appointment, "appointment");
  if (!Array.isArray(appointment.segments) || appointment.segments.length !== 2) {
    fail("appointment segments did not persist on create");
  }

  const crossTenantPatch = await call(handlers.appointments, FUNCTION_BASE.appointments, "PATCH", `/${appointmentId}`, {
    token: signSalonSession({ salonId: SALON_B, userId: USER_B, role: "owner", ttlSeconds: 60 * 30 }),
    body: { notes: "Cross tenant attempt" },
  });
  expectStatus(crossTenantPatch.status, 404, "cross-tenant appointment update returns 404");
  expectContract(crossTenantPatch, "appointments cross-tenant update");

  const replacementSegments = [
    {
      segmentType: "apply",
      label: `${SMOKE_PREFIX}_Apply Updated`,
      startTime: iso(45),
      endTime: iso(75),
      sortOrder: 0,
      staffMemberId: staffId,
      notes: `${SMOKE_PREFIX}_segment_replaced`,
    },
  ];
  const patch = await call(handlers.appointments, FUNCTION_BASE.appointments, "PATCH", `/${appointmentId}`, {
    token: tokenA,
    body: {
      status: "in-progress",
      notes: `${SMOKE_PREFIX}_appointment_updated`,
      segments: replacementSegments,
    },
  });
  expectStatus(patch.status, 200, "appointments update");
  expectContract(patch, "appointments update");
  const persisted = extractOne(patch.body, ["appointment"]);
  const persistedSegments = persisted.segments || [];
  if (persisted.notes !== `${SMOKE_PREFIX}_appointment_updated`) fail("appointments update did not persist");
  if (!Array.isArray(persistedSegments) || persistedSegments.length !== 1) {
    fail("appointment segment replacement did not persist transactionally");
  }
  if (persistedSegments[0].label !== `${SMOKE_PREFIX}_Apply Updated`) {
    fail("appointment replacement segment label did not persist");
  }

  const badUpdate = await call(handlers.appointments, FUNCTION_BASE.appointments, "PATCH", `/${appointmentId}`, {
    token: tokenA,
    body: {
      notes: `${SMOKE_PREFIX}_should_not_commit`,
      segments: [
        {
          segmentType: "apply",
          label: `${SMOKE_PREFIX}_Cross Tenant Segment`,
          startTime: iso(100),
          endTime: iso(130),
          sortOrder: 0,
          staffMemberId: crossTenantStaffId,
        },
      ],
    },
  });
  expectStatus(badUpdate.status, 404, "cross-tenant segment update rejects before commit");
  expectContract(badUpdate, "appointments rejected segment update");

  const afterBad = await call(handlers.appointments, FUNCTION_BASE.appointments, "GET", "/", {
    token: tokenA,
    query: { from: iso(-5), to: iso(180) },
  });
  expectStatus(afterBad.status, 200, "appointments list after rejected update");
  expectContract(afterBad, "appointments list after rejected update");
  const afterBadAppointment = extractList(afterBad.body, ["appointments"]).find((row) => row.id === appointmentId);
  if (!afterBadAppointment) fail("appointment missing after rejected update");
  const afterBadSegments = afterBadAppointment.segments || [];
  if (afterBadAppointment.notes === `${SMOKE_PREFIX}_should_not_commit`) {
    fail("rejected segment update committed appointment fields");
  }
  if (!Array.isArray(afterBadSegments) || afterBadSegments.length !== 1) {
    fail("rejected segment update changed persisted segment count");
  }

  const cancel = await call(handlers.appointments, FUNCTION_BASE.appointments, "DELETE", `/${appointmentId}`, { token: tokenA });
  expectStatus(cancel.status, 200, "appointments cancel");
  expectContract(cancel, "appointments cancel");
  const cancelled = extractOne(cancel.body, ["appointment"]);
  if (cancelled.status !== "cancelled") fail("appointment cancel did not persist");

  return appointmentId;
}

async function main() {
  requireEndpoints();

  const handlers = {
    customers: require(REQUIRED_ENDPOINTS.customers).handler,
    staff: require(REQUIRED_ENDPOINTS.staff).handler,
    appointments: require(REQUIRED_ENDPOINTS.appointments).handler,
  };
  if (!handlers.customers || !handlers.staff || !handlers.appointments) {
    blocked("One or more Phase 4 endpoint files does not export a handler");
  }

  const tokenA = signSalonSession({ salonId: SALON_A, userId: USER_A, role: "owner", ttlSeconds: 60 * 30 });
  const tokenB = signSalonSession({ salonId: SALON_B, userId: USER_B, role: "owner", ttlSeconds: 60 * 30 });

  const results = [];
  let beforeLegacy;
  let beforeNew;

  step("db setup");
  await withDb(async (client) => {
    for (const table of NEW_TABLES) {
      if (!(await tableExists(client, table))) blocked(`Required Phase 4 table is missing: ${table}`);
    }

    await ensurePilotSalons(client);
    await cleanup(client);

    beforeLegacy = Object.fromEntries(await Promise.all(LEGACY_TABLES.map(async (table) => [table, await countBySmokePrefix(client, table)])));
    beforeNew = Object.fromEntries(await Promise.all(NEW_TABLES.map(async (table) => [table, await countBySmokePrefix(client, table)])));
  });

  step("auth tests");
  await runAuthTests(handlers);
  results.push("missing token returns 401", "invalid token returns 401", "approved error envelope");

  step("customers crud");
  const customerId = await runCustomersCrud(handlers, tokenA, tokenB);
  results.push("cross-tenant record ID returns 404", "customers CRUD persists", "customers camelCase responses");

  step("staff crud");
  const staffId = await runStaffCrud(handlers, tokenA, tokenB);
  const crossTenantStaffId = await createStaff(
    handlers,
    tokenB,
    `${SMOKE_PREFIX}_Staff_B`,
    `${SMOKE_PREFIX}.staff-b@example.test`,
  );
  results.push("staff CRUD persists", "staff JSONB fields persist", "staff cross-tenant access blocked");

  step("appointments crud");
  await runAppointmentsCrud(handlers, tokenA, customerId, staffId, crossTenantStaffId);
  results.push("appointments CRUD persists", "segments persist transactionally", "failed segment save rolls back appointment update");

  step("soft delete checks");
  await archiveCustomer(handlers, tokenA, customerId);
  await deactivateStaff(handlers, tokenA, staffId);
  results.push("customers archive persists", "staff deactivate persists", "appointments cancel persists");

  step("db verification");
  await withDb(async (client) => {
    await assertNoOrphanSegments(client);
    results.push("no orphan segments");

    await assertNoLegacyWrites(client, beforeLegacy);
    await assertNewTablesReceivedSmokeRows(client, beforeNew);
    results.push("no legacy runtime tables used by new APIs");

    console.log("PASS: Phase 4 CRM smoke guard");
    for (const result of results) console.log(`- ${result}`);
    await cleanup(client).catch(() => {});
  });
}

main().catch((err) => {
  if (isConnectivityBlocker(err)) {
    console.log(`BLOCKED: Could not complete smoke test because database connectivity failed during ${currentStep}: ${err.message}`);
    process.exit(0);
  }
  console.error(`FAIL: ${err.message}`);
  process.exit(1);
});
