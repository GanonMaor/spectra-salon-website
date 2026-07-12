import React, { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Calendar,
  Settings,
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
  Languages,
  Home,
  Palette,
  Layers,
  LogOut,
  MoreHorizontal,
} from "lucide-react";
import { SiteThemeProvider, useSiteTheme } from "../../contexts/SiteTheme";
import { SpectraLogo } from "../HairGPT/SpectraLogo";
import { CrmLocaleProvider, useCrmLocale } from "./i18n/CrmLocale";
import { CRMDataProvider, createLiveCRMRepository } from "./data";
import { useCRMSalon } from "./data/crmHooks";
import { clearSalonSession } from "./data/salonSession";
import { clearScopedCRMCache } from "./data/CRMDataProvider";

const CRM_CALENDAR_COLORS = {
  hair: "#D7897F",
  cosmetics: "#F9B95C",
} as const;

const CRM_CALENDAR_TEXT = {
  hair: "#B05F57",
  cosmetics: "#7C4A0E",
} as const;

function activeCalendarFromSearch(search: string): keyof typeof CRM_CALENDAR_COLORS {
  return new URLSearchParams(search).get("calendar") === "cosmetics" ? "cosmetics" : "hair";
}

function getActiveId(pathname: string, search: string): string {
  const params = new URLSearchParams(search);
  if (pathname.startsWith("/crm/schedule") && params.get("tab") === "settings") return "settings";
  if (pathname.startsWith("/crm/schedule") && params.get("calendar") === "cosmetics") return "schedule-cosmetics";
  if (pathname.startsWith("/crm/schedule")) return "schedule-hair";
  const NAV_IDS = [
    "home",
    "schedule-hair",
    "schedule-cosmetics",
    "settings",
    "customers",
    "inventory",
    "staff",
    "product-catalog-setup",
    "analytics",
  ];
  const paths: Record<string, string> = {
    home: "/crm/home",
    "schedule-hair": "/crm/schedule",
    "schedule-cosmetics": "/crm/schedule",
    settings: "/crm/schedule",
    customers: "/crm/customers",
    inventory: "/crm/inventory",
    staff: "/crm/staff",
    "product-catalog-setup": "/crm/product-catalog-setup",
    analytics: "/crm/analytics",
  };
  const match = NAV_IDS.find((id) => pathname.startsWith(paths[id]));
  return match ?? "home";
}

function SalonSwitcher({
  collapsed: isCollapsed,
  isDark,
  lang,
  salonName,
}: {
  collapsed: boolean;
  isDark: boolean;
  lang: "en" | "he";
  salonName: string;
}) {
  if (isCollapsed) {
    return (
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
          isDark
            ? "bg-white/[0.08] text-white/60"
            : "bg-[#F8E5D8] text-[#7E7066]"
        }`}
        title={lang === "he" ? `סניף נוכחי: ${salonName}` : `Current salon: ${salonName}`}
        aria-label={lang === "he" ? `סניף נוכחי: ${salonName}` : `Current salon: ${salonName}`}
      >
        <Building2 className="w-4 h-4" />
      </div>
    );
  }

  return (
    <div className="mb-3 px-1">
      <div className="w-full rounded-[18px] border border-[#EBDDD2] bg-white/50 px-3 py-2">
        <div className="flex items-center gap-2">
          <Building2 className={`w-4 h-4 flex-shrink-0 ${isDark ? "text-white/55" : "text-[#7E7066]"}`} />
          <div className="min-w-0 flex-1">
            <p className={`truncate text-[11px] font-black ${isDark ? "text-white" : "text-[#141414]"}`}>
              {salonName}
            </p>
            <p className={`mt-0.5 truncate text-[9px] font-bold ${isDark ? "text-white/45" : "text-[#7E7066]"}`}>
              {lang === "he" ? "סניף נוכחי · עוד סניף בקרוב" : "Current branch · More branches soon"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function SidebarMiniCalendar({
  collapsed,
  lang,
  locationSearch,
  accentColor,
  accentTextColor,
  onSelectDate,
}: {
  collapsed: boolean;
  lang: "en" | "he";
  locationSearch: string;
  accentColor: string;
  accentTextColor: string;
  onSelectDate: (date: Date) => void;
}) {
  const selectedDate = useMemo(() => {
    const dateParam = new URLSearchParams(locationSearch).get("date");
    if (!dateParam) return new Date();
    const parsed = new Date(`${dateParam}T12:00:00`);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }, [locationSearch]);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const date = new Date(selectedDate);
    date.setDate(1);
    return date;
  });

  useEffect(() => {
    setVisibleMonth((prev) => {
      if (prev.getMonth() === selectedDate.getMonth() && prev.getFullYear() === selectedDate.getFullYear()) return prev;
      const next = new Date(selectedDate);
      next.setDate(1);
      return next;
    });
  }, [selectedDate]);
  const days = useMemo(() => {
    const first = new Date(visibleMonth);
    const start = new Date(first);
    start.setDate(first.getDate() - first.getDay());
    return Array.from({ length: 42 }, (_, index) => {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      return day;
    });
  }, [visibleMonth]);

  if (collapsed) return null;

  const monthLabel = visibleMonth.toLocaleDateString(lang === "he" ? "he-IL" : "en-US", {
    month: "short",
    year: "numeric",
  });
  const weekDays = lang === "he" ? ["א", "ב", "ג", "ד", "ה", "ו", "ש"] : ["S", "M", "T", "W", "T", "F", "S"];
  const todayKey = formatDateKey(new Date());
  const selectedKey = formatDateKey(selectedDate);

  const shiftMonth = (delta: number) => {
    setVisibleMonth((prev) => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() + delta);
      return next;
    });
  };

  return (
    <div className="rounded-[20px] border border-[#EBDDD2] bg-white/46 p-1.5 shadow-[0_12px_28px_rgba(92,52,35,0.07)]">
      <div className="mb-1.5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          className="grid h-6 w-6 place-items-center rounded-full text-[#7E7066] transition hover:bg-white/70 hover:text-[#141414]"
          aria-label={lang === "he" ? "חודש קודם" : "Previous month"}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
        <p className="text-[12px] font-black tracking-[-0.02em] text-[#141414]">{monthLabel}</p>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          className="grid h-6 w-6 place-items-center rounded-full text-[#7E7066] transition hover:bg-white/70 hover:text-[#141414]"
          aria-label={lang === "he" ? "חודש הבא" : "Next month"}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {weekDays.map((day) => (
          <div key={day} className="grid h-3.5 place-items-center text-[8px] font-black text-[#9A8B80]">
            {day}
          </div>
        ))}
        {days.map((day) => {
          const key = formatDateKey(day);
          const isCurrentMonth = day.getMonth() === visibleMonth.getMonth();
          const selected = key === selectedKey;
          const today = key === todayKey;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDate(day)}
              className={`grid h-[18px] place-items-center rounded-full text-[9px] font-bold transition ${
                selected
                  ? "text-[#141414] shadow-[0_8px_16px_rgba(92,52,35,0.14)]"
                  : today
                    ? ""
                    : isCurrentMonth
                      ? "text-[#141414] hover:bg-[#F8F0E6]"
                      : "text-[#9A8B80]/45"
              }`}
              style={selected || today ? {
                background: selected ? accentColor : `${accentColor}55`,
                color: selected ? "#141414" : accentTextColor,
              } : undefined}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const SalonCRMInner: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useSiteTheme();
  const { t, isRTL, lang, toggleLang } = useCrmLocale();
  const activeId = getActiveId(location.pathname, location.search);
  const activeCalendar = activeId === "schedule-cosmetics"
    ? "cosmetics"
    : activeCalendarFromSearch(location.search);
  const activeAccent = CRM_CALENDAR_COLORS[activeCalendar];
  const activeAccentText = CRM_CALENDAR_TEXT[activeCalendar];
  const salon = useCRMSalon();
  const salonName = salon?.name || (lang === "he" ? "הסלון הנוכחי" : "Current salon");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarMoreOpen, setSidebarMoreOpen] = useState(false);
  const sidebarMoreRef = useRef<HTMLDivElement | null>(null);
  const handleLogout = () => {
    // Clear the scoped CRM cache for this session BEFORE clearing identity so
    // the next user cannot read this salon's cached state from the browser.
    clearScopedCRMCache();
    clearSalonSession();
    setSidebarOpen(false);
    setSidebarMoreOpen(false);
    navigate("/user-login", { replace: true });
  };

  useEffect(() => {
    setSidebarMoreOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!sidebarMoreOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!sidebarMoreRef.current?.contains(event.target as Node)) {
        setSidebarMoreOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [sidebarMoreOpen]);

  const NAV_ITEMS = [
    { id: "home",               label: t.nav.home,       icon: Home,      path: "/crm/home" },
    { id: "schedule-hair",      label: lang === "he" ? "יומן שיער" : "Hair Studio", icon: Calendar,  path: "/crm/schedule?calendar=hair" },
    { id: "schedule-cosmetics", label: lang === "he" ? "יומן קוסמטיקה" : "Beauty Clinic", icon: Calendar,  path: "/crm/schedule?calendar=cosmetics" },
    { id: "customers",          label: t.nav.customers,  icon: Users,     path: "/crm/customers" },
    { id: "inventory",          label: t.nav.inventory,  icon: Package,   path: "/crm/inventory" },
    { id: "staff",              label: t.nav.staff,      icon: UserCog,   path: "/crm/staff" },
    { id: "product-catalog-setup", label: t.nav.catalogSetup, icon: Layers, path: "/crm/product-catalog-setup" },
    { id: "settings",        label: t.nav.settings,   icon: Settings,  path: "/crm/schedule?tab=settings" },
    { id: "analytics",       label: t.nav.analytics,  icon: BarChart3, path: "/crm/analytics" },
  ];
  const PRIMARY_NAV_ITEMS = NAV_ITEMS.slice(0, 6);
  const MORE_NAV_ITEMS = NAV_ITEMS.slice(6);

  // Language toggle button (small pill: EN | HE)
  const LangToggle = ({ compact = false }: { compact?: boolean }) => (
    <button
      onClick={toggleLang}
      title={lang === "en" ? "עברית / אנגלית" : "English / Hebrew"}
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

  if (salon?.onboardingStatus === "incomplete") {
    return <Navigate to="/crm/setup" replace />;
  }

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
      <div className={`fixed inset-0 z-[1] ${isDark ? "bg-black/[0.55]" : "bg-[#FFF8F0]/[0.74]"}`} />
      <div
        className="fixed inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(circle at 10% 22%, rgba(150,199,179,0.48), transparent 24%), radial-gradient(circle at 91% 12%, rgba(249,185,92,0.42), transparent 22%), linear-gradient(135deg, rgba(250,209,191,0.92) 0%, rgba(248,225,209,0.84) 48%, rgba(217,232,219,0.86) 100%)",
        }}
      />
      <div className="fixed -end-8 top-24 z-[2] hidden h-24 w-24 rounded-full bg-[#F9B95C] shadow-[0_20px_50px_rgba(249,185,92,0.25)] lg:block" />
      <div className="fixed start-10 top-32 z-[2] hidden h-20 w-20 rounded-full bg-[#F9B95C]/70 lg:block" />

      {/* ── Layout container ── */}
      <div className="relative z-10 flex min-h-[100dvh]">

        {/* ── Desktop sidebar (collapsible) ── */}
        <aside
          className={`hidden lg:sticky lg:top-0 lg:flex lg:h-[100dvh] lg:max-h-[100dvh] flex-col flex-shrink-0 overflow-hidden py-3 transition-all duration-300 ease-in-out ${
            isRTL ? "border-l" : "border-r"
          } ${
            isDark
              ? "bg-black/[0.70] border-white/[0.06]"
              : "bg-[#FFF3E8]/90 border-[#EBDDD2]"
          } ${
            collapsed ? "w-[72px] px-3" : isRTL ? "w-[250px] pr-5 pl-4" : "w-[250px] pl-5 pr-4"
          }`}
        >
          {/* Logo / brand */}
          <div className={`mb-3 ${collapsed ? "flex justify-center" : ""}`}>
            {collapsed ? (
              <SpectraLogo size={36} />
            ) : (
              <>
                <p className="text-[21px] font-black leading-none tracking-[-0.04em] text-[#141414]">SalonAi</p>
                <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.26em] text-[#7E7066]">
                  from book to look
                </p>
              </>
            )}
          </div>

          {/* Salon Switcher */}
          <SalonSwitcher collapsed={collapsed} isDark={isDark} lang={lang} salonName={salonName} />

          {/* Nav items */}
          <nav className="space-y-0.5">
            {PRIMARY_NAV_ITEMS.map(({ id, label, icon: Icon, path }) => {
              const active = id === activeId;
              return (
                <button
                  key={id}
                  onClick={() => navigate(path)}
                  title={collapsed ? label : undefined}
                  className={`w-full flex items-center rounded-xl font-medium transition-all duration-200 group ${
                    collapsed ? "justify-center px-0 py-2" : "gap-3 px-3 py-2 text-[12px]"
                  } ${
                    active
                      ? isDark
                        ? "bg-white/[0.12] text-white shadow-sm"
                        : "text-[#141414]"
                      : isDark
                        ? "text-white/50 hover:text-white/80 hover:bg-white/[0.06]"
                        : "text-[#665A52] hover:bg-[#F8E5D8] hover:text-[#141414]"
                  }`}
                  style={active && !isDark ? { background: id === "schedule-cosmetics" ? CRM_CALENDAR_COLORS.cosmetics : activeAccent } : undefined}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${
                    active
                      ? isDark ? "text-white" : "text-[#141414]"
                      : isDark ? "text-white/55 group-hover:text-white/60" : "text-[#665A52] group-hover:text-[#141414]"
                  }`} />
                  {!collapsed && <span className="truncate">{label}</span>}
                  {!collapsed && active && (
                    <span className={`${isRTL ? "mr-auto" : "ml-auto"} flex-shrink-0`}>
                      {isRTL
                        ? <ChevronLeft className={`w-3 h-3 ${isDark ? "text-white/55" : "text-black/55"}`} />
                        : <ChevronRight className={`w-3 h-3 ${isDark ? "text-white/55" : "text-[#7E7066]"}`} />}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-2">
            <SidebarMiniCalendar
              collapsed={collapsed}
              lang={lang}
              locationSearch={location.search}
              accentColor={activeAccent}
              accentTextColor={activeAccentText}
              onSelectDate={(date) => {
                const params = new URLSearchParams(location.search);
                params.set("date", formatDateKey(date));
                if (!params.get("calendar") && activeId === "schedule-cosmetics") params.set("calendar", "cosmetics");
                navigate(`/crm/schedule?${params.toString()}`);
              }}
            />
          </div>

          {/* Sidebar utilities */}
          <div ref={sidebarMoreRef} className={`relative pt-1.5 mt-auto ${collapsed ? "flex flex-col items-center gap-1.5" : ""}`}>
            <div className={`mb-1.5 flex items-center gap-1.5 ${collapsed ? "flex-col" : ""}`}>
              <button
                onClick={() => setSidebarMoreOpen((value) => !value)}
                title={collapsed ? (lang === "he" ? "עוד" : "More") : undefined}
                className={`flex h-9 items-center rounded-xl text-[12px] font-bold transition-all duration-200 ${
                  collapsed ? "w-8 justify-center px-0" : "flex-1 gap-2 px-3"
                } ${
                  isDark
                    ? "bg-white/[0.06] text-white/55 hover:bg-white/[0.12] hover:text-white/75"
                    : "bg-white/55 text-[#7E7066] hover:bg-white/80 hover:text-[#141414]"
                }`}
              >
                <MoreHorizontal className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{lang === "he" ? "עוד" : "More"}</span>}
              </button>
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
            </div>
            {sidebarMoreOpen && (
              <div
                className={`absolute bottom-12 z-[80] overflow-hidden rounded-2xl border p-2 shadow-[0_18px_48px_rgba(55,36,28,0.18)] ${
                  collapsed ? "end-0 w-56" : "start-0 end-0"
                } ${
                  isDark ? "border-white/[0.12] bg-black/90" : "border-[#EBDDD2] bg-white/95"
                }`}
              >
                {MORE_NAV_ITEMS.map(({ id, label, icon: Icon, path }) => {
                  const active = id === activeId;
                  return (
                    <button
                      key={id}
                      onClick={() => { navigate(path); setSidebarMoreOpen(false); }}
                      className={`flex h-9 w-full items-center gap-2 rounded-xl px-3 text-[12px] font-bold transition ${
                        active
                          ? isDark ? "bg-white/[0.12] text-white" : "bg-[#F3C3BC] text-[#141414]"
                          : isDark ? "text-white/65 hover:bg-white/[0.08]" : "text-[#7E7066] hover:bg-[#F8F0E6]"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span>{label}</span>
                    </button>
                  );
                })}
                <div className={`my-2 h-px ${isDark ? "bg-white/[0.08]" : "bg-[#EBDDD2]"}`} />
                <button
                  onClick={() => { navigate("/crm/new-calendar-design"); setSidebarMoreOpen(false); }}
                  className={`flex h-9 w-full items-center gap-2 rounded-xl px-3 text-[12px] font-bold transition ${
                    isDark ? "text-white/65 hover:bg-white/[0.08]" : "text-[#7E7066] hover:bg-[#F8F0E6]"
                  }`}
                >
                  <Palette className="h-3.5 w-3.5 shrink-0" />
              <span>{lang === "he" ? "מדריך עיצוב" : "Style guide"}</span>
                </button>
                <button
                  onClick={toggleTheme}
                  className={`flex h-9 w-full items-center gap-2 rounded-xl px-3 text-[12px] font-bold transition ${
                    isDark ? "text-white/65 hover:bg-white/[0.08]" : "text-[#7E7066] hover:bg-[#F8F0E6]"
                  }`}
                >
                  {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                  <span>{isDark ? t.shell.switchLight : t.shell.switchDark}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className={`flex h-9 w-full items-center gap-2 rounded-xl px-3 text-[12px] font-bold transition ${
                    isDark ? "text-white/65 hover:bg-white/[0.08]" : "text-[#7E7066] hover:bg-[#F8F0E6]"
                  }`}
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>{t.common.logout}</span>
                </button>
                <div className={`px-3 py-1 ${isDark ? "text-white/65" : "text-[#7E7066]"}`}>
                  <LangToggle />
                </div>
              </div>
            )}
            {!collapsed && (
              <div className="mt-1.5 rounded-2xl bg-white/55 p-2">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=96&q=80"
                    alt=""
                    className="h-9 w-9 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-bold text-[#141414]">Lina Cohen</p>
                    <p className="text-[10px] text-[#7E7066]">{lang === "he" ? "בעל/ת סלון" : "Salon Owner"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ── Mobile sidebar overlay ── */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <div className={`absolute inset-0 ${isDark ? "bg-black/60" : "bg-black/30"}`} onClick={() => setSidebarOpen(false)} />
            <aside className={`relative z-10 w-[260px] h-full ${isRTL ? "border-l mr-auto" : "border-r"} flex flex-col px-4 ${
              isDark
                ? "bg-black/80 border-white/[0.08]"
                : "bg-[#FFF3E8] border-[#EBDDD2]"
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

              <SalonSwitcher collapsed={false} isDark={isDark} lang={lang} salonName={salonName} />

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
              <button
                onClick={() => { navigate("/crm/new-calendar-design"); setSidebarOpen(false); }}
                className={`mt-4 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-[14px] font-medium transition-all duration-200 ${
                  isDark
                    ? "bg-white/[0.06] text-white/60 hover:bg-white/[0.10] hover:text-white"
                    : "bg-white/55 text-[#7E7066] hover:bg-white hover:text-[#141414]"
                }`}
              >
                <Palette className={`h-[18px] w-[18px] shrink-0 ${isDark ? "text-white/55" : "text-black/55"}`} />
                {lang === "he" ? "מדריך עיצוב" : "Style guide"}
              </button>
              <button
                onClick={handleLogout}
                className={`mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-[14px] font-medium transition-all duration-200 ${
                  isDark
                    ? "bg-white/[0.06] text-white/60 hover:bg-white/[0.10] hover:text-white"
                    : "bg-white/55 text-[#7E7066] hover:bg-white hover:text-[#141414]"
                }`}
              >
                <LogOut className={`h-[18px] w-[18px] shrink-0 ${isDark ? "text-white/55" : "text-black/55"}`} />
                {t.common.logout}
              </button>
            </aside>
          </div>
        )}

        {/* ── Main content ── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* ── Mobile-only hamburger ── */}
          <header className="flex-shrink-0 px-3 pt-4 pb-2 lg:hidden">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarOpen(true)}
                className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${
                  isDark
                    ? "bg-black/[0.30] border-white/[0.12] text-white/60 hover:text-white"
                    : "bg-[#FFF8F0]/90 border-[#EBDDD2] text-[#7E7066] hover:text-[#141414]"
                }`}
                style={{ boxShadow: "0 12px 30px rgba(92,52,35,0.14)" }}
              >
                <Menu className="w-4 h-4" />
              </button>
              <div
                className={`min-w-0 flex-1 rounded-xl border px-3 py-2 ${
                  isDark ? "border-white/[0.10] bg-black/[0.30]" : "border-[#EBDDD2] bg-[#FFF8F0]/90"
                }`}
                style={{ boxShadow: "0 12px 30px rgba(92,52,35,0.10)" }}
              >
                <p className={`truncate text-[9px] font-black uppercase tracking-[0.14em] ${isDark ? "text-white/45" : "text-[#7E7066]"}`}>
                  {lang === "he" ? "סלון פעיל" : "Active salon"}
                </p>
                <p className={`truncate text-[12px] font-black ${isDark ? "text-white" : "text-[#141414]"}`}>
                  {salonName}
                </p>
              </div>
            </div>
          </header>

          {/* ── Page content ── */}
          <main className="flex-1 px-3 sm:px-4 lg:px-8 xl:px-12 py-4 sm:py-5 lg:py-6 pb-24 lg:pb-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>

      {/* ── Mobile bottom tab bar ── */}
      <nav
        className={`fixed bottom-0 start-0 end-0 z-[50] lg:hidden flex items-stretch border-t ${
          isDark
            ? "bg-black/85 border-white/[0.10]"
            : "bg-[#FFF3E8]/95 border-[#EBDDD2]"
        }`}
        style={{
          paddingBottom: "env(safe-area-inset-bottom)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        {NAV_ITEMS.slice(0, 5).map(({ id, label, icon: Icon, path }) => {
          const active = id === activeId;
          return (
            <button
              key={id}
              onClick={() => navigate(path)}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 transition-colors ${
                active
                  ? isDark
                    ? "text-white"
                    : ""
                  : isDark
                    ? "text-white/40 hover:text-white/60"
                    : "text-[#9A8B80] hover:text-[#7E7066]"
              }`}
              style={active && !isDark ? { color: id === "schedule-cosmetics" ? CRM_CALENDAR_COLORS.cosmetics : activeAccent } : undefined}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-bold leading-none">{label}</span>
              {active && (
                <span
                  className={`mt-0.5 h-0.5 w-4 rounded-full ${isDark ? "bg-white" : ""}`}
                  style={!isDark ? { background: id === "schedule-cosmetics" ? CRM_CALENDAR_COLORS.cosmetics : activeAccent } : undefined}
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

// Live API repository: reads ALL business data (customers, staff, appointments,
// inventory, etc.) from the DB via crm-bootstrap. auth headers are evaluated
// lazily at request time so the current session token is always used — no
// stale token risk across logout/login cycles.
const liveRepository = createLiveCRMRepository();

export const SalonCRMProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SiteThemeProvider>
    <CrmLocaleProvider>
      <CRMDataProvider repository={liveRepository}>
        {children}
      </CRMDataProvider>
    </CrmLocaleProvider>
  </SiteThemeProvider>
);

const SalonCRMPage: React.FC = () => (
  <SalonCRMProviders>
    <SalonCRMInner />
  </SalonCRMProviders>
);

export default SalonCRMPage;
