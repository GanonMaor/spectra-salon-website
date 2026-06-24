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
    const { id, summit, instagram, churn_reason } = body;

    if (!id) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "id is required" }) };
    }

    const sql = neon(getDbUrl());

    // Partial update: only overwrite a column when the caller actually sent a
    // value for it. Fields left undefined (null) fall back to the existing
    // column value via COALESCE, so updating churn_reason won't wipe link edits
    // and vice-versa.
    const summitVal  = summit       === undefined ? null : summit;
    const igVal      = instagram    === undefined ? null : instagram;
    const churnVal   = churn_reason === undefined ? null : churn_reason;

    await sql`
      UPDATE salon_users
      SET
        summit       = COALESCE(${summitVal}, summit),
        instagram    = COALESCE(${igVal}, instagram),
        churn_reason = COALESCE(${churnVal}, churn_reason),
        updated_at   = NOW()
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
