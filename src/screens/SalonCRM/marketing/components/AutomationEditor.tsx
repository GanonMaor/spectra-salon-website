import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Plus, Send } from "lucide-react";
import { useMarketing } from "../MarketingProvider";
import { fictionalSample, listSamples, renderPreview, type PreviewSample } from "../preview";
import {
  smsSegments,
  validateVersion,
  variablesForKind,
  variableToken,
  hasBlockingIssues,
  type VariableKey,
} from "../templates";
import { isValidHm } from "../time";
import {
  PENDING_STATUSES,
  type AutomationKind,
  type AutomationVersion,
  type LanguageCode,
  type MarketingDataset,
} from "../types";
import { PhonePreview } from "./PhonePreview";
import { ServiceOverridesPanel } from "./ServiceOverridesPanel";
import { describeTiming, languageName, rebookingNeedsSetup, useMarketingCopy, useMarketingUi, when } from "./helpers";
import {
  Card,
  Disclosure,
  fmt,
  InlineNotice,
  Pill,
  SectionTitle,
  Segmented,
  SelectInput,
  SmallButton,
  StatusChip,
  TextInput,
  Toggle,
  useMk,
} from "./ui";

const INTERVAL_PRESETS = [28, 42, 56, 90];
const PRIMARY_VARIABLES: VariableKey[] = ["first_name", "salon_name", "date", "time", "services", "service_name", "booking_link"];

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function contentOf(version: AutomationVersion) {
  return JSON.stringify({ timing: version.timing, bodies: version.bodies, serviceOverrides: version.serviceOverrides });
}

/** Offer only variables that have a real data source. */
function variableAvailable(key: VariableKey, dataset: MarketingDataset): boolean {
  switch (key) {
    case "branch":
      return Boolean(dataset.salon.branchName);
    case "address":
      return Boolean(dataset.salon.address);
    case "prep":
      return dataset.services.some((service) => service.prepInstructions);
    case "price":
      return dataset.services.some((service) => typeof service.priceCents === "number" && service.priceCents > 0);
    case "unsubscribe_link":
      return false;
    default:
      return true;
  }
}

export const AutomationEditor: React.FC<{ kind: AutomationKind }> = ({ kind }) => {
  const { m, lang: uiLang, isRTL } = useMarketingCopy();
  const mk = useMk();
  const ui = useMarketingUi();
  const { state, dataset, messages, now, timezone, permissions, actions } = useMarketing();
  const settings = state.settings;
  const automation = state.automations[kind];
  const base = automation.draft ?? automation.published;
  const [working, setWorking] = useState<AutomationVersion>(() => clone(base));
  const [editLang, setEditLang] = useState<LanguageCode>(settings.defaultLanguage);
  const [sampleIndex, setSampleIndex] = useState(0);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [showAllVariables, setShowAllVariables] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const Back = isRTL ? ArrowRight : ArrowLeft;
  const canEdit = permissions.canEditDrafts;

  const baseKey = `${automation.published.version}:${automation.draft?.updatedAt ?? "none"}`;
  useEffect(() => {
    setWorking(clone(automation.draft ?? automation.published));
    setConfirmPublish(false);
    // Only resync when the stored draft/published version changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseKey]);

  useEffect(() => {
    if (!settings.enabledLanguages.includes(editLang)) setEditLang(settings.defaultLanguage);
  }, [editLang, settings.defaultLanguage, settings.enabledLanguages]);

  const dirty = contentOf(working) !== contentOf(base);
  const hasPublishable = dirty || Boolean(automation.draft);
  const issues = useMemo(() => validateVersion(kind, working, settings), [kind, settings, working]);
  const blocking = hasBlockingIssues(issues);
  const pendingCount = messages.filter(
    (message) => !message.isTest && message.automation === kind && PENDING_STATUSES.includes(message.status),
  ).length;

  const samples = useMemo<{ list: PreviewSample[]; dataset: MarketingDataset }>(() => {
    const list = listSamples(dataset, kind, now);
    if (list.length) return { list, dataset };
    const fiction = fictionalSample(dataset, kind, editLang, now, timezone);
    return { list: [fiction.sample], dataset: fiction.dataset };
  }, [dataset, editLang, kind, now, timezone]);
  const sample = samples.list[Math.min(sampleIndex, samples.list.length - 1)];
  const preview = useMemo(
    () => renderPreview(samples.dataset, settings, kind, working, editLang, sample),
    [editLang, kind, working, sample, samples.dataset, settings],
  );
  const length = smsSegments(preview.render.text);

  const setBody = (value: string) =>
    setWorking((current) => ({ ...current, bodies: { ...current.bodies, [editLang]: value } }));

  const insertVariable = (key: VariableKey) => {
    const token = variableToken(key, editLang);
    const element = textareaRef.current;
    const body = working.bodies[editLang] ?? "";
    const start = element?.selectionStart ?? body.length;
    const end = element?.selectionEnd ?? body.length;
    setBody(`${body.slice(0, start)}${token}${body.slice(end)}`);
    requestAnimationFrame(() => {
      if (!element) return;
      element.focus();
      element.setSelectionRange(start + token.length, start + token.length);
    });
  };

  const fail = (error: keyof typeof m.errors) => ui.notify(m.errors[error], "bad");

  const saveDraft = () => {
    const result = actions.saveDraft(kind, working);
    if (result.ok) ui.notify(m.editor.draftSaved);
    else fail(result.error);
  };

  const publish = () => {
    const result = actions.publish(kind, dirty ? working : undefined);
    setConfirmPublish(false);
    if (result.ok) ui.notify(fmt(m.editor.published, { count: result.count ?? 0 }));
    else ui.notify(result.error === "invalid" ? m.editor.cannotPublish : m.errors[result.error], "bad");
  };

  const toggle = (enabled: boolean) => {
    const result = actions.setEnabled(kind, enabled);
    if (!result.ok) {
      ui.notify(result.error === "interval_required" ? m.editor.rebookingEnableBlocked : m.errors[result.error], "bad");
      return;
    }
    ui.notify(enabled ? m.editor.toggledOn : fmt(m.editor.toggledOff, { count: result.count ?? 0 }));
  };

  const timing = working.timing;
  const langIssues = issues.filter((issue) => issue.level !== "info" && (!issue.lang || issue.lang === editLang));
  const variables = variablesForKind(kind).filter((variable) => variableAvailable(variable.key, dataset));
  const changes = state.audit.filter((event) => event.target === kind).slice(0, 8);
  const overrideCount = Object.keys(working.serviceOverrides).length;
  const needsSetup = rebookingNeedsSetup(automation);

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <SmallButton onClick={() => ui.openEditor(null)} aria-label={m.editor.backToList} className="!px-2">
          <Back className="h-4 w-4" />
        </SmallButton>
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <h1 className={`text-lg font-bold tracking-tight ${mk.textStrong}`}>{m.kinds[kind].name}</h1>
          {automation.draft && !dirty && <Pill tone="info">{m.home.draft}</Pill>}
          {dirty && <Pill tone="warn">{m.editor.unsaved}</Pill>}
        </div>
        <Toggle
          checked={automation.enabled}
          label={m.editor.enabledLabel}
          showLabel
          disabled={!permissions.canToggle || (needsSetup && !automation.enabled)}
          onChange={toggle}
        />
      </header>

      {!canEdit && <InlineNotice tone="info">{m.editor.permissionEdit}</InlineNotice>}
      {canEdit && !permissions.canPublish && <InlineNotice tone="info">{m.editor.permissionPublish}</InlineNotice>}
      {needsSetup && <InlineNotice tone="info">{m.editor.rebookingEnableBlocked}</InlineNotice>}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-4">
          <Card as="section" className="p-4 sm:p-5">
            <SectionTitle
              title={m.editor.textTitle}
              action={
                settings.enabledLanguages.length > 1 ? (
                  <Segmented
                    label={m.editor.language}
                    size="sm"
                    value={editLang}
                    onChange={setEditLang}
                    options={settings.enabledLanguages.map((code) => ({ value: code, label: languageName(m, code) }))}
                  />
                ) : undefined
              }
            />
            <textarea
              ref={textareaRef}
              dir={editLang === "he" ? "rtl" : "ltr"}
              aria-label={`${m.editor.textTitle} (${languageName(m, editLang)})`}
              value={working.bodies[editLang] ?? ""}
              disabled={!canEdit}
              onChange={(event) => setBody(event.target.value)}
              rows={4}
              className={`mt-3 w-full resize-y leading-6 ${mk.input} min-h-[112px] disabled:opacity-60`}
            />
            <p className={`mt-1 text-[11px] tabular-nums ${mk.textFaint}`}>
              {fmt(m.editor.length, { chars: length.units, n: length.segments })}
            </p>

            <div className="mt-3 flex flex-wrap gap-1.5" aria-label={m.editor.variablesTitle} role="group">
              {(showAllVariables ? variables : variables.filter((variable) => PRIMARY_VARIABLES.includes(variable.key))).map((variable) => (
                <button
                  key={variable.key}
                  type="button"
                  disabled={!canEdit}
                  onClick={() => insertVariable(variable.key)}
                  className={`inline-flex min-h-[28px] items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11.5px] font-medium transition-colors disabled:opacity-40 ${mk.focus} ${
                    mk.isDark ? "border-white/10 bg-white/[0.04] text-white/80 hover:bg-white/10" : "border-[#EBDDD2] bg-white text-[#5F5249] hover:border-[#D7897F]"
                  }`}
                >
                  <Plus className="h-3 w-3" />
                  {variable.labels[editLang]}
                </button>
              ))}
              {variables.some((variable) => !PRIMARY_VARIABLES.includes(variable.key)) && (
                <button
                  type="button"
                  aria-expanded={showAllVariables}
                  onClick={() => setShowAllVariables((current) => !current)}
                  className={`inline-flex min-h-[28px] items-center rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold underline-offset-2 hover:underline ${mk.focus} ${mk.textSoft}`}
                >
                  {showAllVariables ? m.editor.fewerVariables : m.editor.moreVariables}
                </button>
              )}
            </div>

            {(langIssues.length > 0 || (!working.bodies[editLang]?.trim() && editLang !== settings.defaultLanguage)) && (
              <ul className="mt-3 space-y-1.5">
                {!working.bodies[editLang]?.trim() && editLang !== settings.defaultLanguage && (
                  <li>
                    <InlineNotice tone="warn">
                      {fmt(m.editor.languageFallback, { lang: languageName(m, editLang), fallback: languageName(m, settings.defaultLanguage) })}
                    </InlineNotice>
                  </li>
                )}
                {langIssues.map((issue, index) => (
                  <li key={`${issue.code}-${index}`}>
                    <InlineNotice tone={issue.level === "error" ? "bad" : "warn"}>
                      {fmt(m.validation[issue.code], { lang: issue.lang ? languageName(m, issue.lang) : "", detail: issue.detail })}
                    </InlineNotice>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card as="section" className="p-4 sm:p-5">
            <SectionTitle title={m.editor.whenTitle} />
            <div className="mt-3">
              {timing.type === "immediate" && (
                <p className={`text-[13px] ${mk.textStrong}`}>{m.kinds[kind].trigger}</p>
              )}
              {timing.type === "day_before" && (
                <div className="w-[170px]">
                  <TextInput
                    label={m.editor.reminderDayBefore}
                    type="time"
                    value={timing.time}
                    disabled={!canEdit}
                    onChange={(event) =>
                      setWorking((current) => ({ ...current, timing: { type: "day_before", time: event.target.value } }))
                    }
                  />
                </div>
              )}
              {timing.type === "after_service" && (
                <div className="space-y-3">
                  <div>
                    <p className={`text-[11.5px] font-semibold ${mk.textSoft}`}>{m.editor.rebookingInterval}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <Segmented
                        label={m.editor.rebookingInterval}
                        size="sm"
                        value={INTERVAL_PRESETS.includes(timing.intervalDays ?? -1) ? String(timing.intervalDays) : "custom"}
                        onChange={(value) => {
                          if (!canEdit || value === "custom") return;
                          setWorking((current) => ({ ...current, timing: { ...timing, intervalDays: Number(value) } }));
                        }}
                        options={[
                          ...INTERVAL_PRESETS.map((days) => ({ value: String(days), label: String(days) })),
                          { value: "custom", label: m.editor.customInterval },
                        ]}
                      />
                      <input
                        type="number"
                        min={1}
                        max={365}
                        inputMode="numeric"
                        aria-label={m.editor.rebookingInterval}
                        disabled={!canEdit}
                        value={timing.intervalDays ?? ""}
                        onChange={(event) => {
                          const value = event.target.value === "" ? null : Math.max(1, Math.min(365, Number(event.target.value)));
                          setWorking((current) => ({ ...current, timing: { ...timing, intervalDays: value } }));
                        }}
                        className={`h-9 w-20 ${mk.input}`}
                      />
                      <span className={`text-[11.5px] ${mk.textSoft}`}>{m.common.days}</span>
                    </div>
                  </div>
                  <div className="w-[170px]">
                    <TextInput
                      label={m.editor.rebookingTime}
                      type="time"
                      value={timing.time}
                      disabled={!canEdit}
                      onChange={(event) => setWorking((current) => ({ ...current, timing: { ...timing, time: event.target.value } }))}
                    />
                  </div>
                  {timing.intervalDays && timing.time && isValidHm(timing.time) && (
                    <p className={`text-[12.5px] font-semibold ${mk.textStrong}`}>{describeTiming(m, kind, working)}</p>
                  )}
                </div>
              )}
              {automation.category === "marketing" && (
                <p className={`mt-3 text-[11.5px] leading-5 ${mk.textSoft}`}>
                  {fmt(m.editor.marketingNote, { start: settings.marketingWindow.start, end: settings.marketingWindow.end })}
                </p>
              )}
            </div>
          </Card>

        </div>

        <aside className="min-w-0 lg:sticky lg:top-2 lg:row-span-2 lg:self-start">
          <Card as="section" className="p-4">
            <SectionTitle title={m.editor.previewTitle} />
            {samples.list.length > 1 && (
              <div className="mt-3">
                <SelectInput
                  label={m.editor.previewSample}
                  hideLabel
                  value={String(Math.min(sampleIndex, samples.list.length - 1))}
                  onChange={(value) => setSampleIndex(Number(value))}
                  options={samples.list.map((item, index) => ({ value: String(index), label: item.label }))}
                />
              </div>
            )}
            <div className="mt-3">
              <PhonePreview sender={settings.senderName} text={preview.render.text} lang={preview.lang} />
            </div>
            {preview.render.missingRequired.length > 0 && (
              <div className="mt-3">
                <InlineNotice tone="bad">
                  {fmt(m.editor.previewMissing, {
                    list: preview.render.missingRequired
                      .map((key) => variablesForKind(kind).find((variable) => variable.key === key)?.labels[editLang] ?? key)
                      .join(", "),
                  })}
                </InlineNotice>
              </div>
            )}
          </Card>
        </aside>

        <div className="min-w-0">
            <Card as="section" className={`divide-y px-4 sm:px-5 ${mk.isDark ? "divide-white/[0.06]" : "divide-[#EFE3DA]"}`}>
              <Disclosure
                title={m.editor.servicesTitle}
                meta={overrideCount > 0 ? <Pill tone="accent">{overrideCount}</Pill> : undefined}
              >
                <ServiceOverridesPanel kind={kind} working={working} setWorking={setWorking} editLang={editLang} disabled={!canEdit} />
              </Disclosure>
              <Disclosure title={m.test.title}>
                <TestSendPanel kind={kind} working={working} editLang={editLang} />
              </Disclosure>
              <Disclosure title={m.editor.historyTitle}>
                {changes.length === 0 ? (
                  <p className={`text-[12px] ${mk.textSoft}`}>{m.editor.noHistory}</p>
                ) : (
                  <ul className="space-y-1.5">
                    {changes.map((event) => (
                      <li key={event.id} className={`flex flex-wrap items-baseline gap-x-2 text-[12px] ${mk.textSoft}`}>
                        <span className={`font-semibold ${mk.textStrong}`}>{m.audit[event.action]}</span>
                        {event.detail && <span>{event.detail}</span>}
                        <span className={mk.textFaint}>{fmt(m.common.by, { who: event.actor, when: when(event.at, timezone, uiLang) })}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Disclosure>
            </Card>
        </div>
      </div>

      {hasPublishable && (
        <div
          className={`sticky bottom-[calc(72px+env(safe-area-inset-bottom))] z-20 rounded-2xl border p-3 shadow-sm lg:bottom-3 ${
            mk.isDark ? "border-white/10 bg-[#171412]/95" : "border-[#EBDDD2] bg-[#FFFDF8]/95"
          }`}
          style={{ backdropFilter: "blur(10px)" }}
        >
          {confirmPublish ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <p className={`flex-1 text-[12.5px] font-semibold ${mk.textStrong}`}>{fmt(m.editor.publishConfirm, { count: pendingCount })}</p>
              <div className="flex gap-2">
                <SmallButton onClick={() => setConfirmPublish(false)}>{m.common.cancel}</SmallButton>
                <SmallButton tone="primary" onClick={publish}>
                  {m.editor.publish}
                </SmallButton>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-end gap-2">
              {blocking && <p className="me-auto text-[11.5px] font-semibold text-[#B05F57]">{m.editor.cannotPublish}</p>}
              {automation.draft && !dirty && (
                <SmallButton
                  tone="ghost"
                  disabled={!canEdit}
                  onClick={() => {
                    const result = actions.discardDraft(kind);
                    if (result.ok) ui.notify(m.editor.draftDiscarded);
                    else fail(result.error);
                  }}
                >
                  {m.editor.discardDraft}
                </SmallButton>
              )}
              {dirty && (
                <SmallButton disabled={!canEdit} onClick={saveDraft}>
                  {m.editor.saveDraft}
                </SmallButton>
              )}
              <SmallButton tone="primary" disabled={!permissions.canPublish || blocking} onClick={() => setConfirmPublish(true)}>
                {m.editor.publish}
              </SmallButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const TestSendPanel: React.FC<{ kind: AutomationKind; working: AutomationVersion; editLang: LanguageCode }> = ({
  kind,
  working,
  editLang,
}) => {
  const { m } = useMarketingCopy();
  const mk = useMk();
  const ui = useMarketingUi();
  const { state, messages, permissions, actions } = useMarketing();
  const [phone, setPhone] = useState("");
  const connected = state.settings.connection === "connected";
  const last = [...messages].reverse().find((message) => message.isTest && message.automation === kind);

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[180px] flex-1">
          <TextInput
            label={m.test.phone}
            value={phone}
            dir="ltr"
            inputMode="tel"
            placeholder="050-000-0000"
            onChange={(event) => setPhone(event.target.value)}
          />
        </div>
        <SmallButton
          tone="primary"
          className="min-h-[40px]"
          disabled={!connected || !permissions.canSendTest || phone.replace(/\D/g, "").length < 9}
          onClick={() => {
            const result = actions.sendTest({ kind, version: working, lang: editLang, phone, outcome: "normal" });
            if (result.ok) ui.notify(fmt(m.test.sent, { phone }));
            else ui.notify(m.errors[result.error], "bad");
          }}
        >
          <Send className="h-3.5 w-3.5" /> {m.test.send}
        </SmallButton>
      </div>
      {!connected && <p className={`text-[11px] ${mk.textFaint}`}>{m.test.needsConnection}</p>}
      {connected && !permissions.canSendTest && <p className={`text-[11px] ${mk.textFaint}`}>{m.test.forbidden}</p>}
      {last && (
        <button
          type="button"
          onClick={() => ui.openMessage(last.id)}
          className={`flex min-h-0 flex-wrap items-center gap-2 rounded-lg p-1 text-start text-[11.5px] font-semibold ${mk.hover} ${mk.textSoft}`}
        >
          {m.test.resultTitle}: <StatusChip status={last.status} label={m.statuses[last.status]} />
        </button>
      )}
    </div>
  );
};
