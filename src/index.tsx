import React, { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Frame } from "./screens/Frame";
import { AboutPage } from "./screens/About";
import { LeadCapturePage, UGCOfferPage } from "./screens/LeadCapture";
import {
  LoginPage,
  SignUpPage,
  ForgotPasswordPage,
  ResetPasswordPage,
} from "./screens/Auth";
import { AdminDashboard } from "./screens/Admin";
import { ProfilePage } from "./screens/Profile";
import { PaymentsDashboard } from "./screens/Dashboard";
import { InvestorPage, InvestorPageNewDesign, NewInvestorsDeck } from "./screens/InvestorPage";
import { AnalyticsDashboard } from "./screens/AnalyticsDashboard";
import { MarketIntelligencePage } from "./screens/MarketIntelligence";
import { SalonPerformanceDashboard } from "./screens/SalonPerformanceDashboard";
import { LorealAnalyticsPage } from "./screens/LorealAnalytics";
import { UserProvider } from "./context/UserContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

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
        <UserProvider>
          <NotificationProvider>
            <ToastProvider>
              <PageTracker />
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<Frame />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/payments" element={<PaymentsPage />} />
                  <Route path="/lead-capture" element={<LeadCapturePage />} />
                  <Route path="/ugc-offer" element={<UGCOfferPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignUpPage />} />
                  <Route
                    path="/forgot-password"
                    element={<ForgotPasswordPage />}
                  />
                  <Route
                    path="/reset-password"
                    element={<ResetPasswordPage />}
                  />
                  <Route path="/investors" element={<InvestorPage />} />
                  <Route path="/new-design" element={<InvestorPageNewDesign />} />
                  <Route path="/new-investors-deck" element={<NewInvestorsDeck />} />
                  <Route path="/analytics" element={<AnalyticsDashboard />} />
                  <Route path="/salon-performance" element={<SalonPerformanceDashboard />} />
                  <Route path="/market-intelligence" element={<MarketIntelligencePage />} />
                  <Route path="/loreal-analytics" element={<LorealAnalyticsPage />} />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  {/* Dashboard Route - Payments Dashboard */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <PaymentsDashboard />
                      </ProtectedRoute>
                    }
                  />
                  {/* Admin Route - Overview Only */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/*"
                    element={<div>Redirecting to admin overview...</div>}
                  />
                  <Route
                    path="/admin-old"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </ErrorBoundary>
            </ToastProvider>
          </NotificationProvider>
        </UserProvider>
      </BrowserRouter>
    </StrictMode>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
