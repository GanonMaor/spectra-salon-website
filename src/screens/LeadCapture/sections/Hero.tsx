import React from "react";

type HeroProps = {
  onStartTrial: () => void;
};

export const Hero: React.FC<HeroProps> = ({ onStartTrial }) => {
  return (
    <section className="relative pt-12 pb-8 sm:pt-16 sm:pb-12 lg:pt-20 lg:pb-16 overflow-hidden min-h-screen flex items-center">
      <div className="absolute inset-0 gradient-bg-hero" />

      <div className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c79c6d' fill-opacity='1'%3E%3Ccircle cx='40' cy='40' r='0.8'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 h-full flex flex-col justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-16 lg:mb-20">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-spectra-gold-light to-spectra-gold rounded-full shadow-sm" />
            <span className="text-spectra-gold-dark text-xs sm:text-sm lg:text-base font-semibold uppercase tracking-[0.3em] sm:tracking-[0.35em] opacity-90 px-3 text-center">
              Trusted by 1,500+ Hair Professionals
            </span>
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-spectra-gold to-spectra-gold-dark rounded-full shadow-sm" />
          </div>

          <div className="mb-16 sm:mb-20 lg:mb-24 xl:mb-28">
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[8rem] 2xl:text-[10rem] font-extralight text-spectra-charcoal mb-6 sm:mb-8 lg:mb-10 leading-[0.85] tracking-[-0.03em]">
              Stop Losing
            </h1>
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[8rem] 2xl:text-[10rem] font-extralight text-spectra-charcoal mb-6 sm:mb-8 lg:mb-10 leading-[0.85] tracking-[-0.03em]">
              Money on
            </h1>
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[8rem] 2xl:text-[10rem] font-light text-transparent bg-clip-text bg-gradient-to-r from-spectra-gold-light via-spectra-gold to-spectra-gold-dark leading-[0.85] tracking-[-0.03em] drop-shadow-lg">
              Wasted Hair Color
            </h1>
          </div>

          <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-spectra-charcoal-light mb-16 sm:mb-20 lg:mb-24 xl:mb-28 leading-[1.3] sm:leading-[1.25] font-light max-w-2xl sm:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto tracking-[-0.02em] px-2 sm:px-0">
            Salons waste <span className="font-semibold text-spectra-gold-dark">35% of their color</span> down the sink. Spectra's <span className="font-semibold text-spectra-gold-dark">AI-powered platform</span> saves up to <span className="font-semibold text-spectra-gold-dark">90% of that waste</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 lg:gap-10 justify-center items-center px-4 sm:px-0">
            <button onClick={onStartTrial}
              className="inline-block px-8 py-4 md:px-10 md:py-5 lg:px-12 lg:py-6 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white font-semibold text-base md:text-lg lg:text-xl rounded-full transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-[1.02] text-center min-w-fit">
              Take me straight to my free trial
            </button>
            <button onClick={() => window.open("https://calendly.com/spectra-demo/15min", "_blank")}
              className="group flex items-center gap-4 sm:gap-6 lg:gap-8 text-spectra-charcoal-light hover:text-spectra-gold font-medium text-lg sm:text-xl lg:text-2xl xl:text-3xl transition-all duration-300 px-6 sm:px-10 lg:px-12 py-4 sm:py-6 lg:py-8 justify-center min-w-fit">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28 bg-gradient-to-br from-spectra-cream-dark to-spectra-cream group-hover:from-spectra-gold/10 group-hover:to-spectra-gold-light/10 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl border border-spectra-gold/10 group-hover:border-spectra-gold/20 flex-shrink-0">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10 ml-1 sm:ml-1.5" fill="currentColor" viewBox="0 0 20 20"><path d="M8 5v10l8-5-8-5z" /></svg>
              </div>
              <span className="whitespace-nowrap">Watch Demo</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};


