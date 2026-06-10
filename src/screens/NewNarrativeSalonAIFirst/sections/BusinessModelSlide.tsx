import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CinematicSlide } from "./CinematicSlide";
import { SLIDE_THEME, INK, ACCENTS } from "../theme";
import { MODEL } from "../copy";

/**
 * Business Model — revenue ladder composition.
 *
 * A quieter layout: headline + hero economics on the left, a rising revenue
 * ladder on the right, and open revenue streams along the bottom.
 */

// ── Chart data ─────────────────────────────────────────────────────────────────

const SEGMENTS = [
  { id: "cost",    label: "Cost Optimization",    deltaLabel: "$960",    amount: 960,  accent: ACCENTS.sky.accent,   accentDeep: ACCENTS.sky.accentDeep   },
  { id: "booking", label: "Smart Booking + CRM",  deltaLabel: "+$1,100", amount: 1100, accent: ACCENTS.sage.accent,  accentDeep: ACCENTS.sage.accentDeep  },
  { id: "os",      label: "Salon OS",             deltaLabel: "+$1,000", amount: 1000, accent: ACCENTS.mauve.accent, accentDeep: ACCENTS.mauve.accentDeep },
  { id: "ai",      label: "Salon AI",             deltaLabel: "+$1,800", amount: 1800, accent: ACCENTS.gold.accent,  accentDeep: ACCENTS.gold.accentDeep  },
] as const;

const STAGES = [
  { id: "s1", upto: 0, total: "$960",    caption: "Today",      isHero: false },
  { id: "s2", upto: 1, total: "$2,060",  caption: "+ Booking",  isHero: false },
  { id: "s3", upto: 2, total: "$3,060",  caption: "+ Salon OS", isHero: false },
  { id: "s4", upto: 3, total: "$4,860",  caption: "+ Salon AI", isHero: true  },
] as const;

const STREAMS = [
  "Subscription",
  "AI Tokens",
  "Agent Packages",
  "Marketplace",
  "Intelligence Data",
  "Enterprise B2B",
] as const;

const MAX_VAL = 4860;

// ── Component ──────────────────────────────────────────────────────────────────

export const BusinessModelSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const theme   = SLIDE_THEME["business-model"];
  const gold    = ACCENTS.gold;
  const ease    = [0.22, 1, 0.36, 1] as const;
  const d       = (n: number) => (reduced ? 0 : n);

  return (
    <CinematicSlide
      theme={theme}
      ariaLabel="The business model evolution"
      scrim="veil"
      constellation={false}
      darkOverlay
      fit
    >
      <div className="grid h-full min-h-0 items-center gap-12 lg:grid-cols-[0.82fr_1.18fr]">
        {/* ── Left: story + hero economics ─────────────────────────────────── */}
        <div className="min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease, delay: d(0) }}
              className="flex items-center gap-2 mb-3"
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: gold.accent }} />
              <span className="text-[10px] font-semibold uppercase tracking-[0.26em]" style={{ color: gold.accent }}>
                {MODEL.eyebrow}
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease, delay: d(0.08) }}
              className="font-light leading-[1.06] tracking-[-0.02em]"
              style={{
                fontSize: "clamp(1.6rem,3.2vw,2.4rem)",
                color: INK.strong,
                textShadow: "0 2px 26px rgba(0,0,0,0.5)",
              }}
            >
              {MODEL.headline}
            </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: d(0.2) }}
            className="mt-10 border-y py-7"
            style={{ borderColor: "rgba(217,185,129,0.20)" }}
          >
            <div className="flex items-end gap-5">
              <div className="font-light tabular-nums leading-none tracking-[-0.04em]" style={{ color: gold.accent, fontSize: "clamp(3.6rem,7vw,5.6rem)" }}>
                $4,860
              </div>
              <div className="pb-2">
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: gold.accent }}>
                  Revenue per salon
                </div>
                <div className="mt-1 text-sm font-light" style={{ color: INK.faint }}>
                  $960 today → 5× annual expansion
                </div>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-3 gap-6">
              {STAGES.slice(1).map((stage, i) => (
                <div key={stage.id}>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: i === 2 ? gold.accent : "rgba(251,246,239,0.50)" }}>
                    {stage.caption}
                  </div>
                  <div className="mt-1 text-xl font-light tabular-nums" style={{ color: i === 2 ? gold.accent : INK.strong }}>
                    {stage.total}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: d(0.65) }}
            className="mt-8"
          >
            <div className="mb-3 text-[9px] font-semibold uppercase tracking-[0.28em]" style={{ color: gold.accent }}>
              Revenue Streams
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 border-y py-3" style={{ borderColor: "rgba(255,255,255,0.10)" }}>
              {STREAMS.map((label, i) => (
                <span key={label} className="text-[11px] font-light" style={{ color: i >= 4 ? gold.accent : INK.faint }}>
                  {String(i + 1).padStart(2, "0")} · {label}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Right: revenue ladder ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 26 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease, delay: d(0.18) }}
          className="relative hidden h-[570px] min-w-0 lg:block"
        >
          <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2" style={{ background: `linear-gradient(90deg, transparent, ${gold.accentBorder}, transparent)` }} />
          <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 72% 42%, ${gold.glow}, transparent 42%)` }} />

          <div className="relative z-10 flex h-full items-end justify-between gap-8">
            {STAGES.map((stage, si) => {
              const visibleLayers = SEGMENTS.slice(0, stage.upto + 1);
              const lift = [10, 76, 148, 228][si];

              return (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.62, ease, delay: d(0.28 + si * 0.12) }}
                  className="flex flex-1 flex-col items-center"
                  style={{ marginBottom: lift }}
                >
                  <div className="mb-5 text-center">
                    <div
                      className="text-2xl font-light tabular-nums leading-none tracking-[-0.03em]"
                      style={{ color: stage.isHero ? gold.accent : si === 0 ? "rgba(251,246,239,0.50)" : INK.strong }}
                    >
                      {stage.total}
                    </div>
                    <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: stage.isHero ? gold.accent : INK.faint }}>
                      {stage.caption}
                    </div>
                  </div>

                  <div className="flex w-full max-w-[132px] flex-col-reverse gap-2">
                    {visibleLayers.map((seg, li) => {
                      const width = 46 + (seg.amount / MAX_VAL) * 160;
                      return (
                        <motion.div
                          key={seg.id}
                          initial={{ scaleX: 0, opacity: 0 }}
                          animate={{ scaleX: 1, opacity: 1 }}
                          transition={{ duration: 0.55, ease, delay: d(0.32 + si * 0.12 + li * 0.06) }}
                          className="h-[9px] rounded-full"
                          style={{
                            width: `${Math.min(width, 100)}%`,
                            alignSelf: "center",
                            transformOrigin: "center",
                            background: `linear-gradient(90deg, ${seg.accent}dd, ${seg.accentDeep}99)`,
                            boxShadow: `0 0 18px ${seg.accent}22`,
                          }}
                          aria-label={`${seg.label}: ${seg.deltaLabel}`}
                        />
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 flex-wrap justify-center gap-x-5 gap-y-2">
            {SEGMENTS.map((seg) => (
              <div key={seg.id} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: seg.accent, boxShadow: `0 0 10px ${seg.accent}66` }} />
                <span className="text-[10px] font-light whitespace-nowrap" style={{ color: "rgba(251,246,239,0.56)" }}>
                  {seg.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </CinematicSlide>
  );
};
