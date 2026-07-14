/**
 * Unified salon settings surface.
 *
 * Replaces the previous fragmented tabs with three consistent sections that
 * share one design language, spacing, RTL behavior and loading/error/empty
 * states:
 *   * Team               — staff roster, the four-step create/edit flow, and
 *                          professional roles.
 *   * Services & Departments — a department-first accordion (categories,
 *                          services, resources) plus brands & series.
 *   * Security & Permissions — access roles, invitations and member access.
 *
 * Section state is reflected in the URL (`?tab=settings&section=…`) so links are
 * stable and the browser back button works. Legacy per-entity section values
 * (departments/categories/services/resources/inventory) still resolve so old
 * links keep working. The calendar screen is untouched.
 */

import React, { useEffect, useMemo, useState } from "react";
import { Building2, Layers, Package, ShieldCheck, Users } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import ProductCatalogSetupPage from "../ProductCatalogSetupPage";
import { useCrmT } from "../i18n/CrmLocale";
import { ServicesDepartmentsSection } from "./settings/ServicesDepartmentsSection";
import { TeamSection } from "./settings/TeamSection";
import { SecurityPermissionsSection } from "./settings/SecurityPermissionsSection";
import { SalonProfileSection } from "./settings/SalonProfileSection";

type SettingsSection = "business" | "team" | "catalog" | "brands" | "security";

const LEGACY_SECTION_MAP: Record<string, SettingsSection> = {
  business: "business",
  profile: "business",
  salon: "business",
  regional: "business",
  team: "team",
  staff: "team",
  catalog: "catalog",
  departments: "catalog",
  categories: "catalog",
  services: "catalog",
  resources: "catalog",
  inventory: "brands",
  brands: "brands",
  security: "security",
  permissions: "security",
};

function resolveSectionParam(value: string | null): SettingsSection {
  if (!value) return "business";
  return LEGACY_SECTION_MAP[value] ?? "business";
}

interface Props {
  isDark: boolean;
}

export const ScheduleSettingsTab: React.FC<Props> = ({ isDark }) => {
  const t = useCrmT();
  const isHebrew = t.common.add !== "Add";
  const location = useLocation();
  const navigate = useNavigate();

  const [section, setSection] = useState<SettingsSection>(() =>
    resolveSectionParam(new URLSearchParams(window.location.search).get("section")),
  );
  // Keep local UI state in lockstep with the URL so browser back/forward,
  // deep links, and sidebar navigations that only change the query string all
  // resolve to the correct section/panel. Without this the section is captured
  // once at mount and silently drifts from the address bar.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const nextSection = resolveSectionParam(params.get("section"));
    setSection(nextSection);
  }, [location.search]);

  const changeSection = (next: SettingsSection) => {
    setSection(next);
    const params = new URLSearchParams(location.search);
    params.set("tab", "settings");
    params.set("section", next);
    params.delete("panel");
    navigate({ pathname: location.pathname, search: `?${params.toString()}` }, { replace: true });
  };

  const sections = useMemo(
    () => [
      { id: "business" as const, label: isHebrew ? "פרופיל ועסק" : "Profile & business", icon: Building2 },
      { id: "team" as const, label: isHebrew ? "צוות" : "Team", icon: Users },
      { id: "catalog" as const, label: isHebrew ? "שירותים ומחלקות" : "Services & departments", icon: Layers },
      { id: "brands" as const, label: isHebrew ? "מותגים וסדרות" : "Brands & series", icon: Package },
      { id: "security" as const, label: isHebrew ? "אבטחה והרשאות" : "Security & permissions", icon: ShieldCheck },
    ],
    [isHebrew],
  );

  return (
    <div className={`${isDark ? "bg-[#141414]" : "bg-[#FFF8F0]"} p-4 sm:p-6`}>
      <div className="mb-5 flex flex-wrap items-center gap-1.5">
        {sections.map((sec) => {
          const Icon = sec.icon;
          const active = section === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => changeSection(sec.id)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                active
                  ? isDark ? "bg-white/[0.14] text-white" : "bg-[#F3C3BC] text-[#B05F57]"
                  : isDark ? "text-white/55 hover:text-white/70" : "text-[#7E7066] hover:text-[#141414]"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {sec.label}
            </button>
          );
        })}
      </div>

      {section === "business" && <SalonProfileSection isDark={isDark} />}

      {section === "team" && <TeamSection isDark={isDark} />}

      {section === "catalog" && <ServicesDepartmentsSection isDark={isDark} />}

      {section === "brands" && (
        <ProductCatalogSetupPage embedded onBack={() => changeSection("catalog")} />
      )}

      {section === "security" && <SecurityPermissionsSection isDark={isDark} />}
    </div>
  );
};
