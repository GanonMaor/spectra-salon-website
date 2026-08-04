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
import { ShoppingBag, DollarSign, Package, TrendingUp } from "lucide-react";
import {
  GlassPanel,
  formatCrmCurrency,
  formatNumber,
  ThemedLegend,
  getAxisProps,
  getGridProps,
  getAngledAxisProps,
  getTooltipComponent,
  IncompleteState,
} from "./ReportShared";
import { DateRange, filterMonthly } from "../analyticsDateRange";
import type { LiveAnalytics } from "../liveAnalyticsAdapter";
import { useCrmLocale } from "../../SalonCRM/i18n/CrmLocale";

const RETAIL_COLORS: Record<string, string> = {
  Shampoo: "#60A5FA",
  Treatment: "#A78BFA",
  Styling: "#F472B6",
  ColorCare: "#34D399",
  Other: "#FBBF24",
};

const SalesReport: React.FC<{ dateRange: DateRange; isDark: boolean; analytics: LiveAnalytics }> = ({
  dateRange,
  isDark,
  analytics,
}) => {
  const { lang, t } = useCrmLocale();
  const r = t.analytics.report;
  const fc = (v: number) => formatCrmCurrency(v, lang);
  const demo = analytics.financeDemo;

  const f = useMemo(() => {
    const months = filterMonthly(demo.monthlyRetail, dateRange);
    const revenue = months.reduce((s, m) => s + m.revenue, 0);
    const units = months.reduce((s, m) => s + m.units, 0);
    const cost = months.reduce((s, m) => s + m.cost, 0);
    const margin = revenue > 0 ? Math.round(((revenue - cost) / revenue) * 100) : 0;
    const byCat = [
      { key: "Shampoo", name: r.retailCatShampoo, value: months.reduce((s, m) => s + m.Shampoo, 0) },
      { key: "Treatment", name: r.retailCatTreatment, value: months.reduce((s, m) => s + m.Treatment, 0) },
      { key: "Styling", name: r.retailCatStyling, value: months.reduce((s, m) => s + m.Styling, 0) },
      { key: "ColorCare", name: r.retailCatColorCare, value: months.reduce((s, m) => s + m.ColorCare, 0) },
      { key: "Other", name: r.retailCatOther, value: months.reduce((s, m) => s + m.Other, 0) },
    ].filter((c) => c.value > 0);
    const products = demo.retailProducts
      .map((p) => {
        // Scale product totals to the filtered month share when possible.
        const full = demo.totalRetailRevenue || 1;
        const share = revenue / full;
        return {
          ...p,
          units: Math.round(p.units * share),
          revenue: Math.round(p.revenue * share),
          cost: Math.round(p.cost * share),
        };
      })
      .filter((p) => p.units > 0)
      .sort((a, b) => b.revenue - a.revenue);
    return { months, revenue, units, cost, margin, byCat, products };
  }, [dateRange, demo, r]);

  const txt = isDark ? "text-white" : "text-[#1A1A1A]";
  const txtMuted = isDark ? "text-gray-500" : "text-gray-500";
  const txtFaint = isDark ? "text-gray-600" : "text-gray-400";
  const borderSep = isDark ? "border-white/[0.06]" : "border-black/[0.06]";
  const TooltipComp = getTooltipComponent(isDark);
  const axisProps = getAxisProps(isDark);
  const gridProps = getGridProps(isDark);
  const angledAxisProps = getAngledAxisProps(isDark);

  if (!demo.active || f.revenue <= 0) {
    return (
      <IncompleteState
        isDark={isDark}
        title={r.salesUnavailableTitle}
        description={r.salesUnavailableDescription}
        icon={<ShoppingBag className={`h-5 w-5 ${isDark ? "text-white/50" : "text-black/45"}`} />}
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <p className={`text-[11px] ${txtFaint}`}>{r.financePilotHint}</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {([
          { icon: DollarSign, label: r.retailRevenue, value: fc(f.revenue), gradient: "from-emerald-500 to-teal-600", subtitle: r.financePilotBadge },
          { icon: Package, label: r.unitsSold, value: formatNumber(f.units, lang), gradient: "from-sky-500 to-blue-600", subtitle: `${f.products.length} ${r.products}` },
          { icon: TrendingUp, label: r.retailMargin, value: `${f.margin}%`, gradient: "from-violet-500 to-purple-600", subtitle: fc(f.revenue - f.cost) },
          { icon: ShoppingBag, label: r.topRetailProduct, value: f.products[0]?.name?.split(" ").slice(0, 2).join(" ") || "–", gradient: "from-pink-500 to-rose-600", subtitle: f.products[0] ? fc(f.products[0].revenue) : "–" },
        ] as const).map(({ icon: Icon, label, value, gradient, subtitle }) => (
          <GlassPanel key={label} variant="chartDark" isDark={isDark} className="p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className={`text-[11px] ${txtMuted} font-medium`}>{label}</p>
                <p className={`text-xl font-bold ${txt} truncate`}>{value}</p>
                <p className={`text-[10px] ${txtFaint} mt-0.5 truncate`}>{subtitle}</p>
              </div>
            </div>
          </GlassPanel>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <GlassPanel variant="chartDark" isDark={isDark} className="p-0 overflow-hidden">
          <div className={`px-5 py-3.5 border-b ${borderSep} flex items-center gap-2`}>
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <h3 className={`text-[13px] font-bold ${txt}`}>{r.retailTrend}</h3>
          </div>
          <div className="p-4 sm:p-5">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={f.months}>
                <defs>
                  <linearGradient id="retailGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34D399" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#34D399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="month" {...angledAxisProps} />
                <YAxis {...axisProps} />
                <Tooltip content={<TooltipComp />} />
                <Area type="monotone" dataKey="revenue" name={r.retailRevenue} stroke="#34D399" fill="url(#retailGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        <GlassPanel variant="chartDark" isDark={isDark} className="p-0 overflow-hidden">
          <div className={`px-5 py-3.5 border-b ${borderSep} flex items-center gap-2`}>
            <ShoppingBag className="w-4 h-4 text-pink-400" />
            <h3 className={`text-[13px] font-bold ${txt}`}>{r.retailMix}</h3>
          </div>
          <div className="p-4 sm:p-5">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={f.byCat} dataKey="value" nameKey="name" innerRadius={52} outerRadius={90} paddingAngle={4}>
                  {f.byCat.map((entry) => (
                    <Cell key={entry.key} fill={RETAIL_COLORS[entry.key] || "#64748B"} />
                  ))}
                </Pie>
                <Tooltip content={<TooltipComp />} />
              </PieChart>
            </ResponsiveContainer>
            <ThemedLegend
              isDark={isDark}
              items={f.byCat.map((c) => ({ label: c.name, color: RETAIL_COLORS[c.key] || "#64748B" }))}
            />
          </div>
        </GlassPanel>
      </div>

      <GlassPanel variant="chartDark" isDark={isDark} className="p-0 overflow-hidden">
        <div className={`px-5 py-3.5 border-b ${borderSep} flex items-center gap-2`}>
          <Package className="w-4 h-4 text-sky-400" />
          <h3 className={`text-[13px] font-bold ${txt}`}>{r.topRetailProducts}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-start text-[12px]">
            <thead className={`${txtMuted}`}>
              <tr className={`border-b ${borderSep}`}>
                <th className="px-4 py-2.5 font-semibold">{r.product}</th>
                <th className="px-4 py-2.5 font-semibold">{r.brand}</th>
                <th className="px-4 py-2.5 text-end font-semibold">{r.unitsSold}</th>
                <th className="px-4 py-2.5 text-end font-semibold">{r.retailRevenue}</th>
                <th className="px-4 py-2.5 text-end font-semibold">{r.retailMargin}</th>
              </tr>
            </thead>
            <tbody>
              {f.products.slice(0, 8).map((p, idx) => (
                <tr key={p.id} className={`border-b last:border-b-0 ${borderSep} ${idx % 2 === 0 ? (isDark ? "bg-white/[0.02]" : "bg-black/[0.02]") : ""}`}>
                  <td className={`px-4 py-2.5 font-semibold ${txt}`}>{p.name}</td>
                  <td className={`px-4 py-2.5 ${txtMuted}`}>{p.brand}</td>
                  <td className={`px-4 py-2.5 text-end tabular-nums ${txt}`}>{formatNumber(p.units, lang)}</td>
                  <td className={`px-4 py-2.5 text-end tabular-nums ${txt}`}>{fc(p.revenue)}</td>
                  <td className={`px-4 py-2.5 text-end tabular-nums ${txtMuted}`}>{p.marginPct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>

      <GlassPanel variant="chartDark" isDark={isDark} className="p-0 overflow-hidden">
        <div className={`px-5 py-3.5 border-b ${borderSep}`}>
          <h3 className={`text-[13px] font-bold ${txt}`}>{r.retailByCategory}</h3>
        </div>
        <div className="p-4 sm:p-5">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={f.months}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="month" {...angledAxisProps} />
              <YAxis {...axisProps} />
              <Tooltip content={<TooltipComp />} />
              <Bar dataKey="Shampoo" stackId="a" fill={RETAIL_COLORS.Shampoo} />
              <Bar dataKey="Treatment" stackId="a" fill={RETAIL_COLORS.Treatment} />
              <Bar dataKey="Styling" stackId="a" fill={RETAIL_COLORS.Styling} />
              <Bar dataKey="ColorCare" stackId="a" fill={RETAIL_COLORS.ColorCare} />
              <Bar dataKey="Other" stackId="a" fill={RETAIL_COLORS.Other} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassPanel>
    </div>
  );
};

export default SalesReport;
