/**
 * Real-salon adapter: maps CRM customers, services and appointments into the
 * marketing dataset. No fixtures are ever added here — an empty salon stays
 * empty. The CRM has no consent fields yet, so consent is "unknown": marketing
 * is blocked, transactional messages are allowed unless opted out.
 */

import { useMemo } from "react";
import {
  useAppointments,
  useCRMReady,
  useCRMSalon,
  useCustomers,
  useServices,
  useStaff,
} from "../data/crmHooks";
import type { Appointment, Customer, Service, StaffMember } from "../data/crmTypes";
import type {
  MarketingAppointment,
  MarketingAppointmentStatus,
  MarketingCustomer,
  MarketingDataset,
  MarketingService,
} from "./types";

interface SalonLike {
  name?: string;
  businessName?: string;
  phone?: string;
  address?: string;
  city?: string;
  timezone?: string;
}

function mapCustomer(customer: Customer): MarketingCustomer {
  return {
    id: customer.id,
    firstName: customer.firstName,
    lastName: customer.lastName,
    phone: customer.phone,
    consent: { transactional: { status: "unknown" }, marketing: { status: "unknown" } },
  };
}

function mapService(service: Service): MarketingService {
  return {
    id: service.id,
    name: service.name,
    priceCents: service.defaultPriceCents > 0 ? service.defaultPriceCents : null,
    durationMinutes: service.defaultDurationMinutes,
  };
}

function mapStatus(status: Appointment["status"]): MarketingAppointmentStatus {
  if (status === "in-progress") return "confirmed";
  return status;
}

/** Split CRM appointments that share a `groupId` are one visit. */
export function mapAppointments(appointments: Appointment[], staff: StaffMember[]): MarketingAppointment[] {
  const staffNames = new Map(staff.map((member) => [member.id, member.name]));
  const groups = new Map<string, Appointment[]>();
  for (const appointment of appointments) {
    if (!appointment.customerId) continue;
    const key = appointment.groupId || appointment.id;
    const list = groups.get(key) ?? [];
    list.push(appointment);
    groups.set(key, list);
  }
  return [...groups.entries()].map(([key, items]) => {
    const sorted = [...items].sort((a, b) => a.startTime.localeCompare(b.startTime));
    const first = sorted[0];
    const prices = sorted.map((item) => item.estimatedRevenueCents ?? item.listPriceCents);
    const priceCents = prices.every((price) => typeof price === "number" && price > 0)
      ? prices.reduce<number>((sum, price) => sum + (price ?? 0), 0)
      : null;
    const endTime = sorted.reduce((latest, item) => (item.endTime > latest ? item.endTime : latest), first.endTime);
    const status = mapStatus(first.status);
    return {
      id: key,
      customerId: first.customerId!,
      serviceIds: [...new Set(sorted.map((item) => item.serviceId).filter(Boolean) as string[])],
      staffName: staffNames.get(first.staffMemberId),
      startTime: first.startTime,
      endTime,
      status,
      priceCents,
      createdAt: first.startTime,
      completedAt: status === "completed" ? endTime : undefined,
    };
  });
}

export function buildSalonDataset(
  salon: SalonLike | undefined,
  customers: Customer[],
  services: Service[],
  appointments: Appointment[],
  staff: StaffMember[],
): MarketingDataset {
  const address = [salon?.address, salon?.city].filter(Boolean).join(", ");
  return {
    salon: {
      name: salon?.businessName || salon?.name || "",
      phone: salon?.phone,
      address: address || undefined,
      timezone: salon?.timezone || "Asia/Jerusalem",
      bookingUrl: null,
    },
    customers: customers.filter((customer) => customer.status !== "archived").map(mapCustomer),
    services: services.map(mapService),
    appointments: mapAppointments(appointments, staff),
  };
}

export function useSalonMarketingDataset(): { ready: boolean; dataset: MarketingDataset } {
  const ready = useCRMReady();
  const salon = useCRMSalon() as SalonLike | undefined;
  const customers = useCustomers();
  const services = useServices();
  const appointments = useAppointments();
  const staff = useStaff();
  const dataset = useMemo(
    () => buildSalonDataset(salon, customers, services, appointments, staff),
    [salon, customers, services, appointments, staff],
  );
  return { ready, dataset };
}
