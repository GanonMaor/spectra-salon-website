import React, { createContext, useContext, useState, useCallback } from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "hairgpt-theme";

interface ThemeCtx {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeCtx>({
  theme: "light",
  isDark: false,
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return (localStorage.getItem(STORAGE_KEY) as Theme) || "light";
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
    <ThemeContext.Provider value={{ theme, isDark: theme === "dark", toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

/* ── Semantic color tokens ── */

const dark = {
  bg: {
    page: "#050505",
    shell: "#060606",
    surface: "#080808",
    elevated: "#0a0a0a",
    chat: "#0a0a0a",
    hover: "rgba(255,255,255,0.06)",
    aiBubble: "rgba(255,255,255,0.06)",
    aiBubbleBorder: "rgba(255,255,255,0.08)",
    loading: "rgba(255,255,255,0.05)",
    loadingBorder: "rgba(255,255,255,0.08)",
    sidebar: "rgba(10,10,10,0.98)",
    sidebarBorder: "rgba(255,255,255,0.04)",
    overlay: "rgba(0,0,0,0.50)",
    tooltip: "#111111",
    tooltipBorder: "rgba(234,183,118,0.12)",
    kpiCard: "rgba(255,255,255,0.015)",
    kpiBorder: "rgba(234,183,118,0.06)",
    chartContainer: "rgba(8,8,8,0.8)",
    chartBorder: "rgba(234,183,118,0.06)",
    inputBg: "rgba(255,255,255,0.03)",
    inputBorder: "rgba(255,255,255,0.08)",
    inputFocusBorder: "rgba(234,183,118,0.30)",
    chipBg: "rgba(255,255,255,0.03)",
    chipBorder: "rgba(255,255,255,0.08)",
    chipHoverBg: "rgba(234,183,118,0.06)",
    chipHoverBorder: "rgba(234,183,118,0.15)",
    footerBg: "rgba(10,10,10,0.95)",
    footerBorder: "rgba(255,255,255,0.06)",
    commandSurface: "#080808",
    commandBorder: "rgba(234,183,118,0.08)",
    commandShadow: "inset 0 1px 0 rgba(255,255,255,0.03), 0 4px 40px rgba(0,0,0,0.5)",
    topBarBorder: "rgba(255,255,255,0.05)",
    chartGrid: "rgba(255,255,255,0.03)",
    confidenceBorder: "rgba(255,255,255,0.06)",
    tickerDot: "rgba(234,183,118,0.30)",
    sidebarDivider: "rgba(255,255,255,0.04)",
  },
  text: {
    primary: "#ffffff",
    primarySoft: "rgba(255,255,255,0.90)",
    secondary: "rgba(255,255,255,0.78)",
    muted: "rgba(255,255,255,0.55)",
    dimmed: "rgba(255,255,255,0.40)",
    faint: "rgba(255,255,255,0.30)",
    ghost: "rgba(255,255,255,0.25)",
    placeholder: "rgba(255,255,255,0.35)",
    label: "rgba(255,255,255,0.25)",
    chip: "rgba(255,255,255,0.60)",
    chipHover: "rgba(255,255,255,0.80)",
    chartAxis: "rgba(255,255,255,0.40)",
    chartAxisY: "rgba(255,255,255,0.35)",
    chartLegend: "rgba(255,255,255,0.40)",
    ticker: "rgba(255,255,255,0.35)",
    kpiLabel: "rgba(255,255,255,0.40)",
    kpiValue: "rgba(255,255,255,0.90)",
    confidence: "rgba(255,255,255,0.45)",
    tooltip: "#ffffff",
    sidebarHeader: "rgba(255,255,255,0.55)",
    sidebarActive: "rgba(255,255,255,0.80)",
    sidebarInactive: "rgba(255,255,255,0.45)",
    sidebarFooter: "rgba(255,255,255,0.25)",
    bullet: "rgba(255,255,255,0.85)",
    link: "rgba(255,255,255,0.30)",
    linkHover: "rgba(255,255,255,0.50)",
    icon: "rgba(255,255,255,0.40)",
    iconHover: "rgba(255,255,255,0.60)",
    deleteIcon: "rgba(255,255,255,0.15)",
    emptyState: "rgba(255,255,255,0.30)",
  },
  hero: {
    pageBg: "#050505",
    photoOverlay: "linear-gradient(105deg, transparent 0%, rgba(6,6,6,0.5) 25%, rgba(6,6,6,0.92) 50%, #060606 65%), linear-gradient(to bottom, rgba(6,6,6,0.6) 0%, transparent 20%, transparent 75%, #060606 100%)",
    goldGlow: "radial-gradient(ellipse 60% 50% at 55% 10%, rgba(234,183,118,0.14) 0%, transparent 60%)",
    wordmarkStroke: "1px rgba(255,255,255,0.025)",
    wordmarkShadow: "0 0 80px rgba(234,183,118,0.04)",
    contentScrim: "radial-gradient(ellipse 55% 70% at 50% 45%, rgba(6,6,6,0.55) 0%, transparent 70%)",
    titleColor: "#ffffff",
    titleShadow: "0 2px 24px rgba(0,0,0,0.5)",
    subtitleColor: "rgba(255,255,255,0.78)",
    subtitleShadow: "0 1px 16px rgba(0,0,0,0.6)",
    transitionBg: "linear-gradient(to bottom, #060606 0%, rgba(234,183,118,0.04) 50%, #060606 100%)",
    transitionLine: "linear-gradient(90deg, transparent 0%, rgba(234,183,118,0.25) 50%, transparent 100%)",
    analyticsBg: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(234,183,118,0.03) 0%, transparent 55%)",
    tickerBorder: "1px solid rgba(234,183,118,0.04)",
    tickerFadeLeft: "linear-gradient(to right, #050505, transparent)",
    tickerFadeRight: "linear-gradient(to left, #050505, transparent)",
    chartAxisLine: "rgba(255,255,255,0.06)",
  },
  globe: {
    bloom: "radial-gradient(circle, rgba(234,183,118,0.10) 12%, rgba(177,128,89,0.04) 35%, transparent 58%)",
    surface: "radial-gradient(circle at 30% 25%, #161310 0%, #0c0a07 28%, #070605 55%, #030302 100%)",
    innerShadow: "inset -50px -40px 100px rgba(0,0,0,0.7), inset 20px 15px 60px rgba(234,183,118,0.02)",
    outerGlow: "0 0 2px rgba(234,183,118,0.22), 0 0 40px rgba(234,183,118,0.07), 0 0 100px rgba(234,183,118,0.03)",
  },
  langToggle: {
    bg: "rgba(255,255,255,0.03)",
    hoverBg: "rgba(255,255,255,0.06)",
    border: "rgba(255,255,255,0.08)",
    divider: "rgba(255,255,255,0.10)",
    inactive: "rgba(255,255,255,0.50)",
  },
  chartRenderer: {
    containerBg: "rgba(13,13,13,0.60)",
    containerBorder: "rgba(234,183,118,0.10)",
    titleColor: "rgba(255,255,255,0.70)",
    tooltipBg: "#1a1a1a",
    tooltipBorder: "rgba(255,255,255,0.1)",
    tooltipColor: "#fff",
    gridStroke: "rgba(255,255,255,0.06)",
    axisTick: "#999999",
    legendColor: "#999999",
  },
};

const light: typeof dark = {
  bg: {
    page: "#FAFAF8",
    shell: "#F5F3EF",
    surface: "#FFFFFF",
    elevated: "#F5F3EF",
    chat: "#FAFAF8",
    hover: "rgba(0,0,0,0.04)",
    aiBubble: "rgba(0,0,0,0.035)",
    aiBubbleBorder: "rgba(0,0,0,0.07)",
    loading: "rgba(0,0,0,0.04)",
    loadingBorder: "rgba(0,0,0,0.08)",
    sidebar: "rgba(255,255,255,0.98)",
    sidebarBorder: "rgba(0,0,0,0.06)",
    overlay: "rgba(0,0,0,0.25)",
    tooltip: "#FFFFFF",
    tooltipBorder: "rgba(234,183,118,0.20)",
    kpiCard: "rgba(0,0,0,0.02)",
    kpiBorder: "rgba(234,183,118,0.12)",
    chartContainer: "rgba(255,255,255,0.90)",
    chartBorder: "rgba(234,183,118,0.10)",
    inputBg: "rgba(0,0,0,0.02)",
    inputBorder: "rgba(0,0,0,0.10)",
    inputFocusBorder: "rgba(234,183,118,0.45)",
    chipBg: "rgba(0,0,0,0.025)",
    chipBorder: "rgba(0,0,0,0.08)",
    chipHoverBg: "rgba(234,183,118,0.08)",
    chipHoverBorder: "rgba(234,183,118,0.22)",
    footerBg: "rgba(250,250,248,0.95)",
    footerBorder: "rgba(0,0,0,0.06)",
    commandSurface: "#FFFFFF",
    commandBorder: "rgba(234,183,118,0.14)",
    commandShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 24px rgba(0,0,0,0.04)",
    topBarBorder: "rgba(0,0,0,0.06)",
    chartGrid: "rgba(0,0,0,0.06)",
    confidenceBorder: "rgba(0,0,0,0.06)",
    tickerDot: "rgba(234,183,118,0.50)",
    sidebarDivider: "rgba(0,0,0,0.06)",
  },
  text: {
    primary: "#1A1A1A",
    primarySoft: "#2A2A2A",
    secondary: "#555555",
    muted: "#777777",
    dimmed: "#999999",
    faint: "#BBBBBB",
    ghost: "#CCCCCC",
    placeholder: "rgba(0,0,0,0.35)",
    label: "rgba(0,0,0,0.30)",
    chip: "#666666",
    chipHover: "#333333",
    chartAxis: "#888888",
    chartAxisY: "#888888",
    chartLegend: "#888888",
    ticker: "#999999",
    kpiLabel: "#888888",
    kpiValue: "#1A1A1A",
    confidence: "#888888",
    tooltip: "#1A1A1A",
    sidebarHeader: "#555555",
    sidebarActive: "#1A1A1A",
    sidebarInactive: "#777777",
    sidebarFooter: "#BBBBBB",
    bullet: "#333333",
    link: "#999999",
    linkHover: "#555555",
    icon: "#999999",
    iconHover: "#555555",
    deleteIcon: "#CCCCCC",
    emptyState: "#BBBBBB",
  },
  hero: {
    pageBg: "#FAFAF8",
    photoOverlay: "linear-gradient(105deg, transparent 0%, rgba(250,250,248,0.5) 25%, rgba(250,250,248,0.92) 50%, #FAFAF8 65%), linear-gradient(to bottom, rgba(250,250,248,0.6) 0%, transparent 20%, transparent 75%, #FAFAF8 100%)",
    goldGlow: "radial-gradient(ellipse 60% 50% at 55% 10%, rgba(234,183,118,0.10) 0%, transparent 60%)",
    wordmarkStroke: "1px rgba(0,0,0,0.04)",
    wordmarkShadow: "0 0 80px rgba(234,183,118,0.06)",
    contentScrim: "radial-gradient(ellipse 55% 70% at 50% 45%, rgba(250,250,248,0.45) 0%, transparent 70%)",
    titleColor: "#1A1A1A",
    titleShadow: "none",
    subtitleColor: "#666666",
    subtitleShadow: "none",
    transitionBg: "linear-gradient(to bottom, #FAFAF8 0%, rgba(234,183,118,0.06) 50%, #FAFAF8 100%)",
    transitionLine: "linear-gradient(90deg, transparent 0%, rgba(234,183,118,0.35) 50%, transparent 100%)",
    analyticsBg: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(234,183,118,0.04) 0%, transparent 55%)",
    tickerBorder: "1px solid rgba(234,183,118,0.08)",
    tickerFadeLeft: "linear-gradient(to right, #FAFAF8, transparent)",
    tickerFadeRight: "linear-gradient(to left, #FAFAF8, transparent)",
    chartAxisLine: "rgba(0,0,0,0.08)",
  },
  globe: {
    bloom: "radial-gradient(circle, rgba(234,183,118,0.08) 12%, rgba(177,128,89,0.03) 35%, transparent 58%)",
    surface: "radial-gradient(circle at 30% 25%, #e8e4df 0%, #ddd8d0 28%, #d5d0c8 55%, #ccc7be 100%)",
    innerShadow: "inset -50px -40px 100px rgba(255,255,255,0.4), inset 20px 15px 60px rgba(234,183,118,0.04)",
    outerGlow: "0 0 2px rgba(234,183,118,0.18), 0 0 30px rgba(234,183,118,0.06), 0 0 80px rgba(234,183,118,0.02)",
  },
  langToggle: {
    bg: "rgba(0,0,0,0.03)",
    hoverBg: "rgba(0,0,0,0.06)",
    border: "rgba(0,0,0,0.10)",
    divider: "rgba(0,0,0,0.10)",
    inactive: "#999999",
  },
  chartRenderer: {
    containerBg: "rgba(0,0,0,0.02)",
    containerBorder: "rgba(234,183,118,0.15)",
    titleColor: "#555555",
    tooltipBg: "#FFFFFF",
    tooltipBorder: "rgba(0,0,0,0.10)",
    tooltipColor: "#1A1A1A",
    gridStroke: "rgba(0,0,0,0.06)",
    axisTick: "#888888",
    legendColor: "#888888",
  },
};

export const themeColors = { dark, light };

export function useColors() {
  const { theme } = useTheme();
  return themeColors[theme];
}
