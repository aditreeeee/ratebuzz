import React, { useState, useMemo, useEffect, useCallback } from "react";
import { SlidersHorizontal, LayoutList, PlugZap, Palette, Target } from "lucide-react";
import { Topbar } from "../../components/layout/Topbar.jsx";
import { Tabs } from "../../components/ui/Tabs.jsx";
import { Breadcrumbs } from "../../components/ui/Breadcrumbs.jsx";
import { ConfirmModal } from "../../components/ui/Modal.jsx";
import { INTEGRATION_DEFINITIONS } from "../../mocks/integrations.js";
import { IntegrationCard } from "./IntegrationCard.jsx";
import { GeneralSettings } from "./GeneralSettings.jsx";
import { DefaultsSettings } from "./DefaultsSettings.jsx";
import { AppearanceSettings } from "./AppearanceSettings.jsx";
import { CompetitorConfigSettings } from "./CompetitorConfigSettings.jsx";
import { usePermissions } from "../../hooks/usePermissions.js";
import { useUnsavedChanges } from "../../hooks/useUnsavedChanges.js";

// Full catalog of settings tabs. Which ones actually render is decided by
// permissions.canAccessSettingsSection(key) below — never by role checks
// scattered through this file. (Standalone "properties"/"rooms"/"ratePlans"
// tabs were removed here: they were never granted to any role in
// SETTINGS_SECTIONS_BY_ROLE, so they rendered nothing but a dead, permanently
// filtered-out entry — "Defaults" already mounts the same three forms and is
// the one actually reachable path. Default Filters/Notifications/Table
// Preferences similarly moved from top-level tabs into sub-tabs of
// "Defaults" — DefaultsSettings.jsx — for a cleaner, more logical hierarchy:
// six same-weight top-level tabs read as more, not less, complex than one
// "Defaults" section with everything default-related grouped inside it.)
const ALL_TABS = [
  { key: "general", label: "General", icon: SlidersHorizontal },
  { key: "defaults", label: "Defaults", icon: LayoutList },
  { key: "competitorConfig", label: "Configuration Settings", icon: Target },
  { key: "integrations", label: "Integrations", icon: PlugZap },
  { key: "appearance", label: "Appearance", icon: Palette },
];

export function SettingsPage() {
  const permissions = usePermissions();
  const tabs = useMemo(
    () => ALL_TABS.filter((t) => permissions.canAccessSettingsSection(t.key)),
    [permissions]
  );
  const [active, setActive] = useState(tabs[0]?.key || "general");

  useEffect(() => {
    if (!tabs.some((t) => t.key === active)) setActive(tabs[0]?.key || "general");
  }, [tabs, active]);

  // Every settings sub-page reports its own dirty state here via
  // `onDirtyChange` (threaded through their shared useSettingsForm call), so
  // switching tabs while the active one has unsaved edits prompts the same
  // discard-confirmation every other dirty-state guard in the app uses,
  // instead of silently losing them.
  const [activeTabDirty, setActiveTabDirty] = useState(false);
  const { confirmOpen, requestAction, confirmDiscard, cancelDiscard } = useUnsavedChanges(activeTabDirty);
  const handleDirtyChange = useCallback((dirty) => setActiveTabDirty(dirty), []);
  const changeTab = (key) => requestAction(() => { setActiveTabDirty(false); setActive(key); });

  return (
    <div>
      <Breadcrumbs items={[{ label: "Settings" }]} />
      <Topbar title="Settings" subtitle="Configure platform defaults and future integrations." hidePropertySelector />

      <div className="page-section">
        <Tabs tabs={tabs} active={active} onChange={changeTab} />
      </div>

      {active === "general" && <GeneralSettings onDirtyChange={handleDirtyChange} />}
      {active === "defaults" && <DefaultsSettings onDirtyChange={handleDirtyChange} />}
      {active === "competitorConfig" && <CompetitorConfigSettings onDirtyChange={handleDirtyChange} />}
      {active === "appearance" && <AppearanceSettings />}

      {active === "integrations" && permissions.canManageIntegrations && (
        <div className="integrations-grid">
          {INTEGRATION_DEFINITIONS.map((def) => (
            <IntegrationCard key={def.key} definition={def} />
          ))}
        </div>
      )}

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
