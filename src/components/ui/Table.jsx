import React from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

// No explicit/computed `height` on the scroll container on purpose — even a
// single px of mismatch between an estimated row height and real rendered
// content (text wrapping, sub-pixel rounding, etc.) is enough to trigger a
// vertical scrollbar, because `overflow-x: auto` alone makes the browser
// compute `overflow-y` as `auto` too (see the CSS overflow spec, and the
// note on `.tag-chip--more[title]` below for the same quirk elsewhere in
// this file). Leaving height fully natural means the container always
// exactly equals its content's real height, so that forced-auto vertical
// overflow never has anything to actually scroll — all rows for the current
// page render in full, however many there are, and the page itself grows to
// fit rather than the table clipping internally.
export function Table({ columns, data, sortKey, sortDir, onSort, renderRow, rowKey, emptyState, stickyHeader = false, minWidth }) {
  // `table-layout: fixed` + `width: 100%` (see components.css) means a
  // column left without an explicit width (e.g. the "widest" Hotel/Name
  // column) only gets the container's *remaining* space — which, once a
  // grid has many fixed-width columns, can shrink to a few unreadable
  // pixels on anything narrower than a very wide monitor, instead of
  // triggering the horizontal scrollbar `.table-scroll` provides. Passing
  // `minWidth` (the sum of every column's width, including a sane floor for
  // the flexible one) guarantees that never happens: below that width the
  // table scrolls instead of squeezing a column into illegibility.
  return (
    <div className="table-scroll">
      <table className={`table ${stickyHeader ? "table--sticky-header" : ""}`} style={{ tableLayout: "fixed", minWidth: minWidth || undefined }}>
        <colgroup>
          {columns.map((col) => (
            <col key={col.key} style={col.width ? { width: col.width } : undefined} />
          ))}
        </colgroup>
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
        <tbody
          key={data.length ? data.map((row) => rowKey(row)).join("|") : "empty"}
          className="table__tbody-transition"
        >
          {data.length ? (
            data.map((row) => renderRow(row, rowKey(row)))
          ) : (
            <tr className="table__empty-row">
              <td colSpan={columns.length}>{emptyState}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
