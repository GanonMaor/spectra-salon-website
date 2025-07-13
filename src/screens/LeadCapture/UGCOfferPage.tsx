import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../../components/Navigation';
import { ClientCarousel } from '../../components/ClientCarousel';
import { Footer } from '../../components/Footer';

export const UGCOfferPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleStartTrial = () => {
    // Navigate to sign up with trial parameter
    navigate('/signup?trial=true');
  };

  const handleTalkToSpecialist = () => {
    // Navigate to contact with specialist parameter
    navigate('/contact?specialist=true');
  };

  const handleGetStarted = async () => {
    setIsSubmitting(true);
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      handleStartTrial();
    }, 1000);
  };

  const handleWhatsApp = () => {
    window.open('https://wa.me/972507777777', '_blank');
  };

  const handleInstagram = () => {
    window.open('https://instagram.com/spectra_salon', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navigation isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
      
      {/* Hero Section with Color Bar Background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Darker Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 w-full h-full">
            <img 
              src="/colorbar_with_spectra.png"
              alt="Luxury salon color bar with Spectra"
              className="w-full h-full object-cover"
            />
          </div>
          {/* Darker overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/70 to-black/75"></div>
        </div>

        {/* Trusted by Badge */}
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-white/95 backdrop-blur-sm rounded-full px-6 py-2 shadow-lg">
            <p className="text-xs text-gray-700 font-medium">
              TRUSTED BY 1,500+ HAIR PROFESSIONALS
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light mb-12 leading-tight text-white">
            Stop wasting money –{' '}
            <span className="bg-gradient-to-r from-yellow-600 via-amber-600 to-yellow-700 bg-clip-text text-transparent">
              start optimizing
            </span>{' '}
            your salon with{' '}
            <span className="bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
              Spectra AI's
            </span>{' '}
            Cost Optimization App.
          </h1>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleStartTrial}
              className="bg-gradient-to-r from-yellow-700 to-amber-700 hover:from-yellow-800 hover:to-amber-800 text-white font-medium py-3 px-6 rounded-full text-base transition-all duration-300 transform hover:scale-105 shadow-xl"
            >
              Start Your Free Trial
            </button>
            <button
              onClick={handleTalkToSpecialist}
              className="border-2 border-yellow-600/80 text-yellow-500 hover:bg-yellow-600 hover:text-white font-medium py-3 px-6 rounded-full text-base transition-all duration-300 transform hover:scale-105"
            >
              Talk to a Specialist
            </button>
          </div>
        </div>
      </section>

      {/* iPhone Carousel Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-gray-900 mb-6">
              Discover how top salons around the world are{' '}
              <span className="text-yellow-700">saving money</span>,{' '}
              <span className="text-amber-700">managing inventory smarter</span>, and{' '}
              <span className="text-yellow-800">delivering a futuristic experience</span>{' '}
              to their clients with Spectra.
            </h2>
          </div>
          
          <div className="relative">
            <ClientCarousel />
          </div>
        </div>
      </section>



            {/* Triple Bundle Special Offer Section - Modern & Clean */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-3">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gray-200 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gray-100 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Side - Triple Bundle Offer */}
            <div className="order-2 lg:order-1">
              <div className="max-w-lg mx-auto lg:mx-0">
                {/* Sub Section Title */}
                <div className="text-center lg:text-left mb-12">
                  <h3 className="text-2xl sm:text-3xl font-light text-gray-900 mb-3">
                    Become the manager you've always dreamed of
                  </h3>
                  <p className="text-lg text-gray-600">
                    With an offer that won't come back
                  </p>
                </div>

                {/* Offer Items - Clean Numbered List */}
                <div className="space-y-6 mb-12">
                  <div className="group p-6 hover:bg-gray-50/80 transition-all duration-300 rounded-2xl">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm">
                        1
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-medium text-gray-900 mb-2">
                          Free Smart Scale & Stand
                          <span className="ml-2 text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">$299 Value!</span>
                        </h4>
                        <p className="text-gray-600 leading-relaxed">Professional hardware included</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group p-6 hover:bg-gray-50/80 transition-all duration-300 rounded-2xl">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm">
                        2
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-medium text-gray-900 mb-2">
                          30-Day Free Trial
                          <span className="ml-2 text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full">No Risk!</span>
                        </h4>
                        <p className="text-gray-600 leading-relaxed">Full access, no commitment required</p>
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
                          Free Installation + Team Training
                          <span className="ml-2 text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full">$500 Value!</span>
                        </h4>
                        <p className="text-gray-600 leading-relaxed">Complete setup and team training included</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="text-center lg:text-left mb-8">
                  <div className="relative inline-flex flex-col items-center lg:items-start bg-gradient-to-r from-yellow-100 via-amber-100 to-orange-100 rounded-3xl px-8 py-6 border-2 border-amber-300 shadow-xl">
                    {/* Burst effect */}
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                      SAVE $799!
                    </div>
                    <p className="text-sm text-gray-700 mb-2 font-medium">
                      No commitment – starting at just
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-5xl font-bold text-gray-900">
                        <span className="text-amber-600">$39</span>
                      </p>
                      <span className="text-xl text-gray-600">/month</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-2 opacity-75">
                      Usually $838/month • Limited time only
                    </p>
                  </div>
                </div>

                {/* Contact Buttons */}
                <div className="text-center lg:text-left">
                  <p className="text-sm text-gray-600 mb-6">Have questions? Get instant clarification:</p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={handleWhatsApp}
                      className="group bg-white hover:bg-green-50 text-gray-900 font-medium py-4 px-6 rounded-2xl transition-all duration-300 shadow-sm border border-gray-200 hover:border-green-200 hover:shadow-md"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-xl">📱</span>
                        <span>WhatsApp</span>
                      </div>
                    </button>
                    
                    <button
                      onClick={handleInstagram}
                      className="group bg-white hover:bg-pink-50 text-gray-900 font-medium py-4 px-6 rounded-2xl transition-all duration-300 shadow-sm border border-gray-200 hover:border-pink-200 hover:shadow-md"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-xl">📸</span>
                        <span>Instagram</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Image with Main Header */}
            <div className="order-1 lg:order-2">
              {/* Main Section Header */}
              <div className="text-center mb-8">
                <h2 className="text-4xl sm:text-5xl font-light text-gray-900 mb-6 leading-tight">
                  <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
                    Triple Bundle
                  </span>
                  <br />
                  <span className="text-gray-900 font-medium">Special Offer</span>
                </h2>
                <p className="text-xl sm:text-2xl font-light text-gray-600">
                  Everything you need to transform your salon!
                </p>
              </div>
              
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
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80";
                      }}
                    />
                    
                    {/* Black gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                    
                    {/* Text overlay - Keep exactly as is */}
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
                        <p className="text-base font-light opacity-90 leading-relaxed">
                          <span className="text-yellow-300 font-medium">See what everyone's talking about - advance yourself too</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-light text-gray-900 mb-6">
              Trusted by salons worldwide
            </h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-md text-center border border-yellow-100/50">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-100 to-amber-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <div className="w-4 h-4 bg-yellow-700 rounded-full"></div>
              </div>
              <h4 className="text-xl font-light text-gray-900 mb-1">32% Average</h4>
              <p className="text-yellow-700 font-medium mb-1 text-sm">Cost Reduction</p>
              <p className="text-gray-600 font-light text-sm">Within first 3 months</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-md text-center border border-yellow-100/50">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-100 to-amber-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <div className="w-4 h-4 bg-yellow-700 rounded-full"></div>
              </div>
              <h4 className="text-xl font-light text-gray-900 mb-1">5 Minutes</h4>
              <p className="text-yellow-700 font-medium mb-1 text-sm">Quick Setup</p>
              <p className="text-gray-600 font-light text-sm">From installation to first scan</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md text-center border border-yellow-100/50">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-100 to-amber-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <div className="w-4 h-4 bg-yellow-700 rounded-full"></div>
              </div>
              <h4 className="text-xl font-light text-gray-900 mb-1">4.9/5</h4>
              <p className="text-yellow-700 font-medium mb-1 text-sm">Customer Rating</p>
              <p className="text-gray-600 font-light text-sm">From salon owners</p>
            </div>
          </div>
        </div>
      </section>

      {/* Floating CTA Buttons - Always Visible, Mobile-Friendly */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-white via-white/95 to-transparent border-t border-yellow-200/50 p-3 sm:p-4">
        <div className="max-w-md mx-auto">
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleStartTrial}
              className="flex-1 bg-gradient-to-r from-yellow-700 to-amber-700 hover:from-yellow-800 hover:to-amber-800 text-white font-medium py-3 px-4 rounded-full text-sm transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Start Your Free Trial
            </button>
            <button
              onClick={handleTalkToSpecialist}
              className="flex-1 border-2 border-yellow-700 text-yellow-700 hover:bg-yellow-700 hover:text-white font-medium py-3 px-4 rounded-full text-sm transition-all duration-300"
            >
              Talk to a Specialist
            </button>
          </div>
        </div>
      </div>

      {/* Bottom padding for floating buttons */}
      <div className="h-20 sm:h-16"></div>
      
      <Footer />
    </div>
  );
};

 