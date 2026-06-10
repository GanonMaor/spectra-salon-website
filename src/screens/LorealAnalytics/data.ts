// Shared data, constants and utilities for L'Oréal Analytics
// This module is imported by LorealAnalyticsPage and all sub-tab components.
import { createContext, useContext, useMemo } from "react";
import rawData from "../../data/market-intelligence.json";
import { deriveIsraelViews, useLiveMarketDataset, BUNDLED_DATASET } from "../../lib/marketDataset";
import type { AnalyticsFilter } from "./types";

// ── Auth ────────────────────────────────────────────────────────────
export const ACCESS_CODE = "LPR3391";

// ── Formatting ──────────────────────────────────────────────────────
export function fmtNumber(n: number) { return n.toLocaleString("he-IL"); }
export function fmtCompact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}
export function fmtPercent(n: number, decimals = 1) {
  return `${n >= 0 ? "+" : ""}${n.toFixed(decimals)}%`;
}
export function pctChange(a: number, b: number) {
  if (a === 0) return b === 0 ? 0 : 100;
  return Math.round(((b - a) / a) * 1000) / 10;
}
export function downloadCsv(headers: string[], rows: string[][], filename: string) {
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ── Visual Constants ────────────────────────────────────────────────
export const CHART_COLORS = [
  "#6366F1", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6", "#EC4899",
  "#06B6D4", "#F97316", "#14B8A6", "#3B82F6", "#84CC16", "#D946EF",
  "#A855F7", "#22D3EE", "#FB923C",
];

export const SERVICE_COLORS: Record<string, string> = {
  Color: "#6366F1",
  Highlights: "#F59E0B",
  Toner: "#10B981",
  Straightening: "#8B5CF6",
  Others: "#EC4899",
};

export const SERVICE_LABELS: Record<string, string> = {
  Color: "צבע",
  Highlights: "גוונים",
  Toner: "טונר",
  Straightening: "החלקה",
  Others: "אחר",
};

export const MONTH_NAMES_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
export const ALL_SERVICE_TYPES = ["Color","Highlights","Toner","Straightening","Others"] as const;
export type ServiceType = typeof ALL_SERVICE_TYPES[number];

// ── Brand → Company Mapping ─────────────────────────────────────────
export const BRAND_TO_COMPANY: Record<string, string> = {
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

export const ALL_COMPANIES = [...new Set(Object.values(BRAND_TO_COMPANY))].sort();

export const BRAND_CANONICAL_OVERRIDES: Record<string, string> = {
  "SCHWARZKOPF_CANADA": "SCHWARZKOPF",
  "Schwarzkopf Professional <JP>": "SCHWARZKOPF",
  "WELLA PROFESSIONALS <JP>": "WELLA PROFESSIONALS",
  "GOLDWELL <JP>": "GOLDWELL",
  "SHISEIDO PROFESSIONAL <JP>": "SHISEIDO",
  "mILBOn <JP>": "MILBON",
  "COVEY & MANE": "COVET&MANE",
  "MOWEN": "MOWAN",
};

export function normalizeBrandName(brand?: string | null): string {
  const raw = String(brand || "").trim();
  if (!raw) return "UNKNOWN";
  if (BRAND_CANONICAL_OVERRIDES[raw]) return BRAND_CANONICAL_OVERRIDES[raw];

  const withoutCountry = raw.replace(/\s*<[^>]+>\s*$/g, "").trim();
  if (BRAND_CANONICAL_OVERRIDES[withoutCountry]) return BRAND_CANONICAL_OVERRIDES[withoutCountry];
  return withoutCountry || raw;
}

export function getBrandCompany(brand: string): string | undefined {
  return BRAND_TO_COMPANY[normalizeBrandName(brand)] || BRAND_TO_COMPANY[brand];
}

// ── Series Presets ──────────────────────────────────────────────────
export interface SeriesPreset { id: string; name: string; brands: string[]; note?: string; }
export const SERIES_PRESETS: SeriesPreset[] = [
  { id: "dia",           name: "Dia Light / Dia Richesse",    brands: ["L'OREAL PROFESSIONNEL"],                                           note: "ממופה למותג L'Oréal Professionnel" },
  { id: "majirel",       name: "Majirel / INOA / Luo Color",  brands: ["L'OREAL PROFESSIONNEL"],                                           note: "ממופה למותג L'Oréal Professionnel" },
  { id: "redken-shades", name: "Redken Shades EQ",            brands: ["REDKEN"] },
  { id: "matrix-socolor",name: "Matrix Socolor",              brands: ["MATRIX"] },
  { id: "igora",         name: "Igora Royal / Vibrance",       brands: ["SCHWARZKOPF","SCHWARZKOPF_CANADA","Schwarzkopf Professional <JP>"] },
  { id: "koleston",      name: "Koleston / Color Touch",       brands: ["WELLA PROFESSIONALS","WELLA PROFESSIONALS <JP>"] },
];

// ── Month Utilities ─────────────────────────────────────────────────
export function generateMonthSequence(startLabel: string, endLabel: string): string[] {
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

export function monthLabelToSi(label: string): number {
  const parts = label.split(" ");
  if (parts.length !== 2) return 0;
  const mIdx = MONTH_NAMES_SHORT.indexOf(parts[0]);
  const year = parseInt(parts[1], 10);
  if (mIdx < 0 || isNaN(year)) return 0;
  return year * 100 + (mIdx + 1);
}

// ── Raw Data Types ──────────────────────────────────────────────────
export interface RawRow {
  mk: string; si: number; uid: string; co: string; ci: string;
  st: string; emp: number; br: string; vis: number; svc: number;
  cost: number; gr: number;
  cs: number; cc: number; cg: number;
  hs: number; hc: number; hg: number;
  ts: number; tc: number; tg: number;
  ss: number; sc: number; sg: number;
  os: number; oc: number; og: number;
}

export function applyServiceTypeFilter(rows: RawRow[], serviceTypes: Iterable<string>): RawRow[] {
  const selected = new Set(serviceTypes);
  if (selected.size >= ALL_SERVICE_TYPES.length) {
    return rows.filter((r) => r.svc > 0);
  }

  return rows
    .map((r) => {
      const cs = selected.has("Color") ? r.cs : 0;
      const cc = selected.has("Color") ? r.cc : 0;
      const cg = selected.has("Color") ? r.cg : 0;
      const hs = selected.has("Highlights") ? r.hs : 0;
      const hc = selected.has("Highlights") ? r.hc : 0;
      const hg = selected.has("Highlights") ? r.hg : 0;
      const ts = selected.has("Toner") ? r.ts : 0;
      const tc = selected.has("Toner") ? r.tc : 0;
      const tg = selected.has("Toner") ? r.tg : 0;
      const ss = selected.has("Straightening") ? r.ss : 0;
      const sc = selected.has("Straightening") ? r.sc : 0;
      const sg = selected.has("Straightening") ? r.sg : 0;
      const os = selected.has("Others") ? r.os : 0;
      const oc = selected.has("Others") ? r.oc : 0;
      const og = selected.has("Others") ? r.og : 0;
      const svc = cs + hs + ts + ss + os;
      const cost = cc + hc + tc + sc + oc;
      const gr = cg + hg + tg + sg + og;

      return { ...r, svc, cost, gr, cs, cc, cg, hs, hc, hg, ts, tc, tg, ss, sc, sg, os, oc, og };
    })
    .filter((r) => r.svc > 0);
}

export type UserDetail = {
  userId: string;
  city: string;
  salonType: string;
  employees: number;
  visits: number;
  services: number;
  revenue: number;
  grams: number;
  brandsUsed: number;
  monthsActive: number;
  totalPossibleMonths: number;
  continuityScore: number;
  avgServicesPerMonth: number;
  color: number;
  highlights: number;
  toner: number;
  straightening: number;
  others: number;
  firstMonth: string;
  lastMonth: string;
  topBrands: string[];
};

// ── Israel Data ─────────────────────────────────────────────────────
const ISRAEL_KEYS = ["ISRAEL", "Israel"];

const BUNDLED_ISRAEL = deriveIsraelViews(BUNDLED_DATASET);

type AccountMetadataOverride = {
  country?: string;
  city?: string;
};

const ACCOUNT_METADATA_OVERRIDES: Record<string, AccountMetadataOverride> = {
  "#6259": { country: "JAPAN" },
  "#8613": { city: "Raanana" },
  "#8885": { city: "Tel Aviv" },
  "#8608": { city: "Netanya" },
  "#9015": { city: "Nazareth" },
  "#4149": { city: "Krayot" },
  "#0931": { city: "Tel Aviv" },
  "#4275": { city: "Rishon Letzion" },
  "#4110": { city: "Kiryat Motzkin" },
  "#2470": { city: "Modim" },
  "#2965": { city: "Krayot" },
  "#4713": { country: "UK", city: "London" },
  "#7603": { city: "Hod Hasharon" },
  "#9913": { city: "Krayot" },
  "#0825": { country: "Spectra Team" },
  "#5738": { city: "Pardes Hana" },
  "#7878": { city: "Naharya" },
  "#1983": { city: "Naharya" },
  "#4939": { city: "Krayot" },
  "#3193": { city: "Jerusalem" },
};

function applyAccountMetadataOverrides(rows: RawRow[]): RawRow[] {
  return rows
    .map((row) => {
      const override = ACCOUNT_METADATA_OVERRIDES[row.uid];
      if (!override) return row;
      return {
        ...row,
        co: override.country ?? row.co,
        ci: override.city ?? row.ci,
      };
    })
    .filter((row) => ISRAEL_KEYS.includes(row.co));
}

function buildAvailableMonths(rows: RawRow[]): { label: string; si: number }[] {
  const map: Record<string, number> = {};
  for (const r of rows) {
    if (!(r.mk in map) || r.si < map[r.mk]) map[r.mk] = r.si;
  }
  return Object.entries(map)
    .map(([label, si]) => ({ label, si }))
    .sort((a, b) => a.si - b.si);
}

/**
 * Default Israel rows derived from the bundled JSON. This stays
 * exported for module-level / non-component consumers (e.g.
 * tests, scripts). Live consumers should use {@link useIsraelDataset}
 * which subscribes to the latest snapshot.
 */
export const israelRawRows: RawRow[] = applyAccountMetadataOverrides(BUNDLED_ISRAEL.rawRows as RawRow[]);

export const availableMonths: { label: string; si: number }[] =
  buildAvailableMonths(israelRawRows);

// ── Live Dataset Context ────────────────────────────────────────────
export interface IsraelDatasetValue {
  rawRows: RawRow[];
  availableMonths: { label: string; si: number }[];
  isLive: boolean;
  generatedAt: string;
  loading: boolean;
  refresh: () => Promise<void>;
}

const DEFAULT_ISRAEL_VALUE: IsraelDatasetValue = {
  rawRows: israelRawRows,
  availableMonths,
  isLive: false,
  generatedAt: (BUNDLED_DATASET._generated as string) || "",
  loading: false,
  refresh: async () => {},
};

const IsraelDatasetCtx = createContext<IsraelDatasetValue>(DEFAULT_ISRAEL_VALUE);

export function useIsraelDataset(): IsraelDatasetValue {
  return useContext(IsraelDatasetCtx);
}

/** Wrap LorealAnalyticsPage with this provider to enable live updates. */
export function buildIsraelDatasetValue(
  live: ReturnType<typeof useLiveMarketDataset>,
): IsraelDatasetValue {
  const views = deriveIsraelViews(live.dataset);
  const rawRows = applyAccountMetadataOverrides(views.rawRows as RawRow[]);
  return {
    rawRows,
    availableMonths: buildAvailableMonths(rawRows),
    isLive: live.isLive,
    generatedAt: live.generatedAt,
    loading: live.loading,
    refresh: live.refresh,
  };
}

export { IsraelDatasetCtx };

// ── Filter Application ──────────────────────────────────────────────
/**
 * Apply a saved AnalyticsFilter to a set of raw rows.
 * Inclusion lists: empty = include all. Non-empty = whitelist.
 * Exclusion lists: exclude matching rows.
 * Service types: mask out disabled types by zeroing their counts.
 */
export function applyCellFilters(rows: RawRow[], filters: AnalyticsFilter): RawRow[] {
  let filtered = rows;

  if (filters.companiesIncluded.length > 0) {
    filtered = filtered.filter((r) => {
      const co = getBrandCompany(r.br);
      return co && filters.companiesIncluded.includes(co);
    });
  }
  if (filters.companiesExcluded.length > 0) {
    filtered = filtered.filter((r) => {
      const co = getBrandCompany(r.br);
      return !(co && filters.companiesExcluded.includes(co));
    });
  }
  if (filters.brandsIncluded.length > 0) {
    const includedBrands = new Set(filters.brandsIncluded.map(normalizeBrandName));
    filtered = filtered.filter((r) => includedBrands.has(normalizeBrandName(r.br)));
  }
  if (filters.brandsExcluded.length > 0) {
    const excludedBrands = new Set(filters.brandsExcluded.map(normalizeBrandName));
    filtered = filtered.filter((r) => !excludedBrands.has(normalizeBrandName(r.br)));
  }
  if (filters.seriesIncluded.length > 0) {
    const seriesBrands = new Set(
      SERIES_PRESETS
        .filter((sp) => filters.seriesIncluded.includes(sp.id))
        .flatMap((sp) => sp.brands)
        .map(normalizeBrandName)
    );
    if (seriesBrands.size > 0) {
      filtered = filtered.filter((r) => seriesBrands.has(normalizeBrandName(r.br)));
    }
  }

  return applyServiceTypeFilter(filtered, filters.serviceTypesIncluded.length > 0 ? filters.serviceTypesIncluded : ALL_SERVICE_TYPES);
}

// ── API Helper ──────────────────────────────────────────────────────
export async function analyticsRequest(
  path: string,
  opts?: { method?: string; body?: unknown }
): Promise<any> {
  const url = `/.netlify/functions/loreal-analytics${path}`;
  const init: RequestInit = {
    headers: { "Content-Type": "application/json", "X-Access-Code": ACCESS_CODE },
    method: opts?.method || "GET",
  };
  if (opts?.body !== undefined) init.body = JSON.stringify(opts.body);
  const res = await fetch(url, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `שגיאה ${res.status}`);
  return data;
}
