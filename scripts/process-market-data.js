#!/usr/bin/env node
/**
 * process-market-data.js
 * ---------------------
 * Reads every .xlsx report from reports/users_susege_reports/,
 * strips PII, aggregates the rows and writes a single
 * src/data/market-intelligence.json consumed by the front-end dashboard.
 */

const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

// ── paths ────────────────────────────────────────────────────────────
const REPORTS_DIR = path.resolve(
  __dirname,
  "..",
  "reports",
  "users_susege_reports"
);
const OUTPUT_PATH = path.resolve(__dirname, "..", "src", "data", "market-intelligence.json");

// ── constants ────────────────────────────────────────────────────────
const MONTH_ORDER = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];
// Some files use "oktober" instead of "october"
const MONTH_ALIASES = { oktober: "october" };

const SERVICE_TYPES = ["Color", "Highlights", "Toner", "Straightening", "Others"];

// ── helpers ──────────────────────────────────────────────────────────
function parseNum(v) {
  if (v === null || v === undefined || v === "") return 0;
  const n = typeof v === "string" ? parseFloat(v.replace(/,/g, "")) : Number(v);
  return isNaN(n) ? 0 : n;
}

function monthKey(month, year) {
  // "Aug 2024"
  const m = month.charAt(0).toUpperCase() + month.slice(1, 3).toLowerCase();
  return `${m} ${year}`;
}

function sortMonthKeys(keys) {
  return [...keys].sort((a, b) => {
    const [mA, yA] = a.split(" ");
    const [mB, yB] = b.split(" ");
    const yearDiff = Number(yA) - Number(yB);
    if (yearDiff !== 0) return yearDiff;
    const mIdxA = MONTH_ORDER.findIndex((m) => m.startsWith(mA.toLowerCase()));
    const mIdxB = MONTH_ORDER.findIndex((m) => m.startsWith(mB.toLowerCase()));
    return mIdxA - mIdxB;
  });
}

function sortableMonthIndex(monthName, year) {
  const idx = MONTH_ORDER.indexOf(monthName.toLowerCase());
  return year * 100 + (idx >= 0 ? idx : 0);
}

// ── main ─────────────────────────────────────────────────────────────
function main() {
  const files = fs
    .readdirSync(REPORTS_DIR)
    .filter((f) => f.endsWith(".xlsx"))
    .sort();

  console.log(`Found ${files.length} Excel reports`);

  // ---- 1. Parse all files into a flat row array ----
  const allRows = [];

  for (const file of files) {
    const filePath = path.join(REPORTS_DIR, file);
    const wb = XLSX.readFile(filePath);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1 });

    // Row 0 is a title/date-range row, row 1 is the header
    const headers = rawRows[1];
    if (!headers) {
      console.warn(`  Skipping ${file} – no header row found`);
      continue;
    }

    // Parse filename for month/year fallback
    const nameMatch = file
      .replace(/\.xlsx$/i, "")
      .toLowerCase()
      .match(/^(\w+)\s+(\d{4})$/);

    let fileMonth = nameMatch ? nameMatch[1] : null;
    let fileYear = nameMatch ? parseInt(nameMatch[2], 10) : null;
    if (fileMonth && MONTH_ALIASES[fileMonth]) fileMonth = MONTH_ALIASES[fileMonth];

    const dataRows = rawRows.slice(2); // skip title + header
    let parsed = 0;

    for (const raw of dataRows) {
      if (!raw || raw.length === 0) continue;

      // Map by header index
      const get = (name) => {
        const idx = headers.indexOf(name);
        return idx >= 0 ? raw[idx] : null;
      };

      const year = parseNum(get("Year")) || fileYear || 0;
      const monthRaw = (get("Month") || fileMonth || "").toString().toLowerCase();
      const month = MONTH_ALIASES[monthRaw] || monthRaw;

      const row = {
        year,
        month,
        monthNumber: parseNum(get("MonthNumber")) || (MONTH_ORDER.indexOf(month) + 1),
        // Keep userId only (no DisplayName, no PhoneNumber)
        userId: (get("userId") || "").toString().trim(),
        country: (get("State") || "Unknown").toString().trim() || "Unknown",
        city: (get("City") || "Unknown").toString().trim() || "Unknown",
        salonType: (get("Salon type") || "Unknown").toString().trim() || "Unknown",
        employees: parseNum(get("Employees")),
        brand: (get("Brand") || "Unknown").toString().trim(),
        totalVisits: parseNum(get("Total visits")),
        totalServices: parseNum(get("Total services")),
        totalCost: parseNum(get("Total cost")),
        totalAvgCost: parseNum(get("Total avg cost")),
        totalGrams: parseNum(get("Total grams")),
        // Service-level
        colorGrams: parseNum(get("Color")),
        colorServices: parseNum(get("Color service")),
        colorCost: parseNum(get("Color total cost")),
        colorAvgCost: parseNum(get("Color avg cost")),
        highlightsGrams: parseNum(get("Highlights")),
        highlightsServices: parseNum(get("Highlights service")),
        highlightsCost: parseNum(get("Highlights total cost")),
        highlightsAvgCost: parseNum(get("Highlights avg cost")),
        tonerGrams: parseNum(get("Toner")),
        tonerServices: parseNum(get("Toner service")),
        tonerCost: parseNum(get("Toner total cost")),
        tonerAvgCost: parseNum(get("Toner avg cost")),
        straighteningGrams: parseNum(get("Straightening")),
        straighteningServices: parseNum(get("Straightening service")),
        straighteningCost: parseNum(get("Straightening total cost")),
        straighteningAvgCost: parseNum(get("Straightening avg cost")),
        othersGrams: parseNum(get("Others")),
        othersServices: parseNum(get("Others service")),
        othersCost: parseNum(get("Others total cost")),
        othersAvgCost: parseNum(get("Others avg cost")),
        // Declared pricing
        rootColorPrice: parseNum(get("Root color price")),
        highlightsPrice: parseNum(get("Highlights price")),
        womenHaircutPrice: parseNum(get("Women haircut price")),
      };

      allRows.push(row);
      parsed++;
    }

    console.log(`  ${file}: ${parsed} rows parsed`);
  }

  console.log(`Total rows: ${allRows.length}`);

  // ---- 2. Aggregate ----

  // === Monthly Trends ===
  const monthlyMap = {};
  for (const r of allRows) {
    const key = monthKey(r.month, r.year);
    if (!monthlyMap[key]) {
      monthlyMap[key] = {
        label: key,
        year: r.year,
        monthNumber: r.monthNumber,
        sortIdx: sortableMonthIndex(r.month, r.year),
        totalVisits: 0,
        totalServices: 0,
        totalRevenue: 0,
        totalGrams: 0,
        uniqueSalons: new Set(),
        activeBrands: new Set(),
        colorServices: 0, colorRevenue: 0,
        highlightsServices: 0, highlightsRevenue: 0,
        tonerServices: 0, tonerRevenue: 0,
        straighteningServices: 0, straighteningRevenue: 0,
        othersServices: 0, othersRevenue: 0,
        rowCount: 0,
      };
    }
    const m = monthlyMap[key];
    m.totalVisits += r.totalVisits;
    m.totalServices += r.totalServices;
    m.totalRevenue += r.totalCost;
    m.totalGrams += r.totalGrams;
    // We use a hash of country+city+salonType+employees+brand row index as proxy for unique salon
    // Since userId is stripped, we can't deduplicate perfectly – approximate by row count
    m.rowCount++;
    m.activeBrands.add(r.brand);
    m.colorServices += r.colorServices;
    m.colorRevenue += r.colorCost;
    m.highlightsServices += r.highlightsServices;
    m.highlightsRevenue += r.highlightsCost;
    m.tonerServices += r.tonerServices;
    m.tonerRevenue += r.tonerCost;
    m.straighteningServices += r.straighteningServices;
    m.straighteningRevenue += r.straighteningCost;
    m.othersServices += r.othersServices;
    m.othersRevenue += r.othersCost;
  }

  const monthlyTrends = sortMonthKeys(Object.keys(monthlyMap)).map((key) => {
    const m = monthlyMap[key];
    return {
      label: m.label,
      year: m.year,
      monthNumber: m.monthNumber,
      totalVisits: Math.round(m.totalVisits),
      totalServices: Math.round(m.totalServices),
      totalRevenue: Math.round(m.totalRevenue * 100) / 100,
      totalGrams: Math.round(m.totalGrams * 100) / 100,
      activeBrands: m.activeBrands.size,
      salonBrandPairs: m.rowCount,
      colorServices: Math.round(m.colorServices),
      colorRevenue: Math.round(m.colorRevenue * 100) / 100,
      highlightsServices: Math.round(m.highlightsServices),
      highlightsRevenue: Math.round(m.highlightsRevenue * 100) / 100,
      tonerServices: Math.round(m.tonerServices),
      tonerRevenue: Math.round(m.tonerRevenue * 100) / 100,
      straighteningServices: Math.round(m.straighteningServices),
      straighteningRevenue: Math.round(m.straighteningRevenue * 100) / 100,
      othersServices: Math.round(m.othersServices),
      othersRevenue: Math.round(m.othersRevenue * 100) / 100,
    };
  });

  // === Brand Performance ===
  const brandMap = {};
  for (const r of allRows) {
    if (!brandMap[r.brand]) {
      brandMap[r.brand] = {
        brand: r.brand,
        totalServices: 0,
        totalRevenue: 0,
        totalVisits: 0,
        totalGrams: 0,
        months: new Set(),
        rowCount: 0,
      };
    }
    const b = brandMap[r.brand];
    b.totalServices += r.totalServices;
    b.totalRevenue += r.totalCost;
    b.totalVisits += r.totalVisits;
    b.totalGrams += r.totalGrams;
    b.months.add(monthKey(r.month, r.year));
    b.rowCount++;
  }

  const brandPerformance = Object.values(brandMap)
    .map((b) => ({
      brand: b.brand,
      totalServices: Math.round(b.totalServices),
      totalRevenue: Math.round(b.totalRevenue * 100) / 100,
      totalVisits: Math.round(b.totalVisits),
      totalGrams: Math.round(b.totalGrams * 100) / 100,
      monthsActive: b.months.size,
      salonBrandPairs: b.rowCount,
    }))
    .sort((a, b) => b.totalServices - a.totalServices);

  // === Brand Monthly (for trend lines) ===
  const brandMonthlyMap = {};
  for (const r of allRows) {
    const mk = monthKey(r.month, r.year);
    const key = `${r.brand}||${mk}`;
    if (!brandMonthlyMap[key]) {
      brandMonthlyMap[key] = {
        brand: r.brand,
        month: mk,
        sortIdx: sortableMonthIndex(r.month, r.year),
        totalServices: 0,
        totalRevenue: 0,
        totalVisits: 0,
      };
    }
    const bm = brandMonthlyMap[key];
    bm.totalServices += r.totalServices;
    bm.totalRevenue += r.totalCost;
    bm.totalVisits += r.totalVisits;
  }

  const brandMonthly = Object.values(brandMonthlyMap)
    .map((bm) => ({
      brand: bm.brand,
      month: bm.month,
      sortIdx: bm.sortIdx,
      totalServices: Math.round(bm.totalServices),
      totalRevenue: Math.round(bm.totalRevenue * 100) / 100,
      totalVisits: Math.round(bm.totalVisits),
    }))
    .sort((a, b) => a.sortIdx - b.sortIdx || a.brand.localeCompare(b.brand));

  // === Service Breakdown (overall) ===
  const serviceBreakdown = SERVICE_TYPES.map((type) => {
    const key = type.toLowerCase();
    let totalServices = 0;
    let totalRevenue = 0;
    let totalGrams = 0;
    for (const r of allRows) {
      totalServices += r[`${key}Services`] || 0;
      totalRevenue += r[`${key}Cost`] || 0;
      totalGrams += r[`${key}Grams`] || 0;
    }
    return {
      type,
      totalServices: Math.round(totalServices),
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalGrams: Math.round(totalGrams * 100) / 100,
    };
  });

  // === Geographic Distribution ===
  const geoMap = {};
  for (const r of allRows) {
    const country = r.country === "null" || !r.country ? "Unknown" : r.country;
    if (!geoMap[country]) {
      geoMap[country] = {
        country,
        totalServices: 0,
        totalRevenue: 0,
        totalVisits: 0,
        rowCount: 0,
        cities: {},
      };
    }
    const g = geoMap[country];
    g.totalServices += r.totalServices;
    g.totalRevenue += r.totalCost;
    g.totalVisits += r.totalVisits;
    g.rowCount++;

    const city = r.city === "null" || !r.city ? "Unknown" : r.city;
    if (!g.cities[city]) {
      g.cities[city] = { city, totalServices: 0, totalRevenue: 0, rowCount: 0 };
    }
    g.cities[city].totalServices += r.totalServices;
    g.cities[city].totalRevenue += r.totalCost;
    g.cities[city].rowCount++;
  }

  const geographicDistribution = Object.values(geoMap)
    .map((g) => ({
      country: g.country,
      totalServices: Math.round(g.totalServices),
      totalRevenue: Math.round(g.totalRevenue * 100) / 100,
      totalVisits: Math.round(g.totalVisits),
      salonBrandPairs: g.rowCount,
      topCities: Object.values(g.cities)
        .sort((a, b) => b.totalServices - a.totalServices)
        .slice(0, 10)
        .map((c) => ({
          city: c.city,
          totalServices: Math.round(c.totalServices),
          totalRevenue: Math.round(c.totalRevenue * 100) / 100,
        })),
    }))
    .sort((a, b) => b.totalServices - a.totalServices);

  // === Salon Size Benchmarks ===
  const sizeRanges = [
    { label: "Solo (0-1)", min: 0, max: 1 },
    { label: "Small (2-5)", min: 2, max: 5 },
    { label: "Medium (6-10)", min: 6, max: 10 },
    { label: "Large (11-20)", min: 11, max: 20 },
    { label: "Enterprise (21+)", min: 21, max: Infinity },
    { label: "Unknown", min: -1, max: -1 },
  ];

  const salonSizeBenchmarks = sizeRanges.map((range) => {
    const rows = allRows.filter((r) => {
      if (range.label === "Unknown") return !r.employees || r.employees === 0;
      return r.employees >= range.min && r.employees <= range.max;
    });
    const count = rows.length;
    return {
      label: range.label,
      count,
      avgServices: count > 0 ? Math.round((rows.reduce((s, r) => s + r.totalServices, 0) / count) * 100) / 100 : 0,
      avgRevenue: count > 0 ? Math.round((rows.reduce((s, r) => s + r.totalCost, 0) / count) * 100) / 100 : 0,
      avgVisits: count > 0 ? Math.round((rows.reduce((s, r) => s + r.totalVisits, 0) / count) * 100) / 100 : 0,
      totalServices: Math.round(rows.reduce((s, r) => s + r.totalServices, 0)),
      totalRevenue: Math.round(rows.reduce((s, r) => s + r.totalCost, 0) * 100) / 100,
    };
  });

  // === Pricing Trends ===
  const pricingMap = {};
  for (const r of allRows) {
    const key = monthKey(r.month, r.year);
    if (!pricingMap[key]) {
      pricingMap[key] = {
        label: key,
        sortIdx: sortableMonthIndex(r.month, r.year),
        rootColorPrices: [],
        highlightsPrices: [],
        haircutPrices: [],
      };
    }
    const p = pricingMap[key];
    if (r.rootColorPrice > 0) p.rootColorPrices.push(r.rootColorPrice);
    if (r.highlightsPrice > 0) p.highlightsPrices.push(r.highlightsPrice);
    if (r.womenHaircutPrice > 0) p.haircutPrices.push(r.womenHaircutPrice);
  }

  const pricingTrends = sortMonthKeys(Object.keys(pricingMap)).map((key) => {
    const p = pricingMap[key];
    const avg = (arr) => (arr.length > 0 ? Math.round((arr.reduce((s, v) => s + v, 0) / arr.length) * 100) / 100 : null);
    return {
      label: p.label,
      avgRootColorPrice: avg(p.rootColorPrices),
      avgHighlightsPrice: avg(p.highlightsPrices),
      avgHaircutPrice: avg(p.haircutPrices),
      sampleSizeRootColor: p.rootColorPrices.length,
      sampleSizeHighlights: p.highlightsPrices.length,
      sampleSizeHaircut: p.haircutPrices.length,
    };
  });

  // === Customer Overview (by userId) ===
  const customerMap = {};
  for (const r of allRows) {
    if (!r.userId) continue;
    if (!customerMap[r.userId]) {
      customerMap[r.userId] = {
        userId: r.userId,
        country: r.country,
        city: r.city,
        salonType: r.salonType,
        employees: r.employees,
        totalVisits: 0,
        totalServices: 0,
        totalRevenue: 0,
        totalGrams: 0,
        brands: new Set(),
        months: new Set(),
        colorServices: 0,
        highlightsServices: 0,
        tonerServices: 0,
        straighteningServices: 0,
        othersServices: 0,
        firstMonth: null,
        lastMonth: null,
      };
    }
    const c = customerMap[r.userId];
    c.totalVisits += r.totalVisits;
    c.totalServices += r.totalServices;
    c.totalRevenue += r.totalCost;
    c.totalGrams += r.totalGrams;
    c.brands.add(r.brand);
    const mk = monthKey(r.month, r.year);
    c.months.add(mk);
    c.colorServices += r.colorServices;
    c.highlightsServices += r.highlightsServices;
    c.tonerServices += r.tonerServices;
    c.straighteningServices += r.straighteningServices;
    c.othersServices += r.othersServices;
    // Track first/last month
    const si = sortableMonthIndex(r.month, r.year);
    if (!c.firstMonth || si < c.firstMonth.si) c.firstMonth = { label: mk, si };
    if (!c.lastMonth || si > c.lastMonth.si) c.lastMonth = { label: mk, si };
    // Update metadata if previously unknown
    if ((c.country === "Unknown" || c.country === "null") && r.country !== "Unknown" && r.country !== "null") c.country = r.country;
    if ((c.city === "Unknown" || c.city === "null") && r.city !== "Unknown" && r.city !== "null") c.city = r.city;
    if ((c.salonType === "Unknown" || c.salonType === "null") && r.salonType !== "Unknown" && r.salonType !== "null") c.salonType = r.salonType;
    if (!c.employees && r.employees) c.employees = r.employees;
  }

  const customerOverview = Object.values(customerMap)
    .map((c) => ({
      userId: c.userId,
      country: c.country,
      city: c.city,
      salonType: c.salonType,
      employees: c.employees,
      totalVisits: Math.round(c.totalVisits),
      totalServices: Math.round(c.totalServices),
      totalRevenue: Math.round(c.totalRevenue * 100) / 100,
      totalGrams: Math.round(c.totalGrams * 100) / 100,
      brandsUsed: c.brands.size,
      topBrands: [...c.brands].slice(0, 5),
      monthsActive: c.months.size,
      firstMonth: c.firstMonth ? c.firstMonth.label : "",
      lastMonth: c.lastMonth ? c.lastMonth.label : "",
      colorServices: Math.round(c.colorServices),
      highlightsServices: Math.round(c.highlightsServices),
      tonerServices: Math.round(c.tonerServices),
      straighteningServices: Math.round(c.straighteningServices),
      othersServices: Math.round(c.othersServices),
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue);

  // === Monthly Snapshots (for month-vs-month comparison) ===
  const snapshotMap = {};
  for (const r of allRows) {
    const mk = monthKey(r.month, r.year);
    if (!snapshotMap[mk]) {
      snapshotMap[mk] = {
        label: mk,
        sortIdx: sortableMonthIndex(r.month, r.year),
        totals: { visits: 0, services: 0, revenue: 0, grams: 0 },
        serviceTypes: {
          color: { services: 0, revenue: 0, grams: 0 },
          highlights: { services: 0, revenue: 0, grams: 0 },
          toner: { services: 0, revenue: 0, grams: 0 },
          straightening: { services: 0, revenue: 0, grams: 0 },
          others: { services: 0, revenue: 0, grams: 0 },
        },
        brands: {},
        customers: {},
      };
    }
    const snap = snapshotMap[mk];
    snap.totals.visits += r.totalVisits;
    snap.totals.services += r.totalServices;
    snap.totals.revenue += r.totalCost;
    snap.totals.grams += r.totalGrams;
    // Service types
    snap.serviceTypes.color.services += r.colorServices;
    snap.serviceTypes.color.revenue += r.colorCost;
    snap.serviceTypes.color.grams += r.colorGrams;
    snap.serviceTypes.highlights.services += r.highlightsServices;
    snap.serviceTypes.highlights.revenue += r.highlightsCost;
    snap.serviceTypes.highlights.grams += r.highlightsGrams;
    snap.serviceTypes.toner.services += r.tonerServices;
    snap.serviceTypes.toner.revenue += r.tonerCost;
    snap.serviceTypes.toner.grams += r.tonerGrams;
    snap.serviceTypes.straightening.services += r.straighteningServices;
    snap.serviceTypes.straightening.revenue += r.straighteningCost;
    snap.serviceTypes.straightening.grams += r.straighteningGrams;
    snap.serviceTypes.others.services += r.othersServices;
    snap.serviceTypes.others.revenue += r.othersCost;
    snap.serviceTypes.others.grams += r.othersGrams;
    // Brands
    if (!snap.brands[r.brand]) {
      snap.brands[r.brand] = { services: 0, revenue: 0, visits: 0, grams: 0, customerCount: 0 };
    }
    snap.brands[r.brand].services += r.totalServices;
    snap.brands[r.brand].revenue += r.totalCost;
    snap.brands[r.brand].visits += r.totalVisits;
    snap.brands[r.brand].grams += r.totalGrams;
    snap.brands[r.brand].customerCount++;
    // Customers
    if (r.userId) {
      if (!snap.customers[r.userId]) {
        snap.customers[r.userId] = { services: 0, revenue: 0, visits: 0, grams: 0, brands: [] };
      }
      snap.customers[r.userId].services += r.totalServices;
      snap.customers[r.userId].revenue += r.totalCost;
      snap.customers[r.userId].visits += r.totalVisits;
      snap.customers[r.userId].grams += r.totalGrams;
      snap.customers[r.userId].brands.push(r.brand);
    }
  }

  // Round values and convert to a clean structure
  const monthlySnapshots = {};
  for (const [mk, snap] of Object.entries(snapshotMap)) {
    const s = snap;
    const roundObj = (o) => ({
      services: Math.round(o.services),
      revenue: Math.round(o.revenue * 100) / 100,
      visits: Math.round(o.visits),
      grams: Math.round(o.grams * 100) / 100,
    });
    const roundSvc = (o) => ({
      services: Math.round(o.services),
      revenue: Math.round(o.revenue * 100) / 100,
      grams: Math.round(o.grams * 100) / 100,
    });
    const brands = {};
    for (const [b, v] of Object.entries(s.brands)) {
      brands[b] = { ...roundObj(v), customerCount: v.customerCount };
    }
    const customers = {};
    for (const [uid, v] of Object.entries(s.customers)) {
      customers[uid] = {
        services: Math.round(v.services),
        revenue: Math.round(v.revenue * 100) / 100,
        visits: Math.round(v.visits),
        grams: Math.round(v.grams * 100) / 100,
        brandsUsed: [...new Set(v.brands)].length,
      };
    }
    monthlySnapshots[mk] = {
      label: s.label,
      sortIdx: s.sortIdx,
      totals: roundObj(s.totals),
      serviceTypes: {
        color: roundSvc(s.serviceTypes.color),
        highlights: roundSvc(s.serviceTypes.highlights),
        toner: roundSvc(s.serviceTypes.toner),
        straightening: roundSvc(s.serviceTypes.straightening),
        others: roundSvc(s.serviceTypes.others),
      },
      brandCount: Object.keys(brands).length,
      customerCount: Object.keys(customers).length,
      brands,
      customers,
    };
  }

  // === Summary (KPI) ===
  const allMonthKeys = new Set();
  const allBrands = new Set();
  for (const r of allRows) {
    allMonthKeys.add(monthKey(r.month, r.year));
    allBrands.add(r.brand);
  }

  const summary = {
    totalRows: allRows.length,
    totalMonths: allMonthKeys.size,
    totalBrands: allBrands.size,
    totalCustomers: customerOverview.length,
    totalVisits: allRows.reduce((s, r) => s + r.totalVisits, 0),
    totalServices: Math.round(allRows.reduce((s, r) => s + r.totalServices, 0)),
    totalRevenue: Math.round(allRows.reduce((s, r) => s + r.totalCost, 0) * 100) / 100,
    totalGrams: Math.round(allRows.reduce((s, r) => s + r.totalGrams, 0) * 100) / 100,
    dateRange: {
      from: monthlyTrends.length > 0 ? monthlyTrends[0].label : "",
      to: monthlyTrends.length > 0 ? monthlyTrends[monthlyTrends.length - 1].label : "",
    },
  };

  // ---- 3. Write output ----
  const output = {
    _generated: new Date().toISOString(),
    _fileCount: files.length,
    summary,
    monthlyTrends,
    brandPerformance,
    brandMonthly,
    serviceBreakdown,
    geographicDistribution,
    salonSizeBenchmarks,
    pricingTrends,
    customerOverview,
    monthlySnapshots,
  };

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), "utf-8");

  console.log(`\nOutput written to ${OUTPUT_PATH}`);
  console.log(`  Summary: ${summary.totalMonths} months, ${summary.totalBrands} brands, ${summary.totalServices} services, $${summary.totalRevenue} revenue`);
}

main();
