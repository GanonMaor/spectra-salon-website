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
    <header className="flex flex-col gap-3 sm:gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p
            className={`text-[12px] sm:text-[13px] font-semibold tracking-tight ${textSecondary(
              { isDark },
            )}`}
          >
            {dateLabel}
          </p>
          <h1
            className={`mt-1 text-[22px] sm:text-[26px] lg:text-[28px] font-semibold tracking-tight leading-tight ${textPrimary(
              { isDark },
            )}`}
          >
            {t.home.headerTitle}
          </h1>
          <p
            className={`mt-2 max-w-[42rem] text-[13px] sm:text-[14px] leading-relaxed ${textSecondary(
              { isDark },
            )}`}
          >
            {t.home.headerSubtitle}
          </p>
        </div>

        <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
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
