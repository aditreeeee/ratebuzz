import React, { useState } from "react";
import { SlidersHorizontal, LayoutList, PlugZap, Palette } from "lucide-react";
import { Topbar } from "../../components/layout/Topbar.jsx";
import { Tabs } from "../../components/ui/Tabs.jsx";
import { Breadcrumbs } from "../../components/ui/Breadcrumbs.jsx";
import { INTEGRATION_DEFINITIONS } from "../../mocks/integrations.js";
import { IntegrationCard } from "./IntegrationCard.jsx";
import { GeneralSettings } from "./GeneralSettings.jsx";
import { DefaultsSettings } from "./DefaultsSettings.jsx";
import { AppearanceSettings } from "./AppearanceSettings.jsx";

const TABS = [
  { key: "general", label: "General", icon: SlidersHorizontal },
  { key: "defaults", label: "Defaults", icon: LayoutList },
  { key: "integrations", label: "Integrations", icon: PlugZap },
  { key: "appearance", label: "Appearance", icon: Palette },
];

export function SettingsPage() {
  const [active, setActive] = useState("general");

  return (
    <div>
      <Breadcrumbs items={[{ label: "Settings" }]} />
      <Topbar title="Settings" subtitle="Configure platform defaults and future integrations." />

      <div className="page-section">
        <Tabs tabs={TABS} active={active} onChange={setActive} />
      </div>

      {active === "general" && <GeneralSettings />}
      {active === "defaults" && <DefaultsSettings />}
      {active === "appearance" && <AppearanceSettings />}

      {active === "integrations" && (
        <div className="integrations-grid">
          {INTEGRATION_DEFINITIONS.map((def) => (
            <IntegrationCard key={def.key} definition={def} />
          ))}
        </div>
      )}
    </div>
  );
}
