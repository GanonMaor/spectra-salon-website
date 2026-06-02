import React from "react";
import { INV } from "../tokens";
import { InvestorEyebrow, GradientText } from "../primitives";
import { useDeck } from "../primitives";

export interface AgendaItem {
  num: string;
  title: string;
  meta: string;
  id: string;
}

export const AgendaSlide: React.FC<{ items: AgendaItem[] }> = ({ items }) => {
  const { goToId } = useDeck();
  const mid = Math.ceil(items.length / 2);
  const columns = [items.slice(0, mid), items.slice(mid)];

  return (
    <div className="max-w-5xl mx-auto px-6 sm:px-10">
      <div className="mb-10">
        <InvestorEyebrow className="mb-5">Agenda</InvestorEyebrow>
        <h2
          className="text-4xl sm:text-5xl font-light tracking-[-0.02em]"
          style={{ color: INV.text }}
        >
          What we&rsquo;ll <GradientText>walk through.</GradientText>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1">
        {columns.map((col, ci) => (
          <ol key={ci} className="space-y-1">
            {col.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => goToId(item.id)}
                  className="w-full flex items-center gap-4 py-3 text-left rounded-xl px-3 -mx-3 transition-colors hover:bg-[rgba(193,154,99,0.08)]"
                >
                  <span
                    className="text-sm tabular-nums w-6 shrink-0"
                    style={{ color: INV.gold }}
                  >
                    {item.num}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-base sm:text-lg font-normal" style={{ color: INV.text }}>
                      {item.title}
                    </span>
                    <span className="block text-xs font-light" style={{ color: INV.textMuted }}>
                      {item.meta}
                    </span>
                  </span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={INV.textFaint} strokeWidth="1.8">
                    <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </li>
            ))}
          </ol>
        ))}
      </div>
    </div>
  );
};
