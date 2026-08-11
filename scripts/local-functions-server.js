#!/usr/bin/env node
"use strict";

/**
 * Lightweight local Netlify Functions server for Vite CRM development.
 * Avoids `netlify dev` / `functions:serve` proxy hangs on this machine.
 *
 *   node scripts/local-functions-server.js
 *   # listens on http://127.0.0.1:9999
 *
 * Pair with:
 *   VITE_FUNCTIONS_PROXY=http://127.0.0.1:9999 npm run dev:vite
 */

const http = require("http");
const path = require("path");
const fs = require("fs");
const { pathToFileURL } = require("url");

const ROOT = path.resolve(__dirname, "..");
const FUNCTIONS_DIR = path.join(ROOT, "netlify/functions");
const PORT = Number(process.env.LOCAL_FUNCTIONS_PORT || 9999);
const HOST = process.env.LOCAL_FUNCTIONS_HOST || "127.0.0.1";

// Load env: .env then .env.local (local wins).
require("dotenv").config({ path: path.join(ROOT, ".env") });
require("dotenv").config({ path: path.join(ROOT, ".env.local"), override: true });

const {
  READONLY_ERROR_CODE,
  READONLY_MESSAGE,
  isCrmDevReadonly,
  isHttpMutationAllowed,
} = require(path.join(FUNCTIONS_DIR, "lib/crm-dev-readonly.js"));

function send(res, statusCode, body, headers = {}) {
  const payload = typeof body === "string" ? body : JSON.stringify(body ?? {});
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    ...headers,
  });
  res.end(payload);
}

function parseUrl(req) {
  return new URL(req.url || "/", `http://${HOST}:${PORT}`);
}

function collectBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

/** Rewrite legacy/short CRM paths onto the salon-products function. */
function normalizeFunctionsPath(pathname) {
  const prefix = "/.netlify/functions";
  if (!pathname.startsWith(prefix)) return pathname;
  const rest = pathname.slice(prefix.length); // e.g. /brands/enabled
  if (
    rest === "/brands"
    || rest.startsWith("/brands/")
    || rest === "/product-lines"
    || rest.startsWith("/product-lines/")
    || rest === "/products"
    || rest.startsWith("/products/")
    || rest === "/inventory"
    || rest.startsWith("/inventory/")
    || rest === "/catalog-stock"
    || rest.startsWith("/catalog-stock/")
  ) {
    // Browser sometimes calls /.netlify/functions/brands/enabled — map to salon-products.
    return `${prefix}/salon-products${rest.replace(/^\/products/, "")}`;
  }
  return pathname;
}

function resolveFunctionName(pathname) {
  // Netlify supports nested paths on a function:
  //   /.netlify/functions/salon-products/brands/enabled
  //   /.netlify/functions/<name>/<subpath...>
  const m = pathname.match(/^\/\.netlify\/functions\/([A-Za-z0-9_-]+)(?:\/.*)?\/?$/)
    || pathname.match(/^\/([A-Za-z0-9_-]+)(?:\/.*)?\/?$/);
  return m ? m[1] : null;
}

function loadHandler(name) {
  const candidates = [
    path.join(FUNCTIONS_DIR, `${name}.js`),
    path.join(FUNCTIONS_DIR, name, `${name}.js`),
    path.join(FUNCTIONS_DIR, name, "index.js"),
  ];
  const file = candidates.find((p) => fs.existsSync(p));
  if (!file) {
    const err = new Error(`Function not found: ${name}`);
    err.code = "NOT_FOUND";
    throw err;
  }
  // Bust require cache so edits are picked up during local CRM work.
  delete require.cache[require.resolve(file)];
  const mod = require(file);
  if (typeof mod.handler !== "function") {
    throw new Error(`Function ${name} has no exports.handler`);
  }
  return mod.handler;
}

async function toNetlifyEvent(req, url, body) {
  const headers = {};
  for (const [k, v] of Object.entries(req.headers)) {
    if (v == null) continue;
    headers[k.toLowerCase()] = Array.isArray(v) ? v.join(",") : String(v);
  }
  const queryStringParameters = {};
  for (const [k, v] of url.searchParams.entries()) queryStringParameters[k] = v;

  return {
    rawUrl: url.toString(),
    rawQuery: url.search.replace(/^\?/, ""),
    path: url.pathname,
    httpMethod: req.method || "GET",
    headers,
    multiValueHeaders: {},
    queryStringParameters,
    multiValueQueryStringParameters: {},
    body: body || null,
    isBase64Encoded: false,
  };
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "OPTIONS") {
      send(res, 204, "");
      return;
    }

    const url = parseUrl(req);
    if (url.pathname === "/" || url.pathname === "/health") {
      send(res, 200, {
        ok: true,
        service: "local-functions-server",
        readonly: isCrmDevReadonly(),
        db: (process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || "")
          .match(/@([^/]+)/)?.[1] || null,
      });
      return;
    }

    const normalizedPath = normalizeFunctionsPath(url.pathname);
    if (normalizedPath !== url.pathname) {
      url.pathname = normalizedPath;
    }

    const name = resolveFunctionName(url.pathname);
    if (!name) {
      send(res, 404, { ok: false, error: { code: "NOT_FOUND", message: `Not found: ${url.pathname}` } });
      return;
    }

    // Primary read-only protection: refuse mutating requests before the
    // handler (and therefore the database) is ever reached.
    if (isCrmDevReadonly() && !isHttpMutationAllowed(name, req.method)) {
      console.warn(`[local-functions] blocked ${req.method} ${url.pathname} (${READONLY_ERROR_CODE})`);
      send(res, 403, {
        ok: false,
        error: {
          code: READONLY_ERROR_CODE,
          message: READONLY_MESSAGE,
          details: { function: name, method: req.method },
        },
      });
      return;
    }

    const body = ["POST", "PUT", "PATCH", "DELETE"].includes(req.method || "")
      ? await collectBody(req)
      : "";
    const handler = loadHandler(name);
    const event = await toNetlifyEvent(req, url, body);
    const result = await handler(event, { callbackWaitsForEmptyEventLoop: false });

    const statusCode = Number(result?.statusCode) || 200;
    const headers = { ...(result?.headers || {}) };
    // Strip hop-by-hop / conflicting headers
    delete headers["content-length"];
    const responseBody = result?.isBase64Encoded
      ? Buffer.from(result.body || "", "base64")
      : (result?.body ?? "");
    res.writeHead(statusCode, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      ...headers,
    });
    res.end(responseBody);
  } catch (err) {
    const status = err.code === "NOT_FOUND" ? 404 : 500;
    console.error(`[local-functions] ${req.method} ${req.url}:`, err.message);
    send(res, status, {
      ok: false,
      error: { code: status === 404 ? "NOT_FOUND" : "LOCAL_FUNCTION_ERROR", message: err.message },
    });
  }
});

server.listen(PORT, HOST, () => {
  const dbHost = (process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || "")
    .match(/@([^/]+)/)?.[1] || "(no db)";
  console.log(`[local-functions] http://${HOST}:${PORT}`);
  console.log(`[local-functions] db=${dbHost}`);
  console.log(`[local-functions] dir=${FUNCTIONS_DIR}`);
  if (isCrmDevReadonly()) {
    console.log("[local-functions] CRM_DEV_READONLY=on — reads allowed, mutations rejected with 403");
  } else {
    console.warn("[local-functions] CRM_DEV_READONLY=off — local mutations WILL write to the configured database");
  }
});
