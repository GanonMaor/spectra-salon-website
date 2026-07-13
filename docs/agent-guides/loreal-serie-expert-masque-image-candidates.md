# L'Oréal Professionnel Serie Expert Masque Image Candidates

Prepared 2026-07-14 for visual and licensing review. These are **candidate
derivatives only**, not approved catalog assets: the retailer sources below do
not provide verified reuse or derivative-image rights. Do not publish or use
them in the application until rights and visual approval are recorded.

All saved candidates use the jar/compact playbook:

- Source image response was checked as an actual PNG/JPEG by magic bytes and
  decoded with Pillow before processing; no HTML or Cloudflare response was
  saved as an image.
- Background and detached reflections were removed without changing label
  artwork, lid shape, rims, or package profile.
- Each output is an RGBA PNG on an 800 × 800 transparent canvas. The visible
  alpha box was proportionally scaled to fit 640 × 480 px and its physical
  lowest edge aligned to `y = 610`.
- Product/line, EAN, 500 ml size, jar type, lid, and label were checked against
  the source product listing and visible package label.

| Catalog UUID | Canonical product / EAN | Candidate path | Direct source URL | Source type | Image verification and quality | Approval status |
| --- | --- | --- | --- | --- | --- | --- |
| `eb5eca2d-5c11-11ef-8e6b-6045bd925463` | Absolut Repair Masque 500 ml — `3474636975440` | `public/catalog-products/loreal-professionnel/eb5eca2d-5c11-11ef-8e6b-6045bd925463.png` | https://www.ravanelloeshop.it/pimages/L-Oreal-Professionnel-Absolut-Repair-Maschera-Riparazione-Istant-small-35490-983.png | Retailer product asset (Ravanello eShop); reuse rights not verified | Fetched as `image/png` (PNG signature), decoded source 375 × 400 RGBA. Export verified as 800 × 800 RGBA PNG; visible alpha box 564 × 480 px, centered horizontally, baseline `y=610`. Label and 500 ml marking are legible; clean rim/lid and no white rectangle. | **Pending visual and licensing approval** |
| `c1164555-46d8-11ef-8e6b-6045bd925463` | Inforcer Masque 500 ml — `3474636975235` | `public/catalog-products/loreal-professionnel/c1164555-46d8-11ef-8e6b-6045bd925463.png` | https://www.kappersonly.nl/14113-large_default/l-oreal-professionnel-inforcer-mask-500-ml.jpg | Retailer product asset (Kappers Only); reuse rights not verified | Fetched as `image/jpeg` (JFIF signature), decoded source 458 × 458. Export verified as 800 × 800 RGBA PNG; visible alpha box 496 × 480 px, centered horizontally, baseline `y=610`. Correct coral jar, black lid, Inforcer/B6 + Biotin label, and 500 ml marking are visible. | **Pending visual and licensing approval** |
| `c1188f81-46d8-11ef-8e6b-6045bd925463` | Pro Longer Masque 500 ml — `3474636975402` | `public/catalog-products/loreal-professionnel/c1188f81-46d8-11ef-8e6b-6045bd925463.png` | https://www.kappersonly.nl/14319-large_default/loreal-professionnel-pro-longer-lengths-renewing-mask-500ml.jpg | Retailer product asset (Kappers Only); reuse rights not verified | Fetched as `image/jpeg` (JFIF signature), decoded source 458 × 458. Export verified as 800 × 800 RGBA PNG; visible alpha box 499 × 480 px, centered horizontally, baseline `y=610`. Correct pink jar, black lid, Pro Longer label, and 500 ml marking are visible. A first retailer candidate was rejected because its visible label read 250 ml. | **Pending visual and licensing approval** |
| `c1192c8f-46d8-11ef-8e6b-6045bd925463` | Vitamino Color Masque 500 ml — `3474636975686` | `public/catalog-products/loreal-professionnel/c1192c8f-46d8-11ef-8e6b-6045bd925463.png` | https://www.kappersonly.nl/14114-large_default/loreal-professionnel-vitamino-color-mask-for-colour-treated-hair-500ml.jpg | Retailer product asset (Kappers Only); reuse rights not verified | Fetched as `image/jpeg` (JFIF signature), decoded source 458 × 458. Export verified as 800 × 800 RGBA PNG; visible alpha box 493 × 480 px, centered horizontally, baseline `y=610`. Correct pale-pink jar, black lid, Resveratrol/Vitamino Color label, and 500 ml marking are visible. | **Pending visual and licensing approval** |

## Rejected catalog-record mismatch

No image was saved for catalog UUID
`272002ac-9828-11ef-8e6b-6045bd925463` (named “Resveratrol Masque 400 ml” in
the request). Its supplied EAN, `3474636975884`, resolves instead to the
**Vitamino Color Acidic Sealer, 400 ml**, a liquid treatment in a bottle—not a
masque jar. This is confirmed on the L'Oréal Partner Shop product page:
https://sg.lorealpartnershop.com/en_SG/SG3474636975884.html

Because package type and product name conflict, a jar/compact-normalized PNG
would violate the image playbook. Resolve the catalog identity (correct EAN or
canonical product name/package type) before sourcing a candidate.

## Source-page identity checks

The image candidates above were linked from product pages that state the same
EAN and 500 ml product:

- Absolut Repair: https://www.ravanelloeshop.it/en/l-oreal-professionnel-absolut-repair-instant-resurfacing-mask-500ml/
- Inforcer: https://www.kappersonly.nl/en/masks/12265-l-oreal-professionnel-inforcer-mask-500-ml-3474636975235.html
- Pro Longer: https://www.kappersonly.nl/en/masks/12462-loreal-professionnel-pro-longer-lengths-renewing-mask-500ml-3474636975402.html
- Vitamino Color: https://www.kappersonly.nl/en/masks/12266-loreal-professionnel-vitamino-color-mask-for-colour-treated-hair-500ml-3474636975686.html
