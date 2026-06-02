import React from "react";
import { INV } from "../tokens";
import { InvestorSection, InvestorEyebrow, InvestorHeadline, InvestorCopy, GlassPanel, GradientText } from "../primitives";
import { SALON_OS } from "../copy";

export const SalonOSSection: React.FC = () => {
  return (
    <InvestorSection id="salonos" aria-label="Building SalonOS — the operating system" width="wide" tone="soft">
      <div className="max-w-3xl mb-14">
        <InvestorEyebrow className="mb-6">{SALON_OS.eyebrow}</InvestorEyebrow>
        <InvestorHeadline size="h1" className="mb-2">
          {SALON_OS.headlineLine1}
        </InvestorHeadline>
        <InvestorHeadline size="h1" className="mb-6">
          <GradientText>{SALON_OS.headlineLine2}</GradientText>
        </InvestorHeadline>
        <InvestorCopy size="lg" muted>
          {SALON_OS.subhead}
        </InvestorCopy>
      </div>

      {/* Connected workflow */}
      <div className="flex flex-wrap items-center gap-3 mb-12">
        {SALON_OS.flow.map((step, i) => (
          <React.Fragment key={step.label}>
            <div
              className="px-5 py-3 rounded-xl"
              style={{ background: INV.bgCard, border: `1px solid ${INV.border}` }}
            >
              <div className="text-sm font-medium" style={{ color: INV.text }}>
                {step.label}
              </div>
              <div className="text-xs font-light" style={{ color: INV.textMuted }}>
                {step.note}
              </div>
            </div>
            {i < SALON_OS.flow.length - 1 && (
              <span className="text-lg" style={{ color: INV.gold }}>→</span>
            )}
          </React.Fragment>
        ))}
      </div>

      <GlassPanel highlight className="p-7 max-w-3xl">
        <p className="text-xl sm:text-2xl font-light" style={{ color: INV.gold }}>
          {SALON_OS.closing}
        </p>
      </GlassPanel>
    </InvestorSection>
  );
};
