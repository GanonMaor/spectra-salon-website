import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { INV } from "../../tokens";
import { DemoSalonSystem } from "../../visuals/demo/DemoSalonSystem";
import { revealUp, fadeIn, DUR, EASE_OUT } from "../../visuals/demo/motion";
import { DEMO } from "../../copy";

export const OneSalonOneSystemSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const reveal = reduced ? fadeIn : revealUp;

  return (
    <section
      className="relative w-full h-full flex items-center overflow-hidden"
      aria-label="One Salon. One System."
    >
      <div className="w-full max-w-6xl mx-auto px-6 sm:px-10">
        <motion.div
          variants={reveal}
          initial="hidden"
          animate="visible"
          transition={{ duration: DUR.fast, ease: EASE_OUT }}
          className="text-[11px] font-semibold uppercase tracking-[0.28em] mb-4"
          style={{ color: INV.gold }}
        >
          {DEMO.system.eyebrow}
        </motion.div>

        <motion.h2
          variants={reveal}
          initial="hidden"
          animate="visible"
          transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.08 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-[-0.02em] mb-10 max-w-2xl"
          style={{ color: INV.text }}
        >
          {DEMO.system.headline}
        </motion.h2>

        <DemoSalonSystem
          before={DEMO.system.before}
          after={DEMO.system.after}
          center={DEMO.system.center}
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 1.1 }}
          className="mt-10 text-xl sm:text-2xl font-light max-w-2xl"
          style={{ color: INV.gold }}
        >
          {DEMO.system.insight}
        </motion.p>
      </div>
    </section>
  );
};
