import React, { useState } from "react";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// ============================================================================
// REVENUE DATA - Real data without distributors (USD)
// ============================================================================
const REVENUE_DATA = [
  { month: 'Jan 24', israel: 6548, international: 895 },
  { month: 'Feb 24', israel: 5937, international: 260 },
  { month: 'Mar 24', israel: 8494, international: 115 },
  { month: 'Apr 24', israel: 8079, international: 117 },
  { month: 'May 24', israel: 8926, international: 0 },
  { month: 'Jun 24', israel: 5769, international: 82 },
  { month: 'Jul 24', israel: 5534, international: 1037 },
  { month: 'Aug 24', israel: 7846, international: 1078 },
  { month: 'Sep 24', israel: 7721, international: 1019 },
  { month: 'Oct 24', israel: 6629, international: 1663 },
  { month: 'Nov 24', israel: 9069, international: 2549 },
  { month: 'Dec 24', israel: 9796, international: 3623 },
  { month: 'Jan 25', israel: 7773, international: 2259 },
  { month: 'Feb 25', israel: 7519, international: 3876 },
  { month: 'Mar 25', israel: 6774, international: 3645 },
  { month: 'Apr 25', israel: 6635, international: 5654 },
  { month: 'May 25', israel: 7199, international: 5689 },
  { month: 'Jun 25', israel: 6629, international: 6828 },
  { month: 'Jul 25', israel: 7229, international: 6502 },
  { month: 'Aug 25', israel: 7712, international: 6181 },
  { month: 'Sep 25', israel: 7524, international: 5617 },
  { month: 'Oct 25', israel: 7096, international: 5482 },
  { month: 'Nov 25', israel: 7966, international: 6433 },
  { month: 'Dec 25', israel: 7190, international: 8443 },
];

// Calculate totals
const total2024 = REVENUE_DATA.slice(0, 12).reduce((sum, item) => sum + item.israel + item.international, 0);
const total2025 = REVENUE_DATA.slice(12).reduce((sum, item) => sum + item.israel + item.international, 0);
const yoyGrowth = Math.round(((total2025 / total2024) - 1) * 100);

// ============================================================================
// PRODUCT USAGE & RETENTION KPIs
// Computed from market-intelligence.json (Aug 2024 – Jan 2026, 17 months)
// Active cohort only: accounts with >=1 active month and >=15 total services.
// All figures are averages, not cumulative totals.
// ============================================================================
const PRODUCT_KPI = {
  // Cohort retention (month-over-month customer overlap in monthlySnapshots)
  retentionM1: 90,   // % of active accounts that return the following month
  retentionM3: 84,   // % still active 3 months later
  retentionM6: 78,   // % still active 6 months later

  // Usage depth – averages per active account per month
  avgServicesPerAccount: 115,
  avgVisitsPerAccount: 97,
  avgGramsPerAccount: 6281,

  // Platform scale
  avgMonthlyActive: 142,
  peakMonthlyActive: 168,
  totalUniqueAccounts: 268,
  totalBrandsTracked: 187,

  // Growth quality (first 6 vs last 6 months of data window)
  activeGrowthPct: 18,
  usageDepthGrowthPct: 2,
  servicesGrowthPct: 22,

  // Throughput
  avgMonthlyServices: 16352,
  avgMonthlyProductValue: 313155, // USD of color product flowing through platform
};

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
    className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden overflow-x-hidden px-3 sm:px-[var(--slide-pad)] py-[var(--slide-pad)]"
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const NewInvestorsDeck: React.FC = () => {
  const [showVision, setShowVision] = useState(false);
  const [showVisionGate, setShowVisionGate] = useState(false);
  const [visionCode, setVisionCode] = useState("");
  const [visionCodeError, setVisionCodeError] = useState("");

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
                    Raising $300K Growth Equity
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
                  Every $1 invested targets $5 back over 3 years.
                </p>
                <p className="text-sm text-gray-400 mt-2 text-center">
                  Based on validated target-market performance.
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
      <Slide bgColor="linear-gradient(180deg, #0a0a0f 0%, #000000 100%)">
        <div className="max-w-6xl mx-auto">

          {/* ── Header ── */}
          <div className="text-center mb-10 sm:mb-14">
            <div className="inline-block px-5 py-1.5 rounded-full border border-white/20 mb-5">
              <p className="text-xs font-semibold text-white/80 uppercase tracking-[0.15em]">Investment Opportunity</p>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight mb-4">
              From Breakthrough to Scale
            </h2>
            <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
              $300K growth equity, combined with subscription income, funds 18 months
              of scaled marketing, product expansion, and a clear path from $149K to $578K ARR.
            </p>
          </div>

          {/* ── Topline KPI Strip ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-12 sm:mb-14">
            {[
              { value: "$300K", label: "Growth Round" },
              { value: "$578K", label: "ARR Target" },
              { value: "396", label: "New Customers" },
              { value: "$786K", label: "3-Year LTV" },
              { value: "6.4x", label: "LTV : CAC", accent: true },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className={`rounded-2xl p-4 sm:p-5 text-center border ${
                  kpi.accent
                    ? "bg-white/10 border-white/20"
                    : "bg-white/[0.04] border-white/10"
                }`}
              >
                <p className={`text-2xl sm:text-3xl font-bold tracking-tight mb-1 ${
                  kpi.accent ? "text-white" : "text-white"
                }`}>
                  {kpi.value}
                </p>
                <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {kpi.label}
                </p>
              </div>
            ))}
          </div>

          {/* ── 01: Capital & Allocation ── */}
          <div className="mb-8 sm:mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                <span className="text-base font-bold text-white">01</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">Capital &amp; Allocation</h3>
            </div>

            <div className="bg-white/[0.06] backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/10">
              {/* Source of funds - compact row */}
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 mb-6 pb-6 border-b border-white/10">
                <div className="text-center min-w-[100px]">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Raise</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white">$300K</p>
                </div>
                <span className="text-lg text-gray-600 font-medium">+</span>
                <div className="text-center min-w-[100px]">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Subscription Income</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white">$223K</p>
                </div>
                <span className="text-lg text-gray-600 font-medium">=</span>
                <div className="text-center min-w-[100px]">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">18-Mo Budget</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white">$523K</p>
                </div>
              </div>

              {/* Allocation cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { area: "Go-to-Market", amount: "$237K", pct: "45%", note: "396 new customers" },
                  { area: "Product & R&D", amount: "$171K", pct: "33%", note: "AI Booking system" },
                  { area: "Operations", amount: "$115K", pct: "22%", note: "Team & support" },
                ].map((b) => (
                  <div key={b.area} className="bg-white/[0.04] border border-white/10 rounded-xl p-4 text-center">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{b.area}</p>
                    <p className="text-xl sm:text-2xl font-bold text-white mb-0.5">{b.amount}</p>
                    <p className="text-xs text-gray-500">{b.pct} &middot; {b.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── 02: ARR Build-Up ── */}
          <div className="mb-8 sm:mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                <span className="text-base font-bold text-white">02</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">ARR Growth Model</h3>
            </div>

            <div className="bg-white/[0.06] backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/10">
              <div className="space-y-3">
                {[
                  { line: "Current ARR", note: "180 accounts", val: "$149,000" },
                  { line: "+ New Customer ARR", note: "396 new salons", val: "+$275,000" },
                  { line: "+ Expansion ARR", note: "AI upsell to 226", val: "+$165,000" },
                  { line: "- Churn", note: "5% annual", val: "-$11,000" },
                ].map((r) => (
                  <div key={r.line} className="flex justify-between items-center py-2.5 border-b border-white/10">
                    <span className="text-sm sm:text-base text-white font-medium">
                      {r.line} <span className="text-xs text-gray-500">({r.note})</span>
                    </span>
                    <span className="text-base sm:text-lg font-bold text-white">{r.val}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-3 bg-white/[0.06] rounded-xl px-5 mt-1 border-t border-white/15">
                  <span className="text-white font-bold">Target ARR (Q2 2027)</span>
                  <span className="text-xl sm:text-2xl font-bold text-white">$578,000</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── 03: Cohort Economics ── */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                <span className="text-base font-bold text-white">03</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">3-Year Cohort Economics</h3>
            </div>

            <div className="bg-white/[0.06] backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/10">
              {/* Summary metrics - always visible */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[
                  { label: "CAC", value: "-$122K" },
                  { label: "LTV (3yr)", value: "+$786K" },
                  { label: "Net Profit", value: "+$664K" },
                  { label: "LTV : CAC", value: "6.4x" },
                ].map((m) => (
                  <div key={m.label} className="bg-white/[0.04] rounded-xl p-4 text-center border border-white/10">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{m.label}</p>
                    <p className="text-xl sm:text-2xl font-bold text-white">{m.value}</p>
                  </div>
                ))}
              </div>

              {/* Expandable line-item breakdown */}
              <details className="group">
                <summary className="cursor-pointer list-none flex items-center justify-center gap-2 py-3 select-none">
                  <span className="text-sm font-medium text-gray-500 group-hover:text-gray-300 transition-colors">
                    View CAC &amp; LTV line items
                  </span>
                  <svg
                    className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-transform group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 pt-4 border-t border-white/10">
                  {/* CAC Side */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">CAC Breakdown</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      {[
                        { line: "Campaign Budget", val: "$122,000" },
                        { line: "New Customers", val: "396 salons" },
                        { line: "CAC per Customer", val: "$308" },
                      ].map((r) => (
                        <div key={r.line} className="flex justify-between py-1.5 border-b border-white/10">
                          <span className="text-gray-400">{r.line}</span>
                          <span className="font-semibold text-white">{r.val}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center py-2 mt-2 border-t border-white/15 bg-white/[0.04] rounded-lg px-3">
                      <span className="text-sm font-semibold text-white">Total Investment</span>
                      <span className="text-lg font-bold text-white">($122,000)</span>
                    </div>
                  </div>

                  {/* LTV Side */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">3-Year LTV</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      {[
                        { line: "Year 1 ARR", val: "$275,616" },
                        { line: "Year 2 ARR (5% churn)", val: "$261,835" },
                        { line: "Year 3 ARR (5% churn)", val: "$248,743" },
                      ].map((r) => (
                        <div key={r.line} className="flex justify-between py-1.5 border-b border-white/10">
                          <span className="text-gray-400">{r.line}</span>
                          <span className="font-semibold text-white">{r.val}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center py-2 mt-2 border-t border-white/15 bg-white/[0.04] rounded-lg px-3">
                      <span className="text-sm font-semibold text-white">Total Revenue</span>
                      <span className="text-lg font-bold text-white">$786,194</span>
                    </div>
                  </div>
                </div>
              </details>
            </div>
          </div>

        </div>
      </Slide>

      {/* ================================================================== */}
      {/* SLIDE 5: INVESTMENT IMPACT - COMPREHENSIVE GROWTH JOURNEY */}
      {/* ================================================================== */}
      <Slide bgColor={tokens.colors.white}>
        <SlideHeader title="Investment Impact" align="center" />
        <p className="text-lg sm:text-xl text-gray-500 text-center mb-10 -mt-4">
          Your $300K investment fuels a 4x growth journey
        </p>

        {/* Main Growth Chart - Extended Timeline */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-6 sm:p-10 mb-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">Company Growth Trajectory</h3>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 rounded-full">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-blue-700">Projected</span>
            </div>
          </div>

          {/* Extended SVG Chart */}
          <svg viewBox="0 0 800 320" className="w-full" style={{ maxHeight: "400px" }}>
            {/* Background Grid */}
            <defs>
              <linearGradient id="growthGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.05" />
              </linearGradient>
              <linearGradient id="baseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1D1D1F" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#1D1D1F" stopOpacity="0.4" />
              </linearGradient>
            </defs>

            {/* Horizontal grid lines */}
            <line x1="60" y1="60" x2="760" y2="60" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4,4" />
            <line x1="60" y1="120" x2="760" y2="120" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4,4" />
            <line x1="60" y1="180" x2="760" y2="180" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4,4" />
            <line x1="60" y1="240" x2="760" y2="240" stroke="#E5E7EB" strokeWidth="1" />

            {/* Y-axis labels */}
            <text x="50" y="65" fontSize="10" fill="#9CA3AF" textAnchor="end">$578K</text>
            <text x="50" y="125" fontSize="10" fill="#9CA3AF" textAnchor="end">$400K</text>
            <text x="50" y="185" fontSize="10" fill="#9CA3AF" textAnchor="end">$200K</text>
            <text x="50" y="245" fontSize="10" fill="#9CA3AF" textAnchor="end">$0</text>

            {/* Investment marker line */}
            <line x1="140" y1="50" x2="140" y2="250" stroke="#EF4444" strokeWidth="2" strokeDasharray="6,4" opacity="0.6" />
            <rect x="100" y="30" width="80" height="20" rx="4" fill="#FEE2E2" />
            <text x="140" y="43" fontSize="9" fill="#DC2626" textAnchor="middle" fontWeight="600">INVESTMENT</text>

            {/* Before Investment - Slow Growth Area */}
            <path
              d="M 60,220 Q 100,218 140,215 L 140,240 L 60,240 Z"
              fill="#9CA3AF"
              opacity="0.3"
            />

            {/* After Investment - Accelerated Growth Area */}
            <path
              d="M 140,215 Q 250,195 340,160 Q 430,125 520,95 Q 610,70 700,55 L 760,50 L 760,240 L 140,240 Z"
              fill="url(#growthGradient)"
            />

            {/* Growth Line */}
            <path
              d="M 60,220 Q 100,218 140,215 Q 250,195 340,160 Q 430,125 520,95 Q 610,70 700,55 L 760,50"
              fill="none"
              stroke="#2563eb"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Key milestones */}
            <circle cx="60" cy="220" r="5" fill="#9CA3AF" />
            <circle cx="140" cy="215" r="6" fill="#EF4444" stroke="#FFF" strokeWidth="2" />
            <circle cx="340" cy="160" r="5" fill="#2563eb" />
            <circle cx="520" cy="95" r="6" fill="#3B82F6" stroke="#FFF" strokeWidth="2" />
            <circle cx="700" cy="55" r="6" fill="#1d4ed8" stroke="#FFF" strokeWidth="2" />
            <circle cx="760" cy="50" r="7" fill="#1e40af" stroke="#FFF" strokeWidth="3" />

            {/* X-axis labels */}
            <text x="60" y="260" fontSize="10" fill="#9CA3AF" textAnchor="middle">Today</text>
            <text x="140" y="260" fontSize="10" fill="#DC2626" textAnchor="middle" fontWeight="600">Q1 26</text>
            <text x="250" y="260" fontSize="10" fill="#6B7280" textAnchor="middle">Q2 26</text>
            <text x="340" y="260" fontSize="10" fill="#6B7280" textAnchor="middle">Q3 26</text>
            <text x="430" y="260" fontSize="10" fill="#6B7280" textAnchor="middle">Q4 26</text>
            <text x="520" y="260" fontSize="10" fill="#3B82F6" textAnchor="middle" fontWeight="600">Q1 27</text>
            <text x="610" y="260" fontSize="10" fill="#6B7280" textAnchor="middle">Q2 27</text>
            <text x="700" y="260" fontSize="10" fill="#1d4ed8" textAnchor="middle" fontWeight="600">Q3 27</text>
            <text x="760" y="260" fontSize="10" fill="#1e40af" textAnchor="middle" fontWeight="600">Q4 27</text>

            {/* Value annotations */}
            <rect x="45" y="200" width="45" height="18" rx="4" fill="#F3F4F6" />
            <text x="68" y="213" fontSize="10" fill="#374151" textAnchor="middle" fontWeight="600">$149K</text>

            <rect x="300" y="140" width="50" height="18" rx="4" fill="#DBEAFE" />
            <text x="325" y="153" fontSize="10" fill="#1e40af" textAnchor="middle" fontWeight="600">$280K</text>

            <rect x="480" y="75" width="55" height="18" rx="4" fill="#DBEAFE" />
            <text x="508" y="88" fontSize="10" fill="#1D4ED8" textAnchor="middle" fontWeight="600">$427K</text>
            <text x="520" y="110" fontSize="8" fill="#3B82F6" textAnchor="middle">AI Booking</text>

            <rect x="720" y="30" width="55" height="20" rx="4" fill="#1e40af" />
            <text x="748" y="44" fontSize="11" fill="#FFF" textAnchor="middle" fontWeight="700">$578K</text>
          </svg>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-6 mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span className="text-xs text-gray-600">Pre-Investment</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Investment Start</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-xs text-gray-600">AI Features Launch</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <span className="text-xs text-gray-600">Target ARR</span>
            </div>
          </div>
        </div>

        {/* Milestone Timeline */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">18-Month Execution Timeline</h3>
          
          {/* Horizontal Timeline */}
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute top-6 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-blue-500 to-blue-700 rounded-full"></div>
            
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {[
                { q: "Q1 26", title: "Launch", items: ["Team hiring", "Funnel optimization"], color: "red" },
                { q: "Q2 26", title: "Build", items: ["AI Booking dev", "WhatsApp"], color: "orange" },
                { q: "Q3 26", title: "Expand", items: ["CRM module", "Marketing push"], color: "yellow" },
                { q: "Q4 26", title: "Scale", items: ["US market", "$320K ARR"], color: "blue" },
                { q: "Q1 27", title: "AI Launch", items: ["AI Booking live", "40% upsell"], color: "indigo", highlight: true },
                { q: "Q4 27", title: "Target", items: ["$578K ARR", "3.9x growth"], color: "blue", highlight: true },
              ].map((phase, i) => (
                <div key={i} className="relative pt-10">
                  <div className={`absolute top-4 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full ${
                    phase.highlight ? 'bg-blue-600 ring-4 ring-blue-100' : 'bg-gray-300'
                  }`}></div>
                  <div className={`text-center p-3 rounded-xl ${
                    phase.highlight ? 'bg-blue-50 border-2 border-blue-600' : 'bg-gray-50 border border-gray-100'
                  }`}>
                    <p className={`text-xs font-bold mb-1 ${phase.highlight ? 'text-blue-700' : 'text-gray-500'}`}>{phase.q}</p>
                    <p className={`text-sm font-semibold mb-2 ${phase.highlight ? 'text-blue-800' : 'text-gray-900'}`}>{phase.title}</p>
                    {phase.items.map((item, j) => (
                      <p key={j} className="text-[10px] text-gray-500 leading-tight">{item}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center mt-8">
          Conservative projections based on validated 2024-2025 performance data
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
      {/* THE VISION - SERIES A SCALE PLAN */}
      {/* ================================================================== */}
      {showVision && (
        <Slide bgColor="linear-gradient(135deg, #1a0a14 0%, #0a0a0f 50%, #000000 100%)">
          <div className="max-w-6xl mx-auto">
            {/* Dramatic Header */}
            <div className="text-center mb-16">
              <div className="inline-block px-8 py-3 rounded-full bg-gradient-to-r from-pink-600 via-rose-600 to-pink-700 mb-6 shadow-lg shadow-pink-500/50">
                <p className="text-sm font-bold text-white uppercase tracking-widest">The Vision • Series A</p>
              </div>
              <h2 className="text-6xl sm:text-7xl font-black text-white mb-6">
                After We <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">Prove It</span>
              </h2>
              <p className="text-2xl text-gray-300">18 months from now, we raise $5M and scale globally</p>
            </div>

            {/* The $5M Plan */}
            <div className="mb-12">
              <div className="bg-gradient-to-br from-pink-900/20 to-rose-900/20 backdrop-blur-xl rounded-3xl p-10 border border-pink-500/30 shadow-2xl">
                <div className="text-center mb-8">
                  <p className="text-sm text-pink-400 uppercase tracking-wider mb-2">Series A Round</p>
                  <p className="text-7xl font-black bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">$5M</p>
                  <p className="text-gray-400 mt-2">Plus $2M in subscription revenue = $7M total budget</p>
                </div>

                {/* Budget Allocation - Balanced Growth (50/30/20) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white/5 border border-pink-500/20 rounded-2xl p-6 text-center">
                    <p className="text-xs text-pink-300 uppercase tracking-wider mb-2">Go-to-Market</p>
                    <p className="text-4xl font-bold text-white mb-1">$3.5M</p>
                    <p className="text-sm text-gray-400">50% • 6,000+ new customers</p>
                  </div>
                  <div className="bg-white/5 border border-pink-500/20 rounded-2xl p-6 text-center">
                    <p className="text-xs text-pink-300 uppercase tracking-wider mb-2">Product & R&D</p>
                    <p className="text-4xl font-bold text-white mb-1">$2.1M</p>
                    <p className="text-sm text-gray-400">30% • AI features &amp; global platform</p>
                  </div>
                  <div className="bg-white/5 border border-pink-500/20 rounded-2xl p-6 text-center">
                    <p className="text-xs text-pink-300 uppercase tracking-wider mb-2">Operations</p>
                    <p className="text-4xl font-bold text-white mb-1">$1.4M</p>
                    <p className="text-sm text-gray-400">20% • Scale team &amp; infrastructure</p>
                  </div>
                </div>

                {/* Revenue Streams */}
                <div className="border-t border-pink-500/20 pt-8">
                  <p className="text-sm text-pink-400 uppercase tracking-wider mb-6 text-center">Additional Revenue Streams</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-pink-500/10 rounded-xl p-4 text-center">
                      <p className="text-xs text-gray-400 mb-1">Data Licenses</p>
                      <p className="text-2xl font-bold text-pink-400">$150K</p>
                      <p className="text-xs text-gray-500">L'Oreal + partners</p>
                    </div>
                    <div className="bg-pink-500/10 rounded-xl p-4 text-center">
                      <p className="text-xs text-gray-400 mb-1">Distributors</p>
                      <p className="text-2xl font-bold text-pink-400">$90K</p>
                      <p className="text-xs text-gray-500">3 × 100 licenses</p>
                    </div>
                    <div className="bg-pink-500/10 rounded-xl p-4 text-center">
                      <p className="text-xs text-gray-400 mb-1">Enterprise</p>
                      <p className="text-2xl font-bold text-pink-400">$200K</p>
                      <p className="text-xs text-gray-500">Chain accounts</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 36-Month Projection */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/20">
              <h3 className="text-3xl font-bold text-white mb-8 text-center">Exponential Growth Path</h3>
              
              {/* Timeline Visualization */}
              <div className="space-y-6 mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-32 text-right">
                    <p className="text-sm text-gray-400">Month 18</p>
                    <p className="text-lg font-bold text-white">$578K</p>
                  </div>
                  <div className="flex-1 h-3 bg-gradient-to-r from-pink-600 to-rose-600 rounded-full"></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 text-right">
                    <p className="text-sm text-gray-400">Month 36</p>
                    <p className="text-lg font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">$4M</p>
                  </div>
                  <div className="flex-1 h-3 bg-gradient-to-r from-pink-600 via-rose-500 to-pink-400 rounded-full shadow-lg shadow-pink-500/50"></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 text-right">
                    <p className="text-sm text-gray-400">Month 54</p>
                    <p className="text-lg font-bold bg-gradient-to-r from-pink-300 to-rose-300 bg-clip-text text-transparent">$10M</p>
                  </div>
                  <div className="flex-1 h-3 bg-gradient-to-r from-pink-500 via-rose-400 to-pink-300 rounded-full shadow-lg shadow-pink-400/50"></div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Total Customers</p>
                  <p className="text-4xl font-bold text-white">8,000+</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">ARR</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">$10M</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Growth</p>
                  <p className="text-4xl font-bold text-pink-400">67x</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Valuation</p>
                  <p className="text-4xl font-bold text-white">$150M</p>
                </div>
              </div>

              {/* Sales Roadmap Graph */}
              <div className="mt-10 pt-8 border-t border-pink-500/20">
                <h4 className="text-xl font-bold text-white mb-6 text-center">54-Month Sales Roadmap</h4>
                <div className="bg-black/30 rounded-2xl p-4 sm:p-8">
                  <svg viewBox="0 0 900 400" className="w-full" style={{ maxHeight: "400px" }}>
                    {/* Gradient Definitions */}
                    <defs>
                      <linearGradient id="pinkGrowthGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ec4899" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#ec4899" stopOpacity="0.05" />
                      </linearGradient>
                      <linearGradient id="pinkLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f472b6" />
                        <stop offset="50%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#f9a8d4" />
                      </linearGradient>
                    </defs>

                    {/* Grid Lines */}
                    <line x1="60" y1="60" x2="840" y2="60" stroke="#ec4899" strokeWidth="1" strokeOpacity="0.1" strokeDasharray="4,4" />
                    <line x1="60" y1="120" x2="840" y2="120" stroke="#ec4899" strokeWidth="1" strokeOpacity="0.1" strokeDasharray="4,4" />
                    <line x1="60" y1="180" x2="840" y2="180" stroke="#ec4899" strokeWidth="1" strokeOpacity="0.1" strokeDasharray="4,4" />
                    <line x1="60" y1="240" x2="840" y2="240" stroke="#ec4899" strokeWidth="1" strokeOpacity="0.1" strokeDasharray="4,4" />
                    <line x1="60" y1="300" x2="840" y2="300" stroke="#ec4899" strokeWidth="1" strokeOpacity="0.2" />

                    {/* Y-axis Labels */}
                    <text x="50" y="65" fontSize="11" fill="#9ca3af" textAnchor="end" fontWeight="600">$10M</text>
                    <text x="50" y="125" fontSize="11" fill="#9ca3af" textAnchor="end">$7.5M</text>
                    <text x="50" y="185" fontSize="11" fill="#9ca3af" textAnchor="end">$5M</text>
                    <text x="50" y="245" fontSize="11" fill="#9ca3af" textAnchor="end">$2.5M</text>
                    <text x="50" y="305" fontSize="11" fill="#9ca3af" textAnchor="end">$0</text>

                    {/* Growth Area Fill */}
                    <path
                      d="M 60,296 L 200,293 L 340,286 L 480,264 L 620,204 L 760,120 L 840,60 L 840,300 L 60,300 Z"
                      fill="url(#pinkGrowthGradient)"
                    />

                    {/* Growth Line */}
                    <path
                      d="M 60,296 Q 130,294 200,293 Q 270,290 340,286 Q 410,276 480,264 Q 550,236 620,204 Q 690,160 760,120 L 840,60"
                      fill="none"
                      stroke="url(#pinkLineGradient)"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />

                    {/* Milestones */}
                    <circle cx="60" cy="296" r="6" fill="#f472b6" stroke="#fff" strokeWidth="2" />
                    <circle cx="200" cy="293" r="6" fill="#ec4899" stroke="#fff" strokeWidth="2" />
                    <circle cx="340" cy="286" r="7" fill="#ec4899" stroke="#fff" strokeWidth="2" />
                    <circle cx="480" cy="264" r="8" fill="#f43f5e" stroke="#fff" strokeWidth="3" />
                    <circle cx="620" cy="204" r="8" fill="#ec4899" stroke="#fff" strokeWidth="3" />
                    <circle cx="760" cy="120" r="9" fill="#f472b6" stroke="#fff" strokeWidth="3" />
                    <circle cx="840" cy="60" r="10" fill="#ec4899" stroke="#fff" strokeWidth="4" />

                    {/* X-axis Labels */}
                    <text x="60" y="330" fontSize="11" fill="#f472b6" textAnchor="middle" fontWeight="600">Today</text>
                    <text x="200" y="330" fontSize="11" fill="#9ca3af" textAnchor="middle">M6</text>
                    <text x="340" y="330" fontSize="11" fill="#f9a8d4" textAnchor="middle" fontWeight="600">M18</text>
                    <text x="480" y="330" fontSize="11" fill="#f43f5e" textAnchor="middle" fontWeight="700">M24</text>
                    <text x="620" y="330" fontSize="11" fill="#ec4899" textAnchor="middle" fontWeight="700">M36</text>
                    <text x="760" y="330" fontSize="11" fill="#f472b6" textAnchor="middle" fontWeight="700">M48</text>
                    <text x="840" y="330" fontSize="11" fill="#ec4899" textAnchor="middle" fontWeight="700">M54</text>

                    {/* Value Annotations */}
                    <rect x="35" y="278" width="50" height="20" rx="4" fill="#ec4899" fillOpacity="0.2" />
                    <text x="60" y="292" fontSize="11" fill="#f472b6" textAnchor="middle" fontWeight="700">$149K</text>

                    <rect x="315" y="268" width="50" height="20" rx="4" fill="#ec4899" fillOpacity="0.3" />
                    <text x="340" y="282" fontSize="11" fill="#f9a8d4" textAnchor="middle" fontWeight="700">$578K</text>

                    <rect x="455" y="246" width="50" height="20" rx="4" fill="#f43f5e" />
                    <text x="480" y="260" fontSize="12" fill="#fff" textAnchor="middle" fontWeight="700">$1.5M</text>

                    <rect x="595" y="186" width="50" height="20" rx="4" fill="#ec4899" />
                    <text x="620" y="200" fontSize="12" fill="#fff" textAnchor="middle" fontWeight="700">$4M</text>

                    <rect x="735" y="102" width="50" height="20" rx="4" fill="#f472b6" />
                    <text x="760" y="116" fontSize="12" fill="#fff" textAnchor="middle" fontWeight="700">$7.5M</text>

                    <rect x="812" y="40" width="56" height="22" rx="4" fill="#ec4899" />
                    <text x="840" y="55" fontSize="13" fill="#fff" textAnchor="middle" fontWeight="900">$10M</text>

                    {/* Milestone Labels */}
                    <text x="200" y="283" fontSize="9" fill="#f9a8d4" textAnchor="middle">Traction</text>
                    <text x="340" y="275" fontSize="9" fill="#f9a8d4" textAnchor="middle">Seed Exit</text>
                    <text x="480" y="252" fontSize="9" fill="#fda4af" textAnchor="middle">Series A</text>
                    <text x="620" y="193" fontSize="9" fill="#fda4af" textAnchor="middle">Scale</text>
                    <text x="760" y="109" fontSize="9" fill="#fda4af" textAnchor="middle">Dominance</text>
                  </svg>

                  {/* Legend */}
                  <div className="flex flex-wrap justify-center gap-6 mt-6 pt-4 border-t border-pink-500/10">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-pink-400 rounded-full"></div>
                      <span className="text-xs text-gray-400">Current</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-rose-400 rounded-full"></div>
                      <span className="text-xs text-gray-400">$300K Round (M0-18)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-pink-600 rounded-full"></div>
                      <span className="text-xs text-gray-400">Series A + Scale (M18-54)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Tagline */}
              <div className="mt-10 pt-8 border-t border-pink-500/20 text-center">
                <p className="text-2xl font-bold bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 bg-clip-text text-transparent">
                  From $149K to $10M ARR in 54 months
                </p>
                <p className="text-gray-400 mt-2">67x growth powered by proven unit economics + strategic capital</p>
              </div>
            </div>
          </div>
        </Slide>
      )}
    </div>
  );
};
