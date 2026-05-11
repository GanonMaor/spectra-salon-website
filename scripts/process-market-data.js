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
const { discoverReportFiles } = require("./report-discovery");
const {
  parseWorkbookPath,
  deduplicateRows,
} = require("./lib/usage-row-parser");
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
  const discovered = discoverReportFiles(REPORTS_DIR);
  console.log(`Found ${discovered.length} Excel report files (recursive)`);

  const allRows = [];
  for (const entry of discovered) {
    const parsed = parseWorkbookPath(entry.filePath, {
      hintMonth: entry.hintMonth,
      hintYear: entry.hintYear,
      forceMultiSheet: entry.isMultiSheet,
    });
    const sheetCount = parsed.sheetNames.length;
    console.log(
      `  ${path.relative(REPORTS_DIR, entry.filePath)}: ${parsed.rows.length} rows (${sheetCount} sheet${sheetCount > 1 ? "s" : ""})`,
    );
    allRows.push(...parsed.rows);
  }

  console.log(`Total rows (before dedup): ${allRows.length}`);
  const { rows: dedupRows, removed } = deduplicateRows(allRows);
  if (removed > 0) {
    console.log(`  Deduplicated: removed ${removed} duplicate rows`);
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
