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
    <div className={`sai-field dbk-field${error ? " dbk-field--error" : ""}`}>
      <label className="sai-field__label dbk-label" htmlFor={id}>
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
        <p className="dbk-hint" id={hintId}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="sai-field-error dbk-error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
};

interface ChoiceOption<T extends string> {
  value: T;
  label: string;
}

interface ChoiceGroupProps<T extends string> {
  legend: string;
  name: string;
  options: ReadonlyArray<ChoiceOption<T>>;
  value: T | T[] | "";
  onChange: (value: T) => void;
  multiple?: boolean;
  error?: string;
  required?: boolean;
}

export function ChoiceGroup<T extends string>({
  legend,
  name,
  options,
  value,
  onChange,
  multiple = false,
  error,
  required,
}: ChoiceGroupProps<T>) {
  const errorId = error ? `dbk-${name}-error` : undefined;
  const selected = Array.isArray(value) ? value : value ? [value] : [];

  return (
    <fieldset
      id={`dbk-${name}`}
      className={`dbk-fieldset${error ? " dbk-field--error" : ""}`}
      aria-describedby={errorId}
      tabIndex={-1}
    >
      <legend className="sai-field__label dbk-label">
        {legend}
        {required ? <span aria-hidden="true"> *</span> : null}
      </legend>
      <div className="dbk-chips" role={multiple ? "group" : "radiogroup"} aria-required={required || undefined}>
        {options.map((option) => {
          const checked = selected.includes(option.value);
          const inputId = `dbk-${name}-${option.value}`;
          return (
            <label key={option.value} className={`sai-chip dbk-chip${checked ? " is-selected" : ""}`} htmlFor={inputId}>
              <input
                id={inputId}
                className="dbk-chip__input"
                type={multiple ? "checkbox" : "radio"}
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
              />
              <span>{option.label}</span>
            </label>
          );
        })}
      </div>
      {error ? (
        <p className="sai-field-error dbk-error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
