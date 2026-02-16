import React from "react";
import { Users, UserPlus, Search } from "lucide-react";

const CustomersPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Customers</h1>
          <p className="text-sm text-white/50 mt-1">Browse and manage your client database</p>
        </div>
        <button className="h-9 px-4 rounded-xl bg-white/10 border border-white/[0.12] text-[13px] text-white/80 font-medium hover:bg-white/15 transition-all flex items-center gap-2">
          <UserPlus className="w-3.5 h-3.5" />
          Add Client
        </button>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-3 h-4 w-4 text-white/30" />
        <input
          type="text"
          placeholder="Search clients by name, phone, or email..."
          className="w-full h-11 pl-10 pr-4 rounded-2xl border border-white/[0.12] bg-black/[0.35] backdrop-blur-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20"
        />
      </div>

      {/* Placeholder cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { icon: Users, label: "Total Clients", value: "—", sub: "No data yet" },
          { icon: UserPlus, label: "New This Month", value: "—", sub: "Connect to enable" },
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
          <Users className="w-7 h-7 text-white/60" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Client Database</h3>
        <p className="text-sm text-white/50 max-w-md mx-auto leading-relaxed">
          Your customer profiles and visit history will appear here. Connect your Spectra account to sync client data.
        </p>
      </div>
    </div>
  );
};

export default CustomersPage;
