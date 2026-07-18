import React, { useState, useMemo, useRef, useEffect } from "react";
import { Building2, ChevronDown, X } from "lucide-react";
import { useData } from "../../context/DataContext.jsx";
import { usePropertyContext } from "../../context/PropertyContext.jsx";

// Global, searchable multi-select for scoping the app to one or more
// properties. Lives once in the Topbar so the selection persists across
// Rooms / Rate Plans navigation instead of being re-picked per page.
export function PropertySelector() {
  const data = useData();
  const { selectedPropertyIds, setSelectedPropertyIds } = usePropertyContext();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data.properties;
    return data.properties.filter((p) => [p.id, p.name, p.city].some((f) => String(f || "").toLowerCase().includes(q)));
  }, [query, data.properties]);

  const selectedProperties = useMemo(
    () => data.properties.filter((p) => selectedPropertyIds.includes(p.id)),
    [data.properties, selectedPropertyIds]
  );

  const toggle = (id) => {
    setSelectedPropertyIds(
      selectedPropertyIds.includes(id)
        ? selectedPropertyIds.filter((pid) => pid !== id)
        : [...selectedPropertyIds, id]
    );
  };

  const remove = (id) => setSelectedPropertyIds(selectedPropertyIds.filter((pid) => pid !== id));
  const clearAll = () => setSelectedPropertyIds([]);

  return (
    <div className="property-selector" ref={wrapRef}>
      <button
        type="button"
        className="property-selector__trigger"
        onClick={() => setOpen((o) => !o)}
        aria-label="Select properties"
      >
        <Building2 size={15} strokeWidth={2} />
        <span>
          {selectedPropertyIds.length === 0
            ? "Select Properties"
            : selectedPropertyIds.length === 1
            ? selectedProperties[0]?.name
            : `${selectedPropertyIds.length} Properties Selected`}
        </span>
        <ChevronDown size={14} strokeWidth={2} />
      </button>

      {selectedProperties.length > 0 && (
        <div className="property-selector__chips">
          {selectedProperties.map((p) => (
            <span key={p.id} className="tag-chip property-selector__chip">
              {p.name}
              <button type="button" onClick={() => remove(p.id)} aria-label={`Remove ${p.name}`}>
                <X size={11} strokeWidth={2.5} />
              </button>
            </span>
          ))}
        </div>
      )}

      {open && (
        <div className="property-selector__panel global-search__panel">
          <div className="property-selector__search">
            <input
              className="property-selector__search-input"
              placeholder="Search properties..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
          <div className="property-selector__list">
            {filtered.length === 0 && <div className="global-search__empty">No matches for "{query}".</div>}
            {filtered.map((p) => (
              <button
                type="button"
                key={p.id}
                className="property-selector__item"
                onClick={() => toggle(p.id)}
              >
                <span className={`property-selector__checkbox ${selectedPropertyIds.includes(p.id) ? "property-selector__checkbox--checked" : ""}`} />
                <span className="global-search__item-name">{p.name}</span>
                <span className="global-search__item-meta tabular">{p.id}</span>
              </button>
            ))}
          </div>
          {selectedPropertyIds.length > 0 && (
            <div className="property-selector__footer">
              <button type="button" className="btn btn--ghost btn--sm" onClick={clearAll}>Clear all</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
