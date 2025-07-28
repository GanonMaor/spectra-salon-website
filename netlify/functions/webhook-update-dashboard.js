const { Client } = require('pg');
const { getDashboardData } = require('./dashboard-aggregation');

// Optional: set a secret for security (recommended for production)
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || null;

async function getClient() {
  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL
  });
  await client.connect();
  return client;
}

exports.handler = async function(event, _context) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  // Optional: check for a secret in the request body or header
  if (WEBHOOK_SECRET) {
    let providedSecret = null;
    try {
      const body = event.body ? JSON.parse(event.body) : {};
      providedSecret = body.secret || event.headers['x-webhook-secret'];
    } catch {}
    if (providedSecret !== WEBHOOK_SECRET) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized: invalid webhook secret' })
      };
    }
  }

  let client;
  try {
    client = await getClient();
    const dashboardData = await getDashboardData(client);

    // Optionally: here you could cache the result, trigger a notification, etc.

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Dashboard data refreshed successfully',
        dashboard: dashboardData
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message,
        details: 'Dashboard refresh failed'
      })
    };
  } finally {
    if (client) await client.end();
  }
};
