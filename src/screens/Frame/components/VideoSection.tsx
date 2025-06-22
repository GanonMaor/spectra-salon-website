import React from "react";

export const VideoSection: React.FC = () => {
  return (
    <section className="pt-16 pb-24 bg-gradient-to-b from-transparent via-spectra-cream/5 to-white">
      <div className="max-w-6xl mx-auto px-8 sm:px-12 lg:px-16">
        
        {/* Section Header - חיבור טבעי */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-spectra-charcoal mb-4">
            See Spectra In <span className="text-gradient-spectra font-semibold">Action</span>
          </h2>
          <p className="text-lg text-spectra-charcoal-light max-w-2xl mx-auto">
            Watch a complete walkthrough of how Spectra transforms your daily workflow
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
                        src="https://www.youtube.com/embed/VA6F3PjUEX8?autoplay=0&mute=0&controls=1&modestbranding=1&rel=0&showinfo=0&enablejsapi=1"
                        title="Spectra Hair Salon Demo"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                        loading="lazy"
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

        {/* Results Summary - חיבור טבעי לסטטיסטיקות */}
        <div className="text-center mb-12">
          <p className="text-lg text-spectra-charcoal-light font-light">
            Here's what you can expect:
          </p>
        </div>

        {/* Stats - Enhanced with card-glass class */}
        <div className="flex justify-center mb-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl">
            {[
              { value: "85%", label: "Less Waste", color: "from-green-500 to-green-400", accent: "border-green-500/20", desc: "Reduce color waste dramatically" },
              { value: "40%", label: "More Profit", color: "from-blue-500 to-blue-400", accent: "border-blue-500/20", desc: "Increase your bottom line" },
              { value: "5min", label: "Setup", color: "from-orange-500 to-yellow-400", accent: "border-orange-500/20", desc: "Quick and easy installation" }
            ].map((stat, index) => (
              <div key={index} className="group relative">
                <div className={`card-glass p-8 border ${stat.accent} hover:scale-105 text-center`}>
                  <div className={`text-4xl lg:text-5xl font-light bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-3 drop-shadow-sm`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-spectra-gold-dark font-semibold uppercase tracking-wider mb-2">
                    {stat.label}
                  </div>
                  <div className="text-xs text-spectra-charcoal-light">
                    {stat.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Smooth Transition to Next Section */}
        <div className="text-center">
          <p className="text-spectra-charcoal-light font-light text-lg mb-8">
            Experience the technology behind the magic
          </p>
          <div className="w-px h-12 bg-gradient-to-b from-spectra-gold/50 to-transparent mx-auto"></div>
        </div>

      </div>
    </section>
  );
};

export default VideoSection; 