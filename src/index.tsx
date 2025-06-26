import React, { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Frame } from "./screens/Frame";
import { AboutPage } from "./screens/About";
import { FeaturesPage } from "./screens/Features";
import { PaymentsPage } from "./screens/Payments";
import { LeadCapturePage, UGCOfferPage } from "./screens/LeadCapture";
import "../tailwind.css";
import "./styles/critical.css";
import { PerformanceMonitor } from "./utils/performanceMonitor";
import { loadStripe } from "@stripe/stripe-js";

// Initialize performance monitoring
const monitor = new PerformanceMonitor();
monitor.startTiming('app-init');

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
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Frame />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/lead-capture" element={<LeadCapturePage />} />
        <Route path="/ugc-offer" element={<UGCOfferPage />} />
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);

monitor.endTiming('app-render');
