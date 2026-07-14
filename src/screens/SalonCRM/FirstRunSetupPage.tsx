import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Loader2, Search, Sparkles } from "lucide-react";
import { useSiteTheme } from "../../contexts/SiteTheme";
import { useCrmLocale } from "./i18n/CrmLocale";
import {
  createCrmCategory,
  createCrmDepartment,
  createCrmService,
  listCrmServicesCatalog,
} from "./data/crmServicesApi";
import {
  listBrandProductLines,
  listCatalogBrands,
  listCatalogStock,
  setBrandEnabled,
  setProductLineEnabled,
  type SalonCatalogBrand,
  type SalonCatalogStockRow,
  type SalonProductLine,
} from "./data/salonProductsApi";
import { updateSalonProfile } from "./data/crmSalonsApi";
import { useCRMActions, useCRMSalon } from "./data";
import { useCRMContext, useCRMState } from "./data/CRMDataProvider";

const STEPS = [
  "welcome",
  "salon",
  "services",
  "staff",
  "brands",
  "product-lines",
  "inventory",
] as const;

type StepId = typeof STEPS[number];

const STEP_INDEX: Record<StepId, number> = Object.fromEntries(STEPS.map((step, index) => [step, index])) as Record<StepId, number>;

const SERVICE_OPTIONS = [
  { key: "haircut", label: "Haircut", category: "cut" as const, categoryLabel: "Haircut / Styling", duration: 45, price: 18000, color: "#D7897F" },
  { key: "color", label: "Color", category: "color" as const, categoryLabel: "Color", duration: 90, price: 42000, color: "#C8766D" },
  { key: "highlights", label: "Highlights", category: "highlights" as const, categoryLabel: "Highlights", duration: 120, price: 65000, color: "#F9B95C" },
  { key: "toner", label: "Toner", category: "toner" as const, categoryLabel: "Toner", duration: 35, price: 22000, color: "#96C7B3" },
  { key: "balayage", label: "Balayage", category: "highlights" as const, categoryLabel: "Highlights", duration: 150, price: 78000, color: "#E7A77D" },
  { key: "treatment", label: "Treatment", category: "treatment" as const, categoryLabel: "Treatment", duration: 45, price: 26000, color: "#8FB7AA" },
];

function idsEqual(a: Set<string>, b: Set<string>) {
  if (a.size !== b.size) return false;
  for (const value of a) if (!b.has(value)) return false;
  return true;
}

function serviceId(salonId: string, key: string) {
  return `svc-${salonId}-${key}`;
}

function categoryId(salonId: string, key: string) {
  return `cat-${salonId}-${key}`;
}

const FirstRunSetupPage: React.FC = () => {
  const { isDark } = useSiteTheme();
  const { lang } = useCrmLocale();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const salon = useCRMSalon();
  const crmState = useCRMState();
  const crmContext = useCRMContext();
  const actions = useCRMActions();
  const force = searchParams.get("force") === "1";
  const isHebrew = lang === "he";

  const [stepIndex, setStepIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [salonDraft, setSalonDraft] = useState({
    name: "",
    businessName: "",
    address: "",
    city: "",
    phone: "",
    timezone: "Asia/Jerusalem",
    currency: "ILS" as "ILS" | "USD" | "EUR" | "GBP" | "CAD" | "AUD",
  });
  const [selectedServices, setSelectedServices] = useState<Set<string>>(() => new Set(["haircut", "color", "highlights", "toner"]));
  const [staffDraft, setStaffDraft] = useState({ name: "", phone: "", role: "Owner / Manager" });
  const [brandQuery, setBrandQuery] = useState("");
  const [brands, setBrands] = useState<SalonCatalogBrand[]>([]);
  const [brandLoading, setBrandLoading] = useState(false);
  const [savedBrandIds, setSavedBrandIds] = useState<Set<string>>(() => new Set());
  const [draftBrandIds, setDraftBrandIds] = useState<Set<string>>(() => new Set());
  const [lines, setLines] = useState<SalonProductLine[]>([]);
  const [lineLoading, setLineLoading] = useState(false);
  const [savedLineIds, setSavedLineIds] = useState<Set<string>>(() => new Set());
  const [draftLineIds, setDraftLineIds] = useState<Set<string>>(() => new Set());
  const [stockPreview, setStockPreview] = useState<SalonCatalogStockRow[]>([]);

  const currentStep = STEPS[stepIndex];
  const activeStaffCount = Object.values(crmState.staffById).filter((member) => member.status !== "inactive").length;

  useEffect(() => {
    if (!salon) return;
    setSalonDraft({
      name: salon.name || "",
      businessName: salon.businessName || "",
      address: salon.address || "",
      city: salon.city || "",
      phone: salon.phone || "",
      timezone: salon.timezone || "Asia/Jerusalem",
      currency: salon.currency || "ILS",
    });
    const initialStep = salon.onboardingCurrentStep && salon.onboardingCurrentStep in STEP_INDEX
      ? STEP_INDEX[salon.onboardingCurrentStep as StepId]
      : 0;
    setStepIndex(Math.max(0, Math.min(initialStep, STEPS.length - 1)));
  }, [salon?.id]);

  useEffect(() => {
    if (!salon || salon.onboardingStatus !== "completed" || force) return;
    navigate("/crm/home", { replace: true });
  }, [force, navigate, salon]);

  useEffect(() => {
    if (currentStep !== "brands") return;
    let cancelled = false;
    setBrandLoading(true);
    listCatalogBrands(brandQuery, 18)
      .then((result) => {
        if (cancelled) return;
        const enabled = new Set(result.brands.filter((brand) => brand.enabled).map((brand) => brand.id));
        setBrands(result.brands);
        setSavedBrandIds(enabled);
        setDraftBrandIds((prev) => (prev.size === 0 ? enabled : prev));
      })
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => {
        if (!cancelled) setBrandLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [brandQuery, currentStep]);

  useEffect(() => {
    if (currentStep !== "product-lines") return;
    let cancelled = false;
    setLineLoading(true);
    Promise.all([...draftBrandIds].map((brandId) => listBrandProductLines(brandId).catch(() => ({ productLines: [] }))))
      .then((results) => {
        if (cancelled) return;
        const merged = results.flatMap((result) => result.productLines);
        const enabled = new Set(merged.filter((line) => line.enabled).map((line) => line.id));
        setLines(merged);
        setSavedLineIds(enabled);
        setDraftLineIds((prev) => (prev.size === 0 ? enabled : prev));
      })
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => {
        if (!cancelled) setLineLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [currentStep, draftBrandIds]);

  useEffect(() => {
    if (currentStep !== "inventory") return;
    let cancelled = false;
    listCatalogStock({ limit: 6 })
      .then((result) => {
        if (!cancelled) setStockPreview(result.items);
      })
      .catch(() => {
        if (!cancelled) setStockPreview([]);
      });
    return () => {
      cancelled = true;
    };
  }, [currentStep]);

  const copy = useMemo(() => ({
    next: isHebrew ? "הבא" : "Next",
    back: isHebrew ? "חזרה" : "Back",
    finish: isHebrew ? "סיום" : "Finish",
    step: isHebrew ? `שלב ${stepIndex + 1} מתוך ${STEPS.length}` : `Step ${stepIndex + 1} of ${STEPS.length}`,
  }), [isHebrew, stepIndex]);

  if (!salon) {
    return (
      <SetupFrame isDark={isDark}>
        {crmContext.error ? (
          <SetupLoadMessage
            title={isHebrew ? "לא הצלחנו להכין את הסלון" : "We couldn't prepare your salon"}
            detail={isHebrew ? "רענן את העמוד או נסה להתחבר שוב." : "Refresh the page or try logging in again."}
          />
        ) : (
          <SetupLoadMessage
            title={isHebrew ? "מכינים את הסלון שלך..." : "Preparing your salon..."}
            detail={isHebrew ? "טוענים את ההגדרות הראשונות שלך." : "Loading your first setup steps."}
          />
        )}
      </SetupFrame>
    );
  }

  const updateCurrentStep = async (next: StepId) => {
    await updateSalonProfile({ onboardingStatus: "incomplete", onboardingCurrentStep: next });
  };

  const saveSalonInfo = async () => {
    if (!salonDraft.name.trim()) throw new Error(isHebrew ? "שם הסלון חובה." : "Salon name is required.");
    await updateSalonProfile({
      name: salonDraft.name,
      businessName: salonDraft.businessName || null,
      address: salonDraft.address || null,
      city: salonDraft.city || null,
      phone: salonDraft.phone || null,
      timezone: salonDraft.timezone,
      currency: salonDraft.currency,
      onboardingStatus: "incomplete",
      onboardingCurrentStep: "services",
    });
  };

  const saveServices = async () => {
    if (selectedServices.size === 0) throw new Error(isHebrew ? "בחר לפחות שירות אחד." : "Choose at least one service.");
    const departmentId = `dept-${salon.id}-hair`;
    const catalog = await listCrmServicesCatalog();
    const existingDepartment = catalog.departments.some((department) => department.id === departmentId || department.name.toLowerCase() === "hair");
    if (!existingDepartment) {
      await createCrmDepartment({
        id: departmentId,
        name: "Hair",
        calendarLabel: "Hair",
        calendarColor: "#D7897F",
        bookingMode: "singleBlock",
        isCalendarEnabled: true,
        sortOrder: 0,
        status: "active",
      });
    }
    const selectedOptions = SERVICE_OPTIONS.filter((option) => selectedServices.has(option.key));
    const categoryKeys = [...new Set(selectedOptions.map((option) => option.category))];
    for (const key of categoryKeys) {
      const sample = selectedOptions.find((option) => option.category === key)!;
      const id = categoryId(salon.id, key);
      if (!catalog.categories.some((category) => category.id === id || category.name === sample.categoryLabel)) {
        await createCrmCategory({
          id,
          departmentId,
          crmCategoryId: key,
          name: sample.categoryLabel,
          accentColor: sample.color,
          sortOrder: categoryKeys.indexOf(key),
          status: "active",
        });
      }
    }
    for (const option of selectedOptions) {
      const id = serviceId(salon.id, option.key);
      if (catalog.services.some((service) => service.id === id || service.name === option.label)) continue;
      await createCrmService({
        id,
        categoryId: categoryId(salon.id, option.category),
        crmCategoryId: option.category,
        name: option.label,
        defaultDurationMinutes: option.duration,
        defaultPriceCents: option.price,
        defaultMaterialCostCents: 0,
        accentColor: option.color,
        sortOrder: SERVICE_OPTIONS.findIndex((candidate) => candidate.key === option.key),
        status: "active",
        defaultStages: [],
        linkedServiceIds: [],
        allowClientTimingOverrides: true,
        canOverlapDuringProcessing: true,
      });
    }
    await updateCurrentStep("staff");
  };

  const saveStaff = async () => {
    if (activeStaffCount > 0 && !staffDraft.name.trim()) {
      await updateCurrentStep("brands");
      return;
    }
    if (!staffDraft.name.trim()) throw new Error(isHebrew ? "שם איש צוות חובה." : "Staff name is required.");
    const result = await actions.createStaff({
      name: staffDraft.name,
      phone: staffDraft.phone || undefined,
      role: staffDraft.role || "Staff",
      roleId: "role-first-run",
      departmentIds: [`dept-${salon.id}-hair`],
      serviceIds: [...selectedServices].map((key) => serviceId(salon.id, key)),
      workingHours: [{ dayOfWeek: 0, startHour: 9, endHour: 17 }],
      color: "#D7897F",
      status: "active",
    });
    if (!result.ok) throw new Error(result.error.message);
    await updateCurrentStep("brands");
  };

  const saveBrands = async () => {
    if (!idsEqual(savedBrandIds, draftBrandIds)) {
      for (const brand of brands) {
        const before = savedBrandIds.has(brand.id);
        const after = draftBrandIds.has(brand.id);
        if (before !== after) await setBrandEnabled(brand.id, after);
      }
    }
    await updateCurrentStep("product-lines");
  };

  const saveLines = async () => {
    if (!idsEqual(savedLineIds, draftLineIds)) {
      for (const line of lines) {
        const before = savedLineIds.has(line.id);
        const after = draftLineIds.has(line.id);
        if (before !== after) await setProductLineEnabled(line.id, after);
      }
    }
    await updateCurrentStep("inventory");
  };

  const finish = async () => {
    await updateSalonProfile({ onboardingStatus: "completed", onboardingCurrentStep: null });
    window.location.assign("/crm/home");
  };

  const next = async () => {
    setSaving(true);
    setError(null);
    try {
      if (currentStep === "welcome") await updateCurrentStep("salon");
      if (currentStep === "salon") await saveSalonInfo();
      if (currentStep === "services") await saveServices();
      if (currentStep === "staff") await saveStaff();
      if (currentStep === "brands") await saveBrands();
      if (currentStep === "product-lines") await saveLines();
      if (currentStep === "inventory") {
        await finish();
        return;
      }
      setStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  const back = () => {
    setError(null);
    setStepIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <SetupFrame isDark={isDark}>
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-5xl flex-col px-5 py-6 sm:px-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-2xl bg-[#D7897F] text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className={`text-[11px] font-black uppercase tracking-[0.18em] ${isDark ? "text-white/45" : "text-[#7E7066]"}`}>
                Salon AI
              </p>
              <p className={`text-[13px] font-black ${isDark ? "text-white" : "text-[#141414]"}`}>{copy.step}</p>
            </div>
          </div>
          <div className={`hidden h-2 w-40 overflow-hidden rounded-full sm:block ${isDark ? "bg-white/[0.10]" : "bg-[#EBDDD2]"}`}>
            <div className="h-full rounded-full bg-[#96C7B3]" style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }} />
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center py-10">
          <section className={`w-full rounded-[34px] border p-6 shadow-[0_26px_80px_rgba(92,52,35,0.12)] sm:p-10 ${
            isDark ? "border-white/[0.10] bg-black/45" : "border-[#EBDDD2] bg-white/76"
          }`}>
            {currentStep === "welcome" && (
              <CenteredStep
                eyebrow={isHebrew ? "ברוכים הבאים" : "Welcome"}
                title={isHebrew ? "ברוך הבא ל-Salon AI." : "Welcome to Salon AI."}
                subtitle={isHebrew ? "נעזור לך להקים את הסלון בכמה דקות, צעד אחד בכל פעם." : "We'll help you set up your salon in just a few minutes, one step at a time."}
              />
            )}

            {currentStep === "salon" && (
              <StepBlock title={isHebrew ? "פרטי הסלון" : "Salon Information"} subtitle={isHebrew ? "רק הדברים שצריך כדי להתחיל." : "Only the details needed to get started."}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextField label={isHebrew ? "שם הסלון" : "Salon name"} value={salonDraft.name} onChange={(name) => setSalonDraft((prev) => ({ ...prev, name }))} />
                  <TextField label={isHebrew ? "שם עסקי (אופציונלי)" : "Business name (optional)"} value={salonDraft.businessName} onChange={(businessName) => setSalonDraft((prev) => ({ ...prev, businessName }))} />
                  <TextField label={isHebrew ? "כתובת" : "Address"} value={salonDraft.address} onChange={(address) => setSalonDraft((prev) => ({ ...prev, address }))} />
                  <TextField label={isHebrew ? "עיר" : "City"} value={salonDraft.city} onChange={(city) => setSalonDraft((prev) => ({ ...prev, city }))} />
                  <TextField label={isHebrew ? "טלפון" : "Phone"} value={salonDraft.phone} onChange={(phone) => setSalonDraft((prev) => ({ ...prev, phone }))} />
                  <TextField label={isHebrew ? "אזור זמן" : "Timezone"} value={salonDraft.timezone} onChange={(timezone) => setSalonDraft((prev) => ({ ...prev, timezone }))} />
                </div>
                <div className="mt-3 flex gap-2">
                  {(["ILS", "USD", "EUR"] as const).map((currency) => (
                    <ChoicePill key={currency} selected={salonDraft.currency === currency} onClick={() => setSalonDraft((prev) => ({ ...prev, currency }))}>
                      {currency}
                    </ChoicePill>
                  ))}
                </div>
              </StepBlock>
            )}

            {currentStep === "services" && (
              <StepBlock title={isHebrew ? "מבנה ושירותים" : "Business Structure"} subtitle={isHebrew ? "נתחיל ממחלקת שיער ושירותים בסיסיים. אפשר לערוך הכל אחר כך." : "We'll start with a Hair department and basic services. You can edit everything later."}>
                <div className="mb-4 rounded-3xl border border-[#EBDDD2] bg-[#FFF8F0]/70 p-4">
                  <p className="text-[12px] font-black text-[#7E7066]">{isHebrew ? "מחלקה ראשונה" : "First department"}</p>
                  <p className="mt-1 text-[22px] font-black text-[#141414]">Hair</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {SERVICE_OPTIONS.map((service) => (
                    <CheckboxCard
                      key={service.key}
                      label={service.label}
                      selected={selectedServices.has(service.key)}
                      onClick={() => setSelectedServices((prev) => {
                        const nextSet = new Set(prev);
                        if (nextSet.has(service.key)) nextSet.delete(service.key);
                        else nextSet.add(service.key);
                        return nextSet;
                      })}
                    />
                  ))}
                </div>
              </StepBlock>
            )}

            {currentStep === "staff" && (
              <StepBlock title={isHebrew ? "איש צוות ראשון" : "First Team Member"} subtitle={activeStaffCount > 0 ? (isHebrew ? "כבר יש אנשי צוות. אפשר לדלג או להוסיף עוד אחד." : "You already have staff. You can skip or add another.") : (isHebrew ? "בדרך כלל זה בעל הסלון, אבל לא חייב להיות ספר." : "Usually this is the owner, but they do not have to be a stylist.")}>
                <div className="grid gap-3 sm:grid-cols-3">
                  <TextField label={isHebrew ? "שם" : "Name"} value={staffDraft.name} onChange={(name) => setStaffDraft((prev) => ({ ...prev, name }))} />
                  <TextField label={isHebrew ? "טלפון" : "Phone"} value={staffDraft.phone} onChange={(phone) => setStaffDraft((prev) => ({ ...prev, phone }))} />
                  <TextField label={isHebrew ? "תפקיד" : "Role"} value={staffDraft.role} onChange={(role) => setStaffDraft((prev) => ({ ...prev, role }))} />
                </div>
              </StepBlock>
            )}

            {currentStep === "brands" && (
              <StepBlock title={isHebrew ? "בחירת חברות" : "Choose Brands"} subtitle={isHebrew ? "בחר את החברות שהסלון עובד איתן." : "Choose the brands your salon works with."}>
                <SearchBox value={brandQuery} onChange={setBrandQuery} placeholder={isHebrew ? "חיפוש חברה" : "Search brands"} />
                {brandLoading ? <LoadingState /> : (
                  <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {brands.map((brand) => (
                      <CheckboxCard
                        key={brand.id}
                        label={brand.display_name || brand.name}
                        detail={`${brand.product_line_count} lines`}
                        selected={draftBrandIds.has(brand.id)}
                        onClick={() => setDraftBrandIds((prev) => toggleSet(prev, brand.id))}
                      />
                    ))}
                  </div>
                )}
              </StepBlock>
            )}

            {currentStep === "product-lines" && (
              <StepBlock title={isHebrew ? "בחירת סדרות" : "Choose Product Lines"} subtitle={isHebrew ? "רק מוצרים מהסדרות האלו יופיעו במלאי." : "Only products from these lines will appear in inventory."}>
                {lineLoading ? <LoadingState /> : lines.length === 0 ? (
                  <EmptyNote text={isHebrew ? "בחר חברה אחת לפחות כדי לראות סדרות." : "Choose at least one brand to see product lines."} />
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {lines.map((line) => (
                      <CheckboxCard
                        key={line.id}
                        label={line.name}
                        detail={`${line.product_count} products`}
                        selected={draftLineIds.has(line.id)}
                        onClick={() => setDraftLineIds((prev) => toggleSet(prev, line.id))}
                      />
                    ))}
                  </div>
                )}
              </StepBlock>
            )}

            {currentStep === "inventory" && (
              <StepBlock title={isHebrew ? "המוצרים מוכנים" : "Your Products Are Ready"} subtitle={isHebrew ? "אחרי הסיום תוכל להיכנס למלאי ולעדכן כמויות." : "After finishing, you can open Inventory and review quantities."}>
                {stockPreview.length > 0 ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {stockPreview.map((item) => (
                      <div key={item.product_id} className="rounded-2xl border border-[#EBDDD2] bg-white/70 p-3">
                        <p className="truncate text-[13px] font-black text-[#141414]">{item.canonical_name}</p>
                        <p className="mt-1 text-[11px] font-bold text-[#7E7066]">{item.brand_name || "Brand"} · {item.product_line_name || "Line"}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyNote text={isHebrew ? "המלאי יתמלא אוטומטית לפי החברות והסדרות שבחרת." : "Inventory will populate automatically from your selected brands and product lines."} />
                )}
              </StepBlock>
            )}

            {error && <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-bold text-red-700">{error}</div>}
          </section>
        </main>

        <footer className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={back}
            disabled={stepIndex === 0 || saving}
            className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-[13px] font-black transition disabled:opacity-35 ${
              isDark ? "border-white/[0.12] text-white/70" : "border-[#EBDDD2] text-[#7E7066]"
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            {copy.back}
          </button>
          <button
            type="button"
            onClick={() => void next()}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#D7897F] px-5 py-2.5 text-[13px] font-black text-white shadow-[0_14px_34px_rgba(215,137,127,0.30)] transition hover:bg-[#C8766D] disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : currentStep === "inventory" ? <Check className="h-4 w-4" /> : null}
            {currentStep === "inventory" ? copy.finish : stepIndex === 0 ? (isHebrew ? "התחל הגדרה" : "Start Setup") : copy.next}
            {currentStep !== "inventory" && <ArrowRight className="h-4 w-4" />}
          </button>
        </footer>
      </div>
    </SetupFrame>
  );
};

function toggleSet(values: Set<string>, id: string) {
  const next = new Set(values);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

const SetupFrame: React.FC<{ isDark: boolean; children: React.ReactNode }> = ({ isDark, children }) => (
  <div
    className="min-h-[100dvh] overflow-hidden"
    style={{
      background: isDark
        ? "radial-gradient(circle at 15% 18%, rgba(215,137,127,0.18), transparent 26%), linear-gradient(135deg, #18120F, #070707)"
        : "radial-gradient(circle at 10% 20%, rgba(249,185,92,0.22), transparent 28%), radial-gradient(circle at 88% 18%, rgba(150,199,179,0.22), transparent 26%), linear-gradient(135deg, #FFF8F0, #FFFDF8)",
    }}
  >
    {children}
  </div>
);

function CenteredStep({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className="mx-auto max-w-2xl py-16 text-center">
      <p className="text-[12px] font-black uppercase tracking-[0.22em] text-[#D7897F]">{eyebrow}</p>
      <h1 className="mt-4 text-[40px] font-black leading-tight tracking-[-0.05em] text-[#141414] sm:text-[56px]">{title}</h1>
      <p className="mx-auto mt-5 max-w-xl text-[16px] font-semibold leading-7 text-[#7E7066]">{subtitle}</p>
    </div>
  );
}

function StepBlock({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div>
      <h1 className="text-[30px] font-black tracking-[-0.04em] text-[#141414] sm:text-[42px]">{title}</h1>
      <p className="mt-2 max-w-2xl text-[14px] font-semibold leading-6 text-[#7E7066]">{subtitle}</p>
      <div className="mt-7">{children}</div>
    </div>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.14em] text-[#7E7066]">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-2xl border border-[#EBDDD2] bg-white/80 px-4 text-[14px] font-bold text-[#141414] outline-none transition focus:border-[#D7897F]"
      />
    </label>
  );
}

function ChoicePill({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-4 py-2 text-[12px] font-black transition ${selected ? "border-[#D7897F] bg-[#D7897F] text-white" : "border-[#EBDDD2] bg-white/70 text-[#7E7066]"}`}
    >
      {children}
    </button>
  );
}

function CheckboxCard({ label, detail, selected, onClick }: { label: string; detail?: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-between rounded-2xl border p-4 text-left transition ${selected ? "border-[#96C7B3] bg-[#F4FAF3]" : "border-[#EBDDD2] bg-white/70 hover:bg-white"}`}
    >
      <span>
        <span className="block text-[14px] font-black text-[#141414]">{label}</span>
        {detail && <span className="mt-0.5 block text-[11px] font-bold text-[#7E7066]">{detail}</span>}
      </span>
      <span className={`grid h-5 w-5 place-items-center rounded-full border ${selected ? "border-[#5E8C6A] bg-[#5E8C6A] text-white" : "border-[#BDAEA3]"}`}>
        {selected && <Check className="h-3 w-3" />}
      </span>
    </button>
  );
}

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <div className="flex h-12 items-center gap-2 rounded-2xl border border-[#EBDDD2] bg-white/80 px-4">
      <Search className="h-4 w-4 text-[#7E7066]" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-[14px] font-bold text-[#141414] outline-none"
      />
    </div>
  );
}

function EmptyNote({ text }: { text: string }) {
  return <div className="rounded-3xl border border-[#EBDDD2] bg-[#FFF8F0]/80 p-6 text-center text-[14px] font-bold text-[#7E7066]">{text}</div>;
}

function LoadingState() {
  return (
    <div className="grid min-h-[160px] place-items-center">
      <Loader2 className="h-6 w-6 animate-spin text-[#D7897F]" />
    </div>
  );
}

function SetupLoadMessage({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="grid min-h-[100dvh] place-items-center px-6">
      <div className="max-w-sm rounded-[28px] border border-[#EBDDD2] bg-white/80 p-6 text-center shadow-[0_18px_55px_rgba(92,52,35,0.10)]">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#D7897F]" />
        <p className="mt-4 text-[18px] font-black text-[#141414]">{title}</p>
        <p className="mt-2 text-[13px] font-semibold text-[#7E7066]">{detail}</p>
      </div>
    </div>
  );
}

export default FirstRunSetupPage;
