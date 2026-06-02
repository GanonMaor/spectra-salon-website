import React, { useMemo, useRef, useState } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { mulberry32 } from "./rng";
import { COLORS, TYPE } from "../tokens";

interface NetworkGrowthProps {
  /** e.g. ["1","10","100","1,000","10,000","50,000"]. */
  sequence: readonly string[];
  unit: string;
  reducedMotion?: boolean;
}

const DOT_COUNT = 420;
// Representational visible-dot count per stage (densifies as it grows).
const CUMULATIVE = [1, 8, 40, 140, 320, DOT_COUNT];

/**
 * A salon network that densifies as the user scrolls through the section, with
 * a large counter stepping 1 → 50,000. Cheap: only re-renders when the stage
 * changes (6 times total). Static (full) under reduced motion.
 */
export const NetworkGrowth: React.FC<NetworkGrowthProps> = ({
  sequence,
  unit,
  reducedMotion = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const maxStage = sequence.length - 1;
  const [stage, setStage] = useState(reducedMotion ? maxStage : 0);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (reducedMotion) return;
    // Use the middle of the scroll pass (0.15 → 0.7) to step through stages.
    const t = Math.max(0, Math.min(1, (p - 0.15) / 0.55));
    const next = Math.min(maxStage, Math.floor(t * (maxStage + 1)));
    setStage((prev) => (prev === next ? prev : next));
  });

  const dots = useMemo(() => {
    const rnd = mulberry32(99);
    return Array.from({ length: DOT_COUNT }, () => {
      const angle = rnd() * Math.PI * 2;
      const r = Math.sqrt(rnd()) * 46;
      return {
        x: 50 + Math.cos(angle) * r,
        y: 50 + Math.sin(angle) * r * 0.92,
        size: 0.5 + rnd() * 1.1,
      };
    });
  }, []);

  const visible = CUMULATIVE[stage] ?? DOT_COUNT;

  return (
    <div ref={ref} className="relative w-full flex flex-col items-center">
      <div className="relative w-full" style={{ maxWidth: 560, aspectRatio: "1 / 1" }}>
        <div
          className="absolute inset-0 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(232,185,168,0.22), rgba(232,185,168,0) 70%)" }}
        />
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" aria-hidden>
          {dots.map((d, i) => (
            <circle
              key={i}
              cx={d.x}
              cy={d.y}
              r={d.size}
              fill={COLORS.gold}
              style={{
                opacity: i < visible ? 0.85 : 0,
                transition: "opacity 700ms ease",
              }}
            />
          ))}
        </svg>

        {/* counter */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span
            style={{
              fontSize: "clamp(40px, 7vw, 96px)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: COLORS.warmWhite,
              lineHeight: 1,
              textShadow: "0 2px 24px rgba(247,238,229,0.8)",
            }}
          >
            {sequence[stage]}
          </span>
          <span style={{ fontSize: TYPE.small, color: COLORS.textDim, marginTop: 6 }}>{unit}</span>
        </div>
      </div>

      {/* stage ticks */}
      <div className="flex items-center gap-2 mt-6">
        {sequence.map((s, i) => (
          <span
            key={s}
            className="rounded-full transition-all duration-500"
            style={{
              width: i === stage ? 22 : 6,
              height: 6,
              background: i <= stage ? COLORS.gold : "rgba(120,80,60,0.18)",
            }}
            aria-hidden
          />
        ))}
      </div>
    </div>
  );
};
