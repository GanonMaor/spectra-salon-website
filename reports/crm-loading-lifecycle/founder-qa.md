# CRM Bootstrap & Loading-Stability — Founder QA / Verification Report

**Scope:** Phase 4 / Generation 4 of the accepted plan `crm-loading-lifecycle`
(verification only). This generation owns **new/updated tests, smoke gates, and
this QA report**. No production logic was changed. Where a test surfaced a
localized defect it is reported below rather than fixed.

**Goal under test:** eliminate CRM flashes, false-empty states, and layout jumps
via an explicit bootstrap state machine, session-scoped hydration, and truthful
per-page loading (skeleton / error / empty) instead of business defaults.

---

## 1. What was added

### Unit / component tests (Jest, jsdom)

| File | Covers |
|---|---|
| `src/screens/SalonCRM/data/__tests__/crmBootstrapLifecycle.test.ts` *(new)* | Live cold-boot: 401 → auth error; core-domain setup-unavailable (404/503) → **rejects** with typed `CRMBootstrapDataError` (no false-empty); genuine 200-empty → legitimate empty (no seed); non-setup 500 propagates; session change during secondary fetches → `stale-session`; no salon id in write body or headers. |
| `src/screens/SalonCRM/data/__tests__/salonSessionAuth.test.ts` *(new)* | Session gates: bearer unlocks `/crm` (token-less prod state does not); bearer-only headers (never a salon id); `canCallSalonRuntimeApi`; 401 on `/crm` clears session once (idempotent); non-401 / non-`/crm` left untouched. |
| `src/screens/SalonCRM/navigation/__tests__/crmNavigationModel.test.ts` *(extended)* | Determinism as a layout-stability proxy: identical inputs → deep-equal model (stable ids/order/keys across refreshes); role/permission/feature params never drop core items; stable department-scoped schedule ids. |

These complement the already-present suites that this generation relies on and
re-verified: `crmRepositoryBootstrap`, `crmServicesApiCache`, `salonSession`,
`crmShellGate`, `CrmBootScreen`, `CrmPageGate`, `TeamSection`.

### Static smoke gate (extends the CRM smoke-gate suite)

- `scripts/smoke-crm-phase9.js` *(new)* + `npm run smoke:crm:phase9`.
  Dependency-free source assertions for the loading-lifecycle invariants:
  shell gates on bootstrap (no fallback salon/calendar), boot screen is
  content-free & reduced-motion, page gate keeps pending/error/empty distinct,
  provider exposes the explicit state machine + scoped cache + cancellation,
  repository is scope-safe with tenant-safe writes and the `CRMBootstrapDataError`
  no-false-empty rule, session is bearer-only, and the verification test files
  stay present.

### Browser smoke (Playwright, deterministic — stubs `crm-bootstrap`)

- `tests/smoke/crm-loading-lifecycle.spec.ts` *(new)*. Injects a synthetic
  authenticated session and routes `crm-bootstrap` to control timing/status, so
  it exercises the real boot gate → shell → page gates without a live DB:
  1. hard refresh shows the branded boot screen with **no** fallback
     salon/calendar/owner before success;
  2. bootstrap error → retry that re-requests bootstrap;
  3. shell (sidebar) stays dimensionally stable across a refresh (no shift);
  4. Team shows a pending skeleton, then the true empty state only after a
     successful empty load (never a false-empty).

---

## 2. Exact results

### Focused Jest (the loading-lifecycle scope) — **PASS**

- `crmBootstrapLifecycle.test.ts` — 8/8
- `salonSessionAuth.test.ts` — 7/7
- `crmNavigationModel.test.ts` — 9/9 (4 new)
- `crmShellGate` 6/6, `CrmPageGate` 5/5, `CrmBootScreen` 4/4, `TeamSection` 3/3,
  `crmRepositoryBootstrap` 5/5, `crmServicesApiCache` 3/3, `salonSession` 5/5 — all PASS.

### Static smoke gate — **PASS**

- `npm run smoke:crm:phase9` → `PASS: Phase 9 CRM loading-lifecycle static smoke passed.`

### Browser smoke (Playwright) — **PASS (4/4)**

Executed against a local production build via `vite preview`
(`BASE_URL=http://localhost:4321`): all 4 lifecycle tests green.

### Production build — **PASS**

- `npm run build` (Vite) completed successfully (~3m 45s), full asset pipeline.

### Full CRM Jest suite tally

- `npx jest src/screens/SalonCRM` → **18 suites passed, 7 failed; 156 tests passed, 1 failed.**
- All 7 failing suites and the 1 failing test are **pre-existing and unrelated to
  this generation** (see §3).

---

## 3. Known pre-existing failures (NOT introduced here)

1. **6 suites fail to parse under the default runner (`import.meta`).**
   `crmAIEngine`, `crmReducer`, `crmReplay`, `crmSelectors`, `crmSimulation`,
   `crmStateValidation` all import the real `CRMDataProvider`, which uses
   `import.meta.env.DEV`. The default `npm test` (`jest`, CommonJS) cannot
   transform `import.meta` → `SyntaxError: Cannot use 'import.meta' outside a
   module`. Introduced in commit `17805673` ("fix(crm): add phase 8 cleanliness
   guard"), well before this generation.
   - Running with `NODE_OPTIONS=--experimental-vm-modules` fixes the parse but
     then `src/test-setup.ts` breaks (`jest is not defined` — ESM needs
     `import { jest } from '@jest/globals'`). So the runner is internally
     inconsistent for ESM.
   - **Not fixed here on purpose:** the fix is a runner/config change (jest ESM
     mode + setup rewrite) that would touch the whole repo's 18 passing suites,
     which is out of scope for a verification-only generation and risky. All new
     tests were written to be **green under the existing default runner** (they
     avoid importing the real provider — the provider's state-machine → UI
     mapping is already covered by `crmShellGate` with the provider mocked).

2. **1 genuine assertion failure — `calendarUtils.test.ts › clampToWorkingWindow
   › clamps end after HOUR_END`** (`clampToWorkingWindow(1140, 1380)` expected
   `1440`, received `1380`). Pre-existing, in the calendar working-window helper —
   unrelated to the loading lifecycle. Reported, not modified (out of scope).

3. **Older CRM static smoke gates are red for pre-existing reasons** (unrelated to
   loading lifecycle): `smoke:crm:phase6` (string drift), `smoke:crm:phase7`
   (BLOCKED — DB auth), `smoke:crm:phase8` and `smoke:crm:phase8_5` (source drift
   from later CRM work). The new `smoke:crm:phase9` is green.

> Note on concurrent evolution: `crmRepository.ts` was reworked mid-task by an
> earlier generation to REJECT core-domain outages with a typed
> `CRMBootstrapDataError` (rather than coercing to empty). This is a stronger
> "no false-empty" guarantee than the plan's original wording; the new tests and
> the phase-9 gate were aligned to this current production contract.

---

## 4. Manual hard-refresh Founder QA (local)

Prerequisites: an authenticated pilot salon session (real login), running
`npm run dev` (Netlify dev, functions + SPA on `:8888`).

For each route below: **hard refresh** and watch the first paint.

1. `/crm/home`
2. `/crm/schedule`
3. `/crm/schedule?tab=settings&section=team`
4. `/crm/analytics`

Expected on every route:

- **Boot gate:** the branded boot screen (Spectra logo + "Preparing your
  workspace…") is the only thing shown until bootstrap succeeds — **no** salon
  name, calendar labels, owner name, metrics, or "Everything looks good".
- **No fallback tenant:** the salon name/calendars appear only after success and
  are the real tenant's (never "salon-look"/seed).
- **Page truth:** while data loads, dimensional skeletons show (Home cards, Team
  KPIs+roster, Analytics tiles) — never `0`, never `100%` inventory health,
  never an empty roster. Team's "No team members yet" appears only after a
  successful empty load; a load error shows a retry, never an empty state.
- **No layout shift:** the sidebar/header do not resize or reflow when page
  content resolves; a background refresh keeps the shell mounted (no boot-screen
  flash).
- **Session edges:** log out then hard-refresh `/crm/*` → redirect to login (no
  cached tenant flash). Switch tenants → no stale nav/calendars from the prior
  salon.

Automated deterministic equivalents (no live DB) — run any time:

```bash
# static invariants
npm run smoke:crm:phase9

# focused unit/component coverage
npx jest src/screens/SalonCRM/data/__tests__/crmBootstrapLifecycle.test.ts \
        src/screens/SalonCRM/data/__tests__/salonSessionAuth.test.ts \
        src/screens/SalonCRM/navigation/__tests__/crmNavigationModel.test.ts \
        src/screens/SalonCRM/__tests__ \
        src/screens/SalonCRM/schedule/settings/__tests__/TeamSection.test.tsx

# browser lifecycle (build first, serve, then run)
npm run build
npx vite preview --host --port 4321   # in one terminal
BASE_URL=http://localhost:4321 npx playwright test tests/smoke/crm-loading-lifecycle.spec.ts --project=chromium
```

---

## 5. Audit conclusion

The loading-lifecycle contract is enforced and verified at three levels — static
source gate, unit/component behavior, and real-build browser flow — and the
production build is green. The only open items are **pre-existing** and **outside
this generation's scope**: the repo's ESM/CJS Jest runner inconsistency (6
parse-blocked suites) and one unrelated calendar working-window assertion. Both
are documented above for a follow-up owner; neither undermines the CRM
bootstrap/loading-stability guarantees.
