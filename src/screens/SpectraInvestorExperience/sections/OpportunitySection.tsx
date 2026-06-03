import React from "react";
import { INV } from "../tokens";
import { InvestorSection, InvestorEyebrow, InvestorHeadline, InvestorCopy, GradientText } from "../primitives";
import { ConcentricMarket } from "../visuals/ConcentricMarket";
import { OPPORTUNITY } from "../copy";

export const OpportunitySection: React.FC = () => {
  return (
    <InvestorSection id="opportunity" aria-label="The market opportunity" width="wide" tone="soft">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <InvestorEyebrow className="mb-5">{OPPORTUNITY.eyebrow}</InvestorEyebrow>
          <InvestorHeadline size="h1" className="mb-3">
            {OPPORTUNITY.headline}
          </InvestorHeadline>
          <p className="text-2xl sm:text-3xl font-light leading-snug mb-6">
            <GradientText>{OPPORTUNITY.subheadAccent}</GradientText>
          </p>

          <div className="flex flex-wrap gap-2 mb-5">
            <span className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: INV.goldSoft, border: `1px solid ${INV.borderSoft}`, color: INV.gold }}>
              {OPPORTUNITY.entry}
            </span>
            <span className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: INV.glassStrong, border: `1px solid ${INV.border}`, color: INV.text }}>
              {OPPORTUNITY.problem}
            </span>
          </div>

          <InvestorCopy muted className="mb-4">{OPPORTUNITY.insight}</InvestorCopy>
          <p className="text-[11px] font-light leading-relaxed" style={{ color: INV.textFaint }}>
            {OPPORTUNITY.sources}
          </p>
        </div>

        <ConcentricMarket tiers={[...OPPORTUNITY.tiers]} />
      </div>
    </InvestorSection>
  );
};
