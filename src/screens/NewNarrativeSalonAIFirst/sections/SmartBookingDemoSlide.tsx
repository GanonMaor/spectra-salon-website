import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { stagger, pickStaggerItem, DUR, EASE_OUT } from "../../SpectraInvestorExperience/visuals/demo/motion";
import { CinematicSlide, SlideHeading } from "./CinematicSlide";
import { SLIDE_THEME, INK, darkGlass, amorphicCard } from "../theme";

const SIGNALS = ["Wait Times", "Processing Windows", "Staff Allocation", "Resource Planning", "Capacity Optimization"];

const APPOINTMENTS = [
  { client: "Adele", service: "Highlights", start: 12, height: 30, accent: "#D9B981" },
  { client: "Maya", service: "Color", start: 6, height: 22, accent: "#A6C0A0" },
  { client: "Lily", service: "Treatment", start: 38, height: 18, accent: "#C6A8CE" },
  { client: "Noa", service: "Finish", start: 64, height: 20, accent: "#9CBED0" },
];

export const SmartBookingDemoSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const item = pickStaggerItem(reduced);
  const theme = SLIDE_THEME["booking-intelligence"];

  return (
    <CinematicSlide theme={theme} ariaLabel="Smart Booking Demo" scrim="split-right" constellation={false}>
      <div className="grid grid-cols-1 lg:grid-cols-[0.78fr_1.22fr] gap-10 items-center">
        <div>
          <SlideHeading theme={theme} eyebrow="Smart Booking Demo" size="h1" className="mb-6" layer={2}>
            The system does not schedule appointments. It manages capacity.
          </SlideHeading>
          <motion.div className="flex flex-wrap gap-2" variants={stagger} initial="hidden" animate="visible">
            {SIGNALS.map((signal) => (
              <motion.span key={signal} variants={item} className="rounded-full px-3.5 py-1.5 text-xs font-medium" style={{ color: theme.accent, background: theme.accentSoft, border: `1px solid ${theme.accentBorder}` }}>
                {signal}
              </motion.span>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DUR.slow, ease: EASE_OUT, delay: reduced ? 0 : 0.16 }}
          className="p-5"
          style={amorphicCard(theme.accentBorder)}
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: theme.accent }}>
              AI Capacity Calendar
            </span>
            <span className="text-xs font-light" style={{ color: INK.faint }}>
              live service windows
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {["Adele", "Maya", "Lily", "Noa"].map((staff, index) => (
              <div key={staff} className="relative h-[330px] rounded-2xl p-2" style={darkGlass()}>
                <div className="mb-2 text-center text-xs font-medium" style={{ color: INK.strong }}>
                  {staff}
                </div>
                <div className="absolute left-2 right-2 top-11 bottom-2 rounded-xl" style={{ background: "rgba(255,255,255,0.035)" }}>
                  <div className="absolute left-0 right-0 top-[42%] h-px" style={{ background: "rgba(217,185,129,0.42)" }} />
                  <div className="absolute left-0 right-0 top-[58%] h-[46px] border border-dashed rounded-lg" style={{ borderColor: `${theme.accent}66`, background: theme.accentSoft }} />
                  {APPOINTMENTS.filter((_, i) => i === index || (index === 0 && i === 2)).map((appt) => (
                    <div
                      key={`${staff}-${appt.client}-${appt.service}`}
                      className="absolute left-2 right-2 rounded-lg px-2 py-1"
                      style={{
                        top: `${appt.start}%`,
                        height: `${appt.height}%`,
                        background: `${appt.accent}24`,
                        borderLeft: `3px solid ${appt.accent}`,
                      }}
                    >
                      <div className="text-xs font-medium" style={{ color: INK.strong }}>
                        {appt.service}
                      </div>
                      <div className="text-[10px] font-light" style={{ color: INK.faint }}>
                        {appt.client}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </CinematicSlide>
  );
};
