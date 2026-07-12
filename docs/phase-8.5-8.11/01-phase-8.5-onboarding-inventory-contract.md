# Phase 8.5 Contract: Onboarding + Inventory Autosave

**Status**: Planning (contract for review before implementation)
**Depends on**: `docs/crm-pilot-api-contract.md`, migrations 026-034
**Owner**: Agent A (Onboarding + Inventory), integrated by parent owner

This is the source-of-truth contract for the first implementation slice. It
covers onboarding setup mode, brand/product-line enablement, automatic runtime
inventory listing (without a per-salon row explosion), inline editing, and
debounced autosave.

---

## 1. Inventory Data Model Boundary (approved architecture decision #4)

Three separate responsibilities, never merged:

| Layer | Table | Owns |
|-------|-------|------|
| Catalog (global) | `catalog_products` / `catalog_runtime_products` view | product identity, brand, product line, name, type, package size, approved/published status |
| Salon enablement | `salon_enabled_brands`, `salon_enabled_product_lines` | which brands/lines are active for the salon |
| Salon overlay | `salon_inventory_products` | salon-specific values: units in stock, min stock, favorite, visibility, local price/barcode |

Rule: 32,124 runtime products are shown by joining the runtime catalog to the
salon overlay with a `LEFT JOIN`. A `salon_inventory_products` row is created
only when the salon sets a value that differs from default (first stock/min/
favorite/visibility edit, or explicit add-from-catalog). We never insert 32K
overlay rows per salon.

This is already implemented server-side in `netlify/functions/salon-products.js`
`listCatalogStock()` (catalog-first with overlay). Phase 8.5 makes the catalog
listing the primary inventory table mode and adds inline autosave.

---

## 2. Onboarding

### 2.1 Modes

- `empty`: create salon shell, owner user, membership, VAT/settings defaults;
  no departments/categories/services unless the salon adds them.
- `minimal`: create `empty` plus a Hair department, base categories
  (Color, Highlights, Toner, Haircut / Styling), base editable services, and an
  optional owner/main stylist. Owner is not assumed to be a stylist unless the
  salon confirms it.

Neither mode creates demo customers, appointments, history, reports, or stock.
This mirrors `scripts/create-clean-pilot-salon.js` (dry-run by default).

### 2.2 Tables / Migration Need

Phase 8.5 can be completed without touching appointment, checkout, payment,
VAT, expense, or analytics schema.

If onboarding status can be inferred cleanly from existing counts
(`services.length`, `enabledBrandsCount`, `enabledProductLinesCount`, staff
count), Phase 8.5 may require **no migration**.

If explicit onboarding state is preferred, add a small Phase 8.5 migration only:

- `ALTER TABLE salons ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ`
- optional `salon_onboarding_runs` for idempotent internal run tracking

Optional `salon_onboarding_runs`:

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT PK | `sonb-` prefix |
| `salon_id` | TEXT FK salons | tenant |
| `mode` | TEXT | `empty` \| `minimal` |
| `template_key` | TEXT | nullable starter template id |
| `status` | TEXT | `in_progress` \| `completed` \| `abandoned` |
| `summary` | JSONB | created counts, never business data |
| `created_by_user_id` | TEXT | audit |
| `created_at` / `completed_at` | TIMESTAMPTZ | |

Partial unique index: one `in_progress` run per salon.

Do not add VAT settings, checkout settings, payment tables, expenses, or
financial defaults in Phase 8.5. Those belong to later approved finance slices.

### 2.3 API — `netlify/functions/crm-onboarding.js`

| Method | Route | Request (camelCase) | Response `data` | Codes |
|--------|-------|---------------------|-----------------|-------|
| GET | `/` | none | `{ status, mode, settings, counts: { staff, services, categories, departments, enabledBrands, enabledProductLines, inventoryOverlays } }` | 200/401 |
| POST | `/start` | `{ mode, templateKey?, salon?, owner? }` + `Idempotency-Key` | `{ run, salon, settings }` | 201/400/401/403/409 |
| POST | `/apply-template` | `{ mode, includeStarterServices, includeOwnerStylist }` | `{ created: { departments, categories, services, staff } }` | 200/400/401/403 |

Rules:
- All routes resolve `salonId` from session; never accept it in the body.
- `/start` is idempotent per salon via `Idempotency-Key` and the one-active-run
  index; a second call returns the existing run (200) instead of duplicating.
- `apply-template` must refuse to create any business/demo data; only
  structural entities.
- Permissions: `owner` or `manager`.

---

## 3. Brand / Product-Line Enablement (reuse existing)

No new endpoints. Reuse `salon-products.js`:

- `GET /brands/catalog?q&limit`
- `GET /brands/enabled`
- `PATCH /brands/enabled/:brandId` `{ enabled }`
- `GET /brands/:brandId/product-lines`
- `GET /product-lines/enabled`
- `PATCH /product-lines/enabled/:id` `{ enabled }`

Client stays `src/screens/SalonCRM/data/salonProductsApi.ts`
(`listCatalogBrands`, `setBrandEnabled`, `listBrandProductLines`,
`listEnabledProductLines`, `setProductLineEnabled`). UI stays
`ProductCatalogSetupPage.tsx`.

Behavior guarantee: after enabling brands/lines, `GET /catalog-stock` returns
all approved+published runtime products in scope immediately, overlaying stock
where an overlay row exists.

---

## 4. Inventory Listing + Autosave

### 4.1 Listing (reuse)

Primary pilot mode uses `GET /catalog-stock` (already implemented):

- Returns `SalonCatalogStockRow[]` with `salon_inventory_product_id`
  (nullable), `units_in_stock`, `min_stock`, `is_visible`, `is_favorite`,
  `in_inventory`, `stock_status`.
- Paginated by `limit`/`offset` (`nextOffset`).

### 4.2 Autosave Upsert Endpoint (new behavior on existing function)

Problem: `PATCH /inventory/:id` requires an existing overlay row. Catalog-stock
rows often have `salon_inventory_product_id = null`. We need an upsert keyed by
`productId`.

Add to `salon-products.js`:

`PATCH /inventory/by-product/:productId`

Request (only changed fields):

```json
{
  "unitsInStock": 12,
  "minStock": 3,
  "isFavorite": true,
  "isVisible": true,
  "clientVersion": 7
}
```

Behavior:
- Validate the product exists in the runtime catalog and is within the salon's
  enabled brand/line scope (reuse `resolveRuntimeCatalog`, `isBrandEnabled`,
  `isProductAllowedByEnabledLines`).
- Upsert `salon_inventory_products` on `(salon_id, product_id)`; create the row
  on first edit only.
- Return the canonical overlay row plus `updatedAt` and echoed `clientVersion`.

Response `data`:

```json
{
  "item": { "id": "sinv-...", "productId": "...", "unitsInStock": 12, "minStock": 3, "isFavorite": true, "isVisible": true, "updatedAt": "2026-07-12T01:00:00Z" },
  "clientVersion": 7
}
```

Pilot-editable fields only: `unitsInStock`, `minStock`, `isFavorite`,
`isVisible`. `costAmount`, `sellPriceAmount`, `localBarcodeOverride`,
`localDisplayName` remain supported by the existing `/inventory/:id` route but
are out of the Phase 8.5 inline slice.

Validation:
- `unitsInStock`, `minStock`: finite numbers >= 0.
- `isFavorite`, `isVisible`: booleans only.
- Reject any `salonId`/`salon_id` in the body (tenant is session-derived).

Note: `salon-products.js` currently uses a legacy `{ error }` / raw object
envelope. For Phase 8.5, keep backward compatibility for existing routes, but
the new `by-product` route should return the standard `{ ok, data, meta }`
envelope so the autosave client can rely on `data.item` + `meta`. The parent
owner tracks full envelope migration as a separate cleanup, not a blocker.

### 4.3 Client (`salonProductsApi.ts`)

Add:

```ts
export function upsertSalonInventoryByProduct(
  productId: string,
  input: { unitsInStock?: number; minStock?: number; isFavorite?: boolean; isVisible?: boolean; clientVersion: number },
  signal?: AbortSignal,
): Promise<{ item: SalonInventoryRow & { updatedAt: string }; clientVersion: number }>;
```

---

## 5. Debounced Autosave Hook (shared, reusable)

New hook `useDebouncedAutosaveMap` (reused later by services/categories/settings).

Contract:

- State per row key: `idle | dirty | saving | saved | error`.
- On edit: apply optimistic value immediately, mark `dirty`, increment a
  per-row local `version`.
- Debounce 2000-3000ms after the last edit per row key.
- On flush: send only changed fields + `clientVersion = version`.
- On response: apply canonical server value only if `response.clientVersion`
  equals the row's current latest `version`; otherwise ignore (stale).
- Request cancellation: pass `AbortController.signal`; still keep version
  protection because the server may have already committed.
- Error: mark `error`, keep the unsaved local value, expose retry + revert.
- Navigation guard: block route change / warn if any row is `dirty` or `saving`.
- Multi-row: independent timers keyed by row id; edits to row B never delay or
  overwrite row A.

Signature sketch:

```ts
useDebouncedAutosaveMap<TKey extends string, TDraft, TServer>(options: {
  debounceMs?: number;                 // default 2500
  save: (key: TKey, draft: TDraft, ctx: { version: number; signal: AbortSignal }) => Promise<{ server: TServer; version: number }>;
  applyServer: (key: TKey, server: TServer) => void;
  onError?: (key: TKey, error: unknown) => void;
}): {
  status: (key: TKey) => "idle" | "dirty" | "saving" | "saved" | "error";
  edit: (key: TKey, patch: Partial<TDraft>) => void;
  retry: (key: TKey) => void;
  hasPending: boolean;                 // for navigation guard
};
```

---

## 6. Tenant Isolation and Safety (must-pass)

- Every read/write filters by session `salonId`.
- Cross-tenant `productId` or overlay `id` returns 404, not leaked data.
- No overlay rows created for untouched products.
- No demo/business data created by onboarding.
- Enabled-scope enforced on autosave upsert (cannot track a product outside
  enabled brands/lines).

---

## 7. Out of Scope for Phase 8.5

- Checkout, POS, payments, VAT UI, expenses, profitability.
- Retail product sales.
- Real customer onboarding.
- Cost/price/barcode inline editing (kept in the fuller inventory form).
