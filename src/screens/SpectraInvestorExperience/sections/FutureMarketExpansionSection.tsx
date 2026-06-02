import React from "react";
import { INV } from "../tokens";
import { InvestorSection, InvestorEyebrow, InvestorHeadline, InvestorCopy, GlassPanel, GradientText } from "../primitives";
import { EXPANSION } from "../copy";

export const FutureMarketExpansionSection: React.FC = () => {
  return (
    <InvestorSection id="market-expansion" aria-label="Future market expansion beyond hair salons" width="wide" tone="soft">
      <div className="max-w-3xl mb-12">
        <InvestorEyebrow className="mb-6">{EXPANSION.eyebrow}</InvestorEyebrow>
        <InvestorHeadline size="h1" className="mb-1">
          {EXPANSION.headline}
        </InvestorHeadline>
        <InvestorHeadline size="h1" className="mb-6">
          <GradientText>{EXPANSION.subheadAccent}</GradientText>
        </InvestorHeadline>
        <InvestorCopy muted>{EXPANSION.context}</InvestorCopy>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        {EXPANSION.markets.map((market, i) => (
          <GlassPanel key={market.label} highlight={i === 0} className="p-5">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="text-sm font-medium" style={{ color: i === 0 ? INV.gold : INV.text }}>
                {market.label}
              </div>
              {i === 0 && (
                <span
                  className="px-2 py-0.5 rounded-full text-[9px] font-semibold"
                  style={{ background: INV.gold, color: "#000" }}
                >
                  NOW
                </span>
              )}
            </div>
            <div className="text-xs font-light leading-relaxed" style={{ color: INV.textMuted }}>
              {market.note}
            </div>
          </GlassPanel>
        ))}
      </div>

      <p className="text-sm font-light italic mb-6" style={{ color: INV.textMuted }}>
        {EXPANSION.disclaimer}
      </p>

      <p className="text-2xl sm:text-3xl font-light max-w-3xl" style={{ color: INV.gold }}>
        {EXPANSION.closing}
      </p>
    </InvestorSection>
  );
};
