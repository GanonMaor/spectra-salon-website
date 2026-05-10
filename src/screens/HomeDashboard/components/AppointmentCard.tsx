import React from "react";
import { useSiteTheme } from "../../../contexts/SiteTheme";
import {
  LAYOUT,
  SERVICE_PALETTE,
  SHADOW_SOFT,
  textPrimary,
  textSecondary,
} from "../homeDashboardTokens";
import Avatar from "./Avatar";
import type { Appointment } from "../homeDashboardData";

interface AppointmentCardProps {
  appointment: Appointment;
  onClick?: (appointment: Appointment) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onClick,
}) => {
  const { isDark } = useSiteTheme();
  const palette = SERVICE_PALETTE[appointment.serviceType];

  return (
    <button
      type="button"
      onClick={() => onClick?.(appointment)}
      className={`group flex flex-col text-left ${LAYOUT.appointmentCardWidth} flex-shrink-0`}
    >
      <div
        className={`relative ${LAYOUT.appointmentCardHeight} ${LAYOUT.cardRadius} overflow-hidden ${SHADOW_SOFT} transition-transform duration-200 group-hover:-translate-y-0.5`}
        style={{
          background: palette.appointmentBg,
          color: palette.appointmentText,
        }}
      >
        <div className="absolute inset-0 p-4 flex flex-col justify-between">
          <div>
            <p className="text-[15px] sm:text-[16px] font-semibold leading-tight tracking-tight">
              {appointment.serviceName}
            </p>
            <p className="text-[12px] sm:text-[13px] font-medium opacity-90 leading-snug mt-1">
              | {appointment.serviceCategory}
            </p>
          </div>
          <div>
            <Avatar
              seed={appointment.clientAvatarSeed}
              initials={appointment.clientInitials}
              size={34}
              ringColor="rgba(255,255,255,0.85)"
            />
          </div>
        </div>
      </div>

      <div className="mt-2 px-1">
        <p className={`text-[13px] font-semibold ${textPrimary({ isDark })}`}>
          {appointment.startLabel}
        </p>
        <p
          className={`text-[11px] font-medium leading-tight mt-0.5 ${textSecondary(
            { isDark },
          )}`}
        >
          {appointment.serviceName.toLowerCase()} and{" "}
          {appointment.serviceCategory.toLowerCase()}
        </p>
      </div>
    </button>
  );
};

export default AppointmentCard;
