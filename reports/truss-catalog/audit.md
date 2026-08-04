# TRUSS catalog repository audit

Date: 2026-08-04

## Architecture reused

- Neon global catalog: `catalog_brands`, `catalog_product_lines`, `catalog_product_families`, `catalog_products`, `catalog_product_barcodes`, `catalog_product_sources`
- Runtime: `catalog_runtime_products` (approved + published)
- Salon: `salon_enabled_brands`, `salon_enabled_product_lines`, `salon_inventory_products`
- API: `netlify/functions/salon-products.js`
- UI homes: Catalog Setup, Inventory, new `/crm/brands/truss`

## Decisions

- `1C` dedicated brand page at `/crm/brands/truss` (reuses salon APIs; not a parallel catalog DB)
- `2B` PDF is primary identity truth; legacy seed / unmatched Neon rows → `needs_review`

## Schema additions

- `047_truss_catalog_product_fields.sql` — `supplier_sku`, `primary_image_path`, `image_source_url`, `metadata`, `published_at`, shade columns
- `048_catalog_barcode_search_index.sql` — barcode / supplier_sku search indexes

## Identity mapping

| Field | Storage |
|-------|---------|
| EAN | `catalog_product_barcodes` type `ean13` primary |
| TRS | `supplier_sku` + barcode type `internal` |
| Image | `primary_image_path` → `/catalog-products/truss-professional/...` |
| Provenance | `catalog_product_sources` `source_system=truss_israel_barcode_pdf` |
