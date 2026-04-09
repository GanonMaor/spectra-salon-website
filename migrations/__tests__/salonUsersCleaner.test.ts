const { cleanSalonUsers, normalizeRelativeDate, normalizeState, normalizeCity } = require("../salon-users-cleaner");

describe("salon-users-cleaner", () => {
  it("normalizes relative dates and geography fields", () => {
    expect(normalizeRelativeDate("1 years ago")).toBe("1 year ago");
    expect(normalizeRelativeDate("1 hours ago")).toBe("1 hour ago");
    expect(normalizeRelativeDate("just now")).toBe("Just now");

    expect(normalizeState("england")).toBe("UK");
    expect(normalizeState("Mistake")).toBe("");
    expect(normalizeCity("New-York")).toBe("New York");
    expect(normalizeCity("Sent")).toBe("");
  });

  it("dedupes by phone and keeps the most useful merged record", () => {
    const { cleanedUsers, report } = cleanSalonUsers([
      {
        salon_name: "Salon Rooted",
        phone_number: "(484) 764-4385",
        profiles: 2,
        first_mix_date: "1 years ago",
        last_mix_date: "12 days ago",
        monthly_trend: "-",
        version: "1021",
        state: "",
        city: "",
        links: "",
      },
      {
        salon_name: "Salon Rooted",
        phone_number: "4847644385",
        profiles: 5,
        first_mix_date: "2 years ago",
        last_mix_date: "2 days ago",
        monthly_trend: "-",
        version: "1024",
        state: "usa",
        city: "New-York",
        links: "@rooted",
      },
    ]);

    expect(cleanedUsers).toHaveLength(1);
    expect(report.removedDuplicates).toBe(1);
    expect(cleanedUsers[0]).toMatchObject({
      salon_name: "Salon Rooted",
      phone_number: "4847644385",
      profiles: 5,
      first_mix_date: "2 years ago",
      last_mix_date: "2 days ago",
      version: "1024",
      state: "USA",
      city: "New York",
      links: "rooted",
    });
  });
});
