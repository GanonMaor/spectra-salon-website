import React, { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Frame } from "./screens/Frame";
import { AboutPage } from "./screens/About";
import { LeadCapturePage, UGCOfferPage } from "./screens/LeadCapture";
import { NewInvestorsDeck, NewInvestorsDeckV1 } from "./screens/InvestorPage";
import { MarketIntelligencePage } from "./screens/MarketIntelligence";
import { SalonPerformanceDashboard } from "./screens/SalonPerformanceDashboard";
import { SalonCRMPage, SchedulePage, CustomersPage, StaffPage } from "./screens/SalonCRM";
import { AdminDashboard } from "./screens/AdminDashboard";
import { LorealAnalyticsPage } from "./screens/LorealAnalytics";

import "../tailwind.css";
import "./styles/critical.css";
import { PerformanceMonitor } from "./utils/performanceMonitor";
import { ToastProvider } from "./components/ui/toast";
import { NotificationProvider } from "./components/ui/notifications";
import { ErrorBoundary } from "./components/ErrorBoundary";

function getPerfMonitor(): PerformanceMonitor | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const enable = Boolean((import.meta as any)?.env?.DEV) && params.get("debugPerf") === "1";
  if (!enable) return null;
  return new PerformanceMonitor();
}

const monitor = getPerfMonitor();
monitor?.startTiming("app-init");

// Page tracking component
function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    monitor?.endTiming("app-init");
    console.log(`🌐 Navigated to: ${location.pathname}`);

    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("config", "GA_MEASUREMENT_ID", {
        page_path: location.pathname,
      });
    }
  }, [location]);

  return null;
}

function App() {
  useEffect(() => {
    console.log("🚀 Spectra Salon App Started");
  }, []);

  return (
    <StrictMode>
      <BrowserRouter>
        <NotificationProvider>
          <ToastProvider>
            <PageTracker />
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Frame />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/ugc-offer" element={<UGCOfferPage />} />
                <Route path="/lead-capture" element={<LeadCapturePage />} />
                <Route path="/salon-performance" element={<Navigate to="/crm/analytics" replace />} />
                <Route path="/crm" element={<SalonCRMPage />}>
                  <Route index element={<Navigate to="/crm/analytics" replace />} />
                  <Route path="schedule" element={<SchedulePage />} />
                  <Route path="customers" element={<CustomersPage />} />
                  <Route path="staff" element={<StaffPage />} />
                  <Route path="analytics" element={<SalonPerformanceDashboard embedded />} />
                </Route>
                <Route path="/market-intelligence" element={<MarketIntelligencePage />} />
                <Route path="/new-investors-deck" element={<NewInvestorsDeckV1 />} />
                <Route path="/new-investors-deck-v1" element={<NewInvestorsDeck />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/loreal-analytics" element={<LorealAnalyticsPage />} />
              </Routes>
            </ErrorBoundary>
          </ToastProvider>
        </NotificationProvider>
      </BrowserRouter>
    </StrictMode>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
