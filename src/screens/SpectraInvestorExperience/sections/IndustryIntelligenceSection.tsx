import React from "react";
import { INV } from "../tokens";
import { InvestorSection, InvestorEyebrow, InvestorHeadline, InvestorCopy } from "../primitives";
import { SignalGraph } from "../visuals/SignalGraph";
import { INDUSTRY } from "../copy";

export const IndustryIntelligenceSection: React.FC = () => {
  return (
    <InvestorSection id="industry-intelligence" aria-label="Industry intelligence — the data becomes monetizable" width="wide">
      <div className="max-w-3xl mb-8">
        <InvestorEyebrow dark className="mb-5">{INDUSTRY.eyebrow}</InvestorEyebrow>
        <InvestorHeadline dark size="h1" className="mb-4">
          {INDUSTRY.headline}
        </InvestorHeadline>
        <InvestorCopy dark size="lg">
          {INDUSTRY.subhead}
        </InvestorCopy>
      </div>

      <div className="mb-10">
        <SignalGraph
          dark
          chain={["Salon Activity", "Product Use", "Formulas", "Reorders", "Regional Demand"]}
          resultLabel="Beauty Market Intelligence"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-10">
        {INDUSTRY.examples.map((ex) => (
          <div
            key={ex.label}
            className="rounded-xl p-5"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            <div className="text-sm font-medium mb-1" style={{ color: INV.textOnDark }}>
              {ex.label}
            </div>
            <div className="text-xs font-light leading-relaxed" style={{ color: INV.textOnDarkSoft }}>
              {ex.detail}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <span className="text-xs uppercase tracking-[0.14em]" style={{ color: INV.textOnDarkSoft }}>
          Relevant to
        </span>
        {INDUSTRY.brands.map((brand) => (
          <span
            key={brand}
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(193,154,99,0.35)", color: INV.textOnDark }}
          >
            {brand}
          </span>
        ))}
      </div>

      <p className="text-2xl sm:text-3xl font-light max-w-3xl" style={{ color: INV.gold }}>
        {INDUSTRY.closing}
      </p>
    </InvestorSection>
  );
};
