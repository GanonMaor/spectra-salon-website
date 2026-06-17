# Milestone 5 — Dry Run Report: Wella Professionals

**Generated:** 2026-06-17  
**Rules version:** 1.1.0  
**Brand slug:** `wella-professionals`  

> **This is a dry-run report. No database writes have been performed.**

---

## Classification Summary

| Band | Count | Action |
|------|-------|--------|
| Automatic (≥0.95) | 606 | Apply classification |
| Review (0.80–0.94) | 185 | Create review item |
| Unresolved (<0.80) | 0 | Manual review required |
| Parsing failures | 0 | Investigate rule gaps |
| **Total processed** | **791** | |

## Shade System Distribution

| Shade System | Count |
|-------------|-------|
| slash | 514 |
| (none) | 174 |
| alpha | 85 |
| named | 18 |

## Product Type Distribution

## Product Line Distribution

| Product Line | Count |
|-------------|-------|
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

## Review Exception Analysis

| Category | Count |
|----------|-------|
| shade_product_without_numeric_level | 59 |
| treatment_or_care | 40 |
| lightener | 28 |
| named_toner | 25 |
| developer | 18 |
| alpha_shade_code | 13 |
| bond_builder | 2 |

Safely resolvable with deterministic rules: 101.  
Partially resolvable as separate ontology work: 25.  
Keep review: 59.

| Product Type | Count |
|-------------|-------|
| permanent_color | 319 |
| demi_permanent | 211 |
| hair_color_shade | 117 |
| acidic_toner | 53 |
| lightener | 47 |
| treatment_care | 29 |
| developer_oxidant | 12 |
| bond_builder | 2 |
| lightener_bleach | 1 |

## Duplicate Candidates (within same manufacturer)

No duplicate candidates detected.

## Cross-Brand Safety Check

PASS — No cross-brand safety violations detected.

All tonal profiles are marked `manufacturerSpecific: true`.  
No classification result can trigger a `same_commercial_sku` merge across manufacturers.

## Sample: Automatic Classifications (first 10)

| ID | Series | Shade Raw | Normalized | Level | Primary Tone | Type | Confidence |
|----|--------|-----------|------------|-------|-------------|------|------------|
| bd925463 | BLONDOR | /05 | /05 |  | Natural | lightener | 0.97 |
| bd925463 | BLONDOR | /16 | /16 |  | Ash | lightener | 0.99 |
| bd925463 | BLONDOR | /36 | /36 |  | Gold | lightener | 0.99 |
| bd925463 | BLONDOR | /81 | /81 |  | Pearl | lightener | 0.99 |
| bd925463 | BLONDOR | /86 | /86 |  | Pearl | lightener | 0.99 |
| bd925463 | BLONDOR | /96 | /96 |  | Cendre | lightener | 0.99 |
| bd925463 | BLONDOR | /97 | /97 |  | Cendre | lightener | 0.99 |
| bd925463 | BLONDOR | Lightest Natural | LIGHTEST NATURAL |  | Natural | lightener | 0.99 |
| bd925463 | CHARM COLOR DEMI | 10A | 10A | 10 | Ash | demi_permanent | 0.97 |
| bd925463 | CHARM COLOR DEMI | 1N | 1N | 1 | Natural | demi_permanent | 0.97 |

## Sample: Review Items (first 10)

| ID | Series | Shade | Level | Type | Confidence | Issues |
|----|--------|-------|-------|------|------------|--------|
| bd925463 | BLONDOR | Blond Beige |  | lightener | 0.89 |  |
| bd925463 | BLONDOR | Blonde Seal & Care |  | lightener | 0.89 |  |
| bd925463 | BLONDOR | Brass Kicker |  | lightener | 0.89 |  |
| bd925463 | BLONDOR | Lightest Pearl |  | lightener | 0.92 |  |
| bd925463 | BLONDOR | Pale Amethyst |  | lightener | 0.89 |  |
| bd925463 | BLONDOR | Pale Platinum Toner |  | lightener | 0.89 |  |
| bd925463 | BLONDOR | Pale Silver |  | lightener | 0.94 |  |
| bd925463 | BLONDOR | TREATMENT |  | lightener | 0.89 |  |
| bd925463 | BLONDOR BLEACH | BLONDOR |  | lightener | 0.89 |  |
| bd925463 | BLONDOR BLEACH | BLONDOR 400g |  | lightener | 0.89 |  |

## Sample: Unresolved Records (first 10)

(none)

## Random Validation Sample: 50 Automatic Classifications

This deterministic random sample is for manual validation. Errors are heuristic checks; empty means no machine-detected classification issue.

| ID | Product Line | Type | Shade | Normalized | Package | Confidence | Errors |
|----|--------------|------|-------|------------|---------|------------|--------|
| bd925463 | SHINEFINITY | acidic_toner | 09/36 | 9/36 | 60g | 0.99 |  |
| bd925463 | COLOR TOUCH | demi_permanent | 8/73 | 8/73 | 60g | 0.99 |  |
| bd925463 | CHARM COLOR PERMANENT LIQUID COLOR | permanent_color | 6RV | 6RV | 42g | 0.97 |  |
| bd925463 | MAGMA | lightener | /39 | /39 | 120g | 0.99 |  |
| bd925463 | KOLESTONE | permanent_color | 9/31 | 9/31 | 60g | 0.99 |  |
| bd925463 | KOLESTONE | permanent_color | 9/8 | 9/8 | 60g | 0.99 |  |
| bd925463 | COLOR TOUCH | demi_permanent | R12/06 | R12/06 | 60g | 0.97 |  |
| bd925463 | COLOR TOUCH RELIGHTS | demi_permanent | /03 | /03 | 60g | 0.99 |  |
| bd925463 | KOLESTONE | permanent_color | 44/44 | 44/44 | 60g | 0.99 |  |
| bd925463 | COLOR TOUCH | demi_permanent | /0 | /0 | 60g | 0.97 |  |
| bd925463 | KOLESTONE | permanent_color | 12/89 | 12/89 | 60g | 0.99 |  |
| bd925463 | KOLESTONE | permanent_color | 5/1 | 5/1 | 60g | 0.99 |  |
| bd925463 | SHINEFINITY | acidic_toner | 06/73 | 6/73 | 60g | 0.99 |  |
| bd925463 | COLOR TOUCH | demi_permanent | 2/8 | 2/8 | 60g | 0.99 |  |
| bd925463 | KOLESTONE | permanent_color | 99/0 | 99/0 | 60g | 0.99 |  |
| bd925463 | COLOR TOUCH PLUS | demi_permanent | 66/07 | 66/07 | 60g | 0.99 |  |
| bd925463 | KOLESTONE | permanent_color | 0/11 | 0/11 | 60g | 0.99 |  |
| bd925463 | CHARM COLOR PERMANENT LIQUID COLOR | permanent_color | 12N | 12N | 42g | 0.97 |  |
| bd925463 | CHARM COLOR PERMANENT LIQUID COLOR | permanent_color | 12A | 12A | 42g | 0.97 |  |
| bd925463 | COLOR TOUCH PLUS | demi_permanent | 55/05 | 55/05 | 60g | 0.97 |  |
| bd925463 | KOLESTONE | permanent_color | 8/1 | 8/1 | 60g | 0.99 |  |
| bd925463 | COLOR TOUCH | demi_permanent | /56 | /56 | 60g | 0.99 |  |
| bd925463 | COLOR FRESH | hair_color_shade | /5 | /5 | 250g | 0.99 |  |
| bd925463 | KOLESTONE | permanent_color | 77/46 | 77/46 | 60g | 0.99 |  |
| bd925463 | KOLESTONE | permanent_color | 8/96 | 8/96 | 60g | 0.99 |  |
| bd925463 | COLOR TOUCH | demi_permanent | 77/03 | 77/03 | 60g | 0.97 |  |
| bd925463 | KOLESTONE | permanent_color | 8/2 | 8/2 | 60g | 0.99 |  |
| bd925463 | KOLESTONE | permanent_color | 6/73 | 6/73 | 60g | 0.99 |  |
| bd925463 | KOLESTONE | permanent_color | 9/96 | 9/96 | 60g | 0.99 |  |
| bd925463 | COLOR TOUCH | demi_permanent | 8/38 | 8/38 | 60g | 0.99 |  |
| bd925463 | ILLUMINA | permanent_color | 9/19 | 9/19 | 60g | 0.99 |  |
| bd925463 | KOLESTONE | permanent_color | 0/00 | 0/00 | 60g | 0.99 |  |
| bd925463 | CHARM COLOR PERMANENT LIQUID COLOR | permanent_color | 3N | 3N | 42g | 0.97 |  |
| bd925463 | KOLESTONE | permanent_color | 7/05 | 7/05 | 60g | 0.99 |  |
| bd925463 | KOLESTONE | permanent_color | 10/97 | 10/97 | 60g | 0.99 |  |
| bd925463 | COLOR TOUCH | demi_permanent | 7/71 | 7/71 | 60g | 0.99 |  |
| bd925463 | KOLESTONE | permanent_color | 10/31 | 10/31 | 60g | 0.99 |  |
| bd925463 | SHINEFINITY | acidic_toner | 07/39 | 7/39 | 60g | 0.99 |  |
| bd925463 | KOLESTONE | permanent_color | 6/3 | 6/3 | 60g | 0.99 |  |
| bd925463 | KOLESTONE | permanent_color | 7/07 | 7/07 | 60g | 0.99 |  |
| bd925463 | KOLESTONE | permanent_color | 7/77 | 7/77 | 60g | 0.99 |  |
| bd925463 | MAGMA | lightener | /36 | /36 | 120g | 0.99 |  |
| bd925463 | SHINEFINITY | acidic_toner | 06/07 | 6/07 | 60g | 0.99 |  |
| bd925463 | CHARM COLOR PERMANENT LIQUID COLOR | permanent_color | 7WR | 7WR | 42g | 0.97 |  |
| bd925463 | CHARM COLOR PERMANENT LIQUID COLOR | permanent_color | 6A | 6A | 42g | 0.97 |  |
| bd925463 | COLOR FRESH | hair_color_shade | /8 | /8 | 250g | 0.99 |  |
| bd925463 | KOLESTONE | permanent_color | 7/73 | 7/73 | 60g | 0.99 |  |
| bd925463 | COLOR TOUCH | demi_permanent | 9/96 | 9/96 | 60g | 0.99 |  |
| bd925463 | COLOR TOUCH | demi_permanent | 0/00 | 0/00 | 60g | 0.99 |  |
| bd925463 | COLOR TOUCH | demi_permanent | 7/1 | 7/1 | 60g | 0.99 |  |

## Classification Errors Found In Sample

No machine-detected classification errors found in the 50-record automatic sample.

---

## Approval Gate

Review this report carefully before approving any production writes.

To approve and run for a specific manufacturer:

```bash
# 1. Verify samples look correct above
# 2. Approve rules in manufacturer-rules.js if adjustments needed
# 3. Only then proceed to a controlled write batch
```
