import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { INV } from "../../tokens";
import { AppointmentBuilder } from "../../visuals/demo/AppointmentBuilder";
import { revealUp, fadeIn, DUR, EASE_OUT } from "../../visuals/demo/motion";
import { DEMO } from "../../copy";

export const BuildAppointmentSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const reveal = reduced ? fadeIn : revealUp;

  return (
    <section
      className="relative w-full h-full flex items-center overflow-hidden"
      aria-label="Salon AI Builds The Appointment"
    >
      <div className="w-full max-w-6xl mx-auto px-6 sm:px-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div>
          <motion.div
            variants={reveal}
            initial="hidden"
            animate="visible"
            transition={{ duration: DUR.fast, ease: EASE_OUT }}
            className="text-[11px] font-semibold uppercase tracking-[0.28em] mb-5"
            style={{ color: INV.gold }}
          >
            {DEMO.appointment.eyebrow}
          </motion.div>

          <motion.h2
            variants={reveal}
            initial="hidden"
            animate="visible"
            transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.08 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-[-0.02em] mb-6"
            style={{ color: INV.text }}
          >
            {DEMO.appointment.headline}
          </motion.h2>

          <motion.p
            variants={reveal}
            initial="hidden"
            animate="visible"
            transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.18 }}
            className="text-lg sm:text-xl font-light max-w-lg"
            style={{ color: INV.textSecondary }}
          >
            {DEMO.appointment.insight}
          </motion.p>
        </div>

        <AppointmentBuilder
          services={DEMO.appointment.services}
          ctaLabel={DEMO.appointment.ctaLabel}
        />
      </div>
    </section>
  );
};
