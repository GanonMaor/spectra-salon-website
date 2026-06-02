import React from "react";
import { INV } from "../tokens";
import { InvestorSection, InvestorEyebrow, InvestorHeadline, InvestorCopy, GlassPanel } from "../primitives";
import { NETWORK } from "../copy";

export const SalonNetworkSection: React.FC = () => {
  return (
    <InvestorSection id="salon-network" aria-label="The Salon Network" width="wide">
      <div className="max-w-3xl mb-12">
        <InvestorEyebrow className="mb-6">{NETWORK.eyebrow}</InvestorEyebrow>
        <InvestorHeadline size="h1" className="mb-4">
          {NETWORK.headline}
        </InvestorHeadline>
        <InvestorCopy size="lg" muted>
          {NETWORK.subhead}
        </InvestorCopy>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-12">
        {NETWORK.roles.map((role) => (
          <GlassPanel key={role.label} className="p-6">
            <div className="text-base font-medium mb-1" style={{ color: INV.text }}>
              {role.label}
            </div>
            <div className="text-sm font-light leading-relaxed" style={{ color: INV.textMuted }}>
              {role.note}
            </div>
          </GlassPanel>
        ))}
      </div>

      <p className="text-2xl sm:text-3xl font-light max-w-3xl" style={{ color: INV.gold }}>
        {NETWORK.insight}
      </p>
    </InvestorSection>
  );
};
