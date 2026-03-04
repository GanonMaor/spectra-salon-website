import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Navigation } from "../../components/Navigation";
import { InvestorMiniNav, type NavSection } from "./InvestorMiniNav";
import { DeepDiveAccordion } from "./DeepDiveAccordion";
import {
  getSummary,
  getCityNodes,
  getTopBrands,
} from "../InvestorFlywheel/flywheel-data";

// ── Traction constants (from NewInvestorsDeck) ──────────────────────

const REVENUE_DATA = [
  { month: "Jan 24", israel: 6548, international: 895 },
  { month: "Feb 24", israel: 5937, international: 260 },
  { month: "Mar 24", israel: 8494, international: 115 },
  { month: "Apr 24", israel: 8079, international: 117 },
  { month: "May 24", israel: 8926, international: 0 },
  { month: "Jun 24", israel: 5769, international: 82 },
  { month: "Jul 24", israel: 5534, international: 1037 },
  { month: "Aug 24", israel: 7846, international: 1078 },
  { month: "Sep 24", israel: 7721, international: 1019 },
  { month: "Oct 24", israel: 6629, international: 1663 },
  { month: "Nov 24", israel: 9069, international: 2549 },
  { month: "Dec 24", israel: 9796, international: 3623 },
  { month: "Jan 25", israel: 7773, international: 2259 },
  { month: "Feb 25", israel: 7519, international: 3876 },
  { month: "Mar 25", israel: 6774, international: 3645 },
  { month: "Apr 25", israel: 6635, international: 5654 },
  { month: "May 25", israel: 7199, international: 5689 },
  { month: "Jun 25", israel: 6629, international: 6828 },
  { month: "Jul 25", israel: 7229, international: 6502 },
  { month: "Aug 25", israel: 7712, international: 6181 },
  { month: "Sep 25", israel: 7524, international: 5617 },
  { month: "Oct 25", israel: 7096, international: 5482 },
  { month: "Nov 25", israel: 7966, international: 6433 },
  { month: "Dec 25", israel: 7190, international: 8443 },
];

const total2024 = REVENUE_DATA.slice(0, 12).reduce(
  (s, i) => s + i.israel + i.international,
  0,
);
const total2025 = REVENUE_DATA.slice(12).reduce(
  (s, i) => s + i.israel + i.international,
  0,
);

const KPI = {
  retentionM1: 90,
  retentionM3: 84,
  retentionM6: 78,
  avgServicesPerAccount: 115,
  avgVisitsPerAccount: 97,
  avgGramsPerAccount: 6281,
  avgMonthlyActive: 142,
  peakMonthlyActive: 168,
  totalUniqueAccounts: 268,
  totalBrandsTracked: 187,
  avgMonthlyServices: 16352,
  avgMonthlyProductValue: 313155,
};

// ── Section registry for mini-nav ────────────────────────────────────

const SECTIONS: NavSection[] = [
  { id: "hero", label: "Overview" },
  { id: "data-snapshot", label: "Metrics" },
  { id: "problem", label: "Problem" },
  { id: "product", label: "Product" },
  { id: "flywheel", label: "Flywheel" },
  { id: "traction", label: "Traction" },
  { id: "intelligence", label: "Intelligence" },
  { id: "market", label: "Market" },
  { id: "vision", label: "Vision" },
  { id: "cta", label: "Contact" },
];

// ── Shared motion primitives ─────────────────────────────────────────

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
    const duration = 1800;
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

function fmtCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(0)}K`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

// ── Video reel component ─────────────────────────────────────────────

function VideoReel({
  src,
  label,
}: {
  src: string;
  label: string;
}) {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div
      onClick={() => {
        if (videoRef.current) {
          if (playing) videoRef.current.pause();
          else videoRef.current.play();
          setPlaying(!playing);
        }
      }}
      className="relative rounded-2xl overflow-hidden cursor-pointer group flex-shrink-0 w-[140px] sm:w-[160px]"
      style={{ aspectRatio: "9/16" }}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover"
        loop
        muted
        playsInline
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-lg">
            <svg className="w-4 h-4 text-gray-800 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
            setMuted(videoRef.current.muted);
          }
        }}
        className="absolute top-1 right-1 w-8 h-8 sm:w-7 sm:h-7 rounded-full bg-black/50 flex items-center justify-center opacity-70 sm:opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {muted ? (
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        ) : (
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        )}
      </button>
      <div className="absolute bottom-2 left-2 right-2">
        <p className="text-white text-xs font-medium leading-tight">{label}</p>
      </div>
    </div>
  );
}

// ── Inline revenue sparkline (pure SVG) ──────────────────────────────

function RevenueSparkline() {
  const points = REVENUE_DATA.map((d) => d.israel + d.international);
  const max = Math.max(...points);
  const w = 200;
  const h = 48;
  const path = points
    .map((v, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - (v / max) * (h - 8) - 4;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const areaPath = `${path} L${w},${h} L0,${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-12" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#sparkGrad)" />
      <path d={path} fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ── Reusable AI-native motif components ──────────────────────────────

function AiChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-violet-500/10 text-violet-300 border border-violet-400/20 backdrop-blur-sm">
      <span className="w-1 h-1 rounded-full bg-violet-400 animate-pulse" />
      {children}
    </span>
  );
}

function DotGrid({ className = "" }: { className?: string }) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none opacity-[0.04] ${className}`}
      style={{
        backgroundImage: "radial-gradient(circle, #a78bfa 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    />
  );
}

function SectionBg({
  src,
  opacity = 0.12,
  position = "center",
}: {
  src: string;
  opacity?: number;
  position?: string;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <img
        src={src}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full !h-full object-cover"
        style={{ opacity, objectPosition: position }}
        loading="lazy"
      />
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════════════════════════════

export function InvestorsPage() {
  const summary = useMemo(() => getSummary(), []);
  const cities = useMemo(() => getCityNodes(), []);
  const topBrands = useMemo(() => getTopBrands(), []);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Spectra AI — Investor Overview";
  }, []);

  return (
    <div
      className="min-h-[100dvh] overflow-x-hidden"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      <style>{`div::-webkit-scrollbar { display: none; }`}</style>
      <Navigation />
      <InvestorMiniNav sections={SECTIONS} />

      {/* ══════════════════════════════════════════════════════════════
          SECTION 1 — CINEMATIC HERO (Beauty + AI hybrid)
      ══════════════════════════════════════════════════════════════ */}
      <section
        id="hero"
        className="relative min-h-[100dvh] flex items-center overflow-hidden"
      >
        {/* Beauty background layer */}
        <div className="absolute inset-0">
          <img
            src="/hair_colorist_in_a_color_bar.png"
            alt=""
            aria-hidden
            className="absolute inset-0 w-full !h-full object-cover"
            style={{ objectPosition: "center 30%" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/80 to-black/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />
        </div>

        {/* AI-native dot grid overlay */}
        <DotGrid />

        {/* Ambient glow blobs */}
        <div className="absolute top-[-15%] right-[-10%] w-[55%] h-[55%] bg-gradient-to-bl from-violet-600/20 via-purple-500/10 to-transparent rounded-full blur-[140px]" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-tr from-fuchsia-500/12 via-violet-400/6 to-transparent rounded-full blur-[120px]" />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 sm:px-10 py-32 sm:py-40">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="max-w-3xl"
          >
            <div className="flex flex-wrap items-center gap-2 mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-violet-300 text-xs font-semibold tracking-widest uppercase backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                Investor Overview
              </div>
              <AiChip>Native AI for Beauty</AiChip>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.08] tracking-tight mb-6">
              The Intelligence Layer{" "}
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                Behind the Color Bar
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-200 leading-relaxed max-w-xl mb-10">
              Spectra AI captures every formula, gram, and production signal at the
              salon station — turning color-bar operations into measurable, AI-optimized
              workflows.
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href="mailto:maor@spectra-ci.com?subject=Investor%20Update%20Request"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/25"
              >
                Request Investor Update
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a
                href="#data-snapshot"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("data-snapshot")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-white/15 text-white/80 text-sm font-semibold hover:bg-white/5 transition-colors"
              >
                View Data Snapshot
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </a>
            </div>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          <svg className="w-5 h-5 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7" />
          </svg>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          CREDIBILITY STRIP
      ══════════════════════════════════════════════════════════════ */}
      <section className="bg-[#0a0a0f] border-t border-white/5 py-6">
        <div className="max-w-5xl mx-auto px-6">
          <FadeIn>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-center">
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  <AnimatedNumber value={KPI.totalUniqueAccounts} />+
                </p>
                <p className="text-xs text-gray-400 uppercase tracking-wider mt-0.5">Salons Onboarded</p>
              </div>
              <div className="w-px h-8 bg-white/10 hidden sm:block" />
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  <AnimatedNumber value={KPI.retentionM1} format={(n) => `${Math.round(n)}%`} />
                </p>
                <p className="text-xs text-gray-400 uppercase tracking-wider mt-0.5">Monthly Retention</p>
              </div>
              <div className="w-px h-8 bg-white/10 hidden sm:block" />
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  <AnimatedNumber value={summary.totalServices} format={fmtCompact} />
                </p>
                <p className="text-xs text-gray-400 uppercase tracking-wider mt-0.5">Services Tracked</p>
              </div>
              <div className="w-px h-8 bg-white/10 hidden sm:block" />
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  <AnimatedNumber value={KPI.totalBrandsTracked} />
                </p>
                <p className="text-xs text-gray-400 uppercase tracking-wider mt-0.5">Brands Monitored</p>
              </div>
              <div className="w-px h-8 bg-white/10 hidden sm:block" />
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-400 tracking-wide">L'Oréal</span>
                <span className="text-gray-600">&middot;</span>
                <span className="text-xs font-semibold text-gray-400 tracking-wide">Wella</span>
                <span className="text-gray-600">&middot;</span>
                <span className="text-xs text-gray-500 italic">187 brands</span>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 2 — DATA SNAPSHOT (KPI Band)
      ══════════════════════════════════════════════════════════════ */}
      <section id="data-snapshot" className="py-20 sm:py-28 bg-gradient-to-b from-[#0a0a0f] to-[#f5f0fa]">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-12">
            <p className="text-sm font-semibold tracking-wider uppercase text-violet-400 mb-3">
              Color-Bar Intelligence Metrics
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Real Production Data from Real Salons
            </h2>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {[
                { label: "ARR (2025)", value: `$${Math.round(total2025 / 1000)}K`, sub: `+${Math.round(((total2025 / total2024) - 1) * 100)}% YoY` },
                { label: "Active Subscriptions", value: "180+", sub: "58% target market" },
                { label: "Services / Month", value: fmtCompact(KPI.avgMonthlyServices), sub: "Platform throughput" },
                { label: "Product Value / Mo", value: `$${Math.round(KPI.avgMonthlyProductValue / 1000)}K`, sub: "Color product flowing" },
                { label: "6-Month Retention", value: `${KPI.retentionM6}%`, sub: "Cohort retention" },
              ].map((m, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-sm p-5 text-center"
                >
                  <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-0.5">
                    {m.value}
                  </p>
                  <p className="text-xs font-medium text-gray-300 uppercase tracking-wider leading-tight">
                    {m.label}
                  </p>
                  {m.sub && (
                    <p className="text-xs text-violet-300 mt-1">{m.sub}</p>
                  )}
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="mt-6 max-w-md mx-auto">
              <RevenueSparkline />
              <p className="text-xs text-gray-400 text-center mt-2">
                Monthly subscription revenue Jan 2024 – Dec 2025
              </p>
            </div>
          </FadeIn>

          <p className="text-xs text-gray-400 mt-6 text-center">
            Metrics reflect active usage across onboarded salons. Source: internal product telemetry.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 3 — PROBLEM → SOLUTION (combined narrative)
      ══════════════════════════════════════════════════════════════ */}
      <section id="problem" className="relative py-20 sm:py-28 bg-gradient-to-b from-[#f5f0fa] to-white overflow-hidden">
        <SectionBg src="/red_haed_using_spectra.jpg" opacity={0.04} position="right center" />
        <div className="relative max-w-5xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            <FadeIn>
              <div>
                <div className="rounded-2xl overflow-hidden mb-6 aspect-[16/9]">
                  <img src="/salooon0000.jpg" alt="Salon color bar" className="w-full !h-full object-cover" style={{ objectPosition: "center 40%" }} loading="lazy" />
                </div>
                <p className="text-sm font-semibold tracking-wider uppercase text-gray-400 mb-3">
                  The Problem
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-tight mb-5">
                  $10K–$30K in Color Waste Per Salon, Every Year
                </h2>
                <p className="text-base sm:text-lg text-gray-500 leading-relaxed mb-6">
                  Hair color is a salon's second-largest cost. Formulas are mixed by
                  intuition, grams are never measured, and inventory is disconnected
                  from the chair.
                </p>
                <DeepDiveAccordion id="problem">
                  <ul className="space-y-2.5">
                    {[
                      "Product consumption tracked by intuition — not measurement",
                      "No record of grams mixed, ratios used, or waste generated",
                      "Inventory disconnected from actual service delivery",
                      "Brands rely on surveys instead of real usage signals",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-base text-gray-600 leading-relaxed">
                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-red-300 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </DeepDiveAccordion>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div>
                <div className="rounded-2xl overflow-hidden mb-6 aspect-[16/9]">
                  <img src="/red_haed_using_spectra.jpg" alt="Stylist using Spectra" className="w-full !h-full object-cover" style={{ objectPosition: "center 30%" }} loading="lazy" />
                </div>
                <p className="text-sm font-semibold tracking-wider uppercase text-violet-500 mb-3">
                  The Solution
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-tight mb-5">
                  Every Gram Weighed. Every Formula Learned.
                </h2>
                <p className="text-base sm:text-lg text-gray-500 leading-relaxed mb-6">
                  Spectra AI instruments the color bar — capturing formulas, grams, and
                  production signals at the point of mixing. The system learns from every
                  service to optimize waste, inventory, and margins.
                </p>
                <DeepDiveAccordion id="solution">
                  <ul className="space-y-2.5">
                    {[
                      "Formula + grams measured at the point of production",
                      "Inventory consumption and reorder signals from real usage",
                      "True cost-per-service visibility from day one",
                      "Operational patterns that reduce waste and increase margins",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-base text-gray-600 leading-relaxed">
                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </DeepDiveAccordion>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 4 — PRODUCT PROOF (screens + workflow)
      ══════════════════════════════════════════════════════════════ */}
      <section id="product" className="py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-semibold tracking-wider uppercase text-violet-500 mb-3">
              The Product
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              One iPad at the Color Bar. AI Does the Rest.
            </h2>
            <p className="mt-4 text-gray-500 text-lg leading-relaxed">
              Smart scale + app + real-time formula capture. Stylists mix as they
              always do — Spectra learns from every gram.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                img: "/spectra-system-on-colorbar.png",
                title: "Color-Bar Hardware",
                desc: "Embedded at the mixing station — captures formulas, grams, and ratios in real time.",
                proof: "Reduced color waste from day one",
                chip: "Real-Time Capture",
              },
              {
                img: "/colorbar_with_spectra.png",
                title: "Operational Intelligence",
                desc: "Salon owners see cost-per-service, inventory burn rate, and margin insights — driven by AI.",
                proof: "AI-powered margin visibility",
                chip: "ML Analytics",
              },
              {
                img: "/girl_with_ipad.png",
                title: "Stylist-Native UX",
                desc: "Scan, weigh, mix. Zero disruption to the chair workflow — just continuous learning.",
                proof: "Faster ordering and restock",
                chip: "Workflow AI",
              },
            ].map((card, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="group bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                    <img
                      src={card.img}
                      alt={card.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-black/50 text-violet-200 border border-violet-400/30 backdrop-blur-md">
                        <span className="w-1 h-1 rounded-full bg-violet-400" />
                        {card.chip}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{card.title}</h3>
                    <p className="text-base text-gray-500 leading-relaxed mb-3">{card.desc}</p>
                    <p className="text-sm font-semibold text-violet-600 italic">{card.proof}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 5 — FLYWHEEL
      ══════════════════════════════════════════════════════════════ */}
      <section id="flywheel" className="py-24 sm:py-32 bg-gradient-to-b from-white to-[#f5f0fa]">
        <div className="max-w-5xl mx-auto px-6">
          <FadeIn className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-semibold tracking-wider uppercase text-purple-600 mb-3">
              The Flywheel
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Every Color Service Makes the AI Smarter
            </h2>
            <p className="mt-4 text-gray-500 text-lg leading-relaxed">
              More salons → more production signals → better formula & waste models →
              stronger outcomes → faster adoption.
            </p>
          </FadeIn>

          {/* Flywheel visual */}
          <FadeIn>
            <div className="flex justify-center mb-10">
              <svg
                viewBox="0 0 420 420"
                className="w-full max-w-[380px] sm:max-w-[420px]"
                aria-label="Spectra AI flywheel cycle"
              >
                <circle cx="210" cy="210" r="155" fill="none" stroke="#E9D5FF" strokeWidth="2" strokeDasharray="8 5" />

                {/* Directional arrows */}
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

                {/* Center */}
                <circle cx="210" cy="210" r="42" fill="url(#centerGrad)" />
                <defs>
                  <linearGradient id="centerGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#7C3AED" />
                    <stop offset="100%" stopColor="#C026D3" />
                  </linearGradient>
                </defs>
                <text x="210" y="206" textAnchor="middle" fill="white" fontSize="11" fontWeight="700">Spectra</text>
                <text x="210" y="220" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="10" fontWeight="600">AI</text>

                {/* Nodes */}
                {[
                  { label: "More Salons", angle: -90 },
                  { label: "Workflow Signals", angle: -18 },
                  { label: "Better Models", angle: 54 },
                  { label: "Stronger Outcomes", angle: 126 },
                  { label: "Faster Adoption", angle: 198 },
                ].map((node, i) => {
                  const rad = (node.angle * Math.PI) / 180;
                  const nx = 210 + 155 * Math.cos(rad);
                  const ny = 210 + 155 * Math.sin(rad);
                  return (
                    <g key={i}>
                      <circle cx={nx} cy={ny} r="28" fill="white" stroke="#E9D5FF" strokeWidth="2" />
                      <circle cx={nx} cy={ny} r="4" fill="#7C3AED" />
                      <text x={nx} y={ny + 40} textAnchor="middle" fill="#374151" fontSize="10" fontWeight="600">
                        {node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="max-w-2xl mx-auto">
              <DeepDiveAccordion id="flywheel">
                <ul className="space-y-2.5">
                  {[
                    "Scale makes benchmarks more accurate — enabling better forecasting and operational guidance.",
                    "AI models improve continuously as production events are captured across geographies and brands.",
                    "Network effects compound without exposing salon-identifiable data: all benchmarks are aggregated and anonymized.",
                    "Stronger outcomes drive organic adoption and distributor partnerships — accelerating the cycle.",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-base text-gray-600 leading-relaxed">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </DeepDiveAccordion>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 6 — TRACTION (SaaS Metrics + Reels)
      ══════════════════════════════════════════════════════════════ */}
      <section id="traction" className="relative py-16 sm:py-24 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] to-black" />
        <SectionBg src="/salooon0000.jpg" opacity={0.08} position="center" />
        <DotGrid className="opacity-[0.03]" />
        <div className="relative max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-10">
            <div className="flex justify-center mb-3">
              <AiChip>Production Telemetry</AiChip>
            </div>
            <p className="text-sm font-semibold tracking-wider uppercase text-violet-400 mb-2">
              Traction
            </p>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">
              Salon-Proven. Data-Validated.
            </h2>
          </FadeIn>

          {/* ── Revenue + Funnel + Economics — single visible block ── */}
          <FadeIn delay={0.1}>
            {/* Revenue row */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5 text-center">
                <p className="text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">2024 Revenue</p>
                <p className="text-xl sm:text-3xl font-bold">${Math.round(total2024 / 1000)}K</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5 text-center">
                <p className="text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">2025 Revenue</p>
                <p className="text-xl sm:text-3xl font-bold">${Math.round(total2025 / 1000)}K</p>
              </div>
              <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4 sm:p-5 text-center">
                <p className="text-[10px] sm:text-xs font-medium text-violet-300 uppercase tracking-wider mb-1">YoY Growth</p>
                <p className="text-xl sm:text-3xl font-bold text-violet-300">+{Math.round(((total2025 / total2024) - 1) * 100)}%</p>
              </div>
            </div>

            {/* Funnel row */}
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-[0.15em] mb-4 text-center sm:text-left">
              Sales Funnel (2025)
            </p>
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 sm:p-5 text-center">
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Leads</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">1,476</p>
                <p className="text-[10px] text-gray-500">CPL $25</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 sm:p-5 text-center relative">
                <div className="hidden sm:block absolute -left-3.5 top-1/2 -translate-y-1/2 z-10">
                  <span className="bg-violet-600 text-white text-[9px] font-bold w-7 h-7 rounded-full flex items-center justify-center shadow-lg border-2 border-[#0a0a0f]">20%</span>
                </div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Trials</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">301</p>
                <p className="text-[10px] text-gray-500">$123 each</p>
              </div>
              <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-3 sm:p-5 text-center relative">
                <div className="hidden sm:block absolute -left-3.5 top-1/2 -translate-y-1/2 z-10">
                  <span className="bg-violet-600 text-white text-[9px] font-bold w-7 h-7 rounded-full flex items-center justify-center shadow-lg border-2 border-[#0a0a0f]">32%</span>
                </div>
                <p className="text-[10px] font-semibold text-violet-300 uppercase tracking-wider mb-1">Customers</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">96</p>
                <p className="text-[10px] text-violet-300">CPA $385</p>
              </div>
            </div>

            {/* Unit Economics row */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-6">
              {[
                { label: "CAC", value: "$37K", accent: false },
                { label: "3yr LTV", value: "$185K", accent: false },
                { label: "Net LTV", value: "$148K", accent: false },
                { label: "LTV:CAC", value: "5.0x", accent: true },
              ].map((m) => (
                <div
                  key={m.label}
                  className={`rounded-xl p-3 sm:p-4 text-center border ${
                    m.accent
                      ? "bg-violet-500/15 border-violet-500/30"
                      : "bg-white/[0.04] border-white/10"
                  }`}
                >
                  <p className={`text-lg sm:text-2xl font-bold tracking-tight mb-0.5 ${m.accent ? "text-violet-300" : "text-white"}`}>
                    {m.value}
                  </p>
                  <p className="text-[9px] sm:text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                    {m.label}
                  </p>
                </div>
              ))}
            </div>
          </FadeIn>

          {/* ── Deep dive: all details in ONE dropdown ── */}
          <FadeIn delay={0.15}>
            <details className="group mb-10">
              <summary className="cursor-pointer list-none flex items-center justify-center gap-2 py-3 select-none">
                <span className="text-sm font-medium text-gray-500 group-hover:text-gray-300 transition-colors">
                  Deep dive: retention, usage &amp; economics
                </span>
                <svg className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-5 sm:p-6 mt-3 space-y-8">
                {/* Retention */}
                <div>
                  <p className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-3">Customer Retention</p>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-2">
                    {[
                      { period: "1-Mo", value: `${KPI.retentionM1}%` },
                      { period: "3-Mo", value: `${KPI.retentionM3}%` },
                      { period: "6-Mo", value: `${KPI.retentionM6}%` },
                    ].map((r) => (
                      <div key={r.period} className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-center">
                        <p className="text-xl sm:text-2xl font-bold tracking-tight">{r.value}</p>
                        <p className="text-[10px] text-gray-500 uppercase">{r.period}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">Cohort overlap across 17 months of data (Aug 2024 – Jan 2026).</p>
                </div>

                {/* Usage depth */}
                <div>
                  <p className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-3">Monthly Usage per Account</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                    {[
                      { label: "Services", value: KPI.avgServicesPerAccount.toLocaleString() },
                      { label: "Visits", value: KPI.avgVisitsPerAccount.toLocaleString() },
                      { label: "Grams", value: `${(KPI.avgGramsPerAccount / 1000).toFixed(1)}K` },
                      { label: "Brands", value: KPI.totalBrandsTracked.toLocaleString() },
                    ].map((m) => (
                      <div key={m.label} className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-center">
                        <p className="text-lg sm:text-xl font-bold tracking-tight">{m.value}</p>
                        <p className="text-[10px] text-gray-500 uppercase">{m.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Economics breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">CAC Breakdown</p>
                    <div className="space-y-2 text-sm">
                      {[
                        { line: "Meta Ads (12 mo)", val: "$18,000" },
                        { line: "Campaign Manager", val: "$15,000" },
                        { line: "Equipment Gifts", val: "$4,000" },
                      ].map((r) => (
                        <div key={r.line} className="flex justify-between py-1 border-b border-white/10">
                          <span className="text-gray-400">{r.line}</span>
                          <span className="font-semibold text-white">{r.val}</span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-2 border-t border-white/15">
                        <span className="font-semibold text-white">Total</span>
                        <span className="font-bold text-white">($37,000)</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">3-Year LTV (96 Customers)</p>
                    <div className="space-y-2 text-sm">
                      {[
                        { line: "2025 ARR (Actual)", val: "$64,728" },
                        { line: "2026 ARR (5% churn)", val: "$61,492" },
                        { line: "2027 ARR (5% churn)", val: "$58,417" },
                      ].map((r) => (
                        <div key={r.line} className="flex justify-between py-1 border-b border-white/10">
                          <span className="text-gray-400">{r.line}</span>
                          <span className="font-semibold text-white">{r.val}</span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-2 border-t border-white/15">
                        <span className="font-semibold text-white">Total</span>
                        <span className="font-bold text-violet-300">$184,637</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Validation pilots */}
                <div>
                  <p className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-3">Validation Pilots</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-start gap-3 p-3 rounded-xl border border-white/10 bg-white/[0.04]">
                      <span className="text-violet-400 text-xs font-bold mt-0.5">B2B</span>
                      <div>
                        <p className="text-sm font-semibold text-white">Distributor: 50 Licenses, &euro;15K</p>
                        <p className="text-xs text-gray-500">European market, validating B2B channel</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl border border-white/10 bg-white/[0.04]">
                      <span className="text-violet-400 text-xs font-bold mt-0.5">L&apos;Or</span>
                      <div>
                        <p className="text-sm font-semibold text-white">L&apos;Oreal: Intelligence, $5.5K</p>
                        <p className="text-xs text-gray-500">2025 data license for Israeli market</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </details>
          </FadeIn>

          {/* Salon reels */}
          <FadeIn delay={0.2}>
            <div className="text-center mb-6">
              <p className="text-sm font-medium text-gray-400">Real product clips from active salons</p>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-4 justify-start sm:justify-center scrollbar-none">
              {[
                { video: "/instagram-reel.mp4", label: "Color mixing workflow" },
                { video: "/instagram-reel2.mp4", label: "Real-time formula tracking" },
                { video: "/instagram-reel3.mp4", label: "Dashboard analytics" },
                { video: "/instagram-reel4.mp4", label: "iPad at color bar" },
                { video: "/instagram-reel5.mp4", label: "Stylist experience" },
                { video: "/instagram-reel6.mp4", label: "Salon operations" },
              ].map((reel, i) => (
                <VideoReel key={i} src={reel.video} label={reel.label} />
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 7 — MARKET INTELLIGENCE PROOF
      ══════════════════════════════════════════════════════════════ */}
      <section id="intelligence" className="py-24 sm:py-32 bg-gradient-to-b from-[#f5f0fa] to-white">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center max-w-2xl mx-auto mb-14">
            <div className="flex justify-center mb-4">
              <AiChip>Aggregated &amp; Anonymized</AiChip>
            </div>
            <p className="text-sm font-semibold tracking-wider uppercase text-violet-600 mb-3">
              Color-Bar Intelligence
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Industry Benchmarks from Real Salon Production
            </h2>
            <p className="mt-4 text-gray-500 text-lg leading-relaxed">
              Every formula mixed, every gram measured, every brand tracked — aggregated
              into anonymized intelligence that improves outcomes for the entire ecosystem.
            </p>
          </FadeIn>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* City intelligence */}
            <FadeIn>
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-violet-100/60 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <svg className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                  <h3 className="text-gray-900 font-semibold">Active City Nodes</h3>
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
                      <span className="text-sm text-gray-700 w-20 sm:w-28 flex-shrink-0 truncate">{city.displayName}</span>
                      <div className="flex-1 h-1.5 bg-violet-100/60 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${Math.max(city.normalizedActivity * 100, 8)}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: i * 0.06 }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 tabular-nums w-12 sm:w-16 text-right">{fmtCompact(city.records)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Brand coverage */}
            <FadeIn delay={0.15}>
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-purple-100/60 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                  <h3 className="text-gray-900 font-semibold">Brand Coverage</h3>
                  <span className="ml-auto text-xs text-gray-400 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                    Top 8
                  </span>
                </div>
                <div className="space-y-3">
                  {topBrands.map((brand, i) => (
                    <div key={brand.brand} className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-4 text-right tabular-nums">{i + 1}</span>
                      <span className="text-sm text-gray-700 w-24 sm:w-40 truncate flex-shrink-0">{brand.brand}</span>
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
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 8 — MARKET OPPORTUNITY
      ══════════════════════════════════════════════════════════════ */}
      <section id="market" className="py-24 sm:py-32 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <FadeIn className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-semibold tracking-wider uppercase text-gray-400 mb-3">
              Market Opportunity
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              A $250B+ Industry with Zero Production Intelligence
            </h2>
            <p className="mt-4 text-gray-500 text-lg leading-relaxed">
              Professional beauty is one of the last offline verticals with no
              operational data layer. Spectra AI fills that gap.
            </p>
          </FadeIn>

          <FadeIn>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[
                { label: "Global Salon Services", value: "$247B → $448B", sub: "2024 → 2032 (CAGR 7.8%)" },
                { label: "Professional Hair Colour", value: "$28.9B → $52.7B", sub: "2024 → 2032" },
                { label: "Beauty & Personal Care", value: "$677B", sub: "2025 worldwide revenue" },
              ].map((m, i) => (
                <div key={i} className="p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200">
                  <p className="text-sm text-gray-400 uppercase tracking-wider mb-2">{m.label}</p>
                  <p className="text-2xl font-bold text-gray-900 tracking-tight">{m.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{m.sub}</p>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 max-w-2xl mx-auto">
              <p className="text-xs text-gray-400 leading-relaxed text-center">
                <span className="font-semibold">Sources:</span> Fortune Business Insights (salon services, hair colour);
                Statista (beauty & personal care); Maximize Market Research (hair colour).
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 9 — WHY NOW + VISION (combined)
      ══════════════════════════════════════════════════════════════ */}
      <section id="vision" className="py-24 sm:py-32 bg-gradient-to-b from-[#f5f0fa] to-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            <FadeIn>
              <div>
                <p className="text-sm font-semibold tracking-wider uppercase text-gray-400 mb-3">Why Now</p>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-tight mb-5">
                  AI Meets the Salon Floor
                </h2>
                <p className="text-base sm:text-lg text-gray-500 leading-relaxed mb-6">
                  Models are finally cheap and accurate enough for real-time production
                  guidance. Salons face rising color costs. Brands need real sell-through
                  data. The gap is closing now.
                </p>
                <DeepDiveAccordion id="why-now">
                  <ul className="space-y-2.5">
                    {[
                      "AI models and workflow automation are mature enough for SMB-affordable tooling.",
                      "Salons face rising product and labor costs — creating urgent demand for margin visibility.",
                      "Distributors and brands demand real sell-through signals, not just sell-in data.",
                      "Industry validation: L'Oréal and NVIDIA investing in AI for beauty.",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-base text-gray-600 leading-relaxed">
                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </DeepDiveAccordion>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div>
                <p className="text-sm font-semibold tracking-wider uppercase text-violet-500 mb-3">Vision</p>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-tight mb-5">
                  From Color Bar to Industry OS
                </h2>
                <p className="text-base sm:text-lg text-gray-500 leading-relaxed mb-6">
                  Spectra starts where color is mixed — then expands into scheduling,
                  procurement, and cross-salon benchmarks. The industry's first native-AI
                  operating system for professional beauty.
                </p>
                <DeepDiveAccordion id="vision-detail">
                  <div className="space-y-4">
                    <ul className="space-y-2.5">
                      {[
                        "Colour production → inventory → scheduling → full operating system.",
                        "Aggregated demand signals and benchmarks for distributors and brands.",
                        "The industry's only real-time production dataset, growing daily.",
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-base text-gray-600 leading-relaxed">
                          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <div className="p-4 bg-white rounded-xl border border-violet-200/60">
                      <p className="text-base text-gray-600 leading-relaxed">
                        The long-term platform delivers aggregated benchmarks and
                        operational tooling — improving outcomes for salons and partners
                        without exposing salon-identifiable data.
                      </p>
                    </div>
                  </div>
                </DeepDiveAccordion>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 10 — CTA FOOTER
      ══════════════════════════════════════════════════════════════ */}
      <section id="cta" className="relative py-24 sm:py-32 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#0d0b14] to-black" />
        <SectionBg src="/spectra-system-hero-overlay.png" opacity={0.1} position="center" />
        <DotGrid />
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[60%] bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[45%] h-[50%] bg-fuchsia-500/8 rounded-full blur-[100px]" />

        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-violet-300 text-xs font-semibold mb-6">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              Investor Preview
            </div>

            <h2 className="text-2xl sm:text-5xl font-bold text-white tracking-tight mb-4">
              The Beauty Industry's{" "}
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                AI Moment
              </span>{" "}
              Is Here
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 leading-relaxed mb-10 max-w-lg mx-auto">
              Join us in building the intelligence layer for professional beauty.
              We'd love to share our latest traction and roadmap.
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="mailto:maor@spectra-ci.com?subject=Investor%20Update%20Request"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/20"
              >
                Request Investor Update
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a
                href="mailto:maor@spectra-ci.com?subject=Partnership%20Inquiry"
                className="inline-flex items-center gap-2 px-6 py-4 rounded-full border border-white/15 text-white text-sm font-semibold hover:bg-white/5 transition-colors"
              >
                Contact
              </a>
            </div>

            <p className="text-sm text-gray-500 mt-8">
              For partnership inquiries, contact us at{" "}
              <a
                href="mailto:maor@spectra-ci.com?subject=Partnership%20Inquiry"
                className="underline hover:text-gray-400 transition-colors"
              >
                maor@spectra-ci.com
              </a>
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 bg-black text-center border-t border-white/5">
        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Spectra AI — Confidential Investor Materials
        </p>
      </footer>
    </div>
  );
}
