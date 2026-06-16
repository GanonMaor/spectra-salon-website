/**
 * Layer 1 — Understanding The World
 * Slides 1–5: cinematic context before the intelligence data.
 */

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { revealUp, fadeIn, stagger, staggerItem, DUR, EASE_OUT } from "../../SpectraInvestorExperience/visuals/demo/motion";
import { INV } from "../../SpectraInvestorExperience/tokens";
import { GOLD } from "../copy";

const CREAM = "#FBF6EF";
const CREAM_SOFT = "rgba(251,246,239,0.72)";
const CREAM_FAINT = "rgba(251,246,239,0.45)";
const BG_DEEP = "#0A0806";

const GoldPill: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center gap-2 mb-10">
    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: GOLD }} />
    <span className="text-[11px] font-semibold uppercase tracking-[0.3em]" style={{ color: GOLD }}>
      {children}
    </span>
  </div>
);

/* ─── Slide 1: Market Question Hero ─── */
export const MarketQuestionHeroSlide: React.FC = () => {
  const rm = useReducedMotion() ?? false;
  const reveal = rm ? fadeIn : revealUp;
  const BG = "/investor-vision/hero/salon-color-room.jpg";
  const SCRIM = "linear-gradient(110deg,rgba(8,6,4,0.95) 0%,rgba(8,6,4,0.76) 50%,rgba(8,6,4,0.28) 100%)";

  return (
    <section
      className="relative w-full h-full flex items-center overflow-hidden"
      style={{ background: BG_DEEP }}
      aria-label="Market question hero"
    >
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('${BG}')`,
          backgroundSize: "cover",
          backgroundPosition: "center 35%",
        }}
      />
      <div className="absolute inset-0 z-[1]" style={{ background: SCRIM }} />
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background: `radial-gradient(60% 70% at 12% 56%, rgba(217,185,129,0.15), transparent 68%)`,
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 sm:px-12 lg:px-20 py-20">
        <motion.div variants={reveal} initial="hidden" animate="visible" transition={{ duration: DUR.fast, ease: EASE_OUT }}>
          <GoldPill>Color Intelligence Preview</GoldPill>
        </motion.div>

        <div className="max-w-[680px]">
          <motion.h1
            variants={reveal}
            initial="hidden"
            animate="visible"
            transition={{ duration: DUR.enter, ease: EASE_OUT, delay: rm ? 0 : 0.08 }}
            className="font-light leading-[1.04] tracking-[-0.025em] mb-8"
            style={{ fontSize: "clamp(2.6rem, 6.5vw, 5rem)", color: CREAM }}
          >
            What can a color manufacturer actually know about the market?
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DUR.slow, ease: EASE_OUT, delay: rm ? 0 : 0.55 }}
            className="text-lg sm:text-xl font-light leading-[1.75]"
            style={{ color: CREAM_SOFT, maxWidth: "520px" }}
          >
            Not what was sold. Not what was shipped.
            <br />
            <span style={{ color: CREAM }}>What was actually used.</span>
          </motion.p>
        </div>
      </div>
    </section>
  );
};

/* ─── Slide 2: Professional Color Complexity ─── */
export const ProfessionalComplexitySlide: React.FC = () => {
  const rm = useReducedMotion() ?? false;
  const BG = "/investor-vision/hero/salon-colorists.jpg";
  const SCRIM = "linear-gradient(115deg,rgba(8,6,4,0.96) 0%,rgba(8,6,4,0.78) 45%,rgba(8,6,4,0.30) 100%)";

  const facts = [
    { num: "570", label: "unique color shades tracked" },
    { num: "25", label: "product series from 12 brands" },
    { num: "28,642", label: "individual formulas recorded" },
  ];

  return (
    <section
      className="relative w-full h-full flex items-center overflow-hidden"
      style={{ background: BG_DEEP }}
      aria-label="Professional color complexity"
    >
      <div
        className="absolute inset-0 z-0"
        style={{ backgroundImage: `url('${BG}')`, backgroundSize: "cover", backgroundPosition: "center 40%" }}
      />
      <div className="absolute inset-0 z-[1]" style={{ background: SCRIM }} />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 sm:px-12 lg:px-20 py-20">
        <motion.div variants={rm ? fadeIn : revealUp} initial="hidden" animate="visible" transition={{ duration: DUR.fast }}>
          <GoldPill>Layer 1 · The World</GoldPill>
        </motion.div>

        <div className="max-w-[640px]">
          <motion.h2
            variants={rm ? fadeIn : revealUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: DUR.enter, ease: EASE_OUT, delay: rm ? 0 : 0.08 }}
            className="font-light leading-[1.06] tracking-[-0.02em] mb-10"
            style={{ fontSize: "clamp(2.4rem, 5.5vw, 4.4rem)", color: CREAM }}
          >
            Every day, stylists make thousands of color decisions.
          </motion.h2>

          <motion.div
            variants={rm ? fadeIn : stagger}
            initial="hidden"
            animate="visible"
            transition={{ delay: rm ? 0 : 0.5 }}
            className="grid grid-cols-3 gap-4 mb-10"
          >
            {facts.map((f) => (
              <motion.div
                key={f.num}
                variants={rm ? fadeIn : staggerItem}
                className="rounded-xl px-4 py-5"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div className="text-3xl font-light mb-1 tabular-nums" style={{ color: GOLD }}>
                  {f.num}
                </div>
                <div className="text-[12px] font-light leading-snug" style={{ color: CREAM_SOFT }}>
                  {f.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DUR.slow, ease: EASE_OUT, delay: rm ? 0 : 0.82 }}
            className="text-base font-light leading-relaxed"
            style={{ color: CREAM_FAINT }}
          >
            No inventory system captures this. No CRM records it.
          </motion.p>
        </div>
      </div>
    </section>
  );
};

/* ─── Slide 3: Workflow Data Trail ─── */
export const WorkflowTrailSlide: React.FC = () => {
  const rm = useReducedMotion() ?? false;

  const steps = [
    { icon: "⬡", label: "Tube", sub: "product chosen" },
    { icon: "⚖", label: "Scale", sub: "grams measured" },
    { icon: "⊕", label: "Formula", sub: "mix recorded" },
    { icon: "✦", label: "Service", sub: "delivered to client" },
    { icon: "◉", label: "Client", sub: "profile updated" },
  ];

  return (
    <section
      className="relative w-full h-full flex flex-col justify-center overflow-hidden"
      style={{ background: "#0C0A08" }}
      aria-label="Workflow data trail"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(55% 60% at 50% 55%, rgba(193,154,99,0.08), transparent 70%)`,
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 sm:px-12 lg:px-20 py-20">
        <motion.div variants={rm ? fadeIn : revealUp} initial="hidden" animate="visible">
          <GoldPill>Layer 1 · The Data Trail</GoldPill>
        </motion.div>

        <motion.h2
          variants={rm ? fadeIn : revealUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: DUR.enter, ease: EASE_OUT, delay: rm ? 0 : 0.06 }}
          className="font-light leading-[1.06] tracking-[-0.02em] mb-14"
          style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)", color: CREAM }}
        >
          Every color service creates a data trail.
        </motion.h2>

        {/* Flow steps */}
        <motion.div
          variants={rm ? fadeIn : stagger}
          initial="hidden"
          animate="visible"
          transition={{ delay: rm ? 0 : 0.45 }}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-0"
        >
          {steps.map((step, i) => (
            <React.Fragment key={step.label}>
              <motion.div
                variants={rm ? fadeIn : staggerItem}
                className="flex sm:flex-col items-center sm:items-center gap-3 sm:gap-2"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                  style={{
                    background: `rgba(193,154,99,0.12)`,
                    border: `1px solid rgba(193,154,99,0.35)`,
                    color: GOLD,
                  }}
                >
                  {step.icon}
                </div>
                <div className="sm:text-center">
                  <div className="text-sm font-semibold" style={{ color: CREAM }}>
                    {step.label}
                  </div>
                  <div className="text-[11px] font-light" style={{ color: CREAM_FAINT }}>
                    {step.sub}
                  </div>
                </div>
              </motion.div>
              {i < steps.length - 1 && (
                <motion.div
                  variants={rm ? fadeIn : staggerItem}
                  className="hidden sm:block flex-1 h-px mx-2"
                  style={{ background: `linear-gradient(90deg, rgba(193,154,99,0.4), rgba(193,154,99,0.15))` }}
                />
              )}
            </React.Fragment>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DUR.slow, ease: EASE_OUT, delay: rm ? 0 : 1.1 }}
          className="mt-14 text-base sm:text-lg font-light leading-relaxed max-w-[540px]"
          style={{ color: CREAM_SOFT }}
        >
          Spectra captures this trail automatically — at the moment each decision is made, not after the fact.
        </motion.p>
      </div>
    </section>
  );
};

/* ─── Slide 4: Shade Systems Explained ─── */
export const ShadeSystemsSlide: React.FC = () => {
  const rm = useReducedMotion() ?? false;

  const examples = [
    {
      brand: "L'Oréal",
      series: "Dia Light",
      shade: "10.12",
      level: "Level 10",
      family: "Blonde",
      temperature: "Cool",
      reflection: "Ash + Iridescent",
      human: "Icy platinum blonde toner — the #1 toner shade in this market",
      dot: "#E8E4FF",
    },
    {
      brand: "L'Oréal",
      series: "INOA",
      shade: "7.11",
      level: "Level 7",
      family: "Brown / Dark Blonde",
      temperature: "Cool",
      reflection: "Ash + Ash",
      human: "Cool ash blonde — heavily used in root touch-up services",
      dot: "#B8C4D0",
    },
    {
      brand: "L'Oréal",
      series: "Majirel",
      shade: "6.0",
      level: "Level 6",
      family: "Brown / Dark Blonde",
      temperature: "Neutral",
      reflection: "Natural",
      human: "Dark blonde natural base — most versatile root color",
      dot: "#8B6B3D",
    },
    {
      brand: "Schwarzkopf",
      series: "Igora Royal",
      shade: "9-1",
      level: "Level 9",
      family: "Blonde",
      temperature: "Cool",
      reflection: "Ash / Cendre",
      human: "Very light ash blonde — used in corrective & highlights",
      dot: "#D4C9B8",
    },
  ];

  return (
    <section
      className="relative w-full h-full flex flex-col justify-center overflow-hidden"
      style={{ background: "#0E0B09" }}
      aria-label="Shade systems explained"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(50% 55% at 20% 50%, rgba(193,154,99,0.07), transparent 70%)`,
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 sm:px-12 lg:px-20 py-20">
        <motion.div variants={rm ? fadeIn : revealUp} initial="hidden" animate="visible">
          <GoldPill>Layer 1 · Shade Systems</GoldPill>
        </motion.div>

        <motion.h2
          variants={rm ? fadeIn : revealUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: DUR.enter, ease: EASE_OUT, delay: rm ? 0 : 0.06 }}
          className="font-light tracking-[-0.02em] mb-3"
          style={{ fontSize: "clamp(2rem, 4.5vw, 3.6rem)", color: CREAM }}
        >
          A color formula is a coded decision.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: DUR.enter, delay: rm ? 0 : 0.3 }}
          className="text-base font-light mb-10"
          style={{ color: CREAM_FAINT }}
        >
          Each shade number encodes level, family, temperature, and reflection — a precise professional instruction.
        </motion.p>

        <motion.div
          variants={rm ? fadeIn : stagger}
          initial="hidden"
          animate="visible"
          transition={{ delay: rm ? 0 : 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
        >
          {examples.map((ex) => (
            <motion.div
              key={ex.shade + ex.series}
              variants={rm ? fadeIn : staggerItem}
              className="rounded-2xl p-5"
              style={{
                background: "rgba(255,255,255,0.055)",
                border: "1px solid rgba(255,255,255,0.10)",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ background: ex.dot, boxShadow: `0 0 8px ${ex.dot}66` }}
                />
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: GOLD }}>
                  {ex.series}
                </span>
              </div>
              <div className="text-3xl font-light mb-3" style={{ color: CREAM }}>
                {ex.shade}
              </div>
              <div className="space-y-1.5">
                {[
                  { k: "Brand", v: ex.brand },
                  { k: "Level", v: ex.level },
                  { k: "Family", v: ex.family },
                  { k: "Temp", v: ex.temperature },
                  { k: "Reflect", v: ex.reflection },
                ].map((r) => (
                  <div key={r.k} className="flex gap-2 text-[12px]">
                    <span className="w-[52px] flex-shrink-0 font-medium" style={{ color: CREAM_FAINT }}>
                      {r.k}
                    </span>
                    <span className="font-light" style={{ color: CREAM_SOFT }}>
                      {r.v}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[11px] font-light leading-snug italic" style={{ color: CREAM_FAINT }}>
                {ex.human}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

/* ─── Slide 5: Bridge To Intelligence ─── */
export const BridgeToIntelligenceSlide: React.FC = () => {
  const rm = useReducedMotion() ?? false;
  const BG = "/investor-vision/hero/salon-color-station.jpg";
  const SCRIM = "linear-gradient(110deg,rgba(8,6,4,0.97) 0%,rgba(8,6,4,0.82) 45%,rgba(8,6,4,0.38) 100%)";

  return (
    <section
      className="relative w-full h-full flex items-center overflow-hidden"
      style={{ background: BG_DEEP }}
      aria-label="Bridge to intelligence"
    >
      <div
        className="absolute inset-0 z-0"
        style={{ backgroundImage: `url('${BG}')`, backgroundSize: "cover", backgroundPosition: "center 50%" }}
      />
      <div className="absolute inset-0 z-[1]" style={{ background: SCRIM }} />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 sm:px-12 lg:px-20 py-20">
        <motion.div variants={rm ? fadeIn : revealUp} initial="hidden" animate="visible">
          <GoldPill>Layer 1 · The Question</GoldPill>
        </motion.div>

        <div className="max-w-[700px]">
          <motion.h2
            variants={rm ? fadeIn : revealUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: DUR.enter, ease: EASE_OUT, delay: rm ? 0 : 0.08 }}
            className="font-light leading-[1.06] tracking-[-0.025em] mb-8"
            style={{ fontSize: "clamp(2.4rem, 5.8vw, 4.6rem)", color: CREAM }}
          >
            What happens when thousands of color decisions are connected together?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DUR.slow, ease: EASE_OUT, delay: rm ? 0 : 0.58 }}
            className="text-xl font-light leading-[1.7]"
            style={{ color: CREAM_SOFT }}
          >
            A market intelligence layer that's never existed before.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: DUR.slow, ease: EASE_OUT, delay: rm ? 0 : 1.1 }}
            className="mt-10 flex items-center gap-3"
          >
            <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${INV.gold}, transparent)` }} />
            <span className="text-[11px] uppercase tracking-[0.28em] font-medium" style={{ color: GOLD }}>
              What the industry can't see
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
