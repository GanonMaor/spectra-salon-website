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

  // Check for SUMIT token (secure) vs direct card data (legacy)
  if (!payload.singleUseToken && !payload.card) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Missing payment method: singleUseToken or card required" }),
    };
  }

  // Try multiple endpoints to accommodate account-specific routing
  const base = SUMIT_API_URL.replace(/\/$/, "");
  const endpoints = [
    `${base}/api/${ORG_ID}/checkout`,
    `${base}/api/credit-card/charge`,
  ];

  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      console.log('Attempting SUMIT API at:', url);
      const resp = await fetch(url, {
        method: "POST",
        redirect: "manual",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${API_KEY}`,
          "X-Organization-ID": ORG_ID,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const location = resp.headers?.get ? resp.headers.get("location") : undefined;
      const text = await resp.text().catch(() => "");
      const data = (() => { try { return JSON.parse(text); } catch { return text; } })();

      if (resp.status >= 300 && resp.status < 400) {
        // SUMIT sometimes redirects to help center when params/headers are off
        if (location && /sumit\.co\.il\/.+(payment|checkout)/i.test(location)) {
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ url, checkoutUrl: location, via: "redirect" }),
          };
        }
        return {
          statusCode: 502,
          headers,
          body: JSON.stringify({
            error: "SUMIT redirected",
            hint: "Check API_KEY/ORG_ID, endpoint enablement, and required fields",
            url,
            status: resp.status,
            location,
            response: data,
          }),
        };
      }

      if (!resp.ok) {
        console.error('❌ SUMIT API failed:', resp.status, data);
        return {
          statusCode: resp.status,
          headers,
          body: JSON.stringify({ url, error: data || resp.statusText }),
        };
      }

      console.log('✅ SUMIT API success:', resp.status);
      return { statusCode: 200, headers, body: JSON.stringify({ url, result: data }) };
    } catch (err) {
      // Try next endpoint
      console.error('❌ SUMIT API failed due to error:', err);
    }
  }

  return {
    statusCode: 500,
    headers,
    body: JSON.stringify({ error: "All SUMIT endpoints failed" }),
  };
};
