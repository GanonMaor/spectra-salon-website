# Salon AI new home — developer handoff

Implementation reference for the new Salon AI marketing homepage.

## Source of truth

- Live preview route: `/new-home`
- Page: `src/screens/SalonAiHome/SalonAiHomePage.tsx`
- Page styles: `src/screens/SalonAiHome/salonAiHome.css`
- Shared theme: `src/design/salonAiEditorial/`
- Animated hero: `src/screens/SalonAiHome/HeroAssistant.tsx`
- Capability cards: `src/screens/SalonAiHome/components/CapabilitiesFocus.tsx`
- Brand lockup: `src/components/SalonAiLockup.tsx`
- Orb: `src/components/SpectraOrb.tsx`

Do not redraw the page from screenshots when the source files are available. Screenshots document the intended result; the React and CSS files define exact behavior.

## Visual references

- [Desktop — 1440px](./new-home-desktop-1440.png)
- [Mobile — 390px](./new-home-mobile-390.png)

## Design direction

- Warm cream canvas with warm black hierarchy.
- Inter Tight for display typography; Inter for body and controls.
- Copper is limited to eyebrows, numbers, icons, and fine accents.
- Use hairlines and spacing before adding containers.
- Photography is warm, editorial, and full-bleed.
- Product UI is shown inside contained, intentional frames.
- No decorative drop shadows, cold greys, glass panels, or loud gradients.
- One dominant headline, one supporting sentence, and one clear action per section.

## Page structure

1. Fixed editorial header
   - Salon AI lockup
   - Four anchor links
   - Book a demo CTA
   - Mobile menu below 960px

2. Hero
   - Full-bleed salon image
   - Dark contrast wash
   - Main product statement and CTAs
   - Floating Salon AI conversation
   - Customer trust marker

3. Platform capabilities
   - Subtle auto-cycling focus cards
   - Desktop 3D depth treatment
   - Horizontal snap cards on touch layouts

4. Everywhere in the salon
   - Four editorial cards
   - Front desk, color bar, live inventory interface, owner view

5. Proof strip
   - Five verified product-data signals

6. Three product layers
   - Salon OS
   - Color Intelligence
   - Salon AI

7. Customer stories
   - Six approved customer videos
   - Horizontal snap rail with play and Instagram actions

8. How it works
   - Six-step process
   - Scannable Lucide icon and number for each point

9. Frequently asked questions
   - Five native disclosure rows
   - Keyboard-accessible `details` and `summary` behavior

10. Closing CTA
   - Full-bleed owner image
   - Dark wash
   - Light foreground copy

11. Footer and mobile sticky CTA

## Responsive behavior

- Wide desktop: content capped by the section rules in `salonAiHome.css`.
- Under 1100px: layouts tighten without changing the visual language.
- At 960px and below:
  - Header becomes a compact mobile header.
  - Hero and assistant stack.
  - Capability cards become a touch-friendly horizontal snap rail.
  - Editorial image grids become one column.
  - How-it-works becomes a vertical sequence.
  - Closing image uses a bottom-up contrast wash.
  - Sticky demo CTA respects `env(safe-area-inset-bottom)`.
- Required verification widths: 320, 375, 390, 430, 768, 960, 1366, and 1440px.
- Horizontal overflow is not permitted.

## Motion

- Use `--sai-ease`, `--sai-motion-fast`, and `--sai-motion-reveal`.
- Capability cycling pauses on hover, keyboard focus, document invisibility, and when off-screen.
- Hero conversation uses lightweight timed CSS/state transitions.
- Customer videos play one at a time and pause when they leave the active state.
- Respect `prefers-reduced-motion`; content must remain complete without animation.

## Accessibility

- Keep semantic section headings and ordered lists.
- Decorative imagery uses empty alt text.
- Product UI imagery requires descriptive alt text.
- All controls need visible keyboard focus.
- Interactive targets are at least 44px on mobile.
- Do not encode meaning through color alone.
- Maintain readable contrast over all photography.

## Content and integrations

- All “Book a demo” links point to `/book-a-demo`.
- Booking completion can hand off to `/start-now`.
- The live-inventory card uses an existing Salon AI interface asset, not a generic stock photo.
- Proof numbers must remain tied to approved source data.
- Social links must use verified Spectra URLs.

## Files in this handoff

- `tokens.json` — machine-readable design values.
- `asset-manifest.json` — exact public asset paths and intended placements.
- `implementation-checklist.md` — acceptance checklist for the receiving developer.
- `new-home-desktop-1440.png` — full desktop reference.
- `new-home-mobile-390.png` — full mobile reference.
