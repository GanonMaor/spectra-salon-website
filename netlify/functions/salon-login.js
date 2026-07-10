/**
 * netlify/functions/salon-login.js
 * ─────────────────────────────────────────────────────────────────────────
 * V1 salon user login endpoint.
 *
 * Current production-safe behavior:
 * - Explicit test login is supported for seeded @spectra.test CRM users in
 *   local/dev, or when SALON_TEST_LOGIN_ENABLED=true is set. This is for
 *   runtime bring-up and two-salon isolation testing only.
 * - Local/dev without SALON_SESSION_SECRET can still return a dev-fallback
 *   shape for the server-configured default salon, but production-like
 *   runtimes must have a real secret.
 * - General production password login is intentionally disabled until real
 *   invitation/password-reset credentials are provisioned.
 *
 * This gives the UI a real integration point without introducing shared
 * temporary passwords or unsafe tenant spoofing.
 */
"use strict";

const { Client } = require("pg");
const { DEV_DEFAULT_SALON_ID, signSalonSession } = require("./_salon-context");

const DATABASE_URL = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
const DEFAULT_TEST_PASSWORD = "SpectraTest!2026";

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
  return process.env.SALON_TEST_LOGIN_ENABLED === "true" ||
    (process.env.NODE_ENV !== "production" && process.env.CONTEXT !== "production");
}

async function getClient() {
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  return client;
}

async function tryTestLogin({ phoneOrEmail, password }) {
  if (!testLoginEnabled()) return null;
  if (!DATABASE_URL) return null;
  const expectedPassword = process.env.SALON_TEST_LOGIN_PASSWORD || DEFAULT_TEST_PASSWORD;
  if (password !== expectedPassword) return null;

  const client = await getClient();
  try {
    const user = await client.query(
      `SELECT id, email, phone, display_name
       FROM crm_users
       WHERE status = 'active'
         AND (LOWER(email) = LOWER($1) OR phone = $1)
         AND email ILIKE '%@spectra.test'
       LIMIT 1`,
      [phoneOrEmail],
    );
    if (user.rows.length === 0) return null;
    const u = user.rows[0];
    const membership = await client.query(
      `SELECT sm.salon_id, sm.user_id, sm.role, s.name AS salon_name
       FROM salon_memberships sm
       JOIN salons s ON s.id = sm.salon_id
       WHERE sm.user_id = $1
         AND s.status = 'active'
       ORDER BY sm.is_default DESC, sm.created_at ASC
       LIMIT 1`,
      [u.id],
    );
    if (membership.rows.length === 0) return null;
    const m = membership.rows[0];
    const token = signSalonSession({
      salonId: m.salon_id,
      userId: m.user_id,
      role: m.role,
      ttlSeconds: 60 * 60 * 12,
    });
    return {
      token,
      salonId: m.salon_id,
      salonName: m.salon_name,
      userId: m.user_id,
      role: m.role,
      devMode: process.env.CONTEXT !== "production",
      message: "Test salon login issued a signed session token.",
    };
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
    const testSession = await tryTestLogin({ phoneOrEmail: phone, password });
    if (testSession) return res(200, testSession);
  }

  if (!process.env.SALON_SESSION_SECRET) {
    return res(200, {
      token: null,
      salonId: DEV_DEFAULT_SALON_ID,
      userId: "dev-local-user",
      devMode: true,
      message: "Local dev login: using the server-configured default salon.",
    });
  }

  return res(501, {
    code: "PASSWORD_LOGIN_NOT_PROVISIONED",
    message: "Password login is not provisioned yet. Use invitation/password reset provisioning before enabling production login.",
  });
};
