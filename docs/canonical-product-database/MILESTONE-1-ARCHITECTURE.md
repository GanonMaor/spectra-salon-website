# Milestone 1: Database Foundation Architecture Note

## Audit Findings

### Database Infrastructure

- **Provider**: Neon (serverless Postgres)
- **Client**: `@neondatabase/serverless` — `neon(url)` tagged template
- **Environment variable**: `NEON_DATABASE_URL`
- **Primary key pattern**: `TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text`
- **Timestamp pattern**: `TIMESTAMPTZ DEFAULT now()`
- **Soft deletion**: `status TEXT NOT NULL DEFAULT 'active'` or `active BOOLEAN`
- **JSONB**: Used for structured state payloads (e.g. `financial_forecast.state_json`)
- **Revision pattern**: Not yet used — introducing `revision INTEGER DEFAULT 1` for canonical tables
- **Migration pattern**: Numbered SQL files `migrations/NNN_*.sql`, applied via `netlify/functions/run-migration.js`
- **Next available migration number**: `020` (latest existing: `016_add_summit_instagram.sql`, gaps up to 015)

### Existing Tables (relevant to product data)

| Table | Notes |
|---|---|
| `inventory` | Migration 15 — basic product inventory with salon scoping |
| `salons` | Multi-tenant root — `id TEXT PRIMARY KEY` |
| `crm_customers` | Customer records |
| `customer_visits` | Visit records, no product FK |
| `salon_users` | Legacy salon user records |

**No existing canonical product tables.** Safe to introduce new schema with `020_*`.

### Existing Product Truth Data

The current "Product Truth" system reads from static JSON files in `src/data/`:
- `product-truth-canonical.json` — ~621 canonical products (generated artifacts)
- `product-truth-aliases.json` — aliases
- `product-truth-sources.json` — sources
- `product-truth-review-items.json` — review items
- `product-truth-funnel.json` — funnel metrics

These are build-time artifacts from catalog JSON files in `public/catalog-brands/*.json`.
They must continue to work until the new DB-backed pages are fully operational.

### Netlify Function Patterns

```js
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.NEON_DATABASE_URL);
// Tagged template: await sql`SELECT ...`
// CORS: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' }
// Auth: X-Access-Code header compared to process.env.USAGE_IMPORT_ACCESS_CODE
```

### ID Namespace Decisions

- Canonical manufacturers: `mfr-{uuid}`
- Product lines: `pl-{uuid}`
- Product families: `fam-{uuid}`
- Canonical products: `cprod-{uuid}`
- Source records: `src-{uuid}`
- Identity mappings: `map-{uuid}`
- Product aliases: `alias-{uuid}`
- Import batches: `batch-{uuid}`
- Evidence: `ev-{uuid}`
- Review items: `rev-{uuid}`
- Audit logs: `audit-{uuid}`

Using gen_random_uuid() for the UUID part.

### Constraints Decision

- No global uniqueness on `canonical_name` across all manufacturers (too restrictive)
- Composite uniqueness where semantically safe: `(manufacturer_id, normalized_name)` for manufacturers
- Partial indexes for null/active filtering
- No constraints that would block regional SKUs, retail/professional variants, or size variants

### Migration File

`migrations/020_canonical_product_database.sql`

---

*Generated: 2026-06-17 — Milestone 1 Step 1*
