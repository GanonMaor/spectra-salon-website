/**
 * CRM "שיווק" tab (internal name: CustomerAutomations).
 * Views are query-param driven (`?view=history`, `?edit=`, `?msg=`) so a
 * refresh returns to the same screen, editor or message. Demo and test tools
 * live on the separate dev route, never on this screen.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, History, Megaphone, Settings2 } from "lucide-react";
import { MarketingProvider, useMarketing } from "./MarketingProvider";
import { AUTOMATION_ORDER, type AutomationKind } from "./types";
import { HomeView } from "./components/HomeView";
import { AutomationEditor } from "./components/AutomationEditor";
import { HistoryTab } from "./components/HistoryTab";
import { MessageDrawer } from "./components/MessageDrawer";
import { SettingsDrawer } from "./components/SettingsDrawer";
import { MarketingUiContext, useMarketingCopy, type MarketingUi, type MarketingView } from "./components/helpers";
import { SettingsPlaceholder, SmallButton, useMk } from "./components/ui";

function isKind(value: string | null): value is AutomationKind {
  return Boolean(value && (AUTOMATION_ORDER as string[]).includes(value));
}

type Notice = { id: number; text: string; tone: "good" | "bad" | "info" };

export const Toast: React.FC<{ notice: Notice | null }> = ({ notice }) => {
  const mk = useMk();
  if (!notice) return null;
  const tone =
    notice.tone === "bad"
      ? "bg-[#8E3F38] text-white"
      : mk.isDark
        ? "bg-white text-[#141414]"
        : "bg-[#141414] text-white";
  return (
    <div
      key={notice.id}
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(84px+env(safe-area-inset-bottom))] z-[130] flex justify-center px-4 lg:bottom-6"
    >
      <div className={`max-w-[520px] rounded-xl px-4 py-2.5 text-[12.5px] font-semibold shadow-lg ${tone}`}>{notice.text}</div>
    </div>
  );
};

export function useNotice() {
  const [notice, setNotice] = useState<Notice | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const notify = useCallback((text: string, tone: Notice["tone"] = "good") => {
    window.clearTimeout(timer.current);
    setNotice({ id: Date.now(), text, tone });
    timer.current = window.setTimeout(() => setNotice(null), 3800);
  }, []);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return { notice, notify };
}

export const MarketingScreen: React.FC = () => {
  const { m, isRTL } = useMarketingCopy();
  const mk = useMk();
  const { permissions } = useMarketing();
  const [params, setParams] = useSearchParams();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { notice, notify } = useNotice();
  const Back = isRTL ? ArrowRight : ArrowLeft;

  const editParam = params.get("edit");
  const editKind = isKind(editParam) ? editParam : null;
  const view: MarketingView = !editKind && (params.get("view") === "history" || params.get("tab") === "history") ? "history" : "home";
  const messageId = params.get("msg");

  const updateParams = useCallback(
    (patch: Record<string, string | null>, reset = false) => {
      setParams((current) => {
        const next = reset ? new URLSearchParams() : new URLSearchParams(current);
        for (const [key, value] of Object.entries(patch)) {
          if (value === null) next.delete(key);
          else next.set(key, value);
        }
        return next;
      });
    },
    [setParams],
  );

  const ui = useMemo<MarketingUi>(
    () => ({
      view,
      goHome: () => updateParams({}, true),
      openHistory: (filters = {}) => updateParams({ view: "history", ...filters }, true),
      editKind,
      openEditor: (kind) => updateParams(kind ? { edit: kind } : {}, true),
      openMessage: (id) => updateParams({ msg: id }),
      openSettings: () => setSettingsOpen(true),
      notify,
    }),
    [editKind, notify, updateParams, view],
  );

  if (!permissions.canView) {
    return (
      <SettingsPlaceholder
        isDark={mk.isDark}
        icon={<Megaphone className="h-5 w-5" />}
        title={m.permissions.noAccessTitle}
        description={m.permissions.noAccessBody}
      />
    );
  }

  const settingsButton = permissions.canManageSettings && (
    <SmallButton onClick={() => setSettingsOpen(true)}>
      <Settings2 className="h-3.5 w-3.5" /> {m.home.settings}
    </SmallButton>
  );

  return (
    <MarketingUiContext.Provider value={ui}>
      <div className="mx-auto max-w-[1080px] space-y-4 pb-6">
        {editKind ? (
          <AutomationEditor key={editKind} kind={editKind} />
        ) : view === "history" ? (
          <>
            <header className="flex flex-wrap items-center gap-2">
              <SmallButton onClick={ui.goHome} aria-label={m.home.back}>
                <Back className="h-4 w-4" /> {m.home.back}
              </SmallButton>
              <h1 className={`me-auto text-lg font-bold tracking-tight ${mk.textStrong}`}>{m.home.history}</h1>
              {settingsButton}
            </header>
            <HistoryTab />
          </>
        ) : (
          <>
            <header className="flex flex-wrap items-center gap-x-4 gap-y-3 px-1 pt-1">
              <div className="min-w-0 basis-full sm:basis-0 sm:flex-1">
                <h1 className={`text-xl font-bold tracking-tight sm:text-2xl ${mk.textStrong}`}>{m.pageTitle}</h1>
                <p className={`mt-0.5 text-[12.5px] ${mk.textSoft}`}>{m.pageSubtitle}</p>
              </div>
              <div className="flex items-center gap-2">
                <SmallButton onClick={() => ui.openHistory()}>
                  <History className="h-3.5 w-3.5" /> {m.home.history}
                </SmallButton>
                {settingsButton}
              </div>
            </header>
            <HomeView />
          </>
        )}

        <MessageDrawer messageId={messageId} onClose={() => updateParams({ msg: null })} />
        <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
        <Toast notice={notice} />
      </div>
    </MarketingUiContext.Provider>
  );
};

const MarketingPage: React.FC = () => (
  <MarketingProvider>
    <MarketingScreen />
  </MarketingProvider>
);

export default MarketingPage;
