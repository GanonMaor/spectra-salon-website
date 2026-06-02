import React from "react";
import { Section, Eyebrow, Headline } from "../primitives";
import { JourneyPath } from "../visuals";
import { JOURNEY } from "../copy";

interface SectionComponentProps {
  reducedMotion?: boolean;
}

/** Section 4 — The Customer Journey. One visit becomes a stream of data. */
export const CustomerJourneySection: React.FC<SectionComponentProps> = ({
  reducedMotion = false,
}) => {
  return (
    <Section id="journey" reducedMotion={reducedMotion} aria-label="The customer journey">
      <div className="text-center mb-14">
        <Eyebrow className="mb-8">{JOURNEY.eyebrow}</Eyebrow>
        <Headline lines={[JOURNEY.headline]} size="h1" reducedMotion={reducedMotion} />
      </div>

      {/* Data path: each step emits a glowing point flowing to the Salon AI core. */}
      <div className="mb-16">
        <JourneyPath reducedMotion={reducedMotion} />
      </div>

      <div className="text-center">
        <Headline
          lines={[JOURNEY.climax]}
          size="h1"
          emphasizeLast
          reducedMotion={reducedMotion}
        />
      </div>
    </Section>
  );
};
