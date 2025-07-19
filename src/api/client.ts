// Netlify Functions API Client
const API_BASE = '/.netlify/functions';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
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
      // In preview mode, Netlify functions don't work - return mock data
      if (endpoint === '/auth/me') {
        throw new Error('No authenticated user (preview mode)');
      }
      
      console.warn(`API call failed (preview mode): ${endpoint}`, fetchError);
      throw fetchError;
    }
  }

  // Auth methods
  async signup(data: { email: string; password: string; fullName: string; phone: string }) {
    const result = await this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (result.token) {
      this.token = result.token;
      localStorage.setItem('auth_token', result.token);
    }

    return result;
  }

  async login(email: string, password: string) {
    const result = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (result.token) {
      this.token = result.token;
      localStorage.setItem('auth_token', result.token);
    }

    return result;
  }

  // 🚨 תיקון קריטי: logout function
  async logout() {
    try {
      // נסה לשלוח בקשת logout לשרת
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      // גם אם השרת נכשל, נמשיך עם logout local
      console.warn('Server logout failed, continuing with local logout:', error);
    } finally {
      // תמיד מחק את הטוקן מהמקומות האלה
      this.token = null;
      localStorage.removeItem('auth_token');
      
      // מחק גם cookies אם יש
      document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      // אפס את המצב של הclient
      console.log('🚪 User logged out successfully');
    }
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Helper function לבדיקה אם מחובר
  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Helper function לקבלת הטוקן
  getToken(): string | null {
    return this.token;
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
    return this.request('/leads', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getLeads(params: {
    page?: number;
    limit?: number;
    status?: string;
    source?: string;
  } = {}) {
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
    return this.request('/cta-tracking', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Users methods
  async getUsers() {
    return this.request('/get-users');
  }
}

export const apiClient = new ApiClient();

// Export individual functions for backward compatibility
export const signUpWithEmail = (data: any) => apiClient.signup(data);
export const signInWithEmail = (email: string, password: string) => apiClient.login(email, password);
export const signOut = () => apiClient.logout();
export const getCurrentUser = () => apiClient.getCurrentUser();
export const createLead = (data: any) => apiClient.createLead(data);
export const getAllLeads = () => apiClient.getLeads();
export const trackCTAClick = (data: any) => apiClient.trackCTA(data); 