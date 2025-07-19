import React, { useState, useCallback, memo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../../components/Navigation';
import { ClientCarousel } from '../../components/ClientCarousel';
import { Footer } from '../../components/Footer';

// Memoize static components for better performance
const MemoizedClientCarousel = memo(ClientCarousel);
const MemoizedFooter = memo(Footer);

export const UGCOfferPage: React.FC = () => {
  const navigate = useNavigate();

  // Use useCallback to prevent unnecessary re-renders
  const handleStartTrial = useCallback(() => {
    navigate('/signup?trial=true');
  }, [navigate]);

  const handleWhatsApp = useCallback(() => {
    window.open('https://wa.me/972504322680', '_blank');
  }, []);

  const handleInstagram = useCallback(() => {
    window.open('https://instagram.com/spectra_salon', '_blank');
  }, []);

  // Preload critical images for better performance
  useEffect(() => {
    const img = new Image();
    img.src = '/assets/pink-hair-only_bg.png';
  }, []);

  // Scroll to top when accessing page directly
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Show floating buttons after scroll
  useEffect(() => {
    const handleScroll = () => {
      const floatingCta = document.getElementById('floating-cta');
      if (floatingCta) {
        if (window.scrollY > 400) {
          floatingCta.style.transform = 'translateY(0)';
        } else {
          floatingCta.style.transform = 'translateY(100%)';
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navigation />
      
      {/* 1. Hero Section - With Salon Background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        
        {/* Beautiful Pink Salon Background - Same as FeaturesPage */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            background: `
              radial-gradient(ellipse at top left, #FF6B9D 0%, #E85A8A 25%, #D14876 50%, #B73E63 75%, #9F2746 100%),
              linear-gradient(135deg, #FF81A2 0%, #E85A8A 20%, #D14876 40%, #C15571 60%, #B73E63 80%, #9F2746 100%),
              linear-gradient(45deg, #FF6B9D 0%, #E85A8A 30%, #D14876 60%, #9F2746 100%)
            `,
            backgroundBlendMode: 'multiply, normal, overlay'
          }}
        />
        
        {/* Pink Hair Girl Image - Optimized */}
        <div 
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            backgroundImage: `url('/assets/pink-hair-only_bg.png')`,
            backgroundSize: 'contain',
            backgroundPosition: 'center right',
            backgroundRepeat: 'no-repeat',
          }}
        />
        
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 z-15 bg-gradient-to-r from-black/80 via-black/60 to-black/40"></div>

        {/* Content - Text and Action Buttons */}
        <div className="relative z-20 w-full h-full flex flex-col justify-center items-center">
          {/* Text Content - Centered */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-20">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light leading-tight text-white w-full">
              Stop wasting money – start optimizing your salon with{' '}
              <span className="bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                Spectra's AI Cost Optimization App
              </span>
            </h1>
          </div>

          {/* Action Buttons - Below Text */}
          <div id="main-cta" className="flex justify-center">
            <div className="flex justify-center items-center mx-auto px-4">
              <button
                onClick={handleStartTrial}
                className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-semibold rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Rest of sections - Keep existing but optimize images */}
      
      {/* 2. Statistics Section - Optimized */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
        {/* Background effects - Reduced for performance */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-br from-green-100 to-cyan-100 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-light text-gray-900 mb-6 leading-tight">
              Your salon's potential savings with{' '}
              <span className="bg-gradient-to-r from-amber-600 via-orange-500 to-red-500 bg-clip-text text-transparent font-medium">
                Spectra
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              See the real impact on your bottom line and discover how much you could save
            </p>
          </div>

          {/* Statistics Grid - Keep existing */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Stat cards - Keep existing content */}
            <div className="text-center p-8 bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
                85%
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Color Waste Reduction</h3>
              <p className="text-gray-600 leading-relaxed">
                Cut down on unused hair color and materials with AI-powered optimization
              </p>
            </div>

            <div className="text-center p-8 bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
                $10,000+
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Annual Savings</h3>
              <p className="text-gray-600 leading-relaxed">
                Average yearly savings reported by our salon partners
              </p>
            </div>

            <div className="text-center p-8 bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                5 min
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Setup Time</h3>
              <p className="text-gray-600 leading-relaxed">
                Get started in minutes, not hours
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Question Section - With Salon Image */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
        {/* Dark Background Effects - Reduced */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Header Text */}
          <div className="text-center mb-12">
            <p className="text-xl text-gray-300 mb-4">Ask yourself…</p>
            <h2 className="text-4xl sm:text-5xl font-light text-white leading-tight">
              Are you still dreaming of being the{' '}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent font-medium">
                best salon owner
              </span>{' '}
              you can be?
            </h2>
            <p className="text-2xl text-gray-100 mt-8 font-medium">
              With us, you can.
            </p>
          </div>

          {/* Salon Image - Optimized */}
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute -inset-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-3xl blur-xl opacity-40"></div>
            <div className="absolute -inset-2 bg-gradient-to-r from-amber-400/15 to-yellow-400/15 rounded-3xl blur-lg"></div>
            
            <div className="relative rounded-3xl overflow-hidden border-2 border-yellow-400/30 shadow-[0_20px_60px_rgba(255,193,7,0.2)]">
              <img 
                src="/hair_colorist_in_a_color_bar.png"
                alt="Professional hair colorist working at color bar"
                className="w-full h-auto object-cover"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80";
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Client Testimonials */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-gray-900 mb-6">
              See what Spectra clients are saying
            </h2>
          </div>
          
          <div className="relative">
            <MemoizedClientCarousel />
          </div>
        </div>
      </section>

      {/* 5. Final CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        {/* Background Image - Optimized */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `url('/hair_colorist_in_a_color_bar.png')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-gray-900/95 to-black/90"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-light text-white mb-6">
              Ready to transform your salon?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Get started today or schedule a personalized demo
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <button
              onClick={handleStartTrial}
              className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-semibold rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
            >
              Start Free Trial
            </button>
            
            <div className="flex gap-4">
              <button
                onClick={handleWhatsApp}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                WhatsApp
              </button>
              <button
                onClick={handleInstagram}
                className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Instagram
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky CTA Buttons - Optimized */}
      <div 
        id="floating-cta"
        className="fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-gray-700 p-4 sm:p-6 transform translate-y-full transition-transform duration-300"
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={handleStartTrial}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Start Free Trial
          </button>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={handleWhatsApp}
              className="flex-1 sm:flex-none px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full font-medium transition-all duration-300"
            >
              WhatsApp
            </button>
            <button
              onClick={handleInstagram}
              className="flex-1 sm:flex-none px-4 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-full font-medium transition-all duration-300"
            >
              Instagram
            </button>
          </div>
        </div>
      </div>

      <MemoizedFooter />
    </div>
  );
};