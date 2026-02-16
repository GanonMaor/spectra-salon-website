import React, { useMemo } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Calendar,
  DollarSign,
  Package,
  TrendingUp,
  Award,
  Scissors,
  Scale,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { GlassPanel, formatCurrency, formatNumber, DarkChartTooltip, DarkLegend, DARK_AXIS, DARK_GRID, DARK_XAXIS_ANGLED, CATEGORY_COLORS } from "./ReportShared";
import {
  DateRange,
  STAFF,
  PRODUCTS,
  SERVICES,
  MONTHLY_COMBINED,
  MONTHLY_SERVICES,
  MONTHLY_PRODUCTS,
  filterMonthly,
  aggregateOptimization,
} from "./AnalyticsMockData";

const fc = (v: number) => formatCurrency(v, "ILS");

/* ── Tiny sparkline SVG ─────────────────────────────────────────── */
const Spark: React.FC<{ data: number[]; color: string; gradientId: string }> = ({ data, color, gradientId }) => {
  if (data.length < 2) return null;
  const w = 80, h = 32, pad = 2;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => ({
    x: pad + (i / (data.length - 1)) * (w - pad * 2),
    y: pad + (1 - (v - min) / range) * (h - pad * 2),
  }));
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area = `${line} L${pts[pts.length - 1].x},${h} L${pts[0].x},${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-20 h-8" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path d={line} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r={2.5} fill={color} />
    </svg>
  );
};

const DashboardReport: React.FC<{ dateRange: DateRange }> = ({ dateRange }) => {
  const f = useMemo(() => {
    const months = filterMonthly(MONTHLY_COMBINED, dateRange);
    const svcMonths = filterMonthly(MONTHLY_SERVICES, dateRange);
    const prodMonths = filterMonthly(MONTHLY_PRODUCTS, dateRange);

    const totalAppointments = months.reduce((s, m) => s + m.appointments, 0);
    const totalRevenue = months.reduce((s, m) => s + m.revenue, 0);
    const totalProductCost = months.reduce((s, m) => s + m.productCost, 0);
    const totalProductUsage = prodMonths.reduce((s, m) => s + m.totalUsage, 0);
    const totalServices = svcMonths.reduce((s, m) => s + m.total, 0);

    const avgRevPerVisit = totalAppointments > 0 ? Math.round(totalRevenue / totalAppointments) : 0;
    const avgCostPerVisit = totalAppointments > 0 ? Math.round(totalProductCost / totalAppointments) : 0;
    const avgMarginPerVisit = totalAppointments > 0 ? Math.round((totalRevenue - totalProductCost) / totalAppointments) : 0;
    const roiPct = totalProductCost > 0 ? Math.round(((totalRevenue - totalProductCost) / totalProductCost) * 100) : 0;

    const opt = aggregateOptimization(dateRange);

    const extraChargePctOfRevenue = totalRevenue > 0 ? +((opt.extraChargeRevenue / totalRevenue) * 100).toFixed(1) : 0;

    // Per-month metrics for sparklines & comparison
    const monthlyPerVisit = months.map((m, i) => {
      const cost = prodMonths[i]?.totalCost || 0;
      const appt = m.appointments || 1;
      return {
        rev: Math.round(m.revenue / appt),
        cost: Math.round(cost / appt),
        margin: Math.round((m.revenue - cost) / appt),
      };
    });
    const cur = monthlyPerVisit[monthlyPerVisit.length - 1] || { rev: 0, cost: 0, margin: 0 };
    const prev = monthlyPerVisit[monthlyPerVisit.length - 2] || cur;
    const pctDelta = (c: number, p: number) => p > 0 ? +((((c - p) / p) * 100).toFixed(1)) : 0;
    const kpiComparison = {
      revDelta: pctDelta(cur.rev, prev.rev),
      costDelta: pctDelta(cur.cost, prev.cost),
      marginDelta: pctDelta(cur.margin, prev.margin),
      sparkRev: monthlyPerVisit.map(m => m.rev),
      sparkCost: monthlyPerVisit.map(m => m.cost),
      sparkMargin: monthlyPerVisit.map(m => m.margin),
    };

    return {
      months, totalAppointments, totalRevenue, totalProductCost, totalProductUsage, totalServices,
      avgRevPerVisit, avgCostPerVisit, avgMarginPerVisit, roiPct, opt,
      extraChargePctOfRevenue, kpiComparison,
    };
  }, [dateRange]);

  const topStaff = [...STAFF].sort((a, b) => b.revenue - a.revenue).slice(0, 3);
  const topProducts = [...PRODUCTS].sort((a, b) => b.usageGrams - a.usageGrams).slice(0, 5);
  const topServices = [...SERVICES].sort((a, b) => b.totalPerformed - a.totalPerformed).slice(0, 5);

  const rangeLabel = f.months.length === 12
    ? "Last 12 months"
    : `${f.months.length} month${f.months.length !== 1 ? "s" : ""}`;

  return (
    <div className="space-y-4 sm:space-y-5">

      {/* ═══════ ZONE A · Primary KPI Dark Strip ═══════════════════════ */}
      <div
        className="rounded-2xl sm:rounded-3xl bg-black/[0.50] backdrop-blur-xl border border-white/[0.08] overflow-hidden"
        style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.04)" }}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Appointments */}
          <div className="flex-1 p-6 sm:p-8">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <Calendar className="w-[18px] h-[18px] text-violet-400" />
              </div>
              <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Appointments</p>
            </div>
            <p className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none">
              {formatNumber(f.totalAppointments)}
            </p>
            <p className="text-[10px] text-gray-500 mt-2">
              {rangeLabel} &middot; {formatNumber(f.totalServices)} services
            </p>
          </div>

          <div className="hidden sm:block w-px bg-white/[0.08] my-5" />
          <div className="sm:hidden h-px bg-white/[0.08] mx-6" />

          {/* Revenue */}
          <div className="flex-1 p-6 sm:p-8">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <DollarSign className="w-[18px] h-[18px] text-emerald-400" />
              </div>
              <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Revenue</p>
            </div>
            <p className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none">
              {fc(f.totalRevenue)}
            </p>
            <p className="text-[10px] text-gray-500 mt-2">
              +14% vs prev &middot; {fc(f.avgRevPerVisit)}/visit
            </p>
          </div>

          <div className="hidden sm:block w-px bg-white/[0.08] my-5" />
          <div className="sm:hidden h-px bg-white/[0.08] mx-6" />

          {/* Cost */}
          <div className="flex-1 p-6 sm:p-8">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Package className="w-[18px] h-[18px] text-amber-400" />
              </div>
              <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Product Cost</p>
            </div>
            <p className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none">
              {fc(f.totalProductCost)}
            </p>
            <p className="text-[10px] text-gray-500 mt-2">
              {PRODUCTS.length} products &middot; {fc(f.avgCostPerVisit)}/visit
            </p>
          </div>
        </div>
      </div>

      {/* ═══════ ZONE A.2 · Per-Visit KPI Strip (unified, darker) ═════ */}
      <div
        className="rounded-2xl sm:rounded-3xl bg-black/[0.62] backdrop-blur-xl border border-white/[0.05] overflow-hidden"
        style={{ boxShadow: "0 6px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.03)" }}
      >
        <div className="flex flex-col sm:flex-row">
          {/* ── Revenue / Visit ── */}
          <div className="relative flex-1 p-4 sm:p-5">
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-amber-400/[0.03] blur-2xl" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/5 flex items-center justify-center ring-1 ring-amber-400/10 flex-shrink-0">
                  <DollarSign className="w-4 h-4 text-amber-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] text-amber-300/50 font-bold uppercase tracking-widest">Revenue / Visit</p>
                  <p className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none mt-0.5">{fc(f.avgRevPerVisit)}</p>
                </div>
              </div>
              <Spark data={f.kpiComparison.sparkRev} color="#FBBF24" gradientId="sparkRev" />
            </div>
            <div className="flex items-center gap-1.5 mt-2.5">
              {f.kpiComparison.revDelta >= 0 ? (
                <ArrowUpRight className="w-3 h-3 text-emerald-400" />
              ) : (
                <ArrowDownRight className="w-3 h-3 text-rose-400" />
              )}
              <span className={`text-[11px] font-bold ${f.kpiComparison.revDelta >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {f.kpiComparison.revDelta >= 0 ? "+" : ""}{f.kpiComparison.revDelta}%
              </span>
              <span className="text-[9px] text-gray-600">vs last month</span>
            </div>
          </div>

          <div className="hidden sm:block w-px bg-white/[0.05] my-4" />
          <div className="sm:hidden h-px bg-white/[0.05] mx-5" />

          {/* ── Material Cost / Visit ── */}
          <div className="relative flex-1 p-4 sm:p-5">
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-yellow-500/[0.03] blur-2xl" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500/20 to-yellow-600/5 flex items-center justify-center ring-1 ring-yellow-400/10 flex-shrink-0">
                  <Package className="w-4 h-4 text-yellow-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] text-yellow-300/50 font-bold uppercase tracking-widest">Material Cost / Visit</p>
                  <p className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none mt-0.5">{fc(f.avgCostPerVisit)}</p>
                </div>
              </div>
              <Spark data={f.kpiComparison.sparkCost} color="#EAB308" gradientId="sparkCost" />
            </div>
            <div className="flex items-center gap-1.5 mt-2.5">
              {f.kpiComparison.costDelta <= 0 ? (
                <ArrowDownRight className="w-3 h-3 text-emerald-400" />
              ) : (
                <ArrowUpRight className="w-3 h-3 text-rose-400" />
              )}
              <span className={`text-[11px] font-bold ${f.kpiComparison.costDelta <= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {f.kpiComparison.costDelta >= 0 ? "+" : ""}{f.kpiComparison.costDelta}%
              </span>
              <span className="text-[9px] text-gray-600">vs last month</span>
            </div>
          </div>

          <div className="hidden sm:block w-px bg-white/[0.05] my-4" />
          <div className="sm:hidden h-px bg-white/[0.05] mx-5" />

          {/* ── Gross Profit / Visit ── */}
          <div className="relative flex-1 p-4 sm:p-5">
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-orange-400/[0.03] blur-2xl" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-600/5 flex items-center justify-center ring-1 ring-orange-400/10 flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-orange-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] text-orange-300/50 font-bold uppercase tracking-widest">Gross Profit / Visit</p>
                  <p className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none mt-0.5">{fc(f.avgMarginPerVisit)}</p>
                </div>
              </div>
              <Spark data={f.kpiComparison.sparkMargin} color="#F59E0B" gradientId="sparkMargin" />
            </div>
            <div className="flex items-center gap-1.5 mt-2.5">
              {f.kpiComparison.marginDelta >= 0 ? (
                <ArrowUpRight className="w-3 h-3 text-emerald-400" />
              ) : (
                <ArrowDownRight className="w-3 h-3 text-rose-400" />
              )}
              <span className={`text-[11px] font-bold ${f.kpiComparison.marginDelta >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {f.kpiComparison.marginDelta >= 0 ? "+" : ""}{f.kpiComparison.marginDelta}%
              </span>
              <span className="text-[9px] text-gray-600">vs last month</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ ZONE A.3 · Spectra Optimization ═════════════════════ */}
      <div
        className="rounded-2xl sm:rounded-3xl bg-black/[0.50] backdrop-blur-xl border border-white/[0.08] overflow-hidden"
        style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.04)" }}
      >
        <div className="flex flex-col sm:flex-row">
          {/* ── Extra Charge Revenue (left) ── */}
          <div className="flex-1 p-5 sm:p-7">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-violet-500/20 flex items-center justify-center">
                <Receipt className="w-4 h-4 text-violet-400" />
              </div>
              <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Extra Charge Revenue</p>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-none">
              {fc(f.opt.extraChargeRevenue)}
            </p>
            <p className="text-[10px] text-gray-500 mt-2">
              From <span className="font-semibold text-gray-400">{f.opt.days}</span> working days
            </p>

            {/* % of revenue */}
            <div className="mt-4 pt-3 border-t border-white/[0.06]">
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">% of Revenue</p>
              <p className="text-lg sm:text-xl font-extrabold text-violet-400 tracking-tight mt-0.5">
                {f.extraChargePctOfRevenue}%
              </p>
            </div>

            <p className="text-[10px] text-gray-600 mt-3 leading-relaxed">
              Additional revenue when client usage exceeds the standard amount
            </p>
          </div>

          <div className="hidden sm:block w-px bg-white/[0.08] my-5" />
          <div className="sm:hidden h-px bg-white/[0.08] mx-5" />

          {/* ── Mix Optimization Savings (right) ── */}
          <div className="flex-1 p-5 sm:p-7">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Scale className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Mix Optimization Savings</p>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-none">
              {fc(f.opt.mixOptimizationSavings)}
            </p>

            {/* Breakdown: Re-weigh + Round-down */}
            <div className="mt-4 pt-3 border-t border-white/[0.06]">
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide mb-2">Savings Breakdown</p>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-[10px] text-gray-500">Re-weigh</p>
                  <p className="text-sm font-bold text-white">{fc(f.opt.reweighSavings)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500">Round-down Mixes</p>
                  <p className="text-sm font-bold text-white">{fc(f.opt.roundDownSavings)}</p>
                </div>
              </div>
            </div>

            {/* Re-weigh mix count */}
            <div className="mt-4 pt-3 border-t border-white/[0.06]">
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide mb-2">Re-weigh Detail</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-extrabold text-emerald-400">{formatNumber(f.opt.reweighMixes)}</span>
                <span className="text-[11px] text-gray-500">/</span>
                <span className="text-sm font-bold text-gray-300">{formatNumber(f.opt.totalMixes)}</span>
                <span className="text-[10px] text-gray-500 ml-1">mixes re-weighed</span>
              </div>
              <div className="mt-1.5 w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                  style={{ width: `${f.opt.reweighPct}%` }}
                />
              </div>
              <p className="text-[10px] text-emerald-400/80 font-semibold mt-1">{f.opt.reweighPct}% of total mixes</p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ ZONE B · Revenue & Appointments Trend ════════════════ */}
      <GlassPanel variant="chartDark" className="p-0 overflow-hidden">
        <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          <div className="flex items-center gap-2.5">
            <TrendingUp className="w-4 h-4 text-violet-400" style={{ filter: "drop-shadow(0 0 6px rgba(108,92,231,0.5))" }} />
            <h3 className="text-[13px] font-bold text-white">Revenue & Appointments</h3>
            <span className="text-[10px] text-gray-500 hidden sm:inline">&middot; {rangeLabel}</span>
          </div>
          <DarkLegend items={[{ label: "Revenue", color: "#6C5CE7" }, { label: "Appointments", color: "#E84393" }]} />
        </div>
        <div className="p-4 sm:p-6">
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={f.months}>
              <defs>
                <linearGradient id="dashRevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6C5CE7" stopOpacity={0.45} />
                  <stop offset="60%" stopColor="#6C5CE7" stopOpacity={0.08} />
                  <stop offset="100%" stopColor="#6C5CE7" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="dashApptGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E84393" stopOpacity={0.30} />
                  <stop offset="100%" stopColor="#E84393" stopOpacity={0} />
                </linearGradient>
                <filter id="glowLine">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              <CartesianGrid {...DARK_GRID} />
              <XAxis dataKey="month" {...DARK_XAXIS_ANGLED} />
              <YAxis yAxisId="left" {...DARK_AXIS} />
              <YAxis yAxisId="right" orientation="right" {...DARK_AXIS} />
              <Tooltip content={<DarkChartTooltip />} />
              <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="url(#dashRevGrad)" stroke="#6C5CE7" strokeWidth={0.5} strokeOpacity={0.4} radius={[6, 6, 2, 2]} />
              <Line yAxisId="right" type="monotone" dataKey="appointments" name="Appointments" stroke="#E84393" strokeWidth={2.5} dot={{ r: 3.5, fill: "#E84393", stroke: "rgba(232,67,147,0.3)", strokeWidth: 4 }} filter="url(#glowLine)" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </GlassPanel>

      {/* ═══════ ZONE C · Operations: Staff · Services · Products ═════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">

        {/* ── Top Performers ── */}
        <GlassPanel variant="chartDark" className="p-0 overflow-hidden">
          <div className="px-5 py-3 sm:py-3.5 border-b border-white/[0.06] flex items-center gap-2.5">
            <Award className="w-4 h-4 text-pink-400" style={{ filter: "drop-shadow(0 0 6px rgba(244,114,182,0.5))" }} />
            <h3 className="text-[13px] font-bold text-white">Top Performers</h3>
          </div>
          <div className="p-4 sm:p-5 space-y-2.5">
            {topStaff.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-colors duration-200">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                  style={{ backgroundColor: s.color, boxShadow: `0 0 12px ${s.color}40` }}
                >
                  #{i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-white truncate">{s.name}</p>
                  <p className="text-[10px] text-gray-500">{s.role} &middot; {s.appointments} appts</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[13px] font-bold text-white">{fc(s.revenue)}</p>
                  <p className={`text-[10px] font-semibold ${s.trend >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {s.trend >= 0 ? "+" : ""}{s.trend}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>

        {/* ── Top Services ── */}
        <GlassPanel variant="chartDark" className="p-0 overflow-hidden">
          <div className="px-5 py-3 sm:py-3.5 border-b border-white/[0.06] flex items-center gap-2.5">
            <Scissors className="w-4 h-4 text-violet-400" style={{ filter: "drop-shadow(0 0 6px rgba(139,92,246,0.5))" }} />
            <h3 className="text-[13px] font-bold text-white">Top Services</h3>
          </div>
          <div className="p-4 sm:p-5 space-y-3">
            {topServices.map((sv) => {
              const maxPerformed = topServices[0].totalPerformed;
              const pct = Math.round((sv.totalPerformed / maxPerformed) * 100);
              const color = CATEGORY_COLORS[sv.category] || "#64748B";
              return (
                <div key={sv.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + "20" }}>
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}60` }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12px] font-bold text-white truncate">{sv.name}</p>
                        <p className="text-[10px] text-gray-500">{sv.category} &middot; {fc(sv.avgPrice)} avg</p>
                      </div>
                    </div>
                    <p className="text-[12px] font-bold text-white flex-shrink-0 pl-2">{formatNumber(sv.totalPerformed)}</p>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden ml-7">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </GlassPanel>

        {/* ── Most Used Products ── */}
        <GlassPanel variant="chartDark" className="p-0 overflow-hidden">
          <div className="px-5 py-3 sm:py-3.5 border-b border-white/[0.06] flex items-center gap-2.5">
            <Package className="w-4 h-4 text-teal-400" style={{ filter: "drop-shadow(0 0 6px rgba(20,184,166,0.5))" }} />
            <h3 className="text-[13px] font-bold text-white">Most Used Products</h3>
          </div>
          <div className="p-4 sm:p-5 space-y-3">
            {topProducts.map((p, i) => {
              const maxUsage = topProducts[0].usageGrams;
              const pct = Math.round((p.usageGrams / maxUsage) * 100);
              const color = CATEGORY_COLORS[p.category] || "#64748B";
              return (
                <div key={p.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-bold text-gray-500 w-5 text-right flex-shrink-0">#{i + 1}</span>
                      <div className="min-w-0">
                        <p className="text-[12px] font-bold text-white truncate">{p.name}</p>
                        <p className="text-[10px] text-gray-500">{p.brand} &middot; {p.category}</p>
                      </div>
                    </div>
                    <p className="text-[12px] font-bold text-white flex-shrink-0 pl-2">{formatNumber(p.usageGrams)}g</p>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden ml-7">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </GlassPanel>
      </div>
    </div>
  );
};

export default DashboardReport;
