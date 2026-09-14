import React from "react";
import { COUNTRIES } from "../constants";
import type { StartNowController } from "../useStartNow";
import { Field } from "./FormControls";

export const StepShipping: React.FC<{ flow: StartNowController }> = ({ flow }) => (
  <div className="snw-step">
    <p className="sai-eyebrow">Where should we send it?</p>
    <h1 ref={flow.headingRef} className="snw-title" tabIndex={-1}>
      Enter your shipping address.
    </h1>
    <p className="sai-lede snw-lede">We&apos;ll use this for the local delivery estimate after checkout.</p>

    <div className="snw-form snw-form--shipping">
      <Field id="snw-fullName" label="Full name" required error={flow.errors.fullName}>
        <input
          className="sai-input snw-input"
          type="text"
          autoComplete="name"
          value={flow.shipping.fullName}
          onChange={(event) => flow.setShipping({ fullName: event.target.value })}
        />
      </Field>
      <Field id="snw-phone" label="Phone number" required error={flow.errors.phone}>
        <input
          className="sai-input snw-input"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          value={flow.shipping.phone}
          onChange={(event) => flow.setShipping({ phone: event.target.value })}
        />
      </Field>
      <Field id="snw-address1" label="Address line 1" required error={flow.errors.address1}>
        <input
          className="sai-input snw-input"
          type="text"
          autoComplete="address-line1"
          value={flow.shipping.address1}
          onChange={(event) => flow.setShipping({ address1: event.target.value })}
        />
      </Field>
      <Field id="snw-address2" label="Address line 2 (optional)" error={flow.errors.address2}>
        <input
          className="sai-input snw-input"
          type="text"
          autoComplete="address-line2"
          value={flow.shipping.address2}
          onChange={(event) => flow.setShipping({ address2: event.target.value })}
        />
      </Field>
      <Field id="snw-city" label="City" required error={flow.errors.city}>
        <input
          className="sai-input snw-input"
          type="text"
          autoComplete="address-level2"
          value={flow.shipping.city}
          onChange={(event) => flow.setShipping({ city: event.target.value })}
        />
      </Field>
      <Field id="snw-postalCode" label="Postal code" required error={flow.errors.postalCode}>
        <input
          className="sai-input snw-input"
          type="text"
          autoComplete="postal-code"
          value={flow.shipping.postalCode}
          onChange={(event) => flow.setShipping({ postalCode: event.target.value })}
        />
      </Field>
      <Field id="snw-shippingCountry" label="Country" required error={flow.errors.shippingCountry}>
        <select
          className="sai-select snw-input"
          autoComplete="country-name"
          value={flow.shipping.country}
          onChange={(event) => flow.setShipping({ country: event.target.value })}
        >
          <option value="">Select a country</option>
          {COUNTRIES.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>
      </Field>
    </div>
  </div>
);
