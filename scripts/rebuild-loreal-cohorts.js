#!/usr/bin/env node
/**
 * rebuild-loreal-cohorts.js
 *
 * Idempotent script that:
 *  1. Loads Israel raw rows from market-intelligence.json
 *  2. Computes strict-consecutive-90% eligibility for 3 Jan→Jan periods
 *  3. Deletes ALL existing loreal_cohorts (cascades to members)
 *  4. Creates the 3 new cohorts with eligible members
 *  5. Prints a verification summary
 *
 * Usage:  node scripts/rebuild-loreal-cohorts.js
 * Requires NEON_DATABASE_URL (or DATABASE_URL) in .env / environment.
 */

require("dotenv").config();
const path = require("path");
const { Client } = require("pg");
const { computeEligibility } = require("./loreal-cohort-eligibility");

const DATABASE_URL = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
const MARKET_JSON = path.resolve(__dirname, "..", "src", "data", "market-intelligence.json");

const COHORT_DEFS = [
  { name: "Jan 2023 → Jan 2024", start: "Jan 2023", end: "Jan 2024" },
  { name: "Jan 2024 → Jan 2025", start: "Jan 2024", end: "Jan 2025" },
  { name: "Jan 2025 → Jan 2026", start: "Jan 2025", end: "Jan 2026" },
];

async function main() {
  if (!DATABASE_URL) {
    console.error("ERROR: No DATABASE_URL or NEON_DATABASE_URL found in environment.");
    process.exit(1);
  }

  console.log("Loading market-intelligence.json...");
  const data = require(MARKET_JSON);
  const israelRows = data.rawRows.filter((r) => r.co === "ISRAEL");
  console.log(`  Israel rows: ${israelRows.length}, unique users: ${new Set(israelRows.map((r) => r.uid)).size}`);

  console.log("\n=== Eligibility computation ===");
  const results = COHORT_DEFS.map((def) => {
    const res = computeEligibility(israelRows, def.start, def.end);
    console.log(`  ${def.name}: ${res.eligible.length} eligible (threshold ${res.threshold}/${res.totalMonths} consecutive months)`);

    const borderline = [...res.details.entries()]
      .filter(([, d]) => !d.pass && d.maxConsec >= res.threshold - 2)
      .map(([uid, d]) => `${uid}(${d.maxConsec}/${d.total})`)
      .slice(0, 5);
    if (borderline.length) console.log(`    near-miss: ${borderline.join(", ")}`);

    return { ...def, eligible: res.eligible, details: res.details };
  });

  console.log("\nConnecting to database...");
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes("neon") ? { rejectUnauthorized: false } : undefined,
  });
  await client.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS loreal_cohorts (
        id SERIAL PRIMARY KEY, name TEXT NOT NULL, description TEXT,
        start_month TEXT NOT NULL, end_month TEXT NOT NULL,
        created_by TEXT, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS loreal_cohort_members (
        cohort_id INTEGER NOT NULL REFERENCES loreal_cohorts(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL, added_at TIMESTAMPTZ DEFAULT now(),
        PRIMARY KEY (cohort_id, user_id)
      );
    `);

    console.log("Deleting all existing cohorts...");
    const del = await client.query("DELETE FROM loreal_cohorts");
    console.log(`  Deleted ${del.rowCount} cohort(s) (members cascade-deleted).`);

    console.log("\nCreating new cohorts...");
    for (const r of results) {
      const ins = await client.query(
        "INSERT INTO loreal_cohorts (name, description, start_month, end_month, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING id",
        [r.name, `Auto: strict consecutive 90% rule`, r.start, r.end, "rebuild-script"],
      );
      const cohortId = ins.rows[0].id;

      if (r.eligible.length > 0) {
        const vals = r.eligible.map((_, i) => `($1, $${i + 2})`).join(",");
        await client.query(
          `INSERT INTO loreal_cohort_members (cohort_id, user_id) VALUES ${vals}`,
          [cohortId, ...r.eligible],
        );
      }
      console.log(`  Created "${r.name}" (id=${cohortId}) with ${r.eligible.length} members`);
    }

    console.log("\n=== Verification ===");
    const verify = await client.query(
      `SELECT c.id, c.name, c.start_month, c.end_month,
              (SELECT count(*) FROM loreal_cohort_members m WHERE m.cohort_id = c.id) AS member_count
       FROM loreal_cohorts c ORDER BY c.start_month`,
    );
    for (const row of verify.rows) {
      console.log(`  [${row.id}] ${row.name} | ${row.start_month} → ${row.end_month} | ${row.member_count} members`);
    }
    if (verify.rows.length !== 3) {
      console.error(`  WARNING: expected 3 cohorts, found ${verify.rows.length}`);
    }

    for (const r of results) {
      const sample = r.eligible.slice(0, 5);
      const sampleDetails = sample.map((uid) => {
        const d = r.details.get(uid);
        return `${uid}: ${d.maxConsec}/${d.total} consec, ${d.active}/${d.total} active`;
      });
      console.log(`\n  Sample from "${r.name}":`);
      sampleDetails.forEach((s) => console.log(`    ${s}`));
    }

    console.log("\nDone.");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
