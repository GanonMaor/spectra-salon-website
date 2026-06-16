import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { DUR, EASE_OUT, stagger, staggerItem, fadeIn } from "../../SpectraInvestorExperience/visuals/demo/motion";
import { INK } from "../../NewNarrativeSalonAIFirst/theme";
import { GOLD } from "../copy";

const CANVAS = "#0D0A08";
const CARD = "rgba(255,255,255,0.055)";
const CARD_BORDER = "1px solid rgba(255,255,255,0.09)";
const CARD_BLUR = "blur(24px) saturate(140%)";

const UP_COLOR = "#8EC99A";
const DOWN_COLOR = "#E09090";

interface BrandRow {
  name: string;
  category: string;
  change: number;
  note: string;
}

const BRANDS: BrandRow[] = [
  { name: "L'Oréal Professionnel", category: "Gaining",  change: +4.2, note: "Driven by new shade range adoption" },
  { name: "Wella Professionals",   category: "Losing",   change: -2.8, note: "Displacement in multi-brand formulas" },
  { name: "Schwarzkopf Prof.",     category: "Gaining",  change: +1.1, note: "Growing in toner-heavy services" },
  { name: "Goldwell",              category: "Losing",   change: -3.4, note: "Lowest repeat use in color bar scans" },
  { name: "Revlon Professional",   category: "Gaining",  change: +0.9, note: "Steady growth in independent salons" },
];

export const BrandShiftSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;

  return (
    <section
      className="relative w-full h-full flex flex-col justify-center overflow-hidden"
      style={{ background: CANVAS }}
      aria-label="Brand Usage Shift"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(50% 55% at 75% 35%, rgba(142,201,154,0.07), transparent 65%), radial-gradient(40% 45% at 20% 70%, rgba(224,144,144,0.05), transparent 58%)",
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 sm:px-12 lg:px-20 py-14">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DUR.fast, ease: EASE_OUT }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: GOLD }} />
            <span className="text-[11px] font-semibold uppercase tracking-[0.3em]" style={{ color: GOLD }}>
              What the industry cannot see · 03
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <h2
              className="font-light leading-[1.05] tracking-[-0.02em]"
              style={{ fontSize: "clamp(2rem, 4.5vw, 3.4rem)", color: INK.strong }}
            >
              Brand Usage Shift
            </h2>
            <span className="text-sm font-light" style={{ color: "rgba(251,246,239,0.38)" }}>
              12-month real usage trend
            </span>
          </div>
        </motion.div>

        {/* Brand rows */}
        <motion.div
          variants={reduced ? undefined : stagger}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-3"
        >
          {BRANDS.map((brand) => {
            const isUp = brand.change > 0;
            const changeColor = isUp ? UP_COLOR : DOWN_COLOR;
            const barWidth = Math.abs(brand.change) / 5 * 100;

            return (
              <motion.div
                key={brand.name}
                variants={reduced ? undefined : staggerItem}
                className="flex items-center gap-4 px-5 py-4 rounded-2xl"
                style={{ background: CARD, border: CARD_BORDER, backdropFilter: CARD_BLUR }}
              >
                {/* Brand name + note */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-base font-light truncate" style={{ color: INK.strong }}>
                      {brand.name}
                    </span>
                    <span
                      className="shrink-0 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full"
                      style={{
                        background: isUp ? "rgba(142,201,154,0.12)" : "rgba(224,144,144,0.10)",
                        color: changeColor,
                      }}
                    >
                      {brand.category}
                    </span>
                  </div>
                  <span className="text-xs font-light" style={{ color: "rgba(251,246,239,0.38)" }}>
                    {brand.note}
                  </span>
                </div>

                {/* Delta bar + number */}
                <div className="flex items-center gap-3 shrink-0">
                  <div
                    className="relative h-1 rounded-full overflow-hidden"
                    style={{ width: "80px", background: "rgba(255,255,255,0.07)" }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${barWidth}%` }}
                      transition={{ duration: DUR.slow, ease: EASE_OUT, delay: 0.4 }}
                      className="absolute top-0 left-0 h-full rounded-full"
                      style={{ background: changeColor }}
                    />
                  </div>
                  <span className="text-base font-semibold tabular-nums" style={{ color: changeColor, minWidth: "48px", textAlign: "right" }}>
                    {isUp ? "+" : ""}{brand.change}%
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: DUR.slow, delay: reduced ? 0 : 1.1 }}
          className="mt-8 text-sm font-light"
          style={{ color: "rgba(251,246,239,0.35)" }}
        >
          This is actual professional use — not purchase data, distribution data, or sell-in volume.
        </motion.p>
      </div>
    </section>
  );
};
