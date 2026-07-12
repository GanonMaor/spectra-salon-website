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
  const setupPage = read("src/screens/SalonCRM/FirstRunSetupPage.tsx");
  const salonPage = read("src/screens/SalonCRM/SalonCRMPage.tsx");
  const salonsFn = read("netlify/functions/crm-salons.js");
  const repository = read("src/screens/SalonCRM/data/crmRepository.ts");
  assertIncludes(router, "path=\"/crm/setup\"", "First Run Setup route must exist outside the CRM shell");
  assertIncludes(router, "<SalonCRMProviders>", "First Run Setup route must reuse live CRM providers");
  assertIncludes(loginPage, "return \"/crm/setup\"", "login default redirect must land on First Run Setup");
  assertIncludes(salonPage, "return <Navigate to=\"/crm/setup\" replace />", "operational CRM routes must redirect before rendering the CRM shell");
  assertNotIncludes(salonPage, "navigate(\"/crm/setup\"", "operational CRM onboarding guard must not rely on post-render navigation");
  assertNotIncludes(salonPage, "Lina Cohen", "CRM shell must not show a hardcoded owner name");
  assertNotIncludes(salonPage, "images.unsplash.com/photo-1508214751196-bcfd4ca60f91", "CRM shell must not show a hardcoded owner photo");
  assertIncludes(setupPage, "Step ${stepIndex + 1} of ${STEPS.length}", "wizard must show Step X of 7 progress");
  assertIncludes(setupPage, "updateSalonProfile", "wizard must persist salon/onboarding state through live salon API");
  assertIncludes(setupPage, "createCrmDepartment", "wizard must reuse live services API for departments");
  assertIncludes(setupPage, "createCrmService", "wizard must reuse live services API for services");
  assertIncludes(setupPage, "listCatalogBrands", "wizard must reuse live catalog brand API");
  assertIncludes(setupPage, "setProductLineEnabled", "wizard must reuse live product-line API");
  assertIncludes(setupPage, "actions.createStaff", "wizard must reuse CRM action layer for staff");
  assertIncludes(setupPage, "Preparing your salon", "setup wizard must show a meaningful loading state");
  assertIncludes(setupPage, "crmContext.error", "setup wizard must not spin forever when bootstrap fails");
  assertIncludes(repository, "this.fetchImpl = options.fetchImpl ?? defaultFetch()", "ApiCRMRepository must bind window.fetch through defaultFetch");
  assertIncludes(salonsFn, "TENANT_FIELD_FORBIDDEN", "crm-salons PATCH must reject client-supplied tenant fields");
  assertNotIncludes(homePage, "Start salon setup", "operational CRM Home must not contain first-run setup CTA");
  assertNotIncludes(setupPage, "AIInsightsCarousel", "setup wizard must not import dashboard widgets");
  assertNotIncludes(setupPage, "MembershipTokenBarrel", "setup wizard must not import dashboard widgets");
  assertNotIncludes(setupPage, "UpNextSection", "setup wizard must not import dashboard widgets");
  assertNotIncludes(setupPage, "LiveClientsSection", "setup wizard must not import dashboard widgets");
  assertNotIncludes(router, "path=\"pos\"", "Phase 8.5 must not add POS route");
  assertNotIncludes(router, "path=\"checkout\"", "Phase 8.5 must not add checkout route");
  assertNotIncludes(router, "path=\"expenses\"", "Phase 8.5 must not add expenses route");
  assertNotIncludes(router, "ServicesPage", "Phase 8.5 must not add duplicate services page");

  step("phase 8.5 first appointment readiness");
  const compositionUtils = read("src/screens/SalonCRM/schedule/appointmentCompositionUtils.ts");
  assertIncludes(compositionUtils, "service.defaultStages.length > 0", "appointment composer must handle DB services that have no default stages");
  assertIncludes(compositionUtils, "segments.length === 0 && primary", "appointment payload must not save a service without at least one segment");
  assertIncludes(compositionUtils, "end = segEnd", "fallback appointment segment must also extend appointment end time");

  step("phase 8.5 analytics cleanliness");
  // The Salon Performance dashboard is restored at /crm/analytics, but only in a
  // live-only form. The router must not import mock analytics, and none of the
  // runtime analytics files may import mock/seed data.
  assertNotIncludes(router, "AnalyticsMockData", "mock analytics must not be imported by runtime router");
  assertIncludes(router, "path=\"analytics\" element={<SalonPerformanceDashboard embedded />}", "/crm/analytics must render the restored live dashboard");
  const runtimeAnalyticsFiles = [
    "src/screens/SalonPerformanceDashboard/SalonPerformanceDashboard.tsx",
    "src/screens/SalonPerformanceDashboard/liveAnalyticsAdapter.ts",
    "src/screens/SalonPerformanceDashboard/analyticsDateRange.ts",
    "src/screens/SalonPerformanceDashboard/reports/DashboardReport.tsx",
    "src/screens/SalonPerformanceDashboard/reports/StaffPerformanceReport.tsx",
    "src/screens/SalonPerformanceDashboard/reports/ServicesReport.tsx",
    "src/screens/SalonPerformanceDashboard/reports/ProductUsageReport.tsx",
    "src/screens/SalonPerformanceDashboard/reports/SalesReport.tsx",
    "src/screens/SalonPerformanceDashboard/reports/ExpensesReport.tsx",
    "src/screens/SalonPerformanceDashboard/reports/LiveKpiStrip.tsx",
  ];
  for (const relPath of runtimeAnalyticsFiles) {
    const source = read(relPath);
    assertNotIncludes(source, "AnalyticsMockData", `runtime analytics file must not import mock data: ${relPath}`);
    assertNotIncludes(source, "DEFAULT_CRM_SEED", `runtime analytics file must not import seed data: ${relPath}`);
  }
  const liveAdapter = read("src/screens/SalonPerformanceDashboard/liveAnalyticsAdapter.ts");
  assertIncludes(liveAdapter, "crmHooks", "live analytics adapter must read from canonical CRM hooks");
  assertIncludes(liveAdapter, "hasCheckoutData: false", "analytics must not claim confirmed revenue before checkout exists");

  step("phase 8.5 onboarding modes");
  const onboardingScript = read("scripts/create-clean-pilot-salon.js");
  assertIncludes(onboardingScript, "setupMode", "clean onboarding script must expose setup mode");
  assertIncludes(onboardingScript, "\"empty\", \"minimal\"", "clean onboarding script must support empty and minimal modes");
  assertIncludes(onboardingScript, "initialServices: config.setupMode === \"minimal\"", "empty mode must not create starter services");
  assertIncludes(onboardingScript, "initialStaff: config.setupMode === \"minimal\" && config.includeOwnerStylist", "owner stylist must be optional");
  assertIncludes(onboardingScript, "onboarding_status = 'incomplete'", "clean onboarding script must reset first-run wizard state");
  assertIncludes(onboardingScript, "intentionallyEmpty", "onboarding must keep business data empty");

  console.log("PASS: Phase 8.5 inventory/autosave static smoke passed.");
}

try {
  main();
} catch (err) {
  console.error(`FAIL: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
}
