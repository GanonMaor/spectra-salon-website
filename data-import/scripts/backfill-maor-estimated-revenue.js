#!/usr/bin/env node
"use strict";

/**
 * Backfill Maor historical appointments with estimated revenue snapshots.
 *
 * - Updates salon_services.default_price_cents from the owner price list
 * - Writes list/estimated revenue snapshots on salon_appointments
 * - Waives color revenue when the same client has highlights the same day
 *
 * Default: dry-run. Pass --write to persist.
 */

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const envFileArg = process.argv.includes("--env-file")
  ? process.argv[process.argv.indexOf("--env-file") + 1]
  : null;
if (envFileArg) {
  require("dotenv").config({ path: path.resolve(envFileArg), override: true });
} else {
  require("dotenv").config({ path: path.join(__dirname, "../../.env.local") });
  require("dotenv").config({ path: path.join(__dirname, "../../.env") });
}

const {
  SERVICE_LIST_PRICE_ILS,
  PRICE_LIST_VERSION,
  ilsToCents,
  applyEstimatedPricing,
} = require("../lib/maor-service-pricing");

const ROOT = path.resolve(__dirname, "../..");
const MIGRATION_PATH = path.join(ROOT, "migrations/046_appointment_estimated_revenue.sql");
const REPORT_DIR = path.join(ROOT, "data-import/reports");
const TARGET_SALON_ID = process.argv.includes("--salon-id")
  ? process.argv[process.argv.indexOf("--salon-id") + 1]
  : "clean-salon-504322680";
const WRITE = process.argv.includes("--write");

async function main() {
  const databaseUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("NEON_DATABASE_URL / DATABASE_URL is required");
  }

  const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    if (WRITE) {
      const sql = fs.readFileSync(MIGRATION_PATH, "utf8");
      await client.query(sql);
    }

    const services = await client.query(
      `SELECT id, name, default_price_cents
       FROM salon_services
       WHERE salon_id = $1
       ORDER BY name`,
      [TARGET_SALON_ID],
    );

    const serviceUpdates = services.rows.map((row) => ({
      id: row.id,
      name: row.name,
      fromCents: Number(row.default_price_cents || 0),
      toCents: ilsToCents(SERVICE_LIST_PRICE_ILS[row.name] ?? 0),
    }));

    const appointments = await client.query(
      `SELECT id, service_name, customer_id, customer_name, start_time, estimated_revenue_cents
       FROM salon_appointments
       WHERE salon_id = $1
       ORDER BY start_time ASC`,
      [TARGET_SALON_ID],
    );

    const priced = applyEstimatedPricing(
      appointments.rows.map((row) => ({
        id: row.id,
        serviceName: row.service_name,
        customerId: row.customer_id,
        customerName: row.customer_name,
        startTime: row.start_time,
      })),
    );

    const waived = priced.filter((row) => row.pricingSnapshot.colorWaivedWithHighlights);
    const estimatedTotalIls = priced.reduce((sum, row) => sum + row.estimatedRevenueCents, 0) / 100;
    const listTotalIls = priced.reduce((sum, row) => sum + row.listPriceCents, 0) / 100;

    const summary = {
      mode: WRITE ? "write" : "dry-run",
      salonId: TARGET_SALON_ID,
      priceListVersion: PRICE_LIST_VERSION,
      servicesUpdated: serviceUpdates.filter((s) => s.fromCents !== s.toCents).length,
      appointments: priced.length,
      colorWaivedWithHighlights: waived.length,
      listRevenueIls: Math.round(listTotalIls),
      estimatedRevenueIls: Math.round(estimatedTotalIls),
      waivedRevenueIls: Math.round(listTotalIls - estimatedTotalIls),
      servicePrices: serviceUpdates,
      sampleWaived: waived.slice(0, 10).map((row) => ({
        id: row.id,
        serviceName: row.serviceName,
        listPriceIls: row.pricingSnapshot.listPriceIls,
        reason: row.pricingSnapshot.reason,
      })),
    };

    fs.mkdirSync(REPORT_DIR, { recursive: true });
    const reportPath = path.join(REPORT_DIR, "maor-estimated-revenue-backfill.json");
    fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2));

    if (!WRITE) {
      console.log(JSON.stringify(summary, null, 2));
      console.log(`\nDry-run only. Re-run with --write to persist. Report: ${reportPath}`);
      return;
    }

    await client.query("BEGIN");
    try {
      for (const svc of serviceUpdates) {
        await client.query(
          `UPDATE salon_services
           SET default_price_cents = $2, updated_at = now()
           WHERE id = $1 AND salon_id = $3`,
          [svc.id, svc.toCents, TARGET_SALON_ID],
        );
      }

      for (const row of priced) {
        await client.query(
          `UPDATE salon_appointments
           SET list_price_cents = $2,
               estimated_revenue_cents = $3,
               revenue_source = $4,
               pricing_source = $5,
               pricing_confidence = $6,
               pricing_snapshot = $7::jsonb,
               pricing_computed_at = now(),
               updated_at = now()
           WHERE id = $1 AND salon_id = $8`,
          [
            row.id,
            row.listPriceCents,
            row.estimatedRevenueCents,
            row.revenueSource,
            row.pricingSource,
            row.pricingConfidence,
            JSON.stringify(row.pricingSnapshot),
            TARGET_SALON_ID,
          ],
        );
      }
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    }

    console.log(JSON.stringify(summary, null, 2));
    console.log(`\nWrote estimated revenue snapshots. Report: ${reportPath}`);
  } finally {
    await client.end().catch(() => {});
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
