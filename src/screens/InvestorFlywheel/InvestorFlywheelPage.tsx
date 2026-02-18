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
  Coins,
  TrendingUp,
  Sparkles,
  ChevronDown,
  ArrowRight,
  Zap,
  BarChart3,
  Send,
  Globe2,
  ShieldCheck,
  Lock,
} from "lucide-react";
import {
  getSummary,
  getMonthlyGrowth,
  getCityNodes,
  getTopBrands,
} from "./flywheel-data";
import type { FlywheelSummary } from "./flywheel-data";

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

// ── Section label ────────────────────────────────────────────────────

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
// SECTION 0 — PRE-GLOBE FLYWHEEL HERO
// ═══════════════════════════════════════════════════════════════════════

const FLYWHEEL_NODES = [
  {
    label: "All-in-One Salon OS",
    sub: "Smart scale + App + CRM/POS",
    icon: Scale,
    angle: 270,
  },
  {
    label: "Real-Time Ground-Level Industry Data",
    sub: "The world\u2019s only hair data lake",
    icon: Database,
    angle: 30,
  },
  {
    label: "Spectra AI Insight",
    sub: "HairGPT",
    icon: Brain,
    angle: 150,
  },
] as const;

function FlywheelCircle() {
  const reduced = useReducedMotion();
  const RING = 170;

  return (
    <div className="relative w-[420px] h-[420px] mx-auto flex-shrink-0">
      {/* Orbit ring */}
      <div className="absolute inset-[30px] rounded-full border-2 border-dashed border-violet-200/60" />

      {/* Slow rotation wrapper (entire ring spins subtly) */}
      <motion.div
        className="absolute inset-0"
        animate={reduced ? {} : { rotate: 360 }}
        transition={
          reduced
            ? { duration: 0 }
            : { duration: 60, repeat: Infinity, ease: "linear" }
        }
      >
        {/* Directional arrows on ring */}
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

      {/* Center badge */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="w-28 h-28 rounded-full bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500 flex items-center justify-center shadow-xl shadow-violet-400/25"
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={reduced ? { duration: 0 } : { duration: 0.7, delay: 0.2 }}
        >
          <div className="text-center leading-tight">
            <p className="text-white font-bold text-sm tracking-tight">
              Spectra
            </p>
            <p className="text-white/80 font-bold text-lg -mt-0.5">AI</p>
          </div>
        </motion.div>
      </div>

      {/* Node cards */}
      {FLYWHEEL_NODES.map((node, i) => {
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
              reduced
                ? { duration: 0 }
                : { duration: 0.6, delay: 0.3 + i * 0.15 }
            }
          >
            <div className="w-[150px] bg-white/80 backdrop-blur-sm border border-violet-100/70 rounded-2xl p-3.5 shadow-md shadow-violet-200/15 text-center">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center mx-auto mb-2">
                <Icon className="w-4.5 h-4.5 text-violet-600" />
              </div>
              <p className="text-xs font-bold text-gray-800 leading-tight">
                {node.label}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">
                {node.sub}
              </p>
            </div>
          </motion.div>
        );
      })}

      {/* Soft glow behind ring */}
      <div className="absolute inset-[15%] rounded-full bg-violet-100/30 blur-3xl -z-10" />
    </div>
  );
}

function FlywheelCircleMobile() {
  const reduced = useReducedMotion();

  return (
    <div className="relative w-[300px] h-[300px] mx-auto flex-shrink-0">
      {/* Orbit ring */}
      <div className="absolute inset-[20px] rounded-full border-2 border-dashed border-violet-200/60" />

      {/* Center badge */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500 flex items-center justify-center shadow-xl shadow-violet-400/25">
          <div className="text-center leading-tight">
            <p className="text-white font-bold text-[11px] tracking-tight">
              Spectra
            </p>
            <p className="text-white/80 font-bold text-base -mt-0.5">AI</p>
          </div>
        </div>
      </div>

      {/* Node cards */}
      {FLYWHEEL_NODES.map((node, i) => {
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
            transition={
              reduced
                ? { duration: 0 }
                : { duration: 0.6, delay: 0.2 + i * 0.12 }
            }
          >
            <div className="w-[110px] bg-white/80 backdrop-blur-sm border border-violet-100/70 rounded-xl p-2.5 shadow-md shadow-violet-200/15 text-center">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center mx-auto mb-1.5">
                <Icon className="w-3.5 h-3.5 text-violet-600" />
              </div>
              <p className="text-[10px] font-bold text-gray-800 leading-tight">
                {node.label}
              </p>
              <p className="text-[9px] text-gray-400 mt-0.5 leading-snug">
                {node.sub}
              </p>
            </div>
          </motion.div>
        );
      })}

      <div className="absolute inset-[15%] rounded-full bg-violet-100/30 blur-3xl -z-10" />
    </div>
  );
}

function PreGlobeFlywheelHero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-[#f4f0fb] via-[#eee8f6] to-[#e9e2f3]">
      {/* Ambient blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-gradient-to-bl from-violet-200/40 via-purple-100/20 to-transparent rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[45%] h-[50%] bg-gradient-to-tr from-fuchsia-100/25 via-violet-100/15 to-transparent rounded-full blur-[100px]" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 py-20 sm:py-24">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-14 lg:gap-8 items-center">
          {/* Text column */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="max-w-xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 border border-violet-200/60 text-violet-600 text-xs font-semibold tracking-widest uppercase mb-8 backdrop-blur-sm shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              The Spectra AI Flywheel
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-gray-900 leading-[1.1] tracking-tight">
              Revolutionizing the Hair&nbsp;Salon Industry{" "}
              <span className="bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent">
                through AI
              </span>
            </h1>

            <p className="mt-7 text-lg sm:text-xl text-gray-500 leading-relaxed max-w-md">
              A self-reinforcing flywheel that connects salon operations,
              real-time industry data, and AI-powered insights into one
              continuous cycle.
            </p>

            <div className="flex flex-wrap gap-3 mt-10">
              <a
                href="#flywheel"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/25"
              >
                See How It Works
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>

          {/* Flywheel circle — responsive versions */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.25 }}
          >
            <div className="hidden sm:block">
              <FlywheelCircle />
            </div>
            <div className="block sm:hidden">
              <FlywheelCircleMobile />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll cue */}
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
// SECTION 1 — HERO (Globe)
// ═══════════════════════════════════════════════════════════════════════

function GlobeVisual() {
  const reduced = useReducedMotion();
  const dots = useMemo(
    () =>
      [
        { x: 62, y: 37, s: 5, d: 0 },
        { x: 63, y: 40, s: 4, d: 0.6 },
        { x: 60, y: 39, s: 3, d: 1.2 },
        { x: 64, y: 41, s: 3, d: 1.8 },
        { x: 61, y: 36, s: 3, d: 0.3 },
        { x: 30, y: 48, s: 2, d: 2.0 },
        { x: 75, y: 52, s: 2, d: 0.9 },
        { x: 22, y: 35, s: 2, d: 1.5 },
        { x: 48, y: 28, s: 2, d: 2.5 },
        { x: 38, y: 60, s: 2, d: 1.1 },
        { x: 72, y: 34, s: 2, d: 0.4 },
        { x: 55, y: 65, s: 2, d: 1.7 },
      ] as const,
    [],
  );

  const DOT_COLORS = ["#a78bfa", "#c084fc", "#818cf8", "#7c3aed", "#6d28d9"];

  return (
    <div className="relative w-full aspect-square max-w-[560px] mx-auto">
      {/* Soft glow behind globe */}
      <div className="absolute inset-[-10%] rounded-full bg-gradient-to-br from-violet-200/40 via-purple-100/30 to-fuchsia-100/20 blur-3xl" />

      {/* Outer rings */}
      <div className="absolute inset-[-12px] rounded-full border border-violet-300/20" />
      <div className="absolute inset-[-6px] rounded-full border border-purple-200/15" />

      {/* Globe body */}
      <div className="absolute inset-0 rounded-full overflow-hidden bg-gradient-to-br from-[#e8e0f0] via-[#ddd5ee] to-[#d0c5e8] shadow-[0_8px_60px_rgba(139,92,246,0.15),0_0_120px_rgba(192,132,252,0.1)]">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 400 400"
          fill="none"
        >
          <defs>
            <radialGradient id="gShine" cx="30%" cy="28%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
              <stop offset="60%" stopColor="rgba(255,255,255,0.1)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          <circle cx="200" cy="200" r="199" fill="url(#gShine)" />
          {[-70, -40, -10, 20, 50, 80].map((deg) => (
            <ellipse
              key={`lo${deg}`}
              cx="200"
              cy="200"
              rx={Math.abs(185 * Math.cos((deg * Math.PI) / 180))}
              ry="185"
              stroke="rgba(139,92,246,0.1)"
              strokeWidth="0.7"
            />
          ))}
          {[70, 120, 170, 230, 280, 330].map((y) => {
            const dy = Math.abs(y - 200);
            const rx = Math.sqrt(Math.max(185 * 185 - dy * dy, 0));
            return (
              <ellipse
                key={`la${y}`}
                cx="200"
                cy={y}
                rx={rx}
                ry={rx * 0.12}
                stroke="rgba(139,92,246,0.08)"
                strokeWidth="0.7"
              />
            );
          })}
        </svg>
      </div>

      {/* Data point dots */}
      {dots.map((dot, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            width: dot.s * 2.2,
            height: dot.s * 2.2,
            backgroundColor: DOT_COLORS[i % DOT_COLORS.length],
            boxShadow: `0 0 ${dot.s * 8}px ${DOT_COLORS[i % DOT_COLORS.length]}80`,
          }}
          animate={
            reduced
              ? { opacity: 0.8, scale: 1 }
              : { opacity: [0.5, 1, 0.5], scale: [0.8, 1.2, 0.8] }
          }
          transition={
            reduced
              ? { duration: 0 }
              : {
                  duration: 3.5,
                  delay: dot.d,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
        />
      ))}

      {/* Israel region glow */}
      <motion.div
        className="absolute"
        style={{ left: "57%", top: "32%", width: 50, height: 50 }}
        animate={
          reduced
            ? { opacity: 0.4 }
            : { opacity: [0.2, 0.5, 0.2] }
        }
        transition={
          reduced
            ? { duration: 0 }
            : { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <div className="absolute inset-0 rounded-full bg-violet-400/25 blur-xl" />
        <div className="absolute inset-[25%] rounded-full bg-purple-400/35 blur-lg" />
      </motion.div>
    </div>
  );
}

function HeroSection({ summary }: { summary: FlywheelSummary }) {
  const kpis = [
    {
      label: "Data Points",
      value: summary.totalDataPoints,
      fmt: fmtCompact,
      suffix: "+",
    },
    { label: "Active Salons", value: summary.totalSalons, fmt: fmtCompact },
    {
      label: "Services Tracked",
      value: summary.totalServices,
      fmt: fmtCompact,
    },
    {
      label: "Product Tracked",
      value: Math.round(summary.totalGrams / 1000),
      fmt: (n: number) => `${fmtCompact(n)} kg`,
    },
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-[#f0ecf7] via-[#ece7f4] to-[#e6e0f2]">
      {/* Soft ambient blobs */}
      <div className="absolute top-0 right-0 w-[60%] h-[70%] bg-gradient-to-bl from-violet-200/50 via-purple-100/30 to-transparent rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-[50%] h-[60%] bg-gradient-to-tr from-fuchsia-100/30 via-violet-100/20 to-transparent rounded-full blur-[100px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-200/20 rounded-full blur-[80px]" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 py-20">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-6 items-center">
          {/* Text column */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="max-w-xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 border border-violet-200/60 text-violet-600 text-xs font-semibold tracking-widest uppercase mb-8 backdrop-blur-sm shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Revolutionizing Hair Industry Data
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-[4rem] font-bold text-gray-900 leading-[1.06] tracking-tight">
              Spectra AI{" "}
              <span className="bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent">
                Flywheel
              </span>
            </h1>

            <p className="mt-7 text-lg sm:text-xl text-gray-500 leading-relaxed">
              The only real-time data intelligence platform for the global hair
              industry. From salon chair to actionable insight&nbsp;&mdash;
              powered by AI.
            </p>

            <div className="flex flex-wrap gap-3 mt-10">
              <a
                href="#flywheel"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/25"
              >
                Explore the Flywheel
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#token-economy"
                className="px-7 py-3.5 rounded-full bg-white/70 border border-violet-200/50 text-gray-700 text-sm font-medium hover:bg-white/90 transition-all backdrop-blur-sm shadow-sm"
              >
                Token Economy
              </a>
            </div>

            {/* KPI strip */}
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-14"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {kpis.map((k) => (
                <div
                  key={k.label}
                  className="bg-white/60 backdrop-blur-sm border border-white/80 rounded-2xl p-4 shadow-sm"
                >
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 tabular-nums">
                    <AnimatedNumber value={k.value} format={k.fmt} />
                    {k.suffix && (
                      <span className="text-gray-400">{k.suffix}</span>
                    )}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-wider">
                    {k.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Globe column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.3 }}
            className="hidden sm:block"
          >
            <GlobeVisual />
          </motion.div>
        </div>
      </div>

    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 2 — FLYWHEEL STAGES
// ═══════════════════════════════════════════════════════════════════════

const STAGES = [
  {
    icon: Scale,
    title: "All-in-One Salon OS",
    sub: "Ground-Level Data Collection",
    body: "Smart scale + app + CRM/POS captures every service, product gram, and pricing decision in real-time from the salon floor.",
    grad: "from-violet-500 to-purple-500",
    accent: "text-violet-600",
    pill: "bg-violet-50 border-violet-200",
  },
  {
    icon: Brain,
    title: "AI Processing Engine",
    sub: "Intelligent Data Structuring",
    body: "ML models clean, normalize, and enrich raw salon data — extracting patterns across brands, services, pricing, and geography.",
    grad: "from-blue-500 to-violet-500",
    accent: "text-blue-600",
    pill: "bg-blue-50 border-blue-200",
  },
  {
    icon: Database,
    title: "Industry Data Lake",
    sub: "The World's Only Real-Time Repository",
    body: "Anonymized, structured data flows into the only real-time data lake dedicated to the global hair industry.",
    grad: "from-violet-500 to-purple-500",
    accent: "text-violet-600",
    pill: "bg-violet-50 border-violet-200",
  },
  {
    icon: Coins,
    title: "Token-Based Access",
    sub: "New Revenue Stream",
    body: "Color brands, distributors, and industry players purchase tokens for intelligence access — a revenue layer larger than subscriptions.",
    grad: "from-amber-500 to-orange-500",
    accent: "text-amber-600",
    pill: "bg-amber-50 border-amber-200",
  },
  {
    icon: TrendingUp,
    title: "Network Effect",
    sub: "The Flywheel Accelerates",
    body: "More salons adopt \u2192 richer data \u2192 more valuable insights \u2192 more token demand \u2192 faster adoption. The flywheel spins.",
    grad: "from-emerald-500 to-teal-500",
    accent: "text-emerald-600",
    pill: "bg-emerald-50 border-emerald-200",
  },
];

function FlywheelSection() {
  return (
    <section id="flywheel" className="py-24 sm:py-32 bg-gradient-to-b from-white to-[#f5f0fa]">
      <div className="max-w-6xl mx-auto px-6">
        <FadeIn className="text-center max-w-2xl mx-auto mb-16 sm:mb-20">
          <SectionLabel color="text-blue-600">How It Works</SectionLabel>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            The Spectra Flywheel
          </h2>
          <p className="mt-4 text-gray-500 text-lg leading-relaxed">
            A self-reinforcing cycle that transforms salon operations into the
            world&apos;s most valuable hair industry dataset.
          </p>
        </FadeIn>

        <div className="relative">
          {/* Vertical connector */}
          <div className="absolute left-6 sm:left-1/2 sm:-translate-x-px top-0 bottom-0 w-px bg-gradient-to-b from-violet-200 via-purple-200 to-emerald-200" />

          <div className="space-y-10 sm:space-y-14">
            {STAGES.map((s, i) => {
              const Icon = s.icon;
              const isLeft = i % 2 === 0;
              return (
                <FadeIn
                  key={i}
                  delay={i * 0.08}
                  y={0}
                  className={`relative flex flex-col sm:flex-row items-start sm:items-center gap-6 pl-14 sm:pl-0 ${
                    isLeft ? "" : "sm:flex-row-reverse"
                  }`}
                >
                  {/* Card */}
                  <div
                    className={`flex-1 ${isLeft ? "sm:text-right" : "sm:text-left"}`}
                  >
                    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 sm:p-8 hover:shadow-md transition-shadow duration-300">
                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${s.pill} ${s.accent} mb-4`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        Step {i + 1}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {s.title}
                      </h3>
                      <p className="text-sm font-medium text-gray-400 mt-1">
                        {s.sub}
                      </p>
                      <p className="text-gray-600 mt-3 leading-relaxed text-[15px]">
                        {s.body}
                      </p>
                    </div>
                  </div>

                  {/* Center node */}
                  <div className="absolute left-0 sm:relative sm:left-auto flex items-center justify-center w-12 h-12 rounded-full bg-white border-2 border-gray-200 shadow-sm z-10 flex-shrink-0">
                    <div
                      className={`w-5 h-5 rounded-full bg-gradient-to-br ${s.grad}`}
                    />
                  </div>

                  {/* Spacer */}
                  <div className="flex-1 hidden sm:block" />
                </FadeIn>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 3 — DATA PIPELINE
// ═══════════════════════════════════════════════════════════════════════

function DataPipelineSection({ summary }: { summary: FlywheelSummary }) {
  const steps = [
    {
      icon: Scale,
      label: "Salon Service",
      detail: "Weight + treatment logged",
    },
    {
      icon: Zap,
      label: "Real-Time Capture",
      detail: `${fmtCompact(summary.totalServices)} services processed`,
    },
    {
      icon: Brain,
      label: "AI Enrichment",
      detail: `${summary.totalBrands} brands classified`,
    },
    {
      icon: Database,
      label: "Data Lake",
      detail: `${fmtCompact(summary.totalDataPoints)} records stored`,
    },
    {
      icon: BarChart3,
      label: "Insights API",
      detail: "Query-ready intelligence",
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <FadeIn className="text-center max-w-2xl mx-auto mb-16">
          <SectionLabel color="text-purple-600">
            Data Collection Pipeline
          </SectionLabel>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            From Salon Chair to AI Insight
          </h2>
          <p className="mt-4 text-gray-500 text-lg leading-relaxed">
            Every service generates structured data that feeds the
            industry&apos;s most comprehensive intelligence platform.
          </p>
        </FadeIn>

        {/* Pipeline flow */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-0">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <React.Fragment key={i}>
                <FadeIn
                  delay={i * 0.12}
                  className="flex flex-col items-center text-center w-full sm:w-auto"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100/80 flex items-center justify-center mb-3">
                    <Icon className="w-7 h-7 text-violet-600" />
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 max-w-[140px]">
                    {step.detail}
                  </p>
                </FadeIn>
                {i < steps.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-gray-300 hidden sm:block flex-shrink-0 mx-2" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Data span banner */}
        <FadeIn delay={0.5}>
          <div className="mt-16 bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100/60 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-bold text-gray-900 text-lg">
                Continuous Data Coverage
              </p>
              <p className="text-gray-500 text-sm mt-1">
                {summary.dateRange.from} &mdash; {summary.dateRange.to} &middot;{" "}
                {summary.totalMonths} months of uninterrupted collection
              </p>
            </div>
            <div className="flex gap-6 text-center">
              <div>
                <p className="text-2xl font-bold text-violet-600">
                  {fmtCompact(summary.totalGrams / 1000)}
                </p>
                <p className="text-xs text-gray-500">kg tracked</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {summary.totalMonths}
                </p>
                <p className="text-xs text-gray-500">months</p>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 4 — GROWTH CHART (dual-axis)
// ═══════════════════════════════════════════════════════════════════════

function GrowthChartSection({ summary }: { summary: FlywheelSummary }) {
  const growth = useMemo(() => getMonthlyGrowth(), []);

  const chartTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: any[];
    label?: string;
  }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 text-sm">
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center gap-2 py-0.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: p.color }}
            />
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
    <section className="py-24 bg-gradient-to-b from-[#f5f0fa] to-white">
      <div className="max-w-6xl mx-auto px-6">
        <FadeIn className="text-center max-w-2xl mx-auto mb-6">
          <SectionLabel color="text-purple-600">
            Data Asset Growth
          </SectionLabel>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Not Just Revenue Growth &mdash; Data Growth
          </h2>
          <p className="mt-4 text-gray-500 text-lg leading-relaxed">
            The real value isn&apos;t in subscriptions alone. It&apos;s in the
            exponentially growing data asset that powers the intelligence layer.
          </p>
        </FadeIn>

        {/* Growth delta pills */}
        <FadeIn delay={0.15}>
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {[
              {
                label: "Services",
                pct: summary.growth.servicesPct,
                color: "bg-violet-50 text-violet-700 border-violet-200",
              },
              {
                label: "Visits",
                pct: summary.growth.visitsPct,
                color: "bg-purple-50 text-purple-700 border-purple-200",
              },
              {
                label: "Data Records",
                pct: summary.growth.recordsPct,
                color: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
              },
              {
                label: "Product Volume",
                pct: summary.growth.gramsPct,
                color: "bg-emerald-50 text-emerald-700 border-emerald-200",
              },
            ].map((g) => (
              <span
                key={g.label}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${g.color}`}
              >
                <TrendingUp className="w-3 h-3" />
                {g.label}: +{g.pct}%
              </span>
            ))}
          </div>
        </FadeIn>

        {/* Chart */}
        <FadeIn delay={0.2}>
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4 sm:p-8">
            <div className="flex flex-wrap gap-6 mb-6 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1.5 rounded-full bg-violet-500" />
                Services / month
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1.5 rounded-full bg-purple-400" />
                Visits / month
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1.5 rounded-full bg-fuchsia-400" />
                Cumulative Data Records
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
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(0,0,0,0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => fmtCompact(v)}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => fmtCompact(v)}
                />
                <Tooltip content={chartTooltip as any} />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="cumulativeRecords"
                  name="Cumulative Records"
                  fill="url(#gCum)"
                  stroke="#d946ef"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="services"
                  name="Services"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#8b5cf6" }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="visits"
                  name="Visits"
                  stroke="#a855f7"
                  strokeWidth={1.5}
                  strokeDasharray="5 3"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 5 — GLOBAL INTELLIGENCE (city nodes)
// ═══════════════════════════════════════════════════════════════════════

function CityIntelligenceSection() {
  const cities = useMemo(() => getCityNodes(), []);
  const topBrands = useMemo(() => getTopBrands(), []);

  return (
    <section className="py-24 bg-gradient-to-b from-[#f5f0fa] to-white">
      <div className="max-w-6xl mx-auto px-6">
        <FadeIn className="text-center max-w-2xl mx-auto mb-16">
          <SectionLabel color="text-violet-600">
            Ground-Level Intelligence
          </SectionLabel>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Real-Time Data From Every Market
          </h2>
          <p className="mt-4 text-gray-500 text-lg leading-relaxed">
            Spectra collects ground-truth data from salons across Israel&apos;s
            beachhead market, with global expansion underway.
          </p>
        </FadeIn>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* City nodes */}
          <FadeIn>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-violet-100/60 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Globe2 className="w-5 h-5 text-violet-500" />
                <h3 className="text-gray-900 font-semibold">
                  Active City Nodes
                </h3>
                <span className="ml-auto text-xs text-gray-400 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-100">
                  {cities.length} cities
                </span>
              </div>
              <div className="space-y-3">
                {cities.slice(0, 10).map((city, i) => (
                  <div key={city.name} className="flex items-center gap-3">
                    <motion.div
                      className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{
                        duration: 2,
                        delay: i * 0.2,
                        repeat: Infinity,
                      }}
                      style={{
                        boxShadow: "0 0 8px rgba(139,92,246,0.5)",
                      }}
                    />
                    <span className="text-sm text-gray-700 w-28 flex-shrink-0">
                      {city.displayName}
                    </span>
                    <div className="flex-1 h-1.5 bg-violet-100/60 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400"
                        initial={{ width: 0 }}
                        whileInView={{
                          width: `${Math.max(city.normalizedActivity * 100, 8)}%`,
                        }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: i * 0.06 }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 tabular-nums w-16 text-right">
                      {fmtCompact(city.records)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Brand coverage */}
          <FadeIn delay={0.15}>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-purple-100/60 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-5 h-5 text-purple-500" />
                <h3 className="text-gray-900 font-semibold">Brand Coverage</h3>
                <span className="ml-auto text-xs text-gray-400 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                  Top 8
                </span>
              </div>
              <div className="space-y-3">
                {topBrands.map((brand, i) => (
                  <div key={brand.brand} className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-4 text-right tabular-nums">
                      {i + 1}
                    </span>
                    <span className="text-sm text-gray-700 w-40 truncate flex-shrink-0">
                      {brand.brand}
                    </span>
                    <div className="flex-1 h-1.5 bg-purple-100/60 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-400"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${brand.share * 3}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: i * 0.06 }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 tabular-nums w-12 text-right">
                      {brand.share}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 6 — HairGPT PROMPT SHOWCASE
// ═══════════════════════════════════════════════════════════════════════

const PROMPTS = [
  {
    q: "Which color brand is gaining market share in premium salons?",
    a: "Based on real-time product-weight data across 390+ salons, L'Or\u00e9al Professionnel leads with steady share growth in A+ tier salons over the past 6 months, driven by increased color-service grams per visit.",
  },
  {
    q: "What is the average product usage per service in Tel Aviv?",
    a: "Tel Aviv salons average 52.3g of color product per service, 14% above the national average. Highlights services consume 78.1g on average, reflecting the city's premium positioning.",
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

function HairGptSection() {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setActiveIdx((i) => (i + 1) % PROMPTS.length),
      6000,
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24 bg-gradient-to-b from-white to-[#f5f0fa]">
      <div className="max-w-6xl mx-auto px-6">
        <FadeIn className="text-center max-w-2xl mx-auto mb-16">
          <SectionLabel color="text-violet-600">
            Spectra AI Insights
          </SectionLabel>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            HairGPT &mdash; Ask Anything
          </h2>
          <p className="mt-4 text-gray-500 text-lg leading-relaxed">
            The only AI that answers real-time questions about the hair industry,
            powered by ground-truth data from thousands of salon interactions.
          </p>
        </FadeIn>

        <FadeIn>
          <div className="max-w-3xl mx-auto">
            {/* Terminal card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-violet-100/60 overflow-hidden shadow-lg shadow-violet-200/20">
              {/* Title bar */}
              <div className="flex items-center gap-2 px-5 py-3 border-b border-violet-100/40 bg-violet-50/40">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/50" />
                </div>
                <span className="ml-3 text-xs text-gray-400 font-mono">
                  HairGPT &mdash; Spectra AI Insights
                </span>
              </div>

              {/* Prompt input (decorative) */}
              <div className="px-5 pt-5 pb-3">
                <div className="flex items-center gap-3 bg-violet-50/60 border border-violet-100/60 rounded-xl px-4 py-3">
                  <Sparkles className="w-4 h-4 text-violet-500 flex-shrink-0" />
                  <span className="text-gray-400 text-sm flex-1">
                    Ask Spectra anything about the hair industry...
                  </span>
                  <Send className="w-4 h-4 text-gray-300" />
                </div>
              </div>

              {/* Cycling Q&A */}
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
                    style={
                      i !== activeIdx ? { visibility: "hidden" } : undefined
                    }
                  >
                    {/* Question */}
                    <div className="flex gap-3 mb-4">
                      <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[10px] text-violet-600 font-bold">
                          Q
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {p.q}
                      </p>
                    </div>
                    {/* Answer */}
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Sparkles className="w-3 h-3 text-purple-500" />
                      </div>
                      <p className="text-gray-500 text-sm leading-relaxed">
                        {p.a}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Prompt selector dots */}
              <div className="flex justify-center gap-2 pb-5">
                {PROMPTS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIdx(i)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i === activeIdx
                        ? "bg-violet-500 w-6"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                    aria-label={`Show example ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 7 — TOKEN ECONOMY + CTA
// ═══════════════════════════════════════════════════════════════════════

const TOKEN_TIERS = [
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

function TokenEconomySection() {
  return (
    <section id="token-economy" className="py-24 sm:py-32 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <FadeIn className="text-center max-w-2xl mx-auto mb-16">
          <SectionLabel color="text-purple-600">
            Token-Based Revenue
          </SectionLabel>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            A New Revenue Layer &mdash; Bigger Than SaaS
          </h2>
          <p className="mt-4 text-gray-500 text-lg leading-relaxed">
            Industry players purchase Spectra tokens to access real-time
            intelligence. A recurring, scalable revenue stream that grows with
            every new salon on the network.
          </p>
        </FadeIn>

        {/* Tier cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOKEN_TIERS.map((tier, i) => {
            const Icon = tier.icon;
            return (
              <FadeIn key={i} delay={i * 0.1}>
                <div
                  className={`bg-white rounded-2xl border ${tier.border} shadow-sm p-6 sm:p-8 h-full flex flex-col hover:shadow-md transition-shadow duration-300`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.accent} flex items-center justify-center mb-5`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {tier.audience}
                  </p>
                  <h3 className="text-xl font-bold text-gray-900 mt-1">
                    {tier.title}
                  </h3>
                  <ul className="mt-5 space-y-2.5 flex-1">
                    {tier.features.map((f, fi) => (
                      <li
                        key={fi}
                        className="flex items-start gap-2 text-sm text-gray-600"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button className="mt-6 w-full py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors">
                    Request Access
                  </button>
                </div>
              </FadeIn>
            );
          })}
        </div>

        {/* Final CTA */}
        <FadeIn delay={0.3}>
          <div className="mt-20 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-xs font-semibold mb-6">
              <Lock className="w-3 h-3" />
              Investor Preview
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 max-w-xl mx-auto leading-tight">
              Spectra is building the Bloomberg Terminal for the hair industry
            </h3>
            <p className="mt-4 text-gray-500 text-lg max-w-md mx-auto">
              Powered by real-time ground data. The only platform of its kind.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <a
                href="mailto:investors@spectra.ai"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/20"
              >
                Request Investor Access
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
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
      className="min-h-screen overflow-x-hidden"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      <style>{`div::-webkit-scrollbar { display: none; }`}</style>
      <PreGlobeFlywheelHero />
      <HeroSection summary={summary} />
      <FlywheelSection />
      <DataPipelineSection summary={summary} />
      <GrowthChartSection summary={summary} />
      <CityIntelligenceSection />
      <HairGptSection />
      <TokenEconomySection />

      {/* Footer */}
      <footer className="py-8 bg-[#f0ecf7] border-t border-violet-100/50 text-center">
        <p className="text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Spectra AI &mdash; Confidential
          Investor Materials
        </p>
      </footer>
    </div>
  );
}
