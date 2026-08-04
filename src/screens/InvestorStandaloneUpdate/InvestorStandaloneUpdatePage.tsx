import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown,
  ArrowUpRight,
  BrainCircuit,
  CalendarDays,
  Check,
  CircleDollarSign,
  Package,
  Users,
} from "lucide-react";
import { CustomerVideoRail } from "../NewNarrativeSalonAIFirst/visuals/CustomerVideoRail";
import {
  AGENTS,
  AI_SIGNALS,
  CAPACITY_SIGNALS,
  CLOSING,
  DATA_FOUNDATION,
  FUNDING_PRIORITIES,
  HERO,
  META,
  PROOF_METRICS,
  REVENUE_LAYERS,
  SAAS_LEVERS,
  SAAS_METRICS,
  STORY,
} from "./copy";

const HERO_IMAGE = "/investor-vision/salon-ai-live-demo/hero-reception-bg.png";
const COLORBAR_IMAGE = "/investor-vision/salon-ai-live-demo/colorbar-ipad-composition.png";
const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

type StorySectionProps = {
  id: string;
  eyebrow: string;
  title: string;
  paragraphs: readonly string[];
  reverse?: boolean;
  children: React.ReactNode;
  reducedMotion: boolean;
};

const StorySection: React.FC<StorySectionProps> = ({
  id,
  eyebrow,
  title,
  paragraphs,
  reverse = false,
  children,
  reducedMotion,
}) => (
  <section id={id} className="scroll-mt-24 border-t border-[#2b221b]/8 px-5 py-24 sm:px-8 sm:py-32">
    <motion.div
      className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-[0.42fr_0.58fr] lg:gap-16"
      initial={{ opacity: 0, y: reducedMotion ? 0 : 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: reducedMotion ? 0.15 : 0.65, ease }}
    >
      <div className={reverse ? "lg:order-2" : ""}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#b1844d]">{eyebrow}</p>
        <h2 className="mt-5 text-4xl font-light leading-[1.05] tracking-[-0.035em] text-[#2b221b] sm:text-5xl">
          {title}
        </h2>
        <div className="mt-7 space-y-5">
          {paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-[16px] leading-8 text-[#2b221b]/68 sm:text-[17px] sm:leading-8">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
      <div className={reverse ? "lg:order-1" : ""}>{children}</div>
    </motion.div>
  </section>
);

const DarkVisual: React.FC<{
  children: React.ReactNode;
  className?: string;
  label?: string;
}> = ({ children, className = "", label }) => (
  <div
    className={`relative overflow-hidden rounded-[30px] border border-white/10 bg-[#17110d] text-[#fbf6ef] shadow-[0_28px_80px_rgba(43,34,27,0.18)] ${className}`}
  >
    <div
      className="absolute inset-0 bg-cover bg-center opacity-28"
      style={{ backgroundImage: `url('${HERO_IMAGE}')` }}
    />
    <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(10,7,5,0.96),rgba(10,7,5,0.74))]" />
    <div className="absolute inset-0 bg-[radial-gradient(55%_65%_at_15%_25%,rgba(217,185,129,0.14),transparent_72%)]" />
    <div className="relative">
      {label && (
        <p className="px-6 pt-6 text-[9px] font-semibold uppercase tracking-[0.24em] text-[#d9b981] sm:px-7 sm:pt-7">
          {label}
        </p>
      )}
      {children}
    </div>
  </div>
);

const DataFoundationVisual: React.FC = () => (
  <DarkVisual label="From activity to intelligence">
    <div className="grid gap-5 p-6 sm:p-7 lg:grid-cols-[1fr_0.72fr]">
      <div className="space-y-3">
        {DATA_FOUNDATION.map((item) => (
          <div key={item.step} className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <span className="text-[10px] font-semibold text-[#d9b981]">{item.step}</span>
              <div>
                <p className="text-sm font-medium text-[#fbf6ef]">{item.title}</p>
                <p className="mt-1 text-[11px] leading-5 text-[#fbf6ef]/48">{item.body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="relative hidden min-h-[360px] lg:block">
        <img
          src={COLORBAR_IMAGE}
          alt="Spectra color-bar data capture"
          className="absolute bottom-0 start-1/2 w-[150%] max-w-none -translate-x-1/2 object-contain drop-shadow-[0_24px_45px_rgba(0,0,0,0.5)]"
        />
      </div>
    </div>
  </DarkVisual>
);

const ProofVisual: React.FC = () => (
  <DarkVisual label="Real ground to build on">
    <div className="grid grid-cols-2 gap-3 p-6 sm:p-7 lg:grid-cols-3">
      {PROOF_METRICS.map((metric) => (
        <div key={metric.value} className="rounded-2xl border border-white/12 bg-white/[0.09] p-4 backdrop-blur-xl">
          <p dir="ltr" className="text-3xl font-light tracking-[-0.04em] text-[#d9b981]">
            {metric.value}
          </p>
          <p className="mt-2 text-xs font-medium text-[#fbf6ef]">{metric.label}</p>
          <p className="mt-1 text-[10px] leading-4 text-[#fbf6ef]/42">{metric.note}</p>
        </div>
      ))}
    </div>
  </DarkVisual>
);

const CapacityVisual: React.FC = () => (
  <DarkVisual label="The operating context">
    <div className="p-6 sm:p-7">
      <div className="rounded-2xl border border-white/10 bg-[#f5efe7] p-4 text-[#2b221b] shadow-xl">
        <div className="flex items-center justify-between border-b border-[#2b221b]/10 pb-3">
          <div className="flex items-center gap-2">
            <CalendarDays size={15} className="text-[#b1844d]" />
            <span className="text-xs font-semibold">Live salon day</span>
          </div>
          <span className="text-[9px] uppercase tracking-[0.16em] text-[#2b221b]/40">Connected signals</span>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {[48, 72, 58, 84].map((height, index) => (
            <div key={height} className="rounded-xl bg-[#2b221b]/5 p-2">
              <div
                className="rounded-lg bg-gradient-to-b from-[#d9b981]/70 to-[#b1844d]/35"
                style={{ height }}
              />
              <p className="mt-2 text-center text-[8px] text-[#2b221b]/45">{["09:00", "11:30", "14:00", "16:30"][index]}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {CAPACITY_SIGNALS.map((signal, index) => {
          const Icon = [Package, Users, CircleDollarSign][index];
          return (
            <div key={signal.title} className="rounded-2xl border border-white/10 bg-white/[0.07] p-4">
              <Icon size={17} className="text-[#d9b981]" />
              <p className="mt-3 text-xs font-medium">{signal.title}</p>
              <p className="mt-1 text-[10px] leading-4 text-[#fbf6ef]/45">{signal.body}</p>
            </div>
          );
        })}
      </div>
    </div>
  </DarkVisual>
);

const IntelligenceVisual: React.FC<{ reducedMotion: boolean }> = ({ reducedMotion }) => (
  <DarkVisual label="A salon-specific intelligence engine">
    <div className="p-6 sm:p-8">
      <div className="grid grid-cols-[1fr_120px_1fr] items-center gap-3 sm:grid-cols-[1fr_160px_1fr]">
        <div className="space-y-3">
          {AI_SIGNALS.slice(0, 3).map((signal) => (
            <div key={signal} className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-center text-[10px] text-[#fbf6ef]/65">
              {signal}
            </div>
          ))}
        </div>
        <motion.div
          className="relative flex aspect-square items-center justify-center rounded-full border border-[#d9b981]/35 bg-[#d9b981]/10 text-center shadow-[0_0_55px_rgba(217,185,129,0.16)]"
          animate={reducedMotion ? undefined : { boxShadow: ["0 0 35px rgba(217,185,129,0.10)", "0 0 65px rgba(217,185,129,0.22)", "0 0 35px rgba(217,185,129,0.10)"] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <div>
            <BrainCircuit size={26} className="mx-auto text-[#d9b981]" />
            <p className="mt-2 text-sm font-medium">Salon AI</p>
            <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-[#fbf6ef]/40">Business context</p>
          </div>
        </motion.div>
        <div className="space-y-3">
          {AI_SIGNALS.slice(3).map((signal) => (
            <div key={signal} className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-center text-[10px] text-[#fbf6ef]/65">
              {signal}
            </div>
          ))}
        </div>
      </div>
      <p className="mt-7 border-t border-white/10 pt-5 text-center text-xs font-light leading-5 text-[#fbf6ef]/52">
        One connected context turns isolated data into explanations, priorities and approved actions.
      </p>
    </div>
  </DarkVisual>
);

const AgentVisual: React.FC = () => (
  <DarkVisual label="From insight to action">
    <div className="p-6 sm:p-7">
      <div className="rounded-2xl border border-[#d9b981]/30 bg-[#d9b981]/10 p-5 text-center">
        <p className="text-lg font-light">Salon AI Control Layer</p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-[#fbf6ef]/40">Understands · prepares · assists</p>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {AGENTS.map((agent, index) => (
          <div
            key={agent.name}
            className={`rounded-2xl border border-white/10 bg-white/[0.07] p-4 ${index === AGENTS.length - 1 ? "sm:col-span-2" : ""}`}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d9b981]/15 text-[10px] font-semibold text-[#d9b981]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="text-xs font-medium">{agent.name} Agent</p>
                <p className="mt-1 text-[10px] leading-4 text-[#fbf6ef]/45">{agent.action}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </DarkVisual>
);

const RevenueVisual: React.FC = () => {
  const widths = [20, 43, 63, 100];
  return (
    <DarkVisual label="Illustrative annual revenue per salon">
      <div className="space-y-5 p-6 sm:p-7">
        {REVENUE_LAYERS.map((layer, index) => (
          <div key={layer.product}>
            <div className="mb-2 flex items-end justify-between gap-4">
              <div>
                <p className="text-[9px] uppercase tracking-[0.16em] text-[#d9b981]">{layer.phase}</p>
                <p className="mt-1 text-xs font-medium text-[#fbf6ef]">{layer.product}</p>
              </div>
              <p dir="ltr" className="text-xl font-light text-[#d9b981]">{layer.value}</p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#a87e45] to-[#d9b981]"
                style={{ width: `${widths[index]}%` }}
              />
            </div>
            <p className="mt-1 text-[9px] text-[#fbf6ef]/32">{layer.note}</p>
          </div>
        ))}
        <p className="border-t border-white/10 pt-4 text-[10px] leading-5 text-[#fbf6ef]/38">
          The figures for layers 2 through 4 are product-economics models rather than forecasts.
        </p>
      </div>
    </DarkVisual>
  );
};

const SaaSVisual: React.FC = () => (
  <DarkVisual label="Recurring foundation + improvement levers">
    <div className="p-6 sm:p-7">
      <div className="grid grid-cols-2 gap-3">
        {SAAS_METRICS.map((metric) => (
          <div key={metric.value} className="rounded-2xl border border-white/10 bg-white/[0.08] p-4">
            <p dir="ltr" className="text-2xl font-light text-[#d9b981] sm:text-3xl">{metric.value}</p>
            <p className="mt-2 text-[10px] leading-4 text-[#fbf6ef]/48">{metric.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 space-y-3">
        {SAAS_LEVERS.map((lever) => (
          <div key={lever.title} className="flex items-start gap-3 border-t border-white/8 pt-3">
            <Check size={14} className="mt-1 shrink-0 text-[#d9b981]" />
            <p className="text-[11px] leading-5 text-[#fbf6ef]/55">
              <span className="font-medium text-[#fbf6ef]">{lever.title}.</span> {lever.body}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-5 text-[9px] leading-4 text-[#fbf6ef]/30">
        LTV:CAC is based on the 2025 acquisition cohort and a modeled three-year retention assumption.
      </p>
    </div>
  </DarkVisual>
);

const FundingVisual: React.FC = () => (
  <DarkVisual label="Execution priorities">
    <div className="grid gap-3 p-6 sm:grid-cols-2 sm:p-7">
      {FUNDING_PRIORITIES.map((priority) => (
        <div key={priority.number} className="rounded-2xl border border-white/10 bg-white/[0.07] p-4">
          <span className="text-[9px] font-semibold text-[#d9b981]">{priority.number}</span>
          <p className="mt-2 text-xs font-medium text-[#fbf6ef]">{priority.title}</p>
          <p className="mt-1 text-[10px] leading-4 text-[#fbf6ef]/45">{priority.body}</p>
        </div>
      ))}
    </div>
  </DarkVisual>
);

const RoundVisual: React.FC = () => (
  <DarkVisual label="The position of this round">
    <div className="p-6 sm:p-8">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Completed", "Major product and platform rebuilding"],
          ["Now", "Product completion, rollout and adoption"],
          ["Next", "Commercial expansion from a real customer base"],
        ].map(([label, body], index) => (
          <div
            key={label}
            className={`rounded-2xl border p-4 ${
              index === 1
                ? "border-[#d9b981]/45 bg-[#d9b981]/12"
                : "border-white/10 bg-white/[0.06]"
            }`}
          >
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#d9b981]">{label}</p>
            <p className="mt-3 text-xs leading-5 text-[#fbf6ef]/65">{body}</p>
          </div>
        ))}
      </div>
      <p className="mt-6 text-center text-[10px] leading-5 text-[#fbf6ef]/38">
        Participation remains subject to formal documents, required approvals and legal review.
      </p>
    </div>
  </DarkVisual>
);

const PeopleVisual: React.FC = () => (
  <div className="grid gap-3 sm:grid-cols-2">
    {[
      ["Maor Ganon", "Founder vision, product and salon industry"],
      ["Elad Gotlieb", "Finance, organization and operations"],
      ["Achela", "Product development and platform rebuild"],
      ["Lital", "Front-end, UX and quality"],
      ["Yaar", "Customer success and product data"],
      ["Roy Gefen", "Marketing thinking and market relevance"],
    ].map(([name, role]) => (
      <div key={name} className="rounded-2xl border border-[#2b221b]/10 bg-white/45 p-4">
        <p className="text-sm font-medium text-[#2b221b]">{name}</p>
        <p className="mt-1 text-[11px] leading-5 text-[#2b221b]/48">{role}</p>
      </div>
    ))}
  </div>
);

export const InvestorStandaloneUpdatePage: React.FC = () => {
  const reducedMotion = Boolean(useReducedMotion());
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const previousTitle = document.title;
    const previousLang = document.documentElement.lang;
    const previousDir = document.documentElement.dir;
    document.title = META.title;
    document.documentElement.lang = "en";
    document.documentElement.dir = "ltr";
    return () => {
      document.title = previousTitle;
      document.documentElement.lang = previousLang;
      document.documentElement.dir = previousDir;
    };
  }, []);

  useEffect(() => {
    let robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const created = !robots;
    const previousContent = robots?.content;
    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.appendChild(robots);
    }
    robots.content = "noindex, nofollow";
    return () => {
      if (created) robots?.remove();
      else if (robots && previousContent !== undefined) robots.content = previousContent;
    };
  }, []);

  useEffect(() => {
    const update = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(scrollable > 0 ? Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100)) : 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      className="min-h-[100dvh] bg-[#f5efe7] text-[#2b221b]"
      style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
    >
      <style>{`
        html { scroll-behavior: ${reducedMotion ? "auto" : "smooth"}; }
        body { background: #f5efe7; }
        ::selection { background: rgba(193,154,99,0.25); color: #2b221b; }
      `}</style>

      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#2b221b]/8 bg-[#f5efe7]/[0.9] backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:h-[72px] sm:px-8">
          <a href="#top" className="flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c19a63]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#c19a63] shadow-[0_0_10px_rgba(193,154,99,0.7)]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#2b221b]/60">
              Salon AI · Spectra
            </span>
          </a>
          <div className="text-end">
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#2b221b]/38">Private investor update</p>
            <p className="mt-1 text-[9px] text-[#2b221b]/28">{META.date}</p>
          </div>
        </div>
        <div className="h-px bg-[#2b221b]/5">
          <div
            className="h-full bg-gradient-to-r from-[#b1844d] to-[#d9b981] transition-[width] duration-150"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </header>

      <main>
        <section id="top" className="relative overflow-hidden bg-[#17110d] px-5 pb-12 pt-28 text-[#fbf6ef] sm:px-8 sm:pb-16 sm:pt-32">
          <div className="absolute inset-0 bg-cover bg-center opacity-45" style={{ backgroundImage: `url('${HERO_IMAGE}')` }} />
          <div className="absolute inset-0 bg-[linear-gradient(108deg,rgba(9,6,4,0.97)_0%,rgba(9,6,4,0.82)_48%,rgba(9,6,4,0.62)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(55%_65%_at_16%_36%,rgba(217,185,129,0.18),transparent_72%)]" />
          <motion.div
            className="relative mx-auto max-w-6xl"
            initial={{ opacity: 0, y: reducedMotion ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0.15 : 0.75, ease }}
          >
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:gap-16">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d9b981]">{HERO.eyebrow}</p>
                <h1 className="mt-5 max-w-3xl text-5xl font-light leading-[0.96] tracking-[-0.045em] sm:text-7xl lg:text-[5.4rem]">
                  {HERO.title}
                </h1>
              </div>
              <div className="lg:pb-2">
                <p className="max-w-xl text-base font-light leading-7 text-[#fbf6ef]/68 sm:text-lg sm:leading-8">{HERO.body}</p>
                <p className="mt-6 text-xs text-[#fbf6ef]/38">{META.date}</p>
              </div>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d9b981]">{HERO.customerProof}</span>
              <span className="hidden h-px w-7 bg-gradient-to-r from-[#d9b981] to-transparent sm:block" />
              <span className="text-[10px] font-light text-[#fbf6ef]/38">{HERO.regions}</span>
            </div>
            <div className="mt-4 flex h-[280px] sm:h-[340px] lg:h-[360px]">
              <CustomerVideoRail accent="#D9B981" autoplay={!reducedMotion} />
            </div>
            <a
              href="#origin"
              className="mt-7 inline-flex items-center gap-3 text-xs font-medium tracking-[0.1em] text-[#fbf6ef]/48 transition hover:text-[#fbf6ef] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d9b981]"
            >
              {HERO.read}
              <ArrowDown size={15} strokeWidth={1.5} aria-hidden="true" />
            </a>
          </motion.div>
        </section>

        <StorySection id="origin" {...STORY.origin} reducedMotion={reducedMotion}>
          <DataFoundationVisual />
        </StorySection>
        <StorySection id="rebuild" {...STORY.rebuild} reverse reducedMotion={reducedMotion}>
          <ProofVisual />
        </StorySection>
        <StorySection id="direction" {...STORY.direction} reducedMotion={reducedMotion}>
          <CapacityVisual />
        </StorySection>
        <StorySection id="difference" {...STORY.difference} reverse reducedMotion={reducedMotion}>
          <IntelligenceVisual reducedMotion={reducedMotion} />
        </StorySection>
        <StorySection id="vision" {...STORY.vision} reducedMotion={reducedMotion}>
          <AgentVisual />
        </StorySection>
        <StorySection id="revenue" {...STORY.revenue} reverse reducedMotion={reducedMotion}>
          <RevenueVisual />
        </StorySection>
        <StorySection id="saas" {...STORY.saas} reducedMotion={reducedMotion}>
          <SaaSVisual />
        </StorySection>
        <StorySection id="raise" {...STORY.raise} reverse reducedMotion={reducedMotion}>
          <FundingVisual />
        </StorySection>
        <StorySection id="round" {...STORY.round} reducedMotion={reducedMotion}>
          <RoundVisual />
        </StorySection>
        <StorySection id="people" {...STORY.people} reverse reducedMotion={reducedMotion}>
          <PeopleVisual />
        </StorySection>

        <section className="relative overflow-hidden bg-[#17110d] px-5 py-24 text-[#fbf6ef] sm:px-8 sm:py-32">
          <div className="absolute inset-0 bg-cover bg-center opacity-35" style={{ backgroundImage: `url('${HERO_IMAGE}')` }} />
          <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(9,6,4,0.96),rgba(9,6,4,0.75))]" />
          <motion.div
            className="relative mx-auto max-w-4xl text-center"
            initial={{ opacity: 0, y: reducedMotion ? 0 : 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: reducedMotion ? 0.15 : 0.65, ease }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#d9b981]">The next conversation</p>
            <h2 className="mt-5 text-5xl font-light tracking-[-0.04em] sm:text-7xl">{CLOSING.title}</h2>
            <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-8 text-[#fbf6ef]/62 sm:text-lg">{CLOSING.body}</p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href={CLOSING.primaryHref}
                className="inline-flex items-center justify-center gap-3 rounded-full bg-[#d9b981] px-6 py-3 text-sm font-semibold text-[#21170f] transition hover:-translate-y-0.5 hover:bg-[#e3c998] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                {CLOSING.primary}
                <ArrowUpRight size={17} aria-hidden="true" />
              </a>
              <a
                href={CLOSING.secondaryHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm text-[#fbf6ef]/68 transition hover:border-white/30 hover:text-[#fbf6ef] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d9b981]"
              >
                {CLOSING.secondary}
              </a>
            </div>
            <p className="mt-12 text-[10px] uppercase tracking-[0.18em] text-[#fbf6ef]/30">{CLOSING.signature}</p>
          </motion.div>
        </section>
      </main>
    </div>
  );
};

export default InvestorStandaloneUpdatePage;
