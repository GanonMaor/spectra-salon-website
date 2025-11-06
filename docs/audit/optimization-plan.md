## Optimization Plan

### Now (0–48h)
- Add CSP header and tighten security headers (PR: audit-security)
- Implement health scripts: env, CSP, migrations, smoke (PR: audit-infra)
- Restrict CORS for authenticated endpoints (PR: audit-api)

### Next (1–2 weeks)
- Webhook signature + idempotency (PR: audit-webhooks)
- Payment integration selection + CSP allowlist (PR: audit-payments)
- Lazy-load heavy admin routes/components (PR: audit-performance)

### Later (1–2 months)
- Introduce queue for webhooks with DLQ and retries (PR: audit-reliability)
- Consider SSR/SSG for marketing pages if needed (PR: audit-arch)

KPIs
- Security headers present; webhooks signed; smoke test green in CI
- P95 function latency < 400ms; main route bundle < 250KB gz

Rollback Strategy
- Each PR isolated by topic; revert via `git revert <merge-commit>` to rollback


