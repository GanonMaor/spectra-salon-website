import React, { useState, useEffect, useRef } from "react";
import {
  BarChart3,
  Sparkles,
  CalendarDays,
  UsersRound,
  Boxes,
  FlaskConical,
} from "lucide-react";
import "./capabilitiesFocus.css";

const capabilities = [
  {
    id: "grow-revenue",
    icon: BarChart3,
    title: "Grow revenue",
    description: "See what drives every chair, service, and client.",
    bgImage: "/investor-vision/salon-ai-live-demo/desktop-operational-hub.png",
    floatImage: "/investor-vision/salon-ai-live-demo/mobile-owner-executive.png",
  },
  {
    id: "reduce-waste",
    icon: Sparkles,
    title: "Reduce waste",
    description: "Track what is mixed, used, and left behind.",
    bgImage: "/investor-vision/salon-ai-live-demo/color-bar-scale-bg.png",
    floatImage: "/investor-vision/salon-ai-live-demo/tablet-color-mixing.png",
  },
  {
    id: "fill-calendar",
    icon: CalendarDays,
    title: "Fill the calendar",
    description: "Turn first-time visits into lasting relationships.",
    bgImage: "/investor-vision/salon-ai-live-demo/hero-reception-bg.png",
    floatImage: "/investor-vision/salon-ai-live-demo/mobile-smart-scheduling.png",
  },
  {
    id: "run-team",
    icon: UsersRound,
    title: "Run the team",
    description: "Keep schedules, performance, and handovers connected.",
    bgImage: "/investor-vision/salon-ai-live-demo/backup-command-center-bg.png",
    floatImage: "/investor-vision/salon-ai-live-demo/mobile-ai-team.png",
  },
  {
    id: "know-inventory",
    icon: Boxes,
    title: "Know inventory",
    description: "Always know what you have and what to reorder.",
    bgImage: "/investor-vision/salon-ai-live-demo/product-scan-shelves-bg.png",
    floatImage: "/investor-vision/salon-ai-live-demo/inventory-ipad-composition.png",
  },
  {
    id: "know-color-cost",
    icon: FlaskConical,
    title: "Know true color cost",
    description: "From formula to finished look, down to the gram.",
    bgImage: "/investor-vision/salon-ai-live-demo/tablet-color-intelligence.png",
    floatImage: "/investor-vision/salon-ai-live-demo/color-bar-scale-bg.png",
  },
];

const TIMER_DURATION = 5000;

export const CapabilitiesFocus: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isDocumentVisible, setIsDocumentVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const timerRef = useRef<ReturnType<typeof window.setInterval> | null>(null);

  const startTimer = () => {
    stopTimer();
    timerRef.current = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % capabilities.length);
    }, TIMER_DURATION);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    if (!isPaused && isInView && isDocumentVisible && !reducedMotion) {
      startTimer();
    } else {
      stopTimer();
    }
    return () => stopTimer();
  }, [isPaused, isInView, isDocumentVisible, reducedMotion, activeIndex]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(Boolean(entry?.isIntersecting)),
      { rootMargin: "120px", threshold: 0.15 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // Handle visibility change to avoid timers running offscreen
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsDocumentVisible(!document.hidden);
    };

    handleVisibilityChange();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="sai-capabilities-focus"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
      aria-labelledby="capabilities-heading"
    >
      <div className="sai-capabilities-focus__container">
        {capabilities.map((cap, index) => {
          const isActive = index === activeIndex;
          const Icon = cap.icon;

          return (
            <button
              key={cap.id}
              className={`sai-capability-card ${isActive ? "is-active" : ""}`}
              onClick={() => setActiveIndex(index)}
              aria-expanded={isActive}
              aria-controls={`panel-${cap.id}`}
              id={`tab-${cap.id}`}
              type="button"
            >
              <div className="sai-capability-card__header">
                <Icon className="sai-capability-card__icon" aria-hidden="true" />
                <h3 className="sai-capability-card__title">{cap.title}</h3>
              </div>

              <div 
                className="sai-capability-card__content"
                id={`panel-${cap.id}`}
                role="region"
                aria-labelledby={`tab-${cap.id}`}
                aria-hidden={!isActive}
              >
                <div className="sai-capability-card__body">
                  <p className="sai-capability-card__description">
                    {cap.description}
                  </p>
                  
                  <div className="sai-capability-card__visual-container">
                    <div className="sai-capability-card__visual-stage">
                      <img 
                        src={cap.bgImage} 
                        className="sai-capability-card__bg-img" 
                        alt="" 
                        loading="lazy"
                      />
                      <img 
                        src={cap.floatImage} 
                        className="sai-capability-card__float-img" 
                        alt="" 
                        loading="lazy"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
