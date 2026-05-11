/**
 * usage-aggregator.js
 * ---------------------------------------------------------------
 * Build the canonical "market intelligence" dataset from a set of
 * parsed usage rows. This is the same shape as
 * `src/data/market-intelligence.json` so we can keep all existing
 * surfaces (Market Intelligence, L'Oréal Analytics, HairGPT,
 * Investor Flywheel) working unchanged after a live import.
 */

const {
  parseNum,
  round2,
  monthLabel,
  sortableIndex,
  sortMonthLabels,
} = require("./usage-keys");

const SERVICE_TYPES = ["Color", "Highlights", "Toner", "Straightening", "Others"];

const SIZE_RANGES = [
  { label: "Solo (0-1)", min: 0, max: 1 },
  { label: "Small (2-5)", min: 2, max: 5 },
  { label: "Medium (6-10)", min: 6, max: 10 },
  { label: "Large (11-20)", min: 11, max: 20 },
  { label: "Enterprise (21+)", min: 21, max: Infinity },
  { label: "Unknown", min: -1, max: -1 },
];

function safeMonthKey(r) {
  return r.monthKey || monthLabel(r.month, r.year);
}

function safeSortIdx(r) {
  return r.sortIdx || sortableIndex(r.month, r.year);
}

function buildMonthlyTrends(rows) {
  const map = {};
  for (const r of rows) {
    const key = safeMonthKey(r);
    if (!map[key]) {
      map[key] = {
        label: key,
        year: r.year,
        monthNumber: r.monthNumber,
        sortIdx: safeSortIdx(r),
        totalVisits: 0,
        totalServices: 0,
        totalRevenue: 0,
        totalGrams: 0,
        activeBrands: new Set(),
        colorServices: 0,
        colorRevenue: 0,
        highlightsServices: 0,
        highlightsRevenue: 0,
        tonerServices: 0,
        tonerRevenue: 0,
        straighteningServices: 0,
        straighteningRevenue: 0,
        othersServices: 0,
        othersRevenue: 0,
        rowCount: 0,
      };
    }
    const m = map[key];
    m.totalVisits += r.totalVisits;
    m.totalServices += r.totalServices;
    m.totalRevenue += r.totalCost;
    m.totalGrams += r.totalGrams;
    m.rowCount += 1;
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
  return sortMonthLabels(Object.keys(map)).map((key) => {
    const m = map[key];
    return {
      label: m.label,
      year: m.year,
      monthNumber: m.monthNumber,
      totalVisits: Math.round(m.totalVisits),
      totalServices: Math.round(m.totalServices),
      totalRevenue: round2(m.totalRevenue),
      totalGrams: round2(m.totalGrams),
      activeBrands: m.activeBrands.size,
      salonBrandPairs: m.rowCount,
      colorServices: Math.round(m.colorServices),
      colorRevenue: round2(m.colorRevenue),
      highlightsServices: Math.round(m.highlightsServices),
      highlightsRevenue: round2(m.highlightsRevenue),
      tonerServices: Math.round(m.tonerServices),
      tonerRevenue: round2(m.tonerRevenue),
      straighteningServices: Math.round(m.straighteningServices),
      straighteningRevenue: round2(m.straighteningRevenue),
      othersServices: Math.round(m.othersServices),
      othersRevenue: round2(m.othersRevenue),
    };
  });
}

function buildBrandPerformance(rows) {
  const map = {};
  for (const r of rows) {
    if (!map[r.brand]) {
      map[r.brand] = {
        brand: r.brand,
        totalServices: 0,
        totalRevenue: 0,
        totalVisits: 0,
        totalGrams: 0,
        months: new Set(),
        rowCount: 0,
      };
    }
    const b = map[r.brand];
    b.totalServices += r.totalServices;
    b.totalRevenue += r.totalCost;
    b.totalVisits += r.totalVisits;
    b.totalGrams += r.totalGrams;
    b.months.add(safeMonthKey(r));
    b.rowCount += 1;
  }
  return Object.values(map)
    .map((b) => ({
      brand: b.brand,
      totalServices: Math.round(b.totalServices),
      totalRevenue: round2(b.totalRevenue),
      totalVisits: Math.round(b.totalVisits),
      totalGrams: round2(b.totalGrams),
      monthsActive: b.months.size,
      salonBrandPairs: b.rowCount,
    }))
    .sort((a, b) => b.totalServices - a.totalServices);
}

function buildBrandMonthly(rows) {
  const map = {};
  for (const r of rows) {
    const mk = safeMonthKey(r);
    const key = `${r.brand}||${mk}`;
    if (!map[key]) {
      map[key] = {
        brand: r.brand,
        month: mk,
        sortIdx: safeSortIdx(r),
        totalServices: 0,
        totalRevenue: 0,
        totalVisits: 0,
      };
    }
    const bm = map[key];
    bm.totalServices += r.totalServices;
    bm.totalRevenue += r.totalCost;
    bm.totalVisits += r.totalVisits;
  }
  return Object.values(map)
    .map((bm) => ({
      brand: bm.brand,
      month: bm.month,
      sortIdx: bm.sortIdx,
      totalServices: Math.round(bm.totalServices),
      totalRevenue: round2(bm.totalRevenue),
      totalVisits: Math.round(bm.totalVisits),
    }))
    .sort((a, b) => a.sortIdx - b.sortIdx || a.brand.localeCompare(b.brand));
}

function buildServiceBreakdown(rows) {
  return SERVICE_TYPES.map((type) => {
    const key = type.toLowerCase();
    let totalServices = 0;
    let totalRevenue = 0;
    let totalGrams = 0;
    for (const r of rows) {
      totalServices += r[`${key}Services`] || 0;
      totalRevenue += r[`${key}Cost`] || 0;
      totalGrams += r[`${key}Grams`] || 0;
    }
    return {
      type,
      totalServices: Math.round(totalServices),
      totalRevenue: round2(totalRevenue),
      totalGrams: round2(totalGrams),
    };
  });
}

function buildGeographicDistribution(rows) {
  const map = {};
  for (const r of rows) {
    const country = r.country === "null" || !r.country ? "Unknown" : r.country;
    if (!map[country]) {
      map[country] = {
        country,
        totalServices: 0,
        totalRevenue: 0,
        totalVisits: 0,
        rowCount: 0,
        cities: {},
      };
    }
    const g = map[country];
    g.totalServices += r.totalServices;
    g.totalRevenue += r.totalCost;
    g.totalVisits += r.totalVisits;
    g.rowCount += 1;

    const city = r.city === "null" || !r.city ? "Unknown" : r.city;
    if (!g.cities[city]) {
      g.cities[city] = { city, totalServices: 0, totalRevenue: 0, rowCount: 0 };
    }
    g.cities[city].totalServices += r.totalServices;
    g.cities[city].totalRevenue += r.totalCost;
    g.cities[city].rowCount += 1;
  }
  return Object.values(map)
    .map((g) => ({
      country: g.country,
      totalServices: Math.round(g.totalServices),
      totalRevenue: round2(g.totalRevenue),
      totalVisits: Math.round(g.totalVisits),
      salonBrandPairs: g.rowCount,
      topCities: Object.values(g.cities)
        .sort((a, b) => b.totalServices - a.totalServices)
        .slice(0, 10)
        .map((c) => ({
          city: c.city,
          totalServices: Math.round(c.totalServices),
          totalRevenue: round2(c.totalRevenue),
        })),
    }))
    .sort((a, b) => b.totalServices - a.totalServices);
}

function buildSalonSizeBenchmarks(rows) {
  return SIZE_RANGES.map((range) => {
    const filtered = rows.filter((r) => {
      if (range.label === "Unknown") return !r.employees || r.employees === 0;
      return r.employees >= range.min && r.employees <= range.max;
    });
    const count = filtered.length;
    return {
      label: range.label,
      count,
      avgServices:
        count > 0
          ? round2(filtered.reduce((s, r) => s + r.totalServices, 0) / count)
          : 0,
      avgRevenue:
        count > 0
          ? round2(filtered.reduce((s, r) => s + r.totalCost, 0) / count)
          : 0,
      avgVisits:
        count > 0
          ? round2(filtered.reduce((s, r) => s + r.totalVisits, 0) / count)
          : 0,
      totalServices: Math.round(filtered.reduce((s, r) => s + r.totalServices, 0)),
      totalRevenue: round2(filtered.reduce((s, r) => s + r.totalCost, 0)),
    };
  });
}

function buildPricingTrends(rows) {
  const map = {};
  for (const r of rows) {
    const key = safeMonthKey(r);
    if (!map[key]) {
      map[key] = {
        label: key,
        sortIdx: safeSortIdx(r),
        rootColorPrices: [],
        highlightsPrices: [],
        haircutPrices: [],
      };
    }
    const p = map[key];
    if (r.rootColorPrice > 0) p.rootColorPrices.push(r.rootColorPrice);
    if (r.highlightsPrice > 0) p.highlightsPrices.push(r.highlightsPrice);
    if (r.womenHaircutPrice > 0) p.haircutPrices.push(r.womenHaircutPrice);
  }
  const avg = (arr) =>
    arr.length > 0 ? round2(arr.reduce((s, v) => s + v, 0) / arr.length) : null;
  return sortMonthLabels(Object.keys(map)).map((key) => {
    const p = map[key];
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
}

function buildCustomerOverview(rows) {
  const map = {};
  for (const r of rows) {
    if (!r.userId) continue;
    if (!map[r.userId]) {
      map[r.userId] = {
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
    const c = map[r.userId];
    c.totalVisits += r.totalVisits;
    c.totalServices += r.totalServices;
    c.totalRevenue += r.totalCost;
    c.totalGrams += r.totalGrams;
    c.brands.add(r.brand);
    const mk = safeMonthKey(r);
    c.months.add(mk);
    c.colorServices += r.colorServices;
    c.highlightsServices += r.highlightsServices;
    c.tonerServices += r.tonerServices;
    c.straighteningServices += r.straighteningServices;
    c.othersServices += r.othersServices;
    const si = safeSortIdx(r);
    if (!c.firstMonth || si < c.firstMonth.si) c.firstMonth = { label: mk, si };
    if (!c.lastMonth || si > c.lastMonth.si) c.lastMonth = { label: mk, si };
    if (
      (c.country === "Unknown" || c.country === "null") &&
      r.country !== "Unknown" &&
      r.country !== "null"
    ) {
      c.country = r.country;
    }
    if (c.country !== "ISRAEL" && r.country === "ISRAEL") c.country = "ISRAEL";
    if (
      (c.city === "Unknown" || c.city === "null") &&
      r.city !== "Unknown" &&
      r.city !== "null"
    ) {
      c.city = r.city;
    }
    if (
      (c.salonType === "Unknown" || c.salonType === "null") &&
      r.salonType !== "Unknown" &&
      r.salonType !== "null"
    ) {
      c.salonType = r.salonType;
    }
    if (!c.employees && r.employees) c.employees = r.employees;
  }
  return Object.values(map)
    .map((c) => ({
      userId: c.userId,
      country: c.country,
      city: c.city,
      salonType: c.salonType,
      employees: c.employees,
      totalVisits: Math.round(c.totalVisits),
      totalServices: Math.round(c.totalServices),
      totalRevenue: round2(c.totalRevenue),
      totalGrams: round2(c.totalGrams),
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
}

function buildMonthlySnapshots(rows) {
  const map = {};
  for (const r of rows) {
    const mk = safeMonthKey(r);
    if (!map[mk]) {
      map[mk] = {
        label: mk,
        sortIdx: safeSortIdx(r),
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
    const snap = map[mk];
    snap.totals.visits += r.totalVisits;
    snap.totals.services += r.totalServices;
    snap.totals.revenue += r.totalCost;
    snap.totals.grams += r.totalGrams;
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

    if (!snap.brands[r.brand]) {
      snap.brands[r.brand] = {
        services: 0,
        revenue: 0,
        visits: 0,
        grams: 0,
        customerCount: 0,
      };
    }
    snap.brands[r.brand].services += r.totalServices;
    snap.brands[r.brand].revenue += r.totalCost;
    snap.brands[r.brand].visits += r.totalVisits;
    snap.brands[r.brand].grams += r.totalGrams;
    snap.brands[r.brand].customerCount += 1;

    if (r.userId) {
      if (!snap.customers[r.userId]) {
        snap.customers[r.userId] = {
          services: 0,
          revenue: 0,
          visits: 0,
          grams: 0,
          brands: [],
        };
      }
      snap.customers[r.userId].services += r.totalServices;
      snap.customers[r.userId].revenue += r.totalCost;
      snap.customers[r.userId].visits += r.totalVisits;
      snap.customers[r.userId].grams += r.totalGrams;
      snap.customers[r.userId].brands.push(r.brand);
    }
  }

  const out = {};
  for (const [mk, snap] of Object.entries(map)) {
    const roundObj = (o) => ({
      services: Math.round(o.services),
      revenue: round2(o.revenue),
      visits: Math.round(o.visits),
      grams: round2(o.grams),
    });
    const roundSvc = (o) => ({
      services: Math.round(o.services),
      revenue: round2(o.revenue),
      grams: round2(o.grams),
    });
    const brands = {};
    for (const [b, v] of Object.entries(snap.brands)) {
      brands[b] = { ...roundObj(v), customerCount: v.customerCount };
    }
    const customers = {};
    for (const [uid, v] of Object.entries(snap.customers)) {
      customers[uid] = {
        services: Math.round(v.services),
        revenue: round2(v.revenue),
        visits: Math.round(v.visits),
        grams: round2(v.grams),
        brandsUsed: [...new Set(v.brands)].length,
      };
    }
    out[mk] = {
      label: snap.label,
      sortIdx: snap.sortIdx,
      totals: roundObj(snap.totals),
      serviceTypes: {
        color: roundSvc(snap.serviceTypes.color),
        highlights: roundSvc(snap.serviceTypes.highlights),
        toner: roundSvc(snap.serviceTypes.toner),
        straightening: roundSvc(snap.serviceTypes.straightening),
        others: roundSvc(snap.serviceTypes.others),
      },
      brandCount: Object.keys(brands).length,
      customerCount: Object.keys(customers).length,
      brands,
      customers,
    };
  }
  return out;
}

function buildRawRows(rows) {
  return rows.map((r) => ({
    mk: safeMonthKey(r),
    si: safeSortIdx(r),
    uid: r.userId,
    co: r.country === "null" || !r.country ? "Unknown" : r.country,
    ci: r.city === "null" || !r.city ? "Unknown" : r.city,
    st: r.salonType,
    emp: r.employees,
    br: r.brand,
    vis: r.totalVisits,
    svc: Math.round(r.totalServices),
    cost: round2(r.totalCost),
    gr: round2(r.totalGrams),
    cs: Math.round(r.colorServices),
    cc: round2(r.colorCost),
    cg: round2(r.colorGrams),
    hs: Math.round(r.highlightsServices),
    hc: round2(r.highlightsCost),
    hg: round2(r.highlightsGrams),
    ts: Math.round(r.tonerServices),
    tc: round2(r.tonerCost),
    tg: round2(r.tonerGrams),
    ss: Math.round(r.straighteningServices),
    sc: round2(r.straighteningCost),
    sg: round2(r.straighteningGrams),
    os: Math.round(r.othersServices),
    oc: round2(r.othersCost),
    og: round2(r.othersGrams),
    rcp: r.rootColorPrice,
    hp: r.highlightsPrice,
    whp: r.womenHaircutPrice,
  }));
}

function buildFilterOptions(rows) {
  const months = new Set();
  const countries = new Set();
  const cities = new Set();
  const brands = new Set();
  for (const r of rows) {
    months.add(safeMonthKey(r));
    const country = r.country === "null" || !r.country ? "Unknown" : r.country;
    if (country !== "Unknown") countries.add(country);
    const city = r.city === "null" || !r.city ? "Unknown" : r.city;
    if (city !== "Unknown") cities.add(city);
    if (r.brand) brands.add(r.brand);
  }
  return {
    months: sortMonthLabels([...months]),
    countries: [...countries].sort(),
    cities: [...cities].sort(),
    brands: [...brands].sort(),
    serviceTypes: ["Color", "Highlights", "Toner", "Straightening", "Others"],
  };
}

function buildSummary(rows, customerOverview, monthlyTrends) {
  const allMonths = new Set();
  const allBrands = new Set();
  let visits = 0;
  let services = 0;
  let revenue = 0;
  let grams = 0;
  for (const r of rows) {
    allMonths.add(safeMonthKey(r));
    allBrands.add(r.brand);
    visits += r.totalVisits;
    services += r.totalServices;
    revenue += r.totalCost;
    grams += r.totalGrams;
  }
  return {
    totalRows: rows.length,
    totalMonths: allMonths.size,
    totalBrands: allBrands.size,
    totalCustomers: customerOverview.length,
    totalVisits: Math.round(visits),
    totalServices: Math.round(services),
    totalRevenue: round2(revenue),
    totalGrams: round2(grams),
    dateRange: {
      from: monthlyTrends.length > 0 ? monthlyTrends[0].label : "",
      to:
        monthlyTrends.length > 0
          ? monthlyTrends[monthlyTrends.length - 1].label
          : "",
    },
  };
}

/**
 * Build the canonical market-intelligence dataset.
 * `rows` should already be deduplicated.
 */
function buildDataset(rows, opts = {}) {
  const { fileCount = 1, generatedAt } = opts;
  const monthlyTrends = buildMonthlyTrends(rows);
  const brandPerformance = buildBrandPerformance(rows);
  const brandMonthly = buildBrandMonthly(rows);
  const serviceBreakdown = buildServiceBreakdown(rows);
  const geographicDistribution = buildGeographicDistribution(rows);
  const salonSizeBenchmarks = buildSalonSizeBenchmarks(rows);
  const pricingTrends = buildPricingTrends(rows);
  const customerOverview = buildCustomerOverview(rows);
  const monthlySnapshots = buildMonthlySnapshots(rows);
  const rawRows = buildRawRows(rows);
  const filterOptions = buildFilterOptions(rows);
  const summary = buildSummary(rows, customerOverview, monthlyTrends);

  return {
    _generated: generatedAt || new Date().toISOString(),
    _fileCount: fileCount,
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
    rawRows,
    filterOptions,
  };
}

/**
 * Build the phone -> mix-index lookup used by the Admin Dashboard.
 * Pulls totals from customerOverview + maps phones from rows that
 * carry a PhoneNumber.
 */
function buildPhoneMixIndex(rows, customerOverview) {
  const { normalizePhone } = require("../country-resolver");

  const byUserId = {};
  for (const c of customerOverview) {
    byUserId[c.userId] = {
      totalMixes: c.totalServices || 0,
      totalVisits: c.totalVisits || 0,
      totalGrams: c.totalGrams || 0,
      monthsActive: c.monthsActive || 0,
      firstMonth: c.firstMonth || "",
      lastMonth: c.lastMonth || "",
      brandsUsed: c.brandsUsed || 0,
      country: c.country || "",
      city: c.city || "",
    };
  }

  const phoneToUserId = {};
  for (const r of rows) {
    if (!r.userId || !r.phoneRaw) continue;
    const phone = normalizePhone(r.phoneRaw);
    if (!phone || phone.length < 7) continue;
    if (!phoneToUserId[phone]) phoneToUserId[phone] = r.userId;
  }

  const byPhone = {};
  for (const [phone, userId] of Object.entries(phoneToUserId)) {
    if (byUserId[userId]) {
      byPhone[phone] = { userId, ...byUserId[userId] };
    } else {
      byPhone[phone] = {
        userId,
        totalMixes: 0,
        totalVisits: 0,
        totalGrams: 0,
        monthsActive: 0,
        firstMonth: "",
        lastMonth: "",
        brandsUsed: 0,
        country: "",
        city: "",
      };
    }
  }

  return {
    _generated: new Date().toISOString(),
    _source: "usage-import (DB-backed)",
    totalMapped: Object.keys(byPhone).length,
    byPhone,
    byUserId,
  };
}

module.exports = {
  SERVICE_TYPES,
  buildDataset,
  buildMonthlyTrends,
  buildBrandPerformance,
  buildBrandMonthly,
  buildServiceBreakdown,
  buildGeographicDistribution,
  buildSalonSizeBenchmarks,
  buildPricingTrends,
  buildCustomerOverview,
  buildMonthlySnapshots,
  buildRawRows,
  buildFilterOptions,
  buildSummary,
  buildPhoneMixIndex,
};
