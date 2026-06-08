import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { stagger, pickStaggerItem, DUR, EASE_OUT } from "../../SpectraInvestorExperience/visuals/demo/motion";
import { CinematicSlide, SlideHeading } from "./CinematicSlide";
import { SLIDE_THEME, INK, darkGlass, amorphicCard } from "../theme";
import { BOOKING_INTELLIGENCE } from "../copy";

export const BookingIntelligenceSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const item = pickStaggerItem(reduced);
  const theme = SLIDE_THEME["booking-intelligence"];

  return (
    <CinematicSlide theme={theme} ariaLabel="Booking Intelligence" scrim="veil" constellation={false}>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-10 items-start">

        {/* Left — narrative */}
        <div>
          <SlideHeading theme={theme} eyebrow={BOOKING_INTELLIGENCE.eyebrow} size="h1" className="mb-6" layer={2}>
            {BOOKING_INTELLIGENCE.headline}
          </SlideHeading>

          <motion.div className="space-y-4 mb-7" variants={stagger} initial="hidden" animate="visible">
            {[BOOKING_INTELLIGENCE.problem, BOOKING_INTELLIGENCE.solution].map((line) => (
              <motion.p key={line} variants={item} className="text-base sm:text-lg font-light leading-relaxed max-w-lg" style={{ color: INK.soft }}>
                {line}
              </motion.p>
            ))}
          </motion.div>

          {/* "From cost room to calendar" connector */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.5 }}
            className="inline-flex items-center gap-3 rounded-2xl px-5 py-3"
            style={darkGlass(true)}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: theme.accent }}>
              Cost Optimization
            </span>
            <svg width="20" height="8" viewBox="0 0 20 8" fill="none">
              <path d="M0 4h18M14 1l4 3-4 3" stroke={theme.accent} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: INK.strong }}>
              Intelligent Booking
            </span>
          </motion.div>
        </div>

        {/* Right — service cycle visual */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DUR.slow, ease: EASE_OUT, delay: reduced ? 0 : 0.14 }}
          style={amorphicCard(theme.accentBorder)}
          className="p-5 sm:p-7"
        >
          <div className="mb-5 flex items-center justify-between gap-4">
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: theme.accent }}>
              Service Cycle Timeline
            </span>
            <span
              className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: theme.accent, background: theme.accentSoft, border: `1px solid ${theme.accentBorder}` }}
            >
              Client-specific timing
            </span>
          </div>

          <div className="relative pl-2">
            {/* Vertical connector rail */}
            <div
              className="absolute left-[19px] top-3 bottom-3 w-px"
              style={{ background: `linear-gradient(180deg, ${theme.accent}90, ${theme.accent}20)` }}
            />
            <motion.div className="space-y-3" variants={stagger} initial="hidden" animate="visible">
              {BOOKING_INTELLIGENCE.cycle.map((entry, i) => (
                <motion.div
                  key={entry.step}
                  variants={item}
                  className="relative flex items-center gap-4 rounded-2xl px-4 py-3"
                  style={darkGlass(i === 1 || i === 2)}
                >
                  <span
                    className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums"
                    style={{ color: "#0F0B09", background: theme.accent }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1">
                    <div className="text-base font-medium" style={{ color: INK.strong }}>
                      {entry.step}
                    </div>
                    <div className="text-xs font-light" style={{ color: INK.faint }}>
                      {entry.note}
                    </div>
                  </div>
                  {(i === 1 || i === 2) && (
                    <span
                      className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em]"
                      style={{ color: theme.accent, background: theme.accentSoft, border: `1px solid ${theme.accentBorder}` }}
                    >
                      key window
                    </span>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.8 }}
            className="mt-5 text-sm font-light text-center"
            style={{ color: theme.accent }}
          >
            {BOOKING_INTELLIGENCE.closing}
          </motion.p>
        </motion.div>
      </div>
    </CinematicSlide>
  );
};
