# HomeModes Claude Guardrails

## Mission

Produce one architecture document:

`docs/architecture/HomeModes.md`

Scope: architecture documentation only — no runtime implementation, no domain contract changes.

---

## Repository

`/Users/maorganon/Downloads/spectra.ai.v1`

---

## Source Of Truth (precedence order)

1. `docs/product/Spectra-System-Blueprint.md`
2. `docs/architecture/DecisionGates.md`
3. `docs/architecture/OfflineAuthorityClasses.md`
4. `docs/product/Spectra-Screen-Map.md`
5. `docs/architecture/HomeModes.md` (the output of this session — lowest precedence)

If conflicts appear, follow this order and explicitly note the conflict resolution.

---

## Absolute Constraints

1. Do not modify any domain contract file.
2. Do not add commands or events not in the existing registry.
3. Do not promote any Class C operation to Class A/B without an ADR.
4. Do not use investor/marketing language — use operational business terminology only.
5. Do not add UI flows not supported by Figma + plan.
6. If uncertain, mark: `UNKNOWN (requires confirmation: <exact file to verify against>)`.

---

## Forbidden File Changes

- `src/domain/visit/visit-state-machine.contract.ts`
- `src/domain/mix/mix-session.contract.ts`
- `src/domain/inventory/inventory-invariants.contract.ts`
- `src/domain/pos/pos-finalize-atomicity.contract.ts`
- `src/domain/ledger/ledger-invariants.contract.ts`
- `src/contracts/sync/offline-sync.contract.ts`
- Any file under `src/`

---

## Required Architectural Law (verbatim)

> Home modes are operational surfaces. They must remain shallow, fast, and interrupt-safe.
> All deep inspection, history, and editing flows stay behind the side panel or dedicated transactional screens.

---

## Required Sections (exact order)

1. Purpose and Precedence
2. Architectural Law
3. Must-Not-Violate Constraints
4. Entry Flow and Role Resolution
5. ResumePriority Contract
6. Global UI Contract
7. Panel Navigation Contract
8. UI Command Boundary
9. Visit Ownership and Permission Matrix
10. Checkout Lock State Rules
11. ColorBarHome Specification
12. ReceptionHome Specification
13. Reception Board Deterministic Rules
14. ManagerHome Specification
15. Realtime Event Model
16. Event Deduplication and Ordering
17. Offline and Sync Behavior
18. Alert Authority Taxonomy
19. UI View Model Data Contract
20. Rendering Performance Contract
21. Figma Mapping and Design Parity
22. Cross-Document Consistency Check
23. Validation Checklist

---

## Required Matrices and Tables

- Command Mapping Table (Section 8)
- Mode Permission Matrix (Section 9)
- Offline Action Matrix (Section 17)
- Realtime Event Matrix (Section 15)
- Alert Authority Matrix (Section 18)

---

## Hard Rules

- UI dispatches commands only — no direct state mutation.
- All realtime updates must be idempotent.
- Dedup must define: `eventId`, `entityVersion`, `lastAppliedEventId` per entity/card.
- `PanelDepth = 1`.
- Checkout lock behavior must be explicit (`CHECKOUT_IN_PROGRESS`).
- Reception board deterministic rules must include sort, overflow, auto-collapse.
- Performance rule must include virtualization threshold (`> 12` visible cards).

---

## Output Style

- Operational language only.
- Short paragraphs, explicit rules.
- Deterministic constraints preferred over descriptions.
- No marketing wording.

---

## End Condition

Document must end with section `23. Validation Checklist`.
Checklist must map 1:1 to the validation matrix in the architecture plan.
