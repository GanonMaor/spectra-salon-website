# Spectra MVP Build Contract — React Native iPad (Expo)

**Status:** Active — Canonical execution contract
**Date:** 2026-03-05
**Owner:** Product / Architecture Council
**Target:** React Native iPad app (Expo)
**Scope:** 20 MVP Pilot screens, UI scaffolds only
**Note (2026-03-05):** Screen count updated from 18 to 20. Three role-differentiated home
modes (ColorBarHome, ReceptionHome, ManagerHome) replace the single Home / Today screen.
See `docs/architecture/HomeModes.md` for full specification.

---

## Purpose

This document is the **locked execution contract** for building the Spectra MVP Pilot UI.
It defines: what to build, in what order, under what constraints, and what "done" means.

Any AI agent (Claude Code, Cursor) or developer building screens MUST follow this contract.

### Source Documents

| Document | Path |
|----------|------|
| Screen Map (base) | [Spectra-Screen-Map.md](Spectra-Screen-Map.md) |
| Screen Map (revision) | [Spectra-Screen-Map-Revision.md](Spectra-Screen-Map-Revision.md) |
| DR-004 (Sale/Visit separation) | [DR-004](../decisions/DR-004-decouple-visit-checkout-from-finalize-sale.md) |
| Figma source | [spectra-all-flow](https://www.figma.com/design/tLW9k7PmdKatoIwUHESwNp/spectra-all-flow?node-id=0-1&m=dev&t=zkMlYLcl5zLxRF7u-1) |

---

## Non-Negotiable Constraints

These constraints are **locked**. Violation of any of these is a build failure.

### C1 — Fixed scope: exactly 20 screens

Build only the 20 screens listed in the Screen Map. Do not add, rename, or create alternate versions.
The three home modes (ColorBarHome, ReceptionHome, ManagerHome) each count as one screen.
Architecture specification: `docs/architecture/HomeModes.md`.

### C2 — DR-004: Finalize Sale does NOT close Visit

- `FinalizeSale` is visit-agnostic (INV-DR004-1). It must succeed with `visit_id = null`.
- Only `CheckoutVisit` may transition a Visit to `checked_out` (INV-DR004-2).
- The Finalize Sale screen must display an explicit inline note:
  `"Finalize Sale does NOT close Visit. Use Checkout Visit."`

### C3 — Retail without Visit

The path `Home -> Retail Sale -> Finalize Sale` must work without creating a Visit.
The Finalize Sale screen must accept `visit_id = null` context.

### C4 — Mix is independent from Sale

Mix lifecycle is owned by the Visit domain. Inventory deduction happens at `FinalizeMix`, not at `FinalizeSale`. Do not couple Mix completion to Sale completion.

### C5 — Inventory UI is separate from POS UI

Inventory screens (Stock Overview, Product Details, Adjust Stock) are distinct from Sales screens (Finalize Sale, Receipt / Success). No shared screens between these domains.

### C6 — UI-only scope

No backend refactors, no schema changes, minimal wiring. Use mock/in-memory data fixtures unless stable endpoints already exist.

### C7 — Anti-duplication

If overlap is found during implementation, keep only the canonical screen from the Screen Map and note the duplicate. Do not create "alternate" or "v2" versions.

---

## Navigation Contract

### Routing

- Use the existing navigation convention in the repo:
  - If `expo-router` is present, use file-based routing under `app/`.
  - Otherwise, use the existing React Navigation setup (Stack + Tabs as already used).
- Create ONE canonical route map file (`AppRoutes`) that lists all 18 routes with:
  - `ScreenID` (1–18)
  - `ScreenName` (EN)
  - `HebrewLabel` (עברית)
  - `Domain`
  - `RoutePath`

### Reachability

- All 18 screens must be reachable via navigation. No orphan pages.
- Add a "Flow shortcuts" section on Home for testing/demo quick access to core flow.

### State

- Use a shared mock data layer (in-memory deterministic fixtures):
  - visits, clients, mixes, products, orders
- Fixtures must be deterministic: same data every launch for consistent demos.
- No persistence required yet.

---

## iPad UX Contract

- iPad-first layout (landscape friendly).
- Minimum touch target height: 44px. Prefer 52–60px for primary actions.
- Comfortable padding (16–24) and section spacing.
- Use `SafeAreaView` and keyboard-safe patterns for inputs.
- Where useful, split content into sections or two-column layouts INSIDE a screen (do not introduce new screens for this).
- Prefer `FlatList` / `SectionList` for lists, scrollable layouts where needed.

---

## Shared UI Primitives

Create/reuse a minimal set of shared components for consistency:

| Component | Purpose |
|-----------|---------|
| `ScreenShell` | SafeAreaView + header (title EN + Hebrew label) + optional subtitle + content container |
| `PrimaryButton` | Consistent sizing, disabled/loading states |
| `SecondaryButton` | Consistent sizing, disabled/loading states |
| `InfoCard` | Simple card container for summaries |
| `ListRow` | Row with title, subtitle, right chevron/action |
| `SectionHeader` | Optional section divider with label |

Keep it lightweight. Do not add heavy new dependencies.

---

## Screen Scaffold Requirements

For EACH of the 18 screens:

1. Display English screen name + Hebrew label in the header (always).
2. Include the primary goals/sections as placeholder UI.
3. Render the key actions/buttons as defined in the Screen Map.
4. Add empty states (e.g., "No visits yet") and loading placeholders.
5. Use mock fixtures / in-memory data initially.

---

## Dev Debug Banner

Add a dev-only banner at the top of each screen (behind a single flag):

```typescript
const SHOW_DEBUG_BANNER = __DEV__ && true;
```

Banner displays:
- `ScreenID`
- `Domain`
- `PrimaryActions` (comma-separated)

### Removal Criteria

Remove the debug banner after validating ALL of:
- 18/18 routes reachable
- DR-004 separation visually obvious in core flow
- Retail-without-Visit path works from Home
- No duplicate screen variants exist

Remove before first external pilot demo.

---

## Enforced Build Sequence

Implementation MUST follow this exact order. No deviation.

### Phase 0 — Shared primitives

Create the shared UI components (`ScreenShell`, buttons, `InfoCard`, `ListRow`) before any screens.

### Phase 1 — Core flow (demo-critical)

Must be fully navigable end-to-end after this phase.

| Order | Screen | Domain |
|-------|--------|--------|
| 1a | ColorBarHome | Home |
| 1b | ReceptionHome | Home |
| 1c | ManagerHome | Home |
| 2 | Start Visit | Visit |
| 3 | Visit Dashboard | Visit |
| 4 | Mix Session | Mix |
| 5 | Finalize Sale | POS |
| 6 | Receipt / Success | POS |
| 7 | Checkout Visit | Visit |

### Phase 2 — Supporting context

| Order | Screen | Domain |
|-------|--------|--------|
| 8 | Formula Library | Mix |
| 9 | Client Profile | CRM |
| 10 | Visit History | CRM |

### Phase 3 — Operations (inventory + orders)

| Order | Screen | Domain |
|-------|--------|--------|
| 11 | Stock Overview | Inventory |
| 12 | Product Details | Inventory |
| 13 | Adjust Stock | Inventory |
| 14 | Orders | Ordering |
| 15 | Quick Order | Ordering |

### Phase 4 — Admin basics

| Order | Screen | Domain |
|-------|--------|--------|
| 16 | Salon Settings | Settings |
| 17 | Users | Settings |
| 18 | Integrations | Settings |

Note: Salon Settings must include a "Retroactive price update" placeholder section/toggle.

---

## Validation Gate (Must Pass Before Completion)

| Check | Criteria |
|-------|----------|
| Screen count | 18/18 scaffolded and reachable |
| DR-004 visible | Finalize Sale and Checkout Visit are clearly separate screens with distinct actions |
| Retail path | Home -> Retail Sale -> Finalize Sale works with no Visit |
| No duplicates | No alternate/v2 screen variants exist |
| Consistent naming | All screen names match canonical Screen Map exactly |
| Debug banner | Present on all screens (dev mode), shows correct ScreenID/Domain/Actions |

---

## Required Deliverables (Print At End)

After implementation is complete, output:

### 1. Screen Checklist (18/18)

```
[ ] 1. Home / Today
[ ] 2. Start Visit
[ ] 3. Visit Dashboard
[ ] 4. Mix Session
[ ] 5. Finalize Sale
[ ] 6. Receipt / Success
[ ] 7. Checkout Visit
[ ] 8. Formula Library
[ ] 9. Client Profile
[ ] 10. Visit History
[ ] 11. Stock Overview
[ ] 12. Product Details
[ ] 13. Adjust Stock
[ ] 14. Orders
[ ] 15. Quick Order
[ ] 16. Salon Settings
[ ] 17. Users
[ ] 18. Integrations
```

### 2. Route Index Table

```
Route -> Screen (EN) -> Hebrew -> Domain
```

### 3. Files Created/Changed

List of all file paths.

### 4. Run Instructions

Exact commands to launch the app and navigate.

### 5. Open TODOs (max 5)

Any unresolved questions or deferred items.

---

## Execution Notes

- Keep changes minimal and local. Avoid refactoring unrelated code.
- Respect existing repo conventions (folder structure, naming, lint rules).
- Do not add new screens beyond the 18.
- Do not rename canonical screens without updating all three documents (Screen Map, Revision, this contract).
