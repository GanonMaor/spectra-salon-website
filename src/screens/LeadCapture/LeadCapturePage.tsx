import React, { useState } from "react";
import { Link } from "react-router-dom";
import { SiteThemeProvider, useSiteColors, useSiteTheme } from "../../contexts/SiteTheme";

const CHECKOUT_URL = "#";

const PLANS = [
  { name: "Single", price: 39, tagline: "Ideal for solo professionals and independent studios.", features: ["Full formula tracking", "Inventory control", "SmartScale integration"] },
  { name: "Multi", price: 79, tagline: "Designed for small teams and growing salons.", features: ["Shared formula system", "Centralized stock visibility", "Multi-user access"] },
  { name: "Multi Plus", price: 129, tagline: "Built for established salons scaling operations.", features: ["Advanced reporting", "Expanded user access", "Operational insights"] },
  { name: "Power", price: 189, tagline: "For high-volume salons demanding full control.", features: ["Large teams", "Advanced management tools", "Maximum visibility and precision"] },
];

const PACKAGE_ITEMS = [
  "SmartScale precision integration",
  "Premium iPad stand",
  "Professional configuration",
  "Personal Zoom installation session",
  "Full system activation",
  "21-day full access trial",
];

interface LeadFormData {
  name: string;
  phone: string;
  email: string;
  instagram?: string;
  salonName?: string;
}

const LeadCaptureInner: React.FC = () => {
  const [plansOpen, setPlansOpen] = useState(false);
  const [formData, setFormData] = useState<LeadFormData>({ name: "", phone: "", email: "", instagram: "", salonName: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const c = useSiteColors();
  const { isDark } = useSiteTheme();
  const s = c.imageSection;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const payload: Record<string, any> = {
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company_name: formData.salonName || undefined,
        message: formData.instagram ? `Instagram: ${formData.instagram}` : undefined,
        source_page: "/lead-capture",
        utm_source: searchParams.get("utm_source") || undefined,
        utm_medium: searchParams.get("utm_medium") || undefined,
        utm_campaign: searchParams.get("utm_campaign") || undefined,
      };
      const res = await fetch("/.netlify/functions/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err?.error || `Failed (${res.status})`); }
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting lead:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls = isDark
    ? "w-full h-12 px-4 border border-white/15 rounded-xl text-white placeholder-white/50 text-sm font-light outline-none focus:border-[#EAB776]/50 transition-all bg-white/5"
    : "w-full h-12 px-4 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm font-light outline-none focus:border-[#B18059]/40 transition-all bg-white";

  if (isSubmitted) {
    return (
      <div className="w-full min-h-[100dvh] font-sans antialiased" style={{ background: c.bg.page }}>
        <section className="relative py-20 lg:py-32 overflow-hidden min-h-[100dvh]">
          <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat lg:bg-fixed" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=2940&auto=format&fit=crop')` }} />
          <div className="absolute inset-0 z-0" style={{ background: s.overlay }} />
          <div className="relative z-10 max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 flex items-center justify-center min-h-[100dvh]">
            <div className="text-center">
              <div className="inline-flex items-center gap-3 rounded-full px-8 py-4 mb-8 border" style={{ background: s.cardBg, borderColor: s.cardBorder }}>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium uppercase tracking-[0.25em]" style={{ color: s.textPrimary }}>Welcome to Spectra</span>
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extralight mb-3 leading-[1] tracking-[-0.02em]" style={{ color: s.textPrimary }}>Thank You.</h2>
              <p className="text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed font-light mb-12" style={{ color: s.textDimmed }}>
                Your installation request has been received.<br />We will reach out within 24 hours to schedule your personal setup session.
              </p>
              <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
                <a href="https://wa.me/972504322680?text=Hi! I just requested my Spectra installation" target="_blank" rel="noopener noreferrer" className="px-10 py-5 bg-gradient-to-r from-[#EAB776] to-[#B18059] hover:from-[#B18059] hover:to-[#EAB776] text-white font-semibold text-lg rounded-full transition-all duration-300 shadow-xl">
                  WhatsApp Us
                </a>
                <Link to="/" className="px-10 py-5 border rounded-full font-semibold text-lg transition-all duration-300" style={{ color: s.textDimmed, borderColor: s.cardBorder }}>
                  Return to Spectra
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[100dvh] font-sans antialiased overflow-x-hidden" style={{ background: c.bg.page }}>
      {/* ───────── HERO (dark image section) ───────── */}
      <section className="relative pt-28 sm:pt-36 lg:pt-44 pb-16 lg:pb-24 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat lg:bg-fixed" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=2940&auto=format&fit=crop')` }} />
        <div className="absolute inset-0 z-0" style={{ background: s.overlay }} />
        <div className="absolute inset-0 pointer-events-none z-[1]">
          <div className="absolute top-1/4 left-0 w-96 h-96 rounded-full blur-3xl" style={{ background: s.glowA }} />
          <div className="absolute bottom-1/4 right-0 w-80 h-80 rounded-full blur-3xl" style={{ background: s.glowB }} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-10 lg:px-16 text-center">
          <div className="inline-flex items-center gap-2 mb-10">
            <div className="w-1.5 h-1.5 bg-[#EAB776]/60 rounded-full" />
            <span className="text-xs font-medium uppercase tracking-[0.2em]" style={{ color: s.textDimmed }}>Professional Onboarding</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extralight mb-6 leading-[1.05] tracking-[-0.03em]" style={{ color: s.textPrimary }}>
            Upgrade the Way<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EAB776] to-[#B18059]">You Run Your Salon</span>
          </h1>
          <p className="text-lg lg:text-xl leading-relaxed font-light max-w-2xl mx-auto" style={{ color: s.textDimmed }}>
            Spectra is a precision system designed to elevate how professional salons manage color, inventory, and profitability.
            Your complete equipment package arrives within 48 hours. Fully installed. Ready to operate.
          </p>
        </div>
      </section>

      {/* ───────── INSTALLATION PACKAGE (light section) ───────── */}
      <section className="py-20 lg:py-28" style={{ background: c.bg.page }}>
        <div className="max-w-2xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="rounded-3xl p-8 sm:p-10 border" style={{ background: isDark ? "rgba(15,15,20,0.70)" : "white", borderColor: c.border.light, boxShadow: isDark ? "none" : "0 4px 24px rgba(0,0,0,0.06)" }}>
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-light mb-3 tracking-[-0.02em]" style={{ color: c.text.primary }}>Installation &amp; Equipment Package</h2>
              <p className="text-sm font-light" style={{ color: c.text.muted }}>A one-time investment of <span className="line-through" style={{ color: c.text.faint }}>$399</span></p>
            </div>
            <div className="space-y-3 mb-8">
              {PACKAGE_ITEMS.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 mt-0.5 bg-gradient-to-br from-[#EAB776]/20 to-[#B18059]/15 rounded-full flex items-center justify-center border border-[#EAB776]/25">
                    <svg className="w-3 h-3 text-[#EAB776]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  </div>
                  <span className="text-sm font-light" style={{ color: c.text.muted }}>{item}</span>
                </div>
              ))}
            </div>
            <div className="text-center mb-6">
              <p className="text-sm font-light mb-3" style={{ color: c.text.muted }}>For a limited onboarding window, your installation package is available for:</p>
              <div className="text-5xl sm:text-6xl font-light text-transparent bg-clip-text bg-gradient-to-r from-[#EAB776] to-[#B18059] mb-1">$99</div>
              <p className="text-xs font-light mt-2" style={{ color: c.text.faint }}>This is not a discount. It is an invitation to experience Spectra inside your real workflow.</p>
            </div>
            <a href={CHECKOUT_URL} className="block w-full text-center py-4 bg-gradient-to-r from-[#EAB776] to-[#B18059] hover:from-[#B18059] hover:to-[#EAB776] text-white font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] text-base">
              Install Spectra
            </a>
            <p className="text-center text-xs mt-4 font-light" style={{ color: c.text.faint }}>Limited onboarding capacity each month</p>
          </div>
        </div>
      </section>

      {/* ───────── PLANS ACCORDION (light section) ───────── */}
      <section className="pb-20 lg:pb-28" style={{ background: c.bg.page }}>
        <div className="max-w-3xl mx-auto px-6 sm:px-10 lg:px-16 text-center">
          <p className="text-lg font-light mb-6" style={{ color: c.text.muted }}>After your 21-day experience, choose the plan that fits your salon.</p>
          <button onClick={() => setPlansOpen((v) => !v)} className="inline-flex items-center gap-3 rounded-full px-8 py-4 border transition-all duration-300 group" style={{ borderColor: plansOpen ? "rgba(234,183,118,0.30)" : c.border.light, background: isDark ? "rgba(255,255,255,0.04)" : "white" }}>
            <span className="text-sm font-medium" style={{ color: c.text.secondary }}>View Monthly Plans</span>
            <svg className={`w-4 h-4 text-[#EAB776] transition-transform duration-300 ${plansOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>
          <div className={`overflow-hidden transition-all duration-500 ease-in-out ${plansOpen ? "max-h-[2000px] opacity-100 mt-10" : "max-h-0 opacity-0 mt-0"}`}>
            <div className="grid sm:grid-cols-2 gap-5">
              {PLANS.map((plan) => (
                <div key={plan.name} className="rounded-2xl p-6 border text-left transition-all duration-300 hover:border-[#EAB776]/20" style={{ background: isDark ? "rgba(255,255,255,0.04)" : "white", borderColor: c.border.light }}>
                  <div className="flex items-baseline justify-between mb-3">
                    <h3 className="font-medium text-lg" style={{ color: c.text.primary }}>{plan.name}</h3>
                    <div className="text-right">
                      <span className="text-2xl font-light text-transparent bg-clip-text bg-gradient-to-r from-[#EAB776] to-[#B18059]">${plan.price}</span>
                      <span className="text-xs ml-1" style={{ color: c.text.faint }}>/ mo</span>
                    </div>
                  </div>
                  <p className="text-sm font-light mb-4" style={{ color: c.text.muted }}>{plan.tagline}</p>
                  <ul className="space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm font-light" style={{ color: c.text.muted }}>
                        <div className="w-1 h-1 bg-[#EAB776]/60 rounded-full flex-shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────── THE REAL QUESTION (dark image section) ───────── */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat lg:bg-fixed" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=2940&auto=format&fit=crop')` }} />
        <div className="absolute inset-0 z-0" style={{ background: s.overlay }} />
        <div className="relative z-10 max-w-3xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="backdrop-blur-md rounded-3xl p-8 sm:p-12 border" style={{ background: s.solidCardBg, borderColor: s.cardBorder }}>
            <h2 className="text-3xl sm:text-4xl font-extralight mb-8 leading-[1.15] tracking-[-0.02em] text-center" style={{ color: s.textPrimary }}>
              This Is Not About{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EAB776] to-[#B18059]">Price</span>
            </h2>
            <div className="space-y-5 text-base font-light leading-relaxed">
              <p style={{ color: s.textDimmed }}>Price is what you pay this year to manage your salon correctly.</p>
              <p style={{ color: s.textDimmed }}>Cost is what it takes to keep pouring hundreds of dollars down the drain every month through color waste, miscalculations, over-ordering, and lost visibility.</p>
              <p style={{ color: s.textDimmed }}>Cost is what happens when clients leave because consistency is not measurable.</p>
              <p style={{ color: s.textMuted }}>Cost is what accumulates quietly.</p>
              <div className="w-12 h-px bg-gradient-to-r from-[#EAB776]/40 to-transparent mx-auto my-6" />
              <p style={{ color: s.textPrimary }}>Spectra does not add expense. It eliminates invisible loss.</p>
              <p style={{ color: s.textDimmed }}>In most salons, that invisible loss is ten times higher than the cost of using Spectra.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── LEAD FORM (light section) ───────── */}
      <section className="py-20 lg:py-28" style={{ background: c.bg.page }}>
        <div className="max-w-md mx-auto px-6 sm:px-10">
          <div className="rounded-3xl p-8 border" style={{ background: isDark ? "rgba(15,15,20,0.70)" : "white", borderColor: c.border.light, boxShadow: isDark ? "none" : "0 4px 24px rgba(0,0,0,0.06)" }}>
            <div className="text-center mb-7">
              <h2 className="text-xl font-light mb-2" style={{ color: c.text.primary }}>Reserve Your Installation</h2>
              <p className="text-sm font-light" style={{ color: c.text.muted }}>We will follow up with scheduling and payment details</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className={inputCls} placeholder="Full name" />
              <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className={inputCls} placeholder="Email address" />
              <input type="tel" name="phone" required value={formData.phone} onChange={handleInputChange} className={inputCls} placeholder="Phone number" />
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none" style={{ color: c.text.faint }}>@</span>
                <input type="text" name="instagram" value={formData.instagram} onChange={handleInputChange} className={`${inputCls} pl-8`} placeholder="Instagram page" />
              </div>
              <input type="text" name="salonName" value={formData.salonName} onChange={handleInputChange} className={inputCls} placeholder="Salon name (optional)" />
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full h-14 rounded-full font-medium transition-all duration-300 mt-4 text-base ${isSubmitting ? "opacity-50 cursor-not-allowed" : "bg-gradient-to-r from-[#EAB776] to-[#B18059] hover:from-[#B18059] hover:to-[#EAB776] text-white shadow-lg hover:shadow-xl transform hover:scale-[1.01]"}`}
              >
                {isSubmitting ? <span className="flex items-center justify-center gap-3"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting...</span> : "Reserve My Spot"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ───────── FINAL CTA (light section) ───────── */}
      <section className="pb-20 lg:pb-28" style={{ background: c.bg.page }}>
        <div className="max-w-3xl mx-auto px-6 sm:px-10 lg:px-16 text-center">
          <p className="text-xl sm:text-2xl font-light leading-relaxed mb-4" style={{ color: c.text.muted }}>
            Professional salons measure. They don't guess.
          </p>
          <p className="text-lg font-light mb-8" style={{ color: c.text.faint }}>
            Install Spectra. Operate with clarity. Scale with confidence.
          </p>
          <a href={CHECKOUT_URL} className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-[#EAB776] to-[#B18059] hover:from-[#B18059] hover:to-[#EAB776] text-white font-semibold text-lg rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02]">
            Begin Installation — $99
          </a>
          <p className="text-xs font-light mt-5" style={{ color: c.text.faint }}>Limited onboarding capacity each month</p>
        </div>
      </section>

      <div className="text-center pb-12" style={{ background: c.bg.page }}>
        <Link to="/" className="font-light text-sm transition-colors duration-200" style={{ color: c.text.faint }}>← Return to Spectra</Link>
      </div>
    </div>
  );
};

export const LeadCapturePage: React.FC = () => (
  <SiteThemeProvider>
    <LeadCaptureInner />
  </SiteThemeProvider>
);
