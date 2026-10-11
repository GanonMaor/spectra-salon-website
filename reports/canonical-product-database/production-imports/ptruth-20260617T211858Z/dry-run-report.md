# Product Truth Production Import Dry Run

- Run ID: `ptruth-20260617T211858Z`
- Mode: `dry-run`
- Generated: `2026-06-17T21:19:02.199Z`
- Final status: `dry_run_blocked`
- Production apply approved: `false`
- Stop before promote: `true`

## Database

- Host: `ep-aged-meadow-aa9ipcjv-pooler.westus3.azure.neon.tech`
- Database: `neondb`
- Snapshot reference: `not provided`

## Artifact Counts

- Canonical: 32,739
- Sources: 32,937
- Aliases: 40,647

## Checksums

- canonical: `c4ae86882111f2c88549488892ad0f69d6686b8567e8f4f8ef58d7cbd48b1d54` (src/data/product-truth-canonical.json)
- sources: `2b2a8d50396bb1f246ca476da7810a4847d9f4edd0e37d21ff9e846f456617a3` (src/data/product-truth-sources.json)
- aliases: `5ae862027ef6dc808b760b0b34c19cda0b4aad165a36d55f54bdab4bade008b9` (src/data/product-truth-aliases.json)
- wellaDryRun: `3fa90f9d355933e32593ec11899a5545de90acfb2de803f5426d94146423a24d` (reports/catalog-classification/milestone-5/dry-run-wella-professionals.json)
- wellaRuleProof: `3f47d01a91b9cfd572c7a47e7ea349842f21ef7535d40f8b7516ddf6d0975966` (reports/catalog-classification/milestone-5/wella-rule-proof-report.json)

## Expected Live Changes

- Manufacturers to account for: 302
- Product lines to account for: 1,288
- Product families to account for: 5,245
- Canonical inputs: 32,739
- Source inputs: 32,937
- Alias inputs: 40,647
- Alias rejected before promote: 0

## Conflicts

- Blocking conflicts: 2
- Non-blocking conflicts: 27,605

### Blocking Samples
- `missing_required_tables`: {"type":"missing_required_tables","tables":["product_truth_import_runs","product_truth_import_chunks","staging_product_truth_canonical","staging_product_truth_sources","staging_product_truth_aliases","product_truth_import_id_mappings"]}
- `missing_required_columns`: {"type":"missing_required_columns","columns":{"canonical_products":["shade_code_raw","shade_code_normalized","classification_confidence","classification_status","classification_rules_version","classification_evidence","tonal_profile","shade_bearing","tonal_classification_eligible","metadata","import_run_id","published_at"],"product_aliases":["import_run_id","published_at"],"product_identity_mappings":["import_run_id","published_at"]}}

## Staging Reconciliation

- canonicalRecordsAccountedFor: `32739`
- sourceRecordsAccountedFor: `32937`
- aliasRecordsAccountedFor: `40647`
- zeroOrphanSourceRecords: `true`
- zeroOrphanAliases: `true`
- zeroDuplicateActiveAssignments: `true`
- zeroUnsafeGlobalNumericAliases: `true`
- allHierarchyReferencesResolvable: `true`
- wellaRulesVersion110PreservedWhereLinked: `224`
- permanentColorShadeBearing: `true`
- crossBrandTonalNotPromotedAsSkuMerge: `true`

## Required Next Step

Stop here. Review this dry-run packet and approve explicitly before any `--promote` or live-table write.
