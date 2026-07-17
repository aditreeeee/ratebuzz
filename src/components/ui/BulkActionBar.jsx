import React from "react";
import { Archive, Copy, Trash2, X, RefreshCcw } from "lucide-react";
import { Select } from "./Input.jsx";

export function BulkActionBar({ count, onClear, onArchive, onDuplicate, onDelete, statusOptions, onChangeStatus }) {
  if (!count) return null;
  return (
    <div className="bulk-bar" role="toolbar" aria-label="Bulk actions">
      <div className="bulk-bar__count">
        <span className="tabular">{count}</span> selected
      </div>
      <div className="bulk-bar__divider" />
      <div className="bulk-bar__actions">
        {statusOptions && (
          <div className="bulk-bar__select">
            <RefreshCcw size={14} strokeWidth={2} />
            <Select
              options={statusOptions}
              placeholder="Change Status"
              onChange={(e) => e.target.value && onChangeStatus(e.target.value)}
              value=""
            />
          </div>
        )}
        <button className="bulk-bar__btn" onClick={onDuplicate}>
          <Copy size={14} strokeWidth={2} /> Duplicate
        </button>
        <button className="bulk-bar__btn" onClick={onArchive}>
          <Archive size={14} strokeWidth={2} /> Archive
        </button>
        <button className="bulk-bar__btn bulk-bar__btn--danger" onClick={onDelete}>
          <Trash2 size={14} strokeWidth={2} /> Delete
        </button>
      </div>
      <button className="bulk-bar__clear" onClick={onClear} aria-label="Clear selection">
        <X size={16} strokeWidth={2} />
      </button>
    </div>
  );
}
