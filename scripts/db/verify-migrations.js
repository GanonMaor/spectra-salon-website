#!/usr/bin/env node
/*
  Dry-run the SQL migrations inside a single transaction and ROLLBACK.
  Usage: node scripts/db/verify-migrations.js --dry-run
*/
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

async function main() {
  if (!dryRun) {
    console.error('Refusing to run without --dry-run.');
    process.exit(1);
  }

  const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
  if (!connectionString) {
    console.log('SKIP  No DATABASE_URL/NEON_DATABASE_URL set.');
    process.exit(0);
  }

  const migrationsDir = path.resolve(__dirname, '../../migrations');
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b));

  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  console.log('Starting dry-run migration in a transaction...');
  await client.query('BEGIN');
  try {
    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      console.log(`Applying: ${file}`);
      await client.query(sql);
    }
    console.log('All migration files applied successfully (dry-run). Rolling back...');
    await client.query('ROLLBACK');
    console.log('PASS  Dry-run completed without errors.');
    process.exit(0);
  } catch (err) {
    console.error('FAIL  Migration error:', err.message);
    try { await client.query('ROLLBACK'); } catch {}
    process.exit(1);
  } finally {
    try { await client.end(); } catch {}
  }
}

main();


