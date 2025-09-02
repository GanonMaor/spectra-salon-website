# Open Questions - Must Be Answered Before Gate C

These questions must be resolved before implementing API endpoints (Gate C):

## 1. SUMIT Webhook Authentication

**Question:** How should we authenticate SUMIT webhooks?

**Options:**

- **A) Signature verification:** SUMIT signs requests with HMAC-SHA256
- **B) Token-based:** Simple `?token=SECRET` in webhook URL
- **C) IP allowlisting:** Only accept from SUMIT IP ranges

**Required Information:**

- Does SUMIT support webhook signing?
- If yes, what header name? (e.g., `X-Sumit-Signature`, `X-Hub-Signature`)
- What environment variable should store the secret? (e.g., `SUMIT_WEBHOOK_SECRET`)
- What's the signing algorithm? (typically `HMAC-SHA256`)

**Implementation Impact:**

```typescript
// Option A (preferred - secure)
const signature = request.headers["x-sumit-signature"];
const payload = request.body;
const expected = crypto
  .createHmac("sha256", process.env.SUMIT_WEBHOOK_SECRET)
  .update(payload)
  .digest("hex");

// Option B (simpler - less secure)
const token = request.query.token;
if (token !== process.env.SUMIT_WEBHOOK_TOKEN) return 401;
```

**Decision Needed:** Which method does SUMIT support?

---

## 2. Backend Runtime Confirmation

**Question:** Confirm backend implementation approach?

**Current Assumption:** Netlify Functions (based on existing `netlify/functions/` directory)

**Required Confirmation:**

- Are we using **Netlify Functions** exclusively?
- Should new endpoints be:
  - `netlify/functions/lead-track.js`
  - `netlify/functions/sumit-webhook.js`
- Or different runtime? (Next.js API routes, Express server, etc.)

**Implementation Impact:**

```typescript
// Netlify Functions format
exports.handler = async (event, context) => {
  const { httpMethod, body, queryStringParameters } = event;
  // ... logic
  return { statusCode: 200, body: JSON.stringify(result) };
};

// vs Next.js API routes
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // ... logic
  res.status(200).json(result);
}
```

**Decision Needed:** Confirm Netlify Functions as the target runtime.

---

## 3. Lead Retention Policy

**Question:** How long should we keep abandoned leads?

**Business Impact:**

- **Storage:** Abandoned leads accumulate over time
- **Privacy:** GDPR compliance for unused PII
- **Analytics:** Need historical data for conversion analysis

**Options:**

- **A) No deletion:** Keep all leads forever
- **B) 90-day cleanup:** Delete leads that haven't progressed past stage 1
- **C) 180-day cleanup:** Longer retention for seasonal patterns
- **D) Stage-based:** Different retention by funnel stage

**Implementation Example:**

```sql
-- Option B: 90-day cleanup
DELETE FROM leads_new
WHERE stage = 'cta_clicked'
  AND cta_clicked_at < now() - interval '90 days'
  AND email IS NULL; -- No PII collected
```

**Decision Needed:** What's the business requirement for lead data retention?

---

## 4. Session Tracking Strategy

**Question:** How should we handle anonymous lead tracking?

**Current Approach:** `session_id` field for anonymous tracking before email collection

**Required Clarification:**

- Should we generate session IDs client-side (UUID) or server-side?
- How long should sessions persist? (browser session vs 30 days)
- Should we use first-party cookies or localStorage?

**Implementation Impact:**

```typescript
// Client-side tracking
const sessionId = localStorage.getItem("lead_session") || crypto.randomUUID();

// Server-side tracking
const sessionId = headers["x-session-id"] || generateSessionId();
```

**Decision Needed:** Client-side or server-side session management preference?

---

## 5. SUMIT Integration Scope

**Question:** Which SUMIT events should trigger subscriber creation?

**Webhook Events (typical):**

- `customer.created` - New customer in SUMIT
- `payment_method.attached` - Payment method added
- `subscription.created` - Recurring subscription started
- `payment.succeeded` - Successful payment processed
- `subscription.cancelled` - Subscription cancelled

**Required Information:**

- What specific event indicates "subscription completed"?
- Should we create subscriber records on first payment or subscription setup?
- What metadata does SUMIT include to link back to leads?

**Implementation Impact:**

```typescript
// Different trigger points
switch (webhookPayload.event_type) {
  case "payment_method.attached":
    // Create subscriber immediately when payment method added?
    break;
  case "subscription.created":
    // Or wait for actual subscription creation?
    break;
  case "payment.succeeded":
    // Or only after first successful payment?
    break;
}
```

**Decision Needed:** What event marks a successful lead → subscriber conversion?

---

## 6. Error Handling & Monitoring

**Question:** What level of error tracking is needed?

**Options:**

- **A) Console logging only** (basic)
- **B) Error tracking service** (Sentry, LogRocket)
- **C) Database error logs** (custom table)
- **D) Netlify function logs** (built-in)

**Impact on Implementation:**

- Error handling complexity
- Debugging capabilities
- Production monitoring

**Decision Needed:** What error tracking/monitoring requirements exist?

---

## 7. Rate Limiting & Security

**Question:** Should we implement rate limiting on lead tracking?

**Considerations:**

- **Abuse prevention:** Prevent spam CTA clicks
- **Performance:** Protect database from overload
- **User experience:** Don't block legitimate users

**Implementation Options:**

```typescript
// Per IP rate limiting
const attempts = await getRateLimitCount(clientIP);
if (attempts > 10) return 429; // Too Many Requests

// Per session rate limiting
const sessionAttempts = await getSessionAttempts(sessionId);
if (sessionAttempts > 5) return 429;
```

**Decision Needed:** What rate limiting is appropriate for lead tracking endpoints?

---

## Answers Needed Before Gate C

Please provide answers to:

1. **SUMIT webhook authentication method** (signature vs token)
2. **Confirmed backend runtime** (Netlify Functions vs other)
3. **Lead retention policy** (90 days? 180 days? No deletion?)
4. **Session tracking preference** (client-side vs server-side)
5. **SUMIT conversion event** (which webhook event creates subscribers)
6. **Error tracking approach** (logs only vs service integration)
7. **Rate limiting requirements** (needed? what limits?)

## Next Steps

Once these questions are answered:

1. Implement `netlify/functions/lead-track.js`
2. Implement `netlify/functions/sumit-webhook.js`
3. Add frontend lead tracking hooks
4. Test end-to-end funnel progression
5. Update Overview dashboard with real data

**Estimated Gate C timeline:** 2-3 days after questions answered
