# Phase 8.6-8.7 Contract: Service Stages + Appointment Snapshots

**Status**: Planning (approved-architecture decisions #1 and #3)
**Depends on**: migrations 033, 034; `netlify/functions/crm-services.js`,
`netlify/functions/salon-appointments.js`
**Owner**: Agent B (Services + Split Calendar), integrated by parent owner

Covers the split-service stage model (decision #3: no generic workflow engine)
and appointment/checkout historical snapshots (decision #1: how a service is
frozen inside an appointment).

---

## 1. What Already Exists (verified)

`salon_services` (033/034) already has:
- `default_duration_minutes`, `default_price_cents`, `default_material_cost_cents`
- `default_stages JSONB` (stage template lives here — no new table needed)
- `allow_client_timing_overrides BOOLEAN`, `can_overlap_during_processing BOOLEAN`
- `linked_service_ids JSONB`
- `accent_color`, `sort_order`, `category_id`, `department_id`, `status`

`salon_appointments` (033):
- `service_id`, `service_name` (snapshot), `service_category_id`, `group_id`
- `status IN ('confirmed','in-progress','completed','cancelled','no-show')`

`salon_appointment_segments` (033):
- `staff_member_id`, `service_id`, `service_name` (snapshot),
  `service_category_id`, `segment_type` (default `service`), `label`,
  `start_time`, `end_time`, `sort_order`, `product_grams`, `notes`

Conclusion: stages are modeled as (a) a template `default_stages` on the service
and (b) concrete `salon_appointment_segments` per appointment. This is the
foundation; we extend it, we do not replace it.

---

## 2. Split-Service Stage Model (decision #3)

A stage template is a small ordered array on `salon_services.default_stages`.
It is not a workflow engine — no branching, conditions, or triggers.

### 2.1 Stage template shape (`default_stages` JSONB)

```json
[
  { "key": "application", "name": "Application",  "durationMinutes": 45, "isActiveStaffTime": true,  "order": 0 },
  { "key": "processing",  "name": "Processing",   "durationMinutes": 45, "isActiveStaffTime": false, "order": 1 },
  { "key": "finish",      "name": "Finish",       "durationMinutes": 20, "isActiveStaffTime": true,  "order": 2 }
]
```

Field meaning:
- `isActiveStaffTime`: staff is actively blocked for this stage. When `false`,
  the customer is still in-service, but the staff member may be booked for
  another active-work stage. This is the canonical overlap rule.
- Existing/proposed UI terms such as `staffRequired` or `releasesStaff` must map
  to `isActiveStaffTime`; they are not separate sources of truth.
- A regular (non-split) service has an empty `default_stages` array and uses
  `default_duration_minutes` as one continuous block.

Validation:
- 1-8 stages; durations are positive integers; `order` is unique and contiguous.
- At least one stage with `isActiveStaffTime = true`.
- Waiting/processing stages should normally set `isActiveStaffTime = false`.

### 2.2 Regular vs split at appointment time

- Regular service -> one segment (`segment_type = 'service'`) spanning the
  duration.
- Split service -> one segment per stage. Stages with
  `isActiveStaffTime = false` use `segment_type = 'processing'` or `wait`
  (staff availability freed); active stages use `segment_type = 'service'`.
- `group_id` links all segments/appointment rows of a multi-service or split
  booking so the calendar can render them as connected.

### 2.3 Services API additions (`crm-services.js`)

Reuse existing `GET /`, `POST/PATCH /departments`, `/categories`, `/services`.
The service PATCH body accepts (camelCase):

```json
{
  "name": "Full Color",
  "categoryId": "...",
  "defaultDurationMinutes": 110,
  "defaultPriceCents": 38000,
  "defaultMaterialCostCents": 6000,
  "isSplit": true,
  "defaultStages": [ /* stage template above */ ],
  "allowClientTimingOverrides": true,
  "canOverlapDuringProcessing": true,
  "linkedServiceIds": ["ssvc-..."],
  "staffPriceOverrides": { "sstf-...": 42000 }
}
```

`isSplit` is derived: `defaultStages.length > 0`. Store stages in
`default_stages`. No new table.

---

## 3. Appointment + Segment Snapshot Contract (decision #1)

Rule: an appointment freezes the values it needs at creation/edit time so later
service edits never rewrite history.

### 3.1 Snapshot fields on the appointment/segment

Already snapshotted: `service_name`, `service_category_id` on appointment and
segment. Add (migration 035, additive):

`salon_appointments`:
- `expected_price_cents INTEGER` — price expectation captured at booking (from
  service default or staff override), for variance vs checkout.

`salon_appointment_segments`:
- `stage_key TEXT` — links segment back to the template stage.
- `is_active_staff_time BOOLEAN NOT NULL DEFAULT true` — whether the stage
  blocks the assigned staff member.
- `planned_duration_minutes INTEGER` — the stage duration chosen for this
  appointment (may differ from template when overrides are allowed).

These are booking-time snapshots. The authoritative financial snapshot happens
again at checkout (see finance contract) — the appointment snapshot is
operational/expectation, the checkout snapshot is money truth.

### 3.2 Snapshot method decision

- Appointment/segment snapshots use **denormalized columns/JSON on the
  appointment**, not FKs to mutable service config, for the fields listed.
- `service_id`/`category_id` FKs remain for navigation but use
  `ON DELETE SET NULL` so history survives service archival.
- Never JOIN back to `salon_services` to display a historical appointment's
  name/price/stage — read the snapshot columns.

### 3.3 Appointment API (`salon-appointments.js`)

Reuse the existing transactional create/update (segments replaced atomically,
tenant-checked). Extend request/response to carry the snapshot fields above.
Contract rules:
- Create/update runs in one transaction (per `docs/crm-pilot-api-contract.md`
  "Appointment Transactions").
- Server validates all `customerId`, `staffMemberId`, `serviceId` belong to the
  tenant before writing.
- Server computes snapshots from current service/staff config at write time and
  stores them; it does not trust client-sent names/prices for history (client
  may propose overrides for durations/staff/price, which are validated then
  frozen).

---

## 4. Calendar Lifecycle (Phase 8.7)

### 4.1 Operational status set (extend enum, additive migration 035)

Target statuses: `scheduled`, `arrived`, `in-progress`, `waiting`, `completed`,
`cancelled`, `no-show`.

Current DB check allows `confirmed, in-progress, completed, cancelled, no-show`.
Migration 035 replaces the CHECK constraint to add `scheduled`, `arrived`,
`waiting` while keeping `confirmed` accepted for backward compatibility
(`confirmed` treated as `scheduled` in UI). No data rewrite required.

Payment status is **separate** and never stored in the appointment status
column (see finance contract) — the calendar shows a separate payment
indicator.

### 4.2 Status state machine

```
scheduled ──▶ arrived ──▶ in-progress ──▶ waiting ⇄ in-progress ──▶ completed
   │              │              │                                     
   ├───────────────┴──────────────┴──▶ cancelled                       
   └──▶ no-show                                                          
```

- `waiting` <-> `in-progress` may toggle (processing stage).
- `completed` is reachable from `in-progress` or `waiting`.
- `cancelled`/`no-show` are terminal operationally.
- `completed` does not remove the appointment from the calendar (see 4.4).

### 4.3 Drag / resize rules (define which stages move)

| Action | Moves |
|--------|-------|
| Drag appointment body | entire appointment (all segments shift together, preserving gaps) |
| Drag a single stage segment | only that stage, following stages shift only if they would overlap |
| Resize a stage edge | that stage's duration; following stages shift by the delta |
| Reassign staff on a stage | only that stage's `staff_member_id` |

Constraints:
- Prevent overlaps that double-book a staff member during a stage where
  `is_active_staff_time=true`; a stage with `is_active_staff_time=false` does
  not block the staff member.
- Invalid moves show clear feedback and are rejected server-side (409), not
  silently accepted.

### 4.4 Waiting time behavior

During a stage where `is_active_staff_time=false`:
- The customer's service remains visible on the calendar (ongoing).
- The assigned staff is bookable for another appointment.
- The waiting span is rendered as a lighter/connected block, not a solid
  staff-blocked block.

### 4.5 Permanent history

- Completed and past appointments stay in their original calendar position.
- They render a subtle completed state plus a separate payment indicator.
- They remain accessible from customer history and available to analytics.
- They are never deleted on completion; cancellation sets status, does not
  remove the row.

---

## 5. Linked Services (pilot scope)

`linked_service_ids` powers quick-add suggestions only (e.g. Highlights ->
Toner). For the pilot, linked services are offered as quick actions in the
composer; they are never auto-forced into an appointment.

---

## 6. Migration 035 Summary (additive, this contract)

- `salon_appointments.expected_price_cents`.
- `salon_appointment_segments`: `stage_key`, `is_active_staff_time`,
  `planned_duration_minutes`.
- Replace `chk_salon_appointment_status` to add `scheduled`, `arrived`,
  `waiting` (keep `confirmed`).
- All `ADD COLUMN IF NOT EXISTS`; constraint swap wrapped in a guarded `DO`
  block. No backfill required (`confirmed` stays valid).

---

## 7. Reconnaissance Findings to Address (must fix before/with this slice)

Surfaced by read-only code review; these are pre-existing correctness risks the
snapshot/calendar work depends on:

- **Category enum-dedup bug.** `crmRepository.ts` keys `ServiceCategory` by the
  `crm_category_id` enum, collapsing multiple distinct
  `salon_service_categories` rows that share a bucket. Before shipping editable
  categories (8.6), re-key `ServiceCategory` by the real DB `id` and carry
  `crmCategoryId` as a reporting attribute only. Add a partial unique index on
  `(salon_id, lower(name)) WHERE status='active'` to stop duplicate active
  categories. Do not make `crm_category_id` unique per salon.
- **Unstable segment IDs.** `salon-appointments.js` PATCH currently deletes and
  reinserts all segments, so segment IDs change on every edit. Before checkout
  snapshots, stage-specific edits, or reliable history, change PATCH to support
  explicit create/update/delete semantics:
  - update existing segments by stable `id` when the same stage remains;
  - create new IDs only for genuinely new stages;
  - delete only segments explicitly removed from the appointment;
  - preserve historical links such as future `appointment_segment_id`;
  - never allow checkout lines or audit history to reference segment IDs that
    disappear during ordinary drag/resize/stage edits.
- **No overlap enforcement on commit.** `checkOverlap` exists in
  `calendarUtils.ts` but is not called on drag/resize commit, and the function
  does no server-side conflict check. Add server-side same-staff overlap
  detection returning `409` (`TIME_CONFLICT`), respecting
  `is_active_staff_time`: waiting/processing segments with
  `is_active_staff_time=false` do not block staff; active work segments do block
  conflicting staff assignments. Add integration coverage for create, drag,
  resize, and split-stage overlap behavior. Client-side indicators are helpful
  but never sufficient.
- **Fire-and-forget service writes.** `ScheduleCatalogProvider` persists via
  `void createCrmX().catch(console.warn)` (silent loss on failure). Route
  service/category/department writes through the shared debounced autosave hook
  (doc 01 §5) with error surfacing and optimistic rollback.

## 8. Out of Scope

- Generic workflow/automation engine.
- Recurring appointments.
- Customer-specific saved timing profiles (architecture allows it later via the
  same snapshot fields; not built in the pilot).
