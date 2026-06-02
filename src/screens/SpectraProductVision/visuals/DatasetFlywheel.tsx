import React from "react";
import { motion } from "framer-motion";
import { COLORS, TYPE } from "../tokens";

interface DatasetFlywheelProps {
  steps: readonly string[];
  reducedMotion?: boolean;
}

const R = 33; // node ring radius in viewBox units (0-100)

/**
 * Code-generated dataset flywheel: steps arranged on a circle with a rotating,
 * directional arc that implies perpetual motion. No image assets. Static under
 * reduced motion. Nodes are kept clear of the container edge so nothing clips.
 */
export const DatasetFlywheel: React.FC<DatasetFlywheelProps> = ({
  steps,
  reducedMotion = false,
}) => {
  const placed = steps.map((label, i) => {
    const angle = (i / steps.length) * Math.PI * 2 - Math.PI / 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    // Anchor each pill so it hangs OUTWARD from its ring point: the pill's inner
    // edge always sits on the ring, keeping the center clear and symmetric
    // regardless of label width.
    const tx = Math.abs(cos) < 0.01 ? "-50%" : cos > 0 ? "0%" : "-100%";
    const ty = Math.abs(sin) < 0.01 ? "-50%" : sin > 0 ? "0%" : "-100%";
    return {
      label,
      index: i,
      x: 50 + cos * R,
      y: 50 + sin * R,
      tx,
      ty,
    };
  });

  const circumference = 2 * Math.PI * R;

  return (
    <div
      className="relative mx-auto w-full"
      style={{ maxWidth: 560, aspectRatio: "1 / 1", overflow: "visible" }}
    >
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="-6 -6 112 112"
        style={{ overflow: "visible" }}
        aria-hidden
      >
        <defs>
          <linearGradient id="fw-arc" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={COLORS.gold} stopOpacity="0.95" />
            <stop offset="100%" stopColor={COLORS.gold4} stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* base ring */}
        <circle cx="50" cy="50" r={R} fill="none" stroke={COLORS.panelBorder} strokeWidth={0.5} />

        {/* rotating directional arc that travels the loop */}
        <motion.circle
          cx="50"
          cy="50"
          r={R}
          fill="none"
          stroke="url(#fw-arc)"
          strokeWidth={1.2}
          strokeLinecap="round"
          strokeDasharray={`${circumference * 0.24} ${circumference}`}
          style={{ transformOrigin: "50px 50px" }}
          animate={reducedMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />

        {/* center label */}
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="middle"
          fill={COLORS.textDim}
          style={{ fontSize: 3.6, letterSpacing: "0.22em" }}
        >
          COMPOUNDS
        </text>
      </svg>

      {/* step nodes (HTML for crisp text) */}
      {placed.map((p) => (
        <motion.div
          key={p.label}
          className="spv-glass absolute flex items-center gap-2 rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            transform: `translate(${p.tx},${p.ty})`,
            whiteSpace: "nowrap",
            padding: "10px 16px",
          }}
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.5, delay: reducedMotion ? 0 : p.index * 0.15 }}
        >
          <span
            className="flex items-center justify-center rounded-full"
            style={{
              width: 20,
              height: 20,
              fontSize: 10,
              fontWeight: 700,
              color: COLORS.black,
              background: `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.gold4})`,
            }}
          >
            {p.index + 1}
          </span>
          <span style={{ fontSize: TYPE.small, color: COLORS.warmWhite, fontWeight: 500 }}>
            {p.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
};
