import React from "react";
import { render, screen } from "@testing-library/react";
import { FlowView } from "../FlowView";
import { CrmLocaleProvider } from "../../i18n/CrmLocale";
import type { Appointment } from "../calendarTypes";

jest.mock("../../data/crmHooks", () => ({
  useLiveVisits: () => [{ appointmentId: "a-live", customerId: "c1", status: "active" }],
  useCustomers: () => [
    { id: "c1", firstName: "Michaela", lastName: "Stone", avatarUrl: "https://example.com/michaela.jpg" },
  ],
  useStaff: () => [],
}));

function wrap(ui: React.ReactElement) {
  return render(<CrmLocaleProvider>{ui}</CrmLocaleProvider>);
}

function appt(overrides: Partial<Appointment> & Pick<Appointment, "id" | "start" | "end">): Appointment {
  return {
    employeeId: "e1",
    clientName: "Michaela Stone",
    serviceName: "Root Color",
    serviceCategory: "Color",
    status: "confirmed",
    ...overrides,
  };
}

describe("FlowView", () => {
  const now = new Date();
  now.setHours(11, 0, 0, 0);

  it("renders a dense timeline from existing appointments without duplicating data", () => {
    const appointments = [
      appt({
        id: "a-live",
        customerId: "c1",
        clientName: "Michaela Stone",
        start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0),
        end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0),
      }),
      appt({
        id: "a-later",
        clientName: "Rachel Levi",
        start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0),
        end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 0),
        employeeId: "e2",
        serviceName: "Cut & Style",
        serviceCategory: "Cut",
      }),
    ];

    wrap(
      <FlowView
        day={now}
        appointments={appointments}
        employees={[
          { id: "e1", name: "Noa Levi", avatar: "NL", role: "Stylist", color: "#D7897F" },
          { id: "e2", name: "Maya Azulay", avatar: "MA", role: "Stylist", color: "#6398A9" },
        ]}
        selectedEmployeeId={null}
        catalog={{ departments: [], categories: [], services: [], resources: [], timingOverrides: [] }}
        salonTimeZone="Asia/Jerusalem"
        isDark={false}
        accentColor="#D7897F"
        onSelectAppointment={jest.fn()}
      />,
    );

    expect(screen.getByTestId("schedule-flow-view")).toBeInTheDocument();
    expect(screen.getByText("Michaela Stone")).toBeInTheDocument();
    expect(screen.getByText("Rachel Levi")).toBeInTheDocument();
    expect(screen.getAllByText(/In salon|בסלון/).length).toBeGreaterThan(0);
    expect(screen.getByText("09:00")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Michaela Stone/ })).toBeInTheDocument();
    expect(screen.getByText("Root Color")).toBeInTheDocument();
    expect(screen.getByText("Cut & Style")).toBeInTheDocument();
    expect(screen.getAllByText(/Noa Levi/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Maya Azulay/).length).toBeGreaterThan(0);
  });
});
