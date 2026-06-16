import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { DUR, EASE_OUT, stagger, staggerItem, fadeIn } from "../../SpectraInvestorExperience/visuals/demo/motion";
import { INK } from "../../NewNarrativeSalonAIFirst/theme";
import { GOLD } from "../copy";

const CANVAS = "#0D0A08";
const CARD = "rgba(255,255,255,0.055)";
const CARD_BORDER = "1px solid rgba(255,255,255,0.09)";
const CARD_BLUR = "blur(24px) saturate(140%)";

interface Shade {
  code: string;
  family: string;
  color: string;
  usagePct: number;
}

const TOP_SHADES: Shade[] = [
  { code: "7.3",   family: "Golden Blonde",         color: "#C9A553", usagePct: 100 },
  { code: "8.1",   family: "Light Ash Blonde",      color: "#C4B69A", usagePct: 87  },
  { code: "9.0",   family: "Very Light Blonde",     color: "#E0D2A6", usagePct: 76  },
  { code: "7.43",  family: "Copper Golden Blonde",  color: "#C27C38", usagePct: 68  },
  { code: "10.01", family: "Platinum Blonde",       color: "#F0EDD6", usagePct: 57  },
  { code: "5.0",   family: "Light Brown",           color: "#7A5636", usagePct: 52  },
  { code: "6.1",   family: "Dark Ash Blonde",       color: "#9C8270", usagePct: 46  },
  { code: "8.43",  family: "Copper Blonde",         color: "#D49250", usagePct: 41  },
];

const FAMILY_SPLIT = [
  { label: "Blonde",   pct: 54, color: "#D9B981" },
  { label: "Brown",    pct: 28, color: "#8A6248" },
  { label: "Copper",   pct: 11, color: "#C27C38" },
  { label: "Deep",     pct:  7, color: "#3E2A1E" },
];

export const ShadeDemandSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;

  return (
    <section
      className="relative w-full h-full flex flex-col justify-center overflow-hidden"
      style={{ background: CANVAS }}
      aria-label="Shade Demand Map"
    >
      {/* ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(55% 55% at 20% 40%, rgba(217,185,129,0.09), transparent 68%), radial-gradient(40% 40% at 80% 70%, rgba(194,124,56,0.06), transparent 60%)",
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 sm:px-12 lg:px-20 py-14">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DUR.fast, ease: EASE_OUT }}
          className="flex items-center justify-between mb-10"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: GOLD }} />
              <span className="text-[11px] font-semibold uppercase tracking-[0.3em]" style={{ color: GOLD }}>
                What the industry cannot see · 01
              </span>
            </div>
            <h2
              className="font-light leading-[1.05] tracking-[-0.02em]"
              style={{ fontSize: "clamp(2rem, 4.5vw, 3.4rem)", color: INK.strong }}
            >
              Shade Demand Map
            </h2>
          </div>

          {/* Family split pills */}
          <div className="hidden lg:flex gap-2">
            {FAMILY_SPLIT.map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                style={{ background: CARD, border: CARD_BORDER, backdropFilter: CARD_BLUR }}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: f.color }} />
                <span style={{ color: INK.soft }}>{f.label}</span>
                <span style={{ color: GOLD }}>{f.pct}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Shades grid */}
        <motion.div
          variants={reduced ? undefined : stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3"
        >
          {TOP_SHADES.map((shade, i) => (
            <motion.div
              key={shade.code}
              variants={reduced ? undefined : staggerItem}
              transition={{ delay: i * 0.06 }}
              className="flex flex-col rounded-2xl overflow-hidden"
              style={{ background: CARD, border: CARD_BORDER, backdropFilter: CARD_BLUR }}
            >
              {/* Shade color swatch */}
              <div
                className="w-full"
                style={{ height: "72px", background: shade.color }}
              />
              {/* Info */}
              <div className="p-3 flex flex-col gap-1.5">
                <span className="text-sm font-semibold" style={{ color: INK.strong }}>
                  {shade.code}
                </span>
                <span className="text-[11px] font-light leading-tight" style={{ color: INK.faint }}>
                  {shade.family}
                </span>
                {/* Usage bar */}
                <div className="mt-2">
                  <div
                    className="h-0.5 rounded-full"
                    style={{ background: "rgba(255,255,255,0.10)", overflow: "hidden" }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${shade.usagePct}%` }}
                      transition={{ duration: DUR.slow, ease: EASE_OUT, delay: 0.3 + i * 0.06 }}
                      className="h-full rounded-full"
                      style={{ background: GOLD }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: DUR.slow, delay: reduced ? 0 : 1.0 }}
          className="mt-8 text-sm font-light"
          style={{ color: "rgba(251,246,239,0.35)" }}
        >
          Based on real formula data collected across active salons. Shade order reflects actual usage frequency, not sales volume.
        </motion.p>
      </div>
    </section>
  );
};
