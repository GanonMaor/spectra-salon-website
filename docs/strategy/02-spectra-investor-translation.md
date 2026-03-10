# Spectra Investor Translation

**Version**: 1.0.0
**Status**: Canon
**Last Updated**: 2026-03-10

This document translates the internal product thesis into investor
language. It defines approved phrases, moat logic, TAM framing, deck
structure, and claim-evidence boundaries. It also codifies what must
never leak into customer-facing copy.

---

## 1. Core Investor Narrative

### One-liner (EN)

> Spectra turns every hair colour mix into ground-level production
> data — building the intelligence platform for salons and the beauty
> industry.

### One-liner (HE)

> ספקטרה הופכת כל ערבוב צבע בסלון לדאטה תפעולי מרצפת הייצור — ובונה
> את פלטפורמת המודיעין של תעשיית היופי.

### 30-second pitch (EN)

Spectra is building the ground-level data infrastructure for professional
beauty, starting with hair salons. Every colour mix is a production
event — grams, formulas, timing, inventory movement — yet the industry
has never captured this data at scale. Spectra connects to the mixing
workflow (software + smart scale) to record real production data in real
time. That data powers AI that automates ordering, exposes true cost per
service, and optimises salon profitability. As more salons use Spectra,
the dataset compounds — creating an AI flywheel and a defensible industry
data asset for beauty.

---

## 2. Approved Investor Phrases

| Phrase | Status | Notes |
|--------|--------|-------|
| Beauty Production Intelligence Platform | Approved | Category name for investor contexts |
| The ground-level data layer for professional beauty | Approved | Core positioning |
| Every mix becomes data. Data powers AI. AI powers adoption. | Approved | Flywheel shorthand |
| The only real-time hair-industry production dataset | Approved with caveat | Accurate for the current market; verify before expanding to adjacent beauty segments |
| The world's only hair data lake | Use carefully | Accurate directionally but "data lake" implies a larger technical infrastructure than currently exists; prefer "production dataset" in written materials |
| Bloomberg Terminal for the hair industry | Investor-only, vision framing | Aspirational analogy; do not use in product docs |
| Salon Cost Optimization for Pros | Customer-facing only | Never in investor decks as the primary positioning |

---

## 3. Moat Logic (Defensibility Stack)

Present to investors in this order:

1. **Workflow embedding** — daily usage at the moment value is created,
   not after-the-fact data entry.
2. **Hardware capture** — smart scale produces structured grams-level
   measurement, not self-reported estimates.
3. **Compounding dataset** — cross-salon production events, anonymized
   and aggregated, growing with every service.
4. **AI flywheel** — better models produce more salon ROI, which drives
   retention and adoption, which produces more data.
5. **Expansion lock-in** — from color-cost wedge into full salon OS
   (calendar, inventory, ordering, analytics, AI assistants).

### Competitor positioning

| Bucket | Examples | Spectra advantage |
|--------|----------|------------------|
| Salon OS (booking/POS/CRM) | Fresha, Boulevard, Phorest | Large surface but weak on production measurement; no grams-level data |
| Colour cost / backbar tools | SalonScale, Vish | Strong wedge overlap but not expanding into full OS or data platform |
| Enterprise salon platforms | Zenoti, Mindbody | Heavier implementation; serve multi-location chains, not independent salons |
| Brand apps / formula tools | L'Oreal apps | Optimized for single-brand experience, not cross-brand production truth |

---

## 4. TAM / SAM / SOM

| Layer | Definition | Size | Source |
|-------|-----------|------|--------|
| TAM (industry) | Global salon services | $447.76B (2032 forecast) | Fortune Business Insights |
| TAM (adjacent) | Beauty & Personal Care worldwide | $677.19B (2025) | Statista |
| SAM (wedge) | Hair colour product market | $52.66B (2032 forecast) | Maximize Market Research |
| SOM (initial) | Colour-heavy salons reachable via current distribution | Derive from: salon count x ARPA x target geo | Internal model |

Market data references:
- Salon services: Fortune Business Insights press release
- Hair care: Fortune Business Insights
- Hair colour: Maximize Market Research
- Beauty & Personal Care: Statista

---

## 5. Deck Section Order (10-12 Slides)

1. **Title** — Spectra: The Intelligence Platform for the Beauty Industry
   + one-liner + key traction stat
2. **Problem** — Salons have no production data; $10K-$30K lost per year
   on unmeasured colour waste
3. **Solution** — Capture every colour mix (grams + formula); auto-inventory,
   cost intelligence
4. **Product** — Smart scale + iPad + real-time formula capture; scan, weigh, mix
5. **Data moat** — Ground-level dataset from production workflow; why it
   compounds; why it is defensible
6. **AI flywheel** — Diagram + concrete AI outputs (HairGPT, ordering
   prediction, margin analytics)
7. **Traction & SaaS metrics** — Revenue, retention, usage depth, validation
   pilots (L'Oreal, European distributor)
8. **Business model** — Subscription tiers + expansion modules + future
   intelligence-layer monetization
9. **Market** — TAM/SAM/SOM with cited data
10. **Go-to-market** — ICP, channels, land-expand-embed
11. **Competition** — Why incumbents cannot retrofit production data
12. **Team & ask** — Team, raise amount, use of funds, milestones

---

## 6. Claim-Evidence Boundaries

### Claims with current evidence

| Claim | Evidence | Status |
|-------|---------|--------|
| 180+ salons use Spectra daily | Active subscription count | Canonical |
| 90% 1-month retention | Cohort overlap across 17 months of data | Canonical |
| $149K annual subscription revenue (2025) | Revenue data in investor deck | Canonical |
| +60% YoY revenue growth (2024 vs 2025) | Computed from monthly revenue data | Canonical |
| 268 total unique accounts tracked | market-intelligence.json summary | Canonical |
| 187 brands tracked across the platform | market-intelligence.json summary | Canonical |
| 16,352 average monthly services tracked | market-intelligence.json summary | Canonical |
| L'Oreal data license pilot ($5.5K) | Signed pilot agreement | Canonical |
| European distributor pilot (50 licenses, EUR 15K) | Signed agreement | Canonical |
| LTV:CAC 5.0x | Computed from CAC breakdown + 3yr LTV model | Canonical (model-based) |

### Claims that are provisional (need strengthening)

| Claim | Gap | What would make it canonical |
|-------|-----|---------------------------|
| "The only real-time hair data lake" | Current dataset is report-driven, not real-time capture | Live operational data pipeline from smart-scale workflow |
| "AI flywheel is spinning" | HairGPT exists but is internal/gated, not broadly adopted | HairGPT used by paying customers; measurable retention lift from AI features |
| Token-based intelligence revenue | Concept articulated; no paying token customers yet | First paid intelligence access deal beyond L'Oreal pilot |
| "Bloomberg Terminal for the hair industry" | Aspirational vision statement | Multiple paying data-access customers across brands/distributors |

### Claims that should never be made

| Claim | Reason |
|-------|--------|
| "We have a live real-time production data lake" | Not yet technically true; dataset is batch-processed from reports |
| "AI manages salon operations" | AI is advisory only; no authoritative write path |
| "We sell salon-identifiable data" | Violates privacy commitment; all intelligence is anonymized and aggregated |

---

## 7. HairGPT in Investor Materials

HairGPT should be presented as:
- The first AI interface over Spectra's proprietary production dataset.
- A proof of the strategic sequence: workflow capture -> structured data ->
  analytical outputs -> AI query surface.
- A domain-specific business consultant for the hair industry, grounded in
  real data, not a general chatbot.

HairGPT should **not** be presented as:
- A standalone AI product.
- The primary value proposition.
- A product available to all customers today (it is internal/gated).

Recommended investor framing:
> HairGPT demonstrates that when you own structured production data from
> the salon floor, you can build AI that answers real business questions
> — which brand is gaining share, what is the average product usage per
> service in a given city, where should a distributor focus inventory.
> This is the intelligence layer that compounds.

---

## 8. Privacy Messaging (Customer vs Investor)

### Customer-facing

> We use your salon's data to provide the Spectra service: accurate
> colour costing, inventory automation, and operational reporting. We may
> also use de-identified, aggregated data to improve our product models.
> We do not sell personal client data, and your salon retains control of
> its client relationships.

### Investor-facing

The privacy commitment is a feature, not a limitation. Salons trust
Spectra because data is aggregated and anonymized. This trust drives
adoption, which grows the dataset. The intelligence layer operates on
anonymized production events, not identifiable salon data.

---

## 9. Source Inputs

- `docs/Spectra Mega Investor Document for Cursor.pdf`
- `src/screens/Investors/InvestorsPage.tsx`
- `src/screens/InvestorPage/NewInvestorsDeck.tsx`
- `src/screens/InvestorFlywheel/InvestorFlywheelPage.tsx`
- `PRESENTATION_GUIDE.md`
- `reference/spectra-homemodes-pack/governance/cursor-rules/spectra-strategy-context.mdc`
