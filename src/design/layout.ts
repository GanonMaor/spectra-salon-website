// Consistent spacing and layout constants based on Auto-Layout principles
export const GAP = {
  xs: "gap-2",    // 8px
  sm: "gap-3",    // 12px
  md: "gap-4",    // 16px
  lg: "gap-6",    // 24px
  xl: "gap-8",    // 32px
} as const;

export const PADDING = {
  xs: "py-2",      // 8px
  sm: "py-4",      // 16px
  md: "py-6",      // 24px
  lg: "py-8",      // 32px
  xl: "py-10",     // 40px
} as const;

export const RADIUS = {
  sm: "rounded-lg",      // 8px
  md: "rounded-xl",      // 12px
  lg: "rounded-2xl",     // 16px
  xl: "rounded-3xl",     // 24px
  full: "rounded-full",  // 9999px
} as const;

export const CONTAINER = {
  base: "mx-auto px-0 sm:px-6 lg:px-8",
  narrow: "max-w-4xl",
  default: "max-w-7xl",
  wide: "max-w-screen-2xl",
} as const;

export const HEIGHT = {
  screen: "min-h-dvh", // Dynamic viewport height (better than h-screen for mobile)
  hero: "min-h-[80vh]",
  section: "min-h-[60vh]",
} as const;
