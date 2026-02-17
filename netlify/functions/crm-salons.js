const { Client } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

function res(statusCode, data, isError = false) {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-salon-id',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    },
    body: JSON.stringify(isError ? { error: data } : data),
  };
}

async function getClient() {
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  return client;
}

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') return res(200, '');
  if (event.httpMethod !== 'GET') return res(405, 'Method not allowed', true);

  if (!DATABASE_URL || DATABASE_URL.length < 10) {
    return res(200, {
      salons: [{ id: 'salon-look', name: 'Salon Look', slug: 'salon-look', status: 'active', timezone: 'Asia/Jerusalem' }],
    });
  }

  let client;
  try {
    client = await getClient();
    const result = await client.query(
      `SELECT id, name, slug, phone, email, city, state, timezone, status
       FROM salons WHERE status = 'active' ORDER BY name LIMIT 500`
    );
    return res(200, { salons: result.rows });
  } catch (err) {
    console.error('CRM Salons function error:', err);
    return res(500, err.message || 'Internal server error', true);
  } finally {
    if (client) await client.end().catch(() => {});
  }
};
