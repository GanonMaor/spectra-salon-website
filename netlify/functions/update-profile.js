const { Client } = require("pg");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

async function getClient() {
  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
  });
  await client.connect();
  return client;
}

async function verifyAuth(authHeader, client) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("No token provided");
  }

  const token = authHeader.substring(7);
  const decoded = jwt.verify(token, JWT_SECRET);

  const result = await client.query("SELECT * FROM users WHERE id = $1", [
    decoded.userId,
  ]);
  if (result.rows.length === 0) {
    throw new Error("User not found");
  }

  return result.rows[0];
}

exports.handler = async function (event, _context) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
      },
      body: "",
    };
  }

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (event.httpMethod !== "PUT") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  let client;

  try {
    client = await getClient();

    // Verify authentication
    const user = await verifyAuth(event.headers.authorization, client);

    const { full_name, phone } = JSON.parse(event.body);

    // Validate input
    if (!full_name || full_name.trim().length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Full name is required" }),
      };
    }

    // Update user profile
    const result = await client.query(
      "UPDATE users SET full_name = $1, phone = $2, updated_at = NOW() WHERE id = $3 RETURNING id, email, full_name, phone, role, created_at, updated_at",
      [full_name.trim(), phone || null, user.id],
    );

    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: "User not found" }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: "Profile updated successfully",
        user: result.rows[0],
      }),
    };
  } catch (err) {
    console.error("Update profile error:", err);

    if (err.message.includes("jwt") || err.message.includes("token")) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: "Invalid or expired token" }),
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || "Internal server error" }),
    };
  } finally {
    if (client) await client.end();
  }
};
