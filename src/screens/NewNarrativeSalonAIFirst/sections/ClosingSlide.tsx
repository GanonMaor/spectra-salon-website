import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { revealUp, fadeIn, DUR, EASE_OUT } from "../../SpectraInvestorExperience/visuals/demo/motion";
import { CinematicSlide } from "./CinematicSlide";
import { SLIDE_THEME, INK } from "../theme";
import { CLOSING } from "../copy";

export const ClosingSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const reveal = reduced ? fadeIn : revealUp;
  const theme = SLIDE_THEME["closing"];

  return (
    <CinematicSlide theme={theme} ariaLabel="The vision" scrim="center" align="center" constellation>
      <div className="max-w-4xl mx-auto">
        <motion.div
          variants={reveal}
          initial="hidden"
          animate="visible"
          transition={{ duration: DUR.fast, ease: EASE_OUT }}
          className="text-[11px] font-semibold uppercase tracking-[0.3em] mb-8"
          style={{ color: theme.accent }}
        >
          {CLOSING.eyebrow}
        </motion.div>

        <motion.h2
          variants={reveal}
          initial="hidden"
          animate="visible"
          transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.1 }}
          className="text-3xl sm:text-4xl font-light mb-4"
          style={{ color: INK.soft, textShadow: "0 1px 14px rgba(0,0,0,0.5)" }}
        >
          {CLOSING.line1}
        </motion.h2>

        <motion.h1
          variants={reveal}
          initial="hidden"
          animate="visible"
          transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.2 }}
          className="font-light leading-[1.05] tracking-[-0.02em] mb-10"
          style={{ fontSize: "clamp(2.5rem, 5.5vw, 4.5rem)", color: INK.strong, textShadow: "0 2px 28px rgba(0,0,0,0.55)" }}
        >
          {CLOSING.line2}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.4 }}
          className="text-base sm:text-lg font-light tracking-[0.04em]"
          style={{ color: theme.accent }}
        >
          {CLOSING.ladder}
        </motion.p>
      </div>
    </CinematicSlide>
  );
};
