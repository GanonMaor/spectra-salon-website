import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { INV } from "../../tokens";
import { Glyph, GlyphName } from "../Glyph";
import { cardReveal, fadeIn, DUR, EASE_OUT } from "./motion";

export interface FloatingCard {
  label: string;
  sub?: string;
  glyph?: GlyphName;
  delay?: number;
}

interface FloatingAICardProps extends FloatingCard {
  dark?: boolean;
  className?: string;
}

/** A premium glass-card that enters with a subtle float reveal. Supports dark + light contexts. */
export const FloatingAICard: React.FC<FloatingAICardProps> = ({
  label,
  sub,
  glyph,
  delay = 0,
  dark = true,
  className = "",
}) => {
  const reduced = useReducedMotion() ?? false;
  const variant = reduced ? fadeIn : cardReveal;

  return (
    <motion.div
      variants={variant}
      initial="hidden"
      animate="visible"
      transition={reduced ? undefined : { duration: DUR.enter, ease: EASE_OUT, delay }}
      className={`rounded-2xl px-5 py-4 flex items-center gap-3 ${className}`}
      style={{
        background: dark ? "rgba(255,255,255,0.09)" : INV.glassStrong,
        border: `1px solid ${dark ? "rgba(255,255,255,0.18)" : INV.border}`,
        backdropFilter: "blur(24px) saturate(130%)",
        WebkitBackdropFilter: "blur(24px) saturate(130%)",
        boxShadow: dark
          ? "0 8px 40px rgba(0,0,0,0.32)"
          : `0 8px 40px ${INV.shadow}`,
      }}
    >
      {glyph && (
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "rgba(193,154,99,0.18)", border: `1px solid rgba(193,154,99,0.38)` }}
        >
          <Glyph name={glyph} size={18} color={INV.gold} />
        </div>
      )}
      <div>
        <div className="text-sm font-medium" style={{ color: dark ? INV.textOnDark : INV.text }}>
          {label}
        </div>
        {sub && (
          <div className="text-xs font-light mt-0.5" style={{ color: dark ? INV.textOnDarkSoft : INV.textMuted }}>
            {sub}
          </div>
        )}
      </div>
    </motion.div>
  );
};
