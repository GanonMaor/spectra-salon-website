import React from "react";
import { vizPalette } from "./palette";

export interface MarketTier {
  label: string;
  value: string;
  note?: string;
}

interface ConcentricMarketProps {
  /** outer -> inner */
  tiers: MarketTier[];
  dark?: boolean;
  className?: string;
}

/** Static nested-rings market sizing (TAM / SAM / SOM). */
export const ConcentricMarket: React.FC<ConcentricMarketProps> = ({
  tiers,
  dark = false,
  className = "",
}) => {
  const p = vizPalette(dark);
  const n = tiers.length;
  // outer ring largest; spacing from 48 down to ~14
  const radii = tiers.map((_, i) => 48 - (i * (34 / Math.max(1, n - 1))));

  return (
    <div className={`relative w-full max-w-[420px] mx-auto aspect-square ${className}`}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" aria-hidden="true">
        {radii.map((rad, i) => {
          const t = i / Math.max(1, n - 1);
          return (
            <circle
              key={i}
              cx="50"
              cy="50"
              r={rad}
              fill={`rgba(193,154,99,${0.06 + t * 0.16})`}
              stroke={p.accent}
              strokeOpacity={0.3 + t * 0.4}
              strokeWidth="0.4"
            />
          );
        })}
      </svg>

      {/* tier labels: anchored at top of each ring */}
      {tiers.map((tier, i) => (
        <div
          key={tier.label}
          className="absolute left-1/2 -translate-x-1/2 text-center"
          style={{ top: `${50 - radii[i]}%`, transform: "translate(-50%, -55%)" }}
        >
          <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.14em]" style={{ color: p.sub }}>
            {tier.label}
          </div>
          <div className="text-sm sm:text-lg font-medium leading-tight" style={{ color: p.ink }}>
            {tier.value}
          </div>
        </div>
      ))}

      {/* notes column on the right */}
      <div className="absolute -right-1 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-2 max-w-[140px]">
        {tiers.map((tier) => (
          <div key={tier.label} className="text-[10px] leading-tight" style={{ color: p.sub }}>
            <span className="font-medium" style={{ color: p.ink }}>{tier.label}:</span> {tier.note}
          </div>
        ))}
      </div>
    </div>
  );
};
