#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
let currentStep = "startup";

function step(name) {
  currentStep = name;
}

function fail(message) {
  throw new Error(`${currentStep}: ${message}`);
}

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function assertIncludes(file, needle, message) {
  if (!file.includes(needle)) fail(message);
}

function assertNotIncludes(file, needle, message) {
  if (file.includes(needle)) fail(message);
}

function main() {
  step("phase 8.5 inventory api");
  const productsFn = read("netlify/functions/salon-products.js");
  assertIncludes(productsFn, "resolveSalonContext(event)", "salon-products must derive tenant from session");
  assertIncludes(productsFn, "inventory\" && segments[1] === \"by-product\"", "missing inventory by-product autosave route");
  assertIncludes(productsFn, "TENANT_FIELD_FORBIDDEN", "autosave route must reject client tenant fields");
  assertIncludes(productsFn, "isProductAllowedByEnabledLines", "autosave route must enforce product-line enablement");
  assertIncludes(productsFn, "BRAND_NOT_ENABLED", "autosave route must enforce brand enablement");
  assertIncludes(productsFn, "clientVersion", "autosave route must echo clientVersion for race protection");
  assertNotIncludes(productsFn, "method: 'debt'", "debt must not be encoded as a payment method");
  assertNotIncludes(productsFn, "method = 'debt'", "debt must not be encoded as a payment method");

  step("phase 8.5 typed client");
  const productsApi = read("src/screens/SalonCRM/data/salonProductsApi.ts");
  assertIncludes(productsApi, "upsertSalonInventoryByProduct", "typed client missing inventory autosave upsert");
  assertIncludes(productsApi, "AbortSignal", "autosave client must support request cancellation");
  assertNotIncludes(productsApi, "salonId:", "salonProductsApi must not send salonId in request bodies");

  step("phase 8.5 autosave hook");
  const hook = read("src/screens/SalonCRM/data/useDebouncedAutosaveMap.ts");
  assertIncludes(hook, "SaveContext", "autosave hook should be generic and version-aware");
  assertIncludes(hook, "AbortController", "autosave hook must cancel superseded requests");
  assertIncludes(hook, "version", "autosave hook must protect against stale responses");
  assertIncludes(hook, "\"dirty\" | \"saving\" | \"saved\" | \"error\"", "autosave statuses missing");

  step("phase 8.5 inventory ui");
  const inventoryPage = read("src/screens/SalonCRM/InventoryPage.tsx");
  assertIncludes(inventoryPage, "listCatalogStock", "inventory must use catalog-first runtime listing");
  assertIncludes(inventoryPage, "useDebouncedAutosaveMap", "inventory grid must use debounced autosave");
  assertIncludes(inventoryPage, "upsertSalonInventoryByProduct", "inventory grid must save by product id");
  assertIncludes(inventoryPage, "unitsInStock", "inventory autosave must include units in stock");
  assertIncludes(inventoryPage, "minStock", "inventory autosave must include minimum stock");
  assertIncludes(inventoryPage, "isFavorite", "inventory autosave must include favorite");
  assertIncludes(inventoryPage, "isVisible", "inventory autosave must include visible");
  assertNotIncludes(inventoryPage, "{ id: \"stock-table\"", "legacy manual-save stock table must not be exposed in the pilot tab switcher");
  assertIncludes(inventoryPage, "Legacy manual-save table retained", "legacy table must be clearly isolated if kept");

  step("phase 8.5 no duplicate screens");
  const router = read("src/index.tsx");
  const loginPage = read("src/screens/UserLoginPage.tsx");
  const homePage = read("src/screens/HomeDashboard/HomeDashboardPage.tsx");
  assertIncludes(router, "path=\"home\" element={<HomeDashboardPage />}", "CRM Home route must remain the first-use landing surface");
  assertIncludes(loginPage, "return \"/crm/home\"", "login default redirect must land on CRM Home");
  assertIncludes(homePage, "Start salon setup", "CRM Home must expose a first-use setup action");
  assertIncludes(homePage, "listEnabledBrands", "CRM Home setup progress must read enabled brands from the live API");
  assertIncludes(homePage, "listEnabledProductLines", "CRM Home setup progress must read enabled product lines from the live API");
  assertIncludes(homePage, "/crm/product-catalog-setup", "setup checklist must link to existing catalog setup route");
  assertIncludes(homePage, "/crm/inventory", "setup checklist must link to existing inventory route");
  assertIncludes(homePage, "/crm/staff", "setup checklist must link to existing staff route");
  assertIncludes(homePage, "/crm/customers", "setup checklist must link to existing customers route");
  assertIncludes(homePage, "/crm/schedule?tab=settings", "setup checklist must link to existing schedule settings route");
  assertNotIncludes(router, "path=\"pos\"", "Phase 8.5 must not add POS route");
  assertNotIncludes(router, "path=\"checkout\"", "Phase 8.5 must not add checkout route");
  assertNotIncludes(router, "path=\"expenses\"", "Phase 8.5 must not add expenses route");
  assertNotIncludes(router, "ServicesPage", "Phase 8.5 must not add duplicate services page");

  step("phase 8.5 analytics cleanliness");
  assertNotIncludes(router, "SalonPerformanceDashboard", "legacy mock dashboard must not be restored to runtime route");
  assertNotIncludes(router, "AnalyticsMockData", "mock analytics must not be imported by runtime router");

  step("phase 8.5 onboarding modes");
  const onboardingScript = read("scripts/create-clean-pilot-salon.js");
  assertIncludes(onboardingScript, "setupMode", "clean onboarding script must expose setup mode");
  assertIncludes(onboardingScript, "\"empty\", \"minimal\"", "clean onboarding script must support empty and minimal modes");
  assertIncludes(onboardingScript, "initialServices: config.setupMode === \"minimal\"", "empty mode must not create starter services");
  assertIncludes(onboardingScript, "initialStaff: config.setupMode === \"minimal\" && config.includeOwnerStylist", "owner stylist must be optional");
  assertIncludes(onboardingScript, "intentionallyEmpty", "onboarding must keep business data empty");

  console.log("PASS: Phase 8.5 inventory/autosave static smoke passed.");
}

try {
  main();
} catch (err) {
  console.error(`FAIL: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
}
