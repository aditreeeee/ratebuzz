import React from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { GlobalSearch } from "../GlobalSearch.jsx";

export function Topbar({ title, subtitle, hideSearch = false }) {
  const { user } = useAuth();
  const initials = (user?.username || "A").slice(0, 2).toUpperCase();
  return (
    <header className="topbar">
      <div>
        <h1 className="topbar__title display">{title}</h1>
        {subtitle && <p className="topbar__subtitle">{subtitle}</p>}
      </div>
      <div className="topbar__right">
        {!hideSearch && <GlobalSearch />}
        <div className="topbar__user">
          <div className="topbar__avatar">{initials}</div>
          <div className="topbar__user-info">
            <span className="topbar__user-name">{user?.username}</span>
            <span className="topbar__user-role">Portal Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
}
