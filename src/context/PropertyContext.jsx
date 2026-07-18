import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import { useData } from "./DataContext.jsx";

// Global property scope: lets the user pick one or more properties from the
// Topbar and have that selection persist across Rooms / Rate Plans (and any
// future property-scoped page) without re-picking per page. Source of truth
// for *which properties are selectable* is always DataContext's scopedProperties
// (`data.properties`), so RBAC scoping is never bypassed here.
const PropertyContext = createContext(null);

export function PropertyContextProvider({ children }) {
  const data = useData();
  const [selectedPropertyIds, setSelectedPropertyIds] = useState([]);

  // Keep selection valid if the underlying scoped properties change (e.g. role
  // switch in the demo account switcher, or a property gets deleted).
  useEffect(() => {
    const validIds = new Set(data.properties.map((p) => p.id));
    setSelectedPropertyIds((ids) => ids.filter((id) => validIds.has(id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.properties]);

  const value = useMemo(
    () => ({ selectedPropertyIds, setSelectedPropertyIds }),
    [selectedPropertyIds]
  );

  return <PropertyContext.Provider value={value}>{children}</PropertyContext.Provider>;
}

export function usePropertyContext() {
  const ctx = useContext(PropertyContext);
  if (!ctx) throw new Error("usePropertyContext must be used within PropertyContextProvider");
  return ctx;
}
