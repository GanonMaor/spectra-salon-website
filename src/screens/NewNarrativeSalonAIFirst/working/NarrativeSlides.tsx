import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bot,
  CalendarDays,
  Package,
  Scissors,
  Sparkles,
  Users,
} from "lucide-react";
import { CinematicSlide, SlideHeading } from "../sections/CinematicSlide";
import { ACCENTS, INK, type SlideTheme } from "../theme";
import {
  DUR,
  EASE_OUT,
  fadeIn,
  pickStaggerItem,
  stagger,
} from "../../SpectraInvestorExperience/visuals/demo/motion";
import { CustomerVideoRail } from "../visuals/CustomerVideoRail";

const IMAGE = {
  reception: "/investor-vision/salon-ai-live-demo/hero-reception-bg.png",
  colorRoom: "/investor-vision/hero/salon-color-room.jpg",
  colorStation: "/investor-vision/hero/salon-color-station.jpg",
  colorists: "/investor-vision/hero/salon-colorists.jpg",
  floor: "/investor-vision/hero/salon-floor.jpg",
  salon: "/investor-vision/hero/salon-hero.jpg",
  story: "/investor-vision/hero/salon-story.jpg",
  ai: "/investor-vision/salon-os/hero-salon-ai.png",
} as const;

const theme = (accent: keyof typeof ACCENTS, image: string): SlideTheme => ({
  ...ACCENTS[accent],
  image,
});

const THEMES = {
  thesis: theme("gold", IMAGE.colorRoom),
  market: theme("sky", IMAGE.salon),
  wedge: theme("copper", IMAGE.colorists),
  proof: theme("sage", IMAGE.colorStation),
  gtm: theme("sage", IMAGE.story),
  platform: theme("copper", IMAGE.floor),
  salonAI: theme("gold", IMAGE.ai),
  data: theme("sky", IMAGE.reception),
  model: theme("sage", IMAGE.colorRoom),
  landscape: theme("mauve", IMAGE.floor),
  team: theme("gold", IMAGE.reception),
  raise: theme("gold", IMAGE.colorStation),
  optionality: theme("gold", IMAGE.salon),
} as const;

const SOURCE_MARKET =
  "Sources: Mordor Intelligence (2026); Fortune Business Insights (2026). Market layers overlap and are shown for scale, not as additive TAM.";

const Shell: React.FC<{
  label: string;
  theme: SlideTheme;
  children: React.ReactNode;
  scrim?: "center" | "left" | "veil" | "both" | "split-right";
  align?: "center" | "left";
  constellation?: boolean;
  showBackgroundImage?: boolean;
}> = ({
  label,
  theme: slideTheme,
  children,
  scrim = "veil",
  align = "left",
  constellation = false,
  showBackgroundImage = false,
}) => (
  <CinematicSlide
    theme={slideTheme}
    ariaLabel={label}
    scrim={scrim}
    align={align}
    constellation={constellation}
    showBackgroundImage={showBackgroundImage}
    backgroundUnderlay={`radial-gradient(80% 85% at 78% 35%, ${slideTheme.glow}, transparent 72%), linear-gradient(145deg, #17110d 0%, #0d0b0a 52%, #080706 100%)`}
    fit
  >
    {children}
  </CinematicSlide>
);

const Eyebrow: React.FC<{ children: React.ReactNode; color: string }> = ({ children, color }) => (
  <div className="mb-4 flex items-center gap-2">
    <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
    <span className="text-[10px] font-semibold uppercase tracking-[0.26em]" style={{ color }}>
      {children}
    </span>
  </div>
);

const FinePrint: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[9px] font-light leading-relaxed tracking-[0.02em]" style={{ color: INK.faint }}>
    {children}
  </p>
);

const AnimatedGroup: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => {
  const reduced = useReducedMotion() ?? false;
  return (
    <motion.div
      className={className}
      variants={reduced ? fadeIn : stagger}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
};

export const ThesisSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  return (
    <Shell label="Thesis — building the autonomous salon" theme={THEMES.thesis} scrim="left">
      <div className="max-w-[780px]">
        <Eyebrow color={THEMES.thesis.accent}>01 / Thesis</Eyebrow>
        <motion.h1
          initial={{ opacity: 0, y: reduced ? 0 : 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DUR.slow, ease: EASE_OUT }}
          className="text-5xl font-light leading-[0.98] tracking-[-0.045em] sm:text-6xl lg:text-[5.4rem]"
          style={{ color: INK.strong, textShadow: "0 3px 36px rgba(0,0,0,.55)" }}
        >
          We solved the hard part.
          <br />
          <span style={{ color: THEMES.thesis.accent }}>Now we’re building the autonomous salon.</span>
        </motion.h1>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: DUR.enter, delay: reduced ? 0 : 0.25 }}
          className="mt-9 grid max-w-2xl gap-5 border-y py-5 sm:grid-cols-[1fr_auto]"
          style={{ borderColor: THEMES.thesis.accentBorder }}
        >
          <p className="max-w-xl text-lg font-light leading-relaxed" style={{ color: INK.soft }}>
            Spectra started in the color room — where product cost, inventory, craft and client
            experience meet. Today, that same data layer is becoming the foundation of Salon AI.
          </p>
          <div className="self-end text-right">
            <div className="text-[10px] uppercase tracking-[0.28em]" style={{ color: THEMES.thesis.accent }}>
              Spectra / Salon AI
            </div>
            <div className="mt-2 text-xs" style={{ color: INK.faint }}>September 2026</div>
          </div>
        </motion.div>
      </div>
    </Shell>
  );
};

export const MarketSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const rings = [
    { value: "$636B", label: "Beauty & personal care products", size: 430, color: ACCENTS.gold.accent },
    { value: "$285B", label: "Global salon services", size: 310, color: ACCENTS.copper.accent },
    { value: "$219B", label: "Salon hair-care services", size: 190, color: ACCENTS.sky.accent },
  ];
  return (
    <Shell label="Market — three overlapping economic layers" theme={THEMES.market} scrim="split-right">
      <div className="grid h-full items-center gap-8 lg:grid-cols-[0.84fr_1.16fr]">
        <div>
          <SlideHeading theme={THEMES.market} eyebrow="02 / Market" size="h1">
            The market is massive before software enters the picture.
          </SlideHeading>
          <p className="mt-6 max-w-lg text-base font-light leading-relaxed" style={{ color: INK.soft }}>
            Three economic layers around the same salon. They overlap — shown for scale, not added together.
          </p>
          <div className="mt-8 border-l pl-5" style={{ borderColor: THEMES.market.accent }}>
            <p className="text-xl font-light leading-snug" style={{ color: INK.strong }}>
              We operate at the intersection of services, products and software — inside a market
              measured in hundreds of billions.
            </p>
          </div>
          <div className="mt-7 grid grid-cols-3 gap-3 lg:hidden">
            {rings.map((ring) => (
              <div key={ring.value} className="border-t pt-3" style={{ borderColor: `${ring.color}99` }}>
                <div className="text-2xl font-light tracking-[-0.04em]" style={{ color: ring.color }}>{ring.value}</div>
                <div className="mt-1 text-[8px] uppercase leading-snug tracking-[0.08em]" style={{ color: INK.faint }}>{ring.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-7 max-w-xl"><FinePrint>{SOURCE_MARKET}</FinePrint></div>
        </div>
        <div className="relative hidden h-[570px] items-center justify-center lg:flex">
          {rings.map((ring, index) => (
            <motion.div
              key={ring.value}
              initial={{ opacity: 0, scale: reduced ? 1 : 0.76 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: DUR.slow, ease: EASE_OUT, delay: reduced ? 0 : index * 0.14 }}
              className="absolute flex items-start justify-center rounded-full border pt-7 text-center"
              style={{
                width: ring.size,
                height: ring.size,
                borderColor: `${ring.color}99`,
                background: `radial-gradient(circle, ${ring.color}14, transparent 66%)`,
                boxShadow: `0 0 50px ${ring.color}12`,
              }}
            >
              <div>
                <div className="text-4xl font-light tracking-[-0.045em]" style={{ color: ring.color }}>{ring.value}</div>
                <div className="mt-1 max-w-[180px] text-[11px] uppercase tracking-[0.12em]" style={{ color: INK.soft }}>
                  {ring.label} — 2026
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Shell>
  );
};

export const WedgeSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const benefits = [
    ["Less waste", "Salons see what was used, what was discarded and what needs to change."],
    ["Higher efficiency & profitability", "Product cost becomes a number you can actually manage."],
    ["Professional memory for every client", "Formulas, quantities and history persist across visits."],
    ["A personalized client journey", "Hundreds of thousands of visits create context for the next service."],
  ];
  return (
    <Shell label="Wedge — color room data foundation" theme={THEMES.wedge} scrim="both">
      <div className="grid h-full items-center gap-12 lg:grid-cols-[0.78fr_1.22fr]">
        <div>
          <SlideHeading theme={THEMES.wedge} eyebrow="03 / Wedge" size="h1">
            We solved a painful problem. In the process, we built something bigger.
          </SlideHeading>
          <p className="mt-6 max-w-xl text-base font-light leading-relaxed" style={{ color: INK.soft }}>
            The color room was manual, expensive and almost invisible. We turned every mix into a data event.
          </p>
          <motion.div
            initial={{ opacity: 0, scale: reduced ? 1 : 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: DUR.slow, ease: EASE_OUT, delay: reduced ? 0 : 0.2 }}
            className="mt-9"
          >
            <div className="text-7xl font-light tracking-[-0.06em] sm:text-8xl" style={{ color: THEMES.wedge.accent }}>30M+</div>
            <div className="mt-1 text-xs uppercase tracking-[0.2em]" style={{ color: INK.soft }}>grams of color measured in real use</div>
          </motion.div>
        </div>
        <AnimatedGroup className="relative border-l pl-8 lg:pl-12" >
          <div className="absolute -left-[5px] top-0 h-2.5 w-2.5 rounded-full" style={{ background: THEMES.wedge.accent }} />
          {benefits.map(([title, detail], i) => (
            <motion.div
              key={title}
              variants={pickStaggerItem(reduced)}
              className="grid gap-2 border-b py-5 sm:grid-cols-[36px_1fr]"
              style={{ borderColor: "rgba(255,255,255,.13)" }}
            >
              <span className="text-xs tabular-nums" style={{ color: THEMES.wedge.accent }}>0{i + 1}</span>
              <div>
                <h3 className="text-xl font-light" style={{ color: INK.strong }}>{title}</h3>
                <p className="mt-1 max-w-lg text-sm font-light leading-relaxed" style={{ color: INK.soft }}>{detail}</p>
              </div>
            </motion.div>
          ))}
        </AnimatedGroup>
      </div>
    </Shell>
  );
};

export const ProofSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const metrics = [
    ["170+", "Salons"],
    ["12", "Countries"],
    ["500+", "Professionals"],
    ["465K+", "Client visits"],
    ["556K+", "Services / formulas"],
    ["221", "Brands"],
  ];
  return (
    <Shell label="Proof — real usage" theme={THEMES.proof} scrim="veil">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_0.72fr]">
          <SlideHeading theme={THEMES.proof} eyebrow="04 / Proof" size="h1">
            The proof is real usage — not a pitch.
          </SlideHeading>
          <p className="border-l pl-5 text-base font-light leading-relaxed" style={{ color: INK.soft, borderColor: THEMES.proof.accent }}>
            Spectra has already operated inside real salons, with real professionals, products and clients.
          </p>
        </div>
        <AnimatedGroup className="mt-7 grid grid-cols-2 border-y sm:grid-cols-3 lg:grid-cols-6" >
          {metrics.map(([value, label], i) => (
            <motion.div
              key={label}
              variants={pickStaggerItem(reduced)}
              className="relative px-4 py-5 text-center"
              style={{ borderRight: i < metrics.length - 1 ? "1px solid rgba(255,255,255,.12)" : undefined }}
            >
              <div className="text-4xl font-light tracking-[-0.05em]" style={{ color: i === 0 ? THEMES.proof.accent : INK.strong }}>{value}</div>
              <div className="mt-2 text-[10px] uppercase tracking-[0.16em]" style={{ color: INK.faint }}>{label}</div>
            </motion.div>
          ))}
        </AnimatedGroup>
        <div className="mt-7 grid items-end gap-8 lg:grid-cols-[auto_1fr]">
          <div>
            <div className="text-5xl font-light tracking-[-0.05em]" style={{ color: THEMES.proof.accent }}>~$121K ARR</div>
            <div className="mt-2 text-xs uppercase tracking-[0.15em]" style={{ color: INK.faint }}>Recurring revenue built from the first product</div>
          </div>
          <p className="max-w-xl justify-self-end text-right text-xl font-light leading-snug" style={{ color: INK.strong }}>
            The data is created through daily work — which makes it hard to recreate later.
          </p>
        </div>
        <div className="mt-6 flex h-[190px] flex-col overflow-hidden sm:h-[210px]">
          <CustomerVideoRail accent={THEMES.proof.accent} autoplay={!reduced} />
        </div>
        <p className="mt-2 text-[9px] uppercase tracking-[0.14em]" style={{ color: INK.faint }}>
          Real customer footage · salons using Spectra in daily work
        </p>
      </div>
    </Shell>
  );
};

export const GTMSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const steps = [
    ["Professional community", "Access to the right people"],
    ["Demo / trial", "A short, clear experience"],
    ["Onboarding", "Product + scale + training"],
    ["Usage", "Repeated use in every color service"],
    ["Referral", "Professionals bring professionals"],
  ];
  return (
    <Shell label="Go-to-market — proven journey" theme={THEMES.gtm} scrim="veil">
      <SlideHeading theme={THEMES.gtm} eyebrow="05 / GTM" size="h1">
        We already learned how the market opens.
      </SlideHeading>
      <p className="mt-5 max-w-3xl text-base font-light leading-relaxed" style={{ color: INK.soft }}>
        Until now, most of our energy went into product. Now we can invest more into the distribution engine that already created paying customers.
      </p>
      <AnimatedGroup className="mt-10 grid gap-3 lg:grid-cols-5">
        {steps.map(([title, detail], i) => (
          <motion.div key={title} variants={pickStaggerItem(reduced)} className="relative border-t pt-5" style={{ borderColor: THEMES.gtm.accentBorder }}>
            <div className="mb-4 flex items-center">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border text-xs" style={{ borderColor: THEMES.gtm.accent, color: THEMES.gtm.accent }}>
                {i + 1}
              </span>
              {i < steps.length - 1 && <ArrowRight className="ml-auto hidden h-4 w-4 lg:block" style={{ color: INK.faint }} />}
            </div>
            <h3 className="text-lg font-light" style={{ color: INK.strong }}>{title}</h3>
            <p className="mt-2 text-xs font-light leading-relaxed" style={{ color: INK.soft }}>{detail}</p>
          </motion.div>
        ))}
      </AnimatedGroup>
      <div className="mt-10 grid gap-6 border-y py-6 sm:grid-cols-3" style={{ borderColor: "rgba(255,255,255,.13)" }}>
        {[["<5%", "Historical churn"], ["30–35", "Trial days"], ["170+", "Salons that already completed the journey"]].map(([value, label]) => (
          <div key={label}>
            <div className="text-4xl font-light" style={{ color: THEMES.gtm.accent }}>{value}</div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.15em]" style={{ color: INK.faint }}>{label}</div>
          </div>
        ))}
      </div>
      <p className="mt-7 text-xl font-light" style={{ color: INK.strong }}>
        The next-stage principle: don’t invent a new GTM — <span style={{ color: THEMES.gtm.accent }}>increase speed, capacity and precision.</span>
      </p>
    </Shell>
  );
};

export const PlatformSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const layers = [
    { title: "Color Intelligence", line: "Measure real-world usage", icon: Scissors, accent: ACCENTS.sky.accent },
    { title: "SalonOS", line: "Run the business", icon: BarChart3, accent: ACCENTS.copper.accent },
    { title: "Salon AI", line: "The system starts acting", icon: Bot, accent: ACCENTS.gold.accent },
  ];
  return (
    <Shell label="Platform — from unique data to salon operating system" theme={THEMES.platform} scrim="both">
      <div className="grid h-full items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <SlideHeading theme={THEMES.platform} eyebrow="06 / Platform" size="h1">
            From unique data — to the salon operating system.
          </SlideHeading>
          <p className="mt-6 max-w-xl text-base font-light leading-relaxed" style={{ color: INK.soft }}>
            The market already pays for management software. Our job is not to teach salons to buy software — it is to change what the software can do.
          </p>
          <div className="mt-9">
            <div className="text-[10px] uppercase tracking-[0.2em]" style={{ color: THEMES.platform.accent }}>A category already proven at scale</div>
            <div className="mt-4 grid grid-cols-3 gap-5">
              {[["140K+", "Fresha"], ["30K+", "Zenoti"], ["12K+", "Phorest"]].map(([value, name]) => (
                <div key={name} className="border-t pt-3" style={{ borderColor: THEMES.platform.accentBorder }}>
                  <div className="text-3xl font-light" style={{ color: INK.strong }}>{value}</div>
                  <div className="mt-1 text-xs" style={{ color: INK.faint }}>{name} — businesses</div>
                </div>
              ))}
            </div>
            <div className="mt-6"><FinePrint>Sources: Fresha (2026), Zenoti (2026), Phorest (2026). Company-reported counts use different definitions and are shown only as evidence of category maturity.</FinePrint></div>
          </div>
        </div>
        <AnimatedGroup className="relative space-y-4">
          {layers.map((layer, i) => {
            const Icon = layer.icon;
            return (
              <motion.div
                key={layer.title}
                variants={pickStaggerItem(reduced)}
                className="relative flex items-center gap-5 rounded-full border px-6 py-5"
                style={{
                  marginLeft: `${i * 9}%`,
                  width: `${100 - i * 9}%`,
                  borderColor: `${layer.accent}88`,
                  background: `linear-gradient(90deg, ${layer.accent}18, rgba(10,7,5,.35))`,
                }}
              >
                <Icon className="h-6 w-6" style={{ color: layer.accent }} />
                <div>
                  <div className="text-2xl font-light" style={{ color: INK.strong }}>{layer.title}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.12em]" style={{ color: layer.accent }}>{layer.line}</div>
                </div>
              </motion.div>
            );
          })}
          <p className="pt-5 text-right text-2xl font-light" style={{ color: INK.strong }}>
            No need to create a new category.
            <br /><span style={{ color: THEMES.platform.accent }}>Build a better intelligence layer.</span>
          </p>
        </AnimatedGroup>
      </div>
    </Shell>
  );
};

export const SalonAISlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const capabilities = [
    [CalendarDays, "Smart scheduling", "Understands demand, time, skills and profitability."],
    [Package, "Autonomous inventory", "Predicts consumption, exceptions and reorders."],
    [Users, "Client memory", "Formulas, history and preferences in one place."],
    [BarChart3, "Profit engine", "Cost and profitability in real time."],
    [Sparkles, "Team assistant", "Workload, performance and team recommendations."],
    [Bot, "Owner agent", "Summaries, exceptions and actions for the owner."],
  ] as const;
  const leftCapabilities = capabilities.filter((_, index) => index % 2 === 0);
  const rightCapabilities = capabilities.filter((_, index) => index % 2 === 1);
  return (
    <Shell label="Salon AI — the salon intelligence layer" theme={THEMES.salonAI} scrim="veil">
      <div className="text-center">
        <SlideHeading theme={THEMES.salonAI} eyebrow="07 / Salon AI" size="h1" align="center">
          What do we bring that is actually new?
        </SlideHeading>
        <p className="mx-auto mt-4 max-w-3xl text-base font-light" style={{ color: INK.soft }}>
          Not another dashboard that explains what happened. A system that understands, recommends — and gradually acts.
        </p>
      </div>
      <div className="relative mx-auto mt-8 max-w-6xl">
        <div className="mx-auto mb-6 h-[310px] w-[160px] overflow-hidden rounded-[26px] border bg-black lg:hidden" style={{ borderColor: THEMES.salonAI.accentBorder }}>
          <img
            src="/investor-vision/salon-ai-live-demo/mobile-ai-team.png"
            alt="Salon AI team orchestration product screen"
            className="h-full w-full object-cover object-top"
            loading="lazy"
          />
        </div>
        <AnimatedGroup className="grid gap-y-3 sm:grid-cols-2 sm:gap-x-6 lg:hidden">
          {capabilities.map(([Icon, title, detail]) => (
            <motion.div
              key={title}
              variants={pickStaggerItem(reduced)}
              className="flex gap-4 border-t py-4"
              style={{ borderColor: "rgba(255,255,255,.14)" }}
            >
              <Icon className="mt-1 h-5 w-5 shrink-0" style={{ color: THEMES.salonAI.accent }} />
              <div>
                <h3 className="text-lg font-light" style={{ color: INK.strong }}>{title}</h3>
                <p className="mt-1 text-xs font-light leading-relaxed" style={{ color: INK.soft }}>{detail}</p>
              </div>
            </motion.div>
          ))}
        </AnimatedGroup>
        <div className="hidden grid-cols-[1fr_190px_1fr] items-center gap-8 lg:grid">
          <AnimatedGroup className="space-y-3">
            {leftCapabilities.map(([Icon, title, detail]) => (
              <motion.div key={title} variants={pickStaggerItem(reduced)} className="flex flex-row-reverse gap-4 border-t py-4 text-right" style={{ borderColor: "rgba(255,255,255,.14)" }}>
                <Icon className="mt-1 h-5 w-5 shrink-0" style={{ color: THEMES.salonAI.accent }} />
                <div>
                  <h3 className="text-lg font-light" style={{ color: INK.strong }}>{title}</h3>
                  <p className="mt-1 text-xs font-light leading-relaxed" style={{ color: INK.soft }}>{detail}</p>
                </div>
              </motion.div>
            ))}
          </AnimatedGroup>
          <motion.div
            initial={{ opacity: 0, scale: reduced ? 1 : 0.82 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: DUR.slow, ease: EASE_OUT }}
            className="relative mx-auto h-[330px] w-[170px] overflow-hidden rounded-[28px] border bg-black"
            style={{ borderColor: THEMES.salonAI.accentBorder, boxShadow: `0 26px 70px rgba(0,0,0,.5), 0 0 60px ${THEMES.salonAI.glow}` }}
          >
            <img
              src="/investor-vision/salon-ai-live-demo/mobile-ai-team.png"
              alt="Salon AI team orchestration product screen"
              className="h-full w-full object-cover object-top"
              loading="lazy"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-[#d9b981]/10" />
          </motion.div>
          <AnimatedGroup className="space-y-3">
            {rightCapabilities.map(([Icon, title, detail]) => (
              <motion.div key={title} variants={pickStaggerItem(reduced)} className="flex gap-4 border-t py-4" style={{ borderColor: "rgba(255,255,255,.14)" }}>
                <Icon className="mt-1 h-5 w-5 shrink-0" style={{ color: THEMES.salonAI.accent }} />
                <div>
                  <h3 className="text-lg font-light" style={{ color: INK.strong }}>{title}</h3>
                  <p className="mt-1 text-xs font-light leading-relaxed" style={{ color: INK.soft }}>{detail}</p>
                </div>
              </motion.div>
            ))}
          </AnimatedGroup>
        </div>
      </div>
    </Shell>
  );
};

export const DataSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const audiences = [
    ["Salon owner", "Benchmarks, profitability, pricing, decisions."],
    ["Professionals", "History, formulas, recommendations, consistency."],
    ["Brands & manufacturers", "Actual usage, penetration, shades, demand."],
    ["Distributors", "Demand forecasting, assortment and inventory."],
    ["Chains & groups", "Branch comparison, performance and standards."],
  ];
  return (
    <Shell label="Data — every salon action becomes industry intelligence" theme={THEMES.data} scrim="veil">
      <div className="grid h-full items-center gap-10 lg:grid-cols-[0.82fr_1.18fr]">
        <div>
          <SlideHeading theme={THEMES.data} eyebrow="08 / Data" size="h1">
            Every salon action becomes industry intelligence.
          </SlideHeading>
          <p className="mt-6 max-w-xl text-base font-light leading-relaxed" style={{ color: INK.soft }}>
            The data is not stored to make charts. It is built to answer different questions for different players.
          </p>
          <p className="mt-9 text-2xl font-light leading-snug" style={{ color: INK.strong }}>
            The advantage is not “a database.”
            <br /><span style={{ color: THEMES.data.accent }}>It is live data that keeps being created every day.</span>
          </p>
          <div className="mt-6 text-[10px] uppercase tracking-[0.22em]" style={{ color: INK.faint }}>
            Aggregated <span style={{ color: THEMES.data.accent }}>•</span> Permissioned <span style={{ color: THEMES.data.accent }}>•</span> Privacy-first
          </div>
        </div>
        <AnimatedGroup className="mt-8 space-y-4 lg:hidden">
          {audiences.map(([title, detail]) => (
            <motion.div key={title} variants={pickStaggerItem(reduced)} className="border-t pt-3" style={{ borderColor: THEMES.data.accentBorder }}>
              <h3 className="text-base font-light" style={{ color: INK.strong }}>{title}</h3>
              <p className="mt-1 text-xs font-light leading-relaxed" style={{ color: INK.soft }}>{detail}</p>
            </motion.div>
          ))}
        </AnimatedGroup>
        <div className="relative hidden min-h-[520px] lg:block">
          <motion.div
            initial={{ opacity: 0, scale: reduced ? 1 : 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: DUR.slow, ease: EASE_OUT }}
            className="absolute left-1/2 top-1/2 z-10 flex h-44 w-44 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-center"
            style={{ borderColor: THEMES.data.accent, background: "rgba(12,9,7,.82)", boxShadow: `0 0 90px ${THEMES.data.glow}` }}
          >
            <div className="text-2xl font-light uppercase tracking-[0.16em]" style={{ color: INK.strong }}>Live<br /><span style={{ color: THEMES.data.accent }}>Industry Data</span></div>
          </motion.div>
          <AnimatedGroup className="absolute inset-0">
            {audiences.map(([title, detail], i) => {
              const positions = ["left-0 top-5", "right-0 top-16", "left-2 top-[43%]", "right-0 bottom-0", "left-0 bottom-0"];
              return (
                <motion.div
                  key={title}
                  variants={pickStaggerItem(reduced)}
                  className={`absolute w-[230px] border-t pt-3 ${positions[i]}`}
                  style={{ borderColor: THEMES.data.accentBorder }}
                >
                  <h3 className="text-base font-light" style={{ color: INK.strong }}>{title}</h3>
                  <p className="mt-1 text-xs font-light leading-relaxed" style={{ color: INK.soft }}>{detail}</p>
                </motion.div>
              );
            })}
          </AnimatedGroup>
        </div>
      </div>
    </Shell>
  );
};

export const ModelSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const levels = [
    { value: "~$80", label: "Color Intelligence", height: 120, color: ACCENTS.sky.accent },
    { value: "~$160", label: "SalonOS", height: 210, color: ACCENTS.copper.accent },
    { value: "~$500", label: "Salon AI", height: 330, color: ACCENTS.gold.accent },
  ];
  return (
    <Shell label="Model — same customer, more value and revenue" theme={THEMES.model} scrim="split-right">
      <div className="grid h-full items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <SlideHeading theme={THEMES.model} eyebrow="09 / Model" size="h1">
            Same customer. More value. More revenue.
          </SlideHeading>
          <p className="mt-5 max-w-xl text-base font-light leading-relaxed" style={{ color: INK.soft }}>
            The model grows in two directions: deeper software value per salon, and aggregated intelligence for the industry.
          </p>
          <div className="mt-9 border-y py-5" style={{ borderColor: THEMES.model.accentBorder }}>
            <div className="text-[10px] uppercase tracking-[0.2em]" style={{ color: THEMES.model.accent }}>A second revenue stream — later</div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs" style={{ color: INK.soft }}>
              <span>Benchmark reports</span><span>Manufacturer insights</span><span>Demand forecasting for distributors</span><span>Anonymous market panels</span>
            </div>
          </div>
          <p className="mt-6 text-sm font-light leading-relaxed" style={{ color: INK.soft }}>
            We do not sell personal client data. The value is in aggregated, permissioned and anonymized intelligence.
          </p>
          <p className="mt-5 text-xl font-light" style={{ color: INK.strong }}>
            SaaS increases ARPU. <span style={{ color: THEMES.model.accent }}>Data can create an additional revenue engine.</span>
          </p>
        </div>
        <div>
          <div className="flex h-[410px] items-end justify-center gap-5 border-b px-5" style={{ borderColor: "rgba(255,255,255,.15)" }}>
            {levels.map((level, i) => (
              <motion.div
                key={level.label}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: level.height, opacity: 1 }}
                transition={{ duration: DUR.slow, ease: EASE_OUT, delay: reduced ? 0 : i * 0.15 }}
                className="relative flex w-[28%] items-start justify-center rounded-t-[38px] border-x border-t pt-7 text-center"
                style={{ borderColor: `${level.color}88`, background: `linear-gradient(180deg, ${level.color}30, ${level.color}08)` }}
              >
                <div>
                  <div className="text-4xl font-light tracking-[-0.05em]" style={{ color: level.color }}>{level.value}</div>
                  <div className="mt-2 text-[10px] uppercase tracking-[0.12em]" style={{ color: INK.soft }}>{level.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-4 text-center text-[10px] uppercase tracking-[0.2em]" style={{ color: INK.faint }}>Target average monthly ARPU</div>
        </div>
      </div>
    </Shell>
  );
};

export const LandscapeSlide: React.FC = () => (
  <Shell label="Landscape — fragmented market" theme={THEMES.landscape} scrim="veil">
    <div className="grid items-end gap-8 lg:grid-cols-[1fr_0.75fr]">
      <SlideHeading theme={THEMES.landscape} eyebrow="10 / Landscape" size="h1">
        The market is crowded — but fragmented.
      </SlideHeading>
      <p className="border-l pl-5 text-base font-light leading-relaxed" style={{ color: INK.soft, borderColor: THEMES.landscape.accent }}>
        Some players understand salon management. Others understand product cost. We connect the physical service layer to the operating system.
      </p>
    </div>
    <div className="mt-9 grid items-stretch gap-5 lg:grid-cols-[1fr_1.15fr_1fr]">
      <div className="border-y py-6 text-center" style={{ borderColor: ACCENTS.sky.accentBorder }}>
        <div className="text-[10px] uppercase tracking-[0.2em]" style={{ color: ACCENTS.sky.accent }}>Cost optimization</div>
        <div className="mt-5 space-y-2 text-2xl font-light" style={{ color: INK.strong }}><div>Vish</div><div>SalonScale</div></div>
        <p className="mt-5 text-xs" style={{ color: INK.faint }}>Track color, cost and inventory</p>
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: DUR.slow, ease: EASE_OUT }}
        className="relative flex flex-col justify-center rounded-[44px] border px-8 py-7 text-center"
        style={{ borderColor: THEMES.landscape.accent, background: `radial-gradient(circle, ${THEMES.landscape.glow}, rgba(12,9,7,.62))` }}
      >
        <div className="text-3xl font-light tracking-[0.28em]" style={{ color: INK.strong }}>SPECTRA</div>
        <div className="mt-5 text-sm uppercase leading-loose tracking-[0.14em]" style={{ color: THEMES.landscape.accent }}>
          Product usage data<br />+ Salon OS<br />+ AI execution layer
        </div>
      </motion.div>
      <div className="border-y py-6 text-center" style={{ borderColor: ACCENTS.copper.accentBorder }}>
        <div className="text-[10px] uppercase tracking-[0.2em]" style={{ color: ACCENTS.copper.accent }}>Management systems</div>
        <div className="mt-5 grid grid-cols-2 gap-y-2 text-lg font-light" style={{ color: INK.strong }}>
          {["Zenoti", "Phorest", "Fresha", "Mangomint", "Boulevard", "Mindbody"].map((name) => <div key={name}>{name}</div>)}
        </div>
      </div>
    </div>
    <div className="mt-8 grid gap-8 border-t pt-5 lg:grid-cols-2" style={{ borderColor: "rgba(255,255,255,.13)" }}>
      <p className="text-lg font-light" style={{ color: INK.strong }}>
        Key difference: our data starts with what was actually used and consumed during the service — not only with the calendar transaction.
      </p>
      <p className="text-lg font-light" style={{ color: INK.soft }}>
        AI is already entering management platforms. So the moat must be <span style={{ color: THEMES.landscape.accent }}>the data and workflow</span> — not the word “AI.”
      </p>
    </div>
    <div className="mt-4"><FinePrint>Current positioning verified from Vish, SalonScale, Zenoti, Phorest, Fresha, Mangomint, Boulevard and Mindbody websites (2026).</FinePrint></div>
  </Shell>
);

export const TeamSlide: React.FC = () => {
  const team = [
    ["03", "Achla", "Engineering Lead", "Leads the platform build and the transition to SalonOS."],
    ["04", "Roy", "Growth / Marketing", "Sharpens market, message and customer acquisition."],
    ["05", "Paul", "Industry Data Advisor", "Data experience from the professional beauty industry."],
  ];
  return (
    <Shell label="Team — built around the problem" theme={THEMES.team} scrim="veil">
      <div className="grid h-full items-center gap-8 lg:grid-cols-[0.88fr_1.12fr]">
        <div>
          <SlideHeading theme={THEMES.team} eyebrow="11 / Team" size="h1">
            The team was built around the problem.
          </SlideHeading>
          <p className="mt-5 max-w-xl text-base font-light leading-relaxed" style={{ color: INK.soft }}>
            Industry, product, engineering, operations and data — not software from the outside.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {[
              { n: "01", name: "Maor", role: "CEO / Product", line: "Professional stylist and salon owner. Builds the product from inside the workflow.", src: "/team/maor-ganon.jpg", pos: "50% 15%" },
              { n: "02", name: "Elad", role: "Co-Founder / Operations", line: "Finance, operations and the ability to turn vision into a working company.", src: "/team/elad-gottlieb.jpg", pos: "50% 14%" },
            ].map((person) => (
              <figure key={person.name}>
                <div className="aspect-[4/3] overflow-hidden border" style={{ borderColor: THEMES.team.accentBorder }}>
                  <img src={person.src} alt={`${person.name}, ${person.role}`} className="h-full w-full object-cover" style={{ objectPosition: person.pos }} />
                </div>
                <figcaption className="mt-3">
                  <div className="text-[9px] tracking-[0.18em]" style={{ color: THEMES.team.accent }}>{person.n} / {person.role}</div>
                  <div className="mt-1 text-xl font-light" style={{ color: INK.strong }}>{person.name}</div>
                  <p className="mt-1 text-[11px] font-light leading-relaxed" style={{ color: INK.soft }}>{person.line}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
        <div>
          {team.map(([n, name, role, line]) => (
            <div key={name} className="grid gap-4 border-t py-6 sm:grid-cols-[34px_0.75fr_1.25fr]" style={{ borderColor: "rgba(255,255,255,.14)" }}>
              <span className="text-xs" style={{ color: THEMES.team.accent }}>{n}</span>
              <div>
                <div className="text-2xl font-light" style={{ color: INK.strong }}>{name}</div>
                <div className="mt-1 text-[9px] uppercase tracking-[0.14em]" style={{ color: THEMES.team.accent }}>{role}</div>
              </div>
              <p className="text-sm font-light leading-relaxed" style={{ color: INK.soft }}>{line}</p>
            </div>
          ))}
          <p className="mt-9 border-l pl-6 text-2xl font-light leading-snug" style={{ borderColor: THEMES.team.accent, color: INK.strong }}>
            Our edge is proximity: <span style={{ color: THEMES.team.accent }}>we know the chair, the color room and the code.</span>
          </p>
        </div>
      </div>
    </Shell>
  );
};

export const RaiseSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const allocation = [
    [40, "Product + AI", "Complete SalonOS, agents and core workflows."],
    [30, "U.S. expansion", "Acquisition, partnerships and increased sales capacity."],
    [20, "Onboarding + Data", "Implementation, catalog, support and deeper data capture."],
    [10, "Infrastructure + Security", "Reliability, permissions, privacy and infrastructure."],
  ] as const;
  return (
    <Shell label="Raise — why one million dollars now" theme={THEMES.raise} scrim="veil">
      <div className="grid h-full items-center gap-10 lg:grid-cols-[0.72fr_1.28fr]">
        <div>
          <Eyebrow color={THEMES.raise.accent}>12 / Raise</Eyebrow>
          <div className="text-8xl font-light tracking-[-0.065em] lg:text-[8.5rem]" style={{ color: THEMES.raise.accent }}>$1M</div>
          <h2 className="mt-2 text-4xl font-light tracking-[-0.04em]" style={{ color: INK.strong }}>Why now?</h2>
          <p className="mt-5 max-w-md text-base font-light leading-relaxed" style={{ color: INK.soft }}>
            To take a product that already created usage and data — and prove the platform, distribution and economics of the next stage.
          </p>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em]" style={{ color: THEMES.raise.accent }}>Proposed use of funds</div>
          <AnimatedGroup className="mt-4 space-y-4">
            {allocation.map(([percent, label, detail]) => (
              <motion.div key={label} variants={pickStaggerItem(reduced)}>
                <div className="mb-2 grid grid-cols-[48px_0.7fr_1.3fr] items-baseline gap-4">
                  <span className="text-xl font-light tabular-nums" style={{ color: THEMES.raise.accent }}>{percent}%</span>
                  <span className="text-sm font-medium" style={{ color: INK.strong }}>{label}</span>
                  <span className="text-xs font-light" style={{ color: INK.soft }}>{detail}</span>
                </div>
                <div className="h-[3px] w-full" style={{ background: "rgba(255,255,255,.12)" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: DUR.slow, ease: EASE_OUT }}
                    className="h-full"
                    style={{ background: THEMES.raise.accent }}
                  />
                </div>
              </motion.div>
            ))}
          </AnimatedGroup>
          <div className="mt-9 border-y py-5" style={{ borderColor: THEMES.raise.accentBorder }}>
            <div className="text-[10px] uppercase tracking-[0.18em]" style={{ color: THEMES.raise.accent }}>What the capital needs to prove</div>
            <div className="mt-3 text-xl font-light leading-relaxed" style={{ color: INK.strong }}>
              Platform adoption <span style={{ color: THEMES.raise.accent }}>•</span> Repeatable U.S. GTM <span style={{ color: THEMES.raise.accent }}>•</span> Higher ARPU <span style={{ color: THEMES.raise.accent }}>•</span> First data pilots
            </div>
          </div>
          <div className="mt-4"><FinePrint>Draft allocation — easy to adjust after budget lock.</FinePrint></div>
        </div>
      </div>
    </Shell>
  );
};

export const OptionalitySlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const paths = [
    ["01", "Independent company", "Vertical AI platform for salons", ["Salon AI", "Industry intelligence", "Payments / commerce later"]],
    ["02", "Management systems", "Strategic consolidation", ["Zenoti", "Fresha / Phorest", "Mindbody / Boulevard"]],
    ["03", "Beauty industry", "Data + distribution", ["L’Oréal", "Wella / Henkel", "Professional distributors"]],
  ] as const;
  return (
    <Shell label="Strategic optionality" theme={THEMES.optionality} scrim="center" align="center" constellation>
      <div className="mx-auto max-w-6xl text-center">
        <SlideHeading theme={THEMES.optionality} eyebrow="13 / Optionality" size="h1" align="center">
          We’re building an independent company — and creating strategic optionality along the way.
        </SlideHeading>
        <p className="mx-auto mt-5 max-w-3xl text-base font-light leading-relaxed" style={{ color: INK.soft }}>
          As the platform runs more of the salon and the data gets deeper, Spectra becomes strategically relevant to several types of players.
        </p>
        <AnimatedGroup className="relative mt-9 grid gap-5 text-left lg:grid-cols-3">
          <div className="absolute left-[16.5%] right-[16.5%] top-4 hidden h-px lg:block" style={{ background: THEMES.optionality.accentBorder }} />
          {paths.map(([n, title, subtitle, names]) => (
            <motion.div key={title} variants={pickStaggerItem(reduced)} className="relative border-t px-4 pt-7" style={{ borderColor: THEMES.optionality.accent }}>
              <span className="absolute -top-4 left-4 flex h-8 w-8 items-center justify-center rounded-full border text-[10px]" style={{ borderColor: THEMES.optionality.accent, color: THEMES.optionality.accent, background: "#130e0a" }}>{n}</span>
              <h3 className="text-2xl font-light" style={{ color: INK.strong }}>{title}</h3>
              <p className="mt-1 text-xs uppercase tracking-[0.13em]" style={{ color: THEMES.optionality.accent }}>{subtitle}</p>
              <div className="mt-5 space-y-2 border-l pl-4 text-sm font-light" style={{ borderColor: "rgba(255,255,255,.17)", color: INK.soft }}>
                {names.map((name) => <div key={name}>{name}</div>)}
              </div>
            </motion.div>
          ))}
        </AnimatedGroup>
        <p className="mx-auto mt-10 max-w-4xl text-3xl font-light leading-tight tracking-[-0.03em]" style={{ color: INK.strong }}>
          The long-term value is not only in the software.
          <br /><span style={{ color: THEMES.optionality.accent }}>It is in the live map of how the salon industry actually works.</span>
        </p>
        <div className="mt-5"><FinePrint>Examples show strategic fit only — not indications of interest.</FinePrint></div>
      </div>
    </Shell>
  );
};
