import React from "react";
import { INV } from "../tokens";
import { InvestorSection, InvestorEyebrow, InvestorHeadline, InvestorCopy } from "../primitives";
import { FragmentedSystems } from "../visuals/FragmentedSystems";
import { LEARNED } from "../copy";

const SYSTEMS = ["Booking", "CRM", "Inventory", "POS", "Color"];

export const WhatWeLearnedSection: React.FC = () => {
  return (
    <InvestorSection id="what-we-learned" aria-label="What we learned" width="wide">
      <div className="max-w-3xl mb-8">
        <InvestorEyebrow className="mb-5">{LEARNED.eyebrow}</InvestorEyebrow>
        <InvestorHeadline size="h1" className="mb-4">
          {LEARNED.headline}
        </InvestorHeadline>
        <InvestorCopy size="lg">{LEARNED.subhead}</InvestorCopy>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <FragmentedSystems systems={SYSTEMS} centerLabel="No shared intelligence" />

        <div>
          <div className="space-y-3 mb-6">
            {LEARNED.timeline.map((phase, i) => (
              <div
                key={phase.phase}
                className="rounded-xl px-4 py-3"
                style={{ background: INV.glassStrong, border: `1px solid ${INV.border}` }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium"
                    style={{ background: "rgba(193,154,99,0.12)", border: `1px solid rgba(193,154,99,0.4)`, color: INV.gold }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium" style={{ color: INV.text }}>{phase.phase}</span>
                </div>
                <p className="text-xs font-light" style={{ color: INV.textMuted }}>
                  {phase.items.join(" · ")}
                </p>
              </div>
            ))}
          </div>
          <p className="text-lg font-light" style={{ color: INV.text }}>
            {LEARNED.reveal}
          </p>
        </div>
      </div>

      <p className="mt-8 text-2xl sm:text-3xl font-light max-w-3xl" style={{ color: INV.gold }}>
        {LEARNED.transition}
      </p>
    </InvestorSection>
  );
};
