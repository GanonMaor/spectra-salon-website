import React, { useState, memo, useEffect } from "react";
import { Link } from "react-router-dom";
import { ClientCarousel } from "../../components/ClientCarousel";
import { Footer } from "../../components/Footer";
import { SiteThemeProvider, useSiteColors, useSiteTheme } from "../../contexts/SiteTheme";

const MemoizedClientCarousel = memo(ClientCarousel);
const MemoizedFooter = memo(Footer);

const GRAMS_PER_BOWL = 75;
const WASTE_RATE = 0.225;

const PLANS = [
  { name: "Single", price: 39, line: "Solo professionals and independent studios" },
  { name: "Multi", price: 79, line: "Small teams and growing salons" },
  { name: "Multi Plus", price: 129, line: "Established salons scaling operations" },
  { name: "Power", price: 189, line: "High-volume salons demanding full control" },
];

const PACKAGE_INCLUDES = [
  "SmartScale precision integration",
  "Premium iPad stand",
  "Personal Zoom installation session",
  "Full system activation",
  "21-day full access trial",
];

const UGCOfferInner: React.FC = () => {
  const [plansOpen, setPlansOpen] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [colorists, setColorists] = useState(3);
  const [servicesPerDay, setServicesPerDay] = useState(12);
  const [workingDays, setWorkingDays] = useState(250);
  const [costPerBowl, setCostPerBowl] = useState(2.5);

  const c = useSiteColors();
  const { isDark } = useSiteTheme();
  const s = c.imageSection;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const annualServices = servicesPerDay * workingDays;
  const annualWasteUSD = annualServices * costPerBowl;
  const wastedGramsPerBowl = GRAMS_PER_BOWL * WASTE_RATE;
  const annualWastedKg = (annualServices * wastedGramsPerBowl) / 1000;
  const showTip = servicesPerDay > 0 && colorists > 0 && servicesPerDay < colorists;

  const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  const safeInt = (v: string, fb: number) => { const n = parseInt(v, 10); return isNaN(n) || n < 0 ? fb : n; };
  const safeFloat = (v: string, fb: number) => { const n = parseFloat(v); return isNaN(n) || n < 0 ? fb : n; };

  const inputCls = isDark
    ? "w-full h-11 px-4 border border-white/12 rounded-xl text-white text-sm font-light outline-none focus:border-[#EAB776]/40 transition-all bg-white/5"
    : "w-full h-11 px-4 border border-gray-200 rounded-xl text-gray-900 text-sm font-light outline-none focus:border-[#B18059]/40 transition-all bg-white";
  const labelCls = isDark ? "block text-xs text-white/55 mb-1.5 font-light" : "block text-xs text-gray-500 mb-1.5 font-light";

  return (
    <div className="w-full min-h-screen font-sans antialiased overflow-x-hidden" style={{ background: c.bg.page }}>
      {/* ───────── 1. HERO (dark image section) ───────── */}
      <section className="relative pt-24 sm:pt-32 lg:pt-40 pb-16 lg:pb-24 overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat lg:bg-fixed"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=2940&auto=format&fit=crop')` }}
        />
        <div className="absolute inset-0 z-0" style={{ background: s.overlay }} />
        <div className="absolute inset-0 pointer-events-none z-[1]">
          <div className="absolute top-1/4 left-0 w-96 h-96 rounded-full blur-3xl" style={{ background: s.glowA }} />
          <div className="absolute bottom-1/4 right-0 w-80 h-80 rounded-full blur-3xl" style={{ background: s.glowB }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-10 lg:px-16 text-center">
          <div className="inline-flex items-center gap-2 mb-10">
            <div className="w-1.5 h-1.5 bg-[#EAB776]/60 rounded-full" />
            <span className="text-xs font-medium uppercase tracking-[0.2em]" style={{ color: s.textDimmed }}>
              Trusted by 1,500+ Hair Professionals
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extralight mb-5 leading-[1.05] tracking-[-0.03em]" style={{ color: s.textPrimary }}>
            Upgrade the Way
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EAB776] to-[#B18059]">
              You Run Your Salon
            </span>
          </h1>

          <p className="text-lg lg:text-xl leading-relaxed font-light max-w-3xl mx-auto mb-12" style={{ color: s.textDimmed }}>
            Spectra is a precision system designed to elevate how professional salons
            manage color, inventory, and profitability. Equipment arrives within 48 hours.
          </p>

          {/* Invisible Loss Calculator — inline in hero */}
          <div className="max-w-xl mx-auto mb-12">
            <div className="backdrop-blur-md rounded-2xl p-6 sm:p-8 border" style={{ background: s.solidCardBg || s.cardBg, borderColor: s.cardBorder }}>
              <h3 className="text-lg sm:text-xl font-light mb-1 tracking-[-0.01em]" style={{ color: s.textPrimary }}>
                Estimate your invisible color loss
              </h3>
              <p className="text-xs font-light mb-6" style={{ color: s.textDimmed }}>
                A simple projection based on average bowl usage and waste rates.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-[11px] mb-1 font-light" style={{ color: s.textMuted }}>Colorists</label>
                  <input type="number" min={1} value={colorists} onChange={(e) => setColorists(safeInt(e.target.value, 1))} className="w-full h-10 px-3 border rounded-lg text-sm font-light outline-none transition-all" style={{ background: s.cardBg, borderColor: s.cardBorder, color: s.textPrimary }} />
                </div>
                <div>
                  <label className="block text-[11px] mb-1 font-light" style={{ color: s.textMuted }}>Services / day</label>
                  <input type="number" min={1} value={servicesPerDay} onChange={(e) => setServicesPerDay(safeInt(e.target.value, 1))} className="w-full h-10 px-3 border rounded-lg text-sm font-light outline-none transition-all" style={{ background: s.cardBg, borderColor: s.cardBorder, color: s.textPrimary }} />
                </div>
              </div>

              {showTip && (
                <p className="text-xs font-light mb-3" style={{ color: "rgba(234,183,118,0.6)" }}>
                  Tip: Most salons run multiple color services per colorist per day.
                </p>
              )}

              <button onClick={() => setShowAdvanced((v) => !v)} className="text-[11px] font-light mb-3 transition-colors" style={{ color: s.textFaint || s.textMuted }}>
                {showAdvanced ? "Hide" : "Show"} advanced settings
              </button>

              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-[11px] mb-1 font-light" style={{ color: s.textMuted }}>Days / year</label>
                    <input type="number" min={1} value={workingDays} onChange={(e) => setWorkingDays(safeInt(e.target.value, 1))} className="w-full h-10 px-3 border rounded-lg text-sm font-light outline-none transition-all" style={{ background: s.cardBg, borderColor: s.cardBorder, color: s.textPrimary }} />
                  </div>
                  <div>
                    <label className="block text-[11px] mb-1 font-light" style={{ color: s.textMuted }}>Cost / bowl ($)</label>
                    <input type="number" min={0} step={0.1} value={costPerBowl} onChange={(e) => setCostPerBowl(safeFloat(e.target.value, 0))} className="w-full h-10 px-3 border rounded-lg text-sm font-light outline-none transition-all" style={{ background: s.cardBg, borderColor: s.cardBorder, color: s.textPrimary }} />
                  </div>
                </div>
              )}

              <div className="text-center pt-4 border-t" style={{ borderColor: s.cardBorder }}>
                <p className="text-[11px] mb-2 font-light" style={{ color: s.textFaint || s.textMuted }}>Based on average bowl waste in salons</p>
                <div className="text-3xl font-light text-transparent bg-clip-text bg-gradient-to-r from-[#EAB776] to-[#B18059] mb-1">${fmt(annualWasteUSD)}</div>
                <p className="text-sm font-light mb-0.5" style={{ color: s.textDimmed }}>Estimated annual color waste</p>
                <p className="text-xs font-light" style={{ color: s.textFaint || s.textMuted }}>
                  That's about {annualWastedKg.toFixed(1)} kg of product lost per year.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center">
            <Link
              to="/lead-capture?utm_source=ugc&utm_medium=hero&utm_campaign=install"
              className="px-10 py-4 bg-gradient-to-r from-[#EAB776] to-[#B18059] hover:from-[#B18059] hover:to-[#EAB776] text-white font-semibold text-base rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] text-center"
            >
              Begin Installation
            </Link>
            <Link
              to="/lead-capture?utm_source=ugc&utm_medium=hero&utm_campaign=consult"
              className="px-10 py-4 rounded-full text-base font-medium border transition-all duration-300 text-center"
              style={{ color: s.textDimmed, borderColor: s.cardBorder }}
            >
              Speak with me first
            </Link>
          </div>
        </div>
      </section>

      {/* ───────── 2. ONBOARDING INVITATION (light section) ───────── */}
      <section className="py-20 lg:py-28" style={{ background: c.bg.page }}>
        <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            {/* Left: narrative */}
            <div className="flex flex-col justify-center lg:pt-4">
              <h2 className="text-3xl sm:text-4xl font-extralight mb-6 leading-[1.15] tracking-[-0.02em]" style={{ color: c.text.primary }}>
                This Is Not About{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EAB776] to-[#B18059]">Price</span>
              </h2>
              <div className="space-y-4 mb-8">
                <p className="text-sm font-light leading-relaxed" style={{ color: c.text.muted }}>
                  Price is what you pay this year to manage your salon correctly.
                </p>
                <p className="text-sm font-light leading-relaxed" style={{ color: c.text.muted }}>
                  Cost is what waste and inconsistency quietly take every month.
                </p>
                <p className="text-sm font-light leading-relaxed" style={{ color: c.text.primary }}>
                  Spectra is designed to eliminate the invisible loss.
                </p>
              </div>

              <div className="relative rounded-2xl overflow-hidden border mb-4" style={{ borderColor: c.border.light }}>
                <img
                  src="/red_haed_using_spectra.jpg"
                  alt="Stylist using Spectra"
                  className="w-full h-auto object-cover"
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=800&q=80"; }}
                />
              </div>
              <p className="text-sm font-light text-center" style={{ color: c.text.muted }}>With us, you can.</p>
            </div>

            {/* Right: onboarding card */}
            <div
              className="rounded-3xl p-8 sm:p-10 border"
              style={{ background: isDark ? "rgba(15,15,20,0.70)" : "white", borderColor: c.border.light, boxShadow: isDark ? "none" : "0 4px 24px rgba(0,0,0,0.06)" }}
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl sm:text-3xl font-light mb-2 tracking-[-0.02em]" style={{ color: c.text.primary }}>
                  Onboarding Package
                </h3>
                <div className="flex items-baseline justify-center gap-2 mb-3">
                  <span className="text-sm line-through" style={{ color: c.text.muted }}>$399</span>
                  <span className="text-4xl sm:text-5xl font-light text-transparent bg-clip-text bg-gradient-to-r from-[#EAB776] to-[#B18059]">$99</span>
                </div>
                <p className="text-sm font-light" style={{ color: c.text.muted }}>
                  Equipment + installation + 21-day trial. Delivered in 48 hours.
                </p>
              </div>

              <div className="space-y-3 mb-8">
                {PACKAGE_INCLUDES.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-br from-[#EAB776]/20 to-[#B18059]/15 rounded-full flex items-center justify-center border border-[#EAB776]/25">
                      <svg className="w-3 h-3 text-[#EAB776]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm font-light" style={{ color: c.text.muted }}>{item}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-5">
                <Link
                  to="/lead-capture?utm_source=ugc&utm_medium=onboarding_card&utm_campaign=install"
                  className="block w-full text-center py-4 bg-gradient-to-r from-[#EAB776] to-[#B18059] hover:from-[#B18059] hover:to-[#EAB776] text-white font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.01] text-base"
                >
                  Begin Installation
                </Link>
                <Link
                  to="/lead-capture?utm_source=ugc&utm_medium=onboarding_card&utm_campaign=consult"
                  className="block w-full text-center py-3.5 rounded-full text-sm font-medium border transition-all duration-300"
                  style={{ color: c.text.muted, borderColor: c.border.light }}
                >
                  Speak with me first
                </Link>
              </div>

              {/* Plans accordion — inside card */}
              <div className="mt-6 pt-6 border-t" style={{ borderColor: c.border.light }}>
                <p className="text-center text-xs font-light mb-4" style={{ color: c.text.faint }}>
                  After the trial, choose a monthly plan that fits your salon.
                </p>

                <button
                  onClick={() => setPlansOpen((v) => !v)}
                  className="w-full inline-flex items-center justify-center gap-3 rounded-full px-6 py-3 border transition-all duration-300 mb-1"
                  style={{ borderColor: plansOpen ? "rgba(234,183,118,0.30)" : c.border.light, background: isDark ? "rgba(255,255,255,0.04)" : c.bg.page }}
                >
                  <span className="text-sm font-medium" style={{ color: c.text.secondary }}>Monthly Plans</span>
                  <span className="text-xs" style={{ color: c.text.faint }}>from $39/mo</span>
                  <svg className={`w-4 h-4 text-[#EAB776] transition-transform duration-300 ${plansOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${plansOpen ? "max-h-[600px] opacity-100 mt-4" : "max-h-0 opacity-0 mt-0"}`}>
                  <div className="space-y-2">
                    {PLANS.map((plan) => (
                      <div
                        key={plan.name}
                        className="flex items-center justify-between rounded-xl px-4 py-3 border transition-all"
                        style={{ background: isDark ? "rgba(255,255,255,0.03)" : c.bg.page, borderColor: c.border.light }}
                      >
                        <div className="flex items-baseline gap-2">
                          <span className="font-medium text-sm" style={{ color: c.text.primary }}>{plan.name}</span>
                          <span className="text-xs font-light hidden sm:inline" style={{ color: c.text.faint }}>{plan.line}</span>
                        </div>
                        <div className="flex items-baseline gap-1 flex-shrink-0">
                          <span className="text-base font-light text-transparent bg-clip-text bg-gradient-to-r from-[#EAB776] to-[#B18059]">${plan.price}</span>
                          <span className="text-xs" style={{ color: c.text.faint }}>/mo</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-[10px] font-light mt-4 text-center" style={{ color: c.text.faint }}>
                  Onboarding capacity is intentionally limited to keep setup quality high.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── 3. TRUST + PROGRESS TOGETHER (dark image section) ───────── */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat lg:bg-fixed"
          style={{ backgroundImage: `url('/dream-salon2.jpg')` }}
        />
        <div className="absolute inset-0 z-0" style={{ background: s.overlay }} />
        <div className="absolute inset-0 pointer-events-none z-[1]">
          <div className="absolute top-1/3 left-0 w-96 h-96 rounded-full blur-3xl" style={{ background: s.glowA }} />
          <div className="absolute bottom-1/4 right-0 w-80 h-80 rounded-full blur-3xl" style={{ background: s.glowB }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extralight mb-4 leading-[1.1] tracking-[-0.02em]" style={{ color: s.textPrimary }}>
              See what Spectra{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EAB776] to-[#B18059]">clients</span>{" "}
              are saying
            </h2>
          </div>
          <div className="mb-20">
            <MemoizedClientCarousel />
          </div>

          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extralight mb-3" style={{ color: s.textPrimary }}>
              Let's move{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EAB776] to-[#B18059]">forward together</span>
            </h2>
            <p className="text-base font-light" style={{ color: s.textDimmed }}>Choose how you'd like to connect</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto mb-12">
            {[
              { href: "https://wa.me/972504322680?text=Hi! I'm interested in Spectra", label: "WhatsApp", sub: "Quick response", gradient: "from-green-500 to-emerald-500", d: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488", fill: true },
              { href: "https://www.instagram.com/spectra.ci/", label: "Instagram DM", sub: "@spectra.ci", gradient: "from-pink-500 to-purple-500", d: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z", fill: true },
              { href: "mailto:office@spectra-ci.com", label: "Email", sub: "office@spectra-ci.com", gradient: "from-[#EAB776] to-[#B18059]", d: "M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", fill: false },
            ].map((ch) => (
              <a
                key={ch.label}
                href={ch.href}
                target={ch.href.startsWith("http") ? "_blank" : undefined}
                rel={ch.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="backdrop-blur-sm rounded-2xl p-6 border text-center transition-all duration-300 hover:border-[#EAB776]/25 group"
                style={{ background: s.cardBg, borderColor: s.cardBorder }}
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${ch.gradient} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                  <svg className="w-6 h-6 text-white" fill={ch.fill ? "currentColor" : "none"} stroke={ch.fill ? undefined : "currentColor"} strokeWidth={ch.fill ? undefined : 1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={ch.d} />
                  </svg>
                </div>
                <h4 className="font-medium text-sm mb-1" style={{ color: s.textPrimary }}>{ch.label}</h4>
                <p className="text-xs" style={{ color: s.textDimmed }}>{ch.sub}</p>
              </a>
            ))}
          </div>

          <div className="text-center">
            <p className="text-lg font-light mb-6" style={{ color: s.textDimmed }}>
              Professional salons measure. They don't guess.
            </p>
            <Link
              to="/lead-capture?utm_source=ugc&utm_medium=final_cta&utm_campaign=install"
              className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-[#EAB776] to-[#B18059] hover:from-[#B18059] hover:to-[#EAB776] text-white font-semibold text-lg rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02]"
            >
              Begin Installation — $99
            </Link>
          </div>
        </div>
      </section>

      <div className="text-center py-8" style={{ background: c.bg.page }}>
        <Link to="/" className="font-light text-sm transition-colors duration-200" style={{ color: c.text.faint }}>
          ← Return to Spectra
        </Link>
      </div>

      <MemoizedFooter />
    </div>
  );
};

export const UGCOfferPage: React.FC = () => (
  <SiteThemeProvider>
    <UGCOfferInner />
  </SiteThemeProvider>
);
