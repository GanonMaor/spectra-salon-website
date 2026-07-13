/**
 * netlify/functions/salon-login.js
 * ─────────────────────────────────────────────────────────────────────────
 * V1 salon user login endpoint.
 *
 * Current production-safe behavior:
 * - Password login is provisioned through server-side environment secrets.
 *   The browser sends only phone/email + password; salon membership is resolved
 *   from crm_users/salon_memberships and the issued token is signed server-side.
 * - Explicit @spectra.test login remains available for seeded runtime tests
 *   when SALON_TEST_LOGIN_PASSWORD or SALON_TEST_LOGIN_ENABLED is configured.
 * - Local/dev without SALON_SESSION_SECRET can still return a dev-fallback
 *   shape for the server-configured default salon, but production-like
 *   runtimes must have a real secret.
 *
 * Membership resolution contract (auth recovery):
 *   A login identity must map to exactly one active salon. When a user has
 *   multiple active memberships the endpoint uses the single default membership
 *   (is_default = true) as the product's explicit primary-salon mechanism.
 *   If there is no active membership, or the mapping is genuinely ambiguous
 *   (multiple active memberships with zero or more-than-one default), the
 *   endpoint stops and reports the ambiguity instead of silently guessing.
 */
"use strict";

const { DEV_DEFAULT_SALON_ID, isProductionLikeRuntime, signSalonSession } = require("./_salon-context");
const { createClient, hasDatabaseUrl } = require("./_db");
const {
  AuthResolutionError,
  normalizePhone,
  allowedLoginIdentifiers: parseAllowedLoginIdentifiers,
  isIdentifierAllowed,
  pickActiveMembership,
} = require("./lib/salon-login-helpers");
const DEFAULT_TEST_PASSWORD = "SpectraTest!2026";
const DEFAULT_TTL_SECONDS = 60 * 60 * 12;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function res(statusCode, data, isError = false) {
  return { statusCode, headers: CORS, body: JSON.stringify(isError ? { error: data } : data) };
}

function testLoginEnabled() {
  return Boolean(process.env.SALON_TEST_LOGIN_PASSWORD) ||
    process.env.SALON_TEST_LOGIN_ENABLED === "true" ||
    (process.env.NODE_ENV !== "production" && process.env.CONTEXT !== "production");
}

function timingSafeEqualText(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return require("crypto").timingSafeEqual(left, right);
}

async function getClient() {
  const client = createClient();
  await client.connect();
  return client;
}

const USER_LOOKUP_SQL = `
  SELECT id, email, phone, display_name
  FROM crm_users
  WHERE status = 'active'
    AND (
      LOWER(email) = LOWER($1)
      OR (
        $2 <> ''
        AND (
          regexp_replace(COALESCE(phone, ''), '[^0-9]', '', 'g') = $2
          OR regexp_replace(regexp_replace(COALESCE(phone, ''), '[^0-9]', '', 'g'), '^(00)?972|^0', '') = $2
        )
      )
    )`;

// All ACTIVE memberships for a user (not LIMIT 1): resolution/ambiguity is
// decided in JS by pickActiveMembership so multi-membership users are never
// silently routed to a random salon.
const MEMBERSHIP_LOOKUP_SQL = `
  SELECT sm.salon_id, sm.user_id, sm.role, sm.is_default, s.name AS salon_name
  FROM salon_memberships sm
  JOIN salons s ON s.id = sm.salon_id
  WHERE sm.user_id = $1
    AND s.status = 'active'
    AND sm.salon_id IS NOT NULL
    AND sm.role IS NOT NULL
  ORDER BY sm.is_default DESC, sm.created_at ASC`;

function buildSession(membership, { devMode, message }) {
  const exp = Math.floor(Date.now() / 1000) + DEFAULT_TTL_SECONDS;
  const token = signSalonSession({
    salonId: membership.salon_id,
    userId: membership.user_id,
    role: membership.role,
    ttlSeconds: DEFAULT_TTL_SECONDS,
  });
  return {
    token,
    salonId: membership.salon_id,
    salonName: membership.salon_name,
    userId: membership.user_id,
    role: membership.role,
    exp,
    devMode,
    message,
  };
}

async function tryTestLogin({ phoneOrEmail, password }) {
  if (!testLoginEnabled()) return null;
  if (!hasDatabaseUrl()) return null;
  const expectedPassword = process.env.SALON_TEST_LOGIN_PASSWORD || DEFAULT_TEST_PASSWORD;
  if (!timingSafeEqualText(password, expectedPassword)) return null;

  const client = await getClient();
  try {
    const identifier = phoneOrEmail.trim();
    const normalizedPhone = normalizePhone(identifier);
    const user = await client.query(
      `${USER_LOOKUP_SQL}
       AND email ILIKE '%@spectra.test'
       LIMIT 1`,
      [identifier, normalizedPhone],
    );
    if (user.rows.length === 0) return null;
    const u = user.rows[0];
    const memberships = await client.query(MEMBERSHIP_LOOKUP_SQL, [u.id]);
    const { membership, error } = pickActiveMembership(memberships.rows);
    if (error) throw error;
    return buildSession(membership, {
      devMode: process.env.CONTEXT !== "production",
      message: "Test salon login issued a signed session token.",
    });
  } finally {
    await client.end().catch(() => {});
  }
}

function passwordLoginSecret() {
  return process.env.SALON_LOGIN_PASSWORD || process.env.SALON_PROVISIONED_LOGIN_PASSWORD || null;
}

function allowedLoginIdentifiers() {
  return parseAllowedLoginIdentifiers(process.env.SALON_LOGIN_IDENTIFIERS);
}

async function tryProvisionedPasswordLogin({ phoneOrEmail, password }) {
  const expectedPassword = passwordLoginSecret();
  if (!expectedPassword || !hasDatabaseUrl()) return null;
  if (!timingSafeEqualText(password, expectedPassword)) return null;

  const identifier = phoneOrEmail.trim();
  const normalizedPhone = normalizePhone(identifier);
  if (!isIdentifierAllowed(identifier, normalizedPhone, allowedLoginIdentifiers())) return null;

  const client = await getClient();
  try {
    // NOTE: shared pilot password. Replace with invite/reset or per-user
    // password hashes before broader production rollout.
    const user = await client.query(`${USER_LOOKUP_SQL} LIMIT 1`, [identifier, normalizedPhone]);
    if (user.rows.length === 0) return null;
    const u = user.rows[0];
    const memberships = await client.query(MEMBERSHIP_LOOKUP_SQL, [u.id]);
    const { membership, error } = pickActiveMembership(memberships.rows);
    if (error) throw error;
    return buildSession(membership, {
      devMode: false,
      message: "Salon login issued a signed session token.",
    });
  } finally {
    await client.end().catch(() => {});
  }
}

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") return res(200, {});
  if (event.httpMethod !== "POST") return res(405, "Method not allowed", true);

  let body = {};
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    return res(400, "Invalid JSON body", true);
  }

  const phone = String(body.phone || "").trim();
  const password = String(body.password || "");
  if (!phone || !password) return res(400, "Phone and password are required", true);

  if (process.env.SALON_SESSION_SECRET) {
    try {
      const provisionedSession = await tryProvisionedPasswordLogin({ phoneOrEmail: phone, password });
      if (provisionedSession) return res(200, provisionedSession);

      const testSession = await tryTestLogin({ phoneOrEmail: phone, password });
      if (testSession) return res(200, testSession);
    } catch (err) {
      if (err instanceof AuthResolutionError) {
        return res(err.statusCode, { code: err.code, message: err.message });
      }
      throw err;
    }
  }

  if (!process.env.SALON_SESSION_SECRET) {
    if (isProductionLikeRuntime()) {
      return res(401, {
        code: "SALON_SESSION_SECRET_NOT_CONFIGURED",
        message: "SALON_SESSION_SECRET is required for production salon login.",
      });
    }

    return res(200, {
      token: null,
      salonId: DEV_DEFAULT_SALON_ID,
      userId: "dev-local-user",
      devMode: true,
      message: "Local dev login: using the server-configured default salon.",
    });
  }

  return res(401, {
    code: passwordLoginSecret() ? "INVALID_LOGIN" : "PASSWORD_LOGIN_NOT_CONFIGURED",
    message: passwordLoginSecret()
      ? "Invalid phone/email or password."
      : "Salon password login is not configured. Set SALON_LOGIN_PASSWORD for the provisioned test salon account.",
  });
};

// Re-exported for convenience. Pure helpers live in lib/salon-login-helpers.js
// (dependency-free) and are unit-tested directly there.
exports.normalizePhone = normalizePhone;
exports.pickActiveMembership = pickActiveMembership;
exports.isIdentifierAllowed = isIdentifierAllowed;
exports.allowedLoginIdentifiers = allowedLoginIdentifiers;
exports.AuthResolutionError = AuthResolutionError;
