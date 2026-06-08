import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { stagger, pickStaggerItem, DUR, EASE_OUT } from "../../SpectraInvestorExperience/visuals/demo/motion";
import { CinematicSlide, SlideHeading } from "./CinematicSlide";
import { SLIDE_THEME, INK, darkGlass, amorphicCard } from "../theme";
import { WHY_COLOR } from "../copy";

export const WhyColorSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const item = pickStaggerItem(reduced);
  const theme = SLIDE_THEME["why-color"];

  return (
    <CinematicSlide theme={theme} ariaLabel="Why we started with color" scrim="left">
      <SlideHeading theme={theme} eyebrow={WHY_COLOR.eyebrow} size="h1" className="mb-10 max-w-3xl" layer={1}>
        {WHY_COLOR.headline}
      </SlideHeading>

      <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-10 max-w-6xl" variants={stagger} initial="hidden" animate="visible">
        {WHY_COLOR.pillars.map((pillar, i) => (
          <motion.div key={pillar.title} variants={item} className="rounded-2xl p-5" style={i === 2 ? amorphicCard(theme.accentBorder) : darkGlass()}>
            <div className="mb-3 flex items-center gap-3">
              <span className="text-xs font-semibold tabular-nums" style={{ color: theme.accent }}>
                0{i + 1}
              </span>
              <h3 className="text-lg font-medium" style={{ color: INK.strong }}>
                {pillar.title}
              </h3>
            </div>
            <p className="text-sm font-light leading-relaxed" style={{ color: INK.soft }}>
              {pillar.detail}
            </p>
          </motion.div>
        ))}
      </motion.div>

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
