import React, { useState } from "react";
import { Link } from "react-router-dom";

interface LeadFormData {
  name: string;
  phone: string;
  socialHandle: string;
  email: string;
  salonName?: string;
}

export const LeadCapturePage: React.FC = () => {
  const [formData, setFormData] = useState<LeadFormData>({
    name: "",
    phone: "",
    socialHandle: "",
    email: "",
    salonName: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Build payload expected by Netlify leads function
      const searchParams = new URLSearchParams(window.location.search);
      const payload = {
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company_name: formData.salonName || undefined,
        message: formData.socialHandle
          ? `Social: ${formData.socialHandle}`
          : undefined,
        source_page: "/lead-capture",
        utm_source: searchParams.get("utm_source") || undefined,
        utm_medium: searchParams.get("utm_medium") || undefined,
        utm_campaign: searchParams.get("utm_campaign") || undefined,
      } as Record<string, any>;

      const res = await fetch("/.netlify/functions/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `Failed to submit lead (${res.status})`);
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting lead:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success page - Contact Section style
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
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
          }}
        />

        {/* Enhanced Floating Glass Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-32 right-16 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-amber-400/8 to-orange-500/8 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            {/* Success Header */}
            <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-3xl rounded-full px-8 py-4 mb-8 border border-white/20 shadow-2xl">
              <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-300 rounded-full animate-pulse"></div>
              <span className="text-white/90 text-sm font-semibold uppercase tracking-[0.3em]">
                Welcome to Spectra
              </span>
              <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-300 rounded-full animate-pulse"></div>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extralight text-white mb-6 leading-[0.9] tracking-[-0.02em]">
              Thank
            </h2>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-light text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 leading-[0.9] tracking-[-0.02em] drop-shadow-2xl mb-8">
              You!
            </h2>

            <p className="text-xl lg:text-2xl text-white/80 max-w-4xl mx-auto leading-relaxed font-light mb-12">
              We'll contact you within 24 hours to set up your Spectra trial.
              <br />
              Get ready to transform your salon!
            </p>

            {/* Contact Options */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <a
                href="https://wa.me/972504322680?text=Hi! I just signed up for Spectra trial"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative px-10 py-5 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-semibold text-lg rounded-full transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-[1.02]"
              >
                <div className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                  </svg>
                  <span>WhatsApp Us</span>
                </div>
              </a>

              <Link
                to="/"
                className="group relative px-10 py-5 bg-white/5 backdrop-blur-3xl border border-white/15 hover:border-white/30 text-white font-semibold text-lg rounded-full transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-[1.02]"
              >
                Return to Spectra
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Main Regular Trial Page - Contact Section style
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Dark Salon Background Image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.8)),
            url('https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=2940&auto=format&fit=crop')
          `,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      />

      {/* Enhanced Floating Glass Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 right-16 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-amber-400/8 to-orange-500/8 rounded-full blur-3xl animate-pulse delay-500"></div>

        {/* Additional atmospheric elements */}
        <div className="absolute top-10 right-32 w-64 h-64 bg-gradient-to-br from-pink-400/5 to-purple-400/5 rounded-full blur-2xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-10 left-32 w-48 h-48 bg-gradient-to-br from-cyan-400/8 to-blue-400/8 rounded-full blur-2xl animate-pulse delay-3000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-8 sm:px-12 lg:px-16">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-3xl rounded-full px-8 py-4 mb-8 border border-white/20 shadow-2xl">
            <div className="w-2 h-2 bg-gradient-to-r from-white to-gray-300 rounded-full animate-pulse"></div>
            <span className="text-white/90 text-sm font-semibold uppercase tracking-[0.3em]">
              Start Your Trial
            </span>
            <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-300 rounded-full animate-pulse"></div>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extralight text-white mb-6 leading-[0.9] tracking-[-0.02em]">
            Try Spectra
          </h1>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-light text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 leading-[0.9] tracking-[-0.02em] drop-shadow-2xl mb-8">
            Free
          </h1>

          <p className="text-xl lg:text-2xl text-white/80 max-w-4xl mx-auto leading-relaxed font-light">
            Experience the future of color management with our 14-day free
            trial.
          </p>
        </div>

        {/* Regular Pricing Showcase */}
        <div className="bg-white/10 backdrop-blur-3xl rounded-3xl p-12 border border-white/20 shadow-2xl mb-20 max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl lg:text-4xl font-light text-white mb-4">
              Choose Your Plan
            </h2>
            <p className="text-white/70 font-light">
              Professional salon management solutions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Solo */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-purple-400/30 to-purple-500/30 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/20">
                <span className="text-purple-300 text-xl">⚖️</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Solo</h3>
              <div className="text-3xl font-light text-white mb-2">$39</div>
              <div className="text-white/60 text-sm mb-4">/month</div>
              <p className="text-white/70 text-sm">
                Perfect for individual stylists
              </p>
            </div>

            {/* Multi */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-pink-400/30 to-pink-500/30 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/20">
                <span className="text-pink-300 text-xl">👥</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Multi</h3>
              <div className="text-3xl font-light text-white mb-2">$79</div>
              <div className="text-white/60 text-sm mb-4">/month</div>
              <p className="text-white/70 text-sm">For small salon teams</p>
            </div>

            {/* Studio */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-400/30 to-blue-500/30 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/20">
                <span className="text-blue-300 text-xl">🏢</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Studio</h3>
              <div className="text-3xl font-light text-white mb-2">$129</div>
              <div className="text-white/60 text-sm mb-4">/month</div>
              <p className="text-white/70 text-sm">For growing salons</p>
            </div>

            {/* Enterprise */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-emerald-400/30 to-emerald-500/30 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/20">
                <span className="text-emerald-300 text-xl">🚀</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Enterprise</h3>
              <div className="text-3xl font-light text-white mb-2">$189</div>
              <div className="text-white/60 text-sm mb-4">/month</div>
              <p className="text-white/70 text-sm">For large operations</p>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-white/60 text-sm font-light">
              All plans include 14-day free trial • No setup fees • Cancel
              anytime
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="max-w-md mx-auto mb-20">
          <div className="bg-white/10 backdrop-blur-3xl rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-light text-white mb-2">
                Start Your Free Trial
              </h2>
              <p className="text-white/70 font-light text-sm">
                No credit card required
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full h-12 px-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl focus:border-blue-300/50 focus:ring-1 focus:ring-blue-300/30 transition-all duration-200 text-white placeholder-white/50 font-light"
                placeholder="Full name"
              />

              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full h-12 px-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl focus:border-blue-300/50 focus:ring-1 focus:ring-blue-300/30 transition-all duration-200 text-white placeholder-white/50 font-light"
                placeholder="Email address"
              />

              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full h-12 px-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl focus:border-blue-300/50 focus:ring-1 focus:ring-blue-300/30 transition-all duration-200 text-white placeholder-white/50 font-light"
                placeholder="Phone number"
              />

              <input
                type="text"
                name="salonName"
                value={formData.salonName}
                onChange={handleInputChange}
                className="w-full h-12 px-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl focus:border-blue-300/50 focus:ring-1 focus:ring-blue-300/30 transition-all duration-200 text-white placeholder-white/50 font-light"
                placeholder="Salon name"
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full h-14 rounded-2xl font-light transition-all duration-300 mt-6 ${
                  isSubmitting
                    ? "bg-white/10 backdrop-blur-xl cursor-not-allowed text-white/50 border border-white/10"
                    : "bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-pink-500/50 backdrop-blur-xl hover:from-blue-500/60 hover:via-purple-500/60 hover:to-pink-500/60 text-white border border-white/20 shadow-lg"
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Starting trial...
                  </div>
                ) : (
                  "Start Free Trial"
                )}
              </button>

              <p className="text-center text-white/50 text-xs font-light mt-4">
                14-day free trial • No credit card required
              </p>
            </form>
          </div>
        </div>

        {/* Bottom CTA - Same as Contact Section */}
        <div className="text-center">
          <div className="relative max-w-4xl mx-auto">
            <div className="relative p-12 bg-white/10 backdrop-blur-3xl rounded-[3rem] border border-white/20 shadow-2xl overflow-hidden">
              {/* Floating Elements */}
              <div className="absolute top-6 right-8 w-16 h-16 bg-gradient-to-br from-blue-400/20 to-cyan-300/20 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute bottom-6 left-8 w-12 h-12 bg-gradient-to-br from-purple-400/20 to-pink-300/20 rounded-full blur-xl animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-full blur-lg animate-pulse delay-500"></div>

              <div className="relative z-10">
                <h3 className="text-3xl lg:text-4xl font-light text-white mb-6 leading-tight tracking-[-0.02em]">
                  Questions? Let's Talk!
                </h3>

                <p className="text-xl text-white/80 mb-12 leading-relaxed font-light max-w-2xl mx-auto">
                  Book a demo or chat with us to learn more about Spectra
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  {/* Book Demo Button */}
                  <button className="group relative px-10 py-5 bg-gradient-to-r from-[#FF9500] to-[#E6850E] hover:from-[#E6850E] hover:to-[#CC7A0D] text-white font-semibold text-lg rounded-full transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-[1.02] border border-[#FF9500]/20">
                    <span className="relative z-10">Book Demo</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#E6850E] to-[#CC7A0D] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>

                  {/* WhatsApp Button */}
                  <a
                    href="https://wa.me/972504322680?text=Hi! I want to learn more about Spectra"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative px-10 py-5 bg-white/5 backdrop-blur-3xl border border-white/15 hover:border-green-400/30 text-white font-semibold text-lg rounded-full transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-[1.02] overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/5 to-transparent"></div>

                    <div className="relative z-10 flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                      </svg>
                      <span>WhatsApp</span>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
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
