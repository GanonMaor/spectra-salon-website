/**
 * src/screens/admindashboard/BeautyIntelligencePanel.tsx
 * ───────────────────────────────────────────────────────────────────────
 * Beauty Intelligence Dictionary – main Admin panel.
 *
 * Nested tabs:
 *   Truth Inventory  – observed reality counts from Neon + local fallback
 *   Brand Dictionary – curated brand/series knowledge
 *   Series Intel     – series-level usage intelligence
 *   Shade Intel      – shade-level classification table
 *   Market Reports   – category-level executive views
 *   Needs Review     – unknowns, low-confidence items
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  BookOpen,
  TrendingUp,
  Layers,
  BarChart2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Database,
  Beaker,
  Scissors,
  Droplets,
  Sparkles,
  Search,
  Filter,
  Info,
  CheckCircle2,
  XCircle,
  Circle,
} from "lucide-react";
import {
  beautyIntelligenceClient,
  type InventoryReport,
  type BrandRecord,
  type SeriesIntelligence,
  type ShadeIntelligence,
  type MarketReports,
} from "../../lib/beautyIntelligenceClient";

// ── Local static data (pre-built) ────────────────────────────────────────────
import beautyIndex from "../../data/beauty-intelligence/index.json";

// ── Types ────────────────────────────────────────────────────────────────────

type InnerTab =
  | "inventory"
  | "brands"
  | "series"
  | "shades"
  | "market"
  | "review";

interface Props {
  isDark: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  at?: any;
}

// ── Product type labels / icons ──────────────────────────────────────────────

const PRODUCT_TYPE_LABELS: Record<string, string> = {
  permanent_color: "Permanent",
  demi_permanent: "Demi",
  toner: "Toner",
  acidic_toner: "Gloss/Toner",
  lightener: "Lightener",
  developer: "Developer",
  corrector_mixer: "Corrector",
  direct_dye: "Direct Dye",
  bond_builder: "Bond Builder",
  treatment_care: "Treatment",
  unknown: "Unknown",
};

const MARKET_CATEGORY_COLORS: Record<string, string> = {
  "Cool Blonde":        "#A8C4E0",
  "Warm Blonde":        "#F5D28B",
  "Beige Blonde":       "#E8D5AA",
  "Natural Blonde":     "#D4C5A0",
  "Cool Brunette":      "#8BA5C0",
  "Warm Brunette":      "#C49A6C",
  "Chocolate Brown":    "#7B4A2D",
  "Copper":             "#C0642A",
  "Red":                "#CC3322",
  "Mahogany":           "#8B3A5E",
  "Violet":             "#7B4F9E",
  "Fashion Colors":     "#9B59B6",
  "Grey Coverage":      "#9E9E9E",
  "High Lift Blonde":   "#FFF0B0",
  "Lightening Services":"#FFE066",
};

// ── Main component ────────────────────────────────────────────────────────────

export function BeautyIntelligencePanel({ isDark }: Props) {
  const [activeInnerTab, setActiveInnerTab] = useState<InnerTab>("inventory");
  const [inventoryData, setInventoryData] = useState<InventoryReport | null>(null);
  const [brandsData, setBrandsData] = useState<{ brands: BrandRecord[] } | null>(null);
  const [seriesData, setSeriesData] = useState<SeriesIntelligence[] | null>(null);
  const [shadesData, setShadesData] = useState<ShadeIntelligence[] | null>(null);
  const [marketData, setMarketData] = useState<MarketReports | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const bg   = isDark ? "bg-zinc-900"   : "bg-white";
  const card = isDark ? "bg-zinc-800"   : "bg-zinc-50";
  const border = isDark ? "border-zinc-700" : "border-zinc-200";
  const text  = isDark ? "text-zinc-100" : "text-zinc-900";
  const muted = isDark ? "text-zinc-400" : "text-zinc-500";
  const accent = "text-violet-400";

  // ── Data loaders ───────────────────────────────────────────────────────────

  const loadInventory = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await beautyIntelligenceClient.getInventoryReport();
      setInventoryData(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadBrands = useCallback(async () => {
    if (brandsData) return;
    setLoading(true);
    try {
      const data = await beautyIntelligenceClient.getBrandDictionary();
      setBrandsData(data as any);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [brandsData]);

  const loadSeries = useCallback(async (brandSlug?: string) => {
    setLoading(true);
    try {
      if (brandSlug) {
        const data = await beautyIntelligenceClient.getSeriesForBrand(brandSlug);
        setSeriesData(data);
      } else {
        const data = await beautyIntelligenceClient.getAllSeries();
        setSeriesData(data.series);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadShades = useCallback(async (brandSlug: string) => {
    setLoading(true);
    try {
      const data = await beautyIntelligenceClient.getShadesForBrand(brandSlug);
      setShadesData(data.shades);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMarket = useCallback(async () => {
    if (marketData) return;
    setLoading(true);
    try {
      const data = await beautyIntelligenceClient.getMarketReports();
      setMarketData(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [marketData]);

  // ── Tab switch effects ─────────────────────────────────────────────────────

  useEffect(() => {
    if (activeInnerTab === "inventory" && !inventoryData) loadInventory();
    if (activeInnerTab === "brands") loadBrands();
    if (activeInnerTab === "series" && !seriesData) loadSeries();
    if (activeInnerTab === "market") loadMarket();
  }, [activeInnerTab]);

  useEffect(() => {
    if (selectedBrand && activeInnerTab === "shades") {
      loadShades(slugify(selectedBrand));
    }
    if (selectedBrand && activeInnerTab === "series") {
      loadSeries(slugify(selectedBrand));
    }
  }, [selectedBrand, activeInnerTab]);

  // ── Inner tabs ─────────────────────────────────────────────────────────────

  const innerTabs: { id: InnerTab; label: string; icon: React.ReactNode }[] = [
    { id: "inventory", label: "Truth Inventory",   icon: <Database size={14} /> },
    { id: "brands",    label: "Brand Dictionary",  icon: <BookOpen size={14} /> },
    { id: "series",    label: "Series Intel",      icon: <TrendingUp size={14} /> },
    { id: "shades",    label: "Shade Intel",       icon: <Layers size={14} /> },
    { id: "market",    label: "Market Reports",    icon: <BarChart2 size={14} /> },
    { id: "review",    label: "Needs Review",      icon: <AlertTriangle size={14} /> },
  ];

  return (
    <div className={`${bg} min-h-screen flex flex-col`}>
      {/* Header */}
      <div className={`px-6 pt-6 pb-4 border-b ${border}`}>
        <div className="flex items-center gap-3 mb-1">
          <Sparkles size={20} className="text-violet-400" />
          <h1 className={`text-xl font-semibold ${text}`}>Beauty Intelligence Dictionary</h1>
        </div>
        <p className={`text-sm ${muted} ml-8`}>
          Translating professional stylist decisions into market intelligence for L'Oréal, Wella, Schwarzkopf, and more.
        </p>
      </div>

      {/* Inner tab nav */}
      <div className={`px-6 border-b ${border} flex gap-1 overflow-x-auto`}>
        {innerTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveInnerTab(tab.id); setError(null); }}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeInnerTab === tab.id
                ? "border-violet-500 text-violet-400"
                : `border-transparent ${muted} hover:text-zinc-300`
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeInnerTab === "inventory"  && <InventoryTab inventory={inventoryData} loading={loading} onRefresh={loadInventory} isDark={isDark} card={card} border={border} text={text} muted={muted} accent={accent} />}
        {activeInnerTab === "brands"     && <BrandsTab brands={brandsData?.brands} loading={loading} isDark={isDark} card={card} border={border} text={text} muted={muted} selectedBrand={selectedBrand} onSelectBrand={setSelectedBrand} />}
        {activeInnerTab === "series"     && <SeriesTab series={seriesData} loading={loading} brands={brandsData?.brands} isDark={isDark} card={card} border={border} text={text} muted={muted} selectedBrand={selectedBrand} onSelectBrand={(s) => { setSelectedBrand(s); loadSeries(slugify(s)); }} />}
        {activeInnerTab === "shades"     && <ShadesTab shades={shadesData} loading={loading} brands={brandsData?.brands} isDark={isDark} card={card} border={border} text={text} muted={muted} selectedBrand={selectedBrand} onSelectBrand={(s) => { setSelectedBrand(s); loadShades(slugify(s)); }} search={search} onSearch={setSearch} typeFilter={typeFilter} onTypeFilter={setTypeFilter} categoryFilter={categoryFilter} onCategoryFilter={setCategoryFilter} />}
        {activeInnerTab === "market"     && <MarketTab market={marketData} loading={loading} isDark={isDark} card={card} border={border} text={text} muted={muted} />}
        {activeInnerTab === "review"     && <ReviewTab isDark={isDark} card={card} border={border} text={text} muted={muted} />}
      </div>
    </div>
  );
}

// ── Tab: Truth Inventory ──────────────────────────────────────────────────────

function InventoryTab({ inventory, loading, onRefresh, isDark, card, border, text, muted, accent }: {
  inventory: InventoryReport | null;
  loading: boolean;
  onRefresh: () => void;
  isDark: boolean;
  card: string; border: string; text: string; muted: string; accent: string;
}) {
  const local = (beautyIndex as any).inventory;
  const inv = inventory?.summary;

  const stats = [
    { label: "Observed Items",    value: local?.totalObservedItems ?? "–",    sub: "from local data" },
    { label: "Color Shades",      value: local?.colorShadesCount ?? "–",      sub: "hair color shades" },
    { label: "Developers",        value: local?.developerCount ?? "–",        sub: "separated from color" },
    { label: "Lighteners",        value: local?.lightenerCount ?? "–",        sub: "bleach/lift" },
    { label: "Series",            value: (beautyIndex as any).seriesCount ?? "–", sub: "brand+series combos" },
    { label: "Brands",            value: (beautyIndex as any).brandsCount ?? "–", sub: "distinct brands" },
    { label: "Total Usage Rows",  value: fmtNum(local?.totalRows), sub: "service usages" },
    { label: "Total Volume",      value: `${fmtNum(local?.totalGramsKg)}kg`, sub: "grams consumed" },
  ];

  const neon = inventory?.neon;
  const byType = local?.byProductType || {};
  const typeOrder = ["permanent_color","demi_permanent","toner","acidic_toner","lightener","developer","corrector_mixer","bond_builder","treatment_care","unknown"];

  return (
    <div className="p-6 overflow-y-auto h-full">
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`text-base font-semibold ${text}`}>Truth Inventory</h2>
          <p className={`text-xs ${muted} mt-0.5`}>Observed reality from local reports. Neon connection shows live counts when available.</p>
        </div>
        <button
          onClick={onRefresh}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded border ${border} text-xs ${muted} hover:text-zinc-300 transition-colors`}
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {stats.map(s => (
          <div key={s.label} className={`${card} rounded-lg p-4 border ${border}`}>
            <div className={`text-2xl font-bold ${text}`}>{s.value}</div>
            <div className={`text-xs font-medium mt-0.5 ${text}`}>{s.label}</div>
            <div className={`text-xs ${muted}`}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Two columns: by product type + Neon status */}
      <div className="grid grid-cols-2 gap-4">
        {/* Product type breakdown */}
        <div className={`${card} rounded-lg border ${border} p-4`}>
          <h3 className={`text-sm font-semibold ${text} mb-3`}>By Product Type</h3>
          <div className="space-y-2">
            {typeOrder.filter(t => byType[t] > 0).map(t => (
              <div key={t} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {t === "developer" ? <Droplets size={12} className="text-sky-400" /> :
                   t === "lightener" ? <Sparkles size={12} className="text-yellow-400" /> :
                   t === "bond_builder" ? <Beaker size={12} className="text-green-400" /> :
                   <Scissors size={12} className="text-violet-400" />}
                  <span className={`text-xs ${text}`}>{PRODUCT_TYPE_LABELS[t] || t}</span>
                </div>
                <span className={`text-xs font-mono font-medium ${text}`}>{byType[t]}</span>
              </div>
            ))}
          </div>
          <div className={`mt-3 pt-3 border-t ${border} text-xs ${muted}`}>
            <Info size={10} className="inline mr-1" />
            Developers and lighteners are separated from color shades in all intelligence layers.
          </div>
        </div>

        {/* Neon status */}
        <div className={`${card} rounded-lg border ${border} p-4`}>
          <h3 className={`text-sm font-semibold ${text} mb-3`}>Neon Database Status</h3>
          {loading ? (
            <div className={`text-xs ${muted}`}>Connecting…</div>
          ) : neon ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 size={14} className="text-green-400" />
                <span className={`text-xs text-green-400`}>Connected to Neon</span>
              </div>
              <div className={`text-xs ${muted}`}>
                <span className={`font-medium ${text}`}>{fmtNum(neon.totalRows)}</span> usage rows
              </div>
              <div className={`text-xs ${muted}`}>
                <span className={`font-medium ${text}`}>{neon.uniqueBrands}</span> unique brands
              </div>
              {neon.brandBreakdown.slice(0, 5).map(b => (
                <div key={b.brand} className="flex items-center justify-between">
                  <span className={`text-xs ${muted} truncate max-w-[140px]`}>{b.brand}</span>
                  <span className={`text-xs font-mono ${text}`}>{fmtNum(b.rows)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <XCircle size={14} className="text-zinc-500" />
                <span className={`text-xs ${muted}`}>Using local data only</span>
              </div>
              <p className={`text-xs ${muted}`}>
                Neon connection not available in this environment. Intelligence is built from local usage reports.
              </p>
              <p className={`text-xs ${muted} mt-2`}>
                Run <code className="bg-zinc-700/50 px-1 rounded">netlify dev</code> with <code className="bg-zinc-700/50 px-1 rounded">NEON_DATABASE_URL</code> for live counts.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Data layers explanation */}
      <div className={`mt-4 ${card} rounded-lg border ${border} p-4`}>
        <h3 className={`text-sm font-semibold ${text} mb-3`}>Four Data Layers</h3>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Observed Truth",        desc: "What was actually used by stylists — brand, shade, grams, services.",    color: "border-l-blue-500" },
            { label: "Product Knowledge",     desc: "What each product and series means — technology, shade system, type.",    color: "border-l-violet-500" },
            { label: "Market Classification", desc: "Normalized level, reflection, color family, market category.",            color: "border-l-amber-500" },
            { label: "Market Intelligence",   desc: "Business meaning — trends, service context, brand leadership.",            color: "border-l-green-500" },
          ].map(l => (
            <div key={l.label} className={`pl-3 border-l-2 ${l.color}`}>
              <div className={`text-xs font-semibold ${text}`}>{l.label}</div>
              <div className={`text-xs ${muted} mt-0.5`}>{l.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Tab: Brand Dictionary ─────────────────────────────────────────────────────

function BrandsTab({ brands, loading, isDark, card, border, text, muted, selectedBrand, onSelectBrand }: {
  brands: BrandRecord[] | undefined;
  loading: boolean;
  isDark: boolean;
  card: string; border: string; text: string; muted: string;
  selectedBrand: string | null;
  onSelectBrand: (b: string) => void;
}) {
  const [expandedSeries, setExpandedSeries] = useState<string | null>(null);

  const activeBrand = brands?.find(b => b.brandKey === selectedBrand);

  if (loading && !brands) {
    return <div className={`p-6 text-xs ${muted}`}>Loading brand dictionary…</div>;
  }

  // Known brands to highlight
  const knownBrands = brands?.filter(b =>
    ["L'OREAL PROFESSIONNEL","WELLA PROFESSIONALS","SCHWARZKOPF","MATRIX","REDKEN","GOLDWELL","KEUNE"].includes(b.brandKey)
  ) || [];
  const otherBrands = brands?.filter(b =>
    !["L'OREAL PROFESSIONNEL","WELLA PROFESSIONALS","SCHWARZKOPF","MATRIX","REDKEN","GOLDWELL","KEUNE"].includes(b.brandKey)
  ) || [];

  return (
    <div className="flex h-full overflow-hidden">
      {/* Brand list */}
      <div className={`w-64 flex-shrink-0 border-r ${border} overflow-y-auto`} style={{ height: "calc(100vh - 200px)" }}>
        <div className={`px-3 py-2 border-b ${border}`}>
          <span className={`text-xs font-semibold ${muted} uppercase tracking-wider`}>Professional Brands</span>
        </div>
        {knownBrands.map(b => (
          <BrandNavItem key={b.brandKey} brand={b} selected={selectedBrand === b.brandKey} onSelect={() => onSelectBrand(b.brandKey)} text={text} muted={muted} accent="text-violet-400" border={border} isPrimary />
        ))}
        <div className={`px-3 py-2 border-b ${border} mt-2`}>
          <span className={`text-xs font-semibold ${muted} uppercase tracking-wider`}>Other Brands</span>
        </div>
        {otherBrands.map(b => (
          <BrandNavItem key={b.brandKey} brand={b} selected={selectedBrand === b.brandKey} onSelect={() => onSelectBrand(b.brandKey)} text={text} muted={muted} accent="text-violet-400" border={border} />
        ))}
      </div>

      {/* Brand detail */}
      <div className="flex-1 overflow-y-auto p-6" style={{ height: "calc(100vh - 200px)" }}>
        {!activeBrand ? (
          <div className={`text-sm ${muted}`}>Select a brand to view its dictionary entry.</div>
        ) : (
          <BrandDetailView brand={activeBrand} card={card} border={border} text={text} muted={muted} expandedSeries={expandedSeries} onToggleSeries={setExpandedSeries} />
        )}
      </div>
    </div>
  );
}

function BrandNavItem({ brand, selected, onSelect, text, muted, accent, border, isPrimary }: {
  brand: BrandRecord;
  selected: boolean;
  onSelect: () => void;
  text: string; muted: string; accent: string; border: string;
  isPrimary?: boolean;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors ${
        selected ? "bg-violet-500/15 text-violet-300" : `${text} hover:bg-zinc-800/50`
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        {isPrimary && <div className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />}
        <span className={`text-xs truncate ${selected ? "text-violet-300" : text}`}>{brand.brandDisplay}</span>
      </div>
      <span className={`text-xs ${selected ? "text-violet-400" : muted} ml-2`}>{brand.seriesList?.length ?? 0}</span>
    </button>
  );
}

function BrandDetailView({ brand, card, border, text, muted, expandedSeries, onToggleSeries }: {
  brand: BrandRecord;
  card: string; border: string; text: string; muted: string;
  expandedSeries: string | null;
  onToggleSeries: (k: string | null) => void;
}) {
  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className={`text-lg font-bold ${text}`}>{brand.brandDisplay}</h2>
          {brand.country && <div className={`text-xs ${muted} mt-0.5`}>{brand.country}</div>}
        </div>
        <div className="text-right">
          <div className={`text-xl font-bold ${text}`}>{fmtNum(brand.rows)}</div>
          <div className={`text-xs ${muted}`}>usage rows</div>
        </div>
      </div>

      {brand.shadeSystem && (
        <div className={`text-xs ${muted} mb-4 flex items-center gap-1.5`}>
          <Info size={11} />
          Shade system: <span className={`${text} font-medium`}>{brand.shadeSystem}</span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatPill label="Shades"       value={brand.shadeCount} />
        <StatPill label="Color Shades" value={brand.colorShadeCount} />
        <StatPill label="Series"       value={brand.seriesList?.length ?? 0} />
      </div>

      {/* Series list */}
      <h3 className={`text-sm font-semibold ${text} mb-3`}>Series</h3>
      <div className={`space-y-2 border ${border} rounded-lg overflow-hidden`}>
        {(brand.seriesList || []).sort((a, b) => b.rows - a.rows).map((s, i) => (
          <div key={s.seriesKey || i} className={`border-b last:border-b-0 ${border}`}>
            <button
              onClick={() => onToggleSeries(expandedSeries === s.seriesKey ? null : s.seriesKey)}
              className={`w-full flex items-center justify-between px-4 py-3 text-left ${card} hover:bg-violet-500/5`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {expandedSeries === s.seriesKey ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                <span className={`text-xs font-medium ${text} truncate`}>{s.seriesDisplay}</span>
                {s.isDeveloper && <Tag label="Dev" color="text-sky-400 bg-sky-400/10" />}
                {s.isLightener && <Tag label="Bleach" color="text-yellow-400 bg-yellow-400/10" />}
                {s.primaryMarketCategory && !s.isDeveloper && !s.isLightener && (
                  <Tag label={s.primaryMarketCategory} color="text-violet-400 bg-violet-400/10" />
                )}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`text-xs ${muted}`}>{s.shadeCount} shades</span>
                <span className={`text-xs font-mono ${text}`}>{fmtNum(s.rows)}</span>
              </div>
            </button>
            {expandedSeries === s.seriesKey && (
              <div className={`px-4 pb-3 pt-1 ${card} border-t ${border}`}>
                <div className={`text-xs ${muted} grid grid-cols-2 gap-x-4 gap-y-1`}>
                  <span><b className={text}>Type:</b> {PRODUCT_TYPE_LABELS[s.productType] || s.productType}</span>
                  <span><b className={text}>Grams:</b> {fmtNum(Math.round(s.grams / 1000))}kg</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tab: Series Intelligence ──────────────────────────────────────────────────

function SeriesTab({ series, loading, brands, isDark, card, border, text, muted, selectedBrand, onSelectBrand }: {
  series: SeriesIntelligence[] | null;
  loading: boolean;
  brands: BrandRecord[] | undefined;
  isDark: boolean;
  card: string; border: string; text: string; muted: string;
  selectedBrand: string | null;
  onSelectBrand: (b: string) => void;
}) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const colorSeries = useMemo(() => (series || []).filter(s => !s.isDeveloper && !s.isLightener), [series]);

  if (loading && !series) {
    return <div className={`p-6 text-xs ${muted}`}>Loading series intelligence…</div>;
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Brand filter sidebar */}
      <div className={`w-48 flex-shrink-0 border-r ${border} overflow-y-auto`} style={{ height: "calc(100vh - 200px)" }}>
        <div className={`px-3 py-2 border-b ${border}`}>
          <span className={`text-xs font-semibold ${muted}`}>Filter by Brand</span>
        </div>
        <button
          onClick={() => onSelectBrand("")}
          className={`w-full text-left px-3 py-2 text-xs transition-colors ${!selectedBrand ? "text-violet-300 bg-violet-500/10" : `${text} hover:bg-zinc-800/50`}`}
        >
          All Brands
        </button>
        {(brands || []).filter(b => b.rows > 0).map(b => (
          <button
            key={b.brandKey}
            onClick={() => onSelectBrand(b.brandKey)}
            className={`w-full text-left px-3 py-2 text-xs transition-colors ${selectedBrand === b.brandKey ? "text-violet-300 bg-violet-500/10" : `${text} hover:bg-zinc-800/50`}`}
          >
            {b.brandDisplay}
          </button>
        ))}
      </div>

      {/* Series table */}
      <div className="flex-1 overflow-y-auto" style={{ height: "calc(100vh - 200px)" }}>
        <div className={`px-4 py-2 border-b ${border} flex items-center justify-between`}>
          <span className={`text-xs ${muted}`}>
            {colorSeries.length} series (developers & lighteners excluded)
          </span>
        </div>
        {colorSeries.map(s => (
          <div key={s.seriesKey} className={`border-b ${border}`}>
            <button
              onClick={() => setExpandedRow(expandedRow === s.seriesKey ? null : s.seriesKey)}
              className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-violet-500/5 transition-colors`}
            >
              <div className="w-5 flex-shrink-0">
                {expandedRow === s.seriesKey ? <ChevronDown size={12} className={muted} /> : <ChevronRight size={12} className={muted} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-semibold ${text}`}>{s.brandDisplay}</div>
                <div className={`text-xs ${muted}`}>{s.seriesDisplay}</div>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                {s.primaryMarketCategory && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      backgroundColor: (MARKET_CATEGORY_COLORS[s.primaryMarketCategory] || "#888") + "22",
                      color: MARKET_CATEGORY_COLORS[s.primaryMarketCategory] || "#888",
                    }}
                  >
                    {s.primaryMarketCategory}
                  </span>
                )}
                <div className="text-right w-20">
                  <div className={`text-xs font-mono font-bold ${text}`}>{fmtNum(s.usage.rows)}</div>
                  <div className={`text-xs ${muted}`}>{fmtNum(Math.round(s.usage.grams / 1000))}kg</div>
                </div>
              </div>
            </button>

            {expandedRow === s.seriesKey && (
              <div className={`px-4 pb-4 pt-2 ${card} border-t ${border}`}>
                <div className="grid grid-cols-2 gap-4">
                  {/* Series knowledge */}
                  <div>
                    {s.description && (
                      <p className={`text-xs ${muted} mb-3 leading-relaxed`}>{s.description}</p>
                    )}
                    {s.technology && (
                      <div className={`text-xs ${muted} mb-1`}>
                        <span className="font-medium text-violet-400">Technology:</span> {s.technology}
                      </div>
                    )}
                    {s.officialUrl && (
                      <a href={s.officialUrl} target="_blank" rel="noreferrer" className="text-xs text-violet-400 flex items-center gap-1 mt-1">
                        <ExternalLink size={11} />Official reference
                      </a>
                    )}
                    <div className={`text-xs ${muted} mt-2`}>
                      <span className="font-medium">Common services: </span>
                      {s.commonServices?.join(", ") || "–"}
                    </div>
                  </div>
                  {/* Usage intelligence */}
                  <div>
                    <div className={`text-xs font-semibold ${text} mb-2`}>Observed Usage</div>
                    <div className={`text-xs ${muted} space-y-1`}>
                      <div><span className="font-medium">{s.usage.shadeCount}</span> shades observed</div>
                      <div><span className="font-medium">{fmtNum(s.usage.rows)}</span> service uses</div>
                      <div><span className="font-medium">{fmtNum(Math.round(s.usage.grams / 1000))}kg</span> consumed</div>
                    </div>
                    <div className={`text-xs font-semibold ${text} mt-3 mb-1`}>Top Services</div>
                    {s.topServices?.slice(0, 4).map(sv => (
                      <div key={sv.name} className={`text-xs ${muted} flex items-center justify-between`}>
                        <span className="truncate">{sv.name}</span>
                        <span className="font-mono ml-2">{fmtNum(sv.count)}</span>
                      </div>
                    ))}
                    <div className={`text-xs font-semibold ${text} mt-3 mb-1`}>Top Shades</div>
                    <div className="flex flex-wrap gap-1">
                      {s.topShades?.slice(0, 6).map(sh => (
                        <span key={sh.shade} className={`text-xs px-1.5 py-0.5 rounded font-mono bg-zinc-700/50`}>
                          {sh.shade}
                        </span>
                      ))}
                    </div>
                    {s.weakShades?.length > 0 && (
                      <div className={`text-xs ${muted} mt-2`}>
                        <span className="text-amber-400">Rarely used:</span> {s.weakShades.join(", ")}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tab: Shade Intelligence ───────────────────────────────────────────────────

function ShadesTab({ shades, loading, brands, isDark, card, border, text, muted, selectedBrand, onSelectBrand, search, onSearch, typeFilter, onTypeFilter, categoryFilter, onCategoryFilter }: {
  shades: ShadeIntelligence[] | null;
  loading: boolean;
  brands: BrandRecord[] | undefined;
  isDark: boolean;
  card: string; border: string; text: string; muted: string;
  selectedBrand: string | null;
  onSelectBrand: (b: string) => void;
  search: string; onSearch: (v: string) => void;
  typeFilter: string; onTypeFilter: (v: string) => void;
  categoryFilter: string; onCategoryFilter: (v: string) => void;
}) {
  const [colorOnly, setColorOnly] = useState(true);

  const filtered = useMemo(() => {
    if (!shades) return [];
    let list = shades;
    if (colorOnly) list = list.filter(s => s.isColorShade);
    if (typeFilter !== "all") list = list.filter(s => s.productKnowledge.productType === typeFilter);
    if (categoryFilter !== "all") list = list.filter(s => s.marketClassification?.marketCategory === categoryFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.shade?.toLowerCase().includes(q) ||
        s.seriesDisplay?.toLowerCase().includes(q) ||
        s.marketClassification?.marketCategory?.toLowerCase().includes(q) ||
        s.marketClassification?.reflectionPrimary?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [shades, colorOnly, typeFilter, categoryFilter, search]);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Brand sidebar */}
      <div className={`w-48 flex-shrink-0 border-r ${border} overflow-y-auto`} style={{ height: "calc(100vh - 200px)" }}>
        <div className={`px-3 py-2 border-b ${border}`}>
          <span className={`text-xs font-semibold ${muted}`}>Select Brand</span>
        </div>
        {(brands || []).filter(b => b.rows > 0).map(b => (
          <button
            key={b.brandKey}
            onClick={() => onSelectBrand(b.brandKey)}
            className={`w-full text-left px-3 py-2 text-xs transition-colors ${selectedBrand === b.brandKey ? "text-violet-300 bg-violet-500/10" : `${text} hover:bg-zinc-800/50`}`}
          >
            <div className="truncate">{b.brandDisplay}</div>
            <div className={`text-xs ${muted}`}>{b.colorShadeCount} shades</div>
          </button>
        ))}
      </div>

      {/* Shades main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Filters bar */}
        <div className={`px-4 py-2 border-b ${border} flex items-center gap-3 flex-wrap`}>
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded border ${border} text-xs ${text}`}>
            <Search size={11} />
            <input
              value={search}
              onChange={e => onSearch(e.target.value)}
              placeholder="Search shade, series, category…"
              className="bg-transparent outline-none w-40 text-xs placeholder-zinc-500"
            />
          </div>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={colorOnly} onChange={e => setColorOnly(e.target.checked)} className="w-3 h-3" />
            <span className={`text-xs ${muted}`}>Color shades only</span>
          </label>
          <select value={typeFilter} onChange={e => onTypeFilter(e.target.value)} className={`text-xs px-2 py-1 rounded border ${border} bg-zinc-800 ${text} outline-none`}>
            <option value="all">All types</option>
            {Object.entries(PRODUCT_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select value={categoryFilter} onChange={e => onCategoryFilter(e.target.value)} className={`text-xs px-2 py-1 rounded border ${border} bg-zinc-800 ${text} outline-none`}>
            <option value="all">All categories</option>
            {Object.keys(MARKET_CATEGORY_COLORS).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <span className={`text-xs ${muted} ml-auto`}>
            {loading ? "Loading…" : !selectedBrand ? "Select a brand →" : `${filtered.length} shades`}
          </span>
        </div>

        {/* Table */}
        {!selectedBrand ? (
          <div className={`flex-1 flex items-center justify-center text-sm ${muted}`}>
            Select a brand from the left to view shade intelligence.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto" style={{ height: "calc(100vh - 260px)" }}>
            {/* Column headers */}
            <div
              className={`grid text-xs font-semibold ${muted} uppercase tracking-wider px-4 py-2 border-b ${border} sticky top-0 bg-zinc-900 z-10`}
              style={{ gridTemplateColumns: "80px 1fr 1fr 80px 80px 120px 120px 80px" }}
            >
              <span>Shade</span>
              <span>Series</span>
              <span>Market Category</span>
              <span>Level</span>
              <span>Reflection</span>
              <span>Type</span>
              <span>Services</span>
              <span className="text-right">Usage</span>
            </div>
            {filtered.map(sh => (
              <ShadeRow key={sh.id} shade={sh} border={border} text={text} muted={muted} />
            ))}
            {filtered.length === 0 && !loading && (
              <div className={`py-12 text-center text-sm ${muted}`}>No shades match your filters.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ShadeRow({ shade, border, text, muted }: {
  shade: ShadeIntelligence;
  border: string; text: string; muted: string;
}) {
  const cls = shade.marketClassification;
  const cat = cls?.marketCategory;
  const catColor = cat ? MARKET_CATEGORY_COLORS[cat] : null;

  return (
    <div
      className={`grid items-center px-4 py-2 border-b ${border} hover:bg-violet-500/5 transition-colors text-xs`}
      style={{ gridTemplateColumns: "80px 1fr 1fr 80px 80px 120px 120px 80px" }}
    >
      {/* Shade code + family dot */}
      <div className="flex items-center gap-1.5">
        {cls?.colorFamilyDot && (
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 border border-zinc-600" style={{ backgroundColor: cls.colorFamilyDot }} />
        )}
        {shade.isDeveloper && <Droplets size={10} className="text-sky-400 flex-shrink-0" />}
        {shade.isLightener && <Sparkles size={10} className="text-yellow-400 flex-shrink-0" />}
        <span className={`font-mono font-medium ${text} truncate`}>{shade.shade}</span>
      </div>
      {/* Series */}
      <span className={`${muted} truncate`}>{shade.seriesDisplay}</span>
      {/* Market category */}
      <div>
        {cat ? (
          <span
            className="px-1.5 py-0.5 rounded-full text-xs font-medium truncate block max-w-fit"
            style={{ backgroundColor: catColor + "22", color: catColor || "#888" }}
          >
            {cat}
          </span>
        ) : <span className={muted}>–</span>}
      </div>
      {/* Level */}
      <span className={cls?.level ? text : muted}>
        {cls?.level !== null && cls?.level !== undefined ? `L${cls.level}` : "–"}
      </span>
      {/* Reflection */}
      <span className={`${muted} truncate`}>{cls?.reflectionPrimary || "–"}</span>
      {/* Product type */}
      <span className={muted}>{shade.productKnowledge.productTypeLabel}</span>
      {/* Services */}
      <span className={`${muted} truncate`}>
        {shade.observedTruth.topServices?.[0]?.name || "–"}
      </span>
      {/* Usage */}
      <span className={`text-right font-mono ${text}`}>{fmtNum(shade.observedTruth.rows)}</span>
    </div>
  );
}

// ── Tab: Market Reports ───────────────────────────────────────────────────────

function MarketTab({ market, loading, isDark, card, border, text, muted }: {
  market: MarketReports | null;
  loading: boolean;
  isDark: boolean;
  card: string; border: string; text: string; muted: string;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (loading && !market) {
    return <div className={`p-6 text-xs ${muted}`}>Loading market reports…</div>;
  }
  if (!market) return null;

  return (
    <div className="p-6 overflow-y-auto" style={{ height: "calc(100vh - 200px)" }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className={`text-base font-semibold ${text}`}>Market Intelligence Reports</h2>
          <p className={`text-xs ${muted} mt-0.5`}>{fmtNum(market.totalColorRows)} total color service rows across {market.categories.length} market categories.</p>
        </div>
      </div>

      {/* Category cards */}
      <div className="space-y-3">
        {market.categories.map(cat => {
          const catColor = MARKET_CATEGORY_COLORS[cat.category] || "#888";
          const isExpanded = expanded === cat.category;
          const pct = market.totalColorRows > 0 ? Math.round((cat.totalRows / market.totalColorRows) * 100) : 0;

          return (
            <div key={cat.category} className={`${card} rounded-lg border ${border} overflow-hidden`}>
              <button
                onClick={() => setExpanded(isExpanded ? null : cat.category)}
                className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-violet-500/5 transition-colors"
              >
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: catColor }} />
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-semibold ${text}`}>{cat.category}</div>
                  <div className="w-full mt-1 h-1 bg-zinc-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: catColor }} />
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <div className={`text-sm font-bold ${text}`}>{fmtNum(cat.totalRows)}</div>
                    <div className={`text-xs ${muted}`}>{pct}%</div>
                  </div>
                  {isExpanded ? <ChevronDown size={14} className={muted} /> : <ChevronRight size={14} className={muted} />}
                </div>
              </button>

              {isExpanded && (
                <div className={`border-t ${border} px-4 py-4 grid grid-cols-3 gap-4`}>
                  {/* Top brands */}
                  <div>
                    <div className={`text-xs font-semibold ${text} mb-2`}>Top Brands</div>
                    {cat.topBrands.map(b => (
                      <div key={b.brand} className={`text-xs ${muted} flex items-center justify-between py-0.5`}>
                        <span className="truncate">{b.brand}</span>
                        <span className="font-mono ml-2">{fmtNum(b.rows)}</span>
                      </div>
                    ))}
                  </div>
                  {/* Top series */}
                  <div>
                    <div className={`text-xs font-semibold ${text} mb-2`}>Top Series</div>
                    {cat.topSeries.map(s => (
                      <div key={s.series} className={`text-xs ${muted} flex items-center justify-between py-0.5`}>
                        <span className="truncate">{s.series}</span>
                        <span className="font-mono ml-2">{fmtNum(s.rows)}</span>
                      </div>
                    ))}
                  </div>
                  {/* Top shades */}
                  <div>
                    <div className={`text-xs font-semibold ${text} mb-2`}>Top Shades</div>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.topShades.slice(0, 8).map(s => (
                        <div key={`${s.brand}-${s.shade}`} className="flex items-center gap-1">
                          <span className={`text-xs px-1.5 py-0.5 rounded font-mono bg-zinc-700/50 ${text}`}>{s.shade}</span>
                          <span className={`text-xs ${muted}`}>{s.series}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab: Needs Review ─────────────────────────────────────────────────────────

function ReviewTab({ isDark, card, border, text, muted }: {
  isDark: boolean;
  card: string; border: string; text: string; muted: string;
}) {
  const inv = (beautyIndex as any).inventory;
  const items = [
    {
      type: "Developers separated from color",
      count: inv?.developerCount ?? 0,
      status: "ok",
      desc: "Developer/oxidant products are correctly excluded from all shade intelligence and market reports.",
      icon: <CheckCircle2 size={14} className="text-green-400" />,
    },
    {
      type: "Lighteners / bleach",
      count: inv?.lightenerCount ?? 0,
      status: "ok",
      desc: "Lightening products are excluded from shade classification.",
      icon: <CheckCircle2 size={14} className="text-green-400" />,
    },
    {
      type: "Unknown product type",
      count: inv?.byProductType?.unknown ?? 0,
      status: inv?.byProductType?.unknown > 0 ? "review" : "ok",
      desc: "Items where product type could not be determined. Manual review recommended.",
      icon: inv?.byProductType?.unknown > 0 ? <AlertTriangle size={14} className="text-amber-400" /> : <CheckCircle2 size={14} className="text-green-400" />,
    },
    {
      type: "Correctors / Mixers",
      count: inv?.byProductType?.corrector_mixer ?? 0,
      status: "info",
      desc: "Correctors (Clear, Neutral, Booster, Efassor) are excluded from shade intelligence.",
      icon: <Info size={14} className="text-blue-400" />,
    },
    {
      type: "Bond builders",
      count: inv?.byProductType?.bond_builder ?? 0,
      status: "ok",
      desc: "Bond builders (Olaplex, etc.) are correctly classified as non-color products.",
      icon: <CheckCircle2 size={14} className="text-green-400" />,
    },
    {
      type: "Treatments / Care",
      count: inv?.byProductType?.treatment_care ?? 0,
      status: "info",
      desc: "Treatments (shampoo, conditioner, keratin) are excluded from color intelligence.",
      icon: <Info size={14} className="text-blue-400" />,
    },
  ];

  return (
    <div className="p-6 overflow-y-auto" style={{ height: "calc(100vh - 200px)" }}>
      <div className="mb-6">
        <h2 className={`text-base font-semibold ${text}`}>Needs Review</h2>
        <p className={`text-xs ${muted} mt-0.5`}>Classification quality and separation status. Items flagged here should be manually reviewed.</p>
      </div>

      <div className="space-y-3 mb-8">
        {items.map(item => (
          <div key={item.type} className={`${card} rounded-lg border ${border} px-4 py-3 flex items-start gap-3`}>
            <div className="mt-0.5">{item.icon}</div>
            <div className="flex-1">
              <div className={`text-sm font-medium ${text}`}>{item.type}</div>
              <div className={`text-xs ${muted} mt-0.5`}>{item.desc}</div>
            </div>
            <div className={`text-lg font-bold ${text} flex-shrink-0`}>{item.count}</div>
          </div>
        ))}
      </div>

      {/* Critical rule reminder */}
      <div className={`${card} border ${border} rounded-lg p-4`}>
        <div className="flex items-start gap-2">
          <AlertTriangle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <div className={`text-sm font-semibold text-amber-400 mb-1`}>Critical Separation Rule</div>
            <p className={`text-xs ${muted} leading-relaxed`}>
              Developer/oxidant products must <strong className="text-amber-400">never</strong> be classified as color shades.
              They appear in the inventory but are always excluded from Shade Intelligence, Market Classification, and Market Reports.
              This rule is enforced in the classification engine and cannot be overridden.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Shared micro-components ───────────────────────────────────────────────────

function StatPill({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-zinc-700/30 rounded px-3 py-2 text-center">
      <div className="text-base font-bold text-zinc-100">{typeof value === "number" ? fmtNum(value) : value}</div>
      <div className="text-xs text-zinc-400 mt-0.5">{label}</div>
    </div>
  );
}

function Tag({ label, color }: { label: string; color: string }) {
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${color}`}>{label}</span>
  );
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function fmtNum(n: number | null | undefined): string {
  if (n === null || n === undefined) return "–";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

function slugify(str: string): string {
  return String(str || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
