import React from "react";
import { CreditCard, ShieldCheck, Wallet } from "lucide-react";
import { EQUIPMENT_OPTIONS, PAYMENT_OPTIONS } from "../constants";
import type { PaymentMethod } from "../types";
import type { StartNowController } from "../useStartNow";

const ICONS: Record<PaymentMethod, React.ReactNode> = {
  card: <CreditCard size={22} aria-hidden="true" />,
  paypal: <Wallet size={22} aria-hidden="true" />,
};

export const StepPayment: React.FC<{ flow: StartNowController }> = ({ flow }) => {
  const items = EQUIPMENT_OPTIONS.filter((item) => flow.equipment.includes(item.id))
    .map((item) => item.title)
    .join(", ");

  return (
    <div className="snw-step snw-step--payment">
      <p className="sai-eyebrow">Secure local checkout</p>
      <h1 ref={flow.headingRef} className="snw-title" tabIndex={-1}>
        Complete your order.
      </h1>
      <p className="sai-lede snw-lede">
        This is a checkout preview. Authorization is simulated in this browser.
      </p>

      <article className="snw-checkout">
        <header className="snw-checkout__head">
          <ShieldCheck size={20} aria-hidden="true" />
          <div>
            <p className="snw-checkout__kicker">Local authorization only</p>
            <p className="snw-caption">
              We never collect or store card numbers, expiry, CVC, or PayPal credentials.
            </p>
          </div>
        </header>

        <fieldset className={`snw-fieldset${flow.errors.paymentMethod ? " snw-field--error" : ""}`}>
          <legend className="snw-label">Checkout option</legend>
          <div className="snw-choices" id="snw-paymentMethod" role="radiogroup" tabIndex={-1}>
            {PAYMENT_OPTIONS.map((option) => {
              const selected = flow.paymentMethod === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className={`snw-choice${selected ? " is-selected" : ""}`}
                  onClick={() => flow.setPaymentMethod(option.id)}
                >
                  <span className="snw-choice__icon">{ICONS[option.id]}</span>
                  <span className="snw-choice__copy">
                    <span className="snw-choice__title">{option.title}</span>
                    <span className="snw-choice__text">{option.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
          {flow.errors.paymentMethod ? (
            <p className="sai-field-error snw-error" role="alert">
              {flow.errors.paymentMethod}
            </p>
          ) : null}
        </fieldset>

        <dl className="snw-summary">
          <div>
            <dt>Salon</dt>
            <dd>{flow.account.salonName}</dd>
          </div>
          <div>
            <dt>Setup</dt>
            <dd>{items}</dd>
          </div>
          <div>
            <dt>Ship to</dt>
            <dd>{flow.delivery.destinationSummary}</dd>
          </div>
          <div>
            <dt>Estimate</dt>
            <dd>{flow.delivery.label}</dd>
          </div>
        </dl>
      </article>

      {flow.submitError ? (
        <p className="snw-error" role="alert">
          {flow.submitError}
        </p>
      ) : null}
    </div>
  );
};
