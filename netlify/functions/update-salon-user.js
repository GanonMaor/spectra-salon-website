const { neon } = require("@neondatabase/serverless");

function getDbUrl() {
  let url = process.env.NEON_DATABASE_URL || "";
  url = url.replace(/^psql\s+/i, "").replace(/^'|'$/g, "").trim();
  return url;
}

exports.handler = async function (event) {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "PATCH, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "PATCH") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { id, summit, instagram } = body;

    if (!id) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "id is required" }) };
    }

    const sql = neon(getDbUrl());

    await sql`
      UPDATE salon_users
      SET
        summit      = ${summit    ?? null},
        instagram   = ${instagram ?? null},
        updated_at  = NOW()
      WHERE id = ${id}
    `;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, id }),
    };
  } catch (error) {
    console.error("update-salon-user error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Internal server error", details: error.message }),
    };
  }
};
