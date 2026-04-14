# Spectra War-Room Governance Rule (v1 — Core Locked)

This rule contains all enforceable product-policy decisions from the CEO war-room
session. It is the single source of truth for business rules. Status: **Core Locked
(Non-Enterprise)** — edge-case review passed.

For architectural/technical rules see `CLAUDE.md`. This file covers product policy only.
For strategic direction (data platform framing, 3-layer architecture, messaging
boundaries) see `docs/strategy/SPECTRA_GLOBAL_STRATEGY.md`.
Lock document: `docs/governance/CoreSpec-v1-Locked.md`.

---

## 1. Rule Precedence (MUST follow this order)

When any two rules conflict, resolve by domain priority:

1. **Financial Authority** (highest)
2. **Privacy**
3. **Inventory / POS / Mix** (lowest)

Within a single domain, the **most restrictive** interpretation wins unless a
specific exception is documented below.

---

## 2. Authority Hierarchy

### Central Product Authority (CPA)
- MUST approve all core-rule changes outside war-room (SLA: 7 days)
- In war-room sessions: CEO MAY change any core rule immediately
- CPA overrides Salon Owner in all core-rule conflicts
- CPA determines which rule is "most restrictive" in ambiguous cases
- CPA is binding only for salons in `Network Compliance` mode

### Salon Owner
- Top authority in regular salon operations
- Final authority for financial tie-breaks **within** Financial domain only
- `Owner Override` ALWAYS allowed — immutable documentation (`Who/Why/When`) is mandatory
- Override without minimal documentation: operation proceeds, tagged `Non-compliant`
- Financial loss from Owner decisions absorbed by Salon P&L only
- NEVER overrides CPA on core-rule changes or severity/risk reclassification

### Manager
- MAY approve (with Owner as OR): inventory exceptions, category mode changes, no-receipt refund exceptions
- MAY approve price overrides up to threshold (20% or ₪150)
- MAY use emergency price override when Owner unavailable (unlimited amount, 24h ex-post Owner approval required)
- MUST NOT approve: unlimited price override

### Cashier
- MAY process sales, accept returns, declare/edit opening balance
- MUST NOT approve: price overrides, inventory exceptions, mode changes

---

## 3. Inventory Policy

### Category Modes
- Every product category MUST operate in one of two modes: `Recording Only` or `Active Inventory`
- Mode is per-category, per-salon (salon-configurable)
- Mode change authorized by Manager OR Owner
- No cooldown between mode changes
- New categories MUST have mode explicitly chosen at creation (no default)
- Reporting uses `As-of-event truth`: each event recorded under the mode active at event time

### Recording Only Mode
- Offline: **services allowed**, **retail blocked** (require connection)
- Negative-stock enforcement does NOT apply
- No inventory debt concept exists
- `Recording Only` data shown in network KPI with mode tag (not hidden)

### Active Inventory Mode
- `Negative Inventory Hard Reject` — MUST reject any operation that would create negative stock
- No LWW (Last Write Wins) — MUST use SELECT FOR UPDATE
- Lock ordering: always by `inventory_row_uuid` ascending

### Opening Balance
- Declared manually by any cashier (`Declared Opening Balance`)
- Corrections by any cashier, no limit on number, no reason required
- Correction history visible to Manager OR Owner only
- No secondary approval required
- No `Low Trust` marking for frequent corrections
- Transition from `Recording Only` to `Active Inventory` allowed at any time, even with existing gaps

### Inventory Deduction Points
- `Raw Materials` deducted at **Mix Finalize** only
- `Retail Products` deducted at **Checkout** (salon) or **Payment Authorized** (online)
- Stock availability is NOT a gate for sale/consumption
- Every item MUST have a hard classification: `Raw Material` or `Retail Product`

### Unit of Measure
- Raw Materials: grams/ml
- Retail Products: units
- No unit conversions allowed — one authoritative unit per item

### Owner-Approval Categories
- Global Baseline categories (network-mandated) + optional salon additions
- Escalation trigger: by item type (not amount or quantity)
- Escalation to Owner: salon-configurable dynamic list
- Two-tier approval: Manager for standard exceptions, Owner for escalated categories

---

## 4. Mix Policy

### Freeze Status: Guardrailed Open
- UX/workflow changes: allowed
- Authority/money rule changes: MUST NOT be made without formal re-opening

### Core Rules
- Inventory deducted at `Mix Finalize` only
- Weigh events during mix are non-authoritative telemetry — no stock writes during weighing
- Formula selection: fully free per stylist (no approval required)
- Salon-level responsibility for service outcomes
- Service recovery: fully at salon discretion, no network minimum obligation
- Reason required only when financial credit given in recovery

### Quality Tracking
- Customer outcome rating (1–5) MUST be requested per color service
- If customer does not rate: service closes normally with status `No Rating`
- Alert to Owner/Manager when `No Rating` exceeds 35% monthly
- No automatic sanction for high `No Rating` rate

---

## 5. POS & Checkout Policy

### Freeze Status: Near-Freeze
- Wording/clarification fixes only
- Substantive rule changes MUST NOT be made without formal re-opening

### Financial Source of Truth
- `Ledger-based truth` — ledger records are the authoritative financial source
- After `Commit`: no direct edit — correction only via `Reversal/Refund`

### Financial Finality
- Salon: transaction final at **Checkout**
- Online: transaction final only after **Payment Authorized**

### Channel Policy
- Same core rules for all channels
- Online is **stricter** than salon for inventory exceptions

### Price Override
- Manager OR Owner MAY approve standard price overrides
- Unlimited override (>20% of catalog price OR >₪150): **Owner only**
- Emergency path when Owner unavailable: Manager MAY override any amount
  - Owner ex-post approval required within **24 hours**
  - If not approved in 24h: transaction tagged `Non-compliant` (no blocking sanction)
- No automatic sanctions for accumulated `Non-compliant` overrides (reports only)

### Returns & Refunds
- Reversal only — NEVER void a transaction (ledger is append-only)
- Raw materials consumed in service: NEVER returned to inventory
- Retail products: ALWAYS returned to inventory on return
- Return acceptance: any cashier
- Return window: **14 days** from purchase
- Proof of purchase: not required (verify by name/phone)
- No-receipt refund: max **1 per customer per 30 days**
  - Second no-receipt exception: Manager OR Owner, cap **₪150**
- Refund method:
  - Up to **₪150**: any payment method
  - Above **₪150**: same payment method as original transaction

### Non-Compliant Transaction Ownership
- Shared responsibility: Salon Owner + Regional Ops
- Salon Owner has final say in transaction-level disputes
- Central Authority is final for severity/risk reclassification at network level

---

## 6. Offline Policy

### Allowed Operations
- Checkout: **Cash only** (hard rule, no exceptions)
- No customer debt creation offline (cancelled)
- `Recording Only` categories: **services allowed** offline, **retail blocked** offline
- `Open Balance`: visit MAY close without immediate payment offline
  - Treated as `Owner Override` — `Who/Why/When` documentation MUST be recorded
  - Closure target: **7 days** from reconnect
  - If not closed within 7 days: tagged `Non-compliant` only (no blocking)

### Sync Failure Policy
- Financial event sync failure → **Hard block** (MUST NOT continue)
- Non-financial event sync failure → continue + `Non-compliant` tag

### Sync Priority on Reconnect
1. **Inventory + Mix integrity** (first priority)
2. **Financial items** (payments, ledger postings) (second priority)
3. Regular queue processing

### Conflict Model
- Regular conflicts: `Last Write Wins`
- Central Authority is final arbiter
- Block only if `Ledger` is affected
- Concurrent updates in `Active Inventory` that would cause negative stock: allow both + `Non-compliant` tag

### Load Management
- `Under Load` triggered when processing delay reaches **60 seconds**
- Exit from `Under Load` only after **15 minutes** below 60s continuously
- During load: financial sync SLA becomes `Best Effort` (inventory/mix always wins)

---

## 7. Customer & Privacy Policy

### Customer Identity
- Network-wide unified customer profile
- No single salon owns the customer relationship
- Revenue attributed to executing salon only

### Data Access
- All staff across all salons MAY view full customer history (default)
- Sensitive data categories: hidden via predefined list only (not ad-hoc)
- Sensitivity marking by: Salon Owner OR Central Privacy Authority
- Most restrictive wins in sensitivity classification conflicts

### Data Deletion
- Legal partial deletion only: contact data anonymized/deleted, transaction data kept
- Deletion SLA: **7 days** from customer request
- Deletion confirmation sent to customer only on explicit request
- Contact deletion resets no-receipt refund history (accepted risk, no mitigation)

### Sensitive Data Categories
- Defined at network level (Global Baseline)
- Salon Owner MAY add categories beyond baseline
- Central Privacy Authority MAY add categories beyond baseline
- MUST use `Most Restrictive Wins` when Salon Owner and CPA disagree

---

## 8. Network Compliance

### Enrollment
- `Network Compliance` is **mandatory** for all salons
- Owner can still override individual rules with mandatory documentation (`Who/Why/When`)

### Tracking
- Full transition history MUST be recorded: who, when, from-status, to-status
- KPIs shown together with compliance tag per salon (including `Recording Only` data, tagged by mode)
- Non-compliant events visible in same reports (tagged, not hidden)

### CPA Binding Scope
- CPA rules binding for all salons (mandatory compliance)
- Owner Override always available but documented and auditable

---

## 9. Override Documentation & Severity Governance

### Override Documentation
- Every `Owner Override` MUST record: `Who` + `Why` + `When` (minimum)
- `Why` managed via `Reason Codes`: central baseline + Owner local additions
- Central baseline `Reason Codes` CANNOT be deleted by salon
- Local vs central code conflict: **central wins**
- Override without minimal doc: valid operation + `Non-compliant` tag

### Enforcement Model (Non-Blocking)
- `Non-compliant` accumulation: **reports only** (no automatic sanctions)
- Review cadence: **monthly**
- No mandatory intervention threshold — management discretion

### Severity Governance
- Compliance reports use severity `High / Medium / Low` (centrally defined by CPA)
- Owner MAY override severity for a specific event with documentation
- No cap on number of `Severity Overrides` per month
- `Severity Override` affects network KPI
- Central Authority MAY reverse a local `Severity Override` retroactively
- Central Authority is **final** on reversal disputes
- Owner has one-time appeal right within **24 hours** of Central reversal
- After appeal window: reopening allowed with Owner approval (no threshold)
- Reopening MUST include `Who/Why/When` documentation

---

## 10. Governance Process

### Freeze Levels

| Domain | Status | Allowed Changes |
|--------|--------|----------------|
| Financial Authority | Freeze Candidate v1 | Formal Change Request only |
| POS | Near-freeze | Wording fixes only |
| Inventory | Near-freeze | Wording fixes only |
| Mix | Guardrailed open | UX/workflow only, no authority/money |

### Contradiction Resolution Protocol
- MUST perform full scan before fixing (no stop-at-first)
- All contradictions listed flat (no severity tiers)
- CEO decides resolution order
- Each fix MUST be cross-checked against all other rules before closure
- Promotion to `Approved` requires **zero open contradictions**

### Temporary Freeze
- When contradiction found: both conflicting rules enter `Temporary Freeze`
- Displayed as `Frozen - Decision Pending` with CEO as decision owner
- Max **7 days** in freeze; after that most restrictive rule takes effect
- CPA determines which rule is "most restrictive"

### Change Management
- War-room: immediate changes to any rule (no formal CR)
- Outside war-room: CPA approval required (7-day SLA, no emergency fast-track)
- Financial Authority changes: MUST be versioned (version number + timestamp)
- Non-financial changes: MUST have Change Log entry (`What` / `Why` / `Who` / `When`)
- Change valid immediately even if log incomplete; **24h SLA** to complete log
- Incomplete log after 24h: tagged `Non-compliant` (no blocking sanction)

### Late-Session Decisions
- Decisions made at any hour are immediately valid (no next-morning confirmation)
- No mandatory breaks during war-room sessions
- War-room extends until all contradictions resolved (no hard daily cutoff)

---

## 11. Definitions

| Term | Meaning |
|------|---------|
| `Active Inventory` | Category mode where stock levels are tracked and enforced |
| `Recording Only` | Category mode where events are logged but stock not enforced |
| `CPA` | Central Product Authority — network-level product governance body |
| `Non-compliant` | Tag indicating a rule was not followed; no automatic sanction |
| `Freeze Candidate` | Rules considered stable; changes only via formal CR |
| `Near-freeze` | Rules open only for wording/clarification, not substance |
| `Guardrailed open` | Rules open for specific scope (e.g. UX), closed for others (e.g. money) |
| `Temporary Freeze` | Both conflicting rules suspended pending CEO resolution |
| `Owner Override` | One-time approval by Salon Owner for a specific transaction (always allowed, documentation mandatory) |
| `Emergency Override` | Manager acting in place of unavailable Owner (24h ex-post approval) |
| `Open Balance` | Visit closed without immediate payment; treated as Owner Override |
| `Reason Code` | Predefined code from central baseline + optional local additions for documenting `Why` |
| `Severity Override` | Owner reclassification of a compliance event severity (Central MAY reverse) |
| `Hard Block` | Operation cannot proceed; used for financial sync failures |

---

## 12. Critical Changes Since Baseline

Changes where a war-room decision **reversed, scoped down, or cancelled** a
previously locked rule. These are the deltas that matter most for consistency.

| # | What Changed | From | To | Why |
|---|-------------|------|-----|-----|
| 1 | Negative inventory enforcement | Universal hard reject | Hard reject in `Active Inventory` only | `Recording Only` mode introduced for salons not managing active stock |
| 2 | Stock availability gate | Conditional by policy (block sale if no stock) | Stock NOT required for sale/consumption | Many salons will use system for recording only, not active inventory |
| 3 | Offline customer debt | Allowed with Manager/Owner approval, caps, and SLA | **Cancelled entirely** — Cash only offline | Contradicted `Cash only` policy; debt complexity removed |
| 4 | Authority hierarchy: CPA vs Owner | Owner wins over CPA in all conflicts | **CPA wins** in all core-rule conflicts | Network consistency at scale requires central authority |
| 5 | Global reset of Owner-supremacy | Multiple rules gave Owner final override | All rules contradicting CPA supremacy auto-cancelled | Consequence of reversal #4 |
| 6 | Price override: unlimited scope | No limit proposed | Owner only above 20% or ₪150; Manager up to threshold | Uncontrolled override created margin-erosion risk at scale |
| 7 | Contact deletion and refund history | No-receipt refund limit enforced per customer | Deletion resets refund history (accepted risk) | Privacy law compliance takes precedence over fraud guard |
| 8 | Debt SLA under load | Hard 15-minute SLA | Best Effort under load (inventory/mix wins) | Inventory integrity prioritized over debt-closure speed |
| 9 | Open List for owner-approval categories | Salon can choose any category freely | Global Baseline + Optional Adds | Uncontrolled local lists created network-governance risk |
| 10 | No-deletion policy | No customer deletion at all | Legal partial deletion (contact data, 7-day SLA) | Legal/privacy compliance required partial deletion capability |
| 11 | Network Compliance optionality | Voluntary (Owner can exit anytime) | **Mandatory** for all salons; Owner Override with documentation | Consistency at scale requires baseline compliance |
| 12 | Severity Override reopening threshold | Reopening only above ₪500 | Reopening allowed always with Owner approval | ₪500 threshold removed to avoid artificial friction |
| 13 | Recording Only offline scope | Fully blocked offline | **Services allowed** offline, **retail blocked** | Service continuity without retail risk |
| 14 | Financial sync failure | Not explicitly defined | **Hard block** on financial sync failure | Ledger integrity is non-negotiable |
| 15 | Open Balance concept | Not defined | Visit MAY close without payment as `Open Balance` (Owner Override) | Offline service continuity |

---

## 13. Locked Edge-Case Outcomes

Outcomes from the rapid-fire edge-case review session.

| # | Scenario | Outcome |
|---|----------|---------|
| EC-1 | Owner Override executed without `Who/Why/When`, transaction already committed | Transaction stays valid, tagged `Non-compliant` |
| EC-2 | `Recording Only` offline: service + retail in same transaction | Allow all, tag as `Non-compliant` exception |
| EC-3 | `Active Inventory` concurrent updates from two devices cause negative stock | Allow both, tag `Non-compliant` |
| EC-4 | `Open Balance` past 7-day closure target | `Non-compliant` tag only, no blocking |
| EC-5 | Financial event fails mid-sync | **Hard block** — do not continue |
| EC-6 | Central reversed severity, Owner missed 24h appeal | Reopening allowed with Owner approval + `Who/Why/When` |
| EC-7 | AI suggestion pending, no human available, high load | Stays as `Draft` — never auto-executes |
| EC-8 | `Recording Only` categories in network KPI | Shown together with mode tag (not hidden) |
| EC-9 | Owner Override missing `Why` field specifically | Valid + `Non-compliant` |
| EC-10 | Local rule vs central rule conflict in real-time | Central rule wins |
