import React from "react";
import { Users, UserCog, Award } from "lucide-react";

const StaffPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Staff</h1>
        <p className="text-sm text-white/50 mt-1">Manage your team members and performance</p>
      </div>

      {/* Placeholder cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Users, label: "Team Members", value: "—", sub: "No data yet" },
          { icon: UserCog, label: "Active Today", value: "—", sub: "Connect to enable" },
          { icon: Award, label: "Top Performer", value: "—", sub: "Coming soon" },
        ].map(({ icon: Icon, label, value, sub }) => (
          <div
            key={label}
            className="rounded-2xl sm:rounded-3xl border border-white/[0.12] bg-black/[0.35] backdrop-blur-xl p-5 sm:p-6"
            style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-white/[0.10] border border-white/[0.10] flex items-center justify-center">
                <Icon className="w-4 h-4 text-white/70" />
              </div>
              <p className="text-[11px] text-white/50 font-medium uppercase tracking-wider">{label}</p>
            </div>
            <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
            <p className="text-xs text-white/40 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Empty state */}
      <div
        className="rounded-2xl sm:rounded-3xl border border-white/[0.12] bg-black/[0.35] backdrop-blur-xl p-12 text-center"
        style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.06)" }}
      >
        <div className="mx-auto mb-5 w-16 h-16 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
          <UserCog className="w-7 h-7 text-white/60" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Team Management</h3>
        <p className="text-sm text-white/50 max-w-md mx-auto leading-relaxed">
          Staff profiles, roles, and performance metrics will appear here. Connect your Spectra account to sync team data.
        </p>
      </div>
    </div>
  );
};

export default StaffPage;
