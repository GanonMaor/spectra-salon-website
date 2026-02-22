import React from "react";
import { useSiteColors, useSiteTheme } from "../../../contexts/SiteTheme";

interface Capability {
  title: string;
  subtitle: string;
  description: string;
  icon: JSX.Element;
}

const capabilities: Capability[] = [
  {
    title: "Digital Formulas",
    subtitle: "Client Journey Tracking",
    description:
      "Perfect formulas, every time, without disrupting your workflow. Every formula is saved under the client's profile to guarantee the perfect blend.",
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: "Real-Time Data",
    subtitle: "Live Visibility",
    description:
      "Gain immediate access to vital information. Performance metrics, inventory status, cost per treatment — all in one dashboard.",
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: "Inventory Control",
    subtitle: "Automated Management",
    description:
      "Spectra-CI manages salon inventory automatically. The system knows how much product is used and generates supply orders based on actual usage.",
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    title: "Sustainability",
    subtitle: "Reweigh Feature",
    description:
      "10-25% of products from every treatment get dumped. Spectra's reweigh feature measures leftovers and turns waste into savings.",
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export const ProCapabilitiesSection: React.FC = () => {
  const c = useSiteColors();
  const { isDark } = useSiteTheme();
  const s = c.imageSection;

  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat md:bg-fixed"
        style={{
          backgroundImage: `url('/colorbar_with_spectra.png')`,
        }}
      />
      <div
        className="absolute inset-0 z-0"
        style={{ background: s.overlay }}
      />

      <div className="absolute inset-0 pointer-events-none z-[1]">
        <div className="absolute top-1/4 left-0 w-96 h-96 rounded-full blur-3xl" style={{ background: s.glowA }} />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 rounded-full blur-3xl" style={{ background: s.glowB }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 lg:mb-24">
          <div
            className="inline-flex items-center gap-3 backdrop-blur-sm rounded-full px-6 py-3 mb-10"
            style={{ background: s.badgeBg, border: `1px solid ${s.badgeBorder}` }}
          >
            <div className="w-2 h-2 bg-gradient-to-r from-[#EAB776] to-[#B18059] rounded-full animate-pulse" />
            <span className="text-sm font-medium uppercase tracking-[0.2em]" style={{ color: s.textSecondary }}>
              Pro Capabilities
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extralight mb-6 tracking-[-0.02em]" style={{ color: s.textPrimary }}>
            Pro Capabilities.
          </h2>
          <p className="text-xl sm:text-2xl font-light max-w-3xl mx-auto" style={{ color: s.textMuted }}>
            Everything you need to run a smarter, more profitable salon.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {capabilities.map((capability, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-3xl backdrop-blur-sm p-8 lg:p-10 transition-all duration-500"
              style={{
                background: s.cardBg,
                border: `1px solid ${s.cardBorder}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = s.cardBgHover;
                e.currentTarget.style.borderColor = s.cardBorderHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = s.cardBg;
                e.currentTarget.style.borderColor = s.cardBorder;
              }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[#EAB776]/20 to-[#B18059]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-[#EAB776]/20" style={{ color: s.iconColor }}>
                {capability.icon}
              </div>

              <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#EAB776] to-[#B18059] text-sm font-medium uppercase tracking-wider mb-3">
                {capability.subtitle}
              </span>
              <h3 className="text-2xl sm:text-3xl font-light mb-4 leading-tight" style={{ color: s.textPrimary }}>
                {capability.title}
              </h3>
              <p className="text-base lg:text-lg leading-relaxed font-light" style={{ color: s.textMuted }}>
                {capability.description}
              </p>

              <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: s.glowA }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProCapabilitiesSection;
