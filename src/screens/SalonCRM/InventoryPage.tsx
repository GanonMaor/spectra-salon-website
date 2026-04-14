import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  LayoutGrid,
  LayoutList,
  Search,
  Save,
  Loader2,
  Package,
  Eye,
  EyeOff,
  ScanBarcode,
  AlertTriangle,
  Check,
  X,
} from "lucide-react";
import { apiClient } from "../../api/client";
import { useSiteTheme } from "../../contexts/SiteTheme";
import { useToast } from "../../components/ui/toast";
import { useCrmT } from "./i18n/CrmLocale";

// ── Types ─────────────────────────────────────────────────────────

interface Brand {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
}

interface ProductLine {
  id: string;
  brand_id: string;
  name: string;
  slug: string;
  sort_order: number;
}

interface InventoryProduct {
  id: string;
  salon_id: string;
  brand_id: string;
  product_line_id: string;
  shade_code: string;
  display_name: string | null;
  level: number | null;
  size_grams: number;
  barcode: string | null;
  is_visible: boolean;
  cost_usd: string;
  selling_price_usd: string;
  margin_pct: string;
  min_stock: number;
  units_in_stock: number;
  status: string;
  brand_name?: string;
  brand_slug?: string;
  line_name?: string;
  line_slug?: string;
}

interface DraftEdits {
  [productId: string]: {
    units_in_stock?: number;
    min_stock?: number;
    cost_usd?: number;
    selling_price_usd?: number;
    margin_pct?: number;
  };
}

interface DraftBarcodes {
  [productId: string]: string;
}

type ViewMode = "stock-grid" | "stock-table" | "barcodes" | "visibility";
type StockFilter = "all" | "in-stock" | "low-stock";

// ── Helpers ───────────────────────────────────────────────────────

function getStockBadgeColor(qty: number, minStock: number): string {
  if (qty === 0) return "bg-gray-400";
  if (qty <= minStock) return "bg-red-500";
  if (qty <= minStock * 2) return "bg-amber-400";
  return "bg-emerald-400";
}

function groupByLevel(products: InventoryProduct[]): Map<number | null, InventoryProduct[]> {
  const map = new Map<number | null, InventoryProduct[]>();
  for (const p of products) {
    const lvl = p.level;
    if (!map.has(lvl)) map.set(lvl, []);
    map.get(lvl)!.push(p);
  }
  return map;
}

// ── Main Page Component ───────────────────────────────────────────

const InventoryPage: React.FC = () => {
  const { isDark } = useSiteTheme();
  const { addToast } = useToast();
  const t = useCrmT();

  // Data state
  const [brands, setBrands] = useState<Brand[]>([]);
  const [lines, setLines] = useState<ProductLine[]>([]);
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Filter state
  const [activeBrand, setActiveBrand] = useState<string>("");
  const [activeLine, setActiveLine] = useState<string>("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>("stock-grid");

  // Draft state (shared between grid and table)
  const [draftEdits, setDraftEdits] = useState<DraftEdits>({});
  const [draftBarcodes, setDraftBarcodes] = useState<DraftBarcodes>({});

  const hasDirtyEdits = Object.keys(draftEdits).length > 0;

  // Filtered lines for active brand
  const filteredLines = useMemo(
    () => lines.filter((l) => !activeBrand || l.brand_id === activeBrand),
    [lines, activeBrand],
  );

  // Filtered products
  const filteredProducts = useMemo(() => {
    let result = products;
    if (activeBrand) result = result.filter((p) => p.brand_id === activeBrand);
    if (activeLine) result = result.filter((p) => p.product_line_id === activeLine);
    if (stockFilter === "in-stock") result = result.filter((p) => p.units_in_stock > 0);
    if (stockFilter === "low-stock") result = result.filter((p) => p.units_in_stock <= p.min_stock);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.shade_code.toLowerCase().includes(q) ||
          (p.display_name || "").toLowerCase().includes(q) ||
          (p.barcode || "").toLowerCase().includes(q),
      );
    }
    return result;
  }, [products, activeBrand, activeLine, stockFilter, searchQuery]);

  // ── Data loading ────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [filtersRes, itemsRes] = await Promise.all([
        apiClient.getInventoryFilters(),
        apiClient.getInventory({ limit: 500 }),
      ]);
      setBrands(filtersRes.brands || []);
      setLines(filtersRes.lines || []);
      setProducts(itemsRes.items || []);

      if (filtersRes.brands?.length && !activeBrand) {
        setActiveBrand(filtersRes.brands[0].id);
      }
    } catch (err) {
      console.error("Failed to load inventory:", err);
      addToast({ message: t.inventory.loadFailed, type: "error" });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-select first line when brand changes
  useEffect(() => {
    if (filteredLines.length > 0 && !filteredLines.find((l) => l.id === activeLine)) {
      setActiveLine(filteredLines[0].id);
    }
  }, [filteredLines, activeLine]);

  // ── Draft helpers ───────────────────────────────────────────────

  const setDraftField = (productId: string, field: string, value: number) => {
    setDraftEdits((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], [field]: value },
    }));
  };

  const getDraftValue = (product: InventoryProduct, field: keyof DraftEdits[string]): number => {
    const draft = draftEdits[product.id];
    if (draft && draft[field] !== undefined) return draft[field] as number;
    if (field === "units_in_stock") return product.units_in_stock;
    if (field === "min_stock") return product.min_stock;
    return parseFloat((product as any)[field]) || 0;
  };

  const isProductDirty = (productId: string): boolean => !!draftEdits[productId];

  // ── Save handlers ──────────────────────────────────────────────

  const saveStockEdits = async () => {
    const updates = Object.entries(draftEdits).map(([id, fields]) => ({ id, ...fields }));
    if (updates.length === 0) return;

    setSaving(true);
    try {
      const result = await apiClient.updateInventoryBatch(updates);
      if (result.items) {
        setProducts((prev) =>
          prev.map((p) => {
            const updated = result.items.find((u: InventoryProduct) => u.id === p.id);
            return updated ? { ...p, ...updated } : p;
          }),
        );
      }
      setDraftEdits({});
      addToast({ message: t.inventory.updatedProducts.replace("{n}", String(result.updated)), type: "success" });
    } catch (err: any) {
      addToast({ message: err.message || t.inventory.saveFailed, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const saveBarcode = async (productId: string) => {
    const barcode = draftBarcodes[productId];
    if (barcode === undefined) return;

    setSaving(true);
    try {
      const result = await apiClient.updateInventoryBarcode(productId, barcode || null);
      if (result.item) {
        setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, ...result.item } : p)));
      }
      setDraftBarcodes((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
      addToast({ message: t.inventory.barcodeUpdated, type: "success" });
    } catch (err: any) {
      addToast({ message: err.message || t.inventory.barcodeFailed, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const toggleVisibility = async (productId: string, newVisible: boolean) => {
    setSaving(true);
    try {
      const result = await apiClient.updateInventoryVisibility(productId, newVisible);
      if (result.item) {
        setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, ...result.item } : p)));
      }
      addToast({ message: newVisible ? t.inventory.productShown : t.inventory.productHidden, type: "success" });
    } catch (err: any) {
      addToast({ message: err.message || t.inventory.visibilityFailed, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  // ── Style helpers ───────────────────────────────────────────────

  const cardBg = isDark ? "bg-white/[0.06] border-white/[0.08]" : "bg-white border-black/[0.06]";
  const textPrimary = isDark ? "text-white" : "text-[#1A1A1A]";
  const textSecondary = isDark ? "text-white/60" : "text-black/60";
  const textMuted = isDark ? "text-white/55" : "text-black/55";
  const inputBg = isDark
    ? "bg-white/[0.06] border-white/[0.1] text-white placeholder:text-white/50"
    : "bg-white border-black/[0.1] text-black placeholder:text-black/50";
  const chipActive = isDark ? "bg-white/[0.15] text-white" : "bg-black text-white";
  const chipInactive = isDark
    ? "bg-white/[0.05] text-white/50 hover:bg-white/[0.08]"
    : "bg-black/[0.03] text-black/60 hover:bg-black/[0.06]";

  // ── Loading state ───────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className={`w-6 h-6 animate-spin ${textMuted}`} />
      </div>
    );
  }

  // ── Shared summary bar ──────────────────────────────────────────

  const activeLineMeta = lines.find((l) => l.id === activeLine);
  const lineProducts = products.filter(
    (p) => p.product_line_id === activeLine && (!activeBrand || p.brand_id === activeBrand),
  );
  const totalUnitsInLine = lineProducts.reduce((s, p) => s + p.units_in_stock, 0);
  const avgPrice =
    lineProducts.length > 0
      ? (lineProducts.reduce((s, p) => s + parseFloat(p.selling_price_usd), 0) / lineProducts.length).toFixed(2)
      : "0.00";

  const isStockView = viewMode === "stock-grid" || viewMode === "stock-table";
  const sectionBorder = isDark ? "border-white/[0.06]" : "border-black/[0.05]";
  const sectionBg = isDark ? "bg-white/[0.02]" : "bg-gray-50/40";
  const sectionLabel = `text-[10px] uppercase tracking-widest font-semibold ${textMuted} shrink-0`;

  return (
    <div className="space-y-3">
      {/* ── Title + Save ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className={`text-lg font-semibold ${textPrimary}`}>{t.inventory.title}</h1>
          <p className={`text-xs ${textSecondary}`}>{t.inventory.subtitle}</p>
        </div>
        {isStockView && hasDirtyEdits && (
          <button
            onClick={saveStockEdits}
            disabled={saving}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm w-full sm:w-auto"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {t.inventory.saveChanges} ({Object.keys(draftEdits).length})
          </button>
        )}
      </div>

      {/* ── View Mode + Filters (single row on desktop) ── */}
      <div className={`rounded-xl border ${sectionBorder} ${sectionBg} px-2 py-1.5`}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          {/* Filter chips + Search (left, only for stock views) */}
          {isStockView && (
            <div className="flex items-center gap-2 overflow-x-auto flex-nowrap">
              {([
                { id: "all" as StockFilter, label: t.inventory.fullCatalog, dot: isDark ? "bg-white/60" : "bg-gray-500" },
                { id: "in-stock" as StockFilter, label: t.inventory.inStock, dot: "bg-emerald-500" },
                { id: "low-stock" as StockFilter, label: t.inventory.lowStock, dot: "bg-red-500" },
              ] as const).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setStockFilter(f.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    stockFilter === f.id ? chipActive : chipInactive
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${f.dot}`} />
                  {f.label}
                </button>
              ))}
              <div className="relative shrink-0">
                <Search className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${textMuted}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.inventory.searchPlaceholder}
                  className={`w-44 sm:w-48 pl-8 pr-3 py-2 rounded-lg border text-xs ${inputBg}`}
                />
              </div>
            </div>
          )}

          {/* Mode tabs (right) */}
          <div className="flex items-center gap-1 overflow-x-auto flex-nowrap shrink-0 sm:ml-auto">
            {([
              { id: "stock-grid", label: t.inventory.stockGrid, icon: LayoutGrid },
              { id: "stock-table", label: t.inventory.stockTable, icon: LayoutList },
              { id: "barcodes", label: t.inventory.barcodes, icon: ScanBarcode },
              { id: "visibility", label: t.inventory.showHide, icon: Eye },
            ] as const).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  viewMode === tab.id ? chipActive : chipInactive
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Catalog Panel (stock views) ── */}
      {isStockView && (
        <div className={`rounded-xl border ${sectionBorder} ${sectionBg} px-3 py-3 space-y-3`}>

          {/* Brand selector */}
          <div className="flex items-center gap-2 overflow-x-auto flex-nowrap sm:flex-wrap">
            <span className={sectionLabel}>{t.inventory.brand}</span>
            {brands.map((b) => (
              <button
                key={b.id}
                onClick={() => setActiveBrand(b.id)}
                className={`px-3 py-2 rounded-lg border text-xs font-medium whitespace-nowrap transition-all ${
                  activeBrand === b.id
                    ? isDark
                      ? "border-white/30 bg-white/[0.12] text-white"
                      : "border-black/25 bg-white text-black shadow-sm"
                    : isDark
                      ? "border-transparent text-white/55 hover:text-white/70"
                      : "border-transparent text-black/55 hover:text-black/70"
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>

          {/* Product Line tabs */}
          {filteredLines.length > 0 && (
            <>
              <div className={`border-t ${sectionBorder}`} />
              <div className="space-y-1.5">
                <span className={sectionLabel}>{t.inventory.productLine}</span>
                <div className="overflow-x-auto">
                  <div className={`inline-flex items-center rounded-lg border overflow-hidden ${sectionBorder}`}>
                    {filteredLines.map((l) => (
                      <button
                        key={l.id}
                        onClick={() => setActiveLine(l.id)}
                        className={`min-w-[90px] max-w-[160px] text-center text-xs font-medium py-2.5 px-3 whitespace-nowrap transition-all ${
                          activeLine === l.id
                            ? isDark
                              ? "bg-white text-black"
                              : "bg-black text-white"
                            : isDark
                              ? "bg-white/[0.04] text-white/50 hover:bg-white/[0.08]"
                              : "bg-white text-black/60 hover:bg-gray-100"
                        }`}
                      >
                        {l.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Line Summary ── */}
      {isStockView && activeLineMeta && (
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 px-1">
          <div className="flex items-baseline gap-1.5">
            <span className={`text-sm font-semibold ${textPrimary}`}>{activeLineMeta.name}</span>
            <span className={`text-xs ${textSecondary}`}>&middot; {lineProducts.length} {t.inventory.shadesCount}</span>
          </div>
          <div className={`text-xs ${textSecondary} flex items-center gap-3`}>
            <span>{t.inventory.avgPriceFull}: <span className="font-medium">${avgPrice}</span></span>
            <span>{t.inventory.unitsFull}: <span className="font-medium">{totalUnitsInLine}</span></span>
          </div>
        </div>
      )}

      {/* ── Views ── */}
      {viewMode === "stock-grid" && (
        <StockGridView
          products={filteredProducts}
          draftEdits={draftEdits}
          getDraftValue={getDraftValue}
          setDraftField={setDraftField}
          isProductDirty={isProductDirty}
          isDark={isDark}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          cardBg={cardBg}
        />
      )}

      {viewMode === "stock-table" && (
        <StockTableView
          products={filteredProducts}
          draftEdits={draftEdits}
          getDraftValue={getDraftValue}
          setDraftField={setDraftField}
          isProductDirty={isProductDirty}
          isDark={isDark}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          inputBg={inputBg}
        />
      )}

      {viewMode === "barcodes" && (
        <BarcodeView
          products={products}
          brands={brands}
          lines={lines}
          activeBrand={activeBrand}
          setActiveBrand={setActiveBrand}
          draftBarcodes={draftBarcodes}
          setDraftBarcodes={setDraftBarcodes}
          saveBarcode={saveBarcode}
          saving={saving}
          isDark={isDark}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          textMuted={textMuted}
          inputBg={inputBg}
          cardBg={cardBg}
          chipActive={chipActive}
          chipInactive={chipInactive}
        />
      )}

      {viewMode === "visibility" && (
        <VisibilityView
          products={products}
          brands={brands}
          lines={lines}
          activeBrand={activeBrand}
          setActiveBrand={setActiveBrand}
          toggleVisibility={toggleVisibility}
          saving={saving}
          isDark={isDark}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          textMuted={textMuted}
          cardBg={cardBg}
          chipActive={chipActive}
          chipInactive={chipInactive}
        />
      )}
    </div>
  );
};

// ── Stock Grid View ───────────────────────────────────────────────

interface StockGridViewProps {
  products: InventoryProduct[];
  draftEdits: DraftEdits;
  getDraftValue: (p: InventoryProduct, f: keyof DraftEdits[string]) => number;
  setDraftField: (id: string, field: string, value: number) => void;
  isProductDirty: (id: string) => boolean;
  isDark: boolean;
  textPrimary: string;
  textSecondary: string;
  cardBg: string;
}

const StockGridView: React.FC<StockGridViewProps> = ({
  products,
  getDraftValue,
  setDraftField,
  isProductDirty,
  isDark,
  textPrimary,
  textSecondary,
  cardBg,
}) => {
  const t = useCrmT();
  const levelMap = groupByLevel(products);
  const levels = Array.from(levelMap.keys()).sort((a, b) => (a ?? 99) - (b ?? 99));

  if (products.length === 0) {
    return (
      <div className={`text-center py-12 ${textSecondary}`}>
        <Package className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm">{t.inventory.noProductsFilter}</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {levels.map((level) => {
        const items = levelMap.get(level) || [];
        return (
          <div
            key={level ?? "null"}
            className={`flex items-start gap-4 border-t py-3 min-h-[48px] ${
              isDark ? "border-white/[0.06]" : "border-black/[0.06]"
            } ${items.length === 0 ? "opacity-50" : ""}`}
          >
            <div className="w-[80px] flex-shrink-0 pt-1">
              <span className={`text-xs whitespace-nowrap font-medium ${textSecondary}`}>
                {level != null ? `${t.inventory.levelLabel} ${level}` : t.inventory.otherLevel}
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              {items.map((item) => {
                const qty = getDraftValue(item, "units_in_stock");
                const dirty = isProductDirty(item.id);
                const badgeColor = getStockBadgeColor(qty, item.min_stock);

                return (
                  <div key={item.id} className="flex flex-col items-center gap-1 group">
                    <div
                      className={`relative w-[88px] rounded-md shadow-sm border p-2 pt-5 flex flex-col items-center transition-all ${cardBg} ${
                        dirty ? (isDark ? "ring-1 ring-amber-400/50" : "ring-1 ring-amber-500/50") : ""
                      }`}
                    >
                      {/* Qty badge */}
                      <span
                        className={`absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-md border-2 z-10 ${badgeColor} ${
                          isDark ? "border-[#1a1a1a]" : "border-white"
                        }`}
                      >
                        {qty}
                      </span>

                      {/* Tube visual */}
                      <div className="w-5 h-[72px] relative flex items-end justify-center">
                        <div className="absolute inset-0 w-[18px] mx-auto rounded-sm bg-gradient-to-b from-gray-200 to-gray-300" />
                        <div className="relative w-full h-[64px]">
                          <div className="absolute inset-0 mx-auto w-[20px] bg-gradient-to-b from-[#e8e8ea] via-[#d0d0d4] to-[#c4c4c8] rounded-[2px]" />
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[16px] h-[52px] bg-gradient-to-b from-[#f0f0f2] to-[#dcdce0] rounded-[1px]" />
                        </div>
                      </div>
                      <span className={`text-[8px] mt-1 ${isDark ? "text-white/50" : "text-gray-400"}`}>
                        {item.size_grams || 50}gr
                      </span>

                      {/* Inline stock editor */}
                      <input
                        type="number"
                        min={0}
                        value={qty}
                        onChange={(e) =>
                          setDraftField(item.id, "units_in_stock", Math.max(0, parseInt(e.target.value) || 0))
                        }
                        className={`w-full mt-1 text-center text-[10px] rounded border px-1 py-0.5 ${
                          isDark
                            ? "bg-white/[0.06] border-white/[0.1] text-white"
                            : "bg-gray-50 border-black/[0.08] text-black"
                        }`}
                      />
                    </div>
                    <span className={`text-[11px] font-light tracking-wide ${textSecondary}`}>
                      {item.shade_code}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ── Stock Table View ──────────────────────────────────────────────

interface StockTableViewProps {
  products: InventoryProduct[];
  draftEdits: DraftEdits;
  getDraftValue: (p: InventoryProduct, f: keyof DraftEdits[string]) => number;
  setDraftField: (id: string, field: string, value: number) => void;
  isProductDirty: (id: string) => boolean;
  isDark: boolean;
  textPrimary: string;
  textSecondary: string;
  inputBg: string;
}

const StockTableView: React.FC<StockTableViewProps> = ({
  products,
  getDraftValue,
  setDraftField,
  isProductDirty,
  isDark,
  textPrimary,
  textSecondary,
  inputBg,
}) => {
  const t = useCrmT();

  if (products.length === 0) {
    return (
      <div className={`text-center py-12 ${textSecondary}`}>
        <Package className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm">{t.inventory.noProductsFilter}</p>
      </div>
    );
  }

  const colHeader = `text-[10px] uppercase tracking-wider font-semibold ${isDark ? "text-white/55" : "text-black/55"}`;
  const cellInput = `w-full text-xs text-center rounded border px-2 py-1.5 ${inputBg} focus:outline-none focus:ring-1 ${
    isDark ? "focus:ring-white/20" : "focus:ring-black/20"
  }`;

  return (
    <div className={`rounded-lg border overflow-x-auto ${isDark ? "border-white/[0.08]" : "border-black/[0.06]"}`}>
      <table className="w-full min-w-[640px]">
        <thead>
          <tr className={isDark ? "bg-white/[0.04]" : "bg-gray-50/80"}>
            <th className={`px-3 py-2.5 text-left ${colHeader}`}>{t.inventory.shade}</th>
            <th className={`px-3 py-2.5 text-center ${colHeader}`}>{t.inventory.unitsInStock}</th>
            <th className={`px-3 py-2.5 text-center ${colHeader}`}>{t.inventory.minStock}</th>
            <th className={`px-3 py-2.5 text-center ${colHeader}`}>{t.inventory.costUsd}</th>
            <th className={`px-3 py-2.5 text-center ${colHeader}`}>{t.inventory.sellPriceUsd}</th>
            <th className={`px-3 py-2.5 text-center ${colHeader}`}>{t.inventory.marginPct}</th>
            <th className={`px-3 py-2.5 w-8 ${colHeader}`}></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const dirty = isProductDirty(p.id);
            const qty = getDraftValue(p, "units_in_stock");
            const isLow = qty <= p.min_stock;

            return (
              <tr
                key={p.id}
                className={`border-t transition-colors ${
                  isDark ? "border-white/[0.04]" : "border-black/[0.04]"
                } ${dirty ? (isDark ? "bg-amber-900/10" : "bg-amber-50/60") : ""} ${
                  isLow ? (isDark ? "bg-red-900/10" : "bg-red-50/40") : ""
                }`}
              >
                <td className={`px-3 py-2 ${textPrimary}`}>
                  <div className="flex items-center gap-2">
                    {isLow && <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />}
                    <div>
                      <div className="text-xs font-medium">{p.shade_code}</div>
                      {p.display_name && (
                        <div className={`text-[10px] ${textSecondary}`}>{p.display_name}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min={0}
                    value={getDraftValue(p, "units_in_stock")}
                    onChange={(e) =>
                      setDraftField(p.id, "units_in_stock", Math.max(0, parseInt(e.target.value) || 0))
                    }
                    className={cellInput}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min={0}
                    value={getDraftValue(p, "min_stock")}
                    onChange={(e) =>
                      setDraftField(p.id, "min_stock", Math.max(0, parseInt(e.target.value) || 0))
                    }
                    className={cellInput}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={getDraftValue(p, "cost_usd")}
                    onChange={(e) =>
                      setDraftField(p.id, "cost_usd", Math.max(0, parseFloat(e.target.value) || 0))
                    }
                    className={cellInput}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={getDraftValue(p, "selling_price_usd")}
                    onChange={(e) =>
                      setDraftField(
                        p.id,
                        "selling_price_usd",
                        Math.max(0, parseFloat(e.target.value) || 0),
                      )
                    }
                    className={cellInput}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    step={0.1}
                    value={getDraftValue(p, "margin_pct")}
                    onChange={(e) =>
                      setDraftField(p.id, "margin_pct", parseFloat(e.target.value) || 0)
                    }
                    className={cellInput}
                  />
                </td>
                <td className="px-3 py-2">
                  {dirty && (
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-400" title={t.inventory.unsaved} />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ── Barcode View ──────────────────────────────────────────────────

interface BarcodeViewProps {
  products: InventoryProduct[];
  brands: Brand[];
  lines: ProductLine[];
  activeBrand: string;
  setActiveBrand: (id: string) => void;
  draftBarcodes: DraftBarcodes;
  setDraftBarcodes: React.Dispatch<React.SetStateAction<DraftBarcodes>>;
  saveBarcode: (id: string) => Promise<void>;
  saving: boolean;
  isDark: boolean;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  inputBg: string;
  cardBg: string;
  chipActive: string;
  chipInactive: string;
}

const BarcodeView: React.FC<BarcodeViewProps> = ({
  products,
  brands,
  activeBrand,
  setActiveBrand,
  draftBarcodes,
  setDraftBarcodes,
  saveBarcode,
  saving,
  isDark,
  textPrimary,
  textSecondary,
  textMuted,
  inputBg,
  cardBg,
  chipActive,
  chipInactive,
}) => {
  const t = useCrmT();
  const [scanMode, setScanMode] = useState(false);
  const [scanTarget, setScanTarget] = useState<string | null>(null);
  const scanBuffer = useRef("");
  const scanTimer = useRef<ReturnType<typeof setTimeout>>();

  const filtered = useMemo(
    () => products.filter((p) => !activeBrand || p.brand_id === activeBrand),
    [products, activeBrand],
  );

  // Scanner keyboard-wedge handler: fast burst of chars + Enter
  useEffect(() => {
    if (!scanMode || !scanTarget) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" && scanBuffer.current.length >= 3) {
        e.preventDefault();
        const code = scanBuffer.current.trim();
        setDraftBarcodes((prev) => ({ ...prev, [scanTarget]: code }));
        scanBuffer.current = "";
        setScanMode(false);
        setScanTarget(null);
        return;
      }
      if (e.key.length === 1) {
        scanBuffer.current += e.key;
        clearTimeout(scanTimer.current);
        scanTimer.current = setTimeout(() => {
          scanBuffer.current = "";
        }, 200);
      }
    };

    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      clearTimeout(scanTimer.current);
    };
  }, [scanMode, scanTarget, setDraftBarcodes]);

  return (
    <div className="space-y-4">
      {/* Brand filter */}
      <div className="flex flex-wrap items-center gap-2">
        {brands.map((b) => (
          <button
            key={b.id}
            onClick={() => setActiveBrand(b.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeBrand === b.id ? chipActive : chipInactive
            }`}
          >
            {b.name}
          </button>
        ))}
      </div>

      {/* Scan mode banner */}
      {scanMode && scanTarget && (
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
            isDark ? "bg-blue-900/20 border-blue-400/30" : "bg-blue-50 border-blue-200"
          }`}
        >
          <ScanBarcode className="w-5 h-5 text-blue-500 animate-pulse" />
          <span className={`text-sm ${textPrimary}`}>
            {t.inventory.scanBarcodeFor}{" "}
            <strong>{products.find((p) => p.id === scanTarget)?.shade_code}</strong>...
          </span>
          <button
            onClick={() => {
              setScanMode(false);
              setScanTarget(null);
              scanBuffer.current = "";
            }}
            className={`ml-auto p-1 rounded ${isDark ? "hover:bg-white/10" : "hover:bg-black/5"}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Product list */}
      <div className={`rounded-lg border overflow-hidden ${isDark ? "border-white/[0.08]" : "border-black/[0.06]"}`}>
        <table className="w-full">
          <thead>
            <tr className={isDark ? "bg-white/[0.04]" : "bg-gray-50/80"}>
              <th className={`px-3 py-2 text-left text-[10px] uppercase tracking-wider font-semibold ${textMuted}`}>
                {t.inventory.shade}
              </th>
              <th className={`px-3 py-2 text-left text-[10px] uppercase tracking-wider font-semibold ${textMuted}`}>
                {t.inventory.barcodes}
              </th>
              <th className={`px-3 py-2 text-center text-[10px] uppercase tracking-wider font-semibold ${textMuted}`}>
                {t.common.edit}
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const draftVal = draftBarcodes[p.id];
              const currentBarcode = draftVal !== undefined ? draftVal : p.barcode || "";
              const isDirty = draftVal !== undefined;

              return (
                <tr
                  key={p.id}
                  className={`border-t ${isDark ? "border-white/[0.04]" : "border-black/[0.04]"}`}
                >
                  <td className={`px-3 py-2.5 ${textPrimary}`}>
                    <div className="text-xs font-medium">{p.shade_code}</div>
                    <div className={`text-[10px] ${textSecondary}`}>{p.display_name || p.line_name}</div>
                  </td>
                  <td className="px-3 py-2.5">
                    <input
                      type="text"
                      value={currentBarcode}
                      onChange={(e) =>
                        setDraftBarcodes((prev) => ({ ...prev, [p.id]: e.target.value }))
                      }
                      placeholder={t.inventory.enterOrScanBarcode}
                      className={`w-full text-xs rounded border px-2 py-1.5 font-mono ${inputBg}`}
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => {
                          setScanTarget(p.id);
                          setScanMode(true);
                          scanBuffer.current = "";
                        }}
                        className={`p-1.5 rounded transition-colors ${
                          isDark ? "hover:bg-white/10 text-white/50" : "hover:bg-black/5 text-black/50"
                        }`}
                        title={t.inventory.scanBarcodeBtn}
                      >
                        <ScanBarcode className="w-3.5 h-3.5" />
                      </button>
                      {isDirty && (
                        <button
                          onClick={() => saveBarcode(p.id)}
                          disabled={saving}
                          className="p-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                          title={t.inventory.saveBarcodeBtn}
                        >
                          {saving ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── Visibility View ───────────────────────────────────────────────

interface VisibilityViewProps {
  products: InventoryProduct[];
  brands: Brand[];
  lines: ProductLine[];
  activeBrand: string;
  setActiveBrand: (id: string) => void;
  toggleVisibility: (id: string, visible: boolean) => Promise<void>;
  saving: boolean;
  isDark: boolean;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  cardBg: string;
  chipActive: string;
  chipInactive: string;
}

const VisibilityView: React.FC<VisibilityViewProps> = ({
  products,
  brands,
  activeBrand,
  setActiveBrand,
  toggleVisibility,
  saving,
  isDark,
  textPrimary,
  textSecondary,
  textMuted,
  cardBg,
  chipActive,
  chipInactive,
}) => {
  const t = useCrmT();
  const [visFilter, setVisFilter] = useState<"all" | "visible" | "hidden">("all");

  const filtered = useMemo(() => {
    let result = products;
    if (activeBrand) result = result.filter((p) => p.brand_id === activeBrand);
    if (visFilter === "visible") result = result.filter((p) => p.is_visible);
    if (visFilter === "hidden") result = result.filter((p) => !p.is_visible);
    return result;
  }, [products, activeBrand, visFilter]);

  const visibleCount = products.filter((p) => (!activeBrand || p.brand_id === activeBrand) && p.is_visible).length;
  const hiddenCount = products.filter((p) => (!activeBrand || p.brand_id === activeBrand) && !p.is_visible).length;

  return (
    <div className="space-y-4">
      {/* Brand filter */}
      <div className="flex flex-wrap items-center gap-2">
        {brands.map((b) => (
          <button
            key={b.id}
            onClick={() => setActiveBrand(b.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeBrand === b.id ? chipActive : chipInactive
            }`}
          >
            {b.name}
          </button>
        ))}
      </div>

      {/* Visibility filter tabs */}
      <div className="flex items-center gap-2">
        {(
          [
            { id: "all" as const, label: `${t.inventory.visAll} (${visibleCount + hiddenCount})` },
            { id: "visible" as const, label: `${t.inventory.visDisplayed} (${visibleCount})` },
            { id: "hidden" as const, label: `${t.inventory.visHidden} (${hiddenCount})` },
          ] as const
        ).map((f) => (
          <button
            key={f.id}
            onClick={() => setVisFilter(f.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              visFilter === f.id ? chipActive : chipInactive
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {filtered.map((p) => (
          <div
            key={p.id}
            className={`relative rounded-lg border p-3 transition-all ${cardBg} ${
              !p.is_visible ? "opacity-50" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-1 mb-2">
              <div>
                <div className={`text-xs font-semibold ${textPrimary}`}>{p.shade_code}</div>
                <div className={`text-[10px] ${textSecondary}`}>{p.display_name || p.line_name}</div>
              </div>

              {/* Toggle */}
              <button
                onClick={() => toggleVisibility(p.id, !p.is_visible)}
                disabled={saving}
                className={`p-1 rounded transition-colors ${
                  p.is_visible
                    ? "text-emerald-500 hover:bg-emerald-500/10"
                    : isDark
                      ? "text-white/50 hover:bg-white/5"
                      : "text-black/50 hover:bg-black/5"
                }`}
                title={p.is_visible ? t.inventory.hideProduct : t.inventory.showProduct}
              >
                {p.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>

            <div className={`text-[10px] ${textMuted}`}>
              {p.is_visible ? t.inventory.displayed : t.inventory.hidden}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className={`text-center py-12 ${textSecondary}`}>
          <Eye className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">{t.inventory.noProductsFilter}</p>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
