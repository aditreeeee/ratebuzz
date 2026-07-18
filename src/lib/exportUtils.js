// Shared list-export utility used by Properties, Rooms, and Rate Plans pages.
// Frontend-only: CSV is generated and downloaded entirely client-side.
//
// Excel: rather than bundle an xlsx-writing library (against the "no new
// dependencies" constraint), we serve the same CSV content with an
// .xls-friendly MIME type/extension. Excel/Sheets both open CSV content
// natively, but this is clearly a CSV under the hood, not a real binary
// .xlsx workbook.
//
// PDF: placeholder only — real PDF generation needs either a client library
// or a backend render, both out of scope here. `exportRows` returns
// `{ ok: false, reason }` for "pdf" so callers can surface a "Coming soon"
// message instead of a broken download.
//
// Single seam for later API integration: swap the CSV/Excel branches below
// for a call to the future .NET export endpoint without touching callers —
// every caller only ever calls `exportRows(...)`.

function escapeCsvCell(value) {
  const s = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function toCSV(rows, columns) {
  const header = columns.map((c) => escapeCsvCell(c.label)).join(",");
  const body = rows.map((row) => columns.map((c) => escapeCsvCell(c.value(row))).join(",")).join("\n");
  return `${header}\n${body}`;
}

function download(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportRows({ format, rows, columns, filenameBase }) {
  const stamp = new Date().toISOString().slice(0, 10);
  if (!rows.length) return { ok: false, reason: "Nothing to export — no rows match the current selection/filters." };

  if (format === "csv") {
    download(`${filenameBase}-${stamp}.csv`, toCSV(rows, columns), "text/csv;charset=utf-8;");
    return { ok: true };
  }
  if (format === "excel") {
    download(`${filenameBase}-${stamp}.xls`, toCSV(rows, columns), "application/vnd.ms-excel");
    return { ok: true };
  }
  if (format === "pdf") {
    return { ok: false, reason: "PDF export is coming soon." };
  }
  return { ok: false, reason: "Unknown export format." };
}
