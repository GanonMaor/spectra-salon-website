## Integration Checklist (PASS/FAIL)

- Database (PostgreSQL / Neon)
  - Status: PENDING (run smoke test and health checks)
  - Connection: via `DATABASE_URL` or `NEON_DATABASE_URL` with TLS
  - Actions:
    - `npm run audit:check-env` (verify env keys)
    - `npm run audit:verify-migrations` (dry-run)
    - Call `/.netlify/functions/health` and `/.netlify/functions/env-check`

- Email (Resend API)
  - Status: PARTIAL (dev fallback works without key)
  - Keys: `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_FROM_NAME`, `EMAIL_REPLY_TO` (opt)
  - Notes: Without `RESEND_API_KEY`, emails are logged as dev-mode success
  - Action: `npm run audit:smoke` covers an authenticated send

- Payments (iframe)
  - Status: FAIL (no payment provider integrated)
  - CSP: No `Content-Security-Policy`; `X-Frame-Options: DENY` blocks iframes
  - Action: Choose provider (e.g., Stripe) and update CSP/frame headers; implement

- Auth / Session
  - Status: PARTIAL
  - JWT Bearer used; cookies not used
  - Password reset: token generated but not emailed; admin email sender exists
  - CSRF: Not applicable to Bearer-only flows; ensure no cookie-based auth

- Webhooks
  - Status: FAIL (no signature verification or idempotency)
  - Lead webhook posts to URL if configured; no HMAC verification
  - Action: Add signature validation (HMAC) and idempotency keys, retry/backoff

- Analytics / Telemetry
  - Status: PARTIAL
  - GTM available, toggled via `VITE_ENABLE_GTM`
  - Action: Add GA/GTM env gating and dataLayer safety checks

Run the end-to-end smoke test:

```
npm run audit:smoke
```

This validates: API → DB lead insert → (optional) webhook → authenticated email send (Resend dev fallback OK).


