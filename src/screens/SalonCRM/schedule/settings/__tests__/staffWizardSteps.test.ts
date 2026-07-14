import {
  buildStaffWizardStepKeys,
  clampStepIndex,
  resolveStaffWizardStepKey,
} from "../staffWizardSteps";

describe("staffWizardSteps", () => {
  describe("buildStaffWizardStepKeys", () => {
    it("omits the access step for employee-only members", () => {
      expect(buildStaffWizardStepKeys("employee_only")).toEqual([
        "profile",
        "professional",
        "availability",
      ]);
    });

    it("includes the access step for members with system access", () => {
      expect(buildStaffWizardStepKeys("with_access")).toEqual([
        "profile",
        "professional",
        "availability",
        "access",
      ]);
    });
  });

  describe("clampStepIndex", () => {
    it("keeps in-range indices unchanged", () => {
      expect(clampStepIndex(2, 4)).toBe(2);
    });

    it("clamps an index that fell past the end when the step list shrank", () => {
      // Regression: on the access step (index 3) then switching to employee-only
      // shrinks the list to length 3 → index must clamp to 2, never 3.
      expect(clampStepIndex(3, 3)).toBe(2);
    });

    it("never returns a negative index", () => {
      expect(clampStepIndex(-5, 3)).toBe(0);
      expect(clampStepIndex(1, 0)).toBe(0);
    });
  });

  describe("resolveStaffWizardStepKey", () => {
    it("resolves a valid step key", () => {
      const keys = buildStaffWizardStepKeys("with_access");
      expect(resolveStaffWizardStepKey(keys, 3)).toBe("access");
    });

    it("never throws / returns undefined for a stale out-of-range index", () => {
      // Simulate the crash scenario: keys shrank after the access step was open.
      const keys = buildStaffWizardStepKeys("employee_only");
      expect(resolveStaffWizardStepKey(keys, 3)).toBe("availability");
    });
  });
});
