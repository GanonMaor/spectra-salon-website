import React from "react";
import { Bell, Bluetooth, BluetoothOff, Heart } from "lucide-react";
import { useSiteTheme } from "../../../contexts/SiteTheme";
import { useCrmT, useCrmLocale } from "../../SalonCRM/i18n/CrmLocale";
import {
  iconButtonSurface,
  textPrimary,
  textSecondary,
} from "../homeDashboardTokens";
import type {
  BluetoothState,
  NotificationState,
} from "../homeDashboardData";

interface TopHeaderProps {
  dateLabel: string;
  bluetooth: BluetoothState;
  notifications: NotificationState;
  onToggleBluetooth?: () => void;
  onNotifications?: () => void;
  onFavorites?: () => void;
}

/**
 * Operational header — date/time, section title, and salon-floor controls.
 * Bluetooth icon flips visual state to surface the "scale not connected"
 * scenario from the spec.
 */
const TopHeader: React.FC<TopHeaderProps> = ({
  dateLabel,
  bluetooth,
  notifications,
  onToggleBluetooth,
  onNotifications,
  onFavorites,
}) => {
  const { isDark } = useSiteTheme();
  const t = useCrmT();
  const { isRTL } = useCrmLocale();

  const btTitle = bluetooth.connected
    ? `${t.home.bluetoothConnected} — ${bluetooth.deviceLabel}`
    : `${t.home.bluetoothDisconnected} — ${t.home.bluetoothDisconnectedDetail}`;

  return (
    <header className="relative overflow-hidden rounded-[28px] border border-white/70 bg-[#FFF8F0]/88 px-4 py-4 shadow-[0_18px_54px_rgba(92,52,35,0.10)] sm:px-5 sm:py-5">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 8% 12%, rgba(249,185,92,0.24), transparent 26%), radial-gradient(circle at 94% 18%, rgba(150,199,179,0.20), transparent 24%)",
        }}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p
            className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.22em] ${textSecondary(
              { isDark },
            )}`}
          >
            {dateLabel}
          </p>
          <h1
            className={`mt-2 text-[26px] sm:text-[32px] lg:text-[38px] font-black tracking-[-0.045em] leading-[0.95] ${textPrimary(
              { isDark },
            )}`}
          >
            {t.home.headerTitle}
          </h1>
          <p
            className={`mt-3 max-w-[42rem] text-[13px] sm:text-[14px] leading-relaxed ${textSecondary(
              { isDark },
            )}`}
          >
            {t.home.headerSubtitle}
          </p>
        </div>

        <div className={`relative z-10 flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
          <button
            type="button"
            title={t.home.favorites}
            aria-label={t.home.favorites}
            onClick={onFavorites}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${iconButtonSurface(
              { isDark },
            )}`}
          >
            <Heart className="w-[18px] h-[18px]" />
          </button>

          <button
            type="button"
            title={btTitle}
            aria-label={btTitle}
            onClick={onToggleBluetooth}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors relative ${iconButtonSurface(
              { isDark },
            )}`}
          >
            {bluetooth.connected ? (
              <Bluetooth className="w-[18px] h-[18px]" />
            ) : (
              <BluetoothOff className="w-[18px] h-[18px] text-amber-500" />
            )}
            {!bluetooth.connected && (
              <span
                className="absolute -bottom-0.5 -end-0.5 w-2.5 h-2.5 rounded-full bg-amber-500"
                style={{ boxShadow: "0 0 0 2px var(--bt-pulse-ring, #ffffff)" }}
              />
            )}
          </button>

          <button
            type="button"
            title={t.home.notifications}
            aria-label={t.home.notifications}
            onClick={onNotifications}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors relative ${iconButtonSurface(
              { isDark },
            )}`}
          >
            <Bell className="w-[18px] h-[18px]" />
            {notifications.unreadCount > 0 && (
              <span
                className="absolute top-1.5 end-1.5 w-2.5 h-2.5 rounded-full bg-red-500"
                style={{ boxShadow: "0 0 0 2px var(--bt-pulse-ring, #ffffff)" }}
              />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
