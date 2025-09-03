interface SumitPaymentMethod {
  id: string;
  last4: string;
  brand: string;
}

interface SumitUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  subscriptionPlanId: number;
}

interface CreatePaymentMethodRequest {
  cardNumber: string;
  expMonth: string;
  expYear: string;
  cvc: string;
  cardholderName: string;
}

interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  paymentMethodId: string;
  subscriptionPlanId: number;
  startDate?: string;
  delayDays?: number;
}

class SumitService {
  private apiKey: string;
  private companyId: string;
  private baseUrl = 'https://api.sumit.co.il';

  constructor(apiKey: string, companyId: string) {
    this.apiKey = apiKey;
    this.companyId = companyId;
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'X-Company-ID': this.companyId
    };
  }

  /**
   * Create a payment method in SUMIT
   * This should only be called from the server side
   */
  async createPaymentMethod(data: CreatePaymentMethodRequest): Promise<SumitPaymentMethod> {
    const response = await fetch(`${this.baseUrl}/website/payments/create/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        cardNumber: data.cardNumber,
        expirationMonth: data.expMonth,
        expirationYear: data.expYear,
        cvv: data.cvc,
        cardholderName: data.cardholderName,
        companyId: this.companyId
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create payment method');
    }

    const result = await response.json();
    return {
      id: result.paymentMethodId,
      last4: result.last4,
      brand: result.brand
    };
  }

  /**
   * Create a user with subscription in SUMIT
   * Sets up a 35-day trial with 0 charge initially
   */
  async createUser(data: CreateUserRequest): Promise<SumitUser> {
    // Calculate start date as 35 days from now if not provided
    const startDate = data.startDate || new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const response = await fetch(`${this.baseUrl}/website/users/create/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        paymentMethodId: data.paymentMethodId,
        subscriptionPlanId: data.subscriptionPlanId,
        companyId: this.companyId,
        startDate: startDate,
        initialCharge: 0, // 0 charge for trial
        delayDays: data.delayDays || 35
      })
    });

    if (!response.ok) {
      const error = await response.json();
      
      // Handle specific error codes
      if (response.status === 400 && error.message?.includes('email')) {
        throw new Error('This email is already registered in our payment system');
      } else if (response.status === 402) {
        throw new Error('Payment method was declined. Please try another card');
      }
      
      throw new Error(error.message || 'Failed to create user');
    }

    const result = await response.json();
    return {
      id: result.userId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phoneNumber,
      subscriptionPlanId: data.subscriptionPlanId
    };
  }

  /**
   * Get user details from SUMIT
   */
  async getUser(userId: string): Promise<SumitUser | null> {
    const response = await fetch(`${this.baseUrl}/website/users/${userId}`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to get user details');
    }

    return response.json();
  }

  /**
   * Update user subscription plan
   */
  async updateSubscription(userId: string, newPlanId: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/website/users/${userId}/subscription`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({
        subscriptionPlanId: newPlanId
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update subscription');
    }
  }

  /**
   * Cancel user subscription
   */
  async cancelSubscription(userId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/website/users/${userId}/cancel`, {
      method: 'POST',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to cancel subscription');
    }
  }
}

export default SumitService;
export type { SumitPaymentMethod, SumitUser, CreatePaymentMethodRequest, CreateUserRequest };
