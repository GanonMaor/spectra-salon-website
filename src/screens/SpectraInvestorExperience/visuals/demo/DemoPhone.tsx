import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { INV } from "../../tokens";
import { revealUp, fadeIn, DUR, EASE_OUT } from "./motion";

interface DemoPhoneProps {
  recipientName: string;
  messageLines: readonly string[];
  dark?: boolean;
  className?: string;
}

/** Minimal iPhone-style message mockup used for client message + notification slides. */
export const DemoPhone: React.FC<DemoPhoneProps> = ({
  recipientName,
  messageLines,
  dark = true,
  className = "",
}) => {
  const reduced = useReducedMotion() ?? false;
  const reveal = reduced ? fadeIn : revealUp;
  const ink = dark ? INV.textOnDark : INV.text;
  const muted = dark ? INV.textOnDarkSoft : INV.textMuted;
  const bg = dark ? "rgba(28,22,18,0.85)" : "rgba(255,253,250,0.92)";
  const border = dark ? "rgba(255,255,255,0.14)" : INV.border;

  return (
    <motion.div
      variants={reveal}
      initial="hidden"
      animate="visible"
      transition={{ duration: DUR.enter, ease: EASE_OUT }}
      className={`rounded-[2.2rem] overflow-hidden ${className}`}
      style={{
        background: bg,
        border: `1px solid ${border}`,
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        boxShadow: dark ? "0 24px 80px rgba(0,0,0,0.52)" : `0 24px 80px ${INV.shadow}`,
        maxWidth: 320,
      }}
    >
      {/* Status bar */}
      <div className="flex items-center justify-between px-6 pt-5 pb-2">
        <span className="text-[11px] font-semibold" style={{ color: muted }}>9:41</span>
        <div className="w-20 h-4 rounded-full" style={{ background: dark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.12)" }} />
        <div className="flex items-center gap-1">
          <span className="text-[10px]" style={{ color: muted }}>●●●</span>
        </div>
      </div>

      {/* Conversation header */}
      <div
        className="mx-4 rounded-xl px-4 py-2.5 mb-3"
        style={{ background: dark ? "rgba(255,255,255,0.05)" : INV.bgSoft, border: `1px solid ${border}` }}
      >
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-0.5" style={{ color: INV.gold }}>
          Salon AI
        </div>
        <div className="text-xs font-medium" style={{ color: muted }}>{recipientName}</div>
      </div>

      {/* Message bubble */}
      <div className="px-4 pb-6 flex flex-col gap-2">
        {messageLines.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: EASE_OUT, delay: reduced ? 0 : 0.25 + i * 0.14 }}
            className="self-start rounded-2xl rounded-tl-md px-4 py-2.5 max-w-[90%]"
            style={{
              background: dark ? "rgba(255,255,255,0.10)" : INV.glassStrong,
              border: `1px solid ${border}`,
            }}
          >
            <span className="text-sm font-light leading-snug" style={{ color: ink }}>{line}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
