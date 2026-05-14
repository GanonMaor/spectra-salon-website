#!/usr/bin/env node
/**
 * build-phone-mix-index.js
 * Builds src/data/phone-mix-index.json
 *
 * Strategy:
 *  1. Read customerOverview from market-intelligence.json (all-time totals per userId).
 *  2. Scan every Excel file that contains a PhoneNumber column and extract
 *     userId <-> normalizedPhone pairs.
 *  3. Emit { byPhone: { phone: { userId, totalMixes, ... } }, byUserId: { ... } }
 *
 * The result lets the Admin Dashboard join admin salon_users (keyed by phone_number)
 * to the market-intelligence totals without any other shared key.
 */

const fs = require("fs");
const path = require("path");
const { loadUsageReportRows } = require("./lib/usage-report-loader");
const { buildPhoneMixIndex } = require("./lib/usage-aggregator");

const REPORTS_DIR = path.resolve(__dirname, "..", "reports", "users_susege_reports");
const MARKET_JSON = path.resolve(__dirname, "..", "src", "data", "market-intelligence.json");
const OUTPUT_PATH = path.resolve(__dirname, "..", "src", "data", "phone-mix-index.json");

function main() {
  // ── 1. Load customerOverview totals from market intelligence ──────────
  const mkt = JSON.parse(fs.readFileSync(MARKET_JSON, "utf-8"));
  const customerOverview = mkt.customerOverview || [];

  const byUserId = {};
  for (const c of customerOverview) {
    byUserId[c.userId] = {
      totalMixes:    c.totalServices || 0,
      totalVisits:   c.totalVisits   || 0,
      totalGrams:    c.totalGrams    || 0,
      monthsActive:  c.monthsActive  || 0,
      firstMonth:    c.firstMonth    || "",
      lastMonth:     c.lastMonth     || "",
      brandsUsed:    c.brandsUsed    || 0,
      country:       c.country       || "",
      city:          c.city          || "",
    };
  }

  console.log(`customerOverview: ${customerOverview.length} users loaded`);

  // ── 2. Reuse canonical parser rows for PhoneNumber → userId mapping ───
  const loaded = loadUsageReportRows(REPORTS_DIR, { dedupe: true });
  console.log(
    `canonical rows: ${loaded.rows.length} (${loaded.duplicatesRemoved || 0} duplicates removed)`,
  );
  if (loaded.filteredOutOfFolderYear > 0) {
    console.log(
      `folder-year filter removed ${loaded.filteredOutOfFolderYear} row(s)`,
    );
  }

  const output = buildPhoneMixIndex(loaded.rows, customerOverview);
  output._source = "canonical usage parser + market-intelligence.json";

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), "utf-8");
  console.log(`Total unique phones mapped: ${output.totalMapped}`);
  console.log(`\nOutput → ${OUTPUT_PATH}`);
}

main();
