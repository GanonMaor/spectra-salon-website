import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Calendar,
  Users,
  UserCog,
  BarChart3,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
  { id: "schedule",  label: "Schedule",   icon: Calendar,  path: "/crm/schedule" },
  { id: "customers", label: "Customers",  icon: Users,     path: "/crm/customers" },
  { id: "staff",     label: "Staff",      icon: UserCog,   path: "/crm/staff" },
  { id: "analytics", label: "Analytics",  icon: BarChart3, path: "/crm/analytics" },
] as const;

function getActiveId(pathname: string): string {
  const match = NAV_ITEMS.find((n) => pathname.startsWith(n.path));
  return match ? match.id : "analytics";
}

const SalonCRMPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeId = getActiveId(location.pathname);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* ── Background ── */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat will-change-transform"
        style={{ backgroundImage: "url('/salooon0000.jpg')" }}
      />
      <div className="fixed inset-0 z-[1] bg-black/60 backdrop-blur-[2px]" />
      <div className="fixed inset-0 z-[1] bg-gradient-to-b from-black/28 via-black/8 to-black/45" />

      {/* ── Layout container ── */}
      <div className="relative z-10 flex min-h-screen">

        {/* ── Sidebar (desktop) ── */}
        <aside className="hidden lg:flex flex-col w-[220px] flex-shrink-0 py-6 pl-4 pr-2">
          {/* Logo / brand */}
          <div className="px-3 mb-8">
            <img
              src="/spectra-logo-new.png"
              alt="Spectra"
              className="h-5 w-auto opacity-80"
              onError={(e) => { e.currentTarget.src = "/spectra_logo.png"; }}
            />
            <p className="text-[10px] text-white/40 font-medium uppercase tracking-[0.15em] mt-2">Salon CRM</p>
          </div>

          {/* Nav items */}
          <nav className="flex-1 space-y-1">
            {NAV_ITEMS.map(({ id, label, icon: Icon, path }) => {
              const active = id === activeId;
              return (
                <button
                  key={id}
                  onClick={() => navigate(path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group ${
                    active
                      ? "bg-white/[0.12] text-white shadow-sm"
                      : "text-white/50 hover:text-white/80 hover:bg-white/[0.06]"
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-white" : "text-white/40 group-hover:text-white/60"}`} />
                  {label}
                  {active && <ChevronRight className="w-3 h-3 ml-auto text-white/40" />}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-3 pt-6 border-t border-white/[0.08] mt-4">
            <p className="text-[10px] text-white/25 leading-relaxed">
              Powered by Spectra AI
            </p>
          </div>
        </aside>

        {/* ── Mobile sidebar overlay ── */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
            <aside className="relative z-10 w-[260px] h-full bg-black/80 backdrop-blur-2xl border-r border-white/[0.08] flex flex-col py-6 px-4">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <img
                    src="/spectra-logo-new.png"
                    alt="Spectra"
                    className="h-5 w-auto opacity-80"
                    onError={(e) => { e.currentTarget.src = "/spectra_logo.png"; }}
                  />
                  <p className="text-[10px] text-white/40 font-medium uppercase tracking-[0.15em] mt-2">Salon CRM</p>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="flex-1 space-y-1">
                {NAV_ITEMS.map(({ id, label, icon: Icon, path }) => {
                  const active = id === activeId;
                  return (
                    <button
                      key={id}
                      onClick={() => { navigate(path); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-medium transition-all duration-200 ${
                        active
                          ? "bg-white/[0.12] text-white shadow-sm"
                          : "text-white/50 hover:text-white/80 hover:bg-white/[0.06]"
                      }`}
                    >
                      <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${active ? "text-white" : "text-white/40"}`} />
                      {label}
                    </button>
                  );
                })}
              </nav>
            </aside>
          </div>
        )}

        {/* ── Main content ── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* ── Top bar ── */}
          <header className="flex-shrink-0 px-3 sm:px-6 pt-4 sm:pt-6 pb-2">
            <div
              className="rounded-2xl sm:rounded-3xl border border-white/[0.12] bg-black/[0.30] backdrop-blur-xl px-3 sm:px-5 py-2.5 flex items-center gap-2"
              style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.04)" }}
            >
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden w-8 h-8 rounded-lg bg-white/[0.08] flex items-center justify-center text-white/60 hover:text-white transition-colors mr-1"
              >
                <Menu className="w-4 h-4" />
              </button>

              {/* Top tabs */}
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                {NAV_ITEMS.map(({ id, label, icon: Icon, path }) => {
                  const active = id === activeId;
                  return (
                    <button
                      key={id}
                      onClick={() => navigate(path)}
                      className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-[12px] sm:text-[13px] font-semibold whitespace-nowrap transition-all duration-200 ${
                        active
                          ? "bg-white/[0.14] text-white shadow-sm"
                          : "text-white/45 hover:text-white/70 hover:bg-white/[0.06]"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${active ? "text-white" : "text-white/35"}`} />
                      <span className="hidden sm:inline">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </header>

          {/* ── Page content ── */}
          <main className="flex-1 px-3 sm:px-6 py-4 sm:py-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default SalonCRMPage;
