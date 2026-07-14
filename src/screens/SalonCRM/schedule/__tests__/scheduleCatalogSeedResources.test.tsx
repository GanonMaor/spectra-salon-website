import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CrmLocaleProvider } from "../../i18n/CrmLocale";
import { ScheduleCatalogProvider, useScheduleCatalog } from "../ScheduleCatalogProvider";
import { canCallSalonRuntimeApi } from "../../data/salonSession";
import { listCrmServicesCatalog } from "../../data/crmServicesApi";
import { useCRMContextOptional } from "../../data/CRMDataProvider";
import type {
  CatalogCategory,
  CatalogService,
  SalonResource,
  ServiceDepartment,
} from "../catalogTypes";

// The schedule catalog no longer performs its own cold-boot fetch. In live
// runtime mode it consumes the shell's authoritative `bootstrap.catalog`; only
// local/demo mode keeps usable seed resources. These tests pin that contract:
// stable skeleton while pending, retryable error when unavailable, truthful
// empty when the live catalog is empty, and an explicit post-success refresh.
jest.mock("../../data/salonSession", () => ({
  __esModule: true,
  canCallSalonRuntimeApi: jest.fn(),
}));

jest.mock("../../data/crmServicesApi", () => ({
  __esModule: true,
  listCrmServicesCatalog: jest.fn(),
  invalidateCrmServicesCatalog: jest.fn(),
  createCrmCategory: jest.fn(),
  createCrmDepartment: jest.fn(),
  createCrmResource: jest.fn(),
  createCrmService: jest.fn(),
  updateCrmCategory: jest.fn(),
  updateCrmDepartment: jest.fn(),
  updateCrmResource: jest.fn(),
  updateCrmService: jest.fn(),
}));

jest.mock("../../data/CRMDataProvider", () => ({
  __esModule: true,
  useCRMContextOptional: jest.fn(() => null),
}));

const mockedCanCall = canCallSalonRuntimeApi as jest.Mock;
const mockedList = listCrmServicesCatalog as jest.Mock;
const mockedCrm = useCRMContextOptional as jest.Mock;

function dept(id: string): ServiceDepartment {
  return { id, name: id, calendarLabel: id, sortOrder: 0, status: "active" };
}
function cat(id: string, departmentId: string): CatalogCategory {
  return { id, departmentId, crmCategoryId: "color", name: id, accentColor: "#000", sortOrder: 0, status: "active" };
}
function svc(id: string, categoryId: string): CatalogService {
  return {
    id, categoryId, crmCategoryId: "color", name: id,
    defaultDurationMinutes: 60, defaultPriceCents: 0, defaultMaterialCostCents: 0,
    sortOrder: 0, status: "active", defaultStages: [], linkedServiceIds: [],
    allowClientTimingOverrides: true, canOverlapDuringProcessing: true,
  };
}
function res(id: string): SalonResource {
  return { id, type: "chair", name: id, status: "active", sortOrder: 0 };
}

function bootstrapView(overrides: {
  departments?: ServiceDepartment[];
  categories?: CatalogCategory[];
  services?: CatalogService[];
  resources?: SalonResource[];
  fingerprint?: string;
} = {}) {
  return {
    catalog: {
      departments: overrides.departments ?? [],
      categories: overrides.categories ?? [],
      services: overrides.services ?? [],
      resources: overrides.resources ?? [],
    },
    identity: {
      salonId: "salon-1",
      userId: "user-1",
      role: "owner",
      fingerprint: overrides.fingerprint ?? "salon-1::user-1::t:token",
    },
    onboarding: { status: "completed", needsMigration: false },
    meta: { salonId: "salon-1", generatedAt: "now" },
  };
}

function crmCtx(overrides: Record<string, unknown> = {}) {
  return {
    bootstrap: null,
    bootstrapStatus: "idle",
    error: null,
    reload: jest.fn(),
    ...overrides,
  };
}

function Probe() {
  const catalog = useScheduleCatalog();
  return (
    <div>
      <div data-testid="loading">{String(catalog.status.loading)}</div>
      <div data-testid="error">{catalog.status.loadError ?? ""}</div>
      <div data-testid="live">{String(catalog.status.live)}</div>
      <div data-testid="departments">{catalog.state.departments.length}</div>
      <div data-testid="services">{catalog.state.services.length}</div>
      <div data-testid="resources">{catalog.state.resources.length}</div>
      <button type="button" onClick={() => catalog.reload()}>reload</button>
    </div>
  );
}

function renderProvider() {
  return render(
    <CrmLocaleProvider>
      <ScheduleCatalogProvider>
        <Probe />
      </ScheduleCatalogProvider>
    </CrmLocaleProvider>,
  );
}

describe("ScheduleCatalogProvider — authoritative catalog wiring", () => {
  beforeEach(() => mockedCrm.mockReturnValue(null));
  afterEach(() => jest.clearAllMocks());

  it("keeps seed resources in local/demo mode and never fetches", () => {
    mockedCanCall.mockReturnValue(false);
    renderProvider();
    expect(screen.getByTestId("resources")).toHaveTextContent("8");
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
    expect(screen.getByTestId("live")).toHaveTextContent("false");
    expect(mockedList).not.toHaveBeenCalled();
  });

  it("shows a stable loading state (no seed flash) while the bootstrap catalog is pending", () => {
    mockedCanCall.mockReturnValue(true);
    mockedCrm.mockReturnValue(crmCtx({ bootstrapStatus: "loading", bootstrap: null }));
    renderProvider();
    expect(screen.getByTestId("loading")).toHaveTextContent("true");
    expect(screen.getByTestId("error")).toHaveTextContent("");
    expect(screen.getByTestId("departments")).toHaveTextContent("0");
    expect(screen.getByTestId("resources")).toHaveTextContent("0");
    expect(mockedList).not.toHaveBeenCalled();
  });

  it("surfaces a retryable error (never an empty state) when the bootstrap failed", () => {
    mockedCanCall.mockReturnValue(true);
    mockedCrm.mockReturnValue(crmCtx({ bootstrapStatus: "error", error: "boom" }));
    renderProvider();
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
    expect(screen.getByTestId("error")).toHaveTextContent("boom");
  });

  it("seeds the catalog from the authoritative bootstrap payload without any fetch", async () => {
    mockedCanCall.mockReturnValue(true);
    mockedCrm.mockReturnValue(crmCtx({
      bootstrapStatus: "success",
      bootstrap: bootstrapView({
        departments: [dept("dept-hair")],
        categories: [cat("cat-color", "dept-hair")],
        services: [svc("sv-color", "cat-color")],
        resources: [res("res-1")],
      }),
    }));
    renderProvider();
    await waitFor(() => expect(screen.getByTestId("departments")).toHaveTextContent("1"));
    expect(screen.getByTestId("services")).toHaveTextContent("1");
    expect(screen.getByTestId("resources")).toHaveTextContent("1");
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
    expect(screen.getByTestId("error")).toHaveTextContent("");
    expect(mockedList).not.toHaveBeenCalled();
  });

  it("renders a truthful empty state (no seed) for a live salon with an empty catalog", async () => {
    mockedCanCall.mockReturnValue(true);
    mockedCrm.mockReturnValue(crmCtx({
      bootstrapStatus: "success",
      bootstrap: bootstrapView(),
    }));
    renderProvider();
    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));
    expect(screen.getByTestId("departments")).toHaveTextContent("0");
    expect(screen.getByTestId("resources")).toHaveTextContent("0");
    expect(screen.getByTestId("error")).toHaveTextContent("");
  });

  it("performs an explicit catalog refresh only after shell success", async () => {
    mockedCanCall.mockReturnValue(true);
    mockedCrm.mockReturnValue(crmCtx({
      bootstrapStatus: "success",
      bootstrap: bootstrapView(),
    }));
    mockedList.mockResolvedValue({
      departments: [dept("dept-hair")],
      categories: [],
      services: [svc("sv-color", "cat-color")],
      resources: [],
    });
    renderProvider();
    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));
    expect(mockedList).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText("reload"));
    await waitFor(() => expect(mockedList).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByTestId("departments")).toHaveTextContent("1"));
    expect(screen.getByTestId("services")).toHaveTextContent("1");
  });

  it("replaces prior resources with an authoritative EMPTY array on refresh (no stale retention)", async () => {
    mockedCanCall.mockReturnValue(true);
    mockedCrm.mockReturnValue(crmCtx({
      bootstrapStatus: "success",
      bootstrap: bootstrapView({ resources: [res("res-1"), res("res-2")] }),
    }));
    // The salon's resources were removed server-side: the explicit refresh now
    // returns an authoritative empty resources array.
    mockedList.mockResolvedValue({
      departments: [],
      categories: [],
      services: [],
      resources: [],
    });
    renderProvider();
    await waitFor(() => expect(screen.getByTestId("resources")).toHaveTextContent("2"));

    fireEvent.click(screen.getByText("reload"));
    await waitFor(() => expect(mockedList).toHaveBeenCalledTimes(1));
    // The authoritative empty array must clear the previously seeded resources.
    await waitFor(() => expect(screen.getByTestId("resources")).toHaveTextContent("0"));
  });

  it("keeps local demo seeds when not live (SEED_CATALOG is never dispatched)", () => {
    // Regression guard for the resources fix: the authoritative-empty behavior
    // must not touch the explicit demo seeds, because demo mode never seeds the
    // catalog from a bootstrap/refresh at all.
    mockedCanCall.mockReturnValue(false);
    mockedCrm.mockReturnValue(crmCtx({
      bootstrapStatus: "success",
      bootstrap: bootstrapView({ resources: [] }),
    }));
    renderProvider();
    expect(screen.getByTestId("resources")).toHaveTextContent("8");
    expect(mockedList).not.toHaveBeenCalled();
  });

  it("re-runs the shell bootstrap (not a catalog fetch) when reloaded before success", () => {
    mockedCanCall.mockReturnValue(true);
    const reload = jest.fn();
    mockedCrm.mockReturnValue(crmCtx({ bootstrapStatus: "error", error: "boom", reload }));
    renderProvider();
    fireEvent.click(screen.getByText("reload"));
    expect(reload).toHaveBeenCalledTimes(1);
    expect(mockedList).not.toHaveBeenCalled();
  });
});
