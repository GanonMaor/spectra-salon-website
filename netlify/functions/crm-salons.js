const { Client } = require('pg');
const { resolveSalonContext, SalonAuthError } = require('./_salon-context');

const DATABASE_URL = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

function res(statusCode, data, isError = false) {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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

  let salonCtx;
  try {
    salonCtx = resolveSalonContext(event);
  } catch (err) {
    if (err instanceof SalonAuthError) return res(err.statusCode, err.message, true);
    return res(401, 'Unauthorized', true);
  }
  const salonId = salonCtx.salonId;

  if (!DATABASE_URL || DATABASE_URL.length < 10) {
    return res(503, 'Database not configured. Contact administrator.', true);
  }

  let client;
  try {
    client = await getClient();
    const result = await client.query(
      `SELECT id, name, slug, phone, email, city, state, timezone, status
       FROM salons
       WHERE id = $1 AND status = 'active'
       LIMIT 1`,
      [salonId]
    );
    if (result.rows.length === 0) return res(404, 'Salon not found', true);
    return res(200, { salon: result.rows[0] });
  } catch (err) {
    console.error('CRM Salons function error:', err);
    return res(500, err.message || 'Internal server error', true);
  } finally {
    if (client) await client.end().catch(() => {});
  }
};
