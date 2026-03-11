#!/usr/bin/env node
/**
 * migrate-add-summit-instagram.js
 * Adds summit and instagram columns to salon_users.
 * Run once: node scripts/migrate-add-summit-instagram.js
 * Requires NEON_DATABASE_URL in .env or environment.
 */

require("dotenv").config({ path: ".env" });
const { neon } = require("@neondatabase/serverless");

async function main() {
  let url = (process.env.NEON_DATABASE_URL || "").replace(/^psql\s+/i, "").replace(/^'|'$/g, "").trim();
  if (!url) {
    console.error("NEON_DATABASE_URL is not set. Create a .env file or export the variable.");
    process.exit(1);
  }

  const sql = neon(url);

  console.log("Adding summit column...");
  await sql`ALTER TABLE salon_users ADD COLUMN IF NOT EXISTS summit TEXT DEFAULT ''`;

  console.log("Adding instagram column...");
  await sql`ALTER TABLE salon_users ADD COLUMN IF NOT EXISTS instagram TEXT DEFAULT ''`;

  console.log("✓ Migration complete. Both columns are ready.");
}

main().catch(err => { console.error("Migration failed:", err.message); process.exit(1); });
