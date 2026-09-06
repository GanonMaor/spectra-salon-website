import React from "react";
import { FINAL_CLIENT_APP, type UpdateLang } from "./finalCopy";
import { CB, colorBarSans } from "./colorBarTokens";
import { Sheet } from "./ColorBarPatterns";
import {
  Body,
  Caption,
  Chapter,
  Display,
  Kicker,
  Reveal,
  Spread,
  t as text,
} from "./EditorialPrimitives";

type SectionProps = {
  lang: UpdateLang;
  reducedMotion: boolean;
};

const CLIENT_PHONES = "/investor/media/client-app-two-phones.png";

export const ClientAppImageSpread: React.FC<SectionProps> = ({ lang, reducedMotion }) => {
  const c = FINAL_CLIENT_APP;

  return (
    <Chapter label={text(c.title, lang)} tone="paper" rhythm="regular">
      <Spread>
        <Reveal reducedMotion={reducedMotion}>
          <p
            style={{ fontFamily: colorBarSans(lang), color: CB.copperDeep }}
            className="max-w-[30ch] text-[clamp(1.15rem,2vw,1.5rem)] font-semibold leading-[1.25] tracking-[-0.035em]"
          >
            {text(c.transition, lang)}
          </p>

          {/* Client render is the subject, so the copy column stays narrow. */}
          <div className="mt-9 grid gap-x-12 gap-y-10 lg:grid-cols-[0.36fr_0.64fr] lg:items-center">
            <div>
              <Kicker>{text(c.kicker, lang)}</Kicker>
              <Display lang={lang} size="sub" className="mt-4 max-w-[24ch]">
                {text(c.title, lang)}
              </Display>
              <Body className="mt-4 max-w-[26rem]">{text(c.body, lang)}</Body>
              <Caption className="mt-6">{text(c.status, lang)}</Caption>
              <Caption className="mt-2 max-w-[26rem]">{text(c.dataNote, lang)}</Caption>
            </div>

            <figure className="mx-auto w-full max-w-[47rem]">
              {/*
               * The render ships without an alpha channel and its own backdrop
               * is a warm off-white, so the old `multiply` blend only muddied
               * it against the cream page. It sits on a paper mat instead.
               */}
              <Sheet inset>
                <img
                  src={CLIENT_PHONES}
                  alt={
                    lang === "he"
                      ? "שני מסכי iPhone מתוכננים ללקוחה: קביעת תור עם AI והמלצות מוצר מותאמות"
                      : "Two designed client iPhone screens for AI appointment booking and personalized retail"
                  }
                  width={1448}
                  height={1086}
                  loading="lazy"
                  draggable={false}
                  className="block h-auto w-full"
                />
              </Sheet>
              <figcaption className="mt-3 text-center">
                <span
                  className="text-[10px] font-semibold uppercase tracking-[0.14em]"
                  style={{ color: CB.muted }}
                >
                  {text(c.status, lang)}
                </span>
              </figcaption>
            </figure>
          </div>
        </Reveal>
      </Spread>
    </Chapter>
  );
};

export default ClientAppImageSpread;
