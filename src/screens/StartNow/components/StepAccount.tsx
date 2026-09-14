import React from "react";
import { COUNTRIES, STYLIST_OPTIONS } from "../constants";
import type { StartNowController } from "../useStartNow";
import { Field } from "./FormControls";

export const StepAccount: React.FC<{ flow: StartNowController }> = ({ flow }) => (
  <div className="snw-step">
    <p className="sai-eyebrow">Let&apos;s get started</p>
    <h1 ref={flow.headingRef} className="snw-title" tabIndex={-1}>
      Create your account.
    </h1>
    <p className="sai-lede snw-lede">
      A few salon details so we can prepare Spectra for your color room.
    </p>

    <div className="snw-form snw-form--account">
      <Field id="snw-salonName" label="Salon name" required error={flow.errors.salonName}>
        <input
          className="sai-input snw-input"
          type="text"
          autoComplete="organization"
          value={flow.account.salonName}
          onChange={(event) => flow.setAccount({ salonName: event.target.value })}
        />
      </Field>
      <Field id="snw-contactName" label="Owner or contact name" required error={flow.errors.contactName}>
        <input
          className="sai-input snw-input"
          type="text"
          autoComplete="name"
          value={flow.account.contactName}
          onChange={(event) => flow.setAccount({ contactName: event.target.value })}
        />
      </Field>
      <Field id="snw-workEmail" label="Work email" required error={flow.errors.workEmail}>
        <input
          className="sai-input snw-input"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={flow.account.workEmail}
          onChange={(event) => flow.setAccount({ workEmail: event.target.value })}
        />
      </Field>
      <Field id="snw-country" label="Country" required error={flow.errors.country}>
        <select
          className="sai-select snw-input"
          autoComplete="country-name"
          value={flow.account.country}
          onChange={(event) => flow.setAccount({ country: event.target.value })}
        >
          <option value="">Select a country</option>
          {COUNTRIES.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>
      </Field>
      <Field id="snw-stylistCount" label="How many stylists?" required error={flow.errors.stylistCount}>
        <select
          className="sai-select snw-input"
          value={flow.account.stylistCount}
          onChange={(event) =>
            flow.setAccount({ stylistCount: event.target.value as typeof flow.account.stylistCount })
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
