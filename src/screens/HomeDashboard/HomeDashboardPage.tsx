import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSiteTheme } from "../../contexts/SiteTheme";
import { useToast } from "../../components/ui/toast";
import { useCrmLocale, useCrmT } from "../SalonCRM/i18n/CrmLocale";
import { LAYOUT } from "./homeDashboardTokens";
import {
  useAIInsights,
  useAppointmentsWithCustomers,
  useCRMActionLog,
  useCRMActions,
  useCRMSystemState,
  useLiveClients,
  useMarketplaceBanners,
} from "../SalonCRM/data/crmHooks";
import { useCRMState } from "../SalonCRM/data/CRMDataProvider";
import type {
  AIInsight,
  AIInsightCta,
} from "../SalonCRM/data/crmSelectors";
import {
  buildDateStrip,
  toDashboardAppointment,
  toDashboardLiveClient,
} from "./homeDashboardAdapters";
import {
  EMPTY_STATE_INSIGHT,
  getPrioritizedInsights,
  resolveTimeOfDay,
  type InsightContext,
  type RecentAction,
} from "./aiInsightPrioritization";
import {
  respondToSuggestion,
  respondToUserInput,
  type AIResponse,
  type AliceActionDescriptor,
  type AliceSuggestionKey,
} from "./aliceAssistant";
import {
  decideProactiveResponse,
  hasShownProactiveAlice,
  markProactiveAliceShown,
} from "./aliceInitiative";
import TopHeader from "./components/TopHeader";
import MarketplaceSection from "./components/MarketplaceSection";
import UpNextSection from "./components/UpNextSection";
import LiveClientsSection from "./components/LiveClientsSection";
import AIInsightsCarousel from "./components/AIInsightsCarousel";
import AliceAssistantBar, {
  type AliceAssistantBarHandle,
} from "./components/AliceAssistantBar";

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
  const crmState = useCRMState();
  const insights = useAIInsights();
  const actionLog = useCRMActionLog();
  const aliceRef = useRef<AliceAssistantBarHandle | null>(null);

  // ── AI surface state ─────────────────────────────────────────────
  // `lastPresentedInsightId` is intentionally a one-shot, set on the
  // first card the user sees in this Home mount. Continuously feeding
  // every active-card change back into prioritization would create an
  // ordering loop (penalty flips the head → carousel reports new head
  // → penalty moves → repeat), so we lock it after the initial show.
  const [lastPresentedInsightId, setLastPresentedInsightId] = useState<string | undefined>();
  const lastPresentedLockedRef = useRef(false);
  const [aliceFocused, setAliceFocused] = useState(false);
  const [aliceHasResponse, setAliceHasResponse] = useState(false);
  const [proactiveResponse, setProactiveResponse] = useState<AIResponse | null>(null);

  const recentActions = useMemo<RecentAction[]>(
    () =>
      actionLog
        .slice(-12)
        .map((trace) => ({
          type: trace.actionType,
          timestamp: new Date(trace.timestamp).getTime(),
        })),
    [actionLog],
  );

  const insightContext = useMemo<InsightContext>(
    () => ({
      lastVisitedPage: "home",
      recentActions,
      timeOfDay: resolveTimeOfDay(),
      lastPresentedInsightId,
    }),
    [recentActions, lastPresentedInsightId],
  );

  const prioritizedInsights = useMemo(
    () => getPrioritizedInsights(insights, insightContext),
    [insights, insightContext],
  );

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

  // ── AI surface handlers ─────────────────────────────────────────
  const dispatchActionKey = useCallback(
    (actionKey: string, _payload?: Record<string, unknown>) => {
      switch (actionKey) {
        case "navigate.inventory":
        case "inventory.reorder":
        case "inventory.viewLowStock":
          navigate("/crm/inventory");
          return;
        case "navigate.schedule":
        case "schedule.optimize":
          navigate("/crm/schedule");
          return;
        case "navigate.staff":
        case "staff.view":
        case "performance.view":
          navigate("/crm/staff");
          return;
        case "navigate.customers":
          navigate("/crm/customers");
          return;
        case "navigate.analytics":
        case "analytics.view":
        case "mix.view":
          navigate("/crm/analytics");
          return;
        case "alice.focusInput":
          aliceRef.current?.focusInput();
          return;
        default:
          showComingSoon(actionKey);
      }
    },
    [navigate, showComingSoon],
  );

  const handleInsightAction = useCallback(
    (_insight: AIInsight, cta: AIInsightCta) => {
      dispatchActionKey(cta.actionKey, cta.payload);
    },
    [dispatchActionKey],
  );

  const handleAliceAction = useCallback(
    (action: AliceActionDescriptor) => {
      dispatchActionKey(action.actionKey, action.payload);
    },
    [dispatchActionKey],
  );

  const handleAliceSubmit = useCallback(
    (input: string): AIResponse => respondToUserInput(input, crmState, actions),
    [crmState, actions],
  );

  const handleAliceSuggestion = useCallback(
    (key: AliceSuggestionKey): AIResponse => respondToSuggestion(key, crmState),
    [crmState],
  );

  const handleAskAlice = useCallback(() => {
    aliceRef.current?.focusInput();
  }, []);

  const handleActiveInsightChange = useCallback((insight: AIInsight) => {
    if (lastPresentedLockedRef.current) return;
    lastPresentedLockedRef.current = true;
    setLastPresentedInsightId(insight.id);
  }, []);

  // Decide once per Home mount / state change whether Alice should
  // speak first. Guarded by `hasShownProactiveAlice` so it only fires
  // once per session even if state churns.
  useEffect(() => {
    if (proactiveResponse) return;
    if (hasShownProactiveAlice()) return;
    if (aliceFocused || aliceHasResponse) return;
    const decision = decideProactiveResponse({
      insights: prioritizedInsights,
      isInputFocused: aliceFocused,
      hasActiveResponse: aliceHasResponse,
      recentActions,
      timeOfDay: resolveTimeOfDay(),
    });
    if (decision) {
      setProactiveResponse(decision.response);
      markProactiveAliceShown();
    }
  }, [prioritizedInsights, aliceFocused, aliceHasResponse, recentActions, proactiveResponse]);

  const handleProactiveAcknowledged = useCallback(() => {
    setProactiveResponse(null);
  }, []);

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

      <AIInsightsCarousel
        insights={prioritizedInsights}
        emptyState={EMPTY_STATE_INSIGHT}
        onInsightAction={handleInsightAction}
        onAskAlice={handleAskAlice}
        onActiveInsightChange={handleActiveInsightChange}
      />

      <AliceAssistantBar
        ref={aliceRef}
        onSubmit={handleAliceSubmit}
        onSuggestion={handleAliceSuggestion}
        onResponseAction={handleAliceAction}
        proactiveResponse={proactiveResponse}
        onFocusChange={setAliceFocused}
        onActiveResponseChange={setAliceHasResponse}
        onProactiveAcknowledged={handleProactiveAcknowledged}
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
