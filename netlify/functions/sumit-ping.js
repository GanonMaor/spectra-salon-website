const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

exports.handler = async () => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Content-Type": "application/json",
  };

  const SUMIT_API_URL =
    process.env.SUMIT_API_URL || process.env.VITE_SUMIT_API_URL || "https://api.sumit.co.il";

  const API_KEY =
    process.env.SUMIT_API_KEY ||
    process.env.SUMIT_SECRET_KEY ||
    process.env.VITE_SUMIT_API_KEY ||
    process.env.SUMIT_PRIVATE_KEY;

  const ORG_ID =
    process.env.SUMIT_ORG_ID ||
    process.env.SUMIT_ORGANIZATION_ID ||
    process.env.SUMIT_MERCHANT_ID ||
    process.env.VITE_SUMIT_ORGANIZATION_ID ||
    process.env.VITE_SUMIT_MERCHANT_ID;

  const missing = [];
  if (!API_KEY) missing.push("SUMIT_API_KEY / SUMIT_SECRET_KEY");
  if (!ORG_ID) missing.push("SUMIT_ORG_ID / SUMIT_ORGANIZATION_ID / SUMIT_MERCHANT_ID");

  if (missing.length) {
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: "Missing env", missing }) };
  }

  const url = `${SUMIT_API_URL.replace(/\/$/, "")}/api/${ORG_ID}/ping`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
    });
    const text = await res.text();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: res.ok, status: res.status, url, response: tryParseJSON(text) }),
    };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, url, error: err.message }) };
  }
};

function tryParseJSON(text) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}


