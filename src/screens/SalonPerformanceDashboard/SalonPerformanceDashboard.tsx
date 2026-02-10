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
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
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

// ── Gradient Palette ─────────────────────────────────────────────────

const GRADIENTS = {
  coral:   { from: "#FF6B6B", to: "#FF8E53", bg: "from-[#FF6B6B] to-[#FF8E53]" },
  slate:   { from: "#475569", to: "#1E293B", bg: "from-[#475569] to-[#1E293B]" },
  cyan:    { from: "#22D3EE", to: "#3B82F6", bg: "from-[#22D3EE] to-[#3B82F6]" },
  green:   { from: "#34D399", to: "#10B981", bg: "from-[#34D399] to-[#10B981]" },
  pink:    { from: "#F472B6", to: "#EC4899", bg: "from-[#F472B6] to-[#EC4899]" },
  amber:   { from: "#FBBF24", to: "#F59E0B", bg: "from-[#FBBF24] to-[#F59E0B]" },
  steel:   { from: "#64748B", to: "#334155", bg: "from-[#64748B] to-[#334155]" },
};

const PIE_COLORS = ["#FF6B6B", "#3B82F6", "#22D3EE", "#34D399", "#F472B6", "#FBBF24", "#64748B"];

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
    <div ref={dropdownRef} className="relative w-full max-w-sm z-[100]">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-11 w-full items-center justify-between rounded-2xl border border-white/30 bg-white/60 backdrop-blur-xl px-4 py-2.5 text-sm shadow-sm hover:bg-white/80 transition-all duration-300"
        disabled={loading}
      >
        <span className={selected ? "text-gray-800 font-medium" : "text-gray-400"}>
          {loading
            ? "Loading salons..."
            : selected
            ? `${selected.displayName || selected.userId}`
            : "Select Salon"}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full z-[200] mt-2 w-full rounded-2xl border border-white/40 bg-white/90 backdrop-blur-2xl shadow-2xl max-h-80 overflow-hidden">
          <div className="p-3 border-b border-gray-100/60">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, ID, or city..."
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-gray-200/60 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400/20 focus:border-gray-300"
                autoFocus
              />
            </div>
          </div>
          <div className="overflow-y-auto max-h-56">
            {filtered.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-gray-400">No salons found</div>
            ) : (
              filtered.map((salon) => (
                <button
                  key={salon.userId}
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50/60 transition-colors border-b border-gray-50/60 last:border-0 ${
                    salon.userId === selectedId ? "bg-gray-50/80" : ""
                  }`}
                  onClick={() => { onSelect(salon.userId); setOpen(false); setSearch(""); }}
                >
                  <div className="font-medium text-gray-900">{salon.displayName || salon.userId}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
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

// ── Gradient KPI Card ────────────────────────────────────────────────

function GradientKpiCard({
  label,
  value,
  icon,
  subtitle,
  gradient,
  delay = 0,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  subtitle?: string;
  gradient: string;
  delay?: number;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-5 text-white shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.02] group`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Glass overlay */}
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      {/* Decorative circle */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10 blur-sm" />
      <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/5" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-white/80">{label}</p>
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            {icon}
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-bold tracking-tight">{value}</p>
        {subtitle && <p className="text-xs text-white/60 mt-1.5">{subtitle}</p>}
      </div>
    </div>
  );
}

// ── Glass Card wrapper ──────────────────────────────────────────────

function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-lg shadow-gray-900/[0.04] ${className}`}>
      {children}
    </div>
  );
}

// ── Custom Tooltip ──────────────────────────────────────────────────

function ChartTooltip({ active, payload, label, currency }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl p-4 shadow-2xl text-sm">
      <p className="font-semibold text-gray-900 mb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-gray-600 flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: p.color }}
          />
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

const SalonPerformanceDashboard: React.FC = () => {
  const [selectedSalonId, setSelectedSalonId] = useState<string | null>(null);
  const [startMonth, setStartMonth] = useState("");
  const [endMonth, setEndMonth] = useState("");

  const report = useMemo(() => {
    if (!selectedSalonId) return null;
    return aggregateForSalon(selectedSalonId, startMonth, endMonth);
  }, [selectedSalonId, startMonth, endMonth]);

  const currency = report?.salon?.currency || "USD";
  const fc = (v: number) => formatCurrency(v, currency);

  // Prepare pie data from category breakdown
  const pieData = useMemo(() => {
    if (!report) return [];
    return report.categoryBreakdown.map((cat) => ({
      name: cat.category,
      value: cat.services,
    }));
  }, [report]);

  // Prepare radar data from categories
  const radarData = useMemo(() => {
    if (!report) return [];
    return report.categoryBreakdown.map((cat) => ({
      category: cat.category,
      cost: cat.avgCostPerService,
      grams: cat.avgGramsPerService,
    }));
  }, [report]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FB] via-[#F3F4F6] to-[#EEF0F4] relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-slate-200/30 to-gray-200/20 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-gradient-to-br from-blue-100/15 to-slate-200/15 blur-3xl" />
        <div className="absolute top-[30%] left-[50%] w-[300px] h-[300px] rounded-full bg-gradient-to-br from-gray-100/10 to-slate-100/10 blur-3xl" />
      </div>

      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* ── Page Header ────────────────────────────────────── */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center shadow-lg shadow-gray-900/20">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Salon Performance
              </h1>
            </div>
            <p className="text-sm text-gray-500 ml-[52px]">
              Material cost analysis per service, per month, and per brand.
            </p>
          </div>

          {/* ── Controls Bar ───────────────────────────────────── */}
          <GlassCard className="mb-8 p-5 relative z-[100]">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[240px]">
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                  Salon
                </label>
                <SalonSelector
                  salons={salonListWithServices}
                  selectedId={selectedSalonId}
                  onSelect={setSelectedSalonId}
                  loading={false}
                />
              </div>
              <div className="min-w-[150px]">
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                  From Month
                </label>
                <input
                  type="month"
                  value={startMonth}
                  onChange={(e) => setStartMonth(e.target.value)}
                  className="h-11 w-full rounded-2xl border border-gray-200/50 bg-white/60 backdrop-blur-xl px-4 text-sm shadow-sm hover:bg-white/80 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400/20 focus:border-gray-300"
                />
              </div>
              <div className="min-w-[150px]">
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                  To Month
                </label>
                <input
                  type="month"
                  value={endMonth}
                  onChange={(e) => setEndMonth(e.target.value)}
                  className="h-11 w-full rounded-2xl border border-gray-200/50 bg-white/60 backdrop-blur-xl px-4 text-sm shadow-sm hover:bg-white/80 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400/20 focus:border-gray-300"
                />
              </div>
            </div>
          </GlassCard>

          {/* ── Empty State ────────────────────────────────────── */}
          {!selectedSalonId && (
            <div className="flex items-center justify-center h-[420px]">
              <div className="text-center">
                <div className="relative mx-auto mb-6 w-24 h-24">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-gray-400 to-gray-500 opacity-15 blur-xl animate-pulse" />
                  <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200/50 backdrop-blur-xl flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-gray-400" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Select a salon to get started
                </h3>
                <p className="text-sm text-gray-400 max-w-sm mx-auto leading-relaxed">
                  Choose a salon from the dropdown above to explore material usage, cost trends, and brand performance.
                </p>
              </div>
            </div>
          )}

          {/* ── Report Content ──────────────────────────────────── */}
          {report && selectedSalonId && (
            <div className="space-y-6">
              {/* Salon info bar */}
              {report.salon.displayName && (
                <GlassCard className="px-5 py-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-gray-900/15">
                    {(report.salon.displayName || "?")[0]}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">
                      {report.salon.displayName}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {report.salon.userId}
                      {report.salon.city ? ` · ${report.salon.city}` : ""}
                      {report.salon.state ? `, ${report.salon.state}` : ""}
                      {` · ${report.filteredMonthRange.from} → ${report.filteredMonthRange.to}`}
                    </p>
                  </div>
                </GlassCard>
              )}

              {/* ── KPI Cards ─────────────────────────────────── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <GradientKpiCard
                  label="Total Services"
                  value={formatNumber(report.kpis.totalServices)}
                  icon={<Activity className="h-4 w-4 text-white" />}
                  subtitle="In selected period"
                  gradient={GRADIENTS.coral.bg}
                  delay={0}
                />
                <GradientKpiCard
                  label="Material Cost"
                  value={fc(report.kpis.totalMaterialCost)}
                  icon={<DollarSign className="h-4 w-4 text-white" />}
                  subtitle="Materials only"
                  gradient={GRADIENTS.slate.bg}
                  delay={50}
                />
                <GradientKpiCard
                  label="Avg Cost / Service"
                  value={fc(report.kpis.avgCostPerService)}
                  icon={<TrendingUp className="h-4 w-4 text-white" />}
                  subtitle="Per category per month"
                  gradient={GRADIENTS.cyan.bg}
                  delay={100}
                />
                <GradientKpiCard
                  label="Active Months"
                  value={formatNumber(report.kpis.activeMonths)}
                  icon={<Calendar className="h-4 w-4 text-white" />}
                  subtitle="With activity"
                  gradient={GRADIENTS.green.bg}
                  delay={150}
                />
                <GradientKpiCard
                  label="Services / Month"
                  value={formatDecimal(report.kpis.servicesPerMonth)}
                  icon={<Zap className="h-4 w-4 text-white" />}
                  subtitle="Average pace"
                  gradient={GRADIENTS.pink.bg}
                  delay={200}
                />
              </div>

              {/* ── Charts Row 1: Area + Bar ────────────────────── */}
              {report.timeSeries.length > 1 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Avg Cost per Service - Area Chart */}
                  <GlassCard className="p-6">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      <h3 className="text-base font-bold text-gray-900">Avg Cost / Service</h3>
                    </div>
                    <p className="text-xs text-gray-400 mb-4">Monthly trend with gradient</p>
                    <ResponsiveContainer width="100%" height={280}>
                      <AreaChart data={report.timeSeries}>
                        <defs>
                          <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.35} />
                            <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB40" />
                        <XAxis
                          dataKey="label"
                          stroke="#9CA3AF"
                          style={{ fontSize: "11px" }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis stroke="#9CA3AF" style={{ fontSize: "11px" }} axisLine={false} tickLine={false} />
                        <Tooltip content={<ChartTooltip currency={currency} />} />
                        <Area
                          type="monotone"
                          dataKey="avgCostPerService"
                          name="Avg cost/svc"
                          stroke="#3B82F6"
                          strokeWidth={3}
                          fill="url(#gradBlue)"
                          dot={{ r: 4, fill: "#3B82F6", stroke: "#fff", strokeWidth: 2 }}
                          activeDot={{ r: 7, fill: "#3B82F6", stroke: "#fff", strokeWidth: 3 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </GlassCard>

                  {/* Total Material Cost - Gradient Bar Chart */}
                  <GlassCard className="p-6">
                    <div className="flex items-center gap-2 mb-1">
                      <BarChart3 className="w-4 h-4 text-cyan-500" />
                      <h3 className="text-base font-bold text-gray-900">Total Material Cost</h3>
                    </div>
                    <p className="text-xs text-gray-400 mb-4">Monthly breakdown</p>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={report.timeSeries}>
                        <defs>
                          <linearGradient id="gradBar" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#22D3EE" stopOpacity={1} />
                            <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.8} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB40" />
                        <XAxis
                          dataKey="label"
                          stroke="#9CA3AF"
                          style={{ fontSize: "11px" }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis stroke="#9CA3AF" style={{ fontSize: "11px" }} axisLine={false} tickLine={false} />
                        <Tooltip content={<ChartTooltip currency={currency} />} />
                        <Bar
                          dataKey="totalCost"
                          name="Total Cost"
                          fill="url(#gradBar)"
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </GlassCard>
                </div>
              )}

              {/* ── Charts Row 2: Services over time + Pie ──────── */}
              {report.timeSeries.length > 1 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Services Volume - Area Chart */}
                  <GlassCard className="p-6">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="w-4 h-4 text-pink-500" />
                      <h3 className="text-base font-bold text-gray-900">Service Volume</h3>
                    </div>
                    <p className="text-xs text-gray-400 mb-4">Monthly services count</p>
                    <ResponsiveContainer width="100%" height={280}>
                      <AreaChart data={report.timeSeries}>
                        <defs>
                          <linearGradient id="gradPink" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#F472B6" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="#F472B6" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB40" />
                        <XAxis
                          dataKey="label"
                          stroke="#9CA3AF"
                          style={{ fontSize: "11px" }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis stroke="#9CA3AF" style={{ fontSize: "11px" }} axisLine={false} tickLine={false} />
                        <Tooltip content={<ChartTooltip currency={currency} />} />
                        <Area
                          type="monotone"
                          dataKey="totalServices"
                          name="Services"
                          stroke="#F472B6"
                          strokeWidth={3}
                          fill="url(#gradPink)"
                          dot={{ r: 4, fill: "#F472B6", stroke: "#fff", strokeWidth: 2 }}
                          activeDot={{ r: 7, fill: "#F472B6", stroke: "#fff", strokeWidth: 3 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </GlassCard>

                  {/* Category Pie Chart */}
                  {pieData.length > 0 && (
                    <GlassCard className="p-6">
                      <div className="flex items-center gap-2 mb-1">
                        <Layers className="w-4 h-4 text-amber-500" />
                        <h3 className="text-base font-bold text-gray-900">Service Mix</h3>
                      </div>
                      <p className="text-xs text-gray-400 mb-4">By category distribution</p>
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={110}
                            paddingAngle={4}
                            dataKey="value"
                            stroke="none"
                          >
                            {pieData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<PieTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      {/* Legend */}
                      <div className="flex flex-wrap justify-center gap-3 mt-2">
                        {pieData.map((entry, index) => (
                          <div key={entry.name} className="flex items-center gap-1.5 text-xs text-gray-600">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                            />
                            {entry.name}
                          </div>
                        ))}
                      </div>
                    </GlassCard>
                  )}
                </div>
              )}

              {/* ── Service Category Breakdown Table ───────────── */}
              {report.categoryBreakdown.length > 0 && (
                <GlassCard className="overflow-hidden">
                  <div className="px-6 pt-5 pb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Layers className="w-4 h-4 text-slate-500" />
                      <h3 className="text-base font-bold text-gray-900">Service Categories</h3>
                    </div>
                    <p className="text-xs text-gray-400">Material cost breakdown by service type</p>
                  </div>
                  <div className="px-6 pb-5">
                    <div className="rounded-xl overflow-hidden border border-gray-100/60">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gradient-to-r from-gray-50 to-slate-50">
                            <th className="text-left px-4 py-3 font-semibold text-gray-700">Category</th>
                            <th className="text-right px-4 py-3 font-semibold text-gray-700">Services</th>
                            <th className="text-right px-4 py-3 font-semibold text-gray-700">Total Cost</th>
                            <th className="text-right px-4 py-3 font-semibold text-gray-700">Avg Cost / Svc</th>
                            <th className="text-right px-4 py-3 font-semibold text-gray-700">Total Grams</th>
                            <th className="text-right px-4 py-3 font-semibold text-gray-700">Avg g / Svc</th>
                          </tr>
                        </thead>
                        <tbody>
                          {report.categoryBreakdown.map((cat, i) => (
                            <tr key={cat.category} className={`border-t border-gray-100/60 hover:bg-gray-50/40 transition-colors ${i % 2 === 0 ? "bg-white/40" : "bg-white/20"}`}>
                              <td className="px-4 py-3 font-semibold text-gray-900 flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                                {cat.category}
                              </td>
                              <td className="text-right px-4 py-3 text-gray-700">{formatNumber(cat.services)}</td>
                              <td className="text-right px-4 py-3 text-gray-700">{fc(cat.totalCost)}</td>
                              <td className="text-right px-4 py-3 font-bold text-gray-900">{fc(cat.avgCostPerService)}</td>
                              <td className="text-right px-4 py-3 text-gray-700">{formatNumber(cat.totalGrams)}</td>
                              <td className="text-right px-4 py-3 text-gray-700">{formatDecimal(cat.avgGramsPerService)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* ── Brand Breakdown ──────────────────────────── */}
              {report.brandBreakdown.length > 0 && (
                <GlassCard className="overflow-hidden">
                  <div className="px-6 pt-5 pb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="w-4 h-4 text-cyan-500" />
                      <h3 className="text-base font-bold text-gray-900">Brand Performance</h3>
                    </div>
                    <p className="text-xs text-gray-400">Cost and usage breakdown by color brand</p>
                  </div>
                  <div className="px-6 pb-5">
                    <div className="rounded-xl overflow-hidden border border-gray-100/60">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gradient-to-r from-cyan-50/80 to-blue-50/80">
                            <th className="text-left px-4 py-3 font-semibold text-gray-700">Brand</th>
                            <th className="text-right px-4 py-3 font-semibold text-gray-700">Services</th>
                            <th className="text-right px-4 py-3 font-semibold text-gray-700">Total Cost</th>
                            <th className="text-right px-4 py-3 font-semibold text-gray-700">Avg Cost / Svc</th>
                            <th className="text-right px-4 py-3 font-semibold text-gray-700">Total Grams</th>
                            <th className="text-right px-4 py-3 font-semibold text-gray-700">Visits</th>
                          </tr>
                        </thead>
                        <tbody>
                          {report.brandBreakdown.map((brand, i) => (
                            <tr key={brand.brand} className={`border-t border-gray-100/60 hover:bg-cyan-50/30 transition-colors ${i % 2 === 0 ? "bg-white/40" : "bg-white/20"}`}>
                              <td className="px-4 py-3 font-semibold text-gray-900 flex items-center gap-2">
                                <div className="w-2 h-8 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                                {brand.brand}
                              </td>
                              <td className="text-right px-4 py-3 text-gray-700">{formatNumber(brand.services)}</td>
                              <td className="text-right px-4 py-3 text-gray-700">{fc(brand.totalCost)}</td>
                              <td className="text-right px-4 py-3 font-bold text-gray-900">{fc(brand.avgCostPerService)}</td>
                              <td className="text-right px-4 py-3 text-gray-700">{formatNumber(brand.totalGrams)}</td>
                              <td className="text-right px-4 py-3 text-gray-700">{formatNumber(brand.visits)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* ── Radar Chart (Category comparison) ────────── */}
              {radarData.length >= 3 && (
                <GlassCard className="p-6">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-green-500" />
                    <h3 className="text-base font-bold text-gray-900">Category Profile</h3>
                  </div>
                  <p className="text-xs text-gray-400 mb-4">Avg cost vs avg grams per service by category</p>
                  <ResponsiveContainer width="100%" height={340}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#E5E7EB60" />
                      <PolarAngleAxis dataKey="category" tick={{ fontSize: 12, fill: "#6B7280" }} />
                      <PolarRadiusAxis style={{ fontSize: "10px" }} stroke="#9CA3AF60" />
                      <Radar
                        name="Avg Cost"
                        dataKey="cost"
                        stroke="#3B82F6"
                        fill="#3B82F6"
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                      <Radar
                        name="Avg Grams"
                        dataKey="grams"
                        stroke="#22D3EE"
                        fill="#22D3EE"
                        fillOpacity={0.15}
                        strokeWidth={2}
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-6 mt-2">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <div className="w-3 h-3 rounded-full bg-blue-500" /> Avg Cost / Service
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <div className="w-3 h-3 rounded-full bg-cyan-400" /> Avg Grams / Service
                    </div>
                  </div>
                </GlassCard>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SalonPerformanceDashboard;
