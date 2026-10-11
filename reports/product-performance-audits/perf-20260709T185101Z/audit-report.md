# Product / Catalog / Inventory Performance Audit

Run ID: `perf-20260709T185101Z`
Target: Neon production catalog (`NEON_DATABASE_URL`)
Method: `EXPLAIN (ANALYZE, BUFFERS)` against a temporary seeded test salon, then cleaned up. Read/query-only except one additive index (migration 029).

## Row counts at audit time

| Table | Rows |
| --- | --- |
| `catalog_products` | 32,739 (32,126 active) |
| `salon_inventory_products` | seeded 6 (test salon, removed after) |
| `salon_enabled_brands` | seeded 1 (test salon, removed after) |
| `salon_product_usage` | seeded 10 (test salon, removed after) |

## Verdict: is the architecture right? YES

The V1 model (global `catalog_*` + per-salon `salon_enabled_brands` / `salon_inventory_products` / `salon_product_usage`) is the correct, scalable shape. Every runtime salon query is driven by `salon_id` first through an index, so the working set is the salon's own inventory — not the global catalog. This beats the alternatives:

- **Copying all products per salon** → 32k × N salons of duplicated rows, impossible to keep in sync, and write amplification on every catalog change.
- **Loading static JSON per salon** → ships the entire catalog to every client, no server-side filtering, grows unbounded.
- **Salon products as unstructured JSON** → no indexes, no joins, no tenant-safe query planning.
- **Frontend-only filtering** → forces the full list over the wire; defeats pagination and indexing.

## Query plan results (EXPLAIN ANALYZE)

| Query | Plan | Exec time | Seq scan? |
| --- | --- | --- | --- |
| Default salon search | Index scans + nested loop (`idx_salon_inventory_salon_favorite`, `uidx_salon_enabled_brand_active`) | 1.55ms | No |
| Inventory list | Index scans + nested loop (`uidx_salon_inventory_salon_product`) | 0.12ms | No |
| Inventory text search | Index scan on salon inventory (`uidx_salon_inventory_salon_product`) | 0.06ms | No |
| Add product lookup | PK index scan | 0.04ms | No |
| Is-brand-enabled | Index-only scan (`uidx_salon_enabled_brand_active`) | 0.08ms | No |
| Update inventory lookup | Index scan (`idx_salon_inventory_salon`) | 0.04ms | No |
| Enabled brands list | Index-only + PK | 0.05ms | No |
| Usage history | Index scan (`idx_salon_usage_salon_recorded`) | 0.04ms | No |
| **Full catalog search (current query, before fix)** | **Seq Scan on `catalog_products`** | **620.9ms** | **YES** |
| Full catalog search (normalized-only variant) | Bitmap index scan (trigram) | 32.1ms | No |
| Full catalog search (current query, AFTER migration 029) | BitmapOr of two trigram indexes | 5.5ms | No |

All salon-scoped runtime paths are already well under the 150ms / 50ms DB-time targets and stay flat as salons and catalog grow, because they filter by `salon_id` before touching the catalog.

## The one real problem, and the fix

**Finding:** the explicit full-catalog search (`GET /catalog/search`) used
`cp.normalized_name ILIKE '%q%' OR LOWER(cp.canonical_name) ILIKE '%q%'`.
The trigram GIN index covered `normalized_name`, but `LOWER(canonical_name)` had no matching index, so PostgreSQL fell back to a **sequential scan of all 32,739 products (~621ms)** — and this degrades linearly toward 300k products.

**Fix (migration 029, applied):** added a trigram expression index
`idx_catalog_products_canonical_name_trgm ON catalog_products USING gin (lower(canonical_name) gin_trgm_ops)`.
The planner now does a `BitmapOr` across both trigram indexes. Same query, same results, **no seq scan, 620ms → 5.5ms**. Index build: 516ms.

> Note: full-catalog search is only invoked on the explicit "add product / search full catalog" flow, never on the default runtime path, so this was a latency spike on an occasional action rather than a hot path. It is now fixed regardless.

## Index audit

Present and used correctly:

- `catalog_products`: PK, `manufacturer_id`, `product_line_id`, compound `(manufacturer_id, primary_product_type, active)`, `(manufacturer_id, active)`, trigram on `normalized_name`, **and now trigram on `lower(canonical_name)` (029)**.
- `salon_enabled_brands`: unique `(salon_id, brand_id)` partial-on-enabled (`uidx_salon_enabled_brand_active`) — serves both enablement checks and joins.
- `salon_inventory_products`: unique `(salon_id, product_id)`, `salon_id`, partial `salon_id + is_visible`, partial `salon_id + is_favorite`, low-stock partial, local-barcode partial.
- `salon_product_usage`: `(salon_id, recorded_at desc)`, plus product/staff/visit variants.
- `catalog_product_barcodes`: `barcode` (unique active), `product_id`, `barcode + status` — indexes exist but the table is empty (see barcode gap).

No missing indexes block the current runtime queries. Optional future index: `salon_inventory_products (salon_id, updated_at)` only if a "recently changed" sort is added (not used today).

## Search strategy recommendation for V1

- **Barcode:** exact-match lookup path (indexed) — instant. Currently only `local_barcode_override` exists per salon; global `catalog_product_barcodes` is empty (see gap).
- **Inventory search:** already fast — driven by `salon_id`, ILIKE on the small salon subset. Keep as-is.
- **Enabled/default catalog search:** server-side, indexed, paginated. Keep as-is.
- **Full catalog search:** trigram-backed (now via 029), explicit-only, `LIMIT 25`. Keep as-is.
- **Postpone:** Postgres full-text (`tsvector`), materialized views, and Redis/caching. Not needed at current or 10x scale; indexes + query design are sufficient.

## API performance review

- Default search default `limit` 50 (max 200), cursor pagination present.
- Inventory list default 200 (max 500) with offset pagination + separate count/summary.
- Catalog search `limit` 25 (max 100), requires `q >= 2` chars.
- No endpoint returns the full catalog; no endpoint does primary filtering in JS after loading from DB; responses return only UI fields (runtime APIs do not return admin evidence/source columns).

One minor note: the inventory-list max limit of 500 with a post-join `ORDER BY brand, name` is fine at salon scale, but consider keeping the default at 200 and encouraging pagination for very large single-salon inventories.

## Caching strategy

Not needed now. Enabled-brands and brand lists are tiny and index-served in <0.1ms. Revisit caching only if profiling at 2,000+ salons shows repeated hot reads; indexes handle current and projected load.

## Barcode gap impact

`catalog_product_barcodes` = 0 rows while the static catalog reports ~1,015 barcode conflicts. Impact:

- Global barcode exact-match lookup cannot be used yet (no data), so barcode-based product matching for the legacy inventory backfill must fall back to `catalog_product_sources.raw_barcode` where available.
- This weakens the strongest (barcode-exact) matching tier for the dry-run and reduces the count of high-confidence auto-migratable rows.
- **Recommendation:** treat barcode import as a prerequisite for maximizing high-confidence matches. The dry-run can and should proceed first (read-only) to quantify exactly how many legacy rows depend on barcode matching, then decide whether a barcode import should precede any real backfill.

## Scale outlook (10 → 2,000+ salons)

Because every runtime query filters `salon_id` first through an index, per-salon cost is bounded by that salon's own inventory/usage, independent of total catalog size or salon count. Catalog growth to 300k affects only the explicit full-catalog search, which is now trigram-indexed. No sequential scans remain on any runtime path.

## Top 5 performance risks

1. Full-catalog search seq scan (fixed by 029; verify 029 is applied in every environment).
2. Empty `catalog_product_barcodes` → no fast global barcode path and weaker matching until imported.
3. Inventory-list max limit 500 + post-join sort could get heavy for a single huge-inventory salon (mitigate with pagination discipline).
4. `SALON_SESSION_SECRET` unset in production would drop to dev-fallback salon (correctness/tenant risk, not raw speed) — must be set.
5. Future usage-analytics queries must always lead with `(salon_id, recorded_at)`; ad-hoc cross-salon scans would be the first thing to get slow.

## Top 5 recommended fixes before continuing

1. **Done:** migration 029 trigram index on `lower(canonical_name)`.
2. Ensure migrations 026–029 are applied in every target environment.
3. Import barcodes into `catalog_product_barcodes` before (or immediately alongside) any real inventory backfill, to raise high-confidence match rates.
4. Set `SALON_SESSION_SECRET` in production; verify unauthenticated `salon-products` calls fail.
5. Keep full-catalog search explicit-only and paginated; do not wire it into the default runtime path.

## Materialized views / caching: needed now?

No. Indexes and query design meet all targets. Revisit only if real production profiling proves otherwise.
