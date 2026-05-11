/**
 * usage-quality.js
 * ---------------------------------------------------------------
 * Pure validation / quality checks for a parsed usage report.
 * Produces a list of warnings + a preview summary that the admin
 * UI can show before a commit.
 */

const { REQUIRED_HEADERS } = require("./usage-row-parser");
const {
  monthLabel,
  sortableIndex,
  sortMonthLabels,
} = require("./usage-keys");

const SEVERITIES = {
  CRITICAL: "critical",
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
  INFO: "info",
};

function buildWarnings({ parsed, hint }) {
  const warnings = [];

  if (!parsed || !parsed.sheets || parsed.sheets.length === 0) {
    warnings.push({
      code: "NO_SHEETS",
      severity: SEVERITIES.CRITICAL,
      message: "Workbook has no readable sheets.",
    });
    return warnings;
  }

  let totalRows = 0;
  for (const { sheetName, parsed: ps } of parsed.sheets) {
    totalRows += ps.rows.length;
    if (ps.headerRow < 0) {
      warnings.push({
        code: "MISSING_HEADER_ROW",
        severity: SEVERITIES.HIGH,
        sheet: sheetName,
        message: `Sheet "${sheetName}" has no recognizable header row.`,
      });
      continue;
    }
    const lower = ps.headers.map((h) => h.toLowerCase());
    for (const required of REQUIRED_HEADERS) {
      if (!lower.includes(required.toLowerCase())) {
        warnings.push({
          code: "MISSING_REQUIRED_COLUMN",
          severity: SEVERITIES.CRITICAL,
          sheet: sheetName,
          column: required,
          message: `Required column "${required}" is missing from sheet "${sheetName}".`,
        });
      }
    }
    if (ps.rows.length === 0) {
      warnings.push({
        code: "EMPTY_SHEET",
        severity: SEVERITIES.MEDIUM,
        sheet: sheetName,
        message: `Sheet "${sheetName}" has no data rows.`,
      });
    }

    if (hint?.hintYear && ps.internalYears && ps.internalYears.size > 0) {
      const internalYears = [...ps.internalYears];
      if (!internalYears.includes(hint.hintYear)) {
        warnings.push({
          code: "YEAR_MISMATCH",
          severity: SEVERITIES.CRITICAL,
          sheet: sheetName,
          expectedYear: hint.hintYear,
          internalYears,
          message: `Sheet "${sheetName}" was uploaded for ${hint.hintYear} but data has Year=${internalYears.join(",")}.`,
        });
      }
    }

    if (hint?.hintMonth && ps.internalMonths && ps.internalMonths.size > 0) {
      const internalMonths = [...ps.internalMonths];
      if (!internalMonths.includes(hint.hintMonth)) {
        warnings.push({
          code: "MONTH_MISMATCH",
          severity: SEVERITIES.HIGH,
          sheet: sheetName,
          expectedMonth: hint.hintMonth,
          internalMonths,
          message: `Sheet "${sheetName}" was uploaded for ${hint.hintMonth} but data has Month in ${internalMonths.join(",")}.`,
        });
      }
    }
  }

  if (totalRows === 0) {
    warnings.push({
      code: "NO_ROWS",
      severity: SEVERITIES.CRITICAL,
      message: "Workbook produced zero usable rows after parsing.",
    });
  }

  return warnings;
}

function summarizeRows(rows) {
  const userIds = new Set();
  const brands = new Set();
  const months = new Set();
  const countries = new Set();
  const cities = new Set();
  let visits = 0;
  let services = 0;
  let cost = 0;
  let grams = 0;
  let rowsWithPhone = 0;
  let employeesMissing = 0;

  for (const r of rows) {
    if (r.userId) userIds.add(r.userId);
    if (r.brand) brands.add(r.brand);
    if (r.monthKey) months.add(r.monthKey);
    if (r.country && r.country !== "Unknown") countries.add(r.country);
    if (r.city && r.city !== "Unknown") cities.add(r.city);
    visits += r.totalVisits;
    services += r.totalServices;
    cost += r.totalCost;
    grams += r.totalGrams;
    if (r.phoneRaw) rowsWithPhone += 1;
    if (!r.employees) employeesMissing += 1;
  }

  return {
    rowCount: rows.length,
    uniqueUsers: userIds.size,
    uniqueBrands: brands.size,
    monthLabels: sortMonthLabels([...months]),
    countries: [...countries].sort(),
    cities: [...cities].sort(),
    totals: {
      visits: Math.round(visits),
      services: Math.round(services),
      cost: Math.round(cost * 100) / 100,
      grams: Math.round(grams * 100) / 100,
    },
    rowsWithPhone,
    employeesMissing,
  };
}

function buildPreview({ parsed, hint, dedupRemoved }) {
  const warnings = buildWarnings({ parsed, hint });
  const summary = summarizeRows(parsed.rows);

  const months = summary.monthLabels;
  const expectedMonth =
    hint?.hintMonth && hint?.hintYear
      ? monthLabel(hint.hintMonth, hint.hintYear)
      : null;
  if (expectedMonth && months.length > 0 && !months.includes(expectedMonth)) {
    warnings.push({
      code: "EXPECTED_MONTH_NOT_PRESENT",
      severity: SEVERITIES.HIGH,
      expectedMonth,
      foundMonths: months,
      message: `Expected month ${expectedMonth} but parsed rows contain: ${months.join(", ")}.`,
    });
  }

  return {
    summary,
    warnings,
    sheets: parsed.sheets.map(({ sheetName, parsed: ps }) => ({
      sheetName,
      headerRow: ps.headerRow,
      headerCount: ps.headers.length,
      dataRows: ps.rows.length,
      internalYears: [...(ps.internalYears || [])],
      internalMonths: [...(ps.internalMonths || [])],
    })),
    duplicatesRemoved: dedupRemoved || 0,
    primaryMonth:
      summary.monthLabels.length === 1 ? summary.monthLabels[0] : null,
    primarySortIdx:
      summary.monthLabels.length === 1
        ? sortableIndex(
            summary.monthLabels[0].split(" ")[0].toLowerCase(),
            parseInt(summary.monthLabels[0].split(" ")[1], 10),
          )
        : null,
  };
}

function hasBlockingWarnings(warnings) {
  return warnings.some((w) => w.severity === SEVERITIES.CRITICAL);
}

module.exports = {
  SEVERITIES,
  buildWarnings,
  summarizeRows,
  buildPreview,
  hasBlockingWarnings,
};
