import React from "react";
import { useSiteTheme } from "../../../contexts/SiteTheme";
import { useCrmT } from "../../SalonCRM/i18n/CrmLocale";
import { textPrimary } from "../homeDashboardTokens";
import DateStrip from "./DateStrip";
import AppointmentCard from "./AppointmentCard";
import type { Appointment, DateStripDay } from "../homeDashboardData";

interface UpNextSectionProps {
  days: DateStripDay[];
  appointments: Appointment[];
  onAppointmentClick?: (appointment: Appointment) => void;
  onSelectDay?: (dayId: string) => void;
}

const UpNextSection: React.FC<UpNextSectionProps> = ({
  days,
  appointments,
  onAppointmentClick,
  onSelectDay,
}) => {
  const { isDark } = useSiteTheme();
  const t = useCrmT();

  return (
    <section aria-label={t.home.upNext} className="space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2
          className={`text-[18px] sm:text-[20px] font-semibold tracking-tight ${textPrimary(
            { isDark },
          )}`}
        >
          {t.home.upNext}
        </h2>
        <DateStrip days={days} onSelectDay={onSelectDay} />
      </div>

      <div
        className="flex gap-4 sm:gap-5 overflow-x-auto pb-2 -mx-3 sm:-mx-4 lg:-mx-8 px-3 sm:px-4 lg:px-8"
        style={{ scrollbarWidth: "none" }}
      >
        {appointments.map((appt) => (
          <AppointmentCard
            key={appt.id}
            appointment={appt}
            onClick={onAppointmentClick}
          />
        ))}
      </div>
    </section>
  );
};

export default UpNextSection;
