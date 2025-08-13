import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { apiClient } from "../../api/client";
import { Button } from "../../components/ui/button";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { ShippingAddressAutocomplete } from "./components/ShippingAddressAutocomplete";
import { useJsApiLoader } from "@react-google-maps/api";

const steps = ["Account Info", "Shipping Info", "Payment Info"];
// Centralized Google Maps loader: load once here to avoid duplicate element warnings
const GOOGLE_LIBRARIES = [
  "places",
] as unknown as google.maps.plugins.loader.Library[];

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isTrial = searchParams.get("trial") === "true";

  const { isLoaded } = useJsApiLoader({
    id: "google-maps-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_API_KEY as string,
    libraries: GOOGLE_LIBRARIES as any,
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
    shipping_address: "",
    shipping_city: "",
    shipping_zip: "",
    shipping_country: "",
    shipping_state: "",
    full_shipping_address: "",
    card_number: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
    if (step === 0) {
      if (!formData.fullName || !formData.email) {
        setError("Please fill in required fields");
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
      await persistPartial({
        shipping_address: formData.shipping_address,
        shipping_city: formData.shipping_city,
        shipping_state: formData.shipping_state,
        shipping_zip: formData.shipping_zip,
        shipping_country: formData.shipping_country,
        full_shipping_address: formData.full_shipping_address,
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
        // Persist payment last4 (without storing the full card)
        await persistPartial({ card_number: formData.card_number });

        // 1) Create SUMIT payment (no charge until trial end can be handled by your org later)
        const customer = {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          country: formData.shipping_country || "IL",
          address: formData.shipping_address,
          city: formData.shipping_city,
          zipCode: formData.shipping_zip,
        };
        const items = [
          {
            description: "Spectra Free Trial Setup",
            quantity: 1,
            price: 0,
            currency: "ILS",
          },
        ];
        await fetch("/.netlify/functions/sumit-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer,
            items,
            redirectUrl: window.location.origin + "/signup/success",
            includeVAT: true,
          }),
        }).catch(() => {});

        // 2) Submit lead for follow-up
        const payload = {
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          message: formData.instagram
            ? `Instagram: ${formData.instagram}`
            : undefined,
          source_page: "/signup?trial=true",
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-spectra-cream via-white to-spectra-cream-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8">
        {/* Stepper */}
        <div className="flex items-center justify-center gap-4 text-sm">
          {steps.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center ${i <= step ? "bg-spectra-gold text-white" : "bg-gray-200 text-gray-600"}`}
              >
                {i + 1}
              </div>
              <span
                className={`hidden sm:block ${i === step ? "text-spectra-charcoal font-medium" : "text-gray-500"}`}
              >
                {label}
              </span>
              {i < steps.length - 1 && (
                <div className="w-10 sm:w-16 h-px bg-gray-300" />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-spectra-gold/20">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {step === 0 && (
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium text-spectra-charcoal"
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
                    className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-spectra-gold focus:border-spectra-gold"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-spectra-charcoal"
                  >
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-spectra-gold focus:border-spectra-gold"
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-spectra-charcoal"
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
                    className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-spectra-gold focus:border-spectra-gold"
                    placeholder="Enter your email address"
                  />
                </div>
                <div>
                  <label
                    htmlFor="instagram"
                    className="block text-sm font-medium text-spectra-charcoal"
                  >
                    Instagram Page
                  </label>
                  <input
                    id="instagram"
                    name="instagram"
                    type="text"
                    value={formData.instagram}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-spectra-gold focus:border-spectra-gold"
                    placeholder="@your_instagram or profile URL"
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-spectra-charcoal">
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
                    className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-spectra-gold focus:border-spectra-gold"
                    placeholder="City"
                  />
                  <input
                    id="shipping_state"
                    name="shipping_state"
                    type="text"
                    value={formData.shipping_state}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-spectra-gold focus:border-spectra-gold"
                    placeholder="State / Region"
                  />
                  <input
                    id="shipping_zip"
                    name="shipping_zip"
                    type="text"
                    value={formData.shipping_zip}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-spectra-gold focus:border-spectra-gold"
                    placeholder="ZIP / Postal code"
                  />
                  <input
                    id="shipping_country"
                    name="shipping_country"
                    type="text"
                    value={formData.shipping_country}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-spectra-gold focus:border-spectra-gold"
                    placeholder="Country"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="card_number"
                    className="block text-sm font-medium text-spectra-charcoal"
                  >
                    Payment (card number, no charge)
                  </label>
                  <input
                    id="card_number"
                    name="card_number"
                    type="text"
                    value={formData.card_number}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-spectra-gold focus:border-spectra-gold"
                    placeholder="1234 5678 9012 3456"
                  />
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
                className="px-5 py-3 disabled:opacity-50"
              >
                Back
              </Button>
              {step < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={loading}
                  className="px-6 py-3"
                >
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={loading} className="px-6 py-3">
                  {isTrial ? "Start My Free Trial" : "Create Account"}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
