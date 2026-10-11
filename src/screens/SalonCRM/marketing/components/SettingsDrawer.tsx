import React, { useEffect, useState } from "react";
import { PlugZap, Unplug } from "lucide-react";
import { useMarketing } from "../MarketingProvider";
import { budgetUsage } from "../metrics";
import { formatMoney, isValidHm } from "../time";
import type { LanguageCode, SmsSettings } from "../types";
import { languageName, useMarketingCopy, useMarketingUi } from "./helpers";
import { Drawer, fmt, InlineNotice, SelectInput, SmallButton, TextInput, Toggle, useMk } from "./ui";

const LANGS: LanguageCode[] = ["he", "en"];

export const TIMEZONES = [
  "Asia/Jerusalem",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Australia/Sydney",
];

export const SENDER_PATTERN = /^[A-Za-z0-9]{3,11}$/;

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const mk = useMk();
  return (
    <section className="space-y-3">
      <h3 className={`text-[12.5px] font-bold ${mk.textStrong}`}>{title}</h3>
      {children}
    </section>
  );
};

export const SettingsDrawer: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { m, lang } = useMarketingCopy();
  const mk = useMk();
  const ui = useMarketingUi();
  const { state, messages, now, permissions, actions } = useMarketing();
  const usage = budgetUsage(messages, state.settings, now);
  const [form, setForm] = useState<SmsSettings>(state.settings);
  const disabled = !permissions.canManageSettings;

  useEffect(() => {
    if (open) setForm(state.settings);
    // Resync only when the drawer opens so connecting SMS keeps unsaved edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const set = <K extends keyof SmsSettings>(key: K, value: SmsSettings[K]) => setForm((current) => ({ ...current, [key]: value }));
  const senderOk = !form.senderName || SENDER_PATTERN.test(form.senderName);
  const windowOk =
    isValidHm(form.marketingWindow.start) && isValidHm(form.marketingWindow.end) && form.marketingWindow.start < form.marketingWindow.end;
  const valid = senderOk && windowOk && form.enabledLanguages.length > 0 && form.enabledLanguages.includes(form.defaultLanguage);
  const connected = state.settings.connection === "connected";

  const save = () => {
    const { connection: _connection, providerLabel: _provider, onboardingCompletedAt: _onboarding, testSentAt: _test, ...patch } = form;
    const result = actions.updateSettings(patch);
    if (result.ok) {
      ui.notify(m.settings.saved);
      onClose();
    } else ui.notify(m.errors[result.error], "bad");
  };

  const number = (value: string, min: number, max: number) => Math.max(min, Math.min(max, Number(value) || min));

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={m.settings.title}
      subtitle={m.settings.subtitle}
      closeLabel={m.common.close}
      footer={
        <>
          <SmallButton onClick={onClose}>{m.common.cancel}</SmallButton>
          <SmallButton tone="primary" disabled={disabled || !valid} onClick={save}>
            {m.settings.save}
          </SmallButton>
        </>
      }
    >
      <div className="space-y-5">
        {disabled && <InlineNotice tone="warn">{m.settings.forbidden}</InlineNotice>}

        <section className={`rounded-xl border p-3 ${mk.cardSoft}`}>
          <p className={`text-[11px] font-semibold ${mk.textSoft}`}>{m.settings.connection}</p>
          <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
            <p className={`text-[12.5px] font-semibold ${mk.textStrong}`}>
              {connected ? m.sms.connected : m.sms.notConnected}
            </p>
            {connected ? (
              <SmallButton tone="danger" disabled={disabled} onClick={() => actions.disconnectSms()}>
                <Unplug className="h-3.5 w-3.5" /> {m.settings.disconnect}
              </SmallButton>
            ) : (
              <SmallButton tone="primary" disabled={disabled} onClick={() => actions.connectSms()}>
                <PlugZap className="h-3.5 w-3.5" /> {m.settings.connect}
              </SmallButton>
            )}
          </div>
        </section>

        <Section title={m.settings.sectionSender}>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput
            label={m.settings.senderName}
            value={form.senderName}
            dir="ltr"
            maxLength={11}
            disabled={disabled}
            hint={senderOk ? m.settings.senderHint : m.settings.senderInvalid}
            onChange={(event) => set("senderName", event.target.value)}
          />
          <SelectInput
            label={m.settings.timezone}
            value={form.timezone}
            disabled={disabled}
            onChange={(value) => set("timezone", value)}
            options={[...new Set([form.timezone, ...TIMEZONES])].map((zone) => ({ value: zone, label: zone }))}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className={`text-[11px] font-semibold ${mk.textSoft}`}>{m.settings.languages}</p>
            <div className="mt-2 flex flex-wrap gap-4">
              {LANGS.map((code) => (
                <Toggle
                  key={code}
                  checked={form.enabledLanguages.includes(code)}
                  label={languageName(m, code)}
                  showLabel
                  disabled={disabled || (form.enabledLanguages.length === 1 && form.enabledLanguages.includes(code))}
                  onChange={(next) =>
                    set(
                      "enabledLanguages",
                      next ? [...form.enabledLanguages, code] : form.enabledLanguages.filter((item) => item !== code),
                    )
                  }
                />
              ))}
            </div>
            <p className={`mt-1.5 text-[10.5px] leading-4 ${mk.textFaint}`}>{m.settings.languagesHint}</p>
          </div>
          <SelectInput
            label={m.settings.defaultLanguage}
            value={form.defaultLanguage}
            disabled={disabled}
            onChange={(value) => set("defaultLanguage", value as LanguageCode)}
            options={form.enabledLanguages.map((code) => ({ value: code, label: languageName(m, code) }))}
          />
        </div>
        </Section>

        <Section title={m.settings.sectionMarketing}>
        <div>
          <p className={`text-[11px] font-semibold ${mk.textSoft}`}>{m.settings.window}</p>
          <div className="mt-1 grid grid-cols-2 gap-3">
            <TextInput
              label={m.settings.windowFrom}
              type="time"
              value={form.marketingWindow.start}
              disabled={disabled}
              onChange={(event) => set("marketingWindow", { ...form.marketingWindow, start: event.target.value })}
            />
            <TextInput
              label={m.settings.windowTo}
              type="time"
              value={form.marketingWindow.end}
              disabled={disabled}
              onChange={(event) => set("marketingWindow", { ...form.marketingWindow, end: event.target.value })}
            />
          </div>
          <p className={`mt-1 text-[10.5px] leading-4 ${windowOk ? mk.textFaint : "text-[#B05F57]"}`}>{m.settings.windowHint}</p>
        </div>

        <TextInput
            label={m.settings.frequency}
            type="number"
            min={1}
            max={60}
            value={form.frequencyCapDays}
            disabled={disabled}
            hint={m.settings.frequencyHint}
            onChange={(event) => set("frequencyCapDays", number(event.target.value, 1, 60))}
          />
        </Section>

        <Section title={m.settings.sectionBudget}>
        <p className={`text-[12px] ${mk.textSoft}`}>
          {fmt(m.settings.budgetUsed, {
            spent: formatMoney(usage.spentCents, lang),
            limit: formatMoney(state.settings.monthlyMarketingBudgetCents, lang),
          })}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput
            label={m.settings.attempts}
            type="number"
            min={1}
            max={5}
            value={form.maxAttempts}
            disabled={disabled}
            hint={m.settings.attemptsHint}
            onChange={(event) => set("maxAttempts", number(event.target.value, 1, 5))}
          />
          <TextInput
            label={m.settings.budget}
            type="number"
            min={0}
            step={1}
            value={form.monthlyMarketingBudgetCents / 100}
            disabled={disabled}
            hint={m.settings.budgetHint}
            onChange={(event) => set("monthlyMarketingBudgetCents", Math.round(Math.max(0, Number(event.target.value) || 0) * 100))}
          />
          <TextInput
            label={m.settings.alertAt}
            type="number"
            min={10}
            max={100}
            value={form.budgetAlertPercent}
            disabled={disabled}
            onChange={(event) => set("budgetAlertPercent", number(event.target.value, 10, 100))}
          />
          <TextInput
            label={m.settings.unitCost}
            type="number"
            min={0}
            step={0.01}
            value={form.estimatedCostPerSegmentCents / 100}
            disabled={disabled}
            hint={m.settings.unitCostHint}
            onChange={(event) => set("estimatedCostPerSegmentCents", Math.round(Math.max(0, Number(event.target.value) || 0) * 100))}
          />
        </div>
        </Section>
      </div>
    </Drawer>
  );
};
