import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { mulberry32 } from "./rng";
import { COLORS, SALON, TYPE } from "../tokens";

interface IntelligenceOrbProps {
  reducedMotion?: boolean;
  label?: string;
  className?: string;
}

const BEAUTY_SIGNALS = [
  { label: "Customers", x: 10, y: 30 },
  { label: "Appointments", x: 18, y: 68 },
  { label: "Brands", x: 48, y: 8 },
  { label: "Formulas", x: 82, y: 30 },
  { label: "Inventory", x: 78, y: 70 },
  { label: "Payments", x: 48, y: 92 },
] as const;

/**
 * Code-generated Salon AI core: a glowing neural orb built from radial
 * gradients, rotating SVG rings and orbiting particles. Stands in until the
 * final `ai-brain-core` asset arrives (then crossfades via AssetSlot fallback).
 */
export const IntelligenceOrb: React.FC<IntelligenceOrbProps> = ({
  reducedMotion = false,
  label,
  className = "",
}) => {
  const particles = useMemo(() => {
    const rnd = mulberry32(21);
    return Array.from({ length: 14 }, (_, i) => ({
      angle: (i / 14) * 360 + rnd() * 12,
      radius: 30 + rnd() * 16,
      size: 0.6 + rnd() * 1.4,
      dur: 6 + rnd() * 6,
    }));
  }, []);

  return (
    <div
      className={`relative ${className}`}
      style={{ width: "clamp(220px, 40vw, 380px)", aspectRatio: "1 / 1" }}
      aria-hidden
    >
      {/* outer glow — soft rose-gold, not a harsh neon orb */}
      <div
        className="absolute inset-0 rounded-full blur-2xl"
        style={{ background: "radial-gradient(circle, rgba(232,185,168,0.40), rgba(232,185,168,0) 68%)" }}
      />

      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
        <defs>
          <radialGradient id="orb-core" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor={SALON.ivory} stopOpacity="1" />
            <stop offset="38%" stopColor={SALON.roseSoft} stopOpacity="0.9" />
            <stop offset="100%" stopColor={SALON.copper} stopOpacity="0.05" />
          </radialGradient>
          <linearGradient id="orb-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={COLORS.gold} stopOpacity="0.9" />
            <stop offset="100%" stopColor={COLORS.gold4} stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* beauty operating signals flowing into the intelligence layer */}
        {BEAUTY_SIGNALS.map((signal, i) => (
          <motion.path
            key={signal.label}
            d={`M${signal.x} ${signal.y} Q50 ${signal.y < 50 ? signal.y + 14 : signal.y - 14} 50 50`}
            fill="none"
            stroke={COLORS.gold}
            strokeWidth={0.34}
            strokeOpacity={0.4}
            strokeDasharray="2 5"
            initial={reducedMotion ? { pathLength: 1, opacity: 0.35 } : { pathLength: 0, opacity: 0.1 }}
            animate={reducedMotion ? undefined : { pathLength: [0.25, 1, 0.25], opacity: [0.18, 0.55, 0.18] }}
            transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut", delay: i * 0.35 }}
          />
        ))}

        {/* rotating rings */}
        {[42, 34, 26].map((r, i) => (
          <motion.ellipse
            key={r}
            cx="50"
            cy="50"
            rx={r}
            ry={r * (i === 1 ? 0.42 : 0.7)}
            fill="none"
            stroke="url(#orb-ring)"
            strokeWidth={0.5}
            style={{ transformOrigin: "50px 50px" }}
            animate={reducedMotion ? undefined : { rotate: i % 2 === 0 ? 360 : -360 }}
            transition={{ duration: 26 + i * 8, repeat: Infinity, ease: "linear" }}
            opacity={0.55}
          />
        ))}

        {/* core */}
        <motion.circle
          cx="50"
          cy="50"
          r="18"
          fill="url(#orb-core)"
          style={{ transformOrigin: "50px 50px" }}
          animate={reducedMotion ? undefined : { scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* orbiting particles */}
        {particles.map((p, i) => {
          const a = (p.angle * Math.PI) / 180;
          const cx = 50 + Math.cos(a) * p.radius;
          const cy = 50 + Math.sin(a) * p.radius * 0.8;
          return reducedMotion ? (
            <circle key={i} cx={cx} cy={cy} r={p.size} fill={COLORS.gold} opacity={0.7} />
          ) : (
            <motion.circle
              key={i}
              r={p.size}
              fill={SALON.copper}
              initial={{ cx, cy, opacity: 0.2 }}
              animate={{ opacity: [0.2, 0.9, 0.2] }}
              transition={{ duration: p.dur * 0.4, repeat: Infinity, ease: "easeInOut" }}
            />
          );
        })}
      </svg>

      {BEAUTY_SIGNALS.map((signal) => (
        <span
          key={signal.label}
          className="absolute rounded-full px-2.5 py-1"
          style={{
            left: `${signal.x}%`,
            top: `${signal.y}%`,
            transform: "translate(-50%,-50%)",
            fontSize: TYPE.eyebrow,
            color: SALON.text,
            background: "rgba(255,244,235,0.72)",
            border: `1px solid ${SALON.borderRose}`,
            boxShadow: "0 8px 22px rgba(84,45,30,0.12)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            whiteSpace: "nowrap",
          }}
        >
          {signal.label}
        </span>
      ))}

      {label && (
        <span
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-semibold"
          style={{ fontSize: "clamp(13px, 1.6vw, 18px)", color: SALON.text }}
        >
          {label}
        </span>
      )}
    </div>
  );
};
