import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Glyph } from "../../SpectraInvestorExperience/visuals/Glyph";
import { stagger, pickStaggerItem, DUR, EASE_OUT } from "../../SpectraInvestorExperience/visuals/demo/motion";
import { CinematicSlide, SlideHeading } from "./CinematicSlide";
import { SLIDE_THEME, INK, darkGlass, amorphicCard } from "../theme";
import { WHY_AI } from "../copy";

export const WhyAIWorksSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const item = pickStaggerItem(reduced);
  const theme = SLIDE_THEME["why-ai"];

  return (
    <CinematicSlide theme={theme} ariaLabel="Traditional AI vs Salon AI" scrim="veil">
      <SlideHeading theme={theme} eyebrow={WHY_AI.eyebrow} size="h1" className="mb-7 max-w-3xl" layer={3}>
        {WHY_AI.headline}
      </SlideHeading>

      {/* Comparison — Traditional vs Salon AI */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6 max-w-3xl"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={item} className="rounded-2xl p-5" style={darkGlass()}>
          <div className="mb-4 flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: INK.faint }}>
              Traditional AI
            </span>
          </div>
          <div className="space-y-2">
            {WHY_AI.traditional.map((line) => (
              <div key={line} className="flex items-start gap-2">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-white/20 shrink-0" />
                <span className="text-sm font-light" style={{ color: INK.soft }}>
                  {line}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={item} className="p-5" style={amorphicCard(theme.accentBorder)}>
          <div className="mb-4 flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: theme.accent }}>
              Salon AI
            </span>
          </div>
          <div className="space-y-2">
            {WHY_AI.salonAi.map((line) => (
              <div key={line} className="flex items-start gap-2">
                <span
                  className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: theme.accent, boxShadow: `0 0 6px ${theme.glow}` }}
                />
                <span className="text-sm font-medium" style={{ color: INK.strong }}>
                  {line}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Agent example pillars */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-7 max-w-4xl"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {WHY_AI.pillars.map((p, i) => (
          <motion.div key={p.title} variants={item} className="rounded-2xl p-5 flex items-start gap-4" style={darkGlass()}>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: theme.accentSoft, border: `1px solid ${theme.accentBorder}` }}
            >
              <Glyph name={p.glyph} size={20} color={theme.accent} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] tabular-nums" style={{ color: INK.faint }}>0{i + 1}</span>
                <h3 className="text-base font-medium" style={{ color: INK.strong }}>{p.title}</h3>
              </div>
              <p className="text-sm font-light leading-relaxed" style={{ color: INK.soft }}>{p.detail}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.7 }}
        className="text-2xl sm:text-3xl font-light"
        style={{ color: theme.accent }}
      >
        {WHY_AI.closing}
      </motion.p>
    </CinematicSlide>
  );
};
