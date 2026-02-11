const { Client } = require("pg");

async function getClient() {
  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
  });
  await client.connect();
  return client;
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

  let client;
  try {
    client = await getClient();

    // Fetch all salon users
    const result = await client.query(`
      SELECT id, salon_name, phone_number, profiles, first_mix_date, last_mix_date,
             monthly_trend, version, state, city, links, created_at
      FROM salon_users
      ORDER BY id ASC
    `);

    // Fetch summary stats
    const stats = await client.query(`
      SELECT
        COUNT(*) as total_users,
        SUM(profiles) as total_profiles,
        COUNT(*) FILTER (WHERE version = '1021') as latest_version_count,
        COUNT(DISTINCT state) FILTER (WHERE state IS NOT NULL AND state != '') as country_count,
        COUNT(DISTINCT city) FILTER (WHERE city IS NOT NULL AND city != '') as city_count,
        COUNT(*) FILTER (WHERE first_mix_date != '-' AND first_mix_date IS NOT NULL) as active_users,
        COUNT(*) FILTER (WHERE profiles = 0) as zero_profile_users
      FROM salon_users
    `);

    // Fetch country/state breakdown
    const byState = await client.query(`
      SELECT
        COALESCE(NULLIF(state, ''), 'Unknown') as state,
        COUNT(*) as count,
        SUM(profiles) as total_profiles
      FROM salon_users
      GROUP BY COALESCE(NULLIF(state, ''), 'Unknown')
      ORDER BY count DESC
    `);

    // Fetch version breakdown
    const byVersion = await client.query(`
      SELECT version, COUNT(*) as count
      FROM salon_users
      GROUP BY version
      ORDER BY version DESC
    `);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        users: result.rows,
        stats: stats.rows[0],
        byState: byState.rows,
        byVersion: byVersion.rows,
      }),
    };
  } catch (error) {
    console.error("salon-users error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  } finally {
    if (client) await client.end();
  }
};
