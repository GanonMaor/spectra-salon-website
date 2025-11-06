## Smoke Test (DB → API → Email → Payment → Webhook → DB)

Command:

```
npm run audit:smoke
```

What it does:
- Calls `/.netlify/functions/health` and `/.netlify/functions/env-check`
- Creates a lead via `/.netlify/functions/leads` (validates DB insert path)
- Sends an authenticated email via `/.netlify/functions/send-email` (Resend dev fallback OK)
- Notes payment as N/A (no provider yet) and warns if `X-Frame-Options: DENY` blocks iframes

Config:
- `BASE_URL` (default `http://localhost:8888`) to target Netlify dev
- `JWT_SECRET` used to mint an admin token for the email step

Exit Codes:
- 0 on success; 1 on failure


