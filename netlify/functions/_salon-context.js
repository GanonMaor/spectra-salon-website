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
const {
  PermissionError,
  resolvePermissions,
  requirePermission,
} = require("./lib/access-permissions");
// Pure (pg-free) session-invalidation predicate. Safe to require here: it only
// pulls in crypto + the phone normalizer, so _salon-context stays free of `pg`.
const { isSessionActiveForMembership } = require("./lib/salon-invitations");

const DEV_DEFAULT_SALON_ID = process.env.DEV_DEFAULT_SALON_ID || "salon-look";

function isProductionLikeRuntime() {
  return process.env.NODE_ENV === "production" ||
    process.env.CONTEXT === "production" ||
    process.env.NETLIFY === "true";
}

class SalonAuthError extends Error {
  constructor(message, statusCode = 401, code = "UNAUTHORIZED") {
    super(message);
    this.name = "SalonAuthError";
    this.statusCode = statusCode;
    this.code = code;
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
 * @param {{
 *   salonId: string,
 *   userId?: string,
 *   role?: string,
 *   accessRoleId?: string,
 *   grants?: string[],
 *   ttlSeconds?: number,
 * }} opts
 */
function signSalonSession({
  salonId,
  userId = null,
  role = null,
  accessRoleId = null,
  grants = null,
  ttlSeconds = 60 * 60 * 12,
}) {
  const secret = process.env.SALON_SESSION_SECRET;
  if (!secret) throw new SalonAuthError("SALON_SESSION_SECRET is not configured", 500);
  if (!salonId) throw new SalonAuthError("salonId is required to sign a session", 400);
  // `iat` (issued-at, unix seconds) is the anchor for stateless session
  // invalidation: suspending/revoking access records a `sessions_valid_after`
  // cutoff and any token whose `iat` predates it is rejected (see
  // lib/salon-invitations.isSessionActiveForMembership).
  const payloadJson = JSON.stringify({
    salonId,
    userId,
    role,
    // These are a compatibility/performance hint for the request resolver.
    // Protected endpoints refresh them from the membership/access_roles rows
    // before an RBAC decision, so a role change takes effect immediately.
    accessRoleId,
    grants: Array.isArray(grants) ? grants : null,
    iat: Math.floor(Date.now() / 1000),
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
      accessRoleId: payload.accessRoleId || null,
      grants: Array.isArray(payload.grants) ? payload.grants : null,
      iat: payload.iat || null,
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
  return { salonId: DEV_DEFAULT_SALON_ID, userId: null, role: "owner", iat: Math.floor(Date.now() / 1000), source: "dev-fallback" };
}

/**
 * Resolve the RBAC permission set for an already-resolved salon context.
 * Enforcement uses the session role (deny-by-default for unknown roles). The
 * dev-fallback context resolves as an owner so local development keeps full
 * access; production sessions carry a real role in the signed token.
 *
 * @param {{ role?: string|null, accessRoleId?: string|null }} salonCtx
 */
function resolveContextPermissions(salonCtx) {
  return resolvePermissions({
    role: salonCtx ? salonCtx.role : null,
    accessRoleId: salonCtx ? salonCtx.accessRoleId : null,
    grants: Array.isArray(salonCtx?.grants) ? salonCtx.grants : undefined,
  });
}

/**
 * Enforce a `domain.action@scope` permission for a resolved salon context.
 * Throws PermissionError(403) when the context's role does not grant it.
 */
function requireContextPermission(salonCtx, domain, action, requiredScope = "salon") {
  if (salonCtx?.accessRoleResolutionError) {
    throw new PermissionError(
      "ACCESS_ROLE_UNRESOLVED",
      "Your assigned access role is unavailable. Contact a salon owner.",
      403,
    );
  }
  return requirePermission(resolveContextPermissions(salonCtx), domain, action, requiredScope);
}

/**
 * Enforce stateless session revocation/status for a resolved session context.
 *
 * A signed token proves the session was minted at some point, but suspending or
 * revoking a membership (or bumping its `sessions_valid_after` cutoff) must
 * immediately invalidate previously-issued tokens WITHOUT a server-side session
 * store. This helper closes that gap on protected endpoints: after the caller
 * has a DB client, it looks up the membership backing the token and rejects the
 * request when the membership is suspended/revoked or the token predates the
 * cutoff.
 *
 * Safety / fail-closed posture:
 *   * Only session-sourced contexts are checked. The local dev-fallback context
 *     (no SALON_SESSION_SECRET) has no membership row and is intentionally
 *     skipped — production-like runtimes always have a real session.
 *   * A membership that is suspended/revoked, or a token whose `iat` predates
 *     `sessions_valid_after`, is rejected (401 SESSION_REVOKED).
 *   * When the lifecycle schema is not yet present (migration 042 not applied)
 *     the check cannot run and is skipped so the endpoint keeps working during a
 *     rollout; the HMAC signature + expiry still gate access.
 *
 * @param {{ query: Function }} client  connected pg client
 * @param {object} salonCtx             result of resolveSalonContext(event)
 * @throws {SalonAuthError} 401 SESSION_REVOKED when the session is no longer valid
 */
async function enforceSessionStatus(client, salonCtx) {
  if (!client || !salonCtx || salonCtx.source !== "session") return;
  // Without a user id we cannot resolve the backing membership. Tokens issued by
  // login/accept always carry userId; a legacy token without one is left to the
  // HMAC signature + expiry gate.
  if (!salonCtx.userId) return;

  let row;
  try {
    const result = await client.query(
      `SELECT
         COALESCE(sm.status, 'active') AS status,
         sm.sessions_valid_after,
         sm.access_role_id,
         ar.grants AS access_role_grants
       FROM salon_memberships sm
       LEFT JOIN access_roles ar
         ON ar.id = sm.access_role_id
        AND (ar.salon_id IS NULL OR ar.salon_id = sm.salon_id)
      WHERE sm.salon_id = $1 AND sm.user_id = $2
        LIMIT 1`,
      [salonCtx.salonId, salonCtx.userId],
    );
    row = result.rows[0];
  } catch (err) {
    // Pre-migration schema (missing table 42P01 / column 42703): cannot enforce
    // the cutoff yet. Do not block — signature + expiry remain in force.
    if (err && (err.code === "42P01" || err.code === "42703")) return;
    throw err;
  }

  // No membership row means there is nothing to revoke against (legacy/seed
  // data). The token is still HMAC-verified; broader coverage is handled where
  // memberships are provisioned.
  if (!row) return;

  // A database-backed role is authoritative whenever membership.access_role_id
  // is set. A dangling/out-of-tenant role reference must NEVER clear that
  // persisted source and fall back to a broader signed legacy role (especially
  // `owner`). Instead keep the id, install explicit empty grants (deny all),
  // and surface a safe configuration error to normal RBAC guards.
  if (row.access_role_id) {
    salonCtx.accessRoleId = row.access_role_id;
    if (Array.isArray(row.access_role_grants)) {
      salonCtx.grants = row.access_role_grants;
      salonCtx.accessRoleResolutionError = false;
    } else {
      salonCtx.grants = [];
      salonCtx.accessRoleResolutionError = true;
    }
  } else {
    salonCtx.accessRoleId = null;
    salonCtx.grants = null;
    salonCtx.accessRoleResolutionError = false;
  }

  const active = isSessionActiveForMembership({
    tokenIat: salonCtx.iat,
    sessionsValidAfter: row.sessions_valid_after,
    membershipStatus: row.status,
  });
  if (!active) {
    throw new SalonAuthError(
      "This session is no longer valid. Please sign in again.",
      401,
      "SESSION_REVOKED",
    );
  }
}

module.exports = {
  SalonAuthError,
  PermissionError,
  resolveSalonContext,
  resolvePermissions,
  requirePermission,
  resolveContextPermissions,
  requireContextPermission,
  enforceSessionStatus,
  signSalonSession,
  verifySalonSession,
  isProductionLikeRuntime,
  DEV_DEFAULT_SALON_ID,
};
