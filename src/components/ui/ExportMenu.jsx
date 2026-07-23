import React, { useState, useRef, useEffect } from "react";
import { Download, FileSpreadsheet, FileText, ChevronDown } from "lucide-react";
import { exportRows } from "../../lib/exportUtils.js";
import { useToast } from "../../context/ToastContext.jsx";
import { usePersistedState } from "../../hooks/usePersistedState.js";
import { IMPORT_EXPORT_SETTINGS_DEFAULTS } from "../../lib/competitorSettingsDefaults.js";

const FORMAT_KEY = { CSV: "csv", Excel: "excel" };

/**
 * Shared export control for Properties/Rooms/Rate Plans list pages.
 * `rows` should already reflect the caller's selected-or-filtered set.
 * Settings → Configuration Settings → Import & Export → Default Export
 * Format's real effect: clicking the main button exports immediately in
 * that format — the dropdown (opened via the small chevron) still offers
 * every format explicitly, for a one-off different choice.
 */
export function ExportMenu({ rows, columns, filenameBase, selectedCount }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const toast = useToast();
  const [importExportSettings] = usePersistedState("settings.competitors.importExport", IMPORT_EXPORT_SETTINGS_DEFAULTS);
  const defaultFormatKey = FORMAT_KEY[importExportSettings.defaultFormat] || "csv";

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handle = (format) => {
    const result = exportRows({ format, rows, columns, filenameBase });
    if (result.ok) toast.success(`Exported ${rows.length} record(s) as ${format.toUpperCase()}.`);
    else toast.info(result.reason);
    setOpen(false);
  };

  return (
    <div className="export-menu" ref={ref} style={{ display: "flex" }}>
      <button
        type="button"
        className="btn btn--ghost btn--md"
        style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
        onClick={() => handle(defaultFormatKey)}
        title={`Export as ${importExportSettings.defaultFormat} (default format — change in Settings)`}
      >
        <Download size={16} strokeWidth={2} />
        <span>Export{selectedCount ? ` (${selectedCount})` : ""}</span>
      </button>
      <button
        type="button"
        className="btn btn--ghost btn--md"
        style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderLeft: "1px solid var(--color-border)", padding: "0 8px" }}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Choose export format"
      >
        <ChevronDown size={14} strokeWidth={2} />
      </button>
      {open && (
        <div className="export-menu__panel" role="menu">
          <button role="menuitem" className="export-menu__item" onClick={() => handle("csv")}>
            <FileText size={15} strokeWidth={2} /> CSV
          </button>
          <button role="menuitem" className="export-menu__item" onClick={() => handle("excel")}>
            <FileSpreadsheet size={15} strokeWidth={2} /> Excel (.xls)
          </button>
          <button role="menuitem" className="export-menu__item export-menu__item--disabled" disabled>
            <FileText size={15} strokeWidth={2} /> PDF <span className="export-menu__soon">Coming soon</span>
          </button>
        </div>
      )}
    </div>
  );
}
