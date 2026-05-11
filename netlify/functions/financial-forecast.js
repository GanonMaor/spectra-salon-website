const { Client } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
const DEFAULT_SALON_ID = 'salon-look';
const STATE_VERSION = 2;

function res(statusCode, data, isError = false) {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-salon-id',
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
    },
    body: JSON.stringify(isError ? { error: data } : data),
  };
}

function getSalonId(event) {
  return (event.headers || {})['x-salon-id'] || DEFAULT_SALON_ID;
}

async function getClient() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  return client;
}

async function ensureTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS financial_forecast (
      salon_id text PRIMARY KEY,
      version integer NOT NULL DEFAULT ${STATE_VERSION},
      state_json jsonb NOT NULL,
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);
}

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') return res(200, '');

  const method = event.httpMethod;
  if (method !== 'GET' && method !== 'PUT') {
    return res(405, 'Method not allowed', true);
  }

  const salonId = getSalonId(event);

  // No DB configured: act as a transparent passthrough so the page can
  // still operate using its local cache / defaults.
  if (!DATABASE_URL || DATABASE_URL.length < 10) {
    if (method === 'GET') {
      return res(200, { state: null, version: STATE_VERSION, persisted: false });
    }
    return res(200, { ok: true, persisted: false });
  }

  let client;
  try {
    client = await getClient();
    await ensureTable(client);

    if (method === 'GET') {
      const result = await client.query(
        `SELECT state_json, version, updated_at
         FROM financial_forecast
         WHERE salon_id = $1
         LIMIT 1`,
        [salonId],
      );
      if (result.rows.length === 0) {
        return res(200, { state: null, version: STATE_VERSION, persisted: false });
      }
      const row = result.rows[0];
      return res(200, {
        state: row.state_json,
        version: row.version,
        updated_at: row.updated_at,
        persisted: true,
      });
    }

    // PUT: upsert
    const body = event.body ? JSON.parse(event.body) : {};
    const state = body && body.state;
    if (!state || typeof state !== 'object') {
      return res(400, 'Missing state object', true);
    }

    const result = await client.query(
      `INSERT INTO financial_forecast (salon_id, version, state_json, updated_at)
       VALUES ($1, $2, $3::jsonb, now())
       ON CONFLICT (salon_id) DO UPDATE
         SET state_json = EXCLUDED.state_json,
             version = EXCLUDED.version,
             updated_at = now()
       RETURNING version, updated_at`,
      [salonId, STATE_VERSION, JSON.stringify(state)],
    );

    return res(200, {
      ok: true,
      persisted: true,
      version: result.rows[0].version,
      updated_at: result.rows[0].updated_at,
    });
  } catch (err) {
    console.error('financial-forecast function error:', err);
    return res(500, err.message || 'Internal server error', true);
  } finally {
    if (client) await client.end().catch(() => {});
  }
};
