import { useState } from "react";
import { useGTM } from "./useGTM";

interface LeadData {
  full_name: string;
  email: string;
  phone?: string;
  company_name?: string;
  message?: string;
  source_page: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

interface UseLeadsReturn {
  submitLead: (data: LeadData) => Promise<boolean>;
  loading: boolean;
  error: string | null;
  success: boolean;
}

export const useLeads = (): UseLeadsReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { trackLeadSubmission } = useGTM();

  const submitLead = async (data: LeadData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Get UTM parameters from URL if not provided
      const urlParams = new URLSearchParams(window.location.search);
      const leadData = {
        ...data,
        utm_source: data.utm_source || urlParams.get("utm_source") || undefined,
        utm_medium: data.utm_medium || urlParams.get("utm_medium") || undefined,
        utm_campaign:
          data.utm_campaign || urlParams.get("utm_campaign") || undefined,
        source_page: data.source_page || window.location.pathname,
      };

      const response = await fetch("/.netlify/functions/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(leadData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`,
        );
      }

      const result = await response.json();
      console.log("Lead submitted successfully:", result);

      // Track lead submission in GTM
      trackLeadSubmission({
        email: leadData.email,
        full_name: leadData.full_name,
        source_page: leadData.source_page,
        utm_source: leadData.utm_source,
        utm_medium: leadData.utm_medium,
        utm_campaign: leadData.utm_campaign,
        company_name: leadData.company_name,
      });

      setSuccess(true);
      setError(null);
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to submit lead";
      console.error("Error submitting lead:", errorMessage);
      setError(errorMessage);
      setSuccess(false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    submitLead,
    loading,
    error,
    success,
  };
};
