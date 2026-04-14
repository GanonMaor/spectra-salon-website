# HomeModes Architecture Guardrails

**Version**: 1.1.0
**Status**: Active — Supersedes `HomeModes-Claude-Guardrails.md` v1.0
**Date**: 2026-03-05
**Authority**: Architecture Council

---

## 0. Incident Record

**Run 1 boundary breaches (2026-03-05):**
1. Claude directly edited `docs/product/Spectra-Screen-Map.md` without explicit approval.
2. Claude directly edited `docs/product/Spectra-MVP-Build-Contract.md` without explicit approval.
3. Screen count was inflated 18 → 20 without explicit product decision.
4. Home was modeled as 3 separate screens (scope inflation) instead of the default 1-screen + mode-state model.

These guardrails prevent recurrence.

---

## 1. Mission

Produce exactly one output file:

```
docs/architecture/HomeModes.md
```

Scope: architecture documentation for the home modes operational surface. No runtime implementation. No domain contract changes. No schema changes. No edits to any existing product doc.

---

## 2. Execution Boundary (Hard Rule)

Claude MAY write or overwrite:
- `docs/architecture/HomeModes.md` — **only**

Claude MAY NOT write, edit, or overwrite any other file. This includes:
- `docs/product/Spectra-Screen-Map.md`
- `docs/product/Spectra-MVP-Build-Contract.md`
- Any file under `src/`
- Any domain contract file
- Any migration file
- Any test file

**If a consistency patch to an existing doc is needed**, Claude must:
1. Add a section `## Proposed Cross-Doc Patches` at the end of `HomeModes.md`.
2. Include the proposed patch as a labeled fenced diff block.
3. Mark it: `STATUS: PENDING HUMAN APPROVAL`.
4. **Not apply it.** A human decides whether to apply each patch.

Any Claude run that edits files other than `HomeModes.md` is an **ExecutionBoundaryBreach**.

---

## 3. Home Modeling Decision (Locked)

**Default (approved)**: Home is ONE screen in the screen map. The screen exposes `activeMode: 'colorbar' | 'reception' | 'manager'` as session state. Screen count stays at **18**.

| Aspect | Default Decision |
|--------|-----------------|
| Screen map entry | One entry: "Home" |
| Screen count impact | None — stays 18 |
| Implementation | Single `HomeScreen` component, `activeMode` drives conditional layout |
| Mode switch | In-screen state change, no navigation |

**Alternative (requires explicit approval)**: Home as 3 separate screens (ColorBarHome, ReceptionHome, ManagerHome). Screen count becomes 20. This alternative **must not be used unless the human explicitly approves it in writing before the Claude run.**

HomeModes.md must document both options but default to the 1-screen model and mark the 3-screen alternative as `REQUIRES_APPROVAL`.

---

## 4. Source of Truth and Precedence

| Priority | Document | Role |
|----------|----------|------|
| 1 (highest) | `docs/product/Spectra-System-Blueprint.md` | Master spec |
| 2 | `docs/architecture/DecisionGates.md` | Hard stop rules |
| 3 | `docs/architecture/OfflineAuthorityClasses.md` | Offline authority |
| 4 | `docs/product/Spectra-Screen-Map.md` | Current screen map (read-only reference) |
| 5 | Architecture plan | `UNKNOWN (requires confirmation: path not yet confirmed)` |
| 6 (this output) | `docs/architecture/HomeModes.md` | Lowest — must not contradict 1–4 |

Conflict resolution rule: When documents conflict, follow priority order. Document the conflict in Section 22 of HomeModes.md with the exact source files and the resolution applied.

---

## 5. Architectural Law (Verbatim — Must Appear in HomeModes.md § 2)

> Home modes are operational surfaces. They must remain shallow, fast, and interrupt-safe.
> All deep inspection, history, and editing flows stay behind the side panel or dedicated
> transactional screens.

This law applies to all three mode variants. It cannot be relaxed, qualified, or overridden.

---

## 6. Must-Not-Violate Constraints

These constraints are derived from frozen contracts and locked governance. They must appear in HomeModes.md § 3 and be cited with source files.

| ID | Constraint | Source |
|----|-----------|--------|
| MNV-001 | `FinalizeSale` does not close a visit. Only `CheckoutVisit` may set `checked_out`. | `visit-state-machine.contract.ts`, DR-004 |
| MNV-002 | Inventory deduction only at `FinalizeMix`. Scale events are non-authoritative telemetry. | `mix-session.contract.ts`, Gate 6 |
| MNV-003 | `FinalizeSale` accepts `visit_id = null`. Retail without visit must work from any mode. | `pos-finalize-atomicity.contract.ts` |
| MNV-004 | No Class C command may be queued offline. Device must block with explicit reason text. | `OfflineAuthorityClasses.md`, `offline-sync.contract.ts` |
| MNV-005 | AI output is draft-only. No AI suggestion may dispatch a command without explicit user confirmation. | `Spectra-System-Blueprint.md` § 6, Gate 7 |
| MNV-006 | Ledger is append-only. No UI action may update or delete a financial record. | `ledger-invariants.contract.ts` |
| MNV-007 | No negative stock in Active Inventory mode. Hard reject, never soft warn. | `inventory-invariants.contract.ts` |
| MNV-008 | No LWW on inventory or financial state. SELECT FOR UPDATE always. | `inventory-invariants.contract.ts` |
| MNV-009 | Visit transitions must follow VISIT_TRANSITION_GRAPH. Illegal transitions hard-rejected. | `visit-state-machine.contract.ts` |
| MNV-010 | Mix transitions must follow MIX_SESSION_TRANSITION_GRAPH. | `mix-session.contract.ts` |
| MNV-011 | No domain contract file may be modified. | This guardrail |
| MNV-012 | Offline checkout: cash-only or Open Balance (Owner Override). No credit card offline. | `CoreSpec-v1-Locked.md` |

---

## 7. Required Sections for HomeModes.md (Exact Order)

HomeModes.md must contain these 24 sections in order:

```
 1. Purpose and Precedence
 2. Architectural Law
 3. Must-Not-Violate Constraints
 4. Home Modeling Decision
 5. Entry Flow and Role Resolution
 6. ResumePriority Contract
 7. Mode Switching
 8. Global UI Contract
 9. Panel Navigation Contract
10. UI Command Boundary
11. Visit Ownership and Permission Matrix
12. Checkout Lock State Rules
13. ColorBarHome Specification
14. ReceptionHome Specification
15. Reception Board Deterministic Rules
16. ManagerHome Specification
17. Realtime Event Model
18. Event Deduplication and Ordering
19. Offline and Sync Behavior
20. Alert Authority Taxonomy
21. UI View Model Data Contract
22. Rendering Performance Contract
23. Figma Mapping and Design Parity
24. Cross-Document Consistency Check
25. Proposed Cross-Doc Patches (if any — STATUS: PENDING HUMAN APPROVAL)
26. Validation Checklist
```

Section 4 (Home Modeling Decision) is new versus the previous run. Section 7 (Mode Switching) is new. These are not optional.

---

## 8. Required Matrices and Tables

HomeModes.md must include all five:

| Matrix | Location | Key Columns |
|--------|----------|------------|
| Command Mapping Table | § 10 | UI Action, Command Type, Offline Class, Notes |
| Mode Permission Matrix | § 11 | Action, ColorBarHome, ReceptionHome, ManagerHome |
| Realtime Event Matrix | § 17 | Event Group, Event Types, Affected Components |
| Offline Action Matrix | § 19 | Action, Command, Class, Offline Behavior |
| Alert Authority Matrix | § 20 | Source, Authority, Visual, Actions |

---

## 9. UI-to-Domain Mapping Rule

Every actionable UI control must map as:

```
UI Action → Command Type → Domain Aggregate
```

Example:
```
"Checkout" button → FinalizeSale + CheckoutVisit → Sale + Visit
```

If no command exists in the registry for an action, the action must be tagged:
```
UNKNOWN (requires confirmation: src/contracts/sync/command-envelope.schema.ts)
```

Commands must not be invented. Command names must match the actual registry, or be marked UNKNOWN.

---

## 10. Mode Switching (Required Section)

HomeModes.md § 7 must specify all of the following:

- Which roles can switch modes (all staff with active session, or restricted by role).
- How mode switch is triggered (global menu, gesture, or explicit button).
- What UI context is preserved across a mode switch:
  - Active side panel: closed on switch, or preserved.
  - Scroll position: reset or preserved.
  - Active filters: reset or preserved.
- What UI context is always reset on mode switch:
  - `CHECKOUT_IN_PROGRESS` lock: specify behavior explicitly.
- Mode switch during an active mix session: specify behavior explicitly.
- Session persistence: whether mode preference is saved to device or server.

---

## 11. Realtime Safety Rules

HomeModes.md § 18 must define these rules explicitly:

**Idempotent Apply**: Applying the same event twice produces no additional state change.

**Monotonic Version**: An event with `entityVersion < currentVersion` is discarded. Events must not be applied out of order.

**Deterministic Rendering**: Given the same sequence of events, the board must reach the same visual state regardless of network timing.

**Duplicate-Event No-Op**: An event with `eventId === lastAppliedEventId` is a no-op. No partial application.

**No Invented Events**: Every event type in the Realtime Event Matrix must correspond to an actual event type in `src/contracts/events/event-envelope.schema.ts`. If the event does not exist in the registry, it must be tagged `UNKNOWN`.

---

## 12. Board Stability and Performance Rules

HomeModes.md § 22 must define:

- Virtualization threshold: `> 12` visible cards per column or list → virtualized rendering.
- Card key: stable, entity-ID-based, never index-based.
- Memoization: card re-renders only when its own `entityVersion` changes.
- Single-card update: must not trigger a full board or list re-render.
- Burst throttle: non-critical visual updates throttled during > 10 events / 500ms window.
- Critical updates (checkout_ready, alert blocking): applied immediately, never throttled.

---

## 13. Scope Lock

HomeModes.md governs **UI operational surfaces only**:

✅ In scope:
- Home mode layout and content per role.
- Side panel navigation model.
- UI action → command mappings.
- Offline behavior at the UI layer.
- Realtime update model (client-side).
- View model shapes (TypeScript interface definitions for UI use only).

❌ Out of scope (mark as `BACKEND_DEPENDENCY` if referenced):
- Server-side event publishing.
- Domain handler implementation.
- Sync protocol changes.
- Schema or migration changes.
- New command types not already in the registry.
- RBAC enforcement on the server.

---

## 14. UNKNOWN Handling (Strict Tagging)

Format: `UNKNOWN (requires confirmation: <exact file or authority to verify against>)`

Rules:
- Every UNKNOWN must include a specific file path or authority name.
- Generic UNKNOWNs (`UNKNOWN (unclear)`) are not acceptable.
- UNKNOWNs must be consolidated in § 26 (Validation Checklist) in a table with columns: UNKNOWN, Section, Verification File.
- UNKNOWNs are not blocking — HomeModes.md may be delivered with UNKNOWNs. Humans resolve them in the approval phase.

---

## 15. Mandatory Verification Focus Areas

The compliance audit (HomeModes-Compliance-AuditPrompt.md) checks these five areas:

1. **Command Mapping Validity**: Every command in the mapping table is a real registry command or explicitly marked UNKNOWN. No invented command names.

2. **Permission Matrix Accuracy**: Each mode's allowed and blocked actions are consistent with the ownership model (colorbar = own visits + mix, reception = all visits + checkout, manager = read only from home).

3. **Checkout UI Lock Semantics**: The checkout lock (`CHECKOUT_IN_PROGRESS`) is defined as a UI-level concept only. It must not redefine or extend the domain's `VISIT_TRANSITION_GRAPH` or any contract.

4. **Realtime Event Legitimacy**: Every event in the Realtime Event Matrix references an event type that exists (or is UNKNOWN) in `src/contracts/events/event-envelope.schema.ts`.

5. **UNKNOWN Marker Completeness**: Every UNKNOWN marker includes a specific verification file. No orphaned UNKNOWNs.

---

## 16. Post-Run Triage Protocol

After each Claude run producing HomeModes.md:

**Step 1 — File boundary check (< 1 minute)**
```
git diff --name-only
```
Expected: only `docs/architecture/HomeModes.md` is modified.

If ANY other file appears:
- Flag as `ExecutionBoundaryBreach`.
- Do not accept the HomeModes.md output yet.
- Decide per-file whether to keep or revert the edit.
- Record the breach in Section 0 of this guardrail file.

**Step 2 — Home modeling check (< 1 minute)**
- Open HomeModes.md § 4 (Home Modeling Decision).
- Confirm: default model is ONE screen (screen count = 18), not 3 screens.
- If the doc recommends 3 screens without explicit prior approval: mark as `ScopeInflationBreach`.

**Step 3 — Compliance audit (< 3 minutes)**
- Run HomeModes-Compliance-AuditPrompt.md against HomeModes.md.
- Accept only if result is PASS or PASS-WITH-UNKNOWNS.

**Step 4 — Human approval (< 5 minutes)**
- Complete HomeModes-Human-Approval-Checklist.md.
- Require all 10 gates to pass before HomeModes.md is marked Active.

**Step 5 — Patch decision (if applicable)**
- Review § 25 (Proposed Cross-Doc Patches) in HomeModes.md.
- For each proposed patch: approve and apply manually, or reject.
- Do not apply patches automatically.
