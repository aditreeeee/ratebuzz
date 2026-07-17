import React from "react";

const STATUS_VARIANT = {
  Active: "success",
  Inactive: "warning",
  Archived: "danger",
};

export function Badge({ children, variant = "info", className = "" }) {
  return <span className={`badge badge--${variant} ${className}`}>{children}</span>;
}

export function StatusBadge({ status }) {
  const variant = STATUS_VARIANT[status] || "info";
  return <Badge variant={variant}>{status}</Badge>;
}
