/**
 * netlify/functions/_salon-context.js
 * ─────────────────────────────────────────────────────────────────────────
 * Single source of truth for resolving the authenticated salon context for
 * salon-runtime APIs.
 *
 * Security contract (Phase 4 of the catalog/inventory plan):
 *   * salon_id MUST come from a verified server-side session, NEVER from
 *     client-supplied input such as an `x-salon-id` header or request body.
 *   * Runtime endpoints call resolveSalonContext(event) and use the returned
 *     salonId for every query. They must not read salon_id from the client.
 *
 * Session token format (compact, dependency-free HMAC):
 *   base64url(payloadJson) + "." + base64url(HMAC_SHA256(payloadJson, secret))
 *   payload = { salonId, userId, exp }  // exp = unix seconds
 *
 * A future login endpoint issues these tokens with signSalonSession().
 *
 * Development fallback:
 *   When SALON_SESSION_SECRET is not configured in local/dev only, the resolver
 *   falls back to DEV_DEFAULT_SALON_ID (or 'salon-look'). Production-like
 *   environments fail closed when the secret is missing.
 */
"use strict";

const crypto = require("crypto");

const DEV_DEFAULT_SALON_ID = process.env.DEV_DEFAULT_SALON_ID || "salon-look";

function isProductionLikeRuntime() {
  return process.env.NODE_ENV === "production" ||
    process.env.CONTEXT === "production" ||
    process.env.NETLIFY === "true";
}

class SalonAuthError extends Error {
  constructor(message, statusCode = 401) {
    super(message);
    this.name = "SalonAuthError";
    this.statusCode = statusCode;
  }
}

function base64url(input) {
  return Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode(input) {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((input.length + 3) % 4);
  return Buffer.from(padded, "base64").toString("utf8");
}

function sign(payloadJson, secret) {
  return base64url(crypto.createHmac("sha256", secret).update(payloadJson).digest());
}

/**
 * Issue a signed salon session token. Intended for a login endpoint.
 * @param {{ salonId: string, userId?: string, role?: string, ttlSeconds?: number }} opts
 */
function signSalonSession({ salonId, userId = null, role = null, ttlSeconds = 60 * 60 * 12 }) {
  const secret = process.env.SALON_SESSION_SECRET;
  if (!secret) throw new SalonAuthError("SALON_SESSION_SECRET is not configured", 500);
  if (!salonId) throw new SalonAuthError("salonId is required to sign a session", 400);
  const payloadJson = JSON.stringify({
    salonId,
    userId,
    role,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  });
  return `${base64url(payloadJson)}.${sign(payloadJson, secret)}`;
}

function extractBearer(event) {
  const headers = event.headers || {};
  const raw = headers.authorization || headers.Authorization || "";
  const match = /^Bearer\s+(.+)$/i.exec(raw.trim());
  return match ? match[1].trim() : null;
}

/**
 * Verify a signed salon session token and return its payload.
 * Throws SalonAuthError on any tampering, expiry, or bad signature.
 */
function verifySalonSession(token, secret) {
  const parts = token.split(".");
  if (parts.length !== 2) throw new SalonAuthError("Malformed session token");
  const [encodedPayload, providedSig] = parts;

  let payloadJson;
  try {
    payloadJson = base64urlDecode(encodedPayload);
  } catch {
    throw new SalonAuthError("Malformed session token");
  }

  const expectedSig = sign(payloadJson, secret);
  const a = Buffer.from(providedSig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    throw new SalonAuthError("Invalid session signature");
  }

  let payload;
  try {
    payload = JSON.parse(payloadJson);
  } catch {
    throw new SalonAuthError("Malformed session payload");
  }

  if (!payload.salonId) throw new SalonAuthError("Session missing salonId");
  if (payload.exp && Date.now() / 1000 > payload.exp) {
    throw new SalonAuthError("Session expired");
  }
  return payload;
}

/**
 * Resolve the authenticated salon context for a request.
 *
 * @param {object} event  Netlify function event
 * @returns {{ salonId: string, userId: string|null, source: 'session'|'dev-fallback' }}
 * @throws {SalonAuthError} when a secret is configured but no valid session is present
 */
function resolveSalonContext(event) {
  const secret = process.env.SALON_SESSION_SECRET;
  const token = extractBearer(event);

  if (secret) {
    if (!token) throw new SalonAuthError("Missing session token");
    const payload = verifySalonSession(token, secret);
    return {
      salonId: payload.salonId,
      userId: payload.userId || null,
      role: payload.role || null,
      source: "session",
    };
  }

  if (isProductionLikeRuntime()) {
    console.error("[salon-context] SALON_SESSION_SECRET is missing in production-like runtime; refusing CRM access.");
    throw new SalonAuthError("SALON_SESSION_SECRET is not configured", 500);
  }

  // No secret configured: local/dev mode. Never trust client-provided salon
  // ids; use the server-configured default salon only.
  console.warn(`[salon-context] Local dev fallback active: using ${DEV_DEFAULT_SALON_ID}. This is disabled in production.`);
  if (token) {
    // Best-effort decode for local convenience, but a missing secret means we
    // cannot verify — so we still ignore any client-claimed salonId.
  }
  return { salonId: DEV_DEFAULT_SALON_ID, userId: null, role: "owner", source: "dev-fallback" };
}

module.exports = {
  SalonAuthError,
  resolveSalonContext,
  signSalonSession,
  verifySalonSession,
  isProductionLikeRuntime,
  DEV_DEFAULT_SALON_ID,
};
