import React from "react";
import type { Channel, GtmResearchDataset } from "./types";
import type { AdminTokens } from "./theme";
import { DASH, EmptyNote, ils, num, pct, Pill, RetentionCell, Th } from "./ui";

function HighlightCard({
  label,
  channel,
  value,
  caption,
  at,
}: {
  label: string;
  channel: Channel | undefined;
  value: string;
  caption: string;
  at: AdminTokens;
}) {
  if (!channel) return null;
  return (
    <div className={`rounded-2xl border p-4 ${at.card}`}>
      <p className={`text-[11px] font-medium ${at.textMuted}`}>{label}</p>
      <div className="mt-2 flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: channel.color }} />
        <span className={`text-sm font-semibold ${at.textPrimary}`}>{channel.label}</span>
      </div>
      <p className={`mt-1 text-xl font-bold tracking-tight tabular-nums ${at.textPrimary}`}>{value}</p>
      <p className={`mt-0.5 text-[10px] ${at.textFaint}`}>{caption}</p>
    </div>
  );
}

export function ChannelComparison({
  data,
  at,
}: {
  data: GtmResearchDataset;
  at: AdminTokens;
}) {
  const byId = new Map(data.channels.map((channel) => [channel.id, channel]));
  const { highlights } = data;
  const salonChannels = data.channels.filter((channel) => !channel.excludeFromSalonKpis);
  const awaitingAny = salonChannels.some((channel) => channel.awaitingManualList);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <HighlightCard
          at={at}
          label="Best scalable"
          channel={byId.get(highlights.bestScalable || "")}
          value={`${num(byId.get(highlights.bestScalable || "")?.paidCustomers)} customers`}
          caption="Grew without adding founder hours"
        />
        <HighlightCard
          at={at}
          label="Best retention"
          channel={byId.get(highlights.bestRetention || "")}
          value={pct(byId.get(highlights.bestRetention || "")?.milestones.m6.retention)}
          caption="Still paying at six months"
        />
        <HighlightCard
          at={at}
          label="Lowest CAC"
          channel={byId.get(highlights.lowestCac || "")}
          value={ils(byId.get(highlights.lowestCac || "")?.cacIls)}
          caption="Lowest of the channels with measured spend"
        />
        <HighlightCard
          at={at}
          label="Weakest cohort"
          channel={byId.get(highlights.worstRetention || "")}
          value={pct(byId.get(highlights.worstRetention || "")?.milestones.m6.retention)}
          caption={`Lowest six-month retention above ${highlights.minCohortForHighlight} customers`}
        />
      </div>

      <div className={`rounded-2xl border overflow-hidden ${at.card}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b ${at.border}`}>
                <Th at={at}>Channel</Th>
                <Th at={at} align="right">Paid</Th>
                <Th at={at} align="right">Active</Th>
                <Th at={at}>3-mo retention</Th>
                <Th at={at}>6-mo retention</Th>
                <Th at={at}>12-mo retention</Th>
                <Th at={at} align="right">Rev / cust 12mo</Th>
                <Th at={at} align="right">Cost / customer</Th>
                <Th at={at}>Attribution</Th>
              </tr>
            </thead>
            <tbody className={`divide-y ${at.rowDivide}`}>
              {salonChannels.map((channel) => (
                <tr key={channel.id} className={`${at.rowHover} transition`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ background: channel.color }}
                      />
                      <span className={`font-medium ${at.textPrimary}`}>{channel.label}</span>
                      {channel.scalable && <Pill at={at} tone="info">scalable</Pill>}
                    </div>
                    {channel.awaitingManualList ? (
                      <div className="mt-1 text-[11px] text-amber-400">
                        Customer list still being reconstructed
                      </div>
                    ) : (
                      <div className={`mt-1 text-[11px] tabular-nums ${at.textFaint}`}>
                        {channel.firstPaidMonth} → {channel.lastPaidMonth}
                      </div>
                    )}
                  </td>
                  <td className={`px-4 py-3 text-right font-semibold tabular-nums ${at.textPrimary}`}>
                    {channel.awaitingManualList ? DASH : num(channel.paidCustomers)}
                  </td>
                  <td className={`px-4 py-3 text-right tabular-nums ${at.textSec}`}>
                    {channel.awaitingManualList ? (
                      DASH
                    ) : (
                      <>
                        {num(channel.active)}
                        {channel.activeShare != null && (
                          <span className={`ml-1 text-[11px] ${at.textFaint}`}>{pct(channel.activeShare)}</span>
                        )}
                      </>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {channel.awaitingManualList ? (
                      <span className={at.textDim}>{DASH}</span>
                    ) : (
                      <RetentionCell
                        at={at}
                        retention={channel.milestones.m3.retention}
                        eligible={channel.milestones.m3.eligibleCustomers}
                        color={channel.color}
                      />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {channel.awaitingManualList ? (
                      <span className={at.textDim}>{DASH}</span>
                    ) : (
                      <RetentionCell
                        at={at}
                        retention={channel.milestones.m6.retention}
                        eligible={channel.milestones.m6.eligibleCustomers}
                        color={channel.color}
                      />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {channel.awaitingManualList ? (
                      <span className={at.textDim}>{DASH}</span>
                    ) : (
                      <RetentionCell
                        at={at}
                        retention={channel.milestones.m12.retention}
                        eligible={channel.milestones.m12.eligibleCustomers}
                        color={channel.color}
                      />
                    )}
                  </td>
                  <td className={`px-4 py-3 text-right tabular-nums ${at.textPrimary}`}>
                    {channel.awaitingManualList ? DASH : ils(channel.milestones.m12.revenuePerCustomerIls)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {channel.awaitingManualList || channel.cacIls == null ? (
                      <span className={at.textDim}>{DASH}</span>
                    ) : channel.cacIls === 0 ? (
                      <span className={`text-xs ${at.textMuted}`}>No media spend</span>
                    ) : (
                      <>
                        <div className={`tabular-nums ${at.textPrimary}`}>{ils(channel.cacIls)}</div>
                        {channel.revenuePerCac != null && (
                          <div className={`text-[11px] ${at.textFaint}`}>{channel.revenuePerCac}x in 12mo</div>
                        )}
                        {channel.spendIsEstimate && (
                          <div className="text-[11px] text-amber-400">estimated spend</div>
                        )}
                      </>
                    )}
                  </td>
                  <td className={`px-4 py-3 text-[11px] tabular-nums ${at.textFaint}`}>
                    {channel.awaitingManualList ? (
                      DASH
                    ) : (
                      <>
                        {num(channel.confidenceBreakdown.high)} high · {num(channel.confidenceBreakdown.medium)} rule
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className={`text-xs ${at.textFaint}`}>
        Retention and revenue are measured at a fixed number of months after each customer&apos;s first payment.
      </p>
      {awaitingAny && (
        <EmptyNote at={at}>
          Channels marked as still being reconstructed have no customers attributed to them yet.
        </EmptyNote>
      )}
    </div>
  );
}
