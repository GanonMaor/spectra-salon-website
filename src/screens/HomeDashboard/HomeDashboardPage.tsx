import React, { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSiteTheme } from "../../contexts/SiteTheme";
import { useToast } from "../../components/ui/toast";
import { useCrmLocale, useCrmT } from "../SalonCRM/i18n/CrmLocale";
import { LAYOUT } from "./homeDashboardTokens";
import {
  useAppointmentsWithCustomers,
  useCRMActions,
  useCRMSystemState,
  useLiveClients,
  useMarketplaceBanners,
} from "../SalonCRM/data/crmHooks";
import {
  buildDateStrip,
  toDashboardAppointment,
  toDashboardLiveClient,
} from "./homeDashboardAdapters";
import TopHeader from "./components/TopHeader";
import MarketplaceSection from "./components/MarketplaceSection";
import UpNextSection from "./components/UpNextSection";
import LiveClientsSection from "./components/LiveClientsSection";
import AIInsightStrip from "./components/AIInsightStrip";

/**
 * Operational salon home board.
 *
 * Reads exclusively through the shared CRM data layer. The same
 * appointments shown here power the Schedule grid; the same live
 * visits drive the AI insight bar; the same customers appear in the
 * Customers list. Nothing here is page-local mock data.
 *
 * IMPORTANT: This page renders ONLY its content area. The CRM shell at
 * `src/screens/SalonCRM/SalonCRMPage.tsx` provides the dark sidebar,
 * theme toggle, language toggle, and mobile drawer. Do not introduce
 * a second sidebar here.
 */
const HomeDashboardPage: React.FC = () => {
  const { isDark } = useSiteTheme();
  const { lang } = useCrmLocale();
  const navigate = useNavigate();
  const t = useCrmT();
  const { addToast } = useToast();
  const systemState = useCRMSystemState();
  const banners = useMarketplaceBanners();
  const liveClientsVm = useLiveClients();
  const actions = useCRMActions();

  const appointmentsToday = useAppointmentsWithCustomers({
    date: systemState.activeDate,
    excludeStatuses: ["cancelled", "completed"],
  });

  const dashboardAppointments = useMemo(
    () =>
      appointmentsToday
        .slice()
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
        .map(toDashboardAppointment),
    [appointmentsToday],
  );

  const dashboardLiveClients = useMemo(
    () => liveClientsVm.map(toDashboardLiveClient),
    [liveClientsVm],
  );

  const dateStrip = useMemo(
    () => buildDateStrip(systemState.activeDate),
    [systemState.activeDate],
  );

  const dateLabel = useMemo(
    () => buildDateLabel(systemState.activeDate, lang),
    [systemState.activeDate, lang],
  );

  // ── Action handlers ──────────────────────────────────────────────
  const showComingSoon = useCallback(
    (label: string) => {
      addToast({
        message: `${label} — ${t.staff.comingSoon}`,
        type: "info",
        duration: 3000,
      });
    },
    [addToast, t],
  );

  const handleSeeAllClients = useCallback(() => {
    navigate("/crm/customers");
  }, [navigate]);

  const handleAddClient = useCallback(() => {
    navigate("/crm/customers");
  }, [navigate]);

  const handleAppointmentClick = useCallback(() => {
    navigate("/crm/schedule");
  }, [navigate]);

  const handleLiveClientClick = useCallback(() => {
    navigate("/crm/customers");
  }, [navigate]);

  const handleToggleBluetooth = useCallback(() => {
    actions.setBluetoothConnected(!systemState.bluetooth.connected);
  }, [actions, systemState.bluetooth.connected]);

  const handleNotifications = useCallback(() => {
    actions.markNotificationsRead();
    addToast({
      message: `${systemState.notifications.unreadCount} notifications acknowledged`,
      type: "success",
      duration: 2500,
    });
  }, [actions, addToast, systemState.notifications.unreadCount]);

  const handleFavorites = useCallback(() => {
    showComingSoon(t.home.favorites);
  }, [showComingSoon, t]);

  return (
    <div
      className={`relative ${LAYOUT.sectionGap}`}
      data-theme={isDark ? "dark" : "light"}
    >
      <TopHeader
        dateLabel={dateLabel}
        bluetooth={systemState.bluetooth}
        notifications={systemState.notifications}
        onToggleBluetooth={handleToggleBluetooth}
        onNotifications={handleNotifications}
        onFavorites={handleFavorites}
      />

      <AIInsightStrip
        onActionClick={(insight) => {
          if (insight.cta?.actionKey === "inventory.reorder") {
            navigate("/crm/inventory");
            return;
          }
          showComingSoon(insight.cta?.label ?? "Insight action");
        }}
      />

      <MarketplaceSection
        banners={banners}
        onSelect={(b) => showComingSoon(b.title)}
      />

      <UpNextSection
        days={dateStrip}
        appointments={dashboardAppointments}
        onAppointmentClick={handleAppointmentClick}
        onSelectDay={() => showComingSoon("Day selection")}
      />

      <LiveClientsSection
        clients={dashboardLiveClients}
        onAddClient={handleAddClient}
        onOpenClient={handleLiveClientClick}
        onSeeAll={handleSeeAllClients}
        onAddService={() => showComingSoon(t.home.newService)}
        onOpenService={() => navigate("/crm/schedule")}
        onStartOrContinueMix={() => showComingSoon("Mix flow")}
        onOptions={() => showComingSoon(t.home.options)}
      />
    </div>
  );
};

const HE_DAYS = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "שב׳"];
const HE_MONTHS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];
const EN_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const EN_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function buildDateLabel(activeDateIso: string, lang: "en" | "he"): string {
  const date = new Date(
    activeDateIso.length === 10 ? `${activeDateIso}T00:00:00.000Z` : activeDateIso,
  );
  const now = new Date();
  const dayLabels = lang === "he" ? HE_DAYS : EN_DAYS;
  const monthLabels = lang === "he" ? HE_MONTHS : EN_MONTHS;
  const dayName = dayLabels[date.getUTCDay()];
  const dayNum = date.getUTCDate();
  const month = monthLabels[date.getUTCMonth()];
  const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  if (lang === "he") return `${dayName} ${dayNum} ${month} · ${time}`;
  return `${dayName} ${dayNum} ${month} · ${time}`;
}

export default HomeDashboardPage;
