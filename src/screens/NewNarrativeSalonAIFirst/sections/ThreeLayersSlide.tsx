import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { stagger, pickStaggerItem, DUR, EASE_OUT } from "../../SpectraInvestorExperience/visuals/demo/motion";
import { CinematicSlide, SlideHeading } from "./CinematicSlide";
import { SLIDE_THEME, INK, darkGlass, amorphicCard } from "../theme";
import { THREE_LAYERS } from "../copy";

const STATUS_COLOR: Record<string, string> = {
  "Live & Growing": "#A6C0A0",
  "Built — Testing": "#D9B981",
  "September 2026": "#C6A8CE",
  "January 2027": "#E0996A",
  Production: "#A6C0A0",
  Pilot: "#D9B981",
  "Launching 2026": "#C6A8CE",
  Built: "#D9B981",
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

      <motion.div className="space-y-3 max-w-5xl" variants={stagger} initial="hidden" animate="visible">
        {THREE_LAYERS.layers.map((layer, i) => (
          <motion.div
            key={layer.num}
            variants={item}
            className="rounded-2xl px-6 py-4 flex flex-col gap-3"
            style={{ ...(i >= 2 ? amorphicCard(theme.accentBorder) : darkGlass()), marginLeft: `${i * 3}%` }}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-6">
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
                className="text-[10px] font-semibold uppercase tracking-[0.12em] px-3 py-1 rounded-full self-start shrink-0"
                style={{ color: STATUS_COLOR[layer.status] ?? INK.faint, border: `1px solid ${theme.accentBorder}` }}
              >
                {layer.status}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 sm:pl-[18rem]">
              {layer.milestones.map((milestone) => (
                <span
                  key={milestone}
                  className="rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em]"
                  style={{ color: theme.accent, background: theme.accentSoft, border: `1px solid ${theme.accentBorder}` }}
                >
                  {milestone}
                </span>
              ))}
            </div>
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
