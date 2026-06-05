import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { INV } from "../../tokens";
import { revealUp, fadeIn, stagger, pickStaggerItem, DUR, EASE_OUT } from "../../visuals/demo/motion";
import { DEMO } from "../../copy";

export const ServiceStartsSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const reveal = reduced ? fadeIn : revealUp;
  const item = pickStaggerItem(reduced);

  return (
    <section
      className="relative w-full h-full overflow-hidden flex items-center"
      style={{ background: INV.bgDeep }}
      aria-label="The Service Starts"
    >
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(100deg,rgba(18,14,11,0.90) 0%,rgba(18,14,11,0.70) 42%,rgba(18,14,11,0.28) 100%), url('/investor-vision/hero/salon-story-colorist.jpg')",
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
            {DEMO.service.eyebrow}
          </motion.div>

          <motion.h2
            variants={reveal}
            initial="hidden"
            animate="visible"
            transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.08 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-[-0.02em] mb-8"
            style={{ color: INV.textOnDark }}
          >
            {DEMO.service.headline}
          </motion.h2>

          <motion.p
            variants={reveal}
            initial="hidden"
            animate="visible"
            transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.18 }}
            className="text-2xl sm:text-3xl font-light mb-2"
            style={{ color: INV.textOnDarkSoft }}
          >
            {DEMO.service.insight}
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.28 }}
            className="text-2xl sm:text-3xl font-light"
            style={{ color: INV.gold }}
          >
            {DEMO.service.insightAccent}
          </motion.p>
        </div>

        {/* Formula data cards */}
        <motion.div
          className="grid grid-cols-2 gap-3"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {DEMO.service.items.map((item_) => (
            <motion.div
              key={item_.label}
              variants={item}
              className="rounded-2xl p-5"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)" }}
            >
              <div className="text-[11px] uppercase tracking-[0.16em] mb-1.5" style={{ color: INV.gold }}>
                {item_.label}
              </div>
              <div className="text-sm sm:text-base font-medium leading-snug" style={{ color: INV.textOnDark }}>
                {item_.value}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
