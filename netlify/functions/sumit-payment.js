const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS")
    return { statusCode: 200, headers, body: "" };
  if (event.httpMethod !== "POST")
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };

  const SUMIT_API_URL =
    process.env.SUMIT_API_URL ||
    process.env.VITE_SUMIT_API_URL ||
    "https://api.sumit.co.il";

  // Accept multiple env naming conventions for robustness
  const API_KEY =
    process.env.SUMIT_API_KEY ||
    process.env.SUMIT_SECRET_KEY ||
    process.env.VITE_SUMIT_API_KEY ||
    process.env.SUMIT_PRIVATE_KEY; // last-resort legacy name

  const ORG_ID =
    process.env.SUMIT_ORG_ID ||
    process.env.SUMIT_ORGANIZATION_ID ||
    process.env.SUMIT_MERCHANT_ID ||
    process.env.VITE_SUMIT_ORGANIZATION_ID ||
    process.env.VITE_SUMIT_MERCHANT_ID;

  if (!API_KEY || !ORG_ID) {
    const missing = [];
    if (!API_KEY) missing.push("SUMIT_API_KEY (or SUMIT_SECRET_KEY)");
    if (!ORG_ID) missing.push("SUMIT_ORG_ID (or SUMIT_ORGANIZATION_ID / SUMIT_MERCHANT_ID)");
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "SUMIT credentials missing",
        missing,
      }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Invalid JSON" }),
    };
  }

  // Basic payload validation for clearer errors
  if (!payload.customer || !Array.isArray(payload.items) || payload.items.length === 0) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Missing required fields: customer, items[]" }),
    };
  }

  try {
    const resp = await fetch(`${SUMIT_API_URL}/api/credit-card/charge`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${API_KEY}`,
        "X-Organization-ID": ORG_ID,
      },
      body: JSON.stringify(payload),
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      return {
        statusCode: resp.status,
        headers,
        body: JSON.stringify({ error: data || resp.statusText }),
      };
    }
    return { statusCode: 200, headers, body: JSON.stringify(data) };
  } catch (err) {
    console.error("sumit-payment error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
