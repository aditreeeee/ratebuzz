import React, { memo } from "react";

const STATUS_VARIANT = {
  Active: "success",
  Draft: "info",
  Inactive: "warning",
  Archived: "danger",
  Seasonal: "info",
  Scheduled: "info",
  Expired: "danger",
};

// Rendered once per row in every list table (often 10+ per page) — memoized
// since props are just primitives (variant/status strings), so a shallow
// prop-equality check reliably skips re-render when the parent row rerenders
// for unrelated reasons (e.g. sibling selection state).
export const Badge = memo(function Badge({ children, variant = "info", className = "" }) {
  return <span className={`badge badge--${variant} ${className}`}>{children}</span>;
});

export const StatusBadge = memo(function StatusBadge({ status }) {
  const variant = STATUS_VARIANT[status] || "info";
  return <Badge variant={variant}>{status}</Badge>;
});
