# Auto-Layout Rules for Spectra Salon

## Spacing System

- **Extra Small (xs)**: 8px - Tight spacing for compact elements
- **Small (sm)**: 12px - Default spacing within components
- **Medium (md)**: 16px - Standard spacing between elements
- **Large (lg)**: 24px - Section spacing
- **Extra Large (xl)**: 32px - Major section breaks

## Border Radius

- **Small**: 8px - Inputs, small buttons
- **Medium**: 12px - Cards, modals
- **Large**: 16px - Large cards, hero sections
- **Extra Large**: 24px - Feature sections
- **Full**: 9999px - Pills, badges, circular elements

## Typography Scale

- **Headings**: Use responsive sizing with clamp()
  - H1: clamp(2rem, 5vw, 3.5rem)
  - H2: clamp(1.5rem, 4vw, 2.5rem)
  - H3: clamp(1.25rem, 3vw, 2rem)
- **Body**: 16px base with 1.5 line height
- **Small**: 14px for secondary text
- **Caption**: 12px for metadata

## Grid System

- **Container**: max-w-7xl (1280px)
- **Columns**: 12 on desktop, 6 on tablet, 4 on mobile
- **Gutters**: 16px on mobile, 24px on desktop

## Component Heights

- **Buttons**: 44px minimum (accessibility)
- **Inputs**: 48px for comfortable touch
- **Cards**: Flexible with consistent padding
- **Navigation**: 64px fixed height

## Color Usage

- **Primary actions**: Spectra gold/amber
- **Secondary**: Neutral grays
- **Destructive**: Red for warnings
- **Success**: Green for confirmations

## Animation Guidelines

- **Duration**: 150ms (fast), 300ms (default), 500ms (slow)
- **Easing**: ease-in-out for most transitions
- **Respect**: prefers-reduced-motion

## Z-Index Scale

- **Base**: 0
- **Dropdown**: 10
- **Sticky**: 20
- **Fixed**: 30
- **Modal backdrop**: 40
- **Modal**: 50
- **Toast**: 60
- **Tooltip**: 70
