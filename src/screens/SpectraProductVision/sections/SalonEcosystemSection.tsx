import React from "react";
import { Section, Eyebrow, Headline } from "../primitives";
import { EcosystemMap, SalonAtmosphere } from "../visuals";
import { ECOSYSTEM } from "../copy";
import { COLORS, TYPE } from "../tokens";

interface SectionComponentProps {
  reducedMotion?: boolean;
}

/** Section 3 — The Salon Ecosystem. Roles, connections, activity. */
export const SalonEcosystemSection: React.FC<SectionComponentProps> = ({
  reducedMotion = false,
}) => {
  return (
    <Section
      id="ecosystem"
      reducedMotion={reducedMotion}
      aria-label="The salon ecosystem"
      backdrop={<SalonAtmosphere variant="silhouettes" reducedMotion={reducedMotion} />}
    >
      <div className="text-center mb-12">
        <Eyebrow className="mb-8">{ECOSYSTEM.eyebrow}</Eyebrow>
        <Headline lines={[ECOSYSTEM.headline]} size="h1" reducedMotion={reducedMotion} />
        <p className="mt-5" style={{ fontSize: TYPE.body, color: COLORS.textDim }}>
          {ECOSYSTEM.subhead}
        </p>
      </div>

      {/* Abstract salon map: labeled role nodes + animated connection lines. */}
      <EcosystemMap reducedMotion={reducedMotion} />

      <div className="text-center mt-12">
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 list-none mb-8">
          {ECOSYSTEM.ticker.map((line) => (
            <li key={line} style={{ fontSize: TYPE.small, color: COLORS.textMuted }}>
              {line}
            </li>
          ))}
        </ul>
        <p
          style={{
            fontSize: TYPE.h2,
            fontWeight: 500,
            color: COLORS.warmWhite,
          }}
        >
          {ECOSYSTEM.closing}
        </p>
      </div>
    </Section>
  );
};
