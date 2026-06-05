import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { INV } from "../../tokens";
import { DemoPhone } from "../../visuals/demo/DemoPhone";
import { revealUp, fadeIn, DUR, EASE_OUT } from "../../visuals/demo/motion";
import { DEMO } from "../../copy";

export const ClientUpdatedSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const reveal = reduced ? fadeIn : revealUp;

  return (
    <section
      className="relative w-full h-full flex items-center overflow-hidden"
      aria-label="Salon AI Updates The Client"
    >
      <div className="w-full max-w-6xl mx-auto px-6 sm:px-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <motion.div
            variants={reveal}
            initial="hidden"
            animate="visible"
            transition={{ duration: DUR.fast, ease: EASE_OUT }}
            className="text-[11px] font-semibold uppercase tracking-[0.28em] mb-5"
            style={{ color: INV.gold }}
          >
            {DEMO.notify.eyebrow}
          </motion.div>

          <motion.h2
            variants={reveal}
            initial="hidden"
            animate="visible"
            transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.08 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-[-0.02em] mb-6"
            style={{ color: INV.text }}
          >
            {DEMO.notify.headline}
          </motion.h2>

          <div className="flex flex-wrap gap-2 mb-6">
            {DEMO.notify.tags.map((tag, i) => (
              <motion.span
                key={tag}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: EASE_OUT, delay: reduced ? 0 : 0.22 + i * 0.08 }}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium"
                style={{
                  background: INV.goldSoft,
                  border: `1px solid ${INV.borderSoft}`,
                  color: INV.gold,
                }}
              >
                {tag}
              </motion.span>
            ))}
          </div>

          <motion.p
            variants={reveal}
            initial="hidden"
            animate="visible"
            transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.36 }}
            className="text-lg sm:text-xl font-light max-w-lg"
            style={{ color: INV.textSecondary }}
          >
            {DEMO.notify.insight}
          </motion.p>
        </div>

        <div className="flex justify-center lg:justify-end">
          <DemoPhone
            recipientName={DEMO.notify.recipientName}
            messageLines={DEMO.notify.messageLines}
            dark={false}
          />
        </div>
      </div>
    </section>
  );
};
