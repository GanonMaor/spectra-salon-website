import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ACCENTS, INK } from "../theme";

/**
 * Cumulative ARPU chart — each layer stacks on top of the previous one so the
 * revenue-per-salon build-up reads at a glance. Designed for the dark cinematic
 * deck (no light panel needed).
 */

interface Layer {
  id: string;
  label: string;
  amount: number; // incremental contribution
  accent: string;
  accentDeep: string;
}

// Incremental contribution of each layer (so they stack to the cumulative total).
const LAYERS: Layer[] = [
  { id: "cost", label: "Cost Optimization", amount: 960, accent: ACCENTS.sky.accent, accentDeep: ACCENTS.sky.accentDeep },
  { id: "booking", label: "Smart Booking + CRM + POS", amount: 1100, accent: ACCENTS.sage.accent, accentDeep: ACCENTS.sage.accentDeep },
  { id: "os", label: "Salon Operating System", amount: 1000, accent: ACCENTS.mauve.accent, accentDeep: ACCENTS.mauve.accentDeep },
  { id: "ai", label: "Salon AI", amount: 1800, accent: ACCENTS.gold.accent, accentDeep: ACCENTS.gold.accentDeep },
];

// Each stage shows all layers up to and including its index → cumulative bars.
const STAGES = [
  { id: "s1", upto: 0, total: "$960", caption: "Cost Optimization" },
  { id: "s2", upto: 1, total: "$2,060", caption: "+ Booking & POS" },
  { id: "s3", upto: 2, total: "$3,060", caption: "+ Salon OS" },
  { id: "s4", upto: 3, total: "$4,860", caption: "+ Salon AI" },
];

const MAX = 4860;
const CHART_H = 200; // px

const fmt = (n: number) => `$${n.toLocaleString()}`;

export const ArpuStackChart: React.FC = () => {
  const reduced = useReducedMotion() ?? false;

  return (
    <div className="w-full">
      {/* Chart */}
      <div className="flex items-end justify-between gap-4 sm:gap-6" style={{ height: CHART_H + 44 }}>
        {STAGES.map((stage, si) => {
          const visible = LAYERS.slice(0, stage.upto + 1);
          return (
            <div key={stage.id} className="flex-1 flex flex-col items-center justify-end h-full">
              {/* Cumulative total */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: reduced ? 0 : 0.5 + si * 0.18 }}
                className="mb-2 text-center"
              >
                <span
                  className="font-light leading-none"
                  style={{
                    fontSize: si === 2 ? "1.65rem" : "1.3rem",
                    color: si === 2 ? ACCENTS.gold.accent : INK.strong,
                  }}
                >
                  {stage.total}
                </span>
              </motion.div>

              {/* Stacked bar (base at bottom) */}
              <div className="w-full max-w-[88px] flex flex-col-reverse gap-[3px]">
                {visible.map((layer, li) => {
                  const h = (layer.amount / MAX) * CHART_H;
                  const isTop = li === visible.length - 1;
                  const isBase = li === 0;
                  return (
                    <motion.div
                      key={layer.id}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: h, opacity: 1 }}
                      transition={{
                        duration: reduced ? 0 : 0.6,
                        ease: [0.22, 1, 0.36, 1],
                        delay: reduced ? 0 : 0.3 + si * 0.18 + li * 0.1,
                      }}
                      className="w-full relative flex items-center justify-center overflow-hidden"
                      style={{
                        background: `linear-gradient(180deg, ${layer.accent}, ${layer.accentDeep})`,
                        borderRadius: isTop ? "8px 8px 4px 4px" : isBase ? "4px 4px 8px 8px" : "4px",
                        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.18)`,
                      }}
                    >
                      {/* Segment contribution label (only when tall enough) */}
                      {h > 30 && (
                        <span
                          className="text-[11px] font-semibold tabular-nums"
                          style={{ color: "rgba(20,15,11,0.78)" }}
                        >
                          {isBase ? fmt(layer.amount) : `+${fmt(layer.amount)}`}
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Stage caption */}
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: reduced ? 0 : 0.6 + si * 0.18 }}
                className="mt-3 text-[11px] font-medium text-center leading-tight"
                style={{ color: si === 2 ? ACCENTS.gold.accent : INK.faint }}
              >
                {stage.caption}
              </motion.span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 mt-6 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}>
        {LAYERS.map((layer) => (
          <div key={layer.id} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: layer.accent }} />
            <span className="text-xs font-light" style={{ color: INK.soft }}>
              {layer.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
