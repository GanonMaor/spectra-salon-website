import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { revealUp, fadeIn, DUR, EASE_OUT, stagger, staggerItem } from "../../SpectraInvestorExperience/visuals/demo/motion";
import { INK, darkGlass } from "../../NewNarrativeSalonAIFirst/theme";
import { GOLD } from "../copy";

const BG = "/investor-vision/hero/salon-colorists.jpg";
const SCRIM =
  "linear-gradient(110deg,rgba(8,5,3,0.94) 0%,rgba(8,5,3,0.82) 58%,rgba(8,5,3,0.32) 100%)";

const GAPS = [
  "Which specific shades were actually chosen for each client",
  "Which products were mixed together in a single formula",
  "Which products were purchased but rarely opened",
  "Which brand was selected when two were available at the bench",
];

export const DecisionGapSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const reveal = reduced ? fadeIn : revealUp;

  return (
    <section
      className="relative w-full h-full flex items-center overflow-hidden"
      style={{ background: "#0A0806" }}
      aria-label="The invisible layer"
    >
      <div
        className="absolute inset-0 z-0"
        style={{ backgroundImage: `url('${BG}')`, backgroundSize: "cover", backgroundPosition: "center 42%" }}
      />
      <div className="absolute inset-0 z-[1]" style={{ background: SCRIM }} />
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{ background: `radial-gradient(55% 60% at 14% 50%, rgba(224,153,106,0.14), transparent 68%)` }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 sm:px-12 lg:px-20 py-20">
        <motion.div
          variants={reveal}
          initial="hidden"
          animate="visible"
          transition={{ duration: DUR.fast, ease: EASE_OUT }}
          className="flex items-center gap-2 mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: GOLD }} />
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em]" style={{ color: GOLD }}>
            The Invisible Layer
          </span>
        </motion.div>

        <motion.h2
          variants={reveal}
          initial="hidden"
          animate="visible"
          transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.07 }}
          className="font-light leading-[1.06] tracking-[-0.02em] mb-12"
          style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)", color: INK.strong, maxWidth: "520px" }}
        >
          The decisions that happen inside the bowl.
        </motion.h2>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-3 max-w-[540px]"
        >
          {GAPS.map((gap) => (
            <motion.div
              key={gap}
              variants={staggerItem}
              className="flex items-center gap-4 py-4 px-5"
              style={{ ...darkGlass(false), borderRadius: "14px" }}
            >
              <span className="shrink-0 w-1 h-1 rounded-full" style={{ background: GOLD, opacity: 0.7 }} />
              <span className="text-base font-light leading-snug" style={{ color: INK.soft }}>
                {gap}
              </span>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: DUR.slow, delay: reduced ? 0 : 1.2 }}
          className="mt-10 text-sm font-light tracking-wide"
          style={{ color: "rgba(251,246,239,0.38)" }}
        >
          This is the data that sales reports, POS systems, and inventory tools cannot show.
        </motion.p>
      </div>
    </section>
  );
};
