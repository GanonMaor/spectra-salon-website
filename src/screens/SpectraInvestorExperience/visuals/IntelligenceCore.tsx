import React from "react";
import { vizPalette } from "./palette";

interface IntelligenceCoreProps {
  centerName: string;
  centerRole?: string;
  nodes: string[];
  dark?: boolean;
  className?: string;
}

/** Static "AI core" orb: radial glow, concentric rings, center label, labeled agent nodes. */
export const IntelligenceCore: React.FC<IntelligenceCoreProps> = ({
  centerName,
  centerRole,
  nodes,
  dark = true,
  className = "",
}) => {
  const p = vizPalette(dark);
  const r = 41;
  const n = nodes.length;
  const pts = nodes.map((_, i) => {
    const a = ((-90 + (360 / n) * i) * Math.PI) / 180;
    return { x: 50 + r * Math.cos(a), y: 50 + r * Math.sin(a) };
  });

  return (
    <div className={`relative w-full max-w-[460px] mx-auto aspect-square ${className}`}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" aria-hidden="true">
        <defs>
          <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(193,154,99,0.55)" />
            <stop offset="45%" stopColor="rgba(193,154,99,0.18)" />
            <stop offset="100%" stopColor="rgba(193,154,99,0)" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#coreGlow)" />
        {[18, 28, 38].map((rad) => (
          <circle key={rad} cx="50" cy="50" r={rad} fill="none" stroke={p.line} strokeWidth="0.4" />
        ))}
        {pts.map((pt, i) => (
          <line
            key={i}
            x1="50"
            y1="50"
            x2={pt.x}
            y2={pt.y}
            stroke={p.accent}
            strokeOpacity="0.4"
            strokeWidth="0.4"
            strokeDasharray="1.4 1.6"
          />
        ))}
      </svg>

      {/* Core */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full flex flex-col items-center justify-center text-center"
        style={{
          width: "30%",
          height: "30%",
          background: "radial-gradient(circle at 50% 35%, rgba(193,154,99,0.9), rgba(168,126,69,0.7))",
          boxShadow: "0 0 50px rgba(193,154,99,0.5)",
        }}
      >
        <span className="text-lg sm:text-2xl font-light" style={{ color: "#fff" }}>
          {centerName}
        </span>
        {centerRole && (
          <span className="text-[8px] sm:text-[10px] uppercase tracking-[0.14em] mt-0.5 px-2" style={{ color: "rgba(255,255,255,0.85)" }}>
            {centerRole}
          </span>
        )}
      </div>

      {/* Agent nodes */}
      {nodes.map((node, i) => (
        <div
          key={node}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${pts[i].x}%`, top: `${pts[i].y}%` }}
        >
          <span
            className="inline-block rounded-full px-3 py-1.5 text-[10px] sm:text-xs font-medium whitespace-nowrap"
            style={{ background: p.surface, border: `1px solid ${p.accent}`, color: p.ink }}
          >
            {node}
          </span>
        </div>
      ))}
    </div>
  );
};
