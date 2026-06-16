import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { DUR, EASE_OUT, fadeIn } from "../../SpectraInvestorExperience/visuals/demo/motion";
import { INK } from "../../NewNarrativeSalonAIFirst/theme";
import { GOLD } from "../copy";

const CANVAS = "#0D0A08";
const CARD = "rgba(255,255,255,0.055)";
const CARD_BORDER = "1px solid rgba(255,255,255,0.09)";
const CARD_BLUR = "blur(24px) saturate(140%)";

interface BrandNode {
  name: string;
  short: string;
  color: string;
  x: number;
  y: number;
}

const BRANDS: BrandNode[] = [
  { name: "L'Oréal Professionnel", short: "LOr",  color: "#E8D18A", x: 50, y: 20 },
  { name: "Wella Professionals",   short: "WEL",  color: "#E87878", x: 18, y: 64 },
  { name: "Schwarzkopf",           short: "SKP",  color: "#8AB4E8", x: 82, y: 64 },
  { name: "Goldwell",              short: "GLD",  color: "#E8A87A", x: 50, y: 82 },
];

interface MixPair {
  from: string;
  to: string;
  pct: number;
  label: string;
}

const PAIRS: MixPair[] = [
  { from: "LOr", to: "WEL",  pct: 41, label: "L'Oréal + Wella" },
  { from: "LOr", to: "SKP",  pct: 29, label: "L'Oréal + Schwarzkopf" },
  { from: "WEL", to: "SKP",  pct: 18, label: "Wella + Schwarzkopf" },
  { from: "LOr", to: "GLD",  pct: 12, label: "Other combinations" },
];

export const FormulaMixingSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;

  return (
    <section
      className="relative w-full h-full flex flex-col justify-center overflow-hidden"
      style={{ background: CANVAS }}
      aria-label="Formula Mixing Network"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(50% 50% at 65% 50%, rgba(138,180,232,0.07), transparent 65%), radial-gradient(40% 40% at 25% 60%, rgba(232,161,122,0.06), transparent 60%)",
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
              What the industry cannot see · 02
            </span>
          </div>
          <h2
            className="font-light leading-[1.05] tracking-[-0.02em]"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3.4rem)", color: INK.strong }}
          >
            Formula Mixing Network
          </h2>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Hero stat */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: DUR.enter, ease: EASE_OUT, delay: 0.12 }}
            className="shrink-0 flex flex-col items-center justify-center rounded-3xl px-12 py-10"
            style={{ background: CARD, border: CARD_BORDER, backdropFilter: CARD_BLUR, minWidth: "220px" }}
          >
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DUR.enter, ease: EASE_OUT, delay: 0.3 }}
              className="font-light tabular-nums"
              style={{ fontSize: "4.5rem", color: GOLD, lineHeight: 1 }}
            >
              27%
            </motion.span>
            <span className="text-sm font-light text-center mt-3 leading-snug" style={{ color: INK.soft }}>
              of all formulas combine products from more than one brand
            </span>
          </motion.div>

          {/* Network diagram and pairs */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Network visual */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: DUR.slow, delay: 0.2 }}
              className="rounded-2xl overflow-hidden"
              style={{ background: CARD, border: CARD_BORDER, backdropFilter: CARD_BLUR }}
            >
              <div className="relative" style={{ height: "160px" }}>
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 160" preserveAspectRatio="xMidYMid meet">
                  {/* Edges */}
                  <line x1="200" y1="30" x2="72"  y2="104" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                  <line x1="200" y1="30" x2="328" y2="104" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                  <line x1="72"  y1="104" x2="200" y2="136" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                  <line x1="328" y1="104" x2="200" y2="136" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                  {/* Highlighted cross-brand edges */}
                  <line x1="200" y1="30" x2="72"  y2="104" stroke="#E8D18A" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
                  <line x1="200" y1="30" x2="328" y2="104" stroke="#8AB4E8" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4" />
                  {/* Nodes */}
                  {BRANDS.map((b) => {
                    const cx = (b.x / 100) * 400;
                    const cy = (b.y / 100) * 160;
                    return (
                      <g key={b.short}>
                        <circle cx={cx} cy={cy} r={16} fill={b.color} fillOpacity={0.18} stroke={b.color} strokeWidth="1.5" strokeOpacity={0.6} />
                        <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fill={b.color} fontSize="9" fontWeight="600">
                          {b.short}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </motion.div>

            {/* Pair breakdown */}
            <div className="grid grid-cols-2 gap-3">
              {PAIRS.map((pair, i) => (
                <motion.div
                  key={pair.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: DUR.enter, ease: EASE_OUT, delay: 0.35 + i * 0.08 }}
                  className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{ background: CARD, border: CARD_BORDER, backdropFilter: CARD_BLUR }}
                >
                  <span className="text-[13px] font-light" style={{ color: INK.soft }}>
                    {pair.label}
                  </span>
                  <span className="text-sm font-semibold ml-3 shrink-0" style={{ color: GOLD }}>
                    {pair.pct}%
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: DUR.slow, delay: reduced ? 0 : 1.0 }}
          className="mt-8 text-sm font-light"
          style={{ color: "rgba(251,246,239,0.35)" }}
        >
          Cross-brand formula behavior is not visible in any brand-specific sales or distribution report.
        </motion.p>
      </div>
    </section>
  );
};
