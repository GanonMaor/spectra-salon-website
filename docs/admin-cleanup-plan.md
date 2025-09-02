# Admin Dashboard Cleanup Plan (Gate D)

## Overview

Remove all admin dashboard sections except Overview, while preserving design/backgrounds. Clean removal of routes, components, and imports without breaking the application.

## What to KEEP ✅

### Core Layout & Design

- `src/layouts/AdminLayout.tsx` - Main admin layout (simplify)
- `src/screens/Admin/AdminDashboard.tsx` - Overview page only
- Background/theme styling and glassmorphism effects
- User authentication and role checking
- Logout functionality

### Simplified Overview Dashboard

**Direct SQL queries only (no views):**

```sql
-- Lead funnel counts (7 days)
SELECT stage, COUNT(*) FROM leads_new
WHERE created_at >= now() - interval '7 days'
GROUP BY stage;

-- Top source pages (30 days)
SELECT source_page, COUNT(*) FROM leads_new
WHERE created_at >= now() - interval '30 days'
GROUP BY source_page ORDER BY COUNT(*) DESC LIMIT 5;

-- Subscriber summary
SELECT status, COUNT(*) FROM subscribers GROUP BY status;

-- Today's new subscribers
SELECT COUNT(*) FROM subscribers WHERE created_at >= CURRENT_DATE;
```

## What to REMOVE ❌

### 1. Admin Routes (from router configuration)

**File:** `src/index.tsx` or routing configuration

Remove all routes except:

```typescript
// KEEP ONLY
{ path: "/admin", element: <AdminDashboard /> }

// REMOVE ALL
{ path: "/admin/marketing/*" }
{ path: "/admin/sales/*" }
{ path: "/admin/clients/*" }
{ path: "/admin/system/*" }
{ path: "/admin/account/*" }
{ path: "/admin/support/*" }
{ path: "/admin/live/*" }
{ path: "/admin/logs/*" }
{ path: "/admin/success/*" }
```

### 2. Sidebar Sections

**File:** `src/components/NewAdminSidebar.tsx`

Replace SECTIONS array with:

```typescript
const SECTIONS = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    items: [{ label: "Overview", to: "/admin" }],
  },
];
```

### 3. Screen Components to DELETE

#### Marketing Section

- `src/screens/Admin/Marketing/MarketingDashboard.tsx`
- `src/screens/Admin/Marketing/` (entire directory)

#### Sales Section

- `src/screens/Admin/Sales/LeadsPage.tsx`
- `src/screens/Admin/Sales/UTMReportingPage.tsx`
- `src/screens/Admin/Sales/RegionalFunnelPage.tsx`
- `src/screens/Admin/Pipeline/` (entire directory)
  - `PipelineBoard.tsx`
  - `PipelinePage.tsx`
  - `LeadCard.tsx`
  - `NewPipelineModal.tsx`
  - `NewStageModal.tsx`
  - `StageColumn.tsx`

#### Client Management

- `src/screens/Admin/Clients/` (entire directory)
  - `ActiveClientsPage.tsx`
  - `TrialsPage.tsx`
  - `ChurnedPage.tsx`

#### System Management

- `src/screens/Admin/System/` (entire directory)
  - `UsersPage.tsx`
  - `APIKeysPage.tsx`
  - `PermissionsPage.tsx`

#### Support System

- `src/screens/Admin/Support/UnifiedChat/` (entire directory)
  - `ChatList.tsx`
  - `ChatView.tsx`
  - `ClientInfo.tsx`

#### Additional Sections

- `src/screens/Admin/Account/` (entire directory)
- `src/screens/Admin/Live/` (entire directory)
- `src/screens/Admin/Logs/` (entire directory)
- `src/screens/Admin/Success/` (entire directory)

#### Alternative Dashboards

- `src/screens/Admin/AdminDashboard_new.tsx`
- `src/screens/Admin/AdminDashboard_old.tsx`

### 4. Complex Components to REMOVE

#### Dashboard Components

- `src/components/EnhancedGlassDashboard.tsx`
- `src/components/CinematicDashboard.tsx`
- `src/components/NewAdminSidebar.tsx` (replace with simple version)

#### Pipeline Components

- All pipeline-related components in `src/components/`

#### Complex Lead Management

- Update `src/components/LeadsOverview.tsx` for simple 4-stage display only

### 5. API Endpoints to REMOVE

**Directory:** `netlify/functions/`

Remove these functions:

- `pipeline.js` - Pipeline management
- `setup-chat-db.js` - Chat system setup
- `get-users.js` - User management
- `add-user.js` - User creation

### 6. Database Schema Files to REMOVE

**Directory:** `scripts/`

- `create-pipeline-schema.sql`
- `create-unified-chat-schema.sql`
- `create-user-actions-table.sql`
- `create-chat-schema.sql`

## Implementation Steps

### Step 1: Route Cleanup

1. Update main router to only include `/admin` route
2. Add 404 handler for removed admin routes:
   ```typescript
   // Redirect removed admin routes to overview
   { path: "/admin/*", element: <Navigate to="/admin" replace /> }
   ```

### Step 2: Component Cleanup

1. Delete component directories listed above
2. Update imports in remaining files
3. Simplify `AdminDashboard.tsx` to show only Overview
4. Replace `NewAdminSidebar` with minimal version

### Step 3: Import Cleanup

1. Remove unused imports from:
   - `src/screens/Admin/AdminDashboard.tsx`
   - Router configuration files
   - Any index.ts files with removed exports

### Step 4: Build Verification

1. Run `npm run build` and fix any broken imports
2. Verify no TypeScript errors
3. Test that Overview page loads correctly
4. Confirm 404/redirect for removed routes

## Updated Overview Dashboard Structure

### Simplified AdminDashboard.tsx

```typescript
const AdminDashboard: React.FC = () => {
  // Only Overview content
  return (
    <div className="admin-layout">
      <Header />
      <OverviewContent />
    </div>
  );
};

const OverviewContent = () => (
  <div className="overview-dashboard">
    {/* 4-Stage Funnel Metrics */}
    <FunnelStageCards />

    {/* Top Source Pages */}
    <SourcePagesChart />

    {/* Subscriber Summary */}
    <SubscriberStats />

    {/* Today's Activity */}
    <TodayMetrics />
  </div>
);
```

### Simple Sidebar (40-50 LOC)

```typescript
const SimpleSidebar = ({ user, onLogout }) => (
  <aside className="admin-sidebar">
    <div className="sidebar-header">
      <h2>Spectra Admin</h2>
    </div>

    <nav>
      <NavLink to="/admin" className="nav-item active">
        <LayoutDashboard className="icon" />
        Overview
      </NavLink>
    </nav>

    <div className="user-section">
      <UserProfile user={user} onLogout={onLogout} />
    </div>
  </aside>
);
```

## Risk Mitigation

### Before Deletion

1. **Git branch** for cleanup work
2. **Full application backup**
3. **Database backup verification**
4. **Test build** to identify dependencies

### Safety Checks

1. Search codebase for imports of components being deleted
2. Check for any hardcoded routes in Link components
3. Verify no external references to removed API endpoints
4. Test all remaining functionality works

### Rollback Plan

1. Keep deleted components in git history
2. Document any configuration changes
3. Test rollback procedure on staging

## Expected Outcomes

### Bundle Size Reduction

- **Before:** ~10-15 admin page components + complex sidebar
- **After:** 1 overview page + simple sidebar
- **Estimated reduction:** 60-70% of admin-related code

### Maintenance Simplification

- **Before:** Multiple complex dashboards, pipeline management, chat system
- **After:** Single overview dashboard with direct SQL queries
- **Reduced complexity:** 90% fewer admin features to maintain

### Performance Improvement

- Faster admin page loads (fewer components to bundle)
- Reduced JavaScript bundle size
- Simpler routing (no nested admin routes)

---

**Status:** Ready for implementation in Gate D  
**Dependencies:** Gates A & B completed, new database schema tested  
**Estimated effort:** 2-3 hours for careful component removal and testing
