export type RootStackParamList = {
  SelectStaff: undefined;
  Home: undefined;
  StartVisit: undefined;
  VisitDashboard: { visitId: string };
  MixSession: { visitId: string; mixId?: string };
  FinalizeSale: { visitId: string | null };
  ReceiptSuccess: { saleId: string };
  CheckoutVisit: { visitId: string };
};

export interface RouteEntry {
  routeName: keyof RootStackParamList;
  screenEN: string;
  hebrew: string;
  domain: string;
  screenId: number;
  primaryActions: string[];
}

export const ROUTE_MAP: RouteEntry[] = [
  {
    routeName: 'SelectStaff',
    screenEN: 'Select Staff',
    hebrew: 'בחירת צוות',
    domain: 'Session',
    screenId: 0,
    primaryActions: ['Select Staff', 'Select Role'],
  },
  {
    routeName: 'Home',
    screenEN: 'Home',
    hebrew: 'מסך הבית',
    domain: 'Home',
    screenId: 1,
    primaryActions: ['Start Visit', 'Quick Mix', 'Switch Mode'],
  },
  {
    routeName: 'StartVisit',
    screenEN: 'Start Visit',
    hebrew: 'פתיחת ביקור',
    domain: 'Visit',
    screenId: 2,
    primaryActions: ['Create Client', 'Start Visit'],
  },
  {
    routeName: 'VisitDashboard',
    screenEN: 'Visit Dashboard',
    hebrew: 'ניהול ביקור',
    domain: 'Visit',
    screenId: 3,
    primaryActions: ['Start Mix', 'Add Product', 'Finalize Sale', 'Checkout Visit'],
  },
  {
    routeName: 'MixSession',
    screenEN: 'Mix Session',
    hebrew: 'סשן מיקס',
    domain: 'Mix',
    screenId: 4,
    primaryActions: ['Start Mix', 'Continue Mix', 'Finish Mix'],
  },
  {
    routeName: 'FinalizeSale',
    screenEN: 'Finalize Sale',
    hebrew: 'סיום מכירה',
    domain: 'POS',
    screenId: 5,
    primaryActions: ['Capture Payment', 'Complete Sale'],
  },
  {
    routeName: 'ReceiptSuccess',
    screenEN: 'Receipt / Success',
    hebrew: 'אישור עסקה',
    domain: 'POS',
    screenId: 6,
    primaryActions: ['Return to Home', 'Return to Visit'],
  },
  {
    routeName: 'CheckoutVisit',
    screenEN: 'Checkout Visit',
    hebrew: 'סגירת ביקור',
    domain: 'Visit',
    screenId: 7,
    primaryActions: ['Confirm Checkout', 'Cancel'],
  },
];

export function getRouteEntry(routeName: keyof RootStackParamList): RouteEntry {
  const entry = ROUTE_MAP.find((r) => r.routeName === routeName);
  if (!entry) throw new Error(`Unknown route: ${routeName}`);
  return entry;
}
