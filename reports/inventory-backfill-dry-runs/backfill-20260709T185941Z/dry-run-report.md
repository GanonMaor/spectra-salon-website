# Legacy Inventory Backfill — Dry-Run Report

Run ID: `backfill-20260709T185941Z`
Generated: 2026-07-09T18:59:42.467Z
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
| Would auto-migrate (high, single) | 5 |
| Need review (medium+low) | 11 |
| Ambiguous | 0 |
| Unmatched | 0 |
| Skipped | 0 |

### By review bucket
```json
{
  "review_low": 11,
  "auto_migrate": 5
}
```
### By match method
```json
{
  "weak_fuzzy_match": 11,
  "brand_line_shade_exact": 5
}
```
### Top reasons
```json
[
  [
    "weak_fuzzy_only",
    11
  ],
  [
    "brand_line_shade_exact",
    5
  ]
]
```

## Barcode Gap
- Legacy rows carrying a barcode: 0
- catalog_product_barcodes is empty, so Tier 1 barcode matching cannot fire. Tier 2 falls back to catalog_product_sources.raw_barcode. Legacy rows without a barcode rely entirely on brand+line+shade / name matching.

## Examples per bucket
### review_low
```json
[
  {
    "legacy_id": "ip01",
    "salon_id": "salon-look",
    "legacy": "Loreal Profesional / Dia Richesse / 1.0 (Dia Richesse 1.0)",
    "method": "weak_fuzzy_match",
    "confidence": "low",
    "score": 0.39473686,
    "matched_product_id": "L'OREAL PROFESSIONNEL::DIA RICHESSE::1::hair_color_shade",
    "reason": "weak_fuzzy_only"
  },
  {
    "legacy_id": "ip02",
    "salon_id": "salon-look",
    "legacy": "Loreal Profesional / Dia Richesse / 1.1 (Dia Richesse 1.1)",
    "method": "weak_fuzzy_match",
    "confidence": "low",
    "score": 0.41666666,
    "matched_product_id": "L'OREAL PROFESSIONNEL::DIA RICHESSE::1::hair_color_shade",
    "reason": "weak_fuzzy_only"
  },
  {
    "legacy_id": "ip03",
    "salon_id": "salon-look",
    "legacy": "Loreal Profesional / Dia Richesse / 1.2 (Dia Richesse 1.2)",
    "method": "weak_fuzzy_match",
    "confidence": "low",
    "score": 0.39473686,
    "matched_product_id": "L'OREAL PROFESSIONNEL::DIA RICHESSE::1::hair_color_shade",
    "reason": "weak_fuzzy_only"
  },
  {
    "legacy_id": "ip04",
    "salon_id": "salon-look",
    "legacy": "Loreal Profesional / Dia Richesse / 1.3 (Dia Richesse 1.3)",
    "method": "weak_fuzzy_match",
    "confidence": "low",
    "score": 0.39473686,
    "matched_product_id": "L'OREAL PROFESSIONNEL::DIA RICHESSE::3::hair_color_shade",
    "reason": "weak_fuzzy_only"
  },
  {
    "legacy_id": "ip05",
    "salon_id": "salon-look",
    "legacy": "Loreal Profesional / Dia Richesse / 1.4 (Dia Richesse 1.4)",
    "method": "weak_fuzzy_match",
    "confidence": "low",
    "score": 0.4,
    "matched_product_id": "L'OREAL PROFESSIONNEL::DIA RICHESSE::4-15::hair_color_shade",
    "reason": "weak_fuzzy_only"
  }
]
```
### auto_migrate
```json
[
  {
    "legacy_id": "ip10",
    "salon_id": "salon-look",
    "legacy": "Loreal Profesional / Majirel / 5.0 (Majirel 5.0)",
    "method": "brand_line_shade_exact",
    "confidence": "high",
    "score": 0.95,
    "matched_product_id": "L'OREAL PROFESSIONNEL::MAJIREL::5-0::hair_color_shade",
    "reason": "brand_line_shade_exact"
  },
  {
    "legacy_id": "ip11",
    "salon_id": "salon-look",
    "legacy": "Loreal Profesional / Majirel / 6.0 (Majirel 6.0)",
    "method": "brand_line_shade_exact",
    "confidence": "high",
    "score": 0.95,
    "matched_product_id": "L'OREAL PROFESSIONNEL::MAJIREL::6-0::hair_color_shade",
    "reason": "brand_line_shade_exact"
  },
  {
    "legacy_id": "ip12",
    "salon_id": "salon-look",
    "legacy": "Loreal Profesional / Majirel / 7.0 (Majirel 7.0)",
    "method": "brand_line_shade_exact",
    "confidence": "high",
    "score": 0.95,
    "matched_product_id": "L'OREAL PROFESSIONNEL::MAJIREL::7-0::hair_color_shade",
    "reason": "brand_line_shade_exact"
  },
  {
    "legacy_id": "ip13",
    "salon_id": "salon-look",
    "legacy": "Loreal Profesional / New Inoa / 5.3 (New Inoa 5.3)",
    "method": "brand_line_shade_exact",
    "confidence": "high",
    "score": 0.95,
    "matched_product_id": "L'OREAL PROFESSIONNEL::INOA::5-3::hair_color_shade",
    "reason": "brand_line_shade_exact"
  },
  {
    "legacy_id": "ip14",
    "salon_id": "salon-look",
    "legacy": "Loreal Profesional / New Inoa / 6.1 (New Inoa 6.1)",
    "method": "brand_line_shade_exact",
    "confidence": "high",
    "score": 0.95,
    "matched_product_id": "L'OREAL PROFESSIONNEL::INOA::6-1::hair_color_shade",
    "reason": "brand_line_shade_exact"
  }
]
```

