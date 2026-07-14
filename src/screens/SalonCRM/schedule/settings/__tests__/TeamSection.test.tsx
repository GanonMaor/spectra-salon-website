import { render, screen } from "@testing-library/react";
import { CrmLocaleProvider } from "../../../i18n/CrmLocale";
import { TeamSection } from "../TeamSection";
import { useStaff, useStaffPerformance } from "../../../data/crmHooks";
import { useCRMContext } from "../../../data/CRMDataProvider";

// Team must distinguish first-load pending (skeleton) from a genuinely empty
// roster (empty state) and from a load error (error banner) — the three are
// never conflated. Stub the data inputs so those decisions are under test.
jest.mock("../../../data/crmHooks", () => ({
  __esModule: true,
  useStaff: jest.fn(() => []),
  useStaffPerformance: jest.fn(() => []),
  useCRMActions: jest.fn(() => ({ archiveStaff: jest.fn() })),
}));

jest.mock("../../../data/CRMDataProvider", () => ({
  __esModule: true,
  useCRMContext: jest.fn(),
  useCRMState: jest.fn(() => ({})),
  CRMDataProvider: ({ children }: { children: unknown }) => children,
}));

jest.mock("../../../data/salonProfessionalRolesApi", () => ({
  __esModule: true,
  listProfessionalRoles: jest.fn(() => Promise.resolve({ roles: [], assignments: [] })),
}));

jest.mock("../../../data/salonApiClient", () => ({
  __esModule: true,
  salonApiErrorMessage: (err: unknown) => String(err),
}));

jest.mock("../../../data/accessControl", () => ({
  __esModule: true,
  useCurrentPermissions: () => ({ can: () => true, isOwner: true }),
}));

jest.mock("../../../data/salonSession", () => ({
  __esModule: true,
  canCallSalonRuntimeApi: () => false,
}));

jest.mock("../../ScheduleCatalogProvider", () => ({
  __esModule: true,
  useScheduleCatalog: () => ({ state: { departments: [] } }),
}));

jest.mock("../StaffWizard", () => ({ __esModule: true, StaffWizard: () => null }));
jest.mock("../ProfessionalRolesPanel", () => ({ __esModule: true, ProfessionalRolesPanel: () => null }));

const mockedUseStaff = useStaff as jest.Mock;
const mockedUseCRMContext = useCRMContext as jest.Mock;

function renderTeam() {
  return render(
    <CrmLocaleProvider>
      <TeamSection isDark={false} />
    </CrmLocaleProvider>,
  );
}

describe("TeamSection loading gate", () => {
  afterEach(() => jest.clearAllMocks());

  it("shows KPI + roster skeletons (not a 0/empty state) while first-loading", () => {
    mockedUseStaff.mockReturnValue([]);
    mockedUseCRMContext.mockReturnValue({ error: null, hydrated: false, reload: jest.fn() });
    renderTeam();
    expect(screen.getByLabelText("Loading team…")).toBeInTheDocument();
    expect(screen.queryByText("No team members yet")).not.toBeInTheDocument();
  });

  it("shows the empty state only after a successful, hydrated response", () => {
    mockedUseStaff.mockReturnValue([]);
    mockedUseCRMContext.mockReturnValue({ error: null, hydrated: true, reload: jest.fn() });
    renderTeam();
    expect(screen.getByText("No team members yet")).toBeInTheDocument();
    expect(screen.queryByLabelText("Loading team…")).not.toBeInTheDocument();
  });

  it("shows a retryable error banner and never the empty state on load failure", () => {
    mockedUseStaff.mockReturnValue([]);
    mockedUseCRMContext.mockReturnValue({ error: "boom", hydrated: false, reload: jest.fn() });
    renderTeam();
    expect(screen.getByText(/Team data could not be loaded/)).toBeInTheDocument();
    expect(screen.queryByText("No team members yet")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Loading team…")).not.toBeInTheDocument();
  });
});
