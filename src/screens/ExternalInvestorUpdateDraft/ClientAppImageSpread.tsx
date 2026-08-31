import React from "react";
import { FINAL_CLIENT_APP, type UpdateLang } from "./finalCopy";
import {
  Body,
  Caption,
  Chapter,
  Display,
  Kicker,
  Reveal,
  Spread,
  displayFamily,
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
            style={{ fontFamily: displayFamily(lang) }}
            className="max-w-[30ch] text-[clamp(1.2rem,2vw,1.6rem)] italic leading-[1.3] text-[#8c6537]"
          >
            {text(c.transition, lang)}
          </p>

          <div className="mt-9 grid gap-x-10 gap-y-10 lg:grid-cols-[0.4fr_0.6fr] lg:items-center">
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
              <img
                src={CLIENT_PHONES}
                alt={
                  lang === "he"
                    ? "שני מסכי iPhone מתוכננים ללקוחה: קביעת תור עם AI והמלצות מוצר מותאמות"
                    : "Two designed client iPhone screens for AI appointment booking and personalized retail"
                }
                loading="lazy"
                draggable={false}
                className="block h-auto w-full"
                style={{ mixBlendMode: "multiply" }}
              />
              <figcaption className="mt-3 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-[#2b221b]/45">
                {text(c.status, lang)}
              </figcaption>
            </figure>
          </div>
        </Reveal>
      </Spread>
    </Chapter>
  );
};

export default ClientAppImageSpread;
