import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  STRATEGIC_FORECAST_MONTHS,
  STRATEGIC_FORECAST_YEARS,
  STRATEGIC_YEAR_RANGES,
  STRATEGIC_OPEX_CATEGORIES,
  STRATEGIC_CATEGORY_RND,
  STRATEGIC_CATEGORY_MS,
  STRATEGIC_CATEGORY_OPS,
  STRATEGIC_CATEGORY_MGMT,
  STRATEGIC_CATEGORY_ADMIN,
  buildDefaultStrategicAssumptions,
  computeStrategicForecast,
  validateStrategicAssumptions,
  loadStrategicState,
  saveStrategicState,
  sMoney,
  sMoneyShort,
  sInt,
  sIntShort,
  sPct,
  sPctFromRatio,
} from "./strategic-forecast-model";
import type {
  StrategicAssumptions,
  SalonProfile,
  SalonProfileId,
  DataSegment,
} from "./strategic-forecast-model";
import {
  generateFinancialModelRows,
  generateFinancialModelSummary,
  buildFinancialModelMonths,
} from "./financial-model-rows";
import type { FinancialModelBundle } from "./financial-model-rows";
import { FinancialModelDrawer } from "../InvestorPage/FinancialModelDrawer";
import {
  REVENUE_DATA,
  total2024,
  total2025,
  yoyGrowth,
  PRODUCT_KPI,
} from "../investor-shared/investor-metrics";
import rawMarketData from "../../data/market-intelligence.json";

// ── Visual tokens (mirror the operating-budget page) ────────────────

const PROFILE_COLORS: Record<SalonProfileId, string> = {
  solo:         "#A78BFA", // soft violet
  studio:       "#60A5FA", // sky blue
  professional: "#10B981", // emerald
  enterprise:   "#EAB776", // signature gold
};

const STREAM_COLORS = {
  base:        "#EAB776",
  aiBooking:   "#B18059",
  aiCredits:   "#C49A6C",
  pos:         "#10B981",
  data:        "#6366F1",
  marketplace: "#F59E0B",
  hardware:    "#F87171",
};

const DATA_SEGMENT_COLORS: Record<string, string> = {
  localDistributor:    "#A78BFA",
  regionalDistributor: "#60A5FA",
  majorBrand:          "#EAB776",
  strategicEnterprise: "#10B981",
};

// ── Tiny UI primitives ───────────────────────────────────────────────

const KPICard: React.FC<{
  label: string;
  value: string;
  sub?: string;
  accent?: "default" | "emerald" | "rose" | "violet" | "gold";
}> = ({ label, value, sub, accent = "default" }) => {
  const accentClass =
    accent === "emerald" ? "text-emerald-600"
    : accent === "rose" ? "text-rose-600"
    : accent === "violet" ? "text-violet-600"
    : accent === "gold" ? "text-[#B18059]"
    : "text-[#1A1A1A]";
  return (
    <div className="rounded-2xl bg-white border border-black/[0.06] shadow-sm px-5 py-5">
      <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#999]">{label}</div>
      <div className={`mt-2 text-[24px] font-light tabular-nums leading-none ${accentClass}`}>{value}</div>
      {sub && <div className="mt-1.5 text-[10px] uppercase tracking-[0.14em] text-[#BBB]">{sub}</div>}
    </div>
  );
};

const SectionHeader: React.FC<{ eyebrow: string; title: string; sub?: string }> = ({ eyebrow, title, sub }) => (
  <div className="flex items-baseline justify-between gap-3 mb-5 flex-wrap">
    <div>
      <div className="inline-flex items-center gap-2 mb-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#EAB776]/80" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#999]">{eyebrow}</span>
      </div>
      <h2 className="text-2xl sm:text-[26px] font-extralight tracking-[-0.01em] text-[#1A1A1A]">{title}</h2>
    </div>
    {sub && <div className="text-[11px] uppercase tracking-[0.14em] text-[#BBB] max-w-md text-right">{sub}</div>}
  </div>
);

const NumberInput: React.FC<{
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  prefix?: string;
  suffix?: string;
  ariaLabel?: string;
  className?: string;
}> = ({ value, onChange, step = 1, min, max, prefix, suffix, ariaLabel, className }) => {
  const [local, setLocal] = useState(String(value));
  useEffect(() => {
    setLocal(String(value));
  }, [value]);
  return (
    <div className={`inline-flex items-center gap-1 rounded-lg border border-black/[0.08] bg-white px-2 py-1 focus-within:border-[#B18059]/40 ${className ?? ""}`}>
      {prefix && <span className="text-[11px] text-[#999]">{prefix}</span>}
      <input
        type="number"
        aria-label={ariaLabel}
        value={local}
        step={step}
        min={min}
        max={max}
        onChange={(e) => setLocal(e.currentTarget.value)}
        onBlur={() => {
          const n = parseFloat(local);
          if (Number.isFinite(n)) onChange(n);
          else setLocal(String(value));
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.currentTarget as HTMLInputElement).blur();
        }}
        className="w-[78px] bg-transparent outline-none text-[13px] tabular-nums text-[#1A1A1A]"
      />
      {suffix && <span className="text-[11px] text-[#999]">{suffix}</span>}
    </div>
  );
};

// ── Tooltip for charts ──────────────────────────────────────────────

const ChartTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-xl bg-white shadow-lg border border-black/[0.06] px-3 py-2 text-[11px]">
      <div className="font-semibold text-[#1A1A1A] mb-1">{label}</div>
      <div className="space-y-0.5">
        {payload.map((p: any, idx: number) => (
          <div key={idx} className="flex items-center gap-2 tabular-nums">
            <span className="w-2 h-2 rounded-sm" style={{ background: p.color || p.fill }} />
            <span className="text-[#666]">{p.name}</span>
            <span className="ml-auto font-medium text-[#1A1A1A]">{sMoneyShort(p.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const CountTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-xl bg-white shadow-lg border border-black/[0.06] px-3 py-2 text-[11px]">
      <div className="font-semibold text-[#1A1A1A] mb-1">{label}</div>
      <div className="space-y-0.5">
        {payload.map((p: any, idx: number) => (
          <div key={idx} className="flex items-center gap-2 tabular-nums">
            <span className="w-2 h-2 rounded-sm" style={{ background: p.color || p.fill }} />
            <span className="text-[#666]">{p.name}</span>
            <span className="ml-auto font-medium text-[#1A1A1A]">{sIntShort(p.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Page ─────────────────────────────────────────────────────────────

export const StrategicForecastPage: React.FC = () => {
  const [state, setState] = useState<StrategicAssumptions>(() => loadStrategicState());
  const [hasHydrated, setHasHydrated] = useState(false);
  const [assumptionsOpen, setAssumptionsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"main" | "forecast">("main");

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    saveStrategicState(state);
  }, [state, hasHydrated]);

  const forecast = useMemo(() => computeStrategicForecast(state), [state]);
  const warnings = useMemo(() => validateStrategicAssumptions(state), [state]);
  const auditModel = useMemo<FinancialModelBundle>(
    () => ({
      forecast,
      months: buildFinancialModelMonths(forecast.monthLabels.length),
      rows: generateFinancialModelRows(state, forecast),
      summary: generateFinancialModelSummary(forecast),
    }),
    [state, forecast],
  );

  // ── Mutators ─────────────────────────────────────────────────────
  const patchProfile = (id: SalonProfileId, patch: Partial<SalonProfile>) =>
    setState((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  const patchSegment = (id: string, patch: Partial<DataSegment>) =>
    setState((prev) => ({
      ...prev,
      dataSegments: prev.dataSegments.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  const patchYearTarget = (yearIdx: number, value: number) =>
    setState((prev) => {
      const yearlySalonTargets = prev.yearlySalonTargets.slice();
      yearlySalonTargets[yearIdx] = Math.max(0, value);
      return { ...prev, yearlySalonTargets };
    });
  const patchDataCount = (yearIdx: number, value: number) =>
    setState((prev) => {
      const yearlyDataCustomers = prev.yearlyDataCustomers.slice();
      yearlyDataCustomers[yearIdx] = Math.max(0, value);
      return { ...prev, yearlyDataCustomers };
    });
  const patchTop = (patch: Partial<StrategicAssumptions>) =>
    setState((prev) => ({ ...prev, ...patch }));
  const patchOpex = (cat: keyof StrategicAssumptions["yearlyOpex"], yearIdx: number, value: number) =>
    setState((prev) => {
      const arr = prev.yearlyOpex[cat].slice();
      arr[yearIdx] = Math.max(0, value);
      return { ...prev, yearlyOpex: { ...prev.yearlyOpex, [cat]: arr } };
    });
  const resetAll = () => {
    if (typeof window !== "undefined" && !window.confirm("Reset all assumptions to Spectra defaults?")) return;
    setState(buildDefaultStrategicAssumptions());
  };

  // ── Derived display data ─────────────────────────────────────────
  const lastY = forecast.yearly[forecast.yearly.length - 1];
  const finalArr = lastY?.endingArr ?? 0;
  const finalMrr = lastY?.endingMrr ?? 0;
  const finalSalons = lastY?.endingSalons ?? 0;
  const finalDataCustomers = lastY?.endingDataCustomers ?? 0;
  const totalY6Revenue = lastY?.totalRevenue ?? 0;
  const finalGrossMargin = lastY?.grossMargin ?? 0;
  const recurringPct = lastY?.recurringPct ?? 0;
  const totalAcquisition = forecast.yearly.reduce((s, y) => s + y.acquisitionSpend, 0);
  const lastIdx = STRATEGIC_FORECAST_MONTHS - 1;
  const finalBlendedTotalArpu = forecast.blendedTotalArpu[lastIdx] ?? 0;
  const enterpriseShare =
    finalArr > 0
      ? ((forecast.byProfile.enterprise.recurringMrr[lastIdx] ?? 0) * 12) / finalArr
      : 0;
  const dataShare = finalArr > 0 ? (forecast.dataMrr[lastIdx] * 12) / finalArr : 0;

  // ── Chart data ───────────────────────────────────────────────────
  const arrChartData = forecast.yearly.map((y) => ({
    label: `Y${y.year}`,
    arr: Math.round(y.endingArr),
    revenue: Math.round(y.totalRevenue),
    grossProfit: Math.round(y.grossProfit),
    ebitda: Math.round(y.ebitda),
  }));

  const customersByProfileData = forecast.yearly.map((y) => {
    const row: Record<string, number | string> = { label: `Y${y.year}` };
    for (const p of state.profiles) row[p.displayName] = Math.round(y.endingCustomersByProfile[p.id] ?? 0);
    return row;
  });

  const revenueByProfileData = forecast.yearly.map((y) => {
    const row: Record<string, number | string> = { label: `Y${y.year}` };
    for (const p of state.profiles) {
      const series = forecast.byProfile[p.id];
      let total = 0;
      for (let i = y.startMonth; i < y.endMonth; i++) total += series.recurringMrr[i] ?? 0;
      row[p.displayName] = Math.round(total);
    }
    return row;
  });

  const revenueByStreamData = forecast.yearly.map((y) => ({
    label: `Y${y.year}`,
    "Base SaaS": Math.round(y.baseSaasRevenue),
    "AI Booking": Math.round(y.aiBookingRevenue),
    "AI Credits": Math.round(y.aiCreditsRevenue),
    "POS": Math.round(y.posRevenue),
    "Data": Math.round(y.dataRevenue),
    "Marketplace": Math.round(y.marketplaceRevenue),
    "Hardware": Math.round(y.hardwareRevenue),
  }));

  const dataRevenueBySegmentData = forecast.yearly.map((y) => {
    const row: Record<string, number | string> = { label: `Y${y.year}` };
    for (const seg of state.dataSegments) {
      const series = forecast.byDataSegment[seg.id];
      let total = 0;
      for (let i = y.startMonth; i < y.endMonth; i++) total += series.mrr[i] ?? 0;
      row[seg.displayName] = Math.round(total);
    }
    return row;
  });

  return (
    <div className="min-h-[100dvh] font-sans antialiased text-[#1A1A1A]" style={{ background: "#FAFAF8" }}>
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at top center, rgba(234,183,118,0.08) 0%, transparent 60%)",
        }}
      />

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 pt-16 pb-20">
        {/* ── Header ───────────────────────────────────────────────── */}
        <header className="mb-8 flex items-end justify-between gap-6 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 mb-5">
              <span className="w-1.5 h-1.5 bg-[#EAB776]/70 rounded-full" />
              <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#999]">
                {activeTab === "main" ? "Spectra AI" : "Strategic Forecast"}
              </span>
            </div>
            {activeTab === "main" ? (
              <h1 className="text-4xl sm:text-5xl font-extralight leading-[1.1] tracking-[-0.02em] text-[#1A1A1A]">
                Company{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EAB776] to-[#B18059]">
                  Achievements
                </span>
              </h1>
            ) : (
              <h1 className="text-4xl sm:text-5xl font-extralight leading-[1.1] tracking-[-0.02em] text-[#1A1A1A]">
                {STRATEGIC_FORECAST_YEARS}-Year{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EAB776] to-[#B18059]">
                  Strategic Plan
                </span>
              </h1>
            )}
            <p className="mt-4 text-base font-light max-w-2xl text-[#777] leading-relaxed">
              {activeTab === "main"
                ? "The salon industry is at a turning point. With strategic investment, Spectra AI is driving a game-changing shift — built by a hair colorist, for hair colorists."
                : "Customer Profile Mix, not a single magical ARPU. Solo distribution, Studio & Professional reliability, Enterprise revenue, and a tiered data-licensing book — all on one accelerated growth curve."}
            </p>
          </div>
          {activeTab === "forecast" && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={resetAll}
                className="text-xs font-semibold px-4 py-2 rounded-full border border-black/[0.08] bg-white text-[#777] hover:text-[#1A1A1A] hover:border-black/20 transition"
              >
                Reset
              </button>
              <a
                href="#assumptions"
                onClick={() => setAssumptionsOpen(true)}
                className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full text-white shadow-sm transition hover:opacity-95"
                style={{ background: "linear-gradient(135deg, #EAB776 0%, #B18059 100%)" }}
              >
                Edit assumptions ↓
              </a>
            </div>
          )}
        </header>

        {/* ── Tab switcher ─────────────────────────────────────────── */}
        <div className="mb-10 inline-flex items-center gap-1 rounded-full border border-black/[0.08] bg-white p-1 shadow-sm">
          {([
            { id: "main", label: "Company Achievements" },
            { id: "forecast", label: "Forecast" },
          ] as const).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                aria-pressed={isActive}
                className={`text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2 rounded-full transition ${
                  isActive
                    ? "text-white shadow-sm"
                    : "text-[#777] hover:text-[#1A1A1A]"
                }`}
                style={
                  isActive
                    ? { background: "linear-gradient(135deg, #EAB776 0%, #B18059 100%)" }
                    : undefined
                }
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "main" && (
          <CompanyAchievementsTab onOpenForecast={() => setActiveTab("forecast")} />
        )}

        {activeTab === "forecast" && (
        <>
        {/* ── KPIs ─────────────────────────────────────────────────── */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <KPICard label={`Year ${STRATEGIC_FORECAST_YEARS} ARR`} value={sMoneyShort(finalArr)} accent="gold" sub="recurring run-rate" />
          <KPICard label={`Year ${STRATEGIC_FORECAST_YEARS} MRR`} value={sMoneyShort(finalMrr)} sub="end-of-year run-rate" />
          <KPICard label={`Year ${STRATEGIC_FORECAST_YEARS} revenue`} value={sMoneyShort(totalY6Revenue)} sub="includes hardware" />
          <KPICard label="Salon customers" value={sIntShort(finalSalons)} accent="violet" sub="end-of-year" />
          <KPICard label="Data customers" value={sIntShort(finalDataCustomers)} accent="emerald" sub="end-of-year" />
          <KPICard label="Gross margin" value={sPctFromRatio(finalGrossMargin)} accent={finalGrossMargin >= 0.7 ? "emerald" : "default"} sub={`recurring ${sPctFromRatio(recurringPct)}`} />
        </section>

        {/* Validation strip */}
        {warnings.length > 0 && (
          <section className="mt-6 rounded-2xl border border-amber-300/50 bg-amber-50/70 px-5 py-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700 mb-1">
              Soft warnings
            </div>
            <ul className="space-y-1 text-[12px] text-amber-900">
              {warnings.map((w) => (
                <li key={w.field}>• {w.message}</li>
              ))}
            </ul>
            <div className="mt-2 text-[11px] text-amber-700/80">
              Calculations still proceed with the values you entered.
            </div>
          </section>
        )}

        {/* ── Trajectory chart ─────────────────────────────────────── */}
        <section className="mt-12">
          <SectionHeader
            eyebrow="Trajectory"
            title="ARR, revenue and EBITDA"
            sub={`6-year accelerated growth · ending ARR ${sMoneyShort(finalArr)}`}
          />
          <div
            className="rounded-2xl overflow-hidden border border-black/[0.06] shadow-sm"
            style={{
              background:
                "radial-gradient(ellipse at top right, rgba(234,183,118,0.08), transparent 55%), radial-gradient(ellipse at bottom left, rgba(16,185,129,0.05), transparent 55%), #FFFFFF",
            }}
          >
            <div className="p-4 sm:p-6">
              <div className="h-[20rem] sm:h-[24rem] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={arrChartData} margin={{ top: 16, right: 24, left: 4, bottom: 4 }}>
                    <defs>
                      <linearGradient id="grad-arr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#EAB776" stopOpacity={0.55} />
                        <stop offset="60%"  stopColor="#EAB776" stopOpacity={0.18} />
                        <stop offset="100%" stopColor="#EAB776" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="grad-revenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#B18059" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#B18059" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 6" stroke="#EEE" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#999" }} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#999" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => sMoneyShort(v)}
                      width={56}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#EAB776", strokeOpacity: 0.4, strokeDasharray: "3 4" }} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name="Total revenue"
                      stroke="#B18059"
                      strokeWidth={1.5}
                      fill="url(#grad-revenue)"
                      isAnimationActive={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="arr"
                      name="ARR"
                      stroke="#EAB776"
                      strokeWidth={2.5}
                      fill="url(#grad-arr)"
                      isAnimationActive={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="grossProfit"
                      name="Gross profit"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={{ r: 3, fill: "#10B981" }}
                      isAnimationActive={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="ebitda"
                      name="EBITDA"
                      stroke="#6366F1"
                      strokeWidth={2}
                      strokeDasharray="4 3"
                      dot={{ r: 3, fill: "#6366F1" }}
                      isAnimationActive={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        {/* ── Chart grid: customer mix + revenue mix ───────────────── */}
        <section className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-white border border-black/[0.06] shadow-sm p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#999] mb-1">Salon profile mix</div>
            <div className="text-[15px] font-light text-[#1A1A1A] mb-4">Customers by profile, year-end</div>
            <div className="h-[18rem]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={customersByProfileData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 6" stroke="#EEE" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#999" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#999" }} axisLine={false} tickLine={false} tickFormatter={(v) => sIntShort(v)} width={48} />
                  <Tooltip content={<CountTooltip />} cursor={{ fill: "rgba(234,183,118,0.08)" }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} iconSize={8} />
                  {state.profiles.map((p) => (
                    <Bar key={p.id} dataKey={p.displayName} stackId="profile" fill={PROFILE_COLORS[p.id]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-black/[0.06] shadow-sm p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#999] mb-1">Revenue by salon profile</div>
            <div className="text-[15px] font-light text-[#1A1A1A] mb-4">Recurring revenue, by year</div>
            <div className="h-[18rem]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByProfileData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 6" stroke="#EEE" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#999" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#999" }} axisLine={false} tickLine={false} tickFormatter={(v) => sMoneyShort(v)} width={56} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(234,183,118,0.08)" }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} iconSize={8} />
                  {state.profiles.map((p) => (
                    <Bar key={p.id} dataKey={p.displayName} stackId="rev" fill={PROFILE_COLORS[p.id]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-white border border-black/[0.06] shadow-sm p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#999] mb-1">Revenue streams</div>
            <div className="text-[15px] font-light text-[#1A1A1A] mb-4">Total revenue by stream, by year</div>
            <div className="h-[18rem]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByStreamData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 6" stroke="#EEE" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#999" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#999" }} axisLine={false} tickLine={false} tickFormatter={(v) => sMoneyShort(v)} width={56} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(234,183,118,0.08)" }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} iconSize={8} />
                  <Bar dataKey="Base SaaS"   stackId="r" fill={STREAM_COLORS.base} />
                  <Bar dataKey="AI Booking"  stackId="r" fill={STREAM_COLORS.aiBooking} />
                  <Bar dataKey="AI Credits"  stackId="r" fill={STREAM_COLORS.aiCredits} />
                  <Bar dataKey="POS"         stackId="r" fill={STREAM_COLORS.pos} />
                  <Bar dataKey="Data"        stackId="r" fill={STREAM_COLORS.data} />
                  <Bar dataKey="Marketplace" stackId="r" fill={STREAM_COLORS.marketplace} />
                  <Bar dataKey="Hardware"    stackId="r" fill={STREAM_COLORS.hardware} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-black/[0.06] shadow-sm p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#999] mb-1">Data revenue mix</div>
            <div className="text-[15px] font-light text-[#1A1A1A] mb-4">By data customer segment, by year</div>
            <div className="h-[18rem]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataRevenueBySegmentData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 6" stroke="#EEE" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#999" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#999" }} axisLine={false} tickLine={false} tickFormatter={(v) => sMoneyShort(v)} width={56} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(99,102,241,0.08)" }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} iconSize={8} />
                  {state.dataSegments.map((s) => (
                    <Bar key={s.id} dataKey={s.displayName} stackId="d" fill={DATA_SEGMENT_COLORS[s.id] ?? "#6366F1"} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* ── Year-by-year table ──────────────────────────────────── */}
        <section className="mt-14">
          <SectionHeader eyebrow="Strategic forecast" title="Year-by-year breakdown" />
          <YearlyForecastTable forecast={forecast} state={state} />
        </section>

        {/* ── Salon profiles detail ──────────────────────────────── */}
        <section className="mt-14">
          <SectionHeader
            eyebrow="Salon Customer Profiles"
            title="Profile mix → pricing → adoption → revenue"
            sub="Solo drives distribution. Enterprise drives ARPU."
          />
          <ProfileDetailGrid forecast={forecast} state={state} />
        </section>

        {/* ── Data segments detail ───────────────────────────────── */}
        <section className="mt-14">
          <SectionHeader
            eyebrow="Data Customer Segments"
            title="Tiered B2B revenue book"
            sub="Aggregated / anonymized live market intelligence only."
          />
          <DataSegmentDetail forecast={forecast} state={state} />
        </section>

        {/* ── Unit economics ─────────────────────────────────────── */}
        <section className="mt-14">
          <SectionHeader eyebrow="Unit economics" title="Key strategic metrics" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <KPICard label="Blended salon ARPU" value={sMoney(finalBlendedTotalArpu)} sub="Year 6 month-end" />
            <KPICard label="Subscription ARPU only" value={sMoney(forecast.blendedSubArpu[lastIdx] ?? 0)} sub="excludes AI / POS" />
            <KPICard label="Data blended ARPU" value={sMoney(forecast.dataBlendedArpu[lastIdx] ?? 0)} accent="violet" sub="per data customer / mo" />
            <KPICard label="% revenue · Enterprise Salon" value={sPctFromRatio(enterpriseShare)} accent="gold" sub="of Year 6 ARR" />
            <KPICard label="% revenue · Data" value={sPctFromRatio(dataShare)} accent="emerald" sub="of Year 6 ARR" />
            <KPICard label="Recurring revenue %" value={sPctFromRatio(recurringPct)} sub="Year 6 mix" />
            <KPICard label="6-year acquisition spend" value={sMoneyShort(totalAcquisition)} sub="from CAC × new salons" />
            <KPICard label="Year 6 EBITDA" value={sMoneyShort(lastY?.ebitda ?? 0)} accent={(lastY?.ebitda ?? 0) >= 0 ? "emerald" : "rose"} sub="gross profit − opex" />
          </div>
        </section>

        {/* ── Strategic narrative ────────────────────────────────── */}
        <section className="mt-14 rounded-2xl bg-white border border-black/[0.06] shadow-sm px-6 sm:px-8 py-7">
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#999] mb-2">
            Strategic narrative
          </div>
          <h3 className="text-[22px] font-extralight tracking-[-0.01em] text-[#1A1A1A] mb-4">
            Why segmented ARPU is more credible than a single blended ARPU
          </h3>
          <ul className="space-y-2 text-[13px] leading-relaxed text-[#444]">
            <li>• <span className="font-medium text-[#1A1A1A]">Solo</span> customers drive adoption and distribution. They are the largest cohort by count and the smallest by ARPU.</li>
            <li>• <span className="font-medium text-[#1A1A1A]">Studio</span> and <span className="font-medium text-[#1A1A1A]">Professional</span> salons create reliable subscription revenue at compounding scale.</li>
            <li>• <span className="font-medium text-[#1A1A1A]">Enterprise Salon</span> accounts are a small percentage of customers but contribute outsized revenue through AI Booking, POS take-rate, and higher feature usage.</li>
            <li>• <span className="font-medium text-[#1A1A1A]">Local distributors</span> create early data revenue and seed the data network.</li>
            <li>• <span className="font-medium text-[#1A1A1A]">Major color brands</span> and <span className="font-medium text-[#1A1A1A]">strategic enterprise</span> data customers may be few in number but become high-margin, high-value accounts.</li>
            <li>• Total revenue is the sum of base SaaS, AI Booking, AI Credits, POS take-rate, hardware, and tiered data licensing — not one magical ARPU.</li>
          </ul>
        </section>

        {/* ── 72-Month Audit Drawer ────────────────────────────────── */}
        <section id="audit" className="mt-16 scroll-mt-16">
          <SectionHeader
            eyebrow="Audit Layer"
            title="Full 72-month financial model"
            sub="Every monthly number — customers, SaaS, AI, POS, data, hardware, OPEX, EBITDA, cash."
          />
          <FinancialModelDrawer
            model={auditModel}
            theme="light"
            showRangeToggle={false}
            defaultOpen
            alwaysOpen
          />
        </section>

        {/* ── Editable assumptions (collapsed by default) ─────────── */}
        <section id="assumptions" className="mt-16 scroll-mt-16">
          <SectionHeader
            eyebrow="Assumptions"
            title="Edit the model"
            sub="All percentages, prices, adoption rates and yearly targets are editable."
          />
          <div className="rounded-2xl border border-black/[0.08] bg-white shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setAssumptionsOpen((v) => !v)}
              className="w-full flex items-center justify-between gap-4 px-5 sm:px-7 py-4 sm:py-5 text-left transition-colors hover:bg-black/[0.02]"
              aria-expanded={assumptionsOpen}
            >
              <div>
                <p className="text-sm sm:text-base font-semibold text-[#1A1A1A]">
                  {assumptionsOpen ? "Hide assumption editor" : "Open assumption editor"}
                </p>
                <p className="text-xs sm:text-sm mt-0.5 text-[#777]">
                  Profiles, pricing, targets, OPEX, marketplace, ramps · changes auto-save locally.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] uppercase tracking-[0.16em]"
                  style={{ borderColor: "#EAB77655", color: "#8A6540", background: "#EAB7761A" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#EAB776" }} />
                  Editor
                </span>
                <span
                  className={`text-xl transition-transform duration-200 text-[#999] ${assumptionsOpen ? "rotate-180" : ""}`}
                  aria-hidden
                >
                  ⌄
                </span>
              </div>
            </button>
            {assumptionsOpen && (
              <div className="border-t border-black/[0.06] p-5 sm:p-6 bg-[#FAFAF8]/40">
                <AssumptionsBlock
                  state={state}
                  patchProfile={patchProfile}
                  patchSegment={patchSegment}
                  patchYearTarget={patchYearTarget}
                  patchDataCount={patchDataCount}
                  patchTop={patchTop}
                  patchOpex={patchOpex}
                />
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setAssumptionsOpen(false);
                      if (typeof window !== "undefined") {
                        document.getElementById("assumptions")?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }
                    }}
                    className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full border border-black/[0.08] bg-white text-[#777] hover:text-[#1A1A1A] hover:border-black/20 transition"
                  >
                    Close editor
                    <span aria-hidden className="text-sm rotate-180">⌄</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        <div className="mt-10 text-center text-[10px] uppercase tracking-[0.2em] text-[#BBB]">
          Independent strategic model · stored locally · does not affect the operating budget.
        </div>
        </>
        )}
      </div>
    </div>
  );
};

// ── Company Achievements tab ─────────────────────────────────────────

const ACHIEVEMENT_KPIS: { label: string; value: string; sub?: string; accent?: "default" | "emerald" | "rose" | "violet" | "gold" }[] = [
  { label: "Annual Subscription Revenue", value: "$149K", sub: "from direct subscriptions", accent: "gold" },
  { label: "Active Subscriptions", value: "180", sub: "84 Israel · 96 US & UK", accent: "default" },
  { label: "Intl ARPU", value: "$58", sub: "per account / mo", accent: "violet" },
  { label: "Israel ARPU", value: "$68", sub: "per account / mo", accent: "emerald" },
];

const SOCIAL_KPIS: { label: string; value: string }[] = [
  { label: "Views (90 days)", value: "122K" },
  { label: "From ads", value: "81%" },
  { label: "Followers", value: "8K+" },
  { label: "Monthly profile views", value: "30K" },
];

const TRIPLE_BUNDLE_OFFERS: { title: string; desc: string }[] = [
  { title: "30-Day Free Trial", desc: "Full access, no commitment" },
  { title: "Free Equipment", desc: "Smart Scale + Premium Stand" },
  { title: "Custom Training", desc: "Complete onboarding included" },
];

const TRIPLE_BUNDLE_FUNNEL: {
  step: string;
  label: string;
  count: string;
  share: string;
  shareNote?: string;
  costLabel: string;
  costValue: string;
}[] = [
  { step: "Step 1", label: "Leads", count: "1,476", share: "100%", costLabel: "Cost per lead", costValue: "$25" },
  { step: "Step 2", label: "Trials", count: "301", share: "20.4%", shareNote: "of leads", costLabel: "Cost per trial", costValue: "$123" },
  { step: "Step 3", label: "Customers", count: "96", share: "6.5%", shareNote: "of leads", costLabel: "Cost per customer", costValue: "$385" },
];

const REELS: { src: string; label: string }[] = [
  { src: "/instagram-reel.mp4", label: "Color mixing workflow" },
  { src: "/instagram-reel2.mp4", label: "Real-time formula tracking" },
  { src: "/instagram-reel3.mp4", label: "Dashboard analytics" },
  { src: "/instagram-reel4.mp4", label: "iPad at color bar" },
  { src: "/instagram-reel5.mp4", label: "Stylist experience" },
  { src: "/instagram-reel6.mp4", label: "Salon operations" },
];

const marketDataSummary = (rawMarketData as {
  summary?: {
    totalCustomers?: number;
    totalVisits?: number;
    totalServices?: number;
    totalRevenue?: number;
    totalGrams?: number;
    totalBrands?: number;
    totalMonths?: number;
    dateRange?: { from?: string; to?: string };
  };
}).summary ?? {};

const DATA_MOAT_KPIS: { label: string; value: string; sub: string; accent?: "default" | "emerald" | "rose" | "violet" | "gold" }[] = [
  {
    label: "Salon accounts tracked",
    value: sIntShort(marketDataSummary.totalCustomers ?? 0),
    sub: "real salons and accounts",
    accent: "gold",
  },
  {
    label: "Client visits captured",
    value: sIntShort(marketDataSummary.totalVisits ?? 0),
    sub: "through daily salon work",
    accent: "violet",
  },
  {
    label: "Services tracked",
    value: sIntShort(marketDataSummary.totalServices ?? 0),
    sub: "ground-level workflows",
    accent: "emerald",
  },
  {
    label: "Grams measured",
    value: `${((marketDataSummary.totalGrams ?? 0) / 1_000_000).toFixed(1)}M`,
    sub: "actual product usage",
    accent: "gold",
  },
  {
    label: "Brands monitored",
    value: sIntShort(marketDataSummary.totalBrands ?? 0),
    sub: "color ecosystem coverage",
  },
  {
    label: "Operating history",
    value: `${sInt(marketDataSummary.totalMonths ?? 0)} mo`,
    sub: `${marketDataSummary.dateRange?.from ?? "Jan 2023"} to ${marketDataSummary.dateRange?.to ?? "Apr 2026"}`,
  },
];

type CustomerRecord = {
  country?: string;
  city?: string;
  topBrands?: string[];
  totalGrams?: number;
  colorServices?: number;
  highlightsServices?: number;
  tonerServices?: number;
  straighteningServices?: number;
};

const customerOverview = ((rawMarketData as { customerOverview?: CustomerRecord[] }).customerOverview ?? []) as CustomerRecord[];

const CITY_CANON: Record<string, string> = {
  "new jersy": "New Jersey",
  "new jersey": "New Jersey",
  "new york": "New York",
  "scottsdale": "Scottsdale, AZ",
  "scottsdale az": "Scottsdale, AZ",
  "san antonio": "San Antonio, TX",
  "san diago": "San Diego, CA",
  "san diego": "San Diego, CA",
  "weston fl": "Weston, FL",
  "weston": "Weston, FL",
  "knoxwille": "Knoxville, TN",
  "knoxville": "Knoxville, TN",
};

function canonCity(raw: string): string {
  const key = raw.replace(/-/g, " ").trim().toLowerCase();
  return CITY_CANON[key] ?? raw.replace(/-/g, " ").trim();
}

function cleanBrand(raw: string): string {
  return raw.replace(/\s*<[^>]+>/g, "").trim();
}

const BRAND_COLORS: Record<string, string> = {
  GOLDWELL: "#EAB776",
  SCHWARZKOPF: "#1A1A1A",
  REDKEN: "#E11D48",
  "BRAZILIAN BLOWOUT": "#10B981",
  WELLA: "#6366F1",
  LOREAL: "#B18059",
  "L'OREAL": "#B18059",
  KEUNE: "#A78BFA",
  PRAVANA: "#F59E0B",
};

function brandColor(name: string): string {
  return BRAND_COLORS[name.toUpperCase()] ?? "#B18059";
}

type ServiceKey = "color" | "highlights" | "toner" | "straightening";

const SERVICE_LABEL: Record<ServiceKey, string> = {
  color: "Color",
  highlights: "Highlights",
  toner: "Toner",
  straightening: "Straightening",
};

const SERVICE_COLOR: Record<ServiceKey, string> = {
  color: "#EAB776",
  highlights: "#A78BFA",
  toner: "#60A5FA",
  straightening: "#10B981",
};

type RegionRow = {
  city: string;
  grams: number;
  salons: number;
  topBrand: string;
  topService: ServiceKey;
  topServiceShare: number;
};

const US_REGION_DOMINANCE: RegionRow[] = (() => {
  const by: Record<string, {
    city: string;
    grams: number;
    salons: number;
    brands: Record<string, number>;
    services: Record<ServiceKey, number>;
  }> = {};
  for (const c of customerOverview) {
    if (c.country !== "USA") continue;
    if (!c.city || c.city === "Unknown") continue;
    const city = canonCity(c.city);
    const row = (by[city] ??= {
      city,
      grams: 0,
      salons: 0,
      brands: {},
      services: { color: 0, highlights: 0, toner: 0, straightening: 0 },
    });
    row.grams += c.totalGrams ?? 0;
    row.salons += 1;
    row.services.color += c.colorServices ?? 0;
    row.services.highlights += c.highlightsServices ?? 0;
    row.services.toner += c.tonerServices ?? 0;
    row.services.straightening += c.straighteningServices ?? 0;
    if (Array.isArray(c.topBrands)) {
      c.topBrands.slice(0, 3).forEach((b, i) => {
        const cb = cleanBrand(b);
        row.brands[cb] = (row.brands[cb] ?? 0) + (3 - i);
      });
    }
  }
  return Object.values(by)
    .map<RegionRow>((r) => {
      const topBrandEntry = Object.entries(r.brands).sort((a, b) => b[1] - a[1])[0];
      const services: [ServiceKey, number][] = [
        ["color", r.services.color],
        ["highlights", r.services.highlights],
        ["toner", r.services.toner],
        ["straightening", r.services.straightening],
      ];
      const topServiceEntry = services.sort((a, b) => b[1] - a[1])[0];
      const totalSvc = services.reduce((s, [, v]) => s + v, 0);
      return {
        city: r.city,
        grams: r.grams,
        salons: r.salons,
        topBrand: topBrandEntry?.[0] ?? "—",
        topService: topServiceEntry[0],
        topServiceShare: totalSvc > 0 ? Math.round((topServiceEntry[1] / totalSvc) * 100) : 0,
      };
    })
    .filter((r) => r.grams >= 1000)
    .sort((a, b) => b.grams - a.grams)
    .slice(0, 6);
})();

const US_GEO_TOTAL_KG = US_REGION_DOMINANCE.reduce((s, r) => s + r.grams, 0) / 1000;
const US_GEO_TOTAL_SALONS = US_REGION_DOMINANCE.reduce((s, r) => s + r.salons, 0);
const US_GEO_BRANDS = Array.from(new Set(US_REGION_DOMINANCE.map((r) => r.topBrand))).filter((b) => b !== "—");

function fmtKg(grams: number): string {
  return grams >= 100_000
    ? `${Math.round(grams / 1000).toLocaleString()} kg`
    : `${(grams / 1000).toFixed(1)} kg`;
}

const DATA_MOAT_POINTS: { title: string; body: string }[] = [
  {
    title: "Real salon-floor data",
    body: "Spectra captures what happens at the color bar itself: formulas, grams, brands, services, visits, colorists, and product behavior.",
  },
  {
    title: "Industry intelligence layer",
    body: "The raw workflow data becomes structured market intelligence for salons, distributors, and color brands.",
  },
  {
    title: "Compounding data moat",
    body: "Every new connected salon makes the dataset deeper, more accurate, and harder for any legacy player to replicate.",
  },
];

const ReelCard: React.FC<{ src: string; label: string }> = ({ src, label }) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setIsPlaying(true);
    } else {
      v.pause();
      setIsPlaying(false);
    }
  };
  return (
    <button
      type="button"
      onClick={togglePlay}
      className="relative rounded-2xl overflow-hidden border border-black/[0.06] bg-white shadow-sm group focus:outline-none focus:ring-2 focus:ring-[#EAB776]/40"
      style={{ aspectRatio: "9/16" }}
      aria-label={`Play ${label}`}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover"
        loop
        muted
        playsInline
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none" />
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-11 h-11 rounded-full bg-white/90 flex items-center justify-center shadow-md">
            <svg className="w-4 h-4 text-[#1A1A1A] ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}
      <div className="absolute bottom-2 left-2 right-2 text-left">
        <p className="text-white text-[11px] font-medium leading-tight drop-shadow">{label}</p>
      </div>
    </button>
  );
};

const CompanyAchievementsTab: React.FC<{ onOpenForecast: () => void }> = ({ onOpenForecast }) => {
  return (
    <div className="space-y-14">
      {/* ── KPIs ───────────────────────────────────────────────── */}
      <section>
        <SectionHeader
          eyebrow="Traction"
          title="Company achievements"
          sub={`Live revenue trajectory · YoY growth ${yoyGrowth}%`}
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {ACHIEVEMENT_KPIS.map((kpi) => (
            <KPICard key={kpi.label} label={kpi.label} value={kpi.value} sub={kpi.sub} accent={kpi.accent} />
          ))}
        </div>
      </section>

      {/* ── Revenue trajectory ─────────────────────────────────── */}
      <section>
        <SectionHeader
          eyebrow="Revenue trajectory"
          title="Monthly recurring revenue · 2024 – 2025"
          sub={`2024 ${"$" + Math.round(total2024 / 1000) + "K"} → 2025 ${"$" + Math.round(total2025 / 1000) + "K"}`}
        />
        <div
          className="rounded-2xl overflow-hidden border border-black/[0.06] shadow-sm"
          style={{
            background:
              "radial-gradient(ellipse at top right, rgba(234,183,118,0.08), transparent 55%), #FFFFFF",
          }}
        >
          <div className="p-5 sm:p-6">
            <div className="h-[18rem] sm:h-[20rem] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={REVENUE_DATA} margin={{ top: 8, right: 12, left: 0, bottom: 36 }}>
                  <defs>
                    <linearGradient id="achv-grad-il" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#EAB776" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#EAB776" stopOpacity={0.65} />
                    </linearGradient>
                    <linearGradient id="achv-grad-intl" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#B18059" stopOpacity={0.85} />
                      <stop offset="100%" stopColor="#B18059" stopOpacity={0.55} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 6" stroke="#EEE" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: "#999" }}
                    axisLine={false}
                    tickLine={false}
                    angle={-35}
                    textAnchor="end"
                    height={50}
                    interval={1}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#999" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => sMoneyShort(v)}
                    width={56}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(234,183,118,0.08)" }}
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid rgba(0,0,0,0.06)",
                      borderRadius: "12px",
                      fontSize: "11px",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                    }}
                    formatter={(value: number, name: string) => [
                      sMoneyShort(value),
                      name === "israel" ? "Israel" : "International",
                    ]}
                    labelStyle={{ fontWeight: 600, color: "#1A1A1A" }}
                  />
                  <Bar dataKey="israel" stackId="rev" fill="url(#achv-grad-il)" name="israel" />
                  <Bar dataKey="international" stackId="rev" fill="url(#achv-grad-intl)" name="international" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2 text-[11px] text-[#666]">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#EAB776" }} />
                Israel
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#666]">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#B18059" }} />
                International
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-black/[0.06] grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-[#999]">2024</div>
                <div className="mt-1 text-[18px] font-light tabular-nums text-[#1A1A1A]">{sMoneyShort(total2024)}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-[#999]">2025</div>
                <div className="mt-1 text-[18px] font-light tabular-nums text-[#1A1A1A]">{sMoneyShort(total2025)}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-[#999]">Growth</div>
                <div className="mt-1 text-[18px] font-light tabular-nums text-[#B18059]">+{yoyGrowth}%</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Customers love ─────────────────────────────────────── */}
      <section>
        <SectionHeader
          eyebrow="Product in the wild"
          title="Our customers love Spectra"
          sub={`Real engagement from ${PRODUCT_KPI.totalUniqueAccounts} accounts across ${PRODUCT_KPI.totalBrandsTracked} brands`}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="rounded-2xl bg-white border border-black/[0.06] shadow-sm p-6">
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#999] mb-3">The Problem</div>
            <h4 className="text-[18px] sm:text-[20px] font-extralight tracking-[-0.01em] text-[#1A1A1A] mb-3 leading-snug">
              Color is the salon's largest cost — and its largest blind spot.
            </h4>
            <p className="text-[13px] leading-relaxed text-[#444] mb-3">
              Salons spend heavily on color, but the real usage happens off the books — in bowls, formulas, and daily habits nobody can see.
            </p>
            <ul className="space-y-1.5 text-[13px] leading-relaxed text-[#444]">
              <li className="flex gap-2"><span className="text-[#999] mt-[2px]">•</span><span><span className="font-medium text-[#1A1A1A]">20–40% waste</span> from over-mixing, over-pouring, and inconsistent formulas.</span></li>
              <li className="flex gap-2"><span className="text-[#999] mt-[2px]">•</span><span><span className="font-medium text-[#1A1A1A]">Manual tracking</span> means owners only see the problem after the money is gone.</span></li>
              <li className="flex gap-2"><span className="text-[#999] mt-[2px]">•</span><span><span className="font-medium text-[#1A1A1A]">No ground-level data</span> by service, colorist, brand, client, or gram.</span></li>
            </ul>
          </div>
          <div
            className="rounded-2xl border border-[#EAB776]/30 shadow-sm p-6"
            style={{
              background:
                "radial-gradient(ellipse at top left, rgba(234,183,118,0.10), transparent 60%), #FFFFFF",
            }}
          >
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B18059] mb-3">The Solution</div>
            <h4 className="text-[18px] sm:text-[20px] font-extralight tracking-[-0.01em] text-[#1A1A1A] mb-3 leading-snug">
              An iPad at every color bar — and a clear answer for every owner.
            </h4>
            <p className="text-[13px] leading-relaxed text-[#444] mb-3">
              Spectra turns the color bar into a live operating system: every mix, gram, service, and product decision becomes usable business data.
            </p>
            <ul className="space-y-1.5 text-[13px] leading-relaxed text-[#444]">
              <li className="flex gap-2"><span className="text-[#B18059] mt-[2px]">•</span><span><span className="font-medium text-[#1A1A1A]">Track every formula</span> in seconds, tied to the client, colorist, brand, and cost.</span></li>
              <li className="flex gap-2"><span className="text-[#B18059] mt-[2px]">•</span><span><span className="font-medium text-[#1A1A1A]">Reduce waste</span> with smart mixing guidance and real-time gram tracking.</span></li>
              <li className="flex gap-2"><span className="text-[#B18059] mt-[2px]">•</span><span><span className="font-medium text-[#1A1A1A]">Give owners visibility</span> into margins, usage, waste, brands, and team behavior.</span></li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {SOCIAL_KPIS.map((kpi) => (
            <div key={kpi.label} className="rounded-2xl bg-white border border-black/[0.06] shadow-sm px-5 py-5">
              <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#999]">{kpi.label}</div>
              <div className="mt-2 text-[24px] font-light tabular-nums leading-none text-[#B18059]">{kpi.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {REELS.map((reel) => (
            <ReelCard key={reel.src} src={reel.src} label={reel.label} />
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <a
            href="https://www.instagram.com/spectra.ci"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-semibold px-5 py-2.5 rounded-full border border-black/[0.08] bg-white text-[#1A1A1A] hover:border-[#EAB776]/40 transition"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#EAB776]" />
            @spectra.ci · 8.2K followers
          </a>
        </div>
      </section>

      {/* ── Ground-level data moat ───────────────────────────────── */}
      <section>
        <SectionHeader
          eyebrow="Ground-level data moat"
          title="Spectra is becoming the data lake of the salon industry"
          sub="Real operating data from the salon floor, not surveys, invoices, or delayed distributor reports."
        />

        <div
          className="rounded-2xl overflow-hidden border border-black/[0.06] shadow-sm"
          style={{
            background:
              "radial-gradient(ellipse at top left, rgba(234,183,118,0.12), transparent 58%), radial-gradient(ellipse at bottom right, rgba(16,185,129,0.06), transparent 58%), #FFFFFF",
          }}
        >
          <div className="p-5 sm:p-7">
            <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-6 lg:gap-8 items-stretch">
              <div className="rounded-2xl border border-black/[0.06] bg-[#FAFAF8]/70 p-6 sm:p-7">
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B18059] mb-3">
                  Why this matters
                </div>
                <h3 className="text-[26px] sm:text-[32px] font-extralight tracking-[-0.02em] leading-tight text-[#1A1A1A] mb-4">
                  The strongest moat is the data nobody else can collect.
                </h3>
                <p className="text-[13px] sm:text-[14px] leading-relaxed text-[#444] mb-4">
                  Spectra captures the industry from the ground up. Every service, formula,
                  gram, brand, colorist, and client visit creates a real-time operating
                  dataset that legacy POS systems, distributors, and color brands do not own.
                </p>
                <p className="text-[13px] sm:text-[14px] leading-relaxed text-[#444]">
                  This is the data lake of the salon industry: live ground-level behavior
                  from the color bar itself. The more salons connect, the more valuable,
                  defensible, and impossible to replicate the network becomes.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {DATA_MOAT_KPIS.map((kpi) => (
                  <KPICard
                    key={kpi.label}
                    label={kpi.label}
                    value={kpi.value}
                    sub={kpi.sub}
                    accent={kpi.accent}
                  />
                ))}
              </div>
            </div>

            {US_REGION_DOMINANCE.length > 0 && (
              <div className="mt-6 rounded-2xl bg-white border border-black/[0.06] shadow-sm p-5 sm:p-6">
                <div className="flex items-baseline justify-between gap-3 flex-wrap mb-5">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B18059]">
                      US Region Intelligence
                    </div>
                    <h4 className="mt-1 text-[18px] sm:text-[20px] font-extralight tracking-[-0.01em] text-[#1A1A1A]">
                      Who leads where, and what they deliver
                    </h4>
                  </div>
                  <div className="text-[11px] uppercase tracking-[0.14em] text-[#BBB]">
                    {US_GEO_TOTAL_KG >= 100
                      ? `${Math.round(US_GEO_TOTAL_KG).toLocaleString()} kg`
                      : `${US_GEO_TOTAL_KG.toFixed(1)} kg`}
                    {" · "}
                    {US_GEO_TOTAL_SALONS} salons · {US_GEO_BRANDS.length} brands
                  </div>
                </div>

                <div className="hidden md:grid grid-cols-[1.4fr_1.4fr_1.4fr_0.9fr] gap-3 px-1 mb-2">
                  {["Region", "Top brand", "Top service", "Volume"].map((h) => (
                    <div key={h} className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#999]">
                      {h}
                    </div>
                  ))}
                </div>

                <ul className="space-y-2">
                  {US_REGION_DOMINANCE.map((row, idx) => {
                    const max = US_REGION_DOMINANCE[0]?.grams ?? 1;
                    const pct = max > 0 ? Math.max((row.grams / max) * 100, 4) : 0;
                    const bColor = brandColor(row.topBrand);
                    const sColor = SERVICE_COLOR[row.topService];
                    return (
                      <li
                        key={row.city}
                        className="grid grid-cols-2 md:grid-cols-[1.4fr_1.4fr_1.4fr_0.9fr] gap-3 items-center px-3 py-3 rounded-xl border border-black/[0.05] bg-[#FAFAF8]/50 hover:bg-[#FAFAF8] transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0 col-span-2 md:col-span-1">
                          <span className="text-[10px] tabular-nums text-[#BBB] w-4 flex-shrink-0">{idx + 1}</span>
                          <span className="text-[13px] font-medium text-[#1A1A1A] truncate">{row.city}</span>
                          <span className="text-[10px] text-[#999] flex-shrink-0">· {row.salons} {row.salons === 1 ? "salon" : "salons"}</span>
                        </div>

                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: bColor }}
                            aria-hidden
                          />
                          <span className="text-[12px] font-medium text-[#1A1A1A] truncate">{row.topBrand}</span>
                        </div>

                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium"
                            style={{
                              background: `${sColor}1A`,
                              color: "#1A1A1A",
                              border: `1px solid ${sColor}40`,
                            }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: sColor }} />
                            {SERVICE_LABEL[row.topService]}
                          </span>
                          <span className="text-[11px] text-[#999] tabular-nums">{row.topServiceShare}% share</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex-1 relative h-1.5 rounded-full bg-black/[0.05] overflow-hidden">
                            <div
                              className="absolute inset-y-0 left-0 rounded-full"
                              style={{
                                width: `${pct}%`,
                                background: "linear-gradient(90deg, #EAB776 0%, #B18059 100%)",
                              }}
                            />
                          </div>
                          <div className="text-[12px] font-medium tabular-nums text-[#1A1A1A] whitespace-nowrap">
                            {fmtKg(row.grams)}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <p className="mt-4 text-[11px] text-[#999] leading-relaxed">
                  Each region tells a different story — different leading brand, different leading service, different product volume.
                  Spectra is the only system that can see this resolution of the market in real time.
                </p>
              </div>
            )}

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {DATA_MOAT_POINTS.map((point, idx) => (
                <div key={point.title} className="rounded-2xl bg-white border border-black/[0.06] shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="w-7 h-7 rounded-full text-[11px] font-semibold flex items-center justify-center border border-[#EAB776]/30 text-[#B18059]"
                      style={{ background: "rgba(234,183,118,0.08)" }}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#999]">
                      Data advantage
                    </div>
                  </div>
                  <h4 className="text-[16px] font-medium text-[#1A1A1A] mb-2">{point.title}</h4>
                  <p className="text-[13px] leading-relaxed text-[#555]">{point.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Chapter divider: Product/Data → Go-to-market ─────────── */}
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.18)] px-5 sm:px-8 py-8 sm:py-10 bg-[#08090D]">
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse at top left, rgba(234,183,118,0.22), transparent 42%), radial-gradient(ellipse at bottom right, rgba(177,128,89,0.14), transparent 48%)",
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-3 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EAB776]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#EAB776]">
              Chapter 02 · Go-to-Market
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-[#EAB776]/35 to-transparent" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-7 lg:gap-10 items-end">
            <div>
              <h3 className="text-3xl sm:text-4xl font-extralight leading-tight tracking-[-0.03em] text-white">
                One year inside the target market.
                <br />
                One offer that proved demand.
              </h3>
              <p className="mt-4 text-[13px] sm:text-sm leading-relaxed text-white/60 max-w-xl">
                After proving product usage and data depth, Spectra tested the full commercial loop:
                targeted demand, a simple adoption offer, measured conversion, and clear unit economics.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Target market", value: "US salons", sub: "color-heavy operators" },
                { label: "Offer", value: "Triple Bundle", sub: "trial + equipment + training" },
                { label: "Result", value: "96 customers", sub: "from 1,476 leads" },
                { label: "Economics", value: "5.0x", sub: "LTV : CAC" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-4">
                  <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#EAB776]/80">
                    {item.label}
                  </div>
                  <div className="mt-2 text-[18px] sm:text-[20px] font-light leading-none text-white">
                    {item.value}
                  </div>
                  <div className="mt-2 text-[10px] leading-snug text-white/45">
                    {item.sub}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── The Triple Bundle ──────────────────────────────────── */}
      <section
        className="rounded-[2rem] border border-[#EAB776]/20 px-5 sm:px-7 py-6 sm:py-7 shadow-[0_18px_60px_rgba(177,128,89,0.08)]"
        style={{
          background:
            "radial-gradient(ellipse at top left, rgba(234,183,118,0.12), transparent 46%), linear-gradient(180deg, rgba(255,255,255,0.92), rgba(250,250,248,0.72))",
        }}
      >
        <SectionHeader
          eyebrow="Marketing breakthrough"
          title="The Triple Bundle"
          sub="One offer, proven funnel, strong unit economics"
        />
        <div className="rounded-2xl bg-white/85 border border-[#EAB776]/20 shadow-sm p-5 sm:p-7 backdrop-blur">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_auto_1fr] items-stretch gap-3 sm:gap-4">
            {TRIPLE_BUNDLE_OFFERS.map((offer, idx) => (
              <React.Fragment key={offer.title}>
                <div className="rounded-2xl border border-[#EAB776]/20 bg-gradient-to-br from-white to-[#FAF3E8]/70 px-5 py-6 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                  <div className="text-[16px] font-medium text-[#1A1A1A] mb-1.5">{offer.title}</div>
                  <div className="text-[12px] text-[#777] leading-relaxed">{offer.desc}</div>
                </div>
                {idx < TRIPLE_BUNDLE_OFFERS.length - 1 && (
                  <div className="hidden sm:flex items-center justify-center">
                    <span
                      className="w-7 h-7 rounded-full text-[#B18059] text-sm font-medium flex items-center justify-center border border-[#EAB776]/30"
                      style={{ background: "rgba(234,183,118,0.08)" }}
                    >
                      +
                    </span>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
          <p className="mt-5 text-[12px] text-[#777] text-center">
            This bundle accelerated new customer acquisition and ensured the smoothest possible system adoption.
          </p>
        </div>
      </section>

      {/* ── Funnel ─────────────────────────────────────────────── */}
      <section
        className="rounded-[2rem] border border-black/[0.04] px-5 sm:px-7 py-6 sm:py-7"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.78), rgba(250,250,248,0.42))",
        }}
      >
        <SectionHeader
          eyebrow="Triple Bundle sales performance funnel · 2025"
          title="Lead → trial → customer"
          sub="Conversion at every step is measured and tunable"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TRIPLE_BUNDLE_FUNNEL.map((step, idx) => (
            <div
              key={step.step}
              className="relative rounded-2xl border border-[#EAB776]/20 shadow-sm p-5 sm:p-6 overflow-hidden"
              style={{
                background:
                  "radial-gradient(ellipse at top right, rgba(234,183,118,0.11), transparent 56%), #FFFFFF",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EAB776]/80" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#999]">
                  {step.step} · {step.label}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-[36px] font-extralight tabular-nums leading-none text-[#1A1A1A]">{step.count}</div>
                <div className="text-[12px] font-medium text-[#B18059]">
                  {step.share}
                  {step.shareNote ? <span className="text-[#999] font-normal"> {step.shareNote}</span> : null}
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-black/[0.06]">
                <div className="text-[10px] uppercase tracking-[0.18em] text-[#999]">{step.costLabel}</div>
                <div className="mt-1 text-[18px] font-light tabular-nums text-[#1A1A1A]">{step.costValue}</div>
              </div>
              {idx < TRIPLE_BUNDLE_FUNNEL.length - 1 && (
                <div className="hidden md:flex absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 rounded-full border border-[#EAB776]/30 items-center justify-center"
                     style={{ background: "rgba(234,183,118,0.08)" }}>
                  <span className="text-[#B18059] text-sm leading-none">›</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Unit economics ─────────────────────────────────────── */}
      <section
        className="rounded-[2rem] border border-emerald-500/10 px-5 sm:px-7 py-6 sm:py-7"
        style={{
          background:
            "radial-gradient(ellipse at top right, rgba(16,185,129,0.06), transparent 48%), linear-gradient(180deg, rgba(255,255,255,0.86), rgba(250,250,248,0.58))",
        }}
      >
        <SectionHeader
          eyebrow="Unit economics"
          title="LTV : CAC at 5.0×"
          sub="Based on 3-year cohort LTV (conservative); high retention expected in years 4–5"
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          <KPICard label="Total CAC" value="$37K" accent="rose" sub="acquisition spend" />
          <KPICard label="3-Year LTV" value="$185K" sub="cohort revenue" />
          <KPICard label="Net LTV" value="$148K" accent="emerald" sub="LTV − CAC" />
          <KPICard label="LTV : CAC" value="5.0×" accent="gold" sub="cohort multiple" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white border border-black/[0.06] shadow-sm p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500/80" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#999]">CAC breakdown</span>
            </div>
            <div className="divide-y divide-black/[0.06]">
              {[
                { label: "Meta Ads (12 mo)", value: "$18,000" },
                { label: "Campaign Manager", value: "$15,000" },
                { label: "Equipment Gifts", value: "$4,000" },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between py-2.5 text-[13px]">
                  <span className="text-[#444]">{row.label}</span>
                  <span className="tabular-nums text-[#1A1A1A]">{row.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 pt-3 border-t-2 border-black/[0.08] flex items-center justify-between">
              <span className="text-[13px] font-semibold text-[#1A1A1A]">Total CAC</span>
              <span className="text-[18px] font-light tabular-nums text-rose-600">($37,000)</span>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-black/[0.06] shadow-sm p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#999]">Cohort LTV · 96 customers</span>
            </div>
            <div className="divide-y divide-black/[0.06]">
              {[
                { label: "2025 ARR", note: "Actual", value: "$64,728" },
                { label: "2026 ARR", note: "5% churn", value: "$61,492" },
                { label: "2027 ARR", note: "5% churn", value: "$58,417" },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between py-2.5 text-[13px]">
                  <span className="text-[#444]">
                    {row.label} <span className="text-[#999] text-[11px]">({row.note})</span>
                  </span>
                  <span className="tabular-nums text-[#1A1A1A]">{row.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 pt-3 border-t-2 border-black/[0.08] flex items-center justify-between">
              <span className="text-[13px] font-semibold text-[#1A1A1A]">3-Year LTV</span>
              <span className="text-[18px] font-light tabular-nums text-[#1A1A1A]">$184,637</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA into forecast ─────────────────────────────────── */}
      <section className="rounded-2xl border border-black/[0.06] shadow-sm p-6 sm:p-8 text-center"
               style={{ background: "radial-gradient(ellipse at top, rgba(234,183,118,0.10), transparent 60%), #FFFFFF" }}>
        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#999] mb-2">What comes next</div>
        <h3 className="text-[22px] sm:text-[26px] font-extralight tracking-[-0.01em] text-[#1A1A1A] mb-4">
          From traction to a {STRATEGIC_FORECAST_YEARS}-year strategic plan
        </h3>
        <button
          type="button"
          onClick={onOpenForecast}
          className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full text-white shadow-sm transition hover:opacity-95"
          style={{ background: "linear-gradient(135deg, #EAB776 0%, #B18059 100%)" }}
        >
          Open forecast →
        </button>
      </section>
    </div>
  );
};

// ── Yearly forecast table ────────────────────────────────────────────

const YearlyForecastTable: React.FC<{
  forecast: ReturnType<typeof computeStrategicForecast>;
  state: StrategicAssumptions;
}> = ({ forecast, state }) => {
  const rows: { label: string; values: (number | string)[]; tone?: "income" | "muted" | "result"; sub?: string }[] = [
    { label: "Total salon customers (year-end)", values: forecast.yearly.map((y) => sInt(y.endingSalons)) },
    { label: "Data customers (year-end)", values: forecast.yearly.map((y) => sInt(y.endingDataCustomers)) },
    { label: "Gross new salons (year)", values: forecast.yearly.map((y) =>
        sInt(state.profiles.reduce((s, p) => s + (y.newCustomersByProfile[p.id] ?? 0), 0))
      ),
      tone: "muted",
    },
    { label: "Base SaaS revenue", values: forecast.yearly.map((y) => sMoneyShort(y.baseSaasRevenue)), tone: "income" },
    { label: "AI Booking revenue", values: forecast.yearly.map((y) => sMoneyShort(y.aiBookingRevenue)), tone: "income" },
    { label: "AI Credits revenue", values: forecast.yearly.map((y) => sMoneyShort(y.aiCreditsRevenue)), tone: "income" },
    { label: "POS revenue", values: forecast.yearly.map((y) => sMoneyShort(y.posRevenue)), tone: "income", sub: `payment volume ${forecast.yearly.map((y) => sMoneyShort(y.paymentVolume)).join(" · ")}` },
    { label: "Data revenue", values: forecast.yearly.map((y) => sMoneyShort(y.dataRevenue)), tone: "income" },
    {
      label: `Marketplace revenue (${sPctFromRatio(state.marketplaceTakeRate)} affiliate)`,
      values: forecast.yearly.map((y) => sMoneyShort(y.marketplaceRevenue)),
      tone: "income",
      sub: `GMV ${forecast.yearly.map((y) => sMoneyShort(y.marketplaceGmv)).join(" · ")}`,
    },
    { label: "Hardware revenue (non-recurring)", values: forecast.yearly.map((y) => sMoneyShort(y.hardwareRevenue)), tone: "income" },
    { label: "Recurring revenue", values: forecast.yearly.map((y) => sMoneyShort(y.recurringRevenue)), tone: "result" },
    { label: "Total revenue", values: forecast.yearly.map((y) => sMoneyShort(y.totalRevenue)), tone: "result" },
    { label: "Gross profit", values: forecast.yearly.map((y) => sMoneyShort(y.grossProfit)), tone: "result" },
    { label: "Gross margin", values: forecast.yearly.map((y) => sPctFromRatio(y.grossMargin)) },
    { label: "Acquisition spend (CAC × new salons)", values: forecast.yearly.map((y) => sMoneyShort(y.acquisitionSpend)), tone: "muted" },
    { label: "Total opex (incl. acquisition)", values: forecast.yearly.map((y) => sMoneyShort(y.totalOpex)), tone: "muted" },
    { label: "EBITDA", values: forecast.yearly.map((y) => sMoneyShort(y.ebitda)), tone: "result" },
    { label: "Ending MRR", values: forecast.yearly.map((y) => sMoneyShort(y.endingMrr)), tone: "income" },
    { label: "Ending ARR", values: forecast.yearly.map((y) => sMoneyShort(y.endingArr)), tone: "income" },
  ];

  return (
    <div className="rounded-2xl overflow-hidden border border-black/[0.06] shadow-sm bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="bg-[#FAFAF8] border-b border-black/[0.06]">
              <th className="text-left px-4 py-3 font-semibold text-[10px] uppercase tracking-[0.18em] text-[#999]">Line</th>
              {forecast.yearRanges.map((r) => (
                <th key={r.year} className="text-right px-4 py-3 font-semibold text-[10px] uppercase tracking-[0.18em] text-[#999]">
                  <div>Year {r.year}</div>
                  <div className="text-[9px] tracking-[0.12em] text-[#BBB] font-normal">{r.range}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-black/[0.04] last:border-b-0">
                <td className={`px-4 py-2.5 ${row.tone === "result" ? "font-semibold text-[#1A1A1A]" : row.tone === "muted" ? "text-[#888]" : "text-[#333]"}`}>
                  {row.label}
                </td>
                {row.values.map((v, i) => (
                  <td
                    key={i}
                    className={`px-4 py-2.5 text-right tabular-nums ${
                      row.tone === "income" ? "text-emerald-700"
                      : row.tone === "result" ? "font-semibold text-[#1A1A1A]"
                      : row.tone === "muted" ? "text-[#888]"
                      : "text-[#333]"
                    }`}
                  >
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── Profile detail grid ─────────────────────────────────────────────

const ProfileDetailGrid: React.FC<{
  forecast: ReturnType<typeof computeStrategicForecast>;
  state: StrategicAssumptions;
}> = ({ forecast, state }) => {
  const lastIdx = STRATEGIC_FORECAST_MONTHS - 1;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {state.profiles.map((p) => {
        const series = forecast.byProfile[p.id];
        const endingCustomers = series.customers[lastIdx] ?? 0;
        const endingMrr = series.recurringMrr[lastIdx] ?? 0;
        const endingArpu = endingCustomers > 0 ? endingMrr / endingCustomers : 0;
        const totalHardwareUnits = forecast.yearly.reduce(
          (s, y) => s + (y.endingCustomersByProfile[p.id] !== undefined
            ? series.hardwareUnits.slice(y.startMonth, y.endMonth).reduce((a, b) => a + b, 0)
            : 0),
          0,
        );
        const totalHardwareRev = series.hardwareRevenue.reduce((s, v) => s + v, 0);
        return (
          <div key={p.id} className="rounded-2xl bg-white border border-black/[0.06] shadow-sm overflow-hidden">
            <div
              className="px-5 py-4 border-b border-black/[0.04]"
              style={{ background: `linear-gradient(90deg, ${PROFILE_COLORS[p.id]}18, transparent 60%)` }}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#999]">{p.legacyName}</div>
                  <div className="text-[18px] font-light text-[#1A1A1A]">{p.displayName}</div>
                  <div className="text-[11px] text-[#999]">{p.description}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-[#999]">Mix</div>
                  <div className="text-[20px] font-light tabular-nums text-[#1A1A1A]">{sPct(p.mixPct)}</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 px-5 py-4 text-[12px]">
              <DetailKV label="Customers · Y6" value={sInt(endingCustomers)} />
              <DetailKV label="MRR · Y6" value={sMoneyShort(endingMrr)} />
              <DetailKV label="Total ARPU · Y6" value={sMoney(endingArpu)} />
              <DetailKV
                label="Base price"
                value={
                  p.basePriceStartMonth > 1
                    ? `${sMoney(p.introBasePrice)} → ${sMoney(p.basePrice)}/mo from M${p.basePriceStartMonth}`
                    : `${sMoney(p.basePrice)}/mo`
                }
              />
              <DetailKV label="AI Booking" value={`${sMoney(p.aiBookingPrice)} · ${sPctFromRatio(p.aiBookingAdoption)}`} />
              <DetailKV label="AI Credits" value={`${sMoney(p.aiCreditsPrice)} · ${sPctFromRatio(p.aiCreditsAdoption)}`} />
              <DetailKV label="POS · take rate" value={`${sPctFromRatio(p.posAdoption)} · ${sPctFromRatio(state.posTakeRate)}`} />
              <DetailKV label="Marketplace · colorists" value={`${sInt(p.marketplaceColorists)} per salon`} />
              <DetailKV label="Marketplace revenue (6yr)" value={sMoneyShort(series.marketplaceRevenue.reduce((s, v) => s + v, 0))} />
              <DetailKV label="Hardware adoption" value={sPctFromRatio(p.hardwareAdoption)} />
              <DetailKV label="Hardware units (6yr)" value={sIntShort(totalHardwareUnits)} />
              <DetailKV label="Hardware revenue (6yr)" value={sMoneyShort(totalHardwareRev)} />
              <DetailKV label="CAC" value={sMoney(p.cac)} />
              <DetailKV label="Salon revenue assumed" value={`${sMoneyShort(p.posSalonRevenue)}/mo`} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const DetailKV: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <div className="text-[10px] uppercase tracking-[0.16em] text-[#BBB]">{label}</div>
    <div className="mt-0.5 tabular-nums text-[#1A1A1A]">{value}</div>
  </div>
);

// ── Data segment detail ──────────────────────────────────────────────

const DataSegmentDetail: React.FC<{
  forecast: ReturnType<typeof computeStrategicForecast>;
  state: StrategicAssumptions;
}> = ({ forecast, state }) => {
  const lastIdx = STRATEGIC_FORECAST_MONTHS - 1;
  const rows = state.dataSegments.map((s) => {
    const series = forecast.byDataSegment[s.id];
    const endingCustomers = series?.customers[lastIdx] ?? 0;
    const endingMrr = series?.mrr[lastIdx] ?? 0;
    const totalRevenue = series?.mrr.reduce((sum, v) => sum + v, 0) ?? 0;
    return { s, endingCustomers, endingMrr, totalRevenue };
  });
  return (
    <div className="rounded-2xl overflow-hidden border border-black/[0.06] shadow-sm bg-white">
      <table className="w-full text-[12px]">
        <thead>
          <tr className="bg-[#FAFAF8] border-b border-black/[0.06]">
            <th className="text-left px-4 py-3 font-semibold text-[10px] uppercase tracking-[0.18em] text-[#999]">Segment</th>
            <th className="text-right px-4 py-3 font-semibold text-[10px] uppercase tracking-[0.18em] text-[#999]">Mix</th>
            <th className="text-right px-4 py-3 font-semibold text-[10px] uppercase tracking-[0.18em] text-[#999]">Price / mo</th>
            <th className="text-right px-4 py-3 font-semibold text-[10px] uppercase tracking-[0.18em] text-[#999]">Customers · Y6</th>
            <th className="text-right px-4 py-3 font-semibold text-[10px] uppercase tracking-[0.18em] text-[#999]">MRR · Y6</th>
            <th className="text-right px-4 py-3 font-semibold text-[10px] uppercase tracking-[0.18em] text-[#999]">Revenue · 6 yr</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ s, endingCustomers, endingMrr, totalRevenue }) => (
            <tr key={s.id} className="border-b border-black/[0.04] last:border-b-0">
              <td className="px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-sm" style={{ background: DATA_SEGMENT_COLORS[s.id] ?? "#6366F1" }} />
                  <span className="text-[#1A1A1A] font-medium">{s.displayName}</span>
                </div>
                <div className="text-[10px] text-[#999] ml-4">{s.description}</div>
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums">{sPct(s.mixPct)}</td>
              <td className="px-4 py-2.5 text-right tabular-nums">{sMoney(s.monthlyPrice)}</td>
              <td className="px-4 py-2.5 text-right tabular-nums">{sInt(endingCustomers)}</td>
              <td className="px-4 py-2.5 text-right tabular-nums text-emerald-700">{sMoneyShort(endingMrr)}</td>
              <td className="px-4 py-2.5 text-right tabular-nums font-semibold">{sMoneyShort(totalRevenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ── Editable assumptions ────────────────────────────────────────────

interface AssumptionsBlockProps {
  state: StrategicAssumptions;
  patchProfile: (id: SalonProfileId, patch: Partial<SalonProfile>) => void;
  patchSegment: (id: string, patch: Partial<DataSegment>) => void;
  patchYearTarget: (yearIdx: number, value: number) => void;
  patchDataCount: (yearIdx: number, value: number) => void;
  patchTop: (patch: Partial<StrategicAssumptions>) => void;
  patchOpex: (cat: keyof StrategicAssumptions["yearlyOpex"], yearIdx: number, value: number) => void;
}

const AssumptionsBlock: React.FC<AssumptionsBlockProps> = ({
  state,
  patchProfile,
  patchSegment,
  patchYearTarget,
  patchDataCount,
  patchTop,
  patchOpex,
}) => {
  return (
    <div className="space-y-6">
      {/* Growth targets */}
      <div className="rounded-2xl bg-white border border-black/[0.06] shadow-sm p-5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#999] mb-3">Accelerated growth targets</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 items-end">
          <div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-[#BBB] mb-1">Starting salons</div>
            <NumberInput value={state.startingSalons} step={10} onChange={(v) => patchTop({ startingSalons: Math.max(0, v) })} />
          </div>
          {state.yearlySalonTargets.map((t, i) => (
            <div key={i}>
              <div className="text-[10px] uppercase tracking-[0.14em] text-[#BBB] mb-1">Year {i + 1} target</div>
              <NumberInput value={t} step={100} onChange={(v) => patchYearTarget(i, v)} />
            </div>
          ))}
        </div>
        <div className="mt-4 text-[11px] text-[#888] leading-relaxed">
          Customers ramp linearly to each year-end target. Acquisition spend is calculated as <span className="text-[#1A1A1A] font-medium">CAC × gross new salons</span> and is reported under Marketing &amp; Sales — it does not cap growth.
        </div>
      </div>

      {/* Salon profiles */}
      <div className="rounded-2xl bg-white border border-black/[0.06] shadow-sm p-5">
        <div className="flex items-baseline justify-between gap-3 mb-3 flex-wrap">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#999]">Salon Customer Profiles</div>
          <div className="text-[10px] uppercase tracking-[0.14em] text-[#BBB]">
            mix total {sPct(state.profiles.reduce((s, p) => s + p.mixPct, 0))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.14em] text-[#BBB]">
                <th className="text-left py-2 pr-3">Profile</th>
                <th className="text-right py-2 px-2">Mix %</th>
                <th className="text-right py-2 px-2">Base $</th>
                <th className="text-right py-2 px-2">Intro $</th>
                <th className="text-right py-2 px-2">Full from M</th>
                <th className="text-right py-2 px-2">AI Booking $</th>
                <th className="text-right py-2 px-2">AI Booking %</th>
                <th className="text-right py-2 px-2">AI Credits $</th>
                <th className="text-right py-2 px-2">AI Credits %</th>
                <th className="text-right py-2 px-2">POS rev $</th>
                <th className="text-right py-2 px-2">POS %</th>
                <th className="text-right py-2 px-2">Colorists</th>
                <th className="text-right py-2 px-2">HW %</th>
                <th className="text-right py-2 px-2">CAC $</th>
              </tr>
            </thead>
            <tbody>
              {state.profiles.map((p) => (
                <tr key={p.id} className="border-t border-black/[0.04]">
                  <td className="py-2 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-sm" style={{ background: PROFILE_COLORS[p.id] }} />
                      <div>
                        <div className="text-[#1A1A1A] font-medium">{p.displayName}</div>
                        <div className="text-[10px] text-[#999]">{p.legacyName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-2 text-right">
                    <NumberInput value={p.mixPct} step={1} onChange={(v) => patchProfile(p.id, { mixPct: v })} suffix="%" />
                  </td>
                  <td className="py-2 px-2 text-right">
                    <NumberInput value={p.basePrice} step={10} onChange={(v) => patchProfile(p.id, { basePrice: v })} prefix="$" />
                  </td>
                  <td className="py-2 px-2 text-right">
                    <NumberInput value={p.introBasePrice} step={5} min={0} onChange={(v) => patchProfile(p.id, { introBasePrice: Math.max(0, v) })} prefix="$" />
                  </td>
                  <td className="py-2 px-2 text-right">
                    <NumberInput
                      value={p.basePriceStartMonth}
                      step={1}
                      min={1}
                      max={STRATEGIC_FORECAST_MONTHS}
                      onChange={(v) => patchProfile(p.id, { basePriceStartMonth: Math.max(1, Math.min(STRATEGIC_FORECAST_MONTHS, Math.round(v))) })}
                      prefix="M"
                    />
                  </td>
                  <td className="py-2 px-2 text-right">
                    <NumberInput value={p.aiBookingPrice} step={5} onChange={(v) => patchProfile(p.id, { aiBookingPrice: v })} prefix="$" />
                  </td>
                  <td className="py-2 px-2 text-right">
                    <NumberInput value={Math.round(p.aiBookingAdoption * 100)} step={5} onChange={(v) => patchProfile(p.id, { aiBookingAdoption: v / 100 })} suffix="%" />
                  </td>
                  <td className="py-2 px-2 text-right">
                    <NumberInput value={p.aiCreditsPrice} step={5} onChange={(v) => patchProfile(p.id, { aiCreditsPrice: v })} prefix="$" />
                  </td>
                  <td className="py-2 px-2 text-right">
                    <NumberInput value={Math.round(p.aiCreditsAdoption * 100)} step={5} onChange={(v) => patchProfile(p.id, { aiCreditsAdoption: v / 100 })} suffix="%" />
                  </td>
                  <td className="py-2 px-2 text-right">
                    <NumberInput value={p.posSalonRevenue} step={500} onChange={(v) => patchProfile(p.id, { posSalonRevenue: v })} prefix="$" />
                  </td>
                  <td className="py-2 px-2 text-right">
                    <NumberInput value={Math.round(p.posAdoption * 100)} step={5} onChange={(v) => patchProfile(p.id, { posAdoption: v / 100 })} suffix="%" />
                  </td>
                  <td className="py-2 px-2 text-right">
                    <NumberInput
                      value={p.marketplaceColorists}
                      step={1}
                      min={0}
                      onChange={(v) => patchProfile(p.id, { marketplaceColorists: Math.max(0, Math.round(v)) })}
                    />
                  </td>
                  <td className="py-2 px-2 text-right">
                    <NumberInput value={Math.round(p.hardwareAdoption * 100)} step={5} onChange={(v) => patchProfile(p.id, { hardwareAdoption: v / 100 })} suffix="%" />
                  </td>
                  <td className="py-2 px-2 text-right">
                    <NumberInput value={p.cac} step={10} onChange={(v) => patchProfile(p.id, { cac: v })} prefix="$" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data segments */}
      <div className="rounded-2xl bg-white border border-black/[0.06] shadow-sm p-5">
        <div className="flex items-baseline justify-between gap-3 mb-3 flex-wrap">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#999]">Data Customer Segments</div>
          <div className="text-[10px] uppercase tracking-[0.14em] text-[#BBB]">
            mix total {sPct(state.dataSegments.reduce((s, p) => s + p.mixPct, 0))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-[#BBB] mb-1">Yearly data customers</div>
            <div className="flex items-center gap-2 flex-wrap">
              {state.yearlyDataCustomers.map((c, i) => (
                <div key={i} className="flex flex-col">
                  <span className="text-[9px] text-[#BBB] mb-0.5">Y{i + 1}</span>
                  <NumberInput value={c} step={1} onChange={(v) => patchDataCount(i, v)} />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.14em] text-[#BBB]">
                <th className="text-left py-2 pr-3">Segment</th>
                <th className="text-right py-2 px-2">Mix %</th>
                <th className="text-right py-2 px-2">Price / mo</th>
              </tr>
            </thead>
            <tbody>
              {state.dataSegments.map((s) => (
                <tr key={s.id} className="border-t border-black/[0.04]">
                  <td className="py-2 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-sm" style={{ background: DATA_SEGMENT_COLORS[s.id] ?? "#6366F1" }} />
                      <div>
                        <div className="text-[#1A1A1A] font-medium">{s.displayName}</div>
                        <div className="text-[10px] text-[#999]">{s.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-2 text-right">
                    <NumberInput value={s.mixPct} step={1} onChange={(v) => patchSegment(s.id, { mixPct: v })} suffix="%" />
                  </td>
                  <td className="py-2 px-2 text-right">
                    <NumberInput value={s.monthlyPrice} step={500} onChange={(v) => patchSegment(s.id, { monthlyPrice: v })} prefix="$" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Margins, hardware, churn */}
      <div className="rounded-2xl bg-white border border-black/[0.06] shadow-sm p-5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#999] mb-3">Margins, hardware, churn</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 items-end">
          <div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-[#BBB] mb-1">SaaS gross margin</div>
            <NumberInput value={Math.round(state.saasGrossMargin * 100)} step={1} onChange={(v) => patchTop({ saasGrossMargin: v / 100 })} suffix="%" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-[#BBB] mb-1">Data gross margin</div>
            <NumberInput value={Math.round(state.dataGrossMargin * 100)} step={1} onChange={(v) => patchTop({ dataGrossMargin: v / 100 })} suffix="%" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-[#BBB] mb-1">POS gross margin</div>
            <NumberInput value={Math.round(state.posGrossMargin * 100)} step={1} onChange={(v) => patchTop({ posGrossMargin: v / 100 })} suffix="%" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-[#BBB] mb-1">Spectra POS take rate</div>
            <NumberInput value={Math.round(state.posTakeRate * 1000) / 10} step={0.1} onChange={(v) => patchTop({ posTakeRate: v / 100 })} suffix="%" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-[#BBB] mb-1">Hardware price</div>
            <NumberInput value={state.hardwarePrice} step={50} onChange={(v) => patchTop({ hardwarePrice: v })} prefix="$" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-[#BBB] mb-1">Hardware cost</div>
            <NumberInput value={state.hardwareCost} step={25} onChange={(v) => patchTop({ hardwareCost: v })} prefix="$" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-[#BBB] mb-1">Hardware sales start</div>
            <NumberInput
              value={state.hardwareStartYear}
              step={1}
              min={1}
              max={STRATEGIC_FORECAST_YEARS}
              onChange={(v) => patchTop({ hardwareStartYear: Math.max(1, Math.min(STRATEGIC_FORECAST_YEARS, Math.round(v))) })}
              prefix="Y"
            />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-[#BBB] mb-1">Monthly churn</div>
            <NumberInput value={state.monthlyChurnPct} step={0.1} onChange={(v) => patchTop({ monthlyChurnPct: v })} suffix="%" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-[#BBB] mb-1">Seed investment</div>
            <NumberInput
              value={state.seedInvestment}
              step={50_000}
              min={0}
              onChange={(v) => patchTop({ seedInvestment: Math.max(0, v) })}
              prefix="$"
            />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-[#BBB] mb-1">POS start month</div>
            <NumberInput
              value={state.posStartMonth}
              step={1}
              min={1}
              max={STRATEGIC_FORECAST_MONTHS}
              onChange={(v) => patchTop({ posStartMonth: Math.max(1, Math.min(STRATEGIC_FORECAST_MONTHS, Math.round(v))) })}
              prefix="M"
            />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-[#BBB] mb-1">POS ramp length</div>
            <NumberInput
              value={state.posRampMonths}
              step={1}
              min={1}
              max={STRATEGIC_FORECAST_MONTHS}
              onChange={(v) => patchTop({ posRampMonths: Math.max(1, Math.round(v)) })}
              suffix=" mo"
            />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-[#BBB] mb-1">AI start month</div>
            <NumberInput
              value={state.aiStartMonth}
              step={1}
              min={1}
              max={STRATEGIC_FORECAST_MONTHS}
              onChange={(v) => patchTop({ aiStartMonth: Math.max(1, Math.min(STRATEGIC_FORECAST_MONTHS, Math.round(v))) })}
              prefix="M"
            />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-[#BBB] mb-1">AI ramp length</div>
            <NumberInput
              value={state.aiRampMonths}
              step={1}
              min={1}
              max={STRATEGIC_FORECAST_MONTHS}
              onChange={(v) => patchTop({ aiRampMonths: Math.max(1, Math.round(v)) })}
              suffix=" mo"
            />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-[#BBB] mb-1">Marketplace start month</div>
            <NumberInput
              value={state.marketplaceStartMonth}
              step={1}
              min={1}
              max={STRATEGIC_FORECAST_MONTHS}
              onChange={(v) => patchTop({ marketplaceStartMonth: Math.max(1, Math.min(STRATEGIC_FORECAST_MONTHS, Math.round(v))) })}
              prefix="M"
            />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-[#BBB] mb-1">Marketplace ramp length</div>
            <NumberInput
              value={state.marketplaceRampMonths}
              step={1}
              min={1}
              max={STRATEGIC_FORECAST_MONTHS}
              onChange={(v) => patchTop({ marketplaceRampMonths: Math.max(1, Math.round(v)) })}
              suffix=" mo"
            />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-[#BBB] mb-1">Spend / colorist / mo</div>
            <NumberInput
              value={state.marketplaceSpendPerColorist}
              step={50}
              min={0}
              onChange={(v) => patchTop({ marketplaceSpendPerColorist: Math.max(0, v) })}
              prefix="$"
            />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-[#BBB] mb-1">Affiliate take rate</div>
            <NumberInput
              value={Math.round(state.marketplaceTakeRate * 1000) / 10}
              step={0.5}
              min={0}
              onChange={(v) => patchTop({ marketplaceTakeRate: Math.max(0, v) / 100 })}
              suffix="%"
            />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-[#BBB] mb-1">Marketplace gross margin</div>
            <NumberInput
              value={Math.round(state.marketplaceGrossMargin * 100)}
              step={1}
              min={0}
              max={100}
              onChange={(v) => patchTop({ marketplaceGrossMargin: Math.max(0, Math.min(100, v)) / 100 })}
              suffix="%"
            />
          </div>
        </div>
      </div>

      {/* Yearly opex */}
      <div className="rounded-2xl bg-white border border-black/[0.06] shadow-sm p-5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#999] mb-3">
          Yearly operating expense (excludes acquisition spend)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.14em] text-[#BBB]">
                <th className="text-left py-2 pr-3">Category</th>
                {Array.from({ length: STRATEGIC_FORECAST_YEARS }).map((_, i) => (
                  <th key={i} className="text-right py-2 px-2">Y{i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <OpexRow label={STRATEGIC_CATEGORY_RND}   yearly={state.yearlyOpex.rnd}   onChange={(yi, v) => patchOpex("rnd", yi, v)} />
              <OpexRow label={STRATEGIC_CATEGORY_MS}    yearly={state.yearlyOpex.ms}    onChange={(yi, v) => patchOpex("ms", yi, v)} />
              <OpexRow label={STRATEGIC_CATEGORY_OPS}   yearly={state.yearlyOpex.ops}   onChange={(yi, v) => patchOpex("ops", yi, v)} />
              <OpexRow label={STRATEGIC_CATEGORY_MGMT}  yearly={state.yearlyOpex.mgmt}  onChange={(yi, v) => patchOpex("mgmt", yi, v)} />
              <OpexRow label={STRATEGIC_CATEGORY_ADMIN} yearly={state.yearlyOpex.admin} onChange={(yi, v) => patchOpex("admin", yi, v)} />
            </tbody>
          </table>
        </div>
        <div className="mt-3 text-[11px] text-[#888]">
          Categories mirror the operating-budget model: {STRATEGIC_OPEX_CATEGORIES.join(", ")}. Acquisition spend (CAC × new salons) is added on top of <span className="text-[#1A1A1A] font-medium">Marketing &amp; Sales</span> automatically.
        </div>
      </div>
    </div>
  );
};

const OpexRow: React.FC<{
  label: string;
  yearly: number[];
  onChange: (yearIdx: number, value: number) => void;
}> = ({ label, yearly, onChange }) => (
  <tr className="border-t border-black/[0.04]">
    <td className="py-2 pr-3 text-[#1A1A1A] font-medium">{label}</td>
    {yearly.map((v, i) => (
      <td key={i} className="py-2 px-2 text-right">
        <NumberInput value={v} step={50_000} onChange={(nv) => onChange(i, nv)} prefix="$" />
      </td>
    ))}
  </tr>
);
