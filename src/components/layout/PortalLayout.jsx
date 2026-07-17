import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar.jsx";

export function PortalLayout() {
  return (
    <div className="portal-shell">
      <Sidebar />
      <main className="portal-main">
        <Outlet />
      </main>
    </div>
  );
}
