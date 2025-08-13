import React, { useState, useEffect } from "react";
import {
  createSmartPayment,
  getLocalizedPrice,
  getCurrencyRates,
  SumitCustomer,
  SumitPaymentItem,
} from "../../api/payments";

const PaymentsPage: React.FC = () => {
  const [customerData, setCustomerData] = useState<SumitCustomer>({
    name: "John Doe",
    email: "john@example.com",
    phone: "+972-50-1234567",
    country: "IL",
    address: "Tel Aviv Street 123",
    city: "Tel Aviv",
    zipCode: "12345",
  });

  const [selectedCountry, setSelectedCountry] = useState("IL");
  const [localizedPrices, setLocalizedPrices] = useState<any>({});
  const [currencyRates, setCurrencyRates] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  // Demo products for Spectra
  const demoItems: SumitPaymentItem[] = [
    {
      description: "Spectra Premium Plan - Monthly",
      quantity: 1,
      price: 99, // Base price in USD
      currency: "USD",
    },
    {
      description: "AI Color Analysis Add-on",
      quantity: 1,
      price: 29, // Base price in USD
      currency: "USD",
    },
  ];

  // Countries for testing
  const countries = [
    { code: "IL", name: "Israel 🇮🇱", flag: "🇮🇱" },
    { code: "US", name: "United States 🇺🇸", flag: "🇺🇸" },
    { code: "CA", name: "Canada 🇨🇦", flag: "🇨🇦" },
    { code: "GB", name: "United Kingdom 🇬🇧", flag: "🇬🇧" },
    { code: "DE", name: "Germany 🇩🇪", flag: "🇩🇪" },
    { code: "FR", name: "France 🇫🇷", flag: "🇫🇷" },
  ];

  // Load currency rates and localized prices
  useEffect(() => {
    const loadPrices = async () => {
      try {
        const rates = await getCurrencyRates();
        setCurrencyRates(rates);

        const prices: any = {};
        for (const country of countries) {
          const totalPrice = demoItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0,
          );
          prices[country.code] = await getLocalizedPrice(
            totalPrice,
            "USD",
            country.code,
          );
        }
        setLocalizedPrices(prices);
      } catch (error) {
        console.error("Error loading prices:", error);
      }
    };

    loadPrices();
  }, []);

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);
    setCustomerData((prev) => ({ ...prev, country: countryCode }));
  };

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/payment-success`;
      const result = await createSmartPayment(
        customerData,
        demoItems,
        redirectUrl,
      );

      console.log("Payment created:", result);
      alert(
        "🧪 Test Mode: Payment would be processed here!\nCheck console for details.",
      );
    } catch (error) {
      console.error("Payment error:", error);
      alert(
        `❌ Payment failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentPrice = () => {
    return (
      localizedPrices[selectedCountry] || {
        price: 128,
        currency: "USD",
        symbol: "$",
      }
    );
  };

  const getVATInfo = () => {
    if (selectedCountry === "IL") return "+ 17% VAT";
    if (selectedCountry === "GB") return "+ 20% VAT";
    if (
      ["DE", "FR", "IT", "ES", "NL", "BE", "AT", "PT", "IE", "FI"].includes(
        selectedCountry,
      )
    ) {
      return "+ VAT";
    }
    return "No VAT";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4">
            🧪 Payments System Test
          </h1>
          <p className="text-blue-200 text-lg">
            SUMIT Integration • Multi-Currency • VAT Support
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Country Selector */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              🌍 Select Country
            </h2>
            <div className="space-y-3">
              {countries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => handleCountryChange(country.code)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    selectedCountry === country.code
                      ? "border-blue-400 bg-blue-500/20 text-white"
                      : "border-white/20 bg-white/5 text-blue-200 hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{country.name}</span>
                    {selectedCountry === country.code && (
                      <span className="text-blue-400">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Pricing & Details */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              💰 Pricing
            </h2>

            {/* Product List */}
            <div className="space-y-4 mb-6">
              {demoItems.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center text-blue-200"
                >
                  <div>
                    <div className="font-medium">{item.description}</div>
                    <div className="text-sm opacity-75">
                      Qty: {item.quantity}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-white">
                      {getCurrentPrice().symbol}
                      {(
                        item.price *
                        item.quantity *
                        (getCurrentPrice().price / 128)
                      ).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t border-white/20 pt-4">
              <div className="flex justify-between items-center text-white font-bold text-xl">
                <span>Total:</span>
                <span>
                  {getCurrentPrice().symbol}
                  {getCurrentPrice().price}
                </span>
              </div>
              <div className="text-sm text-blue-300 text-right mt-1">
                {getVATInfo()}
              </div>
            </div>

            {/* Currency Rates */}
            {Object.keys(currencyRates).length > 0 && (
              <div className="mt-6 p-4 bg-black/20 rounded-lg">
                <div className="text-xs text-blue-300 mb-2">
                  Live Exchange Rates (USD):
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-blue-200">
                  <div>CAD: {currencyRates.USD_TO_CAD?.toFixed(3)}</div>
                  <div>EUR: {currencyRates.USD_TO_EUR?.toFixed(3)}</div>
                  <div>GBP: {currencyRates.USD_TO_GBP?.toFixed(3)}</div>
                  <div>ILS: {currencyRates.USD_TO_ILS?.toFixed(3)}</div>
                </div>
              </div>
            )}
          </div>

          {/* Customer Info & Payment */}
          <div className="space-y-6">
            {/* Customer Details */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                👤 Customer Details
              </h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={customerData.name}
                  onChange={(e) =>
                    setCustomerData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={customerData.email}
                  onChange={(e) =>
                    setCustomerData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={customerData.phone}
                  onChange={(e) =>
                    setCustomerData((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300"
                />
              </div>
            </div>

            {/* Payment Button */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <button
                onClick={handlePayment}
                disabled={isLoading}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
                  isLoading
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 shadow-lg hover:shadow-xl"
                } text-white`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating Payment...
                  </div>
                ) : (
                  `Pay ${getCurrentPrice().symbol}${getCurrentPrice().price}`
                )}
              </button>

              <div className="mt-4 text-xs text-blue-300 text-center">
                ⚠️ Test Mode - No real payment will be processed
              </div>
            </div>
          </div>
        </div>

        {/* Debug Panel */}
        <div className="mt-12 bg-black/30 rounded-xl p-6">
          <details className="text-white">
            <summary className="cursor-pointer font-semibold mb-4 text-lg">
              🔧 Technical Debug Info
            </summary>
            <div className="grid lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Customer Data:</h4>
                <pre className="text-xs overflow-auto bg-black/50 p-3 rounded">
                  {JSON.stringify(customerData, null, 2)}
                </pre>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Currency Rates:</h4>
                <pre className="text-xs overflow-auto bg-black/50 p-3 rounded">
                  {JSON.stringify(currencyRates, null, 2)}
                </pre>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Localized Prices:</h4>
              <pre className="text-xs overflow-auto bg-black/50 p-3 rounded">
                {JSON.stringify(localizedPrices, null, 2)}
              </pre>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;
