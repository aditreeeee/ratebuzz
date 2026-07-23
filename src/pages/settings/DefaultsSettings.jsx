import React, { useState, useCallback } from "react";
import { Building2, BedDouble, Tag, Filter, Bell, Table2 } from "lucide-react";
import { Tabs } from "../../components/ui/Tabs.jsx";
import { ConfirmModal } from "../../components/ui/Modal.jsx";
import { PropertiesSettings } from "./PropertiesSettings.jsx";
import { RoomsSettings } from "./RoomsSettings.jsx";
import { RatePlansSettings } from "./RatePlansSettings.jsx";
import { DefaultFiltersSettings } from "./DefaultFiltersSettings.jsx";
import { NotificationsSettings } from "./NotificationsSettings.jsx";
import { TablePreferencesSettings } from "./TablePreferencesSettings.jsx";
import { usePersistedState } from "../../hooks/usePersistedState.js";
import { useUnsavedChanges } from "../../hooks/useUnsavedChanges.js";

const SUB_TABS = [
  { key: "properties", label: "Properties", icon: Building2 },
  { key: "rooms", label: "Rooms", icon: BedDouble },
  { key: "ratePlans", label: "Rate Plans", icon: Tag },
  { key: "defaultFilters", label: "Default Filters", icon: Filter },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "tablePreferences", label: "Table Preferences", icon: Table2 },
];

// Defaults — every "what should this start as / how should this behave by
// default" setting lives under this one tab: per-module creation defaults
// (Properties/Rooms/Rate Plans) alongside the app-wide defaults that used to
// be scattered as their own top-level tabs (Default Filters, Notifications,
// Table Preferences). Grouping them here reads as one coherent "defaults"
// section instead of six same-weight top-level tabs.
export function DefaultsSettings({ onDirtyChange }) {
  const [active, setActive] = usePersistedState("settings.defaults.activeSubTab", "properties");
  const [dirtyMap, setDirtyMap] = useState({});
  const anyDirty = Object.values(dirtyMap).some(Boolean);
  const { confirmOpen, requestAction, confirmDiscard, cancelDiscard } = useUnsavedChanges(anyDirty);

  const makeHandler = useCallback(
    (key) => (dirty) => {
      setDirtyMap((prev) => {
        const next = { ...prev, [key]: dirty };
        onDirtyChange?.(Object.values(next).some(Boolean));
        return next;
      });
    },
    [onDirtyChange]
  );

  const changeSubTab = (key) => requestAction(() => setActive(key));

  return (
    <div>
      <div className="page-section">
        <Tabs tabs={SUB_TABS} active={active} onChange={changeSubTab} />
      </div>
      {active === "properties" && <PropertiesSettings showTitle={false} onDirtyChange={makeHandler("properties")} />}
      {active === "rooms" && <RoomsSettings showTitle={false} onDirtyChange={makeHandler("rooms")} />}
      {active === "ratePlans" && <RatePlansSettings showTitle={false} onDirtyChange={makeHandler("ratePlans")} />}
      {active === "defaultFilters" && <DefaultFiltersSettings onDirtyChange={makeHandler("defaultFilters")} />}
      {active === "notifications" && <NotificationsSettings onDirtyChange={makeHandler("notifications")} />}
      {active === "tablePreferences" && <TablePreferencesSettings onDirtyChange={makeHandler("tablePreferences")} />}

      <ConfirmModal
        open={confirmOpen}
        onClose={cancelDiscard}
        onConfirm={confirmDiscard}
        title="Unsaved Changes"
        message="You have unsaved changes on this tab. Discard them and continue?"
        confirmLabel="Discard Changes"
        danger
      />
    </div>
  );
}
