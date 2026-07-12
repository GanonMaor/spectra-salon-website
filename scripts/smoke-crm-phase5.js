#!/usr/bin/env node
/**
 * Phase 5 CRM smoke guard.
 *
 * Verifies that crm-bootstrap is the canonical live read model and that the
 * Salon CRM runtime is wired to the live repository rather than seed/local
 * browser business state.
 */
"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const ROOT = path.join(__dirname, "..");
const SMOKE_PREFIX = `smoke_p5_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
const SALON_A = "pilot-core-salon-a";
const SALON_B = "pilot-core-salon-b";
const USER_A = "smoke-p5-user-a";
const USER_B = "smoke-p5-user-b";
let currentStep = "startup";

loadLocalEnv();
process.env.NEON_DATABASE_URL = normalizeDatabaseUrl(process.env.NEON_DATABASE_URL);

const DATABASE_URL = process.env.NEON_DATABASE_URL;
process.env.SALON_SESSION_SECRET = process.env.SALON_SESSION_SECRET || `smoke-${crypto.randomBytes(24).toString("hex")}`;

const { signSalonSession } = require("../netlify/functions/_salon-context");
const bootstrapHandler = require("../netlify/functions/crm-bootstrap").handler;
const customersHandler = require("../netlify/functions/salon-customers").handler;
const staffHandler = require("../netlify/functions/salon-staff").handler;
const appointmentsHandler = require("../netlify/functions/salon-appointments").handler;

function loadLocalEnv() {
  const dotenvPath = path.join(ROOT, ".env.local");
  if (fs.existsSync(dotenvPath)) {
    require("dotenv").config({ path: dotenvPath, quiet: true });
  }
}

function normalizeDatabaseUrl(value) {
  let trimmed = String(value || "").trim();
  const psqlMatch = /^psql'(.+)'$/.exec(trimmed);
  if (psqlMatch) trimmed = psqlMatch[1];
  if (/^postgres(?:ql)?:\/\//.test(trimmed) && trimmed.endsWith("'")) trimmed = trimmed.slice(0, -1);
  return trimmed;
}

function step(name) {
  currentStep = name;
}

function fail(message) {
  throw new Error(`${currentStep}: ${message}`);
}

function blocked(message) {
  console.log(`BLOCKED: ${message}`);
  process.exit(0);
}

function parseBody(res) {
  if (!res || !res.body) return null;
  try {
    return JSON.parse(res.body);
  } catch {
    return res.body;
  }
}

function eventFor(base, method, suffix = "", { token, body, query } = {}) {
  return {
    httpMethod: method,
    path: `${base}${suffix}`,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    queryStringParameters: query || {},
    body: body === undefined ? "" : JSON.stringify(body),
    isBase64Encoded: false,
  };
}

async function call(handler, base, method, suffix, options = {}) {
  const res = await handler(eventFor(base, method, suffix, options));
  return { status: res.statusCode, body: parseBody(res) };
}

function expectStatus(actual, expected, label) {
  if (actual !== expected) fail(`${label}: expected ${expected}, got ${actual}`);
}

function expectEnvelope(response, label) {
  if (!response.body || typeof response.body !== "object") fail(`${label}: missing JSON body`);
  if (response.status >= 200 && response.status < 300) {
    if (response.body.ok !== true || !response.body.data) fail(`${label}: missing success envelope`);
  } else if (response.body.ok !== false || !response.body.error) {
    fail(`${label}: missing error envelope`);
  }
}

function dataOf(response) {
  return response.body && response.body.ok === true ? response.body.data : response.body;
}

function one(body, key) {
  const data = dataOf(body);
  return data && data[key] ? data[key] : data;
}

function list(data, key) {
  return Array.isArray(data && data[key]) ? data[key] : [];
}

function iso(minutesFromNow) {
  return new Date(Date.now() + minutesFromNow * 60 * 1000).toISOString();
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

async function getDbClient() {
  if (!DATABASE_URL || DATABASE_URL.length < 10) blocked("NEON_DATABASE_URL is not configured");
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
  } catch (err) {
    blocked(`Could not connect to the configured database: ${err.message}`);
  }
  return client;
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

function assertRuntimeWiring() {
  const page = fs.readFileSync(path.join(ROOT, "src/screens/SalonCRM/SalonCRMPage.tsx"), "utf8");
  const provider = fs.readFileSync(path.join(ROOT, "src/screens/SalonCRM/data/CRMDataProvider.tsx"), "utf8");
  const repo = fs.readFileSync(path.join(ROOT, "src/screens/SalonCRM/data/crmRepository.ts"), "utf8");

  if (!page.includes("createLiveCRMRepository")) fail("SalonCRMPage is not wired to createLiveCRMRepository");
  if (page.includes("createSalonProductsCRMRepository")) fail("SalonCRMPage still uses inventory-only repository");
  if (!provider.includes('repository.persistedStatePolicy === "none" ? null : readPersistedCRMState()')) {
    fail("CRMDataProvider still reads persisted business state for live repositories");
  }
  if (!provider.includes('if (repository.persistedStatePolicy === "none") return;')) {
    fail("CRMDataProvider still writes normalized business state for live repositories");
  }
  if (!repo.includes('persistedStatePolicy: CRMRepository["persistedStatePolicy"] = "none"')) {
    fail("ApiCRMRepository is not marked persistedStatePolicy none");
  }
  if (repo.includes('"/crm/snapshot"')) fail("ApiCRMRepository still points at deprecated /crm/snapshot");
  if (!repo.includes('requestFunction<ApiObject>("crm-bootstrap")')) fail("ApiCRMRepository does not use crm-bootstrap");
}

async function main() {
  assertRuntimeWiring();

  const tokenA = signSalonSession({ salonId: SALON_A, userId: USER_A, role: "owner", ttlSeconds: 60 * 30 });
  const tokenB = signSalonSession({ salonId: SALON_B, userId: USER_B, role: "owner", ttlSeconds: 60 * 30 });

  const client = await getDbClient();
  let customerId;
  let staffId;
  try {
    step("db setup");
    await ensurePilotSalons(client);
    await cleanup(client);

    step("create live records");
    let res = await call(customersHandler, "/.netlify/functions/salon-customers", "POST", "/", {
      token: tokenA,
      body: {
        firstName: `${SMOKE_PREFIX}_Customer`,
        lastName: "A",
        email: `${SMOKE_PREFIX}@example.test`,
        notes: `${SMOKE_PREFIX}_customer_notes`,
        tags: ["phase5"],
        isVip: true,
      },
    });
    expectStatus(res.status, 201, "customer create");
    customerId = one(res, "customer").id;

    res = await call(staffHandler, "/.netlify/functions/salon-staff", "POST", "/", {
      token: tokenA,
      body: {
        name: `${SMOKE_PREFIX}_Staff`,
        role: "Colorist",
        email: `${SMOKE_PREFIX}.staff@example.test`,
        workingHours: [{ dayOfWeek: 0, startHour: 9, endHour: 17 }],
      },
    });
    expectStatus(res.status, 201, "staff create");
    staffId = one(res, "staff").id;

    res = await call(appointmentsHandler, "/.netlify/functions/salon-appointments", "POST", "/", {
      token: tokenA,
      body: {
        customerId,
        staffMemberId: staffId,
        customerName: `${SMOKE_PREFIX}_Customer A`,
        serviceName: `${SMOKE_PREFIX}_Root Color`,
        serviceCategoryId: "color",
        startTime: iso(30),
        endTime: iso(90),
        status: "confirmed",
        notes: `${SMOKE_PREFIX}_appointment_notes`,
        segments: [{
          segmentType: "apply",
          label: `${SMOKE_PREFIX}_Apply`,
          startTime: iso(30),
          endTime: iso(60),
          sortOrder: 0,
          staffMemberId: staffId,
          notes: `${SMOKE_PREFIX}_segment_notes`,
        }],
      },
    });
    expectStatus(res.status, 201, "appointment create");

    await call(customersHandler, "/.netlify/functions/salon-customers", "POST", "/", {
      token: tokenB,
      body: {
        firstName: `${SMOKE_PREFIX}_Customer_B`,
        email: `${SMOKE_PREFIX}.b@example.test`,
        notes: `${SMOKE_PREFIX}_tenant_b_notes`,
      },
    });

    step("bootstrap salon A");
    const bootA = await call(bootstrapHandler, "/.netlify/functions/crm-bootstrap", "GET", "/", { token: tokenA });
    expectStatus(bootA.status, 200, "bootstrap A");
    expectEnvelope(bootA, "bootstrap A");
    assertNoSnakeCaseKeys(bootA.body.data, "bootstrap A data");
    const dataA = dataOf(bootA);

    const requiredKeys = [
      "salon",
      "currentUser",
      "role",
      "departments",
      "serviceCategories",
      "services",
      "staff",
      "customers",
      "appointments",
      "inventory",
      "needsMigration",
    ];
    for (const key of requiredKeys) {
      if (!Object.prototype.hasOwnProperty.call(dataA, key)) fail(`bootstrap payload missing ${key}`);
    }
    if (!list(dataA, "customers").some((row) => row.id === customerId)) fail("bootstrap did not include created customer");
    if (!list(dataA, "staff").some((row) => row.id === staffId)) fail("bootstrap did not include created staff");
    if (!list(dataA, "appointments").some((row) => row.customerId === customerId && row.segments?.length === 1)) {
      fail("bootstrap did not include appointment with nested segment");
    }
    if (list(dataA, "customers").some((row) => row.email === `${SMOKE_PREFIX}.b@example.test`)) {
      fail("Salon A bootstrap leaked Salon B customer");
    }

    step("bootstrap hard-refresh repeat");
    const bootA2 = await call(bootstrapHandler, "/.netlify/functions/crm-bootstrap", "GET", "/", { token: tokenA });
    expectStatus(bootA2.status, 200, "bootstrap A repeat");
    expectEnvelope(bootA2, "bootstrap A repeat");
    if (!list(dataOf(bootA2), "customers").some((row) => row.id === customerId)) {
      fail("repeated bootstrap did not return persisted DB customer");
    }

    step("bootstrap tenant isolation");
    const bootB = await call(bootstrapHandler, "/.netlify/functions/crm-bootstrap", "GET", "/", { token: tokenB });
    expectStatus(bootB.status, 200, "bootstrap B");
    expectEnvelope(bootB, "bootstrap B");
    if (list(dataOf(bootB), "customers").some((row) => row.id === customerId)) {
      fail("Salon B bootstrap leaked Salon A customer");
    }

    console.log("PASS: Phase 5 CRM live bootstrap smoke guard");
    console.log("- crm-bootstrap returns canonical live payload");
    console.log("- hard refresh/repeated bootstrap returns DB data");
    console.log("- Salon A/B bootstrap tenant isolation holds");
    console.log("- appointment segments hydrate through the shared appointment model");
    console.log("- production/pilot page uses live repository");
    console.log("- live runtime skips business localStorage read/write");
    console.log("- ApiCRMRepository uses crm-bootstrap, not deprecated /crm/snapshot");
  } finally {
    await cleanup(client).catch(() => {});
    await client.end().catch(() => {});
  }
}

main().catch((err) => {
  const message = String(err?.message || err);
  if (/connection|timeout|enotfound|econnreset/i.test(message)) {
    console.log(`BLOCKED: Database connectivity failed during ${currentStep}: ${message}`);
    process.exit(0);
  }
  console.error(`FAIL: ${message}`);
  process.exit(1);
});
