import React from "react";

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}

export const Field: React.FC<FieldProps> = ({ id, label, error, required, hint, children }) => {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={`sai-field snw-field${error ? " snw-field--error" : ""}`}>
      <label className="sai-field__label snw-label" htmlFor={id}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
          id,
          "aria-invalid": error ? true : undefined,
          "aria-describedby": describedBy,
          "aria-required": required || undefined,
        });
      })}
      {hint ? (
        <p className="snw-hint" id={hintId}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="sai-field-error snw-error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
};
