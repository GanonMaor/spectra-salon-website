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
  customerId: number; // SUMIT UserID from user creation step
  ogToken: string; // Single-use token from SUMIT tokenization
}

interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string; // Auto-generated password for SUMIT
}

class SumitService {
  private apiKey: string;
  private companyId: string;
  private baseUrl = 'https://' + 'api.sumit.co.il';

  constructor(apiKey: string, companyId: string) {
    this.apiKey = apiKey;
    this.companyId = companyId;
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json'
    };
  }

  private getCredentials() {
    return {
      CompanyID: parseInt(this.companyId),
      APIKey: this.apiKey
    };
  }

  /**
   * Create a payment method in SUMIT
   * This should only be called from the server side
   */
  async createPaymentMethod(data: CreatePaymentMethodRequest): Promise<SumitPaymentMethod> {
    const response = await fetch(`${this.baseUrl}/billing/paymentmethods/setforcustomer/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        Credentials: this.getCredentials(),
        PaymentMethod: {
          CustomerID: data.customerId, // This will need to be added to the interface
          SingleUseToken: data.ogToken // This will need to be added to the interface
        }
      })
    });

    const result = await response.json();
    
    if (!response.ok || !result.Status?.includes("Success")) {
      throw new Error(result.UserErrorMessage || result.TechnicalErrorDetails || 'Failed to create payment method');
    }

    const paymentMethodId = result.Data?.PaymentMethodID;
    if (!paymentMethodId) {
      throw new Error('No PaymentMethodID returned from SUMIT');
    }

    return {
      id: paymentMethodId.toString(),
      last4: '', // Not provided by SUMIT in this response
      brand: '' // Not provided by SUMIT in this response
    };
  }

  /**
   * Create a user with subscription in SUMIT
   * Sets up a 35-day trial with 0 charge initially
   */
  async createUser(data: CreateUserRequest): Promise<SumitUser> {
    const response = await fetch(`${this.baseUrl}/website/users/create/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        Credentials: this.getCredentials(),
        User: {
          Name: `${data.firstName} ${data.lastName}`,
          EmailAddress: data.email,
          Phone: data.phoneNumber,
          Password: data.password, // Auto-generated password
          Role: "Shared",
          SkipActivation: true
        }
      })
    });

    const result = await response.json();
    
    if (!response.ok || !result.Status?.includes("Success")) {
      // Handle specific SUMIT errors
      if (result.UserErrorMessage?.includes('email') || result.TechnicalErrorDetails?.includes('email')) {
        throw new Error('This email is already registered. Please use a different email or contact support.');
      }
      
      throw new Error(result.UserErrorMessage || result.TechnicalErrorDetails || 'Failed to create user');
    }

    const userId = result.Data?.UserID;
    if (!userId) {
      throw new Error('No UserID returned from SUMIT');
    }

    return {
      id: userId.toString(),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phoneNumber,
      subscriptionPlanId: 0 // Will be set later with payment method
    };
  }

  /**
   * Charge initial payment (0 amount for trial)
   */
  async chargeInitialPayment(customerId: number, paymentMethodId: number, productId: number): Promise<string> {
    const response = await fetch(`${this.baseUrl}/billing/payments/charge/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        Credentials: this.getCredentials(),
        Payment: {
          CustomerID: customerId,
          PaymentMethodID: paymentMethodId,
          Amount: 0, // Zero for trial
          ProductID: productId
        }
      })
    });

    const result = await response.json();
    
    if (!response.ok || !result.Status?.includes("Success")) {
      throw new Error(result.UserErrorMessage || result.TechnicalErrorDetails || 'Failed to process initial charge');
    }

    const transactionId = result.Data?.TransactionID;
    if (!transactionId) {
      throw new Error('No TransactionID returned from SUMIT');
    }

    return transactionId.toString();
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
