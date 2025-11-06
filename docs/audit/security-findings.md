## Security Findings

- Missing Content Security Policy
  - Severity: High
  - PoC: No `Content-Security-Policy` header; only `X-Frame-Options: DENY`
  - Fix: Add CSP with `default-src 'self'`, strict `script-src`, `style-src`, and allowlisted `frame-src` for payment if needed

- Webhook Signature Verification Absent
  - Severity: High
  - PoC: `netlify/functions/leads.js` posts to external webhook without signature or idempotency
  - Fix: Add HMAC signature header using shared secret; store processed ids for idempotency

- Broad CORS
  - Severity: Medium
  - PoC: Functions commonly set `Access-Control-Allow-Origin: *`
  - Fix: Restrict to known origins for authenticated endpoints; keep `*` for public GET if needed

- Password Reset Flow Not Completing
  - Severity: Medium
  - PoC: Reset token is printed/logged but not emailed; risk of user confusion and support friction
  - Fix: Use `send-email` function with a template; limit token TTL and one-time use

- JWT Secret Management
  - Severity: Medium
  - PoC: Relies on `JWT_SECRET`; no key rotation strategy documented
  - Fix: Document rotation, add `kid` if rotating, reduce TTLs for higher-risk actions

- Dependencies Audit Pending
  - Severity: Info → Potential High
  - PoC: No recent `npm audit`/`npm outdated` report in repo
  - Fix: Run audit, plan upgrades; pin critical CVE fixes with safe diffs

References:
- `netlify/functions/leads.js`, `netlify/functions/auth.js`, `netlify/functions/send-email.js`, `netlify.toml`


