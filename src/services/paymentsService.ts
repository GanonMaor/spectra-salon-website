import { Payment, PaymentSummary, PaymentFilters, PaginationInfo, MonthlyTrend } from '../lib/types/payments';

interface PaymentsResponse {
  payments: Payment[];
  pagination: PaginationInfo;
}

interface SummaryResponse {
  summary: PaymentSummary;
  charts: {
    monthlyTrends: MonthlyTrend[];
  };
}

export class PaymentsService {
  private static baseUrl = '/.netlify/functions';

  static async getPayments(filters: PaymentFilters & { limit?: number; offset?: number } = {}): Promise<PaymentsResponse> {
    const queryParams = new URLSearchParams();
    
    if (filters.client) queryParams.append('client', filters.client);
    if (filters.currency) queryParams.append('currency', filters.currency);
    if (filters.country) queryParams.append('country', filters.country);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    if (filters.offset) queryParams.append('offset', filters.offset.toString());

    const response = await fetch(`${this.baseUrl}/get-payments?${queryParams}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch payments');
    }

    return response.json();
  }

  static async getSummary(): Promise<SummaryResponse> {
    const response = await fetch(`${this.baseUrl}/get-payments-summary`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch payment summary');
    }

    return response.json();
  }

  static formatCurrency(amount: number, currency: 'ILS' | 'USD'): string {
    const formatter = new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    return formatter.format(amount);
  }

  static formatDate(date: string): string {
    return new Date(date).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  static formatMonth(month: string): string {
    const date = new Date(month + '-01');
    return date.toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long'
    });
  }
}
