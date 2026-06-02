import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { COLORS, SALON, TYPE } from "../tokens";
import { EASE_OUT } from "../motion";
import {
  SCALE_CASES,
  SCALE_METRICS,
  CONFIDENCE_LABEL,
  type Confidence,
} from "../dataMoat";

interface BeautyDatasetMatrixProps {
  reducedMotion?: boolean;
}

function formatCompact(n: number, unit?: string): string {
  let out: string;
  if (n >= 1_000_000_000) out = `${(n / 1_000_000_000).toFixed(1)}B`;
  else if (n >= 1_000_000) out = `${(n / 1_000_000).toFixed(1)}M`;
  else if (n >= 10_000) out = `${(n / 1_000).toFixed(0)}K`;
  else out = Math.round(n).toLocaleString("en-US");
  return unit ? `${out}${unit}` : out;
}

const CONFIDENCE_DOT: Record<Confidence, string> = {
  real: SALON.sage,
  proxy: COLORS.gold,
  future: "rgba(155,129,115,0.55)",
};

/** Animate a number toward `target` whenever it changes. */
function useCountUp(target: number, reduced: boolean, ms = 900): number {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);
  useEffect(() => {
    if (reduced) {
      setValue(target);
      return;
    }
    const from = fromRef.current;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = from + (target - from) * eased;
      setValue(next);
      if (t < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => {
      fromRef.current = target;
      cancelAnimationFrame(raf);
    };
  }, [target, reduced, ms]);
  return value;
}

const MetricTile: React.FC<{
  label: string;
  target: number;
  unit?: string;
  confidence: Confidence;
  reduced: boolean;
}> = ({ label, target, unit, confidence, reduced }) => {
  const value = useCountUp(target, reduced);
  return (
    <div className="spv-glass rounded-2xl px-5 py-6 flex flex-col gap-2">

      <span
        style={{
          fontSize: "clamp(26px, 3.4vw, 44px)",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          backgroundImage: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.gold4})`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          lineHeight: 1,
        }}
      >
        {formatCompact(value, unit)}
      </span>
      <span style={{ fontSize: TYPE.small, color: COLORS.warmWhite }}>{label}</span>
      <span className="flex items-center gap-1.5">
        <span className="rounded-full" style={{ width: 6, height: 6, background: CONFIDENCE_DOT[confidence] }} />
        <span className="uppercase" style={{ fontSize: 9, letterSpacing: "0.12em", color: COLORS.textDim }}>
          {CONFIDENCE_LABEL[confidence]}
        </span>
      </span>
    </div>
  );
};

/**
 * Data moat matrix: a scale selector (1 salon → 50,000) drives count-up metric
 * tiles for the annual operational data a salon network generates. This reads as
 * an intelligence/volume matrix, not a revenue chart.
 */
export const BeautyDatasetMatrix: React.FC<BeautyDatasetMatrixProps> = ({
  reducedMotion = false,
}) => {
  const defaultIndex = Math.max(
    0,
    SCALE_CASES.findIndex((c) => c.highlight),
  );
  const [index, setIndex] = useState(defaultIndex === -1 ? 0 : defaultIndex);
  const salons = SCALE_CASES[index].salons;

  return (
    <div className="relative w-full overflow-hidden rounded-3xl p-4 sm:p-6" style={{ maxWidth: 1100, margin: "0 auto" }}>
      <IndustryGraph reducedMotion={reducedMotion} />
      {/* scale selector */}
      <div className="relative flex flex-wrap items-center justify-center gap-2 mb-10" role="tablist" aria-label="Salon scale">
        {SCALE_CASES.map((c, i) => {
          const active = i === index;
          return (
            <button
              key={c.id}
              role="tab"
              aria-selected={active}
              onClick={() => setIndex(i)}
              className="rounded-full px-4 py-2 transition-colors"
              style={{
                fontSize: TYPE.small,
                color: active ? COLORS.black : COLORS.textMuted,
                background: active ? COLORS.gold : COLORS.panel,
                border: `1px solid ${active ? COLORS.gold : COLORS.panelBorder}`,
                fontWeight: active ? 600 : 400,
              }}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* metric tiles */}
      <motion.div
        className="relative grid grid-cols-2 lg:grid-cols-4 gap-4"
        initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 0.6, ease: EASE_OUT }}
      >
        {SCALE_METRICS.map((m) => (
          <MetricTile
            key={m.id}
            label={m.label}
            target={m.perSalon * salons}
            unit={m.unit}
            confidence={m.confidence}
            reduced={reducedMotion}
          />
        ))}
      </motion.div>

      <p className="relative text-center mt-6" style={{ fontSize: TYPE.small, color: COLORS.textDim }}>
        Per-salon rates from real Apr 2026 usage, multiplied across the network.
      </p>
    </div>
  );
};

const IndustryGraph: React.FC<{ reducedMotion: boolean }> = ({ reducedMotion }) => {
  const nodes = [
    [8, 72],
    [18, 38],
    [33, 58],
    [49, 28],
    [65, 62],
    [82, 34],
    [92, 74],
  ] as const;

  return (
    <svg className="absolute inset-0 w-full h-full opacity-70" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
      <defs>
        <radialGradient id="dataset-graph-glow" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stopColor={COLORS.gold} stopOpacity="0.08" />
          <stop offset="100%" stopColor={COLORS.gold4} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill="url(#dataset-graph-glow)" />
      <g stroke="rgba(213,154,134,0.24)" strokeWidth="0.2" fill="none">
        {nodes.slice(0, -1).map((n, i) => (
          <path key={`${n[0]}-${i}`} d={`M${n[0]} ${n[1]} C${n[0] + 10} ${n[1] - 20}, ${nodes[i + 1][0] - 10} ${nodes[i + 1][1] + 20}, ${nodes[i + 1][0]} ${nodes[i + 1][1]}`} />
        ))}
        <path d="M8 72 C28 88, 64 12, 92 74" />
      </g>
      {nodes.map((n, i) => (
        <motion.circle
          key={`${n[0]}-${n[1]}`}
          cx={n[0]}
          cy={n[1]}
          r={0.8}
          fill={SALON.copper}
          animate={reducedMotion ? undefined : { opacity: [0.25, 0.85, 0.25], r: [0.5, 1.1, 0.5] }}
          transition={{ duration: 2.8, delay: i * 0.18, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </svg>
  );
};
