import React from "react";
import { Section, Eyebrow, Headline } from "../primitives";
import { SystemChips } from "../visuals";
import { PROBLEM } from "../copy";
import { COLORS, TYPE } from "../tokens";

interface SectionComponentProps {
  reducedMotion?: boolean;
}

/** Section 2 — The Problem. Disconnected systems, no intelligence. */
export const ProblemSection: React.FC<SectionComponentProps> = ({
  reducedMotion = false,
}) => {
  return (
    <Section id="problem" reducedMotion={reducedMotion} aria-label="The problem">
      <div className="text-center">
        <Eyebrow className="mb-10">{PROBLEM.eyebrow}</Eyebrow>

        {/* Disconnected systems, slowly pulled toward the center (code-only). */}
        <SystemChips reducedMotion={reducedMotion} />

        <p className="mb-10 mt-2" style={{ fontSize: TYPE.body, color: COLORS.textDim }}>
          {PROBLEM.transition}
        </p>

        <Headline
          lines={PROBLEM.headlineLines}
          size="h1"
          align="center"
          reducedMotion={reducedMotion}
        />

        <div className="mt-12 space-y-1">
          <p style={{ fontSize: TYPE.h2, fontWeight: 300, color: COLORS.textMuted }}>
            {PROBLEM.closing}
          </p>
          <p
            style={{
              fontSize: TYPE.h2,
              fontWeight: 500,
              backgroundImage: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.gold4})`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {PROBLEM.closingEmphasis}
          </p>
        </div>
      </div>
    </Section>
  );
};
