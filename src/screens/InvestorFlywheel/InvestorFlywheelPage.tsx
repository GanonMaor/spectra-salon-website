import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  Scale,
  Brain,
  Database,
  TrendingUp,
  Sparkles,
  ChevronDown,
  ArrowRight,
  BarChart3,
  Send,
  Globe2,
  ShieldCheck,
  Lock,
  Layers,
  Target,
  Workflow,
  Weight,
  CheckCircle2,
} from "lucide-react";
import {
  getSummary,
  getMonthlyGrowth,
  getCityNodes,
  getTopBrands,
} from "./flywheel-data";
import type { FlywheelSummary } from "./flywheel-data";
import {
  REVENUE_DATA,
  total2024,
  total2025,
  PRODUCT_KPI,
  VALIDATION_PILOTS,
} from "../investor-shared/investor-metrics";

// ── Utilities ────────────────────────────────────────────────────────

function fmtCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(0)}K`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function fmtDollar(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

// ── Animated Counter ─────────────────────────────────────────────────

function AnimatedNumber({
  value,
  format,
}: {
  value: number;
  format?: (n: number) => string;
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
    const duration = 2000;
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
  }, [inView, value, reduced]);

  const fmt = format || ((n: number) => Math.round(n).toLocaleString());
  return <span ref={ref}>{fmt(current)}</span>;
}

// ── Fade-in wrapper ──────────────────────────────────────────────────

function FadeIn({
  children,
  delay = 0,
  className = "",
  y = 30,
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

function SectionLabel({
  color,
  children,
}: {
  color: string;
  children: React.ReactNode;
}) {
  return (
    <p
      className={`text-sm font-semibold tracking-wider uppercase mb-3 ${color}`}
    >
      {children}
    </p>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 1 — HERO: Credibility in 5 seconds
// ═══════════════════════════════════════════════════════════════════════

const HERO_NODES = [
  {
    label: "180+ Active Salons",
    sub: "Paying subscriptions",
    icon: Scale,
    angle: 270,
  },
  {
    label: "16K+ Services / Month",
    sub: "Tracked and structured",
    icon: Database,
    angle: 30,
  },
  {
    label: "HairGPT",
    sub: "AI over real data",
    icon: Brain,
    angle: 150,
  },
] as const;

function HeroCircle() {
  const reduced = useReducedMotion();
  const RING = 170;

  return (
    <div className="relative w-[420px] h-[420px] mx-auto flex-shrink-0">
      <div className="absolute inset-[30px] rounded-full border-2 border-dashed border-violet-200/60" />

      <motion.div
        className="absolute inset-0"
        animate={reduced ? {} : { rotate: 360 }}
        transition={
          reduced
            ? { duration: 0 }
            : { duration: 60, repeat: Infinity, ease: "linear" }
        }
      >
        {[0, 120, 240].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const cx = 210 + RING * Math.cos(rad);
          const cy = 210 + RING * Math.sin(rad);
          return (
            <div
              key={deg}
              className="absolute w-3 h-3 text-violet-400"
              style={{
                left: cx - 6,
                top: cy - 6,
                transform: `rotate(${deg + 90}deg)`,
              }}
            >
              <svg viewBox="0 0 12 12" fill="currentColor">
                <path d="M6 0 L12 8 L6 6 L0 8 Z" />
              </svg>
            </div>
          );
        })}
      </motion.div>

      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="w-28 h-28 rounded-full bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500 flex items-center justify-center shadow-xl shadow-violet-400/25"
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={reduced ? { duration: 0 } : { duration: 0.7, delay: 0.2 }}
        >
          <div className="text-center leading-tight">
            <p className="text-white font-bold text-sm tracking-tight">Spectra</p>
            <p className="text-white/80 font-bold text-lg -mt-0.5">AI</p>
          </div>
        </motion.div>
      </div>

      {HERO_NODES.map((node, i) => {
        const Icon = node.icon;
        const rad = (node.angle * Math.PI) / 180;
        const x = 210 + RING * Math.cos(rad);
        const y = 210 + RING * Math.sin(rad);
        return (
          <motion.div
            key={i}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: x, top: y }}
            initial={reduced ? false : { opacity: 0, scale: 0.7 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={
              reduced ? { duration: 0 } : { duration: 0.6, delay: 0.3 + i * 0.15 }
            }
          >
            <div className="w-[150px] bg-white/80 backdrop-blur-sm border border-violet-100/70 rounded-2xl p-3.5 shadow-md shadow-violet-200/15 text-center">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center mx-auto mb-2">
                <Icon className="w-4 h-4 text-violet-600" />
              </div>
              <p className="text-xs font-bold text-gray-800 leading-tight">{node.label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">{node.sub}</p>
            </div>
          </motion.div>
        );
      })}

      <div className="absolute inset-[15%] rounded-full bg-violet-100/30 blur-3xl -z-10" />
    </div>
  );
}

function HeroCircleMobile() {
  const reduced = useReducedMotion();
  return (
    <div className="relative w-[300px] h-[300px] mx-auto flex-shrink-0">
      <div className="absolute inset-[20px] rounded-full border-2 border-dashed border-violet-200/60" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500 flex items-center justify-center shadow-xl shadow-violet-400/25">
          <div className="text-center leading-tight">
            <p className="text-white font-bold text-[11px] tracking-tight">Spectra</p>
            <p className="text-white/80 font-bold text-base -mt-0.5">AI</p>
          </div>
        </div>
      </div>
      {HERO_NODES.map((node, i) => {
        const Icon = node.icon;
        const rad = (node.angle * Math.PI) / 180;
        const RING_M = 120;
        const x = 150 + RING_M * Math.cos(rad);
        const y = 150 + RING_M * Math.sin(rad);
        return (
          <motion.div
            key={i}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: x, top: y }}
            initial={reduced ? false : { opacity: 0, scale: 0.7 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={reduced ? { duration: 0 } : { duration: 0.6, delay: 0.2 + i * 0.12 }}
          >
            <div className="w-[110px] bg-white/80 backdrop-blur-sm border border-violet-100/70 rounded-xl p-2.5 shadow-md shadow-violet-200/15 text-center">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center mx-auto mb-1.5">
                <Icon className="w-3.5 h-3.5 text-violet-600" />
              </div>
              <p className="text-[10px] font-bold text-gray-800 leading-tight">{node.label}</p>
              <p className="text-[9px] text-gray-400 mt-0.5 leading-snug">{node.sub}</p>
            </div>
          </motion.div>
        );
      })}
      <div className="absolute inset-[15%] rounded-full bg-violet-100/30 blur-3xl -z-10" />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-[100dvh] flex items-center overflow-hidden bg-gradient-to-br from-[#f4f0fb] via-[#eee8f6] to-[#e9e2f3]">
      <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-gradient-to-bl from-violet-200/40 via-purple-100/20 to-transparent rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[45%] h-[50%] bg-gradient-to-tr from-fuchsia-100/25 via-violet-100/15 to-transparent rounded-full blur-[100px]" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 py-20 sm:py-24">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-14 lg:gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="max-w-xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 border border-violet-200/60 text-violet-600 text-xs font-semibold tracking-widest uppercase mb-8 backdrop-blur-sm shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Strong Early Market Validation
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-gray-900 leading-[1.1] tracking-tight">
              We Turn Hair Color Workflows Into{" "}
              <span className="bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent">
                Measured, Proprietary Data.
              </span>
            </h1>

            <p className="mt-7 text-lg sm:text-xl text-gray-500 leading-relaxed max-w-md">
              3 years built. 180+ salons onboarded. 16K+ monthly services
              tracked. HairGPT runs on real production data.
            </p>

            <div className="flex flex-wrap gap-3 mt-10">
              <a
                href="#traction"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/25"
              >
                See the Numbers
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.25 }}
          >
            <div className="hidden sm:block"><HeroCircle /></div>
            <div className="block sm:hidden"><HeroCircleMobile /></div>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      >
        <ChevronDown className="w-5 h-5 text-gray-400/40" />
      </motion.div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 2 — TRACTION WALL: Prove usage, retention, monetization
// ═══════════════════════════════════════════════════════════════════════

function TractionWallSection() {
  return (
    <section id="traction" className="py-20 sm:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <FadeIn className="text-center max-w-2xl mx-auto mb-14">
          <SectionLabel color="text-violet-600">Traction</SectionLabel>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Proven Demand. Growing Revenue.
          </h2>
        </FadeIn>

        {/* Top row — headline KPIs */}
        <FadeIn>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
            {[
              { label: "2025 Revenue", value: `$${Math.round(total2025 / 1000)}K`, accent: true },
              { label: "Active Salons", value: "180+", accent: false },
              { label: "Services / Month", value: "16K+", accent: false },
              { label: "M1 Retention", value: `${PRODUCT_KPI.retentionM1}%`, accent: true },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className={`rounded-2xl p-5 sm:p-6 text-center border ${
                  kpi.accent
                    ? "bg-violet-50 border-violet-200"
                    : "bg-white border-gray-200"
                }`}
              >
                <p className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-1">
                  {kpi.value}
                </p>
                <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {kpi.label}
                </p>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Second row — proof KPIs */}
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 mb-4">
            {[
              { label: "Grams / Account / Mo", value: "6.3K" },
              { label: "Brands Tracked", value: `${PRODUCT_KPI.totalBrandsTracked}` },
              { label: "Total Accounts", value: `${PRODUCT_KPI.totalUniqueAccounts}` },
              { label: "Product Value / Mo", value: "$313K" },
              { label: "M3 Retention", value: `${PRODUCT_KPI.retentionM3}%` },
              { label: "M6 Retention", value: `${PRODUCT_KPI.retentionM6}%` },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="rounded-xl bg-gray-50 border border-gray-100 p-3 sm:p-4 text-center"
              >
                <p className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight mb-0.5">
                  {kpi.value}
                </p>
                <p className="text-[9px] sm:text-[10px] font-medium text-gray-400 uppercase tracking-wider leading-tight">
                  {kpi.label}
                </p>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Third row — validation */}
        <FadeIn delay={0.15}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {VALIDATION_PILOTS.map((p) => (
              <div
                key={p.tag}
                className="flex items-start gap-4 p-4 sm:p-5 rounded-2xl border border-violet-100 bg-violet-50/30"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                  <span className="text-violet-600 text-xs font-bold">{p.tag}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-0.5">{p.title}</p>
                  <p className="text-xs text-gray-500">{p.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Deep-dive dropdown */}
        <FadeIn delay={0.2}>
          <details className="group">
            <summary className="cursor-pointer list-none flex items-center justify-center gap-2 py-3 select-none">
              <span className="text-sm font-medium text-gray-400 group-hover:text-gray-600 transition-colors">
                Deep dive: revenue breakdown &amp; unit economics
              </span>
              <svg
                className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform group-open:rotate-180"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="rounded-2xl bg-gray-50 border border-gray-200 p-5 sm:p-6 mt-3 space-y-6">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">2024 Revenue</p>
                  <p className="text-xl font-bold text-gray-900">${Math.round(total2024 / 1000)}K</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">2025 Revenue</p>
                  <p className="text-xl font-bold text-gray-900">${Math.round(total2025 / 1000)}K</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">YoY Growth</p>
                  <p className="text-xl font-bold text-violet-600">+{Math.round(((total2025 / total2024) - 1) * 100)}%</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Israel ARPU", value: "$68/mo" },
                  { label: "Intl ARPU", value: "$58/mo" },
                  { label: "Avg Services / Account", value: `${PRODUCT_KPI.avgServicesPerAccount}` },
                  { label: "Avg Visits / Account", value: `${PRODUCT_KPI.avgVisitsPerAccount}` },
                ].map((m) => (
                  <div key={m.label} className="rounded-xl border border-gray-200 bg-white p-3 text-center">
                    <p className="text-base font-bold text-gray-900">{m.value}</p>
                    <p className="text-[9px] text-gray-400 uppercase">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </details>
        </FadeIn>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 3 — TECHNICAL MOAT: Why we win
// ═══════════════════════════════════════════════════════════════════════

const MOAT_LAYERS = [
  {
    icon: Workflow,
    title: "Workflow Embedding",
    body: "Data captured at the moment of creation, not after the fact. The stylist scans, weighs, mixes \u2014 Spectra records every gram.",
    accent: "from-violet-500 to-purple-500",
  },
  {
    icon: Weight,
    title: "Hardware Capture",
    body: "Structured grams-level measurement from a connected smart scale. Not self-reported. Not estimated. Measured.",
    accent: "from-blue-500 to-violet-500",
  },
  {
    icon: Database,
    title: "Compounding Dataset",
    body: `${PRODUCT_KPI.totalUniqueAccounts} accounts, ${PRODUCT_KPI.totalBrandsTracked} brands, 17+ months of data. Every new salon compounds the asset.`,
    accent: "from-violet-500 to-purple-500",
  },
  {
    icon: Brain,
    title: "AI Flywheel",
    body: "Better data produces better AI. Better AI produces more salon ROI. More ROI drives adoption. More adoption produces more data.",
    accent: "from-purple-500 to-fuchsia-500",
  },
  {
    icon: Layers,
    title: "Expansion Lock-in",
    body: "Color-cost wedge opens the door. Inventory, calendar, ordering, and analytics keep it locked.",
    accent: "from-emerald-500 to-teal-500",
  },
];

const COMPETITOR_GRID = [
  { capability: "Workflow Capture", spectra: true, salonscale: "Partial", fresha: false, zenoti: false },
  { capability: "Grams-Level Measurement", spectra: true, salonscale: true, fresha: false, zenoti: false },
  { capability: "Salon OS Expansion", spectra: true, salonscale: false, fresha: true, zenoti: true },
  { capability: "Data Intelligence Layer", spectra: true, salonscale: false, fresha: false, zenoti: false },
];

function TechnicalMoatSection() {
  return (
    <section className="py-20 sm:py-28 bg-gradient-to-b from-white to-[#f5f0fa]">
      <div className="max-w-6xl mx-auto px-6">
        <FadeIn className="text-center max-w-2xl mx-auto mb-14">
          <SectionLabel color="text-purple-600">Defensibility</SectionLabel>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Five Layers of Competitive Moat
          </h2>
          <p className="mt-4 text-gray-500 text-lg leading-relaxed">
            Each layer makes the next one harder to replicate.
          </p>
        </FadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-14">
          {MOAT_LAYERS.map((layer, i) => {
            const Icon = layer.icon;
            return (
              <FadeIn key={i} delay={i * 0.08}>
                <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 hover:shadow-md transition-shadow duration-300 h-full flex flex-col">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${layer.accent} flex items-center justify-center mb-4`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{layer.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed flex-1">{layer.body}</p>
                </div>
              </FadeIn>
            );
          })}
        </div>

        {/* Competitor comparison grid */}
        <FadeIn delay={0.3}>
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900">Competitive Comparison</p>
              <p className="text-xs text-gray-400 mt-0.5">Spectra is the only platform with all four capabilities.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left p-3 sm:p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Capability</th>
                    <th className="text-center p-3 sm:p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">SalonScale / Vish</th>
                    <th className="text-center p-3 sm:p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Fresha / Boulevard</th>
                    <th className="text-center p-3 sm:p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Zenoti / Mindbody</th>
                    <th className="text-center p-3 sm:p-4 text-xs font-bold text-violet-600 uppercase tracking-wider">Spectra</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPETITOR_GRID.map((row, i) => (
                    <tr key={i} className={i < COMPETITOR_GRID.length - 1 ? "border-b border-gray-50" : ""}>
                      <td className="p-3 sm:p-4 text-gray-700 font-medium">{row.capability}</td>
                      <td className="p-3 sm:p-4 text-center">
                        {row.salonscale === true ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                        ) : row.salonscale === "Partial" ? (
                          <span className="text-xs text-amber-500 font-medium">Partial</span>
                        ) : (
                          <span className="text-xs text-gray-300">&mdash;</span>
                        )}
                      </td>
                      <td className="p-3 sm:p-4 text-center">
                        {row.fresha ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                        ) : (
                          <span className="text-xs text-gray-300">&mdash;</span>
                        )}
                      </td>
                      <td className="p-3 sm:p-4 text-center">
                        {row.zenoti ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                        ) : (
                          <span className="text-xs text-gray-300">&mdash;</span>
                        )}
                      </td>
                      <td className="p-3 sm:p-4 text-center">
                        <CheckCircle2 className="w-4 h-4 text-violet-600 mx-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 4 — DATA ADVANTAGE: What we have
// ═══════════════════════════════════════════════════════════════════════

function DataAdvantageSection({ summary }: { summary: FlywheelSummary }) {
  const growth = useMemo(() => getMonthlyGrowth(), []);
  const cities = useMemo(() => getCityNodes(), []);
  const topBrands = useMemo(() => getTopBrands(), []);

  const chartTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 text-sm">
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center gap-2 py-0.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-gray-600">{p.name}:</span>
            <span className="font-medium text-gray-900 ml-auto tabular-nums">
              {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <FadeIn className="text-center max-w-2xl mx-auto mb-6">
          <SectionLabel color="text-purple-600">Proprietary Data Asset</SectionLabel>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            The Dataset Compounds Every Month
          </h2>
          <p className="mt-4 text-gray-500 text-lg leading-relaxed">
            Not just revenue growth &mdash; data growth. The real value
            is in the structured production dataset that powers the intelligence layer.
          </p>
        </FadeIn>

        {/* Growth delta pills */}
        <FadeIn delay={0.1}>
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {[
              { label: "Services", pct: summary.growth.servicesPct, color: "bg-violet-50 text-violet-700 border-violet-200" },
              { label: "Visits", pct: summary.growth.visitsPct, color: "bg-purple-50 text-purple-700 border-purple-200" },
              { label: "Data Records", pct: summary.growth.recordsPct, color: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200" },
              { label: "Product Volume", pct: summary.growth.gramsPct, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
            ].map((g) => (
              <span key={g.label} className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${g.color}`}>
                <TrendingUp className="w-3 h-3" />
                {g.label}: +{g.pct}%
              </span>
            ))}
          </div>
        </FadeIn>

        {/* Growth chart (hero visual) */}
        <FadeIn delay={0.15}>
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4 sm:p-8 mb-8">
            <div className="flex flex-wrap gap-6 mb-6 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1.5 rounded-full bg-violet-500" />Services / month
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1.5 rounded-full bg-purple-400" />Visits / month
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1.5 rounded-full bg-fuchsia-400" />Cumulative Data Records
              </span>
            </div>
            <ResponsiveContainer width="100%" height={360}>
              <ComposedChart data={growth}>
                <defs>
                  <linearGradient id="gCum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d946ef" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#d946ef" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => fmtCompact(v)} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => fmtCompact(v)} />
                <Tooltip content={chartTooltip as any} />
                <Area yAxisId="right" type="monotone" dataKey="cumulativeRecords" name="Cumulative Records" fill="url(#gCum)" stroke="#d946ef" strokeWidth={2} dot={false} />
                <Line yAxisId="left" type="monotone" dataKey="services" name="Services" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 3, fill: "#8b5cf6" }} activeDot={{ r: 5 }} />
                <Line yAxisId="left" type="monotone" dataKey="visits" name="Visits" stroke="#a855f7" strokeWidth={1.5} strokeDasharray="5 3" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </FadeIn>

        {/* City nodes + Brand coverage (secondary) */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <FadeIn delay={0.2}>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-violet-100/60 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Globe2 className="w-5 h-5 text-violet-500" />
                <h3 className="text-gray-900 font-semibold">Ground-Level Coverage</h3>
                <span className="ml-auto text-xs text-gray-400 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-100">
                  {cities.length} cities
                </span>
              </div>
              <div className="space-y-3">
                {cities.slice(0, 8).map((city, i) => (
                  <div key={city.name} className="flex items-center gap-3">
                    <motion.div
                      className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                      style={{ boxShadow: "0 0 8px rgba(139,92,246,0.5)" }}
                    />
                    <span className="text-sm text-gray-700 w-28 flex-shrink-0 truncate">{city.displayName}</span>
                    <div className="flex-1 h-1.5 bg-violet-100/60 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${Math.max(city.normalizedActivity * 100, 8)}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: i * 0.06 }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 tabular-nums w-16 text-right">{fmtCompact(city.records)}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.25}>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-purple-100/60 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-5 h-5 text-purple-500" />
                <h3 className="text-gray-900 font-semibold">Cross-Brand Intelligence</h3>
                <span className="ml-auto text-xs text-gray-400 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                  {PRODUCT_KPI.totalBrandsTracked} brands
                </span>
              </div>
              <div className="space-y-3">
                {topBrands.map((brand, i) => (
                  <div key={brand.brand} className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-4 text-right tabular-nums">{i + 1}</span>
                    <span className="text-sm text-gray-700 w-40 truncate flex-shrink-0">{brand.brand}</span>
                    <div className="flex-1 h-1.5 bg-purple-100/60 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-400"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${brand.share * 3}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: i * 0.06 }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 tabular-nums w-12 text-right">{brand.share}%</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Simplified 3-step pipeline */}
        <FadeIn delay={0.3}>
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100/60 rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              {[
                { icon: Scale, label: "Salon Floor", detail: "Workflow capture" },
                { icon: Database, label: "Structured Dataset", detail: `${fmtCompact(summary.totalDataPoints)} records` },
                { icon: Brain, label: "Intelligence + AI", detail: "HairGPT & analytics" },
              ].map((step, i) => {
                const Icon = step.icon;
                return (
                  <React.Fragment key={i}>
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-xl bg-white border border-violet-100 flex items-center justify-center mb-2">
                        <Icon className="w-5 h-5 text-violet-600" />
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">{step.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{step.detail}</p>
                    </div>
                    {i < 2 && <ArrowRight className="w-5 h-5 text-violet-300 hidden sm:block flex-shrink-0" />}
                  </React.Fragment>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-4 mt-5 pt-4 border-t border-violet-100/60 text-center">
              <p className="text-sm text-gray-500">
                {summary.dateRange.from} &mdash; {summary.dateRange.to} &middot; {summary.totalMonths} months of continuous collection
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 5 — HairGPT: AI built on measured inputs
// ═══════════════════════════════════════════════════════════════════════

const PROMPTS = [
  {
    q: "Which color brand is gaining market share in premium salons?",
    a: "Based on product-weight data across our tracked salons, L\u2019Or\u00e9al Professionnel leads with steady share growth in A+ tier salons over the past 6 months, driven by increased color-service grams per visit.",
  },
  {
    q: "What is the average product usage per service in Tel Aviv?",
    a: "Tel Aviv salons average 52.3g of color product per service, 14% above the national average. Highlights services consume 78.1g on average, reflecting the city\u2019s premium positioning.",
  },
  {
    q: "How did highlights demand trend over the last quarter?",
    a: "Highlights services grew 18% quarter-over-quarter across all tracked salons. Toner add-on rate increased to 61%, suggesting a shift toward multi-step coloring processes.",
  },
  {
    q: "Where should a distributor focus inventory next month?",
    a: "Based on consumption velocity and seasonal patterns, Kfar Saba and Krayot regions show accelerating demand. Recommend increasing SCHWARZKOPF color stock by 12% and toner by 20% in these territories.",
  },
];

const INSIGHT_TYPES = [
  "Brand share shifts by region",
  "Average grams per service per city",
  "Seasonal demand patterns",
  "Distributor territory optimization",
];

function HairGptSection() {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setActiveIdx((i) => (i + 1) % PROMPTS.length), 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-20 sm:py-28 bg-gradient-to-b from-white to-[#f5f0fa]">
      <div className="max-w-6xl mx-auto px-6">
        <FadeIn className="text-center max-w-2xl mx-auto mb-14">
          <SectionLabel color="text-violet-600">Spectra AI</SectionLabel>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            The First Hair AI Built on Measured Production Data
          </h2>
          <p className="mt-4 text-gray-500 text-lg leading-relaxed">
            HairGPT is not a general chatbot. It answers from Spectra&apos;s proprietary
            dataset &mdash; {PRODUCT_KPI.totalUniqueAccounts} accounts,{" "}
            {PRODUCT_KPI.totalBrandsTracked} brands, 17 months of measured production events.
          </p>
        </FadeIn>

        <FadeIn>
          <div className="max-w-3xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-violet-100/60 overflow-hidden shadow-lg shadow-violet-200/20">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-violet-100/40 bg-violet-50/40">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/50" />
                </div>
                <span className="ml-3 text-xs text-gray-400 font-mono">HairGPT &mdash; Spectra AI</span>
              </div>
              <div className="px-5 pt-5 pb-3">
                <div className="flex items-center gap-3 bg-violet-50/60 border border-violet-100/60 rounded-xl px-4 py-3">
                  <Sparkles className="w-4 h-4 text-violet-500 flex-shrink-0" />
                  <span className="text-gray-400 text-sm flex-1">Ask about the hair industry...</span>
                  <Send className="w-4 h-4 text-gray-300" />
                </div>
              </div>
              <div className="px-5 pb-6 min-h-[200px]">
                {PROMPTS.map((p, i) => (
                  <motion.div
                    key={i}
                    initial={false}
                    animate={{
                      opacity: i === activeIdx ? 1 : 0,
                      y: i === activeIdx ? 0 : 10,
                      position: i === activeIdx ? "relative" : "absolute",
                    }}
                    transition={{ duration: 0.5 }}
                    className={i !== activeIdx ? "pointer-events-none" : ""}
                    style={i !== activeIdx ? { visibility: "hidden" } : undefined}
                  >
                    <div className="flex gap-3 mb-4">
                      <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[10px] text-violet-600 font-bold">Q</span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{p.q}</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Sparkles className="w-3 h-3 text-purple-500" />
                      </div>
                      <p className="text-gray-500 text-sm leading-relaxed">{p.a}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="flex justify-center gap-2 pb-5">
                {PROMPTS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIdx(i)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${i === activeIdx ? "bg-violet-500 w-6" : "bg-gray-200 hover:bg-gray-300"}`}
                    aria-label={`Show example ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Insight type cards */}
        <FadeIn delay={0.15}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 max-w-3xl mx-auto">
            {INSIGHT_TYPES.map((insight) => (
              <div key={insight} className="rounded-xl bg-violet-50/50 border border-violet-100 px-3 py-2.5 text-center">
                <p className="text-xs font-medium text-violet-700">{insight}</p>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 6 — FLYWHEEL BRIDGE: How it compounds (short)
// ═══════════════════════════════════════════════════════════════════════

function FlywheelBridgeSection() {
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-[#f5f0fa] to-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <FadeIn>
          <SectionLabel color="text-purple-600">Compounding Effect</SectionLabel>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-6">
            Every Service Makes the Intelligence Layer Stronger
          </h2>

          {/* Simple flywheel SVG */}
          <div className="flex justify-center mb-8">
            <svg viewBox="0 0 420 420" className="w-full max-w-[320px]" aria-label="Spectra flywheel">
              <circle cx="210" cy="210" r="155" fill="none" stroke="#E9D5FF" strokeWidth="2" strokeDasharray="8 5" />
              {[0, 72, 144, 216, 288].map((deg) => {
                const arrowDeg = -90 + deg + 36;
                const rad = (arrowDeg * Math.PI) / 180;
                const ax = 210 + 155 * Math.cos(rad);
                const ay = 210 + 155 * Math.sin(rad);
                return (
                  <g key={deg} transform={`translate(${ax}, ${ay}) rotate(${arrowDeg + 90})`}>
                    <polygon points="0,-5 4,3 -4,3" fill="#A78BFA" />
                  </g>
                );
              })}
              <circle cx="210" cy="210" r="42" fill="url(#fwGrad)" />
              <defs>
                <linearGradient id="fwGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#7C3AED" />
                  <stop offset="100%" stopColor="#C026D3" />
                </linearGradient>
              </defs>
              <text x="210" y="206" textAnchor="middle" fill="white" fontSize="11" fontWeight="700">Spectra</text>
              <text x="210" y="220" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="10" fontWeight="600">AI</text>
              {[
                { label: "More Salons", angle: -90 },
                { label: "More Data", angle: -18 },
                { label: "Better AI", angle: 54 },
                { label: "Stronger ROI", angle: 126 },
                { label: "Faster Adoption", angle: 198 },
              ].map((node) => {
                const rad = (node.angle * Math.PI) / 180;
                const nx = 210 + 155 * Math.cos(rad);
                const ny = 210 + 155 * Math.sin(rad);
                return (
                  <g key={node.label}>
                    <circle cx={nx} cy={ny} r="24" fill="white" stroke="#E9D5FF" strokeWidth="2" />
                    <circle cx={nx} cy={ny} r="4" fill="#7C3AED" />
                    <text x={nx} y={ny + 36} textAnchor="middle" fill="#374151" fontSize="9" fontWeight="600">{node.label}</text>
                  </g>
                );
              })}
            </svg>
          </div>

          <p className="text-gray-500 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-8">
            The traction above is not just revenue. It is a growing data asset.
            More salons produce more signals. More signals produce better AI.
            Better AI produces more value. The cycle accelerates.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            {["Cost intelligence", "Waste reduction", "Inventory accuracy", "Formula optimization"].map((chip) => (
              <span key={chip} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-violet-50 border border-violet-200 text-xs font-semibold text-violet-700">
                <Target className="w-3 h-3" />
                {chip}
              </span>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 7 — REVENUE LAYERS: How we make money
// ═══════════════════════════════════════════════════════════════════════

const FUTURE_TIERS = [
  {
    icon: BarChart3,
    title: "Brand Intelligence",
    audience: "For Color Brands",
    features: [
      "Market share tracking by region",
      "Competitive positioning analytics",
      "Product adoption trend forecasts",
      "Salon-tier penetration metrics",
    ],
    accent: "from-violet-500 to-purple-400",
    border: "border-violet-200",
  },
  {
    icon: Globe2,
    title: "Distributor Insights",
    audience: "For Distributors",
    features: [
      "Regional demand heatmaps",
      "Inventory optimization signals",
      "Territory planning intelligence",
      "Cross-brand consumption patterns",
    ],
    accent: "from-violet-500 to-purple-500",
    border: "border-violet-200",
  },
  {
    icon: TrendingUp,
    title: "Industry Analytics",
    audience: "For Investors & Analysts",
    features: [
      "TAM/SAM sizing with live data",
      "Segment growth rate benchmarks",
      "Pricing trend intelligence",
      "Market consolidation signals",
    ],
    accent: "from-amber-500 to-orange-500",
    border: "border-amber-200",
  },
];

function RevenueLayersSection() {
  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <FadeIn className="text-center max-w-2xl mx-auto mb-14">
          <SectionLabel color="text-purple-600">Revenue Model</SectionLabel>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Three Revenue Layers
          </h2>
          <p className="mt-4 text-gray-500 text-lg leading-relaxed">
            SaaS subscriptions today, intelligence products validated, data-as-a-service next.
          </p>
        </FadeIn>

        {/* Layer 1: Today */}
        <FadeIn>
          <div className="rounded-2xl border-2 border-violet-200 bg-violet-50/30 p-6 sm:p-8 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-0.5 rounded-full bg-violet-600 text-white text-[10px] font-bold uppercase tracking-wider">Today</span>
              <h3 className="text-lg font-bold text-gray-900">SaaS Subscriptions</h3>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">${Math.round(total2025 / 1000)}K</p>
                <p className="text-xs text-gray-500">2025 Revenue</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">180+</p>
                <p className="text-xs text-gray-500">Active Salons</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">$58&ndash;68</p>
                <p className="text-xs text-gray-500">ARPU / month</p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Layer 2: Validated */}
        <FadeIn delay={0.1}>
          <div className="rounded-2xl border border-purple-200 bg-purple-50/20 p-6 sm:p-8 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-0.5 rounded-full bg-purple-500 text-white text-[10px] font-bold uppercase tracking-wider">Validated</span>
              <h3 className="text-lg font-bold text-gray-900">Intelligence Products</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {VALIDATION_PILOTS.map((p) => (
                <div key={p.tag} className="flex items-start gap-3 p-3 rounded-xl border border-purple-100 bg-white">
                  <span className="text-purple-600 text-xs font-bold mt-0.5">{p.tag}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{p.title}</p>
                    <p className="text-xs text-gray-500">{p.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Layer 3: Next */}
        <FadeIn delay={0.2}>
          <div className="rounded-2xl border border-gray-200 bg-gray-50/30 p-6 sm:p-8 mb-8">
            <div className="flex items-center gap-2 mb-6">
              <span className="px-2 py-0.5 rounded-full bg-gray-400 text-white text-[10px] font-bold uppercase tracking-wider">Next</span>
              <h3 className="text-lg font-bold text-gray-900">Data-as-a-Service</h3>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FUTURE_TIERS.map((tier, i) => {
                const Icon = tier.icon;
                return (
                  <div key={i} className={`bg-white rounded-2xl border ${tier.border} shadow-sm p-5 flex flex-col`}>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tier.accent} flex items-center justify-center mb-4`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{tier.audience}</p>
                    <h4 className="text-base font-bold text-gray-900 mt-0.5 mb-3">{tier.title}</h4>
                    <ul className="space-y-2 flex-1">
                      {tier.features.map((f, fi) => (
                        <li key={fi} className="flex items-start gap-2 text-xs text-gray-600">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </FadeIn>

        {/* Market sizing strip */}
        <FadeIn delay={0.3}>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-violet-50 border border-violet-200 p-4">
              <p className="text-xl sm:text-2xl font-bold text-violet-700">$447B</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">TAM: Salon Services (2032)</p>
            </div>
            <div className="rounded-xl bg-purple-50 border border-purple-200 p-4">
              <p className="text-xl sm:text-2xl font-bold text-purple-700">$52B</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">SAM: Hair Colour (2032)</p>
            </div>
            <div className="rounded-xl bg-fuchsia-50 border border-fuchsia-200 p-4">
              <p className="text-xl sm:text-2xl font-bold text-fuchsia-700">Entry</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Color-heavy salons now</p>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 8 — CTA: Convert investor attention into action
// ═══════════════════════════════════════════════════════════════════════

function CtaSection() {
  return (
    <section className="py-20 sm:py-28 bg-gradient-to-b from-white to-[#f5f0fa]">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <FadeIn>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-xs font-semibold mb-8">
            <Lock className="w-3 h-3" />
            Growth Round
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 max-w-xl mx-auto leading-tight mb-6">
            Product proof, data advantage, early commercial validation. Time to scale.
          </h2>

          <p className="text-gray-500 text-lg max-w-lg mx-auto mb-10 leading-relaxed">
            We have product proof, data advantage, and early commercial validation.
            The next step is scaling distribution and onboarding fast enough to own the category.
          </p>

          <div className="inline-block text-left bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 mb-10 w-full max-w-md">
            <p className="text-sm font-bold text-gray-900 mb-1">$300K Growth Equity</p>
            <p className="text-xs text-gray-400 mb-4">Use of funds:</p>
            <ul className="space-y-2.5">
              {[
                "Scale US marketing on proven channels",
                "AI-powered onboarding for faster customer intake",
                "New modules that grow revenue per customer",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <span className="text-violet-600 font-bold text-base leading-none mt-0.5">0{i + 1}</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="mailto:investors@spectra.ai"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/20"
            >
              Request Investor Access
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════

export function InvestorFlywheelPage() {
  const summary = useMemo(() => getSummary(), []);

  return (
    <div
      className="min-h-[100dvh] overflow-x-hidden"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      <style>{`div::-webkit-scrollbar { display: none; }`}</style>
      <HeroSection />
      <TractionWallSection />
      <TechnicalMoatSection />
      <DataAdvantageSection summary={summary} />
      <HairGptSection />
      <FlywheelBridgeSection />
      <RevenueLayersSection />
      <CtaSection />

      <footer className="py-8 bg-[#f0ecf7] border-t border-violet-100/50 text-center">
        <p className="text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Spectra AI &mdash; Confidential
          Investor Materials
        </p>
      </footer>
    </div>
  );
}
