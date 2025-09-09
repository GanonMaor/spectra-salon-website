import React, { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Frame } from "./screens/Frame";
import { AboutPage } from "./screens/About";
import { PaymentsPage } from "./screens/Payments";
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
import { InvestorPage } from "./screens/InvestorPage";
import { UserProvider } from "./context/UserContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
// AdminLayout removed - AdminDashboard is now self-contained

// Only keep the main AdminDashboard - all other admin pages removed

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

    // Test a simple endpoint that doesn't require authentication
    const response = await fetch("/.netlify/functions/db-check");
    console.log("📡 API Response Status:", response.status);

    if (response.ok) {
      console.log("✅ API Connection: Working");
    } else {
      console.log("⚠️ API Connection: Limited (some functions may not be available)");
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
                <Route path="/payments" element={<PaymentsPage />} />
                <Route path="/lead-capture" element={<LeadCapturePage />} />
                <Route path="/ugc-offer" element={<UGCOfferPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route
                  path="/forgot-password"
                  element={<ForgotPasswordPage />}
                />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/investors" element={<InvestorPage />} />
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
                {/* Admin Routes with nested layout */}
                {/* Admin Route - Overview Only */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                
                {/* Redirect any removed admin routes to main admin */}
                <Route path="/admin/*" element={<div>Redirecting to admin overview...</div>} />

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
