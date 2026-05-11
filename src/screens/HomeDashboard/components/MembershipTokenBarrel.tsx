import React from "react";
import { Bluetooth, BluetoothOff, Coins, Sparkles } from "lucide-react";
import { useSiteTheme } from "../../../contexts/SiteTheme";
import { useCrmLocale, useCrmT } from "../../SalonCRM/i18n/CrmLocale";
import {
  SHADOW_LIFTED,
  textPrimary,
  textSecondary,
  textMuted,
} from "../homeDashboardTokens";
import type { BluetoothState } from "../homeDashboardData";

interface MembershipTokenBarrelProps {
  activeClientCount: number;
  appointmentCount: number;
  bluetooth: BluetoothState;
}

const TOKEN_CAPACITY = 240;

const TOKEN_DOTS = [
  "left-[12%] top-[42%]",
  "left-[22%] top-[28%]",
  "left-[31%] top-[52%]",
  "left-[42%] top-[34%]",
  "left-[52%] top-[58%]",
  "left-[61%] top-[24%]",
  "left-[70%] top-[46%]",
  "left-[82%] top-[32%]",
] as const;

const MembershipTokenBarrel: React.FC<MembershipTokenBarrelProps> = ({
  activeClientCount,
  appointmentCount,
  bluetooth,
}) => {
  const { isDark } = useSiteTheme();
  const { isRTL } = useCrmLocale();
  const t = useCrmT();

  const usedTokens = Math.min(
    TOKEN_CAPACITY - 24,
    32 + activeClientCount * 18 + appointmentCount * 9 + (bluetooth.connected ? 8 : 0),
  );
  const remainingTokens = TOKEN_CAPACITY - usedTokens;
  const fillPct = Math.round((usedTokens / TOKEN_CAPACITY) * 100);

  const shell = isDark
    ? "border-white/[0.10] bg-[#111214]"
    : "border-black/[0.06] bg-[#FFF9F0]";
  const glow = isDark
    ? "rgba(244,185,88,0.24)"
    : "rgba(228,139,166,0.22)";
  const chip = isDark
    ? "border-white/[0.10] bg-white/[0.06] text-white/75"
    : "border-black/[0.06] bg-white/70 text-black/65";

  return (
    <section
      aria-label={t.home.tokenBarrelTitle}
      className={`relative overflow-hidden rounded-[28px] border ${shell} ${SHADOW_LIFTED}`}
      style={{
        boxShadow: `0 18px 60px ${glow}, ${
          isDark
            ? "inset 0 1px 0 rgba(255,255,255,0.05)"
            : "inset 0 1px 0 rgba(255,255,255,0.85)"
        }`,
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(70% 70% at 12% 18%, rgba(244,185,88,0.22), transparent 60%), radial-gradient(65% 80% at 92% 12%, rgba(125,195,200,0.20), transparent 58%)",
        }}
      />

      <div className="relative grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.05fr_0.95fr] lg:p-7">
        <div className="flex flex-col justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold ${chip}`}>
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                {t.home.tokenBarrelEyebrow}
              </span>
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold ${chip}`}>
                {bluetooth.connected ? (
                  <Bluetooth className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <BluetoothOff className="h-3.5 w-3.5 text-amber-400" />
                )}
                {bluetooth.connected
                  ? t.home.tokenBarrelScaleConnected
                  : t.home.tokenBarrelScaleManual}
              </span>
            </div>

            <h2 className={`mt-4 max-w-[18ch] text-[28px] font-semibold leading-[1.05] tracking-tight sm:text-[34px] ${textPrimary({ isDark })}`}>
              {t.home.tokenBarrelTitle}
            </h2>
            <p className={`mt-3 max-w-[34rem] text-[13px] leading-relaxed sm:text-[14px] ${textSecondary({ isDark })}`}>
              {t.home.tokenBarrelSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <TokenMetric value={usedTokens.toString()} label={t.home.tokenBarrelUsed} isDark={isDark} />
            <TokenMetric value={remainingTokens.toString()} label={t.home.tokenBarrelRemaining} isDark={isDark} />
            <TokenMetric
              value={`${activeClientCount}/${appointmentCount}`}
              label={`${t.home.tokenBarrelActiveClients} / ${t.home.tokenBarrelAppointments}`}
              isDark={isDark}
            />
          </div>
        </div>

        <div className="relative min-h-[210px] lg:min-h-[240px]">
          <div className="absolute inset-x-2 bottom-3 top-3 rounded-[36px] border border-white/25 bg-black/[0.10] backdrop-blur-sm" />
          <div
            className="absolute inset-x-6 bottom-7 overflow-hidden rounded-b-[34px] rounded-t-[22px]"
            style={{ height: `${Math.max(36, fillPct)}%` }}
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(244,185,88,0.95) 0%, rgba(228,139,166,0.92) 58%, rgba(125,195,200,0.86) 100%)",
              }}
            />
            <div
              className="absolute inset-0 opacity-40"
              style={{
                background:
                  "repeating-linear-gradient(0deg, rgba(255,255,255,0.28) 0 2px, transparent 2px 18px)",
              }}
            />
          </div>

          <div className="absolute inset-x-6 bottom-7 top-7 rounded-[34px] border border-white/35" />
          <div className="absolute left-1/2 top-3 h-8 w-[82%] -translate-x-1/2 rounded-[999px] border border-white/35 bg-white/20 backdrop-blur-md" />
          <div className="absolute left-1/2 bottom-3 h-8 w-[74%] -translate-x-1/2 rounded-[999px] border border-black/10 bg-black/10 backdrop-blur-md" />

          {TOKEN_DOTS.map((position, index) => (
            <span
              key={position}
              className={`absolute h-8 w-8 rounded-full border border-white/55 bg-white/80 shadow-[0_8px_18px_rgba(0,0,0,0.12)] ${position}`}
              style={{
                transform: `translateY(${index % 2 === 0 ? "4px" : "-2px"})`,
              }}
              aria-hidden
            >
              <span className="absolute inset-1 rounded-full border border-amber-300/70" />
            </span>
          ))}

          <div className={`absolute ${isRTL ? "left-5" : "right-5"} top-8 flex items-center gap-2 rounded-full bg-black/70 px-3 py-2 text-white shadow-lg`}>
            <Coins className="h-4 w-4 text-amber-300" />
            <span className="text-[12px] font-semibold">{fillPct}%</span>
          </div>
        </div>
      </div>
    </section>
  );
};

function TokenMetric({
  value,
  label,
  isDark,
}: {
  value: string;
  label: string;
  isDark: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border px-3 py-3 ${
        isDark ? "border-white/[0.08] bg-white/[0.05]" : "border-black/[0.05] bg-white/70"
      }`}
    >
      <p className={`text-[18px] font-semibold leading-none ${textPrimary({ isDark })}`}>{value}</p>
      <p className={`mt-1 text-[10px] font-semibold leading-tight ${textMuted({ isDark })}`}>{label}</p>
    </div>
  );
}

export default MembershipTokenBarrel;
