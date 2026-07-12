#!/usr/bin/env node
"use strict";

/**
 * Add "Or Avraham" (אור אברהם) as an active staff member for Maor Ganon.
 *
 * Idempotent: uses a stable id so re-running only upserts the same row and
 * never creates duplicates. Scoped strictly to Maor Ganon's tenant.
 *
 * Default mode is dry-run. Pass --write to perform the DB write.
 */

const path = require("path");
const { Client } = require("pg");

require("dotenv").config({ path: path.join(__dirname, "../../.env.local") });
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const TARGET_SALON_ID = "clean-salon-504322680";
const DEPARTMENT_ID = "maor-ganon-hair";
const STAFF_ID = "maor-staff-or-avraham";
const STAFF_NAME = "אור אברהם";
const STAFF_ROLE = "Stylist";
const STAFF_COLOR = "#96C7B3";

const args = new Set(process.argv.slice(2));
const WRITE = args.has("--write");

async function main() {
  const dbUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("NEON_DATABASE_URL is required");

  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    // Guardrail: the target salon must exist before we attach staff to it.
    const salon = await client.query(`SELECT id FROM salons WHERE id = $1 LIMIT 1`, [TARGET_SALON_ID]);
    if (salon.rowCount === 0) {
      throw new Error(`Target salon ${TARGET_SALON_ID} not found; refusing to write staff`);
    }

    if (WRITE) {
      await client.query(
        `INSERT INTO salon_staff (id, salon_id, name, role, color, department_ids, status)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb, 'active')
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           role = EXCLUDED.role,
           color = EXCLUDED.color,
           department_ids = EXCLUDED.department_ids,
           status = 'active',
           updated_at = now()`,
        [STAFF_ID, TARGET_SALON_ID, STAFF_NAME, STAFF_ROLE, STAFF_COLOR, JSON.stringify([DEPARTMENT_ID])],
      );
    }

    const staffRows = await client.query(
      `SELECT id, name, role, status FROM salon_staff WHERE salon_id = $1 ORDER BY name ASC`,
      [TARGET_SALON_ID],
    );

    console.log(
      JSON.stringify(
        {
          mode: WRITE ? "write" : "dry-run",
          targetSalonId: TARGET_SALON_ID,
          staffId: STAFF_ID,
          staffName: STAFF_NAME,
          staffRole: STAFF_ROLE,
          writesPerformed: WRITE,
          orAvrahamPresent: staffRows.rows.some((r) => r.id === STAFF_ID),
          totalStaff: staffRows.rowCount,
          staff: staffRows.rows,
        },
        null,
        2,
      ),
    );
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
