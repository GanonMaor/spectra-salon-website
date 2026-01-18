import React from "react";
import { SmartColorTrackingSection } from "./SmartColorTrackingSection";
import { ContactSection } from "../../../components/ContactSection";
import { BACKGROUND_IMAGES } from "../../../constants/backgroundImages";

interface Step {
  id: string;
  number: string;
  title: string;
  description: string;
  image: string;
  color: string;
}

const steps: Step[] = [
  {
    id: "check-in",
    number: "01",
    title: "Check In",
    description:
      "Client arrives and checks in using our simple interface",
    image: "/stap 1 chack in.jpeg",
    color: "from-cyan-400 to-blue-500",
  },
  {
    id: "select-service",
    number: "02",
    title: "Select Service",
    description: "Choose the hair service and color treatment needed",
    image: "/stepn 2 select service.jpeg",
    color: "from-orange-400 to-pink-500",
  },
  {
    id: "scan-tube",
    number: "03",
    title: "Scan Tube",
    description: "Scan the hair color tube to track usage automatically",
    image: "/step 3 scan tube.jpeg",
    color: "from-rose-400 to-purple-500",
  },
  {
    id: "squeeze-color",
    number: "04",
    title: "Squeeze Color",
    description: "Dispense the exact amount needed - no waste, perfect results",
    image: "/step 4 squiz the color.jpeg",
    color: "from-teal-400 to-emerald-500",
  },
  {
    id: "track-save",
    number: "05",
    title: "Track & Save",
    description: "System automatically tracks usage and calculates savings",
    image: "/step_5.jpg",
    color: "from-violet-400 to-purple-600",
  },
];

export const StepsSection: React.FC = () => {

  return (
    <>
      {/* Five Revolutionary Steps Section */}
      <section className="relative pt-24 pb-40 lg:pt-32 lg:pb-56 bg-gradient-to-b from-white via-gray-50 to-white overflow-x-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-32 left-20 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-32 right-20 w-72 h-72 bg-purple-500 rounded-full filter blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-hidden">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-5 py-2 mb-12 border border-gray-200 shadow-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-gray-700 text-sm font-medium uppercase tracking-wider">
                The Journey
              </span>
            </div>

            <h2 className="text-4xl lg:text-5xl font-light text-gray-900 tracking-tight">
              Five Revolutionary{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Steps
              </span>
            </h2>
          </div>

          {/* Steps with Creative Number Layout - All Visible */}
          <div className="space-y-16 overflow-x-hidden">
            {steps.map((step, index) => {
              const isEven = index % 2 === 0;

              return (
                <div
                  key={step.id}
                  className="relative overflow-hidden"
                >
                  <div
                    className={`grid grid-cols-1 lg:grid-cols-2 gap-10 items-center overflow-hidden ${
                      isEven ? "" : "lg:grid-flow-dense"
                    }`}
                  >
                    {/* Number with Image */}
                    <div
                      className={`relative overflow-hidden max-w-full ${
                        isEven ? "lg:order-1" : "lg:order-2"
                      }`}
                    >
                      {/* Giant Number - 20% smaller */}
                      <div className="relative overflow-hidden w-full max-w-full">
                        <div
                          className={`text-[200px] lg:text-[220px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-br ${step.color} opacity-20 select-none pointer-events-none w-full`}
                          style={{
                            WebkitTextStroke: "2px rgba(0,0,0,0.05)",
                            maxWidth: "100%",
                          }}
                        >
                          {step.number}
                        </div>

                        {/* Image Inside Number - 20% smaller, NO gradient overlay */}
                        <div
                          className={`absolute ${
                            isEven
                              ? "top-1/3 right-1/4"
                              : "top-1/3 left-1/4"
                          } w-40 h-40 lg:w-48 lg:h-48`}
                        >
                          <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl">
                            <img
                              src={step.image}
                              alt={step.title}
                              className="w-full h-full object-cover"
                              loading={index < 2 ? "eager" : "lazy"}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div
                      className={`space-y-5 ${
                        isEven
                          ? "lg:order-2 lg:text-left"
                          : "lg:order-1 lg:text-right"
                      } text-center`}
                    >
                      {/* Title - 20% smaller */}
                      <h3 className="text-3xl lg:text-4xl font-light text-gray-900 leading-tight">
                        {step.title}
                      </h3>

                      {/* Description - 20% smaller */}
                      <p className="text-base lg:text-lg text-gray-600 leading-relaxed max-w-md mx-auto lg:mx-0 font-light">
                        {step.description}
                      </p>

                      {/* Decorative Line */}
                      <div
                        className={`h-1 w-20 bg-gradient-to-r ${
                          step.color
                        } rounded-full ${
                          isEven ? "lg:mr-auto" : "lg:ml-auto"
                        } mx-auto`}
                      ></div>

                      {/* Progress Indicator */}
                      <div className="flex items-center gap-3 justify-center lg:justify-start overflow-hidden">
                        <div className="flex-1 max-w-xs h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${step.color} rounded-full will-change-auto`}
                            style={{
                              width: `${((index + 1) / steps.length) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold text-gray-700 bg-white px-3 py-1 rounded-full shadow-sm flex-shrink-0">
                          {index + 1}/{steps.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Lazy Load Other Sections */}
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
