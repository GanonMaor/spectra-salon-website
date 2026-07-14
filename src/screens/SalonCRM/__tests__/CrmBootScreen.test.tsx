import { fireEvent, render, screen } from "@testing-library/react";
import CrmBootScreen from "../CrmBootScreen";

describe("CrmBootScreen", () => {
  it("renders a dimensionally-stable loading skeleton with no business content", () => {
    render(<CrmBootScreen />);
    const screenEl = screen.getByTestId("crm-boot-screen");
    expect(screenEl).toHaveAttribute("data-variant", "loading");
    expect(screenEl).toHaveAttribute("aria-busy", "true");
    // Branded, but never exposes a salon name / metrics / navigation.
    expect(screen.getByText("SalonAi")).toBeInTheDocument();
    expect(screen.getByText("Preparing your workspace…")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("suppresses skeleton motion under reduced-motion preferences", () => {
    const { container } = render(<CrmBootScreen />);
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
    skeletons.forEach((node) => {
      expect(node.className).toContain("motion-reduce:animate-none");
    });
  });

  it("shows a branded retry state that invokes onRetry", () => {
    const onRetry = jest.fn();
    render(<CrmBootScreen error errorMessage="Network down" onRetry={onRetry} />);
    const screenEl = screen.getByTestId("crm-boot-screen");
    expect(screenEl).toHaveAttribute("data-variant", "error");
    expect(screenEl).toHaveAttribute("aria-busy", "false");
    expect(screen.getByText("We couldn't load your salon")).toBeInTheDocument();
    expect(screen.getByText("Network down")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("mirrors direction for RTL locales", () => {
    render(<CrmBootScreen dir="rtl" />);
    expect(screen.getByTestId("crm-boot-screen")).toHaveAttribute("dir", "rtl");
  });
});
