# Milestone 5 — Wella Rule Proof Report

**Generated:** 2026-06-17  
**Frozen baseline rulesVersion:** 1.0.0  
**Mode:** dry-run only, no database writes

## Baseline Freeze

| Metric | Count |
|--------|-------|
| Baseline automatic | 406 |
| Baseline review | 385 |
| Baseline unresolved | 0 |

## Baseline Review Records By Product Type

| Product Type Bucket | Count | Shade-Level? |
|---------------------|-------|--------------|
| permanent color | 227 | yes |
| demi/semi color | 60 | yes |
| treatment | 31 | no |
| lightener | 30 | no |
| toner | 25 | yes |
| developer | 12 | no |

Actual baseline review records requiring shade-level classification: **312**.

## Proposed Changes Evaluation

| Change | Automatic | Review | Unresolved | Improved Records | Baseline Automatic Changed | Regressions |
|--------|-----------|--------|------------|------------------|----------------------------|-------------|
| No Wella rule change accepted | 406 | 385 | 0 | 0 | 0 | 0 |

## Rule Change Justification

### Provisional Wella product-type routing and non-shade separation (reverted)

- Pattern fixed: Repeat Wella product lines such as BLONDOR DEVELOPERS, ULTIMATE REPAIR, BRILLIANCE, FUSION, WELLOXON DEVELOPERS are non-shade products but were penalized as shade parse failures.
- Why current result is wrong: Not accepted yet. The baseline proves 73 of 385 review records are non-shade products, but the exact rule change must be tested independently before acceptance.
- Why manufacturer-correct: Likely correct for Wella developer/lightener/care lines, but not accepted without exact regression comparison.
- Records improved: 0
- Existing records that could regress: Unknown until exact test-first comparison is implemented.

| Product Line | Shade | Type |
|--------------|-------|------|
| BLONDOR | Blond Beige | lightener |
| BLONDOR | Blonde Seal & Care | lightener |
| BLONDOR | Brass Kicker | lightener |
| BLONDOR | Lightest Pearl | lightener |
| BLONDOR | Pale Amethyst | lightener |
| BLONDOR | Pale Platinum Toner | lightener |
| BLONDOR | Pale Silver | lightener |
| BLONDOR | TREATMENT | lightener |

### Provisional Wella Color Charm alpha suffix parsing (reverted)

- Pattern fixed: Color Charm alpha shade codes like 10A, 8N, 8G, 7RR, 2BBL.
- Why current result is wrong: Not accepted yet. The baseline shows recurring alpha-like Color Charm records, but each needs manufacturer-correct evidence and tests before parser changes.
- Why manufacturer-correct: Potentially Wella-scoped, but not accepted in code.
- Records improved: 0
- Existing records that could regress: Unknown until exact test-first comparison is implemented.

| Product Line | Shade | Type |
|--------------|-------|------|
| CHARM COLOR DEMI | 10A | hair_color_shade |
| CHARM COLOR DEMI | 1N | hair_color_shade |
| CHARM COLOR DEMI | 2BBL | hair_color_shade |
| CHARM COLOR DEMI | 3N | hair_color_shade |
| CHARM COLOR DEMI | 3VV | hair_color_shade |
| CHARM COLOR DEMI | 4N | hair_color_shade |
| CHARM COLOR DEMI | 5N | hair_color_shade |
| CHARM COLOR DEMI | 5RR | hair_color_shade |

### Provisional Wella product line aliases (reverted)

- Pattern fixed: KOLESTONE, COLOR TOUCH PLUS, ILLUMINA, COLOR FRESH, TRUE GREY, INSTAMATIC and Color Charm line names recur as known Wella lines.
- Why current result is wrong: Not accepted yet. The baseline breakdown suggests routing gaps, but aliases must be proven line-by-line.
- Why manufacturer-correct: Potentially Wella-scoped, but not accepted in code.
- Records improved: 0
- Existing records that could regress: Unknown until exact test-first comparison is implemented.

| Product Line | Shade | Type |
|--------------|-------|------|
| CHARM COLOR DEMI | 10A | hair_color_shade |
| CHARM COLOR DEMI | 1N | hair_color_shade |
| CHARM COLOR DEMI | 2BBL | hair_color_shade |
| CHARM COLOR DEMI | 3N | hair_color_shade |
| CHARM COLOR DEMI | 3VV | hair_color_shade |
| CHARM COLOR DEMI | 4N | hair_color_shade |
| CHARM COLOR DEMI | 5N | hair_color_shade |
| CHARM COLOR DEMI | 5RR | hair_color_shade |

## Baseline Automatic Field Changes Under Combined Proposed Change

No baseline automatic classifications changed field-by-field.

## Results By Product Type And Product Line

### Final Combined By Product Type

| Product Type | Count |
|--------------|-------|
| hair_color_shade | 403 |
| demi_permanent | 191 |
| permanent_color | 53 |
| acidic_toner | 53 |
| lightener | 47 |
| treatment_care | 29 |
| developer_oxidant | 12 |
| bond_builder | 2 |
| lightener_bleach | 1 |

### Final Combined By Product Line

| Product Line | Count |
|--------------|-------|
| KOLESTONE | 201 |
| COLOR TOUCH | 163 |
| CHARM COLOR PERMANENT LIQUID COLOR | 68 |
| COLOR FRESH | 54 |
| ILLUMINA | 53 |
| SHINEFINITY | 53 |
| KOLESTONE COLOR EXPRESS | 22 |
| CHARM COLOR DEMI | 21 |
| CHARM COLOR PERMANENT | 20 |
| MAGMA | 17 |
| BLONDOR | 16 |
| COLOR TOUCH PLUS | 16 |
| BLONDOR BLEACH | 11 |
| COLOR TOUCH RELIGHTS | 9 |
| TRUE GREY | 9 |
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
| COLOR TOUCH PLUS DEVELOPERS | 1 |
| TREATMENT | 1 |
| ULTIMATE | 1 |

## Random Validation Sample: 50 Automatic Classifications

| ID | Product Line | Type | Shade | Normalized | Level | Package | Errors |
|----|--------------|------|-------|------------|-------|---------|--------|
| bd925463 | SHINEFINITY | acidic_toner | 09/36 | 9/36 | 9 | 60 |  |
| bd925463 | COLOR TOUCH | demi_permanent | 8/73 | 8/73 | 8 | 60 |  |
| bd925463 | MAGMA | lightener | /39 | /39 |  | 120 |  |
| bd925463 | KOLESTONE | hair_color_shade | 9/31 | 9/31 | 9 | 60 |  |
| bd925463 | KOLESTONE | hair_color_shade | 9/8 | 9/8 | 9 | 60 |  |
| bd925463 | COLOR TOUCH RELIGHTS | demi_permanent | /03 | /03 |  | 60 |  |
| bd925463 | COLOR TOUCH | demi_permanent | /0 | /0 |  | 60 |  |
| bd925463 | KOLESTONE | hair_color_shade | 12/89 | 12/89 | 12 | 60 |  |
| bd925463 | KOLESTONE | hair_color_shade | 5/1 | 5/1 | 5 | 60 |  |
| bd925463 | SHINEFINITY | acidic_toner | 06/73 | 6/73 | 6 | 60 |  |
| bd925463 | COLOR TOUCH | demi_permanent | 2/8 | 2/8 | 2 | 60 |  |
| bd925463 | KOLESTONE | hair_color_shade | 8/1 | 8/1 | 8 | 60 |  |
| bd925463 | COLOR TOUCH | demi_permanent | /56 | /56 |  | 60 |  |
| bd925463 | COLOR FRESH | hair_color_shade | /5 | /5 |  | 250 |  |
| bd925463 | KOLESTONE | hair_color_shade | 8/96 | 8/96 | 8 | 60 |  |
| bd925463 | KOLESTONE | hair_color_shade | 8/2 | 8/2 | 8 | 60 |  |
| bd925463 | KOLESTONE | hair_color_shade | 6/73 | 6/73 | 6 | 60 |  |
| bd925463 | KOLESTONE | hair_color_shade | 9/96 | 9/96 | 9 | 60 |  |
| bd925463 | COLOR TOUCH | demi_permanent | 8/38 | 8/38 | 8 | 60 |  |
| bd925463 | ILLUMINA | permanent_color | 9/19 | 9/19 | 9 | 60 |  |
| bd925463 | KOLESTONE | hair_color_shade | 7/05 | 7/05 | 7 | 60 |  |
| bd925463 | KOLESTONE | hair_color_shade | 10/97 | 10/97 | 10 | 60 |  |
| bd925463 | COLOR TOUCH | demi_permanent | 7/71 | 7/71 | 7 | 60 |  |
| bd925463 | KOLESTONE | hair_color_shade | 10/31 | 10/31 | 10 | 60 |  |
| bd925463 | SHINEFINITY | acidic_toner | 07/39 | 7/39 | 7 | 60 |  |
| bd925463 | KOLESTONE | hair_color_shade | 6/3 | 6/3 | 6 | 60 |  |
| bd925463 | KOLESTONE | hair_color_shade | 7/07 | 7/07 | 7 | 60 |  |
| bd925463 | KOLESTONE | hair_color_shade | 7/77 | 7/77 | 7 | 60 |  |
| bd925463 | MAGMA | lightener | /36 | /36 |  | 120 |  |
| bd925463 | SHINEFINITY | acidic_toner | 06/07 | 6/07 | 6 | 60 |  |
| bd925463 | COLOR FRESH | hair_color_shade | /8 | /8 |  | 250 |  |
| bd925463 | KOLESTONE | hair_color_shade | 7/73 | 7/73 | 7 | 60 |  |
| bd925463 | COLOR TOUCH | demi_permanent | 9/96 | 9/96 | 9 | 60 |  |
| bd925463 | COLOR TOUCH | demi_permanent | 7/1 | 7/1 | 7 | 60 |  |
| bd925463 | COLOR TOUCH | demi_permanent | 5/1 | 5/1 | 5 | 60 |  |
| bd925463 | ILLUMINA | permanent_color | 6/19 | 6/19 | 6 | 60 |  |
| bd925463 | COLOR TOUCH | demi_permanent | 5/6 | 5/6 | 5 | 60 |  |
| bd925463 | ILLUMINA | permanent_color | 8/1 | 8/1 | 8 | 60 |  |
| bd925463 | KOLESTONE | hair_color_shade | 9/73 | 9/73 | 9 | 60 |  |
| bd925463 | MAGMA | lightener | /17 | /17 |  | 120 |  |
| bd925463 | KOLESTONE | hair_color_shade | 7/71 | 7/71 | 7 | 60 |  |
| bd925463 | ILLUMINA | permanent_color | 8/05 | 8/05 | 8 | 60 |  |
| bd925463 | KOLESTONE | hair_color_shade | 7/2 | 7/2 | 7 | 60 |  |
| bd925463 | KOLESTONE | hair_color_shade | 8/43 | 8/43 | 8 | 60 |  |
| bd925463 | KOLESTONE | hair_color_shade | 6/0 | 6/0 | 6 | 60 |  |
| bd925463 | ILLUMINA | permanent_color | 10/93 | 10/93 | 10 | 60 |  |
| bd925463 | KOLESTONE | hair_color_shade | 10/96 | 10/96 | 10 | 60 |  |
| bd925463 | KOLESTONE | hair_color_shade | 10/04 | 10/04 | 10 | 60 |  |
| bd925463 | COLOR TOUCH | demi_permanent | 7/86 | 7/86 | 7 | 60 |  |
| bd925463 | KOLESTONE COLOR EXPRESS | hair_color_shade | 5/1 | 5/1 | 5 | 60 |  |

## Classification Errors Found In Sample

No machine-detected classification errors found in the 50-record automatic sample.

## Decision

The real Wella baseline has been restored and frozen at 406 automatic / 385 review / 0 unresolved. No Wella shade-rule change is accepted in this report. The next safe step is manual review of the baseline review-by-type breakdown and then isolated, test-first proof for any Wella-only rule change.
