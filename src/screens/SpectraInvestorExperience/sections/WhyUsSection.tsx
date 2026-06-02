import React from "react";
import { INV } from "../tokens";
import { InvestorSection, InvestorEyebrow, InvestorHeadline, InvestorCopy, GlassPanel, GradientText } from "../primitives";
import { WHY_US } from "../copy";

export const WhyUsSection: React.FC = () => {
  const { traditional, spectra } = WHY_US.contrast;

  return (
    <InvestorSection id="why-us" aria-label="Why Spectra has a unique right to win" width="wide" tone="soft">
      <div className="max-w-3xl mb-14">
        <InvestorEyebrow className="mb-6">{WHY_US.eyebrow}</InvestorEyebrow>
        <InvestorHeadline size="h1" className="mb-4">
          {WHY_US.headline}
        </InvestorHeadline>
        <p className="text-2xl sm:text-3xl font-light leading-snug">
          <GradientText>{WHY_US.subheadAccent}</GradientText>
        </p>
      </div>

      {/* Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        {/* Traditional */}
        <GlassPanel className="p-7">
          <div className="text-xs uppercase tracking-[0.16em] mb-5" style={{ color: INV.textMuted }}>
            {traditional.label}
          </div>
          <Steps steps={traditional.steps} accent={false} />
          <p className="mt-5 pt-4 text-sm font-light italic" style={{ color: INV.textMuted, borderTop: `1px solid ${INV.border}` }}>
            {traditional.direction}
          </p>
        </GlassPanel>

        {/* Spectra */}
        <GlassPanel highlight className="p-7">
          <div className="text-xs uppercase tracking-[0.16em] mb-5" style={{ color: INV.gold }}>
            {spectra.label}
          </div>
          <Steps steps={spectra.steps} accent />
          <p className="mt-5 pt-4 text-sm font-light italic" style={{ color: INV.gold, borderTop: `1px solid rgba(193,154,99,0.2)` }}>
            {spectra.direction}
          </p>
        </GlassPanel>
      </div>

      <div className="max-w-3xl">
        <InvestorCopy size="lg" className="mb-6">
          {WHY_US.insight}
        </InvestorCopy>
        <p className="text-xl font-light" style={{ color: INV.gold }}>
          {WHY_US.closing}
        </p>
      </div>
    </InvestorSection>
  );
};

const Steps: React.FC<{ steps: readonly string[]; accent: boolean }> = ({ steps, accent }) => (
  <div className="space-y-2">
    {steps.map((step, i) => (
      <React.Fragment key={step}>
        <div
          className="px-4 py-2.5 rounded-lg text-sm font-medium"
          style={{
            background: accent ? "rgba(193,154,99,0.12)" : "rgba(43,34,27,0.04)",
            border: `1px solid ${accent ? "rgba(193,154,99,0.25)" : INV.border}`,
            color: accent ? INV.text : INV.textSecondary,
          }}
        >
          {step}
        </div>
        {i < steps.length - 1 && (
          <div className="text-center text-base leading-none" style={{ color: accent ? INV.gold : INV.textFaint }}>
            ↓
          </div>
        )}
      </React.Fragment>
    ))}
  </div>
);
