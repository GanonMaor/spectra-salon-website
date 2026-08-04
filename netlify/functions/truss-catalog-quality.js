/**
 * Admin-only TRUSS catalog data-quality report export.
 *
 * GET /.netlify/functions/truss-catalog-quality?format=json|csv
 * Auth: X-Access-Code (same as other admin catalog tools)
 */

"use strict";

const fs = require("fs");
const path = require("path");

const ACCESS_CODE = String(process.env.USAGE_IMPORT_ACCESS_CODE || "").trim();

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, X-Access-Code",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

function readReport() {
  const candidates = [
    path.join(process.cwd(), "reports/truss-catalog/data-quality-report.json"),
    path.join(process.cwd(), "data-import/truss/reports/data-quality-report.json"),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, "utf8"));
  }
  return null;
}

function toCsv(report) {
  const rows = report.manual_review_products || [];
  const header = "id,trs_code,ean_barcode,reasons";
  const lines = rows.map((r) => {
    const reasons = (r.reasons || []).join("|").replace(/"/g, '""');
    return `${r.id || ""},${r.trs_code || ""},${r.ean_barcode || ""},"${reasons}"`;
  });
  return [header, ...lines].join("\n");
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS, body: "" };
  }
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const code = event.headers["x-access-code"] || event.headers["X-Access-Code"];
  if (!ACCESS_CODE || code !== ACCESS_CODE) {
    return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  const report = readReport();
  if (!report) {
    return {
      statusCode: 404,
      headers: CORS,
      body: JSON.stringify({ error: "TRUSS quality report not found. Run npm run truss:build first." }),
    };
  }

  const format = String((event.queryStringParameters || {}).format || "json").toLowerCase();
  if (format === "csv") {
    return {
      statusCode: 200,
      headers: {
        ...CORS,
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="truss-data-quality.csv"',
      },
      body: toCsv(report),
    };
  }

  return {
    statusCode: 200,
    headers: { ...CORS, "Content-Type": "application/json" },
    body: JSON.stringify(report),
  };
};
