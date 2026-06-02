import React from "react";
import { INV } from "../tokens";
import { InvestorSection, InvestorEyebrow, InvestorHeadline, InvestorCopy, GradientText, GlassPanel } from "../primitives";
import { SPECTRA_TODAY } from "../copy";

export const SpectraTodaySection: React.FC = () => {
  return (
    <InvestorSection id="spectra-today" aria-label="Spectra Today — traction proof" width="wide" tone="soft">
      <div className="text-center mb-14">
        <div className="flex justify-center mb-6">
          <InvestorEyebrow>{SPECTRA_TODAY.eyebrow}</InvestorEyebrow>
        </div>
        <InvestorHeadline size="h1" className="mb-4">
          This is <GradientText>already real.</GradientText>
        </InvestorHeadline>
        <InvestorCopy size="lg" muted>
          {SPECTRA_TODAY.subhead}
        </InvestorCopy>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {SPECTRA_TODAY.kpis.map((kpi) => (
          <GlassPanel key={kpi.label} className="text-center p-8">
            <div
              className="text-4xl sm:text-5xl font-light mb-2"
              style={{
                backgroundImage: `linear-gradient(90deg, ${INV.gold}, ${INV.goldDeep})`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {kpi.value}
            </div>
            <div className="text-sm font-medium mb-1" style={{ color: INV.text }}>
              {kpi.label}
            </div>
            <div className="text-xs font-light" style={{ color: INV.textMuted }}>
              {kpi.note}
            </div>
          </GlassPanel>
        ))}
      </div>

      <p className="text-center mt-10 text-xs uppercase tracking-[0.12em]" style={{ color: INV.textFaint }}>
        {SPECTRA_TODAY.footnote}
      </p>
    </InvestorSection>
  );
};
