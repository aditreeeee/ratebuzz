import React, { useState, useRef, useEffect } from "react";
import { Download, FileSpreadsheet, FileText, ChevronDown } from "lucide-react";
import { exportRows } from "../../lib/exportUtils.js";
import { useToast } from "../../context/ToastContext.jsx";

/**
 * Shared export control for Properties/Rooms/Rate Plans list pages.
 * `rows` should already reflect the caller's selected-or-filtered set.
 */
export function ExportMenu({ rows, columns, filenameBase, selectedCount }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const toast = useToast();

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
    <div className="export-menu" ref={ref}>
      <button
        type="button"
        className="btn btn--ghost btn--md"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Download size={16} strokeWidth={2} />
        <span>Export{selectedCount ? ` (${selectedCount})` : ""}</span>
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
          <button role="menuitem" className="export-menu__item export-menu__item--disabled" onClick={() => handle("pdf")}>
            <FileText size={15} strokeWidth={2} /> PDF <span className="export-menu__soon">Coming soon</span>
          </button>
        </div>
      )}
    </div>
  );
}
