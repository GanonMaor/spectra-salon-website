const { Client } = require("pg");

async function getClient() {
  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
  });
  await client.connect();
  return client;
}

exports.handler = async function (event, context) {
  // CORS headers
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // Handle preflight requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  // Only accept POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  let client;
  try {
    client = await getClient();

    const body = JSON.parse(event.body);
    const {
      user_id,
      session_id,
      action_type,
      context,
      page_url,
      details,
      user_agent,
      timestamp,
    } = body;

    // Validate required fields
    if (!action_type || !context) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error:
            "Missing required fields: action_type and context are required",
        }),
      };
    }

    // Get client IP address
    const ip_address =
      event.headers["x-forwarded-for"] ||
      event.headers["x-real-ip"] ||
      event.requestContext?.identity?.sourceIp;

    // Insert action log
    const query = `
      INSERT INTO user_actions (
        user_id, session_id, action_type, context, page_url, 
        details, ip_address, user_agent, timestamp
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, timestamp
    `;

    const values = [
      user_id || null,
      session_id,
      action_type,
      context,
      page_url,
      details ? JSON.stringify(details) : null,
      ip_address,
      user_agent,
      timestamp || new Date().toISOString(),
    ];

    const result = await client.query(query, values);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        id: result.rows[0].id,
        timestamp: result.rows[0].timestamp,
      }),
    };
  } catch (error) {
    console.error("Action logging error:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Failed to log action",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      }),
    };
  } finally {
    if (client) {
      await client.end();
    }
  }
};
