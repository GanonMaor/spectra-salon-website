import React from "react";
import { motion } from "framer-motion";
import { Section, Eyebrow, Headline } from "../primitives";
import { AgentCard, type GlyphName } from "../visuals";
import { WORKFORCE } from "../copy";
import { COLORS, TYPE } from "../tokens";
import { staggerContainer, staggerItem, fadeOnly, VIEWPORT_ONCE } from "../motion";

interface SectionComponentProps {
  reducedMotion?: boolean;
}

const AGENT_GLYPHS: GlyphName[] = [
  "agent-customer-success",
  "agent-marketing",
  "agent-inventory",
  "agent-operations",
  "agent-bi",
  "agent-spectra",
];

/** Section 6 — The AI Workforce. A digital workforce, working live. */
export const AIWorkforceSection: React.FC<SectionComponentProps> = ({
  reducedMotion = false,
}) => {
  return (
    <Section id="workforce" reducedMotion={reducedMotion} aria-label="The AI workforce">
      <div className="text-center mb-14">
        <Eyebrow className="mb-8">{WORKFORCE.eyebrow}</Eyebrow>
        <Headline lines={[WORKFORCE.headline]} size="h1" reducedMotion={reducedMotion} />
        <p className="mt-5" style={{ fontSize: TYPE.body, color: COLORS.textDim }}>
          {WORKFORCE.subhead}
        </p>
      </div>

      <motion.ul
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 list-none mb-14"
        variants={reducedMotion ? fadeOnly : staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
      >
        {WORKFORCE.agents.map((agent, i) => (
          <motion.li key={agent.name} variants={reducedMotion ? fadeOnly : staggerItem}>
            <AgentCard
              name={agent.name}
              task={agent.task}
              glyph={AGENT_GLYPHS[i]}
              index={i}
              reducedMotion={reducedMotion}
            />
          </motion.li>
        ))}
      </motion.ul>

      <p className="text-center" style={{ fontSize: TYPE.h2, fontWeight: 500, color: COLORS.warmWhite }}>
        {WORKFORCE.closing}
      </p>
    </Section>
  );
};
