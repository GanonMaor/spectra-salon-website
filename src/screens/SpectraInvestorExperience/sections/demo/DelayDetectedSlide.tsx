import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { INV } from "../../tokens";
import { revealUp, fadeIn, DUR, EASE_OUT } from "../../visuals/demo/motion";
import { DEMO } from "../../copy";

export const DelayDetectedSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const reveal = reduced ? fadeIn : revealUp;

  return (
    <section
      className="relative w-full h-full overflow-hidden flex items-center"
      style={{ background: INV.bgDeep }}
      aria-label="Salon AI Detects A Delay"
    >
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(100deg,rgba(18,14,11,0.88) 0%,rgba(18,14,11,0.65) 44%,rgba(18,14,11,0.30) 100%), url('/investor-vision/hero/salon-story-delay.jpg')",
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 sm:px-12 lg:px-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <motion.div
            variants={reveal}
            initial="hidden"
            animate="visible"
            transition={{ duration: DUR.fast, ease: EASE_OUT }}
            className="text-[11px] font-semibold uppercase tracking-[0.28em] mb-6"
            style={{ color: INV.gold }}
          >
            {DEMO.delay.eyebrow}
          </motion.div>

          <motion.h2
            variants={reveal}
            initial="hidden"
            animate="visible"
            transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.08 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-[-0.02em] mb-8"
            style={{ color: INV.textOnDark }}
          >
            {DEMO.delay.headline}
          </motion.h2>

          <motion.p
            variants={reveal}
            initial="hidden"
            animate="visible"
            transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.18 }}
            className="text-xl sm:text-2xl font-light"
            style={{ color: INV.gold }}
          >
            {DEMO.delay.insight}
          </motion.p>
        </div>

        {/* Alert card */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.38 }}
          className="rounded-2xl overflow-hidden max-w-sm"
          style={{ background: "rgba(28,22,18,0.82)", border: "1px solid rgba(255,255,255,0.16)", backdropFilter: "blur(24px)" }}
        >
          <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.10)" }}>
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: "#EF8836", boxShadow: "0 0 8px #EF8836" }}
              />
              <span className="text-sm font-semibold" style={{ color: INV.textOnDark }}>
                {DEMO.delay.alertTitle}
              </span>
              <span className="ml-auto text-[10px]" style={{ color: INV.textOnDarkSoft }}>Just now</span>
            </div>
          </div>
          <div className="px-5 py-4">
            <p className="text-sm font-light leading-relaxed" style={{ color: INV.textOnDarkSoft }}>
              {DEMO.delay.alertBody}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
