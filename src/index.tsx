import React, { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Frame } from "./screens/Frame";
import { AboutPage } from "./screens/About";
import { FeaturesPage } from "./screens/Features";
import { PaymentsPage } from "./screens/Payments";
import { ContactPage } from "./screens/Contact";
import { LeadCapturePage, UGCOfferPage } from "./screens/LeadCapture";
import { LoginPage, SignUpPage, ForgotPasswordPage, ResetPasswordPage } from "./screens/Auth";
import { AdminDashboard } from "./screens/Admin";
import { UserProvider } from "./context/UserContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import "../tailwind.css";
import "./styles/critical.css";
import { PerformanceMonitor } from "./utils/performanceMonitor";

// Initialize performance monitoring
const monitor = new PerformanceMonitor();
monitor.startTiming('app-init');

// Test API connection - safe version for preview mode
async function testAPIConnection() {
  try {
    console.log('🔌 Testing API connection...');
    
    // In preview mode, Netlify functions don't work - skip test
    if (window.location.hostname === 'localhost') {
      console.log('⚠️ Preview mode - API functions not available');
      return;
    }
    
    // Test if our API is working
    const response = await fetch('/.netlify/functions/auth/me', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || 'test'}`
      }
    });
    
    if (response.status === 401) {
      console.log('✅ API is working! (401 expected without valid token)');
    } else if (response.ok) {
      console.log('✅ API is working and user is authenticated!');
    } else {
      console.log('⚠️ API responded with status:', response.status);
    }
  } catch (error) {
    console.warn('⚠️ API connection test failed (expected in preview mode):', error);
  }
}

// Initialize Stripe only if key is available
let stripePromise: Promise<any> | null = null;
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (stripeKey && stripeKey.trim()) {
  import('@stripe/stripe-js').then(({ loadStripe }) => {
    stripePromise = loadStripe(stripeKey);
  });
} else {
  console.log('⚠️ Stripe key not available (preview mode)');
}

// Test connection on app start
testAPIConnection();

monitor.endTiming('app-init');

// Page tracking
function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    // Track page views for analytics
    console.log(`Page view: ${location.pathname}`);
    
    // Performance monitoring for route changes
    monitor.startTiming(`route-${location.pathname}`);
    
    return () => {
      monitor.endTiming(`route-${location.pathname}`);
    };
  }, [location]);

  return null;
}

function App() {
  useEffect(() => {
    // App-level initialization
    console.log('🚀 Spectra Salon App Started');
    
    // No cleanup needed for monitor
  }, []);

  return (
    <StrictMode>
      <BrowserRouter>
        <UserProvider>
          <PageTracker />
          <Routes>
            <Route path="/" element={<Frame />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/lead-capture" element={<LeadCapturePage />} />
            <Route path="/ugc-offer" element={<UGCOfferPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </UserProvider>
      </BrowserRouter>
    </StrictMode>
  );
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
} else {
  console.error("Root container not found");
}
