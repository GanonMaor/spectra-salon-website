import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { INV } from "../../tokens";
import { Glyph, GlyphName } from "../Glyph";
import { stagger, pickStaggerItem } from "./motion";

export interface SignalItem {
  label: string;
  icon: GlyphName;
}

interface IntelligenceStreamProps {
  signals: readonly SignalItem[];
  dark?: boolean;
  className?: string;
}

/**
 * Signal grid: each captured data-point appears as a gold-tinted chip,
 * staggered into view, communicating "every service creates intelligence."
 */
export const IntelligenceStream: React.FC<IntelligenceStreamProps> = ({
  signals,
  dark = true,
  className = "",
}) => {
  const reduced = useReducedMotion() ?? false;
  const item = pickStaggerItem(reduced);
  const ink = dark ? INV.textOnDark : INV.text;
  const muted = dark ? INV.textOnDarkSoft : INV.textMuted;

  return (
    <motion.div
      className={`grid grid-cols-2 sm:grid-cols-4 gap-3 ${className}`}
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      {signals.map((sig) => (
        <motion.div
          key={sig.label}
          variants={item}
          className="flex flex-col items-center gap-2 rounded-2xl p-4"
          style={{
            background: dark ? "rgba(255,255,255,0.06)" : INV.glassStrong,
            border: `1px solid ${dark ? "rgba(193,154,99,0.30)" : INV.borderSoft}`,
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(193,154,99,0.16)", border: `1px solid rgba(193,154,99,0.35)` }}
          >
            <Glyph name={sig.icon} size={20} color={INV.gold} />
          </div>
          <span className="text-xs font-medium text-center" style={{ color: ink }}>
            {sig.label}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
};
