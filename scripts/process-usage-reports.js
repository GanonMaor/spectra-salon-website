#!/usr/bin/env node
/**
 * Process monthly xlsx usage reports into a single JSON file
 * for the Salon Performance Dashboard.
 *
 * Usage: node scripts/process-usage-reports.js
 */

const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

const REPORTS_DIR = path.resolve(__dirname, "../reports/users_susege_reports");
const OUTPUT_FILE = path.resolve(__dirname, "../src/data/usage-reports.json");

// Month name → number
const MONTH_NAME_TO_NUM = {
  january: 1, february: 2, march: 3, april: 4,
  may: 5, june: 6, july: 7, august: 8,
  september: 9, october: 10, oktober: 10,
  november: 11, december: 12,
};

function parseFileName(fileName) {
  const base = fileName.replace(/\.xlsx$/i, "").toLowerCase().trim();
  for (const [name, num] of Object.entries(MONTH_NAME_TO_NUM)) {
    if (base.startsWith(name)) {
      const yearStr = base.replace(name, "").trim();
      const year = parseInt(yearStr, 10);
      if (!isNaN(year) && year > 2000) return { month: num, year };
    }
  }
  return null;
}

function sortKey(year, month) { return year * 100 + month; }

function monthLabel(year, month) {
  const names = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${names[month - 1]} ${year}`;
}

function num(val) {
  if (val == null || val === "") return 0;
  const n = typeof val === "number" ? val : parseFloat(String(val).replace(/,/g, ""));
  return isNaN(n) ? 0 : n;
}

function round2(v) { return Math.round(v * 100) / 100; }

// Determine currency based on state/country
const ISRAEL_STATES = new Set(["israel", "israel ", "ישראל"]);
function getCurrency(state) {
  if (!state) return "USD"; // Unknown → default to USD
  const s = state.trim().toLowerCase();
  if (ISRAEL_STATES.has(s)) return "ILS";
  return "USD";
}

function readXlsxRows(filePath) {
  const wb = XLSX.readFile(filePath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 });
  if (rawData.length < 3) return [];

  const headers = rawData[1];
  const rows = [];
  for (let i = 2; i < rawData.length; i++) {
    const row = {};
    let hasData = false;
    for (let j = 0; j < headers.length; j++) {
      if (headers[j]) {
        row[headers[j]] = rawData[i][j];
        if (rawData[i][j] != null && rawData[i][j] !== "") hasData = true;
      }
    }
    if (hasData && row.userId) rows.push(row);
  }
  return rows;
}

// ── Main ────────────────────────────────────────────────────────────

console.log("Processing usage reports from:", REPORTS_DIR);

if (!fs.existsSync(REPORTS_DIR)) {
  console.error("Reports directory not found:", REPORTS_DIR);
  process.exit(1);
}

const fileNames = fs.readdirSync(REPORTS_DIR).filter((f) => f.endsWith(".xlsx"));
console.log(`Found ${fileNames.length} xlsx files`);

// Build file index
const fileIndex = [];
for (const fn of fileNames) {
  const parsed = parseFileName(fn);
  if (!parsed) { console.warn(`  Skipping unparseable file: ${fn}`); continue; }
  fileIndex.push({
    fileName: fn,
    filePath: path.join(REPORTS_DIR, fn),
    year: parsed.year,
    month: parsed.month,
    sk: sortKey(parsed.year, parsed.month),
    label: monthLabel(parsed.year, parsed.month),
  });
}
fileIndex.sort((a, b) => a.sk - b.sk);
console.log(`Indexed ${fileIndex.length} files: ${fileIndex[0]?.label} → ${fileIndex[fileIndex.length - 1]?.label}`);

// Read all rows from all files, normalize to compact objects
const allRows = [];
const salonMap = {}; // userId → salon meta

for (const fi of fileIndex) {
  const rows = readXlsxRows(fi.filePath);
  console.log(`  ${fi.label}: ${rows.length} rows`);

  for (const row of rows) {
    const uid = row.userId;
    if (!uid) continue;

    // Collect salon meta
    if (!salonMap[uid]) {
      salonMap[uid] = {
        userId: uid,
        displayName: row.DisplayName || null,
        state: row.State || null,
        city: row.City || null,
        salonType: row["Salon type"] || null,
        employees: row.Employees ? num(row.Employees) : null,
        currency: getCurrency(row.State),
      };
    } else {
      const s = salonMap[uid];
      if (!s.displayName && row.DisplayName) s.displayName = row.DisplayName;
      if (!s.state && row.State) s.state = row.State;
      if (!s.city && row.City) s.city = row.City;
    }

    // Compact row
    allRows.push({
      uid,
      y: num(row.Year),
      m: num(row.MonthNumber),
      br: row.Brand || "Unknown",
      vis: num(row["Total visits"]),
      svc: num(row["Total services"]),
      cost: num(row["Total cost"]),
      gr: num(row["Total grams"]),
      cs: num(row["Color service"]),
      cc: num(row["Color total cost"]),
      cg: num(row["Color"]),
      hs: num(row["Highlights service"]),
      hc: num(row["Highlights total cost"]),
      hg: num(row["Highlights"]),
      ts: num(row["Toner service"]),
      tc: num(row["Toner total cost"]),
      tg: num(row["Toner"]),
      ss: num(row["Straightening service"]),
      sc: num(row["Straightening total cost"]),
      sg: num(row["Straightening"]),
      os: num(row["Others service"]),
      oc: num(row["Others total cost"]),
      og: num(row["Others"]),
    });
  }
}

// Build output
const output = {
  _generated: new Date().toISOString(),
  _fileCount: fileIndex.length,
  availableMonths: fileIndex.map((f) => f.label),
  salons: Object.values(salonMap).sort((a, b) => {
    // Sort by total services descending
    const aSvc = allRows.filter((r) => r.uid === a.userId).reduce((s, r) => s + r.svc, 0);
    const bSvc = allRows.filter((r) => r.uid === b.userId).reduce((s, r) => s + r.svc, 0);
    return bSvc - aSvc;
  }),
  rows: allRows,
};

// Write JSON
const jsonStr = JSON.stringify(output);
fs.writeFileSync(OUTPUT_FILE, jsonStr, "utf-8");
const sizeMB = (Buffer.byteLength(jsonStr) / 1024 / 1024).toFixed(2);
console.log(`\nWrote ${OUTPUT_FILE}`);
console.log(`  ${allRows.length} rows, ${Object.keys(salonMap).length} salons, ${sizeMB} MB`);
console.log("Done!");
