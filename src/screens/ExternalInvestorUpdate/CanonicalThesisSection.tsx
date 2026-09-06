import React from "react";
import { CANONICAL_BY_ID } from "./canonicalNarrative";
import { CB } from "./colorBarTokens";
import type { UpdateLang } from "./finalCopy";
import { Body, Display, Reveal, Rule, Spread, t as text } from "./EditorialPrimitives";

type CanonicalThesisSectionProps = {
  lang: UpdateLang;
  reducedMotion: boolean;
};

/** Preserves the source deck's thesis directly beneath the sanctioned live hero. */
export const CanonicalThesisSection: React.FC<CanonicalThesisSectionProps> = ({ lang, reducedMotion }) => {
  const step = CANONICAL_BY_ID.thesis;

  return (
    <section
      aria-label={text(step.headline, lang)}
      style={{
        paddingLeft: "var(--iu-gutter, 1.5rem)",
        paddingRight: "var(--iu-gutter, 1.5rem)",
        backgroundColor: CB.bg,
      }}
    >
      <Spread>
        <Reveal reducedMotion={reducedMotion}>
          <Rule strong />
          <div className="grid gap-x-16 gap-y-7 py-12 sm:py-16 lg:grid-cols-[0.58fr_0.42fr] lg:items-end">
            <Display lang={lang} size="feature" className="max-w-[19ch]">
              {text(step.headline, lang)}
            </Display>
            <Body className="max-w-[38rem] text-[1.05rem] leading-[1.7] sm:text-[1.18rem]">
              {text(step.support, lang)}
            </Body>
          </div>
          <Rule />
        </Reveal>
      </Spread>
    </section>
  );
};

export default CanonicalThesisSection;
