import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Users,
  Award,
  TrendingUp,
  Star,
  Activity,
  Target,
} from "lucide-react";
import { GlassPanel, formatCurrency, formatNumber, DarkChartTooltip, DarkLegend, DARK_AXIS, DARK_GRID, DARK_XAXIS_ANGLED } from "./ReportShared";
import {
  DateRange,
  STAFF,
  MONTHLY_STAFF,
  filterMonthly,
} from "./AnalyticsMockData";

const fc = (v: number) => formatCurrency(v, "ILS");

const StaffPerformanceReport: React.FC<{ dateRange: DateRange }> = ({ dateRange }) => {
  const f = useMemo(() => {
    const months = filterMonthly(MONTHLY_STAFF, dateRange);

    const staffAppts: Record<string, number> = {};
    for (const row of months) {
      for (const s of STAFF) {
        if (!staffAppts[s.id]) staffAppts[s.id] = 0;
        staffAppts[s.id] += (row[s.id] as number) || 0;
      }
    }

    const staffWithFiltered = STAFF.map(s => ({
      ...s,
      appointments: staffAppts[s.id] || 0,
      revenue: s.appointments > 0 ? Math.round(s.revenue * ((staffAppts[s.id] || 0) / s.appointments)) : 0,
    }));

    const totalAppts = staffWithFiltered.reduce((sum, s) => sum + s.appointments, 0);
    const totalRevenue = staffWithFiltered.reduce((sum, s) => sum + s.revenue, 0);
    const avgUtilization = Math.round(STAFF.reduce((sum, s) => sum + s.utilization, 0) / STAFF.length);
    const avgRating = +(STAFF.reduce((sum, s) => sum + s.rating, 0) / STAFF.length).toFixed(1);

    const monthlyTotalData = months.map((row) => ({
      month: row.month,
      total: STAFF.reduce((sum, s) => sum + ((row[s.id] as number) || 0), 0),
    }));

    return { months, staffWithFiltered, totalAppts, totalRevenue, avgUtilization, avgRating, monthlyTotalData };
  }, [dateRange]);

  const rankedStaff = [...f.staffWithFiltered].sort((a, b) => b.revenue - a.revenue);

  const comparisonData = rankedStaff.map((s) => ({
    name: s.name.split(" ")[0],
    appointments: s.appointments,
    revenue: s.revenue,
    color: s.color,
  }));

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ── KPI Summary ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {([
          { icon: Users,      label: "Total Appointments", value: formatNumber(f.totalAppts), gradient: "from-violet-500 to-purple-600" },
          { icon: TrendingUp, label: "Total Revenue",      value: fc(f.totalRevenue),         gradient: "from-emerald-500 to-teal-600" },
          { icon: Target,     label: "Avg Utilization",    value: `${f.avgUtilization}%`,     gradient: "from-blue-500 to-indigo-600" },
          { icon: Star,       label: "Avg Rating",         value: f.avgRating.toFixed(1),     gradient: "from-amber-500 to-orange-600" },
        ] as const).map(({ icon: Icon, label, value, gradient }) => (
          <GlassPanel key={label} variant="chartDark" className="p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`} style={{ boxShadow: "0 0 16px rgba(0,0,0,0.3)" }}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[11px] text-gray-500 font-medium">{label}</p>
                <p className="text-lg sm:text-xl font-bold text-white tracking-tight">{value}</p>
              </div>
            </div>
          </GlassPanel>
        ))}
      </div>

      {/* ── Staff Ranking Cards ─────────────────────────── */}
      <GlassPanel variant="chartDark" className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Award className="w-3.5 h-3.5 text-white" />
          </div>
          <h3 className="text-[14px] font-bold text-white">Staff Ranking</h3>
          <span className="text-[11px] text-gray-500 ml-1">by revenue</span>
        </div>

        <div className="space-y-3">
          {rankedStaff.map((s, i) => (
            <div
              key={s.id}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.04] hover:bg-white/[0.08] transition-all duration-300 p-4"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                  style={{ backgroundColor: s.color, boxShadow: `0 0 14px ${s.color}40` }}
                >
                  #{i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[14px] font-bold text-white">{s.name}</p>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        s.trend >= 0 ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"
                      }`}
                    >
                      {s.trend >= 0 ? "+" : ""}{s.trend}%
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">{s.role}</p>
                </div>

                {/* Desktop metrics */}
                <div className="hidden sm:grid grid-cols-4 gap-6 text-center flex-shrink-0">
                  <div>
                    <p className="text-[10px] text-gray-500 mb-0.5">Appointments</p>
                    <p className="text-sm font-bold text-white">{s.appointments}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 mb-0.5">Revenue</p>
                    <p className="text-sm font-bold text-white">{fc(s.revenue)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 mb-0.5">Utilization</p>
                    <p className="text-sm font-bold text-white">{s.utilization}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 mb-0.5">Rating</p>
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <p className="text-sm font-bold text-white">{s.rating}</p>
                    </div>
                  </div>
                </div>

                {/* Mobile compact */}
                <div className="sm:hidden text-right flex-shrink-0">
                  <p className="text-[14px] font-bold text-white">{fc(s.revenue)}</p>
                  <p className="text-[10px] text-gray-500">{s.appointments} appts</p>
                </div>
              </div>

              {/* Utilization bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] text-gray-500 font-medium">Utilization</span>
                  <span className="text-[9px] text-gray-400 font-semibold">{s.utilization}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${s.utilization}%`, backgroundColor: s.color }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassPanel>

      {/* ── Charts Row ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Appointments Comparison */}
        <GlassPanel variant="chartDark" className="p-0 overflow-hidden">
          <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-b border-white/[0.06] flex items-center gap-2.5">
            <Activity className="w-4 h-4 text-blue-400" style={{ filter: "drop-shadow(0 0 6px rgba(96,165,250,0.5))" }} />
            <h3 className="text-[13px] font-bold text-white">Appointments by Staff</h3>
            <span className="text-[10px] text-gray-500 ml-1">comparative volume</span>
          </div>
          <div className="p-4 sm:p-6">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={comparisonData} layout="vertical" margin={{ left: 10 }}>
                <defs>
                  {comparisonData.map((entry, i) => (
                    <linearGradient key={`staffBar-${i}`} id={`staffBar-${i}`} x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={entry.color} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={entry.color} stopOpacity={0.85} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid {...DARK_GRID} horizontal={false} />
                <XAxis type="number" {...DARK_AXIS} />
                <YAxis type="category" dataKey="name" {...DARK_AXIS} style={{ fontSize: "11px", fontWeight: 600 }} width={60} />
                <Tooltip content={<DarkChartTooltip />} />
                <Bar dataKey="appointments" name="Appointments" radius={[4, 10, 10, 4]} barSize={20}>
                  {comparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`url(#staffBar-${index})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        {/* Monthly Trend */}
        <GlassPanel variant="chartDark" className="p-0 overflow-hidden">
          <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" style={{ filter: "drop-shadow(0 0 6px rgba(16,185,129,0.5))" }} />
              <h3 className="text-[13px] font-bold text-white">Monthly Appointments</h3>
            </div>
            <DarkLegend items={[{ label: "Appointments", color: "#10B981" }]} />
          </div>
          <div className="p-4 sm:p-6">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={f.monthlyTotalData}>
                <defs>
                  <linearGradient id="staffTrendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.40} />
                    <stop offset="50%" stopColor="#10B981" stopOpacity={0.10} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <filter id="staffGlow">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>
                <CartesianGrid {...DARK_GRID} />
                <XAxis dataKey="month" {...DARK_XAXIS_ANGLED} height={44} />
                <YAxis {...DARK_AXIS} />
                <Tooltip content={<DarkChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Appointments"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fill="url(#staffTrendGrad)"
                  dot={{ r: 3.5, fill: "#10B981", stroke: "rgba(16,185,129,0.3)", strokeWidth: 4 }}
                  filter="url(#staffGlow)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
};

export default StaffPerformanceReport;
