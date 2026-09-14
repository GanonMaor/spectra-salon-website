import React, { useEffect, useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { SalonAiLockup } from "../../components/SalonAiLockup";
import { SalonAiEditorialTheme } from "../../design/salonAiEditorial";
import { BOOK_DEMO_HREF, LOGIN_HREF, STEP_LABELS } from "./constants";
import { ProgressIndicator } from "./components/ProgressIndicator";
import { StepAccount } from "./components/StepAccount";
import { StepAllSet } from "./components/StepAllSet";
import { StepConfirmed } from "./components/StepConfirmed";
import { StepDelivery } from "./components/StepDelivery";
import { StepDevice } from "./components/StepDevice";
import { StepEquipment } from "./components/StepEquipment";
import { StepNext } from "./components/StepNext";
import { StepPassword } from "./components/StepPassword";
import { StepPayment } from "./components/StepPayment";
import { StepShipping } from "./components/StepShipping";
import { SummaryRail } from "./components/SummaryRail";
import { loadStartNowHandoff } from "./handoff";
import "./startNow.css";
import type { StartNowSearch } from "./seed";
import type { StartNowAnalyticsEvent, StartNowOrder, StartNowRepository, StartNowSeed, StartNowSeedSource } from "./types";
import { useStartNow } from "./useStartNow";

export interface StartNowPageProps {
  repository?: StartNowRepository;
  seed?: StartNowSeed;
  search?: StartNowSearch;
  seedSource?: StartNowSeedSource;
  onAnalytics?: (event: StartNowAnalyticsEvent) => void;
  onComplete?: (order: StartNowOrder) => void;
  bookDemoHref?: string;
  loginHref?: string;
}

function primaryLabel(step: number, authorizing: boolean): string {
  if (authorizing) return "Authorizing…";
  if (step === 5) return "Place order";
  if (step === 6) return "Continue to account setup";
  if (step === 7) return "Create account";
  if (step === 8) return "Continue";
  if (step === 9) return "Go to login";
  return "Continue";
}

export const StartNowPage: React.FC<StartNowPageProps> = ({
  repository,
  seed,
  search,
  seedSource,
  onAnalytics,
  onComplete,
  bookDemoHref = BOOK_DEMO_HREF,
  loginHref = LOGIN_HREF,
}) => {
  const handoffSeed = useMemo(() => seed ?? loadStartNowHandoff(), [seed]);
  const flow = useStartNow({
    repository,
    seed: handoffSeed,
    search,
    seedSource,
    onAnalytics,
    onComplete,
  });
  const authorizing = flow.status === "authorizing";
  const centeredMilestone = flow.step === 6 || flow.step === 8;

  useEffect(() => {
    const previous = document.title;
    document.title = "Start now · Spectra";
    return () => {
      document.title = previous;
    };
  }, []);

  const liveMessage =
    flow.step === 6 && flow.order
      ? `Order ${flow.order.id} confirmed locally.`
      : `${STEP_LABELS[flow.step]} step.`;

  return (
    <SalonAiEditorialTheme as="main" className="snw" aria-busy={authorizing}>
      <a className="snw-skip" href="#snw-form">
        Skip to start-now form
      </a>
      <div className={`snw-shell${centeredMilestone ? " snw-shell--single" : ""}`}>
        <section className="snw-pane" aria-labelledby="snw-brand">
          <header className="snw-top">
            <a className="snw-brand" id="snw-brand" href="/new-home" aria-label="Salon AI home">
              <SalonAiLockup size="header" />
            </a>
            <ProgressIndicator step={flow.step} locked={flow.locked} onSelect={flow.goToStep} />
          </header>

          <p className="snw-sr-only" aria-live="polite">
            {liveMessage}
          </p>

          <div className="snw-body" id="snw-form">
            {flow.hydrated && flow.step === 0 ? <StepAccount flow={flow} /> : null}
            {flow.hydrated && flow.step === 1 ? <StepEquipment flow={flow} /> : null}
            {flow.hydrated && flow.step === 2 ? <StepDevice flow={flow} /> : null}
            {flow.hydrated && flow.step === 3 ? <StepShipping flow={flow} /> : null}
            {flow.hydrated && flow.step === 4 ? <StepDelivery flow={flow} /> : null}
            {flow.hydrated && flow.step === 5 ? <StepPayment flow={flow} /> : null}
            {flow.hydrated && flow.step === 6 ? <StepConfirmed flow={flow} /> : null}
            {flow.hydrated && flow.step === 7 ? <StepPassword flow={flow} /> : null}
            {flow.hydrated && flow.step === 8 ? <StepAllSet flow={flow} /> : null}
            {flow.hydrated && flow.step === 9 ? (
              <StepNext flow={flow} bookDemoHref={bookDemoHref} loginHref={loginHref} />
            ) : null}
          </div>

          <footer className="snw-actions">
            {flow.canGoBack ? (
              <button type="button" className="snw-text-link" onClick={flow.goBack}>
                Back
              </button>
            ) : (
              <span />
            )}

            <div className="snw-actions__primary">
              {flow.step === 9 ? (
                <a className="sai-button" href={loginHref}>
                  Go to login
                  <ArrowRight aria-hidden="true" size={16} />
                </a>
              ) : (
                <button
                  type="button"
                  className="sai-button"
                  onClick={flow.goNext}
                  disabled={authorizing}
                >
                  {primaryLabel(flow.step, authorizing)}
                  <ArrowRight aria-hidden="true" size={16} />
                </button>
              )}
            </div>
          </footer>
        </section>

        {centeredMilestone ? null : <SummaryRail flow={flow} />}
      </div>
    </SalonAiEditorialTheme>
  );
};

export default StartNowPage;
