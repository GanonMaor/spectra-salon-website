# Salon AI Editorial Theme

Reusable cream-and-ink design language for Salon AI marketing pages.

## Use

```tsx
import { SalonAiEditorialTheme } from "../../design/salonAiEditorial";

export function Page() {
  return (
    <SalonAiEditorialTheme as="main">
      <p className="sai-eyebrow">Salon intelligence</p>
      <h1 className="sai-display sai-display--hero">A smarter salon.</h1>
      <p className="sai-lede">One connected system for the whole salon.</p>
      <a className="sai-button" href="#demo">Book a demo</a>
    </SalonAiEditorialTheme>
  );
}
```

For canvas, charts, or inline styles, import `SALON_AI_EDITORIAL` from the same
module. Do not copy its hex values into page files.

## Shared classes

- `sai-display` with `--hero`, `--section`, or `--statement`
- `sai-eyebrow`, `sai-lede`, `sai-body`, `sai-caption`
- `sai-button` and `sai-button--inverse`
- `sai-card`
- `sai-rule` and `sai-rule--strong`
- `sai-page-gutter`, `sai-container`

## Rules

1. Cream is the canvas; warm black carries the hierarchy.
2. Copper is limited to eyebrows, micro labels, and fine accents.
3. Use hairlines and spacing before adding containers.
4. Photography is warm and full-bleed; exact product UI is contained.
5. One bold headline, one sentence, and one action per section.
6. No gradients, glass cards, cold greys, or decorative shadows.
