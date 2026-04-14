# Pack Manifest - Spectra HomeModes

## Snapshot Intent
Portable reference snapshot for HomeModes UI and architecture guardrails.

## Included Groups

### A) Mobile Runtime/UI
- `mobile/App.tsx`
- `mobile/package.json`
- `mobile/src/navigation/*`
- `mobile/src/screens/*`
- `mobile/src/state/*`
- `mobile/src/components/*`
- `mobile/src/viewmodels/*`
- `mobile/src/mocks/*`
- `mobile/src/services/commands/*`

### B) Architecture / Guardrails
- `docs/architecture/HomeModes.md`
- `docs/architecture/HomeModes-Claude-Guardrails.md`
- `docs/architecture/HomeModes-Architecture-Guardrails.md`
- `docs/architecture/HomeModes-Claude-RunPrompt.md`
- `docs/architecture/HomeModes-Compliance-AuditPrompt.md`
- `docs/architecture/HomeModes-Human-Approval-Checklist.md`

### C) Product Docs
- `docs/product/Spectra-Screen-Map.md`
- `docs/product/Spectra-MVP-Build-Contract.md`
- `docs/product/Spectra-System-Blueprint.md`

### D) Governance Context
- `governance/CLAUDE.md`
- `governance/cursor-rules/*`

## Explicitly Out of Scope
- Backend implementation modules
- DB migrations
- Production command handlers
- Production sync orchestration

## Verification Files
- `meta/SOURCE_COMMIT.txt`
- `meta/FILE_LIST.txt`
- `meta/SHA256SUMS.txt`
