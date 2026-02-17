// Netlify Functions API Client  
const API_BASE = import.meta.env.DEV ? "/.netlify/functions" : "/.netlify/functions";
const SALON_STORAGE_KEY = "spectra_salon_id";
const DEFAULT_SALON_ID = "salon-look";

class ApiClient {
  public token: string | null = null;

  constructor() {
    this.token = localStorage.getItem("token");
  }

  // ── Tenant (salon) context ───────────────────────────────────────
  getSalonId(): string {
    try {
      return localStorage.getItem(SALON_STORAGE_KEY) || DEFAULT_SALON_ID;
    } catch {
      return DEFAULT_SALON_ID;
    }
  }

  setSalonId(salonId: string): void {
    try {
      localStorage.setItem(SALON_STORAGE_KEY, salonId);
    } catch { /* noop */ }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE}${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-salon-id": this.getSalonId(),
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...(options.headers as Record<string, string> || {}),
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return response.json();
    } catch (fetchError) {
      if (endpoint === "/me") {
        throw new Error("No authenticated user (preview mode)");
      }

      console.warn(`API call failed (preview mode): ${endpoint}`, fetchError);
      throw fetchError;
    }
  }

  // Auth methods
  async signup(data: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
  }) {
    const result = await this.request("/signup", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (result.token) {
      this.token = result.token;
      localStorage.setItem("token", result.token);
    } else {
      this.token = localStorage.getItem("token");
    }

    return result;
  }

  async login(email: string, password: string) {
    const result = await this.request("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (result.token) {
      this.token = result.token;
      localStorage.setItem("token", result.token);
    } else {
      this.token = localStorage.getItem("token");
    }

    return result;
  }

  async logout() {
    console.log("🔍 Starting logout - Environment:", {
      hostname: window.location.hostname,
      protocol: window.location.protocol,
      isProd: !window.location.hostname.includes("localhost"),
    });

    try {
      const response = await this.request("/auth/logout", {
        method: "POST",
      });
      console.log("✅ Server logout successful:", response);
    } catch (error) {
      console.warn(
        "❌ Server logout failed, continuing with local logout:",
        error,
      );
    } finally {
      this.token = null;
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");

      const cookieOptions = [
        "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;",
        `token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`,
        `token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`,
      ];

      cookieOptions.forEach((option) => {
        document.cookie = option;
      });

      console.log("🚪 Logout cleanup completed - all tokens cleared");
    }
  }

  async getCurrentUser() {
    return this.request("/me");
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }

  // Password reset
  async forgotPassword(email: string) {
    return this.request("/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, password: string) {
    return this.request("/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });
  }

  // Admin email sender
  async sendEmail(payload: { to: string; subject: string; html: string; from?: string }) {
    return this.request("/send-email", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  // Leads methods
  async createLead(data: {
    name: string;
    email: string;
    phone?: string;
    source?: string;
    cta_clicked?: string;
    message?: string;
  }) {
    return this.request("/leads", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getLeads(
    params: {
      page?: number;
      limit?: number;
      status?: string;
      source?: string;
    } = {},
  ) {
    const queryString = new URLSearchParams(params as any).toString();
    return this.request(`/leads?${queryString}`);
  }

  // CTA Tracking
  async trackCTA(data: {
    button_name: string;
    page_url: string;
    device_type?: string;
    user_agent?: string;
    user_id?: string;
    session_id?: string;
    referrer?: string;
  }) {
    return this.request("/cta-tracking", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Profile methods
  async updateProfile(data: { full_name: string; phone: string }) {
    return this.request("/update-profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Users methods
  async getUsers() {
    return this.request("/get-users");
  }

  async checkDatabaseHealth() {
    return this.request("/db-check");
  }

  // ── Schedule (appointments) ───────────────────────────────────────
  async getAppointments(params: { from?: string; to?: string; employeeId?: string } = {}) {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ""))
    ).toString();
    return this.request(`/schedule/appointments${qs ? `?${qs}` : ""}`);
  }

  async createAppointment(data: {
    employee_id: string;
    client_name: string;
    service_name: string;
    service_category?: string;
    status?: string;
    notes?: string | null;
    customer_id?: string | null;
    segments?: Array<{
      segment_type?: string;
      label?: string;
      start_time: string;
      end_time: string;
      sort_order?: number;
      product_grams?: number;
      notes?: string;
    }>;
  }) {
    return this.request("/schedule/appointments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateAppointment(id: string, data: Record<string, unknown>) {
    return this.request(`/schedule/appointments/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteAppointment(id: string) {
    return this.request(`/schedule/appointments/${id}`, { method: "DELETE" });
  }

  async updateSegment(id: string, data: Record<string, unknown>) {
    return this.request(`/schedule/segments/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteSegment(id: string) {
    return this.request(`/schedule/segments/${id}`, { method: "DELETE" });
  }

  async splitAppointment(id: string, splits: Array<Record<string, unknown>>) {
    return this.request(`/schedule/appointments/${id}/split`, {
      method: "POST",
      body: JSON.stringify({ splits }),
    });
  }

  async applyTemplate(appointmentId: string, templateId: string, startTime: string) {
    return this.request(`/schedule/appointments/${appointmentId}/apply-template`, {
      method: "POST",
      body: JSON.stringify({ template_id: templateId, start_time: startTime }),
    });
  }

  async getTemplates() {
    return this.request("/schedule/templates");
  }

  // ── Customers ────────────────────────────────────────────────────
  async getCustomers(params: { search?: string; status?: string; tag?: string; page?: number; limit?: number } = {}) {
    const entries = Object.entries(params)
      .filter(([, v]) => v != null && v !== "")
      .map(([k, v]) => [k, String(v)]);
    const qs = new URLSearchParams(entries).toString();
    return this.request(`/crm-customers${qs ? `?${qs}` : ""}`);
  }

  async getCustomer(id: string) {
    return this.request(`/crm-customers/${id}`);
  }

  async createCustomer(data: {
    first_name: string;
    last_name?: string;
    phone?: string;
    email?: string;
    notes?: string;
    tags?: string[];
  }) {
    return this.request("/crm-customers", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateCustomer(id: string, data: Record<string, unknown>) {
    return this.request(`/crm-customers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async archiveCustomer(id: string) {
    return this.request(`/crm-customers/${id}`, { method: "DELETE" });
  }

  async getCustomerVisits(customerId: string) {
    return this.request(`/crm-customers/${customerId}/visits`);
  }

  async addCustomerVisit(customerId: string, data: {
    visit_date?: string;
    service_name?: string;
    service_category?: string;
    employee_name?: string;
    employee_id?: string;
    duration_minutes?: number;
    price?: number;
    notes?: string;
    appointment_id?: string;
  }) {
    return this.request(`/crm-customers/${customerId}/visits`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ── Salons (tenants) ─────────────────────────────────────────────
  async getSalons() {
    return this.request("/crm-salons");
  }

  // ── Schedule customer search (quick lookup for create appointment) ──
  async searchCustomersForSchedule(search: string) {
    return this.request(`/schedule/customers?search=${encodeURIComponent(search)}`);
  }

  // Salon usage reports
  async getSalonList() {
    return this.request("/user-usage-report");
  }

  async getUserUsageReport(params: {
    userId: string;
    startMonth?: string;
    endMonth?: string;
    serviceCategory?: string;
  }) {
    const qs = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(([, v]) => v != null && v !== "")
      )
    ).toString();
    return this.request(`/user-usage-report?${qs}`);
  }
}

export const apiClient = new ApiClient();

// Export individual functions for backward compatibility
export const signUpWithEmail = (data: any) => apiClient.signup(data);
export const signInWithEmail = (email: string, password: string) =>
  apiClient.login(email, password);
export const signOut = () => apiClient.logout();
export const getCurrentUser = () => apiClient.getCurrentUser();
export const createLead = (data: any) => apiClient.createLead(data);
export const getAllLeads = () => apiClient.getLeads();
export const trackCTAClick = (data: any) => apiClient.trackCTA(data);

// Helper to construct Authorization header for fetch calls
export function getAuthHeader(): Record<string, string> {
  try {
    const token = localStorage.getItem("token") || localStorage.getItem("authToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}
