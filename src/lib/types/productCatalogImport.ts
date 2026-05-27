// ── Product Catalog Import API – Types ──────────────────────────────
// Shared between the Admin Dashboard ProductCatalogImportPanel and the
// /product-catalog-import Netlify function.

export type CatalogConfidence = "high" | "medium" | "low";

export type CatalogRowStatus =
  | "new"
  | "update"
  | "duplicate-risk"
  | "missing-critical-data"
  | "needs-review";

export type CatalogWarningSeverity =
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "info";

/** Where a candidate row was extracted from. */
export type CatalogSourceKind =
  | "excel"
  | "pdf"
  | "image"
  | "text"
  | "url"
  | "vision"
  | "web";

/**
 * What the customer actually wanted us to use the product FOR. Pulled
 * from request text like "quick add for all toner services" or
 * "(direct dye)". Used to drive the `quick_add_candidates` sheet.
 */
export type CatalogServiceContext =
  | "color"
  | "toner"
  | "pre-toner"
  | "developer"
  | "direct-dye"
  | "bleach"
  | "treatment"
  | "unknown";

export interface CatalogWarning {
  code: string;
  severity: CatalogWarningSeverity;
  message: string;
  source?: string;
  rowKey?: string;
  shade?: string;
}

/**
 * One unit of evidence we used to claim a row exists / has a value.
 * Kept separate from CatalogEnrichmentSource so that the request
 * parser, URL extractor, and image-vision module can each annotate
 * rows with their own provenance.
 */
export interface CatalogExtractionEvidence {
  kind: CatalogSourceKind;
  /** Free-form description, e.g. the bullet line that produced the row. */
  detail?: string;
  /** Origin filename / URL / "request_text". */
  source?: string;
  /** Verbatim snippet (cap to ~200 chars when storing). */
  snippet?: string;
  confidence?: CatalogConfidence;
}

/** Canonical import-Excel row (matches products_*.xlsx column order). */
export interface CatalogProductRow {
  productId: string | null;
  brand: string;
  series: string;
  familyShade: string | null;
  shade: string;
  image: string | null;
  catalogNo: string | null;
  hairColor: string | null;
  type: string | null;
  packingWeight: number | null;
  materialWeight: number | null;
  /** JSON string e.g. `["8429525440726"]` */
  barcodes: string;
  ILS: number | null;
}

/** A row that came out of the parser, before / after enrichment. */
export interface CatalogCandidateRow extends CatalogProductRow {
  rowKey: string;
  /** Source filename(s) the row was extracted from. */
  sources: string[];
  /** Where the row originated. */
  sourceKind?: CatalogSourceKind;
  /** Whether this row matches an existing DB product (by id or by barcode). */
  matchedProductId: string | null;
  matchType: "productId" | "barcode" | "brand-series-shade" | "alias" | null;
  status: CatalogRowStatus;
  confidence: CatalogConfidence;
  /** Issues that triggered status change (missing data, duplicates, etc.). */
  issues: CatalogWarning[];
  /** Fields that were filled by enrichment (in addition to deterministic). */
  enrichedFields?: string[];
  /** Web/AI sources collected by enrichment for traceability. */
  enrichmentSources?: CatalogEnrichmentSource[];
  /** Provenance trail for this row (parser bullet, URL, OCR snippet, …). */
  extractionEvidence?: CatalogExtractionEvidence[];
  /** True when the customer asked for this product to be a "quick-add". */
  quickAdd?: boolean;
  /** Best guess of what service this product is intended for. */
  serviceContext?: CatalogServiceContext;
  notes?: string;
}

export interface CatalogEnrichmentSource {
  field: string;
  value: string;
  url?: string | null;
  domain?: string | null;
  confidence: CatalogConfidence;
  reason?: string;
}

export interface CatalogPreviewSummary {
  totalUploads: number;
  parsedRows: number;
  newRows: number;
  updateRows: number;
  duplicateRiskRows: number;
  needsReviewRows: number;
  missingBarcode: number;
  missingPrice: number;
  missingMaterialWeight: number;
  missingType: number;
  missingPackingWeight: number;
  uniqueBrands: string[];
  uniqueSeries: string[];
  /** Rows derived from pasted request text. */
  textRows?: number;
  /** Rows derived from product URLs. */
  urlRows?: number;
  /** Rows derived from image OCR/vision. */
  imageRows?: number;
  /** Rows the customer asked us to register as quick-adds. */
  quickAddRows?: number;
  /** URLs detected/parsed in the request. */
  linkCount?: number;
}

export interface CatalogPreviewResponse {
  /** sha256 of the uploaded files+options, used as a cache key. */
  jobId: string;
  summary: CatalogPreviewSummary;
  rows: CatalogCandidateRow[];
  warnings: CatalogWarning[];
  /** Brand/series of the existing DB export (if one was uploaded). */
  dbContext: {
    fileName: string | null;
    rowCount: number;
    brands: string[];
    seriesByBrand: Record<string, string[]>;
  };
  /** Echo back what the request parser made of the pasted text. */
  requestContext?: {
    text: string;
    bulletCount: number;
    detectedBrands: string[];
    detectedLinks: string[];
    quickAddIntents: number;
  } | null;
}

export interface CatalogEnrichRequest {
  jobId: string;
  rowKeys?: string[];
  /** Allow the server to do real web/LLM calls. */
  enableWeb?: boolean;
  enableLLM?: boolean;
  /** Allow OpenAI vision calls for any pending image rows. */
  enableVision?: boolean;
}

export interface CatalogEnrichResponse {
  jobId: string;
  enriched: CatalogCandidateRow[];
  warnings: CatalogWarning[];
  llmCalls: number;
  webCalls: number;
  visionCalls?: number;
  cacheHits: number;
}

export interface CatalogExportRequest {
  jobId: string;
  filenameHint?: string;
  /** Override the in-memory rows (after manual edits). */
  rows?: CatalogCandidateRow[];
  /** When true, attach an `ai_sources` sheet. */
  includeSources?: boolean;
}

export interface CatalogExportResponse {
  jobId: string;
  filename: string;
  /** Base64-encoded xlsx content. */
  workbook: string;
  byteSize: number;
  rowCounts: {
    new: number;
    updates: number;
    barcodeGaps: number;
    sources: number;
    quickAdds?: number;
    requestBullets?: number;
    evidence?: number;
  };
}

export interface CatalogImportOptions {
  brand?: string;
  series?: string;
  defaultType?: string;
  defaultPackingWeight?: number;
  defaultMaterialWeight?: number;
  defaultIls?: number;
  /** Mark uploads as a brand-new series vs. an update audit. */
  mode?: "new-series" | "audit";
  /** Customer-supplied request text (WhatsApp / Instagram / email paste). */
  requestText?: string;
  /**
   * Explicit URL list. When omitted but `requestText` contains http(s)
   * links, the server will auto-detect them.
   */
  links?: string[];
  /** Hard cap on how many URLs the server will fetch for one job. */
  maxLinkFetches?: number;
}

export interface CatalogUploadFile {
  name: string;
  size: number;
  /** Base64 content, no data URL prefix. */
  content: string;
  /** "db-export" = treat as the existing DB snapshot to compare against. */
  role?: "db-export" | "catalog";
}
