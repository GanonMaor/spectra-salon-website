# Marketing automations — production wiring

The `/crm/marketing` screen is a local mock. Every rule the owner sees is
implemented in a pure engine (`engine.ts`) with an injected clock, id factory and
provider, so the same logic can move to a backend worker unchanged. Nothing in
this module sends a real SMS.

## What is mocked today

| Concern | Mock | Production replacement |
| --- | --- | --- |
| State | `localStorage` via `repository.ts`, scoped by salon + user | Database tables below |
| Scheduling | `runUntil` / `processNow` on a simulated or real clock in the browser | Durable job queue + worker |
| SMS provider | `ctx.provider()` returns scripted outcomes | Provider API + delivery webhooks |
| Consent | `unknown` for every CRM customer | Consent records captured at booking / profile |
| Roles | Owner → owner, manager → editor | Explicit marketing permissions per staff member |
| Demo world | `demoSeed.ts` + `/crm/marketing/dev` (dev builds only) | Not shipped |

## Data model

- `marketing_settings` (salon_id PK): sender name, timezone, languages, marketing
  window, frequency cap days, monthly budget, alert percent, max attempts,
  provider connection reference (credentials live in a secrets store, not here).
- `marketing_automations` (salon_id, kind): `enabled`, `published_version_id`,
  `draft_version_id`.
- `marketing_automation_versions` (id, salon_id, kind, version, timing JSON,
  bodies JSON per language, service overrides JSON, created_by, published_by,
  published_at). Published versions are immutable.
- `marketing_messages` (id, salon_id, dedupe_key UNIQUE per salon, automation,
  category, customer_id, appointment_id, service_ids, status, reason,
  planned_for, scheduled_for, snapshot JSON, sent_body, sent_version, language,
  segments, estimated_cost, actual_cost, timestamps).
- `marketing_delivery_attempts` (message_id, number, at, outcome,
  provider_message_id, reconciled_as, reconciled_at).
- `customer_consents` (customer_id, channel `sms`, purpose
  `transactional|marketing`, status, source, recorded_at). A missing row is
  "unknown", never marketing consent.
- `marketing_audit_events` (salon_id, actor_id, action, target, detail, at).

## Scheduling and sending

1. CRM appointment events (`booked`, `rescheduled`, `cancelled`, `completed`,
   `no_show`) call `handleAppointmentEvent` inside the same transaction that
   writes the appointment, or through an outbox consumer.
2. `dedupe_key` (`confirm:<appt>`, `reminder:<appt>:<start>`,
   `rescheduled:<appt>:<start>`, `cancelled:<appt>`, `rebook:<appt>:<service>`)
   is a unique constraint, so replays never duplicate messages.
3. A worker claims due rows (`scheduled|deferred` and `scheduled_for <= now`)
   with `SELECT … FOR UPDATE SKIP LOCKED` and runs the engine's `evaluate`
   again right before sending: SMS connection, automation enabled, service
   included, phone, consent, appointment relevance, required variables, then
   marketing window, frequency cap and budget for marketing messages only.
4. The rendered text, version, language, segments and cost are frozen on the
   message at the moment the provider accepts it. Publishing never changes a
   sent body.
5. Retries (5 / 15 / 45 minutes, up to `max_attempts`) stay on the same row.

## Provider reconciliation

- A timeout is stored as `unknown`, never as failed, and is never resent
  immediately. A reconciliation job queries the provider by
  `provider_message_id` after 15 minutes; only a confirmed "not received"
  schedules a retry of the same message.
- Delivery webhooks update `delivered` / `failed` and `actual_cost`. Verify the
  webhook signature and make the handler idempotent on `provider_message_id`.
- Inbound replies are out of scope; STOP keywords from the provider should still
  write a `revoked` consent row.

## Publishing

`saveDraft` writes a draft version; `publish` promotes it, then
`applyPublishedVersion` re-times and re-previews pending messages of that kind
in one transaction. Turning an automation off cancels pending messages with
reason `automation_disabled`; turning the reminder back on revives them.

## Permissions and audit

Separate permissions: view, edit drafts, publish, toggle, manage settings, send
tests, cancel messages. Every mutation writes `marketing_audit_events` with the
acting user. The UI already hides actions the role cannot perform; the API must
enforce the same checks.

## Compliance

- Marketing messages require explicit marketing consent and always carry an
  opt-out link (`unsubscribe_link`), which must resolve to a public endpoint that
  writes a `revoked` consent row.
- Transactional messages ignore marketing limits but respect a transactional
  opt-out.
- Keep audit and consent history for the retention period required by local
  law (Israeli Communications Law, amendment 40, for marketing SMS).

## Owner-facing screen

The production screen shows only: three numbers (sent, scheduled, actual cost),
the five automations with toggle + edit, one action-required row, message
history, and settings. Demo data, the simulated clock, provider outcomes and
role switching stay on the dev route and must not ship to salons.
