## Repository Map

**Frameworks**: React (Vite SPA) + Netlify Functions (Node 18)

- **Package manager**: npm (package-lock.json present)
- **Runtime**: Node 18 (Netlify); Target: Web
- **Database**: PostgreSQL (Neon) via `pg`; raw SQL migrations under `migrations/`
- **Email**: Resend API via `/.netlify/functions/send-email`
- **Payments**: None integrated (pipeline has a "Payment Pending" stage only)
- **Analytics**: Google Tag Manager (toggle via `VITE_ENABLE_GTM`)
- **CI/CD**: Netlify (`netlify.toml`) – build with Vite, publish `dist/`

### Top-level Structure

```
/ (root)
  netlify.toml               # Build, dev proxy, headers
  index.html                 # Vite entry (loads src/index.tsx)
  src/                       # React app (routes, screens, components)
  netlify/functions/         # Serverless functions (Node 18)
  migrations/                # SQL migrations (raw SQL)
  scripts/                   # Utility & DB scripts
  docs/                      # Project docs (this audit lives here)
  dist/                      # Production build output
```

### Client Entry Points

- `index.html` → `src/index.tsx` (React Router)
  - Routes include `/`, `/lead-capture`, `/ugc-offer`, `/login`, `/signup`, `/profile`, `/admin` (guarded), etc.
  - `src/utils/performanceMonitor` used for simple timing logs.

### Serverless Entry Points (Netlify Functions)

- `/.netlify/functions/auth` – signup, login, me, forgot-password (JWT-based)
- `/.netlify/functions/leads` – GET (admin-only) + POST (create lead + optional webhook)
- `/.netlify/functions/send-email` – admin-only email send via Resend
- `/.netlify/functions/health` and `env-check` – DB/env checks
- `/.netlify/functions/pipeline` – pipeline CRUD, mock fallback if DB missing

All functions connect using `process.env.DATABASE_URL` or `NEON_DATABASE_URL` with TLS and `pg`.

### Data Flow Overview

1) User submits lead form (SPA) → `/.netlify/functions/leads` (POST)
2) Function inserts into `public.leads` (Postgres) and optionally posts a webhook to `UGC_OFFER_WEBHOOK_URL`/`LEADS_WEBHOOK_URL`.
3) Admin authenticates via `/.netlify/functions/auth` (JWT), views lists/summary in admin routes.
4) Admin can trigger emails via `/.netlify/functions/send-email` (Resend) using Bearer JWT.
5) Pipeline UI calls `/.netlify/functions/pipeline` for CRUD; falls back to mock data if DB unavailable.

### External Services

- Postgres (Neon) – `pg` client
- Resend Email – `RESEND_API_KEY` required for live sends; dev-mode logs only
- Webhooks – Optional outbound POST (no signature verification implemented)
- GTM – Enabled via `localStorage['VITE_ENABLE_GTM']` or env

### Headers & Security

- `netlify.toml` sets:
  - `X-Frame-Options: DENY` (blocks all iframes; payment iframes would be blocked)
  - Caching for assets; no `Content-Security-Policy` defined yet

### Migrations

- `migrations/*.sql` including `01_leads.sql` and others. No ORM; raw SQL used in functions.
  - Provide `scripts/db/verify-migrations.js` (added in this audit) to dry-run in a transaction.

### Service Diagram (Simplified)

```
SPA (Vite) ──> Netlify Functions (Node 18) ──> Postgres (Neon)
                         │
                         ├──> Resend (Email)
                         └──> Outbound Webhook (no signature)
```


