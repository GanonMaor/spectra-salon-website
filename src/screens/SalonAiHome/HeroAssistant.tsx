import React, { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { SpectraOrb } from "../../components/SpectraOrb";

const SCENE_TIMELINE = [350, 1200, 2400, 3900, 5600] as const;
const SCENE_DURATION = 7600;
const SCENE_COUNT = 4;

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}

const TypingDots: React.FC<{ visible: boolean }> = ({ visible }) => (
  <div className={`sah-assistant__typing ${visible ? "is-visible" : ""}`} aria-hidden="true">
    <span />
    <span />
    <span />
  </div>
);

export const HeroAssistant: React.FC = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [started, setStarted] = useState(false);
  const [scene, setScene] = useState(0);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (reducedMotion) {
      setStarted(true);
      setScene(3);
      setPhase(SCENE_TIMELINE.length);
      return;
    }

    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setStarted(true);
        observer.disconnect();
      },
      { threshold: 0.45 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, [reducedMotion]);

  useEffect(() => {
    if (!started || reducedMotion) return;
    const timers = SCENE_TIMELINE.map((delay, index) =>
      window.setTimeout(() => setPhase(index + 1), delay),
    );
    const nextScene = window.setTimeout(() => {
      setPhase(0);
      setScene((current) => (current + 1) % SCENE_COUNT);
    }, SCENE_DURATION);
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(nextScene);
    };
  }, [reducedMotion, scene, started]);

  const visible = (step: number) => phase >= step;
  const typing = phase === 2;
  const completed = phase >= 5;
  const isCurrent = (index: number) => scene === index;

  return (
    <div
      ref={rootRef}
      className={`sah-assistant ${started ? "is-started" : ""} ${reducedMotion ? "is-reduced" : ""}`}
      role="img"
      aria-label="Salon AI continuously demonstrates inventory ordering, appointment booking, staff messages, and team performance reports."
    >
      <div className={`sah-assistant__identity ${started ? "is-visible" : ""}`}>
        <SpectraOrb className="sah-assistant__orb" reducedMotion={reducedMotion} />
        <div className="sah-assistant__identity-chip">
          <p className="sai-eyebrow sah-assistant__label">
            <span aria-hidden="true" /> Salon AI
          </p>
          <p className="sah-assistant__presence">Your salon, handled.</p>
        </div>
      </div>

      <div
        className={`sah-assistant__thread sah-assistant__thread--inventory ${isCurrent(0) ? "is-current" : ""}`}
        aria-hidden="true"
      >
        <p className={`sah-assistant__owner ${visible(1) ? "is-visible" : ""}`}>
          What needs my attention?
        </p>

        <div className="sah-assistant__slot sah-assistant__slot--action">
          <TypingDots visible={typing} />
          <div className={`sah-assistant__card sah-assistant__action ${visible(3) ? "is-visible" : ""}`}>
            <p className="sai-eyebrow">Action</p>
            <strong>Shade 6A runs out Thursday.</strong>
            <div className="sah-assistant__products">
              {["majirel-cool-cover", "dia-richesse"].map((product) => (
                <span key={product}>
                  <img src={`/inventory-products/${product}.png`} alt="" />
                </span>
              ))}
              <small>2 low-stock products</small>
            </div>
            <div className={`sah-assistant__progress ${completed ? "is-complete" : ""}`}>
              <span />
            </div>
          </div>
        </div>
        <div className={`sah-assistant__status ${visible(4) ? "is-visible" : ""} ${completed ? "is-ordered" : ""}`}>
          {completed && <Check aria-hidden="true" />}
          <span>{completed ? "Ordered: 12 tubes" : "Ordering..."}</span>
        </div>
      </div>

      <div
        className={`sah-assistant__thread sah-assistant__thread--booking ${isCurrent(1) ? "is-current" : ""}`}
        aria-hidden="true"
      >
        <p className={`sah-assistant__owner ${visible(1) ? "is-visible" : ""}`}>
          Book Emma for color tomorrow.
        </p>
        <TypingDots visible={typing} />
        <div className={`sah-assistant__people-card ${visible(3) ? "is-visible" : ""}`}>
          <p className="sai-eyebrow">Best team match</p>
          <div className="sah-assistant__people">
            {[
              ["Daniela", "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=96&q=80"],
              ["Noa", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&q=80"],
              ["Maya", "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=96&q=80"],
            ].map(([name, image]) => (
              <span key={name}>
                <img src={image} alt="" />
                <small>{name}</small>
              </span>
            ))}
          </div>
          <strong>Daniela knows Emma's color history.</strong>
        </div>
        <div className={`sah-assistant__booking-card ${visible(4) ? "is-visible" : ""}`}>
          <p className="sai-eyebrow">Available tomorrow</p>
          <div className="sah-assistant__times">
            {["10:30", "13:00", "15:30"].map((time) => (
              <span className={completed && time === "13:00" ? "is-booked" : ""} key={time}>
                {completed && time === "13:00" && <Check aria-hidden="true" />}
                {time}
              </span>
            ))}
          </div>
          <strong>{completed ? "Booked with Daniela at 13:00" : "Finding the best time..."}</strong>
        </div>
      </div>

      <div
        className={`sah-assistant__thread sah-assistant__thread--message ${isCurrent(2) ? "is-current" : ""}`}
        aria-hidden="true"
      >
        <p className={`sah-assistant__owner ${visible(1) ? "is-visible" : ""}`}>
          Tell Maya about tomorrow's team meeting.
        </p>
        <TypingDots visible={typing} />
        <div className={`sah-assistant__message-card ${visible(3) ? "is-visible" : ""}`}>
          <p className="sai-eyebrow">Message to Maya</p>
          <div className="sah-assistant__employee">
            <img
              src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=96&q=80"
              alt=""
            />
            <div>
              <strong>Maya</strong>
              <span>Senior stylist</span>
            </div>
          </div>
          <blockquote>Team meeting tomorrow at 9:00. Please arrive 10 minutes early.</blockquote>
        </div>
        <div className={`sah-assistant__status ${visible(4) ? "is-visible" : ""} ${completed ? "is-ordered" : ""}`}>
          {completed && <Check aria-hidden="true" />}
          <span>{completed ? "Message sent" : "Sending..."}</span>
        </div>
      </div>

      <div
        className={`sah-assistant__thread sah-assistant__thread--performance ${isCurrent(3) ? "is-current" : ""}`}
        aria-hidden="true"
      >
        <p className={`sah-assistant__owner ${visible(1) ? "is-visible" : ""}`}>
          How is the team doing this month?
        </p>
        <TypingDots visible={typing} />
        <div className={`sah-assistant__performance-card ${visible(3) ? "is-visible" : ""}`}>
          <p className="sai-eyebrow">Team performance</p>
          <div className="sah-assistant__performance-summary">
            <strong>+12%</strong>
            <span>service revenue this month</span>
          </div>
          <div className="sah-assistant__performance-list">
            <span><b>Maya</b><small>+22%</small></span>
            <span><b>Daniela</b><small>+14%</small></span>
            <span><b>Noa</b><small>+7%</small></span>
          </div>
        </div>
        <div className={`sah-assistant__status ${visible(4) ? "is-visible" : ""} ${completed ? "is-ordered" : ""}`}>
          {completed && <Check aria-hidden="true" />}
          <span>{completed ? "Report ready" : "Building report..."}</span>
        </div>
      </div>
    </div>
  );
};

export default HeroAssistant;
