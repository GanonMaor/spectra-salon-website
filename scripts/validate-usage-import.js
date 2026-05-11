#!/usr/bin/env node
/**
 * validate-usage-import.js
 * ---------------------------------------------------------------
 * End-to-end validation for the monthly usage-import pipeline.
 *
 * Runs the shared parser + aggregator over the reports in
 * `reports/users_susege_reports`, asserts parity with the bundled
 * `src/data/market-intelligence.json`, and exercises a handful of
 * known failure modes (mismatched month/year, duplicate keys,
 * missing required columns).
 *
 * Usage:
 *   node scripts/validate-usage-import.js
 *
 * Exit codes:
 *   0  all assertions passed
 *   1  one or more assertions failed (details printed to stderr)
 */

const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const { discoverReportFiles } = require("./report-discovery");
const {
  parseWorkbookPath,
  parseWorkbookBuffer,
  deduplicateRows,
} = require("./lib/usage-row-parser");
const { buildDataset } = require("./lib/usage-aggregator");
const { buildPreview, hasBlockingWarnings } = require("./lib/usage-quality");

const REPORTS_DIR = path.resolve(
  __dirname,
  "..",
  "reports",
  "users_susege_reports",
);
const BUNDLED_JSON = path.resolve(
  __dirname,
  "..",
  "src",
  "data",
  "market-intelligence.json",
);

let failures = 0;
function check(name, condition, detail) {
  if (condition) {
    console.log(`  ✓ ${name}`);
  } else {
    console.error(`  ✗ ${name}`);
    if (detail) console.error(`     ${detail}`);
    failures += 1;
  }
}

function loadAllRows() {
  const discovered = discoverReportFiles(REPORTS_DIR);
  const rows = [];
  for (const entry of discovered) {
    const parsed = parseWorkbookPath(entry.filePath, {
      hintMonth: entry.hintMonth,
      hintYear: entry.hintYear,
      forceMultiSheet: entry.isMultiSheet,
    });
    for (const r of parsed.rows) rows.push(r);
  }
  return { rows, fileCount: discovered.length };
}

function loadOneFebFile() {
  const matches = [];
  function walk(dir) {
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      const st = fs.statSync(full);
      if (st.isDirectory()) walk(full);
      else if (/february\s*2026\.xlsx$/i.test(name)) matches.push(full);
    }
  }
  walk(REPORTS_DIR);
  if (matches.length === 0) {
    throw new Error("Could not find FEBRUARY 2026 fixture file.");
  }
  return matches[0];
}

console.log("\n=== 1. Discovery + parsing parity =================");
const { rows: parsedRows, fileCount } = loadAllRows();
check(
  "Discovered reports",
  fileCount > 0,
  `Got ${fileCount} files.`,
);
check(
  "Parsed at least one row",
  parsedRows.length > 0,
  `Got ${parsedRows.length} rows.`,
);

const { rows: dedupRows, removed } = deduplicateRows(parsedRows);
check(
  "Dedup removed at least one duplicate",
  removed > 0,
  `Removed ${removed} duplicate row(s).`,
);
check(
  "Dedup keeps user+brand+month unique",
  new Set(dedupRows.map((r) => `${r.userId}|${r.brand}|${r.monthKey}`)).size ===
    dedupRows.length,
  "Duplicates remain after dedup.",
);

const dataset = buildDataset(dedupRows, { fileCount });

console.log("\n=== 2. Parity with bundled market-intelligence.json ===");
const bundled = JSON.parse(fs.readFileSync(BUNDLED_JSON, "utf-8"));
check(
  "summary identical",
  JSON.stringify(dataset.summary) === JSON.stringify(bundled.summary),
  `\n   new: ${JSON.stringify(dataset.summary)}\n   old: ${JSON.stringify(bundled.summary)}`,
);
check(
  "monthlyTrends identical",
  JSON.stringify(dataset.monthlyTrends) ===
    JSON.stringify(bundled.monthlyTrends),
);
check(
  "brandPerformance identical",
  JSON.stringify(dataset.brandPerformance) ===
    JSON.stringify(bundled.brandPerformance),
);
check(
  "serviceBreakdown identical",
  JSON.stringify(dataset.serviceBreakdown) ===
    JSON.stringify(bundled.serviceBreakdown),
);
check(
  "filterOptions identical",
  JSON.stringify(dataset.filterOptions) ===
    JSON.stringify(bundled.filterOptions),
);
check(
  "monthlySnapshots key set identical",
  JSON.stringify(Object.keys(dataset.monthlySnapshots).sort()) ===
    JSON.stringify(Object.keys(bundled.monthlySnapshots).sort()),
);
check(
  "rawRows length match",
  dataset.rawRows.length === bundled.rawRows.length,
  `${dataset.rawRows.length} vs ${bundled.rawRows.length}`,
);

console.log("\n=== 3. Preview on a real monthly Excel ============");
const febPath = loadOneFebFile();
const febBuffer = fs.readFileSync(febPath);
const febParsed = parseWorkbookBuffer(febBuffer, {
  hintMonth: "february",
  hintYear: 2026,
});
const febDedup = deduplicateRows(febParsed.rows);
const febPreview = buildPreview({
  parsed: febParsed,
  hint: { hintMonth: "february", hintYear: 2026 },
  dedupRemoved: febDedup.removed,
});
check(
  "FEBRUARY 2026 yields rows",
  febPreview.summary.rowCount > 0,
  `Got ${febPreview.summary.rowCount} rows.`,
);
check(
  "FEBRUARY 2026 primary month is Feb 2026",
  febPreview.primaryMonth === "Feb 2026",
  `Primary month was ${febPreview.primaryMonth}.`,
);
check(
  "Valid import produces no critical warnings",
  !hasBlockingWarnings(febPreview.warnings),
  `Warnings: ${JSON.stringify(febPreview.warnings.map((w) => w.code))}`,
);

console.log("\n=== 4. Mismatched month/year =====================");
const mismatchParsed = parseWorkbookBuffer(febBuffer, {
  hintMonth: "january",
  hintYear: 2026,
});
const mismatchDedup = deduplicateRows(mismatchParsed.rows);
const mismatchPreview = buildPreview({
  parsed: mismatchParsed,
  hint: { hintMonth: "january", hintYear: 2026 },
  dedupRemoved: mismatchDedup.removed,
});
const monthMismatch = mismatchPreview.warnings.find(
  (w) => w.code === "MONTH_MISMATCH",
);
check(
  "Month mismatch surfaces MONTH_MISMATCH warning",
  !!monthMismatch,
  `Warnings: ${JSON.stringify(mismatchPreview.warnings.map((w) => w.code))}`,
);

console.log("\n=== 5. Wrong year ================================");
const wrongYearParsed = parseWorkbookBuffer(febBuffer, {
  hintMonth: "february",
  hintYear: 2025,
});
const wrongYearDedup = deduplicateRows(wrongYearParsed.rows);
const wrongYearPreview = buildPreview({
  parsed: wrongYearParsed,
  hint: { hintMonth: "february", hintYear: 2025 },
  dedupRemoved: wrongYearDedup.removed,
});
const yearMismatch = wrongYearPreview.warnings.find(
  (w) => w.code === "YEAR_MISMATCH",
);
check(
  "Year mismatch surfaces YEAR_MISMATCH warning",
  !!yearMismatch,
  `Warnings: ${JSON.stringify(wrongYearPreview.warnings.map((w) => w.code))}`,
);
check(
  "Year mismatch is critical",
  yearMismatch?.severity === "critical",
);

console.log("\n=== 6. Missing required column ===================");
// Build a workbook missing "Total cost" — should surface a critical warning.
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet([
  ["Year", "Month", "userId", "Brand", "Total visits", "Total services", "Total grams"],
  [2026, "february", "u-test-1", "FAKE BRAND", 1, 2, 10],
]);
XLSX.utils.book_append_sheet(wb, ws, "test");
const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
const missingParsed = parseWorkbookBuffer(buf, {
  hintMonth: "february",
  hintYear: 2026,
});
const missingDedup = deduplicateRows(missingParsed.rows);
const missingPreview = buildPreview({
  parsed: missingParsed,
  hint: { hintMonth: "february", hintYear: 2026 },
  dedupRemoved: missingDedup.removed,
});
const missingCol = missingPreview.warnings.find(
  (w) => w.code === "MISSING_REQUIRED_COLUMN" && w.column === "Total cost",
);
check(
  "Missing required column surfaces MISSING_REQUIRED_COLUMN",
  !!missingCol,
);
check(
  "Missing required column blocks commit",
  hasBlockingWarnings(missingPreview.warnings),
);

console.log("\n=== 7. Duplicate rows are removed deterministically ==");
const dupParsed = parseWorkbookBuffer(febBuffer, {
  hintMonth: "february",
  hintYear: 2026,
});
const dupAll = [...dupParsed.rows, ...dupParsed.rows];
const { rows: dupKept, removed: dupRemoved } = deduplicateRows(dupAll);
check(
  "Concatenated rows are exactly halved by dedup",
  dupKept.length === dupParsed.rows.length && dupRemoved === dupParsed.rows.length,
  `Kept ${dupKept.length} (expected ${dupParsed.rows.length}); removed ${dupRemoved} (expected ${dupParsed.rows.length}).`,
);

console.log("\n=== 8. Aggregator preserves global totals ============");
const fullSummary = buildDataset(dedupRows, { fileCount }).summary;
const sumVisits = dedupRows.reduce((s, r) => s + r.totalVisits, 0);
const sumServices = Math.round(
  dedupRows.reduce((s, r) => s + r.totalServices, 0),
);
const sumRevenue =
  Math.round(dedupRows.reduce((s, r) => s + r.totalCost, 0) * 100) / 100;
check(
  "summary.totalVisits matches sum of rows",
  fullSummary.totalVisits === sumVisits,
  `${fullSummary.totalVisits} vs ${sumVisits}`,
);
check(
  "summary.totalServices matches sum of rows",
  fullSummary.totalServices === sumServices,
  `${fullSummary.totalServices} vs ${sumServices}`,
);
check(
  "summary.totalRevenue matches sum of rows (rounded)",
  fullSummary.totalRevenue === sumRevenue,
  `${fullSummary.totalRevenue} vs ${sumRevenue}`,
);

console.log("\n=== Summary ==========================================");
if (failures === 0) {
  console.log(`All checks passed.`);
  process.exit(0);
} else {
  console.error(`${failures} check(s) failed.`);
  process.exit(1);
}
