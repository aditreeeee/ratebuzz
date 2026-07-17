import React from "react";
import { Check, Minus } from "lucide-react";

export function Checkbox({ checked, indeterminate, onChange, label, ...rest }) {
  return (
    <label className="checkbox" onClick={(e) => e.stopPropagation()}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="checkbox__input"
        aria-label={label}
        {...rest}
      />
      <span className={`checkbox__box ${checked ? "checkbox__box--checked" : ""} ${indeterminate ? "checkbox__box--indeterminate" : ""}`}>
        {indeterminate ? <Minus size={12} strokeWidth={3} /> : checked ? <Check size={12} strokeWidth={3} /> : null}
      </span>
    </label>
  );
}
