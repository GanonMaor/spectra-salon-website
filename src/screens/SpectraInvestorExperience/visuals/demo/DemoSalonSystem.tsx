import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { INV } from "../../tokens";
import { stagger, pickStaggerItem } from "./motion";

interface DemoSalonSystemProps {
  before: readonly string[];
  after: readonly string[];
  center: string;
  dark?: boolean;
  className?: string;
}

/**
 * Visual that shows old fragmented systems collapsing into a central Salon AI hub,
 * then emitting connected output modules. Pure SVG/CSS + framer-motion.
 */
export const DemoSalonSystem: React.FC<DemoSalonSystemProps> = ({
  before,
  after,
  center,
  dark = false,
  className = "",
}) => {
  const reduced = useReducedMotion() ?? false;
  const item = pickStaggerItem(reduced);
  const ink = dark ? INV.textOnDark : INV.text;
  const muted = dark ? INV.textOnDarkSoft : INV.textMuted;
  const surface = dark ? "rgba(255,255,255,0.07)" : INV.glassStrong;
  const border = dark ? "rgba(255,255,255,0.14)" : INV.border;

  return (
    <div className={`flex items-center gap-4 md:gap-8 w-full ${className}`}>
      {/* Before — old systems */}
      <motion.div
        className="flex flex-col gap-2 shrink-0"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {before.map((s, i) => (
          <motion.div
            key={s}
            variants={item}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-center"
            style={{
              background: surface,
              border: `1px solid ${border}`,
              color: muted,
              opacity: 0.75,
            }}
          >
            {s}
          </motion.div>
        ))}
      </motion.div>

      {/* Arrow */}
      <div className="flex flex-col items-center gap-1 shrink-0">
        <svg width="32" height="2" viewBox="0 0 32 2"><line x1="0" y1="1" x2="28" y2="1" stroke={INV.gold} strokeWidth="1.5" strokeDasharray="3 3" /><path d="M28 0 L32 1 L28 2" fill={INV.gold} /></svg>
      </div>

      {/* Hub */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: reduced ? 0 : 0.35 }}
        className="rounded-full flex items-center justify-center text-center shrink-0"
        style={{
          width: 96,
          height: 96,
          background: "radial-gradient(circle at 50% 35%, rgba(193,154,99,0.9), rgba(168,126,69,0.65))",
          boxShadow: "0 0 60px rgba(193,154,99,0.45)",
          border: `1px solid ${INV.gold}`,
        }}
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white leading-tight px-2">
          {center}
        </span>
      </motion.div>

      {/* Arrow */}
      <div className="flex flex-col items-center gap-1 shrink-0">
        <svg width="32" height="2" viewBox="0 0 32 2"><line x1="0" y1="1" x2="28" y2="1" stroke={INV.gold} strokeWidth="1.5" strokeDasharray="3 3" /><path d="M28 0 L32 1 L28 2" fill={INV.gold} /></svg>
      </div>

      {/* After — connected modules */}
      <motion.div
        className="flex flex-col gap-2 shrink-0"
        variants={stagger}
        initial="hidden"
        animate="visible"
        transition={{ delayChildren: reduced ? 0 : 0.6 }}
      >
        {after.map((s) => (
          <motion.div
            key={s}
            variants={item}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-center"
            style={{
              background: "rgba(193,154,99,0.12)",
              border: `1px solid rgba(193,154,99,0.32)`,
              color: ink,
            }}
          >
            {s}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
