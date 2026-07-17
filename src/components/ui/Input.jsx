import React from "react";

export function Field({ label, hint, error, required, children, id }) {
  return (
    <div className="field">
      {label && (
        <label htmlFor={id} className="field__label">
          {label} {required && <span className="field__required">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <span className="field__hint">{hint}</span>}
      {error && <span className="field__error">{error}</span>}
    </div>
  );
}

export function Input({ className = "", tabular = false, icon: IconEl, ...rest }) {
  if (IconEl) {
    return (
      <div className="input-with-icon">
        <IconEl size={16} strokeWidth={2} className="input-with-icon__icon" />
        <input className={`input ${tabular ? "tabular" : ""} ${className}`} {...rest} />
      </div>
    );
  }
  return <input className={`input ${tabular ? "tabular" : ""} ${className}`} {...rest} />;
}

export function Textarea({ className = "", ...rest }) {
  return <textarea className={`input textarea ${className}`} {...rest} />;
}

export function Select({ className = "", options = [], placeholder, ...rest }) {
  return (
    <select className={`input select ${className}`} {...rest}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}
