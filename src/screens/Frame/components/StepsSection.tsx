import React from "react";

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
      "Client arrives and checks in using our simple interface. The stylist instantly sees visit history and preferences.",
    image: "/stap 1 chack in.jpeg",
    color: "from-[#EAB776] to-[#B18059]",
  },
  {
    id: "select-service",
    number: "02",
    title: "Select Service",
    description: "Choose the hair service and color treatment needed. The app recommends the exact formula and timing.",
    image: "/stepn 2 select service.jpeg",
    color: "from-[#EAB776] to-[#B18059]",
  },
  {
    id: "scan-tube",
    number: "03",
    title: "Scan Tube",
    description: "Scan the hair color tube to track usage automatically. Inventory updates in real time for full visibility.",
    image: "/step 3 scan tube.jpeg",
    color: "from-[#EAB776] to-[#B18059]",
  },
  {
    id: "squeeze-color",
    number: "04",
    title: "Squeeze Color",
    description: "Dispense the exact amount needed - no waste, perfect results. The scale guides you with precise grams.",
    image: "/step 4 squiz the color.jpeg",
    color: "from-[#EAB776] to-[#B18059]",
  },
  {
    id: "track-save",
    number: "05",
    title: "Track & Save",
    description: "System automatically tracks usage and calculates savings. Owners get clean reports and measurable ROI.",
    image: "/step_5.jpg",
    color: "from-[#EAB776] to-[#B18059]",
  },
];

export const StepsSection: React.FC = () => {

  return (
    <>
      {/* Five Steps Section - Clean Dark Premium Style */}
      <section className="relative py-24 lg:py-32 bg-black overflow-hidden">
        {/* Subtle background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#EAB776]/3 rounded-full filter blur-3xl"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16 lg:mb-20">
            <div className="inline-flex items-center gap-2 mb-8">
              <div className="w-1.5 h-1.5 bg-[#EAB776]/60 rounded-full" />
              <span className="text-white/40 text-xs font-medium uppercase tracking-[0.15em]">
                How It Works
              </span>
            </div>

            <h2 className="text-4xl lg:text-6xl font-extralight text-white tracking-[-0.02em] mb-4">
              Five Simple Steps.
            </h2>
            <p className="text-lg lg:text-xl text-white/40 font-light max-w-xl mx-auto">
              From check-in to checkout — seamless workflow integration.
            </p>
          </div>

          {/* Steps - Clean Card Layout */}
          <div className="space-y-6 lg:space-y-8">
            {steps.map((step, index) => (
              <div 
                key={step.id} 
                className="group relative bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-sm rounded-2xl lg:rounded-3xl border border-white/[0.06] hover:border-white/10 transition-all duration-500 overflow-hidden"
              >
                <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-10 p-6 lg:p-8">
                  {/* Image */}
                  <div className="w-full lg:w-72 h-48 lg:h-44 flex-shrink-0 rounded-xl lg:rounded-2xl overflow-hidden">
                    <img
                      src={step.image}
                      alt={step.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading={index < 2 ? "eager" : "lazy"}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-center lg:text-left">
                    {/* Step Number */}
                    <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#EAB776] to-[#B18059] text-sm font-medium mb-3">
                      Step {step.number}
                    </span>

                    {/* Title */}
                    <h3 className="text-2xl lg:text-3xl font-light text-white mb-3 leading-tight">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-base text-white/50 leading-relaxed font-light max-w-lg">
                      {step.description}
                    </p>
                  </div>

                  {/* Step indicator on right */}
                  <div className="hidden lg:flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#EAB776]/20 to-[#B18059]/10 border border-[#EAB776]/20 flex items-center justify-center">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EAB776] to-[#B18059] text-lg font-medium">{index + 1}</span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="w-px h-8 bg-gradient-to-b from-[#EAB776]/30 to-transparent" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
    </>
  );
};
