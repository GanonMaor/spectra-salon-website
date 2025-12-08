"use client";

import React, { useState } from "react";

interface ValueCard {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  gradient: string;
  accentColor: string;
}

const valueCards: ValueCard[] = [
  {
    id: "waste-reduction",
    number: "90%",
    title: "Material Waste Savings",
    subtitle: "Stop sending profits down the sink",
    description:
      "AI-guided weighing ensures every formula is mixed with exactly what's needed. No more over-mixing, no waste, no guesswork. This goes straight to your bottom line.",
    gradient: "from-emerald-500 via-green-500 to-teal-500",
    accentColor: "emerald",
  },
  {
    id: "auto-formulas",
    number: "Zero",
    title: "Manual Work",
    subtitle: "Formulas saved automatically",
    description:
      "Stylists waste time documenting formulas by hand. Spectra logs every formula automatically in real time, leaving your team free to focus on clients, not paperwork.",
    gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
    accentColor: "violet",
  },
  {
    id: "one-click-reorder",
    number: "1-Click",
    title: "Reordering",
    subtitle: "Inventory done in minutes",
    description:
      "Turn a multi-hour job into a 90-second process. Spectra tracks every gram used, builds the exact reorder list, and you approve it with one click. Smart, fast, effortless.",
    gradient: "from-blue-500 via-cyan-500 to-sky-500",
    accentColor: "blue",
  },
  {
    id: "ai-forecasting",
    number: "Never",
    title: "Run Out Again",
    subtitle: "AI alerts before stock hits zero",
    description:
      "Monitors usage patterns, seasonality, peak days, and product trends. You'll always know what's running low before it becomes a problem. Say goodbye to supplier emergencies.",
    gradient: "from-amber-500 via-orange-500 to-red-500",
    accentColor: "amber",
  },
  {
    id: "unlimited-stations",
    number: "Unlimited",
    title: "Scales Included",
    subtitle: "No extra fees per device",
    description:
      "Pricing is based on your team size, not your equipment. Add as many Bluetooth SmartScales as your salon needs—all included at no additional cost. Work smarter, scale faster.",
    gradient: "from-pink-500 via-rose-500 to-red-500",
    accentColor: "pink",
  },
  {
    id: "personal-support",
    number: "Personal",
    title: "Setup & Support",
    subtitle: "We're with you every step",
    description:
      "Personalized onboarding for your entire team—as long as it takes. Direct access to our team on WhatsApp, Instagram, and phone. We're available whenever you need us, with real people and real phone numbers.",
    gradient: "from-indigo-500 via-blue-500 to-purple-500",
    accentColor: "indigo",
  },
];

export const SmartColorTrackingSection: React.FC = () => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <section className="relative py-24 lg:py-32 bg-gradient-to-b from-white via-gray-50/30 to-white overflow-hidden">
      {/* Elegant background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-100/40 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-100/40 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Premium Header */}
        <div className="text-center mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-5 py-2 mb-6 border border-gray-200/60 shadow-sm">
            <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" />
            <span className="text-gray-600 text-xs font-medium uppercase tracking-widest">
              Next-Level Salon Management
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-light text-gray-900 mb-4 tracking-tight">
            Powered by{" "}
            <span className="font-medium bg-gradient-to-r from-spectra-gold-dark via-spectra-gold to-spectra-gold-light bg-clip-text text-transparent">
              Spectra CI
            </span>
          </h2>

          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
            A smarter, more profitable way to run your color business.
            <br className="hidden sm:block" />
            Designed for salon owners ready to upgrade from manual tasks to
            AI-driven operations.
          </p>
        </div>

        {/* Value Cards Grid - Boutique Hotel Inspired */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {valueCards.map((card, index) => (
            <div
              key={card.id}
              className="group relative"
              onMouseEnter={() => setHoveredCard(card.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              {/* Card Container */}
              <div className="relative h-full bg-white rounded-2xl border border-gray-200/60 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden">
                {/* Gradient accent on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                />

                {/* Content */}
                <div className="relative p-8 lg:p-10">
                  {/* Number */}
                  <div className="flex items-start justify-start mb-6">
                    <div
                      className={`text-left transform group-hover:translate-x-1 transition-transform duration-500`}
                    >
                      <div
                        className={`text-3xl lg:text-4xl font-light bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}
                      >
                        {card.number}
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-2 tracking-tight">
                    {card.title}
                  </h3>

                  {/* Subtitle */}
                  <p className="text-sm font-medium text-gray-500 mb-4 tracking-wide uppercase">
                    {card.subtitle}
                  </p>

                  {/* Divider */}
                  <div className="w-12 h-0.5 bg-gradient-to-r from-gray-300 to-transparent mb-4 group-hover:w-20 transition-all duration-500" />

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed text-sm lg:text-base font-light">
                    {card.description}
                  </p>

                  {/* Hover indicator */}
                  <div
                    className={`mt-6 flex items-center gap-2 text-sm font-medium bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  >
                    <span>Learn more</span>
                    <svg
                      className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </div>
                </div>

                {/* Bottom accent line */}
                <div
                  className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SmartColorTrackingSection;
