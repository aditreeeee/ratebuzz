import React from "react";

export function Skeleton({ width, height = 16, radius = 8, className = "" }) {
  return (
    <span
      className={`skeleton ${className}`}
      style={{ width: width || "100%", height, borderRadius: radius }}
    />
  );
}

export function TableSkeleton({ rows = 5, cols = 6 }) {
  return (
    <div className="table-skeleton">
      {Array.from({ length: rows }).map((_, r) => (
        <div className="table-skeleton__row" key={r}>
          {Array.from({ length: cols }).map((__, c) => (
            <Skeleton key={c} height={14} />
          ))}
        </div>
      ))}
    </div>
  );
}
