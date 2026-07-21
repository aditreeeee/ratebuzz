import React, { useMemo, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { Checkbox } from "./Checkbox.jsx";

// Controlled accordion "card" for filter panels — each section is its own
// floating surface rather than a row in a long form. Open state is owned by
// the caller so panels can persist which sections are expanded across reloads.
// Deliberately icon- and badge-free per the panel's nav-like visual language;
// the only state indicator is the chevron and the left accent bar on open.
export function FilterAccordionSection({ title, open, onToggle, children }) {
  return (
    <div className={`filter-card ${open ? "filter-card--open" : ""}`}>
      <button type="button" className="filter-card__header" onClick={onToggle} aria-expanded={open}>
        <span className="filter-card__title">{title}</span>
        <ChevronDown size={15} strokeWidth={2} className="filter-card__chevron" />
      </button>
      <div className="filter-card__panel">
        <div className="filter-card__body">{children}</div>
      </div>
    </div>
  );
}

// Multi-select checkbox list. `showSearch` is explicit per section rather than
// inferred from list length — only Properties and Room Type want it; short
// fixed lists (Occupancy, Meal Plan) stay search-free by design.
export function CheckboxListFilter({ options, selected, onChange, showSearch = false, searchPlaceholder = "Search..." }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => String(o).toLowerCase().includes(q));
  }, [query, options]);

  const toggle = (value) => {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  };

  return (
    <div className="filter-checklist">
      {showSearch && (
        <div className="filter-checklist__search">
          <Search size={13} strokeWidth={2} className="filter-checklist__search-icon" />
          <input
            className="filter-checklist__search-input"
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button type="button" className="filter-checklist__search-clear" onClick={() => setQuery("")} aria-label="Clear search">
              <X size={12} strokeWidth={2} />
            </button>
          )}
        </div>
      )}
      <div className="filter-checklist__options">
        {filtered.length === 0 && <div className="property-panel__empty">No matches.</div>}
        {filtered.map((opt) => {
          const checked = selected.includes(opt);
          return (
            <div key={opt} className={`filter-checklist__item ${checked ? "filter-checklist__item--checked" : ""}`} onClick={() => toggle(opt)}>
              <Checkbox checked={checked} onChange={() => toggle(opt)} label={opt} />
              <span className="filter-checklist__item-label">{opt}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Active-filter chips, shown in the compact "Active Filters" strip at the top of the panel.
export function FilterChips({ chips }) {
  if (chips.length === 0) return null;
  return (
    <div className="filter-chips">
      {chips.map((chip) => (
        <span key={chip.key} className="filter-chips__chip">
          {chip.label}
          <button type="button" onClick={chip.onRemove} aria-label={`Remove ${chip.label} filter`}>
            <X size={10} strokeWidth={2.5} />
          </button>
        </span>
      ))}
    </div>
  );
}

// Shared shell for both filter panels: a compact header row (label + Reset),
// an "Active Filters" chip strip when anything is active, and the stack of
// filter cards — the nav-panel scaffold both pages hang their section cards
// off of, so it only needs to be built (and kept in sync) once.
export function FilterPanelFrame({ chips, onResetAll, children }) {
  return (
    <div className="filter-panel">
      <div className="filter-panel__label-row">
        <span className="filter-panel__label">Filters</span>
        {chips.length > 0 && (
          <button type="button" className="filter-panel__reset" onClick={onResetAll}>
            Reset
          </button>
        )}
      </div>

      {chips.length > 0 && (
        <div className="filter-panel__selected">
          <FilterChips chips={chips} />
        </div>
      )}

      <div className="filter-stack">{children}</div>
    </div>
  );
}
