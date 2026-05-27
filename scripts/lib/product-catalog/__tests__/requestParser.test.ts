/* eslint-disable @typescript-eslint/no-var-requires */
const parser = require("../request-parser");

const DIANA_REQUEST = `
-kenra SA rapid toners

-wella color touch 1.9% 6 volume gallon (quick add for all color services + toner services )

- paul mitchell 5vol CLEAR developer (for all toner & color services )

- for the "pre toner" services are you able to add certain colors to the quick add ? ( all kenra rapid toners .. SA , SV, B , ROV )

- Framesi framcolor glamour (6.61, 7.61, 5.61, 8.61) all the .61 plz

- ADORE COLOR (direct dye) adore colors ^ https://supersistersbeauty.com/products/adore-semi-permanent-hair-color?srsltid=AfmBOormN289L25V8U_KXl-VshF_9cJcZJDF9xa3WDNydyyo3GQvyrjv and these as well plz

- can you also add all the danger jones & pulpriot ? ( i know we have some but not all are in there)

- paul mitchell COLOR WAYS ION COLOR brilliance ^^
`;

describe("request-parser", () => {
  it("splits bullets", () => {
    const bullets = parser.splitIntoBullets(DIANA_REQUEST);
    expect(bullets.length).toBeGreaterThanOrEqual(7);
    expect(bullets[0]).toMatch(/kenra/i);
  });

  it("extracts URLs", () => {
    const links = parser.extractLinks(DIANA_REQUEST);
    expect(links).toHaveLength(1);
    expect(links[0]).toMatch(/supersistersbeauty\.com/);
    expect(links[0]).not.toMatch(/[)]$/);
  });

  it("identifies Kenra rapid toners and shades", () => {
    const out = parser.parseRequestText("- all kenra rapid toners .. SA, SV, B, ROV");
    const shades = out.rows.map((r: any) => r.shade).sort();
    expect(out.rows[0].brand).toBe("KENRA");
    expect(out.rows[0].series).toBe("RAPID TONER");
    expect(shades).toEqual(["B", "ROV", "SA", "SV"]);
  });

  it("captures Framesi .61 numeric shades", () => {
    const out = parser.parseRequestText(
      "- Framesi framcolor glamour (6.61, 7.61, 5.61, 8.61) all the .61 plz",
    );
    const shades = out.rows.map((r: any) => r.shade).sort();
    expect(shades).toEqual(["5.61", "6.61", "7.61", "8.61"]);
    expect(out.rows[0].brand).toBe("FRAMESI");
    expect(out.rows[0].series).toBe("FRAMCOLOR GLAMOUR");
    expect(out.rows[0]._notes).toMatch(/all \.?61/i);
  });

  it("flags quick-add intent and service context", () => {
    const out = parser.parseRequestText(
      "-wella color touch 1.9% 6 volume gallon (quick add for all color services + toner services )",
    );
    expect(out.rows[0].brand).toBe("WELLA");
    expect(out.rows[0].series).toBe("COLOR TOUCH");
    expect(out.rows[0]._quickAdd).toBe(true);
    expect(["color", "toner"]).toContain(out.rows[0]._serviceContext);
    expect(out.rows[0]._strength).toMatchObject({ strength: "1.9%", volume: 6 });
  });

  it("handles paul mitchell developer", () => {
    const out = parser.parseRequestText(
      "- paul mitchell 5vol CLEAR developer (for all toner & color services )",
    );
    expect(out.rows.length).toBeGreaterThanOrEqual(1);
    expect(out.rows[0].brand).toBe("PAUL MITCHELL");
    expect(out.rows[0].type).toBe("developer");
    const shades = out.rows.map((r: any) => r.shade);
    expect(shades).toEqual(expect.arrayContaining(["CLEAR"]));
  });

  it("treats Adore as direct-dye and registers a needs-review row", () => {
    const out = parser.parseRequestText("- ADORE COLOR (direct dye)");
    expect(out.rows[0].brand).toBe("ADORE");
    expect(out.rows[0].series).toBe("ADORE COLOR");
    expect(out.rows[0].type).toBe("direct-dye");
    expect(out.rows[0]._notes).toMatch(/missing|review/i);
  });

  it("registers Danger Jones / Pulp Riot brands without shades", () => {
    const out = parser.parseRequestText(
      "- can you also add all the danger jones & pulpriot ?",
    );
    const brands = out.rows.map((r: any) => r.brand).sort();
    // Heuristic: at least one brand row even when no shades are given.
    expect(brands.length).toBeGreaterThanOrEqual(1);
  });

  it("returns annotated bullets for the customer_request_summary sheet", () => {
    const out = parser.parseRequestText(DIANA_REQUEST);
    expect(out.bullets.length).toBeGreaterThanOrEqual(7);
    expect(out.bullets[0]).toHaveProperty("brand");
    expect(out.bullets[0]).toHaveProperty("shades");
    expect(out.detectedBrands).toEqual(
      expect.arrayContaining(["KENRA", "WELLA", "PAUL MITCHELL", "FRAMESI", "ADORE"]),
    );
    expect(out.quickAddIntents).toBeGreaterThanOrEqual(2);
  });
});
