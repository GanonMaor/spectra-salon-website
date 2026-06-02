import React from "react";
import { vizPalette } from "./palette";

interface SignalGraphProps {
  /** ordered chain of stages, e.g. Brand -> Tube -> Formula -> Service -> Reorder */
  chain: string[];
  /** operational signals captured at every stage */
  signals?: string[];
  /** label for where the chain resolves */
  resultLabel?: string;
  dark?: boolean;
  className?: string;
}

/** Static signal-flow graph: a horizontal capture chain feeding an intelligence result. */
export const SignalGraph: React.FC<SignalGraphProps> = ({
  chain,
  signals,
  resultLabel,
  dark = true,
  className = "",
}) => {
  const p = vizPalette(dark);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        {signals && signals.length > 0 && (
          <div className="flex flex-col gap-1.5 md:w-44 shrink-0">
            {signals.map((s) => (
              <div
                key={s}
                className="text-[11px] sm:text-xs rounded-md px-2.5 py-1.5"
                style={{ background: p.surface, border: `1px solid ${p.surfaceBorder}`, color: p.ink }}
              >
                {s}
              </div>
            ))}
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-stretch flex-wrap gap-2">
            {chain.map((node, i) => (
              <React.Fragment key={node}>
                <div
                  className="rounded-lg px-3 py-2.5 text-[11px] sm:text-sm font-medium flex items-center"
                  style={{ background: p.surface, border: `1px solid ${p.accent}`, color: p.ink }}
                >
                  {node}
                </div>
                {i < chain.length - 1 && (
                  <span className="self-center text-base" style={{ color: p.accent }}>
                    &rarr;
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>

          {resultLabel && (
            <div className="mt-5 flex items-center gap-3">
              <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${p.line}, ${p.accent})` }} />
              <div
                className="rounded-full px-4 py-2 text-sm font-medium"
                style={{
                  background: "rgba(193,154,99,0.16)",
                  border: `1px solid ${p.accent}`,
                  color: p.ink,
                }}
              >
                {resultLabel}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
