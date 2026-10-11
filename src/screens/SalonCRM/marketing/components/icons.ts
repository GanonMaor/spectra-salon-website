import type React from "react";
import { BellRing, CalendarCheck2, CalendarX2, Repeat2, Shuffle } from "lucide-react";
import type { AutomationKind } from "../types";

export const KIND_ICONS: Record<AutomationKind, React.ComponentType<{ className?: string }>> = {
  booking_confirmation: CalendarCheck2,
  appointment_reminder: BellRing,
  appointment_rescheduled: Shuffle,
  appointment_cancelled: CalendarX2,
  rebooking_invite: Repeat2,
};
