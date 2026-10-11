import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { stagger, pickStaggerItem, DUR, EASE_OUT } from "../../SpectraInvestorExperience/visuals/demo/motion";
import { CinematicSlide, SlideHeading } from "./CinematicSlide";
import { SLIDE_THEME, INK, darkGlass } from "../theme";
import { DATA_MOAT } from "../copy";
import { BRAND_SAMPLE } from "../../SpectraProductVision/dataMoat";

const REPORT_BARS = BRAND_SAMPLE.slice(0, 6);

export const DataMoatSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const item = pickStaggerItem(reduced);
  const theme = SLIDE_THEME["data-moat"];

  return (
    <CinematicSlide
      theme={theme}
      ariaLabel="What Salon AI knows that no booking system can know"
      scrim="veil"
      constellation={false}
      darkOverlay
      fit
    >
      <div className="grid h-full w-full grid-cols-1 items-center gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-10">
        <div className="min-w-0">
          <SlideHeading theme={theme} eyebrow={DATA_MOAT.eyebrow} size="h2" className="mb-4 max-w-xl" layer={1}>
            {DATA_MOAT.headline}
          </SlideHeading>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.12 }}
            className="mb-6 max-w-xl text-base font-light leading-relaxed sm:text-lg"
            style={{ color: INK.soft }}
          >
            {DATA_MOAT.body}
          </motion.p>

          <motion.div
            className="grid grid-cols-1 gap-2 sm:grid-cols-2"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            {DATA_MOAT.insights.map((insight) => (
              <motion.div
                key={insight.title}
                variants={item}
                className="rounded-2xl px-4 py-3"
                style={darkGlass()}
              >
                <p className="text-[14px] font-medium leading-snug" style={{ color: INK.strong }}>
                  {insight.title}
                </p>
                <p className="mt-1 text-[13px] font-light leading-snug" style={{ color: INK.faint }}>
                  {insight.detail}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: reduced ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DUR.slow, ease: EASE_OUT, delay: reduced ? 0 : 0.14 }}
          className="flex min-h-0 flex-col rounded-[28px] p-5 lg:p-6"
          style={{
            background: "rgba(16,11,8,0.92)",
            border: `1px solid ${theme.accentBorder}`,
            boxShadow: "0 28px 80px rgba(0,0,0,0.36), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: theme.accent }}>
            {DATA_MOAT.reportEyebrow}
          </p>
          <h3 className="mb-5 text-xl font-light tracking-[-0.02em] sm:text-2xl" style={{ color: INK.strong }}>
            {DATA_MOAT.reportHeadline}
          </h3>

          <div className="mb-5">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: INK.faint }}>
              Brand share by actual consumption
            </p>
            <div className="space-y-2">
              {REPORT_BARS.map((brand) => (
                <div key={brand.name} className="flex items-center gap-3">
                  <span className="w-[108px] shrink-0 truncate text-[12px] font-medium" style={{ color: INK.soft }}>
                    {brand.name}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.round(brand.share * 100)}%`,
                        background: `linear-gradient(90deg, ${theme.accent}, ${theme.accentDeep})`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] font-light" style={{ color: INK.faint }}>
              Brand count is measured. Distribution shape is from observed consumption.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {DATA_MOAT.reportMetrics.slice(1, 4).map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl px-3 py-3"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div className="text-lg font-light tracking-tight" style={{ color: theme.accent }}>
                  {metric.value}
                </div>
                <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: INK.strong }}>
                  {metric.label}
                </div>
                <div className="mt-1 text-[11px] font-light leading-snug" style={{ color: INK.faint }}>
                  {metric.note}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {DATA_MOAT.reportMetrics.slice(4).map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl px-3 py-3"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div className="text-[12px] font-semibold" style={{ color: INK.strong }}>{metric.label}</div>
                <div className="mt-1 text-[12px] font-light" style={{ color: INK.faint }}>
                  {metric.value} · {metric.note}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-4 text-[13px] font-light leading-relaxed" style={{ color: theme.accent }}>
            {DATA_MOAT.closing}
          </p>
        </motion.div>
      </div>
    </CinematicSlide>
  );
};
