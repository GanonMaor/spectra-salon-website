import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CrmLocaleProvider } from "../../i18n/CrmLocale";
import { MarketingProvider } from "../MarketingProvider";
import { MarketingScreen } from "../MarketingPage";
import { createLocalMarketingRepository } from "../repository";
import { fmt } from "../components/ui";
import type { MarketingDataset } from "../types";

jest.mock("../salonData", () => ({ useSalonMarketingDataset: () => ({ ready: true, dataset: null }) }));
jest.mock("../../data/salonSession", () => ({
  getSalonScopeKey: () => "test-salon:test-user",
  getSalonLoginState: () => ({ role: "owner" }),
}));

const EMPTY_SALON: MarketingDataset = {
  salon: { name: "Studio", phone: "031234567", timezone: "Asia/Jerusalem", bookingUrl: null },
  customers: [],
  services: [],
  appointments: [],
};

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => void map.set(key, value),
    removeItem: (key: string) => void map.delete(key),
  };
}

function renderScreen(mode: "salon" | "demo", path = "/crm/marketing") {
  const repository = createLocalMarketingRepository("test", memoryStorage());
  repository.saveMode(mode);
  return render(
    <MemoryRouter initialEntries={[path]}>
      <CrmLocaleProvider>
      <MarketingProvider repository={repository} salonData={{ ready: true, dataset: EMPTY_SALON }} realNow={() => "2026-10-12T07:00:00.000Z"}>
        <MarketingScreen />
      </MarketingProvider>
      </CrmLocaleProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  window.localStorage.setItem("crm_lang", "he");
});

describe("marketing screen", () => {
  it("shows the five automations and three numbers, without demo tooling", () => {
    renderScreen("demo");
    expect(screen.getByRole("heading", { level: 1, name: "שיווק" })).toBeTruthy();
    expect(screen.getByText("הודעות אוטומטיות ששומרות על הקשר עם הלקוחות.")).toBeTruthy();
    for (const name of ["אישור קביעת תור", "תזכורת לתור", "שינוי תור", "ביטול תור", "הזמנה לחזור"]) {
      expect(screen.getByText(name)).toBeTruthy();
    }
    expect(screen.getByText("יום לפני התור, בשעה 10:00")).toBeTruthy();
    for (const label of ["הודעות שנשלחו", "הודעות מתוכננות", "עלות הודעות"]) expect(screen.getByText(label)).toBeTruthy();
    expect(screen.getByRole("radio", { name: "החודש" }).getAttribute("aria-checked")).toBe("true");

    const text = document.body.textContent ?? "";
    for (const banned of ["מצב הדגמה", "מדומה", "סימולטור", "צפייה בתור", "הסלון שלי", "ניהול הודעות", "%", "יחידות", "משוער"]) {
      expect(text).not.toContain(banned);
    }
    expect(screen.getAllByRole("switch")).toHaveLength(5);
  });

  it("marks unpublished drafts next to the edit action", () => {
    renderScreen("demo");
    const reminderRow = screen.getByText("תזכורת לתור").closest("li")!;
    expect(within(reminderRow).getByText("יש שינויים שלא פורסמו")).toBeTruthy();
    const confirmationRow = screen.getByText("אישור קביעת תור").closest("li")!;
    expect(within(confirmationRow).queryByText("יש שינויים שלא פורסמו")).toBeNull();
  });

  it("opens the editor in one click with text, timing and preview", () => {
    renderScreen("demo");
    const row = screen.getByText("תזכורת לתור").closest("li")!;
    fireEvent.click(within(row).getByRole("button", { name: "עריכה" }));
    expect(screen.getByRole("heading", { level: 1, name: "תזכורת לתור" })).toBeTruthy();
    expect(screen.getByText("נוסח ההודעה")).toBeTruthy();
    expect(screen.getByText("מתי נשלחת")).toBeTruthy();
    expect(screen.getByText("תצוגה מקדימה")).toBeTruthy();
    expect(screen.getByRole("button", { name: "התאמה לפי שירות" }).getAttribute("aria-expanded")).toBe("false");
  });

  it("shows one compact row when SMS needs connecting, and nothing for healthy skips", () => {
    renderScreen("salon");
    const status = screen.getByRole("status");
    expect(status.textContent).toContain("ה־SMS עוד לא מחובר");
    expect(within(status).getByRole("button", { name: /לחיבור/ })).toBeTruthy();
    expect(document.body.textContent).not.toContain("הסכמה");
  });

  it("filters history to scheduled messages", () => {
    renderScreen("demo", "/crm/marketing?view=history&show=planned");
    expect(screen.getByRole("heading", { level: 1, name: "היסטוריית הודעות" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "מתוכננות" }).getAttribute("aria-checked")).toBe("true");
    expect(screen.queryAllByText("נמסרה")).toHaveLength(0);
  });
});

describe("copy formatting", () => {
  it("uses natural singular and plural forms", () => {
    const template = "{count:נשלחה הודעה אחת|נשלחו # הודעות}";
    expect(fmt(template, { count: 1 })).toBe("נשלחה הודעה אחת");
    expect(fmt(template, { count: 3 })).toBe("נשלחו 3 הודעות");
  });
});
