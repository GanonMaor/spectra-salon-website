import React, { useMemo } from "react";
import { BarChart3, CalendarDays, Package, Scissors, UserCog, Users } from "lucide-react";
import { useSiteTheme } from "../../contexts/SiteTheme";
import {
  useAppointments,
  useCustomers,
  useInventoryItems,
  useLowStockItems,
  useServices,
  useStaff,
} from "./data/crmHooks";

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

const AnalyticsPage: React.FC = () => {
  const { isDark } = useSiteTheme();
  const customers = useCustomers();
  const staff = useStaff();
  const appointments = useAppointments();
  const services = useServices();
  const inventory = useInventoryItems();
  const lowStock = useLowStockItems();

  const metrics = useMemo(() => {
    const activeCustomers = customers.filter((customer) => customer.status === "active").length;
    const activeStaff = staff.filter((member) => member.status === "active").length;
    const activeServices = services.length;
    const completedAppointments = appointments.filter((appointment) => appointment.status === "completed").length;
    const upcomingAppointments = appointments.filter((appointment) => {
      const startsAt = new Date(appointment.startTime).getTime();
      return Number.isFinite(startsAt) && startsAt >= Date.now() && appointment.status !== "cancelled";
    }).length;

    return [
      { label: "Active customers", value: activeCustomers, icon: Users },
      { label: "Active staff", value: activeStaff, icon: UserCog },
      { label: "Active services", value: activeServices, icon: Scissors },
      { label: "Upcoming appointments", value: upcomingAppointments, icon: CalendarDays },
      { label: "Completed appointments", value: completedAppointments, icon: BarChart3 },
      { label: "Inventory items", value: inventory.length, icon: Package },
    ];
  }, [appointments, customers, inventory.length, services.length, staff]);

  return (
    <div className={`min-h-full px-4 py-6 sm:px-6 lg:px-8 ${isDark ? "text-white" : "text-[#141414]"}`}>
      <div className="mx-auto max-w-6xl space-y-6">
        <div
          className={`rounded-[28px] border p-6 shadow-sm ${
            isDark
              ? "border-white/10 bg-white/[0.04]"
              : "border-[#EBDDD2] bg-white"
          }`}
        >
          <p className={`text-xs font-black uppercase tracking-[0.2em] ${isDark ? "text-white/45" : "text-[#9A8B82]"}`}>
            Pilot validation
          </p>
          <h1 className="mt-2 text-2xl font-black">Live analytics readiness</h1>
          <p className={`mt-2 max-w-3xl text-sm font-semibold leading-6 ${isDark ? "text-white/60" : "text-[#6F625A]"}`}>
            This CRM analytics view only shows live tenant data from the current salon session.
            Historical financial reports are intentionally hidden until the live analytics pipeline is connected.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.label}
                className={`rounded-[24px] border p-5 ${
                  isDark
                    ? "border-white/10 bg-white/[0.04]"
                    : "border-[#EBDDD2] bg-[#FFF9F4]"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className={`text-xs font-black uppercase tracking-[0.16em] ${isDark ? "text-white/45" : "text-[#9A8B82]"}`}>
                      {metric.label}
                    </p>
                    <p className="mt-2 text-3xl font-black">{formatNumber(metric.value)}</p>
                  </div>
                  <div className={`rounded-2xl p-3 ${isDark ? "bg-white/10 text-white" : "bg-[#F8E5D8] text-[#B05F57]"}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div
          className={`rounded-[24px] border p-5 ${
            isDark
              ? "border-white/10 bg-white/[0.04]"
              : "border-[#EBDDD2] bg-white"
          }`}
        >
          <h2 className="text-base font-black">Data cleanliness guard</h2>
          <p className={`mt-2 text-sm font-semibold leading-6 ${isDark ? "text-white/60" : "text-[#6F625A]"}`}>
            No revenue, cost, utilization, retention, or product-usage charts are rendered from mock data here.
            When the live analytics tables are connected, this page can be expanded using only tenant-scoped DB records.
          </p>
          <div className={`mt-4 rounded-2xl px-4 py-3 text-sm font-bold ${isDark ? "bg-white/5 text-white/70" : "bg-[#F8E5D8] text-[#7E7066]"}`}>
            Low stock items from live inventory: {formatNumber(lowStock.length)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
