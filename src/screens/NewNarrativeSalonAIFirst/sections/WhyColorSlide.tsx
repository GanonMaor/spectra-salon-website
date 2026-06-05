import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { revealUp, fadeIn, DUR, EASE_OUT } from "../../SpectraInvestorExperience/visuals/demo/motion";
import { CinematicSlide, SlideHeading } from "./CinematicSlide";
import { SLIDE_THEME, INK } from "../theme";
import { WHY_COLOR } from "../copy";

export const WhyColorSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const reveal = reduced ? fadeIn : revealUp;
  const theme = SLIDE_THEME["why-color"];

  return (
    <CinematicSlide theme={theme} ariaLabel="Why we started with color" scrim="left">
      <SlideHeading theme={theme} eyebrow={WHY_COLOR.eyebrow} size="h1" className="mb-10 max-w-3xl" layer={1}>
        {WHY_COLOR.headline}
      </SlideHeading>

      <div className="space-y-2.5 mb-10 max-w-xl">
        {WHY_COLOR.lines.map((line, i) => (
          <motion.p
            key={line}
            variants={reveal}
            initial="hidden"
            animate="visible"
            transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.2 + i * 0.1 }}
            className="text-lg sm:text-xl font-light"
            style={{ color: INK.soft, textShadow: "0 1px 12px rgba(0,0,0,0.5)" }}
          >
            {line}
          </motion.p>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.6 }}
        className="text-xl sm:text-2xl font-light max-w-2xl"
        style={{ color: theme.accent }}
      >
        {WHY_COLOR.closing}
      </motion.p>
    </CinematicSlide>
  );
};
