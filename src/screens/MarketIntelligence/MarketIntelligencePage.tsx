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
              { label: "Services", valA: snapA.totals.services, valB: snapB.totals.services, delta: comparison.totalsDelta.servicesDelta, pct: comparison.totalsDelta.servicesPct },
              { label: "Material Cost", valA: snapA.totals.revenue, valB: snapB.totals.revenue, delta: comparison.totalsDelta.revenueDelta, pct: comparison.totalsDelta.revenuePct, isCurrency: true },
              { label: "Visits", valA: snapA.totals.visits, valB: snapB.totals.visits, delta: comparison.totalsDelta.visitsDelta, pct: comparison.totalsDelta.visitsPct },
              { label: "Product Used (g)", valA: snapA.totals.grams, valB: snapB.totals.grams, delta: comparison.totalsDelta.gramsDelta, pct: comparison.totalsDelta.gramsPct },
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

// ── Main Dashboard ──────────────────────────────────────────────────
function Dashboard() {
  const {
    summary,
    monthlyTrends,
    brandPerformance,
    serviceBreakdown,
    geographicDistribution,
    salonSizeBenchmarks,
    pricingTrends,
    customerOverview,
    monthlySnapshots,
  } = data as {
    summary: {
      totalRows: number;
      totalMonths: number;
      totalBrands: number;
      totalCustomers: number;
      totalVisits: number;
      totalServices: number;
      totalRevenue: number;
      totalGrams: number;
      dateRange: { from: string; to: string };
    };
    monthlyTrends: MonthlyTrend[];
    brandPerformance: BrandPerf[];
    brandMonthly: any[];
    serviceBreakdown: ServiceBreak[];
    geographicDistribution: GeoEntry[];
    salonSizeBenchmarks: SalonSize[];
    pricingTrends: PricingTrend[];
    customerOverview: CustomerEntry[];
    monthlySnapshots: Record<string, MonthSnapshot>;
  };

  // Sorted month labels for comparison selectors
  const sortedMonthLabels = useMemo(() => {
    return Object.values(monthlySnapshots)
      .sort((a, b) => a.sortIdx - b.sortIdx)
      .map((s) => s.label);
  }, [monthlySnapshots]);

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
          c.topBrands.some((b) => b.toLowerCase().includes(q))
      );
    }
    list.sort((a, b) => {
      const aVal = a[custSort.key];
      const bVal = b[custSort.key];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return custSort.dir === "asc" ? aVal - bVal : bVal - aVal;
      }
      const aStr = String(aVal);
      const bStr = String(bVal);
      return custSort.dir === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
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

  // Top 10 brands for the chart
  const top10Brands = useMemo(
    () => brandPerformance.slice(0, 10),
    [brandPerformance]
  );

  // Filter out service types with 0 services for pie chart
  const activeServices = useMemo(
    () => serviceBreakdown.filter((s) => s.totalServices > 0),
    [serviceBreakdown]
  );

  // Filter geo with actual data
  const activeGeo = useMemo(
    () =>
      geographicDistribution
        .filter((g) => g.country !== "Unknown" && g.country !== "null")
        .slice(0, 10),
    [geographicDistribution]
  );

  // Filter out unknown salon sizes for the benchmark chart
  const activeSizes = useMemo(
    () => salonSizeBenchmarks.filter((s) => s.label !== "Unknown" && s.count > 0),
    [salonSizeBenchmarks]
  );

  // Pricing data without nulls
  const activePricing = useMemo(
    () =>
      pricingTrends.filter(
        (p) =>
          p.avgRootColorPrice !== null ||
          p.avgHighlightsPrice !== null ||
          p.avgHaircutPrice !== null
      ),
    [pricingTrends]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <Navigation />

      {/* Header */}
      <div className="pt-24 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Market Intelligence
            </h1>
            <p className="text-white/50 mt-2 text-sm sm:text-base">
              Aggregated insights from {summary.totalMonths} months of salon
              usage data &middot; {summary.dateRange.from} &ndash;{" "}
              {summary.dateRange.to}
            </p>
            <p className="text-white/30 mt-1 text-xs">
              All costs represent professional product procurement costs (material expenses). Grams = product consumed.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/30">
            <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Live dataset &middot; {fmtFull(summary.totalRows)} records
          </div>
        </div>
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
