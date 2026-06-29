import React from "react";
import {
  Armchair,
  Brush,
  CalendarDays,
  Check,
  Code2,
  Copy,
  Download,
  Droplets,
  Hourglass,
  Link2,
  LogIn,
  LogOut,
  Palette,
  Plus,
  Scissors,
  Search,
  Settings2,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { CALENDAR_DESIGN_COLORS, CALENDAR_SERVICE_COLORS } from "./schedule/scheduleDesign";

const colors = CALENDAR_DESIGN_COLORS;

const swatches = [
  ["Nectarine", colors.nectarine, "פעולה ראשית / צבע"],
  ["Pêche", colors.peche, "גוונים / הדגשה חמה"],
  ["Menthe", colors.menthe, "חפיפה / רענון"],
  ["Lagune", colors.lagune, "החלקות / קרירות"],
  ["Rose", colors.rose, "טונר / רכות"],
  ["Sauge", colors.sauge, "אחר / ניטרלי חי"],
  ["Lilas", colors.lilas, "תספורות / עדין"],
  ["Paper", colors.paperStrong, "משטח עבודה"],
];

const categories = [
  { label: "צבע", icon: Palette, color: CALENDAR_SERVICE_COLORS.color, count: "2 שירותים" },
  { label: "גוונים", icon: Sparkles, color: CALENDAR_SERVICE_COLORS.highlights, count: "4 שירותים" },
  { label: "טונר", icon: Droplets, color: CALENDAR_SERVICE_COLORS.toner, count: "3 שירותים" },
  { label: "תספורות", icon: Scissors, color: CALENDAR_SERVICE_COLORS.cut, count: "2 שירותים" },
];

const timeline = [
  { icon: LogIn, label: "כניסה לסלון", meta: "09:30 · השעה שנבחרה ביומן", color: colors.peche },
  { icon: UserRound, label: "לקוחה / לקוח", meta: "בחירה, יצירה או לקוח מזדמן", color: colors.nectarine },
  { icon: Brush, label: "הכנסת צבע ומריחה", meta: "15 ד׳ · עובד פעיל", color: colors.peche },
  { icon: Hourglass, label: "המתנה בתהליך", meta: "35 ד׳ · זמן עיבוד", color: "#4D4D4D" },
  { icon: Droplets, label: "חפיפה", meta: "15 ד׳ · עמדת חפיפה", color: colors.menthe },
  { icon: LogOut, label: "יציאה וסיכום", meta: "בדיקת תוצאה וסגירת ביקור", color: colors.peche },
];

const iconAssets = [
  { name: "plus", label: "פלוס", icon: Plus, svg: `<path d="M12 5v14"/><path d="M5 12h14"/>` },
  { name: "calendar", label: "יומן", icon: CalendarDays, svg: `<path d="M8 2v4"/><path d="M16 2v4"/><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18"/>` },
  { name: "client", label: "לקוחה", icon: UserRound, svg: `<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>` },
  { name: "color", label: "צבע", icon: Palette, svg: `<circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 22C6.5 22 2 17.9 2 12.7 2 7.2 6.8 2 12.4 2 17.7 2 22 6 22 11c0 3.2-2 4-4 4h-1.5a2.5 2.5 0 0 0 0 5H17c-1.4 1.2-3 2-5 2Z"/>` },
  { name: "highlights", label: "גוונים", icon: Sparkles, svg: `<path d="m12 3-1.9 5.8L4 11l6.1 2.2L12 19l1.9-5.8L20 11l-6.1-2.2Z"/><path d="M5 3v4"/><path d="M3 5h4"/><path d="M19 17v4"/><path d="M17 19h4"/>` },
  { name: "wash", label: "חפיפה", icon: Droplets, svg: `<path d="M7 16.3c0 2 1.6 3.7 3.7 3.7s3.7-1.7 3.7-3.7c0-2.5-3.7-6.3-3.7-6.3S7 13.8 7 16.3Z"/><path d="M14 8.3C14 10 15.3 11 17 11s3-1 3-2.7C20 6.4 17 3 17 3s-3 3.4-3 5.3Z"/>` },
  { name: "wait", label: "המתנה", icon: Hourglass, svg: `<path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.2a4 4 0 0 0-1.2-2.8L12 12l-3.8 3A4 4 0 0 0 7 17.8V22"/><path d="M7 2v4.2A4 4 0 0 0 8.2 9L12 12l3.8-3A4 4 0 0 0 17 6.2V2"/>` },
  { name: "check-in", label: "כניסה", icon: LogIn, svg: `<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="m10 17 5-5-5-5"/><path d="M15 12H3"/>` },
  { name: "check-out", label: "יציאה", icon: LogOut, svg: `<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>` },
];

const codeSnippets = {
  button: `<button className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#D7897F] px-5 text-[12px] font-black text-white shadow-[0_12px_24px_rgba(215,137,127,0.24)]">
  <Plus className="h-4 w-4" />
  תור חדש
</button>`,
  field: `<div className="flex h-11 items-center gap-2 rounded-2xl border border-[#EBDDD2] bg-white/65 px-3">
  <Search className="h-4 w-4 text-[#9A8B80]" />
  <span className="text-[12px] font-bold text-[#9A8B80]">חיפוש לקוחות...</span>
</div>`,
  category: `<div className="grid gap-2 sm:grid-cols-2">
  <button className="flex items-center justify-between rounded-[18px] border border-[#EFE4DA] bg-[#FFFDF8]/82 p-2.5">
    <span className="grid h-9 w-9 place-items-center rounded-[14px]" style={{ background: color }}>
      <Sparkles className="h-4 w-4" />
    </span>
    <span className="text-[13px] font-black">גוונים</span>
  </button>
</div>`,
  card: `<div className="rounded-[22px] border border-[#EBDDD2] bg-white/72 p-4 shadow-[0_10px_24px_rgba(92,52,35,0.07)]">
  <span className="grid h-10 w-10 place-items-center rounded-2xl" style={{ background: color }}>
    <CalendarDays className="h-5 w-5" />
  </span>
  <p className="mt-3 text-[14px] font-black">תור ביומן</p>
</div>`,
  timeline: `<div className="relative grid grid-cols-[48px_minmax(0,1fr)] gap-3 py-2">
  <span className="grid h-10 w-10 place-items-center rounded-full" style={{ background: color }}>
    <LogIn className="h-[18px] w-[18px]" />
  </span>
  <div className="rounded-2xl bg-[#F8F0E6]/70 px-4 py-2.5">
    <p className="text-[13px] font-black">כניסה לסלון</p>
  </div>
</div>`,
  modal: `<div className="max-w-[620px] rounded-[28px] border border-white/70 bg-[#FFF8F0] shadow-[0_24px_80px_rgba(92,52,35,0.18)]">
  <div className="border-b border-[#EFE4DA] bg-[#FFF9F5] px-5 py-4">רישום תור חדש ביומן</div>
  <div className="bg-[#FFFDF9] p-4">...</div>
</div>`,
  week: `<div className="flex items-center gap-2 rounded-[22px] border border-[#EBDDD2] bg-gradient-to-l from-[#FFF8F0] to-[#F3C3BC]/20 p-1.5">
  <button className="grid h-10 w-10 place-items-center rounded-2xl bg-white/75">›</button>
  <button className="h-10 min-w-[64px] rounded-2xl bg-[#F3C3BC] px-2.5 text-[13px] font-semibold">29 ב׳</button>
  <button className="grid h-10 w-10 place-items-center rounded-2xl bg-white/75">‹</button>
</div>`,
  overlap: `<div className="relative h-24 rounded-2xl border border-[#EBDDD2] bg-[#FFFDF8]">
  <div className="absolute start-2 top-4 w-[calc(50%-12px)] rounded-[18px] bg-[#F9B95C] p-3">שרה · צבע</div>
  <div className="absolute end-2 top-4 w-[calc(50%-12px)] rounded-[18px] bg-[#D7897F] p-3">ליסה · טונר</div>
</div>`,
  icon: `<button onClick={() => downloadIcon("plus", plusSvg)} className="rounded-full bg-white/75 px-3 py-1.5">
  הורדת SVG
</button>`,
};

function downloadIcon(name: string, svgPaths: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#141414" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${svgPaths}</svg>`;
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `spectra-${name}.svg`;
  anchor.click();
  URL.revokeObjectURL(url);
}

const NewCalendarDesignPage: React.FC = () => {
  return (
    <div dir="rtl" className="min-h-full overflow-hidden rounded-[30px] bg-[#F5D3C2] p-4 text-[#141414] sm:p-6 lg:p-8">
      <div
        className="relative mx-auto max-w-[1220px] rounded-[34px] p-[10px] shadow-[0_28px_80px_rgba(92,52,35,0.20)]"
        style={{
          background:
            "radial-gradient(circle at 10% 22%, rgba(150,199,179,0.45), transparent 25%), radial-gradient(circle at 88% 10%, rgba(249,185,92,0.45), transparent 25%), linear-gradient(135deg, #FAD1BF 0%, #F8E1D1 46%, #D9E8DB 100%)",
        }}
      >
        <div className="relative overflow-hidden rounded-[28px] border border-white/70 bg-[#FFF8F0]/94 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
          <header className="border-b border-[#EBDDD2] bg-[#FFF9F5]/86 px-5 py-5 sm:px-7">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#B05F57]">SalonAi · from book to look</p>
                <h1 className="mt-2 text-[32px] font-black tracking-[-0.05em] sm:text-[42px]">
                  סטייל גייד עיצובי
                </h1>
                <p className="mt-2 max-w-[680px] text-[13px] font-semibold leading-6 text-[#7E7066]">
                  ספר רכיבים פנימי לשפת העיצוב של היומן וה־CRM: צבעים, כפתורים, כרטיסים,
                  תפריטי פלוס, טיימליין תור, קטגוריות ושירותים.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <TokenPill label="Light only" />
                <TokenPill label="RTL ready" />
                <TokenPill label="Pastel operational" />
              </div>
            </div>
          </header>

          <main className="space-y-6 p-5 sm:p-7">
            <StyleSection
              eyebrow="01"
              title="צבעים וטוקנים"
              description="הצבעים משמשים בעיקר לקטגוריות, שלבים והדגשות. שירותים עצמם נשארים רגועים וניטרליים."
            >
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {swatches.map(([name, color, usage]) => (
                  <Swatch key={name} name={name} color={color} usage={usage} />
                ))}
              </div>
            </StyleSection>

            <StyleSection
              eyebrow="02"
              title="אייקונים להורדה"
              description="כל האייקונים מבוססי lucide בקו קלאסי. אפשר להוריד SVG נקי למחשב."
              code={codeSnippets.icon}
            >
              <IconLibrary />
            </StyleSection>

            <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <StyleSection eyebrow="03" title="כפתורים ופעולות" description="היררכיה קצרה וברורה: פעולה ראשית, פעולה משנית, פעולה שקטה ופלוס צף." code={codeSnippets.button}>
                <ButtonShowcase />
              </StyleSection>

              <StyleSection eyebrow="04" title="סרגל שבוע וניווט" description="הסרגל העליון מציג את השבוע הנוכחי, היום הנבחר מודגש, והחצים נשארים קבועים וקריאים גם במובייל." code={codeSnippets.week}>
                <WeekStripPreview />
              </StyleSection>
            </div>

            <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <StyleSection eyebrow="05" title="שדות וחיפוש" description="שדות רכים, גבולות חמים ופוקוס עדין בלי עומס." code={codeSnippets.field}>
                <div className="space-y-3">
                  <div className="flex h-11 items-center gap-2 rounded-2xl border border-[#EBDDD2] bg-white/65 px-3">
                    <Search className="h-4 w-4 text-[#9A8B80]" />
                    <span className="text-[12px] font-bold text-[#9A8B80]">חיפוש לקוחות, שירותים או עובדים...</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <FieldPreview label="שם לקוחה" value="ליסה כהן" />
                    <FieldPreview label="משך" value="35 ד׳" />
                  </div>
                </div>
              </StyleSection>

              <StyleSection eyebrow="06" title="קטגוריות ושירותים" description="קטגוריות צבעוניות, שירותים ניטרליים וקומפקטיים. בחירת שירות נפתחת בתוך המקום הנוכחי, בלי scroll פנימי בתוך scroll." code={codeSnippets.category}>
                <CategoryGrid />
              </StyleSection>
            </div>

            <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
              <StyleSection eyebrow="07" title="כרטיסים" description="כרטיסים לבנים-חמים, צל נמוך, פינות גדולות ופרטים תפעוליים קטנים." code={codeSnippets.card}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <ComponentCard
                    icon={CalendarDays}
                    title="תור ביומן"
                    meta="09:30 · 85 ד׳"
                    color={colors.nectarine}
                  />
                  <ComponentCard
                    icon={Armchair}
                    title="משאב"
                    meta="עמדת חפיפה · פנוי"
                    color={colors.menthe}
                  />
                  <AppointmentCard />
                </div>
              </StyleSection>

              <StyleSection eyebrow="08" title="טיימליין קביעת תור" description="מסע אחד בלבד: כניסה, לקוחה, שירותים/תהליך, יציאה. שירות נוסף נכנס כשלבים בתוך אותו מסע בלי להחזיר את המשתמש למעלה." code={codeSnippets.timeline}>
                <TimelinePreview />
              </StyleSection>
            </div>

            <StyleSection eyebrow="09" title="חפיפות וקווי קישור" description="Double booking מוצג חצי־חצי בתוך אותו סלוט. תורי המשך מחוברים בשרשרת לפי סדר השלבים, לא הכול להכול." code={codeSnippets.overlap}>
              <OverlapRulesPreview />
            </StyleSection>

            <StyleSection eyebrow="10" title="מודאל ותפריטי פלוס" description="המודאל ממורכז גם במובייל, רחב מספיק לעבודה, ותפריטי הפלוס נפתחים במקום שבו הפעולה מתרחשת." code={codeSnippets.modal}>
              <ModalPreview />
            </StyleSection>
          </main>
        </div>
      </div>
    </div>
  );
};

function StyleSection({
  eyebrow,
  title,
  description,
  code,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  code?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-[#EBDDD2] bg-[#FFFDF8]/82 p-4 shadow-[0_14px_36px_rgba(92,52,35,0.08)] sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#F3C3BC] text-[11px] font-black text-[#B05F57]">
          {eyebrow}
        </span>
        <div>
          <h2 className="text-[18px] font-black tracking-[-0.03em]">{title}</h2>
          <p className="mt-1 text-[12px] font-semibold leading-5 text-[#7E7066]">{description}</p>
        </div>
        </div>
        {code && <CodeReveal code={code} />}
      </div>
      {children}
    </section>
  );
}

function IconLibrary() {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {iconAssets.map(({ name, label, icon: Icon, svg }) => (
        <div key={name} className="flex items-center justify-between gap-3 rounded-[18px] border border-[#EFE4DA] bg-white/68 p-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#F8F0E6] text-[#141414]">
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-black">{label}</p>
              <p className="truncate text-[10px] font-bold text-[#9A8B80]" dir="ltr">
                spectra-{name}.svg
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => downloadIcon(name, svg)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#FFF8F0] px-3 py-1.5 text-[10px] font-black text-[#B05F57] ring-1 ring-[#EBDDD2] transition hover:bg-[#F3C3BC]/35"
          >
            <Download className="h-3.5 w-3.5" />
            הורדה
          </button>
        </div>
      ))}
    </div>
  );
}

function CodeReveal({ code }: { code: string }) {
  const [open, setOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const copyCode = async () => {
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="w-full sm:w-auto sm:min-w-[220px]">
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex items-center gap-1.5 rounded-full bg-white/75 px-3 py-1.5 text-[10px] font-black text-[#7E7066] ring-1 ring-[#EBDDD2] transition hover:bg-white hover:text-[#141414]"
        >
          <Code2 className="h-3.5 w-3.5" />
          {open ? "הסתר קוד" : "הצג קוד"}
        </button>
        {open && (
          <button
            type="button"
            onClick={copyCode}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#D7897F] px-3 py-1.5 text-[10px] font-black text-white shadow-[0_8px_16px_rgba(215,137,127,0.18)]"
          >
            <Copy className="h-3.5 w-3.5" />
            {copied ? "הועתק" : "העתק"}
          </button>
        )}
      </div>
      {open && (
        <pre dir="ltr" className="mt-2 max-h-56 max-w-full overflow-auto rounded-2xl border border-[#EBDDD2] bg-[#141414] p-3 text-left text-[10px] leading-5 text-[#FFF8F0] shadow-[0_12px_28px_rgba(20,20,20,0.18)]">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}

function Swatch({ name, color, usage }: { name: string; color: string; usage: string }) {
  return (
    <div className="overflow-hidden rounded-[22px] border border-[#EBDDD2] bg-white/58">
      <div className="h-24" style={{ background: color }} />
      <div className="p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[13px] font-black">{name}</p>
          <p className="text-[11px] font-bold text-[#7E7066]" dir="ltr">{color}</p>
        </div>
        <p className="mt-1 text-[11px] font-semibold text-[#9A8B80]">{usage}</p>
      </div>
    </div>
  );
}

function ButtonShowcase() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#D7897F] px-5 text-[12px] font-black text-white shadow-[0_12px_24px_rgba(215,137,127,0.24)]">
        <Plus className="h-4 w-4" />
        תור חדש
      </button>
      <button className="inline-flex h-11 items-center gap-2 rounded-2xl bg-white/75 px-5 text-[12px] font-black text-[#B05F57] ring-1 ring-[#EBDDD2]">
        <Settings2 className="h-4 w-4" />
        הגדרות
      </button>
      <button className="inline-flex h-10 items-center gap-2 rounded-full bg-[#F8F0E6] px-4 text-[11px] font-black text-[#7E7066]">
        <Check className="h-3.5 w-3.5" />
        פעולה שקטה
      </button>
      <button className="grid h-11 w-11 place-items-center rounded-full border border-white/80 bg-[#FFF8F0] text-[#B05F57] shadow-[0_10px_22px_rgba(215,137,127,0.14)] ring-4 ring-[#F3C3BC]/28">
        <Plus className="h-[18px] w-[18px]" />
      </button>
    </div>
  );
}

function FieldPreview({ label, value }: { label: string; value: string }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-bold text-[#7E7066]">{label}</span>
      <span className="rounded-xl border border-[#EBDDD2] bg-[#FFF8F0] px-3 py-2 text-[12px] font-black">
        {value}
      </span>
    </label>
  );
}

function WeekStripPreview() {
  const days = ["28 א׳", "29 ב׳", "30 ג׳", "1 ד׳", "2 ה׳", "3 ו׳", "4 שבת"];
  return (
    <div className="flex items-center gap-2 rounded-[22px] border border-[#EBDDD2]/80 bg-gradient-to-l from-[#FFF8F0]/90 via-[#F8F0E6]/70 to-[#F3C3BC]/20 p-1.5 shadow-[0_14px_34px_rgba(92,52,35,0.08)]">
      <button className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-[#EBDDD2] bg-white/75 text-[#7E7066]">
        <ChevronRightLike />
      </button>
      <div className="flex min-w-0 flex-1 items-center justify-center gap-2 overflow-x-auto px-2">
        {days.map((day) => (
          <span
            key={day}
            className={`flex h-10 min-w-[64px] items-center justify-center rounded-2xl px-2.5 text-[13px] font-semibold ${
              day === "29 ב׳" ? "bg-[#F3C3BC] text-[#141414] shadow-[0_10px_24px_rgba(215,137,127,0.22)]" : "text-[#6F625A]"
            }`}
          >
            {day}
          </span>
        ))}
      </div>
      <button className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-[#EBDDD2] bg-white/75 text-[#7E7066]">
        <ChevronLeftLike />
      </button>
    </div>
  );
}

function CategoryGrid() {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {categories.map(({ label, icon: Icon, color, count }) => (
        <div key={label} className="overflow-hidden rounded-[18px] border border-[#EFE4DA] bg-[#FFFDF8]/82">
          <button className="flex w-full items-center justify-between gap-2 p-2.5 text-right">
            <span className="flex min-w-0 items-center gap-2">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[14px] text-[#141414]" style={{ background: color }}>
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-black">{label}</span>
                <span className="mt-0.5 block text-[10px] font-bold text-[#141414]/58">{count}</span>
              </span>
            </span>
            <span className="rounded-full px-2.5 py-0.5 text-[10px] font-black" style={{ background: color }}>
              פתח
            </span>
          </button>
        </div>
      ))}
      <div className="rounded-[18px] border border-[#EFE4DA] bg-white/70 p-3 sm:col-span-2">
        <div className="relative flex min-h-[58px] items-center justify-between gap-3 overflow-hidden rounded-[14px] border border-[#EFE4DA] bg-white/75 p-2.5">
          <span className="absolute inset-y-3 start-0 w-1 rounded-full" style={{ background: CALENDAR_SERVICE_COLORS.highlights }} />
          <span>
            <span className="block text-[12px] font-black">גוונים לאורכים</span>
            <span className="mt-1 block text-[11px] font-bold text-[#141414]/62">80 ד׳ · שירות ניטרלי עם פס קטגוריה</span>
          </span>
          <span className="rounded-full bg-[#F8F0E6] px-2 py-1 text-[10px] font-black">₪420</span>
        </div>
      </div>
    </div>
  );
}

function ComponentCard({
  icon: Icon,
  title,
  meta,
  color,
}: {
  icon: React.ElementType;
  title: string;
  meta: string;
  color: string;
}) {
  return (
    <div className="rounded-[22px] border border-[#EBDDD2] bg-white/72 p-4 shadow-[0_10px_24px_rgba(92,52,35,0.07)]">
      <span className="grid h-10 w-10 place-items-center rounded-2xl text-[#141414]" style={{ background: color }}>
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-3 text-[14px] font-black">{title}</p>
      <p className="mt-1 text-[11px] font-bold text-[#7E7066]">{meta}</p>
    </div>
  );
}

function AppointmentCard() {
  return (
    <div className="rounded-[22px] bg-[#D7897F] p-4 text-[#141414] shadow-[0_12px_26px_rgba(215,137,127,0.22)] sm:col-span-2">
      <p className="text-[10px] font-black opacity-70">09:30 - 11:00</p>
      <div className="mt-2 flex items-start justify-between gap-3">
        <div>
          <p className="text-[15px] font-black">ליסה כהן</p>
          <p className="mt-1 text-[12px] font-bold opacity-75">צבע שורש + חפיפה</p>
        </div>
        <span className="grid h-9 w-9 place-items-center rounded-full bg-white/22 text-[11px] font-black">LK</span>
      </div>
    </div>
  );
}

function OverlapRulesPreview() {
  return (
    <div className="space-y-4">
      <div className="relative h-28 rounded-[22px] border border-[#EBDDD2] bg-[#FFFDF8] p-3">
        <div className="absolute start-3 top-6 w-[calc(50%-16px)] rounded-[18px] bg-[#F9B95C] p-3 shadow-[0_10px_22px_rgba(92,52,35,0.08)]">
          <p className="text-[11px] font-black">10:00 · שרה</p>
          <p className="mt-1 text-[10px] font-bold text-[#141414]/70">צבע שורש</p>
        </div>
        <div className="absolute end-3 top-6 w-[calc(50%-16px)] rounded-[18px] bg-[#D7897F] p-3 shadow-[0_10px_22px_rgba(92,52,35,0.08)]">
          <p className="text-[11px] font-black">10:15 · ליסה</p>
          <p className="mt-1 text-[10px] font-bold text-[#141414]/70">טונר</p>
        </div>
      </div>
      <div className="rounded-[22px] border border-[#EBDDD2] bg-white/65 p-4">
        <div className="flex items-center gap-2 text-[12px] font-black text-[#141414]">
          <Link2 className="h-4 w-4 text-[#B05F57]" />
          קווי המשך לפי סדר השלבים
        </div>
        <p className="mt-2 text-[11px] font-semibold leading-5 text-[#7E7066]">
          תור ראשי גורר את כל השרשרת תוך שמירת יחס העובדים. גרירת המשך מזיזה רק את אותו בלוק ומעדכנת את זמן ההמתנה לפניו.
        </p>
      </div>
    </div>
  );
}

function TimelinePreview() {
  return (
    <div className="relative rounded-[24px] border border-[#EBDDD2] bg-[#FFFDF8]/82 p-4">
      <div className="absolute bottom-8 start-[25px] top-8 w-px border-s border-dashed border-[#EBDDD2]" />
      {timeline.map(({ icon: Icon, label, meta, color }) => (
        <div key={label} className="relative grid grid-cols-[48px_minmax(0,1fr)] gap-3 py-2">
          <div className="relative z-10 flex justify-center">
            <span
              className={`grid h-10 w-10 place-items-center rounded-full border border-white/70 shadow-[0_10px_22px_rgba(92,52,35,0.10)] ${
                color === "#4D4D4D" ? "text-white" : "text-[#141414]"
              }`}
              style={{ background: color }}
            >
              <Icon className="h-[18px] w-[18px]" />
            </span>
          </div>
          <div className="rounded-2xl bg-[#F8F0E6]/70 px-4 py-2.5">
            <p className="text-[13px] font-black">{label}</p>
            <p className="mt-1 text-[11px] font-bold text-[#7E7066]">{meta}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ModalPreview() {
  return (
    <div className="mx-auto max-w-[620px] rounded-[28px] border border-white/70 bg-[#FFF8F0] shadow-[0_24px_80px_rgba(92,52,35,0.18)]">
      <div className="flex items-center justify-between border-b border-[#EFE4DA] bg-[#FFF9F5] px-5 py-4">
        <div>
          <p className="text-[15px] font-black">רישום תור חדש ביומן</p>
          <p className="mt-1 text-[11px] font-bold text-[#9A8B80]">דניאלה רות · 09:30</p>
        </div>
        <button className="grid h-8 w-8 place-items-center rounded-xl bg-white/70 text-[#7E7066]">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="bg-[#FFFDF9] p-4">
        <div className="rounded-[24px] border border-[#EBDDD2] bg-white/50 p-3">
          <div className="flex items-center gap-2">
            <button className="grid h-10 w-10 place-items-center rounded-full border border-white/80 bg-[#FFF8F0] text-[#B05F57] shadow-[0_10px_22px_rgba(215,137,127,0.12)]">
              <Plus className="h-4 w-4" />
            </button>
            <div>
              <p className="text-[13px] font-black">הוספת שירות</p>
              <p className="text-[11px] font-bold text-[#7E7066]">בחירה במקום הנוכחי, ללא גלילה פנימית</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {["שירות", "גוונים", "טונר", "תספורת"].map((item, index) => (
              <span
                key={item}
                className={`rounded-full px-3 py-1.5 text-[11px] font-black ${
                  index === 0 ? "bg-[#D7897F] text-white" : "bg-white/75 text-[#7E7066] ring-1 ring-[#EFE4DA]"
                }`}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChevronRightLike() {
  return <span className="text-[18px] leading-none">›</span>;
}

function ChevronLeftLike() {
  return <span className="text-[18px] leading-none">‹</span>;
}

function TokenPill({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-white/65 px-3 py-1.5 text-[11px] font-black text-[#7E7066] ring-1 ring-[#EBDDD2]">
      {label}
    </span>
  );
}

export default NewCalendarDesignPage;
