import React from "react";
import type { StoryBlock } from "../../data/milestones";
import { useSiteColors } from "../../contexts/SiteTheme";

interface StorySectionProps {
  blocks: StoryBlock[];
}

export const StorySection: React.FC<StorySectionProps> = ({ blocks }) => {
  const c = useSiteColors();

  return (
    <div className="space-y-4">
      <h4
        className="text-xs font-semibold tracking-widest mb-4"
        style={{ color: c.text.muted }}
      >
        סיפור
      </h4>
      {blocks.map((block, i) => {
        if (block.type === "heading") {
          return (
            <p
              key={i}
              className="text-xs font-semibold tracking-wider pt-2"
              style={{ color: c.text.muted }}
            >
              {block.text}
            </p>
          );
        }
        if (block.type === "people") {
          return (
            <ul key={i} className="space-y-1 pr-4">
              {block.items.map((item, j) => {
                const dashIndex = item.indexOf(" — ");
                if (dashIndex === -1) {
                  return (
                    <li
                      key={j}
                      className="text-sm leading-relaxed list-disc"
                      style={{ color: c.text.secondary }}
                    >
                      {item}
                    </li>
                  );
                }
                const name = item.slice(0, dashIndex);
                const role = item.slice(dashIndex);
                return (
                  <li
                    key={j}
                    className="text-sm leading-relaxed list-disc"
                    style={{ color: c.text.secondary }}
                  >
                    <span className="font-semibold" style={{ color: c.text.primary }}>
                      {name}
                    </span>
                    {role}
                  </li>
                );
              })}
            </ul>
          );
        }
        if (block.type === "paragraph") {
          return (
            <p
              key={i}
              className="text-sm leading-relaxed"
              style={{ color: c.text.secondary }}
            >
              {block.text}
            </p>
          );
        }
        if (block.type === "list") {
          return (
            <ul key={i} className="space-y-1.5 pr-4">
              {block.items.map((item, j) => (
                <li
                  key={j}
                  className="text-sm leading-relaxed list-disc"
                  style={{ color: c.text.secondary }}
                >
                  {item}
                </li>
              ))}
            </ul>
          );
        }
        return null;
      })}
    </div>
  );
};
