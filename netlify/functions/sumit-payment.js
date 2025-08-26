const { Client } = require('pg');

// SUMIT Payment Integration
const SUMIT_API_URL = process.env.VITE_SUMIT_API_URL || "https://api.sumit.co.il";
const API_KEY = process.env.SUMIT_API_KEY;
const ORGANIZATION_ID = process.env.SUMIT_ORGANIZATION_ID;

// Currency conversion rates (fallback)
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
async function getCurrencyRates() {
  try {
    const response = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
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
function convertCurrency(amount, fromCurrency, toCurrency, rates = CURRENCY_RATES) {
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
async function createSumitPayment(paymentRequest) {
  const response = await fetch(`${SUMIT_API_URL}/api/credit-card/charge`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
      "X-Organization-Id": ORGANIZATION_ID || "",
    },
    body: JSON.stringify(paymentRequest),
  });

  if (!response.ok) {
    throw new Error(`SUMIT API Error: ${response.statusText}`);
  }

  return response.json();
}

// Get display price in customer's local currency
async function getLocalizedPrice(basePrice, baseCurrency, customerCountry) {
  const rates = await getCurrencyRates();

  const currencyMap = {
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

  const target = currencyMap[customerCountry] || { currency: "USD", symbol: "$" };
  const convertedPrice = convertCurrency(basePrice, baseCurrency, target.currency, rates);

  return {
    price: Math.round(convertedPrice * 100) / 100,
    currency: target.currency,
    symbol: target.symbol,
  };
}

// Smart payment function - automatically detects customer location and currency
async function createSmartPayment(customer, items, redirectUrl) {
  const country = customer.country;
  const rates = await getCurrencyRates();
  
  let paymentRequest = {
    customer,
    items,
    redirectUrl,
    includeVAT: false,
  };

  switch (country) {
    case "IL":
      paymentRequest = {
        ...paymentRequest,
        customer: { ...customer, country: "IL" },
        items: items.map((item) => ({ ...item, currency: "ILS" })),
        includeVAT: true,
      };
      break;
    case "CA":
      paymentRequest = {
        ...paymentRequest,
        customer: { ...customer, country: "CA" },
        items: items.map((item) => ({
          ...item,
          currency: "CAD",
          price: convertCurrency(item.price, "USD", "CAD", rates),
        })),
      };
      break;
    case "GB":
      paymentRequest = {
        ...paymentRequest,
        customer: { ...customer, country: "GB" },
        items: items.map((item) => ({
          ...item,
          currency: "GBP",
          price: convertCurrency(item.price, "USD", "GBP", rates),
        })),
        includeVAT: true,
      };
      break;
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
      paymentRequest = {
        ...paymentRequest,
        items: items.map((item) => ({
          ...item,
          currency: "EUR",
          price: convertCurrency(item.price, "USD", "EUR", rates),
        })),
        includeVAT: true,
      };
      break;
    default:
      paymentRequest = {
        ...paymentRequest,
        items: items.map((item) => ({ ...item, currency: "USD" })),
      };
  }

  return createSumitPayment(paymentRequest);
}

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { action, ...params } = JSON.parse(event.body || '{}');

    switch (action) {
      case 'getCurrencyRates':
        const rates = await getCurrencyRates();
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, data: rates }),
        };

      case 'getLocalizedPrice':
        const { basePrice, baseCurrency, customerCountry } = params;
        const localizedPrice = await getLocalizedPrice(basePrice, baseCurrency, customerCountry);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, data: localizedPrice }),
        };

      case 'createSmartPayment':
        const { customer, items, redirectUrl } = params;
        const paymentResult = await createSmartPayment(customer, items, redirectUrl);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, data: paymentResult }),
        };

      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid action' }),
        };
    }
  } catch (error) {
    console.error('SUMIT Payment Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};