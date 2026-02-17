import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Calendar,
  Users,
  UserCog,
  BarChart3,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  Building2,
  ChevronDown,
} from "lucide-react";
import { apiClient } from "../../api/client";
import type { Salon } from "./calendar/calendarTypes";

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

function SalonSwitcher({ collapsed: isCollapsed }: { collapsed: boolean }) {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [open, setOpen] = useState(false);
  const currentSalonId = apiClient.getSalonId();
  const currentSalon = salons.find((s) => s.id === currentSalonId) || salons[0];

  useEffect(() => {
    apiClient.getSalons().then((res) => {
      if (res.salons) setSalons(res.salons);
    }).catch(() => {
      setSalons([{ id: "salon-look", name: "Salon Look", slug: "salon-look", timezone: "Asia/Jerusalem", status: "active" }]);
    });
  }, []);

  const handleSwitch = (salon: Salon) => {
    apiClient.setSalonId(salon.id);
    setOpen(false);
    window.location.reload();
  };

  if (salons.length === 0) return null;

  if (isCollapsed) {
    return (
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-lg bg-white/[0.08] flex items-center justify-center text-white/60 hover:bg-white/[0.12] transition-all mb-4 relative"
        title={currentSalon?.name || "Switch Salon"}
      >
        <Building2 className="w-4 h-4" />
        {open && (
          <div className="absolute left-full ml-2 top-0 z-[70] w-56 rounded-xl border border-white/[0.12] bg-black/90 backdrop-blur-2xl shadow-xl overflow-hidden">
            {salons.slice(0, 20).map((s) => (
              <button
                key={s.id}
                onClick={() => handleSwitch(s)}
                className={`w-full text-left px-3 py-2 text-[12px] transition-colors ${
                  s.id === currentSalonId ? "text-white bg-white/[0.10] font-semibold" : "text-white/60 hover:bg-white/[0.06]"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        )}
      </button>
    );
  }

  return (
    <div className="relative mb-4 px-1">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.10] transition-all text-left"
      >
        <Building2 className="w-4 h-4 text-white/40 flex-shrink-0" />
        <span className="text-[12px] font-semibold text-white truncate flex-1">{currentSalon?.name || "Select Salon"}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-white/30 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-1 right-1 top-full mt-1 z-[70] max-h-60 overflow-y-auto rounded-xl border border-white/[0.12] bg-black/90 backdrop-blur-2xl shadow-xl">
          {salons.slice(0, 30).map((s) => (
            <button
              key={s.id}
              onClick={() => handleSwitch(s)}
              className={`w-full text-left px-3 py-2 text-[12px] transition-colors ${
                s.id === currentSalonId ? "text-white bg-white/[0.10] font-semibold" : "text-white/60 hover:bg-white/[0.06]"
              }`}
            >
              {s.name}
              {s.city && <span className="text-[10px] text-white/25 ml-2">{s.city}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const SalonCRMPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeId = getActiveId(location.pathname);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* ── Background ── */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat will-change-transform"
        style={{ backgroundImage: "url('/salooon0000.jpg')" }}
      />
      <div className="fixed inset-0 z-[1] bg-black/[0.55] backdrop-blur-[2px]" />
      <div className="fixed inset-0 z-[1] bg-gradient-to-b from-black/20 via-black/10 to-black/30" />

      {/* ── Layout container ── */}
      <div className="relative z-10 flex min-h-screen">

        {/* ── Desktop sidebar (collapsible) ── */}
        <aside
          className={`hidden lg:flex flex-col flex-shrink-0 py-6 transition-all duration-300 ease-in-out overflow-hidden bg-black/[0.70] backdrop-blur-xl border-r border-white/[0.06] ${
            collapsed ? "w-[68px] px-2" : "w-[220px] pl-4 pr-2"
          }`}
        >
          {/* Logo / brand */}
          <div className={`mb-8 ${collapsed ? "flex justify-center" : "px-3"}`}>
            {collapsed ? (
              <div className="w-9 h-9 rounded-lg bg-white/[0.08] flex items-center justify-center flex-shrink-0">
                <img
                  src="/spectra-logo-new.png"
                  alt="Spectra"
                  className="h-3.5 w-auto opacity-70"
                  onError={(e) => { e.currentTarget.src = "/spectra_logo.png"; }}
                />
              </div>
            ) : (
              <>
                <img
                  src="/spectra-logo-new.png"
                  alt="Spectra"
                  className="h-5 w-auto opacity-80"
                  onError={(e) => { e.currentTarget.src = "/spectra_logo.png"; }}
                />
                <p className="text-[10px] text-white/40 font-medium uppercase tracking-[0.15em] mt-2">Salon CRM</p>
              </>
            )}
          </div>

          {/* Salon Switcher */}
          <SalonSwitcher collapsed={collapsed} />

          {/* Nav items */}
          <nav className="flex-1 space-y-1">
            {NAV_ITEMS.map(({ id, label, icon: Icon, path }) => {
              const active = id === activeId;
              return (
                <button
                  key={id}
                  onClick={() => navigate(path)}
                  title={collapsed ? label : undefined}
                  className={`w-full flex items-center rounded-xl font-medium transition-all duration-200 group ${
                    collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5 text-[13px]"
                  } ${
                    active
                      ? "bg-white/[0.12] text-white shadow-sm"
                      : "text-white/50 hover:text-white/80 hover:bg-white/[0.06]"
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-white" : "text-white/40 group-hover:text-white/60"}`} />
                  {!collapsed && <span className="truncate">{label}</span>}
                  {!collapsed && active && <ChevronRight className="w-3 h-3 ml-auto text-white/40 flex-shrink-0" />}
                </button>
              );
            })}
          </nav>

          {/* Toggle + Footer */}
          <div className={`pt-4 border-t border-white/[0.08] mt-4 ${collapsed ? "flex flex-col items-center" : "px-3"}`}>
            <button
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-white/40 hover:text-white/70 transition-all duration-200 mb-2"
            >
              {collapsed
                ? <ChevronRight className="w-3.5 h-3.5" />
                : <ChevronLeft className="w-3.5 h-3.5" />
              }
            </button>
            {!collapsed && (
              <p className="text-[10px] text-white/25 leading-relaxed">
                Powered by Spectra AI
              </p>
            )}
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

              <SalonSwitcher collapsed={false} />

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
                      <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${active ? "text-white" : "text-white/40"}`} />
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

          {/* ── Mobile-only hamburger ── */}
          <header className="flex-shrink-0 px-3 pt-4 pb-2 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-9 h-9 rounded-xl bg-black/[0.30] backdrop-blur-xl border border-white/[0.12] flex items-center justify-center text-white/60 hover:text-white transition-colors"
              style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}
            >
              <Menu className="w-4 h-4" />
            </button>
          </header>

          {/* ── Page content ── */}
          <main className="flex-1 px-3 sm:px-4 lg:px-8 xl:px-12 py-4 sm:py-5 lg:py-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default SalonCRMPage;
