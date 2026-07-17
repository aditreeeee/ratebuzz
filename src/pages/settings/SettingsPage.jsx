import React from "react";
import { Topbar } from "../../components/layout/Topbar.jsx";
import { INTEGRATION_DEFINITIONS } from "../../mocks/integrations.js";
import { IntegrationCard } from "./IntegrationCard.jsx";

export function SettingsPage() {
  return (
    <div>
      <Topbar title="Settings" subtitle="Configure future integrations. Nothing here connects to a live system yet." />
      <div className="integrations-grid">
        {INTEGRATION_DEFINITIONS.map((def) => (
          <IntegrationCard key={def.key} definition={def} />
        ))}
      </div>
    </div>
  );
}
