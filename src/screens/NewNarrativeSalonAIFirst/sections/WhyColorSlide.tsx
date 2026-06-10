import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { stagger, pickStaggerItem, DUR, EASE_OUT } from "../../SpectraInvestorExperience/visuals/demo/motion";
import { CinematicSlide, SlideHeading } from "./CinematicSlide";
import { SLIDE_THEME, INK } from "../theme";
import { WHY_COLOR } from "../copy";

export const WhyColorSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const item = pickStaggerItem(reduced);
  const theme = SLIDE_THEME["why-color"];

  return (
    <CinematicSlide theme={theme} ariaLabel="Why we started with color" scrim="left" fit>
      <SlideHeading theme={theme} eyebrow={WHY_COLOR.eyebrow} size="h1" className="mb-10 max-w-3xl" layer={1}>
        {WHY_COLOR.headline}
      </SlideHeading>

      <div className="grid max-w-6xl grid-cols-1 gap-7 lg:grid-cols-[1fr_0.82fr] lg:items-stretch">
        <motion.div
          className="grid grid-cols-1 gap-2 rounded-[28px] p-5 lg:grid-cols-1"
          style={{
            background: "linear-gradient(135deg, rgba(10,7,5,0.62), rgba(10,7,5,0.32))",
            border: "1px solid rgba(255,255,255,0.10)",
            backdropFilter: "blur(18px) saturate(135%)",
            WebkitBackdropFilter: "blur(18px) saturate(135%)",
          }}
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {WHY_COLOR.pillars.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              variants={item}
              className="relative border-t py-4 pl-9"
              style={{ borderColor: i === 2 ? theme.accentBorder : "rgba(156,190,208,0.26)" }}
            >
              <span
                className="absolute left-0 top-5 h-2 w-2 rounded-full"
                style={{ background: theme.accent, boxShadow: `0 0 16px ${theme.glow}` }}
              />
              <span
                className="absolute left-3 top-6 h-px w-5"
                style={{ background: `linear-gradient(90deg, ${theme.accentBorder}, transparent)` }}
              />
              <div className="mb-2 flex items-center gap-3">
                <span className="text-[10px] font-semibold tabular-nums" style={{ color: theme.accent }}>
                  0{i + 1}
                </span>
                <h3 className="text-lg font-light" style={{ color: INK.strong }}>
                  {pillar.title}
                </h3>
              </div>
              <p className="text-sm font-light leading-relaxed" style={{ color: "rgba(251,246,239,0.88)" }}>
                {pillar.detail}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={item}
          initial="hidden"
          animate="visible"
          className="relative min-h-[430px] overflow-visible pl-6 lg:min-h-full"
          style={{
            borderLeft: `1px solid ${theme.accentBorder}`,
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(65% 55% at 62% 38%, rgba(224,153,106,0.24), transparent 70%)",
            }}
          />

          <div className="relative flex h-full flex-col justify-between">
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em]" style={{ color: theme.accent }}>
                From color bar to data layer
              </p>
              <h3 className="max-w-sm text-2xl font-light leading-tight tracking-[-0.03em]" style={{ color: INK.strong }}>
                The first workflow where waste becomes measurable.
              </h3>
            </div>

            <div className="relative mt-7 flex flex-1 items-center justify-center">
              <img
                src="/investor-vision/salon-ai-live-demo/colorbar-ipad-composition.png"
                alt="Spectra color bar system"
                className="relative z-10 w-[92%] max-w-[430px] select-none"
                draggable={false}
                style={{
                  filter:
                    "drop-shadow(0 30px 62px rgba(0,0,0,0.70)) drop-shadow(0 0 40px rgba(224,153,106,0.22))",
                }}
              />
            </div>

            <div className="mt-5 flex items-center gap-3">
              <span className="h-px w-8 shrink-0" style={{ background: theme.accentBorder }} />
              <p className="text-xs font-light leading-5" style={{ color: INK.faint }}>
                The same layer becomes the proof engine on the next slide.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.6 }}
        className="mt-8 max-w-2xl text-xl font-light sm:text-2xl"
        style={{ color: theme.accent }}
      >
        {WHY_COLOR.closing}
      </motion.p>
    </CinematicSlide>
  );
};
