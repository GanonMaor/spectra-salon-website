const path = require("path");
const { discoverReportFiles } = require("../report-discovery");
const { parseWorkbookPath, deduplicateRows } = require("./usage-row-parser");

function parseDiscoveredReport(entry) {
  const parsed = parseWorkbookPath(entry.filePath, {
    hintMonth: entry.hintMonth,
    hintYear: entry.hintYear,
    forceMultiSheet: entry.isMultiSheet,
    sourceFile: entry.filePath,
    sourceFolderYear: entry.folderYear || null,
  });
  const filteredOutOfFolderYear = parsed.sheets.reduce(
    (sum, sheet) => sum + (sheet.parsed.filteredOutOfFolderYear || 0),
    0,
  );
  return { entry, parsed, filteredOutOfFolderYear };
}

function loadUsageReportRows(reportsDir, opts = {}) {
  const { dedupe = false } = opts;
  const discovered = discoverReportFiles(reportsDir);
  const rows = [];
  const files = [];
  let filteredOutOfFolderYear = 0;

  for (const entry of discovered) {
    const result = parseDiscoveredReport(entry);
    filteredOutOfFolderYear += result.filteredOutOfFolderYear;
    rows.push(...result.parsed.rows);
    files.push({
      entry,
      parsed: result.parsed,
      rowCount: result.parsed.rows.length,
      sheetCount: result.parsed.sheetNames.length,
      filteredOutOfFolderYear: result.filteredOutOfFolderYear,
      relativePath: path.relative(reportsDir, entry.filePath),
    });
  }

  if (!dedupe) {
    return { discovered, files, rows, filteredOutOfFolderYear };
  }

  const deduped = deduplicateRows(rows);
  return {
    discovered,
    files,
    rows: deduped.rows,
    rawRows: rows,
    duplicatesRemoved: deduped.removed,
    filteredOutOfFolderYear,
  };
}

module.exports = {
  parseDiscoveredReport,
  loadUsageReportRows,
};
