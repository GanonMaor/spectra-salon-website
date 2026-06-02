import React from "react";
import { INV } from "../tokens";
import { InvestorSection, InvestorEyebrow, InvestorHeadline, InvestorCopy, GlassPanel } from "../primitives";
import { BEYOND } from "../copy";

export const BeyondSoftwareSection: React.FC = () => {
  return (
    <InvestorSection id="beyond-software" aria-label="Three revenue engines — beyond software" width="wide" tone="soft">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <div className="flex justify-center mb-6">
          <InvestorEyebrow>{BEYOND.eyebrow}</InvestorEyebrow>
        </div>
        <InvestorHeadline size="h1" className="mb-4">
          {BEYOND.headline}
        </InvestorHeadline>
        <InvestorCopy size="lg" muted>
          {BEYOND.subhead}
        </InvestorCopy>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        {BEYOND.engines.map((engine) => (
          <GlassPanel key={engine.number} className="p-7">
            <div className="text-xs font-semibold tracking-[0.2em] mb-4" style={{ color: INV.gold }}>
              {engine.number}
            </div>
            <div className="text-xl font-light mb-3" style={{ color: INV.text }}>
              {engine.title}
            </div>
            <div className="text-sm font-light leading-relaxed" style={{ color: INV.textSecondary }}>
              {engine.detail}
            </div>
          </GlassPanel>
        ))}
      </div>

      <p className="text-center text-2xl sm:text-3xl font-light max-w-2xl mx-auto" style={{ color: INV.textSecondary }}>
        {BEYOND.closing}
      </p>
    </InvestorSection>
  );
};
