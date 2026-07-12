import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, Circle, Sparkles } from "lucide-react";
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
} from "../SalonCRM/data/crmHooks";
import { useCRMState } from "../SalonCRM/data/CRMDataProvider";
import { listEnabledBrands, listEnabledProductLines } from "../SalonCRM/data/salonProductsApi";
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
import MembershipTokenBarrel from "./components/MembershipTokenBarrel";
// Kept in reserve until the marketplace/course strip gets a new placement.
// import MarketplaceSection from "./components/MarketplaceSection";
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
  const liveClientsVm = useLiveClients();
  const actions = useCRMActions();
  const crmState = useCRMState();
  const insights = useAIInsights();
  const actionLog = useCRMActionLog();
  const aliceRef = useRef<AliceAssistantBarHandle | null>(null);
  const [enabledBrandCount, setEnabledBrandCount] = useState(0);
  const [enabledProductLineCount, setEnabledProductLineCount] = useState(0);
  const [setupCatalogLoading, setSetupCatalogLoading] = useState(true);

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

  useEffect(() => {
    let isCancelled = false;
    setSetupCatalogLoading(true);
    Promise.all([listEnabledBrands(), listEnabledProductLines()])
      .then(([brandResult, lineResult]) => {
        if (isCancelled) return;
        setEnabledBrandCount(brandResult.brands.length);
        setEnabledProductLineCount(lineResult.productLines.length);
      })
      .catch(() => {
        if (isCancelled) return;
        setEnabledBrandCount(0);
        setEnabledProductLineCount(0);
      })
      .finally(() => {
        if (!isCancelled) setSetupCatalogLoading(false);
      });
    return () => {
      isCancelled = true;
    };
  }, [crmState.currentSalonId]);

  const setupChecklist = useMemo(() => {
    const salon = crmState.salonsById[crmState.currentSalonId];
    const categories = Object.values(crmState.serviceCategoriesById);
    const services = Object.values(crmState.servicesById);
    const inventoryItems = Object.values(crmState.inventoryById);
    const staff = Object.values(crmState.staffById).filter((member) => member.status !== "inactive");
    const customers = Object.values(crmState.customersById).filter((customer) => customer.status !== "archived");
    const appointments = Object.values(crmState.appointmentsById).filter((appointment) => appointment.status !== "cancelled");
    return [
      {
        id: "salon",
        label: lang === "he" ? "חשבון הסלון נוצר" : "Salon account created",
        detail: salon?.name || (lang === "he" ? "סלון פעיל" : "Active salon"),
        complete: Boolean(salon),
        path: "/crm/home",
      },
      {
        id: "services",
        label: lang === "he" ? "מחלקות, קטגוריות ושירותים מוגדרים" : "Departments, categories, and services configured",
        detail: lang === "he" ? `${categories.length} קטגוריות · ${services.length} שירותים` : `${categories.length} categories · ${services.length} services`,
        complete: categories.length > 0 && services.length > 0,
        path: "/crm/schedule?tab=settings",
      },
      {
        id: "brands",
        label: lang === "he" ? "חברות נבחרו" : "Brands selected",
        detail: setupCatalogLoading ? (lang === "he" ? "בודק חברות..." : "Checking brands...") : `${enabledBrandCount}`,
        complete: enabledBrandCount > 0,
        path: "/crm/product-catalog-setup",
      },
      {
        id: "product-lines",
        label: lang === "he" ? "סדרות נבחרו" : "Product lines selected",
        detail: setupCatalogLoading ? (lang === "he" ? "בודק סדרות..." : "Checking product lines...") : `${enabledProductLineCount}`,
        complete: enabledProductLineCount > 0,
        path: "/crm/product-catalog-setup",
      },
      {
        id: "inventory",
        label: lang === "he" ? "המלאי נבדק" : "Inventory reviewed",
        detail: lang === "he" ? `${inventoryItems.length} רשומות מלאי` : `${inventoryItems.length} inventory records`,
        complete: inventoryItems.length > 0,
        path: "/crm/inventory",
      },
      {
        id: "staff",
        label: lang === "he" ? "עובד ראשון נוצר" : "First staff member created",
        detail: `${staff.length}`,
        complete: staff.length > 0,
        path: "/crm/staff",
      },
      {
        id: "customer",
        label: lang === "he" ? "לקוחה ראשונה נוצרה" : "First customer created",
        detail: `${customers.length}`,
        complete: customers.length > 0,
        path: "/crm/customers",
      },
      {
        id: "appointment",
        label: lang === "he" ? "תור ראשון נקבע" : "First appointment created",
        detail: `${appointments.length}`,
        complete: appointments.length > 0,
        path: "/crm/schedule",
      },
    ];
  }, [crmState, enabledBrandCount, enabledProductLineCount, setupCatalogLoading, lang]);

  const completedSetupCount = setupChecklist.filter((item) => item.complete).length;
  const setupComplete = completedSetupCount === setupChecklist.length;
  const nextSetupStep = setupChecklist.find((item) => !item.complete);
  const setupProgress = Math.round((completedSetupCount / setupChecklist.length) * 100);

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
    (input: string): Promise<AIResponse> => respondToUserInput(input, crmState, actions),
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
      className={`relative overflow-hidden rounded-[34px] border border-white/70 bg-[#FFF8F0]/68 p-4 shadow-[0_24px_70px_rgba(92,52,35,0.12)] sm:p-5 lg:p-6 ${LAYOUT.sectionGap}`}
      data-theme={isDark ? "dark" : "light"}
      style={{
        background:
          "radial-gradient(circle at 8% 16%, rgba(249,185,92,0.24), transparent 22%), radial-gradient(circle at 92% 12%, rgba(215,137,127,0.20), transparent 24%), linear-gradient(135deg, rgba(255,248,240,0.82), rgba(255,253,248,0.72))",
      }}
    >
      <TopHeader
        dateLabel={dateLabel}
        bluetooth={systemState.bluetooth}
        notifications={systemState.notifications}
        onToggleBluetooth={handleToggleBluetooth}
        onNotifications={handleNotifications}
        onFavorites={handleFavorites}
      />

      <SetupProgressHub
        isDark={isDark}
        lang={lang}
        salonName={crmState.salonsById[crmState.currentSalonId]?.name || (lang === "he" ? "הסלון הנוכחי" : "Current salon")}
        items={setupChecklist}
        completedCount={completedSetupCount}
        progress={setupProgress}
        isComplete={setupComplete}
        nextStep={nextSetupStep}
        onNavigate={navigate}
      />

      <MembershipTokenBarrel
        activeClientCount={dashboardLiveClients.length}
        appointmentCount={dashboardAppointments.length}
        bluetooth={systemState.bluetooth}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
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
      </div>

      {/*
        MarketplaceSection intentionally hidden for now. Keep the data and
        component wired in reserve so the strip can return when its placement
        is decided.
        <MarketplaceSection
          banners={banners}
          onSeeAll={() => showComingSoon(t.home.marketplace)}
          onSelect={(b) => showComingSoon(b.title)}
        />
      */}

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

type SetupChecklistItem = {
  id: string;
  label: string;
  detail: string;
  complete: boolean;
  path: string;
};

function SetupProgressHub({
  isDark,
  lang,
  salonName,
  items,
  completedCount,
  progress,
  isComplete,
  nextStep,
  onNavigate,
}: {
  isDark: boolean;
  lang: "en" | "he";
  salonName: string;
  items: SetupChecklistItem[];
  completedCount: number;
  progress: number;
  isComplete: boolean;
  nextStep?: SetupChecklistItem;
  onNavigate: (path: string) => void;
}) {
  const setupLabel = lang === "he" ? "הגדרת הסלון" : "Salon setup";
  const title = isComplete
    ? lang === "he" ? "הסלון מוכן לעבודה" : "Your salon is ready to work"
    : lang === "he" ? "בואו נכין את הסלון לעבודה" : "Let's set up your salon";
  const subtitle = isComplete
    ? lang === "he"
      ? "כל שלבי ההכנה הבסיסיים הושלמו. אפשר לחזור לכאן לבדוק סטטוס הגדרות."
      : "The core setup steps are complete. You can return here to check setup status."
    : lang === "he"
      ? "התקדם לפי הסדר. כל שלב פותח את המסך הקיים שבו מבצעים את ההגדרה."
      : "Follow the steps in order. Each item opens the existing screen where the setup is done.";

  if (isComplete) {
    return (
      <section
        className={`flex flex-col gap-3 rounded-[24px] border p-4 shadow-[0_14px_40px_rgba(92,52,35,0.08)] sm:flex-row sm:items-center sm:justify-between ${
          isDark ? "border-white/[0.10] bg-white/[0.05]" : "border-[#EBDDD2] bg-white/74"
        }`}
      >
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${
              isDark ? "bg-white/[0.08] text-white/60" : "bg-[#FFF3E8] text-[#7E7066]"
            }`}>
              <CheckCircle2 className="h-3 w-3 text-[#5E8C6A]" />
              {lang === "he" ? "סטטוס הגדרות" : "Setup status"}
            </span>
            <span className={`truncate text-[12px] font-black ${isDark ? "text-white/60" : "text-[#7E7066]"}`}>
              {salonName}
            </span>
          </div>
          <p className={`text-[16px] font-black ${isDark ? "text-white" : "text-[#141414]"}`}>{title}</p>
          <p className={`mt-1 text-[12px] font-semibold ${isDark ? "text-white/50" : "text-[#7E7066]"}`}>{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate("/crm/product-catalog-setup")}
          className={`rounded-2xl border px-4 py-2 text-[12px] font-black transition ${
            isDark ? "border-white/[0.10] text-white/70 hover:bg-white/[0.08]" : "border-[#EBDDD2] text-[#7E7066] hover:bg-[#FFF8F0]"
          }`}
        >
          {lang === "he" ? `הושלמו ${completedCount}/${items.length}` : `${completedCount}/${items.length} complete`}
        </button>
      </section>
    );
  }

  return (
    <section
      className={`rounded-[28px] border p-4 shadow-[0_18px_55px_rgba(92,52,35,0.10)] sm:p-5 ${
        isDark ? "border-white/[0.10] bg-white/[0.06]" : "border-[#EBDDD2] bg-white/82"
      }`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${
              isDark ? "bg-white/[0.08] text-white/60" : "bg-[#FFF3E8] text-[#7E7066]"
            }`}>
              <Sparkles className="h-3 w-3" />
              {setupLabel}
            </span>
            <span className={`truncate text-[12px] font-black ${isDark ? "text-white/60" : "text-[#7E7066]"}`}>
              {salonName}
            </span>
          </div>
          <h1 className={`text-[22px] font-black leading-tight sm:text-[28px] ${isDark ? "text-white" : "text-[#141414]"}`}>
            {title}
          </h1>
          <p className={`mt-2 max-w-2xl text-[13px] font-semibold leading-6 ${isDark ? "text-white/55" : "text-[#7E7066]"}`}>
            {subtitle}
          </p>
          {!isComplete && nextStep && (
            <button
              type="button"
              onClick={() => onNavigate(nextStep.path)}
              className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-[#D7897F] px-4 py-2.5 text-[13px] font-black text-white shadow-[0_12px_30px_rgba(215,137,127,0.28)] transition hover:bg-[#C8766D]"
            >
              {lang === "he" ? "התחל הגדרת סלון" : "Start salon setup"}
              <ArrowRight className={`h-4 w-4 ${lang === "he" ? "rotate-180" : ""}`} />
            </button>
          )}
        </div>

        <div className={`rounded-2xl border p-3 ${isDark ? "border-white/[0.10] bg-black/[0.18]" : "border-[#EBDDD2] bg-[#FFF8F0]"}`}>
          <p className={`text-[11px] font-black uppercase tracking-[0.12em] ${isDark ? "text-white/45" : "text-[#7E7066]"}`}>
            {lang === "he" ? "התקדמות" : "Progress"}
          </p>
          <div className="mt-2 flex items-end gap-2">
            <span className={`text-[32px] font-black leading-none ${isDark ? "text-white" : "text-[#141414]"}`}>{progress}%</span>
            <span className={`pb-1 text-[12px] font-bold ${isDark ? "text-white/50" : "text-[#7E7066]"}`}>
              {completedCount}/{items.length}
            </span>
          </div>
          <div className={`mt-3 h-2 w-44 overflow-hidden rounded-full ${isDark ? "bg-white/[0.08]" : "bg-[#EBDDD2]"}`}>
            <div className="h-full rounded-full bg-[#96C7B3] transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.path)}
            className={`flex min-h-[84px] items-start gap-3 rounded-2xl border p-3 text-left transition ${
              item.complete
                ? isDark
                  ? "border-emerald-300/20 bg-emerald-300/[0.08]"
                  : "border-[#CFE1D3] bg-[#F4FAF3]"
                : isDark
                  ? "border-white/[0.10] bg-white/[0.04] hover:bg-white/[0.08]"
                  : "border-[#EBDDD2] bg-white/72 hover:bg-white"
            }`}
          >
            {item.complete ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#5E8C6A]" />
            ) : (
              <Circle className={`mt-0.5 h-4 w-4 shrink-0 ${isDark ? "text-white/35" : "text-[#BDAEA3]"}`} />
            )}
            <span className="min-w-0">
              <span className={`block text-[12px] font-black ${isDark ? "text-white" : "text-[#141414]"}`}>
                {item.label}
              </span>
              <span className={`mt-1 block truncate text-[11px] font-semibold ${isDark ? "text-white/45" : "text-[#7E7066]"}`}>
                {item.detail}
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

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
