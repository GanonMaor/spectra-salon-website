#!/usr/bin/env node
/**
 * Phase 8 CRM pilot validation smoke guard.
 *
 * Adds the pre-real-customer gate:
 * - data cleanliness: no seed/mock/demo business data in pilot runtime
 * - onboarding readiness: a brand-new salon starts clean from zero
 *
 * This guard intentionally fails if a visible pilot/production route can show
 * fake business metrics as real data. Phase 8 must not pass until that is fixed.
 */
"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const ROOT = path.join(__dirname, "..");
const SMOKE_PREFIX = `smoke_p8_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
const CLEAN_SALON_ID = `${SMOKE_PREFIX}-salon`;
const CLEAN_OWNER_ID = `${SMOKE_PREFIX}-owner`;
const CLEAN_MEMBERSHIP_ID = `${SMOKE_PREFIX}-membership`;
let currentStep = "startup";

loadLocalEnv();
process.env.DATABASE_URL = normalizeDatabaseUrl(process.env.DATABASE_URL || process.env.NEON_DATABASE_URL);
process.env.NEON_DATABASE_URL = process.env.DATABASE_URL;
process.env.SALON_SESSION_SECRET = process.env.SALON_SESSION_SECRET || `smoke-${crypto.randomBytes(24).toString("hex")}`;

const DATABASE_URL = process.env.DATABASE_URL;
const { signSalonSession } = require("../netlify/functions/_salon-context");
const bootstrapHandler = require("../netlify/functions/crm-bootstrap").handler;
const servicesHandler = require("../netlify/functions/crm-services").handler;
const productsHandler = require("../netlify/functions/salon-products").handler;

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

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function walkFiles(dir, predicate, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === "dist") continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, predicate, acc);
    } else if (predicate(fullPath)) {
      acc.push(fullPath);
    }
  }
  return acc;
}

function relative(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, "/");
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

function parseBody(res) {
  if (!res?.body) return null;
  try {
    return JSON.parse(res.body);
  } catch {
    return res.body;
  }
}

async function call(handler, base, method, suffix, options = {}) {
  const res = await handler(eventFor(base, method, suffix, options));
  return { status: res.statusCode, body: parseBody(res) };
}

function expectStatus(actual, expected, label) {
  if (actual !== expected) fail(`${label}: expected ${expected}, got ${actual}`);
}

function dataOf(response) {
  return response.body && response.body.ok === true ? response.body.data : response.body;
}

function metaOf(response) {
  return response.body && response.body.ok === true ? response.body.meta : response.body?.meta;
}

async function getDbClient() {
  if (!DATABASE_URL || DATABASE_URL.length < 10) blocked("DATABASE_URL or NEON_DATABASE_URL is not configured");
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
  } catch (err) {
    blocked(`Could not connect to the configured database: ${err.message}`);
  }
  return client;
}

function assertStaticRuntimeGuards() {
  const page = read("src/screens/SalonCRM/SalonCRMPage.tsx");
  const provider = read("src/screens/SalonCRM/data/CRMDataProvider.tsx");
  const repository = read("src/screens/SalonCRM/data/crmRepository.ts");
  const catalogProvider = read("src/screens/SalonCRM/schedule/ScheduleCatalogProvider.tsx");
  const inventoryPage = read("src/screens/SalonCRM/InventoryPage.tsx");
  const setupPage = read("src/screens/SalonCRM/ProductCatalogSetupPage.tsx");
  const indexRoutes = read("src/index.tsx");

  if (!page.includes("createLiveCRMRepository()")) {
    fail("SalonCRMPage is not mounted with the live API repository");
  }
  if (page.includes("seedCRMRepository") || page.includes("DEFAULT_CRM_SEED")) {
    fail("SalonCRMPage references seed/demo data");
  }
  if (!page.includes("<CRMDataProvider repository={liveRepository}>")) {
    fail("CRMDataProvider is not explicitly mounted with the live repository");
  }
  if (page.includes("Nectarine Tel Aviv") || page.includes("נקטרין תל אביב")) {
    fail("SalonCRMPage still displays a hardcoded salon name in the CRM shell");
  }
  if (!page.includes("useCRMSalon()") || !page.includes("salonName={salonName}")) {
    fail("CRM shell does not read the current salon name from live CRM state");
  }
  const bareProviderPattern = /<CRMDataProvider(?![^>]*\brepository=)/g;
  const bareProviderMatches = page.match(bareProviderPattern) || [];
  if (bareProviderMatches.length > 0) {
    fail("SalonCRMPage renders CRMDataProvider without an explicit live repository");
  }
  for (const filePath of walkFiles(path.join(ROOT, "src"), (file) => file.endsWith(".tsx"))) {
    const rel = relative(filePath);
    if (rel === "src/screens/SalonCRM/data/CRMDataProvider.tsx") continue;
    const source = fs.readFileSync(filePath, "utf8");
    if ((source.match(bareProviderPattern) || []).length > 0) {
      fail(`${rel} renders CRMDataProvider without an explicit repository`);
    }
  }
  const seedRuntimeFiles = walkFiles(path.join(ROOT, "src/screens/SalonCRM"), (file) => /\.(ts|tsx)$/.test(file))
    .filter((filePath) => {
      const rel = relative(filePath);
      return !rel.includes("/__tests__/")
        && rel !== "src/screens/SalonCRM/data/crmRepository.ts"
        && rel !== "src/screens/SalonCRM/data/crmSeedData.ts"
        && rel !== "src/screens/SalonCRM/data/CRMDataProvider.tsx";
    });
  for (const filePath of seedRuntimeFiles) {
    const source = fs.readFileSync(filePath, "utf8");
    if (source.includes("DEFAULT_CRM_SEED") || source.includes("seedCRMRepository") || source.includes("SeedCRMRepository")) {
      fail(`${relative(filePath)} references seed CRM data in runtime code`);
    }
  }
  if (!repository.includes("export class ApiCRMRepository") || !repository.includes('persistedStatePolicy: CRMRepository["persistedStatePolicy"] = "none"')) {
    fail("ApiCRMRepository does not disable localStorage business-state merge");
  }
  if (!repository.includes("supportsLiveWrites = true as const")) {
    fail("ApiCRMRepository is not marked as live-write capable");
  }
  if (!provider.includes('repository.persistedStatePolicy === "none" ? null : readPersistedCRMState()')) {
    fail("CRMDataProvider can still read localStorage business state for live repositories");
  }
  if (!provider.includes('if (repository.persistedStatePolicy === "none") return;')) {
    fail("CRMDataProvider can still persist business state for live repositories");
  }
  if (!provider.includes("SeedCRMRepository is active outside development runtime")) {
    fail("CRMDataProvider does not warn if the seed repository is mounted outside development");
  }
  if (catalogProvider.includes("COSMETICS_SERVICES") || catalogProvider.includes("WASH_SERVICES") || catalogProvider.includes("SEED_DEPARTMENTS")) {
    fail("ScheduleCatalogProvider still contains hardcoded production services/departments");
  }
  if (catalogProvider.includes("useServices") || catalogProvider.includes("buildCatalogFromCrm(")) {
    fail("ScheduleCatalogProvider can still fall back to CRM seed/catalog services");
  }
  for (const [label, source] of [["InventoryPage", inventoryPage], ["ProductCatalogSetupPage", setupPage]]) {
    if (source.includes("MOCK_PRODUCTS") || source.includes("MOCK_BRANDS") || source.includes("MOCK_LINES")) {
      fail(`${label} still references mock inventory catalog data`);
    }
    if (source.includes("/.netlify/functions/inventory")) {
      fail(`${label} still references the legacy inventory function`);
    }
  }

  if (!indexRoutes.includes('path="analytics" element={<AnalyticsPage />}')) {
    fail("/crm/analytics is not routed to the live CRM analytics readiness page");
  }
  if (indexRoutes.includes("SalonPerformanceDashboard") || indexRoutes.includes("<SalonPerformanceDashboard embedded />")) {
    fail("/crm/analytics is still reachable through the mock-backed SalonPerformanceDashboard");
  }
  const liveAnalyticsPage = read("src/screens/SalonCRM/AnalyticsPage.tsx");
  if (liveAnalyticsPage.includes("AnalyticsMockData") || liveAnalyticsPage.includes("DEFAULT_CRM_SEED")) {
    fail("CRM analytics page still imports mock/seed analytics data");
  }
}

async function createCleanSalonShell(client) {
  await client.query("BEGIN");
  try {
    await client.query(
      `INSERT INTO salons (id, name, slug, email, timezone, status)
       VALUES ($1, $2, $3, $4, 'Asia/Jerusalem', 'active')`,
      [CLEAN_SALON_ID, `${SMOKE_PREFIX} Clean Salon`, CLEAN_SALON_ID, `${SMOKE_PREFIX}@example.invalid`],
    );
    await client.query(
      `INSERT INTO crm_users (id, email, display_name, phone, status)
       VALUES ($1, $2, $3, $4, 'active')`,
      [CLEAN_OWNER_ID, `${SMOKE_PREFIX}.owner@example.invalid`, `${SMOKE_PREFIX} Owner`, "+972500000001"],
    );
    await client.query(
      `INSERT INTO salon_memberships (id, salon_id, user_id, role, is_default)
       VALUES ($1, $2, $3, 'owner', true)`,
      [CLEAN_MEMBERSHIP_ID, CLEAN_SALON_ID, CLEAN_OWNER_ID],
    );
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  }
}

async function cleanup(client) {
  await client.query("DELETE FROM salons WHERE id = $1", [CLEAN_SALON_ID]).catch(() => {});
  await client.query("DELETE FROM crm_users WHERE id = $1", [CLEAN_OWNER_ID]).catch(() => {});
}

function assertEmptyArray(value, label) {
  if (!Array.isArray(value)) fail(`${label} is not an array`);
  if (value.length !== 0) fail(`${label} should be empty for a clean new salon, got ${value.length}`);
}

async function assertCleanSalonRuntime(token) {
  const bootstrap = await call(bootstrapHandler, "/.netlify/functions/crm-bootstrap", "GET", "", { token });
  expectStatus(bootstrap.status, 200, "clean salon bootstrap");
  const bootstrapData = dataOf(bootstrap);
  const bootstrapMeta = metaOf(bootstrap);

  if (bootstrapMeta?.mock === true) {
    fail("crm-bootstrap returned mock=true for DB-backed pilot runtime");
  }
  if (bootstrapData?.salon?.id !== CLEAN_SALON_ID) {
    fail("crm-bootstrap did not return the clean salon shell");
  }
  assertEmptyArray(bootstrapData?.customers, "bootstrap customers");
  assertEmptyArray(bootstrapData?.staff, "bootstrap staff");
  assertEmptyArray(bootstrapData?.appointments, "bootstrap appointments");
  assertEmptyArray(bootstrapData?.departments, "bootstrap departments");
  assertEmptyArray(bootstrapData?.serviceCategories, "bootstrap serviceCategories");
  assertEmptyArray(bootstrapData?.services, "bootstrap services");

  const inventory = bootstrapData?.inventory;
  if (inventory?.summary && Number(inventory.summary.totalProducts) !== 0) {
    fail(`bootstrap inventory summary should have zero products, got ${inventory.summary.totalProducts}`);
  }
  if (inventory?.enabledBrandsCount != null && Number(inventory.enabledBrandsCount) !== 0) {
    fail(`clean salon should have zero enabled brands, got ${inventory.enabledBrandsCount}`);
  }
  if (inventory?.enabledProductLinesCount != null && Number(inventory.enabledProductLinesCount) !== 0) {
    fail(`clean salon should have zero enabled product lines, got ${inventory.enabledProductLinesCount}`);
  }

  const catalog = await call(servicesHandler, "/.netlify/functions/crm-services", "GET", "/", { token });
  expectStatus(catalog.status, 200, "clean salon services catalog");
  assertEmptyArray(catalog.body?.departments, "services departments");
  assertEmptyArray(catalog.body?.categories, "services categories");
  assertEmptyArray(catalog.body?.services, "services services");

  const items = await call(productsHandler, "/.netlify/functions/salon-products", "GET", "/inventory", { token });
  expectStatus(items.status, 200, "clean salon inventory list");
  assertEmptyArray(items.body?.items, "inventory items");

  const brands = await call(productsHandler, "/.netlify/functions/salon-products", "GET", "/brands/enabled", { token });
  expectStatus(brands.status, 200, "clean salon enabled brands");
  assertEmptyArray(brands.body?.brands, "enabled brands");

  const lines = await call(productsHandler, "/.netlify/functions/salon-products", "GET", "/product-lines/enabled", { token });
  expectStatus(lines.status, 200, "clean salon enabled product lines");
  assertEmptyArray(lines.body?.productLines, "enabled product lines");
}

async function main() {
  step("static runtime guards");
  assertStaticRuntimeGuards();

  const client = await getDbClient();
  try {
    step("clean salon setup");
    await cleanup(client);
    await createCleanSalonShell(client);

    step("clean salon runtime");
    const token = signSalonSession({
      salonId: CLEAN_SALON_ID,
      userId: CLEAN_OWNER_ID,
      role: "owner",
      ttlSeconds: 60 * 30,
    });
    await assertCleanSalonRuntime(token);

    console.log("PASS: Phase 8 CRM data cleanliness + onboarding readiness guard");
    console.log("- live CRM runtime is mounted on ApiCRMRepository, not SeedCRMRepository");
    console.log("- live repository disables localStorage business-state merge/persist");
    console.log("- clean new salon shell bootstraps with empty customers/staff/appointments");
    console.log("- empty DB services catalog stays empty; no hardcoded services are injected");
    console.log("- clean new salon has no inventory stock or enabled brand/line leakage");
    console.log("- visible analytics/report routes do not source fake business metrics");
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
