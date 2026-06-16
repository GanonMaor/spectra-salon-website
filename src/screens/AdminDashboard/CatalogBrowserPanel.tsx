/**
 * CatalogBrowserPanel
 * ─────────────────────────────────────────────────────────────────
 * Admin Product Catalog browser.
 *
 * Loads the pre-processed product catalog truth:
 *   - 32 K+ products deduplicated and normalised from the master XLSX
 *   - Grouped by brand → series
 *   - Each color/toner product has a shade description decoded from
 *     the shade notation (L'Oréal dot-system, Wella slash, Schwarzkopf
 *     dash, Redken alpha-numeric, etc.)
 *
 * Flags:
 *   0 = active
 *   1 = deleted (was in TO DEL. brand)
 *   2 = deprecated (TO REPLACE, superseded by a newer entry)
 *   3 = barcode conflict (same barcode shared across entries)
 */

import React, { useCallback, useMemo, useState } from "react";
import {
  Search, X, Package, ChevronRight, ChevronDown,
  Trash2, Archive, Shuffle, BarChart3, Layers,
} from "lucide-react";
import catalogIndex from "../../data/catalog-truth-index.json";

// ── Types ──────────────────────────────────────────────────────────────────

interface CatalogProduct {
  id: string;
  brand: string;
  series: string;
  familyShade: string;
  shade: string;
  type: string;
  rawType: string;
  productKind: string;
  catalogNo: string;
  image: string;
  hairColor: string;
  packingWeight: number | null;
  materialWeight: number | null;
  price: number;
  barcodeCount: number;
  barcode: string;
  barcodes: string[];
  verificationUrl: string;
  flag: 0 | 1 | 2 | 3;
  shadeDesc: string;
}

interface BrandSeriesInfo {
  series: string;
  count: number;
}

interface BrandInfo {
  brand: string;
  slug: string;
  totalCount: number;
  series: BrandSeriesInfo[];
}

interface CatalogIndex {
  generatedAt: string;
  summary: {
    totalRows: number;
    activeProducts: number;
    deletedProducts: number;
    deprecatedProducts: number;
    barcodeConflicts: number;
    totalBrands: number;
    typeBreakdown: Record<string, number>;
  };
  brands: BrandInfo[];
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
  rowDivide: string;
  rowHover: string;
  subCard: string;
}

interface Props {
  isDark: boolean;
  at: ThemeTokens;
}

// ── Constants ──────────────────────────────────────────────────────────────

const INDEX = catalogIndex as unknown as CatalogIndex;

const FLAG_CONFIG = {
  0: null,
  1: { label: "Deleted", color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/25",    icon: <Trash2  className="w-2.5 h-2.5" /> },
  2: { label: "Replaced", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/25", icon: <Archive className="w-2.5 h-2.5" /> },
  3: { label: "Barcode conflict", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/25", icon: <Shuffle className="w-2.5 h-2.5" /> },
} as const;

const TYPE_COLORS: Record<string, string> = {
  color:         "text-violet-400",
  toner:         "text-purple-400",
  developer:     "text-amber-400",
  bleach:        "text-yellow-400",
  treatment:     "text-emerald-400",
  plex:          "text-cyan-400",
  straightening: "text-blue-400",
  perm:          "text-pink-400",
  retail:        "text-gray-400",
  accessory:     "text-gray-400",
  other:         "text-gray-400",
};

const PAGE_SIZE = 120;

// ── Helpers ────────────────────────────────────────────────────────────────

function FlagBadge({ flag }: { flag: 0 | 1 | 2 | 3 }) {
  const cfg = FLAG_CONFIG[flag];
  if (!cfg) return null;
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[9px] font-semibold ${cfg.color} ${cfg.bg} ${cfg.border}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

function formatWeight(product: CatalogProduct) {
  const material = product.materialWeight;
  const packing = product.packingWeight;
  if (material && packing && material !== packing) return `${material}g / ${packing}g pack`;
  if (material) return `${material}g`;
  if (packing) return `${packing}g pack`;
  return "—";
}

// ── Main component ─────────────────────────────────────────────────────────

export const CatalogBrowserPanel: React.FC<Props> = ({ isDark, at }) => {
  const [selectedBrand, setSelectedBrand]   = useState<BrandInfo | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
  const [expandedBrand, setExpandedBrand]   = useState<string | null>(null);
  const [products, setProducts]             = useState<CatalogProduct[]>([]);
  const [loadingBrand, setLoadingBrand]     = useState(false);
  const [brandSearch, setBrandSearch]       = useState("");
  const [productSearch, setProductSearch]   = useState("");
  const [showFlagFilter, setShowFlagFilter] = useState<"all" | "0" | "1" | "2" | "3">("all");
  const [showTypeFilter, setShowTypeFilter] = useState<string>("all");
  const [page, setPage]                     = useState(1);

  const { summary, brands } = INDEX;

  // Load brand products on selection
  const loadBrand = useCallback(async (brand: BrandInfo) => {
    setLoadingBrand(true);
    setProducts([]);
    setPage(1);
    setSelectedSeries(null);
    setProductSearch("");
    try {
      const url = `/catalog-brands/${brand.slug}.json`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: CatalogProduct[] = await res.json();
      setProducts(data);
    } catch (e) {
      console.error("Failed to load brand products:", e);
      setProducts([]);
    } finally {
      setLoadingBrand(false);
    }
  }, []);

  const handleBrandClick = useCallback((brand: BrandInfo) => {
    setSelectedBrand(brand);
    setExpandedBrand(brand.slug);
    loadBrand(brand);
  }, [loadBrand]);

  // Unique types in current brand
  const availableTypes = useMemo(() => {
    if (!products.length) return [];
    return [...new Set(products.map((p) => p.type))].sort();
  }, [products]);

  // Filtered products
  const filtered = useMemo(() => {
    let result = products;
    if (selectedSeries && selectedSeries !== "__ALL__") {
      result = result.filter((p) => p.series === selectedSeries);
    }
    if (showFlagFilter !== "all") {
      result = result.filter((p) => p.flag === parseInt(showFlagFilter));
    }
    if (showTypeFilter !== "all") {
      result = result.filter((p) => p.type === showTypeFilter);
    }
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      result = result.filter(
        (p) =>
          p.shade.toLowerCase().includes(q) ||
          p.series.toLowerCase().includes(q) ||
          p.familyShade.toLowerCase().includes(q) ||
          p.productKind.toLowerCase().includes(q) ||
          p.shadeDesc.toLowerCase().includes(q) ||
          p.catalogNo.toLowerCase().includes(q) ||
          p.barcode.toLowerCase().includes(q) ||
          p.barcodes.some((barcode) => barcode.toLowerCase().includes(q)),
      );
    }
    return result;
  }, [products, selectedSeries, showFlagFilter, showTypeFilter, productSearch]);

  const paginated = useMemo(() => filtered.slice(0, page * PAGE_SIZE), [filtered, page]);

  // Filtered brand list
  const filteredBrands = useMemo(() => {
    if (!brandSearch.trim()) return brands;
    const q = brandSearch.toLowerCase();
    return brands.filter((b) => b.brand.toLowerCase().includes(q));
  }, [brands, brandSearch]);

  // Series stats for selected brand
  const seriesStats = useMemo(() => {
    if (!selectedBrand) return null;
    return selectedBrand.series;
  }, [selectedBrand]);

  return (
    <div className="flex flex-col gap-4">
      {/* ── Overview cards ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-indigo-400" />
          <h2 className={`text-sm font-semibold ${at.textPrimary}`}>Catalog Overview</h2>
          <span className={`text-xs ${at.textFaint}`}>· Processed from master XLSX · Deduplicated</span>
          {showFlagFilter !== "all" && (
            <button
              type="button"
              onClick={() => { setShowFlagFilter("all"); setPage(1); }}
              className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium text-indigo-400 border border-indigo-400/30 hover:bg-indigo-400/10 transition-colors"
            >
              <X className="w-2.5 h-2.5" />
              Clear filter
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {([
            { label: "Total products", value: summary.totalRows.toLocaleString(), color: "text-indigo-400", filter: "all" as const },
            { label: "Active",         value: summary.activeProducts.toLocaleString(), color: "text-emerald-400", filter: "0" as const },
            { label: "Brands",         value: summary.totalBrands, color: "text-blue-400", filter: null },
            { label: "Deleted",        value: summary.deletedProducts, color: "text-red-400",    warn: summary.deletedProducts > 0,    filter: "1" as const },
            { label: "Deprecated",     value: summary.deprecatedProducts, color: "text-orange-400", warn: summary.deprecatedProducts > 0, filter: "2" as const },
            { label: "Barcode conflicts", value: summary.barcodeConflicts, color: "text-amber-400", warn: summary.barcodeConflicts > 0, filter: "3" as const },
          ] as Array<{ label: string; value: string | number; color: string; warn?: boolean; filter: "all" | "0" | "1" | "2" | "3" | null }>).map((c) => {
            const isActive = c.filter !== null && showFlagFilter === c.filter;
            const isClickable = c.filter !== null;
            return isClickable ? (
              <button
                key={c.label}
                type="button"
                onClick={() => { setShowFlagFilter(c.filter!); setPage(1); }}
                className={`rounded-2xl border p-3 text-left transition-all ${at.card}
                  ${c.warn && !isActive ? (isDark ? "ring-1 ring-amber-500/20" : "ring-1 ring-amber-300/30") : ""}
                  ${isActive
                    ? isDark
                      ? "ring-2 ring-indigo-400/60 bg-indigo-500/10"
                      : "ring-2 ring-indigo-400/50 bg-indigo-50"
                    : "hover:opacity-80 cursor-pointer"
                  }`}
              >
                <p className={`text-2xl font-bold tracking-tight ${c.color}`}>{c.value}</p>
                <p className={`text-[11px] mt-0.5 font-medium ${at.textMuted}`}>{c.label}</p>
                {isActive && (
                  <p className="text-[9px] mt-1 text-indigo-400 font-semibold uppercase tracking-wide">Filtering ↓</p>
                )}
              </button>
            ) : (
              <div key={c.label} className={`rounded-2xl border p-3 ${at.card}`}>
                <p className={`text-2xl font-bold tracking-tight ${c.color}`}>{c.value}</p>
                <p className={`text-[11px] mt-0.5 font-medium ${at.textMuted}`}>{c.label}</p>
              </div>
            );
          })}
        </div>
        {showFlagFilter !== "all" && !selectedBrand && (
          <p className={`text-[11px] mt-2 ${at.textFaint}`}>
            Select a brand on the left to see the filtered products.
          </p>
        )}
      </div>

      {/* ── Main layout: brands sidebar + products ── */}
      <div className="flex gap-4 overflow-hidden" style={{ height: "calc(100vh - 260px)", minHeight: "560px" }}>
        {/* Brands sidebar */}
        <div className={`w-64 flex-shrink-0 rounded-2xl border overflow-hidden flex flex-col min-h-0 ${at.card}`}>
          <div className={`px-3 py-2.5 border-b flex items-center gap-2 ${isDark ? "border-gray-700 bg-gray-800/40" : "border-gray-100 bg-gray-50/60"}`}>
            <Search className={`w-3.5 h-3.5 flex-shrink-0 ${at.textFaint}`} />
            <input
              type="text"
              value={brandSearch}
              onChange={(e) => setBrandSearch(e.target.value)}
              placeholder="Search brands..."
              className={`flex-1 bg-transparent text-xs focus:outline-none ${at.textPrimary} placeholder:${at.textFaint}`}
            />
            {brandSearch && (
              <button onClick={() => setBrandSearch("")} className={at.textFaint}>
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1 min-h-0 py-1 overscroll-contain">
            {filteredBrands.map((brand) => {
              const isSelected = selectedBrand?.slug === brand.slug;
              const isExpanded = expandedBrand === brand.slug;
              return (
                <div key={brand.slug}>
                  <button
                    type="button"
                    onClick={() => handleBrandClick(brand)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors ${
                      isSelected
                        ? isDark ? "bg-indigo-500/15 text-indigo-300" : "bg-indigo-50 text-indigo-700"
                        : `${at.rowHover} ${at.textSec}`
                    }`}
                  >
                    <span className="flex-1 min-w-0">
                      <span className={`block text-xs font-medium truncate ${isSelected ? "" : at.textPrimary}`}>
                        {brand.brand}
                      </span>
                      <span className={`text-[10px] ${isSelected ? "opacity-70" : at.textFaint}`}>
                        {brand.totalCount.toLocaleString()} products · {brand.series.length} series
                      </span>
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-3 h-3 flex-shrink-0 opacity-50" />
                    ) : (
                      <ChevronRight className="w-3 h-3 flex-shrink-0 opacity-40" />
                    )}
                  </button>

                  {/* Series sub-list */}
                  {isExpanded && seriesStats && (
                    <div className={`border-l-2 ml-3 ${isDark ? "border-indigo-500/30" : "border-indigo-200"}`}>
                      <button
                        type="button"
                        onClick={() => setSelectedSeries("__ALL__")}
                        className={`w-full px-3 py-1.5 text-left text-xs transition-colors ${
                          selectedSeries === "__ALL__" || !selectedSeries
                            ? isDark ? "text-indigo-300 font-semibold" : "text-indigo-600 font-semibold"
                            : at.textFaint
                        } ${at.rowHover}`}
                      >
                        All series ({products.length})
                      </button>
                      {seriesStats.map((s) => (
                        <button
                          key={s.series}
                          type="button"
                          onClick={() => setSelectedSeries(s.series)}
                          className={`w-full px-3 py-1.5 text-left transition-colors ${
                            selectedSeries === s.series
                              ? isDark ? "text-indigo-300 font-semibold bg-indigo-500/10" : "text-indigo-600 font-semibold bg-indigo-50"
                              : `${at.textFaint} ${at.rowHover}`
                          }`}
                        >
                          <span className="text-[11px] truncate block">{s.series || "(no series)"}</span>
                          <span className={`text-[10px] ${at.textFaint}`}>{s.count}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Products panel */}
        <div className="flex-1 min-w-0 flex flex-col gap-3 min-h-0 overflow-hidden">
          {!selectedBrand ? (
            <div className={`flex-1 flex flex-col items-center justify-center rounded-2xl border ${at.card}`}>
              <Package className={`w-10 h-10 mb-3 ${at.textFaint}`} />
              <p className={`text-sm font-medium ${at.textMuted}`}>Select a brand to browse products</p>
              <p className={`text-xs mt-1 ${at.textFaint}`}>
                {brands.length} brands available · {summary.totalRows.toLocaleString()} products total
              </p>
            </div>
          ) : (
            <>
              {/* Brand header */}
              <div className={`rounded-2xl border px-4 py-3 flex-shrink-0 ${at.card}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className={`text-base font-bold ${at.textPrimary}`}>{selectedBrand.brand}</h3>
                    <p className={`text-xs ${at.textFaint}`}>
                      {selectedBrand.totalCount.toLocaleString()} products ·{" "}
                      {selectedBrand.series.length} series ·{" "}
                      {selectedSeries && selectedSeries !== "__ALL__" ? `Showing: ${selectedSeries}` : "All series"}
                    </p>
                  </div>

                  {/* Filters row */}
                  <div className="flex flex-wrap gap-2 items-center">
                    {/* Search */}
                    <div className="relative">
                      <Search className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 ${at.textFaint}`} />
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => { setProductSearch(e.target.value); setPage(1); }}
                        placeholder="Search shade, barcode, type..."
                        className={`pl-7 pr-7 py-1.5 rounded-xl border text-xs focus:outline-none ${at.input}`}
                      />
                      {productSearch && (
                        <button onClick={() => setProductSearch("")} className={`absolute right-2 top-1/2 -translate-y-1/2 ${at.textFaint}`}>
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Type filter */}
                    {availableTypes.length > 1 && (
                      <select
                        value={showTypeFilter}
                        onChange={(e) => { setShowTypeFilter(e.target.value); setPage(1); }}
                        className={`px-2.5 py-1.5 rounded-xl border text-xs focus:outline-none cursor-pointer ${at.select}`}
                      >
                        <option value="all">All types</option>
                        {availableTypes.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    )}

                    {/* Flag filter */}
                    <select
                      value={showFlagFilter}
                      onChange={(e) => { setShowFlagFilter(e.target.value as typeof showFlagFilter); setPage(1); }}
                      className={`px-2.5 py-1.5 rounded-xl border text-xs focus:outline-none cursor-pointer ${at.select}`}
                    >
                      <option value="all">All statuses</option>
                      <option value="0">Active only</option>
                      <option value="1">Deleted</option>
                      <option value="2">Deprecated</option>
                      <option value="3">Barcode conflicts</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Products table */}
              <div className={`flex-1 rounded-2xl border overflow-hidden min-h-0 flex flex-col ${at.card}`}>
                {loadingBrand ? (
                  <div className="flex items-center justify-center h-40">
                    <div className={`text-xs ${at.textFaint} animate-pulse`}>Loading products...</div>
                  </div>
                ) : (
                  <>
                    {/* Table header */}
                    <div className={`grid gap-2 px-4 py-2 border-b text-[10px] font-semibold uppercase tracking-wider flex-shrink-0 ${
                      isDark ? "border-gray-700 bg-gray-800/50 text-gray-500" : "border-gray-100 bg-gray-50 text-gray-400"
                    }`}
                      style={{ gridTemplateColumns: "1fr 1.25fr 1.6fr 120px 90px 90px 80px 70px" }}
                    >
                      <span>Series</span>
                      <span>Shade</span>
                      <span>Description</span>
                      <span>Product kind</span>
                      <span>Weight</span>
                      <span>Status</span>
                      <span className="text-right">Price</span>
                      <span className="text-right">Verify</span>
                    </div>

                    {/* Result count */}
                    <div className={`px-4 py-1.5 text-[10px] border-b flex-shrink-0 flex items-center gap-3 ${
                      isDark ? "border-gray-700/50 text-gray-500" : "border-gray-50 text-gray-400"
                    }`}>
                      <span>{filtered.length.toLocaleString()} products</span>
                      {filtered.length !== products.length && (
                        <span className="text-indigo-400">(filtered from {products.length.toLocaleString()})</span>
                      )}
                    </div>

                    {/* Rows */}
                    <div className="overflow-y-auto flex-1 min-h-0 overscroll-contain">
                      <div className="divide-y" style={{ borderColor: isDark ? "rgba(55,65,81,0.3)" : "rgba(243,244,246,1)" }}>
                        {paginated.length === 0 ? (
                          <div className="px-4 py-10 text-center">
                            <Search className={`w-5 h-5 mx-auto mb-2 ${at.textFaint}`} />
                            <p className={`text-xs ${at.textFaint}`}>No products match the current filters.</p>
                          </div>
                        ) : (
                          paginated.map((product) => (
                            <ProductRow
                              key={product.id}
                              product={product}
                              at={at}
                              isDark={isDark}
                            />
                          ))
                        )}
                      </div>

                      {/* Load more */}
                      {paginated.length < filtered.length && (
                        <div className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => setPage((p) => p + 1)}
                            className={`px-4 py-2 rounded-xl text-xs font-medium border transition ${at.filterInactive}`}
                          >
                            Load more ({filtered.length - paginated.length} remaining)
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Type breakdown ── */}
      <div className={`rounded-2xl border p-4 ${at.card}`}>
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span className={`text-xs font-semibold ${at.textPrimary}`}>Product type breakdown (full catalog)</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {Object.entries(summary.typeBreakdown)
            .sort((a, b) => b[1] - a[1])
            .map(([type, count]) => (
              <div key={type} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${at.subCard}`}>
                <span className={`text-xs font-semibold ${TYPE_COLORS[type] || "text-gray-400"}`}>
                  {count.toLocaleString()}
                </span>
                <span className={`text-xs ${at.textFaint}`}>{type}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

// ── Product row ────────────────────────────────────────────────────────────

function ProductRow({
  product,
  at,
  isDark,
}: {
  product: CatalogProduct;
  at: ThemeTokens;
  isDark: boolean;
}) {
  const isInactive = product.flag !== 0;

  return (
    <div
      className={`grid gap-2 px-4 py-2.5 items-center text-xs ${
        isInactive ? "opacity-50" : ""
      }`}
      style={{ gridTemplateColumns: "1fr 1.25fr 1.6fr 120px 90px 90px 80px 70px" }}
    >
      {/* Series */}
      <div className="min-w-0">
        <span className={`block truncate ${at.textFaint}`} title={product.series}>
          {product.series || "—"}
        </span>
        {product.familyShade && product.familyShade !== product.series && (
          <span className={`block truncate text-[10px] ${at.textFaint}`} title={product.familyShade}>
            {product.familyShade}
          </span>
        )}
      </div>

      {/* Shade */}
      <div className="min-w-0">
        <span className={`block font-semibold truncate ${at.textPrimary}`} title={product.shade}>
          {product.shade}
        </span>
        {(product.catalogNo || product.barcode) && (
          <span className={`block truncate font-normal text-[10px] ${at.textFaint}`}>
            {product.catalogNo || product.barcode}
          </span>
        )}
      </div>

      {/* Description */}
      <div className="min-w-0">
        <span className={`block truncate ${product.shadeDesc ? at.textSec : at.textFaint}`} title={product.shadeDesc || product.productKind}>
          {product.shadeDesc || product.productKind || <span className="italic text-[10px]">—</span>}
        </span>
        {product.image && (
          <span className={`block truncate text-[10px] ${at.textFaint}`} title={product.image}>
            image: {product.image}
          </span>
        )}
      </div>

      {/* Type */}
      <div className="min-w-0">
        <span className={`block truncate font-medium ${TYPE_COLORS[product.type] || "text-gray-400"}`} title={product.productKind}>
          {product.productKind || product.type}
        </span>
        <span className={`block text-[10px] ${at.textFaint}`}>{product.rawType || product.type}</span>
      </div>

      {/* Weight */}
      <span className={`truncate tabular-nums ${at.textSec}`} title={formatWeight(product)}>
        {formatWeight(product)}
      </span>

      {/* Status / flag */}
      <div className="min-w-0">
        <FlagBadge flag={product.flag} />
        {product.flag === 0 && product.barcodeCount > 0 && (
          <span className={`block truncate text-[10px] ${at.textFaint}`} title={product.barcodes.join(", ")}>
            {product.barcodeCount} barcode{product.barcodeCount > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Price */}
      <span className={`text-right font-medium tabular-nums ${at.textPrimary}`}>
        {product.price > 0 ? `₪${product.price}` : "—"}
      </span>

      {/* Verify */}
      <a
        href={product.verificationUrl}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => e.stopPropagation()}
        className={`text-right text-[10px] underline underline-offset-2 ${at.textFaint} hover:${at.textSec}`}
      >
        Search
      </a>
    </div>
  );
}
