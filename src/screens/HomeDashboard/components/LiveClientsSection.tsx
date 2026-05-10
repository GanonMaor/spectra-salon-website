import React from "react";
import { ChevronRight } from "lucide-react";
import { useSiteTheme } from "../../../contexts/SiteTheme";
import { useCrmT, useCrmLocale } from "../../SalonCRM/i18n/CrmLocale";
import {
  textInteractive,
  textPrimary,
  textSecondary,
} from "../homeDashboardTokens";
import AddClientCard from "./AddClientCard";
import LiveClientCard from "./LiveClientCard";
import type { LiveClient } from "../homeDashboardData";

import type { LiveService } from "../homeDashboardData";

interface LiveClientsSectionProps {
  clients: LiveClient[];
  onAddClient?: () => void;
  onOpenClient?: (client: LiveClient) => void;
  onSeeAll?: () => void;
  onAddService?: (client: LiveClient) => void;
  onOpenService?: (client: LiveClient, service: LiveService) => void;
  onStartOrContinueMix?: (client: LiveClient, service: LiveService) => void;
  onOptions?: (client: LiveClient) => void;
}

const LiveClientsSection: React.FC<LiveClientsSectionProps> = ({
  clients,
  onAddClient,
  onOpenClient,
  onSeeAll,
  onAddService,
  onOpenService,
  onStartOrContinueMix,
  onOptions,
}) => {
  const { isDark } = useSiteTheme();
  const t = useCrmT();
  const { isRTL } = useCrmLocale();

  const isEmpty = clients.length === 0;

  return (
    <section aria-label={t.home.liveClients} className="space-y-4 sm:space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2
          className={`text-[18px] sm:text-[20px] font-semibold tracking-tight ${textPrimary(
            { isDark },
          )}`}
        >
          {t.home.liveClients}
        </h2>
        <button
          type="button"
          onClick={onSeeAll}
          className={`inline-flex items-center gap-1 text-[12px] sm:text-[13px] font-semibold ${textInteractive(
            { isDark },
          )}`}
        >
          <span>{t.home.seeAll}</span>
          <ChevronRight
            className="w-4 h-4"
            style={{ transform: isRTL ? "scaleX(-1)" : undefined }}
          />
        </button>
      </div>

      <div
        className="flex gap-4 sm:gap-5 overflow-x-auto pb-3 -mx-3 sm:-mx-4 lg:-mx-8 px-3 sm:px-4 lg:px-8"
        style={{ scrollbarWidth: "none" }}
      >
        <AddClientCard onClick={onAddClient} />
        {!isEmpty &&
          clients.map((client) => (
            <LiveClientCard
              key={client.id}
              client={client}
              onOpenClient={onOpenClient}
              onAddService={onAddService}
              onOpenService={onOpenService}
              onStartOrContinueMix={onStartOrContinueMix}
              onOptions={onOptions}
            />
          ))}
      </div>

      {isEmpty && (
        <div
          className={`text-center py-10 ${textSecondary({ isDark })}`}
          role="status"
        >
          <p className="text-[14px] font-semibold">{t.home.emptyTitle}</p>
          <p className="text-[12px] mt-1">{t.home.emptySubtitle}</p>
        </div>
      )}
    </section>
  );
};

export default LiveClientsSection;
