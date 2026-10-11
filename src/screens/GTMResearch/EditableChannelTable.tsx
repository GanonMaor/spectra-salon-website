import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Search,
  XCircle,
} from "lucide-react";
import type {
  Channel,
  ChannelCustomer,
  CustomerStatus,
  GtmResearchDataset,
} from "./types";
import type { AdminTokens } from "./theme";
import { DASH, ils, pct, usd } from "./ui";

const STORAGE_KEY = "spectra.gtm.customer-status-overrides.v1";
const PROFITABILITY_ORDER = [
  "door_to_door",
  "organic",
  "word_of_mouth",
  "advocate",
  "meta",
  "expo",
  "schwarzkopf",
];

const VERDICTS: Record<string, { title: string; detail: string }> = {
  door_to_door: {
    title: "Best customer quality",
    detail: "Strong revenue and retention; founder-time intensive.",
  },
  organic: {
    title: "Best retention",
    detail: "High-quality customers from a small cohort.",
  },
  word_of_mouth: {
    title: "Best capital efficiency",
    detail: "Good retention with no paid media.",
  },
  advocate: {
    title: "Credibility + content",
    detail: "Seeded the first US customers and UGC.",
  },
  meta: {
    title: "Best scalable volume",
    detail: "Fast acquisition with lower customer quality.",
  },
  expo: {
    title: "Market opener",
    detail: "Low retention, with strategic downstream value.",
  },
  schwarzkopf: {
    title: "Strategic access",
    detail: "Salon attribution is still incomplete.",
  },
};

type EditableStatus = Extract<CustomerStatus, "active" | "churned">;
type StatusFilter = "all" | EditableStatus;
type StatusOverrides = Record<string, EditableStatus>;

function readOverrides(): StatusOverrides {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
    if (!parsed || typeof parsed !== "object") return {};
    return Object.fromEntries(
      Object.entries(parsed).filter(
        ([, value]) => value === "active" || value === "churned",
      ),
    ) as StatusOverrides;
  } catch {
    return {};
  }
}

function customerKey(channelId: string, customer: ChannelCustomer): string {
  return `${channelId}:${customer.customerId || customer.name}`;
}

function compactIls(value: number | null | undefined): string {
  if (value == null) return DASH;
  if (Math.abs(value) >= 1000) {
    return `₪${(value / 1000).toLocaleString("en-US", {
      minimumFractionDigits: value >= 100000 ? 0 : 1,
      maximumFractionDigits: 1,
    })}K`;
  }
  return ils(value);
}

function effectiveStatus(
  channelId: string,
  customer: ChannelCustomer,
  overrides: StatusOverrides,
): CustomerStatus {
  return overrides[customerKey(channelId, customer)] || customer.status;
}

function StatusIcon({ status }: { status: CustomerStatus }) {
  if (status === "active") {
    return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  }
  return <XCircle className="h-4 w-4 text-rose-400" />;
}

function CustomerList({
  channel,
  customers,
  overrides,
  onStatusChange,
  onReset,
  at,
}: {
  channel: Channel;
  customers: ChannelCustomer[];
  overrides: StatusOverrides;
  onStatusChange: (customer: ChannelCustomer, status: EditableStatus) => void;
  onReset: (customer: ChannelCustomer) => void;
  at: AdminTokens;
}) {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return customers.filter((customer) => {
      const status = effectiveStatus(channel.id, customer, overrides);
      if (filter !== "all" && status !== filter) return false;
      if (!normalizedQuery) return true;
      return `${customer.name} ${customer.region}`
        .toLocaleLowerCase()
        .includes(normalizedQuery);
    });
  }, [channel.id, customers, filter, overrides, query]);

  const counts = useMemo(
    () => ({
      active: customers.filter(
        (customer) => effectiveStatus(channel.id, customer, overrides) === "active",
      ).length,
      churned: customers.filter(
        (customer) => effectiveStatus(channel.id, customer, overrides) === "churned",
      ).length,
    }),
    [channel.id, customers, overrides],
  );

  return (
    <div className={`border-t p-4 sm:p-5 ${at.border} ${at.expandRow}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {([
            ["all", `All ${customers.length}`],
            ["active", `Active ${counts.active}`],
            ["churned", `Churned ${counts.churned}`],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                filter === value ? at.filterActive : at.filterInactive
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <label className="relative block w-full sm:w-72">
          <Search className={`absolute left-3 top-2.5 h-4 w-4 ${at.textFaint}`} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search customer or country"
            className={`w-full rounded-lg border py-2 pl-9 pr-3 text-sm outline-none ring-0 ${at.input}`}
          />
        </label>
      </div>

      <div className={`mt-4 overflow-hidden rounded-xl border ${at.border}`}>
        <div
          className={`grid grid-cols-[minmax(210px,1fr)_110px_105px_105px_120px_170px] gap-3 border-b px-4 py-2 text-[10px] font-semibold uppercase tracking-wide ${at.border} ${at.textFaint}`}
        >
          <span>Customer</span>
          <span>Country</span>
          <span>First paid</span>
          <span>Last paid</span>
          <span className="text-right">Revenue</span>
          <span>Status</span>
        </div>

        <div className={`max-h-[430px] overflow-y-auto divide-y ${at.rowDivide}`}>
          {filtered.map((customer) => {
            const key = customerKey(channel.id, customer);
            const status = effectiveStatus(channel.id, customer, overrides);
            const isLocallyOverridden = overrides[key] != null;
            return (
              <div
                key={key}
                className={`grid grid-cols-[minmax(210px,1fr)_110px_105px_105px_120px_170px] items-center gap-3 px-4 py-2.5 text-xs ${at.rowHover}`}
              >
                <div className="min-w-0">
                  <div className={`flex items-center gap-2 font-medium ${at.textPrimary}`}>
                    <StatusIcon status={status} />
                    <span className="truncate">{customer.name}</span>
                  </div>
                  <div className={`mt-0.5 pl-6 text-[10px] ${at.textFaint}`}>
                    {isLocallyOverridden
                      ? "Edited on this device"
                      : customer.statusSource === "manual"
                        ? "Confirmed manually"
                        : "From billing"}
                  </div>
                </div>
                <span className={at.textSec}>{customer.region}</span>
                <span className={`tabular-nums ${at.textSec}`}>{customer.firstPaidMonth || DASH}</span>
                <span className={`tabular-nums ${at.textSec}`}>{customer.lastPaidMonth || DASH}</span>
                <span className={`text-right font-medium tabular-nums ${at.textPrimary}`}>
                  {ils(customer.lifetimeRevenueIls)}
                </span>
                <div className="flex items-center gap-1.5">
                  <select
                    aria-label={`Status for ${customer.name}`}
                    value={status === "active" ? "active" : "churned"}
                    onChange={(event) =>
                      onStatusChange(customer, event.target.value as EditableStatus)
                    }
                    className={`min-w-0 flex-1 rounded-lg border px-2 py-1.5 text-xs outline-none ${at.select}`}
                    style={{ backgroundColor: at.selectBg }}
                  >
                    <option value="active">Active</option>
                    <option value="churned">Churned</option>
                  </select>
                  {isLocallyOverridden && (
                    <button
                      type="button"
                      onClick={() => onReset(customer)}
                      title="Restore source status"
                      className={`rounded-md p-1.5 ${at.toggleBtn}`}
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {!filtered.length && (
            <div className={`px-4 py-8 text-center text-sm ${at.textFaint}`}>
              No customers match this filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function EditableChannelTable({
  data,
  at,
  onActiveTotalChange,
}: {
  data: GtmResearchDataset;
  at: AdminTokens;
  onActiveTotalChange?: (active: number) => void;
}) {
  const [expandedChannel, setExpandedChannel] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<StatusOverrides>(readOverrides);

  const channels = useMemo(
    () =>
      data.channels
        .filter((channel) => !channel.excludeFromSalonKpis)
        .slice()
        .sort((a, b) => {
          const aRank = PROFITABILITY_ORDER.indexOf(a.id);
          const bRank = PROFITABILITY_ORDER.indexOf(b.id);
          return (aRank < 0 ? 999 : aRank) - (bRank < 0 ? 999 : bRank);
        }),
    [data.channels],
  );

  const activeTotal = useMemo(
    () =>
      channels.reduce(
        (total, channel) =>
          total +
          (data.channelCustomers[channel.id] || []).filter(
            (customer) =>
              effectiveStatus(channel.id, customer, overrides) === "active",
          ).length,
        0,
      ),
    [channels, data.channelCustomers, overrides],
  );

  useEffect(() => {
    onActiveTotalChange?.(activeTotal);
  }, [activeTotal, onActiveTotalChange]);

  const persist = (next: StatusOverrides) => {
    setOverrides(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // The table still updates for this session when storage is unavailable.
    }
  };

  const setStatus = (
    channelId: string,
    customer: ChannelCustomer,
    status: EditableStatus,
  ) => {
    const key = customerKey(channelId, customer);
    const next = { ...overrides };
    if (status === customer.status) delete next[key];
    else next[key] = status;
    persist(next);
  };

  const resetStatus = (channelId: string, customer: ChannelCustomer) => {
    const next = { ...overrides };
    delete next[customerKey(channelId, customer)];
    persist(next);
  };

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className={`text-lg font-semibold ${at.textPrimary}`}>Channel economics</h2>
          <p className={`mt-1 text-xs ${at.textMuted}`}>
            Ranked by observed customer economics. Select a channel to review every customer.
          </p>
        </div>
        <p className={`text-[11px] ${at.textFaint}`}>
          Status corrections are saved on this device and update the counts immediately.
        </p>
      </div>

      <div className={`overflow-hidden rounded-2xl border ${at.card}`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] text-sm">
            <thead>
              <tr className={`border-b ${at.border} ${at.filterPanel}`}>
                {[
                  "Channel / window",
                  "Paid / active",
                  "M12 retention",
                  "Revenue",
                  "Lifetime value",
                  "Current ARR",
                  "CAC",
                  "What it proved",
                ].map((label) => (
                  <th
                    key={label}
                    className={`px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wide ${at.textFaint}`}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${at.rowDivide}`}>
              {channels.map((channel) => {
                const customers = data.channelCustomers[channel.id] || [];
                const active = customers.filter(
                  (customer) =>
                    effectiveStatus(channel.id, customer, overrides) === "active",
                ).length;
                const isExpanded = expandedChannel === channel.id;
                const verdict = VERDICTS[channel.id];
                return (
                  <React.Fragment key={channel.id}>
                    <tr className={`${at.rowHover} transition`}>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedChannel(isExpanded ? null : channel.id)
                          }
                          className="flex w-full items-center gap-3 text-left"
                          aria-expanded={isExpanded}
                        >
                          <span
                            className="h-9 w-1 shrink-0 rounded-full"
                            style={{ backgroundColor: channel.color }}
                          />
                          <span className="min-w-0 flex-1">
                            <span className={`block font-medium ${at.textPrimary}`}>
                              {channel.label}
                            </span>
                            <span className={`mt-0.5 block text-[10px] ${at.textFaint}`}>
                              {channel.firstPaidMonth || channel.campaigns[0]?.windowFrom || DASH}
                              {" → "}
                              {channel.lastPaidMonth ||
                                channel.campaigns[channel.campaigns.length - 1]?.windowTo ||
                                "today"}
                            </span>
                          </span>
                          {isExpanded ? (
                            <ChevronUp className={`h-4 w-4 ${at.textFaint}`} />
                          ) : (
                            <ChevronDown className={`h-4 w-4 ${at.textFaint}`} />
                          )}
                        </button>
                      </td>
                      <td className={`px-4 py-3 font-medium tabular-nums ${at.textPrimary}`}>
                        {channel.awaitingManualList ? DASH : `${customers.length} / ${active}`}
                      </td>
                      <td className={`px-4 py-3 tabular-nums ${at.textSec}`}>
                        {pct(channel.milestones.m12.retention)}
                      </td>
                      <td className={`px-4 py-3 font-medium tabular-nums ${at.textPrimary}`}>
                        {compactIls(channel.lifetimeRevenueIls)}
                      </td>
                      <td className={`px-4 py-3 tabular-nums ${at.textSec}`}>
                        {ils(channel.revenuePerCustomerLifetimeIls)}
                      </td>
                      <td className={`px-4 py-3 font-medium tabular-nums ${at.textPrimary}`}>
                        {compactIls(channel.currentArrIls)}
                        {channel.arrCoveredActiveCustomers < active && (
                          <span className={`ml-1 text-[10px] ${at.textFaint}`}>minimum</span>
                        )}
                      </td>
                      <td className={`px-4 py-3 ${at.textSec}`}>
                        {channel.cacUsd == null
                          ? DASH
                          : channel.cacUsd === 0
                            ? "No media"
                            : usd(channel.cacUsd)}
                      </td>
                      <td className="px-4 py-3">
                        <div className={`text-xs font-medium ${at.textPrimary}`}>
                          {verdict?.title || DASH}
                        </div>
                        <div className={`mt-0.5 text-[10px] ${at.textFaint}`}>
                          {verdict?.detail}
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={8} className="p-0">
                          {customers.length ? (
                            <CustomerList
                              channel={channel}
                              customers={customers}
                              overrides={overrides}
                              onStatusChange={(customer, status) =>
                                setStatus(channel.id, customer, status)
                              }
                              onReset={(customer) => resetStatus(channel.id, customer)}
                              at={at}
                            />
                          ) : (
                            <div className={`p-6 text-sm ${at.textMuted}`}>
                              The salon list for this channel has not been reconstructed yet.
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
