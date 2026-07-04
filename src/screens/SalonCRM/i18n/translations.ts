export type CrmLang = "en" | "he";

export interface CrmTranslations {
  // ── Navigation ─────────────────────────────────────────────────────
  nav: {
    home: string;
    schedule: string;
    settings: string;
    newCalendarDesign: string;
    customers: string;
    inventory: string;
    staff: string;
    analytics: string;
  };
  // ── Home Dashboard ────────────────────────────────────────────────
  home: {
    headerTitle: string;
    headerSubtitle: string;
    marketplace: string;
    marketplaceSubtitle: string;
    tokenBarrelEyebrow: string;
    tokenBarrelTitle: string;
    tokenBarrelSubtitle: string;
    tokenBarrelUsed: string;
    tokenBarrelRemaining: string;
    tokenBarrelActiveClients: string;
    tokenBarrelAppointments: string;
    tokenBarrelScaleConnected: string;
    tokenBarrelScaleManual: string;
    upNext: string;
    liveClients: string;
    seeAll: string;
    addNewClient: string;
    addNewClientHint: string;
    newService: string;
    options: string;
    fullHead: string;
    serviceToner: string;
    serviceColor: string;
    serviceStraightener: string;
    serviceHighlights: string;
    serviceTreatment: string;
    statusActive: string;
    statusMixInProgress: string;
    statusDone: string;
    statusReweighPending: string;
    bluetoothConnected: string;
    bluetoothDisconnected: string;
    bluetoothDisconnectedDetail: string;
    notifications: string;
    favorites: string;
    emptyTitle: string;
    emptySubtitle: string;
    today: string;
    daySun: string;
    dayMon: string;
    dayTue: string;
    dayWed: string;
    dayThu: string;
    dayFri: string;
    daySat: string;
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
    todayBtn: string;
    aiCouldNotUnderstand: string;
    aiCreated: string;
    aiNotFound: string;
    aiMoved: string;
    aiCancelled: string;
    aiStaffNotFound: string;
    aiAssigned: string;
    aiUpdatedNotes: string;
    aiUnsupportedAction: string;
    aiUnavailable: string;
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
    tabCalendar: string;
    tabSettings: string;
    wizard: {
      newEntry: string;
      editEntry: string;
      whatToCreate: string;
      typeAppointment: string;
      typeAppointmentDesc: string;
      typeBreak: string;
      typeBreakDesc: string;
      typeTimeBlock: string;
      typeTimeBlockDesc: string;
      typeInternalTask: string;
      typeInternalTaskDesc: string;
      typeOther: string;
      typeOtherDesc: string;
      stepType: string;
      stepClient: string;
      stepServices: string;
      stepWorkflow: string;
      stepSchedule: string;
      stepReview: string;
      detailsSuffix: string;
      titleNote: string;
      durationMinLabel: string;
      createPrefix: string;
      selectClient: string;
      searchByNameOrPhone: string;
      startTypingName: string;
      change: string;
      addNewClient: string;
      selectDepartment: string;
      selectCategory: string;
      selectService: string;
      backToDepartments: string;
      backToCategories: string;
      categoriesCount: string;
      servicesCount: string;
      usingSavedTiming: string;
      saveTimingsForClient: string;
      stageName: string;
      minutes: string;
      resource: string;
      none: string;
      addStage: string;
      frequentlyAdded: string;
      addAnotherService: string;
      processingHint: string;
      removeService: string;
      removeStage: string;
      stageTypeAria: string;
      scheduleHeading: string;
      clientJourney: string;
      processing: string;
      price: string;
      noConflicts: string;
      reviewSave: string;
      reviewCreate: string;
      window: string;
      activeTimeSuffix: string;
      processingTime: string;
      estimatedPrice: string;
      walkIn: string;
      optionalNotes: string;
      continue: string;
      saving: string;
      saveChanges: string;
      createAppointmentBtn: string;
      couldNotSave: string;
      appointmentSummary: string;
      noClientSelected: string;
      noServicesYet: string;
      linked: string;
      processingSuffix: string;
      activeSuffix: string;
      conflictsNeedAttention: string;
      warningsSuffix: string;
      noConflictsShort: string;
      settingsDepartments: string;
      settingsCategories: string;
      settingsServices: string;
      settingsResources: string;
      archivedNote: string;
      newDepartmentName: string;
      categoryNamePlaceholder: string;
      serviceNamePlaceholder: string;
      resourceNamePlaceholder: string;
      addServiceBtn: string;
      minShort: string;
      active: string;
      archived: string;
      processingTag: string;
      resChair: string;
      resWashStation: string;
      resTreatmentRoom: string;
      resColorStation: string;
      resOther: string;
      conflictAddService: string;
      conflictBeforeHours: string;
      conflictAfterHours: string;
      conflictNoEmployee: string;
      conflictStaffBusy: string;
      conflictNoResource: string;
      conflictResourceDouble: string;
    };
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
    statsTotal: string;
    statsActive: string;
    statsNew: string;
    durationMinSuffix: string;
    currencySymbol: string;
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
    unitsInStock: string;
    minStock: string;
    costUsd: string;
    sellPriceUsd: string;
    marginPct: string;
    unsaved: string;
    scanBarcodeFor: string;
    enterOrScanBarcode: string;
    scanBarcodeBtn: string;
    saveBarcodeBtn: string;
    visAll: string;
    visDisplayed: string;
    visHidden: string;
    hideProduct: string;
    showProduct: string;
    displayed: string;
    hidden: string;
    noProductsFilter: string;
    levelLabel: string;
    otherLevel: string;
    productLine: string;
    shadesCount: string;
    avgPriceFull: string;
    unitsFull: string;
    barcodeFailed: string;
    visibilityFailed: string;
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
    statTotal: string;
    statDone: string;
    statLive: string;
    statUpcoming: string;
    activeSuffix: string;
    utilizationSuffix: string;
  };
  // ── AI surface (insights + Alice) ─────────────────────────────────
  ai: {
    insightsTitle: string;
    severityHigh: string;
    severityMedium: string;
    severityLow: string;
    typeInventory: string;
    typePerformance: string;
    typeRevenue: string;
    typeMix: string;
    paginationLabel: string;
    paginationCardLabel: string;
    aliceTitle: string;
    aliceGreeting: string;
    alicePlaceholder: string;
    aliceVoiceComingSoon: string;
    aliceSend: string;
    aliceDismiss: string;
    aliceThinking: string;
    aliceAssistantLabel: string;
    aliceSuggestOptimize: string;
    aliceSuggestLowStock: string;
    aliceSuggestTopStylist: string;
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
    home: "Home",
    schedule: "Schedule",
    settings: "Settings",
    newCalendarDesign: "New Calendar Design",
    customers: "Customers",
    inventory: "Inventory",
    staff: "Staff",
    analytics: "Analytics",
  },
  home: {
    headerTitle: "Salon command center",
    headerSubtitle: "Live membership value, today's flow, and the next best actions.",
    marketplace: "Marketplace and Education",
    marketplaceSubtitle: "Brands, courses, products, and campaigns",
    tokenBarrelEyebrow: "Membership engine",
    tokenBarrelTitle: "Token barrel in motion",
    tokenBarrelSubtitle: "Every client, mix, and appointment draws from the salon's included Spectra tokens.",
    tokenBarrelUsed: "used today",
    tokenBarrelRemaining: "still in the barrel",
    tokenBarrelActiveClients: "active clients",
    tokenBarrelAppointments: "appointments",
    tokenBarrelScaleConnected: "Scale connected",
    tokenBarrelScaleManual: "Manual mode",
    upNext: "Up Next",
    liveClients: "Live Clients",
    seeAll: "See All",
    addNewClient: "Add New Client",
    addNewClientHint: "Start a new visit",
    newService: "New Service",
    options: "Options",
    fullHead: "Full Head",
    serviceToner: "Toner",
    serviceColor: "Color",
    serviceStraightener: "Straightener",
    serviceHighlights: "Highlights",
    serviceTreatment: "Treatment",
    statusActive: "Active",
    statusMixInProgress: "Mix in progress",
    statusDone: "Done",
    statusReweighPending: "Reweigh pending",
    bluetoothConnected: "Scale connected",
    bluetoothDisconnected: "Scale not connected",
    bluetoothDisconnectedDetail: "Manual mode is available",
    notifications: "Notifications",
    favorites: "Favorites",
    emptyTitle: "No live clients yet",
    emptySubtitle: "Add your first client to start the day",
    today: "Today",
    daySun: "Sun",
    dayMon: "Mon",
    dayTue: "Tue",
    dayWed: "Wed",
    dayThu: "Thu",
    dayFri: "Fri",
    daySat: "Sat",
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
    todayBtn: "Today",
    aiCouldNotUnderstand: "Could not understand the request.",
    aiCreated: "Created appointment for",
    aiNotFound: "Appointment not found.",
    aiMoved: "Moved appointment to",
    aiCancelled: "Cancelled appointment for",
    aiStaffNotFound: "Staff member not found.",
    aiAssigned: "Assigned to",
    aiUpdatedNotes: "Updated notes for",
    aiUnsupportedAction: "Unsupported action type.",
    aiUnavailable: "AI service unavailable.",
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
    tabCalendar: "Calendar",
    tabSettings: "Settings",
    wizard: {
      newEntry: "New Calendar Entry",
      editEntry: "Edit Appointment",
      whatToCreate: "What would you like to create?",
      typeAppointment: "Client Appointment",
      typeAppointmentDesc: "Build a full service appointment",
      typeBreak: "Break",
      typeBreakDesc: "Personal or team break",
      typeTimeBlock: "Time Block",
      typeTimeBlockDesc: "Block time for prep or admin",
      typeInternalTask: "Internal Task",
      typeInternalTaskDesc: "Staff task, training, or meeting",
      typeOther: "Other Event",
      typeOtherDesc: "Custom calendar entry",
      stepType: "Type",
      stepClient: "Client",
      stepServices: "Services",
      stepWorkflow: "Workflow",
      stepSchedule: "Schedule",
      stepReview: "Review",
      detailsSuffix: "details",
      titleNote: "Title / note",
      durationMinLabel: "Duration (min)",
      createPrefix: "Create",
      selectClient: "Select Client",
      searchByNameOrPhone: "Search by name or phone",
      startTypingName: "Start typing a name...",
      change: "Change",
      addNewClient: "Add new client",
      selectDepartment: "Select Department",
      selectCategory: "Select Category",
      selectService: "Select Service",
      backToDepartments: "Departments",
      backToCategories: "Categories",
      categoriesCount: "categories",
      servicesCount: "services",
      usingSavedTiming: "Using saved timing for",
      saveTimingsForClient: "Save these timings for this client",
      stageName: "Stage name",
      minutes: "Minutes",
      resource: "Resource",
      none: "None",
      addStage: "Add stage",
      frequentlyAdded: "Frequently added services",
      addAnotherService: "Add another service",
      processingHint: "Processing / waiting — employee is free during this stage",
      removeService: "Remove service",
      removeStage: "Remove stage",
      stageTypeAria: "Stage type",
      scheduleHeading: "Schedule",
      clientJourney: "Client journey",
      processing: "Processing",
      price: "Price",
      noConflicts: "No conflicts. This appointment fits the calendar.",
      reviewSave: "Review & Save",
      reviewCreate: "Review & Create",
      window: "Window",
      activeTimeSuffix: "active time",
      processingTime: "Processing time",
      estimatedPrice: "Estimated price",
      walkIn: "Walk-in client",
      optionalNotes: "Optional notes…",
      continue: "Continue",
      saving: "Saving…",
      saveChanges: "Save Changes",
      createAppointmentBtn: "Create Appointment",
      couldNotSave: "Could not save the appointment.",
      appointmentSummary: "Appointment Summary",
      noClientSelected: "No client selected",
      noServicesYet: "No services added yet",
      linked: "linked",
      processingSuffix: "processing",
      activeSuffix: "active",
      conflictsNeedAttention: "Conflicts need attention",
      warningsSuffix: "warning(s)",
      noConflictsShort: "No conflicts",
      settingsDepartments: "Departments",
      settingsCategories: "Categories",
      settingsServices: "Services",
      settingsResources: "Resources",
      archivedNote: "Archived items stay hidden from new bookings but never affect existing appointments.",
      newDepartmentName: "New department name",
      categoryNamePlaceholder: "Category name",
      serviceNamePlaceholder: "Service name",
      resourceNamePlaceholder: "Resource name",
      addServiceBtn: "Add Service",
      minShort: "Min",
      active: "Active",
      archived: "Archived",
      processingTag: "processing",
      resChair: "Chair",
      resWashStation: "Wash Station",
      resTreatmentRoom: "Treatment Room",
      resColorStation: "Color Station",
      resOther: "Other",
      conflictAddService: "Add at least one service.",
      conflictBeforeHours: "Start {time} is before working hours.",
      conflictAfterHours: "Appointment ends at {time}, beyond working hours.",
      conflictNoEmployee: "{service} · {stage} has no employee assigned.",
      conflictStaffBusy: "{name} is not available for {service} · {stage} at {time}.",
      conflictNoResource: "{service} · {stage} has no {resource} assigned.",
      conflictResourceDouble: "Resource is used by two stages at the same time around {time}.",
    },
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
    statsTotal: "total",
    statsActive: "active",
    statsNew: "new this month",
    durationMinSuffix: "m",
    currencySymbol: "ILS",
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
    unitsInStock: "Units In Stock",
    minStock: "Min. Stock",
    costUsd: "Cost (USD)",
    sellPriceUsd: "Sell Price (USD)",
    marginPct: "Margin (%)",
    unsaved: "Unsaved",
    scanBarcodeFor: "Scan barcode for",
    enterOrScanBarcode: "Enter or scan barcode",
    scanBarcodeBtn: "Scan barcode",
    saveBarcodeBtn: "Save barcode",
    visAll: "All",
    visDisplayed: "Displayed",
    visHidden: "Hidden",
    hideProduct: "Hide product",
    showProduct: "Show product",
    displayed: "Displayed",
    hidden: "Hidden",
    noProductsFilter: "No products match the current filter",
    levelLabel: "Level",
    otherLevel: "Other",
    productLine: "Product Line",
    shadesCount: "shades",
    avgPriceFull: "Avg price",
    unitsFull: "Units",
    barcodeFailed: "Barcode update failed",
    visibilityFailed: "Visibility update failed",
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
    statTotal: "Total",
    statDone: "Done",
    statLive: "Live",
    statUpcoming: "Upcoming",
    activeSuffix: "active",
    utilizationSuffix: "utilization",
  },
  ai: {
    insightsTitle: "Spectra AI insights",
    severityHigh: "High",
    severityMedium: "Medium",
    severityLow: "Heads up",
    typeInventory: "Inventory",
    typePerformance: "Performance",
    typeRevenue: "Revenue",
    typeMix: "Spectra mix",
    paginationLabel: "Insight pagination",
    paginationCardLabel: "Show insight",
    aliceTitle: "Alice",
    aliceGreeting: "Hi — need help with today's schedule, inventory, or revenue?",
    alicePlaceholder: "Ask Alice…",
    aliceVoiceComingSoon: "Voice (coming soon)",
    aliceSend: "Send to Alice",
    aliceDismiss: "Dismiss",
    aliceThinking: "Alice is thinking",
    aliceAssistantLabel: "Alice assistant",
    aliceSuggestOptimize: "Optimize schedule",
    aliceSuggestLowStock: "Show low stock",
    aliceSuggestTopStylist: "Top stylist today",
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
    home: "בית",
    schedule: "יומן",
    settings: "הגדרות",
    newCalendarDesign: "עיצוב חדש יומן",
    customers: "לקוחות",
    inventory: "מלאי",
    staff: "צוות",
    analytics: "ניתוח",
  },
  home: {
    headerTitle: "מרכז השליטה של המספרה",
    headerSubtitle: "ערך המנוי בזמן אמת, קצב היום והפעולות הבאות שכדאי לעשות.",
    marketplace: "מרקטפלייס וחינוך",
    marketplaceSubtitle: "מותגים, קורסים, מוצרים וקמפיינים",
    tokenBarrelEyebrow: "מנוע המנוי",
    tokenBarrelTitle: "חבית הטוקנים בפעולה",
    tokenBarrelSubtitle: "כל לקוח, מיקס ותור משתמשים בטוקנים שכלולים במנוי המספרה.",
    tokenBarrelUsed: "בשימוש היום",
    tokenBarrelRemaining: "עוד בחבית",
    tokenBarrelActiveClients: "לקוחות פעילים",
    tokenBarrelAppointments: "תורים",
    tokenBarrelScaleConnected: "משקל מחובר",
    tokenBarrelScaleManual: "מצב ידני",
    upNext: "התורים הקרובים",
    liveClients: "לקוחות פעילים",
    seeAll: "הצג הכל",
    addNewClient: "הוסף לקוח/ה",
    addNewClientHint: "התחל ביקור חדש",
    newService: "שירות חדש",
    options: "אפשרויות",
    fullHead: "ראש מלא",
    serviceToner: "טונר",
    serviceColor: "צבע",
    serviceStraightener: "החלקה",
    serviceHighlights: "גוונים",
    serviceTreatment: "טיפול",
    statusActive: "פעיל",
    statusMixInProgress: "מיקס בתהליך",
    statusDone: "הושלם",
    statusReweighPending: "ממתין לשקילה חוזרת",
    bluetoothConnected: "המשקל מחובר",
    bluetoothDisconnected: "המשקל לא מחובר",
    bluetoothDisconnectedDetail: "מצב ידני זמין",
    notifications: "התראות",
    favorites: "מועדפים",
    emptyTitle: "אין לקוחות פעילים עדיין",
    emptySubtitle: "הוסף/י את הלקוח/ה הראשון/ה כדי להתחיל את היום",
    today: "היום",
    daySun: "א׳",
    dayMon: "ב׳",
    dayTue: "ג׳",
    dayWed: "ד׳",
    dayThu: "ה׳",
    dayFri: "ו׳",
    daySat: "שב׳",
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
    todayBtn: "היום",
    aiCouldNotUnderstand: "לא הצלחתי להבין את הבקשה.",
    aiCreated: "נוצר תור עבור",
    aiNotFound: "התור לא נמצא.",
    aiMoved: "התור הועבר ל-",
    aiCancelled: "התור בוטל עבור",
    aiStaffNotFound: "איש הצוות לא נמצא.",
    aiAssigned: "שויך ל-",
    aiUpdatedNotes: "ההערות עודכנו עבור",
    aiUnsupportedAction: "סוג פעולה לא נתמך.",
    aiUnavailable: "שירות ה-AI אינו זמין.",
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
    tabCalendar: "יומן",
    tabSettings: "הגדרות",
    wizard: {
      newEntry: "רישום חדש ביומן",
      editEntry: "עריכת תור",
      whatToCreate: "מה תרצה/י ליצור?",
      typeAppointment: "תור ללקוח/ה",
      typeAppointmentDesc: "בניית תור עם שירות מלא",
      typeBreak: "הפסקה",
      typeBreakDesc: "הפסקה אישית או צוותית",
      typeTimeBlock: "חסימת זמן",
      typeTimeBlockDesc: "חסימת זמן להכנות או ניהול",
      typeInternalTask: "משימה פנימית",
      typeInternalTaskDesc: "משימת צוות, הדרכה או פגישה",
      typeOther: "אירוע אחר",
      typeOtherDesc: "רישום מותאם אישית ביומן",
      stepType: "סוג",
      stepClient: "לקוח/ה",
      stepServices: "שירותים",
      stepWorkflow: "תהליך",
      stepSchedule: "תזמון",
      stepReview: "סיכום",
      detailsSuffix: "פרטים",
      titleNote: "כותרת / הערה",
      durationMinLabel: "משך (דקות)",
      createPrefix: "צור",
      selectClient: "בחירת לקוח/ה",
      searchByNameOrPhone: "חיפוש לפי שם או טלפון",
      startTypingName: "התחל/י להקליד שם…",
      change: "שינוי",
      addNewClient: "הוסף/י לקוח/ה חדש/ה",
      selectDepartment: "בחירת מחלקה",
      selectCategory: "בחירת קטגוריה",
      selectService: "בחירת שירות",
      backToDepartments: "מחלקות",
      backToCategories: "קטגוריות",
      categoriesCount: "קטגוריות",
      servicesCount: "שירותים",
      usingSavedTiming: "שימוש בתזמון שמור עבור",
      saveTimingsForClient: "שמור תזמונים אלו עבור לקוח/ה זה/ו",
      stageName: "שם השלב",
      minutes: "דקות",
      resource: "משאב",
      none: "ללא",
      addStage: "הוספת שלב",
      frequentlyAdded: "שירותים שמתווספים לעיתים קרובות",
      addAnotherService: "הוספת שירות נוסף",
      processingHint: "המתנה / עיבוד — הסטייליסט/ית פנוי/ה בשלב זה",
      removeService: "הסרת שירות",
      removeStage: "הסרת שלב",
      stageTypeAria: "סוג שלב",
      scheduleHeading: "תזמון",
      clientJourney: "מסע הלקוח/ה",
      processing: "המתנה",
      price: "מחיר",
      noConflicts: "אין התנגשויות. התור מתאים ליומן.",
      reviewSave: "סיכום ושמירה",
      reviewCreate: "סיכום ויצירה",
      window: "חלון זמן",
      activeTimeSuffix: "זמן פעיל",
      processingTime: "זמן המתנה",
      estimatedPrice: "מחיר משוער",
      walkIn: "לקוח מזדמן",
      optionalNotes: "הערות (לא חובה)…",
      continue: "המשך",
      saving: "שומר…",
      saveChanges: "שמירת שינויים",
      createAppointmentBtn: "יצירת תור",
      couldNotSave: "לא ניתן היה לשמור את התור.",
      appointmentSummary: "סיכום התור",
      noClientSelected: "לא נבחר/ה לקוח/ה",
      noServicesYet: "טרם נוספו שירותים",
      linked: "מקושר",
      processingSuffix: "המתנה",
      activeSuffix: "פעיל",
      conflictsNeedAttention: "יש התנגשויות הדורשות טיפול",
      warningsSuffix: "אזהרות",
      noConflictsShort: "אין התנגשויות",
      settingsDepartments: "מחלקות",
      settingsCategories: "קטגוריות",
      settingsServices: "שירותים",
      settingsResources: "משאבים",
      archivedNote: "פריטים בארכיון מוסתרים מתורים חדשים אך אינם משפיעים על תורים קיימים.",
      newDepartmentName: "שם מחלקה חדשה",
      categoryNamePlaceholder: "שם קטגוריה",
      serviceNamePlaceholder: "שם שירות",
      resourceNamePlaceholder: "שם משאב",
      addServiceBtn: "הוספת שירות",
      minShort: "דק׳",
      active: "פעיל",
      archived: "בארכיון",
      processingTag: "המתנה",
      resChair: "כיסא",
      resWashStation: "עמדת שטיפה",
      resTreatmentRoom: "חדר טיפולים",
      resColorStation: "עמדת צבע",
      resOther: "אחר",
      conflictAddService: "יש להוסיף לפחות שירות אחד.",
      conflictBeforeHours: "ההתחלה ב-{time} מוקדמת משעות הפעילות.",
      conflictAfterHours: "התור מסתיים ב-{time}, מעבר לשעות הפעילות.",
      conflictNoEmployee: "{service} · {stage} ללא סטייליסט/ית משויך/ת.",
      conflictStaffBusy: "{name} אינו/ה פנוי/ה עבור {service} · {stage} בשעה {time}.",
      conflictNoResource: "{service} · {stage} ללא {resource} משויך.",
      conflictResourceDouble: "המשאב בשימוש בשני שלבים במקביל סביב השעה {time}.",
    },
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
    statsTotal: "סה״כ",
    statsActive: "פעילים",
    statsNew: "חדשים החודש",
    durationMinSuffix: "דק׳",
    currencySymbol: "₪",
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
    unitsInStock: "יחידות במלאי",
    minStock: "מינ׳ מלאי",
    costUsd: "עלות ($)",
    sellPriceUsd: "מחיר מכירה ($)",
    marginPct: "מרווח (%)",
    unsaved: "לא נשמר",
    scanBarcodeFor: "סרוק ברקוד עבור",
    enterOrScanBarcode: "הקלד או סרוק ברקוד",
    scanBarcodeBtn: "סרוק ברקוד",
    saveBarcodeBtn: "שמור ברקוד",
    visAll: "הכל",
    visDisplayed: "מוצג",
    visHidden: "מוסתר",
    hideProduct: "הסתר מוצר",
    showProduct: "הצג מוצר",
    displayed: "מוצג",
    hidden: "מוסתר",
    noProductsFilter: "לא נמצאו מוצרים לפי הסינון הנוכחי",
    levelLabel: "גוון",
    otherLevel: "אחר",
    productLine: "קולקציה",
    shadesCount: "גוונים",
    avgPriceFull: "מחיר ממוצע",
    unitsFull: "יחידות",
    barcodeFailed: "עדכון ברקוד נכשל",
    visibilityFailed: "עדכון חשיפה נכשל",
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
    statTotal: "סה״כ",
    statDone: "הושלמו",
    statLive: "בטיפול",
    statUpcoming: "צפויים",
    activeSuffix: "פעילים",
    utilizationSuffix: "ניצולת",
  },
  ai: {
    insightsTitle: "תובנות Spectra AI",
    severityHigh: "חשוב",
    severityMedium: "בינוני",
    severityLow: "לתשומת לב",
    typeInventory: "מלאי",
    typePerformance: "ביצועים",
    typeRevenue: "הכנסות",
    typeMix: "מיקס Spectra",
    paginationLabel: "ניווט בין תובנות",
    paginationCardLabel: "הצג תובנה",
    aliceTitle: "אליס",
    aliceGreeting: "היי — צריך/ה עזרה ביומן של היום, מלאי או הכנסות?",
    alicePlaceholder: "שאל/י את אליס…",
    aliceVoiceComingSoon: "קלט קולי (בקרוב)",
    aliceSend: "שליחה לאליס",
    aliceDismiss: "סגור",
    aliceThinking: "אליס חושבת",
    aliceAssistantLabel: "עוזרת AI — אליס",
    aliceSuggestOptimize: "אופטימיזציה של היומן",
    aliceSuggestLowStock: "מלאי נמוך",
    aliceSuggestTopStylist: "המצטיין/ת היום",
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
