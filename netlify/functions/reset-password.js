const { Client } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

async function getClient() {
  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
  });
  await client.connect();
  return client;
}

exports.handler = async function (event, _context) {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let client;
  try {
    const { token, password } = JSON.parse(event.body || "{}");
    if (!token || !password) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Token and password are required" }) };
    }

    let email;
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      email = decoded.email;
    } catch (_e) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid or expired token" }) };
    }

    client = await getClient();
    const result = await client.query("SELECT id FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      // Avoid leaking existence; respond success
      return { statusCode: 200, headers, body: JSON.stringify({ message: "Password updated" }) };
    }

    const userId = result.rows[0].id;
    const passwordHash = await bcrypt.hash(password, 10);
    await client.query(
      "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2",
      [passwordHash, userId]
    );

    return { statusCode: 200, headers, body: JSON.stringify({ message: "Password updated" }) };
  } catch (error) {
    console.error("reset-password error:", error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Internal server error" }) };
  } finally {
    if (client) await client.end();
  }
};


