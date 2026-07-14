/**
 * Shared UI primitives for the unified settings surface (Team, Services &
 * Departments, Security & Permissions). Extracted so every section renders with
 * the same design language, spacing, RTL behavior, and theming.
 */

import React from "react";
import { CALENDAR_DESIGN_COLORS } from "../scheduleDesign";

export const SETTINGS_COLOR_PRESETS = [
  CALENDAR_DESIGN_COLORS.nectarine,
  CALENDAR_DESIGN_COLORS.peche,
  CALENDAR_DESIGN_COLORS.menthe,
  CALENDAR_DESIGN_COLORS.lagune,
  CALENDAR_DESIGN_COLORS.rose,
  CALENDAR_DESIGN_COLORS.sauge,
  CALENDAR_DESIGN_COLORS.lilas,
];

export function useSettingsStyles(isDark: boolean) {
  return {
    card: isDark ? "border-white/[0.10] bg-white/[0.04]" : "border-[#EBDDD2] bg-[#FFFDF8]",
    cardSoft: isDark ? "border-white/[0.08] bg-white/[0.02]" : "border-[#EFE3DA] bg-white/70",
    textStrong: isDark ? "text-white" : "text-[#141414]",
    textSoft: isDark ? "text-white/55" : "text-[#7E7066]",
    textFaint: isDark ? "text-white/40" : "text-[#9A8B80]",
    input: isDark
      ? "bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#D7897F]"
      : "bg-[#FFF8F0] border border-[#EBDDD2] rounded-lg px-3 py-2 text-[#141414] text-sm outline-none focus:border-[#D7897F]",
  };
}

export const PrimaryButton: React.FC<{
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  type?: "button" | "submit";
}> = ({ onClick, children, disabled, type = "button" }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className="inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-[12px] font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
    style={{ background: CALENDAR_DESIGN_COLORS.nectarine }}
  >
    {children}
  </button>
);

export const GhostButton: React.FC<{
  onClick?: () => void;
  children: React.ReactNode;
  isDark: boolean;
  disabled?: boolean;
}> = ({ onClick, children, isDark, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-[12px] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
      isDark ? "bg-white/[0.06] text-white/70 hover:bg-white/[0.12]" : "bg-[#F1ECE7] text-[#7E7066] hover:bg-[#EBDDD2] hover:text-[#141414]"
    }`}
  >
    {children}
  </button>
);

export const IconBtn: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
  isDark: boolean;
  disabled?: boolean;
  title?: string;
  danger?: boolean;
}> = ({ onClick, children, isDark, disabled = false, title, danger = false }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    aria-label={title}
    className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
      disabled
        ? isDark
          ? "cursor-not-allowed text-white/20"
          : "cursor-not-allowed text-black/20"
        : danger
          ? "text-[#B05F57] hover:bg-[#B05F57]/10"
          : isDark
            ? "text-white/55 hover:bg-white/10 hover:text-white"
            : "text-black/50 hover:bg-black/[0.05] hover:text-black"
    }`}
  >
    {children}
  </button>
);

export const StatusBadge: React.FC<{ status: string; isDark: boolean; label?: string }> = ({ status, isDark, label }) => {
  const tone = (() => {
    switch (status) {
      case "active":
        return isDark ? "bg-emerald-400/10 text-emerald-300" : "bg-[#96C7B3]/35 text-[#315A4B]";
      case "pending":
      case "invited":
        return isDark ? "bg-amber-400/10 text-amber-300" : "bg-[#F9B95C]/25 text-[#8A5A1B]";
      case "suspended":
        return isDark ? "bg-orange-400/10 text-orange-300" : "bg-[#F1B37A]/30 text-[#8A4B1B]";
      case "revoked":
      case "archived":
      case "inactive":
      case "expired":
        return isDark ? "bg-white/10 text-white/40" : "bg-black/[0.06] text-black/40";
      case "accepted":
        return isDark ? "bg-sky-400/10 text-sky-300" : "bg-[#6398A9]/25 text-[#2C5A67]";
      default:
        return isDark ? "bg-white/10 text-white/50" : "bg-black/[0.06] text-black/50";
    }
  })();
  return <span className={`rounded px-2 py-0.5 text-[9px] font-semibold ${tone}`}>{label ?? status}</span>;
};

export const ColorPicker: React.FC<{
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
}> = ({ value, onChange, compact = false }) => (
  <div className={`flex items-center gap-1 ${compact ? "" : "rounded-lg border border-[#EBDDD2] bg-[#FFF8F0] px-2"}`}>
    {SETTINGS_COLOR_PRESETS.map((color) => {
      const active = value.toLowerCase() === color.toLowerCase();
      return (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className={`${compact ? "h-6 w-6" : "h-7 w-7"} rounded-full border transition-transform ${
            active ? "scale-110 border-[#141414]" : "border-white/70"
          }`}
          style={{ background: color }}
          aria-label={`Color ${color}`}
        />
      );
    })}
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${compact ? "h-6 w-6" : "h-7 w-7"} cursor-pointer rounded-full border-0 bg-transparent p-0`}
      aria-label="Custom color"
    />
  </div>
);

export const Field: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  isDark: boolean;
  type?: string;
  placeholder?: string;
  hint?: string;
}> = ({ label, value, onChange, isDark, type = "text", placeholder, hint }) => {
  const s = useSettingsStyles(isDark);
  return (
    <label className="block">
      <span className={`text-[11px] font-black ${s.textSoft}`}>{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={`mt-1 h-11 w-full ${s.input}`}
      />
      {hint && <span className={`mt-1 block text-[10px] font-semibold ${s.textFaint}`}>{hint}</span>}
    </label>
  );
};

/** Empty-state / loading / error placeholder used across sections. */
export const SettingsPlaceholder: React.FC<{
  isDark: boolean;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  tone?: "empty" | "error";
  action?: React.ReactNode;
}> = ({ isDark, icon, title, description, tone = "empty", action }) => (
  <div
    className={`grid place-items-center rounded-2xl border border-dashed p-8 text-center ${
      tone === "error"
        ? isDark
          ? "border-[#B05F57]/40 bg-[#B05F57]/10"
          : "border-[#E3B0AA] bg-[#FBEDEA]"
        : isDark
          ? "border-white/10 bg-white/[0.02]"
          : "border-[#EBDDD2] bg-[#FFFDF9]/60"
    }`}
    role={tone === "error" ? "alert" : undefined}
  >
    <div className="max-w-[360px]">
      {icon && (
        <div
          className={`mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl ${
            tone === "error" ? "bg-[#B05F57]/15 text-[#B05F57]" : isDark ? "bg-white/10 text-white/60" : "bg-[#F8E5D8] text-[#B05F57]"
          }`}
        >
          {icon}
        </div>
      )}
      <h3 className={`text-[14px] font-black ${isDark ? "text-white" : "text-[#141414]"}`}>{title}</h3>
      {description && (
        <p className={`mt-1.5 text-[12px] font-semibold leading-5 ${isDark ? "text-white/55" : "text-[#7E7066]"}`}>{description}</p>
      )}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  </div>
);

const AVATAR_THUMBNAIL_SIZE = 320;

/**
 * Downscale and crop an uploaded image to a compact circular thumbnail.
 * Offsets are normalized from -1 (left/top) to 1 (right/bottom), allowing the
 * staff editor to preserve the chosen framing instead of always center-cropping.
 */
export async function createSettingsAvatarThumbnail(
  source: string,
  zoom = 1,
  offsetX = 0,
  offsetY = 0,
): Promise<string> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = source;
  });
  const canvas = document.createElement("canvas");
  canvas.width = AVATAR_THUMBNAIL_SIZE;
  canvas.height = AVATAR_THUMBNAIL_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported");
  ctx.fillStyle = "#FFF8F0";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const scale = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight) * Math.max(1, zoom);
  const width = img.naturalWidth * scale;
  const height = img.naturalHeight * scale;
  const maxX = Math.max(0, (width - canvas.width) / 2);
  const maxY = Math.max(0, (height - canvas.height) / 2);
  const dx = canvas.width / 2 - width / 2 + Math.max(-1, Math.min(1, offsetX)) * maxX;
  const dy = canvas.height / 2 - height / 2 + Math.max(-1, Math.min(1, offsetY)) * maxY;
  ctx.drawImage(img, dx, dy, width, height);
  return canvas.toDataURL("image/webp", 0.82);
}

export function initialsFromName(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}
