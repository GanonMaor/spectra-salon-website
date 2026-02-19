const XLSX = require("xlsx");
const path = require("path");
const { discoverReportFiles, MONTH_ORDER, MONTH_ALIASES } = require("../../scripts/report-discovery");

// ── Constants ────────────────────────────────────────────────────────
const REPORTS_DIR = path.resolve(__dirname, "../../reports/users_susege_reports");

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Content-Type": "application/json",
};

// ── Helpers ──────────────────────────────────────────────────────────

function sortKey(year, month) {
  return year * 100 + month;
}

function monthLabel(year, month) {
  const names = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${names[month - 1]} ${year}`;
}

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

  const latestFile = files[files.length - 1];
  const rows = readXlsxRows(latestFile.filePath, latestFile.sheetName);

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
    const rows = readXlsxRows(fileInfo.filePath, fileInfo.sheetName);
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
        year: fileInfo.year || num(row.Year),
        month: fileInfo.month || num(row.MonthNumber),
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

/**
 * Build a sorted file index using the shared discovery module.
 * Multi-sheet "All" workbooks are expanded into per-sheet entries so
 * the API can filter by month range.
 */
function loadFileIndex() {
  const discovered = discoverReportFiles(REPORTS_DIR);
  const indexed = [];

  for (const entry of discovered) {
    if (!entry.isMultiSheet) {
      if (!entry.hintMonthNum || !entry.hintYear) continue;
      indexed.push({
        fileName: entry.fileName,
        filePath: entry.filePath,
        year: entry.hintYear,
        month: entry.hintMonthNum,
        sk: sortKey(entry.hintYear, entry.hintMonthNum),
        label: monthLabel(entry.hintYear, entry.hintMonthNum),
        isMultiSheet: false,
        sheetName: null,
      });
    } else {
      const wb = XLSX.readFile(entry.filePath);
      for (const sn of wb.SheetNames) {
        const sm = sn.toLowerCase().match(/^([a-z]+)\s*(\d{4})$/);
        if (!sm) continue;
        let hm = sm[1];
        if (MONTH_ALIASES[hm]) hm = MONTH_ALIASES[hm];
        const hy = parseInt(sm[2], 10);
        const mi = MONTH_ORDER.indexOf(hm) + 1;
        if (mi > 0 && hy > 2000) {
          indexed.push({
            fileName: entry.fileName,
            filePath: entry.filePath,
            year: hy,
            month: mi,
            sk: sortKey(hy, mi),
            label: monthLabel(hy, mi),
            isMultiSheet: true,
            sheetName: sn,
          });
        }
      }
    }
  }

  return indexed.sort((a, b) => a.sk - b.sk);
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

/** Read rows from a single sheet */
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

/** Read an xlsx file and return rows as objects */
function readXlsxRows(filePath, sheetName) {
  const wb = XLSX.readFile(filePath);
  const ws = sheetName ? wb.Sheets[sheetName] : wb.Sheets[wb.SheetNames[0]];
  if (!ws) return [];
  return readSheetRows(ws);
}
