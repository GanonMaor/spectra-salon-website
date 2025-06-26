import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ClientCarousel } from '../../components/ClientCarousel';

interface LeadFormData {
  name: string;
  email: string;
  phone: string;
  brandsAndColorLines: string;
  userType: 'single' | 'multi-4' | 'multi-10' | 'multi-20' | '';
  hasTablet: 'yes' | 'no' | '';
}

export const UGCOfferPage: React.FC = () => {
  const [formData, setFormData] = useState<LeadFormData>({
    name: '',
    email: '',
    phone: '',
    brandsAndColorLines: '',
    userType: '',
    hasTablet: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleRadioChange = (name: keyof LeadFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user makes selection
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const validateForm = () => {
    const newErrors: string[] = [];
    
    if (!formData.name.trim()) newErrors.push('Full Name is required');
    if (!formData.email.trim()) newErrors.push('Email is required');
    if (!formData.phone.trim()) newErrors.push('Phone is required');
    if (!formData.brandsAndColorLines.trim()) newErrors.push('Brands and Color Lines is required');
    if (!formData.userType) newErrors.push('Please choose at least one option for user type');
    if (!formData.hasTablet) newErrors.push('Please choose at least one option for tablet device');
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);

    try {
      // TODO: API integration
      console.log('UGC Lead Data:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting UGC lead:', error);
      setErrors(['Something went wrong. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success page
  if (isSubmitted) {
    return (
      <section className="relative py-20 lg:py-32 overflow-hidden min-h-screen">
        {/* Dark Salon Background Image */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.8)),
              url('https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=2940&auto=format&fit=crop')
            `,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-3xl rounded-full px-6 py-3 mb-8 border border-white/20 shadow-2xl">
              <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-300 rounded-full animate-pulse"></div>
              <span className="text-white/90 text-sm font-semibold uppercase tracking-[0.3em]">You're In!</span>
              <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-300 rounded-full animate-pulse"></div>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extralight text-white mb-6 leading-[0.9] tracking-[-0.02em]">
              Welcome to
            </h2>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-light text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-red-300 to-pink-300 leading-[0.9] tracking-[-0.02em] drop-shadow-2xl mb-8">
              UGC Program!
            </h2>
            
            <p className="text-lg lg:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed font-light mb-12">
              Your Spectra system will be ready in 3 business days.
              <br />
              We'll contact you soon to schedule your personal setup.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="https://wa.me/972504322680?text=Hi! I just joined the Spectra UGC program"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative px-8 py-4 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-semibold text-lg rounded-full transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-[1.02]"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  <span>WhatsApp Us</span>
                </div>
              </a>
              
              <Link
                to="/"
                className="group relative px-8 py-4 bg-white/5 backdrop-blur-3xl border border-white/15 hover:border-white/30 text-white font-semibold text-lg rounded-full transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-[1.02]"
              >
                Return to Spectra
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Main UGC Offer Page
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden min-h-screen">
      {/* Dark Salon Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.8)),
            url('https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=2940&auto=format&fit=crop')
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      />

      {/* Enhanced Floating Glass Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 right-16 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-amber-400/8 to-orange-500/8 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className="text-center mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-3xl rounded-full px-6 py-3 mb-8 border border-white/20 shadow-2xl">
            <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-pulse"></div>
            <span className="text-white/90 text-sm font-semibold uppercase tracking-[0.3em]">Special UGC Offer</span>
            <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-pulse"></div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extralight text-white mb-6 leading-[0.9] tracking-[-0.02em]">
            Welcome to our UGC Project!
          </h1>
          <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-light text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-red-300 to-pink-300 leading-[1.1] tracking-[-0.02em] drop-shadow-2xl mb-8 max-w-4xl mx-auto">
            Start Your Journey with a Plug-and-Play System Customized for You! And Now with Up to 50% Off!
          </h2>
          
          <div className="mb-8">
            <div className="text-lg sm:text-xl lg:text-2xl text-white/90 font-light mb-3 tracking-wide">
              Only 300 Salons in the US Will Get This Offer
            </div>
            <div className="text-base sm:text-lg text-orange-300/80 font-medium uppercase tracking-[0.2em] animate-pulse">
              Limited Time • First Come, First Served
            </div>
          </div>
          
          <div className="text-xl lg:text-2xl text-white/80 max-w-2xl mx-auto leading-relaxed font-light mb-8">
            <span className="text-orange-300 font-semibold">Free Trial</span> – <span className="text-orange-300 font-semibold">Free Scale</span> – <span className="text-orange-300 font-semibold">Free Stand</span>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="bg-white/10 backdrop-blur-3xl rounded-3xl p-6 sm:p-8 lg:p-12 border border-white/20 shadow-2xl mb-16 lg:mb-20">
          <div className="text-center mb-8">
            <h3 className="text-2xl lg:text-3xl font-light text-white mb-4">
              UGC Special Pricing
            </h3>
            <p className="text-white/70 font-light">Exclusive discounts for UGC participants</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            
            {/* $79 → $39/m (50% Off) */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center relative">
              <div className="absolute -top-2 -right-2 bg-orange-500 text-white px-3 py-1 rounded-xl text-xs font-bold">
                50% OFF
              </div>
              
              <div className="mb-6">
                <h4 className="text-white font-semibold text-lg mb-3">Solo</h4>
                <div className="space-y-2 mb-4">
                  <div className="text-orange-400 text-lg line-through font-light">$79/m</div>
                  <div className="text-3xl font-light text-white">$39/m</div>
                </div>
              </div>
              
              <div className="space-y-2 text-white/80 text-sm">
                <p>• 1 User Account</p>
                <p>• Basic Color Management</p>
                <p>• Mobile App Access</p>
                <p>• Email Support</p>
              </div>
            </div>

            {/* $129 → $79/m (38% Off) */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center relative">
              <div className="absolute -top-2 -right-2 bg-orange-500 text-white px-3 py-1 rounded-xl text-xs font-bold">
                38% OFF
              </div>
              
              <div className="mb-6">
                <h4 className="text-white font-semibold text-lg mb-3">Multi</h4>
                <div className="space-y-2 mb-4">
                  <div className="text-orange-400 text-lg line-through font-light">$129/m</div>
                  <div className="text-3xl font-light text-white">$79/m</div>
                </div>
              </div>
              
              <div className="space-y-2 text-white/80 text-sm">
                <p>• Up to 4 Users</p>
                <p>• Advanced Analytics</p>
                <p>• Team Collaboration</p>
                <p>• Priority Support</p>
              </div>
            </div>

            {/* $189 → $129/m (31% Off) */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center relative">
              <div className="absolute -top-2 -right-2 bg-orange-500 text-white px-3 py-1 rounded-xl text-xs font-bold">
                31% OFF
              </div>
              
              <div className="mb-6">
                <h4 className="text-white font-semibold text-lg mb-3">Studio</h4>
                <div className="space-y-2 mb-4">
                  <div className="text-orange-400 text-lg line-through font-light">$189/m</div>
                  <div className="text-3xl font-light text-white">$129/m</div>
                </div>
              </div>
              
              <div className="space-y-2 text-white/80 text-sm">
                <p>• Up to 10 Users</p>
                <p>• Custom Branding</p>
                <p>• Advanced Reporting</p>
                <p>• Phone Support</p>
              </div>
            </div>

            {/* $249 → $189/m (24% Off) */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center relative">
              <div className="absolute -top-2 -right-2 bg-orange-500 text-white px-3 py-1 rounded-xl text-xs font-bold">
                24% OFF
              </div>
              
              <div className="mb-6">
                <h4 className="text-white font-semibold text-lg mb-3">Enterprise</h4>
                <div className="space-y-2 mb-4">
                  <div className="text-orange-400 text-lg line-through font-light">$249/m</div>
                  <div className="text-3xl font-light text-white">$189/m</div>
                </div>
              </div>
              
              <div className="space-y-2 text-white/80 text-sm">
                <p>• Up to 20 Users</p>
                <p>• White Label Solution</p>
                <p>• API Access</p>
                <p>• Dedicated Manager</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Form Section */}
        <div className="max-w-2xl mx-auto mb-16 lg:mb-20">
          <div className="bg-white/10 backdrop-blur-3xl rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl">
            
            <div className="text-center mb-8">
              <h3 className="text-2xl font-light text-white mb-2">
                Start Your UGC Journey
              </h3>
              <p className="text-white/70 font-light text-sm">Fill out the form to get started</p>
            </div>

            {/* Error Messages */}
            {errors.length > 0 && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl">
                <ul className="text-red-300 text-sm space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Full Name */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full h-12 px-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl focus:border-orange-300/50 focus:ring-1 focus:ring-orange-300/30 transition-all duration-200 text-white placeholder-white/50 font-light"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full h-12 px-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl focus:border-orange-300/50 focus:ring-1 focus:ring-orange-300/30 transition-all duration-200 text-white placeholder-white/50 font-light"
                  placeholder="Enter your email address"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full h-12 px-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl focus:border-orange-300/50 focus:ring-1 focus:ring-orange-300/30 transition-all duration-200 text-white placeholder-white/50 font-light"
                  placeholder="Enter your phone number"
                />
              </div>

              {/* Brands and Color Lines */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Brands and Color Lines Used *
                </label>
                <textarea
                  name="brandsAndColorLines"
                  required
                  value={formData.brandsAndColorLines}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl focus:border-orange-300/50 focus:ring-1 focus:ring-orange-300/30 transition-all duration-200 text-white placeholder-white/50 font-light resize-none"
                  placeholder="List the brands and main lines you use for color and treatments (like toners, gloss, bleach, keratin)"
                />
                <p className="text-white/50 text-xs mt-2">
                  List the brands and main lines you use for color and treatments (like toners, gloss, bleach, keratin).
                </p>
              </div>

              {/* Plan Selector */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-4">
                  Are you a multi user or single user? *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { value: 'single', label: 'Single' },
                    { value: 'multi-4', label: 'Multi (up to 4)' },
                    { value: 'multi-10', label: 'Multi+ (up to 10)' },
                    { value: 'multi-20', label: 'Multi 20 (up to 20)' }
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center space-x-3 p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                        formData.userType === option.value
                          ? 'bg-orange-500/20 border-orange-500/50'
                          : 'bg-white/5 border-white/20 hover:border-white/30'
                      }`}
                    >
                      <input
                        type="radio"
                        name="userType"
                        value={option.value}
                        checked={formData.userType === option.value}
                        onChange={(e) => handleRadioChange('userType', e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        formData.userType === option.value
                          ? 'border-orange-400'
                          : 'border-white/50'
                      }`}>
                        {formData.userType === option.value && (
                          <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        )}
                      </div>
                      <span className="text-white font-light">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tablet Device Selector */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-4">
                  Are you using an iPad or Tablet device? *
                </label>
                <div className="grid grid-cols-1 gap-3 mb-3">
                  {[
                    { value: 'yes', label: 'Yes' },
                    { value: 'no', label: 'No' }
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center space-x-3 p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                        formData.hasTablet === option.value
                          ? 'bg-orange-500/20 border-orange-500/50'
                          : 'bg-white/5 border-white/20 hover:border-white/30'
                      }`}
                    >
                      <input
                        type="radio"
                        name="hasTablet"
                        value={option.value}
                        checked={formData.hasTablet === option.value}
                        onChange={(e) => handleRadioChange('hasTablet', e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        formData.hasTablet === option.value
                          ? 'border-orange-400'
                          : 'border-white/50'
                      }`}>
                        {formData.hasTablet === option.value && (
                          <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        )}
                      </div>
                      <span className="text-white font-light">{option.label}</span>
                    </label>
                  ))}
                </div>
                <p className="text-orange-300/80 text-sm font-medium">
                  ⚠️ Important: Spectra-CI app works only on iPads and tablets, not on mobile phones.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full h-16 rounded-2xl font-semibold text-lg transition-all duration-300 mt-8 ${
                  isSubmitting
                    ? 'bg-white/10 backdrop-blur-xl cursor-not-allowed text-white/50 border border-white/10'
                    : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border border-orange-500/20 shadow-lg hover:shadow-2xl transform hover:scale-[1.02]'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  'Unlock My UGC Offer'
                )}
              </button>

              <p className="text-center text-white/50 text-sm font-light mt-4">
                No credit card charged until you're ready.
              </p>
            </form>
          </div>
        </div>

        {/* Final Note */}
        <div className="text-center mb-12">
          <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-xl rounded-3xl p-6 border border-orange-400/30 max-w-3xl mx-auto">
            <p className="text-white/90 font-light leading-relaxed mb-4">
              <strong className="text-orange-300">Important:</strong> Make sure to download the Spectra-CI app on your iPad or tablet before your installation!
            </p>
            <p className="text-white/80 text-sm mb-4">
              📱 The Spectra-CI app works exclusively on iPads and tablets - it's not available for mobile phones.
            </p>
            <a 
              href="https://apps.apple.com/il/app/spectra-ci/id6578451404"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/30 rounded-full text-white font-medium transition-all duration-200 hover:scale-105"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Download from App Store
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <Link
            to="/"
            className="text-white/50 hover:text-white font-light text-sm transition-colors duration-200"
          >
            ← Return to Spectra
          </Link>
        </div>
      </div>
    </section>
  );
}; 