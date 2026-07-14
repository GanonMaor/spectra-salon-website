import type { SalonResource, ServiceDepartment } from "./catalogTypes";

/**
 * Department IDs are immutable technical identifiers and may retain an old
 * import label. Calendar semantics come only from salon-controlled display
 * fields, so an ID containing "hair" cannot turn "Cosmetics" into Hair.
 */
export function isHairCalendarDepartment(
  department: Pick<ServiceDepartment, "name" | "calendarLabel"> | null | undefined,
): boolean {
  return /hair|שיער/i.test(`${department?.name ?? ""} ${department?.calendarLabel ?? ""}`);
}

/**
 * A wash sub-calendar exists only when the salon configured an active basin
 * that is shared or explicitly linked to the current department.
 */
export function hasActiveWashStation(
  resources: SalonResource[],
  departmentId?: string,
): boolean {
  return resources.some(
    (resource) =>
      resource.status === "active"
      && resource.type === "wash-station"
      && (resource.departmentId == null || resource.departmentId === departmentId),
  );
}
