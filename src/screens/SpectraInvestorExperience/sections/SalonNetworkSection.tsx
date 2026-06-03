import React from "react";
import { INV } from "../tokens";
import { InvestorSection, InvestorEyebrow, InvestorHeadline, InvestorCopy } from "../primitives";
import { RadialDiagram, RadialNode } from "../visuals/RadialDiagram";
import { GlyphName } from "../visuals/Glyph";
import { NETWORK } from "../copy";

const ROLE_GLYPHS: Record<string, GlyphName> = {
  Owners: "owner",
  Managers: "manager",
  Stylists: "stylist",
  Receptionists: "reception",
  Clients: "client",
};

export const SalonNetworkSection: React.FC = () => {
  const nodes: RadialNode[] = NETWORK.roles
    .filter((r) => r.label !== "AI")
    .map((r) => ({ label: r.label, note: r.note, glyph: ROLE_GLYPHS[r.label] }));

  return (
    <InvestorSection id="salon-network" aria-label="The Salon Network" width="wide">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div>
          <InvestorEyebrow className="mb-5">{NETWORK.eyebrow}</InvestorEyebrow>
          <InvestorHeadline size="h1" className="mb-4">
            {NETWORK.headline}
          </InvestorHeadline>
          <InvestorCopy size="lg" muted className="mb-6">
            {NETWORK.subhead}
          </InvestorCopy>
          <p className="text-xl sm:text-2xl font-light" style={{ color: INV.gold }}>
            {NETWORK.insight}
          </p>
        </div>

        <RadialDiagram centerLabel="Salon AI" centerSub="One environment" nodes={nodes} />
      </div>
    </InvestorSection>
  );
};
