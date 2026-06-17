/**
 * src/screens/AdminDashboard/ProductResolutionPage.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * Product Resolution Center — /admin/product-resolution
 *
 * Milestone 3: New Pages Shell
 *
 * A dedicated workspace for resolving product identity issues that require
 * human attention. Centralizes:
 *   - Potential duplicates
 *   - Uncertain mappings
 *   - Conflicting barcodes
 *   - Unresolved source records
 *   - Missing classification
 *   - Low confidence merges
 *
 * Every decision (merge, keep separate, reject) is persisted in
 * product_identity_mappings so future imports resolve correctly.
 *
 * Identity decision types:
 *   Duplicate  — same commercial product, different source records
 *   Variant    — same product family, different SKU (size, count, region)
 *   Tonal Equivalent — different products with similar color characteristics
 *
 * The system never automatically merges uncertain products. All merges
 * require explicit human approval through this page.
 */

import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck, AlertTriangle, CheckCircle2, X, RefreshCw,
  Database, Eye, ArrowRight, Layers, Tag, GitMerge,
  Zap, Sun, Moon, Home, Search,
  ChevronDown, ChevronRight, Archive, Clock,
  MessageSquare, Filter, ExternalLink, Info,
  Unlink, GitBranch, Loader2,
} from "lucide-react";
import { SiteThemeProvider, useSiteTheme } from "../../contexts/SiteTheme";
import {
  fetchDbCounts,
  fetchReviewCounts,
  fetchReviewItems,
  fetchReviewItemDetail,
  fetchReviewComparison,
  fetchCandidateProducts,
  fetchMappingsByName,
  type ReviewCountsResponse,
  type DbMappingRow,
  type DbReviewItem,
  type DbReviewItemDetail,
  type CandidateProductRow,
  type ReviewComparisonResponse,
} from "../../lib/product-database/canonicalProductDbClient";
import { ActionModal, type ActionModalContext } from "./ActionModal";
import type { EvidenceStatus, DbValidationStatus, ReviewType, ReviewStatus } from "../../lib/types/canonicalDb";

// ── Theme (same tokens as AdminDashboard) ────────────────────────────────

function useAdminTheme() {
  const { isDark, toggleTheme } = useSiteTheme();
  const at = {
    page:          isDark ? "bg-[#0a0a0f] text-white"                 : "bg-[#FAFAF8] text-[#1A1A1A]",
    sticky:        isDark ? "bg-[#0a0a0f]/80"                         : "bg-[#FAFAF8]/90",
    card:          isDark ? "bg-white/[0.03] border-white/[0.06]"     : "bg-white border-black/[0.08] shadow-sm",
    cardHover:     isDark ? "hover:bg-white/[0.05]"                   : "hover:bg-gray-50",
    subCard:       isDark ? "bg-white/[0.02] border-white/[0.06]"     : "bg-white/60 border-black/[0.06]",
    stickyBorder:  isDark ? "border-white/5"                          : "border-black/[0.06]",
    textPrimary:   isDark ? "text-white"                              : "text-[#1A1A1A]",
    text90:        isDark ? "text-white/90"                           : "text-[#1A1A1A]",
    textSec:       isDark ? "text-white/70"                           : "text-[#555555]",
    textMuted:     isDark ? "text-white/55"                           : "text-[#777777]",
    textFaint:     isDark ? "text-white/50"                           : "text-[#999999]",
    textDim:       isDark ? "text-white/15"                           : "text-[#CCCCCC]",
    border:        isDark ? "border-white/[0.06]"                     : "border-black/[0.08]",
    input:         isDark
      ? "bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/50 focus:border-indigo-500/50 focus:ring-indigo-500/20"
      : "bg-white border-black/[0.12] text-[#1A1A1A] placeholder:text-[#AAAAAA] focus:border-indigo-400 focus:ring-indigo-400/20",
    select:        isDark ? "bg-white/[0.06] border-white/[0.1] text-white" : "bg-white border-black/[0.10] text-[#1A1A1A]",
    tabWrap:       isDark ? "bg-white/[0.04] border-white/[0.06]"     : "bg-black/[0.04] border-black/[0.06]",
    tabActive:     isDark ? "bg-white/[0.1] text-white shadow-sm"     : "bg-white text-[#1A1A1A] shadow-sm",
    tabInactive:   isDark ? "text-white/55 hover:text-white/70"       : "text-[#888888] hover:text-[#555555]",
    rowDivide:     isDark ? "divide-white/[0.03]"                     : "divide-black/[0.04]",
    rowHover:      isDark ? "hover:bg-white/[0.03]"                   : "hover:bg-black/[0.02]",
    filterActive:  isDark ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300" : "bg-indigo-50 border-indigo-200 text-indigo-700",
    filterInactive:isDark ? "bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-white/70" : "bg-white border-black/[0.08] text-[#888] hover:text-[#555]",
    toggleBtn:     isDark ? "bg-white/[0.06] hover:bg-white/[0.12] text-white/55 hover:text-white/70" : "bg-black/[0.04] hover:bg-black/[0.08] text-black/55 hover:text-black/70",
    spinner:       isDark ? "border-indigo-500/30 border-t-indigo-500" : "border-indigo-400/40 border-t-indigo-500",
  };
  return { isDark, toggleTheme, at };
}

// ── Decision card ─────────────────────────────────────────────────────────

interface DecisionOption {
  type: "merge" | "variant" | "tonal_equivalent" | "keep_separate" | "reject";
  label: string;
  description: string;
  icon: React.ElementType;
  cls: string;
}

const DECISIONS: DecisionOption[] = [
  {
    type: "merge",
    label: "Approve Merge",
    description: "Same commercial product — merge into one canonical SKU",
    icon: GitMerge,
    cls: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25",
  },
  {
    type: "variant",
    label: "Mark as Variant",
    description: "Same product family, different SKU (e.g. different size)",
    icon: Layers,
    cls: "bg-sky-500/15 border-sky-500/30 text-sky-400 hover:bg-sky-500/25",
  },
  {
    type: "tonal_equivalent",
    label: "Tonal Equivalent",
    description: "Different products, similar color characteristics — keep separate",
    icon: Tag,
    cls: "bg-violet-500/15 border-violet-500/30 text-violet-400 hover:bg-violet-500/25",
  },
  {
    type: "keep_separate",
    label: "Keep Separate",
    description: "Explicitly mark as different products — stored as negative mapping",
    icon: X,
    cls: "bg-amber-500/15 border-amber-500/30 text-amber-400 hover:bg-amber-500/25",
  },
  {
    type: "reject",
    label: "Reject Match",
    description: "This is not a valid match suggestion — stored as rejected mapping",
    icon: AlertTriangle,
    cls: "bg-red-500/15 border-red-500/30 text-red-400 hover:bg-red-500/25",
  },
];

// ── Review type labels ────────────────────────────────────────────────────

const REVIEW_TYPE_LABELS: Record<string, { label: string; description: string; icon: React.ElementType; color: string }> = {
  potential_duplicate: {
    label: "Potential Duplicates",
    description: "Source records that may represent the same canonical product",
    icon: GitMerge,
    color: "text-orange-400",
  },
  uncertain_mapping: {
    label: "Uncertain Mappings",
    description: "Auto-mappings with low confidence that need human verification",
    icon: AlertTriangle,
    color: "text-amber-400",
  },
  conflicting_barcode: {
    label: "Conflicting Barcodes",
    description: "Same barcode found on multiple distinct products",
    icon: Tag,
    color: "text-red-400",
  },
  missing_manufacturer: {
    label: "Missing Manufacturer",
    description: "Source records with no manufacturer matched in the canonical database",
    icon: Database,
    color: "text-gray-400",
  },
  missing_product_type: {
    label: "Missing Product Type",
    description: "Products without a verified product type classification",
    icon: Filter,
    color: "text-gray-400",
  },
  low_confidence_merge: {
    label: "Low Confidence Merges",
    description: "Automated merge suggestions with confidence below threshold",
    icon: Layers,
    color: "text-sky-400",
  },
  unresolved_source: {
    label: "Unresolved Sources",
    description: "Source records with no barcode or stable ID — require manual attention",
    icon: Search,
    color: "text-violet-400",
  },
  manual_review_requested: {
    label: "Manual Reviews",
    description: "Explicitly flagged for human review by the system or an admin",
    icon: MessageSquare,
    color: "text-indigo-400",
  },
};

// ── Resolution queue section ──────────────────────────────────────────────

/** Map from review_type to the actions that make sense for that queue */
const QUEUE_ACTIONS: Record<string, Array<{ kind: ActionModalContext["kind"]; label: string }>> = {
  potential_duplicate: [
    { kind: "merge", label: "Merge" },
    { kind: "keep-separate", label: "Keep Separate" },
    { kind: "reject-match", label: "Reject" },
  ],
  uncertain_mapping: [
    { kind: "approve-alias", label: "Approve" },
    { kind: "keep-separate", label: "Keep Separate" },
    { kind: "reject-match", label: "Reject" },
  ],
  unresolved_source: [
    { kind: "reassign", label: "Reassign" },
    { kind: "make-independent", label: "Make Independent" },
  ],
  manual_review_requested: [
    { kind: "reassign", label: "Reassign" },
    { kind: "reject-match", label: "Dismiss" },
  ],
  low_confidence_merge: [
    { kind: "merge", label: "Approve Merge" },
    { kind: "keep-separate", label: "Keep Separate" },
  ],
  missing_manufacturer: [
    { kind: "make-independent", label: "Make Independent" },
  ],
  missing_product_type: [
    { kind: "make-independent", label: "Make Independent" },
  ],
};

function buildActionContext(item: DbReviewItem, kind: ActionModalContext["kind"]): ActionModalContext | null {
  switch (kind) {
    case "merge":
      if (!item.canonical_product_id || !item.candidate_product_id) return null;
      return {
        kind,
        survivingId: item.canonical_product_id,
        survivingName: item.canonical_name ?? undefined,
        mergedId: item.candidate_product_id,
        mergedName: item.candidate_name ?? undefined,
      };
    case "approve-alias":
      if (!item.source_record_id || !item.canonical_product_id) return null;
      return {
        kind,
        sourceRecordId: item.source_record_id,
        sourceRecordName: item.source_raw_name ?? undefined,
        canonicalProductId: item.canonical_product_id,
        canonicalProductName: item.canonical_name ?? undefined,
      };
    case "keep-separate":
      if (!item.source_record_id || !item.candidate_product_id) return null;
      return {
        kind,
        sourceRecordId: item.source_record_id,
        sourceRecordName: item.source_raw_name ?? undefined,
        candidateCanonicalId: item.candidate_product_id,
      };
    case "reject-match":
      return {
        kind,
        reviewItemId: item.id,
        sourceRecordId: item.source_record_id ?? undefined,
        candidateCanonicalId: item.candidate_product_id ?? undefined,
      };
    case "reassign":
      if (!item.source_record_id) return null;
      // Only return reassign context if we have a candidate to reassign to
      if (!item.candidate_product_id) return null;
      return {
        kind,
        sourceRecordId: item.source_record_id,
        sourceRecordName: item.source_raw_name ?? undefined,
        canonicalProductId: item.canonical_product_id ?? undefined,
        canonicalProductName: item.canonical_name ?? undefined,
        targetCanonicalId: item.candidate_product_id,
        targetCanonicalName: item.candidate_name ?? undefined,
      };
    case "make-independent":
      if (!item.source_record_id) return null;
      return {
        kind,
        sourceRecordId: item.source_record_id,
        sourceRecordName: item.source_raw_name ?? undefined,
      };
    default:
      return null;
  }
}

function ResolutionQueueSection({
  type,
  openCount,
  inProgressCount,
  at,
  isDark,
  onResolved,
}: {
  type: string;
  openCount: number;
  inProgressCount: number;
  at: ReturnType<typeof useAdminTheme>["at"];
  isDark: boolean;
  onResolved: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [items, setItems] = useState<DbReviewItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsError, setItemsError] = useState<string | null>(null);
  const [actionCtx, setActionCtx] = useState<ActionModalContext | null>(null);
  // Detail/comparison state
  const [detailItemId, setDetailItemId] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState<{ item: DbReviewItemDetail; comparison?: ReviewComparisonResponse } | null>(null);
  // For mapping lookup in uncertain_mapping sections
  const [lookupName, setLookupName] = useState("");
  const [lookupResult, setLookupResult] = useState<{ name: string; normalizedName: string; mappings: DbMappingRow[] } | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  useEffect(() => {
    if (!expanded) return;
    setItemsLoading(true);
    setItemsError(null);
    fetchReviewItems(type, "open", 20, 0)
      .then((r) => { setItems(r.items); setItemsLoading(false); })
      .catch((e: Error) => { setItemsError(e.message); setItemsLoading(false); });
  }, [expanded, type]);

  async function loadItemDetail(item: DbReviewItem) {
    if (detailItemId === item.id) {
      setDetailItemId(null);
      setDetailData(null);
      return;
    }
    setDetailItemId(item.id);
    setDetailLoading(true);
    try {
      const [detailRes, compRes] = await Promise.all([
        fetchReviewItemDetail(item.id),
        item.source_record_id && item.candidate_product_id
          ? fetchReviewComparison(item.source_record_id, item.candidate_product_id)
          : Promise.resolve(undefined),
      ]);
      setDetailData({ item: detailRes.item, comparison: compRes });
    } catch {
      setDetailData(null);
    } finally {
      setDetailLoading(false);
    }
  }

  async function lookupMapping() {
    if (!lookupName.trim()) return;
    setLookupLoading(true);
    try {
      const result = await fetchMappingsByName(lookupName);
      setLookupResult(result);
    } catch {}
    setLookupLoading(false);
  }

  function handleActionSuccess() {
    setActionCtx(null);
    // Remove the resolved item from the local list for instant feedback
    onResolved();
    // Re-fetch items for this queue
    fetchReviewItems(type, "open", 20, 0)
      .then((r) => setItems(r.items))
      .catch(() => {});
  }

  const config = REVIEW_TYPE_LABELS[type] ?? {
    label: type,
    description: "",
    icon: AlertTriangle,
    color: "text-gray-400",
  };
  const Icon = config.icon;
  const total = openCount + inProgressCount;
  const availableActions = QUEUE_ACTIONS[type] ?? [];

  return (
    <div className={`rounded-2xl border overflow-hidden ${at.card}`}>
      {/* Header row */}
      <button
        className={`w-full flex items-center gap-3 p-4 text-left ${at.rowHover} transition`}
        onClick={() => setExpanded((e) => !e)}
      >
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? "bg-white/5" : "bg-black/5"}`}>
          <Icon className={`w-4 h-4 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-medium ${at.textPrimary}`}>{config.label}</span>
            {inProgressCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/15 text-blue-400 border border-blue-500/20">
                {inProgressCount} in progress
              </span>
            )}
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-500/15 text-orange-400 border border-orange-500/20">
              {openCount} open
            </span>
          </div>
          <p className={`text-xs ${at.textMuted} mt-0.5 truncate`}>{config.description}</p>
        </div>
        {expanded ? <ChevronDown className={`w-4 h-4 ${at.textFaint} flex-shrink-0`} /> : <ChevronRight className={`w-4 h-4 ${at.textFaint} flex-shrink-0`} />}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className={`border-t ${at.border} p-4 space-y-4`}>

          {/* Loading */}
          {itemsLoading && (
            <div className={`flex items-center gap-2 py-4 justify-center ${at.textMuted}`}>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs">Loading review items…</span>
            </div>
          )}

          {/* Error */}
          {itemsError && !itemsLoading && (
            <div className={`flex items-start gap-2 p-3 rounded-xl border ${isDark ? "bg-rose-500/10 border-rose-500/20" : "bg-rose-50 border-rose-200"}`}>
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-rose-400">{itemsError}</p>
            </div>
          )}

          {/* Review items list */}
          {!itemsLoading && !itemsError && items.length > 0 && (
            <div className="space-y-2">
              <p className={`text-xs font-semibold ${at.textSec}`}>Open Items ({items.length})</p>
              <div className={`rounded-xl border overflow-hidden ${at.subCard}`}>
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`px-4 py-3 ${idx > 0 ? `border-t ${at.border}` : ""}`}
                  >
                    {/* Item header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-medium ${at.textPrimary} truncate`}>
                          {item.source_raw_name ?? item.canonical_name ?? item.id}
                        </p>
                        {item.source_brand && (
                          <p className={`text-[11px] ${at.textFaint}`}>{item.source_brand}</p>
                        )}
                        {(item.canonical_name || item.candidate_name) && (
                          <div className={`flex items-center gap-1.5 mt-1 text-[11px] ${at.textMuted}`}>
                            {item.canonical_name && (
                              <span className="truncate">{item.canonical_name}</span>
                            )}
                            {item.candidate_name && (
                              <>
                                <ArrowRight className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{item.candidate_name}</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] border ${
                        item.priority <= 2
                          ? "bg-rose-500/15 text-rose-400 border-rose-500/20"
                          : "bg-amber-500/15 text-amber-400 border-amber-500/20"
                      }`}>
                        P{item.priority}
                      </span>
                    </div>

                    {/* Action buttons */}
                    {availableActions.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                        {availableActions.map((a) => {
                          const ctx = buildActionContext(item, a.kind);
                          if (!ctx) return null;
                          return (
                            <button
                              key={a.kind}
                              onClick={() => setActionCtx(ctx)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-opacity border ${
                                a.kind === "merge" || a.kind === "approve-alias"
                                  ? isDark
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                                    : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                  : a.kind === "keep-separate" || a.kind === "reject-match"
                                  ? isDark
                                    ? "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20"
                                    : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                                  : isDark
                                    ? "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
                                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                              }`}
                            >
                              {a.label}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => void loadItemDetail(item)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-opacity border ml-auto flex items-center gap-1 ${
                            detailItemId === item.id
                              ? isDark ? "bg-indigo-500/15 text-indigo-400 border-indigo-500/25" : "bg-indigo-50 text-indigo-600 border-indigo-200"
                              : isDark ? "bg-white/5 text-white/40 border-white/10 hover:bg-white/10 hover:text-white/60" : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          <Eye className="w-3 h-3" />
                          {detailItemId === item.id ? "Hide" : "Detail"}
                        </button>
                      </div>
                    )}

                    {/* Inline detail panel */}
                    {detailItemId === item.id && (
                      <div className={`mt-3 rounded-xl border p-3 space-y-2 text-xs ${isDark ? "bg-white/[0.02] border-white/[0.06]" : "bg-gray-50 border-black/[0.06]"}`}>
                        {detailLoading ? (
                          <div className={`flex items-center gap-2 py-1 ${at.textMuted}`}>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Loading detail…</span>
                          </div>
                        ) : detailData ? (
                          <>
                            {/* Source record details */}
                            {detailData.item.source_raw_name && (
                              <div>
                                <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${at.textFaint}`}>Source Record</p>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                                  <span className={at.textMuted}>Name:</span>
                                  <span className={`font-medium truncate ${at.textPrimary}`}>{detailData.item.source_raw_name}</span>
                                  {detailData.item.source_brand && <>
                                    <span className={at.textMuted}>Brand:</span>
                                    <span className={at.textPrimary}>{detailData.item.source_brand}</span>
                                  </>}
                                  {detailData.item.raw_size && <>
                                    <span className={at.textMuted}>Size:</span>
                                    <span className={at.textPrimary}>{detailData.item.raw_size}{detailData.item.raw_unit ? ` ${detailData.item.raw_unit}` : ""}</span>
                                  </>}
                                  {detailData.item.raw_shade_code && <>
                                    <span className={at.textMuted}>Shade:</span>
                                    <span className={at.textPrimary}>{detailData.item.raw_shade_code}{detailData.item.raw_shade_name ? ` · ${detailData.item.raw_shade_name}` : ""}</span>
                                  </>}
                                  {detailData.item.source_system && <>
                                    <span className={at.textMuted}>System:</span>
                                    <span className={at.textPrimary}>{detailData.item.source_system}</span>
                                  </>}
                                </div>
                              </div>
                            )}

                            {/* Comparison data */}
                            {detailData.comparison && (detailData.comparison.source || detailData.comparison.candidate) && (
                              <div>
                                <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1.5 ${at.textFaint}`}>Side-by-Side Comparison</p>
                                <div className={`grid grid-cols-2 gap-2 rounded-lg overflow-hidden border ${at.border}`}>
                                  {[
                                    { label: "Source", data: detailData.comparison.source },
                                    { label: "Candidate", data: detailData.comparison.candidate },
                                  ].map(({ label, data }) => (
                                    <div key={label} className={`p-2 space-y-0.5 ${isDark ? "bg-white/[0.02]" : "bg-white"}`}>
                                      <p className={`text-[10px] font-semibold uppercase tracking-wider ${at.textFaint}`}>{label}</p>
                                      {data ? (
                                        <>
                                          <p className={`font-medium ${at.textPrimary} truncate`}>
                                            {(data.canonical_name ?? data.raw_product_name ?? "-") as string}
                                          </p>
                                          {(data.primary_product_type ?? data.raw_product_type) && (
                                            <p className={at.textMuted}>{(data.primary_product_type ?? data.raw_product_type) as string}</p>
                                          )}
                                          {(data.package_size_value != null) && (
                                            <p className={at.textMuted}>{String(data.package_size_value)}{data.package_size_unit ? ` ${String(data.package_size_unit)}` : ""}</p>
                                          )}
                                        </>
                                      ) : (
                                        <p className={at.textFaint}>—</p>
                                      )}
                                    </div>
                                  ))}
                                </div>

                                {/* Existing decisions badge */}
                                {detailData.comparison.existingDecisions?.length > 0 && (
                                  <div className={`mt-1.5 px-2 py-1 rounded-lg text-[10px] ${isDark ? "bg-amber-500/10 text-amber-400" : "bg-amber-50 text-amber-700"}`}>
                                    ⚠ {detailData.comparison.existingDecisions.length} existing decision{detailData.comparison.existingDecisions.length !== 1 ? "s" : ""} on record
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Review item metadata */}
                            <div className={`flex items-center gap-3 pt-1 text-[10px] ${at.textFaint}`}>
                              <span>Type: {item.review_type}</span>
                              <span>Reason: {item.reason_code}</span>
                              <span>Confidence: {item.confidence}</span>
                              <span className="ml-auto">{new Date(item.created_at).toLocaleDateString()}</span>
                            </div>
                          </>
                        ) : null}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!itemsLoading && !itemsError && items.length === 0 && (
            <div className={`flex items-center gap-2 py-4 justify-center ${at.textMuted}`}>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs">No open items in this queue</span>
            </div>
          )}

          {/* Quick mapping lookup for uncertain_mapping */}
          {type === "uncertain_mapping" && (
            <div className="space-y-2">
              <p className={`text-xs font-semibold ${at.textSec}`}>Quick Mapping Lookup</p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${at.textMuted}`} />
                  <input
                    type="text"
                    value={lookupName}
                    onChange={(e) => setLookupName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && void lookupMapping()}
                    placeholder="Enter raw product name to check mappings…"
                    className={`w-full pl-8 pr-3 py-2 rounded-xl border text-xs outline-none ring-0 focus:ring-1 ${at.input}`}
                  />
                </div>
                <button
                  onClick={() => void lookupMapping()}
                  className={`px-3 py-2 rounded-xl border text-xs font-medium transition ${at.filterActive} border-indigo-500/30`}
                >
                  Lookup
                </button>
              </div>

              {lookupLoading && (
                <div className={`text-xs ${at.textMuted} animate-pulse`}>Searching…</div>
              )}

              {lookupResult && (
                <div className={`rounded-xl border p-3 space-y-2 ${at.subCard}`}>
                  <p className={`text-xs font-medium ${at.textSec}`}>
                    Mappings for "{lookupResult.name}"
                    <span className={`ml-1 font-normal ${at.textFaint}`}>({lookupResult.normalizedName})</span>
                  </p>
                  {lookupResult.mappings.length === 0 && (
                    <p className={`text-xs ${at.textMuted}`}>No active mappings found for this name.</p>
                  )}
                  {lookupResult.mappings.map((m, i) => (
                    <div key={i} className={`flex items-center justify-between gap-2 text-xs p-2 rounded-lg ${isDark ? "bg-white/5" : "bg-black/5"}`}>
                      <div className="min-w-0">
                        <p className={`font-medium truncate ${at.textPrimary}`}>{m.canonical_product_name ?? "No target (negative)"}</p>
                        <p className={`${at.textFaint}`}>{String(m.mapping_type)} • {String(m.confidence)}</p>
                      </div>
                      <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] border ${
                        m.mapping_type === "rejected_match" || m.mapping_type === "keep_separate"
                          ? "bg-red-500/15 text-red-400 border-red-500/20"
                          : "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                      }`}>
                        {String(m.validation_status)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Decision reference */}
          <div className="space-y-2">
            <p className={`text-xs font-semibold ${at.textSec}`}>Decision Reference</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DECISIONS.map((d) => {
                const DIcon = d.icon;
                return (
                  <div key={d.type} className={`flex items-start gap-2 p-3 rounded-xl border text-xs ${d.cls} opacity-75`}>
                    <DIcon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">{d.label}</p>
                      <p className="opacity-80 mt-0.5 leading-snug">{d.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className={`text-[11px] ${at.textFaint}`}>
              All decisions are stored in <code className="font-mono">product_identity_mappings</code> with
              the assigned_by, assigned_at, and rules_version fields for full auditability.
              Negative decisions (keep_separate, rejected_match) persist even after re-imports.
            </p>
          </div>
        </div>
      )}

      {/* Action modal */}
      {actionCtx && (
        <ActionModal
          context={actionCtx}
          isDark={isDark}
          onClose={() => setActionCtx(null)}
          onSuccess={handleActionSuccess}
        />
      )}
    </div>
  );
}

// ── Resolution overview ───────────────────────────────────────────────────

function ResolutionOverview({ at, isDark }: { at: ReturnType<typeof useAdminTheme>["at"]; isDark: boolean }) {
  const [counts, setCounts] = useState<ReviewCountsResponse | null>(null);
  const [dbCounts, setDbCounts] = useState<Awaited<ReturnType<typeof fetchDbCounts>> | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchReviewCounts(), fetchDbCounts()])
      .then(([rc, dc]) => { setCounts(rc); setDbCounts(dc); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const grouped = counts?.counts.reduce<Record<string, { open: number; in_progress: number }>>((acc, row) => {
    const key = row.review_type;
    if (!acc[key]) acc[key] = { open: 0, in_progress: 0 };
    if (row.status === "open") acc[key].open = row.count;
    if (row.status === "in_progress") acc[key].in_progress = row.count;
    return acc;
  }, {}) ?? {};

  const activeQueues = Object.entries(grouped).filter(([, c]) => c.open + c.in_progress > 0);

  return (
    <div className="space-y-6">
      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Open Reviews", value: counts?.openTotal ?? 0, color: "text-orange-400", loading },
          { label: "Active Mappings", value: dbCounts?.active_mappings ?? 0, color: "text-emerald-400", loading },
          { label: "Source Records", value: dbCounts?.source_records ?? 0, color: "text-sky-400", loading },
          { label: "Canonical Products", value: dbCounts?.canonical_products ?? 0, color: "text-indigo-400", loading },
        ].map(({ label, value, color, loading: l }) => (
          <div key={label} className={`rounded-2xl border p-4 text-center ${at.card}`}>
            {l ? (
              <div className={`h-8 rounded-lg animate-pulse mx-auto ${isDark ? "bg-white/5" : "bg-gray-100"}`} />
            ) : (
              <p className={`text-2xl font-bold ${color}`}>{value.toLocaleString()}</p>
            )}
            <p className={`text-[11px] ${at.textMuted} mt-0.5`}>{label}</p>
          </div>
        ))}
      </div>

      {/* Active review queues */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className={`text-sm font-semibold ${at.textPrimary}`}>Resolution Queues</h2>
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className={`p-1.5 rounded-lg transition ${at.toggleBtn}`}
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {loading && (
          <div className="space-y-2 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`h-16 rounded-2xl ${isDark ? "bg-white/5" : "bg-gray-100"}`} />
            ))}
          </div>
        )}

        {!loading && activeQueues.length === 0 && (
          <div className={`rounded-2xl border p-8 text-center ${at.card}`}>
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className={`text-sm font-medium ${at.textPrimary}`}>All queues are clear</p>
            <p className={`text-xs ${at.textMuted} mt-1`}>
              No open review items. The database may not be populated yet.
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Link
                to="/admin/product-database"
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition ${at.filterActive} border-indigo-500/30`}
              >
                <Database className="w-3.5 h-3.5" />
                View Product Database
              </Link>
            </div>
          </div>
        )}

        {!loading && activeQueues.map(([type, { open, in_progress }]) => (
          <ResolutionQueueSection
            key={type}
            type={type}
            openCount={open}
            inProgressCount={in_progress}
            at={at}
            isDark={isDark}
            onResolved={() => setRefreshKey((k) => k + 1)}
          />
        ))}
      </div>

      {/* Architecture note */}
      <div className={`rounded-2xl border p-4 ${at.subCard} space-y-2`}>
        <div className="flex items-center gap-2">
          <Info className={`w-4 h-4 flex-shrink-0 ${at.textMuted}`} />
          <p className={`text-xs font-semibold ${at.textSec}`}>Architecture note — persistent mappings</p>
        </div>
        <p className={`text-xs ${at.textMuted} leading-relaxed`}>
          Every decision in this center is stored in{" "}
          <code className={`font-mono text-[11px] px-1 py-0.5 rounded ${isDark ? "bg-white/10" : "bg-black/10"}`}>product_identity_mappings</code>{" "}
          with the assigned_by, assigned_at, import_batch_id, and rules_version fields.
          Negative decisions (keep_separate, rejected_match) persist across all future imports
          and usage report resolutions. The system will never suggest the same incorrect merge again.
        </p>
        <p className={`text-xs ${at.textMuted} leading-relaxed`}>
          The three decision categories — Duplicate, Variant, Tonal Equivalent — must not be conflated.
          A 60ml tube and 120ml tube of the same color are Variants (same family, different SKU).
          Wella 7/3 and Loreal 7.3 are at most Tonal Equivalents (different products, similar color).
          Only identical commercial products in identical packaging are true Duplicates.
        </p>
      </div>
    </div>
  );
}

// ── Mapping lookup panel ──────────────────────────────────────────────────

function MappingLookupPanel({ at, isDark }: { at: ReturnType<typeof useAdminTheme>["at"]; isDark: boolean }) {
  const [name, setName] = useState("");
  const [result, setResult] = useState<{ name: string; normalizedName: string; mappings: DbMappingRow[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function lookup() {
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const r = await fetchMappingsByName(name);
      setResult(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lookup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`rounded-2xl border p-5 ${at.card} space-y-4`}>
      <div>
        <h2 className={`text-sm font-semibold ${at.textPrimary}`}>Persistent Mapping Lookup</h2>
        <p className={`text-xs ${at.textMuted} mt-0.5`}>
          Look up how any raw product name resolves to a canonical product via stored mappings.
        </p>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${at.textMuted}`} />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void lookup()}
            placeholder="Enter raw product name (e.g. 'Wella KP 8/3 60g')…"
            className={`w-full pl-8 pr-3 py-2.5 rounded-xl border text-sm outline-none ring-0 focus:ring-1 ${at.input}`}
          />
        </div>
        <button
          onClick={() => void lookup()}
          disabled={loading}
          className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition ${at.filterActive} border-indigo-500/30 disabled:opacity-50`}
        >
          {loading ? "…" : "Lookup"}
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      {result && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <p className={`text-xs font-medium ${at.textSec}`}>
              Results for "{result.name}"
            </p>
            <span className={`text-[11px] font-mono ${at.textFaint}`}>{result.normalizedName}</span>
          </div>

          {result.mappings.length === 0 ? (
            <div className={`rounded-xl p-4 border text-center ${at.subCard}`}>
              <p className={`text-sm ${at.textMuted}`}>No active mappings found.</p>
              <p className={`text-xs ${at.textFaint} mt-1`}>
                This name has not been mapped. It will be treated as unresolved in usage imports.
              </p>
            </div>
          ) : (
            result.mappings.map((m, i) => (
              <div key={i} className={`rounded-xl border p-3 space-y-1 ${at.subCard}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className={`text-sm font-medium ${at.textPrimary} truncate`}>
                      {m.canonical_product_name ?? (
                        <span className={at.textMuted}>No target — {String(m.mapping_type)}</span>
                      )}
                    </p>
                    <div className={`flex flex-wrap gap-x-3 text-[11px] ${at.textFaint} mt-0.5`}>
                      <span>Type: {String(m.mapping_type)}</span>
                      <span>Confidence: {String(m.confidence)}</span>
                      {m.assigned_by && <span>By: {String(m.assigned_by)}</span>}
                    </div>
                  </div>
                  <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] border whitespace-nowrap ${
                    m.mapping_type === "rejected_match" || m.mapping_type === "keep_separate"
                      ? "bg-red-500/15 text-red-400 border-red-500/20"
                      : m.validation_status === "approved"
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                      : "bg-amber-500/15 text-amber-400 border-amber-500/20"
                  }`}>
                    {String(m.validation_status)}
                  </span>
                </div>
                {m.notes && (
                  <p className={`text-xs ${at.textMuted} italic`}>"{String(m.notes)}"</p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────

type PageTab = "queue" | "lookup";

function ProductResolutionPageInner() {
  const { isDark, toggleTheme, at } = useAdminTheme();
  const [tab, setTab] = useState<PageTab>("queue");

  const TABS = [
    { id: "queue"  as PageTab, label: "Resolution Queue", icon: ShieldCheck },
    { id: "lookup" as PageTab, label: "Mapping Lookup",   icon: Search },
  ];

  return (
    <div className={`min-h-[100dvh] ${at.page}`}>
      {/* Header */}
      <div className={`sticky top-0 z-40 border-b ${at.stickyBorder} ${at.sticky} backdrop-blur-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <Link to="/admin" className={`flex items-center gap-1.5 text-xs ${at.textMuted} hover:${at.textSec} transition`}>
            <Home className="w-4 h-4" />
            Admin
          </Link>
          <span className={`text-xs ${at.textFaint}`}>/</span>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <h1 className={`text-sm font-semibold ${at.textPrimary}`}>Product Resolution Center</h1>
          </div>

          <Link
            to="/admin/product-database"
            className={`ml-auto flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition ${at.filterInactive}`}
          >
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            Product Database
          </Link>

          <button onClick={toggleTheme} className={`p-1.5 rounded-lg ${at.toggleBtn}`} title="Toggle theme">
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-3 flex items-center gap-2">
          <div className={`flex items-center gap-1 ${at.tabWrap} rounded-xl p-1 border`}>
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${tab === id ? at.tabActive : at.tabInactive}`}
              >
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            ))}
          </div>

          <span className={`ml-auto text-[10px] font-medium px-2 py-1 rounded-lg ${at.subCard} border`}>
            Persistent Mappings • Milestone 3
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {tab === "queue"  && <ResolutionOverview     at={at} isDark={isDark} />}
        {tab === "lookup" && <MappingLookupPanel     at={at} isDark={isDark} />}

        <div className="text-center py-6 mt-4">
          <p className={`text-[11px] ${at.textDim}`}>Spectra Product Resolution Center — Milestone 3</p>
        </div>
      </div>
    </div>
  );
}

export const ProductResolutionPage: React.FC = () => (
  <SiteThemeProvider>
    <ProductResolutionPageInner />
  </SiteThemeProvider>
);

export default ProductResolutionPage;
