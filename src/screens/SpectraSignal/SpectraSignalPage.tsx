import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Navigation } from "../../components/Navigation";
import { InvestorMiniNav, type NavSection } from "../Investors/InvestorMiniNav";
import {
  REVENUE_DATA,
  total2024,
  total2025,
  yoyGrowth,
  PRODUCT_KPI as KPI,
  VALIDATION_PILOTS,
} from "../investor-shared/investor-metrics";

// ─────────────────────────────────────────────────────────────────────
// Section registry
// ─────────────────────────────────────────────────────────────────────

const SECTIONS: NavSection[] = [
  { id: "hero", label: "Signal" },
  { id: "today", label: "Today" },
  { id: "wedge", label: "Wedge" },
  { id: "model", label: "2,000 Salons" },
  { id: "economics", label: "Economics" },
  { id: "upside", label: "Upside" },
  { id: "validation", label: "Validation" },
  { id: "cta", label: "Contact" },
];

// ─────────────────────────────────────────────────────────────────────
// Motion primitives
// ─────────────────────────────────────────────────────────────────────

function FadeIn({
  children,
  delay = 0,
  className = "",
  y = 24,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={
        reduced
          ? { duration: 0 }
          : { duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }
      }
    >
      {children}
    </motion.div>
  );
}

function AnimatedNumber({
  value,
  format,
  duration = 1800,
}: {
  value: number;
  format?: (n: number) => string;
  duration?: number;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref as any, { once: true, margin: "-50px" });
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setCurrent(value);
      return;
    }
    const start = performance.now();
    let raf: number;
    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setCurrent(value * eased);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, reduced, duration]);

  const fmt = format || ((n: number) => Math.round(n).toLocaleString());
  return <span ref={ref}>{fmt(current)}</span>;
}

function fmtCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(0)}K`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

// ─────────────────────────────────────────────────────────────────────
// Visual primitives
// ─────────────────────────────────────────────────────────────────────

function DotGrid({ className = "" }: { className?: string }) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none opacity-[0.05] ${className}`}
      style={{
        backgroundImage: "radial-gradient(circle, #a78bfa 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    />
  );
}

function SignalChip({
  tone = "violet",
  children,
}: {
  tone?: "violet" | "emerald" | "amber" | "slate";
  children: React.ReactNode;
}) {
  const map = {
    violet: "bg-violet-500/10 text-violet-300 border-violet-400/20",
    emerald: "bg-emerald-500/10 text-emerald-300 border-emerald-400/20",
    amber: "bg-amber-500/10 text-amber-300 border-amber-400/20",
    slate: "bg-white/5 text-gray-300 border-white/10",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase border backdrop-blur-sm ${map[tone]}`}
    >
      <span className="w-1 h-1 rounded-full bg-current animate-pulse" />
      {children}
    </span>
  );
}

function RevenueSparkline() {
  const points = REVENUE_DATA.map((d) => d.israel + d.international);
  const max = Math.max(...points);
  const w = 240;
  const h = 56;
  const path = points
    .map((v, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - (v / max) * (h - 8) - 4;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const areaPath = `${path} L${w},${h} L0,${h} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full h-14"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="signalSparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#signalSparkGrad)" />
      <path
        d={path}
        fill="none"
        stroke="#a78bfa"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Growth model (2,000-salon scenario — illustrative)
// Source: docs/spectra-2000-salons-growth-model-he.pdf
// ─────────────────────────────────────────────────────────────────────

interface RampPoint {
  month: number;
  salons: number;
  mrr: number;
}

const RAMP: RampPoint[] = [
  { month: 0, salons: 0, mrr: 0 },
  { month: 3, salons: 200, mrr: 40_000 },
  { month: 6, salons: 650, mrr: 130_000 },
  { month: 9, salons: 1_250, mrr: 250_000 },
  { month: 12, salons: 2_000, mrr: 400_000 },
];

const MODEL = {
  arpu: 200,
  target: 2_000,
  mrrAtTarget: 400_000,
  arrAtTarget: 4_800_000,
  gtmBudget: 1_000_000,
  blendedCac: 500,
  paybackMonths: 3,
  ltv: 7_200,
  ltvHorizonMonths: 36,
  upsideArrLow: 5_300_000,
  upsideArrHigh: 5_800_000,
} as const;

function RampChart() {
  const w = 520;
  const h = 220;
  const padL = 44;
  const padR = 16;
  const padT = 16;
  const padB = 30;
  const maxMrr = 400_000;
  const months = 12;

  const x = (m: number) =>
    padL + (m / months) * (w - padL - padR);
  const y = (v: number) =>
    h - padB - (v / maxMrr) * (h - padT - padB);

  const linePath = RAMP.map(
    (p, i) => `${i === 0 ? "M" : "L"}${x(p.month).toFixed(1)},${y(p.mrr).toFixed(1)}`,
  ).join(" ");
  const areaPath = `${linePath} L${x(months).toFixed(1)},${(h - padB).toFixed(1)} L${x(0).toFixed(1)},${(h - padB).toFixed(1)} Z`;

  const yTicks = [0, 100_000, 200_000, 300_000, 400_000];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
      <defs>
        <linearGradient id="rampGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {yTicks.map((v) => (
        <g key={v}>
          <line
            x1={padL}
            x2={w - padR}
            y1={y(v)}
            y2={y(v)}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={1}
          />
          <text
            x={padL - 8}
            y={y(v) + 3}
            textAnchor="end"
            fill="rgba(255,255,255,0.45)"
            fontSize="10"
          >
            {v === 0 ? "$0" : `$${v / 1000}K`}
          </text>
        </g>
      ))}

      {[0, 3, 6, 9, 12].map((m) => (
        <text
          key={m}
          x={x(m)}
          y={h - padB + 16}
          textAnchor="middle"
          fill="rgba(255,255,255,0.45)"
          fontSize="10"
        >
          M{m}
        </text>
      ))}

      <path d={areaPath} fill="url(#rampGrad)" />
      <path
        d={linePath}
        fill="none"
        stroke="#a78bfa"
        strokeWidth={2}
        strokeLinecap="round"
      />

      {RAMP.map((p) => (
        <g key={p.month}>
          <circle
            cx={x(p.month)}
            cy={y(p.mrr)}
            r={3.5}
            fill="#a78bfa"
            stroke="#0a0a0f"
            strokeWidth={2}
          />
          {p.month > 0 && (
            <text
              x={x(p.month)}
              y={y(p.mrr) - 10}
              textAnchor="middle"
              fill="rgba(255,255,255,0.85)"
              fontSize="10"
              fontWeight={600}
            >
              {p.salons.toLocaleString()}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────

export function SpectraSignalPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Spectra Signal — Investor Brief";
  }, []);

  return (
    <div
      className="min-h-[100dvh] overflow-x-hidden bg-[#070710] text-white"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      <style>{`div::-webkit-scrollbar { display: none; }`}</style>

      <Navigation />
      <InvestorMiniNav sections={SECTIONS} />

      {/* ════════════════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════════════ */}
      <section
        id="hero"
        className="relative min-h-[88dvh] flex items-center overflow-hidden"
      >
        <div className="absolute inset-0">
          <img
            src="/colorbar_with_spectra.png"
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: "center 35%" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070710]/95 via-[#070710]/85 to-[#070710]/55" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070710]/85 via-transparent to-[#070710]/40" />
        </div>
        <DotGrid />

        <div className="absolute top-[-15%] right-[-10%] w-[55%] h-[55%] bg-gradient-to-bl from-violet-600/25 via-purple-500/10 to-transparent rounded-full blur-[140px]" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-tr from-fuchsia-500/15 via-violet-400/8 to-transparent rounded-full blur-[120px]" />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 sm:px-10 py-32 sm:py-40">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="max-w-3xl"
          >
            <div className="flex flex-wrap items-center gap-2 mb-8">
              <SignalChip>Investor Brief</SignalChip>
              <SignalChip tone="emerald">SaaS · AI · Data</SignalChip>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6">
              Spectra{" "}
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                Signal
              </span>
            </h1>

            <p className="text-lg sm:text-2xl text-gray-300 leading-relaxed max-w-2xl mb-4">
              The AI-native growth signal from the color bar — live SaaS metrics
              from 180+ salons, scaled into a 2,000-salon, $4.8M ARR model.
            </p>

            <p className="text-sm sm:text-base text-gray-400 leading-relaxed max-w-2xl mb-10">
              Incumbents own booking screens. Spectra owns the production data:
              every formula, every gram, every margin signal at the moment of
              mixing — and turns it into AI-native software and an industrial
              data asset.
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href="mailto:maor@spectra-ci.com?subject=Spectra%20Signal%20-%20Investor%20Intro"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/25"
              >
                Request Investor Intro
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </a>
              <a
                href="#today"
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById("today")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-white/15 text-white/85 text-sm font-semibold hover:bg-white/5 transition-colors"
              >
                See the Numbers
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          TODAY — Actual SaaS metrics
      ════════════════════════════════════════════════════════════════ */}
      <section
        id="today"
        className="relative py-20 sm:py-28 bg-gradient-to-b from-[#070710] via-[#0a0a18] to-[#070710]"
      >
        <DotGrid />
        <div className="relative max-w-6xl mx-auto px-6">
          <FadeIn className="text-center max-w-3xl mx-auto mb-12">
            <div className="flex justify-center mb-4">
              <SignalChip tone="emerald">Live · Actual Platform Metrics</SignalChip>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
              Where Spectra Is Today
            </h2>
            <p className="text-base sm:text-lg text-gray-400 leading-relaxed">
              Subscription revenue and product usage, sourced from the same
              internal telemetry that powers our investor data room. Not
              projections — the platform as it runs right now.
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {[
                {
                  label: "2025 Subscription Revenue",
                  value: `$${Math.round(total2025 / 1000)}K`,
                  sub: `+${yoyGrowth}% YoY vs 2024`,
                },
                {
                  label: "Active Salons",
                  value: "180+",
                  sub: `${KPI.totalUniqueAccounts} total accounts`,
                },
                {
                  label: "Services / Month",
                  value: fmtCompact(KPI.avgMonthlyServices),
                  sub: "Platform throughput",
                },
                {
                  label: "Product Value / Mo",
                  value: `$${Math.round(
                    KPI.avgMonthlyProductValue / 1000,
                  )}K`,
                  sub: "Color flowing through",
                },
                {
                  label: "6-Month Retention",
                  value: `${KPI.retentionM6}%`,
                  sub: `${KPI.retentionM1}% M1 · ${KPI.retentionM3}% M3`,
                },
              ].map((m, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-5 text-center"
                >
                  <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-0.5">
                    {m.value}
                  </p>
                  <p className="text-[11px] font-medium text-gray-300 uppercase tracking-wider leading-tight">
                    {m.label}
                  </p>
                  {m.sub && (
                    <p className="text-[11px] text-violet-300 mt-1">{m.sub}</p>
                  )}
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="mt-10 max-w-2xl mx-auto rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-baseline justify-between mb-2">
                <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Monthly subscription revenue · Jan 2024 → Dec 2025
                </p>
                <p className="text-xs text-violet-300">
                  $
                  {Math.round(total2024 / 1000).toLocaleString()}K →{" "}
                  ${Math.round(total2025 / 1000).toLocaleString()}K
                </p>
              </div>
              <RevenueSparkline />
              <p className="text-[11px] text-gray-500 mt-3">
                Source: internal product telemetry. Active cohort of 135 avg
                monthly active salons (peak {KPI.peakMonthlyActive}), {KPI.totalBrandsTracked}{" "}
                brands tracked.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          WEDGE — Competitive positioning
      ════════════════════════════════════════════════════════════════ */}
      <section
        id="wedge"
        className="relative py-20 sm:py-28 bg-[#070710] border-t border-white/5"
      >
        <div className="relative max-w-6xl mx-auto px-6">
          <FadeIn className="max-w-3xl mb-14">
            <SignalChip tone="violet">Why Spectra Wins</SignalChip>
            <h2 className="mt-4 text-3xl sm:text-5xl font-bold tracking-tight">
              Incumbents own the booking screen.
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                We own the production data.
              </span>
            </h2>
            <p className="mt-5 text-base sm:text-lg text-gray-400 leading-relaxed">
              The salon software category has produced repeated $0.5B–$2B
              outcomes — Mindbody, Zenoti, Vagaro, Boulevard, Fresha,
              GlossGenius. They compete on bookings, payments and marketplaces.
              Spectra opens a new category: AI-native operations powered by
              real-world data competitors structurally don't have.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-5">
            <FadeIn>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 h-full">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Incumbents
                </p>
                <h3 className="text-xl font-semibold mb-4">
                  Booking, payments, marketplace
                </h3>
                <ul className="space-y-3 text-sm text-gray-400 leading-relaxed">
                  {[
                    "Own the calendar — not the chair",
                    "Marketplace commissions or per-seat SaaS",
                    "Generic vertical SaaS with limited AI depth",
                    "No view into formulas, grams or production cost",
                  ].map((t, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-500 flex-shrink-0" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="rounded-2xl border border-violet-400/30 bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-transparent p-7 h-full">
                <p className="text-xs font-semibold text-violet-300 uppercase tracking-wider mb-3">
                  Spectra
                </p>
                <h3 className="text-xl font-semibold mb-4">
                  AI-native operations on top of real production data
                </h3>
                <ul className="space-y-3 text-sm text-gray-300 leading-relaxed">
                  {[
                    "Smart scale + app captures every formula, gram and ratio",
                    "Cost-per-service, waste and margin visible from day one",
                    "HairGPT and AI agents trained on data competitors don't have",
                    "Aggregated, permissioned dataset → second-act monetization with brands and distributors",
                  ].map((t, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.2}>
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Mindbody", note: "~$1.9B" },
                { label: "Zenoti", note: "~$1.5B" },
                { label: "Vagaro", note: "~$1.0B" },
                { label: "Boulevard", note: "~$0.8B" },
              ].map((c) => (
                <div
                  key={c.label}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-center"
                >
                  <p className="text-sm font-semibold text-white">{c.label}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{c.note}</p>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-gray-500 mt-3 text-center">
              Category comparables — last disclosed valuations / acquisition
              prices, public press; figures illustrate category size, not
              Spectra valuation.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          MODEL — 2,000-salon growth scenario
      ════════════════════════════════════════════════════════════════ */}
      <section
        id="model"
        className="relative py-20 sm:py-28 bg-gradient-to-b from-[#070710] via-[#0c0a1f] to-[#070710]"
      >
        <DotGrid />
        <div className="relative max-w-6xl mx-auto px-6">
          <FadeIn className="text-center max-w-3xl mx-auto mb-12">
            <div className="flex justify-center mb-4">
              <SignalChip tone="amber">Modeled · 12-Month Scenario</SignalChip>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
              From 180 salons to <span className="text-violet-400">2,000</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-400 leading-relaxed">
              A logistic ramp at $200 / salon / month brings Spectra to $400K
              MRR and $4.8M ARR on subscription alone — before any token or
              data-layer upside.
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-10">
              {[
                { label: "ARPU", value: `$${MODEL.arpu}`, sub: "per salon / month" },
                {
                  label: "Salons (M12)",
                  value: (
                    <AnimatedNumber
                      value={MODEL.target}
                      format={(n) => Math.round(n).toLocaleString()}
                    />
                  ),
                  sub: "logistic ramp",
                },
                {
                  label: "MRR (M12)",
                  value: (
                    <>
                      $
                      <AnimatedNumber
                        value={MODEL.mrrAtTarget / 1000}
                        format={(n) => `${Math.round(n)}K`}
                      />
                    </>
                  ),
                  sub: "subscription only",
                },
                {
                  label: "ARR (M12)",
                  value: (
                    <>
                      $
                      <AnimatedNumber
                        value={MODEL.arrAtTarget / 1_000_000}
                        format={(n) => `${n.toFixed(1)}M`}
                      />
                    </>
                  ),
                  sub: "before token upside",
                },
              ].map((m, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-5 text-center"
                >
                  <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-0.5">
                    {m.value}
                  </p>
                  <p className="text-[11px] font-medium text-gray-300 uppercase tracking-wider leading-tight">
                    {m.label}
                  </p>
                  <p className="text-[11px] text-violet-300 mt-1">{m.sub}</p>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                <h3 className="text-lg font-semibold">
                  MRR ramp · salons onboarded by month
                </h3>
                <p className="text-xs text-gray-400">
                  $0 → $400K MRR over 12 months
                </p>
              </div>
              <RampChart />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                {RAMP.slice(1).map((p) => (
                  <div
                    key={p.month}
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-center"
                  >
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                      Month {p.month}
                    </p>
                    <p className="text-sm font-semibold text-white mt-0.5">
                      {p.salons.toLocaleString()} salons
                    </p>
                    <p className="text-[11px] text-violet-300">
                      ${(p.mrr / 1000).toLocaleString()}K MRR
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-gray-500 mt-4">
                Modeled scenario — assumes deliberate Q1 ramp, acceleration
                Q2–Q3, stabilization Q4. Source: internal 2,000-salon growth
                model, anchored to current cohort averages.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          ECONOMICS — CAC, payback, LTV
      ════════════════════════════════════════════════════════════════ */}
      <section
        id="economics"
        className="relative py-20 sm:py-28 bg-[#070710] border-t border-white/5"
      >
        <div className="relative max-w-6xl mx-auto px-6">
          <FadeIn className="max-w-3xl mb-12">
            <SignalChip tone="violet">Unit Economics</SignalChip>
            <h2 className="mt-4 text-3xl sm:text-5xl font-bold tracking-tight">
              $1M GTM in. $4.8M ARR out.
            </h2>
            <p className="mt-5 text-base sm:text-lg text-gray-400 leading-relaxed">
              A blended $500 CAC, 3-month payback at $200 ARPU, and an LTV of
              $7,200 over a 36-month horizon make the 2,000-salon plan
              capital-efficient at SaaS-category benchmarks.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "GTM Budget",
                value: `$${(MODEL.gtmBudget / 1_000_000).toFixed(0)}M`,
                sub: "12-month plan",
              },
              {
                label: "Blended CAC",
                value: `$${MODEL.blendedCac}`,
                sub: `${MODEL.gtmBudget / 1000}K ÷ ${MODEL.target.toLocaleString()} salons`,
              },
              {
                label: "Payback",
                value: `~${MODEL.paybackMonths} mo`,
                sub: `at $${MODEL.arpu} ARPU`,
              },
              {
                label: "LTV (subscription)",
                value: `$${MODEL.ltv.toLocaleString()}`,
                sub: `${MODEL.ltvHorizonMonths}-month horizon`,
              },
            ].map((m, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 h-full">
                  <p className="text-3xl font-bold text-white tracking-tight">
                    {m.value}
                  </p>
                  <p className="text-xs font-medium text-gray-300 uppercase tracking-wider mt-1">
                    {m.label}
                  </p>
                  <p className="text-[11px] text-violet-300 mt-1">{m.sub}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.2}>
            <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-3">
                <SignalChip tone="slate">LTV / CAC</SignalChip>
                <p className="text-sm text-gray-400">
                  ${MODEL.ltv.toLocaleString()} / ${MODEL.blendedCac} ={" "}
                  <span className="text-white font-semibold">
                    {Math.round(MODEL.ltv / MODEL.blendedCac)}×
                  </span>{" "}
                  on subscription alone — before token / data revenue.
                </p>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Pricing is benchmarked against US comparables (Mindbody /
                Booker, Boulevard public pricing) — positioned below
                enterprise-premium but materially above generic SMB, justified
                by hundreds of dollars / month of provable waste and inventory
                savings.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          UPSIDE — Token & data layer
      ════════════════════════════════════════════════════════════════ */}
      <section
        id="upside"
        className="relative py-20 sm:py-28 bg-gradient-to-b from-[#070710] via-[#0a0a18] to-[#070710]"
      >
        <DotGrid />
        <div className="relative max-w-6xl mx-auto px-6">
          <FadeIn className="text-center max-w-3xl mx-auto mb-12">
            <div className="flex justify-center mb-4">
              <SignalChip tone="amber">Illustrative · Second Act</SignalChip>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
              The Token + Data Layer
            </h2>
            <p className="text-base sm:text-lg text-gray-400 leading-relaxed">
              On top of subscription, a metered token economy powers HairGPT
              and AI agents — and an aggregated, permissioned dataset becomes a
              second revenue stream with brands and distributors.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                title: "Base",
                price: "$200",
                tokens: "500 tokens",
                desc: "Color-bar capture + core analytics",
              },
              {
                title: "Pro",
                price: "$350",
                tokens: "2,000 tokens",
                desc: "HairGPT, AI agents, deeper insights",
                highlight: true,
              },
              {
                title: "Studio",
                price: "$600",
                tokens: "5,000 tokens",
                desc: "Multi-location, brand & cohort analytics",
              },
            ].map((p, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div
                  className={`rounded-2xl p-6 h-full border ${
                    p.highlight
                      ? "border-violet-400/40 bg-gradient-to-br from-violet-500/15 via-purple-500/5 to-transparent"
                      : "border-white/10 bg-white/[0.03]"
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    {p.title}
                  </p>
                  <p className="text-3xl font-bold mt-1">
                    {p.price}
                    <span className="text-sm font-normal text-gray-400">
                      {" "}
                      / mo
                    </span>
                  </p>
                  <p className="text-sm text-violet-300 mt-1">{p.tokens}</p>
                  <p className="text-sm text-gray-400 mt-3 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.2}>
            <div className="mt-10 rounded-2xl border border-amber-400/20 bg-gradient-to-r from-amber-500/[0.06] via-violet-500/[0.04] to-transparent p-6 sm:p-8">
              <div className="flex flex-wrap items-baseline gap-3 mb-3">
                <SignalChip tone="amber">Upside Band</SignalChip>
                <p className="text-sm text-gray-300">
                  Conservative ARR including token layer
                </p>
              </div>
              <p className="text-4xl sm:text-5xl font-bold tracking-tight">
                $
                <AnimatedNumber
                  value={MODEL.upsideArrLow / 1_000_000}
                  format={(n) => n.toFixed(1)}
                />
                M
                <span className="text-gray-500 mx-2">—</span>$
                <AnimatedNumber
                  value={MODEL.upsideArrHigh / 1_000_000}
                  format={(n) => n.toFixed(1)}
                />
                M
              </p>
              <p className="text-sm text-gray-400 mt-3 max-w-3xl leading-relaxed">
                Assumes $20–$40 / month per salon of token consumption on top
                of the $200 base, plus illustrative data-buyer queries from
                brands and distributors (2k–50k tokens per query). Aggregated,
                permissioned data only — no identifiable client data is ever
                sold. Modeled, not realized.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          VALIDATION — Pilots
      ════════════════════════════════════════════════════════════════ */}
      <section
        id="validation"
        className="relative py-20 sm:py-28 bg-[#070710] border-t border-white/5"
      >
        <div className="relative max-w-5xl mx-auto px-6">
          <FadeIn className="text-center max-w-3xl mx-auto mb-12">
            <SignalChip tone="emerald">External Validation</SignalChip>
            <h2 className="mt-4 text-3xl sm:text-5xl font-bold tracking-tight">
              Already paying. Already proving the data.
            </h2>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-4">
            {VALIDATION_PILOTS.map((p, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 h-full">
                  <SignalChip tone="emerald">{p.tag}</SignalChip>
                  <h3 className="text-lg font-semibold mt-4">{p.title}</h3>
                  <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                    {p.detail}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          CTA
      ════════════════════════════════════════════════════════════════ */}
      <section
        id="cta"
        className="relative py-24 sm:py-32 overflow-hidden bg-gradient-to-b from-[#070710] to-[#0c0a1f]"
      >
        <div className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[80%] h-[80%] bg-gradient-to-b from-violet-600/20 via-purple-500/10 to-transparent rounded-full blur-[160px]" />
        <DotGrid />

        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <FadeIn>
            <SignalChip>Contact</SignalChip>
            <h2 className="mt-4 text-3xl sm:text-5xl font-bold tracking-tight">
              Want the full Spectra Signal data room?
            </h2>
            <p className="mt-5 text-base sm:text-lg text-gray-400 leading-relaxed">
              Live MRR, cohort retention, token economics, and the 2,000-salon
              model — with sources and sensitivities — available under NDA.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a
                href="mailto:maor@spectra-ci.com?subject=Spectra%20Signal%20-%20Data%20Room%20Access"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/25"
              >
                Email Maor
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </a>
              <a
                href="/investors"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-white/15 text-white/85 text-sm font-semibold hover:bg-white/5 transition-colors"
              >
                See Investor Overview
              </a>
            </div>
            <p className="text-[11px] text-gray-500 mt-10 leading-relaxed max-w-2xl mx-auto">
              All current metrics are sourced from internal product telemetry.
              The 2,000-salon scenario, token economics and upside band are
              modeled — provided as planning math, not as realized revenue.
              Comparable valuations cited from public press; not Spectra
              valuation.
            </p>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
