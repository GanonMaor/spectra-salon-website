/**
 * report-discovery.js
 * Shared helper: recursively discovers .xlsx report files under
 * users_susege_reports, supporting both nested year-folder layout
 * (2023/, 2024/, 2025/, 2026/) and flat layout.
 *
 * Supports:
 * - monthly files named "February 2026.xlsx"
 * - yearly "All 2026.xlsx" multi-sheet files
 * - consolidated usage workbooks whose rows carry Year/Month columns
 */

const fs = require("fs");
const path = require("path");

const MONTH_ORDER = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];
const MONTH_ALIASES = {
  oktober: "october", fabruary: "february",
  jan: "january", feb: "february", mar: "march", apr: "april",
  jun: "june", jul: "july", aug: "august", sep: "september",
  oct: "october", nov: "november", dec: "december",
};

function parseMonthYear(str) {
  const lower = str.toLowerCase().trim();
  for (let i = 0; i < MONTH_ORDER.length; i++) {
    const m = MONTH_ORDER[i];
    if (lower.startsWith(m)) {
      const rest = lower.slice(m.length).trim();
      const y = parseInt(rest, 10);
      if (!isNaN(y) && y > 2000) return { month: m, monthNum: i + 1, year: y };
    }
  }
  for (const [alias, canonical] of Object.entries(MONTH_ALIASES)) {
    if (lower.startsWith(alias)) {
      const rest = lower.slice(alias.length).trim();
      const y = parseInt(rest, 10);
      const idx = MONTH_ORDER.indexOf(canonical);
      if (!isNaN(y) && y > 2000 && idx >= 0) return { month: canonical, monthNum: idx + 1, year: y };
    }
  }
  return null;
}

function parseFolderYear(filePath, reportsDir) {
  const rel = path.relative(reportsDir, filePath);
  const parts = rel.split(path.sep);
  for (const part of parts) {
    if (/^\d{4}$/.test(part)) return parseInt(part, 10);
  }
  return null;
}

function classifyWorkbook(baseName, parsed) {
  const lower = baseName.toLowerCase();
  if (parsed) return "monthly";
  if (lower.startsWith("all ")) return "multi-sheet";
  return "row-months";
}

/**
 * Discover all .xlsx report files recursively under reportsDir.
 * Skips _overlap_backup and hidden/dot folders.
 * Returns array of { filePath, fileName, isMultiSheet, hintMonth, hintYear }
 * sorted chronologically.
 */
function discoverReportFiles(reportsDir) {
  const results = [];

  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      if (e.name.startsWith(".") || e.name.startsWith("_")) continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        walk(full);
      } else if (e.name.endsWith(".xlsx")) {
        const baseName = e.name.replace(/\.xlsx$/i, "").trim();
        const parsed = parseMonthYear(baseName);
        const workbookType = classifyWorkbook(baseName, parsed);
        const isMulti = workbookType !== "monthly";
        const folderYear = parseFolderYear(full, reportsDir);
        results.push({
          filePath: full,
          fileName: e.name,
          workbookType,
          folderYear,
          isMultiSheet: isMulti,
          hintMonth: parsed ? parsed.month : null,
          hintYear: parsed ? parsed.year : null,
          hintMonthNum: parsed ? parsed.monthNum : null,
          sortKey: parsed
            ? parsed.year * 100 + parsed.monthNum
            : Number.MAX_SAFE_INTEGER,
        });
      }
    }
  }

  walk(reportsDir);
  results.sort((a, b) => a.sortKey - b.sortKey || a.fileName.localeCompare(b.fileName));
  return results;
}

module.exports = {
  discoverReportFiles,
  parseMonthYear,
  parseFolderYear,
  classifyWorkbook,
  MONTH_ORDER,
  MONTH_ALIASES,
};
