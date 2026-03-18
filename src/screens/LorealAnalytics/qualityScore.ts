import { QualityConfig, QualityColor, QualityScore, DEFAULT_QUALITY_CONFIG } from "./types";
import { MONTH_NAMES_SHORT } from "./data";

function siToSeq(si: number): number {
  const year = Math.floor(si / 100);
  const month = si % 100;
  return year * 12 + month;
}

function labelToSi(label: string): number {
  const parts = label.split(" ");
  if (parts.length !== 2) return 0;
  const mIdx = MONTH_NAMES_SHORT.indexOf(parts[0]);
  const year = parseInt(parts[1], 10);
  if (mIdx < 0 || isNaN(year)) return 0;
  return year * 100 + (mIdx + 1);
}

interface SlimRow { mk: string; si: number; svc: number; }

/**
 * Compute a quality score (0–100) for a single user's rows within a given eligibility window.
 * The score is based on:
 *   - Presence: how many months in the window the user was active
 *   - Consistency: how stable their month-over-month volume was
 * Both dimensions use thresholds from the configurable QualityConfig.
 */
export function computeUserQualityScore(
  userRows: SlimRow[],
  windowStartLabel: string,
  windowEndLabel: string,
  config: Partial<QualityConfig> = {}
): QualityScore {
  const cfg: QualityConfig = { ...DEFAULT_QUALITY_CONFIG, ...config };

  if (!userRows.length) {
    return { score: 0, color: "gray", presenceRatio: 0, consistencyRatio: 0, activeMonths: 0, totalPossibleMonths: 0 };
  }

  const windowStartSi = labelToSi(windowStartLabel);
  const windowEndSi   = labelToSi(windowEndLabel);
  if (windowStartSi <= 0 || windowEndSi <= 0) {
    return { score: 0, color: "gray", presenceRatio: 0, consistencyRatio: 0, activeMonths: 0, totalPossibleMonths: 0 };
  }

  const windowStartSeq = siToSeq(windowStartSi);
  const windowEndSeq   = siToSeq(windowEndSi);
  if (windowEndSeq < windowStartSeq) {
    return { score: 0, color: "gray", presenceRatio: 0, consistencyRatio: 0, activeMonths: 0, totalPossibleMonths: 0 };
  }

  const totalPossibleMonths = windowEndSeq - windowStartSeq + 1;

  // Build monthly service totals within the window
  const monthlyServices: Record<number, number> = {};
  for (const r of userRows) {
    const s = siToSeq(r.si);
    if (s >= windowStartSeq && s <= windowEndSeq) {
      monthlyServices[s] = (monthlyServices[s] || 0) + r.svc;
    }
  }

  const allSeqs: number[] = [];
  for (let s = windowStartSeq; s <= windowEndSeq; s++) allSeqs.push(s);

  // Presence
  const activeSeqs = allSeqs.filter((s) => (monthlyServices[s] || 0) > 0);
  const presenceRatio = activeSeqs.length / totalPossibleMonths;

  // Consistency (within active months)
  let consistentCredit = 0;
  let totalChecked = 0;

  for (let i = 0; i < allSeqs.length; i++) {
    const s = allSeqs[i];
    const svc = monthlyServices[s] || 0;
    if (svc === 0) continue;

    if (totalChecked === 0) {
      consistentCredit++;
      totalChecked++;
      continue;
    }

    let prevSvc = 0;
    for (let j = i - 1; j >= 0; j--) {
      const ps = monthlyServices[allSeqs[j]] || 0;
      if (ps > 0) { prevSvc = ps; break; }
    }

    if (prevSvc > 0) {
      const deviation = Math.abs(svc - prevSvc) / prevSvc;
      if (deviation <= cfg.goodDeviationPct) {
        consistentCredit += 1;
      } else if (deviation <= cfg.partialDeviationPct) {
        consistentCredit += cfg.partialCreditFraction;
      } else {
        consistentCredit += cfg.lowCreditFraction;
      }
    } else {
      consistentCredit += 1;
    }
    totalChecked++;
  }

  const consistencyRatio = totalChecked > 0 ? consistentCredit / totalChecked : 0;
  const score = Math.min(100, Math.round(
    (presenceRatio * cfg.presenceWeight + consistencyRatio * cfg.consistencyWeight) * 100
  ));

  let color: QualityColor;
  if (score >= cfg.greenMinScore) color = "green";
  else if (score >= cfg.amberMinScore) color = "amber";
  else if (score > 0) color = "red";
  else color = "gray";

  return { score, color, presenceRatio, consistencyRatio, activeMonths: activeSeqs.length, totalPossibleMonths };
}
