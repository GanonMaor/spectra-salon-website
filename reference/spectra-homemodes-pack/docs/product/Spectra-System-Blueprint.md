# Spectra 3.0 — System Blueprint (Master Specification)

**Version**: 1.0.0
**Status**: Active
**Last Updated**: 2026-02-28
**Owner**: Architecture Council

This is the single source of truth for the Spectra 3.0 system. All other
architecture, governance, and operational documents must align with this
blueprint. Changes to this document require architecture council approval.

---

## 1. Vision and Commercial Positioning

Spectra is an **AI-native operating system for professional hair salons** that
manages the full operational lifecycle: client flow, precision color mixing,
inventory, ordering, payments, and business intelligence.

### Value Proposition

1. **Precision and waste reduction**: BLE-connected scale + real-time mixing
   with gram-level tracking, reweigh savings, and per-mix cost analysis.
2. **Revenue optimization**: Closed revenue loop (mix -> checkout -> payment ->
   ledger -> inventory) with real-time profitability visibility.
3. **Operational efficiency**: Offline-first chair-side operations, auto-order
   suggestions, live client management, timers, and multi-stylist support.
4. **Enterprise scalability**: Multi-location governance, hierarchical RBAC,
   deterministic sync, and replay-safe financial transactions.
5. **AI-assisted intelligence**: Draft-only AI assistant for onboarding, mix
   suggestions, order optimization, and anomaly detection — never writing
   authoritative state directly.

### Ideal Customer Profile (ICP)

- Professional color salons (1-50 stylists per location)
- Multi-location salon groups (2-200 locations)
- Salon chains requiring centralized inventory and financial controls
- Salons transitioning from manual mixing to precision-measured operations

---

## 2. Feature Map (Current Parity + Target State)

### Parity with Spectra Old (Must-Have)

| Feature Area | Old System | New System Contract | Status |
|-------------|-----------|-------------------|--------|
| Live client check-in/check-out | FlowAction + RequestAction | `CheckInClient`/`CheckoutVisit` commands | Contract defined |
| Visit lifecycle + timers | VisitOperations + SetTimer | Visit state machine + Timer contract | Contract defined |
| Mix session (create/append/reweigh) | FlowAction (UI-level) | `MixSession` aggregate + typed commands | Contract defined |
| Mix savings calculation | MixSavings in FlowAction | `MixSavingsEntry` in mix-session.contract | Contract defined |
| Product ratio learning | saveProductRatio in RequestAction | `ProductRatioEntry` advisory data | Contract defined |
| Inventory management | SyncStock + StockButtons | `AdjustStock`/`UpdateUserProductStock` commands | Contract defined |
| Barcode scanning + resolution | CameraScanner + BarcodeNotFound | `UpdateProductBarcode`/scan resolution | Contract defined |
| Product visibility toggle | StockGridEditVisibility | `SetProductVisibility` command | Contract defined |
| Orders (PO/suppliers/autofill) | Orders + MyOrderAutoFiller | `PurchaseOrder` aggregate + typed commands | Contract defined |
| Customer CRUD + merge | customer/save + customer/merge | `Client` aggregate + `MergeClients` command | Contract defined |
| Customer notes | note/upsert + note/delete | `ClientNote` aggregate + typed commands | Contract defined |
| Service/category management | service/save + service/delete | `Service`/`ServiceCategory` contracts | Contract defined |
| Profile management | profile/all + profile/delete | `Profile` aggregate + typed commands | Contract defined |
| Manager dashboards | Dashboards (cost/usage/reweight) | Projection layer from event stream | Architecture defined |
| Offline resilience | OfflineAction queue | Typed offline-sync.contract + watermarks | Contract defined |
| Integrations (SalonIQ/Phorest) | Integration action components | `IntegrationConnection` aggregate + adapter | Contract defined |

### New Capabilities (Target State)

| Feature Area | Contract | Status |
|-------------|---------|--------|
| Revenue loop closure (E2E) | `revenue-loop.contract.ts` | Contract defined |
| Causation chain traceability | CommandEnvelope + EventEnvelope extensions | Contract defined |
| POS atomic finalization | `pos-finalize-atomicity.contract.ts` | Contract defined |
| Financial ledger | `ledger-invariants.contract.ts` | Contract defined |
| Product catalog authority | `catalog-*.contract.ts` + RFC-SPEC-007-IH | Contract defined |
| Stock transfers | Inventory invariants + transfer commands | Contract defined |
| AI onboarding governance | 8 governance docs + change control | Freeze candidate |
| Operational AI intents | `OperationalAIIntentExtension.md` | Draft |

---

## 3. Domain Authority Matrix

| Domain | Authority Model | Offline Class | Lock Strategy |
|--------|----------------|--------------|---------------|
| Identity & Tenant | Server-authoritative | C | N/A |
| Authorization | Server-authoritative | C | N/A |
| Visit & Service Cycle | Strong consistency, CAS | A (ops) / C (checkout) | Version CAS |
| Mix Session | Strong consistency | A (create/weigh) / C (finalize) | Row lock at finalize |
| Timer | Local-first, sync on reconnect | A | Version CAS |
| Inventory | Strong consistency, no LWW | B (view) / C (commit) | SELECT FOR UPDATE |
| Product Catalog | Strong consistency, identity hash | B (slice) / C (mutations) | Row lock + CAS |
| POS | Strong consistency | A (cart) / C (finalize) | Atomic TX |
| Ledger & Billing | Append-only, server-only | C | Row lock + CAS |
| CRM / Client | Strong per profile | B (windowed) | Version CAS |
| Calendar | Strong consistency | B (windowed) | CAS |
| Workforce | Strong consistency | B (view) / C (payroll) | Version CAS |
| AI Assistant | Non-authoritative | C | N/A |
| Ordering | Strong consistency | C | Row lock + CAS |
| Integration | Server-authoritative | C | N/A |

---

## 4. Core Revenue Loop

```
Chair -> Mix -> Checkout -> Payment -> Ledger -> Inventory Commit
```

Every step is linked by causation_id and correlation_id. The loop is
considered "closed" only when all mandatory stages have corresponding events.
See `src/domain/revenue/revenue-loop.contract.ts` for full specification.

---

## 5. Multi-Location and RBAC Model

```
Organization
  -> Location (salon_id)
    -> Team
      -> Stylist (profile_id)
```

- Primary user per tenant controls settings, privacy, profiles.
- Secondary users operate within delegated permissions.
- Cross-location operations (transfers, global catalog) require explicit
  location context in every command.
- Future: hierarchical policy inheritance (Org -> Location -> Team).

---

## 6. AI Boundaries

- AI operates as Draft -> Confirm -> Command layer.
- AI never writes authoritative state directly.
- AI modules are isolated from write-path code (enforced by CI gate).
- Onboarding: 5 intents (setup_minimum_inventory, first_mix_guidance,
  barcode_resolution_help, basic_order_assist, recovery_nudge).
- Operational: 5 intents (order_replenishment_assist, mix_recipe_suggest,
  anomaly_detection_alert, stock_count_assist, checkout_summary_assist).
- Attribution: idempotencyKey -> causation_id -> command_id chain.

See `docs/architecture/AIAssistIsolation.md` and
`docs/ai-onboarding/*.md` for full governance.

---

## 7. Integration Strategy

- Uniform adapter pattern per provider (SalonIQ, Phorest, future).
- Each adapter implements `IntegrationAdapterContract`.
- Sync operations are idempotent with reconciliation events.
- All integration ops are Class C (server-authoritative).
- See `src/domain/integration/integration.contract.ts`.

---

## 8. Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Runtime | NestJS (modular monolith) | Modern Node, domain isolation |
| Database | PostgreSQL 15+ | ACID, partitioning, row locks |
| Cache | Redis | Realtime, rate limiting |
| Event Backbone | MSK (Kafka) | Durable ordering, replay |
| Compute | ECS Fargate | Serverless containers |
| Mobile | React Native (Expo 52) | Cross-platform, BLE support |
| BLE | react-native-ble-manager | Scale connectivity |

---

## 9. Roadmap Waves

| Wave | Focus | Deliverables | Gate |
|------|-------|-------------|------|
| A | Feature Parity Contracts | Typed commands/events for all legacy flows | Contract integrity |
| B | Revenue Loop Closure | E2E causation chain, atomic finalize | Determinism + idempotency |
| C | Offline Hardening | Watermarks, replay/concurrency/N-1 tests | Harness pass |
| D | AI + Integrations | Operational intents, adapter contracts | AI boundary CI pass |
| E (future) | Enterprise | Multi-location governance, workforce, advanced analytics | TBD |

---

## 10. Non-Goals (Explicit Exclusions)

- Multi-region active-active (not in Phase 0/1)
- Full event sourcing for all domains (outbox pattern sufficient)
- More than 2 integration providers in Phase 0/1
- Marketing automation / campaign engine (Phase 2+)
- Marketplace / third-party app platform (Phase 3+)

---

## 11. Change Control

Changes to this blueprint require:
- Architecture council review
- Impact analysis on affected domain contracts
- Updated test harness specs if domain boundaries change
- Version bump of this document

This document is the master reference. All other docs
(`Architecture.md`, `DomainMap.md`, `DecisionGates.md`,
governance docs) must be consistent with this blueprint.
Discrepancies must be resolved in favor of this document.

---

## 12. Success KPIs

| KPI | Target | Measurement |
|-----|--------|-------------|
| Revenue loop closure rate | 100% of finalized sales | Causation chain completeness |
| Replay determinism | 100% pass rate | ReplayHarness CI |
| Concurrency safety | 0 invariant violations | RaceHarness CI |
| Offline resilience | 0 data loss on reconnect | Queue drain + watermark verification |
| AI boundary integrity | 0 CI violations | check-ai-boundary + check-legacy-drift |
| Feature parity | 100% of spectra old critical flows | Parity matrix above |

---

## References

- [Unified Governance Map](../unified/00-master-governance-map.md)
- [Unified Invariant Map](../unified/01-unified-invariant-map.md)
- [Authority Boundaries](../unified/02-authority-boundaries.md)
- [Migration Safety Blueprint](../unified/03-migration-safety-blueprint.md)
- [PR Invariant Checklist](../unified/04-pr-invariant-checklist.md)
- [Architecture.md](../architecture/Architecture.md)
- [DomainMap.md](../architecture/DomainMap.md)
- [DecisionGates.md](../architecture/DecisionGates.md)
- [AIAssistIsolation.md](../architecture/AIAssistIsolation.md)
- [OfflineAuthorityClasses.md](../architecture/OfflineAuthorityClasses.md)
- [AI Onboarding Governance](../ai-onboarding/)
- [ADR Index](../adr/)
- [Observability Plan](../ops/ObservabilityPlan.md)
- [SLO Baseline](../ops/SLO-Baseline-Template.md)
