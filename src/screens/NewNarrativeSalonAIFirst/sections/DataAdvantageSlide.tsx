import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Glyph } from "../../SpectraInvestorExperience/visuals/Glyph";
import { stagger, pickStaggerItem, DUR, EASE_OUT } from "../../SpectraInvestorExperience/visuals/demo/motion";
import { CinematicSlide, SlideHeading } from "./CinematicSlide";
import { SLIDE_THEME, INK, darkGlass } from "../theme";
import { DATA_ADVANTAGE } from "../copy";

export const DataAdvantageSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const item = pickStaggerItem(reduced);
  const theme = SLIDE_THEME["data-advantage"];

  return (
    <CinematicSlide theme={theme} ariaLabel="The data advantage" scrim="veil">
      <SlideHeading theme={theme} eyebrow={DATA_ADVANTAGE.eyebrow} size="h2" className="mb-10 max-w-3xl" layer={1}>
        {DATA_ADVANTAGE.headline}
      </SlideHeading>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {DATA_ADVANTAGE.categories.map((c) => (
          <motion.div key={c.label} variants={item} className="rounded-2xl p-5 flex flex-col gap-3" style={darkGlass()}>
            {/* Icon + label row */}
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: theme.accentSoft, border: `1px solid ${theme.accentBorder}` }}
              >
                <Glyph name={c.glyph} size={20} color={theme.accent} />
              </div>
              <div>
                <h3 className="text-base font-medium mb-0.5" style={{ color: INK.strong }}>
                  {c.label}
                </h3>
                <p className="text-sm font-light leading-snug" style={{ color: INK.soft }}>
                  {c.detail}
                </p>
              </div>
            </div>
            {/* Live data stat */}
            {"stat" in c && (
              <div
                className="rounded-lg px-3 py-1.5 text-xs font-medium tracking-wide"
                style={{
                  background: theme.accentSoft,
                  borderTop: `1px solid ${theme.accentBorder}`,
                  color: theme.accent,
                }}
              >
                {(c as typeof c & { stat: string }).stat}
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.7 }}
        className="flex flex-wrap items-center gap-x-8 gap-y-3"
      >
        {DATA_ADVANTAGE.stats.map((s) => (
          <div key={s.label} className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-light" style={{ color: theme.accent }}>
              {s.value}
            </span>
            <span className="text-sm font-light" style={{ color: INK.soft }}>
              {s.label}
            </span>
          </div>
        ))}
        <span className="text-sm font-light ml-auto" style={{ color: INK.soft }}>
          {DATA_ADVANTAGE.closing}
        </span>
      </motion.div>
    </CinematicSlide>
  );
};
