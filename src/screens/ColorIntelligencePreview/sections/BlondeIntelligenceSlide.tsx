import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { DUR, EASE_OUT, stagger, staggerItem } from "../../SpectraInvestorExperience/visuals/demo/motion";
import { INK } from "../../NewNarrativeSalonAIFirst/theme";
import { GOLD } from "../copy";

const CANVAS = "#0A0805";
const CARD = "rgba(255,255,255,0.06)";
const CARD_BORDER = "1px solid rgba(255,255,255,0.10)";
const CARD_BLUR = "blur(24px) saturate(140%)";

const BLONDE_TYPES = [
  { label: "Cool Blondes",  sub: "Ash, platinum, pearl", pct: 38, color: "#D0CABC" },
  { label: "Warm Blondes",  sub: "Golden, honey, copper", pct: 34, color: "#D9AA62" },
  { label: "Balayage",      sub: "Dimensional, natural", pct: 28, color: "#C4956E" },
];

const KEY_STATS = [
  { value: "54%",   label: "of all color services are blonde or blonde-adjacent" },
  { value: "61%",   label: "of blonde services include a toner application" },
  { value: "2.3×",  label: "average formula complexity vs. single-process color" },
];

const TOP_SHADES = [
  { code: "10.01", color: "#F0EDD6" },
  { code: "9.13",  color: "#DDD0A2" },
  { code: "8.1",   color: "#C4B69A" },
  { code: "9.3",   color: "#E2C880" },
  { code: "10.1",  color: "#ECE8D6" },
  { code: "8.43",  color: "#D49250" },
];

export const BlondeIntelligenceSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;

  return (
    <section
      className="relative w-full h-full flex flex-col justify-center overflow-hidden"
      style={{ background: CANVAS }}
      aria-label="Blonde Intelligence"
    >
      {/* ambient warm glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 30%, rgba(217,185,129,0.12), transparent 66%), radial-gradient(35% 35% at 85% 80%, rgba(217,170,98,0.08), transparent 55%)",
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
              What the industry cannot see · 04
            </span>
          </div>
          <h2
            className="font-light leading-[1.05] tracking-[-0.02em]"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3.4rem)", color: INK.strong }}
          >
            Blonde Intelligence
          </h2>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left column */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Key stats */}
            <motion.div
              variants={reduced ? undefined : stagger}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-3"
            >
              {KEY_STATS.map((stat) => (
                <motion.div
                  key={stat.value}
                  variants={reduced ? undefined : staggerItem}
                  className="flex items-center gap-4 px-5 py-4 rounded-2xl"
                  style={{ background: CARD, border: CARD_BORDER, backdropFilter: CARD_BLUR }}
                >
                  <span
                    className="font-light tabular-nums shrink-0"
                    style={{ fontSize: "2rem", color: GOLD, lineHeight: 1 }}
                  >
                    {stat.value}
                  </span>
                  <span className="text-sm font-light leading-snug" style={{ color: INK.soft }}>
                    {stat.label}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* Top shades strip */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DUR.enter, ease: EASE_OUT, delay: 0.55 }}
              className="px-5 py-4 rounded-2xl"
              style={{ background: CARD, border: CARD_BORDER, backdropFilter: CARD_BLUR }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: "rgba(251,246,239,0.35)" }}>
                Most Used Blonde Shades
              </p>
              <div className="flex gap-2">
                {TOP_SHADES.map((s) => (
                  <div key={s.code} className="flex flex-col items-center gap-1.5">
                    <div
                      className="w-8 h-8 rounded-full border"
                      style={{ background: s.color, borderColor: "rgba(255,255,255,0.15)" }}
                    />
                    <span className="text-[10px] tabular-nums" style={{ color: "rgba(251,246,239,0.45)" }}>
                      {s.code}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right column — type split */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: DUR.enter, ease: EASE_OUT, delay: 0.18 }}
            className="lg:w-[300px] flex flex-col gap-3"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-1" style={{ color: "rgba(251,246,239,0.3)" }}>
              Blonde Service Types
            </p>
            {BLONDE_TYPES.map((type, i) => (
              <motion.div
                key={type.label}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: DUR.enter, ease: EASE_OUT, delay: 0.28 + i * 0.09 }}
                className="px-5 py-4 rounded-2xl"
                style={{ background: CARD, border: CARD_BORDER, backdropFilter: CARD_BLUR }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: type.color }}>
                    {type.label}
                  </span>
                  <span className="text-lg font-light tabular-nums" style={{ color: GOLD }}>
                    {type.pct}%
                  </span>
                </div>
                <p className="text-xs font-light" style={{ color: "rgba(251,246,239,0.38)" }}>
                  {type.sub}
                </p>
                {/* Bar */}
                <div className="mt-3 h-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${type.pct}%` }}
                    transition={{ duration: DUR.slow, ease: EASE_OUT, delay: 0.45 + i * 0.09 }}
                    className="h-full rounded-full"
                    style={{ background: type.color }}
                  />
                </div>
              </motion.div>
            ))}

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: DUR.slow, delay: reduced ? 0 : 1.1 }}
              className="text-xs font-light leading-relaxed mt-2"
              style={{ color: "rgba(251,246,239,0.32)" }}
            >
              Blonde services are the most complex and highest-value services in professional color. We see every formula.
            </motion.p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
