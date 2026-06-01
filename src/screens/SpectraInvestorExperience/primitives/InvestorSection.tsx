import React from "react";
import { motion } from "framer-motion";
import { INV, LAYOUT } from "../tokens";
import { VIEWPORT_ONCE, pickReveal } from "../motion";

interface InvestorSectionProps {
  id: string;
  "aria-label": string;
  children: React.ReactNode;
  reducedMotion?: boolean;
  dark?: boolean;
  /** Optional custom padding override */
  padY?: string;
  /** Optional full-bleed background node (rendered behind content) */
  backdrop?: React.ReactNode;
  className?: string;
}

export const InvestorSection: React.FC<InvestorSectionProps> = ({
  id,
  "aria-label": ariaLabel,
  children,
  reducedMotion = false,
  dark = false,
  padY,
  backdrop,
  className = "",
}) => {
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={`relative w-full overflow-hidden ${className}`}
      style={{
        background: dark ? INV.bgDark : INV.bg,
        color: dark ? INV.textLight : INV.text,
        paddingTop: padY ?? LAYOUT.sectionPad,
        paddingBottom: padY ?? LAYOUT.sectionPad,
      }}
    >
      {backdrop && (
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          {backdrop}
        </div>
      )}
      <motion.div
        className="relative mx-auto w-full"
        style={{
          maxWidth: LAYOUT.maxWidth,
          paddingLeft: LAYOUT.sidePad,
          paddingRight: LAYOUT.sidePad,
        }}
        variants={pickReveal(reducedMotion)}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
      >
        {children}
      </motion.div>
    </section>
  );
};
