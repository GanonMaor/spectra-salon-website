/**
 * src/lib/types/canonicalDb.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Shared TypeScript contracts for the Canonical Product Database.
 *
 * These types mirror the database schema introduced in
 * migrations/020_canonical_product_database.sql and are used by:
 *   - netlify/functions/canonical-product-db.js  (read API)
 *   - netlify/functions/canonical-product-import.js  (import API)
 *   - src/screens/AdminDashboard/ProductDatabasePage.tsx
 *   - src/screens/AdminDashboard/ProductResolutionPage.tsx
 *
 * These types are SEPARATE from the existing Product Truth static-artifact
 * types in productTruth.ts. Do not conflate the two. The Product Truth
 * pipeline (static JSON) and the Canonical Product Database (DB-first) are
 * different layers. Eventually the DB layer will supersede the static layer,
 * but both coexist during the migration period.
 *
 * Layer model:
 *   CanonicalManufacturer
 *   → ProductLine
 *   → ProductFamily          (commercial product above SKU)
 *   → CanonicalProductSku    (exact SKU / operational identity)
 *   → CatalogSourceRecord    (original source rows, immutable)
 *   → ProductIdentityMapping (positive + negative decisions)
 *   → DbProductAlias         (normalized name variants)
 */

// ── Evidence and verification statuses ────────────────────────────────────

export type EvidenceStatus =
  | "verified"
  | "partially_verified"
  | "inferred"
  | "unresearched"
  | "conflicting";

export type DbValidationStatus =
  | "approved"
  | "candidate"
  | "needs_review"
  | "rejected"
  | "inactive";

export type DbConfidence = "high" | "medium" | "low";

// ── Mapping types ─────────────────────────────────────────────────────────

export type MappingType =
  | "exact_match"
  | "normalized_match"
  | "barcode_match"
  | "catalog_number_match"
  | "alias"
  | "manual_assignment"
  | "approved_duplicate"
  | "usage_alias"
  | "historical_alias"
  | "rejected_match"
  | "keep_separate";

// ── Import batch statuses ─────────────────────────────────────────────────

export type ImportBatchStatus =
  | "created"
  | "profiling"
  | "validated"
  | "preview_ready"
  | "approved"
  | "importing"
  | "completed"
  | "completed_with_warnings"
  | "failed"
  | "rolled_back";

// ── Review item types ─────────────────────────────────────────────────────

export type ReviewType =
  | "potential_duplicate"
  | "uncertain_mapping"
  | "conflicting_barcode"
  | "missing_manufacturer"
  | "missing_product_type"
  | "low_confidence_merge"
  | "unresolved_source"
  | "manual_review_requested";

export type ReviewStatus = "open" | "in_progress" | "resolved" | "dismissed";

// ── Canonical Manufacturer ─────────────────────────────────────────────────

export interface CanonicalManufacturer {
  id: string;
  canonicalName: string;
  normalizedName: string;
  displayName: string | null;
  countryOfOrigin: string | null;
  website: string | null;
  evidenceStatus: EvidenceStatus;
  status: "active" | "inactive" | "merged";
  revision: number;
  createdAt: string;
  updatedAt: string;
}

export interface CanonicalManufacturerRow {
  id: string;
  canonical_name: string;
  normalized_name: string;
  display_name: string | null;
  country_of_origin: string | null;
  website: string | null;
  evidence_status: EvidenceStatus;
  status: string;
  revision: number;
  created_at: string;
  updated_at: string;
}

// ── Product Line ───────────────────────────────────────────────────────────

export interface ProductLine {
  id: string;
  manufacturerId: string;
  manufacturerName: string;
  canonicalName: string;
  normalizedName: string;
  region: string | null;
  evidenceStatus: EvidenceStatus;
  status: "active" | "inactive" | "discontinued";
  revision: number;
  createdAt: string;
  updatedAt: string;
}

// ── Product Family ─────────────────────────────────────────────────────────

/**
 * Represents a commercial product family that exists above package-size
 * SKU variations. For example, "Wella Koleston Perfect 7/0" is a family;
 * the 60ml and 120ml tubes are separate canonical SKUs within that family.
 */
export interface ProductFamily {
  id: string;
  manufacturerId: string;
  productLineId: string | null;
  canonicalName: string;
  normalizedName: string;
  primaryProductType: string;
  evidenceStatus: EvidenceStatus;
  status: "active" | "inactive" | "discontinued";
  revision: number;
  createdAt: string;
  updatedAt: string;
}

// ── Canonical Product SKU ──────────────────────────────────────────────────

/**
 * Represents an exact canonical SKU or operational product identity.
 * Package size IS part of the identity. Two identical shades in different
 * package sizes are SEPARATE canonical SKUs under the same ProductFamily.
 */
export interface CanonicalProductSku {
  id: string;
  productFamilyId: string;
  manufacturerId: string;
  productLineId: string | null;
  canonicalName: string;
  normalizedName: string;
  primaryProductType: string;
  productCategory: string | null;
  productSubcategory: string | null;

  // Package identity fields — never collapse different sizes
  packageSizeValue: number | null;
  packageSizeUnit: string | null;
  packageCount: number | null;
  unitSizeValue: number | null;
  unitSizeUnit: string | null;
  originalPackageText: string | null;
  packagingType: string | null;

  // Intended use — part of identity
  intendedUseType: string | null;
  professionalUse: boolean;
  retailUse: boolean;
  technicalUse: boolean;
  compatibleSystem: string | null;

  // Status and evidence
  active: boolean;
  evidenceStatus: EvidenceStatus;
  validationStatus: DbValidationStatus;

  // Tonal profile placeholders (future milestone — do not populate yet)
  colorDepthLevel: number | null;      // future: Milestone 7
  colorToneCode: string | null;        // future: Milestone 7
  colorToneFamily: string | null;      // future: Milestone 7
  neutralizationTarget: string | null; // future: Milestone 7

  revision: number;
  sourceCount: number;
  aliasCount: number;
  reviewItemCount: number;

  createdAt: string;
  updatedAt: string;
}

// ── Catalog Source Record ──────────────────────────────────────────────────

/**
 * Stores the original product record from an import source without modification.
 * The raw_payload column preserves the complete original row.
 * Source records are NEVER deleted when detached from a canonical product.
 */
export interface CatalogSourceRecord {
  id: string;
  sourceSystem: string;
  sourceProductId: string | null;
  sourceFile: string | null;
  sourceSheet: string | null;
  sourceRowId: string | null;
  importBatchId: string | null;

  // Raw field values — never replace with normalized values
  rawProductName: string;
  normalizedRawName: string;
  rawBrand: string | null;
  rawProductLine: string | null;
  rawShadeCode: string | null;
  rawShadeName: string | null;
  rawSize: string | null;
  rawUnit: string | null;
  rawBarcode: string | null;
  rawCatalogNumber: string | null;
  rawProductType: string | null;
  rawActiveStatus: string | null;
  rawPayload: Record<string, unknown>;

  canonicalProductId: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Product Identity Mapping ───────────────────────────────────────────────

/**
 * Stores permanent positive AND negative mapping decisions.
 * Negative decisions (rejected_match, keep_separate) must persist even
 * when canonicalProductId is null.
 *
 * Manual decisions must NEVER be overwritten by future automated imports.
 */
export interface ProductIdentityMapping {
  id: string;
  sourceType: string;
  sourceRecordId: string | null;
  rawProductName: string;
  normalizedRawName: string;
  canonicalProductId: string | null; // null for rejected_match / keep_separate
  mappingType: MappingType;
  matchMethod: string;
  confidence: DbConfidence;
  validationStatus: DbValidationStatus;
  assignedBy: string | null;
  assignedAt: string | null;
  importBatchId: string | null;
  rulesVersion: string | null;
  notes: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Product Alias (DB) ─────────────────────────────────────────────────────

/**
 * Separate from ProductAlias in productTruth.ts — this is the DB-backed version
 * that persists normalized name variants for a canonical SKU.
 */
export interface DbProductAlias {
  id: string;
  canonicalProductId: string;
  alias: string;
  normalizedAlias: string;
  aliasType: string;
  sourceRecordId: string | null;
  confidence: DbConfidence;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Usage Product Resolution ───────────────────────────────────────────────

/**
 * Persistent link from a usage report row to a canonical product.
 * When Product Truth is rebuilt, re-resolution must update this table
 * rather than re-creating from scratch.
 */
export interface DbUsageProductResolution {
  id: string;
  usageReportId: string;
  usageRowId: string | null;
  rawProductName: string;
  normalizedRawName: string;
  legacySourceProductId: string | null;
  canonicalProductId: string | null;
  mappingId: string | null;
  matchMethod: string | null;
  confidence: DbConfidence | "none";
  resolutionStatus: "resolved" | "suggested" | "unresolved" | "rejected";
  productTruthRevision: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Product Import Batch ───────────────────────────────────────────────────

export interface ProductImportBatch {
  id: string;
  sourceType: string;
  sourceFile: string | null;
  sourceHash: string | null;
  processorVersion: string;
  rulesVersion: string;
  status: ImportBatchStatus;
  startedAt: string | null;
  completedAt: string | null;
  createdBy: string | null;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  insertedRows: number;
  updatedRows: number;
  unchangedRows: number;
  conflictRows: number;
  reviewRows: number;
  summary: ImportBatchSummary | null;
  createdAt: string;
  updatedAt: string;
}

export interface ImportBatchSummary {
  sourceFile: string | null;
  sourceHash: string | null;
  sheetNames: string[];
  detectedHeaderRow: number | null;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  sourceIdsDetected: number;
  uniqueRawNames: number;
  uniqueBrands: number;
  exactDuplicateCandidates: number;
  barcodeMatches: number;
  catalogNumberMatches: number;
  canonicalCandidates: number;
  reviewItemsCreated: number;
  rowsInserted: number;
  rowsUpdated: number;
  rowsUnchanged: number;
  conflicts: number;
  warnings: string[];
  errors: string[];
}

// ── Product Evidence ───────────────────────────────────────────────────────

export interface ProductEvidence {
  id: string;
  canonicalProductId: string;
  fieldName: string;
  valueSnapshot: string;
  evidenceStatus: EvidenceStatus;
  sourceType: "manufacturer_website" | "catalog_pdf" | "distributor" | "manual" | "inferred" | "other";
  sourceUrl: string | null;
  sourceTitle: string | null;
  sourceLanguage: string | null;
  translatedToEnglish: boolean;
  region: string | null;
  retrievedAt: string | null;
  publishedOrUpdatedAt: string | null;
  confidence: DbConfidence;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// ── Product Review Item ────────────────────────────────────────────────────

export interface DbProductReviewItem {
  id: string;
  reviewType: ReviewType;
  sourceRecordId: string | null;
  canonicalProductId: string | null;
  candidateProductId: string | null;
  status: ReviewStatus;
  priority: number; // 1 (highest) to 5 (lowest)
  confidence: DbConfidence;
  reasonCode: string;
  evidence: Record<string, unknown>;
  resolution: Record<string, unknown> | null;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
}

// ── Product Audit Log ──────────────────────────────────────────────────────

export interface ProductAuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  previousValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  reason: string | null;
  performedBy: string | null;
  importBatchId: string | null;
  revisionBefore: number | null;
  revisionAfter: number | null;
  createdAt: string;
}

// ── List and Pagination ────────────────────────────────────────────────────

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ProductDbFilters {
  q?: string;
  manufacturerId?: string;
  productLineId?: string;
  productType?: string;
  validationStatus?: DbValidationStatus;
  evidenceStatus?: EvidenceStatus;
  active?: boolean;
  hasReviewItems?: boolean;
  page?: number;
  limit?: number;
}

// ── Lightweight list row (for table display) ──────────────────────────────

export interface CanonicalProductListRow {
  id: string;
  canonicalName: string;
  manufacturerName: string;
  productLineName: string | null;
  primaryProductType: string;
  packageSizeValue: number | null;
  packageSizeUnit: string | null;
  validationStatus: DbValidationStatus;
  evidenceStatus: EvidenceStatus;
  active: boolean;
  sourceCount: number;
  aliasCount: number;
  reviewItemCount: number;
  createdAt: string;
  updatedAt: string;
}

// ── Resolution queue item ─────────────────────────────────────────────────

export interface ResolutionQueueItem {
  reviewItem: DbProductReviewItem;
  canonicalProduct: CanonicalProductListRow | null;
  candidateProduct: CanonicalProductListRow | null;
  sourceRecord: Pick<CatalogSourceRecord, "id" | "rawProductName" | "rawBrand" | "rawPayload"> | null;
}

// ── Edit DTO ───────────────────────────────────────────────────────────────

/**
 * Only a subset of fields are editable via the admin UI.
 * Raw source fields are never editable.
 * Use explicit save/cancel — never auto-save.
 */
export interface CanonicalProductEditDto {
  canonicalName?: string;
  primaryProductType?: string;
  productCategory?: string | null;
  productSubcategory?: string | null;
  active?: boolean;
  evidenceStatus?: EvidenceStatus;
  validationStatus?: DbValidationStatus;
  intendedUseType?: string | null;
  professionalUse?: boolean;
  retailUse?: boolean;
  technicalUse?: boolean;
  notes?: string;
}

export interface MappingDecisionDto {
  sourceRecordId: string;
  rawProductName: string;
  canonicalProductId: string | null;
  mappingType: MappingType;
  confidence: DbConfidence;
  notes?: string;
  assignedBy: string;
}
