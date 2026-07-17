import React from "react";
import { useCursorGlow } from "../../hooks/useCursorGlow.js";

export function Button({
  children,
  variant = "primary",
  size = "md",
  icon: IconEl,
  iconPosition = "left",
  loading = false,
  className = "",
  ...rest
}) {
  const glow = useCursorGlow();
  return (
    <button
      ref={glow.ref}
      onMouseMove={glow.onMouseMove}
      onMouseLeave={glow.onMouseLeave}
      className={`btn btn--${variant} btn--${size} ${className}`}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading && <span className="btn__spinner" aria-hidden="true" />}
      {!loading && IconEl && iconPosition === "left" && <IconEl size={16} strokeWidth={2} />}
      <span>{children}</span>
      {!loading && IconEl && iconPosition === "right" && <IconEl size={16} strokeWidth={2} />}
    </button>
  );
}
