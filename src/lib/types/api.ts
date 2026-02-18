// API types for lead tracking and payment integration
// Gate B - Database Reduction Project

import type { LeadStage, SubscriptionStatus } from './core';

// API input types
export interface TrackLeadInput {
  leadId?: string;
  step: LeadStage;
  sourcePage?: string;
  sessionId?: string;
  email?: string;
  fullName?: string;
  meta?: Record<string, unknown>;
}

// Payment webhook types (for future payment integration)
export interface PaymentWebhookPayload {
  event_type: string;
  customer_id: string;
  subscription_id?: string;
  payment_method_id?: string;
  amount?: number;
  currency?: string;
  status?: string;
  metadata?: Record<string, unknown>;
}

// API Response types
export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LeadTrackingResponse extends ApiResponse {
  data?: {
    lead_id: string;
    stage: LeadStage;
    updated: boolean;
  };
}

// Dashboard analytics types
export interface LeadsSummary {
  total_leads: number;
  stage_1_cta: number;
  stage_2_account: number;
  stage_3_address: number;
  stage_4_payment: number;
  today_total: number;
  week_total: number;
  month_total: number;
}

export interface FunnelConversion {
  source_page: string;
  cta_clicks: number;
  accounts_completed: number;
  addresses_completed: number;
  payments_viewed: number;
  cta_to_account_rate: number;
  account_to_address_rate: number;
  address_to_payment_rate: number;
}

export interface SubscriptionSummary {
  status: SubscriptionStatus;
  count: number;
  total_revenue_minor: number;
  avg_amount_minor: number;
  first_signup: string;
  last_signup: string;
}

export interface SubscribersToday {
  new_today: number;
  active_total: number;
  trials_total: number;
  trials_expiring_soon: number;
  past_due_total: number;
  monthly_recurring_revenue_minor: number;
}

// Database query result types
export interface LeadQueryResult {
  lead_id: string;
  email?: string;
  stage: LeadStage;
  source_page: string;
  created_at: string;
  [key: string]: unknown;
}

export interface SubscriberQueryResult {
  subscriber_id: string;
  email: string;
  status: SubscriptionStatus;
  plan_code: string;
  amount_minor: number;
  created_at: string;
  [key: string]: unknown;
}

// Utility types for frontend components
export interface DashboardMetrics {
  leads: LeadsSummary;
  funnel: FunnelConversion[];
  subscribers: SubscribersToday;
  subscriptionBreakdown: SubscriptionSummary[];
}

export interface LeadFormData {
  email?: string;
  fullName?: string;
  company?: string;
  phone?: string;
  source_page: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

// Configuration types
export interface DatabaseConfig {
  connectionString: string;
  ssl: {
    rejectUnauthorized: boolean;
  };
  max: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

// L'Oréal Cohort Analysis types
export interface LorealCohort {
  id: number;
  name: string;
  description: string | null;
  start_month: string;
  end_month: string;
  member_count: number;
  created_at: string;
  updated_at: string;
}

export interface CohortApiResponse {
  cohorts?: LorealCohort[];
  cohort?: LorealCohort;
  members?: string[];
  success?: boolean;
  error?: string;
}

// Market Intelligence AI Insights
export interface MarketInsightsRequest {
  prompt: string;
  filters?: {
    monthFrom?: string;
    monthTo?: string;
    countries?: string[];
    cities?: string[];
  };
}

export interface MarketInsightsResponse {
  answer: string;
  bullets: string[];
  confidence: 'high' | 'medium' | 'low';
  dataWindow: string;
  model?: string;
  error?: string;
}

// Error types
export interface DatabaseError extends Error {
  code?: string;
  detail?: string;
  table?: string;
  column?: string;
}
