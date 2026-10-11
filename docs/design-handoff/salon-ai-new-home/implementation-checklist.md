# Implementation checklist

## Foundation

- [ ] Import and wrap the page with `SalonAiEditorialTheme`.
- [ ] Use CSS variables from the theme; do not copy palette values into page styles.
- [ ] Use `SalonAiLockup` and `SpectraOrb` rather than rebuilding brand elements.
- [ ] Preserve the `/new-home` section order and semantic heading hierarchy.

## Header and navigation

- [ ] Header remains fixed without causing horizontal overflow.
- [ ] Anchor links reach Platform, Across the salon, How it works, and Results.
- [ ] All demo CTAs route to `/book-a-demo`.
- [ ] Mobile menu exposes the same navigation and closes after selection.

## Hero

- [ ] Editorial image fills the hero without distortion.
- [ ] Contrast wash keeps text readable across viewport sizes.
- [ ] Salon AI conversation remains visually dominant but does not obscure the headline.
- [ ] Conversation timing pauses or simplifies for reduced motion.
- [ ] Trust avatars use the approved customer assets.

## Capabilities

- [ ] Desktop focus cards expand one at a time with restrained 3D depth.
- [ ] Auto-cycle pauses on hover, focus, hidden document, and off-screen state.
- [ ] Touch layouts use horizontal scroll snap.
- [ ] Every capability remains readable without animation.

## Editorial and product imagery

- [ ] Front desk, color bar, live inventory, and owner-view assets match `asset-manifest.json`.
- [ ] Live inventory uses the real interface screenshot.
- [ ] Salon OS interface is contained rather than cropped like photography.
- [ ] Decorative images use `alt=""`; meaningful UI images use useful alt text.

## Proof and process

- [ ] Proof metrics use approved source values.
- [ ] Customer story videos use the canonical media and poster paths.
- [ ] Only one customer video plays at a time.
- [ ] Six process points include the matching Lucide icons and step numbers.
- [ ] Mobile process points become a vertical, scannable list.
- [ ] FAQ rows use native keyboard-accessible disclosure behavior.

## Closing CTA

- [ ] Heading and body use light foreground colors over the image.
- [ ] Desktop wash is darkest on the text side.
- [ ] Mobile wash transitions from the bottom.
- [ ] CTA remains readable and at least 44px high.

## Responsive acceptance

- [ ] 320px: no horizontal overflow; hero and assistant remain readable.
- [ ] 375px: sticky CTA does not cover content.
- [ ] 390px: all touch controls are at least 44px.
- [ ] 430px: editorial cards and process list align consistently.
- [ ] 768px: tablet breakpoint does not show a compressed desktop layout.
- [ ] 960px: transition between touch and desktop capability layouts is stable.
- [ ] 1366×768: primary content does not require avoidable scrolling.
- [ ] 1440px: content width and image crops match the desktop reference.

## Performance and quality

- [ ] Hero asset loads eagerly; below-fold assets load lazily.
- [ ] Images use `decoding="async"` where appropriate.
- [ ] No new animation library is required for the hero conversation.
- [ ] No TypeScript or IDE lint errors are introduced.
- [ ] Keyboard focus is visible.
- [ ] `prefers-reduced-motion` is verified.
- [ ] Broken-image, overflow, and route smoke checks pass.
