# Neon Import Runbook Draft

This runbook describes how to move the current static catalog and Beauty Intelligence outputs into Neon without breaking the existing Admin UI.

## Phase 0: Preconditions

- Keep current JSON files as production fallback.
- Confirm production has `DATABASE_URL` or `NEON_DATABASE_URL`.
- Do not delete `public/catalog-brands/*` or `public/beauty-intelligence/*` until Neon-backed routes are verified.

## Phase 1: Schema

Create a migration based on:

- `reports/catalog-verification-audit/neon-schema-draft.sql`

Recommended migration file:

- `migrations/XX_beauty_dictionary.sql`

The migration should be idempotent and safe to run more than once.

## Phase 2: Bulk Import Scripts

Create two scripts:

1. `scripts/import-catalog-to-neon.js`
   - Reads `public/catalog-brands/*.json`.
   - Upserts into `beauty_product_catalog_items`.
   - Converts `flag` into `catalog_status`.
   - Sets initial `verification_status`:
     - `needs_review` for deleted, deprecated, barcode conflict.
     - `source_linked` for active rows with `verificationUrl`.
     - `heuristic_only` for rows without source/search links.

2. `scripts/import-beauty-intelligence-to-neon.js`
   - Reads `public/beauty-intelligence/brands.json`.
   - Reads `public/beauty-intelligence/series/*.json`.
   - Reads `public/beauty-intelligence/shades-*.json`.
   - Upserts into:
     - `beauty_observed_items`
     - `beauty_series_dictionary`
     - `beauty_shade_intelligence`

## Phase 3: Import Validation

After import, verify:

| Check | Expected baseline |
| --- | ---: |
| `beauty_product_catalog_items` count | `32937` |
| Active products | `31306` |
| Needs review products | at least `1631` |
| `beauty_observed_items` count | `624` |
| `beauty_series_dictionary` count | `61` |
| Color shades missing category | `55` before cleanup |

Validation query examples:

```sql
SELECT COUNT(*) FROM beauty_product_catalog_items;

SELECT catalog_status, verification_status, COUNT(*)
FROM beauty_product_catalog_items
GROUP BY catalog_status, verification_status
ORDER BY catalog_status, verification_status;

SELECT COUNT(*)
FROM beauty_shade_intelligence
WHERE product_type NOT IN ('developer', 'lightener')
  AND market_category IS NULL;
```

## Phase 4: API Switch

Update `netlify/functions/beauty-intelligence.js` route by route:

1. `GET /inventory-report`
   - Keep current Neon `usage_report_rows` counts.
   - Add catalog counts from `beauty_product_catalog_items`.

2. `GET /brand-dictionary`
   - Read `beauty_series_dictionary`.
   - Fallback to `public/beauty-intelligence/brands.json`.

3. `GET /series-intelligence`
   - Read `beauty_series_dictionary` joined to observed aggregates.
   - Fallback to `public/beauty-intelligence/series/*.json`.

4. `GET /shade-intelligence`
   - Read `beauty_shade_intelligence`.
   - Fallback to `public/beauty-intelligence/shades-*.json`.

5. New `GET /catalog-items`
   - Replace Product Catalog browser static JSON fetch.
   - Support pagination, search, brand, series, product type, and verification status.

## Phase 5: Admin Switch

Update these UIs in order:

1. `BeautyIntelligencePanel.tsx`
   - Keep visual structure.
   - Display DB-backed freshness and source counts.

2. `CatalogBrowserPanel.tsx`
   - Replace `/catalog-brands/{slug}.json` fetch with `GET /catalog-items`.
   - Add verification status and source count columns.

3. `ProductTruthCenterPanel.tsx`
   - Connect suggested actions to source/evidence records.
   - Keep edits disabled until evidence model is stable.

## Phase 6: Source Verification Jobs

Add a batch worker or script:

- Priority 1: L'Oréal Professionnel, Wella, Schwarzkopf, Matrix, Redken, Goldwell, Keune.
- Priority 2: Rows with barcodes.
- Priority 3: High-usage observed items.
- Priority 4: Conflicts and unknowns.

Each job writes `beauty_dictionary_sources` and updates `verification_status`.

## Rollback

If DB-backed reads fail:

- Keep JSON fallback in every route.
- Do not delete static files.
- Roll back frontend only if response shape changes break rendering.

## Completion Definition

The migration is complete only when:

- Admin product catalog reads paginated product rows from Neon.
- Beauty Dictionary reads series/shade intelligence from Neon.
- Every product has `verification_status`.
- Every non-heuristic status has at least one source row in `beauty_dictionary_sources`.
- Static JSON is documented as fallback/cache, not source of truth.
