import React from "react";
import { Link } from "react-router-dom";
import { useGTM } from "../../../hooks/useGTM";

interface Benefit {
  title: string;
  subtitle: string;
  description: string;
}

const benefits: Benefit[] = [
  {
    title: "Cut Waste",
    subtitle: "Save Up to 85%",
    description: "Every gram measured. Every mix intentional. No more guesswork.",
  },
  {
    title: "Boost Margins",
    subtitle: "More Profit Per Service",
    description: "Real-time cost tracking. Optimize pricing. Maximize your bottom line.",
  },
  {
    title: "Total Control",
    subtitle: "Know Everything, Everywhere",
    description: "Formulas, inventory, team usage, and client history—all synced, all visible.",
  },
  {
    title: "Instant Adoption",
    subtitle: "Zero Learning Curve",
    description: "Clean, intuitive interface your team adopts instantly. No training required.",
  },
  {
    title: "Client Delight",
    subtitle: "Perfect Results Every Time",
    description: "AI-powered color matching. Consistent quality. Happy clients who return.",
  },
  {
    title: "Smart Scale",
    subtitle: "Real-Time Precision",
    description: "Connected scale guides every mix. Preventing mistakes, saving money as you work.",
  },
];

export const SmartColorTrackingSection: React.FC = () => {
  const { trackCTAClick } = useGTM();

  return (
    <section className="relative py-24 lg:py-32 bg-black overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#EAB776]/3 rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - Clean minimal style */}
        <div className="text-center mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 mb-8">
            <div className="w-1.5 h-1.5 bg-[#EAB776]/60 rounded-full" />
            <span className="text-white/40 text-xs font-medium uppercase tracking-[0.15em]">
              Why Spectra-CI
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extralight text-white mb-6 leading-[1.1] tracking-[-0.02em]">
            Built for professionals{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E0A263] to-[#CF915B]">
              who demand more.
            </span>
          </h2>

          <p className="text-xl text-white/40 font-light max-w-2xl mx-auto">
            You'll never believe you ran your salon without it.
          </p>
        </div>

        {/* Benefits Grid - Clean 3x2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 mb-20">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center lg:text-left">
              {/* Title */}
              <h3 className="text-2xl lg:text-3xl font-light text-white mb-2">
                {benefit.title}
              </h3>
              
              {/* Subtitle */}
              <p className="text-transparent bg-clip-text bg-gradient-to-r from-[#E0A263] to-[#CF915B] text-sm font-medium uppercase tracking-wider mb-3">
                {benefit.subtitle}
              </p>
              
              {/* Description */}
              <p className="text-white/50 text-base leading-relaxed font-light">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* The Bottom Line - Stats */}
        <div className="text-center mb-16">
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extralight text-white mb-6 leading-[1.1] tracking-[-0.02em]">
            Cost optimization{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E0A263] to-[#CF915B]">
              without cutting quality.
            </span>
          </h3>
          <p className="text-lg text-white/40 font-light max-w-2xl mx-auto mb-12">
            Spectra-CI tracks every gram, prevents over-mixing, and automates
            inventory so your margin grows with every service.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-12 mb-16">
          <div className="text-center">
            <div className="text-5xl lg:text-6xl font-light text-white mb-2">
              10-25%
            </div>
            <div className="text-white/50 text-sm font-medium uppercase tracking-wider">
              Waste Reduction
            </div>
          </div>
          <div className="text-center">
            <div className="text-5xl lg:text-6xl font-light text-transparent bg-clip-text bg-gradient-to-r from-[#EAB776] to-[#B18059] mb-2">
              $8+
            </div>
            <div className="text-white/50 text-sm font-medium uppercase tracking-wider">
              Saved Per Visit
            </div>
          </div>
          <div className="text-center">
            <div className="text-5xl lg:text-6xl font-light text-white mb-2">
              100%
            </div>
            <div className="text-white/50 text-sm font-medium uppercase tracking-wider">
              Formula Accuracy
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/signup?trial=true"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#EAB776] to-[#B18059] hover:from-[#B18059] hover:to-[#EAB776] text-white font-semibold text-lg rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            onClick={() => trackCTAClick("Start Free Trial", "Why Spectra Section")}
          >
            Start Free Trial
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <Link
            to="/about"
            className="text-white/70 hover:text-white font-medium text-lg transition-colors duration-300"
          >
            Learn more →
          </Link>
        </div>
      </div>
    </section>
  );
};
