import React, { useMemo } from "react";
import { Section, Eyebrow, Headline } from "../primitives";
import { EvolutionCurve, SalonAtmosphere, type Milestone } from "../visuals";
import { EVOLUTION } from "../copy";
import { COLORS, TYPE } from "../tokens";

interface SectionComponentProps {
  reducedMotion?: boolean;
}

// Numeric targets for the count-up (last milestone is a range → text only).
const COUNT_TARGETS = [250, 450, 800, 1500, undefined];

/** Section 7 — Customer Evolution. ARPU expansion timeline. */
export const CustomerEvolutionSection: React.FC<SectionComponentProps> = ({
  reducedMotion = false,
}) => {
  const milestones = useMemo<Milestone[]>(
    () =>
      EVOLUTION.milestones.map((m, i) => ({
        year: m.year,
        label: m.label,
        products: m.products,
        display: m.value,
        count: COUNT_TARGETS[i],
        prefix: COUNT_TARGETS[i] != null ? "$" : undefined,
        suffix: COUNT_TARGETS[i] != null ? " / mo" : undefined,
      })),
    [],
  );

  return (
    <Section
      id="evolution"
      reducedMotion={reducedMotion}
      aria-label="Customer evolution"
      backdrop={<SalonAtmosphere variant="mirror" reducedMotion={reducedMotion} />}
    >
      <div className="text-center mb-4">
        <Eyebrow className="mb-8">{EVOLUTION.eyebrow}</Eyebrow>
        <Headline lines={[EVOLUTION.headline]} size="h1" reducedMotion={reducedMotion} />
        <p className="mt-5" style={{ fontSize: TYPE.body, color: COLORS.textDim }}>
          {EVOLUTION.subhead}
        </p>
      </div>

      {/* Rising MRR curve with count-up milestone values. */}
      <div className="my-14">
        <EvolutionCurve milestones={milestones} reducedMotion={reducedMotion} />
      </div>

      <div className="text-center">
        <p style={{ fontSize: TYPE.h2, fontWeight: 500, color: COLORS.warmWhite }}>
          {EVOLUTION.engineLine}
        </p>
        <p className="mt-3" style={{ fontSize: TYPE.small, color: COLORS.textDim }}>
          {EVOLUTION.footnote}
        </p>
      </div>
    </Section>
  );
};
