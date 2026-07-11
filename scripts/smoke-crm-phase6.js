#!/usr/bin/env node
/**
 * Phase 6 CRM mutation wiring smoke guard.
 *
 * This complements Phase 4/5 API smokes by checking the frontend mutation
 * wiring: UI actions must call the live repository first, then dispatch the
 * canonical server object. It intentionally avoids browser automation so it can
 * run quickly before deployment.
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

function expectIncludes(content, needle, label) {
  if (!content.includes(needle)) fail(`${label}: missing ${needle}`);
}

function expectNotIncludes(content, needle, label) {
  if (content.includes(needle)) fail(`${label}: still contains ${needle}`);
}

function expectRegex(content, pattern, label) {
  if (!pattern.test(content)) fail(`${label}: pattern not found (${pattern})`);
}

function main() {
  const provider = read("src/screens/SalonCRM/data/CRMDataProvider.tsx");
  const hooks = read("src/screens/SalonCRM/data/crmHooks.ts");
  const repository = read("src/screens/SalonCRM/data/crmRepository.ts");
  const schedule = read("src/screens/SalonCRM/calendar/useSchedule.ts");
  const customers = read("src/screens/SalonCRM/CustomersPage.tsx");
  const staff = read("src/screens/SalonCRM/StaffPage.tsx");
  const schedulePage = read("src/screens/SalonCRM/SchedulePage.tsx");
  const composer = read("src/screens/SalonCRM/schedule/AppointmentComposerModal.tsx");

  expectIncludes(provider, "repository: CRMRepository", "provider context");
  expectIncludes(provider, "repository,", "provider value");
  expectIncludes(provider, 'repository.persistedStatePolicy === "none" ? null : readPersistedCRMState()', "live no localStorage read");
  expectIncludes(provider, 'if (repository.persistedStatePolicy === "none") return;', "live no localStorage write");

  for (const method of [
    "createAppointment",
    "updateAppointment",
    "deleteAppointment",
    "createCustomer",
    "updateCustomer",
    "archiveCustomer",
    "createStaff",
    "updateStaff",
    "archiveStaff",
  ]) {
    expectIncludes(repository, `${method}(`, `repository ${method}`);
    expectIncludes(hooks, `repository.${method}(`, `actions ${method}`);
  }

  expectNotIncludes(hooks, "buildAppointment(", "appointment live mutation actions");
  expectNotIncludes(hooks, "buildAppointmentPatch(", "appointment live mutation actions");
  expectIncludes(repository, "supportsLiveWrites = true as const", "live repository write capability");
  expectIncludes(hooks, "if (repository.supportsLiveWrites)", "live write gate");

  expectIncludes(repository, "sanitizeTenantScopedPayload(input)", "tenant-scoped payload sanitizer");
  expectNotIncludes(repository, "headers: { \"x-salon-id\"", "live repository headers");

  expectIncludes(schedule, "await actions.createAppointment", "schedule create awaits API");
  expectIncludes(schedule, "await actions.updateAppointment", "schedule update awaits API");
  expectIncludes(schedule, "await actions.deleteAppointment", "schedule delete awaits API");
  expectIncludes(schedule, "usingMock: false", "schedule live source flag");

  expectRegex(customers, /onSave: .*Promise<boolean>/, "customer modal waits for save result");
  expectIncludes(customers, "await actions.createCustomer", "customer create awaits API");
  expectIncludes(customers, "await actions.updateCustomer", "customer update awaits API");
  expectIncludes(customers, "await actions.archiveCustomer", "customer archive awaits API");
  expectIncludes(customers, "if (saved)", "customer modal closes only after success");

  expectIncludes(staff, "await actions.createStaff", "staff create awaits API");
  expectIncludes(staff, "await actions.updateStaff", "staff update awaits API");
  expectIncludes(staff, "await actions.archiveStaff", "staff archive awaits API");
  expectIncludes(staff, "workingHours:", "staff workingHours sent to API");
  expectIncludes(staff, "servicePriceOverrides", "staff price overrides sent to API");

  expectIncludes(schedulePage, "void saveAppointment(updated)", "drag/drop save is routed through API");
  expectIncludes(schedulePage, "void deleteAppointment(id)", "calendar delete is routed through API");
  expectIncludes(composer, "await crmActions.createCustomer", "composer customer create awaits API");

  console.log("PASS: Phase 6 CRM mutation wiring smoke guard");
  console.log("- CRMDataProvider exposes repository to actions");
  console.log("- Customers, staff, and appointments call repository before dispatch");
  console.log("- UI callers await live mutations and surface failures");
  console.log("- live runtime still skips localStorage business state");
  console.log("- tenant ids are sanitized from mutation payloads");
}

main();
