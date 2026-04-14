# Spectra HomeModes Reference Pack

## Purpose
This pack is a portable reference snapshot for HomeModes architecture and UI scaffolding.
It is intended for cross-project comparison, capability mapping, and architecture alignment.

## What This Pack Includes

### Mobile UI Scaffolding (Expo / RN)
- Navigation entry flow: `SelectStaff -> Home`
- Single Home screen with mode-state switching: `colorbar`, `reception`, `manager`
- Side panel infrastructure with `PanelDepth = 1`
- Mock viewmodels and deterministic fixtures
- Command dispatch stub (no backend integration)

### Architecture and Governance
- HomeModes architecture specification
- Guardrails policy for constrained AI execution
- Compliance audit prompt (PASS/FAIL evidence mode)
- Human approval checklist (10 binary gates)

### Product Alignment Docs
- Screen map
- MVP build contract
- System blueprint (reference source)

## Current Scope Boundaries
- UI scaffolding only
- No API integration
- No backend command handlers
- No authoritative sync queue implementation
- Mocks and fixtures are used for runtime demo behavior

## Known Gaps
- No E2E test automation attached in this pack
- No production-grade offline reconciliation in this pack
- No backend/domain authority wiring in this pack

## Source Traceability
See:
- `meta/SOURCE_COMMIT.txt`
- `meta/FILE_LIST.txt`
- `meta/SHA256SUMS.txt`

## How To Use This Pack
1. Copy this folder into the target repository under `reference/spectra-homemodes-pack/`.
2. Run structured comparison using `COMPARISON_TEMPLATE.md`.
3. Classify gaps by severity: P0 (architecture parity blocker), P1 (implementation blocker), P2 (hardening).
4. Decide merge strategy: adopt as-is, hybrid merge, or selective extraction.

## Suggested First Comparison Targets
- `apps/mobile/src/navigation/`
- `apps/mobile/src/state/`
- `apps/mobile/src/screens/Home/`
- `apps/mobile/src/components/`
- `docs/architecture/HomeModes*.md`
- `docs/product/Spectra-Screen-Map.md`
- `docs/product/Spectra-MVP-Build-Contract.md`

## Internal Use
Internal engineering reference only.
