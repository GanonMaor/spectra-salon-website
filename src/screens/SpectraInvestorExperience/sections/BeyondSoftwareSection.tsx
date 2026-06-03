import React from "react";
import { INV } from "../tokens";
import { InvestorSection, InvestorEyebrow, InvestorHeadline, InvestorCopy, GlassPanel } from "../primitives";
import { Glyph, GlyphName } from "../visuals/Glyph";
import { BEYOND } from "../copy";

const ENGINE_GLYPHS: GlyphName[] = ["payment", "ai", "data"];

export const BeyondSoftwareSection: React.FC = () => {
  return (
    <InvestorSection id="beyond-software" aria-label="Three revenue engines — beyond software" width="wide" tone="soft">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="flex justify-center mb-5">
          <InvestorEyebrow>{BEYOND.eyebrow}</InvestorEyebrow>
        </div>
        <InvestorHeadline size="h1" className="mb-3">
          {BEYOND.headline}
        </InvestorHeadline>
        <InvestorCopy size="lg" muted>
          {BEYOND.subhead}
        </InvestorCopy>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {BEYOND.engines.map((engine, i) => (
          <GlassPanel key={engine.number} className="p-7">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold tracking-[0.2em]" style={{ color: INV.gold }}>
                {engine.number}
              </span>
              <Glyph name={ENGINE_GLYPHS[i % ENGINE_GLYPHS.length]} size={22} color={INV.gold} />
            </div>
            <div className="text-xl font-light mb-3" style={{ color: INV.text }}>
              {engine.title}
            </div>
            <div className="text-sm font-light leading-relaxed" style={{ color: INV.textSecondary }}>
              {engine.detail}
            </div>
          </GlassPanel>
        ))}
      </div>

      <GlassPanel highlight className="p-6 max-w-3xl mx-auto mb-8">
        <p className="text-base sm:text-lg font-light" style={{ color: INV.text }}>
          {BEYOND.example}
        </p>
      </GlassPanel>

      <p className="text-center text-2xl sm:text-3xl font-light max-w-2xl mx-auto" style={{ color: INV.textSecondary }}>
        {BEYOND.closing}
      </p>
    </InvestorSection>
  );
};
