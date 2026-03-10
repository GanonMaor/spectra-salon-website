import React, { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Navigation } from "../../components/Navigation";
import { InvestorMiniNav } from "../Investors/InvestorMiniNav";
import {
  SECTIONS,
  HERO,
  PROBLEM,
  BREAKTHROUGH,
  COLOR_BAR_LOOP,
  DATASET,
  FLYWHEEL,
  HAIRGPT,
  INTELLIGENCE,
  MARKET,
  MOAT,
  TRACTION,
  ROADMAP,
  VISION,
} from "./investor-content";

// ── Primitives ───────────────────────────────────────────────────────

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

function SectionShell({
  id,
  dark = false,
  children,
  className = "",
}: {
  id: string;
  dark?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`relative py-24 sm:py-32 px-6 sm:px-10 lg:px-20 overflow-hidden ${
        dark ? "bg-gray-950 text-white" : "bg-white text-gray-900"
      } ${className}`}
    >
      <div className="max-w-5xl mx-auto relative z-10">{children}</div>
    </section>
  );
}

function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold tracking-[0.2em] uppercase text-violet-500 mb-4">
      {children}
    </p>
  );
}

function BigHeadline({
  children,
  light = false,
}: {
  children: React.ReactNode;
  light?: boolean;
}) {
  return (
    <h2
      className={`text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1] mb-6 ${
        light ? "text-white" : "text-gray-900"
      }`}
    >
      {children}
    </h2>
  );
}

function SubText({
  children,
  light = false,
}: {
  children: React.ReactNode;
  light?: boolean;
}) {
  return (
    <p
      className={`text-lg sm:text-xl leading-relaxed max-w-2xl ${
        light ? "text-gray-400" : "text-gray-500"
      }`}
    >
      {children}
    </p>
  );
}

function StatCard({
  value,
  label,
  dark = false,
}: {
  value: string;
  label: string;
  dark?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-4 sm:p-6 lg:p-8 text-center ${
        dark
          ? "bg-white/5 border border-white/10"
          : "bg-gray-50 border border-gray-100"
      }`}
    >
      <p
        className={`text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-1 sm:mb-2 ${
          dark ? "text-white" : "text-gray-900"
        }`}
      >
        {value}
      </p>
      <p
        className={`text-[11px] sm:text-sm font-medium leading-tight ${
          dark ? "text-gray-500" : "text-gray-400"
        }`}
      >
        {label}
      </p>
    </div>
  );
}

// ── Loop Diagram ─────────────────────────────────────────────────────

function LoopDiagram({
  steps,
  dark = false,
}: {
  steps: readonly string[];
  dark?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-0">
      {steps.map((step, i) => (
        <React.Fragment key={step}>
          <div
            className={`px-6 py-3 rounded-xl text-sm font-medium text-center w-full max-w-xs ${
              dark
                ? "bg-white/5 border border-white/10 text-white"
                : "bg-violet-50 border border-violet-100 text-violet-900"
            }`}
          >
            {step}
          </div>
          {i < steps.length - 1 && (
            <div className={`w-px h-6 ${dark ? "bg-white/10" : "bg-violet-200"}`} />
          )}
        </React.Fragment>
      ))}
      <div className={`w-px h-6 ${dark ? "bg-white/10" : "bg-violet-200"}`} />
      <svg
        className={`w-4 h-4 ${dark ? "text-violet-400" : "text-violet-500"}`}
        viewBox="0 0 16 16"
        fill="currentColor"
      >
        <path d="M8 12l-4-4h8z" />
      </svg>
    </div>
  );
}

// ── Flywheel Ring ────────────────────────────────────────────────────

function FlywheelRing({ steps }: { steps: readonly string[] }) {
  const r = 140;
  const cx = 160;
  const cy = 160;

  return (
    <div className="flex justify-center">
      <svg viewBox="0 0 320 320" className="w-64 h-64 sm:w-80 sm:h-80">
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="rgba(139,92,246,0.15)"
          strokeWidth="2"
        />
        {steps.map((step, i) => {
          const angle = (i / steps.length) * Math.PI * 2 - Math.PI / 2;
          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle);
          const arrowAngle =
            ((i + 0.5) / steps.length) * Math.PI * 2 - Math.PI / 2;
          const ax = cx + (r - 2) * Math.cos(arrowAngle);
          const ay = cy + (r - 2) * Math.sin(arrowAngle);
          return (
            <g key={step}>
              <circle cx={x} cy={y} r="6" fill="#8b5cf6" />
              <text
                x={x}
                y={y + (y < cy ? -16 : 20)}
                textAnchor="middle"
                className="fill-white text-[10px] font-medium"
              >
                {step}
              </text>
              <circle cx={ax} cy={ay} r="2.5" fill="#8b5cf6" opacity="0.5" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// SECTIONS
// ═════════════════════════════════════════════════════════════════════

function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-[100dvh] flex flex-col items-center justify-center px-6 sm:px-10 bg-gray-950 text-white overflow-hidden"
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #a78bfa 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <FadeIn className="text-center max-w-4xl mx-auto relative z-10">
        <p className="text-xs font-semibold tracking-[0.25em] uppercase text-violet-400 mb-8">
          Investor Overview
        </p>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] mb-6 sm:mb-8">
          {HERO.headline}
        </h1>
        <p className="text-lg sm:text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto whitespace-pre-line">
          {HERO.sub}
        </p>
      </FadeIn>

      <FadeIn delay={0.2} className="mt-10 sm:mt-16 w-full max-w-3xl mx-auto relative z-10">
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {HERO.stats.map((s) => (
            <StatCard key={s.label} value={s.value} label={s.label} dark />
          ))}
        </div>
      </FadeIn>

      <FadeIn delay={0.35} className="mt-12 sm:mt-20 relative z-10">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-violet-500 text-center mb-6">
          The One Loop
        </p>
        <LoopDiagram steps={HERO.loopSteps} dark />
      </FadeIn>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </motion.div>
      </div>
    </section>
  );
}

function ProblemSection() {
  return (
    <SectionShell id="problem">
      <FadeIn>
        <SectionTag>The Problem</SectionTag>
        <BigHeadline>{PROBLEM.lead}</BigHeadline>
        <SubText>{PROBLEM.emphasis}</SubText>
      </FadeIn>

      <FadeIn delay={0.15} className="mt-14 grid sm:grid-cols-3 gap-4">
        {PROBLEM.bullets.map((b) => (
          <div
            key={b}
            className="rounded-2xl bg-red-50 border border-red-100 p-6"
          >
            <div className="w-2 h-2 rounded-full bg-red-400 mb-4" />
            <p className="text-sm font-medium text-red-900">{b}</p>
          </div>
        ))}
      </FadeIn>

      <FadeIn delay={0.25} className="mt-14 flex justify-center">
        <div className="rounded-2xl bg-gray-950 text-white px-8 sm:px-12 py-8 sm:py-10 text-center">
          <p className="text-4xl sm:text-5xl font-bold tracking-tight mb-2">
            {PROBLEM.stat.value}
          </p>
          <p className="text-sm text-gray-400">{PROBLEM.stat.label}</p>
        </div>
      </FadeIn>
    </SectionShell>
  );
}

function BreakthroughSection() {
  const iconMap: Record<string, React.ReactNode> = {
    tablet: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5h3m-6.75 2.25h10.5a2.25 2.25 0 002.25-2.25V4.5a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 4.5v15a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    bluetooth: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l4 4-4 4m0 0l4 4-4 4m0-8V2m0 20v-8" />
      </svg>
    ),
    beaker: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-1.338 4.686A2.25 2.25 0 0115.482 21H8.518a2.25 2.25 0 01-2.18-1.814L5 14.5m14 0H5" />
      </svg>
    ),
  };

  return (
    <SectionShell id="breakthrough" dark>
      <FadeIn>
        <SectionTag>The Breakthrough</SectionTag>
        <BigHeadline light>{BREAKTHROUGH.headline}</BigHeadline>
        <SubText light>{BREAKTHROUGH.sub}</SubText>
      </FadeIn>

      <FadeIn delay={0.15} className="mt-16 grid sm:grid-cols-3 gap-6">
        {BREAKTHROUGH.stack.map((s, i) => (
          <div
            key={s.label}
            className="rounded-2xl bg-white/5 border border-white/10 p-8 text-center"
          >
            <div className="flex justify-center mb-5 text-violet-400">
              {iconMap[s.icon]}
            </div>
            <p className="text-sm font-semibold text-white">{s.label}</p>
          </div>
        ))}
      </FadeIn>
    </SectionShell>
  );
}

function ColorBarLoopSection() {
  return (
    <SectionShell id="color-bar-loop">
      <FadeIn>
        <SectionTag>Core Workflow</SectionTag>
        <BigHeadline>{COLOR_BAR_LOOP.headline}</BigHeadline>
        <SubText>{COLOR_BAR_LOOP.sub}</SubText>
      </FadeIn>

      <FadeIn delay={0.15} className="mt-16 flex justify-center">
        <LoopDiagram steps={COLOR_BAR_LOOP.steps} />
      </FadeIn>
    </SectionShell>
  );
}

function DatasetSection() {
  return (
    <SectionShell id="dataset" dark>
      <FadeIn>
        <SectionTag>Data Layer</SectionTag>
        <BigHeadline light>{DATASET.headline}</BigHeadline>
        <SubText light>{DATASET.sub}</SubText>
      </FadeIn>

      <FadeIn delay={0.15} className="mt-14 grid grid-cols-2 sm:grid-cols-3 gap-4">
        {DATASET.signals.map((s) => (
          <div
            key={s}
            className="rounded-xl bg-white/5 border border-white/10 px-5 py-4 text-center"
          >
            <p className="text-sm font-medium text-gray-300">{s}</p>
          </div>
        ))}
      </FadeIn>
    </SectionShell>
  );
}

function FlywheelSection() {
  return (
    <SectionShell id="flywheel" dark className="bg-gray-950">
      <FadeIn>
        <SectionTag>Growth Engine</SectionTag>
        <BigHeadline light>{FLYWHEEL.headline}</BigHeadline>
        <SubText light>{FLYWHEEL.sub}</SubText>
      </FadeIn>

      <FadeIn delay={0.2} className="mt-16">
        <FlywheelRing steps={FLYWHEEL.steps} />
      </FadeIn>
    </SectionShell>
  );
}

function HairGptSection() {
  return (
    <SectionShell id="hairgpt">
      <FadeIn>
        <SectionTag>{HAIRGPT.tag}</SectionTag>
        <BigHeadline>{HAIRGPT.headline}</BigHeadline>
        <SubText>{HAIRGPT.sub}</SubText>
      </FadeIn>

      <FadeIn delay={0.15} className="mt-14 grid sm:grid-cols-2 gap-4">
        {HAIRGPT.useCases.map((uc) => (
          <div
            key={uc}
            className="rounded-2xl bg-violet-50 border border-violet-100 p-6 flex items-start gap-4"
          >
            <div className="w-2 h-2 rounded-full bg-violet-500 mt-1.5 flex-shrink-0" />
            <p className="text-sm font-medium text-violet-900">{uc}</p>
          </div>
        ))}
      </FadeIn>
    </SectionShell>
  );
}

function IntelligenceSection() {
  return (
    <SectionShell id="intelligence" dark>
      <FadeIn>
        <SectionTag>Vision</SectionTag>
        <BigHeadline light>{INTELLIGENCE.headline}</BigHeadline>
        <SubText light>{INTELLIGENCE.sub}</SubText>
      </FadeIn>

      <FadeIn delay={0.15} className="mt-14 grid sm:grid-cols-2 gap-5">
        {INTELLIGENCE.nodes.map((n) => (
          <div
            key={n.label}
            className="rounded-2xl bg-white/5 border border-white/10 p-7"
          >
            <p className="text-lg font-bold text-white mb-1">{n.label}</p>
            <p className="text-sm text-gray-500">{n.desc}</p>
          </div>
        ))}
      </FadeIn>
    </SectionShell>
  );
}

function MarketSection() {
  return (
    <SectionShell id="market">
      <FadeIn>
        <SectionTag>Market</SectionTag>
        <BigHeadline>{MARKET.headline}</BigHeadline>
      </FadeIn>

      <FadeIn delay={0.1} className="mt-12 grid sm:grid-cols-3 gap-5">
        {MARKET.stats.map((s) => (
          <StatCard key={s.label} value={s.value} label={s.label} />
        ))}
      </FadeIn>

      <FadeIn delay={0.2} className="mt-14">
        <div className="rounded-2xl bg-gray-50 border border-gray-100 p-8 text-center">
          <p className="text-lg sm:text-xl font-medium text-gray-700">
            {MARKET.expansion}
          </p>
        </div>
      </FadeIn>
    </SectionShell>
  );
}

function MoatSection() {
  return (
    <SectionShell id="moat" dark>
      <FadeIn>
        <SectionTag>Defensibility</SectionTag>
        <BigHeadline light>{MOAT.headline}</BigHeadline>
      </FadeIn>

      <FadeIn delay={0.15} className="mt-14 grid sm:grid-cols-3 gap-5">
        {MOAT.pillars.map((p) => (
          <div
            key={p.label}
            className="rounded-2xl bg-white/5 border border-white/10 p-7"
          >
            <p className="text-lg font-bold text-white mb-2">{p.label}</p>
            <p className="text-sm text-gray-500">{p.desc}</p>
          </div>
        ))}
      </FadeIn>
    </SectionShell>
  );
}

function TractionSection() {
  return (
    <SectionShell id="traction">
      <FadeIn>
        <SectionTag>Proof</SectionTag>
        <BigHeadline>{TRACTION.headline}</BigHeadline>
      </FadeIn>

      <FadeIn delay={0.1} className="mt-12 grid grid-cols-2 sm:grid-cols-3 gap-4">
        {TRACTION.metrics.map((m) => (
          <StatCard key={m.label} value={m.value} label={m.label} />
        ))}
      </FadeIn>
    </SectionShell>
  );
}

function RoadmapSection() {
  return (
    <SectionShell id="roadmap" dark>
      <FadeIn>
        <SectionTag>Growth Path</SectionTag>
        <BigHeadline light>{ROADMAP.headline}</BigHeadline>
      </FadeIn>

      <FadeIn delay={0.15} className="mt-14 space-y-5">
        {ROADMAP.phases.map((p, i) => (
          <div
            key={p.phase}
            className="rounded-2xl bg-white/5 border border-white/10 p-5 sm:p-7 flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6"
          >
            <div className="flex-shrink-0 sm:w-20">
              <p className="text-xs font-semibold tracking-wider uppercase text-violet-400">
                {p.phase}
              </p>
            </div>
            <div>
              <p className="text-base sm:text-lg font-bold text-white mb-1">{p.title}</p>
              <p className="text-sm text-gray-500">{p.desc}</p>
            </div>
          </div>
        ))}
      </FadeIn>
    </SectionShell>
  );
}

function VisionSection() {
  return (
    <section
      id="vision"
      className="relative py-32 sm:py-44 px-6 sm:px-10 bg-gray-950 text-white text-center overflow-hidden"
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #a78bfa 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <FadeIn className="relative z-10 max-w-3xl mx-auto">
        <p className="text-xs font-semibold tracking-[0.25em] uppercase text-violet-400 mb-8">
          The Vision
        </p>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1] mb-6">
          {VISION.primary}
        </h2>
        <p className="text-xl text-gray-500 italic">{VISION.alt}</p>
      </FadeIn>
    </section>
  );
}

// ═════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════════════════════════════

export function InvestorFlywheelPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Spectra — Investor Overview";
  }, []);

  return (
    <div
      className="min-h-[100dvh] overflow-x-hidden"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      <style>{`div::-webkit-scrollbar { display: none; }`}</style>
      <Navigation />
      <InvestorMiniNav sections={[...SECTIONS]} />

      <HeroSection />
      <ProblemSection />
      <BreakthroughSection />
      <ColorBarLoopSection />
      <DatasetSection />
      <FlywheelSection />
      <HairGptSection />
      <IntelligenceSection />
      <MarketSection />
      <MoatSection />
      <TractionSection />
      <RoadmapSection />
      <VisionSection />

      <footer className="py-8 bg-gray-950 border-t border-white/5 text-center">
        <p className="text-xs text-gray-600">
          &copy; {new Date().getFullYear()} Spectra AI &mdash; Confidential
          Investor Materials
        </p>
      </footer>
    </div>
  );
}
