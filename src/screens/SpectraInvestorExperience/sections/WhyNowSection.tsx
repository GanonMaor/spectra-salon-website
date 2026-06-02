import React from "react";
import { INV } from "../tokens";
import { InvestorSection, InvestorEyebrow, InvestorHeadline, InvestorCopy, GlassPanel } from "../primitives";
import { WHY_NOW } from "../copy";

export const WhyNowSection: React.FC = () => {
  return (
    <InvestorSection id="why-now" aria-label="Why now" width="wide">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <div className="flex justify-center mb-6">
          <InvestorEyebrow>{WHY_NOW.eyebrow}</InvestorEyebrow>
        </div>
        <InvestorHeadline size="h1" className="mb-4">
          {WHY_NOW.headline}
        </InvestorHeadline>
        <InvestorCopy size="lg" muted>
          {WHY_NOW.subhead}
        </InvestorCopy>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        {WHY_NOW.trends.map((trend) => (
          <GlassPanel key={trend.title} className="p-7">
            <div className="text-lg font-medium mb-3" style={{ color: INV.text }}>
              {trend.title}
            </div>
            <div className="text-sm font-light leading-relaxed" style={{ color: INV.textSecondary }}>
              {trend.detail}
            </div>
          </GlassPanel>
        ))}
      </div>

      <p className="text-center text-2xl sm:text-3xl font-light max-w-2xl mx-auto" style={{ color: INV.gold }}>
        {WHY_NOW.closing}
      </p>
    </InvestorSection>
  );
};
