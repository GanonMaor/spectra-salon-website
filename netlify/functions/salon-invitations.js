/**
 * netlify/functions/salon-invitations.js
 * ─────────────────────────────────────────────────────────────────────────
 * Phase E of the salon settings/permissions plan: the secure server-side
 * lifecycle for access invitations, activation, suspension/revocation and the
 * append-only audit trail. The frontend only reflects state; this endpoint is
 * the authority.
 *
 * Security contract:
 *   * salon_id is resolved from the verified server-side session, never from
 *     client input (see _salon-context). Managing invitations/access requires
 *     `permissions.manage_permissions@salon`.
 *   * Invitation codes are personal + single-use; only a salted hash is stored.
 *     Redemption enforces expiry and a per-invitation attempt limit; a resend
 *     supersedes (revokes) the prior pending code.
 *   * Existing-user invitations add a membership instead of duplicating an
 *     account; a contact already attached to a staff member needs explicit
 *     owner approval.
 *   * Suspending/revoking access blocks new sessions (salon-login filter) and
 *     invalidates existing ones (sessions_valid_after cutoff) without touching
 *     the staff member, appointments, or history.
 *   * Every state change is written to salon_audit_events (append-only).
 *
 * Routes (POST unless noted; segment after /.netlify/functions/salon-invitations):
 *   GET  /                     list invitations
 *   POST /                     create an invitation
 *   POST /accept               redeem a code (PUBLIC — the code is the auth)
 *   POST /resend               re-issue a code, superseding the prior one
 *   POST /revoke-invitation    cancel a pending invitation
 *   POST /suspend              suspend a member's access
 *   POST /revoke               revoke a member's access
 *   POST /reactivate           reactivate a suspended member
 */
"use strict";

const { createClient, hasDatabaseUrl } = require("./_db");
const {
  resolveSalonContext,
  SalonAuthError,
  requireContextPermission,
  resolveContextPermissions,
  enforceSessionStatus,
  PermissionError,
  signSalonSession,
} = require("./_salon-context");
const {
  assertNotLastActiveOwner,
  grantsForRoleKey,
  grantsExceedingActor,
} = require("./lib/access-permissions");
const {
  InvitationError,
  resolveInvitationChannel,
  generateInvitationCode,
  generateCodeSalt,
  hashInvitationCode,
  verifyInvitationCode,
  assertInvitationRedeemable,
  registerCodeAttempt,
  assertMembershipTransition,
  classifyInvitationTarget,
  buildAuditEvent,
  computeExpiry,
  normalizeMembershipStatus,
  DEFAULT_MAX_ATTEMPTS,
  normalizeEmail,
  normalizeInvitePhone,
} = require("./lib/salon-invitations");

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const DEFAULT_TTL_HOURS = 7 * 24;
const SESSION_TTL_SECONDS = 60 * 60 * 12;

function success(statusCode, data, meta = {}) {
  return { statusCode, headers: CORS, body: JSON.stringify({ ok: true, data, meta }) };
}

function error(statusCode, code, message, details = {}) {
  return { statusCode, headers: CORS, body: JSON.stringify({ ok: false, error: { code, message, details } }) };
}

function parsePath(event) {
  const path = event.path || "";
  const marker = "/.netlify/functions/salon-invitations";
  const markerIndex = path.indexOf(marker);
  const raw = markerIndex >= 0 ? path.slice(markerIndex + marker.length) : path;
  return (raw || "/").split("/").filter(Boolean).map(decodeURIComponent);
}

function parseJsonBody(event) {
  if (!event.body) return { body: {} };
  try {
    const parsed = JSON.parse(event.body);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { parseError: "Request body must be a JSON object" };
    }
    return { body: parsed };
  } catch {
    return { parseError: "Invalid JSON body" };
  }
}

function hasForbiddenSalonInput(event, body) {
  const headers = event.headers || {};
  const query = event.queryStringParameters || {};
  if (headers["x-salon-id"] !== undefined || headers["X-Salon-Id"] !== undefined || headers["X-Salon-ID"] !== undefined) return true;
  if (query.salon_id !== undefined || query.salonId !== undefined) return true;
  if (body && typeof body === "object" && !Array.isArray(body)) {
    return body.salon_id !== undefined || body.salonId !== undefined;
  }
  return false;
}

async function getClient() {
  const client = createClient();
  await client.connect();
  return client;
}

function clientMeta(event) {
  const headers = event.headers || {};
  const ip =
    headers["x-nf-client-connection-ip"] ||
    headers["x-forwarded-for"] ||
    headers["client-ip"] ||
    null;
  const device = headers["user-agent"] || null;
  return { ip: ip ? String(ip).split(",")[0].trim() : null, device };
}

/**
 * Insert one append-only audit row. Throws on failure so callers can keep the
 * audit write inside the same transaction as the state change: a lifecycle
 * mutation that cannot be audited MUST roll back (fail-closed). The append-only
 * trigger + tenant scope guarantee the row is either written or the whole
 * operation is undone.
 */
async function insertAuditEventStrict(client, event) {
  const e = buildAuditEvent(event);
  await client.query(
    `INSERT INTO salon_audit_events
       (salon_id, actor_user_id, action, entity_type, entity_id,
        before_state, after_state, reason, ip_address, device, metadata)
     VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb,$8,$9,$10,$11::jsonb)`,
    [
      e.salon_id,
      e.actor_user_id,
      e.action,
      e.entity_type,
      e.entity_id,
      e.before_state === null ? null : JSON.stringify(e.before_state),
      e.after_state === null ? null : JSON.stringify(e.after_state),
      e.reason,
      e.ip_address,
      e.device,
      JSON.stringify(e.metadata || {}),
    ],
  );
}

function rowToInvitation(row) {
  return {
    id: row.id,
    salonId: row.salon_id,
    email: row.email,
    phone: row.phone,
    channel: row.channel,
    accessRoleId: row.access_role_id || null,
    role: row.role || null,
    status: row.status,
    expiresAt: row.expires_at,
    attemptCount: Number(row.attempt_count || 0),
    maxAttempts: Number(row.max_attempts || DEFAULT_MAX_ATTEMPTS),
    invitedUserId: row.invited_user_id || null,
    membershipId: row.membership_id || null,
    acceptedAt: row.accepted_at || null,
    createdAt: row.created_at,
  };
}

const INVITATION_COLUMNS = `id, salon_id, membership_id, invited_user_id, email, phone, channel,
  access_role_id, role, status, expires_at, attempt_count, max_attempts,
  invited_by_user_id, accepted_user_id, accepted_at, created_at`;

/** Find an existing login user by normalized email/phone (tenant-agnostic). */
async function findExistingUser(client, email, phone) {
  const result = await client.query(
    `SELECT id, email, phone, display_name, status
     FROM crm_users
     WHERE ($1 <> '' AND LOWER(email) = $1)
        OR ($2 <> '' AND (
             regexp_replace(COALESCE(phone,''), '[^0-9]', '', 'g') = $2
             OR regexp_replace(regexp_replace(COALESCE(phone,''), '[^0-9]', '', 'g'), '^(00)?972|^0', '') = $2
           ))
     LIMIT 1`,
    [email || "", phone || ""],
  );
  return result.rows[0] || null;
}

/** True when the contact is already attached to a staff member in this salon. */
async function contactBelongsToStaff(client, salonId, email, phone) {
  const result = await client.query(
    `SELECT 1
     FROM salon_staff
     WHERE salon_id = $1
       AND (
         ($2 <> '' AND LOWER(email) = $2)
         OR ($3 <> '' AND regexp_replace(COALESCE(phone,''), '[^0-9]', '', 'g') LIKE '%' || $3)
       )
     LIMIT 1`,
    [salonId, email || "", phone || ""],
  );
  return result.rows.length > 0;
}

async function loadMembershipsForOwnerSafety(client, salonId) {
  const result = await client.query(
    `SELECT user_id, role, COALESCE(status, 'active') AS status
     FROM salon_memberships
     WHERE salon_id = $1`,
    [salonId],
  );
  return result.rows;
}

/**
 * Resolve the actual grants an invitation would confer and enforce the actor's
 * permission ceiling. A caller with manage_permissions may invite only into a
 * role whose grants are a subset of their own; only an owner wildcard can
 * delegate owner-level (`*`) access.
 */
async function resolveInvitationAccess(client, salonCtx, { role, accessRoleId } = {}) {
  const requestedRole = role === undefined || role === null || String(role).trim() === ""
    ? "viewer"
    : String(role).trim().toLowerCase();
  const requestedAccessRoleId = accessRoleId ? String(accessRoleId).trim() : null;
  let grants;

  if (requestedAccessRoleId) {
    const found = await client.query(
      `SELECT grants
       FROM access_roles
       WHERE id = $1
         AND (salon_id IS NULL OR salon_id = $2)
       LIMIT 1`,
      [requestedAccessRoleId, salonCtx.salonId],
    );
    if (found.rows.length === 0 || !Array.isArray(found.rows[0].grants)) {
      throw new InvitationError("INVALID_ACCESS_ROLE", "The requested access role is not available to this salon.", 400);
    }
    grants = found.rows[0].grants;
  } else {
    grants = grantsForRoleKey(requestedRole);
    if (!grants) {
      throw new InvitationError("INVALID_ACCESS_ROLE", "The requested legacy role is not recognized.", 400);
    }
  }

  const exceeding = grantsExceedingActor(resolveContextPermissions(salonCtx), grants);
  if (exceeding.length > 0) {
    throw new PermissionError(
      "PRIVILEGE_ESCALATION",
      `Cannot invite a user with permissions you do not hold: ${exceeding.join(", ")}`,
      403,
    );
  }
  return { role: requestedRole, accessRoleId: requestedAccessRoleId, grants };
}

// ── Create ──────────────────────────────────────────────────────────────────
async function createInvitation(client, event, salonCtx, body) {
  const meta = clientMeta(event);
  let channelInfo;
  try {
    channelInfo = resolveInvitationChannel({ email: body.email, phone: body.phone });
  } catch (err) {
    if (err instanceof InvitationError) return error(err.statusCode, err.code, err.message);
    throw err;
  }
  const { email, phone, channel } = channelInfo;

  // Owner-approved linking of a contact that already belongs to a staff member
  // grants that person system access, so it must require ACTUAL owner authority
  // — not merely a client-supplied `ownerApproved` flag. Only an owner (wildcard
  // grant) may approve; anyone else is rejected before the classification runs.
  const ownerApproved = body.ownerApproved === true;
  if (ownerApproved && !resolveContextPermissions(salonCtx).isOwner) {
    return error(
      403,
      "NOT_OWNER",
      "Only an owner may approve linking a staff member's contact for system access.",
    );
  }

  const ttlHours = Number.isFinite(Number(body.ttlHours)) && Number(body.ttlHours) > 0
    ? Number(body.ttlHours)
    : DEFAULT_TTL_HOURS;
  const maxAttempts = Number.isInteger(Number(body.maxAttempts)) && Number(body.maxAttempts) > 0
    ? Number(body.maxAttempts)
    : DEFAULT_MAX_ATTEMPTS;

  await client.query("BEGIN");
  try {
    const invitationAccess = await resolveInvitationAccess(client, salonCtx, {
      role: body.role,
      accessRoleId: body.accessRoleId,
    });
    const existingUser = await findExistingUser(client, email, phone);
    let existingMembership = null;
    if (existingUser) {
      const m = await client.query(
        `SELECT id, user_id, role, COALESCE(status,'active') AS status
         FROM salon_memberships WHERE salon_id = $1 AND user_id = $2`,
        [salonCtx.salonId, existingUser.id],
      );
      existingMembership = m.rows[0] || null;
    }
    const staffContact = existingUser ? false : await contactBelongsToStaff(client, salonCtx.salonId, email, phone);

    let classification;
    try {
      classification = classifyInvitationTarget({
        existingUser,
        existingMembership,
        contactBelongsToStaff: staffContact,
        ownerApproved,
      });
    } catch (err) {
      if (err instanceof InvitationError) {
        await client.query("ROLLBACK");
        return error(err.statusCode, err.code, err.message);
      }
      throw err;
    }

    if (classification.action === "requires_link_or_approval") {
      await client.query("ROLLBACK");
      return error(409, "REQUIRES_OWNER_APPROVAL", classification.reason, { action: classification.action });
    }

    // Resend invalidation: supersede any prior pending invite for this target.
    await client.query(
      `UPDATE salon_invitations
       SET status = 'revoked', revoked_at = now(), updated_at = now()
       WHERE salon_id = $1 AND status = 'pending'
         AND (
           ($2 <> '' AND lower(email) = $2)
           OR ($3 <> '' AND phone = $3)
         )`,
      [salonCtx.salonId, email || "", phone || ""],
    );

    // For an existing user, reflect the invited lifecycle on the membership.
    let membershipId = existingMembership ? existingMembership.id : null;
    if (existingUser && !existingMembership) {
      const created = await client.query(
        `INSERT INTO salon_memberships (salon_id, user_id, role, access_role_id, status, invited_at, updated_at)
         VALUES ($1, $2, $3, $4, 'invited', now(), now())
         ON CONFLICT (salon_id, user_id) DO UPDATE SET status = 'invited', invited_at = now(), updated_at = now()
         RETURNING id`,
        [salonCtx.salonId, existingUser.id, invitationAccess.role, invitationAccess.accessRoleId],
      );
      membershipId = created.rows[0].id;
    } else if (existingMembership) {
      await client.query(
        `UPDATE salon_memberships SET status = 'invited', invited_at = now(), updated_at = now()
         WHERE id = $1`,
        [existingMembership.id],
      );
    }

    const code = generateInvitationCode();
    const salt = generateCodeSalt();
    const codeHash = hashInvitationCode(code, salt);
    const expiresAt = computeExpiry(Date.now(), ttlHours * 60 * 60 * 1000);

    const inserted = await client.query(
      `INSERT INTO salon_invitations
         (salon_id, membership_id, invited_user_id, email, phone, channel,
          access_role_id, role, code_salt, code_hash, status, expires_at,
          attempt_count, max_attempts, invited_by_user_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'pending',$11,0,$12,$13)
       RETURNING ${INVITATION_COLUMNS}`,
      [
        salonCtx.salonId,
        membershipId,
        existingUser ? existingUser.id : null,
        email,
        phone,
        channel,
        invitationAccess.accessRoleId,
        invitationAccess.role,
        salt,
        codeHash,
        expiresAt,
        maxAttempts,
        salonCtx.userId || null,
      ],
    );
    const invite = inserted.rows[0];

    await insertAuditEventStrict(client, {
      actorUserId: salonCtx.userId,
      salonId: salonCtx.salonId,
      action: "invite",
      entityType: "invitation",
      entityId: invite.id,
      after: { email, phone, channel, role: invitationAccess.role, accessRoleId: invitationAccess.accessRoleId },
      ip: meta.ip,
      device: meta.device,
    });

    await client.query("COMMIT");
    // The raw code is returned ONCE to the authorized actor for out-of-band
    // delivery and is never persisted. A delivery integration (email/SMS)
    // would consume this instead of returning it to the client.
    return success(201, { invitation: rowToInvitation(invite), code }, { action: classification.action });
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  }
}

// ── Resend ────────────────────────────────────────────────────────────────
async function resendInvitation(client, event, salonCtx, body) {
  const meta = clientMeta(event);
  const invitationId = String(body.invitationId || "").trim();
  if (!invitationId) return error(400, "VALIDATION_ERROR", "invitationId is required");

  await client.query("BEGIN");
  try {
    const found = await client.query(
      `SELECT ${INVITATION_COLUMNS} FROM salon_invitations
       WHERE id = $1 AND salon_id = $2 FOR UPDATE`,
      [invitationId, salonCtx.salonId],
    );
    if (found.rows.length === 0) {
      await client.query("ROLLBACK");
      return error(404, "NOT_FOUND", "Invitation not found");
    }
    const prev = found.rows[0];
    if (prev.status === "accepted") {
      await client.query("ROLLBACK");
      return error(409, "ALREADY_ACCEPTED", "This invitation has already been accepted.");
    }
    // A resend is a new delegation event. Re-check its original requested role
    // against the *current* actor, so an invitation cannot be used later to
    // bypass a narrowed/delegated permission ceiling.
    await resolveInvitationAccess(client, salonCtx, {
      role: prev.role,
      accessRoleId: prev.access_role_id,
    });

    // Supersede the old code.
    await client.query(
      `UPDATE salon_invitations SET status = 'revoked', revoked_at = now(), updated_at = now() WHERE id = $1`,
      [prev.id],
    );

    const code = generateInvitationCode();
    const salt = generateCodeSalt();
    const codeHash = hashInvitationCode(code, salt);
    const expiresAt = computeExpiry(Date.now(), DEFAULT_TTL_HOURS * 60 * 60 * 1000);

    const inserted = await client.query(
      `INSERT INTO salon_invitations
         (salon_id, membership_id, invited_user_id, email, phone, channel,
          access_role_id, role, code_salt, code_hash, status, expires_at,
          attempt_count, max_attempts, invited_by_user_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'pending',$11,0,$12,$13)
       RETURNING ${INVITATION_COLUMNS}`,
      [
        prev.salon_id,
        prev.membership_id,
        prev.invited_user_id,
        prev.email,
        prev.phone,
        prev.channel,
        prev.access_role_id,
        prev.role,
        salt,
        codeHash,
        expiresAt,
        prev.max_attempts || DEFAULT_MAX_ATTEMPTS,
        salonCtx.userId || null,
      ],
    );
    const invite = inserted.rows[0];

    await insertAuditEventStrict(client, {
      actorUserId: salonCtx.userId,
      salonId: salonCtx.salonId,
      action: "invite_resend",
      entityType: "invitation",
      entityId: invite.id,
      before: { invitationId: prev.id, status: prev.status },
      after: { invitationId: invite.id },
      ip: meta.ip,
      device: meta.device,
    });

    await client.query("COMMIT");
    return success(201, { invitation: rowToInvitation(invite), code });
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  }
}

// ── Revoke a pending invitation ─────────────────────────────────────────────
async function revokePendingInvitation(client, event, salonCtx, body) {
  const meta = clientMeta(event);
  const invitationId = String(body.invitationId || "").trim();
  if (!invitationId) return error(400, "VALIDATION_ERROR", "invitationId is required");

  // Cancelling a pending invitation is a protected lifecycle op: keep the state
  // change and its audit row in one transaction so a failed audit fails closed.
  await client.query("BEGIN");
  try {
    const result = await client.query(
      `UPDATE salon_invitations
       SET status = 'revoked', revoked_at = now(), updated_at = now()
       WHERE id = $1 AND salon_id = $2 AND status = 'pending'
       RETURNING ${INVITATION_COLUMNS}`,
      [invitationId, salonCtx.salonId],
    );
    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return error(404, "NOT_FOUND", "No pending invitation with that id");
    }
    await insertAuditEventStrict(client, {
      actorUserId: salonCtx.userId,
      salonId: salonCtx.salonId,
      action: "invite_revoke",
      entityType: "invitation",
      entityId: invitationId,
      ip: meta.ip,
      device: meta.device,
    });
    await client.query("COMMIT");
    return success(200, { invitation: rowToInvitation(result.rows[0]) });
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  }
}

// ── Accept (PUBLIC — the code is the credential) ────────────────────────────
async function acceptInvitation(client, event, body) {
  const meta = clientMeta(event);
  const invitationId = String(body.invitationId || "").trim();
  const code = String(body.code || "").trim();
  if (!invitationId || !code) return error(400, "VALIDATION_ERROR", "invitationId and code are required");

  await client.query("BEGIN");
  try {
    const found = await client.query(
      `SELECT id, salon_id, membership_id, invited_user_id, email, phone, channel,
              access_role_id, role, status, expires_at, attempt_count, max_attempts,
              code_salt, code_hash
       FROM salon_invitations WHERE id = $1 FOR UPDATE`,
      [invitationId],
    );
    if (found.rows.length === 0) {
      await client.query("ROLLBACK");
      return error(404, "INVITATION_NOT_FOUND", "Invitation not found");
    }
    const invite = found.rows[0];

    try {
      assertInvitationRedeemable(invite);
    } catch (err) {
      await client.query("ROLLBACK");
      if (err instanceof InvitationError) return error(err.statusCode, err.code, err.message);
      throw err;
    }

    const ok = verifyInvitationCode(code, invite.code_salt, invite.code_hash);
    if (!ok) {
      const attempt = registerCodeAttempt(invite, false);
      await client.query(
        `UPDATE salon_invitations SET attempt_count = $2, updated_at = now() WHERE id = $1`,
        [invite.id, attempt.attemptCount],
      );
      await insertAuditEventStrict(client, {
        salonId: invite.salon_id,
        action: "accept",
        entityType: "invitation",
        entityId: invite.id,
        after: { result: "invalid_code", attemptCount: attempt.attemptCount, locked: attempt.locked },
        ip: meta.ip,
        device: meta.device,
      });
      await client.query("COMMIT");
      if (attempt.locked) {
        return error(429, "TOO_MANY_ATTEMPTS", "This invitation is now locked after too many incorrect attempts.");
      }
      return error(401, "INVALID_CODE", "The code is incorrect.");
    }

    // ── Success: resolve/create the login user, then activate the membership.
    let userId = invite.invited_user_id;
    if (!userId) {
      const displayName =
        (body.displayName && String(body.displayName).trim()) ||
        (invite.email ? invite.email.split("@")[0] : null) ||
        (invite.phone ? `Member ${invite.phone.slice(-4)}` : "New member");
      const createdUser = await client.query(
        `INSERT INTO crm_users (email, phone, display_name, status)
         VALUES ($1, $2, $3, 'active')
         RETURNING id`,
        [invite.email || null, invite.phone || null, displayName],
      );
      userId = createdUser.rows[0].id;
    }

    // Upsert the membership into an active state. sessions_valid_after is
    // cleared so a freshly-issued token is immediately valid.
    let membershipRow;
    if (invite.membership_id) {
      const cur = await client.query(
        `SELECT id, COALESCE(status,'active') AS status, role FROM salon_memberships WHERE id = $1`,
        [invite.membership_id],
      );
      if (cur.rows.length) {
        const current = normalizeMembershipStatus(cur.rows[0].status);
        if (current !== "active") assertMembershipTransition(current, "active");
      }
      const upd = await client.query(
        `UPDATE salon_memberships
         SET status = 'active', accepted_at = now(), activated_at = now(),
             sessions_valid_after = NULL, updated_at = now(),
             access_role_id = COALESCE($2, access_role_id)
         WHERE id = $1
         RETURNING id, salon_id, user_id, role`,
        [invite.membership_id, invite.access_role_id],
      );
      membershipRow = upd.rows[0];
    } else {
      const ins = await client.query(
        `INSERT INTO salon_memberships
           (salon_id, user_id, role, access_role_id, status, accepted_at, activated_at, updated_at)
         VALUES ($1, $2, $3, $4, 'active', now(), now(), now())
         ON CONFLICT (salon_id, user_id) DO UPDATE
           SET status = 'active', accepted_at = now(), activated_at = now(),
               sessions_valid_after = NULL, updated_at = now()
         RETURNING id, salon_id, user_id, role`,
        [invite.salon_id, userId, invite.role || "viewer", invite.access_role_id],
      );
      membershipRow = ins.rows[0];
    }

    await client.query(
      `UPDATE salon_invitations
       SET status = 'accepted', accepted_at = now(), accepted_user_id = $2, updated_at = now()
       WHERE id = $1`,
      [invite.id, userId],
    );

    await insertAuditEventStrict(client, {
      actorUserId: userId,
      salonId: invite.salon_id,
      action: "accept",
      entityType: "membership",
      entityId: membershipRow.id,
      after: { result: "accepted", userId, membershipId: membershipRow.id },
      ip: meta.ip,
      device: meta.device,
    });

    await client.query("COMMIT");

    // Issue a session for the newly active member when a secret is configured.
    let token = null;
    let exp = null;
    if (process.env.SALON_SESSION_SECRET) {
      token = signSalonSession({
        salonId: invite.salon_id,
        userId,
        role: membershipRow.role,
        ttlSeconds: SESSION_TTL_SECONDS,
      });
      exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
    }
    return success(200, {
      token,
      exp,
      salonId: invite.salon_id,
      userId,
      membershipId: membershipRow.id,
      role: membershipRow.role,
    });
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  }
}

// ── Suspend / revoke / reactivate a member's access ─────────────────────────
async function changeMembershipAccess(client, event, salonCtx, body, mode) {
  const meta = clientMeta(event);
  const userId = String(body.userId || "").trim();
  if (!userId) return error(400, "VALIDATION_ERROR", "userId is required");

  await client.query("BEGIN");
  try {
    // Serialize owner-safety-sensitive access changes per salon. Without this,
    // two concurrent suspend/revoke transactions targeting different owners can
    // each read "2 active owners", both pass assertNotLastActiveOwner, and
    // commit — leaving the salon with zero owners. A salon-scoped transaction
    // advisory lock forces them to run one after the other so the second sees
    // the first's effect. Held until COMMIT/ROLLBACK.
    await client.query(`SELECT pg_advisory_xact_lock(hashtext($1))`, [
      `salon-access-safety:${salonCtx.salonId}`,
    ]);

    const found = await client.query(
      `SELECT id, user_id, role, COALESCE(status,'active') AS status
       FROM salon_memberships WHERE salon_id = $1 AND user_id = $2 FOR UPDATE`,
      [salonCtx.salonId, userId],
    );
    if (found.rows.length === 0) {
      await client.query("ROLLBACK");
      return error(404, "NOT_FOUND", "Membership not found");
    }
    const membership = found.rows[0];
    const currentStatus = normalizeMembershipStatus(membership.status);

    const targetStatus = mode === "reactivate" ? "active" : mode === "suspend" ? "suspended" : "revoked";

    // Owner safety: never suspend/revoke the last active owner.
    if (mode !== "reactivate") {
      const memberships = await loadMembershipsForOwnerSafety(client, salonCtx.salonId);
      try {
        assertNotLastActiveOwner(memberships, { userId, nextStatus: targetStatus });
      } catch (err) {
        await client.query("ROLLBACK");
        if (err instanceof PermissionError) return error(err.statusCode, err.code, err.message);
        throw err;
      }
    }

    try {
      assertMembershipTransition(currentStatus, targetStatus);
    } catch (err) {
      await client.query("ROLLBACK");
      if (err instanceof InvitationError) return error(err.statusCode, err.code, err.message);
      throw err;
    }

    // Suspend/revoke bumps sessions_valid_after to now → existing tokens die.
    // Reactivate clears it so new tokens are valid again.
    const setSessionCutoff = mode === "reactivate" ? "sessions_valid_after = NULL" : "sessions_valid_after = now()";
    const timestampCol = mode === "suspend" ? "suspended_at = now()," : mode === "revoke" ? "revoked_at = now()," : "activated_at = now(),";
    const updated = await client.query(
      `UPDATE salon_memberships
       SET status = $2, ${timestampCol} ${setSessionCutoff}, updated_at = now()
       WHERE id = $1
       RETURNING id, user_id, role, status`,
      [membership.id, targetStatus],
    );

    await insertAuditEventStrict(client, {
      actorUserId: salonCtx.userId,
      salonId: salonCtx.salonId,
      action: mode === "reactivate" ? "access_reactivate" : mode === "suspend" ? "access_suspend" : "access_revoke",
      entityType: "membership",
      entityId: membership.id,
      before: { status: currentStatus },
      after: { status: targetStatus },
      reason: body.reason ? String(body.reason) : null,
      ip: meta.ip,
      device: meta.device,
    });

    await client.query("COMMIT");
    return success(200, {
      membership: {
        id: updated.rows[0].id,
        userId: updated.rows[0].user_id,
        role: updated.rows[0].role,
        status: updated.rows[0].status,
      },
    });
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  }
}

async function listInvitations(client, salonCtx, event) {
  const status = event.queryStringParameters?.status;
  const params = [salonCtx.salonId];
  let where = "salon_id = $1";
  if (["pending", "accepted", "revoked", "expired"].includes(status)) {
    params.push(status);
    where += ` AND status = $${params.length}`;
  }
  const result = await client.query(
    `SELECT ${INVITATION_COLUMNS} FROM salon_invitations WHERE ${where} ORDER BY created_at DESC LIMIT 200`,
    params,
  );
  return success(200, { invitations: result.rows.map(rowToInvitation) }, { count: result.rows.length });
}

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") return success(200, {});

  const method = event.httpMethod;
  const segments = parsePath(event);
  const action = segments[0] || "";
  const { body, parseError } = parseJsonBody(event);
  if (parseError) return error(400, "VALIDATION_ERROR", parseError);

  const isPublicAccept = method === "POST" && action === "accept";

  if (!isPublicAccept && hasForbiddenSalonInput(event, body)) {
    return error(400, "VALIDATION_ERROR", "salonId is resolved by the server and must not be sent by the client");
  }

  if (!hasDatabaseUrl()) {
    return error(500, "DATABASE_NOT_CONFIGURED", "Database is not configured");
  }

  // Accept is public: the one-time code is the credential, so it runs without a
  // session and without RBAC. Everything else requires manage_permissions.
  let salonCtx = null;
  if (!isPublicAccept) {
    try {
      salonCtx = resolveSalonContext(event);
    } catch (err) {
      if (err instanceof SalonAuthError) return error(err.statusCode, err.code || "UNAUTHORIZED", err.message);
      return error(401, "UNAUTHORIZED", "Unauthorized");
    }
  }

  let client;
  try {
    client = await getClient();

    // Reject sessions whose backing membership was suspended/revoked (or whose
    // token predates the sessions_valid_after cutoff). The public accept route
    // has no session and is skipped.
    if (!isPublicAccept) {
      try {
        await enforceSessionStatus(client, salonCtx);
      } catch (err) {
        if (err instanceof SalonAuthError) return error(err.statusCode, err.code || "UNAUTHORIZED", err.message);
        throw err;
      }
    }

    // The membership check above refreshes any database-backed access role.
    // Keep legacy signed roles as a fallback for pre-RBAC memberships/tokens.
    if (!isPublicAccept) {
      try {
        requireContextPermission(salonCtx, "permissions", "manage_permissions", "salon");
      } catch (err) {
        if (err instanceof PermissionError) return error(err.statusCode, err.code, err.message);
        throw err;
      }
    }

    if (method === "GET" && segments.length === 0) return await listInvitations(client, salonCtx, event);
    if (method === "POST" && segments.length === 0) return await createInvitation(client, event, salonCtx, body);
    if (isPublicAccept) return await acceptInvitation(client, event, body);
    if (method === "POST" && action === "resend") return await resendInvitation(client, event, salonCtx, body);
    if (method === "POST" && action === "revoke-invitation") return await revokePendingInvitation(client, event, salonCtx, body);
    if (method === "POST" && action === "suspend") return await changeMembershipAccess(client, event, salonCtx, body, "suspend");
    if (method === "POST" && action === "revoke") return await changeMembershipAccess(client, event, salonCtx, body, "revoke");
    if (method === "POST" && action === "reactivate") return await changeMembershipAccess(client, event, salonCtx, body, "reactivate");

    return error(404, "NOT_FOUND", "Not found");
  } catch (err) {
    if (err instanceof InvitationError) return error(err.statusCode, err.code, err.message);
    if (err instanceof PermissionError) return error(err.statusCode, err.code, err.message);
    if (err.code === "23505") return error(409, "DUPLICATE", "A conflicting record already exists.");
    if (err.code === "23503") return error(400, "VALIDATION_ERROR", "A referenced record does not exist.");
    if (err.code === "42P01") return error(500, "SCHEMA_NOT_READY", "Invitation/audit tables are not available. Run migration 042.");
    if (err.code === "42703") return error(500, "SCHEMA_NOT_READY", "Membership lifecycle columns are missing. Run migration 042.");
    console.error("[salon-invitations] error:", err.message);
    return error(500, "INTERNAL_ERROR", "Internal server error");
  } finally {
    if (client) await client.end().catch(() => {});
  }
};

// Re-export pure helpers for convenience/testing.
exports.rowToInvitation = rowToInvitation;
exports.normalizeEmail = normalizeEmail;
exports.normalizeInvitePhone = normalizeInvitePhone;
exports.resolveInvitationAccess = resolveInvitationAccess;
