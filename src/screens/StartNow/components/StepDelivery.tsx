import React from "react";
import { MapPin, Truck } from "lucide-react";
import type { StartNowController } from "../useStartNow";

export const StepDelivery: React.FC<{ flow: StartNowController }> = ({ flow }) => (
  <div className="snw-step">
    <p className="sai-eyebrow">Fast delivery is on the way soon</p>
    <h1 ref={flow.headingRef} className="snw-title" tabIndex={-1}>
      Your order is on the way soon.
    </h1>
    <p className="sai-lede snw-lede">
      A local estimate for {flow.delivery.destinationSummary}. Not a live carrier quote.
    </p>

    <div className="snw-estimate">
      <div className="snw-estimate__hero">
        <span className="snw-estimate__icon" aria-hidden="true">
          <Truck size={28} />
        </span>
        <p className="snw-estimate__eta">{flow.delivery.label}</p>
        <p className="snw-estimate__place">
          <MapPin size={16} aria-hidden="true" />
          {flow.delivery.destinationSummary}
        </p>
      </div>
      <p className="snw-caption">
        Delivery usually takes 3 to 5 business days based on your city and country. Tracking and
        carrier logos are not part of this local preview.
      </p>
    </div>
  </div>
);
