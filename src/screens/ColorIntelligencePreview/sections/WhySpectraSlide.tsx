import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { DUR, EASE_OUT, stagger, staggerItem, fadeIn } from "../../SpectraInvestorExperience/visuals/demo/motion";
import { INK, darkGlass } from "../../NewNarrativeSalonAIFirst/theme";
import { GOLD } from "../copy";

const BG = "/investor-vision/hero/salon-color-station.jpg";
const SCRIM =
  "linear-gradient(110deg,rgba(8,5,3,0.95) 0%,rgba(8,5,3,0.84) 55%,rgba(8,5,3,0.38) 100%)";

const FLOW_STEPS = [
  { step: "Scan",    sub: "Stylist scans the product" },
  { step: "Weigh",   sub: "Scale records the amount" },
  { step: "Formula", sub: "Formula is captured" },
  { step: "Service", sub: "Service is completed" },
  { step: "Insight", sub: "Intelligence is created" },
];

const REASONS = [
  "We sit inside the Color Bar, not outside it",
  "Stylists scan and weigh as part of the service — no manual reporting",
  "Traditional software captures transactions. Spectra captures decisions.",
];

export const WhySpectraSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const reveal = reduced ? fadeIn : undefined;

  return (
    <section
      className="relative w-full h-full flex items-center overflow-hidden"
      style={{ background: "#0A0806" }}
      aria-label="Why only Spectra"
    >
      <div
        className="absolute inset-0 z-0"
        style={{ backgroundImage: `url('${BG}')`, backgroundSize: "cover", backgroundPosition: "center 45%" }}
      />
      <div className="absolute inset-0 z-[1]" style={{ background: SCRIM }} />
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{ background: `radial-gradient(55% 60% at 12% 52%, rgba(217,185,129,0.16), transparent 68%)` }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 sm:px-12 lg:px-20 py-20">
        <div className="max-w-[720px]">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DUR.fast, ease: EASE_OUT }}
            className="flex items-center gap-2 mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: GOLD }} />
            <span className="text-[11px] font-semibold uppercase tracking-[0.3em]" style={{ color: GOLD }}>
              Why Only Spectra
            </span>
          </motion.div>

          {/* Main message */}
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.08 }}
            className="font-light leading-[1.04] tracking-[-0.025em] mb-3"
            style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)", color: INK.strong }}
          >
            Spectra captures decisions,
          </motion.h2>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.14 }}
            className="font-light leading-[1.04] tracking-[-0.025em] mb-10"
            style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)", color: INK.soft }}
          >
            not transactions.
          </motion.h2>

          {/* Flow strip */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.26 }}
            className="flex items-center gap-1 mb-10 flex-wrap"
          >
            {FLOW_STEPS.map((s, i) => (
              <React.Fragment key={s.step}>
                <div
                  className="flex flex-col items-center px-3 py-2.5 rounded-xl"
                  style={{ ...darkGlass(false), borderRadius: "12px", minWidth: "80px" }}
                >
                  <span className="text-sm font-semibold" style={{ color: GOLD }}>
                    {s.step}
                  </span>
                  <span className="text-[10px] font-light mt-0.5 text-center leading-tight" style={{ color: "rgba(251,246,239,0.48)" }}>
                    {s.sub}
                  </span>
                </div>
                {i < FLOW_STEPS.length - 1 && (
                  <span className="text-base" style={{ color: "rgba(255,255,255,0.18)" }}>→</span>
                )}
              </React.Fragment>
            ))}
          </motion.div>

          {/* Reasons */}
          <motion.div
            variants={reduced ? undefined : stagger}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-3 mb-10"
          >
            {REASONS.map((reason) => (
              <motion.div
                key={reason}
                variants={reduced ? undefined : staggerItem}
                className="flex items-center gap-3"
              >
                <span className="w-1 h-1 rounded-full shrink-0" style={{ background: GOLD, opacity: 0.6 }} />
                <span className="text-base font-light" style={{ color: INK.soft }}>
                  {reason}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* Closing line */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: DUR.slow, delay: reduced ? 0 : 1.1 }}
            className="text-base font-light italic leading-relaxed"
            style={{ color: "rgba(251,246,239,0.52)", maxWidth: "520px" }}
          >
            We sit inside the Color Bar, at the exact moment where professional color choices are made.
          </motion.p>

          {/* Competitor footnote */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: DUR.slow, delay: reduced ? 0 : 1.4 }}
            className="mt-8 text-xs font-light"
            style={{ color: "rgba(251,246,239,0.22)" }}
          >
            Vish and SalonScale focus primarily on color cost, inventory, and formula tracking. Neither system is built around the full salon workflow.
          </motion.p>
        </div>
      </div>
    </section>
  );
};
