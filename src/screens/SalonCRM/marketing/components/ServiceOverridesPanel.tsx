import React, { useState } from "react";
import { ChevronDown, RotateCcw } from "lucide-react";
import { useMarketing } from "../MarketingProvider";
import { resolveIntervalDays } from "../engine";
import { variablesForKind } from "../templates";
import { formatMoney } from "../time";
import type { AutomationKind, AutomationVersion, LanguageCode, ServiceOverride } from "../types";
import { languageName, useMarketingCopy } from "./helpers";
import { fmt, InlineNotice, Pill, SelectInput, SmallButton, Toggle, useMk } from "./ui";

type PriceMode = "inherit" | "custom" | "hide";

function cleanOverride(override: ServiceOverride): ServiceOverride | null {
  const bodies = Object.fromEntries(
    Object.entries(override.bodies ?? {}).filter(([, value]) => typeof value === "string" && value.trim() !== ""),
  ) as Partial<Record<LanguageCode, string>>;
  const next: ServiceOverride = { serviceId: override.serviceId };
  if (override.enabled === false) next.enabled = false;
  if (Object.keys(bodies).length) next.bodies = bodies;
  if (override.intervalDays && override.intervalDays > 0) next.intervalDays = override.intervalDays;
  if (override.priceCents !== undefined) next.priceCents = override.priceCents;
  return Object.keys(next).length > 1 ? next : null;
}

export const ServiceOverridesPanel: React.FC<{
  kind: AutomationKind;
  working: AutomationVersion;
  setWorking: React.Dispatch<React.SetStateAction<AutomationVersion>>;
  editLang: LanguageCode;
  disabled: boolean;
}> = ({ kind, working, setWorking, editLang, disabled }) => {
  const { m, lang } = useMarketingCopy();
  const mk = useMk();
  const { dataset } = useMarketing();
  const [open, setOpen] = useState<string | null>(null);
  const supportsPrice = variablesForKind(kind).some((variable) => variable.key === "price");
  const generalInterval = resolveIntervalDays(working, "__general__");

  const update = (serviceId: string, patch: Partial<ServiceOverride> | null) => {
    setWorking((current) => {
      const overrides = { ...current.serviceOverrides };
      const merged = patch === null ? null : cleanOverride({ ...(overrides[serviceId] ?? { serviceId }), ...patch, serviceId });
      if (merged) overrides[serviceId] = merged;
      else delete overrides[serviceId];
      return { ...current, serviceOverrides: overrides };
    });
  };

  return (
    <div>
      <p className={`text-[11.5px] leading-5 ${mk.textSoft}`}>{m.editor.servicesSubtitle}</p>
      {dataset.services.length === 0 ? (
        <p className={`mt-3 text-[12px] ${mk.textSoft}`}>{m.overrides.noServices}</p>
      ) : (
        <ul className={`mt-3 divide-y rounded-xl border ${mk.cardSoft} ${mk.isDark ? "divide-white/[0.06]" : "divide-[#EFE3DA]"}`}>
          {dataset.services.map((service) => {
            const override = working.serviceOverrides[service.id];
            const customized = Boolean(override);
            const expanded = open === service.id;
            const priceMode: PriceMode =
              override?.priceCents === undefined ? "inherit" : override.priceCents === null ? "hide" : "custom";
            const hasCatalogPrice = typeof service.priceCents === "number" && service.priceCents > 0;
            return (
              <li key={service.id}>
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setOpen(expanded ? null : service.id)}
                  className={`flex w-full items-center gap-2 px-3 py-2.5 text-start ${mk.hover} ${mk.focus}`}
                >
                  <span className={`min-w-0 flex-1 truncate text-[12.5px] font-semibold ${mk.textStrong}`}>{service.name}</span>
                  {override?.enabled === false && <Pill tone="neutral">{m.overrides.excluded}</Pill>}
                  {kind === "rebooking_invite" && override?.enabled !== false && (
                    <span className={`text-[10.5px] tabular-nums ${mk.textFaint}`}>
                      {resolveIntervalDays(working, service.id) ?? "—"} {m.common.days}
                    </span>
                  )}
                  <Pill tone={customized ? "accent" : "neutral"}>{customized ? m.overrides.customized : m.overrides.inherited}</Pill>
                  <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${expanded ? "rotate-180" : ""} ${mk.textSoft}`} />
                </button>
                {expanded && (
                  <div className="space-y-3 px-3 pb-3.5">
                    <Toggle
                      checked={override?.enabled !== false}
                      label={m.overrides.included}
                      showLabel
                      disabled={disabled}
                      onChange={(next) => update(service.id, { enabled: next ? undefined : false })}
                    />
                    {override?.enabled !== false && (
                      <>
                        <div>
                          <label className={`text-[11px] font-semibold ${mk.textSoft}`} htmlFor={`ovr-${service.id}`}>
                            {fmt(m.overrides.customText, { lang: languageName(m, editLang) })}
                          </label>
                          <textarea
                            id={`ovr-${service.id}`}
                            dir={editLang === "he" ? "rtl" : "ltr"}
                            rows={3}
                            disabled={disabled}
                            value={override?.bodies?.[editLang] ?? ""}
                            placeholder={working.bodies[editLang] ?? ""}
                            onChange={(event) =>
                              update(service.id, { bodies: { ...(override?.bodies ?? {}), [editLang]: event.target.value } })
                            }
                            className={`mt-1 w-full resize-y ${mk.input}`}
                          />
                          <p className={`mt-1 text-[10.5px] leading-4 ${mk.textFaint}`}>{m.overrides.customTextHint}</p>
                        </div>
                        {kind === "rebooking_invite" && (
                          <div className="flex flex-wrap items-end gap-2">
                            <label className="block">
                              <span className={`text-[11px] font-semibold ${mk.textSoft}`}>{m.overrides.interval}</span>
                              <input
                                type="number"
                                min={1}
                                max={365}
                                inputMode="numeric"
                                disabled={disabled}
                                value={override?.intervalDays ?? ""}
                                placeholder={generalInterval ? String(generalInterval) : "—"}
                                onChange={(event) =>
                                  update(service.id, {
                                    intervalDays: event.target.value ? Math.max(1, Math.min(365, Number(event.target.value))) : undefined,
                                  })
                                }
                                className={`mt-1 block h-9 w-24 ${mk.input}`}
                              />
                            </label>
                            <p className={`pb-2 text-[10.5px] ${mk.textFaint}`}>
                              {fmt(m.overrides.intervalHint, { days: generalInterval ?? "—" })}
                            </p>
                          </div>
                        )}
                        {supportsPrice && (
                          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_140px]">
                            <SelectInput
                              label={m.overrides.price}
                              value={priceMode}
                              disabled={disabled}
                              onChange={(value) => {
                                const mode = value as PriceMode;
                                update(service.id, {
                                  priceCents: mode === "inherit" ? undefined : mode === "hide" ? null : service.priceCents ?? 10_000,
                                });
                              }}
                              options={[
                                {
                                  value: "inherit",
                                  label: `${m.overrides.priceInherit}${hasCatalogPrice ? ` (${formatMoney(service.priceCents ?? 0, lang)})` : ""}`,
                                },
                                { value: "custom", label: m.overrides.priceCustom },
                                { value: "hide", label: m.overrides.priceHide },
                              ]}
                            />
                            {priceMode === "custom" && (
                              <label className="block">
                                <span className={`text-[11px] font-semibold ${mk.textSoft}`}>₪</span>
                                <input
                                  type="number"
                                  min={1}
                                  step={1}
                                  inputMode="decimal"
                                  disabled={disabled}
                                  value={override?.priceCents ? override.priceCents / 100 : ""}
                                  onChange={(event) => {
                                    const value = Number(event.target.value);
                                    update(service.id, { priceCents: value > 0 ? Math.round(value * 100) : null });
                                  }}
                                  className={`mt-1 block h-10 w-full ${mk.input}`}
                                />
                              </label>
                            )}
                          </div>
                        )}
                        {supportsPrice && priceMode === "inherit" && !hasCatalogPrice && (
                          <InlineNotice tone="info">{m.overrides.priceMissing}</InlineNotice>
                        )}
                      </>
                    )}
                    {customized && (
                      <SmallButton disabled={disabled} onClick={() => update(service.id, null)}>
                        <RotateCcw className="h-3.5 w-3.5" /> {m.overrides.reset}
                      </SmallButton>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
