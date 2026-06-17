# Milestone 4: Transactional Resolution Workflows — Completion Report

**Status:** Complete  
**Completed:** 2026-06-17  
**Scope:** End-to-end transactional write workflows for all 9 product resolution actions.

---

## What Was Built

### Backend: `netlify/functions/product-resolution-actions.js`

A single Netlify function with 18 allowlisted actions (9 preview + 9 write):

| Action | Permission Required |
|--------|-------------------|
| `detach` / `detach-preview` | `product_database_edit` |
| `reassign` / `reassign-preview` | `product_database_edit` |
| `make-independent` / `make-independent-preview` | `product_database_edit` |
| `approve-alias` / `approve-alias-preview` | `product_database_edit` |
| `keep-separate` / `keep-separate-preview` | `product_database_validate` |
| `reject-match` / `reject-match-preview` | `product_database_validate` |
| `merge` / `merge-preview` | `product_database_merge` |
| `unmerge` / `unmerge-preview` | `product_database_merge` |
| `undo` / `undo-preview` | `product_database_admin` |

**Auth:** JWT Bearer token verified server-side using `JWT_SECRET`. Frontend-supplied role/permissions fields are completely ignored. Dev fallback via `X-Access-Code` (refused in production).

**Transactions:** All write actions use `pg.Client` with `BEGIN/COMMIT/ROLLBACK`. Any mid-transaction failure rolls back atomically.

**Revision checks:** HTTP 409 is returned on stale `expectedRevision` values, preventing lost-update conflicts.

---

### Database Schema: `migrations/022_product_resolution_workflows.sql`

Added columns (all `IF NOT EXISTS`, safe to re-run):

- `canonical_products.merged_into_id` — points to surviving product after merge
- `usage_product_resolutions.reprocessing_required` — flagged after source is reassigned/merged  
- `usage_product_resolutions.previous_canonical_product_id` — preserved for audit
- `product_identity_mappings.superseded_by_mapping_id` — tracks mapping chains
- `product_identity_mappings.deactivated_at` / `deactivation_reason`
- `catalog_product_sources.assignment_active` / `detached_at` / `detached_reason`
- `product_review_items.created_by_action_id` / `resolved_by_action_id`
- `product_merge_history.action_id` (unique, for undo lookup) / `status`

---

### TypeScript Types: `src/lib/types/resolutionActions.ts`

Full request/response contracts for all 18 actions plus the `ActionModalState` type for UI state machine.

### Client Methods: `canonicalProductDbClient.ts`

- `previewResolutionAction(params, token?)` — read-only preview call  
- `executeResolutionAction(params, token?)` — transactional write call

---

### UI: `ActionModal.tsx` + `ProductDatabasePage.tsx`

Replaced 3 `alert()` placeholder buttons with a real multi-phase modal:

```
Select action → load impact preview → show comparison/warnings/blockers
→ require reason → submit with expected revisions
→ show success / conflict (409) / failure summary
→ refresh affected row only (no full-list reload)
```

---

### Integration Tests: `migrations/__tests__/product-resolution-integration.test.ts`

21 tests covering:
- Detach: preserves raw source, removes active mapping, marks usage stale  
- Reassign: moves source, preserves history, rejects stale revision  
- Make Independent: creates canonical SKU, preserves source, creates review items  
- Merge: succeeds for same-type products, blocks same-product merge  
- Unmerge: restores safe state, detects divergence  
- Alias approval: idempotent on duplicate  
- Negative decisions: keep-separate + reject-match persist negative mappings  
- Permissions: rejects unauthenticated requests, ignores frontend-supplied roles  
- End-to-end: source → canonical → usage → detach → cascaded usage update → audit log

Run with:
```bash
TEST_DATABASE_URL=postgresql://... npx jest --config jest.integration.config.js
```

---

## Validation Gates

| Gate | Result |
|------|--------|
| Existing unit tests (31) | ✅ PASS |
| Integration tests without TEST_DATABASE_URL | ✅ Correctly SKIPPED (safety guard active) |
| Production build (`npm run build`) | ✅ PASS — exit code 0 |
| TypeScript — edited files | ✅ 0 new errors |
| Live integration tests against test DB | 🔲 BLOCKED — requires `TEST_DATABASE_URL` provisioning |

---

## Non-Destructive Guarantees

- All source records are preserved; `canonical_product_id` is set to NULL on detach, not deleted
- Merged products are marked `active=false, merged_into_id=<surviving>`, never deleted
- `product_merge_history.rollback_data` stores the complete snapshot for unmerge
- Negative decisions (`keep_separate`, `rejected_match`) survive re-import via `ON CONFLICT DO NOTHING`
- `product_audit_logs` written for every write action with before/after state
