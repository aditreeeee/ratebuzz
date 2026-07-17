import React from "react";
import { useCursorGlow } from "../../hooks/useCursorGlow.js";

export function Card({ children, className = "", padded = true, glow = true, ...rest }) {
  const g = useCursorGlow();
  return (
    <div
      ref={glow ? g.ref : undefined}
      onMouseMove={glow ? g.onMouseMove : undefined}
      onMouseLeave={glow ? g.onMouseLeave : undefined}
      className={`card ${glow ? "card--glow" : ""} ${padded ? "card--padded" : ""} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
