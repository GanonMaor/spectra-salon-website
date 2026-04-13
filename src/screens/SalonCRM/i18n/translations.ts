export type CrmLang = "en" | "he";

export interface CrmTranslations {
  // ── Navigation ─────────────────────────────────────────────────────
  nav: {
    schedule: string;
    customers: string;
    inventory: string;
    staff: string;
    analytics: string;
    spectra: string;
  };
  // ── Shell ──────────────────────────────────────────────────────────
  shell: {
    salonCrm: string;
    poweredBy: string;
    expandSidebar: string;
    collapseSidebar: string;
    switchLight: string;
    switchDark: string;
  };
  // ── Common ─────────────────────────────────────────────────────────
  common: {
    save: string;
    cancel: string;
    edit: string;
    delete: string;
    close: string;
    search: string;
    add: string;
    back: string;
    loading: string;
    notes: string;
    today: string;
    allStaff: string;
    noData: string;
  };
  // ── Schedule / Calendar ────────────────────────────────────────────
  schedule: {
    title: string;
    newAppointment: string;
    appointment: string;
    appointments: string;
    appointmentDetails: string;
    createAppointment: string;
    editAppointment: string;
    splitAppointment: string;
    manualSplit: string;
    manualSplitDesc: string;
    orApplyTemplate: string;
    viewWeek: string;
    view3Days: string;
    viewDay: string;
    viewList: string;
    aiPlaceholder: string;
    client: string;
    searchOrTypeClient: string;
    service: string;
    servicePlaceholder: string;
    employee: string;
    category: string;
    startTime: string;
    endTime: string;
    status: string;
    timelineSegments: string;
    segments: string;
    split: string;
    statusConfirmed: string;
    statusInProgress: string;
    statusCompleted: string;
    statusCancelled: string;
    statusNoShow: string;
    catColor: string;
    catHighlights: string;
    catToner: string;
    catStraightening: string;
    catCut: string;
    catTreatment: string;
    catOther: string;
    segApply: string;
    segWait: string;
    segWash: string;
    segDry: string;
    segCheckin: string;
    segCheckout: string;
    segService: string;
    shortDaySun: string;
    shortDayMon: string;
    shortDayTue: string;
    shortDayWed: string;
    shortDayThu: string;
    shortDayFri: string;
    shortDaySat: string;
    monthJan: string;
    monthFeb: string;
    monthMar: string;
    monthApr: string;
    monthMay: string;
    monthJun: string;
    monthJul: string;
    monthAug: string;
    monthSep: string;
    monthOct: string;
    monthNov: string;
    monthDec: string;
  };
  // ── Customers ──────────────────────────────────────────────────────
  customers: {
    title: string;
    addClient: string;
    editClient: string;
    firstName: string;
    firstNameRequired: string;
    lastName: string;
    phone: string;
    email: string;
    tags: string;
    tagsPlaceholder: string;
    saveChanges: string;
    totalVisits: string;
    totalSpent: string;
    lastVisit: string;
    visitHistory: string;
    noVisits: string;
    searchPlaceholder: string;
    noClients: string;
    noClientsDesc: string;
    archive: string;
    notesPlaceholder: string;
    visits: string;
  };
  // ── Inventory ──────────────────────────────────────────────────────
  inventory: {
    title: string;
    subtitle: string;
    saveChanges: string;
    fullCatalog: string;
    inStock: string;
    lowStock: string;
    stockGrid: string;
    stockTable: string;
    barcodes: string;
    showHide: string;
    brand: string;
    line: string;
    level: string;
    searchPlaceholder: string;
    stock: string;
    min: string;
    price: string;
    cost: string;
    margin: string;
    shade: string;
    units: string;
    avgPrice: string;
    totalUnits: string;
    productShown: string;
    productHidden: string;
    barcodeUpdated: string;
    loadFailed: string;
    saveFailed: string;
    updatedProducts: string;
    noProducts: string;
  };
  // ── Staff ──────────────────────────────────────────────────────────
  staff: {
    title: string;
    subtitle: string;
    teamMembers: string;
    activeToday: string;
    topPerformer: string;
    noDataYet: string;
    connectToEnable: string;
    comingSoon: string;
    teamManagement: string;
    teamManagementDesc: string;
  };
  // ── Spectra Preview ────────────────────────────────────────────────
  spectra: {
    title: string;
    subtitle: string;
    tabOverview: string;
    tabColorStock: string;
    tabOrders: string;
    tabClients: string;
    tabAiMix: string;
    tabReports: string;
    totalShades: string;
    inStock: string;
    lowStockAlerts: string;
    stockValue: string;
    colorInventoryTitle: string;
    colorInventoryDesc: string;
    orderManagementTitle: string;
    orderManagementDesc: string;
    clientProfilesTitle: string;
    clientProfilesDesc: string;
    aiMixingTitle: string;
    aiMixingDesc: string;
    schedulingTitle: string;
    schedulingDesc: string;
    reportsTitle: string;
    reportsDesc: string;
    learnMore: string;
    viewAll: string;
    exploreTab: string;
    statusDelivered: string;
    statusInTransit: string;
    targetFormula: string;
    baseShade: string;
    mix: string;
    developer: string;
    processingTime: string;
    clientName: string;
    visits: string;
    lastVisit: string;
    topColor: string;
    satisfaction: string;
  };
  // ── Analytics ──────────────────────────────────────────────────────
  analytics: {
    tabDashboard: string;
    tabStaff: string;
    tabServices: string;
    tabProducts: string;
    presetToday: string;
    presetWeek: string;
    presetMonth: string;
    presetYear: string;
    presetCustom: string;
    dateFrom: string;
    dateTo: string;
  };
}

const en: CrmTranslations = {
  nav: {
    schedule: "Schedule",
    customers: "Customers",
    inventory: "Inventory",
    staff: "Staff",
    analytics: "Analytics",
    spectra: "Spectra",
  },
  shell: {
    salonCrm: "Salon CRM",
    poweredBy: "Powered by Spectra AI",
    expandSidebar: "Expand sidebar",
    collapseSidebar: "Collapse sidebar",
    switchLight: "Switch to light mode",
    switchDark: "Switch to dark mode",
  },
  common: {
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    close: "Close",
    search: "Search",
    add: "Add",
    back: "Back",
    loading: "Loading…",
    notes: "Notes",
    today: "Today",
    allStaff: "All Staff",
    noData: "—",
  },
  schedule: {
    title: "Schedule",
    newAppointment: "New Appointment",
    appointment: "appointment",
    appointments: "appointments",
    appointmentDetails: "Appointment Details",
    createAppointment: "Create Appointment",
    editAppointment: "Edit Appointment",
    splitAppointment: "Split Appointment",
    manualSplit: "Manual Split",
    manualSplitDesc: "Split into 2 equal segments (Apply + Processing)",
    orApplyTemplate: "Or apply a template:",
    viewWeek: "Week",
    view3Days: "3 Days",
    viewDay: "Day",
    viewList: "List",
    aiPlaceholder: "Ask Spectra AI to update your calendar…",
    client: "Client",
    searchOrTypeClient: "Search or type client name…",
    service: "Service",
    servicePlaceholder: "e.g. Root Color, Balayage…",
    employee: "Employee",
    category: "Category",
    startTime: "Start",
    endTime: "End",
    status: "Status",
    timelineSegments: "Timeline Segments",
    segments: "segments",
    split: "Split",
    statusConfirmed: "Confirmed",
    statusInProgress: "In Progress",
    statusCompleted: "Completed",
    statusCancelled: "Cancelled",
    statusNoShow: "No Show",
    catColor: "Color",
    catHighlights: "Highlights",
    catToner: "Toner",
    catStraightening: "Straightening",
    catCut: "Cut",
    catTreatment: "Treatment",
    catOther: "Other",
    segApply: "Apply",
    segWait: "Wait",
    segWash: "Wash",
    segDry: "Dry",
    segCheckin: "Check-in",
    segCheckout: "Check-out",
    segService: "Service",
    shortDaySun: "Sun",
    shortDayMon: "Mon",
    shortDayTue: "Tue",
    shortDayWed: "Wed",
    shortDayThu: "Thu",
    shortDayFri: "Fri",
    shortDaySat: "Sat",
    monthJan: "Jan",
    monthFeb: "Feb",
    monthMar: "Mar",
    monthApr: "Apr",
    monthMay: "May",
    monthJun: "Jun",
    monthJul: "Jul",
    monthAug: "Aug",
    monthSep: "Sep",
    monthOct: "Oct",
    monthNov: "Nov",
    monthDec: "Dec",
  },
  customers: {
    title: "Clients",
    addClient: "Add Client",
    editClient: "Edit Client",
    firstName: "First Name",
    firstNameRequired: "First Name *",
    lastName: "Last Name",
    phone: "Phone",
    email: "Email",
    tags: "Tags",
    tagsPlaceholder: "vip, regular, sensitive-scalp",
    saveChanges: "Save Changes",
    totalVisits: "Total Visits",
    totalSpent: "Total Spent",
    lastVisit: "Last Visit",
    visitHistory: "Visit History",
    noVisits: "No visits yet",
    searchPlaceholder: "Search clients…",
    noClients: "No clients yet",
    noClientsDesc: "Add your first client to get started",
    archive: "Archive",
    notesPlaceholder: "Allergies, preferences, color history…",
    visits: "visits",
  },
  inventory: {
    title: "Inventory Management",
    subtitle: "Manage stock, pricing, barcodes & visibility",
    saveChanges: "Save Changes",
    fullCatalog: "Full Catalog",
    inStock: "In Stock",
    lowStock: "Low Stock",
    stockGrid: "Stock (Grid)",
    stockTable: "Stock (Table)",
    barcodes: "Barcodes",
    showHide: "Show / Hide",
    brand: "Brand",
    line: "Line",
    level: "Level",
    searchPlaceholder: "Search shade / name…",
    stock: "Stock",
    min: "Min",
    price: "Price",
    cost: "Cost",
    margin: "Margin",
    shade: "Shade",
    units: "units",
    avgPrice: "avg price",
    totalUnits: "total units",
    productShown: "Product shown",
    productHidden: "Product hidden",
    barcodeUpdated: "Barcode updated",
    loadFailed: "Failed to load inventory data",
    saveFailed: "Save failed",
    updatedProducts: "Updated {n} product(s)",
    noProducts: "No products match filters",
  },
  staff: {
    title: "Staff",
    subtitle: "Manage your team members and performance",
    teamMembers: "Team Members",
    activeToday: "Active Today",
    topPerformer: "Top Performer",
    noDataYet: "No data yet",
    connectToEnable: "Connect to enable",
    comingSoon: "Coming soon",
    teamManagement: "Team Management",
    teamManagementDesc:
      "Staff profiles, roles, and performance metrics will appear here. Connect your Spectra account to sync team data.",
  },
  spectra: {
    title: "Spectra System Preview",
    subtitle: "Explore the full Spectra salon management experience",
    tabOverview: "Overview",
    tabColorStock: "Color Stock",
    tabOrders: "Orders",
    tabClients: "Clients",
    tabAiMix: "AI Mix",
    tabReports: "Reports",
    totalShades: "Total Shades",
    inStock: "In Stock",
    lowStockAlerts: "Low Stock Alerts",
    stockValue: "Stock Value",
    colorInventoryTitle: "Color Inventory",
    colorInventoryDesc: "Track every shade with visual tube grid and smart stock alerts",
    orderManagementTitle: "Order Management",
    orderManagementDesc: "Streamlined reordering with automatic low-stock detection",
    clientProfilesTitle: "Client Profiles",
    clientProfilesDesc: "Complete color history and preference tracking per client",
    aiMixingTitle: "AI Color Mixing",
    aiMixingDesc: "Intelligent formula recommendations powered by Spectra AI",
    schedulingTitle: "Smart Scheduling",
    schedulingDesc: "Optimized appointment booking with service time estimation",
    reportsTitle: "Revenue Reports",
    reportsDesc: "Real-time analytics on product usage, revenue and trends",
    learnMore: "Learn More",
    viewAll: "View All",
    exploreTab: "Explore",
    statusDelivered: "Delivered",
    statusInTransit: "In Transit",
    targetFormula: "Target",
    baseShade: "Base",
    mix: "Mix",
    developer: "Developer",
    processingTime: "Time",
    clientName: "Client",
    visits: "visits",
    lastVisit: "Last Visit",
    topColor: "Top Color",
    satisfaction: "Satisfaction",
  },
  analytics: {
    tabDashboard: "Dashboard",
    tabStaff: "Staff Performance",
    tabServices: "Services",
    tabProducts: "Product Usage",
    presetToday: "Today",
    presetWeek: "Week",
    presetMonth: "Month",
    presetYear: "Year",
    presetCustom: "Custom",
    dateFrom: "From",
    dateTo: "To",
  },
};

const he: CrmTranslations = {
  nav: {
    schedule: "יומן",
    customers: "לקוחות",
    inventory: "מלאי",
    staff: "צוות",
    analytics: "ניתוח",
    spectra: "ספקטרה",
  },
  shell: {
    salonCrm: "מספרה CRM",
    poweredBy: "מופעל על ידי Spectra AI",
    expandSidebar: "הרחב תפריט",
    collapseSidebar: "כווץ תפריט",
    switchLight: "מעבר למצב בהיר",
    switchDark: "מעבר למצב כהה",
  },
  common: {
    save: "שמור",
    cancel: "ביטול",
    edit: "עריכה",
    delete: "מחק",
    close: "סגור",
    search: "חיפוש",
    add: "הוסף",
    back: "חזרה",
    loading: "טוען…",
    notes: "הערות",
    today: "היום",
    allStaff: "כל הצוות",
    noData: "—",
  },
  schedule: {
    title: "יומן",
    newAppointment: "תור חדש",
    appointment: "תור",
    appointments: "תורים",
    appointmentDetails: "פרטי תור",
    createAppointment: "קבע תור",
    editAppointment: "עריכת תור",
    splitAppointment: "פיצול תור",
    manualSplit: "פיצול ידני",
    manualSplitDesc: "פיצול ל-2 שלבים שווים (מריחה + המתנה)",
    orApplyTemplate: "או החל תבנית:",
    viewWeek: "שבוע",
    view3Days: "3 ימים",
    viewDay: "יום",
    viewList: "רשימה",
    aiPlaceholder: "בקש מ-Spectra AI לעדכן את היומן…",
    client: "לקוח/ה",
    searchOrTypeClient: "חפש/י לקוח/ה…",
    service: "שירות",
    servicePlaceholder: "לדוג׳ צבע שורשים, בלייאז׳…",
    employee: "סטייליסט/ית",
    category: "קטגוריה",
    startTime: "התחלה",
    endTime: "סיום",
    status: "סטטוס",
    timelineSegments: "שלבי הטיפול",
    segments: "שלבים",
    split: "פיצול",
    statusConfirmed: "מאושר",
    statusInProgress: "בטיפול",
    statusCompleted: "הושלם",
    statusCancelled: "בוטל",
    statusNoShow: "לא הגיע",
    catColor: "צבע",
    catHighlights: "גוונים",
    catToner: "טונר",
    catStraightening: "החלקה",
    catCut: "תספורת",
    catTreatment: "טיפול",
    catOther: "אחר",
    segApply: "מריחה",
    segWait: "המתנה",
    segWash: "שטיפה",
    segDry: "ייבוש",
    segCheckin: "כניסה",
    segCheckout: "יציאה",
    segService: "שירות",
    shortDaySun: "ר׳",
    shortDayMon: "ב׳",
    shortDayTue: "ג׳",
    shortDayWed: "ד׳",
    shortDayThu: "ה׳",
    shortDayFri: "ו׳",
    shortDaySat: "שב׳",
    monthJan: "ינו׳",
    monthFeb: "פבר׳",
    monthMar: "מרץ",
    monthApr: "אפר׳",
    monthMay: "מאי",
    monthJun: "יונ׳",
    monthJul: "יול׳",
    monthAug: "אוג׳",
    monthSep: "ספט׳",
    monthOct: "אוק׳",
    monthNov: "נוב׳",
    monthDec: "דצמ׳",
  },
  customers: {
    title: "לקוחות",
    addClient: "הוסף לקוח/ה",
    editClient: "עריכת לקוח/ה",
    firstName: "שם פרטי",
    firstNameRequired: "שם פרטי *",
    lastName: "שם משפחה",
    phone: "טלפון",
    email: "אימייל",
    tags: "תגיות",
    tagsPlaceholder: "vip, קבוע/ה, עור רגיש",
    saveChanges: "שמור שינויים",
    totalVisits: "סה״כ ביקורים",
    totalSpent: "סה״כ הוצאות",
    lastVisit: "ביקור אחרון",
    visitHistory: "היסטוריית ביקורים",
    noVisits: "אין ביקורים עדיין",
    searchPlaceholder: "חיפוש לקוחות…",
    noClients: "אין לקוחות עדיין",
    noClientsDesc: "הוסף/י את הלקוח/ה הראשון/ה להתחיל",
    archive: "העבר לארכיון",
    notesPlaceholder: "אלרגיות, העדפות, היסטוריית צבע…",
    visits: "ביקורים",
  },
  inventory: {
    title: "ניהול מלאי",
    subtitle: "ניהול מלאי, תמחור, ברקודים וחשיפה",
    saveChanges: "שמור שינויים",
    fullCatalog: "כל הקטלוג",
    inStock: "במלאי",
    lowStock: "מלאי נמוך",
    stockGrid: "מלאי (גריד)",
    stockTable: "מלאי (טבלה)",
    barcodes: "ברקודים",
    showHide: "הסתר / הצג",
    brand: "מותג",
    line: "קולקציה",
    level: "גוון בסיס",
    searchPlaceholder: "חיפוש גוון / שם…",
    stock: "מלאי",
    min: "מינ׳",
    price: "מחיר",
    cost: "עלות",
    margin: "מרווח",
    shade: "גוון",
    units: "יחידות",
    avgPrice: "מחיר ממוצע",
    totalUnits: "סה״כ יחידות",
    productShown: "מוצר הוצג",
    productHidden: "מוצר הוסתר",
    barcodeUpdated: "ברקוד עודכן",
    loadFailed: "טעינת הנתונים נכשלה",
    saveFailed: "השמירה נכשלה",
    updatedProducts: "עודכנו {n} מוצרים",
    noProducts: "לא נמצאו מוצרים",
  },
  staff: {
    title: "צוות",
    subtitle: "ניהול חברי הצוות והביצועים",
    teamMembers: "חברי צוות",
    activeToday: "פעילים היום",
    topPerformer: "מצטיין/ת",
    noDataYet: "אין נתונים עדיין",
    connectToEnable: "חבר/י חשבון להפעלה",
    comingSoon: "בקרוב",
    teamManagement: "ניהול צוות",
    teamManagementDesc:
      "פרופילי עובדים, תפקידים ומדדי ביצועים יופיעו כאן. חבר/י את חשבון Spectra לסנכרון נתוני הצוות.",
  },
  spectra: {
    title: "תצוגה מקדימה של מערכת ספקטרה",
    subtitle: "חוו את חוויית ניהול המספרה המלאה של Spectra",
    tabOverview: "סקירה",
    tabColorStock: "מלאי צבעים",
    tabOrders: "הזמנות",
    tabClients: "לקוחות",
    tabAiMix: "AI מיקס",
    tabReports: "דוחות",
    totalShades: "סה״כ גוונים",
    inStock: "במלאי",
    lowStockAlerts: "התראות מלאי נמוך",
    stockValue: "שווי מלאי",
    colorInventoryTitle: "מלאי צבעים",
    colorInventoryDesc: "עקב אחר כל גוון עם רשת צינורות ויזואלית והתראות מלאי חכמות",
    orderManagementTitle: "ניהול הזמנות",
    orderManagementDesc: "הזמנה מחדש פשוטה עם זיהוי אוטומטי של מלאי נמוך",
    clientProfilesTitle: "פרופיל לקוחות",
    clientProfilesDesc: "מעקב מלא אחר היסטוריית צבע והעדפות לכל לקוח/ה",
    aiMixingTitle: "מיקס צבעים AI",
    aiMixingDesc: "המלצות פורמולה חכמות מבוססות Spectra AI",
    schedulingTitle: "יומן חכם",
    schedulingDesc: "קביעת תורים אופטימלית עם הערכת זמן שירות",
    reportsTitle: "דוחות הכנסות",
    reportsDesc: "ניתוח בזמן אמת של שימוש במוצרים, הכנסות וטרנדים",
    learnMore: "למד/י עוד",
    viewAll: "הצג הכל",
    exploreTab: "חקור",
    statusDelivered: "סופק",
    statusInTransit: "בדרך",
    targetFormula: "יעד",
    baseShade: "בסיס",
    mix: "מיקס",
    developer: "מחמצן",
    processingTime: "זמן",
    clientName: "לקוח/ה",
    visits: "ביקורים",
    lastVisit: "ביקור אחרון",
    topColor: "צבע מוביל",
    satisfaction: "שביעות רצון",
  },
  analytics: {
    tabDashboard: "לוח בקרה",
    tabStaff: "ביצועי צוות",
    tabServices: "שירותים",
    tabProducts: "שימוש במוצרים",
    presetToday: "היום",
    presetWeek: "שבוע",
    presetMonth: "חודש",
    presetYear: "שנה",
    presetCustom: "מותאם",
    dateFrom: "מתאריך",
    dateTo: "עד תאריך",
  },
};

export const crmTranslations: Record<CrmLang, CrmTranslations> = { en, he };
