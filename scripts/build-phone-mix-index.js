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
const XLSX = require("xlsx");
const { discoverReportFiles, MONTH_ALIASES } = require("./report-discovery");
const { normalizePhone } = require("./country-resolver");

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

  // ── 2. Scan Excel files for PhoneNumber → userId mapping ──────────────
  const phoneToUserId = {}; // normalizedPhone -> userId
  const discovered = discoverReportFiles(REPORTS_DIR);

  for (const entry of discovered) {
    const wb = XLSX.readFile(entry.filePath);

    const sheetsToProcess = [];
    if (!entry.isMultiSheet) {
      sheetsToProcess.push({ ws: wb.Sheets[wb.SheetNames[0]] });
    } else {
      for (const sn of wb.SheetNames) {
        sheetsToProcess.push({ ws: wb.Sheets[sn] });
      }
    }

    for (const { ws } of sheetsToProcess) {
      const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 });
      if (!rawData || rawData.length < 2) continue;

      // Detect header row (row 0 or row 1)
      let headerIdx = 1;
      const row0Str = (rawData[0] || []).map(v => String(v).toLowerCase());
      if (row0Str.includes("userid") || row0Str.includes("year")) headerIdx = 0;

      const headers = rawData[headerIdx];
      if (!headers) continue;

      const headerLower = headers.map(h => (h || "").toString().toLowerCase());
      const idx = name => headerLower.indexOf(name.toLowerCase());
      const get = (row, name) => { const i = idx(name); return i >= 0 ? row[i] : null; };

      const hasPhone = headerLower.includes("phonenumber") || headerLower.includes("phone");
      if (!hasPhone) continue;

      let mapped = 0;
      for (const row of rawData.slice(headerIdx + 1)) {
        if (!row || row.length === 0) continue;
        const userId    = (get(row, "userId") || "").toString().trim();
        const phoneRaw  = get(row, "PhoneNumber") || get(row, "Phone") || get(row, "phone");
        if (!userId || !phoneRaw) continue;

        const phone = normalizePhone(String(phoneRaw));
        if (!phone || phone.length < 7) continue;

        if (!phoneToUserId[phone]) {
          phoneToUserId[phone] = userId;
          mapped++;
        }
      }
      if (mapped > 0) console.log(`  ${entry.fileName}: mapped ${mapped} new phone→userId pairs`);
    }
  }

  console.log(`\nTotal unique phones mapped: ${Object.keys(phoneToUserId).length}`);

  // ── 3. Build final phone → mix-stats lookup ───────────────────────────
  const byPhone = {};
  let matchedWithStats = 0;

  for (const [phone, userId] of Object.entries(phoneToUserId)) {
    if (byUserId[userId]) {
      byPhone[phone] = { userId, ...byUserId[userId] };
      matchedWithStats++;
    } else {
      // Phone known but userId not in customerOverview (user with 0 mixes, or new)
      byPhone[phone] = { userId, totalMixes: 0, totalVisits: 0, totalGrams: 0, monthsActive: 0, firstMonth: "", lastMonth: "", brandsUsed: 0, country: "", city: "" };
    }
  }

  console.log(`Phones with full mix stats: ${matchedWithStats}`);
  console.log(`Phones with no history:     ${Object.keys(byPhone).length - matchedWithStats}`);

  const output = {
    _generated:   new Date().toISOString(),
    _source:      "market-intelligence.json + reports/users_susege_reports",
    totalMapped:  Object.keys(byPhone).length,
    byPhone,
    byUserId,
  };

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), "utf-8");
  console.log(`\nOutput → ${OUTPUT_PATH}`);
}

main();
