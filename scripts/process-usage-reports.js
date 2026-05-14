#!/usr/bin/env node
/**
 * Process monthly xlsx usage reports into a single JSON file
 * for the Salon Performance Dashboard.
 *
 * Usage: node scripts/process-usage-reports.js
 */

const path = require("path");
const fs = require("fs");
const { loadUsageReportRows } = require("./lib/usage-report-loader");
const { buildDataset } = require("./lib/usage-aggregator");

const REPORTS_DIR = path.resolve(__dirname, "../reports/users_susege_reports");
const OUTPUT_FILE = path.resolve(__dirname, "../src/data/usage-reports.json");

// ── Main ────────────────────────────────────────────────────────────

console.log("Processing usage reports from:", REPORTS_DIR);

if (!fs.existsSync(REPORTS_DIR)) {
  console.error("Reports directory not found:", REPORTS_DIR);
  process.exit(1);
}

const loaded = loadUsageReportRows(REPORTS_DIR, { dedupe: true });
console.log(`Found ${loaded.discovered.length} xlsx files (recursive)`);
for (const file of loaded.files) {
  console.log(
    `  ${file.relativePath}: ${file.rowCount} rows (${file.sheetCount} sheet${file.sheetCount > 1 ? "s" : ""})`,
  );
  if (file.filteredOutOfFolderYear > 0) {
    console.log(
      `    filtered ${file.filteredOutOfFolderYear} row(s) outside folder year ${file.entry.folderYear}`,
    );
  }
}

console.log(`Total rows (before dedup): ${loaded.rawRows.length}`);
if (loaded.duplicatesRemoved > 0) {
  console.log(`  Deduplicated: removed ${loaded.duplicatesRemoved} duplicate rows`);
}

const canonical = buildDataset(loaded.rows, { fileCount: loaded.discovered.length });
const output = {
  _generated: canonical._generated,
  _fileCount: canonical._fileCount,
  availableMonths: canonical.filterOptions.months,
  salons: canonical.customerOverview.map((c) => ({
    userId: c.userId,
    displayName: null,
    country: c.country,
    state: null,
    city: c.city,
    salonType: c.salonType,
    employees: c.employees,
    currency: c.country === "ISRAEL" ? "ILS" : "USD",
    totalServices: c.totalServices,
  })),
  rows: canonical.rawRows,
};

const jsonStr = JSON.stringify(output);
fs.writeFileSync(OUTPUT_FILE, jsonStr, "utf-8");
const sizeMB = (Buffer.byteLength(jsonStr) / 1024 / 1024).toFixed(2);
console.log(`\nWrote ${OUTPUT_FILE}`);
console.log(`  ${output.rows.length} rows, ${output.salons.length} salons, ${sizeMB} MB`);
console.log(`  Months: ${output.availableMonths[0]} → ${output.availableMonths[output.availableMonths.length - 1]}`);
console.log("Done!");
