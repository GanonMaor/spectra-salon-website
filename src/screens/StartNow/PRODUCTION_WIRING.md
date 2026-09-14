# Start Now — production wiring

This file is the handoff from the local preview to a production order and account-activation system. The UI must continue to depend only on `StartNowRepository`.

## Service boundaries

1. `POST /.netlify/functions/start-now-session`
   - Accepts the optional demo-booking ID and account fields.
   - Returns an opaque onboarding-session token and server idempotency key.
   - Rate-limit by normalized email plus a privacy-preserving network fingerprint.

2. `POST /.netlify/functions/start-now-checkout`
   - Creates a Stripe Checkout Session or PaymentIntent on the server.
   - Receives product IDs, shipping details, and the idempotency key; prices always come from the server catalog.
   - Returns only the Stripe client secret or hosted-checkout URL. The Spectra UI must never receive or store PAN, expiry, or CVC.

3. `POST /.netlify/functions/stripe-webhook`
   - Verifies the Stripe signature and is the source of truth for paid/failed/refunded state.
   - Creates exactly one hardware order and its line items in a transaction.
   - Queues confirmation email and fulfillment only after a verified payment event.

4. `GET /.netlify/functions/start-now-order?token=...`
   - Returns the minimum confirmation view for an opaque, expiring order token.
   - Never exposes an order by a sequential ID or client-supplied salon ID.

5. `POST /.netlify/functions/start-now-activate`
   - Accepts the activation token and password over TLS.
   - Hashes the password server-side with Argon2id or bcrypt; the client never sends a hash and never persists the password.
   - In one transaction, creates/links `crm_users`, creates the salon membership, marks activation consumed, and issues the existing salon session.

6. `POST /.netlify/functions/start-now-complete`
   - Marks commercial onboarding complete while leaving CRM operational onboarding incomplete.
   - The existing `/crm/setup` flow remains responsible for services, staff, brands, product lines, and inventory.

## Neon data model

Add new migrations; do not reuse `spectra_payments`, `subscribers`, salon POS tables, or imported Sumit billing data.

- `onboarding_sessions`: opaque ID, optional `demo_booking_id`, normalized email, current step, status, idempotency key, expiry, timestamps.
- `equipment_catalog`: server-owned SKU, name, active flag, price in minor units, currency, fulfillment metadata.
- `hardware_orders`: order ID/number, onboarding session, Stripe customer/payment references, payment and fulfillment statuses, totals, timestamps.
- `hardware_order_items`: order ID, SKU, quantity, immutable unit-price snapshot.
- `hardware_shipping_addresses`: encrypted or access-restricted order address snapshot.
- `account_activations`: hashed one-time token, order/user references, expiry, consumed timestamp.
- `outbox_events`: idempotent email and fulfillment jobs with retry state.

Unique constraints are required on the onboarding idempotency key, Stripe event ID, Stripe payment reference, order number, and activation-token hash.

## Existing-system connections

- Demo booking → Start Now: keep the current `sessionStorage` handoff; production should exchange `demo_booking_id` server-side rather than placing contact data in the URL.
- CRM identity: use `crm_users` and `salon_memberships` only after verified payment/activation. Replace the shared `SALON_LOGIN_PASSWORD` mechanism before enabling public activation.
- CRM onboarding: create the salon with `onboarding_status = incomplete`; send the authenticated user to `/crm/setup`, not directly to `/crm/home`.
- Email: create dedicated transactional templates and an outbox worker. Do not expose the admin-only `send-email` function.
- Shipping: add a server adapter for the selected fulfillment provider. Carrier ETA and tracking must come from that provider, not from the client mock.
- Analytics: retain the current non-PII step events. Never send email, phone, address, password, Stripe IDs, or order tokens to GTM.

## Rollout order

1. Add migrations and repository integration tests against a dedicated test database.
2. Implement session/order read APIs with rate limits and strict schemas.
3. Add Stripe test-mode checkout and signed webhook handling.
4. Add transactional outbox email and fulfillment adapters.
5. Implement per-user password activation and remove shared-password login.
6. Swap the page to the Netlify repository behind an environment flag.
7. Run test-mode end-to-end checks for duplicate submit, abandoned activation, webhook replay, payment failure, refund, and expired tokens.
8. Enable production credentials only after monitoring and a rollback path are in place.

## Non-negotiable safeguards

- Server owns price, currency, stock, order status, and salon identity.
- Every mutating request is schema-validated, rate-limited, auditable, and idempotent.
- Webhook verification precedes fulfillment or account provisioning.
- Secrets stay in Netlify environment variables and never use a `VITE_` prefix.
- Logs and error tracking redact contact, shipping, credential, and payment data.
