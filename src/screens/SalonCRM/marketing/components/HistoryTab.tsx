import React, { useDeferredValue, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { useMarketing } from "../MarketingProvider";
import { messageCostCents } from "../engine";
import { addDays, formatMoney, isBefore, localDateKey } from "../time";
import { AUTOMATION_ORDER, PENDING_STATUSES, type MessageStatus, type ScheduledMessage } from "../types";
import { customerName, serviceNames, useMarketingCopy, useMarketingUi, when } from "./helpers";
import { Card, fmt, maskPhone, Pill, Segmented, SelectInput, SmallButton, StatusChip, useMk } from "./ui";

type ShowFilter = "all" | "planned" | "sent" | "notSent" | "failed";
const SHOW: ShowFilter[] = ["all", "planned", "sent", "notSent", "failed"];
const SHOW_STATUSES: Record<Exclude<ShowFilter, "all">, MessageStatus[]> = {
  planned: PENDING_STATUSES,
  sent: ["sent", "delivered", "unknown"],
  notSent: ["skipped", "cancelled"],
  failed: ["failed"],
};
type PeriodFilter = "all" | "today" | "7" | "30";
const PAGE = 60;

function plannedShown(message: ScheduledMessage): string {
  return PENDING_STATUSES.includes(message.status) ? message.scheduledFor : message.plannedFor;
}

function referenceTime(message: ScheduledMessage): string {
  return message.sentAt ?? (PENDING_STATUSES.includes(message.status) ? message.scheduledFor : message.updatedAt);
}

export const HistoryTab: React.FC = () => {
  const { m, lang } = useMarketingCopy();
  const mk = useMk();
  const ui = useMarketingUi();
  const { dataset, messages, now, timezone } = useMarketing();
  const [params, setParams] = useSearchParams();
  const [limit, setLimit] = useState(PAGE);

  const q = params.get("q") ?? "";
  const kind = params.get("kind") ?? "all";
  const rawShow = params.get("show") as ShowFilter | null;
  const show: ShowFilter = rawShow && SHOW.includes(rawShow) ? rawShow : "all";
  const period = (params.get("period") ?? "all") as PeriodFilter;
  const deferredQ = useDeferredValue(q);

  const setFilter = (key: string, value: string | null) =>
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (value === null || value === "" || value === "all") next.delete(key);
        else next.set(key, value);
        return next;
      },
      { replace: true },
    );

  const rows = useMemo(() => {
    const needle = deferredQ.trim().toLowerCase();
    const today = localDateKey(now, timezone);
    const filtered = messages.filter((message) => {
      if (message.reason === "merged_into") return false;
      if (kind !== "all" && message.automation !== kind) return false;
      if (show !== "all" && !SHOW_STATUSES[show].includes(message.status)) return false;
      const ref = referenceTime(message);
      if (period === "today" && localDateKey(ref, timezone) !== today) return false;
      if ((period === "7" || period === "30") && (isBefore(ref, addDays(now, -Number(period))) || isBefore(now, ref))) return false;
      if (needle) {
        const customer = dataset.customers.find((item) => item.id === message.customerId);
        const haystack = `${customer?.firstName ?? ""} ${customer?.lastName ?? ""} ${customer?.phone ?? ""} ${message.testPhone ?? ""}`.toLowerCase();
        const digits = needle.replace(/\D/g, "");
        if (!haystack.includes(needle) && !(digits && haystack.replace(/\D/g, "").includes(digits))) return false;
      }
      return true;
    });
    return filtered.sort((a, b) =>
      show === "planned" ? a.scheduledFor.localeCompare(b.scheduledFor) : referenceTime(b).localeCompare(referenceTime(a)),
    );
  }, [dataset.customers, deferredQ, kind, messages, now, period, show, timezone]);

  const anyFilter = q || kind !== "all" || show !== "all" || period !== "all";
  const visible = rows.slice(0, limit);

  const nameOf = (message: ScheduledMessage) =>
    message.isTest ? fmt(m.drawer.testTo, { phone: message.testPhone ?? "" }) : customerName(dataset, message.customerId, m.common.unknownCustomer);
  const phoneOf = (message: ScheduledMessage) =>
    maskPhone(message.isTest ? message.testPhone : dataset.customers.find((item) => item.id === message.customerId)?.phone);
  const visitOf = (message: ScheduledMessage) => {
    const appointment = dataset.appointments.find((item) => item.id === message.appointmentId);
    const services = serviceNames(dataset, message.serviceIds);
    return appointment ? `${services} · ${when(appointment.startTime, timezone, lang)}` : services || "—";
  };
  const costOf = (message: ScheduledMessage) => {
    const cents = messageCostCents(message);
    if (!message.sentAt) return message.estimatedCostCents ? `≈ ${formatMoney(message.estimatedCostCents, lang)}` : "—";
    return formatMoney(cents, lang);
  };
  const statusCell = (message: ScheduledMessage) =>
    message.projectedBlock ? (
      <Pill tone="warn">{m.statuses.skipped}</Pill>
    ) : (
      <StatusChip status={message.status} label={m.statuses[message.status]} />
    );

  return (
    <div className="space-y-3">
      <Card className="p-3">
        <div className="-mx-1 mb-2.5 overflow-x-auto px-1">
          <Segmented
            label={m.show.label}
            size="sm"
            value={show}
            onChange={(value) => setFilter("show", value)}
            options={SHOW.map((value) => ({ value, label: m.show[value] }))}
          />
        </div>
        <div className="grid gap-2 sm:grid-cols-3 sm:items-end lg:grid-cols-[minmax(0,1.6fr)_repeat(2,minmax(0,1fr))]">
          <label className="relative block">
            <span className="sr-only">{m.history.search}</span>
            <Search className={`pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 ${mk.textFaint}`} />
            <input
              type="search"
              value={q}
              onChange={(event) => setFilter("q", event.target.value)}
              placeholder={m.history.search}
              className={`h-10 w-full ps-9 ${mk.input}`}
            />
          </label>
          <SelectInput
            label={m.history.automation}
            hideLabel
            value={kind}
            onChange={(value) => setFilter("kind", value)}
            options={[{ value: "all", label: `${m.history.automation}: ${m.common.all}` }, ...AUTOMATION_ORDER.map((item) => ({ value: item, label: m.kinds[item].name }))]}
          />
          <SelectInput
            label={m.history.period}
            hideLabel
            value={period}
            onChange={(value) => setFilter("period", value)}
            options={[
              { value: "all", label: m.history.periodAll },
              { value: "today", label: m.history.periodToday },
              { value: "7", label: m.history.period7 },
              { value: "30", label: m.history.period30 },
            ]}
          />
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <p className={`text-[11px] ${mk.textSoft}`}>{fmt(m.history.count, { n: rows.length })}</p>
          {anyFilter && (
            <SmallButton
              onClick={() =>
                setParams(
                  (current) => {
                    const next = new URLSearchParams();
                    if (current.get("view")) next.set("view", current.get("view")!);
                    return next;
                  },
                  { replace: true },
                )
              }
            >
              {m.history.clear}
            </SmallButton>
          )}
        </div>
      </Card>

      {rows.length === 0 ? (
        <Card className="p-8 text-center">
          <p className={`text-[12.5px] ${mk.textSoft}`}>{anyFilter ? m.history.empty : m.history.emptySalon}</p>
        </Card>
      ) : (
        <>
          <Card className="hidden overflow-hidden md:block">
            <table className="w-full table-fixed text-start text-[12px]">
              <thead className={mk.subtleBg}>
                <tr className={`text-[10.5px] font-semibold ${mk.textSoft}`}>
                  <th className="w-[19%] px-3 py-2 text-start">{m.history.colCustomer}</th>
                  <th className="w-[15%] px-3 py-2 text-start">{m.history.colAutomation}</th>
                  <th className="hidden w-[22%] px-3 py-2 text-start xl:table-cell">{m.history.colVisit}</th>
                  <th className="w-[15%] px-3 py-2 text-start">{m.history.colPlanned}</th>
                  <th className="w-[13%] px-3 py-2 text-start">{m.history.colSent}</th>
                  <th className="w-[13%] px-3 py-2 text-start">{m.history.colStatus}</th>
                  <th className="hidden w-[6%] px-3 py-2 text-start lg:table-cell">{m.history.colUnits}</th>
                  <th className="w-[9%] px-3 py-2 text-start">{m.history.colCost}</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${mk.isDark ? "divide-white/[0.06]" : "divide-[#EFE3DA]"}`}>
                {visible.map((message) => (
                  <tr
                    key={message.id}
                    tabIndex={0}
                    onClick={() => ui.openMessage(message.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        ui.openMessage(message.id);
                      }
                    }}
                    className={`cursor-pointer align-top ${mk.hover} ${mk.focus}`}
                  >
                    <td className="px-3 py-2.5">
                      <p className={`truncate font-semibold ${mk.textStrong}`}>{nameOf(message)}</p>
                      <p className={`truncate text-[10.5px] ${mk.textFaint}`} dir="ltr">
                        {phoneOf(message)}
                      </p>
                    </td>
                    <td className={`px-3 py-2.5 ${mk.textStrong}`}>
                      <p className="truncate">{m.kinds[message.automation].short}</p>
                      {message.isTest && <Pill tone="info">{m.drawer.testBadge}</Pill>}
                    </td>
                    <td className={`hidden truncate px-3 py-2.5 xl:table-cell ${mk.textSoft}`}>{visitOf(message)}</td>
                    <td className={`px-3 py-2.5 tabular-nums ${mk.textSoft}`}>{when(plannedShown(message), timezone, lang)}</td>
                    <td className={`px-3 py-2.5 tabular-nums ${mk.textSoft}`}>{when(message.sentAt, timezone, lang)}</td>
                    <td className="px-3 py-2.5">{statusCell(message)}</td>
                    <td className={`hidden px-3 py-2.5 tabular-nums lg:table-cell ${mk.textSoft}`}>{message.segments ?? "—"}</td>
                    <td className={`px-3 py-2.5 tabular-nums ${mk.textSoft}`}>{costOf(message)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <ul className="space-y-2 md:hidden">
            {visible.map((message) => (
              <li key={message.id}>
                <button
                  type="button"
                  onClick={() => ui.openMessage(message.id)}
                  className={`w-full rounded-2xl border p-3 text-start ${mk.card} ${mk.focus}`}
                >
                  <span className="flex items-start gap-2">
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-[12.5px] font-semibold ${mk.textStrong}`}>{nameOf(message)}</span>
                      <span className={`block truncate text-[11px] ${mk.textSoft}`}>
                        {m.kinds[message.automation].short} · {visitOf(message)}
                      </span>
                    </span>
                    {statusCell(message)}
                  </span>
                  <span className={`mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-[10.5px] tabular-nums ${mk.textFaint}`}>
                    <span>
                      {m.history.colPlanned}: {when(plannedShown(message), timezone, lang)}
                    </span>
                    {message.sentAt && (
                      <span>
                        {m.history.colSent}: {when(message.sentAt, timezone, lang)}
                      </span>
                    )}
                    <span>{fmt(m.common.unitsShort, { n: message.segments ?? "—" })}</span>
                    <span>{costOf(message)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {rows.length > limit && (
            <div className="flex justify-center">
              <SmallButton onClick={() => setLimit((current) => current + PAGE)}>
                {fmt(m.history.count, { n: rows.length - limit })} +
              </SmallButton>
            </div>
          )}
        </>
      )}
    </div>
  );
};
