import React, { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { SalonAiLockup } from "../../components/SalonAiLockup";
import { SalonAiEditorialTheme } from "../../design/salonAiEditorial";
import { STEP_LABELS } from "./constants";
import { PhotoPanel } from "./components/PhotoPanel";
import { ProgressIndicator } from "./components/ProgressIndicator";
import { StepConfirm } from "./components/StepConfirm";
import { StepDetails } from "./components/StepDetails";
import { StepQuestions } from "./components/StepQuestions";
import { StepSchedule } from "./components/StepSchedule";
import { ThankYouState } from "./components/ThankYouState";
import "./demoBooking.css";
import { getBrowserTimeZone } from "./time";
import type { DemoBooking, DemoBookingRepository } from "./types";
import { useDemoBooking } from "./useDemoBooking";

export interface DemoBookingPageProps {
  repository?: DemoBookingRepository;
  timeZone?: string;
  onComplete?: (booking: DemoBooking) => void;
}

export const DemoBookingPage: React.FC<DemoBookingPageProps> = ({
  repository,
  timeZone,
  onComplete,
}) => {
  const zone = timeZone ?? getBrowserTimeZone();
  const flow = useDemoBooking({ repository, timeZone: zone, onComplete });
  const booked = flow.status === "confirmed" && !!flow.booking;
  const thankYou = flow.status === "thankyou";

  useEffect(() => {
    const previous = document.title;
    document.title = "Book a Spectra demo";
    return () => {
      document.title = previous;
    };
  }, []);

  const primaryLabel = (() => {
    if (flow.step === 3 && !booked) return flow.booking ? "Confirm new time" : "Confirm booking";
    return "Continue";
  })();

  const onPrimary = () => {
    if (flow.step === 3 && !booked) {
      void flow.confirmBooking();
      return;
    }
    flow.goNext();
  };

  return (
    <SalonAiEditorialTheme as="main" className="dbk" aria-busy={flow.status === "submitting"}>
      <a className="dbk-skip" href="#dbk-form">
        Skip to booking form
      </a>
      <div className="dbk-shell">
        <section className="dbk-pane" aria-labelledby="dbk-brand">
          <header className="dbk-top">
            <a className="dbk-brand" id="dbk-brand" href="/new-home" aria-label="Salon AI home">
              <SalonAiLockup size="header" />
            </a>
            {!thankYou ? (
              <ProgressIndicator
                step={flow.step}
                allowJumpTo={flow.step}
                onSelect={(step) => {
                  if (step <= flow.step) flow.goToStep(step);
                }}
              />
            ) : null}
          </header>

          <p className="dbk-sr-only" aria-live="polite">
            {thankYou ? "Thank you. Your demo is booked." : `${STEP_LABELS[flow.step]} step.`}
          </p>
          <div className="dbk-body" id="dbk-form">
            {thankYou ? (
              <ThankYouState flow={flow} />
            ) : (
              <>
                {flow.step === 0 ? <StepDetails flow={flow} /> : null}
                {flow.step === 1 ? <StepSchedule flow={flow} /> : null}
                {flow.step === 2 ? <StepQuestions flow={flow} /> : null}
                {flow.step === 3 ? <StepConfirm flow={flow} /> : null}
              </>
            )}
          </div>

          {!thankYou ? (
            <footer className="dbk-actions">
              {flow.step > 0 || booked ? (
                <button
                  type="button"
                  className="dbk-text-link"
                  onClick={booked && flow.step === 3 ? flow.startReschedule : flow.goBack}
                >
                  {booked && flow.step === 3 ? "Reschedule" : "Back"}
                </button>
              ) : (
                <span />
              )}

              <div className="dbk-actions__primary">
                {booked && flow.step === 3 ? (
                  <>
                    <button type="button" className="sai-button" onClick={flow.addToCalendar}>
                      Add to calendar
                    </button>
                    <button type="button" className="dbk-text-link" onClick={flow.showThankYou}>
                      Continue
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="sai-button"
                    onClick={onPrimary}
                    disabled={flow.status === "submitting"}
                  >
                    {flow.status === "submitting" ? "Booking…" : primaryLabel}
                    <ArrowRight aria-hidden="true" size={16} />
                  </button>
                )}
              </div>
            </footer>
          ) : null}
        </section>

        <PhotoPanel step={flow.step} thankYou={thankYou} />
      </div>
    </SalonAiEditorialTheme>
  );
};

export default DemoBookingPage;
