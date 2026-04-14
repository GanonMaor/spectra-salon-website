import type {
  StaffVM,
  VisitCardVM,
  MixSessionCardVM,
  AlertVM,
  KpiCardVM,
} from '../viewmodels/types';

export const MOCK_STAFF: StaffVM[] = [
  { id: 'staff-001', name: 'Yael Ben-David', defaultRole: 'colorbar', avatarInitials: 'YB' },
  { id: 'staff-002', name: 'Noa Shapira', defaultRole: 'reception', avatarInitials: 'NS' },
  { id: 'staff-003', name: 'Avi Goldstein', defaultRole: 'manager', avatarInitials: 'AG' },
  { id: 'staff-004', name: 'Dana Levy', defaultRole: 'colorbar', avatarInitials: 'DL' },
];

export const MOCK_VISITS: VisitCardVM[] = [
  {
    visitId: 'v-001',
    clientName: 'Sarah Cohen',
    service: 'Full Color + Cut',
    stage: 'in_treatment',
    assignedStaffId: 'staff-001',
    assignedStaffName: 'Yael Ben-David',
    checkInAt: '2026-03-05T09:30:00',
    stageUpdatedAt: '2026-03-05T09:45:00',
    checkoutStartedAt: null,
    checkoutAt: null,
    mixCost: 31.05,
  },
  {
    visitId: 'v-002',
    clientName: 'Maya Levi',
    service: 'Highlights',
    stage: 'waiting',
    assignedStaffId: 'staff-004',
    assignedStaffName: 'Dana Levy',
    checkInAt: '2026-03-05T10:15:00',
    stageUpdatedAt: '2026-03-05T10:15:00',
    checkoutStartedAt: null,
    checkoutAt: null,
    mixCost: null,
  },
  {
    visitId: 'v-003',
    clientName: 'Tamar Rosen',
    service: 'Balayage',
    stage: 'arrived',
    assignedStaffId: 'staff-001',
    assignedStaffName: 'Yael Ben-David',
    checkInAt: '2026-03-05T10:45:00',
    stageUpdatedAt: '2026-03-05T10:45:00',
    checkoutStartedAt: null,
    checkoutAt: null,
    mixCost: null,
  },
  {
    visitId: 'v-004',
    clientName: 'Rivka Azoulay',
    service: 'Root Touch-up',
    stage: 'finishing',
    assignedStaffId: 'staff-004',
    assignedStaffName: 'Dana Levy',
    checkInAt: '2026-03-05T08:00:00',
    stageUpdatedAt: '2026-03-05T10:30:00',
    checkoutStartedAt: null,
    checkoutAt: null,
    mixCost: 18.40,
  },
  {
    visitId: 'v-005',
    clientName: 'Shira Kaplan',
    service: 'Toner + Blowout',
    stage: 'completed',
    assignedStaffId: 'staff-001',
    assignedStaffName: 'Yael Ben-David',
    checkInAt: '2026-03-05T07:30:00',
    stageUpdatedAt: '2026-03-05T09:00:00',
    checkoutStartedAt: '2026-03-05T09:05:00',
    checkoutAt: '2026-03-05T09:10:00',
    mixCost: 22.50,
  },
];

export const MOCK_MIXES: MixSessionCardVM[] = [
  {
    mixId: 'm-001',
    visitId: 'v-001',
    clientName: 'Sarah Cohen',
    state: 'weighing',
    itemCount: 2,
    totalWeightGrams: 135,
    totalCost: 31.05,
  },
  {
    mixId: 'm-002',
    visitId: 'v-004',
    clientName: 'Rivka Azoulay',
    state: 'finalized',
    itemCount: 3,
    totalWeightGrams: 90,
    totalCost: 18.40,
  },
];

export const MOCK_ALERTS: AlertVM[] = [
  {
    id: 'alert-001',
    authority: 'rule_engine',
    severity: 'high',
    title: 'Low Stock: Color Cream 7.1',
    message: 'Only 35g remaining (threshold: 100g)',
    createdAt: '2026-03-05T08:00:00',
    actionLabel: 'View Inventory',
  },
  {
    id: 'alert-002',
    authority: 'system',
    severity: 'medium',
    title: 'Stuck Visit',
    message: 'Visit v-004 in "finishing" for >30 min',
    createdAt: '2026-03-05T11:00:00',
    actionLabel: 'Open Visit',
  },
  {
    id: 'alert-003',
    authority: 'ai',
    severity: 'low',
    title: 'Reorder Suggestion',
    message: 'Developer 20vol usage trend suggests reorder in 5 days',
    createdAt: '2026-03-05T07:00:00',
  },
];

export const MOCK_KPIS: KpiCardVM[] = [
  { id: 'kpi-revenue', label: 'Revenue Today', value: '₪2,340', trend: 'up' },
  { id: 'kpi-mix-cost', label: 'Avg Mix Cost', value: '₪23.98', trend: 'down' },
  { id: 'kpi-active', label: 'Active Visits', value: '3', trend: 'flat' },
  { id: 'kpi-low-stock', label: 'Low Stock Alerts', value: '1', trend: 'up' },
];
