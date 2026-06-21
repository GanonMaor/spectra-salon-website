/**
 * Booking flow modal (create-mode wrapper).
 *
 * The booking flow and the appointment editor now share one engine:
 * `AppointmentComposerModal`. This wrapper preserves the original
 * create-only API used by the schedule page's "New appointment" entry points.
 */

import React from "react";
import {
  AppointmentComposerModal,
  type AppointmentComposerProps,
} from "./AppointmentComposerModal";

type BookingFlowProps = Omit<
  AppointmentComposerProps,
  "mode" | "editingAppointment" | "onUpdate" | "onDelete"
>;

export const BookingFlowModal: React.FC<BookingFlowProps> = (props) => (
  <AppointmentComposerModal mode="create" {...props} />
);
