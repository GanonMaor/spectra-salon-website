import React, { useState, useEffect, useCallback } from "react";
import type { CalendarViewMode } from "./types";
import { APPOINTMENTS, ACTIVE_CLIENTS, PALETTE } from "./mockData";
import { ApplicationFrame } from "./components/ApplicationFrame";
import { CalendarShell } from "./components/CalendarShell";
import { DailyStatusBar } from "./components/DailyStatusBar";
import { StaffDayCalendar } from "./components/StaffDayCalendar";
import { ServiceCyclePanel } from "./components/ServiceCyclePanel";
import { SalonFloorOverview } from "./components/SalonFloorOverview";
import { Legend } from "./components/Legend";
import { BookingFlowModal } from "./components/BookingFlowModal";

export const AdvancedSalonCalendarMockupPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<CalendarViewMode>("staff");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>("apt-noa");
  const [selectedClientId, setSelectedClientId] = useState<string | null>("cl-noa");
  const [appointments, setAppointments] = useState(APPOINTMENTS);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingStaffId, setBookingStaffId] = useState<string | null>(null);
  const [bookingStartHour, setBookingStartHour] = useState<number | null>(null);

  useEffect(() => {
    document.title = "Advanced Salon Calendar | Spectra";
    document.documentElement.style.background = "#1A120C";
    return () => {
      document.documentElement.style.background = "";
    };
  }, []);

  const selectedAppointment = appointments.find((a) => a.id === selectedAppointmentId) || null;

  const handleSelectAppointment = useCallback((id: string) => {
    setSelectedAppointmentId(id);
    const client = ACTIVE_CLIENTS.find((c) => c.appointmentId === id);
    if (client) setSelectedClientId(client.id);
  }, []);

  const handleSelectClient = useCallback((id: string) => {
    setSelectedClientId(id);
    const client = ACTIVE_CLIENTS.find((c) => c.id === id);
    if (client) setSelectedAppointmentId(client.appointmentId);
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedAppointmentId(null);
  }, []);

  const handleMarkComplete = useCallback((stageId: string) => {
    setAppointments((prev) =>
      prev.map((apt) => ({
        ...apt,
        stages: apt.stages.map((s) =>
          s.id === stageId ? { ...s, status: "completed" as const } : s
        ),
      }))
    );
  }, []);

  const handleEmptySlotClick = useCallback((staffId: string, hour: number) => {
    setBookingStaffId(staffId);
    setBookingStartHour(hour);
    setBookingModalOpen(true);
  }, []);

  const handleCloseBookingModal = useCallback(() => {
    setBookingModalOpen(false);
    setBookingStaffId(null);
    setBookingStartHour(null);
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(160deg, #1A120C 0%, #0D0907 100%)",
        padding: "24px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div style={{ width: "100%", height: "100%", maxWidth: "1600px", maxHeight: "960px" }}>
        <ApplicationFrame>
          <DailyStatusBar />
          <CalendarShell viewMode={viewMode} onViewModeChange={setViewMode}>
            {/* Main calendar area */}
            <StaffDayCalendar
              selectedAppointmentId={selectedAppointmentId}
              onSelectAppointment={handleSelectAppointment}
              onEmptySlotClick={handleEmptySlotClick}
            />

            {/* Service detail panel when appointment selected */}
            {selectedAppointment && (
              <ServiceCyclePanel
                appointment={selectedAppointment}
                onClose={handleClosePanel}
                onMarkComplete={handleMarkComplete}
              />
            )}

            {/* Floor overview sidebar */}
            <SalonFloorOverview
              selectedClientId={selectedClientId}
              onSelectClient={handleSelectClient}
            />
          </CalendarShell>
          <Legend />
        </ApplicationFrame>
      </div>

      {/* Booking flow modal */}
      <BookingFlowModal
        open={bookingModalOpen}
        staffId={bookingStaffId}
        startHour={bookingStartHour}
        onClose={handleCloseBookingModal}
      />
    </div>
  );
};
