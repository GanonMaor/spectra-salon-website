// Shared data, constants and utilities for L'Oréal Analytics
// This module is imported by LorealAnalyticsPage and all sub-tab components.
import rawData from "../../data/market-intelligence.json";
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

export const israelRawRows: RawRow[] = (rawData as any).rawRows
  ? (rawData as any).rawRows.filter((r: RawRow) => ISRAEL_KEYS.includes(r.co))
  : [];

export const availableMonths: { label: string; si: number }[] = (() => {
  const map: Record<string, number> = {};
  for (const r of israelRawRows) {
    if (!(r.mk in map) || r.si < map[r.mk]) map[r.mk] = r.si;
  }
  return Object.entries(map)
    .map(([label, si]) => ({ label, si }))
    .sort((a, b) => a.si - b.si);
})();

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
      const co = BRAND_TO_COMPANY[r.br];
      return co && filters.companiesIncluded.includes(co);
    });
  }
  if (filters.companiesExcluded.length > 0) {
    filtered = filtered.filter((r) => {
      const co = BRAND_TO_COMPANY[r.br];
      return !(co && filters.companiesExcluded.includes(co));
    });
  }
  if (filters.brandsIncluded.length > 0) {
    filtered = filtered.filter((r) => filters.brandsIncluded.includes(r.br));
  }
  if (filters.brandsExcluded.length > 0) {
    filtered = filtered.filter((r) => !filters.brandsExcluded.includes(r.br));
  }
  if (filters.seriesIncluded.length > 0) {
    const seriesBrands = new Set(
      SERIES_PRESETS
        .filter((sp) => filters.seriesIncluded.includes(sp.id))
        .flatMap((sp) => sp.brands)
    );
    if (seriesBrands.size > 0) {
      filtered = filtered.filter((r) => seriesBrands.has(r.br));
    }
  }
  if (filters.serviceTypesIncluded.length > 0 && filters.serviceTypesIncluded.length < ALL_SERVICE_TYPES.length) {
    filtered = filtered.map((r) => {
      const cs = filters.serviceTypesIncluded.includes("Color") ? r.cs : 0;
      const hs = filters.serviceTypesIncluded.includes("Highlights") ? r.hs : 0;
      const ts = filters.serviceTypesIncluded.includes("Toner") ? r.ts : 0;
      const ss = filters.serviceTypesIncluded.includes("Straightening") ? r.ss : 0;
      const os = filters.serviceTypesIncluded.includes("Others") ? r.os : 0;
      return { ...r, svc: cs + hs + ts + ss + os, cs, hs, ts, ss, os };
    });
  }

  return filtered;
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
