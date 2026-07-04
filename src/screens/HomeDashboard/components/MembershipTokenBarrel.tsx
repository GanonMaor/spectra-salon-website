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
    ? "border-white/[0.12] bg-black/[0.45]"
    : "border-white/70 bg-[#FFF8F0]/88";
  const glow = isDark
    ? "rgba(244,185,88,0.18)"
    : "rgba(92,52,35,0.10)";
  const chip = isDark
    ? "border-white/[0.10] bg-white/[0.06] text-white/75"
    : "border-white/70 bg-white/55 text-[#7E7066]";

  return (
    <section
      aria-label={t.home.tokenBarrelTitle}
      className={`relative overflow-hidden rounded-[30px] border ${shell} ${SHADOW_LIFTED}`}
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
            "radial-gradient(circle at 10% 16%, rgba(249,185,92,0.28), transparent 26%), radial-gradient(circle at 92% 12%, rgba(215,137,127,0.22), transparent 24%), linear-gradient(135deg, rgba(255,248,240,0.90), rgba(255,253,248,0.74))",
        }}
      />
      <div className="absolute -end-10 top-10 hidden h-28 w-28 rounded-full bg-[#F9B95C]/65 lg:block" />
      <div className="absolute -start-10 bottom-8 hidden h-44 w-20 rounded-full bg-[#274E32] lg:block" />

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

            <h2 className={`mt-4 max-w-[18ch] text-[30px] font-black leading-[0.98] tracking-[-0.045em] sm:text-[40px] ${textPrimary({ isDark })}`}>
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
          <div className="absolute inset-x-2 bottom-3 top-3 rounded-[36px] border border-white/45 bg-white/20" />
          <div
            className="absolute inset-x-6 bottom-7 overflow-hidden rounded-b-[34px] rounded-t-[22px]"
            style={{ height: `${Math.max(36, fillPct)}%` }}
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(249,185,92,0.96) 0%, rgba(215,137,127,0.90) 56%, rgba(150,199,179,0.86) 100%)",
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
          <div className="absolute left-1/2 top-3 h-8 w-[82%] -translate-x-1/2 rounded-[999px] border border-white/50 bg-white/32" />
          <div className="absolute left-1/2 bottom-3 h-8 w-[74%] -translate-x-1/2 rounded-[999px] border border-[#EBDDD2] bg-white/28" />

          {TOKEN_DOTS.map((position, index) => (
            <span
              key={position}
              className={`absolute h-8 w-8 rounded-full border ${
                isDark
                  ? "border-white/60 bg-white/90"
                  : "border-amber-400/55 bg-white"
              } shadow-[0_8px_18px_rgba(0,0,0,0.12)] ${position}`}
              style={{
                transform: `translateY(${index % 2 === 0 ? "4px" : "-2px"})`,
              }}
              aria-hidden
            >
              <span className="absolute inset-1 rounded-full border border-amber-400/80" />
            </span>
          ))}

          <div className={`absolute ${isRTL ? "left-5" : "right-5"} top-8 flex items-center gap-2 rounded-full ${
            isDark ? "bg-black/70 text-white" : "bg-black/80 text-white"
          } px-3 py-2 shadow-lg`}>
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
        isDark ? "border-white/[0.08] bg-white/[0.05]" : "border-white/70 bg-white/55"
      }`}
    >
      <p className={`text-[18px] font-semibold leading-none ${textPrimary({ isDark })}`}>{value}</p>
      <p className={`mt-1 text-[10px] font-semibold leading-tight ${textMuted({ isDark })}`}>{label}</p>
    </div>
  );
}

export default MembershipTokenBarrel;
