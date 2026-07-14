#!/usr/bin/env node
"use strict";

/**
 * Phase 9 — CRM loading-lifecycle static smoke gate.
 *
 * Extends the CRM smoke-gate suite (phase6/7/8/8_5) with static assertions for
 * the "no flashes / no false-empty / no layout jumps" contract from the CRM
 * bootstrap & loading-stability plan. This is a fast, dependency-free guard
 * (no server, no DB) that fails the build if any of the loading-lifecycle
 * invariants regress in source.
 *
 * Run: npm run smoke:crm:phase9
 */

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
  const full = path.join(ROOT, relativePath);
  if (!fs.existsSync(full)) fail(`expected file to exist: ${relativePath}`);
  return fs.readFileSync(full, "utf8");
}

function assertFileExists(relativePath, message) {
  if (!fs.existsSync(path.join(ROOT, relativePath))) fail(message || `missing file: ${relativePath}`);
}

function assertIncludes(file, needle, message) {
  if (!file.includes(needle)) fail(message);
}

function assertNotIncludes(file, needle, message) {
  if (file.includes(needle)) fail(message);
}

function main() {
  // ── Shell gate: real layout is never mounted before bootstrap success ──────
  step("phase 9 shell gate");
  const shell = read("src/screens/SalonCRM/SalonCRMPage.tsx");
  assertIncludes(shell, "createLiveCRMRepository", "shell must mount the live API repository (no seed data in prod)");
  assertIncludes(shell, "shouldUseLocalDemoRepository() ? seedCRMRepository : liveRepository", "seed repo must be local-dev only");
  assertIncludes(shell, "if (!bootstrap) {", "shell must gate on the bootstrap snapshot, not business collections");
  assertIncludes(shell, "bootstrapStatus === \"unauthorized\"", "unauthorized must redirect to login before any shell paint");
  assertIncludes(shell, "<CrmBootScreen error", "first-boot error must render the branded retry boot screen");
  assertIncludes(shell, "bootstrap.onboarding.status === \"incomplete\"", "incomplete onboarding must redirect to setup before shell paint");
  assertIncludes(shell, "return <Navigate to=\"/crm/setup\" replace />", "onboarding redirect must happen before rendering the shell");
  assertIncludes(shell, "clearScopedCRMCache()", "logout must clear the scoped CRM cache before clearing identity");
  // Sidebar navigation is built from the single bootstrap catalog — never a
  // separate crm-services sidebar fetch.
  assertIncludes(shell, "buildCrmNavigation", "sidebar navigation must be built from the memoized navigation model");
  assertIncludes(shell, "bootstrap?.catalog.departments", "sidebar departments must come from the bootstrap catalog");
  assertNotIncludes(shell, "listCrmServicesCatalog", "shell must not run a standalone crm-services fetch for the sidebar");

  // ── Boot screen: branded, content-free, dimensionally stable ──────────────
  step("phase 9 boot screen");
  const boot = read("src/screens/SalonCRM/CrmBootScreen.tsx");
  assertIncludes(boot, "data-testid=\"crm-boot-screen\"", "boot screen must expose a stable test id");
  assertIncludes(boot, "data-variant={error ? \"error\" : \"loading\"}", "boot screen must expose loading/error variants");
  assertIncludes(boot, "motion-reduce:animate-none", "boot screen skeletons must respect reduced motion");
  assertIncludes(boot, "min-h-[320px]", "boot screen card must be fixed-height so loading↔error never resizes");
  // Must never leak business content (salon name, calendars, metrics, nav).
  assertNotIncludes(boot, "useCRMSalon", "boot screen must not read the salon name");
  assertNotIncludes(boot, "useCRMContext", "boot screen must not read CRM business state");
  assertNotIncludes(boot, "buildCrmNavigation", "boot screen must not render business navigation");

  // ── Page gate: pending / error / empty are three distinct states ──────────
  step("phase 9 page gate");
  const gate = read("src/screens/SalonCRM/CrmPageGate.tsx");
  assertIncludes(gate, "useCRMReady", "page gate must read first-hydrate readiness");
  assertIncludes(gate, "data-testid=\"crm-page-error\"", "page gate error surface must be identifiable");
  assertIncludes(gate, "bootstrapStatus === \"error\"", "page gate must show retry on hard error, never an empty page");
  assertIncludes(gate, "motion-reduce:animate-none", "page skeletons must respect reduced motion");

  // ── Provider: explicit state machine + scoped cache + cancellation ────────
  step("phase 9 bootstrap state machine");
  const provider = read("src/screens/SalonCRM/data/CRMDataProvider.tsx");
  assertIncludes(provider, "\"idle\" | \"loading\" | \"success\" | \"error\" | \"unauthorized\"", "provider must expose the explicit bootstrap state machine");
  assertIncludes(provider, "hydrateGenerationRef", "provider must guard against stale hydrate generations");
  assertIncludes(provider, "abortRef.current?.abort()", "provider must abort in-flight hydration on re-scope/unmount");
  assertIncludes(provider, "subscribeSalonSession", "provider must re-hydrate on salon identity changes");
  assertIncludes(provider, "registerSalonCacheCleaner(clearScopedCRMCache)", "provider must drop scoped cache on logout/auth failure");
  assertIncludes(provider, "getSalonScopeKey()", "client cache key must be tenant+user scoped");
  assertIncludes(provider, "parsed.currentSalonId !== expectedSalonId", "persisted cache must be scope-validated before use");
  assertIncludes(provider, "err instanceof CRMBootstrapScopeError", "stale/aborted scope errors must not flash a hard error");
  assertIncludes(provider, "setBootstrapStatus(\"unauthorized\")", "auth failure must transition to unauthorized");

  // ── Repository: scope-safe cold boot, no fake seeds, tenant-safe writes ───
  step("phase 9 repository scope safety");
  const repo = read("src/screens/SalonCRM/data/crmRepository.ts");
  assertIncludes(repo, "class CRMBootstrapScopeError", "repository must model scope errors");
  assertIncludes(repo, "\"stale-session\" | \"tenant-mismatch\" | \"aborted\"", "repository must distinguish stale/mismatch/aborted");
  assertIncludes(repo, "private assertScope", "repository must re-check scope around fetches");
  assertIncludes(repo, "private assertTenant", "repository must reject a mismatched tenant payload");
  assertIncludes(repo, "sanitizeTenantScopedPayload", "repository must strip client tenant fields from write bodies");
  assertIncludes(repo, "sanitizeAuthHeaders", "repository must strip salon id from request headers");
  assertIncludes(repo, "persistedStatePolicy: CRMRepository[\"persistedStatePolicy\"] = \"none\"", "live repo must never merge browser-persisted business state");
  assertIncludes(repo, "export function isSalonAuthError", "repository must classify 401 as an auth error");
  assertIncludes(repo, "isSetupUnavailableError", "repository must classify not-yet-provisioned endpoints");
  // No false-empty: a CORE domain outage rejects the whole boot (retry) instead
  // of masking a broken backend as a "0 everything" salon.
  assertIncludes(repo, "class CRMBootstrapDataError", "repository must model a typed core-domain data error");
  assertIncludes(repo, "failCoreBootstrapDomain", "core domains must fail the boot on setup-unavailable, not empty-coerce");

  // ── Session: fingerprint, scoped cleaners, bearer-only headers ────────────
  step("phase 9 session identity");
  const session = read("src/screens/SalonCRM/data/salonSession.ts");
  assertIncludes(session, "export function getSalonSessionFingerprint", "session must expose an identity fingerprint");
  assertIncludes(session, "export function registerSalonCacheCleaner", "session must let the data layer register scoped cache cleaners");
  assertIncludes(session, "runSalonCacheCleaners();", "logout must run cache cleaners while the outgoing scope is resolvable");
  assertIncludes(session, "deliberately never a salon id", "auth headers must be bearer-only (server owns tenant scoping)");
  assertIncludes(session, "export function handleSalonAuthFailure", "session must centralize 401 handling");

  // ── Pages: truthful pending vs empty vs error (no false zeros) ────────────
  step("phase 9 page-level loading truth");
  const team = read("src/screens/SalonCRM/schedule/settings/TeamSection.tsx");
  assertIncludes(team, "hydrated: crmHydrated", "Team must gate empty state on a successful hydrate");
  assertIncludes(team, "No team members yet", "Team empty state must exist (shown only after hydrate)");
  assertIncludes(team, "Team data could not be loaded", "Team must show a retryable error, never an empty state, on failure");
  assertIncludes(team, "CrmSkeleton", "Team must show a dimensional skeleton while pending");

  const home = read("src/screens/HomeDashboard/HomeDashboardPage.tsx");
  assertIncludes(home, "CrmPageGate", "Home must be wrapped in the page-readiness gate");
  assertIncludes(home, "HomeDashboardSkeleton", "Home must render a dimensional skeleton while pending");

  const analytics = read("src/screens/SalonPerformanceDashboard/SalonPerformanceDashboard.tsx");
  assertIncludes(analytics, "CrmPageGate", "Analytics must be gated on CRM readiness");
  assertIncludes(analytics, "AnalyticsSkeleton", "Analytics must render a dimensional skeleton while pending");

  const inventory = read("src/screens/SalonCRM/InventoryPage.tsx");
  assertIncludes(inventory, "useCRMReady", "Inventory must read CRM readiness to avoid a resource/seed flash");

  // ── Coverage guard: the Phase 4 verification tests must stay present ───────
  step("phase 9 verification coverage present");
  assertFileExists(
    "src/screens/SalonCRM/data/__tests__/crmBootstrapLifecycle.test.ts",
    "cold-boot lifecycle tests must exist",
  );
  assertFileExists(
    "src/screens/SalonCRM/data/__tests__/salonSessionAuth.test.ts",
    "session auth/header tests must exist",
  );
  assertFileExists(
    "src/screens/SalonCRM/data/__tests__/crmRepositoryBootstrap.test.ts",
    "scope-safe bootstrap tests must exist",
  );
  assertFileExists(
    "src/screens/SalonCRM/data/__tests__/crmServicesApiCache.test.ts",
    "scoped catalog cache tests must exist",
  );
  assertFileExists(
    "src/screens/SalonCRM/__tests__/crmShellGate.test.tsx",
    "shell gate tests must exist",
  );
  assertFileExists(
    "src/screens/SalonCRM/__tests__/CrmBootScreen.test.tsx",
    "boot screen tests must exist",
  );
  assertFileExists(
    "src/screens/SalonCRM/__tests__/CrmPageGate.test.tsx",
    "page gate tests must exist",
  );
  assertFileExists(
    "src/screens/SalonCRM/schedule/settings/__tests__/TeamSection.test.tsx",
    "team pending-vs-empty tests must exist",
  );

  console.log("PASS: Phase 9 CRM loading-lifecycle static smoke passed.");
}

try {
  main();
} catch (err) {
  console.error(`FAIL: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
}
