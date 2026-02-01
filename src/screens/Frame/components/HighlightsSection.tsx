import React from "react";

interface Highlight {
  icon: JSX.Element;
  title: string;
  subtitle: string;
}

const highlights: Highlight[] = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: "Digital Formulas",
    subtitle: "Zero manual errors",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    title: "Inventory Control",
    subtitle: "Automated ordering",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Real-Time Data",
    subtitle: "Live insights",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Cost Savings",
    subtitle: "10-25% waste reduction",
  },
];

export const HighlightsSection: React.FC = () => {
  return (
    <section className="py-12 lg:py-16 bg-black border-y border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Label */}
        <div className="text-center mb-8 lg:mb-10">
          <span className="text-white/60 text-xs sm:text-sm font-medium uppercase tracking-[0.3em]">
            Get the highlights
          </span>
        </div>

        {/* Highlights Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {highlights.map((highlight, index) => (
            <div
              key={index}
              className="group text-center p-6 rounded-2xl transition-all duration-300 hover:bg-white/5"
            >
              {/* Icon */}
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#EAB776]/20 to-[#B18059]/10 rounded-2xl flex items-center justify-center text-[#D4A06A] group-hover:scale-110 transition-transform duration-300 border border-[#EAB776]/20">
                {highlight.icon}
              </div>

              {/* Title */}
              <h3 className="text-white text-base sm:text-lg font-medium mb-1">
                {highlight.title}
              </h3>

              {/* Subtitle */}
              <p className="text-white/50 text-sm font-light">
                {highlight.subtitle}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HighlightsSection;
