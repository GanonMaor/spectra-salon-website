import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { COLORS, SALON, TYPE } from "../tokens";

export interface Milestone {
  year: string;
  label: string;
  products: string;
  /** Display string, e.g. "$250 / mo" or "$3,000–10,000+ / mo". */
  display: string;
  /** Optional numeric target for count-up (omit for ranges). */
  count?: number;
  /** Prefix/suffix for the counted number. */
  prefix?: string;
  suffix?: string;
}

interface EvolutionCurveProps {
  milestones: Milestone[];
  reducedMotion?: boolean;
}

// rising points across the viewBox (lower y = higher value)
const XS = [8, 30, 52, 74, 93];
const YS = [34, 28, 21, 13, 5];

/** Build a smooth path (Catmull-Rom → cubic Bézier) through the points. */
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${p2.x} ${p2.y}`;
  }
  return d;
}

function useCountUp(target: number, run: boolean, reduced: boolean, ms = 1300) {
  const [value, setValue] = useState(reduced ? target : 0);
  useEffect(() => {
    if (!run) return;
    if (reduced) {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run, reduced, ms]);
  return value;
}

const MilestoneValue: React.FC<{ m: Milestone; run: boolean; reduced: boolean }> = ({
  m,
  run,
  reduced,
}) => {
  const counted = useCountUp(m.count ?? 0, run, reduced);
  const text =
    m.count != null
      ? `${m.prefix ?? ""}${counted.toLocaleString("en-US")}${m.suffix ?? ""}`
      : m.display;
  return (
    <span
      style={{
        fontSize: "clamp(18px, 2vw, 26px)",
        fontWeight: 600,
        backgroundImage: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.gold4})`,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
      }}
    >
      {text}
    </span>
  );
};

/**
 * Rising MRR curve with milestone markers and count-up values.
 * Curve draws in on view; values count up. Static under reduced motion.
 */
export const EvolutionCurve: React.FC<EvolutionCurveProps> = ({
  milestones,
  reducedMotion = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-12% 0px" });

  const pts = milestones.map((_, i) => ({ x: XS[i] ?? 95, y: YS[i] ?? 5 }));
  const linePath = smoothPath(pts);
  const areaPath = `${linePath} L ${pts[pts.length - 1].x} 40 L ${pts[0].x} 40 Z`;

  return (
    <div ref={ref} className="relative w-full" style={{ maxWidth: 1100, margin: "0 auto" }}>
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full" style={{ height: "clamp(180px, 26vh, 280px)" }}>
        <defs>
          <linearGradient id="evo-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={SALON.roseLine} stopOpacity="0.28" />
            <stop offset="100%" stopColor={SALON.roseLine} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        <motion.path
          d={areaPath}
          fill="url(#evo-area)"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1, delay: reducedMotion ? 0 : 0.8 }}
        />
        <motion.path
          d={linePath}
          fill="none"
          stroke={SALON.roseLine}
          strokeWidth={0.8}
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: reducedMotion ? 1 : 0 }}
          animate={inView ? { pathLength: 1 } : { pathLength: reducedMotion ? 1 : 0 }}
          transition={{ duration: 1.6, ease: "easeInOut" }}
        />
        {pts.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={1.2}
            fill={SALON.copper}
            stroke={SALON.ivory}
            strokeWidth={0.6}
            vectorEffect="non-scaling-stroke"
            initial={{ opacity: reducedMotion ? 1 : 0, scale: reducedMotion ? 1 : 0 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.4, delay: reducedMotion ? 0 : 0.3 + i * 0.28 }}
            style={{ transformOrigin: `${p.x}px ${p.y}px` }}
          />
        ))}
      </svg>

      {/* milestone labels under the curve */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
        {milestones.map((m, i) => (
          <motion.div
            key={m.year}
            className="spv-glass-soft rounded-2xl px-4 py-5 flex flex-col gap-1.5"
            style={{
              boxShadow:
                i === milestones.length - 1
                  ? "0 18px 50px rgba(185,104,82,0.22), inset 0 1px 0 rgba(255,255,255,0.5)"
                  : undefined,
            }}
            initial={{ opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 14 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: reducedMotion ? 0 : 0.3 + i * 0.18 }}
          >
            <span className="uppercase" style={{ fontSize: TYPE.eyebrow, letterSpacing: "0.16em", color: COLORS.textDim }}>
              {m.year}
            </span>
            <span style={{ fontSize: TYPE.body, color: COLORS.warmWhite, fontWeight: 500 }}>{m.label}</span>
            <span style={{ fontSize: TYPE.small, color: COLORS.textMuted }}>{m.products}</span>
            <span className="mt-1">
              <MilestoneValue m={m} run={inView} reduced={reducedMotion} />
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
