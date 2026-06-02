# The Beauty Intelligence Dataset — Data Moat Model

> Conservative, source-transparent quantification of the proprietary operational
> dataset that Spectra / Salon AI generates today, and what it becomes at scale.
>
> **Principle:** The value is not the amount of data. The value is that Salon AI
> can observe operational *relationships* across the entire beauty business that
> no other platform currently sees in one place.

Last reviewed: derived from the shipped dataset generated `2026-05-14`.

---

## 1. Real data sources inspected

| Source | Path | What it provides | Confidence |
|---|---|---|---|
| Market-intelligence aggregate | `src/data/market-intelligence.json` | Primary baseline: monthly visits, services, material cost, grams, brands, per-service-type splits, per-salon overview. Built from 21 usage workbooks. | High |
| Raw usage workbooks | `reports/users_susege_reports/*.xlsx` | Ground-truth monthly `UsersUsageReport` exports (Jan 2023 → Apr 2026). | High |
| Parsing pipeline | `scripts/lib/usage-row-parser.js`, `scripts/lib/usage-aggregator.js`, `scripts/lib/usage-report-loader.js` | Defines the exact schema and how raw rows become aggregates. | High |
| Per-customer mix totals | `docs/customer-ids.csv` (384 salons, 434,173 total mixes through Feb 2026) | Supporting evidence that "Total services" ≈ mixes at the salon level. | Medium-High |
| Live import path | `netlify/functions/usage-import.js` (Postgres `usage_imports`, `usage_report_rows`, `usage_snapshots`) | How fresh months are ingested into the live snapshot. | High (schema), N/A (no DB access in this environment) |
| Billing context | `src/data/summit-billing.json`, `migrations/03_spectra_payments.sql` | Subscriber/payment history. Not used for data-volume claims, only for context. | Medium |
| CRM / inventory / schedule schema | `migrations/09_crm_multi_tenant.sql`, `migrations/15_inventory.sql`, `migrations/08_schedule.sql` | Tables for customers, visits, inventory, appointments, `product_grams`. Mostly demo-seeded today. | Schema only |

### Important transparency note

- **No production database was queried.** This environment has no `DATABASE_URL` /
  `NEON_DATABASE_URL`. Every "real" number below comes from the **shipped
  aggregate dataset and usage workbooks**, which are real Spectra usage exports.
- **"Services" is used as the operational mix/formula proxy.** The downstream code
  treats `Total services` as mixes (`buildPhoneMixIndex` sets `totalMixes = totalServices`).
  This is the most defensible proxy currently available; per-mix line-item logs
  are not yet in the shipped dataset.

---

## 2. What current numbers ARE available (high confidence)

From `market-intelligence.json`.

### Whole-dataset totals (Jan 2023 → Apr 2026, 40 months)

| Metric | Value | Confidence |
|---|---|---|
| Salon accounts (distinct) | 428 | High |
| Visits | 465,430 | High |
| Services (mix proxy) | 556,455 | High |
| Material / procurement cost | $12,348,492.95 | High |
| Grams measured | 30,878,848.76 | High |
| Brands observed | 221 | High |
| Months of history | 40 | High |

### Latest complete month — Apr 2026 (the conservative "current rate")

| Metric | Value | Confidence |
|---|---|---|
| Active salons | 147 | High |
| Visits | 12,849 | High |
| Services (mix proxy) | 15,484 | High |
| Grams measured | 769,052.76 | High |
| Active brands | 120 | High |
| Salon × brand usage rows | 507 | High |
| Avg services / active salon / month | 105.33 | High |
| Avg visits / active salon / month | 87.41 | High |
| Avg grams / service | 49.67 g | High |

### Trailing 12 months (sensitivity check, May 2025 → Apr 2026)

| Metric | Value |
|---|---|
| Visits | 195,717 |
| Services | 231,466 |
| Grams | 11,586,245.76 |
| Distinct active salons in window | 288 |
| Avg active salons / month | 170.9 |

We deliberately use the **single latest month (147 active salons)** as the
per-salon baseline rather than the larger trailing-window average. It is the most
conservative defensible "current rate."

---

## 3. What current numbers are MISSING

| Metric | Status | What would make it real |
|---|---|---|
| Per-mix / per-formula records | Missing (aggregated only) | Mix-session event log (`MixSession`, `ProductUsage` types exist in CRM but are not persisted/exported) |
| Reweigh / waste outcomes | Missing in production data | Persisted `ReweighOutcome` events (currently CRM simulation only) |
| Inventory deduction events | Missing as telemetry | Mix-driven `inventory_stock_changes` rows (today only manual/batch) |
| Purchase / order events | Missing | An order/restock feed |
| Unique end-customers | Missing | Customer identity in usage exports (today only salon-account `userId`) |
| AI interactions / recommendations | Missing as durable log | A persisted AI-interaction/insight-event table |
| Agent actions | Missing | Agent action log |
| SKU-level product usage | Missing | Line-item product consumption per mix |

These are intentionally **not** presented as current facts. Where they appear in
projections they are labeled as **future instrumentation** assumptions.

---

## 4. Assumptions used (and confidence)

| Assumption | Value | Basis | Confidence |
|---|---|---|---|
| Services ≈ mixes | 1:1 | `buildPhoneMixIndex` proxy in code | Medium-High |
| Per-salon rate stays constant at scale | Apr 2026 per-salon rate | Conservative; ignores larger/enterprise salons | Medium |
| Operating constant | 12 months/year | Standard | High |
| Customer journeys ≈ visits | 1 visit = 1 journey touchpoint | Visits are real; unique-customer identity is not | Low-Medium |
| Material-cost data points ≈ services | 1 per service | Cost is captured per row | Medium-High |
| Inventory events / recommendations / agent actions | future fields | Not yet instrumented | Low (flagged) |

---

## 5. Current baseline (per active salon)

Computed from Apr 2026 actuals (147 active salons).

```
services_per_salon_per_month = 15,484 / 147           = 105.33
visits_per_salon_per_month   = 12,849 / 147           = 87.41
grams_per_salon_per_month    = 769,052.76 / 147        = 5,231.65
```

### One salon generates per year

| Metric | Formula | Output | Confidence |
|---|---|---|---|
| Services / mixes | 105.33 × 12 | ≈ **1,264** | High |
| Visits | 87.41 × 12 | ≈ **1,049** | High |
| Grams measured | 5,231.65 × 12 | ≈ **62,780** | High |
| Material-cost data points | ≈ services | ≈ 1,264 | Medium-High |
| Inventory events | future instrumentation | not claimed | Low |
| Recommendations / agent actions | future instrumentation | not claimed | Low |

> Note: an earlier draft estimated ~76,900 g/salon/year. The dataset-consistent
> figure is **≈ 62,780 g/salon/year**, which scales cleanly to the 627.8M headline
> at 10,000 salons. We use the consistent figure.

---

## 6. Scale projections

Each scale multiplies the **one-salon annual baseline** by salon count. This makes
the large numbers intuitive: they are just "one salon × N."

| Scale | Visits / yr | Services (mixes) / yr | Grams measured / yr |
|---|---|---|---|
| 1 salon | 1,049 | 1,264 | 62,780 |
| Current (147 active) | 154,188 | 185,808 | 9,228,633 |
| 1,000 salons | 1,048,898 | 1,264,000 | 62,779,817 |
| **10,000 salons** | **10,488,980** | **12,640,000** | **627,798,171** |
| 50,000 salons | 52,444,898 | 63,200,000 | 3,138,990,857 |

---

## 7. The 10,000-salon investor case (key scenario)

At 10,000 active salons, **every single year**, Salon AI would observe:

- **~10.5 million** customer visits
- **~12.6 million** color services / formulas (mix proxy)
- **~627.8 million grams** of professional product measured on a connected scale
- **~12.6 million** material-cost data points (cost attached to each service)
- **200+** professional brands already represented (221 observed historically)

And — uniquely — it sees these **connected to each other**: the formula, the grams,
the cost, and the service, in one operating system.

The defensible claim is not "627.8M grams." It is:

> Nobody else knows what happened to 12.6M color services — which materials were
> used, how many grams were wasted, what the margin was, and what happened to the
> customer weeks later — because nobody else sees all of it in one place.

---

## 8. Data Categories Matrix — what each dataset *enables*

Volume is the proof. This is the value.

| Intelligence | What we can learn | Data backing it today | Confidence |
|---|---|---|---|
| Product Intelligence | Which products/brands perform; reorder behavior | Brands, grams, service splits (real) | High (brand/grams), Low (SKU) |
| Formula Intelligence | Which formulas give consistent results | Services as mix proxy (real) | Medium-High |
| Waste Intelligence | Where product is wasted; over/under use | Grams per service (real); reweigh (future) | Medium |
| Margin Intelligence | Which services are most profitable | Material cost per service + service mix (real) | Medium-High |
| Customer Journey Intelligence | What makes a customer rebook | Visits + recency (real); identity (future) | Low-Medium |
| Team Intelligence | Which staff perform better | Employees field where present; staff events (partial) | Low-Medium |
| Market Benchmark Intelligence | Region / salon-type / brand / service benchmarks | Country, city, salon type, brand, grams, cost (real) | High |

---

## 9. Competitive Visibility Analysis

Framed by **product-category capability**, not claims about competitors' private
data models.

| Platform | Typically sees | Typically does NOT see |
|---|---|---|
| Phorest | Appointments, payments, CRM, marketing | Formula + grams + waste at scale economics |
| Vagaro | Bookings, POS, CRM, payments | Operational color formulation + material waste |
| Square | Payments, some appointments/customers | Formula / grams / waste / service-material economics |
| Vish | Color formula + waste-related data | Full business operating-system context |
| Traditional salon software | One or two of the above, fragmented | The connected loop |

```text
Nobody sees:
Appointments
+
Formulas
+
Inventory
+
Waste
+
Profitability
+
Customer Journey
+
Marketing
+
AI interactions

inside one system.
```

That single-system visibility is the moat.

---

## 10. The Dataset Flywheel

```
More Salons
   ↓
More Data
   ↓
Better AI
   ↓
Better Outcomes
   ↓
More Salons
```

Each new salon adds operational data; more data improves the models; better models
produce better outcomes (less waste, higher margin, more rebookings); better
outcomes attract more salons. The dataset compounds — and it cannot be bought,
only operated into existence.

---

## 11. Intelligence Assets at 10,000 salons (annual)

Future scale of distinct intelligence assets, each labeled.

| Intelligence asset | Estimate / yr | Confidence |
|---|---|---|
| Color formulas / mixes | ~12.6M | Medium-High (services proxy) |
| Customer journeys (visits) | ~10.5M | High (visits) / Low-Medium (unique identity) |
| Service outcomes | ~12.6M | Medium (category) / Low (final result) |
| Grams of product measured | ~627.8M | High |
| Material-cost data points | ~12.6M | Medium-High |
| Brands represented | 200+ | High |
| Product intelligence (SKU efficacy) | future | Low (needs line-item data) |
| Inventory intelligence (events) | future | Low (needs telemetry) |
| Benchmarking intelligence (region/type/brand) | continuous | High |

---

## 12. Missing data needed to upgrade confidence

To move the flagged items from "assumption" to "real," the following would be
needed (ideally exported the same way usage reports are):

1. Per-mix event log (mix id, products, grams, cost, timestamp).
2. Reweigh outcome events (expected vs actual grams, variance value).
3. Mix-driven inventory deduction events.
4. Unique end-customer identifiers in usage exports.
5. AI interaction / recommendation / agent-action logs.
6. SKU-level product consumption (not just brand).

Until those exist, this model treats them as **future instrumentation** and does
not count them as current facts.
