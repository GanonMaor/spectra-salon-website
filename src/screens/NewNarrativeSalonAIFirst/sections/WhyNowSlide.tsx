import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Glyph } from "../../SpectraInvestorExperience/visuals/Glyph";
import { stagger, pickStaggerItem } from "../../SpectraInvestorExperience/visuals/demo/motion";
import { CinematicSlide, SlideHeading } from "./CinematicSlide";
import { SLIDE_THEME, INK, darkGlass } from "../theme";
import { WHY_NOW } from "../copy";

export const WhyNowSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const item = pickStaggerItem(reduced);
  const theme = SLIDE_THEME["why-now"];

  return (
    <CinematicSlide theme={theme} ariaLabel="Why now" scrim="veil">
      <SlideHeading theme={theme} eyebrow={WHY_NOW.eyebrow} size="h1" className="mb-10 max-w-3xl">
        {WHY_NOW.headline}
      </SlideHeading>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {WHY_NOW.points.map((p) => (
          <motion.div key={p.title} variants={item} className="rounded-2xl p-6" style={darkGlass()}>
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
              style={{ background: theme.accentSoft, border: `1px solid ${theme.accentBorder}` }}
            >
              <Glyph name={p.glyph} size={22} color={theme.accent} />
            </div>
            <h3 className="text-lg font-medium mb-1.5" style={{ color: INK.strong }}>
              {p.title}
            </h3>
            <p className="text-sm font-light leading-relaxed" style={{ color: INK.soft }}>
              {p.detail}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </CinematicSlide>
  );
};
