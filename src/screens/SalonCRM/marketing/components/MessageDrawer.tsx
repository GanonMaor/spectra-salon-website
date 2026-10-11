import React, { useMemo } from "react";
import { useMarketing } from "../MarketingProvider";
import { isPending, messageCostCents, renderMessage } from "../engine";
import { formatMoney } from "../time";
import type { ScheduledMessage } from "../types";
import { PhonePreview } from "./PhonePreview";
import { customerName, languageName, reasonText, serviceNames, useMarketingCopy, useMarketingUi, when } from "./helpers";
import { Drawer, fmt, InlineNotice, maskPhone, Pill, SmallButton, StatusChip, useMk } from "./ui";

interface TimelineItem {
  at: string;
  label: string;
  detail?: string;
  tone: "neutral" | "good" | "bad" | "warn";
}

export const MessageDrawer: React.FC<{ messageId: string | null; onClose: () => void }> = ({ messageId, onClose }) => {
  const { m } = useMarketingCopy();
  const { messages } = useMarketing();
  const message = messageId ? messages.find((item) => item.id === messageId) : undefined;
  return (
    <Drawer
      open={Boolean(message)}
      onClose={onClose}
      title={message ? <DrawerTitle message={message} /> : ""}
      closeLabel={m.common.close}
      footer={message ? <DrawerFooter message={message} onClose={onClose} /> : undefined}
    >
      {message && <DrawerBody message={message} />}
    </Drawer>
  );
};

const DrawerTitle: React.FC<{ message: ScheduledMessage }> = ({ message }) => {
  const { m } = useMarketingCopy();
  return (
    <span className="flex flex-wrap items-center gap-2">
      {m.kinds[message.automation].name}
      {message.isTest && <Pill tone="info">{m.drawer.testBadge}</Pill>}
      {message.projectedBlock ? (
        <Pill tone="warn">{m.statuses.skipped}</Pill>
      ) : (
        <StatusChip status={message.status} label={m.statuses[message.status]} />
      )}
    </span>
  );
};

const DrawerFooter: React.FC<{ message: ScheduledMessage; onClose: () => void }> = ({ message, onClose }) => {
  const { m } = useMarketingCopy();
  const ui = useMarketingUi();
  const { mode, permissions, actions } = useMarketing();
  const persisted = mode === "demo" || message.isTest;
  return (
    <>
      {persisted && message.status === "paused" && permissions.canCancelMessages && (
        <SmallButton
          onClick={() => {
            const result = actions.resumeMessage(message.id);
            if (!result.ok) ui.notify(m.errors[result.error], "bad");
          }}
        >
          {m.drawer.resume}
        </SmallButton>
      )}
      {persisted && isPending(message.status) && permissions.canCancelMessages && (
        <SmallButton
          tone="danger"
          onClick={() => {
            const result = actions.cancelMessage(message.id);
            ui.notify(result.ok ? m.drawer.cancelled : m.errors[result.error], result.ok ? "good" : "bad");
          }}
        >
          {m.drawer.cancel}
        </SmallButton>
      )}
      <SmallButton onClick={onClose}>{m.common.close}</SmallButton>
    </>
  );
};

const DrawerBody: React.FC<{ message: ScheduledMessage }> = ({ message }) => {
  const { m, lang } = useMarketingCopy();
  const mk = useMk();
  const ui = useMarketingUi();
  const { state, dataset, timezone, actions } = useMarketing();
  const settings = state.settings;
  const customer = dataset.customers.find((item) => item.id === message.customerId);
  const appointment = dataset.appointments.find((item) => item.id === message.appointmentId);
  const reason = reasonText(m, message.reason, message.reasonDetail, settings, lang);

  const planned = useMemo(() => {
    if (message.sentBody) return null;
    return renderMessage({ dataset, settings }, message, state.automations[message.automation].published);
  }, [dataset, message, settings, state.automations]);

  const timeline = useMemo<TimelineItem[]>(() => {
    const items: TimelineItem[] = [
      { at: message.createdAt, label: m.drawer.created, detail: fmt(m.common.version, { n: message.scheduledSnapshot.automationVersion }), tone: "neutral" },
    ];
    if (message.scheduledFor !== message.plannedFor && (message.status === "deferred" || message.reason === "outside_send_window" || message.reason === "frequency_cap")) {
      items.push({
        at: message.updatedAt,
        label: fmt(m.drawer.deferredEvent, { when: when(message.scheduledFor, timezone, lang) }),
        detail: reason,
        tone: "warn",
      });
    }
    for (const attempt of message.attempts) {
      const label =
        attempt.outcome === "accepted"
          ? m.drawer.attemptAccepted
          : attempt.outcome === "timeout"
            ? m.drawer.attemptTimeout
            : attempt.outcome === "temporary_failure"
              ? m.drawer.attemptTemporary
              : m.drawer.attemptPermanent;
      items.push({
        at: attempt.at,
        label: `${fmt(m.drawer.attempt, { n: attempt.number })} · ${label}`,
        tone: attempt.outcome === "accepted" ? "good" : attempt.outcome === "timeout" ? "warn" : "bad",
      });
      if (attempt.reconciledAs && attempt.reconciledAt) {
        items.push({
          at: attempt.reconciledAt,
          label: attempt.reconciledAs === "delivered" ? m.drawer.reconciledDelivered : m.drawer.reconciledNotReceived,
          tone: attempt.reconciledAs === "delivered" ? "good" : "bad",
        });
      }
    }
    if (message.deliveredAt) items.push({ at: message.deliveredAt, label: m.drawer.deliveredEvent, tone: "good" });
    if (message.failedAt) items.push({ at: message.failedAt, label: m.drawer.failedEvent, detail: reason, tone: "bad" });
    if (message.status === "cancelled" || message.status === "skipped") {
      items.push({ at: message.updatedAt, label: m.drawer.stoppedEvent, detail: reason, tone: "neutral" });
    }
    return items.sort((a, b) => a.at.localeCompare(b.at));
  }, [lang, m, message, reason, timezone]);

  const cost = message.sentAt
    ? message.actualCostCents !== undefined
      ? fmt(m.drawer.costActual, { cost: formatMoney(messageCostCents(message), lang) })
      : fmt(m.drawer.costEstimated, { cost: formatMoney(message.estimatedCostCents ?? 0, lang) })
    : message.estimatedCostCents
      ? fmt(m.drawer.costEstimated, { cost: formatMoney(message.estimatedCostCents, lang) })
      : "—";

  const rows: [string, React.ReactNode][] = [
    [m.drawer.customer, message.isTest ? fmt(m.drawer.testTo, { phone: message.testPhone ?? "" }) : customerName(dataset, message.customerId, m.common.unknownCustomer)],
    [m.drawer.phone, <span dir="ltr">{maskPhone(message.isTest ? message.testPhone : customer?.phone)}</span>],
    [m.drawer.visit, appointment ? `${serviceNames(dataset, message.serviceIds)} · ${when(appointment.startTime, timezone, lang)}` : serviceNames(dataset, message.serviceIds) || "—"],
    [m.drawer.planned, when(message.plannedFor, timezone, lang)],
  ];
  if (isPending(message.status) && message.scheduledFor !== message.plannedFor) rows.push([m.drawer.nextTry, when(message.scheduledFor, timezone, lang)]);
  if (message.sentAt) rows.push([m.drawer.sentAt, when(message.sentAt, timezone, lang)]);
  if (message.deliveredAt) rows.push([m.drawer.deliveredAt, when(message.deliveredAt, timezone, lang)]);
  if (message.failedAt) rows.push([m.drawer.failedAt, when(message.failedAt, timezone, lang)]);
  rows.push([m.drawer.units, message.segments ?? "—"]);
  rows.push([m.drawer.cost, cost]);
  rows.push([m.drawer.versionUsed, fmt(m.common.version, { n: message.sentVersion ?? message.scheduledSnapshot.automationVersion })]);
  if (message.language) rows.push([m.drawer.language, languageName(m, message.language)]);

  const toneDot = { neutral: mk.isDark ? "bg-white/30" : "bg-[#C9B8AA]", good: "bg-[#5FA287]", bad: "bg-[#B05F57]", warn: "bg-[#E0A040]" };
  const mergedNames = message.mergedServiceIds?.length ? serviceNames(dataset, message.mergedServiceIds) : "";

  return (
    <div className="space-y-4">
      {reason && message.status !== "unknown" && (
        <InlineNotice tone={message.status === "failed" ? "bad" : message.status === "deferred" || message.status === "paused" ? "warn" : "info"}>
          {reason}
        </InlineNotice>
      )}
      {message.projectedBlock && (
        <InlineNotice tone="warn">
          {fmt(m.drawer.projectedBlock, { reason: reasonText(m, message.projectedBlock, undefined, settings, lang) })}
        </InlineNotice>
      )}
      {message.status === "unknown" && (
        <InlineNotice
          tone="info"
          title={reason}
          action={<SmallButton onClick={() => actions.reconcileMessage(message.id)}>{m.drawer.checkStatus}</SmallButton>}
        >
          {m.drawer.unknownNote}
        </InlineNotice>
      )}

      <section>
        <h3 className={`mb-2 text-[12px] font-semibold ${mk.textSoft}`}>{message.sentBody ? m.drawer.sentText : m.drawer.plannedText}</h3>
        <PhonePreview
          sender={settings.senderName}
          text={message.sentBody ?? planned?.render.text ?? message.scheduledSnapshot.bodyPreview}
          lang={message.language ?? planned?.lang ?? settings.defaultLanguage}
        />
        {!message.sentBody && <p className={`mt-2 text-[10.5px] leading-4 ${mk.textFaint}`}>{m.drawer.plannedTextNote}</p>}
        {mergedNames && <p className={`mt-2 text-[11px] ${mk.textSoft}`}>{fmt(m.drawer.mergedServices, { list: mergedNames })}</p>}
        {message.mergedInto && (
          <SmallButton className="mt-2" onClick={() => ui.openMessage(message.mergedInto!)}>
            {m.drawer.openMerged}
          </SmallButton>
        )}
      </section>

      <section>
        <h3 className={`mb-2 text-[12px] font-semibold ${mk.textSoft}`}>{m.drawer.details}</h3>
        <dl className={`divide-y rounded-xl border ${mk.cardSoft} ${mk.isDark ? "divide-white/[0.06]" : "divide-[#EFE3DA]"}`}>
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-3 px-3 py-2 text-[12px]">
              <dt className={mk.textSoft}>{label}</dt>
              <dd className={`min-w-0 text-end font-semibold tabular-nums ${mk.textStrong}`}>{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h3 className={`mb-2 text-[12px] font-semibold ${mk.textSoft}`}>{m.drawer.timeline}</h3>
        <ol className="space-y-2.5">
          {timeline.map((item, index) => (
            <li key={`${item.at}-${index}`} className="flex gap-2.5">
              <span aria-hidden className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${toneDot[item.tone]}`} />
              <div className="min-w-0">
                <p className={`text-[12px] font-semibold ${mk.textStrong}`}>{item.label}</p>
                <p className={`text-[10.5px] ${mk.textFaint}`}>{when(item.at, timezone, lang)}</p>
                {item.detail && <p className={`mt-0.5 text-[11px] leading-4 ${mk.textSoft}`}>{item.detail}</p>}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <details className={`rounded-xl border px-3 py-2 ${mk.cardSoft}`}>
        <summary className={`cursor-pointer text-[11.5px] font-semibold ${mk.textSoft}`}>{m.drawer.diagnostics}</summary>
        <p className={`mt-1 text-[10.5px] ${mk.textFaint}`}>{m.drawer.diagnosticsNote}</p>
        <pre dir="ltr" className={`mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-all rounded-lg p-2 text-[10px] leading-4 ${mk.subtleBg} ${mk.textSoft}`}>
          {JSON.stringify(
            {
              messageId: message.id,
              dedupeKey: message.dedupeKey,
              category: message.category,
              status: message.status,
              reason: message.reason,
              snapshot: message.scheduledSnapshot,
              attempts: message.attempts,
              mergedInto: message.mergedInto,
            },
            null,
            2,
          )}
        </pre>
      </details>
    </div>
  );
};
