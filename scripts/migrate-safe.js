/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

async function run() {
  const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL/NEON_DATABASE_URL not set');
  }
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const exec = async (sql) => {
    await client.query(sql);
  };
  const runFile = async (relPath) => {
    const filePath = path.resolve(__dirname, '..', relPath);
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`Running ${relPath}`);
    try {
      await client.query(sql);
    } catch (err) {
      const msg = String(err && err.message ? err.message : err);
      // Tolerate idempotent errors
      const tolerable = [
        'already exists',
        'duplicate object',
        'relation',
      ];
      if (tolerable.some((t) => msg.toLowerCase().includes(t))) {
        console.log(`⚠️  Non-fatal in ${relPath}: ${msg}`);
      } else {
        throw err;
      }
    }
  };

  try {
    console.log('Ensuring extensions...');
    await exec('CREATE EXTENSION IF NOT EXISTS citext;');
    await exec('CREATE EXTENSION IF NOT EXISTS pgcrypto;');

    console.log("Ensuring 'authenticated' role (for GRANT statements)...");
    await exec("DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN CREATE ROLE authenticated; END IF; END $$;");

    console.log('Ensuring users table...');
    await exec(`CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      full_name TEXT,
      phone TEXT,
      email TEXT UNIQUE,
      instagram TEXT,
      shipping_address TEXT,
      shipping_city TEXT,
      shipping_zip TEXT,
      shipping_country TEXT,
      card_last4 TEXT,
      trial_started_at TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`);

    const files = [
      'migrations/00_prereq_extensions.sql',
      'migrations/01_leads.sql',
      'migrations/02_leads_table.sql',
      'migrations/014_create_investor_contacts.sql',
    ];
    for (const f of files) {
      await runFile(f);
    }
    console.log('✅ Safe migrations completed');
  } finally {
    await client.end();
  }
}

run().catch((err) => {
  console.error('❌ Migration error:', err.message);
  process.exit(1);
});


