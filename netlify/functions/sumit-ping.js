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

  const base = SUMIT_API_URL.replace(/\/$/, "");
  const endpoints = [
    { url: `${base}/api/${ORG_ID}/version`, method: "GET" },
    { url: `${base}/api/${ORG_ID}`, method: "HEAD" },
    { url: `${base}/api/${ORG_ID}/ping`, method: "GET" },
  ];

  for (const ep of endpoints) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(ep.url, {
        method: ep.method,
        redirect: "manual",
        headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const bodyText = ep.method === "HEAD" ? "" : await res.text();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ok: res.ok,
          tried: endpoints.map((e) => ({ url: e.url, method: e.method })),
          hit: { url: ep.url, method: ep.method },
          status: res.status,
          location: res.headers?.get ? res.headers.get("location") : undefined,
          response: tryParseJSON(bodyText),
        }),
      };
    } catch (err) {
      // try next endpoint
    }
  }

  return {
    statusCode: 500,
    headers,
    body: JSON.stringify({ ok: false, error: "All endpoints failed or redirected" }),
  };
};

function tryParseJSON(text) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}


