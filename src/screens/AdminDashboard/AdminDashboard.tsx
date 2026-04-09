import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Search, Users, Globe, MapPin, ArrowUpDown, ArrowUp, ArrowDown,
  ChevronLeft, ChevronRight, Filter, X, BarChart3, Activity,
  Smartphone, Layers, RefreshCw, AlertTriangle, Heart,
  TrendingDown, Zap, ShieldAlert, Star, Eye, ChevronDown,
  LayoutDashboard, Sun, Moon, UserCheck, Phone, MessageCircle, Mail,
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { SiteThemeProvider, useSiteTheme } from "../../contexts/SiteTheme";
import mixIndexRaw from "../../data/phone-mix-index.json";
import summitRaw from "../../data/summit-billing.json";

// ═══════════════════════════════════════════════════════════════════════
// 1. PHONE → COUNTRY INFERENCE
// ═══════════════════════════════════════════════════════════════════════

function inferCountryFromPhone(phone: string): string {
  if (!phone) return "";
  const clean = phone.replace(/[\s\-\(\)]/g, "");
  if (/^05\d{8}$/.test(clean) || /^0[2-9]\d{7,8}$/.test(clean)) return "ISRAEL";
  if (/^972\d{9,10}$/.test(clean)) return "ISRAEL";
  if (/^07[0-9]{9,10}$/.test(clean) || /^447\d{9}$/.test(clean)) return "UK";
  if (/^351\d{9}$/.test(clean) || (/^9[12356]\d{7}$/.test(clean) && clean.length === 9)) return "PORTUGAL";
  if (/^39\d{9,10}$/.test(clean) || /^393\d{9}$/.test(clean)) return "ITALY";
  if (/^81\d{9,10}$/.test(clean)) return "JAPAN";
  if (/^30\d{10}$/.test(clean) || /^003\d{11,12}$/.test(clean)) return "GREECE";
  if (/^375\d{9}$/.test(clean)) return "BELARUS";
  if (/^79\d{9}$/.test(clean)) return "RUSSIA";
  if (/^61\d{9}$/.test(clean) || (/^41\d{7}$/.test(clean) && clean.length === 9)) return "AUSTRALIA";
  if (/^31\d{9}$/.test(clean) || (/^6[0-9]{8}$/.test(clean) && clean.length === 9)) return "NETHERLANDS";
  if (/^353\d{7,9}$/.test(clean) || /^08[0-9]{8}$/.test(clean)) return "IRELAND";
  if (clean.length === 10 && /^[2-9]\d{9}$/.test(clean)) return "USA";
  if (clean.length === 11 && clean.startsWith("1")) return "USA";
  return "";
}

// ═══════════════════════════════════════════════════════════════════════
// 2. DATE PARSING — relative strings → day count
// ═══════════════════════════════════════════════════════════════════════

function parseDaysAgo(dateStr: string | null | undefined): number | null {
  if (!dateStr || dateStr === "-") return null;
  const s = dateStr.trim().toLowerCase();
  if (s === "just now") return 0;
  // Sub-day precision: minutes → fractional days
  const minMatch = s.match(/^(\d+)\s*minutes?\s*ago$/i);
  if (minMatch) return parseInt(minMatch[1], 10) / 1440;
  // Hours → fractional days
  const hrMatch = s.match(/^(\d+)\s*hours?\s*ago$/i);
  if (hrMatch) return parseInt(hrMatch[1], 10) / 24;
  // Fallback catch-all for minute/hour strings
  if (s.includes("minute") || s.includes("hour")) return 0;
  // Days / months / years
  const m = s.match(/^(\d+)\s*(days?|months?|years?)\s*ago$/i);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  const unit = m[2].replace(/s$/, "");
  if (unit === "day") return n;
  if (unit === "month") return n * 30;
  if (unit === "year") return n * 365;
  return null;
}

// ═══════════════════════════════════════════════════════════════════════
// 3. HEALTH SCORE (0–100)
// ═══════════════════════════════════════════════════════════════════════

interface HealthResult {
  score: number;
  status: "healthy" | "at_risk" | "critical";
  factors: string[];
}

function computeHealth(
  daysInactive: number | null,
  tenureDays: number | null,
  profiles: number,
): HealthResult {
  let recency = 0;
  if (daysInactive === null) recency = 0;
  else if (daysInactive <= 1) recency = 100;
  else if (daysInactive <= 7) recency = 85;
  else if (daysInactive <= 14) recency = 55;
  else if (daysInactive <= 30) recency = 25;
  else recency = Math.max(0, 10 - (daysInactive - 30) / 10);

  let frequency = 0;
  if (tenureDays !== null && tenureDays > 0 && daysInactive !== null) {
    const activeDays = Math.max(0, tenureDays - daysInactive);
    frequency = Math.min(100, (activeDays / tenureDays) * 120);
  } else if (daysInactive === 0) frequency = 80;

  let adoption = 0;
  if (profiles === 0) adoption = 0;
  else if (profiles === 1) adoption = 30;
  else if (profiles <= 3) adoption = 60;
  else if (profiles <= 5) adoption = 80;
  else adoption = 100;

  let engagement = 50;
  if (tenureDays !== null && tenureDays > 90 && daysInactive !== null && daysInactive <= 7) engagement = 100;
  else if (tenureDays !== null && tenureDays > 180 && (daysInactive === null || daysInactive > 30)) engagement = 10;
  else if (daysInactive !== null && daysInactive <= 14) engagement = 70;

  const score = Math.round(recency * 0.40 + frequency * 0.25 + adoption * 0.20 + engagement * 0.15);
  const factors: string[] = [];
  if (daysInactive === null) factors.push("Never mixed");
  else if (daysInactive > 14) factors.push(`${daysInactive}d inactive`);
  else if (daysInactive > 7) factors.push(`${daysInactive}d since last mix`);
  if (profiles === 0) factors.push("No profiles");
  else if (profiles === 1 && tenureDays !== null && tenureDays > 90) factors.push("Only 1 profile after " + Math.round(tenureDays / 30) + " months");
  if (tenureDays !== null && tenureDays > 180 && (daysInactive === null || daysInactive > 60)) factors.push("Long tenure, no engagement");

  const status = score >= 70 ? "healthy" : score >= 40 ? "at_risk" : "critical";
  return { score, status, factors: factors.slice(0, 2) };
}

// ═══════════════════════════════════════════════════════════════════════
// 4. LIFECYCLE CLASSIFICATION
// ═══════════════════════════════════════════════════════════════════════

type Lifecycle = "new" | "activated" | "engaged" | "power_user" | "fading" | "dormant";

function classifyLifecycle(tenureDays: number | null, daysInactive: number | null, profiles: number, hasMixed: boolean): Lifecycle {
  if (!hasMixed) return tenureDays !== null && tenureDays <= 30 ? "new" : "dormant";
  if (daysInactive !== null && daysInactive > 14) return "dormant";
  if (daysInactive !== null && daysInactive > 7) return "fading";
  if (profiles >= 5 && daysInactive !== null && daysInactive <= 7) return "power_user";
  if (daysInactive !== null && daysInactive <= 7 && tenureDays !== null && tenureDays > 30) return "engaged";
  if (hasMixed && tenureDays !== null && tenureDays <= 60) return "activated";
  return "engaged";
}

const LIFECYCLE_CONFIG: Record<Lifecycle, { label: string; color: string; bg: string }> = {
  new:        { label: "New",        color: "text-sky-400",     bg: "bg-sky-500/10 border-sky-500/20" },
  activated:  { label: "Activated",  color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/20" },
  engaged:    { label: "Engaged",    color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  power_user: { label: "Power User", color: "text-violet-400",  bg: "bg-violet-500/10 border-violet-500/20" },
  fading:     { label: "Fading",     color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20" },
  dormant:    { label: "Dormant",    color: "text-gray-400",    bg: "bg-gray-500/10 border-gray-500/20" },
};

// ═══════════════════════════════════════════════════════════════════════
// 5. RISK TAGS
// ═══════════════════════════════════════════════════════════════════════

type RiskTag = "no_first_mix" | "sudden_drop" | "low_adoption" | "high_potential" | "recovered";

function computeRiskTags(hasMixed: boolean, daysInactive: number | null, tenureDays: number | null, profiles: number): RiskTag[] {
  const tags: RiskTag[] = [];
  if (!hasMixed) tags.push("no_first_mix");
  if (profiles >= 5) tags.push("high_potential");
  if (hasMixed && profiles >= 2 && daysInactive !== null && daysInactive > 14) tags.push("sudden_drop");
  if (profiles <= 1 && tenureDays !== null && tenureDays > 90 && hasMixed) tags.push("low_adoption");
  if (tenureDays !== null && tenureDays > 90 && daysInactive !== null && daysInactive <= 7) tags.push("recovered");
  return tags;
}

const RISK_TAG_CONFIG: Record<RiskTag, { label: string; color: string }> = {
  no_first_mix:   { label: "No First Mix",      color: "text-red-400 bg-red-500/10" },
  sudden_drop:    { label: "Sudden Drop",        color: "text-orange-400 bg-orange-500/10" },
  low_adoption:   { label: "Low Adoption",       color: "text-amber-400 bg-amber-500/10" },
  high_potential: { label: "High Potential",     color: "text-violet-400 bg-violet-500/10" },
  recovered:      { label: "Recovered",          color: "text-emerald-400 bg-emerald-500/10" },
};

// ═══════════════════════════════════════════════════════════════════════
// 6. RECOMMENDED CS ACTION
// ═══════════════════════════════════════════════════════════════════════

type CSAction = "send_tip" | "check_in" | "immediate_outreach" | "recovery_followup";

function recommendAction(health: HealthResult, lifecycle: Lifecycle, tags: RiskTag[]): CSAction {
  if (health.status === "critical" || lifecycle === "dormant") return "immediate_outreach";
  if (tags.includes("recovered")) return "recovery_followup";
  if (health.status === "at_risk" || lifecycle === "fading") return "check_in";
  return "send_tip";
}

const ACTION_CONFIG: Record<CSAction, { label: string; icon: typeof Mail; color: string; bg: string }> = {
  send_tip:           { label: "Send Tip",           icon: Zap,            color: "text-emerald-400", bg: "bg-emerald-500/10 hover:bg-emerald-500/20" },
  check_in:           { label: "Schedule Check-in",  icon: Phone,          color: "text-amber-400",   bg: "bg-amber-500/10 hover:bg-amber-500/20" },
  immediate_outreach: { label: "Outreach Now",        icon: ShieldAlert,    color: "text-red-400",     bg: "bg-red-500/10 hover:bg-red-500/20" },
  recovery_followup:  { label: "Recovery Follow-up",  icon: MessageCircle,  color: "text-blue-400",    bg: "bg-blue-500/10 hover:bg-blue-500/20" },
};

// ═══════════════════════════════════════════════════════════════════════
// 7. GEOGRAPHY NORMALIZATION
// ═══════════════════════════════════════════════════════════════════════

const COUNTRY_ALIASES: Record<string, string> = {
  // Israel
  "israel": "ISRAEL", "il": "ISRAEL",
  // UK / England
  "england": "UK", "united kingdom": "UK", "uk": "UK", "great britain": "UK", "gb": "UK",
  // USA + US states / cities that appear in state field
  "usa": "USA", "united states": "USA", "us": "USA",
  "tennesse": "USA", "tennessee": "USA", "texas": "USA", "california": "USA",
  "florida": "USA", "new york": "USA",
  // Ireland
  "irland": "IRELAND", "ireland": "IRELAND",
  // Portugal
  "portugal": "PORTUGAL",
  // Belarus
  "belarus": "BELARUS",
  // Italy
  "italy": "ITALY",
  // Japan
  "japan": "JAPAN",
  // Australia
  "australia": "AUSTRALIA",
  // Netherlands
  "netherlands": "NETHERLANDS",
  // Canada
  "canada": "CANADA",
  // Greece
  "greece": "GREECE",
  // Russia
  "russia": "RUSSIA",
};

// Values that look like city names, technical glitches, or test entries in the State field
const INVALID_STATE_VALUES = new Set([
  "mistake", "sent", "opposite", "ios", "android",
]);

function normalizeAdminCountry(state: string | undefined): string {
  if (!state || state.trim() === "") return "";
  const trimmed = state.trim();
  const lower = trimmed.toLowerCase();
  if (INVALID_STATE_VALUES.has(lower)) return "";
  return COUNTRY_ALIASES[lower] || trimmed.toUpperCase();
}

// ═══════════════════════════════════════════════════════════════════════
// 7b. PHONE → MIX STATS LOOKUP (from phone-mix-index.json)
// ═══════════════════════════════════════════════════════════════════════

interface MixStats {
  userId: string;
  totalMixes: number;
  monthsActive: number;
  firstMonth: string;
  lastMonth: string;
  brandsUsed: number;
}

// Same normalization logic as country-resolver.js normalizePhone
function normalizePhone(raw: string | number | undefined | null): string {
  if (raw == null) return "";
  return String(raw).replace(/[\s\-().+]/g, "").trim();
}

const MIX_INDEX = (mixIndexRaw as any).byPhone as Record<string, MixStats>;

function getMixStats(phone: string | undefined | null): MixStats | null {
  if (!phone) return null;
  return MIX_INDEX[normalizePhone(phone)] ?? null;
}

// ═══════════════════════════════════════════════════════════════════════
// 8. COHORT BUCKETING
// ═══════════════════════════════════════════════════════════════════════

type UsageBucket = "recent14" | "recent30" | "recent90" | "recent180" | "recent365" | "over1year" | "never";

function getCohortBucket(daysInactive: number | null): UsageBucket {
  if (daysInactive === null) return "never";
  if (daysInactive <= 14) return "recent14";
  if (daysInactive <= 30) return "recent30";
  if (daysInactive <= 90) return "recent90";
  if (daysInactive <= 180) return "recent180";
  if (daysInactive <= 365) return "recent365";
  return "over1year";
}

const BUCKET_CONFIG: Record<UsageBucket, { label: string; sublabel: string; colorDark: string; colorLight: string; bgDark: string; bgLight: string; ring: string }> = {
  recent14:  { label: "14 Days",     sublabel: "Last 14 days",       colorDark: "text-emerald-400",  colorLight: "text-emerald-700",  bgDark: "bg-emerald-500/10 border-emerald-500/20",  bgLight: "bg-emerald-50 border-emerald-200",  ring: "ring-emerald-500/30" },
  recent30:  { label: "30 Days",     sublabel: "Last 30 days",       colorDark: "text-blue-400",     colorLight: "text-blue-700",     bgDark: "bg-blue-500/10 border-blue-500/20",        bgLight: "bg-blue-50 border-blue-200",        ring: "ring-blue-500/30" },
  recent90:  { label: "3 Months",    sublabel: "Last 3 months",      colorDark: "text-sky-400",      colorLight: "text-sky-700",      bgDark: "bg-sky-500/10 border-sky-500/20",          bgLight: "bg-sky-50 border-sky-200",          ring: "ring-sky-500/30" },
  recent180: { label: "6 Months",    sublabel: "Last 6 months",      colorDark: "text-amber-400",    colorLight: "text-amber-700",    bgDark: "bg-amber-500/10 border-amber-500/20",      bgLight: "bg-amber-50 border-amber-200",      ring: "ring-amber-500/30" },
  recent365: { label: "Last Year",   sublabel: "Last 12 months",     colorDark: "text-orange-400",   colorLight: "text-orange-700",   bgDark: "bg-orange-500/10 border-orange-500/20",    bgLight: "bg-orange-50 border-orange-200",    ring: "ring-orange-500/30" },
  over1year: { label: "1+ Year Ago", sublabel: "Over a year ago",    colorDark: "text-red-400",      colorLight: "text-red-700",      bgDark: "bg-red-500/10 border-red-500/20",          bgLight: "bg-red-50 border-red-200",          ring: "ring-red-500/30" },
  never:     { label: "Never Mixed", sublabel: "No mixes recorded",  colorDark: "text-white/50",     colorLight: "text-gray-400",     bgDark: "bg-white/5 border-white/10",               bgLight: "bg-gray-50 border-gray-200",        ring: "ring-gray-300/30" },
};

// ═══════════════════════════════════════════════════════════════════════
// 9. TYPES
// ═══════════════════════════════════════════════════════════════════════

interface SalonUser {
  id: number;
  salon_name: string;
  phone_number: string;
  profiles: number;
  first_mix_date: string;
  last_mix_date: string;
  monthly_trend: string;
  version: string;
  state: string;
  city: string;
  links: string;
  summit: string;
  instagram: string;
  inferred_country?: string;
}

interface EnrichedUser extends SalonUser {
  days_inactive: number | null;
  tenure_days: number | null;
  has_mixed: boolean;
  health: HealthResult;
  lifecycle: Lifecycle;
  risk_tags: RiskTag[];
  cs_action: CSAction;
  cohort_bucket: UsageBucket;
  normalized_country: string;
}

function enrichUser(u: SalonUser): EnrichedUser {
  const days_inactive = parseDaysAgo(u.last_mix_date);
  const tenure_days = parseDaysAgo(u.first_mix_date);
  const has_mixed = u.first_mix_date !== "-" && u.first_mix_date !== null && u.first_mix_date !== "";
  const health = computeHealth(days_inactive, tenure_days, u.profiles);
  const lifecycle = classifyLifecycle(tenure_days, days_inactive, u.profiles, has_mixed);
  const risk_tags = computeRiskTags(has_mixed, days_inactive, tenure_days, u.profiles);
  const cs_action = recommendAction(health, lifecycle, risk_tags);
  const cohort_bucket = getCohortBucket(days_inactive);
  const normalized_country = normalizeAdminCountry(u.state) || inferCountryFromPhone(u.phone_number);
  return { ...u, days_inactive, tenure_days, has_mixed, health, lifecycle, risk_tags, cs_action, cohort_bucket, normalized_country };
}

// ═══════════════════════════════════════════════════════════════════════
// 10. API
// ═══════════════════════════════════════════════════════════════════════

interface Stats { total_users: string; total_profiles: string; latest_version_count: string; country_count: string; city_count: string; active_users: string; zero_profile_users: string; }
interface VersionBreakdown { version: string; count: string; }
type SalonUsersPayload = { users: SalonUser[]; stats: Stats; byState: { state: string; count: string; total_profiles: string }[]; byVersion: VersionBreakdown[]; };

async function fetchSalonUsersPayload(): Promise<SalonUsersPayload> {
  const endpoints = import.meta.env.DEV
    ? ["/.netlify/functions/salon-users", "http://localhost:8888/.netlify/functions/salon-users"]
    : ["/.netlify/functions/salon-users"];
  let lastError = "Unknown API error";
  for (const ep of endpoints) {
    try {
      const res = await fetch(ep);
      if (!res.ok) { lastError = `${ep} HTTP ${res.status}`; continue; }
      const ct = (res.headers.get("content-type") || "").toLowerCase();
      if (!ct.includes("application/json")) { lastError = `${ep} non-JSON`; await res.text(); continue; }
      return (await res.json()) as SalonUsersPayload;
    } catch (err: any) { lastError = `${ep}: ${err?.message}`; }
  }
  throw new Error(`Unable to load data. ${lastError}. Run "npm run dev" for local functions.`);
}

// ═══════════════════════════════════════════════════════════════════════
// 11. CONSTANTS & HELPERS
// ═══════════════════════════════════════════════════════════════════════

const PIE_COLORS = ["#6366f1","#8b5cf6","#a78bfa","#c4b5fd","#818cf8","#7c3aed","#6d28d9","#5b21b6","#4f46e5","#4338ca","#3730a3","#60a5fa","#38bdf8","#22d3ee","#2dd4bf","#34d399","#4ade80","#a3e635","#facc15"];
const PAGE_SIZE = 25;

type OverviewSortField = "salon_name" | "phone_number" | "profiles" | "first_mix_date" | "last_mix_date" | "version" | "state" | "city";
type CSSortField = "salon_name" | "profiles" | "days_inactive" | "health_score" | "version" | "state" | "city";
type CohortSortField = "salon_name" | "profiles" | "days_inactive" | "state" | "city" | "first_mix_date" | "total_mixes" | "version";
type SortDir = "asc" | "desc";
type StatusFilter = "all" | "active" | "at_risk" | "critical" | "recovered" | "churned";
type ActiveTab = "cohorts" | "overview" | "success" | "billing";

// ─── Summit billing types & helpers ──────────────────────────────────────────

interface SummitCustomer {
  name: string;
  sumitId: number | null;
  monthly: number[];
  ltv: number;
  subscriptionTotal: number;
  equipmentTotal: number;
  apr26: number;
  mar26: number;
  feb26: number;
  jan26: number;
  activeMonths: number;
  paymentType: "subscription" | "equipment" | "both" | "never";
  typicalMonthly: number;
  firstPaidMonth: string | null;
  lastPaidMonth: string | null;
  isActiveSubscriber: boolean;
  stoppedSubscription: boolean;
  currentlyPaying: boolean;
  // legacy compat
  total?: number;
  stoppedPaying?: boolean;
}

const SUMMIT_DATA = summitRaw as {
  months: string[];
  _source: string;
  summary: {
    total: number;
    activeSubscribers: number;
    stoppedSubscription: number;
    equipmentOnly: number;
    subscriptionAndEquip: number;
    neverPaid: number;
    totalLTV: number;
    // legacy compat (old april-only file)
    currentlyPaying?: number;
  };
  customers: SummitCustomer[];
};

function normalizeSummitName(s: string): string {
  return s
    .toLowerCase()
    .replace(/[\u0591-\u05C7]/g, "") // remove niqqud
    .replace(/['''".,()\-\s]/g, "")
    .trim();
}

function matchSummitToSalon(
  sc: SummitCustomer,
  users: EnrichedUser[]
): EnrichedUser | null {
  const scn = normalizeSummitName(sc.name);
  // 1. exact normalized match
  let match = users.find((u) => normalizeSummitName(u.salon_name) === scn);
  if (match) return match;
  // 2. one contains the other (at least 5 chars)
  match = users.find((u) => {
    const un = normalizeSummitName(u.salon_name);
    return (
      un.length >= 5 && scn.length >= 5 && (scn.includes(un) || un.includes(scn))
    );
  });
  if (match) return match;
  // 3. significant word overlap (>=2 shared tokens of length >=3)
  const scWords: string[] = scn.match(/[\u0590-\u05FF\w]{3,}/g) || [];
  match = users.find((u) => {
    const unWords: string[] = normalizeSummitName(u.salon_name).match(/[\u0590-\u05FF\w]{3,}/g) || [];
    const shared = scWords.filter((w) => unWords.includes(w));
    return shared.length >= 2;
  });
  return match || null;
}

function getFlag(country: string): string {
  const f: Record<string, string> = {
    ISRAEL:"\u{1F1EE}\u{1F1F1}", Israel:"\u{1F1EE}\u{1F1F1}",
    USA:"\u{1F1FA}\u{1F1F8}",
    UK:"\u{1F1EC}\u{1F1E7}", ENGLAND:"\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}",
    PORTUGAL:"\u{1F1F5}\u{1F1F9}", Portugal:"\u{1F1F5}\u{1F1F9}",
    ITALY:"\u{1F1EE}\u{1F1F9}", Italy:"\u{1F1EE}\u{1F1F9}",
    JAPAN:"\u{1F1EF}\u{1F1F5}", Japan:"\u{1F1EF}\u{1F1F5}",
    CANADA:"\u{1F1E8}\u{1F1E6}", Canada:"\u{1F1E8}\u{1F1E6}",
    BELARUS:"\u{1F1E7}\u{1F1FE}", Belarus:"\u{1F1E7}\u{1F1FE}",
    NETHERLANDS:"\u{1F1F3}\u{1F1F1}", Netherlands:"\u{1F1F3}\u{1F1F1}",
    AUSTRALIA:"\u{1F1E6}\u{1F1FA}", Australia:"\u{1F1E6}\u{1F1FA}",
    GREECE:"\u{1F1EC}\u{1F1F7}", Greece:"\u{1F1EC}\u{1F1F7}",
    IRELAND:"\u{1F1EE}\u{1F1EA}", IRLAND:"\u{1F1EE}\u{1F1EA}", Ireland:"\u{1F1EE}\u{1F1EA}",
    RUSSIA:"\u{1F1F7}\u{1F1FA}", Russia:"\u{1F1F7}\u{1F1FA}",
  };
  return f[country] || f[country?.toUpperCase()] || "\u{1F310}";
}

// ═══════════════════════════════════════════════════════════════════════
// 12. SHARED SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════

interface ThemeProps { isDark: boolean }

function CountryPieChart({ data, countryFilter, setCountryFilter, isDark }: { data: { name: string; value: number }[]; countryFilter: string; setCountryFilter: (v: string) => void } & ThemeProps) {
  const tooltipStyle = {
    background: isDark ? "#1a1a2e" : "#ffffff",
    border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
    borderRadius: "12px", color: isDark ? "#fff" : "#1A1A1A", fontSize: "13px",
  };
  return (
    <div className={`rounded-2xl border p-5 ${isDark ? "bg-white/[0.03] border-white/[0.06]" : "bg-white border-black/[0.08] shadow-sm"}`}>
      <h3 className={`text-sm font-medium mb-4 flex items-center gap-2 ${isDark ? "text-white/70" : "text-[#555555]"}`}><Globe className="w-4 h-4 text-indigo-400" />Country Distribution</h3>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data.slice(0, 12)} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={2} dataKey="value" stroke="none">
              {data.slice(0, 12).map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number, n: string) => [`${v} users`, n]} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mt-2">
        {data.slice(0, 9).map((item, i) => (
          <button key={item.name} onClick={() => setCountryFilter(countryFilter === item.name ? "all" : item.name)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition ${
              countryFilter === item.name
                ? "bg-indigo-500/20 text-indigo-500 border border-indigo-500/30"
                : isDark ? "text-white/50 hover:text-white/70 hover:bg-white/5" : "text-[#888] hover:text-[#555] hover:bg-black/[0.04]"
            }`}>
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
            <span className="truncate">{getFlag(item.name)} {item.name}</span>
            <span className={`ml-auto ${isDark ? "text-white/50" : "text-[#999]"}`}>{item.value}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function VersionBarChart({ data, allVersions, versionFilter, setVersionFilter, isDark }: { data: VersionBreakdown[]; allVersions: string[]; versionFilter: string; setVersionFilter: (v: string) => void } & ThemeProps) {
  const tooltipStyle = {
    background: isDark ? "#1a1a2e" : "#ffffff",
    border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
    borderRadius: "12px", color: isDark ? "#fff" : "#1A1A1A", fontSize: "13px",
  };
  const tickColor = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)";
  const gridColor = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)";
  return (
    <div className={`rounded-2xl border p-5 ${isDark ? "bg-white/[0.03] border-white/[0.06]" : "bg-white border-black/[0.08] shadow-sm"}`}>
      <h3 className={`text-sm font-medium mb-4 flex items-center gap-2 ${isDark ? "text-white/70" : "text-[#555555]"}`}><BarChart3 className="w-4 h-4 text-violet-400" />Version Distribution</h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.map(v => ({ version: `v${v.version}`, count: Number(v.count) }))} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis type="number" tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="version" tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} width={55} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="count" fill="#8b5cf6" radius={[0, 6, 6, 0]} barSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {allVersions.slice(0, 8).map(v => (
          <button key={v} onClick={() => setVersionFilter(versionFilter === v ? "all" : v)}
            className={`px-2.5 py-1 rounded-full text-xs transition ${
              versionFilter === v
                ? "bg-violet-500/20 text-violet-600 border border-violet-500/30"
                : isDark ? "bg-white/5 text-white/55 hover:text-white/60 hover:bg-white/10" : "bg-black/[0.04] text-[#888] hover:text-[#555] hover:bg-black/[0.07]"
            }`}>
            v{v}
          </button>
        ))}
      </div>
    </div>
  );
}

function Pagination({ page, totalPages, setPage, isDark }: { page: number; totalPages: number; setPage: (fn: (p: number) => number) => void } & ThemeProps) {
  if (totalPages <= 1) return null;
  return (
    <div className={`border-t px-4 py-3 flex items-center justify-between ${isDark ? "border-white/[0.06]" : "border-black/[0.06]"}`}>
      <p className={`text-xs ${isDark ? "text-white/50" : "text-[#999]"}`}>Page {page} of {totalPages}</p>
      <div className="flex items-center gap-1">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
          className={`p-1.5 rounded-lg disabled:opacity-20 disabled:cursor-not-allowed transition ${isDark ? "text-white/55 hover:text-white hover:bg-white/10" : "text-[#888] hover:text-[#333] hover:bg-black/[0.06]"}`}><ChevronLeft className="w-4 h-4" /></button>
        {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
          const pn = totalPages <= 7 ? i + 1 : page <= 4 ? i + 1 : page >= totalPages - 3 ? totalPages - 6 + i : page - 3 + i;
          return <button key={pn} onClick={() => setPage(() => pn)}
            className={`w-8 h-8 rounded-lg text-xs font-medium transition ${page === pn ? "bg-indigo-500 text-white" : isDark ? "text-white/55 hover:text-white hover:bg-white/10" : "text-[#888] hover:text-[#333] hover:bg-black/[0.06]"}`}>{pn}</button>;
        })}
        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
          className={`p-1.5 rounded-lg disabled:opacity-20 disabled:cursor-not-allowed transition ${isDark ? "text-white/55 hover:text-white hover:bg-white/10" : "text-[#888] hover:text-[#333] hover:bg-black/[0.06]"}`}><ChevronRight className="w-4 h-4" /></button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 13. MAIN COMPONENT (inner, needs theme)
// ═══════════════════════════════════════════════════════════════════════

const AdminDashboardInner: React.FC = () => {
  const { isDark, toggleTheme } = useSiteTheme();

  // ── Admin theme tokens ──
  const at = {
    page:         isDark ? "bg-[#0a0a0f] text-white"                 : "bg-[#FAFAF8] text-[#1A1A1A]",
    sticky:       isDark ? "bg-[#0a0a0f]/80"                         : "bg-[#FAFAF8]/90",
    card:         isDark ? "bg-white/[0.03] border-white/[0.06]"     : "bg-white border-black/[0.08] shadow-sm",
    cardHover:    isDark ? "hover:bg-white/[0.05]"                    : "hover:bg-gray-50",
    subCard:      isDark ? "bg-white/[0.02] border-white/[0.06]"     : "bg-white/60 border-black/[0.06]",
    stickyBorder: isDark ? "border-white/5"                           : "border-black/[0.06]",
    textPrimary:  isDark ? "text-white"                               : "text-[#1A1A1A]",
    text90:       isDark ? "text-white/90"                            : "text-[#1A1A1A]",
    textSec:      isDark ? "text-white/70"                            : "text-[#555555]",
    textMuted:    isDark ? "text-white/55"                            : "text-[#777777]",
    textFaint:    isDark ? "text-white/50"                            : "text-[#999999]",
    textDim:      isDark ? "text-white/15"                            : "text-[#CCCCCC]",
    border:       isDark ? "border-white/[0.06]"                      : "border-black/[0.08]",
    borderMed:    isDark ? "border-white/[0.08]"                      : "border-black/[0.10]",
    input:        isDark
      ? "bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/50 focus:border-indigo-500/50 focus:ring-indigo-500/20"
      : "bg-white border-black/[0.12] text-[#1A1A1A] placeholder:text-[#AAAAAA] focus:border-indigo-400 focus:ring-indigo-400/20",
    select:       isDark ? "bg-white/[0.06] border-white/[0.1] text-white"          : "bg-white border-black/[0.10] text-[#1A1A1A]",
    selectBg:     isDark ? "#1a1a2e"                                  : "#ffffff",
    tabWrap:      isDark ? "bg-white/[0.04] border-white/[0.06]"     : "bg-black/[0.04] border-black/[0.06]",
    tabActive:    isDark ? "bg-white/[0.1] text-white shadow-sm"      : "bg-white text-[#1A1A1A] shadow-sm",
    tabInactive:  isDark ? "text-white/55 hover:text-white/70"         : "text-[#888888] hover:text-[#555555]",
    rowDivide:    isDark ? "divide-white/[0.03]"                      : "divide-black/[0.04]",
    rowHover:     isDark ? "hover:bg-white/[0.03]"                    : "hover:bg-black/[0.02]",
    filterPanel:  isDark ? "bg-white/[0.02] border-white/[0.06]"     : "bg-black/[0.02] border-black/[0.05]",
    tagActive:    isDark ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-300" : "bg-indigo-50 border-indigo-200 text-indigo-700",
    tagInactive:  isDark ? "bg-white/[0.03] border-white/[0.06] text-white/55 hover:text-white/70 hover:bg-white/[0.05]" : "bg-black/[0.03] border-black/[0.06] text-[#888] hover:text-[#555] hover:bg-black/[0.05]",
    filterActive: isDark ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300" : "bg-indigo-50 border-indigo-200 text-indigo-700",
    filterInactive:isDark ? "bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-white/70" : "bg-white border-black/[0.08] text-[#888] hover:text-[#555]",
    expandRow:    isDark ? "bg-white/[0.02]"                          : "bg-black/[0.02]",
    toggleBtn:    isDark ? "bg-white/[0.06] hover:bg-white/[0.12] text-white/55 hover:text-white/70" : "bg-black/[0.04] hover:bg-black/[0.08] text-black/55 hover:text-black/70",
    spinner:      isDark ? "border-indigo-500/30 border-t-indigo-500" : "border-indigo-400/40 border-t-indigo-500",
    freshnessBg:  isDark ? "bg-white/[0.02] border-white/[0.06]"     : "bg-[#EAB776]/8 border-[#EAB776]/20",
    freshnessDot: "bg-green-400",
  };

  // ── Tab ──
  const [activeTab, setActiveTab] = useState<ActiveTab>("cohorts");

  // ── Data ──
  const [rawUsers, setRawUsers] = useState<SalonUser[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [byVersion, setByVersion] = useState<VersionBreakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadedAt, setLoadedAt] = useState<Date | null>(null);

  // ── Shared filters ──
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [versionFilter, setVersionFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // ── Overview-specific ──
  const [profileFilter, setProfileFilter] = useState<string>("all");
  const [ovSortField, setOvSortField] = useState<OverviewSortField>("profiles");
  const [ovSortDir, setOvSortDir] = useState<SortDir>("desc");
  const [ovPage, setOvPage] = useState(1);

  // ── CS-specific ──
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [lifecycleFilter, setLifecycleFilter] = useState<string>("all");
  const [quickToggle, setQuickToggle] = useState<"" | "at_risk" | "new" | "high_potential">("");
  const [csSortField, setCsSortField] = useState<CSSortField>("health_score");
  const [csSortDir, setCsSortDir] = useState<SortDir>("asc");
  const [csPage, setCsPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // ── Cohort-specific ──
  const [cohortBucket, setCohortBucket] = useState<UsageBucket | "all">("all");

  // ── Table-wide edits (Summit / Instagram) ──
  const [pendingEdits, setPendingEdits] = useState<Record<number, { summit?: string; instagram?: string }>>({});
  const [isTableEditing, setIsTableEditing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [tableSavedAt, setTableSavedAt] = useState<number | null>(null);

  function handleEditChange(id: number, field: "summit" | "instagram", value: string) {
    setPendingEdits(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  }

  function hasEdits(user: EnrichedUser) {
    const e = pendingEdits[user.id];
    if (!e) return false;
    return (e.summit !== undefined && e.summit !== (user.summit ?? "")) ||
           (e.instagram !== undefined && e.instagram !== (user.instagram ?? ""));
  }

  function startEditingTable() {
    setIsTableEditing(true);
  }

  function cancelTableEdits() {
    setPendingEdits({});
    setIsTableEditing(false);
  }

  async function patchSalonUser(id: number, summit: string, instagram: string) {
    try {
      const endpoints = import.meta.env.DEV
        ? ["/.netlify/functions/update-salon-user", "http://localhost:8888/.netlify/functions/update-salon-user"]
        : ["/.netlify/functions/update-salon-user"];

      for (const ep of endpoints) {
        try {
          const res = await fetch(ep, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, summit, instagram }),
          });
          if (res.ok) return true;
        } catch { /* try next */ }
      }
      return false;
    } catch {
      return false;
    }
  }

  async function publishTableEdits() {
    const changedUsers = users.filter(hasEdits);
    if (changedUsers.length === 0) {
      setIsTableEditing(false);
      return;
    }

    setIsPublishing(true);
    const updates: Record<number, { summit: string; instagram: string }> = {};

    try {
      for (const user of changedUsers) {
        const edit = pendingEdits[user.id];
        if (!edit) continue;
        const summit = edit.summit ?? user.summit ?? "";
        const instagram = edit.instagram ?? user.instagram ?? "";
        const ok = await patchSalonUser(user.id, summit, instagram);
        if (ok) updates[user.id] = { summit, instagram };
      }

      if (Object.keys(updates).length > 0) {
        setRawUsers(prev => prev.map(u => updates[u.id] ? { ...u, ...updates[u.id] } : u));
      }

      setPendingEdits({});
      setIsTableEditing(false);
      setTableSavedAt(Date.now());
      setTimeout(() => setTableSavedAt(null), 2500);
    } finally {
      setIsPublishing(false);
    }
  }

  function getExternalHref(value: string, type: "summit" | "instagram"): string | null {
    const trimmed = (value || "").trim();
    if (!trimmed) return null;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (type === "instagram") {
      const handle = trimmed.replace(/^@+/, "");
      return handle ? `https://instagram.com/${handle}` : null;
    }
    return `https://${trimmed}`;
  }

  function handleTableWheel(e: React.WheelEvent<HTMLDivElement>) {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      window.scrollBy({ top: e.deltaY, left: 0, behavior: "auto" });
    }
  }
  const [cohortSortField, setCohortSortField] = useState<CohortSortField>("first_mix_date");
  const [cohortSortDir, setCohortSortDir] = useState<SortDir>("asc");
  const [cohortPage, setCohortPage] = useState(1);

  // ── Billing tab state (must be at component top level, not inside render) ──
  const [billingView, setBillingView] = useState<
    "paying_not_using" | "using_not_paying" | "equipment" | "stopped"
  >("paying_not_using");

  // ── Fetch ──
  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await fetchSalonUsersPayload();
      const enhanced = (data.users || []).map((u: SalonUser) => ({
        ...u, inferred_country: u.state || inferCountryFromPhone(u.phone_number),
      }));
      setRawUsers(enhanced);
      setStats(data.stats);
      setByVersion(data.byVersion || []);
      setLoadedAt(new Date());
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Enriched users ──
  const users = useMemo(() => rawUsers.map(enrichUser), [rawUsers]);

  // ── Derived ──
  const allCountries = useMemo(() => {
    const s = new Set<string>();
    users.forEach(u => { if (u.normalized_country) s.add(u.normalized_country); });
    return Array.from(s).sort();
  }, [users]);

  const allVersions = useMemo(() => {
    const s = new Set<string>();
    users.forEach(u => { if (u.version) s.add(u.version); });
    return Array.from(s).sort((a, b) => b.localeCompare(a));
  }, [users]);

  const countryChartData = useMemo(() => {
    const m = new Map<string, number>();
    users.forEach(u => {
      const c = u.normalized_country || "Unknown";
      m.set(c, (m.get(c) || 0) + 1);
    });
    return Array.from(m.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [users]);

  // ── Summit billing cross-reference (must be useMemo, not inside render) ──
  const summitWithMatch = useMemo(() =>
    SUMMIT_DATA.customers.map((sc) => ({
      sc,
      user: matchSummitToSalon(sc, users),
    })), [users]);

  const billingPayingNotUsing = useMemo(() =>
    summitWithMatch
      .filter(({ sc, user }) => {
        if (!sc.isActiveSubscriber) return false;
        if (!user) return true;
        return user.days_inactive === null || user.days_inactive > 30;
      })
      .sort((a, b) => (b.sc.typicalMonthly || 0) - (a.sc.typicalMonthly || 0)),
    [summitWithMatch]);

  const billingUsingNotPaying = useMemo(() =>
    users
      .filter((u) => {
        if (!u.has_mixed) return false;
        if (u.days_inactive === null || u.days_inactive > 60) return false;
        const entry = summitWithMatch.find((m) => m.user?.phone_number === u.phone_number);
        if (!entry) return true;
        return !entry.sc.isActiveSubscriber;
      })
      .sort((a, b) => (a.days_inactive ?? 999) - (b.days_inactive ?? 999)),
    [users, summitWithMatch]);

  const billingEquipmentOnly = useMemo(() =>
    summitWithMatch
      .filter(({ sc }) => sc.paymentType === "equipment")
      .sort((a, b) => b.sc.ltv - a.sc.ltv),
    [summitWithMatch]);

  const billingStoppedSubs = useMemo(() =>
    summitWithMatch
      .filter(({ sc }) => sc.stoppedSubscription)
      .sort((a, b) => b.sc.ltv - a.sc.ltv),
    [summitWithMatch]);

  // ── KPI counts (CS) ──
  const kpis = useMemo(() => {
    let active = 0, atRisk = 0, critical = 0, recovered = 0, churned = 0;
    users.forEach(u => {
      if (u.days_inactive !== null && u.days_inactive <= 7) { if (u.tenure_days !== null && u.tenure_days > 90) recovered++; active++; }
      else if (u.days_inactive !== null && u.days_inactive <= 14) atRisk++;
      else if (u.days_inactive !== null && u.days_inactive <= 30) critical++;
      else churned++;
    });
    return { active, atRisk, critical, recovered, churned };
  }, [users]);

  // ── Cohort counts ──
  const cohortCounts = useMemo(() => {
    const counts: Record<UsageBucket, number> = { recent14: 0, recent30: 0, recent90: 0, recent180: 0, recent365: 0, over1year: 0, never: 0 };
    users.forEach(u => { counts[u.cohort_bucket]++; });
    return counts;
  }, [users]);

  const cohortViewIsDefault = search === "" &&
    countryFilter === "all" &&
    cohortBucket === "all" &&
    cohortSortField === "first_mix_date" &&
    cohortSortDir === "asc" &&
    cohortPage === 1;

  function resetCohortView() {
    setSearch("");
    setCountryFilter("all");
    setCohortBucket("all");
    setCohortSortField("first_mix_date");
    setCohortSortDir("asc");
    setCohortPage(1);
    setPendingEdits({});
    setIsTableEditing(false);
  }

  // ── Attention Today (CS) ──
  const attentionList = useMemo(() => [...users].filter(u => u.health.status !== "healthy").sort((a, b) => {
    if (a.health.score !== b.health.score) return a.health.score - b.health.score;
    return (b.tenure_days || 0) - (a.tenure_days || 0);
  }).slice(0, 10), [users]);

  // ── Insights (CS) ──
  const insights = useMemo(() => {
    const churned = users.filter(u => u.days_inactive === null || u.days_inactive > 30);
    const churnedSingleProfile = churned.filter(u => u.profiles <= 1).length;
    const churnedPct = churned.length > 0 ? Math.round((churnedSingleProfile / churned.length) * 100) : 0;
    const powerUsers = users.filter(u => u.lifecycle === "power_user").length;
    const avgProfiles = users.length > 0 ? (users.reduce((s, u) => s + u.profiles, 0) / users.length).toFixed(1) : "0";
    const noFirstMix = users.filter(u => !u.has_mixed).length;
    const noFirstMixPct = users.length > 0 ? Math.round((noFirstMix / users.length) * 100) : 0;
    const recoveredCount = users.filter(u => u.risk_tags.includes("recovered")).length;
    return { churnedPct, churnedSingleProfile, powerUsers, avgProfiles, noFirstMix, noFirstMixPct, recoveredCount, totalChurned: churned.length };
  }, [users]);

  // ── OVERVIEW — filtered, sorted, paged ──
  const ovFiltered = useMemo(() => {
    let result = [...users];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(u =>
        u.salon_name.toLowerCase().includes(q) ||
        u.phone_number.includes(q) ||
        (u.city || "").toLowerCase().includes(q) ||
        (u.summit || "").toLowerCase().includes(q) ||
        (u.instagram || "").toLowerCase().includes(q)
      );
    }
    if (countryFilter !== "all") result = result.filter(u => u.normalized_country === countryFilter);
    if (versionFilter !== "all") result = result.filter(u => u.version === versionFilter);
    if (profileFilter === "active") result = result.filter(u => u.profiles > 0);
    else if (profileFilter === "zero") result = result.filter(u => u.profiles === 0);
    else if (profileFilter === "multi") result = result.filter(u => u.profiles > 1);
    result.sort((a, b) => {
      let aV: any;
      let bV: any;
      switch (ovSortField) {
        case "profiles":
          aV = Number(a.profiles) || 0;
          bV = Number(b.profiles) || 0;
          break;
        case "first_mix_date":
          aV = a.tenure_days ?? Number.POSITIVE_INFINITY;
          bV = b.tenure_days ?? Number.POSITIVE_INFINITY;
          break;
        case "last_mix_date":
          aV = a.days_inactive ?? Number.POSITIVE_INFINITY;
          bV = b.days_inactive ?? Number.POSITIVE_INFINITY;
          break;
        case "version":
          aV = Number(a.version) || 0;
          bV = Number(b.version) || 0;
          break;
        default:
          aV = ((a as any)[ovSortField] || "").toString().toLowerCase();
          bV = ((b as any)[ovSortField] || "").toString().toLowerCase();
          break;
      }
      if (aV < bV) return ovSortDir === "asc" ? -1 : 1; if (aV > bV) return ovSortDir === "asc" ? 1 : -1; return 0;
    });
    return result;
  }, [users, search, countryFilter, versionFilter, profileFilter, ovSortField, ovSortDir]);

  const ovTotalPages = Math.ceil(ovFiltered.length / PAGE_SIZE);
  const ovPaged = useMemo(() => ovFiltered.slice((ovPage - 1) * PAGE_SIZE, ovPage * PAGE_SIZE), [ovFiltered, ovPage]);
  useEffect(() => { setOvPage(1); }, [search, countryFilter, versionFilter, profileFilter]);

  // ── CS — filtered, sorted, paged ──
  const csFiltered = useMemo(() => {
    let result = [...users];
    if (search) { const q = search.toLowerCase(); result = result.filter(u => u.salon_name.toLowerCase().includes(q) || u.phone_number.includes(q) || (u.city || "").toLowerCase().includes(q)); }
    if (countryFilter !== "all") result = result.filter(u => u.normalized_country === countryFilter);
    if (versionFilter !== "all") result = result.filter(u => u.version === versionFilter);
    if (lifecycleFilter !== "all") result = result.filter(u => u.lifecycle === lifecycleFilter);
    if (statusFilter === "active") result = result.filter(u => u.days_inactive !== null && u.days_inactive <= 7);
    else if (statusFilter === "at_risk") result = result.filter(u => u.days_inactive !== null && u.days_inactive > 7 && u.days_inactive <= 14);
    else if (statusFilter === "critical") result = result.filter(u => u.days_inactive !== null && u.days_inactive > 14 && u.days_inactive <= 30);
    else if (statusFilter === "recovered") result = result.filter(u => u.risk_tags.includes("recovered"));
    else if (statusFilter === "churned") result = result.filter(u => u.days_inactive === null || u.days_inactive > 30);
    if (quickToggle === "at_risk") result = result.filter(u => u.health.status !== "healthy");
    else if (quickToggle === "new") result = result.filter(u => u.lifecycle === "new" || u.lifecycle === "activated");
    else if (quickToggle === "high_potential") result = result.filter(u => u.profiles >= 5);
    result.sort((a, b) => {
      let aV: any, bV: any;
      switch (csSortField) {
        case "health_score": aV = a.health.score; bV = b.health.score; break;
        case "days_inactive": aV = a.days_inactive ?? 9999; bV = b.days_inactive ?? 9999; break;
        case "profiles": aV = a.profiles; bV = b.profiles; break;
        default: aV = (a as any)[csSortField] || ""; bV = (b as any)[csSortField] || ""; if (typeof aV === "string") { aV = aV.toLowerCase(); bV = (bV as string).toLowerCase(); }
      }
      if (aV < bV) return csSortDir === "asc" ? -1 : 1; if (aV > bV) return csSortDir === "asc" ? 1 : -1; return 0;
    });
    return result;
  }, [users, search, countryFilter, versionFilter, statusFilter, lifecycleFilter, quickToggle, csSortField, csSortDir]);

  const csTotalPages = Math.ceil(csFiltered.length / PAGE_SIZE);
  const csPaged = useMemo(() => csFiltered.slice((csPage - 1) * PAGE_SIZE, csPage * PAGE_SIZE), [csFiltered, csPage]);
  useEffect(() => { setCsPage(1); }, [search, countryFilter, versionFilter, statusFilter, lifecycleFilter, quickToggle]);

  // ── COHORT — filtered, sorted, paged ──
  const cohortFiltered = useMemo(() => {
    let result = [...users];
    if (search) { const q = search.toLowerCase(); result = result.filter(u => u.salon_name.toLowerCase().includes(q) || u.phone_number.includes(q) || (u.city || "").toLowerCase().includes(q)); }
    if (countryFilter !== "all") result = result.filter(u => u.normalized_country === countryFilter);
    if (cohortBucket !== "all") result = result.filter(u => u.cohort_bucket === cohortBucket);
    result.sort((a, b) => {
      let aV: any, bV: any;
      switch (cohortSortField) {
        case "days_inactive": aV = a.days_inactive ?? 99999; bV = b.days_inactive ?? 99999; break;
        case "profiles": aV = a.profiles; bV = b.profiles; break;
        // sort by numeric tenure so newest joiners (smallest value) sort first with "asc"
        case "first_mix_date": aV = a.tenure_days ?? 99999; bV = b.tenure_days ?? 99999; break;
        case "total_mixes": aV = getMixStats(a.phone_number)?.totalMixes ?? -1; bV = getMixStats(b.phone_number)?.totalMixes ?? -1; break;
        case "version": aV = a.version || ""; bV = b.version || ""; break;
        default: aV = ((a as any)[cohortSortField] || "").toString().toLowerCase(); bV = ((b as any)[cohortSortField] || "").toString().toLowerCase(); break;
      }
      if (aV < bV) return cohortSortDir === "asc" ? -1 : 1; if (aV > bV) return cohortSortDir === "asc" ? 1 : -1; return 0;
    });
    return result;
  }, [users, search, countryFilter, cohortBucket, cohortSortField, cohortSortDir]);

  const cohortTotalPages = Math.ceil(cohortFiltered.length / PAGE_SIZE);
  const cohortPaged = useMemo(() => cohortFiltered.slice((cohortPage - 1) * PAGE_SIZE, cohortPage * PAGE_SIZE), [cohortFiltered, cohortPage]);
  useEffect(() => { setCohortPage(1); }, [search, countryFilter, cohortBucket]);

  // ── Sort handlers ──
  const handleOvSort = (field: OverviewSortField) => {
    if (ovSortField === field) setOvSortDir(d => d === "asc" ? "desc" : "asc");
    else {
      setOvSortField(field);
      setOvSortDir(field === "first_mix_date" || field === "last_mix_date" ? "asc" : "desc");
    }
  };
  const handleCsSort = (field: CSSortField) => {
    if (csSortField === field) setCsSortDir(d => d === "asc" ? "desc" : "asc");
    else { setCsSortField(field); setCsSortDir(field === "health_score" || field === "days_inactive" ? "asc" : "desc"); }
  };
  const handleCohortSort = (field: CohortSortField) => {
    if (cohortSortField === field) setCohortSortDir(d => d === "asc" ? "desc" : "asc");
    else { setCohortSortField(field); setCohortSortDir(field === "days_inactive" || field === "first_mix_date" ? "asc" : "desc"); }
    setCohortPage(1);
  };

  function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
    if (!active) return <ArrowUpDown className="w-3 h-3 opacity-20" />;
    return dir === "asc" ? <ArrowUp className="w-3 h-3 text-indigo-400" /> : <ArrowDown className="w-3 h-3 text-indigo-400" />;
  }

  const HealthBadge = ({ score, status }: { score: number; status: string }) => {
    const cfg = status === "healthy" ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/20" : status === "at_risk" ? "bg-amber-500/15 text-amber-500 border-amber-500/20" : "bg-red-500/15 text-red-500 border-red-500/20";
    return <span className={`inline-flex items-center justify-center w-10 h-7 rounded-lg text-xs font-bold border ${cfg}`}>{score}</span>;
  };

  // ── Freshness label ──
  function freshnessLabel(): string {
    if (!loadedAt) return "Loading…";
    const diffMs = Date.now() - loadedAt.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "Updated just now";
    if (mins < 60) return `Updated ${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `Updated ${hrs}h ago`;
    return `Updated ${Math.floor(hrs / 24)}d ago`;
  }

  // ── LOADING & ERROR ──
  if (loading) return (
    <div className={`min-h-[100dvh] flex items-center justify-center ${at.page}`}>
      <div className="flex flex-col items-center gap-4">
        <div className={`w-12 h-12 border-4 rounded-full animate-spin ${at.spinner}`} />
        <p className={`text-sm ${at.textMuted}`}>Loading dashboard…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className={`min-h-[100dvh] flex items-center justify-center ${at.page}`}>
      <div className="text-center max-w-md px-4">
        <ShieldAlert className="w-10 h-10 text-red-400/60 mx-auto mb-3" />
        <p className="text-red-400 mb-4 text-sm">{error}</p>
        <button onClick={fetchData} className="px-5 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition text-sm">Retry</button>
      </div>
    </div>
  );

  return (
    <div className={`min-h-[100dvh] ${at.page}`}>
      {/* ── Sticky Top Bar ── */}
      <div className={`sticky top-0 z-40 ${at.sticky} backdrop-blur-xl border-b ${at.stickyBorder}`}>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/" className={`flex-shrink-0 transition ${at.textFaint} hover:${at.textMuted}`}><ChevronLeft className="w-5 h-5" /></Link>
            <div className="min-w-0">
              <h1 className={`text-lg font-semibold flex items-center gap-2 ${at.textPrimary}`}>
                <Layers className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                Admin Dashboard
              </h1>
              <p className={`text-xs ${at.textFaint}`}>Salon Users Management</p>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className={`flex items-center gap-1 ${at.tabWrap} rounded-xl p-1 border overflow-x-auto`}>
            {([
              { id: "cohorts",  label: "Usage Cohorts", icon: Users },
              { id: "overview", label: "Overview",      icon: LayoutDashboard },
              { id: "success",  label: "CS",            icon: Heart },
              { id: "billing",  label: "Billing",         icon: TrendingDown },
            ] as { id: ActiveTab; label: string; icon: any }[]).map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${activeTab === id ? at.tabActive : at.tabInactive}`}>
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-xs hidden sm:block ${at.textFaint}`}>{users.length} users</span>
            <button onClick={toggleTheme}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${at.toggleBtn}`}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}>
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
            <button onClick={fetchData} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition ${at.filterInactive}`}>
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ── Freshness banner ── */}
        <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-xs ${at.freshnessBg}`}>
          <span className={`inline-block w-2 h-2 rounded-full ${at.freshnessDot} animate-pulse`} />
          <span className={at.textSec}>{freshnessLabel()} · {users.length} users loaded</span>
          <span className={`ml-auto ${at.textFaint}`}>
            {loadedAt ? `${loadedAt.toLocaleDateString()} ${loadedAt.toLocaleTimeString()}` : ""}
          </span>
        </div>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/*  TAB: USAGE COHORTS (primary/central)                        */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === "cohorts" && (
          <>
            {/* ── Cohort Summary Cards ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {(Object.keys(BUCKET_CONFIG) as UsageBucket[]).map((bucket) => {
                const cfg = BUCKET_CONFIG[bucket];
                const count = cohortCounts[bucket];
                const isActive = cohortBucket === bucket;
                const color = isDark ? cfg.colorDark : cfg.colorLight;
                const bg = isDark ? cfg.bgDark : cfg.bgLight;
                return (
                  <button key={bucket} onClick={() => setCohortBucket(isActive ? "all" : bucket)}
                    className={`relative overflow-hidden rounded-2xl border p-3 text-left transition-all group ${
                      isActive ? `${bg} ring-2 ${cfg.ring}` : `${at.card} ${at.cardHover}`
                    }`}>
                    <p className={`text-2xl font-bold tracking-tight ${isActive ? color : at.textPrimary}`}>{count}</p>
                    <p className={`text-[11px] font-medium mt-0.5 ${isActive ? color : at.textMuted}`}>{cfg.label}</p>
                    <p className={`text-[10px] mt-0.5 ${at.textFaint}`}>{cfg.sublabel}</p>
                  </button>
                );
              })}
            </div>

            {/* ── Search & Country Filter ── */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${at.textFaint}`} />
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, phone, city…"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-1 transition ${at.input}`} />
                  {search && <button onClick={() => setSearch("")} className={`absolute right-3 top-1/2 -translate-y-1/2 ${at.textFaint}`}><X className="w-4 h-4" /></button>}
                </div>
                <select value={countryFilter} onChange={e => setCountryFilter(e.target.value)}
                  className={`px-3 py-2.5 rounded-xl border text-sm focus:outline-none appearance-none cursor-pointer ${at.select}`}>
                  <option value="all" style={{ background: at.selectBg }}>All Countries</option>
                  {allCountries.map(c => <option key={c} value={c} style={{ background: at.selectBg }}>{getFlag(c)} {c}</option>)}
                </select>
                {isTableEditing ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={cancelTableEdits}
                      className={`px-4 py-2.5 rounded-xl border text-sm transition ${at.filterInactive}`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={publishTableEdits}
                      disabled={isPublishing}
                      className="px-4 py-2.5 rounded-xl border border-indigo-500 bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-400 disabled:opacity-50 transition"
                    >
                      {isPublishing ? "Publishing..." : "Publish Changes"}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={startEditingTable}
                    className={`px-4 py-2.5 rounded-xl border text-sm transition ${at.filterInactive}`}
                  >
                    Edit Links
                  </button>
                )}
                {!cohortViewIsDefault && (
                  <button
                    onClick={resetCohortView}
                    className={`px-4 py-2.5 rounded-xl border text-sm transition ${at.filterInactive}`}
                  >
                    Reset All Filters
                  </button>
                )}
              </div>
              {cohortBucket !== "all" && (
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${at.textMuted}`}>Filtering:</span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${isDark ? BUCKET_CONFIG[cohortBucket].bgDark : BUCKET_CONFIG[cohortBucket].bgLight} ${isDark ? BUCKET_CONFIG[cohortBucket].colorDark : BUCKET_CONFIG[cohortBucket].colorLight}`}>
                    {BUCKET_CONFIG[cohortBucket].label}
                    <button onClick={() => setCohortBucket("all")}><X className="w-3 h-3 ml-1" /></button>
                  </span>
                </div>
              )}
              <p className={`text-xs ${at.textFaint}`}>
                Showing <span className={`font-medium ${at.textSec}`}>{cohortFiltered.length}</span> of {users.length} users
              </p>
              {tableSavedAt && (
                <p className="text-xs text-emerald-500">Changes published</p>
              )}
            </div>

            {/* ── Cohort Table ── */}
            <div className={`rounded-2xl border overflow-hidden ${at.card}`}>
              <div className="overflow-x-auto overflow-y-visible" onWheel={handleTableWheel}>
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`border-b ${at.border}`}>
                      {([
                        { field: "salon_name" as CohortSortField, label: "Salon",         w: "min-w-[200px]" },
                        { field: "state" as CohortSortField,      label: "Country",       w: "min-w-[110px]" },
                        { field: "city" as CohortSortField,        label: "City",          w: "min-w-[100px]" },
                        { field: "days_inactive" as CohortSortField, label: "Last Mix",   w: "min-w-[110px]" },
                        { field: "first_mix_date" as CohortSortField, label: "First Mix", w: "min-w-[110px]" },
                        { field: "profiles" as CohortSortField,    label: "Profiles",     w: "min-w-[80px]" },
                        { field: "total_mixes" as CohortSortField,  label: "Total Mixes", w: "min-w-[100px]" },
                        { field: "version" as CohortSortField,      label: "Version",     w: "min-w-[80px]" },
                      ]).map(({ field, label, w }) => (
                        <th key={field} onClick={() => handleCohortSort(field)}
                          className={`${w} px-4 py-3 text-left text-[11px] uppercase tracking-wider font-medium cursor-pointer transition select-none ${at.textFaint}`}>
                          <span className="flex items-center gap-1.5">{label} <SortIcon active={cohortSortField === field} dir={cohortSortDir} /></span>
                        </th>
                      ))}
                      <th className={`min-w-[130px] px-4 py-3 text-left text-[11px] uppercase tracking-wider font-medium ${at.textFaint}`}>Summit</th>
                      <th className={`min-w-[130px] px-4 py-3 text-left text-[11px] uppercase tracking-wider font-medium ${at.textFaint}`}>Instagram</th>
                      <th className={`min-w-[90px] px-4 py-3 text-left text-[11px] uppercase tracking-wider font-medium ${at.textFaint}`}>Cohort</th>
                    </tr>
                  </thead>
                  <tbody className={`${at.rowDivide} divide-y`}>
                    {cohortPaged.map(user => {
                      const bucket = user.cohort_bucket;
                      const bcfg = BUCKET_CONFIG[bucket];
                      const bucketColor = isDark ? bcfg.colorDark : bcfg.colorLight;
                      const bucketBg = isDark ? bcfg.bgDark : bcfg.bgLight;
                      const mx = getMixStats(user.phone_number);
                      const editSummit = pendingEdits[user.id]?.summit ?? user.summit ?? "";
                      const editInstagram = pendingEdits[user.id]?.instagram ?? user.instagram ?? "";
                      const isEditing = isTableEditing;
                      const summitHref = getExternalHref(user.summit ?? "", "summit");
                      const instagramHref = getExternalHref(user.instagram ?? "", "instagram");
                      return (
                        <tr key={user.id} className={`transition ${at.rowHover}`}>
                          <td className="px-4 py-3">
                            <span className={`font-medium block truncate max-w-[210px] ${at.text90}`}>{user.salon_name}</span>
                            <span className={`text-[11px] font-mono ${at.textFaint}`}>{user.phone_number}</span>
                          </td>
                          <td className={`px-4 py-3 text-xs ${at.textSec}`}>
                            {user.normalized_country
                              ? <span className="flex items-center gap-1.5"><span>{getFlag(user.normalized_country)}</span>{user.normalized_country}</span>
                              : <span className={at.textDim}>--</span>}
                          </td>
                          <td className={`px-4 py-3 text-xs ${at.textSec}`}>{user.city || <span className={at.textDim}>--</span>}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-medium ${
                              user.days_inactive === null ? at.textFaint
                              : user.days_inactive <= 14 ? "text-emerald-500"
                              : user.days_inactive <= 30 ? "text-blue-500"
                              : user.days_inactive <= 90 ? "text-sky-500"
                              : user.days_inactive <= 180 ? "text-amber-500"
                              : user.days_inactive <= 365 ? "text-orange-500"
                              : "text-red-500"
                            }`}>
                              {user.last_mix_date === "-" || !user.last_mix_date ? "Never" : user.last_mix_date}
                            </span>
                          </td>
                          <td className={`px-4 py-3 text-xs ${at.textFaint}`}>
                            {user.first_mix_date === "-" || !user.first_mix_date ? <span className={at.textDim}>--</span> : user.first_mix_date}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${
                              user.profiles === 0 ? (isDark ? "bg-white/5 text-white/40" : "bg-gray-100 text-gray-400")
                              : user.profiles >= 5 ? "bg-indigo-500/20 text-indigo-500"
                              : isDark ? "bg-white/[0.06] text-white/60" : "bg-gray-100 text-gray-600"
                            }`}>{user.profiles}</span>
                          </td>
                          {/* Total Mixes from market intelligence */}
                          <td className="px-4 py-3">
                            {mx ? (
                              <div>
                                <span className={`text-sm font-semibold ${at.textPrimary}`}>{mx.totalMixes.toLocaleString()}</span>
                                <span className={`block text-[10px] ${at.textFaint}`}>
                                  {mx.monthsActive > 0
                                    ? `~${Math.round(mx.totalMixes / mx.monthsActive).toLocaleString()}/mo`
                                    : "—"}
                                  {" · "}{mx.monthsActive}mo
                                </span>
                              </div>
                            ) : (
                              <span className={`text-xs ${at.textDim}`}>--</span>
                            )}
                          </td>
                          {/* App version */}
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-medium ${
                              user.version === "1021" || user.version === "1022" ? "bg-emerald-500/10 text-emerald-600"
                              : user.version >= "1020" ? "bg-blue-500/10 text-blue-600"
                              : user.version >= "1017" ? "bg-amber-500/10 text-amber-600"
                              : isDark ? "bg-white/5 text-white/50" : "bg-gray-100 text-gray-500"
                            }`}>v{user.version}</span>
                          </td>
                          {/* Summit */}
                          <td className="px-3 py-2.5">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editSummit}
                                onChange={e => handleEditChange(user.id, "summit", e.target.value)}
                                placeholder="Summit…"
                                className={`w-full text-xs rounded-lg px-2 py-1.5 border transition focus:outline-none focus:ring-1 focus:ring-indigo-400/50 ${
                                  isDark
                                    ? "bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 focus:border-indigo-500/40"
                                    : "bg-black/[0.03] border-black/[0.08] text-[#1A1A1A] placeholder:text-[#BBBBBB] focus:border-indigo-400/60"
                                }`}
                              />
                            ) : summitHref ? (
                              <a
                                href={summitHref}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-indigo-500 hover:text-indigo-400 underline underline-offset-2 break-all"
                              >
                                {user.summit}
                              </a>
                            ) : (
                              <span className={`text-xs ${at.textDim}`}>--</span>
                            )}
                          </td>
                          {/* Instagram */}
                          <td className="px-3 py-2.5">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editInstagram}
                                onChange={e => handleEditChange(user.id, "instagram", e.target.value)}
                                placeholder="@handle…"
                                className={`w-full text-xs rounded-lg px-2 py-1.5 border transition focus:outline-none focus:ring-1 focus:ring-pink-400/50 ${
                                  isDark
                                    ? "bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 focus:border-pink-500/40"
                                    : "bg-black/[0.03] border-black/[0.08] text-[#1A1A1A] placeholder:text-[#BBBBBB] focus:border-pink-400/60"
                                }`}
                              />
                            ) : instagramHref ? (
                              <a
                                href={instagramHref}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-pink-500 hover:text-pink-400 underline underline-offset-2 break-all"
                              >
                                {user.instagram}
                              </a>
                            ) : (
                              <span className={`text-xs ${at.textDim}`}>--</span>
                            )}
                          </td>
                          {/* Cohort badge */}
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-medium border ${bucketBg} ${bucketColor}`}>
                              {bcfg.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {cohortPaged.length === 0 && (
                      <tr><td colSpan={11} className={`py-10 text-center text-sm ${at.textFaint}`}>No users match the current filters.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination page={cohortPage} totalPages={cohortTotalPages} setPage={setCohortPage} isDark={isDark} />
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/*  TAB: OVERVIEW                                               */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === "overview" && (
          <>
            {/* ── Overview KPI Cards ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: "Total Users",    value: stats?.total_users || "0",         icon: Users,       color: "from-indigo-500 to-purple-600" },
                { label: "Total Profiles", value: stats?.total_profiles || "0",      icon: Layers,      color: "from-cyan-500 to-blue-600" },
                { label: "Active Users",   value: stats?.active_users || "0",        icon: Activity,    color: "from-emerald-500 to-green-600" },
                { label: "Countries",      value: String(allCountries.length),       icon: Globe,       color: "from-amber-500 to-orange-600" },
                { label: "Cities",         value: stats?.city_count || "0",          icon: MapPin,      color: "from-pink-500 to-rose-600" },
                { label: "Latest Version", value: stats?.latest_version_count || "0",icon: Smartphone,  color: "from-violet-500 to-fuchsia-600" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className={`relative overflow-hidden rounded-2xl border p-4 ${at.card} ${at.cardHover} transition group`}>
                  <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full bg-gradient-to-br ${color} opacity-10 group-hover:opacity-20 transition blur-xl`} />
                  <Icon className={`w-4 h-4 mb-2 ${at.textFaint}`} />
                  <p className={`text-2xl font-bold tracking-tight ${at.textPrimary}`}>{Number(value).toLocaleString()}</p>
                  <p className={`text-[11px] mt-0.5 ${at.textMuted}`}>{label}</p>
                </div>
              ))}
            </div>

            {/* ── Charts Row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <CountryPieChart data={countryChartData} countryFilter={countryFilter} setCountryFilter={setCountryFilter} isDark={isDark} />
              <VersionBarChart data={byVersion} allVersions={allVersions} versionFilter={versionFilter} setVersionFilter={setVersionFilter} isDark={isDark} />
            </div>

            {/* ── Search & Filters ── */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${at.textFaint}`} />
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, phone, city…"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-1 transition ${at.input}`} />
                  {search && <button onClick={() => setSearch("")} className={`absolute right-3 top-1/2 -translate-y-1/2 ${at.textFaint}`}><X className="w-4 h-4" /></button>}
                </div>
                <button onClick={() => setShowFilters(f => !f)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition ${
                    showFilters || countryFilter !== "all" || versionFilter !== "all" || profileFilter !== "all" ? at.filterActive : at.filterInactive
                  }`}>
                  <Filter className="w-4 h-4" /> Filters
                  {(countryFilter !== "all" || versionFilter !== "all" || profileFilter !== "all") && (
                    <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-[10px] flex items-center justify-center font-bold">
                      {[countryFilter !== "all", versionFilter !== "all", profileFilter !== "all"].filter(Boolean).length}
                    </span>
                  )}
                </button>
              </div>
              {showFilters && (
                <div className={`flex flex-wrap gap-3 p-4 rounded-xl border ${at.filterPanel}`}>
                  <div className="space-y-1">
                    <label className={`text-[10px] uppercase tracking-wider font-medium ${at.textFaint}`}>Country</label>
                    <select value={countryFilter} onChange={e => setCountryFilter(e.target.value)}
                      className={`block w-44 px-3 py-2 rounded-lg border text-sm focus:outline-none appearance-none cursor-pointer ${at.select}`}>
                      <option value="all" style={{ background: at.selectBg }}>All Countries</option>
                      {allCountries.map(c => <option key={c} value={c} style={{ background: at.selectBg }}>{getFlag(c)} {c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className={`text-[10px] uppercase tracking-wider font-medium ${at.textFaint}`}>Version</label>
                    <select value={versionFilter} onChange={e => setVersionFilter(e.target.value)}
                      className={`block w-36 px-3 py-2 rounded-lg border text-sm focus:outline-none appearance-none cursor-pointer ${at.select}`}>
                      <option value="all" style={{ background: at.selectBg }}>All Versions</option>
                      {allVersions.map(v => <option key={v} value={v} style={{ background: at.selectBg }}>v{v}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className={`text-[10px] uppercase tracking-wider font-medium ${at.textFaint}`}>Profiles</label>
                    <select value={profileFilter} onChange={e => setProfileFilter(e.target.value)}
                      className={`block w-40 px-3 py-2 rounded-lg border text-sm focus:outline-none appearance-none cursor-pointer ${at.select}`}>
                      <option value="all" style={{ background: at.selectBg }}>All Profiles</option>
                      <option value="active" style={{ background: at.selectBg }}>Has Profiles (&gt;0)</option>
                      <option value="multi" style={{ background: at.selectBg }}>Multi-Profile (&gt;1)</option>
                      <option value="zero" style={{ background: at.selectBg }}>Zero Profiles</option>
                    </select>
                  </div>
                  {(countryFilter !== "all" || versionFilter !== "all" || profileFilter !== "all") && (
                    <div className="flex items-end">
                      <button onClick={() => { setCountryFilter("all"); setVersionFilter("all"); setProfileFilter("all"); }} className="px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500/10 transition">Clear All</button>
                    </div>
                  )}
                </div>
              )}
              <div className="flex items-center justify-between">
                <p className={`text-xs ${at.textFaint}`}>
                  Showing <span className={`font-medium ${at.textSec}`}>{ovFiltered.length}</span> of {users.length} users
                  {countryFilter !== "all" && <span className="text-indigo-500 ml-1">in {countryFilter}</span>}
                </p>
              </div>
            </div>

            {/* ── Overview Table ── */}
            <div className={`rounded-2xl border overflow-hidden ${at.card}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`border-b ${at.border}`}>
                      {([
                        { field: "salon_name" as OverviewSortField, label: "Salon Name",  w: "min-w-[200px]" },
                        { field: "phone_number" as OverviewSortField, label: "Phone",     w: "min-w-[130px]" },
                        { field: "profiles" as OverviewSortField, label: "Profiles",      w: "min-w-[80px]" },
                        { field: "first_mix_date" as OverviewSortField, label: "First Mix", w: "min-w-[110px]" },
                        { field: "last_mix_date" as OverviewSortField, label: "Last Mix", w: "min-w-[110px]" },
                        { field: "version" as OverviewSortField, label: "Version",        w: "min-w-[80px]" },
                        { field: "state" as OverviewSortField, label: "Country",          w: "min-w-[120px]" },
                        { field: "city" as OverviewSortField, label: "City",              w: "min-w-[120px]" },
                      ]).map(({ field, label, w }) => (
                        <th key={field} onClick={() => handleOvSort(field)}
                          className={`${w} px-4 py-3 text-left text-[11px] uppercase tracking-wider font-medium cursor-pointer transition select-none ${at.textFaint}`}>
                          <span className="flex items-center gap-1.5">{label} <SortIcon active={ovSortField === field} dir={ovSortDir} /></span>
                        </th>
                      ))}
                      <th className={`min-w-[110px] px-4 py-3 text-left text-[11px] uppercase tracking-wider font-medium ${at.textFaint}`}>Summit</th>
                      <th className={`min-w-[110px] px-4 py-3 text-left text-[11px] uppercase tracking-wider font-medium ${at.textFaint}`}>Instagram</th>
                    </tr>
                  </thead>
                  <tbody className={`${at.rowDivide} divide-y`}>
                    {ovPaged.map(user => (
                      <tr key={user.id} className={`transition group ${at.rowHover}`}>
                        <td className="px-4 py-3"><span className={`font-medium group-hover:${at.textPrimary} transition ${at.text90}`}>{user.salon_name}</span></td>
                        <td className={`px-4 py-3 font-mono text-xs ${at.textFaint}`}>{user.phone_number}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${
                            user.profiles === 0 ? (isDark ? "bg-white/5 text-white/50" : "bg-gray-100 text-gray-400")
                            : user.profiles >= 5 ? "bg-indigo-500/20 text-indigo-500"
                            : isDark ? "bg-white/[0.06] text-white/60" : "bg-gray-100 text-gray-600"
                          }`}>{user.profiles}</span>
                        </td>
                        <td className={`px-4 py-3 text-xs ${at.textMuted}`}>{user.first_mix_date === "-" ? <span className={at.textDim}>--</span> : user.first_mix_date}</td>
                        <td className={`px-4 py-3 text-xs ${at.textMuted}`}>
                          {user.last_mix_date === "-" ? <span className={at.textDim}>--</span> : (
                            <span className={
                              user.days_inactive !== null && user.days_inactive <= 1 ? "text-emerald-500"
                              : user.days_inactive !== null && user.days_inactive <= 7 ? "text-blue-500"
                              : user.days_inactive !== null && user.days_inactive <= 14 ? "text-amber-500"
                              : ""
                            }>{user.last_mix_date}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-medium ${
                            user.version === "1021" || user.version === "1022" ? "bg-emerald-500/10 text-emerald-600"
                            : user.version >= "1020" ? "bg-blue-500/10 text-blue-600"
                            : user.version >= "1017" ? "bg-amber-500/10 text-amber-600"
                            : isDark ? "bg-white/5 text-white/50" : "bg-gray-100 text-gray-500"
                          }`}>v{user.version}</span>
                        </td>
                        <td className={`px-4 py-3 text-xs ${at.textMuted}`}>
                          {user.normalized_country
                            ? <span className="flex items-center gap-1.5"><span>{getFlag(user.normalized_country)}</span>{user.normalized_country}</span>
                            : <span className={at.textDim}>--</span>}
                        </td>
                        <td className={`px-4 py-3 text-xs ${at.textMuted}`}>{user.city || <span className={at.textDim}>--</span>}</td>
                        <td className={`px-4 py-3 text-xs ${at.textFaint}`}>
                          {user.summit ? <span className="text-indigo-500">{user.summit}</span> : <span className={at.textDim}>--</span>}
                        </td>
                        <td className={`px-4 py-3 text-xs ${at.textFaint}`}>
                          {user.instagram ? <span className="text-pink-500">{user.instagram}</span> : <span className={at.textDim}>--</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={ovPage} totalPages={ovTotalPages} setPage={setOvPage} isDark={isDark} />
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/*  TAB: CUSTOMER SUCCESS                                       */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === "success" && (
          <>
            {/* ── Status KPI Command Bar ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {([
                { key: "active" as StatusFilter,   label: "Active This Week", value: kpis.active,   icon: Activity,    gradient: "from-emerald-500 to-green-600",  ring: "ring-emerald-500/30" },
                { key: "at_risk" as StatusFilter,  label: "At Risk (7–14d)",  value: kpis.atRisk,   icon: AlertTriangle,gradient: "from-amber-500 to-yellow-600",  ring: "ring-amber-500/30" },
                { key: "critical" as StatusFilter, label: "Critical (14d+)",  value: kpis.critical, icon: ShieldAlert, gradient: "from-red-500 to-rose-600",        ring: "ring-red-500/30" },
                { key: "recovered" as StatusFilter,label: "Recovered",        value: kpis.recovered,icon: UserCheck,   gradient: "from-blue-500 to-cyan-600",       ring: "ring-blue-500/30" },
                { key: "churned" as StatusFilter,  label: "Churned (30d+)",   value: kpis.churned,  icon: TrendingDown,gradient: "from-gray-500 to-slate-600",      ring: "ring-gray-500/30" },
              ]).map(({ key, label, value, icon: Icon, gradient, ring }) => (
                <button key={key} onClick={() => setStatusFilter(statusFilter === key ? "all" : key)}
                  className={`relative overflow-hidden rounded-2xl border p-4 text-left transition-all group ${
                    statusFilter === key ? `${at.card} ring-2 ${ring}` : `${at.card} ${at.cardHover}`
                  }`}>
                  <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 transition blur-xl`} />
                  <Icon className={`w-4 h-4 mb-2 ${at.textFaint}`} />
                  <p className={`text-2xl font-bold tracking-tight ${at.textPrimary}`}>{value}</p>
                  <p className={`text-[11px] mt-0.5 ${at.textMuted}`}>{label}</p>
                </button>
              ))}
            </div>

            {/* ── Quick Toggles ── */}
            <div className="flex flex-wrap items-center gap-2">
              {([
                { key: "at_risk" as const, label: "Only At Risk", icon: AlertTriangle },
                { key: "new" as const, label: "Only New", icon: Star },
                { key: "high_potential" as const, label: "High Potential (5+)", icon: Zap },
              ]).map(({ key, label, icon: Icon }) => (
                <button key={key} onClick={() => setQuickToggle(quickToggle === key ? "" : key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition border ${quickToggle === key ? at.tagActive : at.tagInactive}`}>
                  <Icon className="w-3.5 h-3.5" /> {label}
                </button>
              ))}
              {(statusFilter !== "all" || quickToggle) && (
                <button onClick={() => { setStatusFilter("all"); setQuickToggle(""); }} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs text-red-500 hover:bg-red-500/10 transition">
                  <X className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>

            {/* ── Attention Today ── */}
            {attentionList.length > 0 && (
              <div className={`rounded-2xl border overflow-hidden ${at.card}`}>
                <div className={`px-5 py-4 border-b ${at.border} flex items-center justify-between`}>
                  <h3 className={`text-sm font-medium flex items-center gap-2 ${at.textSec}`}>
                    <Eye className="w-4 h-4 text-amber-400" /> Attention Today
                    <span className={`font-normal ${at.textFaint}`}>Top 10 to act on</span>
                  </h3>
                </div>
                <div className={`${at.rowDivide} divide-y`}>
                  {attentionList.map((u, i) => {
                    const ac = ACTION_CONFIG[u.cs_action]; const AcIcon = ac.icon;
                    return (
                      <div key={u.id} className={`flex items-center gap-4 px-5 py-3 transition ${at.rowHover}`}>
                        <span className={`text-xs font-mono w-5 text-right ${at.textDim}`}>{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${at.text90}`}>{u.salon_name}</p>
                          <p className={`text-[11px] truncate ${at.textFaint}`}>{u.normalized_country ? `${getFlag(u.normalized_country)} ${u.normalized_country}` : ""}{u.city ? ` / ${u.city}` : ""}</p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className={`text-xs ${at.textFaint}`}>{u.days_inactive !== null ? `${u.days_inactive}d inactive` : "Never mixed"}</span>
                          <HealthBadge score={u.health.score} status={u.health.status} />
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium ${ac.bg} ${ac.color} transition`}><AcIcon className="w-3 h-3" /> {ac.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Charts ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <CountryPieChart data={countryChartData} countryFilter={countryFilter} setCountryFilter={setCountryFilter} isDark={isDark} />
              <VersionBarChart data={byVersion} allVersions={allVersions} versionFilter={versionFilter} setVersionFilter={setVersionFilter} isDark={isDark} />
            </div>

            {/* ── CS Search & Filters ── */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${at.textFaint}`} />
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, phone, city…"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-1 transition ${at.input}`} />
                  {search && <button onClick={() => setSearch("")} className={`absolute right-3 top-1/2 -translate-y-1/2 ${at.textFaint}`}><X className="w-4 h-4" /></button>}
                </div>
                <button onClick={() => setShowFilters(f => !f)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition ${showFilters ? at.filterActive : at.filterInactive}`}>
                  <Filter className="w-4 h-4" /> Filters
                </button>
              </div>
              {showFilters && (
                <div className={`flex flex-wrap gap-3 p-4 rounded-xl border ${at.filterPanel}`}>
                  <div className="space-y-1">
                    <label className={`text-[10px] uppercase tracking-wider font-medium ${at.textFaint}`}>Country</label>
                    <select value={countryFilter} onChange={e => setCountryFilter(e.target.value)}
                      className={`block w-44 px-3 py-2 rounded-lg border text-sm focus:outline-none appearance-none cursor-pointer ${at.select}`}>
                      <option value="all" style={{ background: at.selectBg }}>All Countries</option>
                      {allCountries.map(c => <option key={c} value={c} style={{ background: at.selectBg }}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className={`text-[10px] uppercase tracking-wider font-medium ${at.textFaint}`}>Version</label>
                    <select value={versionFilter} onChange={e => setVersionFilter(e.target.value)}
                      className={`block w-36 px-3 py-2 rounded-lg border text-sm focus:outline-none appearance-none cursor-pointer ${at.select}`}>
                      <option value="all" style={{ background: at.selectBg }}>All Versions</option>
                      {allVersions.map(v => <option key={v} value={v} style={{ background: at.selectBg }}>v{v}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className={`text-[10px] uppercase tracking-wider font-medium ${at.textFaint}`}>Lifecycle</label>
                    <select value={lifecycleFilter} onChange={e => setLifecycleFilter(e.target.value)}
                      className={`block w-40 px-3 py-2 rounded-lg border text-sm focus:outline-none appearance-none cursor-pointer ${at.select}`}>
                      <option value="all" style={{ background: at.selectBg }}>All Stages</option>
                      {(Object.entries(LIFECYCLE_CONFIG) as [Lifecycle, typeof LIFECYCLE_CONFIG[Lifecycle]][]).map(([k, v]) => (
                        <option key={k} value={k} style={{ background: at.selectBg }}>{v.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button onClick={() => { setCountryFilter("all"); setVersionFilter("all"); setLifecycleFilter("all"); setStatusFilter("all"); setQuickToggle(""); }}
                      className="px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500/10 transition">Clear All</button>
                  </div>
                </div>
              )}
              <p className={`text-xs ${at.textFaint}`}>Showing <span className={`font-medium ${at.textSec}`}>{csFiltered.length}</span> of {users.length} customers</p>
            </div>

            {/* ── CS Customer Table ── */}
            <div className={`rounded-2xl border overflow-hidden ${at.card}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`border-b ${at.border}`}>
                      {([
                        { field: "salon_name" as CSSortField, label: "Salon",    w: "min-w-[180px]" },
                        { field: "profiles" as CSSortField,   label: "Profiles", w: "min-w-[70px]" },
                        { field: "days_inactive" as CSSortField, label: "Inactive", w: "min-w-[80px]" },
                        { field: "health_score" as CSSortField, label: "Health",  w: "min-w-[70px]" },
                      ]).map(({ field, label, w }) => (
                        <th key={field} onClick={() => handleCsSort(field)}
                          className={`${w} px-4 py-3 text-left text-[11px] uppercase tracking-wider font-medium cursor-pointer transition select-none ${at.textFaint}`}>
                          <span className="flex items-center gap-1.5">{label} <SortIcon active={csSortField === field} dir={csSortDir} /></span>
                        </th>
                      ))}
                      <th className={`min-w-[90px] px-4 py-3 text-left text-[11px] uppercase tracking-wider font-medium ${at.textFaint}`}>Lifecycle</th>
                      <th className={`min-w-[120px] px-4 py-3 text-left text-[11px] uppercase tracking-wider font-medium ${at.textFaint}`}>Risk Tags</th>
                      <th className={`min-w-[100px] px-4 py-3 text-left text-[11px] uppercase tracking-wider font-medium cursor-pointer select-none ${at.textFaint}`} onClick={() => handleCsSort("state")}>
                        <span className="flex items-center gap-1.5">Country <SortIcon active={csSortField === "state"} dir={csSortDir} /></span>
                      </th>
                      <th className={`min-w-[140px] px-4 py-3 text-left text-[11px] uppercase tracking-wider font-medium ${at.textFaint}`}>Action</th>
                      <th className="w-10 px-2 py-3" />
                    </tr>
                  </thead>
                  <tbody className={`${at.rowDivide} divide-y`}>
                    {csPaged.map(user => {
                      const ac = ACTION_CONFIG[user.cs_action]; const AcIcon = ac.icon;
                      const lc = LIFECYCLE_CONFIG[user.lifecycle];
                      const isExpanded = expandedId === user.id;
                      return (
                        <React.Fragment key={user.id}>
                          <tr className={`transition group ${at.rowHover}`}>
                            <td className="px-4 py-3">
                              <span className={`font-medium block truncate max-w-[200px] ${at.text90}`}>{user.salon_name}</span>
                              <span className={`text-[11px] font-mono ${at.textFaint}`}>{user.phone_number}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${
                                user.profiles === 0 ? (isDark ? "bg-white/5 text-white/50" : "bg-gray-100 text-gray-400")
                                : user.profiles >= 5 ? "bg-indigo-500/20 text-indigo-500"
                                : isDark ? "bg-white/[0.06] text-white/60" : "bg-gray-100 text-gray-600"
                              }`}>{user.profiles}</span>
                            </td>
                            <td className="px-4 py-3">
                              {user.days_inactive !== null ? (
                                <span className={`text-xs font-medium ${
                                  user.days_inactive <= 1 ? "text-emerald-500"
                                  : user.days_inactive <= 7 ? "text-emerald-500/70"
                                  : user.days_inactive <= 14 ? "text-amber-500"
                                  : user.days_inactive <= 30 ? "text-red-500/80"
                                  : at.textFaint
                                }`}>{user.days_inactive}d</span>
                              ) : <span className={`text-xs ${at.textDim}`}>Never</span>}
                            </td>
                            <td className="px-4 py-3"><HealthBadge score={user.health.score} status={user.health.status} /></td>
                            <td className="px-4 py-3"><span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-medium border ${lc.bg} ${lc.color}`}>{lc.label}</span></td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1">
                                {user.risk_tags.length > 0 ? user.risk_tags.map(t => (
                                  <span key={t} className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${RISK_TAG_CONFIG[t].color}`}>{RISK_TAG_CONFIG[t].label}</span>
                                )) : <span className={`text-[10px] ${at.textDim}`}>--</span>}
                              </div>
                            </td>
                            <td className={`px-4 py-3 text-xs ${at.textMuted}`}>
                              {user.normalized_country
                                ? <span className="flex items-center gap-1"><span>{getFlag(user.normalized_country)}</span>{user.normalized_country}</span>
                                : <span className={at.textDim}>--</span>}
                            </td>
                            <td className="px-4 py-3">
                              <button className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium ${ac.bg} ${ac.color} transition`}><AcIcon className="w-3 h-3" /> {ac.label}</button>
                            </td>
                            <td className="px-2 py-3">
                              <button onClick={() => setExpandedId(isExpanded ? null : user.id)} className={`transition ${at.textFaint}`}>
                                <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                              </button>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className={at.expandRow}>
                              <td colSpan={9} className="px-6 py-4">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                                  <div className="space-y-2">
                                    <p className={`text-[10px] uppercase tracking-wider font-medium ${at.textFaint}`}>Health Details</p>
                                    <p className={at.textMuted}>Score: <span className={`font-bold ${at.textPrimary}`}>{user.health.score}</span>/100</p>
                                    {user.health.factors.map((f, idx) => (
                                      <p key={idx} className={`${at.textMuted} flex items-center gap-1.5`}><AlertTriangle className="w-3 h-3 text-amber-400/60" /> {f}</p>
                                    ))}
                                  </div>
                                  <div className="space-y-2">
                                    <p className={`text-[10px] uppercase tracking-wider font-medium ${at.textFaint}`}>Timeline</p>
                                    <p className={at.textFaint}>First Mix: <span className={at.textSec}>{user.first_mix_date}</span></p>
                                    <p className={at.textFaint}>Last Mix: <span className={at.textSec}>{user.last_mix_date}</span></p>
                                    <p className={at.textFaint}>Tenure: <span className={at.textSec}>{user.tenure_days !== null ? `${user.tenure_days} days` : "--"}</span></p>
                                  </div>
                                  <div className="space-y-2">
                                    <p className={`text-[10px] uppercase tracking-wider font-medium ${at.textFaint}`}>Details</p>
                                    <p className={at.textFaint}>Version: <span className={at.textSec}>v{user.version}</span></p>
                                    <p className={at.textFaint}>City: <span className={at.textSec}>{user.city || "--"}</span></p>
                                    <p className={at.textFaint}>Summit: <span className="text-indigo-500">{user.summit || "--"}</span></p>
                                    <p className={at.textFaint}>Instagram: <span className="text-pink-500">{user.instagram || "--"}</span></p>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <Pagination page={csPage} totalPages={csTotalPages} setPage={setCsPage} isDark={isDark} />
            </div>

            {/* ── Insights & Systemic Patterns ── */}
            <div className={`rounded-2xl border p-5 space-y-4 ${at.card}`}>
              <h3 className={`text-sm font-medium flex items-center gap-2 ${at.textSec}`}><Layers className="w-4 h-4 text-indigo-400" />Insights &amp; Systemic Patterns</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { value: `${insights.churnedPct}%`, label: "of churned users had only 1 profile", sub: `${insights.churnedSingleProfile} of ${insights.totalChurned} churned` },
                  { value: `${insights.noFirstMixPct}%`, label: "of all users never did a first mix", sub: `${insights.noFirstMix} users with no first mix` },
                  { value: String(insights.powerUsers), label: "Power Users (5+ profiles, active)", sub: `Avg profiles: ${insights.avgProfiles}`, color: "text-emerald-500" },
                  { value: String(insights.recoveredCount), label: "Recovered customers", sub: "Retention win", color: "text-blue-500" },
                ].map(({ value, label, sub, color }) => (
                  <div key={label} className={`rounded-xl border p-4 space-y-1 ${at.subCard}`}>
                    <p className={`text-2xl font-bold ${color || at.textPrimary}`}>{value}</p>
                    <p className={`text-[11px] ${at.textMuted}`}>{label}</p>
                    <p className={`text-[10px] ${at.textFaint}`}>{sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Success Opportunities ── */}
            <div className={`rounded-2xl border p-5 space-y-3 ${at.card}`}>
              <h3 className={`text-sm font-medium flex items-center gap-2 ${at.textSec}`}><Star className="w-4 h-4 text-amber-400" />Success Opportunities</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl bg-gradient-to-br from-violet-500/5 to-indigo-500/5 border border-violet-500/10 p-4">
                  <p className="text-xs font-medium text-violet-500 mb-1">Training Opportunity</p>
                  <p className={`text-[11px] ${at.textMuted}`}>{users.filter(u => u.profiles >= 3 && u.days_inactive !== null && u.days_inactive > 14).length} users with 3+ profiles but low activity.</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-emerald-500/5 to-green-500/5 border border-emerald-500/10 p-4">
                  <p className="text-xs font-medium text-emerald-500 mb-1">Advocacy Candidates</p>
                  <p className={`text-[11px] ${at.textMuted}`}>{users.filter(u => u.lifecycle === "power_user").length} power users could be brand advocates.</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border border-blue-500/10 p-4">
                  <p className="text-xs font-medium text-blue-500 mb-1">Recovery Wins</p>
                  <p className={`text-[11px] ${at.textMuted}`}>{insights.recoveredCount} customers were recovered. Replicate the approach.</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/*  TAB: BILLING / SUMMIT CROSS-REFERENCE                      */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === "billing" && (() => {
          const payingNotUsing  = billingPayingNotUsing;
          const usingNotPaying  = billingUsingNotPaying;
          const equipmentOnly   = billingEquipmentOnly;
          const stoppedSubs     = billingStoppedSubs;

          const activeSubs = SUMMIT_DATA.summary.activeSubscribers ?? SUMMIT_DATA.summary.currentlyPaying ?? 0;
          const ltv = SUMMIT_DATA.summary.totalLTV;

          const PAYMENT_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
            subscription: { label: "Subscription", color: "text-emerald-400" },
            equipment:    { label: "Equipment",    color: "text-blue-400" },
            both:         { label: "Sub+Equip",    color: "text-violet-400" },
            never:        { label: "Never paid",   color: "text-gray-400" },
          };

          return (
            <div className="space-y-5">
              {/* Summary cards row 1 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {[
                  { label: "Summit Customers", value: SUMMIT_DATA.summary.total, color: "text-violet-400", sub: null },
                  { label: "Active Subscribers", value: activeSubs, color: "text-emerald-400", sub: "Mar/Apr 2026" },
                  { label: "Stopped Sub", value: SUMMIT_DATA.summary.stoppedSubscription, color: "text-amber-400", sub: null },
                  { label: "Equipment Only", value: SUMMIT_DATA.summary.equipmentOnly, color: "text-blue-400", sub: "no subscription" },
                  { label: "Paying · Inactive", value: payingNotUsing.length, color: "text-orange-400", sub: "needs attention" },
                  { label: "Active · Not Paying", value: usingNotPaying.length, color: "text-red-400", sub: "potential revenue" },
                ].map(({ label, value, color, sub }) => (
                  <div key={label} className={`rounded-2xl border p-4 ${at.card}`}>
                    <p className={`text-2xl font-bold ${color}`}>{value}</p>
                    <p className={`text-[11px] mt-0.5 ${at.textMuted}`}>{label}</p>
                    {sub && <p className={`text-[10px] mt-0.5 ${at.textFaint}`}>{sub}</p>}
                  </div>
                ))}
              </div>

              {/* LTV banner */}
              <div className={`rounded-xl border px-5 py-3 flex items-center gap-3 ${at.freshnessBg}`}>
                <span className={`text-xs ${at.textMuted}`}>All-time Revenue (LTV)</span>
                <span className={`text-base font-bold text-emerald-400`}>₪{ltv ? ltv.toLocaleString() : "—"}</span>
                <span className={`text-[10px] ${at.textFaint} ml-auto`}>Source: {SUMMIT_DATA._source}</span>
              </div>

              {/* Sub-tab toggle */}
              <div className={`flex flex-wrap gap-1 rounded-xl p-1 border ${at.tabWrap} w-fit`}>
                {([
                  { id: "paying_not_using",  label: "Paying · Inactive",    count: payingNotUsing.length,  emoji: "💳" },
                  { id: "using_not_paying",  label: "Active · Not Paying",   count: usingNotPaying.length,  emoji: "⚡" },
                  { id: "stopped",           label: "Stopped Subscription",  count: stoppedSubs.length,     emoji: "⏸" },
                  { id: "equipment",         label: "Equipment / Install",    count: equipmentOnly.length,   emoji: "🔧" },
                ] as { id: typeof billingView; label: string; count: number; emoji: string }[]).map(({ id, label, count, emoji }) => (
                  <button key={id} onClick={() => setBillingView(id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${billingView === id ? at.tabActive : at.tabInactive}`}>
                    {emoji} {label} ({count})
                  </button>
                ))}
              </div>

              {/* ── VIEW: Paying active subscribers but not using ── */}
              {billingView === "paying_not_using" && (
                <div className={`rounded-2xl border overflow-hidden ${at.card}`}>
                  <div className={`px-5 py-3 border-b ${at.border} flex items-center gap-2`}>
                    <span className={`text-sm font-semibold ${at.textPrimary}`}>Active subscribers not using the app</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-medium">{payingNotUsing.length}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className={`border-b ${at.border}`}>
                          {["Summit Name", "App Match", "Phone", "Monthly Sub", "LTV", "Type", "Last Paid", "Last Mix", "Status"].map(h => (
                            <th key={h} className={`px-4 py-3 text-left text-[11px] uppercase tracking-wider font-medium ${at.textFaint} whitespace-nowrap`}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${at.rowDivide}`}>
                        {payingNotUsing.map(({ sc, user }) => {
                          const ptCfg = PAYMENT_TYPE_CONFIG[sc.paymentType];
                          return (
                            <tr key={sc.name} className={`${at.rowHover} transition`}>
                              <td className={`px-4 py-3 font-medium text-xs ${at.textPrimary} max-w-[160px] truncate`} title={sc.name}>{sc.name}</td>
                              <td className={`px-4 py-3 text-xs ${at.textMuted} max-w-[150px] truncate`} title={user?.salon_name}>
                                {user ? user.salon_name : <span className="text-orange-400 text-[10px] font-medium">Not found</span>}
                              </td>
                              <td className={`px-4 py-3 text-xs font-mono ${at.textFaint}`}>{user?.phone_number || "—"}</td>
                              <td className={`px-4 py-3 text-xs font-medium text-emerald-400`}>
                                {sc.typicalMonthly ? `₪${sc.typicalMonthly}/mo` : "—"}
                              </td>
                              <td className={`px-4 py-3 text-xs font-medium ${at.textSec}`}>
                                ₪{Math.round(sc.ltv || sc.total || 0).toLocaleString()}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`text-[10px] font-medium ${ptCfg?.color}`}>{ptCfg?.label}</span>
                              </td>
                              <td className={`px-4 py-3 text-[10px] ${at.textFaint}`}>{sc.lastPaidMonth || "—"}</td>
                              <td className={`px-4 py-3 text-[10px] ${at.textFaint}`}>
                                {user ? (user.last_mix_date === "-" || !user.last_mix_date ? "Never" : user.last_mix_date) : "—"}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {!user
                                  ? <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">Not registered</span>
                                  : user.days_inactive === null
                                  ? <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">Never mixed</span>
                                  : <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">{user.days_inactive}d inactive</span>}
                              </td>
                            </tr>
                          );
                        })}
                        {payingNotUsing.length === 0 && (
                          <tr><td colSpan={9} className={`py-10 text-center text-sm ${at.textFaint}`}>All paying customers are active!</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── VIEW: Active app users not paying ── */}
              {billingView === "using_not_paying" && (
                <div className={`rounded-2xl border overflow-hidden ${at.card}`}>
                  <div className={`px-5 py-3 border-b ${at.border} flex items-center gap-2`}>
                    <span className={`text-sm font-semibold ${at.textPrimary}`}>Active in app — no active Summit subscription</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 font-medium">{usingNotPaying.length}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className={`border-b ${at.border}`}>
                          {["Salon", "Phone", "Country", "First Mix", "Last Mix", "Days Inactive", "Version", "Summit"].map(h => (
                            <th key={h} className={`px-4 py-3 text-left text-[11px] uppercase tracking-wider font-medium ${at.textFaint} whitespace-nowrap`}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${at.rowDivide}`}>
                        {usingNotPaying.map((user) => {
                          const entry = summitWithMatch.find((m) => m.user?.phone_number === user.phone_number);
                          return (
                            <tr key={user.id} className={`${at.rowHover} transition`}>
                              <td className={`px-4 py-3 font-medium text-xs ${at.textPrimary} max-w-[180px] truncate`} title={user.salon_name}>{user.salon_name}</td>
                              <td className={`px-4 py-3 text-xs font-mono ${at.textFaint}`}>{user.phone_number}</td>
                              <td className={`px-4 py-3 text-xs ${at.textFaint}`}>{user.normalized_country || "—"}</td>
                              <td className={`px-4 py-3 text-[10px] ${at.textFaint}`}>{user.first_mix_date === "-" || !user.first_mix_date ? "—" : user.first_mix_date}</td>
                              <td className={`px-4 py-3 text-[10px] font-medium ${user.days_inactive !== null && user.days_inactive <= 14 ? "text-emerald-400" : at.textFaint}`}>
                                {user.last_mix_date === "-" || !user.last_mix_date ? "Never" : user.last_mix_date}
                              </td>
                              <td className={`px-4 py-3 text-xs font-medium ${user.days_inactive !== null && user.days_inactive <= 14 ? "text-emerald-400" : "text-amber-400"}`}>
                                {user.days_inactive !== null ? `${user.days_inactive}d` : "—"}
                              </td>
                              <td className={`px-4 py-3 text-[10px] ${at.textFaint}`}>v{user.version}</td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {entry
                                  ? <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">
                                      Stopped — {entry.sc.lastPaidMonth}
                                    </span>
                                  : <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">Not in Summit</span>}
                              </td>
                            </tr>
                          );
                        })}
                        {usingNotPaying.length === 0 && (
                          <tr><td colSpan={8} className={`py-10 text-center text-sm ${at.textFaint}`}>All active users are paying!</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── VIEW: Stopped subscriptions ── */}
              {billingView === "stopped" && (
                <div className={`rounded-2xl border overflow-hidden ${at.card}`}>
                  <div className={`px-5 py-3 border-b ${at.border} flex items-center gap-2`}>
                    <span className={`text-sm font-semibold ${at.textPrimary}`}>Stopped subscription — paid in the past, no longer paying</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-medium">{stoppedSubs.length}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className={`border-b ${at.border}`}>
                          {["Summit Name", "App Match", "Type", "Monthly Sub", "LTV", "Started", "Stopped", "Last Mix App"].map(h => (
                            <th key={h} className={`px-4 py-3 text-left text-[11px] uppercase tracking-wider font-medium ${at.textFaint} whitespace-nowrap`}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${at.rowDivide}`}>
                        {stoppedSubs.map(({ sc, user }) => {
                          const ptCfg = PAYMENT_TYPE_CONFIG[sc.paymentType];
                          return (
                            <tr key={sc.name} className={`${at.rowHover} transition`}>
                              <td className={`px-4 py-3 font-medium text-xs ${at.textPrimary} max-w-[160px] truncate`} title={sc.name}>{sc.name}</td>
                              <td className={`px-4 py-3 text-xs ${at.textMuted} max-w-[150px] truncate`} title={user?.salon_name}>
                                {user ? user.salon_name : <span className="text-orange-400 text-[10px]">Not found</span>}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`text-[10px] font-medium ${ptCfg?.color}`}>{ptCfg?.label}</span>
                              </td>
                              <td className={`px-4 py-3 text-xs ${at.textFaint}`}>
                                {sc.typicalMonthly ? `₪${sc.typicalMonthly}/mo` : "—"}
                              </td>
                              <td className={`px-4 py-3 text-xs font-medium ${at.textSec}`}>
                                ₪{Math.round(sc.ltv || 0).toLocaleString()}
                              </td>
                              <td className={`px-4 py-3 text-[10px] ${at.textFaint}`}>{sc.firstPaidMonth || "—"}</td>
                              <td className={`px-4 py-3 text-[10px] text-amber-400 font-medium`}>{sc.lastPaidMonth || "—"}</td>
                              <td className={`px-4 py-3 text-[10px] ${at.textFaint}`}>
                                {user ? (user.last_mix_date === "-" || !user.last_mix_date ? "Never" : user.last_mix_date) : "—"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── VIEW: Equipment / installation only ── */}
              {billingView === "equipment" && (
                <div className={`rounded-2xl border overflow-hidden ${at.card}`}>
                  <div className={`px-5 py-3 border-b ${at.border} flex items-center gap-2`}>
                    <span className={`text-sm font-semibold ${at.textPrimary}`}>Equipment & Installation — one-time payments, no recurring subscription</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-medium">{equipmentOnly.length}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className={`border-b ${at.border}`}>
                          {["Summit Name", "App Match", "Equipment Total", "Payment Month", "Last Mix App", "Active?"].map(h => (
                            <th key={h} className={`px-4 py-3 text-left text-[11px] uppercase tracking-wider font-medium ${at.textFaint} whitespace-nowrap`}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${at.rowDivide}`}>
                        {equipmentOnly.map(({ sc, user }) => (
                          <tr key={sc.name} className={`${at.rowHover} transition`}>
                            <td className={`px-4 py-3 font-medium text-xs ${at.textPrimary} max-w-[160px] truncate`} title={sc.name}>{sc.name}</td>
                            <td className={`px-4 py-3 text-xs ${at.textMuted} max-w-[150px] truncate`} title={user?.salon_name}>
                              {user ? user.salon_name : <span className="text-orange-400 text-[10px]">Not found</span>}
                            </td>
                            <td className={`px-4 py-3 text-xs font-medium text-blue-400`}>₪{Math.round(sc.ltv || 0).toLocaleString()}</td>
                            <td className={`px-4 py-3 text-[10px] ${at.textFaint}`}>{sc.firstPaidMonth || "—"}</td>
                            <td className={`px-4 py-3 text-[10px] ${at.textFaint}`}>
                              {user ? (user.last_mix_date === "-" || !user.last_mix_date ? "Never" : user.last_mix_date) : "—"}
                            </td>
                            <td className="px-4 py-3">
                              {user && user.days_inactive !== null && user.days_inactive <= 30
                                ? <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Active</span>
                                : <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">Inactive</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Footer */}
        <div className="text-center py-6">
          <p className={`text-[11px] ${at.textDim}`}>Spectra CI — Admin Dashboard</p>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// 14. EXPORT (with theme provider)
// ═══════════════════════════════════════════════════════════════════════

export const AdminDashboard: React.FC = () => (
  <SiteThemeProvider>
    <AdminDashboardInner />
  </SiteThemeProvider>
);
