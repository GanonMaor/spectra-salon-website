/**
 * src/lib/types/resolutionActions.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Milestone 4: TypeScript contracts for product resolution action
 * request/response objects.
 *
 * These types exactly match the JSON shapes returned by
 * netlify/functions/product-resolution-actions.js
 */

// ── Source Record Identity ────────────────────────────────────────────────────

/**
 * Typed reference to a source record that can be assigned to a canonical
 * product. Table names are NEVER accepted from the client directly.
 */
export type ProductSourceRecordType =
  | "catalog_product_source"
  | "legacy_product"
  | "usage_value"
  | "product_alias";

export interface ProductSourceRecordRef {
  sourceRecordType: ProductSourceRecordType;
  sourceRecordId: string;
}

// ── Analytics Recalculation State ────────────────────────────────────────────

export type RecalculationMode = "immediate" | "mark_stale" | "not_supported";

export interface AnalyticsRecalcState {
  analyticsAffected: boolean;
  affectedSnapshotIds: string[];
  affectedAggregationTypes: string[];
  recalculationMode: RecalculationMode;
  reprocessingRequiredCount: number;
  unsupportedFields?: string[];
}

// ── Preview Metadata ──────────────────────────────────────────────────────────

export interface PreviewMeta {
  previewToken: string;
  impactHash: string;
  impactHashVersion: number;
  generatedAt: string;
  expiresAt: string;
}

// ── Undo Strategy ─────────────────────────────────────────────────────────────

export type UndoStrategy =
  | "reverse_mapping"
  | "safe_unmerge"
  | "restore_alias"
  | "restore_negative_decision"
  | "manual_resolution_required";

// ── Common ────────────────────────────────────────────────────────────────────

export type ResolutionActionName =
  | "detach-preview"
  | "detach"
  | "reassign-preview"
  | "reassign"
  | "make-independent-preview"
  | "make-independent"
  | "merge-preview"
  | "merge"
  | "unmerge-preview"
  | "unmerge"
  | "approve-alias-preview"
  | "approve-alias"
  | "keep-separate-preview"
  | "keep-separate"
  | "reject-match-preview"
  | "reject-match"
  | "undo-preview"
  | "undo";

export interface ResolutionActionError {
  error: string;
  code?: string;
  action?: string;
  conflict?: boolean;
  preview_stale?: boolean;
}

// ── Detach ────────────────────────────────────────────────────────────────────

export type DetachMode = "detach_to_unresolved" | "detach_and_create_independent";

export interface DetachPreviewParams {
  action: "detach-preview";
  sourceRecordType: ProductSourceRecordType;
  sourceRecordId: string;
}

export interface DetachPreviewResult extends PreviewMeta, AnalyticsRecalcState {
  preview: true;
  action: "detach";
  blocker?: string;
  sourceId?: string;
  sourceName?: string;
  currentCanonicalId?: string;
  currentCanonicalName?: string;
  canonicalRevision?: number;
  affectedSources: number;
  affectedMappings: number;
  affectedUsageResolutions: number;
  warnings: string[];
}

export interface DetachParams {
  action: "detach";
  sourceRecordType: ProductSourceRecordType;
  sourceRecordId: string;
  operationId: string;
  previewToken: string;
  impactHash: string;
  mode?: DetachMode;
  reason?: string;
  expectedCanonicalRevision?: number;
}

export interface DetachResult extends AnalyticsRecalcState {
  success: true;
  actionId: string;
  operationId: string;
  mergeHistoryId?: string;
  noOp?: boolean;
  message?: string;
  mode: DetachMode;
  prevCanonicalId: string;
  newCanonicalId: string | null;
  deactivatedMappings: number;
  affectedUsageResolutions: number;
}

// ── Reassign ──────────────────────────────────────────────────────────────────

export interface ReassignPreviewParams {
  action: "reassign-preview";
  sourceRecordType: ProductSourceRecordType;
  sourceRecordId: string;
  targetCanonicalId: string;
}

export interface ReassignPreviewResult extends PreviewMeta, AnalyticsRecalcState {
  preview: true;
  action: "reassign";
  blocker?: string;
  sourceId?: string;
  sourceName?: string;
  currentCanonicalId?: string;
  currentCanonicalName?: string;
  targetCanonicalId?: string;
  targetCanonicalName?: string;
  targetRevision?: number;
  currentRevision?: number;
  affectedMappings: number;
  affectedUsageResolutions: number;
  warnings: string[];
  blockers: string[];
  unsupportedFields?: string[];
}

export interface ReassignParams {
  action: "reassign";
  sourceRecordType: ProductSourceRecordType;
  sourceRecordId: string;
  targetCanonicalId: string;
  operationId: string;
  previewToken: string;
  impactHash: string;
  reason?: string;
  expectedSourceRevision?: number;
  expectedTargetRevision?: number;
  forceOverride?: boolean;
}

export interface ReassignResult extends AnalyticsRecalcState {
  success: true;
  actionId: string;
  operationId: string;
  mergeHistoryId?: string;
  newMappingId?: string;
  noOp?: boolean;
  prevCanonicalId: string | null;
  targetCanonicalId: string;
  deactivatedMappings: number;
  affectedUsageResolutions: number;
}

// ── Make Independent ──────────────────────────────────────────────────────────

export interface MakeIndependentPreviewParams {
  action: "make-independent-preview";
  sourceRecordType: ProductSourceRecordType;
  sourceRecordId: string;
}

export interface MakeIndependentPreviewResult extends PreviewMeta, AnalyticsRecalcState {
  preview: true;
  action: "make-independent";
  sourceId: string;
  sourceName: string;
  currentCanonicalId: string | null;
  willCreateProduct: {
    canonical_name: string;
    manufacturer: string;
    product_type: string;
  };
  reviewItemsWillBeCreated: number;
  missingFields: string[];
  warnings: string[];
}

export interface MakeIndependentParams {
  action: "make-independent";
  sourceRecordType: ProductSourceRecordType;
  sourceRecordId: string;
  operationId: string;
  previewToken: string;
  impactHash: string;
  reason?: string;
  expectedCanonicalRevision?: number;
}

export interface MakeIndependentResult extends AnalyticsRecalcState {
  success: true;
  actionId: string;
  operationId: string;
  mergeHistoryId?: string;
  newCanonicalId: string;
  prevCanonicalId: string | null;
  deactivatedMappings: number;
  reviewItemsCreated: number;
}

// ── Merge ─────────────────────────────────────────────────────────────────────

export interface MergePreviewParams {
  action: "merge-preview";
  survivingId: string;
  mergedId: string;
  survivingProductFamilyId?: string;
}

export interface MergePreviewResult extends PreviewMeta, AnalyticsRecalcState {
  preview: true;
  action: "merge";
  blocker?: string;
  survivingId: string;
  survivingName: string;
  survivingRevision: number;
  survivingFamilyId?: string;
  survivingFamilyName?: string;
  mergedId: string;
  mergedName: string;
  mergedRevision: number;
  mergedFamilyId?: string;
  mergedFamilyName?: string;
  familySelectionRequired: boolean;
  willCreateEmptyFamilyReviewItem: boolean;
  sourcesWillReassign: number;
  aliasesWillReassign: number;
  mappingsWillReassign: number;
  usageResolutionsWillReassign: number;
  actualBlockers: MergeBlockerType[];
  blockers: string[];
  warnings: string[];
}

export type MergeBlockerType =
  | "package_size_conflict"
  | "package_count_conflict"
  | "unit_conflict"
  | "barcode_conflict"
  | "catalog_number_conflict"
  | "product_type_conflict"
  | "intended_use_conflict"
  | "region_conflict"
  | "compatible_system_conflict"
  | "tonal_equivalent_not_duplicate"
  | "family_selection_required";

export interface MergeParams {
  action: "merge";
  survivingId: string;
  mergedId: string;
  operationId: string;
  previewToken: string;
  impactHash: string;
  survivingProductFamilyId?: string;
  reason?: string;
  expectedSurvivingRevision?: number;
  expectedMergedRevision?: number;
  forceOverride?: boolean;
  overrideBlockers?: MergeBlockerType[];
}

export interface MergeResult extends AnalyticsRecalcState {
  success: true;
  actionId: string;
  operationId: string;
  mergeHistoryId?: string;
  survivingId: string;
  mergedId: string;
  sourcesMoved: number;
  mappingsMoved: number;
  aliasesMoved: number;
  usageMoved: number;
}

// ── Unmerge ───────────────────────────────────────────────────────────────────

export interface UnmergePreviewParams {
  action: "unmerge-preview";
  mergeHistoryId: string;
}

export interface UnmergePreviewResult extends PreviewMeta, AnalyticsRecalcState {
  preview: true;
  action: "unmerge";
  blocker?: string;
  safe_unmerge?: boolean;
  mergeHistoryId?: string;
  mergedProductId?: string;
  mergedProductName?: string;
  survivingId?: string;
  originalSourceCount?: number;
  originalMappingCount?: number;
  divergedSourcesAddedAfterMerge?: number;
  divergenceDetails?: UnmergeDivergence;
  warnings: string[];
  blockers: string[];
}

export interface UnmergeDivergence {
  sourcesAdded: number;
  aliasesAdded: number;
  mappingsAdded: number;
  usageResolutionsAdded: number;
  productEditsAfterMerge: number;
  laterStructuralActions: string[];
  safeToUnmerge: boolean;
}

export interface UnmergeParams {
  action: "unmerge";
  mergeHistoryId: string;
  operationId: string;
  previewToken: string;
  impactHash: string;
  reason?: string;
}

export interface UnmergeResult extends AnalyticsRecalcState {
  success: true;
  actionId: string;
  operationId: string;
  mergeHistoryId?: string;
  originalMergeHistoryId: string;
  survivingId: string;
  mergedId: string;
  sourcesRestored: number;
  mappingsRestored: number;
  usageRestored: number;
}

// ── Approve Alias ─────────────────────────────────────────────────────────────

export interface ApproveAliasPreviewParams {
  action: "approve-alias-preview";
  sourceRecordType: ProductSourceRecordType;
  sourceRecordId: string;
  canonicalProductId: string;
  aliasScope?: AliasScope;
}

export type AliasScope =
  | "global"
  | "manufacturer"
  | "product_line"
  | "region"
  | "source_system";

export interface ApproveAliasPreviewResult extends PreviewMeta, AnalyticsRecalcState {
  preview: true;
  action: "approve-alias";
  sourceId: string;
  sourceName: string;
  canonicalProductId: string;
  canonicalName: string;
  aliasScope: AliasScope;
  aliasAlreadyExists: boolean;
  warnings: string[];
}

export interface ApproveAliasParams {
  action: "approve-alias";
  sourceRecordType: ProductSourceRecordType;
  sourceRecordId: string;
  canonicalProductId: string;
  operationId: string;
  previewToken: string;
  impactHash: string;
  aliasScope?: AliasScope;
  reason?: string;
}

export interface ApproveAliasResult extends AnalyticsRecalcState {
  success: true;
  actionId: string;
  operationId: string;
  aliasId: string | null;
  alreadyExisted: boolean;
}

// ── Keep Separate ─────────────────────────────────────────────────────────────

export interface KeepSeparatePreviewParams {
  action: "keep-separate-preview";
  sourceRecordType: ProductSourceRecordType;
  sourceRecordId: string;
  candidateCanonicalId: string;
}

export interface KeepSeparatePreviewResult extends PreviewMeta {
  preview: true;
  action: "keep-separate";
  message: string;
}

export interface KeepSeparateParams {
  action: "keep-separate";
  sourceRecordType: ProductSourceRecordType;
  sourceRecordId: string;
  candidateCanonicalId: string;
  operationId: string;
  previewToken: string;
  impactHash: string;
  reason?: string;
  evidence?: Record<string, unknown>;
  evidenceHash?: string;
}

export interface KeepSeparateResult {
  success: true;
  actionId: string;
  operationId: string;
  negativeMappingId?: string;
}

// ── Reject Match ──────────────────────────────────────────────────────────────

export interface RejectMatchPreviewParams {
  action: "reject-match-preview";
  sourceRecordType?: ProductSourceRecordType;
  reviewItemId?: string;
  sourceRecordId?: string;
  candidateCanonicalId?: string;
}

export interface RejectMatchPreviewResult extends PreviewMeta {
  preview: true;
  action: "reject-match";
  reviewItemId?: string;
  message: string;
}

export interface RejectMatchParams {
  action: "reject-match";
  sourceRecordType?: ProductSourceRecordType;
  reviewItemId?: string;
  sourceRecordId?: string;
  candidateCanonicalId?: string;
  operationId: string;
  previewToken: string;
  impactHash: string;
  reason?: string;
}

export interface RejectMatchResult {
  success: true;
  actionId: string;
  operationId: string;
  negativeMappingId?: string;
}

// ── Undo ──────────────────────────────────────────────────────────────────────

export interface UndoPreviewParams {
  action: "undo-preview";
  actionId: string;
}

export interface UndoPreviewResult extends PreviewMeta {
  preview: true;
  action: "undo";
  blocker?: string;
  reversible: boolean;
  blockedByActions: string[];
  undoStrategy: UndoStrategy;
  mergeHistoryId?: string;
  originalAction?: string;
  createdAt?: string;
  safeToUndo?: boolean;
  warnings: string[];
}

export interface UndoParams {
  action: "undo";
  actionId: string;
  operationId: string;
  previewToken: string;
  impactHash: string;
  reason?: string;
}

export interface UndoResult {
  success: true;
  actionId?: string;
  operationId: string;
  undone?: boolean;
  originalAction?: string;
  historyId?: string;
}

// ── Union types ───────────────────────────────────────────────────────────────

export type ResolutionPreviewParams =
  | DetachPreviewParams
  | ReassignPreviewParams
  | MakeIndependentPreviewParams
  | MergePreviewParams
  | UnmergePreviewParams
  | ApproveAliasPreviewParams
  | KeepSeparatePreviewParams
  | RejectMatchPreviewParams
  | UndoPreviewParams;

export type ResolutionPreviewResult =
  | DetachPreviewResult
  | ReassignPreviewResult
  | MakeIndependentPreviewResult
  | MergePreviewResult
  | UnmergePreviewResult
  | ApproveAliasPreviewResult
  | KeepSeparatePreviewResult
  | RejectMatchPreviewResult
  | UndoPreviewResult;

export type ResolutionWriteParams =
  | DetachParams
  | ReassignParams
  | MakeIndependentParams
  | MergeParams
  | UnmergeParams
  | ApproveAliasParams
  | KeepSeparateParams
  | RejectMatchParams
  | UndoParams;

export type ResolutionWriteResult =
  | DetachResult
  | ReassignResult
  | MakeIndependentResult
  | MergeResult
  | UnmergeResult
  | ApproveAliasResult
  | KeepSeparateResult
  | RejectMatchResult
  | UndoResult;

// ── UI state for the ActionModal ──────────────────────────────────────────────

export type ActionModalState =
  | { phase: "idle" }
  | { phase: "loading_preview" }
  | { phase: "preview"; preview: ResolutionPreviewResult }
  | { phase: "reason_input"; preview: ResolutionPreviewResult; reason: string }
  | { phase: "submitting" }
  | { phase: "success"; result: ResolutionWriteResult; actionId: string }
  | { phase: "conflict"; error: string; preview_stale?: boolean; code?: string }
  | { phase: "error"; error: string; code?: string };
