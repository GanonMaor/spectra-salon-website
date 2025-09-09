// Design tokens for consistent theming
export const COLORS = {
  // Brand colors - Spectra's golden/amber palette
  brand: {
    50: "#FFF8E6",
    100: "#FEECC7",
    200: "#FDD89F",
    300: "#FCC777",
    400: "#FAB450",
    500: "#F9A228", // Primary
    600: "#E6850E",
    700: "#CC7A0D",
    800: "#B26F0C",
    900: "#783A00",
  },
  // Neutral colors
  neutral: {
    50: "#FAFAFA",
    100: "#F5F5F5",
    200: "#E5E5E5",
    300: "#D4D4D4",
    400: "#A3A3A3",
    500: "#737373",
    600: "#525252",
    700: "#404040",
    800: "#262626",
    900: "#171717",
    950: "#0A0A0A",
  },
  // Semantic colors
  success: {
    light: "#4ADE80",
    default: "#22C55E",
    dark: "#16A34A",
  },
  error: {
    light: "#F87171",
    default: "#EF4444",
    dark: "#DC2626",
  },
  warning: {
    light: "#FCD34D",
    default: "#F59E0B",
    dark: "#D97706",
  },
} as const;

export const TYPOGRAPHY = {
  // Font sizes with responsive scaling
  size: {
    xs: "text-xs",      // 12px
    sm: "text-sm",      // 14px
    base: "text-base",  // 16px
    lg: "text-lg",      // 18px
    xl: "text-xl",      // 20px
    "2xl": "text-2xl",  // 24px
    "3xl": "text-3xl",  // 30px
    "4xl": "text-4xl",  // 36px
    "5xl": "text-5xl",  // 48px
  },
  // Font weights
  weight: {
    light: "font-light",      // 300
    normal: "font-normal",    // 400
    medium: "font-medium",    // 500
    semibold: "font-semibold", // 600
    bold: "font-bold",        // 700
  },
  // Line heights
  leading: {
    tight: "leading-tight",    // 1.25
    snug: "leading-snug",      // 1.375
    normal: "leading-normal",  // 1.5
    relaxed: "leading-relaxed", // 1.625
    loose: "leading-loose",    // 2
  },
} as const;

export const SHADOWS = {
  sm: "shadow-sm",
  default: "shadow",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
  "2xl": "shadow-2xl",
  inner: "shadow-inner",
  none: "shadow-none",
} as const;

export const TRANSITIONS = {
  fast: "transition-all duration-150",
  default: "transition-all duration-300",
  slow: "transition-all duration-500",
  // With easing
  smooth: "transition-all duration-300 ease-in-out",
  bounce: "transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]",
} as const;
