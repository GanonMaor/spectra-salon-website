import React from "react";
import { INV } from "../tokens";
import { InvestorEyebrow } from "../primitives";
import { IntelligenceCore } from "../visuals/IntelligenceCore";
import { SALON_AI } from "../copy";

export const SalonAIRevealSection: React.FC = () => {
  return (
    <section
      id="salon-ai-reveal"
      aria-label="Introducing Salon AI"
      className="relative w-full min-h-full overflow-hidden flex items-center"
      style={{ background: INV.bgDeep }}
    >
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(20,16,13,0.86) 0%, rgba(20,16,13,0.72) 50%, rgba(20,16,13,0.92) 100%), url('/investor-vision/salon-os/ai-insight-salon.png')",
        }}
      />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-20">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="flex justify-center mb-5">
            <InvestorEyebrow dark>{SALON_AI.eyebrow}</InvestorEyebrow>
          </div>
          <h2
            className="text-4xl sm:text-5xl lg:text-6xl font-light leading-[1.05] tracking-[-0.02em] mb-4"
            style={{ color: INV.textOnDark }}
          >
            Introducing Salon AI.
          </h2>
          <p className="text-lg sm:text-xl font-light" style={{ color: INV.textOnDarkSoft }}>
            {SALON_AI.subhead}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <IntelligenceCore
            dark
            centerName={SALON_AI.center.name}
            centerRole={SALON_AI.center.role}
            nodes={SALON_AI.agents.map((a) => a.name)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SALON_AI.agents.map((agent) => (
              <div
                key={agent.name}
                className="rounded-2xl p-5"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)" }}
              >
                <div className="text-base font-medium mb-2" style={{ color: INV.textOnDark }}>
                  {agent.name}
                </div>
                <div className="text-sm font-light leading-relaxed" style={{ color: INV.textOnDarkSoft }}>
                  {agent.outcome}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xl sm:text-2xl font-light max-w-2xl mx-auto mt-12" style={{ color: INV.gold }}>
          {SALON_AI.closing}
        </p>
      </div>
    </section>
  );
};
