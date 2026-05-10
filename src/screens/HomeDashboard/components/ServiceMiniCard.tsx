import React from "react";
import { ArrowRight, Clock } from "lucide-react";
import { useCrmLocale, useCrmT } from "../../SalonCRM/i18n/CrmLocale";
import {
  LAYOUT,
  SERVICE_PALETTE,
  SHADOW_SOFT,
} from "../homeDashboardTokens";
import Avatar from "./Avatar";
import StatusBadge from "./StatusBadge";
import type { LiveService } from "../homeDashboardData";

interface ServiceMiniCardProps {
  service: LiveService;
  onOpenService?: (service: LiveService) => void;
  onStartOrContinueMix?: (service: LiveService) => void;
}

/**
 * The colored service block that lives inside a Live Client card.
 * Surfaces the operational state at a glance and exposes the primary
 * action (Start Mix / Continue Mix / Reweigh) via the round arrow button.
 */
const ServiceMiniCard: React.FC<ServiceMiniCardProps> = ({
  service,
  onOpenService,
  onStartOrContinueMix,
}) => {
  const t = useCrmT();
  const { isRTL } = useCrmLocale();
  const palette = SERVICE_PALETTE[service.serviceType];

  const handleArrow = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onStartOrContinueMix?.(service);
  };

  return (
    <button
      type="button"
      onClick={() => onOpenService?.(service)}
      className={`group relative w-full ${LAYOUT.innerRadius} overflow-hidden text-left ${SHADOW_SOFT} transition-transform duration-200 hover:-translate-y-0.5`}
      style={{
        background: palette.liveBg,
        color: palette.liveText,
      }}
    >
      <div className="relative p-4 sm:p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[15px] sm:text-[16px] font-semibold leading-tight tracking-tight">
              {service.name}
            </p>
            <p className="text-[12px] font-medium leading-snug opacity-90 mt-0.5">
              | {service.category}
            </p>
          </div>
          <span
            onClick={handleArrow}
            role="button"
            tabIndex={0}
            aria-label={service.hasOpenMix ? "Continue mix" : "Start mix"}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-105 cursor-pointer"
            style={{
              background: "rgba(255,255,255,0.92)",
              color: "#1A1A1A",
            }}
          >
            <ArrowRight
              className="w-4 h-4"
              style={{ transform: isRTL ? "scaleX(-1)" : undefined }}
            />
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold"
            style={{ background: palette.badge }}
          >
            <Clock className="w-3 h-3" />
            <span>{service.elapsedLabel}</span>
          </div>

          <div className="flex -space-x-2">
            {service.assignedStylists.slice(0, 3).map((stylist) => (
              <Avatar
                key={stylist.id}
                seed={stylist.avatarSeed}
                initials={stylist.initials}
                size={26}
                ringColor={palette.liveBg}
              />
            ))}
          </div>
        </div>

        {service.status !== "scheduled" && service.status !== "active" && (
          <div className="flex items-center justify-start">
            <StatusBadge status={service.status} />
          </div>
        )}

        {service.status === "active" && (
          <div className="flex items-center justify-start">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide opacity-90">
              {t.home.statusActive}
            </span>
          </div>
        )}
      </div>
    </button>
  );
};

export default ServiceMiniCard;
