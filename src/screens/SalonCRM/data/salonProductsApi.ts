/**
 * Typed client for the salon-scoped product & inventory API
 * (netlify/functions/salon-products.js).
 *
 * Every call is authenticated with the salon session bearer token and the
 * server resolves the tenant — no salon id is ever sent from the client.
 * Used by the inventory screen, weighing/usage flows, and onboarding brand
 * selection.
 */

import { salonAuthHeaders } from "./salonSession";

const FUNCTION_BASE = "/.netlify/functions/salon-products";

export interface SalonInventoryRow {
  id: string;
  product_id: string;
  units_in_stock: number | string;
  min_stock: number | string;
  cost_amount: number | string | null;
  cost_currency: string | null;
  sell_price_amount: number | string | null;
  sell_price_currency: string | null;
  is_visible: boolean;
  is_favorite: boolean;
  local_barcode_override: string | null;
  local_display_name: string | null;
  canonical_name: string;
  primary_product_type: string | null;
  package_size_value: number | string | null;
  package_size_unit: string | null;
  brand_id: string | null;
  product_line_id: string | null;
  brand_name: string | null;
  product_line_name: string | null;
}

export interface SalonEnabledBrand {
  id: string;
  name: string;
  display_name?: string | null;
  enabled_at?: string;
  selected_product_line_count?: number;
}

export interface SalonCatalogBrand {
  id: string;
  name: string;
  display_name?: string | null;
  status?: string | null;
  enabled: boolean;
  product_line_count: number;
  product_count: number;
  inventory_count: number;
  selected_product_line_count: number;
}

export interface SalonProductLine {
  id: string;
  brand_id: string;
  name: string;
  normalized_name?: string | null;
  status?: string | null;
  enabled: boolean;
  product_count: number;
  inventory_count: number;
}

export interface SalonEnabledProductLine {
  id: string;
  brand_id: string;
  name: string;
  brand_name?: string | null;
  enabled_at?: string;
}

export interface SalonCatalogSearchRow {
  id: string;
  canonical_name: string;
  primary_product_type: string | null;
  package_size_value: number | string | null;
  package_size_unit: string | null;
  brand_id: string | null;
  brand_name: string | null;
  product_line_id: string | null;
  product_line_name: string | null;
  brand_enabled: boolean;
  in_inventory: boolean;
}

export interface SalonCatalogStockRow {
  product_id: string;
  brand_id: string | null;
  brand_name: string | null;
  product_line_id: string | null;
  product_line_name: string | null;
  canonical_name: string;
  primary_product_type: string | null;
  package_size_value: number | string | null;
  package_size_unit: string | null;
  image_url: string | null;
  salon_inventory_product_id: string | null;
  units_in_stock: number | string;
  min_stock: number | string;
  is_visible: boolean;
  is_favorite: boolean;
  in_inventory: boolean;
  stock_status: "not_tracked" | "out" | "low" | "ok";
}

export interface UpdateSalonInventoryInput {
  unitsInStock?: number;
  minStock?: number;
  costAmount?: number;
  costCurrency?: string;
  sellPriceAmount?: number;
  sellPriceCurrency?: string;
  isVisible?: boolean;
  isFavorite?: boolean;
  localBarcodeOverride?: string | null;
  localDisplayName?: string | null;
}

export interface AddSalonInventoryInput extends UpdateSalonInventoryInput {
  productId: string;
  /** When true, auto-enable the product's brand if not already enabled. */
  enableBrand?: boolean;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${FUNCTION_BASE}${path}`, {
    ...init,
    headers: salonAuthHeaders(
      init?.body ? { "Content-Type": "application/json" } : undefined,
    ),
  });
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    const text = await res.text().catch(() => "");
    const looksLikeHtml = text.trim().startsWith("<");
    const err = new Error(
      looksLikeHtml
        ? "Netlify Functions are not available on this local URL. Open the app through Netlify Dev at http://localhost:8888, or run npm run dev."
        : `salon-products returned non-JSON response: ${res.status} ${res.statusText}`,
    ) as Error & { status?: number; code?: string };
    err.status = res.status;
    err.code = "NON_JSON_RESPONSE";
    throw err;
  }
  if (!res.ok) {
    let detail = "";
    try {
      const payload = (await res.json()) as { error?: unknown };
      detail = typeof payload?.error === "string" ? payload.error : JSON.stringify(payload?.error ?? "");
    } catch {
      detail = await res.text().catch(() => "");
    }
    const err = new Error(`salon-products ${res.status}: ${detail || res.statusText}`) as Error & {
      status?: number;
    };
    err.status = res.status;
    throw err;
  }
  return (await res.json()) as T;
}

export function searchSalonInventory(q: string, limit = 50, cursor?: string) {
  const usp = new URLSearchParams();
  if (q) usp.set("q", q);
  usp.set("limit", String(limit));
  if (cursor) usp.set("cursor", cursor);
  return request<{ items: SalonInventoryRow[]; nextCursor: string | null }>(`?${usp.toString()}`);
}

export function listSalonInventory(params: { brandId?: string; lowStock?: boolean; q?: string } = {}) {
  const usp = new URLSearchParams();
  if (params.brandId) usp.set("brandId", params.brandId);
  if (params.lowStock) usp.set("lowStock", "true");
  if (params.q) usp.set("q", params.q);
  const suffix = usp.toString() ? `?${usp.toString()}` : "";
  return request<{ items: SalonInventoryRow[]; total: number; summary: Record<string, unknown> }>(
    `/inventory${suffix}`,
  );
}

export function addSalonInventory(input: AddSalonInventoryInput) {
  return request<{ item: SalonInventoryRow }>("/inventory", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateSalonInventory(id: string, input: UpdateSalonInventoryInput) {
  return request<{ item: SalonInventoryRow }>(`/inventory/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function listEnabledBrands() {
  return request<{ brands: SalonEnabledBrand[] }>("/brands/enabled");
}

export function enableBrand(brandId: string) {
  return request<{ enabled: unknown }>("/brands/enabled", {
    method: "POST",
    body: JSON.stringify({ brandId }),
  });
}

export function listCatalogBrands(q = "", limit = 100) {
  const usp = new URLSearchParams();
  if (q) usp.set("q", q);
  usp.set("limit", String(limit));
  return request<{ brands: SalonCatalogBrand[] }>(`/brands/catalog?${usp.toString()}`);
}

export function setBrandEnabled(brandId: string, enabled: boolean) {
  return request<{ enabled?: unknown; disabled?: unknown; inventoryCount?: number; warning?: string | null }>(
    `/brands/enabled/${encodeURIComponent(brandId)}`,
    {
      method: "PATCH",
      body: JSON.stringify({ enabled }),
    },
  );
}

export function listBrandProductLines(brandId: string) {
  return request<{ productLines: SalonProductLine[] }>(
    `/brands/${encodeURIComponent(brandId)}/product-lines`,
  );
}

export function listEnabledProductLines() {
  return request<{ productLines: SalonEnabledProductLine[] }>("/product-lines/enabled");
}

export function setProductLineEnabled(productLineId: string, enabled: boolean) {
  return request<{ enabled?: unknown; disabled?: unknown; inventoryCount?: number; warning?: string | null }>(
    `/product-lines/enabled/${encodeURIComponent(productLineId)}`,
    {
      method: "PATCH",
      body: JSON.stringify({ enabled }),
    },
  );
}

export function searchGlobalCatalog(q: string, brandId?: string, limit = 25) {
  const usp = new URLSearchParams();
  usp.set("q", q);
  if (brandId) usp.set("brandId", brandId);
  usp.set("limit", String(limit));
  return request<{ items: SalonCatalogSearchRow[] }>(`/catalog/search?${usp.toString()}`);
}

/**
 * Catalog-first stock list: returns catalog products in the salon's enabled
 * scope with a salon inventory overlay. salon_id is never sent — the server
 * derives it from the session.
 */
export function listCatalogStock(
  params: { brandId?: string; productLineId?: string; q?: string; limit?: number; offset?: number } = {},
) {
  const usp = new URLSearchParams();
  if (params.brandId) usp.set("brandId", params.brandId);
  if (params.productLineId) usp.set("productLineId", params.productLineId);
  if (params.q) usp.set("q", params.q);
  if (params.limit !== undefined) usp.set("limit", String(params.limit));
  if (params.offset !== undefined) usp.set("offset", String(params.offset));
  const suffix = usp.toString() ? `?${usp.toString()}` : "";
  return request<{ items: SalonCatalogStockRow[]; nextOffset: number | null }>(`/catalog-stock${suffix}`);
}
