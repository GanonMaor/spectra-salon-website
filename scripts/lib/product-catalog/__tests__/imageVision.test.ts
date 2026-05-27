/* eslint-disable @typescript-eslint/no-var-requires */
const vision = require("../image-vision");

describe("image-vision", () => {
  it("infers brand/series from filename hints", () => {
    expect(vision.inferHintFromName("adore-shelf.png").brand).toBe("ADORE");
    expect(vision.inferHintFromName("pulp-riot-shelf.jpg").brand).toBe("PULP RIOT");
    expect(vision.inferHintFromName("paul mitchell color ways.png").brand).toBe("PAUL MITCHELL");
  });

  it("returns placeholder rows + warnings when OPENAI_API_KEY is missing", async () => {
    const out = await vision.extractFromImages(
      [{ name: "adore.png", base64: "ZmFrZQ==", mime: "image/png" }],
      { apiKey: "" },
    );
    expect(out.visionCalls).toBe(0);
    expect(out.rows).toHaveLength(1);
    expect(out.rows[0].brand).toBe("ADORE");
    expect(out.warnings.some((w: any) => w.code === "VISION_DISABLED")).toBe(true);
  });

  it("uses an injected fetchImpl with strict-JSON response", async () => {
    const fetchImpl = jest.fn().mockResolvedValue({
      ok: true,
      rows: [
        {
          brand: "ADORE",
          series: "ADORE COLOR",
          shade: "AQUAMARINE",
          type: "direct-dye",
          confidence: "high",
          evidence: "swatch label aqua",
        },
        {
          brand: "ADORE",
          series: "ADORE COLOR",
          shade: "MAGENTA",
          type: "direct-dye",
          confidence: "medium",
          evidence: "bottle label",
        },
      ].map((r) => ({
        productId: null,
        brand: r.brand,
        series: r.series,
        shade: r.shade,
        type: r.type,
        _evidence: [{ kind: "vision", detail: r.evidence, confidence: r.confidence }],
        _sourceKind: "vision",
        _confidence: r.confidence,
      })),
      raw: "{...}",
    });
    const out = await vision.extractFromImages(
      [{ name: "diana.png", base64: "ZmFrZQ==", mime: "image/png" }],
      { apiKey: "sk-test", fetchImpl },
    );
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(out.visionCalls).toBe(1);
    expect(out.rows).toHaveLength(2);
    expect(out.rows[0].brand).toBe("ADORE");
    expect(out.rows[0].shade).toBe("AQUAMARINE");
  });

  it("falls back to placeholder when vision returns 0 rows", async () => {
    const fetchImpl = jest.fn().mockResolvedValue({ ok: true, rows: [] });
    const out = await vision.extractFromImages(
      [{ name: "blank.png", base64: "ZmFrZQ==", mime: "image/png" }],
      { apiKey: "sk-test", fetchImpl },
    );
    expect(out.rows).toHaveLength(1);
    expect(out.rows[0]._evidence[0].detail).toMatch(/0 rows|manual review/i);
  });
});
