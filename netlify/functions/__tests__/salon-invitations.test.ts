/**
 * Unit tests for the pure invitation / activation / suspension / audit helpers
 * (Phase E of the salon settings/permissions plan).
 *
 * DB-free; run under the default `npm test`. These lock the security contract:
 *   - codes are single-use, salted-hashed, and verified in constant time;
 *   - redemption enforces expiry AND an attempt limit (resend supersedes);
 *   - the membership lifecycle is a fixed state machine;
 *   - existing-user invitations are tenant-safe (no duplicate accounts; a staff
 *     contact needs owner approval);
 *   - suspended/revoked access (or a stale `iat`) invalidates a session;
 *   - audit events are well-formed and use the shared action vocabulary.
 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const {
  InvitationError,
  resolveInvitationChannel,
  generateInvitationCode,
  generateCodeSalt,
  hashInvitationCode,
  verifyInvitationCode,
  canonicalizeCode,
  isInvitationExpired,
  assertInvitationRedeemable,
  registerCodeAttempt,
  canTransitionMembership,
  assertMembershipTransition,
  classifyInvitationTarget,
  isSessionActiveForMembership,
  assertSessionActiveForMembership,
  buildAuditEvent,
  computeExpiry,
  normalizeEmail,
  normalizeInvitePhone,
  DEFAULT_MAX_ATTEMPTS,
} = require("../lib/salon-invitations");

type Invite = {
  status: string;
  expires_at: number | string | Date | null;
  attempt_count?: number;
  max_attempts?: number;
};

describe("resolveInvitationChannel", () => {
  it("resolves email-only, phone-only, and both", () => {
    expect(resolveInvitationChannel({ email: "New@Salon.com" })).toEqual({
      email: "new@salon.com",
      phone: null,
      channel: "email",
    });
    expect(resolveInvitationChannel({ phone: "0504322680" })).toEqual({
      email: null,
      phone: "504322680",
      channel: "phone",
    });
    expect(resolveInvitationChannel({ email: "a@b.co", phone: "+972504322680" })).toEqual({
      email: "a@b.co",
      phone: "504322680",
      channel: "both",
    });
  });

  it("rejects when no usable channel is supplied", () => {
    let thrown: unknown;
    try {
      resolveInvitationChannel({ email: "not-an-email", phone: "" });
    } catch (err) {
      thrown = err;
    }
    expect(thrown).toBeInstanceOf(InvitationError);
    expect((thrown as InstanceType<typeof InvitationError>).code).toBe("NO_CHANNEL");
  });
});

describe("normalizeEmail / normalizeInvitePhone", () => {
  it("lowercases emails and rejects non-emails", () => {
    expect(normalizeEmail("  Foo@Bar.COM ")).toBe("foo@bar.com");
    expect(normalizeEmail("nope")).toBeNull();
    expect(normalizeEmail(null)).toBeNull();
  });
  it("collapses Israeli phone formats", () => {
    expect(normalizeInvitePhone("+972-50-432-2680")).toBe("504322680");
    expect(normalizeInvitePhone("nope@x.com")).toBeNull();
  });
});

describe("code generation + hashing (only the hash is stored)", () => {
  it("generates a grouped, unambiguous code", () => {
    const code = generateInvitationCode();
    expect(code).toMatch(/^[A-Z2-7]{4}(-[A-Z2-7]{1,4})+$/);
  });

  it("canonicalizes separators and case before hashing", () => {
    const salt = "abc";
    const h1 = hashInvitationCode("ABCD-EFGH", salt);
    const h2 = hashInvitationCode("abcdefgh", salt);
    const h3 = hashInvitationCode(" abcd efgh ", salt);
    expect(h1).toBe(h2);
    expect(h1).toBe(h3);
    expect(canonicalizeCode("ab-cd ef")).toBe("ABCDEF");
  });

  it("salts defeat cross-row hash equality", () => {
    const a = hashInvitationCode("SAME-CODE", generateCodeSalt());
    const b = hashInvitationCode("SAME-CODE", generateCodeSalt());
    expect(a).not.toBe(b);
  });

  it("verifies the right code and rejects the wrong one (constant time)", () => {
    const salt = generateCodeSalt();
    const code = generateInvitationCode();
    const hash = hashInvitationCode(code, salt);
    expect(verifyInvitationCode(code, salt, hash)).toBe(true);
    expect(verifyInvitationCode(code.toLowerCase().replace(/-/g, ""), salt, hash)).toBe(true);
    expect(verifyInvitationCode("WRON-GCOD-EXXX", salt, hash)).toBe(false);
    expect(verifyInvitationCode(code, "other-salt", hash)).toBe(false);
    expect(verifyInvitationCode("", salt, hash)).toBe(false);
  });
});

describe("assertInvitationRedeemable", () => {
  const base = (over: Partial<Invite> = {}): Invite => ({
    status: "pending",
    expires_at: Date.now() + 60_000,
    attempt_count: 0,
    max_attempts: DEFAULT_MAX_ATTEMPTS,
    ...over,
  });

  it("passes a fresh pending invitation", () => {
    expect(assertInvitationRedeemable(base())).toBe(true);
  });

  it("reports the most specific reason for each terminal state", () => {
    const cases: Array<[Invite, string]> = [
      [base({ status: "accepted" }), "ALREADY_ACCEPTED"],
      [base({ status: "revoked" }), "INVITATION_REVOKED"],
      [base({ expires_at: Date.now() - 1000 }), "INVITATION_EXPIRED"],
      [base({ attempt_count: DEFAULT_MAX_ATTEMPTS }), "TOO_MANY_ATTEMPTS"],
    ];
    for (const [invite, code] of cases) {
      let thrown: unknown;
      try {
        assertInvitationRedeemable(invite);
      } catch (err) {
        thrown = err;
      }
      expect(thrown).toBeInstanceOf(InvitationError);
      expect((thrown as InstanceType<typeof InvitationError>).code).toBe(code);
    }
  });

  it("treats a missing invitation as not found", () => {
    expect(() => assertInvitationRedeemable(null)).toThrow(/not found/i);
  });

  it("isInvitationExpired compares against now", () => {
    expect(isInvitationExpired({ expires_at: Date.now() - 1 } as Invite)).toBe(true);
    expect(isInvitationExpired({ expires_at: Date.now() + 10_000 } as Invite)).toBe(false);
  });
});

describe("registerCodeAttempt (attempt limit + lock)", () => {
  it("does not burn an attempt on success", () => {
    expect(registerCodeAttempt({ attempt_count: 2, max_attempts: 5 }, true)).toEqual({
      attemptCount: 2,
      locked: false,
      accepted: true,
    });
  });

  it("burns an attempt on failure and locks at the limit", () => {
    expect(registerCodeAttempt({ attempt_count: 3, max_attempts: 5 }, false)).toEqual({
      attemptCount: 4,
      locked: false,
      accepted: false,
    });
    expect(registerCodeAttempt({ attempt_count: 4, max_attempts: 5 }, false)).toEqual({
      attemptCount: 5,
      locked: true,
      accepted: false,
    });
  });
});

describe("membership lifecycle state machine", () => {
  it("permits the documented transitions", () => {
    expect(canTransitionMembership("invited", "active")).toBe(true);
    expect(canTransitionMembership("invited", "accepted")).toBe(true);
    expect(canTransitionMembership("accepted", "active")).toBe(true);
    expect(canTransitionMembership("active", "suspended")).toBe(true);
    expect(canTransitionMembership("suspended", "active")).toBe(true);
    expect(canTransitionMembership("active", "revoked")).toBe(true);
  });

  it("rejects illegal transitions and no-ops", () => {
    expect(canTransitionMembership("revoked", "active")).toBe(false);
    expect(canTransitionMembership("active", "active")).toBe(false);
    expect(canTransitionMembership("suspended", "invited")).toBe(false);
    let thrown: unknown;
    try {
      assertMembershipTransition("revoked", "active");
    } catch (err) {
      thrown = err;
    }
    expect(thrown).toBeInstanceOf(InvitationError);
    expect((thrown as InstanceType<typeof InvitationError>).code).toBe("INVALID_LIFECYCLE_TRANSITION");
  });
});

describe("classifyInvitationTarget (tenant-safe existing-user behavior)", () => {
  it("adds a membership for an existing user with none in this salon", () => {
    expect(
      classifyInvitationTarget({ existingUser: { id: "u1" }, existingMembership: null }),
    ).toEqual({ action: "attach_membership" });
  });

  it("re-invites an existing but non-active membership (no duplicate account)", () => {
    expect(
      classifyInvitationTarget({
        existingUser: { id: "u1" },
        existingMembership: { status: "suspended" },
      }),
    ).toEqual({ action: "reinvite_membership" });
  });

  it("does not silently revive a revoked membership through a new invitation", () => {
    let thrown: unknown;
    try {
      classifyInvitationTarget({
        existingUser: { id: "u1" },
        existingMembership: { status: "revoked" },
      });
    } catch (err) {
      thrown = err;
    }
    expect(thrown).toBeInstanceOf(InvitationError);
    expect((thrown as InstanceType<typeof InvitationError>).code).toBe("MEMBERSHIP_REVOKED");
  });

  it("rejects inviting an already-active member", () => {
    let thrown: unknown;
    try {
      classifyInvitationTarget({
        existingUser: { id: "u1" },
        existingMembership: { status: "active" },
      });
    } catch (err) {
      thrown = err;
    }
    expect(thrown).toBeInstanceOf(InvitationError);
    expect((thrown as InstanceType<typeof InvitationError>).code).toBe("ALREADY_MEMBER");
  });

  it("requires owner approval when the contact is on a staff record", () => {
    const needsApproval = classifyInvitationTarget({
      existingUser: null,
      contactBelongsToStaff: true,
      ownerApproved: false,
    });
    expect(needsApproval.action).toBe("requires_link_or_approval");
    // With approval it proceeds to create a fresh login user.
    expect(
      classifyInvitationTarget({ existingUser: null, contactBelongsToStaff: true, ownerApproved: true }),
    ).toEqual({ action: "create_user" });
  });

  it("creates a new user for a brand-new invitee", () => {
    expect(classifyInvitationTarget({ existingUser: null })).toEqual({ action: "create_user" });
  });
});

describe("session invalidation (stateless token revocation)", () => {
  const nowSec = Math.floor(Date.now() / 1000);

  it("keeps an active membership session with no cutoff valid", () => {
    expect(
      isSessionActiveForMembership({ tokenIat: nowSec, sessionsValidAfter: null, membershipStatus: "active" }),
    ).toBe(true);
  });

  it("rejects every non-active lifecycle state regardless of iat", () => {
    expect(
      isSessionActiveForMembership({ tokenIat: nowSec + 999, sessionsValidAfter: null, membershipStatus: "invited" }),
    ).toBe(false);
    expect(
      isSessionActiveForMembership({ tokenIat: nowSec + 999, sessionsValidAfter: null, membershipStatus: "accepted" }),
    ).toBe(false);
    expect(
      isSessionActiveForMembership({ tokenIat: nowSec + 999, sessionsValidAfter: null, membershipStatus: "suspended" }),
    ).toBe(false);
    expect(
      isSessionActiveForMembership({ tokenIat: nowSec + 999, sessionsValidAfter: null, membershipStatus: "revoked" }),
    ).toBe(false);
  });

  it("revokes a token issued before the sessions_valid_after cutoff", () => {
    const cutoff = new Date();
    const staleIat = Math.floor(cutoff.getTime() / 1000) - 60;
    const freshIat = Math.floor(cutoff.getTime() / 1000) + 60;
    expect(
      isSessionActiveForMembership({ tokenIat: staleIat, sessionsValidAfter: cutoff, membershipStatus: "active" }),
    ).toBe(false);
    expect(
      isSessionActiveForMembership({ tokenIat: freshIat, sessionsValidAfter: cutoff, membershipStatus: "active" }),
    ).toBe(true);
  });

  it("treats a legacy token with no iat as revoked when a cutoff exists", () => {
    expect(
      isSessionActiveForMembership({ tokenIat: null, sessionsValidAfter: new Date(), membershipStatus: "active" }),
    ).toBe(false);
  });

  it("assertSessionActiveForMembership throws 401 SESSION_REVOKED", () => {
    let thrown: unknown;
    try {
      assertSessionActiveForMembership({ tokenIat: nowSec, sessionsValidAfter: null, membershipStatus: "revoked" });
    } catch (err) {
      thrown = err;
    }
    expect(thrown).toBeInstanceOf(InvitationError);
    expect((thrown as InstanceType<typeof InvitationError>).statusCode).toBe(401);
    expect((thrown as InstanceType<typeof InvitationError>).code).toBe("SESSION_REVOKED");
  });
});

describe("buildAuditEvent (append-only shape)", () => {
  it("normalizes a well-formed event", () => {
    const e = buildAuditEvent({
      actorUserId: "owner-1",
      salonId: "salon-look",
      action: "access_suspend",
      entityType: "membership",
      entityId: "m1",
      before: { status: "active" },
      after: { status: "suspended" },
      reason: "policy",
      ip: "1.2.3.4",
      device: "jest",
    });
    expect(e.salon_id).toBe("salon-look");
    expect(e.action).toBe("access_suspend");
    expect(e.before_state).toEqual({ status: "active" });
    expect(e.after_state).toEqual({ status: "suspended" });
    expect(e.reason).toBe("policy");
    expect(e.ip_address).toBe("1.2.3.4");
  });

  it("requires a salon id and a known action", () => {
    expect(() => buildAuditEvent({ action: "invite" })).toThrow(/salon/i);
    expect(() => buildAuditEvent({ salonId: "s", action: "not_a_real_action" })).toThrow(/Unknown audit action/);
  });
});

describe("computeExpiry", () => {
  it("adds the ttl to the base time", () => {
    const base = 1_000_000;
    expect(computeExpiry(base, 5_000).getTime()).toBe(1_005_000);
  });
});
