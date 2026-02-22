import React from "react";
import { useSiteColors, useSiteTheme } from "../../../contexts/SiteTheme";

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
  const c = useSiteColors();
  const { isDark } = useSiteTheme();

  return (
    <>
      <section className="relative py-24 lg:py-32 overflow-hidden" style={{ background: c.bg.section }}>
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full filter blur-3xl"
            style={{ background: isDark ? "rgba(234,183,118,0.03)" : "rgba(234,183,118,0.06)" }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 lg:mb-20">
            <div className="inline-flex items-center gap-2 mb-8">
              <div className="w-1.5 h-1.5 bg-[#EAB776]/60 rounded-full" />
              <span className="text-xs font-medium uppercase tracking-[0.15em]" style={{ color: c.text.dimmed }}>
                How It Works
              </span>
            </div>

            <h2 className="text-4xl lg:text-6xl font-extralight tracking-[-0.02em] mb-4" style={{ color: c.text.primary }}>
              Five Simple Steps.
            </h2>
            <p className="text-lg lg:text-xl font-light max-w-xl mx-auto" style={{ color: c.text.dimmed }}>
              From check-in to checkout — seamless workflow integration.
            </p>
          </div>

          <div className="space-y-6 lg:space-y-8">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className="group relative backdrop-blur-sm rounded-2xl lg:rounded-3xl transition-all duration-500 overflow-hidden"
                style={{
                  background: c.bg.card,
                  border: `1px solid ${c.border.light}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = c.bg.cardHover;
                  e.currentTarget.style.borderColor = c.border.strong;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = c.bg.card;
                  e.currentTarget.style.borderColor = c.border.light;
                }}
              >
                <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-10 p-6 lg:p-8">
                  <div className="w-full lg:w-72 h-48 lg:h-44 flex-shrink-0 rounded-xl lg:rounded-2xl overflow-hidden">
                    <img
                      src={step.image}
                      alt={step.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading={index < 2 ? "eager" : "lazy"}
                    />
                  </div>

                  <div className="flex-1 text-center lg:text-left">
                    <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#EAB776] to-[#B18059] text-sm font-medium mb-3">
                      Step {step.number}
                    </span>
                    <h3 className="text-2xl lg:text-3xl font-light mb-3 leading-tight" style={{ color: c.text.primary }}>
                      {step.title}
                    </h3>
                    <p className="text-base leading-relaxed font-light max-w-lg" style={{ color: c.text.muted }}>
                      {step.description}
                    </p>
                  </div>

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
