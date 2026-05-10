import React from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useSiteTheme } from "../../../contexts/SiteTheme";
import { useCrmT, useCrmLocale } from "../../SalonCRM/i18n/CrmLocale";
import {
  iconButtonSurface,
  textPrimary,
} from "../homeDashboardTokens";
import type { DateStripDay } from "../homeDashboardData";

interface DateStripProps {
  days: DateStripDay[];
  onSelectDay?: (id: string) => void;
  onPrev?: () => void;
  onNext?: () => void;
}

const DateStrip: React.FC<DateStripProps> = ({
  days,
  onSelectDay,
  onPrev,
  onNext,
}) => {
  const { isDark } = useSiteTheme();
  const t = useCrmT();
  const { isRTL } = useCrmLocale();

  const Prev = isRTL ? ChevronRight : ChevronLeft;
  const Next = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div className={`flex items-center gap-2 sm:gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
      <button
        type="button"
        title={t.common.today}
        aria-label={t.common.today}
        className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconButtonSurface(
          { isDark },
        )}`}
      >
        <CalendarDays className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={onPrev}
        aria-label="Previous days"
        className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconButtonSurface(
          { isDark },
        )}`}
      >
        <Prev className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        {days.map((day) => {
          const label = t.home[day.shortLabel];
          const active = day.isActive;
          const inactiveClass = isDark
            ? "text-white/45 hover:text-white/65"
            : "text-black/45 hover:text-black/60";
          return (
            <button
              key={day.id}
              type="button"
              onClick={() => onSelectDay?.(day.id)}
              className={`flex items-baseline gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors text-[12px] sm:text-[13px] font-medium whitespace-nowrap ${
                active
                  ? `${textPrimary({ isDark })} font-semibold`
                  : inactiveClass
              }`}
              style={{
                backgroundColor: active
                  ? isDark
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(0,0,0,0.04)"
                  : "transparent",
              }}
            >
              <span>{label}</span>
              <span className={active ? "" : "opacity-80"}>{day.dayNumber}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onNext}
        aria-label="Next days"
        className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconButtonSurface(
          { isDark },
        )}`}
      >
        <Next className="w-4 h-4" />
      </button>
    </div>
  );
};

export default DateStrip;
