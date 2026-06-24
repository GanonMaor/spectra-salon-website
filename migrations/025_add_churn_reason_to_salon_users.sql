-- Migration 025: Add churn_reason column to salon_users
-- Safe to run multiple times (IF NOT EXISTS)
-- Stores the admin-selected reason a churned salon stopped using the product.
-- Allowed values are validated in the application layer (see CHURN_REASONS in
-- src/screens/AdminDashboard/AdminDashboard.tsx); empty string means "unassigned".

ALTER TABLE salon_users
  ADD COLUMN IF NOT EXISTS churn_reason TEXT DEFAULT '';

COMMENT ON COLUMN salon_users.churn_reason IS 'Admin-selected churn reason for the salon (predefined enum, empty = unassigned)';
