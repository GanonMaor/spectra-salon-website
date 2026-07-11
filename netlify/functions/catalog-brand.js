"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "../..");
const CATALOG_DIR = path.join(ROOT, "data", "catalog-brands");

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Content-Type": "application/json",
};

function json(statusCode, body) {
  return { statusCode, headers: CORS, body: JSON.stringify(body) };
}

function slugFromEvent(event) {
  const raw = (event.path || "").replace("/.netlify/functions/catalog-brand", "");
  const slug = raw.replace(/^\/+/, "").replace(/\.json$/i, "");
  return /^[a-z0-9][a-z0-9-]*$/i.test(slug) ? slug.toLowerCase() : null;
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: CORS, body: "" };
  if (event.httpMethod !== "GET") return json(405, { error: "Method not allowed" });

  const slug = slugFromEvent(event);
  if (!slug) return json(400, { error: "Invalid catalog brand slug" });

  const filePath = path.join(CATALOG_DIR, `${slug}.json`);
  if (!filePath.startsWith(CATALOG_DIR + path.sep)) return json(400, { error: "Invalid catalog brand slug" });
  if (!fs.existsSync(filePath)) return json(404, { error: "Catalog brand not found" });

  try {
    return { statusCode: 200, headers: CORS, body: fs.readFileSync(filePath, "utf8") };
  } catch (error) {
    console.error("catalog-brand read failed:", error);
    return json(500, { error: "Failed to read catalog brand" });
  }
};
