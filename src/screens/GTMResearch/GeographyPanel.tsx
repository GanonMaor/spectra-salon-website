import React from "react";
import type { Channel, GeographyCountry, GeographyGroup } from "./types";
import type { AdminTokens } from "./theme";
import { DASH, ils, num, pct, Th } from "./ui";

const FLAGS: Record<string, string> = {
  ISRAEL: "🇮🇱",
  USA: "🇺🇸",
  UK: "🇬🇧",
  ITALY: "🇮🇹",
  GREECE: "🇬🇷",
  PORTUGAL: "🇵🇹",
  CANADA: "🇨🇦",
  NETHERLANDS: "🇳🇱",
  IRELAND: "🇮🇪",
  JAPAN: "🇯🇵",
  AUSTRALIA: "🇦🇺",
  BELARUS: "🇧🇾",
};

function ChannelMixBar({
  channels,
  mix,
  total,
  at,
}: {
  channels: Channel[];
  mix: { channelId: string; paidCustomers: number }[];
  total: number;
  at: AdminTokens;
}) {
  if (!total) return <span className={at.textDim}>{DASH}</span>;
  const byId = new Map(channels.map((channel) => [channel.id, channel]));
  return (
    <div className="min-w-[160px]">
      <div className={`flex h-2 w-full overflow-hidden rounded-full ${at.expandRow}`}>
        {mix.map((row) => (
          <div
            key={row.channelId}
            title={`${byId.get(row.channelId)?.label || row.channelId}: ${row.paidCustomers}`}
            style={{
              flex: row.paidCustomers,
              background: byId.get(row.channelId)?.color || "#cbd5e1",
            }}
          />
        ))}
      </div>
      <div className={`mt-1.5 flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] ${at.textFaint}`}>
        {mix.map((row) => (
          <span key={row.channelId} className="inline-flex items-center gap-1">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: byId.get(row.channelId)?.color || "#cbd5e1" }}
            />
            {byId.get(row.channelId)?.label || row.channelId} {row.paidCustomers}
          </span>
        ))}
      </div>
    </div>
  );
}

export function GeographyPanel({
  groups,
  countries,
  channels,
  at,
}: {
  groups: GeographyGroup[];
  countries: GeographyCountry[];
  channels: Channel[];
  at: AdminTokens;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {groups.map((group) => (
          <div key={group.id} className={`rounded-2xl border p-4 ${at.card}`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">{group.id === "IL" ? "🇮🇱" : "🌍"}</span>
              <span className={`text-sm font-semibold ${at.textPrimary}`}>{group.label}</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className={`text-2xl font-bold tracking-tight tabular-nums ${at.textPrimary}`}>
                  {num(group.paidCustomers)}
                </p>
                <p className={`text-[11px] font-medium mt-0.5 ${at.textMuted}`}>paying</p>
              </div>
              <div>
                <p className={`text-2xl font-bold tracking-tight tabular-nums ${at.textPrimary}`}>
                  {num(group.active)}
                </p>
                <p className={`text-[11px] font-medium mt-0.5 ${at.textMuted}`}>active</p>
              </div>
              <div>
                <p className={`text-2xl font-bold tracking-tight tabular-nums ${at.textPrimary}`}>
                  {pct(group.m6Retention)}
                </p>
                <p className={`text-[11px] font-medium mt-0.5 ${at.textMuted}`}>6mo retention</p>
              </div>
              <div>
                <p className={`text-2xl font-bold tracking-tight tabular-nums ${at.textPrimary}`}>
                  {ils(group.revenuePerCustomerM12Ils)}
                </p>
                <p className={`text-[11px] font-medium mt-0.5 ${at.textMuted}`}>rev / cust 12mo</p>
              </div>
            </div>
            <div className="mt-4">
              <ChannelMixBar at={at} channels={channels} mix={group.channels} total={group.paidCustomers} />
            </div>
          </div>
        ))}
      </div>

      <div className={`rounded-2xl border overflow-hidden ${at.card}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b ${at.border}`}>
                <Th at={at}>Country</Th>
                <Th at={at} align="right">Paid</Th>
                <Th at={at} align="right">Active</Th>
                <Th at={at} align="right">6mo retention</Th>
                <Th at={at} align="right">Rev / cust 12mo</Th>
                <Th at={at}>Channel mix</Th>
              </tr>
            </thead>
            <tbody className={`divide-y ${at.rowDivide}`}>
              {countries.map((country) => (
                <tr key={country.region} className={`${at.rowHover} transition`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span>{FLAGS[country.region] || (country.confirmed ? "🏳️" : "❔")}</span>
                      <span className={`font-medium ${at.textPrimary}`}>
                        {country.confirmed ? country.region : "Unconfirmed country"}
                      </span>
                    </div>
                    {!country.confirmed && (
                      <div className={`mt-1 text-[11px] ${at.textFaint}`}>counted as international</div>
                    )}
                  </td>
                  <td className={`px-4 py-3 text-right font-semibold tabular-nums ${at.textPrimary}`}>
                    {num(country.paidCustomers)}
                  </td>
                  <td className={`px-4 py-3 text-right tabular-nums ${at.textSec}`}>{num(country.active)}</td>
                  <td className={`px-4 py-3 text-right tabular-nums ${at.textSec}`}>{pct(country.m6Retention)}</td>
                  <td className={`px-4 py-3 text-right tabular-nums ${at.textPrimary}`}>
                    {ils(country.revenuePerCustomerM12Ils)}
                  </td>
                  <td className="px-4 py-3">
                    <ChannelMixBar
                      at={at}
                      channels={channels}
                      mix={country.channels}
                      total={country.paidCustomers}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
