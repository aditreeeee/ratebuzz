import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import { APP_SETTINGS_DEFAULTS, setAppSettingsSnapshot } from "../lib/appSettingsStore.js";

const STORAGE_KEY = "ratebuzz.settings.app";

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return APP_SETTINGS_DEFAULTS;
    const parsed = JSON.parse(raw);
    return {
      general: { ...APP_SETTINGS_DEFAULTS.general, ...parsed.general },
      notifications: { ...APP_SETTINGS_DEFAULTS.notifications, ...parsed.notifications },
      table: { ...APP_SETTINGS_DEFAULTS.table, ...parsed.table },
      comparisonRules: { ...APP_SETTINGS_DEFAULTS.comparisonRules, ...parsed.comparisonRules },
    };
  } catch {
    return APP_SETTINGS_DEFAULTS;
  }
}

const AppSettingsContext = createContext(null);

// Same shape as AppearanceContext: a single Context so settings that other,
// unrelated components need to react to live (not just read once at their
// own mount) — Org Name/Date Format/Currency/Time Zone, Notifications,
// Table Preferences — propagate instantly across the app the moment Save is
// clicked, not just after a refresh. Also mirrors every change into the
// plain appSettingsStore module for non-component consumers (format.js,
// competitorReadiness.js).
export function AppSettingsProvider({ children }) {
  const [state, setState] = useState(loadStored);

  useEffect(() => {
    setAppSettingsSnapshot(state);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo(
    () => ({
      ...state,
      setGeneral: (general) => setState((s) => ({ ...s, general: { ...s.general, ...general } })),
      setNotifications: (notifications) => setState((s) => ({ ...s, notifications: { ...s.notifications, ...notifications } })),
      setTable: (table) => setState((s) => ({ ...s, table: { ...s.table, ...table } })),
      setComparisonRules: (comparisonRules) => setState((s) => ({ ...s, comparisonRules: { ...s.comparisonRules, ...comparisonRules } })),
    }),
    [state]
  );

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
}

export function useAppSettings() {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) throw new Error("useAppSettings must be used within AppSettingsProvider");
  return ctx;
}
