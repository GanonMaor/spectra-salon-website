import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { stagger, pickStaggerItem, revealUp, fadeIn, DUR, EASE_OUT } from "../../SpectraInvestorExperience/visuals/demo/motion";
import { CinematicSlide } from "./CinematicSlide";
import { CustomerVideoRail } from "../visuals/CustomerVideoRail";
import { LayerBadge } from "../visuals/LayerBadge";
import { SLIDE_THEME, INK, darkGlass } from "../theme";
import { LAYER1 } from "../copy";

export const Layer1ProvenSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const reveal = reduced ? fadeIn : revealUp;
  const item = pickStaggerItem(reduced);
  const theme = SLIDE_THEME["layer-1"];

  return (
    <CinematicSlide theme={theme} ariaLabel="Layer 1 — already running" scrim="veil" constellation={false} fit>
      {/* Layer locator */}
      <motion.div
        variants={reveal}
        initial="hidden"
        animate="visible"
        transition={{ duration: DUR.fast, ease: EASE_OUT }}
        className="mb-3"
      >
        <LayerBadge layer={1} />
      </motion.div>

      {/* Heading (compact) */}
      <motion.div
        variants={reveal}
        initial="hidden"
        animate="visible"
        transition={{ duration: DUR.fast, ease: EASE_OUT, delay: reduced ? 0 : 0.05 }}
        className="flex items-center gap-2 mb-3"
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: theme.accent }} />
        <span className="text-[11px] font-semibold uppercase tracking-[0.26em]" style={{ color: theme.accent }}>
          {LAYER1.eyebrow}
        </span>
      </motion.div>
      <motion.h2
        variants={reveal}
        initial="hidden"
        animate="visible"
        transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.08 }}
        className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-[-0.02em] mb-4 max-w-3xl"
        style={{ color: INK.strong, textShadow: "0 2px 24px rgba(0,0,0,0.5)" }}
      >
        {LAYER1.headline}
      </motion.h2>

      {/* KPIs (compact) */}
      <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-3" variants={stagger} initial="hidden" animate="visible">
        {LAYER1.kpis.map((kpi) => (
          <motion.div key={kpi.label} variants={item} className="rounded-xl px-4 py-2.5" style={darkGlass()}>
            <div className="text-2xl sm:text-3xl font-light leading-none mb-1" style={{ color: theme.accent }}>
              {kpi.value}
            </div>
            <div className="text-xs font-medium" style={{ color: INK.strong }}>
              {kpi.label}
            </div>
            <div className="text-[10px] font-light mt-0.5" style={{ color: INK.faint }}>
              {kpi.note}
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-3" variants={stagger} initial="hidden" animate="visible">
        {LAYER1.dataKpis.map((kpi) => (
          <motion.div key={kpi.label} variants={item} className="rounded-xl px-4 py-2.5" style={darkGlass()}>
            <div className="text-2xl sm:text-3xl font-light leading-none mb-1" style={{ color: theme.accent }}>
              {kpi.value}
            </div>
            <div className="text-xs font-medium" style={{ color: INK.strong }}>
              {kpi.label}
            </div>
            <div className="text-[10px] font-light mt-0.5" style={{ color: INK.faint }}>
              {kpi.note}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Customer proof label + regions in one compact row */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.26em]" style={{ color: theme.accent }}>
          {LAYER1.videoEyebrow}
        </span>
        <span className="text-xs font-light" style={{ color: INK.faint }}>
          {LAYER1.regions.join(" · ")}
        </span>
      </div>

      {/* Horizontal customer reel rail — fills remaining height */}
      <CustomerVideoRail accent={theme.accent} />
    </CinematicSlide>
  );
};
