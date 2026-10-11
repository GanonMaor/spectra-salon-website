import React from "react";
import {
  Box,
  Brain,
  Building2,
  Calendar,
  CalendarClock,
  ClipboardList,
  CreditCard,
  DollarSign,
  EyeOff,
  Factory,
  FlaskConical,
  Heart,
  Layers,
  LineChart,
  Monitor,
  Package,
  Paintbrush,
  Rocket,
  Scale,
  ScanSearch,
  Scissors,
  ShoppingBag,
  Sparkles,
  Store,
  Truck,
  User,
  Users,
  Warehouse,
  Wrench,
} from "lucide-react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { CB, CB_INK, inkGold } from "../../colorBarTokens";
import type { UpdateLang } from "../../finalCopy";
import { GlowField, OrbHalo } from "./CinematicKit";
import { Flow } from "./DeckDiagrams";
import { Foot, IdeaMark, Spectra, WireSlide } from "./NarrativeKit";
import { ScrollStage } from "./ScrollChoreography";

/** Opacity-only build: no y-offset, no scale, no layout animation — just presence. */
const BuildFade: React.FC<{
  at: number;
  progress: MotionValue<number>;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ at, progress, style, children }) => {
  const opacity = useTransform(progress, [at - 0.1, at], [0, 1]);
  return <motion.div style={{ opacity, ...style }}>{children}</motion.div>;
};

export const BrandBlindSpotWebSlide: React.FC<{ lang: UpdateLang }> = ({ lang }) => {
  const he = lang === "he";
  const viewpoints = he
    ? [
        { who: "הסלון", sees: "רואה את ההזמנה", icon: Calendar },
        { who: "המותג", sees: "רואה את המכירה", icon: ShoppingBag },
        { who: "הנקודה העיוורת", sees: "אף אחד לא רואה את השירות האמיתי", icon: EyeOff, accent: true },
      ]
    : [
        { who: "SALON", sees: "Sees the booking", icon: Calendar },
        { who: "BRAND", sees: "Sees the sale", icon: ShoppingBag },
        { who: "THE BLIND SPOT", sees: "Neither sees the real service", icon: EyeOff, accent: true },
      ];
  return (
    <WireSlide
      id="web-deck-brand-blind-spot"
      lang={lang}
      index={{ en: "06", he: "06" }}
      tone="ink"
      skin="ink"
      bleed={<GlowField x={76} y={48} size={58} count={12} />}
      kicker={{
        en: "The missing link in professional beauty",
        he: "החוליה החסרה בתעשיית היופי המקצועית",
      }}
      headline={
        he ? (
          <>
            הסלון רואה את ההזמנה. המותג רואה את המכירה.
            <span style={{ display: "block", color: CB_INK.gold }}>אף אחד לא רואה את השירות האמיתי.</span>
          </>
        ) : (
          <>
            Salon sees the booking. Brand sees the sale.
            <span style={{ display: "block", color: CB_INK.gold }}>Neither sees the real service.</span>
          </>
        )
      }
      label={{
        en: "Salon sees the booking. Brand sees the sale. Neither sees the real service.",
        he: "הסלון רואה את ההזמנה. המותג רואה את המכירה. אף אחד לא רואה את השירות האמיתי.",
      }}
      cinematicImage="/investor/generated/investor-slide-06-cinematic.png"
      cinematicPosition="68% center"
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 24, flex: 1, alignItems: "center" }}>
        {viewpoints.map((item) => (
          <div
            key={item.who}
            style={{
              minHeight: 250,
              padding: "38px 34px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              border: `1px solid ${item.accent ? inkGold(0.65) : CB_INK.lineStrong}`,
              background: item.accent ? "rgba(198,162,99,0.08)" : "rgba(255,255,255,0.025)",
            }}
          >
            <IdeaMark dark icon={item.icon} label={item.who} accent={item.accent} />
            <p style={{ margin: 0, color: item.accent ? CB_INK.ink : CB_INK.muted, fontSize: 31, fontWeight: 600, lineHeight: 1.2 }}>
              {item.sees}
            </p>
          </div>
        ))}
      </div>
      <Foot>
        {he ? "Spectra מודדת את מה שבאמת נעשה, נצרך ועלה." : "Spectra measures what was actually done, consumed and cost."}
      </Foot>
    </WireSlide>
  );
};

export const BowlDataWebSlide: React.FC<{ lang: UpdateLang }> = ({ lang }) => {
  const he = lang === "he";
  const points = [
    { label: he ? "המוצר" : "The product", hint: he ? "איזו שפופרת נפתחה" : "Which tube was opened", icon: FlaskConical },
    { label: he ? "הכמות" : "The quantity", hint: he ? "כמה גרם נמדדו" : "How many grams were used", icon: Scale },
    { label: he ? "השירות" : "The service", hint: he ? "מה באמת נעשה" : "What was actually done", icon: Paintbrush },
    { label: he ? "איש המקצוע" : "The professional", hint: he ? "מי ערבב וביצע" : "Who mixed and performed it", icon: Scissors },
    { label: he ? "הלקוחה" : "The client", hint: he ? "מי קיבלה את השירות" : "Who received the service", icon: Heart },
    { label: he ? "התדירות" : "The frequency", hint: he ? "מתי היא חוזרת" : "How often she comes back", icon: CalendarClock },
    { label: he ? "המלאי" : "The inventory", hint: he ? "מה ירד מהמדף" : "What left the shelf", icon: Warehouse },
    { label: he ? "הרכישה הבאה" : "The next purchase", hint: he ? "מה כדאי להזמין עכשיו" : "What should be ordered next", icon: ShoppingBag },
  ];
  return (
    <ScrollStage heightVh={1.9}>
      {(progress) => (
        <WireSlide
          id="web-deck-bowl-data"
          lang={lang}
          index={{ en: "07", he: "07" }}
          tone="ink"
          skin="ink"
          bleed={<GlowField x={50} y={50} size={70} count={24} />}
          kicker={{
            en: "Without intending to — we built a data layer no one else held",
            he: "בלי שהתכוונו — בנינו שכבת דאטה שאף אחד אחר לא החזיק",
          }}
          headline={he ? "כל קערה הפכה לנקודת דאטה." : "Every bowl became a data point."}
          label={{ en: "Every bowl became a data point.", he: "כל קערה הפכה לנקודת דאטה." }}
          cinematicImage="/investor/generated/investor-slide-07-cinematic.png"
          cinematicPosition="68% center"
        >
      <div className="deck-orb-split" style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center", gap: 22 }}>
        <div style={{ flexShrink: 0, width: 150, display: "grid", placeItems: "center", gap: 10 }}>
          <OrbHalo size={148} />
          <p style={{ margin: 0, color: CB_INK.gold, fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", textAlign: "center" }}>
            {he ? "קערה אחת" : "One bowl"}
          </p>
        </div>
        <div className="deck-icon-grid" style={{ flex: 1, minWidth: 0, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {points.map((point, index) => (
            <BuildFade key={point.label} at={0.16 + index * 0.08} progress={progress}>
              <div
                style={{
                  padding: "12px 14px",
                  border: "1px solid rgba(198,162,99,0.28)",
                  background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015))",
                }}
              >
                <IdeaMark dark icon={point.icon} label={point.label} hint={point.hint} />
              </div>
            </BuildFade>
          ))}
        </div>
      </div>
      <BuildFade at={0.92} progress={progress}>
        <p style={{ margin: 0, color: CB_INK.muted, fontSize: 19, lineHeight: 1.4 }}>
          {he
            ? "וכבר היום בישראל אפשר להשתמש במידע הזה כדי לעזור ליצרנים ולמפיצים להבין שימוש אמיתי בשטח."
            : "And already today in Israel this information can be used to help manufacturers and distributors understand real usage on the floor."}
        </p>
      </BuildFade>
      <BuildFade at={0.92} progress={progress}>
        <Foot>
          {he ? (
            <>
              <span style={{ color: CB_INK.ink }}>לא בנינו סקר.</span>
              <span style={{ display: "block", color: CB_INK.gold, marginTop: 8 }}>בנינו שכבת מדידה חיה.</span>
            </>
          ) : (
            <>
              <span style={{ color: CB_INK.ink }}>We didn’t build a survey.</span>
              <span style={{ display: "block", color: CB_INK.gold, marginTop: 8 }}>We built a live measurement layer.</span>
            </>
          )}
        </Foot>
      </BuildFade>
        </WireSlide>
      )}
    </ScrollStage>
  );
};

export const WhyStopWebSlide: React.FC<{ lang: UpdateLang }> = ({ lang }) => {
  const he = lang === "he";
  const expansion = he
    ? [
        { label: "צבע", hint: "האמת התפעולית הראשונה", icon: Paintbrush },
        { label: "לקוחות", hint: "מי חוזרת ומתי", icon: Heart },
        { label: "צוות", hint: "מי מבצע את העבודה", icon: Users },
        { label: "יומן", hint: "מתי הכיסא פנוי", icon: Calendar },
        { label: "מלאי", hint: "מה ירד מהמדף", icon: Warehouse },
        { label: "פיננסים", hint: "כמה באמת הרווחנו", icon: DollarSign },
      ]
    : [
        { label: "Color", hint: "The first measured truth", icon: Paintbrush },
        { label: "Clients", hint: "Who comes back, and when", icon: Heart },
        { label: "Team", hint: "Who does the work", icon: Users },
        { label: "Calendar", hint: "When the chair is free", icon: Calendar },
        { label: "Inventory", hint: "What left the shelf", icon: Warehouse },
        { label: "Financials", hint: "What was actually earned", icon: DollarSign },
      ];
  return (
    <WireSlide
      id="web-deck-why-stop"
      lang={lang}
      index={{ en: "08", he: "08" }}
      tone="warm"
      kicker={{ en: "From the wedge to the platform", he: "מנקודת הכניסה אל הפלטפורמה" }}
      displaySize="statement"
      headline={
        he
          ? "הפכנו את הצבע לגלוי. עכשיו הגיע הזמן ל-Salon AI."
          : "We made color visible. Now it’s time for Salon AI."
      }
      label={{
        en: "We made color visible. Now it’s time for Salon AI.",
        he: "הפכנו את הצבע לגלוי. עכשיו הגיע הזמן ל-Salon AI.",
      }}
      cinematicImage="/investor/generated/investor-slide-08-cinematic.png"
      cinematicPosition="96% 30%"
      cinematicFade
    >
      <div className="deck-icon-grid" style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, alignContent: "center" }}>
        {expansion.map((node, index) => (
          <IdeaMark key={node.label} stacked icon={node.icon} label={node.label} hint={node.hint} accent={index === expansion.length - 1} />
        ))}
      </div>
      <Foot>{he ? "נקודת כניסה אחת הופכת למערכת הפעלה שלמה." : "One wedge becomes a complete operating system."}</Foot>
    </WireSlide>
  );
};

export const SalonAiExpansionWebSlide: React.FC<{ lang: UpdateLang }> = ({ lang }) => {
  const he = lang === "he";
  const points = [
    { label: he ? "לקוחות" : "Clients", hint: he ? "מי היא ומה היא צריכה" : "Who she is and what she needs", icon: User },
    { label: he ? "צוות" : "Team", hint: he ? "מי יכול לבצע את העבודה" : "Who can do the work", icon: Users },
    { label: he ? "יומן" : "Calendar", hint: he ? "מתי הכיסא פנוי" : "When the chair is free", icon: Calendar },
    { label: he ? "מלאי" : "Inventory", hint: he ? "מה יש על המדף" : "What is on the shelf", icon: Box },
    { label: he ? "פיננסים" : "Financials", hint: he ? "כמה השירות באמת הרוויח" : "What the service actually earned", icon: DollarSign },
  ];
  return (
    <ScrollStage heightVh={1.7}>
      {(progress) => (
        <WireSlide
          id="web-deck-salon-ai-expansion"
          lang={lang}
          index={{ en: "09", he: "09" }}
          tone="ink"
          skin="ink"
          bleed={<GlowField x={50} y={48} size={78} count={40} />}
          kicker={{
            en: "One intelligence layer for the whole salon",
            he: "שכבת אינטליגנציה אחת לכל הסלון",
          }}
          displaySize="statement"
          headline={he ? "Salon AI מנהלת סביב העבודה האמיתית." : "Salon AI runs around the real work."}
          label={{
            en: "Salon AI runs around the real work.",
            he: "Salon AI מנהלת סביב העבודה האמיתית.",
          }}
          cinematicImage="/investor/generated/investor-slide-09-cinematic.png"
          cinematicPosition="70% center"
        >
      <div className="deck-orb-split" style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center", gap: 22 }}>
        <div style={{ flexShrink: 0, width: 150, display: "grid", placeItems: "center", gap: 10 }}>
          <OrbHalo size={148} />
          <p dir="ltr" style={{ margin: 0, color: CB_INK.gold, fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textAlign: "center" }}>
            SALON AI
          </p>
        </div>
        <div style={{ flex: 1, minWidth: 0, display: "grid", gap: 12 }}>
          <div className="deck-icon-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
            {points.slice(0, 3).map((point, index) => (
              <BuildFade key={point.label} at={0.18 + index * 0.12} progress={progress}>
                <IdeaMark dark stacked icon={point.icon} label={point.label} hint={point.hint} />
              </BuildFade>
            ))}
          </div>
          <div className="deck-icon-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {points.slice(3).map((point, index) => (
              <BuildFade key={point.label} at={0.54 + index * 0.12} progress={progress}>
                <IdeaMark dark stacked icon={point.icon} label={point.label} hint={point.hint} accent={index === 1} />
              </BuildFade>
            ))}
          </div>
        </div>
      </div>
      <BuildFade at={0.88} progress={progress}>
        <Foot>{he ? "אותו הקשר מחבר לקוחות, צוות, יומן, מלאי ופיננסים." : "One context connects clients, team, calendar, inventory and financials."}</Foot>
      </BuildFade>
        </WireSlide>
      )}
    </ScrollStage>
  );
};

export const CommercePositionWebSlide: React.FC<{ lang: UpdateLang }> = ({ lang }) => {
  const he = lang === "he";
  return (
    <WireSlide
      id="web-deck-commerce-position"
      lang={lang}
      index={{ en: "10", he: "10" }}
      tone="warm"
      kicker={{ en: "Two transactions. One connected position.", he: "שתי עסקאות. עמדה מחוברת אחת." }}
      displaySize="statement"
      headline={he ? "Spectra נמצאת בשתי העסקאות החשובות." : "Spectra sits at both transactions."}
      label={{
        en: "Spectra sits at both transactions.",
        he: "Spectra נמצאת בשתי העסקאות החשובות.",
      }}
      cinematicImage="/investor/generated/investor-slide-10-cinematic.png"
      cinematicPosition="70% center"
    >
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, justifyContent: "center", gap: 46 }}>
        <Flow
          size="lg"
          nodes={[
            { label: he ? "מותג" : "BRAND", icon: Factory },
            { label: he ? "סלון" : "SALON", icon: Store, accent: true },
            { label: he ? "לקוחה" : "CLIENT", icon: User },
          ]}
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 34, maxWidth: 1200 }}>
          {(he
            ? [
                ["מותג ← סלון", "רכש, מלאי ומוצרים"],
                ["סלון → לקוחה", "המלצה, שירות ורכישה"],
              ]
            : [
                ["BRAND → SALON", "Procurement, inventory and products"],
                ["SALON → CLIENT", "Recommendation, service and purchase"],
              ]
          ).map(([title, detail]) => (
            <div key={title} style={{ padding: "28px 30px", borderTop: `2px solid ${CB.copperDeep}` }}>
              <p dir="ltr" style={{ margin: 0, color: CB.ink, fontSize: 28, fontWeight: 700 }}>{title}</p>
              <p style={{ margin: "12px 0 0", color: CB.muted, fontSize: 21 }}>{detail}</p>
            </div>
          ))}
        </div>
      </div>
      <Foot>{he ? "Spectra מחברת בין רכישת המוצר לבין תוצאת השירות." : "Spectra connects the product purchase to the service outcome."}</Foot>
    </WireSlide>
  );
};

export const IndustryLayerWebSlide: React.FC<{ lang: UpdateLang }> = ({ lang }) => {
  const he = lang === "he";
  return (
    <WireSlide
      id="web-deck-industry-layer"
      lang={lang}
      index={{ en: "11", he: "11" }}
      kicker={{
        en: "The disconnected industry chain",
        he: "שרשרת תעשייה שאינה מחוברת",
      }}
      displaySize="statement"
      headline={
        he
          ? "כל שלב רואה רק את העסקה שלו. Spectra יכולה לחבר את השרשרת."
          : "Each step sees only its own transaction. Spectra can connect the chain."
      }
      label={{
        en: "Each step sees only its own transaction. Spectra can connect the chain.",
        he: "כל שלב רואה רק את העסקה שלו. Spectra יכולה לחבר את השרשרת.",
      }}
      cinematicImage="/investor/generated/investor-slide-11-cinematic.png"
      cinematicPosition="72% center"
    >
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, justifyContent: "center", gap: 34 }}>
        <div className="deck-icon-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
          {(he
            ? [
                { label: "מותג", hint: "מוכר את המוצר", icon: Factory },
                { label: "מפיץ", hint: "מעביר את המלאי", icon: Truck },
                { label: "סלון", hint: "קונה ומחזיק", icon: Store },
                { label: "איש מקצוע", hint: "מערבב ומבצע", icon: Scissors },
                { label: "שירות", hint: "מה שנעשה בפועל", icon: Sparkles },
                { label: "לקוחה", hint: "מי שקיבלה אותו", icon: User },
              ]
            : [
                { label: "Brand", hint: "Sells the product", icon: Factory },
                { label: "Distributor", hint: "Moves the inventory", icon: Truck },
                { label: "Salon", hint: "Buys and holds it", icon: Store },
                { label: "Professional", hint: "Mixes and performs", icon: Scissors },
                { label: "Service", hint: "What was actually done", icon: Sparkles },
                { label: "Client", hint: "Who received it", icon: User },
              ]
          ).map((node, index) => (
            <IdeaMark key={node.label} stacked icon={node.icon} label={node.label} hint={node.hint} accent={index === 2} />
          ))}
        </div>
        <div style={{ position: "relative", marginTop: 24, paddingTop: 18 }}>
          <div aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, top: 0, height: 1, background: CB.copperDeep, opacity: 0.4 }} />
          <p style={{ margin: 0, color: CB.copperDeep, fontSize: 32, fontWeight: 650, letterSpacing: "-0.03em" }}>
            <Spectra /> {he ? "— שכבת אינטליגנציה אחת לאורך כל השרשרת" : "— one intelligence layer across the entire chain"}
          </p>
        </div>
      </div>
      <Foot>{he ? "מהמוצר שנמכר ועד השירות שבוצע בפועל." : "From the product sold to the service actually performed."}</Foot>
    </WireSlide>
  );
};

export const MarketLayersWebSlide: React.FC<{ lang: UpdateLang }> = ({ lang }) => {
  const he = lang === "he";
  return (
    <WireSlide
      id="web-deck-market-layers"
      lang={lang}
      index={{ en: "12", he: "12" }}
      tone="chalk"
      kicker={{ en: "One position across three value layers", he: "עמדה אחת על פני שלוש שכבות ערך" }}
      headline={he ? "שירותים. מוצרים. אינטליגנציה." : "Services. Products. Intelligence."}
      label={{ en: "Services. Products. Intelligence.", he: "שירותים. מוצרים. אינטליגנציה." }}
      cinematicImage="/investor/generated/investor-slide-12-cinematic.png"
      cinematicPosition="70% center"
    >
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 24, alignItems: "center" }}>
        {(he
          ? [
              { value: "$285B", title: "שירותי סלון", detail: "המקום שבו העבודה והלקוחה נפגשות", icon: Scissors },
              { value: "$636B", title: "מוצרי ביוטי", detail: "המוצרים שנמכרים ונצרכים סביב השירות", icon: Package },
              { value: "LIVE DATA", title: "אינטליגנציה", detail: "מה בוצע, נצרך ונדרש בהמשך", icon: Brain },
            ]
          : [
              { value: "$285B", title: "SALON SERVICES", detail: "Where the work and the client meet", icon: Scissors },
              { value: "$636B", title: "BEAUTY PRODUCTS", detail: "What is sold and consumed around the service", icon: Package },
              { value: "LIVE DATA", title: "INTELLIGENCE", detail: "What happened, what was used and what comes next", icon: Brain },
            ]
        ).map((layer, index) => (
          <div
            key={layer.title}
            style={{
              minHeight: 300,
              padding: "38px 34px",
              border: `1px solid ${index === 2 ? CB.copperDeep : CB.lineStrong}`,
              background: index === 2 ? CB.copperSoft : "rgba(251,250,247,0.72)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <IdeaMark icon={layer.icon} label={layer.title} accent={index === 2} />
              <p dir="ltr" style={{ margin: "22px 0 0", color: index === 2 ? CB.copperDeep : CB.ink, fontSize: 52, fontWeight: 700, letterSpacing: "-0.05em" }}>
                {layer.value}
              </p>
            </div>
            <p style={{ margin: 0, color: CB.muted, fontSize: 21, lineHeight: 1.4 }}>{layer.detail}</p>
          </div>
        ))}
      </div>
      <Foot>{he ? "Spectra מחברת את שלוש השכבות דרך הסלון." : "Spectra connects all three through the salon."}</Foot>
    </WireSlide>
  );
};

export const RevenueLayersWebSlide: React.FC<{ lang: UpdateLang }> = ({ lang }) => {
  const he = lang === "he";
  return (
    <WireSlide
      id="web-deck-revenue-layers"
      lang={lang}
      index={{ en: "13", he: "13" }}
      kicker={{ en: "The business model expands with the customer", he: "המודל העסקי מתרחב עם הלקוח" }}
      displaySize="statement"
      headline={he ? "אותו סלון. יותר ערך. יותר הכנסה." : "Same salon. More value. More revenue."}
      label={{ en: "Same salon. More value. More revenue.", he: "אותו סלון. יותר ערך. יותר הכנסה." }}
      cinematicImage="/investor/generated/investor-slide-13-cinematic.png"
      cinematicPosition="72% center"
    >
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 18, alignItems: "center" }}>
        {(he
          ? [
              { number: "01", title: "מנוי תוכנה", detail: "תהליכי הליבה של הסלון", icon: Monitor },
              { number: "02", title: "מנוי AI", detail: "אוטומציה ואינטליגנציה", icon: Sparkles },
              { number: "03", title: "מסחר", detail: "רכש ומרקטפלייס", icon: ShoppingBag },
              { number: "04", title: "מידע למותגים", detail: "תובנות מצרפיות ומורשות", icon: LineChart },
            ]
          : [
              { number: "01", title: "SOFTWARE", detail: "Core salon workflows", icon: Monitor },
              { number: "02", title: "AI", detail: "Automation and intelligence", icon: Sparkles },
              { number: "03", title: "COMMERCE", detail: "Procurement and marketplace", icon: ShoppingBag },
              { number: "04", title: "BRAND INTELLIGENCE", detail: "Aggregated, permissioned insights", icon: LineChart },
            ]
        ).map((layer, index) => (
          <div
            key={layer.title}
            style={{
              minHeight: 310,
              padding: "30px 26px",
              borderTop: `4px solid ${index === 0 ? CB.copperDeep : CB.lineStrong}`,
              background: index === 0 ? CB.copperSoft : CB.well,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <IdeaMark icon={layer.icon} label={layer.number} accent={index === 0} />
            <div>
              <p style={{ margin: 0, color: CB.ink, fontSize: 27, fontWeight: 700, lineHeight: 1.15 }}>{layer.title}</p>
              <p style={{ margin: "14px 0 0", color: CB.muted, fontSize: 19, lineHeight: 1.4 }}>{layer.detail}</p>
            </div>
          </div>
        ))}
      </div>
      <Foot>{he ? "לקוח אחד יכול לצמוח איתנו לאורך ארבע שכבות ערך." : "One customer can grow with us across four value layers."}</Foot>
    </WireSlide>
  );
};

export const LandscapeExactWebSlide: React.FC<{ lang: UpdateLang }> = ({ lang }) => {
  const he = lang === "he";
  return (
    <WireSlide
      id="web-deck-landscape-exact"
      lang={lang}
      index={{ en: "14", he: "14" }}
      tone="warm"
      kicker={{ en: "The competitive difference", he: "ההבדל התחרותי" }}
      displaySize="statement"
      headline={he ? "המתחרים מחזיקים חלקים. Spectra מחברת את כל תהליך העבודה." : "Competitors own pieces. Spectra connects the whole workflow."}
      label={{
        en: "Competitors own pieces. Spectra connects the whole workflow.",
        he: "המתחרים מחזיקים חלקים. Spectra מחברת את כל תהליך העבודה.",
      }}
      cinematicImage="/investor/generated/investor-slide-14-cinematic.png"
      cinematicPosition="70% center"
    >
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 22, alignItems: "center" }}>
        {(he
          ? [
              { title: "תוכנת סלון", rows: ["יומן ו-CRM", "תשלומים", "לא רואה ביצוע פיזי"], icon: Calendar },
              { title: "אינטליגנציית צבע", rows: ["חומר ועלות", "מלאי צבע", "לא מנהלת את הסלון"], icon: FlaskConical },
              { title: "SPECTRA", rows: ["ביצוע פיזי", "ניהול הסלון", "שימוש במוצר"], icon: Layers, accent: true },
            ]
          : [
              { title: "SALON SOFTWARE", rows: ["Calendar + CRM", "Payments", "Does not see physical execution"], icon: Calendar },
              { title: "COLOR INTELLIGENCE", rows: ["Material + cost", "Color inventory", "Does not run the salon"], icon: FlaskConical },
              { title: "SPECTRA", rows: ["Physical execution", "Salon management", "Product usage"], icon: Layers, accent: true },
            ]
        ).map((column) => (
          <div
            key={column.title}
            style={{
              minHeight: 330,
              border: `1px solid ${column.accent ? CB.copperDeep : CB.lineStrong}`,
              background: column.accent ? CB.copperSoft : "rgba(255,255,255,0.45)",
              padding: "32px 30px",
            }}
          >
            <IdeaMark icon={column.icon} label={column.title} accent={column.accent} />
            <ul style={{ margin: "38px 0 0", padding: 0, listStyle: "none" }}>
              {column.rows.map((row) => (
                <li key={row} style={{ padding: "16px 0", borderTop: `1px solid ${CB.lineStrong}`, color: CB.ink, fontSize: 23, fontWeight: column.accent ? 650 : 500 }}>
                  {row}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <Foot>{he ? "היתרון אינו עוד פיצ׳ר. הוא החיבור בין העבודה, העסק והמוצר." : "The advantage is not another feature. It is the connection between work, business and product."}</Foot>
    </WireSlide>
  );
};

export const AiDifferenceWebSlide: React.FC<{ lang: UpdateLang }> = ({ lang }) => {
  const he = lang === "he";
  const left = he
    ? [
        { label: "הזמנות", icon: Calendar },
        { label: "תשלומים", icon: CreditCard },
        { label: "CRM", icon: ClipboardList },
      ]
    : [
        { label: "Bookings", icon: Calendar },
        { label: "Payments", icon: CreditCard },
        { label: "CRM", icon: ClipboardList },
      ];
  const right = he
    ? [
        { label: "מטרות הלקוחה", icon: Heart },
        { label: "מצב השיער וההיסטוריה שלו", icon: ScanSearch },
        { label: "ההערכה המקצועית", icon: Sparkles },
        { label: "השירות והפורמולה שהומלצו", icon: FlaskConical },
        { label: "התוצאות לאורך זמן", icon: LineChart },
      ]
    : [
        { label: "Client goals", icon: Heart },
        { label: "Hair condition and history", icon: ScanSearch },
        { label: "Professional assessment", icon: Sparkles },
        { label: "Recommended service and formula", icon: FlaskConical },
        { label: "Results over time", icon: LineChart },
      ];
  return (
    <WireSlide
      id="web-deck-ai-difference"
      lang={lang}
      index={{ en: "15", he: "15" }}
      tone="ink"
      skin="ink"
      bleed={<GlowField x={50} y={62} size={80} count={26} />}
      kicker={{ en: "Consultation intelligence", he: "אינטליגנציית ייעוץ" }}
      displaySize="statement"
      headline={
        he ? (
          <>
            רוב תוכנות הסלון מתעדות את התור.
            <span style={{ display: "block", color: CB_INK.gold }}>
              <Spectra /> מבינה את הלקוחה, את השיער ואת ההחלטה המקצועית.
            </span>
          </>
        ) : (
          <>
            Most salon software records the appointment.
            <span style={{ display: "block", color: CB_INK.gold }}>
              <Spectra /> understands the client, the hair and the professional decision.
            </span>
          </>
        )
      }
      label={{
        en: "Most salon software records the appointment. Spectra understands the client, the hair and the professional decision.",
        he: "רוב תוכנות הסלון מתעדות את התור. Spectra מבינה את הלקוחה, את השיער ואת ההחלטה המקצועית.",
      }}
      cinematicImage="/investor/generated/investor-slide-15-cinematic.png"
      cinematicPosition="72% center"
    >
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56 }}>
          <div>
            <p style={{ margin: "0 0 14px", color: CB_INK.muted, fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              {he ? "מערכות אחרות מתעדות" : "Other systems record"}
            </p>
            {left.map((row) => (
              <div key={row.label} style={{ padding: "14px 0", borderBottom: `1px solid ${CB_INK.line}` }}>
                <IdeaMark dark icon={row.icon} label={row.label} />
              </div>
            ))}
          </div>
          <div>
            <p style={{ margin: "0 0 14px", color: CB_INK.gold, fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              {he ? "Spectra הופכת את הייעוץ לדאטה" : "Spectra captures"}
            </p>
            {right.map((row) => (
              <div key={row.label} style={{ padding: "10px 0", borderBottom: `1px solid ${inkGold(0.3)}` }}>
                <IdeaMark dark accent icon={row.icon} label={row.label} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <Foot>
        {he
          ? "כל ייעוץ הופך לאינטליגנציה מובנית — ומשפר עקביות, התאמה אישית והמלצות עתידיות."
          : "Every consultation becomes structured intelligence—improving consistency, personalization and future recommendations."}
      </Foot>
    </WireSlide>
  );
};

export const OptionalityExactWebSlide: React.FC<{ lang: UpdateLang }> = ({ lang }) => {
  const he = lang === "he";
  return (
    <WireSlide
      id="web-deck-optionality-exact"
      lang={lang}
      index={{ en: "16", he: "16" }}
      tone="ink"
      skin="ink"
      bleed={<GlowField x={he ? 20 : 80} y={70} size={55} count={14} />}
      kicker={{ en: "A direct path from trust to commerce", he: "מסלול ישיר מאמון למסחר" }}
      displaySize="statement"
      headline={he ? "מחברים ייעוץ מקצועי ישירות לרכישה." : "Connect professional advice directly to commerce."}
      support={
        he
          ? "המלצה המבוססת על האבחון והשירות יכולה להפוך לרכישה רלוונטית."
          : "A recommendation based on the diagnosis and service can become a relevant purchase."
      }
      label={{
        en: "Connect professional advice directly to commerce.",
        he: "מחברים ייעוץ מקצועי ישירות לרכישה.",
      }}
      cinematicImage="/investor/generated/investor-slide-16-cinematic.png"
      cinematicPosition="70% center"
    >
      <div className="deck-icon-grid" style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, alignContent: "center" }}>
        {(he
          ? [
              { label: "אבחון", hint: "מה השיער צריך", icon: ScanSearch },
              { label: "המלצה", hint: "מה כדאי לקנות", icon: Sparkles },
              { label: "רכישה", hint: "רכישה רלוונטית", icon: ShoppingBag },
            ]
          : [
              { label: "DIAGNOSIS", hint: "What the hair needs", icon: ScanSearch },
              { label: "RECOMMENDATION", hint: "What to buy next", icon: Sparkles },
              { label: "PURCHASE", hint: "A relevant purchase", icon: ShoppingBag },
            ]
        ).map((step, index) => (
          <IdeaMark key={step.label} dark stacked accent={index === 2} icon={step.icon} label={step.label} hint={step.hint} />
        ))}
      </div>
      <Foot>{he ? "הסלון אינו רק נקודת שירות. הוא רגע של אמון והחלטת רכישה." : "The salon is not only a service point. It is a moment of trust and purchase."}</Foot>
    </WireSlide>
  );
};

export const RaiseExactWebSlide: React.FC<{ lang: UpdateLang }> = ({ lang }) => {
  const he = lang === "he";
  return (
    <WireSlide
      id="web-deck-raise-exact"
      lang={lang}
      index={{ en: "17", he: "17" }}
      tone="chalk"
      kicker={{ en: "$1M seed round", he: "סבב Seed של $1M" }}
      displaySize="statement"
      headline={he ? "הוכחנו את נקודת הכניסה. עכשיו צריך להוכיח את הפלטפורמה." : "We proved the wedge. Now we need to prove the platform."}
      support={he ? "שלוש אבני דרך ברורות להון החדש." : "Three clear milestones for the new capital."}
      label={{
        en: "We proved the wedge. Now we need to prove the platform.",
        he: "הוכחנו את נקודת הכניסה. עכשיו צריך להוכיח את הפלטפורמה.",
      }}
      cinematicImage="/investor/generated/investor-slide-17-cinematic.png"
      cinematicPosition="72% center"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 42, flex: 1, minHeight: 0, justifyContent: "center" }}>
        <Flow
          size="lg"
          nodes={[
            { label: he ? "לבנות" : "BUILD", sub: he ? "להשלים Salon OS ו-AI" : "Complete Salon OS + AI", icon: Wrench },
            { label: he ? "להטמיע" : "DEPLOY", sub: he ? "להרחיב אצל סלונים קיימים" : "Expand across existing salons", icon: Building2 },
            { label: he ? "לפתוח GTM מחדש" : "REOPEN GTM", sub: he ? "להאיץ הפצה בארה״ב" : "Accelerate U.S. distribution", icon: Rocket, accent: true },
          ]}
        />
        <p dir="ltr" style={{ margin: 0, color: CB.copperDeep, fontSize: 78, fontWeight: 700, letterSpacing: "-0.06em", textAlign: he ? "right" : "left" }}>$1M</p>
      </div>
      <Foot>{he ? "המטרה: אימוץ פלטפורמה, GTM חוזר ו-ARPU גבוה יותר." : "The goal: platform adoption, repeatable GTM and higher ARPU."}</Foot>
    </WireSlide>
  );
};

export const TeamExactWebSlide: React.FC<{ lang: UpdateLang }> = ({ lang }) => {
  const he = lang === "he";
  return (
    <WireSlide
      id="web-deck-team-exact"
      lang={lang}
      index={{ en: "18", he: "18" }}
      tone="ink"
      skin="ink"
      kicker={{ en: "The team", he: "הצוות" }}
      headline={he ? "חיינו את תהליך העבודה לפני שבנינו את התוכנה." : "We lived the workflow before we built the software."}
      support={
        he
          ? "אנחנו לא צוות software שנכנס לעולם הביוטי. אנחנו מגיעים מתוך:"
          : "We are not a software team that entered the beauty world. We come from:"
      }
      label={{
        en: "We lived the workflow before we built the software.",
        he: "We lived the workflow before we built the software.",
      }}
      cinematicImage="/investor/generated/investor-slide-18-cinematic.png"
      cinematicPosition="72% center"
    >
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 32 }}>
        {(he
          ? [
              ["מאור גנון", "CEO / מוצר", "ספר מקצועי ובעל סלון שבונה מתוך תהליך העבודה."],
              ["אלעד גוטליב", "מייסד שותף / תפעול", "פיננסים ותפעול שהופכים חזון לחברה עובדת."],
            ]
          : [
              ["Maor Ganon", "CEO / PRODUCT", "Professional stylist and salon owner building from inside the workflow."],
              ["Elad Gotlieb", "CO-FOUNDER / OPERATIONS", "Finance and operations that turn vision into a working company."],
            ]
        ).map(([name, role, detail]) => (
          <div key={name} style={{ padding: "24px 0", borderTop: `1px solid ${CB_INK.lineStrong}` }}>
            <p style={{ margin: 0, color: CB_INK.ink, fontSize: 30, fontWeight: 650 }}>{name}</p>
            <p dir="ltr" style={{ margin: "8px 0 0", color: CB_INK.gold, fontSize: 14, fontWeight: 700, letterSpacing: "0.11em", textAlign: he ? "right" : "left" }}>{role}</p>
            <p style={{ margin: "12px 0 0", color: CB_INK.muted, fontSize: 18, lineHeight: 1.45 }}>{detail}</p>
          </div>
        ))}
      </div>
    </WireSlide>
  );
};

export const CloseLoopWebSlide: React.FC<{ lang: UpdateLang }> = ({ lang }) => {
  const he = lang === "he";
  const steps = he
    ? [
        { label: "קערה", icon: FlaskConical },
        { label: "שירות", icon: Paintbrush },
        { label: "דאטה", icon: Layers },
        { label: "אינטליגנציה", icon: Brain },
      ]
    : [
        { label: "Bowl", icon: FlaskConical },
        { label: "Service", icon: Paintbrush },
        { label: "Data", icon: Layers },
        { label: "Intelligence", icon: Brain },
      ];
  return (
    <WireSlide
      id="web-deck-close-loop"
      lang={lang}
      index={{ en: "19", he: "19" }}
      tone="ink"
      skin="ink"
      bleed={<GlowField x={50} y={52} size={62} count={12} />}
      kicker={{ en: "The close", he: "הסגירה" }}
      displaySize="statement"
      headline={he ? "התחלנו במדידה של קערת צבע אחת." : "We started by measuring one bowl of color."}
      label={{
        en: "Spectra is building the operating and data layer for professional beauty.",
        he: "Spectra is building the operating and data layer for professional beauty.",
      }}
      cinematicImage="/investor/generated/investor-slide-19-cinematic.png"
      cinematicPosition="72% center"
    >
      <div className="deck-clarity-flow" style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 0 }}>
        {steps.map((step, i) => (
          <React.Fragment key={step.label}>
            {i > 0 ? (
              <span aria-hidden="true" style={{ padding: "0 16px", color: CB_INK.faint, fontSize: 22 }}>
                →
              </span>
            ) : null}
            <div style={{ padding: "14px 18px", border: `1px solid ${CB_INK.lineStrong}` }}>
              <IdeaMark dark icon={step.icon} label={step.label} />
            </div>
          </React.Fragment>
        ))}
        <span aria-hidden="true" style={{ padding: "0 20px", color: CB_INK.faint, fontSize: 22 }}>
          →
        </span>
        <OrbHalo size={128} />
        <span
          style={{
            marginInlineStart: 24,
            color: CB_INK.gold,
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            whiteSpace: "nowrap",
          }}
        >
          {he ? "סלון אוטונומי" : "Autonomous salon"}
        </span>
      </div>
      <Foot>{he ? "Spectra בונה את שכבת התפעול והדאטה של תעשיית היופי המקצועית." : "Spectra is building the operating and data layer for professional beauty."}</Foot>
    </WireSlide>
  );
};
