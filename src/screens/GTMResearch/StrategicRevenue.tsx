import React from "react";
import type { StrategicRevenueStream } from "./types";
import type { AdminTokens } from "./theme";
import { DASH, ils, Pill, Th, usd } from "./ui";

const KIND_COPY: Record<string, string> = {
  distributor: "Distributor",
  brand: "Brand",
  salon: "Salon",
};

export function StrategicRevenue({
  streams,
  totalIls,
  at,
}: {
  streams: StrategicRevenueStream[];
  totalIls: number;
  at: AdminTokens;
}) {
  return (
    <div className={`rounded-2xl border overflow-hidden ${at.card}`}>
      <div className={`flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b ${at.border}`}>
        <p className={`text-sm font-semibold ${at.textPrimary}`}>Revenue outside salon cohorts</p>
        <p className={`text-sm font-semibold tabular-nums ${at.textPrimary}`}>{ils(totalIls)}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className={`border-b ${at.border}`}>
              <Th at={at}>Revenue stream</Th>
              <Th at={at}>Type</Th>
              <Th at={at}>Period</Th>
              <Th at={at} align="right">Revenue</Th>
              <Th at={at} align="right">USD</Th>
            </tr>
          </thead>
          <tbody className={`divide-y ${at.rowDivide}`}>
            {streams.map((stream) => (
              <tr key={stream.id} className={`${at.rowHover} transition`}>
                <td className="px-4 py-3">
                  <div className={`font-medium ${at.textPrimary}`}>{stream.label}</div>
                  <div className={`mt-0.5 max-w-lg text-xs leading-snug ${at.textMuted}`}>{stream.note}</div>
                  {!stream.inSummitBilling && (
                    <div className="mt-1.5">
                      <Pill at={at} tone="caution">billed outside Summit</Pill>
                    </div>
                  )}
                </td>
                <td className={`px-4 py-3 ${at.textSec}`}>
                  {KIND_COPY[stream.kind] || stream.kind}
                  {stream.region && <div className={`mt-0.5 text-[11px] ${at.textFaint}`}>{stream.region}</div>}
                </td>
                <td className={`whitespace-nowrap px-4 py-3 tabular-nums ${at.textFaint}`}>
                  {stream.firstPaidMonth === stream.lastPaidMonth
                    ? stream.firstPaidMonth || DASH
                    : `${stream.firstPaidMonth} → ${stream.lastPaidMonth}`}
                </td>
                <td className={`px-4 py-3 text-right font-semibold tabular-nums ${at.textPrimary}`}>
                  {ils(stream.revenueIls)}
                </td>
                <td className={`px-4 py-3 text-right tabular-nums ${at.textFaint}`}>{usd(stream.revenueUsd)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
