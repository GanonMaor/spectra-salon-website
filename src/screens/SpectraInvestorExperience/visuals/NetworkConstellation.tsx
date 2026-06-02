import React from "react";
import { vizPalette } from "./palette";

interface NetworkConstellationProps {
  dark?: boolean;
  /** number of nodes */
  count?: number;
  className?: string;
  style?: React.CSSProperties;
}

/** Deterministic static gold node/filament field for use as a faint background texture. */
export const NetworkConstellation: React.FC<NetworkConstellationProps> = ({
  dark = true,
  count = 26,
  className = "",
  style,
}) => {
  const p = vizPalette(dark);

  // Deterministic pseudo-random positions (mulberry32) so SSR/CSR match and nothing animates.
  const nodes = React.useMemo(() => {
    let seed = 0x9e3779b9;
    const rnd = () => {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    return Array.from({ length: count }, () => ({ x: rnd() * 100, y: rnd() * 100 }));
  }, [count]);

  const links = React.useMemo(() => {
    const out: Array<[number, number]> = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        if (Math.hypot(dx, dy) < 22) out.push([i, j]);
      }
    }
    return out;
  }, [nodes]);

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={`pointer-events-none ${className}`}
      style={style}
      aria-hidden="true"
    >
      {links.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a].x}
          y1={nodes[a].y}
          x2={nodes[b].x}
          y2={nodes[b].y}
          stroke={p.accent}
          strokeOpacity="0.18"
          strokeWidth="0.2"
        />
      ))}
      {nodes.map((node, i) => (
        <circle key={i} cx={node.x} cy={node.y} r="0.6" fill={p.accent} fillOpacity="0.5" />
      ))}
    </svg>
  );
};
