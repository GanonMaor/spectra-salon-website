/**
 * Inventory adapters — pure view mappers.
 *
 * The legacy Inventory UI was built around a snake_case shape that
 * mirrored an old REST endpoint. These adapters do nothing more than
 * rename canonical fields and format numbers. Joins (inventory ⇄
 * products ⇄ brands ⇄ lines) and stock-status derivation live in
 * `crmSelectors.ts` so the analytics, AI engine, and UI all see the
 * same canonical truth.
 */

import { selectInventoryRows, type InventoryJoin } from "./data/crmSelectors";
import type {
  Brand,
  CRMNormalizedState,
  InventoryItem,
  Product,
  ProductLine,
  UpdateInventoryInput,
} from "./data/crmTypes";

export interface UIBrand {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
}

export interface UIProductLine {
  id: string;
  brand_id: string;
  name: string;
  slug: string;
  sort_order: number;
}

export interface UIInventoryProduct {
  id: string;
  salon_id: string;
  brand_id: string;
  product_line_id: string;
  shade_code: string;
  display_name: string | null;
  level: number | null;
  size_grams: number;
  barcode: string | null;
  is_visible: boolean;
  cost_usd: string;
  selling_price_usd: string;
  margin_pct: string;
  min_stock: number;
  units_in_stock: number;
  status: "active" | "inactive";
  brand_name?: string;
  brand_slug?: string;
  line_name?: string;
  line_slug?: string;
}

export function toUIBrand(b: Brand): UIBrand {
  return { id: b.id, name: b.name, slug: b.slug, sort_order: b.sortOrder };
}

export function toUIProductLine(l: ProductLine): UIProductLine {
  return {
    id: l.id,
    brand_id: l.brandId,
    name: l.name,
    slug: l.slug,
    sort_order: l.sortOrder,
  };
}

/**
 * Pure projection from a canonical inventory join. The inventory's
 * own `isVisible` flag determines `status`; we no longer hardcode it.
 */
export function joinToUIInventoryProduct(join: InventoryJoin): UIInventoryProduct {
  const { inventory: inv, product, brand, line } = join;
  return {
    id: inv.id,
    salon_id: inv.salonId,
    brand_id: product.brandId,
    product_line_id: product.productLineId,
    shade_code: product.shadeCode,
    display_name: product.displayName ?? null,
    level: product.level ?? null,
    size_grams: product.sizeGrams,
    barcode: inv.barcode ?? null,
    is_visible: inv.isVisible,
    cost_usd: inv.costUsd.toFixed(2),
    selling_price_usd: inv.sellingPriceUsd.toFixed(2),
    margin_pct: inv.marginPct.toFixed(1),
    min_stock: inv.minStock,
    units_in_stock: inv.unitsInStock,
    status: inv.isVisible ? "active" : "inactive",
    brand_name: brand?.name,
    brand_slug: brand?.slug,
    line_name: line?.name,
    line_slug: line?.slug,
  };
}

/**
 * Backward-compatible wrapper for callers that still pass canonical
 * entities individually. Prefer `joinToUIInventoryProduct` going
 * forward; it pairs with `selectInventoryRows` and keeps the join
 * inside selectors.
 */
export function toUIInventoryProduct(
  inv: InventoryItem,
  product: Product,
  brand?: Brand,
  line?: ProductLine,
): UIInventoryProduct {
  return joinToUIInventoryProduct({ inventory: inv, product, brand, line });
}

/**
 * Convenience for the Inventory page. Reads pre-joined rows from
 * the selector so adapter callers do not perform the join.
 */
export function buildUIInventoryList(state: CRMNormalizedState): UIInventoryProduct[] {
  return selectInventoryRows(state).map(joinToUIInventoryProduct);
}

export interface InventoryDraftEdit {
  units_in_stock?: number;
  min_stock?: number;
  cost_usd?: number;
  selling_price_usd?: number;
  margin_pct?: number;
}

export function draftEditToActionInput(
  inventoryItemId: string,
  draft: InventoryDraftEdit,
): UpdateInventoryInput {
  return {
    inventoryItemId,
    unitsInStock: draft.units_in_stock,
    minStock: draft.min_stock,
    costUsd: draft.cost_usd,
    sellingPriceUsd: draft.selling_price_usd,
    marginPct: draft.margin_pct,
  };
}
