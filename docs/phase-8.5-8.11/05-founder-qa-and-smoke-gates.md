# Phase 8.5-8.11 Founder QA + Smoke / Regression Gates

**Status**: Planning
**Owner**: Agent E (Guards + QA), enforced by parent owner at each slice
**Existing smokes**: `scripts/smoke-crm-phase4.js`, `phase5`, `phase6`,
`phase7`, `phase8` (npm: `smoke:crm:phase6/7/8`; 4/5 run via `node`).

Every implementation slice must pass its own new smoke plus all prior
regression smokes before it is considered done. No slice merges on red.

---

## 1. Gate Model (per slice)

Each slice has four gates, in order:

1. **Static gate** — new `scripts/smoke-crm-phaseX.js` static checks: no mock/
   seed data reachable, no duplicate screens/routes, contract shapes present.
2. **Local live gate** — run new slice smoke against the DB (temporary clean
   salon shell, created and torn down), asserting tenant isolation and
   canonical persistence.
3. **Deployed gate** — HTTP smoke against `salonos.ai/.netlify/functions/*`
   with a temporary tenant, torn down after.
4. **Regression gate** — Phase 4/5/6/7/8 smokes still pass.

A slice is "done" only when all four are green and the parent owner records
sign-off in the slice PR.

---

## 2. Per-Slice Smoke Scripts (to add)

| Slice | Script | Key assertions |
|-------|--------|----------------|
| 8.5 onboarding + inventory autosave | `smoke-crm-phase8_5.js` | onboarding creates only structural entities; `catalog-stock` lists enabled scope; autosave upsert keyed by productId; no overlay row for untouched products; stale-response protection; tenant isolation |
| 8.6 services + split stages | `smoke-crm-phase8_6.js` | services CRUD in Schedule Settings only (no new route); `default_stages` validation; regular vs split derivation; no workflow-engine tables |
| 8.7 calendar lifecycle | `smoke-crm-phase8_7.js` | status enum extended (scheduled/arrived/waiting); segment snapshots frozen; completed appointment stays in calendar; waiting stage releases staff; invalid drag rejected 409 |
| 8.8 checkout/POS | `smoke-crm-phase8_8.js` | no `/crm/pos` route; one active checkout per appointment (dup index); appointments not counted as revenue; confirm idempotent; impossible payment states rejected |
| 8.9 expenses/VAT/material | `smoke-crm-phase8_9.js` | VAT rate stored per checkout; historical VAT preserved; material cost not double-counted (line vs total); recurring template not counted, only occurrences; unique occurrence index |
| 8.10 analytics/profitability | `smoke-crm-phase8_10.js` | analytics read source-of-truth only; no mock data; honest incomplete states; date basis explicit per report; formulas match doc 04 example |

Each script reuses the temporary-clean-salon + teardown helpers already in
`smoke-crm-phase8.js`, and the envelope parsing helpers (`dataOf`, `metaOf`).

---

## 3. Cross-Cutting Assertions (every slice)

- Tenant isolation: cross-salon IDs return 404; no data leakage.
- No `salonId`/`salon_id`/`x-salon-id` accepted from the client.
- No `DEFAULT_CRM_SEED`, `SeedCRMRepository`, `AnalyticsMockData` reachable in
  runtime (file-walk scan, as in phase8 smoke).
- No `localStorage` restoring/creating business data.
- Envelope + status codes per `docs/crm-pilot-api-contract.md`.
- Migrations applied are additive/idempotent on `customer-pilot-crm`.
- Anti-duplication checklist (doc 02 §4) holds.

---

## 4. Specialized Test Types (map to slices)

| Test type | Where |
|-----------|-------|
| Autosave race-condition (out-of-order responses, version protection) | 8.5 |
| Debounce + navigation-with-unsaved-changes | 8.5 |
| DB constraint tests (status checks, unique indexes) | 8.6/8.7/8.8/8.9 |
| Calendar interaction (drag/resize/stage move rules) | 8.7 |
| Checkout integrity (dup prevention, confirm idempotency) | 8.8 |
| Payment tests (multi-payment, partial, debt, derived status) | 8.8 |
| VAT calculation (include/exclude, historical rate) | 8.9 |
| Material-cost tests (line vs total, no double count) | 8.9 |
| Expense recurrence (template not counted, occurrence uniqueness) | 8.9 |
| Profitability tests (formulas vs doc 04 example) | 8.10 |
| Tenant isolation | all |

---

## 5. Founder QA Checklist (Phase 8.11)

Full-flow acceptance run on a clean salon (empty and minimal modes), covering
the 44-step flow from the plan. Grouped for sign-off:

- Onboarding: clean salon; empty vs template; owner not forced as stylist.
- Structure: edit departments, categories, services; regular + split;
  stage durations + staff availability.
- Inventory: select brands/lines; approved products appear automatically; inline
  stock/min/favorite/visible edit; debounced Saving/Saved/Error feedback.
- People: create staff; create customer.
- Calendar: regular appointment; split appointment; different staff per stage;
  move; resize; waiting releases staff; arrived -> statuses -> completed.
- Checkout: open from calendar; review cart; add/remove/edit lines; material
  cost; payment method; paid; partial; debt; appointment stays in calendar with
  completed + payment indicator.
- Finance: fixed expense; variable expense; VAT config.
- Analytics: overall, service, customer, staff profitability; honest incomplete
  states; mobile + desktop usability.

Corrections allowed during QA (not new scope): wording, flow, hierarchy,
spacing, table usability, visual/loading/error/save states, calendar
interactions, checkout clarity, profitability explanations.

Exit: fix -> re-run affected slice smokes + regression -> lock pilot only after
founder approval. Real customer onboarding happens only after lock.

---

## 6. Regression Preservation (Phases 5-8)

Before every slice merge:

```
node scripts/smoke-crm-phase4.js
node scripts/smoke-crm-phase5.js
npm run smoke:crm:phase6
npm run smoke:crm:phase7
npm run smoke:crm:phase8
```

All must pass. Add new slice smokes to `package.json` as `smoke:crm:phase8_5`
etc. as they are implemented.

---

## 7. Definition of Pilot-Ready

- All slice smokes + regression green locally and deployed.
- Founder QA approved; corrections applied and re-verified.
- No mock/seed/demo business data anywhere in runtime.
- Tenant isolation verified across all new tables.
- Rollback plan documented per slice (additive migrations; revert points).
- Parent owner sign-off recorded.
