import React from "react";
import { motion } from "framer-motion";
import { Glyph, type GlyphName } from "./Glyph";
import { COLORS, TYPE } from "../tokens";
import { EASE_OUT } from "../motion";

interface SystemChipsProps {
  reducedMotion?: boolean;
}

interface ChipDef {
  label: string;
  glyph: GlyphName;
  angle: number; // degrees around the circle
}

const CHIPS: ChipDef[] = [
  { label: "Booking", glyph: "booking", angle: -90 },
  { label: "CRM", glyph: "crm", angle: -30 },
  { label: "Inventory", glyph: "inventory", angle: 30 },
  { label: "POS", glyph: "pos", angle: 90 },
  { label: "Marketing", glyph: "marketing", angle: 150 },
  { label: "Color", glyph: "color", angle: 210 },
];

const SCATTER_R = 230; // disconnected
const CONVERGE_R = 116; // pulled toward center

function polar(angleDeg: number, r: number) {
  const a = (angleDeg * Math.PI) / 180;
  return { x: Math.cos(a) * r, y: Math.sin(a) * r };
}

/**
 * Six salon "systems" that begin scattered and disconnected, then are slowly
 * pulled toward the center as the section enters view — never quite touching.
 * Pure code (frosted cards + glyphs); no image assets.
 */
export const SystemChips: React.FC<SystemChipsProps> = ({ reducedMotion = false }) => {
  return (
    <div
      className="relative mx-auto"
      style={{ height: "clamp(360px, 52vh, 520px)", maxWidth: 720 }}
      aria-hidden
    >
      {/* faint center marker — the void where intelligence is missing */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ width: 6, height: 6, background: COLORS.textDim }}
      />

      {CHIPS.map((chip) => {
        const from = polar(chip.angle, SCATTER_R);
        const to = polar(chip.angle, CONVERGE_R);
        return (
          <motion.div
            key={chip.label}
            className="absolute left-1/2 top-1/2"
            style={{ translateX: "-50%", translateY: "-50%" }}
            initial={reducedMotion ? { x: to.x, y: to.y, opacity: 1 } : { x: from.x, y: from.y, opacity: 0 }}
            whileInView={{ x: to.x, y: to.y, opacity: 1 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 1.4, ease: EASE_OUT }}
          >
            <div className="spv-glass flex items-center gap-2.5 rounded-2xl px-4 py-3 whitespace-nowrap">
              <span style={{ color: COLORS.gold }}>
                <Glyph name={chip.glyph} size={18} />
              </span>
              <span style={{ fontSize: TYPE.small, color: COLORS.warmWhite }}>{chip.label}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
