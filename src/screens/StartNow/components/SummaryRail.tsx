import React from "react";
import { EQUIPMENT_OPTIONS, PHOTO_BY_STEP, countryName } from "../constants";
import type { StartNowController } from "../useStartNow";

interface SummaryRailProps {
  flow: StartNowController;
}

export const SummaryRail: React.FC<SummaryRailProps> = ({ flow }) => {
  const photo = PHOTO_BY_STEP[flow.step];
  const eager = flow.step === 0;
  const selectedEquipment = EQUIPMENT_OPTIONS.filter((item) => flow.equipment.includes(item.id));
  const destination = flow.delivery.destinationSummary;
  const country = countryName(flow.account.country || flow.shipping.country);

  return (
    <aside className="snw-rail">
      <div className="snw-rail__photo">
        <img
          className="snw-rail__image"
          src={photo.src}
          alt=""
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          style={{ objectPosition: photo.position }}
        />
        <div className="snw-rail__wash" />
        <p className="snw-rail__mark">Spectra</p>
      </div>

      <div className="snw-rail__summary">
        <p className="sai-eyebrow">Your setup</p>
        <dl className="snw-rail__dl">
          {flow.account.salonName ? (
            <div>
              <dt>Salon</dt>
              <dd>{flow.account.salonName}</dd>
            </div>
          ) : null}
          {selectedEquipment.length > 0 && flow.step >= 1 ? (
            <div>
              <dt>Equipment</dt>
              <dd>{selectedEquipment.length} selected</dd>
            </div>
          ) : null}
          {country && flow.step >= 3 ? (
            <div>
              <dt>Ship to</dt>
              <dd>{destination !== "your area" ? destination : country}</dd>
            </div>
          ) : null}
          {flow.step >= 4 ? (
            <div>
              <dt>Estimate</dt>
              <dd>{flow.delivery.label}</dd>
            </div>
          ) : null}
          {flow.order ? (
            <div>
              <dt>Order</dt>
              <dd>{flow.order.id}</dd>
            </div>
          ) : null}
        </dl>
        <p className="snw-caption">
          Local preview in this browser. Nothing is charged or emailed from this module.
        </p>
      </div>
    </aside>
  );
};
