# Phase 8.5-8.11 Agent Implementation Briefs

**Status**: Planning (no implementation started)
**Source plan**: `.cursor/plans/post_phase_8_plan_0e43d160.plan.md`
**API contract authority**: `docs/crm-pilot-api-contract.md`

This document is the read-only brief for every implementation agent working on
Phases 8.5-8.11. It defines ownership boundaries, the files each agent may
touch, and the hard rules that keep the system one connected source of truth.
No agent starts coding until the parent integration owner opens a slice.

---

## 0. Non-Negotiable Ground Rules (all agents)

- Do not onboard a real customer during Phases 8.5-8.11.
- Production DB stays `customer-pilot-crm`. No production data mutations during
  planning or implementation reviews.
- Build into existing CRM routes/components. Do not create a second inventory
  page, a second services page, a second calendar, or a `/crm/pos` shell.
- Every table, query, and API path is tenant-scoped by `salon_id` derived from
  `resolveSalonContext(event)` (see `netlify/functions/_salon-context.js`).
  The client never sends `salonId`, `salon_id`, or `x-salon-id`.
- Historical records (appointments, checkout lines) are immutable snapshots.
  Never recompute old records from mutable service/catalog settings.
- All new endpoints use the shared envelope from `docs/crm-pilot-api-contract.md`:
  `{ ok, data, meta }` / `{ ok, error: { code, message, details } }`.
- DB columns stay `snake_case`; API request/response bodies use `camelCase`.
- Migrations are additive only during the pilot (`ADD COLUMN IF NOT EXISTS`,
  `CREATE TABLE IF NOT EXISTS`). No destructive drops.
- No mock/seed/demo business data enters runtime. `AnalyticsMockData`,
  `DEFAULT_CRM_SEED`, and `SeedCRMRepository` stay out of pilot runtime.
- Run the smoke gates (Phase 5/6/7/8 + new slice smoke) after each slice.

---

## 1. Roles and Ownership

### Parent Integration Owner (GPT, Cursor) — me

Responsibilities:

- Owns architecture consistency and the source-of-truth boundaries between
  appointment (operational), checkout (sales), and payment (money).
- Sequences work by dependency: DB contracts -> shared clients/hooks -> UI ->
  smoke/deploy.
- Reviews every schema and API contract change against
  `docs/crm-pilot-api-contract.md` and the contracts in this folder.
- Merges heavy-agent branches, prevents duplicate screens/buttons, resolves
  cross-domain conflicts.
- Retains final decisions on: source-of-truth boundaries, appointment/checkout
  snapshots, payment semantics, VAT semantics, recurring-expense model,
  autosave concurrency, analytics date semantics.

Does not delegate: the four architecture decisions flagged for approval
(snapshot strategy, appointment/checkout/payment separation, split-service
stage model, inventory 32K-product listing without per-salon row explosion).

### Agent A — Onboarding + Inventory (Claude 4.8, heavy)

Owns:

- `scripts/create-clean-pilot-salon.js`
- future `netlify/functions/crm-onboarding.js`
- `src/screens/SalonCRM/ProductCatalogSetupPage.tsx`
- `src/screens/SalonCRM/InventoryPage.tsx`
- `src/screens/SalonCRM/inventoryAdapters.ts`
- `netlify/functions/salon-products.js`
- `src/screens/SalonCRM/data/salonProductsApi.ts`
- new shared hook `useDebouncedAutosaveMap` (location under `src/screens/SalonCRM/data/` or `src/hooks/`)

Must not: create a second inventory screen or duplicate the catalog setup flow.

### Agent B — Services + Split Calendar (Claude 4.8, heavy)

Owns:

- `src/screens/SalonCRM/schedule/ScheduleCatalogProvider.tsx`
- `src/screens/SalonCRM/schedule/ScheduleSettingsTab.tsx`
- `src/screens/SalonCRM/schedule/ServiceWorkflowEditor.tsx`
- `src/screens/SalonCRM/schedule/AppointmentComposerModal.tsx`
- `src/screens/SalonCRM/SchedulePage.tsx`
- `netlify/functions/salon-appointments.js`
- `netlify/functions/crm-services.js`
- `src/screens/SalonCRM/data/crmServicesApi.ts`

Must not: create a generic workflow engine or a separate services route unless
Founder QA proves the settings tab is insufficient.

### Agent C — Checkout + Finance Foundation (Claude 4.8, heavy)

Owns:

- new migrations `036`, `037` (checkout/payments/audit, expenses/VAT)
- new `netlify/functions/salon-checkouts.js`
- new `netlify/functions/salon-finance.js` (or split `salon-expenses.js` + `salon-settings.js`)
- checkout drawer components under `src/screens/SalonCRM/checkout/` (new folder)
- checkout entry points inside existing calendar appointment actions

Must not: count appointments as revenue, integrate a payment gateway, or build
refunds/accounting.

### Agent D — Analytics + Profitability UI (Claude 4.6)

Owns:

- new `netlify/functions/salon-analytics.js`
- `src/screens/SalonCRM/AnalyticsPage.tsx` (expand, do not replace live-only page)
- analytics client under `src/screens/SalonCRM/data/`

Starts only after checkout/expense source tables exist. Must not reintroduce
mock analytics data.

### Agent E — Guards + QA + Regression (Claude 4.6)

Owns:

- `scripts/smoke-crm-phase8_5.js` and later slice smokes
- SQL guard queries and tenant-isolation checks
- autosave race-condition tests, checkout integrity tests
- Founder QA checklist artifact
- Phase 5/6/7/8 regression preservation

Must not: modify product code paths; only add guards/tests.

---

## 2. Integration Rules

- Heavy agents produce isolated, domain-scoped branches/patches.
- Parent integrates strictly in dependency order (see plan section
  "Dependency-Based Implementation Order").
- Contract-first: no UI work merges before its DB migration and API contract
  are approved in this folder.
- Shared surfaces (`crmHooks.ts`, `crmRepository.ts`, `CRMDataProvider.tsx`)
  are integration-owner controlled. Heavy agents propose diffs; the owner
  merges to avoid conflicting edits.
- Any new nav item must be justified against `SalonCRMPage.tsx` nav to avoid
  duplicate entry points.

---

## 3. Shared Contracts All Agents Depend On

- Envelope + status codes + tenant rules: `docs/crm-pilot-api-contract.md`.
- Onboarding + inventory autosave: `01-phase-8.5-onboarding-inventory-contract.md`.
- UI reuse map (no duplicate screens): `02-phase-8.5-ui-reuse-map.md`.
- Service stage + appointment snapshot: `03-phase-8.6-8.7-service-appointment-contract.md`.
- Checkout/payment/VAT/material/expense boundaries: `04-phase-8.8-8.10-finance-source-of-truth.md`.
- Founder QA + smoke gates: `05-founder-qa-and-smoke-gates.md`.

---

## 4. Definition of Done per Slice

1. Migration is additive and idempotent; applied to `customer-pilot-crm` only
   after review.
2. API matches the contract doc (envelope, status, tenant checks, validation).
3. UI reuses the mapped existing component; no duplicate screen/button.
4. Slice smoke passes locally and against the deployed function.
5. Phase 5/6/7/8 regression smokes still pass.
6. No mock/seed/demo business data reachable in runtime.
7. Parent integration owner sign-off recorded in the slice PR description.
