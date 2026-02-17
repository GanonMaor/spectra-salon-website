// ── Calendar Domain Types ────────────────────────────────────────────

export interface Employee {
  id: string;
  name: string;
  avatar: string;   // URL or initials fallback
  role: string;
  color: string;    // Tailwind-safe hex for appointment cards
}

export type AppointmentStatus = "confirmed" | "in-progress" | "completed" | "cancelled" | "no-show";

export type SegmentType = "service" | "apply" | "wait" | "wash" | "dry" | "checkin" | "checkout";

export interface AppointmentSegment {
  id: string;
  appointmentId: string;
  segmentType: SegmentType;
  label: string;
  start: Date;
  end: Date;
  sortOrder: number;
  productGrams?: number;
  notes?: string;
}

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
  segments?: AppointmentSegment[];
  groupId?: string; // links split segments visually
  salonId?: string;
  customerId?: string;
}

// ── CRM Customer ──────────────────────────────────────────────────

export interface CrmCustomer {
  id: string;
  salonId: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  email?: string;
  notes?: string;
  tags: string[];
  avatarUrl?: string;
  status: "active" | "inactive" | "archived";
  createdAt: string;
  updatedAt: string;
  visitCount?: number;
  lastVisit?: string;
}

// ── Customer Visit ────────────────────────────────────────────────

export interface CustomerVisit {
  id: string;
  salonId: string;
  customerId: string;
  appointmentId?: string;
  visitDate: string;
  serviceName?: string;
  serviceCategory?: string;
  employeeName?: string;
  employeeId?: string;
  durationMinutes?: number;
  price?: number;
  notes?: string;
  createdAt: string;
}

// ── Salon (tenant) ────────────────────────────────────────────────

export interface Salon {
  id: string;
  name: string;
  slug: string;
  phone?: string;
  email?: string;
  city?: string;
  state?: string;
  timezone: string;
  status: string;
}

export interface SplitTemplateStep {
  id: string;
  stepType: SegmentType;
  label: string;
  durationMinutes: number;
  sortOrder: number;
  isGap: boolean;
}

export interface SplitTemplate {
  id: string;
  name: string;
  category: string;
  description?: string;
  steps: SplitTemplateStep[];
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
