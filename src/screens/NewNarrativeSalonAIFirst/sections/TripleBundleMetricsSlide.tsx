import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { stagger, pickStaggerItem, revealUp, fadeIn, DUR, EASE_OUT } from "../../SpectraInvestorExperience/visuals/demo/motion";
import { CinematicSlide, SlideHeading } from "./CinematicSlide";
import { LayerBadge } from "../visuals/LayerBadge";
import { SLIDE_THEME, INK, darkGlass } from "../theme";
import { TRIPLE_BUNDLE } from "../copy";

export const TripleBundleMetricsSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const reveal = reduced ? fadeIn : revealUp;
  const item = pickStaggerItem(reduced);
  const theme = SLIDE_THEME["triple-bundle"];

  return (
    <CinematicSlide theme={theme} ariaLabel="Sales and unit economics" scrim="split-right" constellation={false}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

        {/* Left column — headline + SaaS KPIs + closing */}
        <div>
          <motion.div
            variants={reveal}
            initial="hidden"
            animate="visible"
            transition={{ duration: DUR.fast, ease: EASE_OUT }}
            className="mb-3"
          >
            <LayerBadge layer={1} />
          </motion.div>

          <SlideHeading theme={theme} eyebrow={TRIPLE_BUNDLE.eyebrow} size="h2" className="mb-6">
            {TRIPLE_BUNDLE.headline}
          </SlideHeading>

          {/* SaaS KPIs */}
          <motion.div className="grid grid-cols-2 gap-2.5 mb-6" variants={stagger} initial="hidden" animate="visible">
            {TRIPLE_BUNDLE.saas.map((kpi) => (
              <motion.div key={kpi.label} variants={item} className="rounded-xl px-4 py-3" style={darkGlass()}>
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

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.55 }}
            className="text-sm font-light max-w-sm"
            style={{ color: INK.soft }}
          >
            {TRIPLE_BUNDLE.closing}
          </motion.p>
        </div>

        {/* Right column — Triple Bundle offer + funnel */}
        <div className="flex flex-col gap-4">

          {/* Bundle offer */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DUR.slow, ease: EASE_OUT, delay: reduced ? 0 : 0.15 }}
            className="rounded-2xl p-5"
            style={darkGlass(true)}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: theme.accent }} />
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.24em]"
                style={{ color: theme.accent }}
              >
                {TRIPLE_BUNDLE.offerEyebrow}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {TRIPLE_BUNDLE.offer.map((o) => (
                <div key={o.title} className="rounded-xl px-3 py-3 text-center" style={darkGlass()}>
                  <div className="text-xs font-semibold mb-1" style={{ color: INK.strong }}>
                    {o.title}
                  </div>
                  <div className="text-[10px] font-light" style={{ color: INK.faint }}>
                    {o.detail}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Funnel */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DUR.slow, ease: EASE_OUT, delay: reduced ? 0 : 0.28 }}
            className="rounded-2xl p-5"
            style={darkGlass(true)}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: theme.accent }} />
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.24em]"
                style={{ color: theme.accent }}
              >
                {TRIPLE_BUNDLE.funnelEyebrow}
              </span>
            </div>
            <div className="flex items-stretch gap-1.5">
              {TRIPLE_BUNDLE.funnel.map((step, idx) => {
                const widths = ["flex-[3]", "flex-[2.5]", "flex-[2]"];
                return (
                  <React.Fragment key={step.step}>
                    <div
                      className={`${widths[idx] ?? "flex-1"} rounded-xl px-3 py-3`}
                      style={darkGlass()}
                    >
                      <div
                        className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-2"
                        style={{ color: INK.faint }}
                      >
                        {step.step}
                      </div>
                      <div className="text-xl font-light leading-none mb-1" style={{ color: theme.accent }}>
                        {step.n}
                      </div>
                      <div
                        className="inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full mb-2"
                        style={{
                          color: theme.accent,
                          background: theme.accentSoft,
                          border: `1px solid ${theme.accentBorder}`,
                        }}
                      >
                        {step.conv}
                      </div>
                      <div className="text-[10px] font-light" style={{ color: INK.faint }}>
                        {step.cpa}
                      </div>
                    </div>
                    {idx < TRIPLE_BUNDLE.funnel.length - 1 && (
                      <div className="flex items-center self-center">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5h6M6 2l3 3-3 3" stroke={theme.accent} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </motion.div>

        </div>
      </div>
    </CinematicSlide>
  );
};
