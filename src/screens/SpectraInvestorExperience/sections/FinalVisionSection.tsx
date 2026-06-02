import React from "react";
import { INV, GOLD_GRADIENT } from "../tokens";
import { InvestorEyebrow, InvestorButton } from "../primitives";
import { NetworkConstellation } from "../visuals/NetworkConstellation";
import { VISION } from "../copy";

export const FinalVisionSection: React.FC = () => {
  return (
    <section
      id="final-vision"
      aria-label="Final vision — beauty industry infrastructure"
      className="relative w-full min-h-full overflow-hidden flex items-center"
      style={{ background: INV.bgDeep }}
    >
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(18,14,11,0.78) 0%, rgba(18,14,11,0.84) 60%, rgba(18,14,11,0.94) 100%), url('/investor-vision/hero/salon-hero.jpg')",
        }}
      />
      <NetworkConstellation dark className="absolute inset-0 z-0 w-full h-full opacity-60" />

      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-20">
        <div className="mb-10">
          <InvestorEyebrow dark>{VISION.eyebrow}</InvestorEyebrow>
        </div>

        <div className="space-y-4 mb-12">
          {VISION.lines.map((line, i) => (
            <p
              key={i}
              className="text-3xl sm:text-4xl lg:text-5xl font-extralight leading-[1.15] tracking-[-0.02em]"
              style={{ color: i === VISION.lines.length - 1 ? INV.gold : INV.textOnDark }}
            >
              {line}
            </p>
          ))}
        </div>

        <div className="max-w-2xl mb-12">
          <p className="text-base sm:text-lg font-light mb-3" style={{ color: INV.textOnDarkSoft }}>
            {VISION.growthLead}
          </p>
          <p className="text-sm font-light mb-2" style={{ color: INV.textOnDarkSoft }}>
            {VISION.dataLines.join("  ·  ")}
          </p>
          <p className="text-sm font-light leading-relaxed" style={{ color: INV.textOnDarkSoft }}>
            {VISION.datasetClosing}
          </p>
        </div>

        <p className="text-base sm:text-lg font-light leading-relaxed max-w-2xl mb-2" style={{ color: INV.textOnDarkSoft }}>
          {VISION.belief}
        </p>
        <p className="text-xl sm:text-2xl font-light mb-14 max-w-2xl" style={{ color: INV.textOnDark }}>
          {VISION.beliefEmphasis}
        </p>

        <div className="mb-12">
          <div className="w-12 h-px mb-6" style={{ background: GOLD_GRADIENT }} />
          <div className="text-4xl sm:text-5xl font-extralight mb-2" style={{ color: INV.gold }}>
            {VISION.signature}
          </div>
          <p className="text-base sm:text-lg font-light italic" style={{ color: INV.textOnDarkSoft }}>
            {VISION.tagline}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <InvestorButton variant="primary">{VISION.ctaPrimary}</InvestorButton>
          <InvestorButton variant="ghost" dark>{VISION.ctaSecondary}</InvestorButton>
        </div>

        <p className="text-xs uppercase tracking-[0.14em]" style={{ color: "rgba(251,246,239,0.5)" }}>
          {VISION.footer}
        </p>
      </div>
    </section>
  );
};
