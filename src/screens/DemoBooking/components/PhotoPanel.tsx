import React from "react";
import { PHOTO_BY_STEP, THANK_YOU_PHOTO } from "../constants";
import type { DemoBookingStepIndex } from "../types";

interface PhotoPanelProps {
  step: DemoBookingStepIndex;
  thankYou?: boolean;
}

export const PhotoPanel: React.FC<PhotoPanelProps> = ({ step, thankYou = false }) => {
  const photo = thankYou ? THANK_YOU_PHOTO : PHOTO_BY_STEP[step];

  return (
    <aside className="dbk-photo" aria-hidden="true">
      <img className="dbk-photo__image" src={photo.src} alt="" />
      <div className="dbk-photo__wash" />
      <p className="dbk-photo__mark">Spectra</p>
    </aside>
  );
};
