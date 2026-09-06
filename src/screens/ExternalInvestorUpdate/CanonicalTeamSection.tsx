import React from "react";
import { CANONICAL_BY_ID } from "./canonicalNarrative";
import { CB, colorBarSans } from "./colorBarTokens";
import type { Localized, UpdateLang } from "./finalCopy";
import {
  Chapter,
  ChapterMark,
  Display,
  Lede,
  PullQuote,
  Reveal,
  Spread,
  t as text,
} from "./EditorialPrimitives";

/** Act IV: heavier ledger rules for the analytical second half. */
const ACT_IV = {
  ledger: "rgba(92,72,42,0.22)",
} as const;

type CanonicalTeamSectionProps = {
  lang: UpdateLang;
  reducedMotion: boolean;
};

const FOUNDER_MEDIA = [
  {
    src: "/team/maor-ganon.jpg",
    width: 959,
    height: 1200,
    objectPosition: "50% 16%",
  },
  {
    src: "/team/elad-gottlieb.jpg",
    width: 1200,
    height: 1200,
    objectPosition: "50% 14%",
  },
] as const;

const chapterTitle = (chapter: string): Localized => ({ en: chapter, he: chapter });

const portraitAlt = (name: string, role: string, lang: UpdateLang) =>
  lang === "he" ? `דיוקן של ${name}, ${role}` : `Portrait of ${name}, ${role}`;

export const CanonicalTeamSection: React.FC<CanonicalTeamSectionProps> = ({
  lang,
  reducedMotion,
}) => {
  const step = CANONICAL_BY_ID.team;
  const founders = step.facts.slice(0, 2);
  const team = step.facts.slice(2);

  return (
    <Chapter
      id="team"
      label={text(step.headline, lang)}
      tone="paper"
      rhythm="feature"
      chapterStart
    >
      <Spread>
        <Reveal reducedMotion={reducedMotion}>
          <ChapterMark number="11" title={chapterTitle(step.chapter)} lang={lang} />

          <div className="mt-9 grid gap-x-16 gap-y-7 lg:mt-11 lg:grid-cols-[0.48fr_0.52fr] lg:items-end">
            <Display lang={lang} size="chapter" className="max-w-[17ch]">
              {text(step.headline, lang)}
            </Display>
            <Lede className="max-w-[31rem]">{text(step.support, lang)}</Lede>
          </div>
        </Reveal>

        <Reveal reducedMotion={reducedMotion} delay={0.05} className="mt-12 lg:mt-16">
          <div className="grid gap-x-14 gap-y-10 lg:grid-cols-[0.52fr_0.48fr]">
            <ol className="grid grid-cols-2 gap-4 sm:gap-6">
              {founders.map((person, index) => {
                const media = FOUNDER_MEDIA[index];
                const name = text(person.term, lang);
                const role = person.meta;

                return (
                  <li key={person.serial} className="min-w-0">
                    <figure>
                      <div
                        className="rounded-[18px] border bg-white p-1.5 sm:p-2"
                        style={{ borderColor: CB.line }}
                      >
                        <div
                          className="aspect-[4/5] overflow-hidden rounded-[13px]"
                          style={{ backgroundColor: CB.well }}
                        >
                          <img
                            src={media.src}
                            alt={portraitAlt(name, role, lang)}
                            width={media.width}
                            height={media.height}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover"
                            style={{ objectPosition: media.objectPosition }}
                          />
                        </div>
                      </div>
                      <figcaption className="mt-4">
                        <div className="flex items-baseline gap-2.5">
                          <span
                            dir="ltr"
                            aria-hidden="true"
                            className="text-[10px] font-extrabold tabular-nums tracking-[0.14em]"
                            style={{ color: CB.copperDeep }}
                          >
                            {person.serial}
                          </span>
                          <h3
                            className="text-[1.15rem] font-semibold leading-tight tracking-[-0.035em] sm:text-[1.35rem]"
                            style={{ color: CB.ink, fontFamily: colorBarSans(lang) }}
                          >
                            {name}
                          </h3>
                        </div>
                        <p
                          dir="ltr"
                          className={`mt-2 text-[10px] font-extrabold uppercase leading-[1.4] tracking-[0.13em] ${
                            lang === "he" ? "text-right" : "text-left"
                          }`}
                          style={{ color: CB.copperDeep }}
                        >
                          {role}
                        </p>
                        <p className="mt-3 text-[12px] leading-[1.6] sm:text-[13px]" style={{ color: CB.muted }}>
                          {text(person.detail, lang)}
                        </p>
                      </figcaption>
                    </figure>
                  </li>
                );
              })}
            </ol>

            <div>
              <div aria-hidden="true" className="h-[2px] w-full" style={{ backgroundColor: ACT_IV.ledger }} />
              <ol start={3}>
                {team.map((person) => (
                  <li
                    key={person.serial}
                    className="grid gap-x-5 gap-y-3 border-b py-5 sm:grid-cols-[auto_minmax(0,0.36fr)_minmax(0,1fr)] sm:items-baseline"
                    style={{ borderColor: ACT_IV.ledger }}
                  >
                    <span
                      dir="ltr"
                      aria-hidden="true"
                      className="text-[10px] font-extrabold tabular-nums tracking-[0.14em]"
                      style={{ color: CB.copperDeep }}
                    >
                      {person.serial}
                    </span>
                    <div>
                      <h3
                        className="text-[1rem] font-semibold leading-tight tracking-[-0.025em]"
                        style={{ color: CB.ink, fontFamily: colorBarSans(lang) }}
                      >
                        {text(person.term, lang)}
                      </h3>
                      <p
                        dir="ltr"
                        className={`mt-2 text-[10px] font-extrabold uppercase leading-[1.4] tracking-[0.12em] ${
                          lang === "he" ? "text-right" : "text-left"
                        }`}
                        style={{ color: CB.copperDeep }}
                      >
                        {person.meta}
                      </p>
                    </div>
                    <p className="text-[13px] leading-[1.65] sm:text-[14px]" style={{ color: CB.muted }}>
                      {text(person.detail, lang)}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Reveal>

        <Reveal reducedMotion={reducedMotion} delay={0.05}>
          <PullQuote lang={lang} className="mt-12 max-w-[46rem] lg:mt-14">
            {text(step.statement, lang)}
          </PullQuote>
        </Reveal>
      </Spread>
    </Chapter>
  );
};

export default CanonicalTeamSection;
