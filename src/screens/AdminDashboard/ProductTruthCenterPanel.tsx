/**
 * ProductTruthWorkspace
 * ─────────────────────────────────────────────────────────────────────────
 * Full admin workspace for the canonical Product Truth system.
 *
 * Tabs:
 *   1. Overview  – funnel stats, type breakdown, top brands
 *   2. Search    – unified product search, filters, results, detail panel
 *   3. Review    – admin review queue for duplicates, conflicts, missing data
 *   4. AI Analyst – AI-assisted product analysis (requires ai-provider setup)
 *
 * Key principles:
 *   - Reads from catalog-first canonical artifacts (product-truth-*.json)
 *   - Search goes through the secure Netlify function, not raw JSON
 *   - Developers/oxidants are always visually separated from color shades
 *   - AI suggestions are clearly labeled; truth changes require admin approval
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Search, ShieldCheck, AlertTriangle, Eye, Package, Beaker, Scissors,
  Layers, Filter, ChevronDown, ChevronRight, X, RefreshCw, ExternalLink,
  CheckCircle, Circle, Info, BarChart3, Database, Cpu, Zap, Tag, Hash,
  Clock, BookOpen, Merge, SplitSquareHorizontal, ArrowRight,
} from "lucide-react";
import funnelData from "../../data/product-truth-funnel.json";
import reviewItemsData from "../../data/product-truth-review-items.json";

// ── Types ──────────────────────────────────────────────────────────────────

type ProductType =
  | "hair_color_shade" | "developer_oxidant" | "lightener_bleach"
  | "bond_builder" | "treatment_care" | "other";

type ValidationStatus =
  | "approved" | "suggested_match" | "needs_review" | "unresolved"
  | "rejected_duplicate" | "inactive";

interface SearchResult {
  id: string;
  score?: number;
  brand?: string;
  series?: string;
  shade?: string;
  shadeDesc?: string;
  productType?: ProductType;
  productTypeLabel?: string;
  validationStatus?: ValidationStatus;
  confidence?: "high" | "medium" | "low";
  active?: boolean;
  sourceCount?: number;
  aliasCount?: number;
  barcodes?: string[];
}

interface CanonicalProduct extends SearchResult {
  canonicalId?: string;
  displayBrand?: string;
  displaySeries?: string;
  displayShade?: string;
  familyShade?: string;
  productKind?: string;
  catalogType?: string;
  developerStrength?: { percent?: number; volume?: number; strengthKey?: string } | null;
  sizes?: number[];
  primarySizeGrams?: number | null;
  catalogNos?: string[];
  hairColor?: string;
  image?: string;
  hasBarcodes?: boolean;
  aliasCount?: number;
  duplicatesMerged?: number;
  reviewItemCount?: number;
  excludeFromShadeIntelligence?: boolean;
  isSupportingProduct?: boolean;
}

interface ReviewItem {
  reason: string;
  severity: "critical" | "high" | "medium" | "low";
  canonicalProductId?: string;
  description: string;
  details?: Record<string, unknown>;
}

interface FunnelData {
  generatedAt: string;
  totalCatalogRows: number;
  normalizedCatalogRows: number;
  exactDuplicatesMerged: number;
  aliasesMerged: number;
  canonicalProductsCreated: number;
  approvedCanonicalProducts: number;
  suggestedMatches: number;
  needsReview: number;
  inactive: number;
  unresolved: number;
  byProductType: Record<string, number>;
  byValidationStatus: Record<string, number>;
  topBrands: { brand: string; count: number }[];
  totalReviewItems: number;
  totalAliases: number;
  totalSources: number;
  buildDurationMs: number;
}

interface ThemeTokens {
  card: string;
  border: string;
  borderMed: string;
  text90: string;
  textPrimary: string;
  textSec: string;
  textMuted: string;
  textFaint: string;
  input: string;
  select: string;
  filterInactive: string;
  rowHover: string;
  subCard: string;
}

interface Props {
  isDark: boolean;
  at: ThemeTokens;
}

// ── Constants ──────────────────────────────────────────────────────────────

const SEARCH_API = "/.netlify/functions/product-truth-search";
const ACCESS_CODE = "070315";

const TYPE_CONFIG: Record<ProductType, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  hair_color_shade:  { label: "Hair Color Shade",    color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/25", icon: <Scissors className="w-3 h-3" /> },
  developer_oxidant: { label: "Developer / Oxidant",  color: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/25",  icon: <Beaker className="w-3 h-3" /> },
  lightener_bleach:  { label: "Lightener / Bleach",   color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/25", icon: <Layers className="w-3 h-3" /> },
  bond_builder:      { label: "Bond Builder",          color: "text-cyan-400",   bg: "bg-cyan-500/10",   border: "border-cyan-500/25",   icon: <Package className="w-3 h-3" /> },
  treatment_care:    { label: "Treatment / Care",      color: "text-emerald-400",bg: "bg-emerald-500/10",border: "border-emerald-500/25",icon: <Package className="w-3 h-3" /> },
  other:             { label: "Other",                  color: "text-gray-400",   bg: "bg-gray-500/10",   border: "border-gray-500/25",   icon: <Tag className="w-3 h-3" /> },
};

const STATUS_CONFIG: Record<ValidationStatus, { label: string; color: string; bg: string }> = {
  approved:           { label: "Approved",         color: "text-green-400",  bg: "bg-green-500/10"  },
  suggested_match:    { label: "Suggested Match",   color: "text-blue-400",   bg: "bg-blue-500/10"   },
  needs_review:       { label: "Needs Review",      color: "text-orange-400", bg: "bg-orange-500/10" },
  unresolved:         { label: "Unresolved",        color: "text-red-400",    bg: "bg-red-500/10"    },
  rejected_duplicate: { label: "Duplicate",         color: "text-gray-400",   bg: "bg-gray-500/10"   },
  inactive:           { label: "Inactive",           color: "text-gray-400",   bg: "bg-gray-500/10"   },
};

const SEVERITY_CONFIG = {
  critical: { label: "Critical", color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/30"    },
  high:     { label: "High",     color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30" },
  medium:   { label: "Medium",   color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
  low:      { label: "Low",      color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/30"   },
};

// ── Small helpers ──────────────────────────────────────────────────────────

function fmt(n: number) { return Number.isFinite(n) ? n.toLocaleString() : "—"; }
function pct(num: number, denom: number) {
  if (!denom) return "0%";
  return ((num / denom) * 100).toFixed(1) + "%";
}

function TypeBadge({ type }: { type?: ProductType }) {
  const cfg = TYPE_CONFIG[type as ProductType] || TYPE_CONFIG.other;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
}

function StatusBadge({ status }: { status?: ValidationStatus }) {
  const cfg = STATUS_CONFIG[status as ValidationStatus] || STATUS_CONFIG.unresolved;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${cfg.bg} ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

function ConfidenceDot({ confidence }: { confidence?: string }) {
  const color = confidence === "high" ? "bg-green-400" : confidence === "medium" ? "bg-yellow-400" : "bg-red-400";
  return <span className={`inline-block w-2 h-2 rounded-full ${color}`} title={`Confidence: ${confidence}`} />;
}

// ── Search hook ────────────────────────────────────────────────────────────

interface SearchState {
  results: SearchResult[];
  total: number;
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
}

function useProductSearch() {
  const [state, setState] = useState<SearchState>({ results: [], total: 0, loading: false, error: null, page: 1, limit: 50 });
  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback(async (q: string, typeFilter: string, statusFilter: string, page = 1) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const params = new URLSearchParams({
        action: "search",
        q,
        ...(typeFilter && { type: typeFilter }),
        ...(statusFilter && { status: statusFilter }),
        page: String(page),
        limit: "50",
      });
      const res = await fetch(`${SEARCH_API}?${params}`, {
        signal: controller.signal,
        headers: { "X-Access-Code": ACCESS_CODE },
      });
      if (!res.ok) throw new Error(`Search failed: ${res.status}`);
      const data = await res.json();
      setState({ results: data.results || [], total: data.total || 0, loading: false, error: null, page, limit: data.limit || 50 });
    } catch (err: unknown) {
      if ((err as { name?: string }).name === "AbortError") return;
      setState((s) => ({ ...s, loading: false, error: (err as Error).message }));
    }
  }, []);

  return { ...state, search };
}

async function fetchProduct(id: string): Promise<CanonicalProduct | null> {
  const params = new URLSearchParams({ action: "product", id });
  const res = await fetch(`${SEARCH_API}?${params}`, { headers: { "X-Access-Code": ACCESS_CODE } });
  if (!res.ok) return null;
  const data = await res.json();
  return data.product || null;
}

async function fetchAliases(id: string) {
  const params = new URLSearchParams({ action: "aliases", id });
  const res = await fetch(`${SEARCH_API}?${params}`, { headers: { "X-Access-Code": ACCESS_CODE } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.aliases || [];
}

async function fetchSources(id: string) {
  const params = new URLSearchParams({ action: "sources", id });
  const res = await fetch(`${SEARCH_API}?${params}`, { headers: { "X-Access-Code": ACCESS_CODE } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.sources || [];
}

// ── Tab: Overview ──────────────────────────────────────────────────────────

function OverviewTab({ at, isDark }: { at: ThemeTokens; isDark: boolean }) {
  const funnel = funnelData as unknown as FunnelData;
  const approvalRate = pct(funnel.approvedCanonicalProducts, funnel.canonicalProductsCreated);

  return (
    <div className="space-y-6">
      {/* Funnel header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Catalog Rows"
          value={fmt(funnel.totalCatalogRows)}
          sub="source records"
          color="text-gray-400"
          at={at}
        />
        <StatCard
          label="Canonical Identities"
          value={fmt(funnel.canonicalProductsCreated)}
          sub={`${fmt(funnel.exactDuplicatesMerged)} duplicates merged`}
          color="text-violet-400"
          at={at}
        />
        <StatCard
          label="Approved"
          value={fmt(funnel.approvedCanonicalProducts)}
          sub={approvalRate + " approval rate"}
          color="text-green-400"
          at={at}
        />
        <StatCard
          label="Aliases Found"
          value={fmt(funnel.totalAliases)}
          sub={`${fmt(funnel.suggestedMatches)} need review`}
          color="text-blue-400"
          at={at}
        />
      </div>

      {/* Funnel diagram */}
      <div className={`rounded-xl p-5 ${at.card} border ${at.border}`}>
        <h3 className={`text-sm font-semibold mb-4 ${at.textPrimary}`}>Product Truth Funnel</h3>
        <div className="space-y-2">
          {[
            { label: "Total catalog rows",          value: funnel.totalCatalogRows,           bar: 1.0,      color: "bg-gray-500/50" },
            { label: "Normalized rows",              value: funnel.normalizedCatalogRows,      bar: 1.0,      color: "bg-blue-500/50"   },
            { label: "Canonical identities created", value: funnel.canonicalProductsCreated,  bar: funnel.canonicalProductsCreated / funnel.totalCatalogRows, color: "bg-violet-500/50" },
            { label: "Approved identities",          value: funnel.approvedCanonicalProducts,  bar: funnel.approvedCanonicalProducts / funnel.totalCatalogRows, color: "bg-green-500/50" },
            { label: "Suggested matches",            value: funnel.suggestedMatches,           bar: funnel.suggestedMatches / funnel.totalCatalogRows, color: "bg-yellow-500/50" },
            { label: "Review items flagged",         value: funnel.totalReviewItems,           bar: funnel.totalReviewItems / funnel.totalCatalogRows, color: "bg-orange-500/50" },
          ].map(({ label, value, bar, color }) => (
            <div key={label} className="flex items-center gap-3">
              <div className={`text-xs ${at.textMuted} w-52 shrink-0`}>{label}</div>
              <div className="flex-1 h-5 rounded bg-white/5 relative overflow-hidden">
                <div className={`h-full rounded ${color} transition-all`} style={{ width: `${Math.min(100, bar * 100)}%` }} />
              </div>
              <div className={`text-xs font-mono ${at.text90} w-16 text-right`}>{fmt(value)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* By Product Type */}
        <div className={`rounded-xl p-5 ${at.card} border ${at.border}`}>
          <h3 className={`text-sm font-semibold mb-4 ${at.textPrimary}`}>By Product Type</h3>
          <div className="space-y-2.5">
            {Object.entries(funnel.byProductType || {})
              .sort((a, b) => b[1] - a[1])
              .map(([type, count]) => {
                const cfg = TYPE_CONFIG[type as ProductType] || TYPE_CONFIG.other;
                const bar = count / (funnel.canonicalProductsCreated || 1);
                return (
                  <div key={type} className="flex items-center gap-2">
                    <span className={`text-xs ${cfg.color} w-36 shrink-0`}>{cfg.label}</span>
                    <div className="flex-1 h-3 rounded bg-white/5">
                      <div className={`h-full rounded ${cfg.bg}`} style={{ width: `${bar * 100}%` }} />
                    </div>
                    <span className={`text-xs font-mono ${at.textSec} w-12 text-right`}>{fmt(count)}</span>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Top Brands */}
        <div className={`rounded-xl p-5 ${at.card} border ${at.border}`}>
          <h3 className={`text-sm font-semibold mb-4 ${at.textPrimary}`}>Top Brands</h3>
          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
            {(funnel.topBrands || []).slice(0, 20).map(({ brand, count }) => (
              <div key={brand} className="flex items-center justify-between text-xs">
                <span className={at.textSec + " truncate max-w-[180px]"}>{brand}</span>
                <span className={`font-mono ${at.textMuted}`}>{fmt(count)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Build info */}
      <div className={`text-xs ${at.textFaint} flex items-center gap-4`}>
        <span>Built: {new Date(funnel.generatedAt).toLocaleString()}</span>
        <span>•</span>
        <span>Duration: {funnel.buildDurationMs}ms</span>
        <span>•</span>
        <span>{fmt(funnel.totalSources)} source records preserved</span>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color, at }: { label: string; value: string; sub: string; color: string; at: ThemeTokens }) {
  return (
    <div className={`rounded-xl p-4 ${at.card} border ${at.border}`}>
      <div className={`text-xs font-medium ${at.textMuted} mb-1`}>{label}</div>
      <div className={`text-2xl font-bold font-mono ${color}`}>{value}</div>
      <div className={`text-xs ${at.textFaint} mt-1`}>{sub}</div>
    </div>
  );
}

// ── Tab: Search ────────────────────────────────────────────────────────────

function SearchTab({ at, isDark }: { at: ThemeTokens; isDark: boolean }) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<CanonicalProduct | null>(null);
  const [productAliases, setProductAliases] = useState<unknown[]>([]);
  const [productSources, setProductSources] = useState<unknown[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailTab, setDetailTab] = useState<"overview" | "aliases" | "sources">("overview");
  const { results, total, loading, error, search, page } = useProductSearch();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Trigger search on query/filter change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      search(query, typeFilter, statusFilter, 1);
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, typeFilter, statusFilter, search]);

  // Load detail on selection
  useEffect(() => {
    if (!selectedId) { setSelectedProduct(null); return; }
    setLoadingDetail(true);
    setDetailTab("overview");
    Promise.all([fetchProduct(selectedId), fetchAliases(selectedId), fetchSources(selectedId)])
      .then(([prod, aliases, sources]) => {
        setSelectedProduct(prod);
        setProductAliases(aliases);
        setProductSources(sources);
      })
      .finally(() => setLoadingDetail(false));
  }, [selectedId]);

  return (
    <div className="flex gap-4 h-full" style={{ minHeight: 600 }}>
      {/* Left: search + results */}
      <div className={`flex flex-col gap-3 ${selectedId ? "w-2/5" : "w-full"} transition-all`}>
        {/* Search input */}
        <div className={`flex items-center gap-2 rounded-xl px-3 py-2.5 ${at.input} border ${at.border}`}>
          <Search className={`w-4 h-4 ${at.textMuted} shrink-0`} />
          <input
            className={`flex-1 bg-transparent outline-none text-sm ${at.textPrimary} placeholder:${at.textFaint}`}
            placeholder="Search products, brands, shades, barcodes, aliases…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {loading && <RefreshCw className={`w-3.5 h-3.5 animate-spin ${at.textMuted}`} />}
          {query && <button onClick={() => setQuery("")}><X className={`w-3.5 h-3.5 ${at.textMuted}`} /></button>}
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={`text-xs rounded-lg px-2.5 py-1.5 ${at.select} border ${at.border} ${at.textSec}`}
          >
            <option value="">All types</option>
            {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`text-xs rounded-lg px-2.5 py-1.5 ${at.select} border ${at.border} ${at.textSec}`}
          >
            <option value="">All statuses</option>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>
        </div>

        {/* Results count */}
        {!loading && (
          <div className={`text-xs ${at.textMuted}`}>
            {total > 0 ? `${fmt(total)} products found${query ? ` for "${query}"` : ""}` : query ? "No results" : "All products"}
          </div>
        )}

        {error && <div className="text-xs text-red-400 p-2 rounded bg-red-500/10">{error}</div>}

        {/* Results list */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {results.map((r) => (
            <SearchResultRow
              key={r.id}
              result={r}
              selected={r.id === selectedId}
              onClick={() => setSelectedId(r.id === selectedId ? null : r.id)}
              at={at}
            />
          ))}
          {results.length === 0 && !loading && (
            <div className={`text-center py-12 ${at.textFaint} text-sm`}>
              {query ? "No products matched your search." : "Start typing to search products."}
            </div>
          )}
        </div>
      </div>

      {/* Right: detail panel */}
      {selectedId && (
        <div className={`flex-1 rounded-xl border ${at.border} ${at.subCard} overflow-y-auto`}>
          {loadingDetail ? (
            <div className={`flex items-center justify-center h-32 ${at.textMuted} text-sm gap-2`}>
              <RefreshCw className="w-4 h-4 animate-spin" />Loading…
            </div>
          ) : selectedProduct ? (
            <ProductDetailPanel
              product={selectedProduct}
              aliases={productAliases as AliasRecord[]}
              sources={productSources as SourceRecord[]}
              tab={detailTab}
              setTab={setDetailTab}
              onClose={() => setSelectedId(null)}
              at={at}
              isDark={isDark}
            />
          ) : (
            <div className={`flex items-center justify-center h-32 ${at.textMuted} text-sm`}>Product not found.</div>
          )}
        </div>
      )}
    </div>
  );
}

function SearchResultRow({ result, selected, onClick, at }: {
  result: SearchResult; selected: boolean; onClick: () => void; at: ThemeTokens;
}) {
  const typeCfg = TYPE_CONFIG[result.productType as ProductType] || TYPE_CONFIG.other;
  const statusCfg = STATUS_CONFIG[result.validationStatus as ValidationStatus] || STATUS_CONFIG.unresolved;
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-lg px-3 py-2.5 border transition-colors ${selected
        ? `border-violet-500/50 bg-violet-500/10`
        : `${at.border} hover:border-white/10 bg-transparent hover:bg-white/5`
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className={`text-xs font-medium truncate ${at.textPrimary}`}>
            {result.brand && <span className={at.textSec}>{result.brand} </span>}
            {result.series && <span>{result.series} </span>}
            {result.shade && <span className={typeCfg.color}>{result.shade}</span>}
          </div>
          {result.shadeDesc && <div className={`text-xs truncate ${at.textFaint}`}>{result.shadeDesc}</div>}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`text-xs ${statusCfg.color}`}>{result.active ? "" : "inactive"}</span>
          <ConfidenceDot confidence={result.confidence} />
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-1.5">
        <span className={`inline-flex items-center gap-0.5 text-xs ${typeCfg.color} ${typeCfg.bg} px-1.5 py-0.5 rounded`}>
          {typeCfg.icon}{typeCfg.label}
        </span>
        {result.aliasCount && result.aliasCount > 0
          ? <span className={`text-xs ${at.textFaint}`}>{result.aliasCount} aliases</span>
          : null}
        {result.sourceCount && result.sourceCount > 1
          ? <span className={`text-xs ${at.textFaint}`}>{result.sourceCount} sources</span>
          : null}
      </div>
    </button>
  );
}

// ── Product Detail Panel ───────────────────────────────────────────────────

interface AliasRecord {
  alias: string;
  aliasType: string;
  source?: string;
  confidence?: string;
}

interface SourceRecord {
  sourceId: string;
  matchMethod?: string;
  matchConfidence?: string;
  flag?: number;
  originalPayload?: {
    brand?: string; series?: string; shade?: string; type?: string;
    materialWeight?: number; barcodes?: string[]; catalogNo?: string;
    price?: number; image?: string; shadeDesc?: string;
  };
}

function ProductDetailPanel({
  product, aliases, sources, tab, setTab, onClose, at, isDark
}: {
  product: CanonicalProduct;
  aliases: AliasRecord[];
  sources: SourceRecord[];
  tab: "overview" | "aliases" | "sources";
  setTab: (t: "overview" | "aliases" | "sources") => void;
  onClose: () => void;
  at: ThemeTokens;
  isDark: boolean;
}) {
  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className={`text-sm font-semibold ${at.textPrimary}`}>
            {product.displayBrand || product.brand}
          </div>
          <div className={`text-base font-bold mt-0.5`}>
            {product.displaySeries || product.series}{" "}
            <span className={(TYPE_CONFIG[product.productType as ProductType] || TYPE_CONFIG.other).color}>
              {product.displayShade || product.shade}
            </span>
          </div>
          {product.shadeDesc && <div className={`text-xs ${at.textMuted} mt-0.5`}>{product.shadeDesc}</div>}
        </div>
        <button onClick={onClose} className={`p-1 rounded hover:bg-white/10 ${at.textMuted}`}><X className="w-4 h-4" /></button>
      </div>

      {/* Status row */}
      <div className="flex items-center gap-2 flex-wrap">
        <TypeBadge type={product.productType as ProductType} />
        <StatusBadge status={product.validationStatus as ValidationStatus} />
        <ConfidenceDot confidence={product.confidence} />
        {product.excludeFromShadeIntelligence && (
          <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/25">
            ⚠ Excluded from shade intelligence
          </span>
        )}
        {!product.active && (
          <span className={`text-xs ${at.textFaint} bg-gray-500/10 px-2 py-0.5 rounded`}>Inactive</span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/10">
        {(["overview", "aliases", "sources"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 text-xs font-medium rounded-t transition-colors capitalize
              ${tab === t ? "border-b-2 border-violet-400 text-violet-400" : `${at.textMuted} hover:${at.textSec}`}`}
          >
            {t}{t === "aliases" && aliases.length > 0 ? ` (${aliases.length})` : ""}{t === "sources" && sources.length > 0 ? ` (${sources.length})` : ""}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "overview" && (
        <div className="space-y-3">
          <DetailGrid rows={[
            { label: "Brand",          value: product.displayBrand || product.brand || "—" },
            { label: "Product Line",   value: product.displaySeries || product.series || "—" },
            { label: "Shade",          value: product.displayShade || product.shade || "—" },
            { label: "Shade Desc.",    value: product.shadeDesc || "—" },
            { label: "Family Shade",   value: product.familyShade || "—" },
            { label: "Product Type",   value: product.productTypeLabel || product.productType || "—" },
            { label: "Catalog Type",   value: product.catalogType || "—" },
            { label: "Size (g/ml)",    value: product.primarySizeGrams ? `${product.primarySizeGrams}g` : "—" },
            { label: "Confidence",     value: product.confidence || "—" },
            { label: "Active",         value: product.active ? "Yes" : "No" },
            { label: "Source Count",   value: String(product.sourceCount || 1) },
            { label: "Dupes Merged",   value: String(product.duplicatesMerged || 0) },
          ]} at={at} />
          {product.developerStrength && (
            <div className={`rounded-lg p-3 ${at.subCard} border ${at.border}`}>
              <div className={`text-xs font-medium ${at.textMuted} mb-2`}>Developer Strength</div>
              <div className="flex gap-4 text-sm">
                {product.developerStrength.percent != null && (
                  <span className="text-amber-400">{product.developerStrength.percent}%</span>
                )}
                {product.developerStrength.volume != null && (
                  <span className="text-amber-400">{product.developerStrength.volume} Vol</span>
                )}
              </div>
            </div>
          )}
          {product.barcodes && product.barcodes.length > 0 && (
            <div className={`rounded-lg p-3 ${at.subCard} border ${at.border}`}>
              <div className={`text-xs font-medium ${at.textMuted} mb-2`}>Barcodes ({product.barcodes.length})</div>
              <div className="flex flex-wrap gap-1.5">
                {product.barcodes.map((bc) => (
                  <span key={bc} className={`text-xs font-mono ${at.textSec} bg-white/5 px-2 py-0.5 rounded`}>{bc}</span>
                ))}
              </div>
            </div>
          )}
          {product.catalogNos && product.catalogNos.length > 0 && (
            <div className={`rounded-lg p-3 ${at.subCard} border ${at.border}`}>
              <div className={`text-xs font-medium ${at.textMuted} mb-2`}>Catalog Numbers</div>
              <div className="flex flex-wrap gap-1.5">
                {product.catalogNos.map((cn) => (
                  <span key={cn} className={`text-xs font-mono ${at.textSec} bg-white/5 px-2 py-0.5 rounded`}>{cn}</span>
                ))}
              </div>
            </div>
          )}
          {/* Canonical ID (expandable, advanced) */}
          <details className="text-xs">
            <summary className={`cursor-pointer ${at.textFaint} hover:${at.textMuted}`}>Advanced / Canonical ID</summary>
            <div className={`mt-2 p-2 rounded bg-black/20 font-mono text-xs ${at.textFaint} break-all`}>
              {product.canonicalId}
            </div>
          </details>
        </div>
      )}

      {tab === "aliases" && (
        <div className="space-y-2">
          {aliases.length === 0 ? (
            <div className={`text-sm ${at.textFaint} py-4 text-center`}>No aliases registered.</div>
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

      {tab === "sources" && (
        <div className="space-y-2">
          {sources.length === 0 ? (
            <div className={`text-sm ${at.textFaint} py-4 text-center`}>No source records.</div>
          ) : sources.map((s, i) => {
            const p = s.originalPayload || {};
            const flagLabels: Record<number, string> = { 0: "active", 1: "deleted", 2: "deprecated", 3: "barcode-conflict" };
            return (
              <div key={i} className={`rounded-lg px-3 py-2.5 ${at.subCard} border ${at.border} space-y-1`}>
                <div className="flex justify-between items-start">
                  <div className={`text-xs font-mono ${at.textSec} truncate max-w-[200px]`}>{s.sourceId}</div>
                  <span className={`text-xs ${s.flag === 0 ? "text-green-400" : "text-gray-400"}`}>
                    {flagLabels[s.flag || 0] || "unknown"}
                  </span>
                </div>
                <div className={`text-xs ${at.textMuted}`}>
                  {p.brand} / {p.series} / {p.shade}
                  {p.materialWeight ? ` · ${p.materialWeight}g` : ""}
                  {p.type ? ` · ${p.type}` : ""}
                </div>
                <div className={`text-xs ${at.textFaint}`}>Match: {s.matchMethod} · {s.matchConfidence}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DetailGrid({ rows, at }: { rows: { label: string; value: string }[]; at: ThemeTokens }) {
  return (
    <div className={`rounded-lg border ${at.border} overflow-hidden`}>
      {rows.map(({ label, value }, i) => (
        <div key={label} className={`flex text-xs ${i % 2 === 0 ? "bg-white/2" : ""} border-b border-white/5 last:border-0`}>
          <div className={`w-32 shrink-0 p-2 ${at.textMuted} font-medium`}>{label}</div>
          <div className={`flex-1 p-2 ${at.textSec}`}>{value}</div>
        </div>
      ))}
    </div>
  );
}

// ── Tab: Review Queue ──────────────────────────────────────────────────────

function ReviewTab({ at, isDark }: { at: ThemeTokens; isDark: boolean }) {
  const allItems = reviewItemsData as unknown as ReviewItem[];
  const [severityFilter, setSeverityFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const filtered = useMemo(
    () => allItems.filter((i) => !severityFilter || i.severity === severityFilter),
    [allItems, severityFilter]
  );

  const pageItems = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page]
  );

  const totalPages = Math.ceil(filtered.length / pageSize);

  const severityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const i of allItems) counts[i.severity] = (counts[i.severity] || 0) + 1;
    return counts;
  }, [allItems]);

  return (
    <div className="space-y-4">
      {/* Summary row */}
      <div className="flex gap-3 flex-wrap">
        {Object.entries(SEVERITY_CONFIG).map(([sev, cfg]) => (
          <button
            key={sev}
            onClick={() => { setSeverityFilter(f => f === sev ? "" : sev); setPage(1); }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors
              ${severityFilter === sev ? `${cfg.bg} ${cfg.color} ${cfg.border}` : `${at.border} ${at.textMuted} hover:border-white/20`}`}
          >
            {cfg.label} <span className={`font-mono ${severityFilter === sev ? cfg.color : at.textFaint}`}>{severityCounts[sev] || 0}</span>
          </button>
        ))}
        {severityFilter && (
          <button onClick={() => { setSeverityFilter(""); setPage(1); }}
            className={`text-xs ${at.textMuted} hover:${at.textSec}`}>
            <X className="w-3.5 h-3.5 inline mr-1" />Clear filter
          </button>
        )}
      </div>

      <div className={`text-xs ${at.textMuted}`}>
        {fmt(filtered.length)} review items{severityFilter ? ` (filtered: ${severityFilter})` : ""}
      </div>

      {/* Items list */}
      <div className="space-y-2">
        {pageItems.map((item, i) => {
          const cfg = SEVERITY_CONFIG[item.severity as keyof typeof SEVERITY_CONFIG] || SEVERITY_CONFIG.low;
          return (
            <div key={i} className={`rounded-xl border ${cfg.border} ${cfg.bg} p-4 space-y-2`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold ${cfg.color} uppercase tracking-wide`}>{item.severity}</span>
                  <span className={`text-xs font-mono ${at.textMuted}`}>{item.reason}</span>
                </div>
              </div>
              <div className={`text-sm ${at.textSec}`}>{item.description}</div>
              {item.canonicalProductId && (
                <div className={`text-xs font-mono ${at.textFaint} truncate`}>{item.canonicalProductId}</div>
              )}
              {item.details && Object.keys(item.details).length > 0 && (
                <details className="text-xs">
                  <summary className={`cursor-pointer ${at.textFaint}`}>Details</summary>
                  <pre className={`mt-1 p-2 rounded bg-black/20 text-xs ${at.textFaint} overflow-x-auto`}>
                    {JSON.stringify(item.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
            className={`px-3 py-1 text-xs rounded border ${at.border} ${at.textMuted} disabled:opacity-40`}>
            ← Prev
          </button>
          <span className={`text-xs ${at.textFaint}`}>Page {page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
            className={`px-3 py-1 text-xs rounded border ${at.border} ${at.textMuted} disabled:opacity-40`}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

// ── Tab: AI Analyst ────────────────────────────────────────────────────────

const AI_API = "/.netlify/functions/product-truth-ai";

const EXAMPLE_QUESTIONS = [
  { op: "find_duplicate_candidates", label: "Find duplicates for a product", placeholder: "e.g. Koleston Perfect 8/3" },
  { op: "explain_match",             label: "Explain why two products were matched", placeholder: "e.g. product IDs or names" },
  { op: "search_products",           label: "Search products by description", placeholder: "e.g. Wella 6% developer 1 liter" },
  { op: "classify_product",          label: "Suggest product type classification", placeholder: "e.g. paste a product name here" },
  { op: "analyze_usage",             label: "Analyze usage data", placeholder: "e.g. which color products were used most?" },
  { op: "prioritize_review_queue",   label: "Prioritize the review queue", placeholder: "Ask which items to tackle first" },
];

interface AIMessage {
  id: string;
  role: "user" | "assistant" | "error" | "system";
  text: string;
  operation?: string;
  evidence?: { type: string; referenceId: string; explanation: string }[];
  suggestion?: { type: string; targetProductId: string | null; reasoning: string };
  referencedProductIds?: string[];
  confidence?: number;
  loading?: boolean;
}

function AIAnalystTab({ at }: { at: ThemeTokens }) {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: "sys-0",
      role: "system",
      text: "Product Truth AI Analyst — Ask questions about products, duplicates, aliases, classification, and usage analysis. All operations are secure and read-only. The AI cannot make changes; it provides suggestions for admin review.",
    },
  ]);
  const [input, setInput] = useState("");
  const [operation, setOperation] = useState("search_products");
  const [loading, setLoading] = useState(false);
  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Check if AI is available on mount
  useEffect(() => {
    fetch(`${AI_API}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Access-Code": ACCESS_CODE },
      body: JSON.stringify({ operation: "search_products", query: "test" }),
    })
      .then((r) => {
        if (r.status === 503) setAiAvailable(false);
        else setAiAvailable(true);
      })
      .catch(() => setAiAvailable(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: AIMessage = { id: `u-${Date.now()}`, role: "user", text, operation };
    const loadingMsg: AIMessage = { id: `a-${Date.now()}`, role: "assistant", text: "", loading: true };
    setMessages((m) => [...m, userMsg, loadingMsg]);
    setInput("");
    setLoading(true);

    try {
      const body: Record<string, string> = { operation };
      if (operation === "search_products")       { body.query = text; }
      else if (operation === "analyze_usage")     { body.question = text; }
      else if (operation === "explain_match")     { body.question = text; }
      else if (operation === "find_duplicate_candidates") { body.query = text; }
      else if (operation === "classify_product")  { body.question = text; }
      else if (operation === "summarize_conflict"){ body.question = text; }
      else if (operation === "prioritize_review_queue") { body.question = text; }
      else                                        { body.question = text; }

      const res = await fetch(AI_API, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Access-Code": ACCESS_CODE },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages((m) => [
          ...m.slice(0, -1),
          { id: `err-${Date.now()}`, role: "error", text: data.error || "Request failed." },
        ]);
        return;
      }

      const result = data.result;
      setMessages((m) => [
        ...m.slice(0, -1),
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: result.answer || "(no answer)",
          operation,
          evidence: result.evidence,
          suggestion: result.suggestion?.type !== "none" ? result.suggestion : undefined,
          referencedProductIds: result.referencedProductIds,
          confidence: result.confidence,
        },
      ]);
    } catch (err) {
      setMessages((m) => [
        ...m.slice(0, -1),
        { id: `err-${Date.now()}`, role: "error", text: String((err as Error).message) },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, operation, loading]);

  return (
    <div className="flex flex-col" style={{ height: 600 }}>
      {/* Header */}
      <div className={`flex items-center gap-3 p-3 border-b ${at.border}`}>
        <div className="w-8 h-8 rounded-full bg-violet-500/10 border border-violet-500/25 flex items-center justify-center shrink-0">
          <Cpu className="w-4 h-4 text-violet-400" />
        </div>
        <div>
          <div className={`text-sm font-semibold ${at.textPrimary}`}>AI Product Analyst</div>
          <div className={`text-xs ${at.textFaint}`}>
            {aiAvailable === false
              ? "⚠ AI provider not configured — set AI_PROVIDER_API_KEY"
              : aiAvailable === true
              ? "✓ Connected — read-only, structured operations only"
              : "Checking…"}
          </div>
        </div>
        {/* Operation selector */}
        <select
          value={operation}
          onChange={(e) => setOperation(e.target.value)}
          className={`ml-auto text-xs rounded-lg px-2.5 py-1.5 ${at.select} border ${at.border} ${at.textSec}`}
        >
          {EXAMPLE_QUESTIONS.map((q) => (
            <option key={q.op} value={q.op}>{q.label}</option>
          ))}
        </select>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <AIMessageBubble key={msg.id} msg={msg} at={at} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className={`p-3 border-t ${at.border}`}>
        <div className={`flex gap-2 rounded-xl p-2 ${at.input} border ${at.border}`}>
          <input
            className={`flex-1 bg-transparent outline-none text-sm ${at.textPrimary} placeholder:${at.textFaint}`}
            placeholder={EXAMPLE_QUESTIONS.find((q) => q.op === operation)?.placeholder || "Ask a product question…"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}
            disabled={loading || aiAvailable === false}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading || aiAvailable === false}
            className="px-3 py-1.5 rounded-lg bg-violet-500/20 text-violet-400 text-xs font-medium disabled:opacity-40 hover:bg-violet-500/30 transition-colors"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Send"}
          </button>
        </div>
        <div className={`text-xs ${at.textFaint} mt-1.5 text-center`}>
          AI suggestions are read-only. Truth changes require explicit admin approval.
        </div>
      </div>
    </div>
  );
}

function AIMessageBubble({ msg, at }: { msg: AIMessage; at: ThemeTokens }) {
  if (msg.role === "system") {
    return (
      <div className={`text-xs ${at.textFaint} text-center py-1`}>{msg.text}</div>
    );
  }
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className={`max-w-xs rounded-xl px-3 py-2 bg-violet-500/15 border border-violet-500/25`}>
          <div className={`text-xs text-violet-300`}>{msg.text}</div>
          {msg.operation && (
            <div className="text-xs text-violet-400/50 mt-1 capitalize">{msg.operation.replace(/_/g, " ")}</div>
          )}
        </div>
      </div>
    );
  }
  if (msg.role === "error") {
    return (
      <div className="rounded-xl px-3 py-2 bg-red-500/10 border border-red-500/20">
        <div className="text-xs text-red-400">{msg.text}</div>
      </div>
    );
  }
  // Assistant message
  if (msg.loading) {
    return (
      <div className={`rounded-xl px-4 py-3 ${at.subCard} border ${at.border}`}>
        <div className="flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-violet-400" />
          <span className={`text-xs ${at.textMuted}`}>Analyzing…</span>
        </div>
      </div>
    );
  }
  return (
    <div className={`rounded-xl px-4 py-3 space-y-3 ${at.subCard} border ${at.border}`}>
      {/* Main answer */}
      <div className={`text-sm ${at.textSec} whitespace-pre-wrap`}>{msg.text}</div>

      {/* Confidence */}
      {msg.confidence !== undefined && (
        <div className="flex items-center gap-2">
          <ConfidenceDot confidence={msg.confidence >= 0.8 ? "high" : msg.confidence >= 0.5 ? "medium" : "low"} />
          <span className={`text-xs ${at.textFaint}`}>Confidence: {Math.round((msg.confidence || 0) * 100)}%</span>
        </div>
      )}

      {/* Suggestion (clearly labeled as suggestion, not fact) */}
      {msg.suggestion && (
        <div className="rounded-lg px-3 py-2 bg-blue-500/10 border border-blue-500/20">
          <div className="text-xs font-medium text-blue-400 mb-1">AI Suggestion (requires admin approval)</div>
          <div className={`text-xs ${at.textSec}`}>
            <span className="font-medium capitalize">{msg.suggestion.type?.replace(/_/g, " ")}</span>
            {msg.suggestion.targetProductId && ` → ${msg.suggestion.targetProductId}`}
          </div>
          {msg.suggestion.reasoning && (
            <div className={`text-xs ${at.textFaint} mt-1`}>{msg.suggestion.reasoning}</div>
          )}
        </div>
      )}

      {/* Evidence */}
      {msg.evidence && msg.evidence.length > 0 && (
        <details className="text-xs">
          <summary className={`cursor-pointer ${at.textFaint} hover:${at.textMuted}`}>
            Evidence ({msg.evidence.length})
          </summary>
          <div className="mt-2 space-y-1.5">
            {msg.evidence.map((ev, i) => (
              <div key={i} className={`p-2 rounded bg-black/20 ${at.textFaint}`}>
                <span className="font-medium">{ev.type}</span>
                {ev.referenceId && ev.referenceId !== "n/a" && <span> · {ev.referenceId}</span>}
                <div className="mt-0.5">{ev.explanation}</div>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Referenced products */}
      {msg.referencedProductIds && msg.referencedProductIds.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {msg.referencedProductIds.slice(0, 5).map((id) => (
            <span key={id} className={`text-xs font-mono ${at.textFaint} bg-white/5 px-2 py-0.5 rounded truncate max-w-[240px]`}>
              {id}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

type Tab = "overview" | "search" | "review" | "ai";

const TABS: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
  { id: "overview", label: "Overview",     icon: <BarChart3 className="w-3.5 h-3.5" /> },
  { id: "search",   label: "Search",        icon: <Search className="w-3.5 h-3.5" /> },
  { id: "review",   label: "Review Queue",  icon: <AlertTriangle className="w-3.5 h-3.5" />, badge: (reviewItemsData as unknown as ReviewItem[]).length },
  { id: "ai",       label: "AI Analyst",    icon: <Cpu className="w-3.5 h-3.5" /> },
];

export default function ProductTruthCenterPanel({ isDark, at }: Props) {
  const [tab, setTab] = useState<Tab>("overview");
  const funnel = funnelData as unknown as FunnelData;

  return (
    <div className="space-y-4">
      {/* Workspace header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-violet-400" />
            <h2 className={`text-base font-semibold ${at.textPrimary}`}>Product Truth Workspace</h2>
            <span className={`text-xs ${at.textFaint}`}>v2 · Catalog-first</span>
          </div>
          <p className={`text-xs ${at.textMuted} mt-0.5`}>
            {fmt(funnel.canonicalProductsCreated)} canonical identities from {fmt(funnel.totalCatalogRows)} catalog records
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs ${at.textFaint} flex items-center gap-1`}>
            <CheckCircle className="w-3 h-3 text-green-400" />
            {pct(funnel.approvedCanonicalProducts, funnel.canonicalProductsCreated)} approved
          </span>
        </div>
      </div>

      {/* Tab bar */}
      <div className={`flex gap-0.5 border-b ${at.border}`}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors rounded-t-md
              ${tab === t.id
                ? "border-b-2 border-violet-400 text-violet-400 bg-violet-500/5"
                : `${at.textMuted} hover:${at.textSec} hover:bg-white/5`
              }`}
          >
            {t.icon}{t.label}
            {t.badge ? (
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-mono
                ${tab === t.id ? "bg-violet-500/20 text-violet-300" : "bg-white/10 text-gray-400"}`}>
                {t.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {tab === "overview" && <OverviewTab at={at} isDark={isDark} />}
        {tab === "search"   && <SearchTab   at={at} isDark={isDark} />}
        {tab === "review"   && <ReviewTab   at={at} isDark={isDark} />}
        {tab === "ai"       && <AIAnalystTab at={at} />}
      </div>
    </div>
  );
}
