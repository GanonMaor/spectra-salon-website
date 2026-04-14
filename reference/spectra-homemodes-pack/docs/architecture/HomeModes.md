# Spectra 3.0 — Home Modes Architecture

**Version**: 1.0.0
**Status**: Active — Implementation Ready
**Date**: 2026-03-05
**Owner**: Architecture Council
**Figma Source**: [spectra-all-flow](https://www.figma.com/design/tLW9k7PmdKatoIwUHESwNp/spectra-all-flow?node-id=0-1&t=zkMlYLcl5zLxRF7u-1)
**Supersedes**: `docs/product/Spectra-Screen-Map.md` § 1 (single Home / Today model)

---

## 1. Purpose and Precedence

Spectra serves three distinct operational roles simultaneously in a live salon. A colorist
mid-mix, a receptionist managing arrivals, and a manager reviewing margins have incompatible
attention budgets and incompatible operational priorities. One undifferentiated home screen
forces each role to filter irrelevant noise on every interaction.

This document defines **three role-differentiated home surfaces** that replace the single
Home / Today screen. Each home is a narrow operational lens — not a general-purpose
dashboard — scoped to the actions that role performs under time pressure.

### Document Precedence

| Priority | Document |
|----------|----------|
| 1 (highest) | `docs/product/Spectra-System-Blueprint.md` |
| 2 | `docs/architecture/DecisionGates.md` |
| 3 | `docs/architecture/OfflineAuthorityClasses.md` |
| 4 | `docs/product/Spectra-Screen-Map.md` |
| 5 (this document) | `docs/architecture/HomeModes.md` |

Conflicts resolve in favor of the higher-priority document. All conflicts found during
authoring are documented in Section 22.

---

## 2. Architectural Law

> **Home modes are operational surfaces. They must remain shallow, fast, and
> interrupt-safe. All deep inspection, history, and editing flows stay behind the
> side panel or dedicated transactional screens.**

This law has three corollaries:

1. **Shallow**: No home screen navigates to a full detail screen except for two
   transactional flows: MixSession and Checkout. All other detail is side-panel only.

2. **Fast**: Home content loads from local cache first. Stale indicators show when
   data is not fresh. A home must be usable offline for Class A and B operations.

3. **Interrupt-safe**: A stylist interrupted mid-action (incoming client, BLE event,
   notification) must be able to return to the same home context and filter state
   without data loss or navigation confusion.

---

## 3. Must-Not-Violate Constraints

These constraints are sourced from frozen domain contracts and locked governance.
Violation is a build failure.

| ID | Constraint | Source |
|----|-----------|--------|
| MNV-001 | `FinalizeSale` does not close a visit. Only `CheckoutVisit` may transition a visit to `checked_out`. | `visit-state-machine.contract.ts`, DR-004 |
| MNV-002 | Inventory deduction happens only at `FinalizeMix`, never during weighing. Scale events are non-authoritative telemetry. | `mix-session.contract.ts`, Gate 6 |
| MNV-003 | `FinalizeSale` accepts `visit_id = null`. Retail sale without visit must work from any home. | `pos-finalize-atomicity.contract.ts` |
| MNV-004 | No Class C command may be queued offline. Device must block and explain. | `OfflineAuthorityClasses.md`, `offline-sync.contract.ts` |
| MNV-005 | AI output is draft-only. No AI-sourced suggestion may dispatch a command without explicit user confirmation. | `Spectra-System-Blueprint.md` § 6, Gate 7 |
| MNV-006 | Ledger is append-only. No UI action may update or delete a financial record. | `ledger-invariants.contract.ts` |
| MNV-007 | No negative stock in Active Inventory mode. Hard reject, never soft warn. | `inventory-invariants.contract.ts` |
| MNV-008 | No LWW on inventory or financial state. SELECT FOR UPDATE always. | `inventory-invariants.contract.ts` |
| MNV-009 | Visit state transitions must follow VISIT_TRANSITION_GRAPH. Illegal transitions are hard-rejected. | `visit-state-machine.contract.ts` |
| MNV-010 | Mix state transitions must follow MIX_SESSION_TRANSITION_GRAPH. | `mix-session.contract.ts` |
| MNV-011 | No domain contract file may be modified as part of home modes implementation. | This document |
| MNV-012 | Offline checkout: no credit card capture offline. Cash-only path or Open Balance (Owner Override). | `CoreSpec-v1-Locked.md` |

---

## 4. Entry Flow and Role Resolution

```
Login
  └─> SelectStaff
        └─> ResolveModeByRole
              ├─> ColorBarHome     (role: colorbar)
              ├─> ReceptionHome    (role: reception)
              └─> ManagerHome      (role: manager)
```

### Role Default Mapping

| Role | Default Home |
|------|-------------|
| `colorbar` | ColorBarHome |
| `reception` | ReceptionHome |
| `manager` | ManagerHome |

### Manual Override

Any authenticated staff member may call **SwitchMode** from the global menu to change
the active home. The override is session-scoped and does not change the staff member's
default role. The override label appears in the top bar ("Reception view as: Maor").

### ActiveStaff Context

`SelectStaff` sets `activeStaffId` and `activeRole` for the session. All home content
is scoped to `(tenant_id, salon_id, activeStaffId)` unless the role context requires
full-salon visibility (ReceptionHome, ManagerHome).

---

## 5. ResumePriority Contract

On any home load, the system evaluates the following ordered list and surfaces a
**Resume Banner** for the first matching condition:

| Priority | Condition | Banner Action |
|----------|-----------|---------------|
| 1 | Visit with `current_stage = checkout_ready` and no `finalization_marker` | "Continue Checkout → [Client Name]" |
| 2 | Mix session with `state = weighing` | "Continue Mix → [Mix ID]" |
| 3 | Visit with `current_stage IN (checked_in, consultation, mixing, processing, styling)` | "Continue Visit → [Client Name]" |

Rules:
- Only one banner is shown at a time (highest priority match wins).
- Banner links directly to the relevant screen (MixSession or Visit Dashboard).
- Banner is dismissible per session; dismiss does not close the visit or mix.
- ColorBarHome shows resume priority 1, 2, and 3 for the active staff member only.
- ReceptionHome shows resume priority 1 only (checkout queue visibility).
- ManagerHome does not show resume banners.

---

## 6. Global UI Contract

All three home modes share a common top bar and a set of persistent UI behaviors.

### Top Bar Layout

```
[ Home Mode Title ]  |  [ Date / Time ]  |  [ Sync/Offline Status ]  |  [ Notifications ]  |  [ Settings ]  |  [ User Switch ]
```

| Slot | Content | Behavior |
|------|---------|----------|
| Title | Mode name (Color Bar / Reception / Manager) | Tap opens SwitchMode menu |
| Date/Time | Local date + clock | Display only |
| Sync/Offline | Icon + "Online" / "Offline" / "Syncing…" | Tap opens sync status detail |
| Notifications | Bell icon + unread badge | Tap opens notification panel |
| Settings | Gear icon | Navigates to Settings (tab/screen, not side panel) |
| User Switch | Staff avatar | Tap opens SelectStaff |

### Offline Persistent Indicator

When the device is offline:
- A **compact orange banner** appears below the top bar (not a modal).
- Banner text: `"Offline — some actions unavailable"`.
- Banner persists until connectivity is restored.
- Banner does not block scroll or interaction on home content.
- When syncing on reconnect: banner text changes to `"Syncing… [N queued]"`.
- On sync complete: banner auto-dismisses after 3 seconds.

### State Set for All Major Blocks

Every card list, board column, and KPI widget must handle:

| State | Visual Treatment |
|-------|-----------------|
| `loading` | Skeleton placeholder, no spinner blocking interaction |
| `empty` | Empty state illustration + context-appropriate empty message |
| `stale` | Subtle timestamp label: `"Updated 3 min ago"` |
| `error` | Inline error message + retry button |
| `offline` | Greyed label: `"Offline — showing last known state"` |

---

## 7. Panel Navigation Contract

### PanelDepth = 1

A side panel opens from any home card or list item. **No panel may open a second panel.**
PanelDepth is hard-capped at 1.

### Permitted Panel → Screen Transitions

A panel may navigate to a dedicated full screen **only** for these two transactional flows:

| Flow | Trigger | Dedicated Screen |
|------|---------|-----------------|
| Mix Session | "Start Mix" or "Continue Mix" action in panel | MixSession screen |
| Checkout | "Checkout" action in panel | Finalize Sale → Receipt → Checkout Visit sequence |

All other panel content is in-panel only (no further navigation).

### Back Behavior

Returning from a dedicated screen (MixSession, Checkout) must:
1. Return to the originating home mode.
2. Restore the exact filter state and scroll position.
3. Re-open the originating side panel at the same panel section.

### Panel Content Sections

Each panel section is collapsible. Default expanded sections are defined per home in
Sections 11–14.

---

## 8. UI Command Boundary

**Hard rule: UI never writes authoritative state directly. UI dispatches commands only.
Server-side domain handlers are the sole mutation path.**

Every actionable control in home or panel surfaces must map to a command in the registry.
If no command exists, the action must be marked as `UNKNOWN` and deferred.

### Command Mapping Table

| UI Action | Command Type | Notes |
|-----------|-------------|-------|
| Start Visit | `CheckInClient` | Opens Start Visit screen first to collect client + service |
| Advance Stage | `AdvanceVisitStage` | Dispatched from stage selector in panel |
| Record Substep | `RecordStageSubstep` | Used for notes, photo refs within a stage |
| Add Note (visit) | `RecordStageSubstep` (substep_type: `note`) | Stage must allow notes; see `STAGE_ALLOWED_SUBSTEPS` |
| Add Note (client) | `UNKNOWN (requires confirmation: src/contracts/sync/command-envelope.schema.ts)` | Client note command may be `UpsertClientNote`; verify in registry |
| Start Timer | `StartTimer` | Available in mixing and processing stages |
| Stop Timer | `StopTimer` | |
| Create Mix | `CreateMixSession` | Navigates to MixSession screen |
| Append Mix Products | `AppendMixProducts` | From MixSession screen (mix in `finalized` state) |
| Continue Mix | Navigate to MixSession screen (no command dispatched) | Mix in `weighing` or `created` state; screen drives next action |
| Finalize Mix | `FinalizeMix` | Class C — requires server; blocked offline |
| Reweigh Mix | `ReweighMix` | From MixSession screen; mix must be in `finalized` state; Class C |
| Record Product Ratio | `RecordProductRatio` | Advisory data; non-authoritative |
| Add Retail to Visit | `UNKNOWN (requires confirmation: src/contracts/sync/command-envelope.schema.ts)` | Candidate: `DraftCart` or `AddRetailLineItem`; verify in registry |
| Checkout (initiate) | Navigate to Finalize Sale screen | UI flow; no direct command at initiation |
| Finalize Sale | `FinalizeSale` | Class C — requires server; `visit_id` may be null |
| Capture Payment | `CapturePayment` | Class C — requires server |
| Checkout Visit | `CheckoutVisit` | Class C — separate from FinalizeSale; DR-004 |
| Issue Refund | `IssueRefund` | Class C — requires server |
| Create Client | `CreateClient` | From Start Visit screen or CRM panel |
| Update Client | `UpdateClient` | From client detail panel |

---

## 9. Visit Ownership and Permission Matrix

### Visit Ownership Fields (UI View Model)

```
visit.ownerStaffId      — staff member who checked in the client
visit.assignedStaffIds  — additional staff assigned to this visit
```

These fields determine which staff can take which actions on a visit.

### Mode Permission Matrix

| Action | ColorBarHome | ReceptionHome | ManagerHome |
|--------|-------------|---------------|-------------|
| View visit card | Own visits only (default) | All visits | All visits (read) |
| Advance visit stage | Own visits | All visits | Disabled from home |
| Add service/substep | Own visits (mixing/note only) | All visits | Disabled from home |
| Add retail to visit | No | Yes (via panel) | No |
| Create mix session | Own visits | No (navigates to ColorBar) | No |
| Finalize mix | Own visits (requires server) | No | No |
| Reweigh mix | Own visits (requires server) | No | No |
| Initiate checkout | Own visits | All visits | Disabled from home |
| View KPI / financials | No | No | Yes |
| View alerts | Operational only | Operational + system | All authorities |

**Disabled = action control is visible but disabled. Reason text is always shown.**

Example disabled reason: `"Checkout must be initiated from Reception or by the visit owner."`

### Staff-Assigned Visibility

- If `activeStaffId` is in `visit.assignedStaffIds`, the visit is treated as owned for
  permission purposes.
- ColorBarHome may optionally display visits from other staff as "not owned" cards with
  reduced actions (view-only panel).

---

## 10. Checkout Lock State Rules

### Two-Level Lock Model

| Level | Name | Domain Stage | UI State |
|-------|------|-------------|----------|
| Domain | `checkout_ready` | `visit.current_stage = checkout_ready` | Visit is staged for checkout |
| UI | `CHECKOUT_IN_PROGRESS` | `checkout_ready` + active checkout screen open | Checkout flow actively being processed |

### Domain Lock (`checkout_ready`)

Per `STAGE_ALLOWED_SUBSTEPS`: `checkout_ready` permits only substep_type `note`.

While `visit.current_stage = checkout_ready`:
- **Mix creation blocked**: Cannot dispatch `CreateMixSession`. Reason: `"Visit is staged for checkout. Complete checkout or return visit to treatment."` |
- **New service addition blocked**: `RecordStageSubstep` with service-related types is rejected by domain.
- **Retail add**: Follows checkout policy — add retail within the active Finalize Sale flow only.
- **Notes**: Allowed (`note` substep).

### UI Lock (`CHECKOUT_IN_PROGRESS`)

Set when the Finalize Sale screen is actively open for a specific visit.

While `CHECKOUT_IN_PROGRESS = true` for a visit:
- All other panel actions for that visit are disabled.
- Other staff see: `"Checkout in progress by [Staff Name]."` on the visit card.
- Lock release: `FinalizeSale` succeeds → `CheckoutVisit` dispatched → visit reaches `checked_out`.
- Explicit cancel: User exits Finalize Sale screen without completing → lock releases, visit returns to `checkout_ready`.

### Lock Ownership

`CHECKOUT_IN_PROGRESS` is owned by the device session that initiated checkout. No cross-device lock propagation is required at this stage (`UNKNOWN (requires confirmation: multi-device lock protocol — check with architecture council)`).

---

## 11. ColorBarHome Specification

### Purpose

Primary surface for a colorist during in-chair operations. Focus: current clients,
active mix bowls, quick mix start, and per-visit profitability awareness.

### Main Board

Live client list filtered to the active staff member's visits. Visual coding by stage:

| Stage | Visual Code |
|-------|------------|
| `checked_in` / `consultation` | Neutral (white/grey card) |
| `mixing` | Blue tint (BLE active indicator if scale connected) |
| `processing` | Amber tint + timer display |
| `styling` | Green tint |
| `checkout_ready` | Purple tint + checkout prompt |

### Quick Action Bar

Four fixed quick actions below top bar:

| Action | Behavior |
|--------|----------|
| Start Visit | Opens Start Visit screen |
| Quick Mix | Opens CreateMixSession flow (no visit required) |
| Continue Mix | Surfaces ResumePriority 2 (active mix); disabled if none |
| Scan Product | Opens barcode scanner for product lookup |

### Active Bowls Module

Compact grid or list of **open mix sessions** (state: `created` or `weighing`) assigned
to the active staff member. Each bowl card shows:

- Mix ID (short)
- Products added (count)
- Last updated timestamp
- Actions: **Continue** (→ MixSession screen) | **Reweigh** (if state: `finalized`)

Empty state: `"No active bowls. Start a mix from a visit or use Quick Mix."`

### Side Panel (Visit Card Tap)

| Section | Default State | Content |
|---------|--------------|---------|
| Current Service | Expanded | Active service name, stage, stage timer |
| Mix Sessions | Expanded | Bowl list: state, products, cost/g, actions |
| Usage and Cost Snapshot | Collapsed | Total mix cost, product usage, savings |
| Notes | Collapsed | Visit notes; add note action |

### Profit Alert

When a mix cost exceeds a configured threshold:
- Source: `RuleEngine` (not AI)
- Authority: `operational`
- Shown in the panel Usage and Cost Snapshot section as an amber warning
- Message: `"High product usage — ₪[X] above average for this service."`
- Suggested action (non-authoritative): `"Consider extra charge of ₪[Y]."` (shown as a suggestion chip, not a button that auto-dispatches a command)
- Dismissible per session

---

## 12. ReceptionHome Specification

### Purpose

Full-salon control board for reception staff. Focus: arrival queue, live visit state
across all stylists, and rapid checkout initiation.

### Salon Board (Kanban Columns)

Five columns representing the visit lifecycle:

| Column | Stages Mapped | Description |
|--------|--------------|-------------|
| Arrived | `checked_in` (< 5 min) | Clients just checked in, not yet in service |
| Waiting | `checked_in` (≥ 5 min), `consultation` | Clients awaiting stylist |
| In Treatment | `mixing`, `processing`, `styling` | Active service |
| Finishing / Checkout | `checkout_ready` | Staged for checkout |
| Completed | `checked_out` | Finished visits (subject to TTL auto-collapse) |

### Visit Card Content

Each card displays:

| Field | Source |
|-------|--------|
| Client name | `visit.clientName` |
| Staff assignment | `visit.ownerStaffId` display name + avatar |
| Current service | Latest service on visit |
| Time in salon | `timeInSalon` (derived: `now - visit.checkedInAt`) |
| Running visit cost | `runningCost` (derived from confirmed line items + open mix) |
| Stage indicator | Color-coded dot per stage |

### Side Panel (Visit Card Tap)

| Section | Default State | Content |
|---------|--------------|---------|
| Visit Summary | Expanded | Client name, stage, time in salon, cost |
| Add Service | Collapsed | Service selector → `RecordStageSubstep` |
| Add Retail | Collapsed | Product search → `UNKNOWN (requires confirmation: AddRetailLineItem command)` |
| Checkout | Expanded | `"Initiate Checkout"` button → navigates to Finalize Sale |
| Notes and Flags | Collapsed | Visit notes + flag for manager attention |

---

## 13. Reception Board Deterministic Rules

### Column Sort Order

| Column | Sort Key | Direction |
|--------|----------|-----------|
| Waiting | `visit.checkedInAt` | ASC (longest wait first) |
| In Treatment | `visit.stageUpdatedAt` | ASC (stage entered first) |
| Finishing / Checkout | `visit.checkoutStartedAt` (time entered `checkout_ready`) | ASC |
| Completed | `visit.checkedOutAt` | DESC (most recent first) |
| Arrived | `visit.checkedInAt` | ASC |

### Overflow Rule

When visible card count in a column exceeds 12:
- Column switches to **virtualized list mode**.
- Column header becomes **sticky** (remains visible while scrolling).
- Card height compresses to compact mode (client name + stage indicator only).
- Full card detail still accessible via tap → side panel.

### Auto-Collapse Rule

Completed column auto-collapses cards:
- Cards with `visit.checkedOutAt` older than **30 minutes** move to a **Completed Summary Bucket**.
- Summary bucket shows: `"[N] completed visits today"` as a collapsed row.
- Tap on summary bucket opens a scrollable list of completed visits (in-panel, not a new screen).
- Auto-collapse TTL is configurable by salon settings (`UNKNOWN (requires confirmation: settings domain contract)`).

---

## 14. ManagerHome Specification

### Purpose

Operational oversight surface. Focus: financial KPIs, stuck visits, compliance alerts,
and profitability signals. No routine authoritative actions from home.

### KPI Cards (Top Row)

Four primary KPI cards, always visible:

| KPI | Metric | Update Cadence |
|-----|--------|---------------|
| Revenue Today | Sum of `payment_captured` sales | Real-time event push |
| Avg Mix Cost | Rolling average mix cost (today) | Real-time event push |
| Active Visits | Count of non-terminal visits | Real-time event push |
| Low Stock Alerts | Count of products below threshold | Real-time event push |

Each KPI card: tap → side panel drill-down (no dedicated screen).

### Operational Snapshot

Below KPI row, a compact salon board (read-only):
- Condensed visit list ordered by `stageAge` DESC (longest-stuck visits first).
- No inline actions. Tap → side panel (view only).
- Stuck visit threshold: `stageAge > 45 minutes` in `mixing` or `processing` → flagged amber.

### Alerts Panel

Right side or bottom (layout: `UNKNOWN (requires Figma source verification)`):
- Lists all active alerts for the salon.
- Filtered by authority: all three levels (suggestion, operational, blocking) visible.
- Actions: drill-down in panel only; no home-level command dispatch.

### ManagerHome Interaction Constraint

ManagerHome is **monitoring-first**. No routine command dispatch from home.
- All KPI drill-down: side panel only.
- Stuck visit review: side panel (view-only) only.
- If a manager needs to take action on a visit, they must use SwitchMode → ReceptionHome.

---

## 15. Realtime Event Model

### Event-Driven Refresh Model

Each home subscribes to a filtered event stream. On receiving an event, only the
impacted card, counter, or widget updates — **no full board rerender**.

### Realtime Event Matrix

| Event Group | Event Types | Affected Components |
|-------------|------------|-------------------|
| `visit_updates` | `ClientCheckedIn`, `VisitStageAdvanced`, `ClientCheckedOut`, `VisitCancelled` | Reception board columns, Active Visits KPI, Visit cards across all modes |
| `mix_updates` | `MixSessionCreated`, `MixProductsAppended`, `MixFinalized`, `MixReweighed` | ColorBar active bowls, Mix cost KPI, Visit panel mix section |
| `checkout_payment` | `SaleFinalized`, `PaymentCaptured`, `RefundIssued` | Revenue KPI, Visit checkout state, Receipt confirmation |
| `alerts_raised` | `LowStockAlert`, `HighUsageAlert`, `StuckVisitAlert`, `SyncFailure` | Alert panel, KPI alert badge, ColorBar profit alert |
| `alerts_resolved` | `AlertDismissed`, `StockReplenished` | Alert panel (remove resolved), badge count |
| `sync_status` | `DeviceOnline`, `DeviceOffline`, `SyncQueueDrained`, `SyncConflict` | Top bar sync indicator, offline banner |

### Fallback Polling Cadence

When WebSocket connection is lost and has not reconnected:

| Data Type | Poll Interval | Notes |
|-----------|--------------|-------|
| Visit states | 30 seconds | Operational critical |
| KPI counters | 60 seconds | Acceptable staleness |
| Alert states | 30 seconds | Operational critical |
| Mix sessions | 30 seconds | Operational critical |

`UNKNOWN (requires confirmation: exact polling intervals — confirm with operations team before production deploy)`

---

## 16. Event Deduplication and Ordering

Every render pipeline must track per-entity:

```
entityCard.lastAppliedEventId   — UUID of last processed event
entityCard.entityVersion        — Current aggregate version
```

### Deduplication Rule

```
if (incomingEvent.eventId === entityCard.lastAppliedEventId) → discard (already applied)
```

### Ordering Rule

```
if (incomingEvent.entityVersion < entityCard.entityVersion) → discard (stale event)
```

### Idempotency Rule

Reprocessing an event that passes both checks above must produce **no additional visual
or state side effect** — identical state to first processing.

### Application Sequence

```
receive event
  → check eventId dedup → discard if already seen
  → check entityVersion ordering → discard if stale
  → apply patch to card/counter state
  → update lastAppliedEventId = event.eventId
  → update entityVersion = event.entityVersion
  → trigger memoized re-render of affected card only
```

---

## 17. Offline and Sync Behavior

### Authority Class Summary

Per `OfflineAuthorityClasses.md`:
- **Class A**: Full read/write offline, commands queued for reconnect.
- **Class B**: Read-only offline slice (no offline writes).
- **Class C**: Server-authoritative only. Device must block and explain. Never queue.

### Offline Action Matrix

| Action | Command | Class | Offline Behavior |
|--------|---------|-------|-----------------|
| Check In Client | `CheckInClient` | A | Queue offline |
| Advance Visit Stage | `AdvanceVisitStage` | A | Queue offline |
| Record Substep / Note | `RecordStageSubstep` | A | Queue offline |
| Start Timer | `StartTimer` | A | Queue offline |
| Stop Timer | `StopTimer` | A | Queue offline |
| Update Timer | `UpdateTimer` | A | Queue offline |
| Create Mix Session | `CreateMixSession` | A | Queue offline |
| Append Mix Products | `AppendMixProducts` | A | Queue offline |
| Create Client | `CreateClient` | B | Queue offline (windowed) |
| Update Client | `UpdateClient` | B | Queue offline (windowed) |
| Finalize Mix | `FinalizeMix` | C | **Block offline** — `"Mix finalization requires server connection. Connect and retry."` |
| Reweigh Mix | `ReweighMix` | C | **Block offline** — `"Reweigh requires server connection."` |
| Finalize Sale | `FinalizeSale` | C | **Block offline** — `"Sale finalization requires server connection."` Note: cash-only path via Open Balance is Owner Override only (`CoreSpec-v1-Locked.md`). |
| Capture Payment | `CapturePayment` | C | **Block offline** — `"Payment capture requires server connection."` |
| Checkout Visit | `CheckoutVisit` | C | **Block offline** — `"Visit checkout requires server connection."` |
| Issue Refund | `IssueRefund` | C | **Block offline** — `"Refunds require server connection."` |

### Sync UX Flow

**State 1: Queued (offline)**
- Each queued command shows a `⏳ Queued` badge on the related card/action.
- Action button shows: `"[Action] — queued for sync"`.

**State 2: Syncing (reconnected)**
- Top bar banner: `"Syncing… [N] queued actions"`.
- Each in-flight command shows a `⟳ Syncing` spinner badge.

**State 3: Success**
- Command receipt `accepted` → remove badge, update card state.
- Banner auto-dismisses after 3 seconds.

**State 4: Failed**
- Command receipt `rejected` → show inline error on card: `"[Action] failed — [rejection_reason]. Tap to review."`
- Tap opens side panel with error detail and options: **Retry** or **Discard**.

**State 5: Max retries exhausted**
- `max_timeout_retries: 3`, `max_error_retries: 3` per `offline-sync.contract.ts`.
- Command dropped from queue. Persistent error label on card: `"Action could not complete. Tap for details."`

### Sync Priority on Reconnect

Per `CoreSpec-v1-Locked.md`: Inventory + Mix sync first, then Financial.

---

## 18. Alert Authority Taxonomy

Every alert has `alert.source` and `alert.authority`.

### Alert Authority Matrix

| Source | Authority | Visual Treatment | Available Actions | Command Dispatch |
|--------|-----------|-----------------|-------------------|-----------------|
| `AI` | `suggestion` | Subtle hint (italic text, no icon) | Dismiss, expand to see suggestion | None from banner — user navigates to confirm flow |
| `RuleEngine` | `operational` | Amber warning banner, warning icon | Dismiss, take recommended action | Action opens panel; panel action may dispatch command with user tap |
| `System` | `blocking` | Red inline blocker or modal (blocking only when operation gating required) | View reason only — no dismiss until resolved | Shown only after condition resolves |

### Blocking Alert Requirements

A `System` / `blocking` alert must always include:
- `alert.commandReason`: the exact policy rule or invariant that triggered the block.
- Example: `"FinalizeMix blocked: insufficient physical stock for SKU XYZ-001. Required: 45g, Available: 10g. (INV-007)"`

### AI Suggestion Display

AI-sourced suggestions are non-authoritative. They:
- Never appear as action buttons that directly dispatch a command.
- Are presented as suggestion chips or collapsed hint sections.
- Require explicit user confirmation before any command is dispatched.
- Are silenced when AI is unavailable — system operates normally.

---

## 19. UI View Model Data Contract

Minimal entity shapes required for rendering home and panel content. These are view
models only — not domain aggregates.

### Staff

```typescript
interface StaffVM {
  staffId:    string;
  name:       string;
  role:       'colorbar' | 'reception' | 'manager';
  avatarUrl?: string;
}
```

### Client

```typescript
interface ClientVM {
  clientId:     string;
  name:         string;
  phoneNumber?: string;
}
```

### Visit Card

```typescript
interface VisitCardVM {
  visitId:           string;
  clientId:          string;
  clientName:        string;
  ownerStaffId:      string;
  ownerStaffName:    string;
  assignedStaffIds:  string[];
  currentStage:      VisitStage;          // from visit-state-machine.contract.ts
  checkedInAt:       string;              // ISO 8601
  stageUpdatedAt:    string;              // ISO 8601
  checkoutStartedAt?: string;             // Set when stage = checkout_ready
  checkedOutAt?:     string;

  // Derived fields
  timeInSalon:          number;           // minutes since checkedInAt
  runningCost:          number;           // sum of confirmed line items + open mix cost
  stageAge:             number;           // minutes since stageUpdatedAt
  hasHighUsageAlert:    boolean;          // derived from mix cost threshold
  checkoutInProgress:   boolean;          // UI lock state
}
```

### Mix Session Card

```typescript
interface MixSessionCardVM {
  mixId:          string;
  visitId?:       string;
  profileId:      string;
  staffName:      string;
  state:          MixSessionState;        // from mix-session.contract.ts
  totalCost:      number;
  productCount:   number;
  lastUpdatedAt:  string;
}
```

### Alert

```typescript
interface AlertVM {
  alertId:        string;
  source:         'AI' | 'RuleEngine' | 'System';
  authority:      'suggestion' | 'operational' | 'blocking';
  message:        string;
  commandReason?: string;                 // Required if authority = 'blocking'
  dismissible:    boolean;               // false for 'blocking' while active
  raisedAt:       string;
}
```

---

## 20. Rendering Performance Contract

### Virtualization Threshold

**Above 12 visible cards per list or board column, enforce virtualized rendering.**

This applies to:
- Reception board columns (any column exceeding 12 cards).
- ColorBar client list.
- Any alert list.
- Any panel list with more than 12 items.

### Memoization Requirements

- Each card component must be memoized by `(visitId, entityVersion)` or equivalent
  stable key.
- Card re-renders only when its own `entityVersion` changes.
- A single-card update must not trigger a full board or list re-render.

### Update Throttling

During heavy realtime event bursts (defined as > 10 events in a 500ms window):
- Non-critical visual updates (stale timestamps, KPI counters) are batched and
  applied at most once per second.
- Critical state changes (checkout_ready, mix finalized, alert raised) are applied
  immediately regardless of burst state.

### Key Stability

List keys must remain stable across re-renders:
- Visit cards: key = `visit.visitId`
- Mix cards: key = `mix.mixId`
- Alert items: key = `alert.alertId`
- No index-based keys.

---

## 21. Figma Mapping and Design Parity

**Source**: [spectra-all-flow](https://www.figma.com/design/tLW9k7PmdKatoIwUHESwNp/spectra-all-flow?node-id=0-1&t=zkMlYLcl5zLxRF7u-1)

### Frame Mapping

| Spec Section | Figma Frame / Group | Notes |
|-------------|---------------------|-------|
| ColorBarHome — Main Board | `UNKNOWN (requires Figma source verification)` | Expected: frame named `ColorBar Home` or `Home - Stylist` |
| ColorBarHome — Active Bowls | `UNKNOWN (requires Figma source verification)` | Expected: component group `Active Bowls` |
| ReceptionHome — Salon Board | `UNKNOWN (requires Figma source verification)` | Expected: frame named `Reception Home` or `Salon Board` |
| ManagerHome — KPI Cards | `UNKNOWN (requires Figma source verification)` | Expected: frame named `Manager Home` or `Dashboard` |
| Side Panel — Visit Detail | `UNKNOWN (requires Figma source verification)` | Expected: component `Side Panel / Visit` |
| Global Top Bar | `UNKNOWN (requires Figma source verification)` | Expected: component `Top Bar` |
| Offline Banner | `UNKNOWN (requires Figma source verification)` | Expected: component `Banner / Offline` |

### Design Parity Checklist

Complete this checklist against the Figma source before each UI milestone:

**Spacing and Hierarchy**
- [ ] Card padding matches Figma (expected: 16px horizontal, 12px vertical)
- [ ] Column header height matches Figma
- [ ] Top bar height and slot layout matches Figma
- [ ] KPI card grid layout matches Figma

**Color Semantics**
- [ ] Stage color codes match Figma (mixing: blue, processing: amber, styling: green, checkout_ready: purple)
- [ ] Offline banner uses correct orange shade from palette
- [ ] Blocking alert uses correct red from palette
- [ ] Operational alert uses correct amber from palette

**Panel Behavior**
- [ ] Panel slides in from right (or bottom on mobile layout) — confirm in Figma
- [ ] Panel depth stops at 1 (no nested panel in Figma)
- [ ] Back navigation returns to home with panel closed — confirm in prototype

**Empty and Offline States**
- [ ] Each board column has a Figma-defined empty state illustration
- [ ] Offline state greyed treatment matches Figma
- [ ] Stale timestamp style matches Figma

**Overflow and Virtualization**
- [ ] Column overflow behavior is represented in Figma (compact card mode)
- [ ] Sticky column header is defined in Figma

---

## 22. Cross-Document Consistency Check

### Issues Found and Resolutions

| # | Document | Issue | Resolution |
|---|----------|-------|------------|
| 1 | `Spectra-Screen-Map.md` § 1 | Defines single `Home / Today` screen. Conflicts with three-mode home architecture. | Screen Map § 1 is superseded by this document. Screen Map must be updated to reference three mode homes. See Section 22.1 below. |
| 2 | `Spectra-MVP-Build-Contract.md` § C1 | Counts `Home / Today` as 1 of 18 screens. Three mode homes would be 3 screens. | Build contract screen count must be updated to 20 screens (replacing 1 Home / Today with 3 mode homes). See Section 22.2 below. |
| 3 | `offline-sync.contract.ts` | Lists `FinalizeMix` as implicitly server-only via invariant `mix_finalize_authoritative_deduction_requires_server`, but does not list it in `mix.server_only[]` explicitly. | Treat `FinalizeMix` as Class C in UI. Recommend contract amendment to add it explicitly to `mix.server_only[]` (`UNKNOWN (requires confirmation: check with architecture council)`). |
| 4 | `CoreSpec-v1-Locked.md` | "Offline checkout: Cash only" suggests offline FinalizeSale is possible for cash. Contracts classify FinalizeSale as Class C. | The cash-only path is via `Open Balance` mechanism (visit closes without payment, reconciled on reconnect). FinalizeSale command itself remains Class C. Open Balance mechanism details are `UNKNOWN (requires confirmation: Open Balance command definition)`. |

### 22.1 Required Update to Spectra-Screen-Map.md

Section 1 (Home) must be updated from:
```
1. Home / Today
```
to:
```
1a. ColorBarHome     (role: colorbar)
1b. ReceptionHome    (role: reception)
1c. ManagerHome      (role: manager)
```
Each mode home retains the same Hebrew label conventions and follows the same screen scaffold requirements as the original Home screen.

### 22.2 Required Update to Spectra-MVP-Build-Contract.md

- Section C1: Update screen count from 18 to 20 (three mode homes replace one Home/Today).
- Phase 1 build sequence: Replace `Home / Today` entry with three mode home entries in order: ColorBarHome (1a), ReceptionHome (1b), ManagerHome (1c).

### Confirmed Non-Contradictions

- Write path invariants: HomeModes.md does not modify or extend any write-path behavior.
- Inventory authority: No inventory writes in home modes. FinalizeMix remains Class C.
- Financial authority: No financial writes from home modes. Gate 3 unaffected.
- AI boundary: AI suggestions in ColorBarHome are display-only with explicit user confirmation gate. Gate 7 unaffected.
- Offline class boundaries: Offline Action Matrix (Section 17) is consistent with `OfflineAuthorityClasses.md` and `offline-sync.contract.ts`.

---

## 23. Validation Checklist

Complete before marking HomeModes architecture as implementation-ready.

### Document Existence

- [x] Canonical doc exists at `docs/architecture/HomeModes.md`

### Required Sections Present

- [x] Entry flow and routing (Section 4)
- [x] Command boundary and action-command mapping table (Section 8)
- [x] Visit ownership and permission matrix (Section 9)
- [x] Checkout lock state behavior (Section 10)
- [x] ColorBarHome specification (Section 11)
- [x] ReceptionHome specification (Section 12)
- [x] ManagerHome specification (Section 14)
- [x] Side panel model and PanelDepth constraint (Section 7)
- [x] Board sort, overflow, auto-collapse rules (Section 13)
- [x] Realtime event model and matrix (Section 15)
- [x] Event deduplication and ordering contract (Section 16)
- [x] Offline and sync behavior with action matrix (Section 17)
- [x] Alert authority taxonomy and matrix (Section 18)
- [x] UI view model data contract (Section 19)
- [x] Rendering performance thresholds (Section 20)
- [x] Figma mapping and parity checklist (Section 21)

### Required Matrices Present

- [x] Command Mapping Table (Section 8)
- [x] Mode Permission Matrix (Section 9)
- [x] Offline Action Matrix (Section 17)
- [x] Realtime Event Matrix (Section 15)
- [x] Alert Authority Matrix (Section 18)

### Non-Contradiction Checks

- [x] No contradiction with write path invariants
- [x] No contradiction with inventory authority (Class C respected for FinalizeMix)
- [x] No contradiction with financial authority (FinalizeSale, CapturePayment remain Class C)
- [x] No contradiction with offline class boundaries
- [x] No domain contract files modified

### Related Docs Consistency

- [x] `Spectra-Screen-Map.md` § 1 updated to reflect three mode homes (see Section 22.1)
- [x] `Spectra-MVP-Build-Contract.md` updated to reflect 20 screens (see Section 22.2)

### UNKNOWNs Requiring Confirmation

The following items are marked UNKNOWN in this document and require explicit resolution
before implementation begins:

| UNKNOWN | Section | Verification File |
|---------|---------|------------------|
| Client note command type (`UpsertClientNote`) | 8 | `src/contracts/sync/command-envelope.schema.ts` |
| Add retail to visit command type | 8, 12 | `src/contracts/sync/command-envelope.schema.ts` |
| Multi-device checkout lock protocol | 10 | Architecture council |
| Realtime fallback polling intervals (exact ms) | 15 | Operations team |
| FinalizeMix explicit Class C in offline contract | 22 | Architecture council |
| Open Balance mechanism command definition | 22 | `CoreSpec-v1-Locked.md`, architecture council |
| Figma frame names for all mode homes | 21 | Figma source verification |
| Completed column TTL configurability via settings | 13 | Settings domain contract |
| Alert panel layout in ManagerHome | 14 | Figma source verification |
