// ── Calendar Domain Types ────────────────────────────────────────────

export interface Employee {
  id: string;
  name: string;
  avatar: string;   // URL or initials fallback
  role: string;
  color: string;    // Tailwind-safe hex for appointment cards
}

export type AppointmentStatus = "confirmed" | "in-progress" | "completed" | "cancelled" | "no-show";

export interface Appointment {
  id: string;
  employeeId: string;
  clientName: string;
  serviceName: string;
  serviceCategory: "Color" | "Highlights" | "Toner" | "Straightening" | "Cut" | "Treatment" | "Other";
  start: Date;
  end: Date;
  status: AppointmentStatus;
  notes?: string;
}

export interface WorkingHours {
  employeeId: string;
  dayOfWeek: number;   // 0=Sun … 6=Sat
  startHour: number;   // e.g. 9
  endHour: number;     // e.g. 18
  breakStart?: number; // e.g. 13
  breakEnd?: number;   // e.g. 14
}

export type CalendarView = "week" | "day" | "list";

export interface CalendarState {
  view: CalendarView;
  currentDate: Date;
  selectedEmployeeId: string | null;  // null = all
  selectedAppointment: Appointment | null;
}
