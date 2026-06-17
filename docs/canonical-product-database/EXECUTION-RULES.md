# Canonical Product Database — Execution Rules

This document captures the mandatory governance rules for the Canonical Product Database
implementation. All development in this domain must follow these rules regardless of the
implementation tool, developer, or milestone phase.

---

## Master Specification Rule

The plan file `canonical_database_eb7beee5.plan.md` is the master specification.

It is not a single implementation task. Work proceeds only through sequential autonomous
milestones, each with its own scope, tests, row-count verification, rollback point,
known limitations, and validation gate.

## Sequential Milestone Execution

```
Read milestone scope
→ inspect existing implementation
→ create implementation plan
→ implement only that milestone
→ run migrations where applicable
→ run automated tests
→ run production build
→ verify database and source counts
→ generate milestone report
→ create rollback point / commit
→ evaluate milestone gate
→ continue automatically to the next milestone when the gate passes
```

Do not begin the next milestone before completing the current validation gate.

## Non-Destructive Execution

Throughout all milestones:

- preserve all raw source records
- preserve legacy Spectra product IDs
- preserve import batch history
- preserve positive and negative mapping decisions
- never silently delete canonical products
- never silently merge uncertain products
- never overwrite manual mappings with automated matches
- never collapse different package sizes into one SKU
- never merge retail and professional variants automatically
- never merge cross-brand tonal equivalents into one canonical product
- never treat inferred information as officially verified
- never use stale external information without recording its date and source

## Milestone Commit Naming

```
milestone-0-execution-rules
milestone-1-db-foundation
milestone-2-legacy-product-import
milestone-3-product-pages-shell
milestone-4-resolution-workflows
milestone-5-canonicalization-engine
milestone-6-manufacturer-registry
milestone-7-color-ontology
milestone-8-usage-resolution
```

## Milestone Report Location

After every milestone, create JSON and Markdown reports in:

```
reports/canonical-product-database/milestones/
```

## Database Runtime Rule

All production runtime data for `/admin/product-database` and `/admin/product-resolution`
must live in the database. Static JSON artifacts are allowed only for preprocessing,
diagnostics, tests, import preparation, version comparison, and research artifacts.

## Infrastructure Conventions

- Database: Neon (Postgres) via `@neondatabase/serverless`
- Environment variable: `NEON_DATABASE_URL`
- Primary key convention: `TEXT DEFAULT gen_random_uuid()::text`
- Timestamps: `TIMESTAMPTZ DEFAULT now()`
- Soft deletion: `active BOOLEAN` or `status TEXT` field
- Revisions: `revision INTEGER DEFAULT 1` for optimistic concurrency
- JSONB: used for raw payloads and structured metadata
- Migrations: numbered SQL files in `migrations/` (next: `020_*`)
- Netlify functions: CommonJS (`require`, `exports.handler`)
- TypeScript contracts: `src/lib/types/productTruth.ts` and `src/lib/types/canonicalDb.ts`

---

*Last updated: 2026-06-17 — Milestone 0 complete*
