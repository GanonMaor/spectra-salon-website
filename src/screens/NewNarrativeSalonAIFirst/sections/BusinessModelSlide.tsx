import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { stagger, pickStaggerItem, DUR, EASE_OUT } from "../../SpectraInvestorExperience/visuals/demo/motion";
import { CinematicSlide, SlideHeading } from "./CinematicSlide";
import { ArpuStackChart } from "../visuals/ArpuStackChart";
import { SLIDE_THEME, INK, darkGlass } from "../theme";
import { MODEL } from "../copy";

export const BusinessModelSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const item = pickStaggerItem(reduced);
  const theme = SLIDE_THEME["business-model"];

  return (
    <CinematicSlide theme={theme} ariaLabel="The business model evolution" scrim="left" constellation={false}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div>
          <SlideHeading theme={theme} eyebrow={MODEL.eyebrow} size="h1" className="mb-5">
            {MODEL.headline}
          </SlideHeading>

          <motion.div className="space-y-2 mb-6" variants={stagger} initial="hidden" animate="visible">
            {MODEL.engines.map((e) => (
              <motion.div key={e} variants={item} className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: theme.accent }} />
                <span className="text-base font-light" style={{ color: INK.soft }}>
                  {e}
                </span>
              </motion.div>
            ))}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.5 }}
            className="text-lg font-light max-w-md"
            style={{ color: INK.strong }}
          >
            {MODEL.closing}
          </motion.p>
        </div>

        {/* Cumulative ARPU stack — each layer adds on top of the previous */}
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
            <span className="shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-full" style={{ color: theme.accent, background: theme.accentSoft, border: `1px solid ${theme.accentBorder}` }}>
              6× expansion
            </span>
          </div>
          <ArpuStackChart />
        </motion.div>
      </div>
    </CinematicSlide>
  );
};
