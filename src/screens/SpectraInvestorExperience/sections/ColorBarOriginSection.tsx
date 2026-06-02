import React from "react";
import { INV } from "../tokens";
import { InvestorSection, InvestorEyebrow, InvestorHeadline, InvestorCopy } from "../primitives";
import { COLOR_BAR } from "../copy";

export const ColorBarOriginSection: React.FC = () => {
  return (
    <InvestorSection id="color-bar" aria-label="We started at the color bar" width="wide">
      <div className="max-w-3xl mb-8">
        <InvestorEyebrow className="mb-5">{COLOR_BAR.eyebrow}</InvestorEyebrow>
        <InvestorHeadline size="h1" className="mb-4">
          {COLOR_BAR.headline}
        </InvestorHeadline>
        <InvestorCopy size="lg">{COLOR_BAR.subhead}</InvestorCopy>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* Photo with the "never knew" list overlaid */}
        <div
          className="relative rounded-2xl overflow-hidden min-h-[300px] bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(20,16,13,0.25) 0%, rgba(20,16,13,0.86) 100%), url('/investor-vision/hero/salon-story-colorist.jpg')",
            border: `1px solid ${INV.border}`,
          }}
        >
          <div className="absolute inset-x-0 bottom-0 p-6">
            <div className="text-xs uppercase tracking-[0.16em] mb-3" style={{ color: "rgba(251,246,239,0.78)" }}>
              {COLOR_BAR.context}
            </div>
            <ul className="space-y-1.5">
              {COLOR_BAR.unknowns.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm font-light" style={{ color: INV.textOnDark }}>
                  <span className="mt-2 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: INV.gold }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Spectra CI capabilities */}
        <div>
          <p className="text-base font-light mb-4" style={{ color: INV.text }}>
            {COLOR_BAR.builtLine}
          </p>
          <div className="space-y-2.5">
            {COLOR_BAR.cards.map((card) => (
              <div
                key={card.title}
                className="rounded-xl px-4 py-3 flex items-baseline gap-3"
                style={{ background: INV.glassStrong, border: `1px solid ${INV.border}` }}
              >
                <span className="w-1.5 h-1.5 rounded-full shrink-0 translate-y-1.5" style={{ background: INV.gold }} />
                <div>
                  <span className="text-sm font-medium" style={{ color: INV.text }}>{card.title}</span>
                  <span className="text-sm font-light" style={{ color: INV.textMuted }}> — {card.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-8 text-xl sm:text-2xl font-light max-w-3xl" style={{ color: INV.gold }}>
        {COLOR_BAR.closing}
      </p>
    </InvestorSection>
  );
};
