import React, { useMemo } from "react";
import { Package, ShoppingBag, Sparkles, TrendingUp } from "lucide-react";
import { useCrmLocale } from "../../SalonCRM/i18n/CrmLocale";
import { GlassPanel, formatCrmCurrency, formatNumber } from "./ReportShared";
import { DateRange, MONTHLY_COMBINED, filterMonthly } from "./AnalyticsMockData";

const SALES_MIX = [
  { company: "Kérastase", series: "Nutritive", need: "Dry hair", product: "Nutritive care ritual", type: "Treatment retail", weight: 16, units: 92 },
  { company: "Kérastase", series: "Genesis", need: "Hair fall", product: "Genesis ampoules", type: "Ampoules", weight: 13, units: 74 },
  { company: "Kérastase", series: "Blond Absolu", need: "Blonde care", product: "Blond Absolu mask", type: "Home care", weight: 11, units: 66 },
  { company: "L'Oréal Professionnel", series: "Serie Expert", need: "Repair", product: "Absolut Repair", type: "Retail product", weight: 12, units: 83 },
  { company: "Olaplex", series: "Bond Maintenance", need: "Bond repair", product: "No.3 Hair Perfector", type: "Treatment retail", weight: 11, units: 58 },
  { company: "K18", series: "Molecular Repair", need: "Damage repair", product: "Leave-in mask", type: "Premium retail", weight: 10, units: 42 },
  { company: "Redken", series: "Acidic Bonding", need: "Acidic bonding", product: "Acidic Bonding set", type: "Home care", weight: 9, units: 51 },
  { company: "Moroccanoil", series: "Hydration", need: "Dry ends", product: "Treatment oil", type: "Retail product", weight: 8, units: 64 },
  { company: "Wella", series: "System Professional", need: "Scalp care", product: "Scalp ampoules", type: "Ampoules", weight: 6, units: 38 },
  { company: "Davines", series: "OI", need: "Shine", product: "OI All in One Milk", type: "Retail product", weight: 4, units: 32 },
];

const SalesReport: React.FC<{ dateRange: DateRange; isDark: boolean }> = ({ dateRange, isDark }) => {
  const { lang } = useCrmLocale();
  const fc = (v: number) => formatCrmCurrency(v, lang);

  const f = useMemo(() => {
    const months = filterMonthly(MONTHLY_COMBINED, dateRange);
    const serviceRevenue = months.reduce((sum, month) => sum + month.revenue, 0);
    const totalSales = Math.round(serviceRevenue * 0.16);
    const totalWeight = SALES_MIX.reduce((sum, item) => sum + item.weight, 0);
    const rows = SALES_MIX.map((item) => ({
      ...item,
      revenue: Math.round((item.weight / totalWeight) * totalSales),
      margin: Math.round(((item.weight / totalWeight) * totalSales) * 0.48),
    }));
    const delta = totalSales - rows.reduce((sum, row) => sum + row.revenue, 0);
    if (rows.length > 0) rows[0].revenue += delta;
    const totalUnits = rows.reduce((sum, row) => sum + row.units, 0);
    const companyMap = new Map<string, { company: string; revenue: number; units: number }>();
    for (const row of rows) {
      const prev = companyMap.get(row.company) || { company: row.company, revenue: 0, units: 0 };
      companyMap.set(row.company, { company: row.company, revenue: prev.revenue + row.revenue, units: prev.units + row.units });
    }
    const companies = [...companyMap.values()].sort((a, b) => b.revenue - a.revenue);
    return { totalSales, totalUnits, rows, companies, topCompany: companies[0] };
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
          { icon: ShoppingBag, label: "Retail Sales", value: fc(f.totalSales), sub: "Home care + treatments", color: "from-emerald-500 to-teal-600" },
          { icon: Package, label: "Units Sold", value: formatNumber(f.totalUnits), sub: "Products and ampoules", color: "from-violet-500 to-purple-600" },
          { icon: TrendingUp, label: "Avg Retail Ticket", value: fc(f.totalUnits > 0 ? f.totalSales / f.totalUnits : 0), sub: "Per sold unit", color: "from-amber-500 to-orange-600" },
          { icon: Sparkles, label: "Top Company", value: f.topCompany?.company || "—", sub: f.topCompany ? fc(f.topCompany.revenue) : "—", color: "from-pink-500 to-rose-600" },
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

      <GlassPanel variant="chartDark" isDark={isDark} className="p-0 overflow-hidden">
        <div className={`px-5 py-4 border-b ${borderSep}`}>
          <h3 className={`text-sm font-bold ${txt}`}>Sales by Company & Series</h3>
          <p className={`text-[11px] ${txtMuted}`}>Care products, ampoules and retail add-ons by brand family and hair need</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className={`border-b ${borderSep}`}>
                {["Company", "Series", "Hair Need", "Product", "Type", "Units", "Revenue", "Margin"].map((h) => (
                  <th key={h} className={`px-4 py-3 text-left text-[11px] uppercase tracking-wider ${txtMuted} font-semibold`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {f.rows.map((row) => (
                <tr key={`${row.company}-${row.series}-${row.product}`} className={`border-b ${borderSep} ${rowHover}`}>
                  <td className={`px-4 py-3 font-semibold ${txt}`}>{row.company}</td>
                  <td className={`px-4 py-3 ${txtMid}`}>{row.series}</td>
                  <td className={`px-4 py-3 ${txtMid}`}>{row.need}</td>
                  <td className={`px-4 py-3 ${txtMid}`}>{row.product}</td>
                  <td className={`px-4 py-3 ${txtMuted}`}>{row.type}</td>
                  <td className={`px-4 py-3 text-right ${txtMid}`}>{formatNumber(row.units)}</td>
                  <td className={`px-4 py-3 text-right font-bold ${txt}`}>{fc(row.revenue)}</td>
                  <td className="px-4 py-3 text-right text-emerald-400 font-bold">{fc(row.margin)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </div>
  );
};

export default SalesReport;
