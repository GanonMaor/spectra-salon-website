import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import { Navigation } from "../../components/Navigation";
import data from "../../data/market-intelligence.json";

// ── Types ───────────────────────────────────────────────────────────
interface MonthlyTrend {
  label: string;
  year: number;
  monthNumber: number;
  totalVisits: number;
  totalServices: number;
  totalRevenue: number;
  totalGrams: number;
  activeBrands: number;
  salonBrandPairs: number;
  colorServices: number;
  colorRevenue: number;
  highlightsServices: number;
  highlightsRevenue: number;
  tonerServices: number;
  tonerRevenue: number;
  straighteningServices: number;
  straighteningRevenue: number;
  othersServices: number;
  othersRevenue: number;
}

interface BrandPerf {
  brand: string;
  totalServices: number;
  totalRevenue: number;
  totalVisits: number;
  totalGrams: number;
  monthsActive: number;
  salonBrandPairs: number;
}

interface ServiceBreak {
  type: string;
  totalServices: number;
  totalRevenue: number;
  totalGrams: number;
}

interface GeoEntry {
  country: string;
  totalServices: number;
  totalRevenue: number;
  totalVisits: number;
  salonBrandPairs: number;
  topCities: { city: string; totalServices: number; totalRevenue: number }[];
}

interface SalonSize {
  label: string;
  count: number;
  avgServices: number;
  avgRevenue: number;
  avgVisits: number;
  totalServices: number;
  totalRevenue: number;
}

interface PricingTrend {
  label: string;
  avgRootColorPrice: number | null;
  avgHighlightsPrice: number | null;
  avgHaircutPrice: number | null;
}

interface CustomerEntry {
  userId: string;
  country: string;
  city: string;
  salonType: string;
  employees: number;
  totalVisits: number;
  totalServices: number;
  totalRevenue: number;
  totalGrams: number;
  brandsUsed: number;
  topBrands: string[];
  monthsActive: number;
  firstMonth: string;
  lastMonth: string;
  colorServices: number;
  highlightsServices: number;
  tonerServices: number;
  straighteningServices: number;
  othersServices: number;
}

// Snapshot types for month comparison
interface SnapshotTotals {
  services: number;
  revenue: number;
  visits: number;
  grams: number;
}
interface SnapshotServiceType {
  services: number;
  revenue: number;
  grams: number;
}
interface SnapshotBrand {
  services: number;
  revenue: number;
  visits: number;
  grams: number;
  customerCount: number;
}
interface SnapshotCustomer {
  services: number;
  revenue: number;
  visits: number;
  grams: number;
  brandsUsed: number;
}
interface MonthSnapshot {
  label: string;
  sortIdx: number;
  totals: SnapshotTotals;
  serviceTypes: Record<string, SnapshotServiceType>;
  brandCount: number;
  customerCount: number;
  brands: Record<string, SnapshotBrand>;
  customers: Record<string, SnapshotCustomer>;
}

// ── Constants ───────────────────────────────────────────────────────
const ACCESS_CODE = "070315";
const SESSION_KEY = "mi_unlocked";

const CHART_COLORS = {
  blue: "#3B82F6",
  green: "#10B981",
  orange: "#F97316",
  amber: "#F59E0B",
  purple: "#8B5CF6",
  pink: "#EC4899",
  cyan: "#06B6D4",
  red: "#EF4444",
};

const SERVICE_COLORS: Record<string, string> = {
  Color: CHART_COLORS.blue,
  Highlights: CHART_COLORS.amber,
  Toner: CHART_COLORS.green,
  Straightening: CHART_COLORS.purple,
  Others: CHART_COLORS.pink,
};

const PIE_COLORS = [
  CHART_COLORS.blue,
  CHART_COLORS.amber,
  CHART_COLORS.green,
  CHART_COLORS.purple,
  CHART_COLORS.pink,
];

const PALETTE = [
  CHART_COLORS.blue, CHART_COLORS.amber, CHART_COLORS.green,
  CHART_COLORS.purple, CHART_COLORS.pink, CHART_COLORS.orange,
  CHART_COLORS.cyan, CHART_COLORS.red, "#6366F1", "#14B8A6",
];

// ── Formatters ──────────────────────────────────────────────────────
const fmtCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(v);

const fmtNumber = (v: number) =>
  new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(v);

const fmtFull = (v: number) =>
  new Intl.NumberFormat("en-US").format(Math.round(v));

const fmtDollar = (v: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v);

// ── Sub-components ──────────────────────────────────────────────────

function GlassCard({
  children,
  className = "",
  title,
  subtitle,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}) {
  return (
    <div
      className={`bg-white/[0.07] backdrop-blur-xl border border-white/[0.12] rounded-2xl p-5 sm:p-6 ${className}`}
    >
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {subtitle && <p className="text-sm text-white/50 mt-1">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

function KpiStat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-white/[0.07] backdrop-blur-xl border border-white/[0.12] rounded-2xl p-5 flex flex-col gap-1">
      <p className="text-sm font-medium text-white/60">{label}</p>
      <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
        {value}
      </p>
      {sub && <p className="text-xs text-white/40">{sub}</p>}
    </div>
  );
}

// Custom tooltip for charts
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900/95 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-sm font-medium text-white/80 mb-2">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-white/60">{entry.name}:</span>
          <span className="text-white font-medium">
            {typeof entry.value === "number"
              ? entry.value >= 1000
                ? fmtCurrency(entry.value)
                : fmtFull(entry.value)
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Helper: change badge ─────────────────────────────────────────────
function ChangeBadge({ value, suffix = "" }: { value: number; suffix?: string }) {
  if (value === 0) return <span className="text-white/30 text-xs">—</span>;
  const isUp = value > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
        isUp ? "text-green-400" : "text-red-400"
      }`}
    >
      {isUp ? "\u25B2" : "\u25BC"} {Math.abs(value).toLocaleString("en-US", { maximumFractionDigits: 1 })}
      {suffix}
    </span>
  );
}

function pctChange(a: number, b: number): number {
  if (a === 0) return b === 0 ? 0 : 100;
  return ((b - a) / a) * 100;
}

// ── Month Comparison Module ─────────────────────────────────────────
function MonthComparison({
  snapshots,
  monthLabels,
}: {
  snapshots: Record<string, MonthSnapshot>;
  monthLabels: string[];
}) {
  const [monthA, setMonthA] = useState(monthLabels.length > 1 ? monthLabels[monthLabels.length - 2] : monthLabels[0]);
  const [monthB, setMonthB] = useState(monthLabels[monthLabels.length - 1]);
  const [compared, setCompared] = useState(false);
  const [healthFilter, setHealthFilter] = useState(true); // only shared entities

  const snapA = snapshots[monthA];
  const snapB = snapshots[monthB];

  const handleCompare = () => {
    setCompared(true);
  };

  // ── Derived comparison data ──
  const comparison = useMemo(() => {
    if (!compared || !snapA || !snapB) return null;

    // Totals
    const totalsDelta = {
      services: snapB.totals.services - snapA.totals.services,
      servicesPct: pctChange(snapA.totals.services, snapB.totals.services),
      revenue: snapB.totals.revenue - snapA.totals.revenue,
      revenuePct: pctChange(snapA.totals.revenue, snapB.totals.revenue),
      visits: snapB.totals.visits - snapA.totals.visits,
      visitsPct: pctChange(snapA.totals.visits, snapB.totals.visits),
      grams: snapB.totals.grams - snapA.totals.grams,
      gramsPct: pctChange(snapA.totals.grams, snapB.totals.grams),
    };

    // Service types
    const serviceTypeKeys = Object.keys(snapA.serviceTypes);
    const serviceComparison = serviceTypeKeys.map((type) => {
      const a = snapA.serviceTypes[type] || { services: 0, revenue: 0, grams: 0 };
      const b = snapB.serviceTypes[type] || { services: 0, revenue: 0, grams: 0 };
      return {
        type: type.charAt(0).toUpperCase() + type.slice(1),
        servicesA: a.services,
        servicesB: b.services,
        servicesDelta: b.services - a.services,
        servicesPct: pctChange(a.services, b.services),
        revenueA: a.revenue,
        revenueB: b.revenue,
        revenueDelta: b.revenue - a.revenue,
        revenuePct: pctChange(a.revenue, b.revenue),
        gramsA: a.grams,
        gramsB: b.grams,
        gramsDelta: b.grams - a.grams,
        gramsPct: pctChange(a.grams, b.grams),
      };
    });

    // Brands
    const allBrandsSet = new Set([
      ...Object.keys(snapA.brands),
      ...Object.keys(snapB.brands),
    ]);
    const brandsA = new Set(Object.keys(snapA.brands));
    const brandsB = new Set(Object.keys(snapB.brands));
    const newBrands = [...brandsB].filter((b) => !brandsA.has(b));
    const lostBrands = [...brandsA].filter((b) => !brandsB.has(b));
    const sharedBrands = [...brandsA].filter((b) => brandsB.has(b));

    const brandComparison = (healthFilter ? sharedBrands : [...allBrandsSet])
      .map((brand) => {
        const a = snapA.brands[brand] || { services: 0, revenue: 0, visits: 0, grams: 0, customerCount: 0 };
        const b = snapB.brands[brand] || { services: 0, revenue: 0, visits: 0, grams: 0, customerCount: 0 };
        return {
          brand,
          servicesA: a.services,
          servicesB: b.services,
          servicesDelta: b.services - a.services,
          servicesPct: pctChange(a.services, b.services),
          revenueA: a.revenue,
          revenueB: b.revenue,
          revenueDelta: b.revenue - a.revenue,
          revenuePct: pctChange(a.revenue, b.revenue),
          gramsA: a.grams,
          gramsB: b.grams,
          gramsDelta: b.grams - a.grams,
          isNew: newBrands.includes(brand),
          isLost: lostBrands.includes(brand),
        };
      })
      .sort((a, b) => Math.abs(b.revenueDelta) - Math.abs(a.revenueDelta));

    // Customers
    const customersA = new Set(Object.keys(snapA.customers));
    const customersB = new Set(Object.keys(snapB.customers));
    const newCustomers = [...customersB].filter((c) => !customersA.has(c));
    const lostCustomers = [...customersA].filter((c) => !customersB.has(c));
    const sharedCustomers = [...customersA].filter((c) => customersB.has(c));
    const allCustomersSet = new Set([...customersA, ...customersB]);

    const customerComparison = (healthFilter ? sharedCustomers : [...allCustomersSet])
      .map((uid) => {
        const a = snapA.customers[uid] || { services: 0, revenue: 0, visits: 0, grams: 0, brandsUsed: 0 };
        const b = snapB.customers[uid] || { services: 0, revenue: 0, visits: 0, grams: 0, brandsUsed: 0 };
        return {
          userId: uid,
          servicesA: a.services,
          servicesB: b.services,
          servicesDelta: b.services - a.services,
          revenueA: a.revenue,
          revenueB: b.revenue,
          revenueDelta: b.revenue - a.revenue,
          gramsA: a.grams,
          gramsB: b.grams,
          gramsDelta: b.grams - a.grams,
          isNew: newCustomers.includes(uid),
          isLost: lostCustomers.includes(uid),
        };
      })
      .sort((a, b) => Math.abs(b.revenueDelta) - Math.abs(a.revenueDelta));

    return {
      totalsDelta,
      serviceComparison,
      brandComparison,
      customerComparison,
      newBrands,
      lostBrands,
      sharedBrands,
      newCustomers,
      lostCustomers,
      sharedCustomers,
    };
  }, [compared, snapA, snapB, healthFilter]);

  return (
    <GlassCard
      title="Month vs Month Comparison"
      subtitle="Select two months to compare trends, new entrants, and data health"
    >
      {/* Selectors row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 mb-6">
        <div className="flex-1">
          <label className="block text-xs text-white/40 mb-1.5">Month A (Base)</label>
          <select
            value={monthA}
            onChange={(e) => { setMonthA(e.target.value); setCompared(false); }}
            className="w-full bg-white/[0.06] text-white border border-white/[0.12] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          >
            {monthLabels.map((m) => (
              <option key={m} value={m} className="bg-gray-900 text-white">{m}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center justify-center text-white/30 text-lg font-bold pb-1">
          vs
        </div>
        <div className="flex-1">
          <label className="block text-xs text-white/40 mb-1.5">Month B (Compare)</label>
          <select
            value={monthB}
            onChange={(e) => { setMonthB(e.target.value); setCompared(false); }}
            className="w-full bg-white/[0.06] text-white border border-white/[0.12] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          >
            {monthLabels.map((m) => (
              <option key={m} value={m} className="bg-gray-900 text-white">{m}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleCompare}
          disabled={monthA === monthB}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
        >
          Compare
        </button>
      </div>

      {monthA === monthB && (
        <p className="text-xs text-amber-400/60 mb-4">Please select two different months to compare.</p>
      )}

      {compared && comparison && (
        <div className="space-y-6">
          {/* Data health toggle */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.08]">
            <button
              onClick={() => setHealthFilter(!healthFilter)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                healthFilter ? "bg-green-500" : "bg-white/20"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  healthFilter ? "translate-x-5" : ""
                }`}
              />
            </button>
            <div>
              <p className="text-sm text-white/80 font-medium">Data Health Filter</p>
              <p className="text-xs text-white/40">
                {healthFilter
                  ? `Showing only entities present in BOTH months (${comparison.sharedBrands.length} brands, ${comparison.sharedCustomers.length} customers)`
                  : `Showing ALL entities including new/lost (${comparison.sharedBrands.length + comparison.newBrands.length + comparison.lostBrands.length} brands, ${comparison.sharedCustomers.length + comparison.newCustomers.length + comparison.lostCustomers.length} customers)`}
              </p>
            </div>
          </div>

          {/* Overall Delta KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Services", valA: snapA.totals.services, valB: snapB.totals.services, delta: comparison.totalsDelta.services, pct: comparison.totalsDelta.servicesPct },
              { label: "Material Cost", valA: snapA.totals.revenue, valB: snapB.totals.revenue, delta: comparison.totalsDelta.revenue, pct: comparison.totalsDelta.revenuePct, isCurrency: true },
              { label: "Visits", valA: snapA.totals.visits, valB: snapB.totals.visits, delta: comparison.totalsDelta.visits, pct: comparison.totalsDelta.visitsPct },
              { label: "Product Used (g)", valA: snapA.totals.grams, valB: snapB.totals.grams, delta: comparison.totalsDelta.grams, pct: comparison.totalsDelta.gramsPct },
            ].map((kpi) => (
              <div key={kpi.label} className="bg-white/[0.05] rounded-xl p-4">
                <p className="text-xs text-white/40 mb-2">{kpi.label}</p>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-white/50">{monthA}</span>
                  <span className="text-sm text-white/70">
                    {kpi.isCurrency ? fmtDollar(kpi.valA) : fmtFull(kpi.valA)}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/50">{monthB}</span>
                  <span className="text-sm text-white font-semibold">
                    {kpi.isCurrency ? fmtDollar(kpi.valB) : fmtFull(kpi.valB)}
                  </span>
                </div>
                <div className="border-t border-white/[0.08] pt-2 flex items-center justify-between">
                  <span className="text-xs text-white/30">Change</span>
                  <ChangeBadge value={kpi.pct} suffix="%" />
                </div>
              </div>
            ))}
          </div>

          {/* New Players */}
          {(comparison.newBrands.length > 0 || comparison.newCustomers.length > 0 || comparison.lostBrands.length > 0 || comparison.lostCustomers.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {comparison.newBrands.length > 0 && (
                <div className="bg-green-500/[0.08] border border-green-500/20 rounded-xl p-4">
                  <p className="text-sm font-semibold text-green-400 mb-2">
                    New Brands in {monthB} ({comparison.newBrands.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {comparison.newBrands.map((b) => (
                      <span key={b} className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded-lg text-xs text-green-300">{b}</span>
                    ))}
                  </div>
                </div>
              )}
              {comparison.lostBrands.length > 0 && (
                <div className="bg-red-500/[0.08] border border-red-500/20 rounded-xl p-4">
                  <p className="text-sm font-semibold text-red-400 mb-2">
                    Lost Brands from {monthA} ({comparison.lostBrands.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {comparison.lostBrands.map((b) => (
                      <span key={b} className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-300">{b}</span>
                    ))}
                  </div>
                </div>
              )}
              {comparison.newCustomers.length > 0 && (
                <div className="bg-green-500/[0.08] border border-green-500/20 rounded-xl p-4">
                  <p className="text-sm font-semibold text-green-400 mb-2">
                    New Customers in {monthB} ({comparison.newCustomers.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {comparison.newCustomers.slice(0, 30).map((c) => (
                      <span key={c} className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded-lg text-xs text-green-300 font-mono">{c}</span>
                    ))}
                    {comparison.newCustomers.length > 30 && (
                      <span className="px-2 py-0.5 text-xs text-green-300/50">+{comparison.newCustomers.length - 30} more</span>
                    )}
                  </div>
                </div>
              )}
              {comparison.lostCustomers.length > 0 && (
                <div className="bg-red-500/[0.08] border border-red-500/20 rounded-xl p-4">
                  <p className="text-sm font-semibold text-red-400 mb-2">
                    Lost Customers from {monthA} ({comparison.lostCustomers.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {comparison.lostCustomers.slice(0, 30).map((c) => (
                      <span key={c} className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-300 font-mono">{c}</span>
                    ))}
                    {comparison.lostCustomers.length > 30 && (
                      <span className="px-2 py-0.5 text-xs text-red-300/50">+{comparison.lostCustomers.length - 30} more</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Service Types Comparison */}
          <div>
            <h4 className="text-sm font-semibold text-white/70 mb-3">Service Types</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2.5 px-3 text-white/50 font-medium">Service</th>
                    <th className="text-right py-2.5 px-3 text-white/50 font-medium">Services ({monthA})</th>
                    <th className="text-right py-2.5 px-3 text-white/50 font-medium">Services ({monthB})</th>
                    <th className="text-right py-2.5 px-3 text-white/50 font-medium">Change</th>
                    <th className="text-right py-2.5 px-3 text-white/50 font-medium">Cost ({monthA})</th>
                    <th className="text-right py-2.5 px-3 text-white/50 font-medium">Cost ({monthB})</th>
                    <th className="text-right py-2.5 px-3 text-white/50 font-medium">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.serviceComparison.map((s) => (
                    <tr key={s.type} className="border-b border-white/[0.05] hover:bg-white/[0.03]">
                      <td className="py-2 px-3 text-white font-medium">{s.type}</td>
                      <td className="py-2 px-3 text-right text-white/60">{fmtFull(s.servicesA)}</td>
                      <td className="py-2 px-3 text-right text-white/80">{fmtFull(s.servicesB)}</td>
                      <td className="py-2 px-3 text-right"><ChangeBadge value={s.servicesPct} suffix="%" /></td>
                      <td className="py-2 px-3 text-right text-white/60">{fmtDollar(s.revenueA)}</td>
                      <td className="py-2 px-3 text-right text-white/80">{fmtDollar(s.revenueB)}</td>
                      <td className="py-2 px-3 text-right"><ChangeBadge value={s.revenuePct} suffix="%" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Brand Comparison */}
          <div>
            <h4 className="text-sm font-semibold text-white/70 mb-3">
              Brand Comparison
              <span className="text-white/30 font-normal ml-2">
                ({comparison.brandComparison.length} brands)
              </span>
            </h4>
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-900/95 backdrop-blur-sm z-10">
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2.5 px-3 text-white/50 font-medium">Brand</th>
                    <th className="text-right py-2.5 px-3 text-white/50 font-medium">Services A</th>
                    <th className="text-right py-2.5 px-3 text-white/50 font-medium">Services B</th>
                    <th className="text-right py-2.5 px-3 text-white/50 font-medium">Svc %</th>
                    <th className="text-right py-2.5 px-3 text-white/50 font-medium">Cost A</th>
                    <th className="text-right py-2.5 px-3 text-white/50 font-medium">Cost B</th>
                    <th className="text-right py-2.5 px-3 text-white/50 font-medium">Cost %</th>
                    <th className="text-right py-2.5 px-3 text-white/50 font-medium">Grams A</th>
                    <th className="text-right py-2.5 px-3 text-white/50 font-medium">Grams B</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.brandComparison.slice(0, 40).map((b) => (
                    <tr
                      key={b.brand}
                      className={`border-b border-white/[0.05] hover:bg-white/[0.03] ${
                        b.isNew ? "bg-green-500/[0.04]" : b.isLost ? "bg-red-500/[0.04]" : ""
                      }`}
                    >
                      <td className="py-2 px-3 text-white font-medium whitespace-nowrap">
                        {b.brand}
                        {b.isNew && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400">NEW</span>}
                        {b.isLost && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400">LOST</span>}
                      </td>
                      <td className="py-2 px-3 text-right text-white/60">{fmtFull(b.servicesA)}</td>
                      <td className="py-2 px-3 text-right text-white/80">{fmtFull(b.servicesB)}</td>
                      <td className="py-2 px-3 text-right"><ChangeBadge value={b.servicesPct} suffix="%" /></td>
                      <td className="py-2 px-3 text-right text-white/60">{fmtDollar(b.revenueA)}</td>
                      <td className="py-2 px-3 text-right text-white/80">{fmtDollar(b.revenueB)}</td>
                      <td className="py-2 px-3 text-right"><ChangeBadge value={b.revenuePct} suffix="%" /></td>
                      <td className="py-2 px-3 text-right text-white/60">{fmtFull(b.gramsA)}</td>
                      <td className="py-2 px-3 text-right text-white/80">{fmtFull(b.gramsB)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Customer Comparison */}
          <div>
            <h4 className="text-sm font-semibold text-white/70 mb-3">
              Customer Comparison
              <span className="text-white/30 font-normal ml-2">
                ({comparison.customerComparison.length} customers)
              </span>
            </h4>
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-900/95 backdrop-blur-sm z-10">
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2.5 px-3 text-white/50 font-medium">User ID</th>
                    <th className="text-right py-2.5 px-3 text-white/50 font-medium">Services A</th>
                    <th className="text-right py-2.5 px-3 text-white/50 font-medium">Services B</th>
                    <th className="text-right py-2.5 px-3 text-white/50 font-medium">Delta</th>
                    <th className="text-right py-2.5 px-3 text-white/50 font-medium">Cost A</th>
                    <th className="text-right py-2.5 px-3 text-white/50 font-medium">Cost B</th>
                    <th className="text-right py-2.5 px-3 text-white/50 font-medium">Delta</th>
                    <th className="text-right py-2.5 px-3 text-white/50 font-medium">Grams A</th>
                    <th className="text-right py-2.5 px-3 text-white/50 font-medium">Grams B</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.customerComparison.slice(0, 50).map((c) => (
                    <tr
                      key={c.userId}
                      className={`border-b border-white/[0.05] hover:bg-white/[0.03] ${
                        c.isNew ? "bg-green-500/[0.04]" : c.isLost ? "bg-red-500/[0.04]" : ""
                      }`}
                    >
                      <td className="py-2 px-3 text-amber-400 font-mono font-medium whitespace-nowrap">
                        {c.userId}
                        {c.isNew && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400">NEW</span>}
                        {c.isLost && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400">LOST</span>}
                      </td>
                      <td className="py-2 px-3 text-right text-white/60">{fmtFull(c.servicesA)}</td>
                      <td className="py-2 px-3 text-right text-white/80">{fmtFull(c.servicesB)}</td>
                      <td className="py-2 px-3 text-right">
                        <ChangeBadge value={c.servicesDelta} />
                      </td>
                      <td className="py-2 px-3 text-right text-white/60">{fmtDollar(c.revenueA)}</td>
                      <td className="py-2 px-3 text-right text-white/80">{fmtDollar(c.revenueB)}</td>
                      <td className="py-2 px-3 text-right">
                        <ChangeBadge value={c.revenueDelta} />
                      </td>
                      <td className="py-2 px-3 text-right text-white/60">{fmtFull(c.gramsA)}</td>
                      <td className="py-2 px-3 text-right text-white/80">{fmtFull(c.gramsB)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  );
}

// ── Access Gate ──────────────────────────────────────────────────────
function AccessGate({ onUnlock }: { onUnlock: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (code === ACCESS_CODE) {
      sessionStorage.setItem(SESSION_KEY, "1");
      onUnlock();
    } else {
      setError("Incorrect code. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white/[0.07] backdrop-blur-xl border border-white/[0.12] rounded-3xl p-8 sm:p-10 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-400/30 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-amber-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Market Intelligence
          </h2>
          <p className="text-sm text-white/50 mb-8">
            Enter access code to view the dashboard
          </p>
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={code}
            onChange={(e) => {
              const digits = e.currentTarget.value.replace(/\D/g, "");
              setCode(digits);
              if (error) setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
            className="w-full text-center tracking-[0.5em] text-xl sm:text-2xl font-semibold bg-white/[0.06] text-white placeholder:text-white/25 border border-white/[0.15] rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/30 transition-all"
            placeholder="* * * * * *"
            autoFocus
          />
          {error && (
            <p className="text-xs text-red-400 mt-3">{error}</p>
          )}
          <button
            onClick={handleSubmit}
            className="w-full mt-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Unlock Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Raw row type ────────────────────────────────────────────────────
interface RawRow {
  mk: string; si: number; uid: string;
  co: string; ci: string; st: string; emp: number; br: string;
  vis: number; svc: number; cost: number; gr: number;
  cs: number; cc: number; cg: number;
  hs: number; hc: number; hg: number;
  ts: number; tc: number; tg: number;
  ss: number; sc: number; sg: number;
  os: number; oc: number; og: number;
  rcp: number; hp: number; whp: number;
}

interface FilterOptions {
  months: string[];
  countries: string[];
  cities: string[];
  brands: string[];
  serviceTypes: string[];
}

// ── Aggregation helpers (client-side) ───────────────────────────────
function aggregateFromRows(rows: RawRow[], allMonthLabels: string[]) {
  // Monthly trends
  const mm: Record<string, any> = {};
  for (const r of rows) {
    if (!mm[r.mk]) {
      mm[r.mk] = {
        label: r.mk, si: r.si,
        totalVisits: 0, totalServices: 0, totalRevenue: 0, totalGrams: 0,
        brands: new Set(), rowCount: 0,
        colorServices: 0, colorRevenue: 0, highlightsServices: 0, highlightsRevenue: 0,
        tonerServices: 0, tonerRevenue: 0, straighteningServices: 0, straighteningRevenue: 0,
        othersServices: 0, othersRevenue: 0,
      };
    }
    const m = mm[r.mk];
    m.totalVisits += r.vis; m.totalServices += r.svc;
    m.totalRevenue += r.cost; m.totalGrams += r.gr;
    m.brands.add(r.br); m.rowCount++;
    m.colorServices += r.cs; m.colorRevenue += r.cc;
    m.highlightsServices += r.hs; m.highlightsRevenue += r.hc;
    m.tonerServices += r.ts; m.tonerRevenue += r.tc;
    m.straighteningServices += r.ss; m.straighteningRevenue += r.sc;
    m.othersServices += r.os; m.othersRevenue += r.oc;
  }
  const monthlyTrends: MonthlyTrend[] = Object.values(mm)
    .sort((a: any, b: any) => a.si - b.si)
    .map((m: any) => ({
      label: m.label, year: 0, monthNumber: 0,
      totalVisits: m.totalVisits, totalServices: Math.round(m.totalServices),
      totalRevenue: Math.round(m.totalRevenue * 100) / 100,
      totalGrams: Math.round(m.totalGrams * 100) / 100,
      activeBrands: m.brands.size, salonBrandPairs: m.rowCount,
      colorServices: m.colorServices, colorRevenue: Math.round(m.colorRevenue * 100) / 100,
      highlightsServices: m.highlightsServices, highlightsRevenue: Math.round(m.highlightsRevenue * 100) / 100,
      tonerServices: m.tonerServices, tonerRevenue: Math.round(m.tonerRevenue * 100) / 100,
      straighteningServices: m.straighteningServices, straighteningRevenue: Math.round(m.straighteningRevenue * 100) / 100,
      othersServices: m.othersServices, othersRevenue: Math.round(m.othersRevenue * 100) / 100,
    }));

  // Brands (with grams breakdown)
  const bm: Record<string, any> = {};
  for (const r of rows) {
    if (!bm[r.br]) bm[r.br] = {
      brand: r.br, totalServices: 0, totalRevenue: 0, totalVisits: 0, totalGrams: 0,
      colorGrams: 0, highlightsGrams: 0, tonerGrams: 0, straighteningGrams: 0, othersGrams: 0,
      months: new Set(), rowCount: 0,
    };
    const b = bm[r.br];
    b.totalServices += r.svc; b.totalRevenue += r.cost;
    b.totalVisits += r.vis; b.totalGrams += r.gr;
    b.colorGrams += r.cg; b.highlightsGrams += r.hg;
    b.tonerGrams += r.tg; b.straighteningGrams += r.sg; b.othersGrams += r.og;
    b.months.add(r.mk); b.rowCount++;
  }
  const brandPerformance: BrandPerf[] = Object.values(bm)
    .map((b: any) => ({
      brand: b.brand, totalServices: Math.round(b.totalServices),
      totalRevenue: Math.round(b.totalRevenue * 100) / 100,
      totalVisits: b.totalVisits, totalGrams: Math.round(b.totalGrams * 100) / 100,
      monthsActive: b.months.size, salonBrandPairs: b.rowCount,
    }))
    .sort((a, b) => b.totalServices - a.totalServices);

  // Brand grams analysis (for market share & grams charts)
  const totalGramsAll = rows.reduce((s, r) => s + r.gr, 0);
  const brandGramsAnalysis = Object.values(bm)
    .map((b: any) => ({
      brand: b.brand,
      totalGrams: Math.round(b.totalGrams * 100) / 100,
      colorGrams: Math.round(b.colorGrams * 100) / 100,
      highlightsGrams: Math.round(b.highlightsGrams * 100) / 100,
      tonerGrams: Math.round(b.tonerGrams * 100) / 100,
      straighteningGrams: Math.round(b.straighteningGrams * 100) / 100,
      othersGrams: Math.round(b.othersGrams * 100) / 100,
      marketSharePct: totalGramsAll > 0 ? Math.round((b.totalGrams / totalGramsAll) * 10000) / 100 : 0,
      totalServices: Math.round(b.totalServices),
      totalRevenue: Math.round(b.totalRevenue * 100) / 100,
      avgGramsPerService: b.totalServices > 0 ? Math.round((b.totalGrams / b.totalServices) * 100) / 100 : 0,
      costPerGram: b.totalGrams > 0 ? Math.round((b.totalRevenue / b.totalGrams) * 100) / 100 : 0,
    }))
    .sort((a, b) => b.totalGrams - a.totalGrams);

  // Service breakdown (with grams)
  const serviceBreakdown: ServiceBreak[] = [
    { type: "Color", totalServices: 0, totalRevenue: 0, totalGrams: 0 },
    { type: "Highlights", totalServices: 0, totalRevenue: 0, totalGrams: 0 },
    { type: "Toner", totalServices: 0, totalRevenue: 0, totalGrams: 0 },
    { type: "Straightening", totalServices: 0, totalRevenue: 0, totalGrams: 0 },
    { type: "Others", totalServices: 0, totalRevenue: 0, totalGrams: 0 },
  ];
  for (const r of rows) {
    serviceBreakdown[0].totalServices += r.cs; serviceBreakdown[0].totalRevenue += r.cc; serviceBreakdown[0].totalGrams += r.cg;
    serviceBreakdown[1].totalServices += r.hs; serviceBreakdown[1].totalRevenue += r.hc; serviceBreakdown[1].totalGrams += r.hg;
    serviceBreakdown[2].totalServices += r.ts; serviceBreakdown[2].totalRevenue += r.tc; serviceBreakdown[2].totalGrams += r.tg;
    serviceBreakdown[3].totalServices += r.ss; serviceBreakdown[3].totalRevenue += r.sc; serviceBreakdown[3].totalGrams += r.sg;
    serviceBreakdown[4].totalServices += r.os; serviceBreakdown[4].totalRevenue += r.oc; serviceBreakdown[4].totalGrams += r.og;
  }
  serviceBreakdown.forEach(s => {
    s.totalServices = Math.round(s.totalServices);
    s.totalRevenue = Math.round(s.totalRevenue * 100) / 100;
    s.totalGrams = Math.round(s.totalGrams * 100) / 100;
  });

  // Service grams analysis
  const serviceGramsAnalysis = serviceBreakdown.map((s) => ({
    type: s.type,
    totalGrams: s.totalGrams,
    totalServices: s.totalServices,
    totalCost: s.totalRevenue,
    avgGramsPerService: s.totalServices > 0 ? Math.round((s.totalGrams / s.totalServices) * 100) / 100 : 0,
    costPerGram: s.totalGrams > 0 ? Math.round((s.totalRevenue / s.totalGrams) * 100) / 100 : 0,
    gramsSharePct: totalGramsAll > 0 ? Math.round((s.totalGrams / totalGramsAll) * 10000) / 100 : 0,
  }));

  // Brand dominance per service type (services count)
  const svcTypes = [
    { key: "Color" as const, svcField: "cs" as const, costField: "cc" as const, grField: "cg" as const },
    { key: "Highlights" as const, svcField: "hs" as const, costField: "hc" as const, grField: "hg" as const },
    { key: "Toner" as const, svcField: "ts" as const, costField: "tc" as const, grField: "tg" as const },
    { key: "Straightening" as const, svcField: "ss" as const, costField: "sc" as const, grField: "sg" as const },
    { key: "Others" as const, svcField: "os" as const, costField: "oc" as const, grField: "og" as const },
  ];
  const brandDominance: Record<string, { brand: string; services: number; cost: number; grams: number; pct: number }[]> = {};
  for (const st of svcTypes) {
    const bmap: Record<string, { brand: string; services: number; cost: number; grams: number }> = {};
    let totalSvc = 0;
    for (const r of rows) {
      const svc = r[st.svcField];
      if (svc <= 0) continue;
      if (!bmap[r.br]) bmap[r.br] = { brand: r.br, services: 0, cost: 0, grams: 0 };
      bmap[r.br].services += svc;
      bmap[r.br].cost += r[st.costField];
      bmap[r.br].grams += r[st.grField];
      totalSvc += svc;
    }
    brandDominance[st.key] = Object.values(bmap)
      .map((b) => ({
        brand: b.brand,
        services: Math.round(b.services),
        cost: Math.round(b.cost * 100) / 100,
        grams: Math.round(b.grams * 100) / 100,
        pct: totalSvc > 0 ? Math.round((b.services / totalSvc) * 10000) / 100 : 0,
      }))
      .sort((a, b) => b.services - a.services);
  }

  // Geo
  const gm: Record<string, any> = {};
  for (const r of rows) {
    if (!gm[r.co]) gm[r.co] = { country: r.co, totalServices: 0, totalRevenue: 0, totalVisits: 0, rowCount: 0 };
    gm[r.co].totalServices += r.svc; gm[r.co].totalRevenue += r.cost;
    gm[r.co].totalVisits += r.vis; gm[r.co].rowCount++;
  }
  const geographicDistribution: GeoEntry[] = Object.values(gm)
    .map((g: any) => ({
      country: g.country, totalServices: Math.round(g.totalServices),
      totalRevenue: Math.round(g.totalRevenue * 100) / 100,
      totalVisits: g.totalVisits, salonBrandPairs: g.rowCount, topCities: [],
    }))
    .sort((a, b) => b.totalServices - a.totalServices);

  // Pricing
  const pm: Record<string, { label: string; si: number; rcp: number[]; hp: number[]; whp: number[] }> = {};
  for (const r of rows) {
    if (!pm[r.mk]) pm[r.mk] = { label: r.mk, si: r.si, rcp: [], hp: [], whp: [] };
    if (r.rcp > 0) pm[r.mk].rcp.push(r.rcp);
    if (r.hp > 0) pm[r.mk].hp.push(r.hp);
    if (r.whp > 0) pm[r.mk].whp.push(r.whp);
  }
  const avg = (arr: number[]) => arr.length > 0 ? Math.round((arr.reduce((s, v) => s + v, 0) / arr.length) * 100) / 100 : null;
  const pricingTrends: PricingTrend[] = Object.values(pm)
    .sort((a, b) => a.si - b.si)
    .map((p) => ({
      label: p.label, avgRootColorPrice: avg(p.rcp), avgHighlightsPrice: avg(p.hp), avgHaircutPrice: avg(p.whp),
    }));

  // Summary
  const allBrands = new Set(rows.map(r => r.br));
  const allCustomers = new Set(rows.filter(r => r.uid).map(r => r.uid));
  const allMonths = new Set(rows.map(r => r.mk));
  const summary = {
    totalRows: rows.length, totalMonths: allMonths.size,
    totalBrands: allBrands.size, totalCustomers: allCustomers.size,
    totalVisits: rows.reduce((s, r) => s + r.vis, 0),
    totalServices: Math.round(rows.reduce((s, r) => s + r.svc, 0)),
    totalRevenue: Math.round(rows.reduce((s, r) => s + r.cost, 0) * 100) / 100,
    totalGrams: Math.round(rows.reduce((s, r) => s + r.gr, 0) * 100) / 100,
    dateRange: {
      from: monthlyTrends.length > 0 ? monthlyTrends[0].label : "",
      to: monthlyTrends.length > 0 ? monthlyTrends[monthlyTrends.length - 1].label : "",
    },
  };

  // Salon size benchmarks
  const sizeRanges = [
    { label: "Solo (0-1)", min: 0, max: 1 },
    { label: "Small (2-5)", min: 2, max: 5 },
    { label: "Medium (6-10)", min: 6, max: 10 },
    { label: "Large (11-20)", min: 11, max: 20 },
    { label: "Enterprise (21+)", min: 21, max: Infinity },
    { label: "Unknown", min: -1, max: -1 },
  ];
  const salonSizeBenchmarks: SalonSize[] = sizeRanges.map((range) => {
    const rr = rows.filter((r) => {
      if (range.label === "Unknown") return !r.emp || r.emp === 0;
      return r.emp >= range.min && r.emp <= range.max;
    });
    const cnt = rr.length;
    return {
      label: range.label, count: cnt,
      avgServices: cnt > 0 ? Math.round((rr.reduce((s, r) => s + r.svc, 0) / cnt) * 100) / 100 : 0,
      avgRevenue: cnt > 0 ? Math.round((rr.reduce((s, r) => s + r.cost, 0) / cnt) * 100) / 100 : 0,
      avgVisits: cnt > 0 ? Math.round((rr.reduce((s, r) => s + r.vis, 0) / cnt) * 100) / 100 : 0,
      totalServices: Math.round(rr.reduce((s, r) => s + r.svc, 0)),
      totalRevenue: Math.round(rr.reduce((s, r) => s + r.cost, 0) * 100) / 100,
    };
  });

  return { summary, monthlyTrends, brandPerformance, brandGramsAnalysis, serviceBreakdown, serviceGramsAnalysis, brandDominance, geographicDistribution, pricingTrends, salonSizeBenchmarks };
}

// ── Filter Bar ──────────────────────────────────────────────────────
function FilterBar({
  options,
  monthFrom, monthTo, countries, cities,
  onMonthFrom, onMonthTo, onCountries, onCities, onReset,
  activeCount,
  availableCities,
}: {
  options: FilterOptions;
  monthFrom: string; monthTo: string;
  countries: string[]; cities: string[];
  onMonthFrom: (v: string) => void; onMonthTo: (v: string) => void;
  onCountries: (v: string[]) => void; onCities: (v: string[]) => void;
  onReset: () => void;
  activeCount: number;
  availableCities: string[];
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white/[0.05] backdrop-blur-xl border border-white/[0.1] rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white transition-colors"
        >
          <svg className={`w-4 h-4 transition-transform ${expanded ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          Filters
          {activeCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium">{activeCount} active</span>
          )}
        </button>
        {activeCount > 0 && (
          <button onClick={onReset} className="text-xs text-white/40 hover:text-white/70 transition-colors">
            Reset all
          </button>
        )}
      </div>

      {expanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
          {/* Date From */}
          <div>
            <label className="block text-xs text-white/40 mb-1.5">From</label>
            <select
              value={monthFrom}
              onChange={(e) => onMonthFrom(e.target.value)}
              className="w-full bg-white/[0.06] text-white border border-white/[0.12] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            >
              {options.months.map((m) => (
                <option key={m} value={m} className="bg-gray-900 text-white">{m}</option>
              ))}
            </select>
          </div>
          {/* Date To */}
          <div>
            <label className="block text-xs text-white/40 mb-1.5">To</label>
            <select
              value={monthTo}
              onChange={(e) => onMonthTo(e.target.value)}
              className="w-full bg-white/[0.06] text-white border border-white/[0.12] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            >
              {options.months.map((m) => (
                <option key={m} value={m} className="bg-gray-900 text-white">{m}</option>
              ))}
            </select>
          </div>
          {/* Country */}
          <div>
            <label className="block text-xs text-white/40 mb-1.5">Country</label>
            <select
              value={countries.length === 0 ? "__all__" : countries[0]}
              onChange={(e) => onCountries(e.target.value === "__all__" ? [] : [e.target.value])}
              className="w-full bg-white/[0.06] text-white border border-white/[0.12] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            >
              <option value="__all__" className="bg-gray-900 text-white">All Countries</option>
              {options.countries.map((c) => (
                <option key={c} value={c} className="bg-gray-900 text-white">{c}</option>
              ))}
            </select>
          </div>
          {/* City */}
          <div>
            <label className="block text-xs text-white/40 mb-1.5">City</label>
            <select
              value={cities.length === 0 ? "__all__" : cities[0]}
              onChange={(e) => onCities(e.target.value === "__all__" ? [] : [e.target.value])}
              className="w-full bg-white/[0.06] text-white border border-white/[0.12] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            >
              <option value="__all__" className="bg-gray-900 text-white">All Cities</option>
              {availableCities.map((c) => (
                <option key={c} value={c} className="bg-gray-900 text-white">{c}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Brand Dominance by Service Type ─────────────────────────────────
type BrandDomEntry = { brand: string; services: number; cost: number; grams: number; pct: number };

function BrandDominanceSection({ dominance }: { dominance: Record<string, BrandDomEntry[]> }) {
  const serviceTypes = ["Color", "Highlights", "Toner", "Straightening", "Others"];
  const [activeType, setActiveType] = useState(serviceTypes[0]);
  const list = dominance[activeType] || [];
  const top10 = list.slice(0, 10);
  const totalSvc = list.reduce((s, b) => s + b.services, 0);

  return (
    <GlassCard
      title="Brand Dominance by Service Type"
      subtitle="Which brands control each service category — by number of services performed"
    >
      {/* Service type tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {serviceTypes.map((st) => {
          const count = (dominance[st] || []).reduce((s, b) => s + b.services, 0);
          return (
            <button
              key={st}
              onClick={() => setActiveType(st)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeType === st
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  : "bg-white/[0.05] text-white/50 border border-white/[0.08] hover:bg-white/[0.08] hover:text-white/70"
              }`}
            >
              {st}
              <span className="ml-1.5 text-xs opacity-60">{fmtFull(Math.round(count))}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <div>
          <h4 className="text-xs text-white/40 mb-3 font-medium">
            Top 10 Brands — {activeType} Services ({fmtFull(totalSvc)} total)
          </h4>
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={top10} layout="vertical" margin={{ left: 80, right: 30, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} tickFormatter={(v) => fmtFull(v)} />
              <YAxis type="category" dataKey="brand" tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 11 }} width={75} />
              <Tooltip
                contentStyle={{ backgroundColor: "rgba(0,0,0,0.85)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }}
                formatter={(val: number, name: string) => {
                  if (name === "services") return [fmtFull(val), "Services"];
                  return [val, name];
                }}
              />
              <Bar dataKey="services" fill="#f59e0b" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div>
          <h4 className="text-xs text-white/40 mb-3 font-medium">Market Share % — {activeType}</h4>
          <ResponsiveContainer width="100%" height={380}>
            <PieChart>
              <Pie
                data={(() => {
                  const top8 = list.slice(0, 8);
                  const othersVal = list.slice(8).reduce((s, b) => s + b.services, 0);
                  const items = top8.map((b) => ({
                    name: b.brand,
                    value: b.services,
                    pct: b.pct.toFixed(1),
                  }));
                  if (othersVal > 0) {
                    const otherPct = totalSvc > 0 ? ((othersVal / totalSvc) * 100).toFixed(1) : "0";
                    items.push({ name: "Others", value: othersVal, pct: otherPct });
                  }
                  return items;
                })()}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={130}
                label={({ name, pct }) => `${name} ${pct}%`}
              >
                {list.slice(0, 9).map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "rgba(0,0,0,0.85)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }}
                formatter={(val: number) => [fmtFull(val), "Services"]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Full table */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-2.5 px-3 text-white/50 font-medium">#</th>
              <th className="text-left py-2.5 px-3 text-white/50 font-medium">Brand</th>
              <th className="text-right py-2.5 px-3 text-white/50 font-medium">Services</th>
              <th className="text-right py-2.5 px-3 text-white/50 font-medium">Market Share</th>
              <th className="text-right py-2.5 px-3 text-white/50 font-medium">Material Cost</th>
              <th className="text-right py-2.5 px-3 text-white/50 font-medium">Grams Used</th>
              <th className="text-right py-2.5 px-3 text-white/50 font-medium">Avg g/svc</th>
              <th className="text-right py-2.5 px-3 text-white/50 font-medium">$/gram</th>
            </tr>
          </thead>
          <tbody>
            {top10.map((b, i) => (
              <tr key={b.brand} className="border-b border-white/[0.05] hover:bg-white/[0.03] transition-colors">
                <td className="py-2 px-3 text-white/40">{i + 1}</td>
                <td className="py-2 px-3 text-white font-medium whitespace-nowrap">{b.brand}</td>
                <td className="py-2 px-3 text-right text-white/80">{fmtFull(b.services)}</td>
                <td className="py-2 px-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-amber-400 font-medium">{b.pct.toFixed(1)}%</span>
                    <div className="w-16 bg-white/[0.05] rounded-full h-1.5">
                      <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${Math.min(b.pct, 100)}%` }} />
                    </div>
                  </div>
                </td>
                <td className="py-2 px-3 text-right text-green-400">{fmtDollar(b.cost)}</td>
                <td className="py-2 px-3 text-right text-white/60">{fmtFull(Math.round(b.grams))}g</td>
                <td className="py-2 px-3 text-right text-white/60">
                  {b.services > 0 ? (b.grams / b.services).toFixed(1) : "—"}g
                </td>
                <td className="py-2 px-3 text-right text-green-400">
                  {b.grams > 0 ? `$${(b.cost / b.grams).toFixed(2)}` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length > 10 && (
          <p className="text-xs text-white/30 mt-2 text-right">
            + {list.length - 10} more brands with {activeType.toLowerCase()} services
          </p>
        )}
      </div>
    </GlassCard>
  );
}

// ── Main Dashboard ──────────────────────────────────────────────────
function Dashboard() {
  const {
    monthlySnapshots,
    rawRows: allRawRows,
    filterOptions,
  } = data as {
    monthlySnapshots: Record<string, MonthSnapshot>;
    rawRows: RawRow[];
    filterOptions: FilterOptions;
    [key: string]: any;
  };

  // ── Filter state ──
  const [monthFrom, setMonthFrom] = useState(filterOptions.months[0]);
  const [monthTo, setMonthTo] = useState(filterOptions.months[filterOptions.months.length - 1]);
  const [selCountries, setSelCountries] = useState<string[]>([]);
  const [selCities, setSelCities] = useState<string[]>([]);

  const activeFilterCount = useMemo(() => {
    let c = 0;
    if (monthFrom !== filterOptions.months[0] || monthTo !== filterOptions.months[filterOptions.months.length - 1]) c++;
    if (selCountries.length > 0) c++;
    if (selCities.length > 0) c++;
    return c;
  }, [monthFrom, monthTo, selCountries, selCities, filterOptions.months]);

  // Available cities filtered by selected country
  const availableCities = useMemo(() => {
    if (selCountries.length === 0) return filterOptions.cities;
    const citySet = new Set<string>();
    for (const r of allRawRows) {
      if (selCountries.includes(r.co) && r.ci !== "Unknown") citySet.add(r.ci);
    }
    return [...citySet].sort();
  }, [selCountries, allRawRows, filterOptions.cities]);

  const resetFilters = () => {
    setMonthFrom(filterOptions.months[0]);
    setMonthTo(filterOptions.months[filterOptions.months.length - 1]);
    setSelCountries([]);
    setSelCities([]);
  };

  // ── Filtered raw rows ──
  const fromSi = useMemo(() => {
    const idx = filterOptions.months.indexOf(monthFrom);
    return idx >= 0 ? allRawRows.find(r => r.mk === monthFrom)?.si ?? 0 : 0;
  }, [monthFrom, allRawRows, filterOptions.months]);

  const toSi = useMemo(() => {
    const idx = filterOptions.months.indexOf(monthTo);
    return idx >= 0 ? allRawRows.find(r => r.mk === monthTo)?.si ?? 99999 : 99999;
  }, [monthTo, allRawRows, filterOptions.months]);

  const filteredRows = useMemo(() => {
    return allRawRows.filter((r) => {
      if (r.si < fromSi || r.si > toSi) return false;
      if (selCountries.length > 0 && !selCountries.includes(r.co)) return false;
      if (selCities.length > 0 && !selCities.includes(r.ci)) return false;
      return true;
    });
  }, [allRawRows, fromSi, toSi, selCountries, selCities]);

  // ── Re-aggregate ──
  const agg = useMemo(
    () => aggregateFromRows(filteredRows, filterOptions.months),
    [filteredRows, filterOptions.months]
  );

  const { summary, monthlyTrends, brandPerformance, brandGramsAnalysis, serviceBreakdown, serviceGramsAnalysis, brandDominance, geographicDistribution, pricingTrends, salonSizeBenchmarks } = agg;

  // Sorted month labels for comparison selectors
  const sortedMonthLabels = useMemo(() => {
    return Object.values(monthlySnapshots)
      .sort((a, b) => a.sortIdx - b.sortIdx)
      .map((s) => s.label);
  }, [monthlySnapshots]);

  // Customer table: re-aggregate from filtered rows
  const customerOverview = useMemo(() => {
    const cm: Record<string, any> = {};
    for (const r of filteredRows) {
      if (!r.uid) continue;
      if (!cm[r.uid]) {
        cm[r.uid] = {
          userId: r.uid, country: r.co, city: r.ci, salonType: r.st, employees: r.emp,
          totalVisits: 0, totalServices: 0, totalRevenue: 0, totalGrams: 0,
          brands: new Set(), months: new Set(),
          colorServices: 0, highlightsServices: 0, tonerServices: 0, straighteningServices: 0, othersServices: 0,
          firstSi: r.si, lastSi: r.si, firstMonth: r.mk, lastMonth: r.mk,
        };
      }
      const c = cm[r.uid];
      c.totalVisits += r.vis; c.totalServices += r.svc;
      c.totalRevenue += r.cost; c.totalGrams += r.gr;
      c.brands.add(r.br); c.months.add(r.mk);
      c.colorServices += r.cs; c.highlightsServices += r.hs;
      c.tonerServices += r.ts; c.straighteningServices += r.ss; c.othersServices += r.os;
      if (r.si < c.firstSi) { c.firstSi = r.si; c.firstMonth = r.mk; }
      if (r.si > c.lastSi) { c.lastSi = r.si; c.lastMonth = r.mk; }
      if ((c.country === "Unknown") && r.co !== "Unknown") c.country = r.co;
      if ((c.city === "Unknown") && r.ci !== "Unknown") c.city = r.ci;
    }
    return Object.values(cm)
      .map((c: any) => ({
        userId: c.userId, country: c.country, city: c.city, salonType: c.salonType, employees: c.employees,
        totalVisits: c.totalVisits, totalServices: Math.round(c.totalServices),
        totalRevenue: Math.round(c.totalRevenue * 100) / 100, totalGrams: Math.round(c.totalGrams * 100) / 100,
        brandsUsed: c.brands.size, topBrands: [...c.brands].slice(0, 5),
        monthsActive: c.months.size, firstMonth: c.firstMonth, lastMonth: c.lastMonth,
        colorServices: Math.round(c.colorServices), highlightsServices: Math.round(c.highlightsServices),
        tonerServices: Math.round(c.tonerServices), straighteningServices: Math.round(c.straighteningServices),
        othersServices: Math.round(c.othersServices),
      } as CustomerEntry))
      .sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [filteredRows]);

  // Customer table state
  const [custSearch, setCustSearch] = useState("");
  const [custSort, setCustSort] = useState<{ key: keyof CustomerEntry; dir: "asc" | "desc" }>({
    key: "totalRevenue",
    dir: "desc",
  });
  const [custPage, setCustPage] = useState(0);
  const CUST_PAGE_SIZE = 15;

  const filteredCustomers = useMemo(() => {
    let list = [...customerOverview];
    if (custSearch.trim()) {
      const q = custSearch.toLowerCase();
      list = list.filter(
        (c) =>
          c.userId.toLowerCase().includes(q) ||
          c.country.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.topBrands.some((b: string) => b.toLowerCase().includes(q))
      );
    }
    list.sort((a, b) => {
      const aVal = a[custSort.key];
      const bVal = b[custSort.key];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return custSort.dir === "asc" ? aVal - bVal : bVal - aVal;
      }
      return custSort.dir === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
    return list;
  }, [customerOverview, custSearch, custSort]);

  const custTotalPages = Math.ceil(filteredCustomers.length / CUST_PAGE_SIZE);
  const pagedCustomers = filteredCustomers.slice(
    custPage * CUST_PAGE_SIZE,
    (custPage + 1) * CUST_PAGE_SIZE
  );

  const toggleCustSort = (key: keyof CustomerEntry) => {
    setCustSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "desc" }
    );
    setCustPage(0);
  };

  const sortIcon = (key: keyof CustomerEntry) => {
    if (custSort.key !== key) return "";
    return custSort.dir === "asc" ? " \u25B2" : " \u25BC";
  };

  // Chart helpers
  const top10Brands = useMemo(() => brandPerformance.slice(0, 10), [brandPerformance]);
  const activeServices = useMemo(() => serviceBreakdown.filter((s) => s.totalServices > 0), [serviceBreakdown]);
  const activeGeo = useMemo(
    () => geographicDistribution.filter((g) => g.country !== "Unknown" && g.country !== "null").slice(0, 10),
    [geographicDistribution]
  );
  const activeSizes = useMemo(
    () => salonSizeBenchmarks.filter((s) => s.label !== "Unknown" && s.count > 0),
    [salonSizeBenchmarks]
  );
  const activePricing = useMemo(
    () => pricingTrends.filter((p) => p.avgRootColorPrice !== null || p.avgHighlightsPrice !== null || p.avgHaircutPrice !== null),
    [pricingTrends]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <Navigation />

      {/* Header */}
      <div className="pt-24 pb-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Market Intelligence
            </h1>
            <p className="text-white/50 mt-2 text-sm sm:text-base">
              {summary.dateRange.from} &ndash; {summary.dateRange.to}
              {" "}&middot; {summary.totalMonths} months
              {selCountries.length > 0 && <> &middot; {selCountries.join(", ")}</>}
              {selCities.length > 0 && <> &middot; {selCities.join(", ")}</>}
            </p>
            <p className="text-white/30 mt-1 text-xs">
              All costs = professional product procurement costs. Grams = product consumed.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/30">
            <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            {fmtFull(summary.totalRows)} records
            {activeFilterCount > 0 && <span className="text-amber-400/60">(filtered)</span>}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-4">
        <FilterBar
          options={filterOptions}
          monthFrom={monthFrom}
          monthTo={monthTo}
          countries={selCountries}
          cities={selCities}
          onMonthFrom={setMonthFrom}
          onMonthTo={setMonthTo}
          onCountries={setSelCountries}
          onCities={setSelCities}
          onReset={resetFilters}
          activeCount={activeFilterCount}
          availableCities={availableCities}
        />
      </div>

      {/* KPI Cards */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiStat
            label="Total Services"
            value={fmtFull(summary.totalServices)}
            sub={`${fmtFull(summary.totalVisits)} system visits`}
          />
          <KpiStat
            label="Total Material Cost"
            value={fmtDollar(summary.totalRevenue)}
            sub={`Avg ${fmtDollar(summary.totalRevenue / summary.totalMonths)}/mo`}
          />
          <KpiStat
            label="Active Brands"
            value={String(summary.totalBrands)}
            sub={`Across ${summary.totalMonths} months`}
          />
          <KpiStat
            label="Product Used"
            value={`${fmtNumber(summary.totalGrams)}g`}
            sub={`${fmtNumber(summary.totalGrams / 1000)}kg total`}
          />
        </div>
      </div>

      {/* Charts */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mt-8 space-y-6 pb-16">
        {/* ── Month vs Month Comparison ── */}
        <MonthComparison
          snapshots={monthlySnapshots}
          monthLabels={sortedMonthLabels}
        />

        {/* ── Monthly Trends ── */}
        <GlassCard
          title="Monthly Trends"
          subtitle="Services, material costs, and system visits over time"
        >
          <div className="h-[350px] sm:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyTrends}>
                <defs>
                  <linearGradient id="gradServices" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.blue} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={CHART_COLORS.blue} stopOpacity={0.3} />
                  </linearGradient>
                  <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.green} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={CHART_COLORS.green} stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                  tickLine={false}
                  angle={-35}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => fmtNumber(v)}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => fmtCurrency(v)}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  wrapperStyle={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="totalServices"
                  name="Services"
                  fill="url(#gradServices)"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
                <Line
                  yAxisId="right"
                  dataKey="totalRevenue"
                  name="Material Cost"
                  stroke={CHART_COLORS.orange}
                  strokeWidth={2.5}
                  dot={{ fill: CHART_COLORS.orange, r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  yAxisId="left"
                  dataKey="totalVisits"
                  name="Visits"
                  stroke={CHART_COLORS.cyan}
                  strokeWidth={1.5}
                  strokeDasharray="5 3"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* ── Revenue by Service Type (stacked area) ── */}
        <GlassCard
          title="Material Cost by Service Type"
          subtitle="Monthly breakdown of product costs across Color, Highlights, Toner, Straightening, Others"
        >
          <div className="h-[350px] sm:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrends}>
                <defs>
                  {Object.entries(SERVICE_COLORS).map(([type, color]) => (
                    <linearGradient
                      key={type}
                      id={`grad${type}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor={color} stopOpacity={0.6} />
                      <stop offset="100%" stopColor={color} stopOpacity={0.05} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                  tickLine={false}
                  angle={-35}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => fmtCurrency(v)}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  wrapperStyle={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="colorRevenue"
                  name="Color"
                  stackId="1"
                  stroke={SERVICE_COLORS.Color}
                  fill={`url(#gradColor)`}
                />
                <Area
                  type="monotone"
                  dataKey="highlightsRevenue"
                  name="Highlights"
                  stackId="1"
                  stroke={SERVICE_COLORS.Highlights}
                  fill={`url(#gradHighlights)`}
                />
                <Area
                  type="monotone"
                  dataKey="tonerRevenue"
                  name="Toner"
                  stackId="1"
                  stroke={SERVICE_COLORS.Toner}
                  fill={`url(#gradToner)`}
                />
                <Area
                  type="monotone"
                  dataKey="straighteningRevenue"
                  name="Straightening"
                  stackId="1"
                  stroke={SERVICE_COLORS.Straightening}
                  fill={`url(#gradStraightening)`}
                />
                <Area
                  type="monotone"
                  dataKey="othersRevenue"
                  name="Others"
                  stackId="1"
                  stroke={SERVICE_COLORS.Others}
                  fill={`url(#gradOthers)`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* ── Two-column row: Brand Performance + Service Mix ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Brand Performance - wider */}
          <GlassCard
            className="lg:col-span-3"
            title="Top 10 Brands"
            subtitle="By total services performed"
          >
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={top10Brands}
                  layout="vertical"
                  margin={{ left: 10 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.06)"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => fmtNumber(v)}
                  />
                  <YAxis
                    type="category"
                    dataKey="brand"
                    tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={130}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar
                    dataKey="totalServices"
                    name="Services"
                    fill={CHART_COLORS.blue}
                    radius={[0, 6, 6, 0]}
                    barSize={18}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Service Mix Pie */}
          <GlassCard
            className="lg:col-span-2"
            title="Service Mix"
            subtitle="Distribution by service type"
          >
            <div className="h-[400px] flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={activeServices}
                    dataKey="totalServices"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {activeServices.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend below */}
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
                {activeServices.map((s, i) => (
                  <div key={s.type} className="flex items-center gap-1.5 text-xs">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                    <span className="text-white/60">
                      {s.type}{" "}
                      <span className="text-white/40">
                        ({fmtFull(s.totalServices)})
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* ── Geographic Distribution ── */}
        {activeGeo.length > 0 && (
          <GlassCard
            title="Geographic Distribution"
            subtitle="Top regions by salon activity"
          >
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeGeo}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.06)"
                  />
                  <XAxis
                    dataKey="country"
                    tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                    tickLine={false}
                    angle={-35}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => fmtNumber(v)}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend
                    wrapperStyle={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}
                  />
                  <Bar
                    dataKey="totalServices"
                    name="Services"
                    fill={CHART_COLORS.blue}
                    radius={[4, 4, 0, 0]}
                    barSize={24}
                  />
                  <Bar
                    dataKey="salonBrandPairs"
                    name="Salon-Brand Pairs"
                    fill={CHART_COLORS.green}
                    radius={[4, 4, 0, 0]}
                    barSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        )}

        {/* ── Two-column row: Pricing Trends + Salon Size ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pricing Trends */}
          <GlassCard
            title="Declared Client Pricing"
            subtitle="Average declared salon service prices (client-facing, not material costs)"
          >
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activePricing}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.06)"
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                    tickLine={false}
                    angle={-35}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => `$${v}`}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend
                    wrapperStyle={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}
                  />
                  <Line
                    dataKey="avgRootColorPrice"
                    name="Root Color"
                    stroke={CHART_COLORS.blue}
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS.blue, r: 3 }}
                    connectNulls
                  />
                  <Line
                    dataKey="avgHighlightsPrice"
                    name="Highlights"
                    stroke={CHART_COLORS.amber}
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS.amber, r: 3 }}
                    connectNulls
                  />
                  <Line
                    dataKey="avgHaircutPrice"
                    name="Women Haircut"
                    stroke={CHART_COLORS.pink}
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS.pink, r: 3 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Salon Size Benchmarks */}
          <GlassCard
            title="Salon Size Benchmarks"
            subtitle="Average metrics by employee count"
          >
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeSizes}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.06)"
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => fmtCurrency(v)}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend
                    wrapperStyle={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}
                  />
                  <Bar
                    dataKey="avgRevenue"
                    name="Avg Material Cost"
                    fill={CHART_COLORS.green}
                    radius={[4, 4, 0, 0]}
                    barSize={28}
                  />
                  <Bar
                    dataKey="avgServices"
                    name="Avg Services"
                    fill={CHART_COLORS.purple}
                    radius={[4, 4, 0, 0]}
                    barSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* ── Customer Overview Table ── */}
        <GlassCard
          title={`Customer Overview (${filteredCustomers.length} of ${customerOverview.length})`}
          subtitle="Per-customer usage metrics by User ID — no personal information displayed"
        >
          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              value={custSearch}
              onChange={(e) => {
                setCustSearch(e.target.value);
                setCustPage(0);
              }}
              placeholder="Search by User ID, country, city, or brand..."
              className="w-full sm:w-80 bg-white/[0.06] text-white placeholder:text-white/30 border border-white/[0.12] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/30 transition-all"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {([
                    ["userId", "User ID"],
                    ["country", "Country"],
                    ["city", "City"],
                    ["totalServices", "Services"],
                    ["totalRevenue", "Material Cost"],
                    ["totalVisits", "Visits"],
                    ["totalGrams", "Product (g)"],
                    ["brandsUsed", "Brands"],
                    ["monthsActive", "Months"],
                    ["firstMonth", "First"],
                    ["lastMonth", "Last"],
                  ] as [keyof CustomerEntry, string][]).map(([key, label]) => (
                    <th
                      key={key}
                      onClick={() => toggleCustSort(key)}
                      className={`py-3 px-3 text-white/50 font-medium cursor-pointer hover:text-white/80 transition-colors whitespace-nowrap ${
                        key === "userId" || key === "country" || key === "city" || key === "firstMonth" || key === "lastMonth"
                          ? "text-left"
                          : "text-right"
                      }`}
                    >
                      {label}{sortIcon(key)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedCustomers.map((c, i) => (
                  <tr
                    key={c.userId}
                    className="border-b border-white/[0.05] hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="py-2.5 px-3 text-amber-400 font-mono font-medium">{c.userId}</td>
                    <td className="py-2.5 px-3 text-white/70">{c.country !== "Unknown" && c.country !== "null" ? c.country : "—"}</td>
                    <td className="py-2.5 px-3 text-white/70">{c.city !== "Unknown" && c.city !== "null" ? c.city : "—"}</td>
                    <td className="py-2.5 px-3 text-right text-white/80">{fmtFull(c.totalServices)}</td>
                    <td className="py-2.5 px-3 text-right text-green-400">{fmtDollar(c.totalRevenue)}</td>
                    <td className="py-2.5 px-3 text-right text-white/60">{fmtFull(c.totalVisits)}</td>
                    <td className="py-2.5 px-3 text-right text-white/60">{fmtFull(c.totalGrams)}</td>
                    <td className="py-2.5 px-3 text-right text-white/60">{c.brandsUsed}</td>
                    <td className="py-2.5 px-3 text-right text-white/60">{c.monthsActive}</td>
                    <td className="py-2.5 px-3 text-white/50 text-xs">{c.firstMonth}</td>
                    <td className="py-2.5 px-3 text-white/50 text-xs">{c.lastMonth}</td>
                  </tr>
                ))}
                {pagedCustomers.length === 0 && (
                  <tr>
                    <td colSpan={11} className="py-8 text-center text-white/30">
                      No customers match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {custTotalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.08]">
              <p className="text-xs text-white/40">
                Showing {custPage * CUST_PAGE_SIZE + 1}–{Math.min((custPage + 1) * CUST_PAGE_SIZE, filteredCustomers.length)} of {filteredCustomers.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCustPage((p) => Math.max(0, p - 1))}
                  disabled={custPage === 0}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.06] text-white/60 hover:bg-white/[0.1] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                <span className="text-xs text-white/40">
                  {custPage + 1} / {custTotalPages}
                </span>
                <button
                  onClick={() => setCustPage((p) => Math.min(custTotalPages - 1, p + 1))}
                  disabled={custPage >= custTotalPages - 1}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.06] text-white/60 hover:bg-white/[0.1] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </GlassCard>

        {/* ── Brand Performance Table ── */}
        <GlassCard
          title="Brand Leaderboard"
          subtitle="Full brand ranking by services, material costs, and reach"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-3 text-white/50 font-medium">#</th>
                  <th className="text-left py-3 px-3 text-white/50 font-medium">Brand</th>
                  <th className="text-right py-3 px-3 text-white/50 font-medium">Services</th>
                  <th className="text-right py-3 px-3 text-white/50 font-medium">Material Cost</th>
                  <th className="text-right py-3 px-3 text-white/50 font-medium">Visits</th>
                  <th className="text-right py-3 px-3 text-white/50 font-medium">Product (g)</th>
                  <th className="text-right py-3 px-3 text-white/50 font-medium">Months</th>
                </tr>
              </thead>
              <tbody>
                {brandPerformance.slice(0, 20).map((b, i) => (
                  <tr
                    key={b.brand}
                    className="border-b border-white/[0.05] hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="py-2.5 px-3 text-white/40">{i + 1}</td>
                    <td className="py-2.5 px-3 text-white font-medium">{b.brand}</td>
                    <td className="py-2.5 px-3 text-right text-white/80">
                      {fmtFull(b.totalServices)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-green-400">
                      {fmtDollar(b.totalRevenue)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-white/60">
                      {fmtFull(b.totalVisits)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-white/60">
                      {fmtFull(b.totalGrams)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-white/60">
                      {b.monthsActive}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* ── Market Share by Grams (Brands) ── */}
        <GlassCard
          title="Brand Market Share by Grams"
          subtitle="Which brands account for the most material consumption (grams used)"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar chart: Top 15 brands by grams */}
            <div>
              <h4 className="text-xs text-white/40 mb-3 font-medium">Top 15 Brands — Total Grams</h4>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={brandGramsAnalysis.slice(0, 15)} layout="vertical" margin={{ left: 80, right: 20, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}kg`} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
                  <YAxis type="category" dataKey="brand" tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 11 }} width={75} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "rgba(0,0,0,0.85)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }}
                    formatter={(val: number) => [`${fmtFull(Math.round(val))}g`, "Grams"]}
                  />
                  <Bar dataKey="totalGrams" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Pie chart: market share % */}
            <div>
              <h4 className="text-xs text-white/40 mb-3 font-medium">Market Share % (by Grams)</h4>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={(() => {
                      const top8 = brandGramsAnalysis.slice(0, 8);
                      const othersGr = brandGramsAnalysis.slice(8).reduce((s, b) => s + b.totalGrams, 0);
                      const total = brandGramsAnalysis.reduce((s, b) => s + b.totalGrams, 0);
                      const items = top8.map((b) => ({
                        name: b.brand,
                        value: Math.round(b.totalGrams),
                        pct: total > 0 ? ((b.totalGrams / total) * 100).toFixed(1) : "0",
                      }));
                      if (othersGr > 0) items.push({ name: "Others", value: Math.round(othersGr), pct: total > 0 ? ((othersGr / total) * 100).toFixed(1) : "0" });
                      return items;
                    })()}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    outerRadius={140}
                    label={({ name, pct }) => `${name} ${pct}%`}
                  >
                    {brandGramsAnalysis.slice(0, 9).map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "rgba(0,0,0,0.85)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }}
                    formatter={(val: number) => [`${fmtFull(val)}g`, "Grams"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </GlassCard>

        {/* ── Material Consumption by Service Type ── */}
        <GlassCard
          title="Material Consumption by Service Type"
          subtitle="Total grams, average grams per service, and cost per gram for each service category"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Grams by service type bar chart */}
            <div>
              <h4 className="text-xs text-white/40 mb-3 font-medium">Total Grams by Service Type</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={serviceGramsAnalysis.filter(s => s.totalGrams > 0)} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="type" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}kg`} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "rgba(0,0,0,0.85)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }}
                    formatter={(val: number, name: string) => [name === "totalGrams" ? `${fmtFull(Math.round(val))}g` : `$${val.toFixed(2)}`, name === "totalGrams" ? "Grams" : "Cost"]}
                  />
                  <Bar dataKey="totalGrams" fill="#f59e0b" name="totalGrams" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Grams share pie */}
            <div>
              <h4 className="text-xs text-white/40 mb-3 font-medium">Grams Share % by Service Type</h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={serviceGramsAnalysis.filter(s => s.totalGrams > 0).map((s) => ({
                      name: s.type, value: Math.round(s.totalGrams), pct: s.gramsSharePct.toFixed(1),
                    }))}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    label={({ name, pct }) => `${name} ${pct}%`}
                  >
                    {serviceGramsAnalysis.filter(s => s.totalGrams > 0).map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "rgba(0,0,0,0.85)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }}
                    formatter={(val: number) => [`${fmtFull(val)}g`, "Grams"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Detailed KPI cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {serviceGramsAnalysis.map((s) => (
              <div key={s.type} className="bg-white/[0.05] rounded-xl p-4">
                <p className="text-xs text-white/40 mb-1">{s.type}</p>
                <p className="text-lg font-bold text-white">{s.totalGrams > 1000 ? `${(s.totalGrams / 1000).toFixed(1)}kg` : `${fmtFull(Math.round(s.totalGrams))}g`}</p>
                <div className="mt-2 space-y-1 text-xs text-white/50">
                  <div className="flex justify-between">
                    <span>Avg g/service</span>
                    <span className="text-white/70">{s.avgGramsPerService.toFixed(1)}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cost/gram</span>
                    <span className="text-green-400">${s.costPerGram.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Services</span>
                    <span className="text-white/70">{fmtFull(s.totalServices)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total cost</span>
                    <span className="text-green-400">{fmtDollar(s.totalCost)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* ── Brand Dominance by Service Type ── */}
        <BrandDominanceSection dominance={brandDominance} />

        {/* ── Brand Grams Deep Dive ── */}
        <GlassCard
          title="Brand Grams Deep Dive"
          subtitle="Per-brand breakdown: total grams, market share, avg grams/service, cost/gram, and grams by service type"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-2 text-white/50 font-medium">#</th>
                  <th className="text-left py-3 px-2 text-white/50 font-medium">Brand</th>
                  <th className="text-right py-3 px-2 text-white/50 font-medium">Total Grams</th>
                  <th className="text-right py-3 px-2 text-white/50 font-medium">Market %</th>
                  <th className="text-right py-3 px-2 text-white/50 font-medium">Avg g/svc</th>
                  <th className="text-right py-3 px-2 text-white/50 font-medium">$/gram</th>
                  <th className="text-right py-3 px-2 font-medium text-amber-400/70">Color (g)</th>
                  <th className="text-right py-3 px-2 font-medium text-blue-400/70">Highlights (g)</th>
                  <th className="text-right py-3 px-2 font-medium text-purple-400/70">Toner (g)</th>
                  <th className="text-right py-3 px-2 font-medium text-pink-400/70">Straight. (g)</th>
                  <th className="text-right py-3 px-2 font-medium text-gray-400/70">Others (g)</th>
                </tr>
              </thead>
              <tbody>
                {brandGramsAnalysis.slice(0, 30).map((b, i) => (
                  <tr key={b.brand} className="border-b border-white/[0.05] hover:bg-white/[0.03] transition-colors">
                    <td className="py-2 px-2 text-white/40">{i + 1}</td>
                    <td className="py-2 px-2 text-white font-medium whitespace-nowrap">{b.brand}</td>
                    <td className="py-2 px-2 text-right text-amber-400 font-medium">
                      {b.totalGrams > 1000 ? `${(b.totalGrams / 1000).toFixed(1)}kg` : `${fmtFull(Math.round(b.totalGrams))}g`}
                    </td>
                    <td className="py-2 px-2 text-right">
                      <span className="inline-block min-w-[3rem]">
                        <span className="text-white/70">{b.marketSharePct.toFixed(1)}%</span>
                      </span>
                      <div className="w-full bg-white/[0.05] rounded-full h-1.5 mt-1">
                        <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${Math.min(b.marketSharePct, 100)}%` }} />
                      </div>
                    </td>
                    <td className="py-2 px-2 text-right text-white/70">{b.avgGramsPerService.toFixed(1)}g</td>
                    <td className="py-2 px-2 text-right text-green-400">${b.costPerGram.toFixed(2)}</td>
                    <td className="py-2 px-2 text-right text-amber-400/70">{b.colorGrams > 0 ? fmtFull(Math.round(b.colorGrams)) : "—"}</td>
                    <td className="py-2 px-2 text-right text-blue-400/70">{b.highlightsGrams > 0 ? fmtFull(Math.round(b.highlightsGrams)) : "—"}</td>
                    <td className="py-2 px-2 text-right text-purple-400/70">{b.tonerGrams > 0 ? fmtFull(Math.round(b.tonerGrams)) : "—"}</td>
                    <td className="py-2 px-2 text-right text-pink-400/70">{b.straighteningGrams > 0 ? fmtFull(Math.round(b.straighteningGrams)) : "—"}</td>
                    <td className="py-2 px-2 text-right text-gray-400/70">{b.othersGrams > 0 ? fmtFull(Math.round(b.othersGrams)) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Footer */}
        <div className="text-center text-white/20 text-xs pt-4 pb-8">
          Data is anonymized and aggregated. No individual salon is identifiable.
          <br />
          All costs = professional product procurement costs (material expenses to the salon). Grams = product consumed.
          <br />
          Generated from {data._fileCount} monthly reports &middot;{" "}
          {summary.dateRange.from} to {summary.dateRange.to}
        </div>
      </div>
    </div>
  );
}

// ── Exported Page ───────────────────────────────────────────────────
export default function MarketIntelligencePage() {
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === "1"
  );

  if (!unlocked) {
    return <AccessGate onUnlock={() => setUnlocked(true)} />;
  }

  return <Dashboard />;
}
