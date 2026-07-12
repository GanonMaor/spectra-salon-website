# Phase 8.5-8.11 UI Reuse Map (No Duplicate Screens)

**Status**: Planning
**Goal**: Every new capability extends an existing CRM screen/route/component.
No second inventory page, no second calendar, no `/crm/pos` shell, no duplicate
settings surface. New routes are added only where there is no existing home.

---

## 1. Existing CRM Routes and Nav (verified)

Route registration: `src/index.tsx` (children of the `/crm` route).
Nav definition: `src/screens/SalonCRM/SalonCRMPage.tsx` (`NAV_ITEMS`).

| Route | Component | Nav item |
|-------|-----------|----------|
| `/crm/home` | `HomeDashboardPage` | Home |
| `/crm/schedule` | `SchedulePage` | Hair Studio / Beauty Clinic (`?calendar=`) |
| `/crm/schedule?tab=settings` | `SchedulePage` -> `ScheduleSettingsTab` | Settings (More menu) |
| `/crm/customers` | `CustomersPage` | Customers |
| `/crm/inventory` | `InventoryPage` | Inventory |
| `/crm/product-catalog-setup` | `ProductCatalogSetupPage` | Catalog Setup (More menu) |
| `/crm/staff` | `StaffPage` | Staff |
| `/crm/analytics` | `AnalyticsPage` | Analytics (More menu) |
| `/crm/new-calendar-design` | `NewCalendarDesignPage` | Style guide (utility) |

Nav is split: `PRIMARY_NAV_ITEMS` (first 6) in the main sidebar/bottom bar;
`MORE_NAV_ITEMS` (rest) under the "More" menu. Any new nav entry must be placed
deliberately here — do not add a new top-level tab without owner approval.

---

## 2. Capability -> Existing Home (reuse-first)

### Phase 8.5 — Onboarding, Brands, Inventory

| Capability | Reuse | New? |
|-----------|-------|------|
| Brand / product-line enablement | `ProductCatalogSetupPage.tsx` (already lists catalog brands, enable toggles via `salonProductsApi`) | No new screen |
| Inventory listing (catalog-first) | `InventoryPage.tsx` (`listCatalogStock`) | No new screen |
| Inline stock/min/favorite/visible editing + autosave | Add inline editable cells + `useDebouncedAutosaveMap` to `InventoryPage.tsx` | New shared hook only |
| Onboarding setup mode (empty/minimal) | Prefer a first-run wizard surfaced from `/crm/home` empty state, backed by `crm-onboarding.js`. Only add `/crm/onboarding` route if the home empty-state cannot host it cleanly. | Route TBD, owner-gated |

Rule: Do not create a separate "stock editor" screen. Editing happens inline in
the existing inventory table. The debounced autosave hook is shared, not a
screen.

### Phase 8.6 — Categories, Services, Split-Service Rules

| Capability | Reuse | New? |
|-----------|-------|------|
| Editable departments / categories / services | `ScheduleSettingsTab.tsx` (already the services/categories/departments settings surface) | No new route |
| Split-service stage config | `ServiceWorkflowEditor.tsx` (already visualizes stages) | Extend, no new screen |
| Staff-specific price | Extend service editor form in `ScheduleSettingsTab.tsx` | No new screen |

Rule: There is no separate `ServicesPage.tsx` and we do not create one. Services
live under Schedule Settings.

### Phase 8.7 — Calendar Lifecycle, Split Appointments, History

| Capability | Reuse | New? |
|-----------|-------|------|
| Create/edit appointment, select services, assign staff | `AppointmentComposerModal.tsx` | Extend for stages |
| Split appointment rendering, drag/resize, waiting time | `SchedulePage.tsx` + calendar components | Extend rendering |
| Operational statuses (scheduled/arrived/in-progress/waiting/completed/cancelled/no-show) | Appointment status control in composer + calendar | Extend |
| Permanent history + completed/payment indicators | `SchedulePage.tsx` render + customer detail in `CustomersPage.tsx` | Extend |

Rule: One calendar. Split appointments render as connected stages inside the
existing schedule, not a new calendar view.

### Phase 8.8 — Checkout / Simple POS

| Capability | Reuse | New? |
|-----------|-------|------|
| Checkout entry ("Complete and Checkout" / "Open Checkout") | Action on the existing appointment card/modal in `SchedulePage.tsx` / `AppointmentComposerModal.tsx` | New action, no new route |
| Checkout cart drawer (lines, price, discount, VAT, material, payment) | New drawer/modal components under `src/screens/SalonCRM/checkout/` opened from the calendar | New components, no top-level nav item |

Rule: No `/crm/pos` page. Checkout is a drawer/modal launched from the
appointment, keeping calendar as the operational home.

### Phase 8.9 — Expenses, VAT, Material Cost

| Capability | Reuse | New? |
|-----------|-------|------|
| VAT settings | Add a "Finance" section inside Schedule Settings (`ScheduleSettingsTab.tsx`) or a settings sub-tab | Prefer reuse of settings surface |
| Material cost per checkout line / per appointment | Inside the checkout drawer (Phase 8.8) | No new screen |
| Expenses module (list + create) | New route `/crm/expenses` (no existing home for business costs) | New route, owner-gated, placed in More menu |

Rule: Only Expenses justifies a new route because no current screen owns
business costs. VAT settings and material cost reuse existing surfaces.

### Phase 8.10 — Live Analytics and Profitability

| Capability | Reuse | New? |
|-----------|-------|------|
| Profitability overview, by service/customer/staff | `AnalyticsPage.tsx` (expand the live-only page with tabs/sections) | Extend, no new route |
| Honest empty/incomplete states | Already the pattern in `AnalyticsPage.tsx` | Extend |

Rule: Do not replace `AnalyticsPage.tsx`; expand it. It is already live-only and
mock-free.

### Phase 8.11 — Founder QA

No product screens. QA is a checklist artifact plus corrections applied to the
screens above. See `05-founder-qa-and-smoke-gates.md`.

---

## 3. New Routes Summary (minimal, owner-gated)

| Proposed route | Justification | Placement |
|----------------|---------------|-----------|
| `/crm/onboarding` (maybe) | Only if home empty-state cannot host the first-run wizard | Not in nav; reached from home empty-state |
| `/crm/expenses` | No existing home for business costs | More menu |

Everything else extends an existing screen. Any route beyond these two requires
explicit parent owner approval before implementation.

---

## 4. Anti-Duplication Checklist (enforced in smoke)

- No second inventory route/component.
- No second services route (services stay in Schedule Settings).
- No second calendar view for split appointments.
- No `/crm/pos` or duplicate checkout page (checkout is a drawer).
- No duplicate "Analytics" screen (`AnalyticsPage.tsx` is the only one).
- No duplicate VAT/settings surface.
- Every new nav item accounted for in `NAV_ITEMS` with a clear owner sign-off.
