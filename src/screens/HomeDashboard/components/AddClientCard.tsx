import React from "react";
import { Plus } from "lucide-react";
import { useSiteTheme } from "../../../contexts/SiteTheme";
import { useCrmT } from "../../SalonCRM/i18n/CrmLocale";
import {
  LAYOUT,
  SHADOW_SOFT,
  surfaceCardSoft,
  textPrimary,
  textSecondary,
} from "../homeDashboardTokens";

interface AddClientCardProps {
  onClick?: () => void;
}

/**
 * Placeholder-style card for opening the "create client visit" flow.
 * The faded background bars echo the visual rhythm of a Live Client card,
 * so the row reads as a consistent grid.
 */
const AddClientCard: React.FC<AddClientCardProps> = ({ onClick }) => {
  const { isDark } = useSiteTheme();
  const t = useCrmT();

  const ghostBar = isDark ? "bg-white/[0.05]" : "bg-black/[0.05]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex-shrink-0 ${LAYOUT.liveCardWidth} ${LAYOUT.cardRadius} p-4 flex flex-col gap-3 text-left ${surfaceCardSoft(
        { isDark },
      )} ${SHADOW_SOFT} transition-transform duration-200 hover:-translate-y-0.5`}
      aria-label={t.home.addNewClient}
    >
      <div className="flex items-start gap-2.5">
        <span className={`w-9 h-9 rounded-full ${ghostBar}`} aria-hidden />
        <div className="flex-1 space-y-1.5">
          <span className={`block h-2.5 w-24 rounded ${ghostBar}`} aria-hidden />
          <span className={`block h-2 w-16 rounded ${ghostBar}`} aria-hidden />
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-2 py-4">
        <span
          className="w-12 h-12 rounded-full flex items-center justify-center text-white"
          style={{ backgroundColor: "#0F172A" }}
        >
          <Plus className="w-5 h-5" />
        </span>
        <p className={`text-[14px] font-semibold ${textPrimary({ isDark })}`}>
          {t.home.addNewClient}
        </p>
        <p className={`text-[11px] ${textSecondary({ isDark })}`}>
          {t.home.addNewClientHint}
        </p>
      </div>

      <div className="flex items-center gap-2 mt-auto">
        <span className={`block h-2 flex-1 rounded ${ghostBar}`} aria-hidden />
        <span className={`block h-2 w-10 rounded ${ghostBar}`} aria-hidden />
      </div>
    </button>
  );
};

export default AddClientCard;
