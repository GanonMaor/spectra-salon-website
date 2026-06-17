import React, { StrictMode, Suspense, lazy, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Frame } from "./screens/Frame";
import { AboutPage } from "./screens/About";
import { UGCOfferPage } from "./screens/LeadCapture";
import { NewInvestorsDeckV1 } from "./screens/InvestorPage";
import { MarketIntelligencePage } from "./screens/MarketIntelligence";
import { SalonPerformanceDashboard } from "./screens/SalonPerformanceDashboard";
import { SalonCRMPage, SchedulePage, CustomersPage, StaffPage, InventoryPage } from "./screens/SalonCRM";
import { HomeDashboardPage } from "./screens/HomeDashboard";
import { AdminDashboard } from "./screens/AdminDashboard";
import { ProductDatabasePage } from "./screens/AdminDashboard/ProductDatabasePage";
import { ProductResolutionPage } from "./screens/AdminDashboard/ProductResolutionPage";
import { LorealAnalyticsPage, SpectraIsraelMarketAnalyticsPage } from "./screens/LorealAnalytics";
import { HairGPTPage } from "./screens/HairGPT/HairGPTPage";
import { CompetitorsPage } from "./screens/Competitors";
import { TimelinePage } from "./screens/SpectraStory";
import { InternalRouteGate } from "./screens/SpectraStory/InternalRouteGate";
import { StrategicForecastPage } from "./screens/StrategicForecast";
import { MaorSpectraStoryPage } from "./screens/MaorSpectraStory";

// Hidden investor experience — code-split so it never weighs the main bundle.
const SpectraProductVisionPage = lazy(() =>
  import("./screens/SpectraProductVision").then((m) => ({
    default: m.SpectraProductVisionPage,
  })),
);

// Dev-only asset intake / QA checklist for the investor experience.
const SpectraAssetCheckPage = lazy(() =>
  import("./screens/SpectraProductVision").then((m) => ({
    default: m.AssetCheckPage,
  })),
);

// New investor experience — hidden route, code-split, never weighs the main bundle.
const InvestorExperiencePage = lazy(() =>
  import("./screens/SpectraInvestorExperience").then((m) => ({
    default: m.InvestorExperiencePage,
  })),
);

// Salon AI-first investor narrative — hidden route, code-split.
const NewNarrativeSalonAIFirstPage = lazy(() =>
  import("./screens/NewNarrativeSalonAIFirst").then((m) => ({
    default: m.NewNarrativeSalonAIFirstPage,
  })),
);

const NewNarrativeSalonAIFirstLiveDemoDraftPage = lazy(() =>
  import("./screens/NewNarrativeSalonAIFirst").then((m) => ({
    default: m.NewNarrativeSalonAIFirstLiveDemoDraftPage,
  })),
);

// Color Intelligence Preview — private manufacturer preview, direct URL only.
const ColorIntelligencePreviewPage = lazy(() =>
  import("./screens/ColorIntelligencePreview").then((m) => ({
    default: m.ColorIntelligencePreviewPage,
  })),
);

// Israeli customer usage sample — private aggregated example, direct URL only.
const IsraelCustomerUsageExamplePage = lazy(() =>
  import("./screens/IsraelCustomerUsageExample").then((m) => ({
    default: m.IsraelCustomerUsageExamplePage,
  })),
);

import "../tailwind.css";
import "./styles/critical.css";
import { PerformanceMonitor } from "./utils/performanceMonitor";
import { ToastProvider } from "./components/ui/toast";
import { NotificationProvider } from "./components/ui/notifications";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LoadingSpinner } from "./components/LoadingSpinner";

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
              <div className="app-shell min-h-[100dvh] w-full overflow-x-hidden">
              <Routes>
                <Route path="/" element={<Frame />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/ugc-offer" element={<UGCOfferPage />} />
                <Route path="/salon-performance" element={<Navigate to="/crm/analytics" replace />} />
                <Route path="/crm" element={<SalonCRMPage />}>
                  <Route index element={<Navigate to="/crm/home" replace />} />
                  <Route path="home" element={<HomeDashboardPage />} />
                  <Route path="schedule" element={<SchedulePage />} />
                  <Route path="customers" element={<CustomersPage />} />
                  <Route path="inventory" element={<InventoryPage />} />
                  <Route path="staff" element={<StaffPage />} />
                  <Route path="analytics" element={<SalonPerformanceDashboard embedded />} />
                </Route>
                <Route path="/market-intelligence" element={<MarketIntelligencePage />} />
                <Route path="/new-investors-deck" element={<NewInvestorsDeckV1 />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/product-database" element={<ProductDatabasePage />} />
                <Route path="/admin/product-resolution" element={<ProductResolutionPage />} />
                <Route
                  path="/spectra-product-vision"
                  element={
                    <Suspense
                      fallback={
                        <div className="min-h-[100dvh] w-full flex items-center justify-center bg-black">
                          <LoadingSpinner />
                        </div>
                      }
                    >
                      <SpectraProductVisionPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/spectra-product-vision/assets-check"
                  element={
                    <Suspense
                      fallback={
                        <div className="min-h-[100dvh] w-full flex items-center justify-center bg-black">
                          <LoadingSpinner />
                        </div>
                      }
                    >
                      <SpectraAssetCheckPage />
                    </Suspense>
                  }
                />
                {/* Hidden investor experience — direct URL only, not linked from nav */}
                <Route
                  path="/investors/salon-ai"
                  element={
                    <Suspense
                      fallback={
                        <div className="min-h-[100dvh] w-full flex items-center justify-center" style={{ background: "#F8F7F4" }}>
                          <LoadingSpinner />
                        </div>
                      }
                    >
                      <InvestorExperiencePage />
                    </Suspense>
                  }
                />
                {/* Salon AI-first investor narrative — hidden, also in Hidden Pages menu */}
                <Route
                  path="/investors/new-narrative-salon-ai-first"
                  element={
                    <Suspense
                      fallback={
                        <div className="min-h-[100dvh] w-full flex items-center justify-center" style={{ background: "#F4EEE6" }}>
                          <LoadingSpinner />
                        </div>
                      }
                    >
                      <NewNarrativeSalonAIFirstPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/investors/new-narrative-salon-ai-first/live-demo-draft"
                  element={
                    <Suspense
                      fallback={
                        <div className="min-h-[100dvh] w-full flex items-center justify-center" style={{ background: "#F4EEE6" }}>
                          <LoadingSpinner />
                        </div>
                      }
                    >
                      <NewNarrativeSalonAIFirstLiveDemoDraftPage />
                    </Suspense>
                  }
                />
                {/* Color Intelligence Preview — private manufacturer preview, direct URL only */}
                <Route
                  path="/investors/color-intelligence-preview"
                  element={
                    <Suspense
                      fallback={
                        <div className="min-h-[100dvh] w-full flex items-center justify-center" style={{ background: "#1F1A15" }}>
                          <LoadingSpinner />
                        </div>
                      }
                    >
                      <ColorIntelligencePreviewPage />
                    </Suspense>
                  }
                />
                {/* Israeli customer usage sample — private aggregated example, direct URL only */}
                <Route
                  path="/investors/israel-customer-usage-example"
                  element={
                    <Suspense
                      fallback={
                        <div className="min-h-[100dvh] w-full flex items-center justify-center" style={{ background: "#1F1A15" }}>
                          <LoadingSpinner />
                        </div>
                      }
                    >
                      <IsraelCustomerUsageExamplePage />
                    </Suspense>
                  }
                />
                <Route path="/loreal-analytics" element={<LorealAnalyticsPage />} />
                <Route path="/spectra-israel-market-analytics" element={<SpectraIsraelMarketAnalyticsPage />} />
                <Route path="/hairgpt" element={<HairGPTPage />} />
                <Route path="/competitors" element={<CompetitorsPage />} />
                <Route path="/spectra-story" element={<InternalRouteGate><TimelinePage /></InternalRouteGate>} />
                <Route path="/maor-spectra-story" element={<MaorSpectraStoryPage />} />
                <Route
                  path="/strategic-forecast"
                  element={
                    <InternalRouteGate
                      accessCode="1221"
                      sessionKey="strategic_forecast_unlocked"
                      title="Strategic Forecast Access"
                      description="Enter the internal code to unlock the 6-year strategic model."
                    >
                      <StrategicForecastPage />
                    </InternalRouteGate>
                  }
                />
              </Routes>
              </div>
            </ErrorBoundary>
          </ToastProvider>
        </NotificationProvider>
      </BrowserRouter>
    </StrictMode>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
