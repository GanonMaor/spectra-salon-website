import React, { useState, useRef, useEffect, useId } from "react";

interface DeepDiveAccordionProps {
  id: string;
  label?: string;
  children: React.ReactNode;
}

export function DeepDiveAccordion({
  id,
  label = "Learn more",
  children,
}: DeepDiveAccordionProps) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [measuredHeight, setMeasuredHeight] = useState(0);
  const autoId = useId();
  const triggerId = `${id}-trigger-${autoId}`;
  const contentId = `${id}-content-${autoId}`;

  useEffect(() => {
    if (!contentRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      setMeasuredHeight(entry.contentRect.height);
    });
    ro.observe(contentRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="mt-5">
      <button
        id={triggerId}
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((v) => !v)}
        className="group inline-flex items-center gap-2 text-sm font-medium text-violet-600 hover:text-violet-800 transition-colors select-none"
      >
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${open ? "rotate-90" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5l7 7-7 7"
          />
        </svg>
        {label}
      </button>

      <div
        id={contentId}
        role="region"
        aria-labelledby={triggerId}
        style={{
          maxHeight: open ? measuredHeight + 24 : 0,
          opacity: open ? 1 : 0,
        }}
        className="overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
      >
        <div ref={contentRef} className="pt-4 pb-1">
          {children}
        </div>
      </div>
    </div>
  );
}
