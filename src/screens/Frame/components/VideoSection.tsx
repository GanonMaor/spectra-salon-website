import React, { useRef, useEffect, useState } from "react";

export const VideoSection: React.FC = () => {
  const videoRef = useRef<HTMLDivElement>(null);
  const [shouldPlay, setShouldPlay] = useState(false);

  useEffect(() => {
    // Check if we should play video (from URL hash or sessionStorage)
    const hash = window.location.hash;
    if (hash === "#video-demo" || sessionStorage.getItem("playVideo") === "true") {
      setShouldPlay(true);
      sessionStorage.removeItem("playVideo");
      // Scroll to video section
      setTimeout(() => {
        videoRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  }, []);

  return (
    <section id="video-demo" ref={videoRef} className="pt-16 pb-24 bg-gradient-to-b from-transparent via-spectra-cream/5 to-white">
      <div className="max-w-6xl mx-auto px-8 sm:px-12 lg:px-16">
        {/* Section Header - natural connection */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-spectra-charcoal mb-4">
            See Spectra In{" "}
            <span className="text-gradient-spectra font-semibold">Action</span>
          </h2>
          <p className="text-lg text-spectra-charcoal-light max-w-2xl mx-auto">
            Watch a complete walkthrough of how Spectra transforms your daily
            workflow
          </p>
        </div>

        {/* Video Section - Cinema MacBook Pro */}
        <div className="flex justify-center mb-16">
          <div className="relative max-w-5xl w-full">
            {/* MacBook Pro - Cinema Style */}
            <div className="relative group gpu">
              {/* Floating glow - cinema lighting */}
              <div className="absolute -inset-12 bg-gradient-to-br from-spectra-gold/15 via-spectra-gold-light/8 to-transparent rounded-[4rem] blur-2xl group-hover:blur-3xl transition-all duration-700 will-change-transform"></div>

              {/* MacBook body - straight on view */}
              <div className="relative">
                {/* Screen - perfectly flat like cinema */}
                <div className="bg-gradient-to-b from-gray-800 via-gray-900 to-gray-800 rounded-t-3xl p-3 shadow-2xl">
                  {/* Apple logo on back */}
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-6 h-6 opacity-30">
                    <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-500 rounded-lg"></div>
                  </div>

                  {/* Screen bezel - minimal like cinema screen */}
                  <div className="bg-black rounded-2xl overflow-hidden relative shadow-inner">
                    {/* Video content - MAIN FOCUS */}
                    <div className="aspect-video relative z-20">
                      <iframe
                        className="w-full h-full rounded-2xl relative z-30"
                        src={`https://www.youtube.com/embed/VA6F3PjUEX8?autoplay=${shouldPlay ? 1 : 0}&mute=0&controls=1&modestbranding=1&rel=0&showinfo=0`}
                        title="Spectra Hair Salon Demo"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                        loading="eager"
                      />
                    </div>

                    {/* Subtle screen reflection */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent z-10 rounded-2xl pointer-events-none"></div>
                  </div>
                </div>

                {/* Keyboard base - minimal and flat */}
                <div className="bg-gradient-to-b from-gray-200 to-gray-300 rounded-b-3xl h-12 shadow-xl relative">
                  {/* Trackpad - centered */}
                  <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-40 h-6 bg-gradient-to-b from-gray-100 to-gray-200 rounded-xl shadow-inner border border-gray-200"></div>

                  {/* Keyboard area hint */}
                  <div className="absolute top-2 left-12 right-12 h-2 bg-gradient-to-r from-transparent via-gray-300/30 to-transparent rounded-full"></div>
                </div>
              </div>

              {/* Cinema-style base shadow */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-4/5 h-8 bg-gradient-to-b from-black/10 to-transparent rounded-full blur-xl"></div>

              {/* Side ambient lighting */}
              <div className="absolute top-1/4 -left-6 w-3 h-1/2 bg-gradient-to-r from-spectra-gold/15 to-transparent blur-lg"></div>
              <div className="absolute top-1/4 -right-6 w-3 h-1/2 bg-gradient-to-l from-spectra-gold-light/15 to-transparent blur-lg"></div>
            </div>
          </div>
        </div>

        {/* Competitive Advantages Section */}
        <div className="text-center mb-12">
          <p className="text-lg text-spectra-charcoal-light font-light mb-2">
            Why Spectra Stands Out
          </p>
          <p className="text-sm text-spectra-charcoal-light/80 font-light">
            Advantages that set us apart from the competition
          </p>
        </div>

        {/* Competitive Advantages Cards */}
        <div className="flex justify-center mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
            {[
              {
                title: "Unlimited Scales & Stations",
                color: "from-emerald-500 to-green-500",
                accent: "border-emerald-500/20",
                desc: "No limits on scales or workstations. Add as many as you need—all included. Competitors charge per device.",
              },
              {
                title: "Complete Product Database",
                color: "from-blue-500 to-cyan-500",
                accent: "border-blue-500/20",
                desc: "Images and barcodes for all products. Instant recognition. No manual entry needed.",
              },
              {
                title: "Lightning-Fast Mixing",
                color: "from-purple-500 to-pink-500",
                accent: "border-purple-500/20",
                desc: "Unmatched user experience. Mix preparation in seconds. Zero friction, zero delays.",
              },
              {
                title: "Reliability & Stability",
                color: "from-orange-500 to-amber-500",
                accent: "border-orange-500/20",
                desc: "Built for salon environments. Rock-solid performance. No crashes, no downtime.",
              },
              {
                title: "One-Click Reordering",
                color: "from-indigo-500 to-blue-500",
                accent: "border-indigo-500/20",
                desc: "Automated inventory tracking. Approve orders with a single click. No spreadsheets, no guesswork.",
              },
              {
                title: "AI-Powered Future",
                color: "from-rose-500 to-red-500",
                accent: "border-rose-500/20",
                desc: "This is just the beginning. Spectra is building the future of salon management with AI assistants.",
              },
            ].map((advantage, index) => (
              <div key={index} className="group relative">
                <div
                  className={`card-glass p-6 border ${advantage.accent} hover:scale-105 transition-all duration-300 h-full`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className={`w-2 h-2 rounded-full bg-gradient-to-r ${advantage.color} mt-2 flex-shrink-0`}
                    ></div>
                    <h3
                      className={`text-lg font-semibold bg-gradient-to-r ${advantage.color} bg-clip-text text-transparent`}
                    >
                      {advantage.title}
                    </h3>
                  </div>
                  <p className="text-sm text-spectra-charcoal-light leading-relaxed text-left">
                    {advantage.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Future Vision Statement */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-r from-spectra-gold/10 via-spectra-gold-light/10 to-spectra-gold/10 rounded-2xl p-6 max-w-3xl border border-spectra-gold/20">
            <p className="text-base sm:text-lg text-spectra-charcoal font-light leading-relaxed">
              <span className="font-semibold text-spectra-gold-dark">This is just the beginning.</span>{" "}
              Spectra is continuously developing the future of hair salon management with AI-powered assistants, 
              making your salon smarter, more efficient, and more profitable every day.
            </p>
          </div>
        </div>

        {/* Smooth Transition to Next Section */}
        <div className="text-center">
          <div className="w-px h-12 bg-gradient-to-b from-spectra-gold/50 to-transparent mx-auto"></div>
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
