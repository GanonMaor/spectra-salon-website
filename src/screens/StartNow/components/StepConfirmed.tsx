import React from "react";
import { CheckCircle } from "lucide-react";
import { buildOrderEmailPreview } from "../orderEmail";
import type { StartNowController } from "../useStartNow";

export const StepConfirmed: React.FC<{ flow: StartNowController }> = ({ flow }) => {
  const order = flow.order;
  const preview = order ? buildOrderEmailPreview(order) : null;
  const lines = order
    ? [
        order.shipping.fullName,
        order.shipping.address1,
        order.shipping.address2,
        [order.shipping.city, order.shipping.postalCode].filter(Boolean).join(" "),
        flow.delivery.destinationSummary,
      ].filter(Boolean)
    : [];

  return (
    <div className="snw-step">
      <div className="snw-check" aria-hidden="true">
        <CheckCircle size={28} />
      </div>
      <p className="sai-eyebrow">Thank you</p>
      <h1 ref={flow.headingRef} className="snw-title" tabIndex={-1}>
        Your order is confirmed.
      </h1>
      <p className="sai-lede snw-lede">
        Saved in this browser. This is a local confirmation, not live fulfillment.
      </p>

      <dl className="snw-summary">
        <div>
          <dt>Ships to</dt>
          <dd>
            {lines.map((line, index) => (
              <React.Fragment key={`${index}-${line}`}>
                {line}
                <br />
              </React.Fragment>
            ))}
          </dd>
        </div>
        <div>
          <dt>Estimate</dt>
          <dd>{flow.delivery.label}</dd>
        </div>
        <div>
          <dt>Order</dt>
          <dd>{order?.id ?? "Not available"}</dd>
        </div>
      </dl>

      {order ? (
        <p className="snw-caption">
          A confirmation preview is ready for {order.account.workEmail}. Live email is not sent from
          this local module.
        </p>
      ) : null}

      {preview ? (
        <>
          <button
            type="button"
            className="snw-text-link"
            aria-expanded={flow.showEmailPreview}
            onClick={() => flow.toggleEmailPreview()}
          >
            {flow.showEmailPreview ? "Hide email preview" : "View email preview"}
          </button>
          {flow.showEmailPreview ? (
            <article className="snw-email" aria-labelledby="snw-email-title">
              <p className="sai-eyebrow">Confirmation email</p>
              <h2 id="snw-email-title" className="snw-email__subject">
                {preview.subject}
              </h2>
              <div className="snw-email__body">
                <p>{preview.greeting}</p>
                {preview.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>
          ) : null}
        </>
      ) : null}
    </div>
  );
};
