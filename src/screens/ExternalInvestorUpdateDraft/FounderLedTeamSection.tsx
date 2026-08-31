import React from "react";
import { usePdfExportMode } from "../SpectraInvestorExperience/primitives";
import { FINAL_PEOPLE, type Localized, type UpdateLang } from "./finalCopy";
import { BACKERS, CORE_TEAM, TEAM_ADVISOR } from "./intelligenceData";
import {
  Caption,
  Chapter,
  Display,
  Kicker,
  Reveal,
  Rule,
  Spread,
  displayFamily,
  loc,
  t as text,
} from "./EditorialPrimitives";

type SectionProps = {
  lang: UpdateLang;
  reducedMotion: boolean;
};

const COPY = {
  backersKicker: loc("Backed by", "מי שתמך"),
  backersLine: loc(
    "People who believed before this vision was obvious.",
    "אנשים שהאמינו עוד לפני שהחזון הזה היה מובן מאליו.",
  ),
  backersNote: loc(
    "Oren, Paul and Aquilo contribute expertise and are not investors in the company.",
    "אורן, פול ו-Aquilo תורמים מניסיונם ואינם משקיעים בחברה.",
  ),
} as const;

const FOUNDER_KEYS = ["Maor Ganon", "Elad Gotlieb"] as const;

const FOUNDER_MEDIA = {
  "Maor Ganon": {
    src: "/team/maor-ganon.jpg",
    width: 959,
    height: 1200,
    // Native portrait. Slight lift so the head stays inside the square crop.
    objectPosition: "50% 16%",
  },
  "Elad Gotlieb": {
    src: "/team/elad-gottlieb.jpg",
    width: 1200,
    height: 1200,
    // Square studio frame. Keep the face high and retain the crossed-arms crop.
    objectPosition: "50% 14%",
  },
} as const;

const FOUNDERS = FOUNDER_KEYS.map((key) => CORE_TEAM.find((member) => member.name.en === key)!);
const MASTHEAD = [
  ...CORE_TEAM.filter((member) => !FOUNDER_KEYS.includes(member.name.en as (typeof FOUNDER_KEYS)[number])),
  TEAM_ADVISOR,
];

const founderAlt = (name: Localized, role: Localized, lang: UpdateLang) =>
  lang === "he" ? `דיוקן של ${name.he}, ${role.he}` : `Portrait of ${name.en}, ${role.en}`;

export const FounderLedTeamSection: React.FC<SectionProps> = ({ lang, reducedMotion }) => {
  const pdfExport = usePdfExportMode();
  const eagerMedia = reducedMotion || pdfExport;

  return (
    <Chapter label={text(FINAL_PEOPLE.title, lang)} tone="paper" rhythm="feature">
      <Spread>
        <Reveal reducedMotion={reducedMotion}>
          <Kicker>{text(FINAL_PEOPLE.kicker, lang)}</Kicker>
          <Display lang={lang} size="chapter" className="mt-5 max-w-[26ch]">
            {text(FINAL_PEOPLE.title, lang)}
          </Display>

          <div className="mt-9 grid gap-x-14 gap-y-9 lg:grid-cols-[0.46fr_0.54fr]">
            <ul className="grid grid-cols-2 gap-4 sm:gap-5">
              {FOUNDERS.map((member) => {
                const media = FOUNDER_MEDIA[member.name.en as keyof typeof FOUNDER_MEDIA];
                return (
                  <li key={member.name.en} className="min-w-0">
                    <figure>
                      <div className="aspect-square overflow-hidden border border-[#2b221b]/12 bg-[#17110d]">
                        <img
                          src={media.src}
                          alt={founderAlt(member.name, member.role, lang)}
                          width={media.width}
                          height={media.height}
                          loading={eagerMedia ? "eager" : "lazy"}
                          decoding={eagerMedia ? "sync" : "async"}
                          className="h-full w-full object-cover"
                          style={{ objectPosition: media.objectPosition }}
                        />
                      </div>
                      <figcaption className="mt-3">
                        <h3
                          style={{ fontFamily: displayFamily(lang) }}
                          className="text-[1.05rem] leading-tight text-[#2b221b] sm:text-[1.2rem]"
                        >
                          {text(member.name, lang)}
                        </h3>
                        <p className="mt-1.5 text-[11px] font-semibold uppercase leading-4 tracking-[0.1em] text-[#2b221b]/45">
                          {text(member.role, lang)}
                        </p>
                      </figcaption>
                    </figure>
                  </li>
                );
              })}
            </ul>

            <dl className="lg:pt-1">
              <Rule strong />
              {MASTHEAD.map((member) => (
                <div
                  key={member.name.en}
                  className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-[#2b221b]/10 py-3.5"
                >
                  <dt
                    style={{ fontFamily: displayFamily(lang) }}
                    className="text-[1.05rem] leading-tight text-[#2b221b]"
                  >
                    {text(member.name, lang)}
                  </dt>
                  <dd className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#2b221b]/45">
                    {text(member.role, lang)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-11 flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
            <Kicker>{text(COPY.backersKicker, lang)}</Kicker>
            <p
              style={{ fontFamily: displayFamily(lang) }}
              className="max-w-[34ch] text-[1.15rem] italic leading-snug text-[#2b221b]/72 sm:text-[1.35rem]"
            >
              {text(COPY.backersLine, lang)}
            </p>
          </div>

          <Rule strong className="mt-6" />
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3">
            {BACKERS.map((person) => (
              <li
                key={person.name.en}
                className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-[#2b221b]/10 py-3.5 sm:me-8"
              >
                <span className="text-[0.95rem] font-light text-[#2b221b]">{text(person.name, lang)}</span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#2b221b]/42">
                  {text(person.role, lang)}
                </span>
              </li>
            ))}
          </ul>
          <Caption className="mt-4">{text(COPY.backersNote, lang)}</Caption>
        </Reveal>
      </Spread>
    </Chapter>
  );
};

export default FounderLedTeamSection;
