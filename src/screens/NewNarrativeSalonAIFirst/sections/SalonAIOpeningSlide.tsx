import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { revealUp, fadeIn, DUR, EASE_OUT } from "../../SpectraInvestorExperience/visuals/demo/motion";
import { CinematicSlide } from "./CinematicSlide";
import { AgentSuitePhone } from "../visuals/AgentSuitePhone";
import { SLIDE_THEME, INK } from "../theme";
import { OPENING } from "../copy";

const PLATFORM_LAYERS = [
  { label: "Cost Optimization", num: "01" },
  { label: "Booking & POS", num: "02" },
  { label: "Autonomous AI Agents", num: "03" },
];

export const SalonAIOpeningSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const reveal = reduced ? fadeIn : revealUp;
  const theme = SLIDE_THEME["salon-ai"];

  const phone = (
    <AgentSuitePhone
      agents={OPENING.agents}
      accent={theme.accent}
      accentBorder={theme.accentBorder}
    />
  );

  return (
    <CinematicSlide theme={theme} ariaLabel="Salon AI" scrim="left" fit bleedRight={phone}>
      {/* Single left column — phone is absolutely placed via bleedRight */}
      <div className="max-w-[520px]">

        {/* Eyebrow */}
        <motion.div
          variants={reveal}
          initial="hidden"
          animate="visible"
          transition={{ duration: DUR.fast, ease: EASE_OUT }}
          className="text-[11px] font-semibold uppercase tracking-[0.3em] mb-5"
          style={{ color: theme.accent }}
        >
          Spectra
        </motion.div>

        {/* Hero headline */}
        <motion.h1
          variants={reveal}
          initial="hidden"
          animate="visible"
          transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.06 }}
          className="font-light leading-[0.9] tracking-[-0.03em] mb-8"
          style={{ fontSize: "clamp(3.5rem, 8.5vw, 7rem)", color: INK.strong, textShadow: "0 2px 32px rgba(0,0,0,0.55)" }}
        >
          {OPENING.headline}
        </motion.h1>

        {/* Platform layer chips */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.18 }}
          className="flex flex-col gap-2 mb-8"
        >
          {PLATFORM_LAYERS.map((layer, i) => (
            <motion.div
              key={layer.num}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.22 + i * 0.08 }}
              className="flex items-center gap-3"
            >
              <span
                className="text-[10px] font-semibold tabular-nums"
                style={{ color: theme.accent, opacity: 0.7 }}
              >
                {layer.num}
              </span>
              <span
                className="h-px flex-1 max-w-[24px]"
                style={{ background: theme.accentBorder }}
              />
              <span className="text-sm font-light tracking-wide" style={{ color: INK.soft }}>
                {layer.label}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Message lines */}
        <div className="space-y-1.5">
          {OPENING.lines.map((line, i) => (
            <motion.p
              key={line}
              variants={reveal}
              initial="hidden"
              animate="visible"
              transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.46 + i * 0.08 }}
              className="text-sm sm:text-base font-light"
              style={{ color: INK.faint }}
            >
              {line}
            </motion.p>
          ))}
        </div>
      </div>
    </CinematicSlide>
  );
};
