const { neon } = require("@neondatabase/serverless");

// Clean connection string — Neon extension may inject "psql '...'" wrapper
function getDbUrl() {
  let url = process.env.NEON_DATABASE_URL || "";
  // Strip psql command wrapper if present
  url = url.replace(/^psql\s+/i, "").replace(/^'|'$/g, "").trim();
  return url;
}

exports.handler = async function (event) {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const sql = neon(getDbUrl());

    // Fetch all salon users
    const users = await sql`
      SELECT id, salon_name, phone_number, profiles, first_mix_date, last_mix_date,
             monthly_trend, version, state, city, links, created_at
      FROM salon_users
      ORDER BY id ASC
    `;

    // Fetch summary stats
    const statsRows = await sql`
      SELECT
        COUNT(*) as total_users,
        SUM(profiles) as total_profiles,
        COUNT(*) FILTER (WHERE version = '1021') as latest_version_count,
        COUNT(DISTINCT state) FILTER (WHERE state IS NOT NULL AND state != '') as country_count,
        COUNT(DISTINCT city) FILTER (WHERE city IS NOT NULL AND city != '') as city_count,
        COUNT(*) FILTER (WHERE first_mix_date != '-' AND first_mix_date IS NOT NULL) as active_users,
        COUNT(*) FILTER (WHERE profiles = 0) as zero_profile_users
      FROM salon_users
    `;

    // Fetch country/state breakdown
    const byState = await sql`
      SELECT
        COALESCE(NULLIF(state, ''), 'Unknown') as state,
        COUNT(*) as count,
        SUM(profiles) as total_profiles
      FROM salon_users
      GROUP BY COALESCE(NULLIF(state, ''), 'Unknown')
      ORDER BY count DESC
    `;

    // Fetch version breakdown
    const byVersion = await sql`
      SELECT version, COUNT(*) as count
      FROM salon_users
      GROUP BY version
      ORDER BY version DESC
    `;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        users: users,
        stats: statsRows[0],
        byState: byState,
        byVersion: byVersion,
      }),
    };
  } catch (error) {
    console.error("salon-users error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Internal server error", details: error.message }),
    };
  }
};
