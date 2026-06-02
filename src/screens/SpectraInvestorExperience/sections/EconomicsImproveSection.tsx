import React from "react";
import { INV } from "../tokens";
import { InvestorSection, InvestorEyebrow, InvestorHeadline, InvestorCopy, GlassPanel } from "../primitives";
import { RevenueLadderChart } from "../visuals/RevenueLadderChart";
import { ECONOMICS } from "../copy";

const LADDER_VALUES: Record<string, number> = {
  "Spectra CI": 960,
  SalonOS: 1920,
  "Salon AI": 6000,
};

export const EconomicsImproveSection: React.FC = () => {
  const bars = ECONOMICS.ladder.map((row) => ({
    stage: row.stage,
    value: LADDER_VALUES[row.stage] ?? 0,
    display: row.arpu,
  }));

  return (
    <InvestorSection id="economics" aria-label="The economics improve" width="wide">
      <div className="max-w-3xl mb-8">
        <InvestorEyebrow className="mb-5">{ECONOMICS.eyebrow}</InvestorEyebrow>
        <InvestorHeadline size="h2" className="mb-3">
          {ECONOMICS.headline}
        </InvestorHeadline>
        <InvestorCopy muted>{ECONOMICS.subhead}</InvestorCopy>
      </div>

      {/* Chart + takeaways */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6 items-stretch">
        <GlassPanel className="lg:col-span-3 p-6 sm:p-8 flex flex-col justify-center">
          <div className="text-xs uppercase tracking-[0.16em] mb-4" style={{ color: INV.gold }}>
            Annual Revenue Per Salon
          </div>
          <RevenueLadderChart bars={bars} />
        </GlassPanel>

        <div className="lg:col-span-2 flex flex-col justify-center gap-2.5">
          {ECONOMICS.takeaways.map((t) => (
            <div
              key={t}
              className="inline-flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-light"
              style={{ background: "rgba(193,154,99,0.08)", border: `1px solid rgba(193,154,99,0.2)`, color: INV.text }}
            >
              <span style={{ color: INV.success }}>✓</span>
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* Marketing + Unit economics — compact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassPanel className="p-6">
          <div className="text-xs uppercase tracking-[0.16em] mb-2" style={{ color: INV.gold }}>
            {ECONOMICS.marketing.headline}
          </div>
          <InvestorCopy size="small">{ECONOMICS.marketing.insight}</InvestorCopy>
        </GlassPanel>
        <GlassPanel className="p-6">
          <div className="text-xs uppercase tracking-[0.16em] mb-2" style={{ color: INV.gold }}>
            {ECONOMICS.unitEcon.headline}
          </div>
          <InvestorCopy size="small">{ECONOMICS.unitEcon.insight}</InvestorCopy>
        </GlassPanel>
      </div>
    </InvestorSection>
  );
};
