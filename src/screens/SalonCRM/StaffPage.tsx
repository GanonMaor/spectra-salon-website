import React from "react";
import { Users, UserCog, Award } from "lucide-react";
import { useSiteTheme } from "../../contexts/SiteTheme";

const StaffPage: React.FC = () => {
  const { isDark } = useSiteTheme();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-[#1A1A1A]"}`}>Staff</h1>
        <p className={`text-sm mt-1 ${isDark ? "text-white/50" : "text-black/50"}`}>Manage your team members and performance</p>
      </div>

      {/* Placeholder cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Users, label: "Team Members", value: "\u2014", sub: "No data yet" },
          { icon: UserCog, label: "Active Today", value: "\u2014", sub: "Connect to enable" },
          { icon: Award, label: "Top Performer", value: "\u2014", sub: "Coming soon" },
        ].map(({ icon: Icon, label, value, sub }) => (
          <div
            key={label}
            className={`rounded-2xl sm:rounded-3xl border backdrop-blur-xl p-5 sm:p-6 ${
              isDark
                ? "border-white/[0.12] bg-black/[0.35]"
                : "border-black/[0.06] bg-white/[0.70]"
            }`}
            style={{ boxShadow: isDark
              ? "0 8px 40px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.06)"
              : "0 8px 40px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)"
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
                isDark ? "bg-white/[0.10] border-white/[0.10]" : "bg-black/[0.04] border-black/[0.06]"
              }`}>
                <Icon className={`w-4 h-4 ${isDark ? "text-white/70" : "text-black/50"}`} />
              </div>
              <p className={`text-[11px] font-medium uppercase tracking-wider ${isDark ? "text-white/50" : "text-black/50"}`}>{label}</p>
            </div>
            <p className={`text-3xl font-bold tracking-tight ${isDark ? "text-white" : "text-[#1A1A1A]"}`}>{value}</p>
            <p className={`text-xs mt-1 ${isDark ? "text-white/40" : "text-black/40"}`}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Empty state */}
      <div
        className={`rounded-2xl sm:rounded-3xl border backdrop-blur-xl p-12 text-center ${
          isDark
            ? "border-white/[0.12] bg-black/[0.35]"
            : "border-black/[0.06] bg-white/[0.70]"
        }`}
        style={{ boxShadow: isDark
          ? "0 8px 40px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.06)"
          : "0 8px 40px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)"
        }}
      >
        <div className={`mx-auto mb-5 w-16 h-16 rounded-2xl border flex items-center justify-center ${
          isDark ? "bg-white/10 border-white/10" : "bg-black/[0.04] border-black/[0.06]"
        }`}>
          <UserCog className={`w-7 h-7 ${isDark ? "text-white/60" : "text-black/40"}`} />
        </div>
        <h3 className={`text-lg font-bold mb-2 ${isDark ? "text-white" : "text-[#1A1A1A]"}`}>Team Management</h3>
        <p className={`text-sm max-w-md mx-auto leading-relaxed ${isDark ? "text-white/50" : "text-black/50"}`}>
          Staff profiles, roles, and performance metrics will appear here. Connect your Spectra account to sync team data.
        </p>
      </div>
    </div>
  );
};

export default StaffPage;
