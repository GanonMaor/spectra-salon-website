# HomeModes Compliance Audit Prompt

**Version**: 1.1.0
**Date**: 2026-03-05
**Usage**: After a Claude run produces `docs/architecture/HomeModes.md`, paste this prompt
to run a strict compliance audit. Returns PASS, PASS-WITH-UNKNOWNS, or FAIL with exact evidence.

---

## Audit Prompt (copy from here)

---

You are a strict compliance auditor. Your only job is to audit `docs/architecture/HomeModes.md` against the rules in `docs/architecture/HomeModes-Architecture-Guardrails.md`.

Return a structured verdict. No prose. No suggestions. Only evidence-backed PASS or FAIL per check.

---

**Read these files before auditing:**

```
docs/architecture/HomeModes.md          — the file being audited
docs/architecture/HomeModes-Architecture-Guardrails.md  — the rule source
src/contracts/sync/command-envelope.schema.ts           — command registry
src/contracts/events/event-envelope.schema.ts           — event registry
```

---

**Run all 10 checks. For each check, output:**

```
CHECK [N]: <check name>
RESULT: PASS | FAIL | PASS-WITH-UNKNOWNS
EVIDENCE: <exact section, line or table cell that proves the result>
VIOLATIONS: <list only if FAIL — exact quote + location>
```

---

### Check 1: Execution Boundary

Verify that `docs/architecture/HomeModes.md` is the only file produced or modified.

Evidence required: Confirm the document does not reference making edits to Spectra-Screen-Map.md, Spectra-MVP-Build-Contract.md, or any `src/` file as completed actions (only proposed patches in § 25 are allowed).

FAIL condition: HomeModes.md states it has directly updated any other file.

---

### Check 2: Home Modeling Decision Present

Verify that HomeModes.md contains § 4 `Home Modeling Decision`.

The section must:
- State the default model clearly: ONE screen, `activeMode` state, screen count = 18.
- Either: state the 3-screen alternative is not used (default path).
- Or: state the 3-screen alternative is used AND show evidence of prior explicit human approval.

FAIL condition: Section is missing. OR: 3-screen model is used with no approval evidence.

---

### Check 3: Mode Switching Section Present

Verify that HomeModes.md contains § 7 `Mode Switching`.

The section must address all of:
- Who can switch modes.
- How it is triggered.
- What UI context is preserved vs reset.
- Behavior during active mix session.
- Behavior during `CHECKOUT_IN_PROGRESS`.

FAIL condition: Section missing. PASS-WITH-UNKNOWNS: Section present but one or more items tagged UNKNOWN.

---

### Check 4: Command Mapping Validity

For every row in the Command Mapping Table (§ 10):
- Extract the `Command Type` value.
- Check it against `src/contracts/sync/command-envelope.schema.ts`.
- If the command exists in the schema: PASS for that row.
- If the command does not exist AND is not marked `UNKNOWN`: FAIL for that row.

FAIL condition: Any command name in the table is invented (not in schema, not marked UNKNOWN).
PASS-WITH-UNKNOWNS: All rows are either valid registry commands or explicitly marked UNKNOWN.

Report each failing row with: `Row: "[UI Action]" → Command: "[value]" — not found in registry.`

---

### Check 5: Permission Matrix Accuracy

Verify the Mode Permission Matrix (§ 11) against these ownership rules:

| Ownership Rule | Source |
|---------------|--------|
| ColorBarHome: own visits only (default), mix + notes only | HomeModes-Architecture-Guardrails.md § 15 |
| ReceptionHome: all visits, can add service/retail + checkout | HomeModes-Architecture-Guardrails.md § 15 |
| ManagerHome: read-only from home, no routine command dispatch | HomeModes-Architecture-Guardrails.md § 15 |

FAIL condition: Any cell in the matrix contradicts these rules without documented justification.

---

### Check 6: Checkout Lock Semantics

Verify § 12 `Checkout Lock State Rules`:
- `CHECKOUT_IN_PROGRESS` must be defined as a **UI-level** state, not a domain contract change.
- The section must NOT claim to add new states to `VISIT_TRANSITION_GRAPH`.
- The section must NOT claim to add new fields to `VisitState` (frozen contract).
- The section may reference `checkout_ready` as the corresponding domain stage.

FAIL condition: § 12 redefines or extends domain contract fields or state graph.

---

### Check 7: Realtime Event Legitimacy

For every event type named in the Realtime Event Matrix (§ 17):
- Check it against `src/contracts/events/event-envelope.schema.ts`.
- If the event exists: PASS for that entry.
- If the event does not exist AND is not marked UNKNOWN: FAIL for that entry.

FAIL condition: Any event type is invented (not in schema, not marked UNKNOWN).
PASS-WITH-UNKNOWNS: All entries are either valid events or explicitly marked UNKNOWN.

Report each failing entry with: `Event: "[value]" — not found in event-envelope.schema.ts.`

---

### Check 8: UNKNOWN Marker Completeness

Scan all UNKNOWN tags in HomeModes.md.

For each UNKNOWN:
- Verify it follows the format: `UNKNOWN (requires confirmation: <specific file or authority>)`
- Verify the `<specific file or authority>` is not generic (`unclear`, `TBD`, `unknown`, etc.)

FAIL condition: Any UNKNOWN tag is missing a specific verification file or authority.

Verify § 26 (Validation Checklist) includes a table of all UNKNOWNs with columns: UNKNOWN, Section, Verification File.

FAIL condition: UNKNOWNs exist in the document but are absent from the table.

---

### Check 9: Required Sections Completeness

Verify all 26 sections are present in HomeModes.md in the required order.

Required sections (must appear in this exact order):
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

FAIL condition: Any section is missing. FAIL condition: Sections appear out of order.

---

### Check 10: Required Matrices Completeness

Verify all five matrices are present in HomeModes.md:

| Matrix | Required Section | Required Columns |
|--------|-----------------|-----------------|
| Command Mapping Table | § 10 | UI Action, Command Type, Offline Class, Notes |
| Mode Permission Matrix | § 11 | Action, ColorBarHome, ReceptionHome, ManagerHome |
| Realtime Event Matrix | § 17 | Event Group, Event Types, Affected Components |
| Offline Action Matrix | § 19 | Action, Command, Class, Offline Behavior |
| Alert Authority Matrix | § 20 | Source, Authority, Visual, Actions |

FAIL condition: Any matrix is missing. FAIL condition: Any matrix is missing a required column.

---

**Final Verdict:**

```
OVERALL: PASS | PASS-WITH-UNKNOWNS | FAIL
FAILING CHECKS: [list check numbers]
UNKNOWN COUNT: [N] unknowns found
BOUNDARY BREACH: YES | NO
ACTION REQUIRED: [exact next step]
```

Verdict rules:
- `PASS`: All 10 checks pass, zero UNKNOWNs.
- `PASS-WITH-UNKNOWNS`: All 10 checks pass, one or more UNKNOWNs present. Humans resolve UNKNOWNs before finalizing.
- `FAIL`: One or more checks fail. HomeModes.md must be revised before acceptance.

If `BOUNDARY BREACH: YES` — HomeModes.md must not be marked Active until breach is resolved per triage protocol in `HomeModes-Architecture-Guardrails.md` § 16.

---

## End of Audit Prompt
