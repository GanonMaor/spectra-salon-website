import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { DUR, EASE_OUT } from "../../SpectraInvestorExperience/visuals/demo/motion";
import { CinematicSlide, SlideHeading } from "./CinematicSlide";
import { SLIDE_THEME, INK, amorphicCard } from "../theme";
import { BACK_ROOM } from "../copy";

export const BackRoomFrontDeskSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const theme = SLIDE_THEME["back-room-front-desk"];
  const example = BACK_ROOM.example;

  return (
    <CinematicSlide theme={theme} ariaLabel="Capacity, not clock time" scrim="left" constellation={false} fit>
      <SlideHeading theme={theme} eyebrow={BACK_ROOM.eyebrow} size="h1" className="mb-5 max-w-4xl" layer={2}>
        {BACK_ROOM.headline}
      </SlideHeading>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.12 }}
        className="mb-7 max-w-2xl text-lg font-light leading-relaxed sm:text-xl"
        style={{ color: INK.soft }}
      >
        {BACK_ROOM.body}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: reduced ? 0 : 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.18 }}
        className="mb-6 max-w-5xl rounded-[28px] p-5 sm:p-6"
        style={amorphicCard(theme.accentBorder)}
      >
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: theme.accent }}>
              {example.service}
            </p>
            <p className="mt-1 text-sm font-light" style={{ color: INK.faint }}>{example.clock}</p>
          </div>
          <p className="text-sm font-medium" style={{ color: theme.accent }}>{example.capacity}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {example.steps.map((step) => (
            <div
              key={step.label}
              className="rounded-2xl px-4 py-3"
              style={{
                background: step.consumes ? "rgba(166,192,160,0.14)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${step.consumes ? "rgba(166,192,160,0.40)" : "rgba(255,255,255,0.10)"}`,
              }}
            >
              <div className="text-[15px] font-light" style={{ color: INK.strong }}>{step.time}</div>
              <div className="mt-1 text-[12px] font-medium" style={{ color: INK.soft }}>{step.label}</div>
              <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: step.consumes ? "#A6C0A0" : INK.faint }}>
                {step.consumes ? "Stylist time" : "Free capacity"}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.4 }}
        className="text-2xl font-light sm:text-3xl"
        style={{ color: theme.accent }}
      >
        {BACK_ROOM.closing}
      </motion.p>
    </CinematicSlide>
  );
};
