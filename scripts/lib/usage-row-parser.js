/**
 * usage-row-parser.js
 * ---------------------------------------------------------------
 * Parse a Spectra monthly usage Excel workbook (or a single sheet)
 * into normalized usage rows.
 *
 * Used by:
 *   - scripts/process-market-data.js  (full pipeline)
 *   - netlify/functions/usage-import.js (live admin import)
 *
 * The parser only deals with reading a workbook. Validation /
 * aggregation live in `usage-quality.js` and `usage-aggregator.js`.
 */

const XLSX = require("xlsx");
const { resolveCountry } = require("../country-resolver");
const { MONTH_ORDER, MONTH_ALIASES } = require("../report-discovery");
const {
  parseNum,
  canonicalMonthName,
  monthLabel,
  sortableIndex,
} = require("./usage-keys");

const REQUIRED_HEADERS = [
  "userId",
  "Brand",
  "Total visits",
  "Total services",
  "Total cost",
  "Total grams",
];

const OPTIONAL_HEADERS = [
  "Year",
  "Month",
  "MonthNumber",
  "PhoneNumber",
  "Phone",
  "phone",
  "State",
  "City",
  "Salon type",
  "Employees",
  "DisplayName",
  "Color",
  "Color service",
  "Color total cost",
  "Color avg cost",
  "Highlights",
  "Highlights service",
  "Highlights total cost",
  "Highlights avg cost",
  "Toner",
  "Toner service",
  "Toner total cost",
  "Toner avg cost",
  "Straightening",
  "Straightening service",
  "Straightening total cost",
  "Straightening avg cost",
  "Others",
  "Others service",
  "Others total cost",
  "Others avg cost",
  "Root color price",
  "Highlights price",
  "Women haircut price",
  "Total avg cost",
];

function findHeaderRow(rawRows) {
  if (!rawRows || rawRows.length === 0) return -1;
  const row0 = (rawRows[0] || []).map((v) => String(v || "").toLowerCase());
  if (row0.includes("userid") || row0.includes("year")) return 0;
  const row1 = (rawRows[1] || []).map((v) => String(v || "").toLowerCase());
  if (row1.includes("userid") || row1.includes("year")) return 1;
  return -1;
}

function detectSheetMonthYear(sheetName) {
  if (!sheetName) return { month: null, year: null };
  const m = sheetName.toLowerCase().match(/^([a-z]+)\s*(\d{4})$/);
  if (!m) return { month: null, year: null };
  let month = m[1];
  if (MONTH_ALIASES[month]) month = MONTH_ALIASES[month];
  const year = parseInt(m[2], 10);
  if (!Number.isFinite(year) || year < 2000) {
    return { month: null, year: null };
  }
  return { month, year };
}

function parseSheet(ws, opts = {}) {
  const {
    hintMonth = null,
    hintYear = null,
    sourceFile = "",
    sourceSheet = "",
    sourceFolderYear = null,
  } = opts;
  const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1 });
  if (!rawRows || rawRows.length < 2) {
    return {
      rows: [],
      headers: [],
      headerRow: -1,
      internalYears: new Set(),
      internalMonths: new Set(),
      filteredOutOfFolderYear: 0,
    };
  }

  const headerIdx = findHeaderRow(rawRows);
  if (headerIdx < 0) {
    return {
      rows: [],
      headers: [],
      headerRow: -1,
      internalYears: new Set(),
      internalMonths: new Set(),
      filteredOutOfFolderYear: 0,
    };
  }

  const headers = (rawRows[headerIdx] || []).map((h) =>
    (h == null ? "" : String(h)).trim(),
  );
  const headerLower = headers.map((h) => h.toLowerCase());

  const get = (raw, name) => {
    const idx = headerLower.indexOf(name.toLowerCase());
    return idx >= 0 ? raw[idx] : null;
  };

  const rows = [];
  const internalYears = new Set();
  const internalMonths = new Set();
  let filteredOutOfFolderYear = 0;

  const dataRows = rawRows.slice(headerIdx + 1);
  for (const raw of dataRows) {
    if (!raw || raw.length === 0) continue;
    const userId = (get(raw, "userId") || "").toString().trim();
    if (!userId) continue;

    const rawYear = parseNum(get(raw, "Year"));
    if (rawYear > 0) internalYears.add(rawYear);

    const rawMonth = canonicalMonthName(get(raw, "Month"));
    if (rawMonth) internalMonths.add(rawMonth);

    const year = hintYear || rawYear || 0;
    const month = hintMonth || rawMonth || "";
    const rowYearForFolderCheck = rawYear || year;
    if (
      sourceFolderYear &&
      rowYearForFolderCheck &&
      rowYearForFolderCheck !== sourceFolderYear
    ) {
      filteredOutOfFolderYear += 1;
      continue;
    }

    const phoneRaw =
      get(raw, "PhoneNumber") || get(raw, "Phone") || get(raw, "phone");
    const stateRaw = (get(raw, "State") || "").toString().trim();

    const row = {
      year,
      month,
      monthNumber:
        parseNum(get(raw, "MonthNumber")) ||
        (MONTH_ORDER.indexOf(month) + 1),
      userId,
      displayName: (get(raw, "DisplayName") || "").toString().trim() || null,
      phoneRaw: phoneRaw == null ? "" : String(phoneRaw),
      state: stateRaw,
      country: resolveCountry({ phone: phoneRaw, state: stateRaw }),
      city: (get(raw, "City") || "Unknown").toString().trim() || "Unknown",
      salonType:
        (get(raw, "Salon type") || "Unknown").toString().trim() || "Unknown",
      employees: parseNum(get(raw, "Employees")),
      brand: (get(raw, "Brand") || "Unknown").toString().trim(),
      totalVisits: parseNum(get(raw, "Total visits")),
      totalServices: parseNum(get(raw, "Total services")),
      totalCost: parseNum(get(raw, "Total cost")),
      totalAvgCost: parseNum(get(raw, "Total avg cost")),
      totalGrams: parseNum(get(raw, "Total grams")),
      colorGrams: parseNum(get(raw, "Color")),
      colorServices: parseNum(get(raw, "Color service")),
      colorCost: parseNum(get(raw, "Color total cost")),
      colorAvgCost: parseNum(get(raw, "Color avg cost")),
      highlightsGrams: parseNum(get(raw, "Highlights")),
      highlightsServices: parseNum(get(raw, "Highlights service")),
      highlightsCost: parseNum(get(raw, "Highlights total cost")),
      highlightsAvgCost: parseNum(get(raw, "Highlights avg cost")),
      tonerGrams: parseNum(get(raw, "Toner")),
      tonerServices: parseNum(get(raw, "Toner service")),
      tonerCost: parseNum(get(raw, "Toner total cost")),
      tonerAvgCost: parseNum(get(raw, "Toner avg cost")),
      straighteningGrams: parseNum(get(raw, "Straightening")),
      straighteningServices: parseNum(get(raw, "Straightening service")),
      straighteningCost: parseNum(get(raw, "Straightening total cost")),
      straighteningAvgCost: parseNum(get(raw, "Straightening avg cost")),
      othersGrams: parseNum(get(raw, "Others")),
      othersServices: parseNum(get(raw, "Others service")),
      othersCost: parseNum(get(raw, "Others total cost")),
      othersAvgCost: parseNum(get(raw, "Others avg cost")),
      rootColorPrice: parseNum(get(raw, "Root color price")),
      highlightsPrice: parseNum(get(raw, "Highlights price")),
      womenHaircutPrice: parseNum(get(raw, "Women haircut price")),
      sortIdx: sortableIndex(month, year),
      monthKey: monthLabel(month, year),
      sourceFile,
      sourceSheet,
      sourceFolderYear,
    };

    rows.push(row);
  }

  return {
    rows,
    headers,
    headerRow: headerIdx,
    internalYears,
    internalMonths,
    filteredOutOfFolderYear,
  };
}

function parseWorkbookBuffer(buffer, hint = {}) {
  const wb = XLSX.read(buffer, { type: "buffer" });
  return parseWorkbook(wb, hint);
}

function parseWorkbookPath(filePath, hint = {}) {
  const wb = XLSX.readFile(filePath);
  return parseWorkbook(wb, { ...hint, sourceFile: hint.sourceFile || filePath });
}

/**
 * Parse a full workbook. If `hint` carries explicit month/year, that
 * is used. Otherwise per-sheet detection runs against the sheet name
 * (e.g. "March 2024").
 */
function parseWorkbook(wb, hint = {}) {
  const sheets = [];
  const allRows = [];
  const sheetNames = wb.SheetNames || [];

  // Decide whether to treat as multi-sheet
  const isMulti =
    !!hint.forceMultiSheet ||
    (!hint.hintMonth && !hint.hintYear && sheetNames.length > 1);

  if (!isMulti) {
    const sheetName = sheetNames[0];
    const ws = wb.Sheets[sheetName];
    const parsed = parseSheet(ws, {
      hintMonth: hint.hintMonth || null,
      hintYear: hint.hintYear || null,
      sourceFile: hint.sourceFile || "",
      sourceSheet: sheetName,
      sourceFolderYear: hint.sourceFolderYear || null,
    });
    sheets.push({ sheetName, parsed });
    for (const r of parsed.rows) allRows.push(r);
  } else {
    for (const sheetName of sheetNames) {
      const ws = wb.Sheets[sheetName];
      const detected = detectSheetMonthYear(sheetName);
      const parsed = parseSheet(ws, {
        hintMonth: hint.hintMonth || detected.month,
        hintYear: hint.hintYear || detected.year,
        sourceFile: hint.sourceFile || "",
        sourceSheet: sheetName,
        sourceFolderYear: hint.sourceFolderYear || null,
      });
      sheets.push({ sheetName, parsed });
      for (const r of parsed.rows) allRows.push(r);
    }
  }

  return {
    sheets,
    sheetNames,
    rows: allRows,
  };
}

/**
 * Deduplicate by userId + brand + monthKey. Keep first occurrence.
 */
function deduplicateRows(rows) {
  const seen = new Set();
  const kept = [];
  let removed = 0;
  for (const r of rows) {
    const dk = `${r.userId}|${r.brand}|${r.monthKey}`;
    if (seen.has(dk)) {
      removed += 1;
      continue;
    }
    seen.add(dk);
    kept.push(r);
  }
  return { rows: kept, removed };
}

module.exports = {
  REQUIRED_HEADERS,
  OPTIONAL_HEADERS,
  findHeaderRow,
  detectSheetMonthYear,
  parseSheet,
  parseWorkbook,
  parseWorkbookBuffer,
  parseWorkbookPath,
  deduplicateRows,
};
