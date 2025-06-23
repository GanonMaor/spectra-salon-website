import React, { useState, useEffect } from "react";
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
  icon: string;
  image: string;
  benefits: string[];
}

const features: Feature[] = [
  {
    id: "smart-inventory",
    title: "Smart Inventory",
    subtitle: "Track & Optimize",
    description: "Never run out of color again with AI-powered inventory tracking.",
    longDescription: "Revolutionary inventory management that tracks every drop of color in real-time. Smart alerts notify you before you run out, automatic reorder suggestions, and detailed usage analytics help you optimize your stock levels.",
    icon: "📱",
    image: "/assets/ai-featuer.png",
    benefits: [
      "Real-time tracking",
      "Smart alerts", 
      "Usage analytics",
      "Waste reduction",
      "Cost optimization"
    ]
  },
  {
    id: "perfect-color-mix",
    title: "Perfect Color Mix",
    subtitle: "Zero Waste Formula",
    description: "AI-powered precision mixing for perfect color every time.",
    longDescription: "AI-powered color mixing that calculates exact formulas for every client. No more guesswork, no more waste. Perfect color matching every time with our proprietary algorithm.",
    icon: "🎨",
    image: "/assets/feature-style.png",
    benefits: [
      "AI color matching",
      "Precise formulas",
      "Zero waste",
      "Custom shades",
      "Color history"
    ]
  },
  {
    id: "ai-analytics",
    title: "AI Analytics",
    subtitle: "Smart Insights", 
    description: "Predict trends and optimize your color business with AI.",
    longDescription: "Advanced AI analytics that learn from your salon's patterns. Predict seasonal trends, optimize inventory, and get actionable insights to boost profitability.",
    icon: "🧠",
    image: "/assets/Smart Color Tracking.png",
    benefits: [
      "Trend prediction",
      "Inventory optimization",
      "Profit insights",
      "Client tracking",
      "Seasonal planning"
    ]
  },
  {
    id: "realtime-tracking",
    title: "Real-time Tracking",
    subtitle: "Live Performance",
    description: "Monitor every aspect of your salon in real-time.",
    longDescription: "Monitor your salon's performance in real-time. Live dashboards show color usage, waste metrics, profit margins, and efficiency scores as they happen.",
    icon: "📊",
    image: "/assets/feature-position.png",
    benefits: [
      "Live dashboards",
      "Waste tracking",
      "Profit calculations",
      "Efficiency monitoring",
      "Team metrics"
    ]
  },
  {
    id: "professional-management",
    title: "Professional Management",
    subtitle: "Complete Control",
    description: "Manage your entire salon from one beautiful interface.",
    longDescription: "Comprehensive salon management suite that brings everything together. Manage staff, schedule appointments, track inventory, and monitor performance from one elegant dashboard.",
    icon: "💼",
    image: "/assets/ai-featuer.png",
    benefits: [
      "Unified dashboard",
      "Staff scheduling",
      "Client management",
      "Financial reporting",
      "Performance analytics"
    ]
  }
];

export const FeaturesPage: React.FC = () => {
  const [selectedFeatureIdx, setSelectedFeatureIdx] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setSelectedFeatureIdx((prev) => (prev === features.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handlePrev = () => {
    setIsAutoPlaying(false);
    setSelectedFeatureIdx((prev) => (prev === 0 ? features.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setSelectedFeatureIdx((prev) => (prev === features.length - 1 ? 0 : prev + 1));
  };

  const handleCardClick = (idx: number) => {
    setIsAutoPlaying(false);
    setSelectedFeatureIdx(idx);
  };

  // Touch/swipe support
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) handleNext();
    if (isRightSwipe) handlePrev();
  };

  return (
    <div className="w-full min-h-screen font-sans antialiased relative overflow-hidden">
      
      {/* Sophisticated Pink Gradient Background - Fixed */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse at top left, #FF6B9D 0%, #E85A8A 25%, #D14876 50%, #B73E63 75%, #9F2746 100%),
            linear-gradient(135deg, #FF81A2 0%, #E85A8A 20%, #D14876 40%, #C15571 60%, #B73E63 80%, #9F2746 100%),
            linear-gradient(45deg, #FF6B9D 0%, #E85A8A 30%, #D14876 60%, #9F2746 100%)
          `,
          backgroundBlendMode: 'multiply, normal, overlay'
        }}
      />
      
      {/* Enhanced Glass Effect on Background */}
      <div className="fixed inset-0 z-5 bg-white/20 backdrop-blur-md"></div>
      
      {/* Pink Hair Girl Image with Advanced Glass Effect */}
      <div 
        className="fixed inset-0 z-15 pointer-events-none"
        style={{
          backgroundImage: `url('/assets/pink-hair-only_bg.png')`,
          backgroundSize: 'contain',
          backgroundPosition: 'center right',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
        }}
      />
      
      {/* Multi-layered Glass Effect on Girl */}
      <div className="fixed inset-0 z-16 pointer-events-none">
        {/* Primary glass layer */}
        <div 
          className="absolute inset-0 bg-gradient-to-l from-white/30 via-transparent to-transparent backdrop-blur-[2px]"
          style={{
            maskImage: `url('/assets/pink-hair-only_bg.png')`,
            maskSize: 'contain',
            maskPosition: 'center right',
            maskRepeat: 'no-repeat',
            WebkitMaskImage: `url('/assets/pink-hair-only_bg.png')`,
            WebkitMaskSize: 'contain',
            WebkitMaskPosition: 'center right',
            WebkitMaskRepeat: 'no-repeat',
          }}
        />
        
        {/* Secondary glass reflection */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-pink-200/20 backdrop-blur-[1px]"
          style={{
            maskImage: `url('/assets/pink-hair-only_bg.png')`,
            maskSize: 'contain',
            maskPosition: 'center right',
            maskRepeat: 'no-repeat',
            WebkitMaskImage: `url('/assets/pink-hair-only_bg.png')`,
            WebkitMaskSize: 'contain',
            WebkitMaskPosition: 'center right',
            WebkitMaskRepeat: 'no-repeat',
          }}
        />
        
        {/* Holographic shimmer effect */}
        <div 
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/25 to-transparent opacity-50 animate-pulse"
          style={{
            maskImage: `url('/assets/pink-hair-only_bg.png')`,
            maskSize: 'contain',
            maskPosition: 'center right',
            maskRepeat: 'no-repeat',
            WebkitMaskImage: `url('/assets/pink-hair-only_bg.png')`,
            WebkitMaskSize: 'contain',
            WebkitMaskPosition: 'center right',
            WebkitMaskRepeat: 'no-repeat',
            animationDuration: '3s',
          }}
        />
      </div>
      
      {/* Content Layer */}
      <div className="relative z-20">
        <Navigation 
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
        
        {/* HERO SECTION */}
        <section className="relative py-20 lg:py-32 overflow-hidden min-h-screen">
          
          {/* Floating Glass Orbs */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full animate-pulse backdrop-blur-xl"></div>
            <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/5 rounded-full animate-pulse delay-1000 backdrop-blur-xl"></div>
            <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white/15 rounded-full animate-pulse delay-2000 backdrop-blur-xl"></div>
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-8 sm:px-12 lg:px-16">
            <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
              
              {/* Left Side - AI Feature Image */}
              <div className="relative">
                
                {/* Enhanced Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-pink-200/20 rounded-3xl blur-3xl scale-110"></div>
                
                {/* Main Screen Image */}
                <div className="relative">
                  <img 
                    src="/assets/ai-featuer.png" 
                    alt="AI Color Intelligence"
                    className="w-full h-auto relative z-10 drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Enhanced Glass Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-white/5 to-white/15 rounded-3xl backdrop-blur-sm"></div>
                  
                  {/* Multiple Reflection Effects */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent rounded-3xl"></div>
                  <div className="absolute -bottom-10 left-0 w-full h-20 bg-gradient-to-t from-white/10 to-transparent rounded-b-3xl blur-xl"></div>
                </div>
                
                {/* Enhanced Floating Stats */}
                <div className="absolute -bottom-4 -right-8 bg-white/25 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-2xl">
                  <div className="text-white text-center">
                    <div className="text-3xl font-extralight mb-1">57s</div>
                    <div className="text-sm text-white/80">Mix Time</div>
                  </div>
                </div>
                
                <div className="absolute -top-4 -left-8 bg-white/25 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-2xl">
                  <div className="text-white text-center">
                    <div className="text-3xl font-extralight mb-1">0</div>
                    <div className="text-sm text-white/80">Friction</div>
                  </div>
                </div>
              </div>

              {/* Right Side - Content */}
              <div className="space-y-8">
                
                {/* Why Choose Us Badge */}
                <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-xl rounded-full px-6 py-3 border border-white/40">
                  <div className="w-2 h-2 bg-gradient-to-r from-white to-pink-100 rounded-full animate-pulse"></div>
                  <span className="text-white/90 text-sm font-medium uppercase tracking-[0.3em]">Why Choose Us?</span>
                </div>
                
                {/* Main Headlines */}
                <div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extralight text-white/95 mb-4 leading-[0.9] tracking-[-0.02em] drop-shadow-lg">
                    No Friction.
                  </h1>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-light mb-8 leading-[0.9] tracking-[-0.02em]">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-orange-200 to-red-200 drop-shadow-xl">
                      AI
                    </span>
                    <span className="text-white/95 drop-shadow-lg"> Identification.</span>
                  </h1>
                </div>
                
                {/* Description */}
                <div className="space-y-6">
                  <p className="text-lg lg:text-xl text-white/85 leading-relaxed font-light drop-shadow-md">
                    We've extensively studied the process to ensure a frictionless experience, 
                    with our unique <span className="font-semibold text-yellow-200">Scan & Squeeze AI Identification</span> Fitter.
                  </p>
                  
                  <p className="text-lg lg:text-xl text-white/85 leading-relaxed font-light drop-shadow-md">
                    The average mix preparation time using our system is just <span className="font-semibold text-yellow-200">57 seconds globally</span>. 
                    We understand that everything must be visual and without screen taps, which is why we're a <span className="font-semibold text-yellow-200">Game Changer</span>.
                  </p>
                </div>
                
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-6 pt-4">
                  <button className="px-10 py-5 bg-white/30 border border-white/50 rounded-full font-semibold text-white text-lg hover:scale-105 hover:bg-white/40 transform transition-all duration-300 shadow-2xl backdrop-blur-xl">
                    Try AI Scanner
                  </button>
                  
                  <button className="px-10 py-5 bg-transparent border-2 border-white/60 rounded-full font-medium text-white text-lg hover:bg-white/15 backdrop-blur-xl transition-all duration-300 shadow-xl">
                    Watch Demo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* APPLE-STYLE FEATURES CAROUSEL */}
        <section className="py-20 lg:py-32 relative overflow-hidden">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
            
            {/* Section Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-xl rounded-full px-6 py-3 border border-white/40 mb-8">
                <div className="w-2 h-2 bg-gradient-to-r from-white to-pink-100 rounded-full animate-pulse"></div>
                <span className="text-white/90 text-sm font-medium uppercase tracking-[0.3em]">Smart Features</span>
              </div>
              
              <h2 className="text-4xl lg:text-6xl font-extralight text-white/95 mb-4 leading-tight drop-shadow-lg">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-100 to-white">
                  Color Intelligence
                </span>
              </h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                Experience the future of salon management with our AI-powered features
              </p>
            </div>

            {/* Apple-style Horizontal Carousel */}
            <div className="relative">
              
              {/* Navigation Arrows */}
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-xl rounded-full border border-white/30 flex items-center justify-center transition-all duration-300 shadow-lg"
                onMouseEnter={() => setIsAutoPlaying(false)}
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-xl rounded-full border border-white/30 flex items-center justify-center transition-all duration-300 shadow-lg"
                onMouseEnter={() => setIsAutoPlaying(false)}
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Carousel Container */}
              <div 
                className="flex items-center justify-center overflow-hidden py-8"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{ height: '580px' }}
              >
                <div className="relative flex items-center justify-center w-full">
                  {features.map((feature, idx) => {
                    const offset = idx - selectedFeatureIdx;
                    const isCenter = offset === 0;
                    const isAdjacent = Math.abs(offset) === 1;
                    const isVisible = Math.abs(offset) <= 2;
                    
                    if (!isVisible) return null;

                    return (
                      <div
                        key={feature.id}
                        className={`absolute transition-all duration-700 ease-out cursor-pointer ${
                          isCenter 
                            ? 'z-20 scale-100 opacity-100' 
                            : isAdjacent 
                            ? 'z-10 scale-85 opacity-60 blur-[3px]' 
                            : 'z-5 scale-70 opacity-40 blur-[4px]'
                        }`}
                        style={{
                          transform: `translateX(${offset * 320}px) scale(${isCenter ? 1 : isAdjacent ? 0.85 : 0.7})`,
                          width: isCenter ? '380px' : '280px',
                          height: isCenter ? '540px' : '380px',
                        }}
                        onClick={() => handleCardClick(idx)}
                        onMouseEnter={() => setIsAutoPlaying(false)}
                        onMouseLeave={() => setIsAutoPlaying(true)}
                      >
                        {/* Card Container */}
                        <div className="w-full h-full rounded-3xl overflow-hidden bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl relative group">
                          
                          {/* Feature Image */}
                          <div className="absolute inset-0">
                            <img
                              src={feature.image}
                              alt={feature.title}
                              className="w-full h-full object-cover object-center"
                            />
                            
                            {/* Gradient Overlay - Less intense for center card */}
                            <div className={`absolute inset-0 ${
                              isCenter 
                                ? 'bg-gradient-to-t from-black/50 via-black/10 to-transparent' 
                                : 'bg-gradient-to-t from-black/70 via-black/30 to-transparent'
                            }`}></div>
                            
                            {/* Glass Effect - Reduced for center */}
                            <div className={`absolute inset-0 ${
                              isCenter 
                                ? 'bg-gradient-to-br from-white/5 via-transparent to-transparent' 
                                : 'bg-gradient-to-br from-white/10 via-transparent to-transparent'
                            }`}></div>
                          </div>

                          {/* Status Indicator - More prominent on center */}
                          <div className="absolute top-6 left-6 z-10">
                            <div className={`flex items-center gap-2 backdrop-blur-xl rounded-full px-3 py-1 border ${
                              isCenter 
                                ? 'bg-white/25 border-white/40' 
                                : 'bg-white/15 border-white/25'
                            }`}>
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                              <span className="text-white/90 text-xs font-medium">Active</span>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                            
                            {/* User Avatars - Larger on center */}
                            <div className="flex items-center gap-1 mb-4">
                              <div className={`bg-gradient-to-br from-pink-400 to-rose-500 rounded-full border-2 border-white/50 flex items-center justify-center text-white font-semibold ${
                                isCenter ? 'w-10 h-10 text-sm' : 'w-8 h-8 text-xs'
                              }`}>
                                {feature.icon}
                              </div>
                              <div className={`bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full border-2 border-white/50 -ml-2 ${
                                isCenter ? 'w-9 h-9' : 'w-7 h-7'
                              }`}></div>
                              <div className={`bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-2 border-white/50 -ml-2 ${
                                isCenter ? 'w-8 h-8' : 'w-6 h-6'
                              }`}></div>
                            </div>

                            {/* Title - Larger on center */}
                            <h3 className={`font-semibold text-white mb-2 drop-shadow-lg ${
                              isCenter ? 'text-3xl' : 'text-xl'
                            }`}>
                              {feature.title}
                            </h3>
                            
                            {/* Subtitle - More detailed on center */}
                            <p className={`text-white/80 mb-4 leading-relaxed ${
                              isCenter ? 'text-base' : 'text-sm'
                            }`}>
                              {feature.subtitle} • {feature.description}
                            </p>

                            {/* Benefits Tags - More on center */}
                            <div className="flex flex-wrap gap-2">
                              {feature.benefits.slice(0, isCenter ? 4 : 2).map((benefit, i) => (
                                <span 
                                  key={i} 
                                  className={`bg-white/20 backdrop-blur-md rounded-full text-white/90 font-medium border border-white/20 ${
                                    isCenter ? 'px-4 py-2 text-sm' : 'px-3 py-1 text-xs'
                                  }`}
                                >
                                  {benefit}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Hover Effect - Stronger on center */}
                          <div className={`absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                            isCenter ? 'group-hover:to-white/10' : ''
                          }`}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Page Indicators */}
              <div className="flex justify-center gap-2 mt-8">
                {features.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleCardClick(idx)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      idx === selectedFeatureIdx 
                        ? 'bg-white scale-125' 
                        : 'bg-white/40 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Selected Feature Details */}
            <div className="mt-16 text-center max-w-3xl mx-auto">
              <div className="bg-white/15 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                <h4 className="text-2xl font-light text-white mb-4">
                  {features[selectedFeatureIdx].title}
                </h4>
                <p className="text-white/80 mb-6 leading-relaxed">
                  {features[selectedFeatureIdx].longDescription}
                </p>
                
                {/* All Benefits */}
                <div className="flex flex-wrap gap-3 justify-center mb-8">
                  {features[selectedFeatureIdx].benefits.map((benefit, i) => (
                    <span 
                      key={i} 
                      className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm text-white/90 font-medium border border-white/20"
                    >
                      ✓ {benefit}
                    </span>
                  ))}
                </div>

                <button className="px-8 py-4 bg-white/25 hover:bg-white/35 backdrop-blur-xl border border-white/30 rounded-full font-semibold text-white text-lg transition-all duration-300 shadow-xl hover:scale-105">
                  Try {features[selectedFeatureIdx].title} ✨
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Contact Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          
          {/* Extra Glass Layer */}
          <div className="absolute inset-0 bg-white/10 backdrop-blur-xl"></div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-8 sm:px-12 lg:px-16">
            <div className="text-center bg-white/25 backdrop-blur-xl rounded-3xl p-12 lg:p-20 border border-white/40 shadow-2xl">
              
              {/* Multiple Glass Layers */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-pink-100/20 rounded-3xl"></div>
              <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-white/10 to-transparent rounded-3xl"></div>
              
              <div className="relative">
                <h3 className="text-4xl lg:text-6xl font-extralight text-white/90 mb-6 leading-tight drop-shadow-lg">
                  Ready for
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-100 to-white font-light">
                    Color Magic?
                  </span>
                </h3>
                
                <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed font-light drop-shadow-md">
                  Join the revolution and transform your salon with color intelligence from the future.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <button className="px-10 py-5 bg-white/30 border border-white/50 rounded-full font-semibold text-white text-lg hover:scale-105 hover:bg-white/40 transform transition-all duration-300 shadow-2xl backdrop-blur-xl">
                    Book Demo
                  </button>
                  
                  <a 
                    href="https://wa.me/972504322680?text=Hi! I want to learn more about Spectra Color Intelligence"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-10 py-5 bg-transparent border-2 border-white/60 rounded-full font-medium text-white text-lg hover:bg-white/20 backdrop-blur-xl transition-all duration-300 shadow-xl inline-flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default FeaturesPage; 