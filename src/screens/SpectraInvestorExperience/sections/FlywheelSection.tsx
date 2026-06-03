import React from "react";
import { INV } from "../tokens";
import { InvestorSection, InvestorEyebrow, InvestorHeadline, InvestorCopy } from "../primitives";
import { RadialDiagram, RadialNode } from "../visuals/RadialDiagram";
import { NetworkConstellation } from "../visuals/NetworkConstellation";
import { GlyphName } from "../visuals/Glyph";
import { FLYWHEEL } from "../copy";

const STEP_GLYPHS: GlyphName[] = ["owner", "data", "ai", "profit", "retention", "payment"];

export const FlywheelSection: React.FC = () => {
  const nodes: RadialNode[] = FLYWHEEL.steps.map((step, i) => ({
    label: step.label,
    note: step.detail,
    glyph: STEP_GLYPHS[i % STEP_GLYPHS.length],
  }));

  return (
    <InvestorSection id="flywheel" aria-label="The data network flywheel" width="wide">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="flex justify-center mb-5">
          <InvestorEyebrow>{FLYWHEEL.eyebrow}</InvestorEyebrow>
        </div>
        <InvestorHeadline size="h1" className="mb-3">
          {FLYWHEEL.headline}
        </InvestorHeadline>
        <InvestorCopy size="lg" muted>
          {FLYWHEEL.subhead}
        </InvestorCopy>
      </div>

      <div className="relative max-w-[480px] mx-auto mb-8">
        <NetworkConstellation dark={false} className="absolute inset-0 w-full h-full opacity-50" />
        <RadialDiagram centerLabel={FLYWHEEL.center} centerSub="Compounds with scale" nodes={nodes} />
      </div>

      <p className="text-center text-2xl sm:text-3xl font-light max-w-2xl mx-auto" style={{ color: INV.textSecondary }}>
        {FLYWHEEL.closing}
      </p>
    </InvestorSection>
  );
};
