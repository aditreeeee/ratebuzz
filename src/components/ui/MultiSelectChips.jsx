import React, { useState, useRef, useEffect } from "react";
import { Search, X, ChevronDown, Check, Clock } from "lucide-react";

export function MultiSelectChips({ options = [], value = [], onChange, placeholder = "Search..." }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const [recent, setRecent] = useState([]);
  const ref = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setHighlighted(0);
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [open]);

  const toggle = (opt) => {
    onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);
    setRecent((r) => [opt, ...r.filter((o) => o !== opt)].slice(0, 5));
  };

  const remove = (opt) => (e) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== opt));
  };

  const filtered = options.filter((o) => o.toLowerCase().includes(query.toLowerCase()));
  const showRecent = !query && recent.filter((o) => options.includes(o)).length > 0;
  const recentList = recent.filter((o) => options.includes(o));

  const selectAll = () => onChange([...new Set([...value, ...filtered])]);
  const clearAll = () => onChange(value.filter((v) => !filtered.includes(v)));

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((i) => (filtered.length ? (i + 1) % filtered.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((i) => (filtered.length ? (i - 1 + filtered.length) % filtered.length : 0));
    } else if (e.key === "Home") {
      e.preventDefault();
      setHighlighted(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setHighlighted(filtered.length - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[highlighted]) toggle(filtered[highlighted]);
    }
  };

  return (
    <div className="multiselect" ref={ref}>
      <button type="button" className="multiselect__trigger" onClick={() => setOpen((o) => !o)}>
        <div className="multiselect__chips">
          {value.length === 0 && <span className="multiselect__placeholder">{placeholder}</span>}
          {value.map((v) => (
            <span key={v} className="tag-chip multiselect__chip">
              {v}
              <X size={11} strokeWidth={2.5} onClick={remove(v)} />
            </span>
          ))}
        </div>
        <ChevronDown size={15} strokeWidth={2} className="multiselect__chevron" />
      </button>
      {open && (
        <div className="multiselect__popover">
          <div className="multiselect__search">
            <Search size={13} strokeWidth={2} />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setHighlighted(0); }}
              onKeyDown={handleKeyDown}
              placeholder="Filter options..."
            />
          </div>
          <div className="multiselect__toolbar">
            <button type="button" className="multiselect__toolbar-btn" onClick={selectAll}>Select All</button>
            <button type="button" className="multiselect__toolbar-btn" onClick={clearAll}>Clear All</button>
          </div>
          <div className="multiselect__options">
            {showRecent && (
              <>
                <div className="multiselect__group-label"><Clock size={11} strokeWidth={2} /> Recently Used</div>
                {recentList.map((opt) => (
                  <label key={`recent-${opt}`} className="multiselect__option">
                    <input type="checkbox" checked={value.includes(opt)} onChange={() => toggle(opt)} />
                    <span>{opt}</span>
                    {value.includes(opt) && <Check size={13} strokeWidth={2.5} className="multiselect__check" />}
                  </label>
                ))}
                <div className="multiselect__divider" />
              </>
            )}
            {filtered.length === 0 && <div className="multiselect__empty">No matches</div>}
            {filtered.map((opt, i) => (
              <label
                key={opt}
                className={`multiselect__option ${i === highlighted ? "multiselect__option--highlighted" : ""}`}
                onMouseEnter={() => setHighlighted(i)}
              >
                <input type="checkbox" checked={value.includes(opt)} onChange={() => toggle(opt)} />
                <span>{opt}</span>
                {value.includes(opt) && <Check size={13} strokeWidth={2.5} className="multiselect__check" />}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
