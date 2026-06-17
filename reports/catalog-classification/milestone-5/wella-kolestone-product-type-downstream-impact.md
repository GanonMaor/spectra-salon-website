# Wella KOLESTONE Product Type Downstream Impact

Generated: 2026-06-17T20:05:05.721Z

## Conclusion

Compatible: permanent_color is supported as a shade-bearing, tonal-classification-eligible product type after downstream updates.

## Validation Results

- countIs143: PASS
- allRemainAutomatic: PASS
- allArePermanentColor: PASS
- allShadeBearing: PASS
- allTonalEligible: PASS
- allHaveNormalizedShade: PASS
- allHaveTonalProfile: PASS
- noUnresolvedOrReviewRegression: PASS

## Downstream Findings

- Shared schema / canonical DB: PASS — Database schema stores primary_product_type as TEXT, not an enum. Shared Product Truth TypeScript and normalizer taxonomy now include permanent_color, demi_permanent, acidic_toner, and direct_dye.
- M5 classification model: PASS — Classification output now carries productType separately from shadeBearing and tonalClassificationEligible. All 143 KOLESTONE records have permanent_color + shadeBearing=true + tonalClassificationEligible=true.
- Shade-level / tonal processing: PASS — All 143 records retain normalized shades, numeric levels, and manufacturerSpecific tonalProfile objects.
- UI filters / displays: PASS — Admin Product Database filter and shared product drawers now include detailed color product types. Permanent Color is visible instead of falling through to Other.
- Analytics / reports: PASS — build-color-intelligence-dictionary COLOR_PRODUCT_TYPES now includes permanent_color, demi_permanent, acidic_toner, and direct_dye.
- Hard-coded hair_color_shade checks: PASS — No remaining productType === hair_color_shade or equivalent hard equality checks were found in active code after refactor.
- Known compatibility note: WATCH — Legacy generated POL shade-map artifacts still contain historical hair_color_shade values; they are static historical reports, not Wella M5 production writes.

## Test Coverage

- scripts/lib/m5-classification/__tests__/product-classifier.test.ts: KOLESTONE permanent_color remains shadeBearing and tonalClassificationEligible with tonalProfile.
- scripts/lib/product-catalog/__tests__/canonical-product-truth.test.ts: permanent_color identities remain in shade intelligence with shade decoding fields.

## Impacted KOLESTONE Records

Total impacted records: 143

| ID | Shade | Normalized | Level | Tone | Shade-bearing | Tonal eligible | Tonal profile | Band |
|---|---|---|---|---|---|---|---|---|
| cd579fc7-010f-11ed-9cb4-6045bd925463 | 10/0 | 10/0 | 10 | Natural | yes | yes | yes | automatic |
| cd57a60a-010f-11ed-9cb4-6045bd925463 | 10/00 | 10/00 | 10 | Natural | yes | yes | yes | automatic |
| cd57a91e-010f-11ed-9cb4-6045bd925463 | 10/03 | 10/03 | 10 | Natural | yes | yes | yes | automatic |
| cd57aaaf-010f-11ed-9cb4-6045bd925463 | 10/04 | 10/04 | 10 | Natural | yes | yes | yes | automatic |
| cd5794aa-010f-11ed-9cb4-6045bd925463 | 10/1 | 10/1 | 10 | Ash | yes | yes | yes | automatic |
| cd57970b-010f-11ed-9cb4-6045bd925463 | 10/16 | 10/16 | 10 | Ash | yes | yes | yes | automatic |
| cd57abdc-010f-11ed-9cb4-6045bd925463 | 10/3 | 10/3 | 10 | Gold | yes | yes | yes | automatic |
| cd57aec0-010f-11ed-9cb4-6045bd925463 | 10/31 | 10/31 | 10 | Gold | yes | yes | yes | automatic |
| cd57b0ba-010f-11ed-9cb4-6045bd925463 | 10/38 | 10/38 | 10 | Gold | yes | yes | yes | automatic |
| cd579a9d-010f-11ed-9cb4-6045bd925463 | 10/8 | 10/8 | 10 | Pearl | yes | yes | yes | automatic |
| cd579c38-010f-11ed-9cb4-6045bd925463 | 10/86 | 10/86 | 10 | Pearl | yes | yes | yes | automatic |
| cd579c9b-010f-11ed-9cb4-6045bd925463 | 10/95 | 10/95 | 10 | Cendre | yes | yes | yes | automatic |
| cd579cfc-010f-11ed-9cb4-6045bd925463 | 10/96 | 10/96 | 10 | Cendre | yes | yes | yes | automatic |
| cd579e2e-010f-11ed-9cb4-6045bd925463 | 10/97 | 10/97 | 10 | Cendre | yes | yes | yes | automatic |
| cd57b83f-010f-11ed-9cb4-6045bd925463 | 12/0 | 12/0 | 12 | Natural | yes | yes | yes | automatic |
| cd57b8a3-010f-11ed-9cb4-6045bd925463 | 12/03 | 12/03 | 12 | Natural | yes | yes | yes | automatic |
| cd57b905-010f-11ed-9cb4-6045bd925463 | 12/07 | 12/07 | 12 | Natural | yes | yes | yes | automatic |
| cd57bbf9-010f-11ed-9cb4-6045bd925463 | 12/1 | 12/1 | 12 | Ash | yes | yes | yes | automatic |
| cd57d0c0-010f-11ed-9cb4-6045bd925463 | 12/11 | 12/11 | 12 | Ash | yes | yes | yes | automatic |
| cd57d14c-010f-11ed-9cb4-6045bd925463 | 12/16 | 12/16 | 12 | Ash | yes | yes | yes | automatic |
| cd57d1ae-010f-11ed-9cb4-6045bd925463 | 12/22 | 12/22 | 12 | Matte/Green | yes | yes | yes | automatic |
| cd57d210-010f-11ed-9cb4-6045bd925463 | 12/61 | 12/61 | 12 | Violet | yes | yes | yes | automatic |
| cd57d278-010f-11ed-9cb4-6045bd925463 | 12/81 | 12/81 | 12 | Pearl | yes | yes | yes | automatic |
| cd57d2d3-010f-11ed-9cb4-6045bd925463 | 12/89 | 12/89 | 12 | Pearl | yes | yes | yes | automatic |
| cd57d330-010f-11ed-9cb4-6045bd925463 | 12/96 | 12/96 | 12 | Cendre | yes | yes | yes | automatic |
| cd57a2e0-010f-11ed-9cb4-6045bd925463 | 2/0 | 2/0 | 2 | Natural | yes | yes | yes | automatic |
| cd579b6e-010f-11ed-9cb4-6045bd925463 | 2/8 | 2/8 | 2 | Pearl | yes | yes | yes | automatic |
| cd57a27d-010f-11ed-9cb4-6045bd925463 | 3/0 | 3/0 | 3 | Natural | yes | yes | yes | automatic |
| cd57a8bd-010f-11ed-9cb4-6045bd925463 | 3/00 | 3/00 | 3 | Natural | yes | yes | yes | automatic |
| cd57a21a-010f-11ed-9cb4-6045bd925463 | 4/0 | 4/0 | 4 | Natural | yes | yes | yes | automatic |
| cd57a85b-010f-11ed-9cb4-6045bd925463 | 4/00 | 4/00 | 4 | Natural | yes | yes | yes | automatic |
| cd57e213-010f-11ed-9cb4-6045bd925463 | 4/07 | 4/07 | 4 | Natural | yes | yes | yes | automatic |
| cd57ae57-010f-11ed-9cb4-6045bd925463 | 4/3 | 4/3 | 4 | Gold | yes | yes | yes | automatic |
| cd57eacd-010f-11ed-9cb4-6045bd925463 | 4/71 | 4/71 | 4 | Brown | yes | yes | yes | automatic |
| cd57ec6d-010f-11ed-9cb4-6045bd925463 | 4/75 | 4/75 | 4 | Brown | yes | yes | yes | automatic |
| cd57e85a-010f-11ed-9cb4-6045bd925463 | 4/77 | 4/77 | 4 | Brown | yes | yes | yes | automatic |
| 9e71dd7f-52a8-11ef-8e6b-6045bd925463 | 4/82 | 4/82 | 4 | Pearl | yes | yes | yes | automatic |
| cd57a1b6-010f-11ed-9cb4-6045bd925463 | 5/0 | 5/0 | 5 | Natural | yes | yes | yes | automatic |
| 06cb31f5-c777-11ed-a269-6045bd925463 | 5/00 | 5/00 | 5 | Natural | yes | yes | yes | automatic |
| d053ac06-43b3-11ef-8e6b-6045bd925463 | 5/05 | 5/05 | 5 | Natural | yes | yes | yes | automatic |
| cd57e1a8-010f-11ed-9cb4-6045bd925463 | 5/07 | 5/07 | 5 | Natural | yes | yes | yes | automatic |
| cd5796a8-010f-11ed-9cb4-6045bd925463 | 5/1 | 5/1 | 5 | Ash | yes | yes | yes | automatic |
| 414c187c-b602-11ed-9808-6045bd925463 | 5/18 | 5/18 | 5 | Ash | yes | yes | yes | automatic |
| cd579a3a-010f-11ed-9cb4-6045bd925463 | 5/2 | 5/2 | 5 | Matte/Green | yes | yes | yes | automatic |
| cd57adf5-010f-11ed-9cb4-6045bd925463 | 5/3 | 5/3 | 5 | Gold | yes | yes | yes | automatic |
| cd57b056-010f-11ed-9cb4-6045bd925463 | 5/37 | 5/37 | 5 | Gold | yes | yes | yes | automatic |
| 414bcf4c-b602-11ed-9808-6045bd925463 | 5/4 | 5/4 | 5 | Red/Warm | yes | yes | yes | automatic |
| cd57b7dc-010f-11ed-9cb4-6045bd925463 | 5/41 | 5/41 | 5 | Red/Warm | yes | yes | yes | automatic |
| cd57b4ab-010f-11ed-9cb4-6045bd925463 | 5/43 | 5/43 | 5 | Red/Warm | yes | yes | yes | automatic |
| cd57dc40-010f-11ed-9cb4-6045bd925463 | 5/5 | 5/5 | 5 | Mahogany | yes | yes | yes | automatic |
| cd57e408-010f-11ed-9cb4-6045bd925463 | 5/7 | 5/7 | 5 | Brown | yes | yes | yes | automatic |
| cd57e9e8-010f-11ed-9cb4-6045bd925463 | 5/71 | 5/71 | 5 | Brown | yes | yes | yes | automatic |
| cd57e606-010f-11ed-9cb4-6045bd925463 | 5/73 | 5/73 | 5 | Brown | yes | yes | yes | automatic |
| cd57ec08-010f-11ed-9cb4-6045bd925463 | 5/75 | 5/75 | 5 | Brown | yes | yes | yes | automatic |
| cd57e7f7-010f-11ed-9cb4-6045bd925463 | 5/77 | 5/77 | 5 | Brown | yes | yes | yes | automatic |
| 299a7e91-41dc-11ef-8e6b-6045bd925463 | 5/82 | 5/82 | 5 | Pearl | yes | yes | yes | automatic |
| cd57a155-010f-11ed-9cb4-6045bd925463 | 6/0 | 6/0 | 6 | Natural | yes | yes | yes | automatic |
| cd57a798-010f-11ed-9cb4-6045bd925463 | 6/00 | 6/00 | 6 | Natural | yes | yes | yes | automatic |
| cd57e147-010f-11ed-9cb4-6045bd925463 | 6/07 | 6/07 | 6 | Natural | yes | yes | yes | automatic |
| cd579644-010f-11ed-9cb4-6045bd925463 | 6/1 | 6/1 | 6 | Ash | yes | yes | yes | automatic |
| cd5799d5-010f-11ed-9cb4-6045bd925463 | 6/2 | 6/2 | 6 | Matte/Green | yes | yes | yes | automatic |
| cd57ad90-010f-11ed-9cb4-6045bd925463 | 6/3 | 6/3 | 6 | Gold | yes | yes | yes | automatic |
| cd57b315-010f-11ed-9cb4-6045bd925463 | 6/34 | 6/34 | 6 | Gold | yes | yes | yes | automatic |
| 4400bd37-c1bc-11ee-93c2-6045bd925463 | 6/4 | 6/4 | 6 | Red/Warm | yes | yes | yes | automatic |
| cd57b779-010f-11ed-9cb4-6045bd925463 | 6/41 | 6/41 | 6 | Red/Warm | yes | yes | yes | automatic |
| cd57b445-010f-11ed-9cb4-6045bd925463 | 6/43 | 6/43 | 6 | Red/Warm | yes | yes | yes | automatic |
| cd57da52-010f-11ed-9cb4-6045bd925463 | 6/45 | 6/45 | 6 | Red/Warm | yes | yes | yes | automatic |
| cd57dbdd-010f-11ed-9cb4-6045bd925463 | 6/5 | 6/5 | 6 | Mahogany | yes | yes | yes | automatic |
| cd57e3a5-010f-11ed-9cb4-6045bd925463 | 6/7 | 6/7 | 6 | Brown | yes | yes | yes | automatic |
| cd57e986-010f-11ed-9cb4-6045bd925463 | 6/71 | 6/71 | 6 | Brown | yes | yes | yes | automatic |
| cd57e5a1-010f-11ed-9cb4-6045bd925463 | 6/73 | 6/73 | 6 | Brown | yes | yes | yes | automatic |
| cd57e6cc-010f-11ed-9cb4-6045bd925463 | 6/74 | 6/74 | 6 | Brown | yes | yes | yes | automatic |
| cd57eba2-010f-11ed-9cb4-6045bd925463 | 6/75 | 6/75 | 6 | Brown | yes | yes | yes | automatic |
| cd57e794-010f-11ed-9cb4-6045bd925463 | 6/77 | 6/77 | 6 | Brown | yes | yes | yes | automatic |
| 414c190b-b602-11ed-9808-6045bd925463 | 6/91 | 6/91 | 6 | Cendre | yes | yes | yes | automatic |
| cd579f64-010f-11ed-9cb4-6045bd925463 | 6/97 | 6/97 | 6 | Cendre | yes | yes | yes | automatic |
| f3cfa673-712a-11f0-8e6b-6045bd925463 | 6/98 | 6/98 | 6 | Cendre | yes | yes | yes | automatic |
| cd57a0f3-010f-11ed-9cb4-6045bd925463 | 7/0 | 7/0 | 7 | Natural | yes | yes | yes | automatic |
| cd57a736-010f-11ed-9cb4-6045bd925463 | 7/00 | 7/00 | 7 | Natural | yes | yes | yes | automatic |
| cd579448-010f-11ed-9cb4-6045bd925463 | 7/01 | 7/01 | 7 | Natural | yes | yes | yes | automatic |
| cd57aa4b-010f-11ed-9cb4-6045bd925463 | 7/03 | 7/03 | 7 | Natural | yes | yes | yes | automatic |
| d054ea00-43b3-11ef-8e6b-6045bd925463 | 7/05 | 7/05 | 7 | Natural | yes | yes | yes | automatic |
| cd57e0e5-010f-11ed-9cb4-6045bd925463 | 7/07 | 7/07 | 7 | Natural | yes | yes | yes | automatic |
| cd5795df-010f-11ed-9cb4-6045bd925463 | 7/1 | 7/1 | 7 | Ash | yes | yes | yes | automatic |
| cd579841-010f-11ed-9cb4-6045bd925463 | 7/17 | 7/17 | 7 | Ash | yes | yes | yes | automatic |
| cd5798a5-010f-11ed-9cb4-6045bd925463 | 7/18 | 7/18 | 7 | Ash | yes | yes | yes | automatic |
| cd579970-010f-11ed-9cb4-6045bd925463 | 7/2 | 7/2 | 7 | Matte/Green | yes | yes | yes | automatic |
| cd57ad2b-010f-11ed-9cb4-6045bd925463 | 7/3 | 7/3 | 7 | Gold | yes | yes | yes | automatic |
| cd57af8c-010f-11ed-9cb4-6045bd925463 | 7/31 | 7/31 | 7 | Gold | yes | yes | yes | automatic |
| cd57b2b4-010f-11ed-9cb4-6045bd925463 | 7/34 | 7/34 | 7 | Gold | yes | yes | yes | automatic |
| 1358a7cc-bbc7-11ed-9808-6045bd925463 | 7/36 | 7/36 | 7 | Gold | yes | yes | yes | automatic |
| cd57afef-010f-11ed-9cb4-6045bd925463 | 7/37 | 7/37 | 7 | Gold | yes | yes | yes | automatic |
| cd57b1ec-010f-11ed-9cb4-6045bd925463 | 7/38 | 7/38 | 7 | Gold | yes | yes | yes | automatic |
| 414bcfd4-b602-11ed-9808-6045bd925463 | 7/4 | 7/4 | 7 | Red/Warm | yes | yes | yes | automatic |
| cd57b3e0-010f-11ed-9cb4-6045bd925463 | 7/43 | 7/43 | 7 | Red/Warm | yes | yes | yes | automatic |
| cd57d9ed-010f-11ed-9cb4-6045bd925463 | 7/45 | 7/45 | 7 | Red/Warm | yes | yes | yes | automatic |
| cd57b6b0-010f-11ed-9cb4-6045bd925463 | 7/47 | 7/47 | 7 | Red/Warm | yes | yes | yes | automatic |
| cd57e344-010f-11ed-9cb4-6045bd925463 | 7/7 | 7/7 | 7 | Brown | yes | yes | yes | automatic |
| cd57e924-010f-11ed-9cb4-6045bd925463 | 7/71 | 7/71 | 7 | Brown | yes | yes | yes | automatic |
| cd57e539-010f-11ed-9cb4-6045bd925463 | 7/73 | 7/73 | 7 | Brown | yes | yes | yes | automatic |
| cd57eb39-010f-11ed-9cb4-6045bd925463 | 7/75 | 7/75 | 7 | Brown | yes | yes | yes | automatic |
| cd57e731-010f-11ed-9cb4-6045bd925463 | 7/77 | 7/77 | 7 | Brown | yes | yes | yes | automatic |
| cd57a08f-010f-11ed-9cb4-6045bd925463 | 8/0 | 8/0 | 8 | Natural | yes | yes | yes | automatic |
| cd57a6d2-010f-11ed-9cb4-6045bd925463 | 8/00 | 8/00 | 8 | Natural | yes | yes | yes | automatic |
| cd5793dd-010f-11ed-9cb4-6045bd925463 | 8/01 | 8/01 | 8 | Natural | yes | yes | yes | automatic |
| cd57a9e7-010f-11ed-9cb4-6045bd925463 | 8/03 | 8/03 | 8 | Natural | yes | yes | yes | automatic |
| cd57ab79-010f-11ed-9cb4-6045bd925463 | 8/04 | 8/04 | 8 | Natural | yes | yes | yes | automatic |
| cd57e07b-010f-11ed-9cb4-6045bd925463 | 8/07 | 8/07 | 8 | Natural | yes | yes | yes | automatic |
| cd579576-010f-11ed-9cb4-6045bd925463 | 8/1 | 8/1 | 8 | Ash | yes | yes | yes | automatic |
| 4400bb0c-c1bc-11ee-93c2-6045bd925463 | 8/11 | 8/11 | 8 | Ash | yes | yes | yes | automatic |
| cd57990a-010f-11ed-9cb4-6045bd925463 | 8/2 | 8/2 | 8 | Matte/Green | yes | yes | yes | automatic |
| cd57acc3-010f-11ed-9cb4-6045bd925463 | 8/3 | 8/3 | 8 | Gold | yes | yes | yes | automatic |
| cd57b24f-010f-11ed-9cb4-6045bd925463 | 8/34 | 8/34 | 8 | Gold | yes | yes | yes | automatic |
| cd57b187-010f-11ed-9cb4-6045bd925463 | 8/38 | 8/38 | 8 | Gold | yes | yes | yes | automatic |
| cd57b715-010f-11ed-9cb4-6045bd925463 | 8/41 | 8/41 | 8 | Red/Warm | yes | yes | yes | automatic |
| cd57b379-010f-11ed-9cb4-6045bd925463 | 8/43 | 8/43 | 8 | Red/Warm | yes | yes | yes | automatic |
| cd57d98a-010f-11ed-9cb4-6045bd925463 | 8/45 | 8/45 | 8 | Red/Warm | yes | yes | yes | automatic |
| cd57e2e0-010f-11ed-9cb4-6045bd925463 | 8/7 | 8/7 | 8 | Brown | yes | yes | yes | automatic |
| cd57e8bf-010f-11ed-9cb4-6045bd925463 | 8/71 | 8/71 | 8 | Brown | yes | yes | yes | automatic |
| cd57e4d5-010f-11ed-9cb4-6045bd925463 | 8/73 | 8/73 | 8 | Brown | yes | yes | yes | automatic |
| cd57e668-010f-11ed-9cb4-6045bd925463 | 8/74 | 8/74 | 8 | Brown | yes | yes | yes | automatic |
| cd579dca-010f-11ed-9cb4-6045bd925463 | 8/96 | 8/96 | 8 | Cendre | yes | yes | yes | automatic |
| cd579efe-010f-11ed-9cb4-6045bd925463 | 8/97 | 8/97 | 8 | Cendre | yes | yes | yes | automatic |
| f3d0b447-712a-11f0-8e6b-6045bd925463 | 8/98 | 8/98 | 8 | Cendre | yes | yes | yes | automatic |
| cd57a029-010f-11ed-9cb4-6045bd925463 | 9/0 | 9/0 | 9 | Natural | yes | yes | yes | automatic |
| cd57a66d-010f-11ed-9cb4-6045bd925463 | 9/00 | 9/00 | 9 | Natural | yes | yes | yes | automatic |
| cd579374-010f-11ed-9cb4-6045bd925463 | 9/01 | 9/01 | 9 | Natural | yes | yes | yes | automatic |
| cd57a982-010f-11ed-9cb4-6045bd925463 | 9/03 | 9/03 | 9 | Natural | yes | yes | yes | automatic |
| cd57ab14-010f-11ed-9cb4-6045bd925463 | 9/04 | 9/04 | 9 | Natural | yes | yes | yes | automatic |
| d05456ca-43b3-11ef-8e6b-6045bd925463 | 9/05 | 9/05 | 9 | Natural | yes | yes | yes | automatic |
| cd57950d-010f-11ed-9cb4-6045bd925463 | 9/1 | 9/1 | 9 | Ash | yes | yes | yes | automatic |
| 4400b8d5-c1bc-11ee-93c2-6045bd925463 | 9/11 | 9/11 | 9 | Ash | yes | yes | yes | automatic |
| cd57976e-010f-11ed-9cb4-6045bd925463 | 9/16 | 9/16 | 9 | Ash | yes | yes | yes | automatic |
| cd5797d6-010f-11ed-9cb4-6045bd925463 | 9/17 | 9/17 | 9 | Ash | yes | yes | yes | automatic |
| cd57ac3c-010f-11ed-9cb4-6045bd925463 | 9/3 | 9/3 | 9 | Gold | yes | yes | yes | automatic |
| cd57af24-010f-11ed-9cb4-6045bd925463 | 9/31 | 9/31 | 9 | Gold | yes | yes | yes | automatic |
| cd57b11c-010f-11ed-9cb4-6045bd925463 | 9/38 | 9/38 | 9 | Gold | yes | yes | yes | automatic |
| cd57e277-010f-11ed-9cb4-6045bd925463 | 9/7 | 9/7 | 9 | Brown | yes | yes | yes | automatic |
| cd57e46a-010f-11ed-9cb4-6045bd925463 | 9/73 | 9/73 | 9 | Brown | yes | yes | yes | automatic |
| cd579afe-010f-11ed-9cb4-6045bd925463 | 9/8 | 9/8 | 9 | Pearl | yes | yes | yes | automatic |
| cd579bcf-010f-11ed-9cb4-6045bd925463 | 9/81 | 9/81 | 9 | Pearl | yes | yes | yes | automatic |
| cd579d60-010f-11ed-9cb4-6045bd925463 | 9/96 | 9/96 | 9 | Cendre | yes | yes | yes | automatic |
| cd579e91-010f-11ed-9cb4-6045bd925463 | 9/97 | 9/97 | 9 | Cendre | yes | yes | yes | automatic |

## Final Gate

The 143 KOLESTONE productType changes are downstream-compatible. Wella rulesVersion 1.1.0 can be frozen after review. No production writes have been performed.
