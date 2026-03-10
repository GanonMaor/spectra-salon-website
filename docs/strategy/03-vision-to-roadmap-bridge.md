# Vision-to-Roadmap Bridge

**Version**: 1.0.0
**Status**: Canon
**Last Updated**: 2026-03-10

This document connects the strategic narrative to execution. It defines
what must become true in product, data, and proof before each stronger
investor claim can be made.

---

## 1. Current State Summary

### What exists and works

| Area | Current state | Confidence |
|------|--------------|-----------|
| Marketing website | Live, converting leads, dark/light mode, UGC popup | Production |
| Salon CRM shell | Schedule, customers, inventory, analytics, staff placeholder | Production (mock fallback) |
| Analytics dashboard | Salon performance with KPI cards, charts, glass UI | Production |
| Market intelligence dataset | 17+ months, 268 salons, 187 brands, 16K+ monthly services | Production (batch) |
| HairGPT | AI query layer over dataset, bilingual, charts, confidence scoring | Production (gated) |
| Market Intelligence dashboard | Interactive exploration of dataset | Production (gated) |
| L'Oreal Analytics | Cohort analysis, brand performance | Production (gated) |
| Investor pages | 3 deck variants, flywheel page, overview page | Production (gated) |
| Data pipeline | Excel -> process-market-data.js -> market-intelligence.json | Production (manual) |
| Lead capture + CRM functions | Netlify functions for leads, schedule, customers, inventory | Production |

### What does not yet exist

| Area | Status | Blocking claim |
|------|--------|---------------|
| Live real-time data capture from smart-scale workflow | Not implemented in this repo | "Real-time data lake" |
| HairGPT available to paying customers | Internal/gated only | "AI flywheel is spinning" |
| Token-based intelligence access | Concept only (UI mockup in flywheel page) | "Token revenue stream" |
| Automated report ingestion | Manual Excel processing | "Continuous data pipeline" |
| Cost-per-service from live mix data | Not yet connected | "Real-time cost visibility" |
| Inventory forecasting / auto-ordering | Not implemented | "AI-powered operations" |
| Smart calendar with cycle awareness | Not implemented | "All-in-one salon OS" |

---

## 2. Evidence Map (Claim -> Current Proof -> Gap)

### Already provable

| Claim | Evidence in repo |
|-------|-----------------|
| Salons use Spectra daily | 180+ active subscriptions, revenue data, retention metrics |
| Strong retention | 90% M1, 84% M3, 78% M6 from 17-month cohort analysis |
| Revenue is growing | $93K (2024) -> $149K (2025), +60% YoY |
| We have structured salon production data | `market-intelligence.json`: grams, brands, services, geography, pricing |
| AI can answer real business questions from this data | HairGPT live and functional with grounded answers |
| L'Oreal validates intelligence value | Signed $5.5K data license pilot |
| European distributor validates B2B channel | Signed 50-license pilot at EUR 15K |
| Hardware + software creates workflow embedding | Product clips, Instagram reels, real salon deployments |

### Needs strengthening

| Claim | Current state | What would close the gap |
|-------|--------------|------------------------|
| "Real-time production data" | Dataset is batch-processed from monthly reports | Connect smart-scale events to live data pipeline |
| "HairGPT is driving adoption" | Internal/gated, not customer-facing | Ship HairGPT as a feature to paying salons; measure usage |
| "Data flywheel is spinning" | Flywheel is articulated and directionally true; not yet measurable | Show correlation: more salons -> richer data -> better AI -> retention lift |
| "Industry data products" | One L'Oreal pilot | Additional paid data-access customers |
| "All-in-one salon OS" | CRM shell exists but with mock data fallbacks | Fully connected CRM with real DB operations |

---

## 3. 30/60/90-Day Proof Roadmap

### Days 1-30: Foundation hardening

| Action | Output | Investor value |
|--------|--------|---------------|
| Automate report ingestion pipeline | Scripted, repeatable data refresh | "Continuous intelligence pipeline" becomes accurate |
| Connect CRM schedule/customers to real DB (remove mock fallbacks) | Production CRM surfaces | "Salon OS" claim becomes credible |
| Document the current intelligence dataset formally | Published data-layer spec | Internal alignment; investor due-diligence readiness |
| Prepare HairGPT for limited customer preview | Feature-flagged access for select salons | "AI is customer-facing" becomes partially true |

### Days 31-60: Intelligence proof

| Action | Output | Investor value |
|--------|--------|---------------|
| Ship HairGPT to 10-20 paying salons as beta | Usage data, feedback, retention signal | "AI flywheel is starting" becomes provable |
| Add cost-per-service derivation from dataset | Visible cost analytics in CRM dashboard | "Cost visibility" claim backed by real data |
| Create a repeatable data-access package for brands | Templated intelligence report | Second intelligence customer beyond L'Oreal |
| Implement basic inventory velocity metrics | Dashboard widget | "Inventory intelligence" moves from concept to product |

### Days 61-90: Narrative escalation

| Action | Output | Investor value |
|--------|--------|---------------|
| Demonstrate HairGPT retention lift (beta cohort vs control) | Quantified AI impact | "AI drives adoption" becomes data-backed |
| Begin live data capture design (smart-scale event pipeline spec) | Architecture document | "Real-time data infrastructure" has a credible timeline |
| Close second paid intelligence customer | Signed deal | "Intelligence revenue layer" is validated |
| Update investor deck with new proof points | Refreshed deck | Ready for next fundraise conversation |

---

## 4. HairGPT Proof Path

HairGPT is currently a strong demo and internal tool. To become a
strategic asset rather than only a demo layer, it needs:

1. **Customer access** — available to paying salons, not just internal.
2. **Usage measurement** — track sessions, questions asked, follow-ups
   clicked, charts viewed.
3. **Retention correlation** — compare retention of salons using HairGPT
   vs those that do not.
4. **Content expansion** — connect to salon-specific data, not just
   market-level aggregates (e.g., "your salon used 12% more color than
   average this month").
5. **Brand interest** — demonstrate that brands/distributors would pay to
   ask questions about the dataset (token economy validation).

---

## 5. Data Layer Evolution Path

### Current: Report-Driven Intelligence

```
Monthly Excel reports -> process-market-data.js -> market-intelligence.json
```

- Batch processed, manual trigger
- Anonymized and aggregated
- ~17 months of data, growing monthly
- Consumed by dashboards, HairGPT, investor pages

### Target: Live Production Data Infrastructure

```
Smart scale + app events -> event pipeline -> structured data store
  -> real-time projections -> dashboards + HairGPT + intelligence API
```

- Live capture from salon workflow
- Event-driven, continuous
- Per-salon operational truth + cross-salon anonymized intelligence
- Consumed by salons (operational value) + brands/distributors (intelligence products)

### What bridges the gap

| Step | Complexity | Prerequisite |
|------|-----------|-------------|
| Automate Excel ingestion (scheduled, not manual) | Low | None |
| Add event logging to existing CRM functions | Medium | CRM connected to real DB |
| Design smart-scale event schema | Medium | Product spec for BLE integration |
| Implement event pipeline (scale -> API -> store) | High | BLE integration, mobile app, backend |
| Build real-time projections from live events | High | Event pipeline operational |

---

## 6. Revenue Proofs Already in the Repo

The following revenue and traction data is already embedded in the
codebase and can be cited in investor materials:

| Metric | Value | Source |
|--------|-------|--------|
| 2024 total revenue | $93K | `NewInvestorsDeck.tsx` REVENUE_DATA |
| 2025 total revenue | $149K | `NewInvestorsDeck.tsx` REVENUE_DATA |
| YoY growth | +60% | Computed |
| Active subscriptions | 180 | `NewInvestorsDeck.tsx` |
| Israel ARPU | $68/mo | `NewInvestorsDeck.tsx` |
| International ARPU | $58/mo | `NewInvestorsDeck.tsx` |
| 1-month retention | 81% | `investor-metrics.ts` PRODUCT_KPI |
| 3-month retention | 76% | `investor-metrics.ts` PRODUCT_KPI |
| 6-month retention | 70% | `investor-metrics.ts` PRODUCT_KPI |
| Avg monthly services/account | 106 | `investor-metrics.ts` PRODUCT_KPI |
| Total unique accounts | 371 | `investor-metrics.ts` PRODUCT_KPI |
| Total brands tracked | 185 | `investor-metrics.ts` PRODUCT_KPI |
| Avg monthly product value flowing through platform | $286K | `investor-metrics.ts` PRODUCT_KPI |
| CAC total | $37K | `InvestorsPage.tsx` |
| 3yr LTV | $185K | `InvestorsPage.tsx` |
| LTV:CAC | 5.0x | `InvestorsPage.tsx` |
| Leads (2025) | 1,476 | `InvestorsPage.tsx` |
| Trials (2025) | 301 | `InvestorsPage.tsx` |
| Customers from trials | 96 | `InvestorsPage.tsx` |

---

## 7. Source Inputs

- `src/index.tsx`
- `src/screens/InvestorFlywheel/flywheel-data.ts`
- `src/screens/InvestorPage/NewInvestorsDeck.tsx`
- `src/screens/Investors/InvestorsPage.tsx`
- `scripts/process-market-data.js`
- `netlify/functions/hairgpt.js`
- `netlify/functions/market-insights.js`
- `docs/Spectra Mega Investor Document for Cursor.pdf`
