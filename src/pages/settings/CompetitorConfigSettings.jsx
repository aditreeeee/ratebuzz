import React, { useState, useCallback } from "react";
import { SlidersHorizontal, ListChecks, BedDouble, Tag, PlugZap, Upload } from "lucide-react";
import { Tabs } from "../../components/ui/Tabs.jsx";
import { ConfirmModal } from "../../components/ui/Modal.jsx";
import { CompetitorGeneralSettings } from "../competitors/CompetitorGeneralSettings.jsx";
import { ComparisonRulesSettings } from "../competitors/ComparisonRulesSettings.jsx";
import { CompetitorRoomMappingSettings } from "../competitors/CompetitorRoomMappingSettings.jsx";
import { CompetitorRatePlanMappingSettings } from "../competitors/CompetitorRatePlanMappingSettings.jsx";
import { CompetitorSourceSettings } from "../competitors/CompetitorSourceSettings.jsx";
import { CompetitorImportExportSettings } from "../competitors/CompetitorImportExportSettings.jsx";
import { usePersistedState } from "../../hooks/usePersistedState.js";
import { useUnsavedChanges } from "../../hooks/useUnsavedChanges.js";

const SUB_TABS = [
  { key: "general", label: "General", icon: SlidersHorizontal },
  { key: "comparisonRules", label: "Comparison Rules", icon: ListChecks },
  { key: "roomMapping", label: "Room Mapping", icon: BedDouble },
  { key: "ratePlanMapping", label: "Rate Plan Mapping", icon: Tag },
  { key: "sources", label: "Sources & URL Validation", icon: PlugZap },
  { key: "importExport", label: "Import & Export", icon: Upload },
];

// Configuration Settings — a dedicated top-level category inside the main
// Settings module (not a separate Phase 2 page/route) holding only
// competitor-configuration preferences: Comparison Rules, Room/Rate Plan
// Mapping defaults, Source Configuration + URL validation, and Import/Export
// preferences. Deliberately excludes Appearance — density/accent are
// app-wide and already live in Settings' own Appearance tab.
export function CompetitorConfigSettings({ onDirtyChange }) {
  const [active, setActive] = usePersistedState("settings.competitorConfig.activeSubTab", "general");
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
      {active === "general" && <CompetitorGeneralSettings onDirtyChange={makeHandler("general")} />}
      {active === "comparisonRules" && <ComparisonRulesSettings onDirtyChange={makeHandler("comparisonRules")} />}
      {active === "roomMapping" && <CompetitorRoomMappingSettings onDirtyChange={makeHandler("roomMapping")} />}
      {active === "ratePlanMapping" && <CompetitorRatePlanMappingSettings onDirtyChange={makeHandler("ratePlanMapping")} />}
      {active === "sources" && <CompetitorSourceSettings onDirtyChange={makeHandler("sources")} />}
      {active === "importExport" && <CompetitorImportExportSettings onDirtyChange={makeHandler("importExport")} />}

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
