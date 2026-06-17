/**
 * src/lib/product-database/canonicalProductDbClient.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Client-side service for the Canonical Product Database API.
 *
 * Wraps netlify/functions/canonical-product-db.js (read operations) and
 * netlify/functions/canonical-product-import.js (import operations).
 *
 * All API calls go through secure Netlify functions — no direct DB access
 * from the browser. Access code is read from localStorage or a constant
 * matching the same pattern as other admin panels.
 */

import type {
  CanonicalProductListRow,
  CanonicalProductSku,
  CatalogSourceRecord,
  ProductImportBatch,
  DbProductReviewItem,
  ProductIdentityMapping,
  PaginatedResult,
  ProductDbFilters,
  DbProductAlias,
  ImportBatchSummary,
  EvidenceStatus,
  DbValidationStatus,
} from "../types/canonicalDb";

// ── Snake_case DB row types (direct API response shapes) ─────────────────
// The Neon DB returns snake_case column names. These types match the actual
// API response and are used in UI components that consume the API directly.

export interface DbProductListRow {
  id: string;
  canonical_name: string;
  manufacturer_name: string;
  product_line_name: string | null;
  primary_product_type: string;
  package_size_value: number | null;
  package_size_unit: string | null;
  validation_status: string;
  evidence_status: string;
  active: boolean;
  source_count: number;
  alias_count: number;
  review_item_count: number;
  created_at: string;
  updated_at: string;
}

export interface DbBatchRow {
  id: string;
  source_type: string;
  source_file: string | null;
  status: string;
  total_rows: number;
  inserted_rows: number;
  review_rows: number;
  invalid_rows: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface DbMappingRow {
  id: string;
  mapping_type: string;
  match_method: string;
  confidence: string;
  validation_status: string;
  canonical_product_id: string | null;
  canonical_product_name: string | null;
  assigned_by: string | null;
  assigned_at: string | null;
  active: boolean;
  notes: string | null;
}

const BASE_READ   = "/.netlify/functions/canonical-product-db";
const BASE_IMPORT = "/.netlify/functions/canonical-product-import";
const ACCESS_CODE = "070315";

function authHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "X-Access-Code": ACCESS_CODE,
  };
}

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

function buildQuery(params: Record<string, string | number | boolean | undefined | null>): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") {
      parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
    }
  }
  return parts.length ? `?${parts.join("&")}` : "";
}

// ── Read API ───────────────────────────────────────────────────────────────

export interface DbCounts {
  manufacturers: number;
  product_lines: number;
  product_families: number;
  canonical_products: number;
  canonical_products_total: number;
  source_records: number;
  sources_assigned: number;
  active_mappings: number;
  active_aliases: number;
  completed_batches: number;
  open_review_items: number;
  audit_log_entries: number;
}

export async function fetchDbCounts(): Promise<DbCounts> {
  return getJSON<DbCounts>(`${BASE_READ}?action=counts`);
}

export async function fetchCanonicalProductList(
  filters: ProductDbFilters,
): Promise<{ items: DbProductListRow[]; total: number; page: number; limit: number; hasMore: boolean }> {
  const q = buildQuery({
    action: "list",
    q: filters.q,
    manufacturer_id:   filters.manufacturerId,
    product_line_id:   filters.productLineId,
    product_type:      filters.productType,
    validation_status: filters.validationStatus,
    evidence_status:   filters.evidenceStatus,
    active: filters.active !== undefined ? String(filters.active) : undefined,
    page:  filters.page  ?? 1,
    limit: filters.limit ?? 50,
  });
  return getJSON<{ items: DbProductListRow[]; total: number; page: number; limit: number; hasMore: boolean }>(`${BASE_READ}${q}`);
}

export interface ProductDetailResponse {
  product: {
    id: string;
    canonical_name: string;
    normalized_name: string;
    primary_product_type: string;
    product_category: string | null;
    product_subcategory: string | null;
    package_size_value: number | null;
    package_size_unit: string | null;
    package_count: number | null;
    original_package_text: string | null;
    packaging_type: string | null;
    intended_use_type: string | null;
    professional_use: boolean;
    retail_use: boolean;
    technical_use: boolean;
    active: boolean;
    evidence_status: EvidenceStatus;
    validation_status: DbValidationStatus;
    source_count: number;
    alias_count: number;
    review_item_count: number;
    revision: number;
    created_at: string;
    updated_at: string;
    // Joined fields
    manufacturer_name: string;
    manufacturer_display_name: string | null;
    product_line_name: string | null;
    product_family_name: string | null;
  };
  aliases: DbAliasRow[];
}

export interface DbAliasRow {
  id: string;
  alias: string;
  normalized_alias: string;
  alias_type: string;
  confidence: string;
  active: boolean;
  created_at: string;
}

export interface DbSourceRow {
  id: string;
  source_system: string;
  source_product_id: string | null;
  source_file: string | null;
  source_sheet: string | null;
  raw_product_name: string;
  raw_brand: string | null;
  raw_product_line: string | null;
  raw_shade_code: string | null;
  raw_size: string | null;
  raw_unit: string | null;
  raw_barcode: string | null;
  raw_catalog_number: string | null;
  raw_product_type: string | null;
  raw_active_status: string | null;
  import_batch_id: string | null;
  created_at: string;
}

export async function fetchCanonicalProduct(id: string): Promise<ProductDetailResponse> {
  return getJSON<ProductDetailResponse>(`${BASE_READ}?action=product&id=${encodeURIComponent(id)}`);
}

export interface SourcesResponse {
  id: string;
  sources: DbSourceRow[];
  total: number;
  page: number;
  limit: number;
}

export async function fetchProductSources(
  id: string,
  page = 1,
  limit = 20,
): Promise<SourcesResponse> {
  return getJSON<SourcesResponse>(
    `${BASE_READ}?action=sources&id=${encodeURIComponent(id)}&page=${page}&limit=${limit}`,
  );
}

export interface SourcesSummaryMappingRow {
  id: string;
  mapping_type: string;
  match_method: string;
  confidence: string;
  validation_status: string;
  assigned_by: string | null;
  assigned_at: string | null;
  active: boolean;
}

export interface SourcesSummaryResponse {
  id: string;
  counts: {
    total_sources: number;
    source_systems: number;
    package_variants: number;
    active_sources: number;
    inactive_sources: number;
    detected_sizes: string[] | null;
    total_aliases: number;
    usage_aliases: number;
    total_mappings: number;
  };
  sources: DbSourceRow[];
  mappings: SourcesSummaryMappingRow[];
}

export async function fetchSourcesSummary(id: string): Promise<SourcesSummaryResponse> {
  return getJSON<SourcesSummaryResponse>(
    `${BASE_READ}?action=sources-summary&id=${encodeURIComponent(id)}`,
  );
}

export interface BatchListResponse {
  batches: DbBatchRow[];
}

export async function fetchImportBatches(limit = 20): Promise<BatchListResponse> {
  return getJSON<BatchListResponse>(`${BASE_READ}?action=batches&limit=${limit}`);
}

export interface BatchDetailResponse {
  batch: ProductImportBatch;
  sourceRecordCount: number;
}

export async function fetchImportBatch(id: string): Promise<BatchDetailResponse> {
  return getJSON<BatchDetailResponse>(`${BASE_READ}?action=batch&id=${encodeURIComponent(id)}`);
}

export interface ReviewCountsResponse {
  counts: Array<{ review_type: string; status: string; count: number }>;
  openTotal: number;
}

export async function fetchReviewCounts(): Promise<ReviewCountsResponse> {
  return getJSON<ReviewCountsResponse>(`${BASE_READ}?action=review-counts`);
}

export interface DbReviewItem {
  id: string;
  review_type: string;
  status: string;
  priority: number;
  confidence: string;
  reason_code: string;
  evidence: Record<string, unknown>;
  resolution: Record<string, unknown> | null;
  created_by_action_id: string | null;
  created_at: string;
  // source record
  source_record_id: string | null;
  source_raw_name: string | null;
  source_normalized_name: string | null;
  source_brand: string | null;
  source_type: string | null;
  source_system: string | null;
  // primary canonical
  canonical_product_id: string | null;
  canonical_name: string | null;
  canonical_type: string | null;
  canonical_revision: number | null;
  // candidate (for duplicate/alias queues)
  candidate_product_id: string | null;
  candidate_name: string | null;
  candidate_type: string | null;
  candidate_revision: number | null;
}

export interface ReviewItemsResponse {
  items: DbReviewItem[];
  total: number;
  offset: number;
  limit: number;
}

export async function fetchReviewItems(
  reviewType?: string,
  status = "open",
  limit = 20,
  offset = 0,
): Promise<ReviewItemsResponse> {
  const params = new URLSearchParams({ action: "review-items", status, limit: String(limit), offset: String(offset) });
  if (reviewType) params.set("review_type", reviewType);
  return getJSON<ReviewItemsResponse>(`${BASE_READ}?${params.toString()}`);
}

export interface DbReviewItemDetail extends DbReviewItem {
  // Extended fields from the detail endpoint
  normalized_raw_name?: string | null;
  raw_size?: string | null;
  raw_unit?: string | null;
  raw_shade_code?: string | null;
  raw_shade_name?: string | null;
  package_size_value?: number | null;
  package_size_unit?: string | null;
  barcode?: string | null;
  catalog_number?: string | null;
  candidate_pkg_size?: number | null;
  candidate_pkg_unit?: string | null;
}

export interface ReviewItemDetailResponse {
  item: DbReviewItemDetail;
}

export async function fetchReviewItemDetail(id: string): Promise<ReviewItemDetailResponse> {
  return getJSON<ReviewItemDetailResponse>(`${BASE_READ}?action=review-item&id=${encodeURIComponent(id)}`);
}

export interface CandidateProductRow {
  id: string;
  canonical_name: string;
  primary_product_type: string;
  package_size_value: number | null;
  package_size_unit: string | null;
  barcode: string | null;
  catalog_number: string | null;
  validation_status: string;
  revision: number;
  manufacturer_name: string | null;
}

export interface CandidateProductsResponse {
  products: CandidateProductRow[];
  query: string;
}

export async function fetchCandidateProducts(
  query: string,
  limit = 15,
): Promise<CandidateProductsResponse> {
  const params = new URLSearchParams({ action: "candidate-products", q: query, limit: String(limit) });
  return getJSON<CandidateProductsResponse>(`${BASE_READ}?${params.toString()}`);
}

export interface ReviewComparisonResponse {
  source: Record<string, unknown> | null;
  candidate: Record<string, unknown> | null;
  existingDecisions: Record<string, unknown>[];
}

export async function fetchReviewComparison(
  sourceRecordId: string,
  candidateCanonicalId: string,
): Promise<ReviewComparisonResponse> {
  const params = new URLSearchParams({
    action: "review-comparison",
    source_record_id: sourceRecordId,
    candidate_canonical_id: candidateCanonicalId,
  });
  return getJSON<ReviewComparisonResponse>(`${BASE_READ}?${params.toString()}`);
}

export interface MappingsResponse {
  name: string;
  normalizedName: string;
  mappings: DbMappingRow[];
}

export async function fetchMappingsByName(name: string): Promise<MappingsResponse> {
  return getJSON<MappingsResponse>(
    `${BASE_READ}?action=mappings&name=${encodeURIComponent(name)}`,
  );
}

// ── Import API ─────────────────────────────────────────────────────────────

export interface ProfileResponse {
  action: "profile";
  hash: string;
  profile: {
    sourceFile: string;
    detectedColumns: string[];
    totalRows: number;
    uniqueRawNames: number;
    uniqueBrands: number;
    sourceIdsDetected: number;
    barcodesDetected: number;
    catalogNosDetected: number;
    warnings: string[];
    sampleRows: Record<string, unknown>[];
  };
}

export async function profileImportRows(
  rows: Record<string, unknown>[],
  sourceFile: string,
): Promise<ProfileResponse> {
  return postJSON<ProfileResponse>(BASE_IMPORT, { action: "profile", rows, sourceFile });
}

export interface PreviewResponse {
  action: "preview";
  hash: string;
  sourceFile: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  alreadyExistingSourceIds: number;
  wouldInsert: number;
  profile: ProfileResponse["profile"];
  warnings: string[];
  sampleSourceRecords: Record<string, unknown>[];
  approvalRequired: true;
  instruction: string;
}

export async function previewImport(
  rows: Record<string, unknown>[],
  sourceFile: string,
): Promise<PreviewResponse> {
  return postJSON<PreviewResponse>(BASE_IMPORT, { action: "preview", rows, sourceFile });
}

export interface ImportResponse {
  success: boolean;
  batchId: string;
  summary: ImportBatchSummary;
}

export async function executeImport(
  rows: Record<string, unknown>[],
  sourceFile: string,
): Promise<ImportResponse> {
  return postJSON<ImportResponse>(BASE_IMPORT, { action: "import", rows, sourceFile });
}

export async function rollbackImport(batchId: string): Promise<{ success: boolean; note: string }> {
  return postJSON(BASE_IMPORT, { action: "rollback", batchId });
}

export async function fetchImportBatchStatus(batchId: string): Promise<ProductImportBatch> {
  return postJSON(BASE_IMPORT, { action: "status", batchId });
}

// ── Resolution Actions ────────────────────────────────────────────────────────

import type {
  ResolutionPreviewParams,
  ResolutionPreviewResult,
  ResolutionWriteParams,
  ResolutionWriteResult,
} from "../types/resolutionActions";

const BASE_RESOLUTION_ACTIONS =
  "/.netlify/functions/product-resolution-actions";

/**
 * Run a read-only preview for any resolution action.
 * Returns the impact summary before any writes are made.
 */
export async function previewResolutionAction(
  params: ResolutionPreviewParams,
  token?: string,
): Promise<ResolutionPreviewResult> {
  return postWithAuth<ResolutionPreviewResult>(BASE_RESOLUTION_ACTIONS, params, token);
}

/**
 * Execute a transactional write action.
 * Requires a valid JWT auth token. X-Access-Code is not accepted for
 * resolution actions.
 */
export async function executeResolutionAction(
  params: ResolutionWriteParams,
  token?: string,
): Promise<ResolutionWriteResult> {
  return postWithAuth<ResolutionWriteResult>(BASE_RESOLUTION_ACTIONS, params, token);
}

async function postWithAuth<T>(url: string, body: unknown, token?: string): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  // X-Access-Code is deliberately NOT forwarded to resolution-actions.
  // Resolution actions require a verified JWT or explicit dev identity header.

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data?.error || `Request failed: ${res.status}`);
    (err as Error & { statusCode: number; conflict?: boolean; preview_stale?: boolean }).statusCode = res.status;
    if (res.status === 409) {
      (err as Error & { conflict?: boolean; preview_stale?: boolean }).conflict = true;
      if (data?.code === "preview_stale") {
        (err as Error & { preview_stale?: boolean }).preview_stale = true;
      }
    }
    throw err;
  }
  return data as T;
}
