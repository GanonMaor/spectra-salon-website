import React, { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Frame } from "./screens/Frame";
import { AboutPage } from "./screens/About";
import { FeaturesPage, HardRockFeaturesPage } from "./screens/Features";
import { PaymentsPage } from "./screens/Payments";
import { ContactPage } from "./screens/Contact";
import { LeadCapturePage, UGCOfferPage } from "./screens/LeadCapture";
import {
  LoginPage,
  SignUpPage,
  ForgotPasswordPage,
  ResetPasswordPage,
} from "./screens/Auth";
import { AdminDashboard } from "./screens/Admin";
import { ProfilePage } from "./screens/Profile";
import { UserProvider } from "./context/UserContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";

// Import all admin pages
import DashboardPage from "./screens/Admin/Dashboard/DashboardPage";
import ActiveClientsPage from "./screens/Admin/Clients/ActiveClientsPage";
import TrialsPage from "./screens/Admin/Clients/TrialsPage";
import ChurnedPage from "./screens/Admin/Clients/ChurnedPage";
import SalesLeadsPage from "./screens/Admin/Sales/LeadsPage";
import UTMReportingPage from "./screens/Admin/Sales/UTMReportingPage";
import RegionalFunnelPage from "./screens/Admin/Sales/RegionalFunnelPage";
import OnboardingStatusPage from "./screens/Admin/Success/OnboardingStatusPage";
import VideoCallRequestsPage from "./screens/Admin/Success/VideoCallRequestsPage";
import AIAlertsPage from "./screens/Admin/Success/AIAlertsPage";
// Support pages removed
import ZoomLinksPage from "./screens/Admin/Live/ZoomLinksPage";
import HelpVideosPage from "./screens/Admin/Live/HelpVideosPage";
import DiagnosticsPage from "./screens/Admin/Live/DiagnosticsPage";
import UserActionsPage from "./screens/Admin/Logs/UserActionsPage";
import UsageHeatmapPage from "./screens/Admin/Logs/UsageHeatmapPage";
import ExportsPage from "./screens/Admin/Logs/ExportsPage";
import SystemUsersPage from "./screens/Admin/System/UsersPage";
import APIKeysPage from "./screens/Admin/System/APIKeysPage";
import PermissionsPage from "./screens/Admin/System/PermissionsPage";
import { ProfilePage as AdminProfilePage } from "./screens/Admin/Account";
// Support pages removed
import MarketingDashboard from "./screens/Admin/Marketing/MarketingDashboard";
import { PipelinePage } from "./screens/Admin/Pipeline";

import "../tailwind.css";
import "./styles/critical.css";
import "./styles/admin.css";
import { PerformanceMonitor } from "./utils/performanceMonitor";
import { ToastProvider } from "./components/ui/toast";
import { NotificationProvider } from "./components/ui/notifications";

// Initialize performance monitoring
const monitor = new PerformanceMonitor();
monitor.startTiming("app-init");

// Test API connection - safe version for preview mode
async function testAPIConnection() {
  try {
    console.log("🔌 Testing API connection...");

    // In preview mode, Netlify functions don't work - skip test
    if (window.location.hostname === "localhost") {
      console.log("⚠️ Preview mode - API functions not available");
      return;
    }

    // Test a simple endpoint
    const response = await fetch("/.netlify/functions/auth/me");
    console.log("📡 API Response Status:", response.status);

    if (response.status === 401) {
      console.log("✅ API Connection: Working (No user logged in)");
    } else if (response.ok) {
      console.log("✅ API Connection: Working with authenticated user");
    } else {
      console.log("⚠️ API Connection: Unexpected response", response.status);
    }
  } catch (error) {
    console.log("❌ API Connection Failed:", error);
  }
}

// Test connection on app start
testAPIConnection();

// Page tracking component
function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    monitor.endTiming("app-init");
    console.log(`🌐 Navigated to: ${location.pathname}`);

    // Track page visits (only if gtag is available)
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
    // App-level initialization
    console.log("🚀 Spectra Salon App Started");

    // No cleanup needed for monitor
  }, []);

  return (
    <StrictMode>
      <BrowserRouter>
        <UserProvider>
          <NotificationProvider>
            <ToastProvider>
              <PageTracker />
              <Routes>
                <Route path="/" element={<Frame />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/features" element={<HardRockFeaturesPage />} />
                <Route path="/payments" element={<PaymentsPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/lead-capture" element={<LeadCapturePage />} />
                <Route path="/ugc-offer" element={<UGCOfferPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route
                  path="/forgot-password"
                  element={<ForgotPasswordPage />}
                />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                {/* Admin Routes with nested layout */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  {/* Default admin route */}
                  <Route index element={<DashboardPage />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="marketing" element={<MarketingDashboard />} />

                  {/* Redirect legacy routes */}
                  <Route path="clients" element={<ActiveClientsPage />} />
                  <Route path="sales" element={<SalesLeadsPage />} />
                  <Route path="success" element={<OnboardingStatusPage />} />
                  {/* Support group removed entirely */}
                  <Route path="live" element={<ZoomLinksPage />} />
                  <Route path="logs" element={<UserActionsPage />} />
                  <Route path="system" element={<SystemUsersPage />} />

                  {/* Clients */}
                  <Route
                    path="clients/active"
                    element={<ActiveClientsPage />}
                  />
                  <Route path="clients/trials" element={<TrialsPage />} />
                  <Route path="clients/churned" element={<ChurnedPage />} />

                  {/* Sales */}
                  <Route path="sales/pipeline" element={<PipelinePage />} />
                  <Route path="sales/leads" element={<SalesLeadsPage />} />
                  <Route
                    path="sales/utm-reporting"
                    element={<UTMReportingPage />}
                  />
                  <Route
                    path="sales/regional-funnel"
                    element={<RegionalFunnelPage />}
                  />

                  {/* Success */}
                  <Route
                    path="success/onboarding-status"
                    element={<OnboardingStatusPage />}
                  />
                  <Route
                    path="success/video-call-requests"
                    element={<VideoCallRequestsPage />}
                  />
                  <Route path="success/ai-alerts" element={<AIAlertsPage />} />

                  {/* Support routes removed */}

                  {/* Live Support */}
                  <Route path="live/zoom-links" element={<ZoomLinksPage />} />
                  <Route path="live/help-videos" element={<HelpVideosPage />} />
                  <Route
                    path="live/diagnostics"
                    element={<DiagnosticsPage />}
                  />

                  {/* Logs */}
                  <Route
                    path="logs/user-actions"
                    element={<UserActionsPage />}
                  />
                  <Route
                    path="logs/usage-heatmap"
                    element={<UsageHeatmapPage />}
                  />
                  <Route path="logs/exports" element={<ExportsPage />} />

                  {/* System */}
                  <Route path="system/users" element={<SystemUsersPage />} />
                  <Route path="system/api-keys" element={<APIKeysPage />} />
                  <Route
                    path="system/permissions"
                    element={<PermissionsPage />}
                  />

                  {/* Account */}
                  <Route path="account/profile" element={<AdminProfilePage />} />
                </Route>

                {/* Legacy admin route - redirect to new dashboard */}
                <Route
                  path="/admin-old"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </ToastProvider>
          </NotificationProvider>
        </UserProvider>
      </BrowserRouter>
    </StrictMode>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
