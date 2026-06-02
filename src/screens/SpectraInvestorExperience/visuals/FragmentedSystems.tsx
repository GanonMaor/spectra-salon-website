import React from "react";
import { vizPalette } from "./palette";

interface FragmentedSystemsProps {
  systems: string[];
  centerLabel?: string;
  dark?: boolean;
  className?: string;
}

/** Static "disconnected systems" diagram: chips around an empty center with broken links. */
export const FragmentedSystems: React.FC<FragmentedSystemsProps> = ({
  systems,
  centerLabel = "No shared intelligence",
  dark = false,
  className = "",
}) => {
  const p = vizPalette(dark);
  const n = systems.length;
  const r = 40;
  const pts = systems.map((_, i) => {
    const a = ((-90 + (360 / n) * i) * Math.PI) / 180;
    return { x: 50 + r * Math.cos(a), y: 50 + r * Math.sin(a) };
  });

  return (
    <div className={`relative w-full max-w-[460px] mx-auto aspect-square ${className}`}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" aria-hidden="true">
        {pts.map((pt, i) => {
          // broken link: stops short of the center
          const mx = 50 + (pt.x - 50) * 0.42;
          const my = 50 + (pt.y - 50) * 0.42;
          return (
            <line
              key={i}
              x1={pt.x}
              y1={pt.y}
              x2={mx}
              y2={my}
              stroke={p.line}
              strokeWidth="0.5"
              strokeDasharray="1.5 2.5"
              strokeOpacity="0.6"
            />
          );
        })}
        <circle cx="50" cy="50" r="13" fill="none" stroke={p.line} strokeWidth="0.4" strokeDasharray="1 2" />
      </svg>

      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center text-center"
        style={{ width: "26%", height: "26%" }}
      >
        <span className="text-[10px] sm:text-xs font-light px-2" style={{ color: p.faint }}>
          {centerLabel}
        </span>
      </div>

      {systems.map((sys, i) => (
        <div
          key={sys}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${pts[i].x}%`, top: `${pts[i].y}%` }}
        >
          <span
            className="inline-block rounded-lg px-3 py-2 text-[11px] sm:text-xs font-medium text-center whitespace-nowrap"
            style={{ background: p.surface, border: `1px solid ${p.surfaceBorder}`, color: p.ink }}
          >
            {sys}
          </span>
        </div>
      ))}
    </div>
  );
};
