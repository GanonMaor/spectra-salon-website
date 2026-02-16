import React, { useState, useEffect, useMemo } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Search,
  Activity,
  DollarSign,
  Calendar,
  TrendingUp,
  Package,
  ChevronDown,
  Sparkles,
  BarChart3,
  Layers,
  Zap,
} from "lucide-react";
import usageData from "../../data/usage-reports.json";

// ── Helpers ──────────────────────────────────────────────────────────

function formatCurrency(value: number, currency: string = "ILS"): string {
  const locale = currency === "ILS" ? "he-IL" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

function formatDecimal(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

// ── Spectra System Service Colors ────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  Color:          "#E84393",
  Highlights:     "#C8956C",
  Toner:          "#FDCB6E",
  Straightening:  "#6AC5C8",
  Others:         "#A8BF6A",
};

const CATEGORY_GRADIENTS: Record<string, { bg: string; from: string; to: string }> = {
  Color:          { bg: "from-[#E84393] to-[#BE2D74]", from: "#E84393", to: "#BE2D74" },
  Highlights:     { bg: "from-[#C8956C] to-[#9E6B42]", from: "#C8956C", to: "#9E6B42" },
  Toner:          { bg: "from-[#FDCB6E] to-[#E5A721]", from: "#FDCB6E", to: "#E5A721" },
  Straightening:  { bg: "from-[#6AC5C8] to-[#3E9A9D]", from: "#6AC5C8", to: "#3E9A9D" },
  Others:         { bg: "from-[#A8BF6A] to-[#7D9440]", from: "#A8BF6A", to: "#7D9440" },
};

function getCategoryColor(name: string): string {
  return CATEGORY_COLORS[name] || "#64748B";
}

function getCategoryGradient(name: string) {
  return CATEGORY_GRADIENTS[name] || { bg: "from-[#64748B] to-[#334155]", from: "#64748B", to: "#334155" };
}

const BRAND_COLORS = ["#E84393", "#3B82F6", "#22D3EE", "#34D399", "#F472B6", "#FBBF24", "#64748B"];
const CHART_PALETTE = {
  hero:     { line: "#E76F51", glow: "#FFDDC1", fill: "#F4A98A", ref: "#D4A88C" },
  cost:     { from: "#FDCB6E", to: "#E17055", accent: "#F8B739" },
  volume:   { line: "#6C5CE7", fill: "#A29BFE", glow: "#DDD6FE" },
  grid:     "#E5E7EB18",
  axis:     "#B0AEB5",
};
const COST_BARS = [
  "#FFEAA7", "#FDCB6E", "#F9B234", "#F39C12", "#E67E22", "#D35400",
  "#E74C3C", "#C0392B", "#B33771", "#6D214F",
];

// ── Salon Selector (Searchable Dropdown) ────────────────────────────

interface SalonInfo {
  userId: string;
  displayName: string | null;
  state: string | null;
  city: string | null;
  salonType: string | null;
  employees: number | null;
  currency: string;
  totalServices: number;
}

function SalonSelector({
  salons,
  selectedId,
  onSelect,
  loading,
}: {
  salons: SalonInfo[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return salons;
    const q = search.toLowerCase();
    return salons.filter(
      (s) =>
        s.userId.toLowerCase().includes(q) ||
        (s.displayName && s.displayName.toLowerCase().includes(q)) ||
        (s.city && s.city.toLowerCase().includes(q)) ||
        (s.state && s.state.toLowerCase().includes(q))
    );
  }, [salons, search]);

  const selected = salons.find((s) => s.userId === selectedId);

  return (
    <div ref={dropdownRef} className="relative w-full sm:max-w-sm z-[100]">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-11 w-full items-center justify-between rounded-2xl border border-gray-200/40 bg-white/50 backdrop-blur-xl px-4 py-2.5 shadow-sm hover:bg-white/70 transition-all duration-300"
        disabled={loading}
      >
        <span className={selected ? "text-[13px] text-gray-800 font-semibold tracking-tight" : "text-[13px] text-gray-400"}>
          {loading
            ? "Loading salons..."
            : selected
            ? `${selected.displayName || selected.userId}`
            : "Select Salon"}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-300 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full z-[200] mt-2 w-full rounded-2xl border border-gray-200/40 bg-white/95 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] max-h-80 overflow-hidden">
          <div className="p-3 border-b border-gray-100/50">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-300" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, ID, or city..."
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-gray-100/60 bg-gray-50/50 text-[13px] text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200/40 focus:border-gray-200 transition-all"
                autoFocus
              />
            </div>
          </div>
          <div className="overflow-y-auto max-h-56">
            {filtered.length === 0 ? (
              <div className="px-3 py-6 text-center text-[13px] text-gray-300">No salons found</div>
            ) : (
              filtered.map((salon) => (
                <button
                  key={salon.userId}
                  className={`w-full text-left px-4 py-3.5 hover:bg-gray-50/70 transition-colors duration-200 border-b border-gray-100/30 last:border-0 ${
                    salon.userId === selectedId ? "bg-gray-50/60" : ""
                  }`}
                  onClick={() => { onSelect(salon.userId); setOpen(false); setSearch(""); }}
                >
                  <div className="text-[13px] font-semibold text-gray-800 tracking-tight">{salon.displayName || salon.userId}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5 tracking-wide">
                    {salon.userId}
                    {salon.city ? ` · ${salon.city}` : ""}
                    {salon.state ? `, ${salon.state}` : ""}
                    {` · ${formatNumber(salon.totalServices)} services`}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Date Range Picker (combined From / To) ──────────────────────────

const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function parseYM(v: string): [number | null, number | null] {
  if (!v) return [null, null];
  const p = v.split("-").map(Number);
  return [p[0] || null, p[1] || null];
}
function fmtYM(y: number, m: number) {
  return `${y}-${String(m).padStart(2, "0")}`;
}

function DateRangePicker({
  startValue,
  endValue,
  onStartChange,
  onEndChange,
}: {
  startValue: string;
  endValue: string;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  const [sY, sM] = parseYM(startValue);
  const [eY, eM] = parseYM(endValue);

  const [viewYear, setViewYear] = useState<number>(sY || eY || new Date().getFullYear());
  const [picking, setPicking] = useState<"start" | "end">("start");

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const startLabel = sY && sM ? `${MONTH_LABELS[sM - 1]} ${sY}` : "Start";
  const endLabel   = eY && eM ? `${MONTH_LABELS[eM - 1]} ${eY}` : "End";

  const pickMonth = (m: number) => {
    const val = fmtYM(viewYear, m);
    if (picking === "start") {
      onStartChange(val);
      setPicking("end");
    } else {
      onEndChange(val);
      setOpen(false);
      setPicking("start");
    }
  };

  const isInRange = (m: number): boolean => {
    if (!sY || !sM || !eY || !eM) return false;
    const cur = viewYear * 100 + m;
    const s = sY * 100 + sM;
    const e = eY * 100 + eM;
    return cur > s && cur < e;
  };

  const isStart = (m: number) => sY === viewYear && sM === m;
  const isEnd   = (m: number) => eY === viewYear && eM === m;

  const clear = () => {
    onStartChange("");
    onEndChange("");
    setPicking("start");
  };

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => { setOpen(!open); setPicking("start"); }}
        className="h-9 px-4 rounded-xl border border-gray-200/40 bg-gray-50/40 hover:bg-gray-50/70 transition-all duration-200 focus:outline-none cursor-pointer flex items-center gap-3"
      >
        <Calendar className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
        <span className={`text-[13px] ${startValue ? "text-gray-700 font-medium" : "text-gray-400"}`}>{startLabel}</span>
        <span className="text-gray-300 text-xs">&rarr;</span>
        <span className={`text-[13px] ${endValue ? "text-gray-700 font-medium" : "text-gray-400"}`}>{endLabel}</span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute top-full right-0 sm:right-0 left-0 sm:left-auto mt-2 z-[200] w-auto sm:w-[460px] sm:min-w-[460px] max-w-none rounded-2xl border border-gray-200/40 bg-white/95 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] p-4 sm:p-6">
          {/* Picking indicator */}
          <div className="flex items-center gap-2 mb-4">
            <button
              type="button"
              onClick={() => setPicking("start")}
              className={`flex-1 text-center py-2 rounded-xl text-[12px] font-semibold transition-all ${
                picking === "start"
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-gray-100/60 text-gray-500 hover:bg-gray-100"
              }`}
            >
              From: {startLabel}
            </button>
            <button
              type="button"
              onClick={() => setPicking("end")}
              className={`flex-1 text-center py-2 rounded-xl text-[12px] font-semibold transition-all ${
                picking === "end"
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-gray-100/60 text-gray-500 hover:bg-gray-100"
              }`}
            >
              To: {endLabel}
            </button>
          </div>

          {/* Year nav */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setViewYear((y) => y - 1)}
              className="w-8 h-8 rounded-lg hover:bg-gray-100/60 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors text-base"
            >
              &lsaquo;
            </button>
            <span className="text-[14px] font-bold text-gray-800">{viewYear}</span>
            <button
              type="button"
              onClick={() => setViewYear((y) => y + 1)}
              className="w-8 h-8 rounded-lg hover:bg-gray-100/60 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors text-base"
            >
              &rsaquo;
            </button>
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-1">
            {MONTH_LABELS.map((label, i) => {
              const m = i + 1;
              const start = isStart(m);
              const end = isEnd(m);
              const inRange = isInRange(m);
              const rangeEdge = start ? "rounded-l-xl rounded-r-md" : end ? "rounded-r-xl rounded-l-md" : "rounded-md";
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => pickMonth(m)}
                  className={`h-10 text-[12px] sm:text-[13px] font-medium whitespace-nowrap transition-all duration-150 ${rangeEdge} ${
                    start
                      ? "bg-gray-900 text-white shadow-md ring-2 ring-gray-900/20"
                      : end
                      ? "bg-gray-900 text-white shadow-md ring-2 ring-gray-900/20"
                      : inRange
                      ? "bg-gray-900/10 text-gray-800 font-semibold"
                      : "text-gray-500 hover:bg-gray-100/70 hover:text-gray-900"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Clear */}
          {(startValue || endValue) && (
            <button
              type="button"
              onClick={clear}
              className="mt-4 w-full text-center text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
            >
              Clear range
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Glass Panels ────────────────────────────────────────────────────

function GlassPanel({
  children,
  className = "",
  variant = "frosted",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "frosted" | "clean";
}) {
  const base =
    variant === "frosted"
      ? "bg-black/[0.35] backdrop-blur-xl border-white/[0.12]"
      : "bg-white/[0.78] backdrop-blur-lg border-white/[0.35]";
  return (
    <div
      className={`relative rounded-2xl sm:rounded-3xl border transition-all duration-500 ${base} ${className}`}
      style={{ boxShadow: variant === "frosted"
        ? "0 8px 40px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.06)"
        : "0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)"
      }}
    >
      {children}
    </div>
  );
}

// ── Chart Tooltips ──────────────────────────────────────────────────

function ChartTooltip({ active, payload, label, currency }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl p-4 shadow-2xl text-sm">
      <p className="font-semibold text-gray-900 mb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-gray-600 flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
          {p.name}:{" "}
          <span className="font-semibold text-gray-900">
            {p.name.includes("Cost") || p.name.includes("cost")
              ? formatCurrency(p.value, currency || "ILS")
              : formatDecimal(p.value)}
          </span>
        </p>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl p-3 shadow-2xl text-sm">
      <p className="font-semibold text-gray-900">{d.name}</p>
      <p className="text-gray-500">{formatNumber(d.value)} services</p>
    </div>
  );
}

// ── Static data types ────────────────────────────────────────────────

interface RawRow {
  uid: string; y: number; m: number; br: string;
  vis: number; svc: number; cost: number; gr: number;
  cs: number; cc: number; cg: number;
  hs: number; hc: number; hg: number;
  ts: number; tc: number; tg: number;
  ss: number; sc: number; sg: number;
  os: number; oc: number; og: number;
}

interface SalonMeta {
  userId: string; displayName: string | null;
  state: string | null; city: string | null;
  salonType: string | null; employees: number | null;
  currency: string;
}

function round2(v: number) { return Math.round(v * 100) / 100; }
function sortKey(y: number, m: number) { return y * 100 + m; }
function monthLabelFromYM(y: number, m: number) {
  const names = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${names[m - 1]} ${y}`;
}

function normalizeCurrency(salon: { currency?: string | null; state?: string | null }) {
  const raw = (salon.currency || "").toUpperCase();
  const state = (salon.state || "").toUpperCase();
  // Some Israeli salons are marked as USD in source data; normalize them to ILS.
  if (state === "ISRAEL") return "ILS";
  return raw || "USD";
}

// Pre-compute salon list with total services
const allRows: RawRow[] = (usageData as any).rows;
const allSalonsMeta: SalonMeta[] = (usageData as any).salons;

const salonListWithServices: SalonInfo[] = (() => {
  const svcMap: Record<string, number> = {};
  for (const r of allRows) {
    svcMap[r.uid] = (svcMap[r.uid] || 0) + r.svc;
  }
  return allSalonsMeta.map((s) => ({
    ...s,
    totalServices: Math.round(svcMap[s.userId] || 0),
  })).sort((a, b) => b.totalServices - a.totalServices);
})();

function aggregateForSalon(userId: string, startMonth: string, endMonth: string) {
  let startSk = 0;
  let endSk = 999999;
  if (startMonth) {
    const [sy, sm] = startMonth.split("-").map(Number);
    if (sy && sm) startSk = sortKey(sy, sm);
  }
  if (endMonth) {
    const [ey, em] = endMonth.split("-").map(Number);
    if (ey && em) endSk = sortKey(ey, em);
  }

  const rows = allRows.filter((r) => {
    if (r.uid !== userId) return false;
    const sk = sortKey(r.y, r.m);
    return sk >= startSk && sk <= endSk;
  });

  const salon = allSalonsMeta.find((s) => s.userId === userId) || {
    userId, displayName: null, state: null, city: null, salonType: null, employees: null, currency: "USD",
  };

  let totalServices = 0, totalCost = 0, totalGrams = 0;
  const activeMonthKeys = new Set<number>();
  for (const r of rows) {
    totalServices += r.svc; totalCost += r.cost; totalGrams += r.gr;
    activeMonthKeys.add(sortKey(r.y, r.m));
  }
  const activeMonths = activeMonthKeys.size;

  const catDefs = [
    { name: "Color", sK: "cs" as const, cK: "cc" as const, gK: "cg" as const },
    { name: "Highlights", sK: "hs" as const, cK: "hc" as const, gK: "hg" as const },
    { name: "Toner", sK: "ts" as const, cK: "tc" as const, gK: "tg" as const },
    { name: "Straightening", sK: "ss" as const, cK: "sc" as const, gK: "sg" as const },
    { name: "Others", sK: "os" as const, cK: "oc" as const, gK: "og" as const },
  ];
  const categoryBreakdown = catDefs.map((cat) => {
    let s = 0, c = 0, g = 0;
    for (const r of rows) { s += r[cat.sK]; c += r[cat.cK]; g += r[cat.gK]; }
    return {
      category: cat.name,
      services: Math.round(s),
      totalCost: round2(c),
      avgCostPerService: s > 0 ? round2(c / s) : 0,
      totalGrams: round2(g),
      avgGramsPerService: s > 0 ? round2(g / s) : 0,
    };
  }).filter((c) => c.services > 0);

  const brandAgg: Record<string, { svc: number; cost: number; gr: number; vis: number }> = {};
  for (const r of rows) {
    if (!brandAgg[r.br]) brandAgg[r.br] = { svc: 0, cost: 0, gr: 0, vis: 0 };
    brandAgg[r.br].svc += r.svc; brandAgg[r.br].cost += r.cost;
    brandAgg[r.br].gr += r.gr; brandAgg[r.br].vis += r.vis;
  }
  const brandBreakdown = Object.entries(brandAgg)
    .map(([brand, a]) => ({
      brand, services: Math.round(a.svc), totalCost: round2(a.cost),
      avgCostPerService: a.svc > 0 ? round2(a.cost / a.svc) : 0,
      totalGrams: round2(a.gr), visits: a.vis,
    }))
    .filter((b) => b.services > 0)
    .sort((a, b) => b.services - a.services);

  const monthAgg: Record<number, { y: number; m: number; svc: number; cost: number; gr: number }> = {};
  for (const r of rows) {
    const k = sortKey(r.y, r.m);
    if (!monthAgg[k]) monthAgg[k] = { y: r.y, m: r.m, svc: 0, cost: 0, gr: 0 };
    monthAgg[k].svc += r.svc; monthAgg[k].cost += r.cost; monthAgg[k].gr += r.gr;
  }
  const timeSeries = Object.entries(monthAgg)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([, v]) => ({
      label: monthLabelFromYM(v.y, v.m),
      totalServices: Math.round(v.svc),
      totalCost: round2(v.cost),
      avgCostPerService: v.svc > 0 ? round2(v.cost / v.svc) : 0,
      totalGrams: round2(v.gr),
    }));

  return {
    salon,
    kpis: {
      totalServices: Math.round(totalServices),
      totalMaterialCost: round2(totalCost),
      avgCostPerService: totalServices > 0 ? round2(totalCost / totalServices) : 0,
      activeMonths,
      servicesPerMonth: activeMonths > 0 ? round2(totalServices / activeMonths) : 0,
      totalGrams: round2(totalGrams),
      avgGramsPerService: totalServices > 0 ? round2(totalGrams / totalServices) : 0,
    },
    categoryBreakdown,
    brandBreakdown,
    timeSeries,
    filteredMonthRange: {
      from: timeSeries.length > 0 ? timeSeries[0].label : "",
      to: timeSeries.length > 0 ? timeSeries[timeSeries.length - 1].label : "",
    },
  };
}

// ── Main Dashboard ──────────────────────────────────────────────────

const SalonPerformanceDashboard: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const [selectedSalonId, setSelectedSalonId] = useState<string | null>(null);
  const [startMonth, setStartMonth] = useState("");
  const [endMonth, setEndMonth] = useState("");

  const report = useMemo(() => {
    if (!selectedSalonId) return null;
    return aggregateForSalon(selectedSalonId, startMonth, endMonth);
  }, [selectedSalonId, startMonth, endMonth]);

  const currency = report ? normalizeCurrency(report.salon) : "USD";
  const fc = (v: number) => formatCurrency(v, currency);

  const pieData = useMemo(() => {
    if (!report) return [];
    return report.categoryBreakdown.map((cat) => ({
      name: cat.category,
      value: cat.services,
    }));
  }, [report]);

  const chartInsights = useMemo(() => {
    if (!report || report.timeSeries.length === 0) {
      return {
        avgCostBaseline: 0,
        avgServicesBaseline: 0,
        costDeltaPct: 0,
        servicesDeltaPct: 0,
        peakCostMonth: "",
        peakServicesMonth: "",
        topCategoryName: "",
        topCategoryPct: 0,
      };
    }

    const ts = report.timeSeries;
    const last = ts[ts.length - 1];
    const prev = ts.length > 1 ? ts[ts.length - 2] : null;
    const avgCostBaseline = ts.reduce((acc, row) => acc + row.avgCostPerService, 0) / ts.length;
    const avgServicesBaseline = ts.reduce((acc, row) => acc + row.totalServices, 0) / ts.length;

    const costDeltaPct = prev && prev.totalCost > 0
      ? ((last.totalCost - prev.totalCost) / prev.totalCost) * 100
      : 0;
    const servicesDeltaPct = prev && prev.totalServices > 0
      ? ((last.totalServices - prev.totalServices) / prev.totalServices) * 100
      : 0;

    const peakCost = ts.reduce((max, row) => (row.totalCost > max.totalCost ? row : max), ts[0]);
    const peakServices = ts.reduce((max, row) => (row.totalServices > max.totalServices ? row : max), ts[0]);

    const topCategory = [...report.categoryBreakdown].sort((a, b) => b.services - a.services)[0];
    const topCategoryPct = topCategory && report.kpis.totalServices > 0
      ? Math.round((topCategory.services / report.kpis.totalServices) * 100)
      : 0;

    return {
      avgCostBaseline,
      avgServicesBaseline,
      costDeltaPct,
      servicesDeltaPct,
      peakCostMonth: peakCost.label,
      peakServicesMonth: peakServices.label,
      topCategoryName: topCategory?.category || "",
      topCategoryPct,
    };
  }, [report]);

  const brandAvgCostData = useMemo(() => {
    if (!selectedSalonId) return [];

    let startSk = 0;
    let endSk = 999999;
    if (startMonth) {
      const [sy, sm] = startMonth.split("-").map(Number);
      if (sy && sm) startSk = sortKey(sy, sm);
    }
    if (endMonth) {
      const [ey, em] = endMonth.split("-").map(Number);
      if (ey && em) endSk = sortKey(ey, em);
    }

    const brandAgg: Record<string, { totalCost: number; estimatedServices: number; visits: number }> = {};
    for (const r of allRows) {
      if (r.uid !== selectedSalonId) continue;
      const sk = sortKey(r.y, r.m);
      if (sk < startSk || sk > endSk) continue;

      if (!brandAgg[r.br]) {
        brandAgg[r.br] = { totalCost: 0, estimatedServices: 0, visits: 0 };
      }

      // Service estimation guideline:
      // Color/Toner: 60g per service, Highlights/Straightening: 100g per service.
      // Others uses the source service count (os) since no grams rule was provided.
      const estimatedServices =
        (r.cg / 60) +
        (r.tg / 60) +
        (r.hg / 100) +
        (r.sg / 100) +
        r.os;

      brandAgg[r.br].totalCost += r.cost;
      brandAgg[r.br].estimatedServices += estimatedServices;
      brandAgg[r.br].visits += r.vis;
    }

    return Object.entries(brandAgg)
      .map(([brand, a]) => ({
        brand,
        avgCostPerService: a.estimatedServices > 0 ? round2(a.totalCost / a.estimatedServices) : 0,
        estimatedServices: round2(a.estimatedServices),
        visits: a.visits,
        totalCost: round2(a.totalCost),
      }))
      .filter((b) => b.avgCostPerService > 0)
      .sort((a, b) => b.avgCostPerService - a.avgCostPerService);
  }, [selectedSalonId, startMonth, endMonth]);

  const dashboardContent = (
        <div className={embedded ? "max-w-7xl mx-auto" : "max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-12"}>

          {/* ── Floating Controls Bar ─────────────────────────── */}
          <GlassPanel variant="clean" className="mb-4 sm:mb-8 px-3 sm:px-6 py-3 sm:py-4 relative z-[50]">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
              <div className="flex-1 min-w-0">
                <SalonSelector
                  salons={salonListWithServices}
                  selectedId={selectedSalonId}
                  onSelect={setSelectedSalonId}
                  loading={false}
                />
              </div>
              <div className="h-px sm:h-8 w-full sm:w-px bg-gray-200/50" />
              <div className="flex-shrink-0">
                <DateRangePicker
                  startValue={startMonth}
                  endValue={endMonth}
                  onStartChange={setStartMonth}
                  onEndChange={setEndMonth}
                />
              </div>
            </div>
          </GlassPanel>

          {/* ── Empty State ───────────────────────────────────── */}
          {!selectedSalonId && (
            <div className="flex items-center justify-center" style={{ minHeight: "60vh" }}>
              <GlassPanel variant="frosted" className="p-12 text-center max-w-md">
                <div className="mx-auto mb-6 w-20 h-20 rounded-3xl bg-white/10 border border-white/10 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white/70" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Select a salon to begin
                </h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  Choose a salon from the dropdown above to explore material usage, cost trends, and performance insights.
                </p>
              </GlassPanel>
            </div>
          )}

          {/* ── Report Content ────────────────────────────────── */}
          {report && selectedSalonId && (
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">

              {/* ── Hero Split: Identity + Categories ────────── */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 items-start">

                {/* LEFT PANEL — Frosted: Identity + KPIs */}
                <GlassPanel variant="frosted" className="lg:col-span-2 p-5 sm:p-8">
                  {/* Salon identity */}
                  <div className="mb-7">
                    <div className="w-14 h-14 rounded-2xl bg-white/[0.12] border border-white/[0.15] flex items-center justify-center text-white text-xl font-bold mb-4">
                      {(report.salon.displayName || "?")[0]}
                    </div>
                    <h2 className="text-xl font-bold text-white mb-1 tracking-tight">
                      {report.salon.displayName || report.salon.userId}
                    </h2>
                    <p className="text-xs text-white/60 leading-relaxed">
                      {report.salon.userId}
                      {report.salon.city ? ` · ${report.salon.city}` : ""}
                      {report.salon.state ? `, ${report.salon.state}` : ""}
                    </p>
                    <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full bg-white/[0.10] border border-white/[0.12] text-[11px] text-white/70 font-medium">
                      <Calendar className="w-3 h-3" />
                      {report.filteredMonthRange.from} &rarr; {report.filteredMonthRange.to}
                    </div>
                  </div>

                  <div className="h-px bg-white/[0.12] mb-7" />

                  {/* Key Metrics */}
                  <p className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] mb-5">
                    Key Metrics
                  </p>

                  <div className="space-y-5">
                    {[
                      { icon: Activity,    label: "Total Services",    value: formatNumber(report.kpis.totalServices) },
                      { icon: DollarSign,  label: "Material Cost",     value: fc(report.kpis.totalMaterialCost) },
                      { icon: TrendingUp,  label: "Avg Cost / Service", value: fc(report.kpis.avgCostPerService) },
                      { icon: Calendar,    label: "Active Months",     value: formatNumber(report.kpis.activeMonths) },
                      { icon: Zap,         label: "Services / Month",  value: formatDecimal(report.kpis.servicesPerMonth) },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-center gap-4 group">
                        <div className="w-9 h-9 rounded-xl bg-white/[0.10] border border-white/[0.10] flex items-center justify-center flex-shrink-0 group-hover:bg-white/[0.18] transition-colors duration-300">
                          <Icon className="w-4 h-4 text-white/70" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-white/60 font-medium">{label}</p>
                          <p className="text-lg font-bold text-white tracking-tight">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassPanel>

                {/* RIGHT PANEL — Clean: Service Intelligence */}
                <GlassPanel variant="clean" className="lg:col-span-3 p-5 sm:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-9 h-9 rounded-xl bg-gray-100/80 flex items-center justify-center">
                      <Layers className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">Service Intelligence</h3>
                      <p className="text-[11px] text-gray-400">Average cost per service by category</p>
                    </div>
                  </div>

                  {/* Category rows */}
                  <div className="space-y-3">
                    {report.categoryBreakdown.map((cat) => {
                      const pct = report.kpis.totalServices > 0
                        ? Math.round((cat.services / report.kpis.totalServices) * 100)
                        : 0;
                      const color = getCategoryColor(cat.category);
                      return (
                        <div
                          key={cat.category}
                          className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 hover:bg-gray-50/90 transition-all duration-300 group cursor-default"
                        >
                          {/* Color indicator chip */}
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: color + "14", border: `1px solid ${color}25` }}
                          >
                            <div
                              className="w-3.5 h-3.5 rounded-full shadow-sm"
                              style={{ backgroundColor: color }}
                            />
                          </div>

                          {/* Info column */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900">{cat.category}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] text-gray-400">{formatNumber(cat.services)} services</span>
                              <span className="text-[11px] text-gray-300">&middot;</span>
                              <span className="text-[11px] text-gray-400">{formatDecimal(cat.avgGramsPerService)}g avg</span>
                            </div>
                            {/* Progress bar */}
                            <div className="mt-2 w-full h-1.5 rounded-full bg-gray-200/40 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${pct}%`, backgroundColor: color }}
                              />
                            </div>
                          </div>

                          {/* Hero value */}
                          <div className="text-right flex-shrink-0 pl-2">
                            <p className="text-xl font-bold text-gray-900">{fc(cat.avgCostPerService)}</p>
                            <p className="text-[10px] text-gray-400 font-medium mt-0.5">{pct}% of total</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Mini Pie + Legend */}
                  {pieData.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-100/60">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-x-4 gap-y-2">
                          {pieData.map((entry) => (
                            <div key={entry.name} className="flex items-center gap-1.5 text-[11px] text-gray-500">
                              <div
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: getCategoryColor(entry.name) }}
                              />
                              {entry.name}
                            </div>
                          ))}
                        </div>
                        <div className="flex-shrink-0">
                          <ResponsiveContainer width={90} height={90}>
                            <PieChart>
                              <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={22}
                                outerRadius={40}
                                paddingAngle={3}
                                dataKey="value"
                                stroke="none"
                              >
                                {pieData.map((entry, index) => (
                                  <Cell key={`mini-${index}`} fill={getCategoryColor(entry.name)} />
                                ))}
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  )}
                </GlassPanel>
              </div>

              {/* ── Brand Avg Cost / Service ──────────────────── */}
              {brandAvgCostData.length > 0 && (
                <GlassPanel variant="clean" className="p-4 sm:p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-gradient-to-br from-orange-200/20 via-rose-200/10 to-transparent blur-3xl pointer-events-none" />
                  <div className="relative z-10">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4 sm:mb-5">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#E76F51] to-[#F4A261] flex items-center justify-center">
                            <TrendingUp className="w-3.5 h-3.5 text-white" />
                          </div>
                          <h3 className="text-[15px] font-bold text-gray-900">Avg Cost / Service by Brand</h3>
                        </div>
                        <p className="text-[11px] text-gray-400 ml-9">
                          Cost / estimated services (60g color+toner, 100g highlights+straightening) &middot; {brandAvgCostData.length} brands
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2.5">
                      {brandAvgCostData.map((entry, index) => {
                        const maxVal = brandAvgCostData[0].avgCostPerService;
                        const pct = maxVal > 0 ? Math.round((entry.avgCostPerService / maxVal) * 100) : 0;
                        const colorIdx = Math.min(Math.floor((pct / 100) * (COST_BARS.length - 1)), COST_BARS.length - 1);
                        const barColor = COST_BARS[colorIdx];
                        return (
                          <div key={`brand-row-${index}`} className="group rounded-2xl border border-gray-100/50 bg-white/60 hover:bg-white/90 transition-all duration-300 p-3 sm:p-4">
                            <div className="flex items-center justify-between mb-2 sm:mb-2.5">
                              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                                <div
                                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shadow-sm text-white font-black text-[10px] sm:text-[11px] flex-shrink-0"
                                  style={{ background: `linear-gradient(135deg, ${barColor}, ${COST_BARS[Math.min(colorIdx + 2, COST_BARS.length - 1)]})` }}
                                >
                                  #{index + 1}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[12px] sm:text-[13px] font-bold text-gray-900 leading-tight truncate">{entry.brand}</p>
                                  <p className="text-[9px] sm:text-[10px] text-gray-400 mt-0.5 truncate">
                                    {formatDecimal(entry.estimatedServices)} est. services &middot; {fc(entry.totalCost)} total
                                  </p>
                                </div>
                              </div>
                              <p className="text-lg sm:text-xl font-black text-gray-900 tracking-tight tabular-nums flex-shrink-0 pl-2">
                                {fc(entry.avgCostPerService)}
                              </p>
                            </div>
                            <div className="h-2 w-full rounded-full bg-gray-100/70 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-700 group-hover:shadow-sm"
                                style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${barColor}, ${COST_BARS[Math.min(colorIdx + 2, COST_BARS.length - 1)]})` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </GlassPanel>
              )}

              {/* ── Performance Pair: Cost + Volume ───────────── */}
              {report.timeSeries.length > 1 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Material Cost — Heat Bars */}
                  <GlassPanel variant="clean" className="p-4 sm:p-6 relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-gradient-to-tr from-amber-200/15 to-transparent blur-3xl pointer-events-none" />
                    <div className="relative z-10">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#F9B234] to-[#E74C3C] flex items-center justify-center">
                              <BarChart3 className="w-3.5 h-3.5 text-white" />
                            </div>
                            <h3 className="text-[14px] font-bold text-gray-900">Material Cost</h3>
                          </div>
                          <p className="text-[11px] text-gray-400 ml-9">Heat-mapped by intensity</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold ring-1 ring-amber-200/30">{chartInsights.peakCostMonth} peak</span>
                      </div>
                      <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={report.timeSeries} barCategoryGap="18%">
                          <CartesianGrid strokeDasharray="3 3" stroke={CHART_PALETTE.grid} />
                          <XAxis dataKey="label" stroke={CHART_PALETTE.axis} style={{ fontSize: "10px" }} angle={-35} textAnchor="end" height={44} axisLine={false} tickLine={false} />
                          <YAxis stroke={CHART_PALETTE.axis} style={{ fontSize: "10px" }} axisLine={false} tickLine={false} />
                          <Tooltip content={<ChartTooltip currency={currency} />} />
                          <Bar dataKey="totalCost" name="Total Cost" radius={[10, 10, 4, 4]}>
                            {report.timeSeries.map((entry, index) => {
                              const maxCost = Math.max(...report.timeSeries.map((r) => r.totalCost));
                              const ratio = maxCost > 0 ? entry.totalCost / maxCost : 0;
                              const colorIdx = Math.min(Math.floor(ratio * (COST_BARS.length - 1)), COST_BARS.length - 1);
                              return (
                                <Cell key={`cb-${index}`} fill={COST_BARS[colorIdx]} />
                              );
                            })}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </GlassPanel>

                  {/* Service Volume — Purple Wave */}
                  <GlassPanel variant="clean" className="p-4 sm:p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-gradient-to-bl from-violet-200/15 to-transparent blur-3xl pointer-events-none" />
                    <div className="relative z-10">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] flex items-center justify-center">
                              <Activity className="w-3.5 h-3.5 text-white" />
                            </div>
                            <h3 className="text-[14px] font-bold text-gray-900">Service Volume</h3>
                          </div>
                          <p className="text-[11px] text-gray-400 ml-9">Demand wave over time</p>
                        </div>
                        <div className={`px-3 py-1.5 rounded-full text-[11px] font-bold shadow-sm ${
                          chartInsights.servicesDeltaPct >= 0 ? "bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 ring-1 ring-violet-200/40" : "bg-gradient-to-r from-rose-50 to-pink-50 text-rose-700 ring-1 ring-rose-200/40"
                        }`}>
                          {chartInsights.servicesDeltaPct >= 0 ? "+" : ""}{formatDecimal(chartInsights.servicesDeltaPct)}%
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={report.timeSeries}>
                          <defs>
                            <linearGradient id="volumePurple" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#A29BFE" stopOpacity={0.4} />
                              <stop offset="60%" stopColor="#6C5CE7" stopOpacity={0.08} />
                              <stop offset="100%" stopColor="#6C5CE7" stopOpacity={0.01} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke={CHART_PALETTE.grid} />
                          <XAxis dataKey="label" stroke={CHART_PALETTE.axis} style={{ fontSize: "10px" }} angle={-35} textAnchor="end" height={44} axisLine={false} tickLine={false} />
                          <YAxis stroke={CHART_PALETTE.axis} style={{ fontSize: "10px" }} axisLine={false} tickLine={false} />
                          <Tooltip content={<ChartTooltip currency={currency} />} />
                          <ReferenceLine y={chartInsights.avgServicesBaseline} stroke="#C8B8E8" strokeWidth={1.5} strokeDasharray="6 4" />
                          <Area
                            type="natural"
                            dataKey="totalServices"
                            name="Services"
                            stroke="#6C5CE7"
                            strokeWidth={3}
                            fill="url(#volumePurple)"
                            dot={{ r: 3.5, fill: "#6C5CE7", stroke: "#fff", strokeWidth: 2.5 }}
                            activeDot={{ r: 7, fill: "#fff", stroke: "#6C5CE7", strokeWidth: 3 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </GlassPanel>
                </div>
              )}

              {/* ── Mix + Efficiency ───────────────────────────── */}
              {report.categoryBreakdown.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
                  {pieData.length > 0 && (
                    <GlassPanel variant="clean" className="lg:col-span-7 p-4 sm:p-6 relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-44 h-44 rounded-full bg-gradient-to-br from-pink-200/20 via-amber-200/15 to-transparent blur-3xl" />
                      </div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#E84393] to-[#FDCB6E] flex items-center justify-center">
                            <Layers className="w-3.5 h-3.5 text-white" />
                          </div>
                          <h3 className="text-[14px] font-bold text-gray-900">Service Mix</h3>
                        </div>
                        <p className="text-[11px] text-gray-400 mb-3 ml-9">
                          {chartInsights.topCategoryName} leads with {chartInsights.topCategoryPct}% of all services
                        </p>
                        <div className="relative">
                          <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                              <Pie data={pieData} cx="50%" cy="50%" innerRadius={56} outerRadius={108} paddingAngle={5} dataKey="value" stroke="none" cornerRadius={6}>
                                {pieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name)} />
                                ))}
                              </Pie>
                              <Tooltip content={<PieTooltip />} />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <p className="text-[9px] text-gray-400 uppercase tracking-[0.15em]">Top</p>
                            <p className="text-xl font-black text-gray-900 tracking-tight">{chartInsights.topCategoryName || "N/A"}</p>
                            <p className="text-[11px] text-gray-500 font-medium">{chartInsights.topCategoryPct}%</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap justify-center gap-4 mt-2">
                          {pieData.map((entry) => (
                            <div key={entry.name} className="flex items-center gap-1.5 text-[11px] text-gray-500">
                              <div className="w-3 h-3 rounded-md shadow-sm" style={{ backgroundColor: getCategoryColor(entry.name) }} />
                              {entry.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    </GlassPanel>
                  )}

                  <GlassPanel variant="clean" className="lg:col-span-5 p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                      </div>
                      <h3 className="text-[14px] font-bold text-gray-900">Efficiency Board</h3>
                    </div>
                    <p className="text-[11px] text-gray-400 mb-4 sm:mb-5 ml-9">
                      Compare cost, grams, and share across categories.
                    </p>
                    <div className="space-y-2.5">
                      {report.categoryBreakdown.map((cat) => {
                        const pct = report.kpis.totalServices > 0
                          ? Math.round((cat.services / report.kpis.totalServices) * 100)
                          : 0;
                        const color = getCategoryColor(cat.category);
                        const grad = getCategoryGradient(cat.category);
                        return (
                          <div key={`eff-${cat.category}`} className="rounded-2xl border border-gray-100/50 bg-white/60 p-3.5 hover:bg-white/90 transition-all duration-300 group">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2.5">
                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${grad.bg} flex items-center justify-center shadow-sm`}>
                                  <span className="text-[10px] font-black text-white">{pct}%</span>
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-gray-800">{cat.category}</p>
                                  <p className="text-[10px] text-gray-400">{formatNumber(cat.services)} services</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-gray-900">{fc(cat.avgCostPerService)}</p>
                                <p className="text-[10px] text-gray-400">{formatDecimal(cat.avgGramsPerService)}g</p>
                              </div>
                            </div>
                            <div className="h-2 w-full rounded-full bg-gray-100/70 overflow-hidden">
                              <div
                                className={`h-full rounded-full bg-gradient-to-r ${grad.bg} transition-all duration-700 group-hover:shadow-sm`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </GlassPanel>
                </div>
              )}

              {/* ── Brand Performance Table ───────────────────── */}
              {report.brandBreakdown.length > 0 && (
                <GlassPanel variant="clean" className="overflow-hidden">
                  <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-2 sm:pb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="w-4 h-4 text-cyan-500" />
                      <h3 className="text-sm font-bold text-gray-900">Brand Performance</h3>
                    </div>
                    <p className="text-[11px] text-gray-400">Cost and usage breakdown by brand</p>
                  </div>
                  <div className="px-4 sm:px-6 pb-4 sm:pb-5">
                    <div className="rounded-2xl overflow-x-auto border border-gray-100/40">
                      <table className="w-full text-sm min-w-[560px]">
                        <thead>
                          <tr className="bg-gray-50/60">
                            <th className="text-left px-4 py-3 font-semibold text-gray-500 text-[11px] uppercase tracking-wider">Brand</th>
                            <th className="text-right px-4 py-3 font-semibold text-gray-500 text-[11px] uppercase tracking-wider">Services</th>
                            <th className="text-right px-4 py-3 font-semibold text-gray-500 text-[11px] uppercase tracking-wider">Total Cost</th>
                            <th className="text-right px-4 py-3 font-semibold text-gray-500 text-[11px] uppercase tracking-wider">Avg / Svc</th>
                            <th className="text-right px-4 py-3 font-semibold text-gray-500 text-[11px] uppercase tracking-wider">Grams</th>
                            <th className="text-right px-4 py-3 font-semibold text-gray-500 text-[11px] uppercase tracking-wider">Visits</th>
                          </tr>
                        </thead>
                        <tbody>
                          {report.brandBreakdown.map((brand, i) => (
                            <tr key={brand.brand} className={`border-t border-gray-100/40 hover:bg-gray-50/40 transition-colors ${i % 2 === 0 ? "bg-white/50" : "bg-white/30"}`}>
                              <td className="px-4 py-3.5 font-semibold text-gray-900 flex items-center gap-2.5">
                                <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: BRAND_COLORS[i % BRAND_COLORS.length] }} />
                                {brand.brand}
                              </td>
                              <td className="text-right px-4 py-3.5 text-gray-600">{formatNumber(brand.services)}</td>
                              <td className="text-right px-4 py-3.5 text-gray-600">{fc(brand.totalCost)}</td>
                              <td className="text-right px-4 py-3.5 font-bold text-gray-900">{fc(brand.avgCostPerService)}</td>
                              <td className="text-right px-4 py-3.5 text-gray-600">{formatNumber(brand.totalGrams)}</td>
                              <td className="text-right px-4 py-3.5 text-gray-600">{formatNumber(brand.visits)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </GlassPanel>
              )}

            </div>
          )}
        </div>
  );

  if (embedded) {
    return dashboardContent;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat will-change-transform"
        style={{ backgroundImage: "url('/salooon0000.jpg')" }}
      />
      <div className="fixed inset-0 z-[1] bg-black/60 backdrop-blur-[2px]" />
      <div className="fixed inset-0 z-[1] bg-gradient-to-b from-black/28 via-black/8 to-black/45" />
      <main className="relative z-10 min-h-screen">
        {dashboardContent}
      </main>
    </div>
  );
};

export default SalonPerformanceDashboard;
