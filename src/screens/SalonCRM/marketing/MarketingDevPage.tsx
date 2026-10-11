/**
 * Development-only tools for the marketing mock: demo data switch, simulated
 * clock, calendar events, provider answers, roles and reset. Registered only
 * in dev builds and never linked from the owner-facing screen.
 */

import React, { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MarketingProvider, useMarketing } from "./MarketingProvider";
import { Toast, useNotice } from "./MarketingPage";
import { DemoBanner } from "./components/DemoBanner";
import { SimulatorTab } from "./components/SimulatorTab";
import { MarketingUiContext, useMarketingCopy, type MarketingUi } from "./components/helpers";
import { Card, InlineNotice, Segmented, useMk } from "./components/ui";

const MarketingDevScreen: React.FC = () => {
  const { m } = useMarketingCopy();
  const mk = useMk();
  const navigate = useNavigate();
  const { mode, actions } = useMarketing();
  const { notice, notify } = useNotice();

  const ui = useMemo<MarketingUi>(
    () => ({
      view: "home",
      goHome: () => navigate("/crm/marketing"),
      openHistory: () => navigate("/crm/marketing?view=history"),
      editKind: null,
      openEditor: (kind) => navigate(kind ? `/crm/marketing?edit=${kind}` : "/crm/marketing"),
      openMessage: (id) => navigate(`/crm/marketing?view=history&msg=${id}`),
      openSettings: () => navigate("/crm/marketing"),
      notify,
    }),
    [navigate, notify],
  );

  return (
    <MarketingUiContext.Provider value={ui}>
      <div className="mx-auto max-w-[1080px] space-y-4 pb-6">
        <header className="flex flex-wrap items-center gap-3">
          <h1 className={`me-auto text-lg font-bold ${mk.textStrong}`}>{m.simulator.title}</h1>
          <Link to="/crm/marketing" className={`text-[12.5px] font-semibold underline-offset-2 hover:underline ${mk.textSoft}`}>
            {m.home.back}
          </Link>
        </header>
        <DemoBanner />
        <Card className="flex flex-wrap items-center gap-3 p-4">
          <span className={`text-[12.5px] font-semibold ${mk.textSoft}`}>{m.mode.label}</span>
          <Segmented
            label={m.mode.label}
            size="sm"
            value={mode}
            onChange={(next) => actions.setMode(next)}
            options={[
              { value: "salon", label: m.mode.salon },
              { value: "demo", label: m.mode.demo },
            ]}
          />
        </Card>
        {mode === "demo" ? <SimulatorTab /> : <InlineNotice tone="info">{m.empty.salonNoDataBody}</InlineNotice>}
        <Toast notice={notice} />
      </div>
    </MarketingUiContext.Provider>
  );
};

const MarketingDevPage: React.FC = () => (
  <MarketingProvider>
    <MarketingDevScreen />
  </MarketingProvider>
);

export default MarketingDevPage;
