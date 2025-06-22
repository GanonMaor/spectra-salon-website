import React, { useState } from "react";
import { Navigation } from "../../components/Navigation";
import { CTAButton } from "../../components/CTAButton";
import { ContactSection } from "../../components/ContactSection";
import { BACKGROUND_IMAGES } from "../../constants/backgroundImages";

interface Feature {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  longDescription: string;
  gradient: string;
  glowColor: string;
  textColor: string;
  icon: string;
  accentColor: string;
  videoUrl: string;
  benefits: string[];
}

const features: Feature[] = [
  {
    id: "smart-inventory",
    title: "Smart",
    subtitle: "Inventory",
    description: "Track every tube. Know exactly what you have. Never run out again.",
    longDescription: "Revolutionary inventory management that tracks every drop of color in real-time. Smart alerts notify you before you run out, automatic reorder suggestions, and detailed usage analytics help you optimize your stock levels.",
    gradient: "linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%)",
    glowColor: "rgba(0, 122, 255, 0.25)",
    textColor: "#007AFF",
    icon: "📱",
    accentColor: "#007AFF",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Replace with actual video
    benefits: [
      "Real-time inventory tracking",
      "Smart reorder alerts",
      "Usage analytics & insights",
      "Waste reduction reporting",
      "Cost optimization"
    ]
  },
  {
    id: "perfect-color-mix",
    title: "Perfect",
    subtitle: "Color Mix",
    description: "Precise formulas. Zero waste. Every shade, perfectly mixed.",
    longDescription: "AI-powered color mixing that calculates exact formulas for every client. No more guesswork, no more waste. Perfect color matching every time with our proprietary algorithm.",
    gradient: "linear-gradient(135deg, #d4a574 0%, #c79c6d 50%, #b8906b 100%)",
    glowColor: "rgba(212, 165, 116, 0.25)",
    textColor: "#c79c6d",
    icon: "🎨",
    accentColor: "#c79c6d",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Replace with actual video
    benefits: [
      "AI-powered color matching",
      "Precise formula calculations",
      "Zero waste mixing",
      "Custom shade creation",
      "Color history tracking"
    ]
  },
  {
    id: "ai-analytics",
    title: "AI",
    subtitle: "Analytics",
    description: "Smart insights that predict trends and optimize your color inventory.",
    longDescription: "Advanced AI analytics that learn from your salon's patterns. Predict seasonal trends, optimize inventory, and get actionable insights to boost profitability.",
    gradient: "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)",
    glowColor: "rgba(255, 107, 107, 0.25)",
    textColor: "#FF6B6B",
    icon: "🧠",
    accentColor: "#FF6B6B",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Replace with actual video
    benefits: [
      "Predictive trend analysis",
      "Inventory optimization",
      "Profit margin insights",
      "Client preference tracking",
      "Seasonal planning"
    ]
  },
  {
    id: "realtime-tracking",
    title: "Real-time",
    subtitle: "Tracking",
    description: "Live updates on every color usage, waste reduction, and profit margins.",
    longDescription: "Monitor your salon's performance in real-time. Live dashboards show color usage, waste metrics, profit margins, and efficiency scores as they happen.",
    gradient: "linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)",
    glowColor: "rgba(78, 205, 196, 0.25)",
    textColor: "#4ECDC4",
    icon: "📊",
    accentColor: "#4ECDC4",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Replace with actual video
    benefits: [
      "Live performance dashboards",
      "Real-time waste tracking",
      "Instant profit calculations",
      "Efficiency monitoring",
      "Team performance metrics"
    ]
  },
  {
    id: "professional-management",
    title: "Professional",
    subtitle: "Management",
    description: "Complete salon control from one beautiful, intuitive interface.",
    longDescription: "Comprehensive salon management suite that brings everything together. Manage staff, schedule appointments, track inventory, and monitor performance from one elegant dashboard.",
    gradient: "linear-gradient(135deg, #8E8E93 0%, #636366 100%)",
    glowColor: "rgba(142, 142, 147, 0.25)",
    textColor: "#8E8E93",
    icon: "💼",
    accentColor: "#8E8E93",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Replace with actual video
    benefits: [
      "Unified management dashboard",
      "Staff scheduling & tracking",
      "Client management system",
      "Financial reporting",
      "Performance analytics"
    ]
  }
];

export const FeaturesPage: React.FC = () => {
  const [selectedFeature, setSelectedFeature] = useState<string>(features[0].id);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const currentFeature = features.find(f => f.id === selectedFeature) || features[0];

  return (
    <div className="bg-white w-full min-h-screen font-sans antialiased">
      <Navigation 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      
      {/* HERO SECTION - Full Tokki Background */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Full Background Image */}
        <div className="absolute inset-0">
          <img 
            src="/tokki_full.png"
            alt="Revolutionary Hair Styling"
            className="w-full h-full object-cover object-right-bottom"
            style={{ objectPosition: '70% 80%' }}
          />
          {/* Gradient overlay to help text readability on the left */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20"></div>
        </div>

        {/* Floating Elements - Subtle on background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 left-1/4 w-36 h-36 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        </div>
        
        {/* Container with proper padding */}
        <div className="relative z-10 h-full" style={{ paddingLeft: '7vw' }}>
          <div className="flex items-start pt-16 min-h-[80vh]">
            
            {/* Left - Text Content (7% padding + raised up) */}
            <div className="text-white relative z-20 max-w-xl lg:max-w-2xl xl:max-w-3xl">
              
              <h1 className="text-4xl lg:text-6xl xl:text-7xl font-black mb-6 leading-none">
                <span className="bg-gradient-to-r from-cyan-200 via-blue-200 to-purple-200 bg-clip-text text-transparent drop-shadow-2xl">
                  REVOLUTIONARY
                </span>
              </h1>
              <h2 className="text-4xl lg:text-6xl xl:text-7xl font-black mb-8 leading-none">
                <span className="bg-gradient-to-r from-purple-200 via-pink-200 to-rose-200 bg-clip-text text-transparent drop-shadow-2xl">
                  SALON TOOLS
                </span>
              </h2>
              
              <p className="text-lg lg:text-xl xl:text-2xl text-white leading-relaxed mb-12 font-light drop-shadow-lg">
                Five cutting-edge tools that transform your salon into a 
                <span className="font-bold text-cyan-200"> profit-generating machine</span>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6">
                <button className="px-8 py-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full font-black text-white text-lg hover:scale-105 transform transition-all duration-300 shadow-2xl backdrop-blur-sm border border-white/20">
                  ENTER THE FUTURE
                </button>
                
                <button className="px-8 py-4 bg-white/20 backdrop-blur-xl border-2 border-white/30 rounded-full font-bold text-white text-lg hover:bg-white/30 transition-all duration-300 shadow-xl">
                  Watch Demo
                </button>
              </div>
            </div>

            {/* Right - Space for Tokki (rest of the screen) */}
            <div className="flex-1"></div>
          </div>
        </div>
        
        {/* Bottom Gradient Transition to dark section */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
      </section>

      {/* FEATURES SHOWCASE - Dark Glass Effect */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-gray-900 via-slate-800 to-gray-900 relative overflow-hidden">
        {/* Dark Glass Background Layer */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-gray-900/60 to-black/40 backdrop-blur-3xl"></div>
        
        {/* Colorful floating elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-6 h-6 bg-cyan-400 rounded-full animate-pulse filter blur-sm"></div>
          <div className="absolute top-1/3 right-1/3 w-4 h-4 bg-purple-400 rounded-full animate-pulse animation-delay-1000 filter blur-sm"></div>
          <div className="absolute bottom-1/4 left-1/3 w-8 h-8 bg-pink-400 rounded-full animate-pulse animation-delay-2000 filter blur-sm"></div>
          <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-orange-400 rounded-full animate-pulse animation-delay-3000 filter blur-sm"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
          
          {/* Features Grid - Glass Cards */}
          <div className="grid gap-20 mb-20">
            {features.map((feature, index) => (
              <div
                key={feature.id}
                className="group cursor-pointer"
                onClick={() => setSelectedFeature(feature.id)}
              >
                <div className={`grid lg:grid-cols-2 gap-16 items-center ${
                  index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
                }`}>
                  
                  {/* Image Side - Glass Card */}
                  <div className={`relative ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                    <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl bg-white/5 backdrop-blur-xl border border-white/10">
                      {/* Colorful overlay based on feature */}
                      <div 
                        className="absolute inset-0 opacity-30"
                        style={{
                          background: index === 0 ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' :
                                     index === 1 ? 'linear-gradient(135deg, #8b5cf6, #a855f7)' :
                                     index === 2 ? 'linear-gradient(135deg, #ec4899, #f43f5e)' :
                                     index === 3 ? 'linear-gradient(135deg, #f59e0b, #ef4444)' :
                                     'linear-gradient(135deg, #10b981, #06b6d4)'
                        }}
                      />
                      
                      {/* Glass overlay for depth */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-white/10"></div>
                      
                      {/* Placeholder content */}
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <div className="text-center">
                          <div className="text-6xl mb-4">{feature.icon}</div>
                          <div className="text-2xl font-bold text-white">{feature.title}</div>
                          <div className="text-xl text-white/80">{feature.subtitle}</div>
                          <div className="text-sm text-white/60 mt-2">Image Coming Soon</div>
                        </div>
                      </div>
                      
                      {/* Play Button - Glass Style */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div 
                          className="w-20 h-20 rounded-full flex items-center justify-center border border-white/30 shadow-xl group-hover:scale-110 transition-transform duration-300 backdrop-blur-xl"
                          style={{
                            background: index === 0 ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(59, 130, 246, 0.3))' :
                                       index === 1 ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(168, 85, 247, 0.3))' :
                                       index === 2 ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.3), rgba(244, 63, 94, 0.3))' :
                                       index === 3 ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(239, 68, 68, 0.3))' :
                                       'linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(6, 182, 212, 0.3))'
                          }}
                        >
                          <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8 5v10l8-5-8-5z"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    {/* Floating Stats - Glass Style */}
                    <div 
                      className="absolute -bottom-4 -right-4 rounded-2xl p-4 border border-white/20 shadow-xl backdrop-blur-xl"
                      style={{
                        background: index === 0 ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.8), rgba(59, 130, 246, 0.8))' :
                                   index === 1 ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.8), rgba(168, 85, 247, 0.8))' :
                                   index === 2 ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.8), rgba(244, 63, 94, 0.8))' :
                                   index === 3 ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.8), rgba(239, 68, 68, 0.8))' :
                                   'linear-gradient(135deg, rgba(16, 185, 129, 0.8), rgba(6, 182, 212, 0.8))'
                      }}
                    >
                      <div className="text-white text-center">
                        <div className="text-2xl font-bold">
                          {index === 0 ? '97%' : index === 1 ? '100%' : index === 2 ? '+34%' : index === 3 ? '24/7' : '5★'}
                        </div>
                        <div className="text-xs text-white/90">
                          {index === 0 ? 'Less Waste' : index === 1 ? 'Accuracy' : index === 2 ? 'Profit' : index === 3 ? 'Live Data' : 'Rating'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content Side - Bright text on dark glass */}
                  <div className={`${index % 2 === 1 ? 'lg:col-start-1' : ''}`}>
                    <div className="space-y-8">
                      <div>
                        <div className="flex items-center gap-3 mb-6">
                          <div 
                            className="w-12 h-1 rounded-full"
                            style={{
                              background: index === 0 ? 'linear-gradient(to right, #06b6d4, #3b82f6)' :
                                         index === 1 ? 'linear-gradient(to right, #8b5cf6, #a855f7)' :
                                         index === 2 ? 'linear-gradient(to right, #ec4899, #f43f5e)' :
                                         index === 3 ? 'linear-gradient(to right, #f59e0b, #ef4444)' :
                                         'linear-gradient(to right, #10b981, #06b6d4)'
                            }}
                          />
                          <span className="text-white/70 font-semibold uppercase tracking-wide text-sm">
                            Tool #{index + 1}
                          </span>
                        </div>
                        
                        <h3 className="text-4xl lg:text-6xl font-black text-white mb-4 leading-tight">
                          <span 
                            className="bg-clip-text text-transparent"
                            style={{
                              backgroundImage: index === 0 ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' :
                                              index === 1 ? 'linear-gradient(135deg, #8b5cf6, #a855f7)' :
                                              index === 2 ? 'linear-gradient(135deg, #ec4899, #f43f5e)' :
                                              index === 3 ? 'linear-gradient(135deg, #f59e0b, #ef4444)' :
                                              'linear-gradient(135deg, #10b981, #06b6d4)'
                            }}
                          >
                            {feature.title}
                          </span>
                          <br />
                          <span className="text-white">
                            {feature.subtitle}
                          </span>
                        </h3>
                        
                        <p className="text-xl lg:text-2xl text-white/80 leading-relaxed mb-8">
                          {feature.longDescription}
                        </p>
                      </div>

                      {/* Benefits - Glass Cards */}
                      <div className="grid gap-4">
                        {feature.benefits.slice(0, 3).map((benefit, idx) => (
                          <div key={idx} className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg">
                            <div 
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
                              style={{
                                background: idx === 0 ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' :
                                           idx === 1 ? 'linear-gradient(135deg, #8b5cf6, #a855f7)' :
                                           'linear-gradient(135deg, #ec4899, #f43f5e)'
                              }}
                            >
                              ✓
                            </div>
                            <span className="text-white/90 font-medium">{benefit}</span>
                          </div>
                        ))}
                      </div>

                      {/* CTA Button - Colorful with glass */}
                      <button 
                        className="px-8 py-4 rounded-full font-black text-white text-lg hover:scale-105 transform transition-all duration-300 shadow-2xl border border-white/20 backdrop-blur-xl"
                        style={{
                          background: index === 0 ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' :
                                     index === 1 ? 'linear-gradient(135deg, #8b5cf6, #a855f7)' :
                                     index === 2 ? 'linear-gradient(135deg, #ec4899, #f43f5e)' :
                                     index === 3 ? 'linear-gradient(135deg, #f59e0b, #ef4444)' :
                                     'linear-gradient(135deg, #10b981, #06b6d4)'
                        }}
                      >
                        ACTIVATE {feature.title.toUpperCase()} ✨
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Final Mission Control - Dark Glass */}
          <div className="text-center bg-white/5 backdrop-blur-3xl rounded-3xl p-12 lg:p-20 border border-white/10 shadow-2xl">
            {/* Glass overlay for extra depth */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/10 rounded-3xl"></div>
            
            <div className="relative">
              <h3 className="text-4xl lg:text-6xl font-black text-white mb-8 leading-tight">
                <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  MISSION CONTROL
                </span>
                <br />
                <span className="text-white">ACTIVATED</span> ✨
              </h3>
              
              <p className="text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
                Join the revolution. Transform your salon into a profit-generating machine with tools from the future.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <button className="px-12 py-5 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full font-black text-white text-xl hover:scale-105 transform transition-all duration-300 shadow-2xl">
                  START MISSION ✨
                </button>
                
                <button className="px-12 py-5 bg-white/10 backdrop-blur-xl border-2 border-white/30 rounded-full font-bold text-white text-xl hover:bg-white/20 transition-all duration-300">
                  WATCH MAGIC ▶
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <ContactSection 
        backgroundImage={BACKGROUND_IMAGES.modernSalon}
        title="Ready for"
        subtitle="Magic?"
        description="Join the revolution and transform your salon with tools from the future."
      />
    </div>
  );
};

export default FeaturesPage; 