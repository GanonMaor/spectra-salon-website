import React from "react";
import { motion } from "framer-motion";
import { reveal, fadeOnly, staggerContainer, VIEWPORT_ONCE } from "../motion";
import { LAYOUT } from "../tokens";

interface SectionProps {
  id: string;
  children: React.ReactNode;
  /** Full viewport height stage (opening / vision). Default true. */
  fullHeight?: boolean;
  /** Stagger children reveals instead of a single block reveal. */
  stagger?: boolean;
  /**
   * Full-bleed decorative layer painted behind the content (e.g. SalonAtmosphere).
   * Rendered outside the reveal animation so the backdrop never fades or shifts
   * with the content, and always spans the entire section (not the inner column).
   */
  backdrop?: React.ReactNode;
  reducedMotion?: boolean;
  className?: string;
  "aria-label"?: string;
}

/**
 * A full-bleed dark section stage with a constrained inner column.
 *
 * Phase 1: a simple in-view reveal (opacity + small rise). No scroll scrubbing
 * or pinning yet — that arrives in Phase 2 (see investor-assets/MOTION_PLAN.md).
 */
export const Section: React.FC<SectionProps> = ({
  id,
  children,
  fullHeight = true,
  stagger = false,
  backdrop,
  reducedMotion = false,
  className = "",
  ...rest
}) => {
  const variants = stagger
    ? staggerContainer
    : reducedMotion
      ? fadeOnly
      : reveal;

  return (
    <section
      id={id}
      aria-label={rest["aria-label"] ?? id}
      className={`relative w-full overflow-hidden flex items-center justify-center ${
        fullHeight ? "min-h-[100dvh]" : "py-[clamp(96px,16vh,200px)]"
      } ${className}`}
    >
      {backdrop ? (
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
          {backdrop}
        </div>
      ) : null}

      <motion.div
        className="relative z-10 w-full mx-auto"
        style={{ maxWidth: LAYOUT.maxWidth, paddingInline: LAYOUT.sidePad }}
        variants={variants}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
      >
        {children}
      </motion.div>
    </section>
  );
};
