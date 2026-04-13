import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { CrmLang, CrmTranslations } from "./translations";
import { crmTranslations } from "./translations";

const STORAGE_KEY = "crm_lang";

interface CrmLocaleContextValue {
  lang: CrmLang;
  isRTL: boolean;
  t: CrmTranslations;
  toggleLang: () => void;
  setLang: (l: CrmLang) => void;
}

const CrmLocaleContext = createContext<CrmLocaleContextValue | null>(null);

export function CrmLocaleProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<CrmLang>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as CrmLang | null;
      return stored === "he" ? "he" : "en";
    } catch {
      return "en";
    }
  });

  const setLang = useCallback((l: CrmLang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {}
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === "en" ? "he" : "en");
  }, [lang, setLang]);

  const isRTL = lang === "he";

  // Sync document attribute when CRM is active (optional, non-destructive)
  useEffect(() => {
    const prevLang = document.documentElement.getAttribute("data-crm-lang");
    document.documentElement.setAttribute("data-crm-lang", lang);
    return () => {
      if (prevLang) {
        document.documentElement.setAttribute("data-crm-lang", prevLang);
      } else {
        document.documentElement.removeAttribute("data-crm-lang");
      }
    };
  }, [lang]);

  const value: CrmLocaleContextValue = {
    lang,
    isRTL,
    t: crmTranslations[lang],
    toggleLang,
    setLang,
  };

  return (
    <CrmLocaleContext.Provider value={value}>
      {children}
    </CrmLocaleContext.Provider>
  );
}

export function useCrmLocale(): CrmLocaleContextValue {
  const ctx = useContext(CrmLocaleContext);
  if (!ctx) throw new Error("useCrmLocale must be used inside CrmLocaleProvider");
  return ctx;
}

// Convenience hook — returns just the translations object
export function useCrmT(): CrmTranslations {
  return useCrmLocale().t;
}
