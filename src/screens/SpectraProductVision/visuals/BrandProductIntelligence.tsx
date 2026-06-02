import React from "react";
import { motion } from "framer-motion";
import { COLORS, SALON, TYPE } from "../tokens";
import { EASE_OUT } from "../motion";
import {
  BEAUTY_TERMINAL_STATS,
  BRAND_SAMPLE,
  PRODUCT_SIGNALS,
  CONFIDENCE_LABEL,
  type Confidence,
} from "../dataMoat";

interface BrandProductIntelligenceProps {
  reducedMotion?: boolean;
}

const CONFIDENCE_DOT: Record<Confidence, string> = {
  real: SALON.sage,
  proxy: COLORS.gold,
  future: "rgba(155,129,115,0.55)",
};

/**
 * "Bloomberg Terminal of Beauty" panel: how professional products are actually
 * used inside real salons. It combines real proof stats, brand-consumption
 * relationships, and product-level signals so the dataset feels like a living
 * industry graph rather than a table.
 */
export const BrandProductIntelligence: React.FC<BrandProductIntelligenceProps> = ({
  reducedMotion = false,
}) => {
  return (
    <div
      className="spv-glass-soft relative overflow-hidden rounded-3xl p-4 sm:p-5"
      style={{ maxWidth: 1100, margin: "0 auto" }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 90% at 22% 10%, rgba(232,185,168,0.18), transparent 58%)",
        }}
      />
      <div className="relative grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-4">
      {/* Terminal header / real proof stats */}
      <div className="spv-glass rounded-2xl px-6 py-6">
        <div className="flex items-baseline justify-between mb-5">
          <span style={{ fontSize: TYPE.body, fontWeight: 600, color: COLORS.warmWhite }}>
            Beauty industry terminal
          </span>
          <span className="uppercase" style={{ fontSize: 9, letterSpacing: "0.12em", color: COLORS.textDim }}>
            real salon telemetry
          </span>
        </div>
        <div className="grid grid-cols-5 gap-2 mb-6">
          {BEAUTY_TERMINAL_STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl px-2 py-3 text-center"
              style={{ background: "rgba(255,248,244,0.5)", border: `1px solid ${SALON.borderRose}` }}
            >
              <div style={{ fontSize: "clamp(18px,2vw,28px)", fontWeight: 700, color: COLORS.gold, lineHeight: 1 }}>
                {stat.value}
              </div>
              <div className="mt-1" style={{ fontSize: 9, color: COLORS.textDim }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {BRAND_SAMPLE.map((b, i) => (
            <div key={b.name} className="flex items-center gap-3">
              <span style={{ fontSize: TYPE.small, color: COLORS.textMuted, width: 96 }}>{b.name}</span>
              <div className="relative flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(120,80,60,0.12)" }}>
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.gold4})` }}
                  initial={reducedMotion ? { width: `${b.share * 100}%` } : { width: 0 }}
                  whileInView={{ width: `${b.share * 100}%` }}
                  viewport={{ once: true, margin: "-10% 0px" }}
                  transition={{ duration: 0.9, ease: EASE_OUT, delay: reducedMotion ? 0 : i * 0.08 }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-5" style={{ fontSize: 11, color: COLORS.textDim }}>
          Brand count is real; distribution shape shown is illustrative until exact per-brand share is exported.
        </p>
      </div>

        {/* Product relationships */}
        <div className="spv-glass rounded-2xl px-6 py-6">
          <span className="block mb-5" style={{ fontSize: TYPE.body, fontWeight: 600, color: COLORS.warmWhite }}>
            Real product relationships
          </span>
          <div className="relative mb-6 rounded-2xl p-5 overflow-hidden" style={{ background: "rgba(255,248,244,0.45)", border: `1px solid ${SALON.borderRose}` }}>
            <svg viewBox="0 0 520 170" className="w-full" aria-hidden>
              <g stroke="rgba(185,104,82,0.32)" strokeWidth="1" fill="none">
                <path d="M78 84 C150 20, 220 38, 286 84 S410 148, 470 84" />
                <path d="M78 84 C156 130, 226 128, 286 84 S394 20, 470 84" />
                <path d="M78 84 H470" />
              </g>
              {[
                ["Brand", 78, 84],
                ["Tube", 174, 42],
                ["Formula", 286, 84],
                ["Service", 382, 126],
                ["Reorder", 470, 84],
              ].map(([label, x, y]) => (
                <g key={label as string}>
                  <circle cx={x as number} cy={y as number} r="18" fill="rgba(232,185,168,0.28)" stroke="rgba(185,104,82,0.45)" />
                  <circle cx={x as number} cy={y as number} r="3" fill={SALON.copper} />
                  <text x={x as number} y={(y as number) + 34} textAnchor="middle" fill={COLORS.textMuted} style={{ fontSize: 10 }}>
                    {label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none">
            {PRODUCT_SIGNALS.map((s) => (
              <li key={s.id} className="flex items-start gap-3">
                <span
                  className="mt-1 rounded-full shrink-0"
                  style={{ width: 7, height: 7, background: CONFIDENCE_DOT[s.confidence] }}
                  title={CONFIDENCE_LABEL[s.confidence]}
                />
                <span>
                  <span style={{ fontSize: TYPE.small, color: COLORS.warmWhite, fontWeight: 500 }}>{s.label}</span>
                  <span style={{ fontSize: TYPE.small, color: COLORS.textMuted }}> — {s.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
