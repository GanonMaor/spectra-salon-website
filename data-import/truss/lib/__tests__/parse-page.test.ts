/* eslint-disable @typescript-eslint/no-var-requires */
const { parsePageText, parseSize, parseShade } = require("../parse-page");

describe("TRUSS page parser", () => {
  it("parses a CARE Basic Conditioner page", () => {
    const text = `
CARE                              BASIC
          BASIC >> CONDITIONER >> TRS-8557
■■■■■■■                       BASIC CONDITIONER 2400ML
`;
    const rec = parsePageText(text, 1);
    expect(rec.division).toBe("CARE");
    expect(rec.product_line).toBe("BASIC");
    expect(rec.category).toBe("CONDITIONER");
    expect(rec.trs_code).toBe("TRS-8557");
    expect(rec.size_value).toBe(2400);
    expect(rec.size_unit).toBe("ML");
    expect(rec.product_type).toBe("conditioner");
    expect(rec.professional_or_retail).toBe("professional");
  });

  it("parses a COLOR toner shade", () => {
    const text = `
COLOR                           TONER
          TONER >> HAIR COLOR >> TRS-7459
■■■■■■■     TONER - 10.72 LIGHTEST BURGANDY BLONDE 60G
`;
    const rec = parsePageText(text, 103);
    expect(rec.division).toBe("COLOR");
    expect(rec.trs_code).toBe("TRS-7459");
    expect(rec.shade_code).toBe("10.72");
    expect(rec.permanent_type).toBe("toner");
    expect(rec.size_unit).toBe("G");
  });

  it("parses size and shade helpers", () => {
    expect(parseSize("BASIC SHAMPOO 300ML")).toEqual({
      size_value: 300,
      size_unit: "ML",
      size_display: "300ML",
    });
    const shade = parseShade("PERMANENT - 8.0 NATURAL 60G", "PERMANENT");
    expect(shade.shade_code).toBe("8.0");
    expect(shade.permanent_type).toBe("permanent");
  });
});
