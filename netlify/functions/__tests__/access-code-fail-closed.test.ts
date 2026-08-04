import fs from "fs";
import path from "path";

const protectedFunctions = [
  "beauty-intelligence.js",
  "canonical-product-db.js",
  "canonical-product-import.js",
  "customer-usage-intelligence.js",
  "market-insights.js",
  "product-catalog-import.js",
  "product-truth-ai.js",
  "product-truth-search.js",
  "usage-import.js",
  "usage-report-import.js",
];

describe("shared access-code handlers fail closed", () => {
  it.each(protectedFunctions)("%s has no public fallback and rejects missing configuration", (filename) => {
    const source = fs.readFileSync(path.resolve(__dirname, "..", filename), "utf8");

    expect(source).not.toContain("070315");
    expect(source).toContain('process.env.USAGE_IMPORT_ACCESS_CODE || ""');
    expect(source).toMatch(/if\s*\(\s*!ACCESS_CODE\s*\|\|/);
    expect(source).not.toMatch(/(?:details|error):\s*(?:err|error)\.message/);
  });

  it("removes legacy credential fallbacks and public migration handlers", () => {
    const functionsRoot = path.resolve(__dirname, "..");
    const pipeline = fs.readFileSync(path.join(functionsRoot, "pipeline.js"), "utf8");
    const database = fs.readFileSync(path.join(functionsRoot, "_db.js"), "utf8");

    expect(pipeline).not.toContain("your-secret-key");
    expect(pipeline).toContain("JWT_SECRET is not configured securely");
    expect(pipeline).toContain("algorithms: ['HS256']");
    expect(pipeline).toContain("JWT_ISSUER");
    expect(pipeline).toContain("JWT_AUDIENCE");
    expect(pipeline).toContain("PIPELINE_MOCK_MODE");
    expect(pipeline.indexOf("user = verifyToken")).toBeLessThan(
      pipeline.indexOf("if (!hasDatabaseUrl())"),
    );
    expect(database).toContain("rejectUnauthorized: true");
    expect(fs.existsSync(path.join(functionsRoot, "run-migration.js"))).toBe(false);
    expect(fs.existsSync(path.join(functionsRoot, "canonical-product-migrate.js"))).toBe(false);
    expect(fs.existsSync(path.join(functionsRoot, "catalog-inventory-migrate.js"))).toBe(false);
  });

  it("never accepts the shared administrative code through query strings", () => {
    const functionsRoot = path.resolve(__dirname, "..");
    for (const filename of ["canonical-product-db.js", "product-truth-search.js"]) {
      const source = fs.readFileSync(path.join(functionsRoot, filename), "utf8");
      expect(source).not.toContain("queryStringParameters?.code");
    }
  });
});

