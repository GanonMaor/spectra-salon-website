# TRUSS Israel barcode catalog import

Source PDF: `source/barcode-catalog-1.pdf` (128 product pages).

## Commands

```bash
npm run truss:extract      # text + QR/EAN from every page
npm run truss:validate     # EAN checks, duplicates, seed-47 matching
npm run truss:enrich       # official TRUSS website enrichment only
npm run truss:images       # download official packshots
npm run truss:build        # normalized JSON/CSV + quality report
npm run truss:import       # Neon dry-run
CONFIRM_TRUSS_CATALOG_IMPORT=true npm run truss:import:apply

# Full pipeline
npm run truss:pipeline
# Offline (no enrich/images)
npm run truss:pipeline:offline
```

## Identity rules

1. Exact EAN (QR-decoded, check-digit valid)
2. Exact TRS supplier SKU
3. Official product id (when present)
4. Fallback: brand + line + name + size + shade (never name-only)

Invalid EANs are never imported as `approved`.

## Existing 47 seed SKUs

Matched only on strong identifiers. Unmatched rows are classified `needs_review` and never deleted.
