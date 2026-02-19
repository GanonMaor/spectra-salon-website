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
const { resolveCountry } = require("./country-resolver");
const { discoverReportFiles, MONTH_ORDER, MONTH_ALIASES } = require("./report-discovery");

const REPORTS_DIR = path.resolve(__dirname, "../reports/users_susege_reports");
const OUTPUT_FILE = path.resolve(__dirname, "../src/data/usage-reports.json");

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

function getCurrency(country) {
  if (!country) return "USD";
  return country.toUpperCase() === "ISRAEL" ? "ILS" : "USD";
}

const CANONICAL_HEADERS = {
  brand: "Brand", userid: "userId", displayname: "DisplayName",
  phonenumber: "PhoneNumber", phone: "Phone", employees: "Employees",
};

function canonicalHeader(h) {
  if (!h) return null;
  const s = h.toString();
  return CANONICAL_HEADERS[s.toLowerCase()] || s;
}

function readSheetRows(ws) {
  const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 });
  if (!rawData || rawData.length < 2) return [];

  let headerIdx = 1;
  const row0Str = (rawData[0] || []).map((v) => String(v).toLowerCase());
  if (row0Str.includes("userid") || row0Str.includes("year")) headerIdx = 0;

  const rawHeaders = rawData[headerIdx];
  if (!rawHeaders) return [];
  const headers = rawHeaders.map(canonicalHeader);

  const rows = [];
  for (let i = headerIdx + 1; i < rawData.length; i++) {
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

const discovered = discoverReportFiles(REPORTS_DIR);
console.log(`Found ${discovered.length} xlsx files (recursive)`);

const allRows = [];
const salonMap = {};
const monthLabelsCollected = new Set();

for (const entry of discovered) {
  const wb = XLSX.readFile(entry.filePath);
  const relPath = path.relative(REPORTS_DIR, entry.filePath);

  const sheetsToProcess = [];
  if (!entry.isMultiSheet) {
    sheetsToProcess.push({ ws: wb.Sheets[wb.SheetNames[0]], hintMonthNum: entry.hintMonthNum, hintYear: entry.hintYear });
  } else {
    for (const sn of wb.SheetNames) {
      const ws = wb.Sheets[sn];
      const sm = sn.toLowerCase().match(/^([a-z]+)\s*(\d{4})$/);
      let hm = sm ? sm[1] : null;
      let hy = sm ? parseInt(sm[2], 10) : null;
      if (hm && MONTH_ALIASES[hm]) hm = MONTH_ALIASES[hm];
      const hmNum = hm ? MONTH_ORDER.indexOf(hm) + 1 : null;
      sheetsToProcess.push({ ws, hintMonthNum: hmNum > 0 ? hmNum : null, hintYear: hy });
    }
  }

  let fileRowCount = 0;
  for (const { ws, hintMonthNum, hintYear } of sheetsToProcess) {
    const rows = readSheetRows(ws);
    for (const row of rows) {
      const uid = row.userId;
      if (!uid) continue;

      const phoneRaw = row.PhoneNumber || row.Phone || row.phone || null;
      const stateRaw = row.State || null;
      const country = resolveCountry({ phone: phoneRaw, state: stateRaw });

      const y = hintYear || num(row.Year);
      const m = hintMonthNum || num(row.MonthNumber);

      if (!salonMap[uid]) {
        salonMap[uid] = {
          userId: uid,
          displayName: row.DisplayName || null,
          country,
          state: stateRaw,
          city: row.City || null,
          salonType: row["Salon type"] || null,
          employees: row.Employees ? num(row.Employees) : null,
          currency: getCurrency(country),
        };
      } else {
        const s = salonMap[uid];
        if (!s.displayName && row.DisplayName) s.displayName = row.DisplayName;
        if (!s.state && stateRaw) s.state = stateRaw;
        if (!s.city && row.City) s.city = row.City;
        if (s.country !== "ISRAEL" && country === "ISRAEL") {
          s.country = country;
          s.currency = "ILS";
        }
        if (s.country === "Unknown" && country !== "Unknown") s.country = country;
      }

      if (y > 0 && m > 0) monthLabelsCollected.add(monthLabel(y, m));

      allRows.push({
        uid,
        y,
        m,
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
      fileRowCount++;
    }
  }
  console.log(`  ${relPath}: ${fileRowCount} rows (${wb.SheetNames.length} sheet${wb.SheetNames.length > 1 ? "s" : ""})`);
}

// Deduplicate overlapping records (userId + brand + year/month).
// Individual monthly files sort before consolidated "All" workbooks,
// so the first occurrence carries richer per-file metadata.
console.log(`Total rows (before dedup): ${allRows.length}`);
const seen = new Set();
const dedupRows = [];
for (const r of allRows) {
  const dk = `${r.uid}|${r.br}|${r.y}-${r.m}`;
  if (seen.has(dk)) continue;
  seen.add(dk);
  dedupRows.push(r);
}
const removed = allRows.length - dedupRows.length;
if (removed > 0) console.log(`  Deduplicated: removed ${removed} duplicate rows`);
allRows.length = 0;
allRows.push(...dedupRows);

const sortedMonths = [...monthLabelsCollected].sort((a, b) => {
  const [mA, yA] = a.split(" ");
  const [mB, yB] = b.split(" ");
  const names = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return Number(yA) * 100 + names.indexOf(mA) - (Number(yB) * 100 + names.indexOf(mB));
});

const output = {
  _generated: new Date().toISOString(),
  _fileCount: discovered.length,
  availableMonths: sortedMonths,
  salons: Object.values(salonMap).sort((a, b) => {
    const aSvc = allRows.filter((r) => r.uid === a.userId).reduce((s, r) => s + r.svc, 0);
    const bSvc = allRows.filter((r) => r.uid === b.userId).reduce((s, r) => s + r.svc, 0);
    return bSvc - aSvc;
  }),
  rows: allRows,
};

const jsonStr = JSON.stringify(output);
fs.writeFileSync(OUTPUT_FILE, jsonStr, "utf-8");
const sizeMB = (Buffer.byteLength(jsonStr) / 1024 / 1024).toFixed(2);
console.log(`\nWrote ${OUTPUT_FILE}`);
console.log(`  ${allRows.length} rows, ${Object.keys(salonMap).length} salons, ${sizeMB} MB`);
console.log(`  Months: ${sortedMonths[0]} → ${sortedMonths[sortedMonths.length - 1]}`);
console.log("Done!");
