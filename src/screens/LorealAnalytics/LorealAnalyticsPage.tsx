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

// ── Constants ───────────────────────────────────────────────────────
const ACCESS_CODE = "LPR3391";
const SESSION_KEY = "loreal_analytics_unlocked";

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

const SERVICE_LABELS: Record<string, string> = {
  Color: "צבע",
  Highlights: "גוונים",
  Toner: "טונר",
  Straightening: "החלקה",
  Others: "אחר",
};

const MONTH_NAMES_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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

// ── Aggregated Israel Data ──────────────────────────────────────────
function aggregateIsraelData(rows: RawRow[]) {
  // Summary
  const totalVisits = rows.reduce((s, r) => s + r.vis, 0);
  const totalServices = rows.reduce((s, r) => s + r.svc, 0);
  const totalRevenue = rows.reduce((s, r) => s + r.cost, 0);
  const totalGrams = rows.reduce((s, r) => s + r.gr, 0);
  const uniqueUsers = new Set(rows.map((r) => r.uid));
  const uniqueBrands = new Set(rows.map((r) => r.br));
  const uniqueCities = new Set(rows.filter((r) => r.ci !== "Unknown").map((r) => r.ci));

  // Monthly trends
  const monthMap: Record<string, {
    label: string; si: number;
    visits: number; services: number; revenue: number; grams: number;
    color: number; highlights: number; toner: number; straightening: number; others: number;
    users: Set<string>; brands: Set<string>;
  }> = {};
  for (const r of rows) {
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
    m.users.add(r.uid); m.brands.add(r.br);
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
    if (!brandMap[r.br]) {
      brandMap[r.br] = { brand: r.br, services: 0, revenue: 0, grams: 0, visits: 0, users: new Set() };
    }
    const b = brandMap[r.br];
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
    const city = r.ci === "Unknown" ? "לא ידוע" : r.ci;
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
    { type: "Color", label: "צבע", services: rows.reduce((s, r) => s + r.cs, 0), revenue: rows.reduce((s, r) => s + r.cc, 0), grams: rows.reduce((s, r) => s + r.cg, 0) },
    { type: "Highlights", label: "גוונים", services: rows.reduce((s, r) => s + r.hs, 0), revenue: rows.reduce((s, r) => s + r.hc, 0), grams: rows.reduce((s, r) => s + r.hg, 0) },
    { type: "Toner", label: "טונר", services: rows.reduce((s, r) => s + r.ts, 0), revenue: rows.reduce((s, r) => s + r.tc, 0), grams: rows.reduce((s, r) => s + r.tg, 0) },
    { type: "Straightening", label: "החלקה", services: rows.reduce((s, r) => s + r.ss, 0), revenue: rows.reduce((s, r) => s + r.sc, 0), grams: rows.reduce((s, r) => s + r.sg, 0) },
    { type: "Others", label: "אחר", services: rows.reduce((s, r) => s + r.os, 0), revenue: rows.reduce((s, r) => s + r.oc, 0), grams: rows.reduce((s, r) => s + r.og, 0) },
  ].filter((s) => s.services > 0);

  // Brand monthly trends (top 8 brands)
  const top8Brands = brandPerformance.slice(0, 8).map((b) => b.brand);
  const brandMonthly: Record<string, Record<string, number>> = {};
  for (const r of rows) {
    if (!top8Brands.includes(r.br)) continue;
    if (!brandMonthly[r.mk]) brandMonthly[r.mk] = {};
    brandMonthly[r.mk][r.br] = (brandMonthly[r.mk][r.br] || 0) + r.svc;
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
        userId: r.uid, city: r.ci === "Unknown" ? "לא ידוע" : r.ci,
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
    u.brands.add(r.br); u.months.add(r.mk);
    if (r.si < u.firstSi) { u.firstSi = r.si; u.firstMonth = r.mk; }
    if (r.si > u.lastSi) { u.lastSi = r.si; u.lastMonth = r.mk; }
    if (u.city === "לא ידוע" && r.ci !== "Unknown") u.city = r.ci;
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
function AccessGate({ onUnlock }: { onUnlock: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (code === ACCESS_CODE) {
      sessionStorage.setItem(SESSION_KEY, "1");
      onUnlock();
    } else {
      setError("סיסמה שגויה. נסה שנית.");
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-200 shadow-xl rounded-3xl p-8 sm:p-10 text-center">
          {/* Logo area */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            L'Oréal Analytics
          </h2>
          <p className="text-sm text-gray-500 mb-2">
            Spectra Salon Platform — Israel Market
          </p>
          <p className="text-xs text-gray-400 mb-8">
            הזן סיסמה לגישה לדשבורד
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
            כניסה לדשבורד
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
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className={`bg-white border border-gray-100 shadow-sm rounded-2xl p-5 sm:p-6 ${className}`}>
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
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
    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 sm:p-5 flex items-start gap-3 sm:gap-4">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${colorMap[color] || colorMap.indigo} shadow-lg flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs sm:text-sm font-medium text-gray-500 leading-tight">{label}</p>
        <p className="text-lg sm:text-2xl font-bold text-gray-900 tracking-tight truncate">{value}</p>
        {sub && <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 truncate">{sub}</p>}
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
function Dashboard() {
  // Global customer filter
  const [globalFilterUsers, setGlobalFilterUsers] = useState<string[]>([]);
  const [globalFilterSearch, setGlobalFilterSearch] = useState("");
  const [showGlobalFilter, setShowGlobalFilter] = useState(false);
  const [globalFilterSort, setGlobalFilterSort] = useState<"services" | "continuity" | "monthsActive" | "avgServices" | "grams">("services");
  const [globalContinuityMin, setGlobalContinuityMin] = useState<number>(0);

  // Full data (unfiltered) for user list
  const allIsraelData = useMemo(() => aggregateIsraelData(israelRawRows), []);
  const allUserDetails = allIsraelData.userDetails;

  // Filtered raw rows based on global filter
  const filteredRawRows = useMemo(() => {
    if (globalFilterUsers.length === 0) return israelRawRows;
    return israelRawRows.filter((r) => globalFilterUsers.includes(r.uid));
  }, [globalFilterUsers]);

  // Re-aggregate with filtered rows
  const israelData = useMemo(() => aggregateIsraelData(filteredRawRows), [filteredRawRows]);
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
  const [activeTab, setActiveTab] = useState<"overview" | "brands" | "cities" | "users" | "compare" | "cohorts">("overview");

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
    () => [...new Set(userDetails.map((u) => u.city))].filter((c) => c !== "לא ידוע").sort(),
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
        name: "אחרים",
        value: othersServices,
        pct: totalServiceCount > 0 ? ((othersServices / totalServiceCount) * 100).toFixed(1) : "0",
      });
    }
    return result;
  }, [brandPerformance, totalServiceCount]);

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

  // Available months for comparison (always from all data, not filtered)
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    for (const r of israelRawRows) months.add(r.mk);
    const monthOrder: Record<string, number> = {};
    for (const r of israelRawRows) monthOrder[r.mk] = r.si;
    return [...months].sort((a, b) => (monthOrder[a] || 0) - (monthOrder[b] || 0));
  }, []);

  // Set default comparison months
  useEffect(() => {
    if (availableMonths.length >= 2 && !compareMonthA && !compareMonthB) {
      // Try to find same month last year vs this year
      const lastMonth = availableMonths[availableMonths.length - 1];
      const prevYearMonth = availableMonths.find((m) => {
        const [monthName, year] = [m.split(" ")[0], parseInt(m.split(" ")[1])];
        const [lastMonthName, lastYear] = [lastMonth.split(" ")[0], parseInt(lastMonth.split(" ")[1])];
        return monthName === lastMonthName && year === lastYear - 1;
      });
      setCompareMonthB(lastMonth);
      setCompareMonthA(prevYearMonth || availableMonths[availableMonths.length - 2]);
    }
  }, [availableMonths, compareMonthA, compareMonthB]);

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
      d.brands.add(r.br);
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
        city: user?.city || "לא ידוע",
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
      { name: "צבע", monthA: totals.aColor, monthB: totals.bColor },
      { name: "גוונים", monthA: totals.aHighlights, monthB: totals.bHighlights },
      { name: "טונר", monthA: totals.aToner, monthB: totals.bToner },
      { name: "החלקה", monthA: totals.aStraightening, monthB: totals.bStraightening },
    ];

    // KPI comparison
    const kpis = [
      { label: "שירותים", a: totals.aServices, b: totals.bServices },
      { label: "ביקורים", a: totals.aVisits, b: totals.bVisits },
      { label: "חומר (ג׳)", a: totals.aGrams, b: totals.bGrams },
    ];

    return { rows, totals, serviceCompareChart, kpis };
  }, [compareMonthA, compareMonthB, userMonthlyData, userDetails]);

  // ── Cohort tab state ────────────────────────────────────────────
  interface CohortMeta { id: number; name: string; description: string | null; start_month: string; end_month: string; member_count: number; }
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
      const msg = "שגיאת חיבור — ודא שהאתר רץ עם netlify dev או שפרוס ל-Netlify לפני שימוש בקבוצות.";
      setCohortError(msg);
      throw new Error(msg);
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data.error || `שגיאה ${res.status}`;
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
    if (!activeCohortId) return;
    try {
      await cohortRequest(`/${activeCohortId}/members`, {
        method: "POST", body: { user_ids: [userId] },
      });
      await loadMembers(activeCohortId);
      await loadCohorts();
    } catch {}
  }, [activeCohortId, cohortRequest, loadMembers, loadCohorts]);

  const removeMember = useCallback(async (userId: string) => {
    if (!activeCohortId) return;
    try {
      await cohortRequest(`/${activeCohortId}/members/${userId}`, { method: "DELETE" });
      if (cohortSelectedUser === userId) setCohortSelectedUser(null);
      await loadMembers(activeCohortId);
      await loadCohorts();
    } catch {}
  }, [activeCohortId, cohortSelectedUser, cohortRequest, loadMembers, loadCohorts]);

  // Dynamic month range from active cohort metadata
  const activeCohort = cohorts.find((c) => c.id === activeCohortId) || null;
  const cohortMonthSequence = useMemo(() => {
    if (!activeCohort) return [];
    return generateMonthSequence(activeCohort.start_month, activeCohort.end_month);
  }, [activeCohort?.start_month, activeCohort?.end_month]);
  const cohortRangeLabel = activeCohort ? `${activeCohort.start_month} – ${activeCohort.end_month}` : "";

  // Cohort monthly trend (filtered by cohort members within cohort date range)
  const cohortTrend = useMemo(() => {
    if (!cohortMembers.length || !cohortMonthSequence.length) return [];
    const memberSet = new Set(cohortMembers);
    const seqSet = new Set(cohortMonthSequence);
    const rows = israelRawRows.filter((r) => memberSet.has(r.uid) && seqSet.has(r.mk));
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
  }, [cohortMembers, cohortMonthSequence]);

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

  // Per-user year-over-year grams comparison (like the Excel pivot)
  const cohortUserYoY = useMemo(() => {
    if (!cohortMembers.length || !cohortMonthSequence.length) return [];
    const memberSet = new Set(cohortMembers);
    const seqSet = new Set(cohortMonthSequence);
    const rows = israelRawRows.filter((r) => memberSet.has(r.uid) && seqSet.has(r.mk));
    const years = new Set<number>();
    for (const m of cohortMonthSequence) {
      const y = parseInt(m.split(" ")[1], 10);
      years.add(y);
    }
    const sortedYears = [...years].sort();
    const userYearGrams: Record<string, Record<number, number>> = {};
    for (const r of rows) {
      const y = Math.floor(r.si / 100);
      if (!userYearGrams[r.uid]) userYearGrams[r.uid] = {};
      userYearGrams[r.uid][y] = (userYearGrams[r.uid][y] || 0) + r.gr;
    }
    const result = cohortMembers.map((uid) => {
      const yearData = userYearGrams[uid] || {};
      const entry: Record<string, any> = { userId: uid };
      for (const y of sortedYears) entry[`y${y}`] = Math.round(yearData[y] || 0);
      if (sortedYears.length >= 2) {
        const lastY = sortedYears[sortedYears.length - 1];
        const prevY = sortedYears[sortedYears.length - 2];
        entry.pct = pctChange(yearData[lastY] || 0, yearData[prevY] || 0);
      }
      return entry;
    });
    result.sort((a, b) => (b[`y${sortedYears[0]}`] || 0) - (a[`y${sortedYears[0]}`] || 0));
    return { years: sortedYears, rows: result };
  }, [cohortMembers, cohortMonthSequence]);

  // Competitor detection: first-seen brands per month within cohort
  const cohortCompetitors = useMemo(() => {
    if (!cohortMembers.length || !cohortMonthSequence.length) return [];
    const memberSet = new Set(cohortMembers);
    const seqSet = new Set(cohortMonthSequence);
    const rows = israelRawRows.filter((r) => memberSet.has(r.uid) && seqSet.has(r.mk));
    const seenBrands = new Set<string>();
    const result: { month: string; brands: { brand: string; services: number; dominantType: string }[] }[] = [];
    for (const month of cohortMonthSequence) {
      const monthRows = rows.filter((r) => r.mk === month);
      const brandMap: Record<string, { svc: number; color: number; highlights: number; toner: number; straightening: number; others: number }> = {};
      for (const r of monthRows) {
        if (!brandMap[r.br]) brandMap[r.br] = { svc: 0, color: 0, highlights: 0, toner: 0, straightening: 0, others: 0 };
        const b = brandMap[r.br];
        b.svc += r.svc; b.color += r.cs; b.highlights += r.hs; b.toner += r.ts; b.straightening += r.ss; b.others += r.os;
      }
      const newBrands: { brand: string; services: number; dominantType: string }[] = [];
      for (const [brand, stats] of Object.entries(brandMap)) {
        if (!seenBrands.has(brand)) {
          const types = [
            { type: "צבע", val: stats.color }, { type: "גוונים", val: stats.highlights },
            { type: "טונר", val: stats.toner }, { type: "החלקה", val: stats.straightening }, { type: "אחר", val: stats.others },
          ];
          const dominant = types.reduce((a, b) => (b.val > a.val ? b : a), types[0]);
          newBrands.push({ brand, services: stats.svc, dominantType: dominant.type });
          seenBrands.add(brand);
        }
      }
      result.push({ month, brands: newBrands.sort((a, b) => b.services - a.services) });
    }
    return result;
  }, [cohortMembers, cohortMonthSequence]);

  // Per-user drill-down trend (selected user within cohort)
  const selectedUserTrend = useMemo(() => {
    if (!cohortSelectedUser || !cohortMonthSequence.length) return [];
    const seqSet = new Set(cohortMonthSequence);
    const rows = israelRawRows.filter((r) => r.uid === cohortSelectedUser && seqSet.has(r.mk));
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
  }, [cohortSelectedUser, cohortMonthSequence]);

  // Cohort user search results (from all Israel users, for adding to cohort)
  const cohortSearchResults = useMemo(() => {
    if (!cohortUserSearch) return allUserDetails.slice(0, 30);
    const term = cohortUserSearch.toLowerCase();
    return allUserDetails.filter(
      (u) => u.userId.toLowerCase().includes(term) || u.city.toLowerCase().includes(term)
    ).slice(0, 50);
  }, [cohortUserSearch, allUserDetails]);

  // Tab buttons
  const tabs = [
    { key: "overview", label: "סקירה כללית" },
    { key: "brands", label: "מותגים ושוק" },
    { key: "cities", label: "פילוח גאוגרפי" },
    { key: "users", label: "נתוני משתמשים" },
    { key: "compare", label: "השוואה חודשית" },
    { key: "cohorts", label: "ניתוח קבוצות" },
  ] as const;

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-indigo-50/30">
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
              <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">L'Oréal Analytics</h1>
              <p className="text-[10px] sm:text-xs text-gray-500">Spectra Platform — שוק ישראל</p>
            </div>
          </div>
          <div className="text-left flex-shrink-0">
            <p className="text-[10px] sm:text-xs text-gray-400">טווח נתונים</p>
            <p className="text-xs sm:text-sm font-medium text-gray-600">{summary.dateRange.from} – {summary.dateRange.to}</p>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
          <KpiCard
            label="מספרות פעילות"
            value={fmtNumber(summary.uniqueUsers)}
            sub="בפלטפורמת Spectra"
            color="indigo"
            icon={<svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>}
          />
          <KpiCard
            label="סה״כ ביקורים"
            value={fmtCompact(summary.totalVisits)}
            sub={fmtNumber(summary.totalVisits)}
            color="emerald"
            icon={<svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>}
          />
          <KpiCard
            label="סה״כ שירותים"
            value={fmtCompact(summary.totalServices)}
            sub={fmtNumber(summary.totalServices)}
            color="amber"
            icon={<svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" /></svg>}
          />
          <KpiCard
            label="ממוצע שירותים/חודש"
            value={fmtNumber(monthlyTrends.length > 0 ? Math.round(summary.totalServices / monthlyTrends.length) : 0)}
            sub={`${monthlyTrends.length} חודשים`}
            color="purple"
            icon={<svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>}
          />
          <KpiCard
            label="מותגים פעילים"
            value={fmtNumber(summary.uniqueBrands)}
            sub={`${summary.uniqueCities} ערים`}
            color="pink"
            icon={<svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" /></svg>}
          />
          <KpiCard
            label="חומר גלם (גרם)"
            value={fmtCompact(summary.totalGrams)}
            sub={`${fmtNumber(summary.totalGrams)} גרם`}
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
              <span className="font-medium text-gray-700">סינון לקוחות</span>
              {globalFilterUsers.length > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                  {globalFilterUsers.length} נבחרו
                </span>
              )}
              {globalContinuityMin > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                  &ge; {globalContinuityMin}% רציפות
                </span>
              )}
              {globalFilterUsers.length === 0 && globalContinuityMin === 0 && (
                <span className="text-xs text-gray-400">כל הלקוחות</span>
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
                    נקה הכל
                  </button>
                </div>
              )}

              {/* Search + Sort */}
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={globalFilterSearch}
                  onChange={(e) => setGlobalFilterSearch(e.currentTarget.value)}
                  placeholder="חיפוש לקוח לפי ID או עיר..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                />
                <select
                  value={globalFilterSort}
                  onChange={(e) => setGlobalFilterSort(e.target.value as any)}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 cursor-pointer min-w-[160px]"
                >
                  <option value="services">מיון: שירותים</option>
                  <option value="continuity">מיון: רציפות שימוש</option>
                  <option value="monthsActive">מיון: חודשים פעילים</option>
                  <option value="avgServices">מיון: ממוצע שירותים/חודש</option>
                  <option value="grams">מיון: חומר (גרם)</option>
                </select>
              </div>

              {/* Continuity threshold filter */}
              <div className="flex flex-wrap items-center gap-2 bg-gray-50/80 border border-gray-100 rounded-xl px-3 py-2.5">
                <span className="text-xs font-medium text-gray-500 flex-shrink-0">רציפות מינימלית:</span>
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
                  placeholder="מותאם"
                  className="w-16 bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs text-center text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                />
                {globalContinuityMin > 0 && (
                  <button
                    onClick={() => setGlobalContinuityMin(0)}
                    className="text-xs text-red-500 hover:text-red-700 font-medium px-1"
                  >
                    נקה
                  </button>
                )}
                <span className="text-[11px] text-gray-400 mr-auto">
                  {globalFilterSearchResults.length} / {allUserDetails.length} לקוחות
                </span>
              </div>

              {/* Column header */}
              <div className="flex items-center gap-3 px-4 py-2 text-[11px] font-semibold text-gray-400 border-b border-gray-200 bg-gray-50/50 rounded-t-xl">
                <span className="w-5 flex-shrink-0"></span>
                <span className="w-14 flex-shrink-0">ID</span>
                <span className="w-24 flex-shrink-0">עיר</span>
                <span className="w-20 flex-shrink-0 text-center">רציפות</span>
                <span className="flex-1 text-start">נתונים</span>
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
                        <span>{u.monthsActive}/{u.totalPossibleMonths} חודשים</span>
                        <span className="hidden sm:inline">{fmtNumber(u.services)} שירותים</span>
                        <span className="hidden md:inline">~{u.avgServicesPerMonth}/חודש</span>
                        <span className="text-gray-500">מ-{u.firstMonth}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] text-gray-400 text-center">
                {globalFilterUsers.length > 0
                  ? `מציג נתונים עבור ${globalFilterUsers.length} לקוחות נבחרים. הנתונים בכל הטאבים מעודכנים.`
                  : "בחר לקוחות כדי לסנן את כל הדשבורד לפי הנבחרים בלבד."
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title="פילוח לפי קטגוריית שירות" subtitle="התפלגות סוגי שירותים בשוק הישראלי">
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
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
                  {serviceBreakdown.map((s, idx) => {
                    const pct = totalServiceCount > 0 ? ((s.services / totalServiceCount) * 100).toFixed(1) : "0";
                    return (
                      <div key={s.type} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: SERVICE_COLORS[s.type] || CHART_COLORS[idx] }} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{s.label}</p>
                          <p className="text-xs text-gray-500">{fmtNumber(s.services)} · {pct}%</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card title="חומר גלם לפי קטגוריית שירות" subtitle="פילוח צריכת חומר (גרם) לפי סוג טיפול">
                <div className="h-[280px] sm:h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={serviceBreakdown} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                      <XAxis type="number" tickFormatter={(v) => fmtCompact(v)} tick={{ fill: "#64748b", fontSize: 12 }} />
                      <YAxis type="category" dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} width={60} />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="grams" name="חומר (גרם)" radius={[0, 8, 8, 0]}>
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
            <Card title="מגמות חודשיות" subtitle="ביקורים ושירותים לאורך זמן">
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
                    <Area type="monotone" dataKey="services" name="שירותים" stroke="#6366F1" fillOpacity={1} fill="url(#colorServices)" strokeWidth={2} />
                    <Area type="monotone" dataKey="visits" name="ביקורים" stroke="#10B981" fillOpacity={1} fill="url(#colorVisits)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Material Consumption Trend */}
            <Card title="מגמת צריכת חומר" subtitle="צריכת חומר גלם (גרם) חודשית מהשוק הישראלי">
              <div className="h-[280px] sm:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(v) => fmtCompact(v)} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="grams" name="חומר (גרם)" fill="#0EA5E9" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Monthly % change table (overview) */}
            <Card title="שינוי חודשי באחוזים" subtitle="גרמים ושירותים — שינוי מהחודש הקודם">
              <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
                <table className="w-full text-sm min-w-[500px]">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-right py-2 px-2 text-gray-500 font-medium text-xs">חודש</th>
                      <th className="text-right py-2 px-2 text-gray-500 font-medium text-xs">גרמים</th>
                      <th className="text-right py-2 px-2 text-gray-500 font-medium text-xs">% שינוי</th>
                      <th className="text-right py-2 px-2 text-gray-500 font-medium text-xs">שירותים</th>
                      <th className="text-right py-2 px-2 text-gray-500 font-medium text-xs">% שינוי</th>
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
                <Card title="השוואת ינואר מול ינואר" subtitle="גרמים ושירותים — ינואר לעומת ינואר שנה קודמת (כלל השוק)">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pairs.map((p) => (
                      <div key={`${p.yearA}-${p.yearB}`} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="text-xs text-gray-500 mb-2 font-medium">{p.yearA} → {p.yearB}</div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-[10px] text-gray-400 mb-0.5">גרמים</p>
                            <p className="text-sm text-gray-700">{fmtNumber(p.gramsA)} → {fmtNumber(p.gramsB)}</p>
                            {p.gramsPct !== null && (
                              <span className={`inline-block mt-1 text-xs font-bold px-1.5 py-0.5 rounded ${p.gramsPct >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                                {p.gramsPct >= 0 ? "+" : ""}{p.gramsPct.toFixed(1)}%
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 mb-0.5">שירותים</p>
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
            <Card title="מגמות שירותים לפי קטגוריה" subtitle="התפלגות סוגי שירותים לאורך החודשים">
              <div className="h-[300px] sm:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(v) => fmtCompact(v)} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Area type="monotone" dataKey="color" name="צבע" stackId="1" stroke={SERVICE_COLORS.Color} fill={SERVICE_COLORS.Color} fillOpacity={0.7} />
                    <Area type="monotone" dataKey="highlights" name="גוונים" stackId="1" stroke={SERVICE_COLORS.Highlights} fill={SERVICE_COLORS.Highlights} fillOpacity={0.7} />
                    <Area type="monotone" dataKey="toner" name="טונר" stackId="1" stroke={SERVICE_COLORS.Toner} fill={SERVICE_COLORS.Toner} fillOpacity={0.7} />
                    <Area type="monotone" dataKey="straightening" name="החלקה" stackId="1" stroke={SERVICE_COLORS.Straightening} fill={SERVICE_COLORS.Straightening} fillOpacity={0.7} />
                    <Area type="monotone" dataKey="others" name="אחר" stackId="1" stroke={SERVICE_COLORS.Others} fill={SERVICE_COLORS.Others} fillOpacity={0.7} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Salon Type Breakdown */}
            <Card title="פילוח לפי סוג מספרה" subtitle="התפלגות סוגי מספרות בישראל">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {salonTypeBreakdown.map((st, idx) => (
                  <div key={st.type} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                      <span className="text-sm font-bold text-gray-900">סוג {st.type}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{st.count}</p>
                    <p className="text-xs text-gray-500">מספרות</p>
                    <div className="mt-2 pt-2 border-t border-gray-200 space-y-1">
                      <p className="text-xs text-gray-500">שירותים: <span className="font-medium text-gray-700">{fmtNumber(st.services)}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Active Users & Brands Trend */}
            <Card title="משתמשים ומותגים פעילים" subtitle="מספר מספרות ומותגים פעילים בכל חודש">
              <div className="h-[280px] sm:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line type="monotone" dataKey="activeUsers" name="מספרות פעילות" stroke="#6366F1" strokeWidth={2.5} dot={{ r: 4, fill: "#6366F1" }} />
                    <Line type="monotone" dataKey="activeBrands" name="מותגים פעילים" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 4, fill: "#F59E0B" }} />
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
            <Card title="נתח שוק לפי מותג" subtitle="Top 10 מותגי צבע שיער בשוק הישראלי (לפי מספר שירותים)">
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
            <Card title="ביצועי מותגים מפורט" subtitle="כל המותגים הפעילים בשוק הישראלי">
              <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
                <table className="w-full text-sm min-w-[600px]">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-right py-3 px-3 text-gray-500 font-medium">#</th>
                      <th className="text-right py-3 px-3 text-gray-500 font-medium">מותג</th>
                      <th className="text-right py-3 px-3 text-gray-500 font-medium">שירותים</th>
                      <th className="text-right py-3 px-3 text-gray-500 font-medium">ביקורים</th>
                      <th className="text-right py-3 px-3 text-gray-500 font-medium">חומר (ג׳)</th>
                      <th className="text-right py-3 px-3 text-gray-500 font-medium">מספרות</th>
                      <th className="text-right py-3 px-3 text-gray-500 font-medium">נתח שוק</th>
                    </tr>
                  </thead>
                  <tbody>
                    {brandPerformance.slice(0, 30).map((b, idx) => {
                      const share = totalServiceCount > 0 ? (b.services / totalServiceCount) * 100 : 0;
                      return (
                        <tr key={b.brand} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-3 text-gray-400">{idx + 1}</td>
                          <td className="py-3 px-3 font-medium text-gray-900">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                              {b.brand}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-gray-700">{fmtNumber(b.services)}</td>
                          <td className="py-3 px-3 text-gray-700">{fmtNumber(b.visits)}</td>
                          <td className="py-3 px-3 text-gray-700">{fmtNumber(b.grams)}</td>
                          <td className="py-3 px-3 text-gray-700">{(b as any).userCount || "—"}</td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-100 rounded-full h-2 max-w-[80px]">
                                <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${Math.min(share, 100)}%` }} />
                              </div>
                              <span className="text-gray-600 text-xs font-medium">{share.toFixed(1)}%</span>
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
            <Card title="מגמת מותגים לאורך זמן" subtitle="Top 8 מותגים — שירותים חודשיים">
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
            <Card title="צריכת חומר גלם לפי מותג" subtitle="Top 15 מותגים — שימוש בגרמים">
              <div className="h-[350px] sm:h-[450px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={brandPerformance.slice(0, 15)} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis type="number" tickFormatter={(v) => fmtCompact(v)} tick={{ fill: "#64748b", fontSize: 11 }} />
                    <YAxis type="category" dataKey="brand" tick={{ fill: "#64748b", fontSize: 11 }} width={130} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="grams" name="גרמים" radius={[0, 6, 6, 0]}>
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

        {/* ── Cities Tab ──────────────────────────────────────────── */}
        {activeTab === "cities" && (
          <div className="space-y-6">
            {/* City Distribution Pie */}
            <Card title="פילוח שוק לפי ערים" subtitle="התפלגות שירותים לפי ערים מובילות">
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
            <Card title="שירותים לפי עיר" subtitle="Top 10 ערים לפי כמות שירותים">
              <div className="h-[300px] sm:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cityShareData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(v) => fmtCompact(v)} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" name="שירותים" radius={[6, 6, 0, 0]}>
                      {cityShareData.map((_, idx) => (
                        <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Full City Table */}
            <Card title="כל הערים — נתונים מפורטים" subtitle="פילוח מלא לפי ערים בישראל">
              <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
                <table className="w-full text-sm min-w-[550px]">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-right py-3 px-3 text-gray-500 font-medium">#</th>
                      <th className="text-right py-3 px-3 text-gray-500 font-medium">עיר</th>
                      <th className="text-right py-3 px-3 text-gray-500 font-medium">מספרות</th>
                      <th className="text-right py-3 px-3 text-gray-500 font-medium">שירותים</th>
                      <th className="text-right py-3 px-3 text-gray-500 font-medium">ביקורים</th>
                      <th className="text-right py-3 px-3 text-gray-500 font-medium">חומר (ג׳)</th>
                      <th className="text-right py-3 px-3 text-gray-500 font-medium">נתח</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cityBreakdown.map((c, idx) => {
                      const totalCityServices = cityBreakdown.reduce((s, x) => s + x.services, 0);
                      const share = totalCityServices > 0 ? (c.services / totalCityServices) * 100 : 0;
                      return (
                        <tr key={c.city} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-3 text-gray-400">{idx + 1}</td>
                          <td className="py-3 px-3 font-medium text-gray-900">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                              {c.city}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-gray-700">{(c as any).userCount || "—"}</td>
                          <td className="py-3 px-3 text-gray-700">{fmtNumber(c.services)}</td>
                          <td className="py-3 px-3 text-gray-700">{fmtNumber(c.visits)}</td>
                          <td className="py-3 px-3 text-gray-700">{fmtNumber(c.grams)}</td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-100 rounded-full h-2 max-w-[80px]">
                                <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${Math.min(share, 100)}%` }} />
                              </div>
                              <span className="text-gray-600 text-xs font-medium">{share.toFixed(1)}%</span>
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
                <span className="text-sm text-gray-500">סה״כ משתמשים: </span>
                <span className="text-sm font-bold text-gray-900">{fmtNumber(userDetails.length)}</span>
              </div>
              <div className="hidden sm:block flex-1" />
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                {/* Search */}
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.currentTarget.value)}
                  placeholder="חיפוש לפי ID או עיר..."
                  className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 w-full sm:w-64 shadow-sm"
                />
                {/* City filter */}
                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.currentTarget.value)}
                  className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 shadow-sm"
                >
                  <option value="">כל הערים</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* User Table */}
            <Card title="היסטוריית שימוש — נתוני משתמשים" subtitle="לחץ על כותרת עמודה למיון">
              <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
                <table className="w-full text-sm min-w-[900px]">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {[
                        { key: "userId", label: "מזהה" },
                        { key: "city", label: "עיר" },
                        { key: "salonType", label: "סוג" },
                        { key: "employees", label: "עובדים" },
                        { key: "services", label: "שירותים" },
                        { key: "visits", label: "ביקורים" },
                        { key: "grams", label: "חומר (ג׳)" },
                        { key: "brandsUsed", label: "מותגים" },
                        { key: "monthsActive", label: "חודשים" },
                        { key: "continuityScore", label: "רציפות %" },
                        { key: "color", label: "צבע" },
                        { key: "highlights", label: "גוונים" },
                        { key: "toner", label: "טונר" },
                        { key: "straightening", label: "החלקה" },
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
                    מציג 100 מתוך {fmtNumber(sortedUsers.length)} משתמשים. השתמש בפילטרים לצמצום.
                  </p>
                )}
              </div>
            </Card>

            {/* User detail view - when clicking a user row expand to show their brands */}
            <Card title="מותגים בשימוש לפי משתמש" subtitle="Top 20 משתמשים — המותגים המובילים שלהם">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {userDetails.slice(0, 20).map((u) => (
                  <div key={u.userId} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-mono font-bold text-indigo-600">{u.userId}</span>
                      <span className="text-xs text-gray-400">{u.city}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">{fmtNumber(u.services)} שירותים · {fmtNumber(u.grams)} גרם</p>
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
            <Card title="השוואה חודשית" subtitle="בחר חודשים להשוואה ולקוחות ספציפיים (או השאר ריק להשוואת כל השוק)">
              <div className="space-y-4">
                {/* Month selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">חודש A (בסיס)</label>
                    <select
                      value={compareMonthA}
                      onChange={(e) => setCompareMonthA(e.currentTarget.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                    >
                      <option value="">בחר חודש...</option>
                      {availableMonths.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">חודש B (השוואה)</label>
                    <select
                      value={compareMonthB}
                      onChange={(e) => setCompareMonthB(e.currentTarget.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                    >
                      <option value="">בחר חודש...</option>
                      {availableMonths.map((m) => (
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
                      ההשוואה מציגה נתונים עבור <span className="font-bold">{globalFilterUsers.length}</span> לקוחות שנבחרו בסינון הגלובלי למעלה.
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
                <Card title="השוואת קטגוריות שירות" subtitle={`${compareMonthA} מול ${compareMonthB}`}>
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
                <Card title="השוואה לפי לקוח" subtitle={`${compareMonthA} מול ${compareMonthB} — שירותים, ביקורים וחומר`}>
                  <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
                    <table className="w-full text-sm min-w-[650px]">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th rowSpan={2} className="text-right py-2 px-2 text-gray-500 font-medium text-xs">מזהה</th>
                          <th rowSpan={2} className="text-right py-2 px-2 text-gray-500 font-medium text-xs">עיר</th>
                          <th colSpan={3} className="text-center py-1.5 px-2 text-indigo-600 font-bold text-xs border-b border-indigo-100 bg-indigo-50/50 rounded-t-lg">שירותים</th>
                          <th colSpan={3} className="text-center py-1.5 px-2 text-amber-600 font-bold text-xs border-b border-amber-100 bg-amber-50/50 rounded-t-lg">ביקורים</th>
                          <th colSpan={3} className="text-center py-1.5 px-2 text-emerald-600 font-bold text-xs border-b border-emerald-100 bg-emerald-50/50 rounded-t-lg">חומר (ג׳)</th>
                        </tr>
                        <tr className="border-b border-gray-200">
                          {/* Services */}
                          <th className="text-right py-1.5 px-2 text-gray-400 font-medium text-[10px]">{compareMonthA.split(" ")[0]}</th>
                          <th className="text-right py-1.5 px-2 text-gray-400 font-medium text-[10px]">{compareMonthB.split(" ")[0]}</th>
                          <th className="text-right py-1.5 px-2 text-gray-400 font-medium text-[10px]">שינוי</th>
                          {/* Visits */}
                          <th className="text-right py-1.5 px-2 text-gray-400 font-medium text-[10px]">{compareMonthA.split(" ")[0]}</th>
                          <th className="text-right py-1.5 px-2 text-gray-400 font-medium text-[10px]">{compareMonthB.split(" ")[0]}</th>
                          <th className="text-right py-1.5 px-2 text-gray-400 font-medium text-[10px]">שינוי</th>
                          {/* Grams */}
                          <th className="text-right py-1.5 px-2 text-gray-400 font-medium text-[10px]">{compareMonthA.split(" ")[0]}</th>
                          <th className="text-right py-1.5 px-2 text-gray-400 font-medium text-[10px]">{compareMonthB.split(" ")[0]}</th>
                          <th className="text-right py-1.5 px-2 text-gray-400 font-medium text-[10px]">שינוי</th>
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
                          <td className="py-3 px-2 text-gray-900 text-xs" colSpan={2}>סה״כ</td>
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
                        מציג 50 מתוך {fmtNumber(comparisonData.rows.length)} לקוחות.
                      </p>
                    )}
                  </div>
                </Card>
              </>
            )}

            {!comparisonData && (
              <div className="text-center py-16 text-gray-400">
                <p className="text-lg">בחר שני חודשים להשוואה</p>
              </div>
            )}
          </div>
        )}

        {/* ── Cohorts Tab ────────────────────────────────────────── */}
        {activeTab === "cohorts" && (
          <div className="space-y-6">
            {/* Error banner */}
            {cohortError && (
              <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-red-800">שגיאה בחיבור לשרת</p>
                  <p className="text-xs text-red-600 mt-0.5">{cohortError}</p>
                </div>
                <button onClick={() => { setCohortError(null); loadCohorts(); }} className="text-xs text-red-500 hover:text-red-700 font-medium flex-shrink-0">נסה שנית</button>
              </div>
            )}

            {/* Cohort management panel */}
            <Card title="ניהול קבוצות ניתוח" subtitle="צור קבוצות של מספרות לניתוח מגמות שוק">
              <div className="space-y-4">
                {/* Create new cohort */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newCohortName}
                    onChange={(e) => setNewCohortName(e.currentTarget.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") createCohort(); }}
                    placeholder="שם קבוצה חדשה..."
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                  />
                  <button
                    onClick={createCohort}
                    disabled={cohortLoading || !newCohortName.trim()}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-indigo-200 whitespace-nowrap"
                  >
                    + צור קבוצה
                  </button>
                </div>

                {/* Existing cohorts list */}
                {cohorts.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {cohorts.map((c) => (
                      <div
                        key={c.id}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all ${
                          activeCohortId === c.id
                            ? "bg-indigo-50 border-indigo-300 shadow-sm"
                            : "bg-white border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <span
                          onClick={() => setActiveCohortId(activeCohortId === c.id ? null : c.id)}
                          className="text-sm font-medium text-gray-800"
                        >
                          {c.name}
                        </span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md">
                          {c.member_count}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteCohort(c.id); }}
                          className="text-gray-300 hover:text-red-500 transition-colors text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {cohorts.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">אין קבוצות עדיין. צור קבוצה ראשונה למעלה.</p>
                )}
              </div>
            </Card>

            {/* Active cohort: member management */}
            {activeCohortId && (
              <Card
                title={`חברי קבוצה: ${cohorts.find((c) => c.id === activeCohortId)?.name || ""}`}
                subtitle="הוסף או הסר מספרות מהקבוצה"
              >
                <div className="space-y-4">
                  {/* Current members */}
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

                  {/* Search + add users */}
                  <div>
                    <input
                      type="text"
                      value={cohortUserSearch}
                      onChange={(e) => setCohortUserSearch(e.currentTarget.value)}
                      placeholder="חיפוש מספרה לפי ID או עיר..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                    />
                    <div className="max-h-[250px] overflow-y-auto mt-2 border border-gray-100 rounded-xl divide-y divide-gray-50">
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
                            <span className="text-xs text-gray-400">{fmtNumber(u.services)} שירותים · {u.monthsActive} חודשים</span>
                            <span className="flex-1" />
                            {isMember ? (
                              <span className="text-xs text-indigo-500 font-medium">בקבוצה</span>
                            ) : (
                              <span className="text-xs text-emerald-500 font-medium">+ הוסף</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Cohort trend chart */}
            {activeCohortId && cohortMembers.length > 0 && (
              <>
                {/* KPI summary for cohort */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <KpiCard
                    label="שירותים בתקופה"
                    value={fmtNumber(cohortTrend.reduce((s, m) => s + m.color + m.highlights + m.toner + m.straightening + m.others, 0))}
                    sub={cohortRangeLabel}
                    color="indigo"
                    icon={<svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" /></svg>}
                  />
                  <KpiCard
                    label="ביקורים בתקופה"
                    value={fmtNumber(cohortTrend.reduce((s, m) => s + m.visits, 0))}
                    sub={`${cohortMembers.length} מספרות`}
                    color="emerald"
                    icon={<svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>}
                  />
                  <KpiCard
                    label="חומר גלם (גרם)"
                    value={fmtCompact(cohortTrend.reduce((s, m) => s + m.grams, 0))}
                    sub={`${fmtNumber(cohortTrend.reduce((s, m) => s + m.grams, 0))} גרם`}
                    color="cyan"
                    icon={<svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" /></svg>}
                  />
                  <KpiCard
                    label="מתחרים חדשים"
                    value={fmtNumber(cohortCompetitors.reduce((s, m) => s + m.brands.length, 0))}
                    sub="מותגים חדשים שנכנסו"
                    color="pink"
                    icon={<svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>}
                  />
                </div>

                {/* Jan-vs-Jan comparison KPI */}
                {cohortJanVsJan && cohortJanVsJan.length > 0 && (
                  <Card title="השוואת ינואר מול ינואר" subtitle="גרמים ושירותים — ינואר לעומת ינואר שנה קודמת">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {cohortJanVsJan.map((p) => (
                        <div key={`${p.yearA}-${p.yearB}`} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <div className="text-xs text-gray-500 mb-2 font-medium">{p.yearA} → {p.yearB}</div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-[10px] text-gray-400 mb-0.5">גרמים</p>
                              <p className="text-sm text-gray-700">{fmtNumber(p.gramsA)} → {fmtNumber(p.gramsB)}</p>
                              {p.gramsPct !== null && (
                                <span className={`inline-block mt-1 text-xs font-bold px-1.5 py-0.5 rounded ${p.gramsPct >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                                  {p.gramsPct >= 0 ? "+" : ""}{p.gramsPct.toFixed(1)}%
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400 mb-0.5">שירותים</p>
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
                <Card title="שינוי חודשי באחוזים" subtitle="גרמים ושירותים — שינוי מהחודש הקודם">
                  <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
                    <table className="w-full text-sm min-w-[500px]">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-right py-2 px-2 text-gray-500 font-medium text-xs">חודש</th>
                          <th className="text-right py-2 px-2 text-gray-500 font-medium text-xs">גרמים</th>
                          <th className="text-right py-2 px-2 text-gray-500 font-medium text-xs">% שינוי</th>
                          <th className="text-right py-2 px-2 text-gray-500 font-medium text-xs">שירותים</th>
                          <th className="text-right py-2 px-2 text-gray-500 font-medium text-xs">% שינוי</th>
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

                {/* Per-user year-over-year grams table (like Excel pivot) */}
                {cohortUserYoY && (cohortUserYoY as any).years?.length >= 2 && (
                  <Card title="גרמים צבע+שטיפות+החלקות לפי משתמש" subtitle={`השוואת שנים · ${cohortRangeLabel}`}>
                    <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
                      <table className="w-full text-sm min-w-[400px]">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-right py-2 px-2 text-gray-500 font-medium text-xs">#</th>
                            {(cohortUserYoY as any).years.map((y: number) => (
                              <th key={y} className="text-right py-2 px-2 text-gray-500 font-medium text-xs">{y}</th>
                            ))}
                            <th className="text-right py-2 px-2 text-gray-500 font-medium text-xs">% שינוי</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(cohortUserYoY as any).rows.map((r: any) => (
                            <tr key={r.userId} className="border-b border-gray-50">
                              <td className="py-1.5 px-2 text-indigo-600 text-xs font-mono font-bold">{r.userId}</td>
                              {(cohortUserYoY as any).years.map((y: number) => (
                                <td key={y} className="py-1.5 px-2 text-gray-900 text-xs">{fmtNumber(r[`y${y}`] || 0)}</td>
                              ))}
                              <td className="py-1.5 px-2 text-xs font-bold">
                                {r.pct !== null && r.pct !== undefined ? (
                                  <span className={r.pct >= 0 ? "text-emerald-600" : "text-red-600"}>
                                    {r.pct >= 0 ? "+" : ""}{r.pct.toFixed(1)}%
                                  </span>
                                ) : (
                                  <span className="text-gray-300">–</span>
                                )}
                              </td>
                            </tr>
                          ))}
                          {/* Grand total row */}
                          <tr className="border-t-2 border-gray-300 bg-gray-50 font-bold">
                            <td className="py-2 px-2 text-gray-700 text-xs">סה״כ</td>
                            {(cohortUserYoY as any).years.map((y: number) => {
                              const total = (cohortUserYoY as any).rows.reduce((s: number, r: any) => s + (r[`y${y}`] || 0), 0);
                              return <td key={y} className="py-2 px-2 text-gray-900 text-xs">{fmtNumber(total)}</td>;
                            })}
                            <td className="py-2 px-2 text-xs font-bold">
                              {(() => {
                                const yrs = (cohortUserYoY as any).years;
                                if (yrs.length < 2) return "–";
                                const lastTotal = (cohortUserYoY as any).rows.reduce((s: number, r: any) => s + (r[`y${yrs[yrs.length - 1]}`] || 0), 0);
                                const prevTotal = (cohortUserYoY as any).rows.reduce((s: number, r: any) => s + (r[`y${yrs[yrs.length - 2]}`] || 0), 0);
                                const p = pctChange(lastTotal, prevTotal);
                                if (p === null) return "–";
                                return <span className={p >= 0 ? "text-emerald-600" : "text-red-600"}>{p >= 0 ? "+" : ""}{p.toFixed(1)}%</span>;
                              })()}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </Card>
                )}

                {/* Monthly services by type */}
                <Card title="שירותים חודשיים לפי סוג" subtitle={`${cohortMembers.length} מספרות נבחרות · ${cohortRangeLabel}`}>
                  <div className="h-[300px] sm:h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={cohortTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                        <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 11 }} />
                        <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(v) => fmtCompact(v)} />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Area type="monotone" dataKey="color" name="צבע" stackId="1" stroke={SERVICE_COLORS.Color} fill={SERVICE_COLORS.Color} fillOpacity={0.7} />
                        <Area type="monotone" dataKey="highlights" name="גוונים" stackId="1" stroke={SERVICE_COLORS.Highlights} fill={SERVICE_COLORS.Highlights} fillOpacity={0.7} />
                        <Area type="monotone" dataKey="toner" name="טונר" stackId="1" stroke={SERVICE_COLORS.Toner} fill={SERVICE_COLORS.Toner} fillOpacity={0.7} />
                        <Area type="monotone" dataKey="straightening" name="החלקה" stackId="1" stroke={SERVICE_COLORS.Straightening} fill={SERVICE_COLORS.Straightening} fillOpacity={0.7} />
                        <Area type="monotone" dataKey="others" name="אחר" stackId="1" stroke={SERVICE_COLORS.Others} fill={SERVICE_COLORS.Others} fillOpacity={0.7} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Visits and grams trend */}
                <Card title="מגמת ביקורים וחומר גלם" subtitle="ביקורים וגרמים חודשיים עבור הקבוצה">
                  <div className="h-[280px] sm:h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={cohortTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                        <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 11 }} />
                        <YAxis yAxisId="left" tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(v) => fmtCompact(v)} />
                        <YAxis yAxisId="right" orientation="left" tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(v) => fmtCompact(v)} />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="visits" name="ביקורים" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4, fill: "#10B981" }} />
                        <Line yAxisId="right" type="monotone" dataKey="grams" name="חומר (גרם)" stroke="#0EA5E9" strokeWidth={2.5} dot={{ r: 4, fill: "#0EA5E9" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Competitor first-seen markers */}
                <Card title="מתחרים חדשים לפי חודש" subtitle="מותגים שנראו לראשונה אצל מספרות הקבוצה">
                  <div className="space-y-3">
                    {cohortCompetitors.map((m) => (
                      <div key={m.month} className="border border-gray-100 rounded-xl overflow-hidden">
                        <div className={`flex items-center justify-between px-4 py-2.5 ${m.brands.length > 0 ? "bg-amber-50" : "bg-gray-50"}`}>
                          <span className="text-sm font-medium text-gray-800">{m.month}</span>
                          {m.brands.length > 0 ? (
                            <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-md">
                              {m.brands.length} חדשים
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">ללא שינוי</span>
                          )}
                        </div>
                        {m.brands.length > 0 && (
                          <div className="px-4 py-2 space-y-1.5">
                            {m.brands.map((b) => (
                              <div key={b.brand} className="flex items-center gap-3 text-sm">
                                <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                                <span className="font-medium text-gray-800 flex-1">{b.brand}</span>
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">{b.dominantType}</span>
                                <span className="text-xs text-gray-400">{fmtNumber(b.services)} שירותים</span>
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
                    title={`מגמת משתמש: ${cohortSelectedUser}`}
                    subtitle={`${allUserDetails.find((u) => u.userId === cohortSelectedUser)?.city || ""} · לחץ על משתמש בקבוצה לבחירה`}
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
                                עצירה: {m}
                              </span>
                            ))}
                            {slowdown.map((m) => (
                              <span key={m} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-600 text-xs font-medium border border-amber-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                האטה: {m}
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
                            <Area type="monotone" dataKey="color" name="צבע" stackId="1" stroke={SERVICE_COLORS.Color} fill={SERVICE_COLORS.Color} fillOpacity={0.7} />
                            <Area type="monotone" dataKey="highlights" name="גוונים" stackId="1" stroke={SERVICE_COLORS.Highlights} fill={SERVICE_COLORS.Highlights} fillOpacity={0.7} />
                            <Area type="monotone" dataKey="toner" name="טונר" stackId="1" stroke={SERVICE_COLORS.Toner} fill={SERVICE_COLORS.Toner} fillOpacity={0.7} />
                            <Area type="monotone" dataKey="straightening" name="החלקה" stackId="1" stroke={SERVICE_COLORS.Straightening} fill={SERVICE_COLORS.Straightening} fillOpacity={0.7} />
                            <Area type="monotone" dataKey="others" name="אחר" stackId="1" stroke={SERVICE_COLORS.Others} fill={SERVICE_COLORS.Others} fillOpacity={0.7} />
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
                            <Line type="monotone" dataKey="grams" name="חומר (גרם)" stroke="#0EA5E9" strokeWidth={2.5} dot={{ r: 4, fill: "#0EA5E9" }} />
                            <Line type="monotone" dataKey="visits" name="ביקורים" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4, fill: "#10B981" }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Monthly summary table */}
                      <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
                        <table className="w-full text-sm min-w-[500px]">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-right py-2 px-2 text-gray-500 font-medium text-xs">חודש</th>
                              <th className="text-right py-2 px-2 text-gray-500 font-medium text-xs">שירותים</th>
                              <th className="text-right py-2 px-2 text-gray-500 font-medium text-xs">ביקורים</th>
                              <th className="text-right py-2 px-2 text-gray-500 font-medium text-xs">חומר (ג׳)</th>
                              <th className="text-right py-2 px-2 text-gray-500 font-medium text-xs">צבע</th>
                              <th className="text-right py-2 px-2 text-gray-500 font-medium text-xs">גוונים</th>
                              <th className="text-right py-2 px-2 text-gray-500 font-medium text-xs">טונר</th>
                              <th className="text-right py-2 px-2 text-gray-500 font-medium text-xs">סטטוס</th>
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
                                    {isPaused && <span className="text-red-500 font-bold">עצירה</span>}
                                    {isSlowdown && <span className="text-amber-500 font-bold">האטה</span>}
                                    {!isPaused && !isSlowdown && m.services > 0 && <span className="text-emerald-500">פעיל</span>}
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
                    <p className="text-gray-400 text-sm">לחץ על משתמש בקבוצה למעלה לצפייה במגמת השימוש האישית שלו</p>
                  </div>
                )}
              </>
            )}

            {activeCohortId && cohortMembers.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <p className="text-lg">הוסף מספרות לקבוצה כדי לצפות בנתונים</p>
              </div>
            )}

            {!activeCohortId && cohorts.length > 0 && (
              <div className="text-center py-16 text-gray-400">
                <p className="text-lg">בחר קבוצה מלמעלה כדי לצפות בנתונים</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="text-center py-8 border-t border-gray-200 mt-8">
          <p className="text-sm text-gray-400">
            L'Oréal Analytics — Powered by <span className="font-medium text-gray-500">Spectra Salon Platform</span>
          </p>
          <p className="text-xs text-gray-300 mt-1">נתונים מעודכנים • {summary.dateRange.from} – {summary.dateRange.to}</p>
        </footer>
      </main>
    </div>
  );
}

// ── Exported Page ───────────────────────────────────────────────────
export default function LorealAnalyticsPage() {
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === "1"
  );

  if (!unlocked) {
    return <AccessGate onUnlock={() => setUnlocked(true)} />;
  }

  return <Dashboard />;
}
