/**
 * src/screens/AdminDashboard/shared/CanonicalProductDrawer.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * Shared canonical product detail drawer.
 *
 * Every admin surface that links to a product — Product Truth, Product
 * Catalog, Usage Imports, Beauty Intelligence, Review Queue, AI Analyst —
 * must open THIS component. Never build a separate product modal per tab.
 *
 * Sections:
 *   - overview   : identity, type, strength, barcodes, catalog numbers
 *   - aliases    : all known aliases + their source
 *   - sources    : original catalog records
 *   - usage      : usage report appearances (future)
 *   - review     : review items for this product
 *   - audit      : change history (future)
 */

import React, { useCallback, useEffect, useState } from "react";
import {
  X, RefreshCw, Beaker, Scissors, Layers, Package, Tag,
  CheckCircle, AlertTriangle, ChevronRight,
} from "lucide-react";
import type {
  CanonicalProduct, ProductAlias, CatalogProductSource,
  ProductReviewItem, ProductType, ValidationStatus,
} from "../../../lib/types/productTruth";
import {
  getProductDetail, getProductAliases, getProductSources,
} from "../../../lib/product-truth/productTruthRepository";

// ── Types ──────────────────────────────────────────────────────────────────

export type DrawerSection = "overview" | "aliases" | "sources" | "usage" | "review" | "audit";

export interface CanonicalProductDrawerProps {
  canonicalId: string | null;
  initialSection?: DrawerSection;
  onClose: () => void;
  /** Optional review items for this product (pre-loaded by caller) */
  reviewItems?: ProductReviewItem[];
  /** Theme tokens from parent admin */
  at: {
    card: string; border: string; borderMed: string;
    textPrimary: string; text90: string; textSec: string;
    textMuted: string; textFaint: string; subCard: string;
    rowHover: string;
  };
  isDark: boolean;
}

// ── Type display config ────────────────────────────────────────────────────

const TYPE_CFG: Record<ProductType, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  hair_color_shade:  { label: "Hair Color Shade",   color: "text-violet-400", bg: "bg-violet-500/10",  border: "border-violet-500/25",  icon: <Scissors className="w-3 h-3" /> },
  permanent_color:   { label: "Permanent Color",     color: "text-violet-400", bg: "bg-violet-500/10",  border: "border-violet-500/25",  icon: <Scissors className="w-3 h-3" /> },
  demi_permanent:    { label: "Demi-Permanent",      color: "text-violet-400", bg: "bg-violet-500/10",  border: "border-violet-500/25",  icon: <Scissors className="w-3 h-3" /> },
  acidic_toner:      { label: "Acidic Toner / Gloss",color: "text-violet-400", bg: "bg-violet-500/10",  border: "border-violet-500/25",  icon: <Scissors className="w-3 h-3" /> },
  direct_dye:        { label: "Direct Dye",          color: "text-violet-400", bg: "bg-violet-500/10",  border: "border-violet-500/25",  icon: <Scissors className="w-3 h-3" /> },
  developer_oxidant: { label: "Developer / Oxidant", color: "text-amber-400",  bg: "bg-amber-500/10",   border: "border-amber-500/25",   icon: <Beaker className="w-3 h-3" /> },
  lightener_bleach:  { label: "Lightener / Bleach",  color: "text-yellow-400", bg: "bg-yellow-500/10",  border: "border-yellow-500/25",  icon: <Layers className="w-3 h-3" /> },
  bond_builder:      { label: "Bond Builder",         color: "text-cyan-400",   bg: "bg-cyan-500/10",    border: "border-cyan-500/25",    icon: <Package className="w-3 h-3" /> },
  treatment_care:    { label: "Treatment / Care",     color: "text-emerald-400",bg: "bg-emerald-500/10", border: "border-emerald-500/25", icon: <Package className="w-3 h-3" /> },
  mixer_corrector:   { label: "Mixer / Corrector",    color: "text-pink-400",   bg: "bg-pink-500/10",    border: "border-pink-500/25",    icon: <Beaker className="w-3 h-3" /> },
  other:             { label: "Other",                color: "text-gray-400",   bg: "bg-gray-500/10",    border: "border-gray-500/25",    icon: <Tag className="w-3 h-3" /> },
};

const STATUS_CFG: Record<ValidationStatus, { label: string; color: string }> = {
  approved:           { label: "Approved",       color: "text-green-400"  },
  suggested_match:    { label: "Suggested Match", color: "text-blue-400"   },
  needs_review:       { label: "Needs Review",   color: "text-orange-400" },
  unresolved:         { label: "Unresolved",     color: "text-red-400"    },
  rejected_duplicate: { label: "Duplicate",      color: "text-gray-400"   },
  inactive:           { label: "Inactive",       color: "text-gray-400"   },
};

const SEV_CFG = {
  critical: { color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/25"    },
  high:     { color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/25" },
  medium:   { color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/25" },
  low:      { color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/25"   },
};

// ── Sub-components ─────────────────────────────────────────────────────────

function TypeBadge({ type }: { type?: ProductType }) {
  const cfg = TYPE_CFG[type as ProductType] || TYPE_CFG.other;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
}

function StatusBadge({ status }: { status?: ValidationStatus }) {
  const cfg = STATUS_CFG[status as ValidationStatus] || STATUS_CFG.unresolved;
  return <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>;
}

function ConfidenceDot({ confidence }: { confidence?: string }) {
  const color = confidence === "high" ? "bg-green-400" : confidence === "medium" ? "bg-yellow-400" : "bg-red-400";
  return <span className={`inline-block w-2 h-2 rounded-full ${color}`} title={`Confidence: ${confidence}`} />;
}

function DetailRow({ label, value, at }: { label: string; value: string; at: CanonicalProductDrawerProps["at"] }) {
  return (
    <div className={`flex text-xs border-b border-white/5 last:border-0`}>
      <div className={`w-32 shrink-0 p-2 ${at.textMuted} font-medium`}>{label}</div>
      <div className={`flex-1 p-2 ${at.textSec}`}>{value}</div>
    </div>
  );
}

// ── Main drawer ────────────────────────────────────────────────────────────

export function CanonicalProductDrawer({
  canonicalId, initialSection = "overview", onClose, reviewItems = [], at, isDark,
}: CanonicalProductDrawerProps) {
  const [section, setSection] = useState<DrawerSection>(initialSection);
  const [product, setProduct] = useState<CanonicalProduct | null>(null);
  const [aliases, setAliases] = useState<ProductAlias[]>([]);
  const [sources, setSources] = useState<CatalogProductSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const [detail, aliasRes, sourceRes] = await Promise.all([
        getProductDetail(id),
        getProductAliases(id),
        getProductSources(id),
      ]);
      setProduct(detail.product);
      setAliases(aliasRes.aliases || []);
      setSources(sourceRes.sources || []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (canonicalId) load(canonicalId);
    else { setProduct(null); setAliases([]); setSources([]); }
  }, [canonicalId, load]);

  useEffect(() => {
    setSection(initialSection);
  }, [initialSection]);

  if (!canonicalId) return null;

  const SECTIONS: { id: DrawerSection; label: string; badge?: number }[] = [
    { id: "overview", label: "Overview" },
    { id: "aliases",  label: "Aliases",  badge: aliases.length || undefined },
    { id: "sources",  label: "Sources",  badge: sources.length || undefined },
    { id: "usage",    label: "Usage" },
    { id: "review",   label: "Review",   badge: reviewItems.length || undefined },
    { id: "audit",    label: "Audit" },
  ];

  const typeCfg = TYPE_CFG[product?.productType as ProductType] || TYPE_CFG.other;

  return (
    <div className={`h-full flex flex-col overflow-hidden rounded-xl border ${at.border} ${at.card}`}>
      {/* Header */}
      <div className={`px-4 py-3 border-b ${at.border} flex items-start justify-between`}>
        <div className="flex-1 min-w-0">
          {loading && !product ? (
            <div className={`flex items-center gap-2 ${at.textMuted} text-sm`}>
              <RefreshCw className="w-4 h-4 animate-spin" /> Loading product…
            </div>
          ) : product ? (
            <>
              <div className={`text-xs ${at.textMuted}`}>{product.displayBrand || product.brand}</div>
              <div className={`text-base font-bold leading-tight`}>
                {product.displaySeries || product.series}{" "}
                <span className={typeCfg.color}>{product.displayShade || product.shade}</span>
              </div>
              {product.shadeDesc && <div className={`text-xs ${at.textFaint} mt-0.5`}>{product.shadeDesc}</div>}
            </>
          ) : error ? (
            <div className="text-xs text-red-400">{error}</div>
          ) : null}
        </div>
        <button onClick={onClose} className={`ml-2 p-1.5 rounded-lg hover:bg-white/10 ${at.textMuted} flex-shrink-0`}>
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Status bar */}
      {product && (
        <div className={`px-4 py-2 border-b ${at.border} flex items-center gap-2 flex-wrap`}>
          <TypeBadge type={product.productType} />
          <StatusBadge status={product.validationStatus} />
          <ConfidenceDot confidence={product.confidence} />
          {product.excludeFromShadeIntelligence && (
            <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/25">
              Excluded from shade intel
            </span>
          )}
          {!product.active && (
            <span className={`text-xs ${at.textFaint} bg-gray-500/10 px-2 py-0.5 rounded`}>Inactive</span>
          )}
        </div>
      )}

      {/* Section tabs */}
      <div className={`flex gap-0.5 border-b ${at.border} px-3 pt-1 overflow-x-auto`}>
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-t whitespace-nowrap transition-colors capitalize
              ${section === s.id ? "border-b-2 border-violet-400 text-violet-400" : `${at.textMuted} hover:${at.textSec}`}`}
          >
            {s.label}
            {s.badge ? <span className={`ml-1 px-1 rounded text-[10px] ${section === s.id ? "bg-violet-500/20" : "bg-white/10"}`}>{s.badge}</span> : null}
          </button>
        ))}
      </div>

      {/* Section content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading && !product ? (
          <div className={`flex items-center justify-center h-24 ${at.textMuted} gap-2 text-sm`}>
            <RefreshCw className="w-4 h-4 animate-spin" />Loading…
          </div>
        ) : !product && !loading ? (
          <div className={`text-sm ${at.textFaint} text-center py-8`}>{error || "Product not found."}</div>
        ) : product ? (
          <>
            {section === "overview" && (
              <div className="space-y-3">
                <div className={`rounded-lg border ${at.border} overflow-hidden`}>
                  <DetailRow label="Brand"         value={product.displayBrand || product.brand || "—"} at={at} />
                  <DetailRow label="Product Line"  value={product.displaySeries || product.series || "—"} at={at} />
                  <DetailRow label="Shade"         value={product.displayShade || product.shade || "—"} at={at} />
                  {product.shadeDesc && <DetailRow label="Shade Desc." value={product.shadeDesc} at={at} />}
                  {product.familyShade && <DetailRow label="Family Shade" value={product.familyShade} at={at} />}
                  <DetailRow label="Product Type"  value={product.productTypeLabel || product.productType || "—"} at={at} />
                  <DetailRow label="Catalog Type"  value={product.catalogType || "—"} at={at} />
                  {product.primarySizeGrams != null && <DetailRow label="Size" value={`${product.primarySizeGrams}g`} at={at} />}
                  <DetailRow label="Active"        value={product.active ? "Yes" : "No"} at={at} />
                  <DetailRow label="Confidence"    value={product.confidence} at={at} />
                  <DetailRow label="Sources"       value={String(product.sourceCount || 1)} at={at} />
                  <DetailRow label="Dupes merged"  value={String(product.duplicatesMerged || 0)} at={at} />
                </div>
                {product.developerStrength && (
                  <div className={`rounded-lg p-3 ${at.subCard} border ${at.border}`}>
                    <div className={`text-xs font-medium ${at.textMuted} mb-1.5`}>Developer Strength</div>
                    <div className="flex gap-4">
                      {product.developerStrength.percent != null && <span className="text-amber-400 text-sm">{product.developerStrength.percent}%</span>}
                      {product.developerStrength.volume  != null && <span className="text-amber-400 text-sm">{product.developerStrength.volume} Vol</span>}
                    </div>
                  </div>
                )}
                {product.barcodes.length > 0 && (
                  <div className={`rounded-lg p-3 ${at.subCard} border ${at.border}`}>
                    <div className={`text-xs font-medium ${at.textMuted} mb-1.5`}>Barcodes ({product.barcodes.length})</div>
                    <div className="flex flex-wrap gap-1.5">
                      {product.barcodes.map((bc) => (
                        <span key={bc} className={`text-xs font-mono ${at.textSec} bg-white/5 px-2 py-0.5 rounded`}>{bc}</span>
                      ))}
                    </div>
                  </div>
                )}
                {product.catalogNos.length > 0 && (
                  <div className={`rounded-lg p-3 ${at.subCard} border ${at.border}`}>
                    <div className={`text-xs font-medium ${at.textMuted} mb-1.5`}>Catalog Numbers</div>
                    <div className="flex flex-wrap gap-1.5">
                      {product.catalogNos.map((cn) => (
                        <span key={cn} className={`text-xs font-mono ${at.textSec} bg-white/5 px-2 py-0.5 rounded`}>{cn}</span>
                      ))}
                    </div>
                  </div>
                )}
                <details className="text-xs">
                  <summary className={`cursor-pointer ${at.textFaint}`}>Canonical ID</summary>
                  <div className={`mt-1 p-2 rounded bg-black/20 font-mono text-xs ${at.textFaint} break-all`}>{product.canonicalId}</div>
                </details>
              </div>
            )}

            {section === "aliases" && (
              <div className="space-y-2">
                {aliases.length === 0 ? (
                  <div className={`text-sm ${at.textFaint} py-8 text-center`}>No aliases registered.</div>
                ) : aliases.map((a, i) => (
                  <div key={i} className={`flex items-start justify-between rounded-lg px-3 py-2 ${at.subCard} border ${at.border}`}>
                    <div>
                      <div className={`text-sm ${at.textPrimary}`}>{a.alias}</div>
                      <div className={`text-xs ${at.textFaint}`}>{a.aliasType} · {a.source || "catalog"}</div>
                    </div>
                    <ConfidenceDot confidence={a.confidence} />
                  </div>
                ))}
              </div>
            )}

            {section === "sources" && (
              <div className="space-y-2">
                {sources.length === 0 ? (
                  <div className={`text-sm ${at.textFaint} py-8 text-center`}>No source records.</div>
                ) : sources.map((s, i) => {
                  const p = s.originalPayload;
                  const flagLabel = ["active", "deleted", "deprecated", "barcode-conflict"][s.flag || 0] || "unknown";
                  return (
                    <div key={i} className={`rounded-lg px-3 py-2.5 ${at.subCard} border ${at.border} space-y-0.5`}>
                      <div className="flex justify-between items-start">
                        <div className={`text-xs font-mono ${at.textSec} truncate max-w-[200px]`}>{s.sourceId}</div>
                        <span className={`text-xs ${s.flag === 0 ? "text-green-400" : "text-gray-400"}`}>{flagLabel}</span>
                      </div>
                      <div className={`text-xs ${at.textMuted}`}>
                        {p?.brand} / {p?.series} / {p?.shade}
                        {p?.materialWeight ? ` · ${p.materialWeight}g` : ""}
                        {p?.type ? ` · ${p.type}` : ""}
                      </div>
                      <div className={`text-xs ${at.textFaint}`}>{s.matchMethod} · {s.matchConfidence}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {section === "usage" && (
              <div className={`text-sm ${at.textFaint} py-8 text-center`}>
                Usage report appearances will appear here after usage imports are connected to canonical resolution.
              </div>
            )}

            {section === "review" && (
              <div className="space-y-2">
                {reviewItems.length === 0 ? (
                  <div className={`flex items-center gap-2 text-sm ${at.textMuted} py-4`}>
                    <CheckCircle className="w-4 h-4 text-green-400" />No review items for this product.
                  </div>
                ) : reviewItems.map((item, i) => {
                  const cfg = SEV_CFG[item.severity as keyof typeof SEV_CFG] || SEV_CFG.low;
                  return (
                    <div key={i} className={`rounded-lg border ${cfg.border} ${cfg.bg} p-3 space-y-1`}>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`w-3.5 h-3.5 ${cfg.color}`} />
                        <span className={`text-xs font-semibold ${cfg.color} capitalize`}>{item.severity}</span>
                        <span className={`text-xs font-mono ${at.textFaint}`}>{item.reason}</span>
                      </div>
                      <div className={`text-xs ${at.textSec}`}>{item.description}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {section === "audit" && (
              <div className={`text-sm ${at.textFaint} py-8 text-center`}>
                Audit log will be available after Neon persistence is connected.
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}

export default CanonicalProductDrawer;
