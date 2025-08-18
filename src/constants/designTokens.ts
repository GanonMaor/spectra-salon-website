// Design Tokens based on glassmorphism specifications
// Colors (פלטה משוערת ומדויקת מספיק לפיתוח)

export const colors = {
  // Base colors
  base: {
    light: '#F3EFEA',           // Base Light / Canvas - רקע שמנתי-בהיר, חם
    canvas: '#F3EFEA',
  },

  // Glass surfaces
  glass: {
    fill: 'rgba(255,255,255,0.55)',      // Glass Panel Fill
    fillHover: 'rgba(255,255,255,0.65)',  // Hover state
    border: 'rgba(255,255,255,0.75)',     // Glass Border 1px
    backdropBlur: 'blur(24px)',           // Background Blur
  },

  // Text colors
  text: {
    primary: '#1E1E1E',         // טקסט כהה עיקרי
    secondary: '#7C7C80',       // טקסט משני / Placeholder start
    secondaryEnd: '#9A9AA1',    // טקסט משני / Placeholder end
    disclaimer: '#A7AAA9',      // דיסקליימר/טקסט אפור חלש
    white: '#FFFFFF',           // White text
    whiteSecondary: 'rgba(255,255,255,0.90)', // White with 90% opacity for softness
  },

  // Icons
  icons: {
    gray: '#C9CBCB',            // אייקונים אפורים
  },

  // Orange accent system (כפתור/Accent כתום)
  accent: {
    500: '#FF7A1A',             // כתום כהה - main accent
    300: '#FFB27A',             // כתום בהיר - light accent
    gradient: 'linear-gradient(180deg, #FFB27A 0%, #FF7A1A 100%)', // Sunset gradient
  },

  // Dark surfaces
  dark: {
    card: '#1B1B1D',            // כרטיס כהה (New in)
  },

  // Interactive states
  interactive: {
    hover: 'rgba(255,255,255,0.65)',     // מצבי Hover/Press בהירים
    press: 'rgba(0,0,0,0.06)',           // קו מודגש
  }
};

// Typography (משתלב מעולה עם Inter / SF Pro / Satoshi)
export const typography = {
  // Font families
  fontFamily: {
    primary: 'Inter, "SF Pro Display", Satoshi, system-ui, sans-serif',
    mono: '"SF Mono", "Monaco", "Consolas", monospace',
  },

  // Font sizes and weights
  scale: {
    // כותרות גדולות (H1/H2) - 48–64px
    display: {
      size: '4rem',        // 64px
      weight: '600',       // SemiBold
      lineHeight: '110%',
      letterSpacing: '0.02em', // אותיות רחבות מעט
    },
    
    h1: {
      size: '3rem',        // 48px
      weight: '600',
      lineHeight: '110%',
      letterSpacing: '0.02em',
    },

    // כותרות בינוניות (Login / New in) - 24–28px
    h2: {
      size: '1.75rem',     // 28px
      weight: '600',
      lineHeight: '120%',
    },
    
    h3: {
      size: '1.5rem',      // 24px
      weight: '600',
      lineHeight: '120%',
    },

    // טקסט גוף - 16px
    body: {
      size: '1rem',        // 16px
      weight: '400',       // Can be 400-500
      lineHeight: '150%',
    },

    bodyMedium: {
      size: '1rem',
      weight: '500',
      lineHeight: '150%',
    },

    // כפתורים/Labels קטנים - 12–14px
    button: {
      size: '0.875rem',    // 14px
      weight: '500',
      lineHeight: '120%',
    },

    caption: {
      size: '0.75rem',     // 12px
      weight: '500',
      lineHeight: '120%',
    },

    // Micro text
    micro: {
      size: '0.625rem',    // 10px
      weight: '400',
      lineHeight: '120%',
    }
  },

  // Tabular numbers for dates/times
  features: {
    tabularNumbers: 'font-feature-settings: "tnum" 1',
  }
};

// Spacing and Layout (רדיוסים, מרווחים ושכבות)
export const layout = {
  // Corner radius
  radius: {
    card: '1.5rem',         // 24px - Corner radius כללי לקלפים (24–28px)
    cardLarge: '1.75rem',   // 28px
    input: '1.125rem',      // 18px - רדיוס לשדות/כפתורים (18–22px)
    inputLarge: '1.375rem', // 22px
    button: '1.25rem',      // 20px - middle ground for buttons
    pill: '9999px',         // Full rounded for pills
  },

  // Padding and margins
  spacing: {
    cardPadding: '1.5rem',     // 24px - Padding פנימי לקלף (24–28px)
    cardPaddingLarge: '1.75rem', // 28px
    groupSpacing: '1rem',       // 16px - מרווח בין קבוצות (16–24px)
    groupSpacingLarge: '1.5rem', // 24px
    inputHeight: '3rem',        // 48px - גובה שדות
    buttonHeight: '2.75rem',    // 44px - גובה כפתורים (44–48px)
    buttonHeightLarge: '3rem',  // 48px
  },

  // Shadows (צללים עדינים)
  shadows: {
    glass: '0 20px 60px rgba(0,0,0,0.10)',              // חיצוני
    glassHover: '0 24px 80px rgba(0,0,0,0.12)',         // Hover state
    inner: 'inset 0 1px 0 rgba(255,255,255,0.35)',     // פנימי עדין לזכוכית
    combined: 'inset 0 1px 0 rgba(255,255,255,0.35), 0 20px 60px rgba(0,0,0,0.10)',
  },

  // Z-index scale
  zIndex: {
    base: 1,
    dropdown: 10,
    sticky: 20,
    fixed: 30,
    modalBackdrop: 40,
    modal: 50,
    popover: 60,
    tooltip: 70,
    toast: 80,
  }
};

// Animations and Transitions
export const motion = {
  // Duration
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },

  // Easing
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Common transitions
  transition: {
    default: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    colors: 'color 150ms cubic-bezier(0.4, 0, 0.2, 1), background-color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1)',
  }
};

// Accessibility
export const a11y = {
  // Focus ring
  focusRing: {
    color: 'rgba(255,122,26,0.6)',  // Orange with 60% opacity
    width: '2px',
    offset: '2px',
  }
};

// CSS Custom Properties for easy usage
export const cssVariables = `
:root {
  /* Colors */
  --color-base-light: ${colors.base.light};
  --color-glass-fill: ${colors.glass.fill};
  --color-glass-border: ${colors.glass.border};
  --color-text-primary: ${colors.text.primary};
  --color-text-secondary: ${colors.text.secondary};
  --color-accent-500: ${colors.accent[500]};
  --color-accent-300: ${colors.accent[300]};
  
  /* Typography */
  --font-family-primary: ${typography.fontFamily.primary};
  
  /* Spacing */
  --radius-card: ${layout.radius.card};
  --radius-input: ${layout.radius.input};
  --spacing-card-padding: ${layout.spacing.cardPadding};
  
  /* Shadows */
  --shadow-glass: ${layout.shadows.glass};
  
  /* Motion */
  --transition-default: ${motion.transition.default};
}
`;
