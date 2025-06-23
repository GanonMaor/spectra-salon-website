import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Frame } from "./screens/Frame";
import { AboutPage } from "./screens/About";
import { FeaturesPage } from "./screens/Features";
import { PaymentsPage } from "./screens/Payments";
import "../tailwind.css";
import "./styles/critical.css";
import { PerformanceMonitor } from "./utils/performanceMonitor";
import { loadStripe } from "@stripe/stripe-js";

// Initialize performance monitoring
const monitor = PerformanceMonitor.getInstance();
monitor.startTiming('app-render');

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string);
const SUMIT_API_URL = import.meta.env.VITE_SUMIT_API_URL || 'https://api.sumit.co.il';
const API_KEY = import.meta.env.VITE_SUMIT_API_KEY;
const ORGANIZATION_ID = import.meta.env.VITE_SUMIT_ORGANIZATION_ID;

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Frame />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);

monitor.endTiming('app-render');
