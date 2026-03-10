# Agent and Doc Writing Rules

**Version**: 1.0.0
**Status**: Canon
**Last Updated**: 2026-03-10

This document gives Claude, Cursor, and any future AI tooling a stable
rule set for writing strategy documents, investor pages, deck copy, and
marketing content for Spectra.

---

## 1. What Spectra Is

Spectra is a **data platform with SaaS interfaces** for professional
hair salons. It captures ground-level production data from the salon
color-bar workflow and uses it to power operational intelligence, AI
assistants, and — eventually — industry-level data products.

The core product wedge is: **measure real color consumption per service**.

The company thesis is: **own the Beauty Production Data Layer for
professional hair salons**.

---

## 2. What Spectra Is Not

- Not a generic salon booking or POS system.
- Not an AI company that happens to have a salon product.
- Not a hardware company (the smart scale is a sensor, not the product).
- Not a consumer-facing app.

---

## 3. Authority Hierarchy for Strategy Docs

When sources conflict, this is the precedence order:

1. `docs/strategy/00-spectra-north-star-and-product-thesis.md`
2. `docs/strategy/02-spectra-investor-translation.md`
3. `docs/strategy/01-spectra-product-map-and-system-scope.md`
4. `docs/strategy/03-vision-to-roadmap-bridge.md`
5. This document (`04-agent-and-doc-writing-rules.md`)

When these strategy docs conflict with
`reference/spectra-homemodes-pack/governance/CLAUDE.md` or
`reference/spectra-homemodes-pack/governance/cursor-rules/spectra-war-room-governance.md`,
the existing governance documents win on operational and financial rules.
These strategy docs win on narrative, positioning, and investor language.

---

## 4. Messaging Split (Hard Rule)

| Context | Allowed language |
|---------|-----------------|
| Customer UI, website, public marketing | Operational value only: cost visibility, waste reduction, formula accuracy, inventory control, profitability improvement |
| Internal docs, strategy docs, agent context | Full stack: data platform, production-data layer, intelligence, moat, flywheel |
| Investor pages, decks, investor emails | Full stack plus: TAM/SAM/SOM, defensibility, revenue models, AI flywheel, token economy, competitive positioning |

**Never** use investor-only language in customer-facing surfaces.
**Never** describe Spectra as a "data company" or "AI company" in public
marketing. The customer value proposition is salon cost optimization and
waste reduction.

---

## 5. Approved North Star Phrases

### Customer-facing

- "Salon Cost Optimization for Pros"
- "Every gram measured. Every mix intentional."
- "Cut waste. Boost margins. Total control."
- "Built for Hair Colorists"
- "Stop losing money on wasted hair color."

### Investor-facing

- "Beauty Production Intelligence Platform"
- "The ground-level data layer for professional beauty"
- "Every mix becomes data. Data powers AI. AI powers adoption."
- "The only real-time hair-industry production dataset"

### Internal (agent/doc context)

- "Workflow capture -> structured dataset -> analytical outputs -> AI
  query surface"
- "The compounding asset is the Beauty Production Data Layer"
- "HairGPT is a read-only intelligence consumer, not the source of truth"

---

## 6. Claim-Evidence Rules

### Rule 1: Every quantitative claim must have a traceable source

Acceptable sources:
- `market-intelligence.json` summary and computed metrics
- Revenue data hardcoded in investor deck components
- Signed pilot agreements
- Published market research (with citation)

Unacceptable:
- Estimates without stated assumptions
- Projected numbers presented as actuals
- Rounded numbers without the original data point

### Rule 2: Distinguish current state from future state

When writing about capabilities, always clarify:
- **"Today"** — something that is live and working in the current product.
- **"In development"** — actively being built.
- **"Planned"** — designed but not yet started.
- **"Vision"** — long-term aspiration.

Never present a "vision" item as a "today" item.

### Rule 3: The data layer has two states

| State | Description | Approved language |
|-------|-----------|------------------|
| Current | Report-driven intelligence dataset, batch-processed from Excel usage reports | "Internal intelligence dataset", "structured salon production data", "analytical dataset" |
| Future | Live production-data infrastructure fed by smart-scale workflow and device capture | "Real-time production data layer", "live data infrastructure", "production data lake" |

Do not conflate these two states. When describing HairGPT or dashboards,
note that they operate on the current (report-driven) dataset.

---

## 7. HairGPT Writing Rules

### Do

- Describe HairGPT as "the first AI interface over Spectra's structured
  production dataset."
- Note that it is constrained to answer only from the internal dataset.
- Mention that it supports bilingual (EN/HE) interaction.
- Highlight that it returns structured responses with confidence scoring,
  charts, and suggested follow-ups.
- Position it as a proof of the data-to-intelligence thesis.

### Do Not

- Describe HairGPT as a standalone AI product.
- Imply that HairGPT is available to all customers (it is gated).
- Claim that HairGPT "manages" salon operations (it is read-only).
- Use HairGPT as the primary value proposition in customer-facing copy.
- Imply that HairGPT answers are authoritative operational truth (they
  are analytical outputs from aggregated data).

---

## 8. Data Layer Writing Rules

### Do

- Describe the dataset as "structured, anonymized, and aggregated."
- Note the data window when citing statistics (e.g., "Aug 2023 - Jan
  2026, 17+ months").
- Distinguish between salon-specific operational data and cross-salon
  intelligence.
- Emphasize that the privacy commitment (no salon-identifiable data
  exposed externally) is a feature that drives trust and adoption.

### Do Not

- Call the current system a "data lake" without qualification; prefer
  "internal intelligence dataset" or "production dataset."
- Claim real-time data capture unless the live event pipeline is
  implemented.
- Imply that salon data is sold in identifiable form.
- Mix procurement-cost data with client-facing price data without
  labeling clearly.

---

## 9. Decision Test for Future Writing

Before writing any strategy, investor, or product copy, ask:

> 1. Does this claim have a traceable evidence source in the repo?
> 2. Am I using the correct audience language (customer vs investor)?
> 3. Am I distinguishing current state from future state?
> 4. Does this strengthen the identity hierarchy (wedge -> ops -> data
>    -> intelligence -> AI)?
> 5. Would this claim survive due diligence?

If any answer is "no," revise before publishing.

---

## 10. Document Maintenance

When updating any of the five strategy canon documents:
- Increment the version number.
- Update the "Last Updated" date.
- Ensure the change is consistent with `00-spectra-north-star-and-product-thesis.md`.
- If a new investor claim is added to `02-spectra-investor-translation.md`,
  verify that corresponding evidence exists or the claim is marked as
  provisional in `03-vision-to-roadmap-bridge.md`.

---

## 11. Source Inputs

- `reference/spectra-homemodes-pack/governance/cursor-rules/spectra-strategy-context.mdc`
- `reference/spectra-homemodes-pack/governance/CLAUDE.md`
- `docs/strategy/00-spectra-north-star-and-product-thesis.md`
- `docs/strategy/02-spectra-investor-translation.md`
