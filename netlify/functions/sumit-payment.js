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

  const SUMIT_API_URL = process.env.SUMIT_API_URL || "https://api.sumit.co.il";
  const API_KEY = process.env.SUMIT_API_KEY;
  const ORG_ID = process.env.SUMIT_ORG_ID || process.env.SUMIT_ORGANIZATION_ID;

  if (!API_KEY || !ORG_ID) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "SUMIT credentials missing" }),
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

  try {
    const resp = await fetch(`${SUMIT_API_URL}/api/credit-card/charge`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
        "X-Organization-Id": ORG_ID,
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
