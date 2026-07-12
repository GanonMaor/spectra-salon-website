# Phases 8.5-8.11 Implementation Contracts

**Status**: Planning contracts (no product code, migrations, or production
changes yet). These documents operationalize
`.cursor/plans/post_phase_8_plan_0e43d160.plan.md` and must be approved before
any slice is implemented.

Authority: `docs/crm-pilot-api-contract.md` (envelope, status codes, tenant and
soft-delete rules) governs all API work referenced here.

## Documents

| # | File | Covers | Todo |
|---|------|--------|------|
| 00 | `00-agent-briefs.md` | Read-only implementation briefs, agent ownership, integration rules, per-slice DoD | agent-context-map |
| 01 | `01-phase-8.5-onboarding-inventory-contract.md` | Onboarding modes, brand/line enablement, catalog-first inventory, autosave upsert + shared debounce hook | phase85-schema-contract |
| 02 | `02-phase-8.5-ui-reuse-map.md` | Existing route/nav map; capability→screen reuse; anti-duplication | phase85-ui-reuse |
| 03 | `03-phase-8.6-8.7-service-appointment-contract.md` | Split-service stage model, appointment/segment snapshots, calendar lifecycle + state machine | phase86-87-contract |
| 04 | `04-phase-8.8-8.10-finance-source-of-truth.md` | Checkout/payment/VAT/material/expense boundaries, schema, formulas, date semantics | phase88-90-finance-contract |
| 05 | `05-founder-qa-and-smoke-gates.md` | Per-slice smoke gates, specialized tests, Founder QA, regression preservation | qa-smoke-plan |

## Four architecture decisions requiring sign-off before Phase 8.5 code

1. Service snapshotting inside appointment/checkout — doc 03 §3, doc 04 §3.
2. Appointment / checkout / payment separation — doc 04 §2.
3. Split-service stage model (no workflow engine) — doc 03 §2.
4. Inventory listing of 32K+ products without per-salon row explosion —
   doc 01 §1 + §4.

## Required Contract Amendments Accepted

- Debt is not a payment method. Valid pilot payment methods are
  `credit_card`, `cash`, `cheque`, `bank_transfer`, and `other`. Debt is an
  outstanding balance/receivable state on the checkout, not a payment row.
- Appointment payment status is not a second financial source of truth. Calendar
  badges derive from the linked active checkout whenever practical; any
  appointment-level payment status cache is display-only, transactionally
  synchronized, and never independently editable.
- Financial calculations are server-authoritative. The client may send source
  inputs only; the server calculates VAT, net before VAT, line totals, checkout
  totals, paid amount, outstanding amount, and payment status with integer-cent
  arithmetic.
- Appointment completion and checkout confirmation are separate events.
  Completed appointments can exist without confirmed checkout or revenue.
- Category identity fix, stable appointment segment IDs, and server-side overlap
  enforcement are explicit gates before dependent service/calendar/checkout
  features.
- Mock analytics restoration is permanently rejected: do not restore
  `SalonPerformanceDashboard`, `AnalyticsMockData`, flat 18%/62% proxies,
  scheduled appointment revenue, or fake revenue/profitability charts.

## Recommended first slice (Phase 8.5)

Onboarding setup mode + brand/product-line enablement + automatic runtime
inventory listing + inline stock/min editing + debounced autosave + clean
validation. No real customer onboarding. See doc 01 for the full contract.

Expected Phase 8.5 product files:

- `netlify/functions/salon-products.js`
- `src/screens/SalonCRM/data/salonProductsApi.ts`
- `src/screens/SalonCRM/InventoryPage.tsx`
- `src/screens/SalonCRM/ProductCatalogSetupPage.tsx`
- a new shared autosave hook under `src/screens/SalonCRM/data/` or `src/hooks/`
- optional onboarding UI under `src/screens/SalonCRM/OnboardingPage.tsx` only if
  the home empty-state cannot host the flow cleanly
- `scripts/smoke-crm-phase8_5.js`
- relevant tests under existing CRM/data or function test folders

Expected Phase 8.5 migration:

- Prefer none if onboarding readiness can be inferred from existing counts.
- If explicit onboarding state is required, add only
  `salons.onboarding_completed_at` and/or optional `salon_onboarding_runs`.
- No appointment schema, checkout schema, payment schema, VAT settings,
  expenses, profitability, or analytics schema in Phase 8.5.

Phase 8.5 can be completed without touching appointment or finance schema.

## Hard boundaries (all docs)

- Production DB stays `customer-pilot-crm`; no production mutations during
  planning.
- No real customer onboarding until pilot lock (doc 05 §7).
- Additive, idempotent migrations only.
- No mock/seed/demo business data in runtime.
- Build into existing CRM screens; new routes limited to onboarding (maybe) and
  expenses (doc 02 §3).
