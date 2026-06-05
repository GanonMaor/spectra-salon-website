import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { INV } from "../../tokens";
import { DemoPhone } from "../../visuals/demo/DemoPhone";
import { revealUp, fadeIn, DUR, EASE_OUT } from "../../visuals/demo/motion";
import { DEMO } from "../../copy";

export const CustomerMessageSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const reveal = reduced ? fadeIn : revealUp;

  return (
    <section
      className="relative w-full h-full overflow-hidden flex items-center"
      style={{ background: INV.bgDeep }}
      aria-label="A Customer Sends A Message"
    >
      {/* Background */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(90deg,rgba(18,14,11,0.92) 0%,rgba(18,14,11,0.76) 44%,rgba(18,14,11,0.38) 100%), url('/investor-vision/hero/salon-story.jpg')",
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
            {DEMO.message.eyebrow}
          </motion.div>

          <motion.h2
            variants={reveal}
            initial="hidden"
            animate="visible"
            transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.08 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-[-0.02em] mb-8"
            style={{ color: INV.textOnDark }}
          >
            {DEMO.message.headline}
          </motion.h2>

          <motion.p
            variants={reveal}
            initial="hidden"
            animate="visible"
            transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.18 }}
            className="text-lg sm:text-xl font-light mb-2"
            style={{ color: INV.textOnDarkSoft }}
          >
            {DEMO.message.insight}
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.3 }}
            className="text-xl sm:text-2xl font-light"
            style={{ color: INV.gold }}
          >
            {DEMO.message.insightAccent}
          </motion.p>
        </div>

        <div className="flex justify-center lg:justify-end">
          <DemoPhone
            recipientName={DEMO.message.clientName}
            messageLines={[DEMO.message.messageText]}
            dark
          />
        </div>
      </div>
    </section>
  );
};
