export interface SumitCustomer {
  name: string;
  email: string;
  phone: string;
  address?: string;
  company?: string;
  id?: string;
}

export interface SumitPaymentMethod {
  token: string;
  customerId: string;
  pmId?: string;
  last4?: string;
  brand?: string;
}

export interface SumitSubscription {
  customerId: string;
  pmId: string;
  plan: {
    price: number;
    interval: 'month' | 'year';
    trialDays?: number;
  };
  subId?: string;
  status?: string;
  nextBilling?: string;
}

export interface SumitWebhookEvent {
  eventType: string;
  data: any;
  signature?: string;
}
