import React, { useState } from "react";

interface SmartFeature {
  id: string;
  title: string;
  description: string;
  image: string;
  position: string;
  textAlign: string;
}

const smartFeatures: SmartFeature[] = [
  {
    id: "inventory-tracking",
    title: "Smart Inventory Tracking",
    description:
      "Track every tube and color in real-time with AI-powered precision. Never run out of your most popular shades again.",
    image: "/assets/feature-0.png",
    position: "top-left",
    textAlign: "text-left",
  },
  {
    id: "color-matching",
    title: "AI Color Matching",
    description:
      "Perfect color matches every time using our advanced AI algorithms. Reduce waste by up to 85% with precise formulations.",
    image: "/assets/feature-1.png",
    position: "top-right",
    textAlign: "text-right",
  },
  {
    id: "predictive-analytics",
    title: "Predictive Analytics",
    description:
      "Forecast trends and optimize your inventory with machine learning insights that understand your salon's unique patterns.",
    image: "/assets/feature-2.png",
    position: "bottom-left",
    textAlign: "text-left",
  },
  {
    id: "profit-optimization",
    title: "Profit Optimization",
    description:
      "Maximize your margins with intelligent pricing suggestions and waste reduction analytics that boost your bottom line.",
    image: "/assets/feature-3.png",
    position: "bottom-right",
    textAlign: "text-right",
  },
];

export const SmartColorTracking: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<number>(0);

  const getFeaturePosition = (position: string) => {
    const positions = {
      "top-left": "absolute top-16 left-16 max-w-xs",
      "top-right": "absolute top-16 right-16 max-w-xs",
      "bottom-left": "absolute bottom-16 left-16 max-w-xs",
      "bottom-right": "absolute bottom-16 right-16 max-w-xs",
    };
    return (
      positions[position as keyof typeof positions] || positions["top-left"]
    );
  };

  return (
    <section className="relative py-20 lg:py-32 bg-gray-50 overflow-hidden min-h-screen">
      {/* AI Watermark Background - Very Subtle */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
        <div className="text-[#BE8B6B] text-[300px] font-black tracking-widest">
          AI
        </div>
      </div>

      {/* Section Header */}
      <div className="relative z-30 text-center mb-20">
        <h2 className="text-4xl lg:text-5xl font-light text-gray-800 mb-4 leading-tight">
          Smart Color{" "}
          <span className="text-[#BE8B6B] font-semibold">Tracking</span>
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Discover the four pillars of intelligent salon management
        </p>
      </div>

      {/* Main Interactive Area */}
      <div className="relative max-w-7xl mx-auto px-8">
        <div className="relative h-[700px] flex items-center justify-center">
          {/* Background Circle - Golden/Brown like in image */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#D4A574] via-[#BE8B6B] to-[#A67960] shadow-2xl"></div>
          </div>

          {/* Dashed Circle Overlays */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-[600px] h-[600px] rounded-full border-2 border-dashed border-gray-400/30"
              style={{ animation: "spin 30s linear infinite" }}
            ></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-[450px] h-[450px] rounded-full border-2 border-dashed border-gray-400/40"
              style={{ animation: "spin 25s linear infinite reverse" }}
            ></div>
          </div>

          {/* Central iPad/Tablet */}
          <div className="relative z-10 w-[280px] h-[380px]">
            <div className="w-full h-full bg-black rounded-[20px] shadow-2xl p-2">
              <div className="w-full h-full bg-white rounded-[16px] overflow-hidden">
                {/* Dynamic content based on active feature */}
                <img
                  src={smartFeatures[activeFeature].image}
                  alt={smartFeatures[activeFeature].title}
                  className="w-full h-full object-cover transition-all duration-500 ease-in-out"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjM4MCIgdmlld0JveD0iMCAwIDI4MCAzODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMzgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjE0MCIgY3k9IjE5MCIgcj0iNDAiIGZpbGw9IiNCRThCNkIiLz4KPHR4dCB4PSIxNDAiIHk9IjI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjc3NDhEIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5TcGVjdHJhIERhc2hib2FyZDwvdHh0Pgo8L3N2Zz4K";
                  }}
                />
              </div>
            </div>
          </div>

          {/* Color Tubes Around Tablet - Like in the image */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-32 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-16 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full shadow-lg rotate-12"></div>
            <div className="absolute bottom-32 right-1/2 transform translate-x-1/2 translate-y-1/2 w-8 h-16 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full shadow-lg -rotate-45"></div>
            <div className="absolute left-32 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-16 bg-gradient-to-b from-purple-400 to-purple-600 rounded-full shadow-lg rotate-45"></div>
          </div>

          {/* Feature Text Boxes - Positioned like in image */}
          {smartFeatures.map((feature, index) => (
            <div
              key={feature.id}
              className={`${getFeaturePosition(feature.position)} z-20 cursor-pointer`}
              onMouseEnter={() => setActiveFeature(index)}
            >
              <div
                className={`p-6 transition-all duration-300 ${
                  activeFeature === index ? "text-[#BE8B6B]" : "text-gray-600"
                }`}
              >
                <h3
                  className={`text-lg font-bold mb-3 ${feature.textAlign} transition-colors duration-300`}
                >
                  {feature.title}
                </h3>
                <p
                  className={`text-sm leading-relaxed ${feature.textAlign} ${
                    activeFeature === index ? "text-gray-700" : "text-gray-500"
                  }`}
                >
                  {feature.description}
                </p>

                {/* Active line indicator */}
                {activeFeature === index && (
                  <div
                    className={`mt-4 h-0.5 bg-[#BE8B6B] transition-all duration-300 ${
                      feature.textAlign === "text-right" ? "ml-auto" : ""
                    }`}
                    style={{ width: "60px" }}
                  />
                )}
              </div>
            </div>
          ))}

          {/* Feature Indicators */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex gap-3 z-30">
            {smartFeatures.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  activeFeature === index
                    ? "bg-[#BE8B6B] scale-125"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                onClick={() => setActiveFeature(index)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="relative z-30 text-center mt-16">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-2xl lg:text-3xl font-light text-gray-800 mb-4">
            Experience the{" "}
            <span className="text-[#BE8B6B] font-semibold">Future</span>
          </h3>
          <p className="text-gray-600 mb-8 leading-relaxed">
            See how Smart Color Tracking transforms your salon operations
          </p>

          <button className="group relative px-10 py-4 bg-gradient-to-r from-[#BE8B6B] to-[#D4A574] hover:from-[#A67960] hover:to-[#BE8B6B] text-white font-semibold text-lg rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105">
            <span className="relative z-10">Try Smart Tracking</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default SmartColorTracking;
