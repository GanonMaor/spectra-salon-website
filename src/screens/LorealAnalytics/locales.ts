export type Locale = "he" | "en";

export interface AnalyticsCopy {
  // direction
  dir: "rtl" | "ltr";

  // Access gate
  gateInstruction: string;
  gateError: string;
  gateButton: string;

  // Header date filter
  headerFrom: string;
  headerTo: string;
  headerServiceTypes: string;
  headerShowAll: string;

  // Footer data-updated note
  footerDataUpdated: (from: string, to: string) => string;

  // KPI cards
  kpiActiveSalons: string;
  kpiOnPlatform: string;
  kpiTotalVisits: string;
  kpiTotalServices: string;
  kpiAvgServicesPerMonth: string;
  kpiMonths: (n: number) => string;
  kpiActiveBrands: string;
  kpiCities: (n: number) => string;
  kpiRawMaterial: string;
  kpiGrams: (n: string) => string;

  // Global customer filter
  filterTitle: string;
  filterSelected: (n: number) => string;
  filterContinuityBadge: (pct: number) => string;
  filterAllCustomers: string;
  filterClearAll: string;
  filterSearchPlaceholder: string;
  filterSortServices: string;
  filterSortContinuity: string;
  filterSortMonthsActive: string;
  filterSortAvgServices: string;
  filterSortGrams: string;
  filterMinContinuity: string;
  filterCustom: string;
  filterClear: string;
  filterCount: (shown: number, total: number) => string;
  filterColCity: string;
  filterColContinuity: string;
  filterColData: string;
  filterMonths: (active: number, total: number) => string;
  filterServices: (n: string) => string;
  filterAvgPerMonth: (n: number | string) => string;
  filterSince: (month: string) => string;
  filterActiveNote: (n: number) => string;
  filterEmptyNote: string;

  // Tabs
  tabOverview: string;
  tabBrands: string;
  tabCities: string;
  tabUsers: string;
  tabCompare: string;
  tabCohorts: string;
  tabPopulations: string;
  tabCells: string;
  tabCellComparison: string;

  // Service labels
  svcColor: string;
  svcHighlights: string;
  svcToner: string;
  svcStraightening: string;
  svcOthers: string;

  // Data display helpers
  unknownCityDisplay: string;
  unknownSalonTypeDisplay: string;
  othersBrandLabel: string;
  duplicateSuffix: string;

  // Overview tab
  ovServiceBreakTitle: string;
  ovServiceBreakSub: string;
  ovRawMatTitle: string;
  ovRawMatSub: string;
  ovMatGramsLegend: string;
  ovMonthlyTrendsTitle: string;
  ovMonthlyTrendsSub: string;
  ovServicesLegend: string;
  ovVisitsLegend: string;
  ovMatTrendTitle: string;
  ovMatTrendSub: string;
  ovMatGramsBarLegend: string;
  ovMonthlyPctTitle: string;
  ovMonthlyPctSub: string;
  ovColMonth: string;
  ovColGrams: string;
  ovColPctChange: string;
  ovColServices: string;
  ovJanCompTitle: string;
  ovJanCompSub: string;
  ovJanGramsLabel: string;
  ovJanServicesLabel: string;
  ovServiceTrendsTitle: string;
  ovServiceTrendsSub: string;
  ovSalonTypeTitle: string;
  ovSalonTypeSub: string;
  ovSalonTypePrefix: (type: string) => string;
  ovSalonCountLabel: string;
  ovServicesColon: (n: string) => string;
  ovActiveSBTitle: string;
  ovActiveSBSub: string;
  ovActiveSalonsLegend: string;
  ovActiveBrandsLegend: string;

  // Brands tab
  brMarketShareTitle: string;
  brMarketShareSub: string;
  brDetailedTitle: string;
  brDetailedSub: string;
  brColBrand: string;
  brColServices: string;
  brColVisits: string;
  brColMaterial: string;
  brColSalons: string;
  brColMarketShare: string;
  brCsvHeaders: string[];
  brTrendsTitle: string;
  brTrendsSub: string;
  brMaterialTitle: string;
  brMaterialSub: string;
  brGramsLegend: string;

  // Cities tab
  ciMarketTitle: string;
  ciMarketSub: string;
  ciByServiceTitle: string;
  ciByServiceSub: string;
  ciServicesLegend: string;
  ciUnknownTitle: string;
  ciUnknownSub: string;
  ciColServices: string;
  ciColVisits: string;
  ciColMaterial: string;
  ciColLastMonth: string;
  ciAllTitle: string;
  ciAllSub: string;
  ciColCity: string;
  ciColSalons: string;
  ciColShare: string;

  // Users tab
  usersTotal: string;
  usersSearchPlaceholder: string;
  usersAllCities: string;
  usersTableTitle: string;
  usersTableSub: string;
  usersColId: string;
  usersColCity: string;
  usersColType: string;
  usersColEmployees: string;
  usersColServices: string;
  usersColVisits: string;
  usersColMaterial: string;
  usersColBrands: string;
  usersColMonths: string;
  usersColContinuity: string;
  usersColColor: string;
  usersColHighlights: string;
  usersColToner: string;
  usersColStraightening: string;
  usersCsvHeaders: string[];
  usersShowingLimit: (n: string) => string;
  usersBrandsTitle: string;
  usersBrandsSub: string;
  usersServiceGrams: (svc: string, gr: string) => string;

  // Compare tab
  cmpTitle: string;
  cmpSub: string;
  cmpMonthALabel: string;
  cmpMonthBLabel: string;
  cmpSelectMonth: string;
  cmpFilterNote: (n: number) => string;
  cmpServiceChartTitle: string;
  cmpVs: (a: string, b: string) => string;
  cmpUserTitle: string;
  cmpUserSub: (a: string, b: string) => string;
  cmpColId: string;
  cmpColCity: string;
  cmpColServices: string;
  cmpColVisits: string;
  cmpColMaterial: string;
  cmpColChange: string;
  cmpTotal: string;
  cmpShowingLimit: (n: string) => string;
  cmpSelectTwo: string;
  cmpSvcColor: string;
  cmpSvcHighlights: string;
  cmpSvcToner: string;
  cmpSvcStraightening: string;
  cmpKpiServices: string;
  cmpKpiVisits: string;
  cmpKpiMaterial: string;

  // Cohorts tab
  cohConnectionErrorTitle: string;
  cohConnectionErrorMsg: (err: string) => string;
  cohRetry: string;
  cohStep1Title: string;
  cohStep1Sub: string;
  cohSalonsCount: (n: number) => string;
  cohClearAll: string;
  cohSearchPlaceholder: string;
  cohServicesSinceLabel: (svc: string, months: number) => string;
  cohInGroup: string;
  cohAddUser: string;
  cohNoResults: string;
  cohLoadSaved: string;
  cohSaveSelection: string;
  cohNamePlaceholder: string;
  cohSaveBtn: string;
  cohStep2Title: string;
  cohStep2Sub: string;
  cohMonthsCount: (n: number) => string;
  cohStarting: string;
  cohEnding: string;
  cohSaveToGroup: string;
  cohStep3Title: string;
  cohStep3Sub: (salons: number, label: string) => string;
  cohClearFilters: string;
  cohFilterByCompany: string;
  cohFilterBySeries: string;
  cohActiveFilter: string;
  cohCompaniesCount: (n: number) => string;
  cohSeriesCount: (n: number) => string;
  cohKpiServicesInPeriod: string;
  cohKpiVisitsInPeriod: string;
  cohKpiRawMaterial: string;
  cohKpiGrams: (n: string) => string;
  cohKpiNewCompetitors: string;
  cohKpiNewBrandsEntered: string;
  cohKpiSalons: (n: number) => string;
  cohBrandsTitle: string;
  cohBrandsSub: (brands: number, salons: number, label: string) => string;
  cohColBrand: string;
  cohColServices: string;
  cohColRevenue: string;
  cohColGrams: string;
  cohColVisits: string;
  cohColSalons: string;
  cohColShare: string;
  cohCsvBrandHeaders: string[];
  cohJanCompTitle: string;
  cohJanCompSub: string;
  cohJanGrams: string;
  cohJanServices: string;
  cohMomTitle: string;
  cohMomSub: string;
  cohCsvMomHeaders: string[];
  cohUserYoyTitle: string;
  cohUserYoySub: (label: string) => string;
  cohColPctChange: string;
  cohUserYoyTotal: string;
  cohSvcByTypeTitle: string;
  cohSvcByTypeSub: (salons: number, label: string) => string;
  cohCsvTrendHeaders: string[];
  cohVisitsMaterialTitle: string;
  cohVisitsMaterialSub: string;
  cohVisitsLegend: string;
  cohMaterialLegend: string;
  cohCompetitorsTitle: string;
  cohCompetitorsSub: string;
  cohNewCount: (n: number) => string;
  cohNoChange: string;
  cohSvcCount: (n: string) => string;
  cohDrillTitle: (userId: string) => string;
  cohDrillSub: (city: string) => string;
  cohPauseLabel: (m: string) => string;
  cohSlowdownLabel: (m: string) => string;
  cohDrillColMonth: string;
  cohDrillColServices: string;
  cohDrillColVisits: string;
  cohDrillColMaterial: string;
  cohDrillColColor: string;
  cohDrillColHighlights: string;
  cohDrillColToner: string;
  cohDrillColStatus: string;
  cohStatusPause: string;
  cohStatusSlowdown: string;
  cohStatusActive: string;
  cohClickToView: string;

  // Populations tab
  popTitle: string;
  popSub: string;
  popNewBtn: string;
  popFormTitle: string;
  popNameLabel: string;
  popNamePlaceholder: string;
  popDescLabel: string;
  popDescPlaceholder: string;
  popWindowLabel: string;
  popWindowNote: string;
  popUntilLabel: string;
  popSaveBtn: string;
  popSaving: string;
  popCancelBtn: string;
  popEmptyTitle: string;
  popEmptySub: string;
  popMembersCount: (n: string) => string;
  popMemberSearch: string;
  popNoResults: string;
  popAddBtn: string;
  popNoMembers: string;
  popQualityTitle: string;
  popQualityEdit: string;
  popQualityClose: string;
  popQualitySave: string;
  popQualitySaving: string;
  popWindowSection: string;
  popPresenceWeight: string;
  popConsistencyLabel: (pct: number) => string;
  popGreenThreshold: string;
  popAmberThreshold: string;
  popMaxGoodDeviation: string;
  popMaxPartialDeviation: string;
  popQualityDistTitle: string;
  popDeleteTitle: string;
  popManageTitle: string;
  popNameRequired: string;
  popDeleteConfirm: string;

  // Cells tab
  cellTitle: string;
  cellSub: string;
  cellNewBtn: string;
  cellFormTitle: string;
  cellNameLabel: string;
  cellNamePlaceholder: string;
  cellDescLabel: string;
  cellPopLabel: string;
  cellSelectPop: string;
  cellPeriodALabel: string;
  cellPeriodBLabel: string;
  cellFromLabel: string;
  cellToLabel: string;
  cellFiltersLabel: string;
  cellFilterByCompany: string;
  cellFilterBySeries: string;
  cellFilterByService: string;
  cellCreateBtn: string;
  cellCreating: string;
  cellCancelBtn: string;
  cellDeleteConfirm: string;
  cellNameRequired: string;
  cellNoFilters: string;
  cellCompaniesFilter: (companies: string) => string;
  cellSeriesFilter: (series: string) => string;
  cellServicesFilter: (types: string) => string;
  cellPeriodAShort: string;
  cellPeriodBShort: string;
  cellMetricServices: string;
  cellMetricVisits: string;
  cellMetricGrams: string;
  cellMetricColor: string;
  cellMetricHighlights: string;
  cellMetricToner: string;
  cellMetricStraightening: string;
  cellMetricOthers: string;
  cellMetricActiveSalons: string;

  // Cells tab extra
  cellPeriodALong: string;
  cellPeriodBLong: string;
  cellActiveFilters: string;
  cellCompaniesNote: string;
  cellSeriesNote: string;
  cellServiceTypeNote: string;
  cellEmptyTitle: string;
  cellEmptySub: string;
  cellSalonsCount: (n: string) => string;
  cellMembersInAnalysis: (n: string) => string;
  cellServiceBreakTitle: string;
  cellUserBreakTitle: string;
  cellSortByPct: string;
  cellSortByServices: string;
  cellColSalon: string;
  cellColChange: string;
  cellPopMembersCount: (n: string) => string;
  cellSaving: string;

  // Cell comparison tab
  ccTitle: string;
  ccSub: string;
  ccSelectUp: string;
  ccNoSaved: string;
  ccWarnDiffPops: string;
  ccWarnDiffFilters: string;
  ccNoFilters: string;
  ccMetricServices: string;
  ccMetricVisits: string;
  ccMetricGrams: string;
  ccMetricColor: string;
  ccMetricHighlights: string;
  ccMetricToner: string;
  ccMetricStraightening: string;
  ccMetricOthers: string;
  ccMetricActiveSalons: string;
  ccMetricLabel: string;
  ccMembersRow: string;
  ccSalonsCount: (n: string) => string;
  ccSelectAtLeast: string;
}

// ── Hebrew (default) ───────────────────────────────────────────────
export const HE: AnalyticsCopy = {
  dir: "rtl",

  gateInstruction: "הזן סיסמה לגישה לדשבורד",
  gateError: "סיסמה שגויה. נסה שנית.",
  gateButton: "כניסה לדשבורד",

  headerFrom: "מ-",
  headerTo: "עד",
  headerServiceTypes: "סוגי שירות:",
  headerShowAll: "הצג הכל",

  footerDataUpdated: (from, to) => `נתונים מעודכנים • ${from} – ${to}`,

  kpiActiveSalons: "מספרות פעילות",
  kpiOnPlatform: "בפלטפורמת Spectra",
  kpiTotalVisits: "סה״כ ביקורים",
  kpiTotalServices: "סה״כ שירותים",
  kpiAvgServicesPerMonth: "ממוצע שירותים/חודש",
  kpiMonths: (n) => `${n} חודשים`,
  kpiActiveBrands: "מותגים פעילים",
  kpiCities: (n) => `${n} ערים`,
  kpiRawMaterial: "חומר גלם (גרם)",
  kpiGrams: (n) => `${n} גרם`,

  filterTitle: "סינון לקוחות",
  filterSelected: (n) => `${n} נבחרו`,
  filterContinuityBadge: (pct) => `≥ ${pct}% רציפות`,
  filterAllCustomers: "כל הלקוחות",
  filterClearAll: "נקה הכל",
  filterSearchPlaceholder: "חיפוש לקוח לפי ID או עיר...",
  filterSortServices: "מיון: שירותים",
  filterSortContinuity: "מיון: רציפות שימוש",
  filterSortMonthsActive: "מיון: חודשים פעילים",
  filterSortAvgServices: "מיון: ממוצע שירותים/חודש",
  filterSortGrams: "מיון: חומר (גרם)",
  filterMinContinuity: "רציפות מינימלית:",
  filterCustom: "מותאם",
  filterClear: "נקה",
  filterCount: (shown, total) => `${shown} / ${total} לקוחות`,
  filterColCity: "עיר",
  filterColContinuity: "רציפות",
  filterColData: "נתונים",
  filterMonths: (active, total) => `${active}/${total} חודשים`,
  filterServices: (n) => `${n} שירותים`,
  filterAvgPerMonth: (n) => `~${n}/חודש`,
  filterSince: (m) => `מ-${m}`,
  filterActiveNote: (n) => `מציג נתונים עבור ${n} לקוחות נבחרים. הנתונים בכל הטאבים מעודכנים.`,
  filterEmptyNote: "בחר לקוחות כדי לסנן את כל הדשבורד לפי הנבחרים בלבד.",

  tabOverview: "סקירה כללית",
  tabBrands: "מותגים ושוק",
  tabCities: "פילוח גאוגרפי",
  tabUsers: "נתוני משתמשים",
  tabCompare: "השוואה חודשית",
  tabCohorts: "ניתוח קבוצות",
  tabPopulations: "אוכלוסיות",
  tabCells: "תאי ניתוח",
  tabCellComparison: "תא מול תא",

  svcColor: "צבע",
  svcHighlights: "גוונים",
  svcToner: "טונר",
  svcStraightening: "החלקה",
  svcOthers: "אחר",

  unknownCityDisplay: "לא ידוע",
  unknownSalonTypeDisplay: "לא מוגדר",
  othersBrandLabel: "אחרים",
  duplicateSuffix: " (העתק)",

  ovServiceBreakTitle: "פילוח לפי קטגוריית שירות",
  ovServiceBreakSub: "התפלגות סוגי שירותים בשוק הישראלי",
  ovRawMatTitle: "חומר גלם לפי קטגוריית שירות",
  ovRawMatSub: "פילוח צריכת חומר (גרם) לפי סוג טיפול",
  ovMatGramsLegend: "חומר (גרם)",
  ovMonthlyTrendsTitle: "מגמות חודשיות",
  ovMonthlyTrendsSub: "ביקורים ושירותים לאורך זמן",
  ovServicesLegend: "שירותים",
  ovVisitsLegend: "ביקורים",
  ovMatTrendTitle: "מגמת צריכת חומר",
  ovMatTrendSub: "צריכת חומר גלם (גרם) חודשית מהשוק הישראלי",
  ovMatGramsBarLegend: "חומר (גרם)",
  ovMonthlyPctTitle: "שינוי חודשי באחוזים",
  ovMonthlyPctSub: "גרמים ושירותים — שינוי מהחודש הקודם",
  ovColMonth: "חודש",
  ovColGrams: "גרמים",
  ovColPctChange: "% שינוי",
  ovColServices: "שירותים",
  ovJanCompTitle: "השוואת ינואר מול ינואר",
  ovJanCompSub: "גרמים ושירותים — ינואר לעומת ינואר שנה קודמת (כלל השוק)",
  ovJanGramsLabel: "גרמים",
  ovJanServicesLabel: "שירותים",
  ovServiceTrendsTitle: "מגמות שירותים לפי קטגוריה",
  ovServiceTrendsSub: "התפלגות סוגי שירותים לאורך החודשים",
  ovSalonTypeTitle: "פילוח לפי סוג מספרה",
  ovSalonTypeSub: "התפלגות סוגי מספרות בישראל",
  ovSalonTypePrefix: (type) => `סוג ${type}`,
  ovSalonCountLabel: "מספרות",
  ovServicesColon: (n) => `שירותים: ${n}`,
  ovActiveSBTitle: "משתמשים ומותגים פעילים",
  ovActiveSBSub: "מספר מספרות ומותגים פעילים בכל חודש",
  ovActiveSalonsLegend: "מספרות פעילות",
  ovActiveBrandsLegend: "מותגים פעילים",

  brMarketShareTitle: "נתח שוק לפי מותג",
  brMarketShareSub: "Top 10 מותגי צבע שיער בשוק הישראלי (לפי מספר שירותים)",
  brDetailedTitle: "ביצועי מותגים מפורט",
  brDetailedSub: "כל המותגים הפעילים בשוק הישראלי",
  brColBrand: "מותג",
  brColServices: "שירותים",
  brColVisits: "ביקורים",
  brColMaterial: "חומר (ג׳)",
  brColSalons: "מספרות",
  brColMarketShare: "נתח שוק",
  brCsvHeaders: ["מותג", "שירותים", "הכנסה", "גרמים", "ביקורים", "מספרות", "נתח שוק %"],
  brTrendsTitle: "מגמת מותגים לאורך זמן",
  brTrendsSub: "Top 8 מותגים — שירותים חודשיים",
  brMaterialTitle: "צריכת חומר גלם לפי מותג",
  brMaterialSub: "Top 15 מותגים — שימוש בגרמים",
  brGramsLegend: "גרמים",

  ciMarketTitle: "פילוח שוק לפי ערים",
  ciMarketSub: "התפלגות שירותים לפי ערים מובילות",
  ciByServiceTitle: "שירותים לפי עיר",
  ciByServiceSub: "Top 10 ערים לפי כמות שירותים",
  ciServicesLegend: "שירותים",
  ciUnknownTitle: "חשבונות ללא עיר",
  ciUnknownSub: "חשבונות שמופיעים בדאטה כ-Unknown — אפשר לעדכן לפי המידע שתיתן",
  ciColServices: "שירותים",
  ciColVisits: "ביקורים",
  ciColMaterial: "חומר (ג׳)",
  ciColLastMonth: "חודש אחרון",
  ciAllTitle: "כל הערים — נתונים מפורטים",
  ciAllSub: "פילוח מלא לפי ערים בישראל",
  ciColCity: "עיר",
  ciColSalons: "מספרות",
  ciColShare: "נתח",

  usersTotal: "סה״כ משתמשים:",
  usersSearchPlaceholder: "חיפוש לפי ID או עיר...",
  usersAllCities: "כל הערים",
  usersTableTitle: "היסטוריית שימוש — נתוני משתמשים",
  usersTableSub: "לחץ על כותרת עמודה למיון",
  usersColId: "מזהה",
  usersColCity: "עיר",
  usersColType: "סוג",
  usersColEmployees: "עובדים",
  usersColServices: "שירותים",
  usersColVisits: "ביקורים",
  usersColMaterial: "חומר (ג׳)",
  usersColBrands: "מותגים",
  usersColMonths: "חודשים",
  usersColContinuity: "רציפות %",
  usersColColor: "צבע",
  usersColHighlights: "גוונים",
  usersColToner: "טונר",
  usersColStraightening: "החלקה",
  usersCsvHeaders: ["ID", "עיר", "שירותים", "ביקורים", "גרמים", "מותגים", "חודשים פעילים", "צבע", "גוונים", "טונר", "החלקה"],
  usersShowingLimit: (n) => `מציג 100 מתוך ${n} משתמשים. השתמש בפילטרים לצמצום.`,
  usersBrandsTitle: "מותגים בשימוש לפי משתמש",
  usersBrandsSub: "Top 20 משתמשים — המותגים המובילים שלהם",
  usersServiceGrams: (svc, gr) => `${svc} שירותים · ${gr} גרם`,

  cmpTitle: "השוואה חודשית",
  cmpSub: "בחר חודשים להשוואה ולקוחות ספציפיים (או השאר ריק להשוואת כל השוק)",
  cmpMonthALabel: "חודש A (בסיס)",
  cmpMonthBLabel: "חודש B (השוואה)",
  cmpSelectMonth: "בחר חודש...",
  cmpFilterNote: (n) => `ההשוואה מציגה נתונים עבור ${n} לקוחות שנבחרו בסינון הגלובלי למעלה.`,
  cmpServiceChartTitle: "השוואת קטגוריות שירות",
  cmpVs: (a, b) => `${a} מול ${b}`,
  cmpUserTitle: "השוואה לפי לקוח",
  cmpUserSub: (a, b) => `${a} מול ${b} — שירותים, ביקורים וחומר`,
  cmpColId: "מזהה",
  cmpColCity: "עיר",
  cmpColServices: "שירותים",
  cmpColVisits: "ביקורים",
  cmpColMaterial: "חומר (ג׳)",
  cmpColChange: "שינוי",
  cmpTotal: "סה״כ",
  cmpShowingLimit: (n) => `מציג 50 מתוך ${n} לקוחות.`,
  cmpSelectTwo: "בחר שני חודשים להשוואה",
  cmpSvcColor: "צבע",
  cmpSvcHighlights: "גוונים",
  cmpSvcToner: "טונר",
  cmpSvcStraightening: "החלקה",
  cmpKpiServices: "שירותים",
  cmpKpiVisits: "ביקורים",
  cmpKpiMaterial: "חומר (ג׳)",

  cohConnectionErrorTitle: "שגיאה בחיבור לשרת",
  cohConnectionErrorMsg: (err) => err,
  cohRetry: "נסה שנית",
  cohStep1Title: "בחר אוכלוסייה",
  cohStep1Sub: "בחר מספרות לדוח מתוך כלל המשתמשים",
  cohSalonsCount: (n) => `${n} מספרות`,
  cohClearAll: "נקה הכל",
  cohSearchPlaceholder: "חיפוש מספרה לפי ID או עיר...",
  cohServicesSinceLabel: (svc, months) => `${svc} שירותים · ${months} חודשים`,
  cohInGroup: "בקבוצה",
  cohAddUser: "+ הוסף",
  cohNoResults: "לא נמצאו תוצאות",
  cohLoadSaved: "טען מקבוצה שמורה",
  cohSaveSelection: "שמור בחירה נוכחית כקבוצה",
  cohNamePlaceholder: "שם לקבוצה...",
  cohSaveBtn: "שמור",
  cohStep2Title: "טווח תאריכים",
  cohStep2Sub: "הגדר את תקופת הניתוח",
  cohMonthsCount: (n) => `${n} חודשים`,
  cohStarting: "מתחיל ב",
  cohEnding: "מסתיים ב",
  cohSaveToGroup: "✎ שמור לקבוצה",
  cohStep3Title: "נתונים",
  cohStep3Sub: (salons, label) => `${salons} מספרות · ${label}`,
  cohClearFilters: "נקה פילטרים",
  cohFilterByCompany: "פלטר לפי חברה",
  cohFilterBySeries: "פלטר לפי סדרה",
  cohActiveFilter: "פילטר פעיל",
  cohCompaniesCount: (n) => ` · ${n} חברות`,
  cohSeriesCount: (n) => ` · ${n} סדרות`,
  cohKpiServicesInPeriod: "שירותים בתקופה",
  cohKpiVisitsInPeriod: "ביקורים בתקופה",
  cohKpiRawMaterial: "חומר גלם (גרם)",
  cohKpiGrams: (n) => `${n} גרם`,
  cohKpiNewCompetitors: "מתחרים חדשים",
  cohKpiNewBrandsEntered: "מותגים חדשים שנכנסו",
  cohKpiSalons: (n) => `${n} מספרות`,
  cohBrandsTitle: "ביצועי מותגים בקבוצה",
  cohBrandsSub: (brands, salons, label) => `${brands} מותגים · ${salons} מספרות · ${label}`,
  cohColBrand: "מותג",
  cohColServices: "שירותים",
  cohColRevenue: "הכנסה",
  cohColGrams: "גרמים",
  cohColVisits: "ביקורים",
  cohColSalons: "מספרות",
  cohColShare: "נתח שוק",
  cohCsvBrandHeaders: ["מותג", "שירותים", "הכנסה", "גרמים", "ביקורים", "מספרות", "נתח שוק %"],
  cohJanCompTitle: "השוואת ינואר מול ינואר",
  cohJanCompSub: "גרמים ושירותים — ינואר לעומת ינואר שנה קודמת",
  cohJanGrams: "גרמים",
  cohJanServices: "שירותים",
  cohMomTitle: "שינוי חודשי באחוזים",
  cohMomSub: "גרמים ושירותים — שינוי מהחודש הקודם",
  cohCsvMomHeaders: ["חודש", "גרמים", "% שינוי גרמים", "שירותים", "% שינוי שירותים"],
  cohUserYoyTitle: "גרמים ושירותים לפי משתמש — ינואר מול ינואר",
  cohUserYoySub: (label) => `השוואת חודש ינואר בלבד · ${label}`,
  cohColPctChange: "% שינוי",
  cohUserYoyTotal: "סה״כ",
  cohSvcByTypeTitle: "שירותים חודשיים לפי סוג",
  cohSvcByTypeSub: (salons, label) => `${salons} מספרות נבחרות · ${label}`,
  cohCsvTrendHeaders: ["חודש", "שירותים", "ביקורים", "גרמים", "צבע", "גוונים", "טונר", "החלקה", "אחר"],
  cohVisitsMaterialTitle: "מגמת ביקורים וחומר גלם",
  cohVisitsMaterialSub: "ביקורים וגרמים חודשיים עבור הקבוצה",
  cohVisitsLegend: "ביקורים",
  cohMaterialLegend: "חומר (גרם)",
  cohCompetitorsTitle: "מתחרים חדשים לפי חודש",
  cohCompetitorsSub: "מותגים שנראו לראשונה אצל מספרות הקבוצה",
  cohNewCount: (n) => `${n} חדשים`,
  cohNoChange: "ללא שינוי",
  cohSvcCount: (n) => `${n} שירותים`,
  cohDrillTitle: (userId) => `מגמת משתמש: ${userId}`,
  cohDrillSub: (city) => `${city} · לחץ על משתמש בקבוצה לבחירה`,
  cohPauseLabel: (m) => `עצירה: ${m}`,
  cohSlowdownLabel: (m) => `האטה: ${m}`,
  cohDrillColMonth: "חודש",
  cohDrillColServices: "שירותים",
  cohDrillColVisits: "ביקורים",
  cohDrillColMaterial: "חומר (ג׳)",
  cohDrillColColor: "צבע",
  cohDrillColHighlights: "גוונים",
  cohDrillColToner: "טונר",
  cohDrillColStatus: "סטטוס",
  cohStatusPause: "עצירה",
  cohStatusSlowdown: "האטה",
  cohStatusActive: "פעיל",
  cohClickToView: "לחץ על משתמש בקבוצה למעלה לצפייה במגמת השימוש האישית שלו",

  popTitle: "אוכלוסיות",
  popSub: "קבוצות לקוחות יציבות ומוגדרות לניתוח",
  popNewBtn: "אוכלוסייה חדשה",
  popFormTitle: "צור אוכלוסייה חדשה",
  popNameLabel: "שם האוכלוסייה",
  popNamePlaceholder: "דוגמה: כשרים ינואר 24 – ינואר 25",
  popDescLabel: "תיאור (אופציונלי)",
  popDescPlaceholder: "תיאור קצר",
  popWindowLabel: "חלון זכאות (Eligibility Window)",
  popWindowNote: "חלון הזכאות קובע לאיזו תקופה יחושב ציון איכות השימוש",
  popUntilLabel: "עד",
  popSaveBtn: "שמור אוכלוסייה",
  popSaving: "שומר...",
  popCancelBtn: "ביטול",
  popEmptyTitle: "אין אוכלוסיות שמורות עדיין",
  popEmptySub: "צור את האוכלוסייה הראשונה שלך",
  popMembersCount: (n) => `חברי האוכלוסייה (${n})`,
  popMemberSearch: "חפש לקוח להוספה...",
  popNoResults: "לא נמצאו תוצאות",
  popAddBtn: "+ הוסף",
  popNoMembers: "אין חברים באוכלוסייה זו. הוסף לקוחות מהחיפוש למטה.",
  popQualityTitle: "ציון איכות שימוש",
  popQualityEdit: "ערוך הגדרות",
  popQualityClose: "סגור עריכה",
  popQualitySave: "שמור הגדרות",
  popQualitySaving: "שומר...",
  popWindowSection: "חלון זכאות",
  popPresenceWeight: "משקל נוכחות",
  popConsistencyLabel: (pct) => `עקביות: ${pct}%`,
  popGreenThreshold: "סף ירוק (≥)",
  popAmberThreshold: "סף כתום (≥)",
  popMaxGoodDeviation: "סטייה מקסימלית טובה (%)",
  popMaxPartialDeviation: "סטייה מקסימלית חלקית (%)",
  popQualityDistTitle: "התפלגות ציוני איכות",
  popDeleteTitle: "מחק אוכלוסייה",
  popManageTitle: "נהל אוכלוסייה",
  popNameRequired: "שם אוכלוסייה הוא שדה חובה",
  popDeleteConfirm: "למחוק את האוכלוסייה? פעולה זו אינה הפיכה.",

  cellTitle: "תאי ניתוח",
  cellSub: "תאי ניתוח מוגדרים מראש לשימוש בהשוואות",
  cellNewBtn: "תא חדש",
  cellFormTitle: "צור תא ניתוח חדש",
  cellNameLabel: "שם התא",
  cellNamePlaceholder: "דוגמה: L'Oréal ינואר 24 – ינואר 25",
  cellDescLabel: "תיאור (אופציונלי)",
  cellPopLabel: "אוכלוסייה",
  cellSelectPop: "בחר אוכלוסייה...",
  cellPeriodALabel: "תקופה א׳",
  cellPeriodBLabel: "תקופה ב׳",
  cellFromLabel: "מ-",
  cellToLabel: "עד",
  cellFiltersLabel: "פילטרים (אופציונלי)",
  cellFilterByCompany: "חברה",
  cellFilterBySeries: "סדרה",
  cellFilterByService: "סוג שירות",
  cellCreateBtn: "צור תא",
  cellCreating: "יוצר...",
  cellCancelBtn: "ביטול",
  cellDeleteConfirm: "למחוק את תא הניתוח?",
  cellNameRequired: "שם תא הוא שדה חובה",
  cellNoFilters: "ללא פילטרים",
  cellCompaniesFilter: (companies) => `חברות: ${companies}`,
  cellSeriesFilter: (series) => `סדרות: ${series}`,
  cellServicesFilter: (types) => `שירותים: ${types}`,
  cellPeriodAShort: "תקופה א׳",
  cellPeriodBShort: "תקופה ב׳",
  cellMetricServices: "שירותים",
  cellMetricVisits: "ביקורים",
  cellMetricGrams: "חומר (גרם)",
  cellMetricColor: "צבע",
  cellMetricHighlights: "גוונים",
  cellMetricToner: "טונר",
  cellMetricStraightening: "החלקה",
  cellMetricOthers: "אחר",
  cellMetricActiveSalons: "מספרות פעילות",

  ccTitle: "תא מול תא",
  ccSub: "השוואת תאי ניתוח שמורים אחד מול השני",
  ccSelectUp: "בחר עד 4 תאים להשוואה",
  ccNoSaved: 'אין תאי ניתוח שמורים. צור תאים בטאב "תאי ניתוח" תחילה.',
  ccWarnDiffPops: "⚠ תאים משתמשים באוכלוסיות שונות — ייתכן שההשוואה אינה תפוח מול תפוח",
  ccWarnDiffFilters: "⚠ פילטרים שונים בין התאים — ודא שההשוואה הגיונית",
  ccNoFilters: "ללא פילטרים",
  ccMetricServices: "שירותים",
  ccMetricVisits: "ביקורים",
  ccMetricGrams: "חומר (גרם)",
  ccMetricColor: "צבע",
  ccMetricHighlights: "גוונים",
  ccMetricToner: "טונר",
  ccMetricStraightening: "החלקה",
  ccMetricOthers: "אחר",
  ccMetricActiveSalons: "מספרות פעילות",
  ccMetricLabel: "מדד",
  ccMembersRow: "חברי אוכלוסייה",
  ccSalonsCount: (n) => `${n} מספרות`,
  ccSelectAtLeast: "בחר שני תאים לפחות כדי להתחיל בהשוואה",

  cellPeriodALong: "תקופה א׳ — בסיס",
  cellPeriodBLong: "תקופה ב׳ — השוואה",
  cellActiveFilters: "פילטרים פעילים",
  cellCompaniesNote: "חברות (רק אלה יכללו — ריק = כולן)",
  cellSeriesNote: "סדרות (ריק = כולן)",
  cellServiceTypeNote: "סוגי שירות (ריק = כולם)",
  cellEmptyTitle: "אין תאי ניתוח שמורים",
  cellEmptySub: "צור את התא הראשון שלך",
  cellSalonsCount: (n) => `${n} מספרות`,
  cellMembersInAnalysis: (n) => `${n} מספרות בניתוח`,
  cellServiceBreakTitle: "פירוט לפי סוג שירות",
  cellUserBreakTitle: "פירוט לפי מספרה",
  cellSortByPct: "מיון: שינוי %",
  cellSortByServices: "מיון: שירותים ב׳",
  cellColSalon: "מספרה",
  cellColChange: "שינוי %",
  cellPopMembersCount: (n) => `${n} חברים`,
  cellSaving: "שומר...",
};

// ── English ────────────────────────────────────────────────────────
export const EN: AnalyticsCopy = {
  dir: "ltr",

  gateInstruction: "Enter password to access the dashboard",
  gateError: "Incorrect password. Please try again.",
  gateButton: "Access Dashboard",

  headerFrom: "From",
  headerTo: "To",
  headerServiceTypes: "Service types:",
  headerShowAll: "Show all",

  footerDataUpdated: (from, to) => `Data updated • ${from} – ${to}`,

  kpiActiveSalons: "Active Salons",
  kpiOnPlatform: "on Spectra Platform",
  kpiTotalVisits: "Total Visits",
  kpiTotalServices: "Total Services",
  kpiAvgServicesPerMonth: "Avg Services / Month",
  kpiMonths: (n) => `${n} months`,
  kpiActiveBrands: "Active Brands",
  kpiCities: (n) => `${n} cities`,
  kpiRawMaterial: "Raw Material (g)",
  kpiGrams: (n) => `${n} g`,

  filterTitle: "Customer Filter",
  filterSelected: (n) => `${n} selected`,
  filterContinuityBadge: (pct) => `≥ ${pct}% continuity`,
  filterAllCustomers: "All Customers",
  filterClearAll: "Clear All",
  filterSearchPlaceholder: "Search by ID or city...",
  filterSortServices: "Sort: Services",
  filterSortContinuity: "Sort: Usage Continuity",
  filterSortMonthsActive: "Sort: Active Months",
  filterSortAvgServices: "Sort: Avg Services / Month",
  filterSortGrams: "Sort: Material (g)",
  filterMinContinuity: "Min. Continuity:",
  filterCustom: "Custom",
  filterClear: "Clear",
  filterCount: (shown, total) => `${shown} / ${total} customers`,
  filterColCity: "City",
  filterColContinuity: "Continuity",
  filterColData: "Data",
  filterMonths: (active, total) => `${active}/${total} months`,
  filterServices: (n) => `${n} svc`,
  filterAvgPerMonth: (n) => `~${n}/mo`,
  filterSince: (m) => `since ${m}`,
  filterActiveNote: (n) => `Showing data for ${n} selected customers. All tabs updated.`,
  filterEmptyNote: "Select customers to filter all dashboard views.",

  tabOverview: "Overview",
  tabBrands: "Brands & Market",
  tabCities: "Geographic Breakdown",
  tabUsers: "User Data",
  tabCompare: "Monthly Comparison",
  tabCohorts: "Cohort Analysis",
  tabPopulations: "Populations",
  tabCells: "Analysis Cells",
  tabCellComparison: "Cell vs. Cell",

  svcColor: "Color",
  svcHighlights: "Highlights",
  svcToner: "Toner",
  svcStraightening: "Straightening",
  svcOthers: "Others",

  unknownCityDisplay: "Unknown",
  unknownSalonTypeDisplay: "Undefined",
  othersBrandLabel: "Others",
  duplicateSuffix: " (Copy)",

  ovServiceBreakTitle: "Breakdown by Service Category",
  ovServiceBreakSub: "Service type distribution in the Israeli market",
  ovRawMatTitle: "Raw Material by Service Category",
  ovRawMatSub: "Material consumption (g) by treatment type",
  ovMatGramsLegend: "Material (g)",
  ovMonthlyTrendsTitle: "Monthly Trends",
  ovMonthlyTrendsSub: "Visits and services over time",
  ovServicesLegend: "Services",
  ovVisitsLegend: "Visits",
  ovMatTrendTitle: "Material Consumption Trend",
  ovMatTrendSub: "Monthly raw material (g) from the Israeli market",
  ovMatGramsBarLegend: "Material (g)",
  ovMonthlyPctTitle: "Monthly % Change",
  ovMonthlyPctSub: "Grams and services — change from previous month",
  ovColMonth: "Month",
  ovColGrams: "Grams",
  ovColPctChange: "% Chg",
  ovColServices: "Services",
  ovJanCompTitle: "January vs. January Comparison",
  ovJanCompSub: "Grams and services — Jan vs. prior year Jan (full market)",
  ovJanGramsLabel: "Grams",
  ovJanServicesLabel: "Services",
  ovServiceTrendsTitle: "Service Trends by Category",
  ovServiceTrendsSub: "Service type distribution over the months",
  ovSalonTypeTitle: "Breakdown by Salon Type",
  ovSalonTypeSub: "Salon type distribution in Israel",
  ovSalonTypePrefix: (type) => `Type ${type}`,
  ovSalonCountLabel: "Salons",
  ovServicesColon: (n) => `Services: ${n}`,
  ovActiveSBTitle: "Active Salons & Brands",
  ovActiveSBSub: "Number of active salons and brands per month",
  ovActiveSalonsLegend: "Active Salons",
  ovActiveBrandsLegend: "Active Brands",

  brMarketShareTitle: "Market Share by Brand",
  brMarketShareSub: "Top 10 hair color brands in the Israeli market (by service count)",
  brDetailedTitle: "Detailed Brand Performance",
  brDetailedSub: "All active brands in the Israeli market",
  brColBrand: "Brand",
  brColServices: "Services",
  brColVisits: "Visits",
  brColMaterial: "Material (g)",
  brColSalons: "Salons",
  brColMarketShare: "Market Share",
  brCsvHeaders: ["Brand", "Services", "Revenue", "Grams", "Visits", "Salons", "Market Share %"],
  brTrendsTitle: "Brand Trends Over Time",
  brTrendsSub: "Top 8 Brands — Monthly Services",
  brMaterialTitle: "Raw Material Consumption by Brand",
  brMaterialSub: "Top 15 Brands — Gram Usage",
  brGramsLegend: "Grams",

  ciMarketTitle: "Market Breakdown by City",
  ciMarketSub: "Service distribution by leading cities",
  ciByServiceTitle: "Services by City",
  ciByServiceSub: "Top 10 cities by service count",
  ciServicesLegend: "Services",
  ciUnknownTitle: "Accounts Without City",
  ciUnknownSub: "Accounts appearing as Unknown — can be updated when information is provided",
  ciColServices: "Services",
  ciColVisits: "Visits",
  ciColMaterial: "Material (g)",
  ciColLastMonth: "Last Month",
  ciAllTitle: "All Cities — Detailed Data",
  ciAllSub: "Full breakdown by Israeli cities",
  ciColCity: "City",
  ciColSalons: "Salons",
  ciColShare: "Share",

  usersTotal: "Total Users:",
  usersSearchPlaceholder: "Search by ID or city...",
  usersAllCities: "All Cities",
  usersTableTitle: "Usage History — User Data",
  usersTableSub: "Click column header to sort",
  usersColId: "ID",
  usersColCity: "City",
  usersColType: "Type",
  usersColEmployees: "Employees",
  usersColServices: "Services",
  usersColVisits: "Visits",
  usersColMaterial: "Material (g)",
  usersColBrands: "Brands",
  usersColMonths: "Months",
  usersColContinuity: "Continuity %",
  usersColColor: "Color",
  usersColHighlights: "Highlights",
  usersColToner: "Toner",
  usersColStraightening: "Straightening",
  usersCsvHeaders: ["ID", "City", "Services", "Visits", "Grams", "Brands", "Active Months", "Color", "Highlights", "Toner", "Straightening"],
  usersShowingLimit: (n) => `Showing 100 of ${n} users. Use filters to narrow down.`,
  usersBrandsTitle: "Brands Used by User",
  usersBrandsSub: "Top 20 Users — Their Leading Brands",
  usersServiceGrams: (svc, gr) => `${svc} services · ${gr} g`,

  cmpTitle: "Monthly Comparison",
  cmpSub: "Select months to compare and specific customers (or leave empty to compare the whole market)",
  cmpMonthALabel: "Month A (Baseline)",
  cmpMonthBLabel: "Month B (Comparison)",
  cmpSelectMonth: "Select month...",
  cmpFilterNote: (n) => `Comparison showing data for ${n} customers selected in the global filter above.`,
  cmpServiceChartTitle: "Service Category Comparison",
  cmpVs: (a, b) => `${a} vs. ${b}`,
  cmpUserTitle: "Comparison by Customer",
  cmpUserSub: (a, b) => `${a} vs. ${b} — Services, Visits, and Material`,
  cmpColId: "ID",
  cmpColCity: "City",
  cmpColServices: "Services",
  cmpColVisits: "Visits",
  cmpColMaterial: "Material (g)",
  cmpColChange: "Δ",
  cmpTotal: "Total",
  cmpShowingLimit: (n) => `Showing 50 of ${n} customers.`,
  cmpSelectTwo: "Select two months to compare",
  cmpSvcColor: "Color",
  cmpSvcHighlights: "Highlights",
  cmpSvcToner: "Toner",
  cmpSvcStraightening: "Straightening",
  cmpKpiServices: "Services",
  cmpKpiVisits: "Visits",
  cmpKpiMaterial: "Material (g)",

  cohConnectionErrorTitle: "Server Connection Error",
  cohConnectionErrorMsg: (err) => err,
  cohRetry: "Retry",
  cohStep1Title: "Select Population",
  cohStep1Sub: "Select salons for the report from all users",
  cohSalonsCount: (n) => `${n} salons`,
  cohClearAll: "Clear All",
  cohSearchPlaceholder: "Search salon by ID or city...",
  cohServicesSinceLabel: (svc, months) => `${svc} svc · ${months} months`,
  cohInGroup: "In group",
  cohAddUser: "+ Add",
  cohNoResults: "No results found",
  cohLoadSaved: "Load from saved group",
  cohSaveSelection: "Save current selection as group",
  cohNamePlaceholder: "Group name...",
  cohSaveBtn: "Save",
  cohStep2Title: "Date Range",
  cohStep2Sub: "Set the analysis period",
  cohMonthsCount: (n) => `${n} months`,
  cohStarting: "Starting",
  cohEnding: "Ending",
  cohSaveToGroup: "✎ Save to group",
  cohStep3Title: "Data",
  cohStep3Sub: (salons, label) => `${salons} salons · ${label}`,
  cohClearFilters: "Clear Filters",
  cohFilterByCompany: "Filter by company",
  cohFilterBySeries: "Filter by series",
  cohActiveFilter: "Active filter",
  cohCompaniesCount: (n) => ` · ${n} companies`,
  cohSeriesCount: (n) => ` · ${n} series`,
  cohKpiServicesInPeriod: "Services in Period",
  cohKpiVisitsInPeriod: "Visits in Period",
  cohKpiRawMaterial: "Raw Material (g)",
  cohKpiGrams: (n) => `${n} g`,
  cohKpiNewCompetitors: "New Competitors",
  cohKpiNewBrandsEntered: "New brands that entered",
  cohKpiSalons: (n) => `${n} salons`,
  cohBrandsTitle: "Brand Performance in Group",
  cohBrandsSub: (brands, salons, label) => `${brands} brands · ${salons} salons · ${label}`,
  cohColBrand: "Brand",
  cohColServices: "Services",
  cohColRevenue: "Revenue",
  cohColGrams: "Grams",
  cohColVisits: "Visits",
  cohColSalons: "Salons",
  cohColShare: "Market Share",
  cohCsvBrandHeaders: ["Brand", "Services", "Revenue", "Grams", "Visits", "Salons", "Market Share %"],
  cohJanCompTitle: "January vs. January Comparison",
  cohJanCompSub: "Grams and services — Jan vs. prior year Jan",
  cohJanGrams: "Grams",
  cohJanServices: "Services",
  cohMomTitle: "Monthly % Change",
  cohMomSub: "Grams and services — change from previous month",
  cohCsvMomHeaders: ["Month", "Grams", "% Grams Change", "Services", "% Services Change"],
  cohUserYoyTitle: "Grams & Services by User — Jan vs. Jan",
  cohUserYoySub: (label) => `January comparison only · ${label}`,
  cohColPctChange: "% Chg",
  cohUserYoyTotal: "Total",
  cohSvcByTypeTitle: "Monthly Services by Type",
  cohSvcByTypeSub: (salons, label) => `${salons} selected salons · ${label}`,
  cohCsvTrendHeaders: ["Month", "Services", "Visits", "Grams", "Color", "Highlights", "Toner", "Straightening", "Others"],
  cohVisitsMaterialTitle: "Visits & Raw Material Trend",
  cohVisitsMaterialSub: "Monthly visits and grams for the group",
  cohVisitsLegend: "Visits",
  cohMaterialLegend: "Material (g)",
  cohCompetitorsTitle: "New Competitors by Month",
  cohCompetitorsSub: "Brands seen for the first time at group salons",
  cohNewCount: (n) => `${n} new`,
  cohNoChange: "No change",
  cohSvcCount: (n) => `${n} services`,
  cohDrillTitle: (userId) => `User Trend: ${userId}`,
  cohDrillSub: (city) => `${city} · Click a user in the group to select`,
  cohPauseLabel: (m) => `Pause: ${m}`,
  cohSlowdownLabel: (m) => `Slowdown: ${m}`,
  cohDrillColMonth: "Month",
  cohDrillColServices: "Services",
  cohDrillColVisits: "Visits",
  cohDrillColMaterial: "Material (g)",
  cohDrillColColor: "Color",
  cohDrillColHighlights: "Highlights",
  cohDrillColToner: "Toner",
  cohDrillColStatus: "Status",
  cohStatusPause: "Pause",
  cohStatusSlowdown: "Slowdown",
  cohStatusActive: "Active",
  cohClickToView: "Click a user in the group above to view their personal usage trend",

  popTitle: "Populations",
  popSub: "Stable, defined customer groups for analysis",
  popNewBtn: "New Population",
  popFormTitle: "Create New Population",
  popNameLabel: "Population Name",
  popNamePlaceholder: "e.g. Eligible Jan 24 – Jan 25",
  popDescLabel: "Description (optional)",
  popDescPlaceholder: "Brief description",
  popWindowLabel: "Eligibility Window",
  popWindowNote: "The eligibility window determines the period for which the usage quality score is calculated",
  popUntilLabel: "to",
  popSaveBtn: "Save Population",
  popSaving: "Saving...",
  popCancelBtn: "Cancel",
  popEmptyTitle: "No saved populations yet",
  popEmptySub: "Create your first population",
  popMembersCount: (n) => `Population Members (${n})`,
  popMemberSearch: "Search customer to add...",
  popNoResults: "No results found",
  popAddBtn: "+ Add",
  popNoMembers: "No members in this population. Add customers from the search below.",
  popQualityTitle: "Usage Quality Score",
  popQualityEdit: "Edit Settings",
  popQualityClose: "Close Editing",
  popQualitySave: "Save Settings",
  popQualitySaving: "Saving...",
  popWindowSection: "Eligibility Window",
  popPresenceWeight: "Presence Weight",
  popConsistencyLabel: (pct) => `Consistency: ${pct}%`,
  popGreenThreshold: "Green threshold (≥)",
  popAmberThreshold: "Amber threshold (≥)",
  popMaxGoodDeviation: "Max good deviation (%)",
  popMaxPartialDeviation: "Max partial deviation (%)",
  popQualityDistTitle: "Quality Score Distribution",
  popDeleteTitle: "Delete Population",
  popManageTitle: "Manage Population",
  popNameRequired: "Population name is required",
  popDeleteConfirm: "Delete this population? This action is irreversible.",

  cellTitle: "Analysis Cells",
  cellSub: "Pre-defined analysis cells for use in comparisons",
  cellNewBtn: "New Cell",
  cellFormTitle: "Create New Analysis Cell",
  cellNameLabel: "Cell Name",
  cellNamePlaceholder: "e.g. L'Oréal Jan 24 – Jan 25",
  cellDescLabel: "Description (optional)",
  cellPopLabel: "Population",
  cellSelectPop: "Select population...",
  cellPeriodALabel: "Period A",
  cellPeriodBLabel: "Period B",
  cellFromLabel: "From",
  cellToLabel: "To",
  cellFiltersLabel: "Filters (optional)",
  cellFilterByCompany: "Company",
  cellFilterBySeries: "Series",
  cellFilterByService: "Service type",
  cellCreateBtn: "Create Cell",
  cellCreating: "Creating...",
  cellCancelBtn: "Cancel",
  cellDeleteConfirm: "Delete this analysis cell?",
  cellNameRequired: "Cell name is required",
  cellNoFilters: "No filters",
  cellCompaniesFilter: (companies) => `Companies: ${companies}`,
  cellSeriesFilter: (series) => `Series: ${series}`,
  cellServicesFilter: (types) => `Services: ${types}`,
  cellPeriodAShort: "Period A",
  cellPeriodBShort: "Period B",
  cellMetricServices: "Services",
  cellMetricVisits: "Visits",
  cellMetricGrams: "Material (g)",
  cellMetricColor: "Color",
  cellMetricHighlights: "Highlights",
  cellMetricToner: "Toner",
  cellMetricStraightening: "Straightening",
  cellMetricOthers: "Others",
  cellMetricActiveSalons: "Active Salons",

  ccTitle: "Cell vs. Cell",
  ccSub: "Compare saved analysis cells side by side",
  ccSelectUp: "Select up to 4 cells to compare",
  ccNoSaved: 'No saved analysis cells. Create cells in the "Analysis Cells" tab first.',
  ccWarnDiffPops: "⚠ Cells use different populations — comparison may not be apples-to-apples",
  ccWarnDiffFilters: "⚠ Different filters across cells — verify the comparison is meaningful",
  ccNoFilters: "No filters",
  ccMetricServices: "Services",
  ccMetricVisits: "Visits",
  ccMetricGrams: "Material (g)",
  ccMetricColor: "Color",
  ccMetricHighlights: "Highlights",
  ccMetricToner: "Toner",
  ccMetricStraightening: "Straightening",
  ccMetricOthers: "Others",
  ccMetricActiveSalons: "Active Salons",
  ccMetricLabel: "Metric",
  ccMembersRow: "Population Members",
  ccSalonsCount: (n) => `${n} salons`,
  ccSelectAtLeast: "Select at least two cells to start comparing",

  cellPeriodALong: "Period A — Baseline",
  cellPeriodBLong: "Period B — Comparison",
  cellActiveFilters: "Active Filters",
  cellCompaniesNote: "Companies (only these included — blank = all)",
  cellSeriesNote: "Series (blank = all)",
  cellServiceTypeNote: "Service types (blank = all)",
  cellEmptyTitle: "No saved analysis cells",
  cellEmptySub: "Create your first cell",
  cellSalonsCount: (n) => `${n} salons`,
  cellMembersInAnalysis: (n) => `${n} salons in analysis`,
  cellServiceBreakTitle: "Service Type Breakdown",
  cellUserBreakTitle: "Breakdown by Salon",
  cellSortByPct: "Sort: % Change",
  cellSortByServices: "Sort: Period B Services",
  cellColSalon: "Salon",
  cellColChange: "% Change",
  cellPopMembersCount: (n) => `${n} members`,
  cellSaving: "Saving...",
};
