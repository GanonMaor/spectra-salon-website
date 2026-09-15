import React, { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BrainCircuit,
  CalendarCheck,
  Check,
  FlaskConical,
  Menu,
  Scissors,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import { SalonAiLockup } from "../../components/SalonAiLockup";
import { SpectraOrb } from "../../components/SpectraOrb";
import { SalonAiEditorialTheme } from "../../design/salonAiEditorial";
import { CapabilitiesFocus } from "./components/CapabilitiesFocus";
import { CustomerStories } from "./components/CustomerStories";
import { HeroAssistant } from "./HeroAssistant";
import "./salonAiHome.css";

const salonMoments = [
  {
    number: "01",
    title: "Front desk",
    copy: "One calm view of the day.",
    image: "/new-home/front-desk-editorial.jpg",
    position: "center",
  },
  {
    number: "02",
    title: "Color bar",
    copy: "Every formula becomes knowledge.",
    image: "/new-home/color-bar-editorial.jpg",
    position: "center",
  },
  {
    number: "03",
    title: "Live inventory",
    copy: "Spot low stock and generate the next order.",
    image: "/investor-vision/salon-ai-live-demo/slides/04-mobile-ai-agents/mobile-client-inventory-alert.png",
    position: "center top",
  },
  {
    number: "04",
    title: "Owner view",
    copy: "The whole salon, wherever you are.",
    image: "/new-home/owner-editorial.jpg",
    position: "center",
  },
] as const;

const flow = [
  { number: "01", title: "Book", copy: "Clients book online or in-salon.", Icon: CalendarCheck },
  { number: "02", title: "Serve", copy: "The team delivers the experience.", Icon: Scissors },
  { number: "03", title: "Mix", copy: "Precise formulas, less waste.", Icon: FlaskConical },
  { number: "04", title: "Learn", copy: "Every service becomes structured data.", Icon: BrainCircuit },
  { number: "05", title: "Act", copy: "Salon AI finds the next best move.", Icon: Sparkles },
  { number: "06", title: "Grow", copy: "The salon improves every day.", Icon: TrendingUp },
] as const;

const demoUrl = "/book-a-demo";
const startNowUrl = "/start-now";

const faqs = [
  {
    question: "What does Salon AI include?",
    answer: "Booking, client records, staff tools, inventory, color management and business insights in one system.",
  },
  {
    question: "Can I keep my current salon data?",
    answer: "Yes. Our team helps you move your client, service and product data into Salon AI.",
  },
  {
    question: "Is Salon AI easy for my team to use?",
    answer: "Yes. The system uses simple steps and clear language. We also guide your team through setup.",
  },
  {
    question: "How do I get started?",
    answer: "Choose Start now to begin setup, or book a demo if you want to see the system first.",
  },
] as const;

export const SalonAiHomePage: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileChromeVisible, setMobileChromeVisible] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Salon AI by Spectra | The operating system for modern salons";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 960px)");
    let frame = 0;

    const updateMobileChrome = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const heroBottom = heroRef.current?.getBoundingClientRect().bottom ?? Number.POSITIVE_INFINITY;
        const shouldShow = mobileQuery.matches && heroBottom <= 72;
        setMobileChromeVisible(shouldShow);
        if (!shouldShow) setMenuOpen(false);
      });
    };

    updateMobileChrome();
    window.addEventListener("scroll", updateMobileChrome, { passive: true });
    window.addEventListener("resize", updateMobileChrome);
    mobileQuery.addEventListener("change", updateMobileChrome);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateMobileChrome);
      window.removeEventListener("resize", updateMobileChrome);
      mobileQuery.removeEventListener("change", updateMobileChrome);
    };
  }, []);

  return (
    <SalonAiEditorialTheme as="main" className="sah-page">
      <header className={`sah-header ${mobileChromeVisible ? "is-mobile-visible" : ""}`}>
        <a className="sah-brand" href="#top" aria-label="Salon AI home">
          <SalonAiLockup size="header" />
        </a>

        <nav className="sah-nav" aria-label="Main navigation">
          <a href="#platform">Platform</a>
          <a href="#salon">Across the salon</a>
          <a href="#how-it-works">How it works</a>
          <a href="#proof">Results</a>
          <a href="#faq">FAQ</a>
        </nav>

        <div className="sah-header__actions">
          <a className="sah-header__start" href={startNowUrl}>
            <Sparkles aria-hidden="true" /> Start now
          </a>
          <a className="sai-button sah-button sah-button--small" href={demoUrl}>
            Book a demo <ArrowRight aria-hidden="true" />
          </a>
        </div>

        <button
          className="sah-menu-button"
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>

        {menuOpen && (
          <nav className="sah-mobile-nav" aria-label="Mobile navigation">
            <a href="#platform" onClick={() => setMenuOpen(false)}>Platform</a>
            <a href="#salon" onClick={() => setMenuOpen(false)}>Across the salon</a>
            <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a>
            <a href="#proof" onClick={() => setMenuOpen(false)}>Results</a>
            <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
            <a href={demoUrl}>Book a demo</a>
            <a href={startNowUrl}>Start now</a>
          </nav>
        )}
      </header>

      <section ref={heroRef} className="sah-hero" id="top">
        <img
          className="sah-hero__photo"
          src="/new-home/hero-editorial.jpg"
          alt="Colorist working with a client in a modern salon"
          loading="eager"
          decoding="sync"
        />
        <div className="sah-hero__wash" aria-hidden="true" />
        <div className="sah-hero__content">
          <h1 className="sai-display sai-display--hero">
            <span>All your salon software.</span>
            <span>In one place.</span>
          </h1>
          <p className="sah-hero__lede">
            <span className="sah-hero__lede-label">Salon AI</span>
            <span>From book to look.</span>
          </p>
          <div className="sah-hero__actions">
            <a className="sai-button sah-button" href={demoUrl}>
              Book a demo <ArrowRight aria-hidden="true" />
            </a>
            <a className="sah-button sah-button--start" href={startNowUrl}>
              <Sparkles aria-hidden="true" /> Start now <ArrowRight aria-hidden="true" />
            </a>
          </div>
        </div>

        <HeroAssistant />
      </section>

      <section className="sah-section sah-benefits" id="platform">
        <div className="sah-section-heading sah-section-heading--split">
          <div>
            <p className="sai-eyebrow sah-eyebrow">For salon owners</p>
            <h2 id="capabilities-heading" className="sai-display sai-display--section">One system. More control.</h2>
          </div>
          <p>Everything you need to run and grow your salon in one intelligent system.</p>
        </div>
        <CapabilitiesFocus />
      </section>

      <section className="sah-section sah-salon" id="salon">
        <div className="sah-section-heading sah-section-heading--split">
          <div>
            <p className="sai-eyebrow sah-eyebrow">Built for every corner</p>
            <h2 className="sai-display sai-display--section">Everywhere in the salon.</h2>
          </div>
          <p>From the first hello to the final formula, every moment becomes useful.</p>
        </div>
        <div className="sah-moment-grid">
          {salonMoments.map((moment) => (
            <article className="sah-moment" key={moment.number}>
              <div className="sah-moment__media">
                <img
                  src={moment.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  style={{ objectPosition: moment.position }}
                />
                <span>{moment.number}</span>
              </div>
              <h3>{moment.title}</h3>
              <p>{moment.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="sah-proof" id="proof" aria-label="Salon AI results">
        <div className="sah-proof__intro">
          <p className="sai-eyebrow sah-eyebrow">Real salons. Real impact.</p>
        </div>
        {[
          ["617K+", "Measured services"],
          ["34.0M g", "Material used"],
          ["516K+", "Client visits observed"],
          ["12", "Countries"],
          ["228", "Brands observed"],
        ].map(([number, label]) => (
          <div className="sah-stat" key={label}>
            <strong>{number}</strong>
            <span>{label}</span>
          </div>
        ))}
      </section>

      <section className="sah-section sah-layers">
        <div className="sah-section-heading sah-section-heading--split">
          <div>
            <p className="sai-eyebrow sah-eyebrow">The Spectra ecosystem</p>
            <h2 className="sai-display sai-display--section">Three powerful layers. One smarter salon.</h2>
          </div>
          <p>Operations create data. Intelligence gives it meaning. Salon AI turns it into action.</p>
        </div>
        <div className="sah-layer-grid">
          <article className="sah-layer-card">
            <div className="sah-layer-card__visual sah-layer-card__visual--ui">
              <img
                src="/investor-vision/salon-ai-live-demo/desktop-operational-hub.png"
                alt="Salon OS interface"
                loading="lazy"
              />
            </div>
            <div>
              <p className="sai-eyebrow sah-eyebrow">Layer 01</p>
              <h3>Salon OS</h3>
              <ul>
                <li><Check aria-hidden="true" /> Booking, CRM, inventory and staff</li>
                <li><Check aria-hidden="true" /> One connected operating system</li>
              </ul>
            </div>
          </article>
          <article className="sah-layer-card">
            <div className="sah-layer-card__visual">
              <img src="/new-home/color-bar-editorial.jpg" alt="" loading="lazy" />
            </div>
            <div>
              <p className="sai-eyebrow sah-eyebrow">Layer 02</p>
              <h3>Color Intelligence</h3>
              <ul>
                <li><Check aria-hidden="true" /> Precise measurements and formulas</li>
                <li><Check aria-hidden="true" /> True material cost per service</li>
              </ul>
            </div>
          </article>
          <article className="sah-layer-card sah-layer-card--ai">
            <div className="sah-layer-card__visual sah-layer-card__visual--orb">
              <SpectraOrb className="h-full w-full" />
            </div>
            <div>
              <p className="sai-eyebrow sah-eyebrow">Layer 03</p>
              <h3>Salon AI</h3>
              <ul>
                <li><Check aria-hidden="true" /> Learns from real salon activity</li>
                <li><Check aria-hidden="true" /> Finds the next best action</li>
              </ul>
            </div>
          </article>
        </div>
      </section>

      <CustomerStories />

      <section className="sah-section sah-flow" id="how-it-works">
        <div className="sah-section-heading sah-section-heading--split">
          <div>
            <p className="sai-eyebrow sah-eyebrow">How it works</p>
            <h2 className="sai-display sai-display--section">From service to insight.</h2>
          </div>
          <p>A simple flow. A more intelligent salon.</p>
        </div>
        <ol className="sah-flow-list">
          {flow.map(({ number, title, copy, Icon }) => (
            <li key={number}>
              <div className="sah-flow-list__marker" aria-hidden="true">
                <Icon />
                <span>{number}</span>
              </div>
              <div>
                <strong>{title}</strong>
                <p>{copy}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="sah-section sah-faq" id="faq">
        <div className="sah-section-heading sah-section-heading--split">
          <div>
            <p className="sai-eyebrow sah-eyebrow">Questions and answers</p>
            <h2 className="sai-display sai-display--section">Frequently asked questions.</h2>
          </div>
          <p>Clear answers to help you choose the right next step.</p>
        </div>
        <div className="sah-faq__list">
          {faqs.map((faq) => (
            <details key={faq.question}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="sah-closing" id="contact">
        <img src="/new-home/owner-editorial.jpg" alt="" loading="lazy" />
        <div className="sah-closing__content">
          <p className="sai-eyebrow sah-eyebrow">A smarter beauty industry</p>
          <h2 className="sai-display sai-display--section">Build a smarter salon.</h2>
          <p>Join forward-thinking salon owners turning daily work into better decisions and lasting growth.</p>
          <a className="sai-button sai-button--inverse sah-button sah-button--light" href={demoUrl}>
            Book your demo <ArrowRight aria-hidden="true" />
          </a>
        </div>
      </section>

      <footer className="sah-footer">
        <SalonAiLockup size="header" />
        <div className="sah-footer__links">
          <a href="#platform">Platform</a>
          <a href="#salon">Across the salon</a>
          <a href="#how-it-works">How it works</a>
          <a href="#faq">FAQ</a>
          <a href={demoUrl}>Book a demo</a>
        </div>
        <p>Same data. A brighter tomorrow.</p>
      </footer>

      <a
        className={`sah-mobile-cta ${mobileChromeVisible ? "is-visible" : ""}`}
        href={startNowUrl}
        aria-hidden={!mobileChromeVisible}
        tabIndex={mobileChromeVisible ? undefined : -1}
      >
        <Sparkles aria-hidden="true" /> Start now <ArrowRight aria-hidden="true" />
      </a>
    </SalonAiEditorialTheme>
  );
};

export default SalonAiHomePage;
