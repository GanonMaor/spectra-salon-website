# Legacy Inventory Backfill — Dry-Run Report

Run ID: `backfill-20260709T185741Z`
Generated: 2026-07-09T18:57:42.403Z
Mode: **read-only** (never writes salon_inventory_products)

## Safety
- salon_inventory_products before: 0
- salon_inventory_products after: 0
- unchanged: **YES**

## Source Inventory Summary
| Metric | Count |
| --- | --- |
| Total legacy rows | 16 |
| With salon_id | 16 |
| With brand | 16 |
| With product line | 16 |
| With barcode | 0 |
| With shade/name | 16 |
| Non-active | 0 |

### Rows by salon
| salon_id | rows | with barcode |
| --- | --- | --- |
| salon-look | 16 | 0 |

## Matching Results
| Outcome | Count |
| --- | --- |
| Total analyzed | 16 |
| Would auto-migrate (high, single) | 0 |
| Need review (medium+low) | 2 |
| Ambiguous | 0 |
| Unmatched | 14 |
| Skipped | 0 |

### By review bucket
```json
{
  "unmatched": 14,
  "review_low": 2
}
```
### By match method
```json
{
  "none": 14,
  "weak_fuzzy_match": 2
}
```
### Top reasons
```json
[
  [
    "no_candidate_in_brand",
    14
  ],
  [
    "weak_fuzzy_only",
    2
  ]
]
```

## Barcode Gap
- Legacy rows carrying a barcode: 0
- catalog_product_barcodes is empty, so Tier 1 barcode matching cannot fire. Tier 2 falls back to catalog_product_sources.raw_barcode. Legacy rows without a barcode rely entirely on brand+line+shade / name matching.

## Examples per bucket
### unmatched
```json
[
  {
    "legacy_id": "ip01",
    "salon_id": "salon-look",
    "legacy": "Loreal Profesional / Dia Richesse / 1.0 (Dia Richesse 1.0)",
    "method": null,
    "confidence": "none",
    "score": null,
    "matched_product_id": null,
    "reason": "no_candidate_in_brand"
  },
  {
    "legacy_id": "ip02",
    "salon_id": "salon-look",
    "legacy": "Loreal Profesional / Dia Richesse / 1.1 (Dia Richesse 1.1)",
    "method": null,
    "confidence": "none",
    "score": null,
    "matched_product_id": null,
    "reason": "no_candidate_in_brand"
  },
  {
    "legacy_id": "ip03",
    "salon_id": "salon-look",
    "legacy": "Loreal Profesional / Dia Richesse / 1.2 (Dia Richesse 1.2)",
    "method": null,
    "confidence": "none",
    "score": null,
    "matched_product_id": null,
    "reason": "no_candidate_in_brand"
  },
  {
    "legacy_id": "ip04",
    "salon_id": "salon-look",
    "legacy": "Loreal Profesional / Dia Richesse / 1.3 (Dia Richesse 1.3)",
    "method": null,
    "confidence": "none",
    "score": null,
    "matched_product_id": null,
    "reason": "no_candidate_in_brand"
  },
  {
    "legacy_id": "ip05",
    "salon_id": "salon-look",
    "legacy": "Loreal Profesional / Dia Richesse / 1.4 (Dia Richesse 1.4)",
    "method": null,
    "confidence": "none",
    "score": null,
    "matched_product_id": null,
    "reason": "no_candidate_in_brand"
  }
]
```
### review_low
```json
[
  {
    "legacy_id": "ip15",
    "salon_id": "salon-look",
    "legacy": "Loreal Profesional / Bleach & Developers / dev-20 (20 Vol Developer)",
    "method": "weak_fuzzy_match",
    "confidence": "low",
    "score": 0.3275862,
    "matched_product_id": "LONDA PROFESSIONAL::EXTRA RICH DEVELOPERS::6pct::developer_oxidant",
    "reason": "weak_fuzzy_only"
  },
  {
    "legacy_id": "ip16",
    "salon_id": "salon-look",
    "legacy": "Loreal Profesional / Bleach & Developers / dev-30 (30 Vol Developer)",
    "method": "weak_fuzzy_match",
    "confidence": "low",
    "score": 0.3275862,
    "matched_product_id": "LONDA PROFESSIONAL::EXTRA RICH DEVELOPERS::9pct::developer_oxidant",
    "reason": "weak_fuzzy_only"
  }
]
```

