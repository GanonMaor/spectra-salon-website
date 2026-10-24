/**
 * Internal login-profile directory.
 *
 * Returns active login identifiers and salon memberships only after an
 * internal access-code check. Passwords and password hashes are never returned.
 */
"use strict";

const crypto = require("crypto");
const { createClient, hasDatabaseUrl } = require("./_db");
const {
  allowedLoginIdentifiers,
  isIdentifierAllowed,
  normalizePhone,
} = require("./lib/salon-login-helpers");

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, X-Access-Code",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Content-Type": "application/json",
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

function response(statusCode, payload) {
  return { statusCode, headers: CORS, body: JSON.stringify(payload) };
}

function getHeader(headers, name) {
  const expected = name.toLowerCase();
  for (const [key, value] of Object.entries(headers || {})) {
    if (key.toLowerCase() === expected) return String(value || "");
  }
  return "";
}

function timingSafeEqualText(leftValue, rightValue) {
  const left = Buffer.from(String(leftValue || ""));
  const right = Buffer.from(String(rightValue || ""));
  if (left.length === 0 || left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function directoryAccessCode() {
  return String(
    process.env.SALON_PROFILE_DIRECTORY_ACCESS_CODE
      || process.env.USAGE_IMPORT_ACCESS_CODE
      || "",
  ).trim();
}

exports.handler = async function handler(event) {
  if (event.httpMethod === "OPTIONS") return response(200, {});
  if (event.httpMethod !== "GET") return response(405, { error: "Method not allowed" });

  const expectedCode = directoryAccessCode();
  if (!expectedCode) {
    return response(503, { error: "Profile directory is not configured." });
  }
  const suppliedCode = getHeader(event.headers, "X-Access-Code");
  if (!timingSafeEqualText(suppliedCode, expectedCode)) {
    return response(401, { error: "Invalid internal access code." });
  }
  if (!hasDatabaseUrl()) {
    return response(503, { error: "Database is not configured." });
  }

  const client = createClient();
  await client.connect();
  try {
    const result = await client.query(`
      SELECT
        u.id AS user_id,
        u.display_name,
        u.email,
        u.phone,
        sm.salon_id,
        sm.role,
        sm.is_default,
        s.name AS salon_name
      FROM crm_users u
      JOIN salon_memberships sm ON sm.user_id = u.id
      JOIN salons s ON s.id = sm.salon_id
      WHERE u.status = 'active'
        AND s.status = 'active'
        AND COALESCE(sm.status, 'active') = 'active'
        AND (u.email IS NOT NULL OR u.phone IS NOT NULL)
      ORDER BY s.name, u.display_name, u.email, u.phone
      LIMIT 500
    `);

    const allowed = allowedLoginIdentifiers(process.env.SALON_LOGIN_IDENTIFIERS);
    const profiles = result.rows
      .filter((row) => {
        const identifier = String(row.email || row.phone || "").trim();
        return isIdentifierAllowed(identifier, normalizePhone(identifier), allowed);
      })
      .map((row) => ({
        id: `${row.salon_id}:${row.user_id}`,
        userId: row.user_id,
        displayName: row.display_name || row.email || row.phone,
        identifier: row.email || row.phone,
        email: row.email || null,
        phone: row.phone || null,
        salonId: row.salon_id,
        salonName: row.salon_name,
        role: row.role,
        isDefault: row.is_default === true,
      }));

    return response(200, { profiles });
  } catch (error) {
    console.error("[salon-login-profiles]", error);
    return response(500, { error: "Unable to load profile directory." });
  } finally {
    await client.end().catch(() => {});
  }
};
