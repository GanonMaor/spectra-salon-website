import React from "react";
import { INV } from "../tokens";
import { InvestorSection, InvestorEyebrow, InvestorHeadline, InvestorCopy, GlassPanel, GradientText } from "../primitives";
import { RadialDiagram, RadialNode } from "../visuals/RadialDiagram";
import { GlyphName } from "../visuals/Glyph";
import { SALON_OS } from "../copy";

const GLYPHS: GlyphName[] = ["calendar", "bowl", "scale", "inventory", "payment", "profit", "retention"];

export const SalonOSSection: React.FC = () => {
  const nodes: RadialNode[] = SALON_OS.flow.map((step, i) => ({
    label: step.label,
    note: step.note,
    glyph: GLYPHS[i % GLYPHS.length],
  }));

  return (
    <InvestorSection id="salonos" aria-label="Building SalonOS — the operating system" width="wide" tone="soft">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div>
          <InvestorEyebrow className="mb-5">{SALON_OS.eyebrow}</InvestorEyebrow>
          <InvestorHeadline size="h1" className="mb-1">
            {SALON_OS.headlineLine1}
          </InvestorHeadline>
          <InvestorHeadline size="h1" className="mb-5">
            <GradientText>{SALON_OS.headlineLine2}</GradientText>
          </InvestorHeadline>
          <InvestorCopy size="lg" muted className="mb-6">
            {SALON_OS.subhead}
          </InvestorCopy>
          <GlassPanel highlight className="p-6">
            <p className="text-xl sm:text-2xl font-light" style={{ color: INV.gold }}>
              {SALON_OS.closing}
            </p>
          </GlassPanel>
        </div>

        <RadialDiagram centerLabel="SalonOS" centerSub="One connected loop" nodes={nodes} />
      </div>
    </InvestorSection>
  );
};
