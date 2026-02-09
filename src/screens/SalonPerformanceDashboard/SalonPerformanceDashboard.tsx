import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
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

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
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
    <div ref={dropdownRef} className="relative w-full max-w-sm">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm hover:border-gray-300 transition-colors"
        disabled={loading}
      >
        <span className={selected ? "text-gray-900" : "text-gray-400"}>
          {loading
            ? "Loading salons..."
            : selected
            ? `${selected.displayName || selected.userId} (${selected.userId})`
            : "Select Salon"}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </button>

      {open && (
        <div className="absolute top-full z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg max-h-80 overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, ID, or city..."
                className="w-full h-9 pl-8 pr-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                autoFocus
              />
            </div>
          </div>
          <div className="overflow-y-auto max-h-60">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-gray-400">
                No salons found
              </div>
            ) : (
              filtered.map((salon) => (
                <button
                  key={salon.userId}
                  className={`w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${
                    salon.userId === selectedId ? "bg-blue-50" : ""
                  }`}
                  onClick={() => {
                    onSelect(salon.userId);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <div className="font-medium text-gray-900">
                    {salon.displayName || salon.userId}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {salon.userId}
                    {salon.city ? ` \u00B7 ${salon.city}` : ""}
                    {salon.state ? `, ${salon.state}` : ""}
                    {` \u00B7 ${formatNumber(salon.totalServices)} services`}
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

// ── KPI Card ────────────────────────────────────────────────────────

function KpiCardSimple({
  label,
  value,
  icon,
  subtitle,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <Card className="bg-white shadow-sm border-gray-100 hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <div className="text-gray-300">{icon}</div>
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

// ── Custom Tooltip ──────────────────────────────────────────────────

function ChartTooltip({ active, payload, label, currency }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg text-sm">
      <p className="font-medium text-gray-900 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-gray-600">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full mr-1.5"
            style={{ backgroundColor: p.color }}
          />
          {p.name}:{" "}
          {p.name.includes("Cost") || p.name.includes("cost")
            ? formatCurrency(p.value, currency || "ILS")
            : formatDecimal(p.value)}
        </p>
      ))}
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

  // KPIs
  let totalServices = 0, totalCost = 0, totalGrams = 0;
  const activeMonthKeys = new Set<number>();
  for (const r of rows) {
    totalServices += r.svc; totalCost += r.cost; totalGrams += r.gr;
    activeMonthKeys.add(sortKey(r.y, r.m));
  }
  const activeMonths = activeMonthKeys.size;

  // Category breakdown
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

  // Brand breakdown
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

  // Time series
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
  // Selected salon + date range
  const [selectedSalonId, setSelectedSalonId] = useState<string | null>(null);
  const [startMonth, setStartMonth] = useState("");
  const [endMonth, setEndMonth] = useState("");

  // Compute report client-side
  const report = useMemo(() => {
    if (!selectedSalonId) return null;
    return aggregateForSalon(selectedSalonId, startMonth, endMonth);
  }, [selectedSalonId, startMonth, endMonth]);

  // Currency for selected salon
  const currency = report?.salon?.currency || "USD";
  const fc = (v: number) => formatCurrency(v, currency);

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <main>
        <div className="min-h-screen bg-[#F7F8FA]">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* ── Page Header ────────────────────────────────────── */}
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                Salon Performance
              </h1>
              <p className="text-sm text-gray-500">
                Material cost analysis per service, per month, and per brand.
                No prices. No revenue. Just operational truth.
              </p>
            </div>

            {/* ── Controls Bar ───────────────────────────────────── */}
            <div className="flex flex-wrap items-end gap-4 mb-8 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex-1 min-w-[240px]">
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
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
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  From Month
                </label>
                <Input
                  type="month"
                  value={startMonth}
                  onChange={(e) => setStartMonth(e.target.value)}
                  className="h-10 rounded-xl text-sm"
                  placeholder="Start"
                />
              </div>

              <div className="min-w-[150px]">
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  To Month
                </label>
                <Input
                  type="month"
                  value={endMonth}
                  onChange={(e) => setEndMonth(e.target.value)}
                  className="h-10 rounded-xl text-sm"
                  placeholder="End"
                />
              </div>
            </div>

            {/* ── Empty State ────────────────────────────────────── */}
            {!selectedSalonId && (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Search className="w-7 h-7 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-1">
                    Select a salon to get started
                  </h3>
                  <p className="text-sm text-gray-400 max-w-sm">
                    Choose a salon from the dropdown above to view material
                    usage and cost analysis.
                  </p>
                </div>
              </div>
            )}

            {/* ── Report Content ──────────────────────────────────── */}
            {report && selectedSalonId && (
              <div className="space-y-6">
                {/* Salon info bar */}
                {report.salon.displayName && (
                  <div className="bg-white rounded-xl px-5 py-3 border border-gray-100 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                      {(report.salon.displayName || "?")[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {report.salon.displayName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {report.salon.userId}
                        {report.salon.city
                          ? ` \u00B7 ${report.salon.city}`
                          : ""}
                        {report.salon.state
                          ? `, ${report.salon.state}`
                          : ""}
                        {` \u00B7 ${report.filteredMonthRange.from} - ${report.filteredMonthRange.to}`}
                      </p>
                    </div>
                  </div>
                )}

                {/* ── KPI Cards ─────────────────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <KpiCardSimple
                    label="Total Services"
                    value={formatNumber(report.kpis.totalServices)}
                    icon={<Activity className="h-5 w-5" />}
                    subtitle="In selected period"
                  />
                  <KpiCardSimple
                    label="Total Material Cost"
                    value={fc(report.kpis.totalMaterialCost)}
                    icon={<DollarSign className="h-5 w-5" />}
                    subtitle="Materials only"
                  />
                  <KpiCardSimple
                    label="Avg Cost / Service"
                    value={fc(report.kpis.avgCostPerService)}
                    icon={<TrendingUp className="h-5 w-5" />}
                    subtitle="Per service category per month"
                  />
                  <KpiCardSimple
                    label="Active Months"
                    value={formatNumber(report.kpis.activeMonths)}
                    icon={<Calendar className="h-5 w-5" />}
                    subtitle="Months with activity"
                  />
                  <KpiCardSimple
                    label="Services / Month"
                    value={formatDecimal(report.kpis.servicesPerMonth)}
                    icon={<Package className="h-5 w-5" />}
                    subtitle="Average pace"
                  />
                </div>

                {/* Microcopy */}
                <p className="text-xs text-gray-400 -mt-2 px-1">
                  Avg cost is calculated by total material cost divided by total
                  services across all brands in the selected period.
                </p>

                {/* ── Service Category Breakdown ───────────────── */}
                {report.categoryBreakdown.length > 0 && (
                  <Card className="bg-white shadow-sm border-gray-100">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold text-gray-900">
                        Service Categories
                      </CardTitle>
                      <CardDescription className="text-xs text-gray-400">
                        Material cost breakdown by service type
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-lg border border-gray-100">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50/60">
                              <TableHead className="font-semibold text-gray-700">
                                Category
                              </TableHead>
                              <TableHead className="font-semibold text-gray-700 text-right">
                                Services
                              </TableHead>
                              <TableHead className="font-semibold text-gray-700 text-right">
                                Total Cost
                              </TableHead>
                              <TableHead className="font-semibold text-gray-700 text-right">
                                Avg Cost / Service
                              </TableHead>
                              <TableHead className="font-semibold text-gray-700 text-right">
                                Total Grams
                              </TableHead>
                              <TableHead className="font-semibold text-gray-700 text-right">
                                Avg g / Service
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {report.categoryBreakdown.map((cat) => (
                              <TableRow key={cat.category}>
                                <TableCell className="font-medium text-gray-900">
                                  {cat.category}
                                </TableCell>
                                <TableCell className="text-right text-gray-700">
                                  {formatNumber(cat.services)}
                                </TableCell>
                                <TableCell className="text-right text-gray-700">
                                  {fc(cat.totalCost)}
                                </TableCell>
                                <TableCell className="text-right font-semibold text-gray-900">
                                  {fc(cat.avgCostPerService)}
                                </TableCell>
                                <TableCell className="text-right text-gray-700">
                                  {formatNumber(cat.totalGrams)}
                                </TableCell>
                                <TableCell className="text-right text-gray-700">
                                  {formatDecimal(cat.avgGramsPerService)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* ── Trends Charts ────────────────────────────── */}
                {report.timeSeries.length > 1 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Avg Cost per Service over time */}
                    <Card className="bg-white shadow-sm border-gray-100">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold text-gray-900">
                          Avg Cost / Service
                        </CardTitle>
                        <CardDescription className="text-xs text-gray-400">
                          Monthly trend
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={280}>
                          <LineChart data={report.timeSeries}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#F3F4F6"
                            />
                            <XAxis
                              dataKey="label"
                              stroke="#9CA3AF"
                              style={{ fontSize: "11px" }}
                              angle={-45}
                              textAnchor="end"
                              height={60}
                            />
                            <YAxis
                              stroke="#9CA3AF"
                              style={{ fontSize: "11px" }}
                            />
                            <Tooltip content={<ChartTooltip currency={currency} />} />
                            <Line
                              type="monotone"
                              dataKey="avgCostPerService"
                              name="Avg cost/svc"
                              stroke="#6366F1"
                              strokeWidth={2.5}
                              dot={{ r: 4, fill: "#6366F1" }}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Total Material Cost over time */}
                    <Card className="bg-white shadow-sm border-gray-100">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold text-gray-900">
                          Total Material Cost
                        </CardTitle>
                        <CardDescription className="text-xs text-gray-400">
                          Monthly trend
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={280}>
                          <BarChart data={report.timeSeries}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#F3F4F6"
                            />
                            <XAxis
                              dataKey="label"
                              stroke="#9CA3AF"
                              style={{ fontSize: "11px" }}
                              angle={-45}
                              textAnchor="end"
                              height={60}
                            />
                            <YAxis
                              stroke="#9CA3AF"
                              style={{ fontSize: "11px" }}
                            />
                            <Tooltip content={<ChartTooltip currency={currency} />} />
                            <Bar
                              dataKey="totalCost"
                              name="Total Cost"
                              fill="#818CF8"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* ── Brand Breakdown ──────────────────────────── */}
                {report.brandBreakdown.length > 0 && (
                  <Card className="bg-white shadow-sm border-gray-100">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold text-gray-900">
                        Brand Performance
                      </CardTitle>
                      <CardDescription className="text-xs text-gray-400">
                        Cost and usage breakdown by color brand
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-lg border border-gray-100">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50/60">
                              <TableHead className="font-semibold text-gray-700">
                                Brand
                              </TableHead>
                              <TableHead className="font-semibold text-gray-700 text-right">
                                Services
                              </TableHead>
                              <TableHead className="font-semibold text-gray-700 text-right">
                                Total Cost
                              </TableHead>
                              <TableHead className="font-semibold text-gray-700 text-right">
                                Avg Cost / Service
                              </TableHead>
                              <TableHead className="font-semibold text-gray-700 text-right">
                                Total Grams
                              </TableHead>
                              <TableHead className="font-semibold text-gray-700 text-right">
                                Visits
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {report.brandBreakdown.map((brand) => (
                              <TableRow key={brand.brand}>
                                <TableCell className="font-medium text-gray-900">
                                  {brand.brand}
                                </TableCell>
                                <TableCell className="text-right text-gray-700">
                                  {formatNumber(brand.services)}
                                </TableCell>
                                <TableCell className="text-right text-gray-700">
                                  {fc(brand.totalCost)}
                                </TableCell>
                                <TableCell className="text-right font-semibold text-gray-900">
                                  {fc(brand.avgCostPerService)}
                                </TableCell>
                                <TableCell className="text-right text-gray-700">
                                  {formatNumber(brand.totalGrams)}
                                </TableCell>
                                <TableCell className="text-right text-gray-700">
                                  {formatNumber(brand.visits)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SalonPerformanceDashboard;
