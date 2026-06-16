/**
 * src/lib/product-truth/productTruthRepository.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Client-side repository for the canonical Product Truth data layer.
 *
 * All admin screens must consume canonical data through this repository
 * instead of implementing matching, normalization, or classification locally.
 *
 * Wraps: /.netlify/functions/product-truth-search
 */

import type {
  CanonicalProduct,
  ProductAlias,
  CatalogProductSource,
  ProductReviewItem,
  ProductSearchResult,
  ProductTruthFunnel,
  ReviewSeverity,
} from "../types/productTruth";

export const PRODUCT_TRUTH_ACCESS_CODE =
  ((import.meta as any).env?.VITE_USAGE_IMPORT_ACCESS_CODE as string) ||
  "070315";

const SEARCH_FN = "/.netlify/functions/product-truth-search";

async function ptFetch<T>(params: Record<string, string>): Promise<T> {
  const qs = new URLSearchParams(params);
  const res = await fetch(`${SEARCH_FN}?${qs}`, {
    headers: { "X-Access-Code": PRODUCT_TRUTH_ACCESS_CODE },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Product Truth API ${res.status}: ${body.slice(0, 120)}`);
  }
  return res.json() as Promise<T>;
}

// ── Search ─────────────────────────────────────────────────────────────────

export interface SearchOptions {
  q?: string;
  type?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface SearchResponse {
  results: ProductSearchResult[];
  total: number;
  page: number;
  limit: number;
}

export async function searchProducts(opts: SearchOptions = {}): Promise<SearchResponse> {
  const params: Record<string, string> = { action: "search" };
  if (opts.q)      params.q      = opts.q;
  if (opts.type)   params.type   = opts.type;
  if (opts.status) params.status = opts.status;
  if (opts.page)   params.page   = String(opts.page);
  if (opts.limit)  params.limit  = String(opts.limit);
  return ptFetch<SearchResponse>(params);
}

// ── Product detail ─────────────────────────────────────────────────────────

export interface ProductDetailResponse {
  product: CanonicalProduct;
  aliasCount: number;
  sourceCount: number;
}

export async function getProductDetail(canonicalId: string): Promise<ProductDetailResponse> {
  return ptFetch<ProductDetailResponse>({ action: "product", id: canonicalId });
}

export async function getProductAliases(canonicalId: string): Promise<{ id: string; aliases: ProductAlias[] }> {
  return ptFetch<{ id: string; aliases: ProductAlias[] }>({ action: "aliases", id: canonicalId });
}

export async function getProductSources(canonicalId: string): Promise<{ id: string; sources: CatalogProductSource[] }> {
  return ptFetch<{ id: string; sources: CatalogProductSource[] }>({ action: "sources", id: canonicalId });
}

// ── Review items ───────────────────────────────────────────────────────────

export interface ReviewItemsResponse {
  items: ProductReviewItem[];
  total: number;
  page: number;
  limit: number;
}

export async function getReviewItems(opts: {
  severity?: ReviewSeverity;
  page?: number;
  limit?: number;
} = {}): Promise<ReviewItemsResponse> {
  const params: Record<string, string> = { action: "review-items" };
  if (opts.severity) params.severity = opts.severity;
  if (opts.page)     params.page     = String(opts.page);
  if (opts.limit)    params.limit    = String(opts.limit);
  return ptFetch<ReviewItemsResponse>(params);
}

// ── Funnel ─────────────────────────────────────────────────────────────────

export async function getFunnel(): Promise<ProductTruthFunnel> {
  return ptFetch<ProductTruthFunnel>({ action: "funnel" });
}
