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
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-20 overflow-hidden bg-gradient-to-br from-spectra-cream/30 via-white to-spectra-gold/10">
        <div className="absolute inset-0 opacity-[0.02]" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c79c6d' fill-opacity='1'%3E%3Ccircle cx='40' cy='40' r='0.8'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-8 lg:px-16 text-center">
          <div className="inline-flex items-center gap-3 bg-white/40 backdrop-blur-xl rounded-full px-6 py-3 mb-8 border border-spectra-gold/20 shadow-lg">
            <div className="w-2 h-2 bg-spectra-gold rounded-full animate-pulse"></div>
            <span className="text-spectra-gold-dark text-sm font-semibold uppercase tracking-[0.25em]">Five Powerful Tools</span>
            <div className="w-2 h-2 bg-spectra-gold-light rounded-full animate-pulse"></div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extralight text-spectra-charcoal mb-6 leading-[0.9] tracking-[-0.02em]">
            Revolutionary
          </h1>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-light text-transparent bg-clip-text bg-gradient-to-r from-spectra-gold-light via-spectra-gold to-spectra-gold-dark leading-[0.9] tracking-[-0.02em] drop-shadow-sm mb-8">
            Salon Tools
          </h1>
          
          <p className="text-xl lg:text-2xl text-spectra-charcoal-light max-w-4xl mx-auto leading-relaxed font-light">
            Five cutting-edge tools that transform your salon into a profit-generating machine.
          </p>
        </div>
      </section>

      {/* Features Navigation */}
      <section className="py-8 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
          <div className="flex flex-wrap justify-center gap-4">
            {features.map((feature) => (
              <button
                key={feature.id}
                onClick={() => setSelectedFeature(feature.id)}
                className={`px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 ${
                  selectedFeature === feature.id
                    ? 'text-white shadow-lg transform scale-105'
                    : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                }`}
                style={{
                  background: selectedFeature === feature.id ? feature.gradient : undefined
                }}
              >
                {feature.icon} {feature.title} {feature.subtitle}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Feature Display */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Left Side - Video */}
            <div className="lg:order-1">
              <div className="relative">
                <div 
                  className="absolute -inset-4 rounded-3xl blur-xl opacity-30"
                  style={{ background: currentFeature.glowColor }}
                />
                <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
                  <div className="aspect-video">
                    <iframe
                      className="w-full h-full"
                      src={currentFeature.videoUrl}
                      title={`${currentFeature.title} ${currentFeature.subtitle} Demo`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Content */}
            <div className="lg:order-2">
              <div className="space-y-8">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-2xl"
                      style={{ background: currentFeature.gradient }}
                    >
                      {currentFeature.icon}
                    </div>
                    <div>
                      <h2 className="text-3xl lg:text-4xl font-light text-spectra-charcoal">
                        {currentFeature.title}
                      </h2>
                      <h3 
                        className="text-3xl lg:text-4xl font-semibold"
                        style={{ color: currentFeature.accentColor }}
                      >
                        {currentFeature.subtitle}
                      </h3>
                    </div>
                  </div>
                  
                  <p className="text-lg text-spectra-charcoal-light leading-relaxed mb-8">
                    {currentFeature.longDescription}
                  </p>
                </div>

                {/* Benefits */}
                <div>
                  <h4 className="text-xl font-semibold text-spectra-charcoal mb-4">Key Benefits:</h4>
                  <ul className="space-y-3">
                    {currentFeature.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <div 
                          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: currentFeature.accentColor + '20' }}
                        >
                          <svg 
                            className="w-4 h-4" 
                            style={{ color: currentFeature.accentColor }}
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-spectra-charcoal-light">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <div className="pt-6">
                  <CTAButton>
                    Try {currentFeature.title} {currentFeature.subtitle}
                  </CTAButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* All Features Grid */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-white to-spectra-cream/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-spectra-charcoal mb-6">
              Complete <span className="text-gradient-spectra font-semibold">Feature Suite</span>
            </h2>
            <p className="text-xl text-spectra-charcoal-light max-w-3xl mx-auto leading-relaxed">
              Every tool you need to transform your salon operations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.id}
                className={`group relative p-8 rounded-2xl border transition-all duration-300 cursor-pointer ${
                  selectedFeature === feature.id
                    ? 'shadow-2xl transform scale-105'
                    : 'bg-white shadow-lg hover:shadow-xl border-gray-200'
                }`}
                style={{
                  background: selectedFeature === feature.id ? feature.gradient : undefined,
                  borderColor: selectedFeature === feature.id ? 'transparent' : undefined
                }}
                onClick={() => setSelectedFeature(feature.id)}
              >
                <div className={`text-center ${selectedFeature === feature.id ? 'text-white' : 'text-spectra-charcoal'}`}>
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title} {feature.subtitle}
                  </h3>
                  <p className={`text-sm leading-relaxed ${
                    selectedFeature === feature.id ? 'text-white/90' : 'text-spectra-charcoal-light'
                  }`}>
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 lg:py-24 bg-spectra-charcoal">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 lg:px-16 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-white mb-6">
            Ready to <span className="text-spectra-gold font-semibold">Transform</span> Your Salon?
          </h2>
          <p className="text-xl text-white/80 mb-12 leading-relaxed max-w-2xl mx-auto">
            Start using all five powerful tools today. No setup fees, no long-term contracts.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <CTAButton>
              Start Free Trial
            </CTAButton>
            
            <button className="group flex items-center gap-4 text-white/80 hover:text-spectra-gold font-medium text-lg transition-all duration-300 px-8 py-4">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 group-hover:bg-spectra-gold/20 transition-all duration-300 shadow-lg">
                <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="font-semibold">Schedule Demo</div>
                <div className="text-sm text-white/60">Personal walkthrough</div>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section בסוף */}
      <ContactSection 
        backgroundImage={BACKGROUND_IMAGES.modernSalon}
        title="Want to"
        subtitle="Learn More?"
        description="Discover how Spectra's advanced features can streamline your salon operations."
      />
    </div>
  );
};

export default FeaturesPage; 