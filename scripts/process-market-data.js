#!/usr/bin/env node
/**
 * process-market-data.js
 * ---------------------
 * Reads every .xlsx report from reports/users_susege_reports/,
 * strips PII, aggregates the rows and writes a single
 * src/data/market-intelligence.json consumed by the front-end dashboard.
 *
 * Parsing + aggregation logic lives in scripts/lib/ so the same code
 * runs in the live Netlify import endpoint (usage-import.js).
 */

const fs = require("fs");
const path = require("path");
const { loadUsageReportRows } = require("./lib/usage-report-loader");
const { buildDataset } = require("./lib/usage-aggregator");

const REPORTS_DIR = path.resolve(
  __dirname,
  "..",
  "reports",
  "users_susege_reports",
);
const OUTPUT_PATH = path.resolve(
  __dirname,
  "..",
  "src",
  "data",
  "market-intelligence.json",
);

function main() {
  const loaded = loadUsageReportRows(REPORTS_DIR, { dedupe: true });
  const { discovered, files, rows: dedupRows, rawRows, duplicatesRemoved } = loaded;
  console.log(`Found ${discovered.length} Excel report files (recursive)`);

  for (const file of files) {
    console.log(
      `  ${file.relativePath}: ${file.rowCount} rows (${file.sheetCount} sheet${file.sheetCount > 1 ? "s" : ""})`,
    );
    if (file.filteredOutOfFolderYear > 0) {
      console.log(
        `    filtered ${file.filteredOutOfFolderYear} row(s) outside folder year ${file.entry.folderYear}`,
      );
    }
  }

  console.log(`Total rows (before dedup): ${rawRows.length}`);
  if (loaded.filteredOutOfFolderYear > 0) {
    console.log(
      `  Folder-year filter removed ${loaded.filteredOutOfFolderYear} row(s)`,
    );
  }
  if (duplicatesRemoved > 0) {
    console.log(`  Deduplicated: removed ${duplicatesRemoved} duplicate rows`);
  }
  console.log(`Total rows: ${dedupRows.length}`);

  const output = buildDataset(dedupRows, { fileCount: discovered.length });

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), "utf-8");

  console.log(`\nOutput written to ${OUTPUT_PATH}`);
  console.log(
    `  Summary: ${output.summary.totalMonths} months, ${output.summary.totalBrands} brands, ${output.summary.totalServices} services, $${output.summary.totalRevenue} revenue`,
  );
}

main();
