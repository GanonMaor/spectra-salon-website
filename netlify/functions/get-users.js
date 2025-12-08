const { Client } = require("pg");

exports.handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET",
      },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    await client.connect();

    // Get all users with basic info
    const result = await client.query(`
      SELECT 
        id,
        email,
        full_name,
        role,
        created_at,
        updated_at
      FROM users 
      ORDER BY created_at DESC
    `);

    const users = result.rows.map((user) => ({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
      last_login: null, // We don't track last_login yet
    }));

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(users),
    };
  } catch (error) {
    console.error("Get users error:", error);

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "Failed to fetch users",
        details: error.message,
      }),
    };
  } finally {
    await client.end();
  }
};
