import React, { useEffect, useMemo, useState } from "react";
import {
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  REVENUE_DATA,
  total2024,
  total2025,
  yoyGrowth,
  PRODUCT_KPI,
} from '../investor-shared/investor-metrics';
import { useFinancialForecastSnapshot } from '../FinancialForecast/useFinancialForecastSnapshot';
import {
  loadStrategicState,
  generateFinancialModel,
  STRATEGIC_FORECAST_YEARS,
} from '../StrategicForecast';
import type { StrategicAssumptions } from '../StrategicForecast';
import { FinancialModelDrawer } from './FinancialModelDrawer';

// ============================================================================
// DESIGN TOKENS - Minimalist Apple-inspired
// ============================================================================
const tokens = {
  colors: {
    white: "#FFFFFF",
    black: "#000000",
    charcoal: "#1D1D1F",
    lightGray: "#F5F5F5",
    mediumGray: "#86868B",
    green: "#34C759",
    amber: "#FF9500",
  },
  spacing: {
    slidePadding: "clamp(32px, 8vw, 120px)",
    slideGap: "clamp(80px, 12vh, 160px)",
  },
  typography: {
    hero: "clamp(48px, 7vw, 72px)",
    h1: "clamp(32px, 5vw, 48px)",
    h2: "clamp(24px, 3.5vw, 32px)",
    body: "clamp(16px, 2vw, 18px)",
    small: "clamp(12px, 1.5vw, 14px)",
  },
};

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface SlideProps {
  children: React.ReactNode;
  bgColor?: string;
  footer?: string;
}

const Slide: React.FC<SlideProps> = ({ children, bgColor = tokens.colors.white, footer }) => (
  <section
    className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden overflow-x-hidden px-3 sm:px-[var(--slide-pad)] py-[var(--slide-pad)]"
    style={{
      background: bgColor,
      ["--slide-pad" as string]: tokens.spacing.slidePadding,
    }}
  >
    <div className="w-full max-w-[1400px] mx-auto flex-1 flex flex-col justify-center px-1 sm:px-0">
      {children}
    </div>
    {footer && (
      <p className="absolute bottom-4 left-0 right-0 text-center text-xs text-gray-400 px-4">
        {footer}
      </p>
    )}
  </section>
);

interface SlideHeaderProps {
  title: string;
  align?: "left" | "center";
}

const SlideHeader: React.FC<SlideHeaderProps> = ({ title, align = "left" }) => (
  <h2
    className={`font-bold tracking-tight mb-8 sm:mb-12 ${align === "center" ? "text-center" : "text-left"}`}
    style={{ fontSize: tokens.typography.h1, lineHeight: 1.1, color: tokens.colors.charcoal }}
  >
    {title}
  </h2>
);

interface StatCardProps {
  label: string;
  value: string;
  sublabel?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, sublabel }) => (
  <div className="p-4 sm:p-6 bg-white/10 backdrop-blur rounded-xl border border-white/20">
    <p className="text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">
      {label}
    </p>
    <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-1">{value}</p>
    {sublabel && <p className="text-xs sm:text-sm text-gray-400">{sublabel}</p>}
  </div>
);

const money = (value: number) =>
  Number.isFinite(value)
    ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Math.round(value))
    : "—";

const shortMoney = (value: number) => {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}M`;
  if (abs >= 1_000) return `$${Math.round(value / 1_000).toLocaleString()}K`;
  return money(value);
};

const int = (value: number) =>
  Number.isFinite(value)
    ? Math.round(value).toLocaleString("en-US")
    : "—";

const dec1 = (value: number) =>
  Number.isFinite(value)
    ? value.toFixed(1)
    : "—";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const NewInvestorsDeck: React.FC = () => {
  const [showVision, setShowVision] = useState(false);
  const [showVisionGate, setShowVisionGate] = useState(false);
  const [visionCode, setVisionCode] = useState("");
  const [visionCodeError, setVisionCodeError] = useState("");
  const forecastSnapshot = useFinancialForecastSnapshot();
  // Strategic forecast (72-month) — single source of truth for the
  // Growth Model section. We load once on mount; if the user has edited
  // assumptions on `/strategic-forecast`, those flow through localStorage.
  const [strategicState, setStrategicState] = useState<StrategicAssumptions | null>(null);
  useEffect(() => {
    setStrategicState(loadStrategicState());
  }, []);
  const strategicModel = useMemo(
    () => (strategicState ? generateFinancialModel(strategicState) : null),
    [strategicState],
  );
  const strategicSummary = strategicModel?.summary;

  const seedRaiseUsd = strategicSummary?.seedInvestment ?? 500_000;
  const currentArr = forecastSnapshot.state.business.currentMrrUsd * 12;
  const netCashAfterTrough = seedRaiseUsd + forecastSnapshot.peakCashTroughUsd;
  const growthMultiple = currentArr > 0 ? forecastSnapshot.endingArr / currentArr : 0;
  const sourceLabel =
    forecastSnapshot.status === "remote"
      ? "Live DB forecast"
      : forecastSnapshot.status === "loading"
        ? "Loading live forecast"
        : "Local/default forecast";
  const breakevenLabel = forecastSnapshot.breakevenMonthLabel
    ? `Month ${forecastSnapshot.breakevenMonthIdx + 1} · ${forecastSnapshot.breakevenMonthLabel}`
    : "Not reached";
  // Strategic-model breakeven label (from the same audit-table model).
  const strategicBreakevenLabel = strategicSummary
    ? strategicSummary.breakevenMonthIdx >= 0 && strategicSummary.breakevenMonthLabel
      ? `Month ${strategicSummary.breakevenMonthIdx + 1} · ${strategicSummary.breakevenMonthLabel}`
      : "Year 6+"
    : "—";
  const yearMilestones = forecastSnapshot.yearMilestones;
  const strategicMilestones = strategicSummary?.yearMilestones ?? [];
  const y1 = yearMilestones[0];
  const y2 = yearMilestones[1];
  const y3 = yearMilestones[2];
  const forecastChartData = [
    {
      label: "Today",
      accounts: Math.round(forecastSnapshot.startingSubscribers),
      mrr: Math.round(forecastSnapshot.state.business.currentMrrUsd),
      arr: Math.round(currentArr),
      ebitda: 0,
    },
    ...yearMilestones.map((m) => ({
      label: `Year ${m.year}`,
      accounts: Math.round(m.endSubscribers),
      mrr: Math.round(m.endingMrr),
      arr: Math.round(m.endingArr),
      ebitda: Math.round(m.totalEbitda),
    })),
  ];

  React.useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "SPECTRA AI — INVESTOR PITCH DECK";
  }, []);

  return (
    <div className="bg-white">
      {/* ================================================================== */}
      {/* OPENING: HERO + STORY + GROWTH ROUND (unified flow) */}
      {/* ================================================================== */}
      <section
        className="relative flex flex-col items-center overflow-hidden px-6 sm:px-[clamp(60px,8vw,120px)] py-20 sm:py-28 bg-white"
      >
        {/* Logo top-left */}
        <div className="absolute top-8 left-8">
          <img
            src="/spectra-logo-new.png"
            alt="Spectra AI"
            className="h-6 sm:h-8 opacity-80"
            onError={(e) => {
              e.currentTarget.src = "/spectra_logo.png";
            }}
          />
        </div>

        <div className="w-full max-w-5xl mx-auto">
          {/* ── HERO ── */}
          <div className="text-center mb-20 sm:mb-24">
            <p className="text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-[0.2em] mb-8 sm:mb-10">
              3 Years Built &middot; Product-Market Fit Proven &middot; Growth Round
            </p>

            <h1
              className="font-bold tracking-tight mb-6 sm:mb-8 leading-[1.05]"
              style={{ fontSize: tokens.typography.hero, color: tokens.colors.black }}
            >
              THE PRODUCT IS READY.
              <br />
              NOW WE SCALE.
            </h1>

            <p
              className="font-light leading-relaxed max-w-3xl mx-auto"
              style={{ fontSize: tokens.typography.h2, color: tokens.colors.charcoal }}
            >
              We spent 3 years building the foundation for the all-in-one operational
              platform for hair salons, and we're almost there. 180+ salons use it daily,
              retention is strong, and every risk around adoption is behind us.
            </p>
          </div>

          {/* ── THE STORY: Problem → Solution → Product ── */}
          <div className="mb-20 sm:mb-24">
            {/* Thin accent line above the story */}
            <div className="flex items-center gap-4 mb-12 sm:mb-14">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-[0.2em] flex-shrink-0">
                How we got here
              </p>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
              {/* Problem */}
              <div className="relative bg-gray-50 p-7 sm:p-9 md:border-r border-b md:border-b-0 border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center text-sm font-bold text-gray-400">01</div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-[0.15em]">The Problem</p>
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-black mb-3 leading-snug">
                  $10K–$30K lost per salon, every year
                </h3>
                <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
                  Hair color is a salon's second-largest cost, yet no tool tracks how it's used. Everything runs on paper and memory.
                </p>
              </div>

              {/* Solution */}
              <div className="relative bg-white p-7 sm:p-9 md:border-r border-b md:border-b-0 border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center text-sm font-bold text-gray-400">02</div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-[0.15em]">Our Solution</p>
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-black mb-3 leading-snug">
                  Spectra tracks every gram, in real time
                </h3>
                <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
                  Scan a barcode, weigh color on a Bluetooth scale, and Spectra logs the formula. Owners see usage, inventory, and can order supplies in one tap.
                </p>
              </div>

              {/* Product */}
              <div className="relative bg-white p-7 sm:p-9">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center text-sm font-bold text-gray-400">03</div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-[0.15em]">Product & Service</p>
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-black mb-3 leading-snug">
                  One iPad at the color bar. Subscription pricing.
                </h3>
                <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
                  We ship a smart scale and an iPad stand. The app runs at the color station. Salons pay monthly based on their number of users.
                </p>
              </div>
            </div>

          </div>

          {/* ── WHAT'S NEXT ── */}
          <div className="text-center mb-20 sm:mb-24">
            <p className="text-sm sm:text-base text-gray-500 leading-relaxed max-w-2xl mx-auto mb-12">
              We built the stable foundation, and now we're on the path to the full
              all-in-one salon platform. Every module we add grows on proven
              infrastructure and real daily usage.
            </p>

            {/* Growth round — clean horizontal layout */}
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-4 mb-10">
                <div className="flex-1 h-px bg-gray-200"></div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                  <p className="text-xs font-semibold text-black uppercase tracking-[0.15em]">
                    Raising {shortMoney(seedRaiseUsd)} Seed Round
                  </p>
                </div>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10 mb-14">
                <div className="text-center">
                  <p className="text-4xl sm:text-5xl font-bold text-black mb-2">01</p>
                  <p className="text-sm sm:text-base font-medium text-black leading-snug">Scale US marketing<br />on proven channels</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl sm:text-5xl font-bold text-black mb-2">02</p>
                  <p className="text-sm sm:text-base font-medium text-black leading-snug">AI-powered onboarding<br />for faster customer intake</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl sm:text-5xl font-bold text-black mb-2">03</p>
                  <p className="text-sm sm:text-base font-medium text-black leading-snug">New modules that grow<br />revenue per customer</p>
                </div>
              </div>

              {/* ROI thesis — single strong line */}
              <div className="border-t border-gray-200 pt-8">
                <p
                  className="font-semibold tracking-tight text-center"
                  style={{ fontSize: tokens.typography.h2, color: tokens.colors.black }}
                >
                  The live forecast points to {shortMoney(forecastSnapshot.endingArr)} ARR in 36 months.
                </p>
                <p className="text-sm text-gray-400 mt-2 text-center">
                  Pulled directly from the financial forecast model · {sourceLabel}.
                </p>
              </div>
            </div>
          </div>

          {/* ── TAGLINE ── */}
          <div className="text-center">
            <div className="w-16 h-0.5 bg-black mx-auto mb-5"></div>
            <p className="text-sm sm:text-base italic text-gray-400">
              Created by a hair colorist for hair colorists.
            </p>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* SLIDE 2: TRACTION — RETENTION · USAGE · REVENUE */}
      {/* ================================================================== */}
      <Slide bgColor="linear-gradient(180deg, #0a0a0f 0%, #000000 100%)">
        {/* ── Header ── */}
        <div className="text-center mb-14 sm:mb-16">
          <div className="inline-block px-5 py-1.5 rounded-full border border-white/20 mb-5">
            <p className="text-xs font-semibold text-white/80 uppercase tracking-[0.15em]">Traction</p>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight">
            Built to Retain. Proven by Data.
          </h2>
        </div>

        {/* ── Row 1: Retention wall ── */}
        <div className="mb-10 sm:mb-12">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-[0.15em] mb-5 text-center sm:text-left">
            Customer Retention
          </p>
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {[
              { period: "1-Month", value: `${PRODUCT_KPI.retentionM1}%` },
              { period: "3-Month", value: `${PRODUCT_KPI.retentionM3}%` },
              { period: "6-Month", value: `${PRODUCT_KPI.retentionM6}%` },
            ].map((r) => (
              <div
                key={r.period}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-7 text-center"
              >
                <p className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-1">
                  {r.value}
                </p>
                <p className="text-[11px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {r.period} Retention
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Row 2: Usage depth + scale (4-col grid) ── */}
        <div className="mb-10 sm:mb-12">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-[0.15em] mb-5 text-center sm:text-left">
            Average Monthly Usage per Account
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { label: "Services Tracked", value: PRODUCT_KPI.avgServicesPerAccount.toLocaleString() },
              { label: "System Visits", value: PRODUCT_KPI.avgVisitsPerAccount.toLocaleString() },
              { label: "Grams Tracked", value: `${(PRODUCT_KPI.avgGramsPerAccount / 1000).toFixed(1)}K` },
              { label: "Brands Monitored", value: PRODUCT_KPI.totalBrandsTracked.toLocaleString() },
            ].map((m) => (
              <div
                key={m.label}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-6 text-center"
              >
                <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-1">
                  {m.value}
                </p>
                <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider leading-tight">
                  {m.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Row 3: Revenue + chart (2-col) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-10 sm:mb-12">
          {/* Left: subscription KPIs */}
          <div className="space-y-4">
            <StatCard label="Annual Subscription Revenue" value="$149K" sublabel="From direct subscriptions" />
            <StatCard
              label="Active Subscriptions"
              value="180"
              sublabel="58% in the target market (84 in Israel, 96 in US & England)"
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 sm:p-4 bg-white/[0.04] rounded-xl border border-white/10 text-center">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Intl ARPU</p>
                <p className="text-xl sm:text-2xl font-bold text-white">$58</p>
              </div>
              <div className="p-3 sm:p-4 bg-white/[0.04] rounded-xl border border-white/10 text-center">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Israel ARPU</p>
                <p className="text-xl sm:text-2xl font-bold text-white">$68</p>
              </div>
            </div>
          </div>

          {/* Right: Revenue chart */}
          <div className="bg-gray-50 rounded-2xl p-5 sm:p-7 border border-gray-100 shadow-lg">
            <h3 className="text-base sm:text-lg font-semibold mb-3 text-black">
              Revenue 2024 – 2025
            </h3>
            <div className="h-56 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={REVENUE_DATA} margin={{ top: 8, right: 8, left: 0, bottom: 50 }}>
                  <defs>
                    <linearGradient id="gradIsrael" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1D1D1F" stopOpacity={0.85}/>
                      <stop offset="100%" stopColor="#1D1D1F" stopOpacity={0.65}/>
                    </linearGradient>
                    <linearGradient id="gradInternational" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#86868B" stopOpacity={0.7}/>
                      <stop offset="100%" stopColor="#86868B" stopOpacity={0.5}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis
                    dataKey="month"
                    stroke="#86868B"
                    fontSize={8}
                    angle={-45}
                    textAnchor="end"
                    height={50}
                    interval={2}
                    tick={{ fill: '#86868B' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#86868B"
                    fontSize={10}
                    tickFormatter={(value: number) => `$${(value / 1000).toFixed(0)}K`}
                    tick={{ fill: '#86868B' }}
                    width={42}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1D1D1F',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#fff',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                    formatter={(value: number, name: string) => [
                      `$${value.toLocaleString()}`,
                      name === 'israel' ? 'Israel' : 'International',
                    ]}
                    labelStyle={{ fontWeight: 600, marginBottom: 4, color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  />
                  <Bar dataKey="israel" stackId="revenue" fill="url(#gradIsrael)" name="israel" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="international" stackId="revenue" fill="url(#gradInternational)" name="international" radius={[2, 2, 0, 0]} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-[#1D1D1F]"></div>
                <span className="text-xs text-gray-600">Israel</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-[#86868B]"></div>
                <span className="text-xs text-gray-600">International</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">2024</p>
                  <p className="text-base font-semibold text-gray-900">$93K</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">2025</p>
                  <p className="text-base font-semibold text-gray-900">$149K</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Growth</p>
                  <p className="text-base font-semibold text-gray-900">+60%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Row 4: Validation pilots (compact) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="flex items-start gap-4 p-4 sm:p-5 rounded-2xl border border-white/10 bg-white/[0.04]">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <span className="text-blue-400 text-sm font-bold">B2B</span>
            </div>
            <div>
              <p className="text-sm sm:text-base font-semibold text-white mb-0.5">
                Distributor Pilot: 50 Licenses, &euro;15K
              </p>
              <p className="text-xs text-gray-500">
                Non-English European country, validating B2B channel
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 sm:p-5 rounded-2xl border border-white/10 bg-white/[0.04]">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <span className="text-blue-400 text-xs font-bold">L&apos;Or</span>
            </div>
            <div>
              <p className="text-sm sm:text-base font-semibold text-white mb-0.5">
                L&apos;Oreal Pilot: Market Intelligence, $5.5K
              </p>
              <p className="text-xs text-gray-500">
                2025 data license for Israeli market insights
              </p>
            </div>
          </div>
        </div>
      </Slide>

      {/* ================================================================== */}
      {/* TRACTION - INSTAGRAM STYLE */}
      {/* ================================================================== */}
      <Slide bgColor={tokens.colors.white}>
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-[0.2em] mb-4">
              Product in the Wild
            </p>
            <h2
              className="font-bold tracking-tight mb-3 text-black"
              style={{ fontSize: tokens.typography.h1, lineHeight: 1.1 }}
            >
              Our Customers Love Spectra
            </h2>
            <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto">
              Real engagement from {PRODUCT_KPI.totalUniqueAccounts} accounts across {PRODUCT_KPI.totalBrandsTracked} brands
            </p>
          </div>

          {/* Product Proof Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-10 sm:mb-12">
            {[
              { value: `${PRODUCT_KPI.retentionM1}%`, label: "Monthly Retention" },
              { value: `${PRODUCT_KPI.avgServicesPerAccount}`, label: "Avg Services / Account" },
              { value: `${PRODUCT_KPI.avgVisitsPerAccount}`, label: "Avg Visits / Account" },
              { value: `${(PRODUCT_KPI.avgMonthlyServices / 1000).toFixed(1)}K`, label: "Services Tracked / Mo" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="text-center py-5 sm:py-6 px-3 rounded-2xl bg-gray-50 border border-gray-100"
              >
                <p className="text-2xl sm:text-3xl font-bold text-black tracking-tight mb-1">
                  {stat.value}
                </p>
                <p className="text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider leading-tight">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Customer Video Reels - Instagram Style */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-2 mb-6">
              <svg className="w-5 h-5 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <p className="text-sm font-medium text-gray-600">Real product clips from active salons</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { video: "/instagram-reel.mp4", label: "Color mixing workflow" },
                { video: "/instagram-reel2.mp4", label: "Real-time formula tracking" },
                { video: "/instagram-reel3.mp4", label: "Dashboard analytics" },
                { video: "/instagram-reel4.mp4", label: "iPad at color bar" },
                { video: "/instagram-reel5.mp4", label: "Stylist experience" },
                { video: "/instagram-reel6.mp4", label: "Salon operations" },
              ].map((item, i) => {
                const VideoReel = () => {
                  const [isPlaying, setIsPlaying] = React.useState(false);
                  const [isMuted, setIsMuted] = React.useState(true);
                  const videoRef = React.useRef<HTMLVideoElement>(null);

                  const togglePlay = () => {
                    if (videoRef.current) {
                      if (isPlaying) {
                        videoRef.current.pause();
                      } else {
                        videoRef.current.play();
                      }
                      setIsPlaying(!isPlaying);
                    }
                  };

                  const toggleMute = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    if (videoRef.current) {
                      videoRef.current.muted = !videoRef.current.muted;
                      setIsMuted(videoRef.current.muted);
                    }
                  };

                  return (
                    <div
                      onClick={togglePlay}
                      className="relative rounded-2xl overflow-hidden cursor-pointer group"
                      style={{ aspectRatio: "9/16" }}
                    >
                      <video
                        ref={videoRef}
                        src={item.video}
                        className="w-full h-full object-cover"
                        loop
                        muted
                        playsInline
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                      
                      {/* Play button - subtle */}
                      {!isPlaying && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center shadow-lg">
                            <svg className="w-5 h-5 text-gray-800 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      )}
                      
                      {/* Mute button - subtle */}
                      <button
                        onClick={toggleMute}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {isMuted ? (
                          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                          </svg>
                        )}
                      </button>
                      
                      {/* Label */}
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-white text-xs font-medium leading-tight">{item.label}</p>
                      </div>
                    </div>
                  );
                };
                return <VideoReel key={i} />;
              })}
            </div>
          </div>

          {/* Instagram CTA */}
          <div className="text-center">
            <a
              href="https://www.instagram.com/spectra.ci"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              @spectra.ci · 8.2K followers
            </a>
          </div>
        </div>
      </Slide>

      {/* ================================================================== */}
      {/* SLIDE 4: MARKETING BREAKTHROUGH - TRIPLE BUNDLE */}
      {/* ================================================================== */}
      <Slide bgColor="#FAFAFA">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-[0.2em] mb-4">
            Marketing Breakthrough
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold text-black mb-6 tracking-tight">
            The Triple Bundle
          </h2>
          <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto font-medium">
            One offer, proven funnel, strong unit economics.
            Here's how we turned ad spend into 96 paying customers at 5x LTV:CAC.
          </p>
        </div>

        {/* The Offer - Packaged Bundle with Plus */}
        <div className="relative bg-white/70 rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 mb-16 sm:mb-20 max-w-5xl mx-auto">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-[0.2em] shadow-sm">
              Bundle Package
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-4 sm:gap-6">
            {[
              { title: "30-Day Free Trial", desc: "Full access, no commitment" },
              { title: "Free Equipment", desc: "Smart Scale + Premium Stand" },
              { title: "Custom Training", desc: "Complete onboarding included" },
            ].map((offer, i, arr) => (
              <React.Fragment key={offer.title}>
                <div className="bg-white rounded-3xl p-5 sm:p-10 shadow-sm border border-gray-100 text-center">
                  <h4 className="text-xl sm:text-2xl font-semibold text-black mb-3">{offer.title}</h4>
                  <p className="text-sm sm:text-base text-gray-500">{offer.desc}</p>
                </div>
                {i < arr.length - 1 && (
                  <div className="flex justify-center">
                    <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-500 text-lg font-semibold flex items-center justify-center">
                      +
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
          <p className="mt-6 text-sm sm:text-base text-gray-500 text-center">
            This bundle accelerated new customer acquisition and ensured the smoothest possible system adoption.
          </p>
        </div>

        {/* Combined Results Section */}
        <div className="w-full">
          <div className="bg-white rounded-3xl p-4 sm:p-12 md:p-16 shadow-sm border border-gray-100 max-w-6xl mx-auto">
            
            {/* Campaign Performance - Funnel */}
            <div className="mb-12 sm:mb-16">
              <h4 className="text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-[0.2em] mb-10 text-center">
                Triple Bundle Sales Performance Funnel (2025)
              </h4>
              
              {/* Horizontal Funnel */}
              <div className="relative max-w-6xl mx-auto">
                {/* Funnel Steps */}
                <div className="flex flex-col md:flex-row items-stretch justify-center">
                  
                  {/* Step 1: Leads */}
                  <div className="relative flex-shrink-0 w-full md:w-[380px]">
                    <div className="bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white p-6 sm:p-8 h-full rounded-t-2xl md:rounded-t-none md:rounded-l-2xl shadow-xl"
                         style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 50%, calc(100% - 20px) 100%, 0 100%)' }}>
                      <div className="pr-4">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.15em] mb-2">Step 1 · Leads</p>
                        <p className="text-4xl sm:text-5xl font-black mb-1">1,476</p>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="bg-white/10 text-white text-xs font-medium px-2 py-0.5 rounded">100%</span>
                        </div>
                        <div className="pt-4 border-t border-white/10">
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Cost per Lead</p>
                          <p className="text-2xl font-bold text-white">$25</p>
                        </div>
                      </div>
                    </div>
                    {/* Conversion Badge - Desktop */}
                    <div className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20">
                      <div className="bg-gradient-to-br from-gray-700 to-gray-800 text-white text-sm font-bold w-10 h-10 rounded-full shadow-lg flex items-center justify-center border-2 border-white">
                        20%
                      </div>
                    </div>
                  </div>
                  
                  {/* Mobile Conversion Arrow */}
                  <div className="md:hidden flex items-center justify-center py-2 z-10">
                    <div className="bg-gradient-to-br from-gray-700 to-gray-800 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                      20% Convert
                    </div>
                  </div>

                  {/* Step 2: Trials */}
                  <div className="relative flex-shrink-0 w-full md:w-[320px] md:-ml-1">
                    <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white p-6 sm:p-8 h-full shadow-xl"
                         style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 50%, calc(100% - 20px) 100%, 0 100%, 20px 50%)' }}>
                      <div className="px-2">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.15em] mb-2">Step 2 · Trials</p>
                        <p className="text-4xl sm:text-5xl font-black mb-1">301</p>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="bg-white/10 text-white text-xs font-medium px-2 py-0.5 rounded">20.4%</span>
                        </div>
                        <div className="pt-4 border-t border-white/10">
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Cost per Trial</p>
                          <p className="text-2xl font-bold text-white">$123</p>
                        </div>
                      </div>
                    </div>
                    {/* Conversion Badge - Desktop */}
                    <div className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20">
                      <div className="bg-gradient-to-br from-gray-700 to-gray-900 text-white text-sm font-bold w-10 h-10 rounded-full shadow-lg flex items-center justify-center border-2 border-white">
                        32%
                      </div>
                    </div>
                  </div>
                  
                  {/* Mobile Conversion Arrow */}
                  <div className="md:hidden flex items-center justify-center py-2 z-10">
                    <div className="bg-gradient-to-br from-gray-700 to-gray-900 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                      32% Convert
                    </div>
                  </div>

                  {/* Step 3: Customers */}
                  <div className="relative flex-shrink-0 w-full md:w-[280px] md:-ml-1">
                    <div className="bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 text-white p-6 sm:p-8 h-full rounded-b-2xl md:rounded-b-none md:rounded-r-2xl shadow-xl"
                         style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 20px 50%)' }}>
                      <div className="pl-2">
                        <p className="text-[10px] font-semibold text-slate-300 uppercase tracking-[0.15em] mb-2">Step 3 · Customers</p>
                        <p className="text-4xl sm:text-5xl font-black mb-1">96</p>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="bg-white/20 text-white text-xs font-medium px-2 py-0.5 rounded">6.5%</span>
                          <span className="text-[10px] text-slate-300">of leads</span>
                        </div>
                        <div className="pt-4 border-t border-white/20">
                          <p className="text-[10px] text-slate-300 uppercase tracking-wider">Cost per Customer</p>
                          <p className="text-2xl font-bold text-white">$385</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                </div>
            </div>

            {/* ── Topline Unit Economics Strip ── */}
            <div className="border-t border-gray-200 pt-10 sm:pt-12">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-[0.15em] mb-6 text-center">
                Unit Economics at a Glance
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-2">
                <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 sm:p-5 text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-red-600 tracking-tight mb-1">$37K</p>
                  <p className="text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider">Total CAC</p>
                </div>
                <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 sm:p-5 text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-black tracking-tight mb-1">$185K</p>
                  <p className="text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider">3-Year LTV</p>
                </div>
                <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 sm:p-5 text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-slate-700 tracking-tight mb-1">$148K</p>
                  <p className="text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider">Net LTV</p>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 p-4 sm:p-5 text-center shadow-md">
                  <p className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1">5.0x</p>
                  <p className="text-[10px] sm:text-xs font-medium text-slate-300 uppercase tracking-wider">LTV : CAC</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 text-center mt-3">
                Based on 3-year LTV (conservative). High retention expected in years 4-5.
              </p>
            </div>

            {/* ── Expandable P&L Breakdown ── */}
            <details className="mt-8 sm:mt-10 group">
              <summary className="cursor-pointer list-none flex items-center justify-center gap-2 py-3 select-none">
                <span className="text-sm font-medium text-gray-500 group-hover:text-gray-800 transition-colors">
                  View full P&amp;L breakdown
                </span>
                <svg
                  className="w-4 h-4 text-gray-400 group-hover:text-gray-700 transition-transform group-open:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>

              <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 lg:p-10 mt-4 animate-[fadeIn_0.2s_ease]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                  {/* Investment Column */}
                  <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm">
                    <h4 className="text-xs font-semibold text-red-600 uppercase tracking-[0.15em] mb-5 flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      CAC Breakdown
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Meta Ads (12 mo)</span>
                        <span className="text-base font-medium text-gray-900">$18,000</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Campaign Manager</span>
                        <span className="text-base font-medium text-gray-900">$15,000</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Equipment Gifts</span>
                        <span className="text-base font-medium text-gray-900">$4,000</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-4 mt-2 border-t-2 border-gray-900">
                      <span className="text-sm font-bold text-gray-900">Total CAC</span>
                      <span className="text-xl font-bold text-red-600">($37,000)</span>
                    </div>
                  </div>

                  {/* Returns Column */}
                  <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm">
                    <h4 className="text-xs font-semibold text-green-600 uppercase tracking-[0.15em] mb-5 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Cohort LTV (96 Customers)
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">2025 ARR <span className="text-xs text-green-600 font-medium">(Actual)</span></span>
                        <span className="text-base font-medium text-gray-900">$64,728</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">2026 ARR <span className="text-xs text-gray-400">(5% churn)</span></span>
                        <span className="text-base font-medium text-gray-900">$61,492</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">2027 ARR <span className="text-xs text-gray-400">(5% churn)</span></span>
                        <span className="text-base font-medium text-gray-900">$58,417</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-4 mt-2 border-t-2 border-gray-900">
                      <span className="text-sm font-bold text-gray-900">3-Year LTV</span>
                      <span className="text-xl font-bold text-slate-700">$184,637</span>
                    </div>
                  </div>
                </div>
              </div>
            </details>
          </div>
        </div>

      </Slide>

      {/* ================================================================== */}
      {/* SLIDE 4.5: INVESTMENT OPPORTUNITY */}
      {/* ================================================================== */}
      <Slide bgColor="radial-gradient(circle at top, rgba(234,183,118,0.12), transparent 42%), linear-gradient(180deg, #0a0a0f 0%, #000000 100%)">
        <div className="max-w-6xl mx-auto">

          {/* ── Header ── */}
          <div className="text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full border border-[#EAB776]/30 bg-[#EAB776]/10 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EAB776]" />
              <p className="text-xs font-semibold text-[#EAB776] uppercase tracking-[0.15em]">
                Investment Opportunity · {sourceLabel}
              </p>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight mb-4">
              From Breakthrough to Scale
            </h2>
            <p className="text-base sm:text-lg text-gray-400 max-w-3xl mx-auto">
              A {shortMoney(seedRaiseUsd)} seed round funds the operating plan already modeled in
              the live Financial Forecast: acquisition spend, subscriber growth, ARPU ramp,
              expenses, EBITDA, and 36-month ARR.
            </p>
          </div>

          {forecastSnapshot.status !== "remote" && (
            <div className="mb-8 rounded-2xl border border-[#EAB776]/25 bg-[#EAB776]/10 px-5 py-4 text-center">
              <p className="text-sm text-[#EAB776]">
                Forecast is currently shown from the local/default model while the live DB forecast loads.
                No old investor-deck forecast numbers are being used.
              </p>
            </div>
          )}

          {/* ── Topline KPI Strip (driven by the StrategicForecast model) ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-12 sm:mb-14">
            {[
              { value: shortMoney(seedRaiseUsd), label: "Seed Round" },
              { value: strategicBreakevenLabel, label: "Breakeven" },
              { value: int(strategicSummary?.endingSubscribers ?? 0), label: `${STRATEGIC_FORECAST_YEARS}-yr Accounts` },
              { value: shortMoney(strategicSummary?.endingMrr ?? 0), label: `${STRATEGIC_FORECAST_YEARS}-yr MRR` },
              { value: shortMoney(strategicSummary?.endingArr ?? 0), label: `${STRATEGIC_FORECAST_YEARS}-yr ARR`, accent: true },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className={`rounded-2xl p-4 sm:p-5 text-center border ${
                  kpi.accent
                    ? "bg-[#EAB776]/15 border-[#EAB776]/35 shadow-[0_0_30px_rgba(234,183,118,0.12)]"
                    : "bg-white/[0.04] border-white/10"
                }`}
              >
                <p className={`text-2xl sm:text-3xl font-bold tracking-tight mb-1 ${
                  kpi.accent ? "text-[#EAB776]" : "text-white"
                }`}>
                  {kpi.value}
                </p>
                <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {kpi.label}
                </p>
              </div>
            ))}
          </div>

          {/* ── 01: Forecast Engine ── */}
          <div className="mb-8 sm:mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#EAB776]/10 border border-[#EAB776]/25 flex items-center justify-center">
                <span className="text-base font-bold text-[#EAB776]">01</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">Forecast Engine</h3>
            </div>

            <div className="bg-white/[0.06] backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    formula: "Marketing Investment / CAC",
                    result: "New Accounts",
                    value: `${shortMoney(forecastSnapshot.totalMarketingAcquisitionSpend)} / ${money(forecastSnapshot.cacRange.avg)}`,
                  },
                  {
                    formula: "Active Accounts x ARPU",
                    result: "MRR",
                    value: `${int(forecastSnapshot.endingSubscribers)} x ${money(forecastSnapshot.arpuRange.last)}`,
                  },
                  {
                    formula: "MRR x 12",
                    result: "ARR",
                    value: `${shortMoney(forecastSnapshot.endingMrr)} x 12`,
                  },
                ].map((item) => (
                  <div key={item.result} className="rounded-2xl bg-black/20 border border-white/10 p-5">
                    <p className="text-[10px] text-gray-500 uppercase tracking-[0.16em] mb-2">{item.formula}</p>
                    <p className="text-2xl font-bold text-white mb-1">{item.result}</p>
                    <p className="text-sm text-[#EAB776]">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── 02: Capital & Allocation ── */}
          <div className="mb-8 sm:mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#EAB776]/10 border border-[#EAB776]/25 flex items-center justify-center">
                <span className="text-base font-bold text-[#EAB776]">02</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">Capital &amp; Cash Plan</h3>
            </div>

            <div className="bg-white/[0.06] backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/10">
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 mb-6 pb-6 border-b border-white/10">
                <div className="text-center min-w-[120px]">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Seed Raise</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white">{shortMoney(seedRaiseUsd)}</p>
                </div>
                <span className="text-lg text-gray-600 font-medium">−</span>
                <div className="text-center min-w-[120px]">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Peak Cash Trough</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white">{shortMoney(Math.abs(forecastSnapshot.peakCashTroughUsd))}</p>
                </div>
                <span className="text-lg text-gray-600 font-medium">=</span>
                <div className="text-center min-w-[120px]">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Buffer After Trough</p>
                  <p className="text-2xl sm:text-3xl font-bold text-[#EAB776]">{shortMoney(netCashAfterTrough)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    area: "Go-to-Market",
                    amount: shortMoney(forecastSnapshot.marketingTotalsByCategory.campaigns),
                    pct: "Campaigns",
                    note: `${int(forecastSnapshot.totalNewSubscribers)} new accounts`,
                  },
                  {
                    area: "M&S Team + Content",
                    amount: shortMoney(forecastSnapshot.marketingTotalsByCategory.fixedMs),
                    pct: "Acquisition support",
                    note: `Included in CAC engine`,
                  },
                  {
                    area: "Fulfillment Hardware",
                    amount: shortMoney(forecastSnapshot.marketingTotalsByCategory.tripleBundle),
                    pct: "Triple Bundle",
                    note: `Equipment tied to new accounts`,
                  },
                ].map((b) => (
                  <div key={b.area} className="bg-white/[0.04] border border-white/10 rounded-xl p-4 text-center">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{b.area}</p>
                    <p className="text-xl sm:text-2xl font-bold text-white mb-0.5">{b.amount}</p>
                    <p className="text-xs text-gray-500">{b.pct} · {b.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── 03: 6-Year Forecast Milestones (StrategicForecast model) ── */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#EAB776]/10 border border-[#EAB776]/25 flex items-center justify-center">
                <span className="text-base font-bold text-[#EAB776]">03</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">{STRATEGIC_FORECAST_YEARS}-Year Forecast Milestones</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {strategicMilestones.map((m) => (
                <div key={m.year} className="rounded-2xl bg-white/[0.06] backdrop-blur-lg border border-white/10 p-4 sm:p-5">
                  <p className="text-[10px] text-[#EAB776] uppercase tracking-[0.16em] mb-2">
                    Year {m.year} · {m.label}
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-white">{shortMoney(m.endingArr)}</p>
                  <p className="text-[11px] text-gray-500 mt-1">ARR run-rate</p>
                  <div className="mt-4 space-y-1.5 text-[11px] sm:text-xs">
                    {[
                      ["Accounts", int(m.endSubscribers)],
                      ["MRR", shortMoney(m.endingMrr)],
                      ["EBITDA", shortMoney(m.totalEbitda)],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between border-b border-white/10 pb-1.5">
                        <span className="text-gray-500">{label}</span>
                        <span className="font-semibold text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── 72-Month Financial Audit Drawer ── */}
          {strategicModel && (
            <FinancialModelDrawer model={strategicModel} showRangeToggle={false} />
          )}

        </div>
      </Slide>

      {/* ================================================================== */}
      {/* SLIDE 5: INVESTMENT IMPACT - LIVE GROWTH JOURNEY */}
      {/* ================================================================== */}
      <Slide bgColor="#FAFAF8">
        <SlideHeader title="Investment Impact" align="center" />
        <p className="text-lg sm:text-xl text-gray-500 text-center mb-10 -mt-4">
          The {shortMoney(seedRaiseUsd)} seed round funds a 36-month plan to {shortMoney(forecastSnapshot.endingArr)} ARR.
        </p>

        <div className="relative overflow-hidden rounded-3xl border border-[#EAB776]/25 bg-white p-6 sm:p-10 mb-10 shadow-[0_20px_70px_rgba(0,0,0,0.06)]">
          <div
            className="absolute inset-0 pointer-events-none opacity-70"
            style={{
              background: "radial-gradient(circle at top right, rgba(234,183,118,0.18), transparent 42%)",
            }}
          />
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">
            <div>
              <p className="text-xs font-semibold text-[#B18059] uppercase tracking-[0.18em] mb-2">
                Company Growth Trajectory
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-950">
                From {int(forecastSnapshot.startingSubscribers)} accounts to {int(forecastSnapshot.endingSubscribers)}
              </h3>
            </div>
            <div className="inline-flex self-start lg:self-auto items-center gap-2 px-3 py-1.5 bg-[#EAB776]/10 border border-[#EAB776]/25 rounded-full">
              <div className="w-2 h-2 bg-[#EAB776] rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-[#8A6540]">Live forecast-derived</span>
            </div>
          </div>

          <div className="relative h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={forecastChartData} margin={{ top: 18, right: 18, left: 0, bottom: 8 }}>
                <defs>
                  <linearGradient id="deckArrGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EAB776" stopOpacity={0.42} />
                    <stop offset="70%" stopColor="#EAB776" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="#EAB776" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="deckAccountGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1D1D1F" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="#1D1D1F" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#EEE7DD" strokeDasharray="3 5" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: "#E6DED2" }} tick={{ fill: "#8D8173", fontSize: 12 }} />
                <YAxis
                  yAxisId="money"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#8D8173", fontSize: 11 }}
                  tickFormatter={(value: number) => shortMoney(value)}
                />
                <YAxis
                  yAxisId="accounts"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#8D8173", fontSize: 11 }}
                  tickFormatter={(value: number) => int(value)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111",
                    border: "1px solid rgba(234,183,118,0.25)",
                    borderRadius: 14,
                    color: "#fff",
                    boxShadow: "0 16px 50px rgba(0,0,0,0.25)",
                  }}
                  formatter={(value: number, name: string) => [
                    name === "accounts" ? int(value) : money(value),
                    name === "arr" ? "ARR" : name === "mrr" ? "MRR" : name === "accounts" ? "Accounts" : "EBITDA",
                  ]}
                />
                <Area
                  yAxisId="money"
                  type="monotone"
                  dataKey="arr"
                  stroke="#B18059"
                  strokeWidth={3}
                  fill="url(#deckArrGradient)"
                  name="arr"
                />
                <Bar
                  yAxisId="accounts"
                  dataKey="accounts"
                  fill="url(#deckAccountGradient)"
                  radius={[10, 10, 0, 0]}
                  name="accounts"
                />
                <Line
                  yAxisId="money"
                  type="monotone"
                  dataKey="mrr"
                  stroke="#1D1D1F"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#1D1D1F", stroke: "#fff", strokeWidth: 2 }}
                  name="mrr"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">36-Month Execution Timeline</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {yearMilestones.map((m) => (
              <div key={m.year} className="relative rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-bold text-[#B18059] uppercase tracking-[0.16em]">Year {m.year}</p>
                  <p className="text-xs text-gray-400">{m.label}</p>
                </div>
                <p className="text-2xl font-bold text-gray-950 mb-1">{shortMoney(m.endingArr)}</p>
                <p className="text-xs text-gray-400 mb-4">ARR run-rate from live forecast</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-[#FAFAF8] border border-black/[0.05] p-3">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400">Accounts</p>
                    <p className="text-lg font-semibold text-gray-950">{int(m.endSubscribers)}</p>
                  </div>
                  <div className="rounded-xl bg-[#FAFAF8] border border-black/[0.05] p-3">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400">MRR</p>
                    <p className="text-lg font-semibold text-gray-950">{shortMoney(m.endingMrr)}</p>
                  </div>
                  <div className="rounded-xl bg-[#FAFAF8] border border-black/[0.05] p-3">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400">Avg CAC</p>
                    <p className="text-lg font-semibold text-gray-950">{money(m.avgCac)}</p>
                  </div>
                  <div className="rounded-xl bg-[#FAFAF8] border border-black/[0.05] p-3">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400">End ARPU</p>
                    <p className="text-lg font-semibold text-gray-950">{money(m.endingArpu)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center mt-8">
          Forecast numbers are computed from the same live database-backed model used by `/financial-forecast`.
        </p>
      </Slide>

      {/* ================================================================== */}
      {/* VISION REVEAL SECTION - INTERACTIVE */}
      {/* ================================================================== */}
      <section className="relative bg-gradient-to-b from-gray-900 to-black py-20">
        <div className="max-w-4xl mx-auto text-center px-6">
          {!showVision ? (
            <button
              onClick={() => {
                setShowVisionGate(true);
                setVisionCode("");
                setVisionCodeError("");
              }}
              className="group relative px-16 py-6 bg-white/5 backdrop-blur border border-white/20 text-white text-lg font-semibold rounded-full hover:bg-white/10 hover:border-white/30 transition-all duration-300"
            >
              <span className="relative z-10">Explore the Long-Term Vision</span>
            </button>
          ) : (
            <button
              onClick={() => setShowVision(false)}
              className="px-8 py-3 bg-white/5 border border-white/20 text-white text-sm rounded-full hover:bg-white/10 transition-all"
            >
              ← Back to Current Plan
            </button>
          )}
        </div>
        {showVisionGate && !showVision && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <div
              className="absolute inset-0 bg-black/70"
              onClick={() => setShowVisionGate(false)}
            />
            <div className="relative w-full max-w-md rounded-3xl bg-[#0d0d10] border border-white/10 shadow-2xl p-6 sm:p-8 text-center">
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Enter Access Code</h3>
              <p className="text-sm text-gray-400 mb-6">Unlock the post-18 month vision</p>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={visionCode}
                onChange={(e) => {
                  const digits = e.currentTarget.value.replace(/\D/g, "");
                  setVisionCode(digits);
                  if (visionCodeError) setVisionCodeError("");
                  if (digits.length === 4 && digits !== "1212") {
                    setVisionCodeError("Incorrect code. Try again.");
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (visionCode === "1212") {
                      setShowVision(true);
                      setShowVisionGate(false);
                      setVisionCodeError("");
                    } else {
                      setVisionCodeError("Incorrect code. Try again.");
                    }
                  }
                }}
                className="w-full text-center tracking-[0.6em] text-xl sm:text-2xl font-semibold bg-black/40 text-white placeholder:text-gray-600 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="• • • •"
              />
              {visionCodeError && (
                <p className="text-xs text-red-400 mt-3">{visionCodeError}</p>
              )}
              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  onClick={() => setShowVisionGate(false)}
                  className="px-5 py-2.5 rounded-full border border-white/15 text-sm text-gray-300 hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (visionCode === "1212") {
                      setShowVision(true);
                      setShowVisionGate(false);
                      setVisionCodeError("");
                    } else {
                      setVisionCodeError("Incorrect code. Try again.");
                    }
                  }}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-600 to-rose-600 text-sm font-semibold text-white hover:opacity-90 transition"
                >
                  Unlock
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ================================================================== */}
      {/* THE VISION - DATA PLATFORM UPSIDE */}
      {/* ================================================================== */}
      {showVision && (
        <Slide bgColor="radial-gradient(circle at top, rgba(234,183,118,0.15), transparent 45%), linear-gradient(135deg, #15110b 0%, #0a0a0f 48%, #000000 100%)">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <div className="inline-block px-8 py-3 rounded-full bg-[#EAB776]/10 border border-[#EAB776]/30 mb-6 shadow-lg shadow-[#EAB776]/10">
                <p className="text-sm font-bold text-[#EAB776] uppercase tracking-widest">The Vision · Data Platform Upside</p>
              </div>
              <h2 className="text-5xl sm:text-7xl font-black text-white mb-6">
                After We <span className="bg-gradient-to-r from-[#EAB776] to-[#B18059] bg-clip-text text-transparent">Scale the Core</span>
              </h2>
              <p className="text-xl sm:text-2xl text-gray-300 max-w-4xl mx-auto">
                The current live forecast already gets Spectra to {shortMoney(forecastSnapshot.endingArr)} ARR.
                The next layer is monetizing the operating data that grows with every salon.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6 mb-10">
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 sm:p-10 border border-[#EAB776]/20">
                <p className="text-sm text-[#EAB776] uppercase tracking-wider mb-2">Core forecast foundation</p>
                <p className="text-6xl font-black bg-gradient-to-r from-[#EAB776] to-[#B18059] bg-clip-text text-transparent">
                  {shortMoney(forecastSnapshot.endingArr)}
                </p>
                <p className="text-gray-400 mt-2">36-month ARR run-rate from the live financial forecast.</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                  {[
                    ["Accounts", int(forecastSnapshot.endingSubscribers)],
                    ["MRR", shortMoney(forecastSnapshot.endingMrr)],
                    ["New Accounts", int(forecastSnapshot.totalNewSubscribers)],
                    ["EBITDA", shortMoney(forecastSnapshot.totalEbitda)],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl bg-black/20 border border-white/10 p-4 text-center">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                      <p className="text-2xl font-bold text-white">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                <p className="text-sm text-[#EAB776] uppercase tracking-wider mb-5">Data compounding at scale</p>
                <div className="space-y-4">
                  {[
                    ["Services tracked", `${int(PRODUCT_KPI.avgServicesPerAccount * forecastSnapshot.endingSubscribers)} / mo`],
                    ["Visits observed", `${int(PRODUCT_KPI.avgVisitsPerAccount * forecastSnapshot.endingSubscribers)} / mo`],
                    ["Color grams measured", `${int(PRODUCT_KPI.avgGramsPerAccount * forecastSnapshot.endingSubscribers)} / mo`],
                    ["Brands monitored", `${int(PRODUCT_KPI.totalBrandsTracked)} today`],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-4 border-b border-white/10 pb-3">
                      <span className="text-gray-400">{label}</span>
                      <span className="text-white font-semibold text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 sm:p-10 border border-white/20">
              <h3 className="text-3xl font-bold text-white mb-8 text-center">Two Upside Layers on Top of the Core Forecast</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    title: "Salon AI Tokens",
                    desc: "Usage-based AI for formulas, profitability, ordering, alerts, and customer-facing assistants.",
                  },
                  {
                    title: "Market Intelligence",
                    desc: "Aggregated color, product, service, and pricing signals for brands, distributors, and enterprise buyers.",
                  },
                  {
                    title: "Platform Expansion",
                    desc: "More modules per account: CRM, marketing, payments, inventory, BI, and AI workflows.",
                  },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl bg-black/25 border border-[#EAB776]/15 p-6">
                    <p className="text-xl font-bold text-white mb-3">{item.title}</p>
                    <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-10 pt-8 border-t border-[#EAB776]/20 text-center">
                <p className="text-2xl font-bold bg-gradient-to-r from-[#EAB776] via-[#D39B63] to-[#B18059] bg-clip-text text-transparent">
                  Core ARR from the live forecast. Data and token monetization remain upside, not baked into the base model.
                </p>
              </div>
            </div>
          </div>
        </Slide>
      )}
    </div>
  );
};
