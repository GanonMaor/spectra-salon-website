import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { stagger, pickStaggerItem, DUR, EASE_OUT } from "../../SpectraInvestorExperience/visuals/demo/motion";
import { CinematicSlide, SlideHeading } from "./CinematicSlide";
import { ArpuStackChart } from "../visuals/ArpuStackChart";
import { SLIDE_THEME, INK, darkGlass, amorphicCard } from "../theme";
import { MODEL } from "../copy";

export const BusinessModelSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const item = pickStaggerItem(reduced);
  const theme = SLIDE_THEME["business-model"];

  return (
    <CinematicSlide theme={theme} ariaLabel="The business model evolution" scrim="left" constellation={false}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

        {/* Left — text content */}
        <div>
          <SlideHeading theme={theme} eyebrow={MODEL.eyebrow} size="h1" className="mb-5">
            {MODEL.headline}
          </SlideHeading>

          {/* Revenue phase table */}
          <motion.div
            className="mb-5 rounded-2xl p-4"
            variants={stagger}
            initial="hidden"
            animate="visible"
            style={darkGlass(true)}
          >
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: theme.accent }}>
              Revenue Expansion Strategy
            </div>
            <div className="space-y-2">
              {MODEL.phases.map((phase) => (
                <motion.div
                  key={phase.phase}
                  variants={item}
                  className="grid grid-cols-[76px_1fr_80px] gap-2 rounded-xl px-3 py-2 items-center"
                  style={darkGlass()}
                >
                  <span className="text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: theme.accent }}>
                    {phase.phase}
                  </span>
                  <span className="text-sm font-light" style={{ color: INK.soft }}>
                    {phase.product}
                  </span>
                  <span className="text-[11px] font-semibold text-right" style={{ color: INK.strong }}>
                    {phase.arpu}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Revenue streams */}
          <motion.div className="space-y-1.5 mb-5" variants={stagger} initial="hidden" animate="visible">
            {MODEL.engines.map((e) => (
              <motion.div key={e} variants={item} className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: theme.accent }} />
                <span className="text-sm font-light" style={{ color: INK.soft }}>{e}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Growth strategy callout */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.52 }}
            className="p-4"
            style={amorphicCard(theme.accentBorder)}
          >
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: theme.accent }}>
              Growth Strategy
            </div>
            <p className="text-sm font-light leading-relaxed" style={{ color: INK.soft }}>
              {MODEL.growthNote}
            </p>
          </motion.div>
        </div>

        {/* Right — ARPU chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DUR.slow, ease: EASE_OUT, delay: reduced ? 0 : 0.25 }}
          className="rounded-3xl p-6 sm:p-8"
          style={darkGlass(true)}
        >
          <div className="flex items-center justify-between mb-8">
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: theme.accent }}>
              Annual Revenue Per Salon
            </span>
            <span
              className="shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-full"
              style={{ color: theme.accent, background: theme.accentSoft, border: `1px solid ${theme.accentBorder}` }}
            >
              6× expansion
            </span>
          </div>
          <ArpuStackChart />
        </motion.div>
      </div>
    </CinematicSlide>
  );
};
