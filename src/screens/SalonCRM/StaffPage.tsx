import React, { useMemo } from "react";
import { Users, UserCog, Award, Star } from "lucide-react";
import { useSiteTheme } from "../../contexts/SiteTheme";
import { useCrmT } from "./i18n/CrmLocale";
import {
  useCRMSystemState,
  useStaff,
  useStaffPerformance,
} from "./data/crmHooks";

/**
 * Staff overview page.
 *
 * Pulls from the same `StaffMember` records that drive the Schedule
 * grid columns and Appointment ownership. Performance metrics are
 * derived from completed/in-progress appointments via
 * `selectStaffPerformance`, ensuring the numbers shown here stay in
 * sync with what Analytics and AI insights see.
 */
const StaffPage: React.FC = () => {
  const { isDark } = useSiteTheme();
  const t = useCrmT();
  const staff = useStaff();
  const systemState = useCRMSystemState();
  const performance = useStaffPerformance();

  // ── Derived KPI cards ──────────────────────────────────────────
  const summary = useMemo(() => {
    const dayOfWeek = new Date(systemState.activeDate).getUTCDay();
    const activeToday = staff.filter((m) =>
      m.status === "active" &&
      m.workingHours.some((wh) => wh.dayOfWeek === dayOfWeek),
    ).length;
    const top = [...performance].sort(
      (a, b) => b.utilizationPct - a.utilizationPct,
    )[0];
    return {
      teamCount: staff.length,
      activeToday,
      topPerformerName: top && top.utilizationPct > 0 ? top.staff.name : null,
      topPerformerUtilization: top?.utilizationPct ?? 0,
    };
  }, [staff, performance, systemState.activeDate]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1
          className={`text-2xl font-bold tracking-tight ${
            isDark ? "text-white" : "text-[#1A1A1A]"
          }`}
        >
          {t.staff.title}
        </h1>
        <p
          className={`text-sm mt-1 ${
            isDark ? "text-white/50" : "text-black/50"
          }`}
        >
          {t.staff.subtitle}
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: Users,
            label: t.staff.teamMembers,
            value: String(summary.teamCount),
            sub: `${staff.filter((s) => s.status === "active").length} ${t.staff.activeSuffix}`,
          },
          {
            icon: UserCog,
            label: t.staff.activeToday,
            value: String(summary.activeToday),
            sub: t.staff.connectToEnable,
          },
          {
            icon: Award,
            label: t.staff.topPerformer,
            value: summary.topPerformerName ?? "—",
            sub: summary.topPerformerName
              ? `${summary.topPerformerUtilization}% ${t.staff.utilizationSuffix}`
              : t.staff.comingSoon,
          },
        ].map(({ icon: Icon, label, value, sub }) => (
          <div
            key={label}
            className={`rounded-2xl sm:rounded-3xl border backdrop-blur-xl p-5 sm:p-6 ${
              isDark
                ? "border-white/[0.12] bg-black/[0.35]"
                : "border-black/[0.06] bg-white/[0.70]"
            }`}
            style={{
              boxShadow: isDark
                ? "0 8px 40px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.06)"
                : "0 8px 40px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)",
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
                  isDark
                    ? "bg-white/[0.10] border-white/[0.10]"
                    : "bg-black/[0.04] border-black/[0.06]"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isDark ? "text-white/70" : "text-black/50"
                  }`}
                />
              </div>
              <p
                className={`text-[11px] font-medium uppercase tracking-wider ${
                  isDark ? "text-white/50" : "text-black/50"
                }`}
              >
                {label}
              </p>
            </div>
            <p
              className={`text-3xl font-bold tracking-tight ${
                isDark ? "text-white" : "text-[#1A1A1A]"
              }`}
            >
              {value}
            </p>
            <p
              className={`text-xs mt-1 ${
                isDark ? "text-white/55" : "text-black/55"
              }`}
            >
              {sub}
            </p>
          </div>
        ))}
      </div>

      {/* Staff list with derived performance */}
      <div
        className={`rounded-2xl sm:rounded-3xl border backdrop-blur-xl p-4 sm:p-5 ${
          isDark
            ? "border-white/[0.12] bg-black/[0.35]"
            : "border-black/[0.06] bg-white/[0.70]"
        }`}
        style={{
          boxShadow: isDark
            ? "0 8px 40px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.06)"
            : "0 8px 40px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)",
        }}
      >
        <h3
          className={`text-sm font-semibold mb-4 ${
            isDark ? "text-white" : "text-[#1A1A1A]"
          }`}
        >
          {t.staff.teamManagement}
        </h3>

        {staff.length === 0 ? (
          <p
            className={`text-sm text-center py-6 ${
              isDark ? "text-white/55" : "text-black/55"
            }`}
          >
            {t.staff.teamManagementDesc}
          </p>
        ) : (
          <div className="space-y-2">
            {performance.map((row) => (
              <StaffRow
                key={row.staff.id}
                name={row.staff.name}
                role={row.staff.role}
                color={row.staff.color}
                rating={row.rating}
                appointments={row.appointments}
                completed={row.completed}
                upcoming={row.upcoming}
                inProgress={row.inProgress}
                utilizationPct={row.utilizationPct}
                isDark={isDark}
                labels={{
                  total: t.staff.statTotal,
                  done: t.staff.statDone,
                  live: t.staff.statLive,
                  upcoming: t.staff.statUpcoming,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface StaffRowProps {
  name: string;
  role: string;
  color: string;
  rating: number;
  appointments: number;
  completed: number;
  upcoming: number;
  inProgress: number;
  utilizationPct: number;
  isDark: boolean;
  labels: {
    total: string;
    done: string;
    live: string;
    upcoming: string;
  };
}

const StaffRow: React.FC<StaffRowProps> = ({
  name,
  role,
  color,
  rating,
  appointments,
  completed,
  upcoming,
  inProgress,
  utilizationPct,
  isDark,
  labels,
}) => {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl border ${
        isDark
          ? "border-white/[0.06] bg-white/[0.04]"
          : "border-black/[0.04] bg-black/[0.02]"
      }`}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
        style={{ backgroundColor: color }}
      >
        {initials || "?"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p
            className={`text-sm font-semibold truncate ${
              isDark ? "text-white" : "text-[#1A1A1A]"
            }`}
          >
            {name}
          </p>
          <span
            className={`text-[10px] flex items-center gap-0.5 ${
              isDark ? "text-amber-300" : "text-amber-600"
            }`}
          >
            <Star className="w-3 h-3 fill-current" />
            {rating.toFixed(1)}
          </span>
        </div>
        <p
          className={`text-[11px] ${
            isDark ? "text-white/55" : "text-black/55"
          }`}
        >
          {role}
        </p>
      </div>
      <div className="hidden sm:flex items-center gap-4">
        <Stat label={labels.total} value={appointments} isDark={isDark} />
        <Stat label={labels.done} value={completed} isDark={isDark} />
        <Stat label={labels.live} value={inProgress} isDark={isDark} />
        <Stat label={labels.upcoming} value={upcoming} isDark={isDark} />
      </div>
      <div
        className={`w-20 text-end ${
          isDark ? "text-white/70" : "text-black/65"
        }`}
      >
        <p className="text-sm font-semibold">{utilizationPct}%</p>
        <div
          className={`mt-1 h-1.5 rounded-full overflow-hidden ${
            isDark ? "bg-white/10" : "bg-black/10"
          }`}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${utilizationPct}%`,
              backgroundColor: color,
            }}
          />
        </div>
      </div>
    </div>
  );
};

const Stat: React.FC<{ label: string; value: number; isDark: boolean }> = ({
  label,
  value,
  isDark,
}) => (
  <div className="text-center">
    <p
      className={`text-sm font-bold ${
        isDark ? "text-white" : "text-[#1A1A1A]"
      }`}
    >
      {value}
    </p>
    <p
      className={`text-[10px] uppercase tracking-wider ${
        isDark ? "text-white/55" : "text-black/55"
      }`}
    >
      {label}
    </p>
  </div>
);

export default StaffPage;
