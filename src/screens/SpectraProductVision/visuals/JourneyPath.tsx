import React from "react";
import { motion } from "framer-motion";
import { COLORS, SALON, TYPE } from "../tokens";
import { EASE_OUT } from "../motion";

interface JourneyPathProps {
  reducedMotion?: boolean;
}

/** Phase 2A path steps (the 7-step visual journey). */
const STEPS = ["Book", "Arrive", "Consult", "Color Service", "Payment", "Follow Up", "Rebook"];

const FIRST_X = 6;
const LAST_X = 70;
const ROW_Y = 46;
const CORE_X = 92;

function stepX(i: number) {
  return FIRST_X + (i * (LAST_X - FIRST_X)) / (STEPS.length - 1);
}

/**
 * A single customer visit as a data path. Each step lights up and emits a
 * glowing data point that flows toward the Salon AI core on the right.
 * Pure code (no image assets).
 */
export const JourneyPath: React.FC<JourneyPathProps> = ({ reducedMotion = false }) => {
  return (
    <div
      className="relative mx-auto w-full"
      style={{ height: "clamp(240px, 34vh, 340px)", maxWidth: 960 }}
    >
      {/* baseline */}
      <div
        className="absolute"
        style={{
          left: `${FIRST_X}%`,
          right: `${100 - CORE_X}%`,
          top: `${ROW_Y}%`,
          height: 1,
          transform: "translateY(-50%)",
          background: `linear-gradient(90deg, ${COLORS.panelBorder}, rgba(234,183,118,0.35))`,
        }}
        aria-hidden
      />

      {/* steps */}
      {STEPS.map((label, i) => (
        <motion.div
          key={label}
          className="absolute flex flex-col items-center gap-2"
          style={{ left: `${stepX(i)}%`, top: `${ROW_Y}%`, transform: "translate(-50%,-50%)" }}
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.5, ease: EASE_OUT, delay: reducedMotion ? 0 : i * 0.12 }}
        >
          <motion.span
            className="rounded-full"
            style={{ width: 12, height: 12, background: COLORS.gold }}
            animate={
              reducedMotion
                ? undefined
                : { boxShadow: ["0 0 0px rgba(234,183,118,0)", "0 0 14px rgba(234,183,118,0.7)", "0 0 0px rgba(234,183,118,0)"] }
            }
            transition={{ duration: 2, delay: i * 0.3, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="text-center" style={{ fontSize: 11, color: COLORS.warmWhite, maxWidth: 84 }}>
            {label}
          </span>
        </motion.div>
      ))}

      {/* data points flowing to the core */}
      {!reducedMotion &&
        STEPS.map((label, i) => (
          <motion.span
            key={`d-${label}`}
            className="absolute rounded-full"
            style={{
              top: `${ROW_Y}%`,
              width: 6,
              height: 6,
              background: SALON.copper,
              boxShadow: "0 0 10px rgba(213,154,134,0.9)",
              transform: "translate(-50%,-50%)",
            }}
            initial={{ left: `${stepX(i)}%`, opacity: 0 }}
            animate={{ left: [`${stepX(i)}%`, `${CORE_X}%`], opacity: [0, 1, 0] }}
            transition={{
              duration: 2.6,
              delay: 0.8 + i * 0.4,
              repeat: Infinity,
              repeatDelay: 1.4,
              ease: "easeIn",
            }}
          />
        ))}

      {/* Salon AI core */}
      <div
        className="absolute flex flex-col items-center gap-2"
        style={{ left: `${CORE_X}%`, top: `${ROW_Y}%`, transform: "translate(-50%,-50%)" }}
      >
        <motion.span
          className="flex items-center justify-center rounded-full"
          style={{
            width: 56,
            height: 56,
            background: "radial-gradient(circle at 50% 45%, rgba(234,183,118,0.5), rgba(177,128,89,0) 70%)",
            border: `1px solid ${COLORS.panelBorder}`,
          }}
          animate={reducedMotion ? undefined : { scale: [1, 1.06, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="rounded-full" style={{ width: 14, height: 14, background: COLORS.gold }} />
        </motion.span>
        <span style={{ fontSize: TYPE.small, color: COLORS.warmWhite, fontWeight: 500 }}>Salon AI</span>
      </div>
    </div>
  );
};
