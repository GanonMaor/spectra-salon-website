const { Client } = require('pg');

exports.handler = async () => {
  const start = Date.now();
  const result = {
    ok: true,
    uptimeMs: 0,
    env: {
      hasDatabaseUrl: Boolean(process.env.NEON_DATABASE_URL),
      nodeEnv: process.env.NODE_ENV || 'development',
    },
    db: { ok: false },
  };

  const connectionString = process.env.NEON_DATABASE_URL;

  if (connectionString) {
    try {
      const client = new Client({ connectionString });
      await client.connect();
      const { rows } = await client.query('SELECT 1 as ok');
      result.db.ok = rows && rows[0] && rows[0].ok === 1;
      await client.end();
    } catch (err) {
      result.db.ok = false;
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


