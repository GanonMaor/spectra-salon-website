import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Glyph, type GlyphName } from "./Glyph";
import { COLORS, SALON, TYPE } from "../tokens";

interface EcosystemMapProps {
  reducedMotion?: boolean;
}

interface NodeDef {
  label: string;
  glyph: GlyphName;
}

const NODES: NodeDef[] = [
  { label: "Owner", glyph: "owner" },
  { label: "Reception", glyph: "reception" },
  { label: "Stylist", glyph: "stylist" },
  { label: "Color Bar", glyph: "colorbar" },
  { label: "Customer", glyph: "customer" },
  { label: "Inventory", glyph: "inventory" },
  { label: "Payments", glyph: "payments" },
];

const CX = 50;
const CY = 50;
const R = 39;

/**
 * Abstract salon ecosystem: seven labeled role nodes around a central hub,
 * with connection lines that draw in and data sparks travelling toward the
 * center. Pure code — the final salon render can replace this later.
 */
export const EcosystemMap: React.FC<EcosystemMapProps> = ({ reducedMotion = false }) => {
  const placed = useMemo(
    () =>
      NODES.map((n, i) => {
        const angle = (i / NODES.length) * Math.PI * 2 - Math.PI / 2;
        return {
          ...n,
          x: CX + Math.cos(angle) * R,
          y: CY + Math.sin(angle) * R,
        };
      }),
    [],
  );

  return (
    <div className="relative mx-auto w-full" style={{ maxWidth: 640, aspectRatio: "1 / 1" }}>
      {/* line + spark layer */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        <defs>
          <radialGradient id="eco-hub" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={COLORS.gold} stopOpacity="0.9" />
            <stop offset="100%" stopColor={COLORS.gold4} stopOpacity="0" />
          </radialGradient>
        </defs>

        {placed.map((n, i) => (
          <motion.line
            key={`l-${n.label}`}
            x1={CX}
            y1={CY}
            x2={n.x}
            y2={n.y}
            stroke={COLORS.gold}
            strokeWidth={0.35}
            strokeOpacity={0.5}
            initial={reducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.9, delay: reducedMotion ? 0 : 0.15 * i, ease: "easeInOut" }}
          />
        ))}

        {/* hub */}
        <circle cx={CX} cy={CY} r={6} fill="url(#eco-hub)" />
        <circle cx={CX} cy={CY} r={1.6} fill={COLORS.gold} />

        {/* data sparks travelling node → hub */}
        {!reducedMotion &&
          placed.map((n, i) => (
            <motion.circle
              key={`s-${n.label}`}
              r={0.9}
              fill={SALON.copper}
              initial={{ cx: n.x, cy: n.y, opacity: 0 }}
              animate={{ cx: [n.x, CX], cy: [n.y, CY], opacity: [0, 1, 0] }}
              transition={{
                duration: 2.4,
                delay: 1 + i * 0.35,
                repeat: Infinity,
                repeatDelay: 1.6,
                ease: "easeIn",
              }}
            />
          ))}
      </svg>

      {/* node labels (HTML overlay for crisp text) */}
      {placed.map((n) => (
        <div
          key={n.label}
          className="absolute flex flex-col items-center gap-1.5"
          style={{ left: `${n.x}%`, top: `${n.y}%`, transform: "translate(-50%,-50%)" }}
        >
          <span
            className="flex items-center justify-center rounded-full"
            style={{
              width: 46,
              height: 46,
              color: SALON.copper,
              background: "linear-gradient(150deg, rgba(255,248,244,0.6), rgba(232,185,168,0.25))",
              border: `1px solid ${SALON.borderRose}`,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6), 0 8px 22px rgba(185,104,82,0.14)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
            }}
          >
            <Glyph name={n.glyph} size={20} accent />
          </span>
          <span style={{ fontSize: TYPE.small, color: COLORS.warmWhite }}>{n.label}</span>
        </div>
      ))}
    </div>
  );
};
