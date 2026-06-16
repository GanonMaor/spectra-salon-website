# Catalog Research Verification Audit

Generated at: 2026-06-16T19:35:36.637Z

## Verdict

The current system covers the imported catalog and observed usage data, but it has not yet exhausted internet/source verification. It should be treated as an enriched V1 catalog and intelligence dictionary, not a manufacturer-certified source of truth.

## Source Matrix

### Product Truth Center

- Route: /admin → Product Truth tab
- Runtime source: Static bundled JSON
- API: None
- Neon dependency: None at runtime
- Verification state: Observed usage grouping + identity heuristics; no external source verification.
- Primary files: `src/screens/AdminDashboard/ProductTruthCenterPanel.tsx`, `src/data/product-truth-seed.json`
- Generation: `scripts/build-product-truth-seed.js`, `scripts/lib/product-catalog/product-identity.js`

### Product Catalog Browser

- Route: /admin → Product Catalog tab
- Runtime source: Static index plus per-brand JSON fetch
- API: None
- Neon dependency: None; full catalog is not in Neon
- Verification state: XLSX-derived catalog with heuristic classification and Google search URLs.
- Primary files: `src/screens/AdminDashboard/CatalogBrowserPanel.tsx`, `src/data/catalog-truth-index.json`, `public/catalog-brands/*.json`
- Generation: `scripts/build-catalog-truth.js`

### Beauty Intelligence Dictionary

- Route: /admin → Beauty Intelligence tab
- Runtime source: Netlify Function reading static JSON plus Neon inventory counts
- API: /.netlify/functions/beauty-intelligence/*
- Neon dependency: usage_report_rows counts only
- Verification state: Observed usage + curated brand rules + classification heuristics.
- Primary files: `src/screens/AdminDashboard/BeautyIntelligencePanel.tsx`, `src/lib/beautyIntelligenceClient.ts`, `netlify/functions/beauty-intelligence.js`, `public/beauty-intelligence/*`, `src/data/beauty-intelligence/index.json`
- Generation: `scripts/build-beauty-intelligence.js`, `scripts/lib/beauty-intelligence/*`

### Color Intelligence Preview

- Route: /investors/color-intelligence-preview
- Runtime source: Static bundled JSON plus hardcoded slide copy
- API: None
- Neon dependency: None
- Verification state: Presentation layer; not a verification workflow.
- Primary files: `src/screens/ColorIntelligencePreview/*`, `src/data/color-intelligence-preview-data.json`
- Generation: `No dedicated npm build script found`

### Israel Customer Usage Example

- Route: /investors/israel-customer-usage-example
- Runtime source: Static bundled JSON plus hardcoded page constants
- API: None
- Neon dependency: None
- Verification state: Usage sample presentation; not a product verification workflow.
- Primary files: `src/screens/IsraelCustomerUsageExample/IsraelCustomerUsageExamplePage.tsx`, `src/data/pol-customer-usage-summary.json`
- Generation: `scripts/process-pol-customer-usage.js`


## Catalog Coverage

- Products loaded from brand files: 32937
- XLSX rows in index: 32937
- Brand files: 302
- Active products: 31306
- Deleted products: 585
- Deprecated products: 31
- Barcode conflicts: 1015
- Products with Google verification URL: 32937 (100%)
- Products with actual source evidence: 0 (0%)
- Products with image: 26109 (79.27%)
- Products with barcodes: 16955 (51.48%)
- Products with weight: 32531 (98.77%)
- Products with shade description: 14766 (44.83%)

Verification status counts:

| status | count |
| --- | ---: |
| source-linked | 31306 |
| needs-review | 1631 |

## Beauty Intelligence Coverage

- Observed items in index: 624
- Shade records loaded: 624
- Brands: 24
- Series: 61
- Color shades: 538
- Developers: 38
- Lighteners: 33
- Records with official URL: 283 (45.35%)
- Records with market classification: 538 (86.22%)
- Color shades missing market category: 55 (10.22%)
- Unknown product type records: 14 (2.24%)

## Research Gap

- Automated manufacturer/source fetching per product.
- Barcode/GTIN lookup and match scoring.
- Persisted source evidence with URL, title, matched fields, confidence, and timestamp.
- Human review queue that changes verification status.
- Neon-backed catalog and dictionary tables as the source of truth.
- Join between 32,937 catalog products and 624 observed usage identities.
- Single shared shade classification engine across catalog, product truth, and beauty intelligence.

## Verification Layer

- `verified`: Official/source evidence matches product identity strongly.
- `partially_verified`: Source evidence supports part of the identity, but one or more fields are missing.
- `source_linked`: A search URL exists, but no source has been fetched or matched.
- `heuristic_only`: Classification comes from XLSX fields and local rules only.
- `needs_review`: Conflicting barcode, deleted/replaced brand marker, ambiguous product kind, or missing critical classification.

## Neon Truth Plan

- `beauty_product_catalog_items`: Global canonical catalog imported from XLSX and later official sources.
- `beauty_observed_items`: Observed salon usage identities separated from catalog truth.
- `beauty_series_dictionary`: Curated product knowledge by brand and series.
- `beauty_shade_intelligence`: Shade-level market classification and observed evidence.
- `beauty_dictionary_sources`: Evidence layer for product and series verification.
- `beauty_dictionary_audit_log`: Append-only record of edits/imports/status changes.
