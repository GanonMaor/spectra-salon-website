import { useCallback } from "react";
import { useUserContext } from "../context/UserContext";
import { apiClient } from "../api/client";

export const useCTATracking = () => {
  const { user } = useUserContext();

  const trackClick = useCallback(
    async (
      buttonName: string,
      additionalData?: {
        message?: string;
        source?: string;
      },
    ) => {
      try {
        const clickData = {
          button_name: buttonName,
          page_url: window.location.pathname + window.location.search,
          device_type: getDeviceType(),
          user_agent: navigator.userAgent,
          user_id: user?.id,
          session_id: getSessionId(),
          referrer: document.referrer || undefined,
        };

        await apiClient.trackCTA(clickData);

        // Also track as lead if it's a lead-generating action
        if (isLeadGeneratingAction(buttonName) && additionalData) {
          await apiClient.createLead({
            name: additionalData.source || "CTA User",
            email: user?.email || "",
            source: additionalData.source,
            cta_clicked: buttonName,
            message: additionalData.message,
          });
        }

        console.log(`CTA tracked: ${buttonName}`);
      } catch (error) {
        console.warn("Failed to track CTA click:", error);
        // Don't throw error to avoid breaking user experience
      }
    },
    [user?.id, user?.email],
  );

  return { trackClick };
};

// Helper function to detect device type
function getDeviceType(): string {
  const ua = navigator.userAgent.toLowerCase();

  if (
    ua.includes("mobile") ||
    ua.includes("android") ||
    ua.includes("iphone")
  ) {
    return "mobile";
  }

  if (ua.includes("tablet") || ua.includes("ipad")) {
    return "tablet";
  }

  return "desktop";
}

// Generate session ID for anonymous tracking
export function getSessionId(): string {
  if (typeof window === "undefined") return "server";

  let sessionId = localStorage.getItem("spectra_session_id");

  if (!sessionId) {
    sessionId =
      "session_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now();
    localStorage.setItem("spectra_session_id", sessionId);
  }

  return sessionId;
}

// Helper function to determine if action generates leads
function isLeadGeneratingAction(buttonName: string): boolean {
  const leadActions = [
    "Start Trial",
    "Contact Us",
    "Get Started",
    "Request Demo",
    "Sign Up",
    "Subscribe",
    "Learn More",
    "Book Consultation",
  ];

  return leadActions.some((action) =>
    buttonName.toLowerCase().includes(action.toLowerCase()),
  );
}
