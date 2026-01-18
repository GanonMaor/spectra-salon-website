import React from "react";

interface Benefit {
  icon: JSX.Element;
  title: string;
  subtitle: string;
  description: string;
  color: string;
}

const benefits: Benefit[] = [
  {
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Cut Waste",
    subtitle: "Save Up to 85%",
    description: "Every gram measured. Every mix intentional. No more guesswork.",
    color: "from-green-400 to-emerald-500",
  },
  {
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Boost Margins",
    subtitle: "More Profit Per Service",
    description: "Real-time cost tracking. Optimize pricing. Maximize your bottom line.",
    color: "from-blue-400 to-cyan-500",
  },
  {
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    title: "Total Control",
    subtitle: "Know Everything, Everywhere",
    description: "Formulas, inventory, team usage, and client history—all synced, all visible.",
    color: "from-purple-400 to-pink-500",
  },
  {
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Instant Adoption",
    subtitle: "Zero Learning Curve",
    description: "Clean, intuitive interface your team adopts instantly. No training required.",
    color: "from-amber-400 to-orange-500",
  },
  {
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Client Delight",
    subtitle: "Perfect Results Every Time",
    description: "AI-powered color matching. Consistent quality. Happy clients who return.",
    color: "from-rose-400 to-pink-500",
  },
  {
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
    title: "Smart Scale",
    subtitle: "Real-Time Precision",
    description: "Connected scale guides every mix. Preventing mistakes, saving money as you work.",
    color: "from-teal-400 to-emerald-500",
  },
];

export const SmartColorTrackingSection: React.FC = () => {
  return (
    <section className="relative pt-16 pb-24 lg:pt-20 lg:pb-32 overflow-hidden max-w-full">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.85)),
            url('/colorbar_with_spectra.png')
          `,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      />

      {/* Enhanced Floating Glass Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 right-16 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-amber-400/8 to-orange-500/8 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-3xl rounded-full px-8 py-4 mb-8 border border-white/20 shadow-2xl">
            <div className="w-2 h-2 bg-gradient-to-r from-white to-gray-300 rounded-full animate-pulse"></div>
            <span className="text-white/90 text-sm font-semibold uppercase tracking-[0.3em]">
              Why Spectra
            </span>
            <div className="w-2 h-2 bg-gradient-to-r from-amber-400 to-orange-300 rounded-full animate-pulse"></div>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extralight text-white mb-6 leading-tight tracking-tight">
            Built for Salon Owners
          </h2>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-300 to-yellow-300 leading-tight tracking-tight drop-shadow-2xl mb-6">
            Who Want More
          </h2>
          <p className="text-lg lg:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed font-light">
            Stop losing money on color waste. Start running a smarter, more profitable salon.
          </p>
        </div>

        {/* Benefits Grid - 3 Rows x 2 Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto overflow-hidden">
          {benefits.map((benefit, index) => (
            <div key={index} className="group overflow-hidden">
              {/* Wide Glassmorphism Card */}
              <div className="relative bg-white/8 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl transition-all duration-300 p-8 hover:border-white/30 overflow-hidden max-w-full">
                {/* Number instead of Icon */}
                <div className="flex items-start gap-6">
                  <div
                    className={`flex-shrink-0 w-24 h-24 bg-gradient-to-br ${benefit.color} rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-xl border border-white/30 group-hover:scale-105 transition-transform duration-500`}
                  >
                    <span className="text-white text-4xl font-bold">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2 leading-tight">
                      {benefit.title}
                    </h3>
                    <p className={`text-lg font-medium bg-gradient-to-r ${benefit.color} bg-clip-text text-transparent mb-3`}>
                      {benefit.subtitle}
                    </p>
                    <p className="text-sm text-white/70 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Smooth gradient transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-black/60 pointer-events-none"></div>
    </section>
  );
};
