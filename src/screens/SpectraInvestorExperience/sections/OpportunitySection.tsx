import React from "react";
import { INV } from "../tokens";
import { InvestorSection, InvestorEyebrow, InvestorHeadline, InvestorCopy, GradientText } from "../primitives";
import { OPPORTUNITY } from "../copy";

const WIDTHS = ["100%", "76%", "54%", "34%"];

export const OpportunitySection: React.FC = () => {
  return (
    <InvestorSection id="opportunity" aria-label="The market opportunity" width="wide" tone="soft">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Copy */}
        <div>
          <InvestorEyebrow className="mb-6">{OPPORTUNITY.eyebrow}</InvestorEyebrow>
          <InvestorHeadline size="h1" className="mb-3">
            {OPPORTUNITY.headline}
          </InvestorHeadline>
          <p className="text-2xl sm:text-3xl font-light leading-snug mb-8">
            <GradientText>{OPPORTUNITY.subheadAccent}</GradientText>
          </p>
          <InvestorCopy muted>{OPPORTUNITY.insight}</InvestorCopy>
        </div>

        {/* Stack */}
        <div className="space-y-2">
          {OPPORTUNITY.stack.map((layer, i) => (
            <div key={layer.label} style={{ width: WIDTHS[i] }}>
              <div
                className="flex items-center justify-between gap-3 px-5 py-4 rounded-xl"
                style={{
                  background: `rgba(193,154,99,${0.06 + i * 0.07})`,
                  border: `1px solid rgba(193,154,99,0.25)`,
                }}
              >
                <span className="text-sm font-medium" style={{ color: i === 3 ? INV.gold : INV.text }}>
                  {layer.label}
                </span>
                <span className="text-xs font-light text-right" style={{ color: INV.textMuted }}>
                  {layer.scale}
                </span>
              </div>
            </div>
          ))}
          <p className="text-sm font-medium uppercase tracking-[0.08em] pt-2" style={{ color: INV.gold }}>
            ↑ Entry point today
          </p>
        </div>
      </div>
    </InvestorSection>
  );
};
