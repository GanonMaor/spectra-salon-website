# HomeModes Claude Run Prompt

**Version**: 1.1.0
**Date**: 2026-03-05
**Usage**: Copy and paste this entire prompt as your first message to Claude Code.

---

## Prompt (copy from here)

---

Read and strictly obey:

```
docs/architecture/HomeModes-Architecture-Guardrails.md
```

That file is your authoritative policy. Every constraint in it overrides any other instruction in this prompt.

---

**Your task:**

Generate exactly one file:

```
docs/architecture/HomeModes.md
```

Before writing, read these source files:

```
docs/product/Spectra-System-Blueprint.md
docs/architecture/DecisionGates.md
docs/architecture/OfflineAuthorityClasses.md
docs/product/Spectra-Screen-Map.md
src/domain/visit/visit-state-machine.contract.ts
src/domain/mix/mix-session.contract.ts
src/domain/inventory/inventory-invariants.contract.ts
src/domain/pos/pos-finalize-atomicity.contract.ts
src/domain/ledger/ledger-invariants.contract.ts
src/contracts/sync/offline-sync.contract.ts
src/contracts/events/event-envelope.schema.ts
src/contracts/sync/command-envelope.schema.ts
```

---

**Hard rules:**

1. You may write ONLY `docs/architecture/HomeModes.md`. No other file.
2. Do NOT edit `docs/product/Spectra-Screen-Map.md`.
3. Do NOT edit `docs/product/Spectra-MVP-Build-Contract.md`.
4. Do NOT edit any file under `src/`.
5. If any product doc needs a consistency patch, write it as a fenced diff in HomeModes.md § 25 `Proposed Cross-Doc Patches` with `STATUS: PENDING HUMAN APPROVAL`. Do not apply it.
6. Default home model is ONE screen (screen count stays 18). Do not propose 3 separate screens unless you see explicit prior approval noted in the guardrails.
7. Every UI action must map to a real command from the registry, or be tagged `UNKNOWN (requires confirmation: src/contracts/sync/command-envelope.schema.ts)`.
8. Every realtime event must correspond to an actual event type from the registry, or be tagged `UNKNOWN (requires confirmation: src/contracts/events/event-envelope.schema.ts)`.
9. Do not invent command names or event names.
10. If uncertain about anything, tag it `UNKNOWN (requires confirmation: <exact file>)` and continue.

---

**Required sections (in this order):**

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
25. Proposed Cross-Doc Patches
26. Validation Checklist
```

**Required matrices (must all appear):**

- Command Mapping Table (§ 10): columns = UI Action, Command Type, Offline Class, Notes
- Mode Permission Matrix (§ 11): columns = Action, ColorBarHome, ReceptionHome, ManagerHome
- Realtime Event Matrix (§ 17): columns = Event Group, Event Types, Affected Components
- Offline Action Matrix (§ 19): columns = Action, Command, Class, Offline Behavior
- Alert Authority Matrix (§ 20): columns = Source, Authority, Visual, Actions

---

**When you are done**, stop. Do not summarize. Do not suggest follow-up actions. Do not edit any other file.

---

## End of Prompt
