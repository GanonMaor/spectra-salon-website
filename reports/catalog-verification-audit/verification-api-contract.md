# Verification API Contract Draft

This draft defines the API surface needed after the catalog and Beauty Intelligence data move from static JSON into Neon.

## Goals

- Every catalog product has a verification status.
- Every status can be explained by source evidence.
- Admin users can review, approve, or correct product identity without mixing observed usage, catalog truth, and market classification.

## Status Model

| Status | Meaning | Can be automatic? | Requires human review? |
| --- | --- | --- | --- |
| `verified` | Strong source evidence matches product identity. | Yes, with high-confidence source match. | No, unless conflict appears. |
| `partially_verified` | Source supports brand/series but not all fields. | Yes. | Sometimes. |
| `source_linked` | Search URL exists but no source was fetched/matched. | Current catalog default. | Yes for important brands. |
| `heuristic_only` | Built from XLSX/usage data and local rules only. | Yes. | Yes if product is important or ambiguous. |
| `needs_review` | Conflict, deleted/replaced flag, ambiguous type, or failed source match. | Yes. | Yes. |

## Proposed Routes

### Inventory and Coverage

`GET /.netlify/functions/beauty-intelligence/catalog-coverage`

Returns:

```json
{
  "totalProducts": 32937,
  "byVerificationStatus": {
    "verified": 0,
    "partially_verified": 0,
    "source_linked": 31306,
    "heuristic_only": 0,
    "needs_review": 1631
  },
  "riskCounts": {
    "barcodeConflicts": 1015,
    "deletedProducts": 585,
    "deprecatedProducts": 31
  }
}
```

### Catalog Search

`GET /.netlify/functions/beauty-intelligence/catalog-items?brand=&series=&type=&status=&q=&page=&limit=`

Returns paginated catalog rows from `beauty_product_catalog_items`.

### Product Evidence

`GET /.netlify/functions/beauty-intelligence/catalog-items/:id/sources`

Returns all evidence rows from `beauty_dictionary_sources`.

### Add Source Evidence

`POST /.netlify/functions/beauty-intelligence/sources`

Body:

```json
{
  "entityType": "catalog_item",
  "entityId": "product-id",
  "sourceKind": "official_site",
  "sourceUrl": "https://example.com/product",
  "sourceTitle": "Product title",
  "searchQuery": "barcode brand series shade",
  "matchedFields": ["brand", "series", "shade"],
  "confidence": "medium",
  "evidenceText": "Manufacturer page confirms series and shade family."
}
```

### Update Verification Status

`PATCH /.netlify/functions/beauty-intelligence/catalog-items/:id/verification`

Body:

```json
{
  "verificationStatus": "verified",
  "verificationConfidence": "high",
  "reason": "Official product page and barcode match."
}
```

### Rebuild From Sources

`POST /.netlify/functions/beauty-intelligence/rebuild-from-neon`

Regenerates optional static cache files after Neon is updated.

## Admin UI Changes

1. Product Catalog rows should show:
   - verification status
   - confidence
   - source count
   - last checked date

2. Product detail drawer should show:
   - observed XLSX identity
   - canonical identity
   - source evidence
   - conflicts and suggested action

3. Needs Review should become a real queue:
   - barcode conflicts
   - deleted/replaced rows
   - color/care ambiguity
   - developer/color ambiguity
   - missing market category
   - missing source evidence for priority brands

## Source Priority

1. Official manufacturer site.
2. Official shade chart / education PDF.
3. Barcode/GTIN registry.
4. Distributor catalog.
5. Google search result.
6. Manual note.

## Verification Scoring

High confidence:

- Official source or barcode lookup.
- At least brand and one strong product identifier match.
- No conflicting barcode or product type.

Medium confidence:

- Distributor or official chart match.
- Brand and series match, but barcode/shade missing.

Low confidence:

- Search result title only.
- Heuristic classification.
- Ambiguous or conflicting product kind.
