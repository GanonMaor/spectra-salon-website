# Pol Customer Usage Shade Map

This folder contains a first normalized map of every `Brand + Series + Shade`
combination found in the Israeli customer usage report.

## Outputs

- `shade-inventory.json` — raw inventory of all unique `brand`, `series`, `shade` combinations from the product rows, including grams, row counts, customers, and top services.
- `pol-shade-map.json` — enriched classification map with product type, color line, technology, level, tone/reflect, developer strength, and confidence.
- `pol-shade-map.csv` — spreadsheet-friendly version for review with Paul or domain experts.

## Coverage

The current generated map covers all 624 unique `Brand + Series + Shade`
combinations in the report.

Product type breakdown:

- `hair_color_shade`: professional color shades and shade-like identifiers.
- `developer_oxidant`: cream developer, oxidant, peroxide, Diactivator, and related activators.
- `lightener_bleach`: bleach, Blond Studio, high lift, platinum, and lightening products.
- `bond_builder`: Olaplex, bonder, and color/lightening support additives.
- `treatment_care`: keratin, Botox, smoothing, treatment, and care products.
- `mixer_corrector`: direct tone, mix tone, corrector, clear, blue/green/red/violet additives, and tonal boosters.

## Method

The map first classifies product type, then decodes color shades where possible.
This is important because many values in the `Shade` column are not shades at
all. Examples include:

- `6% 20 Vol.` — developer / oxidant.
- `4.5% 15 Vol.` — low-volume Diactivator.
- `PLATINIUM P7` — lightener.
- `9 BONDER IN` — bond-building/lightening support.
- `KERATIN` — treatment.
- `MM VERT (GREEN)` — mixer / corrector.

For numeric color shades, the script decodes:

- level/depth, such as `6` = dark blonde and `10` = lightest blonde.
- primary and secondary reflects, such as `.1` ash, `.3` gold, `.4` copper.
- color family, such as blonde, brown/dark blonde, or dark brown/black.

## Reference Systems Used

- L'Oréal Professionnel international dot system: `level.reflect`, e.g. `7.43`.
- L'Oréal Dia Light / Dia Color: demi-permanent ranges using Diactivator.
- Wella: slash notation, e.g. `7/1`.
- Schwarzkopf IGORA: dash notation, e.g. `7-57`.
- Matrix: numeric and alpha-numeric systems, e.g. `10G`, `.3`, `.4`.
- Keune Tinta: decimal reflect system.
- Developer volume conventions: 10/20/30/40 vol and 1.8%/2.7%/4.5%/6%/9%/12%.

## Notes

This is a pragmatic intelligence map for analysis and presentation. It should
be treated as a strong first-pass classification, not as a manufacturer-certified
technical chart. Edge cases should be reviewed with a professional colorist or
the relevant brand chart before being used in operational recommendations.
