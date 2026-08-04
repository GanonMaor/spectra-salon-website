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
import { Receipt, Building2, Users, Zap, Megaphone, Package } from "lucide-react";
import {
  GlassPanel,
  formatCrmCurrency,
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

const EXPENSE_COLORS: Record<string, string> = {
  Rent: "#F87171",
  Payroll: "#FB923C",
  Utilities: "#FBBF24",
  Marketing: "#A78BFA",
  Supplies: "#34D399",
  Other: "#60A5FA",
};

const ExpensesReport: React.FC<{ dateRange: DateRange; isDark: boolean; analytics: LiveAnalytics }> = ({
  dateRange,
  isDark,
  analytics,
}) => {
  const { lang, t } = useCrmLocale();
  const r = t.analytics.report;
  const fc = (v: number) => formatCrmCurrency(v, lang);
  const demo = analytics.financeDemo;
  const catLabel = (key: string) =>
    ({
      Rent: r.expenseCatRent,
      Payroll: r.expenseCatPayroll,
      Utilities: r.expenseCatUtilities,
      Marketing: r.expenseCatMarketing,
      Supplies: r.expenseCatSupplies,
      Other: r.expenseCatOther,
    } as Record<string, string>)[key] || key;
  const expLabel = (key: string, fallback: string) =>
    ({
      Rent: r.expenseLabelRent,
      Payroll: r.expenseLabelPayroll,
      Utilities: r.expenseLabelUtilities,
      Marketing: r.expenseLabelMarketing,
      Supplies: r.expenseLabelSupplies,
      Other: r.expenseLabelOther,
    } as Record<string, string>)[key] || fallback;
  const serviceRevenue = useMemo(
    () => filterMonthly(analytics.monthlyCombined, dateRange).reduce((s, m) => s + m.revenue, 0),
    [analytics.monthlyCombined, dateRange],
  );

  const f = useMemo(() => {
    const months = filterMonthly(demo.monthlyExpenses, dateRange);
    const total = months.reduce((s, m) => s + m.total, 0);
    const byCat = [
      { key: "Rent", name: r.expenseCatRent, value: months.reduce((s, m) => s + m.Rent, 0) },
      { key: "Payroll", name: r.expenseCatPayroll, value: months.reduce((s, m) => s + m.Payroll, 0) },
      { key: "Utilities", name: r.expenseCatUtilities, value: months.reduce((s, m) => s + m.Utilities, 0) },
      { key: "Marketing", name: r.expenseCatMarketing, value: months.reduce((s, m) => s + m.Marketing, 0) },
      { key: "Supplies", name: r.expenseCatSupplies, value: months.reduce((s, m) => s + m.Supplies, 0) },
      { key: "Other", name: r.expenseCatOther, value: months.reduce((s, m) => s + m.Other, 0) },
    ].filter((c) => c.value > 0);
    const shareOfRevenue = serviceRevenue > 0 ? Math.round((total / serviceRevenue) * 100) : 0;
    const fixed = demo.expenses.filter((e) => e.kind === "fixed").reduce((s, e) => {
      const full = demo.totalExpenses || 1;
      return s + Math.round(e.amount * (total / full));
    }, 0);
    const variable = Math.max(0, total - fixed);
    const rows = demo.expenses
      .map((e) => {
        const full = demo.totalExpenses || 1;
        return { ...e, amount: Math.round(e.amount * (total / full)) };
      })
      .filter((e) => e.amount > 0)
      .sort((a, b) => b.amount - a.amount);
    return { months, total, byCat, shareOfRevenue, fixed, variable, rows };
  }, [dateRange, demo, r, serviceRevenue]);

  const txt = isDark ? "text-white" : "text-[#1A1A1A]";
  const txtMuted = isDark ? "text-gray-500" : "text-gray-500";
  const txtFaint = isDark ? "text-gray-600" : "text-gray-400";
  const borderSep = isDark ? "border-white/[0.06]" : "border-black/[0.06]";
  const TooltipComp = getTooltipComponent(isDark);
  const axisProps = getAxisProps(isDark);
  const gridProps = getGridProps(isDark);
  const angledAxisProps = getAngledAxisProps(isDark);

  if (!demo.active || f.total <= 0) {
    return (
      <IncompleteState
        isDark={isDark}
        title={r.expensesUnavailableTitle}
        description={r.expensesUnavailableDescription}
        icon={<Receipt className={`h-5 w-5 ${isDark ? "text-white/50" : "text-black/45"}`} />}
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <p className={`text-[11px] ${txtFaint}`}>{r.financePilotHint}</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {([
          { icon: Receipt, label: r.totalExpenses, value: fc(f.total), gradient: "from-rose-500 to-red-600", subtitle: r.financePilotBadge },
          { icon: Building2, label: r.fixedExpenses, value: fc(f.fixed), gradient: "from-orange-500 to-amber-600", subtitle: `${f.shareOfRevenue}% ${r.ofBookedValue}` },
          { icon: Users, label: r.variableExpenses, value: fc(f.variable), gradient: "from-violet-500 to-purple-600", subtitle: r.expenseCatPayroll },
          { icon: Zap, label: r.largestExpense, value: f.rows[0] ? fc(f.rows[0].amount) : "–", gradient: "from-sky-500 to-blue-600", subtitle: f.rows[0] ? expLabel(f.rows[0].category, f.rows[0].label) : "–" },
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
            <Receipt className="w-4 h-4 text-rose-400" />
            <h3 className={`text-[13px] font-bold ${txt}`}>{r.expenseTrend}</h3>
          </div>
          <div className="p-4 sm:p-5">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={f.months}>
                <defs>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F87171" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#F87171" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="month" {...angledAxisProps} />
                <YAxis {...axisProps} />
                <Tooltip content={<TooltipComp />} />
                <Area type="monotone" dataKey="total" name={r.totalExpenses} stroke="#F87171" fill="url(#expenseGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        <GlassPanel variant="chartDark" isDark={isDark} className="p-0 overflow-hidden">
          <div className={`px-5 py-3.5 border-b ${borderSep} flex items-center gap-2`}>
            <Megaphone className="w-4 h-4 text-violet-400" />
            <h3 className={`text-[13px] font-bold ${txt}`}>{r.expenseMix}</h3>
          </div>
          <div className="p-4 sm:p-5">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={f.byCat} dataKey="value" nameKey="name" innerRadius={52} outerRadius={90} paddingAngle={4}>
                  {f.byCat.map((entry) => (
                    <Cell key={entry.key} fill={EXPENSE_COLORS[entry.key] || "#64748B"} />
                  ))}
                </Pie>
                <Tooltip content={<TooltipComp />} />
              </PieChart>
            </ResponsiveContainer>
            <ThemedLegend
              isDark={isDark}
              items={f.byCat.map((c) => ({ label: catLabel(c.key), color: EXPENSE_COLORS[c.key] || "#64748B" }))}
            />
          </div>
        </GlassPanel>
      </div>

      <GlassPanel variant="chartDark" isDark={isDark} className="p-0 overflow-hidden">
        <div className={`px-5 py-3.5 border-b ${borderSep} flex items-center gap-2`}>
          <Package className="w-4 h-4 text-amber-400" />
          <h3 className={`text-[13px] font-bold ${txt}`}>{r.expenseBreakdown}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-start text-[12px]">
            <thead className={txtMuted}>
              <tr className={`border-b ${borderSep}`}>
                <th className="px-4 py-2.5 font-semibold">{r.category}</th>
                <th className="px-4 py-2.5 font-semibold">{r.description}</th>
                <th className="px-4 py-2.5 font-semibold">{r.kind}</th>
                <th className="px-4 py-2.5 text-end font-semibold">{r.amount}</th>
                <th className="px-4 py-2.5 text-end font-semibold">%</th>
              </tr>
            </thead>
            <tbody>
              {f.rows.map((row, idx) => (
                <tr key={row.id} className={`border-b last:border-b-0 ${borderSep} ${idx % 2 === 0 ? (isDark ? "bg-white/[0.02]" : "bg-black/[0.02]") : ""}`}>
                  <td className={`px-4 py-2.5 font-semibold ${txt}`}>{catLabel(row.category)}</td>
                  <td className={`px-4 py-2.5 ${txtMuted}`}>{expLabel(row.category, row.label)}</td>
                  <td className={`px-4 py-2.5 ${txtFaint}`}>
                    {row.kind === "fixed" ? r.fixedExpenses : r.variableExpenses}
                  </td>
                  <td className={`px-4 py-2.5 text-end tabular-nums ${txt}`}>{fc(row.amount)}</td>
                  <td className={`px-4 py-2.5 text-end tabular-nums ${txtMuted}`}>
                    {f.total > 0 ? Math.round((row.amount / f.total) * 100) : 0}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>

      <GlassPanel variant="chartDark" isDark={isDark} className="p-0 overflow-hidden">
        <div className={`px-5 py-3.5 border-b ${borderSep}`}>
          <h3 className={`text-[13px] font-bold ${txt}`}>{r.expensesByCategory}</h3>
        </div>
        <div className="p-4 sm:p-5">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={f.months}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="month" {...angledAxisProps} />
              <YAxis {...axisProps} />
              <Tooltip content={<TooltipComp />} />
              <Bar dataKey="Rent" stackId="a" fill={EXPENSE_COLORS.Rent} />
              <Bar dataKey="Payroll" stackId="a" fill={EXPENSE_COLORS.Payroll} />
              <Bar dataKey="Utilities" stackId="a" fill={EXPENSE_COLORS.Utilities} />
              <Bar dataKey="Marketing" stackId="a" fill={EXPENSE_COLORS.Marketing} />
              <Bar dataKey="Supplies" stackId="a" fill={EXPENSE_COLORS.Supplies} />
              <Bar dataKey="Other" stackId="a" fill={EXPENSE_COLORS.Other} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassPanel>
    </div>
  );
};

export default ExpensesReport;
