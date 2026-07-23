import React, { useState } from "react";
import { Save, Settings2, RotateCcw } from "lucide-react";
import { Card } from "../../components/ui/Card.jsx";
import { Field } from "../../components/ui/Input.jsx";
import { FeatureChipGrid } from "../../components/ui/FeatureChipGrid.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { ConfirmModal } from "../../components/ui/Modal.jsx";
import { MasterDataManager } from "../../components/ui/MasterDataManager.jsx";
import { useData } from "../../context/DataContext.jsx";
import { PRIORITY_LEVELS } from "../../mocks/competitors.js";
import { usePersistedState } from "../../hooks/usePersistedState.js";
import { useSettingsForm } from "../../hooks/useSettingsForm.js";
import { SOURCE_SETTINGS_DEFAULTS } from "../../lib/competitorSettingsDefaults.js";

// Source Types themselves are edited through the shared MasterDataManager
// (kind="sourceTypes") — the same generic add/rename/delete UI Room Types
// and Amenities use. Default Priority prefills SourceConfigForm's new-source
// baseline; Require HTTPS is enforced there as real, stricter URL
// validation; Flag Duplicate URLs drives real duplicate-URL flagging on the
// Sources tab.
export function CompetitorSourceSettings({ onDirtyChange }) {
  const data = useData();
  const sourceTypes = data.masters.sourceTypes || [];
  const [manageOpen, setManageOpen] = useState(false);
  const [saved, setSaved] = usePersistedState("settings.competitors.sources", SOURCE_SETTINGS_DEFAULTS);
  const { draft, setField, isDirty, save, reset, confirmOpen, requestAction, confirmDiscard, cancelDiscard } = useSettingsForm(
    saved, setSaved, SOURCE_SETTINGS_DEFAULTS, { onDirtyChange }
  );

  const handleSave = (e) => {
    e.preventDefault();
    save();
  };

  return (
    <>
    <Card>
      <p className="settings-section__desc">Manage the list of collection source types and defaults for new sources.</p>
      <form onSubmit={handleSave} className="form-grid" style={{ marginTop: "var(--space-5)" }}>
        <div className="form-grid__full">
          <Field label="Source Types" id="ss-types" hint={`${sourceTypes.length} configured — Direct Website, Booking.com, Expedia, Agoda, Hotels.com, Google Hotels by default.`}>
            <Button type="button" variant="secondary" size="sm" icon={Settings2} onClick={() => setManageOpen(true)}>Manage Source Types</Button>
          </Field>
        </div>
        <div className="form-grid__full">
          <FeatureChipGrid label="Default Priority" options={PRIORITY_LEVELS} value={draft.defaultPriority} onChange={setField("defaultPriority")} multiple={false} />
        </div>

        <div className="form-grid__full" style={{ marginTop: "var(--space-2)" }}>
          <div className="config-summary__section-title"><span className="config-summary__section-title-text">URL Validation</span></div>
        </div>
        <div className="form-grid__full">
          <FeatureChipGrid
            label="Require HTTPS"
            options={["No", "Yes"]}
            value={draft.requireHttps ? "Yes" : "No"}
            onChange={(v) => setField("requireHttps")(v === "Yes")}
            multiple={false}
            hint="Any source URL that doesn't start with https:// is rejected as invalid."
          />
        </div>
        <div className="form-grid__full">
          <FeatureChipGrid
            label="Flag Duplicate URLs"
            options={["No", "Yes"]}
            value={draft.flagDuplicates ? "Yes" : "No"}
            onChange={(v) => setField("flagDuplicates")(v === "Yes")}
            multiple={false}
            hint="Sources sharing the same URL within a competitor are flagged on the Sources tab."
          />
        </div>

        <div className="form-grid__full" style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          {isDirty && (
            <button className="btn btn--ghost btn--md" type="button" onClick={reset}>
              <RotateCcw size={15} strokeWidth={2} /> Reset Changes
            </button>
          )}
          <Button variant="primary" size="md" icon={Save} type="submit" disabled={!isDirty}>Save Changes</Button>
        </div>
      </form>
    </Card>
    <MasterDataManager open={manageOpen} onClose={() => setManageOpen(false)} kind="sourceTypes" label="Source Types" />
    <ConfirmModal
      open={confirmOpen}
      onClose={cancelDiscard}
      onConfirm={confirmDiscard}
      title="Unsaved Changes"
      message="You have unsaved changes. Discard them and continue?"
      confirmLabel="Discard Changes"
      danger
    />
    </>
  );
}
