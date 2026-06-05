import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { stagger, pickStaggerItem, DUR, EASE_OUT } from "../../SpectraInvestorExperience/visuals/demo/motion";
import { CinematicSlide, SlideHeading } from "./CinematicSlide";
import { SLIDE_THEME, INK, darkGlass } from "../theme";
import { RAISE } from "../copy";

export const WhyRaiseSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const item = pickStaggerItem(reduced);
  const theme = SLIDE_THEME["why-raise"];

  return (
    <CinematicSlide theme={theme} ariaLabel="Why raise now" scrim="veil" constellation>
      <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-10 items-center">
        {/* Left — the ask */}
        <div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: DUR.fast, ease: EASE_OUT }}
            className="flex items-center gap-2 mb-5"
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: theme.accent }} />
            <span className="text-[11px] font-semibold uppercase tracking-[0.26em]" style={{ color: theme.accent }}>
              {RAISE.eyebrow}
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: DUR.slow, ease: EASE_OUT, delay: reduced ? 0 : 0.1 }}
          >
            <div className="text-6xl sm:text-7xl lg:text-8xl font-light tracking-[-0.03em]" style={{ color: theme.accent, textShadow: "0 2px 30px rgba(0,0,0,0.5)" }}>
              {RAISE.amount}
            </div>
            <div className="text-lg font-light mt-1" style={{ color: INK.soft }}>
              {RAISE.amountSub}
            </div>
          </motion.div>

          <motion.div className="flex flex-wrap gap-2 mt-6" variants={stagger} initial="hidden" animate="visible">
            {RAISE.focus.map((f) => (
              <motion.span
                key={f}
                variants={item}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium"
                style={{ background: theme.accentSoft, color: theme.accent, border: `1px solid ${theme.accentBorder}` }}
              >
                {f}
              </motion.span>
            ))}
          </motion.div>
        </div>

        {/* Right — alignment */}
        <div>
          <SlideHeading theme={theme} eyebrow="The Alignment" size="h2" className="mb-6">
            {RAISE.headline}
          </SlideHeading>

          <motion.div className="space-y-3" variants={stagger} initial="hidden" animate="visible">
            {RAISE.points.map((p) => (
              <motion.div key={p.title} variants={item} className="rounded-2xl px-5 py-4 flex items-center gap-4" style={darkGlass()}>
                <span className="text-base font-medium w-20 shrink-0" style={{ color: INK.strong }}>
                  {p.title}
                </span>
                <span className="text-sm font-light flex-1" style={{ color: INK.soft }}>
                  {p.detail}
                </span>
                <span
                  className="text-[10px] font-semibold uppercase tracking-[0.12em] px-3 py-1 rounded-full shrink-0"
                  style={{ background: theme.accentSoft, color: theme.accent, border: `1px solid ${theme.accentBorder}` }}
                >
                  {p.status}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </CinematicSlide>
  );
};
