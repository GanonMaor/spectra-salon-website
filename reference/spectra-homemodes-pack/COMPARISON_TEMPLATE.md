# Cross-Project Comparison Template

## 1) Capability Mapping (1:1)

| Capability | Reference Pack Path | Target Project Path | Status (Match/Partial/Missing) | Notes |
|---|---|---|---|---|
| SelectStaff entry flow | mobile/src/screens/SelectStaffScreen.tsx |  |  |  |
| Home mode state switching | mobile/src/screens/Home/HomeScreen.tsx |  |  |  |
| Session state model | mobile/src/state/session.ts |  |  |  |
| SidePanel with depth=1 | mobile/src/state/panel.ts + components/SidePanel/* |  |  |  |
| Reception kanban slice | mobile/src/screens/Home/modes/ReceptionHome.tsx |  |  |  |
| Manager KPI slice | mobile/src/screens/Home/modes/ManagerHome.tsx |  |  |  |
| Viewmodel contracts | mobile/src/viewmodels/types.ts |  |  |  |
| Deterministic mocks | mobile/src/mocks/homeMocks.ts |  |  |  |
| Command dispatch stub | mobile/src/services/commands/dispatch.ts |  |  |  |
| Guardrails canonical policy | docs/architecture/HomeModes-Architecture-Guardrails.md |  |  |  |

## 2) Gap Matrix (P0/P1/P2)

| Gap | Severity | Impact | Proposed Resolution | Owner | ETA |
|---|---|---|---|---|---|
|  | P0/P1/P2 |  |  |  |  |

## 3) Governance Consistency Check

- [ ] Execution boundary defined
- [ ] Must-not-touch files defined
- [ ] Unknown tagging policy defined
- [ ] Audit prompt exists (PASS/FAIL evidence)
- [ ] Human approval checklist exists

## 4) Decision

- [ ] Adopt reference as-is
- [ ] Hybrid merge
- [ ] Selective extraction

### Rationale
(Write 5-10 lines)
