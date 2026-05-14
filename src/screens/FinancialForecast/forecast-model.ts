// ─────────────────────────────────────────────────────────────────────
// Shared Financial Forecast model
//
// This module is the single source of truth for the operating budget
// model used by the live `/financial-forecast` page AND any other view
// (such as the investor deck) that needs to read the same forecast.
//
// Pure data + React-free helpers only. The React page and any hooks live
// in their own files and import from here.
// ─────────────────────────────────────────────────────────────────────

// ── Constants ───────────────────────────────────────────────────────

export const FORECAST_MONTHS = 36;
export const STORAGE_KEY = "spectra-operating-budget-v5";
// Older keys we want to wipe so a stale browser cache cannot keep
// pre-profile data alive.
export const LEGACY_STORAGE_KEYS = [
  "spectra-operating-budget-v1",
  "spectra-operating-budget-v2",
  "spectra-operating-budget-v3",
  "spectra-operating-budget-v4",
];
export const FORECAST_API = "/.netlify/functions/financial-forecast";
export const SALON_ID = "salon-look";
export const SHORT_MO = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// First month: June 2026, running for `FORECAST_MONTHS` months.
function buildMonthLabels(): string[] {
  const out: string[] = [];
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

export const MONTH_LABELS = buildMonthLabels();

// Half-year (6-month) ranges — labels are derived from the forecast horizon
// so the model can grow from 2 → 3 → N years without code duplication.
export const HALF_LABELS: string[] = (() => {
  const out: string[] = [];
  for (let start = 0; start < FORECAST_MONTHS; start += 6) {
    const end = Math.min(start + 6, FORECAST_MONTHS);
    out.push(`${MONTH_LABELS[start]} – ${MONTH_LABELS[end - 1]}`);
  }
  return out;
})();

export const HALF_RANGES: { start: number; end: number; label: string; range: string }[] =
  HALF_LABELS.map((label, idx) => {
    const start = idx * 6;
    const end = Math.min(start + 6, FORECAST_MONTHS);
    return { start, end, label: `H${idx + 1}`, range: label };
  });

export const DEFAULT_CAC_BY_MONTH = Array.from({ length: FORECAST_MONTHS }, () => 300);
export const DEFAULT_ARPU_BY_MONTH = [
  // Year 1 — H1 (Jun 26 → Nov 26)
  68.75, 68.75, 68.75,
  150, 150, 150,
  // Year 1 — H2 (Dec 26 → May 27)
  150, 150, 150,
  180, 180, 180,
  // Year 2 — H3 (Jun 27 → Nov 27)
  200, 200, 200, 200, 200, 200,
  // Year 2 — H4 (Dec 27 → May 28)
  280, 280, 280, 280, 280, 280,
  // Year 3 — H5 (Jun 28 → Nov 28) — carry forward Y2 ARPU
  280, 280, 280, 280, 280, 280,
  // Year 3 — H6 (Dec 28 → May 29) — carry forward Y2 ARPU
  280, 280, 280, 280, 280, 280,
];
export const DEFAULT_CAMPAIGN_SPEND_BY_MONTH = [
  // Year 1
  5000, 5000, 7500, 7500, 12000, 12000,
  12000, 12000, 12000, 12000, 12000, 12000,
  // Year 2
  12000, 12000, 12000, 12000, 12000, 12000,
  15000, 15000, 15000, 15000, 15000, 15000,
  // Year 3 — H5 ramps marketing to $60K / mo
  60000, 60000, 60000, 60000, 60000, 60000,
  // Year 3 — H6 pushes marketing to $90K / mo
  90000, 90000, 90000, 90000, 90000, 90000,
];

// ── Categories & default expense lines ──────────────────────────────

export const CATEGORY_RND = "Research & Development";
export const CATEGORY_MS = "Marketing & Sales";
export const CATEGORY_OPS = "Operations";
export const CATEGORY_MGMT = "Management";
export const CATEGORY_ADMIN = "Accounting / Admin";
export const DEFAULT_CATEGORIES = [
  CATEGORY_RND,
  CATEGORY_MS,
  CATEGORY_OPS,
  CATEGORY_MGMT,
  CATEGORY_ADMIN,
] as const;

// Special line ids referenced by the model.
export const LINE_CAMPAIGNS = "ms.campaigns";
export const LINE_TRIPLE_BUNDLE = "ms.tripleBundle";
export const LINE_VAT = "admin.vat";
export const LINE_CEO = "mgmt.ceo";
export const LINE_COO = "mgmt.coo";

export const YEAR_2_START_MONTH = 12;
export const YEAR_3_START_MONTH = 24;

// Payroll-like rows that should receive the broad Year 3 salary increase.
// CEO / COO are handled separately because the user gave explicit numbers.
export const YEAR_3_GENERAL_SALARY_BUMP_LINE_IDS = new Set([
  "rnd.achela",
  "ms.campaignMgr",
  "ops.support",
  "ops.installations",
]);

// Bump this whenever the staged plan changes (including extending the
// horizon or salary profile) so that older saved states are migrated to
// the new plan exactly once.
export const PROFILE_VERSION = 3;

// ── Types ───────────────────────────────────────────────────────────

export type MonthlyArr = (number | null)[]; // length FORECAST_MONTHS

export type LineKind = "fixedUsd" | "linkedCampaigns" | "calculatedTripleBundle" | "calculatedVat";

export interface ExpenseLine {
  id: string;
  category: string;
  label: string;
  kind: LineKind;
  /**
   * Meaning of `amount` depends on `kind`:
   * - fixedUsd: fixed monthly USD amount.
   * - linkedCampaigns: ignored, the line value comes from growth.defaultCampaignSpend
   *   (and overrides.campaignSpend) so the new-subscribers and the M&S Campaigns line
   *   stay in sync.
   * - calculatedTripleBundle: per-new-subscriber USD cost (default 70).
   * - calculatedVat: ignored, VAT uses business.israeliCustomers and business.vatPct.
   */
  amount: number;
  protected?: boolean;
}

export interface BusinessAssumptions {
  startingSubscribers: number;
  currentMrrUsd: number; // current monthly recurring revenue in USD
  churnRatePct: number; // e.g. 3 = 3%
  israeliCustomers: number;
  vatPct: number; // e.g. 10 = 10%
}

export interface GrowthAssumptions {
  defaultCac: number; // USD
  defaultCampaignSpend: number; // USD per month
}

export interface RevenueAssumptions {
  defaultArpu: number; // USD per subscriber per month
}

export interface MonthlyOverrides {
  cac: MonthlyArr;
  arpu: MonthlyArr;
  campaignSpend: MonthlyArr;
  churnPct: MonthlyArr;
  expenseLines: Record<string, MonthlyArr>; // per-line per-month override (in line's native unit)
}

export interface BudgetState {
  business: BusinessAssumptions;
  growth: GrowthAssumptions;
  revenue: RevenueAssumptions;
  categories: string[];
  expenseLines: ExpenseLine[];
  overrides: MonthlyOverrides;
  /**
   * Profile version of the staged multi-year CAC / ARPU / Campaign-spend
   * plan baked into the defaults. When this is below the current
   * `PROFILE_VERSION` (e.g. coming from an older saved state in the
   * database or localStorage) we automatically migrate the overrides to
   * the latest staged plan.
   */
  profileVersion?: number;
}

export interface AddExpenseLineInput {
  category: string;
  label: string;
  amount: number;
  startMonth?: number;
}

export interface ForecastResult {
  cac: number[];
  arpu: number[];
  campaignSpend: number[];
  /**
   * Total Marketing & Sales acquisition spend per month (the actual driver
   * of new subscribers): campaign spend + every fixed M&S line such as
   * Campaign manager, Content creation, and any user-added M&S row.
   * Excludes Triple Bundle equipment (a per-customer fulfillment cost) and
   * VAT (not an acquisition driver).
   */
  marketingAcquisitionSpend: number[];
  churnPct: number[]; // 0..1
  subscribersStart: number[];
  newSubscribers: number[];
  churnedSubscribers: number[];
  subscribersEnd: number[];
  revenue: number[]; // MRR per month
  arr: number[];
  expensesByLine: Record<string, number[]>;
  expensesByCategory: Record<string, number[]>;
  totalExpenses: number[];
  ebitda: number[];
}

export type SaveStatus = "loading" | "saved" | "saving" | "failed" | "local";

// ── Defaults ────────────────────────────────────────────────────────

export function emptyOverrideArr(): MonthlyArr {
  return Array.from({ length: FORECAST_MONTHS }, () => null);
}

export function emptyOverrides(lines: ExpenseLine[]): MonthlyOverrides {
  const expenseLines: Record<string, MonthlyArr> = {};
  for (const l of lines) expenseLines[l.id] = emptyOverrideArr();
  return {
    cac: emptyOverrideArr(),
    arpu: emptyOverrideArr(),
    campaignSpend: emptyOverrideArr(),
    churnPct: emptyOverrideArr(),
    expenseLines,
  };
}

export function profileOverrideArr(values: number[], fallback: number): MonthlyArr {
  return Array.from({ length: FORECAST_MONTHS }, (_, i) => {
    const v = values[i] ?? fallback;
    return Number.isFinite(v) ? v : fallback;
  });
}

export function buildExpenseLineProfileOverride(line: ExpenseLine): MonthlyArr | null {
  if (line.id === LINE_CEO || line.id === LINE_COO) {
    return Array.from({ length: FORECAST_MONTHS }, (_, i) => {
      if (i >= YEAR_3_START_MONTH) return 15000;
      if (i >= YEAR_2_START_MONTH) return 12000;
      return null;
    });
  }

  if (YEAR_3_GENERAL_SALARY_BUMP_LINE_IDS.has(line.id)) {
    const year3Salary = Number((line.amount * 1.25).toFixed(2));
    return Array.from({ length: FORECAST_MONTHS }, (_, i) => (
      i >= YEAR_3_START_MONTH ? year3Salary : null
    ));
  }

  return null;
}

export function withDefaultExpenseLineProfiles(
  overrides: MonthlyOverrides,
  expenseLines: ExpenseLine[],
): MonthlyOverrides {
  const nextExpenseOverrides = { ...overrides.expenseLines };
  for (const line of expenseLines) {
    const profile = buildExpenseLineProfileOverride(line);
    if (profile) nextExpenseOverrides[line.id] = profile;
  }
  return { ...overrides, expenseLines: nextExpenseOverrides };
}

export function buildDefaultExpenseLines(): ExpenseLine[] {
  return [
    { id: "rnd.achela",        category: CATEGORY_RND,   label: "Achela developer",                kind: "fixedUsd", amount: 9333,  protected: true },
    { id: "rnd.it",            category: CATEGORY_RND,   label: "IT / servers",                    kind: "fixedUsd", amount: 2000,  protected: true },
    { id: "rnd.ai",            category: CATEGORY_RND,   label: "AI tools",                        kind: "fixedUsd", amount: 2000,  protected: true },

    { id: LINE_CAMPAIGNS,      category: CATEGORY_MS,    label: "Campaigns",                       kind: "linkedCampaigns",         amount: 0,     protected: true },
    { id: "ms.campaignMgr",    category: CATEGORY_MS,    label: "Campaign manager",                kind: "fixedUsd", amount: 1500,  protected: true },
    { id: "ms.content",        category: CATEGORY_MS,    label: "Content creation",                kind: "fixedUsd", amount: 1500,  protected: true },
    { id: LINE_TRIPLE_BUNDLE,  category: CATEGORY_MS,    label: "Triple Bundle equipment",         kind: "calculatedTripleBundle",  amount: 70,    protected: true },

    { id: "ops.support",       category: CATEGORY_OPS,   label: "Customer support – Yaar",         kind: "fixedUsd", amount: 4000,  protected: true },
    { id: "ops.installations", category: CATEGORY_OPS,   label: "Online installation manager",     kind: "fixedUsd", amount: 3333,  protected: true },

    { id: LINE_CEO,            category: CATEGORY_MGMT,  label: "CEO – Maor",                      kind: "fixedUsd", amount: 5000,  protected: true },
    { id: LINE_COO,            category: CATEGORY_MGMT,  label: "COO – Elad",                      kind: "fixedUsd", amount: 5000,  protected: true },

    { id: "admin.bookkeeping", category: CATEGORY_ADMIN, label: "Bookkeeping",                     kind: "fixedUsd", amount: 1500,  protected: true },
    { id: LINE_VAT,            category: CATEGORY_ADMIN, label: "VAT Israel",                      kind: "calculatedVat",           amount: 0,     protected: true },
    { id: "admin.misc",        category: CATEGORY_ADMIN, label: "Miscellaneous / equipment",       kind: "fixedUsd", amount: 1000,  protected: true },
  ];
}

export function buildDefaultState(): BudgetState {
  const business: BusinessAssumptions = {
    startingSubscribers: 160,
    currentMrrUsd: 11000, // 33,000 ILS / 3
    churnRatePct: 3,
    israeliCustomers: 70,
    vatPct: 10,
  };
  const growth: GrowthAssumptions = {
    defaultCac: 300,
    defaultCampaignSpend: 5000,
  };
  const revenue: RevenueAssumptions = {
    defaultArpu: 68.75,
  };
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

/**
 * Bring any saved state (older localStorage rows or older database rows) up to
 * the current staged multi-year plan. We force the staged values onto the
 * `cac` / `arpu` / `campaignSpend` and staged salary overrides when the saved
 * state predates the current `PROFILE_VERSION` — including when the model
 * horizon has been extended or the payroll profile changes. Manual edits in
 * unrelated expense lines and other fields are preserved.
 */
export function migrateToCurrentProfile(state: BudgetState): BudgetState {
  if ((state.profileVersion ?? 0) >= PROFILE_VERSION) return state;
  const cacFallback = Number.isFinite(state.growth.defaultCac) ? state.growth.defaultCac : 300;
  const arpuFallback = Number.isFinite(state.revenue.defaultArpu) ? state.revenue.defaultArpu : 68.75;
  const campaignFallback = Number.isFinite(state.growth.defaultCampaignSpend)
    ? state.growth.defaultCampaignSpend
    : 5000;
  return {
    ...state,
    growth: {
      ...state.growth,
      defaultCac: 300,
      defaultCampaignSpend: 5000,
    },
    revenue: {
      ...state.revenue,
      defaultArpu: 68.75,
    },
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

// Derived helper: starting ARPU = currentMrrUsd / startingSubscribers.
export function derivedStartingArpu(b: BusinessAssumptions): number {
  if (!b.startingSubscribers || b.startingSubscribers <= 0) return 0;
  return b.currentMrrUsd / b.startingSubscribers;
}

// ── Persistence (database first, localStorage fallback) ─────────────

function num(v: unknown, fallback: number): number {
  const n = typeof v === "string" ? parseFloat(v) : (v as number);
  return typeof n === "number" && Number.isFinite(n) ? n : fallback;
}

function str(v: unknown, fallback: string): string {
  return typeof v === "string" && v.length > 0 ? v : fallback;
}

function readOverrideArr(v: unknown): MonthlyArr {
  const out = emptyOverrideArr();
  if (!Array.isArray(v)) return out;
  for (let i = 0; i < Math.min(v.length, FORECAST_MONTHS); i++) {
    const x = v[i];
    if (typeof x === "number" && Number.isFinite(x)) out[i] = x;
  }
  return out;
}

export function parseState(raw: unknown): BudgetState | null {
  if (!raw || typeof raw !== "object") return null;
  try {
    const def = buildDefaultState();
    const p = raw as Record<string, unknown>;
    const businessRaw = (p.business as Record<string, unknown>) || {};
    const growthRaw = (p.growth as Record<string, unknown>) || {};
    const revenueRaw = (p.revenue as Record<string, unknown>) || {};

    const business: BusinessAssumptions = {
      startingSubscribers: Math.max(0, num(businessRaw.startingSubscribers, def.business.startingSubscribers)),
      currentMrrUsd: Math.max(0, num(businessRaw.currentMrrUsd, def.business.currentMrrUsd)),
      churnRatePct: Math.max(0, num(businessRaw.churnRatePct, def.business.churnRatePct)),
      israeliCustomers: Math.max(0, num(businessRaw.israeliCustomers, def.business.israeliCustomers)),
      vatPct: Math.max(0, num(businessRaw.vatPct, def.business.vatPct)),
    };
    const growth: GrowthAssumptions = {
      defaultCac: Math.max(1, num(growthRaw.defaultCac, def.growth.defaultCac)),
      defaultCampaignSpend: Math.max(0, num(growthRaw.defaultCampaignSpend, def.growth.defaultCampaignSpend)),
    };
    const revenue: RevenueAssumptions = {
      defaultArpu: Math.max(0, num(revenueRaw.defaultArpu, def.revenue.defaultArpu)),
    };

    let categories = def.categories;
    if (Array.isArray(p.categories)) {
      const seen = new Set<string>();
      const out: string[] = [];
      for (const c of p.categories) {
        const s = str(c, "");
        if (s && !seen.has(s)) {
          seen.add(s);
          out.push(s);
        }
      }
      if (out.length > 0) categories = out;
    }

    let expenseLines = def.expenseLines;
    if (Array.isArray(p.expenseLines)) {
      const protectedTpl = new Map<string, ExpenseLine>();
      for (const l of def.expenseLines) protectedTpl.set(l.id, l);
      const validKinds = new Set<LineKind>(["fixedUsd", "linkedCampaigns", "calculatedTripleBundle", "calculatedVat"]);
      const out: ExpenseLine[] = [];
      const seenIds = new Set<string>();
      for (const rawLine of p.expenseLines) {
        if (!rawLine || typeof rawLine !== "object") continue;
        const r = rawLine as Record<string, unknown>;
        const id = str(r.id, `line-${Math.random().toString(36).slice(2, 8)}`);
        if (seenIds.has(id)) continue;
        seenIds.add(id);
        const tpl = protectedTpl.get(id);

        // For protected (built-in) lines we always trust the current default
        // for label / category / kind, so renamed lines or removed line kinds
        // (eg. "fixedIls" from older versions) get repaired automatically.
        // We still preserve the user's edited `amount`.
        if (tpl) {
          out.push({
            ...tpl,
            amount: num(r.amount, tpl.amount),
          });
          protectedTpl.delete(id);
          continue;
        }

        // User-added lines (no template) — sanitize kind to a known value.
        const rawKind = str(r.kind, "fixedUsd");
        const kind = (validKinds.has(rawKind as LineKind) ? rawKind : "fixedUsd") as LineKind;
        out.push({
          id,
          category: str(r.category, categories[0]),
          label: str(r.label, "Line"),
          kind,
          amount: num(r.amount, 0),
          protected: false,
        });
      }
      // Re-add any protected templates that weren't in saved data.
      for (const remaining of protectedTpl.values()) out.push(remaining);
      if (out.length > 0) expenseLines = out;
    }

    // Make sure every line's category exists.
    const inCats = new Set(categories);
    for (const l of expenseLines) {
      if (!inCats.has(l.category)) {
        categories = [...categories, l.category];
        inCats.add(l.category);
      }
    }

    const overridesRaw = (p.overrides as Record<string, unknown>) || {};
    const expenseOverridesRaw = (overridesRaw.expenseLines as Record<string, unknown>) || {};
    const expenseOverrides: Record<string, MonthlyArr> = {};
    for (const l of expenseLines) {
      expenseOverrides[l.id] = readOverrideArr(expenseOverridesRaw[l.id]);
    }
    const overrides: MonthlyOverrides = {
      cac: readOverrideArr(overridesRaw.cac),
      arpu: readOverrideArr(overridesRaw.arpu),
      campaignSpend: readOverrideArr(overridesRaw.campaignSpend),
      churnPct: readOverrideArr(overridesRaw.churnPct),
      expenseLines: expenseOverrides,
    };

    const profileVersionRaw = typeof p.profileVersion === "number" ? p.profileVersion : 0;

    return migrateToCurrentProfile({
      business,
      growth,
      revenue,
      categories,
      expenseLines,
      overrides,
      profileVersion: profileVersionRaw,
    });
  } catch {
    return null;
  }
}

export function purgeLegacyLocalState() {
  if (typeof window === "undefined") return;
  for (const key of LEGACY_STORAGE_KEYS) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* no-op */
    }
  }
}

export function loadLocalState(): BudgetState {
  if (typeof window === "undefined") return buildDefaultState();
  purgeLegacyLocalState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildDefaultState();
    return parseState(JSON.parse(raw)) ?? buildDefaultState();
  } catch {
    return buildDefaultState();
  }
}

export function saveLocalState(state: BudgetState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* no-op */
  }
}

export async function loadRemoteState(): Promise<{ state: BudgetState | null; persisted: boolean }> {
  const response = await fetch(FORECAST_API, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "x-salon-id": SALON_ID,
    },
  });
  if (!response.ok) throw new Error(`Failed to load forecast (${response.status})`);
  const data = await response.json();
  const parsed = parseState(data?.state);
  return { state: parsed, persisted: Boolean(data?.persisted) };
}

export async function saveRemoteState(state: BudgetState): Promise<{ persisted: boolean }> {
  const response = await fetch(FORECAST_API, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-salon-id": SALON_ID,
    },
    body: JSON.stringify({ state }),
  });
  if (!response.ok) throw new Error(`Failed to save forecast (${response.status})`);
  const data = await response.json();
  return { persisted: Boolean(data?.persisted) };
}

// ── Forecast engine ─────────────────────────────────────────────────

function effective(arr: MonthlyArr, fallback: number, i: number): number {
  const v = arr[i];
  return v === null || v === undefined ? fallback : v;
}

export function computeForecast(state: BudgetState): ForecastResult {
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

  const expensesByLine: Record<string, number[]> = {};
  for (const l of state.expenseLines) expensesByLine[l.id] = new Array(months).fill(0);
  const expensesByCategory: Record<string, number[]> = {};
  for (const c of state.categories) expensesByCategory[c] = new Array(months).fill(0);
  const totalExpenses = new Array(months).fill(0);
  const ebitda = new Array(months).fill(0);

  // Pre-collect Marketing & Sales fixed lines so we can budget the full
  // acquisition spend (campaigns + manager + content + any user-added M&S
  // row) per month before solving for new subscribers. The Triple Bundle
  // line is a per-new-subscriber cost (calculated below) and is therefore
  // intentionally excluded from the acquisition driver.
  const mAndSFixedLines = state.expenseLines.filter(
    (l) => l.category === CATEGORY_MS && l.kind === "fixedUsd",
  );

  for (let i = 0; i < months; i++) {
    cac[i] = Math.max(1, effective(state.overrides.cac, state.growth.defaultCac, i));
    arpu[i] = Math.max(0, effective(state.overrides.arpu, state.revenue.defaultArpu, i));
    campaignSpend[i] = Math.max(0, effective(state.overrides.campaignSpend, state.growth.defaultCampaignSpend, i));
    churnPct[i] = Math.max(0, effective(state.overrides.churnPct, state.business.churnRatePct, i)) / 100;

    // Total Marketing & Sales acquisition budget for the month.
    let acquisitionSpend = campaignSpend[i];
    for (const line of mAndSFixedLines) {
      const ovArr = state.overrides.expenseLines[line.id] ?? [];
      const ov = ovArr[i];
      const native = ov === null || ov === undefined ? line.amount : ov;
      acquisitionSpend += Math.max(0, native);
    }
    marketingAcquisitionSpend[i] = acquisitionSpend;

    const prevEnd = i === 0 ? state.business.startingSubscribers : subscribersEnd[i - 1];
    subscribersStart[i] = prevEnd;
    // New subscribers are driven by the FULL Marketing & Sales budget
    // for this month, not just the Campaigns line. Bigger marketing
    // budget → more users acquired at the same CAC.
    newSubscribers[i] = cac[i] > 0 ? acquisitionSpend / cac[i] : 0;
    churnedSubscribers[i] = subscribersStart[i] * churnPct[i];
    subscribersEnd[i] = subscribersStart[i] + newSubscribers[i] - churnedSubscribers[i];
    // Revenue earned in month i = end-of-month active subscribers × ARPU.
    // This directly wires the acquisition engine into revenue:
    // total Marketing & Sales budget ÷ CAC = new accounts, and those active
    // accounts × ARPU = the subscription revenue run-rate for the month.
    revenue[i] = subscribersEnd[i] * arpu[i];
    // ARR snapshot per month uses the run-rate going forward = end-of-month subs × ARPU × 12.
    arr[i] = subscribersEnd[i] * arpu[i] * 12;

    // Expense lines — produce USD value per month per line.
    for (const line of state.expenseLines) {
      const ovArr = state.overrides.expenseLines[line.id] ?? [];
      const ov = ovArr[i];
      let usd = 0;
      switch (line.kind) {
        case "fixedUsd": {
          const native = ov === null || ov === undefined ? line.amount : ov;
          usd = Math.max(0, native);
          break;
        }
        case "linkedCampaigns": {
          // Mirrors campaignSpend (already includes per-month override).
          usd = campaignSpend[i];
          break;
        }
        case "calculatedTripleBundle": {
          const unit = ov === null || ov === undefined ? line.amount : ov;
          usd = Math.max(0, newSubscribers[i] * unit);
          break;
        }
        case "calculatedVat": {
          const ratePct = ov === null || ov === undefined ? state.business.vatPct : ov;
          usd = Math.max(0, state.business.israeliCustomers * arpu[i] * (ratePct / 100));
          break;
        }
      }
      expensesByLine[line.id][i] = usd;
      if (expensesByCategory[line.category]) {
        expensesByCategory[line.category][i] += usd;
      }
      totalExpenses[i] += usd;
    }
    ebitda[i] = revenue[i] - totalExpenses[i];
  }

  return {
    cac, arpu, campaignSpend, marketingAcquisitionSpend, churnPct,
    subscribersStart, newSubscribers, churnedSubscribers, subscribersEnd,
    revenue, arr,
    expensesByLine, expensesByCategory, totalExpenses, ebitda,
  };
}

// ── Formatting helpers ──────────────────────────────────────────────

export const fmtUsd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
export const fmtUsd2 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const fmtNum0 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
export const fmtNum1 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

export const money = (v: number) => (Number.isFinite(v) ? fmtUsd.format(Math.round(v)) : "—");
export const money2 = (v: number) => (Number.isFinite(v) ? fmtUsd2.format(v) : "—");
export const int = (v: number) => (Number.isFinite(v) ? fmtNum0.format(Math.round(v)) : "—");
export const dec1 = (v: number) => (Number.isFinite(v) ? fmtNum1.format(v) : "—");
export const pct = (v: number) => (Number.isFinite(v) ? `${dec1(v)}%` : "—");

export const sum = (xs: number[]) => xs.reduce((s, v) => s + (Number.isFinite(v) ? v : 0), 0);
