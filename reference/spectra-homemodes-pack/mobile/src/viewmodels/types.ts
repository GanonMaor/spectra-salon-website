export type StaffRole = 'colorbar' | 'reception' | 'manager';
export type HomeMode = 'colorbar' | 'reception' | 'manager';

export type VisitStage =
  | 'arrived'
  | 'waiting'
  | 'in_treatment'
  | 'finishing'
  | 'completed';

export type SyncState = 'synced' | 'syncing' | 'offline';

export interface StaffVM {
  id: string;
  name: string;
  defaultRole: StaffRole;
  avatarInitials: string;
}

export interface ClientVM {
  id: string;
  name: string;
  phone: string;
}

export interface VisitCardVM {
  visitId: string;
  clientName: string;
  service: string;
  stage: VisitStage;
  assignedStaffId: string;
  assignedStaffName: string;
  checkInAt: string;
  stageUpdatedAt: string;
  checkoutStartedAt: string | null;
  checkoutAt: string | null;
  mixCost: number | null;
}

export interface MixSessionCardVM {
  mixId: string;
  visitId: string;
  clientName: string;
  state: 'weighing' | 'finalized';
  itemCount: number;
  totalWeightGrams: number;
  totalCost: number;
}

export interface AlertVM {
  id: string;
  authority: 'ai' | 'rule_engine' | 'system';
  severity: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  createdAt: string;
  actionLabel?: string;
}

export interface KpiCardVM {
  id: string;
  label: string;
  value: string;
  unit?: string;
  trend?: 'up' | 'down' | 'flat';
}
