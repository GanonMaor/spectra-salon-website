"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Feature {
  id: string;
  title: string;
  description: string;
  image: string;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

const features: Feature[] = [
  {
    id: "inventory-tracking",
    title: "Real-Time Inventory",
    description: "Track every tube in real-time. Know exactly what you have and when to reorder.",
    image: "/inventory.png",
    position: "top-left"
  },
  {
    id: "color-matching",
    title: "AI Color Matching",
    description: "Perfect color formulas powered by artificial intelligence. Zero waste, perfect results.",
    image: "/inventory.png", 
    position: "top-right"
  },
  {
    id: "usage-analytics",
    title: "Smart Analytics",
    description: "Detailed insights into color usage patterns and profitability metrics.",
    image: "/inventory.png",
    position: "bottom-left"
  },
  {
    id: "waste-reduction",
    title: "Waste Prevention",
    description: "Advanced algorithms predict and prevent color waste before it happens.",
    image: "/inventory.png",
    position: "bottom-right"
  }
];

export const SmartColorTrackingSection: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<number>(0);

  const getPositionClasses = (position: string) => {
    switch (position) {
      case "top-left":
        return "absolute top-12 left-12 lg:top-20 lg:left-20 text-left";
      case "top-right":
        return "absolute top-12 right-12 lg:top-20 lg:right-20 text-right";
      case "bottom-left":
        return "absolute bottom-12 left-12 lg:bottom-20 lg:left-20 text-left";
      case "bottom-right":
        return "absolute bottom-12 right-12 lg:bottom-20 lg:right-20 text-right";
      default:
        return "";
    }
  };

  const getFeatureGradient = (index: number) => {
    const gradients = [
      "from-blue-500 via-cyan-500 to-teal-500",
      "from-purple-500 via-pink-500 to-rose-500", 
      "from-orange-500 via-amber-500 to-yellow-500",
      "from-emerald-500 via-green-500 to-lime-500"
    ];
    return gradients[index] || gradients[0];
  };

  const getFeatureIcon = (index: number) => {
    const icons = ["📊", "🧠", "📈", "🔄"];
    return icons[index] || "📱";
  };

  return (
    <section className="relative py-24 lg:py-32 bg-white overflow-hidden">
      {/* AI Watermark Background - HUGE */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <img 
          src="/assets/ai-watermark.png"
          alt=""
          className="w-[120vw] h-[120vh] object-contain opacity-[0.07] select-none"
          style={{ filter: 'blur(0.5px)' }}
        />
      </div>

      {/* Background Circle Layers - Using Spectra Logo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Single Spectra Logo with All Effects */}
        <img 
          src="/spectra_logo.png"
          alt=""
          className="w-[800px] h-[800px] lg:w-[1000px] lg:h-[1000px] object-contain opacity-[0.03] select-none"
          style={{ filter: 'blur(0.5px)' }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
        
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 bg-[#BE8B6B]/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-[#BE8B6B]/20">
            <div className="w-2 h-2 bg-[#BE8B6B] rounded-full animate-pulse"></div>
            <span className="text-[#BE8B6B] text-sm font-bold uppercase tracking-wider">Smart Technology</span>
          </div>
          
          <h2 className="text-4xl lg:text-6xl font-light text-gray-900 mb-6 leading-tight">
            Smart Color <span className="text-[#BE8B6B] font-semibold">Tracking</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Four revolutionary features that transform how you manage color inventory and reduce waste
          </p>
        </div>

        {/* Interactive Circle Layout */}
        <div className="relative min-h-[800px] lg:min-h-[1000px] flex items-center justify-center mb-20">
          
          {/* Feature Boxes Around Circle - Tighter & Closer */}
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className={`${getPositionClasses(feature.position)} max-w-[280px] cursor-pointer group z-10`}
              onMouseEnter={() => setActiveFeature(index)}
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -4 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={`
                  relative backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-xl
                  transition-all duration-300 border border-white/20
                  ${activeFeature === index ? 'shadow-xl ring-1 ring-[#BE8B6B]/30' : ''}
                  bg-white/90
                `}
              >
                {/* Content - Tighter Padding */}
                <div className="p-6 text-center">
                  {/* Big Number/Stat */}
                  <div className={`
                    text-4xl lg:text-5xl font-light mb-1 transition-colors duration-300
                    ${index === 0 ? 'text-green-500' : 
                      index === 1 ? 'text-purple-500' : 
                      index === 2 ? 'text-orange-500' : 
                      'text-blue-500'}
                  `}>
                    {index === 0 ? '85%' : 
                     index === 1 ? '40%' : 
                     index === 2 ? '5min' : 
                     '99%'}
                  </div>
                  
                  {/* Category Title */}
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                    {index === 0 ? 'Less Waste' : 
                     index === 1 ? 'More Profit' : 
                     index === 2 ? 'Setup Time' : 
                     'Accuracy'}
                  </div>
                  
                  {/* Description */}
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {index === 0 ? 'Reduce color waste dramatically' : 
                     index === 1 ? 'Increase your bottom line' : 
                     index === 2 ? 'Quick and easy installation' : 
                     'Perfect color matching every time'}
                  </p>
                  
                  {/* Active Indicator */}
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <div className={`
                      w-1.5 h-1.5 rounded-full transition-all duration-300
                      ${activeFeature === index ? 'bg-[#BE8B6B] scale-125' : 'bg-gray-300'}
                    `} />
                  </div>
                </div>
              </motion.div>
            </div>
          ))}

          {/* Central Dynamic Image - HIGHER Z-INDEX & 15% BIGGER */}
          <div className="relative z-30 w-[690px] h-[690px] lg:w-[920px] lg:h-[920px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature}
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotate: 5 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                {/* Image without any background frame */}
                <img
                  src={features[activeFeature].image}
                  alt={features[activeFeature].title}
                  className="w-full h-full object-contain transition-all duration-500"
                  style={{ 
                    objectFit: 'contain',
                    objectPosition: 'center',
                    filter: 'drop-shadow(0 30px 60px rgba(0, 0, 0, 0.2)) drop-shadow(0 10px 30px rgba(190, 139, 107, 0.1))'
                  }}
                  onError={(e) => {
                    // Fallback if image doesn't exist
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = `
                      <div class="w-full h-full flex items-center justify-center">
                        <div class="text-center text-[#BE8B6B] p-8">
                          <div class="text-9xl mb-6 opacity-60">${getFeatureIcon(activeFeature)}</div>
                          <div class="text-3xl font-bold mb-2">${features[activeFeature].title}</div>
                          <div class="text-xl opacity-70">Demo Interface</div>
                        </div>
                      </div>
                    `;
                  }}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Connecting Lines with Dynamic Colors */}
          <div className="absolute inset-0 pointer-events-none z-20">
            {features.map((_, index) => (
              <motion.div
                key={`line-${index}`}
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: activeFeature === index ? 0.8 : 0.2,
                  scale: activeFeature === index ? 1.1 : 1
                }}
                transition={{ duration: 0.3 }}
                className="absolute w-1 h-32 rounded-full"
                style={{
                  background: `linear-gradient(to top, ${
                    index === 0 ? 'rgba(59, 130, 246, 0.5)' :
                    index === 1 ? 'rgba(168, 85, 247, 0.5)' :
                    index === 2 ? 'rgba(245, 158, 11, 0.5)' :
                    'rgba(34, 197, 94, 0.5)'
                  }, transparent)`,
                  top: index < 2 ? '25%' : 'auto',
                  bottom: index >= 2 ? '25%' : 'auto',
                  left: index % 2 === 0 ? '25%' : 'auto',
                  right: index % 2 === 1 ? '25%' : 'auto',
                }}
              />
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-8 font-light">
            Experience all four features working together in perfect harmony
          </p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-12 py-4 bg-gradient-to-r from-[#BE8B6B] to-[#A67C52] text-white font-semibold text-lg rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300"
          >
            Start Free Trial
          </motion.button>
        </div>

        {/* Smooth Transition to Next Section */}
        <div className="text-center mt-20">
          <div className="w-px h-12 bg-gradient-to-b from-[#BE8B6B]/50 to-transparent mx-auto"></div>
        </div>

      </div>
    </section>
  );
};

export default SmartColorTrackingSection; 