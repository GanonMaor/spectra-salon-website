# Investor presentation — recomposition report

The editorial story, copy, data, chapter order and visual language are unchanged.
Only the PDF/presentation layout was rebuilt, plus one explicit financing correction.

## What changed structurally

The web route stays a continuous editorial page. `?pdf=1` now renders a separate
deck of 17 fixed 16:9 canvases, so page breaks are composed rather than produced by
browser pagination. Nothing is scaled down from the webpage: the deck has its own
type scale, every step of which is larger than the web equivalent.

| Artifact | Geometry |
| --- | --- |
| PDF | 17 pages, MediaBox 1440 x 810 pt (20in x 11.25in, exact 16:9) |
| PNG slides | 17 frames, 1920 x 1080 each |
| Contact sheet | assembled from the exported PNGs, so it cannot drift from the PDF |

## Slides recomposed substantially

**03 Color Intelligence.** Split into two bands so the product composition is the
primary visual and the four-customer contact sheet is clearly secondary rather
than competing with it.

**05 Data layer.** Was four stacked bands that overflowed. The service-event
figure and the pull quote are now paired in one left column, the accumulation
chart runs full width as the dominant visual, and the vantage comparison, scale
metrics and compounding line became supporting evidence beneath it.

**06 Six-salon evidence.** Rebuilt as five deliberate bands with `65% Brunette`
leading. Shade consumption, sample totals, the colour-change figure and both
audience columns are all subordinate. Both caveats remain visible.

**07 Strategic decision and Booking.** The largest change. The live booking
calendar was previously cropped to roughly a quarter of its height. It is now a
single scaled plate at 1192 x 560 with the entire product surface visible and
nothing cut. The service-capacity timeline moved from a full-width strip beneath
the calendar to a right-hand column, so the slide reads as "the day" beside "the
anatomy of one service". The released 60-minute window is the only green element
on the slide. `LiveClientsVertical` was dropped from this slide: it could not be
shown at full height beside the calendar without cropping one of them, and the
capacity column now carries the same idea.

**08 Salon economics.** Four economics figures on one hairline row, then the
category chart beside a four-row service table, then the closing line. Category
labels use the short CRM forms so the chart axis no longer runs together.

**12 Salon AI.** Headline and phone visual now dominate, with the context terms,
the Signal to Action flow, the three examples and the agent credit line arranged
to scan top to bottom in one column.

**13 Opportunity.** Given more scale: the three-panel diagram (salons / Spectra
operating data layer / industry) is now a real graphic band with the centre panel
inverted, so the two sides of the opportunity read immediately.

**15 GTM and expansion economics.** `$40K -> 96 paying salons` is the primary
visual story at the top; the 1,476 / 301 / 96 funnel is the supporting mechanism;
unit economics and the `$960 -> $4,860` ladder follow as second and third
stories. Every caveat stays adjacent to the figures it qualifies.

**16 Raise.** Reordered to presentation order: `$600K` dominates, then
Build / Prove / Grow, then financing context, then the conditional next round.
The financing progression and the `$3M-$5M` panel are now side by side, which is
what made the slide fit without shrinking anything. Legal qualification is a
single true small-print line.

**17 Closing.** The middle band was stranded between two masses. Kicker, headline
and the body/ask pair are now one block, with the signoff as the only other mass.

## PDF-specific rendering fixes

Two problems appeared only in the PDF, not in the PNG frames, so they are worth
recording:

- **09 Owner mobile** used a large blurred `box-shadow` on the phone plate.
  Chromium rasterizes that into the PDF as a hard grey block sitting behind and
  below the plate, which read as a grey mat crowding the caption. Replaced with a
  hairline border, consistent with the rest of the deck. No slide in the deck
  uses a soft shadow now.
- **10 Client mobile** letterboxed: the plate aspect did not match the 1448 x 1086
  source, so `object-fit: contain` left white strips beside the phones. The plate
  is now derived from the source ratio, so the image fills it exactly.

Both were verified by rasterizing the individual PDF pages, not only the PNG
exports.

## Financing correction (the one content change)

`FINAL_RAISE.context` in
[`finalCopy.ts`](../../src/screens/ExternalInvestorUpdate/finalCopy.ts) no longer
implies the `$1M` agreement capacity is added to the `$4.25M` valuation. It now
carries:

- `$1M+ raised to date` as separate historical company context
- a rounded instrument progression: `$4.25M` starting point, `~$4.65M` current
  implied level, `~$5.25M` after the full `$600K` extension
- a note that roughly `$400K` is already invested and up to `$600K` can still
  enter on the same terms

Because this is the canonical source, the same correction appears on the
continuous web page. `CapitalExpansionSection` in
[`ExternalInvestorIntelligenceSections.tsx`](../../src/screens/ExternalInvestorUpdate/ExternalInvestorIntelligenceSections.tsx)
was updated to the new shape.

## QA

`qa-report.json` is written on every export and the export fails if any check
fails. Current state: all 17 slides pass.

- 17 slides, each exactly 1920 x 1080
- no element crosses the safe area on any slide
- no horizontal document overflow
- no broken or unloaded media
- no console or page errors during capture
- fonts explicitly loaded before capture, not just `fonts.ready`

The scroll-height backstop carries a 4px tolerance because a composition that
fits still reports two to four pixels of sub-pixel line-box rounding. The
per-element safe-area check has no tolerance and is the real gate.

Web regression, checked at 375 / 768 / 1440 in English and Hebrew: 17 sections
render, `dir` flips to `rtl` correctly, no horizontal overflow, no broken images,
no console errors, and the deck does not render on the normal route.

## Regenerate

```bash
npm run export:investor-presentation
```
