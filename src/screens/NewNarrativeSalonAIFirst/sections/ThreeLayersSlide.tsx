import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { stagger, pickStaggerItem, DUR, EASE_OUT } from "../../SpectraInvestorExperience/visuals/demo/motion";
import { CinematicSlide, SlideHeading } from "./CinematicSlide";
import { SLIDE_THEME, INK, darkGlass } from "../theme";
import { THREE_LAYERS } from "../copy";

const STATUS_COLOR: Record<string, string> = {
  Production: "#A6C0A0",
  Pilot: "#D9B981",
  Next: "rgba(251,246,239,0.6)",
};

export const ThreeLayersSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const item = pickStaggerItem(reduced);
  const theme = SLIDE_THEME["three-layers"];

  return (
    <CinematicSlide theme={theme} ariaLabel="One platform. Three layers." scrim="veil">
      <SlideHeading theme={theme} eyebrow={THREE_LAYERS.eyebrow} size="h1" className="mb-8 max-w-3xl">
        {THREE_LAYERS.headline}
      </SlideHeading>

      <motion.div className="space-y-3 max-w-4xl" variants={stagger} initial="hidden" animate="visible">
        {THREE_LAYERS.layers.map((layer, i) => (
          <motion.div
            key={layer.num}
            variants={item}
            className="rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6"
            style={{ ...darkGlass(i === 2), marginLeft: `${i * 4}%` }}
          >
            <div className="flex items-center gap-4 shrink-0 sm:w-72">
              <span className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: theme.accent }}>
                {layer.num}
              </span>
              <span className="text-lg sm:text-xl font-medium" style={{ color: INK.strong }}>
                {layer.title}
              </span>
            </div>
            <p className="text-sm font-light flex-1" style={{ color: INK.soft }}>
              {layer.detail}
            </p>
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.12em] px-3 py-1 rounded-full self-start sm:self-center shrink-0"
              style={{ color: STATUS_COLOR[layer.status] ?? INK.faint, border: `1px solid ${theme.accentBorder}` }}
            >
              {layer.status}
            </span>
          </motion.div>
        ))}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.7 }}
        className="mt-8 text-2xl sm:text-3xl font-light"
        style={{ color: theme.accent }}
      >
        {THREE_LAYERS.closing}
      </motion.p>
    </CinematicSlide>
  );
};
