#!/usr/bin/env node
/**
 * export-customer-ids.js
 * Reads every usage report and produces:
 *   docs/customer-ids.json  — machine-readable
 *   docs/customer-ids.csv   — spreadsheet-friendly
 *
 * Fields per customer:
 *   userId        – internal unique ID (#XXXX)
 *   displayName   – salon / stylist name (where available)
 *   phone         – phone number (where available)
 *   country       – resolved from phone or State field
 *   city          – city (where available)
 *   totalMixes    – total services (= mixes) across all time
 *   monthsActive  – number of distinct months with activity
 *   firstMonth    – earliest month with data
 *   lastMonth     – most recent month with data
 */

const fs   = require("fs");
const path = require("path");
const XLSX = require("xlsx");
const { discoverReportFiles, MONTH_ORDER, MONTH_ALIASES } = require("./report-discovery");
const { resolveCountry, normalizePhone } = require("./country-resolver");

const REPORTS_DIR = path.resolve(__dirname, "..", "reports", "users_susege_reports");
const OUT_DIR     = path.resolve(__dirname, "..", "docs");

function parseNum(v) {
  if (v == null || v === "") return 0;
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(/,/g, ""));
  return isNaN(n) ? 0 : n;
}

function monthKey(month, year) {
  const m = (month || "").toString();
  const cap = m.charAt(0).toUpperCase() + m.slice(1, 3).toLowerCase();
  return `${cap} ${year}`;
}

function sortIdx(month, year) {
  const lower = (month || "").toLowerCase();
  let i = MONTH_ORDER.indexOf(lower);
  if (i < 0) i = MONTH_ORDER.findIndex(m => m.startsWith(lower) || lower.startsWith(m));
  return year * 100 + (i >= 0 ? i : 0);
}

// ── Main ──────────────────────────────────────────────────────────────
const discovered = discoverReportFiles(REPORTS_DIR);
console.log(`Found ${discovered.length} report files\n`);

// customer accumulator keyed by userId
const customers = {};

for (const entry of discovered) {
  const wb = XLSX.readFile(entry.filePath);

  const sheets = entry.isMultiSheet
    ? wb.SheetNames.map(sn => {
        const sm = sn.toLowerCase().match(/^([a-z]+)\s*(\d{4})$/);
        let hm = sm ? sm[1] : null;
        let hy = sm ? parseInt(sm[2], 10) : null;
        if (hm && MONTH_ALIASES[hm]) hm = MONTH_ALIASES[hm];
        return { ws: wb.Sheets[sn], hintMonth: hm, hintYear: hy };
      })
    : [{ ws: wb.Sheets[wb.SheetNames[0]], hintMonth: entry.hintMonth, hintYear: entry.hintYear }];

  for (const { ws, hintMonth, hintYear } of sheets) {
    const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 });
    if (!rawData || rawData.length < 2) continue;

    let headerIdx = 1;
    const row0Str = (rawData[0] || []).map(v => String(v).toLowerCase());
    if (row0Str.includes("userid") || row0Str.includes("year")) headerIdx = 0;

    const headers = rawData[headerIdx];
    if (!headers) continue;

    const hl  = headers.map(h => (h || "").toString().toLowerCase());
    const get = (row, name) => { const i = hl.indexOf(name.toLowerCase()); return i >= 0 ? row[i] : null; };

    for (const row of rawData.slice(headerIdx + 1)) {
      if (!row || row.length === 0) continue;

      const uid = (get(row, "userId") || "").toString().trim();
      if (!uid) continue;

      const year  = hintYear  || parseNum(get(row, "Year"))  || 0;
      const monthRaw = (hintMonth || get(row, "Month") || "").toString().toLowerCase();
      const month = MONTH_ALIASES[monthRaw] || monthRaw;
      const mk    = monthKey(month, year);
      const si    = sortIdx(month, year);

      const phoneRaw   = get(row, "PhoneNumber") || get(row, "Phone") || get(row, "phone");
      const stateRaw   = (get(row, "State") || "").toString().trim();
      const cityRaw    = (get(row, "City")  || "").toString().trim() || "";
      const nameRaw    = (get(row, "DisplayName") || "").toString().trim();
      const phone      = normalizePhone(phoneRaw);
      const country    = resolveCountry({ phone: phoneRaw, state: stateRaw });
      const totalSvc   = parseNum(get(row, "Total services"));

      if (!customers[uid]) {
        customers[uid] = {
          userId:      uid,
          displayName: nameRaw || "",
          phone:       phone   || "",
          country,
          city:        cityRaw,
          totalMixes:  0,
          months:      new Set(),
          firstSI:     Infinity,
          lastSI:      -Infinity,
          firstMonth:  "",
          lastMonth:   "",
        };
      }

      const c = customers[uid];
      c.totalMixes += totalSvc;
      c.months.add(mk);
      if (si < c.firstSI) { c.firstSI = si; c.firstMonth = mk; }
      if (si > c.lastSI)  { c.lastSI  = si; c.lastMonth  = mk; }

      // Fill in missing metadata from later rows that have more fields
      if (!c.displayName && nameRaw)                   c.displayName = nameRaw;
      if (!c.phone       && phone)                     c.phone       = phone;
      if ((!c.country || c.country === "Unknown") && country !== "Unknown") c.country = country;
      if (!c.city        && cityRaw)                   c.city        = cityRaw;
    }
  }
}

// ── Build final list ──────────────────────────────────────────────────
const list = Object.values(customers)
  .map(c => ({
    userId:       c.userId,
    displayName:  c.displayName || "",
    phone:        c.phone       || "",
    country:      c.country     || "Unknown",
    city:         c.city        || "",
    totalMixes:   Math.round(c.totalMixes),
    avgPerMonth:  c.months.size > 0 ? Math.round(c.totalMixes / c.months.size) : 0,
    monthsActive: c.months.size,
    firstMonth:   c.firstMonth,
    lastMonth:    c.lastMonth,
  }))
  .sort((a, b) => b.totalMixes - a.totalMixes);

console.log(`Total unique customers: ${list.length}`);
console.log(`Customers with phone:   ${list.filter(c => c.phone).length}`);
console.log(`Customers with name:    ${list.filter(c => c.displayName).length}`);

// ── Write JSON ────────────────────────────────────────────────────────
fs.mkdirSync(OUT_DIR, { recursive: true });
const jsonPath = path.join(OUT_DIR, "customer-ids.json");
fs.writeFileSync(jsonPath, JSON.stringify({
  _generated: new Date().toISOString(),
  _source:    "reports/users_susege_reports (all files)",
  totalCustomers: list.length,
  customers: list,
}, null, 2));
console.log(`\nJSON → ${jsonPath}`);

// ── Write CSV ─────────────────────────────────────────────────────────
const csvHeader = "userId,displayName,phone,country,city,totalMixes,avgPerMonth,monthsActive,firstMonth,lastMonth";
const csvRows   = list.map(c =>
  [c.userId, `"${c.displayName.replace(/"/g,'""')}"`, c.phone,
   c.country, `"${c.city.replace(/"/g,'""')}"`,
   c.totalMixes, c.avgPerMonth, c.monthsActive, c.firstMonth, c.lastMonth
  ].join(",")
);
const csvPath = path.join(OUT_DIR, "customer-ids.csv");
fs.writeFileSync(csvPath, [csvHeader, ...csvRows].join("\n"));
console.log(`CSV  → ${csvPath}`);
console.log(`\nTop 5 by total mixes:`);
list.slice(0,5).forEach(c => console.log(`  ${c.userId}  ${c.displayName || c.phone || "—"}  mixes:${c.totalMixes}  avg:${c.avgPerMonth}/mo  ${c.country}`));
