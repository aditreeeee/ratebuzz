import React, { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Building2, BedDouble, Tag, X } from "lucide-react";
import { useData } from "../context/DataContext.jsx";

const MAX_PER_GROUP = 4;

export function GlobalSearch() {
  const data = useData();
  const navigate = useNavigate();
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

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { properties: [], rooms: [], ratePlans: [] };

    const properties = data.properties
      .filter((p) => [p.id, p.name, p.city, p.brand, p.country].some((f) => String(f).toLowerCase().includes(q)))
      .slice(0, MAX_PER_GROUP);

    const rooms = data.rooms
      .filter((r) => [r.id, r.name].some((f) => String(f).toLowerCase().includes(q)))
      .slice(0, MAX_PER_GROUP);

    const ratePlans = data.ratePlans
      .filter((rp) => [rp.id, rp.name].some((f) => String(f).toLowerCase().includes(q)))
      .slice(0, MAX_PER_GROUP);

    return { properties, rooms, ratePlans };
  }, [query, data.properties, data.rooms, data.ratePlans]);

  const hasResults = results.properties.length || results.rooms.length || results.ratePlans.length;

  const goTo = (path) => {
    navigate(path);
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="global-search" ref={wrapRef}>
      <div className="global-search__field">
        <Search size={16} strokeWidth={2} className="global-search__icon" />
        <input
          className="global-search__input"
          placeholder="Search properties, rooms, rate plans..."
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
        />
        {query && (
          <button className="global-search__clear" onClick={() => setQuery("")} aria-label="Clear search">
            <X size={14} strokeWidth={2} />
          </button>
        )}
      </div>

      {open && query.trim() && (
        <div className="global-search__panel">
          {!hasResults && <div className="global-search__empty">No matches for "{query}".</div>}

          {results.properties.length > 0 && (
            <div className="global-search__group">
              <div className="global-search__group-label"><Building2 size={12} strokeWidth={2} /> Properties</div>
              {results.properties.map((p) => (
                <button key={p.id} className="global-search__item" onClick={() => goTo("/portal/properties")}>
                  <span className="global-search__item-name">{p.name}</span>
                  <span className="global-search__item-meta tabular">{p.id} &middot; {p.city}</span>
                </button>
              ))}
            </div>
          )}

          {results.rooms.length > 0 && (
            <div className="global-search__group">
              <div className="global-search__group-label"><BedDouble size={12} strokeWidth={2} /> Rooms</div>
              {results.rooms.map((r) => (
                <button key={r.id} className="global-search__item" onClick={() => goTo("/portal/rooms")}>
                  <span className="global-search__item-name">{r.name}</span>
                  <span className="global-search__item-meta tabular">{r.id}</span>
                </button>
              ))}
            </div>
          )}

          {results.ratePlans.length > 0 && (
            <div className="global-search__group">
              <div className="global-search__group-label"><Tag size={12} strokeWidth={2} /> Rate Plans</div>
              {results.ratePlans.map((rp) => (
                <button key={rp.id} className="global-search__item" onClick={() => goTo("/portal/rate-plans")}>
                  <span className="global-search__item-name">{rp.name}</span>
                  <span className="global-search__item-meta tabular">{rp.id}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
