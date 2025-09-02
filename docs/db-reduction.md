# Database Reduction Plan: From Multiple Tables to 2-Table Architecture

## Executive Summary

This document outlines the plan to reduce the Spectra Salon database from multiple complex tables to a streamlined 2-table architecture focused on the core business model: lead funnel tracking and subscription management.

**Target Architecture:**

- `leads` - 4-stage funnel tracking (CTA → Account → Address → Payment Viewed)
- `subscribers` - Completed subscriptions with SUMIT integration

## Current Database Analysis

### Existing Tables (to be REMOVED)

Based on SQL files and database inventory:

#### Pipeline System (4 tables)

- `public.pipelines` - Pipeline definitions
- `public.pipeline_stages` - Stage configurations
- `public.pipeline_cards` - Lead cards in pipeline
- `public.pipeline_stage_transitions` - Movement history

#### Unified Chat System (6 tables)

- `clients` - Chat client profiles
- `support_users` - Support team users
- `messages` - Chat messages
- `message_tags` - Message categorization
- `support_assignments` - Support ticket assignments
- `client_throttling` - Rate limiting

#### Legacy Systems (2+ tables)

- `user_actions` - Action logging
- `support_tickets` - Legacy support system
- `leads` (current schema) - Will be replaced with new simplified version

### Current Admin Dashboard Pages (to be REMOVED)

All sections except Dashboard Overview will be removed:

#### Marketing Section

- `/admin/marketing` - MarketingDashboard.tsx
- `/admin/marketing/campaigns`
- `/admin/marketing/conversion-funnel`

#### Sales Section

- `/admin/sales/pipeline` - PipelineBoard.tsx + related components
- `/admin/sales/leads` - LeadsPage.tsx (Sales version)
- `/admin/sales/utm-reporting` - UTMReportingPage.tsx
- `/admin/sales/regional-funnel` - RegionalFunnelPage.tsx

#### Clients Section

- `/admin/clients/active` - ActiveClientsPage.tsx
- `/admin/clients/trials` - TrialsPage.tsx
- `/admin/clients/churned` - ChurnedPage.tsx

#### System Section

- `/admin/system/users` - UsersPage.tsx
- `/admin/system/api-keys` - APIKeysPage.tsx
- `/admin/system/permissions` - PermissionsPage.tsx

#### Additional Sections

- Account management (Profile, Billing, Organization, API Keys, Preferences)
- Support/UnifiedChat system (ChatList.tsx, ChatView.tsx, ClientInfo.tsx)
- Live section (DiagnosticsPage.tsx, HelpVideosPage.tsx, ZoomLinksPage.tsx)
- Logs section (ExportsPage.tsx, UsageHeatmapPage.tsx, UserActionsPage.tsx)
- Success section (AIAlertsPage.tsx, OnboardingStatusPage.tsx, VideoCallRequestsPage.tsx)

### Components to be REMOVED

Based on file analysis:

- `NewAdminSidebar.tsx` - Complex multi-section sidebar (replace with simple version)
- `PipelineBoard.tsx` + all pipeline components
- `LeadsOverview.tsx` - Complex leads dashboard (simplify for 4-stage funnel)
- `EnhancedGlassDashboard.tsx`, `CinematicDashboard.tsx` - Alternative dashboards
- All UnifiedChat components
- Multiple AdminDashboard variants (`AdminDashboard_new.tsx`, `AdminDashboard_old.tsx`)

## Target Architecture (NEW)

### Table 1: `leads`

**Purpose:** Track 4-stage signup funnel with attribution

```sql
CREATE TYPE lead_stage AS ENUM ('cta_clicked','account_completed','address_completed','payment_viewed');

CREATE TABLE leads (
  lead_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Attribution
  source_page       TEXT NOT NULL,
  utm_source        TEXT,
  utm_medium        TEXT,
  utm_campaign      TEXT,

  -- Session tracking
  session_id        TEXT,
  user_agent        TEXT,

  -- Lead data (collected in stage 1)
  email             CITEXT,
  full_name         TEXT,

  -- Funnel progression
  stage             lead_stage NOT NULL DEFAULT 'cta_clicked',
  cta_clicked_at          TIMESTAMPTZ,
  account_completed_at    TIMESTAMPTZ,
  address_completed_at    TIMESTAMPTZ,
  payment_viewed_at       TIMESTAMPTZ,

  -- Compact event log
  events            JSONB NOT NULL DEFAULT '[]'::jsonb
);
```

### Table 2: `subscribers`

**Purpose:** Completed subscriptions with SUMIT payment integration

```sql
CREATE TYPE subscription_status AS ENUM ('trial_active','active','past_due','canceled');

CREATE TABLE subscribers (
  subscriber_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Link to original lead
  lead_id              UUID REFERENCES leads(lead_id) ON DELETE SET NULL,

  -- Customer info
  email                CITEXT NOT NULL,
  full_name            TEXT,
  company              TEXT,
  billing_country      TEXT,

  -- Subscription details
  plan_code            TEXT NOT NULL,
  currency             TEXT NOT NULL DEFAULT 'USD',
  amount_minor         INTEGER NOT NULL,
  status               subscription_status NOT NULL DEFAULT 'trial_active',
  trial_start          TIMESTAMPTZ,
  trial_end            TIMESTAMPTZ,

  -- SUMIT integration (secure IDs only)
  sumit_customer_id    TEXT NOT NULL,
  sumit_payment_method TEXT,
  sumit_subscription_id TEXT,

  -- Billing history
  last_charge_at       TIMESTAMPTZ,
  canceled_at          TIMESTAMPTZ
);
```

## Data Migration Strategy

### Backup Requirements

1. **Export all existing tables** to CSV/SQL dumps before any changes
2. **Store backups** in `backups/pre-reduction-YYYY-MM-DD/`
3. **Verify backup integrity** - ensure files can be imported
4. **7-day grace period** before dropping old tables

### Migration Steps

1. **Existing leads table** - map to new `leads` schema where possible
2. **Pipeline data** - extract lead emails and stages, map to funnel stages
3. **Chat clients** - identify which became subscribers
4. **Payment data** - reconstruct from existing SUMIT webhook logs if available

### Data Mapping

#### Current leads → New leads

- Preserve: `email`, `full_name`, `source_page`, `utm_*`, `created_at`
- Map funnel stage based on existing data patterns
- Migrate attribution fields to new schema

#### Pipeline cards → New leads

- Extract `lead_email` from pipeline_cards
- Map pipeline stages to funnel stages:
  - Applied → `cta_clicked`
  - Qualified → `account_completed`
  - Payment Pending → `address_completed`
  - Installed/Active → promote to `subscribers`

#### Chat clients → Potential subscribers

- Cross-reference with payment/subscription data
- High-value prospects may become leads

## Admin Dashboard Simplification

### KEEP: Overview Page Only

- Location: `src/screens/Admin/AdminDashboard.tsx`
- Update to show:
  - **Funnel metrics:** Counts per stage (7d/30d)
  - **Conversion chart:** Weekly conversion rates
  - **Top sources:** `source_page` attribution
  - **Subscribers:** Today's new subscribers, status breakdown

### REMOVE: All Other Sections

Update `NewAdminSidebar.tsx` to show only:

```typescript
const SECTIONS = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    items: [{ label: "Overview", to: "/admin" }],
  },
];
```

### Update Routes

- Remove all admin routes except `/admin` (overview)
- Add 404 handling for removed routes
- Update any internal links/navigation

## File Cleanup Plan

### SQL Files to Remove

- `scripts/create-pipeline-schema.sql`
- `scripts/create-unified-chat-schema.sql`
- `scripts/create-user-actions-table.sql`
- `scripts/create-chat-schema.sql`

### Component Files to Remove

- All pipeline components (`src/screens/Admin/Pipeline/`)
- All chat components (`src/screens/Admin/Support/UnifiedChat/`)
- All client management (`src/screens/Admin/Clients/`)
- All system management (`src/screens/Admin/System/`)
- Marketing, Sales, Logs, Success, Live sections
- Complex dashboard variants

### Keep & Update

- `src/screens/Admin/AdminDashboard.tsx` - simplify to overview only
- `src/components/LeadsOverview.tsx` - update for 4-stage funnel
- `src/layouts/AdminLayout.tsx` - minimal layout
- Router configuration - remove dead routes

## Security & Compliance

### Data Protection

- **NO PAN/CVC storage** - only SUMIT tokens/IDs
- **Minimal PII** in leads table
- **Audit trail** via JSONB events (no sensitive data)

### Access Control

- Remove complex permission system
- Simple admin/non-admin check
- Environment-based access controls

## Testing & Validation

### Gate B Acceptance Criteria

- [ ] New tables created successfully
- [ ] Existing data migrated and verified
- [ ] Simple CRUD operations working
- [ ] Build passes without errors

### Gate C Acceptance Criteria

- [ ] Lead tracking API functional
- [ ] SUMIT webhook processing works
- [ ] Overview dashboard shows live data
- [ ] No broken API endpoints

### Gate D Acceptance Criteria

- [ ] Only Overview page accessible
- [ ] All removed routes return 404
- [ ] No broken imports/dead code
- [ ] Bundle size reduced significantly
- [ ] All tests passing

## Rollback Plan

### Emergency Rollback

1. **Restore database** from pre-reduction backup
2. **Revert code** to previous commit
3. **Update environment** variables if changed

### Graceful Rollback

1. **Recreate old tables** from backup SQL
2. **Restore old admin routes** via git
3. **Update configuration** to use old schema
4. **Verify functionality** before going live

---

## Next Steps

1. **Review this document** with stakeholders
2. **Approve backup strategy** and storage location
3. **Create PR** with this documentation only
4. **Proceed to Gate B** after approval

Last updated: $(date)
Generated for: Database Reduction Project - Phase 1 (Gate A)
