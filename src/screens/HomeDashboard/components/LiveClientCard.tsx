import React from "react";
import { MoreHorizontal, Plus, Rocket } from "lucide-react";
import { useSiteTheme } from "../../../contexts/SiteTheme";
import { useCrmT } from "../../SalonCRM/i18n/CrmLocale";
import {
  LAYOUT,
  SHADOW_SOFT,
  surfaceCard,
  textPrimary,
  textSecondary,
  textInteractive,
  iconButtonSurface,
} from "../homeDashboardTokens";
import Avatar from "./Avatar";
import ServiceMiniCard from "./ServiceMiniCard";
import type { LiveClient, LiveService } from "../homeDashboardData";

interface LiveClientCardProps {
  client: LiveClient;
  onOpenClient?: (client: LiveClient) => void;
  onAddService?: (client: LiveClient) => void;
  onOpenService?: (client: LiveClient, service: LiveService) => void;
  onStartOrContinueMix?: (client: LiveClient, service: LiveService) => void;
  onOptions?: (client: LiveClient) => void;
}

const LiveClientCard: React.FC<LiveClientCardProps> = ({
  client,
  onOpenClient,
  onAddService,
  onOpenService,
  onStartOrContinueMix,
  onOptions,
}) => {
  const { isDark } = useSiteTheme();
  const t = useCrmT();

  return (
    <article
      className={`flex-shrink-0 ${LAYOUT.liveCardWidth} ${LAYOUT.cardRadius} p-4 sm:p-4 flex flex-col gap-3 ${surfaceCard(
        { isDark },
      )} ${SHADOW_SOFT}`}
    >
      <header className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={() => onOpenClient?.(client)}
          className="flex items-center gap-2.5 min-w-0 text-left"
        >
          <Avatar
            seed={client.avatarSeed}
            initials={client.initials}
            size={36}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <p
                className={`text-[14px] font-semibold leading-tight truncate ${textPrimary(
                  { isDark },
                )}`}
              >
                {client.name}
              </p>
              {client.isVip && (
                <Rocket className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              )}
            </div>
            <p
              className={`text-[11px] font-medium mt-0.5 ${textSecondary({ isDark })}`}
            >
              {client.arrivalLabel}
            </p>
          </div>
        </button>

        <button
          type="button"
          aria-label={t.home.options}
          title={t.home.options}
          onClick={() => onOptions?.(client)}
          className={`flex-shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full ${iconButtonSurface(
            { isDark },
          )}`}
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      </header>

      <div className="space-y-2">
        {client.services.map((service) => (
          <ServiceMiniCard
            key={service.id}
            service={service}
            onOpenService={() => onOpenService?.(client, service)}
            onStartOrContinueMix={() => onStartOrContinueMix?.(client, service)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => onAddService?.(client)}
        className={`flex items-center gap-2 px-2 py-1 -mx-1 -mb-1 rounded-lg text-[12px] font-medium transition-colors ${textInteractive(
          { isDark },
        )}`}
      >
        <span
          className="w-7 h-7 rounded-full flex items-center justify-center text-white"
          style={{ backgroundColor: "#0F172A" }}
        >
          <Plus className="w-3.5 h-3.5" />
        </span>
        <span>{t.home.newService}</span>
      </button>
    </article>
  );
};

export default LiveClientCard;
