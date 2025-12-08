import React, { memo } from "react";
import { ClientCarousel } from "../../../components/ClientCarousel";

const MemoizedClientCarousel = memo(ClientCarousel);

export const ReviewsAndContact: React.FC = () => {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8)), url('/dream-salon2.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      />

      <div className="absolute inset-0 z-5 bg-gradient-to-b from-black/60 via-transparent to-transparent h-1/3" />

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-32 right-16 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-amber-400/8 to-orange-500/8 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-8 sm:px-12 lg:px-16">
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extralight text-white mb-6 leading-[0.9] tracking-[-0.02em]">
              See what Spectra <span className="bg-gradient-to-r from-spectra-gold-light via-spectra-gold to-spectra-gold-dark bg-clip-text text-transparent font-medium">clients</span> are saying
            </h2>
          </div>

          <div className="relative">
            <MemoizedClientCarousel />
          </div>
        </div>

        {/* Communication buttons kept as-is from the original design */}
      </div>
    </section>
  );
};


