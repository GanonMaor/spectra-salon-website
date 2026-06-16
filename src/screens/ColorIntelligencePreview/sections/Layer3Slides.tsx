/**
 * Layer 3 — Why Only Spectra
 * Slides 13–14: short explanation and final message.
 */

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  revealUp,
  fadeIn,
  stagger,
  staggerItem,
  DUR,
  EASE_OUT,
} from "../../SpectraInvestorExperience/visuals/demo/motion";
import { GOLD } from "../copy";

const CREAM = "#FBF6EF";
const CREAM_SOFT = "rgba(251,246,239,0.72)";
const CREAM_FAINT = "rgba(251,246,239,0.42)";

const GoldPill: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center gap-2 mb-10">
    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: GOLD }} />
    <span className="text-[11px] font-semibold uppercase tracking-[0.3em]" style={{ color: GOLD }}>
      {children}
    </span>
  </div>
);

/* ─── Slide 13: Why Can Spectra See This? ─── */
export const WhySpectraCanSeeSlide: React.FC = () => {
  const rm = useReducedMotion() ?? false;
  const BG = "/investor-vision/salon-ai-live-demo/tablet-color-mixing.png";

  const reasons = [
    {
      icon: "⬡",
      title: "Color Bar workflow",
      desc: "Spectra operates at the physical Color Bar — where products are chosen, weighed, and mixed.",
    },
    {
      icon: "⚖",
      title: "Scan and weigh at point-of-use",
      desc: "Every product is scanned and weighed the moment it enters the formula — not after the fact.",
    },
    {
      icon: "⊕",
      title: "Automatic formula capture",
      desc: "No manual entry. No rounding. No guessing. Each formula is recorded exactly as mixed.",
    },
    {
      icon: "◉",
      title: "Decisions, not transactions",
      desc: "Other systems capture sales orders. Spectra captures the professional decision that precedes them.",
    },
  ];

  return (
    <section
      className="relative w-full h-full flex items-center overflow-hidden"
      style={{ background: "#0C0A08" }}
      aria-label="Why Spectra can see this"
    >
      <div
        className="absolute right-0 top-0 bottom-0 w-1/2 z-0 hidden lg:block"
        style={{
          backgroundImage: `url('${BG}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          maskImage: "linear-gradient(to right, transparent 0%, black 30%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 30%)",
          opacity: 0.25,
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(55% 60% at 18% 50%, rgba(193,154,99,0.08), transparent 68%)`,
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 sm:px-12 lg:px-20 py-20">
        <motion.div variants={rm ? fadeIn : revealUp} initial="hidden" animate="visible">
          <GoldPill>Layer 3 · Why Only Spectra</GoldPill>
        </motion.div>

        <motion.h2
          variants={rm ? fadeIn : revealUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: DUR.enter, ease: EASE_OUT, delay: rm ? 0 : 0.06 }}
          className="font-light leading-[1.06] tracking-[-0.02em] mb-10"
          style={{ fontSize: "clamp(2rem, 4.5vw, 3.6rem)", color: CREAM, maxWidth: "520px" }}
        >
          Why can Spectra see what no one else can?
        </motion.h2>

        <motion.div
          variants={rm ? fadeIn : stagger}
          initial="hidden"
          animate="visible"
          transition={{ delay: rm ? 0 : 0.45 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[700px]"
        >
          {reasons.map((r) => (
            <motion.div
              key={r.title}
              variants={rm ? fadeIn : staggerItem}
              className="rounded-2xl p-5"
              style={{
                background: "rgba(255,255,255,0.055)",
                border: "1px solid rgba(255,255,255,0.10)",
              }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-base mb-3"
                style={{
                  background: "rgba(193,154,99,0.12)",
                  border: "1px solid rgba(193,154,99,0.3)",
                  color: GOLD,
                }}
              >
                {r.icon}
              </div>
              <p className="text-sm font-semibold mb-1.5" style={{ color: CREAM }}>
                {r.title}
              </p>
              <p className="text-[13px] font-light leading-relaxed" style={{ color: CREAM_SOFT }}>
                {r.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

/* ─── Slide 14: Final Message ─── */
export const FinalMessageSlide: React.FC = () => {
  const rm = useReducedMotion() ?? false;
  const BG = "/investor-vision/hero/salon-color-room.jpg";
  const SCRIM =
    "linear-gradient(110deg,rgba(8,6,4,0.98) 0%,rgba(8,6,4,0.92) 50%,rgba(8,6,4,0.60) 100%)";

  return (
    <section
      className="relative w-full h-full flex items-center overflow-hidden"
      style={{ background: "#08060A" }}
      aria-label="Final message"
    >
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('${BG}')`,
          backgroundSize: "cover",
          backgroundPosition: "center 38%",
          filter: "grayscale(40%)",
        }}
      />
      <div className="absolute inset-0 z-[1]" style={{ background: SCRIM }} />
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background: `radial-gradient(55% 65% at 20% 55%, rgba(193,154,99,0.12), transparent 65%)`,
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 sm:px-12 lg:px-20 py-20">
        <div className="max-w-[720px]">
          <motion.div
            variants={rm ? fadeIn : revealUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: DUR.fast, ease: EASE_OUT }}
          >
            <GoldPill>Spectra · Color Intelligence</GoldPill>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DUR.enter, ease: EASE_OUT, delay: rm ? 0 : 0.1 }}
            className="font-light leading-[1.1] tracking-[-0.02em] mb-4"
            style={{ fontSize: "clamp(2.4rem, 5.5vw, 4.4rem)", color: CREAM_SOFT }}
          >
            This is not salon software.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DUR.enter, ease: EASE_OUT, delay: rm ? 0 : 0.38 }}
            className="font-light leading-[1.1] tracking-[-0.02em] mb-12"
            style={{ fontSize: "clamp(2.4rem, 5.5vw, 4.4rem)", color: CREAM }}
          >
            This is a market intelligence layer for the professional beauty industry.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: DUR.slow, delay: rm ? 0 : 0.9 }}
            className="flex flex-col sm:flex-row sm:items-center gap-4"
          >
            <div
              className="h-px w-10 hidden sm:block flex-shrink-0"
              style={{ background: `rgba(193,154,99,0.5)` }}
            />
            <p className="text-base font-light leading-relaxed" style={{ color: CREAM_FAINT }}>
              Based on real data from 6 active Israeli salons.
              <br />
              28,642 formulas · 49,108 product usages · 5,397 clients.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DUR.slow, delay: rm ? 0 : 1.3 }}
            className="mt-14"
          >
            <div
              className="inline-flex items-center gap-3 rounded-full px-6 py-3"
              style={{
                background: "rgba(193,154,99,0.10)",
                border: "1px solid rgba(193,154,99,0.30)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: GOLD }}
              />
              <span
                className="text-[11px] font-semibold uppercase tracking-[0.26em]"
                style={{ color: GOLD }}
              >
                Private preview — not for distribution
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
