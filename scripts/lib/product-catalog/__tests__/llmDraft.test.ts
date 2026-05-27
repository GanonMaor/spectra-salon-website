/* eslint-disable @typescript-eslint/no-var-requires */
const {
  classifyAmbiguousBullets,
  buildPrompt,
  SYSTEM_PROMPT,
} = require("../llm-draft");

describe("llm-draft classifier", () => {
  it("is a no-op when OPENAI_API_KEY is absent", async () => {
    const result = await classifyAmbiguousBullets(
      ["mystery brand new shades"],
      { apiKey: "" },
    );
    expect(result.rows).toEqual([]);
    expect(result.calls).toBe(0);
    expect(result.warnings.length).toBeGreaterThanOrEqual(1);
    expect(result.warnings[0].code).toBe("LLM_DRAFT_DISABLED");
  });

  it("is a no-op when bullets list is empty", async () => {
    const result = await classifyAmbiguousBullets([], {
      apiKey: "test-key",
    });
    expect(result.rows).toEqual([]);
    expect(result.calls).toBe(0);
  });

  it("converts a mocked LLM response into draft rows", async () => {
    const mockFetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                bullets: [
                  {
                    input_index: 1,
                    rows: [
                      {
                        brand: "kenra",
                        series: "SA RAPID TONERS",
                        shade: "SV",
                        type: "toner",
                        service_context: "toner",
                        quick_add: true,
                        rationale: "kenra rapid toner SV",
                      },
                      {
                        brand: "Kenra",
                        series: "SA Rapid Toners",
                        shade: "SA",
                        type: "toner",
                        service_context: "toner",
                        quick_add: true,
                        rationale: "kenra rapid toner SA",
                      },
                    ],
                  },
                ],
              }),
            },
          },
        ],
      }),
    }));

    const result = await classifyAmbiguousBullets(
      ["all kenra rapid toners"],
      { apiKey: "test-key", fetchImpl: mockFetch as any },
    );
    expect(result.calls).toBe(1);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0].brand).toBe("KENRA");
    expect(result.rows[0]._draftFromLLM).toBe(true);
    expect(result.rows[0]._quickAdd).toBe(true);
    expect(result.rows[0]._evidence[0].source).toBe("llm_draft");
  });

  it("buildPrompt mentions every bullet once", () => {
    const prompt = buildPrompt(["alpha", "beta", "gamma"]);
    expect(prompt).toMatch(/1\. alpha/);
    expect(prompt).toMatch(/2\. beta/);
    expect(prompt).toMatch(/3\. gamma/);
    expect(SYSTEM_PROMPT.length).toBeGreaterThan(20);
  });
});
