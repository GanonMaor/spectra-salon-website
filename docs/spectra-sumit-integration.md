# Spectra + SUMIT Integration README

## Executive Summary

This document outlines the integration of SUMIT payment processing into the Spectra application. The goal is to enable secure, PCI-compliant payments for subscriptions and trials without storing sensitive card data. We use SUMIT's API for customer management, payment methods, recurring charges, and webhooks for event handling.

Key features:

- Tokenization via SUMIT Hosted Fields
- Recurring subscriptions with 30-day trials
- Webhook handling for payment events
- Environment-specific secrets management

## ASCII Diagram of Flow

```
User (Frontend) --> Signup Form (Hosted Fields) --> SUMIT SDK (Token)
                    |
                    v
Netlify Function (Backend) --> SUMIT API (Create Customer + Attach Method + Create Recurring)
                    |
                    v
Webhooks --> Netlify Function --> DB/Queue (Update Status)
```

## Planned Endpoints

- POST /api/sumit/create-customer: Create SUMIT customer
- POST /api/sumit/attach-method: Attach payment method using token
- POST /api/sumit/create-recurring: Set up subscription
- POST /api/webhooks/sumit: Handle SUMIT events

## API Endpoints Details

### Create Customer

- Endpoint: POST /customers
- Payload: { name, email, phone, address, company }
- Response: { id, status }

### Attach Payment Method

- Endpoint: POST /payment-methods
- Payload: { customerId, token }
- Response: { pmId, last4, brand }

### Create Recurring Subscription

- Endpoint: POST /subscriptions
- Payload: { customerId, pmId, plan: { price, interval, trialDays: 30 } }
- Response: { subId, status, nextBilling }

### Webhook Handler

- Endpoint: POST /webhooks/sumit
- Validates signature (if applicable)
- Handles events like payment_succeeded, subscription_canceled
- Updates local DB

## Environment Variables Inventory

| Variable                   | Description                    | Scope    | Example                 |
| -------------------------- | ------------------------------ | -------- | ----------------------- |
| SUMIT_API_KEY              | Private API key                | Backend  | (secret)                |
| SUMIT_API_URL              | API base URL                   | Backend  | https://api.sumit.co.il |
| SUMIT_ORGANIZATION_ID      | Org ID                         | Backend  | 144671822               |
| SUMIT_WEBHOOK_SECRET       | Webhook signing secret         | Backend  | (secret)                |
| VITE_SUMIT_PUBLISHABLE_KEY | Public key for SDK (if needed) | Frontend | (public)                |

## Data Mapping

- Spectra User -> SUMIT Customer (name, email, phone, address)
- Plan -> Recurring Item (price, interval: month)
- Trial: Set start_date = today + 30 days

## Trial Logic

- No initial charge
- Subscription starts after 30 days
- Send reminder 7 days before

## Expected Webhook Events

- payment_succeeded
- payment_failed
- subscription_created
- subscription_canceled
- invoice_paid
- invoice_failed

## Best Practices

- Never log sensitive data (PAN, CVC, full tokens)
- Use idempotency keys for API calls
- Implement retry logic for webhooks (exponential backoff)
- Monitor key expiration and rotate via CI/CD
- Use test mode/SUMIT sandbox for development

## Error Handling

- Client-side: Catch SDK errors, show user-friendly messages (e.g., "Invalid card details")
- Server-side: Log non-sensitive errors, return 500 with generic message
- Webhooks: Return 200 immediately, process async
- Common errors: 401 (invalid key), 400 (bad payload), 402 (payment failed)

## Testing Guide

- Unit tests for client wrapper
- Integration tests with SUMIT test cards
- End-to-end: Signup flow with mock webhooks
- Tools: Postman for API, ngrok for local webhooks

## Dev HTTPS Notes

Use mkcert for local certs and ngrok for public HTTPS testing of webhooks.

## Deployment Notes

- Deploy via Netlify: Ensure ENV vars set per branch (dev/preview/prod)
- Post-deploy: Test payment flow in preview URL
- Monitoring: Set up Netlify logs for function errors

## Testing Checklist

- [ ] Local HTTPS setup
- [ ] Create customer succeeds
- [ ] Tokenization works
- [ ] Subscription creation
- [ ] Webhook receipt and processing
- [ ] Error handling (invalid card, etc.)

## Risks

- Key expiration: Implement rotation
- Webhook reliability: Use idempotency
- Currency mismatch: Confirm USD/ILS handling

## Open Questions

1. Backend: Netlify Functions or Next.js API? [User input: ________]
2. Tokenization: Hosted Fields / Elements / SDK? Doc link? [User input: ________]
3. Currency: USD or ILS? [User input: ________]
4. Trial param: trial_period_days or start_date? [User input: ________]
5. Webhook signing: Header, algorithm? [User input: ________]
6. Event names/payloads? [User input: ________]
7. DB tables for subs/customers? [User input: ________]
8. Invoice fields/endpoint? [User input: ________]
9. Dunning policy? [User input: ________]
10. Keys rotation policy? [User input: ________]

## Integration Issues and Resolutions

### Issue 1: Payment Processing Failed - No og-token Generated

- **Description**: The SUMIT SDK initializes but fails to generate the og-token on form submit. Error shown: "Payment processing failed. Please try again." Latest console logs show: { formHasToken: false, tokenValue: 'missing', formId: 'payment-form', sumitInitialized: true }.
- **Root Cause**: BindFormSubmit likely failed silently (invalid key, timing, or compatibility). Form id is set but SDK not attaching hidden input.
- **Resolution Steps**:
  1. Add id="payment-form" to the <form> element in SignUpPage.tsx. (Done)
  2. Confirm VITE_SUMIT_PUBLISHABLE_KEY is set and loaded in import.meta.env.
  3. Ensure SDK script loads with defer and initialization runs after load.
  4. Check Network for calls to app.sumit.co.il - look for 4xx/5xx errors.
  5. Add more logging: console.log(OfficeGuy.Payments) after init to verify methods exist. Log any bind errors.
- **Status**: In Progress - Suspected bind failure; retest with object logging.

### Issue 2: 401 on /netlify/functions/me

- **Description**: Unauthorized error during checkout, but not directly related to payment.
- **Root Cause**: Missing auth token for the endpoint.
- **Resolution**: Disable call during payment flow if not needed. If needed, pass JWT/session.
- **Status**: Low priority - Doesn't block payment.

### Issue 3: Unexpected token 'export'

- **Description**: ESM parsing error in payments.js or related script.
- **Root Cause**: Script loaded without type="module".
- **Resolution**: Add type="module" to <script> tag or use UMD version if available.
- **Status**: To test after key fix.

## Changelog

- v1.0: Initial draft
- v1.1: Added API Details, Best Practices, Error Handling, Testing Guide, Deployment Notes
