import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { mulberry32, dist } from "./rng";
import { COLORS } from "../tokens";

interface NetworkFieldProps {
  reducedMotion?: boolean;
  /** Number of nodes (kept modest for performance). */
  nodeCount?: number;
  /** Max distance (in viewBox units) to draw a connecting filament. */
  linkDistance?: number;
  className?: string;
  seed?: number;
}

const W = 1000;
const H = 600;

/**
 * Code-generated animated network field for the hero (no image asset needed).
 * Deterministic node layout, thin gold filaments between near nodes, subtle
 * twinkle + drift. Fully static under reduced motion.
 */
export const NetworkField: React.FC<NetworkFieldProps> = ({
  reducedMotion = false,
  nodeCount = 26,
  linkDistance = 190,
  className = "",
  seed = 7,
}) => {
  const { nodes, links } = useMemo(() => {
    const rnd = mulberry32(seed);
    const pts = Array.from({ length: nodeCount }, () => ({
      x: rnd() * W,
      y: rnd() * H,
      r: 1.2 + rnd() * 2.2,
      delay: rnd() * 4,
      dur: 3 + rnd() * 4,
    }));
    const lns: { x1: number; y1: number; x2: number; y2: number; o: number }[] = [];
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const d = dist(pts[i].x, pts[i].y, pts[j].x, pts[j].y);
        if (d < linkDistance) {
          lns.push({
            x1: pts[i].x,
            y1: pts[i].y,
            x2: pts[j].x,
            y2: pts[j].y,
            o: (1 - d / linkDistance) * 0.5,
          });
        }
      }
    }
    return { nodes: pts, links: lns };
  }, [nodeCount, linkDistance, seed]);

  return (
    <svg
      className={`w-full h-full ${className}`}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      style={{ display: "block" }}
    >
      <defs>
        <radialGradient id="nf-node" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={COLORS.gold} stopOpacity="1" />
          <stop offset="100%" stopColor={COLORS.gold4} stopOpacity="0" />
        </radialGradient>
      </defs>

      <g stroke={COLORS.gold}>
        {links.map((l, i) => (
          <line
            key={i}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            strokeWidth={0.6}
            strokeOpacity={l.o}
          />
        ))}
      </g>

      <g>
        {nodes.map((n, i) =>
          reducedMotion ? (
            <circle key={i} cx={n.x} cy={n.y} r={n.r} fill="url(#nf-node)" opacity={0.7} />
          ) : (
            <motion.circle
              key={i}
              cx={n.x}
              cy={n.y}
              r={n.r}
              fill="url(#nf-node)"
              initial={{ opacity: 0.25 }}
              animate={{ opacity: [0.25, 0.9, 0.25] }}
              transition={{
                duration: n.dur,
                delay: n.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ),
        )}
      </g>
    </svg>
  );
};
