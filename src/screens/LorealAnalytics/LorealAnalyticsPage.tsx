import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import data from "../../data/market-intelligence.json";
import PopulationsTab from "./PopulationsTab";
import CellsTab from "./CellsTab";
import CellComparisonTab from "./CellComparisonTab";
import { useLiveMarketDataset } from "../../lib/marketDataset";
import {
  ALL_SERVICE_TYPES,
  applyServiceTypeFilter,
  buildIsraelDatasetValue,
  getBrandCompany,
  IsraelDatasetCtx,
  normalizeBrandName,
  useIsraelDataset,
} from "./data";
import { EN, HE, type Locale } from "./locales";

// ── Constants ───────────────────────────────────────────────────────
const ACCESS_CODE = "LPR3391";
const SESSION_KEY = "loreal_analytics_unlocked";
const DEFAULT_PAGE_TITLE = "L'Oréal Analytics";
const DEFAULT_PAGE_SUBTITLE = "Spectra Platform — שוק ישראל";
const DEFAULT_FOOTER_TITLE = "L'Oréal Analytics";

type LorealAnalyticsPageProps = {
  accessCode?: string;
  sessionKey?: string;
  title?: string;
  subtitle?: string;
  footerTitle?: string;
  locale?: Locale;
};

const CHART_COLORS = [
  "#6366F1", // indigo
  "#F59E0B", // amber
  "#10B981", // emerald
  "#EF4444", // red
  "#8B5CF6", // purple
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#F97316", // orange
  "#14B8A6", // teal
  "#3B82F6", // blue
  "#84CC16", // lime
  "#D946EF", // fuchsia
  "#A855F7", // violet
  "#22D3EE", // sky
  "#FB923C", // light orange
];

const SERVICE_COLORS: Record<string, string> = {
  Color: "#6366F1",
  Highlights: "#F59E0B",
  Toner: "#10B981",
  Straightening: "#8B5CF6",
  Others: "#EC4899",
};

const SERVICE_LABELS_HE: Record<string, string> = {
  Color: "צבע",
  Highlights: "גוונים",
  Toner: "טונר",
  Straightening: "החלקה",
  Others: "אחר",
};

const SERVICE_LABELS_EN: Record<string, string> = {
  Color: "Color",
  Highlights: "Highlights",
  Toner: "Toner",
  Straightening: "Straightening",
  Others: "Others",
};

const MONTH_NAMES_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Brand → Parent-Company mapping
const BRAND_TO_COMPANY: Record<string, string> = {
  "L'OREAL PROFESSIONNEL": "L'Oréal Groupe",
  "REDKEN": "L'Oréal Groupe",
  "MATRIX": "L'Oréal Groupe",
  "KERASTASE PARIS": "L'Oréal Groupe",
  "PULPRIOT": "L'Oréal Groupe",
  "SCHWARZKOPF": "Henkel (Schwarzkopf)",
  "SCHWARZKOPF_CANADA": "Henkel (Schwarzkopf)",
  "Schwarzkopf Professional <JP>": "Henkel (Schwarzkopf)",
  "INDOLA": "Henkel (Schwarzkopf)",
  "WELLA PROFESSIONALS": "Wella Company",
  "WELLA PROFESSIONALS <JP>": "Wella Company",
  "SEBASTIAN PROFESSIONAL": "Wella Company",
  "SYSTEM PROFESSIONAL": "Wella Company",
  "KADUS": "Wella Company",
  "GOLDWELL": "KAO Salon",
  "JOICO": "KAO Salon",
  "ALFAPARF MILANO": "Alfaparf Group",
  "KEUNE": "Keune Haircosmetics",
  "OLAPLEX": "Olaplex",
  "DAVINES": "Davines Group",
  "PAUL MITCHELL": "John Paul Mitchell",
  "KEVIN.MURPHY": "Kevin.Murphy",
  "MOROCCANOIL": "Moroccanoil",
  "EUGENE PERMA": "Eugene Perma",
  "MON PLATIN": "Mon Platin",
  "FARCOM": "Farcom",
  "NOUVELLE": "Nouvelle",
  "MONTIBELLO": "Montibello",
  "MILK SHAKE": "Milk Shake",
  "MARIA NILA STOCKHOLM": "Maria Nila",
};

const ALL_COMPANIES = [...new Set(Object.values(BRAND_TO_COMPANY))].sort();

// Series presets — mapped to brands because the dataset is stored at brand level
interface SeriesPreset { id: string; name: string; brands: string[]; note?: string; }
const SERIES_PRESETS: SeriesPreset[] = [
  { id: "dia", name: "Dia Light / Dia Richesse", brands: ["L'OREAL PROFESSIONNEL"], note: "ממופה למותג L'Oréal Professionnel" },
  { id: "majirel", name: "Majirel / INOA / Luo Color", brands: ["L'OREAL PROFESSIONNEL"], note: "ממופה למותג L'Oréal Professionnel" },
  { id: "redken-shades-eq", name: "Redken Shades EQ", brands: ["REDKEN"] },
  { id: "matrix-socolor", name: "Matrix Socolor", brands: ["MATRIX"] },
  { id: "igora", name: "Igora Royal / Vibrance", brands: ["SCHWARZKOPF", "SCHWARZKOPF_CANADA", "Schwarzkopf Professional <JP>"] },
  { id: "koleston", name: "Koleston / Color Touch", brands: ["WELLA PROFESSIONALS", "WELLA PROFESSIONALS <JP>"] },
];

function generateMonthSequence(startLabel: string, endLabel: string): string[] {
  const [sM, sY] = startLabel.split(" ");
  const [eM, eY] = endLabel.split(" ");
  const si = MONTH_NAMES_SHORT.indexOf(sM);
  const ei = MONTH_NAMES_SHORT.indexOf(eM);
  const sy = parseInt(sY, 10);
  const ey = parseInt(eY, 10);
  if (si < 0 || ei < 0 || isNaN(sy) || isNaN(ey)) return [];
  const result: string[] = [];
  let y = sy, m = si;
  while (y < ey || (y === ey && m <= ei)) {
    result.push(`${MONTH_NAMES_SHORT[m]} ${y}`);
    m++;
    if (m > 11) { m = 0; y++; }
  }
  return result;
}

function pctChange(cur: number, prev: number): number | null {
  if (!prev || prev === 0) return null;
  return ((cur - prev) / prev) * 100;
}

function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const bom = "\uFEFF";
  const csv = bom + [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Formatters ──────────────────────────────────────────────────────
const fmtNumber = (v: number) =>
  new Intl.NumberFormat("he-IL").format(Math.round(v));


const fmtCompact = (v: number) =>
  new Intl.NumberFormat("he-IL", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(v);

const fmtPercent = (v: number) =>
  new Intl.NumberFormat("he-IL", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(v / 100);

// ── Data types ──────────────────────────────────────────────────────
interface RawRow {
  mk: string;
  si: number;
  uid: string;
  co: string;
  ci: string;
  st: string;
  emp: number;
  br: string;
  vis: number;
  svc: number;
  cost: number;
  gr: number;
  cs: number;
  cc: number;
  cg: number;
  hs: number;
  hc: number;
  hg: number;
  ts: number;
  tc: number;
  tg: number;
  ss: number;
  sc: number;
  sg: number;
  os: number;
  oc: number;
  og: number;
}

interface CustomerEntry {
  userId: string;
  country: string;
  city: string;
  salonType: string;
  employees: number;
  totalVisits: number;
  totalServices: number;
  totalRevenue: number;
  totalGrams: number;
  brandsUsed: number;
  topBrands: string[];
  monthsActive: number;
  firstMonth: string;
  lastMonth: string;
  colorServices: number;
  highlightsServices: number;
  tonerServices: number;
  straighteningServices: number;
  othersServices: number;
}

// ── Data Processing: Israel Only ────────────────────────────────────
const ISRAEL_KEYS = ["ISRAEL", "Israel"];
const UNKNOWN_CITY_LABEL = "Unknown";
const CITY_ALIASES: Record<string, string> = {
  "afula": "Afula",
  "ashdod": "Ashdod",
  "hshdod": "Ashdod",
  "ashkelon": "Ashkelon",
  "tel aviv": "Tel Aviv",
  "tlv": "Tel Aviv",
  "beer sheva": "Beer Sheva",
  "beer yakov": "Beer Yakov",
  "beit shemesh": "Beit Shemesh",
  "binyamina": "Binyamina",
  "caesarea": "Caesarea",
  "carmiel": "Carmiel",
  "gany tikva": "Gany Tikva",
  "ganei tikva": "Gany Tikva",
  "givataim": "Givataim",
  "haifa": "Haifa",
  "harish": "Harish",
  "hatzor glilit": "Hatzor Haglilit",
  "hatzor haglilit": "Hatzor Haglilit",
  "hertzelia": "Hertzelia",
  "hod hasharon": "Hod Hasharon",
  "holon": "Holon",
  "hulon": "Holon",
  "hulun": "Holon",
  "hom el fachem": "Umm Al-Fahm",
  "horfish": "Horfish",
  "hashmonahim": "Hashmonahim",
  "חשמונאים": "Hashmonahim",
  "ios": UNKNOWN_CITY_LABEL,
  "jerusalem": "Jerusalem",
  "ירושלים": "Jerusalem",
  "kfar saba": "Kfar Saba",
  "kohav yair": "Kohav Yair",
  "kiryat motzkin": "Krayot",
  "krayot": "Krayot",
  "kryat shmona": "Kiryat Shmona",
  "kryat malahi": "Kryat Malahi",
  "lod": "Lod",
  "maalot": "Maalot Tarshicha",
  "maalot tarshicha": "Maalot Tarshicha",
  "mevaseret": "Mevaseret",
  "modim": "Modim",
  "naharya": "Naharya",
  "natanya": "Netanya",
  "netanya": "Netanya",
  "or akiva": "Or Akiva",
  "pardes hana": "Pardes Hana",
  "pkiin": "Pkiin",
  "raanana": "Raanana",
  "rannana": "Raanana",
  "ramat hasharon": "Ramat Hasharon",
  "rehovot": "Rehovot",
  "reshon lezion": "Rishon Letzion",
  "rishon letzion": "Rishon Letzion",
  "rishon lezion": "Rishon Letzion",
  "rosh haain": "Rosh Haain",
  "shavei zion": "Shavei Tzion",
  "shavei tzion": "Shavei Tzion",
  "shoham": "Shoham",
  "team": UNKNOWN_CITY_LABEL,
  "tveria": "Tveria",
  "yahud": "Yahud",
  "yarka": "Yarka",
  "yokneam": "Yokneam",
};

function normalizeCityName(city?: string | null) {
  const key = String(city || "").trim().replace(/[\s_-]+/g, " ").toLowerCase();
  if (!key || key === "unknown") return UNKNOWN_CITY_LABEL;
  return CITY_ALIASES[key] || key.replace(/\b\w/g, (ch) => ch.toUpperCase());
}

const israelRawRows: RawRow[] = (data as any).rawRows
  ? (data as any).rawRows.filter((r: RawRow) =>
      ISRAEL_KEYS.includes(r.co)
    )
  : [];

const israelCustomers: CustomerEntry[] = (data as any).customerOverview
  ? (data as any).customerOverview.filter((c: CustomerEntry) =>
      ISRAEL_KEYS.includes(c.country)
    )
  : [];

// Available months sorted chronologically (for date-range picker)
const availableMonths: { label: string; si: number }[] = (() => {
  const map: Record<string, number> = {};
  for (const r of israelRawRows) {
    if (!(r.mk in map) || r.si < map[r.mk]) map[r.mk] = r.si;
  }
  return Object.entries(map)
    .map(([label, si]) => ({ label, si }))
    .sort((a, b) => a.si - b.si);
})();

// ── Aggregated Israel Data ──────────────────────────────────────────
function aggregateIsraelData(rows: RawRow[], labels = SERVICE_LABELS_HE) {
  // Summary
  const totalVisits = rows.reduce((s, r) => s + r.vis, 0);
  const totalServices = rows.reduce((s, r) => s + r.svc, 0);
  const totalRevenue = rows.reduce((s, r) => s + r.cost, 0);
  const totalGrams = rows.reduce((s, r) => s + r.gr, 0);
  const uniqueUsers = new Set(rows.map((r) => r.uid));
  const uniqueBrands = new Set(rows.map((r) => normalizeBrandName(r.br)));
  const uniqueCities = new Set(
    rows.map((r) => normalizeCityName(r.ci)).filter((city) => city !== UNKNOWN_CITY_LABEL)
  );

  // Monthly trends
  const monthMap: Record<string, {
    label: string; si: number;
    visits: number; services: number; revenue: number; grams: number;
    color: number; highlights: number; toner: number; straightening: number; others: number;
    users: Set<string>; brands: Set<string>;
  }> = {};
  for (const r of rows) {
    const brand = normalizeBrandName(r.br);
    if (!monthMap[r.mk]) {
      monthMap[r.mk] = {
        label: r.mk, si: r.si,
        visits: 0, services: 0, revenue: 0, grams: 0,
        color: 0, highlights: 0, toner: 0, straightening: 0, others: 0,
        users: new Set(), brands: new Set(),
      };
    }
    const m = monthMap[r.mk];
    m.visits += r.vis; m.services += r.svc; m.revenue += r.cost; m.grams += r.gr;
    m.color += r.cs; m.highlights += r.hs; m.toner += r.ts;
    m.straightening += r.ss; m.others += r.os;
    m.users.add(r.uid); m.brands.add(brand);
  }
  const monthlyTrends = Object.values(monthMap)
    .sort((a, b) => a.si - b.si)
    .map((m) => ({
      label: m.label,
      visits: m.visits,
      services: m.services,
      revenue: Math.round(m.revenue),
      grams: m.grams,
      color: m.color,
      highlights: m.highlights,
      toner: m.toner,
      straightening: m.straightening,
      others: m.others,
      activeUsers: m.users.size,
      activeBrands: m.brands.size,
    }));

  // Brand performance
  const brandMap: Record<string, {
    brand: string; services: number; revenue: number; grams: number;
    visits: number; users: Set<string>;
  }> = {};
  for (const r of rows) {
    const brand = normalizeBrandName(r.br);
    if (!brandMap[brand]) {
      brandMap[brand] = { brand, services: 0, revenue: 0, grams: 0, visits: 0, users: new Set() };
    }
    const b = brandMap[brand];
    b.services += r.svc; b.revenue += r.cost; b.grams += r.gr; b.visits += r.vis;
    b.users.add(r.uid);
  }
  const brandPerformance = Object.values(brandMap)
    .map((b) => ({ ...b, userCount: b.users.size, users: undefined }))
    .sort((a, b) => b.services - a.services);

  // City breakdown
  const cityMap: Record<string, {
    city: string; services: number; revenue: number; grams: number;
    visits: number; users: Set<string>;
  }> = {};
  for (const r of rows) {
    const city = normalizeCityName(r.ci);
    if (!cityMap[city]) {
      cityMap[city] = { city, services: 0, revenue: 0, grams: 0, visits: 0, users: new Set() };
    }
    const c = cityMap[city];
    c.services += r.svc; c.revenue += r.cost; c.grams += r.gr; c.visits += r.vis;
    c.users.add(r.uid);
  }
  const cityBreakdown = Object.values(cityMap)
    .map((c) => ({ ...c, userCount: c.users.size, users: undefined }))
    .sort((a, b) => b.services - a.services);

  // Service breakdown
  const serviceBreakdown = [
    { type: "Color", label: labels.Color, services: rows.reduce((s, r) => s + r.cs, 0), revenue: rows.reduce((s, r) => s + r.cc, 0), grams: rows.reduce((s, r) => s + r.cg, 0) },
    { type: "Highlights", label: labels.Highlights, services: rows.reduce((s, r) => s + r.hs, 0), revenue: rows.reduce((s, r) => s + r.hc, 0), grams: rows.reduce((s, r) => s + r.hg, 0) },
    { type: "Toner", label: labels.Toner, services: rows.reduce((s, r) => s + r.ts, 0), revenue: rows.reduce((s, r) => s + r.tc, 0), grams: rows.reduce((s, r) => s + r.tg, 0) },
    { type: "Straightening", label: labels.Straightening, services: rows.reduce((s, r) => s + r.ss, 0), revenue: rows.reduce((s, r) => s + r.sc, 0), grams: rows.reduce((s, r) => s + r.sg, 0) },
    { type: "Others", label: labels.Others, services: rows.reduce((s, r) => s + r.os, 0), revenue: rows.reduce((s, r) => s + r.oc, 0), grams: rows.reduce((s, r) => s + r.og, 0) },
  ].filter((s) => s.services > 0);

  // Brand monthly trends (top 8 brands)
  const top8Brands = brandPerformance.slice(0, 8).map((b) => b.brand);
  const brandMonthly: Record<string, Record<string, number>> = {};
  for (const r of rows) {
    const brand = normalizeBrandName(r.br);
    if (!top8Brands.includes(brand)) continue;
    if (!brandMonthly[r.mk]) brandMonthly[r.mk] = {};
    brandMonthly[r.mk][brand] = (brandMonthly[r.mk][brand] || 0) + r.svc;
  }
  const brandTrends = monthlyTrends.map((m) => ({
    label: m.label,
    ...Object.fromEntries(top8Brands.map((b) => [b, brandMonthly[m.label]?.[b] || 0])),
  }));

  // User details (per user aggregation from raw rows - anonymous)
  const userMap: Record<string, {
    userId: string; city: string; salonType: string; employees: number;
    visits: number; services: number; revenue: number; grams: number;
    brands: Set<string>; months: Set<string>;
    color: number; highlights: number; toner: number; straightening: number; others: number;
    firstMonth: string; lastMonth: string; firstSi: number; lastSi: number;
  }> = {};
  for (const r of rows) {
    if (!userMap[r.uid]) {
      userMap[r.uid] = {
        userId: r.uid, city: normalizeCityName(r.ci),
        salonType: r.st, employees: r.emp,
        visits: 0, services: 0, revenue: 0, grams: 0,
        brands: new Set(), months: new Set(),
        color: 0, highlights: 0, toner: 0, straightening: 0, others: 0,
        firstMonth: r.mk, lastMonth: r.mk, firstSi: r.si, lastSi: r.si,
      };
    }
    const u = userMap[r.uid];
    u.visits += r.vis; u.services += r.svc; u.revenue += r.cost; u.grams += r.gr;
    u.color += r.cs; u.highlights += r.hs; u.toner += r.ts;
    u.straightening += r.ss; u.others += r.os;
    u.brands.add(normalizeBrandName(r.br)); u.months.add(r.mk);
    if (r.si < u.firstSi) { u.firstSi = r.si; u.firstMonth = r.mk; }
    if (r.si > u.lastSi) { u.lastSi = r.si; u.lastMonth = r.mk; }
    const normalizedCity = normalizeCityName(r.ci);
    if (u.city === UNKNOWN_CITY_LABEL && normalizedCity !== UNKNOWN_CITY_LABEL) u.city = normalizedCity;
  }

  // Helper: convert YYYYMM si to sequential month number
  const siToSeq = (si: number) => {
    const year = Math.floor(si / 100);
    const month = si % 100;
    return year * 12 + month;
  };

  // Calculate total months span in dataset
  const allSi = rows.map((r) => r.si);
  const minSiVal = allSi.length > 0 ? Math.min(...allSi) : 0;
  const maxSiVal = allSi.length > 0 ? Math.max(...allSi) : 0;
  const maxSeq = siToSeq(maxSiVal);

  // Build per-user per-month services map for consistency calculation
  const userMonthServices: Record<string, Record<number, number>> = {};
  for (const r of rows) {
    if (!userMonthServices[r.uid]) userMonthServices[r.uid] = {};
    const seq = siToSeq(r.si);
    userMonthServices[r.uid][seq] = (userMonthServices[r.uid][seq] || 0) + r.svc;
  }

  const userDetails = Object.values(userMap)
    .map((u) => {
      const firstSeq = siToSeq(u.firstSi);
      // Possible months = from user's first month to dataset's last month
      const possibleMonths = Math.max(1, maxSeq - firstSeq + 1);

      // Get the user's monthly services array in order
      const monthlyServices = userMonthServices[u.userId] || {};
      const monthSeqs: number[] = [];
      for (let s = firstSeq; s <= maxSeq; s++) monthSeqs.push(s);

      // Calculate retention-based continuity score
      // 1. Presence: which months were they active
      const activeMonths = monthSeqs.filter((s) => (monthlyServices[s] || 0) > 0);
      const presenceRatio = activeMonths.length / possibleMonths;

      // 2. Consistency: month-over-month within 30% deviation tolerance
      let consistentMonths = 0;
      let totalChecked = 0;
      for (let i = 0; i < monthSeqs.length; i++) {
        const s = monthSeqs[i];
        const svc = monthlyServices[s] || 0;
        if (svc === 0) continue; // inactive month = not counted as consistent

        if (i === 0 || totalChecked === 0) {
          // First active month is always consistent
          consistentMonths++;
          totalChecked++;
          continue;
        }

        // Find previous active month's services
        let prevSvc = 0;
        for (let j = i - 1; j >= 0; j--) {
          const ps = monthlyServices[monthSeqs[j]] || 0;
          if (ps > 0) { prevSvc = ps; break; }
        }

        if (prevSvc > 0) {
          const deviation = Math.abs(svc - prevSvc) / prevSvc;
          if (deviation <= 0.30) {
            consistentMonths++;
          } else {
            // Partial credit: if within 60% deviation give half credit
            consistentMonths += deviation <= 0.60 ? 0.5 : 0.2;
          }
        } else {
          consistentMonths++;
        }
        totalChecked++;
      }

      // Final score: weighted combination of presence (60%) and consistency (40%)
      const consistencyRatio = totalChecked > 0 ? consistentMonths / totalChecked : 0;
      const continuityScore = Math.min(100, Math.round(
        (presenceRatio * 0.6 + consistencyRatio * 0.4) * 100
      ));

      const avgServicesPerMonth = u.months.size > 0 ? Math.round(u.services / u.months.size) : 0;

      return {
        userId: u.userId,
        city: u.city,
        salonType: u.salonType,
        employees: u.employees,
        visits: u.visits,
        services: u.services,
        revenue: u.revenue,
        grams: u.grams,
        brandsUsed: u.brands.size,
        monthsActive: u.months.size,
        totalPossibleMonths: possibleMonths,
        continuityScore,
        avgServicesPerMonth,
        color: u.color,
        highlights: u.highlights,
        toner: u.toner,
        straightening: u.straightening,
        others: u.others,
        firstMonth: u.firstMonth,
        lastMonth: u.lastMonth,
        topBrands: [...u.brands].slice(0, 5),
      };
    })
    .sort((a, b) => b.services - a.services);

  // Salon type breakdown
  const salonTypeMap: Record<string, { type: string; count: number; services: number; revenue: number }> = {};
  for (const u of userDetails) {
    const type = u.salonType || "לא מוגדר";
    if (!salonTypeMap[type]) {
      salonTypeMap[type] = { type, count: 0, services: 0, revenue: 0 };
    }
    salonTypeMap[type].count++;
    salonTypeMap[type].services += u.services;
    salonTypeMap[type].revenue += u.revenue;
  }
  const salonTypeBreakdown = Object.values(salonTypeMap).sort((a, b) => b.count - a.count);

  return {
    summary: {
      totalVisits,
      totalServices,
      totalRevenue,
      totalGrams,
      uniqueUsers: uniqueUsers.size,
      uniqueBrands: uniqueBrands.size,
      uniqueCities: uniqueCities.size,
      dateRange: (data as any).summary?.dateRange || { from: "Aug 2024", to: "Jan 2026" },
    },
    monthlyTrends,
    brandPerformance,
    cityBreakdown,
    serviceBreakdown,
    brandTrends,
    top8Brands,
    userDetails,
    salonTypeBreakdown,
  };
}

// ── Access Gate Component ───────────────────────────────────────────
function AccessGate({
  onUnlock,
  accessCode,
  sessionKey,
  title,
  subtitle,
  locale = "he",
}: {
  onUnlock: () => void;
  accessCode: string;
  sessionKey: string;
  title: string;
  subtitle: string;
  locale?: Locale;
}) {
  const c = locale === "en" ? EN : HE;
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (code === accessCode) {
      sessionStorage.setItem(sessionKey, "1");
      onUnlock();
    } else {
      setError(c.gateError);
    }
  };

  return (
    <div dir={c.dir} className="min-h-[100dvh] bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-200 shadow-xl rounded-3xl p-8 sm:p-10 text-center">
          {/* Logo area */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {title}
          </h2>
          <p className="text-sm text-gray-500 mb-2">
            {subtitle}
          </p>
          <p className="text-xs text-gray-400 mb-8">
            {c.gateInstruction}
          </p>
          <input
            type="password"
            value={code}
            onChange={(e) => {
              setCode(e.currentTarget.value);
              if (error) setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
            className="w-full text-center tracking-widest text-xl font-semibold bg-gray-50 text-gray-900 placeholder:text-gray-300 border border-gray-200 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 transition-all"
            placeholder="• • • • • • •"
            autoFocus
          />
          {error && (
            <p className="text-xs text-red-500 mt-3">{error}</p>
          )}
          <button
            onClick={handleSubmit}
            className="w-full mt-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-indigo-200"
          >
            {c.gateButton}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Card Component ─────────────────────────────────────────────────
function Card({
  children,
  className = "",
  title,
  subtitle,
  action,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className={`bg-white border border-gray-100 shadow-sm rounded-2xl p-5 sm:p-6 ${className}`}>
      {title && (
        <div className="mb-5 flex items-start justify-between gap-4 text-left">
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-bold leading-tight text-gray-900">{title}</h3>
            {subtitle && <p className="mt-1 text-xs sm:text-sm leading-snug text-gray-500">{subtitle}</p>}
          </div>
          {action && <div className="flex-shrink-0 mt-1">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

// ── KPI Card Component ──────────────────────────────────────────────
function KpiCard({
  label,
  value,
  sub,
  icon,
  color = "indigo",
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  color?: string;
}) {
  const colorMap: Record<string, string> = {
    indigo: "from-indigo-500 to-indigo-600 shadow-indigo-200",
    emerald: "from-emerald-500 to-emerald-600 shadow-emerald-200",
    amber: "from-amber-500 to-amber-600 shadow-amber-200",
    purple: "from-purple-500 to-purple-600 shadow-purple-200",
    pink: "from-pink-500 to-pink-600 shadow-pink-200",
    cyan: "from-cyan-500 to-cyan-600 shadow-cyan-200",
  };
  return (
    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 sm:p-5 flex h-full min-h-[96px] items-center gap-3 sm:gap-4">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${colorMap[color] || colorMap.indigo} shadow-lg flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1 text-left">
        <p className="min-h-[28px] text-xs sm:text-sm font-medium text-gray-500 leading-tight">{label}</p>
        <p className="mt-1 text-xl sm:text-2xl font-bold text-gray-900 tracking-tight truncate">{value}</p>
        {sub && <p className="mt-1 text-[10px] sm:text-xs text-gray-400 truncate">{sub}</p>}
      </div>
    </div>
  );
}

// ── Custom Tooltip ──────────────────────────────────────────────────
function ChartTooltipContent({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 backdrop-blur-md rounded-xl px-4 py-3 shadow-xl" dir="rtl">
      <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-500">{entry.name}:</span>
          <span className="text-gray-900 font-medium">
            {typeof entry.value === "number" ? fmtNumber(entry.value) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Dashboard Component ─────────────────────────────────────────────
function Dashboard({
  title = DEFAULT_PAGE_TITLE,
  subtitle = DEFAULT_PAGE_SUBTITLE,
  footerTitle = DEFAULT_FOOTER_TITLE,
  locale = "he",
}: Pick<LorealAnalyticsPageProps, "title" | "subtitle" | "footerTitle" | "locale">) {
  const c = locale === "en" ? EN : HE;
  const SERVICE_LABELS = locale === "en" ? SERVICE_LABELS_EN : SERVICE_LABELS_HE;
  // Live dataset (auto-updates when the admin imports a new month).
  const liveIsrael = useIsraelDataset();
  const israelRawRows = liveIsrael.rawRows;
  const availableMonths = liveIsrael.availableMonths;

  // Global customer filter
  const [globalFilterUsers, setGlobalFilterUsers] = useState<string[]>([]);
  const [globalFilterSearch, setGlobalFilterSearch] = useState("");
  const [showGlobalFilter, setShowGlobalFilter] = useState(false);
  const [globalFilterSort, setGlobalFilterSort] = useState<"services" | "continuity" | "monthsActive" | "avgServices" | "grams">("services");
  const [globalContinuityMin, setGlobalContinuityMin] = useState<number>(0);

  // Cohort company/series filter (applied within cohort tab analysis)
  const [cohortCompanyFilter, setCohortCompanyFilter] = useState<Set<string>>(() => new Set());
  const [cohortSeriesFilter, setCohortSeriesFilter] = useState<Set<string>>(() => new Set());
  const toggleCohortCompany = (co: string) => setCohortCompanyFilter((prev) => { const n = new Set(prev); n.has(co) ? n.delete(co) : n.add(co); return n; });
  const toggleCohortSeries = (seriesId: string) => setCohortSeriesFilter((prev) => { const n = new Set(prev); n.has(seriesId) ? n.delete(seriesId) : n.add(seriesId); return n; });
  const clearCohortAnalysisFilter = () => { setCohortCompanyFilter(new Set()); setCohortSeriesFilter(new Set()); };

  // Date range filter
  const [dateFrom, setDateFrom] = useState(availableMonths.length > 0 ? availableMonths[0].label : "");
  const [dateTo, setDateTo] = useState(availableMonths.length > 0 ? availableMonths[availableMonths.length - 1].label : "");

  // When the live dataset loads new months, clamp the range to keep
  // the picker valid without overriding a user's narrower selection.
  useEffect(() => {
    if (availableMonths.length === 0) return;
    const labels = availableMonths.map((m) => m.label);
    if (!dateFrom || !labels.includes(dateFrom)) {
      setDateFrom(labels[0]);
    }
    if (!dateTo || !labels.includes(dateTo)) {
      setDateTo(labels[labels.length - 1]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableMonths.length]);

  // Service-type filter
  const [enabledServiceTypes, setEnabledServiceTypes] = useState<Set<string>>(() => new Set(ALL_SERVICE_TYPES));
  const toggleServiceType = (type: string) => setEnabledServiceTypes((prev) => { const n = new Set(prev); if (n.has(type)) n.delete(type); else n.add(type); return n; });
  const allServicesEnabled = enabledServiceTypes.size === ALL_SERVICE_TYPES.length;

  const dateFromSi = availableMonths.find((m) => m.label === dateFrom)?.si ?? -Infinity;
  const dateToSi = availableMonths.find((m) => m.label === dateTo)?.si ?? Infinity;

  // Full data (unfiltered) for user list
  const allIsraelData = useMemo(() => aggregateIsraelData(israelRawRows, SERVICE_LABELS), [israelRawRows, SERVICE_LABELS]);
  const allUserDetails = allIsraelData.userDetails;

  const applyServiceFilter = useCallback((rows: RawRow[]): RawRow[] => {
    return applyServiceTypeFilter(rows, enabledServiceTypes);
  }, [enabledServiceTypes]);

  // Filtered raw rows based on global filter + date range + service types
  const filteredRawRows = useMemo(() => {
    let rows = israelRawRows;
    if (globalFilterUsers.length > 0) {
      rows = rows.filter((r) => globalFilterUsers.includes(r.uid));
    }
    rows = rows.filter((r) => r.si >= dateFromSi && r.si <= dateToSi);
    return applyServiceFilter(rows);
  }, [globalFilterUsers, dateFromSi, dateToSi, applyServiceFilter]);

  const selectedSeriesBrands = useMemo(() => {
    if (cohortSeriesFilter.size === 0) return new Set<string>();
    return new Set(
      SERIES_PRESETS
        .filter((preset) => cohortSeriesFilter.has(preset.id))
        .flatMap((preset) => preset.brands)
        .map(normalizeBrandName)
    );
  }, [cohortSeriesFilter]);

  // Company + series filter for cohort analysis
  const applyCohortAnalysisFilter = useCallback((rows: RawRow[]): RawRow[] => {
    if (cohortCompanyFilter.size === 0 && selectedSeriesBrands.size === 0) return rows;
    return rows.filter((r) => {
      const company = getBrandCompany(r.br);
      const companyMatch = cohortCompanyFilter.size === 0 || !!(company && cohortCompanyFilter.has(company));
      const seriesMatch = selectedSeriesBrands.size === 0 || selectedSeriesBrands.has(normalizeBrandName(r.br));
      return companyMatch && seriesMatch;
    });
  }, [cohortCompanyFilter, selectedSeriesBrands]);

  const cohortAnalysisFilterActive = cohortCompanyFilter.size > 0 || cohortSeriesFilter.size > 0;

  const handleTableWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      window.scrollBy({ top: e.deltaY, left: 0, behavior: "auto" });
    }
  }, []);

  // Re-aggregate with filtered rows
  const israelData = useMemo(() => aggregateIsraelData(filteredRawRows, SERVICE_LABELS), [filteredRawRows, SERVICE_LABELS]);
  const {
    summary,
    monthlyTrends,
    brandPerformance,
    cityBreakdown,
    serviceBreakdown,
    brandTrends,
    top8Brands,
    userDetails,
    salonTypeBreakdown,
  } = israelData;

  // Global filter user search results (with sorting)
  const globalFilterSearchResults = useMemo(() => {
    let list = allUserDetails;
    if (globalContinuityMin > 0) {
      list = list.filter((u) => u.continuityScore >= globalContinuityMin);
    }
    if (globalFilterSearch) {
      const term = globalFilterSearch.toLowerCase();
      list = list.filter(
        (u) => u.userId.toLowerCase().includes(term) || u.city.toLowerCase().includes(term)
      );
    }
    const sortFns: Record<string, (a: typeof list[0], b: typeof list[0]) => number> = {
      services: (a, b) => b.services - a.services,
      continuity: (a, b) => b.continuityScore - a.continuityScore || b.monthsActive - a.monthsActive,
      monthsActive: (a, b) => b.monthsActive - a.monthsActive || b.continuityScore - a.continuityScore,
      avgServices: (a, b) => b.avgServicesPerMonth - a.avgServicesPerMonth,
      grams: (a, b) => b.grams - a.grams,
    };
    return [...list].sort(sortFns[globalFilterSort] || sortFns.services);
  }, [allUserDetails, globalFilterSearch, globalFilterSort, globalContinuityMin]);

  // Tab state
  const [activeTab, setActiveTab] = useState<"overview" | "brands" | "series" | "cities" | "users" | "compare" | "cohorts" | "populations" | "cells" | "cell-comparison">("overview");

  // User table sorting
  const [sortField, setSortField] = useState<string>("services");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("");

  // Comparison tab state
  const [compareMonthA, setCompareMonthA] = useState("");
  const [compareMonthB, setCompareMonthB] = useState("");

  const handleSort = useCallback((field: string) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }, [sortField]);

  const sortedUsers = useMemo(() => {
    let filtered = userDetails;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (u) => u.userId.toLowerCase().includes(term) || u.city.toLowerCase().includes(term)
      );
    }
    if (cityFilter) {
      filtered = filtered.filter((u) => u.city === cityFilter);
    }
    return [...filtered].sort((a, b) => {
      const aVal = (a as any)[sortField] ?? 0;
      const bVal = (b as any)[sortField] ?? 0;
      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    });
  }, [userDetails, sortField, sortDir, searchTerm, cityFilter]);

  const cities = useMemo(
    () => [...new Set(userDetails.map((u) => u.city))].filter((city) => city !== UNKNOWN_CITY_LABEL).sort(),
    [userDetails]
  );

  // Service breakdown total
  const totalServiceCount = serviceBreakdown.reduce((s, x) => s + x.services, 0);

  // Brand market share data (top 10 + others)
  const brandShareData = useMemo(() => {
    const top10 = brandPerformance.slice(0, 10);
    const othersServices = brandPerformance.slice(10).reduce((s, b) => s + b.services, 0);
    const result = top10.map((b) => ({
      name: b.brand,
      value: b.services,
      pct: totalServiceCount > 0 ? ((b.services / totalServiceCount) * 100).toFixed(1) : "0",
    }));
    if (othersServices > 0) {
      result.push({
        name: c.othersBrandLabel,
        value: othersServices,
        pct: totalServiceCount > 0 ? ((othersServices / totalServiceCount) * 100).toFixed(1) : "0",
      });
    }
    return result;
  }, [brandPerformance, totalServiceCount]);

  const seriesProxyData = useMemo(() => {
    return SERIES_PRESETS.map((series) => {
      const brands = new Set(series.brands.map(normalizeBrandName));
      const rows = filteredRawRows.filter((r) => brands.has(normalizeBrandName(r.br)));
      const services = rows.reduce((s, r) => s + r.svc, 0);
      const grams = rows.reduce((s, r) => s + r.gr, 0);
      const visits = rows.reduce((s, r) => s + r.vis, 0);
      const salons = new Set(rows.map((r) => r.uid)).size;
      const months = new Set(rows.map((r) => r.mk)).size;
      const color = rows.reduce((s, r) => s + r.cs, 0);
      const highlights = rows.reduce((s, r) => s + r.hs, 0);
      const toner = rows.reduce((s, r) => s + r.ts, 0);
      const straightening = rows.reduce((s, r) => s + r.ss, 0);
      const others = rows.reduce((s, r) => s + r.os, 0);
      const company = getBrandCompany(series.brands[0]) || "Independent / Other";
      return {
        ...series,
        brandLabel: [...brands].join(", "),
        company,
        services,
        grams,
        visits,
        salons,
        months,
        color,
        highlights,
        toner,
        straightening,
        others,
        share: totalServiceCount > 0 ? (services / totalServiceCount) * 100 : 0,
      };
    })
      .filter((series) => series.services > 0)
      .sort((a, b) => b.services - a.services);
  }, [filteredRawRows, totalServiceCount]);

  // City share data (top 10)
  const cityShareData = useMemo(() => {
    const totalCityServices = cityBreakdown.reduce((s, c) => s + c.services, 0);
    const top10 = cityBreakdown.slice(0, 10);
    return top10.map((c) => ({
      name: c.city,
      value: c.services,
      revenue: Math.round(c.revenue),
      pct: totalCityServices > 0 ? ((c.services / totalCityServices) * 100).toFixed(1) : "0",
    }));
  }, [cityBreakdown]);

  const unknownCityUsers = useMemo(
    () => userDetails.filter((u) => u.city === UNKNOWN_CITY_LABEL),
    [userDetails]
  );

  // Available months for comparison (always from all data, not filtered)
  const compareMonths = useMemo(() => {
    const months = new Set<string>();
    for (const r of israelRawRows) months.add(r.mk);
    const monthOrder: Record<string, number> = {};
    for (const r of israelRawRows) monthOrder[r.mk] = r.si;
    return [...months].sort((a, b) => (monthOrder[a] || 0) - (monthOrder[b] || 0));
  }, []);

  // Set default comparison months
  useEffect(() => {
    if (compareMonths.length >= 2 && !compareMonthA && !compareMonthB) {
      const lastMonth = compareMonths[compareMonths.length - 1];
      const prevYearMonth = compareMonths.find((m) => {
        const [monthName, year] = [m.split(" ")[0], parseInt(m.split(" ")[1])];
        const [lastMonthName, lastYear] = [lastMonth.split(" ")[0], parseInt(lastMonth.split(" ")[1])];
        return monthName === lastMonthName && year === lastYear - 1;
      });
      setCompareMonthB(lastMonth);
      setCompareMonthA(prevYearMonth || compareMonths[compareMonths.length - 2]);
    }
  }, [compareMonths, compareMonthA, compareMonthB]);

  // Per-user monthly data for comparison
  const userMonthlyData = useMemo(() => {
    const map: Record<string, Record<string, {
      services: number; visits: number; revenue: number; grams: number;
      color: number; highlights: number; toner: number; straightening: number; others: number;
      brands: Set<string>;
    }>> = {};
    for (const r of filteredRawRows) {
      if (!map[r.uid]) map[r.uid] = {};
      if (!map[r.uid][r.mk]) {
        map[r.uid][r.mk] = {
          services: 0, visits: 0, revenue: 0, grams: 0,
          color: 0, highlights: 0, toner: 0, straightening: 0, others: 0,
          brands: new Set(),
        };
      }
      const d = map[r.uid][r.mk];
      d.services += r.svc; d.visits += r.vis; d.revenue += r.cost; d.grams += r.gr;
      d.color += r.cs; d.highlights += r.hs; d.toner += r.ts;
      d.straightening += r.ss; d.others += r.os;
      d.brands.add(normalizeBrandName(r.br));
    }
    return map;
  }, [filteredRawRows]);

  // Comparison results
  const comparisonData = useMemo(() => {
    if (!compareMonthA || !compareMonthB) return null;
    const usersToCompare = userDetails.map((u) => u.userId);

    const rows = usersToCompare.map((uid) => {
      const a = userMonthlyData[uid]?.[compareMonthA];
      const b = userMonthlyData[uid]?.[compareMonthB];
      const user = userDetails.find((u) => u.userId === uid);
      return {
        userId: uid,
        city: user?.city || c.unknownCityDisplay,
        salonType: user?.salonType || "",
        aServices: a?.services || 0,
        bServices: b?.services || 0,
        aVisits: a?.visits || 0,
        bVisits: b?.visits || 0,
        aRevenue: a?.revenue || 0,
        bRevenue: b?.revenue || 0,
        aGrams: a?.grams || 0,
        bGrams: b?.grams || 0,
        aColor: a?.color || 0,
        bColor: b?.color || 0,
        aHighlights: a?.highlights || 0,
        bHighlights: b?.highlights || 0,
        aToner: a?.toner || 0,
        bToner: b?.toner || 0,
        aStraightening: a?.straightening || 0,
        bStraightening: b?.straightening || 0,
        aBrands: a?.brands?.size || 0,
        bBrands: b?.brands?.size || 0,
        hasData: !!(a || b),
      };
    }).filter((r) => r.hasData);

    // Totals
    const totals = {
      aServices: rows.reduce((s, r) => s + r.aServices, 0),
      bServices: rows.reduce((s, r) => s + r.bServices, 0),
      aVisits: rows.reduce((s, r) => s + r.aVisits, 0),
      bVisits: rows.reduce((s, r) => s + r.bVisits, 0),
      aRevenue: rows.reduce((s, r) => s + r.aRevenue, 0),
      bRevenue: rows.reduce((s, r) => s + r.bRevenue, 0),
      aGrams: rows.reduce((s, r) => s + r.aGrams, 0),
      bGrams: rows.reduce((s, r) => s + r.bGrams, 0),
      aColor: rows.reduce((s, r) => s + r.aColor, 0),
      bColor: rows.reduce((s, r) => s + r.bColor, 0),
      aHighlights: rows.reduce((s, r) => s + r.aHighlights, 0),
      bHighlights: rows.reduce((s, r) => s + r.bHighlights, 0),
      aToner: rows.reduce((s, r) => s + r.aToner, 0),
      bToner: rows.reduce((s, r) => s + r.bToner, 0),
      aStraightening: rows.reduce((s, r) => s + r.aStraightening, 0),
      bStraightening: rows.reduce((s, r) => s + r.bStraightening, 0),
    };

    // Chart data for service type comparison
    const serviceCompareChart = [
      { name: c.cmpSvcColor, monthA: totals.aColor, monthB: totals.bColor },
      { name: c.cmpSvcHighlights, monthA: totals.aHighlights, monthB: totals.bHighlights },
      { name: c.cmpSvcToner, monthA: totals.aToner, monthB: totals.bToner },
      { name: c.cmpSvcStraightening, monthA: totals.aStraightening, monthB: totals.bStraightening },
    ];

    // KPI comparison
    const kpis = [
      { label: c.cmpKpiServices, a: totals.aServices, b: totals.bServices },
      { label: c.cmpKpiVisits, a: totals.aVisits, b: totals.bVisits },
      { label: c.cmpKpiMaterial, a: totals.aGrams, b: totals.bGrams },
    ];

    return { rows, totals, serviceCompareChart, kpis };
  }, [compareMonthA, compareMonthB, userMonthlyData, userDetails]);

  // ── Cohort tab state ────────────────────────────────────────────
  interface CohortMeta { id: number; name: string; description: string | null; start_month: string; end_month: string; member_count: number; }
  interface SavedPreset { id: string; name: string; userIds: string[]; }
  const COHORT_API = "/.netlify/functions/loreal-cohorts";
  const cohortHeaders: Record<string, string> = { "Content-Type": "application/json", "X-Access-Code": ACCESS_CODE };

  const [cohorts, setCohorts] = useState<CohortMeta[]>([]);
  const [activeCohortId, setActiveCohortId] = useState<number | null>(null);
  const [cohortMembers, setCohortMembers] = useState<string[]>([]);
  const [cohortLoading, setCohortLoading] = useState(false);
  const [cohortUserSearch, setCohortUserSearch] = useState("");
  const [cohortSelectedUser, setCohortSelectedUser] = useState<string | null>(null);
  const [newCohortName, setNewCohortName] = useState("");
  const [newCohortStart, setNewCohortStart] = useState("Jan 2025");
  const [newCohortEnd, setNewCohortEnd] = useState("Jan 2026");
  const [cohortError, setCohortError] = useState<string | null>(null);
  const [yoySortField, setYoySortField] = useState<string>("pct");
  const [yoySortDir, setYoySortDir] = useState<"asc" | "desc">("desc");
  const [editingCohortDates, setEditingCohortDates] = useState(false);
  const [editCohortStart, setEditCohortStart] = useState("");
  const [editCohortEnd, setEditCohortEnd] = useState("");
  const [cohortLocalStart, setCohortLocalStart] = useState(() => availableMonths[0]?.label || "Jan 2024");
  const [cohortLocalEnd, setCohortLocalEnd] = useState(() => availableMonths[availableMonths.length - 1]?.label || "Dec 2025");

  // Saved group presets (named sets of user IDs stored in localStorage)
  const [savedPresets, setSavedPresets] = useState<SavedPreset[]>(() => {
    try { return JSON.parse(localStorage.getItem("loreal_group_presets") || "[]"); } catch { return []; }
  });
  const [newPresetName, setNewPresetName] = useState("");
  const [showPresetsPanel, setShowPresetsPanel] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [presetUserSearch, setPresetUserSearch] = useState("");

  const cohortRequest = useCallback(async (
    path: string,
    opts?: { method?: string; body?: unknown },
  ): Promise<any> => {
    const url = `${COHORT_API}${path}`;
    const init: RequestInit = { headers: cohortHeaders, method: opts?.method || "GET" };
    if (opts?.body) init.body = JSON.stringify(opts.body);
    let res: Response;
    try {
      res = await fetch(url, init);
    } catch (e: any) {
      const msg = locale === "en"
        ? "Connection error — make sure the site runs with netlify dev or is deployed to Netlify before using groups."
        : "שגיאת חיבור — ודא שהאתר רץ עם netlify dev או שפרוס ל-Netlify לפני שימוש בקבוצות.";
      setCohortError(msg);
      throw new Error(msg);
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data.error || (locale === "en" ? `Error ${res.status}` : `שגיאה ${res.status}`);
      setCohortError(msg);
      throw new Error(msg);
    }
    setCohortError(null);
    return data;
  }, []);

  const loadCohorts = useCallback(async () => {
    try {
      const data = await cohortRequest("");
      if (data.cohorts) setCohorts(data.cohorts);
    } catch {}
  }, [cohortRequest]);

  const loadMembers = useCallback(async (id: number) => {
    try {
      const data = await cohortRequest(`/${id}/members`);
      if (data.members) setCohortMembers(data.members);
    } catch {}
  }, [cohortRequest]);

  useEffect(() => {
    if (activeTab === "cohorts") loadCohorts();
  }, [activeTab, loadCohorts]);

  useEffect(() => {
    if (activeCohortId) loadMembers(activeCohortId);
    else setCohortMembers([]);
    setCohortSelectedUser(null);
  }, [activeCohortId, loadMembers]);

  const createCohort = useCallback(async () => {
    if (!newCohortName.trim()) return;
    setCohortLoading(true);
    try {
      const data = await cohortRequest("", {
        method: "POST",
        body: { name: newCohortName, start_month: newCohortStart, end_month: newCohortEnd },
      });
      if (data.cohort) {
        await loadCohorts();
        setActiveCohortId(data.cohort.id);
        setNewCohortName("");
      }
    } catch {} finally { setCohortLoading(false); }
  }, [newCohortName, cohortRequest, loadCohorts]);

  const deleteCohort = useCallback(async (id: number) => {
    try {
      await cohortRequest(`/${id}`, { method: "DELETE" });
      if (activeCohortId === id) { setActiveCohortId(null); setCohortMembers([]); }
      await loadCohorts();
    } catch {}
  }, [activeCohortId, cohortRequest, loadCohorts]);

  const addMember = useCallback(async (userId: string) => {
    if (activeCohortId) {
      try {
        await cohortRequest(`/${activeCohortId}/members`, {
          method: "POST", body: { user_ids: [userId] },
        });
        await loadMembers(activeCohortId);
        await loadCohorts();
      } catch {}
    } else {
      setCohortMembers((prev) => prev.includes(userId) ? prev : [...prev, userId]);
    }
  }, [activeCohortId, cohortRequest, loadMembers, loadCohorts]);

  const removeMember = useCallback(async (userId: string) => {
    if (activeCohortId) {
      try {
        await cohortRequest(`/${activeCohortId}/members/${encodeURIComponent(userId)}`, { method: "DELETE" });
        if (cohortSelectedUser === userId) setCohortSelectedUser(null);
        await loadMembers(activeCohortId);
        await loadCohorts();
      } catch {}
    } else {
      setCohortMembers((prev) => prev.filter((id) => id !== userId));
      if (cohortSelectedUser === userId) setCohortSelectedUser(null);
    }
  }, [activeCohortId, cohortSelectedUser, cohortRequest, loadMembers, loadCohorts]);

  const loadCohortToWorking = useCallback((cohort: { id: number; start_month: string; end_month: string }) => {
    setActiveCohortId(cohort.id);
    setCohortLocalStart(cohort.start_month);
    setCohortLocalEnd(cohort.end_month);
    setCohortSelectedUser(null);
  }, []);

  const saveCurrentAsCohort = useCallback(async () => {
    if (!newCohortName.trim()) return;
    setCohortLoading(true);
    try {
      const data = await cohortRequest("", {
        method: "POST",
        body: { name: newCohortName, start_month: cohortLocalStart, end_month: cohortLocalEnd, user_ids: cohortMembers },
      });
      if (data.cohort) {
        await loadCohorts();
        setActiveCohortId(data.cohort.id);
        setNewCohortName("");
      }
    } catch {} finally { setCohortLoading(false); }
  }, [newCohortName, cohortLocalStart, cohortLocalEnd, cohortMembers, cohortRequest, loadCohorts]);

  const duplicateCohort = useCallback(async (id: number) => {
    const source = cohorts.find((c) => c.id === id);
    if (!source) return;
    setCohortLoading(true);
    try {
      const membersData = await cohortRequest(`/${id}/members`);
      const memberIds: string[] = membersData.members || [];
      const data = await cohortRequest("", {
        method: "POST",
        body: {
          name: `${source.name}${c.duplicateSuffix}`,
          start_month: source.start_month,
          end_month: source.end_month,
          user_ids: memberIds,
        },
      });
      if (data.cohort) {
        await loadCohorts();
        setActiveCohortId(data.cohort.id);
      }
    } catch {} finally { setCohortLoading(false); }
  }, [cohorts, cohortRequest, loadCohorts]);

  const updateCohortDates = useCallback(async (id: number, startMonth: string, endMonth: string) => {
    try {
      await cohortRequest(`/${id}`, {
        method: "PATCH",
        body: { start_month: startMonth, end_month: endMonth },
      });
      await loadCohorts();
      setEditingCohortDates(false);
    } catch {}
  }, [cohortRequest, loadCohorts]);

  const createPreset = useCallback((name: string, userIds: string[] = []) => {
    if (!name.trim()) return;
    const preset = { id: Date.now().toString(), name: name.trim(), userIds: [...new Set(userIds)] };
    setSavedPresets((prev) => {
      const updated = [preset, ...prev];
      localStorage.setItem("loreal_group_presets", JSON.stringify(updated));
      return updated;
    });
    setActivePresetId(preset.id);
    setShowPresetsPanel(true);
    setNewPresetName("");
  }, []);

  const deletePreset = useCallback((id: string) => {
    setSavedPresets((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      localStorage.setItem("loreal_group_presets", JSON.stringify(updated));
      return updated;
    });
    if (activePresetId === id) setActivePresetId(null);
  }, [activePresetId]);

  const updatePresetMembers = useCallback((presetId: string, updater: (prevIds: string[]) => string[]) => {
    setSavedPresets((prev) => {
      const updated = prev.map((preset) => {
        if (preset.id !== presetId) return preset;
        return { ...preset, userIds: [...new Set(updater(preset.userIds))] };
      });
      localStorage.setItem("loreal_group_presets", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addMemberToPreset = useCallback((presetId: string, userId: string) => {
    updatePresetMembers(presetId, (prevIds) => prevIds.includes(userId) ? prevIds : [...prevIds, userId]);
  }, [updatePresetMembers]);

  const removeMemberFromPreset = useCallback((presetId: string, userId: string) => {
    updatePresetMembers(presetId, (prevIds) => prevIds.filter((id) => id !== userId));
  }, [updatePresetMembers]);

  const loadPresetToCurrentCohort = useCallback(async (presetUserIds: string[]) => {
    if (!activeCohortId || !presetUserIds.length) return;
    setCohortLoading(true);
    try {
      await cohortRequest(`/${activeCohortId}/members`, { method: "POST", body: { user_ids: presetUserIds } });
      await loadMembers(activeCohortId);
      await loadCohorts();
    } catch {} finally { setCohortLoading(false); }
  }, [activeCohortId, cohortRequest, loadMembers, loadCohorts]);

  // Dynamic month range from active cohort metadata
  const activePreset = useMemo(
    () => savedPresets.find((preset) => preset.id === activePresetId) || null,
    [savedPresets, activePresetId]
  );
  const activeCohort = cohorts.find((c) => c.id === activeCohortId) || null;
  // Sync local date range when a saved cohort is loaded
  useEffect(() => {
    if (activeCohort) {
      setCohortLocalStart(activeCohort.start_month);
      setCohortLocalEnd(activeCohort.end_month);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCohort?.id]);
  const cohortMonthSequence = useMemo(() => {
    if (!cohortLocalStart || !cohortLocalEnd) return [];
    return generateMonthSequence(cohortLocalStart, cohortLocalEnd);
  }, [cohortLocalStart, cohortLocalEnd]);
  const cohortRangeLabel = cohortLocalStart && cohortLocalEnd ? `${cohortLocalStart} – ${cohortLocalEnd}` : "";

  // Cohort monthly trend (filtered by cohort members within cohort date range)
  const cohortTrend = useMemo(() => {
    if (!cohortMembers.length || !cohortMonthSequence.length) return [];
    const memberSet = new Set(cohortMembers);
    const seqSet = new Set(cohortMonthSequence);
    const rows = applyServiceFilter(applyCohortAnalysisFilter(israelRawRows.filter((r) => memberSet.has(r.uid) && seqSet.has(r.mk))));
    const map: Record<string, { label: string; si: number; color: number; highlights: number; toner: number; straightening: number; others: number; visits: number; grams: number; services: number }> = {};
    for (const m of cohortMonthSequence) {
      map[m] = { label: m, si: 0, color: 0, highlights: 0, toner: 0, straightening: 0, others: 0, visits: 0, grams: 0, services: 0 };
    }
    for (const r of rows) {
      const e = map[r.mk]; if (!e) continue;
      e.si = r.si; e.color += r.cs; e.highlights += r.hs; e.toner += r.ts;
      e.straightening += r.ss; e.others += r.os; e.visits += r.vis; e.grams += r.gr;
      e.services += r.svc;
    }
    return cohortMonthSequence.map((m) => map[m]);
  }, [cohortMembers, cohortMonthSequence, applyServiceFilter, applyCohortAnalysisFilter]);

  // Month-over-month % change for cohort trend (grams-based)
  const cohortMomPct = useMemo(() => {
    return cohortTrend.map((m, i) => {
      const prev = i > 0 ? cohortTrend[i - 1] : null;
      return {
        label: m.label,
        grams: m.grams,
        services: m.services,
        gramsPct: prev ? pctChange(m.grams, prev.grams) : null,
        servicesPct: prev ? pctChange(m.services, prev.services) : null,
      };
    });
  }, [cohortTrend]);

  // January-vs-January comparison within cohort
  const cohortJanVsJan = useMemo(() => {
    const janEntries = cohortTrend.filter((m) => m.label.startsWith("Jan "));
    if (janEntries.length < 2) return null;
    const pairs: { yearA: string; yearB: string; gramsA: number; gramsB: number; gramsPct: number | null; servicesA: number; servicesB: number; servicesPct: number | null }[] = [];
    for (let i = 1; i < janEntries.length; i++) {
      const a = janEntries[i - 1];
      const b = janEntries[i];
      pairs.push({
        yearA: a.label, yearB: b.label,
        gramsA: a.grams, gramsB: b.grams, gramsPct: pctChange(b.grams, a.grams),
        servicesA: a.services, servicesB: b.services, servicesPct: pctChange(b.services, a.services),
      });
    }
    return pairs;
  }, [cohortTrend]);

  // Per-user January-vs-January grams + services comparison
  const cohortUserYoY = useMemo(() => {
    if (!cohortMembers.length || !cohortMonthSequence.length) return [];
    const memberSet = new Set(cohortMembers);
    const janMonths = cohortMonthSequence.filter((m) => m.startsWith("Jan "));
    if (janMonths.length < 2) return [];
    const janSet = new Set(janMonths);
    const rows = applyServiceFilter(applyCohortAnalysisFilter(israelRawRows.filter((r) => memberSet.has(r.uid) && janSet.has(r.mk))));

    const userMonthGrams: Record<string, Record<string, number>> = {};
    const userMonthServices: Record<string, Record<string, number>> = {};
    for (const r of rows) {
      if (!userMonthGrams[r.uid]) userMonthGrams[r.uid] = {};
      userMonthGrams[r.uid][r.mk] = (userMonthGrams[r.uid][r.mk] || 0) + r.gr;
      if (!userMonthServices[r.uid]) userMonthServices[r.uid] = {};
      userMonthServices[r.uid][r.mk] = (userMonthServices[r.uid][r.mk] || 0) + r.svc;
    }
    const result = cohortMembers.map((uid) => {
      const mg = userMonthGrams[uid] || {};
      const ms = userMonthServices[uid] || {};
      const entry: Record<string, any> = { userId: uid };
      for (const jm of janMonths) {
        entry[jm] = Math.round(mg[jm] || 0);
        entry[`svc_${jm}`] = Math.round(ms[jm] || 0);
      }
      const last = janMonths[janMonths.length - 1];
      const prev = janMonths[janMonths.length - 2];
      entry.pct = pctChange(mg[last] || 0, mg[prev] || 0);
      entry.pctServices = pctChange(ms[last] || 0, ms[prev] || 0);
      return entry;
    });
    result.sort((a, b) => (b[janMonths[0]] || 0) - (a[janMonths[0]] || 0));
    return { janMonths, rows: result };
  }, [cohortMembers, cohortMonthSequence, applyServiceFilter, applyCohortAnalysisFilter]);

  // Cohort brand breakdown (aggregate by brand for active cohort)
  const cohortBrandBreakdown = useMemo(() => {
    if (!cohortMembers.length || !cohortMonthSequence.length) return [];
    const memberSet = new Set(cohortMembers);
    const seqSet = new Set(cohortMonthSequence);
    const rows = applyServiceFilter(applyCohortAnalysisFilter(israelRawRows.filter((r) => memberSet.has(r.uid) && seqSet.has(r.mk))));
    const map: Record<string, { brand: string; services: number; revenue: number; grams: number; visits: number; users: Set<string> }> = {};
    for (const r of rows) {
      const brand = normalizeBrandName(r.br);
      if (!map[brand]) map[brand] = { brand, services: 0, revenue: 0, grams: 0, visits: 0, users: new Set() };
      const b = map[brand];
      b.services += r.svc; b.revenue += r.cost; b.grams += r.gr; b.visits += r.vis;
      b.users.add(r.uid);
    }
    return Object.values(map)
      .map((b) => ({ ...b, userCount: b.users.size, users: undefined }))
      .sort((a, b) => b.services - a.services);
  }, [cohortMembers, cohortMonthSequence, applyServiceFilter, applyCohortAnalysisFilter]);

  const cohortBrandTotal = useMemo(() => cohortBrandBreakdown.reduce((s, b) => s + b.services, 0), [cohortBrandBreakdown]);

  const exportCohortBrands = useCallback(() => {
    if (!cohortBrandBreakdown.length) return;
    const headers = c.cohCsvBrandHeaders;
    const rows = cohortBrandBreakdown.map((b) => [
      b.brand, b.services, Math.round(b.revenue), Math.round(b.grams), b.visits, b.userCount,
      cohortBrandTotal > 0 ? ((b.services / cohortBrandTotal) * 100).toFixed(1) : "0",
    ]);
    downloadCsv(`cohort-brands-${activeCohort?.name || "export"}.csv`, headers, rows);
  }, [cohortBrandBreakdown, cohortBrandTotal, activeCohort]);

  const exportCohortTrend = useCallback(() => {
    if (!cohortTrend.length) return;
    const headers = c.cohCsvTrendHeaders;
    const rows = cohortTrend.map((m) => [m.label, m.services, m.visits, m.grams, m.color, m.highlights, m.toner, m.straightening, m.others]);
    downloadCsv(`cohort-trend-${activeCohort?.name || "export"}.csv`, headers, rows);
  }, [cohortTrend, activeCohort]);

  const exportCohortMomPct = useCallback(() => {
    if (!cohortMomPct.length) return;
    const headers = c.cohCsvMomHeaders;
    const rows = cohortMomPct.map((m) => [
      m.label, m.grams, m.gramsPct !== null ? m.gramsPct.toFixed(1) : "", m.services, m.servicesPct !== null ? m.servicesPct.toFixed(1) : "",
    ]);
    downloadCsv(`cohort-monthly-change-${activeCohort?.name || "export"}.csv`, headers, rows);
  }, [cohortMomPct, activeCohort]);

  // Competitor detection: first-seen brands per month within cohort
  const cohortCompetitors = useMemo(() => {
    if (!cohortMembers.length || !cohortMonthSequence.length) return [];
    const memberSet = new Set(cohortMembers);
    const seqSet = new Set(cohortMonthSequence);
    const rows = applyServiceFilter(applyCohortAnalysisFilter(israelRawRows.filter((r) => memberSet.has(r.uid) && seqSet.has(r.mk))));
    const seenBrands = new Set<string>();
    const result: { month: string; brands: { brand: string; services: number; dominantType: string }[] }[] = [];
    for (const month of cohortMonthSequence) {
      const monthRows = rows.filter((r) => r.mk === month);
      const brandMap: Record<string, { svc: number; color: number; highlights: number; toner: number; straightening: number; others: number }> = {};
      for (const r of monthRows) {
        const brand = normalizeBrandName(r.br);
        if (!brandMap[brand]) brandMap[brand] = { svc: 0, color: 0, highlights: 0, toner: 0, straightening: 0, others: 0 };
        const b = brandMap[brand];
        b.svc += r.svc; b.color += r.cs; b.highlights += r.hs; b.toner += r.ts; b.straightening += r.ss; b.others += r.os;
      }
      const newBrands: { brand: string; services: number; dominantType: string }[] = [];
      for (const [brand, stats] of Object.entries(brandMap)) {
        if (!seenBrands.has(brand)) {
          const types = [
            { type: c.svcColor, val: stats.color }, { type: c.svcHighlights, val: stats.highlights },
            { type: c.svcToner, val: stats.toner }, { type: c.svcStraightening, val: stats.straightening }, { type: c.svcOthers, val: stats.others },
          ];
          const dominant = types.reduce((a, b) => (b.val > a.val ? b : a), types[0]);
          newBrands.push({ brand, services: stats.svc, dominantType: dominant.type });
          seenBrands.add(brand);
        }
      }
      result.push({ month, brands: newBrands.sort((a, b) => b.services - a.services) });
    }
    return result;
  }, [cohortMembers, cohortMonthSequence, applyServiceFilter, applyCohortAnalysisFilter]);

  // Per-user drill-down trend (selected user within cohort)
  const selectedUserTrend = useMemo(() => {
    if (!cohortSelectedUser || !cohortMonthSequence.length) return [];
    const seqSet = new Set(cohortMonthSequence);
    const rows = applyServiceFilter(applyCohortAnalysisFilter(israelRawRows.filter((r) => r.uid === cohortSelectedUser && seqSet.has(r.mk))));
    return cohortMonthSequence.map((m) => {
      const mRows = rows.filter((r) => r.mk === m);
      return {
        label: m,
        services: mRows.reduce((s, r) => s + r.svc, 0),
        visits: mRows.reduce((s, r) => s + r.vis, 0),
        grams: mRows.reduce((s, r) => s + r.gr, 0),
        color: mRows.reduce((s, r) => s + r.cs, 0),
        highlights: mRows.reduce((s, r) => s + r.hs, 0),
        toner: mRows.reduce((s, r) => s + r.ts, 0),
        straightening: mRows.reduce((s, r) => s + r.ss, 0),
        others: mRows.reduce((s, r) => s + r.os, 0),
      };
    });
  }, [cohortSelectedUser, cohortMonthSequence, applyServiceFilter, applyCohortAnalysisFilter]);

  // Cohort user search results (from all Israel users, for adding to cohort)
  const cohortSearchResults = useMemo(() => {
    if (!cohortUserSearch) return allUserDetails.slice(0, 30);
    const term = cohortUserSearch.toLowerCase();
    return allUserDetails.filter(
      (u) => u.userId.toLowerCase().includes(term) || u.city.toLowerCase().includes(term)
    ).slice(0, 50);
  }, [cohortUserSearch, allUserDetails]);

  const presetSearchResults = useMemo(() => {
    if (!presetUserSearch) return allUserDetails.slice(0, 30);
    const term = presetUserSearch.toLowerCase();
    return allUserDetails.filter(
      (u) => u.userId.toLowerCase().includes(term) || u.city.toLowerCase().includes(term)
    ).slice(0, 50);
  }, [presetUserSearch, allUserDetails]);

  // Tab buttons
  const tabs = [
    { key: "overview", label: c.tabOverview },
    { key: "brands", label: c.tabBrands },
    { key: "series", label: "Series Mapping" },
    { key: "cities", label: c.tabCities },
    { key: "users", label: c.tabUsers },
    { key: "compare", label: c.tabCompare },
    { key: "cohorts", label: c.tabCohorts },
    { key: "populations", label: c.tabPopulations },
    { key: "cells", label: c.tabCells },
    { key: "cell-comparison", label: c.tabCellComparison },
  ] as const;

  return (
    <div dir={c.dir} className="min-h-[100dvh] bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200 flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">{title}</h1>
              <p className="text-[10px] sm:text-xs text-gray-500">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="text-left">
              <label className="block text-[10px] sm:text-xs text-gray-400 mb-0.5">{c.headerFrom}</label>
              <select
                value={dateFrom}
                onChange={(e) => {
                  const v = e.target.value;
                  setDateFrom(v);
                  const si = availableMonths.find((m) => m.label === v)?.si ?? 0;
                  const toSi = availableMonths.find((m) => m.label === dateTo)?.si ?? Infinity;
                  if (si > toSi) setDateTo(v);
                }}
                className="text-xs sm:text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 cursor-pointer"
              >
                {availableMonths.map((m) => (
                  <option key={m.label} value={m.label}>{m.label}</option>
                ))}
              </select>
            </div>
            <span className="text-gray-300 text-sm mt-4">–</span>
            <div className="text-left">
              <label className="block text-[10px] sm:text-xs text-gray-400 mb-0.5">{c.headerTo}</label>
              <select
                value={dateTo}
                onChange={(e) => {
                  const v = e.target.value;
                  setDateTo(v);
                  const si = availableMonths.find((m) => m.label === v)?.si ?? Infinity;
                  const fromSi = availableMonths.find((m) => m.label === dateFrom)?.si ?? 0;
                  if (si < fromSi) setDateFrom(v);
                }}
                className="text-xs sm:text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 cursor-pointer"
              >
                {availableMonths.map((m) => (
                  <option key={m.label} value={m.label}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {/* Service type filter bar */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-2 border-t border-gray-100 flex items-center gap-2.5 flex-wrap">
          <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400 whitespace-nowrap">{c.headerServiceTypes}</span>
          {ALL_SERVICE_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => toggleServiceType(type)}
              className={`inline-flex min-w-[72px] items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
                enabledServiceTypes.has(type)
                  ? "border-transparent text-white shadow-sm"
                  : "bg-white border-gray-200 text-gray-400"
              }`}
              style={enabledServiceTypes.has(type) ? { backgroundColor: SERVICE_COLORS[type] } : undefined}
            >
              {SERVICE_LABELS[type]}
            </button>
          ))}
          {!allServicesEnabled && (
            <button
              onClick={() => setEnabledServiceTypes(new Set(ALL_SERVICE_TYPES))}
              className="text-[10px] text-indigo-500 hover:text-indigo-700 font-medium transition-colors ml-1"
            >
              {c.headerShowAll}
            </button>
          )}
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
          <KpiCard
            label={c.kpiActiveSalons}
            value={fmtNumber(summary.uniqueUsers)}
            sub={c.kpiOnPlatform}
            color="indigo"
            icon={<svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>}
          />
          <KpiCard
            label={c.kpiTotalVisits}
            value={fmtCompact(summary.totalVisits)}
            sub={fmtNumber(summary.totalVisits)}
            color="emerald"
            icon={<svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>}
          />
          <KpiCard
            label={c.kpiTotalServices}
            value={fmtCompact(summary.totalServices)}
            sub={fmtNumber(summary.totalServices)}
            color="amber"
            icon={<svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" /></svg>}
          />
          <KpiCard
            label={c.kpiAvgServicesPerMonth}
            value={fmtNumber(monthlyTrends.length > 0 ? Math.round(summary.totalServices / monthlyTrends.length) : 0)}
            sub={c.kpiMonths(monthlyTrends.length)}
            color="purple"
            icon={<svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>}
          />
          <KpiCard
            label={c.kpiActiveBrands}
            value={fmtNumber(summary.uniqueBrands)}
            sub={c.kpiCities(summary.uniqueCities)}
            color="pink"
            icon={<svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" /></svg>}
          />
          <KpiCard
            label={c.kpiRawMaterial}
            value={fmtCompact(summary.totalGrams)}
            sub={c.kpiGrams(fmtNumber(summary.totalGrams))}
            color="cyan"
            icon={<svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" /></svg>}
          />
        </div>

        {/* Global Customer Filter */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
          <button
            onClick={() => setShowGlobalFilter(!showGlobalFilter)}
            className="w-full flex items-center justify-between px-4 sm:px-5 py-3 text-sm"
          >
            <div className="flex items-center gap-2.5">
              <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
              </svg>
              <span className="font-medium text-gray-700">{c.filterTitle}</span>
              {globalFilterUsers.length > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                  {c.filterSelected(globalFilterUsers.length)}
                </span>
              )}
              {globalContinuityMin > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                  {c.filterContinuityBadge(globalContinuityMin)}
                </span>
              )}
              {globalFilterUsers.length === 0 && globalContinuityMin === 0 && (
                <span className="text-xs text-gray-400">{c.filterAllCustomers}</span>
              )}
            </div>
            <svg className={`w-4 h-4 text-gray-400 transition-transform ${showGlobalFilter ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {showGlobalFilter && (
            <div className="border-t border-gray-100 px-4 sm:px-5 py-4 space-y-3">
              {/* Selected users chips */}
              {globalFilterUsers.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {globalFilterUsers.map((uid) => {
                    const user = allUserDetails.find((u) => u.userId === uid);
                    return (
                      <span
                        key={uid}
                        onClick={() => setGlobalFilterUsers((prev) => prev.filter((u) => u !== uid))}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-200 cursor-pointer hover:bg-indigo-100 transition-colors"
                      >
                        {uid}
                        {user && <span className="text-gray-400">({user.city})</span>}
                        <span className="text-indigo-400 hover:text-red-500 mr-0.5">✕</span>
                      </span>
                    );
                  })}
                  <button
                    onClick={() => setGlobalFilterUsers([])}
                    className="text-xs text-red-500 hover:text-red-700 px-2 py-1 font-medium"
                  >
                    {c.filterClearAll}
                  </button>
                </div>
              )}

              {/* Search + Sort */}
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={globalFilterSearch}
                  onChange={(e) => setGlobalFilterSearch(e.currentTarget.value)}
                  placeholder={c.filterSearchPlaceholder}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                />
                <select
                  value={globalFilterSort}
                  onChange={(e) => setGlobalFilterSort(e.target.value as any)}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 cursor-pointer min-w-[160px]"
                >
                  <option value="services">{c.filterSortServices}</option>
                  <option value="continuity">{c.filterSortContinuity}</option>
                  <option value="monthsActive">{c.filterSortMonthsActive}</option>
                  <option value="avgServices">{c.filterSortAvgServices}</option>
                  <option value="grams">{c.filterSortGrams}</option>
                </select>
              </div>

              {/* Continuity threshold filter */}
              <div className="flex flex-wrap items-center gap-2 bg-gray-50/80 border border-gray-100 rounded-xl px-3 py-2.5">
                <span className="text-xs font-medium text-gray-500 flex-shrink-0">{c.filterMinContinuity}</span>
                <div className="flex gap-1">
                  {[50, 70, 80, 90].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setGlobalContinuityMin(globalContinuityMin === pct ? 0 : pct)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        globalContinuityMin === pct
                          ? "bg-indigo-500 text-white shadow-sm"
                          : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600"
                      }`}
                    >
                      {pct}%+
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={globalContinuityMin || ""}
                  onChange={(e) => setGlobalContinuityMin(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                  placeholder={c.filterCustom}
                  className="w-16 bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs text-center text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                />
                {globalContinuityMin > 0 && (
                  <button
                    onClick={() => setGlobalContinuityMin(0)}
                    className="text-xs text-red-500 hover:text-red-700 font-medium px-1"
                  >
                    {c.filterClear}
                  </button>
                )}
                <span className="text-[11px] text-gray-400 mr-auto">
                  {c.filterCount(globalFilterSearchResults.length, allUserDetails.length)}
                </span>
              </div>

              {/* Column header */}
              <div className="flex items-center gap-3 px-4 py-2 text-[11px] font-semibold text-gray-400 border-b border-gray-200 bg-gray-50/50 rounded-t-xl">
                <span className="w-5 flex-shrink-0"></span>
                <span className="w-14 flex-shrink-0">ID</span>
                <span className="w-24 flex-shrink-0">{c.filterColCity}</span>
                <span className="w-20 flex-shrink-0 text-center">{c.filterColContinuity}</span>
                <span className="flex-1 text-start">{c.filterColData}</span>
              </div>

              {/* User list */}
              <div className="max-h-[400px] overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-50 -mt-2">
                {globalFilterSearchResults.map((u) => {
                  const isSelected = globalFilterUsers.includes(u.userId);
                  const contColor = u.continuityScore >= 80 ? "bg-emerald-500" : u.continuityScore >= 50 ? "bg-amber-400" : "bg-red-400";
                  const contTextColor = u.continuityScore >= 80 ? "text-emerald-700" : u.continuityScore >= 50 ? "text-amber-700" : "text-red-600";
                  return (
                    <div
                      key={u.userId}
                      onClick={() => {
                        setGlobalFilterUsers((prev) =>
                          isSelected ? prev.filter((id) => id !== u.userId) : [...prev, u.userId]
                        );
                      }}
                      className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                        isSelected ? "bg-indigo-50/70" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected ? "bg-indigo-500 border-indigo-500" : "border-gray-300"
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="font-mono text-xs text-indigo-600 font-bold flex-shrink-0 w-14">{u.userId}</span>
                      <span className="text-sm text-gray-700 w-24 truncate flex-shrink-0">{u.city}</span>
                      {/* Continuity score bar */}
                      <div className="w-20 flex-shrink-0 flex flex-col items-center gap-0.5">
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${contColor}`} style={{ width: `${u.continuityScore}%` }} />
                        </div>
                        <span className={`text-[10px] font-bold ${contTextColor}`}>{u.continuityScore}%</span>
                      </div>
                      <div className="flex-1 flex items-center gap-2 sm:gap-3 text-xs text-gray-400 flex-wrap">
                        <span>{c.filterMonths(u.monthsActive, u.totalPossibleMonths)}</span>
                        <span className="hidden sm:inline">{c.filterServices(fmtNumber(u.services))}</span>
                        <span className="hidden md:inline">{c.filterAvgPerMonth(u.avgServicesPerMonth)}</span>
                        <span className="text-gray-500">{c.filterSince(u.firstMonth)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] text-gray-400 text-center">
                {globalFilterUsers.length > 0
                  ? c.filterActiveNote(globalFilterUsers.length)
                  : c.filterEmptyNote
                }
              </p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-1 bg-white border border-gray-200 rounded-2xl p-1.5 shadow-sm min-w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Overview Tab ─────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Service Category Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              <Card title={c.ovServiceBreakTitle} subtitle={c.ovServiceBreakSub} className="h-full">
                <div className="h-[220px] sm:h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={serviceBreakdown.map((s) => ({
                          name: s.label,
                          value: s.services,
                        }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {serviceBreakdown.map((s, idx) => (
                          <Cell key={idx} fill={SERVICE_COLORS[s.type] || CHART_COLORS[idx]} strokeWidth={0} />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend with percentages */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                  {serviceBreakdown.map((s, idx) => {
                    const pct = totalServiceCount > 0 ? ((s.services / totalServiceCount) * 100).toFixed(1) : "0";
                    return (
                      <div key={s.type} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2.5">
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: SERVICE_COLORS[s.type] || CHART_COLORS[idx] }} />
                        <div className="min-w-0 flex-1 text-left">
                          <p className="text-sm font-medium leading-tight text-gray-800 truncate">{s.label}</p>
                          <p className="mt-0.5 text-xs text-gray-500 tabular-nums">{fmtNumber(s.services)} · {pct}%</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card title={c.ovRawMatTitle} subtitle={c.ovRawMatSub} className="h-full">
                <div className="h-[280px] sm:h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={serviceBreakdown} layout="vertical" margin={{ top: 8, right: 32, left: 18, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                      <XAxis type="number" tickFormatter={(v) => fmtCompact(v)} tick={{ fill: "#64748b", fontSize: 12 }} />
                      <YAxis type="category" dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} width={104} />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="grams" name={c.ovMatGramsLegend} radius={[0, 8, 8, 0]}>
                        {serviceBreakdown.map((s, idx) => (
                          <Cell key={idx} fill={SERVICE_COLORS[s.type] || CHART_COLORS[idx]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Monthly Trends */}
            <Card title={c.ovMonthlyTrendsTitle} subtitle={c.ovMonthlyTrendsSub}>
              <div className="h-[300px] sm:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorServices" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(v) => fmtCompact(v)} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Area type="monotone" dataKey="services" name={c.ovServicesLegend} stroke="#6366F1" fillOpacity={1} fill="url(#colorServices)" strokeWidth={2} />
                    <Area type="monotone" dataKey="visits" name={c.ovVisitsLegend} stroke="#10B981" fillOpacity={1} fill="url(#colorVisits)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Material Consumption Trend */}
            <Card title={c.ovMatTrendTitle} subtitle={c.ovMatTrendSub}>
              <div className="h-[280px] sm:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(v) => fmtCompact(v)} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="grams" name={c.ovMatGramsBarLegend} fill="#0EA5E9" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Monthly % change table (overview) */}
            <Card title={c.ovMonthlyPctTitle} subtitle={c.ovMonthlyPctSub}>
              <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6" onWheel={handleTableWheel}>
                <table className="w-full text-sm min-w-[500px]">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-right py-2 px-2 text-gray-500 font-medium text-xs">{c.ovColMonth}</th>
                      <th className="text-right py-2 px-2 text-gray-500 font-medium text-xs">{c.ovColGrams}</th>
                      <th className="text-right py-2 px-2 text-gray-500 font-medium text-xs">{c.ovColPctChange}</th>
                      <th className="text-right py-2 px-2 text-gray-500 font-medium text-xs">{c.ovColServices}</th>
                      <th className="text-right py-2 px-2 text-gray-500 font-medium text-xs">{c.ovColPctChange}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyTrends.map((m, i) => {
                      const prev = i > 0 ? monthlyTrends[i - 1] : null;
                      const gPct = prev ? pctChange(m.grams, prev.grams) : null;
                      const sPct = prev ? pctChange(m.services, prev.services) : null;
                      const isJan = m.label.startsWith("Jan ");
                      return (
                        <tr key={m.label} className={`border-b border-gray-50 ${isJan ? "bg-indigo-50/30" : ""}`}>
                          <td className={`py-2 px-2 text-gray-700 text-xs font-medium ${isJan ? "font-bold" : ""}`}>{m.label}</td>
                          <td className="py-2 px-2 text-gray-900 text-xs">{fmtNumber(m.grams)}</td>
                          <td className="py-2 px-2 text-xs font-bold">
                            {gPct !== null ? (
                              <span className={gPct >= 0 ? "text-emerald-600" : "text-red-600"}>
                                {gPct >= 0 ? "+" : ""}{gPct.toFixed(1)}%
                              </span>
                            ) : <span className="text-gray-300">–</span>}
                          </td>
                          <td className="py-2 px-2 text-gray-900 text-xs">{fmtNumber(m.services)}</td>
                          <td className="py-2 px-2 text-xs font-bold">
                            {sPct !== null ? (
                              <span className={sPct >= 0 ? "text-emerald-600" : "text-red-600"}>
                                {sPct >= 0 ? "+" : ""}{sPct.toFixed(1)}%
                              </span>
                            ) : <span className="text-gray-300">–</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Jan-vs-Jan overview comparison */}
            {(() => {
              const janRows = monthlyTrends.filter((m) => m.label.startsWith("Jan "));
              if (janRows.length < 2) return null;
              const pairs = [];
              for (let i = 1; i < janRows.length; i++) {
                const a = janRows[i - 1], b = janRows[i];
                pairs.push({ yearA: a.label, yearB: b.label, gramsA: a.grams, gramsB: b.grams, gramsPct: pctChange(b.grams, a.grams), servicesA: a.services, servicesB: b.services, servicesPct: pctChange(b.services, a.services) });
              }
              return (
                <Card title={c.ovJanCompTitle} subtitle={c.ovJanCompSub}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pairs.map((p) => (
                      <div key={`${p.yearA}-${p.yearB}`} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="text-xs text-gray-500 mb-2 font-medium">{p.yearA} → {p.yearB}</div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-[10px] text-gray-400 mb-0.5">{c.ovJanGramsLabel}</p>
                            <p className="text-sm text-gray-700">{fmtNumber(p.gramsA)} → {fmtNumber(p.gramsB)}</p>
                            {p.gramsPct !== null && (
                              <span className={`inline-block mt-1 text-xs font-bold px-1.5 py-0.5 rounded ${p.gramsPct >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                                {p.gramsPct >= 0 ? "+" : ""}{p.gramsPct.toFixed(1)}%
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 mb-0.5">{c.ovJanServicesLabel}</p>
                            <p className="text-sm text-gray-700">{fmtNumber(p.servicesA)} → {fmtNumber(p.servicesB)}</p>
                            {p.servicesPct !== null && (
                              <span className={`inline-block mt-1 text-xs font-bold px-1.5 py-0.5 rounded ${p.servicesPct >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                                {p.servicesPct >= 0 ? "+" : ""}{p.servicesPct.toFixed(1)}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })()}

            {/* Service Type Monthly Trends */}
            <Card title={c.ovServiceTrendsTitle} subtitle={c.ovServiceTrendsSub}>
              <div className="h-[300px] sm:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(v) => fmtCompact(v)} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Area type="monotone" dataKey="color" name={c.svcColor} stackId="1" stroke={SERVICE_COLORS.Color} fill={SERVICE_COLORS.Color} fillOpacity={0.7} />
                    <Area type="monotone" dataKey="highlights" name={c.svcHighlights} stackId="1" stroke={SERVICE_COLORS.Highlights} fill={SERVICE_COLORS.Highlights} fillOpacity={0.7} />
                    <Area type="monotone" dataKey="toner" name={c.svcToner} stackId="1" stroke={SERVICE_COLORS.Toner} fill={SERVICE_COLORS.Toner} fillOpacity={0.7} />
                    <Area type="monotone" dataKey="straightening" name={c.svcStraightening} stackId="1" stroke={SERVICE_COLORS.Straightening} fill={SERVICE_COLORS.Straightening} fillOpacity={0.7} />
                    <Area type="monotone" dataKey="others" name={c.svcOthers} stackId="1" stroke={SERVICE_COLORS.Others} fill={SERVICE_COLORS.Others} fillOpacity={0.7} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Salon Type Breakdown */}
            <Card title={c.ovSalonTypeTitle} subtitle={c.ovSalonTypeSub}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {salonTypeBreakdown.map((st, idx) => (
                  <div key={st.type} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                      <span className="text-sm font-bold text-gray-900">{c.ovSalonTypePrefix(st.type === "לא מוגדר" ? c.unknownSalonTypeDisplay : st.type)}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{st.count}</p>
                    <p className="text-xs text-gray-500">{c.ovSalonCountLabel}</p>
                    <div className="mt-2 pt-2 border-t border-gray-200 space-y-1">
                      <p className="text-xs text-gray-500">{c.ovServicesColon(fmtNumber(st.services))}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Active Users & Brands Trend */}
            <Card title={c.ovActiveSBTitle} subtitle={c.ovActiveSBSub}>
              <div className="h-[280px] sm:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line type="monotone" dataKey="activeUsers" name={c.ovActiveSalonsLegend} stroke="#6366F1" strokeWidth={2.5} dot={{ r: 4, fill: "#6366F1" }} />
                    <Line type="monotone" dataKey="activeBrands" name={c.ovActiveBrandsLegend} stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 4, fill: "#F59E0B" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        {/* ── Brands Tab ──────────────────────────────────────────── */}
        {activeTab === "brands" && (
          <div className="space-y-6">
            {/* Brand Market Share Pie */}
            <Card title={c.brMarketShareTitle} subtitle={c.brMarketShareSub}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                <div className="h-[280px] sm:h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={brandShareData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={110}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {brandShareData.map((_, idx) => (
                          <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} strokeWidth={0} />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {brandShareData.map((b, idx) => (
                    <div key={b.name} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                      <span className="text-sm font-medium text-gray-800 flex-1 truncate">{b.name}</span>
                      <span className="text-sm text-gray-600 font-medium whitespace-nowrap">{fmtNumber(b.value)}</span>
                      <span className="text-xs text-indigo-600 font-bold bg-indigo-50 rounded-md px-2 py-0.5 whitespace-nowrap">{b.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Brand Performance Table */}
            <Card title={c.brDetailedTitle} subtitle={c.brDetailedSub} action={<button onClick={() => { const headers = c.brCsvHeaders; const rows = brandPerformance.map((b) => [b.brand, b.services, Math.round(b.revenue), Math.round(b.grams), b.visits, b.userCount, totalServiceCount > 0 ? ((b.services / totalServiceCount) * 100).toFixed(1) : "0"]); downloadCsv("brand-performance.csv", headers, rows); }} className="text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors">⤓ CSV</button>}>
              <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6" onWheel={handleTableWheel}>
                <table className="w-full text-sm min-w-[600px]">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-right py-3 px-3 text-xs text-gray-500 font-medium">#</th>
                      <th className="text-left py-3 px-3 text-xs text-gray-500 font-medium">{c.brColBrand}</th>
                      <th className="text-right py-3 px-3 text-xs text-gray-500 font-medium">{c.brColServices}</th>
                      <th className="text-right py-3 px-3 text-xs text-gray-500 font-medium">{c.brColVisits}</th>
                      <th className="text-right py-3 px-3 text-xs text-gray-500 font-medium">{c.brColMaterial}</th>
                      <th className="text-right py-3 px-3 text-xs text-gray-500 font-medium">{c.brColSalons}</th>
                      <th className="text-right py-3 px-3 text-xs text-gray-500 font-medium">{c.brColMarketShare}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {brandPerformance.slice(0, 30).map((b, idx) => {
                      const share = totalServiceCount > 0 ? (b.services / totalServiceCount) * 100 : 0;
                      return (
                        <tr key={b.brand} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                          <td className="py-3 px-3 text-right text-xs text-gray-400 tabular-nums">{idx + 1}</td>
                          <td className="py-3 px-3 text-left font-medium text-gray-900">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                              {b.brand}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right text-gray-800 tabular-nums font-medium">{fmtNumber(b.services)}</td>
                          <td className="py-3 px-3 text-right text-gray-700 tabular-nums">{fmtNumber(b.visits)}</td>
                          <td className="py-3 px-3 text-right text-gray-700 tabular-nums">{fmtNumber(b.grams)}</td>
                          <td className="py-3 px-3 text-right text-gray-700 tabular-nums">{(b as any).userCount || "—"}</td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="flex-1 bg-gray-100 rounded-full h-1.5 max-w-[56px]">
                                <div className="h-1.5 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500" style={{ width: `${Math.min(share, 100)}%` }} />
                              </div>
                              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 rounded-md px-1.5 py-0.5 tabular-nums whitespace-nowrap">{share.toFixed(1)}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Brand Monthly Trends */}
            <Card title={c.brTrendsTitle} subtitle={c.brTrendsSub}>
              <div className="h-[300px] sm:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={brandTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(v) => fmtCompact(v)} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend />
                    {top8Brands.map((brand, idx) => (
                      <Line
                        key={brand}
                        type="monotone"
                        dataKey={brand}
                        name={brand}
                        stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Material Usage by Brand */}
            <Card title={c.brMaterialTitle} subtitle={c.brMaterialSub}>
              <div className="h-[350px] sm:h-[450px]" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={brandPerformance.slice(0, 15)} layout="vertical" margin={{ top: 5, right: 40, left: 24, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis type="number" tickFormatter={(v) => fmtCompact(v)} tick={{ fill: "#64748b", fontSize: 11 }} />
                    <YAxis
                      type="category"
                      dataKey="brand"
                      tick={{ fill: "#64748b", fontSize: 11 }}
                      tickFormatter={(value) => String(value).length > 20 ? `${String(value).slice(0, 20)}...` : String(value)}
                      width={180}
                      interval={0}
                    />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="grams" name={c.brGramsLegend} radius={[0, 6, 6, 0]}>
                      {brandPerformance.slice(0, 15).map((_, idx) => (
                        <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        {/* ── Series Mapping Tab ───────────────────────────────────── */}
        {activeTab === "series" && (
          <div className="space-y-6">
            {/* Summary KPIs */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 sm:p-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-200 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Series Families</p>
                  <p className="text-2xl font-bold text-gray-900 tabular-nums">{seriesProxyData.length}</p>
                </div>
              </div>
              <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 sm:p-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-200 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Mapped Services</p>
                  <p className="text-2xl font-bold text-gray-900 tabular-nums">{fmtCompact(seriesProxyData.reduce((s, x) => s + x.services, 0))}</p>
                </div>
              </div>
              <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 sm:p-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-200 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Coverage</p>
                  <p className="text-2xl font-bold text-gray-900 tabular-nums">
                    {totalServiceCount > 0
                      ? ((seriesProxyData.reduce((s, x) => s + x.services, 0) / totalServiceCount) * 100).toFixed(1)
                      : "0"}%
                  </p>
                </div>
              </div>
            </div>

            {/* Disclaimer banner */}
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
              <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-amber-800">Proxy Data — Not Shade-Level</p>
                <p className="mt-0.5 text-sm leading-relaxed text-amber-700">
                  This tab uses manual series-to-brand mapping, not real product or shade-level data. It reflects brand-level usage grouped by mapped series families.
                </p>
              </div>
            </div>

            <Card title="Mapped Series by Service Category" subtitle="Services split by category for each mapped series family">
              <div className="h-[300px] sm:h-[380px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={seriesProxyData} margin={{ top: 12, right: 28, left: 12, bottom: 44 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} interval={0} angle={-22} textAnchor="end" height={64} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(v) => fmtCompact(v)} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "4px" }} />
                    <Bar dataKey="color" name={c.svcColor} stackId="series" fill={SERVICE_COLORS.Color} />
                    <Bar dataKey="highlights" name={c.svcHighlights} stackId="series" fill={SERVICE_COLORS.Highlights} />
                    <Bar dataKey="toner" name={c.svcToner} stackId="series" fill={SERVICE_COLORS.Toner} />
                    <Bar dataKey="straightening" name={c.svcStraightening} stackId="series" fill={SERVICE_COLORS.Straightening} />
                    <Bar dataKey="others" name={c.svcOthers} stackId="series" fill={SERVICE_COLORS.Others} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Series Mapping Detail" subtitle="Mapped families, canonical brands, active salons and category usage">
              <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6" onWheel={handleTableWheel}>
                <table className="w-full table-fixed text-sm min-w-[980px]">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="w-[4%] text-left py-3 px-3 text-xs text-gray-500 font-medium">#</th>
                      <th className="w-[20%] text-left py-3 px-3 text-xs text-gray-500 font-medium">Series Family</th>
                      <th className="w-[18%] text-left py-3 px-3 text-xs text-gray-500 font-medium">Company</th>
                      <th className="w-[16%] text-left py-3 px-3 text-xs text-gray-500 font-medium">Canonical Brand</th>
                      <th className="w-[9%] text-right py-3 px-3 text-xs text-gray-500 font-medium">Services</th>
                      <th className="w-[9%] text-right py-3 px-3 text-xs text-gray-500 font-medium">Material (g)</th>
                      <th className="w-[7%] text-right py-3 px-3 text-xs text-gray-500 font-medium">Salons</th>
                      <th className="w-[7%] text-right py-3 px-3 text-xs text-gray-500 font-medium">Months</th>
                      <th className="w-[10%] text-right py-3 px-3 text-xs text-gray-500 font-medium">Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seriesProxyData.map((series, idx) => (
                      <tr key={series.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-3 text-left text-xs text-gray-400 tabular-nums">{idx + 1}</td>
                        <td className="py-3 px-3 text-left">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                            <div className="min-w-0">
                              <div className="font-medium text-gray-900 leading-tight">{series.name}</div>
                              {series.note && <div className="mt-0.5 text-[11px] text-gray-400 leading-tight">{series.note}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-left">
                          <span className="inline-flex items-center text-xs font-medium text-gray-600 bg-gray-100 rounded-md px-2 py-1 truncate max-w-full">{series.company}</span>
                        </td>
                        <td className="py-3 px-3 text-left text-xs text-gray-600 font-medium truncate">{series.brandLabel}</td>
                        <td className="py-3 px-3 text-right text-gray-800 tabular-nums font-medium">{fmtNumber(series.services)}</td>
                        <td className="py-3 px-3 text-right text-gray-700 tabular-nums">{fmtNumber(series.grams)}</td>
                        <td className="py-3 px-3 text-right text-gray-700 tabular-nums">{series.salons}</td>
                        <td className="py-3 px-3 text-right text-gray-700 tabular-nums">{series.months}</td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="flex-1 bg-gray-100 rounded-full h-1.5 max-w-[56px]">
                              <div className="h-1.5 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500" style={{ width: `${Math.min(series.share, 100)}%` }} />
                            </div>
                            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 rounded-md px-1.5 py-0.5 tabular-nums whitespace-nowrap">{series.share.toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* ── Cities Tab ──────────────────────────────────────────── */}
        {activeTab === "cities" && (
          <div className="space-y-6">
            {/* City Distribution Pie */}
            <Card title={c.ciMarketTitle} subtitle={c.ciMarketSub}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                <div className="h-[280px] sm:h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={cityShareData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={110}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {cityShareData.map((_, idx) => (
                          <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} strokeWidth={0} />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {cityShareData.map((c, idx) => (
                    <div key={c.name} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                      <span className="text-sm font-medium text-gray-800 flex-1 truncate">{c.name}</span>
                      <span className="text-sm text-gray-600 font-medium whitespace-nowrap">{fmtNumber(c.value)}</span>
                      <span className="text-xs text-indigo-600 font-bold bg-indigo-50 rounded-md px-2 py-0.5 whitespace-nowrap">{c.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* City Bar Chart - Services */}
            <Card title={c.ciByServiceTitle} subtitle={c.ciByServiceSub}>
              <div className="h-[300px] sm:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cityShareData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(v) => fmtCompact(v)} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" name={c.ciServicesLegend} radius={[6, 6, 0, 0]}>
                      {cityShareData.map((_, idx) => (
                        <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {unknownCityUsers.length > 0 && (
              <Card
                title={c.ciUnknownTitle}
                subtitle={c.ciUnknownSub}
              >
                <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6" onWheel={handleTableWheel}>
                  <table className="w-full table-fixed text-sm min-w-[520px]">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="w-[22%] text-left py-3 px-3 text-xs text-gray-500 font-medium">User ID</th>
                        <th className="w-[18%] text-right py-3 px-3 text-xs text-gray-500 font-medium">{c.brColServices}</th>
                        <th className="w-[18%] text-right py-3 px-3 text-xs text-gray-500 font-medium">{c.brColVisits}</th>
                        <th className="w-[22%] text-right py-3 px-3 text-xs text-gray-500 font-medium">{c.brColMaterial}</th>
                        <th className="w-[20%] text-right py-3 px-3 text-xs text-gray-500 font-medium">{c.ciColLastMonth}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unknownCityUsers.map((u) => (
                        <tr key={u.userId} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                          <td className="py-3 px-3 text-left font-mono text-xs text-indigo-600 font-bold">{u.userId}</td>
                          <td className="py-3 px-3 text-right text-gray-800 tabular-nums font-medium">{fmtNumber(u.services)}</td>
                          <td className="py-3 px-3 text-right text-gray-700 tabular-nums">{fmtNumber(u.visits)}</td>
                          <td className="py-3 px-3 text-right text-gray-700 tabular-nums">{fmtNumber(u.grams)}</td>
                          <td className="py-3 px-3 text-right text-gray-500 text-xs">{u.lastMonth}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* Full City Table */}
            <Card title={c.ciAllTitle} subtitle={c.ciAllSub}>
              <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6" onWheel={handleTableWheel}>
                <table className="w-full table-fixed text-sm min-w-[720px]">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="w-[6%] text-left py-3 px-3 text-xs text-gray-500 font-medium">#</th>
                      <th className="w-[24%] text-left py-3 px-3 text-xs text-gray-500 font-medium">{c.ciColCity}</th>
                      <th className="w-[10%] text-right py-3 px-3 text-xs text-gray-500 font-medium">{c.brColSalons}</th>
                      <th className="w-[15%] text-right py-3 px-3 text-xs text-gray-500 font-medium">{c.brColServices}</th>
                      <th className="w-[15%] text-right py-3 px-3 text-xs text-gray-500 font-medium">{c.brColVisits}</th>
                      <th className="w-[18%] text-right py-3 px-3 text-xs text-gray-500 font-medium">{c.brColMaterial}</th>
                      <th className="w-[12%] text-right py-3 px-3 text-xs text-gray-500 font-medium">{c.ciColShare}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cityBreakdown.map((c, idx) => {
                      const totalCityServices = cityBreakdown.reduce((s, x) => s + x.services, 0);
                      const share = totalCityServices > 0 ? (c.services / totalCityServices) * 100 : 0;
                      return (
                        <tr key={c.city} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                          <td className="py-3 px-3 text-left text-xs text-gray-400 tabular-nums">{idx + 1}</td>
                          <td className="py-3 px-3 text-left font-medium text-gray-900">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                              {c.city}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right text-gray-700 tabular-nums">{(c as any).userCount || "—"}</td>
                          <td className="py-3 px-3 text-right text-gray-800 tabular-nums font-medium">{fmtNumber(c.services)}</td>
                          <td className="py-3 px-3 text-right text-gray-700 tabular-nums">{fmtNumber(c.visits)}</td>
                          <td className="py-3 px-3 text-right text-gray-700 tabular-nums">{fmtNumber(c.grams)}</td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="flex-1 bg-gray-100 rounded-full h-1.5 max-w-[56px]">
                                <div className="h-1.5 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500" style={{ width: `${Math.min(share, 100)}%` }} />
                              </div>
                              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 rounded-md px-1.5 py-0.5 tabular-nums whitespace-nowrap">{share.toFixed(1)}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* ── Users Tab ──────────────────────────────────────────── */}
        {activeTab === "users" && (
          <div className="space-y-6">
            {/* Summary bar */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
              <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm flex-shrink-0">
                <span className="text-sm text-gray-500">{c.usersTotal} </span>
                <span className="text-sm font-bold text-gray-900">{fmtNumber(userDetails.length)}</span>
              </div>
              <div className="hidden sm:block flex-1" />
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                {/* Search */}
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.currentTarget.value)}
                  placeholder={c.usersSearchPlaceholder}
                  className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 w-full sm:w-64 shadow-sm"
                />
                {/* City filter */}
                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.currentTarget.value)}
                  className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 shadow-sm"
                >
                  <option value="">{c.usersAllCities}</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* User Table */}
            <Card title={c.usersTableTitle} subtitle={c.usersTableSub} action={<button onClick={() => { const headers = c.usersCsvHeaders; const rows = userDetails.map((u) => [u.userId, u.city, u.services, u.visits, Math.round(u.grams), u.brandsUsed, u.monthsActive, u.color, u.highlights, u.toner, u.straightening]); downloadCsv("users-data.csv", headers, rows); }} className="text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors">⤓ CSV</button>}>
              <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6" onWheel={handleTableWheel}>
                <table className="w-full text-sm min-w-[900px]">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {[
                        { key: "userId", label: c.usersColId },
                        { key: "city", label: c.usersColCity },
                        { key: "salonType", label: c.usersColType },
                        { key: "employees", label: c.usersColEmployees },
                        { key: "services", label: c.brColServices },
                        { key: "visits", label: c.brColVisits },
                        { key: "grams", label: c.brColMaterial },
                        { key: "brandsUsed", label: c.usersColBrands },
                        { key: "monthsActive", label: c.usersColMonths },
                        { key: "continuityScore", label: c.usersColContinuity },
                        { key: "color", label: c.svcColor },
                        { key: "highlights", label: c.svcHighlights },
                        { key: "toner", label: c.svcToner },
                        { key: "straightening", label: c.svcStraightening },
                      ].map((col) => (
                        <th
                          key={col.key}
                          onClick={() => handleSort(col.key)}
                          className="text-right py-3 px-2 text-gray-500 font-medium cursor-pointer hover:text-gray-900 transition-colors whitespace-nowrap select-none text-xs sm:text-sm"
                        >
                          <div className="flex items-center gap-1">
                            {col.label}
                            {sortField === col.key && (
                              <span className="text-indigo-500">{sortDir === "desc" ? "▼" : "▲"}</span>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedUsers.slice(0, 100).map((u, idx) => (
                      <tr key={u.userId} className={`border-b border-gray-50 hover:bg-indigo-50/30 transition-colors ${idx % 2 === 0 ? "" : "bg-gray-50/50"}`}>
                        <td className="py-2.5 px-2 font-mono text-xs text-indigo-600 font-medium whitespace-nowrap">{u.userId}</td>
                        <td className="py-2.5 px-2 text-gray-700 whitespace-nowrap">{u.city}</td>
                        <td className="py-2.5 px-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">
                            {u.salonType || "—"}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-gray-700 text-center">{u.employees || "—"}</td>
                        <td className="py-2.5 px-2 text-gray-900 font-medium">{fmtNumber(u.services)}</td>
                        <td className="py-2.5 px-2 text-gray-700">{fmtNumber(u.visits)}</td>
                        <td className="py-2.5 px-2 text-gray-700">{fmtNumber(u.grams)}</td>
                        <td className="py-2.5 px-2 text-gray-700 text-center">{u.brandsUsed}</td>
                        <td className="py-2.5 px-2 text-gray-700 text-center">{u.monthsActive}</td>
                        <td className="py-2.5 px-2">
                          <div className="flex items-center gap-1.5">
                            <div className="w-10 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${u.continuityScore >= 80 ? "bg-emerald-500" : u.continuityScore >= 50 ? "bg-amber-400" : "bg-red-400"}`} style={{ width: `${u.continuityScore}%` }} />
                            </div>
                            <span className={`text-xs font-medium ${u.continuityScore >= 80 ? "text-emerald-600" : u.continuityScore >= 50 ? "text-amber-600" : "text-red-500"}`}>{u.continuityScore}%</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-gray-700">{fmtNumber(u.color)}</td>
                        <td className="py-2.5 px-2 text-gray-700">{fmtNumber(u.highlights)}</td>
                        <td className="py-2.5 px-2 text-gray-700">{fmtNumber(u.toner)}</td>
                        <td className="py-2.5 px-2 text-gray-700">{fmtNumber(u.straightening)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {sortedUsers.length > 100 && (
                  <p className="text-center text-sm text-gray-400 mt-4 py-2">
                    {c.usersShowingLimit(fmtNumber(sortedUsers.length))}
                  </p>
                )}
              </div>
            </Card>

            {/* User detail view - when clicking a user row expand to show their brands */}
            <Card title={c.usersBrandsTitle} subtitle={c.usersBrandsSub}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {userDetails.slice(0, 20).map((u) => (
                  <div key={u.userId} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-mono font-bold text-indigo-600">{u.userId}</span>
                      <span className="text-xs text-gray-400">{u.city}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">{c.usersServiceGrams(fmtNumber(u.services), fmtNumber(u.grams))}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {u.topBrands.map((b) => (
                        <span key={b} className="inline-block px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-medium border border-indigo-100">
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* ── Compare Tab ─────────────────────────────────────────── */}
        {activeTab === "compare" && (
          <div className="space-y-6">
            {/* Controls */}
            <Card title={c.cmpTitle} subtitle={c.cmpSub}>
              <div className="space-y-4">
                {/* Month selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{c.cmpMonthALabel}</label>
                    <select
                      value={compareMonthA}
                      onChange={(e) => setCompareMonthA(e.currentTarget.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                    >
                      <option value="">{c.cmpSelectMonth}</option>
                      {compareMonths.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{c.cmpMonthBLabel}</label>
                    <select
                      value={compareMonthB}
                      onChange={(e) => setCompareMonthB(e.currentTarget.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                    >
                      <option value="">{c.cmpSelectMonth}</option>
                      {compareMonths.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Note: use global filter above to filter by specific customers */}
                {globalFilterUsers.length > 0 && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-indigo-700">
                      {c.cmpFilterNote(globalFilterUsers.length)}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* KPI Comparison */}
            {comparisonData && (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {comparisonData.kpis.map((kpi) => {
                    const change = kpi.a > 0 ? ((kpi.b - kpi.a) / kpi.a) * 100 : (kpi.b > 0 ? 100 : 0);
                    const isUp = change > 0;
                    const formatVal = fmtNumber;
                    return (
                      <div key={kpi.label} className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 sm:p-5">
                        <p className="text-xs sm:text-sm font-medium text-gray-500 mb-3">{kpi.label}</p>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <p className="text-[10px] text-gray-400 mb-0.5">{compareMonthA}</p>
                            <p className="text-base sm:text-lg font-bold text-gray-900">{formatVal(kpi.a)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 mb-0.5">{compareMonthB}</p>
                            <p className="text-base sm:text-lg font-bold text-gray-900">{formatVal(kpi.b)}</p>
                          </div>
                        </div>
                        <div className={`text-sm font-bold px-2 py-1 rounded-lg text-center ${
                          isUp ? "bg-green-50 text-green-600" : change < 0 ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-500"
                        }`}>
                          {isUp ? "▲" : change < 0 ? "▼" : "–"} {Math.abs(change).toFixed(1)}%
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Service Type Comparison Bar Chart */}
                <Card title={c.cmpServiceChartTitle} subtitle={c.cmpVs(compareMonthA, compareMonthB)}>
                  <div className="h-[300px] sm:h-[380px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={comparisonData.serviceCompareChart} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                        <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} />
                        <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(v) => fmtCompact(v)} />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="monthA" name={compareMonthA} fill="#6366F1" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="monthB" name={compareMonthB} fill="#F59E0B" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Per-user comparison table */}
                <Card title={c.cmpUserTitle} subtitle={c.cmpUserSub(compareMonthA, compareMonthB)}>
                  <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6" onWheel={handleTableWheel}>
                    <table className="w-full text-sm min-w-[650px]">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th rowSpan={2} className="text-right py-2 px-2 text-gray-500 font-medium text-xs">{c.usersColId}</th>
                          <th rowSpan={2} className="text-right py-2 px-2 text-gray-500 font-medium text-xs">{c.usersColCity}</th>
                          <th colSpan={3} className="text-center py-1.5 px-2 text-indigo-600 font-bold text-xs border-b border-indigo-100 bg-indigo-50/50 rounded-t-lg">{c.brColServices}</th>
                          <th colSpan={3} className="text-center py-1.5 px-2 text-amber-600 font-bold text-xs border-b border-amber-100 bg-amber-50/50 rounded-t-lg">{c.brColVisits}</th>
                          <th colSpan={3} className="text-center py-1.5 px-2 text-emerald-600 font-bold text-xs border-b border-emerald-100 bg-emerald-50/50 rounded-t-lg">{c.brColMaterial}</th>
                        </tr>
                        <tr className="border-b border-gray-200">
                          {/* Services */}
                          <th className="text-right py-1.5 px-2 text-gray-400 font-medium text-[10px]">{compareMonthA.split(" ")[0]}</th>
                          <th className="text-right py-1.5 px-2 text-gray-400 font-medium text-[10px]">{compareMonthB.split(" ")[0]}</th>
                          <th className="text-right py-1.5 px-2 text-gray-400 font-medium text-[10px]">{c.cmpColChange}</th>
                          {/* Visits */}
                          <th className="text-right py-1.5 px-2 text-gray-400 font-medium text-[10px]">{compareMonthA.split(" ")[0]}</th>
                          <th className="text-right py-1.5 px-2 text-gray-400 font-medium text-[10px]">{compareMonthB.split(" ")[0]}</th>
                          <th className="text-right py-1.5 px-2 text-gray-400 font-medium text-[10px]">{c.cmpColChange}</th>
                          {/* Grams */}
                          <th className="text-right py-1.5 px-2 text-gray-400 font-medium text-[10px]">{compareMonthA.split(" ")[0]}</th>
                          <th className="text-right py-1.5 px-2 text-gray-400 font-medium text-[10px]">{compareMonthB.split(" ")[0]}</th>
                          <th className="text-right py-1.5 px-2 text-gray-400 font-medium text-[10px]">{c.cmpColChange}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comparisonData.rows.slice(0, 50).map((r, idx) => {
                          const pctSvc = r.aServices > 0 ? ((r.bServices - r.aServices) / r.aServices) * 100 : (r.bServices > 0 ? 100 : 0);
                          const pctVis = r.aVisits > 0 ? ((r.bVisits - r.aVisits) / r.aVisits) * 100 : (r.bVisits > 0 ? 100 : 0);
                          const pctGrm = r.aGrams > 0 ? ((r.bGrams - r.aGrams) / r.aGrams) * 100 : (r.bGrams > 0 ? 100 : 0);
                          const changeBadge = (pct: number) => {
                            if (pct === 0) return <span className="text-gray-400">–</span>;
                            const up = pct > 0;
                            return (
                              <span className={`text-xs font-bold ${up ? "text-green-600" : "text-red-500"}`}>
                                {up ? "▲" : "▼"}{Math.abs(pct).toFixed(0)}%
                              </span>
                            );
                          };
                          return (
                            <tr key={r.userId} className={`border-b border-gray-50 hover:bg-indigo-50/20 transition-colors ${idx % 2 === 0 ? "" : "bg-gray-50/30"}`}>
                              <td className="py-2 px-2 font-mono text-xs text-indigo-600 font-medium whitespace-nowrap">{r.userId}</td>
                              <td className="py-2 px-2 text-gray-600 text-xs whitespace-nowrap">{r.city}</td>
                              {/* Services */}
                              <td className="py-2 px-2 text-gray-700 text-xs">{fmtNumber(r.aServices)}</td>
                              <td className="py-2 px-2 text-gray-700 text-xs">{fmtNumber(r.bServices)}</td>
                              <td className="py-2 px-2">{changeBadge(pctSvc)}</td>
                              {/* Visits */}
                              <td className="py-2 px-2 text-gray-700 text-xs">{fmtNumber(r.aVisits)}</td>
                              <td className="py-2 px-2 text-gray-700 text-xs">{fmtNumber(r.bVisits)}</td>
                              <td className="py-2 px-2">{changeBadge(pctVis)}</td>
                              {/* Grams */}
                              <td className="py-2 px-2 text-gray-700 text-xs">{fmtNumber(r.aGrams)}</td>
                              <td className="py-2 px-2 text-gray-700 text-xs">{fmtNumber(r.bGrams)}</td>
                              <td className="py-2 px-2">{changeBadge(pctGrm)}</td>
                            </tr>
                          );
                        })}
                        {/* Totals row */}
                        <tr className="border-t-2 border-gray-300 bg-gray-50 font-bold">
                          <td className="py-3 px-2 text-gray-900 text-xs" colSpan={2}>{c.cmpTotal}</td>
                          <td className="py-3 px-2 text-gray-900 text-xs">{fmtNumber(comparisonData.totals.aServices)}</td>
                          <td className="py-3 px-2 text-gray-900 text-xs">{fmtNumber(comparisonData.totals.bServices)}</td>
                          <td className="py-3 px-2 text-xs">
                            {(() => {
                              const pct = comparisonData.totals.aServices > 0
                                ? ((comparisonData.totals.bServices - comparisonData.totals.aServices) / comparisonData.totals.aServices) * 100 : 0;
                              return <span className={`font-bold ${pct > 0 ? "text-green-600" : pct < 0 ? "text-red-500" : "text-gray-400"}`}>{pct > 0 ? "▲" : pct < 0 ? "▼" : "–"}{Math.abs(pct).toFixed(1)}%</span>;
                            })()}
                          </td>
                          <td className="py-3 px-2 text-gray-900 text-xs">{fmtNumber(comparisonData.totals.aVisits)}</td>
                          <td className="py-3 px-2 text-gray-900 text-xs">{fmtNumber(comparisonData.totals.bVisits)}</td>
                          <td className="py-3 px-2 text-xs">
                            {(() => {
                              const pct = comparisonData.totals.aVisits > 0
                                ? ((comparisonData.totals.bVisits - comparisonData.totals.aVisits) / comparisonData.totals.aVisits) * 100 : 0;
                              return <span className={`font-bold ${pct > 0 ? "text-green-600" : pct < 0 ? "text-red-500" : "text-gray-400"}`}>{pct > 0 ? "▲" : pct < 0 ? "▼" : "–"}{Math.abs(pct).toFixed(1)}%</span>;
                            })()}
                          </td>
                          <td className="py-3 px-2 text-gray-900 text-xs">{fmtNumber(comparisonData.totals.aGrams)}</td>
                          <td className="py-3 px-2 text-gray-900 text-xs">{fmtNumber(comparisonData.totals.bGrams)}</td>
                          <td className="py-3 px-2 text-xs">
                            {(() => {
                              const pct = comparisonData.totals.aGrams > 0
                                ? ((comparisonData.totals.bGrams - comparisonData.totals.aGrams) / comparisonData.totals.aGrams) * 100 : 0;
                              return <span className={`font-bold ${pct > 0 ? "text-green-600" : pct < 0 ? "text-red-500" : "text-gray-400"}`}>{pct > 0 ? "▲" : pct < 0 ? "▼" : "–"}{Math.abs(pct).toFixed(1)}%</span>;
                            })()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    {comparisonData.rows.length > 50 && (
                      <p className="text-center text-sm text-gray-400 mt-4 py-2">
                        {c.cmpShowingLimit(fmtNumber(comparisonData.rows.length))}
                      </p>
                    )}
                  </div>
                </Card>
              </>
            )}

            {!comparisonData && (
              <div className="text-center py-16 text-gray-400">
                <p className="text-lg">{c.cmpSelectTwo}</p>
              </div>
            )}
          </div>
        )}

        {/* ── Cohorts Tab ────────────────────────────────────────── */}
        {activeTab === "cohorts" && (
          <div className="space-y-5">
            {/* Error banner */}
            {cohortError && (
              <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-red-800">{c.cohConnectionErrorTitle}</p>
                  <p className="text-xs text-red-600 mt-0.5">{cohortError}</p>
                </div>
                <button onClick={() => { setCohortError(null); loadCohorts(); }} className="text-xs text-red-500 hover:text-red-700 font-medium flex-shrink-0">{c.cohRetry}</button>
              </div>
            )}

            {/* ── Step 1: Population ─────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">1</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm">{c.cohStep1Title}</h3>
                  <p className="text-xs text-gray-500">{c.cohStep1Sub}</p>
                </div>
                {cohortMembers.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full border border-indigo-100">
                      {c.cohSalonsCount(cohortMembers.length)}
                    </span>
                    {activeCohortId && (
                      <span className="text-xs text-gray-400">{cohorts.find((c) => c.id === activeCohortId)?.name}</span>
                    )}
                    <button
                      onClick={() => { setCohortMembers([]); setActiveCohortId(null); setCohortSelectedUser(null); }}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors"
                    >
                      {c.cohClearAll}
                    </button>
                  </div>
                )}
              </div>
              <div className="p-5 space-y-4">

                {/* Selected members */}
                {cohortMembers.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {cohortMembers.map((uid) => {
                      const user = allUserDetails.find((u) => u.userId === uid);
                      return (
                        <span
                          key={uid}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition-all ${
                            cohortSelectedUser === uid
                              ? "bg-indigo-100 border-indigo-300 text-indigo-800"
                              : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <span onClick={() => setCohortSelectedUser(cohortSelectedUser === uid ? null : uid)}>
                            {uid}
                            {user && <span className="text-gray-400 mr-0.5">({user.city})</span>}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); removeMember(uid); }}
                            className="text-gray-300 hover:text-red-500 transition-colors"
                          >
                            ✕
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Search to add users */}
                <div>
                  <input
                    type="text"
                    value={cohortUserSearch}
                    onChange={(e) => setCohortUserSearch(e.currentTarget.value)}
                    placeholder={c.cohSearchPlaceholder}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                  />
                  {cohortUserSearch.trim().length >= 1 && (
                    <div className="max-h-[220px] overflow-y-auto mt-2 border border-gray-100 rounded-xl divide-y divide-gray-50">
                      {cohortSearchResults.map((u) => {
                        const isMember = cohortMembers.includes(u.userId);
                        return (
                          <div
                            key={u.userId}
                            onClick={() => { if (!isMember) addMember(u.userId); }}
                            className={`flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
                              isMember ? "bg-indigo-50/50 opacity-60" : "hover:bg-gray-50 cursor-pointer"
                            }`}
                          >
                            <span className="font-mono text-xs text-indigo-600 font-bold w-12 flex-shrink-0">{u.userId}</span>
                            <span className="text-gray-700 w-20 truncate flex-shrink-0">{u.city}</span>
                            <span className="text-xs text-gray-400">{c.cohServicesSinceLabel(fmtNumber(u.services), u.monthsActive)}</span>
                            <span className="flex-1" />
                            {isMember ? (
                              <span className="text-xs text-indigo-500 font-medium">{c.cohInGroup}</span>
                            ) : (
                              <span className="text-xs text-emerald-500 font-medium">{c.cohAddUser}</span>
                            )}
                          </div>
                        );
                      })}
                      {cohortSearchResults.length === 0 && (
                        <p className="text-center text-xs text-gray-400 py-4">{c.cohNoResults}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Load from saved group */}
                {cohorts.length > 0 && (
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs font-medium text-gray-500 mb-2">{c.cohLoadSaved}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {cohorts.map((c) => (
                        <div
                          key={c.id}
                          className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs cursor-pointer transition-colors ${
                            activeCohortId === c.id
                              ? "bg-indigo-100 border-indigo-300 text-indigo-700 font-medium"
                              : "bg-white border-gray-200 text-gray-600 hover:bg-indigo-50 hover:border-indigo-200"
                          }`}
                          onClick={() => loadCohortToWorking(c)}
                        >
                          <span>{c.name}</span>
                          <span className={activeCohortId === c.id ? "text-indigo-400" : "text-gray-400"}>({c.member_count})</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); duplicateCohort(c.id); }}
                            title={locale === "en" ? "Duplicate" : "שכפל"}
                            className="text-gray-300 hover:text-indigo-500 transition-colors text-[10px]"
                          >
                            ⧉
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteCohort(c.id); }}
                            className="text-gray-300 hover:text-red-500 transition-colors mr-0.5"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Save current selection */}
                {cohortMembers.length > 0 && (
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs font-medium text-gray-500 mb-2">{c.cohSaveSelection}</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCohortName}
                        onChange={(e) => setNewCohortName(e.currentTarget.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") saveCurrentAsCohort(); }}
                        placeholder={c.cohNamePlaceholder}
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                      />
                      <button
                        onClick={saveCurrentAsCohort}
                        disabled={cohortLoading || !newCohortName.trim()}
                        className="px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 disabled:opacity-50 transition-colors whitespace-nowrap"
                      >
                        {cohortLoading ? "..." : c.cohSaveBtn}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Step 2: Date Range ─────────────────────────────────────── */}
            {cohortMembers.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                  <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">2</span>
                  <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm">{c.cohStep2Title}</h3>
                  <p className="text-xs text-gray-500">{c.cohStep2Sub}</p>
                  </div>
                  {cohortMonthSequence.length > 0 && (
                    <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                      {c.cohMonthsCount(cohortMonthSequence.length)}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap items-end gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1.5">{c.cohStarting}</p>
                      <select
                        value={cohortLocalStart}
                        onChange={(e) => setCohortLocalStart(e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      >
                        {availableMonths.map((m) => <option key={m.label} value={m.label}>{m.label}</option>)}
                      </select>
                    </div>
                    <svg className="w-4 h-4 text-gray-400 mb-2.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                    </svg>
                    <div>
                      <p className="text-xs text-gray-500 mb-1.5">{c.cohEnding}</p>
                      <select
                        value={cohortLocalEnd}
                        onChange={(e) => setCohortLocalEnd(e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      >
                        {availableMonths.map((m) => <option key={m.label} value={m.label}>{m.label}</option>)}
                      </select>
                    </div>
                    {activeCohortId && (
                      <button
                        onClick={() => updateCohortDates(activeCohortId, cohortLocalStart, cohortLocalEnd)}
                        className="mb-0.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium border border-indigo-200 rounded-lg px-3 py-2.5 hover:bg-indigo-50 transition-colors whitespace-nowrap"
                      >
                        {c.cohSaveToGroup}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 3: Data & Filters ─────────────────────────────────── */}
            {cohortMembers.length > 0 && cohortMonthSequence.length > 0 && (
              <>
                {/* Filters card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                    <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">3</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm">{c.cohStep3Title}</h3>
                      <p className="text-xs text-gray-500">{c.cohSalonsCount(cohortMembers.length)} · {cohortRangeLabel}</p>
                    </div>
                    {cohortAnalysisFilterActive && (
                      <button onClick={clearCohortAnalysisFilter} className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors">
                        {c.cohClearFilters}
                      </button>
                    )}
                  </div>
                  <div className="p-5 space-y-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2">{c.cohFilterByCompany}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {ALL_COMPANIES.map((co) => (
                          <button
                            key={co}
                            onClick={() => toggleCohortCompany(co)}
                            className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                              cohortCompanyFilter.has(co)
                                ? "bg-indigo-100 border-indigo-300 text-indigo-700 font-medium"
                                : "bg-white border-gray-200 text-gray-500 hover:border-indigo-200 hover:text-indigo-600"
                            }`}
                          >
                            {co}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2">{c.cohFilterBySeries}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {SERIES_PRESETS.map((series) => (
                          <button
                            key={series.id}
                            onClick={() => toggleCohortSeries(series.id)}
                            className={`text-xs px-2.5 py-1 rounded-lg border transition-all font-medium ${
                              cohortSeriesFilter.has(series.id)
                                ? "bg-purple-100 border-purple-300 text-purple-700"
                                : "bg-white border-gray-200 text-gray-600 hover:border-purple-200 hover:text-purple-600"
                            }`}
                          >
                            {series.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    {cohortAnalysisFilterActive && (
                      <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2.5">
                        <svg className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
                        </svg>
                        <p className="text-xs text-indigo-700 font-medium flex-1">
                          {c.cohActiveFilter}
                          {cohortCompanyFilter.size > 0 && c.cohCompaniesCount(cohortCompanyFilter.size)}
                          {cohortSeriesFilter.size > 0 && c.cohSeriesCount(cohortSeriesFilter.size)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

            {/* Cohort trend chart (data) */}
            {cohortMembers.length > 0 && (
              <>
                {/* KPI summary for cohort */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <KpiCard
                    label={c.cohKpiServicesInPeriod}
                    value={fmtNumber(cohortTrend.reduce((s, m) => s + m.color + m.highlights + m.toner + m.straightening + m.others, 0))}
                    sub={cohortRangeLabel}
                    color="indigo"
                    icon={<svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" /></svg>}
                  />
                  <KpiCard
                    label={c.cohKpiVisitsInPeriod}
                    value={fmtNumber(cohortTrend.reduce((s, m) => s + m.visits, 0))}
                    sub={c.cohSalonsCount(cohortMembers.length)}
                    color="emerald"
                    icon={<svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>}
                  />
                  <KpiCard
                    label={c.cohKpiRawMaterial}
                    value={fmtCompact(cohortTrend.reduce((s, m) => s + m.grams, 0))}
                    sub={c.cohKpiGrams(fmtNumber(cohortTrend.reduce((s, m) => s + m.grams, 0)))}
                    color="cyan"
                    icon={<svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" /></svg>}
                  />
                  <KpiCard
                    label={c.cohKpiNewCompetitors}
                    value={fmtNumber(cohortCompetitors.reduce((s, m) => s + m.brands.length, 0))}
                    sub={c.cohKpiNewBrandsEntered}
                    color="pink"
                    icon={<svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>}
                  />
                </div>

                {/* Cohort brand breakdown table */}
                {cohortBrandBreakdown.length > 0 && (
                  <Card title={c.cohBrandsTitle} subtitle={c.cohBrandsSub(cohortBrandBreakdown.length, cohortMembers.length, cohortRangeLabel)} action={<button onClick={exportCohortBrands} className="text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors">⤓ CSV</button>}>
                    <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6" onWheel={handleTableWheel}>
                      <table className="w-full text-sm min-w-[600px]" id="cohort-brand-table">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-right py-2.5 px-3 text-gray-500 font-medium text-xs w-10">#</th>
                            <th className="text-right py-2.5 px-3 text-gray-500 font-medium text-xs">{c.brColBrand}</th>
                            <th className="text-right py-2.5 px-3 text-gray-500 font-medium text-xs">{c.brColServices}</th>
                            <th className="text-right py-2.5 px-3 text-gray-500 font-medium text-xs">{c.cohColRevenue}</th>
                            <th className="text-right py-2.5 px-3 text-gray-500 font-medium text-xs">{c.cohColGrams}</th>
                            <th className="text-right py-2.5 px-3 text-gray-500 font-medium text-xs">{c.brColVisits}</th>
                            <th className="text-right py-2.5 px-3 text-gray-500 font-medium text-xs">{c.brColSalons}</th>
                            <th className="text-right py-2.5 px-3 text-gray-500 font-medium text-xs">{c.brColMarketShare}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cohortBrandBreakdown.slice(0, 30).map((b, idx) => {
                            const share = cohortBrandTotal > 0 ? (b.services / cohortBrandTotal) * 100 : 0;
                            return (
                              <tr key={b.brand} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                <td className="py-2.5 px-3 text-gray-400 text-xs">{idx + 1}</td>
                                <td className="py-2.5 px-3 font-medium text-gray-900">
                                  <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                                    {b.brand}
                                  </div>
                                </td>
                                <td className="py-2.5 px-3 text-gray-700">{fmtNumber(b.services)}</td>
                                <td className="py-2.5 px-3 text-gray-700">₪{fmtNumber(b.revenue)}</td>
                                <td className="py-2.5 px-3 text-gray-700">{fmtNumber(b.grams)}</td>
                                <td className="py-2.5 px-3 text-gray-700">{fmtNumber(b.visits)}</td>
                                <td className="py-2.5 px-3 text-gray-700 text-center">{b.userCount}</td>
                                <td className="py-2.5 px-3">
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                                      <div className="h-full rounded-full" style={{ width: `${Math.min(share, 100)}%`, backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                                    </div>
                                    <span className="text-xs text-gray-600 font-medium w-12 text-left">{share.toFixed(1)}%</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                )}

                {/* Jan-vs-Jan comparison KPI */}
                {cohortJanVsJan && cohortJanVsJan.length > 0 && (
                  <Card title={c.cohJanCompTitle} subtitle={c.cohJanCompSub}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {cohortJanVsJan.map((p) => (
                        <div key={`${p.yearA}-${p.yearB}`} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <div className="text-xs text-gray-500 mb-2 font-medium">{p.yearA} → {p.yearB}</div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-[10px] text-gray-400 mb-0.5">{c.cohColGrams}</p>
                              <p className="text-sm text-gray-700">{fmtNumber(p.gramsA)} → {fmtNumber(p.gramsB)}</p>
                              {p.gramsPct !== null && (
                                <span className={`inline-block mt-1 text-xs font-bold px-1.5 py-0.5 rounded ${p.gramsPct >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                                  {p.gramsPct >= 0 ? "+" : ""}{p.gramsPct.toFixed(1)}%
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400 mb-0.5">{c.brColServices}</p>
                              <p className="text-sm text-gray-700">{fmtNumber(p.servicesA)} → {fmtNumber(p.servicesB)}</p>
                              {p.servicesPct !== null && (
                                <span className={`inline-block mt-1 text-xs font-bold px-1.5 py-0.5 rounded ${p.servicesPct >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                                  {p.servicesPct >= 0 ? "+" : ""}{p.servicesPct.toFixed(1)}%
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Month-over-month % change table */}
                <Card title={c.cohMomTitle} subtitle={c.cohMomSub} action={<button onClick={exportCohortMomPct} className="text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors">⤓ CSV</button>}>
                  <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6" onWheel={handleTableWheel}>
                    <table className="w-full text-sm min-w-[500px]">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-right py-2 px-2 text-gray-500 font-medium text-xs">{c.ovColMonth}</th>
                          <th className="text-right py-2 px-2 text-gray-500 font-medium text-xs">{c.cohColGrams}</th>
                          <th className="text-right py-2 px-2 text-gray-500 font-medium text-xs">{c.ovColPctChange}</th>
                          <th className="text-right py-2 px-2 text-gray-500 font-medium text-xs">{c.brColServices}</th>
                          <th className="text-right py-2 px-2 text-gray-500 font-medium text-xs">{c.ovColPctChange}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cohortMomPct.map((m) => (
                          <tr key={m.label} className="border-b border-gray-50">
                            <td className="py-2 px-2 text-gray-700 text-xs font-medium">{m.label}</td>
                            <td className="py-2 px-2 text-gray-900 text-xs font-medium">{fmtNumber(m.grams)}</td>
                            <td className="py-2 px-2 text-xs font-bold">
                              {m.gramsPct !== null ? (
                                <span className={m.gramsPct >= 0 ? "text-emerald-600" : "text-red-600"}>
                                  {m.gramsPct >= 0 ? "+" : ""}{m.gramsPct.toFixed(1)}%
                                </span>
                              ) : (
                                <span className="text-gray-300">–</span>
                              )}
                            </td>
                            <td className="py-2 px-2 text-gray-900 text-xs font-medium">{fmtNumber(m.services)}</td>
                            <td className="py-2 px-2 text-xs font-bold">
                              {m.servicesPct !== null ? (
                                <span className={m.servicesPct >= 0 ? "text-emerald-600" : "text-red-600"}>
                                  {m.servicesPct >= 0 ? "+" : ""}{m.servicesPct.toFixed(1)}%
                                </span>
                              ) : (
                                <span className="text-gray-300">–</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Per-user January-vs-January grams + services table */}
                {cohortUserYoY && (cohortUserYoY as any).janMonths?.length >= 2 && (() => {
                  const jms: string[] = (cohortUserYoY as any).janMonths;
                  const sortedRows = [...(cohortUserYoY as any).rows].sort((a: any, b: any) => {
                    let av: number, bv: number;
                    if (yoySortField === "pct") { av = a.pct ?? -Infinity; bv = b.pct ?? -Infinity; }
                    else if (yoySortField === "pctServices") { av = a.pctServices ?? -Infinity; bv = b.pctServices ?? -Infinity; }
                    else { av = a[yoySortField] || 0; bv = b[yoySortField] || 0; }
                    return yoySortDir === "desc" ? bv - av : av - bv;
                  });
                  const toggleSort = (field: string) => {
                    if (yoySortField === field) setYoySortDir((d) => d === "asc" ? "desc" : "asc");
                    else { setYoySortField(field); setYoySortDir("desc"); }
                  };
                  const arrow = (field: string) => yoySortField === field ? (yoySortDir === "desc" ? " ▼" : " ▲") : "";
                  const pctCell = (val: number | null | undefined) =>
                    val !== null && val !== undefined
                      ? <span className={val >= 0 ? "text-emerald-600" : "text-red-600"}>{val >= 0 ? "+" : ""}{val.toFixed(1)}%</span>
                      : <span className="text-gray-300">–</span>;
                  const totalPct = (rows: any[], lastKey: string, prevKey: string) => {
                    const lastT = rows.reduce((s: number, r: any) => s + (r[lastKey] || 0), 0);
                    const prevT = rows.reduce((s: number, r: any) => s + (r[prevKey] || 0), 0);
                    return pctChange(lastT, prevT);
                  };
                  return (
                  <Card title={c.cohUserYoyTitle} subtitle={c.cohUserYoySub(cohortRangeLabel)}>
                    <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6" onWheel={handleTableWheel}>
                      <table className="w-full text-sm min-w-[600px]">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th rowSpan={2} className="text-right py-2 px-2 text-gray-500 font-medium text-xs border-b border-gray-200">#</th>
                            <th colSpan={jms.length + 1} className="text-center py-1 px-2 text-gray-400 font-semibold text-[10px] uppercase tracking-wider border-l border-gray-100">{c.cohColGrams}</th>
                            <th colSpan={jms.length + 1} className="text-center py-1 px-2 text-gray-400 font-semibold text-[10px] uppercase tracking-wider border-l border-gray-100">{c.brColServices}</th>
                          </tr>
                          <tr className="border-b border-gray-200">
                            {jms.map((jm) => (
                              <th key={`g_${jm}`} onClick={() => toggleSort(jm)} className="text-right py-2 px-2 text-gray-500 font-medium text-xs cursor-pointer hover:text-indigo-600 select-none border-l border-gray-100">
                                {jm}{arrow(jm)}
                              </th>
                            ))}
                            <th onClick={() => toggleSort("pct")} className="text-right py-2 px-2 text-gray-500 font-medium text-xs cursor-pointer hover:text-indigo-600 select-none">
                              {c.ovColPctChange}{arrow("pct")}
                            </th>
                            {jms.map((jm) => (
                              <th key={`s_${jm}`} onClick={() => toggleSort(`svc_${jm}`)} className="text-right py-2 px-2 text-gray-500 font-medium text-xs cursor-pointer hover:text-indigo-600 select-none border-l border-gray-100">
                                {jm}{arrow(`svc_${jm}`)}
                              </th>
                            ))}
                            <th onClick={() => toggleSort("pctServices")} className="text-right py-2 px-2 text-gray-500 font-medium text-xs cursor-pointer hover:text-indigo-600 select-none">
                              {c.ovColPctChange}{arrow("pctServices")}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedRows.map((r: any) => (
                            <tr key={r.userId} className="border-b border-gray-50">
                              <td className="py-1.5 px-2 text-indigo-600 text-xs font-mono font-bold">{r.userId}</td>
                              {jms.map((jm) => (
                                <td key={`g_${jm}`} className="py-1.5 px-2 text-gray-900 text-xs border-l border-gray-50">{fmtNumber(r[jm] || 0)}</td>
                              ))}
                              <td className="py-1.5 px-2 text-xs font-bold">{pctCell(r.pct)}</td>
                              {jms.map((jm) => (
                                <td key={`s_${jm}`} className="py-1.5 px-2 text-gray-900 text-xs border-l border-gray-50">{fmtNumber(r[`svc_${jm}`] || 0)}</td>
                              ))}
                              <td className="py-1.5 px-2 text-xs font-bold">{pctCell(r.pctServices)}</td>
                            </tr>
                          ))}
                          <tr className="border-t-2 border-gray-300 bg-gray-50 font-bold">
                            <td className="py-2 px-2 text-gray-700 text-xs">{c.cmpTotal}</td>
                            {jms.map((jm) => {
                              const total = sortedRows.reduce((s: number, r: any) => s + (r[jm] || 0), 0);
                              return <td key={`g_${jm}`} className="py-2 px-2 text-gray-900 text-xs border-l border-gray-50">{fmtNumber(total)}</td>;
                            })}
                            <td className="py-2 px-2 text-xs font-bold">{pctCell(totalPct(sortedRows, jms[jms.length - 1], jms[jms.length - 2]))}</td>
                            {jms.map((jm) => {
                              const total = sortedRows.reduce((s: number, r: any) => s + (r[`svc_${jm}`] || 0), 0);
                              return <td key={`s_${jm}`} className="py-2 px-2 text-gray-900 text-xs border-l border-gray-50">{fmtNumber(total)}</td>;
                            })}
                            <td className="py-2 px-2 text-xs font-bold">{pctCell(totalPct(sortedRows, `svc_${jms[jms.length - 1]}`, `svc_${jms[jms.length - 2]}`))}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </Card>
                  );
                })()}

                {/* Monthly services by type */}
                <Card title={c.cohSvcByTypeTitle} subtitle={c.cohSvcByTypeSub(cohortMembers.length, cohortRangeLabel)} action={<button onClick={exportCohortTrend} className="text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors">⤓ CSV</button>}>
                  <div className="h-[300px] sm:h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={cohortTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                        <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 11 }} />
                        <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(v) => fmtCompact(v)} />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Area type="monotone" dataKey="color" name={c.svcColor} stackId="1" stroke={SERVICE_COLORS.Color} fill={SERVICE_COLORS.Color} fillOpacity={0.7} />
                        <Area type="monotone" dataKey="highlights" name={c.svcHighlights} stackId="1" stroke={SERVICE_COLORS.Highlights} fill={SERVICE_COLORS.Highlights} fillOpacity={0.7} />
                        <Area type="monotone" dataKey="toner" name={c.svcToner} stackId="1" stroke={SERVICE_COLORS.Toner} fill={SERVICE_COLORS.Toner} fillOpacity={0.7} />
                        <Area type="monotone" dataKey="straightening" name={c.svcStraightening} stackId="1" stroke={SERVICE_COLORS.Straightening} fill={SERVICE_COLORS.Straightening} fillOpacity={0.7} />
                        <Area type="monotone" dataKey="others" name={c.svcOthers} stackId="1" stroke={SERVICE_COLORS.Others} fill={SERVICE_COLORS.Others} fillOpacity={0.7} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Visits and grams trend */}
                <Card title={c.cohVisitsMaterialTitle} subtitle={c.cohVisitsMaterialSub}>
                  <div className="h-[280px] sm:h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={cohortTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                        <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 11 }} />
                        <YAxis yAxisId="left" tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(v) => fmtCompact(v)} />
                        <YAxis yAxisId="right" orientation="left" tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(v) => fmtCompact(v)} />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="visits" name={c.ovVisitsLegend} stroke="#10B981" strokeWidth={2.5} dot={{ r: 4, fill: "#10B981" }} />
                        <Line yAxisId="right" type="monotone" dataKey="grams" name={c.ovMatGramsLegend} stroke="#0EA5E9" strokeWidth={2.5} dot={{ r: 4, fill: "#0EA5E9" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Competitor first-seen markers */}
                <Card title={c.cohCompetitorsTitle} subtitle={c.cohCompetitorsSub}>
                  <div className="space-y-3">
                    {cohortCompetitors.map((m) => (
                      <div key={m.month} className="border border-gray-100 rounded-xl overflow-hidden">
                        <div className={`flex items-center justify-between px-4 py-2.5 ${m.brands.length > 0 ? "bg-amber-50" : "bg-gray-50"}`}>
                          <span className="text-sm font-medium text-gray-800">{m.month}</span>
                          {m.brands.length > 0 ? (
                            <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-md">
                              {c.cohNewCount(m.brands.length)}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">{c.cohNoChange}</span>
                          )}
                        </div>
                        {m.brands.length > 0 && (
                          <div className="px-4 py-2 space-y-1.5">
                            {m.brands.map((b) => (
                              <div key={b.brand} className="flex items-center gap-3 text-sm">
                                <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                                <span className="font-medium text-gray-800 flex-1">{b.brand}</span>
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">{b.dominantType}</span>
                                <span className="text-xs text-gray-400">{fmtNumber(b.services)} {c.brColServices}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Per-user drill-down */}
                {cohortSelectedUser && (
                  <Card
                    title={c.cohDrillTitle(cohortSelectedUser)}
                    subtitle={c.cohDrillSub(allUserDetails.find((u) => u.userId === cohortSelectedUser)?.city || "")}
                  >
                    <div className="space-y-4">
                      {/* Slowdown / pause indicators */}
                      {(() => {
                        const paused: string[] = [];
                        const slowdown: string[] = [];
                        for (let i = 1; i < selectedUserTrend.length; i++) {
                          const cur = selectedUserTrend[i];
                          const prev = selectedUserTrend[i - 1];
                          if (cur.services === 0 && prev.services > 0) paused.push(cur.label);
                          else if (prev.services > 0 && cur.services > 0 && cur.services < prev.services * 0.5) slowdown.push(cur.label);
                        }
                        if (!paused.length && !slowdown.length) return null;
                        return (
                          <div className="flex flex-wrap gap-2">
                            {paused.map((m) => (
                              <span key={m} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-red-600 text-xs font-medium border border-red-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                {c.cohPauseLabel(m)}
                              </span>
                            ))}
                            {slowdown.map((m) => (
                              <span key={m} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-600 text-xs font-medium border border-amber-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                {c.cohSlowdownLabel(m)}
                              </span>
                            ))}
                          </div>
                        );
                      })()}

                      {/* User service type area chart */}
                      <div className="h-[280px] sm:h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={selectedUserTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                            <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 11 }} />
                            <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
                            <Tooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Area type="monotone" dataKey="color" name={c.svcColor} stackId="1" stroke={SERVICE_COLORS.Color} fill={SERVICE_COLORS.Color} fillOpacity={0.7} />
                            <Area type="monotone" dataKey="highlights" name={c.svcHighlights} stackId="1" stroke={SERVICE_COLORS.Highlights} fill={SERVICE_COLORS.Highlights} fillOpacity={0.7} />
                            <Area type="monotone" dataKey="toner" name={c.svcToner} stackId="1" stroke={SERVICE_COLORS.Toner} fill={SERVICE_COLORS.Toner} fillOpacity={0.7} />
                            <Area type="monotone" dataKey="straightening" name={c.svcStraightening} stackId="1" stroke={SERVICE_COLORS.Straightening} fill={SERVICE_COLORS.Straightening} fillOpacity={0.7} />
                            <Area type="monotone" dataKey="others" name={c.svcOthers} stackId="1" stroke={SERVICE_COLORS.Others} fill={SERVICE_COLORS.Others} fillOpacity={0.7} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      {/* User grams trend line */}
                      <div className="h-[200px] sm:h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={selectedUserTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                            <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 11 }} />
                            <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(v) => fmtCompact(v)} />
                            <Tooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Line type="monotone" dataKey="grams" name={c.ovMatGramsLegend} stroke="#0EA5E9" strokeWidth={2.5} dot={{ r: 4, fill: "#0EA5E9" }} />
                            <Line type="monotone" dataKey="visits" name={c.ovVisitsLegend} stroke="#10B981" strokeWidth={2.5} dot={{ r: 4, fill: "#10B981" }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Monthly summary table */}
                      <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6" onWheel={handleTableWheel}>
                        <table className="w-full text-sm min-w-[500px]">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-right py-2 px-2 text-gray-500 font-medium text-xs">{c.ovColMonth}</th>
                              <th className="text-right py-2 px-2 text-gray-500 font-medium text-xs">{c.brColServices}</th>
                              <th className="text-right py-2 px-2 text-gray-500 font-medium text-xs">{c.brColVisits}</th>
                              <th className="text-right py-2 px-2 text-gray-500 font-medium text-xs">{c.brColMaterial}</th>
                              <th className="text-right py-2 px-2 text-gray-500 font-medium text-xs">{c.svcColor}</th>
                              <th className="text-right py-2 px-2 text-gray-500 font-medium text-xs">{c.svcHighlights}</th>
                              <th className="text-right py-2 px-2 text-gray-500 font-medium text-xs">{c.svcToner}</th>
                              <th className="text-right py-2 px-2 text-gray-500 font-medium text-xs">{c.cohDrillColStatus}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedUserTrend.map((m, i) => {
                              const prev = i > 0 ? selectedUserTrend[i - 1] : null;
                              const isPaused = m.services === 0 && prev && prev.services > 0;
                              const isSlowdown = prev && prev.services > 0 && m.services > 0 && m.services < prev.services * 0.5;
                              return (
                                <tr key={m.label} className={`border-b border-gray-50 ${isPaused ? "bg-red-50/40" : isSlowdown ? "bg-amber-50/40" : ""}`}>
                                  <td className="py-2 px-2 text-gray-700 text-xs font-medium">{m.label}</td>
                                  <td className="py-2 px-2 text-gray-900 font-medium text-xs">{fmtNumber(m.services)}</td>
                                  <td className="py-2 px-2 text-gray-700 text-xs">{fmtNumber(m.visits)}</td>
                                  <td className="py-2 px-2 text-gray-700 text-xs">{fmtNumber(m.grams)}</td>
                                  <td className="py-2 px-2 text-gray-700 text-xs">{fmtNumber(m.color)}</td>
                                  <td className="py-2 px-2 text-gray-700 text-xs">{fmtNumber(m.highlights)}</td>
                                  <td className="py-2 px-2 text-gray-700 text-xs">{fmtNumber(m.toner)}</td>
                                  <td className="py-2 px-2 text-xs">
                                    {isPaused && <span className="text-red-500 font-bold">{c.cohStatusPause}</span>}
                                    {isSlowdown && <span className="text-amber-500 font-bold">{c.cohStatusSlowdown}</span>}
                                    {!isPaused && !isSlowdown && m.services > 0 && <span className="text-emerald-500">{c.cohStatusActive}</span>}
                                    {!isPaused && !isSlowdown && m.services === 0 && <span className="text-gray-300">–</span>}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </Card>
                )}

                {!cohortSelectedUser && cohortMembers.length > 0 && (
                  <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 text-center">
                    <p className="text-gray-400 text-sm">{c.cohClickToView}</p>
                  </div>
                )}
              </>
            )}
              </>
            )}
          </div>
        )}

        {/* ── Populations Tab ────────────────────────────────────────── */}
        {activeTab === "populations" && (
          <div className="space-y-6">
            <PopulationsTab allUserDetails={allUserDetails} locale={locale} />
          </div>
        )}

        {/* ── Cells Tab ──────────────────────────────────────────────── */}
        {activeTab === "cells" && (
          <div className="space-y-6">
            <CellsTab allUserDetails={allUserDetails} locale={locale} />
          </div>
        )}

        {/* ── Cell Comparison Tab ────────────────────────────────────── */}
        {activeTab === "cell-comparison" && (
          <div className="space-y-6">
            <CellComparisonTab locale={locale} />
          </div>
        )}

        {/* Footer */}
        <footer className="text-center py-8 border-t border-gray-100 mt-8">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-500">
              {footerTitle} · <span className="text-gray-400 font-normal">Powered by Spectra Salon Platform</span>
            </p>
          </div>
          <p className="text-xs text-gray-300">{c.footerDataUpdated(dateFrom, dateTo)}</p>
        </footer>
      </main>
    </div>
  );
}

// ── Exported Page ───────────────────────────────────────────────────
export default function LorealAnalyticsPage({
  accessCode = ACCESS_CODE,
  sessionKey = SESSION_KEY,
  title = DEFAULT_PAGE_TITLE,
  subtitle = DEFAULT_PAGE_SUBTITLE,
  footerTitle = DEFAULT_FOOTER_TITLE,
  locale = "he",
}: LorealAnalyticsPageProps = {}) {
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem(sessionKey) === "1"
  );
  const live = useLiveMarketDataset();
  const israelValue = useMemo(() => buildIsraelDatasetValue(live), [live]);

  if (!unlocked) {
    return (
      <AccessGate
        onUnlock={() => setUnlocked(true)}
        accessCode={accessCode}
        sessionKey={sessionKey}
        title={title}
        subtitle={subtitle}
        locale={locale}
      />
    );
  }

  return (
    <IsraelDatasetCtx.Provider value={israelValue}>
      <Dashboard title={title} subtitle={subtitle} footerTitle={footerTitle} locale={locale} />
    </IsraelDatasetCtx.Provider>
  );
}
