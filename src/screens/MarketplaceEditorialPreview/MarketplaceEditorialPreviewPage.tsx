import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Boxes,
  FlaskConical,
  GraduationCap,
  Search,
  Sparkles,
} from "lucide-react";
import { SalonAiLockup } from "../../components/SalonAiLockup";
import { SalonAiEditorialTheme } from "../../design/salonAiEditorial";
import { MOCK_MARKETPLACE } from "../HomeDashboard/homeDashboardData";
import "./marketplaceEditorialPreview.css";

const filters = [
  { id: "all", label: "All", Icon: Boxes },
  { id: "education", label: "Education", Icon: GraduationCap },
  { id: "color", label: "Color systems", Icon: FlaskConical },
  { id: "business", label: "Business", Icon: Sparkles },
] as const;

const cardIcons = [BookOpen, FlaskConical, Sparkles] as const;

export const MarketplaceEditorialPreviewPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]["id"]>("all");

  useEffect(() => {
    const previous = document.title;
    document.title = "Marketplace · Salon AI";
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <SalonAiEditorialTheme as="main" className="mep">
      <header className="mep-header">
        <a href="/new-home" aria-label="Salon AI home">
          <SalonAiLockup size="header" />
        </a>
        <a className="mep-back" href="/new-home">
          <ArrowLeft aria-hidden="true" size={15} />
          Back to Salon AI
        </a>
      </header>

      <section className="mep-hero">
        <div>
          <p className="sai-eyebrow">Salon AI marketplace</p>
          <h1 className="sai-display sai-display--section">
            Everything your salon needs to move forward.
          </h1>
        </div>
        <p className="sai-lede">
          Discover education, professional systems and practical tools curated for modern color
          salons.
        </p>
      </section>

      <section className="mep-toolbar" aria-label="Marketplace filters">
        <div className="mep-filters" role="group" aria-label="Filter marketplace">
          {filters.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              className={`mep-filter${activeFilter === id ? " is-active" : ""}`}
              aria-pressed={activeFilter === id}
              onClick={() => setActiveFilter(id)}
            >
              <Icon aria-hidden="true" size={15} />
              {label}
            </button>
          ))}
        </div>
        <label className="mep-search">
          <Search aria-hidden="true" size={16} />
          <span className="mep-sr-only">Search marketplace</span>
          <input type="search" placeholder="Search the marketplace" />
        </label>
      </section>

      <section className="mep-featured" aria-labelledby="mep-featured-title">
        <div className="mep-section-heading">
          <div>
            <p className="sai-eyebrow">Featured now</p>
            <h2 id="mep-featured-title" className="sai-display sai-display--statement">
              Built for better salon work.
            </h2>
          </div>
          <p className="sai-body">A focused selection—not another endless catalog.</p>
        </div>

        <div className="mep-grid">
          {MOCK_MARKETPLACE.map((item, index) => {
            const Icon = cardIcons[index] ?? Sparkles;
            return (
              <article className={`mep-card mep-card--${index + 1}`} key={item.id}>
                <div className="mep-card__visual" aria-hidden="true">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <Icon />
                </div>
                <div className="mep-card__copy">
                  <div>
                    <p className="sai-eyebrow">{item.eyebrow ?? item.brandLine ?? "Selected for you"}</p>
                    <h3>{item.title}</h3>
                    <p>{item.subtitle}</p>
                  </div>
                  <button type="button" className="mep-card__action" aria-label={item.ctaLabel}>
                    {item.ctaLabel}
                    <ArrowRight aria-hidden="true" size={15} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mep-note">
        <p className="sai-eyebrow">Marketplace preview</p>
        <p>
          This preview uses the existing marketplace content. Product availability, pricing and
          checkout remain disconnected until the commerce service is approved.
        </p>
      </section>
    </SalonAiEditorialTheme>
  );
};

export default MarketplaceEditorialPreviewPage;
