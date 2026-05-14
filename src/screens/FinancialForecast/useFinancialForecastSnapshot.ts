import { useEffect, useMemo, useState } from "react";
import {
  BudgetState,
  ForecastResult,
  FORECAST_MONTHS,
  MONTH_LABELS,
  CATEGORY_MS,
  buildDefaultState,
  computeForecast,
  loadLocalState,
  loadRemoteState,
} from "./forecast-model";

export type ForecastSnapshotStatus = "loading" | "remote" | "local" | "error";

export interface YearMilestone {
  year: 1 | 2 | 3;
  monthIdx: number; // last month of the year (e.g. 11, 23, 35)
  label: string;
  startSubscribers: number;
  endSubscribers: number;
  newSubscribers: number;
  churnedSubscribers: number;
  endingMrr: number;
  endingArr: number;
  totalRevenue: number;
  totalExpenses: number;
  totalEbitda: number;
  totalMarketingAcquisitionSpend: number;
  totalCampaignSpend: number;
  avgCac: number;
  avgArpu: number;
  avgChurnPct: number; // 0..100
  endingArpu: number;
}

export interface CategoryTotal {
  category: string;
  total: number;
}

export interface ForecastSnapshot {
  status: ForecastSnapshotStatus;
  state: BudgetState;
  forecast: ForecastResult;
  monthLabels: string[];
  // Topline / lifetime ----------------------------------------------------
  startingSubscribers: number;
  endingSubscribers: number;
  endingMrr: number;
  endingArr: number;
  totalNewSubscribers: number;
  totalChurnedSubscribers: number;
  totalRevenue: number;
  totalExpenses: number;
  totalEbitda: number;
  totalMarketingAcquisitionSpend: number;
  totalCampaignSpend: number;
  // Cash trajectory -------------------------------------------------------
  cumulativeEbitda: number[];
  /** Most negative cumulative EBITDA across the horizon (peak cash burn) */
  peakCashTroughUsd: number;
  peakCashTroughMonthIdx: number;
  /** First month where running EBITDA turns positive (-1 if never) */
  breakevenMonthIdx: number;
  breakevenMonthLabel: string | null;
  // Stage milestones -------------------------------------------------------
  yearMilestones: YearMilestone[];
  // Assumption ranges across the whole horizon ----------------------------
  cacRange: { min: number; max: number; avg: number; first: number; last: number };
  arpuRange: { min: number; max: number; avg: number; first: number; last: number };
  churnPctRange: { min: number; max: number; avg: number };
  // Spend bucket totals (sum across all months) ---------------------------
  expenseTotalsByCategory: CategoryTotal[];
  marketingTotalsByCategory: { campaigns: number; fixedMs: number; tripleBundle: number };
}

const YEAR_END_MONTHS = [11, 23, 35] as const;

function avg(xs: number[]): number {
  if (xs.length === 0) return 0;
  let total = 0;
  let count = 0;
  for (const v of xs) {
    if (Number.isFinite(v)) {
      total += v;
      count += 1;
    }
  }
  return count > 0 ? total / count : 0;
}

function rangeStats(xs: number[]) {
  if (xs.length === 0) return { min: 0, max: 0, avg: 0, first: 0, last: 0 };
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (const v of xs) {
    if (!Number.isFinite(v)) continue;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  return {
    min: Number.isFinite(min) ? min : 0,
    max: Number.isFinite(max) ? max : 0,
    avg: avg(xs),
    first: xs[0] ?? 0,
    last: xs[xs.length - 1] ?? 0,
  };
}

function sumRange(xs: number[], start: number, end: number): number {
  let total = 0;
  for (let i = start; i < end; i++) {
    const v = xs[i];
    if (Number.isFinite(v)) total += v;
  }
  return total;
}

function buildSnapshot(
  state: BudgetState,
  status: ForecastSnapshotStatus,
): ForecastSnapshot {
  const forecast = computeForecast(state);
  const last = FORECAST_MONTHS - 1;

  const cumulativeEbitda: number[] = new Array(FORECAST_MONTHS).fill(0);
  let running = 0;
  let peakCashTroughUsd = 0;
  let peakCashTroughMonthIdx = -1;
  for (let i = 0; i < FORECAST_MONTHS; i++) {
    running += Number.isFinite(forecast.ebitda[i]) ? forecast.ebitda[i] : 0;
    cumulativeEbitda[i] = running;
    if (running < peakCashTroughUsd) {
      peakCashTroughUsd = running;
      peakCashTroughMonthIdx = i;
    }
  }

  let breakevenMonthIdx = -1;
  for (let i = 0; i < FORECAST_MONTHS; i++) {
    if ((forecast.ebitda[i] ?? 0) > 0) {
      breakevenMonthIdx = i;
      break;
    }
  }
  const breakevenMonthLabel =
    breakevenMonthIdx >= 0 ? MONTH_LABELS[breakevenMonthIdx] ?? null : null;

  const yearMilestones: YearMilestone[] = YEAR_END_MONTHS.map((monthIdx, idx) => {
    const start = idx * 12;
    const end = monthIdx + 1;
    const startSubs = forecast.subscribersStart[start] ?? state.business.startingSubscribers;
    const endSubs = forecast.subscribersEnd[monthIdx] ?? startSubs;
    return {
      year: (idx + 1) as 1 | 2 | 3,
      monthIdx,
      label: MONTH_LABELS[monthIdx] ?? `Month ${monthIdx + 1}`,
      startSubscribers: startSubs,
      endSubscribers: endSubs,
      newSubscribers: sumRange(forecast.newSubscribers, start, end),
      churnedSubscribers: sumRange(forecast.churnedSubscribers, start, end),
      endingMrr: forecast.revenue[monthIdx] ?? 0,
      endingArr: forecast.arr[monthIdx] ?? 0,
      totalRevenue: sumRange(forecast.revenue, start, end),
      totalExpenses: sumRange(forecast.totalExpenses, start, end),
      totalEbitda: sumRange(forecast.ebitda, start, end),
      totalMarketingAcquisitionSpend: sumRange(forecast.marketingAcquisitionSpend, start, end),
      totalCampaignSpend: sumRange(forecast.campaignSpend, start, end),
      avgCac: avg(forecast.cac.slice(start, end)),
      avgArpu: avg(forecast.arpu.slice(start, end)),
      avgChurnPct: avg(forecast.churnPct.slice(start, end)) * 100,
      endingArpu: forecast.arpu[monthIdx] ?? 0,
    };
  });

  const expenseTotalsByCategory: CategoryTotal[] = Object.entries(
    forecast.expensesByCategory,
  ).map(([category, arr]) => ({
    category,
    total: arr.reduce((s, v) => s + (Number.isFinite(v) ? v : 0), 0),
  }));

  const campaignsLineId = state.expenseLines.find((l) => l.kind === "linkedCampaigns")?.id;
  const tripleLineId = state.expenseLines.find((l) => l.kind === "calculatedTripleBundle")?.id;
  const fixedMsLines = state.expenseLines.filter(
    (l) => l.category === CATEGORY_MS && l.kind === "fixedUsd",
  );
  const marketingTotalsByCategory = {
    campaigns:
      campaignsLineId && forecast.expensesByLine[campaignsLineId]
        ? forecast.expensesByLine[campaignsLineId].reduce(
            (s, v) => s + (Number.isFinite(v) ? v : 0),
            0,
          )
        : 0,
    fixedMs: fixedMsLines.reduce((total, line) => {
      const arr = forecast.expensesByLine[line.id] ?? [];
      return total + arr.reduce((s, v) => s + (Number.isFinite(v) ? v : 0), 0);
    }, 0),
    tripleBundle:
      tripleLineId && forecast.expensesByLine[tripleLineId]
        ? forecast.expensesByLine[tripleLineId].reduce(
            (s, v) => s + (Number.isFinite(v) ? v : 0),
            0,
          )
        : 0,
  };

  return {
    status,
    state,
    forecast,
    monthLabels: MONTH_LABELS,
    startingSubscribers: state.business.startingSubscribers,
    endingSubscribers: forecast.subscribersEnd[last] ?? state.business.startingSubscribers,
    endingMrr: forecast.revenue[last] ?? 0,
    endingArr: forecast.arr[last] ?? 0,
    totalNewSubscribers: forecast.newSubscribers.reduce(
      (s, v) => s + (Number.isFinite(v) ? v : 0),
      0,
    ),
    totalChurnedSubscribers: forecast.churnedSubscribers.reduce(
      (s, v) => s + (Number.isFinite(v) ? v : 0),
      0,
    ),
    totalRevenue: forecast.revenue.reduce((s, v) => s + (Number.isFinite(v) ? v : 0), 0),
    totalExpenses: forecast.totalExpenses.reduce((s, v) => s + (Number.isFinite(v) ? v : 0), 0),
    totalEbitda: forecast.ebitda.reduce((s, v) => s + (Number.isFinite(v) ? v : 0), 0),
    totalMarketingAcquisitionSpend: forecast.marketingAcquisitionSpend.reduce(
      (s, v) => s + (Number.isFinite(v) ? v : 0),
      0,
    ),
    totalCampaignSpend: forecast.campaignSpend.reduce(
      (s, v) => s + (Number.isFinite(v) ? v : 0),
      0,
    ),
    cumulativeEbitda,
    peakCashTroughUsd,
    peakCashTroughMonthIdx,
    breakevenMonthIdx,
    breakevenMonthLabel,
    yearMilestones,
    cacRange: rangeStats(forecast.cac),
    arpuRange: rangeStats(forecast.arpu),
    churnPctRange: rangeStats(forecast.churnPct.map((v) => v * 100)),
    expenseTotalsByCategory,
    marketingTotalsByCategory,
  };
}

/**
 * Live snapshot of the operating-budget forecast.
 *
 * Loads the same database row that the `/financial-forecast` page edits so
 * that any other view (notably the investor deck) renders the exact numbers
 * the founders are working with right now. Falls back to local storage and
 * then to the staged defaults so the deck always has something usable.
 */
export function useFinancialForecastSnapshot(): ForecastSnapshot {
  const [state, setState] = useState<BudgetState>(() => {
    if (typeof window === "undefined") return buildDefaultState();
    try {
      return loadLocalState();
    } catch {
      return buildDefaultState();
    }
  });
  const [status, setStatus] = useState<ForecastSnapshotStatus>("loading");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const remote = await loadRemoteState();
        if (cancelled) return;
        const next = remote.state ?? buildDefaultState();
        setState(next);
        setStatus(remote.persisted ? "remote" : "local");
      } catch {
        if (cancelled) return;
        setStatus((prev) => (prev === "loading" ? "local" : prev));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return useMemo(() => buildSnapshot(state, status), [state, status]);
}
