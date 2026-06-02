import React from "react";
import { motion } from "framer-motion";
import { Eyebrow, AssetSlot } from "../primitives";
import { ASSETS } from "../assetManifest";
import type { AssetSpec } from "../assetManifest";
import { SALON, TYPE, LAYOUT } from "../tokens";
import { EASE_OUT, DURATION } from "../motion";

interface SectionComponentProps {
  reducedMotion?: boolean;
}

interface Beat {
  asset: AssetSpec;
  alt: string;
  eyebrow: string;
  caption: React.ReactNode;
  detail: string;
  /** Source aspect ratio so the full frame shows with no cropping. */
  aspectRatio: string;
}

const BEATS: Beat[] = [
  {
    asset: ASSETS.heroStoryPhoto,
    alt: "A client booking by phone while the salon's AI surfaces the new appointment request at reception",
    eyebrow: "Two worlds, one platform",
    caption: <>A client books from her phone, and the salon&rsquo;s AI handles the rest.</>,
    detail: "From the gym to the chair, the request lands at reception as a structured appointment.",
    aspectRatio: "3 / 2",
  },
  {
    asset: ASSETS.heroStoryColoristPhoto,
    alt: "A colorist mixing on the Spectra scale gets an AI alert asking to notify the next client of a delay",
    eyebrow: "Detected at the color bar",
    caption: (
      <>Spectra sees the colorist is running late and asks to update Liora with one tap.</>
    ),
    detail: "It reads the formula on the connected scale and the clock, then offers the action.",
    aspectRatio: "4 / 3",
  },
  {
    asset: ASSETS.heroStoryDelayPhoto,
    alt: "Spectra AI notifies the client of a 20-minute delay while reception sees the schedule alert",
    eyebrow: "No human touch",
    caption: (
      <>The client is updated automatically, so the delay becomes time for another coffee.</>
    ),
    detail: "No calls, no scramble. Just a calm, on-brand message and a happier client.",
    aspectRatio: "3 / 2",
  },
];

/**
 * The salon-AI story as a stacked, alternating editorial flow: framed image on
 * one side, copy on the other, alternating right / left / right down the page.
 * Warm glass frames keep it inside the luxury-salon world.
 */
export const StoryFlowSection: React.FC<SectionComponentProps> = ({ reducedMotion = false }) => {
  return (
    <section
      id="story"
      aria-label="The salon AI handling a delay, end to end"
      className="relative w-full py-[clamp(72px,12vh,150px)]"
    >
      <div
        className="mx-auto"
        style={{ maxWidth: LAYOUT.maxWidth, paddingInline: LAYOUT.sidePad }}
      >
        <div className="flex flex-col gap-[clamp(56px,9vh,120px)]">
          {BEATS.map((beat, i) => (
            <StoryRow key={beat.asset.id} beat={beat} imageRight={i % 2 === 0} reducedMotion={reducedMotion} />
          ))}
        </div>
      </div>
    </section>
  );
};

const StoryRow: React.FC<{ beat: Beat; imageRight: boolean; reducedMotion: boolean }> = ({
  beat,
  imageRight,
  reducedMotion,
}) => {
  const enter = (delay: number) => ({
    initial: reducedMotion ? { opacity: 0 } : { opacity: 0, y: 26 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-12% 0px" },
    transition: { duration: DURATION.enter, ease: EASE_OUT, delay: reducedMotion ? 0 : delay },
  });

  return (
    <div className="grid items-center gap-8 lg:gap-16 lg:grid-cols-2">
      {/* Framed image */}
      <motion.div
        className={`order-1 ${imageRight ? "lg:order-2" : "lg:order-1"}`}
        {...enter(0)}
      >
        <div className="spv-glass relative overflow-hidden rounded-[28px]" style={{ padding: 10 }}>
          <div className="relative overflow-hidden rounded-[20px]">
            <AssetSlot
              asset={beat.asset}
              alt={beat.alt}
              aspectRatio={beat.aspectRatio}
              fit="cover"
              className="w-full"
            />
            {/* Soft warm wash to seat the image inside the salon world. */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(247,238,229,0.10) 0%, transparent 26%, transparent 74%, rgba(230,208,190,0.26) 100%)",
              }}
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{ boxShadow: "inset 0 0 50px rgba(84,45,30,0.16)" }}
            />
          </div>
        </div>
      </motion.div>

      {/* Copy */}
      <motion.div
        className={`order-2 ${imageRight ? "lg:order-1" : "lg:order-2"}`}
        {...enter(0.08)}
      >
        <Eyebrow align="left" className="mb-5">
          {beat.eyebrow}
        </Eyebrow>
        <p
          style={{
            fontSize: TYPE.h2,
            fontWeight: 500,
            lineHeight: 1.12,
            letterSpacing: "-0.02em",
            color: SALON.text,
          }}
        >
          {beat.caption}
        </p>
        <p className="mt-4" style={{ fontSize: TYPE.body, color: SALON.textSoft, maxWidth: 460 }}>
          {beat.detail}
        </p>
      </motion.div>
    </div>
  );
};
