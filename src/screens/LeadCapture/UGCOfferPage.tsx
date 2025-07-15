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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Use useCallback to prevent unnecessary re-renders
  const handleStartTrial = useCallback(() => {
    navigate('/signup?trial=true');
  }, [navigate]);

  const handleTalkToSpecialist = useCallback(() => {
    navigate('/contact?specialist=true');
  }, [navigate]);

  const handleWhatsApp = useCallback(() => {
    window.open('https://wa.me/972504322680', '_blank');
  }, []);

  const handleInstagram = useCallback(() => {
    window.open('https://instagram.com/spectra_salon', '_blank');
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

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navigation isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
      
      {/* Hero Section - Clean and Simple */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Darker Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 w-full h-full">
            <img 
              src="/colorbar_with_spectra.png"
              alt="Luxury salon color bar with Spectra"
              className="w-full h-full object-cover"
              loading="eager"
              decoding="async"
            />
          </div>
          {/* Darker overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/70 to-black/75"></div>
        </div>

        {/* Content - Text and Action Buttons */}
        <div className="relative z-10 w-full h-full flex flex-col">
          {/* Space for Image - Top 50% */}
          <div className="h-[50vh] flex items-center justify-center">
            {/* תמונה תבוא כאן */}
          </div>

          {/* Text and Buttons - Bottom 50% */}
          <div className="h-[50vh] flex flex-col">
            {/* Text Content - With fixed margin */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8 mb-12">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light leading-tight text-white w-full">
                Stop wasting money – start optimizing your salon with{' '}
                <span className="bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                  Spectra's AI Cost Optimization App
                </span>
              </h1>
            </div>

            {/* Action Buttons - Bottom */}
            <div id="main-cta" className="pb-8 flex justify-center">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto px-4">
                <button
                  onClick={handleStartTrial}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white font-semibold rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
                >
                  Start Free Trial
                </button>
                <button
                  onClick={handleTalkToSpecialist}
                  className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-semibold rounded-full text-lg hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
                >
                  Talk to Specialist
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky CTA Buttons - New */}
      <div 
        id="floating-cta"
        className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-white via-white/95 to-transparent border-t border-yellow-200/50 p-3 sm:p-4 transform translate-y-full transition-transform duration-300"
      >
        <div className="max-w-md mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleStartTrial}
              className="w-full sm:w-auto px-8 py-4 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
              aria-label="Start your free trial"
            >
              Start Free Trial
            </button>
            <button
              onClick={handleTalkToSpecialist}
              className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-gray-700 font-semibold rounded-full text-lg hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
              aria-label="Talk to a specialist"
            >
              Talk to Specialist
            </button>
          </div>
        </div>
      </div>

      {/* Discover Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
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

      {/* Triple Bundle Special Offer Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-3">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gray-200 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gray-100 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Main Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-light text-gray-900 mb-6 leading-tight">
              <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
                The Triple Bundle Special...
              </span>
              <br />
              <span className="text-gray-900 font-medium">Special Offer</span>
            </h2>
            <h3 className="text-2xl sm:text-3xl font-light text-gray-900">
              Become the salon clients talk about
            </h3>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Side - Triple Bundle Offer */}
            <div className="order-2 lg:order-1">
              <div className="max-w-lg mx-auto lg:mx-0">
                {/* Offer Items - Clean Numbered List */}
                <div className="space-y-6 mb-12">
                  <div className="group p-6 hover:bg-gray-50/80 transition-all duration-300 rounded-2xl">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm">
                        1
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-medium text-gray-900 mb-2">
                          30 Day Free Trial
                        </h4>
                        <p className="text-gray-600 leading-relaxed">Full access, no commitment required</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group p-6 hover:bg-gray-50/80 transition-all duration-300 rounded-2xl">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm">
                        2
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-medium text-gray-900 mb-2">
                          Free Equipment
                        </h4>
                        <p className="text-gray-600 leading-relaxed">Professional hardware included</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group p-6 hover:bg-gray-50/80 transition-all duration-300 rounded-2xl">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm">
                        3
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-medium text-gray-900 mb-2">
                          Custom Training & Setup
                        </h4>
                        <p className="text-gray-600 leading-relaxed">Complete setup and team training included</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="text-center lg:text-left mb-8">
                  <div className="relative inline-flex flex-col items-center lg:items-start bg-gradient-to-r from-white via-gray-50 to-white rounded-2xl px-6 py-4 border border-gray-200 shadow-lg">
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      SAVE $799!
                    </div>
                    <p className="text-sm text-gray-600 mb-1 font-medium">
                      Starting from
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mb-1">
                      <span className="text-blue-600">$39/month</span>
                    </p>
                    <p className="text-sm text-gray-600 font-medium">
                      Simple, smart & affordable
                    </p>
                  </div>
                </div>

                {/* Contact Buttons */}
                <div className="text-center lg:text-left">
                  <p className="text-sm text-gray-600 mb-6">Have a question?</p>
                  <div className="flex flex-row gap-4 justify-center lg:justify-start">
                    <button
                      onClick={() => window.open('https://wa.me/972504322680', '_blank')}
                      className="group bg-white hover:bg-green-50 text-gray-900 font-medium py-3 px-4 rounded-xl transition-all duration-300 shadow-md border border-gray-200 hover:border-green-200 hover:shadow-lg"
                      aria-label="Contact us on WhatsApp"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.513z"/>
                        </svg>
                        <span className="text-sm">WhatsApp</span>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => window.open('https://instagram.com/spectra_salon', '_blank')}
                      className="group bg-white hover:bg-pink-50 text-gray-900 font-medium py-3 px-4 rounded-xl transition-all duration-300 shadow-md border border-gray-200 hover:border-pink-200 hover:shadow-lg"
                      aria-label="Follow us on Instagram"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                        <span className="text-sm">Instagram</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Demo Booking Section */}
                <div className="mt-12">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-500 rounded-xl mb-3">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Book Your Demo</h3>
                      <p className="text-gray-600 text-sm">See Spectra in action with a personalized walkthrough</p>
                    </div>

                    <div className="space-y-3 mb-6">
                      <button
                        onClick={() => window.open('https://calendly.com/spectra-demo/15min', '_blank')}
                        className="w-full bg-white hover:bg-gray-50 border border-gray-200 rounded-xl p-4 transition-all duration-300 hover:shadow-md group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <div className="text-left">
                              <p className="font-medium text-gray-900">Quick Demo</p>
                              <p className="text-sm text-gray-600">15 minutes • Core features</p>
                            </div>
                          </div>
                          <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>

                      <button
                        onClick={() => window.open('https://calendly.com/spectra-demo/30min', '_blank')}
                        className="w-full bg-white hover:bg-gray-50 border border-gray-200 rounded-xl p-4 transition-all duration-300 hover:shadow-md group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <div className="text-left">
                              <p className="font-medium text-gray-900">Full Demo</p>
                              <p className="text-sm text-gray-600">30 minutes • Complete walkthrough</p>
                            </div>
                          </div>
                          <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>
                    </div>

                    <div className="text-center">
                      <p className="text-xs text-gray-500">Available slots this week</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Image */}
            <div className="order-1 lg:order-2">
              <div className="relative">
                {/* Glow effects */}
                <div className="absolute -inset-4 bg-gradient-to-r from-amber-200/20 to-stone-200/20 rounded-3xl blur-xl opacity-60"></div>
                <div className="absolute -inset-2 bg-gradient-to-r from-white/30 to-amber-50/30 rounded-3xl blur-lg"></div>
                
                <div className="relative w-full max-w-md mx-auto lg:max-w-full">
                  <div className="relative rounded-3xl overflow-hidden border-2 border-white/60 shadow-[0_20px_60px_rgba(212,196,168,0.3)]">
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
                    
                    {/* Black gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                    
                    {/* Text overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <div className="text-white">
                        <p className="text-base font-light mb-3 opacity-90">
                          Ask yourself...
                        </p>
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-light mb-4 leading-tight">
                          Are you also using the{' '}
                          <span className="text-yellow-300 font-normal">most advanced tools</span>{' '}
                          to become the{' '}
                          <span className="text-amber-300 font-normal">best business owner</span>{' '}
                          you dreamed of being?
                        </h2>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Logos Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-light text-gray-900 mb-6">
              Trusted by leading brands worldwide
            </h3>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-8 items-center justify-items-center">
            <div className="grayscale hover:grayscale-0 transition-all duration-300">
              <img 
                src="/brands/loreal-professional.png" 
                alt="L'Oréal Professionnel" 
                className="h-12 w-auto opacity-60 hover:opacity-100"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
            <div className="grayscale hover:grayscale-0 transition-all duration-300">
              <img 
                src="/brands/wella-professionals.png" 
                alt="Wella Professionals" 
                className="h-12 w-auto opacity-60 hover:opacity-100"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
            <div className="grayscale hover:grayscale-0 transition-all duration-300">
              <img 
                src="/brands/redken-5th-ave.png" 
                alt="Redken 5th Ave" 
                className="h-12 w-auto opacity-60 hover:opacity-100"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
            <div className="grayscale hover:grayscale-0 transition-all duration-300">
              <img 
                src="/brands/schwarzkopf-professional.png" 
                alt="Schwarzkopf Professional" 
                className="h-12 w-auto opacity-60 hover:opacity-100"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
            <div className="grayscale hover:grayscale-0 transition-all duration-300">
              <img 
                src="/brands/joico.png" 
                alt="Joico" 
                className="h-12 w-auto opacity-60 hover:opacity-100"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
            <div className="grayscale hover:grayscale-0 transition-all duration-300">
              <img 
                src="/brands/olaplex.png" 
                alt="Olaplex" 
                className="h-12 w-auto opacity-60 hover:opacity-100"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
            <div className="grayscale hover:grayscale-0 transition-all duration-300">
              <img 
                src="/brands/indola.png" 
                alt="Indola" 
                className="h-12 w-auto opacity-60 hover:opacity-100"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
            <div className="grayscale hover:grayscale-0 transition-all duration-300">
              <img 
                src="/brands/matrix-hair-color.png" 
                alt="Matrix Hair Color" 
                className="h-12 w-auto opacity-60 hover:opacity-100"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Bottom padding for floating buttons */}
      <div className="h-20 sm:h-16"></div>
      
      <MemoizedFooter />
    </div>
  );
};

 