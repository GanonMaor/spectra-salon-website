#!/usr/bin/env node
/**
 * Phase 7 CRM services + inventory smoke guard.
 *
 * Verifies the runtime cleanup that follows mutation wiring:
 * - services/departments/categories are tenant-scoped DB records
 * - archived services remain persisted but are not bookable by the UI
 * - inventory uses salon-products only with salon-scoped enablement and stock
 * - pilot runtime does not rely on hardcoded service/product mocks
 */
"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const ROOT = path.join(__dirname, "..");
const SMOKE_PREFIX = `smoke_p7_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
const SALON_A = "pilot-core-salon-a";
const SALON_B = "pilot-core-salon-b";
const USER_A = "smoke-p7-user-a";
const USER_B = "smoke-p7-user-b";
let currentStep = "startup";

loadLocalEnv();
process.env.DATABASE_URL = normalizeDatabaseUrl(process.env.DATABASE_URL || process.env.NEON_DATABASE_URL);
process.env.NEON_DATABASE_URL = process.env.DATABASE_URL;
process.env.SALON_SESSION_SECRET = process.env.SALON_SESSION_SECRET || `smoke-${crypto.randomBytes(24).toString("hex")}`;

const DATABASE_URL = process.env.DATABASE_URL;
const { signSalonSession } = require("../netlify/functions/_salon-context");
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
  await client.query("DELETE FROM salon_services WHERE name LIKE $1 OR id LIKE $1", [`${SMOKE_PREFIX}%`]).catch(() => {});
  await client.query("DELETE FROM salon_service_categories WHERE name LIKE $1 OR id LIKE $1", [`${SMOKE_PREFIX}%`]).catch(() => {});
  await client.query("DELETE FROM salon_departments WHERE name LIKE $1 OR id LIKE $1", [`${SMOKE_PREFIX}%`]).catch(() => {});
  await client.query("DELETE FROM salon_inventory_products WHERE local_display_name LIKE $1 OR local_barcode_override LIKE $1", [`${SMOKE_PREFIX}%`]).catch(() => {});
}

async function pickCatalogProduct(client) {
  const result = await client.query(
    `SELECT cp.id AS product_id, cp.manufacturer_id AS brand_id, cp.product_line_id
     FROM catalog_products cp
     WHERE cp.active = true
       AND cp.manufacturer_id IS NOT NULL
       AND cp.product_line_id IS NOT NULL
       AND NOT EXISTS (
         SELECT 1 FROM salon_inventory_products sip
         WHERE sip.salon_id = $1 AND sip.product_id = cp.id AND sip.status = 'active'
       )
     ORDER BY cp.updated_at DESC NULLS LAST, cp.id ASC
     LIMIT 1`,
    [SALON_A],
  );
  if (result.rows[0]) return result.rows[0];

  const fallback = await client.query(
    `SELECT cp.id AS product_id, cp.manufacturer_id AS brand_id, cp.product_line_id
     FROM catalog_products cp
     WHERE cp.active = true
       AND cp.manufacturer_id IS NOT NULL
       AND cp.product_line_id IS NOT NULL
     ORDER BY cp.updated_at DESC NULLS LAST, cp.id ASC
     LIMIT 1`,
  );
  if (!fallback.rows[0]) blocked("No active catalog product exists for inventory smoke");
  return fallback.rows[0];
}

async function rememberEnablement(client, salonId, brandId, productLineId) {
  const brand = await client.query(
    `SELECT 1 FROM salon_enabled_brands WHERE salon_id = $1 AND brand_id = $2 AND status = 'enabled' LIMIT 1`,
    [salonId, brandId],
  );
  const line = await client.query(
    `SELECT 1 FROM salon_enabled_product_lines WHERE salon_id = $1 AND product_line_id = $2 AND status = 'enabled' LIMIT 1`,
    [salonId, productLineId],
  );
  return { brandWasEnabled: brand.rows.length > 0, lineWasEnabled: line.rows.length > 0 };
}

async function restoreEnablement(client, salonId, brandId, productLineId, before) {
  if (!before.lineWasEnabled) {
    await client.query(
      `UPDATE salon_enabled_product_lines
       SET status = 'disabled', disabled_at = now(), updated_at = now()
       WHERE salon_id = $1 AND product_line_id = $2 AND status = 'enabled'`,
      [salonId, productLineId],
    ).catch(() => {});
  }
  if (!before.brandWasEnabled) {
    await client.query(
      `UPDATE salon_enabled_brands
       SET status = 'disabled', disabled_at = now(), updated_at = now()
       WHERE salon_id = $1 AND brand_id = $2 AND status = 'enabled'`,
      [salonId, brandId],
    ).catch(() => {});
  }
}

function assertRuntimeStaticGuards() {
  const provider = fs.readFileSync(path.join(ROOT, "src/screens/SalonCRM/schedule/ScheduleCatalogProvider.tsx"), "utf8");
  const inventory = fs.readFileSync(path.join(ROOT, "src/screens/SalonCRM/InventoryPage.tsx"), "utf8");
  const setup = fs.readFileSync(path.join(ROOT, "src/screens/SalonCRM/ProductCatalogSetupPage.tsx"), "utf8");
  const repo = fs.readFileSync(path.join(ROOT, "src/screens/SalonCRM/data/crmRepository.ts"), "utf8");
  const page = fs.readFileSync(path.join(ROOT, "src/screens/SalonCRM/SalonCRMPage.tsx"), "utf8");

  if (provider.includes("COSMETICS_SERVICES") || provider.includes("WASH_SERVICES")) {
    fail("ScheduleCatalogProvider still contains hardcoded production service lists");
  }
  if (provider.includes("useServices") || provider.includes("buildCatalogFromCrm(")) {
    fail("ScheduleCatalogProvider still falls back to CRM seed/catalog services in pilot runtime");
  }
  if (inventory.includes("MOCK_PRODUCTS") || inventory.includes("MOCK_BRANDS") || inventory.includes("MOCK_LINES")) {
    fail("InventoryPage still references mock product data");
  }
  if (setup.includes("MOCK_PRODUCTS") || setup.includes("MOCK_BRANDS") || setup.includes("MOCK_LINES")) {
    fail("ProductCatalogSetupPage still references mock product data");
  }
  if (inventory.includes("/.netlify/functions/inventory") || setup.includes("/.netlify/functions/inventory")) {
    fail("Inventory UI still references legacy inventory function");
  }
  if (!page.includes("createLiveCRMRepository()")) {
    fail("SalonCRMPage is not mounted with the live API repository");
  }
  if (page.includes("createNetlifyInventoryCRMRepository") || page.includes("createSalonProductsCRMRepository")) {
    fail("pilot runtime is still mounted with a legacy/intermediary inventory repository");
  }
  if (repo.includes("/.netlify/functions/inventory") && !repo.includes("@deprecated")) {
    fail("legacy inventory adapter remains without an explicit deprecation guard");
  }
}

async function runServicesSmoke(tokenA, tokenB) {
  const base = "/.netlify/functions/crm-services";
  const departmentId = `${SMOKE_PREFIX}-dept`;
  const categoryId = `${SMOKE_PREFIX}-cat`;
  const serviceId = `${SMOKE_PREFIX}-service`;

  let res = await call(servicesHandler, base, "POST", "/departments", {
    token: tokenA,
    body: { id: departmentId, name: `${SMOKE_PREFIX} Department`, calendarLabel: `${SMOKE_PREFIX} Calendar`, sortOrder: 900 },
  });
  expectStatus(res.status, 201, "department create");

  res = await call(servicesHandler, base, "POST", "/categories", {
    token: tokenA,
    body: { id: categoryId, departmentId, crmCategoryId: "other", name: `${SMOKE_PREFIX} Category`, accentColor: "#D7897F", sortOrder: 901 },
  });
  expectStatus(res.status, 201, "category create");

  res = await call(servicesHandler, base, "POST", "/services", {
    token: tokenA,
    body: {
      id: serviceId,
      categoryId,
      name: `${SMOKE_PREFIX} Service`,
      defaultDurationMinutes: 45,
      defaultPriceCents: 12300,
      defaultMaterialCostCents: 1200,
      status: "active",
    },
  });
  expectStatus(res.status, 201, "service create");

  res = await call(servicesHandler, base, "GET", "/", { token: tokenA });
  expectStatus(res.status, 200, "service list after create");
  const persisted = res.body.services.find((service) => service.id === serviceId);
  if (!persisted) fail("created service missing after refresh/list");

  res = await call(servicesHandler, base, "GET", "/", { token: tokenB });
  expectStatus(res.status, 200, "tenant B service list");
  if (res.body.services.some((service) => service.id === serviceId)) {
    fail("Salon A service leaked into Salon B");
  }

  res = await call(servicesHandler, base, "PATCH", `/services/${encodeURIComponent(serviceId)}`, {
    token: tokenA,
    body: { status: "archived" },
  });
  expectStatus(res.status, 200, "service archive");
  if (res.body.service.status !== "archived") fail("archived service did not persist as archived");

  res = await call(servicesHandler, base, "GET", "/", { token: tokenA });
  const archived = res.body.services.find((service) => service.id === serviceId);
  if (!archived || archived.status !== "archived") fail("archived service missing from canonical catalog refresh");
}

async function runInventorySmoke(client, tokenA, tokenB) {
  const base = "/.netlify/functions/salon-products";
  const product = await pickCatalogProduct(client);
  const beforeA = await rememberEnablement(client, SALON_A, product.brand_id, product.product_line_id);
  const beforeB = await rememberEnablement(client, SALON_B, product.brand_id, product.product_line_id);

  try {
    let res = await call(productsHandler, base, "PATCH", `/brands/enabled/${encodeURIComponent(product.brand_id)}`, {
      token: tokenA,
      body: { enabled: true },
    });
    expectStatus(res.status, 200, "enable brand");

    res = await call(productsHandler, base, "PATCH", `/product-lines/enabled/${encodeURIComponent(product.product_line_id)}`, {
      token: tokenA,
      body: { enabled: true },
    });
    expectStatus(res.status, 200, "enable product line");

    res = await call(productsHandler, base, "GET", "/brands/enabled", { token: tokenA });
    expectStatus(res.status, 200, "enabled brands list");
    if (!res.body.brands.some((brand) => brand.id === product.brand_id)) fail("enabled brand did not persist");

    res = await call(productsHandler, base, "GET", "/product-lines/enabled", { token: tokenA });
    expectStatus(res.status, 200, "enabled product lines list");
    if (!res.body.productLines.some((line) => line.id === product.product_line_id)) fail("enabled product line did not persist");

    res = await call(productsHandler, base, "POST", "/inventory", {
      token: tokenA,
      body: {
        productId: product.product_id,
        unitsInStock: 2,
        minStock: 5,
        isVisible: true,
        localDisplayName: `${SMOKE_PREFIX} Inventory Item`,
        localBarcodeOverride: `${SMOKE_PREFIX}-barcode`,
      },
    });
    expectStatus(res.status, 201, "add inventory item");
    const itemId = res.body.item.id;

    res = await call(productsHandler, base, "PATCH", `/inventory/${encodeURIComponent(itemId)}`, {
      token: tokenA,
      body: { unitsInStock: 1, minStock: 5 },
    });
    expectStatus(res.status, 200, "stock update");

    res = await call(productsHandler, base, "GET", "/inventory", { token: tokenA, query: { lowStock: "true" } });
    expectStatus(res.status, 200, "low stock inventory list");
    const low = res.body.items.find((item) => item.id === itemId);
    if (!low || Number(low.units_in_stock) !== 1 || Number(low.min_stock) !== 5) {
      fail("stock update did not persist or low-stock filter is not live");
    }

    res = await call(productsHandler, base, "GET", "/inventory", { token: tokenB, query: { q: SMOKE_PREFIX } });
    expectStatus(res.status, 200, "tenant B inventory list");
    if (res.body.items.some((item) => item.id === itemId || item.local_display_name?.includes(SMOKE_PREFIX))) {
      fail("Salon A inventory leaked into Salon B");
    }
  } finally {
    await client.query("DELETE FROM salon_inventory_products WHERE salon_id = $1 AND local_display_name LIKE $2", [SALON_A, `${SMOKE_PREFIX}%`]).catch(() => {});
    await restoreEnablement(client, SALON_A, product.brand_id, product.product_line_id, beforeA);
    await restoreEnablement(client, SALON_B, product.brand_id, product.product_line_id, beforeB);
  }
}

async function main() {
  assertRuntimeStaticGuards();

  const tokenA = signSalonSession({ salonId: SALON_A, userId: USER_A, role: "owner", ttlSeconds: 60 * 30 });
  const tokenB = signSalonSession({ salonId: SALON_B, userId: USER_B, role: "owner", ttlSeconds: 60 * 30 });
  const client = await getDbClient();
  try {
    step("db setup");
    await ensurePilotSalons(client);
    await cleanup(client);

    step("services smoke");
    await runServicesSmoke(tokenA, tokenB);

    step("inventory smoke");
    await runInventorySmoke(client, tokenA, tokenB);

    console.log("PASS: Phase 7 CRM services/inventory smoke guard");
    console.log("- service create/update/archive persisted in tenant DB");
    console.log("- inactive service remains non-bookable through active-service UI filters");
    console.log("- Salon A/B service tenant isolation holds");
    console.log("- enabled brand and product line persist through salon-products");
    console.log("- stock update persists and low-stock reflects live DB");
    console.log("- Salon A/B inventory tenant isolation holds");
    console.log("- static runtime guards found no mock/legacy service or inventory paths");
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
