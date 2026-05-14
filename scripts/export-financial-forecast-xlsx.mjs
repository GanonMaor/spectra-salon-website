import fs from "node:fs";
import path from "node:path";
import ExcelJS from "exceljs";
import XLSX from "xlsx";

const FORECAST_MONTHS = 36;
const SALON_ID = "salon-look";
const DEFAULT_API_URL = "https://salonos.ai/.netlify/functions/financial-forecast";
const OUTPUT_PATH = "docs/spectra-financial-forecast-model.xlsx";
const SHORT_MO = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const CATEGORY_RND = "Research & Development";
const CATEGORY_MS = "Marketing & Sales";
const CATEGORY_OPS = "Operations";
const CATEGORY_MGMT = "Management";
const CATEGORY_ADMIN = "Accounting / Admin";
const DEFAULT_CATEGORIES = [CATEGORY_RND, CATEGORY_MS, CATEGORY_OPS, CATEGORY_MGMT, CATEGORY_ADMIN];

const LINE_CAMPAIGNS = "ms.campaigns";
const LINE_TRIPLE_BUNDLE = "ms.tripleBundle";
const LINE_VAT = "admin.vat";
const LINE_CEO = "mgmt.ceo";
const LINE_COO = "mgmt.coo";
const YEAR_2_START_MONTH = 12;
const YEAR_3_START_MONTH = 24;
const PROFILE_VERSION = 3;
const YEAR_3_GENERAL_SALARY_BUMP_LINE_IDS = new Set([
  "rnd.achela",
  "ms.campaignMgr",
  "ops.support",
  "ops.installations",
]);

const DEFAULT_CAC_BY_MONTH = Array.from({ length: FORECAST_MONTHS }, () => 300);
const DEFAULT_ARPU_BY_MONTH = [
  68.75, 68.75, 68.75, 150, 150, 150,
  150, 150, 150, 180, 180, 180,
  200, 200, 200, 200, 200, 200,
  280, 280, 280, 280, 280, 280,
  280, 280, 280, 280, 280, 280,
  280, 280, 280, 280, 280, 280,
];
const DEFAULT_CAMPAIGN_SPEND_BY_MONTH = [
  5000, 5000, 7500, 7500, 12000, 12000,
  12000, 12000, 12000, 12000, 12000, 12000,
  12000, 12000, 12000, 12000, 12000, 12000,
  15000, 15000, 15000, 15000, 15000, 15000,
  60000, 60000, 60000, 60000, 60000, 60000,
  90000, 90000, 90000, 90000, 90000, 90000,
];

const moneyFmt = "$#,##0;[Red]($#,##0);-";
const decimalFmt = "0.0";
const pctFmt = "0.0%";
const intFmt = "#,##0";
const creamFill = { patternType: "solid", fgColor: { rgb: "FAFAF8" } };
const goldFill = { patternType: "solid", fgColor: { rgb: "F7E6C8" } };
const formulaFill = { patternType: "solid", fgColor: { rgb: "F3F0E9" } };
const darkFill = { patternType: "solid", fgColor: { rgb: "1A1A1A" } };
const sectionFill = { patternType: "solid", fgColor: { rgb: "EAB776" } };
const softGoldFill = { patternType: "solid", fgColor: { rgb: "FFF6E8" } };
const subtitleFill = { patternType: "solid", fgColor: { rgb: "EFE7DC" } };
const border = {
  top: { style: "thin", color: { rgb: "E6DED2" } },
  bottom: { style: "thin", color: { rgb: "E6DED2" } },
  left: { style: "thin", color: { rgb: "E6DED2" } },
  right: { style: "thin", color: { rgb: "E6DED2" } },
};
const thickBottomBorder = {
  ...border,
  bottom: { style: "medium", color: { rgb: "B18059" } },
};

function getArg(name, fallback = null) {
  const idx = process.argv.indexOf(name);
  return idx === -1 ? fallback : process.argv[idx + 1] ?? fallback;
}

function hasFlag(name) {
  return process.argv.includes(name);
}

function buildMonthLabels() {
  const out = [];
  let y = 2026;
  let m = 5;
  for (let i = 0; i < FORECAST_MONTHS; i++) {
    out.push(`${SHORT_MO[m]} ${String(y).slice(2)}`);
    m += 1;
    if (m > 11) {
      m = 0;
      y += 1;
    }
  }
  return out;
}

const MONTH_LABELS = buildMonthLabels();

function emptyOverrideArr() {
  return Array.from({ length: FORECAST_MONTHS }, () => null);
}

function emptyOverrides(lines) {
  const expenseLines = {};
  for (const line of lines) expenseLines[line.id] = emptyOverrideArr();
  return {
    cac: emptyOverrideArr(),
    arpu: emptyOverrideArr(),
    campaignSpend: emptyOverrideArr(),
    churnPct: emptyOverrideArr(),
    expenseLines,
  };
}

function profileOverrideArr(values, fallback) {
  return Array.from({ length: FORECAST_MONTHS }, (_, i) => {
    const v = values[i] ?? fallback;
    return Number.isFinite(v) ? v : fallback;
  });
}

function buildDefaultExpenseLines() {
  return [
    { id: "rnd.achela",        category: CATEGORY_RND,   label: "Achela developer",            kind: "fixedUsd", amount: 9333, protected: true },
    { id: "rnd.it",            category: CATEGORY_RND,   label: "IT / servers",                kind: "fixedUsd", amount: 2000, protected: true },
    { id: "rnd.ai",            category: CATEGORY_RND,   label: "AI tools",                    kind: "fixedUsd", amount: 2000, protected: true },
    { id: LINE_CAMPAIGNS,      category: CATEGORY_MS,    label: "Campaigns",                   kind: "linkedCampaigns", amount: 0, protected: true },
    { id: "ms.campaignMgr",    category: CATEGORY_MS,    label: "Campaign manager",            kind: "fixedUsd", amount: 1500, protected: true },
    { id: "ms.content",        category: CATEGORY_MS,    label: "Content creation",            kind: "fixedUsd", amount: 1500, protected: true },
    { id: LINE_TRIPLE_BUNDLE,  category: CATEGORY_MS,    label: "Triple Bundle equipment",     kind: "calculatedTripleBundle", amount: 70, protected: true },
    { id: "ops.support",       category: CATEGORY_OPS,   label: "Customer support - Yaar",     kind: "fixedUsd", amount: 4000, protected: true },
    { id: "ops.installations", category: CATEGORY_OPS,   label: "Online installation manager", kind: "fixedUsd", amount: 3333, protected: true },
    { id: LINE_CEO,            category: CATEGORY_MGMT,  label: "CEO - Maor",                  kind: "fixedUsd", amount: 5000, protected: true },
    { id: LINE_COO,            category: CATEGORY_MGMT,  label: "COO - Elad",                  kind: "fixedUsd", amount: 5000, protected: true },
    { id: "admin.bookkeeping", category: CATEGORY_ADMIN, label: "Bookkeeping",                 kind: "fixedUsd", amount: 1500, protected: true },
    { id: LINE_VAT,            category: CATEGORY_ADMIN, label: "VAT Israel",                  kind: "calculatedVat", amount: 0, protected: true },
    { id: "admin.misc",        category: CATEGORY_ADMIN, label: "Miscellaneous / equipment",   kind: "fixedUsd", amount: 1000, protected: true },
  ];
}

function buildExpenseLineProfileOverride(line) {
  if (line.id === LINE_CEO || line.id === LINE_COO) {
    return Array.from({ length: FORECAST_MONTHS }, (_, i) => {
      if (i >= YEAR_3_START_MONTH) return 15000;
      if (i >= YEAR_2_START_MONTH) return 12000;
      return null;
    });
  }
  if (YEAR_3_GENERAL_SALARY_BUMP_LINE_IDS.has(line.id)) {
    const year3Salary = Number((line.amount * 1.25).toFixed(2));
    return Array.from({ length: FORECAST_MONTHS }, (_, i) => (i >= YEAR_3_START_MONTH ? year3Salary : null));
  }
  return null;
}

function withDefaultExpenseLineProfiles(overrides, expenseLines) {
  const nextExpenseOverrides = { ...overrides.expenseLines };
  for (const line of expenseLines) {
    const profile = buildExpenseLineProfileOverride(line);
    if (profile) nextExpenseOverrides[line.id] = profile;
  }
  return { ...overrides, expenseLines: nextExpenseOverrides };
}

function buildDefaultState() {
  const business = {
    startingSubscribers: 160,
    currentMrrUsd: 11000,
    churnRatePct: 3,
    israeliCustomers: 70,
    vatPct: 10,
  };
  const growth = { defaultCac: 300, defaultCampaignSpend: 5000 };
  const revenue = { defaultArpu: 68.75 };
  const expenseLines = buildDefaultExpenseLines();
  let overrides = emptyOverrides(expenseLines);
  overrides.cac = profileOverrideArr(DEFAULT_CAC_BY_MONTH, growth.defaultCac);
  overrides.arpu = profileOverrideArr(DEFAULT_ARPU_BY_MONTH, revenue.defaultArpu);
  overrides.campaignSpend = profileOverrideArr(DEFAULT_CAMPAIGN_SPEND_BY_MONTH, growth.defaultCampaignSpend);
  overrides = withDefaultExpenseLineProfiles(overrides, expenseLines);
  return {
    business,
    growth,
    revenue,
    categories: [...DEFAULT_CATEGORIES],
    expenseLines,
    overrides,
    profileVersion: PROFILE_VERSION,
  };
}

function num(v, fallback) {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : fallback;
}

function str(v, fallback) {
  return typeof v === "string" && v.length > 0 ? v : fallback;
}

function readOverrideArr(v) {
  const out = emptyOverrideArr();
  if (!Array.isArray(v)) return out;
  for (let i = 0; i < Math.min(v.length, FORECAST_MONTHS); i++) {
    const x = v[i];
    if (typeof x === "number" && Number.isFinite(x)) out[i] = x;
  }
  return out;
}

function migrateToCurrentProfile(state) {
  if ((state.profileVersion ?? 0) >= PROFILE_VERSION) return state;
  const cacFallback = Number.isFinite(state.growth.defaultCac) ? state.growth.defaultCac : 300;
  const arpuFallback = Number.isFinite(state.revenue.defaultArpu) ? state.revenue.defaultArpu : 68.75;
  const campaignFallback = Number.isFinite(state.growth.defaultCampaignSpend) ? state.growth.defaultCampaignSpend : 5000;
  return {
    ...state,
    growth: { ...state.growth, defaultCac: 300, defaultCampaignSpend: 5000 },
    revenue: { ...state.revenue, defaultArpu: 68.75 },
    overrides: withDefaultExpenseLineProfiles(
      {
        ...state.overrides,
        cac: profileOverrideArr(DEFAULT_CAC_BY_MONTH, cacFallback),
        arpu: profileOverrideArr(DEFAULT_ARPU_BY_MONTH, arpuFallback),
        campaignSpend: profileOverrideArr(DEFAULT_CAMPAIGN_SPEND_BY_MONTH, campaignFallback),
      },
      state.expenseLines,
    ),
    profileVersion: PROFILE_VERSION,
  };
}

function parseState(raw) {
  if (!raw || typeof raw !== "object") return null;
  try {
    const def = buildDefaultState();
    const businessRaw = raw.business || {};
    const growthRaw = raw.growth || {};
    const revenueRaw = raw.revenue || {};
    const business = {
      startingSubscribers: Math.max(0, num(businessRaw.startingSubscribers, def.business.startingSubscribers)),
      currentMrrUsd: Math.max(0, num(businessRaw.currentMrrUsd, def.business.currentMrrUsd)),
      churnRatePct: Math.max(0, num(businessRaw.churnRatePct, def.business.churnRatePct)),
      israeliCustomers: Math.max(0, num(businessRaw.israeliCustomers, def.business.israeliCustomers)),
      vatPct: Math.max(0, num(businessRaw.vatPct, def.business.vatPct)),
    };
    const growth = {
      defaultCac: Math.max(1, num(growthRaw.defaultCac, def.growth.defaultCac)),
      defaultCampaignSpend: Math.max(0, num(growthRaw.defaultCampaignSpend, def.growth.defaultCampaignSpend)),
    };
    const revenue = { defaultArpu: Math.max(0, num(revenueRaw.defaultArpu, def.revenue.defaultArpu)) };

    let categories = def.categories;
    if (Array.isArray(raw.categories)) {
      const seen = new Set();
      const out = [];
      for (const c of raw.categories) {
        const s = str(c, "");
        if (s && !seen.has(s)) {
          seen.add(s);
          out.push(s);
        }
      }
      if (out.length > 0) categories = out;
    }

    let expenseLines = def.expenseLines;
    if (Array.isArray(raw.expenseLines)) {
      const protectedTpl = new Map();
      for (const line of def.expenseLines) protectedTpl.set(line.id, line);
      const validKinds = new Set(["fixedUsd", "linkedCampaigns", "calculatedTripleBundle", "calculatedVat"]);
      const out = [];
      const seenIds = new Set();
      for (const rawLine of raw.expenseLines) {
        if (!rawLine || typeof rawLine !== "object") continue;
        const id = str(rawLine.id, `line-${Math.random().toString(36).slice(2, 8)}`);
        if (seenIds.has(id)) continue;
        seenIds.add(id);
        const tpl = protectedTpl.get(id);
        if (tpl) {
          out.push({ ...tpl, amount: num(rawLine.amount, tpl.amount) });
          protectedTpl.delete(id);
          continue;
        }
        const rawKind = str(rawLine.kind, "fixedUsd");
        const kind = validKinds.has(rawKind) ? rawKind : "fixedUsd";
        out.push({
          id,
          category: str(rawLine.category, categories[0]),
          label: str(rawLine.label, "Line"),
          kind,
          amount: num(rawLine.amount, 0),
          protected: false,
        });
      }
      for (const remaining of protectedTpl.values()) out.push(remaining);
      if (out.length > 0) expenseLines = out;
    }

    const inCats = new Set(categories);
    for (const line of expenseLines) {
      if (!inCats.has(line.category)) {
        categories = [...categories, line.category];
        inCats.add(line.category);
      }
    }

    const overridesRaw = raw.overrides || {};
    const expenseOverridesRaw = overridesRaw.expenseLines || {};
    const expenseOverrides = {};
    for (const line of expenseLines) expenseOverrides[line.id] = readOverrideArr(expenseOverridesRaw[line.id]);

    return migrateToCurrentProfile({
      business,
      growth,
      revenue,
      categories,
      expenseLines,
      overrides: {
        cac: readOverrideArr(overridesRaw.cac),
        arpu: readOverrideArr(overridesRaw.arpu),
        campaignSpend: readOverrideArr(overridesRaw.campaignSpend),
        churnPct: readOverrideArr(overridesRaw.churnPct),
        expenseLines: expenseOverrides,
      },
      profileVersion: typeof raw.profileVersion === "number" ? raw.profileVersion : 0,
    });
  } catch {
    return null;
  }
}

function effective(arr, fallback, i) {
  const v = arr?.[i];
  return v === null || v === undefined ? fallback : v;
}

function computeForecast(state) {
  const months = FORECAST_MONTHS;
  const cac = new Array(months).fill(0);
  const arpu = new Array(months).fill(0);
  const campaignSpend = new Array(months).fill(0);
  const marketingAcquisitionSpend = new Array(months).fill(0);
  const churnPct = new Array(months).fill(0);
  const subscribersStart = new Array(months).fill(0);
  const newSubscribers = new Array(months).fill(0);
  const churnedSubscribers = new Array(months).fill(0);
  const subscribersEnd = new Array(months).fill(0);
  const revenue = new Array(months).fill(0);
  const arr = new Array(months).fill(0);
  const expensesByLine = {};
  for (const line of state.expenseLines) expensesByLine[line.id] = new Array(months).fill(0);
  const expensesByCategory = {};
  for (const category of state.categories) expensesByCategory[category] = new Array(months).fill(0);
  const totalExpenses = new Array(months).fill(0);
  const ebitda = new Array(months).fill(0);
  const mAndSFixedLines = state.expenseLines.filter((line) => line.category === CATEGORY_MS && line.kind === "fixedUsd");

  for (let i = 0; i < months; i++) {
    cac[i] = Math.max(1, effective(state.overrides.cac, state.growth.defaultCac, i));
    arpu[i] = Math.max(0, effective(state.overrides.arpu, state.revenue.defaultArpu, i));
    campaignSpend[i] = Math.max(0, effective(state.overrides.campaignSpend, state.growth.defaultCampaignSpend, i));
    churnPct[i] = Math.max(0, effective(state.overrides.churnPct, state.business.churnRatePct, i)) / 100;
    let acquisitionSpend = campaignSpend[i];
    for (const line of mAndSFixedLines) {
      const native = effective(state.overrides.expenseLines[line.id] ?? [], line.amount, i);
      acquisitionSpend += Math.max(0, native);
    }
    marketingAcquisitionSpend[i] = acquisitionSpend;
    subscribersStart[i] = i === 0 ? state.business.startingSubscribers : subscribersEnd[i - 1];
    newSubscribers[i] = cac[i] > 0 ? acquisitionSpend / cac[i] : 0;
    churnedSubscribers[i] = subscribersStart[i] * churnPct[i];
    subscribersEnd[i] = subscribersStart[i] + newSubscribers[i] - churnedSubscribers[i];
    revenue[i] = subscribersEnd[i] * arpu[i];
    arr[i] = revenue[i] * 12;

    for (const line of state.expenseLines) {
      let usd = 0;
      const native = effective(state.overrides.expenseLines[line.id] ?? [], line.amount, i);
      if (line.kind === "fixedUsd") usd = Math.max(0, native);
      else if (line.kind === "linkedCampaigns") usd = campaignSpend[i];
      else if (line.kind === "calculatedTripleBundle") usd = Math.max(0, newSubscribers[i] * native);
      else if (line.kind === "calculatedVat") usd = Math.max(0, state.business.israeliCustomers * arpu[i] * (native || state.business.vatPct) / 100);
      expensesByLine[line.id][i] = usd;
      if (expensesByCategory[line.category]) expensesByCategory[line.category][i] += usd;
      totalExpenses[i] += usd;
    }
    ebitda[i] = revenue[i] - totalExpenses[i];
  }

  return {
    cac,
    arpu,
    campaignSpend,
    marketingAcquisitionSpend,
    churnPct,
    subscribersStart,
    newSubscribers,
    churnedSubscribers,
    subscribersEnd,
    revenue,
    arr,
    expensesByLine,
    expensesByCategory,
    totalExpenses,
    ebitda,
  };
}

async function loadState() {
  const inputJson = getArg("--input-json");
  const allowDefaults = hasFlag("--allow-defaults");
  if (inputJson) {
    const raw = JSON.parse(fs.readFileSync(path.resolve(inputJson), "utf8"));
    const parsed = parseState(raw.state ?? raw);
    if (!parsed) throw new Error(`Could not parse state from ${inputJson}`);
    return { state: parsed, source: inputJson, persisted: false };
  }

  const apiUrl = getArg("--api-url", process.env.FORECAST_API_URL || DEFAULT_API_URL);
  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: { Accept: "application/json", "x-salon-id": SALON_ID },
    });
    if (!response.ok) throw new Error(`GET ${apiUrl} returned ${response.status}`);
    const data = await response.json();
    const parsed = parseState(data?.state);
    if (!parsed) throw new Error(`GET ${apiUrl} did not return a persisted forecast state`);
    return { state: parsed, source: apiUrl, persisted: Boolean(data?.persisted), updatedAt: data?.updated_at };
  } catch (error) {
    if (!allowDefaults) throw error;
    return { state: buildDefaultState(), source: "built-in defaults", persisted: false, warning: error.message };
  }
}

function sheetRef(sheetName, cell) {
  return `'${sheetName}'!${cell}`;
}

function col(n) {
  return XLSX.utils.encode_col(n);
}

function cellAddress(row, column) {
  return `${col(column)}${row}`;
}

function safeSheetName(name) {
  return name.replace(/[':*?/\\[\]]/g, " ").slice(0, 31);
}

function ensureCell(ws, r, c) {
  const addr = cellAddress(r, c);
  if (!ws[addr]) ws[addr] = { t: "s", v: "" };
  return ws[addr];
}

function setCell(ws, r, c, value, opts = {}) {
  const addr = cellAddress(r, c);
  const cell = {};
  if (opts.formula) cell.f = opts.formula;
  if (typeof value === "number") {
    cell.t = "n";
    cell.v = value;
  } else if (value instanceof Date) {
    cell.t = "d";
    cell.v = value;
  } else if (value === null || value === undefined) {
    cell.t = "s";
    cell.v = "";
  } else {
    cell.t = "s";
    cell.v = String(value);
  }
  if (opts.z) cell.z = opts.z;
  if (opts.s) cell.s = opts.s;
  if (opts.c) cell.c = Array.isArray(opts.c) ? opts.c : [{ t: String(opts.c) }];
  ws[addr] = cell;
}

function styleRange(ws, range, style) {
  const decoded = XLSX.utils.decode_range(range);
  for (let r = decoded.s.r; r <= decoded.e.r; r++) {
    for (let c = decoded.s.c; c <= decoded.e.c; c++) {
      const cell = ensureCell(ws, r + 1, c);
      cell.s = { ...(cell.s || {}), ...style };
    }
  }
}

function createSheet() {
  return {};
}

function finishSheet(ws, maxRow, maxCol) {
  ws["!ref"] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: maxRow - 1, c: maxCol - 1 } });
  return ws;
}

function noteForLine(line) {
  if (line.kind === "linkedCampaigns") return "Mirrors Monthly Growth Assumptions: Campaign Spend.";
  if (line.kind === "calculatedTripleBundle") return "Unit cost multiplied by New Subscribers.";
  if (line.kind === "calculatedVat") return "Rate multiplied by Israeli Customers and ARPU.";
  return "Fixed monthly USD amount.";
}

function nativeMonthlyValue(state, line, monthIdx, campaignSpend) {
  if (line.kind === "linkedCampaigns") return campaignSpend;
  if (line.kind === "calculatedVat") {
    const override = state.overrides.expenseLines[line.id]?.[monthIdx];
    return (override === null || override === undefined ? state.business.vatPct : override) / 100;
  }
  return effective(state.overrides.expenseLines[line.id] ?? [], line.amount, monthIdx);
}

function valueStyle(kind = "input") {
  const fill = kind === "formula" ? formulaFill : goldFill;
  return {
    fill,
    border,
    font: { sz: 12, color: { rgb: "1A1A1A" } },
    alignment: { horizontal: "right", vertical: "center" },
  };
}

function headerStyle() {
  return {
    fill: darkFill,
    font: { color: { rgb: "FFFFFF" }, bold: true, sz: 12 },
    alignment: { horizontal: "center", vertical: "center", wrapText: true },
    border,
  };
}

function sectionStyle() {
  return {
    fill: sectionFill,
    font: { color: { rgb: "1A1A1A" }, bold: true, sz: 14 },
    alignment: { horizontal: "left", vertical: "center" },
    border: thickBottomBorder,
  };
}

function titleStyle() {
  return {
    fill: darkFill,
    font: { color: { rgb: "FFFFFF" }, bold: true, sz: 22 },
    alignment: { horizontal: "left", vertical: "center" },
  };
}

function subtitleStyle() {
  return {
    fill: subtitleFill,
    font: { color: { rgb: "5F5145" }, sz: 12 },
    alignment: { horizontal: "left", vertical: "center", wrapText: true },
  };
}

function labelStyle() {
  return {
    fill: creamFill,
    font: { color: { rgb: "5F5145" }, bold: true, sz: 12 },
    alignment: { horizontal: "left", vertical: "center" },
    border,
  };
}

function textStyle() {
  return {
    font: { color: { rgb: "5F5145" }, sz: 11 },
    alignment: { vertical: "center", wrapText: true },
    border,
  };
}

function outputStyle() {
  return {
    fill: softGoldFill,
    font: { color: { rgb: "1A1A1A" }, bold: true, sz: 12 },
    alignment: { horizontal: "right", vertical: "center" },
    border,
  };
}

function yearBandStyle(rgb) {
  return {
    fill: { patternType: "solid", fgColor: { rgb } },
    font: { color: { rgb: "1A1A1A" }, bold: true, sz: 13 },
    alignment: { horizontal: "center", vertical: "center" },
    border: thickBottomBorder,
  };
}

function addYearBands(ws, row, monthStartCol, totalCol) {
  const bands = [
    { label: "Year 1", startMonth: 0, endMonth: 11, color: "F7E6C8" },
    { label: "Year 2", startMonth: 12, endMonth: 23, color: "EFD2A6" },
    { label: "Year 3", startMonth: 24, endMonth: 35, color: "DDB07A" },
  ];
  ws["!merges"] = ws["!merges"] || [];
  setCell(ws, row, 0, "Forecast Period", { s: yearBandStyle("EFE7DC") });
  setCell(ws, row, 1, "36-month model", { s: yearBandStyle("EFE7DC") });
  for (const band of bands) {
    const startCol = monthStartCol + band.startMonth;
    const endCol = monthStartCol + band.endMonth;
    ws["!merges"].push({ s: { r: row - 1, c: startCol }, e: { r: row - 1, c: endCol } });
    for (let c = startCol; c <= endCol; c++) {
      setCell(ws, row, c, c === startCol ? band.label : "", { s: yearBandStyle(band.color) });
    }
  }
  setCell(ws, row, totalCol, "Total / Ending", { s: yearBandStyle("B18059") });
}

function buildAssumptionsSheet(state, forecast, sourceInfo) {
  const ws = createSheet();
  const expenseValueRows = new Map();

  setCell(ws, 1, 0, "Spectra Financial Forecast Model", { s: titleStyle() });
  setCell(ws, 1, 1, "Assumptions Sheet", { s: titleStyle() });
  setCell(ws, 2, 0, "How to use", { s: subtitleStyle() });
  setCell(ws, 2, 1, "Edit the warm gold cells only. Gray cells are formulas or linked values. The Forecast and Summary sheets update from these assumptions.", { s: subtitleStyle() });
  setCell(ws, 3, 0, "Generated from", { s: labelStyle() });
  setCell(ws, 3, 1, sourceInfo.source, { s: textStyle() });
  setCell(ws, 4, 0, "Updated at", { s: labelStyle() });
  setCell(ws, 4, 1, sourceInfo.updatedAt || new Date().toISOString(), { s: textStyle() });

  setCell(ws, 6, 0, "Business Base", { s: sectionStyle() });
  setCell(ws, 7, 0, "Metric", { s: headerStyle() });
  setCell(ws, 7, 1, "Value", { s: headerStyle() });
  setCell(ws, 7, 2, "Notes", { s: headerStyle() });
  const businessRows = [
    ["Starting Subscribers", state.business.startingSubscribers, "Editable input used by first forecast month.", intFmt],
    ["Current MRR", state.business.currentMrrUsd, "Current monthly recurring revenue in USD.", moneyFmt],
    ["Starting ARPU", state.business.currentMrrUsd / Math.max(1, state.business.startingSubscribers), "Formula: Current MRR / Starting Subscribers.", moneyFmt, "B9/B8"],
    ["Israeli Customers", state.business.israeliCustomers, "Used by VAT Israel calculated row.", intFmt],
    ["VAT %", state.business.vatPct / 100, "Stored as a real Excel percentage.", pctFmt],
    ["Forecast Start Month", MONTH_LABELS[0], "First model month."],
    ["Forecast Months", FORECAST_MONTHS, "36-month forecast horizon.", intFmt],
  ];
  businessRows.forEach((row, idx) => {
    const r = 8 + idx;
    setCell(ws, r, 0, row[0], { s: labelStyle() });
    setCell(ws, r, 1, row[1], { z: row[3], formula: row[4], s: valueStyle(row[4] ? "formula" : "input") });
    setCell(ws, r, 2, row[2], { s: textStyle() });
  });

  const growthStart = 18;
  setCell(ws, growthStart, 0, "Monthly Growth Assumptions", { s: sectionStyle() });
  setCell(ws, growthStart, 1, "CAC, ARPU, churn and campaign spend by month", { s: sectionStyle() });
  ["Month", "CAC", "ARPU", "Churn %", "Campaign Spend"].forEach((h, i) => setCell(ws, growthStart + 1, i, h, { s: headerStyle() }));
  for (let i = 0; i < FORECAST_MONTHS; i++) {
    const r = growthStart + 2 + i;
    setCell(ws, r, 0, MONTH_LABELS[i], { s: labelStyle() });
    setCell(ws, r, 1, forecast.cac[i], { z: moneyFmt, s: valueStyle() });
    setCell(ws, r, 2, forecast.arpu[i], { z: moneyFmt, s: valueStyle() });
    setCell(ws, r, 3, forecast.churnPct[i], { z: pctFmt, s: valueStyle() });
    setCell(ws, r, 4, forecast.campaignSpend[i], { z: moneyFmt, s: valueStyle() });
  }

  const expenseStart = growthStart + 2 + FORECAST_MONTHS + 3;
  setCell(ws, expenseStart, 0, "Expense Assumptions", { s: sectionStyle() });
  setCell(ws, expenseStart, 1, "Catalog of expense lines and how each line is calculated", { s: sectionStyle() });
  ["Line ID", "Category", "Expense Line", "Type", "Base / Unit", "Notes"].forEach((h, i) => setCell(ws, expenseStart + 1, i, h, { s: headerStyle() }));
  state.expenseLines.forEach((line, idx) => {
    const r = expenseStart + 2 + idx;
    setCell(ws, r, 0, line.id, { s: textStyle() });
    setCell(ws, r, 1, line.category, { s: labelStyle() });
    setCell(ws, r, 2, line.label, { s: textStyle() });
    setCell(ws, r, 3, line.kind, { s: textStyle() });
    setCell(ws, r, 4, line.kind === "calculatedVat" ? state.business.vatPct / 100 : line.amount, {
      z: line.kind === "calculatedVat" ? pctFmt : moneyFmt,
      s: valueStyle(),
    });
    setCell(ws, r, 5, noteForLine(line), { s: textStyle() });
  });

  const matrixStart = expenseStart + 2 + state.expenseLines.length + 3;
  setCell(ws, matrixStart, 0, "Expense Monthly Values", { s: sectionStyle() });
  setCell(ws, matrixStart, 1, "Monthly editable expense matrix used by the Forecast sheet", { s: sectionStyle() });
  setCell(ws, matrixStart + 1, 0, "Line ID", { s: headerStyle() });
  setCell(ws, matrixStart + 1, 1, "Expense Line", { s: headerStyle() });
  for (let i = 0; i < FORECAST_MONTHS; i++) setCell(ws, matrixStart + 1, 2 + i, MONTH_LABELS[i], { s: headerStyle() });

  state.expenseLines.forEach((line, lineIdx) => {
    const r = matrixStart + 2 + lineIdx;
    expenseValueRows.set(line.id, r);
    setCell(ws, r, 0, line.id, { s: textStyle() });
    setCell(ws, r, 1, line.label, { s: labelStyle() });
    for (let i = 0; i < FORECAST_MONTHS; i++) {
      const c = 2 + i;
      const growthCampaignCell = cellAddress(growthStart + 2 + i, 4);
      const value = nativeMonthlyValue(state, line, i, forecast.campaignSpend[i]);
      const formula = line.kind === "linkedCampaigns" ? growthCampaignCell : undefined;
      setCell(ws, r, c, value, {
        formula,
        z: line.kind === "calculatedVat" ? pctFmt : moneyFmt,
        s: valueStyle(formula ? "formula" : "input"),
      });
    }
  });

  ws["!cols"] = [
    { wch: 26 }, { wch: 34 }, { wch: 42 }, { wch: 22 }, { wch: 18 }, { wch: 58 },
    ...Array.from({ length: FORECAST_MONTHS }, () => ({ wch: 14 })),
  ];
  ws["!freeze"] = { xSplit: 2, ySplit: growthStart + 1 };
  ws["!autofilter"] = { ref: `A${expenseStart + 1}:F${expenseStart + 1 + state.expenseLines.length}` };
  styleRange(ws, `A${growthStart + 2}:E${growthStart + 1 + FORECAST_MONTHS}`, { border });
  styleRange(ws, `A${matrixStart + 2}:${col(1 + FORECAST_MONTHS)}${matrixStart + 1 + state.expenseLines.length}`, { border });
  ws["!rows"] = ws["!rows"] || [];
  ws["!rows"][0] = { hpt: 30 };
  ws["!rows"][1] = { hpt: 42 };
  ws["!rows"][growthStart - 1] = { hpt: 24 };
  ws["!rows"][expenseStart - 1] = { hpt: 24 };
  ws["!rows"][matrixStart - 1] = { hpt: 24 };
  return { ws: finishSheet(ws, matrixStart + 1 + state.expenseLines.length, Math.max(6, 2 + FORECAST_MONTHS)), refs: { growthStart, expenseValueRows } };
}

function totalFormula(row, startCol, endCol) {
  return `SUM(${cellAddress(row, startCol)}:${cellAddress(row, endCol)})`;
}

function buildForecastSheet(state, forecast, assumptionRefs) {
  const ws = createSheet();
  const rowMap = {};
  const expenseRows = [];
  const monthStartCol = 2;
  const totalCol = monthStartCol + FORECAST_MONTHS;
  let r = 1;

  Object.assign(rowMap, {
    "Subscribers Start": 4,
    "New Subscribers": 5,
    "Churned Subscribers": 6,
    "Subscribers End": 7,
    "CAC": 8,
    "ARPU": 9,
    "Churn %": 10,
    "Campaign Spend": 11,
    "Marketing Acquisition Spend": 12,
    "MRR": 13,
    "ARR": 14,
  });

  setCell(ws, r, 0, "Formula-driven Monthly Forecast", { s: titleStyle() });
  setCell(ws, r, 1, "All rows pull from Assumptions. Do not edit forecast cells directly.", { s: titleStyle() });
  r += 1;
  addYearBands(ws, r, monthStartCol, totalCol);
  r += 1;
  setCell(ws, r, 0, "Category", { s: headerStyle() });
  setCell(ws, r, 1, "Row", { s: headerStyle() });
  for (let i = 0; i < FORECAST_MONTHS; i++) setCell(ws, r, monthStartCol + i, MONTH_LABELS[i], { s: headerStyle() });
  setCell(ws, r, totalCol, "Total / Ending", { s: headerStyle() });

  function addRow(category, label, options = {}) {
    r += 1;
    rowMap[label] = r;
    setCell(ws, r, 0, category, { s: labelStyle() });
    setCell(ws, r, 1, label, { s: labelStyle() });
    for (let i = 0; i < FORECAST_MONTHS; i++) {
      const c = monthStartCol + i;
      const value = options.values?.[i] ?? 0;
      const formula = options.formula?.(i, c, r);
      setCell(ws, r, c, value, { formula, z: options.z, s: valueStyle(formula ? "formula" : "input") });
    }
    const totalValue = options.totalValue ?? (options.ending ? options.values?.[FORECAST_MONTHS - 1] : options.values?.reduce((s, v) => s + (Number.isFinite(v) ? v : 0), 0));
    const totalFormulaValue = options.totalFormula || (options.ending ? cellAddress(r, totalCol - 1) : totalFormula(r, monthStartCol, totalCol - 1));
    setCell(ws, r, totalCol, totalValue ?? 0, { formula: totalFormulaValue, z: options.z, s: outputStyle() });
    return r;
  }

  const ass = (cell) => sheetRef("Assumptions", cell);
  const growthRow = (i) => assumptionRefs.growthStart + 2 + i;
  const expenseValueCell = (lineId, i) => ass(cellAddress(assumptionRefs.expenseValueRows.get(lineId), 2 + i));

  addRow("Subscribers", "Subscribers Start", {
    values: forecast.subscribersStart,
    z: decimalFmt,
    ending: true,
    formula: (i) => i === 0 ? ass("B8") : cellAddress(rowMap["Subscribers End"], monthStartCol + i - 1),
  });
  addRow("Subscribers", "New Subscribers", {
    values: forecast.newSubscribers,
    z: decimalFmt,
    formula: (i) => `${cellAddress(rowMap["Marketing Acquisition Spend"], monthStartCol + i)}/${cellAddress(rowMap["CAC"], monthStartCol + i)}`,
  });
  addRow("Subscribers", "Churned Subscribers", {
    values: forecast.churnedSubscribers,
    z: decimalFmt,
    formula: (i) => `${cellAddress(rowMap["Subscribers Start"], monthStartCol + i)}*${cellAddress(rowMap["Churn %"], monthStartCol + i)}`,
  });
  addRow("Subscribers", "Subscribers End", {
    values: forecast.subscribersEnd,
    z: decimalFmt,
    ending: true,
    formula: (i) => `${cellAddress(rowMap["Subscribers Start"], monthStartCol + i)}+${cellAddress(rowMap["New Subscribers"], monthStartCol + i)}-${cellAddress(rowMap["Churned Subscribers"], monthStartCol + i)}`,
  });
  addRow("Growth Assumptions", "CAC", {
    values: forecast.cac,
    z: moneyFmt,
    ending: true,
    formula: (i) => ass(cellAddress(growthRow(i), 1)),
  });
  addRow("Growth Assumptions", "ARPU", {
    values: forecast.arpu,
    z: moneyFmt,
    ending: true,
    formula: (i) => ass(cellAddress(growthRow(i), 2)),
  });
  addRow("Growth Assumptions", "Churn %", {
    values: forecast.churnPct,
    z: pctFmt,
    ending: true,
    formula: (i) => ass(cellAddress(growthRow(i), 3)),
  });
  addRow("Growth Assumptions", "Campaign Spend", {
    values: forecast.campaignSpend,
    z: moneyFmt,
    formula: (i) => ass(cellAddress(growthRow(i), 4)),
  });

  const fixedMsLines = state.expenseLines.filter((line) => line.category === CATEGORY_MS && line.kind === "fixedUsd");
  addRow("Growth Assumptions", "Marketing Acquisition Spend", {
    values: forecast.marketingAcquisitionSpend,
    z: moneyFmt,
    formula: (i) => {
      const parts = [cellAddress(rowMap["Campaign Spend"], monthStartCol + i), ...fixedMsLines.map((line) => expenseValueCell(line.id, i))];
      return parts.join("+");
    },
  });
  addRow("Revenue", "MRR", {
    values: forecast.revenue,
    z: moneyFmt,
    ending: true,
    formula: (i) => `${cellAddress(rowMap["Subscribers End"], monthStartCol + i)}*${cellAddress(rowMap["ARPU"], monthStartCol + i)}`,
  });
  addRow("Revenue", "ARR", {
    values: forecast.arr,
    z: moneyFmt,
    ending: true,
    formula: (i) => `${cellAddress(rowMap["MRR"], monthStartCol + i)}*12`,
  });

  for (const category of state.categories) {
    r += 1;
    setCell(ws, r, 0, category, { s: sectionStyle() });
    setCell(ws, r, 1, "Expense category", { s: sectionStyle() });
    for (let i = 0; i <= FORECAST_MONTHS; i++) setCell(ws, r, monthStartCol + i, "", { s: sectionStyle() });
    const categoryHeaderRow = r;
    for (const line of state.expenseLines.filter((item) => item.category === category)) {
      r += 1;
      expenseRows.push(r);
      setCell(ws, r, 0, category, { s: labelStyle() });
      setCell(ws, r, 1, line.label, { s: textStyle() });
      for (let i = 0; i < FORECAST_MONTHS; i++) {
        const c = monthStartCol + i;
        let formula = expenseValueCell(line.id, i);
        if (line.kind === "linkedCampaigns") formula = cellAddress(rowMap["Campaign Spend"], c);
        if (line.kind === "calculatedTripleBundle") formula = `${cellAddress(rowMap["New Subscribers"], c)}*${expenseValueCell(line.id, i)}`;
        if (line.kind === "calculatedVat") formula = `${ass("B11")}*${cellAddress(rowMap["ARPU"], c)}*${expenseValueCell(line.id, i)}`;
        setCell(ws, r, c, forecast.expensesByLine[line.id]?.[i] ?? 0, { formula, z: moneyFmt, s: valueStyle("formula") });
      }
      setCell(ws, r, totalCol, (forecast.expensesByLine[line.id] ?? []).reduce((s, v) => s + v, 0), {
        formula: totalFormula(r, monthStartCol, totalCol - 1),
        z: moneyFmt,
        s: valueStyle("formula"),
      });
    }
    for (let row = categoryHeaderRow + 1; row <= r; row++) {
      ws["!rows"] = ws["!rows"] || [];
      ws["!rows"][row - 1] = { level: 1 };
    }
  }

  addRow("Expenses", "Total Expenses", {
    values: forecast.totalExpenses,
    z: moneyFmt,
    formula: (i) => expenseRows.map((row) => cellAddress(row, monthStartCol + i)).join("+"),
  });
  addRow("Profit", "EBITDA / Profit", {
    values: forecast.ebitda,
    z: moneyFmt,
    formula: (i) => `${cellAddress(rowMap["MRR"], monthStartCol + i)}-${cellAddress(rowMap["Total Expenses"], monthStartCol + i)}`,
  });
  const cumulativeValues = [];
  forecast.ebitda.reduce((running, value, i) => {
    cumulativeValues[i] = running + value;
    return cumulativeValues[i];
  }, 0);
  addRow("Profit", "Cumulative EBITDA", {
    values: cumulativeValues,
    z: moneyFmt,
    ending: true,
    formula: (i) => i === 0 ? cellAddress(rowMap["EBITDA / Profit"], monthStartCol + i) : `${cellAddress(rowMap["Cumulative EBITDA"], monthStartCol + i - 1)}+${cellAddress(rowMap["EBITDA / Profit"], monthStartCol + i)}`,
  });
  addRow("Cash", "Peak Cash Need", {
    values: cumulativeValues.map((v) => Math.abs(Math.min(0, v))),
    z: moneyFmt,
    ending: true,
    formula: (i) => `ABS(MIN(0,${cellAddress(rowMap["Cumulative EBITDA"], monthStartCol + i)}))`,
  });

  ws["!cols"] = [{ wch: 26 }, { wch: 30 }, ...Array.from({ length: FORECAST_MONTHS + 1 }, () => ({ wch: 14 }))];
  ws["!freeze"] = { xSplit: 2, ySplit: 3 };
  ws["!autofilter"] = { ref: `A3:${cellAddress(3, totalCol)}` };
  styleRange(ws, `A1:${cellAddress(1, totalCol)}`, titleStyle());
  styleRange(ws, `A3:${cellAddress(3, totalCol)}`, headerStyle());
  ws["!rows"] = ws["!rows"] || [];
  ws["!rows"][0] = { hpt: 32 };
  ws["!rows"][1] = { hpt: 24 };
  ws["!rows"][2] = { hpt: 26 };
  return { ws: finishSheet(ws, r, totalCol + 1), rowMap, cumulativeValues };
}

function buildSummarySheet(forecast, forecastInfo) {
  const ws = createSheet();
  setCell(ws, 1, 0, "Spectra Financial Forecast Summary", { s: titleStyle() });
  setCell(ws, 1, 1, "Investor-ready view", { s: titleStyle() });
  setCell(ws, 2, 0, "How to read this", { s: subtitleStyle() });
  setCell(ws, 2, 1, "These outputs reference the Forecast sheet formulas. Edit inputs only in Assumptions.", { s: subtitleStyle() });

  const f = (cell) => sheetRef("Forecast", cell);
  const monthStartCol = 2;
  const yearEnds = [11, 23, 35];
  setCell(ws, 4, 0, "Metric", { s: headerStyle() });
  ["Year 1", "Year 2", "Year 3"].forEach((label, idx) => setCell(ws, 4, 1 + idx, label, { s: headerStyle() }));

  const metrics = [
    ["Ending Subscribers", "Subscribers End", decimalFmt],
    ["New Subscribers", "New Subscribers", decimalFmt, "sum"],
    ["Ending MRR", "MRR", moneyFmt],
    ["Ending ARR", "ARR", moneyFmt],
    ["Total Revenue", "MRR", moneyFmt, "sum"],
    ["Total Expenses", "Total Expenses", moneyFmt, "sum"],
    ["EBITDA", "EBITDA / Profit", moneyFmt, "sum"],
  ];
  metrics.forEach((metric, idx) => {
    const row = 5 + idx;
    setCell(ws, row, 0, metric[0], { s: labelStyle() });
    yearEnds.forEach((endIdx, yearIdx) => {
      const startIdx = yearIdx * 12;
      const sourceRow = forecastInfo.rowMap[metric[1]];
      const formula = metric[3] === "sum"
        ? `SUM(${f(cellAddress(sourceRow, monthStartCol + startIdx))}:${f(cellAddress(sourceRow, monthStartCol + endIdx))})`
        : f(cellAddress(sourceRow, monthStartCol + endIdx));
      let value = 0;
      if (metric[1] === "Subscribers End") value = forecast.subscribersEnd[endIdx];
      if (metric[1] === "New Subscribers") value = forecast.newSubscribers.slice(startIdx, endIdx + 1).reduce((s, v) => s + v, 0);
      if (metric[1] === "MRR" && metric[3] !== "sum") value = forecast.revenue[endIdx];
      if (metric[1] === "ARR") value = forecast.arr[endIdx];
      if (metric[1] === "MRR" && metric[3] === "sum") value = forecast.revenue.slice(startIdx, endIdx + 1).reduce((s, v) => s + v, 0);
      if (metric[1] === "Total Expenses") value = forecast.totalExpenses.slice(startIdx, endIdx + 1).reduce((s, v) => s + v, 0);
      if (metric[1] === "EBITDA / Profit") value = forecast.ebitda.slice(startIdx, endIdx + 1).reduce((s, v) => s + v, 0);
      setCell(ws, row, 1 + yearIdx, value, { formula, z: metric[2], s: valueStyle("formula") });
    });
  });

  const cumulativeRow = forecastInfo.rowMap["Cumulative EBITDA"];
  const ebitdaRow = forecastInfo.rowMap["EBITDA / Profit"];
  const breakevenIdx = forecast.ebitda.findIndex((v) => v > 0);
  const peakCashNeed = Math.abs(Math.min(0, ...forecastInfo.cumulativeValues));
  setCell(ws, 14, 0, "Breakeven Month", { s: sectionStyle() });
  setCell(ws, 14, 1, breakevenIdx >= 0 ? MONTH_LABELS[breakevenIdx] : "Not reached", {
    formula: `IFERROR(INDEX(Forecast!$C$1:$AL$1,XMATCH(TRUE,Forecast!$C$${ebitdaRow}:$AL$${ebitdaRow}>0)),"Not reached")`,
    s: valueStyle("formula"),
  });
  setCell(ws, 15, 0, "Peak Cash Need", { s: sectionStyle() });
  setCell(ws, 15, 1, peakCashNeed, {
    formula: `ABS(MIN(0,MIN(Forecast!$C$${cumulativeRow}:$AL$${cumulativeRow})))`,
    z: moneyFmt,
    s: valueStyle("formula"),
  });

  setCell(ws, 18, 0, "Chart Data", { s: sectionStyle() });
  setCell(ws, 18, 1, "Use this block for ARR / MRR / Subscribers / EBITDA charts", { s: sectionStyle() });
  ["Month", "Subscribers", "MRR", "ARR", "EBITDA"].forEach((h, idx) => setCell(ws, 19, idx, h, { s: headerStyle() }));
  for (let i = 0; i < FORECAST_MONTHS; i++) {
    const row = 20 + i;
    setCell(ws, row, 0, MONTH_LABELS[i]);
    setCell(ws, row, 1, forecast.subscribersEnd[i], { formula: f(cellAddress(forecastInfo.rowMap["Subscribers End"], monthStartCol + i)), z: decimalFmt });
    setCell(ws, row, 2, forecast.revenue[i], { formula: f(cellAddress(forecastInfo.rowMap["MRR"], monthStartCol + i)), z: moneyFmt });
    setCell(ws, row, 3, forecast.arr[i], { formula: f(cellAddress(forecastInfo.rowMap["ARR"], monthStartCol + i)), z: moneyFmt });
    setCell(ws, row, 4, forecast.ebitda[i], { formula: f(cellAddress(forecastInfo.rowMap["EBITDA / Profit"], monthStartCol + i)), z: moneyFmt });
  }
  ws["!cols"] = [{ wch: 28 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];
  ws["!freeze"] = { xSplit: 1, ySplit: 4 };
  ws["!rows"] = ws["!rows"] || [];
  ws["!rows"][0] = { hpt: 32 };
  ws["!rows"][1] = { hpt: 40 };
  return finishSheet(ws, 19 + FORECAST_MONTHS, 5);
}

function buildWorkbook(state, sourceInfo) {
  const forecast = computeForecast(state);
  const wb = XLSX.utils.book_new();
  wb.Workbook = {
    ...(wb.Workbook || {}),
    CalcPr: { fullCalcOnLoad: "1", forceFullCalc: "1" },
    Views: [{ RTL: false }],
  };

  const assumptions = buildAssumptionsSheet(state, forecast, sourceInfo);
  const forecastInfo = buildForecastSheet(state, forecast, assumptions.refs);
  const summary = buildSummarySheet(forecast, forecastInfo);

  XLSX.utils.book_append_sheet(wb, summary, safeSheetName("Summary"));
  XLSX.utils.book_append_sheet(wb, assumptions.ws, safeSheetName("Assumptions"));
  XLSX.utils.book_append_sheet(wb, forecastInfo.ws, safeSheetName("Forecast"));
  return { wb, forecast, forecastInfo };
}

const excelTheme = {
  dark: "14110E",
  ink: "211C18",
  mutedInk: "75695D",
  cream: "FAF7F0",
  paper: "FFFCF7",
  champagne: "F4E8D7",
  champagne2: "E8D2B4",
  gold: "B98A58",
  goldDark: "8D6845",
  bronze: "6F5540",
  formula: "F5F1EA",
  input: "F8E6C8",
  revenue: "F3F7F1",
  expense: "FAF1EC",
  profit: "F5F0F7",
  cash: "F0F4F8",
  grid: "E3D8CA",
  white: "FFFFFF",
};

function argb(hex) {
  return `FF${hex}`;
}

function xlFill(hex) {
  return { type: "pattern", pattern: "solid", fgColor: { argb: argb(hex) } };
}

function xlFont({ color = excelTheme.ink, size = 11, bold = false, italic = false } = {}) {
  return { name: "Aptos", size, bold, italic, color: { argb: argb(color) } };
}

function xlBorder(color = excelTheme.grid, style = "thin") {
  return {
    top: { style, color: { argb: argb(color) } },
    left: { style, color: { argb: argb(color) } },
    bottom: { style, color: { argb: argb(color) } },
    right: { style, color: { argb: argb(color) } },
  };
}

function xlBottomBorder(color = excelTheme.grid, style = "thin") {
  return {
    top: { style: "hair", color: { argb: argb(color) } },
    left: { style: "hair", color: { argb: argb(color) } },
    bottom: { style, color: { argb: argb(color) } },
    right: { style: "hair", color: { argb: argb(color) } },
  };
}

function applyRect(ws, startRow, startCol, endRow, endCol, apply) {
  for (let row = startRow; row <= endRow; row += 1) {
    for (let colIdx = startCol; colIdx <= endCol; colIdx += 1) {
      apply(ws.getCell(row, colIdx), row, colIdx);
    }
  }
}

function styleUsedSheet(ws) {
  ws.properties.defaultRowHeight = 25;
  ws.eachRow({ includeEmpty: true }, (row) => {
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.font = xlFont({ size: 12 });
      cell.alignment = { vertical: "middle", wrapText: true };
      cell.border = xlBorder();
      cell.fill = xlFill(excelTheme.paper);
    });
  });
}

function styleBrandTitle(ws, title, subtitle, endCol) {
  ws.mergeCells(1, 1, 1, endCol);
  ws.getCell("A1").value = title;
  ws.getCell("A1").fill = xlFill(excelTheme.dark);
  ws.getCell("A1").font = xlFont({ color: excelTheme.white, size: 21, bold: true });
  ws.getCell("A1").alignment = { horizontal: "left", vertical: "middle" };
  ws.getRow(1).height = 38;

  ws.mergeCells(2, 1, 2, endCol);
  ws.getCell("A2").value = subtitle;
  ws.getCell("A2").fill = xlFill(excelTheme.cream);
  ws.getCell("A2").font = xlFont({ color: excelTheme.mutedInk, size: 13, italic: true });
  ws.getCell("A2").alignment = { horizontal: "left", vertical: "middle", wrapText: true };
  ws.getRow(2).height = 34;
}

function styleHeaderRow(ws, rowNumber, startCol, endCol) {
  applyRect(ws, rowNumber, startCol, rowNumber, endCol, (cell) => {
    cell.fill = xlFill(excelTheme.dark);
    cell.font = xlFont({ color: excelTheme.white, size: 11, bold: true });
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = xlBottomBorder(excelTheme.goldDark, "thin");
  });
  ws.getRow(rowNumber).height = 29;
}

function styleYearBand(ws, rowNumber, startCol, endCol, label, color) {
  applyRect(ws, rowNumber, startCol, rowNumber, endCol, (cell) => {
    cell.fill = xlFill(color);
    cell.font = xlFont({ color: excelTheme.ink, size: 13, bold: false });
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = {
      ...xlBottomBorder(excelTheme.goldDark, "thin"),
      bottom: { style: "thin", color: { argb: argb(excelTheme.goldDark) } },
    };
  });
  ws.getCell(rowNumber, startCol).value = label;
  ws.getCell(rowNumber, startCol).font = xlFont({ color: excelTheme.ink, size: 13, bold: true });
}

function styleForecastWorksheet(ws, forecastInfo) {
  const lastCol = 39;
  styleUsedSheet(ws);
  ws.views = [{ state: "frozen", xSplit: 2, ySplit: 3, showGridLines: false }];
  ws.properties.tabColor = { argb: argb(excelTheme.gold) };
  ws.autoFilter = { from: "A3", to: "AM3" };
  ws.columns = [
    { width: 28 },
    { width: 35 },
    ...Array.from({ length: 37 }, () => ({ width: 15.5 })),
  ];
  ws.mergeCells(1, 1, 1, lastCol);
  ws.getCell("A1").value = "SPECTRA | 36-Month Financial Forecast";
  ws.getCell("A1").fill = xlFill(excelTheme.dark);
  ws.getCell("A1").font = xlFont({ color: excelTheme.white, size: 21, bold: true });
  ws.getCell("A1").alignment = { horizontal: "left", vertical: "middle" };
  ws.getRow(1).height = 38;
  styleYearBand(ws, 2, 1, 2, "Forecast Period", excelTheme.champagne);
  styleYearBand(ws, 2, 3, 14, "Year 1", "F7EBDD");
  styleYearBand(ws, 2, 15, 26, "Year 2", "EED9BB");
  styleYearBand(ws, 2, 27, 38, "Year 3", "DFC198");
  styleYearBand(ws, 2, 39, 39, "Total / Ending", "B88B5B");
  styleHeaderRow(ws, 3, 1, lastCol);

  for (let row = 4; row <= ws.rowCount; row += 1) {
    const category = String(ws.getCell(row, 1).value || "");
    const label = String(ws.getCell(row, 2).value || "");
    const isCategoryHeader = label === "Expense category";
    const isRevenue = category === "Revenue";
    const isExpense = category.includes("Research") || category.includes("Marketing") || category.includes("Operations") || category.includes("Management") || category.includes("Accounting") || label === "Total Expenses";
    const isProfit = category === "Profit" || label.includes("EBITDA");
    const isCash = category === "Cash";
    const isKeyRow = label === "Total Expenses" || label === "MRR" || label === "ARR" || label === "EBITDA / Profit" || label === "Peak Cash Need";
    let rowFill = excelTheme.paper;
    if (isRevenue) rowFill = excelTheme.revenue;
    if (isExpense) rowFill = excelTheme.expense;
    if (isProfit) rowFill = excelTheme.profit;
    if (isCash) rowFill = excelTheme.cash;

    applyRect(ws, row, 1, row, lastCol, (cell, _r, colIdx) => {
      cell.fill = xlFill(isCategoryHeader ? excelTheme.champagne2 : rowFill);
      cell.border = xlBorder(isCategoryHeader ? excelTheme.goldDark : excelTheme.grid);
      cell.font = xlFont({
        color: isCategoryHeader ? excelTheme.ink : excelTheme.ink,
        size: colIdx <= 2 ? 12 : 11,
        bold: isCategoryHeader || isKeyRow,
      });
      cell.alignment = {
        horizontal: colIdx <= 2 ? "left" : "right",
        vertical: "middle",
        wrapText: colIdx <= 2,
      };
      if (colIdx >= 3) {
        if (label.includes("%")) cell.numFmt = "0.0%";
        else if (label.includes("Subscribers")) cell.numFmt = "#,##0.0";
        else cell.numFmt = "$#,##0;[Red]($#,##0);-";
      }
    });
    ws.getRow(row).height = isCategoryHeader ? 28 : 25;
  }

  [forecastInfo.rowMap["MRR"], forecastInfo.rowMap["ARR"], forecastInfo.rowMap["EBITDA / Profit"], forecastInfo.rowMap["Peak Cash Need"]].forEach((row) => {
    if (!row) return;
    applyRect(ws, row, 1, row, lastCol, (cell, _r, colIdx) => {
      cell.font = xlFont({ color: excelTheme.ink, size: colIdx <= 2 ? 12 : 11, bold: true });
      cell.fill = xlFill(excelTheme.champagne);
      cell.border = {
        ...xlBottomBorder(excelTheme.goldDark, "thin"),
        top: { style: "thin", color: { argb: argb(excelTheme.goldDark) } },
        bottom: { style: "thin", color: { argb: argb(excelTheme.goldDark) } },
      };
    });
  });
}

function styleAssumptionsWorksheet(ws) {
  styleUsedSheet(ws);
  ws.views = [{ state: "frozen", xSplit: 2, ySplit: 20, showGridLines: false }];
  ws.properties.tabColor = { argb: argb(excelTheme.champagne2) };
  ws.columns = [
    { width: 30 },
    { width: 38 },
    { width: 46 },
    { width: 24 },
    { width: 20 },
    { width: 62 },
    ...Array.from({ length: 36 }, () => ({ width: 15.5 })),
  ];
  styleBrandTitle(ws, "SPECTRA | Assumptions Control Panel", "Change the warm gold cells. The Forecast and Summary tabs update from this control sheet.", 42);

  for (let row = 1; row <= ws.rowCount; row += 1) {
    const first = String(ws.getCell(row, 1).value || "");
    const isSection = ["Business Base", "Monthly Growth Assumptions", "Expense Assumptions", "Expense Monthly Values"].includes(first);
    const isHeader = ["Metric", "Month", "Line ID"].includes(first);
    if (isSection) {
      applyRect(ws, row, 1, row, 42, (cell) => {
        cell.fill = xlFill(excelTheme.champagne2);
        cell.font = xlFont({ color: excelTheme.ink, size: 14, bold: false });
        cell.border = {
          ...xlBottomBorder(excelTheme.goldDark, "thin"),
          bottom: { style: "thin", color: { argb: argb(excelTheme.goldDark) } },
        };
      });
      ws.getRow(row).height = 29;
    }
    if (isHeader) styleHeaderRow(ws, row, 1, Math.min(42, ws.getRow(row).cellCount || 42));

    ws.getRow(row).eachCell({ includeEmpty: true }, (cell, colIdx) => {
      if (!isSection && !isHeader && colIdx > 1 && cell.value !== null && cell.value !== undefined && cell.value !== "") {
        const hasFormula = typeof cell.value === "object" && cell.value?.formula;
        cell.fill = xlFill(hasFormula ? excelTheme.formula : excelTheme.input);
        cell.border = xlBottomBorder(excelTheme.grid, "thin");
      }
      if (colIdx >= 2) cell.alignment = { horizontal: colIdx <= 6 ? "left" : "right", vertical: "middle", wrapText: colIdx <= 6 };
    });
    if (!isSection && !isHeader) ws.getRow(row).height = 25;
  }
}

function styleSummaryWorksheet(ws) {
  styleUsedSheet(ws);
  ws.views = [{ state: "frozen", xSplit: 1, ySplit: 4, showGridLines: false }];
  ws.properties.tabColor = { argb: argb(excelTheme.dark) };
  ws.columns = [{ width: 34 }, { width: 24 }, { width: 24 }, { width: 24 }, { width: 24 }];
  styleBrandTitle(ws, "SPECTRA | Investor Forecast Summary", "Premium view of the live forecast: year milestones, cash need, breakeven, and chart-ready data.", 5);
  styleHeaderRow(ws, 4, 1, 4);

  applyRect(ws, 5, 1, 11, 4, (cell, _r, colIdx) => {
    cell.fill = xlFill(colIdx === 1 ? excelTheme.cream : excelTheme.paper);
    cell.font = xlFont({ color: excelTheme.ink, size: colIdx === 1 ? 13 : 13, bold: colIdx !== 1 });
    cell.alignment = { horizontal: colIdx === 1 ? "left" : "right", vertical: "middle" };
    cell.border = xlBottomBorder(excelTheme.grid, "thin");
  });

  [14, 15, 18].forEach((row) => {
    applyRect(ws, row, 1, row, 5, (cell) => {
      cell.fill = xlFill(excelTheme.champagne2);
      cell.font = xlFont({ color: excelTheme.ink, size: 14, bold: false });
      cell.border = xlBottomBorder(excelTheme.goldDark, "thin");
    });
    ws.getRow(row).height = 30;
  });
  styleHeaderRow(ws, 19, 1, 5);
  applyRect(ws, 20, 1, 55, 5, (cell, _r, colIdx) => {
    cell.fill = xlFill(colIdx === 1 ? excelTheme.cream : excelTheme.paper);
    cell.alignment = { horizontal: colIdx === 1 ? "left" : "right", vertical: "middle" };
    cell.font = xlFont({ size: 12, color: excelTheme.ink });
  });
}

async function applyProfessionalStyling(outputAbs, forecastInfo) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(outputAbs);
  workbook.creator = "Spectra";
  workbook.lastModifiedBy = "Spectra";
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.calcProperties.fullCalcOnLoad = true;

  styleSummaryWorksheet(workbook.getWorksheet("Summary"));
  styleAssumptionsWorksheet(workbook.getWorksheet("Assumptions"));
  styleForecastWorksheet(workbook.getWorksheet("Forecast"), forecastInfo);

  await workbook.xlsx.writeFile(outputAbs);
}

function validateWorkbook(outputAbs, expected, forecastInfo) {
  const wb = XLSX.readFile(outputAbs, { cellFormula: true });
  const requiredSheets = ["Summary", "Assumptions", "Forecast"];
  for (const name of requiredSheets) {
    if (!wb.SheetNames.includes(name)) throw new Error(`Missing sheet: ${name}`);
  }
  const forecastWs = wb.Sheets.Forecast;
  const formulasToCheck = ["C4", "C5", "C6", "C11", "C12"];
  for (const addr of formulasToCheck) {
    if (!forecastWs[addr]?.f) throw new Error(`Expected formula in Forecast!${addr}`);
  }
  for (const [addr, cell] of Object.entries(forecastWs)) {
    if (addr.startsWith("!") || !cell?.f) continue;
    if (String(cell.f).includes("undefined")) {
      throw new Error(`Invalid formula in Forecast!${addr}: ${cell.f}`);
    }
  }
  const summaryWs = wb.Sheets.Summary;
  if (!summaryWs.B14?.f || !summaryWs.B15?.f) throw new Error("Summary breakeven / peak cash formulas are missing");
  for (const [addr, cell] of Object.entries(summaryWs)) {
    if (addr.startsWith("!") || !cell?.f) continue;
    if (String(cell.f).includes("undefined")) {
      throw new Error(`Invalid formula in Summary!${addr}: ${cell.f}`);
    }
  }

  const checks = [
    ["Ending subscribers", forecastWs.AM7?.v, expected.subscribersEnd[FORECAST_MONTHS - 1]],
    ["Ending MRR", forecastWs.AM13?.v, expected.revenue[FORECAST_MONTHS - 1]],
    ["Ending ARR", forecastWs.AM14?.v, expected.arr[FORECAST_MONTHS - 1]],
    [
      "Total EBITDA",
      forecastWs[`AM${forecastInfo.rowMap["EBITDA / Profit"]}`]?.v,
      expected.ebitda.reduce((s, v) => s + v, 0),
    ],
    [
      "Peak cash need",
      summaryWs.B15?.v,
      Math.abs(Math.min(0, ...forecastInfo.cumulativeValues)),
    ],
  ];
  for (const [label, actual, wanted] of checks) {
    if (Math.abs((actual ?? 0) - wanted) > 1) {
      throw new Error(`${label} mismatch: workbook=${actual}, expected=${wanted}`);
    }
  }

  const breakevenIdx = expected.ebitda.findIndex((v) => v > 0);
  const expectedBreakeven = breakevenIdx >= 0 ? MONTH_LABELS[breakevenIdx] : "Not reached";
  if (summaryWs.B14?.v !== expectedBreakeven) {
    throw new Error(`Breakeven mismatch: workbook=${summaryWs.B14?.v}, expected=${expectedBreakeven}`);
  }
}

async function main() {
  const output = getArg("--output", OUTPUT_PATH);
  const outputAbs = path.resolve(process.cwd(), output);
  const sourceInfo = await loadState();
  const { wb, forecast, forecastInfo } = buildWorkbook(sourceInfo.state, sourceInfo);
  fs.mkdirSync(path.dirname(outputAbs), { recursive: true });
  XLSX.writeFile(wb, outputAbs, { bookType: "xlsx", cellStyles: true });
  await applyProfessionalStyling(outputAbs, forecastInfo);
  validateWorkbook(outputAbs, forecast, forecastInfo);
  console.log(`Wrote ${output}`);
  console.log(`Source: ${sourceInfo.source}${sourceInfo.persisted ? " (persisted)" : ""}`);
  if (sourceInfo.warning) console.warn(`Warning: ${sourceInfo.warning}`);
  console.log(`Ending subscribers: ${Math.round(forecast.subscribersEnd[FORECAST_MONTHS - 1]).toLocaleString()}`);
  console.log(`Ending MRR: ${Math.round(forecast.revenue[FORECAST_MONTHS - 1]).toLocaleString()}`);
  console.log(`Ending ARR: ${Math.round(forecast.arr[FORECAST_MONTHS - 1]).toLocaleString()}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
