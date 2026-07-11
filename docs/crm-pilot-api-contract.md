# CRM Pilot API Contract

Phase 3 contract for Customers, Staff, and Appointments APIs. Keep all pilot endpoints consistent with this page before implementation.

## Response Envelopes
Success responses:

```json
{ "ok": true, "data": {}, "meta": {} }
```

Error responses:

```json
{ "ok": false, "error": { "code": "VALIDATION_ERROR", "message": "Human readable message", "details": {} } }
```

Use `data` for the canonical resource returned by the server. Use `meta` only for pagination, counts, or request context.

## Status Codes
- `200`: read/update success.
- `201`: create success.
- `204`: archive/delete success with no body.
- `400`: validation error or malformed JSON.
- `401`: missing, expired, malformed, or invalid session token.
- `403`: valid token but forbidden role/action.
- `404`: record not found inside the authenticated tenant.
- `409`: conflict, duplicate, or invalid state transition.
- `500`: unexpected server error.

## Naming And Mapping
DB columns remain `snake_case`; API responses and request bodies use `camelCase`.

Examples: `salon_id -> salonId`, `staff_member_id -> staffMemberId`, `customer_id -> customerId`, `appointment_id -> appointmentId`, `service_id -> serviceId`, `start_time -> startTime`, `end_time -> endTime`.

Never return raw DB rows from pilot endpoints.

## Tenant Rules
Every pilot endpoint must call `resolveSalonContext(event)` and use the returned `salonId` for every read, create, update, delete, and ownership check. The client must never send `salonId`, `salon_id`, or `x-salon-id`.

Cross-tenant IDs must return `404`, not leaked data and not a distinguishable ownership error.

## Soft Delete Rules
- Customers: set `status = 'archived'`.
- Staff: set `status = 'inactive'`.
- Services/departments/categories: set `status = 'archived'`.
- Appointments: prefer `status = 'cancelled'` unless the endpoint is explicitly destructive.

Default list endpoints should exclude archived/inactive records unless explicitly requested.

## Appointment Transactions
Appointment create/update with segments must run in one DB transaction.

Required order:

1. Verify all referenced customer, staff, service, and appointment IDs belong to `salonId`.
2. Insert/update `salon_appointments` scoped by `salon_id`.
3. For segment replacement, delete old segments using both `appointment_id` and `salon_id`.
4. Insert all `salon_appointment_segments` with the same `salon_id`.
5. Commit only after all writes succeed; rollback on any failure.

No orphan segments and no cross-tenant segment updates are allowed.
