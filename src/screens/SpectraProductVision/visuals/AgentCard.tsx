import React from "react";
import { motion } from "framer-motion";
import { Glyph, type GlyphName } from "./Glyph";
import { BeautyIconFrame } from "../primitives/glass";
import { COLORS, SALON, TYPE } from "../tokens";

interface AgentCardProps {
  name: string;
  task: string;
  glyph: GlyphName;
  reducedMotion?: boolean;
  index?: number;
}

/**
 * Premium agent card with a subtle "live" activity indicator and an
 * indeterminate shimmer bar suggesting continuous work. Pure code.
 */
export const AgentCard: React.FC<AgentCardProps> = ({
  name,
  task,
  glyph,
  reducedMotion = false,
  index = 0,
}) => {
  return (
    <div className="spv-glass relative rounded-3xl px-6 py-6 flex flex-col gap-4 overflow-hidden h-full">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <BeautyIconFrame size={40}>
            <Glyph name={glyph} size={20} accent />
          </BeautyIconFrame>
          <span style={{ fontSize: TYPE.body, color: COLORS.warmWhite, fontWeight: 500 }}>
            {name}
          </span>
        </div>

        {/* soft live indicator */}
        <span className="flex items-center gap-1.5">
          <motion.span
            className="rounded-full"
            style={{ width: 7, height: 7, background: SALON.sage, boxShadow: `0 0 8px ${SALON.sage}` }}
            animate={reducedMotion ? undefined : { opacity: [0.45, 1, 0.45] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
          />
          <span
            className="uppercase"
            style={{ fontSize: 9, letterSpacing: "0.14em", color: COLORS.textDim }}
          >
            live
          </span>
        </span>
      </div>

      <p style={{ fontSize: TYPE.small, color: COLORS.textMuted }}>{task}</p>

      {/* indeterminate activity bar */}
      <div
        className="relative h-[3px] rounded-full overflow-hidden mt-auto"
        style={{ background: "rgba(120,80,60,0.12)" }}
      >
        {reducedMotion ? (
          <div
            className="absolute inset-y-0 left-0"
            style={{ width: "70%", background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.gold4})` }}
          />
        ) : (
          <motion.div
            className="absolute inset-y-0"
            style={{
              width: "40%",
              background: `linear-gradient(90deg, transparent, ${COLORS.gold}, transparent)`,
            }}
            animate={{ left: ["-40%", "100%"] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: index * 0.25 }}
          />
        )}
      </div>
    </div>
  );
};
