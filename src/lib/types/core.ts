// Core database types for the 2-table architecture
// Gate B - Database Reduction Project

// Lead stages enum
export type LeadStage = 'cta_clicked' | 'account_completed' | 'address_completed' | 'payment_viewed';

// Subscription status enum  
export type SubscriptionStatus = 'trial_active' | 'active' | 'past_due' | 'canceled';

// Event log entry
export interface LeadEvent {
  ts: string;
  step: string;
  meta?: Record<string, unknown>;
}

// Lead record (4-stage funnel)
export interface Lead {
  lead_id: string;
  created_at: string;
  updated_at: string;
  
  // Attribution & Source
  source_page: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  
  // Session tracking
  session_id?: string;
  user_agent?: string;
  
  // Lead information
  email?: string;
  full_name?: string;
  
  // Funnel progression
  stage: LeadStage;
  cta_clicked_at?: string;
  account_completed_at?: string;
  address_completed_at?: string;
  payment_viewed_at?: string;
  
  // Event log
  events: LeadEvent[];
}

// Subscriber record (completed subscriptions)
export interface Subscriber {
  subscriber_id: string;
  created_at: string;
  updated_at: string;
  
  // Link to original lead
  lead_id?: string;
  
  // Customer information
  email: string;
  full_name?: string;
  company?: string;
  billing_country?: string;
  
  // Subscription details
  plan_code: string;
  currency: string;
  amount_minor: number;
  status: SubscriptionStatus;
  trial_start?: string;
  trial_end?: string;
  
  // SUMIT integration (secure IDs only)
  sumit_customer_id: string;
  sumit_payment_method?: string;
  sumit_subscription_id?: string;
  
  // Billing history
  last_charge_at?: string;
  canceled_at?: string;
}

// Lead progression utilities
export const LEAD_STAGES: LeadStage[] = ['cta_clicked', 'account_completed', 'address_completed', 'payment_viewed'];

export const STAGE_LABELS: Record<LeadStage, string> = {
  cta_clicked: 'CTA Clicked',
  account_completed: 'Account Created', 
  address_completed: 'Address Added',
  payment_viewed: 'Payment Viewed'
};

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  trial_active: 'Trial Active',
  active: 'Active',
  past_due: 'Past Due',
  canceled: 'Canceled'
};

// Validation helpers
export function isValidLeadStage(stage: string): stage is LeadStage {
  return LEAD_STAGES.includes(stage as LeadStage);
}

export function isValidSubscriptionStatus(status: string): status is SubscriptionStatus {
  return ['trial_active', 'active', 'past_due', 'canceled'].includes(status as SubscriptionStatus);
}

// Currency formatting helper
export function formatCurrency(amountMinor: number, currency: string = 'USD'): string {
  const amount = amountMinor / 100; // Convert from minor units
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}
