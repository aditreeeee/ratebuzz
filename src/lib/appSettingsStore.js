// Plain (non-React) mirror of AppSettingsContext's live state, for the
// handful of plain utility functions (formatDate/formatCurrency in
// format.js, computeCompetitorReadiness in competitorReadiness.js) that are
// called from many files as ordinary imports rather than hooks — converting
// them to hooks would mean touching every call site. AppSettingsContext
// writes into this module on every state change (same effect that persists
// to localStorage), so these reads are always current without needing a
// React re-render to propagate. Seeded from localStorage directly so it's
// correct even before AppSettingsContext's provider has mounted/run its
// first effect.
const STORAGE_KEY = "ratebuzz.settings.app";

export const APP_SETTINGS_DEFAULTS = {
  general: { orgName: "eGlobe Solutions", dateFormat: "DD MMM YYYY", currency: "USD", timeZone: "UTC" },
  notifications: { enabled: true, duration: "Normal", position: "bottom-right" },
  table: { pageSize: 10, showIdColumn: true },
  comparisonRules: { minCompetitors: 3 },
};

function loadInitial() {
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

let snapshot = loadInitial();

export function getAppSettings() {
  return snapshot;
}

export function setAppSettingsSnapshot(next) {
  snapshot = next;
}

export const NOTIFICATION_DURATIONS = { Short: 2200, Normal: 3800, Long: 6000 };

// Default Filters settings' shape — kept here (a plain, dependency-light
// module) rather than in DefaultFiltersSettings.jsx itself, so list pages
// that only need this constant don't transitively import that whole
// settings-page component tree.
export const DEFAULT_FILTERS_DEFAULTS = { roomsView: "active", ratePlansView: "active", competitorsStatus: "All" };
