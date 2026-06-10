import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { DUR, EASE_OUT } from "../../SpectraInvestorExperience/visuals/demo/motion";
import { CinematicSlide, SlideHeading } from "./CinematicSlide";
import { SLIDE_THEME, INK } from "../theme";
import { BOOKING_INTELLIGENCE } from "../copy";
import {
  BrowserFrame,
  CalendarGrid,
  LiveClientsVertical,
} from "./liveDemoDraft/BookingSchedulingIntelligenceDraftSlide";

export const BookingIntelligenceSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const theme = SLIDE_THEME["booking-intelligence"];

  return (
    <CinematicSlide theme={theme} ariaLabel="Booking Intelligence maps the full color service" scrim="veil" constellation={false} fit>
      <div className="grid h-full w-full grid-cols-1 items-center gap-8 lg:-mx-8 lg:grid-cols-[minmax(360px,0.58fr)_1.42fr] lg:items-center lg:gap-10 xl:-mx-12">

        {/* ── Left: narrative column ─────────────────────────────────────── */}
        <div className="relative max-w-[430px]">
          <div
            className="absolute -inset-x-7 -inset-y-6 rounded-[2rem] pointer-events-none"
            style={{
              background: "linear-gradient(90deg, rgba(8,5,3,0.56) 0%, rgba(8,5,3,0.36) 58%, rgba(8,5,3,0) 100%)",
              filter: "blur(2px)",
            }}
          />
          <div className="relative">
          <SlideHeading theme={theme} eyebrow={BOOKING_INTELLIGENCE.eyebrow} size="h1" className="mb-6" layer={2}>
            The booking is only the first signal.
          </SlideHeading>
          <motion.p
            initial={{ opacity: 0, y: reduced ? 0 : 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DUR.fast, ease: EASE_OUT, delay: reduced ? 0 : 0.1 }}
            className="text-lg font-light leading-relaxed sm:text-xl"
            style={{ color: INK.strong, textShadow: "0 2px 24px rgba(0,0,0,0.78)" }}
          >
            A client books a full color journey. Salon AI follows every step from highlights and mixing to processing and checkout, tying each moment to the layer that knows the truth.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.6 }}
            className="mt-8 text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ color: theme.accent, textShadow: "0 2px 18px rgba(0,0,0,0.74)" }}
          >
            {BOOKING_INTELLIGENCE.closing}
          </motion.p>
          </div>
        </div>

        {/* ── Right: calendar + live clients visual ─────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: reduced ? 0 : 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: reduced ? 0 : 0.14 }}
          className="relative hidden lg:block lg:-translate-y-4"
          style={{ height: "clamp(500px, 62vh, 660px)" }}
        >
          {/* Calendar browser — full column width */}
          <div
            className="absolute inset-0 overflow-hidden rounded-2xl"
            style={{ zIndex: 1 }}
          >
            <BrowserFrame>
              <CalendarGrid />
            </BrowserFrame>
          </div>

          {/* Live clients panel — floats over the right quarter, scaled down */}
          <div
            className="absolute right-0 top-1/2"
            style={{
              transform: "translateY(-50%) scale(0.82)",
              transformOrigin: "right center",
              zIndex: 3,
            }}
          >
            <LiveClientsVertical />
          </div>
        </motion.div>

      </div>
    </CinematicSlide>
  );
};
