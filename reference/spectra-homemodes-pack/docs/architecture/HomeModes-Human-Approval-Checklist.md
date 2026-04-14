# HomeModes Human Approval Checklist

**Version**: 1.1.0
**Date**: 2026-03-05
**Time to complete**: < 5 minutes
**Prerequisite**: Compliance audit (HomeModes-Compliance-AuditPrompt.md) returned PASS or PASS-WITH-UNKNOWNS.

---

## How to Use

Work through the 10 gates below. Each gate is binary: ✅ or ❌.

All 10 must be ✅ before HomeModes.md is marked `Status: Active`.

If any gate is ❌: record the reason in the `Notes` column and send back for revision.

---

## Approval Gates

| # | Gate | Check | ✅ / ❌ | Notes |
|---|------|-------|--------|-------|
| G1 | **Boundary compliance** | `git diff --name-only` shows ONLY `docs/architecture/HomeModes.md` modified. No edits to Spectra-Screen-Map.md, Spectra-MVP-Build-Contract.md, or any `src/` file. | | |
| G2 | **Home model decision** | HomeModes.md § 4 states the default model is ONE screen (screen count stays 18), OR explicitly notes 3-screen alternative with your approval on record. | | |
| G3 | **Architectural law present** | HomeModes.md § 2 contains the verbatim law: *"Home modes are operational surfaces. They must remain shallow, fast, and interrupt-safe. All deep inspection, history, and editing flows stay behind the side panel or dedicated transactional screens."* | | |
| G4 | **Mode switching covered** | HomeModes.md § 7 `Mode Switching` exists and specifies: mode switch trigger, preserved vs reset context, behavior during active mix, behavior during `CHECKOUT_IN_PROGRESS`. | | |
| G5 | **Command mapping plausible** | Scan Command Mapping Table (§ 10). Every command name is either (a) a command you recognize from the registry, or (b) explicitly marked UNKNOWN. No invented command names. | | |
| G6 | **Permission matrix makes sense** | Mode Permission Matrix (§ 11): ColorBarHome = own visits + mix/notes, ReceptionHome = all visits + checkout, ManagerHome = read from home. Aligns with your intended role design. | | |
| G7 | **Checkout lock semantics correct** | § 12 defines `CHECKOUT_IN_PROGRESS` as UI-level only. It does NOT claim to add new states to the Visit state machine or new fields to VisitState. | | |
| G8 | **No invented events** | Scan Realtime Event Matrix (§ 17). Every event is either recognized from the event registry or explicitly marked UNKNOWN. No invented event names used as authoritative. | | |
| G9 | **Proposed patches reviewed** | § 25 `Proposed Cross-Doc Patches` reviewed. For each proposed patch: you have decided APPROVE (you will apply manually) or REJECT. No patch was applied automatically by Claude. | | |
| G10 | **UNKNOWNs reviewed** | § 26 Validation Checklist UNKNOWN table reviewed. Each UNKNOWN is assigned a resolution owner and target date, or explicitly deferred with documented rationale. | | |

---

## Post-Approval Actions

After all 10 gates are ✅:

1. Update `docs/architecture/HomeModes.md` header: `Status: Active`.
2. For each approved patch in G9: apply it manually to the target file.
3. Add a one-line record here:

```
Approved: [date] by [approver name]
HomeModes.md version: [version]
Applied patches: [list patch titles, or "none"]
Deferred UNKNOWNs: [count] — due by [date]
```

---

## Rejection Record

If any gate fails, record here before sending back for revision:

```
Rejected: [date] by [approver name]
Failed gates: [G#, G#, ...]
Reason: [brief]
Action required: [what Claude must fix before next review]
```

---

## Gate History

| Date | Version | Result | Approver | Notes |
|------|---------|--------|----------|-------|
| 2026-03-05 | 1.0.0 | ❌ REJECTED | Architecture Council | G1 breach: Spectra-Screen-Map.md + Spectra-MVP-Build-Contract.md edited. G2 breach: 3-screen model used without approval (count 18→20). |
| | | | | |
