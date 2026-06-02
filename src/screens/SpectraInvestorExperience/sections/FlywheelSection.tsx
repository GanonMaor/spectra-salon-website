import React from "react";
import { INV } from "../tokens";
import { InvestorSection, InvestorEyebrow, InvestorHeadline, InvestorCopy } from "../primitives";
import { FLYWHEEL } from "../copy";

export const FlywheelSection: React.FC = () => {
  return (
    <InvestorSection id="flywheel" aria-label="The data network flywheel" width="wide">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <div className="flex justify-center mb-6">
          <InvestorEyebrow>{FLYWHEEL.eyebrow}</InvestorEyebrow>
        </div>
        <InvestorHeadline size="h1" className="mb-4">
          {FLYWHEEL.headline}
        </InvestorHeadline>
        <InvestorCopy size="lg" muted>
          {FLYWHEEL.subhead}
        </InvestorCopy>
      </div>

      {/* The loop, as a clean readable sequence */}
      <div className="flex flex-wrap items-stretch justify-center gap-3 mb-12">
        {FLYWHEEL.steps.map((step, i) => (
          <React.Fragment key={step.label}>
            <div
              className="rounded-2xl p-5 w-[180px]"
              style={{ background: INV.bgCard, border: `1px solid ${INV.border}` }}
            >
              <div className="text-sm font-medium mb-1" style={{ color: INV.text }}>
                {step.label}
              </div>
              <div className="text-xs font-light leading-relaxed" style={{ color: INV.textMuted }}>
                {step.detail}
              </div>
            </div>
            <div className="flex items-center text-lg" style={{ color: INV.gold }}>
              →
            </div>
          </React.Fragment>
        ))}
        {/* Loop back label */}
        <div className="flex items-center">
          <span
            className="px-4 py-2 rounded-full text-xs font-medium uppercase tracking-[0.12em]"
            style={{ background: "rgba(193,154,99,0.1)", border: `1px solid rgba(193,154,99,0.3)`, color: INV.gold }}
          >
            {FLYWHEEL.center}
          </span>
        </div>
      </div>

      <p className="text-center text-2xl sm:text-3xl font-light max-w-2xl mx-auto" style={{ color: INV.textSecondary }}>
        {FLYWHEEL.closing}
      </p>
    </InvestorSection>
  );
};
