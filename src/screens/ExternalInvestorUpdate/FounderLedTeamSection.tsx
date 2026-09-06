import React from "react";
import { usePdfExportMode } from "../SpectraInvestorExperience/primitives";
import { FINAL_PEOPLE, type Localized, type UpdateLang } from "./finalCopy";
import { BACKERS, CORE_TEAM, TEAM_ADVISOR } from "./intelligenceData";
import { CB, colorBarSans } from "./colorBarTokens";
import { Ledger, Sheet } from "./ColorBarPatterns";
import {
  Caption,
  Chapter,
  ChapterMark,
  Display,
  Kicker,
  Reveal,
  Rule,
  Spread,
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

  /* Masthead and backers both run as hairline-ruled rows: name, then role. */
  const peopleRows = (people: readonly { name: Localized; role: Localized }[]) =>
    people.map((person) => ({
      key: person.name.en,
      term: text(person.name, lang),
      detail: text(person.role, lang),
    }));

  return (
    <Chapter label={text(FINAL_PEOPLE.title, lang)} tone="paper" rhythm="feature" chapterStart>
      <Spread>
        <Reveal reducedMotion={reducedMotion}>
          <ChapterMark number="11" title={{ en: "Team", he: "Team" }} lang={lang} />
          <Kicker>{text(FINAL_PEOPLE.kicker, lang)}</Kicker>
          <Display lang={lang} size="chapter" className="mt-5 max-w-[26ch]">
            {text(FINAL_PEOPLE.title, lang)}
          </Display>

          <div className="mt-9 grid gap-x-14 gap-y-10 lg:grid-cols-[0.46fr_0.54fr]">
            <ul className="grid grid-cols-2 gap-4 sm:gap-5">
              {FOUNDERS.map((member) => {
                const media = FOUNDER_MEDIA[member.name.en as keyof typeof FOUNDER_MEDIA];
                return (
                  <li key={member.name.en} className="min-w-0">
                    <figure>
                      {/* Real photography, so the portrait may fill its well. */}
                      <Sheet inset>
                        <div className="aspect-square">
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
                      </Sheet>
                      <figcaption className="mt-3.5">
                        <h3
                          style={{ fontFamily: colorBarSans(lang), color: CB.ink }}
                          className="text-[1.05rem] font-semibold leading-tight tracking-[-0.03em] sm:text-[1.2rem]"
                        >
                          {text(member.name, lang)}
                        </h3>
                        <p
                          className="mt-1.5 text-[11px] font-semibold uppercase leading-4 tracking-[0.1em]"
                          style={{ color: CB.muted }}
                        >
                          {text(member.role, lang)}
                        </p>
                      </figcaption>
                    </figure>
                  </li>
                );
              })}
            </ul>

            <div className="lg:pt-1">
              <Rule strong />
              <Ledger rows={peopleRows(MASTHEAD)} />
              <Rule />
            </div>
          </div>

          <div className="mt-11 flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
            <Kicker>{text(COPY.backersKicker, lang)}</Kicker>
            <p
              style={{ fontFamily: colorBarSans(lang), color: CB.ink }}
              className="max-w-[34ch] text-[1.1rem] font-semibold leading-snug tracking-[-0.03em] sm:text-[1.3rem]"
            >
              {text(COPY.backersLine, lang)}
            </p>
          </div>

          <Rule strong className="mt-6" />
          <Ledger rows={peopleRows(BACKERS)} />
          <Rule />
          <Caption className="mt-4">{text(COPY.backersNote, lang)}</Caption>
        </Reveal>
      </Spread>
    </Chapter>
  );
};

export default FounderLedTeamSection;
