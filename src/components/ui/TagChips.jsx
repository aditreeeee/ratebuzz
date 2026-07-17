import React from "react";

export function TagChips({ tags = [], max = 3 }) {
  if (!tags.length) return <span className="table__cell-muted">—</span>;
  const shown = tags.slice(0, max);
  const rest = tags.length - shown.length;
  return (
    <div className="tag-chips">
      {shown.map((t) => (
        <span key={t} className="tag-chip">{t}</span>
      ))}
      {rest > 0 && <span className="tag-chip tag-chip--more">+{rest}</span>}
    </div>
  );
}

export function TagPicker({ options, value = [], onChange }) {
  const toggle = (tag) => {
    onChange(value.includes(tag) ? value.filter((t) => t !== tag) : [...value, tag]);
  };
  return (
    <div className="tag-picker">
      {options.map((tag) => (
        <button
          type="button"
          key={tag}
          className={`tag-picker__item ${value.includes(tag) ? "tag-picker__item--active" : ""}`}
          onClick={() => toggle(tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
