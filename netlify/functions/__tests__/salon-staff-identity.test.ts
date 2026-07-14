/**
 * Unit tests for the pure staff-identity helpers behind salon-staff.
 *
 * These run without a database or network (default `npm test`). They lock the
 * slice-A identity contract that keeps StaffMember, CRMUser, and Membership
 * distinct:
 *   - a staff member without a linked login user is valid;
 *   - a login user without a staff member is valid;
 *   - an owner who is also a staff member is valid (single self-link);
 *   - the same user may be linked to staff in a different salon;
 *   - linking a user already linked to another staff in the SAME salon fails.
 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const {
  StaffIdentityError,
  normalizeUserId,
  parseBooleanFlag,
  findConflictingStaffLink,
  assertUniqueStaffUserLink,
} = require("../lib/salon-staff-helpers");

describe("normalizeUserId", () => {
  it("collapses blanks and whitespace to null", () => {
    expect(normalizeUserId(undefined)).toBeNull();
    expect(normalizeUserId(null)).toBeNull();
    expect(normalizeUserId("")).toBeNull();
    expect(normalizeUserId("   ")).toBeNull();
  });

  it("trims and preserves real ids", () => {
    expect(normalizeUserId("  user-1 ")).toBe("user-1");
    expect(normalizeUserId("demo-user")).toBe("demo-user");
  });
});

describe("parseBooleanFlag", () => {
  it("passes through real booleans", () => {
    expect(parseBooleanFlag(true)).toBe(true);
    expect(parseBooleanFlag(false)).toBe(false);
  });

  it("accepts common string/number encodings", () => {
    expect(parseBooleanFlag("true")).toBe(true);
    expect(parseBooleanFlag("false")).toBe(false);
    expect(parseBooleanFlag("1")).toBe(true);
    expect(parseBooleanFlag(0)).toBe(false);
  });

  it("returns the fallback for undefined and unrecognized values", () => {
    expect(parseBooleanFlag(undefined, true)).toBe(true);
    expect(parseBooleanFlag(undefined)).toBeUndefined();
    expect(parseBooleanFlag("maybe")).toBeUndefined();
  });
});

describe("staff <-> user link uniqueness (per salon)", () => {
  const SALON_A = "salon-a";
  const SALON_B = "salon-b";

  it("staff without a user is always valid", () => {
    expect(
      findConflictingStaffLink({ userId: null, salonId: SALON_A, existingStaff: [] }),
    ).toBeNull();
    // Empty-string id normalizes to "no user".
    expect(
      findConflictingStaffLink({ userId: "", salonId: SALON_A, existingStaff: [] }),
    ).toBeNull();
    expect(() =>
      assertUniqueStaffUserLink({ userId: null, salonId: SALON_A, existingStaff: [] }),
    ).not.toThrow();
  });

  it("a user with no staff row in the salon can be linked", () => {
    // The user exists (has a membership) but no staff carries it yet.
    expect(
      findConflictingStaffLink({
        userId: "user-1",
        salonId: SALON_A,
        existingStaff: [],
      }),
    ).toBeNull();
  });

  it("an owner who is also staff (self-link) is not a conflict on update", () => {
    const existingStaff = [{ id: "staff-owner", salon_id: SALON_A, user_id: "owner-1" }];
    expect(
      findConflictingStaffLink({
        userId: "owner-1",
        salonId: SALON_A,
        currentStaffId: "staff-owner",
        existingStaff,
      }),
    ).toBeNull();
  });

  it("the same user may be linked to staff in a different salon", () => {
    const existingStaff = [{ id: "staff-a", salon_id: SALON_A, user_id: "user-1" }];
    // Linking user-1 to a NEW staff member in salon B is fine.
    expect(
      findConflictingStaffLink({
        userId: "user-1",
        salonId: SALON_B,
        currentStaffId: null,
        existingStaff,
      }),
    ).toBeNull();
  });

  it("fails when the user is already linked to another staff in the same salon", () => {
    const existingStaff = [{ id: "staff-a", salon_id: SALON_A, user_id: "user-1" }];
    const conflict = findConflictingStaffLink({
      userId: "user-1",
      salonId: SALON_A,
      currentStaffId: "staff-b",
      existingStaff,
    });
    expect(conflict).not.toBeNull();
    expect(conflict.id).toBe("staff-a");

    let thrown: unknown;
    try {
      assertUniqueStaffUserLink({
        userId: "user-1",
        salonId: SALON_A,
        currentStaffId: "staff-b",
        existingStaff,
      });
    } catch (err) {
      thrown = err;
    }
    expect(thrown).toBeInstanceOf(StaffIdentityError);
    expect((thrown as InstanceType<typeof StaffIdentityError>).code).toBe("DUPLICATE_STAFF_USER_LINK");
    expect((thrown as InstanceType<typeof StaffIdentityError>).statusCode).toBe(409);
  });
});
