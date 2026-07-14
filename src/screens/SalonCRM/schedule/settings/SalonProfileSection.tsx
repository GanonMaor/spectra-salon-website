import React, { useEffect, useMemo, useState } from "react";
import { Building2, Check, Globe2, ImagePlus, Loader2, MapPin, ReceiptText, Save, Sparkles } from "lucide-react";
import { getSalonProfile, updateSalonProfile, type UpdateSalonProfileInput } from "../../data/crmSalonsApi";
import { canCallSalonRuntimeApi } from "../../data/salonSession";
import type { Salon } from "../../data/crmTypes";
import { useCRMContext } from "../../data/CRMDataProvider";
import { Field, GhostButton, PrimaryButton, SettingsPlaceholder, initialsFromName, useSettingsStyles } from "./settingsUi";

interface Props {
  isDark: boolean;
}

type Draft = Required<Pick<Salon,
  "name" | "timezone" | "currency" | "countryCode" | "locale" | "defaultLanguage" | "dateFormat" | "timeFormat" | "weekStartsOn"
>> & Omit<UpdateSalonProfileInput, "name" | "timezone" | "currency" | "countryCode" | "locale" | "defaultLanguage" | "dateFormat" | "timeFormat" | "weekStartsOn">;

const COUNTRIES = [
  { code: "IL", label: "ישראל", currency: "ILS", timezone: "Asia/Jerusalem", locale: "he-IL", language: "he", weekStartsOn: 0 },
  { code: "US", label: "United States", currency: "USD", timezone: "America/New_York", locale: "en-US", language: "en", weekStartsOn: 0 },
  { code: "GB", label: "United Kingdom", currency: "GBP", timezone: "Europe/London", locale: "en-GB", language: "en", weekStartsOn: 1 },
  { code: "FR", label: "France", currency: "EUR", timezone: "Europe/Paris", locale: "fr-FR", language: "fr", weekStartsOn: 1 },
  { code: "DE", label: "Germany", currency: "EUR", timezone: "Europe/Berlin", locale: "de-DE", language: "de", weekStartsOn: 1 },
  { code: "CA", label: "Canada", currency: "CAD", timezone: "America/Toronto", locale: "en-CA", language: "en", weekStartsOn: 0 },
  { code: "AU", label: "Australia", currency: "AUD", timezone: "Australia/Sydney", locale: "en-AU", language: "en", weekStartsOn: 1 },
] as const;

const CURRENCIES = [
  { code: "ILS", label: "ILS — ₪" },
  { code: "USD", label: "USD — $" },
  { code: "EUR", label: "EUR — €" },
  { code: "GBP", label: "GBP — £" },
  { code: "CAD", label: "CAD — CA$" },
  { code: "AUD", label: "AUD — A$" },
] as const;

const TIMEZONES = [
  "Asia/Jerusalem", "America/New_York", "America/Los_Angeles", "America/Chicago",
  "Europe/London", "Europe/Paris", "Europe/Berlin", "America/Toronto", "Australia/Sydney",
];

function draftFromSalon(salon: Salon): Draft {
  return {
    name: salon.name || "",
    businessName: salon.businessName ?? "",
    description: salon.description ?? "",
    logoUrl: salon.logoUrl ?? "",
    phone: salon.phone ?? "",
    whatsappPhone: salon.whatsappPhone ?? "",
    email: salon.email ?? "",
    website: salon.website ?? "",
    instagramUrl: salon.instagramUrl ?? "",
    facebookUrl: salon.facebookUrl ?? "",
    primaryContactName: salon.primaryContactName ?? "",
    countryCode: salon.countryCode ?? "IL",
    region: salon.region ?? "",
    city: salon.city ?? "",
    street: salon.street ?? "",
    streetNumber: salon.streetNumber ?? "",
    floor: salon.floor ?? "",
    unit: salon.unit ?? "",
    postalCode: salon.postalCode ?? "",
    addressNotes: salon.addressNotes ?? "",
    latitude: salon.latitude ?? null,
    longitude: salon.longitude ?? null,
    address: salon.address ?? "",
    currency: salon.currency ?? "ILS",
    timezone: salon.timezone ?? "Asia/Jerusalem",
    locale: salon.locale ?? "he-IL",
    defaultLanguage: salon.defaultLanguage ?? "he",
    dateFormat: salon.dateFormat ?? "DD/MM/YYYY",
    timeFormat: salon.timeFormat ?? "24h",
    weekStartsOn: salon.weekStartsOn ?? 0,
    businessRegistrationNumber: salon.businessRegistrationNumber ?? "",
    taxId: salon.taxId ?? "",
    businessType: salon.businessType ?? null,
    isTaxRegistered: salon.isTaxRegistered ?? false,
    defaultTaxRate: salon.defaultTaxRate ?? "",
    pricesIncludeTax: salon.pricesIncludeTax ?? true,
    invoicePrefix: salon.invoicePrefix ?? "",
    receiptPrefix: salon.receiptPrefix ?? "",
  };
}

function SelectField({ label, value, onChange, options, isDark, hint }: {
  label: string; value: string | number; onChange: (value: string) => void;
  options: ReadonlyArray<{ code: string; label: string }> | readonly string[]; isDark: boolean; hint?: string;
}) {
  const s = useSettingsStyles(isDark);
  return (
    <label className="block">
      <span className={`text-[11px] font-black ${s.textSoft}`}>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className={`mt-1 h-11 w-full ${s.input}`}>
        {options.map((option) => {
          const item = typeof option === "string" ? { code: option, label: option } : option;
          return <option key={item.code} value={item.code}>{item.label}</option>;
        })}
      </select>
      {hint && <span className={`mt-1 block text-[10px] font-semibold ${s.textFaint}`}>{hint}</span>}
    </label>
  );
}

function Toggle({ checked, onChange, label, detail, isDark }: {
  checked: boolean; onChange: (value: boolean) => void; label: string; detail?: string; isDark: boolean;
}) {
  const s = useSettingsStyles(isDark);
  return (
    <label className={`flex cursor-pointer items-start justify-between gap-4 rounded-xl border p-3 ${s.cardSoft}`}>
      <span>
        <span className={`block text-[12px] font-black ${s.textStrong}`}>{label}</span>
        {detail && <span className={`mt-0.5 block text-[10px] font-semibold leading-4 ${s.textFaint}`}>{detail}</span>}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 accent-[#D7897F]"
      />
    </label>
  );
}

export const SalonProfileSection: React.FC<Props> = ({ isDark }) => {
  const s = useSettingsStyles(isDark);
  const { reload } = useCRMContext();
  const [salon, setSalon] = useState<Salon | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!canCallSalonRuntimeApi()) {
      setError("יש להתחבר לסלון כדי לנהל הגדרות עסק.");
      setLoading(false);
      return;
    }
    getSalonProfile()
      .then(({ salon: nextSalon }) => {
        if (cancelled) return;
        setSalon(nextSalon);
        setDraft(draftFromSalon(nextSalon));
        setError(null);
      })
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : String(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  const country = useMemo(
    () => COUNTRIES.find((item) => item.code === draft?.countryCode) ?? COUNTRIES[0],
    [draft?.countryCode],
  );

  const patch = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((current) => current ? { ...current, [key]: value } : current);
    setSaved(false);
  };

  const applyCountrySuggestion = () => {
    if (!draft) return;
    patch("currency", country.currency);
    patch("timezone", country.timezone);
    patch("locale", country.locale);
    patch("defaultLanguage", country.language);
    patch("weekStartsOn", country.weekStartsOn);
  };

  const save = async () => {
    if (!draft || !salon) return;
    if (!draft.name.trim()) {
      setError("שם הסלון נדרש.");
      return;
    }
    if (draft.currency !== salon.currency) {
      const confirmed = window.confirm(
        "שינוי מטבע משפיע על אופן הצגת המחירים. סכומים קיימים לא יומרו אוטומטית. להמשיך?",
      );
      if (!confirmed) return;
    }
    setSaving(true);
    setError(null);
    try {
      const result = await updateSalonProfile(draft);
      setSalon(result.salon);
      setDraft(draftFromSalon(result.salon));
      setSaved(true);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <SettingsPlaceholder isDark={isDark} icon={<Loader2 className="h-5 w-5 animate-spin" />} title="טוענים את הגדרות העסק…" />;
  }
  if (error && !draft) {
    return (
      <SettingsPlaceholder
        isDark={isDark}
        tone="error"
        title="לא ניתן לטעון את הגדרות העסק"
        description={error}
        action={<GhostButton isDark={isDark} onClick={() => window.location.reload()}>נסה שוב</GhostButton>}
      />
    );
  }
  if (!draft) return null;

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className={`text-[11px] font-black uppercase tracking-[0.16em] ${s.textFaint}`}>Business settings</p>
          <h2 className={`mt-1 text-xl font-black ${s.textStrong}`}>הגדרות העסק שלך</h2>
          <p className={`mt-1 text-[12px] font-semibold ${s.textSoft}`}>פרטי הסלון, הגדרות אזור ומידע עסקי במקום אחד.</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#4E8D78]"><Check className="h-3.5 w-3.5" /> נשמר</span>}
          <PrimaryButton onClick={save} disabled={saving}>{saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} שמור שינויים</PrimaryButton>
        </div>
      </div>

      {error && <div className="rounded-xl border border-[#E3B0AA] bg-[#FBEDEA] px-3 py-2 text-[11px] font-semibold text-[#9E4C45]" role="alert">{error}</div>}

      <section className={`overflow-hidden rounded-2xl border ${s.card}`}>
        <SectionHeading icon={<Building2 className="h-4 w-4" />} title="פרופיל הסלון" description="המידע שמזהה את העסק שלך בתוך המערכת וללקוחות." isDark={isDark} />
        <div className="grid gap-4 p-4 lg:grid-cols-[180px_1fr]">
          <div className={`flex flex-col items-center justify-center rounded-xl border border-dashed p-4 text-center ${s.cardSoft}`}>
            {draft.logoUrl ? (
              <img src={draft.logoUrl} alt="" className="h-20 w-20 rounded-2xl object-cover" />
            ) : (
              <span className="grid h-20 w-20 place-items-center rounded-2xl bg-[#F3C3BC] text-xl font-black text-[#9E4C45]">{initialsFromName(draft.name)}</span>
            )}
            <span className={`mt-3 text-[11px] font-black ${s.textStrong}`}>לוגו הסלון</span>
            <span className={`mt-1 text-[10px] font-semibold leading-4 ${s.textFaint}`}>PNG, JPG או WebP עד 5MB. העלאה ישירה תופעל לאחר חיבור אחסון המדיה.</span>
            <span className={`mt-2 inline-flex items-center gap-1 text-[10px] font-bold ${s.textSoft}`}><ImagePlus className="h-3 w-3" /> כרגע אפשר לשמור כתובת תמונה מאובטחת</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="שם תצוגה של הסלון *" value={draft.name} onChange={(value) => patch("name", value)} isDark={isDark} />
            <Field label="שם עסק חוקי" value={draft.businessName ?? ""} onChange={(value) => patch("businessName", value)} isDark={isDark} hint="יופיע במסמכים רשמיים בעתיד." />
            <Field label="איש קשר ראשי" value={draft.primaryContactName ?? ""} onChange={(value) => patch("primaryContactName", value)} isDark={isDark} />
            <Field label="טלפון עסקי" value={draft.phone ?? ""} onChange={(value) => patch("phone", value)} isDark={isDark} type="tel" />
            <Field label="WhatsApp עסקי" value={draft.whatsappPhone ?? ""} onChange={(value) => patch("whatsappPhone", value)} isDark={isDark} type="tel" />
            <Field label="אימייל עסקי" value={draft.email ?? ""} onChange={(value) => patch("email", value)} isDark={isDark} type="email" />
            <Field label="אתר" value={draft.website ?? ""} onChange={(value) => patch("website", value)} isDark={isDark} placeholder="https://" />
            <Field label="קישור ללוגו" value={draft.logoUrl ?? ""} onChange={(value) => patch("logoUrl", value)} isDark={isDark} placeholder="https://" />
            <Field label="Instagram" value={draft.instagramUrl ?? ""} onChange={(value) => patch("instagramUrl", value)} isDark={isDark} placeholder="https://" />
            <Field label="Facebook" value={draft.facebookUrl ?? ""} onChange={(value) => patch("facebookUrl", value)} isDark={isDark} placeholder="https://" />
            <label className="block sm:col-span-2">
              <span className={`text-[11px] font-black ${s.textSoft}`}>תיאור קצר</span>
              <textarea value={draft.description ?? ""} onChange={(event) => patch("description", event.target.value)} rows={3} className={`mt-1 w-full resize-y ${s.input}`} />
            </label>
          </div>
        </div>
      </section>

      <section className={`overflow-hidden rounded-2xl border ${s.card}`}>
        <SectionHeading icon={<MapPin className="h-4 w-4" />} title="מיקום והגדרות אזור" description="אלו קובעים את אזור הזמן, המטבע, התצוגה והקשר העסקי של הסלון." isDark={isDark} />
        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
          <SelectField label="מדינה" value={draft.countryCode} onChange={(value) => patch("countryCode", value as Draft["countryCode"])} options={COUNTRIES.map(({ code, label }) => ({ code, label }))} isDark={isDark} />
          <SelectField label="מטבע" value={draft.currency} onChange={(value) => patch("currency", value as Draft["currency"])} options={CURRENCIES} isDark={isDark} hint="לא ממיר סכומים היסטוריים." />
          <SelectField label="אזור זמן" value={draft.timezone} onChange={(value) => patch("timezone", value)} options={TIMEZONES} isDark={isDark} />
          <div className="sm:col-span-2 lg:col-span-3">
            <div className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border px-3 py-2.5 ${s.cardSoft}`}>
              <span className={`inline-flex items-center gap-2 text-[11px] font-bold ${s.textSoft}`}><Sparkles className="h-3.5 w-3.5 text-[#D7897F]" /> ברירת המחדל המומלצת עבור {country.label}: {country.currency}, {country.timezone}</span>
              <GhostButton isDark={isDark} onClick={applyCountrySuggestion}>החל הצעות אזור</GhostButton>
            </div>
          </div>
          <SelectField label="שפת מערכת" value={draft.defaultLanguage} onChange={(value) => patch("defaultLanguage", value as Draft["defaultLanguage"])} options={[{ code: "he", label: "עברית" }, { code: "en", label: "English" }, { code: "fr", label: "Français" }, { code: "de", label: "Deutsch" }]} isDark={isDark} />
          <SelectField label="Locale לתצוגה" value={draft.locale} onChange={(value) => patch("locale", value)} options={["he-IL", "en-US", "en-GB", "fr-FR", "de-DE", "en-CA", "en-AU"]} isDark={isDark} />
          <SelectField label="יום ראשון בשבוע" value={draft.weekStartsOn} onChange={(value) => patch("weekStartsOn", Number(value))} options={[{ code: "0", label: "יום ראשון" }, { code: "1", label: "יום שני" }, { code: "6", label: "שבת" }]} isDark={isDark} />
          <Field label="מחוז / אזור" value={draft.region ?? ""} onChange={(value) => patch("region", value)} isDark={isDark} />
          <Field label="עיר" value={draft.city ?? ""} onChange={(value) => patch("city", value)} isDark={isDark} />
          <Field label="רחוב" value={draft.street ?? ""} onChange={(value) => patch("street", value)} isDark={isDark} />
          <Field label="מספר בניין" value={draft.streetNumber ?? ""} onChange={(value) => patch("streetNumber", value)} isDark={isDark} />
          <Field label="קומה" value={draft.floor ?? ""} onChange={(value) => patch("floor", value)} isDark={isDark} />
          <Field label="יחידה / סוויטה" value={draft.unit ?? ""} onChange={(value) => patch("unit", value)} isDark={isDark} />
          <Field label="מיקוד" value={draft.postalCode ?? ""} onChange={(value) => patch("postalCode", value)} isDark={isDark} />
          <Field label="קו רוחב" value={draft.latitude?.toString() ?? ""} onChange={(value) => patch("latitude", value === "" ? null : Number(value))} isDark={isDark} type="number" />
          <Field label="קו אורך" value={draft.longitude?.toString() ?? ""} onChange={(value) => patch("longitude", value === "" ? null : Number(value))} isDark={isDark} type="number" />
          <label className="block sm:col-span-2 lg:col-span-3">
            <span className={`text-[11px] font-black ${s.textSoft}`}>הערות כתובת</span>
            <textarea value={draft.addressNotes ?? ""} onChange={(event) => patch("addressNotes", event.target.value)} rows={2} className={`mt-1 w-full resize-y ${s.input}`} />
          </label>
        </div>
      </section>

      <section className={`overflow-hidden rounded-2xl border ${s.card}`}>
        <SectionHeading icon={<ReceiptText className="h-4 w-4" />} title="עסק ומס" description="הגדרות עסקיות ומס כלליות. החישוב הפיננסי עדיין לא מופעל במסך זה." isDark={isDark} />
        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="מספר רישום עסק" value={draft.businessRegistrationNumber ?? ""} onChange={(value) => patch("businessRegistrationNumber", value)} isDark={isDark} />
          <Field label={draft.countryCode === "IL" ? "מספר עוסק / ח.פ." : "Tax ID"} value={draft.taxId ?? ""} onChange={(value) => patch("taxId", value)} isDark={isDark} />
          <SelectField label="סוג העסק" value={draft.businessType ?? ""} onChange={(value) => patch("businessType", value === "" ? null : value as NonNullable<Draft["businessType"]>)} options={[{ code: "", label: "בחר סוג" }, { code: "sole_proprietor", label: "עוסק עצמאי" }, { code: "licensed_business", label: "עסק מורשה" }, { code: "limited_company", label: "חברה בע״מ" }, { code: "partnership", label: "שותפות" }, { code: "other", label: "אחר" }]} isDark={isDark} />
          <Field label={draft.countryCode === "IL" ? "שיעור מע״מ ברירת מחדל (%)" : "שיעור מס ברירת מחדל (%)"} value={draft.defaultTaxRate ?? ""} onChange={(value) => patch("defaultTaxRate", value)} isDark={isDark} type="number" hint="0 עד 100. נשמר כערך עשרוני מדויק." />
          <Field label="קידומת חשבונית" value={draft.invoicePrefix ?? ""} onChange={(value) => patch("invoicePrefix", value)} isDark={isDark} />
          <Field label="קידומת קבלה" value={draft.receiptPrefix ?? ""} onChange={(value) => patch("receiptPrefix", value)} isDark={isDark} />
          <div className="space-y-2 sm:col-span-2 lg:col-span-3">
            <Toggle checked={Boolean(draft.isTaxRegistered)} onChange={(value) => patch("isTaxRegistered", value)} label="העסק רשום למס" detail="המסך יציג את מונח המס המתאים למדינה; אין חישוב חיוב חדש בשלב זה." isDark={isDark} />
            <Toggle checked={draft.pricesIncludeTax !== false} onChange={(value) => patch("pricesIncludeTax", value)} label="המחירים כוללים מס" detail="העדפה להצגה עתידית של מחירים, בלי לשנות מחירי שירות קיימים." isDark={isDark} />
          </div>
        </div>
      </section>

      <div className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-[11px] font-semibold ${s.cardSoft} ${s.textSoft}`}>
        <Globe2 className="h-4 w-4 text-[#D7897F]" />
        הגדרות הזמנה, שעות פעילות והתראות יתווספו כהגדרות נפרדות כשהלוגיקה העסקית שלהן תהיה מחוברת למקור נתונים אמין.
      </div>
    </div>
  );
};

function SectionHeading({ icon, title, description, isDark }: { icon: React.ReactNode; title: string; description: string; isDark: boolean }) {
  const s = useSettingsStyles(isDark);
  return (
    <div className={`flex items-start gap-3 border-b px-4 py-3.5 ${isDark ? "border-white/[0.08] bg-white/[0.025]" : "border-[#EBDDD2] bg-[#FDF5ED]"}`}>
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#F3C3BC]/55 text-[#B05F57]">{icon}</span>
      <span>
        <h3 className={`text-[14px] font-black ${s.textStrong}`}>{title}</h3>
        <p className={`mt-0.5 text-[11px] font-semibold leading-4 ${s.textSoft}`}>{description}</p>
      </span>
    </div>
  );
}
