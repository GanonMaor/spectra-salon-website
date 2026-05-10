/**
 * CRM AI engine — deterministic command planner.
 *
 * The engine maps natural-language schedule commands to typed actions
 * on the canonical state. It runs in three explicit phases:
 *
 *   1. Parse: classify the intent, extract candidate entities.
 *   2. Validate: resolve targets against canonical state, reject when
 *      ambiguous (e.g. "Lisa" matches two clients), missing inputs,
 *      or unknown commands.
 *   3. Execute: dispatch validated actions through `CRMActions` and
 *      collect their structured `ActionResult`s.
 *
 * Every command produces an `AITrace` (intent, parsed entities,
 * decision, rejected reason, action trace ids, state version) which
 * goes through the action logger so AI behavior is reproducible and
 * debuggable. Actions are never called with unvalidated IDs.
 *
 * Future LLM integration plugs in by replacing `parseCommand` with a
 * real planner; everything from validation downward stays the same.
 */

import {
  selectAllAppointments,
  selectStaff,
} from "./crmSelectors";
import type { CRMActions } from "./crmHooks";
import {
  isFail,
  nextTraceId,
  type AIDecision,
  type AIRejectionReason,
  type AITrace,
  type ActionResult,
} from "./crmContracts";
import { recordAITrace } from "./crmActionLogger";
import type {
  Appointment,
  AppointmentStatus,
  CRMNormalizedState,
  ServiceCategoryId,
  StaffMember,
} from "./crmTypes";

// ── Command versioning ───────────────────────────────────────────

/** Bump this when the supported-command surface changes. */
export const AI_COMMAND_VERSION = "1.0.0";

export type AICommandIntent =
  | "create"
  | "move"
  | "cancel"
  | "assign_staff"
  | "update_notes"
  | "complete";

const SUPPORTED_INTENTS: readonly AICommandIntent[] = [
  "create",
  "move",
  "cancel",
  "assign_staff",
  "update_notes",
  "complete",
] as const;

// ── Plan / parse types ───────────────────────────────────────────

interface ParsedCommand extends Record<string, unknown> {
  intent: AICommandIntent | null;
  rawCommand: string;
  candidateClient?: string;
  candidateStaff?: string;
  time?: string;
  date?: string;
  notes?: string;
  category?: ServiceCategoryId;
}

interface ResolvedTargets {
  appointment?: Appointment;
  staff?: StaffMember;
  matchingAppointments?: Appointment[];
}

export interface AICommandPlan {
  intent: AICommandIntent;
  appointmentId?: string;
  newStartTime?: string;
  newEndTime?: string;
  staffMemberId?: string;
  notes?: string;
  /** Used for "create" intents only. */
  draftAppointmentInput?: {
    staffMemberId: string;
    customerName: string;
    serviceName: string;
    serviceCategoryId: ServiceCategoryId;
    startTime: string;
    endTime: string;
    status: AppointmentStatus;
  };
}

export type AIIntent =
  | { type: "create"; appointment: Appointment }
  | { type: "move"; appointmentId: string; newStartTime: string; newEndTime: string }
  | { type: "cancel"; appointmentId: string }
  | { type: "assign_staff"; appointmentId: string; staffId: string }
  | { type: "update_notes"; appointmentId: string; notes: string }
  | { type: "complete"; appointmentId: string };

export interface AICommandResult {
  status: "executed" | "missing" | "error";
  intent?: AIIntent;
  message: string;
  missing?: string[];
  /** AI trace id for log correlation. */
  traceId: string;
  /** Action trace ids produced (if any). */
  actionTraceIds: string[];
  /** Current snapshot version when the command ran. */
  stateVersion: number;
}

// ── Public entry point ──────────────────────────────────────────

export function runScheduleCommand(
  command: string,
  state: CRMNormalizedState,
  actions: CRMActions,
): AICommandResult {
  const traceId = nextTraceId("ai");
  const stateVersion = state.version ?? 0;
  const trimmed = (command ?? "").trim();

  if (!trimmed) {
    return finish({
      traceId,
      stateVersion,
      decision: "missing_input",
      rejectedReason: "MISSING_INPUT",
      rawCommand: trimmed,
      parsedEntities: {},
      message: "Command was empty.",
      status: "missing",
      missing: ["command"],
    });
  }

  // ── Phase 1: parse ───────────────────────────────────────────
  const parsed = parseCommand(trimmed);

  if (!parsed.intent) {
    return finish({
      traceId,
      stateVersion,
      decision: "unknown_command",
      rejectedReason: "UNKNOWN_COMMAND",
      rawCommand: trimmed,
      parsedEntities: parsed,
      message:
        'I couldn\'t parse that command. Try "move Lisa to 15:00" or "cancel Maya".',
      status: "error",
    });
  }

  // ── Phase 2: resolve targets ─────────────────────────────────
  const allAppointments = selectAllAppointments(state);
  const staffList = selectStaff(state);
  const targets = resolveTargets(parsed, allAppointments, staffList);

  if (targets.matchingAppointments && targets.matchingAppointments.length > 1) {
    return finish({
      traceId,
      stateVersion,
      intent: parsed.intent,
      decision: "ambiguous",
      rejectedReason: "AMBIGUOUS_TARGET",
      rawCommand: trimmed,
      parsedEntities: parsed,
      message: `Multiple matches for "${parsed.candidateClient}". Please be more specific.`,
      status: "missing",
      missing: ["client"],
    });
  }

  // ── Phase 3: dispatch by intent ──────────────────────────────
  switch (parsed.intent) {
    case "cancel": {
      if (!targets.appointment) {
        return finish({
          traceId, stateVersion, intent: parsed.intent,
          decision: "missing_input", rejectedReason: "MISSING_TARGET",
          rawCommand: trimmed, parsedEntities: parsed,
          message: "Which client should I cancel?", status: "missing", missing: ["client"],
        });
      }
      const result = actions.deleteAppointment(targets.appointment.id);
      return finalizeAction(
        result,
        {
          traceId, stateVersion, intent: parsed.intent, rawCommand: trimmed,
          parsedEntities: { ...parsed, appointmentId: targets.appointment.id },
        },
        () => ({
          status: "executed",
          intent: { type: "cancel", appointmentId: targets.appointment!.id },
          message: `Cancelled ${targets.appointment!.customerName}.`,
        }),
      );
    }

    case "complete": {
      if (!targets.appointment) {
        return finish({
          traceId, stateVersion, intent: parsed.intent,
          decision: "missing_input", rejectedReason: "MISSING_TARGET",
          rawCommand: trimmed, parsedEntities: parsed,
          message: "Which appointment is complete?", status: "missing", missing: ["client"],
        });
      }
      const result = actions.updateAppointment(targets.appointment.id, { status: "completed" });
      return finalizeAction(
        result,
        {
          traceId, stateVersion, intent: parsed.intent, rawCommand: trimmed,
          parsedEntities: { ...parsed, appointmentId: targets.appointment.id },
        },
        () => ({
          status: "executed",
          intent: { type: "complete", appointmentId: targets.appointment!.id },
          message: `Marked ${targets.appointment!.customerName} complete.`,
        }),
      );
    }

    case "move": {
      if (!targets.appointment) {
        return finish({
          traceId, stateVersion, intent: parsed.intent,
          decision: "missing_input", rejectedReason: "MISSING_TARGET",
          rawCommand: trimmed, parsedEntities: parsed,
          message: "Which appointment should I move?", status: "missing", missing: ["client"],
        });
      }
      if (!parsed.time) {
        return finish({
          traceId, stateVersion, intent: parsed.intent,
          decision: "missing_input", rejectedReason: "INVALID_TIME",
          rawCommand: trimmed, parsedEntities: parsed,
          message: "What time should I move them to?", status: "missing", missing: ["time"],
        });
      }
      const baseDay = parsed.date ?? toDateString(new Date(targets.appointment.startTime));
      const newStart = new Date(`${baseDay}T${parsed.time}:00.000Z`);
      const duration =
        new Date(targets.appointment.endTime).getTime() -
        new Date(targets.appointment.startTime).getTime();
      const newEnd = new Date(newStart.getTime() + duration);
      const startIso = localizeIso(newStart, targets.appointment.startTime);
      const endIso = localizeIso(newEnd, targets.appointment.endTime);
      const result = actions.updateAppointment(targets.appointment.id, {
        startTime: startIso,
        endTime: endIso,
      });
      return finalizeAction(
        result,
        {
          traceId, stateVersion, intent: parsed.intent, rawCommand: trimmed,
          parsedEntities: {
            ...parsed,
            appointmentId: targets.appointment.id,
            newStartTime: startIso,
            newEndTime: endIso,
          },
        },
        () => ({
          status: "executed",
          intent: {
            type: "move",
            appointmentId: targets.appointment!.id,
            newStartTime: newStart.toISOString(),
            newEndTime: newEnd.toISOString(),
          },
          message: `Moved ${targets.appointment!.customerName} to ${parsed.time}.`,
        }),
      );
    }

    case "assign_staff": {
      if (!targets.appointment) {
        return finish({
          traceId, stateVersion, intent: parsed.intent,
          decision: "missing_input", rejectedReason: "MISSING_TARGET",
          rawCommand: trimmed, parsedEntities: parsed,
          message: "Which appointment should I reassign?", status: "missing", missing: ["client"],
        });
      }
      if (!targets.staff) {
        return finish({
          traceId, stateVersion, intent: parsed.intent,
          decision: "missing_input", rejectedReason: "MISSING_INPUT",
          rawCommand: trimmed, parsedEntities: parsed,
          message: "Which stylist?", status: "missing", missing: ["staff"],
        });
      }
      const result = actions.updateAppointment(targets.appointment.id, {
        staffMemberId: targets.staff.id,
      });
      return finalizeAction(
        result,
        {
          traceId, stateVersion, intent: parsed.intent, rawCommand: trimmed,
          parsedEntities: {
            ...parsed,
            appointmentId: targets.appointment.id,
            staffId: targets.staff.id,
          },
        },
        () => ({
          status: "executed",
          intent: {
            type: "assign_staff",
            appointmentId: targets.appointment!.id,
            staffId: targets.staff!.id,
          },
          message: `Assigned ${targets.appointment!.customerName} to ${targets.staff!.name}.`,
        }),
      );
    }

    case "update_notes": {
      if (!targets.appointment) {
        return finish({
          traceId, stateVersion, intent: parsed.intent,
          decision: "missing_input", rejectedReason: "MISSING_TARGET",
          rawCommand: trimmed, parsedEntities: parsed,
          message: "Which appointment needs the note?", status: "missing", missing: ["client"],
        });
      }
      const note = parsed.notes ?? "";
      const result = actions.updateAppointment(targets.appointment.id, { notes: note });
      return finalizeAction(
        result,
        {
          traceId, stateVersion, intent: parsed.intent, rawCommand: trimmed,
          parsedEntities: { ...parsed, appointmentId: targets.appointment.id, notes: note },
        },
        () => ({
          status: "executed",
          intent: {
            type: "update_notes",
            appointmentId: targets.appointment!.id,
            notes: note,
          },
          message: `Updated notes for ${targets.appointment!.customerName}.`,
        }),
      );
    }

    case "create": {
      if (!parsed.time) {
        return finish({
          traceId, stateVersion, intent: parsed.intent,
          decision: "missing_input", rejectedReason: "INVALID_TIME",
          rawCommand: trimmed, parsedEntities: parsed,
          message: "What time?", status: "missing", missing: ["time"],
        });
      }
      const member = targets.staff ?? staffList[0];
      if (!member) {
        return finish({
          traceId, stateVersion, intent: parsed.intent,
          decision: "missing_input", rejectedReason: "MISSING_INPUT",
          rawCommand: trimmed, parsedEntities: parsed,
          message: "No staff available to assign.", status: "missing", missing: ["staff"],
        });
      }
      const category = parsed.category ?? "color";
      const baseDay = parsed.date ?? toDateString(new Date());
      const start = new Date(`${baseDay}T${parsed.time}:00.000Z`);
      const end = new Date(start.getTime() + 60 * 60_000);
      const result = actions.createAppointment({
        staffMemberId: member.id,
        customerName: parsed.candidateClient ?? "Walk-in",
        serviceName: humanizeCategory(category),
        serviceCategoryId: category,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        status: "confirmed",
      });
      return finalizeAction(
        result,
        {
          traceId, stateVersion, intent: parsed.intent, rawCommand: trimmed,
          parsedEntities: {
            ...parsed,
            staffMemberId: member.id,
            startTime: start.toISOString(),
            endTime: end.toISOString(),
            serviceCategoryId: category,
          },
        },
        (appt) => ({
          status: "executed",
          intent: { type: "create", appointment: appt as Appointment },
          message: `Created appointment for ${(appt as Appointment).customerName}.`,
        }),
      );
    }
  }

  return finish({
    traceId, stateVersion, intent: parsed.intent, decision: "unknown_command",
    rejectedReason: "UNKNOWN_COMMAND", rawCommand: trimmed, parsedEntities: parsed,
    message: "Unsupported command.", status: "error",
  });
}

// ── Parser ───────────────────────────────────────────────────────

function parseCommand(command: string): ParsedCommand {
  const lc = command.toLowerCase();
  const intent = detectIntent(lc);
  const candidateClient = extractClientName(command);
  const time = parseTime(lc) ?? undefined;
  const date = parseRelativeDate(lc) ?? undefined;
  const noteMatch = command.match(/['"](.*)['"]/);
  const notes = noteMatch
    ? noteMatch[1]
    : intent === "update_notes"
      ? command.replace(/^note(s)?\b/i, "").trim()
      : undefined;
  const category = inferCategory(lc);

  return {
    intent,
    rawCommand: command,
    candidateClient: candidateClient ?? undefined,
    time,
    date,
    notes,
    category: intent === "create" ? category : undefined,
  };
}

function detectIntent(lc: string): AICommandIntent | null {
  if (/^(cancel|delete)\b/.test(lc)) return "cancel";
  if (/^(complete|finish|done)\b/.test(lc)) return "complete";
  if (/^(move|reschedule|push)\b/.test(lc)) return "move";
  if (/^(assign|reassign)\b/.test(lc)) return "assign_staff";
  if (/^note(s)?\b/.test(lc)) return "update_notes";
  if (/^(book|create|add)\b/.test(lc)) return "create";
  return null;
}

// ── Resolver ─────────────────────────────────────────────────────

function resolveTargets(
  parsed: ParsedCommand,
  appointments: Appointment[],
  staff: StaffMember[],
): ResolvedTargets {
  const out: ResolvedTargets = {};
  const lc = parsed.rawCommand.toLowerCase();

  // Appointment match (by client name first-name token)
  const matches = appointments.filter((appt) => {
    const first = appt.customerName.toLowerCase().split(" ")[0];
    if (!first || first.length < 3) return false;
    return lc.includes(first);
  });

  if (matches.length === 1) {
    out.appointment = matches[0];
  } else if (matches.length > 1) {
    out.matchingAppointments = matches;
  }

  // Staff match (only when relevant intent)
  if (parsed.intent === "assign_staff" || parsed.intent === "create") {
    const member = staff.find((s) => {
      const tokens = s.name.toLowerCase().split(/\s+/);
      return tokens.some((t) => t.length >= 3 && lc.includes(t));
    });
    if (member) out.staff = member;
  }

  return out;
}

// ── Helpers ──────────────────────────────────────────────────────

function parseTime(command: string): string | null {
  const match = command.match(/\b(\d{1,2})(?::(\d{2}))?\s?(am|pm)?\b/);
  if (!match) return null;
  let hour = parseInt(match[1], 10);
  const minute = match[2] ? parseInt(match[2], 10) : 0;
  const meridiem = match[3]?.toLowerCase();
  if (meridiem === "pm" && hour < 12) hour += 12;
  if (meridiem === "am" && hour === 12) hour = 0;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return `${pad(hour)}:${pad(minute)}`;
}

function parseRelativeDate(command: string): string | null {
  if (/\btomorrow\b/.test(command)) {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return toDateString(d);
  }
  if (/\btoday\b/.test(command)) return toDateString(new Date());
  return null;
}

function inferCategory(command: string): ServiceCategoryId {
  if (command.includes("highlight")) return "highlights";
  if (command.includes("balayage")) return "highlights";
  if (command.includes("toner")) return "toner";
  if (command.includes("cut") || command.includes("trim")) return "cut";
  if (command.includes("keratin") || command.includes("straight")) return "straightening";
  if (command.includes("treat") || command.includes("olaplex")) return "treatment";
  return "color";
}

function humanizeCategory(cat: ServiceCategoryId): string {
  switch (cat) {
    case "color": return "Color";
    case "highlights": return "Highlights";
    case "toner": return "Toner";
    case "straightening": return "Straightening";
    case "treatment": return "Treatment";
    case "cut": return "Cut";
    default: return "Service";
  }
}

function extractClientName(command: string): string | null {
  const match = command.match(/\bfor ([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\b/);
  return match ? match[1] : null;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function toDateString(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function localizeIso(target: Date, reference: string): string {
  const ref = new Date(reference);
  const refOffsetMin = ref.getTimezoneOffset();
  const tgt = new Date(target.getTime() + refOffsetMin * 60_000);
  return tgt.toISOString();
}

// ── Trace finalization ──────────────────────────────────────────

interface FinishArgs {
  traceId: string;
  stateVersion: number;
  rawCommand: string;
  parsedEntities: Record<string, unknown>;
  intent?: AICommandIntent;
  decision: AIDecision;
  rejectedReason?: AIRejectionReason;
  status: AICommandResult["status"];
  message: string;
  missing?: string[];
  intentPayload?: AIIntent;
  actionTraceIds?: string[];
}

function finish(args: FinishArgs): AICommandResult {
  const trace: AITrace = {
    id: args.traceId,
    timestamp: new Date().toISOString(),
    rawCommand: args.rawCommand,
    intent: args.intent,
    parsedEntities: args.parsedEntities,
    decision: args.decision,
    rejectedReason: args.rejectedReason,
    actionsTriggered: args.actionTraceIds ?? [],
    stateVersion: args.stateVersion,
  };
  recordAITrace(trace);
  return {
    status: args.status,
    intent: args.intentPayload,
    message: args.message,
    missing: args.missing,
    traceId: args.traceId,
    actionTraceIds: args.actionTraceIds ?? [],
    stateVersion: args.stateVersion,
  };
}

interface FinalizeContext {
  traceId: string;
  stateVersion: number;
  intent: AICommandIntent;
  rawCommand: string;
  parsedEntities: Record<string, unknown>;
}

function finalizeAction<T>(
  result: ActionResult<T>,
  ctx: FinalizeContext,
  toIntent: (data?: T) => { status: AICommandResult["status"]; intent?: AIIntent; message: string; missing?: string[] },
): AICommandResult {
  if (isFail(result)) {
    return finish({
      traceId: ctx.traceId,
      stateVersion: ctx.stateVersion,
      intent: ctx.intent,
      decision: "rejected",
      rejectedReason: "ACTION_FAILED",
      rawCommand: ctx.rawCommand,
      parsedEntities: { ...ctx.parsedEntities, error: result.error },
      message: result.error.message,
      status: "error",
    });
  }
  const success = toIntent(result.data);
  return finish({
    traceId: ctx.traceId,
    stateVersion: ctx.stateVersion,
    intent: ctx.intent,
    decision: "executed",
    rawCommand: ctx.rawCommand,
    parsedEntities: ctx.parsedEntities,
    message: success.message,
    status: success.status,
    intentPayload: success.intent,
    missing: success.missing,
  });
}

// ── AI status helper for screens ─────────────────────────────────

export function describeAIStatus(result: AICommandResult): {
  type: "success" | "error" | "clarify";
  message: string;
} {
  if (result.status === "executed") return { type: "success", message: result.message };
  if (result.status === "missing") return { type: "clarify", message: result.message };
  return { type: "error", message: result.message };
}

export type AppointmentLike = Pick<Appointment, "id" | "customerName" | "startTime" | "endTime"> & {
  status: AppointmentStatus;
};

/** Static documentation of the supported command surface. Useful for
 *  the help UI and tests. */
export function listSupportedIntents(): readonly AICommandIntent[] {
  return SUPPORTED_INTENTS;
}
