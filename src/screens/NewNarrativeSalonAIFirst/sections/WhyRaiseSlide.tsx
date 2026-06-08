import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { stagger, pickStaggerItem, DUR, EASE_OUT } from "../../SpectraInvestorExperience/visuals/demo/motion";
import { CinematicSlide, SlideHeading } from "./CinematicSlide";
import { SLIDE_THEME, INK, darkGlass, amorphicCard } from "../theme";
import { RAISE } from "../copy";

export const WhyRaiseSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const item = pickStaggerItem(reduced);
  const theme = SLIDE_THEME["why-raise"];

  return (
    <CinematicSlide theme={theme} ariaLabel="Path to Series A" scrim="veil" constellation>
      <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-10 items-start">

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
            className="mb-5"
          >
            <div
              className="text-6xl sm:text-7xl font-light tracking-[-0.03em]"
              style={{ color: theme.accent, textShadow: "0 2px 30px rgba(0,0,0,0.5)" }}
            >
              {RAISE.amount}
            </div>
            <div className="text-base font-light mt-1" style={{ color: INK.soft }}>
              {RAISE.amountSub}
            </div>
          </motion.div>

          {/* Roadmap steps */}
          <motion.div
            className="rounded-2xl p-4 mb-5"
            variants={stagger}
            initial="hidden"
            animate="visible"
            style={darkGlass(true)}
          >
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: theme.accent }}>
              Roadmap To Series A
            </div>
            <div className="relative pl-2">
              <div
                className="absolute left-[13px] top-4 bottom-4 w-px"
                style={{ background: `linear-gradient(180deg, ${theme.accent}80, transparent)` }}
              />
              <div className="space-y-2">
                {RAISE.roadmap.map((step, i) => (
                  <motion.div key={step} variants={item} className="flex items-center gap-3">
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold tabular-nums"
                      style={{ color: "#0F0B09", background: i === RAISE.roadmap.length - 1 ? theme.accent : theme.accentSoft, border: `1px solid ${theme.accentBorder}` }}
                    >
                      {i + 1}
                    </span>
                    <span
                      className="text-sm font-light"
                      style={{ color: i === RAISE.roadmap.length - 1 ? theme.accent : INK.soft }}
                    >
                      {step}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Focus chips */}
          <motion.div className="flex flex-wrap gap-2" variants={stagger} initial="hidden" animate="visible">
            {RAISE.focus.map((f) => (
              <motion.span
                key={f}
                variants={item}
                className="px-3 py-1 rounded-full text-[11px] font-medium"
                style={{ background: theme.accentSoft, color: theme.accent, border: `1px solid ${theme.accentBorder}` }}
              >
                {f}
              </motion.span>
            ))}
          </motion.div>
        </div>

        {/* Right — alignment + growth callout */}
        <div>
          <SlideHeading theme={theme} eyebrow="The Alignment" size="h2" className="mb-5">
            {RAISE.headline}
          </SlideHeading>

          <motion.div className="space-y-3 mb-6" variants={stagger} initial="hidden" animate="visible">
            {RAISE.points.map((p) => (
              <motion.div
                key={p.title}
                variants={item}
                className="rounded-2xl px-5 py-4 flex items-center gap-4"
                style={darkGlass()}
              >
                <span className="text-sm font-medium w-16 shrink-0" style={{ color: INK.strong }}>
                  {p.title}
                </span>
                <span className="text-sm font-light flex-1" style={{ color: INK.soft }}>
                  {p.detail}
                </span>
                <span
                  className="text-[10px] font-semibold uppercase tracking-[0.1em] px-3 py-1 rounded-full shrink-0"
                  style={{ background: theme.accentSoft, color: theme.accent, border: `1px solid ${theme.accentBorder}` }}
                >
                  {p.status}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* Growth / bootstrap note */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.58 }}
            className="p-5"
            style={amorphicCard(theme.accentBorder)}
          >
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: theme.accent }}>
              Growth Flexibility
            </div>
            <p className="text-sm font-light leading-relaxed" style={{ color: INK.soft }}>
              {RAISE.growthNote}
            </p>
          </motion.div>
        </div>
      </div>
    </CinematicSlide>
  );
};
