import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Calendar,
  Users,
  UserCog,
  BarChart3,
  Package,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  Building2,
  Sun,
  Moon,
  Sparkles,
  Languages,
} from "lucide-react";
import { SiteThemeProvider, useSiteTheme } from "../../contexts/SiteTheme";
import { SpectraLogo } from "../HairGPT/SpectraLogo";
import { CrmLocaleProvider, useCrmLocale } from "./i18n/CrmLocale";

function getActiveId(pathname: string): string {
  const NAV_IDS = ["schedule", "customers", "inventory", "staff", "analytics", "spectra-preview"];
  const paths: Record<string, string> = {
    schedule: "/crm/schedule",
    customers: "/crm/customers",
    inventory: "/crm/inventory",
    staff: "/crm/staff",
    analytics: "/crm/analytics",
    "spectra-preview": "/crm/spectra-preview",
  };
  const match = NAV_IDS.find((id) => pathname.startsWith(paths[id]));
  return match ?? "analytics";
}

function SalonSwitcher({ collapsed: isCollapsed, isDark }: { collapsed: boolean; isDark: boolean }) {
  if (isCollapsed) {
    return (
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center mb-4 ${
          isDark
            ? "bg-white/[0.08] text-white/60"
            : "bg-black/[0.05] text-black/50"
        }`}
        title="Salon Look"
      >
        <Building2 className="w-4 h-4" />
      </div>
    );
  }

  return (
    <div className="mb-4 px-1">
      <div
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border ${
          isDark
            ? "bg-white/[0.06] border-white/[0.08]"
            : "bg-black/[0.03] border-black/[0.06]"
        }`}
      >
        <Building2 className={`w-4 h-4 flex-shrink-0 ${isDark ? "text-white/55" : "text-black/55"}`} />
        <span className={`text-[12px] font-semibold truncate flex-1 ${isDark ? "text-white" : "text-[#1A1A1A]"}`}>
          Salon Look
        </span>
      </div>
    </div>
  );
}

const SalonCRMInner: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useSiteTheme();
  const { t, isRTL, lang, toggleLang } = useCrmLocale();
  const activeId = getActiveId(location.pathname);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const NAV_ITEMS = [
    { id: "schedule",        label: t.nav.schedule,   icon: Calendar,  path: "/crm/schedule" },
    { id: "customers",       label: t.nav.customers,  icon: Users,     path: "/crm/customers" },
    { id: "inventory",       label: t.nav.inventory,  icon: Package,   path: "/crm/inventory" },
    { id: "staff",           label: t.nav.staff,      icon: UserCog,   path: "/crm/staff" },
    { id: "analytics",       label: t.nav.analytics,  icon: BarChart3, path: "/crm/analytics" },
    { id: "spectra-preview", label: t.nav.spectra,    icon: Sparkles,  path: "/crm/spectra-preview" },
  ];

  // Language toggle button (small pill: EN | HE)
  const LangToggle = ({ compact = false }: { compact?: boolean }) => (
    <button
      onClick={toggleLang}
      title={lang === "en" ? "Switch to Hebrew" : "עברית / אנגלית"}
      className={`flex items-center gap-1 h-8 rounded-lg px-2 transition-all duration-200 text-[11px] font-semibold ${
        isDark
          ? "bg-white/[0.06] hover:bg-white/[0.12] text-white/55 hover:text-white/80"
          : "bg-black/[0.04] hover:bg-black/[0.08] text-black/55 hover:text-black/70"
      }`}
    >
      <Languages className="w-3.5 h-3.5" />
      {!compact && (
        <span className="leading-none">
          <span style={{ opacity: lang === "en" ? 1 : 0.45 }}>EN</span>
          {" | "}
          <span style={{ opacity: lang === "he" ? 1 : 0.45 }}>HE</span>
        </span>
      )}
    </button>
  );

  // Sidebar collapse/expand chevron direction flips in RTL
  const CollapseIcon = () => {
    if (isRTL) {
      return collapsed
        ? <ChevronLeft className="w-3.5 h-3.5" />
        : <ChevronRight className="w-3.5 h-3.5" />;
    }
    return collapsed
      ? <ChevronRight className="w-3.5 h-3.5" />
      : <ChevronLeft className="w-3.5 h-3.5" />;
  };

  return (
    <div
      className="min-h-[100dvh] relative overflow-hidden"
      dir={isRTL ? "rtl" : "ltr"}
      lang={lang === "he" ? "he" : "en"}
    >
      {/* ── Background ── */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat will-change-transform"
        style={{ backgroundImage: "url('/salooon0000.jpg')" }}
      />
      <div className={`fixed inset-0 z-[1] backdrop-blur-[2px] ${
        isDark ? "bg-black/[0.55]" : "bg-[#FAFAF8]/[0.82]"
      }`} />
      <div className={`fixed inset-0 z-[1] bg-gradient-to-b ${
        isDark
          ? "from-black/20 via-black/10 to-black/30"
          : "from-[#FAFAF8]/30 via-[#FAFAF8]/20 to-[#FAFAF8]/40"
      }`} />

      {/* ── Layout container ── */}
      <div className="relative z-10 flex min-h-[100dvh]">

        {/* ── Desktop sidebar (collapsible) ── */}
        <aside
          className={`hidden lg:flex flex-col flex-shrink-0 py-6 transition-all duration-300 ease-in-out overflow-hidden backdrop-blur-xl ${
            isRTL ? "border-l" : "border-r"
          } ${
            isDark
              ? "bg-black/[0.70] border-white/[0.06]"
              : "bg-white/[0.85] border-black/[0.06]"
          } ${
            collapsed ? "w-[68px] px-2" : isRTL ? "w-[220px] pr-4 pl-2" : "w-[220px] pl-4 pr-2"
          }`}
        >
          {/* Logo / brand */}
          <div className={`mb-8 ${collapsed ? "flex justify-center" : "px-3"}`}>
            {collapsed ? (
              <SpectraLogo size={36} />
            ) : (
              <>
                <img
                  src="/spectra-logo-new.png"
                  alt="Spectra"
                  className="h-5 w-auto opacity-80"
                  onError={(e) => { e.currentTarget.src = "/spectra_logo.png"; }}
                />
                <p className={`text-[10px] font-medium uppercase tracking-[0.15em] mt-2 ${isDark ? "text-white/55" : "text-black/55"}`}>
                  {t.shell.salonCrm}
                </p>
              </>
            )}
          </div>

          {/* Salon Switcher */}
          <SalonSwitcher collapsed={collapsed} isDark={isDark} />

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
                      ? isDark
                        ? "bg-white/[0.12] text-white shadow-sm"
                        : "bg-black/[0.08] text-[#1A1A1A] shadow-sm"
                      : isDark
                        ? "text-white/50 hover:text-white/80 hover:bg-white/[0.06]"
                        : "text-black/50 hover:text-black/80 hover:bg-black/[0.04]"
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${
                    active
                      ? isDark ? "text-white" : "text-[#1A1A1A]"
                      : isDark ? "text-white/55 group-hover:text-white/60" : "text-black/55 group-hover:text-black/60"
                  }`} />
                  {!collapsed && <span className="truncate">{label}</span>}
                  {!collapsed && active && (
                    <span className={`${isRTL ? "mr-auto" : "ml-auto"} flex-shrink-0`}>
                      {isRTL
                        ? <ChevronLeft className={`w-3 h-3 ${isDark ? "text-white/55" : "text-black/55"}`} />
                        : <ChevronRight className={`w-3 h-3 ${isDark ? "text-white/55" : "text-black/55"}`} />}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Toggle + Theme + Lang + Footer */}
          <div className={`pt-4 border-t mt-4 ${isDark ? "border-white/[0.08]" : "border-black/[0.06]"} ${collapsed ? "flex flex-col items-center gap-1.5" : "px-3"}`}>
            <div className={`flex ${collapsed ? "flex-col" : ""} items-center gap-1.5 mb-2`}>
              <button
                onClick={() => setCollapsed(!collapsed)}
                aria-label={collapsed ? t.shell.expandSidebar : t.shell.collapseSidebar}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  isDark
                    ? "bg-white/[0.06] hover:bg-white/[0.12] text-white/55 hover:text-white/70"
                    : "bg-black/[0.04] hover:bg-black/[0.08] text-black/55 hover:text-black/70"
                }`}
              >
                <CollapseIcon />
              </button>
              <button
                onClick={toggleTheme}
                aria-label={isDark ? t.shell.switchLight : t.shell.switchDark}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  isDark
                    ? "bg-white/[0.06] hover:bg-white/[0.12] text-white/55 hover:text-white/70"
                    : "bg-black/[0.04] hover:bg-black/[0.08] text-black/55 hover:text-black/70"
                }`}
              >
                {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
              <LangToggle compact={collapsed} />
            </div>
            {!collapsed && (
              <p className={`text-[10px] leading-relaxed ${isDark ? "text-white/50" : "text-black/50"}`}>
                {t.shell.poweredBy}
              </p>
            )}
          </div>
        </aside>

        {/* ── Mobile sidebar overlay ── */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <div className={`absolute inset-0 ${isDark ? "bg-black/60" : "bg-black/30"}`} onClick={() => setSidebarOpen(false)} />
            <aside className={`relative z-10 w-[260px] h-full backdrop-blur-2xl ${isRTL ? "border-l mr-auto" : "border-r"} flex flex-col px-4 ${
              isDark
                ? "bg-black/80 border-white/[0.08]"
                : "bg-white/95 border-black/[0.06]"
            }`} style={{ paddingTop: "calc(1.5rem + var(--safe-top))", paddingBottom: "calc(1.5rem + var(--safe-bottom))" }}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <img
                    src="/spectra-logo-new.png"
                    alt="Spectra"
                    className="h-5 w-auto opacity-80"
                    onError={(e) => { e.currentTarget.src = "/spectra_logo.png"; }}
                  />
                  <p className={`text-[10px] font-medium uppercase tracking-[0.15em] mt-2 ${isDark ? "text-white/55" : "text-black/55"}`}>
                    {t.shell.salonCrm}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <LangToggle compact />
                  <button
                    onClick={toggleTheme}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      isDark ? "bg-white/10 text-white/60 hover:text-white" : "bg-black/[0.05] text-black/50 hover:text-black"
                    }`}
                  >
                    {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      isDark ? "bg-white/10 text-white/60 hover:text-white" : "bg-black/[0.05] text-black/50 hover:text-black"
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <SalonSwitcher collapsed={false} isDark={isDark} />

              <nav className="flex-1 space-y-1">
                {NAV_ITEMS.map(({ id, label, icon: Icon, path }) => {
                  const active = id === activeId;
                  return (
                    <button
                      key={id}
                      onClick={() => { navigate(path); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-medium transition-all duration-200 ${
                        active
                          ? isDark
                            ? "bg-white/[0.12] text-white shadow-sm"
                            : "bg-black/[0.08] text-[#1A1A1A] shadow-sm"
                          : isDark
                            ? "text-white/50 hover:text-white/80 hover:bg-white/[0.06]"
                            : "text-black/50 hover:text-black/80 hover:bg-black/[0.04]"
                      }`}
                    >
                      <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${
                        active
                          ? isDark ? "text-white" : "text-[#1A1A1A]"
                          : isDark ? "text-white/55" : "text-black/55"
                      }`} />
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
              className={`w-9 h-9 rounded-xl backdrop-blur-xl border flex items-center justify-center transition-colors ${
                isDark
                  ? "bg-black/[0.30] border-white/[0.12] text-white/60 hover:text-white"
                  : "bg-white/[0.70] border-black/[0.08] text-black/50 hover:text-black"
              }`}
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

const SalonCRMPage: React.FC = () => (
  <SiteThemeProvider>
    <CrmLocaleProvider>
      <SalonCRMInner />
    </CrmLocaleProvider>
  </SiteThemeProvider>
);

export default SalonCRMPage;
