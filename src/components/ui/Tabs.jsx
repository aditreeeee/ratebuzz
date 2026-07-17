import React from "react";

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.key}
          role="tab"
          aria-selected={active === t.key}
          className={`tabs__tab ${active === t.key ? "tabs__tab--active" : ""}`}
          onClick={() => onChange(t.key)}
        >
          {t.icon && <t.icon size={15} strokeWidth={2} />}
          {t.label}
        </button>
      ))}
    </div>
  );
}
