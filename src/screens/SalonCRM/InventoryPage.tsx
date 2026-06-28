import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  Beaker,
  Box,
  Droplet,
  Droplets,
  Flame,
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
  Palette,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";
import { useSiteTheme } from "../../contexts/SiteTheme";
import { useToast } from "../../components/ui/toast";
import { useCrmT } from "./i18n/CrmLocale";
import {
  useBrands,
  useCRMActions,
  useInventoryItems,
  useProductLines,
  useProducts,
} from "./data/crmHooks";
import { useCRMState } from "./data/CRMDataProvider";
import {
  buildUIInventoryList,
  draftEditToActionInput,
  toUIBrand,
  toUIProductLine,
  type UIBrand as Brand,
  type UIInventoryProduct as InventoryProduct,
  type UIProductLine as ProductLine,
} from "./inventoryAdapters";

const CRM_INVENTORY_THEME = {
  nectarine: "#D7897F",
  peche: "#F9B95C",
  menthe: "#96C7B3",
  lagune: "#6398A9",
  rose: "#E8A6A0",
  sauge: "#B9CFA5",
  lilas: "#B8A7D9",
  shell: "#F5D3C2",
  paper: "#FFF8F0",
  paperStrong: "#FFFDF8",
  grid: "#EBDDD2",
  ink: "#141414",
  muted: "#7E7066",
};

// ── Types ─────────────────────────────────────────────────────────

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
type ProductVisualKind = "tube" | "bleach" | "shampoo" | "mask" | "retail" | "bottle";

// ── Helpers ───────────────────────────────────────────────────────

function getStockBadgeColor(qty: number, minStock: number): string {
  if (qty === 0) return "bg-gray-400";
  if (qty <= minStock) return "bg-red-500";
  if (qty <= minStock * 2) return "bg-amber-400";
  return "bg-emerald-400";
}

const INVENTORY_ACCENTS = [
  CRM_INVENTORY_THEME.nectarine,
  CRM_INVENTORY_THEME.peche,
  CRM_INVENTORY_THEME.menthe,
  CRM_INVENTORY_THEME.lagune,
  CRM_INVENTORY_THEME.rose,
  CRM_INVENTORY_THEME.lilas,
  CRM_INVENTORY_THEME.sauge,
];

function accentForIndex(index: number): string {
  return INVENTORY_ACCENTS[index % INVENTORY_ACCENTS.length];
}

function productKind(product: InventoryProduct): ProductVisualKind {
  const text = `${product.shade_code} ${product.display_name ?? ""} ${product.line_name ?? ""} ${product.line_slug ?? ""}`.toLowerCase();
  if (/(blond|bleach|platinium|premium|הבהר)/.test(text)) return "bleach";
  if (/(shampoo|שמפו)/.test(text)) return "shampoo";
  if (/(mask|masque|מסכה|k18)/.test(text)) return "mask";
  if (/(retail|home|no\.|bonding|acidic|olaplex|טיפול)/.test(text)) return "retail";
  if (/(keratin|straight|החלק)/.test(text)) return "bottle";
  if (product.size_grams >= 250) return "bottle";
  return "tube";
}

function productVisualMeta(kind: ProductVisualKind) {
  switch (kind) {
    case "bleach":
      return { label: "הבהרה", icon: Sparkles, color: "#F3D9A2" };
    case "shampoo":
      return { label: "שמפו", icon: Droplets, color: "#C8DDE2" };
    case "mask":
      return { label: "מסכה", icon: Box, color: "#D9D0EA" };
    case "retail":
      return { label: "ריטייל", icon: ShoppingBag, color: "#DCE7D1" };
    case "bottle":
      return { label: "בקבוק", icon: Droplet, color: "#CFE7DC" };
    default:
      return { label: "טיובה", icon: Palette, color: "#EBC7C1" };
  }
}

// ── Main Page Component ───────────────────────────────────────────

const InventoryPage: React.FC = () => {
  const { isDark } = useSiteTheme();
  const { addToast } = useToast();
  const t = useCrmT();
  const crmState = useCRMState();
  const actions = useCRMActions();

  // Canonical CRM data → projected to legacy view-model the UI was built for.
  const crmBrands = useBrands();
  const crmLines = useProductLines();
  const crmProducts = useProducts();
  const crmInventory = useInventoryItems();

  const brands = useMemo<Brand[]>(() => crmBrands.map(toUIBrand), [crmBrands]);
  const lines = useMemo<ProductLine[]>(
    () => crmLines.map(toUIProductLine),
    [crmLines],
  );
  const products = useMemo<InventoryProduct[]>(
    () => buildUIInventoryList(crmState),
    [crmState, crmInventory, crmProducts],
  );

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

  // Default brand selection once CRM hydrates.
  useEffect(() => {
    if (brands.length > 0 && !activeBrand) {
      setActiveBrand(brands[0].id);
    }
  }, [brands, activeBrand]);

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

  // Data hydration is handled by `CRMDataProvider`; the page just
  // reads the latest snapshot from `crmHooks` above.

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
  // All mutations go through `crmActions.updateInventory`. The reducer
  // updates the canonical state; React re-renders pull fresh values
  // through the selectors above, which in turn updates Home, Analytics,
  // AI insights, and any other consumer that watches the same data.

  const saveStockEdits = useCallback(async () => {
    const entries = Object.entries(draftEdits);
    if (entries.length === 0) return;

    setSaving(true);
    try {
      const failures: string[] = [];
      for (const [id, fields] of entries) {
        const r = actions.updateInventory(draftEditToActionInput(id, fields));
        if (!r.ok) failures.push(`${id}: ${r.error.message}`);
      }
      if (failures.length > 0) {
        addToast({
          message: `${t.inventory.saveFailed}\n${failures.join("\n")}`,
          type: "error",
        });
      } else {
        setDraftEdits({});
        addToast({
          message: t.inventory.updatedProducts.replace("{n}", String(entries.length)),
          type: "success",
        });
      }
    } finally {
      setSaving(false);
    }
  }, [draftEdits, actions, addToast, t]);

  const saveBarcode = useCallback(async (productId: string) => {
    const barcode = draftBarcodes[productId];
    if (barcode === undefined) return;

    setSaving(true);
    try {
      const r = actions.updateInventory({ inventoryItemId: productId, barcode: barcode || null });
      if (!r.ok) {
        addToast({ message: `${t.inventory.barcodeFailed}: ${r.error.message}`, type: "error" });
        return;
      }
      setDraftBarcodes((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
      addToast({ message: t.inventory.barcodeUpdated, type: "success" });
    } finally {
      setSaving(false);
    }
  }, [draftBarcodes, actions, addToast, t]);

  const toggleVisibility = useCallback(async (productId: string, newVisible: boolean) => {
    setSaving(true);
    try {
      const r = actions.updateInventory({ inventoryItemId: productId, isVisible: newVisible });
      if (!r.ok) {
        addToast({ message: `${t.inventory.visibilityFailed}: ${r.error.message}`, type: "error" });
        return;
      }
      addToast({
        message: newVisible ? t.inventory.productShown : t.inventory.productHidden,
        type: "success",
      });
    } finally {
      setSaving(false);
    }
  }, [actions, addToast, t]);

  // ── Style helpers ───────────────────────────────────────────────

  const cardBg = isDark ? "bg-white/[0.06] border-white/[0.08]" : "bg-[#FFFDF8] border-[#EBDDD2]";
  const textPrimary = isDark ? "text-white" : "text-[#141414]";
  const textSecondary = isDark ? "text-white/60" : "text-[#7E7066]";
  const textMuted = isDark ? "text-white/55" : "text-[#9A8B80]";
  const inputBg = isDark
    ? "bg-white/[0.06] border-white/[0.1] text-white placeholder:text-white/50"
    : "bg-[#FFF8F0] border-[#EBDDD2] text-[#141414] placeholder:text-[#9A8B80]";
  const chipActive = isDark ? "bg-white/[0.15] text-white" : "bg-[#F3C3BC] text-[#B05F57]";
  const chipInactive = isDark
    ? "bg-white/[0.05] text-white/50 hover:bg-white/[0.08]"
    : "bg-white/55 text-[#7E7066] hover:bg-[#F8E5D8] hover:text-[#141414]";

  // ── Shared summary bar ──────────────────────────────────────────

  const activeLineMeta = lines.find((l) => l.id === activeLine);
  const activeBrandMeta = brands.find((b) => b.id === activeBrand);
  const lineProducts = products.filter(
    (p) => p.product_line_id === activeLine && (!activeBrand || p.brand_id === activeBrand),
  );
  const activeBrandProducts = products.filter((p) => !activeBrand || p.brand_id === activeBrand);
  const lowStockCount = activeBrandProducts.filter((p) => p.units_in_stock <= p.min_stock).length;
  const totalInventoryUnits = activeBrandProducts.reduce((sum, p) => sum + p.units_in_stock, 0);
  const visibleProductCount = activeBrandProducts.filter((p) => p.is_visible).length;
  const activeBrandIndex = Math.max(0, brands.findIndex((b) => b.id === activeBrand));
  const activeBrandAccent = accentForIndex(activeBrandIndex);
  const seriesCards = filteredLines.map((line, index) => {
    const seriesProducts = products.filter((p) => p.product_line_id === line.id);
    return {
      line,
      accent: accentForIndex(index + activeBrandIndex),
      productCount: seriesProducts.length,
      units: seriesProducts.reduce((sum, p) => sum + p.units_in_stock, 0),
      low: seriesProducts.filter((p) => p.units_in_stock <= p.min_stock).length,
    };
  });
  const totalUnitsInLine = lineProducts.reduce((s, p) => s + p.units_in_stock, 0);
  const avgPrice =
    lineProducts.length > 0
      ? (lineProducts.reduce((s, p) => s + parseFloat(p.selling_price_usd), 0) / lineProducts.length).toFixed(2)
      : "0.00";

  const isStockView = viewMode === "stock-grid" || viewMode === "stock-table";

  return (
    <div className="space-y-3 rounded-[28px] border border-white/70 bg-[#FFF8F0]/78 p-3 shadow-[0_18px_54px_rgba(92,52,35,0.10)] sm:p-4">
      <section
        className="overflow-hidden rounded-[24px] border border-white/70 p-4 shadow-[0_14px_36px_rgba(92,52,35,0.10)]"
        style={{
          background:
            "radial-gradient(circle at 8% 22%, rgba(150,199,179,0.42), transparent 28%), radial-gradient(circle at 92% 8%, rgba(249,185,92,0.45), transparent 26%), linear-gradient(135deg, #FAD1BF 0%, #FFF8F0 54%, #D9E8DB 100%)",
        }}
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#B05F57]">Inventory studio</p>
            <h1 className={`mt-1 text-[24px] font-black tracking-[-0.05em] ${textPrimary}`}>ניהול מלאי צבעוני</h1>
            <p className={`mt-1 max-w-[640px] text-[12px] font-semibold leading-5 ${textSecondary}`}>
              ברנדים, סדרות ומוצרים במבנה מהיר: בוחרים ברנד, סדרה, ומעדכנים מלאי ישירות בכרטיס.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {isStockView && hasDirtyEdits && (
              <button
                onClick={saveStockEdits}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#D7897F] px-4 py-2 text-[11px] font-black text-white shadow-[0_10px_20px_rgba(215,137,127,0.22)] disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {t.inventory.saveChanges} ({Object.keys(draftEdits).length})
              </button>
            )}
            <div className="flex rounded-2xl bg-white/55 p-1 ring-1 ring-[#EBDDD2]">
              {([
                { id: "stock-grid", label: "מוצרים", icon: LayoutGrid },
                { id: "stock-table", label: "טבלה", icon: LayoutList },
                { id: "barcodes", label: "ברקודים", icon: ScanBarcode },
                { id: "visibility", label: "תצוגה", icon: Eye },
              ] as const).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setViewMode(tab.id)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[10px] font-black transition ${
                    viewMode === tab.id ? "bg-[#F3C3BC] text-[#B05F57]" : "text-[#7E7066] hover:bg-white/70"
                  }`}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <InventoryMetric label="מוצרים בברנד" value={String(activeBrandProducts.length)} icon={Package} color={activeBrandAccent} />
          <InventoryMetric label="יחידות במלאי" value={String(totalInventoryUnits)} icon={Box} color={CRM_INVENTORY_THEME.menthe} />
          <InventoryMetric label="מלאי נמוך" value={String(lowStockCount)} icon={AlertTriangle} color={CRM_INVENTORY_THEME.rose} />
        </div>
      </section>

      {isStockView && (
        <>
          <section className="rounded-[24px] border border-[#EBDDD2] bg-[#FFFDF8]/82 p-3 shadow-[0_10px_26px_rgba(92,52,35,0.07)]">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div>
                <p className="text-[14px] font-black">ברנדים</p>
                <p className={`mt-0.5 text-[10px] font-semibold ${textSecondary}`}>תפריט מהיר לפי מותג.</p>
              </div>
              <div className="relative hidden sm:block">
                <Search className={`pointer-events-none absolute start-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 ${textMuted}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.inventory.searchPlaceholder}
                  className={`w-56 rounded-2xl border py-1.5 pe-3 ps-9 text-[11px] font-semibold ${inputBg}`}
                />
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {brands.map((brand, index) => {
                const brandProducts = products.filter((p) => p.brand_id === brand.id);
                const accent = accentForIndex(index);
                const active = activeBrand === brand.id;
                return (
                  <button
                    key={brand.id}
                    onClick={() => {
                      setActiveBrand(brand.id);
                      const firstLine = lines.find((line) => line.brand_id === brand.id);
                      if (firstLine) setActiveLine(firstLine.id);
                    }}
                    className={`relative flex min-w-[132px] items-center gap-2 overflow-hidden rounded-2xl border px-3 py-2 text-right transition ${
                      active ? "border-[#EBDDD2] bg-white shadow-[0_8px_18px_rgba(92,52,35,0.10)]" : "border-[#EBDDD2] bg-white/50 hover:bg-white/72"
                    }`}
                  >
                    <span className="absolute inset-y-3 start-0 w-1 rounded-full opacity-75" style={{ background: accent }} />
                    <span className="relative grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-[#F8F0E6] text-[#7E7066] ring-1 ring-[#EBDDD2]">
                      <Flame className="h-3.5 w-3.5" />
                    </span>
                    <span className="relative min-w-0">
                      <span className="block truncate text-[12px] font-black">{brand.name}</span>
                      <span className="mt-0.5 block text-[10px] font-bold text-[#7E7066]">{brandProducts.length} מוצרים</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-[24px] border border-[#EBDDD2] bg-[#FFFDF8]/82 p-3 shadow-[0_10px_26px_rgba(92,52,35,0.07)]">
            <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[14px] font-black">סדרות של {activeBrandMeta?.name ?? "הברנד"}</p>
                <p className={`mt-0.5 text-[10px] font-semibold ${textSecondary}`}>בחירה מהירה של סדרה.</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {([
                  { id: "all" as StockFilter, label: t.inventory.fullCatalog, dot: "bg-gray-500" },
                  { id: "in-stock" as StockFilter, label: t.inventory.inStock, dot: "bg-emerald-500" },
                  { id: "low-stock" as StockFilter, label: t.inventory.lowStock, dot: "bg-red-500" },
                ] as const).map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setStockFilter(f.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black transition ${
                      stockFilter === f.id ? "bg-[#F3C3BC] text-[#B05F57]" : "bg-white/70 text-[#7E7066] ring-1 ring-[#EBDDD2]"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${f.dot}`} />
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {seriesCards.map(({ line, accent, productCount, units, low }) => (
                <button
                  key={line.id}
                  onClick={() => setActiveLine(line.id)}
                  className={`min-w-[178px] overflow-hidden rounded-2xl border text-right transition ${
                    activeLine === line.id ? "border-[#EBDDD2] bg-white shadow-[0_8px_18px_rgba(92,52,35,0.10)]" : "border-[#EBDDD2] bg-white/50 hover:bg-white/72"
                  }`}
                >
                  <div className="h-1" style={{ background: accent }} />
                  <div className="p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[12px] font-black">{line.name}</p>
                        <p className="mt-0.5 text-[10px] font-bold text-[#7E7066]">{productCount} מוצרים · {units} יחידות</p>
                      </div>
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-[#F8F0E6] text-[#7E7066] ring-1 ring-[#EBDDD2]">
                        <Beaker className="h-3.5 w-3.5" />
                      </span>
                    </div>
                    {low > 0 && (
                      <span className="mt-2 inline-flex rounded-full bg-[#FBE2DE] px-2 py-0.5 text-[9px] font-black text-[#B05F57]">
                        {low} במלאי נמוך
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </section>
        </>
      )}

      {isStockView && activeLineMeta && (
        <div className="flex flex-col gap-2 rounded-[20px] border border-[#EBDDD2] bg-[#FFFDF8]/72 px-3 py-2 sm:flex-row sm:items-baseline sm:justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className={`text-sm font-black ${textPrimary}`}>{activeLineMeta.name}</span>
            <span className={`text-xs ${textSecondary}`}>&middot; {lineProducts.length} {t.inventory.shadesCount}</span>
          </div>
          <div className={`flex items-center gap-3 text-xs ${textSecondary}`}>
            <span>{t.inventory.avgPriceFull}: <span className="font-black">${avgPrice}</span></span>
            <span>{t.inventory.unitsFull}: <span className="font-black">{totalUnitsInLine}</span></span>
            <span>מוצגים: <span className="font-black">{visibleProductCount}</span></span>
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

function InventoryMetric({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="inline-flex min-w-[150px] items-center justify-between gap-3 rounded-2xl border border-white/70 bg-white/62 px-3 py-2 shadow-[0_8px_18px_rgba(92,52,35,0.07)]">
      <div className="flex items-center justify-between gap-3">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#F8F0E6] text-[#7E7066] ring-1 ring-white/70">
          <span className="h-2 w-2 rounded-full" style={{ background: color }} />
        </span>
        <p className="text-[11px] font-black text-[#7E7066]">{label}</p>
      </div>
      <span className="text-[20px] font-black tracking-[-0.05em] text-[#141414]">{value}</span>
    </div>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-xl border border-[#EBDDD2] bg-white/68 px-2 py-1.5">
      <p className="text-[9px] font-bold text-[#9A8B80]">{label}</p>
      <div className="mt-0.5 flex items-center gap-1.5">
        {tone && <span className={`h-2 w-2 rounded-full ${tone}`} />}
        <p className="text-[12px] font-black text-[#141414]">{value}</p>
      </div>
    </div>
  );
}

function ProductPackshot({
  kind,
  accent,
  label,
}: {
  kind: ProductVisualKind;
  accent: string;
  label: string;
}) {
  if (kind === "bleach" || kind === "mask") {
    return (
      <div className="relative grid h-[78px] w-[58px] place-items-center">
        <div className="absolute bottom-1 h-[40px] w-[54px] rounded-[14px] border border-white/80 bg-gradient-to-b from-white to-[#F8F0E6] shadow-[0_10px_18px_rgba(92,52,35,0.12)]" />
        <div className="absolute bottom-[42px] h-4 w-[42px] rounded-t-[14px] border border-white/80" style={{ background: accent }} />
        <div className="absolute bottom-4 h-4 w-9 rounded-full opacity-55" style={{ background: accent }} />
        <span className="absolute bottom-7 max-w-[40px] truncate text-[7px] font-black text-[#141414]">{kind === "bleach" ? "LIGHT" : "MASK"}</span>
      </div>
    );
  }

  if (kind === "shampoo" || kind === "bottle" || kind === "retail") {
    return (
      <div className="relative grid h-[78px] w-[52px] place-items-center">
        <div className="absolute top-1 h-3 w-6 rounded-t-xl bg-[#141414]/70" />
        <div
          className="absolute top-3 h-[64px] w-[34px] rounded-[14px] border border-white/80 shadow-[0_10px_18px_rgba(92,52,35,0.12)]"
          style={{ background: `linear-gradient(180deg, #FFFDF8 0%, ${accent} 100%)` }}
        />
        <div className="absolute top-8 h-7 w-7 rounded-full bg-white/55" />
        <span className="absolute bottom-3 max-w-[32px] truncate text-[7px] font-black text-[#141414]">{kind === "shampoo" ? "SH" : kind === "retail" ? "HOME" : "PRO"}</span>
      </div>
    );
  }

  return (
    <div className="relative grid h-[78px] w-[52px] place-items-center">
      <div
        className="absolute bottom-1 h-[68px] w-[24px] rounded-b-[8px] rounded-t-[4px] border border-white/80 shadow-[0_10px_18px_rgba(92,52,35,0.12)]"
        style={{ background: `linear-gradient(180deg, #F7F2EC 0%, ${accent} 100%)` }}
      />
      <div className="absolute bottom-[63px] h-3 w-7 rounded-t-md bg-[#D8D2CC]" />
      <div className="absolute bottom-6 h-7 w-5 rounded-sm bg-white/50" />
      <span className="absolute bottom-8 max-w-[22px] truncate text-center text-[7px] font-black text-[#141414]">{label}</span>
    </div>
  );
}

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

  if (products.length === 0) {
    return (
      <div className={`text-center py-12 ${textSecondary}`}>
        <Package className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm">{t.inventory.noProductsFilter}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {products.map((item) => {
        const qty = getDraftValue(item, "units_in_stock");
        const dirty = isProductDirty(item.id);
        const kind = productKind(item);
        const meta = productVisualMeta(kind);
        const VisualIcon = meta.icon;
        const isLow = qty <= item.min_stock;

        return (
          <article
            key={item.id}
            className={`relative overflow-hidden rounded-[22px] border bg-[#FFFDF8] p-3 shadow-[0_10px_24px_rgba(92,52,35,0.08)] transition ${
              dirty ? "ring-2 ring-[#F9B95C]/60" : ""
            } ${isDark ? cardBg : "border-[#EBDDD2]"}`}
          >
            <div className="absolute inset-y-5 start-0 w-1 rounded-full opacity-70" style={{ background: meta.color }} />
            <div className="relative flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full bg-[#F8F0E6] px-2 py-0.5 text-[9px] font-black text-[#7E7066] ring-1 ring-[#EBDDD2]">
                    <span className="me-1 inline-block h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
                    {meta.label}
                  </span>
                  {isLow && (
                    <span className="rounded-full bg-[#FBE2DE] px-2 py-0.5 text-[9px] font-black text-[#B05F57]">
                      מלאי נמוך
                    </span>
                  )}
                </div>
                <h3 className={`mt-2 truncate text-[16px] font-black tracking-[-0.04em] ${textPrimary}`}>
                  {item.shade_code}
                </h3>
                <p className={`mt-0.5 line-clamp-1 text-[11px] font-bold leading-5 ${textSecondary}`}>
                  {item.display_name || item.line_name || "מוצר מלאי"}
                </p>
                <p className="mt-0.5 text-[9px] font-bold text-[#9A8B80]">
                  {item.brand_name} · {item.size_grams || 50}g
                </p>
              </div>

              <div className="shrink-0">
                <ProductPackshot kind={kind} accent={meta.color} label={item.shade_code} />
              </div>
            </div>

            <div className="relative mt-3 grid grid-cols-3 gap-1.5">
              <MiniStat label="במלאי" value={String(qty)} tone={getStockBadgeColor(qty, item.min_stock)} />
              <MiniStat label="מינימום" value={String(item.min_stock)} />
              <MiniStat label="מחיר" value={`$${item.selling_price_usd}`} />
            </div>

            <div className="relative mt-2 flex items-center gap-2 rounded-2xl border border-[#EBDDD2] bg-[#FFF8F0]/78 p-1.5">
              <VisualIcon className="h-3.5 w-3.5 text-[#7E7066]" />
              <span className="text-[10px] font-black text-[#7E7066]">מלאי</span>
              <input
                type="number"
                min={0}
                value={qty}
                onChange={(e) =>
                  setDraftField(item.id, "units_in_stock", Math.max(0, parseInt(e.target.value) || 0))
                }
                className="ms-auto w-14 rounded-xl border border-[#EBDDD2] bg-white/75 px-2 py-1 text-center text-[12px] font-black text-[#141414] outline-none focus:border-[#D7897F]"
              />
            </div>
          </article>
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

  const colHeader = `text-[10px] uppercase tracking-wider font-semibold ${isDark ? "text-white/55" : "text-[#7E7066]"}`;
  const cellInput = `w-full text-xs text-center rounded border px-2 py-1.5 ${inputBg} focus:outline-none focus:ring-1 ${
    isDark ? "focus:ring-white/20" : "focus:ring-black/20"
  }`;

  return (
    <div className={`rounded-2xl border overflow-x-auto ${isDark ? "border-white/[0.08]" : "border-[#EBDDD2] bg-[#FFFDF8]"}`}>
      <table className="w-full min-w-[640px]">
        <thead>
          <tr className={isDark ? "bg-white/[0.04]" : "bg-[#F8E5D8]/70"}>
            <th className={`px-3 py-2.5 text-start ${colHeader}`}>{t.inventory.shade}</th>
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
                  isDark ? "border-white/[0.04]" : "border-[#EBDDD2]"
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
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${
            isDark ? "bg-blue-900/20 border-blue-400/30" : "bg-[#D9E8DB] border-[#96C7B3]/50"
          }`}
        >
          <ScanBarcode className="w-5 h-5 text-[#315A4B] animate-pulse" />
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
            className={`ms-auto p-1 rounded ${isDark ? "hover:bg-white/10" : "hover:bg-black/5"}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Product list */}
      <div className={`rounded-2xl border overflow-hidden ${isDark ? "border-white/[0.08]" : "border-[#EBDDD2] bg-[#FFFDF8]"}`}>
        <table className="w-full">
          <thead>
            <tr className={isDark ? "bg-white/[0.04]" : "bg-[#F8E5D8]/70"}>
              <th className={`px-3 py-2 text-start text-[10px] uppercase tracking-wider font-semibold ${textMuted}`}>
                {t.inventory.shade}
              </th>
              <th className={`px-3 py-2 text-start text-[10px] uppercase tracking-wider font-semibold ${textMuted}`}>
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
                  className={`border-t ${isDark ? "border-white/[0.04]" : "border-[#EBDDD2]"}`}
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
