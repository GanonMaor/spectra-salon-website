/**
 * Marketing UI primitives built on the CRM settings language
 * (`settingsUi.tsx`) and calendar palette — no parallel design system.
 */

import React, { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, X } from "lucide-react";
import { useSiteTheme } from "../../../../contexts/SiteTheme";
import { CALENDAR_DESIGN_COLORS } from "../../schedule/scheduleDesign";
import { useSettingsStyles } from "../../schedule/settings/settingsUi";
import type { MessageStatus } from "../types";

export { PrimaryButton, GhostButton, IconBtn, SettingsPlaceholder } from "../../schedule/settings/settingsUi";

export const C = CALENDAR_DESIGN_COLORS;

export function useMk() {
  const { isDark } = useSiteTheme();
  const s = useSettingsStyles(isDark);
  return {
    isDark,
    ...s,
    panel: isDark
      ? "border-white/[0.12] bg-black/[0.30]"
      : "border-white/70 bg-[#FFF8F0]/90",
    panelShadow: isDark
      ? "0 4px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.04)"
      : "0 24px 70px rgba(92,52,35,0.10)",
    divider: isDark ? "border-white/[0.08]" : "border-[#EFE3DA]",
    hover: isDark ? "hover:bg-white/[0.05]" : "hover:bg-[#FFF3E8]",
    subtleBg: isDark ? "bg-white/[0.04]" : "bg-[#F8F0E6]",
    focus: "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D7897F]",
  };
}

/** `{name}` substitution; `{count:# item|# items}` picks a form by count, `#` = value. */
export function fmt(template: string, vars: Record<string, string | number | undefined>): string {
  return template
    .replace(/\{(\w+):([^|{}]*)\|([^{}]*)\}/g, (raw, key: string, one: string, many: string) => {
      const value = vars[key];
      if (value === undefined) return raw;
      return (Number(value) === 1 ? one : many).replace(/#/g, String(value));
    })
    .replace(/\{(\w+)\}/g, (raw, key: string) => (vars[key] === undefined ? raw : String(vars[key])));
}

/** 050-123-4567 → 050-•••-4567 */
export function maskPhone(phone: string | undefined): string {
  if (!phone) return "—";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) return phone;
  return `${digits.slice(0, 3)}-•••-${digits.slice(-4)}`;
}

export const Card: React.FC<{ children: React.ReactNode; className?: string; as?: "div" | "section" }> = ({
  children,
  className = "",
  as = "div",
}) => {
  const mk = useMk();
  const Tag = as;
  return <Tag className={`rounded-2xl border ${mk.card} ${className}`}>{children}</Tag>;
};

export const SectionTitle: React.FC<{
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  id?: string;
}> = ({ title, subtitle, action, id }) => {
  const mk = useMk();
  return (
    <div className="flex flex-wrap items-end justify-between gap-2">
      <div className="min-w-0">
        <h2 id={id} className={`text-[14px] font-bold ${mk.textStrong}`}>
          {title}
        </h2>
        {subtitle && <p className={`mt-0.5 text-[11.5px] leading-5 ${mk.textSoft}`}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
};

const STATUS_TONES: Record<MessageStatus, { light: string; dark: string }> = {
  scheduled: { light: "bg-[#6398A9]/20 text-[#2C5A67]", dark: "bg-sky-400/10 text-sky-300" },
  deferred: { light: "bg-[#F9B95C]/25 text-[#8A5A1B]", dark: "bg-amber-400/10 text-amber-300" },
  paused: { light: "bg-[#F1B37A]/35 text-[#8A4B1B]", dark: "bg-orange-400/10 text-orange-300" },
  sent: { light: "bg-[#B8A7D9]/30 text-[#4D3F73]", dark: "bg-violet-400/10 text-violet-300" },
  delivered: { light: "bg-[#96C7B3]/35 text-[#315A4B]", dark: "bg-emerald-400/10 text-emerald-300" },
  unknown: { light: "bg-[#EBDDD2] text-[#6B5B50]", dark: "bg-white/10 text-white/70" },
  failed: { light: "bg-[#B05F57]/15 text-[#8E3F38]", dark: "bg-red-400/10 text-red-300" },
  cancelled: { light: "bg-black/[0.06] text-black/50", dark: "bg-white/10 text-white/45" },
  skipped: { light: "bg-black/[0.06] text-black/50", dark: "bg-white/10 text-white/45" },
};

export const StatusChip: React.FC<{ status: MessageStatus; label: string }> = ({ status, label }) => {
  const { isDark } = useMk();
  const tone = STATUS_TONES[status][isDark ? "dark" : "light"];
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md px-2 py-0.5 text-[10.5px] font-semibold ${tone}`}>
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
};

export type Tone = "neutral" | "good" | "warn" | "bad" | "info" | "accent";

export const Pill: React.FC<{ tone?: Tone; children: React.ReactNode; className?: string }> = ({
  tone = "neutral",
  children,
  className = "",
}) => {
  const { isDark } = useMk();
  const tones: Record<Tone, string> = isDark
    ? {
        neutral: "bg-white/10 text-white/60",
        good: "bg-emerald-400/10 text-emerald-300",
        warn: "bg-amber-400/10 text-amber-300",
        bad: "bg-red-400/10 text-red-300",
        info: "bg-sky-400/10 text-sky-300",
        accent: "bg-[#D7897F]/20 text-[#F2B5AD]",
      }
    : {
        neutral: "bg-black/[0.05] text-[#7E7066]",
        good: "bg-[#96C7B3]/35 text-[#315A4B]",
        warn: "bg-[#F9B95C]/25 text-[#8A5A1B]",
        bad: "bg-[#B05F57]/15 text-[#8E3F38]",
        info: "bg-[#6398A9]/20 text-[#2C5A67]",
        accent: "bg-[#D7897F]/15 text-[#A2554C]",
      };
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-0.5 text-[10.5px] font-semibold ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
};

export const Toggle: React.FC<{
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
  showLabel?: boolean;
}> = ({ checked, onChange, label, disabled, showLabel = false }) => {
  const mk = useMk();
  return (
    <label className={`inline-flex items-center gap-2 ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 min-h-0 w-11 shrink-0 items-center rounded-full transition-colors ${mk.focus} ${
          checked ? "bg-[#D7897F]" : mk.isDark ? "bg-white/15" : "bg-[#E3D6CB]"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform motion-reduce:transition-none ${
            checked ? "translate-x-[22px] rtl:-translate-x-[22px]" : "translate-x-[2px] rtl:-translate-x-[2px]"
          }`}
        />
      </button>
      {showLabel && <span className={`text-[12px] font-semibold ${mk.textStrong}`}>{label}</span>}
    </label>
  );
};

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  size = "md",
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  size?: "sm" | "md";
}) {
  const mk = useMk();
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={`inline-flex max-w-full items-center gap-0.5 overflow-x-auto rounded-xl p-0.5 ${mk.isDark ? "bg-white/[0.06]" : "bg-[#F1ECE7]"}`}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={`whitespace-nowrap rounded-[10px] font-semibold transition-colors ${mk.focus} ${
              size === "sm" ? "min-h-[30px] px-2.5 py-1 text-[11px]" : "min-h-[34px] px-3 py-1.5 text-[12px]"
            } ${
              active
                ? mk.isDark
                  ? "bg-white/15 text-white"
                  : "bg-white text-[#141414] shadow-sm"
                : mk.isDark
                  ? "text-white/55 hover:text-white"
                  : "text-[#7E7066] hover:text-[#141414]"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export const FieldLabel: React.FC<{ label: string; hint?: string; children: React.ReactNode; htmlFor?: string }> = ({
  label,
  hint,
  children,
  htmlFor,
}) => {
  const mk = useMk();
  return (
    <div className="block min-w-0">
      <label htmlFor={htmlFor} className={`text-[11px] font-semibold ${mk.textSoft}`}>
        {label}
      </label>
      <div className="mt-1">{children}</div>
      {hint && <p className={`mt-1 text-[10.5px] leading-4 ${mk.textFaint}`}>{hint}</p>}
    </div>
  );
};

export const TextInput: React.FC<
  React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }
> = ({ label, hint, className = "", id, ...props }) => {
  const mk = useMk();
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <FieldLabel label={label} hint={hint} htmlFor={inputId}>
      <input id={inputId} {...props} className={`h-10 w-full ${mk.input} ${className}`} />
    </FieldLabel>
  );
};

export const SelectInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  hint?: string;
  disabled?: boolean;
  hideLabel?: boolean;
}> = ({ label, value, onChange, options, hint, disabled, hideLabel }) => {
  const mk = useMk();
  const id = useId();
  const select = (
    <select
      id={id}
      aria-label={hideLabel ? label : undefined}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className={`h-10 w-full ${mk.input} disabled:opacity-50`}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
  if (hideLabel) return select;
  return (
    <FieldLabel label={label} hint={hint} htmlFor={id}>
      {select}
    </FieldLabel>
  );
};

export const InlineNotice: React.FC<{
  tone?: "info" | "warn" | "bad" | "good";
  title?: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}> = ({ tone = "info", title, children, action, icon }) => {
  const { isDark } = useMk();
  const tones = isDark
    ? {
        info: "border-sky-300/20 bg-sky-400/[0.06] text-white/80",
        warn: "border-amber-300/25 bg-amber-400/[0.07] text-white/85",
        bad: "border-red-300/25 bg-red-400/[0.08] text-white/85",
        good: "border-emerald-300/20 bg-emerald-400/[0.06] text-white/80",
      }
    : {
        info: "border-[#6398A9]/25 bg-[#6398A9]/[0.07] text-[#2C4A54]",
        warn: "border-[#F9B95C]/45 bg-[#F9B95C]/[0.12] text-[#6E4716]",
        bad: "border-[#B05F57]/30 bg-[#FBEDEA] text-[#7A332D]",
        good: "border-[#96C7B3]/45 bg-[#96C7B3]/[0.14] text-[#28493D]",
      };
  return (
    <div
      role={tone === "bad" ? "alert" : undefined}
      className={`flex flex-wrap items-start gap-2.5 rounded-xl border px-3 py-2.5 text-[12px] leading-5 ${tones[tone]}`}
    >
      {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? "mt-0.5 opacity-90" : ""}>{children}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

/** Collapsed row that reveals secondary settings on demand. */
export const Disclosure: React.FC<{ title: string; meta?: React.ReactNode; children: React.ReactNode }> = ({
  title,
  meta,
  children,
}) => {
  const mk = useMk();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
        className={`flex w-full items-center gap-2 rounded-xl px-1 py-3 text-start ${mk.focus}`}
      >
        <span className={`me-auto text-[13px] font-semibold ${mk.textStrong}`}>{title}</span>
        {meta}
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${mk.textSoft} ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open && (
        <div id={panelId} className="pb-4">
          {children}
        </div>
      )}
    </div>
  );
};

/** Side drawer on desktop, full-height bottom sheet on mobile. */
export const Drawer: React.FC<{
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  closeLabel: string;
  width?: number;
}> = ({ open, onClose, title, subtitle, children, footer, closeLabel, width = 520 }) => {
  const mk = useMk();
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  // The page scroller is its own stacking context below the mobile nav; mounting
  // on the shell root keeps `dir` and the CRM skin while layering above it.
  const host = document.querySelector<HTMLElement>(".crm-sai-app-shell") ?? document.body;
  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-end justify-end sm:items-stretch" role="presentation">
      <button
        type="button"
        aria-label={closeLabel}
        tabIndex={-1}
        onClick={onClose}
        className={`absolute inset-0 ${mk.isDark ? "bg-black/55" : "bg-[#5C3423]/25"}`}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        style={{ maxWidth: width }}
        className={`relative z-10 flex max-h-[92svh] w-full flex-col overflow-hidden rounded-t-[24px] border outline-none sm:max-h-none sm:rounded-none sm:border-y-0 sm:border-e-0 ${
          mk.isDark ? "border-white/10 bg-[#171412]" : "border-[#EBDDD2] bg-[#FFFDF8]"
        }`}
      >
        <div className={`flex items-start gap-3 border-b px-4 py-3.5 sm:px-5 ${mk.divider}`}>
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className={`text-[15px] font-bold ${mk.textStrong}`}>
              {title}
            </h2>
            {subtitle && <div className={`mt-0.5 text-[11.5px] ${mk.textSoft}`}>{subtitle}</div>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${mk.focus} ${
              mk.isDark ? "text-white/60 hover:bg-white/10" : "text-[#7E7066] hover:bg-black/[0.05]"
            }`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">{children}</div>
        {footer && (
          <div className={`flex flex-wrap items-center justify-end gap-2 border-t px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))] sm:px-5 ${mk.divider}`}>
            {footer}
          </div>
        )}
      </div>
    </div>,
    host,
  );
};

export const SmallButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "ghost" | "primary" | "danger" }
> = ({ tone = "ghost", className = "", children, type = "button", ...props }) => {
  const mk = useMk();
  const tones = {
    primary: "bg-[#D7897F] text-white hover:bg-[#C97B71]",
    danger: mk.isDark ? "bg-red-400/10 text-red-300 hover:bg-red-400/20" : "bg-[#B05F57]/10 text-[#8E3F38] hover:bg-[#B05F57]/20",
    ghost: mk.isDark
      ? "bg-white/[0.06] text-white/75 hover:bg-white/[0.12]"
      : "bg-[#F1ECE7] text-[#5F5249] hover:bg-[#EBDDD2] hover:text-[#141414]",
  };
  return (
    <button
      type={type}
      {...props}
      className={`inline-flex min-h-[32px] items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-[11.5px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${mk.focus} ${tones[tone]} ${className}`}
    >
      {children}
    </button>
  );
};
