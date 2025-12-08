const { Client } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

async function getClient() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  return client;
}

exports.handler = async function (event, context) {
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
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  let client;
  try {
    const body = JSON.parse(event.body);
    const { email, password } = body;

    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Email and password are required" }),
      };
    }

    client = await getClient();
    console.log(`🔍 Login attempt for: ${email}`);

    const result = await client.query(
      `SELECT id, email, password_hash, full_name, phone, role, created_at FROM users WHERE email = $1`,
      [email],
    );

    if (result.rows.length === 0) {
      console.log(`❌ User not found: ${email}`);
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: "Invalid credentials" }),
      };
    }

    const user = result.rows[0];
    console.log(`✅ User found: ${user.email}, role: ${user.role}`);

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      console.log(`❌ Invalid password for: ${email}`);
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: "Invalid credentials" }),
      };
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    console.log(`✅ Login successful for: ${email}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          phone: user.phone,
          role: user.role,
        },
      }),
    };
  } catch (error) {
    console.error("❌ Login error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
    };
  } finally {
    if (client) {
      await client.end();
    }
  }
};
