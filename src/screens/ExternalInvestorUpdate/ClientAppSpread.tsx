import React from "react";
import { FINAL_CLIENT_APP, FINAL_MOBILE, type Localized, type UpdateLang } from "./finalCopy";
import {
  Body,
  Caption,
  Chapter,
  Display,
  Kicker,
  Reveal,
  Rule,
  Spread,
  TermList,
  displayFamily,
  t as text,
} from "./EditorialPrimitives";

type SectionProps = {
  lang: UpdateLang;
  reducedMotion: boolean;
};

/**
 * Retail items, imagery and prices are the salon's real L'Oreal Professionnel
 * catalog rows. Photography: public/catalog-products/loreal-professionnel.
 * Prices: src/data/catalog-brands/l-oreal-professionnel.json (ILS list price).
 * The colour tube is the same asset the CRM inventory screen uses.
 */
const CRM = {
  paper: "#FFFDF8",
  well: "#F7FBF5",
  border: "#EBDDD2",
  ink: "#141414",
  muted: "#7E7066",
  accent: "#B05F57",
  green: "#5F886F",
  menthe: "#96C7B3",
} as const;

const LOREAL = "/catalog-products/loreal-professionnel";

const RETAIL = [
  {
    image: `${LOREAL}/cef28670-dda4-11ef-8e6b-6045bd925463.png`,
    name: "Absolut Repair",
    detail: { en: "Molecular mask · 500 ml", he: "מסכה מולקולרית · 500 מ״ל" },
    price: 150,
    matched: true,
    inBag: true,
  },
  {
    image: `${LOREAL}/c1192c8f-46d8-11ef-8e6b-6045bd925463.png`,
    name: "Vitamino Color",
    detail: { en: "Colour mask · 500 ml", he: "מסכת צבע · 500 מ״ל" },
    price: 200,
    matched: false,
    inBag: true,
  },
  {
    image: `${LOREAL}/5c2c1eec-f689-11ee-bea2-6045bd925463.png`,
    name: "Metal Detox",
    detail: { en: "Anti-metal shampoo", he: "שמפו אנטי־מטאל" },
    price: 150,
    matched: false,
    inBag: false,
  },
] as const;

const BAG_TOTAL = RETAIL.filter((item) => item.inBag).reduce((sum, item) => sum + item.price, 0);
const BAG_COUNT = RETAIL.filter((item) => item.inBag).length;
const ils = (value: number) => `₪${value}`;

/** A phone is a real product surface, so it keeps its own device frame. */
const PhoneFrame: React.FC<{
  children: React.ReactNode;
  label: Localized;
  lang: UpdateLang;
  className?: string;
}> = ({ children, label, lang, className = "" }) => (
  <figure className={`w-full max-w-[17rem] ${className}`}>
    <div className="rounded-[2.1rem] border border-[#2b221b]/18 bg-[#17110d] p-[0.35rem] shadow-[0_22px_44px_rgba(43,34,27,0.18)]">
      <div
        className="relative overflow-hidden rounded-[1.85rem]"
        style={{ background: CRM.paper, color: CRM.ink }}
      >
        <div className="flex items-center justify-between px-5 pb-1 pt-3">
          <span dir="ltr" className="text-[9.5px] font-semibold tabular-nums" style={{ color: CRM.ink }}>
            9:41
          </span>
          <span aria-hidden="true" className="flex items-end gap-[2.5px]">
            {[4, 6, 8, 10].map((h) => (
              <span key={h} className="w-[2.5px] rounded-sm" style={{ height: h, background: CRM.ink, opacity: 0.4 }} />
            ))}
            <span
              className="ms-1 h-[9px] w-[16px] rounded-[3px] border"
              style={{ borderColor: `${CRM.ink}55` }}
            >
              <span className="block h-full w-[70%] rounded-[2px]" style={{ background: CRM.ink, opacity: 0.55 }} />
            </span>
          </span>
        </div>
        {children}
      </div>
    </div>
    <figcaption className="mt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#2b221b]/45">
      {text(label, lang)}
    </figcaption>
  </figure>
);

const Eyebrow: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = CRM.green }) => (
  <p className="text-[8.5px] font-black uppercase tracking-[0.14em]" style={{ color }}>
    {children}
  </p>
);

export const ClientAppSpread: React.FC<SectionProps> = ({ lang, reducedMotion }) => {
  const c = FINAL_CLIENT_APP;
  const he = lang === "he";

  return (
    <Chapter label={text(c.title, lang)} tone="warm" rhythm="feature">
      <Spread>
        <Reveal reducedMotion={reducedMotion}>
          <div className="grid gap-x-14 gap-y-10 lg:grid-cols-[0.34fr_0.66fr] lg:items-center">
            <div>
              <Kicker>{text(c.kicker, lang)}</Kicker>
              <Display lang={lang} size="chapter" className="mt-5 max-w-[18ch]">
                {text(c.title, lang)}
              </Display>
              <Body className="mt-5">{text(c.body, lang)}</Body>

              <Rule className="mt-8" />
              <TermList items={FINAL_MOBILE.roles} lang={lang} className="mt-5" />
              <Body className="mt-2.5">{text(FINAL_MOBILE.line, lang)}</Body>
              <Caption className="mt-5">{text(c.status, lang)}</Caption>
              <Caption className="mt-2">{text(c.dataNote, lang)}</Caption>
            </div>

            <div dir="ltr" className="flex flex-wrap justify-center gap-7 sm:gap-9 lg:justify-end">
              {/* Booking */}
              <PhoneFrame label={c.bookLabel} lang={lang}>
                <div className="px-4 pb-4 pt-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="grid h-7 w-7 place-items-center rounded-full text-[9.5px] font-bold"
                        style={{ background: CRM.menthe, color: "#1c332b" }}
                      >
                        ML
                      </span>
                      <span>
                        <span className="block text-[10.5px] font-semibold leading-tight">
                          {text(c.bookGreeting, lang)}
                        </span>
                        <span className="block text-[8.5px] leading-tight" style={{ color: CRM.muted }}>
                          {text(c.bookMember, lang)}
                        </span>
                      </span>
                    </div>
                    <span className="text-[8.5px] font-black uppercase tracking-[0.12em]" style={{ color: CRM.accent }}>
                      SPECTRA
                    </span>
                  </div>

                  <div
                    className="mt-3.5 rounded-2xl border p-3"
                    style={{ borderColor: CRM.border, background: "#FFFFFF" }}
                  >
                    <Eyebrow>{text(c.bookFormulaLabel, lang)}</Eyebrow>
                    <div className="mt-2 flex items-center gap-2.5">
                      <span
                        className="grid h-12 w-9 shrink-0 place-items-center rounded-lg border"
                        style={{ borderColor: CRM.border, background: CRM.well }}
                      >
                        <img
                          src="/inventory-products/dia-light.png"
                          alt=""
                          aria-hidden="true"
                          className="h-10 w-auto object-contain"
                          loading="lazy"
                        />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[11px] font-semibold leading-tight">
                          Dia Light 9.13 + 8.0
                        </span>
                        <span className="mt-0.5 block text-[8.5px] leading-tight" style={{ color: CRM.muted }}>
                          {text(c.bookLastVisit, lang)}
                        </span>
                        <span className="mt-1 flex items-center gap-1">
                          {["#d8c9a3", "#b49468"].map((tone) => (
                            <span
                              key={tone}
                              aria-hidden="true"
                              className="h-2 w-4 rounded-[2px]"
                              style={{ background: tone }}
                            />
                          ))}
                          <span dir="ltr" className="ms-1 text-[8px] tabular-nums" style={{ color: CRM.muted }}>
                            46.5 g
                          </span>
                        </span>
                      </span>
                    </div>
                  </div>

                  <p className="mt-3.5">
                    <Eyebrow color={CRM.muted}>{text(c.bookSlots, lang)}</Eyebrow>
                  </p>
                  <div className="mt-2 space-y-1.5">
                    {[
                      { day: "Thu 14 Aug", time: "10:30", stylist: "Dana", active: true },
                      { day: "Tue 19 Aug", time: "09:00", stylist: "Dana", active: false },
                      { day: "Wed 20 Aug", time: "13:30", stylist: "Noa", active: false },
                    ].map((slot) => (
                      <span
                        key={slot.day}
                        className="flex items-center justify-between rounded-xl border px-2.5 py-2"
                        style={
                          slot.active
                            ? { borderColor: CRM.ink, background: CRM.ink, color: CRM.paper }
                            : { borderColor: CRM.border, background: "#FFFFFF" }
                        }
                      >
                        <span className="flex items-baseline gap-1.5">
                          <span className="text-[9.5px] font-semibold tabular-nums">{slot.day}</span>
                          <span className="text-[10.5px] font-bold tabular-nums">{slot.time}</span>
                        </span>
                        <span
                          className="text-[8.5px]"
                          style={{ color: slot.active ? "rgba(255,253,248,0.65)" : CRM.muted }}
                        >
                          {slot.stylist}
                        </span>
                      </span>
                    ))}
                  </div>

                  <div
                    className="mt-3.5 flex items-center justify-between border-t pt-2.5"
                    style={{ borderColor: CRM.border }}
                  >
                    <span className="text-[8.5px] uppercase tracking-[0.12em]" style={{ color: CRM.muted }}>
                      {text(c.bookService, lang)}
                    </span>
                    <span dir="ltr" className="text-[10px] font-semibold tabular-nums">
                      2h 15m · {ils(420)}
                    </span>
                  </div>

                  <div
                    className="mt-3 rounded-xl py-2.5 text-center text-[9.5px] font-bold uppercase tracking-[0.14em]"
                    style={{ background: CRM.accent, color: "#FFFDF8" }}
                  >
                    {text(c.bookCta, lang)}
                  </div>
                </div>
              </PhoneFrame>

              {/* Retail */}
              <PhoneFrame label={c.shopLabel} lang={lang}>
                <div className="px-4 pb-4 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold">{text(c.shopHeader, lang)}</span>
                    <span
                      className="flex items-center gap-1 rounded-full px-2 py-[3px] text-[8.5px] font-bold"
                      style={{ background: CRM.ink, color: CRM.paper }}
                    >
                      <span aria-hidden="true">●</span>
                      {BAG_COUNT}
                    </span>
                  </div>

                  <div className="mt-2.5 flex gap-1.5">
                    {[c.shopTabFor, c.shopTabColour, c.shopTabRepair].map((tab, index) => (
                      <span
                        key={tab.en}
                        className="rounded-full px-2.5 py-1 text-[8.5px] font-bold uppercase tracking-[0.08em]"
                        style={
                          index === 0
                            ? { background: CRM.ink, color: CRM.paper }
                            : { border: `1px solid ${CRM.border}`, color: CRM.muted }
                        }
                      >
                        {text(tab, lang)}
                      </span>
                    ))}
                  </div>

                  <ul className="mt-3 space-y-2">
                    {RETAIL.map((item) => (
                      <li
                        key={item.name}
                        className="flex items-center gap-2.5 rounded-2xl border p-2"
                        style={{ borderColor: CRM.border, background: "#FFFFFF" }}
                      >
                        <span
                          className="grid h-14 w-14 shrink-0 place-items-center rounded-xl border"
                          style={{ borderColor: CRM.border, background: CRM.well }}
                        >
                          <img
                            src={item.image}
                            alt={`${item.name}, ${item.detail[lang]}`}
                            className="h-12 w-12 object-contain"
                            loading="lazy"
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          <Eyebrow>{item.matched ? text(c.shopMatched, lang) : "Serie Expert"}</Eyebrow>
                          <span className="mt-1 block truncate text-[10.5px] font-semibold leading-tight">
                            {item.name}
                          </span>
                          <span className="block truncate text-[8.5px] leading-tight" style={{ color: CRM.muted }}>
                            {item.detail[lang]}
                          </span>
                          <span dir="ltr" className="mt-1 block text-[10px] font-bold tabular-nums">
                            {ils(item.price)}
                          </span>
                        </span>
                        <span
                          className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold"
                          style={
                            item.inBag
                              ? { background: CRM.ink, color: CRM.paper }
                              : { border: `1px solid ${CRM.border}`, color: CRM.muted }
                          }
                        >
                          {item.inBag ? "✓" : "+"}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div
                    className="mt-3 flex items-center justify-between border-t pt-2.5"
                    style={{ borderColor: CRM.border }}
                  >
                    <span className="text-[8.5px] uppercase tracking-[0.12em]" style={{ color: CRM.muted }}>
                      {he ? `סל · ${BAG_COUNT} פריטים` : `Bag · ${BAG_COUNT} items`}
                    </span>
                    <span dir="ltr" className="text-[12px] font-bold tabular-nums">
                      {ils(BAG_TOTAL)}
                    </span>
                  </div>
                  <div
                    className="mt-3 rounded-xl py-2.5 text-center text-[9.5px] font-bold uppercase tracking-[0.14em]"
                    style={{ background: CRM.ink, color: CRM.paper }}
                  >
                    {text(c.shopCta, lang)}
                  </div>
                </div>
              </PhoneFrame>
            </div>
          </div>
        </Reveal>
      </Spread>
    </Chapter>
  );
};

export default ClientAppSpread;
