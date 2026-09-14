# Start Now

Isolated, public, local-first 10-step post-booking onboarding and equipment-order flow. Intended route: `/start-now`. This folder is self-contained; routing and production wiring live outside the module.

## Structure

- `types.ts` — domain objects, result type, seed and analytics contracts
- `PRODUCTION_WIRING.md` — exact Netlify, Neon, Stripe, auth, email, and fulfillment handoff
- `repository.ts` — `local` adapter plus reserved `netlify-neon` stub (no secrets, no database)
- `persistence.ts` — session-scoped draft and local preview orders
- `useStartNow.ts` — reducer / controller hook
- `StartNowPage.tsx` — editorial page shell
- `components/` — progress, summary rail, and one file per step
- `validation.ts`, `deliveryEstimate.ts`, `analytics.ts` (`useStartNowAnalytics`), `ids.ts`, `seed.ts`

## Local limitations

- Drafts and preview orders stay in `sessionStorage`, so contact and shipping details do not persist after the tab session.
- Authorization is simulated. No card PAN, expiry, CVC, or PayPal credentials are collected.
- Passwords exist only in ephemeral component state. The repository stores `passwordSet: true` only.
- Email, maps, carriers, and CRM login are previews. Local mode links setup calls to `/book-a-demo` and login to `/user-login?redirect=/crm/setup` without auto-entering CRM.
- Optional `demoBookingId` / `seed` / `seedSource` can prefill account fields without importing DemoBooking internals.
- Analytics callbacks and `dataLayer` events include step IDs and non-PII categories only.
