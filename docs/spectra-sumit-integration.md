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

## Dev HTTPS Notes

Use mkcert for local certs and ngrok for public HTTPS testing of webhooks.

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

1. Backend: Netlify Functions or Next.js API?
2. Tokenization: Hosted Fields / Elements / SDK? Doc link?
3. Currency: USD or ILS?
4. Trial param: trial_period_days or start_date?
5. Webhook signing: Header, algorithm?
6. Event names/payloads?
7. DB tables for subs/customers?
8. Invoice fields/endpoint?
9. Dunning policy?
10. Keys rotation policy?

## Changelog

- v1.0: Initial draft
