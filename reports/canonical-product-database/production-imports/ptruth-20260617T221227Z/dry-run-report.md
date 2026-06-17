# Product Truth Production Import Dry Run

- Run ID: `ptruth-20260617T221227Z`
- Mode: `dry-run`
- Generated: `2026-06-17T22:12:29.775Z`
- Final status: `dry_run_clean_stop_for_approval`
- Production apply approved: `false`
- Stop before promote: `true`

## Database

- Host: `ep-aged-meadow-aa9ipcjv-pooler.westus3.azure.neon.tech`
- Database: `neondb`
- Snapshot reference: `neon://little-tooth-52181911/br-royal-mode-aaaint2z product-truth-schema-readiness-20260617T212449Z parent=br-withered-scene-aa3sri8w lsn=0/570EDA0`

## Artifact Counts

- Canonical: 32,739
- Sources: 32,937
- Aliases: 40,601

## Checksums

- canonical: `fe171f4714d553ffd7898859f9d736a80183be444f51b5e1b74673cf2e785a1f` (src/data/product-truth-canonical.json)
- sources: `2b2a8d50396bb1f246ca476da7810a4847d9f4edd0e37d21ff9e846f456617a3` (src/data/product-truth-sources.json)
- aliases: `30954e75fe2c7de633a81f9fbb0f63bfee646bfaf7c03de8a1d9977f0232793a` (src/data/product-truth-aliases.json)
- wellaDryRun: `3fa90f9d355933e32593ec11899a5545de90acfb2de803f5426d94146423a24d` (reports/catalog-classification/milestone-5/dry-run-wella-professionals.json)
- wellaRuleProof: `3f47d01a91b9cfd572c7a47e7ea349842f21ef7535d40f8b7516ddf6d0975966` (reports/catalog-classification/milestone-5/wella-rule-proof-report.json)

## Expected Live Changes

- Manufacturers to account for: 302
- Product lines to account for: 1,288
- Product families to account for: 5,245
- Canonical inputs: 32,739
- Source inputs: 32,937
- Alias inputs: 40,601
- Alias rejected before promote: 0
- Concentration tokens converted from identity aliases: 46

## Conflicts

- Blocking conflicts: 0
- Non-blocking conflicts: 27,602

## Staging Reconciliation

- canonicalRecordsAccountedFor: `32739`
- sourceRecordsAccountedFor: `32937`
- aliasRecordsAccountedFor: `40601`
- convertedConcentrationTokensAccountedFor: `46`
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
