import React from "react";
import { INV } from "../tokens";

interface Bar {
  stage: string;
  value: number;
  display: string;
}

/**
 * Lightweight SVG bar chart for the ARPU revenue ladder.
 * No chart library — keeps the lazy investor route small.
 */
export const RevenueLadderChart: React.FC<{ bars: Bar[] }> = ({ bars }) => {
  const max = Math.max(...bars.map((b) => b.value));
  const W = 520;
  const H = 280;
  const padX = 24;
  const padTop = 44;
  const padBottom = 52;
  const plotH = H - padTop - padBottom;
  const slot = (W - padX * 2) / bars.length;
  const barW = Math.min(96, slot * 0.5);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Annual revenue per salon by tier">
      <defs>
        <linearGradient id="ladderGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={INV.gold} />
          <stop offset="100%" stopColor={INV.goldDeep} />
        </linearGradient>
      </defs>

      {/* baseline */}
      <line
        x1={padX}
        y1={padTop + plotH}
        x2={W - padX}
        y2={padTop + plotH}
        stroke={INV.border}
        strokeWidth="1"
      />

      {bars.map((b, i) => {
        const h = Math.max(6, (b.value / max) * plotH);
        const x = padX + slot * i + (slot - barW) / 2;
        const y = padTop + plotH - h;
        const last = i === bars.length - 1;
        return (
          <g key={b.stage}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={h}
              rx={8}
              fill={last ? "url(#ladderGold)" : "rgba(193,154,99,0.28)"}
            />
            {/* value */}
            <text
              x={x + barW / 2}
              y={y - 12}
              textAnchor="middle"
              fontSize="18"
              fontWeight={last ? 600 : 500}
              fill={INV.text}
            >
              {b.display}
            </text>
            {/* stage */}
            <text
              x={x + barW / 2}
              y={padTop + plotH + 24}
              textAnchor="middle"
              fontSize="13"
              fill={INV.textSecondary}
            >
              {b.stage}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
