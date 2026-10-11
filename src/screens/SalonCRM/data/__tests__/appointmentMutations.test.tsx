/**
 * Appointment mutation routing.
 *
 * Localhost tokenless devMode selects `seedCRMRepository`, whose write
 * methods throw. Hooks must mutate CRM state locally in that mode.
 * Live repositories (`supportsLiveWrites=true`) stay API-first and
 * dispatch the canonical server appointment (including segments).
 */

import { act, renderHook } from "@testing-library/react";
import { useCRMContext } from "../CRMDataProvider";
import { applyActionRequest } from "../crmActionRunner";
import { crmReducer, type CRMAction } from "../crmActions";
import { useCRMActions } from "../crmHooks";
import { seedCRMRepository, type CRMRepository } from "../crmRepository";
import { resetCRMStrictMode, setCRMStrictMode } from "../crmStrictMode";
import type {
  Appointment,
  CRMNormalizedState,
  CreateAppointmentInput,
  UpdateAppointmentInput,
} from "../crmTypes";

jest.mock("../CRMDataProvider", () => ({
  __esModule: true,
  useCRMContext: jest.fn(),
  useCRMState: jest.fn(),
}));

const mockedUseCRMContext = useCRMContext as jest.Mock;

const EXISTING_ID = "appt-existing";

const CREATE_INPUT: CreateAppointmentInput = {
  staffMemberId: "staff-1",
  customerName: "Walk-in Dana",
  serviceName: "Color",
  serviceCategoryId: "color",
  startTime: "2030-06-01T09:00:00.000Z",
  endTime: "2030-06-01T12:00:00.000Z",
  segments: [
    {
      segmentType: "apply",
      label: "Apply color",
      startTime: "2030-06-01T09:00:00.000Z",
      endTime: "2030-06-01T10:00:00.000Z",
      sortOrder: 0,
    },
    {
      segmentType: "wait",
      label: "Process",
      startTime: "2030-06-01T10:00:00.000Z",
      endTime: "2030-06-01T11:00:00.000Z",
      sortOrder: 1,
    },
    {
      segmentType: "wash",
      label: "Rinse",
      startTime: "2030-06-01T11:00:00.000Z",
      endTime: "2030-06-01T12:00:00.000Z",
      sortOrder: 2,
    },
  ],
};

function existingAppointment(): Appointment {
  return {
    id: EXISTING_ID,
    salonId: "salon-1",
    staffMemberId: "staff-1",
    customerId: "cust-1",
    customerName: "Maya Cohen",
    serviceName: "Root Color",
    serviceCategoryId: "color",
    startTime: "2030-01-15T10:00:00.000Z",
    endTime: "2030-01-15T12:00:00.000Z",
    status: "confirmed",
    notes: "keep-segments",
    segments: [
      {
        id: "seg-apply",
        appointmentId: EXISTING_ID,
        segmentType: "apply",
        label: "Apply",
        startTime: "2030-01-15T10:00:00.000Z",
        endTime: "2030-01-15T11:00:00.000Z",
        sortOrder: 0,
      },
      {
        id: "seg-wash",
        appointmentId: EXISTING_ID,
        segmentType: "wash",
        label: "Wash",
        startTime: "2030-01-15T11:00:00.000Z",
        endTime: "2030-01-15T12:00:00.000Z",
        sortOrder: 1,
      },
    ],
  };
}

function fixtureState(): CRMNormalizedState {
  const existing = existingAppointment();
  return {
    currentSalonId: "salon-1",
    salonsById: {
      "salon-1": {
        id: "salon-1",
        name: "Studio",
        slug: "studio",
        timezone: "Asia/Jerusalem",
        currency: "ILS",
        status: "active",
        onboardingStatus: "completed",
        workingHours: [],
      },
    },
    customersById: {
      "cust-1": {
        id: "cust-1",
        salonId: "salon-1",
        firstName: "Maya",
        lastName: "Cohen",
        tags: [],
        status: "active",
        isVip: false,
        createdAt: "2030-01-01T00:00:00.000Z",
        updatedAt: "2030-01-01T00:00:00.000Z",
      },
    },
    staffById: {
      "staff-1": {
        id: "staff-1",
        salonId: "salon-1",
        name: "Dana",
        role: "Stylist",
        color: "#D7897F",
        status: "active",
        rating: 5,
        workingHours: [],
      },
    },
    professionalRolesById: {},
    staffProfessionalRolesById: {},
    serviceCategoriesById: {} as CRMNormalizedState["serviceCategoriesById"],
    servicesById: {},
    appointmentsById: { [existing.id]: existing },
    visitsById: {},
    visitServicesById: {},
    brandsById: {},
    productLinesById: {},
    productsById: {},
    inventoryById: {},
    mixSessionsById: {},
    productUsageById: {},
    reweighOutcomesById: {},
    analyticsSnapshotsById: {},
    systemState: {
      activeDate: "2030-01-15",
      bluetooth: { connected: false, deviceLabel: "" },
      notifications: { unreadCount: 0, hasUrgent: false },
      comingSoonFeatures: {},
      marketplace: [],
    },
    version: 1,
    lastUpdatedAt: "2030-01-01T00:00:00.000Z",
  };
}

function createLiveRepository(handlers: {
  create?: (input: CreateAppointmentInput) => Promise<Appointment>;
  update?: (id: string, input: UpdateAppointmentInput) => Promise<Appointment>;
  delete?: (id: string) => Promise<Appointment>;
}): CRMRepository {
  return {
    supportsLiveWrites: true,
    createAppointment: jest.fn(
      handlers.create ?? (async () => {
        throw new Error("unexpected createAppointment");
      }),
    ),
    updateAppointment: jest.fn(
      handlers.update ?? (async () => {
        throw new Error("unexpected updateAppointment");
      }),
    ),
    deleteAppointment: jest.fn(
      handlers.delete ?? (async () => {
        throw new Error("unexpected deleteAppointment");
      }),
    ),
  } as unknown as CRMRepository;
}

function installActions(repository: CRMRepository, initial = fixtureState()) {
  const stateRef = { current: initial };
  const dispatch = (action: CRMAction) => {
    stateRef.current = crmReducer(stateRef.current, action);
  };
  mockedUseCRMContext.mockReturnValue({
    state: stateRef.current,
    dispatch,
    repository,
    stateRef,
    loading: false,
    error: null,
    errorDetail: null,
    hydrated: true,
    reload: async () => undefined,
    bootstrapStatus: "success",
    bootstrap: null,
    sessionFingerprint: "test",
  });
  return { ...renderHook(() => useCRMActions()), stateRef };
}

function segmentLabels(appointment: Appointment | undefined): string[] {
  return (appointment?.segments ?? []).map((segment) => segment.label);
}

beforeEach(() => {
  setCRMStrictMode({
    throwOnActionFailure: false,
    throwOnInvalidState: false,
    validateState: false,
  });
});

afterEach(() => {
  jest.restoreAllMocks();
  mockedUseCRMContext.mockReset();
  resetCRMStrictMode();
});

describe("seedCRMRepository write surface", () => {
  it("rejects create, update, and delete so callers must mutate local state", async () => {
    await expect(seedCRMRepository.createAppointment(CREATE_INPUT)).rejects.toThrow(
      /routed through crmActions/,
    );
    await expect(
      seedCRMRepository.updateAppointment(EXISTING_ID, { notes: "x" }),
    ).rejects.toThrow(/routed through crmActions/);
    await expect(seedCRMRepository.deleteAppointment(EXISTING_ID)).rejects.toThrow(
      /routed through crmActions/,
    );
  });
});

describe("local seed appointment mutations (action runner)", () => {
  it("creates an appointment with the supplied segments", () => {
    const start = fixtureState();
    const out = applyActionRequest<Appointment>(start, {
      type: "appointment.create",
      input: CREATE_INPUT,
    });

    expect(out.result.ok).toBe(true);
    if (!out.result.ok || !out.result.data) throw new Error("expected created appointment");
    expect(out.state).not.toBe(start);
    expect(out.state.appointmentsById[out.result.data.id]).toEqual(out.result.data);
    expect(segmentLabels(out.result.data)).toEqual(["Apply color", "Process", "Rinse"]);
    expect(out.state.appointmentsById[EXISTING_ID].segments).toEqual(
      start.appointmentsById[EXISTING_ID].segments,
    );
  });

  it("updates notes without dropping existing segments", () => {
    const start = fixtureState();
    const out = applyActionRequest(start, {
      type: "appointment.update",
      id: EXISTING_ID,
      input: { notes: "updated-at-desk" },
    });

    expect(out.result.ok).toBe(true);
    const updated = out.state.appointmentsById[EXISTING_ID];
    expect(updated.notes).toBe("updated-at-desk");
    expect(updated.segments).toEqual(start.appointmentsById[EXISTING_ID].segments);
  });

  it("deletes the appointment from local state", () => {
    const start = fixtureState();
    const out = applyActionRequest(start, {
      type: "appointment.delete",
      id: EXISTING_ID,
    });

    expect(out.result.ok).toBe(true);
    expect(out.state.appointmentsById[EXISTING_ID]).toBeUndefined();
  });
});

describe("useCRMActions appointment mutations", () => {
  describe("seed repository (no supportsLiveWrites)", () => {
    it("creates locally without calling the seed repository", async () => {
      const createSpy = jest.spyOn(seedCRMRepository, "createAppointment");
      const { result, stateRef } = installActions(seedCRMRepository);

      let created: Appointment | undefined;
      await act(async () => {
        const outcome = await result.current.createAppointment(CREATE_INPUT);
        expect(outcome.ok).toBe(true);
        if (outcome.ok) created = outcome.data;
      });

      expect(createSpy).not.toHaveBeenCalled();
      expect(created).toBeDefined();
      const stored = stateRef.current.appointmentsById[created!.id];
      expect(stored).toEqual(created);
      expect(stored.customerName).toBe("Walk-in Dana");
      expect(segmentLabels(stored)).toEqual(["Apply color", "Process", "Rinse"]);
      expect(stateRef.current.appointmentsById[EXISTING_ID].segments).toEqual(
        existingAppointment().segments,
      );
    });

    it("updates locally and preserves segments", async () => {
      const updateSpy = jest.spyOn(seedCRMRepository, "updateAppointment");
      const { result, stateRef } = installActions(seedCRMRepository);
      const before = stateRef.current.appointmentsById[EXISTING_ID].segments;

      await act(async () => {
        const outcome = await result.current.updateAppointment(EXISTING_ID, {
          notes: "desk-note",
        });
        expect(outcome.ok).toBe(true);
      });

      expect(updateSpy).not.toHaveBeenCalled();
      const updated = stateRef.current.appointmentsById[EXISTING_ID];
      expect(updated.notes).toBe("desk-note");
      expect(updated.segments).toEqual(before);
      expect(segmentLabels(updated)).toEqual(["Apply", "Wash"]);
    });

    it("deletes locally without calling the seed repository", async () => {
      const deleteSpy = jest.spyOn(seedCRMRepository, "deleteAppointment");
      const { result, stateRef } = installActions(seedCRMRepository);

      await act(async () => {
        const outcome = await result.current.deleteAppointment(EXISTING_ID);
        expect(outcome.ok).toBe(true);
      });

      expect(deleteSpy).not.toHaveBeenCalled();
      expect(stateRef.current.appointmentsById[EXISTING_ID]).toBeUndefined();
    });
  });

  describe("live repository (supportsLiveWrites)", () => {
    it("creates through the API and stores the canonical server appointment", async () => {
      const serverAppointment: Appointment = {
        id: "srv-appt-1",
        salonId: "salon-1",
        staffMemberId: "staff-1",
        customerName: "Canonical Server Name",
        serviceName: "Color",
        serviceCategoryId: "color",
        startTime: CREATE_INPUT.startTime,
        endTime: CREATE_INPUT.endTime,
        status: "confirmed",
        segments: [
          {
            id: "srv-seg-1",
            appointmentId: "srv-appt-1",
            segmentType: "service",
            label: "Server segment",
            startTime: CREATE_INPUT.startTime,
            endTime: CREATE_INPUT.endTime,
            sortOrder: 0,
          },
        ],
      };
      const repository = createLiveRepository({
        create: async () => serverAppointment,
      });
      const { result, stateRef } = installActions(repository);

      await act(async () => {
        const outcome = await result.current.createAppointment(CREATE_INPUT);
        expect(outcome.ok).toBe(true);
        if (outcome.ok) expect(outcome.data).toEqual(serverAppointment);
      });

      expect(repository.createAppointment).toHaveBeenCalledWith(CREATE_INPUT);
      expect(stateRef.current.appointmentsById["srv-appt-1"]).toEqual(serverAppointment);
      expect(stateRef.current.appointmentsById[EXISTING_ID]).toEqual(existingAppointment());
    });

    it("updates through the API and replaces local segments with the server object", async () => {
      const serverAppointment: Appointment = {
        ...existingAppointment(),
        notes: "server-notes",
        segments: [
          {
            id: "srv-seg-replaced",
            appointmentId: EXISTING_ID,
            segmentType: "service",
            label: "Only server segment",
            startTime: "2030-01-15T10:00:00.000Z",
            endTime: "2030-01-15T12:00:00.000Z",
            sortOrder: 0,
          },
        ],
      };
      const repository = createLiveRepository({
        update: async () => serverAppointment,
      });
      const { result, stateRef } = installActions(repository);
      const input = { notes: "client-draft" };

      await act(async () => {
        const outcome = await result.current.updateAppointment(EXISTING_ID, input);
        expect(outcome.ok).toBe(true);
        if (outcome.ok) expect(outcome.data).toEqual(serverAppointment);
      });

      expect(repository.updateAppointment).toHaveBeenCalledWith(EXISTING_ID, input);
      const stored = stateRef.current.appointmentsById[EXISTING_ID];
      expect(stored).toEqual(serverAppointment);
      expect(segmentLabels(stored)).toEqual(["Only server segment"]);
    });

    it("deletes through the API and upserts the cancelled server appointment", async () => {
      const cancelled: Appointment = {
        ...existingAppointment(),
        status: "cancelled",
      };
      const repository = createLiveRepository({
        delete: async () => cancelled,
      });
      const { result, stateRef } = installActions(repository);

      await act(async () => {
        const outcome = await result.current.deleteAppointment(EXISTING_ID);
        expect(outcome.ok).toBe(true);
        if (outcome.ok) expect(outcome.data).toEqual(cancelled);
      });

      expect(repository.deleteAppointment).toHaveBeenCalledWith(EXISTING_ID);
      expect(stateRef.current.appointmentsById[EXISTING_ID]).toEqual(cancelled);
    });
  });
});
