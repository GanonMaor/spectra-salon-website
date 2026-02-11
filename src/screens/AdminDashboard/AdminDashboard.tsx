import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Search, Users, Globe, MapPin, ArrowUpDown, ArrowUp, ArrowDown,
  ChevronLeft, ChevronRight, Filter, X, BarChart3, Activity,
  Smartphone, Layers, RefreshCw, AlertTriangle, Heart, Clock,
  TrendingDown, Zap, Phone, MessageCircle, Mail, UserCheck,
  ShieldAlert, Star, Eye, ChevronDown, LayoutDashboard,
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

// ═══════════════════════════════════════════════════════════════════════
// 1. PHONE → COUNTRY INFERENCE
// ═══════════════════════════════════════════════════════════════════════

function inferCountryFromPhone(phone: string): string {
  if (!phone) return "";
  const clean = phone.replace(/[\s\-\(\)]/g, "");
  if (/^05\d{8}$/.test(clean) || /^0[2-9]\d{7,8}$/.test(clean)) return "Israel";
  if (/^07[0-9]{9,10}$/.test(clean) || /^447\d{9}$/.test(clean)) return "UK";
  if (/^351\d{9}$/.test(clean) || (/^9[12356]\d{7}$/.test(clean) && clean.length === 9)) return "Portugal";
  if (/^39\d{9,10}$/.test(clean) || /^393\d{9}$/.test(clean)) return "Italy";
  if (/^81\d{9,10}$/.test(clean)) return "Japan";
  if (/^30\d{10}$/.test(clean) || /^003\d{11,12}$/.test(clean)) return "Greece";
  if (/^375\d{9}$/.test(clean)) return "Belarus";
  if (/^79\d{9}$/.test(clean)) return "Russia";
  if (/^61\d{9}$/.test(clean) || (/^41\d{7}$/.test(clean) && clean.length === 9)) return "Australia";
  if (/^31\d{9}$/.test(clean) || (/^6[0-9]{8}$/.test(clean) && clean.length === 9)) return "Netherlands";
  if (/^353\d{7,9}$/.test(clean) || /^08[0-9]{8}$/.test(clean)) return "Ireland";
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
  if (s.includes("minute") || s.includes("hour")) return 0;
  const m = s.match(/^(\d+)\s*(days?|months?|years?)\s*ago/i);
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
  new:        { label: "New",        color: "text-sky-300",     bg: "bg-sky-500/10 border-sky-500/20" },
  activated:  { label: "Activated",  color: "text-blue-300",    bg: "bg-blue-500/10 border-blue-500/20" },
  engaged:    { label: "Engaged",    color: "text-emerald-300", bg: "bg-emerald-500/10 border-emerald-500/20" },
  power_user: { label: "Power User", color: "text-violet-300",  bg: "bg-violet-500/10 border-violet-500/20" },
  fading:     { label: "Fading",     color: "text-amber-300",   bg: "bg-amber-500/10 border-amber-500/20" },
  dormant:    { label: "Dormant",    color: "text-white/40",    bg: "bg-white/5 border-white/10" },
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
  no_first_mix:   { label: "No First Mix",      color: "text-red-300 bg-red-500/10" },
  sudden_drop:    { label: "Sudden Drop",        color: "text-orange-300 bg-orange-500/10" },
  low_adoption:   { label: "Low Adoption",       color: "text-amber-300 bg-amber-500/10" },
  high_potential:  { label: "High Potential",     color: "text-violet-300 bg-violet-500/10" },
  recovered:      { label: "Recovered Recently",  color: "text-emerald-300 bg-emerald-500/10" },
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
  send_tip:           { label: "Send Tip",          icon: Zap,            color: "text-emerald-400", bg: "bg-emerald-500/10 hover:bg-emerald-500/20" },
  check_in:           { label: "Schedule Check-in", icon: Phone,          color: "text-amber-400",   bg: "bg-amber-500/10 hover:bg-amber-500/20" },
  immediate_outreach: { label: "Outreach Now",      icon: ShieldAlert,    color: "text-red-400",     bg: "bg-red-500/10 hover:bg-red-500/20" },
  recovery_followup:  { label: "Recovery Follow-up", icon: MessageCircle, color: "text-blue-400",    bg: "bg-blue-500/10 hover:bg-blue-500/20" },
};

// ═══════════════════════════════════════════════════════════════════════
// 7. TYPES
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
}

function enrichUser(u: SalonUser): EnrichedUser {
  const days_inactive = parseDaysAgo(u.last_mix_date);
  const tenure_days = parseDaysAgo(u.first_mix_date);
  const has_mixed = u.first_mix_date !== "-" && u.first_mix_date !== null;
  const health = computeHealth(days_inactive, tenure_days, u.profiles);
  const lifecycle = classifyLifecycle(tenure_days, days_inactive, u.profiles, has_mixed);
  const risk_tags = computeRiskTags(has_mixed, days_inactive, tenure_days, u.profiles);
  const cs_action = recommendAction(health, lifecycle, risk_tags);
  return { ...u, days_inactive, tenure_days, has_mixed, health, lifecycle, risk_tags, cs_action };
}

// ═══════════════════════════════════════════════════════════════════════
// 8. API
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
// 9. CONSTANTS & HELPERS
// ═══════════════════════════════════════════════════════════════════════

const PIE_COLORS = ["#6366f1","#8b5cf6","#a78bfa","#c4b5fd","#818cf8","#7c3aed","#6d28d9","#5b21b6","#4f46e5","#4338ca","#3730a3","#60a5fa","#38bdf8","#22d3ee","#2dd4bf","#34d399","#4ade80","#a3e635","#facc15"];
const PAGE_SIZE = 25;

type OverviewSortField = "salon_name" | "phone_number" | "profiles" | "first_mix_date" | "last_mix_date" | "version" | "state" | "city";
type CSSortField = "salon_name" | "profiles" | "days_inactive" | "health_score" | "version" | "state" | "city";
type SortDir = "asc" | "desc";
type StatusFilter = "all" | "active" | "at_risk" | "critical" | "recovered" | "churned";
type ActiveTab = "overview" | "success";

function getFlag(country: string): string {
  const f: Record<string, string> = { Israel:"\u{1F1EE}\u{1F1F1}", USA:"\u{1F1FA}\u{1F1F8}", UK:"\u{1F1EC}\u{1F1E7}", ENGLAND:"\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}", Portugal:"\u{1F1F5}\u{1F1F9}", PORTUGAL:"\u{1F1F5}\u{1F1F9}", Italy:"\u{1F1EE}\u{1F1F9}", ITALY:"\u{1F1EE}\u{1F1F9}", Japan:"\u{1F1EF}\u{1F1F5}", JAPAN:"\u{1F1EF}\u{1F1F5}", Canada:"\u{1F1E8}\u{1F1E6}", CANADA:"\u{1F1E8}\u{1F1E6}", Belarus:"\u{1F1E7}\u{1F1FE}", BELARUS:"\u{1F1E7}\u{1F1FE}", Netherlands:"\u{1F1F3}\u{1F1F1}", Australia:"\u{1F1E6}\u{1F1FA}", Greece:"\u{1F1EC}\u{1F1F7}", GREECE:"\u{1F1EC}\u{1F1F7}", Ireland:"\u{1F1EE}\u{1F1EA}", IRLAND:"\u{1F1EE}\u{1F1EA}", Russia:"\u{1F1F7}\u{1F1FA}" };
  return f[country] || f[country?.toUpperCase()] || "\u{1F310}";
}

// ═══════════════════════════════════════════════════════════════════════
// 10. SHARED SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════

const TOOLTIP_STYLE = { background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff", fontSize: "13px" };

function CountryPieChart({ data, countryFilter, setCountryFilter }: { data: { name: string; value: number }[]; countryFilter: string; setCountryFilter: (v: string) => void }) {
  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5">
      <h3 className="text-sm font-medium text-white/70 mb-4 flex items-center gap-2"><Globe className="w-4 h-4 text-indigo-400" />Country Distribution</h3>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data.slice(0, 12)} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={2} dataKey="value" stroke="none">
              {data.slice(0, 12).map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number, n: string) => [`${v} users`, n]} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mt-2">
        {data.slice(0, 9).map((item, i) => (
          <button key={item.name} onClick={() => setCountryFilter(countryFilter === item.name ? "all" : item.name)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition ${countryFilter === item.name ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "text-white/50 hover:text-white/70 hover:bg-white/5"}`}>
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
            <span className="truncate">{getFlag(item.name)} {item.name}</span>
            <span className="text-white/30 ml-auto">{item.value}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function VersionBarChart({ data, allVersions, versionFilter, setVersionFilter }: { data: VersionBreakdown[]; allVersions: string[]; versionFilter: string; setVersionFilter: (v: string) => void }) {
  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5">
      <h3 className="text-sm font-medium text-white/70 mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-violet-400" />Version Distribution</h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.map(v => ({ version: `v${v.version}`, count: Number(v.count) }))} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="version" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} axisLine={false} tickLine={false} width={55} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="count" fill="#8b5cf6" radius={[0, 6, 6, 0]} barSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {allVersions.slice(0, 8).map(v => (
          <button key={v} onClick={() => setVersionFilter(versionFilter === v ? "all" : v)}
            className={`px-2.5 py-1 rounded-full text-xs transition ${versionFilter === v ? "bg-violet-500/20 text-violet-300 border border-violet-500/30" : "bg-white/5 text-white/40 hover:text-white/60 hover:bg-white/10"}`}>
            v{v}
          </button>
        ))}
      </div>
    </div>
  );
}

function Pagination({ page, totalPages, setPage }: { page: number; totalPages: number; setPage: (fn: (p: number) => number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="border-t border-white/[0.06] px-4 py-3 flex items-center justify-between">
      <p className="text-xs text-white/30">Page {page} of {totalPages}</p>
      <div className="flex items-center gap-1">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition"><ChevronLeft className="w-4 h-4" /></button>
        {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
          const pn = totalPages <= 7 ? i + 1 : page <= 4 ? i + 1 : page >= totalPages - 3 ? totalPages - 6 + i : page - 3 + i;
          return <button key={pn} onClick={() => setPage(() => pn)} className={`w-8 h-8 rounded-lg text-xs font-medium transition ${page === pn ? "bg-indigo-500 text-white" : "text-white/40 hover:text-white hover:bg-white/10"}`}>{pn}</button>;
        })}
        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition"><ChevronRight className="w-4 h-4" /></button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 11. MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════

export const AdminDashboard: React.FC = () => {
  // ── Tab ──
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");

  // ── Data ──
  const [rawUsers, setRawUsers] = useState<SalonUser[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [byVersion, setByVersion] = useState<VersionBreakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Enriched ──
  const users = useMemo(() => rawUsers.map(enrichUser), [rawUsers]);

  // ── Derived ──
  const allCountries = useMemo(() => { const s = new Set<string>(); users.forEach(u => { if (u.inferred_country) s.add(u.inferred_country); }); return Array.from(s).sort(); }, [users]);
  const allVersions = useMemo(() => { const s = new Set<string>(); users.forEach(u => { if (u.version) s.add(u.version); }); return Array.from(s).sort((a, b) => b.localeCompare(a)); }, [users]);
  const countryChartData = useMemo(() => {
    const m = new Map<string, number>();
    users.forEach(u => { const c = u.inferred_country || "Unknown"; m.set(c, (m.get(c) || 0) + 1); });
    return Array.from(m.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [users]);

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

  // ── Attention Today (CS) ──
  const attentionList = useMemo(() => [...users].filter(u => u.health.status !== "healthy").sort((a, b) => { if (a.health.score !== b.health.score) return a.health.score - b.health.score; return (b.tenure_days || 0) - (a.tenure_days || 0); }).slice(0, 10), [users]);

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

  // ══════════════════════════════════════════════════════════════════
  // OVERVIEW — filtered, sorted, paged
  // ══════════════════════════════════════════════════════════════════

  const ovFiltered = useMemo(() => {
    let result = [...users];
    if (search) { const q = search.toLowerCase(); result = result.filter(u => u.salon_name.toLowerCase().includes(q) || u.phone_number.includes(q) || (u.city || "").toLowerCase().includes(q) || (u.links || "").toLowerCase().includes(q)); }
    if (countryFilter !== "all") result = result.filter(u => (u.inferred_country || "").toLowerCase() === countryFilter.toLowerCase());
    if (versionFilter !== "all") result = result.filter(u => u.version === versionFilter);
    if (profileFilter === "active") result = result.filter(u => u.profiles > 0);
    else if (profileFilter === "zero") result = result.filter(u => u.profiles === 0);
    else if (profileFilter === "multi") result = result.filter(u => u.profiles > 1);
    result.sort((a, b) => {
      let aV: any = (a as any)[ovSortField]; let bV: any = (b as any)[ovSortField];
      if (ovSortField === "profiles") { aV = Number(aV) || 0; bV = Number(bV) || 0; }
      else { aV = (aV || "").toString().toLowerCase(); bV = (bV || "").toString().toLowerCase(); }
      if (aV < bV) return ovSortDir === "asc" ? -1 : 1; if (aV > bV) return ovSortDir === "asc" ? 1 : -1; return 0;
    });
    return result;
  }, [users, search, countryFilter, versionFilter, profileFilter, ovSortField, ovSortDir]);

  const ovTotalPages = Math.ceil(ovFiltered.length / PAGE_SIZE);
  const ovPaged = useMemo(() => ovFiltered.slice((ovPage - 1) * PAGE_SIZE, ovPage * PAGE_SIZE), [ovFiltered, ovPage]);
  useEffect(() => { setOvPage(1); }, [search, countryFilter, versionFilter, profileFilter]);

  // ══════════════════════════════════════════════════════════════════
  // CS — filtered, sorted, paged
  // ══════════════════════════════════════════════════════════════════

  const csFiltered = useMemo(() => {
    let result = [...users];
    if (search) { const q = search.toLowerCase(); result = result.filter(u => u.salon_name.toLowerCase().includes(q) || u.phone_number.includes(q) || (u.city || "").toLowerCase().includes(q)); }
    if (countryFilter !== "all") result = result.filter(u => (u.inferred_country || "").toLowerCase() === countryFilter.toLowerCase());
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

  // ── Sort handlers ──
  const handleOvSort = (field: OverviewSortField) => {
    if (ovSortField === field) setOvSortDir(d => d === "asc" ? "desc" : "asc");
    else { setOvSortField(field); setOvSortDir("desc"); }
  };
  const handleCsSort = (field: CSSortField) => {
    if (csSortField === field) setCsSortDir(d => d === "asc" ? "desc" : "asc");
    else { setCsSortField(field); setCsSortDir(field === "health_score" || field === "days_inactive" ? "asc" : "desc"); }
  };

  function OvSortIcon({ field }: { field: OverviewSortField }) {
    if (ovSortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-20" />;
    return ovSortDir === "asc" ? <ArrowUp className="w-3 h-3 text-indigo-400" /> : <ArrowDown className="w-3 h-3 text-indigo-400" />;
  }
  function CsSortIcon({ field }: { field: CSSortField }) {
    if (csSortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-20" />;
    return csSortDir === "asc" ? <ArrowUp className="w-3 h-3 text-indigo-400" /> : <ArrowDown className="w-3 h-3 text-indigo-400" />;
  }

  const HealthBadge = ({ score, status }: { score: number; status: string }) => {
    const cfg = status === "healthy" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" : status === "at_risk" ? "bg-amber-500/15 text-amber-400 border-amber-500/20" : "bg-red-500/15 text-red-400 border-red-500/20";
    return <span className={`inline-flex items-center justify-center w-10 h-7 rounded-lg text-xs font-bold border ${cfg}`}>{score}</span>;
  };

  const currentFiltered = activeTab === "overview" ? ovFiltered : csFiltered;

  // ══════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-white/60 text-sm">Loading dashboard...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-center max-w-md">
        <ShieldAlert className="w-10 h-10 text-red-400/60 mx-auto mb-3" />
        <p className="text-red-400 mb-4 text-sm">{error}</p>
        <button onClick={fetchData} className="px-5 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition text-sm">Retry</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* ── Sticky Top Bar ── */}
      <div className="sticky top-0 z-40 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-white/40 hover:text-white/70 transition"><ChevronLeft className="w-5 h-5" /></Link>
            <div>
              <h1 className="text-lg font-semibold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                Admin Dashboard
              </h1>
              <p className="text-xs text-white/40">Salon Users Management</p>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="flex items-center gap-1 bg-white/[0.04] rounded-xl p-1 border border-white/[0.06]">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "overview" ? "bg-white/[0.1] text-white shadow-sm" : "text-white/40 hover:text-white/60"
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" /> Overview
            </button>
            <button
              onClick={() => setActiveTab("success")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "success" ? "bg-white/[0.1] text-white shadow-sm" : "text-white/40 hover:text-white/60"
              }`}
            >
              <Heart className="w-3.5 h-3.5" /> Customer Success
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-white/20 hidden sm:block">{users.length} users</span>
            <button onClick={fetchData} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm transition">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ══════════════════════════════════════════════════════════════ */}
        {/*  TAB: OVERVIEW                                               */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === "overview" && (
          <>
            {/* ── Overview KPI Cards ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: "Total Users", value: stats?.total_users || "0", icon: Users, color: "from-indigo-500 to-purple-600" },
                { label: "Total Profiles", value: stats?.total_profiles || "0", icon: Layers, color: "from-cyan-500 to-blue-600" },
                { label: "Active Users", value: stats?.active_users || "0", icon: Activity, color: "from-emerald-500 to-green-600" },
                { label: "Countries", value: String(allCountries.length), icon: Globe, color: "from-amber-500 to-orange-600" },
                { label: "Cities", value: stats?.city_count || "0", icon: MapPin, color: "from-pink-500 to-rose-600" },
                { label: "Latest Version", value: stats?.latest_version_count || "0", icon: Smartphone, color: "from-violet-500 to-fuchsia-600" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 hover:bg-white/[0.05] transition group">
                  <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full bg-gradient-to-br ${color} opacity-10 group-hover:opacity-20 transition blur-xl`} />
                  <Icon className="w-4 h-4 text-white/30 mb-2" />
                  <p className="text-2xl font-bold text-white tracking-tight">{Number(value).toLocaleString()}</p>
                  <p className="text-[11px] text-white/40 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* ── Charts Row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <CountryPieChart data={countryChartData} countryFilter={countryFilter} setCountryFilter={setCountryFilter} />
              <VersionBarChart data={byVersion} allVersions={allVersions} versionFilter={versionFilter} setVersionFilter={setVersionFilter} />
            </div>

            {/* ── Search & Overview Filters ── */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, phone, city..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition" />
                  {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"><X className="w-4 h-4" /></button>}
                </div>
                <button onClick={() => setShowFilters(f => !f)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition ${
                    showFilters || countryFilter !== "all" || versionFilter !== "all" || profileFilter !== "all"
                      ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300" : "bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-white/70"
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
                <div className="flex flex-wrap gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-white/30 font-medium">Country</label>
                    <select value={countryFilter} onChange={e => setCountryFilter(e.target.value)} className="block w-44 px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.1] text-white text-sm focus:outline-none appearance-none cursor-pointer">
                      <option value="all" className="bg-[#1a1a2e]">All Countries</option>
                      {allCountries.map(c => <option key={c} value={c} className="bg-[#1a1a2e]">{getFlag(c)} {c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-white/30 font-medium">Version</label>
                    <select value={versionFilter} onChange={e => setVersionFilter(e.target.value)} className="block w-36 px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.1] text-white text-sm focus:outline-none appearance-none cursor-pointer">
                      <option value="all" className="bg-[#1a1a2e]">All Versions</option>
                      {allVersions.map(v => <option key={v} value={v} className="bg-[#1a1a2e]">v{v}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-white/30 font-medium">Profiles</label>
                    <select value={profileFilter} onChange={e => setProfileFilter(e.target.value)} className="block w-40 px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.1] text-white text-sm focus:outline-none appearance-none cursor-pointer">
                      <option value="all" className="bg-[#1a1a2e]">All Profiles</option>
                      <option value="active" className="bg-[#1a1a2e]">Has Profiles ({">"}0)</option>
                      <option value="multi" className="bg-[#1a1a2e]">Multi-Profile ({">"}1)</option>
                      <option value="zero" className="bg-[#1a1a2e]">Zero Profiles</option>
                    </select>
                  </div>
                  {(countryFilter !== "all" || versionFilter !== "all" || profileFilter !== "all") && (
                    <div className="flex items-end">
                      <button onClick={() => { setCountryFilter("all"); setVersionFilter("all"); setProfileFilter("all"); }} className="px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition">Clear All</button>
                    </div>
                  )}
                </div>
              )}
              <div className="flex items-center justify-between">
                <p className="text-xs text-white/30">
                  Showing <span className="text-white/60 font-medium">{ovFiltered.length}</span> of {users.length} users
                  {countryFilter !== "all" && <span className="text-indigo-400 ml-1">in {countryFilter}</span>}
                </p>
              </div>
            </div>

            {/* ── Overview Table ── */}
            <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      {([
                        { field: "salon_name" as OverviewSortField, label: "Salon Name", w: "min-w-[200px]" },
                        { field: "phone_number" as OverviewSortField, label: "Phone", w: "min-w-[130px]" },
                        { field: "profiles" as OverviewSortField, label: "Profiles", w: "min-w-[80px]" },
                        { field: "first_mix_date" as OverviewSortField, label: "First Mix", w: "min-w-[110px]" },
                        { field: "last_mix_date" as OverviewSortField, label: "Last Mix", w: "min-w-[110px]" },
                        { field: "version" as OverviewSortField, label: "Version", w: "min-w-[80px]" },
                        { field: "state" as OverviewSortField, label: "Country", w: "min-w-[120px]" },
                        { field: "city" as OverviewSortField, label: "City", w: "min-w-[120px]" },
                      ]).map(({ field, label, w }) => (
                        <th key={field} onClick={() => handleOvSort(field)} className={`${w} px-4 py-3 text-left text-[11px] uppercase tracking-wider text-white/30 font-medium cursor-pointer hover:text-white/50 transition select-none`}>
                          <span className="flex items-center gap-1.5">{label} <OvSortIcon field={field} /></span>
                        </th>
                      ))}
                      <th className="min-w-[80px] px-4 py-3 text-left text-[11px] uppercase tracking-wider text-white/30 font-medium">Links</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {ovPaged.map(user => (
                      <tr key={user.id} className="hover:bg-white/[0.03] transition group">
                        <td className="px-4 py-3"><span className="font-medium text-white/90 group-hover:text-white transition">{user.salon_name}</span></td>
                        <td className="px-4 py-3 text-white/50 font-mono text-xs">{user.phone_number}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${user.profiles === 0 ? "bg-white/5 text-white/20" : user.profiles >= 5 ? "bg-indigo-500/20 text-indigo-300" : "bg-white/[0.06] text-white/60"}`}>{user.profiles}</span>
                        </td>
                        <td className="px-4 py-3 text-white/40 text-xs">{user.first_mix_date === "-" ? <span className="text-white/15">--</span> : user.first_mix_date}</td>
                        <td className="px-4 py-3 text-white/40 text-xs">
                          {user.last_mix_date === "-" ? <span className="text-white/15">--</span> : (
                            <span className={
                              user.last_mix_date.includes("hour") || user.last_mix_date.includes("minute") ? "text-emerald-400/70"
                              : user.last_mix_date.includes("days ago") && parseInt(user.last_mix_date) <= 7 ? "text-blue-400/70" : ""
                            }>{user.last_mix_date}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-medium ${
                            user.version === "1021" ? "bg-emerald-500/10 text-emerald-400/80"
                            : user.version >= "1020" ? "bg-blue-500/10 text-blue-400/70"
                            : user.version >= "1017" ? "bg-amber-500/10 text-amber-400/60"
                            : "bg-white/5 text-white/30"
                          }`}>v{user.version}</span>
                        </td>
                        <td className="px-4 py-3 text-white/50 text-xs">
                          {user.inferred_country ? <span className="flex items-center gap-1.5"><span className="text-sm">{getFlag(user.inferred_country)}</span>{user.inferred_country}</span> : <span className="text-white/15">--</span>}
                        </td>
                        <td className="px-4 py-3 text-white/40 text-xs">{user.city || <span className="text-white/15">--</span>}</td>
                        <td className="px-4 py-3 text-white/30 text-xs">
                          {user.links ? <span className="text-indigo-400/70 hover:text-indigo-300 cursor-pointer">{user.links}</span> : <span className="text-white/10">--</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={ovPage} totalPages={ovTotalPages} setPage={setOvPage} />
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
                { key: "active" as StatusFilter, label: "Active This Week", value: kpis.active, icon: Activity, gradient: "from-emerald-500 to-green-600", ring: "ring-emerald-500/30" },
                { key: "at_risk" as StatusFilter, label: "At Risk (7–14d)", value: kpis.atRisk, icon: AlertTriangle, gradient: "from-amber-500 to-yellow-600", ring: "ring-amber-500/30" },
                { key: "critical" as StatusFilter, label: "Critical (14d+)", value: kpis.critical, icon: ShieldAlert, gradient: "from-red-500 to-rose-600", ring: "ring-red-500/30" },
                { key: "recovered" as StatusFilter, label: "Recovered", value: kpis.recovered, icon: UserCheck, gradient: "from-blue-500 to-cyan-600", ring: "ring-blue-500/30" },
                { key: "churned" as StatusFilter, label: "Churned (30d+)", value: kpis.churned, icon: TrendingDown, gradient: "from-gray-500 to-slate-600", ring: "ring-gray-500/30" },
              ]).map(({ key, label, value, icon: Icon, gradient, ring }) => (
                <button key={key} onClick={() => setStatusFilter(statusFilter === key ? "all" : key)}
                  className={`relative overflow-hidden rounded-2xl border p-4 text-left transition-all group ${statusFilter === key ? `bg-white/[0.06] border-white/[0.12] ring-2 ${ring}` : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.05]"}`}>
                  <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 transition blur-xl`} />
                  <Icon className="w-4 h-4 text-white/30 mb-2" />
                  <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
                  <p className="text-[11px] text-white/40 mt-0.5">{label}</p>
                </button>
              ))}
            </div>

            {/* ── Quick Toggles ── */}
            <div className="flex flex-wrap items-center gap-2">
              {([
                { key: "at_risk" as const, label: "Only At Risk", icon: AlertTriangle },
                { key: "new" as const, label: "Only New Customers", icon: Star },
                { key: "high_potential" as const, label: "High Potential (5+ profiles)", icon: Zap },
              ]).map(({ key, label, icon: Icon }) => (
                <button key={key} onClick={() => setQuickToggle(quickToggle === key ? "" : key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition border ${quickToggle === key ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-300" : "bg-white/[0.03] border-white/[0.06] text-white/40 hover:text-white/60 hover:bg-white/[0.05]"}`}>
                  <Icon className="w-3.5 h-3.5" /> {label}
                </button>
              ))}
              {(statusFilter !== "all" || quickToggle) && (
                <button onClick={() => { setStatusFilter("all"); setQuickToggle(""); }} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition">
                  <X className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>

            {/* ── Attention Today ── */}
            {attentionList.length > 0 && (
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
                <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                  <h3 className="text-sm font-medium text-white/80 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-amber-400" /> Attention Today
                    <span className="text-white/30 font-normal">Top 10 customers to act on</span>
                  </h3>
                </div>
                <div className="divide-y divide-white/[0.03]">
                  {attentionList.map((u, i) => {
                    const ac = ACTION_CONFIG[u.cs_action]; const AcIcon = ac.icon;
                    return (
                      <div key={u.id} className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.02] transition">
                        <span className="text-white/15 text-xs font-mono w-5 text-right">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white/90 truncate">{u.salon_name}</p>
                          <p className="text-[11px] text-white/30 truncate">{u.inferred_country ? `${getFlag(u.inferred_country)} ${u.inferred_country}` : ""}{u.city ? ` / ${u.city}` : ""}</p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="text-xs text-white/30">{u.days_inactive !== null ? `${u.days_inactive}d inactive` : "Never mixed"}</span>
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
              <CountryPieChart data={countryChartData} countryFilter={countryFilter} setCountryFilter={setCountryFilter} />
              <VersionBarChart data={byVersion} allVersions={allVersions} versionFilter={versionFilter} setVersionFilter={setVersionFilter} />
            </div>

            {/* ── CS Search & Filters ── */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, phone, city..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition" />
                  {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"><X className="w-4 h-4" /></button>}
                </div>
                <button onClick={() => setShowFilters(f => !f)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition ${showFilters ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300" : "bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-white/70"}`}>
                  <Filter className="w-4 h-4" /> Filters
                </button>
              </div>
              {showFilters && (
                <div className="flex flex-wrap gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-white/30 font-medium">Country</label>
                    <select value={countryFilter} onChange={e => setCountryFilter(e.target.value)} className="block w-44 px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.1] text-white text-sm focus:outline-none appearance-none cursor-pointer">
                      <option value="all" className="bg-[#1a1a2e]">All Countries</option>
                      {allCountries.map(c => <option key={c} value={c} className="bg-[#1a1a2e]">{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-white/30 font-medium">Version</label>
                    <select value={versionFilter} onChange={e => setVersionFilter(e.target.value)} className="block w-36 px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.1] text-white text-sm focus:outline-none appearance-none cursor-pointer">
                      <option value="all" className="bg-[#1a1a2e]">All Versions</option>
                      {allVersions.map(v => <option key={v} value={v} className="bg-[#1a1a2e]">v{v}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-white/30 font-medium">Lifecycle</label>
                    <select value={lifecycleFilter} onChange={e => setLifecycleFilter(e.target.value)} className="block w-40 px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.1] text-white text-sm focus:outline-none appearance-none cursor-pointer">
                      <option value="all" className="bg-[#1a1a2e]">All Stages</option>
                      {(Object.entries(LIFECYCLE_CONFIG) as [Lifecycle, typeof LIFECYCLE_CONFIG[Lifecycle]][]).map(([k, v]) => (
                        <option key={k} value={k} className="bg-[#1a1a2e]">{v.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button onClick={() => { setCountryFilter("all"); setVersionFilter("all"); setLifecycleFilter("all"); setStatusFilter("all"); setQuickToggle(""); }}
                      className="px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition">Clear All</button>
                  </div>
                </div>
              )}
              <p className="text-xs text-white/30">Showing <span className="text-white/60 font-medium">{csFiltered.length}</span> of {users.length} customers</p>
            </div>

            {/* ── CS Customer Table ── */}
            <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      {([
                        { field: "salon_name" as CSSortField, label: "Salon", w: "min-w-[180px]" },
                        { field: "profiles" as CSSortField, label: "Profiles", w: "min-w-[70px]" },
                        { field: "days_inactive" as CSSortField, label: "Inactive", w: "min-w-[80px]" },
                        { field: "health_score" as CSSortField, label: "Health", w: "min-w-[70px]" },
                      ]).map(({ field, label, w }) => (
                        <th key={field} onClick={() => handleCsSort(field)} className={`${w} px-4 py-3 text-left text-[11px] uppercase tracking-wider text-white/30 font-medium cursor-pointer hover:text-white/50 transition select-none`}>
                          <span className="flex items-center gap-1.5">{label} <CsSortIcon field={field} /></span>
                        </th>
                      ))}
                      <th className="min-w-[90px] px-4 py-3 text-left text-[11px] uppercase tracking-wider text-white/30 font-medium">Lifecycle</th>
                      <th className="min-w-[120px] px-4 py-3 text-left text-[11px] uppercase tracking-wider text-white/30 font-medium">Risk Tags</th>
                      <th className="min-w-[100px] px-4 py-3 text-left text-[11px] uppercase tracking-wider text-white/30 font-medium">
                        <span className="flex items-center gap-1.5 cursor-pointer" onClick={() => handleCsSort("state")}>Country <CsSortIcon field="state" /></span>
                      </th>
                      <th className="min-w-[140px] px-4 py-3 text-left text-[11px] uppercase tracking-wider text-white/30 font-medium">Action</th>
                      <th className="w-10 px-2 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {csPaged.map(user => {
                      const ac = ACTION_CONFIG[user.cs_action]; const AcIcon = ac.icon;
                      const lc = LIFECYCLE_CONFIG[user.lifecycle];
                      const isExpanded = expandedId === user.id;
                      return (
                        <React.Fragment key={user.id}>
                          <tr className="hover:bg-white/[0.03] transition group">
                            <td className="px-4 py-3">
                              <span className="font-medium text-white/90 group-hover:text-white transition block truncate max-w-[200px]">{user.salon_name}</span>
                              <span className="text-[11px] text-white/25 font-mono">{user.phone_number}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${user.profiles === 0 ? "bg-white/5 text-white/20" : user.profiles >= 5 ? "bg-indigo-500/20 text-indigo-300" : "bg-white/[0.06] text-white/60"}`}>{user.profiles}</span>
                            </td>
                            <td className="px-4 py-3">
                              {user.days_inactive !== null ? (
                                <span className={`text-xs font-medium ${user.days_inactive <= 1 ? "text-emerald-400" : user.days_inactive <= 7 ? "text-emerald-400/60" : user.days_inactive <= 14 ? "text-amber-400" : user.days_inactive <= 30 ? "text-red-400/80" : "text-white/25"}`}>{user.days_inactive}d</span>
                              ) : <span className="text-white/15 text-xs">Never</span>}
                            </td>
                            <td className="px-4 py-3"><HealthBadge score={user.health.score} status={user.health.status} /></td>
                            <td className="px-4 py-3"><span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-medium border ${lc.bg} ${lc.color}`}>{lc.label}</span></td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1">
                                {user.risk_tags.length > 0 ? user.risk_tags.map(t => (
                                  <span key={t} className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${RISK_TAG_CONFIG[t].color}`}>{RISK_TAG_CONFIG[t].label}</span>
                                )) : <span className="text-white/10 text-[10px]">--</span>}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-white/50 text-xs">
                              {user.inferred_country ? <span className="flex items-center gap-1"><span className="text-sm">{getFlag(user.inferred_country)}</span>{user.inferred_country}</span> : <span className="text-white/15">--</span>}
                            </td>
                            <td className="px-4 py-3">
                              <button className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium ${ac.bg} ${ac.color} transition`}><AcIcon className="w-3 h-3" /> {ac.label}</button>
                            </td>
                            <td className="px-2 py-3">
                              <button onClick={() => setExpandedId(isExpanded ? null : user.id)} className="text-white/20 hover:text-white/50 transition">
                                <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                              </button>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className="bg-white/[0.02]">
                              <td colSpan={9} className="px-6 py-4">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                                  <div className="space-y-2">
                                    <p className="text-[10px] uppercase tracking-wider text-white/30 font-medium">Health Details</p>
                                    <p className="text-white/60">Score: <span className="text-white font-bold">{user.health.score}</span>/100</p>
                                    {user.health.factors.map((f, idx) => (
                                      <p key={idx} className="text-white/40 flex items-center gap-1.5"><AlertTriangle className="w-3 h-3 text-amber-400/60" /> {f}</p>
                                    ))}
                                  </div>
                                  <div className="space-y-2">
                                    <p className="text-[10px] uppercase tracking-wider text-white/30 font-medium">Timeline</p>
                                    <p className="text-white/50">First Mix: <span className="text-white/70">{user.first_mix_date}</span></p>
                                    <p className="text-white/50">Last Mix: <span className="text-white/70">{user.last_mix_date}</span></p>
                                    <p className="text-white/50">Tenure: <span className="text-white/70">{user.tenure_days !== null ? `${user.tenure_days} days` : "--"}</span></p>
                                  </div>
                                  <div className="space-y-2">
                                    <p className="text-[10px] uppercase tracking-wider text-white/30 font-medium">Details</p>
                                    <p className="text-white/50">Version: <span className="text-white/70">v{user.version}</span></p>
                                    <p className="text-white/50">City: <span className="text-white/70">{user.city || "--"}</span></p>
                                    <p className="text-white/50">Links: <span className="text-indigo-400/70">{user.links || "--"}</span></p>
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
              <Pagination page={csPage} totalPages={csTotalPages} setPage={setCsPage} />
            </div>

            {/* ── Insights & Systemic Patterns ── */}
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5 space-y-4">
              <h3 className="text-sm font-medium text-white/70 flex items-center gap-2"><Layers className="w-4 h-4 text-indigo-400" />Insights & Systemic Patterns</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 space-y-1">
                  <p className="text-2xl font-bold text-white">{insights.churnedPct}%</p>
                  <p className="text-[11px] text-white/40">of churned users had only 1 profile</p>
                  <p className="text-[10px] text-white/20">{insights.churnedSingleProfile} of {insights.totalChurned} churned</p>
                </div>
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 space-y-1">
                  <p className="text-2xl font-bold text-white">{insights.noFirstMixPct}%</p>
                  <p className="text-[11px] text-white/40">of all users never did a first mix</p>
                  <p className="text-[10px] text-white/20">{insights.noFirstMix} users with no first mix</p>
                </div>
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 space-y-1">
                  <p className="text-2xl font-bold text-emerald-400">{insights.powerUsers}</p>
                  <p className="text-[11px] text-white/40">Power Users (5+ profiles, active)</p>
                  <p className="text-[10px] text-white/20">Avg profiles: {insights.avgProfiles}</p>
                </div>
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 space-y-1">
                  <p className="text-2xl font-bold text-blue-400">{insights.recoveredCount}</p>
                  <p className="text-[11px] text-white/40">Recovered customers</p>
                  <p className="text-[10px] text-white/20">Retention win</p>
                </div>
              </div>
            </div>

            {/* ── Success Opportunities ── */}
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5 space-y-3">
              <h3 className="text-sm font-medium text-white/70 flex items-center gap-2"><Star className="w-4 h-4 text-amber-400" />Success Opportunities</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl bg-gradient-to-br from-violet-500/5 to-indigo-500/5 border border-violet-500/10 p-4">
                  <p className="text-xs font-medium text-violet-300 mb-1">Training Opportunity</p>
                  <p className="text-[11px] text-white/40">{users.filter(u => u.profiles >= 3 && u.days_inactive !== null && u.days_inactive > 14).length} users with 3+ profiles but low activity. Training could re-engage them.</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-emerald-500/5 to-green-500/5 border border-emerald-500/10 p-4">
                  <p className="text-xs font-medium text-emerald-300 mb-1">Advocacy Candidates</p>
                  <p className="text-[11px] text-white/40">{users.filter(u => u.lifecycle === "power_user").length} power users could be brand advocates. Consider testimonial or referral program.</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border border-blue-500/10 p-4">
                  <p className="text-xs font-medium text-blue-300 mb-1">Recovery Wins</p>
                  <p className="text-[11px] text-white/40">{insights.recoveredCount} customers were recovered. Analyze what brought them back to replicate success.</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="text-center py-6">
          <p className="text-[11px] text-white/10">Spectra CI - Admin Dashboard</p>
        </div>
      </div>
    </div>
  );
};
