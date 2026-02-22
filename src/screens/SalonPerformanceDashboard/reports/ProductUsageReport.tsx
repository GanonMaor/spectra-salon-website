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
  Package,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Layers,
} from "lucide-react";
import { GlassPanel, formatCurrency, formatNumber, ThemedLegend, getAxisProps, getGridProps, getAngledAxisProps, getTooltipComponent, CATEGORY_COLORS, CATEGORY_GRADIENTS } from "./ReportShared";
import {
  DateRange,
  PRODUCTS,
  MONTHLY_PRODUCTS,
  filterMonthly,
} from "./AnalyticsMockData";

const fc = (v: number) => formatCurrency(v, "ILS");

const STOCK_STYLES_DARK: Record<string, { bg: string; text: string; label: string }> = {
  high:     { bg: "bg-emerald-500/15",  text: "text-emerald-400", label: "In Stock" },
  medium:   { bg: "bg-blue-500/15",     text: "text-blue-400",    label: "Medium" },
  low:      { bg: "bg-amber-500/15",    text: "text-amber-400",   label: "Low" },
  critical: { bg: "bg-rose-500/15",     text: "text-rose-400",    label: "Critical" },
};

const STOCK_STYLES_LIGHT: Record<string, { bg: string; text: string; label: string }> = {
  high:     { bg: "bg-emerald-100",  text: "text-emerald-700", label: "In Stock" },
  medium:   { bg: "bg-blue-100",     text: "text-blue-700",    label: "Medium" },
  low:      { bg: "bg-amber-100",    text: "text-amber-700",   label: "Low" },
  critical: { bg: "bg-rose-100",     text: "text-rose-700",    label: "Critical" },
};

const ProductUsageReport: React.FC<{ dateRange: DateRange; isDark: boolean }> = ({ dateRange, isDark }) => {
  const f = useMemo(() => {
    const months = filterMonthly(MONTHLY_PRODUCTS, dateRange);

    const totalUsage = months.reduce((s, m) => s + m.totalUsage, 0);
    const totalCost = months.reduce((s, m) => s + m.totalCost, 0);

    const catKeys = ["Color", "Highlights", "Toner", "Straightening", "Treatment"] as const;
    const catData = catKeys.map(name => {
      const usage = months.reduce((s, m) => s + (m[name] || 0), 0);
      const products = PRODUCTS.filter(p => p.category === name);
      const cost = products.length > 0
        ? Math.round(usage * (products.reduce((s, p) => s + p.unitPrice, 0) / products.length))
        : 0;
      return { name, totalUsage: usage, totalCost: cost, productCount: products.length };
    }).filter(c => c.totalUsage > 0).sort((a, b) => b.totalUsage - a.totalUsage);

    return { months, totalUsage, totalCost, catData };
  }, [dateRange]);

  const pieData = f.catData.map(c => ({ name: c.name, value: c.totalUsage }));
  const costByCategory = f.catData.map(c => ({ name: c.name, cost: c.totalCost, color: CATEGORY_COLORS[c.name] || "#64748B" }));

  const sortedProducts = [...PRODUCTS].sort((a, b) => b.usageGrams - a.usageGrams);
  const lowStockProducts = PRODUCTS.filter(p => p.stockLevel === "low" || p.stockLevel === "critical");

  const STOCK_STYLES = isDark ? STOCK_STYLES_DARK : STOCK_STYLES_LIGHT;

  const txt = isDark ? "text-white" : "text-[#1A1A1A]";
  const txtMuted = isDark ? "text-gray-500" : "text-gray-500";
  const txtMid = isDark ? "text-gray-400" : "text-gray-500";
  const borderSep = isDark ? "border-white/[0.06]" : "border-black/[0.06]";
  const stripeBg = isDark ? "bg-white/[0.02]" : "bg-black/[0.02]";
  const stripeHover = isDark ? "hover:bg-white/[0.06]" : "hover:bg-black/[0.04]";
  const stripeBorder = isDark ? "border-white/[0.04]" : "border-black/[0.04]";

  const TooltipComp = getTooltipComponent(isDark);
  const axisProps = getAxisProps(isDark);
  const gridProps = getGridProps(isDark);
  const angledAxisProps = getAngledAxisProps(isDark);

  const pieTooltipStyle = isDark
    ? { background: "rgba(10,10,14,0.88)", backdropFilter: "blur(16px)", boxShadow: "0 8px 32px rgba(0,0,0,0.50)" }
    : { background: "rgba(255,255,255,0.95)", backdropFilter: "blur(16px)", boxShadow: "0 8px 32px rgba(0,0,0,0.10)" };
  const pieTooltipBorder = isDark ? "border-white/[0.08]" : "border-black/[0.06]";
  const pieTooltipName = isDark ? "text-white" : "text-gray-900";
  const pieTooltipVal = isDark ? "text-gray-400" : "text-gray-500";

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ── KPI Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {([
          { icon: Package,       label: "Total Usage",        value: `${formatNumber(f.totalUsage)}g`, gradient: "from-teal-500 to-emerald-600",  subtitle: `${PRODUCTS.length} products` },
          { icon: DollarSign,    label: "Total Product Cost", value: fc(f.totalCost),                  gradient: "from-amber-500 to-orange-600",  subtitle: "Across all categories" },
          { icon: Layers,        label: "Categories",         value: String(f.catData.length),         gradient: "from-violet-500 to-purple-600", subtitle: "Active categories" },
          { icon: AlertTriangle, label: "Low Stock Alerts",   value: String(lowStockProducts.length),  gradient: "from-rose-500 to-pink-600",     subtitle: "Needs attention" },
        ] as const).map(({ icon: Icon, label, value, gradient, subtitle }) => (
          <GlassPanel key={label} variant="chartDark" isDark={isDark} className="p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`} style={{ boxShadow: "0 0 16px rgba(0,0,0,0.3)" }}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className={`text-[11px] ${txtMuted} font-medium`}>{label}</p>
                <p className={`text-lg sm:text-xl font-bold ${txt} tracking-tight`}>{value}</p>
                <p className={`text-[10px] ${txtMuted} mt-0.5`}>{subtitle}</p>
              </div>
            </div>
          </GlassPanel>
        ))}
      </div>

      {/* ── Category Breakdown + Cost Analysis ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Category Pie */}
        <GlassPanel variant="chartDark" isDark={isDark} className="p-0 overflow-hidden">
          <div className={`px-5 py-3.5 sm:px-6 sm:py-4 border-b ${borderSep} flex items-center gap-2.5`}>
            <Layers className="w-4 h-4 text-teal-400" style={{ filter: "drop-shadow(0 0 6px rgba(20,184,166,0.5))" }} />
            <h3 className={`text-[13px] font-bold ${txt}`}>Usage by Category</h3>
            <span className={`text-[10px] ${txtMuted} ml-1`}>consumption breakdown</span>
          </div>
          <div className="p-4 sm:p-6">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={5}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || "#64748B"} fillOpacity={0.9} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }: any) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0];
                    return (
                      <div className={`rounded-xl p-3 text-sm border ${pieTooltipBorder}`} style={pieTooltipStyle}>
                        <p className={`font-semibold ${pieTooltipName}`}>{d.name}</p>
                        <p className={pieTooltipVal}>{formatNumber(d.value)}g</p>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-3">
              <ThemedLegend isDark={isDark} items={pieData.map(e => ({ label: e.name, color: CATEGORY_COLORS[e.name] || "#64748B" }))} />
            </div>
          </div>
        </GlassPanel>

        {/* Cost by Category */}
        <GlassPanel variant="chartDark" isDark={isDark} className="p-0 overflow-hidden">
          <div className={`px-5 py-3.5 sm:px-6 sm:py-4 border-b ${borderSep} flex items-center gap-2.5`}>
            <DollarSign className="w-4 h-4 text-amber-400" style={{ filter: "drop-shadow(0 0 6px rgba(245,158,11,0.5))" }} />
            <h3 className={`text-[13px] font-bold ${txt}`}>Cost by Category</h3>
          </div>
          <div className="p-4 sm:p-6">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={costByCategory}>
                <defs>
                  {costByCategory.map((entry) => {
                    const grad = CATEGORY_GRADIENTS[entry.name];
                    const c0 = grad ? grad[0] : entry.color;
                    const c1 = grad ? grad[1] : entry.color;
                    return (
                      <linearGradient key={`prodCostBar-${entry.name}`} id={`prodCostBar-${entry.name}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={c0} stopOpacity={0.90} />
                        <stop offset="100%" stopColor={c1} stopOpacity={0.25} />
                      </linearGradient>
                    );
                  })}
                </defs>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="name" {...axisProps} />
                <YAxis {...axisProps} />
                <Tooltip content={<TooltipComp />} />
                <Bar dataKey="cost" name="Cost" radius={[8, 8, 2, 2]}>
                  {costByCategory.map((entry) => (
                    <Cell key={entry.name} fill={`url(#prodCostBar-${entry.name})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>
      </div>

      {/* ── Monthly Usage Trend ─────────────────────────── */}
      <GlassPanel variant="chartDark" isDark={isDark} className="p-0 overflow-hidden">
        <div className={`px-5 py-3.5 sm:px-6 sm:py-4 border-b ${borderSep} flex items-center justify-between`}>
          <div className="flex items-center gap-2.5">
            <TrendingUp className="w-4 h-4 text-teal-400" style={{ filter: "drop-shadow(0 0 6px rgba(20,184,166,0.5))" }} />
            <h3 className={`text-[13px] font-bold ${txt}`}>Monthly Usage Trend</h3>
            <span className={`text-[10px] ${txtMuted} hidden sm:inline`}>total consumption (g)</span>
          </div>
          <ThemedLegend isDark={isDark} items={[{ label: "Usage (g)", color: "#14B8A6" }]} />
        </div>
        <div className="p-4 sm:p-6">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={f.months}>
              <defs>
                <linearGradient id="usageTrendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14B8A6" stopOpacity={0.45} />
                  <stop offset="50%" stopColor="#14B8A6" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#14B8A6" stopOpacity={0} />
                </linearGradient>
                <filter id="usageGlow">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="month" {...angledAxisProps} height={44} />
              <YAxis {...axisProps} />
              <Tooltip content={<TooltipComp />} />
              <Area
                type="monotone"
                dataKey="totalUsage"
                name="Usage (g)"
                stroke="#14B8A6"
                strokeWidth={2.5}
                fill="url(#usageTrendGrad)"
                dot={{ r: 3.5, fill: "#14B8A6", stroke: "rgba(20,184,166,0.3)", strokeWidth: 4 }}
                filter="url(#usageGlow)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassPanel>

      {/* ── Product Inventory Table ─────────────────────── */}
      <GlassPanel variant="chartDark" isDark={isDark} className="overflow-hidden">
        <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-2 sm:pb-3">
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-4 h-4 text-teal-400" style={{ filter: "drop-shadow(0 0 6px rgba(20,184,166,0.5))" }} />
            <h3 className={`text-sm font-bold ${txt}`}>Product Inventory</h3>
          </div>
          <p className={`text-[11px] ${txtMuted}`}>All tracked products with usage and stock status</p>
        </div>
        <div className="px-4 sm:px-6 pb-4 sm:pb-5">
          <div className={`rounded-2xl overflow-x-auto border ${borderSep}`}>
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className={isDark ? "bg-white/[0.03]" : "bg-black/[0.02]"}>
                  <th className={`text-left px-4 py-3 font-semibold ${txtMuted} text-[11px] uppercase tracking-wider`}>Product</th>
                  <th className={`text-left px-4 py-3 font-semibold ${txtMuted} text-[11px] uppercase tracking-wider`}>Brand</th>
                  <th className={`text-left px-4 py-3 font-semibold ${txtMuted} text-[11px] uppercase tracking-wider`}>Category</th>
                  <th className={`text-right px-4 py-3 font-semibold ${txtMuted} text-[11px] uppercase tracking-wider`}>Usage (g)</th>
                  <th className={`text-right px-4 py-3 font-semibold ${txtMuted} text-[11px] uppercase tracking-wider`}>Cost</th>
                  <th className={`text-center px-4 py-3 font-semibold ${txtMuted} text-[11px] uppercase tracking-wider`}>Stock</th>
                  <th className={`text-right px-4 py-3 font-semibold ${txtMuted} text-[11px] uppercase tracking-wider`}>Trend</th>
                </tr>
              </thead>
              <tbody>
                {sortedProducts.map((p, i) => {
                  const stock = STOCK_STYLES[p.stockLevel];
                  return (
                    <tr
                      key={p.id}
                      className={`border-t ${stripeBorder} ${stripeHover} transition-colors ${
                        i % 2 === 0 ? stripeBg : ""
                      }`}
                    >
                      <td className={`px-4 py-3.5 font-semibold ${txt}`}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-1.5 h-6 rounded-full"
                            style={{ backgroundColor: CATEGORY_COLORS[p.category] || "#64748B" }}
                          />
                          {p.name}
                        </div>
                      </td>
                      <td className={`px-4 py-3.5 ${txtMid}`}>{p.brand}</td>
                      <td className={`px-4 py-3.5 ${txtMid}`}>{p.category}</td>
                      <td className={`text-right px-4 py-3.5 font-bold ${txt}`}>{formatNumber(p.usageGrams)}</td>
                      <td className={`text-right px-4 py-3.5 ${txtMid}`}>{fc(p.cost)}</td>
                      <td className="text-center px-4 py-3.5">
                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${stock.bg} ${stock.text}`}>
                          {stock.label}
                        </span>
                      </td>
                      <td className="text-right px-4 py-3.5">
                        <span className={`text-[12px] font-semibold ${p.trend >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {p.trend >= 0 ? "+" : ""}{p.trend}%
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

export default ProductUsageReport;
