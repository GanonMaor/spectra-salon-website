/**
 * Access invitations API adapter (frontend).
 *
 * Thin client over `netlify/functions/salon-invitations`. The server owns the
 * entire security lifecycle (personal single-use codes, hashing, expiry,
 * attempt limits, membership state machine, owner safety, audit). This adapter
 * only reflects that state and forwards intent — it never sends a salon id and
 * never sees a stored code (the raw code is returned once on create/resend for
 * out-of-band delivery).
 */

import { callSalonJson } from "./salonApiClient";

const FUNCTION = "salon-invitations";

export type InvitationStatus = "pending" | "accepted" | "revoked" | "expired";

export interface Invitation {
  id: string;
  salonId: string;
  email: string | null;
  phone: string | null;
  channel: "email" | "phone" | "both";
  accessRoleId: string | null;
  role: string | null;
  status: InvitationStatus;
  expiresAt: string | null;
  attemptCount: number;
  maxAttempts: number;
  invitedUserId: string | null;
  membershipId: string | null;
  acceptedAt: string | null;
  createdAt: string;
}

export interface CreateInvitationInput {
  email?: string;
  phone?: string;
  /** Legacy coarse role (owner/manager/reception/…) used for RBAC resolution. */
  role?: string;
  /** Access-role catalog reference (future data-backed roles). */
  accessRoleId?: string;
  /** Owner explicitly approves linking a contact already on a staff record. */
  ownerApproved?: boolean;
  ttlHours?: number;
  maxAttempts?: number;
}

export interface CreatedInvitation {
  invitation: Invitation;
  /** One-time code, returned once for out-of-band delivery. Never persisted. */
  code: string;
  /** Server classification of how the invite resolves (create_user, attach_membership…). */
  action?: string;
}

export interface MembershipAccessResult {
  membership: { id: string; userId: string; role: string; status: string };
}

export async function listInvitations(status?: InvitationStatus): Promise<Invitation[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  const { data } = await callSalonJson<{ invitations: Invitation[] }>(FUNCTION, `/${query}`);
  return data?.invitations ?? [];
}

export async function createInvitation(input: CreateInvitationInput): Promise<CreatedInvitation> {
  const { data, meta } = await callSalonJson<{ invitation: Invitation; code: string }>(FUNCTION, "/", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return { invitation: data.invitation, code: data.code, action: meta?.action as string | undefined };
}

export async function resendInvitation(invitationId: string): Promise<CreatedInvitation> {
  const { data } = await callSalonJson<{ invitation: Invitation; code: string }>(FUNCTION, "/resend", {
    method: "POST",
    body: JSON.stringify({ invitationId }),
  });
  return { invitation: data.invitation, code: data.code };
}

export async function revokePendingInvitation(invitationId: string): Promise<Invitation> {
  const { data } = await callSalonJson<{ invitation: Invitation }>(FUNCTION, "/revoke-invitation", {
    method: "POST",
    body: JSON.stringify({ invitationId }),
  });
  return data.invitation;
}

export async function suspendMemberAccess(userId: string, reason?: string): Promise<MembershipAccessResult> {
  const { data } = await callSalonJson<MembershipAccessResult>(FUNCTION, "/suspend", {
    method: "POST",
    body: JSON.stringify({ userId, reason }),
  });
  return data;
}

export async function revokeMemberAccess(userId: string, reason?: string): Promise<MembershipAccessResult> {
  const { data } = await callSalonJson<MembershipAccessResult>(FUNCTION, "/revoke", {
    method: "POST",
    body: JSON.stringify({ userId, reason }),
  });
  return data;
}

export async function reactivateMemberAccess(userId: string): Promise<MembershipAccessResult> {
  const { data } = await callSalonJson<MembershipAccessResult>(FUNCTION, "/reactivate", {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
  return data;
}
