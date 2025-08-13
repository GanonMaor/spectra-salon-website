// Temporarily disable Stripe import for production build
// import { loadStripe } from '@stripe/stripe-js';

// const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string);

// Temporary mock for Stripe
const stripePromise = null;

export { stripePromise };

// Payment functions
export async function createPaymentIntent(amount: number, currency = "usd") {
  const response = await fetch("/api/payments/create-intent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount, currency }),
  });

  return response.json();
}

export async function processPayment(paymentMethodId: string, amount: number) {
  const response = await fetch("/api/payments/process", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ paymentMethodId, amount }),
  });

  return response.json();
}

// SUMIT Payment Integration for Israeli Market
const SUMIT_API_URL =
  import.meta.env.VITE_SUMIT_API_URL || "https://api.sumit.co.il";
const API_KEY = import.meta.env.VITE_SUMIT_API_KEY;
const ORGANIZATION_ID = import.meta.env.VITE_SUMIT_ORGANIZATION_ID;

// Types for SUMIT API
export interface SumitCustomer {
  name: string;
  email: string;
  phone?: string;
  country: string;
  address?: string;
  city?: string;
  zipCode?: string;
}

export interface SumitPaymentItem {
  description: string;
  quantity: number;
  price: number;
  currency: "ILS" | "USD" | "CAD" | "EUR" | "GBP";
}

interface SumitPaymentRequest {
  customer: SumitCustomer;
  items: SumitPaymentItem[];
  redirectUrl: string;
  webhookUrl?: string;
  includeVAT: boolean;
}

// Currency conversion rates
const CURRENCY_RATES = {
  USD_TO_CAD: 1.35,
  USD_TO_EUR: 0.92,
  USD_TO_GBP: 0.79,
  ILS_TO_USD: 0.27,
  ILS_TO_CAD: 0.36,
  ILS_TO_EUR: 0.25,
  ILS_TO_GBP: 0.21,
};

// Get live currency rates
export async function getCurrencyRates() {
  try {
    const response = await fetch(
      "https://api.exchangerate-api.com/v4/latest/USD",
    );
    const data = await response.json();
    return {
      USD_TO_CAD: data.rates.CAD,
      USD_TO_EUR: data.rates.EUR,
      USD_TO_GBP: data.rates.GBP,
      USD_TO_ILS: data.rates.ILS,
    };
  } catch (error) {
    console.warn("Failed to fetch live rates, using fallback rates");
    return CURRENCY_RATES;
  }
}

// Convert price between currencies
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: any = CURRENCY_RATES,
): number {
  if (fromCurrency === toCurrency) return amount;

  // Convert to USD first, then to target currency
  let usdAmount = amount;

  if (fromCurrency === "ILS") {
    usdAmount = amount * rates.ILS_TO_USD;
  } else if (fromCurrency === "CAD") {
    usdAmount = amount / rates.USD_TO_CAD;
  } else if (fromCurrency === "EUR") {
    usdAmount = amount / rates.USD_TO_EUR;
  } else if (fromCurrency === "GBP") {
    usdAmount = amount / rates.USD_TO_GBP;
  }

  // Convert from USD to target currency
  if (toCurrency === "ILS") {
    return usdAmount / rates.ILS_TO_USD;
  } else if (toCurrency === "CAD") {
    return usdAmount * rates.USD_TO_CAD;
  } else if (toCurrency === "EUR") {
    return usdAmount * rates.USD_TO_EUR;
  } else if (toCurrency === "GBP") {
    return usdAmount * rates.USD_TO_GBP;
  }

  return usdAmount; // Return USD if no conversion needed
}

// Core SUMIT API integration
async function createSumitPayment(paymentRequest: SumitPaymentRequest) {
  const response = await fetch(`${SUMIT_API_URL}/api/credit-card/charge`, {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
      "X-Organization-Id": ORGANIZATION_ID ?? "",
    }),
    body: JSON.stringify(paymentRequest),
  });

  if (!response.ok) {
    throw new Error(`SUMIT API Error: ${response.statusText}`);
  }

  return response.json();
}

// Create payment for Israeli customers (ILS + VAT)
export async function createIsraeliPayment(
  customer: SumitCustomer,
  items: SumitPaymentItem[],
  redirectUrl: string,
) {
  const paymentRequest: SumitPaymentRequest = {
    customer: { ...customer, country: "IL" },
    items: items.map((item) => ({ ...item, currency: "ILS" })),
    redirectUrl,
    includeVAT: true,
  };

  return createSumitPayment(paymentRequest);
}

// Create payment for international customers (USD, no VAT)
export async function createInternationalPayment(
  customer: SumitCustomer,
  items: SumitPaymentItem[],
  redirectUrl: string,
) {
  const paymentRequest: SumitPaymentRequest = {
    customer,
    items: items.map((item) => ({ ...item, currency: "USD" })),
    redirectUrl,
    includeVAT: false,
  };

  return createSumitPayment(paymentRequest);
}

// Create payment for Canadian customers (CAD, no VAT)
export async function createCanadianPayment(
  customer: SumitCustomer,
  items: SumitPaymentItem[],
  redirectUrl: string,
) {
  const rates = await getCurrencyRates();
  const paymentRequest: SumitPaymentRequest = {
    customer: { ...customer, country: "CA" },
    items: items.map((item) => ({
      ...item,
      currency: "CAD",
      price: convertCurrency(item.price, "USD", "CAD", rates),
    })),
    redirectUrl,
    includeVAT: false,
  };

  return createSumitPayment(paymentRequest);
}

// Create payment for European customers (EUR, includes VAT if EU)
export async function createEuropeanPayment(
  customer: SumitCustomer,
  items: SumitPaymentItem[],
  redirectUrl: string,
) {
  const rates = await getCurrencyRates();
  const euCountries = [
    "DE",
    "FR",
    "IT",
    "ES",
    "NL",
    "BE",
    "AT",
    "PT",
    "IE",
    "FI",
    "LU",
    "EE",
    "LV",
    "LT",
    "SK",
    "SI",
    "CY",
    "MT",
  ];
  const includeVAT = euCountries.includes(customer.country);

  const paymentRequest: SumitPaymentRequest = {
    customer,
    items: items.map((item) => ({
      ...item,
      currency: "EUR",
      price: convertCurrency(item.price, "USD", "EUR", rates),
    })),
    redirectUrl,
    includeVAT,
  };

  return createSumitPayment(paymentRequest);
}

// Create payment for UK customers (GBP, includes VAT)
export async function createBritishPayment(
  customer: SumitCustomer,
  items: SumitPaymentItem[],
  redirectUrl: string,
) {
  const rates = await getCurrencyRates();
  const paymentRequest: SumitPaymentRequest = {
    customer: { ...customer, country: "GB" },
    items: items.map((item) => ({
      ...item,
      currency: "GBP",
      price: convertCurrency(item.price, "USD", "GBP", rates),
    })),
    redirectUrl,
    includeVAT: true, // UK VAT
  };

  return createSumitPayment(paymentRequest);
}

// Smart payment function - automatically detects customer location and currency
export async function createSmartPayment(
  customer: SumitCustomer,
  items: SumitPaymentItem[],
  redirectUrl: string,
) {
  const country = customer.country;

  switch (country) {
    case "IL":
      return createIsraeliPayment(customer, items, redirectUrl);
    case "CA":
      return createCanadianPayment(customer, items, redirectUrl);
    case "GB":
      return createBritishPayment(customer, items, redirectUrl);
    case "DE":
    case "FR":
    case "IT":
    case "ES":
    case "NL":
    case "BE":
    case "AT":
    case "PT":
    case "IE":
    case "FI":
    case "LU":
    case "EE":
    case "LV":
    case "LT":
    case "SK":
    case "SI":
    case "CY":
    case "MT":
      return createEuropeanPayment(customer, items, redirectUrl);
    default:
      return createInternationalPayment(customer, items, redirectUrl);
  }
}

// Generate invoice after successful payment
export async function generateInvoice(
  transactionId: string,
  customer: SumitCustomer,
) {
  const response = await fetch(`${SUMIT_API_URL}/api/invoices/generate`, {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
      "X-Organization-Id": ORGANIZATION_ID ?? "",
    }),
    body: JSON.stringify({
      transactionId,
      customer,
      sendByEmail: true,
    }),
  });

  return response.json();
}

// Webhook handler for payment confirmations
export async function handleSumitWebhook(webhookData: any) {
  const { transactionId, status, customer } = webhookData;

  if (status === "completed") {
    await generateInvoice(transactionId, customer);
  }

  return { success: true };
}

// Get display price in customer's local currency
export async function getLocalizedPrice(
  basePrice: number,
  baseCurrency: string,
  customerCountry: string,
): Promise<{ price: number; currency: string; symbol: string }> {
  const rates = await getCurrencyRates();

  const currencyMap: { [key: string]: { currency: string; symbol: string } } = {
    IL: { currency: "ILS", symbol: "₪" },
    CA: { currency: "CAD", symbol: "C$" },
    GB: { currency: "GBP", symbol: "£" },
    US: { currency: "USD", symbol: "$" },
    DE: { currency: "EUR", symbol: "€" },
    FR: { currency: "EUR", symbol: "€" },
    IT: { currency: "EUR", symbol: "€" },
    ES: { currency: "EUR", symbol: "€" },
    NL: { currency: "EUR", symbol: "€" },
    BE: { currency: "EUR", symbol: "€" },
    AT: { currency: "EUR", symbol: "€" },
    PT: { currency: "EUR", symbol: "€" },
    IE: { currency: "EUR", symbol: "€" },
    FI: { currency: "EUR", symbol: "€" },
  };

  const target = currencyMap[customerCountry] || {
    currency: "USD",
    symbol: "$",
  };
  const convertedPrice = convertCurrency(
    basePrice,
    baseCurrency,
    target.currency,
    rates,
  );

  return {
    price: Math.round(convertedPrice * 100) / 100,
    currency: target.currency,
    symbol: target.symbol,
  };
}
