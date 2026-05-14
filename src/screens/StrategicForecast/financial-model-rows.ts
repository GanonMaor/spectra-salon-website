// ─────────────────────────────────────────────────────────────────────
// Financial Model Rows Generator
//
// Turns a `StrategicForecastResult` into a flat list of audit-friendly
// rows that can be rendered in a spreadsheet-style table (one row per
// metric, one column per month). Both the strategic-forecast page and
// the investor deck drawer can consume the same generated rows so that
// the chart, KPI cards, and the audit table never disagree.
// ─────────────────────────────────────────────────────────────────────

import {
  STRATEGIC_FORECAST_MONTHS,
  STRATEGIC_MONTH_LABELS,
  STRATEGIC_CATEGORY_RND,
  STRATEGIC_CATEGORY_MS,
  STRATEGIC_CATEGORY_OPS,
  STRATEGIC_CATEGORY_MGMT,
  STRATEGIC_CATEGORY_ADMIN,
  computeStrategicForecast,
} from "./strategic-forecast-model";
import type {
  StrategicAssumptions,
  StrategicForecastResult,
} from "./strategic-forecast-model";

export type FinancialModelRowFormat = "currency" | "number" | "percent" | "text";

export interface FinancialModelRow {
  section: string;
  metric: string;
  formula: string;
  values: number[]; // length === months in the model
  format: FinancialModelRowFormat;
  emphasize?: boolean;
}

export interface FinancialModelMonth {
  monthIndex: number;
  label: string;
  shortLabel: string;
  year: number;
  monthOfYear: number;
}

export interface FinancialModelSummary {
  months: number;
  startingSubscribers: number;
  endingSubscribers: number;
  endingMrr: number;
  endingArr: number;
  totalRevenue: number;
  totalExpenses: number;
  cumulativeEbitda: number;
  breakevenMonthIdx: number;
  breakevenMonthLabel: string | null;
  maxCashTroughUsd: number;
  maxCashTroughMonthIdx: number;
  maxCashTroughMonthLabel: string | null;
  safetyBufferUsd: number;
  seedInvestment: number;
  yearMilestones: {
    year: number;
    monthIdx: number;
    label: string;
    endSubscribers: number;
    endingMrr: number;
    endingArr: number;
    totalRevenue: number;
    totalEbitda: number;
    avgCac: number;
  }[];
}

export interface FinancialModelBundle {
  forecast: StrategicForecastResult;
  months: FinancialModelMonth[];
  rows: FinancialModelRow[];
  summary: FinancialModelSummary;
}

// ── Formatting helpers ───────────────────────────────────────────────

const fmtUsd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const fmtNum = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const fmtNum1 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

export function formatCurrencyFull(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return fmtUsd.format(Math.round(value));
}

export function formatCurrencyShort(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000_000) return `${sign}$${fmtNum1.format(abs / 1_000_000_000)}B`;
  if (abs >= 1_000_000) return `${sign}$${fmtNum1.format(abs / 1_000_000)}M`;
  if (abs >= 1_000) return `${sign}$${fmtNum.format(abs / 1_000)}K`;
  return `${sign}$${fmtNum.format(abs)}`;
}

export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return fmtNum.format(Math.round(value));
}

export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return `${fmtNum1.format(value * 100)}%`;
}

export function formatCell(value: number, format: FinancialModelRowFormat): string {
  switch (format) {
    case "currency":
      return formatCurrencyFull(value);
    case "number":
      return formatNumber(value);
    case "percent":
      return formatPercent(value);
    case "text":
    default:
      return String(value);
  }
}

// ── Month axis helpers ───────────────────────────────────────────────

export function buildFinancialModelMonths(months = STRATEGIC_FORECAST_MONTHS): FinancialModelMonth[] {
  return Array.from({ length: months }, (_, i) => ({
    monthIndex: i,
    label: STRATEGIC_MONTH_LABELS[i] ?? `M${i + 1}`,
    shortLabel: `M${i + 1}`,
    year: Math.floor(i / 12) + 1,
    monthOfYear: (i % 12) + 1,
  }));
}

// ── Row builder ──────────────────────────────────────────────────────

interface RowSpec {
  section: string;
  metric: string;
  formula: string;
  values: number[];
  format?: FinancialModelRowFormat;
  emphasize?: boolean;
}

function row(spec: RowSpec): FinancialModelRow {
  return {
    section: spec.section,
    metric: spec.metric,
    formula: spec.formula,
    values: spec.values,
    format: spec.format ?? "currency",
    emphasize: spec.emphasize ?? false,
  };
}

export function generateFinancialModelRows(
  state: StrategicAssumptions,
  forecast: StrategicForecastResult,
): FinancialModelRow[] {
  const rows: FinancialModelRow[] = [];

  // ── Customer Base ──
  const cb = "Customer Base";
  rows.push(row({ section: cb, metric: "Starting subscribers", formula: "Previous month ending subscribers", values: forecast.subscribersStart, format: "number" }));
  rows.push(row({ section: cb, metric: "Gross new subscribers", formula: "Annual gross-new × monthly ramp weight", values: forecast.newSalons, format: "number" }));
  rows.push(row({ section: cb, metric: "Churned subscribers", formula: "Starting subs × monthly churn", values: forecast.churnedSalons, format: "number" }));
  rows.push(row({ section: cb, metric: "Net new subscribers", formula: "Gross new − churned", values: forecast.newSalons.map((v, i) => v - (forecast.churnedSalons[i] ?? 0)), format: "number" }));
  rows.push(row({ section: cb, metric: "Ending subscribers", formula: "Starting + new − churned", values: forecast.subscribersEnd, format: "number", emphasize: true }));
  rows.push(row({ section: cb, metric: "Average active subscribers", formula: "(Starting + Ending) / 2", values: forecast.averageActiveSalons, format: "number" }));
  rows.push(row({ section: cb, metric: "Cumulative gross new subscribers", formula: "Σ gross new from month 1", values: forecast.cumulativeNewSalons, format: "number" }));

  // ── Subscription Mix ──
  const mix = "Subscription Mix";
  for (const profile of state.profiles) {
    const series = forecast.byProfile[profile.id];
    if (!series) continue;
    rows.push(row({ section: mix, metric: `${profile.displayName} subscribers`, formula: `Active subs × ${profile.mixPct}% mix`, values: series.customers, format: "number" }));
  }

  // ── Base SaaS Revenue ──
  const sect = (label: string) => label;
  const base = sect("Base SaaS Revenue");
  for (const profile of state.profiles) {
    const series = forecast.byProfile[profile.id];
    if (!series) continue;
    const introNote = (profile.basePriceStartMonth ?? 1) > 1
      ? `Intro $${profile.introBasePrice ?? 0}/mo until M${profile.basePriceStartMonth}, then $${profile.basePrice}/mo`
      : `Subs × $${profile.basePrice}/mo`;
    rows.push(row({
      section: base,
      metric: `${profile.displayName} SaaS revenue`,
      formula: introNote,
      values: series.baseSubMrr,
    }));
  }
  rows.push(row({ section: base, metric: "Total Base SaaS revenue", formula: "Sum of all profiles · per-profile intro pricing applied", values: forecast.baseSaasMrr, emphasize: true }));

  // ── AI Booking Revenue ──
  const aiStartMonth = state.aiStartMonth ?? 13;
  const aiRampMonths = state.aiRampMonths ?? 12;
  const aiLaunchNote = `Launches month ${aiStartMonth}, ramps to full over ${aiRampMonths} months`;
  const aib = sect("AI Booking Revenue");
  for (const profile of state.profiles) {
    const series = forecast.byProfile[profile.id];
    if (!series) continue;
    rows.push(row({
      section: aib,
      metric: `${profile.displayName} AI Booking revenue`,
      formula: `Subs × ${(profile.aiBookingAdoption * 100).toFixed(0)}% adoption × $${profile.aiBookingPrice}/mo · ${aiLaunchNote}`,
      values: series.aiBookingMrr,
    }));
  }
  rows.push(row({ section: aib, metric: "Total AI Booking revenue", formula: `Sum of all profiles · ${aiLaunchNote}`, values: forecast.aiBookingMrr, emphasize: true }));

  // ── AI Credits Revenue ──
  const aic = sect("AI Credits Revenue");
  for (const profile of state.profiles) {
    const series = forecast.byProfile[profile.id];
    if (!series) continue;
    rows.push(row({
      section: aic,
      metric: `${profile.displayName} AI Credits revenue`,
      formula: `Subs × ${(profile.aiCreditsAdoption * 100).toFixed(0)}% adoption × $${profile.aiCreditsPrice}/mo · ${aiLaunchNote}`,
      values: series.aiCreditsMrr,
    }));
  }
  rows.push(row({ section: aic, metric: "Total AI Credits revenue", formula: `Sum of all profiles · ${aiLaunchNote}`, values: forecast.aiCreditsMrr, emphasize: true }));

  // ── POS Revenue ──
  const pos = sect("POS Revenue");
  const posStartMonth = state.posStartMonth ?? 18;
  const posRampMonths = state.posRampMonths ?? 12;
  const posLaunchNote = `Launches month ${posStartMonth}, ramps to full over ${posRampMonths} months`;
  for (const profile of state.profiles) {
    const series = forecast.byProfile[profile.id];
    if (!series) continue;
    rows.push(row({
      section: pos,
      metric: `${profile.displayName} POS revenue`,
      formula: `Subs × ${(profile.posAdoption * 100).toFixed(0)}% adoption × $${profile.posSalonRevenue.toLocaleString()}/mo × ${(state.posTakeRate * 100).toFixed(2)}% take · ${posLaunchNote}`,
      values: series.posMrr,
    }));
  }
  rows.push(row({ section: pos, metric: "Total POS revenue", formula: `Sum of all profiles · ${posLaunchNote}`, values: forecast.posMrr, emphasize: true }));
  // Payment volume (informational)
  const paymentVolume = forecast.byProfile && Object.values(forecast.byProfile).reduce((acc: number[], series) => {
    for (let i = 0; i < series.posPaymentVolume.length; i++) acc[i] = (acc[i] ?? 0) + series.posPaymentVolume[i];
    return acc;
  }, new Array(forecast.posMrr.length).fill(0));
  rows.push(row({ section: pos, metric: "POS payment volume (info)", formula: "Sum of profile payment volumes", values: paymentVolume }));

  // ── Data Revenue ──
  const data = sect("Data Revenue");
  for (const segment of state.dataSegments) {
    const series = forecast.byDataSegment[segment.id];
    if (!series) continue;
    rows.push(row({
      section: data,
      metric: `${segment.displayName} revenue`,
      formula: `Data customers × ${segment.mixPct}% × $${segment.monthlyPrice.toLocaleString()}/mo`,
      values: series.mrr,
    }));
  }
  rows.push(row({ section: data, metric: "Total Data revenue", formula: "Sum of all data segments", values: forecast.dataMrr, emphasize: true }));

  // ── Marketplace Affiliate Revenue ──
  const market = sect("Marketplace Revenue");
  const marketStartMonth = state.marketplaceStartMonth ?? 25;
  const marketRampMonths = state.marketplaceRampMonths ?? 12;
  const marketLaunchNote = `Launches month ${marketStartMonth}, ramps to full over ${marketRampMonths} months`;
  const marketSpend = state.marketplaceSpendPerColorist ?? 0;
  const marketTakePct = ((state.marketplaceTakeRate ?? 0) * 100).toFixed(1);
  const marketMarginPct = ((state.marketplaceGrossMargin ?? 0) * 100).toFixed(0);

  for (const profile of state.profiles) {
    const series = forecast.byProfile[profile.id];
    if (!series) continue;
    rows.push(row({
      section: market,
      metric: `${profile.displayName} active colorists`,
      formula: `Subs × ${profile.marketplaceColorists} colorists × activation ramp`,
      values: series.marketplaceColoristsActive,
      format: "number",
    }));
  }
  for (const profile of state.profiles) {
    const series = forecast.byProfile[profile.id];
    if (!series) continue;
    rows.push(row({
      section: market,
      metric: `${profile.displayName} marketplace GMV`,
      formula: `Active colorists × $${marketSpend.toLocaleString()}/mo · ${marketLaunchNote}`,
      values: series.marketplaceGmv,
    }));
  }
  for (const profile of state.profiles) {
    const series = forecast.byProfile[profile.id];
    if (!series) continue;
    rows.push(row({
      section: market,
      metric: `${profile.displayName} marketplace revenue`,
      formula: `${profile.displayName} GMV × ${marketTakePct}% affiliate take`,
      values: series.marketplaceRevenue,
    }));
  }
  rows.push(row({
    section: market,
    metric: "Total marketplace GMV",
    formula: `Sum of profiles · Active colorists × $${marketSpend.toLocaleString()}/mo · ${marketLaunchNote}`,
    values: forecast.marketplaceGmv,
    emphasize: true,
  }));
  rows.push(row({
    section: market,
    metric: "Total marketplace revenue",
    formula: `Total GMV × ${marketTakePct}% affiliate take`,
    values: forecast.marketplaceRevenue,
    emphasize: true,
  }));
  rows.push(row({
    section: market,
    metric: "Marketplace gross profit",
    formula: `Marketplace revenue × ${marketMarginPct}% margin`,
    values: forecast.marketplaceGrossProfit,
  }));

  // ── Hardware ──
  const hw = sect("Hardware (non-recurring)");
  const hardwareStartYear = state.hardwareStartYear ?? 3;
  const hardwareNote = `Sales begin Year ${hardwareStartYear}; one-time per new salon`;
  rows.push(row({ section: hw, metric: "Hardware units sold", formula: hardwareNote, values: Object.values(forecast.byProfile).reduce((acc: number[], series) => {
    for (let i = 0; i < series.hardwareUnits.length; i++) acc[i] = (acc[i] ?? 0) + series.hardwareUnits[i];
    return acc;
  }, new Array(forecast.hardwareRevenue.length).fill(0)), format: "number" }));
  rows.push(row({ section: hw, metric: "Hardware revenue", formula: `Units × $${state.hardwarePrice}`, values: forecast.hardwareRevenue }));
  rows.push(row({ section: hw, metric: "Hardware COGS", formula: `Units × $${state.hardwareCost}`, values: forecast.hardwareCogs }));
  rows.push(row({ section: hw, metric: "Hardware gross profit", formula: "Revenue − COGS", values: forecast.hardwareGrossProfit, emphasize: true }));

  // ── Total Revenue & ARR ──
  const tot = sect("Total Revenue");
  rows.push(row({ section: tot, metric: "Recurring revenue (MRR)", formula: "Base + AI Booking + AI Credits + POS + Data + Marketplace", values: forecast.recurringMrr, emphasize: true }));
  rows.push(row({ section: tot, metric: "Total revenue", formula: "Recurring + Hardware", values: forecast.totalRevenue, emphasize: true }));
  rows.push(row({ section: tot, metric: "ARR run-rate", formula: "Recurring MRR × 12", values: forecast.recurringArr, emphasize: true }));

  // ── Customer Acquisition ──
  const ca = sect("Customer Acquisition");
  rows.push(row({ section: ca, metric: "Blended CAC", formula: "Acquisition spend ÷ gross new", values: forecast.blendedCac }));
  rows.push(row({ section: ca, metric: "Acquisition spend", formula: "Σ profile (gross new × CAC)", values: forecast.acquisitionSpend }));
  rows.push(row({ section: ca, metric: "Gross new subscribers", formula: "Annual target / ramp weights", values: forecast.newSalons, format: "number" }));
  rows.push(row({ section: ca, metric: "Cumulative gross new subscribers", formula: "Σ gross new from month 1", values: forecast.cumulativeNewSalons, format: "number" }));

  // ── Costs / OPEX ──
  const opex = sect("Costs / OPEX");
  for (const cat of [STRATEGIC_CATEGORY_MS, STRATEGIC_CATEGORY_RND, STRATEGIC_CATEGORY_OPS, STRATEGIC_CATEGORY_MGMT, STRATEGIC_CATEGORY_ADMIN]) {
    rows.push(row({
      section: opex,
      metric: cat,
      formula: cat === STRATEGIC_CATEGORY_MS
        ? "Annual budget × ramp + acquisition spend"
        : "Annual budget × monthly ramp weight",
      values: forecast.opexByCategory[cat] ?? new Array(forecast.totalOpex.length).fill(0),
    }));
  }
  rows.push(row({ section: opex, metric: "Total expenses", formula: "Sum of all categories", values: forecast.totalOpex, emphasize: true }));

  // ── EBITDA & Cash ──
  const cash = sect("EBITDA & Cash");
  rows.push(row({ section: cash, metric: "Total revenue", formula: "From above", values: forecast.totalRevenue }));
  rows.push(row({ section: cash, metric: "Total expenses", formula: "From above", values: forecast.totalOpex }));
  rows.push(row({ section: cash, metric: "EBITDA", formula: "Gross profit − total opex", values: forecast.ebitda, emphasize: true }));
  rows.push(row({ section: cash, metric: "Cumulative EBITDA", formula: "Σ EBITDA from month 1", values: forecast.cumulativeEbitda }));
  rows.push(row({ section: cash, metric: "Cash balance", formula: `$${(state.seedInvestment ?? 0).toLocaleString()} seed + cumulative EBITDA`, values: forecast.cashBalance, emphasize: true }));

  return rows;
}

// ── Summary ──────────────────────────────────────────────────────────

export function generateFinancialModelSummary(
  forecast: StrategicForecastResult,
): FinancialModelSummary {
  const months = forecast.monthLabels.length;
  const last = months - 1;
  const monthLabel = (idx: number) =>
    idx >= 0 && idx < months ? forecast.monthLabels[idx] ?? null : null;

  const yearMilestones = forecast.yearly.map((y) => ({
    year: y.year,
    monthIdx: y.endMonth - 1,
    label: monthLabel(y.endMonth - 1) ?? `Year ${y.year}`,
    endSubscribers: y.endingSalons,
    endingMrr: y.endingMrr,
    endingArr: y.endingArr,
    totalRevenue: y.totalRevenue,
    totalEbitda: y.ebitda,
    avgCac: (() => {
      const start = y.startMonth;
      const end = y.endMonth;
      let totalSpend = 0;
      let totalGross = 0;
      for (let i = start; i < end; i++) {
        totalSpend += forecast.acquisitionSpend[i] ?? 0;
        totalGross += forecast.newSalons[i] ?? 0;
      }
      return totalGross > 0 ? totalSpend / totalGross : 0;
    })(),
  }));

  const totalRevenue = forecast.totalRevenue.reduce((s, v) => s + (Number.isFinite(v) ? v : 0), 0);
  const totalExpenses = forecast.totalOpex.reduce((s, v) => s + (Number.isFinite(v) ? v : 0), 0);

  return {
    months,
    startingSubscribers: forecast.subscribersStart[0] ?? 0,
    endingSubscribers: forecast.subscribersEnd[last] ?? 0,
    endingMrr: forecast.recurringMrr[last] ?? 0,
    endingArr: forecast.recurringArr[last] ?? 0,
    totalRevenue,
    totalExpenses,
    cumulativeEbitda: forecast.cumulativeEbitda[last] ?? 0,
    breakevenMonthIdx: forecast.breakevenMonthIdx,
    breakevenMonthLabel: monthLabel(forecast.breakevenMonthIdx),
    maxCashTroughUsd: forecast.maxCashTroughUsd,
    maxCashTroughMonthIdx: forecast.maxCashTroughMonthIdx,
    maxCashTroughMonthLabel: monthLabel(forecast.maxCashTroughMonthIdx),
    safetyBufferUsd: forecast.safetyBufferUsd,
    seedInvestment: forecast.seedInvestment,
    yearMilestones,
  };
}

export function generateFinancialModel(state: StrategicAssumptions): FinancialModelBundle {
  const forecast = computeStrategicForecast(state);
  return {
    forecast,
    months: buildFinancialModelMonths(forecast.monthLabels.length),
    rows: generateFinancialModelRows(state, forecast),
    summary: generateFinancialModelSummary(forecast),
  };
}
