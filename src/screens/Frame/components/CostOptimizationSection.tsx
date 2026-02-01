import React from "react";
import { Link } from "react-router-dom";
import { useGTM } from "../../../hooks/useGTM";

export const CostOptimizationSection: React.FC = () => {
  const { trackCTAClick } = useGTM();

  return (
    <section className="py-24 lg:py-32 bg-black relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#EAB776]/3 rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Label - Clean minimal style */}
        <div className="inline-flex items-center gap-2 mb-8">
          <div className="w-1.5 h-1.5 bg-[#EAB776]/60 rounded-full" />
          <span className="text-white/40 text-xs font-medium uppercase tracking-[0.15em]">
            The Bottom Line
          </span>
        </div>

        {/* Main Headline */}
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extralight text-white mb-6 leading-[1.1] tracking-[-0.02em]">
          Cost optimization —{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E0A263] to-[#CF915B]">
            without cutting quality.
          </span>
        </h2>

        {/* Description */}
        <p className="text-xl text-white/40 font-light max-w-2xl mx-auto mb-12 leading-relaxed">
          Spectra-CI tracks every gram, prevents over-mixing, and automates
          inventory so your margin grows with every service.
        </p>

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
            onClick={() => trackCTAClick("Start Free Trial", "Cost Optimization Section")}
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

export default CostOptimizationSection;
