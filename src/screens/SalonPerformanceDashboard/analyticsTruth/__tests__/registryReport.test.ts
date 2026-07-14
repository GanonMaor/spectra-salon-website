import {
  ANALYTICS_TRUTH_VERSION,
  METRIC_REGISTRY,
  buildRegistryReport,
  serializeRegistryReport,
} from "../index";

/**
 * The registry report is the machine-readable artefact handed to Founder QA.
 * The snapshot keeps it version-controlled; the structural checks keep it
 * honest (totals must reconcile with the registry).
 */
describe("registry report", () => {
  const report = buildRegistryReport();

  it("reports the current contract version and total", () => {
    expect(report.version).toBe(ANALYTICS_TRUTH_VERSION);
    expect(report.totalMetrics).toBe(METRIC_REGISTRY.length);
    expect(report.metrics).toHaveLength(METRIC_REGISTRY.length);
  });

  it("reconciles classification counts with the registry", () => {
    const sum = Object.values(report.byClassification).reduce((a, b) => a + b, 0);
    expect(sum).toBe(report.totalMetrics);
  });

  it("reconciles tab counts with the registry", () => {
    const sum = Object.values(report.byTab).reduce((a, b) => a + b, 0);
    expect(sum).toBe(report.totalMetrics);
  });

  it("sorts metrics deterministically by id", () => {
    const ids = report.metrics.map((m) => m.id);
    expect(ids).toEqual([...ids].sort((a, b) => a.localeCompare(b)));
  });

  it("serialises to valid JSON", () => {
    expect(() => JSON.parse(serializeRegistryReport())).not.toThrow();
  });

  it("matches the committed snapshot", () => {
    expect(report).toMatchSnapshot();
  });
});
