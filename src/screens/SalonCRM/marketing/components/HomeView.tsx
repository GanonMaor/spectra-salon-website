import React, { useMemo, useState } from "react";
import { AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { useMarketing } from "../MarketingProvider";
import { futureMetrics, periodMetrics, type MarketingAlert } from "../metrics";
import { formatMoney, startOfLocalMonth } from "../time";
import { AUTOMATION_ORDER, type AutomationKind } from "../types";
import { actionAlert, describeTiming, rebookingNeedsSetup, useMarketingCopy, useMarketingUi } from "./helpers";
import { KIND_ICONS } from "./icons";
import { Card, fmt, Pill, Segmented, SmallButton, Toggle, useMk } from "./ui";

type Period = "month" | "30" | "90";

export const HomeView: React.FC = () => (
  <div className="space-y-4">
    <AttentionRow />
    <Numbers />
    <AutomationList />
  </div>
);

const AttentionRow: React.FC = () => {
  const { m, isRTL } = useMarketingCopy();
  const mk = useMk();
  const ui = useMarketingUi();
  const { alerts, permissions } = useMarketing();
  const alert = actionAlert(alerts);
  if (!alert) return null;
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const content: Record<string, { text: string; action: string; run: () => void }> = {
    sms_not_connected: { text: m.home.smsNotConnected, action: m.home.connect, run: ui.openSettings },
    budget_paused: { text: fmt(m.home.budgetPaused, { count: alert.count }), action: m.home.settings, run: ui.openSettings },
    failed_recent: { text: fmt(m.home.failed, { count: alert.count }), action: m.home.review, run: () => ui.openHistory({ show: "failed" }) },
    missing_variables: { text: fmt(m.home.missing, { count: alert.count }), action: m.home.review, run: () => ui.openHistory({ show: "notSent" }) },
  };
  const row = content[(alert as MarketingAlert).kind];
  if (!row) return null;
  const settingsAction = alert.kind === "sms_not_connected" || alert.kind === "budget_paused";

  return (
    <div
      role="status"
      className={`flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border px-3.5 py-2.5 ${
        mk.isDark ? "border-amber-300/20 bg-amber-400/[0.07]" : "border-[#F9B95C]/45 bg-[#FFF6E8]"
      }`}
    >
      <AlertCircle className={`h-4 w-4 shrink-0 ${mk.isDark ? "text-amber-300" : "text-[#B7781F]"}`} aria-hidden />
      <p className={`min-w-0 flex-1 text-[12.5px] font-medium ${mk.isDark ? "text-white/85" : "text-[#5E4216]"}`}>{row.text}</p>
      {(!settingsAction || permissions.canManageSettings) && (
        <SmallButton onClick={row.run}>
          {row.action} <Arrow className="h-3.5 w-3.5" />
        </SmallButton>
      )}
    </div>
  );
};

const Numbers: React.FC = () => {
  const { m, lang } = useMarketingCopy();
  const mk = useMk();
  const { messages, now, timezone } = useMarketing();
  const [period, setPeriod] = useState<Period>("month");

  const activity = useMemo(
    () => periodMetrics(messages, now, period === "month" ? { from: startOfLocalMonth(now, timezone) } : Number(period)),
    [messages, now, period, timezone],
  );
  const planned = useMemo(() => futureMetrics(messages, now), [messages, now]);
  const plannedCount = planned.scheduled + planned.deferred + planned.paused;

  const items = [
    { label: m.home.sent, value: String(activity.sent) },
    { label: m.home.planned, value: String(plannedCount), hint: m.home.plannedHint },
    { label: m.home.cost, value: formatMoney(activity.actualCostCents, lang) },
  ];

  return (
    <Card as="section" className="p-4 sm:p-5">
      <div className="flex items-center justify-end">
        <Segmented
          label={m.home.periodLabel}
          size="sm"
          value={period}
          onChange={setPeriod}
          options={[
            { value: "month", label: m.home.thisMonth },
            { value: "30", label: m.home.last30 },
            { value: "90", label: m.home.last90 },
          ]}
        />
      </div>
      <dl className={`mt-3 grid grid-cols-3 divide-x rtl:divide-x-reverse ${mk.isDark ? "divide-white/10" : "divide-[#EFE3DA]"}`}>
        {items.map((item) => (
          <div key={item.label} className="min-w-0 px-2 first:ps-0 last:pe-0 sm:px-5">
            <dt className={`text-[11.5px] font-semibold leading-4 ${mk.textSoft}`}>{item.label}</dt>
            <dd className={`mt-1 text-[22px] font-bold leading-7 tabular-nums tracking-tight sm:text-[26px] ${mk.textStrong}`}>{item.value}</dd>
            {item.hint && <dd className={`text-[10.5px] leading-4 ${mk.textFaint}`}>{item.hint}</dd>}
          </div>
        ))}
      </dl>
    </Card>
  );
};

const AutomationList: React.FC = () => {
  const { m } = useMarketingCopy();
  const mk = useMk();
  const ui = useMarketingUi();
  const { state, permissions, actions } = useMarketing();

  const toggle = (kind: AutomationKind, enabled: boolean) => {
    if (enabled && rebookingNeedsSetup(state.automations[kind])) {
      ui.openEditor(kind);
      return;
    }
    const result = actions.setEnabled(kind, enabled);
    if (!result.ok) {
      ui.notify(result.error === "interval_required" ? m.editor.rebookingEnableBlocked : m.errors[result.error], "bad");
      return;
    }
    ui.notify(enabled ? m.editor.toggledOn : fmt(m.editor.toggledOff, { count: result.count ?? 0 }));
  };

  return (
    <Card as="section" className="px-2 py-2 sm:px-3">
      <h2 className={`px-2 pb-1 pt-2 text-[14px] font-bold ${mk.textStrong}`}>{m.home.automationsTitle}</h2>
      <ul className={`divide-y ${mk.isDark ? "divide-white/[0.06]" : "divide-[#EFE3DA]"}`}>
        {AUTOMATION_ORDER.map((kind) => {
          const automation = state.automations[kind];
          const Icon = KIND_ICONS[kind];
          const needsSetup = rebookingNeedsSetup(automation);
          return (
            <li key={kind} className="flex items-center gap-2 px-1 py-2.5 sm:gap-3 sm:px-2">
              <button
                type="button"
                onClick={() => ui.openEditor(kind)}
                className={`flex min-h-0 min-w-0 flex-1 items-center gap-3 rounded-xl p-1 text-start ${mk.focus}`}
              >
                <span
                  className={`hidden h-9 w-9 shrink-0 place-items-center rounded-xl min-[380px]:grid ${
                    mk.isDark ? "bg-white/10 text-white/70" : "bg-[#F8E5D8] text-[#B05F57]"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="min-w-0">
                  <span className={`block text-[13.5px] font-semibold leading-5 ${mk.textStrong}`}>{m.kinds[kind].name}</span>
                  <span className={`block text-[12px] leading-5 ${mk.textSoft}`}>{describeTiming(m, kind, automation.published)}</span>
                </span>
              </button>
              <Toggle
                checked={automation.enabled}
                label={`${m.editor.enabledLabel}: ${m.kinds[kind].name}`}
                disabled={!permissions.canToggle}
                onChange={(next) => toggle(kind, next)}
              />
              <span className="flex shrink-0 items-center gap-1.5">
                {automation.draft && (
                  <span title={m.home.draftLabel} className="inline-flex">
                    <span className="sr-only">{m.home.draftLabel}</span>
                    <span aria-hidden className={`h-2 w-2 rounded-full sm:hidden ${mk.isDark ? "bg-sky-300" : "bg-[#6398A9]"}`} />
                    <Pill tone="info" className="hidden sm:inline-flex">
                      <span aria-hidden>{m.home.draft}</span>
                    </Pill>
                  </span>
                )}
                <SmallButton onClick={() => ui.openEditor(kind)}>
                  {needsSetup ? m.home.setUp : permissions.canEditDrafts ? m.common.edit : m.common.view}
                </SmallButton>
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
};
