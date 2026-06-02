import React from "react";
import { INV } from "../tokens";
import { InvestorButton, InvestorEyebrow } from "../primitives";
import { HERO } from "../copy";

export const HeroSection: React.FC = () => {
  return (
    <section
      id="hero"
      aria-label="Investor Experience Hero"
      className="relative w-full h-full overflow-hidden flex items-center"
      style={{ background: INV.bg }}
    >
      {/* Reference salon image with warm readable overlay on the left */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "linear-gradient(100deg, rgba(31,26,21,0.82) 0%, rgba(31,26,21,0.62) 38%, rgba(31,26,21,0.22) 68%, rgba(31,26,21,0.10) 100%), url('/investor-vision/salon-os/hero-salon-ai.png')",
        }}
      />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-24">
        <div className="max-w-2xl">
          <InvestorEyebrow dark className="mb-8">
            {HERO.eyebrow}
          </InvestorEyebrow>

          <h1
            className="text-6xl sm:text-7xl lg:text-8xl font-light mb-5 leading-[0.95] tracking-[-0.03em]"
            style={{ color: INV.textOnDark }}
          >
            {HERO.headline}
          </h1>

          <p
            className="text-xl sm:text-2xl font-light leading-[1.3] mb-10"
            style={{ color: INV.textOnDarkSoft }}
          >
            {HERO.subheadline}
          </p>

          {/* Three story lines — calm, short */}
          <div className="space-y-2 mb-12">
            {HERO.lines.map((line, i) => (
              <p
                key={i}
                className="text-base sm:text-lg font-light leading-[1.5]"
                style={{ color: i === 2 ? INV.gold : INV.textOnDarkSoft }}
              >
                {line}
              </p>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <InvestorButton variant="primary">{HERO.ctaPrimary}</InvestorButton>
            <InvestorButton variant="ghost" dark>
              {HERO.ctaSecondary}
            </InvestorButton>
          </div>
        </div>
      </div>
    </section>
  );
};
