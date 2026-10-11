import React from "react";
import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  Blend,
  Database,
  Hourglass,
  MonitorPlay,
  Paintbrush,
  Scale,
  ScanBarcode,
  Store,
  Tag,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { CB } from "../../colorBarTokens";
import { FINAL_COVER_EVIDENCE, FINAL_PROOF, FINAL_SAAS, type UpdateLang } from "../../finalCopy";
import { Flow } from "./DeckDiagrams";
import { Foot, IdeaMark, MetricStrip, WireSlide, tx } from "./NarrativeKit";
import { ScrollStage } from "./ScrollChoreography";

const SALON_OVERHEAD_PHOTO = "/investor/generated/investor-slide-08-cinematic.png";
const COLOR_BAR_PHOTO = "/investor/generated/investor-slide-03-cinematic.png";

const Pill: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span
    style={{
      padding: "9px 16px",
      border: `1px solid ${CB.lineStrong}`,
      background: "rgba(255,255,255,0.55)",
      color: CB.ink,
      fontSize: 15,
      fontWeight: 500,
    }}
  >
    {children}
  </span>
);

export const FounderProblemWebSlide: React.FC<{ lang: UpdateLang }> = ({ lang }) => {
  const he = lang === "he";
  return (
    <WireSlide
      id="web-deck-founder-problem"
      lang={lang}
      index={{ en: "02", he: "02" }}
      kicker={{ en: "The hidden economics of every service", he: "הכלכלה הנסתרת של כל שירות" }}
      headline={
        he ? (
          <>
            יודעים כמה גובים.
            <span style={{ display: "block", color: CB.copper }}>לא יודעים כמה השירות באמת עולה.</span>
          </>
        ) : (
          <>
            You know what you charge.
            <span style={{ display: "block", color: CB.copper }}>You don’t know what the service really costs.</span>
          </>
        )
      }
      label={{
        en: "You know what you charge. You don’t know what the service really costs.",
        he: "יודעים כמה גובים. לא יודעים כמה השירות באמת עולה.",
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 520px", gap: 58, alignItems: "stretch", flex: 1, minHeight: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 42 }}>
          <div className="deck-clarity-flow" dir="ltr" style={{ display: "flex", alignItems: "center", gap: 22, color: CB.ink }}>
            {(
              [
                { term: "PRICE", hint: he ? "כמה גובים" : "What you charge", icon: Tag },
                { term: "COST", hint: he ? "כמה זה באמת עולה" : "What it really costs", icon: Scale },
                { term: "PROFIT", hint: he ? "כמה נשאר" : "What remains", icon: TrendingUp },
              ] as const
            ).map((item, index) => (
              <React.Fragment key={item.term}>
                {index > 0 ? <span style={{ color: CB.copper, fontSize: 48, fontWeight: 400 }}>≠</span> : null}
                <div>
                  <IdeaMark icon={item.icon} label={item.term} hint={item.hint} accent={index === 2} />
                </div>
              </React.Fragment>
            ))}
          </div>
          <p style={{ margin: 0, maxWidth: 700, color: CB.ink, fontSize: 28, fontWeight: 600, lineHeight: 1.35 }}>
            {he ? "בלי למדוד את העבודה, אי אפשר לנהל את הרווח." : "If the work is not measured, the profit cannot be managed."}
          </p>
        </div>
        <figure style={{ position: "relative", margin: 0, minHeight: 0, overflow: "hidden" }}>
          <img
            src={SALON_OVERHEAD_PHOTO}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "96% 30%" }}
          />
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background: he
                ? `linear-gradient(to left, ${CB.bg} 0%, rgba(251,250,247,0.72) 8%, transparent 22%)`
                : `linear-gradient(to right, ${CB.bg} 0%, rgba(251,250,247,0.72) 8%, transparent 22%)`,
              pointerEvents: "none",
            }}
          />
        </figure>
      </div>
    </WireSlide>
  );
};

const BuildNode: React.FC<{
  label: string;
  icon: LucideIcon;
  at: number;
  progress: MotionValue<number>;
  accent?: boolean;
}> = ({ label, icon, at, progress, accent }) => {
  const opacity = useTransform(progress, [at - 0.1, at], [0, 1]);
  return (
    <motion.div style={{ opacity, display: "inline-block" }}>
      <div
        style={{
          padding: "12px 16px",
          border: `1px solid ${accent ? CB.copperDeep : CB.lineStrong}`,
          background: accent ? CB.copperSoft : "transparent",
        }}
      >
        <IdeaMark icon={icon} label={label} accent={accent} />
      </div>
    </motion.div>
  );
};

const FadeAt: React.FC<{ at: number; progress: MotionValue<number>; children: React.ReactNode }> = ({
  at,
  progress,
  children,
}) => {
  const opacity = useTransform(progress, [at - 0.1, at], [0, 1]);
  return <motion.div style={{ opacity }}>{children}</motion.div>;
};

export const IsraelSolutionWebSlide: React.FC<{ lang: UpdateLang }> = ({ lang }) => {
  const he = lang === "he";
  const steps = he
    ? [
        { label: "סריקה", icon: ScanBarcode },
        { label: "מיזוג", icon: Blend },
        { label: "מדידה", icon: Scale },
        { label: "תיעוד", icon: Database },
      ]
    : [
        { label: "Scan", icon: ScanBarcode },
        { label: "Mix", icon: Blend },
        { label: "Measure", icon: Scale },
        { label: "Record", icon: Database },
      ];
  const outcomes = he
    ? ["פחות בזבוז", "עלות אמיתית לכל שירות", "מלאי שמבוסס על שימוש בפועל", "היסטוריית פורמולות לכל לקוחה"]
    : ["Less waste", "Real cost per service", "Inventory based on actual usage", "Formula history for every client"];
  return (
    <ScrollStage heightVh={1.7}>
      {(progress) => (
        <WireSlide
          id="web-deck-israel-solution"
          lang={lang}
          index={{ en: "03", he: "03" }}
          kicker={{ en: "We built this — and it worked in Israel", he: "בנינו את זה — וזה עבד בישראל" }}
          displaySize="statement"
          headline={he ? "הפכנו כל גרם למדיד." : "We made every gram measurable."}
          label={{ en: "We made every gram measurable.", he: "הפכנו כל גרם למדיד." }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 620px", gap: 54, alignItems: "stretch", flex: 1, minHeight: 0 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 32, justifyContent: "center" }}>
              <div className="deck-clarity-flow" style={{ display: "flex", alignItems: "center", gap: 0 }}>
                {steps.map((step, i) => (
                  <React.Fragment key={step.label}>
                    {i > 0 ? <span aria-hidden="true" style={{ padding: "0 12px", color: CB.faint, fontSize: 20 }}>→</span> : null}
                    <BuildNode label={step.label} icon={step.icon} at={0.2 + i * 0.16} progress={progress} accent={i === steps.length - 1} />
                  </React.Fragment>
                ))}
              </div>
              <FadeAt at={0.78} progress={progress}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {outcomes.map((row) => <Pill key={row}>{row}</Pill>)}
                </div>
              </FadeAt>
              <FadeAt at={0.94} progress={progress}>
                <p style={{ margin: 0, color: CB.ink, fontSize: 22, fontWeight: 600 }}>
                  {he ? "זו לא הייתה תיאוריה. בנינו מוצר אמיתי שאנשים משלמים עליו." : "This was not a theory. We built a real product people pay for."}
                </p>
              </FadeAt>
            </div>
            <figure style={{ margin: 0, minHeight: 0, overflow: "hidden", border: `1px solid ${CB.lineStrong}` }}>
              <img src={COLOR_BAR_PHOTO} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "72% 38%" }} />
            </figure>
          </div>
        </WireSlide>
      )}
    </ScrollStage>
  );
};

export const BusinessTestWebSlide: React.FC<{ lang: UpdateLang }> = ({ lang }) => {
  const he = lang === "he";
  return (
    <WireSlide
      id="web-deck-business-test"
      lang={lang}
      index={{ en: "04", he: "04" }}
      kicker={{ en: "We deliberately tried to break the model", he: "אז בכוונה ניסינו לשבור את המודל" }}
      tone="warm"
      headline={he ? "ישראל הוכיחה שסלונים ישתמשו במוצר." : "Israel proved salons would use it."}
      label={{
        en: "Israel proved salons would use it.",
        he: "ישראל הוכיחה שסלונים ישתמשו במוצר.",
      }}
      cinematicImage="/investor/generated/investor-slide-04-cinematic.png"
      cinematicPosition="64% center"
    >
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <MetricStrip
          items={[
            { value: FINAL_PROOF[0].value, label: he ? "סלונים משלמים" : "Paying salons", icon: Store },
            { value: FINAL_PROOF[2].value, label: he ? "אנשי מקצוע" : "Professionals", icon: Users },
            { value: FINAL_COVER_EVIDENCE.kpis[0].value, label: he ? "שירותי צבע שנמדדו" : "Color services measured", icon: Paintbrush },
          ]}
        />
      </div>
      <p
        style={{
          margin: 0,
          paddingTop: 26,
          borderTop: `1px solid ${CB.lineStrong}`,
          color: CB.ink,
          fontSize: 34,
          fontWeight: 600,
          lineHeight: 1.2,
          letterSpacing: "-0.03em",
          maxWidth: 1200,
        }}
      >
        {he ? "מוצר אמיתי. שימוש יומיומי אמיתי. הכנסה חוזרת אמיתית." : "A real product. Real daily use. Real recurring revenue."}
      </p>
    </WireSlide>
  );
};

export const ItWorkedWebSlide: React.FC<{ lang: UpdateLang }> = ({ lang }) => {
  const he = lang === "he";
  return (
    <WireSlide
      id="web-deck-it-worked"
      lang={lang}
      index={{ en: "05", he: "05" }}
      kicker={{ en: "The repeatable acquisition test", he: "מבחן הרכישה החוזרת" }}
      displaySize="statement"
      headline={he ? "למדנו איך לגייס סלונים מרחוק." : "We learned how to acquire salons remotely."}
      label={{
        en: "We learned how to acquire salons remotely.",
        he: "למדנו איך לגייס סלונים מרחוק.",
      }}
      cinematicImage="/investor/generated/investor-slide-05-cinematic.png"
      cinematicPosition="70% center"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 54, flex: 1, minHeight: 0, justifyContent: "center" }}>
        <Flow
          size="lg"
          nodes={(he
            ? [
                { label: "ליד", icon: UserPlus },
                { label: "דמו", icon: MonitorPlay },
                { label: "ניסיון", icon: Hourglass },
                { label: "סלון משלם", icon: BadgeCheck },
              ]
            : [
                { label: "Lead", icon: UserPlus },
                { label: "Demo", icon: MonitorPlay },
                { label: "Trial", icon: Hourglass },
                { label: "Paid salon", icon: BadgeCheck },
              ]
          ).map((node, index) => ({
            ...node,
            accent: index === 3,
          }))}
        />
        <MetricStrip
          items={[
            { value: FINAL_SAAS.funnel[0].value, label: tx(FINAL_SAAS.funnel[0].label, lang) },
            { value: FINAL_SAAS.funnel[1].value, label: tx(FINAL_SAAS.funnel[1].label, lang) },
            { value: FINAL_SAAS.funnel[2].value, label: tx(FINAL_SAAS.funnel[2].label, lang) },
          ]}
        />
      </div>
      <Foot>
        {he ? "$40K בשיווק יצרו 96 סלונים משלמים." : "$40K in marketing produced 96 paying salons."}
      </Foot>
    </WireSlide>
  );
};
