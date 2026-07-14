/**
 * Professional-roles API adapter (frontend).
 *
 * Thin client over `netlify/functions/salon-professional-roles`. Professional
 * roles describe what professional work a person can do (departments, allowed
 * services, split-stage capabilities, default price/time) and grant NO system
 * access — that is the RBAC/invitations slice.
 *
 * The server derives salon_id from the session; this adapter never sends it.
 */

import { callSalonJson } from "./salonApiClient";
import type {
  CreateProfessionalRoleInput,
  ProfessionalRole,
  ProfessionalRoleStatus,
  StaffProfessionalRole,
  UpdateProfessionalRoleInput,
} from "./crmTypes";

const FUNCTION = "salon-professional-roles";

export interface ProfessionalRolesResponse {
  roles: ProfessionalRole[];
  assignments: StaffProfessionalRole[];
}

export interface UpsertAssignmentInput {
  staffMemberId: string;
  professionalRoleId: string;
  isPrimary?: boolean;
  primaryServiceIds?: string[];
  servicePriceOverrides?: Record<string, number>;
}

/** Explicit action to unblock archiving a role that is still assigned. */
export interface RoleArchiveActions {
  reassignRoleId?: string;
  force?: boolean;
}

/** List professional roles + staff↔role assignments. */
export async function listProfessionalRoles(
  status: ProfessionalRoleStatus | "all" = "all",
): Promise<ProfessionalRolesResponse> {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  const { data } = await callSalonJson<ProfessionalRolesResponse>(FUNCTION, `/${query}`);
  return { roles: data?.roles ?? [], assignments: data?.assignments ?? [] };
}

export async function createProfessionalRole(input: CreateProfessionalRoleInput): Promise<ProfessionalRole> {
  const { data } = await callSalonJson<{ role: ProfessionalRole }>(FUNCTION, "/roles", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data.role;
}

export async function updateProfessionalRole(
  id: string,
  patch: UpdateProfessionalRoleInput & RoleArchiveActions,
): Promise<ProfessionalRole> {
  const { data } = await callSalonJson<{ role: ProfessionalRole }>(
    FUNCTION,
    `/roles/${encodeURIComponent(id)}`,
    { method: "PATCH", body: JSON.stringify(patch) },
  );
  return data.role;
}

export async function upsertRoleAssignment(input: UpsertAssignmentInput): Promise<StaffProfessionalRole> {
  const { data } = await callSalonJson<{ assignment: StaffProfessionalRole }>(FUNCTION, "/assignments", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data.assignment;
}

export async function deleteRoleAssignment(assignmentId: string): Promise<void> {
  await callSalonJson<void>(FUNCTION, `/assignments/${encodeURIComponent(assignmentId)}`, {
    method: "DELETE",
  });
}
