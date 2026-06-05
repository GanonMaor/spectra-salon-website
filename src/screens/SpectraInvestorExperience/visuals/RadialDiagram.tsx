import React from "react";
import { vizPalette } from "./palette";
import { Glyph, GlyphName } from "./Glyph";

export interface RadialNode {
  label: string;
  note?: string;
  glyph?: GlyphName;
}

interface RadialDiagramProps {
  centerLabel: string;
  centerSub?: string;
  nodes: RadialNode[];
  dark?: boolean;
  /** stronger glass surfaces for bright cinematic backgrounds */
  cinematic?: boolean;
  /** start angle in degrees (-90 = top) */
  startAngle?: number;
  className?: string;
}

/** Static hub-and-spoke diagram: center label + nodes evenly placed on a ring. */
export const RadialDiagram: React.FC<RadialDiagramProps> = ({
  centerLabel,
  centerSub,
  nodes,
  dark = false,
  cinematic = false,
  startAngle = -90,
  className = "",
}) => {
  const base = vizPalette(dark);
  const p = cinematic
    ? {
        ...base,
        line: "rgba(255,255,255,0.28)",
        surface: "rgba(255,255,255,0.11)",
        surfaceBorder: "rgba(255,255,255,0.22)",
      }
    : base;
  const glass = cinematic
    ? { backdropFilter: "blur(16px) saturate(130%)", WebkitBackdropFilter: "blur(16px) saturate(130%)" }
    : {};
  const r = 39; // ring radius in % of the box
  const n = nodes.length;
  const pts = nodes.map((_, i) => {
    const a = ((startAngle + (360 / n) * i) * Math.PI) / 180;
    return { x: 50 + r * Math.cos(a), y: 50 + r * Math.sin(a) };
  });

  return (
    <div className={`relative w-full max-w-[460px] mx-auto aspect-square ${className}`}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" aria-hidden="true">
        {pts.map((pt, i) => (
          <line
            key={i}
            x1="50"
            y1="50"
            x2={pt.x}
            y2={pt.y}
            stroke={p.line}
            strokeWidth="0.5"
          />
        ))}
        <circle cx="50" cy="50" r="46" fill="none" stroke={p.line} strokeWidth="0.4" strokeDasharray="1 2" />
      </svg>

      {/* Center hub */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full flex flex-col items-center justify-center text-center"
        style={{
          width: "34%",
          height: "34%",
          background: cinematic ? "rgba(255,255,255,0.10)" : dark ? "rgba(193,154,99,0.16)" : "rgba(193,154,99,0.12)",
          border: `1px solid ${p.accent}`,
          boxShadow: dark ? "0 0 40px rgba(193,154,99,0.25)" : "0 8px 30px rgba(193,154,99,0.18)",
          ...glass,
        }}
      >
        <span className="text-sm sm:text-base font-medium px-2 leading-tight" style={{ color: p.ink }}>
          {centerLabel}
        </span>
        {centerSub && (
          <span className="text-[10px] sm:text-xs font-light mt-1 px-2" style={{ color: p.sub }}>
            {centerSub}
          </span>
        )}
      </div>

      {/* Nodes */}
      {nodes.map((node, i) => (
        <div
          key={node.label}
          className="absolute -translate-x-1/2 -translate-y-1/2 w-[30%]"
          style={{ left: `${pts[i].x}%`, top: `${pts[i].y}%` }}
        >
          <div
            className="rounded-xl px-2.5 py-2 text-center"
            style={{ background: p.surface, border: `1px solid ${p.surfaceBorder}`, ...glass }}
          >
            {node.glyph && (
              <div className="flex justify-center mb-1">
                <Glyph name={node.glyph} size={18} color={p.accent} />
              </div>
            )}
            <div className="text-[11px] sm:text-xs font-medium leading-tight" style={{ color: p.ink }}>
              {node.label}
            </div>
            {node.note && (
              <div className="text-[9px] sm:text-[10px] font-light leading-tight mt-0.5" style={{ color: p.sub }}>
                {node.note}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
