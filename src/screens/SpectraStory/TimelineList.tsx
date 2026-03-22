import React, { useState } from "react";
import type { Milestone } from "../../data/milestones";
import { TimelineItem } from "./TimelineItem";

interface TimelineListProps {
  milestones: Milestone[];
}

export const TimelineList: React.FC<TimelineListProps> = ({ milestones }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="max-w-5xl mx-auto w-full">
      {milestones.map((milestone, index) => (
        <TimelineItem
          key={milestone.id}
          milestone={milestone}
          index={index}
          isExpanded={expandedId === milestone.id}
          onToggle={() => handleToggle(milestone.id)}
        />
      ))}
    </div>
  );
};
