import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { INV } from "../../tokens";
import { IntelligenceStream } from "../../visuals/demo/IntelligenceStream";
import { revealUp, fadeIn, DUR, EASE_OUT } from "../../visuals/demo/motion";
import { DEMO } from "../../copy";

export const ServiceCreatesIntelligenceSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const reveal = reduced ? fadeIn : revealUp;

  return (
    <section
      className="relative w-full h-full flex items-center overflow-hidden"
      style={{ background: INV.bgDeep }}
      aria-label="Every Service Creates Intelligence"
    >
      <div className="w-full max-w-5xl mx-auto px-6 sm:px-10">
        <motion.div
          variants={reveal}
          initial="hidden"
          animate="visible"
          transition={{ duration: DUR.fast, ease: EASE_OUT }}
          className="text-[11px] font-semibold uppercase tracking-[0.28em] mb-5"
          style={{ color: INV.gold }}
        >
          {DEMO.intelligence.eyebrow}
        </motion.div>

        <motion.h2
          variants={reveal}
          initial="hidden"
          animate="visible"
          transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.08 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-[-0.02em] mb-8 max-w-2xl"
          style={{ color: INV.textOnDark }}
        >
          {DEMO.intelligence.headline}
        </motion.h2>

        <IntelligenceStream signals={DEMO.intelligence.signals} dark />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 1.0 }}
          className="mt-10 flex flex-col sm:flex-row sm:items-center gap-4"
        >
          <div>
            <p className="text-xl sm:text-2xl font-light" style={{ color: INV.gold }}>
              {DEMO.intelligence.insight}
            </p>
            <p className="text-base sm:text-lg font-light mt-2 max-w-2xl" style={{ color: INV.textOnDarkSoft }}>
              {DEMO.intelligence.bridge}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
