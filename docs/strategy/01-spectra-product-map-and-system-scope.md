# Spectra Product Map and System Scope

**Version**: 1.0.0
**Status**: Canon
**Last Updated**: 2026-03-10

This document maps what the product actually is today and where each
surface sits in the expansion roadmap. It separates core product, internal
tools, investor-facing surfaces, and intelligence-layer proofs.

---

## 1. Product Surface Classification

Every route and feature in the current repo falls into one of four
categories:

| Category | Definition | Visible to |
|----------|-----------|-----------|
| **Core Product** | Surfaces that deliver daily operational value to salons | Customers (public) |
| **Acquisition Funnel** | Marketing, lead capture, and conversion surfaces | Prospects (public) |
| **Internal / Gated** | Intelligence dashboards, analytics, and admin tools behind access codes | Internal team |
| **Investor / Demo** | Narrative pages that tell the company story to investors | Investors (gated) |

---

## 2. Current Route Map

### Core Product

| Route | Surface | Data source | Notes |
|-------|---------|------------|-------|
| `/crm/schedule` | Calendar / scheduling | Netlify function + mock fallback | Drag-drop appointments, week/day/list views |
| `/crm/customers` | Customer management | Netlify function + mock fallback | Client records and history |
| `/crm/inventory` | Inventory management | Netlify function + mock fallback | Product stock tracking |
| `/crm/analytics` | Salon performance dashboard | Computed from operational data | KPI cards, charts, glass-morphism UI |
| `/crm/spectra-preview` | Spectra feature preview | Mixed live + demo data | Demonstrates future capabilities |
| `/crm/staff` | Staff management | Placeholder | Not yet implemented |

### Acquisition Funnel

| Route | Surface | Purpose |
|-------|---------|---------|
| `/` | Marketing home page | Hero, waste calculator, benefits, social proof, UGC popup |
| `/about` | About page | Company story |
| `/ugc-offer` | Special offer landing page | Lead generation with trial offer |
| `/lead-capture` | Lead capture form | Direct lead submission to DB |

### Internal / Gated (access-code protected)

| Route | Surface | Data source | Notes |
|-------|---------|------------|-------|
| `/hairgpt` | HairGPT AI assistant | `market-intelligence.json` via OpenAI | Bilingual, conversation history, charts |
| `/market-intelligence` | Market intelligence dashboard | `market-intelligence.json` | Monthly trends, service breakdown, brand leaderboard, customer table |
| `/loreal-analytics` | L'Oreal-specific analytics | `market-intelligence.json` | Cohort analysis, brand performance |
| `/admin` | Admin dashboard | Netlify function (salon-users) | User management, customer success |
| `/competitors` | Competitive landscape | Static data | Feature comparison matrix |
| `/stock-grid` | Stock grid view | Static concept | Inventory grid prototype |

### Investor / Demo

| Route | Surface | Purpose |
|-------|---------|---------|
| `/new-investors-deck` | Investor pitch deck (v1) | Apple-style scroll deck with revenue data, traction, growth story |
| `/new-investors-deck-v2` | Investor pitch deck (v2) | Newer version with expanded sections |
| `/investors` | Investor overview page | Multi-section narrative with deep-dive accordions |
| `/investors-ai-flywheel` | AI flywheel showcase | Flywheel diagram, data pipeline, HairGPT showcase, token economy |

---

## 3. Intelligence-Powered Surfaces

The following surfaces are powered by `src/data/market-intelligence.json`,
which is the internal analytical dataset built from salon usage reports:

| Surface | How it uses the dataset |
|---------|----------------------|
| HairGPT (`/hairgpt`) | Dataset injected as system context into OpenAI; answers grounded in real data |
| Market Intelligence (`/market-intelligence`) | Frontend dashboard reads and visualizes the full dataset directly |
| L'Oreal Analytics (`/loreal-analytics`) | Reads the dataset and applies Israel/L'Oreal-specific filters |
| Market Insights function (`netlify/functions/market-insights.js`) | Builds text context from dataset for AI-powered analysis |
| Investor Flywheel (`/investors-ai-flywheel`) | `flywheel-data.ts` extracts summary, city nodes, brand rankings from dataset |
| Investor pages (decks + overview) | Reference KPIs computed from the same dataset (retention, usage depth, services) |

**Current data pipeline:**

```
Excel reports (reports/users_susege_reports/*.xlsx)
  |
  v
scripts/process-market-data.js  (anonymize, aggregate, deduplicate)
  |
  v
src/data/market-intelligence.json  (single analytical dataset)
  |
  v
Frontend dashboards + HairGPT + Investor pages
```

This is a report-driven intelligence dataset, not a live real-time
production data stream. The distinction matters for accurate investor
claims and for planning the evolution toward live capture.

---

## 4. What the Dataset Contains

The `market-intelligence.json` dataset includes:

- **Summary**: total salons, brands, visits, services, revenue (cost basis), grams, date range
- **Monthly trends**: visits, services, revenue, grams, active brands, service-type breakdown per month
- **Brand performance**: per-brand services, revenue, visits, grams, months active
- **Geographic distribution**: per-country and per-city service counts, revenue, top cities
- **Salon size benchmarks**: small/medium/large salon averages
- **Pricing trends**: declared client prices for root color, highlights, haircuts
- **Service breakdown**: color, highlights, toner, straightening, others

Data window: approximately Aug 2023 through Jan 2026 (17+ months of active data).

---

## 5. Expansion Layers (Believable Next Steps vs Distant Vision)

### Near-term (existing foundation, 0-6 months)

- Harden CRM surfaces (schedule, customers, inventory) with real DB connections
- Strengthen data pipeline with additional report sources
- Improve HairGPT with richer chart outputs and Hebrew UX
- Automate report ingestion instead of manual Excel processing

### Medium-term (requires meaningful product work, 6-18 months)

- Live operational data capture from smart-scale workflow (replacing report-driven pipeline)
- Inventory forecasting and auto-ordering based on consumption patterns
- Smart calendar aware of color-service processing times
- Cost-per-service visibility driven by real-time mix data

### Long-term (vision, 18+ months)

- Industry data products for brands and distributors (token-based access)
- Cross-geography benchmarking from anonymized production data
- AI-driven formula recommendations and anomaly detection
- Full salon OS expansion: POS, checkout, payments, ledger

---

## 6. Source Inputs

- `src/index.tsx` (route map)
- `src/components/Navigation.tsx` (navigation structure and hidden pages)
- `src/screens/HairGPT/HairGPTPage.tsx` (HairGPT implementation)
- `src/screens/MarketIntelligence/MarketIntelligencePage.tsx` (market intelligence dashboard)
- `src/screens/SalonCRM/SalonCRMPage.tsx` (CRM shell)
- `src/screens/Frame/components/HeroSection.tsx` (marketing home)
- `scripts/process-market-data.js` (data pipeline)
- `src/screens/InvestorFlywheel/flywheel-data.ts` (flywheel data selectors)
