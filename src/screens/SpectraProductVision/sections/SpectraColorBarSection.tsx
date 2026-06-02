import React from "react";
import { Section, Eyebrow, Headline } from "../primitives";
import { ColorBarMoment, SalonAtmosphere, type GlyphName } from "../visuals";
import { SPECTRA } from "../copy";
import { COLORS, TYPE } from "../tokens";

interface SectionComponentProps {
  reducedMotion?: boolean;
}

const CAPTURES = SPECTRA.captures.map((c) => ({
  label: c.label,
  glyph: c.glyph as GlyphName,
  value: c.value,
}));

/** Section 4.5 — The Color Bar moment. Why Spectra is the unique data engine. */
export const SpectraColorBarSection: React.FC<SectionComponentProps> = ({
  reducedMotion = false,
}) => {
  return (
    <Section
      id="colorbar"
      reducedMotion={reducedMotion}
      aria-label="The color bar"
      backdrop={
        <>
          <SalonAtmosphere variant="mirror" reducedMotion={reducedMotion} />
          <SalonAtmosphere variant="products" reducedMotion={reducedMotion} />
        </>
      }
    >
      <div className="text-center mb-12">
        <Eyebrow className="mb-8">{SPECTRA.eyebrow}</Eyebrow>
        <Headline lines={[SPECTRA.headline]} size="h1" reducedMotion={reducedMotion} />
        <p className="mx-auto mt-6" style={{ fontSize: TYPE.body, color: COLORS.textMuted, maxWidth: 660 }}>
          {SPECTRA.subhead}
        </p>
      </div>

      <ColorBarMoment captures={CAPTURES} reducedMotion={reducedMotion} />

      <p
        className="text-center mx-auto mt-14"
        style={{
          maxWidth: 720,
          fontSize: TYPE.h2,
          fontWeight: 600,
          backgroundImage: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.gold4})`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        {SPECTRA.takeaway}
      </p>
    </Section>
  );
};
