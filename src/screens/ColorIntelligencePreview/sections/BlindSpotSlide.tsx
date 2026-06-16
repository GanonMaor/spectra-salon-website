import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { revealUp, fadeIn, DUR, EASE_OUT } from "../../SpectraInvestorExperience/visuals/demo/motion";
import { INK } from "../../NewNarrativeSalonAIFirst/theme";
import { GOLD } from "../copy";

const BG = "/investor-vision/hero/salon-color-room.jpg";
const SCRIM =
  "linear-gradient(110deg,rgba(10,7,5,0.94) 0%,rgba(10,7,5,0.72) 52%,rgba(10,7,5,0.22) 100%)";

export const BlindSpotSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const reveal = reduced ? fadeIn : revealUp;

  return (
    <section
      className="relative w-full h-full flex items-center overflow-hidden"
      style={{ background: "#0A0806" }}
      aria-label="Industry blind spot"
    >
      <div
        className="absolute inset-0 z-0"
        style={{ backgroundImage: `url('${BG}')`, backgroundSize: "cover", backgroundPosition: "center 35%" }}
      />
      <div className="absolute inset-0 z-[1]" style={{ background: SCRIM }} />
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{ background: `radial-gradient(60% 70% at 14% 54%, rgba(217,185,129,0.18), transparent 70%)` }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 sm:px-12 lg:px-20 py-20">
        <motion.div
          variants={reveal}
          initial="hidden"
          animate="visible"
          transition={{ duration: DUR.fast, ease: EASE_OUT }}
          className="flex items-center gap-2 mb-10"
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: GOLD }} />
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.3em]"
            style={{ color: GOLD }}
          >
            Color Intelligence Preview
          </span>
        </motion.div>

        <div className="max-w-[640px]">
          <motion.h1
            variants={reveal}
            initial="hidden"
            animate="visible"
            transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.07 }}
            className="font-light leading-[1.02] tracking-[-0.025em] mb-8"
            style={{ fontSize: "clamp(2.8rem, 7vw, 5.2rem)", color: INK.strong }}
          >
            Color manufacturers know what they sold.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DUR.slow, ease: EASE_OUT, delay: reduced ? 0 : 0.52 }}
            className="text-lg sm:text-xl font-light leading-[1.7]"
            style={{ color: "rgba(251,246,239,0.68)", maxWidth: "500px" }}
          >
            But they have very limited visibility into what stylists actually choose, mix, and use during a service.
          </motion.p>
        </div>
      </div>
    </section>
  );
};
