import React from "react";
import { motion } from "framer-motion";
import { Section, Eyebrow, Headline } from "../primitives";
import { NetworkGrowth } from "../visuals";
import { NETWORK } from "../copy";
import { COLORS, TYPE } from "../tokens";
import { staggerContainer, staggerItem, fadeOnly, VIEWPORT_ONCE } from "../motion";

interface SectionComponentProps {
  reducedMotion?: boolean;
}

/** Section 8 — The Data Network. Growth and network effects. */
export const DataNetworkSection: React.FC<SectionComponentProps> = ({
  reducedMotion = false,
}) => {
  return (
    <Section id="network" reducedMotion={reducedMotion} aria-label="The data network">
      <div className="text-center mb-12">
        <Eyebrow className="mb-8">{NETWORK.eyebrow}</Eyebrow>
        <Headline lines={[NETWORK.headline]} size="h1" reducedMotion={reducedMotion} />
      </div>

      {/* Network densifies as you scroll: 1 → 50,000 salons. */}
      <div className="mb-12">
        <NetworkGrowth
          sequence={NETWORK.counterSequence}
          unit={NETWORK.counterUnit}
          reducedMotion={reducedMotion}
        />
      </div>

      <motion.ul
        className="flex flex-wrap items-center justify-center gap-3 list-none mb-12"
        variants={reducedMotion ? fadeOnly : staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
      >
        {NETWORK.growthLabels.map((label) => (
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

      <div className="text-center space-y-2">
        <p style={{ fontSize: TYPE.body, color: COLORS.textMuted }}>{NETWORK.statement}</p>
        <p
          style={{
            fontSize: TYPE.h2,
            fontWeight: 600,
            backgroundImage: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.gold4})`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {NETWORK.closingEmphasis}
        </p>
      </div>
    </Section>
  );
};
