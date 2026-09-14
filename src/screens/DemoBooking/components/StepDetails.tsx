import React from "react";
import { COUNTRIES, STYLIST_OPTIONS } from "../constants";
import type { DemoBookingController } from "../useDemoBooking";
import { Field } from "./FormControls";

export const StepDetails: React.FC<{ flow: DemoBookingController }> = ({ flow }) => (
  <div className="dbk-step">
    <p className="sai-eyebrow">Let&apos;s get started</p>
    <h1 ref={flow.headingRef} className="dbk-title" tabIndex={-1}>
      Tell us about your salon.
    </h1>
    <p className="sai-lede dbk-lede">
      A few details and we&apos;ll find the best time for a Spectra walkthrough.
    </p>

    <div className="dbk-form dbk-form--details">
      <Field id="dbk-salonName" label="Salon name" required error={flow.errors.salonName}>
        <input
          className="sai-input dbk-input"
          type="text"
          autoComplete="organization"
          value={flow.details.salonName}
          onChange={(event) => flow.setDetails({ salonName: event.target.value })}
        />
      </Field>
      <Field id="dbk-contactName" label="Your name" required error={flow.errors.contactName}>
        <input
          className="sai-input dbk-input"
          type="text"
          autoComplete="name"
          value={flow.details.contactName}
          onChange={(event) => flow.setDetails({ contactName: event.target.value })}
        />
      </Field>
      <Field id="dbk-workEmail" label="Work email" required error={flow.errors.workEmail}>
        <input
          className="sai-input dbk-input"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={flow.details.workEmail}
          onChange={(event) => flow.setDetails({ workEmail: event.target.value })}
        />
      </Field>
      <Field id="dbk-country" label="Country" required error={flow.errors.country}>
        <select
          className="sai-select dbk-input"
          autoComplete="country-name"
          value={flow.details.country}
          onChange={(event) => flow.setDetails({ country: event.target.value })}
        >
          <option value="">Select a country</option>
          {COUNTRIES.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>
      </Field>
      <Field id="dbk-stylistCount" label="How many stylists?" required error={flow.errors.stylistCount}>
        <select
          className="sai-select dbk-input"
          value={flow.details.stylistCount}
          onChange={(event) =>
            flow.setDetails({ stylistCount: event.target.value as typeof flow.details.stylistCount })
          }
        >
          <option value="">Select a range</option>
          {STYLIST_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>
    </div>
  </div>
);
