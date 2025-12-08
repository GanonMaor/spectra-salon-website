const { Client } = require('pg');

exports.handler = async () => {
  const start = Date.now();
  const presence = (name) => Boolean(process.env[name] && process.env[name].length > 0);

  const result = {
    ok: true,
    uptimeMs: 0,
    env: {
      has_DATABASE_URL: presence('DATABASE_URL'),
      has_NEON_DATABASE_URL: presence('NEON_DATABASE_URL'),
      has_JWT_SECRET: presence('JWT_SECRET'),
      has_RESEND_API_KEY: presence('RESEND_API_KEY'),
      has_EMAIL_FROM: presence('EMAIL_FROM'),
      nodeEnv: process.env.NODE_ENV || 'development',
    },
    db: { ok: false },
  };

  const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
  if (connectionString) {
    try {
      const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
      await client.connect();
      const { rows } = await client.query('SELECT 1 as ok');
      result.db.ok = rows && rows[0] && rows[0].ok === 1;
      await client.end();
    } catch (err) {
      result.db.ok = false;
      // Only show detailed error in development
      result.db.error = process.env.NODE_ENV === 'development' ? err.message : 'db_error';
      result.ok = false;
    }
  } else {
    result.db.ok = false;
    result.db.error = 'missing_connection_string';
    result.ok = false;
  }

  result.uptimeMs = Date.now() - start;
  return {
    statusCode: result.ok ? 200 : 500,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(result),
  };
};


