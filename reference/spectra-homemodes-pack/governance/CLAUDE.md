# Spectra 3.0 — Claude Code Project Context

## What Is This Project

Spectra 3.0 is an **AI-native operating system for professional hair salons**.
It manages the full salon operational lifecycle: client flow, precision color
mixing (BLE scale), inventory, ordering, payments, and business intelligence.

**Owner**: Maor Organon
**Stack**: NestJS (modular monolith) + PostgreSQL 15+ + Redis + Amazon MSK (Kafka) + ECS Fargate + React Native (Expo 52)
**Team size**: 2 senior engineers + AI tooling

---

## Current State

All Waves A–D are **contracts and specifications only** — not yet production
implementations. The codebase contains:

- Typed domain contracts (`src/domain/**/*.contract.ts`)
- Sync envelope schemas (`src/contracts/sync/`)
- Governance documents (`docs/`)
- Test harness specs (`tests/harness/**/*.spec.md`) — specs only, not runnable yet
- DB migration scaffolds (`db/migrations/`)
- CI gate scripts (`scripts/check-ai-boundary.sh`, `scripts/check-legacy-drift.sh`)

**No production NestJS modules, handlers, or services exist yet.**

---

## Architecture Rules (Non-Negotiable)

### 1. Modular Monolith — No Microservices
Single deployable unit. Bounded contexts are logical, not deployment isolation.
Cross-module communication via outbox events only — no direct method calls between modules.

### 2. Write Path (Sacred — Touch With Extreme Care)
```
Device → PushCommandBatch
  → CommandEnvelope validation (schema + protocol_version + idempotency check)
  → processed_commands lookup (idempotent retry-collapse)
  → Domain command handler (aggregate load → invariant check → state transition)
  → Single DB transaction:
      - Aggregate row mutation (version++)
      - processed_commands insert (command_id + result_hash)
      - outbox_events insert (domain event payload)
  → CommandReceipt (accepted | rejected)
```

**Never break this atomicity. Never add async IO inside this transaction.**

### 3. AI Boundary (Hard Rule — CI Enforced)
- AI **never** writes authoritative state directly
- AI modules (`src/ai/`, `src/assistant/`) must **never** import from `src/domain/`, `src/handlers/`, `src/contracts/`
- All AI output is stored in non-authoritative staging tables (`salon_product_drafts`, assistant draft queue)
- Draft → Confirm → Command flow — no exceptions
- If AI is unavailable, the system operates normally
- Replay of same commands must produce identical state regardless of AI availability
- `scripts/check-ai-boundary.sh` enforces this — must pass on every PR

### 4. Inventory Invariants (Hard Rule)
- No negative stock allowed in `Active Inventory` mode — hard reject, never soft warn
- `Recording Only` categories are exempt from negative-stock enforcement
- Stock availability is **not** a gate for sale/consumption (see War-Room Policy Snapshot)
- No LWW (Last Write Wins) on inventory — always SELECT FOR UPDATE
- No mid-mix inventory locks — only FinalizeMix is the single atomic delta
- Lock ordering: always by `inventory_row_uuid` ascending (deterministic, deadlock prevention)
- Weigh events during mix are **non-authoritative telemetry** — no stock writes during weighing
- Raw Materials deducted at `Mix Finalize` only; Retail Products deducted at `Checkout`

### 5. Idempotency (Hard Rule)
- Every command has a `command_id` (UUID v4, device-generated)
- `processed_commands` table prevents duplicate execution
- Same `command_id` + different payload = **reject** (not silently dedupe)
- Idempotency key propagates through: `command_id` → `causation_id` → `event_id`

### 6. Financial Authority (Hard Rule — Gate 3 Protected)
- POS finalize is a single atomic TX (mix delta + sale record + ledger posting + outbox — one commit)
- Ledger is append-only — no UPDATE on financial records, ever
- Shadow mode required before authority cutover from legacy system

---

## Domain Contracts (Source of Truth)

| Domain | Contract File | Status |
|--------|--------------|--------|
| Inventory | `src/domain/inventory/inventory-invariants.contract.ts` | Complete |
| POS Finalize | `src/domain/pos/pos-finalize-atomicity.contract.ts` | Complete |
| Ledger | `src/domain/ledger/ledger-invariants.contract.ts` | Complete |
| Visit | `src/domain/visit/visit-state-machine.contract.ts` | Complete |
| Mix Session | `src/domain/mix/mix-session.contract.ts` | Complete |
| Timer | `src/domain/timer/timer.contract.ts` | Complete |
| Client/CRM | `src/domain/client/client.contract.ts` | Complete |
| Service | `src/domain/service/service.contract.ts` | Complete |
| Profile | `src/domain/profile/profile.contract.ts` | Complete |
| Integration | `src/domain/integration/integration.contract.ts` | Complete |
| Revenue Loop | `src/domain/revenue/revenue-loop.contract.ts` | Complete |
| Catalog Identity | `src/domain/catalog/catalog-identity.contract.ts` | Complete |
| Catalog Draft | `src/domain/catalog/catalog-draft.contract.ts` | Complete |
| Catalog Promotion | `src/domain/catalog/catalog-promotion.contract.ts` | Complete |

**Before implementing any domain feature — read the contract file first.**

---

## Sync Contracts

| File | Purpose |
|------|---------|
| `src/contracts/sync/command-envelope.schema.ts` | All command types (31 commands) |
| `src/contracts/sync/event-envelope.schema.ts` | All event types (30 events) |
| `src/contracts/sync/conflict-matrix.ts` | Conflict resolution per command pair |
| `src/contracts/sync/offline-sync.contract.ts` | Offline queue, retry config, watermarks |

---

## Offline Authority Classes

- **Class A** — Device-authoritative offline (mix create/weigh, visit ops, timer, cart)
- **Class B** — Read offline, write needs sync (inventory view, catalog slice, CRM windowed)
- **Class C** — Server-authoritative only (identity, auth, ledger, payment, finalize, integration)

**Never promote a domain to a higher offline class without an ADR + Gate 4 approval.**

---

## Decision Gates (Hard Stops)

| Gate | Condition | Override Allowed |
|------|-----------|-----------------|
| Gate 0 | No production code before Phase 0 artifacts approved | Yes (council vote) |
| Gate 1 | No phase N before phase N-1 exit criteria pass | Yes |
| Gate 2 | No protocol expansion without compatibility + replay tests green | Yes |
| Gate 3 | No finance authority cutover without shadow reconciliation | **NO** |
| Gate 4 | No new Class A/B data without ADR + test coverage | Yes |
| Gate 5 | No catalog authority changes without full gate compliance | Yes |
| Gate 6 | No mixing implementation without all mixing authority rules verified | **NO** |
| Gate 7 | No AI assistant flow without isolation + confirmation gating verified | **NO** |
| Gate 8 | No production deployment without staging validation | Yes |

**Gate 3, Gate 6, and Gate 7 cannot be bypassed under any circumstances.**

---

## ADRs (Architectural Decision Records)

| ADR | Decision |
|-----|---------|
| ADR-001 | Modular monolith baseline |
| ADR-002 | Sync protocol v2 envelope |
| ADR-003 | Idempotency and replay |
| ADR-004 | Outbox and projection model |
| ADR-005 | Financial authority boundaries |
| ADR-006 | Offline slice bounds |
| ADR-007 | Product catalog authority model |

**New architectural decisions require a new ADR before implementation.**

---

## Test Harness Specs (All specs — not yet runnable)

| Harness | File | Scope |
|---------|------|-------|
| Replay | `tests/harness/replay/ReplayHarness.spec.md` | Deterministic replay (TC-001–TC-027) |
| Concurrency/Race | `tests/harness/concurrency/InventoryPosRaceHarness.spec.md` | Race conditions (TC-001–TC-027) |
| N/N-1 Compatibility | `tests/harness/versioning/N_Nminus1_compatibility.spec.md` | Protocol versions (TC-001–TC-020) |
| AI Boundary | `tests/harness/architecture/AIBoundaryEnforcement.spec.md` | AI isolation (TC-ARCH-001–004) |
| Projection Rebuild | `tests/harness/rebuild/ProjectionRebuildChecksum.spec.md` | Rebuild from scratch |
| Reconnect Storm | `tests/harness/storm/ReconnectStorm20k.spec.md` | 20k device reconnect |

---

## CI Gates (Must Pass on Every PR)

```bash
npm run check:legacy-drift    # scripts/check-legacy-drift.sh (6 checks)
npm run check:ai-boundary     # scripts/check-ai-boundary.sh
npm run check:all             # all gates together
```

**If CI gates are red — do not merge, do not bypass.**

---

## AI Onboarding Governance

All 8 governance documents in `docs/ai-onboarding/` are **Freeze Candidate**.
Not yet Approved. Do not implement AI onboarding code until `GovernanceFreezeGate.md`
is formally signed off.

Onboarding intents (Phase 0/1):
- `setup_minimum_inventory`
- `first_mix_guidance`
- `barcode_resolution_help`
- `basic_order_assist`
- `recovery_nudge`

Operational intents (Phase 1+, requires onboarding freeze first):
- `order_replenishment_assist`
- `mix_recipe_suggest`
- `anomaly_detection_alert`
- `stock_count_assist`
- `checkout_summary_assist`

---

## Revenue Loop (Critical Path)

```
Chair → Mix (FinalizeMix) → Checkout → Payment → Ledger → Inventory Commit
```

Every step linked by `causation_id` and `correlation_id`.
Loop is "closed" only when **all** mandatory stages have corresponding events.
See `src/domain/revenue/revenue-loop.contract.ts`.

---

## What NOT To Do

- **Never** add `async` operations inside a DB write transaction
- **Never** allow AI modules to import from `src/domain/` or `src/handlers/`
- **Never** use LWW for inventory or financial state
- **Never** write directly to `global_products`, `salon_products`, or any ledger table from AI
- **Never** edit past outbox events — they are immutable
- **Never** start a new phase without Gate N-1 approval
- **Never** merge if `check:legacy-drift` or `check:ai-boundary` fails
- **Never** change the conflict matrix without updating harness specs
- **Never** add non-deterministic fields (timestamps, random values) to command envelopes
- **Never** bypass Gate 3, Gate 6, or Gate 7

---

## Coding Standards

- Language: TypeScript strict mode
- Framework: NestJS (when implementing modules)
- All domain types must match contracts in `src/domain/**/*.contract.ts` exactly
- All new commands must be registered in `command-envelope.schema.ts`
- All new events must be registered in `event-envelope.schema.ts`
- All new command pairs must have entries in `conflict-matrix.ts`
- DB migrations in `db/migrations/` — numbered sequentially
- No direct DB queries outside repository classes
- All financial operations require explicit `tenant_id` + `salon_id` scope

---

## Key Files to Know Before Touching Anything

1. `docs/product/Spectra-System-Blueprint.md` — master spec, single source of truth
2. `docs/architecture/DecisionGates.md` — hard stop rules
3. `docs/architecture/DomainMap.md` — all bounded contexts
4. `src/domain/inventory/inventory-invariants.contract.ts` — most critical domain contract
5. `src/contracts/sync/command-envelope.schema.ts` — all commands
6. `src/contracts/sync/conflict-matrix.ts` — conflict resolution
7. `docs/ai-onboarding/GovernanceFreezeGate.md` — AI governance gate status
8. `docs/governance/CoreSpec-v1-Locked.md` — locked core spec (business rules)
9. `.cursor/rules/spectra-war-room-governance.md` — full operational governance rule

---

## Language

- **Global core language: English** (all entities, statuses, reports, field names)
- **Israel pilot UI: Full Hebrew translation** (no half-translations)
- Every new core term must be created in English first, then officially translated to Hebrew
- Communication with Maor: Hebrew is fine
- Git commit messages: English
- Document headers and specs: English

---

## War-Room Policy Snapshot (v1 — Core Locked)

This section captures the canonical product policy decisions from the CEO war-room
session. Status: **Core Locked (Non-Enterprise)** — edge-case review passed.
Full operational detail lives in `.cursor/rules/spectra-war-room-governance.md`.
Lock document: `docs/governance/CoreSpec-v1-Locked.md`.

### Rule Precedence (Hard)
When rules conflict: **Financial Authority > Privacy > Inventory/POS/Mix**.
Central Product Authority (CPA) overrides Salon Owner in all core-rule conflicts.

### Authority Hierarchy
- **CPA** approves all core-rule changes (SLA: 7 days outside war-room, immediate in war-room)
- **Salon Owner** is top authority in regular salon operations; final for financial tie-breaks within Financial domain
- **Owner Override** always allowed — immutable documentation (`Who/Why/When`) is mandatory
- Override without minimal doc: operation proceeds, tagged `Non-compliant`
- **Manager OR Owner** approve: inventory exceptions, price overrides (up to threshold), mode changes
- **Owner only** approves: unlimited price override (>20% or >₪150)
- **Any cashier** can: process sales, accept returns, declare/edit opening balance
- **Central Authority** is final for severity/risk reclassification disputes and can reverse local severity overrides

### Override Documentation
- `Why` managed via `Reason Codes` (central baseline + local Owner additions; central wins on conflict)
- Enforcement: non-blocking — `Non-compliant` tag + monthly review (reports only, no auto-sanctions)
- Compliance reports use severity `High / Medium / Low` (centrally defined)
- Owner MAY override severity per event with documentation; Central MAY reverse

### Inventory Modes
- Every category operates in `Recording Only` or `Active Inventory` (per-category, salon-configurable)
- `Negative Inventory Hard Reject` applies **only** in `Active Inventory`
- `Recording Only`: offline services allowed, offline retail blocked
- New categories must have mode explicitly chosen at creation (no default)
- Opening Balance: declared manually by any cashier, corrections unlimited, no reason required

### Mix Policy
- Inventory deducted at `Mix Finalize` only (raw materials)
- Formula selection: fully free per stylist
- Customer outcome rating (1–5) required per color service
- Salon-level responsibility for outcomes

### POS & Checkout
- Financial source of truth: `Ledger-based truth`
- After `Commit`: no edit — correction only via `Reversal/Refund`
- Channel-based financial finality: salon at checkout, online after payment authorized
- Online stricter than salon for inventory exceptions
- Reversal only (never void); ledger is append-only
- Raw materials consumed in service: never returned to inventory
- Retail returns: always back to inventory, any cashier, 14-day window
- Refund method: up to ₪150 any method, above ₪150 same payment method required
- No-receipt refund: max 1 per customer per 30 days (Manager OR Owner can approve exception, cap ₪150)

### Offline Policy
- Offline checkout: **Cash only** (no exceptions, no customer debt)
- `Recording Only` categories: services allowed offline, retail blocked offline
- `Open Balance`: visit MAY close without payment offline (Owner Override, `Who/Why/When` required)
- `Open Balance` closure target: 7 days from reconnect; if missed → `Non-compliant` only
- Sync priority on reconnect: Inventory + Mix first, then Financial

### Sync Failure Policy
- Financial sync failure → **Hard block** (no continuation)
- Non-financial sync failure → continue + `Non-compliant` tag

### Conflict Model
- Regular conflicts: `Last Write Wins`
- Central Authority is final arbiter
- Block only if `Ledger` is affected

### Network Compliance
- `Network Compliance` is **mandatory** for all salons
- Owner can still override individual rules with mandatory documentation
- Full transition history required (who/when/from/to)
- KPIs shown together with compliance tag per salon (including `Recording Only` data, tagged by mode)

### Customer & Privacy
- Network-wide unified customer profile (no single salon owner)
- Revenue attributed to executing salon only
- All staff can view full history; sensitive categories hidden via predefined list
- Most restrictive interpretation wins in sensitivity conflicts
- Legal partial deletion: contact data only (7-day SLA), transactions kept

### AI Boundary (Product-Level)
- AI MAY suggest only; authoritative writes require human approval
- Without human approval available: AI output stays as `Draft`
- AI unavailability does not affect system operation

### Freeze Status
| Domain | Status |
|--------|--------|
| Financial Authority | Freeze Candidate v1 |
| POS | Near-freeze (wording only) |
| Inventory | Near-freeze (wording only) |
| Mix | Guardrailed open (UX only, no authority/money) |
