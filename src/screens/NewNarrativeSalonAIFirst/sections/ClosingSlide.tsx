import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { revealUp, fadeIn, DUR, EASE_OUT } from "../../SpectraInvestorExperience/visuals/demo/motion";
import { CinematicSlide } from "./CinematicSlide";
import { SLIDE_THEME, INK, amorphicCard } from "../theme";
import { CLOSING } from "../copy";

export const ClosingSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const reveal = reduced ? fadeIn : revealUp;
  const theme = SLIDE_THEME["closing"];

  const steps = CLOSING.ladder.split(" → ");

  return (
    <CinematicSlide theme={theme} ariaLabel="The vision" scrim="center" align="center" constellation fit>
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
          className="text-2xl sm:text-3xl font-light mb-4"
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
          style={{ fontSize: "clamp(2rem, 4.5vw, 3.8rem)", color: INK.strong, textShadow: "0 2px 28px rgba(0,0,0,0.55)" }}
        >
          {CLOSING.line2}
        </motion.h1>

        {/* Story ladder */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.38 }}
          className="inline-flex items-center gap-3 rounded-2xl px-6 py-4 mx-auto mb-6"
          style={amorphicCard(theme.accentBorder)}
        >
          {steps.map((step, i) => (
            <React.Fragment key={step}>
              <span className="text-sm font-medium" style={{ color: i === steps.length - 1 ? theme.accent : INK.soft }}>
                {step}
              </span>
              {i < steps.length - 1 && (
                <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
                  <path d="M1 5h12M9 2l4 3-4 3" stroke={theme.accent} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.6"/>
                </svg>
              )}
            </React.Fragment>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.55 }}
          className="text-sm font-light leading-relaxed max-w-2xl mx-auto"
          style={{ color: INK.faint }}
        >
          {CLOSING.sub}
        </motion.p>
      </div>
    </CinematicSlide>
  );
};
