/**
 * src/screens/AdminDashboard/ProductDatabasePage.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * Canonical Product Database — /admin/product-database
 *
 * Milestone 3: New Pages Shell
 *
 * A first-class Data Intelligence surface for browsing, searching, and
 * managing the canonical product database. This is a database-first page —
 * all data comes from the Neon DB via the canonical-product-db Netlify
 * function. It does NOT read from static JSON artifacts.
 *
 * Tabs:
 *   All Products     — server-side search, filters, pagination, status chips
 *   Review Queue     — items needing human attention, grouped by type
 *   Import Batches   — history of controlled product imports
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Search, Filter, X, RefreshCw, ChevronLeft, ChevronRight,
  Database, ShieldCheck, AlertTriangle, Upload, Package,
  Eye, CheckCircle2, Clock, ArrowUpDown, ExternalLink,
  Layers, BookOpen, Zap, Sun, Moon, Home, ChevronDown,
  BarChart3, Tag, Info, Archive, ChevronRight as ChevronRightIcon,
  Unlink, ArrowRight, GitBranch, MoreHorizontal, History,
} from "lucide-react";
import { SiteThemeProvider, useSiteTheme } from "../../contexts/SiteTheme";
import {
  fetchDbCounts,
  fetchCanonicalProductList,
  fetchReviewCounts,
  fetchImportBatches,
  fetchCanonicalProduct,
  fetchProductSources,
  fetchSourcesSummary,
  type DbCounts,
  type ProductDetailResponse,
  type SourcesResponse,
  type DbProductListRow,
  type DbBatchRow,
  type SourcesSummaryResponse,
} from "../../lib/product-database/canonicalProductDbClient";
import { ActionModal, type ActionModalContext } from "./ActionModal";
import type {
  DbValidationStatus,
  EvidenceStatus,
} from "../../lib/types/canonicalDb";

// ── Theme tokens (same as AdminDashboard) ─────────────────────────────────

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
    filterPanel:   isDark ? "bg-white/[0.02] border-white/[0.06]"    : "bg-black/[0.02] border-black/[0.05]",
    filterActive:  isDark ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300" : "bg-indigo-50 border-indigo-200 text-indigo-700",
    filterInactive:isDark ? "bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-white/70" : "bg-white border-black/[0.08] text-[#888] hover:text-[#555]",
    toggleBtn:     isDark ? "bg-white/[0.06] hover:bg-white/[0.12] text-white/55 hover:text-white/70" : "bg-black/[0.04] hover:bg-black/[0.08] text-black/55 hover:text-black/70",
    spinner:       isDark ? "border-indigo-500/30 border-t-indigo-500" : "border-indigo-400/40 border-t-indigo-500",
  };
  return { isDark, toggleTheme, at };
}

// ── Validation status chip ────────────────────────────────────────────────

const VALIDATION_CHIP: Record<DbValidationStatus, { label: string; cls: string }> = {
  approved:     { label: "Approved",      cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
  candidate:    { label: "Candidate",     cls: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
  needs_review: { label: "Needs Review",  cls: "bg-orange-500/15 text-orange-400 border-orange-500/20" },
  rejected:     { label: "Rejected",      cls: "bg-red-500/15 text-red-400 border-red-500/20" },
  inactive:     { label: "Inactive",      cls: "bg-gray-500/15 text-gray-400 border-gray-500/20" },
};

const EVIDENCE_CHIP: Record<EvidenceStatus, { label: string; cls: string }> = {
  verified:           { label: "Verified",        cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
  partially_verified: { label: "Partial",         cls: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
  inferred:           { label: "Inferred",        cls: "bg-sky-500/15 text-sky-400 border-sky-500/20" },
  unresearched:       { label: "Unresearched",    cls: "bg-gray-500/15 text-gray-400 border-gray-500/20" },
  conflicting:        { label: "Conflicting",     cls: "bg-red-500/15 text-red-400 border-red-500/20" },
};

function StatusChip({ status, type }: { status: string; type: "validation" | "evidence" }) {
  const map = type === "validation" ? VALIDATION_CHIP : EVIDENCE_CHIP;
  const cfg = (map as Record<string, { label: string; cls: string }>)[status] ?? { label: status, cls: "bg-gray-500/15 text-gray-400 border-gray-500/20" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border whitespace-nowrap ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

// ── Expanded assigned-products view ──────────────────────────────────────

function ExpandedSourcesView({
  productId,
  canonicalProductName,
  at,
  isDark,
}: {
  productId: string;
  canonicalProductName?: string;
  at: ReturnType<typeof useAdminTheme>["at"];
  isDark: boolean;
}) {
  const [summary, setSummary] = useState<SourcesSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionCtx, setActionCtx] = useState<ActionModalContext | null>(null);

  function handleActionSuccess() {
    // Refresh the sources summary for this product after a successful action
    setLoading(true);
    setError(null);
    setActionCtx(null);
    fetchSourcesSummary(productId)
      .then((r) => { setSummary(r); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchSourcesSummary(productId)
      .then((r) => { setSummary(r); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [productId]);

  if (loading) {
    return (
      <div className={`px-6 py-4 ${isDark ? "bg-white/[0.015]" : "bg-black/[0.015]"} border-t ${at.border}`}>
        <div className="flex gap-2 animate-pulse">
          {[80, 120, 60, 90].map((w, i) => (
            <div key={i} className={`h-3 rounded ${isDark ? "bg-white/10" : "bg-gray-200"}`} style={{ width: w }} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`px-6 py-3 ${isDark ? "bg-red-900/10" : "bg-red-50"} border-t ${at.border}`}>
        <p className="text-xs text-red-400">{error || "Failed to load source records"}</p>
      </div>
    );
  }

  if (!summary) return null;

  const c = summary.counts;
  const sources = summary.sources;

  return (
    <>
    <tr>
      <td colSpan={9} className={`${isDark ? "bg-white/[0.015]" : "bg-slate-50/80"} border-t border-b ${at.border}`}>
        <div className="px-5 py-4">

          {/* Summary bar */}
          <div className={`flex flex-wrap gap-4 mb-4 pb-3 border-b ${at.border}`}>
            <div className="flex items-center gap-1.5">
              <Package className={`w-3.5 h-3.5 ${at.textMuted}`} />
              <span className={`text-xs font-semibold ${at.textPrimary}`}>{c.total_sources}</span>
              <span className={`text-xs ${at.textMuted}`}>source records</span>
            </div>
            {c.package_variants > 1 && (
              <div className="flex items-center gap-1.5">
                <Layers className={`w-3.5 h-3.5 text-amber-500`} />
                <span className={`text-xs font-semibold text-amber-500`}>{c.package_variants} package variants</span>
              </div>
            )}
            {c.total_aliases > 0 && (
              <div className="flex items-center gap-1.5">
                <Tag className={`w-3.5 h-3.5 ${at.textMuted}`} />
                <span className={`text-xs ${at.textMuted}`}>{c.total_aliases} aliases</span>
                {c.usage_aliases > 0 && <span className={`text-[10px] ${at.textFaint}`}>({c.usage_aliases} usage)</span>}
              </div>
            )}
            {c.total_mappings > 0 && (
              <div className="flex items-center gap-1.5">
                <GitBranch className={`w-3.5 h-3.5 ${at.textMuted}`} />
                <span className={`text-xs ${at.textMuted}`}>{c.total_mappings} mappings</span>
              </div>
            )}
            {c.inactive_sources > 0 && (
              <div className="flex items-center gap-1.5">
                <Archive className={`w-3.5 h-3.5 ${at.textFaint}`} />
                <span className={`text-xs ${at.textFaint}`}>{c.inactive_sources} inactive</span>
              </div>
            )}
          </div>

          {/* Package size warning */}
          {c.detected_sizes && c.detected_sizes.length > 1 && (
            <div className={`flex items-start gap-2 mb-3 p-2.5 rounded-lg border ${isDark ? "bg-amber-500/5 border-amber-500/15" : "bg-amber-50 border-amber-200"}`}>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-amber-500">Multiple package sizes detected</p>
                <p className={`text-[11px] ${at.textMuted}`}>
                  {c.detected_sizes.join(" · ")} — confirm these are distinct SKUs before merging.
                </p>
              </div>
            </div>
          )}

          {/* Source records table */}
          {sources.length > 0 ? (
            <div className={`rounded-xl border overflow-hidden ${at.subCard}`}>
              <table className="w-full text-[11px]">
                <thead>
                  <tr className={`border-b ${at.border} ${at.textFaint} uppercase tracking-wide`}>
                    <th className="text-left px-3 py-2">Source Name</th>
                    <th className="text-left px-3 py-2">System</th>
                    <th className="text-left px-3 py-2">Brand</th>
                    <th className="text-left px-3 py-2">Line</th>
                    <th className="text-left px-3 py-2">Shade</th>
                    <th className="text-left px-3 py-2">Size</th>
                    <th className="text-left px-3 py-2">Type</th>
                    <th className="text-left px-3 py-2">Status</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${at.rowDivide}`}>
                  {sources.map((src) => (
                    <tr key={src.id} className={at.rowHover}>
                      <td className={`px-3 py-2 font-medium ${at.textPrimary} max-w-[160px]`}>
                        <span className="truncate block" title={src.raw_product_name}>{src.raw_product_name}</span>
                        {src.source_product_id && (
                          <span className={`block text-[10px] ${at.textFaint}`}>#{src.source_product_id}</span>
                        )}
                      </td>
                      <td className={`px-3 py-2 ${at.textMuted}`}>
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] border ${at.subCard}`}>
                          {src.source_system.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className={`px-3 py-2 ${at.textSec} whitespace-nowrap`}>{src.raw_brand ?? "—"}</td>
                      <td className={`px-3 py-2 ${at.textMuted}`}>{src.raw_product_line ?? "—"}</td>
                      <td className={`px-3 py-2 ${at.textSec}`}>{src.raw_shade_code ?? "—"}</td>
                      <td className={`px-3 py-2 ${at.textMuted} whitespace-nowrap`}>
                        {src.raw_size ? `${src.raw_size}${src.raw_unit ? " " + src.raw_unit : ""}` : "—"}
                      </td>
                      <td className={`px-3 py-2 ${at.textMuted}`}>{src.raw_product_type ?? "—"}</td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                          src.raw_active_status === "active"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                        }`}>
                          {src.raw_active_status ?? "unknown"}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          <button
                            title="Detach from this canonical product"
                            className={`p-1 rounded ${at.toggleBtn} opacity-60 hover:opacity-100`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActionCtx({
                                kind: "detach",
                                sourceRecordId: src.id,
                                sourceRecordName: src.raw_product_name,
                                canonicalProductName,
                              });
                            }}
                          >
                            <Unlink className="w-3 h-3" />
                          </button>
                          <button
                            title="Move to another canonical product"
                            className={`p-1 rounded ${at.toggleBtn} opacity-60 hover:opacity-100`}
                            onClick={(e) => {
                              e.stopPropagation();
                              const target = window.prompt(
                                "Enter the target canonical product ID to reassign this source:\n(Tip: find the product ID in the All Products table)",
                              );
                              if (target?.trim()) {
                                setActionCtx({
                                  kind: "reassign",
                                  sourceRecordId: src.id,
                                  sourceRecordName: src.raw_product_name,
                                  canonicalProductName,
                                  targetCanonicalId: target.trim(),
                                });
                              }
                            }}
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                          <button
                            title="Make independent canonical product"
                            className={`p-1 rounded ${at.toggleBtn} opacity-60 hover:opacity-100`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActionCtx({
                                kind: "make-independent",
                                sourceRecordId: src.id,
                                sourceRecordName: src.raw_product_name,
                                canonicalProductName,
                              });
                            }}
                          >
                            <GitBranch className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {c.total_sources > 10 && (
                <div className={`px-3 py-2 border-t ${at.border} ${at.textFaint} text-[11px]`}>
                  Showing 10 of {c.total_sources} source records — open product detail to see all
                </div>
              )}
            </div>
          ) : (
            <p className={`text-xs ${at.textMuted} text-center py-4`}>No source records assigned yet</p>
          )}
        </div>
      </td>
    </tr>
    {actionCtx && (
      <ActionModal
        context={actionCtx}
        isDark={isDark}
        onClose={() => setActionCtx(null)}
        onSuccess={handleActionSuccess}
      />
    )}
    </>
  );
}

// ── Product detail drawer ─────────────────────────────────────────────────

function ProductDrawer({
  productId,
  onClose,
  at,
  isDark,
}: {
  productId: string | null;
  onClose: () => void;
  at: ReturnType<typeof useAdminTheme>["at"];
  isDark: boolean;
}) {
  const [data, setData] = useState<ProductDetailResponse | null>(null);
  const [sources, setSources] = useState<SourcesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"details" | "sources" | "aliases">("details");

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    setData(null);
    setSources(null);
    Promise.all([
      fetchCanonicalProduct(productId),
      fetchProductSources(productId, 1, 10),
    ]).then(([d, s]) => {
      setData(d);
      setSources(s);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [productId]);

  if (!productId) return null;

  const p = data?.product;

  return (
    <div className="fixed inset-0 z-50 flex">
      <button className="flex-1 bg-black/40" onClick={onClose} />
      <div className={`w-full max-w-xl flex flex-col ${isDark ? "bg-[#0d0d18]" : "bg-white"} border-l ${at.border} overflow-hidden`}>
        {/* Header */}
        <div className={`flex items-start justify-between px-5 py-4 border-b ${at.border} flex-shrink-0`}>
          <div>
            <p className={`text-xs font-medium mb-0.5 ${at.textMuted}`}>Canonical Product</p>
            {p && (
              <h2 className={`text-base font-semibold ${at.textPrimary} leading-snug`}>
                {p.canonical_name}
              </h2>
            )}
            {loading && <div className={`w-48 h-4 rounded animate-pulse ${isDark ? "bg-white/10" : "bg-gray-200"}`} />}
          </div>
          <button onClick={onClose} className={`p-1.5 rounded-lg mt-0.5 ${at.toggleBtn}`}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className={`flex gap-1 px-4 py-2 border-b ${at.border} flex-shrink-0`}>
          {(["details", "sources", "aliases"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${tab === t ? at.tabActive : at.tabInactive}`}
            >
              {t}
              {t === "sources" && sources && ` (${sources.total})`}
              {t === "aliases" && data && ` (${data.aliases.length})`}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading && (
            <div className="space-y-2 animate-pulse">
              {[...Array(6)].map((_, i) => (
                <div key={i} className={`h-8 rounded-lg ${isDark ? "bg-white/5" : "bg-gray-100"}`} />
              ))}
            </div>
          )}

          {!loading && p && tab === "details" && (
            <div className="space-y-4">
              <Section label="Identity">
                <Field label="Manufacturer" value={p.manufacturer_name} />
                <Field label="Product Line" value={p.product_line_name} />
                <Field label="Family" value={p.product_family_name} />
                <Field label="ID" value={p.id} mono />
              </Section>

              <Section label="Classification">
                <Field label="Product Type" value={p.primary_product_type} />
                <Field label="Category" value={p.product_category} />
                <Field label="Subcategory" value={p.product_subcategory} />
              </Section>

              <Section label="Package">
                <Field label="Size" value={
                  p.package_size_value
                    ? `${p.package_size_value}${p.package_size_unit ?? ""}`
                    : null
                } />
                <Field label="Original text" value={p.original_package_text} />
                <Field label="Use type" value={p.intended_use_type} />
                <Field label="Professional" value={p.professional_use ? "Yes" : "No"} />
              </Section>

              <Section label="Status">
                <div className="flex flex-wrap gap-2">
                  <StatusChip status={p.validation_status} type="validation" />
                  <StatusChip status={p.evidence_status} type="evidence" />
                  {p.active ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-500/15 text-gray-400 border border-gray-500/20">
                      <Archive className="w-3 h-3" /> Inactive
                    </span>
                  )}
                </div>
              </Section>

              <Section label="Counters">
                <div className={`grid grid-cols-3 gap-2`}>
                  {[
                    { label: "Sources", value: p.source_count },
                    { label: "Aliases",  value: p.alias_count },
                    { label: "Reviews",  value: p.review_item_count },
                  ].map(({ label, value }) => (
                    <div key={label} className={`rounded-xl p-3 border text-center ${at.subCard}`}>
                      <p className={`text-lg font-bold ${at.textPrimary}`}>{value ?? 0}</p>
                      <p className={`text-[10px] ${at.textMuted}`}>{label}</p>
                    </div>
                  ))}
                </div>
              </Section>
            </div>
          )}

          {!loading && tab === "sources" && sources && (
            <div className="space-y-2">
              <p className={`text-xs ${at.textMuted} mb-3`}>{sources.total} source records assigned to this canonical product.</p>
              {sources.sources.map((src, i) => (
                <div key={i} className={`rounded-xl p-3 border ${at.card} text-xs space-y-1`}>
                  <p className={`font-medium ${at.textPrimary}`}>{src.raw_product_name}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5">
                    <span className={at.textMuted}>{src.raw_brand}</span>
                    {src.raw_size && <span className={at.textMuted}>{src.raw_size}{src.raw_unit}</span>}
                    {src.raw_barcode && <span className={`font-mono ${at.textFaint}`}>{src.raw_barcode}</span>}
                    <span className={`font-mono ${at.textFaint}`}>{src.source_system}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && tab === "aliases" && data && (
            <div className="space-y-2">
              <p className={`text-xs ${at.textMuted} mb-3`}>{data.aliases.length} active aliases.</p>
              {data.aliases.map((alias, i) => (
                <div key={i} className={`rounded-xl p-3 border ${at.card} text-xs flex items-center justify-between`}>
                  <div>
                    <p className={`font-medium ${at.textPrimary}`}>{alias.alias}</p>
                    <p className={`${at.textFaint} font-mono text-[10px]`}>{alias.normalized_alias}</p>
                  </div>
                  <StatusChip status={alias.confidence} type="evidence" />
                </div>
              ))}
              {data.aliases.length === 0 && (
                <p className={`text-sm ${at.textMuted}`}>No aliases for this product.</p>
              )}
            </div>
          )}
        </div>

        {/* Footer — navigate to resolution center */}
        <div className={`px-4 py-3 border-t ${at.border} flex-shrink-0 flex items-center justify-between`}>
          <Link
            to="/admin/product-resolution"
            className={`text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition ${at.filterActive} border-indigo-500/30`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            View in Resolution Center
          </Link>
          <span className={`text-[10px] font-mono ${at.textFaint}`}>{productId.slice(0, 20)}</span>
        </div>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  const { at } = useAdminTheme();
  return (
    <div>
      <p className={`text-[10px] font-semibold uppercase tracking-wider ${at.textFaint} mb-2`}>{label}</p>
      <div className={`rounded-xl border p-3 space-y-2 ${at.subCard}`}>{children}</div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string | number | null | undefined; mono?: boolean }) {
  const { at } = useAdminTheme();
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-center justify-between gap-2">
      <span className={`text-xs flex-shrink-0 ${at.textMuted}`}>{label}</span>
      <span className={`text-xs text-right ${mono ? "font-mono" : ""} ${at.textPrimary} truncate max-w-[200px]`}>{String(value)}</span>
    </div>
  );
}

// ── All Products Tab ──────────────────────────────────────────────────────

function AllProductsTab({
  at,
  isDark,
  onOpenDrawer,
}: {
  at: ReturnType<typeof useAdminTheme>["at"];
  isDark: boolean;
  onOpenDrawer: (id: string) => void;
}) {
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [validationStatus, setValidationStatus] = useState("");
  const [productType, setProductType] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<DbProductListRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const LIMIT = 50;

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedQ(q);
      setPage(1);
    }, 300);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [q]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchCanonicalProductList({
        q: debouncedQ || undefined,
        validationStatus: (validationStatus as DbValidationStatus) || undefined,
        productType: productType || undefined,
        page,
        limit: LIMIT,
      });
      setItems(result.items);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [debouncedQ, validationStatus, productType, page]);

  useEffect(() => { void load(); }, [load]);

  const totalPages = Math.ceil(total / LIMIT) || 1;

  const PRODUCT_TYPES = [
    { value: "", label: "All Types" },
    { value: "hair_color_shade",  label: "Color Shade" },
    { value: "permanent_color",   label: "Permanent Color" },
    { value: "demi_permanent",    label: "Demi-Permanent Color" },
    { value: "acidic_toner",      label: "Acidic Toner / Gloss" },
    { value: "direct_dye",        label: "Direct Dye" },
    { value: "developer_oxidant", label: "Developer" },
    { value: "lightener_bleach",  label: "Lightener" },
    { value: "bond_builder",      label: "Bond Builder" },
    { value: "treatment_care",    label: "Treatment" },
    { value: "mixer_corrector",   label: "Mixer/Corrector" },
    { value: "other",             label: "Other" },
  ];

  function handleTableWheel(e: React.WheelEvent<HTMLDivElement>) {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      window.scrollBy({ top: e.deltaY, left: 0, behavior: "auto" });
    }
  }

  return (
    <div className="space-y-4">
      {/* Search + Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${at.textMuted}`} />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products…"
            className={`w-full pl-8 pr-8 py-2 rounded-xl border text-sm outline-none ring-0 focus:ring-1 ${at.input}`}
          />
          {q && (
            <button onClick={() => setQ("")} className={`absolute right-2.5 top-1/2 -translate-y-1/2 ${at.textMuted}`}>
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <select
          value={validationStatus}
          onChange={(e) => { setValidationStatus(e.target.value); setPage(1); }}
          className={`h-9 px-3 rounded-xl border text-sm outline-none ${at.select}`}
        >
          {["", "approved", "candidate", "needs_review", "rejected", "inactive"].map((s) => (
            <option key={s} value={s}>{s || "All Statuses"}</option>
          ))}
        </select>

        <select
          value={productType}
          onChange={(e) => { setProductType(e.target.value); setPage(1); }}
          className={`h-9 px-3 rounded-xl border text-sm outline-none ${at.select}`}
        >
          {PRODUCT_TYPES.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        <button
          onClick={() => void load()}
          className={`p-2 rounded-xl border ${at.filterInactive} transition`}
          title="Refresh"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>

        <span className={`text-xs ${at.textMuted} ml-auto`}>
          {total.toLocaleString()} products
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Table */}
      <div className={`rounded-2xl border overflow-hidden ${at.card}`}>
        <div className="overflow-x-auto overscroll-x-contain" onWheel={handleTableWheel}>
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b ${at.border} text-[11px] font-semibold uppercase tracking-wide ${at.textFaint}`}>
                <th className="w-8 px-2 py-3" />
                <th className="text-left px-4 py-3">Product</th>
                <th className="text-left px-4 py-3 whitespace-nowrap">Manufacturer</th>
                <th className="text-left px-4 py-3 whitespace-nowrap">Type</th>
                <th className="text-left px-4 py-3">Size</th>
                <th className="text-left px-4 py-3">Validation</th>
                <th className="text-left px-4 py-3">Evidence</th>
                <th className="text-center px-4 py-3">Sources</th>
                <th className="text-center px-4 py-3">Reviews</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className={`divide-y ${at.rowDivide}`}>
              {loading && !items.length && (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className={`animate-pulse`}>
                    {[...Array(10)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className={`h-4 rounded ${isDark ? "bg-white/5" : "bg-gray-100"} ${j === 1 ? "w-40" : j === 2 ? "w-24" : "w-16"}`} />
                      </td>
                    ))}
                  </tr>
                ))
              )}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={10} className={`px-4 py-12 text-center ${at.textMuted}`}>
                    {debouncedQ ? "No products match your search." : "No products in the database yet. Run the migration and import a source file."}
                  </td>
                </tr>
              )}
              {items.map((item) => (
                <React.Fragment key={item.id}>
                  <tr
                    className={`${at.rowHover} cursor-pointer transition group`}
                    onClick={() => onOpenDrawer(item.id)}
                  >
                    <td className="px-2 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedRowId(expandedRowId === item.id ? null : item.id);
                        }}
                        className={`p-1 rounded-lg transition ${at.toggleBtn} ${expandedRowId === item.id ? "opacity-100 text-indigo-400" : "opacity-50 hover:opacity-100"}`}
                        title={expandedRowId === item.id ? "Collapse source records" : "Expand source records"}
                      >
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform ${expandedRowId === item.id ? "rotate-0" : "-rotate-90"}`}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <p className={`font-medium ${at.textPrimary} max-w-[220px] truncate`}>{item.canonical_name}</p>
                      {item.product_line_name && (
                        <p className={`text-[11px] ${at.textFaint} truncate`}>{item.product_line_name}</p>
                      )}
                    </td>
                    <td className={`px-4 py-3 ${at.textSec} whitespace-nowrap text-xs`}>
                      {item.manufacturer_name}
                    </td>
                    <td className={`px-4 py-3 text-xs ${at.textMuted}`}>
                      <span className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-medium ${at.subCard}`}>
                        {item.primary_product_type.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-xs ${at.textMuted} whitespace-nowrap`}>
                      {item.package_size_value ? `${item.package_size_value}${item.package_size_unit ?? ""}` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusChip status={item.validation_status} type="validation" />
                    </td>
                    <td className="px-4 py-3">
                      <StatusChip status={item.evidence_status} type="evidence" />
                    </td>
                    <td className={`px-4 py-3 text-center text-xs font-medium ${at.textSec}`}>
                      {item.source_count}
                    </td>
                    <td className={`px-4 py-3 text-center text-xs`}>
                      {item.review_item_count > 0 ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-orange-500/15 text-orange-400 border border-orange-500/20">
                          {item.review_item_count}
                        </span>
                      ) : (
                        <span className={at.textFaint}>—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); onOpenDrawer(item.id); }}
                        className={`p-1 rounded-lg ${at.toggleBtn} opacity-0 group-hover:opacity-100`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                  {expandedRowId === item.id && (
                    <ExpandedSourcesView productId={item.id} canonicalProductName={item.canonical_name} at={at} isDark={isDark} />
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={`border-t px-4 py-3 flex items-center justify-between ${at.border}`}>
            <p className={`text-xs ${at.textFaint}`}>Page {page} of {totalPages}</p>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={`p-1.5 rounded-lg disabled:opacity-20 transition ${at.toggleBtn}`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className={`p-1.5 rounded-lg disabled:opacity-20 transition ${at.toggleBtn}`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Review Queue Tab ──────────────────────────────────────────────────────

function ReviewQueueTab({
  at,
  isDark,
}: {
  at: ReturnType<typeof useAdminTheme>["at"];
  isDark: boolean;
}) {
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchReviewCounts>> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchReviewCounts()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const REVIEW_TYPE_LABELS: Record<string, string> = {
    potential_duplicate:       "Potential Duplicates",
    uncertain_mapping:         "Uncertain Mappings",
    conflicting_barcode:       "Conflicting Barcodes",
    missing_manufacturer:      "Missing Manufacturer",
    missing_product_type:      "Missing Product Type",
    low_confidence_merge:      "Low Confidence Merges",
    unresolved_source:         "Unresolved Sources",
    manual_review_requested:   "Manual Review Requested",
  };

  const grouped = data?.counts.reduce<Record<string, { open: number; in_progress: number; resolved: number; dismissed: number }>>((acc, row) => {
    const key = row.review_type;
    if (!acc[key]) acc[key] = { open: 0, in_progress: 0, resolved: 0, dismissed: 0 };
    acc[key][row.status as "open" | "in_progress" | "resolved" | "dismissed"] = row.count;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className={`flex items-center justify-between`}>
        <div>
          <h3 className={`text-sm font-semibold ${at.textPrimary}`}>Open Review Items</h3>
          <p className={`text-xs ${at.textMuted}`}>Items needing human attention before canonical merges can proceed.</p>
        </div>
        {data && (
          <div className={`px-4 py-2 rounded-2xl border ${at.card} text-center`}>
            <p className={`text-2xl font-bold text-orange-400`}>{data.openTotal}</p>
            <p className={`text-[10px] ${at.textMuted}`}>Open</p>
          </div>
        )}
      </div>

      {loading && (
        <div className="space-y-2 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`h-16 rounded-xl ${isDark ? "bg-white/5" : "bg-gray-100"}`} />
          ))}
        </div>
      )}

      {!loading && !data?.openTotal && (
        <div className={`rounded-2xl border p-8 text-center ${at.card}`}>
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <p className={`text-sm font-medium ${at.textPrimary}`}>No open review items</p>
          <p className={`text-xs ${at.textMuted} mt-1`}>The database is clean or not yet populated.</p>
        </div>
      )}

      {!loading && grouped && Object.entries(grouped).map(([type, counts]) => {
        const open = counts.open + counts.in_progress;
        if (open === 0) return null;
        return (
          <div key={type} className={`rounded-2xl border p-4 ${at.card}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                <span className={`text-sm font-medium ${at.textPrimary}`}>
                  {REVIEW_TYPE_LABELS[type] ?? type}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {counts.in_progress > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/15 text-blue-400 border border-blue-500/20">
                    {counts.in_progress} in progress
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-500/15 text-orange-400 border border-orange-500/20">
                  {counts.open} open
                </span>
              </div>
            </div>
            <Link
              to="/admin/product-resolution"
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition w-fit ${at.filterActive} border-indigo-500/30`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Resolve in Resolution Center
            </Link>
          </div>
        );
      })}
    </div>
  );
}

// ── Import Batches Tab ────────────────────────────────────────────────────

function ImportBatchesTab({
  at,
  isDark,
}: {
  at: ReturnType<typeof useAdminTheme>["at"];
  isDark: boolean;
}) {
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchImportBatches>> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchImportBatches(20)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const STATUS_CHIP: Record<string, string> = {
    completed:              "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    completed_with_warnings:"bg-amber-500/15 text-amber-400 border-amber-500/20",
    importing:              "bg-blue-500/15 text-blue-400 border-blue-500/20",
    failed:                 "bg-red-500/15 text-red-400 border-red-500/20",
    rolled_back:            "bg-gray-500/15 text-gray-400 border-gray-500/20",
    created:                "bg-sky-500/15 text-sky-400 border-sky-500/20",
    preview_ready:          "bg-violet-500/15 text-violet-400 border-violet-500/20",
  };

  return (
    <div className="space-y-3">
      <p className={`text-xs ${at.textMuted}`}>
        History of controlled product imports. Source records are never deleted on rollback.
      </p>

      {loading && (
        <div className="space-y-2 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`h-16 rounded-xl ${isDark ? "bg-white/5" : "bg-gray-100"}`} />
          ))}
        </div>
      )}

      {!loading && (!data?.batches.length) && (
        <div className={`rounded-2xl border p-8 text-center ${at.card}`}>
          <Upload className={`w-8 h-8 mx-auto mb-2 ${at.textMuted}`} />
          <p className={`text-sm font-medium ${at.textPrimary}`}>No imports yet</p>
          <p className={`text-xs ${at.textMuted} mt-1`}>Use the import API to load your first product catalog.</p>
        </div>
      )}

      {data?.batches.map((batch, i) => (
        <div key={i} className={`rounded-2xl border p-4 ${at.card}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border whitespace-nowrap ${STATUS_CHIP[String(batch.status)] ?? "bg-gray-500/15 text-gray-400 border-gray-500/20"}`}>
                  {String(batch.status).replace(/_/g, " ")}
                </span>
                <span className={`text-xs ${at.textMuted}`}>{batch.source_type}</span>
              </div>
              <p className={`text-sm font-medium truncate ${at.textPrimary}`}>
                {batch.source_file ?? "Unknown source"}
              </p>
              <p className={`text-[11px] font-mono ${at.textFaint}`}>{String(batch.id ?? "").slice(0, 30)}</p>
            </div>
            <div className={`text-right flex-shrink-0 text-xs ${at.textMuted}`}>
              <p>{(batch.inserted_rows ?? 0).toLocaleString()} inserted</p>
              {(batch.review_rows ?? 0) > 0 && (
                <p className="text-orange-400">{batch.review_rows} review items</p>
              )}
              {(batch.invalid_rows ?? 0) > 0 && (
                <p className="text-red-400">{batch.invalid_rows} invalid</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Stats Bar ─────────────────────────────────────────────────────────────

function StatsBar({ at, isDark }: { at: ReturnType<typeof useAdminTheme>["at"]; isDark: boolean }) {
  const [counts, setCounts] = useState<DbCounts | null>(null);

  useEffect(() => {
    fetchDbCounts().then(setCounts).catch(() => {});
  }, []);

  const stats = counts ? [
    { label: "Canonical Products",  value: counts.canonical_products,  color: "text-indigo-400" },
    { label: "Source Records",      value: counts.source_records,       color: "text-sky-400" },
    { label: "Manufacturers",       value: counts.manufacturers,        color: "text-violet-400" },
    { label: "Active Aliases",      value: counts.active_aliases,       color: "text-emerald-400" },
    { label: "Open Reviews",        value: counts.open_review_items,    color: "text-orange-400" },
  ] : [];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {counts ? stats.map(({ label, value, color }) => (
        <div key={label} className={`rounded-2xl border p-4 text-center ${at.card}`}>
          <p className={`text-2xl font-bold ${color}`}>{(value ?? 0).toLocaleString()}</p>
          <p className={`text-[11px] ${at.textMuted} mt-0.5`}>{label}</p>
        </div>
      )) : (
        [...Array(5)].map((_, i) => (
          <div key={i} className={`rounded-2xl border p-4 h-20 animate-pulse ${isDark ? "bg-white/5 border-white/5" : "bg-gray-100 border-gray-200"}`} />
        ))
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────

type PageTab = "all" | "review" | "batches";

function ProductDatabasePageInner() {
  const { isDark, toggleTheme, at } = useAdminTheme();
  const [tab, setTab] = useState<PageTab>("all");
  const [drawerProductId, setDrawerProductId] = useState<string | null>(null);

  const TABS: { id: PageTab; label: string; icon: React.ElementType }[] = [
    { id: "all",     label: "All Products",   icon: Database },
    { id: "review",  label: "Review Queue",   icon: ShieldCheck },
    { id: "batches", label: "Import Batches", icon: Upload },
  ];

  return (
    <div className={`min-h-[100dvh] ${at.page}`}>
      {/* Header */}
      <div className={`sticky top-0 z-40 border-b ${at.stickyBorder} ${at.sticky} backdrop-blur-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          {/* Logo / back */}
          <Link to="/admin" className={`flex items-center gap-1.5 text-xs ${at.textMuted} hover:${at.textSec} transition mr-2`}>
            <Home className="w-4 h-4" />
            Admin
          </Link>
          <span className={`text-xs ${at.textFaint}`}>/</span>

          {/* Page title */}
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-400" />
            <h1 className={`text-sm font-semibold ${at.textPrimary}`}>Canonical Product Database</h1>
          </div>

          {/* Nav chip to resolution */}
          <Link
            to="/admin/product-resolution"
            className={`ml-auto flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition ${at.filterInactive}`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            Resolution Center
          </Link>

          {/* Theme toggle */}
          <button onClick={toggleTheme} className={`p-1.5 rounded-lg ${at.toggleBtn}`} title="Toggle theme">
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Inner tabs */}
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
            DB-first • Milestone 3
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <StatsBar at={at} isDark={isDark} />

        {tab === "all"     && <AllProductsTab     at={at} isDark={isDark} onOpenDrawer={(id) => setDrawerProductId(id)} />}
        {tab === "review"  && <ReviewQueueTab     at={at} isDark={isDark} />}
        {tab === "batches" && <ImportBatchesTab   at={at} isDark={isDark} />}

        <div className={`text-center py-6 mt-4`}>
          <p className={`text-[11px] ${at.textDim}`}>Spectra Canonical Product Database — Milestone 3</p>
        </div>
      </div>

      {/* Product drawer */}
      {drawerProductId && (
        <ProductDrawer
          productId={drawerProductId}
          onClose={() => setDrawerProductId(null)}
          at={at}
          isDark={isDark}
        />
      )}
    </div>
  );
}

export const ProductDatabasePage: React.FC = () => (
  <SiteThemeProvider>
    <ProductDatabasePageInner />
  </SiteThemeProvider>
);

export default ProductDatabasePage;
