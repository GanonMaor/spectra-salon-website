const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

// ── Constants ────────────────────────────────────────────────────────
const REPORTS_DIR = path.resolve(__dirname, "../../reports/users_susege_reports");

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Content-Type": "application/json",
};

// Month name → number mapping (case-insensitive)
const MONTH_NAME_TO_NUM = {
  january: 1, february: 2, march: 3, april: 4,
  may: 5, june: 6, july: 7, august: 8,
  september: 9, october: 10, oktober: 10,
  november: 11, december: 12,
};

// Service category column groups
const CATEGORIES = [
  { name: "Color",          gramsCol: "Color",          svcCol: "Color service",          costCol: "Color total cost" },
  { name: "Highlights",     gramsCol: "Highlights",     svcCol: "Highlights service",     costCol: "Highlights total cost" },
  { name: "Toner",          gramsCol: "Toner",          svcCol: "Toner service",          costCol: "Toner total cost" },
  { name: "Straightening",  gramsCol: "Straightening",  svcCol: "Straightening service",  costCol: "Straightening total cost" },
  { name: "Others",         gramsCol: "Others",         svcCol: "Others service",         costCol: "Others total cost" },
];

// ── Helpers ──────────────────────────────────────────────────────────

/** Parse a file name like "january 2026.xlsx" → { month: 1, year: 2026 } */
function parseFileName(fileName) {
  const base = fileName.replace(/\.xlsx$/i, "").toLowerCase().trim();
  // Try patterns: "month year", "monthyear", "MONTH YEAR"
  for (const [name, num] of Object.entries(MONTH_NAME_TO_NUM)) {
    if (base.startsWith(name)) {
      const yearStr = base.replace(name, "").trim();
      const year = parseInt(yearStr, 10);
      if (!isNaN(year) && year > 2000) return { month: num, year };
    }
  }
  return null;
}

/** Convert month+year to a sort key */
function sortKey(year, month) {
  return year * 100 + month;
}

/** Make a label like "Jan 2026" */
function monthLabel(year, month) {
  const names = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${names[month - 1]} ${year}`;
}

/** Safely parse a number from xlsx cell (can be string, number, or empty) */
function num(val) {
  if (val == null || val === "") return 0;
  const n = typeof val === "number" ? val : parseFloat(String(val).replace(/,/g, ""));
  return isNaN(n) ? 0 : n;
}

function round2(v) {
  return Math.round(v * 100) / 100;
}

// ── Main Handler ────────────────────────────────────────────────────

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: CORS_HEADERS, body: "" };
  }

  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const params = event.queryStringParameters || {};

  // ── Mode 1: list all available salons (no userId) ─────────────────
  if (!params.userId) {
    try {
      return listSalons();
    } catch (err) {
      console.error("Error listing salons:", err);
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: "Failed to list salons", details: err.message }),
      };
    }
  }

  // ── Mode 2: report for specific userId ────────────────────────────
  try {
    return generateReport(params);
  } catch (err) {
    console.error("Error generating report:", err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Failed to generate report", details: err.message }),
    };
  }
};

// ── List all salons (from latest report) ────────────────────────────

function listSalons() {
  const files = loadFileIndex();
  if (files.length === 0) {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ salons: [] }),
    };
  }

  // Use the latest file to get the salon list
  const latestFile = files[files.length - 1];
  const rows = readXlsxRows(latestFile.filePath);

  const salonMap = {};
  for (const row of rows) {
    const uid = row.userId;
    if (!uid) continue;
    if (!salonMap[uid]) {
      salonMap[uid] = {
        userId: uid,
        displayName: row.DisplayName || null,
        state: row.State || null,
        city: row.City || null,
        salonType: row["Salon type"] || null,
        employees: row.Employees ? num(row.Employees) : null,
        totalServices: 0,
      };
    }
    salonMap[uid].totalServices += num(row["Total services"]);
    // Update displayName if available in this row but missing before
    if (!salonMap[uid].displayName && row.DisplayName) {
      salonMap[uid].displayName = row.DisplayName;
    }
  }

  const salons = Object.values(salonMap).sort((a, b) => b.totalServices - a.totalServices);

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({ salons, month: latestFile.label }),
  };
}

// ── Generate usage report ───────────────────────────────────────────

function generateReport(params) {
  const { userId, startMonth, endMonth, serviceCategory } = params;

  const files = loadFileIndex();
  if (files.length === 0) {
    return {
      statusCode: 404,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "No report files found" }),
    };
  }

  // Determine month range
  const allMonthLabels = files.map((f) => f.label);
  let startSk = files[0].sk;
  let endSk = files[files.length - 1].sk;

  if (startMonth) {
    const [sy, sm] = startMonth.split("-").map(Number);
    if (sy && sm) startSk = sortKey(sy, sm);
  }
  if (endMonth) {
    const [ey, em] = endMonth.split("-").map(Number);
    if (ey && em) endSk = sortKey(ey, em);
  }

  // Filter files by range
  const relevantFiles = files.filter((f) => f.sk >= startSk && f.sk <= endSk);

  if (relevantFiles.length === 0) {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        salon: { userId, displayName: null, state: null, city: null, salonType: null, employees: null },
        kpis: { totalServices: 0, totalMaterialCost: 0, avgCostPerService: 0, activeMonths: 0, servicesPerMonth: 0, totalGrams: 0, avgGramsPerService: 0 },
        categoryBreakdown: [],
        brandBreakdown: [],
        timeSeries: [],
        availableMonths: allMonthLabels,
        filteredMonthRange: { from: "", to: "" },
      }),
    };
  }

  // Read all relevant rows for this userId
  let allRows = [];
  let salonMeta = null;

  for (const fileInfo of relevantFiles) {
    const rows = readXlsxRows(fileInfo.filePath);
    for (const row of rows) {
      if (row.userId !== userId) continue;

      // Capture salon metadata from first matching row
      if (!salonMeta) {
        salonMeta = {
          userId,
          displayName: row.DisplayName || null,
          state: row.State || null,
          city: row.City || null,
          salonType: row["Salon type"] || null,
          employees: row.Employees ? num(row.Employees) : null,
        };
      } else {
        // Update with non-null values
        if (!salonMeta.displayName && row.DisplayName) salonMeta.displayName = row.DisplayName;
        if (!salonMeta.state && row.State) salonMeta.state = row.State;
        if (!salonMeta.city && row.City) salonMeta.city = row.City;
      }

      allRows.push({
        year: num(row.Year),
        month: num(row.MonthNumber),
        brand: row.Brand || "Unknown",
        visits: num(row["Total visits"]),
        services: num(row["Total services"]),
        cost: num(row["Total cost"]),
        grams: num(row["Total grams"]),
        // Per-category
        colorSvc: num(row["Color service"]),
        colorCost: num(row["Color total cost"]),
        colorGrams: num(row["Color"]),
        highlightsSvc: num(row["Highlights service"]),
        highlightsCost: num(row["Highlights total cost"]),
        highlightsGrams: num(row["Highlights"]),
        tonerSvc: num(row["Toner service"]),
        tonerCost: num(row["Toner total cost"]),
        tonerGrams: num(row["Toner"]),
        straighteningSvc: num(row["Straightening service"]),
        straighteningCost: num(row["Straightening total cost"]),
        straighteningGrams: num(row["Straightening"]),
        othersSvc: num(row["Others service"]),
        othersCost: num(row["Others total cost"]),
        othersGrams: num(row["Others"]),
      });
    }
  }

  if (!salonMeta) {
    salonMeta = { userId, displayName: null, state: null, city: null, salonType: null, employees: null };
  }

  // ── Aggregate: KPIs ─────────────────────────────────────────────
  let totalServices = 0, totalCost = 0, totalGrams = 0;
  const activeMonthKeys = new Set();

  for (const r of allRows) {
    totalServices += r.services;
    totalCost += r.cost;
    totalGrams += r.grams;
    activeMonthKeys.add(sortKey(r.year, r.month));
  }

  const activeMonths = activeMonthKeys.size;
  const kpis = {
    totalServices: Math.round(totalServices),
    totalMaterialCost: round2(totalCost),
    avgCostPerService: totalServices > 0 ? round2(totalCost / totalServices) : 0,
    activeMonths,
    servicesPerMonth: activeMonths > 0 ? round2(totalServices / activeMonths) : 0,
    totalGrams: round2(totalGrams),
    avgGramsPerService: totalServices > 0 ? round2(totalGrams / totalServices) : 0,
  };

  // ── Aggregate: Category Breakdown ───────────────────────────────
  const catAgg = {};
  const catDefs = [
    { name: "Color", svcKey: "colorSvc", costKey: "colorCost", gramsKey: "colorGrams" },
    { name: "Highlights", svcKey: "highlightsSvc", costKey: "highlightsCost", gramsKey: "highlightsGrams" },
    { name: "Toner", svcKey: "tonerSvc", costKey: "tonerCost", gramsKey: "tonerGrams" },
    { name: "Straightening", svcKey: "straighteningSvc", costKey: "straighteningCost", gramsKey: "straighteningGrams" },
    { name: "Others", svcKey: "othersSvc", costKey: "othersCost", gramsKey: "othersGrams" },
  ];

  for (const cat of catDefs) {
    catAgg[cat.name] = { services: 0, totalCost: 0, totalGrams: 0 };
  }

  for (const r of allRows) {
    for (const cat of catDefs) {
      catAgg[cat.name].services += r[cat.svcKey];
      catAgg[cat.name].totalCost += r[cat.costKey];
      catAgg[cat.name].totalGrams += r[cat.gramsKey];
    }
  }

  let categoryBreakdown = catDefs.map((cat) => {
    const a = catAgg[cat.name];
    return {
      category: cat.name,
      services: Math.round(a.services),
      totalCost: round2(a.totalCost),
      avgCostPerService: a.services > 0 ? round2(a.totalCost / a.services) : 0,
      totalGrams: round2(a.totalGrams),
      avgGramsPerService: a.services > 0 ? round2(a.totalGrams / a.services) : 0,
    };
  }).filter((c) => c.services > 0);

  // Apply service category filter if provided
  if (serviceCategory) {
    categoryBreakdown = categoryBreakdown.filter(
      (c) => c.category.toLowerCase() === serviceCategory.toLowerCase()
    );
  }

  // ── Aggregate: Brand Breakdown ──────────────────────────────────
  const brandAgg = {};
  for (const r of allRows) {
    if (!brandAgg[r.brand]) {
      brandAgg[r.brand] = { services: 0, totalCost: 0, totalGrams: 0, visits: 0 };
    }
    brandAgg[r.brand].services += r.services;
    brandAgg[r.brand].totalCost += r.cost;
    brandAgg[r.brand].totalGrams += r.grams;
    brandAgg[r.brand].visits += r.visits;
  }

  const brandBreakdown = Object.entries(brandAgg)
    .map(([brand, a]) => ({
      brand,
      services: Math.round(a.services),
      totalCost: round2(a.totalCost),
      avgCostPerService: a.services > 0 ? round2(a.totalCost / a.services) : 0,
      totalGrams: round2(a.totalGrams),
      visits: a.visits,
    }))
    .filter((b) => b.services > 0)
    .sort((a, b) => b.services - a.services);

  // ── Aggregate: Time Series (monthly) ────────────────────────────
  const monthAgg = {};
  for (const r of allRows) {
    const key = sortKey(r.year, r.month);
    if (!monthAgg[key]) {
      monthAgg[key] = {
        year: r.year,
        monthNumber: r.month,
        label: monthLabel(r.year, r.month),
        totalServices: 0,
        totalCost: 0,
        totalGrams: 0,
      };
    }
    monthAgg[key].totalServices += r.services;
    monthAgg[key].totalCost += r.cost;
    monthAgg[key].totalGrams += r.grams;
  }

  const timeSeries = Object.entries(monthAgg)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([, m]) => ({
      label: m.label,
      year: m.year,
      monthNumber: m.monthNumber,
      totalServices: Math.round(m.totalServices),
      totalCost: round2(m.totalCost),
      avgCostPerService: m.totalServices > 0 ? round2(m.totalCost / m.totalServices) : 0,
      totalGrams: round2(m.totalGrams),
    }));

  // ── Response ────────────────────────────────────────────────────
  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      salon: salonMeta,
      kpis,
      categoryBreakdown,
      brandBreakdown,
      timeSeries,
      availableMonths: allMonthLabels,
      filteredMonthRange: {
        from: relevantFiles[0].label,
        to: relevantFiles[relevantFiles.length - 1].label,
      },
    }),
  };
}

// ── File I/O helpers ────────────────────────────────────────────────

/** Build sorted index of available xlsx files */
function loadFileIndex() {
  if (!fs.existsSync(REPORTS_DIR)) return [];

  const fileNames = fs.readdirSync(REPORTS_DIR).filter((f) => f.endsWith(".xlsx"));
  const indexed = [];

  for (const fn of fileNames) {
    const parsed = parseFileName(fn);
    if (!parsed) continue;
    indexed.push({
      fileName: fn,
      filePath: path.join(REPORTS_DIR, fn),
      year: parsed.year,
      month: parsed.month,
      sk: sortKey(parsed.year, parsed.month),
      label: monthLabel(parsed.year, parsed.month),
    });
  }

  return indexed.sort((a, b) => a.sk - b.sk);
}

/** Read an xlsx file and return rows as objects (using row 1 as headers) */
function readXlsxRows(filePath) {
  const wb = XLSX.readFile(filePath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 });

  // Row 0 = date range title, Row 1 = headers, Row 2+ = data
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
