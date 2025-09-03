import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { apiClient } from "../../api/client";
import { Button } from "../../components/ui/button";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { ShippingAddressAutocomplete } from "./components/ShippingAddressAutocomplete";
import { useJsApiLoader, Libraries } from "@react-google-maps/api";
import { useToast } from "../../components/ui/use-toast";
import { sumitTokenization } from "../../services/sumitTokenization";

const steps = ["Account Info", "Shipping Info", "Confirm"];
// Centralized Google Maps loader: load once here to avoid duplicate element warnings
const GOOGLE_LIBRARIES: Libraries = [
  "places",
];

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const isTrial = searchParams.get("trial") === "true";
  const formRef = useRef<HTMLFormElement>(null);
  const [tokenizationReady, setTokenizationReady] = useState(false);

  const googleKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_GOOGLE_API_KEY || "";

  const { isLoaded } = useJsApiLoader({
    id: "google-maps-script",
    googleMapsApiKey: googleKey,
    libraries: GOOGLE_LIBRARIES,
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
    company: "",
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
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const [detectedDial, setDetectedDial] = useState<string | null>(null);
  const [phoneDisplay, setPhoneDisplay] = useState("");
  const [selectedPhoneCountry, setSelectedPhoneCountry] = useState<string>("IL");
  // Billing and card UX helpers (IG-friendly)
  const [billingSame, setBillingSame] = useState<boolean>(true);
  const [cardDisplay, setCardDisplay] = useState<string>("");
  const [expiryDisplay, setExpiryDisplay] = useState<string>("");
  const isIG = (() => {
    const ua = (typeof navigator !== "undefined" && navigator.userAgent) || "";
    const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const igMode = params?.get("ig_mode") || params?.get("ig_preview") || params?.get("ig_only") || params?.get("ig");
    const forced = igMode ? /^(1|true|yes|ig)$/i.test(igMode) : false;
    return /instagram/i.test(ua) || forced;
  })();

  // Prevent horizontal scroll in in-app browsers
  useEffect(() => {
    if (!isIG) return;
    const prior = document.documentElement.style.overflowX;
    document.documentElement.style.overflowX = "hidden";
    document.body.style.overflowX = "hidden";
    return () => {
      document.documentElement.style.overflowX = prior;
      document.body.style.overflowX = prior;
    };
  }, [isIG]);

  // Try lightweight instagram autofill via query param ?ig=USERNAME or ?ig_username=
  useEffect(() => {
    if (!isIG) return;
    const p = new URLSearchParams(window.location.search);
    const rawIg = p.get("ig_username") || p.get("ig") || "";
    // If ig param looks like a boolean flag (1/true), don't treat as username
    const isFlag = /^(1|true|yes|ig)$/i.test(rawIg || "");
    const ig = isFlag ? "" : rawIg;
    if (ig && !formData.instagram) {
      setFormData((prev) => ({ ...prev, instagram: ig.startsWith("@") ? ig : `@${ig}` }));
    }
  }, [isIG]);

  // Initialize SUMIT tokenization when reaching payment step
  useEffect(() => {
    if (step !== 2 || !isTrial) return; // Only on payment step for trial
    
    const initializeTokenization = async () => {
      try {
        console.log('Initializing SUMIT tokenization...');
        
        // Get SUMIT config from environment variables
        const companyId = import.meta.env.VITE_SUMIT_COMPANY_ID;
        const apiPublicKey = import.meta.env.VITE_SUMIT_API_PUBLIC_KEY;
        
        if (!companyId || !apiPublicKey) {
          console.error('SUMIT configuration missing');
          return;
        }
        
        await sumitTokenization.initializeTokenization('#payment-form', {
          CompanyID: companyId,
          APIPublicKey: apiPublicKey
        });
        
        setTokenizationReady(true);
        console.log('SUMIT tokenization ready');
      } catch (error) {
        console.error('Failed to initialize SUMIT tokenization:', error);
        toast({
          title: "Payment Setup Error",
          description: "Unable to initialize payment system. Please refresh and try again.",
          variant: "destructive"
        });
      }
    };
    
    initializeTokenization();
  }, [step, isTrial, toast]);

  // Detect country dialing code on mount (best-effort)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/.netlify/functions/detect-geo");
        if (!res.ok) return;
        const data = await res.json().catch(() => ({}));
        const dial = (data && data.dial_code) || "";
        const country = (data && data.country) || null;
        setDetectedCountry(country);
        setDetectedDial(dial);
        if (country) setSelectedPhoneCountry(country);
        if (dial && !formData.phone?.startsWith("+")) {
          setFormData((p) => ({ ...p, phone: dial }));
          setPhoneDisplay(dial + " ");
        }
      } catch {
        // ignore – optional enhancement
      }
    })();
  }, []);

  const normalizePhoneByCountry = (input: string, country?: string) => {
    const only = String(input || "").replace(/[^0-9+]/g, "");
    if (only.startsWith("+")) return only;
    const cc = country || selectedPhoneCountry || detectedCountry || undefined;
    const dial = (cc && (detectedDial || "")) || (cc === "IL" ? "+972" : cc === "US" ? "+1" : "");
    if (!dial) return only;
    if (only.startsWith("0")) return dial + only.slice(1);
    return dial + only;
  };

  const formatPhoneForDisplay = (e164: string, country?: string) => {
    const cc = country || detectedCountry || undefined;
    if (!e164 || !e164.startsWith("+")) return e164;
    const digits = e164.replace(/\D/g, "");
    if (digits.startsWith("972") || cc === "IL") {
      // +972 + 9 digits
      const local = digits.replace(/^972/, "");
      if (local.length >= 9) {
        const p1 = local.slice(0, 2); // 5x or area
        const p2 = local.slice(2, 5);
        const p3 = local.slice(5, 9);
        return "+972 (0) " + p1 + "-" + p2 + "-" + p3;
      }
      return "+972 (0) " + local;
    }
    if (digits.startsWith("1") || cc === "US" || cc === "CA") {
      // +1 + 10 digits
      const local = digits.replace(/^1/, "");
      if (local.length >= 10) {
        const a = local.slice(0, 3);
        const b = local.slice(3, 6);
        const c = local.slice(6, 10);
        return "+1 (" + a + ") " + b + "-" + c;
      }
      return "+1 " + local;
    }
    // Fallback grouping
    const body = digits.replace(/^\d{1,3}/, (m) => "");
    return e164.split(" ").join("") + (body ? " " + body.replace(/(\d{3})(?=\d)/g, "$1 ") : "");
  };

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
    if (name === "phone") {
      setPhoneDisplay(value);
      const normalized = normalizePhoneByCountry(value, formData.shipping_country || undefined);
      setFormData((prev) => ({ ...prev, phone: normalized }));
      setError(null);
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handlePhoneBlur = () => {
    const normalized = normalizePhoneByCountry(
      phoneDisplay || formData.phone,
      selectedPhoneCountry || formData.shipping_country || undefined,
    );
    setFormData((prev) => ({ ...prev, phone: normalized }));
    setPhoneDisplay(
      formatPhoneForDisplay(
        normalized,
        selectedPhoneCountry || formData.shipping_country || undefined,
      ),
    );
  };

  const handleCountrySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCode = e.target.value;
    setSelectedPhoneCountry(newCode);
    const normalized = normalizePhoneByCountry(
      phoneDisplay || formData.phone,
      newCode,
    );
    setFormData((prev) => ({ ...prev, phone: normalized }));
    setPhoneDisplay(formatPhoneForDisplay(normalized, newCode));
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
      // If user typed local number but we detected a dial code, auto-normalize
      const phoneTrim = (formData.phone || "").trim();
      if (phoneTrim && !phoneTrim.startsWith("+")) {
        // Try using detected country from step 1 (shipping) or default IL
        const normalized = ensureDialCode(phoneTrim, formData.shipping_country || "IL");
        setFormData((prev) => ({ ...prev, phone: normalized }));
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
    console.log("🚀 handleSubmit called - isTrial:", isTrial, "step:", step);
    setLoading(true);
    setError(null);

    if (isTrial) {
      console.log("🔄 Starting SUMIT trial signup process...");
      try {
        // Validate required fields
        if (!formData.fullName || !formData.email || !formData.phone) {
          setError("Please fill in all required fields");
          setLoading(false);
          return;
        }

        // Validate card fields
        if (!formData.card_number || !formData.card_exp_month || !formData.card_exp_year || !formData.card_cvc) {
          setError("Please fill in all payment fields");
          setLoading(false);
          return;
        }

        console.log("✅ All fields validated, proceeding with registration...");

        // Parse name into first and last
        const nameParts = formData.fullName.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || nameParts[0] || '';

        // Get selected plan value from dropdown
        const planDropdownValue = (() => {
          switch(formData.plan_code) {
            case 'single': return 'Single User – $39/month';
            case 'pro': return 'Pro – $89/month';
            case 'business': return 'Business – $149/month';
            case 'enterprise': return 'Enterprise – $299/month';
            default: return 'Single User – $39/month';
          }
        })();

        // Prepare data for backend (temporary: sending card details directly for testing)
        const payload = {
          email: formData.email,
          firstName: firstName,
          lastName: lastName,
          phone: formData.phone,
          plan: planDropdownValue,
          companyName: formData.company || formData.invoice_company || '',
          cardNumber: formData.card_number,
          expMonth: formData.card_exp_month,
          expYear: formData.card_exp_year,
          cvc: formData.card_cvc
        };

        console.log("📤 Submitting to backend...", {
          email: payload.email,
          plan: payload.plan,
          companyName: payload.companyName,
          hasCardNumber: !!payload.cardNumber
        });
        
        const res = await fetch("/.netlify/functions/create-user-with-sumit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        
        const result = await res.json();
        
        if (!res.ok) {
          console.error("❌ Backend error:", result);
          throw new Error(result.error || "Failed to process payment");
        }
        
        console.log("✅ Trial signup completed successfully", result);
        
        // Show success toast
        toast({
          title: "Welcome to Spectra!",
          description: result.message || "Your 35-day free trial has started",
          variant: "default",
        });

        setSuccess(true);
        setTimeout(() => navigate("/dashboard"), 2000);
        return;
      } catch (err: any) {
        console.error("Signup error:", err);
        
        // Show error toast with specific message
        toast({
          title: "Signup Failed",
          description: err.message || "Please check your information and try again",
          variant: "destructive",
        });
        
        setError(err?.message || "Failed to complete signup");
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

  const wrapperClass = isIG
    ? "min-h-screen flex items-start justify-center bg-white py-6 px-4 overflow-x-hidden"
    : "min-h-screen relative flex items-center justify-center bg-gradient-to-br from-[#0b0b0d] via-[#111315] to-[#0b0b0d] py-12 px-4 sm:px-6 lg:px-8 overflow-hidden";

  const cardClass = isIG
    ? "bg-white rounded-3xl shadow-2xl p-6 border border-gray-200"
    : "bg-white/10 backdrop-blur-3xl rounded-3xl shadow-2xl p-8 border border-white/15";

  const labelClass = isIG
    ? "block text-sm font-medium text-gray-900"
    : "block text-sm font-medium text-white";

  const inputClass = isIG
    ? "mt-1 w-full px-4 py-3 bg-white border border-gray-300 rounded-2xl focus:border-gray-900/30 focus:ring-1 focus:ring-gray-900/20 transition-all duration-200 text-gray-900 placeholder-gray-400"
    : "mt-1 w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl focus:border-blue-400/60 focus:ring-1 focus:ring-blue-400/30 transition-all duration-200 text-white placeholder-white/70";

  const selectClass = isIG
    ? "px-3 py-3 bg-white border border-gray-300 rounded-2xl text-gray-900 focus:border-gray-900/30 focus:ring-1 focus:ring-gray-900/20"
    : "px-3 py-3 bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl text-white focus:border-blue-400/60 focus:ring-1 focus:ring-blue-400/30";

  return (
    <div className={wrapperClass}>
      {/* Background decorations (desktop theme only) */}
      {!isIG && (
        <>
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to bottom, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 24px)",
            }}
          />
          <div
            className="pointer-events-none absolute -bottom-[22vh] left-1/2 -translate-x-1/2 w-[1600px] h-[800px] rounded-full opacity-70 blur-2xl"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(255,112,54,0.38) 0%, rgba(255,112,54,0.22) 40%, rgba(255,112,54,0.0) 70%)",
            }}
          />
        </>
      )}
      <div className="max-w-xl w-full space-y-8">
        {/* Stepper */}
        <div className="flex items-center justify-center gap-4 text-sm">
          {steps.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  isIG
                    ? i <= step
                      ? "bg-gray-900 text-white"
                      : "bg-gray-200 text-gray-700"
                    : i <= step
                      ? "bg-blue-500 text-white"
                      : "bg-white/10 text-white/60"
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`hidden sm:block ${
                  isIG
                    ? i === step
                      ? "text-gray-900 font-medium"
                      : "text-gray-600"
                    : i === step
                      ? "text-white font-medium"
                      : "text-white/60"
                }`}
              >
                {label}
              </span>
              {i < steps.length - 1 && (
                <div className={`w-10 sm:w-16 h-px ${isIG ? "bg-gray-300" : "bg-white/15"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Premium header */}
        <div className="text-center">
          <h1 className={isIG ? "text-2xl sm:text-3xl font-semibold text-gray-900" : "text-3xl sm:text-4xl font-light text-white tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"}>Your journey to confident coloring starts now.</h1>
          <p className={isIG ? "mt-2 text-sm text-gray-600" : "mt-2 text-sm text-white/80"}>Precise onboarding. Minimal friction. Premium experience.</p>
        </div>

        <div className={cardClass}>
          <form id="payment-form" ref={formRef} className="space-y-6" onSubmit={handleSubmit} data-og="form">
            {step === 0 && (
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="fullName"
                    className={labelClass}
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
                    className={inputClass}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className={labelClass}
                  >
                    Phone Number
                  </label>
                  <div className="mt-1 grid grid-cols-[140px_1fr] gap-2">
                    <select
                      value={selectedPhoneCountry}
                      onChange={handleCountrySelect}
                      className={selectClass}
                    >
                      <option value="IL">Israel (+972)</option>
                      <option value="US">United States (+1)</option>
                      <option value="CA">Canada (+1)</option>
                      <option value="GB">United Kingdom (+44)</option>
                      <option value="ES">Spain (+34)</option>
                      <option value="IT">Italy (+39)</option>
                      <option value="FR">France (+33)</option>
                      <option value="DE">Germany (+49)</option>
                      <option value="NL">Netherlands (+31)</option>
                      <option value="AU">Australia (+61)</option>
                    </select>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={phoneDisplay || formData.phone}
                      onChange={handleChange}
                      onBlur={handlePhoneBlur}
                      className={inputClass}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className={labelClass}
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
                    className={inputClass}
                    placeholder="Enter your email address"
                  />
                </div>
                <div>
                  <label
                    htmlFor="instagram"
                    className={labelClass}
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
                    className={inputClass}
                    placeholder="@your_instagram or profile URL"
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className={labelClass + (isIG ? "" : " drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]") }>
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
                    className={inputClass}
                    placeholder="City"
                  />
                  <input
                    id="shipping_state"
                    name="shipping_state"
                    type="text"
                    value={formData.shipping_state}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="State / Region"
                  />
                  <input
                    id="shipping_zip"
                    name="shipping_zip"
                    type="text"
                    value={formData.shipping_zip}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="ZIP / Postal code"
                  />
                  <input
                    id="shipping_country"
                    name="shipping_country"
                    type="text"
                    value={formData.shipping_country}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Country"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
            <div className="space-y-6">
                <div className={isIG ? "rounded-xl bg-orange-50 border border-orange-200 p-4" : "rounded-xl bg-amber-500/10 border border-amber-400/30 p-4"}>
                  <p className={isIG ? "text-sm text-gray-800" : "text-sm text-white/90"}>
                    To ensure we can send your free bundle quickly, please enter your shipping address and payment details below. Rest assured – no charges will apply until your 30-day free trial ends, and you’ll receive a reminder 7 days before the trial period concludes.
                  </p>
                </div>
                <div>
                  <label className={isIG ? "block text-sm font-medium text-gray-900" : "block text-sm font-medium text-white"}>Plan</label>
                  <select
                    name="plan_code"
                    value={formData.plan_code}
                    onChange={(e) => {
                      const val = e.target.value;
                      const map: Record<string, { label: string; price: number }> = {
                        single: { label: "Single User", price: 39 },
                        pro: { label: "Pro", price: 89 },
                        business: { label: "Business", price: 149 },
                        enterprise: { label: "Enterprise", price: 299 },
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
                    className={isIG ? "mt-1 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900/30 bg-white text-gray-900" : "mt-1 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-spectra-gold focus:border-spectra-gold"}
                  >
                    <option value="single">Single User - $39/month</option>
                    <option value="pro">Pro - $89/month</option>
                    <option value="business">Business - $149/month</option>
                    <option value="enterprise">Enterprise - $299/month</option>
                  </select>
                </div>



                {/* Company name field */}
                <div>
                  <label className={isIG ? "block text-sm font-medium text-gray-900" : "block text-sm font-medium text-white"}>Company name (for invoice)</label>
                  <input
                    name="company"
                    value={formData.company || ''}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Your salon name"
                  />
                </div>

                {/* Payment Fields - Placeholder */}
                <div>
                  <label className={isIG ? "block text-sm font-medium text-gray-900" : "block text-sm font-medium text-white"}>Card number</label>
                  <input
                    data-og="cardnumber"
                    type="text"
                    size={20}
                    maxLength={19}
                    value={cardDisplay}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
                      const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                      setCardDisplay(formatted);
                      setFormData(prev => ({ ...prev, card_number: value }));
                    }}
                    className={inputClass}
                    placeholder="Card number"
                    required
                    autoComplete="cc-number"
                  />
                </div>

                {/* Expiry + CVC */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={isIG ? "block text-sm font-medium text-gray-900" : "block text-sm font-medium text-white"}>Month</label>
                    <input
                      data-og="expirationmonth"
                      name="card_exp_month"
                      type="text"
                      size={2}
                      maxLength={2}
                      value={formData.card_exp_month}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 2) {
                          setFormData(prev => ({ ...prev, card_exp_month: value }));
                        }
                      }}
                      className={inputClass}
                      placeholder="MM"
                      required
                      autoComplete="cc-exp-month"
                    />
                  </div>
                  <div>
                    <label className={isIG ? "block text-sm font-medium text-gray-900" : "block text-sm font-medium text-white"}>Year</label>
                    <input
                      data-og="expirationyear"
                      name="card_exp_year"
                      type="text"
                      size={4}
                      maxLength={4}
                      value={formData.card_exp_year}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 4) {
                          setFormData(prev => ({ ...prev, card_exp_year: value }));
                        }
                      }}
                      className={inputClass}
                      placeholder="YYYY"
                      required
                      autoComplete="cc-exp-year"
                    />
                  </div>
                  <div>
                    <label className={isIG ? "block text-sm font-medium text-gray-900" : "block text-sm font-medium text-white"}>CVC</label>
                    <input
                      data-og="cvv"
                      name="card_cvc"
                      type="text"
                      size={4}
                      maxLength={4}
                      value={formData.card_cvc}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 4) {
                          setFormData(prev => ({ ...prev, card_cvc: value }));
                        }
                      }}
                      className={inputClass}
                      placeholder="CVV"
                      required
                      autoComplete="cc-csc"
                    />
                  </div>
                </div>

                {/* ID Number field for SUMIT */}
                <div>
                  <label className={isIG ? "block text-sm font-medium text-gray-900" : "block text-sm font-medium text-white"}>ID Number</label>
                  <input
                    data-og="citizenid"
                    type="text"
                    maxLength={9}
                    className={inputClass}
                    placeholder="ID Number"
                    required
                  />
                </div>

                {/* Hidden field for SUMIT token */}
                <input type="hidden" name="og-token" />

                {/* SUMIT errors container */}
                <div className="og-errors text-red-500 text-sm"></div>

                {/* Billing toggle and conditional fields */}
                <div className="flex items-center gap-3">
                  <input id="sameInvoice" type="checkbox" checked={billingSame} onChange={() => setBillingSame((s) => !s)} className="h-4 w-4" />
                  <label htmlFor="sameInvoice" className={isIG ? "text-sm text-gray-900" : "text-sm text-white"}>Use shipping address for invoice</label>
                </div>

                {!billingSame && (
                  <div className="space-y-3" aria-expanded={!billingSame}>
                    <div>
                      <label className={isIG ? "block text-sm font-medium text-gray-900" : "block text-sm font-medium text-spectra-charcoal"}>Billing Address</label>
                      <input name="billing_address" value={formData.billing_address} onChange={handleChange} className={inputClass} placeholder="Street and number" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={isIG ? "block text-sm font-medium text-gray-900" : "block text-sm font-medium text-spectra-charcoal"}>City</label>
                        <input name="billing_city" value={formData.billing_city} onChange={handleChange} className={inputClass} placeholder="City" />
                      </div>
                      <div>
                        <label className={isIG ? "block text-sm font-medium text-gray-900" : "block text-sm font-medium text-spectra-charcoal"}>ZIP</label>
                        <input name="billing_zip" inputMode="numeric" value={formData.billing_zip} onChange={handleChange} className={inputClass} placeholder="ZIP / Postal code" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={isIG ? "block text-sm font-medium text-gray-900" : "block text-sm font-medium text-spectra-charcoal"}>Country</label>
                        <input name="billing_country" value={formData.billing_country} onChange={handleChange} className={inputClass} placeholder="Country" />
                      </div>
                      <div>
                        <label className={isIG ? "block text-sm font-medium text-gray-900" : "block text-sm font-medium text-spectra-charcoal"}>State / Region</label>
                        <input name="billing_state" value={formData.billing_state} onChange={handleChange} className={inputClass} placeholder="State / Region" />
                      </div>
                    </div>
                  </div>
                )}

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
                      <span>Secured by Spectra</span>
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
