# Milestone 5 — Review Exception Report: wella-professionals (before-wella-rule-refinement)

**Generated:** 2026-06-17  
**Review records analyzed:** 385

This report is read-only and does not authorize production writes.

## Resolution Summary

| Category | Count |
|----------|-------|
| Safely resolvable with deterministic rules | 186 |
| Partially resolvable as separate toner/ontology work | 25 |
| Keep in review | 174 |

## Counts By Category

| Category | Count |
|----------|-------|
| shade_product_without_numeric_level | 174 |
| alpha_shade_code | 98 |
| treatment_or_care | 40 |
| lightener | 28 |
| named_toner | 25 |
| developer | 18 |
| bond_builder | 2 |

## Counts By Product Type

| Product Type | Count |
|--------------|-------|
| hair_color_shade | 228 |
| demi_permanent | 60 |
| lightener | 29 |
| treatment_care | 29 |
| acidic_toner | 12 |
| developer_oxidant | 12 |
| permanent_color | 12 |
| bond_builder | 2 |
| lightener_bleach | 1 |

## Counts By Product Line

| Product Line | Count |
|--------------|-------|
| CHARM COLOR PERMANENT LIQUID COLOR | 68 |
| KOLESTONE | 58 |
| COLOR TOUCH | 41 |
| COLOR FRESH | 29 |
| CHARM COLOR DEMI | 21 |
| CHARM COLOR PERMANENT | 20 |
| COLOR TOUCH PLUS | 16 |
| KOLESTONE COLOR EXPRESS | 15 |
| ILLUMINA | 12 |
| SHINEFINITY | 12 |
| BLONDOR BLEACH | 11 |
| TRUE GREY | 9 |
| BLONDOR | 8 |
| MAGMA | 7 |
| INSTAMATIC | 6 |
| ULTIMATE REPAIR | 6 |
| WELLOXON DEVELOPERS | 6 |
| CHARM COLOR VIVIDS | 4 |
| FUSION | 4 |
| GALON DEVELOPERS | 4 |
| BLONDOR DEVELOPERS | 3 |
| BRILLIANCE | 3 |
| LUXE | 3 |
| NUTRI ENRICH | 3 |
| OIL REFLECTIONS | 3 |
| COLOR TOUCH DEVELOPERS | 2 |
| INVIGO | 2 |
| RE-NEW | 2 |
| ULTIMATE SMOOTH | 2 |
| WELLA PLEX | 2 |

## Counts By Shade Format

| Shade Format | Count |
|--------------|-------|
| named_with_number_or_size | 192 |
| alpha_suffix_unparsed | 98 |
| named_no_numeric_level | 78 |
| named | 17 |

## Counts By Review Reason

| Review Reason | Count |
|---------------|-------|
| shade not normalized | 368 |
| no numeric level for shade product | 312 |
| alpha shade code not parsed | 98 |
| non-shade product variant/name treated as shade | 71 |
| unparseable shade code "4%   13 Vol." | 4 |
| unparseable shade code "1.9%   6 Vol." | 3 |
| unparseable shade code "3N" | 3 |
| unparseable shade code "4N" | 3 |
| unparseable shade code "5N" | 3 |
| unparseable shade code "6N" | 3 |
| unparseable shade code "7A" | 3 |
| unparseable shade code "7N" | 3 |
| unparseable shade code "8N" | 3 |
| confidence below automatic: deterministic but not exact shade SKU | 2 |
| unparseable shade code "0/00" | 2 |
| unparseable shade code "0/45" | 2 |
| unparseable shade code "0/88" | 2 |
| unparseable shade code "10A" | 2 |
| unparseable shade code "10N" | 2 |
| unparseable shade code "1N" | 2 |
| unparseable shade code "2N" | 2 |
| unparseable shade code "33/06" | 2 |
| unparseable shade code "4/" | 2 |
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
| unparseable shade code "5A" | 2 |
| unparseable shade code "6%   20 Vol." | 2 |
| unparseable shade code "66/03" | 2 |
| unparseable shade code "66/04" | 2 |
| unparseable shade code "66/07" | 2 |
| unparseable shade code "66/44" | 2 |

## Grouped Exception Patterns

| Count | Category | Product Line | Type | Shade Format | Missing Fields | Deterministic? |
|-------|----------|--------------|------|--------------|----------------|----------------|
| 65 | alpha_shade_code | CHARM COLOR PERMANENT LIQUID COLOR | hair_color_shade | alpha_suffix_unparsed | shadeCodeNormalized, level, barcode, catalogNumber | true - Wella Color Charm alpha suffixes can be parsed with a brand-specific alpha reflection map. |
| 56 | shade_product_without_numeric_level | KOLESTONE | hair_color_shade | named_with_number_or_size | shadeCodeNormalized, level, catalogNumber | false - No repeatable deterministic rule identified yet. |
| 24 | shade_product_without_numeric_level | COLOR TOUCH | demi_permanent | named_with_number_or_size | shadeCodeNormalized, level, barcode, catalogNumber | false - No repeatable deterministic rule identified yet. |
| 20 | alpha_shade_code | CHARM COLOR DEMI | hair_color_shade | alpha_suffix_unparsed | shadeCodeNormalized, level, barcode, catalogNumber | true - Wella Color Charm alpha suffixes can be parsed with a brand-specific alpha reflection map. |
| 20 | shade_product_without_numeric_level | CHARM COLOR PERMANENT | hair_color_shade | named_with_number_or_size | shadeCodeNormalized, level, barcode, catalogNumber | false - No repeatable deterministic rule identified yet. |
| 17 | shade_product_without_numeric_level | COLOR TOUCH | demi_permanent | named_with_number_or_size | shadeCodeNormalized, level, catalogNumber | false - No repeatable deterministic rule identified yet. |
| 13 | alpha_shade_code | KOLESTONE COLOR EXPRESS | hair_color_shade | alpha_suffix_unparsed | shadeCodeNormalized, level | true - Wella Color Charm alpha suffixes can be parsed with a brand-specific alpha reflection map. |
| 12 | shade_product_without_numeric_level | COLOR FRESH | hair_color_shade | named_no_numeric_level | shadeCodeNormalized, level | false - Named color shade lacks deterministic level; keep in review until manufacturer-specific ontology is curated. |
| 8 | named_toner | SHINEFINITY | acidic_toner | named_with_number_or_size | shadeCodeNormalized, level | partial - Can be separated into toner ontology, but should not be forced into exact shade-level SKU automation without curated tone rules. |
| 8 | shade_product_without_numeric_level | COLOR TOUCH PLUS | demi_permanent | named_with_number_or_size | shadeCodeNormalized, level, barcode, catalogNumber | false - No repeatable deterministic rule identified yet. |
| 8 | shade_product_without_numeric_level | COLOR TOUCH PLUS | demi_permanent | named_with_number_or_size | shadeCodeNormalized, level, catalogNumber | false - No repeatable deterministic rule identified yet. |
| 8 | treatment_or_care | COLOR FRESH | hair_color_shade | named_no_numeric_level | shadeCodeNormalized, level | true - This is not a true shade SKU ontology problem; deterministic product-type rules can classify it outside the shade map. |
| 7 | shade_product_without_numeric_level | ILLUMINA | permanent_color | named_with_number_or_size | shadeCodeNormalized, level | false - No repeatable deterministic rule identified yet. |
| 6 | developer | WELLOXON DEVELOPERS | developer_oxidant | named_with_number_or_size | shadeCodeNormalized, catalogNumber | true - This is not a true shade SKU ontology problem; deterministic product-type rules can classify it outside the shade map. |
| 5 | lightener | BLONDOR BLEACH | lightener | named_no_numeric_level | shadeCodeNormalized, catalogNumber | true - This is not a true shade SKU ontology problem; deterministic product-type rules can classify it outside the shade map. |
| 5 | lightener | BLONDOR BLEACH | lightener | named_with_number_or_size | shadeCodeNormalized, catalogNumber | true - This is not a true shade SKU ontology problem; deterministic product-type rules can classify it outside the shade map. |
| 5 | named_toner | TRUE GREY | hair_color_shade | named_no_numeric_level | shadeCodeNormalized, level | partial - Can be separated into toner ontology, but should not be forced into exact shade-level SKU automation without curated tone rules. |
| 4 | lightener | MAGMA | lightener | named_with_number_or_size | shadeCodeNormalized, barcode | true - This is not a true shade SKU ontology problem; deterministic product-type rules can classify it outside the shade map. |
| 4 | named_toner | INSTAMATIC | hair_color_shade | named_no_numeric_level | shadeCodeNormalized, level, barcode, catalogNumber | partial - Can be separated into toner ontology, but should not be forced into exact shade-level SKU automation without curated tone rules. |
| 4 | shade_product_without_numeric_level | COLOR FRESH | hair_color_shade | named | level | false - No repeatable deterministic rule identified yet. |
| 4 | treatment_or_care | FUSION | treatment_care | named_no_numeric_level | shadeCodeNormalized, catalogNumber | true - This is not a true shade SKU ontology problem; deterministic product-type rules can classify it outside the shade map. |
| 4 | treatment_or_care | ULTIMATE REPAIR | treatment_care | named_with_number_or_size | shadeCodeNormalized, catalogNumber | true - This is not a true shade SKU ontology problem; deterministic product-type rules can classify it outside the shade map. |
| 3 | developer | BLONDOR DEVELOPERS | lightener | named_with_number_or_size | shadeCodeNormalized, catalogNumber | true - This is not a true shade SKU ontology problem; deterministic product-type rules can classify it outside the shade map. |
| 3 | developer | GALON DEVELOPERS | developer_oxidant | named_with_number_or_size | shadeCodeNormalized, barcode, catalogNumber | true - This is not a true shade SKU ontology problem; deterministic product-type rules can classify it outside the shade map. |
| 3 | lightener | BLONDOR | lightener | named_no_numeric_level | shadeCodeNormalized | true - This is not a true shade SKU ontology problem; deterministic product-type rules can classify it outside the shade map. |
| 3 | lightener | BLONDOR | lightener | named_no_numeric_level | shadeCodeNormalized, catalogNumber | true - This is not a true shade SKU ontology problem; deterministic product-type rules can classify it outside the shade map. |
| 3 | shade_product_without_numeric_level | CHARM COLOR VIVIDS | hair_color_shade | named | level, barcode, catalogNumber | false - No repeatable deterministic rule identified yet. |
| 3 | shade_product_without_numeric_level | ILLUMINA | permanent_color | named_no_numeric_level | shadeCodeNormalized, level | false - Named color shade lacks deterministic level; keep in review until manufacturer-specific ontology is curated. |
| 3 | treatment_or_care | BRILLIANCE | treatment_care | named_no_numeric_level | shadeCodeNormalized, catalogNumber | true - This is not a true shade SKU ontology problem; deterministic product-type rules can classify it outside the shade map. |
| 3 | treatment_or_care | COLOR FRESH | hair_color_shade | named | level | true - This is not a true shade SKU ontology problem; deterministic product-type rules can classify it outside the shade map. |
| 3 | treatment_or_care | LUXE | treatment_care | named_no_numeric_level | shadeCodeNormalized, catalogNumber | true - This is not a true shade SKU ontology problem; deterministic product-type rules can classify it outside the shade map. |
| 3 | treatment_or_care | NUTRI ENRICH | treatment_care | named_no_numeric_level | shadeCodeNormalized, catalogNumber | true - This is not a true shade SKU ontology problem; deterministic product-type rules can classify it outside the shade map. |
| 3 | treatment_or_care | OIL REFLECTIONS | treatment_care | named_no_numeric_level | shadeCodeNormalized, catalogNumber | true - This is not a true shade SKU ontology problem; deterministic product-type rules can classify it outside the shade map. |
| 2 | bond_builder | WELLA PLEX | bond_builder | named_with_number_or_size | shadeCodeNormalized, catalogNumber | true - This is not a true shade SKU ontology problem; deterministic product-type rules can classify it outside the shade map. |
| 2 | developer | COLOR TOUCH DEVELOPERS | demi_permanent | named_with_number_or_size | shadeCodeNormalized, level, catalogNumber | true - This is not a true shade SKU ontology problem; deterministic product-type rules can classify it outside the shade map. |
| 2 | lightener | MAGMA | lightener | named_with_number_or_size | shadeCodeNormalized, catalogNumber | true - This is not a true shade SKU ontology problem; deterministic product-type rules can classify it outside the shade map. |
| 2 | named_toner | INSTAMATIC | hair_color_shade | named_no_numeric_level | shadeCodeNormalized, level, catalogNumber | partial - Can be separated into toner ontology, but should not be forced into exact shade-level SKU automation without curated tone rules. |
| 2 | named_toner | SHINEFINITY | acidic_toner | named_no_numeric_level | shadeCodeNormalized, level, catalogNumber | partial - Can be separated into toner ontology, but should not be forced into exact shade-level SKU automation without curated tone rules. |
| 2 | named_toner | SHINEFINITY | acidic_toner | named_with_number_or_size | shadeCodeNormalized, level, catalogNumber | partial - Can be separated into toner ontology, but should not be forced into exact shade-level SKU automation without curated tone rules. |
| 2 | named_toner | TRUE GREY | hair_color_shade | named | level | partial - Can be separated into toner ontology, but should not be forced into exact shade-level SKU automation without curated tone rules. |
| 2 | shade_product_without_numeric_level | CHARM COLOR PERMANENT LIQUID COLOR | hair_color_shade | named_with_number_or_size | shadeCodeNormalized, level, barcode, catalogNumber | false - No repeatable deterministic rule identified yet. |
| 2 | shade_product_without_numeric_level | ILLUMINA | permanent_color | named | level | false - No repeatable deterministic rule identified yet. |
| 2 | shade_product_without_numeric_level | KOLESTONE | hair_color_shade | named_with_number_or_size | shadeCodeNormalized, level, barcode, catalogNumber | false - No repeatable deterministic rule identified yet. |
| 2 | shade_product_without_numeric_level | KOLESTONE COLOR EXPRESS | hair_color_shade | named_with_number_or_size | shadeCodeNormalized, level | false - No repeatable deterministic rule identified yet. |
| 2 | treatment_or_care | INVIGO | treatment_care | named_no_numeric_level | shadeCodeNormalized, catalogNumber | true - This is not a true shade SKU ontology problem; deterministic product-type rules can classify it outside the shade map. |
| 2 | treatment_or_care | ULTIMATE REPAIR | treatment_care | named_no_numeric_level | shadeCodeNormalized, catalogNumber | true - This is not a true shade SKU ontology problem; deterministic product-type rules can classify it outside the shade map. |
| 2 | treatment_or_care | ULTIMATE SMOOTH | treatment_care | named_with_number_or_size | shadeCodeNormalized, catalogNumber | true - This is not a true shade SKU ontology problem; deterministic product-type rules can classify it outside the shade map. |
| 1 | developer | COLOR TOUCH PLUS DEVELOPERS | demi_permanent | named_with_number_or_size | shadeCodeNormalized, level, catalogNumber | true - This is not a true shade SKU ontology problem; deterministic product-type rules can classify it outside the shade map. |
| 1 | developer | GALON DEVELOPERS | developer_oxidant | named_no_numeric_level | shadeCodeNormalized, barcode, catalogNumber | true - This is not a true shade SKU ontology problem; deterministic product-type rules can classify it outside the shade map. |
| 1 | developer | RE-NEW | developer_oxidant | named_no_numeric_level | shadeCodeNormalized, catalogNumber | true - This is not a true shade SKU ontology problem; deterministic product-type rules can classify it outside the shade map. |
| 1 | developer | TRUE GREY | developer_oxidant | named_no_numeric_level | shadeCodeNormalized, catalogNumber | true - This is not a true shade SKU ontology problem; deterministic product-type rules can classify it outside the shade map. |
| 1 | lightener | BLONDOR | lightener | named | barcode, catalogNumber | true - This is not a true shade SKU ontology problem; deterministic product-type rules can classify it outside the shade map. |
| 1 | lightener | BLONDOR | lightener | named | catalogNumber | true - This is not a true shade SKU ontology problem; deterministic product-type rules can classify it outside the shade map. |
| 1 | lightener | BLONDOR BLEACH | lightener | named_with_number_or_size | shadeCodeNormalized, barcode | true - This is not a true shade SKU ontology problem; deterministic product-type rules can classify it outside the shade map. |
| 1 | lightener | COLOR FRESH | hair_color_shade | named | level | true - This is not a true shade SKU ontology problem; deterministic product-type rules can classify it outside the shade map. |
| 1 | lightener | MAGMA | lightener | named_no_numeric_level | shadeCodeNormalized | true - This is not a true shade SKU ontology problem; deterministic product-type rules can classify it outside the shade map. |
| 1 | lightener | RE-NEW | lightener_bleach | named_no_numeric_level | shadeCodeNormalized, catalogNumber | true - This is not a true shade SKU ontology problem; deterministic product-type rules can classify it outside the shade map. |
| 1 | shade_product_without_numeric_level | CHARM COLOR DEMI | hair_color_shade | named_no_numeric_level | shadeCodeNormalized, level, barcode | false - Named color shade lacks deterministic level; keep in review until manufacturer-specific ontology is curated. |
| 1 | shade_product_without_numeric_level | CHARM COLOR PERMANENT LIQUID COLOR | hair_color_shade | named_no_numeric_level | shadeCodeNormalized, level, barcode, catalogNumber | false - Named color shade lacks deterministic level; keep in review until manufacturer-specific ontology is curated. |
| 1 | shade_product_without_numeric_level | CHARM COLOR VIVIDS | hair_color_shade | named_no_numeric_level | shadeCodeNormalized, level, barcode, catalogNumber | false - Named color shade lacks deterministic level; keep in review until manufacturer-specific ontology is curated. |
| 1 | shade_product_without_numeric_level | COLOR FRESH | hair_color_shade | named_with_number_or_size | shadeCodeNormalized, level | false - No repeatable deterministic rule identified yet. |
| 1 | treatment_or_care | TREATMENT | treatment_care | named_no_numeric_level | shadeCodeNormalized, catalogNumber | true - This is not a true shade SKU ontology problem; deterministic product-type rules can classify it outside the shade map. |
| 1 | treatment_or_care | TRUE GREY | treatment_care | named_no_numeric_level | shadeCodeNormalized, catalogNumber | true - This is not a true shade SKU ontology problem; deterministic product-type rules can classify it outside the shade map. |
| 1 | treatment_or_care | ULTIMATE | treatment_care | named_no_numeric_level | shadeCodeNormalized, catalogNumber | true - This is not a true shade SKU ontology problem; deterministic product-type rules can classify it outside the shade map. |

## Example Records By Pattern

### alpha_shade_code / CHARM COLOR PERMANENT LIQUID COLOR / alpha_suffix_unparsed

Count: 65

| ID | Type | Shade | Normalized | Missing | Confidence |
|----|------|-------|------------|---------|------------|
| bd925463 | hair_color_shade | 10A |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |
| bd925463 | hair_color_shade | 10GV |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |
| bd925463 | hair_color_shade | 10N |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |
| bd925463 | hair_color_shade | 10NG |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |
| bd925463 | hair_color_shade | 12A |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |
| bd925463 | hair_color_shade | 12AA |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |
| bd925463 | hair_color_shade | 12C |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |
| bd925463 | hair_color_shade | 12N |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |

### shade_product_without_numeric_level / KOLESTONE / named_with_number_or_size

Count: 56

| ID | Type | Shade | Normalized | Missing | Confidence |
|----|------|-------|------------|---------|------------|
| bd925463 | hair_color_shade | 0/00 |  | shadeCodeNormalized, level, catalogNumber | 0.89 |
| bd925463 | hair_color_shade | 0/11 |  | shadeCodeNormalized, level, catalogNumber | 0.89 |
| bd925463 | hair_color_shade | 0/22 |  | shadeCodeNormalized, level, catalogNumber | 0.89 |
| bd925463 | hair_color_shade | 0/28 |  | shadeCodeNormalized, level, catalogNumber | 0.89 |
| bd925463 | hair_color_shade | 0/30 |  | shadeCodeNormalized, level, catalogNumber | 0.89 |
| bd925463 | hair_color_shade | 0/33 |  | shadeCodeNormalized, level, catalogNumber | 0.89 |
| bd925463 | hair_color_shade | 0/43 |  | shadeCodeNormalized, level, catalogNumber | 0.89 |
| bd925463 | hair_color_shade | 0/44 |  | shadeCodeNormalized, level, catalogNumber | 0.89 |

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

### alpha_shade_code / CHARM COLOR DEMI / alpha_suffix_unparsed

Count: 20

| ID | Type | Shade | Normalized | Missing | Confidence |
|----|------|-------|------------|---------|------------|
| bd925463 | hair_color_shade | 10A |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |
| bd925463 | hair_color_shade | 1N |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |
| bd925463 | hair_color_shade | 2BBL |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |
| bd925463 | hair_color_shade | 3N |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |
| bd925463 | hair_color_shade | 3VV |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |
| bd925463 | hair_color_shade | 4N |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |
| bd925463 | hair_color_shade | 5N |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |
| bd925463 | hair_color_shade | 5RR |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |

### shade_product_without_numeric_level / CHARM COLOR PERMANENT / named_with_number_or_size

Count: 20

| ID | Type | Shade | Normalized | Missing | Confidence |
|----|------|-------|------------|---------|------------|
| bd925463 | hair_color_shade | T05 |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |
| bd925463 | hair_color_shade | T10 |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |
| bd925463 | hair_color_shade | T11 |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |
| bd925463 | hair_color_shade | T12 |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |
| bd925463 | hair_color_shade | T14 |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |
| bd925463 | hair_color_shade | T15 |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |
| bd925463 | hair_color_shade | T16 |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |
| bd925463 | hair_color_shade | T18 |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |

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

### alpha_shade_code / KOLESTONE COLOR EXPRESS / alpha_suffix_unparsed

Count: 13

| ID | Type | Shade | Normalized | Missing | Confidence |
|----|------|-------|------------|---------|------------|
| bd925463 | hair_color_shade | 10N |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | hair_color_shade | 2N |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | hair_color_shade | 3N |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | hair_color_shade | 4N |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | hair_color_shade | 5A |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | hair_color_shade | 5GW |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | hair_color_shade | 5N |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | hair_color_shade | 6N |  | shadeCodeNormalized, level | 0.89 |

### shade_product_without_numeric_level / COLOR FRESH / named_no_numeric_level

Count: 12

| ID | Type | Shade | Normalized | Missing | Confidence |
|----|------|-------|------------|---------|------------|
| bd925463 | hair_color_shade | FUTURE YELLOW |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | hair_color_shade | HIGH MAGENTA |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | hair_color_shade | HYPER CORAL |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | hair_color_shade | INFINTTE ORANGE |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | hair_color_shade | NEVERSEEN GREEN |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | hair_color_shade | NEW BLUE |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | hair_color_shade | NUDIST PINK |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | hair_color_shade | SUPER PETROL |  | shadeCodeNormalized, level | 0.89 |

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
| bd925463 | hair_color_shade | Mask Blue |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | hair_color_shade | Mask Caramle Glaze |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | hair_color_shade | Mask Chocolate Touch |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | hair_color_shade | Mask Lilac Frost |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | hair_color_shade | Mask Mint |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | hair_color_shade | Mask Peach |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | hair_color_shade | Mask Pink |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | hair_color_shade | Mask Rose Blaze |  | shadeCodeNormalized, level | 0.89 |

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

### developer / WELLOXON DEVELOPERS / named_with_number_or_size

Count: 6

| ID | Type | Shade | Normalized | Missing | Confidence |
|----|------|-------|------------|---------|------------|
| bd925463 | developer_oxidant | 1.9%   6 Vol. |  | shadeCodeNormalized, catalogNumber | 0.89 |
| bd925463 | developer_oxidant | 12%   40 Vol. |  | shadeCodeNormalized, catalogNumber | 0.89 |
| bd925463 | developer_oxidant | 3% 10 Vol. |  | shadeCodeNormalized, catalogNumber | 0.89 |
| bd925463 | developer_oxidant | 4%   13 Vol. |  | shadeCodeNormalized, catalogNumber | 0.89 |
| bd925463 | developer_oxidant | 6%   20 Vol. |  | shadeCodeNormalized, catalogNumber | 0.89 |
| bd925463 | developer_oxidant | 9%   30 Vol. |  | shadeCodeNormalized, catalogNumber | 0.89 |

### lightener / BLONDOR BLEACH / named_no_numeric_level

Count: 5

| ID | Type | Shade | Normalized | Missing | Confidence |
|----|------|-------|------------|---------|------------|
| bd925463 | lightener | BLONDOR |  | shadeCodeNormalized, catalogNumber | 0.89 |
| bd925463 | lightener | BLONDOR PLEX |  | shadeCodeNormalized, catalogNumber | 0.89 |
| bd925463 | lightener | Extra Cool Blonde |  | shadeCodeNormalized, catalogNumber | 0.89 |
| bd925463 | lightener | MULTI BLONDE |  | shadeCodeNormalized, catalogNumber | 0.89 |
| bd925463 | lightener | SOFT BLOND |  | shadeCodeNormalized, catalogNumber | 0.89 |

### lightener / BLONDOR BLEACH / named_with_number_or_size

Count: 5

| ID | Type | Shade | Normalized | Missing | Confidence |
|----|------|-------|------------|---------|------------|
| bd925463 | lightener | BLONDOR 400g |  | shadeCodeNormalized, catalogNumber | 0.89 |
| bd925463 | lightener | BLONDOR PLEX 9 |  | shadeCodeNormalized, catalogNumber | 0.89 |
| bd925463 | lightener | Freelights 400g |  | shadeCodeNormalized, catalogNumber | 0.89 |
| bd925463 | lightener | Freelights 800g |  | shadeCodeNormalized, catalogNumber | 0.89 |
| bd925463 | lightener | Multi Blonde 7 |  | shadeCodeNormalized, catalogNumber | 0.89 |

### named_toner / TRUE GREY / named_no_numeric_level

Count: 5

| ID | Type | Shade | Normalized | Missing | Confidence |
|----|------|-------|------------|---------|------------|
| bd925463 | hair_color_shade | Graphite Shimmer Dark |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | hair_color_shade | Graphite Shimmer Light |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | hair_color_shade | Graphite Shimmer Medium |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | hair_color_shade | Steel Glow Dark |  | shadeCodeNormalized, level | 0.89 |
| bd925463 | hair_color_shade | Steel Glow Medium |  | shadeCodeNormalized, level | 0.89 |

### lightener / MAGMA / named_with_number_or_size

Count: 4

| ID | Type | Shade | Normalized | Missing | Confidence |
|----|------|-------|------------|---------|------------|
| bd925463 | lightener | /03+ |  | shadeCodeNormalized, barcode | 0.89 |
| bd925463 | lightener | /44 R |  | shadeCodeNormalized, barcode | 0.89 |
| bd925463 | lightener | /44+C |  | shadeCodeNormalized, barcode | 0.89 |
| bd925463 | lightener | /89+C |  | shadeCodeNormalized, barcode | 0.89 |

### named_toner / INSTAMATIC / named_no_numeric_level

Count: 4

| ID | Type | Shade | Normalized | Missing | Confidence |
|----|------|-------|------------|---------|------------|
| bd925463 | hair_color_shade | JADED MINT |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |
| bd925463 | hair_color_shade | MUTED MAUVE |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |
| bd925463 | hair_color_shade | OCEAN STORM |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |
| bd925463 | hair_color_shade | PINK DREAM |  | shadeCodeNormalized, level, barcode, catalogNumber | 0.87 |

### shade_product_without_numeric_level / COLOR FRESH / named

Count: 4

| ID | Type | Shade | Normalized | Missing | Confidence |
|----|------|-------|------------|---------|------------|
| bd925463 | hair_color_shade | Color Fresh Silver 0/6 | COLOR FRESH SILVER 0/6 | level | 0.94 |
| bd925463 | hair_color_shade | NEXT RED | NEXT RED | level | 0.94 |
| bd925463 | hair_color_shade | PURE VIOLET | PURE VIOLET | level | 0.94 |
| bd925463 | hair_color_shade | UBER GOLD | UBER GOLD | level | 0.94 |
