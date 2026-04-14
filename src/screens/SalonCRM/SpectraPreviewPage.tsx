import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Sparkles,
  Package,
  Users,
  Calendar,
  TrendingUp,
  LayoutGrid,
  LayoutList,
  Search,
  AlertTriangle,
  Palette,
  Brain,
  Clock,
  DollarSign,
  ArrowRight,
  BarChart3,
  Loader2,
  ShoppingCart,
  Star,
  Zap,
  Eye,
} from "lucide-react";
import { apiClient } from "../../api/client";
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

type PreviewTab = "overview" | "color-stock" | "orders" | "clients" | "ai-mix" | "reports";
type StockFilter = "all" | "in-stock" | "low-stock";

// ── Light-mode design tokens ──────────────────────────────────────

const T = {
  card: "bg-white border border-black/[0.06] rounded-xl shadow-sm",
  text1: "text-[#1A1A1A]",
  text2: "text-black/60",
  textM: "text-black/55",
  chipOn: "bg-black text-white",
  chipOff: "bg-black/[0.03] text-black/60 hover:bg-black/[0.06]",
  sectionBg: "bg-gray-50/40",
  sectionBorder: "border-black/[0.05]",
  inputBg: "bg-white border-black/[0.1] text-black placeholder:text-black/50",
} as const;

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

// ── Demo data for non-API sections ────────────────────────────────

const DEMO_CLIENTS = [
  { name: "Sarah Mitchell", visits: 12, lastVisit: "Feb 24", topColor: "6.35 Majirel", satisfaction: 98 },
  { name: "Emma Rodriguez", visits: 8, lastVisit: "Feb 20", topColor: "7.44 Dia Richesse", satisfaction: 95 },
  { name: "Lisa Chen", visits: 15, lastVisit: "Feb 28", topColor: "5.0 INOA", satisfaction: 100 },
  { name: "Maria Johnson", visits: 6, lastVisit: "Feb 15", topColor: "8.1 Majirel", satisfaction: 92 },
];

const DEMO_ORDERS = [
  { id: "ORD-2024-031", date: "Mar 1", brand: "L'Oréal", items: 24, total: "$312.00", status: "Delivered" },
  { id: "ORD-2024-028", date: "Feb 25", brand: "Wella", items: 12, total: "$186.00", status: "In Transit" },
  { id: "ORD-2024-025", date: "Feb 18", brand: "L'Oréal", items: 36, total: "$468.00", status: "Delivered" },
  { id: "ORD-2024-021", date: "Feb 10", brand: "Redken", items: 8, total: "$124.00", status: "Delivered" },
];

const DEMO_AI_FORMULAS = [
  { client: "Sarah M.", target: "Warm Caramel Balayage", base: "6.35", mix: "7.44 + 8.3 (1:1)", dev: "20 vol", time: "35 min" },
  { client: "Emma R.", target: "Cool Ash Blonde", base: "8.1", mix: "9.1 + 10.01 (2:1)", dev: "30 vol", time: "40 min" },
  { client: "New Client", target: "Rich Chocolate", base: "4.0", mix: "5.35 + 4.15 (3:1)", dev: "20 vol", time: "30 min" },
];

const DEMO_REVENUE = [
  { month: "Sep", value: 8200 },
  { month: "Oct", value: 9100 },
  { month: "Nov", value: 8800 },
  { month: "Dec", value: 11400 },
  { month: "Jan", value: 10200 },
  { month: "Feb", value: 12100 },
];

// ── Main Page ─────────────────────────────────────────────────────

const SpectraPreviewPage: React.FC = () => {
  const { addToast } = useToast();
  const t = useCrmT();
  const [activeTab, setActiveTab] = useState<PreviewTab>("overview");

  // Inventory data
  const [brands, setBrands] = useState<Brand[]>([]);
  const [lines, setLines] = useState<ProductLine[]>([]);
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Stock filters
  const [activeBrand, setActiveBrand] = useState("");
  const [activeLine, setActiveLine] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredLines = useMemo(
    () => lines.filter((l) => !activeBrand || l.brand_id === activeBrand),
    [lines, activeBrand],
  );

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
          (p.display_name || "").toLowerCase().includes(q),
      );
    }
    return result;
  }, [products, activeBrand, activeLine, stockFilter, searchQuery]);

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

  useEffect(() => {
    if (filteredLines.length > 0 && !filteredLines.find((l) => l.id === activeLine)) {
      setActiveLine(filteredLines[0].id);
    }
  }, [filteredLines, activeLine]);

  // Computed metrics
  const totalShades = products.length;
  const inStockCount = products.filter((p) => p.units_in_stock > 0).length;
  const lowStockCount = products.filter((p) => p.units_in_stock > 0 && p.units_in_stock <= p.min_stock).length;
  const totalValue = products.reduce((s, p) => s + p.units_in_stock * parseFloat(p.selling_price_usd || "0"), 0);

  const activeLineMeta = lines.find((l) => l.id === activeLine);
  const lineProducts = products.filter(
    (p) => p.product_line_id === activeLine && (!activeBrand || p.brand_id === activeBrand),
  );
  const totalUnitsInLine = lineProducts.reduce((s, p) => s + p.units_in_stock, 0);
  const avgPrice =
    lineProducts.length > 0
      ? (lineProducts.reduce((s, p) => s + parseFloat(p.selling_price_usd), 0) / lineProducts.length).toFixed(2)
      : "0.00";

  const TABS: { id: PreviewTab; label: string; icon: React.FC<any> }[] = [
    { id: "overview",    label: t.spectra.tabOverview,   icon: Sparkles },
    { id: "color-stock", label: t.spectra.tabColorStock, icon: Package },
    { id: "orders",      label: t.spectra.tabOrders,     icon: ShoppingCart },
    { id: "clients",     label: t.spectra.tabClients,    icon: Users },
    { id: "ai-mix",      label: t.spectra.tabAiMix,      icon: Brain },
    { id: "reports",     label: t.spectra.tabReports,    icon: BarChart3 },
  ];

  return (
    <div className="space-y-4">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h1 className={`text-lg font-semibold ${T.text1}`}>{t.spectra.title}</h1>
            <p className={`text-xs ${T.text2}`}>{t.spectra.subtitle}</p>
          </div>
        </div>
      </div>

      {/* ── Tab navigation ── */}
      <div className={`rounded-xl border ${T.sectionBorder} ${T.sectionBg} px-2 py-1.5`}>
        <div className="flex items-center gap-1 overflow-x-auto flex-nowrap">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id ? T.chipOn : T.chipOff
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ── */}
      {loading && activeTab === "color-stock" ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className={`w-6 h-6 animate-spin ${T.textM}`} />
        </div>
      ) : (
        <>
          {activeTab === "overview" && (
            <OverviewTab
              totalShades={totalShades}
              inStockCount={inStockCount}
              lowStockCount={lowStockCount}
              totalValue={totalValue}
              loading={loading}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === "color-stock" && (
            <ColorStockTab
              brands={brands}
              filteredLines={filteredLines}
              filteredProducts={filteredProducts}
              activeBrand={activeBrand}
              setActiveBrand={setActiveBrand}
              activeLine={activeLine}
              setActiveLine={setActiveLine}
              stockFilter={stockFilter}
              setStockFilter={setStockFilter}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              viewMode={viewMode}
              setViewMode={setViewMode}
              activeLineMeta={activeLineMeta}
              lineProducts={lineProducts}
              totalUnitsInLine={totalUnitsInLine}
              avgPrice={avgPrice}
            />
          )}

          {activeTab === "orders" && <OrdersTab />}
          {activeTab === "clients" && <ClientsTab />}
          {activeTab === "ai-mix" && <AIMixTab />}
          {activeTab === "reports" && <ReportsTab totalValue={totalValue} totalShades={totalShades} />}
        </>
      )}
    </div>
  );
};

// ── Overview Tab ──────────────────────────────────────────────────

interface OverviewTabProps {
  totalShades: number;
  inStockCount: number;
  lowStockCount: number;
  totalValue: number;
  loading: boolean;
  onNavigate: (tab: PreviewTab) => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  totalShades, inStockCount, lowStockCount, totalValue, loading, onNavigate,
}) => {
  const t = useCrmT();
  const metrics = [
    { label: t.spectra.totalShades,     value: loading ? "..." : totalShades.toString(),   icon: Palette,       accent: "from-violet-400 to-purple-500" },
    { label: t.spectra.inStock,         value: loading ? "..." : inStockCount.toString(),  icon: Package,       accent: "from-emerald-400 to-green-500" },
    { label: t.spectra.lowStockAlerts,  value: loading ? "..." : lowStockCount.toString(), icon: AlertTriangle, accent: "from-amber-400 to-orange-500" },
    { label: t.spectra.stockValue,      value: loading ? "..." : `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, icon: DollarSign, accent: "from-blue-400 to-indigo-500" },
  ];

  const features = [
    { title: t.spectra.colorInventoryTitle,    desc: t.spectra.colorInventoryDesc,    icon: Package,     tab: "color-stock" as PreviewTab },
    { title: t.spectra.orderManagementTitle,   desc: t.spectra.orderManagementDesc,   icon: ShoppingCart, tab: "orders" as PreviewTab },
    { title: t.spectra.clientProfilesTitle,    desc: t.spectra.clientProfilesDesc,    icon: Users,       tab: "clients" as PreviewTab },
    { title: t.spectra.aiMixingTitle,          desc: t.spectra.aiMixingDesc,          icon: Brain,       tab: "ai-mix" as PreviewTab },
    { title: t.spectra.schedulingTitle,        desc: t.spectra.schedulingDesc,        icon: Calendar,    tab: "overview" as PreviewTab },
    { title: t.spectra.reportsTitle,           desc: t.spectra.reportsDesc,           icon: BarChart3,   tab: "reports" as PreviewTab },
  ];

  return (
    <div className="space-y-4">
      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className={`${T.card} p-4`}>
            <div className="flex items-start justify-between mb-3">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${m.accent} flex items-center justify-center`}>
                <m.icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className={`text-xl font-bold ${T.text1}`}>{m.value}</div>
            <div className={`text-[11px] ${T.text2} mt-0.5`}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Feature cards */}
      <div>
        <h2 className={`text-sm font-semibold ${T.text1} mb-3`}>{t.spectra.capabilities}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {features.map((f) => (
            <button
              key={f.title}
              onClick={() => onNavigate(f.tab)}
              className={`${T.card} p-4 text-left hover:shadow-md transition-all group`}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-black/[0.04] flex items-center justify-center flex-shrink-0 group-hover:bg-black/[0.08] transition-colors">
                  <f.icon className={`w-4.5 h-4.5 ${T.text2} group-hover:text-black/80 transition-colors`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${T.text1} flex items-center gap-1`}>
                    {f.title}
                    <ArrowRight className={`w-3 h-3 ${T.textM} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  </div>
                  <div className={`text-[11px] ${T.text2} mt-0.5 leading-relaxed`}>{f.desc}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick revenue chart */}
      <div className={T.card}>
        <div className="p-4 pb-2 flex items-center justify-between">
          <div>
            <h3 className={`text-sm font-semibold ${T.text1}`}>{t.spectra.revenueTrend}</h3>
            <p className={`text-[11px] ${T.text2}`}>{t.spectra.revenueTrendDesc}</p>
          </div>
          <button
            onClick={() => onNavigate("reports")}
            className={`text-[11px] font-medium ${T.text2} hover:text-black flex items-center gap-1 transition-colors`}
          >
            {t.spectra.viewAll} <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="px-4 pb-4">
          <MiniBarChart data={DEMO_REVENUE} />
        </div>
      </div>
    </div>
  );
};

// ── Mini bar chart (pure CSS) ─────────────────────────────────────

const MiniBarChart: React.FC<{ data: { month: string; value: number }[] }> = ({ data }) => {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-2 h-28 mt-2">
      {data.map((d) => (
        <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
          <span className={`text-[10px] font-medium ${T.text1}`}>
            ${(d.value / 1000).toFixed(1)}k
          </span>
          <div
            className="w-full rounded-t-md bg-gradient-to-t from-black/80 to-black/50 transition-all"
            style={{ height: `${(d.value / max) * 100}%`, minHeight: 4 }}
          />
          <span className={`text-[10px] ${T.textM}`}>{d.month}</span>
        </div>
      ))}
    </div>
  );
};

// ── Color Stock Tab ───────────────────────────────────────────────

interface ColorStockTabProps {
  brands: Brand[];
  filteredLines: ProductLine[];
  filteredProducts: InventoryProduct[];
  activeBrand: string;
  setActiveBrand: (id: string) => void;
  activeLine: string;
  setActiveLine: (id: string) => void;
  stockFilter: StockFilter;
  setStockFilter: (f: StockFilter) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  viewMode: "grid" | "list";
  setViewMode: (m: "grid" | "list") => void;
  activeLineMeta?: ProductLine;
  lineProducts: InventoryProduct[];
  totalUnitsInLine: number;
  avgPrice: string;
}

const ColorStockTab: React.FC<ColorStockTabProps> = ({
  brands, filteredLines, filteredProducts,
  activeBrand, setActiveBrand, activeLine, setActiveLine,
  stockFilter, setStockFilter, searchQuery, setSearchQuery,
  viewMode, setViewMode, activeLineMeta, lineProducts, totalUnitsInLine, avgPrice,
}) => {
  const t = useCrmT();
  return (
    <div className="space-y-3">
      {/* Filter bar */}
      <div className={`rounded-xl border ${T.sectionBorder} ${T.sectionBg} px-2 py-1.5`}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-2 overflow-x-auto flex-nowrap">
            {([
              { id: "all" as StockFilter, label: t.inventory.fullCatalog, dot: "bg-gray-500" },
              { id: "in-stock" as StockFilter, label: t.inventory.inStock, dot: "bg-emerald-500" },
              { id: "low-stock" as StockFilter, label: t.inventory.lowStock, dot: "bg-red-500" },
            ] as const).map((f) => (
              <button
                key={f.id}
                onClick={() => setStockFilter(f.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  stockFilter === f.id ? T.chipOn : T.chipOff
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${f.dot}`} />
                {f.label}
              </button>
            ))}
            <div className="relative shrink-0">
              <Search className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${T.textM}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.spectra.searchShadePlaceholder}
                className={`w-44 sm:w-48 pl-8 pr-3 py-2 rounded-lg border text-xs ${T.inputBg}`}
              />
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0 sm:ml-auto">
            <span className={`text-xs ${T.text2} mr-1`}>{t.spectra.viewLabel}</span>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-black/[0.08]" : "opacity-40 hover:opacity-70"}`}
            >
              <LayoutList className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-black/[0.08]" : "opacity-40 hover:opacity-70"}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Brand + Line selectors */}
      <div className={`rounded-xl border ${T.sectionBorder} ${T.sectionBg} px-3 py-3 space-y-3`}>
        <div className="flex items-center gap-2 overflow-x-auto flex-nowrap sm:flex-wrap">
          <span className={`text-[10px] uppercase tracking-widest font-semibold ${T.textM} shrink-0`}>{t.inventory.brand}</span>
          {brands.map((b) => (
            <button
              key={b.id}
              onClick={() => setActiveBrand(b.id)}
              className={`px-3 py-2 rounded-lg border text-xs font-medium whitespace-nowrap transition-all ${
                activeBrand === b.id
                  ? "border-black/25 bg-white text-black shadow-sm"
                  : "border-transparent text-black/55 hover:text-black/70"
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>

        {filteredLines.length > 0 && (
          <>
            <div className={`border-t ${T.sectionBorder}`} />
            <div className="space-y-1.5">
              <span className={`text-[10px] uppercase tracking-widest font-semibold ${T.textM} shrink-0`}>{t.spectra.productLineLabel}</span>
              <div className="overflow-x-auto">
                <div className={`inline-flex items-center rounded-lg border overflow-hidden ${T.sectionBorder}`}>
                  {filteredLines.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setActiveLine(l.id)}
                      className={`min-w-[90px] max-w-[160px] text-center text-xs font-medium py-2.5 px-3 whitespace-nowrap transition-all ${
                        activeLine === l.id
                          ? "bg-black text-white"
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

      {/* Line summary */}
      {activeLineMeta && (
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 px-1">
          <div className="flex items-baseline gap-1.5">
            <span className={`text-sm font-semibold ${T.text1}`}>{activeLineMeta.name}</span>
            <span className={`text-xs ${T.text2}`}>&middot; {lineProducts.length} {t.spectra.shadesCount}</span>
          </div>
          <div className={`text-xs ${T.text2} flex items-center gap-3`}>
            <span>{t.spectra.avgPriceLabel}: <span className="font-medium">${avgPrice}</span></span>
            <span>{t.spectra.unitsLabel}: <span className="font-medium">{totalUnitsInLine}</span></span>
          </div>
        </div>
      )}

      {/* Stock view */}
      {viewMode === "grid" ? (
        <StockGrid products={filteredProducts} />
      ) : (
        <StockTable products={filteredProducts} />
      )}
    </div>
  );
};

// ── Stock Grid (tube cards) ───────────────────────────────────────

const StockGrid: React.FC<{ products: InventoryProduct[] }> = ({ products }) => {
  const t = useCrmT();
  const levelMap = groupByLevel(products);
  const levels = Array.from(levelMap.keys()).sort((a, b) => (a ?? 99) - (b ?? 99));

  if (products.length === 0) {
    return (
      <div className={`text-center py-12 ${T.text2}`}>
        <Package className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm">{t.spectra.noProducts}</p>
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
            className={`flex items-start gap-4 border-t border-black/[0.06] py-3 min-h-[48px] ${
              items.length === 0 ? "opacity-50" : ""
            }`}
          >
            <div className="w-[80px] flex-shrink-0 pt-1">
              <span className={`text-xs whitespace-nowrap font-medium ${T.text2}`}>
                {level != null ? `${t.spectra.levelLabel} ${level}` : t.spectra.otherLevel}
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              {items.map((item) => {
                const qty = item.units_in_stock;
                const badgeColor = getStockBadgeColor(qty, item.min_stock);

                return (
                  <div key={item.id} className="flex flex-col items-center gap-1">
                    <div className="relative w-[80px] sm:w-[88px] bg-white rounded-md shadow-[2px_1.5px_4.5px_rgba(6,36,102,0.13)] border border-black/[0.04] p-2 pt-5 flex flex-col items-center">
                      <span
                        className={`absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-md border-2 border-white z-10 ${badgeColor}`}
                      >
                        {qty}
                      </span>
                      <div className="w-5 h-[72px] relative flex items-end justify-center">
                        <div className="absolute inset-0 w-[18px] mx-auto rounded-sm bg-gradient-to-b from-gray-200 to-gray-300" />
                        <div className="relative w-full h-[64px]">
                          <div className="absolute inset-0 mx-auto w-[20px] bg-gradient-to-b from-[#e8e8ea] via-[#d0d0d4] to-[#c4c4c8] rounded-[2px]" />
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[16px] h-[52px] bg-gradient-to-b from-[#f0f0f2] to-[#dcdce0] rounded-[1px]" />
                        </div>
                      </div>
                      <span className="text-[8px] text-gray-400 mt-1">{item.size_grams || 50}gr</span>
                    </div>
                    <span className={`text-[11px] font-light tracking-wide ${T.text2}`}>
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

// ── Stock Table ───────────────────────────────────────────────────

const StockTable: React.FC<{ products: InventoryProduct[] }> = ({ products }) => {
  const t = useCrmT();

  if (products.length === 0) {
    return (
      <div className={`text-center py-12 ${T.text2}`}>
        <Package className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm">{t.spectra.noProducts}</p>
      </div>
    );
  }

  const colHeader = `text-[10px] uppercase tracking-wider font-semibold text-black/55`;

  return (
    <div className="rounded-lg border border-black/[0.06] overflow-x-auto">
      <table className="w-full min-w-[580px]">
        <thead>
          <tr className="bg-gray-50/80">
            <th className={`px-3 py-2.5 text-left ${colHeader}`}>{t.spectra.shadeCol}</th>
            <th className={`px-3 py-2.5 text-center ${colHeader}`}>{t.spectra.unitsCol}</th>
            <th className={`px-3 py-2.5 text-center ${colHeader}`}>{t.spectra.minStockCol}</th>
            <th className={`px-3 py-2.5 text-center ${colHeader}`}>{t.spectra.costCol}</th>
            <th className={`px-3 py-2.5 text-center ${colHeader}`}>{t.spectra.priceCol}</th>
            <th className={`px-3 py-2.5 text-center ${colHeader}`}>{t.spectra.marginCol}</th>
            <th className={`px-3 py-2.5 text-center ${colHeader}`}>{t.spectra.stockStatusCol}</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const isLow = p.units_in_stock > 0 && p.units_in_stock <= p.min_stock;
            const isOut = p.units_in_stock === 0;
            return (
              <tr
                key={p.id}
                className={`border-t border-black/[0.04] ${
                  isLow ? "bg-red-50/40" : isOut ? "bg-gray-50/40" : ""
                }`}
              >
                <td className={`px-3 py-2 ${T.text1}`}>
                  <div className="flex items-center gap-2">
                    {isLow && <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />}
                    <div>
                      <div className="text-xs font-medium">{p.shade_code}</div>
                      {p.display_name && <div className={`text-[10px] ${T.text2}`}>{p.display_name}</div>}
                    </div>
                  </div>
                </td>
                <td className={`px-3 py-2 text-xs text-center font-medium ${T.text1}`}>{p.units_in_stock}</td>
                <td className={`px-3 py-2 text-xs text-center ${T.text2}`}>{p.min_stock}</td>
                <td className={`px-3 py-2 text-xs text-center ${T.text2}`}>${parseFloat(p.cost_usd).toFixed(2)}</td>
                <td className={`px-3 py-2 text-xs text-center ${T.text1}`}>${parseFloat(p.selling_price_usd).toFixed(2)}</td>
                <td className={`px-3 py-2 text-xs text-center ${T.text2}`}>{parseFloat(p.margin_pct).toFixed(1)}%</td>
                <td className="px-3 py-2 text-center">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      isOut ? "bg-gray-400" : isLow ? "bg-red-500" : "bg-emerald-400"
                    }`}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ── Orders Tab ────────────────────────────────────────────────────

const OrdersTab: React.FC = () => {
  const t = useCrmT();
  const statusKeyMap: Record<string, string> = {
    "Delivered": t.spectra.statusDelivered,
    "In Transit": t.spectra.statusInTransit,
    "Pending": t.spectra.statusPending,
  };
  const statusColor: Record<string, string> = {
    "Delivered": "bg-emerald-100 text-emerald-700",
    "In Transit": "bg-amber-100 text-amber-700",
    "Pending": "bg-gray-100 text-gray-600",
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className={`text-sm font-semibold ${T.text1}`}>{t.spectra.recentOrders}</h2>
        <button className={`text-[11px] font-medium px-3 py-1.5 rounded-lg ${T.chipOff} transition-all`}>
          {t.spectra.newOrder}
        </button>
      </div>

      <div className="rounded-lg border border-black/[0.06] overflow-x-auto">
        <table className="w-full min-w-[540px]">
          <thead>
            <tr className="bg-gray-50/80">
              <th className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider font-semibold text-black/55">{t.spectra.orderCol}</th>
              <th className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider font-semibold text-black/55">{t.spectra.dateCol}</th>
              <th className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider font-semibold text-black/55">{t.spectra.brandCol}</th>
              <th className="px-3 py-2.5 text-center text-[10px] uppercase tracking-wider font-semibold text-black/55">{t.spectra.itemsCol}</th>
              <th className="px-3 py-2.5 text-right text-[10px] uppercase tracking-wider font-semibold text-black/55">{t.spectra.totalCol}</th>
              <th className="px-3 py-2.5 text-center text-[10px] uppercase tracking-wider font-semibold text-black/55">{t.spectra.statusCol}</th>
            </tr>
          </thead>
          <tbody>
            {DEMO_ORDERS.map((o) => (
              <tr key={o.id} className="border-t border-black/[0.04]">
                <td className={`px-3 py-2.5 text-xs font-medium ${T.text1}`}>{o.id}</td>
                <td className={`px-3 py-2.5 text-xs ${T.text2}`}>{o.date}</td>
                <td className={`px-3 py-2.5 text-xs ${T.text1}`}>{o.brand}</td>
                <td className={`px-3 py-2.5 text-xs text-center ${T.text2}`}>{o.items}</td>
                <td className={`px-3 py-2.5 text-xs text-right font-medium ${T.text1}`}>{o.total}</td>
                <td className="px-3 py-2.5 text-center">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColor[o.status] || "bg-gray-100 text-gray-600"}`}>
                    {statusKeyMap[o.status] || o.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={`${T.card} p-4`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
            <Zap className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h3 className={`text-xs font-semibold ${T.text1}`}>{t.spectra.smartReorder}</h3>
            <p className={`text-[11px] ${T.text2} mt-0.5`}>
              {t.spectra.smartReorderDesc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Clients Tab ───────────────────────────────────────────────────

const ClientsTab: React.FC = () => {
  const t = useCrmT();
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className={`text-sm font-semibold ${T.text1}`}>{t.spectra.clientColorProfiles}</h2>
        <span className={`text-[11px] ${T.text2}`}>{DEMO_CLIENTS.length} {t.spectra.activeClients}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {DEMO_CLIENTS.map((c) => (
          <div key={c.name} className={`${T.card} p-4`}>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
                <span className={`text-sm font-semibold ${T.text1}`}>{c.name.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium ${T.text1}`}>{c.name}</div>
                <div className={`text-[11px] ${T.text2} mt-0.5`}>{t.spectra.lastVisitLabel} {c.lastVisit}</div>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400" />
                <span className={`text-[11px] font-medium ${T.text1}`}>{c.satisfaction}%</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-black/[0.04] grid grid-cols-3 gap-2">
              <div>
                <div className={`text-[10px] ${T.textM}`}>{t.spectra.visitsLabel}</div>
                <div className={`text-xs font-medium ${T.text1}`}>{c.visits}</div>
              </div>
              <div>
                <div className={`text-[10px] ${T.textM}`}>{t.spectra.topColorLabel}</div>
                <div className={`text-xs font-medium ${T.text1}`}>{c.topColor}</div>
              </div>
              <div>
                <div className={`text-[10px] ${T.textM}`}>{t.spectra.frequencyLabel}</div>
                <div className={`text-xs font-medium ${T.text1}`}>~{Math.round(30 / (c.visits / 6))}d</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── AI Mix Tab ────────────────────────────────────────────────────

const AIMixTab: React.FC = () => {
  const t = useCrmT();
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className={`w-4 h-4 ${T.text2}`} />
          <h2 className={`text-sm font-semibold ${T.text1}`}>{t.spectra.aiRecommendations}</h2>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 font-medium`}>
          {t.spectra.poweredByAI}
        </span>
      </div>

      <div className="space-y-3">
        {DEMO_AI_FORMULAS.map((f, i) => (
          <div key={i} className={`${T.card} p-4`}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className={`text-sm font-medium ${T.text1}`}>{f.target}</div>
                <div className={`text-[11px] ${T.text2}`}>{t.spectra.forClient} {f.client}</div>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className={`w-3 h-3 ${T.textM}`} />
                <span className={`text-[11px] ${T.text2}`}>{f.time}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-gray-50 p-2.5">
                <div className={`text-[10px] ${T.textM} mb-1`}>{t.spectra.baseLevelLabel}</div>
                <div className={`text-xs font-semibold ${T.text1}`}>{f.base}</div>
              </div>
              <div className="rounded-lg bg-gray-50 p-2.5">
                <div className={`text-[10px] ${T.textM} mb-1`}>{t.spectra.formulaMixLabel}</div>
                <div className={`text-xs font-semibold ${T.text1}`}>{f.mix}</div>
              </div>
              <div className="rounded-lg bg-gray-50 p-2.5">
                <div className={`text-[10px] ${T.textM} mb-1`}>{t.spectra.developerLabel}</div>
                <div className={`text-xs font-semibold ${T.text1}`}>{f.dev}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={`${T.card} p-4`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
            <Eye className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <h3 className={`text-xs font-semibold ${T.text1}`}>{t.spectra.colorTrendInsight}</h3>
            <p className={`text-[11px] ${T.text2} mt-0.5`}>
              {t.spectra.colorTrendInsightDesc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Reports Tab ───────────────────────────────────────────────────

const ReportsTab: React.FC<{ totalValue: number; totalShades: number }> = ({ totalValue, totalShades }) => {
  const t = useCrmT();
  const reportMetrics = [
    { label: t.spectra.monthlyRevenue, value: "$12,100", change: "+18.6%", positive: true },
    { label: t.spectra.avgTicket, value: "$87.50", change: "+5.2%", positive: true },
    { label: t.spectra.productUsage, value: "342 tubes", change: "+12.1%", positive: true },
    { label: t.spectra.wasteRate, value: "2.3%", change: "-0.8%", positive: true },
  ];

  const topShades = [
    { shade: "6.35", name: "Majirel", pct: 14 },
    { shade: "7.44", name: "Dia Richesse", pct: 11 },
    { shade: "8.1", name: "Majirel", pct: 9 },
    { shade: "5.0", name: "INOA", pct: 8 },
    { shade: "9.1", name: "Majirel", pct: 7 },
  ];

  return (
    <div className="space-y-4">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {reportMetrics.map((m) => (
          <div key={m.label} className={`${T.card} p-4`}>
            <div className={`text-[11px] ${T.text2} mb-1`}>{m.label}</div>
            <div className={`text-lg font-bold ${T.text1}`}>{m.value}</div>
            <div className={`text-[11px] font-medium mt-1 ${m.positive ? "text-emerald-600" : "text-red-500"}`}>
              {m.change} {t.spectra.vsLastMonth}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Revenue chart */}
        <div className={T.card}>
          <div className="p-4 pb-2">
            <h3 className={`text-sm font-semibold ${T.text1}`}>{t.spectra.revenueTrend}</h3>
            <p className={`text-[11px] ${T.text2}`}>{t.spectra.monthlyColorRevenue}</p>
          </div>
          <div className="px-4 pb-4">
            <MiniBarChart data={DEMO_REVENUE} />
          </div>
        </div>

        {/* Top shades */}
        <div className={T.card}>
          <div className="p-4 pb-2">
            <h3 className={`text-sm font-semibold ${T.text1}`}>{t.spectra.topShades}</h3>
            <p className={`text-[11px] ${T.text2}`}>{t.spectra.topShadesDesc}</p>
          </div>
          <div className="px-4 pb-4 space-y-2.5">
            {topShades.map((s) => (
              <div key={s.shade} className="flex items-center gap-3">
                <div className="w-8 text-right">
                  <span className={`text-xs font-semibold ${T.text1}`}>{s.shade}</span>
                </div>
                <div className="flex-1">
                  <div className="h-2 rounded-full bg-black/[0.04] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-black/60 to-black/40"
                      style={{ width: `${(s.pct / 14) * 100}%` }}
                    />
                  </div>
                </div>
                <div className={`text-[11px] ${T.text2} w-16 text-right`}>{s.name}</div>
                <div className={`text-[11px] font-medium ${T.text1} w-8 text-right`}>{s.pct}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Inventory value summary */}
      <div className={`${T.card} p-4`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className={`text-xs font-semibold ${T.text1}`}>{t.spectra.inventoryHealth}</h3>
            <p className={`text-[11px] ${T.text2} mt-0.5`}>
              {t.spectra.inventoryHealthDesc
                .replace("{shades}", String(totalShades))
                .replace("{value}", totalValue.toLocaleString("he-IL", { maximumFractionDigits: 0 }))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpectraPreviewPage;
