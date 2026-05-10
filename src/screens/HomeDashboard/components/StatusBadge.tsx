import React from "react";
import { useCrmT } from "../../SalonCRM/i18n/CrmLocale";
import { STATUS_PALETTE } from "../homeDashboardTokens";
import type { LiveServiceStatus } from "../homeDashboardData";

interface StatusBadgeProps {
  status: LiveServiceStatus;
  className?: string;
}

const VARIANT_FOR_STATUS: Record<
  LiveServiceStatus,
  keyof typeof STATUS_PALETTE | null
> = {
  scheduled: null,
  active: "active",
  mix_in_progress: "mixInProgress",
  done: "done",
  reweigh_pending: "reweighPending",
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const t = useCrmT();
  const variant = VARIANT_FOR_STATUS[status];
  if (!variant) return null;

  const palette = STATUS_PALETTE[variant];

  const labelMap: Record<keyof typeof STATUS_PALETTE, string> = {
    active: t.home.statusActive,
    mixInProgress: t.home.statusMixInProgress,
    done: t.home.statusDone,
    reweighPending: t.home.statusReweighPending,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold ${
        className ?? ""
      }`}
      style={{
        backgroundColor: palette.bg,
        color: palette.text,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: palette.dot }}
      />
      {labelMap[variant]}
    </span>
  );
};

export default StatusBadge;
