export interface Payment {
  id: number;
  client: string;
  payment_date: string;
  currency: 'ILS' | 'USD';
  amount: number;
  country: string;
  created_at: string;
}

export interface PaymentSummary {
  totalsByCurrency: CurrencySummary[];
  topClients: ClientSummary[];
  countrySummary: CountrySummary[];
  recentPayments: Payment[];
}

export interface CurrencySummary {
  currency: 'ILS' | 'USD';
  transaction_count: number;
  total_amount: number;
  avg_amount: number;
  unique_clients: number;
}

export interface ClientSummary {
  client: string;
  currency: 'ILS' | 'USD';
  payment_count: number;
  total_amount: number;
  avg_amount: number;
  last_payment: string;
}

export interface CountrySummary {
  country: string;
  currency: 'ILS' | 'USD';
  unique_clients: number;
  total_amount: number;
  transaction_count: number;
}

export interface MonthlyTrend {
  month: string;
  ILS?: number;
  USD?: number;
}

export interface PaymentFilters {
  client?: string;
  currency?: 'ILS' | 'USD';
  country?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  pages: number;
}
