import React from "react";
import { INV } from "../tokens";
import { InvestorSection, InvestorEyebrow, InvestorHeadline } from "../primitives";
import { Glyph, GlyphName } from "../visuals/Glyph";
import { COLOR_BAR } from "../copy";

const CAP_GLYPHS: GlyphName[] = ["scale", "inventory", "bowl", "profit", "calendar"];

export const ColorBarOriginSection: React.FC = () => {
  return (
    <InvestorSection id="color-bar" aria-label="We started at the color bar" width="wide">
      <div className="max-w-3xl mb-6">
        <InvestorEyebrow className="mb-4">{COLOR_BAR.eyebrow}</InvestorEyebrow>
        <InvestorHeadline size="h2">{COLOR_BAR.headline}</InvestorHeadline>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* THE PROBLEM — on the photo */}
        <div
          className="lg:col-span-5 relative rounded-2xl overflow-hidden min-h-[300px] bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(20,16,13,0.15) 0%, rgba(20,16,13,0.55) 55%, rgba(20,16,13,0.92) 100%), url('/investor-vision/hero/salon-story-colorist.jpg')",
            border: `1px solid ${INV.border}`,
          }}
        >
          <div className="absolute inset-x-0 bottom-0 p-6">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: INV.gold }}>
              The Problem
            </span>
            <p className="mt-3 text-base sm:text-lg font-light leading-snug" style={{ color: INV.textOnDark }}>
              {COLOR_BAR.context}
            </p>
          </div>
        </div>

        {/* THE SOLUTION */}
        <div
          className="lg:col-span-7 rounded-2xl p-6 sm:p-7 flex flex-col"
          style={{ background: INV.glassStrong, border: `1px solid ${INV.border}` }}
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: INV.gold }}>
            The Solution
          </span>
          <p className="mt-3 text-lg sm:text-xl font-light leading-snug mb-5" style={{ color: INV.text }}>
            {COLOR_BAR.subhead}
          </p>

          <div className="text-xs uppercase tracking-[0.14em] mb-3" style={{ color: INV.textMuted }}>
            {COLOR_BAR.builtLine}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {COLOR_BAR.cards.map((card, i) => (
              <div
                key={card.title}
                className="flex items-center gap-3 rounded-xl px-3.5 py-2.5"
                style={{ background: INV.goldSoft, border: `1px solid ${INV.borderSoft}` }}
              >
                <Glyph name={CAP_GLYPHS[i % CAP_GLYPHS.length]} size={18} color={INV.gold} />
                <span className="text-sm font-medium" style={{ color: INV.text }}>
                  {card.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Proof bar */}
      <div
        className="mt-5 rounded-2xl px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3"
        style={{ background: INV.goldSoft, border: `1px solid ${INV.borderSoft}` }}
      >
        <p className="flex-1 text-base sm:text-lg font-light" style={{ color: INV.text }}>
          Product-market fit among the highest seen in the industry.
        </p>
        <div
          className="inline-flex items-baseline gap-2 px-4 py-2 rounded-xl shrink-0"
          style={{ background: INV.glassStrong, border: `1px solid ${INV.border}` }}
        >
          <span className="text-2xl font-medium" style={{ color: INV.gold }}>12</span>
          <span className="text-xs uppercase tracking-[0.14em]" style={{ color: INV.textMuted }}>
            countries worldwide
          </span>
        </div>
      </div>
    </InvestorSection>
  );
};
