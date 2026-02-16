import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Scissors,
  TrendingUp,
  DollarSign,
  Clock,
  Layers,
  Activity,
} from "lucide-react";
import { GlassPanel, formatCurrency, formatNumber, DarkChartTooltip, DarkLegend, DARK_AXIS, DARK_GRID, DARK_XAXIS_ANGLED, CATEGORY_COLORS, CATEGORY_GRADIENTS } from "./ReportShared";
import {
  DateRange,
  SERVICES,
  SERVICE_CATEGORIES,
  MONTHLY_SERVICES,
  MonthlyServiceRow,
  filterMonthly,
} from "./AnalyticsMockData";

const fc = (v: number) => formatCurrency(v, "ILS");

const CATEGORY_KEYS = ["Color", "Highlights", "Toner", "Straightening", "Treatment"] as const;

const ServicesReport: React.FC<{ dateRange: DateRange }> = ({ dateRange }) => {
  const f = useMemo(() => {
    const months = filterMonthly(MONTHLY_SERVICES, dateRange);

    const totalPerformed = months.reduce((s, m) => s + m.total, 0);
    const totalRevenue = months.reduce((s, m) => s + m.revenue, 0);
    const avgPrice = totalPerformed > 0 ? Math.round(totalRevenue / totalPerformed) : 0;

    const filteredCats = CATEGORY_KEYS.map(cat => {
      const performed = months.reduce((s, m) => s + ((m[cat as keyof MonthlyServiceRow] as number) || 0), 0);
      const svcs = SERVICES.filter(sv => sv.category === cat);
      const avgMatCost = svcs.length > 0 ? Math.round(svcs.reduce((sum, sv) => sum + sv.avgMaterialCost, 0) / svcs.length) : 0;
      const catRevenue = performed > 0 ? Math.round(performed * (totalRevenue / totalPerformed)) : 0;
      return { name: cat, totalPerformed: performed, totalRevenue: catRevenue, avgMaterialCost: avgMatCost, serviceCount: svcs.length };
    }).filter(c => c.totalPerformed > 0).sort((a, b) => b.totalPerformed - a.totalPerformed);

    const avgMatCostPerSvc = totalPerformed > 0
      ? Math.round(SERVICES.reduce((s, sv) => s + sv.avgMaterialCost * sv.totalPerformed, 0) / SERVICES.reduce((s, sv) => s + sv.totalPerformed, 0))
      : 0;
    const profitMarginAvg = avgPrice > 0 ? Math.round(((avgPrice - avgMatCostPerSvc) / avgPrice) * 100) : 0;
    const topCat = filteredCats[0];
    const topCatPct = topCat && totalPerformed > 0 ? Math.round((topCat.totalPerformed / totalPerformed) * 100) : 0;

    return { months, totalPerformed, totalRevenue, avgPrice, avgMatCostPerSvc, profitMarginAvg, filteredCats, topCat, topCatPct };
  }, [dateRange]);

  const rankedServices = [...SERVICES].sort((a, b) => b.totalPerformed - a.totalPerformed);

  const pieByCat = f.filteredCats.map(c => ({ name: c.name, value: c.totalPerformed }));
  const revenueByCat = f.filteredCats.map(c => ({ name: c.name, revenue: c.totalRevenue, color: CATEGORY_COLORS[c.name] || "#64748B" }));

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ── KPI Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {([
          { icon: Scissors,   label: "Total Services",     value: formatNumber(f.totalPerformed), gradient: "from-pink-500 to-rose-600",     subtitle: `${SERVICES.length} service types` },
          { icon: DollarSign, label: "Total Revenue",      value: fc(f.totalRevenue),             gradient: "from-emerald-500 to-teal-600",  subtitle: `~${fc(f.avgPrice)} avg price` },
          { icon: Activity,   label: "Avg Material Cost",  value: fc(f.avgMatCostPerSvc),         gradient: "from-amber-500 to-orange-600",  subtitle: `${f.profitMarginAvg}% gross margin` },
          { icon: Clock,      label: "Top Category",       value: f.topCat?.name || "–",          gradient: "from-violet-500 to-purple-600", subtitle: `${f.topCatPct}% of all services` },
        ] as const).map(({ icon: Icon, label, value, gradient, subtitle }) => (
          <GlassPanel key={label} variant="chartDark" className="p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`} style={{ boxShadow: "0 0 16px rgba(0,0,0,0.3)" }}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-gray-500 font-medium">{label}</p>
                <p className="text-lg sm:text-xl font-bold text-white tracking-tight">{value}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{subtitle}</p>
              </div>
            </div>
          </GlassPanel>
        ))}
      </div>

      {/* ── Category Intelligence Cards ─────────────────── */}
      <GlassPanel variant="chartDark" className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
            <Layers className="w-3.5 h-3.5 text-white" />
          </div>
          <h3 className="text-[14px] font-bold text-white">Service Categories</h3>
          <span className="text-[11px] text-gray-500 ml-1">performance overview</span>
        </div>

        <div className="space-y-3">
          {f.filteredCats.map((cat) => {
            const pct = f.totalPerformed > 0 ? Math.round((cat.totalPerformed / f.totalPerformed) * 100) : 0;
            const color = CATEGORY_COLORS[cat.name] || "#64748B";
            const grad = CATEGORY_GRADIENTS[cat.name];
            return (
              <div
                key={cat.name}
                className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.04] transition-all duration-300 group cursor-default"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: grad ? `linear-gradient(135deg, ${grad[0]}22, ${grad[1]}22)` : `${color}14`, border: `1px solid ${color}25` }}
                >
                  <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}60` }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{cat.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-gray-500">{formatNumber(cat.totalPerformed)} services</span>
                    <span className="text-[11px] text-gray-600">&middot;</span>
                    <span className="text-[11px] text-gray-500">{cat.serviceCount} types</span>
                    <span className="text-[11px] text-gray-600">&middot;</span>
                    <span className="text-[11px] text-gray-500">~{fc(cat.avgMaterialCost)} material</span>
                  </div>
                  <div className="mt-2 w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: grad ? `linear-gradient(90deg, ${grad[0]}, ${grad[1]})` : color }}
                    />
                  </div>
                </div>
                <div className="text-right flex-shrink-0 pl-2">
                  <p className="text-xl font-bold text-white">{fc(cat.totalRevenue)}</p>
                  <p className="text-[10px] text-gray-500 font-medium mt-0.5">{pct}% of total</p>
                </div>
              </div>
            );
          })}
        </div>
      </GlassPanel>

      {/* ── Service Mix Pie + Revenue by Category ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Service Mix Pie */}
        <GlassPanel variant="chartDark" className="p-0 overflow-hidden">
          <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-b border-white/[0.06] flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-pink-400" style={{ filter: "drop-shadow(0 0 6px rgba(232,67,147,0.5))" }} />
            <h3 className="text-[13px] font-bold text-white">Service Mix</h3>
            <span className="text-[10px] text-gray-500 ml-1">{f.topCat?.name || "–"} leads · {f.topCatPct}%</span>
          </div>
          <div className="p-4 sm:p-6">
            <div className="relative">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <defs>
                    {pieByCat.map((entry) => {
                      const c = CATEGORY_COLORS[entry.name] || "#64748B";
                      return (
                        <filter key={`glow-${entry.name}`} id={`pieGlow-${entry.name}`}>
                          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={c} floodOpacity="0.4" />
                        </filter>
                      );
                    })}
                  </defs>
                  <Pie
                    data={pieByCat}
                    cx="50%"
                    cy="50%"
                    innerRadius={56}
                    outerRadius={108}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={6}
                  >
                    {pieByCat.map((entry) => (
                      <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || "#64748B"} fillOpacity={0.9} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }: any) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0];
                      return (
                        <div className="rounded-xl p-3 text-sm border border-white/[0.08]" style={{ background: "rgba(10,10,14,0.88)", backdropFilter: "blur(16px)", boxShadow: "0 8px 32px rgba(0,0,0,0.50)" }}>
                          <p className="font-semibold text-white">{d.name}</p>
                          <p className="text-gray-400">{formatNumber(d.value)} services</p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-[9px] text-gray-500 uppercase tracking-[0.15em]">Top</p>
                <p className="text-xl font-black text-white tracking-tight">{f.topCat?.name || "–"}</p>
                <p className="text-[11px] text-gray-400 font-medium">{f.topCatPct}%</p>
              </div>
            </div>
            <div className="mt-3">
              <DarkLegend items={pieByCat.map(e => ({ label: e.name, color: CATEGORY_COLORS[e.name] || "#64748B" }))} />
            </div>
          </div>
        </GlassPanel>

        {/* Revenue by Category */}
        <GlassPanel variant="chartDark" className="p-0 overflow-hidden">
          <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-b border-white/[0.06] flex items-center gap-2.5">
            <DollarSign className="w-4 h-4 text-emerald-400" style={{ filter: "drop-shadow(0 0 6px rgba(16,185,129,0.5))" }} />
            <h3 className="text-[13px] font-bold text-white">Revenue by Category</h3>
          </div>
          <div className="p-4 sm:p-6">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={revenueByCat}>
                <defs>
                  {revenueByCat.map((entry) => {
                    const grad = CATEGORY_GRADIENTS[entry.name];
                    const c0 = grad ? grad[0] : entry.color;
                    const c1 = grad ? grad[1] : entry.color;
                    return (
                      <linearGradient key={`svcRevBar-${entry.name}`} id={`svcRevBar-${entry.name}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={c0} stopOpacity={0.90} />
                        <stop offset="100%" stopColor={c1} stopOpacity={0.30} />
                      </linearGradient>
                    );
                  })}
                </defs>
                <CartesianGrid {...DARK_GRID} />
                <XAxis dataKey="name" {...DARK_AXIS} />
                <YAxis {...DARK_AXIS} />
                <Tooltip content={<DarkChartTooltip />} />
                <Bar dataKey="revenue" name="Revenue" radius={[8, 8, 2, 2]}>
                  {revenueByCat.map((entry) => (
                    <Cell key={entry.name} fill={`url(#svcRevBar-${entry.name})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>
      </div>

      {/* ── Monthly Services Trend (stacked area) ───────── */}
      <GlassPanel variant="chartDark" className="p-0 overflow-hidden">
        <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          <div className="flex items-center gap-2.5">
            <TrendingUp className="w-4 h-4 text-rose-400" style={{ filter: "drop-shadow(0 0 6px rgba(244,63,94,0.5))" }} />
            <h3 className="text-[13px] font-bold text-white">Monthly Service Volume</h3>
            <span className="text-[10px] text-gray-500 hidden sm:inline">stacked by category</span>
          </div>
          <DarkLegend items={CATEGORY_KEYS.map(cat => ({ label: cat, color: CATEGORY_COLORS[cat] || "#64748B" }))} />
        </div>
        <div className="p-4 sm:p-6">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={f.months}>
              <defs>
                {Object.entries(CATEGORY_COLORS).map(([name, color]) => {
                  const grad = CATEGORY_GRADIENTS[name];
                  const c0 = grad ? grad[0] : color;
                  const c1 = grad ? grad[1] : color;
                  return (
                    <linearGradient key={name} id={`svcArea-${name}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={c0} stopOpacity={0.50} />
                      <stop offset="40%" stopColor={c1} stopOpacity={0.15} />
                      <stop offset="100%" stopColor={c1} stopOpacity={0} />
                    </linearGradient>
                  );
                })}
              </defs>
              <CartesianGrid {...DARK_GRID} />
              <XAxis dataKey="month" {...DARK_XAXIS_ANGLED} />
              <YAxis {...DARK_AXIS} />
              <Tooltip content={<DarkChartTooltip />} />
              {CATEGORY_KEYS.map((cat) => (
                <Area
                  key={cat}
                  type="monotone"
                  dataKey={cat}
                  name={cat}
                  stackId="1"
                  stroke={CATEGORY_COLORS[cat] || "#64748B"}
                  strokeWidth={1.5}
                  fill={`url(#svcArea-${cat})`}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassPanel>

      {/* ── Service Details Table ───────────────────────── */}
      <GlassPanel variant="chartDark" className="overflow-hidden">
        <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-2 sm:pb-3">
          <div className="flex items-center gap-2 mb-1">
            <Scissors className="w-4 h-4 text-rose-400" style={{ filter: "drop-shadow(0 0 6px rgba(251,113,133,0.5))" }} />
            <h3 className="text-sm font-bold text-white">All Services</h3>
          </div>
          <p className="text-[11px] text-gray-500">Detailed breakdown of each service type</p>
        </div>
        <div className="px-4 sm:px-6 pb-4 sm:pb-5">
          <div className="rounded-2xl overflow-x-auto border border-white/[0.06]">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="bg-white/[0.03]">
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-[11px] uppercase tracking-wider">Service</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-[11px] uppercase tracking-wider">Category</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-500 text-[11px] uppercase tracking-wider">Performed</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-500 text-[11px] uppercase tracking-wider">Revenue</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-500 text-[11px] uppercase tracking-wider">Avg Price</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-500 text-[11px] uppercase tracking-wider">Material</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-500 text-[11px] uppercase tracking-wider">Duration</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-500 text-[11px] uppercase tracking-wider">Trend</th>
                </tr>
              </thead>
              <tbody>
                {rankedServices.map((sv, i) => {
                  const margin = Math.round(((sv.avgPrice - sv.avgMaterialCost) / sv.avgPrice) * 100);
                  return (
                    <tr
                      key={sv.id}
                      className={`border-t border-white/[0.04] hover:bg-white/[0.06] transition-colors ${
                        i % 2 === 0 ? "bg-white/[0.02]" : ""
                      }`}
                    >
                      <td className="px-4 py-3.5 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-1.5 h-6 rounded-full"
                            style={{ backgroundColor: CATEGORY_COLORS[sv.category] || "#64748B" }}
                          />
                          {sv.name}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-gray-400">{sv.category}</td>
                      <td className="text-right px-4 py-3.5 font-bold text-white">{formatNumber(sv.totalPerformed)}</td>
                      <td className="text-right px-4 py-3.5 text-gray-400">{fc(sv.revenue)}</td>
                      <td className="text-right px-4 py-3.5 text-gray-400">{fc(sv.avgPrice)}</td>
                      <td className="text-right px-4 py-3.5 text-gray-500">
                        {fc(sv.avgMaterialCost)}
                        <span className="text-[9px] text-gray-600 ml-1">({margin}%)</span>
                      </td>
                      <td className="text-right px-4 py-3.5 text-gray-400">{sv.avgDuration}m</td>
                      <td className="text-right px-4 py-3.5">
                        <span className={`text-[12px] font-semibold ${sv.trend >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {sv.trend >= 0 ? "+" : ""}{sv.trend}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
};

export default ServicesReport;
