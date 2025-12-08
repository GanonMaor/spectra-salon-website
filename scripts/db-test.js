/* eslint-disable no-console */
const { Client } = require('pg');

async function main() {
  const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL/NEON_DATABASE_URL not set');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    const { rows } = await client.query('SELECT 1 as ok, current_database() as db, now() as ts');
    console.log('✅ Connected to database:', rows[0].db, 'at', rows[0].ts.toISOString());
    console.log('Ping result ok =', rows[0].ok === 1);
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    process.exitCode = 2;
  } finally {
    try { await client.end(); } catch {}
  }
}

main();


