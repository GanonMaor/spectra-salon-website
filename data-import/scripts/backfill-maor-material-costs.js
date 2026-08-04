#!/usr/bin/env node
"use strict";

/**
 * Reprice Maor salon_product_usage rows with salon material rates.
 *
 *   node data-import/scripts/backfill-maor-material-costs.js           # dry-run
 *   node data-import/scripts/backfill-maor-material-costs.js --write
 */

const path = require("path");
const { Client } = require("pg");
const {
  classifyMaterialKind,
  estimateMaterialCostIls,
  DEVELOPER_PER_GRAM,
  BLEACH_PER_GRAM,
  COLOR_PER_GRAM,
  TREATMENT_PER_GRAM,
} = require("../lib/maor-material-pricing");

require("dotenv").config({ path: path.join(__dirname, "../../.env.local") });
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const SALON_ID = "clean-salon-504322680";
const WRITE = process.argv.includes("--write");
const BATCH = 500;

async function main() {
  const dbUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("NEON_DATABASE_URL is required");
  const host = (dbUrl.match(/@([^/]+)/) || [])[1];
  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    const { rows } = await client.query(
      `SELECT id, quantity, cost_at_use_amount, source_brand, source_series, source_shade, source_service_name
       FROM salon_product_usage
       WHERE salon_id = $1 AND id LIKE 'maor-usage-%'
       ORDER BY id`,
      [SALON_ID],
    );

    const summary = {
      host,
      mode: WRITE ? "write" : "dry-run",
      rows: rows.length,
      byKind: { developer: 0, bleach: 0, color: 0, treatment: 0 },
      oldSum: 0,
      newSum: 0,
      changed: 0,
      rates: {
        developerPerGram: DEVELOPER_PER_GRAM,
        bleachPerGram: BLEACH_PER_GRAM,
        colorPerGram: COLOR_PER_GRAM,
        treatmentPerGram: TREATMENT_PER_GRAM,
      },
    };

    const updates = [];
    for (const row of rows) {
      const kind = classifyMaterialKind({
        brand: row.source_brand,
        series: row.source_series,
        shade: row.source_shade,
        serviceName: row.source_service_name,
      });
      summary.byKind[kind] += 1;
      const oldCost = Number(row.cost_at_use_amount) || 0;
      const newCost = estimateMaterialCostIls(row.quantity, {
        brand: row.source_brand,
        series: row.source_series,
        shade: row.source_shade,
        serviceName: row.source_service_name,
      });
      summary.oldSum += oldCost;
      summary.newSum += newCost;
      if (Math.abs(oldCost - newCost) >= 0.005) {
        summary.changed += 1;
        updates.push({ id: row.id, newCost });
      }
    }

    summary.oldSum = Math.round(summary.oldSum);
    summary.newSum = Math.round(summary.newSum);

    if (WRITE && updates.length) {
      await client.query("BEGIN");
      try {
        for (let i = 0; i < updates.length; i += BATCH) {
          const chunk = updates.slice(i, i + BATCH);
          await client.query(
            `UPDATE salon_product_usage AS u
             SET cost_at_use_amount = v.cost,
                 cost_currency = 'ILS'
             FROM (
               SELECT * FROM unnest($1::text[], $2::numeric[]) AS t(id, cost)
             ) AS v
             WHERE u.id = v.id AND u.salon_id = $3`,
            [chunk.map((r) => r.id), chunk.map((r) => r.newCost), SALON_ID],
          );
        }
        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      }
    }

    console.log(JSON.stringify(summary, null, 2));
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("FAIL:", err.message);
  process.exit(1);
});
