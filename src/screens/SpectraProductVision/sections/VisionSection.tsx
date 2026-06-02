import React from "react";
import { motion } from "framer-motion";
import { Section, Headline, Eyebrow, LuxuryButton } from "../primitives";
import { SalonAtmosphere } from "../visuals";
import { VISION, CHROME } from "../copy";
import { COLORS, TYPE } from "../tokens";
import { EASE_OUT, DURATION } from "../motion";

interface SectionComponentProps {
  reducedMotion?: boolean;
}

/** Section 9 — The Vision. The epic close. */
export const VisionSection: React.FC<SectionComponentProps> = ({
  reducedMotion = false,
}) => {
  return (
    <Section
      id="vision"
      reducedMotion={reducedMotion}
      aria-label="The vision"
      backdrop={
        <>
          {/* Warm beauty-infrastructure finale: a soft global constellation and a
              gentle human presence — no black emptiness. */}
          <SalonAtmosphere variant="global" reducedMotion={reducedMotion} />
          <SalonAtmosphere variant="humans" reducedMotion={reducedMotion} />
          <div
            aria-hidden
            className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full blur-3xl"
            style={{ width: "70vw", height: 360, background: "rgba(232,185,168,0.22)" }}
          />
        </>
      }
    >
      <div className="text-center">
        <Eyebrow className="mb-10">{VISION.eyebrow}</Eyebrow>

        <Headline
          lines={VISION.headlineLines}
          size="h1"
          as="h1"
          reducedMotion={reducedMotion}
        />

        <div className="mt-14 max-w-3xl mx-auto space-y-4">
          <motion.p
            style={{ fontSize: TYPE.h2, fontWeight: 300, color: COLORS.textMuted }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: DURATION.enter, ease: EASE_OUT, delay: reducedMotion ? 0 : 0.5 }}
          >
            {VISION.pauseLine}
          </motion.p>
          <motion.p
            style={{
              fontSize: TYPE.h1,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: COLORS.warmWhite,
            }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: DURATION.slow, ease: EASE_OUT, delay: reducedMotion ? 0 : 0.8 }}
          >
            {VISION.finalStatement}
          </motion.p>
        </div>

        <motion.ul
          className="mx-auto mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3 list-none"
          style={{ maxWidth: 900 }}
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: DURATION.enter, ease: EASE_OUT, delay: reducedMotion ? 0 : 1 }}
        >
          {VISION.infrastructureLines.map((line) => (
            <li
              key={line}
              className="spv-glass-soft rounded-2xl px-5 py-5"
              style={{
                color: COLORS.warmWhite,
                fontSize: TYPE.small,
                letterSpacing: "-0.01em",
              }}
            >
              {line}
            </li>
          ))}
        </motion.ul>

        <div className="mt-16 mb-[clamp(48px,10vh,128px)] flex flex-col items-center gap-8">
          <span
            className="font-semibold"
            style={{ fontSize: TYPE.h2, color: COLORS.warmWhite, letterSpacing: "-0.01em" }}
          >
            {VISION.signoff}
          </span>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <LuxuryButton variant="primary">{CHROME.ctaRequestAccess}</LuxuryButton>
            <LuxuryButton variant="ghost">{CHROME.ctaViewModel}</LuxuryButton>
          </div>
        </div>
      </div>
    </Section>
  );
};
