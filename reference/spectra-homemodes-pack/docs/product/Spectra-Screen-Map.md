# Spectra Screen Map (MVP Pilot)

**Status:** Active
**Date:** 2026-03-05
**Owner:** Product / Architecture Council
**Figma Source:** [spectra-all-flow](https://www.figma.com/design/tLW9k7PmdKatoIwUHESwNp/spectra-all-flow?node-id=0-1&m=dev&t=zkMlYLcl5zLxRF7u-1)
**Revision Notes:** [Spectra-Screen-Map-Revision.md](Spectra-Screen-Map-Revision.md)
**Build Contract:** [Spectra-MVP-Build-Contract.md](Spectra-MVP-Build-Contract.md)

---

## Purpose

This document defines the **canonical screen map for Spectra MVP Pilot**.
It serves as the single source of truth for:

* Figma (what to design)
* Cursor / developers (what to build)
* QA (what to validate)

No screen may be added, renamed, or duplicated without updating this map.

---

## Screen Count

```
20 screens — 9 domains
(three role-differentiated home modes replaced the single Home / Today screen)
```

See `docs/architecture/HomeModes.md` for full home mode architecture.

---

## 1. Home

> **Architecture update (2026-03-05):** The single Home / Today screen has been
> superseded by three role-differentiated home modes. See:
> `docs/architecture/HomeModes.md`

### Screen 1a: ColorBarHome

**עברית:** מסך הבית — סטייליסט

Role: `colorbar`
Goals:
* Live client list with stage-service visual coding (own visits)
* Start visit, Quick Mix, Continue Mix, Scan Product
* Active bowls module (open mix sessions)
* Per-visit profitability awareness

### Screen 1b: ReceptionHome

**עברית:** מסך הבית — קבלה

Role: `reception`
Goals:
* Full-salon kanban board: arrived / waiting / in treatment / finishing / completed
* Rapid checkout initiation for any visit
* Add service, add retail, flag visit from panel

### Screen 1c: ManagerHome

**עברית:** מסך הבית — מנהל

Role: `manager`
Goals:
* KPI cards: revenue today, avg mix cost, active visits, low stock alerts
* Compact operational snapshot (stuck visits)
* Alert panel drill-down (panel only, no home-level command dispatch)

---

## 2. Visit Lifecycle

### Screen: Start Visit

**עברית:** פתיחת ביקור

Actions:
* Search client
* Create new client
* Select service

Buttons:
* `Create Client`
* `Start Visit`

---

### Screen: Visit Dashboard

**עברית:** ניהול ביקור

Includes:
* Services assigned
* Active mix
* Products added
* Visit status and timing

Buttons:
* `Start Mix`
* `Add Product`
* `Finalize Sale`
* `Checkout Visit`

---

## 3. Mix System

### Screen: Mix Session

**עברית:** סשן מיקס

Includes:
* Formula selection
* Scale connection (BLE)
* Weighing
* Reweigh
* Continue mix (append)

Buttons:
* `Start Mix`
* `Continue Mix`
* `Finish Mix`

---

### Screen: Formula Library

**עברית:** ספריית פורמולות

Includes:
* Saved formulas
* Search
* Create new formula

---

## 4. Sales

### Screen: Finalize Sale

**עברית:** סיום מכירה

Includes:
* Services rendered
* Products sold
* Price calculation
* Payment capture

Buttons:
* `Capture Payment`
* `Complete Sale`

> **System rule (DR-004):** Finalize Sale does **not** close the Visit. Visit closure is a separate action via `Checkout Visit`.

---

### Screen: Receipt / Success

**עברית:** אישור עסקה

Includes:
* Payment confirmation
* Send receipt
* Return to visit or home

---

## 5. Visit Closure

### Screen: Checkout Visit

**עברית:** סגירת ביקור

Includes:
* Visit summary
* Confirm closure

Buttons:
* `Confirm Checkout`
* `Cancel`

> Only `CheckoutVisit` may transition a Visit to `checked_out`. No other command closes a Visit (INV-DR004-2).

---

## 6. Client System

### Screen: Client Profile

**עברית:** פרופיל לקוחה

Includes:
* Personal details
* Visit history
* Formulas used

---

### Screen: Visit History

**עברית:** היסטוריית ביקורים

Includes:
* Services
* Sales
* Mixes

---

## 7. Inventory

### Screen: Stock Overview

**עברית:** מלאי הסלון

Includes:
* Product list
* Stock levels
* Low-stock alerts

---

### Screen: Product Details

**עברית:** פרטי מוצר

Includes:
* Price
* Minimum stock threshold
* Average usage

---

### Screen: Adjust Stock

**עברית:** תיקון מלאי

Actions:
* Add stock
* Reduce stock

---

## 8. Orders

### Screen: Orders

**עברית:** הזמנות

Includes:
* Open orders
* Order history

---

### Screen: Quick Order

**עברית:** הזמנה מהירה

Based on:
* Minimum stock thresholds
* Usage patterns

---

## 9. Settings

### Screen: Salon Settings

**עברית:** הגדרות סלון

Includes:
* Currency
* Pricing
* Retroactive price updates

---

### Screen: Users

**עברית:** משתמשים

Includes:
* Team members
* Permissions

---

### Screen: Integrations

**עברית:** אינטגרציות

Includes:
* Salon software (Phorest / SalonIQ)
* Scales
* API connections

---

## Architecture Rules (Enforced)

### Rule 1 — Sale and Visit are separate (DR-004)

Per [DR-004](../decisions/DR-004-decouple-visit-checkout-from-finalize-sale.md):

`Finalize Sale` ≠ `Close Visit`

| Action | Screen | Domain |
|--------|--------|--------|
| Complete financial transaction | Finalize Sale | POS |
| Close the service visit | Checkout Visit | Visit |

### Rule 2 — Retail without Visit

`Home -> Retail Sale -> Finalize Sale` must work with `visit_id = null`.

### Rule 3 — Mix is independent

Mix lifecycle is owned by the Visit domain, not POS. Inventory deduction at `FinalizeMix` only.

### Rule 4 — Inventory UI is separate from POS

Inventory screens are distinct from Sales screens.

---

## Screen Index

| # | Screen | Domain | Hebrew |
|---|--------|--------|--------|
| 1a | ColorBarHome | Home | מסך הבית — סטייליסט |
| 1b | ReceptionHome | Home | מסך הבית — קבלה |
| 1c | ManagerHome | Home | מסך הבית — מנהל |
| 2 | Start Visit | Visit | פתיחת ביקור |
| 3 | Visit Dashboard | Visit | ניהול ביקור |
| 4 | Mix Session | Mix | סשן מיקס |
| 5 | Formula Library | Mix | ספריית פורמולות |
| 6 | Finalize Sale | POS | סיום מכירה |
| 7 | Receipt / Success | POS | אישור עסקה |
| 8 | Checkout Visit | Visit | סגירת ביקור |
| 9 | Client Profile | CRM | פרופיל לקוחה |
| 10 | Visit History | CRM | היסטוריית ביקורים |
| 11 | Stock Overview | Inventory | מלאי הסלון |
| 12 | Product Details | Inventory | פרטי מוצר |
| 13 | Adjust Stock | Inventory | תיקון מלאי |
| 14 | Orders | Ordering | הזמנות |
| 15 | Quick Order | Ordering | הזמנה מהירה |
| 16 | Salon Settings | Settings | הגדרות סלון |
| 17 | Users | Settings | משתמשים |
| 18 | Integrations | Settings | אינטגרציות |

---

## Why This Matters

* Cursor knows what to build — no improvisation.
* Figma knows what to design — no duplicates.
* QA knows what to test — every screen has one canonical name.
* Everything is aligned to DR-004 domain boundaries.

This is sufficient for a real pilot with salons.
