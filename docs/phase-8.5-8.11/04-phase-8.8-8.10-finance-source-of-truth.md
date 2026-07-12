# Phase 8.8-8.10 Contract: Finance Source-of-Truth Boundaries

**Status**: Planning (approved-architecture decision #2 + finance decisions)
**Depends on**: appointment snapshot contract (doc 03), migrations 033/034
**Owner**: Agent C (Checkout + Finance), Agent D (Analytics), integrated by parent owner

Defines the money model: what is revenue, how checkout/payment/appointment are
separated, how VAT and material cost are stored, how expenses (incl. recurring)
avoid double counting, and which dates drive analytics.

---

## 1. Source-of-Truth Rules (non-negotiable)

| Concept | Source of truth | Never derived from |
|---------|-----------------|--------------------|
| Operational activity | `salon_appointments` + segments | checkout |
| Revenue (charged) | `salon_checkout_lines` | appointments |
| Money received | `salon_payments` | appointment or checkout header only |
| Outstanding balance / receivable | canonical checkout totals minus non-void payments, plus optional debt acceptance flag | payment method |
| Business costs | `salon_expenses` | — |
| Direct service cost | checkout line `material_cost_cents` | inventory (pilot: manual) |
| Staff performance | checkout line `staff_member_id` snapshot | appointment only |

Hard rule: **appointments are not revenue.** A scheduled or completed
appointment contributes zero revenue until a confirmed checkout exists.

Debt is not a payment method. A debt/receivable state represents money still
owed; it is not money received and must not be recorded as a `salon_payments`
row.

---

## 2. Appointment / Checkout / Payment Separation (decision #2)

Three tables, one-directional links:

```
salon_appointments (operational)
      │ 1
      │        (optional, at most one non-voided checkout per appointment)
      ▼ 0..1
salon_checkouts (sales header) ──1──▶ salon_checkout_lines (revenue truth)
      │ 1
      ▼ 0..n
salon_payments (money events)
```

- An appointment may have 0 or 1 active checkout. Walk-in checkout without an
  appointment is allowed (`appointment_id` nullable).
- A checkout has many lines and many payments.
- Checkout confirmation may set the appointment's operational status to
  `completed`, but appointment completion is a separate operational event. An
  appointment may be `completed` with no checkout, a draft checkout, and unpaid
  money. No revenue exists until checkout is confirmed.
- Calendar payment badges should be derived from the linked active checkout
  when practical. If a `payment_status` cache is later stored on
  `salon_appointments`, it is display-only, synchronized in the same DB
  transaction as checkout/payment changes, and never independently editable.

### Duplicate-checkout prevention

Partial unique index:

```sql
CREATE UNIQUE INDEX uq_active_checkout_per_appointment
  ON salon_checkouts (appointment_id)
  WHERE appointment_id IS NOT NULL AND status <> 'voided';
```

A second checkout for the same appointment requires voiding the first
(explicit correction flow), never a silent duplicate.

---

## 3. Schema (migration 036 — checkout/payments/audit)

### 3.1 `salon_checkouts`

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT PK `chk-` | |
| `salon_id` | TEXT FK salons | tenant |
| `appointment_id` | TEXT FK salon_appointments NULL | walk-in allowed |
| `customer_id` | TEXT FK salon_customers NULL | snapshot `customer_name` too |
| `customer_name` | TEXT | snapshot |
| `status` | TEXT | `open` \| `confirmed` \| `voided` |
| `payment_status` | TEXT | `unpaid` \| `partial` \| `paid` \| `debt` |
| `paid_amount_cents` | INTEGER | server-calculated from non-void payments |
| `outstanding_amount_cents` | INTEGER | server-calculated receivable balance |
| `debt_accepted_at` | TIMESTAMPTZ NULL | set only when outstanding balance is intentionally accepted as debt |
| `debt_accepted_by_user_id` | TEXT NULL | audit for receivable acceptance |
| `vat_rate_bps` | INTEGER | VAT rate at confirmation, basis points (1800 = 18%) |
| `prices_include_vat` | BOOLEAN | snapshot of setting at confirmation |
| `subtotal_cents` | INTEGER | sum of line charged (pre-discount rules per line) |
| `discount_cents` | INTEGER | header-level discount if any |
| `vat_amount_cents` | INTEGER | computed, stored |
| `total_cents` | INTEGER | final charged incl/excl VAT per snapshot |
| `material_cost_cents` | INTEGER | rolled up from lines OR appointment-total (see §7) |
| `material_cost_source` | TEXT | `line` \| `appointment_total` |
| `created_at/by`, `updated_at/by`, `confirmed_at`, `voided_at` | audit | |

### 3.2 `salon_checkout_lines` (revenue truth, immutable snapshot)

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT PK `chkl-` | |
| `salon_id` | TEXT | tenant |
| `checkout_id` | TEXT FK | |
| `line_type` | TEXT | `service` \| `product` (product prepared, not overbuilt) |
| `service_id` | TEXT FK NULL | navigation only |
| `service_name` | TEXT | snapshot |
| `staff_member_id` | TEXT FK NULL | navigation |
| `staff_name` | TEXT | snapshot |
| `quantity` | INTEGER | default 1 |
| `original_price_cents` | INTEGER | snapshot of service default/override |
| `charged_gross_cents` | INTEGER | server-calculated charged gross amount |
| `discount_cents` | INTEGER | per line |
| `vat_rate_bps` | INTEGER | snapshot |
| `net_before_vat_cents` | INTEGER | server-calculated |
| `vat_amount_cents` | INTEGER | server-calculated |
| `material_cost_cents` | INTEGER | per line, source-tagged |
| `material_cost_source` | TEXT | `manual` \| `inventory_estimate` \| `weighing` \| `imported` \| `adjusted` |
| `line_total_cents` | INTEGER | computed final |
| `created_at/by`, `updated_at/by` | audit | |

### 3.3 `salon_payments`

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT PK `pay-` | |
| `salon_id` | TEXT | tenant |
| `checkout_id` | TEXT FK | |
| `method` | TEXT | `credit_card` \| `cash` \| `cheque` \| `bank_transfer` \| `other` |
| `amount_cents` | INTEGER | > 0 |
| `paid_at` | TIMESTAMPTZ | money date |
| `reference` | TEXT NULL | external ref (no gateway) |
| `created_at/by` | audit | |

Multiple payments per checkout are the norm (₪300 credit card + ₪100 cash).
Outstanding balance remains on the checkout as `outstanding_amount_cents`;
there is no `method='debt'`.

---

## 4. State Machines

### Checkout status

```
open ──▶ confirmed ──▶ voided
  └───────────────────▶ voided
```

- `open`: editable cart.
- `confirmed`: financial record created; lines/payments frozen except via
  explicit correction rules (§9).
- `voided`: reversed; requires reason + audit; excluded from revenue.

### Payment status (derived, stored on checkout at confirm + on payment change)

Let `paid = sum(non-void payments)`, `total = total_cents`, and
`outstanding = max(total - paid, 0)`.

- `unpaid`: no money recorded and full balance outstanding.
- `partial`: some money recorded and balance remains outstanding.
- `paid`: non-void payments cover the checkout total.
- `debt`: outstanding balance was intentionally accepted as customer debt
  (`debt_accepted_at IS NOT NULL`).

The distinction is intentional: `partial` is incomplete payment; `debt` is a
receivable state. If this proves too much for the first finance pilot, simplify
to `unpaid | partial | paid` and add a separate receivable flag later — do not
use ambiguous rules and do not encode debt as a payment method.

Impossible combinations prevented:
- `paid` checkout with zero payment records -> rejected.
- `confirmed` checkout with no lines -> rejected.
- `method='debt'` payment rows -> rejected.
- appointment payment badge says `paid` while checkout/payments derive
  `partial` -> rejected by deriving or synchronizing in the same transaction.
- cancelled appointment auto-counted as revenue -> impossible (revenue only
  from confirmed checkout lines).

---

## 5. VAT Settings (stored, configurable, historical-safe)

`salon_settings` (later finance migration; not Phase 8.5):

| Column | Type | Notes |
|--------|------|-------|
| `salon_id` | TEXT PK/FK | one row per salon |
| `default_vat_rate_bps` | INTEGER | pilot default 1800 (18%), configurable, never hardcoded |
| `service_prices_include_vat` | BOOLEAN | |
| `retail_prices_include_vat` | BOOLEAN | |
| `expense_amounts_include_vat` | BOOLEAN | |
| `currency` | TEXT | default `ILS` |
| `updated_at/by` | audit | |

Historical safety: every checkout and line stores `vat_rate_bps` and
`prices_include_vat` at confirmation. Changing salon VAT later never alters past
checkouts. Future line-item VAT override supported via the line's
`vat_rate_bps`.

---

## 6. Server-Authoritative Calculation Order

The client may submit source inputs only:

- original price or selected service reference
- requested discount
- quantity
- VAT setting/reference
- material cost input
- payment amounts

The server calculates and persists canonical values:

- charged gross amount
- discount amount
- VAT amount
- net before VAT
- line total
- checkout total
- paid amount
- outstanding amount
- payment status
- gross-profit inputs

The server must reject or ignore client-supplied `vat_cents`,
`net_before_vat_cents`, checkout totals, `paid_amount`, `outstanding_amount`, or
`payment_status` as authoritative values.

All money is integer cents. VAT rates are integer basis points
(`1800 = 18%`). Rounding uses half-up to the nearest cent at the line level; the
checkout total is the sum of persisted line totals so totals never drift from
displayed lines.

### VAT-inclusive pricing

1. `originalGross = original_price_cents * quantity`.
2. `discount = min(validatedDiscount, originalGross)`.
3. `chargedGross = originalGross - discount`.
4. `netBeforeVat = round(chargedGross * 10000 / (10000 + vatRateBps))`.
5. `vatAmount = chargedGross - netBeforeVat`.
6. `lineTotal = chargedGross`.

### VAT-exclusive pricing

1. `originalNet = original_price_cents * quantity`.
2. `discount = min(validatedDiscount, originalNet)`.
3. `chargedNet = originalNet - discount`.
4. `vatAmount = round(chargedNet * vatRateBps / 10000)`.
5. `chargedGross = chargedNet + vatAmount`.
6. `netBeforeVat = chargedNet`.
7. `lineTotal = chargedGross`.

Material cost is deducted from `netBeforeVat` for gross-profit calculations. It
is never deducted from VAT-inclusive gross revenue.

### Checkout totals

For a confirmed checkout:

- `total_cents = sum(line_total_cents) - header_discount_cents` (if header
  discounts are allowed in a later slice; pilot should prefer line discounts).
- `paid_amount_cents = sum(non-void salon_payments.amount_cents)`.
- `outstanding_amount_cents = max(total_cents - paid_amount_cents, 0)`.
- `payment_status` derives from §4 and is stored only as a synchronized checkout
  cache.

---

## 7. Material Cost (prevent double counting)

Two entry paths, mutually exclusive per checkout:

- Per-line: user enters `material_cost_cents` on each line; checkout
  `material_cost_cents = sum(lines)`, `material_cost_source = 'line'`.
- Appointment-total: user enters a single total; stored on checkout with
  `material_cost_source = 'appointment_total'` and lines carry `0`.

Guard: analytics reads material cost from lines only when
`material_cost_source = 'line'`, otherwise from the checkout total. Never sum
both. Enforced by a CHECK-style rule in the API and asserted in smoke tests.

Future Spectra sources tagged via `material_cost_source`
(`manual|inventory_estimate|weighing|imported|adjusted`); pilot uses `manual`.

---

## 8. Appointment Completion vs Checkout Confirmation

Appointment completion is operational. Checkout confirmation is financial.

Valid state:

- appointment: `completed`
- checkout: none or `open`
- payments: none
- payment status: `unpaid` or no badge yet
- revenue: zero

Checkout confirmation may mark the appointment as `completed` in the same
transaction, but marking an appointment `completed` must not create a checkout,
checkout lines, payments, revenue, or analytics rows.

Reports must never treat appointment completion as revenue. Revenue starts only
when a checkout is `confirmed` and has persisted checkout lines.

---

## 9. Post-Confirmation Corrections (audit-backed, minimal)

Allowed after `confirmed` with full audit (`updated_by`, `updated_at`, reason):
- add a later real payment that reduces outstanding balance / settles debt.
- correct material cost.
- void the whole checkout (reason required) then re-checkout.

Not built in pilot: partial refunds, line-level price edits after confirm
(require void + redo), accounting exports.

---

## 10. Expenses (migration 037)

### 10.1 `salon_expenses`

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT PK `exp-` | |
| `salon_id` | TEXT | tenant |
| `name` | TEXT | |
| `category` | TEXT | rent/salaries/freelancers/electricity/water/arnona/insurance/software/marketing/cleaning/equipment/product_purchases/other |
| `cost_type` | TEXT | `fixed` \| `variable` |
| `amount_cents` | INTEGER | |
| `vat_included` | BOOLEAN | |
| `vat_rate_bps` | INTEGER | snapshot |
| `expense_date` | DATE | when it applies |
| `recurring_template_id` | TEXT FK NULL | set when generated from a template |
| `notes` | TEXT | |
| `created_at/by`, `updated_at/by` | audit | |

### 10.2 Recurring model (no double counting)

Separate template table `salon_expense_recurrences`:

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT PK `exprec-` | |
| `salon_id` | TEXT | |
| `name`, `category`, `cost_type`, `amount_cents`, `vat_included`, `vat_rate_bps` | | template values |
| `frequency` | TEXT | `monthly` \| `weekly` \| `yearly` |
| `next_run_date` | DATE | |
| `active` | BOOLEAN | |

Rule: the **template is never counted** in analytics. Only generated
`salon_expenses` rows (each with `recurring_template_id`) count. Generation
creates one dated expense per period; a unique index on
`(recurring_template_id, expense_date)` prevents duplicate occurrences.

---

## 11. Analytics Formulas + Date Semantics (Phase 8.10)

Analytics reads only source-of-truth tables. No mock data. Never present zero as
confirmed when source data is incomplete — show an honest incomplete state.

### 11.1 Date semantics (intentional, consistent)

| Report | Date used |
|--------|-----------|
| Revenue / sales | checkout `confirmed_at` |
| Money received | payment `paid_at` |
| Debt outstanding | as-of now, from unpaid/debt balances |
| Operational activity | appointment `start_time` |
| Expenses | expense `expense_date` |

Reports state which date they use. A single dashboard must not silently mix
dates within one metric.

### 11.2 Core formulas (money in cents; VAT in bps)

Given confirmed, non-voided checkout lines:
- `chargedRevenue = sum(line_total_cents)`.
- `netRevenueBeforeVat = sum(net_before_vat_cents)`.
- `vatAmount = sum(vat_amount_cents)`.
- `materialCost` = per §7 (line sum or appointment total, never both).
- `grossProfit = netRevenueBeforeVat - materialCost`.
- `grossMarginPct = grossProfit / netRevenueBeforeVat` (guard divide-by-zero ->
  incomplete state).
- `paidAmount = sum(non-void payments)`.
- `outstandingAmount = max(total_cents - paidAmount, 0)`.
- `debt = outstandingAmount` only when `debt_accepted_at IS NOT NULL`;
  otherwise show it as ordinary outstanding/partial balance.
- `fixedExpenses`/`variableExpenses` = sum expenses by `cost_type` in range.
- `estimatedNetProfit = grossProfit - applicableExpenses`.

Example (one full-color line, ₪380, prices include 18% VAT, ₪60 material):
- charged = 38000
- net before VAT = 38000 / 1.18 = 32203
- VAT = 5797
- gross profit = 32203 - 6000 = 26203
- gross margin = 26203 / 32203 = 81.4%

### 11.3 Profitability breakdowns

By service / customer / staff read from checkout lines (charged, net, material,
gross, margin, counts) joined to snapshots. Do not allocate salon-wide expenses
to service/staff without an explicit future allocation model — show gross
profit, not fully-loaded net, at those levels.

---

## 12. API Surface

- `salon-checkouts.js`: `POST /` (open from appointment/walk-in),
  `GET /:id`, `PATCH /:id` (edit while open), `POST /:id/confirm` (idempotent
  via `Idempotency-Key`), `POST /:id/void`, line CRUD under `/:id/lines`,
  payment CRUD under `/:id/payments`.
- `salon-finance.js` (or `salon-expenses.js` + `salon-settings.js`): expenses
  CRUD, recurrence CRUD + generate, VAT settings GET/PATCH.
- `salon-analytics.js`: read-only aggregate endpoints with explicit
  `dateBasis`, range params, and honest incomplete flags in `meta`.

All follow `docs/crm-pilot-api-contract.md` (envelope, tenant, status codes).
Confirm/void/payment are idempotent and audit-stamped.

---

## 13. Rejected Approach: Legacy Mock Dashboard Flat Rates

A read-only review proposed extending the legacy `SalonPerformanceDashboard`
reports (`AnalyticsMockData.ts`) and making `MATERIAL_COST_RATE = 0.18` /
`OPERATING_EXPENSE_RATE = 0.62` tenant-configurable settings.

This is **rejected** for the pilot:

- Phase 8 already retired that path — `/crm/analytics` now renders the
  live-only `AnalyticsPage.tsx`, and `SalonPerformanceDashboard` is off the
  route. Reintroducing it violates the data-cleanliness gate.
- Flat percentage proxies (revenue × 18%, revenue × 62%) are not real material
  cost or real expenses. This contract computes material cost from checkout
  lines (§7) and expenses from `salon_expenses` (§10) — actual source-of-truth
  records, never estimated rates presented as real.
- VAT is stored per checkout (§5), not derived from a global rate applied
  retroactively.

Reconnaissance value retained: the pre-existing hardcoded `today = new
Date(2026, 1, 15)` in the legacy mock must never leak into live analytics
(there is no such constant in `AnalyticsPage.tsx`; keep it that way).

## 14. Out of Scope

- Payment gateway integration, refunds/chargebacks, accounting/ledger exports.
- Retail POS depth (product lines are prepared structurally only).
- Automatic expense allocation to staff/services.
- Real customer onboarding.
- Legacy `SalonPerformanceDashboard` / `AnalyticsMockData` reactivation.
