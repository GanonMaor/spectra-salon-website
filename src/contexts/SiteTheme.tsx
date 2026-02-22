import React, { createContext, useContext, useState, useCallback } from "react";

export type SiteTheme = "dark" | "light";

const STORAGE_KEY = "site-theme";

interface SiteThemeCtx {
  theme: SiteTheme;
  isDark: boolean;
  toggleTheme: () => void;
}

const Ctx = createContext<SiteThemeCtx>({
  theme: "light",
  isDark: false,
  toggleTheme: () => {},
});

export const SiteThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<SiteTheme>(() => {
    try {
      return (localStorage.getItem(STORAGE_KEY) as SiteTheme) || "light";
    } catch {
      return "light";
    }
  });

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return (
    <Ctx.Provider value={{ theme, isDark: theme === "dark", toggleTheme }}>
      {children}
    </Ctx.Provider>
  );
};

export const useSiteTheme = () => useContext(Ctx);

/* ── Color tokens ── */

const dark = {
  bg: {
    page: "#000000",
    section: "#000000",
    card: "rgba(255,255,255,0.05)",
    cardHover: "rgba(255,255,255,0.10)",
    cardSolid: "rgba(0,0,0,0.50)",
    cardSolidHover: "rgba(0,0,0,0.70)",
    glass: "rgba(255,255,255,0.05)",
    glassHover: "rgba(255,255,255,0.10)",
    overlay: "rgba(0,0,0,0.88)",
    overlayStrong: "rgba(0,0,0,0.92)",
    navScrolled: "rgba(0,0,0,0.95)",
    demoCard: "rgba(0,0,0,0.70)",
  },
  text: {
    primary: "#ffffff",
    secondary: "rgba(255,255,255,0.70)",
    muted: "rgba(255,255,255,0.50)",
    dimmed: "rgba(255,255,255,0.40)",
    faint: "rgba(255,255,255,0.30)",
    highlight: "#ffffff",
    navLink: "rgba(255,255,255,0.70)",
    navLinkHover: "#ffffff",
    cardTitle: "#ffffff",
    cardDesc: "rgba(255,255,255,0.60)",
    cardSubtext: "rgba(255,255,255,0.40)",
    stat: "#ffffff",
    statLabel: "rgba(255,255,255,0.50)",
    icon: "rgba(255,255,255,0.80)",
    iconMuted: "rgba(255,255,255,0.50)",
  },
  border: {
    subtle: "rgba(255,255,255,0.04)",
    light: "rgba(255,255,255,0.06)",
    medium: "rgba(255,255,255,0.08)",
    strong: "rgba(255,255,255,0.10)",
    hover: "rgba(255,255,255,0.15)",
    card: "rgba(255,255,255,0.10)",
    cardHover: "rgba(255,255,255,0.20)",
  },
  nav: {
    bg: "transparent",
    scrolledBg: "rgba(0,0,0,0.95)",
    mobileBg: "rgba(0,0,0,0.95)",
    mobileLink: "rgba(255,255,255,0.80)",
    mobileLinkHover: "rgba(255,255,255,0.06)",
    hamburger: "rgba(255,255,255,0.80)",
    toggleBg: "rgba(255,255,255,0.05)",
    toggleBorder: "rgba(255,255,255,0.10)",
  },
  hero: {
    overlay: "linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.80) 50%, rgba(0,0,0,0.90) 100%)",
    textPrimary: "#ffffff",
    textMuted: "rgba(255,255,255,0.60)",
    textDimmed: "rgba(255,255,255,0.40)",
    textHighlight: "#ffffff",
    playBg: "rgba(255,255,255,0.10)",
    playBgHover: "rgba(255,255,255,0.15)",
    playBorder: "rgba(255,255,255,0.20)",
    playBorderHover: "rgba(255,255,255,0.30)",
    glowA: "rgba(234,183,118,0.05)",
    glowB: "rgba(177,128,89,0.05)",
    carouselBg: "#000000",
    carouselBorder: "rgba(255,255,255,0.04)",
  },
  imageSection: {
    overlay: "linear-gradient(to bottom, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.85) 50%, rgba(0,0,0,0.92) 100%)",
    textPrimary: "#ffffff",
    textSecondary: "rgba(255,255,255,0.70)",
    textMuted: "rgba(255,255,255,0.50)",
    textDimmed: "rgba(255,255,255,0.40)",
    textFaint: "rgba(255,255,255,0.30)",
    badgeBg: "rgba(255,255,255,0.05)",
    badgeBorder: "rgba(255,255,255,0.10)",
    cardBg: "rgba(255,255,255,0.05)",
    cardBgHover: "rgba(255,255,255,0.10)",
    cardBorder: "rgba(255,255,255,0.10)",
    cardBorderHover: "rgba(255,255,255,0.20)",
    solidCardBg: "rgba(0,0,0,0.70)",
    solidCardBgHover: "rgba(0,0,0,0.80)",
    glowA: "rgba(234,183,118,0.05)",
    glowB: "rgba(177,128,89,0.05)",
    iconColor: "#D4A06A",
  },
};

const light: typeof dark = {
  bg: {
    page: "#FAFAF8",
    section: "#FAFAF8",
    card: "rgba(0,0,0,0.03)",
    cardHover: "rgba(0,0,0,0.06)",
    cardSolid: "rgba(255,255,255,0.80)",
    cardSolidHover: "rgba(255,255,255,0.90)",
    glass: "rgba(255,255,255,0.60)",
    glassHover: "rgba(255,255,255,0.80)",
    overlay: "rgba(0,0,0,0.70)",
    overlayStrong: "rgba(0,0,0,0.80)",
    navScrolled: "rgba(255,255,255,0.95)",
    demoCard: "rgba(255,255,255,0.90)",
  },
  text: {
    primary: "#1A1A1A",
    secondary: "#555555",
    muted: "#777777",
    dimmed: "#999999",
    faint: "#BBBBBB",
    highlight: "#1A1A1A",
    navLink: "#555555",
    navLinkHover: "#1A1A1A",
    cardTitle: "#1A1A1A",
    cardDesc: "#555555",
    cardSubtext: "#999999",
    stat: "#1A1A1A",
    statLabel: "#777777",
    icon: "#555555",
    iconMuted: "#999999",
  },
  border: {
    subtle: "rgba(0,0,0,0.04)",
    light: "rgba(0,0,0,0.06)",
    medium: "rgba(0,0,0,0.08)",
    strong: "rgba(0,0,0,0.10)",
    hover: "rgba(0,0,0,0.15)",
    card: "rgba(0,0,0,0.08)",
    cardHover: "rgba(0,0,0,0.15)",
  },
  nav: {
    bg: "transparent",
    scrolledBg: "rgba(255,255,255,0.95)",
    mobileBg: "rgba(255,255,255,0.98)",
    mobileLink: "#333333",
    mobileLinkHover: "rgba(0,0,0,0.04)",
    hamburger: "#333333",
    toggleBg: "rgba(0,0,0,0.04)",
    toggleBorder: "rgba(0,0,0,0.10)",
  },
  hero: {
    overlay: "linear-gradient(to bottom, rgba(250,250,248,0.92) 0%, rgba(245,240,232,0.88) 50%, rgba(250,250,248,0.95) 100%)",
    textPrimary: "#1A1A1A",
    textMuted: "#777777",
    textDimmed: "#999999",
    textHighlight: "#1A1A1A",
    playBg: "rgba(0,0,0,0.06)",
    playBgHover: "rgba(0,0,0,0.10)",
    playBorder: "rgba(0,0,0,0.10)",
    playBorderHover: "rgba(0,0,0,0.15)",
    glowA: "rgba(234,183,118,0.08)",
    glowB: "rgba(177,128,89,0.06)",
    carouselBg: "#FAFAF8",
    carouselBorder: "rgba(0,0,0,0.04)",
  },
  imageSection: {
    overlay: "linear-gradient(to bottom, rgba(250,248,244,0.88) 0%, rgba(245,238,228,0.85) 50%, rgba(250,248,244,0.92) 100%)",
    textPrimary: "#1A1A1A",
    textSecondary: "#444444",
    textMuted: "#666666",
    textDimmed: "#999999",
    textFaint: "#BBBBBB",
    badgeBg: "rgba(0,0,0,0.04)",
    badgeBorder: "rgba(0,0,0,0.08)",
    cardBg: "rgba(255,255,255,0.50)",
    cardBgHover: "rgba(255,255,255,0.70)",
    cardBorder: "rgba(0,0,0,0.06)",
    cardBorderHover: "rgba(0,0,0,0.12)",
    solidCardBg: "rgba(255,255,255,0.65)",
    solidCardBgHover: "rgba(255,255,255,0.80)",
    glowA: "rgba(234,183,118,0.10)",
    glowB: "rgba(177,128,89,0.08)",
    iconColor: "#C08A50",
  },
};

export const siteColors = { dark, light };

export function useSiteColors() {
  const { theme } = useSiteTheme();
  return siteColors[theme];
}
