import React from "react";
import { FINAL_MOBILE, FINAL_OWNER_APP, FINAL_OWNER_SCREEN, type UpdateLang } from "./finalCopy";
import {
  Body,
  Caption,
  Chapter,
  Display,
  Kicker,
  PullQuote,
  Reveal,
  Rule,
  Spread,
  TermList,
  t as text,
} from "./EditorialPrimitives";

type SectionProps = {
  lang: UpdateLang;
  reducedMotion: boolean;
};

/**
 * Same restrained CRM surface palette the client spread uses, so the owner and
 * client prototypes read as one product rather than two design languages.
 */
const CRM = {
  paper: "#FFFDF8",
  border: "#EBDDD2",
  hairline: "#F0E6DC",
  ink: "#141414",
  muted: "#7E7066",
  faint: "#A2958A",
  rose: "#B05F57",
  amber: "#A97A2C",
  green: "#5F886F",
  menthe: "#96C7B3",
} as const;

/** Service colours stay inside the warm editorial range, not analytics bright. */
const TONE: Record<string, { line: string; tint: string; wash: string }> = {
  rose: { line: CRM.rose, tint: "rgba(176,95,87,0.16)", wash: "rgba(176,95,87,0.06)" },
  amber: { line: CRM.amber, tint: "rgba(169,122,44,0.16)", wash: "rgba(169,122,44,0.06)" },
  green: { line: CRM.green, tint: "rgba(95,136,111,0.16)", wash: "rgba(95,136,111,0.06)" },
};

const toneOf = (key: string) => TONE[key] ?? TONE.rose;

/**
 * iPhone Pro class geometry. Body 352 x 749 CSS px keeps the 19.5:9 display
 * proportion once the 6.5px titanium bezel is removed: the 339 x 736 screen is
 * 2.171:1 against a 2.167:1 target. Corner radius 54px matches the body scale.
 */
const DEVICE = {
  width: 352,
  height: 749,
  bezel: 6.5,
  outerRadius: 54,
  innerRadius: 47.5,
  islandWidth: 108,
  islandHeight: 32,
  islandTop: 10,
  statusBarHeight: 38,
} as const;

/**
 * The interface is authored once at 339 x 736 and optically scaled to the
 * rendered device, so the composition, and the fit, are identical at 375, 768
 * and 1440. Device widths and the matching scales stay in lockstep:
 * 320 -> 0.906, 344 -> 0.976, 352 -> 1.
 */
const SCREEN_WIDTH = DEVICE.width - DEVICE.bezel * 2;
const SCREEN_HEIGHT = DEVICE.height - DEVICE.bezel * 2;
const DEVICE_WIDTH_CLASS = "w-[min(100%,320px)] min-[400px]:w-[344px] lg:w-[352px]";
const SCREEN_SCALE_CLASS = "scale-[0.9056] min-[400px]:scale-[0.9764] lg:scale-100";

/** Timeline spans 09:00 to 19:00, expressed in minutes from the open. */
const DAY_START = 9 * 60;
const DAY_MINUTES = 600;
const NOW_MINUTES = 105; // 10:45
const pct = (minutes: number) => `${(minutes / DAY_MINUTES) * 100}%`;
const clockLabel = (minutesFromOpen: number) => {
  const total = DAY_START + minutesFromOpen;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

/* --------------------------------------------------------------- the device */

/** Precise CSS iPhone Pro shell. No image asset, no runtime dependency. */
const PhoneDevice: React.FC<{ children: React.ReactNode; screenDir: "ltr" | "rtl" }> = ({
  children,
  screenDir,
}) => (
  <div
    dir="ltr"
    className={`relative shrink-0 ${DEVICE_WIDTH_CLASS}`}
    style={{ aspectRatio: `${DEVICE.width} / ${DEVICE.height}` }}
  >
    {/* Physical side buttons stay on the hardware, so they never mirror in RTL. */}
    {[
      { side: "left", top: "16.4%", height: "3.4%" },
      { side: "left", top: "22.4%", height: "8%" },
      { side: "left", top: "32.2%", height: "8%" },
      { side: "right", top: "25.5%", height: "10.4%" },
    ].map((button, index) => (
      <span
        key={index}
        aria-hidden="true"
        className="absolute w-[3px] rounded-[2px]"
        style={{
          [button.side]: "-2px",
          top: button.top,
          height: button.height,
          background: "linear-gradient(180deg,#443f3a,#1b1815,#413c37)",
          boxShadow:
            button.side === "left"
              ? "inset 1px 0 0 rgba(255,255,255,0.16)"
              : "inset -1px 0 0 rgba(255,255,255,0.12)",
        }}
      />
    ))}

    {/* Titanium body */}
    <div
      className="absolute inset-0"
      style={{
        borderRadius: DEVICE.outerRadius,
        background:
          "linear-gradient(148deg,#5c5751 0%,#2f2b28 17%,#191614 45%,#232019 71%,#413b34 100%)",
        boxShadow:
          "inset 0 0 0 1px rgba(255,255,255,0.16), 0 42px 78px -26px rgba(43,34,27,0.5), 0 16px 34px -16px rgba(43,34,27,0.34)",
      }}
    />

    {/* Screen */}
    <div
      dir={screenDir}
      className="absolute overflow-hidden"
      style={{
        inset: DEVICE.bezel,
        borderRadius: DEVICE.innerRadius,
        background: CRM.paper,
        color: CRM.ink,
        boxShadow: "inset 0 0 0 1px rgba(20,16,12,0.4)",
      }}
    >
      <div
        className={`absolute left-0 top-0 origin-top-left ${SCREEN_SCALE_CLASS}`}
        style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
      >
        {children}
      </div>

      {/* Speaker slit and front camera live inside the Dynamic Island. */}
      <span
        aria-hidden="true"
        className="absolute start-1/2 flex items-center justify-end"
        style={{
          top: DEVICE.islandTop,
          width: DEVICE.islandWidth,
          height: DEVICE.islandHeight,
          marginInlineStart: -DEVICE.islandWidth / 2,
          borderRadius: 999,
          background: "#070605",
          boxShadow: "inset 0 1px 2px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.05)",
        }}
      >
        <span
          className="me-[13px] block h-[9px] w-[9px] rounded-full"
          style={{
            background:
              "radial-gradient(circle at 34% 30%, rgba(104,126,148,0.6), rgba(8,8,10,0.95) 62%)",
          }}
        />
      </span>

      {/* Glass catch-light, kept faint so the interface stays legible. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(133deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.14) 15%, rgba(255,255,255,0) 34%)",
        }}
      />
    </div>
  </div>
);

/* ------------------------------------------------------------- the app screen */

const StatusBar: React.FC = () => (
  <div
    className="flex shrink-0 items-center justify-between px-[24px]"
    style={{ height: DEVICE.statusBarHeight }}
  >
    <span dir="ltr" className="text-[11px] font-semibold tabular-nums" style={{ color: CRM.ink }}>
      10:45
    </span>
    <span aria-hidden="true" className="flex items-end gap-[2.5px]">
      {[4, 6, 8, 10].map((height) => (
        <span
          key={height}
          className="w-[2.5px] rounded-[1px]"
          style={{ height, background: CRM.ink, opacity: 0.45 }}
        />
      ))}
      <span
        className="ms-[5px] flex h-[10px] w-[18px] items-center rounded-[3px] border px-[1.5px]"
        style={{ borderColor: `${CRM.ink}4d` }}
      >
        <span className="block h-[6px] w-[70%] rounded-[1.5px]" style={{ background: CRM.ink, opacity: 0.6 }} />
      </span>
    </span>
  </div>
);

const SectionLabel: React.FC<{ children: React.ReactNode; trailing?: React.ReactNode }> = ({
  children,
  trailing,
}) => (
  <div className="flex items-baseline justify-between gap-3">
    <span
      className="whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.18em]"
      style={{ color: CRM.faint }}
    >
      {children}
    </span>
    {trailing}
  </div>
);

const OwnerHomeScreen: React.FC<{ lang: UpdateLang }> = ({ lang }) => {
  const s = FINAL_OWNER_SCREEN;
  const he = lang === "he";

  return (
    <div className="flex h-full flex-col">
      <StatusBar />

      <div className="flex min-h-0 flex-1 flex-col px-[15px]">
        {/* Who you are, and the one fact that matters: the salon is running. */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[17px] font-semibold leading-tight">{text(s.greeting, lang)}</p>
            <p className="mt-[5px] flex items-center gap-[6px]">
              <span
                aria-hidden="true"
                className="block h-[6px] w-[6px] shrink-0 rounded-full"
                style={{ background: CRM.green, boxShadow: `0 0 0 3px ${TONE.green.tint}` }}
              />
              <span className="text-[11.5px] font-semibold" style={{ color: CRM.green }}>
                {text(s.live, lang)}
              </span>
            </p>
          </div>
          <span
            className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full text-[11px] font-bold"
            style={{ background: CRM.menthe, color: "#1c332b" }}
          >
            MG
          </span>
        </div>

        <p
          className="mt-[9px] border-y py-[7px] text-[11px] font-medium"
          style={{ borderColor: CRM.hairline, color: CRM.muted }}
        >
          {text(s.strip, lang)}
        </p>

        {/* LIVE NOW: the dominant region. People, service, stage, time. */}
        <div className="mt-[13px]">
          <SectionLabel
            trailing={
              <span
                className="flex shrink-0 items-center gap-[5px] whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.12em]"
                style={{ color: CRM.green }}
              >
                <span
                  aria-hidden="true"
                  className="block h-[5px] w-[5px] rounded-full"
                  style={{ background: CRM.green }}
                />
                {he ? "3 בטיפול" : "3 in chair"}
              </span>
            }
          >
            {text(s.liveNowLabel, lang)}
          </SectionLabel>

          <ul className="mt-[11px] space-y-[15px]">
            {s.liveClients.map((client) => {
              const tone = toneOf(client.tone);
              return (
                <li key={client.initials}>
                  <div className="flex items-center gap-[11px]">
                    <span
                      className="grid h-[36px] w-[36px] shrink-0 place-items-center rounded-full text-[11.5px] font-bold"
                      style={{ background: tone.tint, color: tone.line }}
                    >
                      {client.initials}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-semibold leading-tight">
                        {text(client.name, lang)}
                      </span>
                      <span
                        className="mt-[4px] block truncate text-[11px] leading-tight"
                        style={{ color: CRM.muted }}
                      >
                        {text(client.service, lang)}
                        <span aria-hidden="true" className="mx-[5px]" style={{ color: CRM.faint }}>
                          ·
                        </span>
                        {text(client.stage, lang)}
                      </span>
                    </span>
                    <span className="shrink-0 text-end">
                      <span className="block whitespace-nowrap text-[12px] font-bold leading-tight tabular-nums">
                        {text(client.remaining, lang)}
                      </span>
                      <span
                        className="mt-[4px] block whitespace-nowrap text-[10.5px] leading-tight"
                        style={{ color: CRM.muted }}
                      >
                        {text(client.stylist, lang)}
                      </span>
                    </span>
                  </div>
                  <span
                    aria-hidden="true"
                    className="mt-[8px] block h-[3px] w-full overflow-hidden rounded-full"
                    style={{ background: CRM.hairline }}
                  >
                    <span
                      className="block h-full rounded-full"
                      style={{ width: `${client.progress}%`, background: tone.line }}
                    />
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="grow" />

        {/* TODAY: one compact timeline, three chairs, free capacity visible. */}
        <div className="mt-[15px] border-t pt-[11px]" style={{ borderColor: CRM.border }}>
          <SectionLabel
            trailing={
              <span
                className="shrink-0 whitespace-nowrap text-[10px] font-semibold"
                style={{ color: CRM.rose }}
              >
                {text(s.todayNote, lang)}
              </span>
            }
          >
            {text(s.todayLabel, lang)}
          </SectionLabel>

          <div dir="ltr" className="mt-[8px] ps-[16px]">
            <div className="relative h-[10px]">
              {[0, DAY_MINUTES / 2, DAY_MINUTES].map((minutes, index) => (
                <span
                  key={minutes}
                  className="absolute top-0 text-[9.5px] tabular-nums"
                  style={{
                    color: CRM.faint,
                    left: pct(minutes),
                    transform:
                      index === 0 ? "none" : index === 1 ? "translateX(-50%)" : "translateX(-100%)",
                  }}
                >
                  {clockLabel(minutes)}
                </span>
              ))}
            </div>
          </div>

          <div dir="ltr" className="relative mt-[3px]">
            {FINAL_OWNER_SCREEN.todayLanes.map((lane) => (
              <div key={lane.stylist.en} className="flex items-center gap-[6px] py-[2.5px]">
                <span
                  className="w-[10px] shrink-0 text-[9.5px] font-bold"
                  style={{ color: CRM.faint }}
                  aria-label={text(lane.stylist, lang)}
                >
                  {text(lane.initial, lang)}
                </span>
                <span className="relative block h-[13px] flex-1 rounded-[3px]" style={{ background: CRM.hairline }}>
                  {lane.blocks.map((block) => {
                    const free = block.tone === "free";
                    const tone = toneOf(block.tone);
                    return (
                      <span
                        key={block.start}
                        className="absolute inset-y-0 rounded-[3px]"
                        style={{
                          left: pct(block.start),
                          width: pct(block.end - block.start),
                          background: free ? "rgba(176,95,87,0.09)" : tone.line,
                          border: free ? `1px dashed ${CRM.rose}` : undefined,
                        }}
                      />
                    );
                  })}
                </span>
              </div>
            ))}

            {/* Now marker, so the timeline reads as live rather than planned. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0"
              style={{ left: `calc(16px + (100% - 16px) * ${NOW_MINUTES / DAY_MINUTES})` }}
            >
              <span className="block h-full w-px" style={{ background: "rgba(20,20,20,0.5)" }} />
              <span
                className="absolute -left-[2px] -top-[2px] block h-[5px] w-[5px] rounded-full"
                style={{ background: CRM.ink }}
              />
            </span>
          </div>

          <p className="mt-[9px] text-[11px] font-medium" style={{ color: CRM.muted }}>
            {text(s.todayNext, lang)}
          </p>
        </div>

        {/* NEEDS YOU: three prioritised decisions, each with one next action. */}
        <div className="mt-[14px] border-t pt-[11px]" style={{ borderColor: CRM.border }}>
          <SectionLabel
            trailing={
              <span
                dir="ltr"
                className="grid h-[15px] min-w-[15px] place-items-center rounded-full px-[4px] text-[9.5px] font-bold tabular-nums"
                style={{ background: CRM.ink, color: CRM.paper }}
              >
                {s.needsYou.length}
              </span>
            }
          >
            {text(s.needsYouLabel, lang)}
          </SectionLabel>

          <ul className="mt-[6px]">
            {s.needsYou.map((item, index) => {
              const tone = toneOf(item.tone);
              return (
                <li
                  key={item.title.en}
                  className={`flex items-center gap-[8px] py-[7px] ${index > 0 ? "border-t" : ""}`}
                  style={index > 0 ? { borderColor: CRM.hairline } : undefined}
                >
                  <span
                    aria-hidden="true"
                    className="block h-[6px] w-[6px] shrink-0 rounded-full"
                    style={{ background: tone.line }}
                  />
                  <span className="min-w-0 flex-1 text-[11.5px] font-medium leading-[1.3]">
                    {text(item.title, lang)}
                  </span>
                  <span
                    className="shrink-0 whitespace-nowrap text-[11px] font-bold"
                    style={{ color: CRM.rose }}
                  >
                    {text(item.action, lang)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="grow" />
      </div>

      {/* Money is a footer, not a headline. */}
      <div
        className="shrink-0 border-t px-[15px] pb-[3px] pt-[9px]"
        style={{ borderColor: CRM.border }}
      >
        <p className="text-[11px] font-medium tabular-nums" style={{ color: CRM.muted }}>
          {text(s.money, lang)}
        </p>
      </div>

      <div className="flex shrink-0 justify-center pb-[7px] pt-[8px]">
        <span
          aria-hidden="true"
          className="block h-[4px] w-[106px] rounded-full"
          style={{ background: "rgba(20,20,20,0.24)" }}
        />
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------- spread */

export const OwnerCommandSpread: React.FC<SectionProps> = ({ lang, reducedMotion }) => {
  const o = FINAL_OWNER_APP;

  return (
    <Chapter label={text(o.title, lang)} tone="warm" rhythm="pause">
      <Spread>
        <Reveal reducedMotion={reducedMotion}>
          <div className="grid gap-x-16 gap-y-10 lg:grid-cols-[0.46fr_0.54fr] lg:gap-y-0">
            <div className="lg:pt-6">
              <Kicker>{text(o.kicker, lang)}</Kicker>
              <Display lang={lang} size="feature" className="mt-6 max-w-[15ch]">
                {text(o.title, lang)}
              </Display>
              <Body className="mt-7 max-w-[27rem]">{text(o.body, lang)}</Body>

              <PullQuote lang={lang} size="chapter" className="mt-10 max-w-[30rem]">
                {text(o.pull, lang)}
              </PullQuote>

              <TermList items={FINAL_MOBILE.roles} lang={lang} className="mt-8" />
              <Body className="mt-2.5">{text(FINAL_MOBILE.line, lang)}</Body>

              <Rule className="mt-8" />
              <Caption className="mt-5 max-w-[24rem]">{text(o.status, lang)}</Caption>
            </div>

            {/* One dominant visual, offset for a magazine product reveal. */}
            <div className="relative flex justify-center lg:justify-end">
              {/* Studio light behind the product, not a card. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -inset-x-12 -inset-y-10 hidden lg:block"
                style={{
                  background:
                    "radial-gradient(58% 46% at 62% 40%, rgba(226,208,186,0.9), rgba(226,208,186,0) 72%)",
                }}
              />
              <figure className="relative flex flex-col items-center lg:items-end lg:pt-14">
                <PhoneDevice screenDir={lang === "he" ? "rtl" : "ltr"}>
                  <OwnerHomeScreen lang={lang} />
                </PhoneDevice>
                <figcaption className="mt-5 max-w-[20rem] lg:text-end">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#2b221b]/45">
                    {text(o.figureLabel, lang)}
                  </p>
                  <Caption className="mt-2">{text(o.caption, lang)}</Caption>
                </figcaption>
              </figure>
            </div>
          </div>
        </Reveal>
      </Spread>
    </Chapter>
  );
};

export default OwnerCommandSpread;
