import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { apiClient } from "../../api/client";
import { Button } from "../../components/ui/button";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { ShippingAddressAutocomplete } from "./components/ShippingAddressAutocomplete";
import { useJsApiLoader } from "@react-google-maps/api";

const steps = ["Account Info", "Shipping Info", "Confirm"];
// Centralized Google Maps loader: load once here to avoid duplicate element warnings
const GOOGLE_LIBRARIES = [
  "places",
] as unknown as google.maps.plugins.loader.Library[];

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isTrial = searchParams.get("trial") === "true";

  const googleKey =
    (import.meta.env as any).VITE_GOOGLE_API_KEY ||
    (import.meta.env as any).VITE_GOOGLE_MAPS_API_KEY ||
    (import.meta.env as any).GOOGLE_MAPS_API_KEY ||
    "";

  const { isLoaded } = useJsApiLoader({
    id: "google-maps-script",
    googleMapsApiKey: googleKey,
    libraries: GOOGLE_LIBRARIES as any,
    language: "en",
    region: "IL",
  });

  const [mapsReady, setMapsReady] = useState(false);
  const [mapsError, setMapsError] = useState<string | null>(null);
  useEffect(() => {
    if (isLoaded) {
      setMapsReady(true);
      setMapsError(null);
      return;
    }
    const t = setTimeout(() => {
      if (!isLoaded) {
        setMapsReady(false);
        setMapsError(
          "Address autocomplete temporarily unavailable. You can continue without it.",
        );
      }
    }, 10000);
    return () => clearTimeout(t);
  }, [isLoaded]);

  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    instagram: "",
    // Plan
    plan_code: "single",
    plan_label: "Single User",
    plan_price: 39,
    plan_currency: "USD",
    shipping_address: "",
    shipping_city: "",
    shipping_zip: "",
    shipping_country: "",
    shipping_state: "",
    full_shipping_address: "",
    // Billing / invoice
    invoice_company: "",
    billing_address: "",
    billing_city: "",
    billing_zip: "",
    billing_country: "",
    billing_state: "",
    // Card
    card_number: "",
    card_exp_month: "",
    card_exp_year: "",
    card_cvc: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Autofill billing from shipping when reaching Confirm step
  useEffect(() => {
    if (step === 2) {
      setFormData((prev) => ({
        ...prev,
        billing_address: prev.billing_address || prev.shipping_address || "",
        billing_city: prev.billing_city || prev.shipping_city || "",
        billing_state: prev.billing_state || prev.shipping_state || "",
        billing_zip: prev.billing_zip || prev.shipping_zip || "",
        billing_country: prev.billing_country || prev.shipping_country || "",
      }));
    }
  }, [step]);

  const persistPartial = async (partial: Record<string, any>) => {
    try {
      await fetch("/.netlify/functions/signup-steps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, ...partial }),
      });
    } catch (e) {
      if (import.meta.env.DEV)
        console.warn("Partial persist failed (continuing):", e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const nextStep = async () => {
    // Minimal dial-code map for common countries
    const dialCodeByCountry: Record<string, string> = {
      IL: "+972",
      US: "+1",
      CA: "+1",
      GB: "+44",
      DE: "+49",
      FR: "+33",
      ES: "+34",
      IT: "+39",
      AU: "+61",
      NL: "+31",
    };
    const ensureDialCode = (phone: string, country?: string) => {
      const code = (country && dialCodeByCountry[country as keyof typeof dialCodeByCountry]) || "";
      const p = phone.trim();
      if (p.startsWith("+")) return p;
      if (code) {
        if (p.startsWith("0")) return `${code}${p.slice(1)}`;
        return `${code}${p}`;
      }
      return p;
    };

    if (step === 0) {
      if (!formData.fullName || !formData.email || !formData.instagram) {
        setError("Please fill in required fields");
        return;
      }
      // Require international format at step 0
      const phoneTrim = formData.phone.trim();
      if (!phoneTrim || !phoneTrim.startsWith("+")) {
        setError("Please include country code in phone number (e.g., +972501234567)");
        return;
      }
      await persistPartial({
        full_name: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        instagram: formData.instagram,
      });
    }
    if (step === 1) {
      // Normalize phone using selected country dial code (if not already with "+")
      const normalizedPhone = ensureDialCode(
        formData.phone,
        formData.shipping_country,
      );
      if (normalizedPhone !== formData.phone) {
        setFormData((prev) => ({ ...prev, phone: normalizedPhone }));
      }
      await persistPartial({
        shipping_address: formData.shipping_address,
        shipping_city: formData.shipping_city,
        shipping_state: formData.shipping_state,
        shipping_zip: formData.shipping_zip,
        shipping_country: formData.shipping_country,
        full_shipping_address: formData.full_shipping_address,
        phone: normalizedPhone,
      });
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const prevStep = () => setStep((s) => Math.max(0, s - 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (isTrial) {
      try {
        // 1) Prepare customer record
        const customer = {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          country: formData.shipping_country || "IL",
          address: formData.shipping_address,
          city: formData.shipping_city,
          zipCode: formData.shipping_zip,
          company_name: formData.invoice_company || undefined,
        };
        // Validate payment fields
        if (
          !formData.card_number ||
          !formData.card_exp_month ||
          !formData.card_exp_year ||
          !formData.card_cvc
        ) {
          setError("Please fill in all payment fields");
          setLoading(false);
          return;
        }

        // 2) Create subscription/charge via Netlify -> Sumit
        const paymentRes = await fetch("/.netlify/functions/sumit-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer,
            items: [
              {
                description: `Spectra Plan - ${formData.plan_label}`,
                quantity: 1,
                price: formData.plan_price,
                currency: formData.plan_currency,
                interval: "month",
              },
            ],
            card: {
              number: formData.card_number.replace(/\s|-/g, ""),
              exp_month: formData.card_exp_month,
              exp_year: formData.card_exp_year,
              cvc: formData.card_cvc,
            },
            metadata: {
              source: "spectra-signup-trial",
              instagram: formData.instagram || undefined,
            },
            redirectUrl: window.location.origin + "/signup/success",
          }),
        });
        const paymentJson = await paymentRes.json().catch(() => ({}));
        if (!paymentRes.ok) {
          // If backend surfaced a usable checkoutUrl via redirect, open it
          if (paymentJson?.checkoutUrl) {
            window.location.href = paymentJson.checkoutUrl as string;
            return;
          }
          throw new Error(paymentJson?.error || "Payment failed");
        }

        // 3) Submit lead for follow-up (includes instagram in message)
        const payload = {
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          message: formData.instagram
            ? `Instagram: ${formData.instagram}`
            : undefined,
          source_page: "/signup?trial=true",
          utm_source: new URLSearchParams(window.location.search).get("utm_source") || undefined,
          utm_medium: new URLSearchParams(window.location.search).get("utm_medium") || undefined,
          utm_campaign: new URLSearchParams(window.location.search).get("utm_campaign") || undefined,
        };
        const res = await fetch("/.netlify/functions/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to submit trial request");
        setSuccess(true);
        setTimeout(() => navigate("/"), 1500);
        return;
      } catch (err: any) {
        setError(err?.message || "Failed to submit");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      await apiClient.signup({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone,
      });
      setSuccess(true);
      setTimeout(() => navigate("/"), 1500);
    } catch (err: any) {
      setError(err?.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-spectra-cream via-white to-spectra-cream-dark">
        <div className="max-w-md w-full text-center space-y-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            ✓
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-spectra-charcoal to-spectra-charcoal-light bg-clip-text text-transparent">
            {isTrial ? "Request submitted!" : "Account Created Successfully!"}
          </h2>
          <p className="text-gray-600">
            Redirecting you {isTrial ? "to home" : "to dashboard"}...
          </p>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-[#0b0b0d] via-[#111315] to-[#0b0b0d] py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Subtle vertical grid lines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 24px)",
        }}
      />
      {/* Planetary glow at horizon */}
      <div
        className="pointer-events-none absolute -bottom-[22vh] left-1/2 -translate-x-1/2 w-[1600px] h-[800px] rounded-full opacity-70 blur-2xl"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255,112,54,0.38) 0%, rgba(255,112,54,0.22) 40%, rgba(255,112,54,0.0) 70%)",
        }}
      />
      <div className="max-w-xl w-full space-y-8">
        {/* Stepper */}
        <div className="flex items-center justify-center gap-4 text-sm">
          {steps.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center ${i <= step ? "bg-blue-500 text-white" : "bg-white/10 text-white/60"}`}
              >
                {i + 1}
              </div>
              <span
                className={`hidden sm:block ${i === step ? "text-white font-medium" : "text-white/60"}`}
              >
                {label}
              </span>
              {i < steps.length - 1 && (
                <div className="w-10 sm:w-16 h-px bg-white/15" />
              )}
            </div>
          ))}
        </div>

        {/* Premium header */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-light text-white tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">Your journey to confident coloring starts now.</h1>
          <p className="mt-2 text-sm text-white/80">Precise onboarding. Minimal friction. Premium experience.</p>
        </div>

        <div className="bg-white/10 backdrop-blur-3xl rounded-3xl shadow-2xl p-8 border border-white/15">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {step === 0 && (
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium text-white"
                  >
                    Full Name *
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl focus:border-blue-400/60 focus:ring-1 focus:ring-blue-400/30 transition-all duration-200 text-white placeholder-white/70"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-white"
                  >
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl focus:border-blue-400/60 focus:ring-1 focus:ring-blue-400/30 transition-all duration-200 text-white placeholder-white/70"
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-white"
                  >
                    Email Address *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl focus:border-blue-400/60 focus:ring-1 focus:ring-blue-400/30 transition-all duration-200 text-white placeholder-white/70"
                    placeholder="Enter your email address"
                  />
                </div>
                <div>
                  <label
                    htmlFor="instagram"
                    className="block text-sm font-medium text-white"
                  >
                    Instagram Page *
                  </label>
                  <input
                    id="instagram"
                    name="instagram"
                    type="text"
                    required
                    value={formData.instagram}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl focus:border-blue-400/60 focus:ring-1 focus:ring-blue-400/30 transition-all duration-200 text-white placeholder-white/70"
                    placeholder="@your_instagram or profile URL"
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                    Shipping Address
                  </label>
                  {mapsError && (
                    <div className="text-xs text-gray-500 mb-1">
                      {mapsError}
                    </div>
                  )}
                  <ShippingAddressAutocomplete
                    isLoaded={mapsReady}
                    onSelect={(data) =>
                      setFormData((prev) => ({
                        ...prev,
                        shipping_address: data.addressLine1,
                        shipping_city: data.city,
                        shipping_state: data.state,
                        shipping_zip: data.zip,
                        shipping_country: data.country,
                        full_shipping_address: data.fullAddress,
                      }))
                    }
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <input
                    id="shipping_city"
                    name="shipping_city"
                    type="text"
                    value={formData.shipping_city}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl focus:border-blue-400/60 focus:ring-1 focus:ring-blue-400/30 transition-all duration-200 text-white placeholder-white/70"
                    placeholder="City"
                  />
                  <input
                    id="shipping_state"
                    name="shipping_state"
                    type="text"
                    value={formData.shipping_state}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl focus:border-blue-400/60 focus:ring-1 focus:ring-blue-400/30 transition-all duration-200 text-white placeholder-white/70"
                    placeholder="State / Region"
                  />
                  <input
                    id="shipping_zip"
                    name="shipping_zip"
                    type="text"
                    value={formData.shipping_zip}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl focus:border-blue-400/60 focus:ring-1 focus:ring-blue-400/30 transition-all duration-200 text-white placeholder-white/70"
                    placeholder="ZIP / Postal code"
                  />
                  <input
                    id="shipping_country"
                    name="shipping_country"
                    type="text"
                    value={formData.shipping_country}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl focus:border-blue-400/60 focus:ring-1 focus:ring-blue-400/30 transition-all duration-200 text-white placeholder-white/70"
                    placeholder="Country"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
            <div className="space-y-6">
                <div className="rounded-xl bg-amber-500/10 border border-amber-400/30 p-4">
                  <p className="text-sm text-white/90">
                    To ensure we can send your free bundle quickly, please enter your shipping address and payment details below. Rest assured – no charges will apply until your 30-day free trial ends, and you’ll receive a reminder 7 days before the trial period concludes.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-spectra-charcoal">Plan</label>
                  <select
                    name="plan_code"
                    value={formData.plan_code}
                    onChange={(e) => {
                      const val = e.target.value;
                      const map: Record<string, { label: string; price: number }> = {
                        single: { label: "Single User", price: 39 },
                        multi: { label: "Multi Users", price: 79 },
                        multi_plus: { label: "Multi Plus", price: 129 },
                        power: { label: "Power Salon", price: 189 },
                      };
                      const sel = map[val] || map.single;
                      setFormData((p) => ({
                        ...p,
                        plan_code: val,
                        plan_label: sel.label,
                        plan_price: sel.price,
                        plan_currency: "USD",
                      }));
                    }}
                    className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-spectra-gold focus:border-spectra-gold"
                  >
                    <option value="single">Single User - $39/month</option>
                    <option value="multi">Multi Users - $79/month</option>
                    <option value="multi_plus">Multi Plus - $129/month</option>
                    <option value="power">Power Salon - $189/month</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-spectra-charcoal">Company (for invoice)</label>
                    <input
                      name="invoice_company"
                      value={formData.invoice_company}
                      onChange={handleChange}
                    className="mt-1 w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl focus:border-blue-400/60 focus:ring-1 focus:ring-blue-400/30 transition-all duration-200 text-white placeholder-white/70"
                      placeholder="Company name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-spectra-charcoal">Billing Address</label>
                    <input
                      name="billing_address"
                      value={formData.billing_address}
                      onChange={handleChange}
                    className="mt-1 w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl focus:border-blue-400/60 focus:ring-1 focus:ring-blue-400/30 transition-all duration-200 text-white placeholder-white/70"
                      placeholder="Street and number"
                    />
                  </div>
                  <input
                    name="billing_city"
                    value={formData.billing_city}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl focus:border-blue-400/60 focus:ring-1 focus:ring-blue-400/30 transition-all duration-200 text-white placeholder-white/70"
                    placeholder="City"
                  />
                  <input
                    name="billing_zip"
                    value={formData.billing_zip}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl focus:border-blue-400/60 focus:ring-1 focus:ring-blue-400/30 transition-all duration-200 text-white placeholder-white/70"
                    placeholder="ZIP / Postal code"
                  />
                  <input
                    name="billing_state"
                    value={formData.billing_state}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl focus:border-blue-300/50 focus:ring-1 focus:ring-blue-300/30 transition-all duration-200 text-white placeholder-white/50"
                    placeholder="State / Region"
                  />
                  <input
                    name="billing_country"
                    value={formData.billing_country}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl focus:border-blue-300/50 focus:ring-1 focus:ring-blue-300/30 transition-all duration-200 text-white placeholder-white/50"
                    placeholder="Country"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <input
                    name="card_number"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    value={formData.card_number}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl focus:border-blue-300/50 focus:ring-1 focus:ring-blue-300/30 transition-all duration-200 text-white placeholder-white/50"
                    placeholder="Card number"
                    required
                  />
                  <input
                    name="card_exp_month"
                    inputMode="numeric"
                    autoComplete="cc-exp-month"
                    value={formData.card_exp_month}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl focus:border-blue-300/50 focus:ring-1 focus:ring-blue-300/30 transition-all duration-200 text-white placeholder-white/50"
                    placeholder="MM"
                    required
                  />
                  <input
                    name="card_exp_year"
                    inputMode="numeric"
                    autoComplete="cc-exp-year"
                    value={formData.card_exp_year}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl focus:border-blue-300/50 focus:ring-1 focus:ring-blue-300/30 transition-all duration-200 text-white placeholder-white/50"
                    placeholder="YYYY"
                    required
                  />
                  <input
                    name="card_cvc"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    value={formData.card_cvc}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl focus:border-blue-300/50 focus:ring-1 focus:ring-blue-300/30 transition-all duration-200 text-white placeholder-white/50"
                    placeholder="CVC"
                    required
                  />
                </div>

                {/* Trust badges and license */}
                <div className="pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 border border-gray-200">
                        <svg className="w-3.5 h-3.5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="5" width="20" height="14" rx="2" />
                          <path d="M2 10h20" />
                        </svg>
                        <span>VISA/MC</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 border border-gray-200">
                        <svg className="w-3.5 h-3.5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="10" rx="2" />
                          <path d="M7 11V7a5 5 0 0110 0v4" />
                        </svg>
                        <span>SSL</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 border border-gray-200">
                        <svg className="w-3.5 h-3.5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2l7 4v5c0 5-3.5 9-7 11-3.5-2-7-6-7-11V6l7-4z" />
                          <path d="M9 12l2 2 4-4" />
                        </svg>
                        <span>PCI DSS</span>
                      </span>
                    </div>
                    <div className="sm:text-right">
                      <span>Page by Spectra CI LTD, ID: 516078094</span>
                      <span className="hidden sm:inline mx-1">•</span>
                      <span>Secured by SUMIT</span>
                    </div>
                  </div>
                </div>
                {!isTrial && (
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-spectra-charcoal"
                    >
                      Password *
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-spectra-gold focus:border-spectra-gold"
                      placeholder="Create a password (min 6 characters)"
                    />
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-between gap-3">
              <Button
                type="button"
                onClick={prevStep}
                disabled={step === 0 || loading}
                size="lg"
                className="px-5 disabled:opacity-50"
              >
                Back
              </Button>
              {step < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={loading}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_6px_24px_rgba(255,115,64,0.3)] hover:shadow-[0_8px_30px_rgba(255,115,64,0.45)] transition-colors disabled:opacity-50"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className={
                    isTrial
                      ? "px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_6px_24px_rgba(255,115,64,0.3)] hover:shadow-[0_8px_30px_rgba(255,115,64,0.45)] transition-colors disabled:opacity-50"
                      : "px-6 py-3 rounded-xl"
                  }
                >
                  {isTrial ? "Start My Free Trial" : "Create Account"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
