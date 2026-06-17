# Milestone 5 — Review Exception Report: wella-professionals (after-wella-rule-refinement)

**Generated:** 2026-06-17  
**Review records analyzed:** 218

This report is read-only and does not authorize production writes.

## Resolution Summary

| Category | Count |
|----------|-------|
| Safely resolvable with deterministic rules | 17 |
| Partially resolvable as separate toner/ontology work | 27 |
| Keep in review | 174 |

## Counts By Category

| Category | Count |
|----------|-------|
| shade_product_without_numeric_level | 174 |
| named_toner | 27 |
| treatment_or_care | 11 |
| developer | 3 |
| lightener | 3 |

## Counts By Product Type

| Product Type | Count |
|--------------|-------|
| permanent_color | 95 |
| demi_permanent | 90 |
| acidic_toner | 27 |
| direct_dye | 4 |
| lightener | 2 |

## Counts By Product Line

| Product Line | Count |
|--------------|-------|
| KOLESTONE | 58 |
| COLOR TOUCH | 41 |
| COLOR FRESH | 29 |
| CHARM COLOR PERMANENT | 20 |
| COLOR TOUCH PLUS | 16 |
| ILLUMINA | 12 |
| SHINEFINITY | 12 |
| TRUE GREY | 9 |
| INSTAMATIC | 6 |
| CHARM COLOR VIVIDS | 4 |
| CHARM COLOR PERMANENT LIQUID COLOR | 3 |
| BLONDOR | 2 |
| COLOR TOUCH DEVELOPERS | 2 |
| KOLESTONE COLOR EXPRESS | 2 |
| CHARM COLOR DEMI | 1 |
| COLOR TOUCH PLUS DEVELOPERS | 1 |

## Counts By Shade Format

| Shade Format | Count |
|--------------|-------|
| named_with_number_or_size | 160 |
| named_no_numeric_level | 41 |
| named | 17 |

## Counts By Review Reason

| Review Reason | Count |
|---------------|-------|
| no numeric level for shade product | 216 |
| shade not normalized | 201 |
| confidence below automatic: deterministic but not exact shade SKU | 2 |
| unparseable shade code "0/00" | 2 |
| unparseable shade code "0/45" | 2 |
| unparseable shade code "0/88" | 2 |
| unparseable shade code "33/06" | 2 |
| unparseable shade code "4/" | 2 |
| unparseable shade code "4%   13 Vol." | 2 |
| unparseable shade code "44/05" | 2 |
| unparseable shade code "44/06" | 2 |
| unparseable shade code "44/07" | 2 |
| unparseable shade code "44/65" | 2 |
| unparseable shade code "5/" | 2 |
| unparseable shade code "55/03" | 2 |
| unparseable shade code "55/04" | 2 |
| unparseable shade code "55/05" | 2 |
| unparseable shade code "55/06" | 2 |
| unparseable shade code "55/07" | 2 |
| unparseable shade code "55/65" | 2 |
| unparseable shade code "66/03" | 2 |
| unparseable shade code "66/04" | 2 |
| unparseable shade code "66/07" | 2 |
| unparseable shade code "66/44" | 2 |
| unparseable shade code "77/03" | 2 |
| unparseable shade code "77/07" | 2 |
| unparseable shade code "88/03" | 2 |
| unparseable shade code "88/07" | 2 |
| unparseable shade code "0/11" | 1 |
| unparseable shade code "0/22" | 1 |
| unparseable shade code "0/28" | 1 |
| unparseable shade code "0/30" | 1 |
| unparseable shade code "0/33" | 1 |
| unparseable shade code "0/34" | 1 |
| unparseable shade code "0/35" | 1 |
| unparseable shade code "0/43" | 1 |
| unparseable shade code "0/44" | 1 |
| unparseable shade code "0/55" | 1 |
| unparseable shade code "0/56" | 1 |
| unparseable shade code "0/65" | 1 |

## Grouped Exception Patterns

| Count | Category | Product Line | Type | Shade Format | Missing Fields | Deterministic? |
|-------|----------|--------------|------|--------------|----------------|----------------|
| 56 | shade_product_without_numeric_level | KOLESTONE | permanent_color | named_with_number_or_size | shadeCodeNormalized, level, catalogNumber | false - No repeatable deterministic rule identified yet. |
| 24 | shade_product_without_numeric_level | COLOR TOUCH | demi_permanent | named_with_number_or_size | shadeCodeNormalized, level, barcode, catalogNumber | false - No repeatable deterministic rule identified yet. |
| 20 | shade_product_without_numeric_level | CHARM COLOR PERMANENT | permanent_color | named_with_number_or_size | shadeCodeNormalized, level, barcode, catalogNumber | false - No repeatable deterministic rule identified yet. |
| 17 | shade_product_without_numeric_level | COLOR TOUCH | demi_permanent | named_with_number_or_size | shadeCodeNormalized, level, catalogNumber | false - No repeatable deterministic rule identified yet. |
| 12 | shade_product_without_numeric_level | COLOR FRESH | demi_permanent | named_no_numeric_level | shadeCodeNormalized, level | false - Named color shade lacks deterministic level; keep in review until manufacturer-specific ontology is curated. |
| 8 | named_toner | SHINEFINITY | acidic_toner | named_with_number_or_size | shadeCodeNormalized, level | partial - Can be separated into toner ontology, but should not be forced into exact shade-level SKU automation without curated tone rules. |
| 8 | shade_product_without_numeric_level | COLOR TOUCH PLUS | demi_permanent | named_with_number_or_size | shadeCodeNormalized, level, barcode, catalogNumber | false - No repeatable deterministic rule identified yet. |
| 8 | shade_product_without_numeric_level | COLOR TOUCH PLUS | demi_permanent | named_with_number_or_size | shadeCodeNormalized, level, catalogNumber | false - No repeatable deterministic rule identified yet. |
| 8 | treatment_or_care | COLOR FRESH | demi_permanent | named_no_numeric_level | shadeCodeNormalized, level | true - This is not a true shade SKU ontology problem; deterministic product-type rules can classify it outside the shade map. |
| 7 | shade_product_without_numeric_level | ILLUMINA | permanent_color | named_with_number_or_size | shadeCodeNormalized, level | false - No repeatable deterministic rule identified yet. |
| 5 | named_toner | TRUE GREY | acidic_toner | named_no_numeric_level | shadeCodeNormalized, level | partial - Can be separated into toner ontology, but should not be forced into exact shade-level SKU automation without curated tone rules. |
| 4 | named_toner | INSTAMATIC | acidic_toner | named_no_numeric_level | shadeCodeNormalized, level, barcode, catalogNumber | partial - Can be separated into toner ontology, but should not be forced into exact shade-level SKU automation without curated tone rules. |
| 4 | shade_product_without_numeric_level | COLOR FRESH | demi_permanent | named | level | false - No repeatable deterministic rule identified yet. |
| 3 | shade_product_without_numeric_level | CHARM COLOR VIVIDS | direct_dye | named | level, barcode, catalogNumber | false - No repeatable deterministic rule identified yet. |
| 3 | shade_product_without_numeric_level | ILLUMINA | permanent_color | named_no_numeric_level | shadeCodeNormalized, level | false - Named color shade lacks deterministic level; keep in review until manufacturer-specific ontology is curated. |
| 3 | treatment_or_care | COLOR FRESH | demi_permanent | named | level | true - This is not a true shade SKU ontology problem; deterministic product-type rules can classify it outside the shade map. |
| 2 | developer | COLOR TOUCH DEVELOPERS | demi_permanent | named_with_number_or_size | shadeCodeNormalized, level, catalogNumber | true - This is not a true shade SKU ontology problem; deterministic product-type rules can classify it outside the shade map. |
| 2 | named_toner | INSTAMATIC | acidic_toner | named_no_numeric_level | shadeCodeNormalized, level, catalogNumber | partial - Can be separated into toner ontology, but should not be forced into exact shade-level SKU automation without curated tone rules. |
| 2 | named_toner | SHINEFINITY | acidic_toner | named_no_numeric_level | shadeCodeNormalized, level, catalogNumber | partial - Can be separated into toner ontology, but should not be forced into exact shade-level SKU automation without curated tone rules. |
| 2 | named_toner | SHINEFINITY | acidic_toner | named_with_number_or_size | shadeCodeNormalized, level, catalogNumber | partial - Can be separated into toner ontology, but should not be forced into exact shade-level SKU automation without curated tone rules. |
| 2 | named_toner | TRUE GREY | acidic_toner | named | level | partial - Can be separated into toner ontology, but should not be forced into exact shade-level SKU automation without curated tone rules. |
| 2 | named_toner | TRUE GREY | acidic_toner | named_no_numeric_level | shadeCodeNormalized, level, catalogNumber | partial - Can be separated into toner ontology, but should not be forced into exact shade-level SKU automation without curated tone rules. |
| 2 | shade_product_without_numeric_level | CHARM COLOR PERMANENT LIQUID COLOR | permanent_color | named_with_number_or_size | shadeCodeNormalized, level, barcode, catalogNumber | false - No repeatable deterministic rule identified yet. |
| 2 | shade_product_without_numeric_level | ILLUMINA | permanent_color | named | level | false - No repeatable deterministic rule identified yet. |
| 2 | shade_product_without_numeric_level | KOLESTONE | permanent_color | named_with_number_or_size | shadeCodeNormalized, level, barcode, catalogNumber | false - No repeatable deterministic rule identified yet. |
| 2 | shade_product_without_numeric_level | KOLESTONE COLOR EXPRESS | permanent_color | named_with_number_or_size | shadeCodeNormalized, level | false - No repeatable deterministic rule identified yet. |
| 1 | developer | COLOR TOUCH PLUS DEVELOPERS | demi_permanent | named_with_number_or_size | shadeCodeNormalized, level, catalogNumber | true - This is not a true shade SKU ontology problem; deterministic product-type rules can classify it outside the shade map. |
| 1 | lightener | BLONDOR | lightener | named | barcode, catalogNumber | true - This is not a true shade SKU ontology problem; deterministic product-type rules can classify it outside the shade map. |
| 1 | lightener | BLONDOR | lightener | named | catalogNumber | true - This is not a true shade SKU ontology problem; deterministic product-type rules can classify it outside the shade map. |
| 1 | lightener | COLOR FRESH | demi_permanent | named | level | true - This is not a true shade SKU ontology problem; deterministic product-type rules can classify it outside the shade map. |
| 1 | shade_product_without_numeric_level | CHARM COLOR DEMI | demi_permanent | named_no_numeric_level | shadeCodeNormalized, level, barcode | false - Named color shade lacks deterministic level; keep in review until manufacturer-specific ontology is curated. |
| 1 | shade_product_without_numeric_level | CHARM COLOR PERMANENT LIQUID COLOR | permanent_color | named_no_numeric_level | shadeCodeNormalized, level, barcode, catalogNumber | false - Named color shade lacks deterministic level; keep in review until manufacturer-specific ontology is curated. |
| 1 | shade_product_without_numeric_level | CHARM COLOR VIVIDS | direct_dye | named_no_numeric_level | shadeCodeNormalized, level, barcode, catalogNumber | false - Named color shade lacks deterministic level; keep in review until manufacturer-specific ontology is curated. |
| 1 | shade_product_without_numeric_level | COLOR FRESH | demi_permanent | named_with_number_or_size | shadeCodeNormalized, level | false - No repeatable deterministic rule identified yet. |

## Example Records By Pattern

### shade_product_without_numeric_level / KOLESTONE / named_with_number_or_size

Count: 56

| ID | Type | Shade | Normalized | Missing | Confidence |
|----|------|-------|------------|---------|------------|
| bd925463 | permanent_color | 0/00 |  | shadeCodeNormalized, level, catalogNumber | 0.89 |
| bd925463 | permanent_color | 0/11 |  | shadeCodeNormalized, level, catalogNumber | 0.89 |
| bd925463 | permanent_color | 0/22 |  | shadeCodeNormalized, level, catalogNumber | 0.89 |
| bd925463 | permanent_color | 0/28 |  | shadeCodeNormalized, level, catalogNumber | 0.89 |
| bd925463 | permanent_color | 0/30 |  | shadeCodeNormalized, level, catalogNumber | 0.89 |
| bd925463 | permanent_color | 0/33 |  | shadeCodeNormalized, level, catalogNumber | 0.89 |
| bd925463 | permanent_color | 0/43 |  | shadeCodeNormalized, level, catalogNumber | 0.89 |
| bd925463 | permanent_color | 0/44 |  | shadeCodeNormalized, level, catalogNumber | 0.89 |

### shade_product_without_numeric_level / COLOR TOUCH / named_with_number_or_size

Count: 24

| ID | Type | Shade | Normalized | Missing | Confidence |
|----|------|-------|------------|---------|------------|
| bd925463 | demi_permanent | 0/35 |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |
| bd925463 | demi_permanent | 33/06 |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |
| bd925463 | demi_permanent | 44/05 |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |
| bd925463 | demi_permanent | 44/06 |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |
| bd925463 | demi_permanent | 44/07 |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |
| bd925463 | demi_permanent | 55/03 |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |
| bd925463 | demi_permanent | 55/04 |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |
| bd925463 | demi_permanent | 55/05 |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |

### shade_product_without_numeric_level / CHARM COLOR PERMANENT / named_with_number_or_size

Count: 20

| ID | Type | Shade | Normalized | Missing | Confidence |
|----|------|-------|------------|---------|------------|
| bd925463 | permanent_color | T05 |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |
| bd925463 | permanent_color | T10 |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |
| bd925463 | permanent_color | T11 |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |
| bd925463 | permanent_color | T12 |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |
| bd925463 | permanent_color | T14 |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |
| bd925463 | permanent_color | T15 |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |
| bd925463 | permanent_color | T16 |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |
| bd925463 | permanent_color | T18 |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |

### shade_product_without_numeric_level / COLOR TOUCH / named_with_number_or_size

Count: 17

| ID | Type | Shade | Normalized | Missing | Confidence |
|----|------|-------|------------|---------|------------|
| bd925463 | demi_permanent | 0/00 |  | shadeCodeNormalized, level, catalogNumber | 0.89 |
| bd925463 | demi_permanent | 0/34 |  | shadeCodeNormalized, level, catalogNumber | 0.89 |
| bd925463 | demi_permanent | 0/45 |  | shadeCodeNormalized, level, catalogNumber | 0.89 |
| bd925463 | demi_permanent | 0/56 |  | shadeCodeNormalized, level, catalogNumber | 0.89 |
| bd925463 | demi_permanent | 0/68 |  | shadeCodeNormalized, level, catalogNumber | 0.89 |
| bd925463 | demi_permanent | 0/88 |  | shadeCodeNormalized, level, catalogNumber | 0.89 |
| bd925463 | demi_permanent | 44/65 |  | shadeCodeNormalized, level, catalogNumber | 0.89 |
| bd925463 | demi_permanent | 55/07 |  | shadeCodeNormalized, level, catalogNumber | 0.89 |

### shade_product_without_numeric_level / COLOR FRESH / named_no_numeric_level

Count: 12

| ID | Type | Shade | Normalized | Missing | Confidence |
|----|------|-------|------------|---------|------------|
| bd925463 | demi_permanent | FUTURE YELLOW |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | demi_permanent | HIGH MAGENTA |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | demi_permanent | HYPER CORAL |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | demi_permanent | INFINTTE ORANGE |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | demi_permanent | NEVERSEEN GREEN |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | demi_permanent | NEW BLUE |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | demi_permanent | NUDIST PINK |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | demi_permanent | SUPER PETROL |  | shadeCodeNormalized, level | 0.89 |

### named_toner / SHINEFINITY / named_with_number_or_size

Count: 8

| ID | Type | Shade | Normalized | Missing | Confidence |
|----|------|-------|------------|---------|------------|
| bd925463 | acidic_toner | 00/00 |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | acidic_toner | 00/00 1000ml |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | acidic_toner | 00/00 500ml |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | acidic_toner | 00/66 |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | acidic_toner | 00/89 |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | acidic_toner | 010/0 |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | acidic_toner | 010/6 |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | acidic_toner | 010/8 |  | shadeCodeNormalized, level | 0.89 |

### shade_product_without_numeric_level / COLOR TOUCH PLUS / named_with_number_or_size

Count: 8

| ID | Type | Shade | Normalized | Missing | Confidence |
|----|------|-------|------------|---------|------------|
| bd925463 | demi_permanent | 33/06 |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |
| bd925463 | demi_permanent | 44/05 |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |
| bd925463 | demi_permanent | 44/06 |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |
| bd925463 | demi_permanent | 55/03 |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |
| bd925463 | demi_permanent | 55/04 |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |
| bd925463 | demi_permanent | 55/05 |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |
| bd925463 | demi_permanent | 55/06 |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |
| bd925463 | demi_permanent | 66/03 |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |

### shade_product_without_numeric_level / COLOR TOUCH PLUS / named_with_number_or_size

Count: 8

| ID | Type | Shade | Normalized | Missing | Confidence |
|----|------|-------|------------|---------|------------|
| bd925463 | demi_permanent | 44/07 |  | shadeCodeNormalized, level, catalogNumber | 0.89 |
| bd925463 | demi_permanent | 55/07 |  | shadeCodeNormalized, level, catalogNumber | 0.89 |
| bd925463 | demi_permanent | 66/04 |  | shadeCodeNormalized, level, catalogNumber | 0.89 |
| bd925463 | demi_permanent | 66/07 |  | shadeCodeNormalized, level, catalogNumber | 0.89 |
| bd925463 | demi_permanent | 77/03 |  | shadeCodeNormalized, level, catalogNumber | 0.89 |
| bd925463 | demi_permanent | 77/07 |  | shadeCodeNormalized, level, catalogNumber | 0.89 |
| bd925463 | demi_permanent | 88/03 |  | shadeCodeNormalized, level, catalogNumber | 0.89 |
| bd925463 | demi_permanent | 88/07 |  | shadeCodeNormalized, level, catalogNumber | 0.89 |

### treatment_or_care / COLOR FRESH / named_no_numeric_level

Count: 8

| ID | Type | Shade | Normalized | Missing | Confidence |
|----|------|-------|------------|---------|------------|
| bd925463 | demi_permanent | Mask Blue |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | demi_permanent | Mask Caramle Glaze |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | demi_permanent | Mask Chocolate Touch |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | demi_permanent | Mask Lilac Frost |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | demi_permanent | Mask Mint |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | demi_permanent | Mask Peach |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | demi_permanent | Mask Pink |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | demi_permanent | Mask Rose Blaze |  | shadeCodeNormalized, level | 0.89 |

### shade_product_without_numeric_level / ILLUMINA / named_with_number_or_size

Count: 7

| ID | Type | Shade | Normalized | Missing | Confidence |
|----|------|-------|------------|---------|------------|
| bd925463 | permanent_color | 10/ |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | permanent_color | 4/ |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | permanent_color | 5/ |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | permanent_color | 6/ |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | permanent_color | 7/ |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | permanent_color | 8/ |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | permanent_color | 9/ |  | shadeCodeNormalized, level | 0.89 |

### named_toner / TRUE GREY / named_no_numeric_level

Count: 5

| ID | Type | Shade | Normalized | Missing | Confidence |
|----|------|-------|------------|---------|------------|
| bd925463 | acidic_toner | Graphite Shimmer Dark |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | acidic_toner | Graphite Shimmer Light |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | acidic_toner | Graphite Shimmer Medium |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | acidic_toner | Steel Glow Dark |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | acidic_toner | Steel Glow Medium |  | shadeCodeNormalized, level | 0.89 |

### named_toner / INSTAMATIC / named_no_numeric_level

Count: 4

| ID | Type | Shade | Normalized | Missing | Confidence |
|----|------|-------|------------|---------|------------|
| bd925463 | acidic_toner | JADED MINT |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |
| bd925463 | acidic_toner | MUTED MAUVE |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |
| bd925463 | acidic_toner | OCEAN STORM |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |
| bd925463 | acidic_toner | PINK DREAM |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |

### shade_product_without_numeric_level / COLOR FRESH / named

Count: 4

| ID | Type | Shade | Normalized | Missing | Confidence |
|----|------|-------|------------|---------|------------|
| bd925463 | demi_permanent | Color Fresh Silver 0/6 | COLOR FRESH SILVER 0/6 | level | 0.94 |
| bd925463 | demi_permanent | NEXT RED | NEXT RED | level | 0.94 |
| bd925463 | demi_permanent | PURE VIOLET | PURE VIOLET | level | 0.94 |
| bd925463 | demi_permanent | UBER GOLD | UBER GOLD | level | 0.94 |

### shade_product_without_numeric_level / CHARM COLOR VIVIDS / named

Count: 3

| ID | Type | Shade | Normalized | Missing | Confidence |
|----|------|-------|------------|---------|------------|
| bd925463 | direct_dye | Crushed Copper | CRUSHED COPPER | level, barcode, catalogNumber | 0.92 |
| bd925463 | direct_dye | Ruby Red | RUBY RED | level, barcode, catalogNumber | 0.92 |
| bd925463 | direct_dye | Viva Violet | VIVA VIOLET | level, barcode, catalogNumber | 0.92 |

### shade_product_without_numeric_level / ILLUMINA / named_no_numeric_level

Count: 3

| ID | Type | Shade | Normalized | Missing | Confidence |
|----|------|-------|------------|---------|------------|
| bd925463 | permanent_color | CHROME OLIVE |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | permanent_color | PLATINIUM LILY |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | permanent_color | TITANIUM ROSE |  | shadeCodeNormalized, level | 0.89 |

### treatment_or_care / COLOR FRESH / named

Count: 3

| ID | Type | Shade | Normalized | Missing | Confidence |
|----|------|-------|------------|---------|------------|
| bd925463 | demi_permanent | Mask Copper Glow | MASK COPPER GLOW | level | 0.94 |
| bd925463 | demi_permanent | Mask Golden Gloss | MASK GOLDEN GLOSS | level | 0.94 |
| bd925463 | demi_permanent | Mask Red | MASK RED | level | 0.94 |

### developer / COLOR TOUCH DEVELOPERS / named_with_number_or_size

Count: 2

| ID | Type | Shade | Normalized | Missing | Confidence |
|----|------|-------|------------|---------|------------|
| bd925463 | demi_permanent | 1.9%   6 Vol. |  | shadeCodeNormalized, level, catalogNumber | 0.89 |
| bd925463 | demi_permanent | 4%   13 Vol. |  | shadeCodeNormalized, level, catalogNumber | 0.89 |

### named_toner / INSTAMATIC / named_no_numeric_level

Count: 2

| ID | Type | Shade | Normalized | Missing | Confidence |
|----|------|-------|------------|---------|------------|
| bd925463 | acidic_toner | CLEAR DUST |  | shadeCodeNormalized, level, catalogNumber | 0.89 |
| bd925463 | acidic_toner | SMOKEY AMETHYST |  | shadeCodeNormalized, level, catalogNumber | 0.89 |

### named_toner / SHINEFINITY / named_no_numeric_level

Count: 2

| ID | Type | Shade | Normalized | Missing | Confidence |
|----|------|-------|------------|---------|------------|
| bd925463 | acidic_toner | ACTIVATOR Bottle application |  | shadeCodeNormalized, level, catalogNumber | 0.89 |
| bd925463 | acidic_toner | ACTIVATOR Brush & Bowl |  | shadeCodeNormalized, level, catalogNumber | 0.89 |

### named_toner / SHINEFINITY / named_with_number_or_size

Count: 2

| ID | Type | Shade | Normalized | Missing | Confidence |
|----|------|-------|------------|---------|------------|
| bd925463 | acidic_toner | 00/56 |  | shadeCodeNormalized, level, catalogNumber | 0.89 |
| bd925463 | acidic_toner | 010/36 |  | shadeCodeNormalized, level, catalogNumber | 0.89 |
