import { buildStaff, buildStaffPatch } from "../crmActions";

describe("staff builders (seed/demo path)", () => {
  describe("buildStaff", () => {
    it("defaults isBookable to true and derives isActive from status", () => {
      const staff = buildStaff("salon-1", { name: "Dana", role: "Stylist" });
      expect(staff.isBookable).toBe(true);
      expect(staff.isActive).toBe(true);
    });

    it("honours an explicit isBookable=false while staying active", () => {
      const staff = buildStaff("salon-1", { name: "Ron", role: "Assistant", isBookable: false });
      expect(staff.isBookable).toBe(false);
      expect(staff.isActive).toBe(true);
    });

    it("marks an inactive member as not active", () => {
      const staff = buildStaff("salon-1", { name: "Old", role: "Stylist", status: "inactive" });
      expect(staff.isActive).toBe(false);
    });
  });

  describe("buildStaffPatch", () => {
    it("includes isBookable only when provided", () => {
      expect(buildStaffPatch({}).isBookable).toBeUndefined();
      expect(buildStaffPatch({ isBookable: false }).isBookable).toBe(false);
    });

    it("carries working hours through the patch", () => {
      const hours = [{ dayOfWeek: 1, startHour: 9, endHour: 17 }];
      expect(buildStaffPatch({ workingHours: hours }).workingHours).toEqual(hours);
    });
  });
});
