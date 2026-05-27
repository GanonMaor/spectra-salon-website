/* eslint-disable @typescript-eslint/no-var-requires */
const url = require("../url-extractor");

const SHOPIFY_FIXTURE = `
<html><head>
<title>Adore Semi Permanent Hair Color</title>
<meta property="og:title" content="Adore Semi-Permanent Hair Color"/>
<meta property="og:description" content="Direct dye, 23 shades, no developer needed"/>
<script type="application/ld+json">
{
  "@type":"Product",
  "name":"Adore Semi Permanent Hair Color",
  "brand":{"@type":"Brand","name":"Adore"},
  "hasVariant":[
    {"@type":"Product","name":"Aquamarine","gtin13":"4710017540014"},
    {"@type":"Product","name":"Magenta","gtin13":"4710017540021"},
    {"@type":"Product","name":"Ocean Blue"}
  ]
}
</script>
<script id="ProductJson-product-template" type="application/json">
{
  "title":"Adore Semi Permanent Hair Color",
  "variants":[
    {"option1":"Aquamarine","barcode":"4710017540014"},
    {"option1":"Magenta","barcode":"4710017540021"},
    {"option1":"Ocean Blue","barcode":""}
  ]
}
</script>
</head><body>
<span data-value="Lavender">Lavender</span>
</body></html>
`;

describe("url-extractor", () => {
  it("parses JSON-LD product variants", () => {
    const out = url.parseUrlPayload({
      url: "https://supersistersbeauty.com/products/adore",
      html: SHOPIFY_FIXTURE,
    });
    expect(out.ok).toBe(true);
    expect(out.rows.length).toBeGreaterThanOrEqual(3);
    const shades = out.rows.map((r: any) => r.shade);
    expect(shades).toEqual(
      expect.arrayContaining(["AQUAMARINE", "MAGENTA", "OCEAN BLUE"]),
    );
    expect(out.rows[0].brand).toBe("ADORE");
    expect(out.evidence.title).toMatch(/Adore/);
    expect(out.evidence.barcodeCandidates).toEqual(
      expect.arrayContaining(["4710017540014", "4710017540021"]),
    );
  });

  it("supports skipFetch with htmlByUrl for tests", async () => {
    const res = await url.extractFromUrls(
      ["https://example.com/x"],
      { skipFetch: true, htmlByUrl: { "https://example.com/x": SHOPIFY_FIXTURE } },
    );
    expect(res.rows.length).toBeGreaterThanOrEqual(3);
    expect(res.warnings).toEqual([]);
    expect(res.webCalls).toBe(0);
  });

  it("detects brand from URL host", () => {
    expect(url.brandFromUrl("https://kenra.com/products/x")).toBe("KENRA");
    expect(url.brandFromUrl("https://framesi.com/x")).toBe("FRAMESI");
    expect(url.brandFromUrl("https://supersistersbeauty.com/x")).toBe("");
  });

  it("emits a placeholder when there are no variants", () => {
    const out = url.parseUrlPayload({
      url: "https://example.com/foo",
      html:
        "<html><head><title>Pulp Riot Direct Dye</title></head><body></body></html>",
    });
    expect(out.rows).toHaveLength(1);
    expect(out.rows[0].shade).toBe("");
    expect(out.rows[0].brand).toBe("PULP RIOT");
  });
});
