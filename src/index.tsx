import React, { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Frame } from "./screens/Frame";
import { AboutPage } from "./screens/About";
import { FeaturesPage } from "./screens/Features";
import { PaymentsPage } from "./screens/Payments";
import { LeadCapturePage, UGCOfferPage } from "./screens/LeadCapture";
import { LoginPage, SignUpPage, ForgotPasswordPage, ResetPasswordPage } from "./screens/Auth";
import { AdminDashboard } from "./screens/Admin";
import { UserProvider } from "./context/UserContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import "../tailwind.css";
import "./styles/critical.css";
import { PerformanceMonitor } from "./utils/performanceMonitor";
import { loadStripe } from "@stripe/stripe-js";
import { supabase } from "./api/supabase/supabaseClient";

// Initialize performance monitoring
const monitor = new PerformanceMonitor();
monitor.startTiming('app-init');

// Test Supabase connection
async function testSupabaseConnection() {
  try {
    console.log('🔌 Testing Supabase connection...');
    
    const { data: session, error } = await supabase.auth.getSession();
    if (error) {
      console.warn('⚠️ Session error (normal if no user logged in):', error.message);
    } else {
      console.log('✅ Supabase auth working! Session:', session?.session ? 'Active' : 'None');
    }
    
    // Test database connection
    const { error: dbError } = await supabase.from('profiles').select('count').limit(1);
    if (dbError) {
      if (dbError.message.includes('relation "public.profiles" does not exist')) {
        console.log('⚠️ Database tables not set up yet (expected for new project)');
        console.log('✅ Supabase connection successful! Ready to set up schema.');
      } else {
        console.warn('Database error:', dbError.message);
      }
    } else {
      console.log('✅ Database connection successful!');
    }
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
  }
}

// Run the test
testSupabaseConnection();

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

// Sumit integration
const ORGANIZATION_ID = import.meta.env.VITE_SUMIT_ORGANIZATION_ID;

// Component to handle scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Frame />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
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
  );
}

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);

monitor.endTiming('app-render');
