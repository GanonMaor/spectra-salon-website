import React from "react";
import type { Person } from "../../data/milestones";
import { useSiteColors } from "../../contexts/SiteTheme";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface PersonChipProps {
  person: Person;
}

const PersonChip: React.FC<PersonChipProps> = ({ person }) => {
  const c = useSiteColors();

  return (
    <div className="flex items-center gap-1.5 py-0.5 min-w-0">
      {/* Avatar */}
      {person.avatarSrc ? (
        <img
          src={person.avatarSrc}
          alt={person.name}
          className="w-6 h-6 rounded-full object-cover shrink-0"
        />
      ) : (
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold tracking-wide"
          style={{
            background: "rgba(180,140,80,0.15)",
            color: "rgba(234,183,118,0.85)",
            border: "1px solid rgba(180,140,80,0.20)",
          }}
        >
          {getInitials(person.name)}
        </div>
      )}

      {/* Name + Role — inline on desktop, stacked on very small */}
      <div className="min-w-0 flex flex-wrap items-baseline gap-x-1">
        <span
          className="text-xs sm:text-sm font-semibold leading-tight whitespace-nowrap"
          style={{ color: c.text.primary }}
        >
          {person.name}
        </span>
        {person.role && (
          <span
            className="text-[10px] sm:text-xs leading-tight"
            style={{ color: c.text.muted }}
          >
            · {person.role}
          </span>
        )}
      </div>
    </div>
  );
};

interface PersonRowProps {
  people: Person[];
}

export const PersonRow: React.FC<PersonRowProps> = ({ people }) => {
  if (!people || people.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1">
      {people.map((person, i) => (
        <PersonChip key={i} person={person} />
      ))}
    </div>
  );
};
