import { fireEvent, render, screen } from "@testing-library/react";
import { CrmPageGate, CrmSkeleton } from "../CrmPageGate";
import { useCRMReady } from "../data/crmHooks";
import { useCRMContext } from "../data/CRMDataProvider";

// The gate's whole job is to translate (ready, bootstrapStatus) into exactly one
// of pending-skeleton / retryable-error / ready-content. Stub the two inputs so
// those decisions are what's under test, not the real provider/selectors.
jest.mock("../data/crmHooks", () => ({
  __esModule: true,
  useCRMReady: jest.fn(),
}));

jest.mock("../data/CRMDataProvider", () => ({
  __esModule: true,
  useCRMContext: jest.fn(),
  useCRMState: jest.fn(() => ({})),
  CRMDataProvider: ({ children }: { children: unknown }) => children,
}));

const mockedUseCRMReady = useCRMReady as jest.Mock;
const mockedUseCRMContext = useCRMContext as jest.Mock;

function context(overrides: Record<string, unknown> = {}) {
  return {
    bootstrapStatus: "loading",
    error: null,
    reload: jest.fn(),
    ...overrides,
  };
}

const SKELETON = <div data-testid="page-skeleton">SKELETON</div>;
const CONTENT = <div data-testid="page-content">CONTENT</div>;

describe("CrmPageGate", () => {
  afterEach(() => jest.clearAllMocks());

  it("shows the skeleton (never content) while pending", () => {
    mockedUseCRMReady.mockReturnValue(false);
    mockedUseCRMContext.mockReturnValue(context({ bootstrapStatus: "loading" }));
    render(<CrmPageGate skeleton={SKELETON}>{CONTENT}</CrmPageGate>);
    expect(screen.getByTestId("page-skeleton")).toBeInTheDocument();
    expect(screen.queryByTestId("page-content")).not.toBeInTheDocument();
    expect(screen.queryByTestId("crm-page-error")).not.toBeInTheDocument();
  });

  it("shows a retryable error (not an empty/skeleton) when bootstrap failed before data", () => {
    const reload = jest.fn();
    mockedUseCRMReady.mockReturnValue(false);
    mockedUseCRMContext.mockReturnValue(context({ bootstrapStatus: "error", error: "boom", reload }));
    render(
      <CrmPageGate skeleton={SKELETON} retryLabel="Try again">
        {CONTENT}
      </CrmPageGate>,
    );
    const error = screen.getByTestId("crm-page-error");
    expect(error).toBeInTheDocument();
    expect(error).toHaveTextContent("boom");
    // Error must never be conflated with the skeleton or the content.
    expect(screen.queryByTestId("page-skeleton")).not.toBeInTheDocument();
    expect(screen.queryByTestId("page-content")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("renders children only once the snapshot is truthfully ready", () => {
    mockedUseCRMReady.mockReturnValue(true);
    mockedUseCRMContext.mockReturnValue(context({ bootstrapStatus: "success" }));
    render(<CrmPageGate skeleton={SKELETON}>{CONTENT}</CrmPageGate>);
    expect(screen.getByTestId("page-content")).toBeInTheDocument();
    expect(screen.queryByTestId("page-skeleton")).not.toBeInTheDocument();
  });

  it("keeps showing content during a background refresh (ready stays true)", () => {
    // A background reload flips bootstrapStatus back to loading, but useCRMReady
    // stays true while a snapshot is present — the page must not flash a skeleton.
    mockedUseCRMReady.mockReturnValue(true);
    mockedUseCRMContext.mockReturnValue(context({ bootstrapStatus: "loading" }));
    render(<CrmPageGate skeleton={SKELETON}>{CONTENT}</CrmPageGate>);
    expect(screen.getByTestId("page-content")).toBeInTheDocument();
    expect(screen.queryByTestId("page-skeleton")).not.toBeInTheDocument();
  });
});

describe("CrmSkeleton", () => {
  it("suppresses motion for reduced-motion users", () => {
    const { container } = render(<CrmSkeleton className="h-4 w-4" />);
    const node = container.firstChild as HTMLElement;
    expect(node).toHaveClass("motion-reduce:animate-none");
    expect(node).toHaveAttribute("aria-hidden", "true");
  });
});
