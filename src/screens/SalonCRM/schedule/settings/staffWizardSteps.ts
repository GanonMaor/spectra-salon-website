/**
 * Pure step model for the staff create/edit wizard.
 *
 * The "System access" step only exists for members granted system access. When
 * the operator switches an in-progress wizard back to "employee only" the step
 * list shrinks, so a previously-selected step index can fall out of range. These
 * helpers keep the current step index and key resolution safe so the wizard can
 * never read `steps[step].key` on an undefined entry (which used to crash it).
 */

export type StaffWizardAccessType = "employee_only" | "with_access";
export type StaffWizardStepKey = "profile" | "professional" | "availability" | "access";

/** The ordered step keys for a given access type. */
export function buildStaffWizardStepKeys(accessType: StaffWizardAccessType): StaffWizardStepKey[] {
  const keys: StaffWizardStepKey[] = ["profile", "professional", "availability"];
  if (accessType === "with_access") keys.push("access");
  return keys;
}

/** Clamp a (possibly stale) step index into the valid `[0, length - 1]` range. */
export function clampStepIndex(step: number, length: number): number {
  if (length <= 0) return 0;
  if (step < 0) return 0;
  if (step > length - 1) return length - 1;
  return step;
}

/** Safe key lookup that never throws when `step` is briefly out of range. */
export function resolveStaffWizardStepKey(
  keys: StaffWizardStepKey[],
  step: number,
): StaffWizardStepKey {
  return keys[clampStepIndex(step, keys.length)] ?? "profile";
}
