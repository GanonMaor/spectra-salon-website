import React, { useMemo, useState } from "react";
import { CalendarPlus, Clock3, RotateCcw, SkipForward } from "lucide-react";
import { useMarketing, type ActionResult } from "../MarketingProvider";
import { nextWake } from "../engine";
import { actorLabel } from "../permissions";
import { isBefore } from "../time";
import type { ConsentStatus, MarketingActorRole, ProviderBehavior } from "../types";
import { serviceNames, useMarketingCopy, useMarketingUi, when } from "./helpers";
import { Card, InlineNotice, Pill, SectionTitle, Segmented, SelectInput, SmallButton, TextInput, useMk } from "./ui";

const ROLES: MarketingActorRole[] = ["owner", "manager_publisher", "manager_editor", "viewer"];

export const SimulatorTab: React.FC = () => {
  const { m, lang } = useMarketingCopy();
  const mk = useMk();
  const ui = useMarketingUi();
  const { state, dataset, now, timezone, permissions, actions } = useMarketing();
  const [customerId, setCustomerId] = useState(dataset.customers[0]?.id ?? "");
  const [serviceIds, setServiceIds] = useState<string[]>(dataset.services[0] ? [dataset.services[0].id] : []);
  const [dayOffset, setDayOffset] = useState(2);
  const [time, setTime] = useState("12:00");

  const run = (result: ActionResult, success = m.simulator.done) => {
    if (result.ok) ui.notify(success);
    else ui.notify(m.errors[result.error], "bad");
  };

  const upcoming = useMemo(
    () =>
      dataset.appointments
        .filter((appointment) => appointment.status === "confirmed")
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [dataset.appointments],
  );
  const wake = nextWake(state.messages);

  const consentLabel = (status: ConsentStatus) =>
    status === "granted" ? m.simulator.consentGranted : status === "revoked" ? m.simulator.consentRevoked : m.simulator.consentUnknown;

  return (
    <div className="space-y-4">
      <InlineNotice tone="info" title={m.simulator.title}>
        {m.simulator.subtitle}
      </InlineNotice>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card as="section" className="p-4">
          <SectionTitle title={m.simulator.clock} />
          <p className={`mt-2 flex items-center gap-2 text-[16px] font-bold tabular-nums ${mk.textStrong}`}>
            <Clock3 className="h-4 w-4" /> {when(now, timezone, lang)}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <SmallButton onClick={() => run(actions.advanceClock(15))}>{m.simulator.plus15}</SmallButton>
            <SmallButton onClick={() => run(actions.advanceClock(60))}>{m.simulator.plus1h}</SmallButton>
            <SmallButton onClick={() => run(actions.advanceClock(24 * 60))}>{m.simulator.plus1d}</SmallButton>
            <SmallButton tone="primary" disabled={!wake} onClick={() => run(actions.advanceToNextEvent())}>
              <SkipForward className="h-3.5 w-3.5" /> {m.simulator.nextEvent}
            </SmallButton>
          </div>
          <p className={`mt-2 text-[11px] ${mk.textFaint}`}>
            {wake ? `${m.overview.nextMessage}: ${when(wake, timezone, lang)}` : m.simulator.noNextEvent}
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <SelectInput
              label={m.simulator.provider}
              hint={m.simulator.providerHint}
              value={state.nextProviderOutcome ?? "normal"}
              onChange={(value) => run(actions.setNextProviderOutcome(value as ProviderBehavior))}
              options={[
                { value: "normal", label: m.test.outcomeNormal },
                { value: "temporary_failure", label: m.test.outcomeTemporary },
                { value: "timeout", label: m.test.outcomeTimeout },
                { value: "permanent_failure", label: m.test.outcomePermanent },
              ]}
            />
            <SelectInput
              label={m.simulator.role}
              hint={m.simulator.roleHint}
              value={state.actingRole ?? "owner"}
              onChange={(value) => run(actions.setActingRole(value as MarketingActorRole))}
              options={ROLES.map((role) => ({ value: role, label: actorLabel(role, lang) }))}
            />
          </div>

          <div className={`mt-4 flex flex-wrap gap-2 border-t pt-3 ${mk.divider}`}>
            <SmallButton
              tone="danger"
              disabled={!permissions.canResetDemo}
              onClick={() => {
                if (window.confirm(m.simulator.resetConfirm)) run(actions.resetDemo(), m.simulator.resetDone);
              }}
            >
              <RotateCcw className="h-3.5 w-3.5" /> {m.simulator.reset}
            </SmallButton>
            <SmallButton onClick={() => run(actions.restartFirstRun())}>{m.simulator.restartFirstRun}</SmallButton>
          </div>
        </Card>

        <Card as="section" className="p-4">
          <SectionTitle title={m.simulator.book} />
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <SelectInput
              label={m.simulator.bookCustomer}
              value={customerId}
              onChange={setCustomerId}
              options={dataset.customers.map((customer) => ({
                value: customer.id,
                label: [customer.firstName, customer.lastName].filter(Boolean).join(" "),
              }))}
            />
            <div className="grid grid-cols-2 gap-2">
              <TextInput
                label={m.simulator.bookDay}
                type="number"
                min={0}
                max={60}
                value={dayOffset}
                onChange={(event) => setDayOffset(Math.max(0, Math.min(60, Number(event.target.value) || 0)))}
              />
              <TextInput label={m.simulator.bookTime} type="time" value={time} onChange={(event) => setTime(event.target.value)} />
            </div>
          </div>
          <fieldset className="mt-3">
            <legend className={`text-[11px] font-semibold ${mk.textSoft}`}>{m.simulator.bookServices}</legend>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {dataset.services.map((service) => {
                const active = serviceIds.includes(service.id);
                return (
                  <button
                    key={service.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      setServiceIds((current) => (active ? current.filter((id) => id !== service.id) : [...current, service.id]))
                    }
                    className={`min-h-[30px] rounded-lg border px-2.5 py-1 text-[11.5px] font-semibold ${mk.focus} ${
                      active
                        ? "border-[#D7897F] bg-[#D7897F]/15 text-[#A2554C]"
                        : mk.isDark
                          ? "border-white/10 text-white/70"
                          : "border-[#EBDDD2] text-[#5F5249]"
                    }`}
                  >
                    {service.name}
                  </button>
                );
              })}
            </div>
          </fieldset>
          <div className="mt-3 flex justify-end">
            <SmallButton
              tone="primary"
              disabled={!customerId || !serviceIds.length}
              onClick={() => run(actions.bookAppointment({ customerId, serviceIds, dayOffset, time }), m.simulator.booked)}
            >
              <CalendarPlus className="h-3.5 w-3.5" /> {m.simulator.bookButton}
            </SmallButton>
          </div>
        </Card>
      </div>

      <Card as="section" className="p-4">
        <SectionTitle title={m.simulator.upcoming} />
        {upcoming.length === 0 ? (
          <p className={`mt-2 text-[12px] ${mk.textSoft}`}>{m.simulator.noUpcoming}</p>
        ) : (
          <ul className={`mt-2 divide-y ${mk.isDark ? "divide-white/[0.06]" : "divide-[#EFE3DA]"}`}>
            {upcoming.map((appointment) => {
              const customer = dataset.customers.find((item) => item.id === appointment.customerId);
              const started = !isBefore(now, appointment.startTime);
              return (
                <li key={appointment.id} className="flex flex-col gap-2 py-2.5 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-[12.5px] font-semibold ${mk.textStrong}`}>
                      {customer?.firstName} {customer?.lastName}
                      <span className={`font-normal ${mk.textSoft}`}> · {serviceNames(dataset, appointment.serviceIds)}</span>
                    </p>
                    <p className={`text-[11px] tabular-nums ${mk.textFaint}`}>{when(appointment.startTime, timezone, lang)}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <SmallButton onClick={() => run(actions.rescheduleAppointment(appointment.id, 1))}>{m.simulator.reschedule}</SmallButton>
                    <SmallButton onClick={() => run(actions.cancelAppointment(appointment.id))}>{m.simulator.cancelVisit}</SmallButton>
                    <SmallButton onClick={() => run(actions.completeAppointment(appointment.id))}>{m.simulator.complete}</SmallButton>
                    <SmallButton disabled={!started} onClick={() => run(actions.markNoShow(appointment.id))}>
                      {m.simulator.noShow}
                    </SmallButton>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card as="section" className="p-4">
        <SectionTitle title={m.simulator.customers} />
        <ul className={`mt-2 divide-y ${mk.isDark ? "divide-white/[0.06]" : "divide-[#EFE3DA]"}`}>
          {dataset.customers.map((customer) => (
            <li key={customer.id} className="flex flex-col gap-2 py-2.5 md:flex-row md:items-center">
              <div className="min-w-0 flex-1">
                <p className={`text-[12.5px] font-semibold ${mk.textStrong}`}>
                  {customer.firstName} {customer.lastName}
                </p>
                <p className="mt-0.5 flex flex-wrap gap-1">
                  {!customer.phone && <Pill tone="warn">{m.simulator.noPhone}</Pill>}
                  {customer.undeliverable && <Pill tone="bad">{m.simulator.undeliverable}</Pill>}
                  {customer.language && <Pill>{customer.language.toUpperCase()}</Pill>}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <span className="flex items-center gap-1.5">
                  <span className={`text-[10.5px] font-semibold ${mk.textSoft}`}>{m.simulator.marketingConsent}</span>
                  <Segmented
                    label={`${m.simulator.marketingConsent}: ${customer.firstName}`}
                    size="sm"
                    value={customer.consent.marketing.status}
                    onChange={(status) => run(actions.setConsent(customer.id, "marketing", status))}
                    options={(["granted", "revoked", "unknown"] as ConsentStatus[]).map((status) => ({ value: status, label: consentLabel(status) }))}
                  />
                </span>
                <span className="flex items-center gap-1.5">
                  <span className={`text-[10.5px] font-semibold ${mk.textSoft}`}>{m.simulator.transactionalConsent}</span>
                  <Segmented
                    label={`${m.simulator.transactionalConsent}: ${customer.firstName}`}
                    size="sm"
                    value={customer.consent.transactional.status === "revoked" ? "revoked" : "granted"}
                    onChange={(status) => run(actions.setConsent(customer.id, "transactional", status))}
                    options={(["granted", "revoked"] as ConsentStatus[]).map((status) => ({ value: status, label: consentLabel(status) }))}
                  />
                </span>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};
