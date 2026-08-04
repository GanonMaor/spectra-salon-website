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
    catalogSetup: string;
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
    logout: string;
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
    materials: string;
    developer: string;
    gramsSuffix: string;
    materialCost: string;
    totalMaterialGrams: string;
    totalMaterialCost: string;
    avgMaterialPerVisit: string;
    showAllMaterials: string;
    showLess: string;
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
  // ── Product catalog setup ─────────────────────────────────────────
  catalogSetup: {
    eyebrow: string;
    title: string;
    subtitle: string;
    brandsCount: string;
    selectedSeriesCount: string;
    saveChanges: string;
    savedAt: string;
    done: string;
    searchBrands: string;
    searchPlaceholder: string;
    fallbackHint: string;
    unsavedChanges: string;
    loadingBrands: string;
    noBrandsFound: string;
    enabled: string;
    disabled: string;
    wholeBrand: string;
    series: string;
    products: string;
    selectedSeries: string;
    inventoryItems: string;
    inventoryWarning: string;
    enableBrand: string;
    loadingProductLines: string;
    noProductLines: string;
    savedSuccess: string;
    loadFailed: string;
    loadLinesFailed: string;
    saveFailed: string;
    refreshAria: string;
    expandBrandAria: string;
    collapseBrandAria: string;
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
    tabSales: string;
    tabExpenses: string;
    presetToday: string;
    presetWeek: string;
    presetMonth: string;
    presetYear: string;
    presetAll: string;
    presetCustom: string;
    dateFrom: string;
    dateTo: string;
    emptyPeriodHint: string;
    showAllHistory: string;
    categories: Record<"Color" | "Highlights" | "Toner" | "Straightening" | "Treatment" | "Others", string>;
    stock: Record<"high" | "medium" | "low" | "critical", string>;
    report: Record<string, string>;
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
    catalogSetup: "Brands & Lines",
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
    logout: "Log out",
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
    materials: "Materials",
    developer: "Developer",
    gramsSuffix: "g",
    materialCost: "Material cost",
    totalMaterialGrams: "Total grams",
    totalMaterialCost: "Material cost",
    avgMaterialPerVisit: "Avg / visit",
    showAllMaterials: "Show all materials",
    showLess: "Show less",
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
  catalogSetup: {
    eyebrow: "Product Catalog Setup",
    title: "Brands & Product Lines",
    subtitle: "This controls which products appear in inventory, weighing, and default product search. Product lists stay server-side and are not loaded here.",
    brandsCount: "{n} brands",
    selectedSeriesCount: "{n} selected series",
    saveChanges: "Save changes",
    savedAt: "Saved {time}",
    done: "Done",
    searchBrands: "Search brands",
    searchPlaceholder: "L'Oréal, Wella, Schwarzkopf...",
    fallbackHint: "If a brand is enabled with no selected series, the whole brand is active. Once you select series, search narrows to those series only.",
    unsavedChanges: "You have unsaved changes.",
    loadingBrands: "Loading brands",
    noBrandsFound: "No brands found.",
    enabled: "Enabled",
    disabled: "Disabled",
    wholeBrand: "whole brand",
    series: "series",
    products: "products",
    selectedSeries: "selected series",
    inventoryItems: "inventory items",
    inventoryWarning: "This brand has inventory items. Disabling it will hide it from default search, but will not delete inventory or history.",
    enableBrand: "Enable brand",
    loadingProductLines: "Loading product lines",
    noProductLines: "No product lines found for this brand.",
    savedSuccess: "Brands & Product Lines saved",
    loadFailed: "Failed to load catalog setup",
    loadLinesFailed: "Failed to load product lines",
    saveFailed: "Failed to save catalog setup",
    refreshAria: "Refresh catalog setup",
    expandBrandAria: "Expand brand",
    collapseBrandAria: "Collapse brand",
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
    tabSales: "Sales",
    tabExpenses: "Expenses",
    presetToday: "Today",
    presetWeek: "Week",
    presetMonth: "Month",
    presetYear: "Year",
    presetAll: "All",
    presetCustom: "Custom",
    dateFrom: "From",
    dateTo: "To",
    emptyPeriodHint: "No visits in this period. Historical visits are available under All.",
    showAllHistory: "Show all history",
    categories: {
      Color: "Color",
      Highlights: "Highlights",
      Toner: "Toner",
      Straightening: "Straightening",
      Treatment: "Treatment",
      Others: "Others",
    },
    stock: { high: "In Stock", medium: "Medium", low: "Low", critical: "Critical" },
    report: {
      liveAppointments: "Live appointments",
      servicesAndDays: "services • days",
      reweighAdoption: "Re-weigh adoption",
      savings: "savings",
      mixes: "mixes",
      inventoryHealth: "Inventory health",
      itemsBelowMinStock: "items below minimum stock",
      topPerformer: "Top performer",
      utilization: "utilization",
      appointmentsShort: "appointments",
      noCompletedAppointments: "No completed appointments yet",
      estimated: "Estimated",
      last12Months: "Last 12 months",
      months: "months",
      vsLastMonth: "vs last month",
      revenuePerVisit: "Revenue / Visit",
      materialCostPerVisit: "Material Cost / Visit",
      grossProfitPerVisit: "Gross Profit / Visit",
      ofRevenue: "of revenue",
      bookedServiceValue: "Booked Service Value",
      estimatedFromCompleted: "estimated from completed appointments",
      perVisit: "per visit",
      estimatedMaterialCost: "Est. Material Cost",
      ofBookedValue: "of booked value",
      fromServiceDefaults: "from service defaults",
      operatingOverhead: "Operating Overhead",
      unavailableExpenses: "not available • requires the Expenses module",
      netProfit: "Net Profit",
      unavailableCheckoutExpenses: "not available • requires checkout and expenses",
      revenueByCategory: "Revenue by Category",
      services: "services",
      perService: "per service",
      activeClientBase: "Active Client Base",
      bookedOrRetainedClients: "booked or retained clients",
      newClientAcquisition: "New Client Acquisition",
      firstTimeClients: "first-time clients in period",
      serviceVolume: "Service Volume",
      appointments: "Appointments",
      topRevenueService: "Top Revenue Service",
      revenue: "Revenue",
      topProfitService: "Top Profit Service",
      grossProfit: "gross profit",
      extraChargeRevenue: "Extra Charge Revenue",
      workingDays: "working days",
      additionalRevenue: "Additional revenue when client usage exceeds the standard amount",
      mixOptimizationSavings: "Mix Optimization Savings",
      savingsBreakdown: "Savings Breakdown",
      reweigh: "Re-weigh",
      roundDownMixes: "Round-down Mixes",
      reweighDetail: "Re-weigh Detail",
      mixesReweighed: "mixes re-weighed",
      ofTotalMixes: "of total mixes",
      revenueAndAppointments: "Revenue & Appointments",
      topPerformers: "Top Performers",
      topServices: "Top Services",
      averageShort: "avg",
      mostUsedProducts: "Highest Material Cost",
      noServicesTitle: "No services defined yet",
      noServicesDescription: "Add services to see performance by service and category. Revenue and material cost are estimates until checkout is connected.",
      totalServices: "Total Services",
      serviceTypes: "service types",
      bookedRevenueEstimated: "Booked Revenue (est.)",
      averagePrice: "average price",
      avgMaterialCost: "Avg Material Cost",
      estimatedMargin: "estimated margin",
      topCategory: "Top Category",
      ofAllServices: "of all services",
      serviceCategories: "Service Categories",
      performanceOverview: "performance overview",
      types: "types",
      material: "material",
      ofTotal: "of total",
      serviceMix: "Service Mix",
      leads: "leads",
      top: "Top",
      monthlyServiceVolume: "Monthly Service Volume",
      stackedByCategory: "stacked by category",
      allServices: "All Services",
      serviceBreakdown: "Detailed breakdown of each service type",
      service: "Service",
      category: "Category",
      performed: "Performed",
      averagePriceShort: "Avg Price",
      duration: "Duration",
      trend: "Trend",
      noStaffTitle: "No staff yet",
      noStaffDescription: "Add team members and book appointments to see live staff performance. Revenue is estimated until checkout is connected.",
      totalAppointments: "Total Appointments",
      avgUtilization: "Avg Utilization",
      avgRating: "Avg Rating",
      staffPerformance: "Staff Performance",
      staffPerformanceDescription: "Revenue, appointments, utilization and rating by employee",
      rank: "Rank",
      employee: "Employee",
      role: "Role",
      rating: "Rating",
      appointmentsByStaff: "Appointments by Staff",
      comparativeVolume: "comparative volume",
      monthlyAppointments: "Monthly Appointments",
      noProductsTitle: "No product data yet",
      noProductsDescription: "Enable brands and product lines, then record usage during appointments to see live consumption and cost.",
      totalUsage: "Total Usage",
      products: "products",
      totalProductCost: "Total Product Cost",
      directMaterialRecorded: "Direct material recorded",
      categories: "Categories",
      activeCategories: "Active categories",
      lowStockAlerts: "Low Stock Alerts",
      needsAttention: "Needs attention",
      usageByCategory: "Usage by Category",
      consumptionBreakdown: "consumption breakdown",
      costByCategory: "Cost by Category",
      cost: "Cost",
      costPerGram: "₪/g",
      monthlyUsageTrend: "Monthly Usage Trend",
      totalConsumption: "total consumption",
      usage: "Usage",
      productInventory: "Product Inventory",
      productInventoryDescription: "Ranked by material cost — grams alone can mislead (developer is cheap per gram, color is not)",
      product: "Product",
      brand: "Brand",
      stock: "Stock",
      salesUnavailableTitle: "Retail sales aren't tracked yet",
      salesUnavailableDescription: "Product and retail sales will appear once Checkout is connected.",
      expensesUnavailableTitle: "Expenses aren't tracked yet",
      expensesUnavailableDescription: "Rent, payroll, utilities and other operating costs will appear once the Expenses module is added.",
    },
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
    catalogSetup: "מותגים וסדרות",
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
    logout: "התנתקות",
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
    materials: "חומרים",
    developer: "מחמצן",
    gramsSuffix: "גרם",
    materialCost: "עלות חומרים",
    totalMaterialGrams: "סה״כ גרם",
    totalMaterialCost: "עלות חומרים",
    avgMaterialPerVisit: "ממוצע לביקור",
    showAllMaterials: "הצג את כל החומרים",
    showLess: "הצג פחות",
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
  catalogSetup: {
    eyebrow: "הגדרת קטלוג מוצרים",
    title: "מותגים וסדרות",
    subtitle: "הבחירה הזו קובעת אילו מוצרים יופיעו במלאי, בשקילה ובחיפוש המוצרים הרגיל. רשימות המוצרים נשארות בצד השרת ולא נטענות כאן.",
    brandsCount: "{n} מותגים",
    selectedSeriesCount: "{n} סדרות נבחרות",
    saveChanges: "שמור שינויים",
    savedAt: "נשמר {time}",
    done: "סיום",
    searchBrands: "חיפוש מותגים",
    searchPlaceholder: "לוריאל, וולה, שוורצקופף...",
    fallbackHint: "אם מותג פעיל ואין סדרות שנבחרו תחתיו, כל המותג יהיה פעיל. ברגע שבוחרים סדרות, החיפוש יצטמצם רק לסדרות האלה.",
    unsavedChanges: "יש שינויים שלא נשמרו.",
    loadingBrands: "טוען מותגים",
    noBrandsFound: "לא נמצאו מותגים.",
    enabled: "פעיל",
    disabled: "כבוי",
    wholeBrand: "כל המותג",
    series: "סדרות",
    products: "מוצרים",
    selectedSeries: "סדרות נבחרות",
    inventoryItems: "פריטי מלאי",
    inventoryWarning: "למותג הזה יש פריטי מלאי. כיבוי שלו יסתיר אותו מחיפוש ברירת המחדל, אבל לא ימחק מלאי או היסטוריה.",
    enableBrand: "הפעל מותג",
    loadingProductLines: "טוען סדרות",
    noProductLines: "לא נמצאו סדרות למותג הזה.",
    savedSuccess: "מותגים וסדרות נשמרו",
    loadFailed: "טעינת הגדרת הקטלוג נכשלה",
    loadLinesFailed: "טעינת הסדרות נכשלה",
    saveFailed: "שמירת הגדרת הקטלוג נכשלה",
    refreshAria: "רענון הגדרת קטלוג",
    expandBrandAria: "פתח מותג",
    collapseBrandAria: "סגור מותג",
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
    tabSales: "מכירות",
    tabExpenses: "הוצאות",
    presetToday: "היום",
    presetWeek: "שבוע",
    presetMonth: "חודש",
    presetYear: "שנה",
    presetAll: "הכל",
    presetCustom: "מותאם",
    dateFrom: "מתאריך",
    dateTo: "עד תאריך",
    emptyPeriodHint: "אין ביקורים בתקופה הזו. היסטוריית הביקורים זמינה תחת הכל.",
    showAllHistory: "הצג את כל ההיסטוריה",
    categories: {
      Color: "צבע",
      Highlights: "גוונים",
      Toner: "טונר",
      Straightening: "החלקה",
      Treatment: "טיפול",
      Others: "אחר",
    },
    stock: { high: "במלאי", medium: "מלאי בינוני", low: "מלאי נמוך", critical: "קריטי" },
    report: {
      liveAppointments: "תורים פעילים",
      servicesAndDays: "שירותים • ימים",
      reweighAdoption: "אימוץ שקילה חוזרת",
      savings: "חיסכון",
      mixes: "תערובות",
      inventoryHealth: "בריאות המלאי",
      itemsBelowMinStock: "פריטים מתחת למלאי המינימום",
      topPerformer: "מצטיין התקופה",
      utilization: "ניצולת",
      appointmentsShort: "תורים",
      noCompletedAppointments: "עדיין אין תורים שהושלמו",
      estimated: "הערכה",
      last12Months: "12 החודשים האחרונים",
      months: "חודשים",
      vsLastMonth: "לעומת החודש הקודם",
      revenuePerVisit: "הכנסה לביקור",
      materialCostPerVisit: "עלות חומרים לביקור",
      grossProfitPerVisit: "רווח גולמי לביקור",
      ofRevenue: "מההכנסה",
      bookedServiceValue: "שווי שירותים שהוזמנו",
      estimatedFromCompleted: "הערכה מתורים שהושלמו",
      perVisit: "לביקור",
      estimatedMaterialCost: "עלות חומרים משוערת",
      ofBookedValue: "מהשווי שהוזמן",
      fromServiceDefaults: "לפי ברירות המחדל של השירותים",
      operatingOverhead: "הוצאות תפעול",
      unavailableExpenses: "לא זמין • נדרש מודול הוצאות",
      netProfit: "רווח נקי",
      unavailableCheckoutExpenses: "לא זמין • נדרשים קופה והוצאות",
      revenueByCategory: "הכנסה לפי קטגוריה",
      services: "שירותים",
      perService: "לשירות",
      activeClientBase: "מאגר לקוחות פעיל",
      bookedOrRetainedClients: "לקוחות שהזמינו או חזרו",
      newClientAcquisition: "לקוחות חדשים",
      firstTimeClients: "לקוחות בביקור ראשון בתקופה",
      serviceVolume: "היקף שירותים",
      appointments: "תורים",
      topRevenueService: "השירות המכניס ביותר",
      revenue: "הכנסה",
      topProfitService: "השירות הרווחי ביותר",
      grossProfit: "רווח גולמי",
      extraChargeRevenue: "הכנסה מחיובים נוספים",
      workingDays: "ימי עבודה",
      additionalRevenue: "הכנסה נוספת כאשר צריכת הלקוח חורגת מהכמות התקנית",
      mixOptimizationSavings: "חיסכון מאופטימיזציית תערובות",
      savingsBreakdown: "פירוט החיסכון",
      reweigh: "שקילה חוזרת",
      roundDownMixes: "עיגול תערובות מטה",
      reweighDetail: "פירוט שקילה חוזרת",
      mixesReweighed: "תערובות שנשקלו מחדש",
      ofTotalMixes: "מכלל התערובות",
      revenueAndAppointments: "הכנסות ותורים",
      topPerformers: "מצטייני הצוות",
      topServices: "השירותים המובילים",
      averageShort: "ממוצע",
      mostUsedProducts: "המוצרים היקרים ביותר בצריכה",
      noServicesTitle: "עדיין לא הוגדרו שירותים",
      noServicesDescription: "הוסיפו שירותים כדי לראות ביצועים לפי שירות וקטגוריה. ההכנסות ועלויות החומרים הן הערכה עד לחיבור הקופה.",
      totalServices: "סך השירותים",
      serviceTypes: "סוגי שירות",
      bookedRevenueEstimated: "הכנסה מהזמנות (הערכה)",
      averagePrice: "מחיר ממוצע",
      avgMaterialCost: "עלות חומרים ממוצעת",
      estimatedMargin: "שיעור רווח משוער",
      topCategory: "קטגוריה מובילה",
      ofAllServices: "מכלל השירותים",
      serviceCategories: "קטגוריות שירות",
      performanceOverview: "סקירת ביצועים",
      types: "סוגים",
      material: "חומרים",
      ofTotal: "מהסך הכול",
      serviceMix: "תמהיל שירותים",
      leads: "מובילה",
      top: "מוביל",
      monthlyServiceVolume: "היקף שירותים חודשי",
      stackedByCategory: "מפולח לפי קטגוריה",
      allServices: "כל השירותים",
      serviceBreakdown: "פירוט מלא של כל סוג שירות",
      service: "שירות",
      category: "קטגוריה",
      performed: "בוצעו",
      averagePriceShort: "מחיר ממוצע",
      duration: "משך",
      trend: "מגמה",
      noStaffTitle: "עדיין אין אנשי צוות",
      noStaffDescription: "הוסיפו אנשי צוות וקבעו תורים כדי לראות ביצועים חיים. ההכנסה היא הערכה עד לחיבור הקופה.",
      totalAppointments: "סך התורים",
      avgUtilization: "ניצולת ממוצעת",
      avgRating: "דירוג ממוצע",
      staffPerformance: "ביצועי צוות",
      staffPerformanceDescription: "הכנסות, תורים, ניצולת ודירוג לפי עובד",
      rank: "דירוג",
      employee: "עובד",
      role: "תפקיד",
      rating: "דירוג",
      appointmentsByStaff: "תורים לפי עובד",
      comparativeVolume: "השוואת היקפים",
      monthlyAppointments: "תורים חודשיים",
      noProductsTitle: "עדיין אין נתוני מוצרים",
      noProductsDescription: "הפעילו מותגים וקווי מוצרים ותעדו שימוש במהלך תורים כדי לראות צריכה ועלות בזמן אמת.",
      totalUsage: "צריכה כוללת",
      products: "מוצרים",
      totalProductCost: "עלות מוצרים כוללת",
      directMaterialRecorded: "עלות חומרים מתועדת",
      categories: "קטגוריות",
      activeCategories: "קטגוריות פעילות",
      lowStockAlerts: "התראות מלאי נמוך",
      needsAttention: "דורש טיפול",
      usageByCategory: "צריכה לפי קטגוריה",
      consumptionBreakdown: "פילוח צריכה",
      costByCategory: "עלות לפי קטגוריה",
      cost: "עלות",
      costPerGram: "₪/ג׳",
      monthlyUsageTrend: "מגמת צריכה חודשית",
      totalConsumption: "צריכה כוללת",
      usage: "צריכה",
      productInventory: "מלאי מוצרים",
      productInventoryDescription: "ממוין לפי עלות חומרים — כמות בגרמים לבד מטעה (חמצן זול לגרם, צבע יקר)",
      product: "מוצר",
      brand: "מותג",
      stock: "מלאי",
      salesUnavailableTitle: "מכירות מוצרים עדיין אינן במעקב",
      salesUnavailableDescription: "מכירות מוצרים וקמעונאות יוצגו לאחר חיבור הקופה.",
      expensesUnavailableTitle: "הוצאות עדיין אינן במעקב",
      expensesUnavailableDescription: "שכירות, שכר, חשבונות והוצאות תפעול נוספות יוצגו לאחר הוספת מודול ההוצאות.",
    },
  },
};

export const crmTranslations: Record<CrmLang, CrmTranslations> = { en, he };
