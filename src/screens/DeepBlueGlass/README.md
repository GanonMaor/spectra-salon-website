# Deep Blue Glass Page

A full glassmorphism landing page with deep blue backgrounds and yellow/orange accent highlights.

## Route

`/deep-blue` - [http://localhost:5000/deep-blue](http://localhost:5000/deep-blue)

## Design Features

- **5 distinct sections**, each with a different deep-blue gradient background
- **Glassmorphism cards** with blur, transparency, and soft shadows
- **Yellow/Orange accents** for highlights, badges, and CTAs
- **Optimized performance**: reduced blur on mobile, GPU acceleration

## Color System

- Deep Blue Backgrounds: `#0B1020` → `#1a2740` (4 shades)
- Glass: `rgba(255,255,255,0.08)` with `blur(14px)` (8px on mobile)
- Accents: Yellow `#F59E0B`, Orange `#F97316`, Cyan `#22D3EE`

## Sections

1. **Hero** - Full-screen intro with main CTA
2. **Achievements** - Key metrics grid
3. **Social Traction** - Market momentum stats
4. **The Ask** - Investment opportunity ($300K)
5. **Unit Economics** - ARR buildup and LTV
6. **ROI Summary** - Final call-to-action

## Performance Notes

- Pattern overlay hidden on mobile
- Blur reduced from 14px to 8px on screens < 768px
- GPU-accelerated transforms on glass cards
- Prefers-reduced-motion support

## Content Source

Reused from existing `NewInvestorsDeck.tsx` component.
