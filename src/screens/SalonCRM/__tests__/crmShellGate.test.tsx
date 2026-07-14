import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { SiteThemeProvider } from "../../../contexts/SiteTheme";
import { CrmLocaleProvider } from "../i18n/CrmLocale";
import { useCRMContext } from "../data/CRMDataProvider";
import { CrmShell } from "../SalonCRMPage";

// Drive the shell gate entirely off the bootstrap contract. The provider is
// stubbed so the gate's rendering decisions are what's under test (the real
// module uses `import.meta`, which Jest cannot evaluate via requireActual).
jest.mock("../data/CRMDataProvider", () => ({
  __esModule: true,
  useCRMContext: jest.fn(),
  useCRMState: jest.fn(() => ({})),
  clearScopedCRMCache: jest.fn(),
  CRMDataProvider: ({ children }: { children: unknown }) => children,
}));

// The success branch mounts the real shell, which reads salon/staff via hooks.
// Stub those so we exercise the gate, not the business selectors.
jest.mock("../data/crmHooks", () => ({
  __esModule: true,
  useCRMSalon: () => ({ id: "s1", name: "Test Salon", onboardingStatus: "completed" }),
  useStaff: () => [],
}));

const mockedUseCRMContext = useCRMContext as jest.Mock;

function baseContext(overrides: Record<string, unknown>) {
  return {
    bootstrapStatus: "loading",
    bootstrap: null,
    error: null,
    reload: jest.fn(),
    ...overrides,
  };
}

function bootstrapView(overrides: Record<string, unknown> = {}) {
  return {
    catalog: { departments: [], categories: [], services: [], resources: [] },
    identity: { salonId: "s1", userId: "u1", role: "owner", fingerprint: "fp" },
    onboarding: { status: "completed", needsMigration: false },
    meta: { salonId: "s1", generatedAt: "2026-01-01T00:00:00.000Z" },
    ...overrides,
  };
}

function renderShell(initialPath = "/crm/home") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <SiteThemeProvider>
        <CrmLocaleProvider>
          <Routes>
            <Route path="/crm" element={<CrmShell />}>
              <Route path="home" element={<div data-testid="page-outlet">PAGE_OUTLET</div>} />
            </Route>
            <Route path="/crm/setup" element={<div data-testid="setup-page">SETUP_PAGE</div>} />
            <Route path="/user-login" element={<div data-testid="login-page">LOGIN_PAGE</div>} />
          </Routes>
        </CrmLocaleProvider>
      </SiteThemeProvider>
    </MemoryRouter>,
  );
}

describe("CrmShell gate", () => {
  afterEach(() => jest.clearAllMocks());

  it("shows the branded boot screen (not the shell) while loading", () => {
    mockedUseCRMContext.mockReturnValue(baseContext({ bootstrapStatus: "loading", bootstrap: null }));
    renderShell();
    expect(screen.getByTestId("crm-boot-screen")).toHaveAttribute("data-variant", "loading");
    expect(screen.queryByTestId("page-outlet")).not.toBeInTheDocument();
  });

  it("renders a retry boot screen on first-boot error and reloads on retry", () => {
    const reload = jest.fn();
    mockedUseCRMContext.mockReturnValue(
      baseContext({ bootstrapStatus: "error", bootstrap: null, error: "boom", reload }),
    );
    renderShell();
    const boot = screen.getByTestId("crm-boot-screen");
    expect(boot).toHaveAttribute("data-variant", "error");
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(reload).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("page-outlet")).not.toBeInTheDocument();
  });

  it("redirects to login when unauthorized", () => {
    mockedUseCRMContext.mockReturnValue(baseContext({ bootstrapStatus: "unauthorized", bootstrap: null }));
    renderShell();
    expect(screen.getByTestId("login-page")).toBeInTheDocument();
    expect(screen.queryByTestId("crm-boot-screen")).not.toBeInTheDocument();
  });

  it("redirects to setup when onboarding is incomplete, before shell paint", () => {
    mockedUseCRMContext.mockReturnValue(
      baseContext({
        bootstrapStatus: "success",
        bootstrap: bootstrapView({ onboarding: { status: "incomplete", needsMigration: false } }),
      }),
    );
    renderShell();
    expect(screen.getByTestId("setup-page")).toBeInTheDocument();
    expect(screen.queryByTestId("page-outlet")).not.toBeInTheDocument();
  });

  it("mounts the shell + Outlet once bootstrap succeeds with completed onboarding", () => {
    mockedUseCRMContext.mockReturnValue(
      baseContext({ bootstrapStatus: "success", bootstrap: bootstrapView() }),
    );
    renderShell();
    expect(screen.getByTestId("page-outlet")).toBeInTheDocument();
    expect(screen.queryByTestId("crm-boot-screen")).not.toBeInTheDocument();
  });

  it("keeps the shell stable during a background refresh that still has a snapshot", () => {
    mockedUseCRMContext.mockReturnValue(
      baseContext({ bootstrapStatus: "loading", bootstrap: bootstrapView() }),
    );
    renderShell();
    // A refresh sets status back to loading, but because a trusted snapshot is
    // still present the shell must not fall back to the boot screen.
    expect(screen.getByTestId("page-outlet")).toBeInTheDocument();
    expect(screen.queryByTestId("crm-boot-screen")).not.toBeInTheDocument();
  });
});
