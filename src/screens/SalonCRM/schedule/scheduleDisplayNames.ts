import type { ServiceCategoryId } from "../data/crmTypes";

const CATEGORY_HE: Record<ServiceCategoryId, string> = {
  color: "צבע",
  highlights: "גוונים",
  toner: "טונר",
  straightening: "החלקות",
  treatment: "טיפולים",
  cut: "תספורות",
  other: "אחר",
};

const DEPARTMENT_HE: Record<string, string> = {
  Hair: "שיער",
  Cosmetics: "קוסמטיקה",
  Spa: "ספא",
};

const SERVICE_HE: Record<string, string> = {
  "Full Color": "צבע מלא",
  "Root Touch-up": "צבע שורש",
  Balayage: "בליאז׳",
  "Full Highlights": "גוונים ראש מלא",
  "Gloss Toner": "טונר ברק",
  "Corrective Toner": "טונר מתקן",
  "Keratin Treatment": "החלקת קרטין",
  "Brazilian Blowout": "החלקה ברזילאית",
  "Olaplex Treatment": "טיפול אולפלקס",
  "Deep Conditioning": "טיפול הזנה עמוק",
  "Cut & Style": "תספורת ועיצוב",
  "Highlights Rinse": "שטיפה לגוונים",
  "Length Toner": "טונר לאורכים",
  "Women's Haircut": "תספורת אישה",
  "Blow Dry & Styling": "פן ועיצוב",
  Color: "צבע",
  Highlights: "גוונים",
  Toner: "טונר",
  Straightening: "החלקה",
  Treatment: "טיפול",
  Cut: "תספורת",
  Other: "אחר",
  "Root Color": "צבע שורש",
  "Toner Fix": "תיקון טונר",
  "Men's Cut": "תספורת גבר",
  "Full Head": "צבע ראש מלא",
  "Full Head Color": "צבע ראש מלא",
  "Blow Dry + Style": "פן ועיצוב",
  "Highlights Half": "חצי ראש גוונים",
  "Buzz Cut": "תספורת קצרה",
  "Color Fix": "תיקון צבע",
  Keratin: "קרטין",
  "Toner Refresh": "רענון טונר",
  "Color Roots": "צבע שורש",
  "Half Head Highlights": "חצי ראש גוונים",
  "Gloss Treatment": "טיפול ברק",
  "Style + Cut": "תספורת ועיצוב",
  "Color + Toner": "צבע וטונר",
  "Crew Cut": "תספורת קצרה",
  "Vivid Fashion Color": "צבע אופנתי",
  "Full Head Highlights": "גוונים ראש מלא",
  "Balayage Touch-up": "חידוש בליאז׳",
  "Full Balayage": "בליאז׳ מלא",
  "Scalp Treatment": "טיפול קרקפת",
  "Trim + Blow Dry": "קצוות ופן",
  "Color Correction": "תיקון צבע",
  "Japanese Straightening": "החלקה יפנית",
  "Classic Cut": "תספורת קלאסית",
  "Color Wash": "חפיפה לצבע",
  "Highlights Wash": "חפיפה לגוונים",
  "Scalp Ampoule Care": "אמפולה לקרקפת",
  "Repair Ampoule Wash": "חפיפה + אמפולה לשיקום",
  "Hydration & Shine Ampoule": "אמפולת לחות וברק",
  "Keratin Hyaluronic Treatment": "טיפול קרטין וחומצה היאלורונית",
  "Wash & Treatments": "חפיפות וטיפולים",
};

const RESOURCE_HE: Record<string, string> = {
  "Chair 1": "כיסא 1",
  "Chair 2": "כיסא 2",
  "Chair 3": "כיסא 3",
  "Chair 4": "כיסא 4",
  "Wash Station 1": "עמדת שטיפה 1",
  "Wash Station 2": "עמדת שטיפה 2",
  "Color Bar": "עמדת צבע",
  "Treatment Room": "חדר טיפולים",
};

const STAFF_HE: Record<string, string> = {
  "Noa Levi": "נועה לוי",
  "Daniela Roth": "דניאלה רוט",
  "Maya Azulay": "מאיה אזולאי",
  "Shira Ben Ari": "שירה בן ארי",
  "Adele Cooper": "אדל קופר",
  "Liam Navarro": "ליאם נבארו",
  "Maya Goldstein": "מאיה גולדשטיין",
  "Daniel Rosen": "דניאל רוזן",
  "Noa Berkovich": "נועה ברקוביץ׳",
  "Romi Wash": "רומי חפיפה",
  "Lior Rinse": "ליאור שטיפה",
};

const STAFF_ROLE_HE: Record<string, string> = {
  "Senior Stylist": "מעצבת שיער בכירה",
  "Color Specialist": "מומחית צבע",
  "Hair Specialist": "מומחית שיער",
  "Beauty Therapist": "מטפלת יופי",
  "Senior Colorist": "צבעיסטית בכירה",
  Stylist: "מעצב שיער",
  "Junior Stylist": "מעצב שיער צעיר",
  "Straightening Pro": "מומחית החלקות",
  "Shampoo Assistant": "חופפ/ת",
};

const STAGE_HE: Record<string, string> = {
  "New stage": "שלב חדש",
  "Check-in": "כניסה לסלון",
  Checkout: "יציאה וסיכום",
  Consultation: "ייעוץ",
  "Color application": "הכנסת צבע ומריחה",
  "Foil placement": "הנחת גוונים",
  "Toner application": "מריחת טונר",
  "Keratin application": "מריחת קרטין",
  "Treatment application": "מריחת טיפול",
  "Processing time": "המתנה בתהליך",
  Processing: "המתנה",
  Wash: "חפיפה",
  "Blow-dry": "פן",
  "Cut & Style": "תספורת ועיצוב",
  Service: "שירות",
  Application: "מריחה",
};

export function displayDepartmentName(name: string, isHebrew: boolean): string {
  return isHebrew ? (DEPARTMENT_HE[name] ?? name) : name;
}

export function displayCategoryName(name: string, categoryId: ServiceCategoryId | undefined, isHebrew: boolean): string {
  if (!isHebrew) return name;
  return (categoryId ? CATEGORY_HE[categoryId] : undefined) ?? CATEGORY_HE[name.toLowerCase() as ServiceCategoryId] ?? name;
}

export function displayServiceName(name: string, isHebrew: boolean): string {
  if (!isHebrew) return name;
  if (SERVICE_HE[name]) return SERVICE_HE[name];
  return Object.entries(SERVICE_HE)
    .sort(([a], [b]) => b.length - a.length)
    .reduce((label, [source, translated]) => label.split(source).join(translated), name);
}

export function displayResourceName(name: string, isHebrew: boolean): string {
  return isHebrew ? (RESOURCE_HE[name] ?? name) : name;
}

export function displayStaffName(name: string, isHebrew: boolean): string {
  return isHebrew ? (STAFF_HE[name] ?? name) : name;
}

export function displayStaffRole(role: string, isHebrew: boolean): string {
  return isHebrew ? (STAFF_ROLE_HE[role] ?? role) : role;
}

export function displayStageName(name: string, isHebrew: boolean): string {
  return isHebrew ? (STAGE_HE[name] ?? name) : name;
}
