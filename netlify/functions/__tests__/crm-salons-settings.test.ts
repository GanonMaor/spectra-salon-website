let queryImpl: (sql: string, values?: unknown[]) => Promise<{ rows: Array<Record<string, unknown>> }>;

jest.mock("../_db", () => ({
  hasDatabaseUrl: () => true,
  createClient: () => ({
    connect: jest.fn(),
    end: jest.fn().mockResolvedValue(undefined),
    query: (sql: string, values?: unknown[]) => queryImpl(sql, values),
  }),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { signSalonSession } = require("../_salon-context");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { handler } = require("../crm-salons");

function event(token: string, body: Record<string, unknown>) {
  return {
    httpMethod: "PATCH",
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  };
}

describe("crm-salons business settings", () => {
  const originalSecret = process.env.SALON_SESSION_SECRET;

  beforeEach(() => {
    process.env.SALON_SESSION_SECRET = "test-session-secret";
  });

  afterAll(() => {
    if (originalSecret === undefined) delete process.env.SALON_SESSION_SECRET;
    else process.env.SALON_SESSION_SECRET = originalSecret;
  });

  it("accepts supported regional settings and scopes the update to the session salon", async () => {
    let updateValues: unknown[] | undefined;
    queryImpl = async (sql, values) => {
      if (sql.includes("FROM salon_memberships")) {
        return { rows: [{ status: "active", sessions_valid_after: null, access_role_grants: ["settings.update@salon"] }] };
      }
      if (sql.includes("UPDATE salons")) {
        updateValues = values;
        return { rows: [{ id: "salon-a", name: "Salon A", country_code: "IL", currency: "ILS", timezone: "Asia/Tokyo", status: "active" }] };
      }
      if (sql.includes("INSERT INTO salon_audit_events")) return { rows: [] };
      throw new Error(`unexpected query: ${sql}`);
    };
    const token = signSalonSession({ salonId: "salon-a", userId: "user-a", role: "owner" });

    const response = await handler(event(token, {
      countryCode: "IL",
      currency: "ILS",
      timezone: "Asia/Tokyo",
      locale: "he-IL",
      defaultLanguage: "he",
      weekStartsOn: 0,
    }));

    expect(response.statusCode).toBe(200);
    expect(updateValues?.[0]).toBe("salon-a");
    expect(updateValues).toContain("Asia/Tokyo");
    expect(JSON.parse(response.body).salon.countryCode).toBe("IL");
  });

  it("accepts an empty optional tax rate when saving another profile field", async () => {
    let updateValues: unknown[] | undefined;
    queryImpl = async (sql, values) => {
      if (sql.includes("FROM salon_memberships")) {
        return { rows: [{ status: "active", sessions_valid_after: null, access_role_grants: ["settings.update@salon"] }] };
      }
      if (sql.includes("UPDATE salons")) {
        updateValues = values;
        return { rows: [{ id: "salon-a", name: "Updated Salon", default_tax_rate: null, status: "active" }] };
      }
      if (sql.includes("INSERT INTO salon_audit_events")) return { rows: [] };
      throw new Error(`unexpected query: ${sql}`);
    };
    const token = signSalonSession({ salonId: "salon-a", userId: "user-a", role: "owner" });

    const response = await handler(event(token, {
      name: "Updated Salon",
      defaultTaxRate: "",
    }));

    expect(response.statusCode).toBe(200);
    expect(updateValues).toContain("Updated Salon");
    expect(updateValues).toContain(null);
  });

  it("rejects unsupported country, currency, and tenant fields before writing", async () => {
    queryImpl = async (sql) => {
      if (sql.includes("FROM salon_memberships")) {
        return { rows: [{ status: "active", sessions_valid_after: null, access_role_grants: ["settings.update@salon"] }] };
      }
      throw new Error(`database write should not occur: ${sql}`);
    };
    const token = signSalonSession({ salonId: "salon-a", userId: "user-a", role: "owner" });

    const currency = await handler(event(token, { currency: "BTC" }));
    const country = await handler(event(token, { countryCode: "ZZ" }));
    const timezone = await handler(event(token, { timezone: "Mars/Olympus_Mons" }));
    const tenant = await handler(event(token, { salonId: "salon-b", currency: "ILS" }));

    expect(currency.statusCode).toBe(400);
    expect(JSON.parse(currency.body).error.code).toBe("INVALID_CURRENCY");
    expect(country.statusCode).toBe(400);
    expect(JSON.parse(country.body).error.code).toBe("INVALID_COUNTRY");
    expect(timezone.statusCode).toBe(400);
    expect(JSON.parse(timezone.body).error.code).toBe("INVALID_TIMEZONE");
    expect(tenant.statusCode).toBe(400);
    expect(JSON.parse(tenant.body).error.code).toBe("TENANT_FIELD_FORBIDDEN");
  });
});
