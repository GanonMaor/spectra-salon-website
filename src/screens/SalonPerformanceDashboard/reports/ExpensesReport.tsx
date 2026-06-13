import React, { useMemo } from "react";
import { BriefcaseBusiness, Receipt, Scissors, ShieldCheck } from "lucide-react";
import { useCrmLocale } from "../../SalonCRM/i18n/CrmLocale";
import { GlassPanel, formatCrmCurrency, formatNumber } from "./ReportShared";
import { DateRange, MONTHLY_COMBINED, OPERATING_EXPENSE_RATE, filterMonthly } from "./AnalyticsMockData";

const EXPENSE_LINES = [
  { category: "Payroll", item: "Stylist salaries", type: "Fixed payroll", weight: 42, cadence: "Monthly", note: "Team salary base" },
  { category: "Payroll", item: "Commission bonuses", type: "Variable payroll", weight: 8, cadence: "Monthly", note: "Performance incentives" },
  { category: "Color Operations", item: "Foil paper", type: "Consumables", weight: 7, cadence: "Weekly", note: "Highlights and balayage work" },
  { category: "Styling", item: "Hair spray for updos", type: "Consumables", weight: 4, cadence: "Weekly", note: "Events and finishing" },
  { category: "Professional Equipment", item: "Tools & brushes", type: "Equipment", weight: 6, cadence: "Monthly", note: "Brushes, clips, bowls" },
  { category: "Maintenance", item: "Repairs", type: "Repairs", weight: 7, cadence: "As needed", note: "Chairs, sinks, electrical" },
  { category: "Software", item: "CRM and payment tools", type: "SaaS", weight: 5, cadence: "Monthly", note: "Salon operating stack" },
  { category: "Facilities", item: "Rent allocation", type: "Fixed overhead", weight: 12, cadence: "Monthly", note: "Salon floor allocation" },
  { category: "Utilities", item: "Water and electricity", type: "Utilities", weight: 5, cadence: "Monthly", note: "Color and washing stations" },
  { category: "Marketing", item: "Local campaigns", type: "Growth", weight: 4, cadence: "Monthly", note: "Instagram and referrals" },
];

const ExpensesReport: React.FC<{ dateRange: DateRange; isDark: boolean }> = ({ dateRange, isDark }) => {
  const { lang } = useCrmLocale();
  const fc = (v: number) => formatCrmCurrency(v, lang);

  const f = useMemo(() => {
    const months = filterMonthly(MONTHLY_COMBINED, dateRange);
    const revenue = months.reduce((sum, month) => sum + month.revenue, 0);
    const totalExpenses = Math.round(revenue * OPERATING_EXPENSE_RATE);
    const totalWeight = EXPENSE_LINES.reduce((sum, line) => sum + line.weight, 0);
    const rows = EXPENSE_LINES.map((line) => ({
      ...line,
      amount: Math.round((line.weight / totalWeight) * totalExpenses),
    }));
    const delta = totalExpenses - rows.reduce((sum, row) => sum + row.amount, 0);
    if (rows.length > 0) rows[0].amount += delta;
    const categoryMap = new Map<string, { category: string; amount: number; count: number }>();
    for (const row of rows) {
      const prev = categoryMap.get(row.category) || { category: row.category, amount: 0, count: 0 };
      categoryMap.set(row.category, { category: row.category, amount: prev.amount + row.amount, count: prev.count + 1 });
    }
    const categories = [...categoryMap.values()].sort((a, b) => b.amount - a.amount);
    return { revenue, totalExpenses, rows, categories, topCategory: categories[0] };
  }, [dateRange]);

  const txt = isDark ? "text-white" : "text-[#1A1A1A]";
  const txtMuted = isDark ? "text-gray-500" : "text-gray-500";
  const txtMid = isDark ? "text-gray-400" : "text-gray-600";
  const borderSep = isDark ? "border-white/[0.06]" : "border-black/[0.06]";
  const rowHover = isDark ? "hover:bg-white/[0.05]" : "hover:bg-black/[0.03]";

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { icon: Receipt, label: "Operating Overhead", value: fc(f.totalExpenses), sub: `Payroll, rent and utilities · ${Math.round(OPERATING_EXPENSE_RATE * 100)}%`, color: "from-rose-500 to-pink-600" },
          { icon: BriefcaseBusiness, label: "Top Category", value: f.topCategory?.category || "—", sub: f.topCategory ? fc(f.topCategory.amount) : "—", color: "from-violet-500 to-purple-600" },
          { icon: Scissors, label: "Consumables", value: fc(f.categories.filter(c => ["Color Operations", "Styling"].includes(c.category)).reduce((s, c) => s + c.amount, 0)), sub: "Foil, sprays, tools", color: "from-amber-500 to-orange-600" },
          { icon: ShieldCheck, label: "Expense Lines", value: formatNumber(f.rows.length), sub: "Tracked operating items", color: "from-emerald-500 to-teal-600" },
        ].map(({ icon: Icon, label, value, sub, color }) => (
          <GlassPanel key={label} variant="chartDark" isDark={isDark} className="p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className={`text-[11px] ${txtMuted} font-medium`}>{label}</p>
                <p className={`text-lg sm:text-xl font-bold ${txt} tracking-tight truncate`}>{value}</p>
                <p className={`text-[10px] ${txtMuted} mt-0.5`}>{sub}</p>
              </div>
            </div>
          </GlassPanel>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <GlassPanel variant="chartDark" isDark={isDark} className="p-0 overflow-hidden lg:col-span-1">
          <div className={`px-5 py-4 border-b ${borderSep}`}>
            <h3 className={`text-sm font-bold ${txt}`}>Expense Categories</h3>
            <p className={`text-[11px] ${txtMuted}`}>Operating expense allocation by area</p>
          </div>
          <div className="p-4 space-y-3">
            {f.categories.map((category) => {
              const pct = f.totalExpenses > 0 ? Math.round((category.amount / f.totalExpenses) * 100) : 0;
              return (
                <div key={category.category}>
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <span className={`text-xs font-semibold ${txt}`}>{category.category}</span>
                    <span className={`text-xs ${txtMid}`}>{pct}%</span>
                  </div>
                  <div className={`h-1.5 rounded-full ${isDark ? "bg-white/[0.06]" : "bg-black/[0.06]"} overflow-hidden`}>
                    <div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-400" style={{ width: `${pct}%` }} />
                  </div>
                  <p className={`mt-1 text-[10px] ${txtMuted}`}>{fc(category.amount)} · {category.count} lines</p>
                </div>
              );
            })}
          </div>
        </GlassPanel>

        <GlassPanel variant="chartDark" isDark={isDark} className="p-0 overflow-hidden lg:col-span-2">
          <div className={`px-5 py-4 border-b ${borderSep}`}>
            <h3 className={`text-sm font-bold ${txt}`}>Expense Detail</h3>
            <p className={`text-[11px] ${txtMuted}`}>Foil paper, sprays, professional equipment, repairs and payroll by category</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className={`border-b ${borderSep}`}>
                  {["Category", "Item", "Type", "Cadence", "Amount", "Note"].map((h) => (
                    <th key={h} className={`px-4 py-3 text-left text-[11px] uppercase tracking-wider ${txtMuted} font-semibold`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {f.rows.map((row) => (
                  <tr key={`${row.category}-${row.item}`} className={`border-b ${borderSep} ${rowHover}`}>
                    <td className={`px-4 py-3 font-semibold ${txt}`}>{row.category}</td>
                    <td className={`px-4 py-3 ${txtMid}`}>{row.item}</td>
                    <td className={`px-4 py-3 ${txtMuted}`}>{row.type}</td>
                    <td className={`px-4 py-3 ${txtMuted}`}>{row.cadence}</td>
                    <td className={`px-4 py-3 text-right font-bold ${txt}`}>{fc(row.amount)}</td>
                    <td className={`px-4 py-3 ${txtMuted}`}>{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
};

export default ExpensesReport;
