import React from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

export function Table({ columns, data, sortKey, sortDir, onSort, renderRow, rowKey, emptyState }) {
  if (!data.length) return emptyState || null;
  return (
    <div className="table-scroll">
      <table className="table">
        <thead>
          <tr>
            {columns.map((col) => {
              const isSorted = col.sortable && sortKey === col.key;
              const ariaSort = !col.sortable ? undefined : isSorted ? (sortDir === "asc" ? "ascending" : "descending") : "none";
              return (
                <th
                  key={col.key}
                  className={col.sortable ? "table__th table__th--sortable" : "table__th"}
                  onClick={() => col.sortable && onSort(col.key)}
                  onKeyDown={(e) => {
                    if (col.sortable && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      onSort(col.key);
                    }
                  }}
                  tabIndex={col.sortable ? 0 : undefined}
                  aria-sort={ariaSort}
                  style={col.width ? { width: col.width } : undefined}
                >
                  <span className="table__th-content">
                    {col.label}
                    {col.sortable &&
                      (isSorted ? (
                        sortDir === "asc" ? (
                          <ChevronUp size={14} strokeWidth={2} />
                        ) : (
                          <ChevronDown size={14} strokeWidth={2} />
                        )
                      ) : (
                        <ChevronsUpDown size={14} strokeWidth={2} className="table__sort-idle" />
                      ))}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>{data.map((row) => renderRow(row, rowKey(row)))}</tbody>
      </table>
    </div>
  );
}
