import React from "react";
import { walkthroughSteps } from "../../../constants/walkthroughSteps";
import { VideoSection } from "./VideoSection";
import { SmartColorTrackingSection } from "./SmartColorTrackingSection";
import { ContactSection } from "../../../components/ContactSection";
import { BACKGROUND_IMAGES } from "../../../constants/backgroundImages";

export const StepsSection: React.FC = () => {
  return (
    <>
      {/* Ultra-Fast Optimized Carousel */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-slate-50 to-white relative overflow-hidden">
        {/* Minimal background effects */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-100 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-purple-100 rounded-full blur-2xl"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Simplified Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/80 rounded-full px-4 py-2 mb-6 border border-gray-200">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-700 text-sm font-medium uppercase tracking-wider">
                The Journey
              </span>
            </div>

            <h2 className="text-4xl lg:text-6xl font-light text-gray-900 mb-4">
              Five Revolutionary
            </h2>
            <h2 className="text-4xl lg:text-6xl font-light bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              Steps
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From chaos to perfection. Experience the future of salon
              management.
            </p>
          </div>

          {/* Horizontal Scrollable Cards - 3 at a time */}
          <div className="mb-16">
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-6 lg:gap-8 w-max">
                {walkthroughSteps.map((step, index) => {
                  const colors = [
                    {
                      bg: "bg-white",
                      accent: "bg-gradient-to-r from-cyan-500 to-blue-500",
                      text: "text-cyan-600",
                    },
                    {
                      bg: "bg-white",
                      accent: "bg-gradient-to-r from-orange-500 to-pink-500",
                      text: "text-orange-600",
                    },
                    {
                      bg: "bg-white",
                      accent: "bg-gradient-to-r from-rose-500 to-purple-500",
                      text: "text-rose-600",
                    },
                    {
                      bg: "bg-white",
                      accent: "bg-gradient-to-r from-teal-500 to-emerald-500",
                      text: "text-teal-600",
                    },
                    {
                      bg: "bg-white",
                      accent: "bg-gradient-to-r from-violet-500 to-purple-500",
                      text: "text-violet-600",
                    },
                  ];

                  const colorScheme = colors[index];

                  return (
                    <div
                      key={index}
                      className="group flex-shrink-0 w-80 lg:w-96"
                    >
                      <div
                        className={`relative ${colorScheme.bg} rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-2 h-full`}
                      >
                        {/* Optimized Image Container */}
                        <div className="relative h-64 lg:h-80 overflow-hidden bg-gray-100">
                          <img
                            src={index === 4 ? "/step_5.jpg" : step.image}
                            alt={step.alt}
                            loading={index < 2 ? "eager" : "lazy"}
                            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              if (index === 4) {
                                target.src = `https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80`;
                              } else {
                                target.src = `https://images.unsplash.com/photo-158${8000000 + index}?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80`;
                              }
                            }}
                          />
                        </div>

                        {/* Clean Content */}
                        <div className="p-4 lg:p-6">
                          <h3
                            className={`text-lg lg:text-xl font-bold ${colorScheme.text} mb-2 lg:mb-3 tracking-tight`}
                          >
                            {step.title}
                          </h3>
                          <p className="text-gray-700 text-sm leading-relaxed mb-3 lg:mb-4 font-medium">
                            {step.description}
                          </p>

                          {/* Modern Progress Bar */}
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                              <div
                                className={`h-full ${colorScheme.accent} rounded-full transition-all duration-500 shadow-sm`}
                                style={{
                                  width: `${((index + 1) / walkthroughSteps.length) * 100}%`,
                                }}
                              ></div>
                            </div>
                            <span
                              className={`text-xs ${colorScheme.text} font-bold px-2 py-1 bg-white/80 rounded-full shadow-sm`}
                            >
                              {index + 1}/{walkthroughSteps.length}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Scroll Hint */}
            <div className="text-center mt-4">
              <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16l-4-4m0 0l4-4m-4 4h18"
                  />
                </svg>
                Scroll horizontally to see all steps
                <svg
                  className="w-4 h-4"
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
              </p>
            </div>
          </div>

          {/* Clean CTA */}
          <div className="text-center">
            <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
              Experience all five revolutionary steps and transform your salon
              today
            </p>

            <button className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
              Start Free Trial
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Lazy Load Other Sections */}
      <VideoSection />
      <SmartColorTrackingSection />
      <ContactSection
        backgroundImage={BACKGROUND_IMAGES.yourCustomSalon}
        title="Ready to"
        subtitle="Transform?"
        description="Join thousands of salon professionals who've revolutionized their business with Spectra."
      />
    </>
  );
};
