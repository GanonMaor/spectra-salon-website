# Spectra Portable Design Rules

This document consolidates the visual design rules used across the Spectra website, CRM, dashboards, and internal interfaces. It is intended to be portable: you can bring these rules into a new project to recreate the Spectra look and feel without changing business logic.

The rules are based on the current project sources: `tailwind.config.js`, `tailwind.css`, `src/styles/critical.css`, `src/styles/pipeline.css`, `src/design/tokens.ts`, `src/design/layout.ts`, `src/contexts/SiteTheme.tsx`, `src/screens/HairGPT/theme.tsx`, the shared UI components, marketing pages, CRM screens, dashboards, and lead capture flows.

## 1. Design DNA

Spectra should feel premium, precise, calm, and professional. The visual language is minimal, luxurious, and operationally clear.

Core principles:

- Use quiet luxury: cream, black, charcoal, warm gold, soft bronze, generous whitespace.
- Prefer glassmorphism and layered depth over heavy blocks of color.
- Make data instantly readable through clear hierarchy, large metrics, and restrained status colors.
- Design mobile first: every button, form control, menu item, and card must work comfortably by touch.
- Keep interfaces calm: avoid noisy effects, excessive chrome, and unnecessary buttons.
- Support RTL from the start, especially for CRM and salon-facing workflows.
- Use subtle motion only where it improves comprehension or polish.

## 2. Brand Tokens

Use these tokens as the baseline palette before introducing any new colors.

```css
:root {
  /* Core brand */
  --spectra-gold: #c79c6d;
  --spectra-gold-light: #d4a574;
  --spectra-gold-soft: #d4c4a8;
  --spectra-gold-dark: #b8906b;
  --spectra-gold-bright: #eab776;
  --spectra-bronze: #b18059;

  /* Premium neutrals */
  --spectra-black: #000000;
  --spectra-charcoal: #1a1a1a;
  --spectra-charcoal-2: #1d1d1f;
  --spectra-gray-950: #0a0a0a;
  --spectra-gray-900: #171717;
  --spectra-gray-800: #262626;
  --spectra-gray-700: #404040;
  --spectra-gray-600: #525252;
  --spectra-gray-500: #737373;
  --spectra-gray-400: #a3a3a3;
  --spectra-gray-300: #d4d4d4;
  --spectra-gray-200: #e5e5e5;
  --spectra-gray-100: #f5f5f5;
  --spectra-gray-50: #fafafa;

  /* Cream surfaces */
  --spectra-cream: #f9f7f4;
  --spectra-cream-page: #fafaf8;
  --spectra-cream-light: #fefefe;
  --spectra-cream-dark: #f5f3ef;
  --spectra-cream-warm: #f5f0e8;

  /* Legacy admin accent */
  --spectra-red: #b72640;

  /* Semantic states */
  --spectra-success: #22c55e;
  --spectra-success-dark: #16a34a;
  --spectra-warning: #f59e0b;
  --spectra-error: #ef4444;
  --spectra-info: #007aff;

  /* UI primitives */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
  --radius: 0.5rem;
}
```

## 3. Color Usage

### Marketing Website

- Primary backgrounds should be cream, warm off-white, or a subtle cream gradient.
- Primary text should be charcoal or near-black.
- Secondary text should use medium gray, not low-contrast pale gray.
- Gold and bronze are accent colors, not full-page colors.
- Gold works best for CTAs, small dots, icons, thin dividers, text gradients, and glow effects.
- Image sections should use dark or light overlays to preserve readability.
- Blue should be limited to system focus states or specific functional UI, not brand expression.

### Product, CRM, and Dashboards

- Light mode: use `#FAFAF8` for page backgrounds and white or translucent white for cards.
- Dark mode: use true black or near-black surfaces with subtle white transparency.
- Active states should use soft translucent fills, not saturated blocks.
- Positive states use green.
- Negative or risk states use red.
- Warning, fading, and attention states use amber or orange.
- Segmentation colors such as violet, sky, and blue may appear in analytics, but should not become brand colors.

## 4. Gradients

Gradients are part of the Spectra identity, but they should stay refined.

```css
.gradient-spectra-page {
  background: linear-gradient(
    135deg,
    #f9f7f3 0%,
    rgba(212, 196, 168, 0.3) 25%,
    #fefdfb 50%,
    rgba(199, 156, 109, 0.2) 75%,
    #f5f3ef 100%
  );
}

.gradient-spectra-gold {
  background: linear-gradient(135deg, #eab776 0%, #c79c6d 50%, #b18059 100%);
}

.text-gradient-spectra {
  background: linear-gradient(135deg, #eab776 0%, #c79c6d 50%, #b18059 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.gradient-glass {
  background: linear-gradient(
    135deg,
    rgba(255,255,255,0.90) 0%,
    rgba(255,255,255,0.60) 50%,
    rgba(255,255,255,0.80) 100%
  );
}
```

Gradient rules:

- A primary CTA may use a gold-to-bronze gradient.
- A hero headline may use a gradient on one word or one line, not the full text block.
- Glow colors should remain subtle: `rgba(234,183,118,0.03)` to `rgba(234,183,118,0.14)`.
- Avoid more than two different gradient styles in a single section.

## 5. Typography

The current runtime default is a system sans stack:

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

The older dashboard design spec also references:

- `Aspira Nar` for display headings and large numbers.
- `Poppins` for body text, labels, KPI labels, and secondary headings.

When porting, do not add unavailable fonts blindly. A clean system sans implementation is preferable to inconsistent font loading.

### Marketing Scale

```css
.hero-title {
  font-size: clamp(3rem, 8vw, 8rem);
  line-height: 0.95;
  letter-spacing: -0.03em;
  font-weight: 200;
}

.hero-subtitle {
  font-size: clamp(1rem, 2.3vw, 1.5rem);
  line-height: 1.7;
  letter-spacing: -0.01em;
  font-weight: 300;
}

.section-title {
  font-size: clamp(2rem, 4vw, 4rem);
  line-height: 1.05;
  letter-spacing: -0.02em;
  font-weight: 200;
}

.eyebrow {
  font-size: 0.75rem;
  line-height: 1rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.15em;
}
```

### Dashboard Scale

- KPI value: `text-2xl` to `text-3xl` for standard dashboards.
- Large display KPI: 64px to 92px only when the layout is intentionally oversized.
- KPI label: 12px to 14px, medium weight, muted color.
- Tab label: 11px to 13px, semibold.
- Sidebar label: 12px to 13px, medium.
- Dense table/body text: 13px to 16px.
- Caption/meta text: 10px to 12px.

Typography rules:

- Marketing headings should be large, light, and tightly tracked.
- Product and data interfaces can use medium or semibold weights for clarity.
- Avoid heavy bold text in marketing sections except for short emphasis.
- Body line-height should be 1.5 to 1.7.
- Large heading line-height should be 0.95 to 1.15.

## 6. Spacing System

Use an 8px-based spacing system with practical extensions.

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;
  --space-28: 112px;
  --space-32: 128px;
}
```

Spacing rules:

- Compact component padding: 16px.
- Standard card padding: 24px.
- Premium card or hero panel padding: 32px to 48px.
- Internal component gap: 8px to 12px.
- Form field gap: 12px to 16px.
- Card grid gap: 16px to 24px.
- Section gap: 64px to 112px.
- Dashboard headers should use `mb-6` to `mb-8` and horizontal padding so actions do not touch the viewport edge.
- Do not use negative margins to fix layout. Add the correct container padding instead.

## 7. Radius System

```css
:root {
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-pill: 9999px;
}
```

Usage:

- Basic inputs: 8px to 12px.
- Glass inputs: 16px.
- Standard buttons: 8px to 16px.
- Marketing CTAs: full pill.
- Cards: 16px to 24px.
- Premium cards and modals: 24px.
- Square icon buttons: 8px to 12px.
- Badges and pills: full radius.

## 8. Shadows and Depth

Depth should be soft and premium. Avoid harsh black shadows on light backgrounds.

```css
:root {
  --shadow-card-light: 0 4px 24px rgba(0,0,0,0.06);
  --shadow-card-medium: 0 10px 30px rgba(0,0,0,0.08);
  --shadow-glass: 0 20px 60px rgba(0,0,0,0.10);
  --shadow-glass-hover: 0 24px 80px rgba(0,0,0,0.12);
  --shadow-cta: 0 10px 30px rgba(199,156,109,0.25);
  --shadow-dark-panel: 0 4px 40px rgba(0,0,0,0.50);
}
```

Depth rules:

- Standard cards use a light shadow only.
- Interactive cards can increase shadow on hover.
- CTAs may use a warm gold-tinted shadow.
- Dark mode should rely on borders, opacity, and layering more than heavy shadow.
- Glass cards may use an inner highlight: `inset 0 1px 0 rgba(255,255,255,0.35)`.

## 9. Glassmorphism

Glassmorphism is a core interface pattern in Spectra.

```css
.glass-light {
  background: rgba(255,255,255,0.55);
  border: 1px solid rgba(255,255,255,0.75);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}

.glass-light-strong {
  background: rgba(255,255,255,0.70);
  border: 1px solid rgba(255,255,255,0.80);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}

.glass-dark {
  background: rgba(0,0,0,0.20);
  border: 1px solid rgba(255,255,255,0.20);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}

.glass-panel-dark {
  background: rgba(0,0,0,0.70);
  border: 1px solid rgba(255,255,255,0.06);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}
```

Glass rules:

- Use glass over images, gradients, or layered backgrounds.
- On a plain white background, prefer a clean white card over unnecessary glass.
- Use 12px blur for navigation, 20px to 24px for cards and panels, and 64px only for glow/background effects.
- Glass borders should be translucent, not solid gray.
- Always check text contrast on glass surfaces.

## 10. Layout and Containers

Recommended container widths:

- Narrow content: 768px to 896px.
- Marketing content: 1152px.
- Dashboard content: 1280px.
- Wide/product views: up to 1400px.
- Mobile horizontal padding: 16px to 24px.
- Tablet horizontal padding: 32px to 40px.
- Desktop marketing padding: up to 64px.
- Dense app padding: 24px to 32px.

```css
.container-marketing {
  width: 100%;
  max-width: 1152px;
  margin: 0 auto;
  padding-left: 16px;
  padding-right: 16px;
}

@media (min-width: 640px) {
  .container-marketing {
    padding-left: 32px;
    padding-right: 32px;
  }
}

@media (min-width: 1024px) {
  .container-marketing {
    padding-left: 64px;
    padding-right: 64px;
  }
}
```

Responsive rules:

- Mobile: up to 640px.
- Tablet: 641px to 1024px.
- Desktop: 1025px and above.
- Large desktop: 1400px and above.
- Mobile layouts should stack by default.
- Do not force fixed widths on small screens.
- Dense tables and boards should use intentional horizontal scrolling.
- Use `min-height: 100dvh` instead of `100vh` for full-height mobile shells.
- Respect safe areas with `env(safe-area-inset-*)`.

## 11. Page Backgrounds

### Marketing Hero

```css
.marketing-hero {
  position: relative;
  min-height: 88dvh;
  overflow: hidden;
  background-size: cover;
  background-position: center;
}

.hero-overlay-dark {
  background: linear-gradient(
    to bottom,
    rgba(0,0,0,0.90) 0%,
    rgba(0,0,0,0.85) 50%,
    rgba(0,0,0,0.93) 100%
  );
}

.hero-overlay-light {
  background: linear-gradient(
    to bottom,
    rgba(250,250,248,0.92) 0%,
    rgba(245,240,232,0.88) 50%,
    rgba(250,250,248,0.95) 100%
  );
}
```

### CRM and Dashboard Shells

- Use a fixed salon image or a black/cream base background.
- Add a light blur overlay: `backdrop-blur-[2px]`.
- Add a theme-specific dark or cream overlay above the image.
- Keep content on a clear z-index layer above all background treatments.

## 12. Buttons

### Primary Marketing CTA

```css
.btn-spectra-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 16px 32px;
  border-radius: 9999px;
  border: 0;
  background: linear-gradient(90deg, #eab776 0%, #b18059 100%);
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  line-height: 1;
  box-shadow: 0 10px 30px rgba(199,156,109,0.25);
  transition: transform 200ms ease, box-shadow 200ms ease, background 300ms ease;
}

.btn-spectra-primary:hover {
  transform: scale(1.02);
  box-shadow: 0 14px 36px rgba(199,156,109,0.30);
}

.btn-spectra-primary:active {
  transform: scale(0.98);
}
```

### Glass Button

```css
.btn-glass {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 48px;
  padding: 0 24px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.75);
  background: rgba(255,255,255,0.55);
  color: #111827;
  font-size: 14px;
  font-weight: 500;
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  transition: all 150ms ease;
}

.btn-glass:hover {
  background: rgba(255,255,255,0.65);
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
}

.btn-glass:active {
  transform: scale(0.98);
}
```

Button sizing:

- Small: 40px height, 16px horizontal padding, 14px text.
- Medium: 48px height, 24px horizontal padding, 14px text.
- Large: 56px height, 32px horizontal padding, 16px text.
- Icon: at least 40px by 40px.
- Touch target minimum: 44px.

Button rules:

- Use one primary CTA per section.
- Dashboard header actions should use `gap-3` and should not touch the viewport edge.
- Disabled state: 50% opacity, no pointer interaction, no hover scale.
- Focus state must be visible.
- Use destructive red only for destructive actions.

## 13. Inputs and Forms

```css
.input-spectra {
  width: 100%;
  min-height: 48px;
  padding: 0 16px;
  border: 1px solid rgba(0,0,0,0.10);
  border-radius: 12px;
  background: #ffffff;
  color: #1a1a1a;
  font-size: 14px;
  font-weight: 300;
  outline: none;
  transition: border-color 150ms ease, background 150ms ease, box-shadow 150ms ease;
}

.input-spectra:focus {
  border-color: rgba(177,128,89,0.40);
  box-shadow: 0 0 0 2px rgba(234,183,118,0.12);
}

.input-glass {
  height: 48px;
  padding: 0 16px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.75);
  background: rgba(255,255,255,0.55);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}
```

Form rules:

- Labels should be 14px medium or 12px uppercase for short metadata labels.
- Placeholder text should be muted, not primary text color.
- Error state should use a red border and 13px to 14px helper text.
- Submit buttons should usually be full width on mobile.
- Lead capture and modal forms should use 12px to 16px gaps between fields.

## 14. Cards

### Standard Card

```css
.card-standard {
  background: #ffffff;
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.06);
}
```

### Premium Card

```css
.card-premium {
  background: rgba(255,255,255,0.70);
  border: 1px solid rgba(255,255,255,0.80);
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.10);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}
```

### Interactive Card

```css
.card-interactive {
  transition: transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease, background 150ms ease;
  cursor: pointer;
}

.card-interactive:hover {
  transform: translateY(-2px);
  box-shadow: 0 24px 80px rgba(0,0,0,0.12);
}

.card-interactive:active {
  transform: scale(0.98);
}
```

Card rules:

- Marketing cards should use 24px radius, generous padding, and light typography.
- CRM cards should be denser, usually 12px to 16px radius.
- Status should usually live in a small badge, not color the whole card.
- Dark-mode cards should use transparency and borders rather than heavy gray fills.

## 15. KPI and Metrics

KPI components must be immediately readable.

Recommended structure:

- Header row with label and optional muted icon.
- Large value.
- Small delta with arrow and semantic color.
- Optional muted subtitle.

```css
.kpi-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.06);
  transition: box-shadow 300ms ease;
}

.kpi-label {
  font-size: 14px;
  font-weight: 500;
  color: #666666;
}

.kpi-value {
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  line-height: 1;
  font-weight: 700;
  color: #111827;
}

.kpi-delta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 500;
}

.kpi-delta-positive { color: #16a34a; }
.kpi-delta-negative { color: #dc2626; }
.kpi-delta-neutral { color: #737373; }
```

KPI rules:

- Do not overcrowd large numbers with explanatory text.
- If there is no previous value, do not show a fake delta.
- Prefer 4 to 6 meaningful KPIs over a crowded metrics grid.
- Count-up animations are acceptable, but should not exceed 2 seconds.

## 16. Tables, Tabs, and Filters

### Tabs

- Place tab bars inside a soft or glass panel.
- Tab button height should be 36px to 44px.
- Active state should use a slightly stronger translucent fill and a small shadow.
- Inactive state should use muted text with a soft hover state.
- On mobile, tabs should scroll horizontally with `white-space: nowrap`.

```css
.tabbar {
  display: flex;
  align-items: center;
  gap: 4px;
  overflow-x: auto;
  border-radius: 24px;
  border: 1px solid rgba(0,0,0,0.06);
  background: rgba(255,255,255,0.70);
  backdrop-filter: blur(24px);
}

.tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  transition: all 150ms ease;
}
```

### Tables

- Header text: 11px to 12px, uppercase or semibold, muted.
- Row text: 13px to 14px.
- Row hover: translucent 4% to 6% fill.
- Borders: very thin and low contrast.
- Status: small badge, not colored text alone.
- Actions: muted icons with a clear hover state.

## 17. Navigation

### Marketing Navigation

- Fixed at the top.
- Height: 56px on mobile, 64px on desktop.
- Transparent at page top.
- After scroll: `rgba(...,0.95)` background with 12px blur.
- Logo height: 20px to 24px.
- Links: 14px medium, `px-3 py-2`, 8px radius.
- Mobile menu: full-width panel with backdrop blur and 44px minimum link height.

### CRM Sidebar

- Desktop sidebar should be collapsible.
- Expanded width: 220px.
- Collapsed width: 68px.
- Vertical padding: 24px.
- Nav item radius: 12px.
- Nav item padding: 10px to 12px.
- Active state: translucent 8% to 14% fill and small shadow.
- Dark sidebar: `rgba(0,0,0,0.70)` with `rgba(255,255,255,0.06)` border.
- Light sidebar: `rgba(255,255,255,0.85)` with `rgba(0,0,0,0.06)` border.
- Mobile sidebar: off-canvas or full-screen with a dark overlay and outside-click close.

## 18. Modals, Popups, and Overlays

```css
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.50);
  backdrop-filter: blur(4px);
  z-index: 40;
}

.modal-panel {
  width: min(100% - 32px, 512px);
  border-radius: 24px;
  background: #ffffff;
  border: 1px solid rgba(0,0,0,0.06);
  box-shadow: 0 24px 80px rgba(0,0,0,0.18);
  padding: 32px;
  z-index: 50;
}
```

Modal rules:

- Lock body scroll while a modal is open.
- Escape should close the modal.
- Backdrop click may close the modal only when no user input would be lost.
- Close buttons should be 36px to 40px and circular.
- Mobile marketing popups may dock to the bottom with 24px radius.

## 19. Toasts and Notifications

- Desktop position: top-right.
- Mobile position: top or bottom with 16px viewport spacing.
- Default duration: 5 seconds.
- Success: soft green.
- Error: soft red.
- Warning: soft amber/yellow.
- Info: soft blue.
- Include clear text and a close affordance.

```css
.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 320px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid;
  box-shadow: 0 10px 30px rgba(0,0,0,0.10);
  font-size: 14px;
  font-weight: 500;
}
```

## 20. Pipeline Board and Horizontal Scroll

The pipeline board is intentionally horizontal. It should feel natural and should not rely on extra scroll buttons.

```css
.pipeline-board-container {
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 16px;
  margin-left: 0;
  margin-right: 0;
  padding-left: 24px;
  padding-right: 120px;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

.pipeline-stages-flex {
  display: flex;
  gap: 24px;
  min-width: max-content;
  padding: 8px 80px 8px 0;
}

.stage-column {
  min-width: 320px;
  max-width: 320px;
  flex-shrink: 0;
}
```

Pipeline rules:

- Do not use negative margins.
- Add enough left/right padding so the final column is never clipped.
- Stage width should be fixed at 320px.
- Gap between stages should be 24px.
- Scroll hints should be temporary and subtle.
- A short automatic scroll demo on first load is acceptable.
- Avoid permanent "scroll to end" buttons that clutter the interface.

## 21. Icons and Badges

- Recommended icon libraries: Lucide or Heroicons.
- Standard icon size: 16px to 20px.
- KPI icon size: 20px to 24px.
- Button icon size: 16px.
- Empty state icon size: 32px to 48px.
- Icons should be muted by default.
- Use gold only for emphasis.
- Badge height: 20px to 28px.
- Badge radius: full pill.
- Badge text: 11px to 12px, semibold.

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 24px;
  padding: 0 10px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
}
```

## 22. Animation and Motion

```css
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}

.animate-fade-in-up {
  animation: fade-in-up 0.8s ease-out forwards;
}

.transition-spectra-fast {
  transition: all 150ms ease;
}

.transition-spectra {
  transition: all 300ms ease;
}
```

Motion rules:

- Hover micro-interactions: 150ms to 200ms.
- Default transitions: 300ms.
- Section reveal: 600ms to 800ms.
- Accordion/open transitions: 500ms.
- Prefer transform and opacity animations.
- Avoid animating width or height when possible.
- Always respect `prefers-reduced-motion`.

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 23. Accessibility

Required rules:

- Interactive targets must be at least 44px high or wide.
- Focus-visible states must be clear:

```css
*:focus-visible {
  outline: 2px solid #007aff;
  outline-offset: 2px;
}
```

- Text must remain readable on glass and image backgrounds.
- Do not rely on color alone to communicate status.
- Icon-only buttons require `aria-label`.
- Modals need Escape behavior and proper focus management.
- Important images need alt text.
- Decorative glows and backgrounds can be hidden from assistive technology.
- RTL must be tested in actual UI, not only declared with `dir="rtl"`.

## 24. Mobile and Touch Rules

```css
html {
  scroll-behavior: smooth;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  width: 100%;
  overflow-x: clip;
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

body {
  margin: 0;
  overflow-x: clip;
  overscroll-behavior: none;
  touch-action: manipulation;
}

img,
video,
canvas,
svg {
  max-width: 100%;
  height: auto;
  display: block;
}

button,
a.button,
input,
select,
textarea {
  min-height: 44px;
}
```

Mobile rules:

- Prevent global horizontal scroll except in intentional regions such as tables or pipeline boards.
- Mobile nav must be easy to close.
- Mobile CTAs should usually be full width or near full width.
- Mobile hero text should not go below 32px.
- Minimum viewport edge padding: 16px.
- Avoid fixed-height cards when content is dynamic.

## 25. Dark and Light Themes

### Light Theme

```css
:root {
  --theme-bg-page: #fafaf8;
  --theme-bg-card: rgba(255,255,255,0.80);
  --theme-bg-glass: rgba(255,255,255,0.60);
  --theme-text-primary: #1a1a1a;
  --theme-text-secondary: #555555;
  --theme-text-muted: #777777;
  --theme-border-light: rgba(0,0,0,0.06);
  --theme-border-medium: rgba(0,0,0,0.10);
}
```

### Dark Theme

```css
.dark {
  --theme-bg-page: #000000;
  --theme-bg-card: rgba(255,255,255,0.05);
  --theme-bg-glass: rgba(255,255,255,0.05);
  --theme-text-primary: #ffffff;
  --theme-text-secondary: rgba(255,255,255,0.70);
  --theme-text-muted: rgba(255,255,255,0.55);
  --theme-border-light: rgba(255,255,255,0.06);
  --theme-border-medium: rgba(255,255,255,0.10);
}
```

Theme rules:

- Light mode is the default.
- Dark mode should feel premium and black, not flat gray.
- Use semantic tokens instead of hardcoding every color per component.
- Theme toggles should be small controls, not primary CTAs.
- Persist theme selection in local storage when theme switching is implemented.

## 26. Tailwind Mapping

If the new project uses Tailwind, start with this mapping.

```js
export default {
  theme: {
    extend: {
      colors: {
        "spectra-gold": "#c79c6d",
        "spectra-gold-light": "#d4a574",
        "spectra-gold-dark": "#b8906b",
        "spectra-gold-bright": "#eab776",
        "spectra-bronze": "#b18059",
        "spectra-charcoal": "#1a1a1a",
        "spectra-cream": "#fafaf8",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        "spectra-card": "0 4px 24px rgba(0,0,0,0.06)",
        "spectra-glass": "0 20px 60px rgba(0,0,0,0.10)",
        "spectra-cta": "0 10px 30px rgba(199,156,109,0.25)",
      },
      backdropBlur: {
        xl: "24px",
        "3xl": "64px",
      },
      keyframes: {
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(200%)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.8s ease-out forwards",
        shimmer: "shimmer 2s infinite",
      },
    },
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "2rem",
        lg: "4rem",
        xl: "5rem",
        "2xl": "6rem",
      },
      screens: {
        "2xl": "1400px",
      },
    },
  },
};
```

## 27. Component Checklist

Before a new screen is considered Spectra-ready, verify:

- It uses shared color, spacing, radius, and shadow tokens.
- It does not introduce random brand colors.
- It has one clear primary CTA.
- Every interactive control meets the 44px touch target rule.
- Cards use consistent radius and padding.
- Hover, focus, active, and disabled states are defined.
- The interface works in both LTR and RTL where relevant.
- The interface works in light and dark mode if the surface supports themes.
- Nothing is clipped on mobile.
- There is no unwanted global horizontal scroll.
- Motion respects reduced-motion settings.
- Every data status has a clear label, not only color.

## 28. Do and Do Not

Do:

- Use gold as a precise accent, not a large background color.
- Use cream and black as primary foundations.
- Give marketing sections enough breathing room.
- Keep text short and highly readable.
- Use glass only when the background supports it.
- Prefer subtle opacity, borders, and shadows over saturated fills.
- Keep the website, CRM, and dashboards visually consistent.

Do not:

- Do not add new brand colors without a clear reason.
- Do not use negative margins to fix layout.
- Do not use harsh shadows.
- Do not color entire data cards red or green.
- Do not use long or bouncy animations.
- Do not hide overflow if it clips important content.
- Do not make controls smaller than 44px.
- Do not use emoji as professional UI decoration, except in temporary docs or placeholders.

## 29. Portable Starter CSS

This block can be copied into a new project as a visual-only foundation.

```css
:root {
  --spectra-gold: #c79c6d;
  --spectra-gold-light: #d4a574;
  --spectra-gold-dark: #b8906b;
  --spectra-gold-bright: #eab776;
  --spectra-bronze: #b18059;
  --spectra-charcoal: #1a1a1a;
  --spectra-cream: #fafaf8;
  --spectra-success: #22c55e;
  --spectra-warning: #f59e0b;
  --spectra-error: #ef4444;
  --spectra-info: #007aff;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-pill: 9999px;
  --shadow-card: 0 4px 24px rgba(0,0,0,0.06);
  --shadow-glass: 0 20px 60px rgba(0,0,0,0.10);
  --shadow-cta: 0 10px 30px rgba(199,156,109,0.25);
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: clip;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background: var(--spectra-cream);
  color: var(--spectra-charcoal);
  font-size: 16px;
  line-height: 1.6;
  overflow-x: clip;
}

button,
input,
select,
textarea {
  font: inherit;
}

button,
a.button,
input,
select,
textarea {
  min-height: 44px;
}

img,
video,
canvas,
svg {
  max-width: 100%;
  height: auto;
  display: block;
}

*:focus-visible {
  outline: 2px solid var(--spectra-info);
  outline-offset: 2px;
}

.spectra-text-gradient {
  background: linear-gradient(135deg, var(--spectra-gold-bright), var(--spectra-bronze));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.spectra-glass {
  background: rgba(255,255,255,0.55);
  border: 1px solid rgba(255,255,255,0.75);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-glass);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}

.spectra-card {
  background: #ffffff;
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-card);
}

.spectra-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 16px 32px;
  border: 0;
  border-radius: var(--radius-pill);
  background: linear-gradient(90deg, var(--spectra-gold-bright), var(--spectra-bronze));
  color: #ffffff;
  font-weight: 600;
  text-decoration: none;
  box-shadow: var(--shadow-cta);
  transition: transform 200ms ease, box-shadow 200ms ease;
}

.spectra-cta:hover {
  transform: scale(1.02);
  box-shadow: 0 14px 36px rgba(199,156,109,0.30);
}

.spectra-cta:active {
  transform: scale(0.98);
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 30. Implementation Order for a New Project

1. Copy color, radius, shadow, and spacing tokens.
2. Add base CSS for font rendering, body, focus, media, and touch targets.
3. Define buttons, inputs, cards, tabs, and badges before building screens.
4. Add light/dark theme tokens if the new project needs theme switching.
5. Define containers and responsive breakpoints.
6. Add glass utilities only after the project has backgrounds that support glass.
7. Test mobile, RTL, dark mode, keyboard navigation, and reduced motion.
8. Only then style specific product screens.

## 31. Source References in This Project

- `tailwind.config.js` - Tailwind colors, animations, shadows, blur, container settings, and safelist.
- `tailwind.css` - CSS variables, base styles, glass effects, gradients, buttons, cards, and scrollbars.
- `src/styles/critical.css` - mobile hardening, safe areas, critical reset, gradients, reduced motion, and touch rules.
- `src/styles/pipeline.css` - horizontal pipeline scrolling rules.
- `src/design/tokens.ts` - color, typography, shadow, and transition tokens.
- `src/design/layout.ts` - spacing, radius, container, and height tokens.
- `src/design/AUTO_LAYOUT_RULES.md` - auto-layout, grid, motion, z-index, and component rules.
- `src/contexts/SiteTheme.tsx` - website and CRM theme tokens.
- `src/screens/HairGPT/theme.tsx` - AI and analytics interface theme tokens.
- `src/components/ui/glass-button.tsx` - glass button variants.
- `src/components/ui/glass-input.tsx` - glass input variants.
- `src/components/GlassmorphismCard.tsx` - card variants, blur, glow, and interactive states.
- `src/components/Navigation.tsx` - marketing navigation, mobile menu, and theme toggle.
- `src/screens/SalonCRM/SalonCRMPage.tsx` - CRM sidebar, shell, RTL behavior, and light/dark styling.
- `src/screens/SalonPerformanceDashboard/SalonPerformanceDashboard.tsx` - dashboard tabs, date filters, and shell styling.
- `src/screens/Frame/components/HeroSection.tsx` - marketing hero, overlays, typography, and glow rules.
- `src/screens/LeadCapture/LeadCapturePage.tsx` - landing form, plan cards, CTAs, and image sections.
