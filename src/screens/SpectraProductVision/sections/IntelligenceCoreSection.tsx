import React from "react";
import { motion } from "framer-motion";
import { Section, Eyebrow, Headline, AssetSlot } from "../primitives";
import { IntelligenceOrb, SalonAtmosphere } from "../visuals";
import { ASSETS } from "../assetManifest";
import { BRAIN } from "../copy";
import { COLORS, TYPE } from "../tokens";
import { staggerContainer, staggerItem, fadeOnly, VIEWPORT_ONCE } from "../motion";

interface SectionComponentProps {
  reducedMotion?: boolean;
}

/** Section 5 — The Brain. The centerpiece intelligence core. */
export const IntelligenceCoreSection: React.FC<SectionComponentProps> = ({
  reducedMotion = false,
}) => {
  return (
    <Section
      id="intelligence-core"
      reducedMotion={reducedMotion}
      aria-label="The intelligence layer"
      backdrop={<SalonAtmosphere variant="spotlights" reducedMotion={reducedMotion} />}
    >
      <div className="text-center mb-12">
        <Eyebrow className="mb-8">{BRAIN.eyebrow}</Eyebrow>
        <Headline lines={[BRAIN.headline]} size="h1" reducedMotion={reducedMotion} />
      </div>

      {/* The core. Code-generated neural orb stands in now; the final
          ai-brain-core asset crossfades over it when delivered. */}
      <div className="relative mx-auto mb-12 flex items-center justify-center" style={{ maxWidth: 460 }}>
        <AssetSlot
          asset={ASSETS.brainCoreAlpha}
          alt="Salon AI intelligence core"
          aspectRatio="1 / 1"
          fit="contain"
          className="w-[clamp(220px,40vw,380px)]"
          decorative
          fallback={<IntelligenceOrb reducedMotion={reducedMotion} label={BRAIN.coreLabel} />}
        />
      </div>

      {/* Orbit labels. */}
      <motion.ul
        className="flex flex-wrap items-center justify-center gap-2.5 list-none mb-12"
        variants={reducedMotion ? fadeOnly : staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
      >
        {BRAIN.orbit.map((label) => (
          <motion.li
            key={label}
            variants={reducedMotion ? fadeOnly : staggerItem}
            className="spv-glass-soft rounded-full px-4 py-1.5"
            style={{ color: COLORS.textMuted, fontSize: TYPE.small }}
          >
            {label}
          </motion.li>
        ))}
      </motion.ul>

      <p className="text-center mb-12" style={{ fontSize: TYPE.h2, fontWeight: 300, color: COLORS.textMuted }}>
        {BRAIN.statement}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {BRAIN.audiences.map((a) => (
          <div key={a.for} className="spv-glass rounded-2xl px-6 py-7 text-center">
            <p
              className="uppercase mb-2"
              style={{ fontSize: TYPE.eyebrow, letterSpacing: "0.18em", color: COLORS.textDim }}
            >
              {a.for}
            </p>
            <p style={{ fontSize: TYPE.body, color: COLORS.warmWhite }}>{a.line}</p>
          </div>
        ))}
      </div>
    </Section>
  );
};
