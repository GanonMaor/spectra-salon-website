import React, { useEffect, useState } from "react";
import type { PasswordFieldErrors } from "../types";
import {
  firstPasswordErrorKey,
  hasErrors,
  passwordStrengthLabel,
  validatePasswordForm,
} from "../validation";
import type { StartNowController } from "../useStartNow";
import { Field } from "./FormControls";

export const StepPassword: React.FC<{ flow: StartNowController }> = ({ flow }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<PasswordFieldErrors>({});
  const [showErrors, setShowErrors] = useState(false);
  const registerPasswordGate = flow.registerPasswordGate;
  const passwordAlreadySet = Boolean(flow.order?.passwordSet);
  const workEmail = flow.account.workEmail;

  useEffect(() => {
    registerPasswordGate(() => {
      if (passwordAlreadySet) return true;
      const next = validatePasswordForm({
        password,
        confirmPassword,
        acceptedTerms,
        email: workEmail,
      });
      setErrors(next);
      setShowErrors(true);
      if (hasErrors(next)) {
        const key = firstPasswordErrorKey(next);
        if (key) document.getElementById(`snw-${key}`)?.focus();
        return false;
      }
      setPassword("");
      setConfirmPassword("");
      return true;
    });
    return () => registerPasswordGate(null);
  }, [acceptedTerms, confirmPassword, password, passwordAlreadySet, registerPasswordGate, workEmail]);

  const strength = passwordStrengthLabel(password);
  const alreadySet = passwordAlreadySet;

  return (
    <div className="snw-step">
      <p className="sai-eyebrow">Almost there</p>
      <h1 ref={flow.headingRef} className="snw-title" tabIndex={-1}>
        Set your password.
      </h1>
      <p className="sai-lede snw-lede">
        {alreadySet
          ? "A password was already marked as set in this browser."
          : "Create a password to access your Spectra account later. It stays on this screen only."}
      </p>

      {alreadySet ? (
        <p className="snw-caption">Continue to finish setup. The password itself was never saved.</p>
      ) : (
        <div className="snw-form">
          <Field
            id="snw-workEmailDisplay"
            label="Email"
            hint="Shown for this local account only. Not sent anywhere."
          >
            <input
              className="sai-input snw-input"
              type="email"
              value={flow.account.workEmail}
              readOnly
              autoComplete="username"
            />
          </Field>
          <Field
            id="snw-password"
            label="Create password"
            required
            error={showErrors ? errors.password : undefined}
            hint={
              password
                ? `${strength}. Use 8+ characters with a letter and a number.`
                : "Use 8+ characters with a letter and a number."
            }
          >
            <input
              className="sai-input snw-input"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </Field>
          <Field
            id="snw-confirmPassword"
            label="Confirm password"
            required
            error={showErrors ? errors.confirmPassword : undefined}
          >
            <input
              className="sai-input snw-input"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </Field>
          <div className={`snw-terms${showErrors && errors.acceptedTerms ? " snw-field--error" : ""}`}>
            <label className="snw-terms__label" htmlFor="snw-acceptedTerms">
              <input
                id="snw-acceptedTerms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
              />
              <span>
                I agree to Spectra&apos;s terms and privacy policy. Legal pages are not attached in
                this local preview.
              </span>
            </label>
            {showErrors && errors.acceptedTerms ? (
              <p className="sai-field-error snw-error" role="alert">
                {errors.acceptedTerms}
              </p>
            ) : null}
          </div>
        </div>
      )}

      {flow.submitError ? (
        <p className="snw-error" role="alert">
          {flow.submitError}
        </p>
      ) : null}
    </div>
  );
};
